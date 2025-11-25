/**
 * 商品性能分析模块的Vuex状态管理
 */
import {
  fetchPerformanceSummary,
  fetchProductRanking,
  fetchInventoryStatus,
  fetchCategoryAnalysis,
  fetchSalesTrend,
  fetchBrandPerformance,
  fetchProductCategories,
  fetchBrandList,
  exportPerformanceReport,
  exportPerformanceExcel
} from '@/api/productPerformance'

const state = {
  // 筛选条件
  filters: {
    dateRange: [],
    categoryIds: [],
    brandIds: [],
    priceRange: { min: 0, max: 10000 },
    status: 'all',
    groupBy: 'day'
  },

  // 性能数据
  performanceData: {
    summary: {
      totalSales: 0,
      totalOrders: 0,
      totalQuantity: 0,
      avgOrderValue: 0,
      profitMargin: 0,
      returnRate: 0
    },
    trends: [],
    topProducts: [],
    categoryAnalysis: [],
    brandPerformance: [],
    inventoryStatus: {
      summary: {
        normalStock: 0,
        lowStock: 0,
        outOfStock: 0,
        overStock: 0
      },
      details: []
    }
  },

  // 图表配置
  chartSettings: {
    salesTrend: {
      type: 'line',
      showDataZoom: true,
      animation: true
    },
    productRanking: {
      type: 'bar',
      sortBy: 'sales',
      limit: 10
    },
    categoryDistribution: {
      type: 'pie',
      showLegend: true
    },
    inventoryStatus: {
      type: 'bar',
      stacked: true
    }
  },

  // 页面状态
  loading: {
    summary: false,
    trends: false,
    ranking: false,
    category: false,
    inventory: false,
    brand: false
  },
  error: null,
  lastUpdateTime: null,

  // 基础数据
  categories: [],
  brands: []
}

const getters = {
  // 获取格式化的汇总数据
  formattedSummary: state => {
    const { summary } = state.performanceData
    return {
      totalSales: (summary.totalSales / 10000).toFixed(2) + '万',
      totalOrders: summary.totalOrders.toLocaleString(),
      totalQuantity: summary.totalQuantity.toLocaleString(),
      avgOrderValue: '¥' + summary.avgOrderValue.toFixed(2),
      profitMargin: (summary.profitMargin * 100).toFixed(2) + '%',
      returnRate: (summary.returnRate * 100).toFixed(2) + '%'
    }
  },

  // 获取当前筛选条件
  currentFilters: state => state.filters,

  // 检查是否有任何数据正在加载
  isAnyLoading: state => {
    return Object.values(state.loading).some(loading => loading)
  },

  // 获取库存预警统计
  inventorySummary: state => {
    return state.performanceData.inventoryStatus.summary
  }
}

const mutations = {
  // 更新筛选条件
  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters }
  },

  // 设置加载状态
  SET_LOADING(state, { type, loading }) {
    state.loading = { ...state.loading, [type]: loading }
  },

  // 设置错误信息
  SET_ERROR(state, error) {
    state.error = error
  },

  // 设置汇总数据
  SET_SUMMARY_DATA(state, data) {
    state.performanceData.summary = data
    state.lastUpdateTime = new Date()
  },

  // 设置趋势数据
  SET_TRENDS_DATA(state, data) {
    state.performanceData.trends = data
  },

  // 设置排行数据
  SET_RANKING_DATA(state, data) {
    state.performanceData.topProducts = data
  },

  // 设置分类分析数据
  SET_CATEGORY_DATA(state, data) {
    state.performanceData.categoryAnalysis = data
  },

  // 设置品牌表现数据
  SET_BRAND_DATA(state, data) {
    state.performanceData.brandPerformance = data
  },

  // 设置库存状态数据
  SET_INVENTORY_DATA(state, data) {
    state.performanceData.inventoryStatus = data
  },

  // 设置图表配置
  SET_CHART_SETTINGS(state, { chartType, settings }) {
    state.chartSettings = {
      ...state.chartSettings,
      [chartType]: { ...state.chartSettings[chartType], ...settings }
    }
  },

  // 设置基础数据
  SET_CATEGORIES(state, categories) {
    state.categories = categories
  },

  SET_BRANDS(state, brands) {
    state.brands = brands
  }
}

