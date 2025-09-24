const notification = {
  namespaced: true,
  state: {
    // 消息列表
    messages: [],
    
    // 通知列表
    notifications: [],
    
    // 系统通知列表
    systemNotifications: [],
    
    // 未读消息数量
    unreadCount: {
      messages: 0,
      notifications: 0,
      systemNotifications: 0,
      total: 0
    },
    
    // 消息类型常量
    messageTypes: {
      INFO: 'info',
      SUCCESS: 'success',
      WARNING: 'warning',
      ERROR: 'error'
    },
    
    // 通知类型常量
    notificationTypes: {
      ORDER: 'order',          // 订单通知
      SYSTEM: 'system',        // 系统通知
      MARKETING: 'marketing',  // 营销通知
      MAINTENANCE: 'maintenance' // 维护通知
    },
    
    // 通知优先级
    priorities: {
      LOW: 1,
      NORMAL: 2,
      HIGH: 3,
      URGENT: 4
    },
    
    // 全局消息配置
    globalConfig: {
      // 消息自动关闭时间（毫秒）
      autoClose: {
        info: 3000,
        success: 3000,
        warning: 5000,
        error: 0 // 错误消息不自动关闭
      },
      
      // 最大消息数量
      maxMessages: 100,
      
      // 最大通知数量
      maxNotifications: 200,
      
      // 是否启用声音提醒
      soundEnabled: true,
      
      // 是否启用桌面通知
      desktopNotificationEnabled: false,
      
      // 消息显示位置
      position: 'top-right'
    },
    
    // 消息队列（用于批量处理）
    messageQueue: [],
    
    // 通知过滤器
    filters: {
      type: 'all',
      status: 'all', // all, read, unread
      priority: 'all',
      dateRange: []
    },
    
    // 加载状态
    loading: {
      messages: false,
      notifications: false,
      systemNotifications: false
    },
    
    // WebSocket连接状态（用于实时通知）
    websocket: {
      connected: false,
      reconnecting: false,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      reconnectInterval: 5000
    }
  },
  
  mutations: {
    // 添加消息
    ADD_MESSAGE: (state, message) => {
      const newMessage = {
        id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: message.type || state.messageTypes.INFO,
        title: message.title || '',
        content: message.content || '',
        timestamp: message.timestamp || Date.now(),
        read: message.read || false,
        autoClose: message.autoClose !== undefined ? message.autoClose : true,
        persistent: message.persistent || false, // 是否持久化到localStorage
        actions: message.actions || [] // 可执行的操作按钮
      }
      
      state.messages.unshift(newMessage)
      
      // 限制消息数量
      if (state.messages.length > state.globalConfig.maxMessages) {
        state.messages = state.messages.slice(0, state.globalConfig.maxMessages)
      }
      
      // 更新未读数量
      if (!newMessage.read) {
        state.unreadCount.messages++
        state.unreadCount.total++
      }
      
      // 持久化消息
      if (newMessage.persistent) {
        try {
          const persistedMessages = JSON.parse(localStorage.getItem('persistedMessages') || '[]')
          persistedMessages.unshift(newMessage)
          localStorage.setItem('persistedMessages', JSON.stringify(persistedMessages.slice(0, 50))) // 只保留最新50条
        } catch (error) {
          console.warn('Failed to persist message:', error)
        }
      }
    },
    
    // 添加通知
    ADD_NOTIFICATION: (state, notification) => {
      const newNotification = {
        id: notification.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: notification.type || state.notificationTypes.SYSTEM,
        priority: notification.priority || state.priorities.NORMAL,
        title: notification.title || '',
        content: notification.content || '',
        timestamp: notification.timestamp || Date.now(),
        read: notification.read || false,
        actionUrl: notification.actionUrl || '',
        actionText: notification.actionText || '',
        expiresAt: notification.expiresAt || null,
        metadata: notification.metadata || {} // 额外数据
      }
      
      state.notifications.unshift(newNotification)
      
      // 限制通知数量
      if (state.notifications.length > state.globalConfig.maxNotifications) {
        state.notifications = state.notifications.slice(0, state.globalConfig.maxNotifications)
      }
      
      // 更新未读数量
      if (!newNotification.read) {
        state.unreadCount.notifications++
        state.unreadCount.total++
      }
    },
    
    // 添加系统通知
    ADD_SYSTEM_NOTIFICATION: (state, notification) => {
      const newNotification = {
        id: notification.id || `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'system',
        priority: notification.priority || state.priorities.HIGH,
        title: notification.title || '',
        content: notification.content || '',
        timestamp: notification.timestamp || Date.now(),
        read: notification.read || false,
        broadcast: notification.broadcast || false, // 是否为广播消息
        targetRoles: notification.targetRoles || [], // 目标角色
        expiresAt: notification.expiresAt || null
      }
      
      state.systemNotifications.unshift(newNotification)
      
      // 更新未读数量
      if (!newNotification.read) {
        state.unreadCount.systemNotifications++
        state.unreadCount.total++
      }
    },
    
    // 标记消息为已读
    MARK_MESSAGE_READ: (state, messageId) => {
      const message = state.messages.find(m => m.id === messageId)
      if (message && !message.read) {
        message.read = true
        state.unreadCount.messages = Math.max(0, state.unreadCount.messages - 1)
        state.unreadCount.total = Math.max(0, state.unreadCount.total - 1)
      }
    },
    
    // 标记通知为已读
    MARK_NOTIFICATION_READ: (state, notificationId) => {
      const notification = state.notifications.find(n => n.id === notificationId)
      if (notification && !notification.read) {
        notification.read = true
        state.unreadCount.notifications = Math.max(0, state.unreadCount.notifications - 1)
        state.unreadCount.total = Math.max(0, state.unreadCount.total - 1)
      }
    },
    
    // 标记系统通知为已读
    MARK_SYSTEM_NOTIFICATION_READ: (state, notificationId) => {
      const notification = state.systemNotifications.find(n => n.id === notificationId)
      if (notification && !notification.read) {
        notification.read = true
        state.unreadCount.systemNotifications = Math.max(0, state.unreadCount.systemNotifications - 1)
        state.unreadCount.total = Math.max(0, state.unreadCount.total - 1)
      }
    },
    
    // 标记所有消息为已读
    MARK_ALL_MESSAGES_READ: (state) => {
      state.messages.forEach(message => {
        message.read = true
      })
      state.unreadCount.total -= state.unreadCount.messages
      state.unreadCount.messages = 0
    },
    
    // 标记所有通知为已读
    MARK_ALL_NOTIFICATIONS_READ: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true
      })
      state.unreadCount.total -= state.unreadCount.notifications
      state.unreadCount.notifications = 0
    },
    
    // 标记所有系统通知为已读
    MARK_ALL_SYSTEM_NOTIFICATIONS_READ: (state) => {
      state.systemNotifications.forEach(notification => {
        notification.read = true
      })
      state.unreadCount.total -= state.unreadCount.systemNotifications
      state.unreadCount.systemNotifications = 0
    },
    
    // 删除消息
    DELETE_MESSAGE: (state, messageId) => {
      const index = state.messages.findIndex(m => m.id === messageId)
      if (index !== -1) {
        const message = state.messages[index]
        if (!message.read) {
          state.unreadCount.messages = Math.max(0, state.unreadCount.messages - 1)
          state.unreadCount.total = Math.max(0, state.unreadCount.total - 1)
        }
        state.messages.splice(index, 1)
      }
    },
    
    // 删除通知
    DELETE_NOTIFICATION: (state, notificationId) => {
      const index = state.notifications.findIndex(n => n.id === notificationId)
      if (index !== -1) {
        const notification = state.notifications[index]
        if (!notification.read) {
          state.unreadCount.notifications = Math.max(0, state.unreadCount.notifications - 1)
          state.unreadCount.total = Math.max(0, state.unreadCount.total - 1)
        }
        state.notifications.splice(index, 1)
      }
    },
    
    // 删除系统通知
    DELETE_SYSTEM_NOTIFICATION: (state, notificationId) => {
      const index = state.systemNotifications.findIndex(n => n.id === notificationId)
      if (index !== -1) {
        const notification = state.systemNotifications[index]
        if (!notification.read) {
          state.unreadCount.systemNotifications = Math.max(0, state.unreadCount.systemNotifications - 1)
          state.unreadCount.total = Math.max(0, state.unreadCount.total - 1)
        }
        state.systemNotifications.splice(index, 1)
      }
    },
    
    // 清空所有消息
    CLEAR_ALL_MESSAGES: (state) => {
      state.unreadCount.total -= state.unreadCount.messages
      state.unreadCount.messages = 0
      state.messages = []
    },
    
    // 清空所有通知
    CLEAR_ALL_NOTIFICATIONS: (state) => {
      state.unreadCount.total -= state.unreadCount.notifications
      state.unreadCount.notifications = 0
      state.notifications = []
    },
    
    // 清空所有系统通知
    CLEAR_ALL_SYSTEM_NOTIFICATIONS: (state) => {
      state.unreadCount.total -= state.unreadCount.systemNotifications
      state.unreadCount.systemNotifications = 0
      state.systemNotifications = []
    },
    
    // 设置过滤器
    SET_FILTERS: (state, filters) => {
      state.filters = { ...state.filters, ...filters }
    },
    
    // 更新全局配置
    UPDATE_GLOBAL_CONFIG: (state, config) => {
      state.globalConfig = { ...state.globalConfig, ...config }
      
      // 保存配置到localStorage
      try {
        localStorage.setItem('notificationConfig', JSON.stringify(state.globalConfig))
      } catch (error) {
        console.warn('Failed to save notification config:', error)
      }
    },
    
    // 设置加载状态
    SET_LOADING: (state, { type, loading }) => {
      state.loading[type] = loading
    },
    
    // 设置WebSocket连接状态
    SET_WEBSOCKET_STATUS: (state, status) => {
      state.websocket = { ...state.websocket, ...status }
    },
    
    // 添加到消息队列
    ADD_TO_MESSAGE_QUEUE: (state, message) => {
      state.messageQueue.push(message)
    },
    
    // 清空消息队列
    CLEAR_MESSAGE_QUEUE: (state) => {
      state.messageQueue = []
    },
    
    // 初始化数据
    INIT_NOTIFICATION_DATA: (state) => {
      // 从localStorage恢复配置
      try {
        const savedConfig = localStorage.getItem('notificationConfig')
        if (savedConfig) {
          state.globalConfig = { ...state.globalConfig, ...JSON.parse(savedConfig) }
        }
      } catch (error) {
        console.warn('Failed to restore notification config:', error)
      }
      
      // 从localStorage恢复持久化消息
      try {
        const persistedMessages = JSON.parse(localStorage.getItem('persistedMessages') || '[]')
        persistedMessages.forEach(message => {
          state.messages.push(message)
          if (!message.read) {
            state.unreadCount.messages++
            state.unreadCount.total++
          }
        })
      } catch (error) {
        console.warn('Failed to restore persisted messages:', error)
      }
    },
    
    // 清理过期通知
    CLEANUP_EXPIRED_NOTIFICATIONS: (state) => {
      const now = Date.now()
      
      // 清理过期的通知
      state.notifications = state.notifications.filter(notification => {
        if (notification.expiresAt && notification.expiresAt < now) {
          if (!notification.read) {
            state.unreadCount.notifications = Math.max(0, state.unreadCount.notifications - 1)
            state.unreadCount.total = Math.max(0, state.unreadCount.total - 1)
          }
          return false
        }
        return true
      })
      
      // 清理过期的系统通知
      state.systemNotifications = state.systemNotifications.filter(notification => {
        if (notification.expiresAt && notification.expiresAt < now) {
          if (!notification.read) {
            state.unreadCount.systemNotifications = Math.max(0, state.unreadCount.systemNotifications - 1)
            state.unreadCount.total = Math.max(0, state.unreadCount.total - 1)
          }
          return false
        }
        return true
      })
    }
  },
  
  actions: {
    // 初始化通知系统
    initNotification({ commit }) {
      commit('INIT_NOTIFICATION_DATA')
      
      // 请求桌面通知权限
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    },
    
    // 显示消息
    showMessage({ commit, state }, message) {
      commit('ADD_MESSAGE', message)
      
      // 播放提示音
      if (state.globalConfig.soundEnabled) {
        // 这里可以播放提示音
        // playNotificationSound(message.type)
      }
      
      // 显示桌面通知
      if (state.globalConfig.desktopNotificationEnabled && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(message.title || '新消息', {
          body: message.content,
          icon: '/favicon.ico'
        })
      }
    },
    
    // 显示成功消息
    showSuccess({ dispatch }, message) {
      dispatch('showMessage', {
        type: 'success',
        ...message
      })
    },
    
    // 显示错误消息
    showError({ dispatch }, message) {
      dispatch('showMessage', {
        type: 'error',
        autoClose: false, // 错误消息不自动关闭
        ...message
      })
    },
    
    // 显示警告消息
    showWarning({ dispatch }, message) {
      dispatch('showMessage', {
        type: 'warning',
        ...message
      })
    },
    
    // 显示信息消息
    showInfo({ dispatch }, message) {
      dispatch('showMessage', {
        type: 'info',
        ...message
      })
    },
    
    // 添加通知
    addNotification({ commit }, notification) {
      commit('ADD_NOTIFICATION', notification)
    },
    
    // 添加系统通知
    addSystemNotification({ commit }, notification) {
      commit('ADD_SYSTEM_NOTIFICATION', notification)
    },
    
    // 标记消息为已读
    markMessageRead({ commit }, messageId) {
      commit('MARK_MESSAGE_READ', messageId)
    },
    
    // 标记通知为已读
    markNotificationRead({ commit }, notificationId) {
      commit('MARK_NOTIFICATION_READ', notificationId)
    },
    
    // 标记系统通知为已读
    markSystemNotificationRead({ commit }, notificationId) {
      commit('MARK_SYSTEM_NOTIFICATION_READ', notificationId)
    },
    
    // 标记所有消息为已读
    markAllMessagesRead({ commit }) {
      commit('MARK_ALL_MESSAGES_READ')
    },
    
    // 标记所有通知为已读
    markAllNotificationsRead({ commit }) {
      commit('MARK_ALL_NOTIFICATIONS_READ')
    },
    
    // 标记所有系统通知为已读
    markAllSystemNotificationsRead({ commit }) {
      commit('MARK_ALL_SYSTEM_NOTIFICATIONS_READ')
    },
    
    // 删除消息
    deleteMessage({ commit }, messageId) {
      commit('DELETE_MESSAGE', messageId)
    },
    
    // 删除通知
    deleteNotification({ commit }, notificationId) {
      commit('DELETE_NOTIFICATION', notificationId)
    },
    
    // 删除系统通知
    deleteSystemNotification({ commit }, notificationId) {
      commit('DELETE_SYSTEM_NOTIFICATION', notificationId)
    },
    
    // 清空所有消息
    clearAllMessages({ commit }) {
      commit('CLEAR_ALL_MESSAGES')
      
      // 清空localStorage中的持久化消息
      localStorage.removeItem('persistedMessages')
    },
    
    // 清空所有通知
    clearAllNotifications({ commit }) {
      commit('CLEAR_ALL_NOTIFICATIONS')
    },
    
    // 清空所有系统通知
    clearAllSystemNotifications({ commit }) {
      commit('CLEAR_ALL_SYSTEM_NOTIFICATIONS')
    },
    
    // 更新配置
    updateConfig({ commit }, config) {
      commit('UPDATE_GLOBAL_CONFIG', config)
    },
    
    // 设置过滤器
    setFilters({ commit }, filters) {
      commit('SET_FILTERS', filters)
    },
    
    // 清理过期通知
    cleanupExpiredNotifications({ commit }) {
      commit('CLEANUP_EXPIRED_NOTIFICATIONS')
    },
    
    // 批量处理消息队列
    processMessageQueue({ state, commit }) {
      const queue = [...state.messageQueue]
      commit('CLEAR_MESSAGE_QUEUE')
      
      queue.forEach(message => {
        commit('ADD_MESSAGE', message)
      })
    },
    
    // 从服务器同步通知（如果有相关API）
    async syncNotifications({ commit }) {
      commit('SET_LOADING', { type: 'notifications', loading: true })
      
      try {
        // 这里可以调用API获取服务器端的通知
        // const response = await getNotifications()
        // response.data.forEach(notification => {
        //   commit('ADD_NOTIFICATION', notification)
        // })
        
        // 暂时模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        return true
      } catch (error) {
        console.error('同步通知失败:', error)
        throw error
      } finally {
        commit('SET_LOADING', { type: 'notifications', loading: false })
      }
    }
  },
  
  getters: {
    // 获取所有消息
    messages: state => state.messages,
    
    // 获取所有通知
    notifications: state => state.notifications,
    
    // 获取所有系统通知
    systemNotifications: state => state.systemNotifications,
    
    // 获取未读数量
    unreadCount: state => state.unreadCount,
    
    // 获取过滤后的消息
    filteredMessages: (state) => {
      let filtered = [...state.messages]
      
      if (state.filters.type !== 'all') {
        filtered = filtered.filter(message => message.type === state.filters.type)
      }
      
      if (state.filters.status !== 'all') {
        const isRead = state.filters.status === 'read'
        filtered = filtered.filter(message => message.read === isRead)
      }
      
      if (state.filters.dateRange && state.filters.dateRange.length === 2) {
        const [startDate, endDate] = state.filters.dateRange
        filtered = filtered.filter(message => {
          return message.timestamp >= startDate && message.timestamp <= endDate
        })
      }
      
      return filtered
    },
    
    // 获取过滤后的通知
    filteredNotifications: (state) => {
      let filtered = [...state.notifications]
      
      if (state.filters.type !== 'all') {
        filtered = filtered.filter(notification => notification.type === state.filters.type)
      }
      
      if (state.filters.status !== 'all') {
        const isRead = state.filters.status === 'read'
        filtered = filtered.filter(notification => notification.read === isRead)
      }
      
      if (state.filters.priority !== 'all') {
        filtered = filtered.filter(notification => notification.priority === state.filters.priority)
      }
      
      if (state.filters.dateRange && state.filters.dateRange.length === 2) {
        const [startDate, endDate] = state.filters.dateRange
        filtered = filtered.filter(notification => {
          return notification.timestamp >= startDate && notification.timestamp <= endDate
        })
      }
      
      return filtered
    },
    
    // 获取最新的未读消息
    latestUnreadMessages: (state) => {
      return state.messages
        .filter(message => !message.read)
        .slice(0, 5) // 只返回最新5条
    },
    
    // 获取最新的未读通知
    latestUnreadNotifications: (state) => {
      return state.notifications
        .filter(notification => !notification.read)
        .slice(0, 5) // 只返回最新5条
    },
    
    // 获取高优先级通知
    highPriorityNotifications: (state) => {
      return state.notifications.filter(notification => 
        notification.priority >= state.priorities.HIGH && !notification.read
      )
    },
    
    // 获取全局配置
    globalConfig: state => state.globalConfig,
    
    // 获取过滤器
    filters: state => state.filters,
    
    // 获取加载状态
    loading: state => state.loading,
    
    // 获取WebSocket连接状态
    websocketStatus: state => state.websocket,
    
    // 获取消息队列长度
    messageQueueLength: state => state.messageQueue.length,
    
    // 检查是否有未读项目
    hasUnread: state => state.unreadCount.total > 0,
    
    // 根据ID获取消息
    getMessageById: (state) => (id) => {
      return state.messages.find(message => message.id === id)
    },
    
    // 根据ID获取通知
    getNotificationById: (state) => (id) => {
      return state.notifications.find(notification => notification.id === id)
    },
    
    // 获取消息类型统计
    messageTypeStats: (state) => {
      const stats = {}
      Object.values(state.messageTypes).forEach(type => {
        stats[type] = state.messages.filter(message => message.type === type).length
      })
      return stats
    },
    
    // 获取通知类型统计
    notificationTypeStats: (state) => {
      const stats = {}
      Object.values(state.notificationTypes).forEach(type => {
        stats[type] = state.notifications.filter(notification => notification.type === type).length
      })
      return stats
    }
  }
}

export default notification