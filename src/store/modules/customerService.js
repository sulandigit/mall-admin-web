import {
  updateServiceStatus,
  getServiceStatus,
  getQuickReplies,
  saveQuickReply,
  getServiceAnalytics,
  getOnlineServices
} from '@/api/customerService'
import { SERVICE_STATUS } from '@/utils/websocket/helper'
import webSocketManager from '@/utils/websocket/manager'

/**
 * 客服模块状态管理
 */
const customerService = {
  namespaced: true,

  state: {
    // 当前客服信息
    serviceInfo: {
      id: '',
      name: '',
      avatar: '',
      department: '',
      skills: []
    },
    // 客服在线状态
    serviceStatus: SERVICE_STATUS.OFFLINE,
    // 快捷回复模板
    quickReplies: [],
    // 客服配置
    serviceConfig: {
      autoAccept: false, // 是否自动接受新会话
      maxSessions: 10,   // 最大并发会话数
      notificationSound: true, // 是否开启消息提示音
      workingHours: {
        start: '09:00',
        end: '18:00'
      }
    },
    // 统计数据
    analytics: {
      todaySessionCount: 0,
      todayMessageCount: 0,
      averageResponseTime: 0,
      customerSatisfaction: 0,
      activeSessionCount: 0
    },
    // 在线客服列表
    onlineServices: [],
    // 加载状态
    loading: {
      status: false,
      quickReplies: false,
      analytics: false
    }
  },

  mutations: {
    // 设置客服信息
    SET_SERVICE_INFO(state, serviceInfo) {
      state.serviceInfo = { ...state.serviceInfo, ...serviceInfo }
    },

    // 设置客服状态
    SET_SERVICE_STATUS(state, status) {
      state.serviceStatus = status
    },

    // 设置快捷回复
    SET_QUICK_REPLIES(state, replies) {
      state.quickReplies = replies
    },

    // 添加快捷回复
    ADD_QUICK_REPLY(state, reply) {
      state.quickReplies.push({
        id: Date.now().toString(),
        ...reply,
        createdAt: Date.now()
      })
    },

    // 更新快捷回复
    UPDATE_QUICK_REPLY(state, { id, ...updates }) {
      const index = state.quickReplies.findIndex(reply => reply.id === id)
      if (index >= 0) {
        state.quickReplies.splice(index, 1, {
          ...state.quickReplies[index],
          ...updates
        })
      }
    },

    // 删除快捷回复
    DELETE_QUICK_REPLY(state, id) {
      state.quickReplies = state.quickReplies.filter(reply => reply.id !== id)
    },

    // 设置客服配置
    SET_SERVICE_CONFIG(state, config) {
      state.serviceConfig = { ...state.serviceConfig, ...config }
    },

    // 设置统计数据
    SET_ANALYTICS(state, analytics) {
      state.analytics = { ...state.analytics, ...analytics }
    },

    // 设置在线客服列表
    SET_ONLINE_SERVICES(state, services) {
      state.onlineServices = services
    },

    // 更新在线客服状态
    UPDATE_SERVICE_STATUS_IN_LIST(state, { serviceId, status }) {
      const index = state.onlineServices.findIndex(service => service.id === serviceId)
      if (index >= 0) {
        state.onlineServices[index].status = status
      }
    },

    // 设置加载状态
    SET_LOADING(state, { type, loading }) {
      state.loading[type] = loading
    },

    // 增加会话计数
    INCREMENT_SESSION_COUNT(state) {
      state.analytics.todaySessionCount += 1
      state.analytics.activeSessionCount += 1
    },

    // 减少活跃会话计数
    DECREMENT_ACTIVE_SESSION_COUNT(state) {
      if (state.analytics.activeSessionCount > 0) {
        state.analytics.activeSessionCount -= 1
      }
    },

    // 增加消息计数
    INCREMENT_MESSAGE_COUNT(state) {
      state.analytics.todayMessageCount += 1
    }
  },

  actions: {
    // 初始化客服模块
    async initCustomerService({ dispatch, commit }, serviceInfo) {
      commit('SET_SERVICE_INFO', serviceInfo)
      
      // 加载初始数据
      await Promise.all([
        dispatch('loadServiceStatus'),
        dispatch('loadQuickReplies'),
        dispatch('loadAnalytics'),
        dispatch('loadOnlineServices')
      ])
    },

    // 加载客服状态
    async loadServiceStatus({ commit }) {
      commit('SET_LOADING', { type: 'status', loading: true })
      try {
        const response = await getServiceStatus()
        if (response.data) {
          commit('SET_SERVICE_STATUS', response.data.status)
        }
      } catch (error) {
        console.error('加载客服状态失败:', error)
      } finally {
        commit('SET_LOADING', { type: 'status', loading: false })
      }
    },

    // 更新客服状态
    async updateStatus({ commit, state }, status) {
      try {
        // 通过WebSocket实时更新
        const sent = webSocketManager.updateServiceStatus(status)
        
        if (!sent) {
          // WebSocket失败，使用HTTP接口
          await updateServiceStatus(status)
        }

        commit('SET_SERVICE_STATUS', status)
        
        // 根据状态更新统计数据
        if (status === SERVICE_STATUS.OFFLINE) {
          commit('SET_ANALYTICS', {
            ...state.analytics,
            activeSessionCount: 0
          })
        }

        return true
      } catch (error) {
        console.error('更新客服状态失败:', error)
        throw error
      }
    },

    // 加载快捷回复
    async loadQuickReplies({ commit }) {
      commit('SET_LOADING', { type: 'quickReplies', loading: true })
      try {
        const response = await getQuickReplies()
        if (response.data) {
          commit('SET_QUICK_REPLIES', response.data)
        }
      } catch (error) {
        console.error('加载快捷回复失败:', error)
      } finally {
        commit('SET_LOADING', { type: 'quickReplies', loading: false })
      }
    },

    // 保存快捷回复
    async saveQuickReplyAction({ commit }, replyData) {
      try {
        const response = await saveQuickReply(replyData)
        if (response.data) {
          if (replyData.id) {
            commit('UPDATE_QUICK_REPLY', response.data)
          } else {
            commit('ADD_QUICK_REPLY', response.data)
          }
        }
        return response.data
      } catch (error) {
        console.error('保存快捷回复失败:', error)
        throw error
      }
    },

    // 删除快捷回复
    deleteQuickReplyAction({ commit }, id) {
      commit('DELETE_QUICK_REPLY', id)
    },

    // 更新客服配置
    updateServiceConfig({ commit }, config) {
      commit('SET_SERVICE_CONFIG', config)
      
      // 保存到本地存储
      localStorage.setItem('customerServiceConfig', JSON.stringify(config))
    },

    // 加载客服配置
    loadServiceConfig({ commit }) {
      try {
        const config = localStorage.getItem('customerServiceConfig')
        if (config) {
          commit('SET_SERVICE_CONFIG', JSON.parse(config))
        }
      } catch (error) {
        console.error('加载客服配置失败:', error)
      }
    },

    // 加载统计数据
    async loadAnalytics({ commit }) {
      commit('SET_LOADING', { type: 'analytics', loading: true })
      try {
        const response = await getServiceAnalytics({
          date: new Date().toISOString().split('T')[0]
        })
        if (response.data) {
          commit('SET_ANALYTICS', response.data)
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
      } finally {
        commit('SET_LOADING', { type: 'analytics', loading: false })
      }
    },

    // 加载在线客服列表
    async loadOnlineServices({ commit }) {
      try {
        const response = await getOnlineServices()
        if (response.data) {
          commit('SET_ONLINE_SERVICES', response.data)
        }
      } catch (error) {
        console.error('加载在线客服列表失败:', error)
      }
    },

    // 处理客服状态变更通知（WebSocket回调）
    updateServiceStatus({ commit }, { serviceId, status }) {
      commit('UPDATE_SERVICE_STATUS_IN_LIST', { serviceId, status })
    },

    // 处理新会话事件
    handleNewSession({ commit }) {
      commit('INCREMENT_SESSION_COUNT')
    },

    // 处理会话结束事件
    handleSessionEnd({ commit }) {
      commit('DECREMENT_ACTIVE_SESSION_COUNT')
    },

    // 处理消息发送事件
    handleMessageSent({ commit }) {
      commit('INCREMENT_MESSAGE_COUNT')
    },

    // 切换工作状态
    async toggleWorkStatus({ state, dispatch }) {
      const newStatus = state.serviceStatus === SERVICE_STATUS.ONLINE 
        ? SERVICE_STATUS.OFFLINE 
        : SERVICE_STATUS.ONLINE
      
      await dispatch('updateStatus', newStatus)
    },

    // 设置忙碌状态
    async setBusyStatus({ dispatch }) {
      await dispatch('updateStatus', SERVICE_STATUS.BUSY)
    },

    // 设置离开状态
    async setAwayStatus({ dispatch }) {
      await dispatch('updateStatus', SERVICE_STATUS.AWAY)
    }
  },

  getters: {
    // 获取客服状态文本
    serviceStatusText: (state) => {
      const statusMap = {
        [SERVICE_STATUS.ONLINE]: '在线',
        [SERVICE_STATUS.BUSY]: '忙碌',
        [SERVICE_STATUS.AWAY]: '离开',
        [SERVICE_STATUS.OFFLINE]: '离线'
      }
      return statusMap[state.serviceStatus] || '未知'
    },

    // 获取状态颜色
    serviceStatusColor: (state) => {
      const colorMap = {
        [SERVICE_STATUS.ONLINE]: '#67C23A',
        [SERVICE_STATUS.BUSY]: '#E6A23C',
        [SERVICE_STATUS.AWAY]: '#909399',
        [SERVICE_STATUS.OFFLINE]: '#F56C6C'
      }
      return colorMap[state.serviceStatus] || '#909399'
    },

    // 是否在工作状态
    isWorking: (state) => {
      return [SERVICE_STATUS.ONLINE, SERVICE_STATUS.BUSY].includes(state.serviceStatus)
    },

    // 是否可以接受新会话
    canAcceptNewSession: (state) => {
      return state.serviceStatus === SERVICE_STATUS.ONLINE &&
             state.analytics.activeSessionCount < state.serviceConfig.maxSessions
    },

    // 获取分类的快捷回复
    categorizedQuickReplies: (state) => {
      const categories = {}
      state.quickReplies.forEach(reply => {
        const category = reply.category || '默认'
        if (!categories[category]) {
          categories[category] = []
        }
        categories[category].push(reply)
      })
      return categories
    },

    // 获取今日工作统计
    todayStats: (state) => {
      return {
        sessionCount: state.analytics.todaySessionCount,
        messageCount: state.analytics.todayMessageCount,
        responseTime: state.analytics.averageResponseTime,
        satisfaction: state.analytics.customerSatisfaction
      }
    }
  }
}

export default customerService