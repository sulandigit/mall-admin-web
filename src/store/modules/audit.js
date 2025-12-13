import {
  getAuditStatistics,
  getUserActivityStats,
  getFeatureUsageStats,
  getOperationSuccessStats,
  getAccessTimeStats,
  getAbnormalOperationStats,
  getDataChanges,
  generateAuditReport,
  getSecurityAlerts,
  handleSecurityAlert,
  getComplianceCheck,
  exportAuditData
} from '@/api/audit'

const state = {
  // 审计统计数据
  statistics: {
    totalOperations: 0,
    totalUsers: 0,
    successRate: 0,
    errorRate: 0,
    todayOperations: 0,
    activeUsers: 0
  },
  // 用户活跃度数据
  userActivityData: [],
  // 功能使用率数据
  featureUsageData: [],
  // 操作成功率数据
  operationSuccessData: [],
  // 访问时段分布数据
  accessTimeData: [],
  // 异常操作统计数据
  abnormalOperationData: [],
  // 数据变更记录
  dataChanges: {
    list: [],
    pagination: {
      current: 1,
      pageSize: 20,
      total: 0
    }
  },
  // 安全告警列表
  securityAlerts: {
    list: [],
    pagination: {
      current: 1,
      pageSize: 20,
      total: 0
    }
  },
  // 合规性检查结果
  complianceCheckResult: {},
  // 加载状态
  loading: false,
  // 报告生成状态
  reportGenerating: false,
  // 数据导出状态
  exportLoading: false,
  // 图表加载状态
  chartLoading: {
    userActivity: false,
    featureUsage: false,
    operationSuccess: false,
    accessTime: false,
    abnormalOperation: false
  }
}

const mutations = {
  SET_STATISTICS: (state, statistics) => {
    state.statistics = { ...state.statistics, ...statistics }
  },
  SET_USER_ACTIVITY_DATA: (state, data) => {
    state.userActivityData = data
  },
  SET_FEATURE_USAGE_DATA: (state, data) => {
    state.featureUsageData = data
  },
  SET_OPERATION_SUCCESS_DATA: (state, data) => {
    state.operationSuccessData = data
  },
  SET_ACCESS_TIME_DATA: (state, data) => {
    state.accessTimeData = data
  },
  SET_ABNORMAL_OPERATION_DATA: (state, data) => {
    state.abnormalOperationData = data
  },
  SET_DATA_CHANGES: (state, { list, pagination }) => {
    state.dataChanges.list = list
    state.dataChanges.pagination = { ...state.dataChanges.pagination, ...pagination }
  },
  SET_SECURITY_ALERTS: (state, { list, pagination }) => {
    state.securityAlerts.list = list
    state.securityAlerts.pagination = { ...state.securityAlerts.pagination, ...pagination }
  },
  SET_COMPLIANCE_CHECK_RESULT: (state, result) => {
    state.complianceCheckResult = result
  },
  SET_LOADING: (state, loading) => {
    state.loading = loading
  },
  SET_REPORT_GENERATING: (state, generating) => {
    state.reportGenerating = generating
  },
  SET_EXPORT_LOADING: (state, loading) => {
    state.exportLoading = loading
  },
  SET_CHART_LOADING: (state, { chartType, loading }) => {
    state.chartLoading[chartType] = loading
  }
}

