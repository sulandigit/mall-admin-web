import { fetchTurnoverList, fetchTurnoverTrend } from '@/api/inventoryTurnover'

const state = {
  // 报表数据
  turnoverList: [],
  trendData: {
    categories: [],
    series: []
  },
  summaryStats: {
    totalProducts: 0,
    averageTurnoverRate: 0,
    fastMovingCount: 0,
    slowMovingCount: 0,
    totalInventoryValue: 0,
    highRiskInventory: 0
  },
  
  // 查询条件
  filterParams: {
    dateRange: [],
    startDate: '',
    endDate: '',
    categoryId: null,
    brandId: null,
    turnoverLevel: null,
    keyword: ''
  },
  
  // 分页信息
  pagination: {
    pageNum: 1,
    pageSize: 20,
    total: 0
  },
  
  // 排序信息
  sortInfo: {
    sortField: 'turnoverRate',
    sortOrder: 'desc'
  },
  
  // 加载状态
  loading: {
    table: false,
    chart: false,
    export: false
  }
}

const mutations = {
  SET_TURNOVER_LIST(state, data) {
    state.turnoverList = data.list || []
    state.pagination.total = data.total || 0
    if (data.summary) {
      state.summaryStats = data.summary
    }
  },
  
  SET_TREND_DATA(state, data) {
    state.trendData = {
      categories: data.categories || [],
      series: data.series || []
    }
  },
  
  UPDATE_FILTER_PARAMS(state, params) {
    state.filterParams = { ...state.filterParams, ...params }
  },
  
  UPDATE_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...pagination }
  },
  
  UPDATE_SORT_INFO(state, sortInfo) {
    state.sortInfo = { ...state.sortInfo, ...sortInfo }
  },
  
  SET_LOADING(state, { type, status }) {
    if (state.loading.hasOwnProperty(type)) {
      state.loading[type] = status
    }
  },
  
  RESET_FILTER_PARAMS(state) {
    state.filterParams = {
      dateRange: [],
      startDate: '',
      endDate: '',
      categoryId: null,
      brandId: null,
      turnoverLevel: null,
      keyword: ''
    }
  }
}

const actions = {
  // 获取周转率列表数据
  async fetchTurnoverList({ commit, state }) {
    commit('SET_LOADING', { type: 'table', status: true })
    try {
      const params = {
        ...state.filterParams,
        ...state.pagination,
        ...state.sortInfo
      }
      
      // 处理日期范围
      if (state.filterParams.dateRange && state.filterParams.dateRange.length === 2) {
        params.startDate = state.filterParams.dateRange[0]
        params.endDate = state.filterParams.dateRange[1]
      }
      
      const response = await fetchTurnoverList(params)
      if (response.code === 200) {
        commit('SET_TURNOVER_LIST', response.data)
      }
      return response
    } catch (error) {
      console.error('获取库存周转率列表失败:', error)
      throw error
    } finally {
      commit('SET_LOADING', { type: 'table', status: false })
    }
  },
  
  // 获取趋势数据
  async fetchTrendData({ commit, state }, granularity = 'month') {
    commit('SET_LOADING', { type: 'chart', status: true })
    try {
      const params = {
        startDate: state.filterParams.startDate,
        endDate: state.filterParams.endDate,
        granularity: granularity,
        categoryIds: state.filterParams.categoryId ? String(state.filterParams.categoryId) : ''
      }
      
      // 处理日期范围
      if (state.filterParams.dateRange && state.filterParams.dateRange.length === 2) {
        params.startDate = state.filterParams.dateRange[0]
        params.endDate = state.filterParams.dateRange[1]
      }
      
      const response = await fetchTurnoverTrend(params)
      if (response.code === 200) {
        commit('SET_TREND_DATA', response.data)
      }
      return response
    } catch (error) {
      console.error('获取库存周转率趋势失败:', error)
      throw error
    } finally {
      commit('SET_LOADING', { type: 'chart', status: false })
    }
  },
  
  // 更新筛选条件
  updateFilterParams({ commit }, params) {
    commit('UPDATE_FILTER_PARAMS', params)
  },
  
  // 更新分页信息
  updatePagination({ commit }, pagination) {
    commit('UPDATE_PAGINATION', pagination)
  },
  
  // 更新排序信息
  updateSortInfo({ commit }, sortInfo) {
    commit('UPDATE_SORT_INFO', sortInfo)
  },
  
  // 重置筛选条件
  resetFilterParams({ commit }) {
    commit('RESET_FILTER_PARAMS')
    commit('UPDATE_PAGINATION', { pageNum: 1 })
  }
}

const getters = {
  // 是否有数据
  hasData: state => state.turnoverList.length > 0,
  
  // 是否正在加载
  isLoading: state => state.loading.table || state.loading.chart,
  
  // 获取当前页数据
  currentPageData: state => state.turnoverList,
  
  // 获取汇总统计
  summaryStatistics: state => state.summaryStats,
  
  // 获取趋势图表数据
  chartData: state => state.trendData
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}