/**
 * WebSocket服务管理类
 * 用于实时销售指标Dashboard的数据推送
 */

class WebSocketService {
  constructor() {
    this.ws = null
    this.url = null
    this.options = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000
    }
    this.reconnectAttempts = 0
    this.listeners = new Map()
    this.heartbeatTimer = null
    this.isConnecting = false
    this.shouldReconnect = true
  }

  /**
   * 连接WebSocket
   * @param {string} url WebSocket服务器地址
   * @param {Object} options 连接选项
   */
  connect(url, options = {}) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return Promise.resolve()
    }

    this.url = url
    this.options = { ...this.options, ...options }
    this.isConnecting = true

    return new Promise((resolve, reject) => {
      try {
        // 在开发环境下，如果没有真实的WebSocket服务器，使用模拟连接
        if (process.env.NODE_ENV === 'development' && !url.startsWith('ws://') && !url.startsWith('wss://')) {
          this.mockWebSocketConnection()
          resolve()
          return
        }

        this.ws = new WebSocket(url)
        
        this.ws.onopen = (event) => {
          console.log('WebSocket连接已建立')
          this.isConnecting = false
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.emit('connected', event)
          resolve(event)
        }
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.handleMessage(data)
          } catch (error) {
            console.error('解析WebSocket消息失败:', error)
          }
        }
        
        this.ws.onclose = (event) => {
          console.log('WebSocket连接已关闭', event.code, event.reason)
          this.isConnecting = false
          this.stopHeartbeat()
          this.emit('disconnected', event)
          
          // 自动重连
          if (this.shouldReconnect && this.reconnectAttempts < this.options.maxReconnectAttempts) {
            setTimeout(() => {
              this.reconnectAttempts++
              console.log(`尝试重连 (${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`)
              this.connect(this.url, this.options)
            }, this.options.reconnectInterval)
          }
        }
        
        this.ws.onerror = (error) => {
          console.error('WebSocket连接错误:', error)
          this.isConnecting = false
          this.emit('error', error)
          reject(error)
        }
        
      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  /**
   * 模拟WebSocket连接（开发环境使用）
   */
  mockWebSocketConnection() {
    console.log('启动模拟WebSocket连接')
    this.isConnecting = false
    
    // 模拟连接成功
    setTimeout(() => {
      this.emit('connected', { type: 'mock' })
      this.startMockDataPush()
    }, 1000)
  }

  /**
   * 开始模拟数据推送
   */
  startMockDataPush() {
    // 模拟实时数据推送
    setInterval(() => {
      this.handleMessage({
        type: 'realtime_update',
        payload: {
          currentSales: Math.floor(Math.random() * 50000) + 20000,
          todayOrders: Math.floor(Math.random() * 200) + 100,
          onlineUsers: Math.floor(Math.random() * 500) + 200
        }
      })
    }, 5000)

    // 模拟KPI更新
    setInterval(() => {
      this.handleMessage({
        type: 'kpi_update',
        payload: {
          todaySales: {
            value: Math.floor(Math.random() * 100000) + 50000,
            percentage: (Math.random() - 0.5) * 20,
            trend: Math.random() > 0.5 ? 'up' : 'down'
          }
        }
      })
    }, 15000)

    // 模拟告警
    setInterval(() => {
      if (Math.random() < 0.3) { // 30% 概率生成告警
        this.handleMessage({
          type: 'alert',
          payload: {
            type: ['warning', 'error', 'info'][Math.floor(Math.random() * 3)],
            title: ['销售异常', '库存不足', '系统通知'][Math.floor(Math.random() * 3)],
            message: '这是一条模拟告警消息，用于测试告警功能',
            level: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]
          }
        })
      }
    }, 20000)
  }

  /**
   * 断开WebSocket连接
   */
  disconnect() {
    this.shouldReconnect = false
    this.stopHeartbeat()
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    this.emit('disconnected', { code: 1000, reason: 'Manual disconnect' })
  }

  /**
   * 发送消息
   * @param {Object} data 要发送的数据
   */
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
      return true
    } else {
      console.warn('WebSocket未连接，无法发送消息')
      return false
    }
  }

  /**
   * 订阅数据频道
   * @param {string} channel 频道名称
   */
  subscribe(channel) {
    this.send({
      type: 'subscribe',
      channel
    })
  }

  /**
   * 取消订阅
   * @param {string} channel 频道名称
   */
  unsubscribe(channel) {
    this.send({
      type: 'unsubscribe',
      channel
    })
  }

  /**
   * 开始心跳检测
   */
  startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' })
      }
    }, this.options.heartbeatInterval)
  }

  /**
   * 停止心跳检测
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * 处理接收到的消息
   * @param {Object} data 消息数据
   */
  handleMessage(data) {
    // 处理心跳响应
    if (data.type === 'pong') {
      return
    }

    // 触发对应事件
    this.emit('message', data)
    
    // 根据消息类型触发特定事件
    if (data.type) {
      this.emit(data.type, data.payload || data)
    }
  }

  /**
   * 添加事件监听器
   * @param {string} event 事件名称
   * @param {Function} callback 回调函数
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  /**
   * 移除事件监听器
   * @param {string} event 事件名称
   * @param {Function} callback 回调函数
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * 触发事件
   * @param {string} event 事件名称
   * @param {*} data 事件数据
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`事件回调执行失败 [${event}]:`, error)
        }
      })
    }
  }

  /**
   * 获取连接状态
   */
  get readyState() {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED
  }

  /**
   * 是否已连接
   */
  get isConnected() {
    return this.readyState === WebSocket.OPEN
  }

  /**
   * 清理所有监听器
   */
  cleanup() {
    this.listeners.clear()
    this.disconnect()
  }
}

// 创建全局WebSocket服务实例
const webSocketService = new WebSocketService()

// 与Vuex集成的辅助函数
export function setupWebSocketWithStore(store) {
  // 连接事件
  webSocketService.on('connected', () => {
    store.commit('salesDashboard/SET_CONNECTION_STATUS', 'connected')
  })

  // 断开事件
  webSocketService.on('disconnected', () => {
    store.commit('salesDashboard/SET_CONNECTION_STATUS', 'disconnected')
  })

  // 连接中事件
  webSocketService.on('connecting', () => {
    store.commit('salesDashboard/SET_CONNECTION_STATUS', 'connecting')
  })

  // 错误事件
  webSocketService.on('error', (error) => {
    store.commit('salesDashboard/SET_ERROR', error.message || '连接错误')
  })

  // 实时数据更新
  webSocketService.on('realtime_update', (data) => {
    store.commit('salesDashboard/UPDATE_REAL_TIME_DATA', data)
  })

  // KPI指标更新
  webSocketService.on('kpi_update', (data) => {
    store.commit('salesDashboard/UPDATE_KPI_METRICS', data)
  })

  // 告警消息
  webSocketService.on('alert', (data) => {
    store.commit('salesDashboard/ADD_ALERT', data)
  })

  // 通用消息处理
  webSocketService.on('message', (data) => {
    store.dispatch('salesDashboard/handleWebSocketMessage', JSON.stringify(data))
  })

  return webSocketService
}

export default webSocketService