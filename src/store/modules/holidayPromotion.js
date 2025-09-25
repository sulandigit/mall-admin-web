import {
  getPromotionConfig,
  savePromotionConfig,
  getHolidayCoupons,
  receiveCoupon,
  getPromotionProducts,
  updateBannerConfig,
  getUserReceivedCoupons,
  checkCouponStock
} from '@/api/holidayPromotion'

const holidayPromotion = {
  state: {
    // 促销活动配置信息
    promotionConfig: {
      id: '',
      title: '双11狂欢节',
      description: '双11全场大促，优惠券满天飞！',
      startTime: null,
      endTime: null,
      status: 0,
      bannerImage: '',
      bannerLink: ''
    },
    // 横幅配置
    bannerSettings: {
      image: '',
      title: '双11狂欢节',
      subtitle: '全场5折起，优惠券免费领',
      link: '',
      showCountdown: true
    },
    // 可领取的优惠券列表
    couponList: [],
    // 用户已领取的优惠券
    userReceivedCoupons: [],
    // 参与促销的商品列表
    promotionProducts: [],
    // 活动结束时间
    countdownEndTime: null,
    // 数据加载状态
    isLoading: false,
    // 是否为配置模式
    isConfigMode: false,
    // 优惠券领取状态
    couponReceiveStatus: {},
    // 分页信息
    pagination: {
      pageNum: 1,
      pageSize: 10,
      total: 0
    }
  },

  mutations: {
    SET_PROMOTION_CONFIG: (state, config) => {
      state.promotionConfig = { ...state.promotionConfig, ...config }
    },
    SET_BANNER_SETTINGS: (state, settings) => {
      state.bannerSettings = { ...state.bannerSettings, ...settings }
    },
    SET_COUPON_LIST: (state, list) => {
      state.couponList = list
    },
    SET_USER_RECEIVED_COUPONS: (state, coupons) => {
      state.userReceivedCoupons = coupons
    },
    SET_PROMOTION_PRODUCTS: (state, products) => {
      state.promotionProducts = products
    },
    SET_COUNTDOWN_END_TIME: (state, time) => {
      state.countdownEndTime = time
    },
    SET_LOADING: (state, loading) => {
      state.isLoading = loading
    },
    SET_CONFIG_MODE: (state, mode) => {
      state.isConfigMode = mode
    },
    SET_COUPON_RECEIVE_STATUS: (state, { couponId, status }) => {
      state.couponReceiveStatus = {
        ...state.couponReceiveStatus,
        [couponId]: status
      }
    },
    SET_PAGINATION: (state, pagination) => {
      state.pagination = { ...state.pagination, ...pagination }
    },
    ADD_RECEIVED_COUPON: (state, coupon) => {
      state.userReceivedCoupons.push(coupon)
    },
    UPDATE_COUPON_STOCK: (state, { couponId, remainStock }) => {
      const coupon = state.couponList.find(c => c.id === couponId)
      if (coupon) {
        coupon.remainStock = remainStock
      }
    }
  },

  actions: {
    // 获取促销活动配置
    fetchPromotionConfig({ commit }) {
      commit('SET_LOADING', true)
      return new Promise((resolve, reject) => {
        getPromotionConfig().then(response => {
          const config = response.data
          commit('SET_PROMOTION_CONFIG', config)
          commit('SET_COUNTDOWN_END_TIME', config.endTime)
          commit('SET_LOADING', false)
          resolve(response)
        }).catch(error => {
          commit('SET_LOADING', false)
          reject(error)
        })
      })
    },

    // 更新促销活动配置
    updatePromotionConfig({ commit }, config) {
      return new Promise((resolve, reject) => {
        savePromotionConfig(config).then(response => {
          commit('SET_PROMOTION_CONFIG', config)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取优惠券列表
    fetchCouponList({ commit, state }, params = {}) {
      commit('SET_LOADING', true)
      const queryParams = {
        pageNum: state.pagination.pageNum,
        pageSize: state.pagination.pageSize,
        ...params
      }
      return new Promise((resolve, reject) => {
        getHolidayCoupons(queryParams).then(response => {
          commit('SET_COUPON_LIST', response.data.list)
          commit('SET_PAGINATION', {
            pageNum: response.data.pageNum,
            pageSize: response.data.pageSize,
            total: response.data.total
          })
          commit('SET_LOADING', false)
          resolve(response)
        }).catch(error => {
          commit('SET_LOADING', false)
          reject(error)
        })
      })
    },

    // 用户领取优惠券
    receiveCoupon({ commit, state }, { couponId, userId }) {
      commit('SET_COUPON_RECEIVE_STATUS', { couponId, status: 'receiving' })
      return new Promise((resolve, reject) => {
        receiveCoupon({ couponId, userId }).then(response => {
          commit('SET_COUPON_RECEIVE_STATUS', { couponId, status: 'received' })
          commit('ADD_RECEIVED_COUPON', response.data)
          // 更新优惠券库存
          const coupon = state.couponList.find(c => c.id === couponId)
          if (coupon && coupon.remainStock > 0) {
            commit('UPDATE_COUPON_STOCK', { 
              couponId, 
              remainStock: coupon.remainStock - 1 
            })
          }
          resolve(response)
        }).catch(error => {
          commit('SET_COUPON_RECEIVE_STATUS', { couponId, status: 'error' })
          reject(error)
        })
      })
    },

    // 获取用户已领取的优惠券
    fetchUserReceivedCoupons({ commit }, userId) {
      return new Promise((resolve, reject) => {
        getUserReceivedCoupons(userId).then(response => {
          commit('SET_USER_RECEIVED_COUPONS', response.data)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取促销商品列表
    fetchPromotionProducts({ commit }, params) {
      commit('SET_LOADING', true)
      return new Promise((resolve, reject) => {
        getPromotionProducts(params).then(response => {
          commit('SET_PROMOTION_PRODUCTS', response.data)
          commit('SET_LOADING', false)
          resolve(response)
        }).catch(error => {
          commit('SET_LOADING', false)
          reject(error)
        })
      })
    },

    // 切换配置/预览模式
    toggleConfigMode({ commit, state }) {
      commit('SET_CONFIG_MODE', !state.isConfigMode)
    },

    // 更新横幅配置
    updateBannerSettings({ commit }, settings) {
      return new Promise((resolve, reject) => {
        updateBannerConfig(settings).then(response => {
          commit('SET_BANNER_SETTINGS', settings)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 重置状态
    resetState({ commit }) {
      commit('SET_COUPON_LIST', [])
      commit('SET_USER_RECEIVED_COUPONS', [])
      commit('SET_PROMOTION_PRODUCTS', [])
      commit('SET_LOADING', false)
      commit('SET_CONFIG_MODE', false)
    }
  }
}

export default holidayPromotion