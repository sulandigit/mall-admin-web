import {
  getDashboardData,
  getPageVisitData,
  getStayTimeData,
  getBounceRateData,
  getUserProfileData,
  getRealTimeData,
  getBehaviorAlerts
} from '@/api/behavior'

const behavior = {
  namespaced: true,
  state: {
    // 仪表板数据
    dashboardData: {
      totalVisits: 0,
      averageStayTime: 0,
      bounceRate: 0,
      trendData: []
    },
    // 页面访问数据
    pageVisitData: {
      pageRanking: [],
      visitSources: [],
      visitPaths: []
    },
    // 停留时间数据
    stayTimeData: {
      timeDistribution: [],
      pageComparison: [],
      averageTime: 0
    },
    // 跳出率数据
    bounceRateData: {
      rateTrend: [],
      pageRates: [],
      alerts: []
    },
    // 用户画像数据
    userProfileData: {
      behaviorFeatures: [],
      interestTags: [],
      userSegments: []
    },
    // 实时数据
    realTimeData: {
      currentVisitors: 0,
      todayVisits: 0,
      liveEvents: []
    },
    // 预警信息
    alerts: [],
    // 时间范围设置
    timeRange: '7d',
    // 加载状态
    loading: {
      dashboard: false,
      pageVisit: false,
      stayTime: false,
      bounceRate: false,
      userProfile: false,
      realTime: false
    },
    // 错误状态
    error: null,
    // 最后更新时间
    lastUpdated: null
  },

  mutations: {
    // 设置仪表板数据
    SET_DASHBOARD_DATA(state, data) {
      state.dashboardData = { ...state.dashboardData, ...data }
      state.lastUpdated = new Date()
    },
    // 设置页面访问数据
    SET_PAGE_VISIT_DATA(state, data) {
      state.pageVisitData = { ...state.pageVisitData, ...data }
      state.lastUpdated = new Date()
    },
    // 设置停留时间数据
    SET_STAY_TIME_DATA(state, data) {
      state.stayTimeData = { ...state.stayTimeData, ...data }
      state.lastUpdated = new Date()
    },
    // 设置跳出率数据
    SET_BOUNCE_RATE_DATA(state, data) {
      state.bounceRateData = { ...state.bounceRateData, ...data }
      state.lastUpdated = new Date()
    },
    // 设置用户画像数据
    SET_USER_PROFILE_DATA(state, data) {
      state.userProfileData = { ...state.userProfileData, ...data }
      state.lastUpdated = new Date()
    },
    // 设置实时数据
    SET_REAL_TIME_DATA(state, data) {
      state.realTimeData = { ...state.realTimeData, ...data }
    },
    // 设置预警信息
    SET_ALERTS(state, alerts) {
      state.alerts = alerts
    },
    // 设置时间范围
    SET_TIME_RANGE(state, range) {
      state.timeRange = range
    },
    // 设置加载状态
    SET_LOADING(state, { module, status }) {
      state.loading[module] = status
    },
    // 设置错误状态
    SET_ERROR(state, error) {
      state.error = error
    },
    // 清除错误状态
    CLEAR_ERROR(state) {
      state.error = null
    }
  },

  actions: {
    // 获取仪表板数据
    async fetchDashboardData({ commit, state }, params = {}) {
      try {
        commit('SET_LOADING', { module: 'dashboard', status: true })
        commit('CLEAR_ERROR')
        
        const requestParams = {
          timeRange: state.timeRange,
          ...params
        }
        
        const response = await getDashboardData(requestParams)
        commit('SET_DASHBOARD_DATA', response.data)
        
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message || '获取仪表板数据失败')
        throw error
      } finally {
        commit('SET_LOADING', { module: 'dashboard', status: false })
      }
    },

    // 获取页面访问数据
    async fetchPageVisitData({ commit }, params = {}) {
      try {
        commit('SET_LOADING', { module: 'pageVisit', status: true })
        commit('CLEAR_ERROR')
        
        const response = await getPageVisitData(params)
        commit('SET_PAGE_VISIT_DATA', response.data)
        
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message || '获取页面访问数据失败')
        throw error
      } finally {
        commit('SET_LOADING', { module: 'pageVisit', status: false })
      }
    },

    // 获取停留时间数据
    async fetchStayTimeData({ commit }, params = {}) {
      try {
        commit('SET_LOADING', { module: 'stayTime', status: true })
        commit('CLEAR_ERROR')
        
        const response = await getStayTimeData(params)
        commit('SET_STAY_TIME_DATA', response.data)
        
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message || '获取停留时间数据失败')
        throw error
      } finally {
        commit('SET_LOADING', { module: 'stayTime', status: false })
      }
    },

    // 获取跳出率数据
    async fetchBounceRateData({ commit }, params = {}) {
      try {
        commit('SET_LOADING', { module: 'bounceRate', status: true })
        commit('CLEAR_ERROR')
        
        const response = await getBounceRateData(params)
        commit('SET_BOUNCE_RATE_DATA', response.data)
        
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message || '获取跳出率数据失败')
        throw error
      } finally {
        commit('SET_LOADING', { module: 'bounceRate', status: false })
      }
    },

    // 获取用户画像数据
    async fetchUserProfileData({ commit }, params = {}) {
      try {
        commit('SET_LOADING', { module: 'userProfile', status: true })
        commit('CLEAR_ERROR')
        
        const response = await getUserProfileData(params)
        commit('SET_USER_PROFILE_DATA', response.data)
        
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message || '获取用户画像数据失败')
        throw error
      } finally {
        commit('SET_LOADING', { module: 'userProfile', status: false })
      }
    },

    // 获取实时数据
    async fetchRealTimeData({ commit }, params = {}) {
      try {
        commit('SET_LOADING', { module: 'realTime', status: true })
        
        const response = await getRealTimeData(params)
        commit('SET_REAL_TIME_DATA', response.data)
        
        return response.data
      } catch (error) {
        console.error('获取实时数据失败:', error)
        throw error
      } finally {
        commit('SET_LOADING', { module: 'realTime', status: false })
      }
    },

    // 获取预警信息
    async fetchAlerts({ commit }, params = {}) {
      try {
        const response = await getBehaviorAlerts(params)
        commit('SET_ALERTS', response.data)
        
        return response.data
      } catch (error) {
        console.error('获取预警信息失败:', error)
        throw error
      }
    },

    // 刷新所有数据
    async refreshAllData({ dispatch, state }) {
      const promises = [
        dispatch('fetchDashboardData'),
        dispatch('fetchPageVisitData'),
        dispatch('fetchStayTimeData'),
        dispatch('fetchBounceRateData'),
        dispatch('fetchUserProfileData'),
        dispatch('fetchRealTimeData'),
        dispatch('fetchAlerts')
      ]
      
      try {
        await Promise.allSettled(promises)
      } catch (error) {
        console.error('刷新数据失败:', error)
      }
    },

    // 设置时间范围并重新获取数据
    async setTimeRange({ commit, dispatch }, range) {
      commit('SET_TIME_RANGE', range)
      await dispatch('fetchDashboardData', { refresh: true })
    },

    // 清除所有数据
    clearAllData({ commit }) {
      commit('SET_DASHBOARD_DATA', {
        totalVisits: 0,
        averageStayTime: 0,
        bounceRate: 0,
        trendData: []
      })
      commit('SET_PAGE_VISIT_DATA', {
        pageRanking: [],
        visitSources: [],
        visitPaths: []
      })
      commit('SET_STAY_TIME_DATA', {
        timeDistribution: [],
        pageComparison: [],
        averageTime: 0
      })
      commit('SET_BOUNCE_RATE_DATA', {
        rateTrend: [],
        pageRates: [],
        alerts: []
      })
      commit('SET_USER_PROFILE_DATA', {
        behaviorFeatures: [],
        interestTags: [],
        userSegments: []
      })
      commit('SET_REAL_TIME_DATA', {
        currentVisitors: 0,
        todayVisits: 0,
        liveEvents: []
      })
      commit('SET_ALERTS', [])
    }
  },

  getters: {
    // 总访问量
    totalVisits: state => state.dashboardData.totalVisits,
    
    // 平均停留时间
    averageStayTime: state => state.dashboardData.averageStayTime,
    
    // 总体跳出率
    overallBounceRate: state => state.dashboardData.bounceRate,
    
    // 热门页面（前5个）
    topPages: state => state.pageVisitData.pageRanking.slice(0, 5),
    
    // 是否有数据加载中
    isLoading: state => Object.values(state.loading).some(loading => loading),
    
    // 是否有错误
    hasError: state => !!state.error,
    
    // 是否有预警
    hasAlerts: state => state.alerts.length > 0,
    
    // 当前在线用户数
    currentVisitors: state => state.realTimeData.currentVisitors,
    
    // 今日访问量
    todayVisits: state => state.realTimeData.todayVisits,
    
    // 数据最后更新时间
    lastUpdatedTime: state => state.lastUpdated,
    
    // 趋势数据（用于图表）
    trendChartData: state => state.dashboardData.trendData,
    
    // 页面访问排行榜（格式化用于图表）
    pageRankingChartData: state => {
      return state.pageVisitData.pageRanking.map(item => ({
        name: item.pageName || item.pageUrl,
        value: item.visitCount
      }))
    },
    
    // 访问来源分布（格式化用于饼图）
    visitSourcesChartData: state => {
      return state.pageVisitData.visitSources.map(item => ({
        name: item.source,
        value: item.count
      }))
    }
  }
}

export default behavior