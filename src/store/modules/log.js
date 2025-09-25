import {
  fetchLogList,
  fetchLogDetail,
  submitLogs,
  exportLogs,
  deleteLog,
  batchDeleteLogs,
  getLogStatistics,
  getOperationTypes,
  getModuleNames
} from '@/api/log'

const state = {
  // 日志列表数据
  logList: [],
  // 分页信息
  pagination: {
    current: 1,
    pageSize: 20,
    total: 0
  },
  // 查询条件
  searchForm: {
    username: '',
    operationType: '',
    moduleName: '',
    timeRange: [],
    ipAddress: '',
    status: ''
  },
  // 加载状态
  loading: false,
  // 导出加载状态
  exportLoading: false,
  // 当前查看的日志详情
  currentLogDetail: null,
  // 操作类型选项
  operationTypeOptions: [],
  // 模块名称选项
  moduleNameOptions: [],
  // 统计数据
  statistics: {
    totalCount: 0,
    todayCount: 0,
    successRate: 0,
    errorCount: 0,
    userCount: 0
  }
}

const mutations = {
  SET_LOG_LIST: (state, list) => {
    state.logList = list
  },
  SET_PAGINATION: (state, pagination) => {
    state.pagination = { ...state.pagination, ...pagination }
  },
  SET_SEARCH_FORM: (state, form) => {
    state.searchForm = { ...state.searchForm, ...form }
  },
  SET_LOADING: (state, loading) => {
    state.loading = loading
  },
  SET_EXPORT_LOADING: (state, loading) => {
    state.exportLoading = loading
  },
  SET_LOG_DETAIL: (state, detail) => {
    state.currentLogDetail = detail
  },
  SET_OPERATION_TYPE_OPTIONS: (state, options) => {
    state.operationTypeOptions = options
  },
  SET_MODULE_NAME_OPTIONS: (state, options) => {
    state.moduleNameOptions = options
  },
  SET_STATISTICS: (state, statistics) => {
    state.statistics = { ...state.statistics, ...statistics }
  },
  CLEAR_LOG_DATA: (state) => {
    state.logList = []
    state.currentLogDetail = null
    state.pagination = {
      current: 1,
      pageSize: 20,
      total: 0
    }
  }
}

const actions = {
  // 获取日志列表
  async fetchLogList({ commit, state }, params) {
    commit('SET_LOADING', true)
    try {
      const searchParams = {
        pageNum: state.pagination.current,
        pageSize: state.pagination.pageSize,
        ...state.searchForm,
        ...params
      }
      
      // 处理时间范围
      if (searchParams.timeRange && searchParams.timeRange.length === 2) {
        searchParams.startTime = searchParams.timeRange[0]
        searchParams.endTime = searchParams.timeRange[1]
        delete searchParams.timeRange
      }
      
      const response = await fetchLogList(searchParams)
      
      commit('SET_LOG_LIST', response.data.list || [])
      commit('SET_PAGINATION', {
        current: response.data.pageNum || 1,
        pageSize: response.data.pageSize || 20,
        total: response.data.total || 0
      })
      
      return response
    } catch (error) {
      console.error('获取日志列表失败:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 获取日志详情
  async fetchLogDetail({ commit }, logId) {
    try {
      const response = await fetchLogDetail(logId)
      commit('SET_LOG_DETAIL', response.data)
      return response
    } catch (error) {
      console.error('获取日志详情失败:', error)
      throw error
    }
  },

  // 提交日志
  async submitLogs({ commit }, logs) {
    try {
      const response = await submitLogs(logs)
      return response
    } catch (error) {
      console.error('提交日志失败:', error)
      throw error
    }
  },

  // 导出日志
  async exportLogs({ commit }, params) {
    commit('SET_EXPORT_LOADING', true)
    try {
      const response = await exportLogs(params)
      
      // 处理文件下载
      const blob = new Blob([response], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `操作日志_${new Date().toISOString().split('T')[0]}.${params.format || 'xlsx'}`
      link.click()
      window.URL.revokeObjectURL(url)
      
      return response
    } catch (error) {
      console.error('导出日志失败:', error)
      throw error
    } finally {
      commit('SET_EXPORT_LOADING', false)
    }
  },

  // 删除日志
  async deleteLog({ dispatch }, logId) {
    try {
      const response = await deleteLog(logId)
      // 删除成功后刷新列表
      await dispatch('fetchLogList')
      return response
    } catch (error) {
      console.error('删除日志失败:', error)
      throw error
    }
  },

  // 批量删除日志
  async batchDeleteLogs({ dispatch }, logIds) {
    try {
      const response = await batchDeleteLogs(logIds)
      // 删除成功后刷新列表
      await dispatch('fetchLogList')
      return response
    } catch (error) {
      console.error('批量删除日志失败:', error)
      throw error
    }
  },

  // 获取日志统计信息
  async getLogStatistics({ commit }, params) {
    try {
      const response = await getLogStatistics(params)
      commit('SET_STATISTICS', response.data)
      return response
    } catch (error) {
      console.error('获取日志统计失败:', error)
      throw error
    }
  },

  // 获取操作类型选项
  async getOperationTypes({ commit }) {
    try {
      const response = await getOperationTypes()
      commit('SET_OPERATION_TYPE_OPTIONS', response.data || [])
      return response
    } catch (error) {
      console.error('获取操作类型失败:', error)
      throw error
    }
  },

  // 获取模块名称选项
  async getModuleNames({ commit }) {
    try {
      const response = await getModuleNames()
      commit('SET_MODULE_NAME_OPTIONS', response.data || [])
      return response
    } catch (error) {
      console.error('获取模块名称失败:', error)
      throw error
    }
  },

  // 更新搜索条件
  updateSearchForm({ commit }, formData) {
    commit('SET_SEARCH_FORM', formData)
  },

  // 更新分页信息
  updatePagination({ commit }, pagination) {
    commit('SET_PAGINATION', pagination)
  },

  // 清空日志数据
  clearLogData({ commit }) {
    commit('CLEAR_LOG_DATA')
  },

  // 重置搜索表单
  resetSearchForm({ commit }) {
    commit('SET_SEARCH_FORM', {
      username: '',
      operationType: '',
      moduleName: '',
      timeRange: [],
      ipAddress: '',
      status: ''
    })
  }
}

const getters = {
  logList: state => state.logList,
  pagination: state => state.pagination,
  searchForm: state => state.searchForm,
  loading: state => state.loading,
  exportLoading: state => state.exportLoading,
  currentLogDetail: state => state.currentLogDetail,
  operationTypeOptions: state => state.operationTypeOptions,
  moduleNameOptions: state => state.moduleNameOptions,
  statistics: state => state.statistics
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}