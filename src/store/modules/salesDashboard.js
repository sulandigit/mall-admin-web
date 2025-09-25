/**
 * 实时销售指标Dashboard状态管理模块
 */

const state = {
  // 实时数据
  realTimeData: {
    currentSales: 0,
    todayOrders: 0,
    onlineUsers: 0,
    lastUpdateTime: null
  },
  
  // 历史数据
  historicalData: {
    dailyTrends: [],
    weeklyComparison: [],
    monthlyGrowth: []
  },
  
  // KPI指标
  kpiMetrics: {
    todaySales: {
      value: 0,
      percentage: 0,
      trend: 'up' // 'up', 'down', 'stable'
    },
    todayOrders: {
      value: 0,
      percentage: 0,
      trend: 'up'
    },
    conversionRate: {
      value: 0,
      percentage: 0,
      trend: 'up'
    },
    avgOrderValue: {
      value: 0,
      percentage: 0,
      trend: 'up'
    }
  },
  
  // 图表配置
  chartConfigs: {
    timeRange: 'today', // 'today', 'week', 'month'
    chartType: 'line' // 'line', 'bar', 'area'
  },
  
  // 产品性能数据
  productPerformance: {
    topProducts: [],
    categoryDistribution: [],
    hourlyTrends: []
  },
  
  // 地域销售数据
  regionalSales: [],
  
  // 最近订单
  recentOrders: [],
  
  // UI状态
  uiState: {
    loading: false,
    error: null,
    selectedTimeRange: 'today',
    isRealTimeEnabled: true,
    connectionStatus: 'disconnected' // 'connected', 'connecting', 'disconnected'
  },
  
  // 告警信息
  alerts: []
}

const mutations = {
  // 设置加载状态
  SET_LOADING(state, loading) {
    state.uiState.loading = loading
  },
  
  // 设置错误信息
  SET_ERROR(state, error) {
    state.uiState.error = error
  },
  
  // 更新实时数据
  UPDATE_REAL_TIME_DATA(state, data) {
    state.realTimeData = {
      ...state.realTimeData,
      ...data,
      lastUpdateTime: new Date().toISOString()
    }
  },
  
  // 更新KPI指标
  UPDATE_KPI_METRICS(state, metrics) {
    state.kpiMetrics = {
      ...state.kpiMetrics,
      ...metrics
    }
  },
  
  // 设置历史数据
  SET_HISTORICAL_DATA(state, { type, data }) {
    state.historicalData[type] = data
  },
  
  // 设置产品性能数据
  SET_PRODUCT_PERFORMANCE(state, data) {
    state.productPerformance = {
      ...state.productPerformance,
      ...data
    }
  },
  
  // 设置地域销售数据
  SET_REGIONAL_SALES(state, data) {
    state.regionalSales = data
  },
  
  // 设置最近订单
  SET_RECENT_ORDERS(state, orders) {
    state.recentOrders = orders
  },
  
  // 设置时间范围
  SET_TIME_RANGE(state, timeRange) {
    state.uiState.selectedTimeRange = timeRange
    state.chartConfigs.timeRange = timeRange
  },
  
  // 设置图表类型
  SET_CHART_TYPE(state, chartType) {
    state.chartConfigs.chartType = chartType
  },
  
  // 设置WebSocket连接状态
  SET_CONNECTION_STATUS(state, status) {
    state.uiState.connectionStatus = status
  },
  
  // 切换实时数据开关
  TOGGLE_REAL_TIME(state) {
    state.uiState.isRealTimeEnabled = !state.uiState.isRealTimeEnabled
  },
  
  // 添加告警
  ADD_ALERT(state, alert) {
    state.alerts.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...alert
    })
    
    // 保持最多20条告警
    if (state.alerts.length > 20) {
      state.alerts.splice(20)
    }
  },
  
  // 移除告警
  REMOVE_ALERT(state, alertId) {
    const index = state.alerts.findIndex(alert => alert.id === alertId)
    if (index > -1) {
      state.alerts.splice(index, 1)
    }
  },
  
  // 清空告警
  CLEAR_ALERTS(state) {
    state.alerts = []
  }
}

