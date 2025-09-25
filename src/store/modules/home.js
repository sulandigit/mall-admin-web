import { fetchList } from '@/api/homeAdvertise'

const state = {
  // 轮播图数据
  carouselImages: [],
  // 加载状态
  carouselLoading: false,
  // 错误信息
  carouselError: null,
  // 数据最后更新时间
  lastUpdateTime: null
}

const mutations = {
  /**
   * 设置轮播图数据
   */
  SET_CAROUSEL_IMAGES(state, images) {
    state.carouselImages = images || []
    state.lastUpdateTime = new Date().getTime()
  },
  
  /**
   * 设置加载状态
   */
  SET_CAROUSEL_LOADING(state, loading) {
    state.carouselLoading = loading
  },
  
  /**
   * 设置错误信息
   */
  SET_CAROUSEL_ERROR(state, error) {
    state.carouselError = error
  },
  
  /**
   * 清除错误状态
   */
  CLEAR_CAROUSEL_ERROR(state) {
    state.carouselError = null
  }
}

const actions = {
  /**
   * 获取轮播图数据
   */
  async fetchCarouselImages({ commit, state }, { forceRefresh = false } = {}) {
    // 如果有缓存且未强制刷新，检查缓存是否过期（5分钟）
    const cacheExpireTime = 5 * 60 * 1000 // 5分钟
    const now = new Date().getTime()
    
    if (!forceRefresh && 
        state.carouselImages.length > 0 && 
        state.lastUpdateTime && 
        (now - state.lastUpdateTime) < cacheExpireTime) {
      return state.carouselImages
    }
    
    commit('SET_CAROUSEL_LOADING', true)
    commit('CLEAR_CAROUSEL_ERROR')
    
    try {
      // 调用API获取轮播图数据
      const params = {
        type: 0, // PC首页轮播
        pageNum: 1,
        pageSize: 10
      }
      
      const response = await fetchList(params)
      
      if (response && response.data) {
        let images = response.data.list || []
        
        // 过滤和处理数据
        images = images
          .filter(item => {
            // 过滤上线状态的广告
            if (item.status !== 1) return false
            
            // 验证时间范围
            const now = new Date()
            const startTime = item.startTime ? new Date(item.startTime) : null
            const endTime = item.endTime ? new Date(item.endTime) : null
            
            if (startTime && now < startTime) return false
            if (endTime && now > endTime) return false
            
            // 必须有图片
            return !!item.pic
          })
          .sort((a, b) => (a.sort || 0) - (b.sort || 0)) // 按排序字段排序
          .map(item => ({
            id: item.id,
            name: item.name || '',
            pic: item.pic,
            url: item.url || '',
            sort: item.sort || 0,
            startTime: item.startTime,
            endTime: item.endTime
          }))
        
        commit('SET_CAROUSEL_IMAGES', images)
        return images
      } else {
        throw new Error('数据格式错误')
      }
    } catch (error) {
      console.error('获取轮播图数据失败:', error)
      const errorMessage = error.message || '获取轮播图数据失败'
      commit('SET_CAROUSEL_ERROR', errorMessage)
      
      // 如果是网络错误，返回空数组而不是抛出异常
      if (error.code === 'NETWORK_ERROR' || error.message.includes('timeout')) {
        commit('SET_CAROUSEL_IMAGES', [])
        return []
      }
      
      throw error
    } finally {
      commit('SET_CAROUSEL_LOADING', false)
    }
  },
  
  /**
   * 清除错误状态
   */
  clearCarouselError({ commit }) {
    commit('CLEAR_CAROUSEL_ERROR')
  },
  
  /**
   * 重新加载轮播图数据
   */
  async reloadCarouselImages({ dispatch }) {
    return dispatch('fetchCarouselImages', { forceRefresh: true })
  }
}

const getters = {
  /**
   * 获取有效的轮播图数据
   */
  validCarouselImages: state => {
    return state.carouselImages.filter(item => {
      // 再次验证时间范围（防止缓存过期）
      const now = new Date()
      const startTime = item.startTime ? new Date(item.startTime) : null
      const endTime = item.endTime ? new Date(item.endTime) : null
      
      if (startTime && now < startTime) return false
      if (endTime && now > endTime) return false
      
      return true
    })
  },
  
  /**
   * 是否有轮播图数据
   */
  hasCarouselImages: (state, getters) => {
    return getters.validCarouselImages.length > 0
  },
  
  /**
   * 轮播图数量
   */
  carouselImageCount: (state, getters) => {
    return getters.validCarouselImages.length
  },
  
  /**
   * 是否正在加载
   */
  isCarouselLoading: state => {
    return state.carouselLoading
  },
  
  /**
   * 是否有错误
   */
  hasCarouselError: state => {
    return !!state.carouselError
  },
  
  /**
   * 错误信息
   */
  carouselErrorMessage: state => {
    return state.carouselError
  },
  
  /**
   * 数据是否需要刷新
   */
  shouldRefreshCarousel: state => {
    const cacheExpireTime = 5 * 60 * 1000 // 5分钟
    const now = new Date().getTime()
    
    return !state.lastUpdateTime || 
           (now - state.lastUpdateTime) > cacheExpireTime
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}