const actions = {
  // 获取所有性能数据
  async fetchAllPerformanceData({ dispatch, state }) {
    const filters = state.filters
    try {
      await Promise.all([
        dispatch('fetchSummaryData', filters),
        dispatch('fetchTrendsData', filters),
        dispatch('fetchRankingData', filters),
        dispatch('fetchCategoryData', filters),
        dispatch('fetchInventoryData', filters),
        dispatch('fetchBrandData', filters)
      ])
    } catch (error) {
      console.error('获取性能数据失败:', error)
      throw error
    }
  },

  // 获取汇总数据
  async fetchSummaryData({ commit }, filters) {
    commit('SET_LOADING', { type: 'summary', loading: true })
    try {
      const response = await fetchPerformanceSummary(filters)
      commit('SET_SUMMARY_DATA', response.data.summary)
      commit('SET_ERROR', null)
    } catch (error) {
      commit('SET_ERROR', '获取汇总数据失败')
      throw error
    } finally {
      commit('SET_LOADING', { type: 'summary', loading: false })
    }
  },

  // 获取趋势数据
  async fetchTrendsData({ commit }, filters) {
    commit('SET_LOADING', { type: 'trends', loading: true })
    try {
      const response = await fetchSalesTrend(filters)
      commit('SET_TRENDS_DATA', response.data.trends)
    } catch (error) {
      commit('SET_ERROR', '获取趋势数据失败')
      throw error
    } finally {
      commit('SET_LOADING', { type: 'trends', loading: false })
    }
  },

  // 获取排行数据
  async fetchRankingData({ commit, state }, filters) {
    commit('SET_LOADING', { type: 'ranking', loading: true })
    try {
      const params = {
        ...filters,
        sortBy: state.chartSettings.productRanking.sortBy,
        limit: state.chartSettings.productRanking.limit
      }
      const response = await fetchProductRanking(params)
      commit('SET_RANKING_DATA', response.data)
    } catch (error) {
      commit('SET_ERROR', '获取排行数据失败')
      throw error
    } finally {
      commit('SET_LOADING', { type: 'ranking', loading: false })
    }
  },

  // 获取分类分析数据
  async fetchCategoryData({ commit }, filters) {
    commit('SET_LOADING', { type: 'category', loading: true })
    try {
      const response = await fetchCategoryAnalysis(filters)
      commit('SET_CATEGORY_DATA', response.data)
    } catch (error) {
      commit('SET_ERROR', '获取分类数据失败')
      throw error
    } finally {
      commit('SET_LOADING', { type: 'category', loading: false })
    }
  },

  // 获取库存数据
  async fetchInventoryData({ commit }, filters) {
    commit('SET_LOADING', { type: 'inventory', loading: true })
    try {
      const response = await fetchInventoryStatus(filters)
      commit('SET_INVENTORY_DATA', response.data)
    } catch (error) {
      commit('SET_ERROR', '获取库存数据失败')
      throw error
    } finally {
      commit('SET_LOADING', { type: 'inventory', loading: false })
    }
  },

  // 获取品牌数据
  async fetchBrandData({ commit }, filters) {
    commit('SET_LOADING', { type: 'brand', loading: true })
    try {
      const response = await fetchBrandPerformance(filters)
      commit('SET_BRAND_DATA', response.data)
    } catch (error) {
      commit('SET_ERROR', '获取品牌数据失败')
      throw error
    } finally {
      commit('SET_LOADING', { type: 'brand', loading: false })
    }
  },

  // 更新筛选条件并刷新数据
  async updateFilters({ commit, dispatch }, filters) {
    commit('SET_FILTERS', filters)
    await dispatch('fetchAllPerformanceData')
  },

  // 更新图表设置
  updateChartSettings({ commit, dispatch }, { chartType, settings }) {
    commit('SET_CHART_SETTINGS', { chartType, settings })
    
    // 如果是排行图表设置变化，重新获取数据
    if (chartType === 'productRanking') {
      dispatch('fetchRankingData', this.state.productPerformance.filters)
    }
  },

  // 获取基础数据
  async fetchBaseData({ commit }) {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        fetchProductCategories(),
        fetchBrandList()
      ])
      commit('SET_CATEGORIES', categoriesRes.data)
      commit('SET_BRANDS', brandsRes.data)
    } catch (error) {
      console.error('获取基础数据失败:', error)
    }
  },

  // 导出报告
  async exportReport({ state }, { format, options }) {
    try {
      const params = {
        filters: state.filters,
        options: options
      }
      
      let response
      if (format === 'pdf') {
        response = await exportPerformanceReport(params)
      } else if (format === 'excel') {
        response = await exportPerformanceExcel(params)
      }
      
      // 创建下载链接
      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `商品性能分析报告_${new Date().toLocaleDateString()}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      
      return true
    } catch (error) {
      console.error('导出报告失败:', error)
      throw error
    }
  },

  // 刷新数据
  async refreshData({ dispatch, state }) {
    await dispatch('fetchAllPerformanceData')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}