const actions = {
  // 初始化Dashboard
  async initDashboard({ commit, dispatch }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      // 并行获取初始数据
      await Promise.all([
        dispatch('fetchKPIMetrics'),
        dispatch('fetchHistoricalData'),
        dispatch('fetchProductPerformance'),
        dispatch('fetchRegionalSales'),
        dispatch('fetchRecentOrders')
      ])
      
      // 启动实时数据连接
      dispatch('connectWebSocket')
      
    } catch (error) {
      commit('SET_ERROR', error.message)
      console.error('Dashboard初始化失败:', error)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 获取KPI指标
  async fetchKPIMetrics({ commit }) {
    try {
      // 这里应该调用实际的API
      // const response = await dashboardApi.getKPIMetrics()
      
      // 模拟数据
      const mockData = {
        todaySales: {
          value: 28560.00,
          percentage: 12.5,
          trend: 'up'
        },
        todayOrders: {
          value: 156,
          percentage: 8.3,
          trend: 'up'
        },
        conversionRate: {
          value: 3.42,
          percentage: -2.1,
          trend: 'down'
        },
        avgOrderValue: {
          value: 183.08,
          percentage: 5.7,
          trend: 'up'
        }
      }
      
      commit('UPDATE_KPI_METRICS', mockData)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },
  
  // 获取历史数据
  async fetchHistoricalData({ commit, state }) {
    try {
      const timeRange = state.uiState.selectedTimeRange
      // const response = await dashboardApi.getHistoricalData({ timeRange })
      
      // 模拟历史趋势数据
      const mockDailyTrends = Array.from({ length: 24 }, (_, hour) => ({
        hour: hour.toString().padStart(2, '0') + ':00',
        sales: Math.floor(Math.random() * 5000) + 1000,
        orders: Math.floor(Math.random() * 50) + 10
      }))
      
      commit('SET_HISTORICAL_DATA', {
        type: 'dailyTrends',
        data: mockDailyTrends
      })
      
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },
  
  // 获取产品性能数据
  async fetchProductPerformance({ commit }) {
    try {
      // 模拟产品性能数据
      const mockData = {
        topProducts: [
          { id: 1, name: 'iPhone 14 Pro', sales: 12560, quantity: 45, growth: 15.6 },
          { id: 2, name: 'MacBook Air M2', sales: 8430, quantity: 12, growth: 8.3 },
          { id: 3, name: 'AirPods Pro', sales: 6720, quantity: 78, growth: 22.1 },
          { id: 4, name: 'iPad Air', sales: 5690, quantity: 23, growth: -3.2 },
          { id: 5, name: 'Apple Watch', sales: 4580, quantity: 34, growth: 12.8 }
        ],
        categoryDistribution: [
          { name: '电子产品', value: 45.2 },
          { name: '服装配饰', value: 23.8 },
          { name: '家居用品', value: 15.6 },
          { name: '运动户外', value: 9.4 },
          { name: '其他', value: 6.0 }
        ]
      }
      
      commit('SET_PRODUCT_PERFORMANCE', mockData)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },
  
  // 获取地域销售数据
  async fetchRegionalSales({ commit }) {
    try {
      // 模拟地域销售数据
      const mockData = [
        { region: '华东', sales: 125600, percentage: 35.2 },
        { region: '华南', sales: 98500, percentage: 27.6 },
        { region: '华北', sales: 76800, percentage: 21.5 },
        { region: '西南', sales: 32500, percentage: 9.1 },
        { region: '其他', sales: 23400, percentage: 6.6 }
      ]
      
      commit('SET_REGIONAL_SALES', mockData)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },
  
  // 获取最近订单
  async fetchRecentOrders({ commit }) {
    try {
      // 模拟最近订单数据
      const mockOrders = Array.from({ length: 10 }, (_, index) => ({
        id: `order_${Date.now()}_${index}`,
        customerName: `客户${index + 1}`,
        amount: Math.floor(Math.random() * 2000) + 100,
        status: ['待付款', '已付款', '已发货', '已完成'][Math.floor(Math.random() * 4)],
        createTime: new Date(Date.now() - Math.random() * 3600000).toISOString()
      }))
      
      commit('SET_RECENT_ORDERS', mockOrders)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },
  
  // 连接WebSocket
  connectWebSocket({ commit, dispatch }) {
    // 导入WebSocket服务
    import('@/utils/websocket').then(({ default: webSocketService, setupWebSocketWithStore }) => {
      // 设置WebSocket与Store的集成
      setupWebSocketWithStore(this)
      
      commit('SET_CONNECTION_STATUS', 'connecting')
      
      // 在开发环境下使用模拟连接
      const wsUrl = process.env.NODE_ENV === 'development' 
        ? 'mock://localhost:8080/ws/dashboard'
        : `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/ws/dashboard`
      
      webSocketService.connect(wsUrl)
        .then(() => {
          // 订阅销售数据频道
          webSocketService.subscribe('sales_dashboard')
          webSocketService.subscribe('sales_alerts')
          
          // 开始实时数据更新
          dispatch('startRealTimeUpdates')
        })
        .catch(error => {
          commit('SET_ERROR', '连接失败: ' + error.message)
          commit('SET_CONNECTION_STATUS', 'disconnected')
        })
    })
  },
  
  // 断开WebSocket连接
  disconnectWebSocket({ commit }) {
    import('@/utils/websocket').then(({ default: webSocketService }) => {
      webSocketService.disconnect()
    })
    commit('SET_CONNECTION_STATUS', 'disconnected')
  },
  
  // 开始实时数据更新
  startRealTimeUpdates({ commit, state }) {
    // 模拟实时数据更新
    setInterval(() => {
      if (state.uiState.isRealTimeEnabled && state.uiState.connectionStatus === 'connected') {
        // 模拟实时数据变化
        const realTimeUpdate = {
          currentSales: state.realTimeData.currentSales + Math.floor(Math.random() * 1000),
          todayOrders: state.realTimeData.todayOrders + Math.floor(Math.random() * 5),
          onlineUsers: Math.floor(Math.random() * 500) + 100
        }
        
        commit('UPDATE_REAL_TIME_DATA', realTimeUpdate)
        
        // 随机生成告警
        if (Math.random() < 0.1) { // 10% 概率生成告警
          commit('ADD_ALERT', {
            type: 'warning',
            title: '销售异常',
            message: '检测到销售额突然下降，请关注订单状态',
            level: 'medium'
          })
        }
      }
    }, 5000) // 每5秒更新一次
  },
  
  // 设置时间范围
  setTimeRange({ commit, dispatch }, timeRange) {
    commit('SET_TIME_RANGE', timeRange)
    // 重新获取对应时间范围的数据
    dispatch('fetchHistoricalData')
  },
  
  // 处理WebSocket消息
  handleWebSocketMessage({ commit }, message) {
    try {
      const data = JSON.parse(message)
      
      switch (data.type) {
        case 'realtime_update':
          commit('UPDATE_REAL_TIME_DATA', data.payload)
          break
        case 'kpi_update':
          commit('UPDATE_KPI_METRICS', data.payload)
          break
        case 'alert':
          commit('ADD_ALERT', data.payload)
          break
        default:
          console.warn('未知的WebSocket消息类型:', data.type)
      }
    } catch (error) {
      console.error('处理WebSocket消息失败:', error)
    }
  }
}

const getters = {
  // 格式化的销售数据
  formattedSalesData: state => {
    return {
      current: state.realTimeData.currentSales.toLocaleString(),
      percentage: state.kpiMetrics.todaySales.percentage
    }
  },
  
  // 增长百分比计算
  growthPercentage: state => type => {
    return state.kpiMetrics[type]?.percentage || 0
  },
  
  // 最佳销售商品
  topPerformingProducts: state => {
    return state.productPerformance.topProducts
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
  },
  
  // 销售趋势分析
  salesTrendAnalysis: state => {
    const trends = state.historicalData.dailyTrends
    if (trends.length < 2) return null
    
    const latest = trends[trends.length - 1]
    const previous = trends[trends.length - 2]
    
    return {
      current: latest.sales,
      change: latest.sales - previous.sales,
      percentage: ((latest.sales - previous.sales) / previous.sales * 100).toFixed(2)
    }
  },
  
  // 是否连接状态
  isConnected: state => state.uiState.connectionStatus === 'connected',
  
  // 未读告警数量
  unreadAlertsCount: state => state.alerts.length,
  
  // 活跃的KPI指标
  activeKPIMetrics: state => {
    return Object.entries(state.kpiMetrics).map(([key, value]) => ({
      key,
      ...value,
      formatted: typeof value.value === 'number' && key.includes('Sales') 
        ? `¥${value.value.toLocaleString()}`
        : value.value.toLocaleString()
    }))
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}