import store from '@/store'

/**
 * WebSocket管理类
 * 负责WebSocket连接管理、消息处理、重连机制等
 */
class WebSocketManager {
  constructor() {
    this.ws = null
    this.url = ''
    this.reconnectCount = 0
    this.maxReconnectCount = 5
    this.reconnectInterval = 3000
    this.heartbeatInterval = 30000
    this.heartbeatTimer = null
    this.reconnectTimer = null
    this.isConnecting = false
    this.isManualClose = false
    
    // 消息处理器映射
    this.messageHandlers = new Map()
    this.setupMessageHandlers()
  }

  /**
   * 建立WebSocket连接
   * @param {string} url WebSocket地址
   * @param {string} token 认证token
   */
  connect(url, token) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
      return
    }

    this.url = `${url}?token=${token}`
    this.isConnecting = true
    this.isManualClose = false

    try {
      this.ws = new WebSocket(this.url)
      this.setupEventListeners()
    } catch (error) {
      console.error('WebSocket连接失败:', error)
      this.handleConnectionError()
    }
  }

  /**
   * 设置WebSocket事件监听器
   */
  setupEventListeners() {
    this.ws.onopen = (event) => {
      console.log('WebSocket连接已建立')
      this.isConnecting = false
      this.reconnectCount = 0
      this.startHeartbeat()
      
      // 更新连接状态到store
      store.commit('chat/SET_CONNECTION_STATUS', 'connected')
    }

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (error) {
        console.error('消息解析失败:', error, event.data)
      }
    }

    this.ws.onclose = (event) => {
      console.log('WebSocket连接已关闭', event.code, event.reason)
      this.isConnecting = false
      this.stopHeartbeat()
      
      // 更新连接状态到store
      store.commit('chat/SET_CONNECTION_STATUS', 'disconnected')

      // 如果不是手动关闭，尝试重连
      if (!this.isManualClose && this.reconnectCount < this.maxReconnectCount) {
        this.scheduleReconnect()
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket错误:', error)
      this.handleConnectionError()
    }
  }

  /**
   * 设置消息处理器
   */
  setupMessageHandlers() {
    // 聊天消息处理
    this.messageHandlers.set('chat.message', (data) => {
      store.dispatch('chat/receiveMessage', data)
    })

    // 新会话通知
    this.messageHandlers.set('session.new', (data) => {
      store.dispatch('chat/handleNewSession', data)
    })

    // 会话关闭通知
    this.messageHandlers.set('session.close', (data) => {
      store.dispatch('chat/handleSessionClose', data)
    })

    // 客服状态变更通知
    this.messageHandlers.set('service.status', (data) => {
      store.dispatch('customerService/updateServiceStatus', data)
    })

    // 系统通知
    this.messageHandlers.set('system.notification', (data) => {
      store.dispatch('chat/handleSystemNotification', data)
    })

    // 心跳响应
    this.messageHandlers.set('pong', () => {
      // 心跳响应，无需特殊处理
    })
  }

  /**
   * 处理接收到的消息
   */
  handleMessage(message) {
    const { type, data } = message
    
    if (this.messageHandlers.has(type)) {
      this.messageHandlers.get(type)(data)
    } else {
      console.warn('未知消息类型:', type, data)
    }
  }

  /**
   * 发送消息
   * @param {string} type 消息类型
   * @param {object} data 消息数据
   */
  send(type, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type,
        data,
        timestamp: Date.now()
      }
      this.ws.send(JSON.stringify(message))
      return true
    } else {
      console.error('WebSocket未连接，消息发送失败')
      return false
    }
  }

  /**
   * 发送聊天消息
   */
  sendChatMessage(sessionId, content, messageType = 'text') {
    return this.send('chat.message', {
      sessionId,
      content,
      messageType,
      timestamp: Date.now()
    })
  }

  /**
   * 更新客服状态
   */
  updateServiceStatus(status) {
    return this.send('service.status', {
      status,
      timestamp: Date.now()
    })
  }

  /**
   * 关闭会话
   */
  closeSession(sessionId, reason) {
    return this.send('session.close', {
      sessionId,
      reason,
      timestamp: Date.now()
    })
  }

  /**
   * 开始心跳
   */
  startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send('ping', { timestamp: Date.now() })
      }
    }, this.heartbeatInterval)
  }

  /**
   * 停止心跳
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * 安排重连
   */
  scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectCount++
      console.log(`尝试第${this.reconnectCount}次重连...`)
      
      // 更新连接状态
      store.commit('chat/SET_CONNECTION_STATUS', 'reconnecting')
      
      // 获取token并重连
      const token = store.getters.token
      if (token) {
        this.connect(this.url.split('?')[0], token)
      }
    }, this.reconnectInterval * this.reconnectCount)
  }

  /**
   * 处理连接错误
   */
  handleConnectionError() {
    this.isConnecting = false
    store.commit('chat/SET_CONNECTION_STATUS', 'error')
  }

  /**
   * 手动关闭连接
   */
  disconnect() {
    this.isManualClose = true
    this.stopHeartbeat()
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close(1000, '手动关闭')
      this.ws = null
    }

    store.commit('chat/SET_CONNECTION_STATUS', 'disconnected')
  }

  /**
   * 获取连接状态
   */
  getConnectionState() {
    if (!this.ws) return 'disconnected'
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting'
      case WebSocket.OPEN:
        return 'connected'
      case WebSocket.CLOSING:
        return 'closing'
      case WebSocket.CLOSED:
        return 'disconnected'
      default:
        return 'unknown'
    }
  }

  /**
   * 重置重连计数
   */
  resetReconnectCount() {
    this.reconnectCount = 0
  }

  /**
   * 添加自定义消息处理器
   */
  addMessageHandler(type, handler) {
    this.messageHandlers.set(type, handler)
  }

  /**
   * 移除消息处理器
   */
  removeMessageHandler(type) {
    this.messageHandlers.delete(type)
  }
}

// 创建单例实例
const webSocketManager = new WebSocketManager()

export default webSocketManager