const actions = {
  // 获取审计统计数据
  async getAuditStatistics({ commit }, params) {
    commit('SET_LOADING', true)
    try {
      const response = await getAuditStatistics(params)
      commit('SET_STATISTICS', response.data)
      return response
    } catch (error) {
      console.error('获取审计统计数据失败:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 获取用户活跃度统计
  async getUserActivityStats({ commit }, params) {
    commit('SET_CHART_LOADING', { chartType: 'userActivity', loading: true })
    try {
      const response = await getUserActivityStats(params)
      commit('SET_USER_ACTIVITY_DATA', response.data)
      return response
    } catch (error) {
      console.error('获取用户活跃度统计失败:', error)
      throw error
    } finally {
      commit('SET_CHART_LOADING', { chartType: 'userActivity', loading: false })
    }
  },

  // 获取功能使用率统计
  async getFeatureUsageStats({ commit }, params) {
    commit('SET_CHART_LOADING', { chartType: 'featureUsage', loading: true })
    try {
      const response = await getFeatureUsageStats(params)
      commit('SET_FEATURE_USAGE_DATA', response.data)
      return response
    } catch (error) {
      console.error('获取功能使用率统计失败:', error)
      throw error
    } finally {
      commit('SET_CHART_LOADING', { chartType: 'featureUsage', loading: false })
    }
  },

  // 获取操作成功率统计
  async getOperationSuccessStats({ commit }, params) {
    commit('SET_CHART_LOADING', { chartType: 'operationSuccess', loading: true })
    try {
      const response = await getOperationSuccessStats(params)
      commit('SET_OPERATION_SUCCESS_DATA', response.data)
      return response
    } catch (error) {
      console.error('获取操作成功率统计失败:', error)
      throw error
    } finally {
      commit('SET_CHART_LOADING', { chartType: 'operationSuccess', loading: false })
    }
  },

  // 获取访问时段分布统计
  async getAccessTimeStats({ commit }, params) {
    commit('SET_CHART_LOADING', { chartType: 'accessTime', loading: true })
    try {
      const response = await getAccessTimeStats(params)
      commit('SET_ACCESS_TIME_DATA', response.data)
      return response
    } catch (error) {
      console.error('获取访问时段分布统计失败:', error)
      throw error
    } finally {
      commit('SET_CHART_LOADING', { chartType: 'accessTime', loading: false })
    }
  },

  // 获取异常操作统计
  async getAbnormalOperationStats({ commit }, params) {
    commit('SET_CHART_LOADING', { chartType: 'abnormalOperation', loading: true })
    try {
      const response = await getAbnormalOperationStats(params)
      commit('SET_ABNORMAL_OPERATION_DATA', response.data)
      return response
    } catch (error) {
      console.error('获取异常操作统计失败:', error)
      throw error
    } finally {
      commit('SET_CHART_LOADING', { chartType: 'abnormalOperation', loading: false })
    }
  },

  // 获取数据变更记录
  async getDataChanges({ commit }, params) {
    try {
      const response = await getDataChanges(params)
      commit('SET_DATA_CHANGES', {
        list: response.data.list || [],
        pagination: {
          current: response.data.pageNum || 1,
          pageSize: response.data.pageSize || 20,
          total: response.data.total || 0
        }
      })
      return response
    } catch (error) {
      console.error('获取数据变更记录失败:', error)
      throw error
    }
  },

  // 生成审计报告
  async generateAuditReport({ commit }, params) {
    commit('SET_REPORT_GENERATING', true)
    try {
      const response = await generateAuditReport(params)
      
      // 处理文件下载
      const blob = new Blob([response], { 
        type: 'application/pdf' 
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `审计报告_${new Date().toISOString().split('T')[0]}.${params.format || 'pdf'}`
      link.click()
      window.URL.revokeObjectURL(url)
      
      return response
    } catch (error) {
      console.error('生成审计报告失败:', error)
      throw error
    } finally {
      commit('SET_REPORT_GENERATING', false)
    }
  },

  // 获取安全告警列表
  async getSecurityAlerts({ commit }, params) {
    try {
      const response = await getSecurityAlerts(params)
      commit('SET_SECURITY_ALERTS', {
        list: response.data.list || [],
        pagination: {
          current: response.data.pageNum || 1,
          pageSize: response.data.pageSize || 20,
          total: response.data.total || 0
        }
      })
      return response
    } catch (error) {
      console.error('获取安全告警列表失败:', error)
      throw error
    }
  },

  // 处理安全告警
  async handleSecurityAlert({ dispatch }, { alertId, data }) {
    try {
      const response = await handleSecurityAlert(alertId, data)
      // 处理成功后刷新告警列表
      await dispatch('getSecurityAlerts')
      return response
    } catch (error) {
      console.error('处理安全告警失败:', error)
      throw error
    }
  },

  // 获取合规性检查结果
  async getComplianceCheck({ commit }, params) {
    try {
      const response = await getComplianceCheck(params)
      commit('SET_COMPLIANCE_CHECK_RESULT', response.data)
      return response
    } catch (error) {
      console.error('获取合规性检查结果失败:', error)
      throw error
    }
  },

  // 导出审计数据
  async exportAuditData({ commit }, params) {
    commit('SET_EXPORT_LOADING', true)
    try {
      const response = await exportAuditData(params)
      
      // 处理文件下载
      const blob = new Blob([response], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `审计数据_${new Date().toISOString().split('T')[0]}.${params.format || 'xlsx'}`
      link.click()
      window.URL.revokeObjectURL(url)
      
      return response
    } catch (error) {
      console.error('导出审计数据失败:', error)
      throw error
    } finally {
      commit('SET_EXPORT_LOADING', false)
    }
  }
}

const getters = {
  statistics: state => state.statistics,
  userActivityData: state => state.userActivityData,
  featureUsageData: state => state.featureUsageData,
  operationSuccessData: state => state.operationSuccessData,
  accessTimeData: state => state.accessTimeData,
  abnormalOperationData: state => state.abnormalOperationData,
  dataChanges: state => state.dataChanges,
  securityAlerts: state => state.securityAlerts,
  complianceCheckResult: state => state.complianceCheckResult,
  loading: state => state.loading,
  reportGenerating: state => state.reportGenerating,
  exportLoading: state => state.exportLoading,
  chartLoading: state => state.chartLoading
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}