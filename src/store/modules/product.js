import { shallowRef, shallowReactive } from 'vue'
import { fetchList as fetchProductList } from '@/api/product'

const state = () => ({
  // 使用 shallowRef 优化大数据列表的响应式性能
  productList: shallowRef([]),
  
  // 商品筛选状态
  filterState: shallowReactive({
    keyword: null,
    pageNum: 1,
    pageSize: 10,
    publishStatus: null,
    verifyStatus: null,
    productSn: null,
    productCategoryId: null,
    brandId: null
  }),
  
  // 分页信息
  pagination: shallowReactive({
    total: 0,
    pageNum: 1,
    pageSize: 10
  }),
  
  // 选中的商品
  selectedProducts: shallowRef([]),
  
  // 批量操作状态
  batchOperations: shallowReactive({
    operateType: null,
    operateIds: []
  })
})

const mutations = {
  // 更新商品列表 - 使用浅层更新
  SET_PRODUCT_LIST(state, list) {
    state.productList.value = list
  },
  
  // 更新单个商品状态 - 优化的状态更新
  UPDATE_PRODUCT_STATUS(state, { index, field, value }) {
    const products = [...state.productList.value]
    if (products[index]) {
      products[index] = { ...products[index], [field]: value }
      state.productList.value = products
    }
  },
  
  // 批量更新商品状态
  BATCH_UPDATE_PRODUCT_STATUS(state, { indices, field, value }) {
    const products = [...state.productList.value]
    indices.forEach(index => {
      if (products[index]) {
        products[index] = { ...products[index], [field]: value }
      }
    })
    state.productList.value = products
  },
  
  // 更新筛选条件
  SET_FILTER_STATE(state, filters) {
    Object.assign(state.filterState, filters)
  },
  
  // 重置筛选条件
  RESET_FILTER_STATE(state) {
    Object.assign(state.filterState, {
      keyword: null,
      pageNum: 1,
      pageSize: 10,
      publishStatus: null,
      verifyStatus: null,
      productSn: null,
      productCategoryId: null,
      brandId: null
    })
  },
  
  // 更新分页信息
  SET_PAGINATION(state, pagination) {
    Object.assign(state.pagination, pagination)
  },
  
  // 设置选中的商品
  SET_SELECTED_PRODUCTS(state, products) {
    state.selectedProducts.value = products
  },
  
  // 设置批量操作
  SET_BATCH_OPERATION(state, operation) {
    Object.assign(state.batchOperations, operation)
  }
}

const actions = {
  // 获取商品列表
  async fetchProductList({ commit, state }) {
    try {
      const response = await fetchProductList(state.filterState)
      commit('SET_PRODUCT_LIST', response.data.list)
      commit('SET_PAGINATION', {
        total: response.data.total,
        pageNum: response.data.pageNum,
        pageSize: response.data.pageSize
      })
      return response.data
    } catch (error) {
      console.error('获取商品列表失败:', error)
      throw error
    }
  },
  
  // 更新商品状态 - 乐观更新策略
  async updateProductStatus({ commit, dispatch }, { index, field, value, id }) {
    // 先更新UI状态（乐观更新）
    commit('UPDATE_PRODUCT_STATUS', { index, field, value })
    
    try {
      // 根据字段类型调用不同的API
      let updateAPI
      switch (field) {
        case 'publishStatus':
          updateAPI = import('@/api/product').then(module => module.updatePublishStatus)
          break
        case 'newStatus':
          updateAPI = import('@/api/product').then(module => module.updateNewStatus)
          break
        case 'recommandStatus':
          updateAPI = import('@/api/product').then(module => module.updateRecommendStatus)
          break
        default:
          throw new Error(`未知的状态字段: ${field}`)
      }
      
      const updateFunction = await updateAPI
      const data = new URLSearchParams()
      data.append('ids', id)
      data.append(field, value)
      
      await updateFunction(data)
    } catch (error) {
      // 如果API调用失败，回滚状态
      commit('UPDATE_PRODUCT_STATUS', { index, field, value: value === 1 ? 0 : 1 })
      throw error
    }
  },
  
  // 批量更新商品状态
  async batchUpdateProductStatus({ commit, state }, { field, value }) {
    const selectedProducts = state.selectedProducts.value
    if (!selectedProducts.length) {
      throw new Error('请先选择要操作的商品')
    }
    
    const indices = selectedProducts.map((product, index) => {
      return state.productList.value.findIndex(p => p.id === product.id)
    }).filter(index => index !== -1)
    
    // 乐观更新
    commit('BATCH_UPDATE_PRODUCT_STATUS', { indices, field, value })
    
    try {
      // 执行批量API调用
      const ids = selectedProducts.map(p => p.id)
      const data = new URLSearchParams()
      data.append('ids', ids.join(','))
      data.append(field, value)
      
      let updateAPI
      switch (field) {
        case 'publishStatus':
          updateAPI = import('@/api/product').then(module => module.updatePublishStatus)
          break
        case 'newStatus':
          updateAPI = import('@/api/product').then(module => module.updateNewStatus)
          break
        case 'recommandStatus':
          updateAPI = import('@/api/product').then(module => module.updateRecommendStatus)
          break
        default:
          throw new Error(`未知的状态字段: ${field}`)
      }
      
      const updateFunction = await updateAPI
      await updateFunction(data)
    } catch (error) {
      // 回滚状态
      commit('BATCH_UPDATE_PRODUCT_STATUS', { indices, field, value: value === 1 ? 0 : 1 })
      throw error
    }
  },
  
  // 搜索商品
  async searchProducts({ commit, dispatch }, filters) {
    commit('SET_FILTER_STATE', { ...filters, pageNum: 1 })
    return dispatch('fetchProductList')
  },
  
  // 重置搜索
  async resetSearch({ commit, dispatch }) {
    commit('RESET_FILTER_STATE')
    return dispatch('fetchProductList')
  },
  
  // 切换页码
  async changePage({ commit, dispatch }, pageNum) {
    commit('SET_FILTER_STATE', { pageNum })
    return dispatch('fetchProductList')
  },
  
  // 切换页面大小
  async changePageSize({ commit, dispatch }, pageSize) {
    commit('SET_FILTER_STATE', { pageNum: 1, pageSize })
    return dispatch('fetchProductList')
  }
}

const getters = {
  // 获取商品列表
  productList: state => state.productList.value,
  
  // 获取筛选状态
  filterState: state => state.filterState,
  
  // 获取分页信息
  pagination: state => state.pagination,
  
  // 获取选中的商品
  selectedProducts: state => state.selectedProducts.value,
  
  // 获取批量操作状态
  batchOperations: state => state.batchOperations,
  
  // 是否有选中的商品
  hasSelectedProducts: state => state.selectedProducts.value.length > 0,
  
  // 选中商品的数量
  selectedProductsCount: state => state.selectedProducts.value.length
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}