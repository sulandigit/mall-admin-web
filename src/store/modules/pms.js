import { 
  fetchList as getProductList, 
  createProduct, 
  updateProduct, 
  getProduct,
  updateDeleteStatus,
  updateNewStatus,
  updateRecommendStatus,
  updatePublishStatus
} from '@/api/product'
import { 
  fetchList as getBrandList 
} from '@/api/brand'
import { 
  fetchListWithChildren as getCategoryList 
} from '@/api/productCate'
import { 
  fetchListWithAttr as getAttributeCategoryList 
} from '@/api/productAttrCate'

const pms = {
  namespaced: true,
  state: {
    // 商品相关
    products: [],
    productListLoading: false,
    productTotal: 0,
    currentProduct: {},
    productListParams: {
      pageNum: 1,
      pageSize: 10,
      keyword: '',
      brandId: null,
      productCategoryId: null,
      publishStatus: null
    },
    
    // 商品分类
    categories: [],
    categoriesLoading: false,
    currentCategory: {},
    
    // 品牌相关
    brands: [],
    brandsLoading: false,
    currentBrand: {},
    
    // 商品属性
    attributes: [],
    attributeCategories: [],
    currentAttribute: {},
    
    // 缓存时间戳
    lastFetchTime: {
      products: null,
      categories: null,
      brands: null,
      attributes: null
    }
  },
  
  mutations: {
    // 商品相关mutations
    SET_PRODUCTS: (state, products) => {
      state.products = products
      state.lastFetchTime.products = Date.now()
    },
    SET_PRODUCT_LIST_LOADING: (state, loading) => {
      state.productListLoading = loading
    },
    SET_PRODUCT_TOTAL: (state, total) => {
      state.productTotal = total
    },
    SET_CURRENT_PRODUCT: (state, product) => {
      state.currentProduct = product
    },
    UPDATE_PRODUCT_LIST_PARAMS: (state, params) => {
      state.productListParams = { ...state.productListParams, ...params }
    },
    UPDATE_PRODUCT_IN_LIST: (state, updatedProduct) => {
      const index = state.products.findIndex(p => p.id === updatedProduct.id)
      if (index !== -1) {
        state.products.splice(index, 1, updatedProduct)
      }
    },
    REMOVE_PRODUCT_FROM_LIST: (state, productId) => {
      const index = state.products.findIndex(p => p.id === productId)
      if (index !== -1) {
        state.products.splice(index, 1)
        state.productTotal = Math.max(0, state.productTotal - 1)
      }
    },
    
    // 分类相关mutations
    SET_CATEGORIES: (state, categories) => {
      state.categories = categories
      state.lastFetchTime.categories = Date.now()
    },
    SET_CATEGORIES_LOADING: (state, loading) => {
      state.categoriesLoading = loading
    },
    SET_CURRENT_CATEGORY: (state, category) => {
      state.currentCategory = category
    },
    
    // 品牌相关mutations
    SET_BRANDS: (state, brands) => {
      state.brands = brands
      state.lastFetchTime.brands = Date.now()
    },
    SET_BRANDS_LOADING: (state, loading) => {
      state.brandsLoading = loading
    },
    SET_CURRENT_BRAND: (state, brand) => {
      state.currentBrand = brand
    },
    
    // 属性相关mutations
    SET_ATTRIBUTES: (state, attributes) => {
      state.attributes = attributes
      state.lastFetchTime.attributes = Date.now()
    },
    SET_ATTRIBUTE_CATEGORIES: (state, categories) => {
      state.attributeCategories = categories
    },
    SET_CURRENT_ATTRIBUTE: (state, attribute) => {
      state.currentAttribute = attribute
    },
    
    // 清理缓存
    CLEAR_CACHE: (state, type) => {
      if (type === 'all' || type === 'products') {
        state.products = []
        state.lastFetchTime.products = null
      }
      if (type === 'all' || type === 'categories') {
        state.categories = []
        state.lastFetchTime.categories = null
      }
      if (type === 'all' || type === 'brands') {
        state.brands = []
        state.lastFetchTime.brands = null
      }
      if (type === 'all' || type === 'attributes') {
        state.attributes = []
        state.lastFetchTime.attributes = null
      }
    }
  },
  
  actions: {
    // 获取商品列表
    async fetchProductList({ commit, state }, params = {}) {
      commit('SET_PRODUCT_LIST_LOADING', true)
      try {
        const searchParams = { ...state.productListParams, ...params }
        commit('UPDATE_PRODUCT_LIST_PARAMS', params)
        
        const response = await getProductList(searchParams)
        if (response.code === 200) {
          commit('SET_PRODUCTS', response.data.list || [])
          commit('SET_PRODUCT_TOTAL', response.data.total || 0)
          return response.data
        }
        throw new Error(response.message || '获取商品列表失败')
      } catch (error) {
        console.error('获取商品列表失败:', error)
        throw error
      } finally {
        commit('SET_PRODUCT_LIST_LOADING', false)
      }
    },
    
    // 获取商品详情
    async fetchProductDetail({ commit }, productId) {
      try {
        const response = await getProduct(productId)
        if (response.code === 200) {
          commit('SET_CURRENT_PRODUCT', response.data)
          return response.data
        }
        throw new Error(response.message || '获取商品详情失败')
      } catch (error) {
        console.error('获取商品详情失败:', error)
        throw error
      }
    },
    
    // 创建商品
    async createProduct({ dispatch }, productData) {
      try {
        const response = await createProduct(productData)
        if (response.code === 200) {
          // 创建成功后刷新列表
          await dispatch('fetchProductList')
          return response.data
        }
        throw new Error(response.message || '创建商品失败')
      } catch (error) {
        console.error('创建商品失败:', error)
        throw error
      }
    },
    
    // 更新商品
    async updateProduct({ commit, dispatch }, { id, productData }) {
      try {
        const response = await updateProduct(id, productData)
        if (response.code === 200) {
          // 更新成功后刷新列表
          await dispatch('fetchProductList')
          return response.data
        }
        throw new Error(response.message || '更新商品失败')
      } catch (error) {
        console.error('更新商品失败:', error)
        throw error
      }
    },
    
    // 批量更新商品状态
    async batchUpdateProductStatus({ commit, dispatch }, { type, params }) {
      try {
        let response
        switch (type) {
          case 'delete':
            response = await updateDeleteStatus(params)
            break
          case 'new':
            response = await updateNewStatus(params)
            break
          case 'recommend':
            response = await updateRecommendStatus(params)
            break
          case 'publish':
            response = await updatePublishStatus(params)
            break
          default:
            throw new Error('未知的状态更新类型')
        }
        
        if (response.code === 200) {
          // 状态更新成功后刷新列表
          await dispatch('fetchProductList')
          return response.data
        }
        throw new Error(response.message || '更新商品状态失败')
      } catch (error) {
        console.error('更新商品状态失败:', error)
        throw error
      }
    },
    
    // 获取商品分类列表（带缓存）
    async fetchCategories({ commit, state }, forceRefresh = false) {
      const now = Date.now()
      const lastFetch = state.lastFetchTime.categories
      const cacheExpiry = 5 * 60 * 1000 // 5分钟缓存
      
      if (!forceRefresh && lastFetch && (now - lastFetch < cacheExpiry) && state.categories.length > 0) {
        return state.categories
      }
      
      commit('SET_CATEGORIES_LOADING', true)
      try {
        const response = await getCategoryList()
        if (response.code === 200) {
          commit('SET_CATEGORIES', response.data || [])
          return response.data
        }
        throw new Error(response.message || '获取商品分类失败')
      } catch (error) {
        console.error('获取商品分类失败:', error)
        throw error
      } finally {
        commit('SET_CATEGORIES_LOADING', false)
      }
    },
    
    // 获取品牌列表（带缓存）
    async fetchBrands({ commit, state }, forceRefresh = false) {
      const now = Date.now()
      const lastFetch = state.lastFetchTime.brands
      const cacheExpiry = 5 * 60 * 1000 // 5分钟缓存
      
      if (!forceRefresh && lastFetch && (now - lastFetch < cacheExpiry) && state.brands.length > 0) {
        return state.brands
      }
      
      commit('SET_BRANDS_LOADING', true)
      try {
        const response = await getBrandList({ pageNum: 1, pageSize: 100 })
        if (response.code === 200) {
          commit('SET_BRANDS', response.data.list || [])
          return response.data.list
        }
        throw new Error(response.message || '获取品牌列表失败')
      } catch (error) {
        console.error('获取品牌列表失败:', error)
        throw error
      } finally {
        commit('SET_BRANDS_LOADING', false)
      }
    },
    
    // 获取属性分类列表
    async fetchAttributeCategories({ commit }) {
      try {
        const response = await getAttributeCategoryList()
        if (response.code === 200) {
          commit('SET_ATTRIBUTE_CATEGORIES', response.data || [])
          return response.data
        }
        throw new Error(response.message || '获取属性分类失败')
      } catch (error) {
        console.error('获取属性分类失败:', error)
        throw error
      }
    },
    
    // 清理缓存
    clearCache({ commit }, type = 'all') {
      commit('CLEAR_CACHE', type)
    },
    
    // 重置搜索参数
    resetSearchParams({ commit }) {
      commit('UPDATE_PRODUCT_LIST_PARAMS', {
        pageNum: 1,
        pageSize: 10,
        keyword: '',
        brandId: null,
        productCategoryId: null,
        publishStatus: null
      })
    }
  },
  
  getters: {
    // 商品相关getters
    products: state => state.products,
    productListLoading: state => state.productListLoading,
    productTotal: state => state.productTotal,
    currentProduct: state => state.currentProduct,
    productListParams: state => state.productListParams,
    
    // 分类相关getters
    categories: state => state.categories,
    categoriesLoading: state => state.categoriesLoading,
    categoryTree: state => {
      // 构建分类树结构
      const buildTree = (categories, parentId = 0) => {
        return categories
          .filter(cat => cat.parentId === parentId)
          .map(cat => ({
            ...cat,
            children: buildTree(categories, cat.id)
          }))
      }
      return buildTree(state.categories)
    },
    
    // 品牌相关getters
    brands: state => state.brands,
    brandsLoading: state => state.brandsLoading,
    brandOptions: state => state.brands.map(brand => ({
      label: brand.name,
      value: brand.id
    })),
    
    // 属性相关getters
    attributes: state => state.attributes,
    attributeCategories: state => state.attributeCategories,
    
    // 筛选后的商品列表
    filteredProducts: (state) => (filters = {}) => {
      let filtered = [...state.products]
      
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase()
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(keyword) ||
          product.keywords?.toLowerCase().includes(keyword)
        )
      }
      
      if (filters.brandId) {
        filtered = filtered.filter(product => product.brandId === filters.brandId)
      }
      
      if (filters.categoryId) {
        filtered = filtered.filter(product => product.productCategoryId === filters.categoryId)
      }
      
      if (filters.publishStatus !== null && filters.publishStatus !== undefined) {
        filtered = filtered.filter(product => product.publishStatus === filters.publishStatus)
      }
      
      return filtered
    },
    
    // 根据ID获取商品
    getProductById: (state) => (id) => {
      return state.products.find(product => product.id === id)
    },
    
    // 根据ID获取品牌
    getBrandById: (state) => (id) => {
      return state.brands.find(brand => brand.id === id)
    },
    
    // 根据ID获取分类
    getCategoryById: (state) => (id) => {
      return state.categories.find(category => category.id === id)
    },
    
    // 缓存状态
    cacheStatus: state => ({
      products: {
        hasCache: state.products.length > 0,
        lastFetch: state.lastFetchTime.products,
        age: state.lastFetchTime.products ? Date.now() - state.lastFetchTime.products : null
      },
      categories: {
        hasCache: state.categories.length > 0,
        lastFetch: state.lastFetchTime.categories,
        age: state.lastFetchTime.categories ? Date.now() - state.lastFetchTime.categories : null
      },
      brands: {
        hasCache: state.brands.length > 0,
        lastFetch: state.lastFetchTime.brands,
        age: state.lastFetchTime.brands ? Date.now() - state.lastFetchTime.brands : null
      }
    })
  }
}

export default pms