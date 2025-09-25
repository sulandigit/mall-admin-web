import {
  getSessionList,
  getMessageHistory,
  sendMessage,
  closeSession,
  transferSession
} from '@/api/customerService'
import {
  formatChatMessage,
  formatSession,
  CONNECTION_STATUS,
  generateMessageId
} from '@/utils/websocket/helper'
import webSocketManager from '@/utils/websocket/manager'

/**
 * 聊天模块状态管理
 */
const chat = {
  namespaced: true,

  state: {
    // 当前活跃会话
    activeSession: null,
    // 会话列表
    sessions: [],
    // 消息缓存 { sessionId: messages[] }
    messageCache: {},
    // WebSocket连接状态
    connectionStatus: CONNECTION_STATUS.DISCONNECTED,
    // 未读消息计数
    totalUnreadCount: 0,
    // 系统通知列表
    notifications: [],
    // 消息发送状态 { messageId: status }
    messageSendStatus: {},
    // 会话加载状态
    sessionLoading: false,
    // 消息加载状态
    messageLoading: false
  },

  mutations: {
    // 设置活跃会话
    SET_ACTIVE_SESSION(state, session) {
      state.activeSession = session
      if (session) {
        // 清除该会话的未读计数
        state.sessions = state.sessions.map(s => {
          if (s.id === session.id) {
            return { ...s, unreadCount: 0 }
          }
          return s
        })
        this.commit('chat/UPDATE_TOTAL_UNREAD_COUNT')
      }
    },

    // 更新会话列表
    SET_SESSIONS(state, sessions) {
      state.sessions = sessions.map(formatSession)
    },

    // 添加会话
    ADD_SESSION(state, session) {
      const formattedSession = formatSession(session)
      const existingIndex = state.sessions.findIndex(s => s.id === session.id)
      
      if (existingIndex >= 0) {
        state.sessions.splice(existingIndex, 1, formattedSession)
      } else {
        state.sessions.unshift(formattedSession)
      }
    },

    // 移除会话
    REMOVE_SESSION(state, sessionId) {
      state.sessions = state.sessions.filter(s => s.id !== sessionId)
      // 清除消息缓存
      delete state.messageCache[sessionId]
      // 如果是当前活跃会话，清除活跃状态
      if (state.activeSession && state.activeSession.id === sessionId) {
        state.activeSession = null
      }
    },

    // 更新会话信息
    UPDATE_SESSION(state, sessionUpdate) {
      const sessionIndex = state.sessions.findIndex(s => s.id === sessionUpdate.id)
      if (sessionIndex >= 0) {
        state.sessions.splice(sessionIndex, 1, {
          ...state.sessions[sessionIndex],
          ...sessionUpdate
        })
      }
    },

    // 设置会话消息
    SET_SESSION_MESSAGES(state, { sessionId, messages }) {
      state.messageCache[sessionId] = messages.map(formatChatMessage)
    },

    // 添加消息
    ADD_MESSAGE(state, message) {
      const formattedMessage = formatChatMessage(message)
      const sessionId = formattedMessage.sessionId

      // 添加到消息缓存
      if (!state.messageCache[sessionId]) {
        state.messageCache[sessionId] = []
      }
      state.messageCache[sessionId].push(formattedMessage)

      // 更新会话的最后消息和时间
      const sessionIndex = state.sessions.findIndex(s => s.id === sessionId)
      if (sessionIndex >= 0) {
        const session = state.sessions[sessionIndex]
        const updatedSession = {
          ...session,
          lastMessage: formattedMessage,
          updatedAt: formattedMessage.timestamp
        }

        // 如果不是当前活跃会话且不是自己发送的消息，增加未读计数
        if ((!state.activeSession || state.activeSession.id !== sessionId) && 
            !formattedMessage.isOwn) {
          updatedSession.unreadCount = (session.unreadCount || 0) + 1
        }

        state.sessions.splice(sessionIndex, 1, updatedSession)
        
        // 将有新消息的会话移到顶部
        state.sessions.unshift(state.sessions.splice(sessionIndex, 1)[0])
      }

      this.commit('chat/UPDATE_TOTAL_UNREAD_COUNT')
    },

    // 更新消息状态
    UPDATE_MESSAGE_STATUS(state, { messageId, status }) {
      // 在所有会话的消息中查找并更新
      Object.keys(state.messageCache).forEach(sessionId => {
        const messages = state.messageCache[sessionId]
        const messageIndex = messages.findIndex(m => m.id === messageId)
        if (messageIndex >= 0) {
          messages[messageIndex].status = status
        }
      })
    },

    // 设置连接状态
    SET_CONNECTION_STATUS(state, status) {
      state.connectionStatus = status
    },

    // 添加系统通知
    ADD_NOTIFICATION(state, notification) {
      state.notifications.unshift({
        id: generateMessageId(),
        ...notification,
        timestamp: Date.now()
      })
      
      // 只保留最近50条通知
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50)
      }
    },

    // 清除通知
    CLEAR_NOTIFICATIONS(state) {
      state.notifications = []
    },

    // 更新总未读计数
    UPDATE_TOTAL_UNREAD_COUNT(state) {
      state.totalUnreadCount = state.sessions.reduce((total, session) => {
        return total + (session.unreadCount || 0)
      }, 0)
    },

    // 设置消息发送状态
    SET_MESSAGE_SEND_STATUS(state, { messageId, status }) {
      state.messageSendStatus[messageId] = status
    },

    // 设置会话加载状态
    SET_SESSION_LOADING(state, loading) {
      state.sessionLoading = loading
    },

    // 设置消息加载状态
    SET_MESSAGE_LOADING(state, loading) {
      state.messageLoading = loading
    }
  },

  actions: {
    // 初始化聊天模块
    async initChat({ commit, dispatch }, { token, wsUrl }) {
      try {
        // 建立WebSocket连接
        await dispatch('connectWebSocket', { token, wsUrl })
        
        // 加载会话列表
        await dispatch('loadSessions')
        
        return true
      } catch (error) {
        console.error('初始化聊天模块失败:', error)
        return false
      }
    },

    // 连接WebSocket
    connectWebSocket({ commit }, { token, wsUrl }) {
      return new Promise((resolve, reject) => {
        try {
          webSocketManager.connect(wsUrl, token)
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    },

    // 断开WebSocket连接
    disconnectWebSocket() {
      webSocketManager.disconnect()
    },

    // 加载会话列表
    async loadSessions({ commit }) {
      commit('SET_SESSION_LOADING', true)
      try {
        const response = await getSessionList({
          page: 1,
          size: 50,
          status: 'active'
        })
        
        if (response.data && response.data.list) {
          commit('SET_SESSIONS', response.data.list)
        }
      } catch (error) {
        console.error('加载会话列表失败:', error)
      } finally {
        commit('SET_SESSION_LOADING', false)
      }
    },

    // 切换活跃会话
    async switchSession({ commit, dispatch }, session) {
      commit('SET_ACTIVE_SESSION', session)
      
      if (session) {
        // 加载会话消息历史
        await dispatch('loadSessionMessages', session.id)
      }
    },

    // 加载会话消息
    async loadSessionMessages({ commit, state }, sessionId) {
      if (state.messageCache[sessionId]) {
        return // 已有缓存，不重复加载
      }

      commit('SET_MESSAGE_LOADING', true)
      try {
        const response = await getMessageHistory(sessionId, {
          page: 1,
          size: 50
        })
        
        if (response.data && response.data.list) {
          commit('SET_SESSION_MESSAGES', {
            sessionId,
            messages: response.data.list
          })
        }
      } catch (error) {
        console.error('加载消息历史失败:', error)
      } finally {
        commit('SET_MESSAGE_LOADING', false)
      }
    },

    // 发送消息
    async sendMessage({ commit, state }, { sessionId, content, messageType = 'text' }) {
      const messageId = generateMessageId()
      const message = {
        id: messageId,
        sessionId,
        content,
        messageType,
        sender: {
          id: state.currentServiceId,
          name: state.currentServiceName,
          type: 'service'
        },
        timestamp: Date.now(),
        status: 'sending'
      }

      // 立即添加到本地消息列表
      commit('ADD_MESSAGE', message)
      commit('SET_MESSAGE_SEND_STATUS', { messageId, status: 'sending' })

      try {
        // 首先尝试通过WebSocket发送
        const sent = webSocketManager.sendChatMessage(sessionId, content, messageType)
        
        if (sent) {
          commit('UPDATE_MESSAGE_STATUS', { messageId, status: 'sent' })
          commit('SET_MESSAGE_SEND_STATUS', { messageId, status: 'sent' })
        } else {
          // WebSocket发送失败，使用HTTP接口
          await sendMessage({
            sessionId,
            content,
            messageType,
            messageId
          })
          commit('UPDATE_MESSAGE_STATUS', { messageId, status: 'sent' })
          commit('SET_MESSAGE_SEND_STATUS', { messageId, status: 'sent' })
        }
      } catch (error) {
        console.error('消息发送失败:', error)
        commit('UPDATE_MESSAGE_STATUS', { messageId, status: 'failed' })
        commit('SET_MESSAGE_SEND_STATUS', { messageId, status: 'failed' })
        throw error
      }
    },

    // 接收消息（WebSocket回调）
    receiveMessage({ commit }, message) {
      commit('ADD_MESSAGE', message)
    },

    // 处理新会话通知
    handleNewSession({ commit }, sessionData) {
      commit('ADD_SESSION', sessionData)
      commit('ADD_NOTIFICATION', {
        type: 'info',
        title: '新会话',
        content: `客户 ${sessionData.customer.name} 发起了新的聊天请求`
      })
    },

    // 处理会话关闭通知
    handleSessionClose({ commit }, { sessionId, reason }) {
      commit('UPDATE_SESSION', {
        id: sessionId,
        status: 'closed'
      })
      commit('ADD_NOTIFICATION', {
        type: 'warning',
        title: '会话结束',
        content: `会话已结束，原因：${reason}`
      })
    },

    // 处理系统通知
    handleSystemNotification({ commit }, notification) {
      commit('ADD_NOTIFICATION', notification)
    },

    // 关闭会话
    async closeSessionAction({ commit }, { sessionId, reason }) {
      try {
        await closeSession(sessionId, reason)
        commit('UPDATE_SESSION', {
          id: sessionId,
          status: 'closed'
        })
      } catch (error) {
        console.error('关闭会话失败:', error)
        throw error
      }
    },

    // 转接会话
    async transferSessionAction({ commit }, { sessionId, targetServiceId }) {
      try {
        await transferSession(sessionId, targetServiceId)
        commit('REMOVE_SESSION', sessionId)
      } catch (error) {
        console.error('转接会话失败:', error)
        throw error
      }
    }
  },

  getters: {
    // 获取当前活跃会话的消息
    activeSessionMessages: (state) => {
      if (!state.activeSession) return []
      return state.messageCache[state.activeSession.id] || []
    },

    // 获取连接状态描述
    connectionStatusText: (state) => {
      const statusMap = {
        [CONNECTION_STATUS.DISCONNECTED]: '未连接',
        [CONNECTION_STATUS.CONNECTING]: '连接中',
        [CONNECTION_STATUS.CONNECTED]: '已连接',
        [CONNECTION_STATUS.RECONNECTING]: '重连中',
        [CONNECTION_STATUS.ERROR]: '连接错误'
      }
      return statusMap[state.connectionStatus] || '未知状态'
    },

    // 是否已连接
    isConnected: (state) => {
      return state.connectionStatus === CONNECTION_STATUS.CONNECTED
    },

    // 获取未读消息总数
    totalUnreadCount: (state) => {
      return state.totalUnreadCount
    },

    // 获取最新通知
    latestNotifications: (state) => {
      return state.notifications.slice(0, 10)
    }
  }
}

export default chat