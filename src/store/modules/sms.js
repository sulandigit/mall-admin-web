import { 
  fetchList as getCouponList,
  createCoupon,
  getCoupon,
  updateCoupon,
  deleteCoupon 
} from '@/api/coupon'
import { 
  fetchList as getFlashSaleList,
  createFlash,
  updateFlash,
  deleteFlash,
  updateStatus as updateFlashStatus
} from '@/api/flash'
import { 
  fetchList as getAdvertiseList,
  createHomeAdvertise,
  getHomeAdvertise,
  updateHomeAdvertise,
  deleteHomeAdvertise,
  updateStatus as updateAdvertiseStatus
} from '@/api/homeAdvertise'
import { 
  fetchList as getSubjectList,
  fetchListAll as getAllSubjects
} from '@/api/subject'

const sms = {
  namespaced: true,
  state: {
    // 优惠券相关
    coupons: [],
    couponListLoading: false,
    couponTotal: 0,
    couponListParams: {
      pageNum: 1,
      pageSize: 10,
      name: '',
      type: null,
      status: null
    },
    currentCoupon: {},
    
    // 秒杀活动相关
    flashSales: [],
    flashSaleListLoading: false,
    flashSaleTotal: 0,
    flashSaleListParams: {
      pageNum: 1,
      pageSize: 10,
      keyword: ''
    },
    currentFlashSale: {},
    
    // 广告管理相关
    advertisements: [],
    advertisementListLoading: false,
    advertisementTotal: 0,
    advertisementListParams: {
      pageNum: 1,
      pageSize: 10,
      name: '',
      type: null,
      endTime: []
    },
    currentAdvertisement: {},
    
    // 专题推荐相关
    subjects: [],
    subjectListLoading: false,
    subjectTotal: 0,
    subjectListParams: {
      pageNum: 1,
      pageSize: 10,
      keyword: ''
    },
    allSubjects: [], // 所有专题列表，用于选择器
    currentSubject: {},
    
    // 营销活动统计
    marketingStatistics: {
      activeCouponsCount: 0,
      activeFlashSalesCount: 0,
      activeAdvertisementsCount: 0,
      totalCouponsUsed: 0,
      totalFlashSalesOrders: 0,
      advertisementClickRate: 0
    },
    
    // 优惠券类型常量
    couponTypeMap: {
      0: { text: '全场通用', color: '#67c23a' },
      1: { text: '指定分类', color: '#409eff' },
      2: { text: '指定商品', color: '#e6a23c' }
    },
    
    // 优惠券状态常量  
    couponStatusMap: {
      0: { text: '未发布', color: '#909399' },
      1: { text: '已发布', color: '#67c23a' },
      2: { text: '已过期', color: '#f56c6c' }
    },
    
    // 广告类型常量
    advertisementTypeMap: {
      0: { text: '首页轮播', color: '#409eff' },
      1: { text: '首页广告', color: '#67c23a' },
      2: { text: '推荐广告', color: '#e6a23c' }
    },
    
    // 缓存时间戳
    lastFetchTime: {
      coupons: null,
      flashSales: null,
      advertisements: null,
      subjects: null
    }
  },
  
  mutations: {
    // 优惠券相关mutations
    SET_COUPONS: (state, coupons) => {
      state.coupons = coupons
      state.lastFetchTime.coupons = Date.now()
    },
    SET_COUPON_LIST_LOADING: (state, loading) => {
      state.couponListLoading = loading
    },
    SET_COUPON_TOTAL: (state, total) => {
      state.couponTotal = total
    },
    UPDATE_COUPON_LIST_PARAMS: (state, params) => {
      state.couponListParams = { ...state.couponListParams, ...params }
    },
    SET_CURRENT_COUPON: (state, coupon) => {
      state.currentCoupon = coupon
    },
    UPDATE_COUPON_IN_LIST: (state, updatedCoupon) => {
      const index = state.coupons.findIndex(c => c.id === updatedCoupon.id)
      if (index !== -1) {
        state.coupons.splice(index, 1, updatedCoupon)
      }
    },
    REMOVE_COUPON_FROM_LIST: (state, couponId) => {
      const index = state.coupons.findIndex(c => c.id === couponId)
      if (index !== -1) {
        state.coupons.splice(index, 1)
        state.couponTotal = Math.max(0, state.couponTotal - 1)
      }
    },
    
    // 秒杀活动相关mutations
    SET_FLASH_SALES: (state, flashSales) => {
      state.flashSales = flashSales
      state.lastFetchTime.flashSales = Date.now()
    },
    SET_FLASH_SALE_LIST_LOADING: (state, loading) => {
      state.flashSaleListLoading = loading
    },
    SET_FLASH_SALE_TOTAL: (state, total) => {
      state.flashSaleTotal = total
    },
    UPDATE_FLASH_SALE_LIST_PARAMS: (state, params) => {
      state.flashSaleListParams = { ...state.flashSaleListParams, ...params }
    },
    SET_CURRENT_FLASH_SALE: (state, flashSale) => {
      state.currentFlashSale = flashSale
    },
    UPDATE_FLASH_SALE_IN_LIST: (state, updatedFlashSale) => {
      const index = state.flashSales.findIndex(f => f.id === updatedFlashSale.id)
      if (index !== -1) {
        state.flashSales.splice(index, 1, updatedFlashSale)
      }
    },
    REMOVE_FLASH_SALE_FROM_LIST: (state, flashSaleId) => {
      const index = state.flashSales.findIndex(f => f.id === flashSaleId)
      if (index !== -1) {
        state.flashSales.splice(index, 1)
        state.flashSaleTotal = Math.max(0, state.flashSaleTotal - 1)
      }
    },
    
    // 广告相关mutations
    SET_ADVERTISEMENTS: (state, advertisements) => {
      state.advertisements = advertisements
      state.lastFetchTime.advertisements = Date.now()
    },
    SET_ADVERTISEMENT_LIST_LOADING: (state, loading) => {
      state.advertisementListLoading = loading
    },
    SET_ADVERTISEMENT_TOTAL: (state, total) => {
      state.advertisementTotal = total
    },
    UPDATE_ADVERTISEMENT_LIST_PARAMS: (state, params) => {
      state.advertisementListParams = { ...state.advertisementListParams, ...params }
    },
    SET_CURRENT_ADVERTISEMENT: (state, advertisement) => {
      state.currentAdvertisement = advertisement
    },
    UPDATE_ADVERTISEMENT_IN_LIST: (state, updatedAdvertisement) => {
      const index = state.advertisements.findIndex(a => a.id === updatedAdvertisement.id)
      if (index !== -1) {
        state.advertisements.splice(index, 1, updatedAdvertisement)
      }
    },
    REMOVE_ADVERTISEMENT_FROM_LIST: (state, advertisementId) => {
      const index = state.advertisements.findIndex(a => a.id === advertisementId)
      if (index !== -1) {
        state.advertisements.splice(index, 1)
        state.advertisementTotal = Math.max(0, state.advertisementTotal - 1)
      }
    },
    
    // 专题相关mutations
    SET_SUBJECTS: (state, subjects) => {
      state.subjects = subjects
      state.lastFetchTime.subjects = Date.now()
    },
    SET_ALL_SUBJECTS: (state, subjects) => {
      state.allSubjects = subjects
    },
    SET_SUBJECT_LIST_LOADING: (state, loading) => {
      state.subjectListLoading = loading
    },
    SET_SUBJECT_TOTAL: (state, total) => {
      state.subjectTotal = total
    },
    UPDATE_SUBJECT_LIST_PARAMS: (state, params) => {
      state.subjectListParams = { ...state.subjectListParams, ...params }
    },
    SET_CURRENT_SUBJECT: (state, subject) => {
      state.currentSubject = subject
    },
    
    // 营销统计相关mutations
    SET_MARKETING_STATISTICS: (state, statistics) => {
      state.marketingStatistics = { ...state.marketingStatistics, ...statistics }
    },
    
    // 清理缓存
    CLEAR_CACHE: (state, type) => {
      if (type === 'all' || type === 'coupons') {
        state.coupons = []
        state.lastFetchTime.coupons = null
      }
      if (type === 'all' || type === 'flashSales') {
        state.flashSales = []
        state.lastFetchTime.flashSales = null
      }
      if (type === 'all' || type === 'advertisements') {
        state.advertisements = []
        state.lastFetchTime.advertisements = null
      }
      if (type === 'all' || type === 'subjects') {
        state.subjects = []
        state.lastFetchTime.subjects = null
      }
    }
  },
  
  actions: {
    // 获取优惠券列表
    async fetchCouponList({ commit, state }, params = {}) {
      commit('SET_COUPON_LIST_LOADING', true)
      try {
        const searchParams = { ...state.couponListParams, ...params }
        commit('UPDATE_COUPON_LIST_PARAMS', params)
        
        const response = await getCouponList(searchParams)
        if (response.code === 200) {
          commit('SET_COUPONS', response.data.list || [])
          commit('SET_COUPON_TOTAL', response.data.total || 0)
          return response.data
        }
        throw new Error(response.message || '获取优惠券列表失败')
      } catch (error) {
        console.error('获取优惠券列表失败:', error)
        throw error
      } finally {
        commit('SET_COUPON_LIST_LOADING', false)
      }
    },
    
    // 获取优惠券详情
    async fetchCouponDetail({ commit }, couponId) {
      try {
        const response = await getCoupon(couponId)
        if (response.code === 200) {
          commit('SET_CURRENT_COUPON', response.data)
          return response.data
        }
        throw new Error(response.message || '获取优惠券详情失败')
      } catch (error) {
        console.error('获取优惠券详情失败:', error)
        throw error
      }
    },
    
    // 创建优惠券
    async createCoupon({ dispatch }, couponData) {
      try {
        const response = await createCoupon(couponData)
        if (response.code === 200) {
          // 创建成功后刷新列表
          await dispatch('fetchCouponList')
          return response.data
        }
        throw new Error(response.message || '创建优惠券失败')
      } catch (error) {
        console.error('创建优惠券失败:', error)
        throw error
      }
    },
    
    // 更新优惠券
    async updateCoupon({ dispatch }, { id, couponData }) {
      try {
        const response = await updateCoupon(id, couponData)
        if (response.code === 200) {
          // 更新成功后刷新列表
          await dispatch('fetchCouponList')
          return response.data
        }
        throw new Error(response.message || '更新优惠券失败')
      } catch (error) {
        console.error('更新优惠券失败:', error)
        throw error
      }
    },
    
    // 删除优惠券
    async deleteCoupon({ commit }, couponId) {
      try {
        const response = await deleteCoupon(couponId)
        if (response.code === 200) {
          // 删除成功后从列表中移除
          commit('REMOVE_COUPON_FROM_LIST', couponId)
          return response.data
        }
        throw new Error(response.message || '删除优惠券失败')
      } catch (error) {
        console.error('删除优惠券失败:', error)
        throw error
      }
    },
    
    // 获取秒杀活动列表
    async fetchFlashSaleList({ commit, state }, params = {}) {
      commit('SET_FLASH_SALE_LIST_LOADING', true)
      try {
        const searchParams = { ...state.flashSaleListParams, ...params }
        commit('UPDATE_FLASH_SALE_LIST_PARAMS', params)
        
        const response = await getFlashSaleList(searchParams)
        if (response.code === 200) {
          commit('SET_FLASH_SALES', response.data.list || [])
          commit('SET_FLASH_SALE_TOTAL', response.data.total || 0)
          return response.data
        }
        throw new Error(response.message || '获取秒杀活动列表失败')
      } catch (error) {
        console.error('获取秒杀活动列表失败:', error)
        throw error
      } finally {
        commit('SET_FLASH_SALE_LIST_LOADING', false)
      }
    },
    
    // 创建秒杀活动
    async createFlashSale({ dispatch }, flashSaleData) {
      try {
        const response = await createFlash(flashSaleData)
        if (response.code === 200) {
          // 创建成功后刷新列表
          await dispatch('fetchFlashSaleList')
          return response.data
        }
        throw new Error(response.message || '创建秒杀活动失败')
      } catch (error) {
        console.error('创建秒杀活动失败:', error)
        throw error
      }
    },
    
    // 更新秒杀活动
    async updateFlashSale({ dispatch }, { id, flashSaleData }) {
      try {
        const response = await updateFlash(id, flashSaleData)
        if (response.code === 200) {
          // 更新成功后刷新列表
          await dispatch('fetchFlashSaleList')
          return response.data
        }
        throw new Error(response.message || '更新秒杀活动失败')
      } catch (error) {
        console.error('更新秒杀活动失败:', error)
        throw error
      }
    },
    
    // 更新秒杀活动状态
    async updateFlashSaleStatus({ dispatch }, { id, params }) {
      try {
        const response = await updateFlashStatus(id, params)
        if (response.code === 200) {
          // 状态更新成功后刷新列表
          await dispatch('fetchFlashSaleList')
          return response.data
        }
        throw new Error(response.message || '更新秒杀活动状态失败')
      } catch (error) {
        console.error('更新秒杀活动状态失败:', error)
        throw error
      }
    },
    
    // 删除秒杀活动
    async deleteFlashSale({ commit }, flashSaleId) {
      try {
        const response = await deleteFlash(flashSaleId)
        if (response.code === 200) {
          // 删除成功后从列表中移除
          commit('REMOVE_FLASH_SALE_FROM_LIST', flashSaleId)
          return response.data
        }
        throw new Error(response.message || '删除秒杀活动失败')
      } catch (error) {
        console.error('删除秒杀活动失败:', error)
        throw error
      }
    },
    
    // 获取广告列表
    async fetchAdvertisementList({ commit, state }, params = {}) {
      commit('SET_ADVERTISEMENT_LIST_LOADING', true)
      try {
        const searchParams = { ...state.advertisementListParams, ...params }
        commit('UPDATE_ADVERTISEMENT_LIST_PARAMS', params)
        
        const response = await getAdvertiseList(searchParams)
        if (response.code === 200) {
          commit('SET_ADVERTISEMENTS', response.data.list || [])
          commit('SET_ADVERTISEMENT_TOTAL', response.data.total || 0)
          return response.data
        }
        throw new Error(response.message || '获取广告列表失败')
      } catch (error) {
        console.error('获取广告列表失败:', error)
        throw error
      } finally {
        commit('SET_ADVERTISEMENT_LIST_LOADING', false)
      }
    },
    
    // 获取广告详情
    async fetchAdvertisementDetail({ commit }, advertisementId) {
      try {
        const response = await getHomeAdvertise(advertisementId)
        if (response.code === 200) {
          commit('SET_CURRENT_ADVERTISEMENT', response.data)
          return response.data
        }
        throw new Error(response.message || '获取广告详情失败')
      } catch (error) {
        console.error('获取广告详情失败:', error)
        throw error
      }
    },
    
    // 创建广告
    async createAdvertisement({ dispatch }, advertisementData) {
      try {
        const response = await createHomeAdvertise(advertisementData)
        if (response.code === 200) {
          // 创建成功后刷新列表
          await dispatch('fetchAdvertisementList')
          return response.data
        }
        throw new Error(response.message || '创建广告失败')
      } catch (error) {
        console.error('创建广告失败:', error)
        throw error
      }
    },
    
    // 更新广告
    async updateAdvertisement({ dispatch }, { id, advertisementData }) {
      try {
        const response = await updateHomeAdvertise(id, advertisementData)
        if (response.code === 200) {
          // 更新成功后刷新列表
          await dispatch('fetchAdvertisementList')
          return response.data
        }
        throw new Error(response.message || '更新广告失败')
      } catch (error) {
        console.error('更新广告失败:', error)
        throw error
      }
    },
    
    // 更新广告状态
    async updateAdvertisementStatus({ dispatch }, { id, params }) {
      try {
        const response = await updateAdvertiseStatus(id, params)
        if (response.code === 200) {
          // 状态更新成功后刷新列表
          await dispatch('fetchAdvertisementList')
          return response.data
        }
        throw new Error(response.message || '更新广告状态失败')
      } catch (error) {
        console.error('更新广告状态失败:', error)
        throw error
      }
    },
    
    // 删除广告
    async deleteAdvertisement({ commit }, data) {
      try {
        const response = await deleteHomeAdvertise(data)
        if (response.code === 200) {
          // 删除成功后刷新列表
          if (data.ids && data.ids.length > 0) {
            data.ids.forEach(id => {
              commit('REMOVE_ADVERTISEMENT_FROM_LIST', id)
            })
          }
          return response.data
        }
        throw new Error(response.message || '删除广告失败')
      } catch (error) {
        console.error('删除广告失败:', error)
        throw error
      }
    },
    
    // 获取专题列表
    async fetchSubjectList({ commit, state }, params = {}) {
      commit('SET_SUBJECT_LIST_LOADING', true)
      try {
        const searchParams = { ...state.subjectListParams, ...params }
        commit('UPDATE_SUBJECT_LIST_PARAMS', params)
        
        const response = await getSubjectList(searchParams)
        if (response.code === 200) {
          commit('SET_SUBJECTS', response.data.list || [])
          commit('SET_SUBJECT_TOTAL', response.data.total || 0)
          return response.data
        }
        throw new Error(response.message || '获取专题列表失败')
      } catch (error) {
        console.error('获取专题列表失败:', error)
        throw error
      } finally {
        commit('SET_SUBJECT_LIST_LOADING', false)
      }
    },
    
    // 获取所有专题（用于选择器）
    async fetchAllSubjects({ commit, state }, forceRefresh = false) {
      const now = Date.now()
      const lastFetch = state.lastFetchTime.subjects
      const cacheExpiry = 10 * 60 * 1000 // 10分钟缓存
      
      if (!forceRefresh && lastFetch && (now - lastFetch < cacheExpiry) && state.allSubjects.length > 0) {
        return state.allSubjects
      }
      
      try {
        const response = await getAllSubjects()
        if (response.code === 200) {
          commit('SET_ALL_SUBJECTS', response.data || [])
          return response.data
        }
        throw new Error(response.message || '获取所有专题失败')
      } catch (error) {
        console.error('获取所有专题失败:', error)
        throw error
      }
    },
    
    // 清理缓存
    clearCache({ commit }, type = 'all') {
      commit('CLEAR_CACHE', type)
    },
    
    // 重置搜索参数
    resetCouponSearchParams({ commit }) {
      commit('UPDATE_COUPON_LIST_PARAMS', {
        pageNum: 1,
        pageSize: 10,
        name: '',
        type: null,
        status: null
      })
    },
    
    resetFlashSaleSearchParams({ commit }) {
      commit('UPDATE_FLASH_SALE_LIST_PARAMS', {
        pageNum: 1,
        pageSize: 10,
        keyword: ''
      })
    },
    
    resetAdvertisementSearchParams({ commit }) {
      commit('UPDATE_ADVERTISEMENT_LIST_PARAMS', {
        pageNum: 1,
        pageSize: 10,
        name: '',
        type: null,
        endTime: []
      })
    },
    
    resetSubjectSearchParams({ commit }) {
      commit('UPDATE_SUBJECT_LIST_PARAMS', {
        pageNum: 1,
        pageSize: 10,
        keyword: ''
      })
    }
  },
  
  getters: {
    // 优惠券相关getters
    coupons: state => state.coupons,
    couponListLoading: state => state.couponListLoading,
    couponTotal: state => state.couponTotal,
    couponListParams: state => state.couponListParams,
    currentCoupon: state => state.currentCoupon,
    
    // 秒杀活动相关getters
    flashSales: state => state.flashSales,
    flashSaleListLoading: state => state.flashSaleListLoading,
    flashSaleTotal: state => state.flashSaleTotal,
    flashSaleListParams: state => state.flashSaleListParams,
    currentFlashSale: state => state.currentFlashSale,
    
    // 广告相关getters
    advertisements: state => state.advertisements,
    advertisementListLoading: state => state.advertisementListLoading,
    advertisementTotal: state => state.advertisementTotal,
    advertisementListParams: state => state.advertisementListParams,
    currentAdvertisement: state => state.currentAdvertisement,
    
    // 专题相关getters
    subjects: state => state.subjects,
    subjectListLoading: state => state.subjectListLoading,
    subjectTotal: state => state.subjectTotal,
    subjectListParams: state => state.subjectListParams,
    allSubjects: state => state.allSubjects,
    currentSubject: state => state.currentSubject,
    subjectOptions: state => state.allSubjects.map(subject => ({
      label: subject.title,
      value: subject.id
    })),
    
    // 营销统计getters
    marketingStatistics: state => state.marketingStatistics,
    
    // 状态映射getters
    couponTypeMap: state => state.couponTypeMap,
    couponStatusMap: state => state.couponStatusMap,
    advertisementTypeMap: state => state.advertisementTypeMap,
    
    // 根据类型过滤优惠券
    couponsByType: (state) => (type) => {
      if (type === null || type === undefined) return state.coupons
      return state.coupons.filter(coupon => coupon.type === type)
    },
    
    // 根据状态过滤优惠券
    couponsByStatus: (state) => (status) => {
      if (status === null || status === undefined) return state.coupons
      return state.coupons.filter(coupon => coupon.status === status)
    },
    
    // 活跃的营销活动数量
    activeMarketingCount: (state) => {
      const activeCoupons = state.coupons.filter(coupon => coupon.status === 1).length
      const activeFlashSales = state.flashSales.filter(flash => flash.status === 1).length
      const activeAdvertisements = state.advertisements.filter(ad => ad.status === 1).length
      
      return {
        coupons: activeCoupons,
        flashSales: activeFlashSales,
        advertisements: activeAdvertisements,
        total: activeCoupons + activeFlashSales + activeAdvertisements
      }
    },
    
    // 根据ID获取优惠券
    getCouponById: (state) => (id) => {
      return state.coupons.find(coupon => coupon.id === id)
    },
    
    // 根据ID获取秒杀活动
    getFlashSaleById: (state) => (id) => {
      return state.flashSales.find(flash => flash.id === id)
    },
    
    // 根据ID获取广告
    getAdvertisementById: (state) => (id) => {
      return state.advertisements.find(ad => ad.id === id)
    },
    
    // 根据ID获取专题
    getSubjectById: (state) => (id) => {
      return state.subjects.find(subject => subject.id === id)
    },
    
    // 缓存状态
    cacheStatus: state => ({
      coupons: {
        hasCache: state.coupons.length > 0,
        lastFetch: state.lastFetchTime.coupons,
        age: state.lastFetchTime.coupons ? Date.now() - state.lastFetchTime.coupons : null
      },
      flashSales: {
        hasCache: state.flashSales.length > 0,
        lastFetch: state.lastFetchTime.flashSales,
        age: state.lastFetchTime.flashSales ? Date.now() - state.lastFetchTime.flashSales : null
      },
      advertisements: {
        hasCache: state.advertisements.length > 0,
        lastFetch: state.lastFetchTime.advertisements,
        age: state.lastFetchTime.advertisements ? Date.now() - state.lastFetchTime.advertisements : null
      },
      subjects: {
        hasCache: state.subjects.length > 0,
        lastFetch: state.lastFetchTime.subjects,
        age: state.lastFetchTime.subjects ? Date.now() - state.lastFetchTime.subjects : null
      }
    })
  }
}

export default sms