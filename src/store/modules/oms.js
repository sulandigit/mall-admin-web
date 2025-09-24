import { 
  fetchList as getOrderList,
  closeOrder,
  deleteOrder,
  deliveryOrder,
  getOrderDetail,
  updateReceiverInfo,
  updateMoneyInfo,
  updateOrderNote
} from '@/api/order'
import { 
  fetchList as getReturnApplyList,
  deleteApply as deleteReturnApply,
  updateApplyStatus as updateReturnApplyStatus,  
  getApplyDetail as getReturnApplyDetail
} from '@/api/returnApply'

const oms = {
  namespaced: true,
  state: {
    // 订单列表相关
    orders: [],
    orderListLoading: false,
    orderTotal: 0,
    orderListParams: {
      pageNum: 1,
      pageSize: 10,
      orderSn: '',
      status: null,
      createTime: [],
      receiverKeyword: ''
    },
    
    // 当前订单详情
    currentOrder: {},
    orderDetailLoading: false,
    
    // 订单统计数据
    orderStatistics: {
      totalCount: 0,
      waitPaymentCount: 0,
      waitDeliveryCount: 0,
      waitReceiveCount: 0,
      finishCount: 0,
      closeCount: 0,
      invalidCount: 0,
      totalAmount: 0,
      todayOrderCount: 0,
      todayOrderAmount: 0
    },
    statisticsLoading: false,
    
    // 退货申请相关
    returnApplies: [],
    returnApplyListLoading: false,
    returnApplyTotal: 0,
    returnApplyListParams: {
      pageNum: 1,
      pageSize: 10,
      id: null,
      receiverKeyword: '',
      status: null,
      createTime: [],
      handleMan: '',
      handleTime: []
    },
    currentReturnApply: {},
    
    // 订单状态常量
    orderStatusMap: {
      0: { text: '待付款', color: '#f56c6c' },
      1: { text: '待发货', color: '#e6a23c' },
      2: { text: '已发货', color: '#409eff' },
      3: { text: '已完成', color: '#67c23a' },
      4: { text: '已关闭', color: '#909399' },
      5: { text: '无效订单', color: '#f56c6c' }
    },
    
    // 退货申请状态常量
    returnApplyStatusMap: {
      0: { text: '待处理', color: '#e6a23c' },
      1: { text: '退货中', color: '#409eff' },
      2: { text: '已完成', color: '#67c23a' },
      3: { text: '已拒绝', color: '#f56c6c' }
    },
    
    // 缓存时间戳
    lastFetchTime: {
      orders: null,
      statistics: null,
      returnApplies: null
    }
  },
  
  mutations: {
    // 订单列表相关mutations
    SET_ORDERS: (state, orders) => {
      state.orders = orders
      state.lastFetchTime.orders = Date.now()
    },
    SET_ORDER_LIST_LOADING: (state, loading) => {
      state.orderListLoading = loading
    },
    SET_ORDER_TOTAL: (state, total) => {
      state.orderTotal = total
    },
    UPDATE_ORDER_LIST_PARAMS: (state, params) => {
      state.orderListParams = { ...state.orderListParams, ...params }
    },
    UPDATE_ORDER_IN_LIST: (state, updatedOrder) => {
      const index = state.orders.findIndex(o => o.id === updatedOrder.id)
      if (index !== -1) {
        state.orders.splice(index, 1, updatedOrder)
      }
    },
    REMOVE_ORDER_FROM_LIST: (state, orderId) => {
      const index = state.orders.findIndex(o => o.id === orderId)
      if (index !== -1) {
        state.orders.splice(index, 1)
        state.orderTotal = Math.max(0, state.orderTotal - 1)
      }
    },
    
    // 订单详情相关mutations
    SET_CURRENT_ORDER: (state, order) => {
      state.currentOrder = order
    },
    SET_ORDER_DETAIL_LOADING: (state, loading) => {
      state.orderDetailLoading = loading
    },
    
    // 订单统计相关mutations
    SET_ORDER_STATISTICS: (state, statistics) => {
      state.orderStatistics = { ...state.orderStatistics, ...statistics }
      state.lastFetchTime.statistics = Date.now()
    },
    SET_STATISTICS_LOADING: (state, loading) => {
      state.statisticsLoading = loading
    },
    
    // 退货申请相关mutations
    SET_RETURN_APPLIES: (state, applies) => {
      state.returnApplies = applies
      state.lastFetchTime.returnApplies = Date.now()
    },
    SET_RETURN_APPLY_LIST_LOADING: (state, loading) => {
      state.returnApplyListLoading = loading
    },
    SET_RETURN_APPLY_TOTAL: (state, total) => {
      state.returnApplyTotal = total
    },
    UPDATE_RETURN_APPLY_LIST_PARAMS: (state, params) => {
      state.returnApplyListParams = { ...state.returnApplyListParams, ...params }
    },
    SET_CURRENT_RETURN_APPLY: (state, apply) => {
      state.currentReturnApply = apply
    },
    UPDATE_RETURN_APPLY_IN_LIST: (state, updatedApply) => {
      const index = state.returnApplies.findIndex(a => a.id === updatedApply.id)
      if (index !== -1) {
        state.returnApplies.splice(index, 1, updatedApply)
      }
    },
    REMOVE_RETURN_APPLY_FROM_LIST: (state, applyId) => {
      const index = state.returnApplies.findIndex(a => a.id === applyId)
      if (index !== -1) {
        state.returnApplies.splice(index, 1)
        state.returnApplyTotal = Math.max(0, state.returnApplyTotal - 1)
      }
    },
    
    // 清理缓存
    CLEAR_CACHE: (state, type) => {
      if (type === 'all' || type === 'orders') {
        state.orders = []
        state.lastFetchTime.orders = null
      }
      if (type === 'all' || type === 'statistics') {
        state.lastFetchTime.statistics = null
      }
      if (type === 'all' || type === 'returnApplies') {
        state.returnApplies = []
        state.lastFetchTime.returnApplies = null
      }
    }
  },
  
  actions: {
    // 获取订单列表
    async fetchOrderList({ commit, state }, params = {}) {
      commit('SET_ORDER_LIST_LOADING', true)
      try {
        const searchParams = { ...state.orderListParams, ...params }
        commit('UPDATE_ORDER_LIST_PARAMS', params)
        
        const response = await getOrderList(searchParams)
        if (response.code === 200) {
          commit('SET_ORDERS', response.data.list || [])
          commit('SET_ORDER_TOTAL', response.data.total || 0)
          return response.data
        }
        throw new Error(response.message || '获取订单列表失败')
      } catch (error) {
        console.error('获取订单列表失败:', error)
        throw error
      } finally {
        commit('SET_ORDER_LIST_LOADING', false)
      }
    },
    
    // 获取订单详情
    async fetchOrderDetail({ commit }, orderId) {
      commit('SET_ORDER_DETAIL_LOADING', true)
      try {
        const response = await getOrderDetail(orderId)
        if (response.code === 200) {
          commit('SET_CURRENT_ORDER', response.data)
          return response.data
        }
        throw new Error(response.message || '获取订单详情失败')
      } catch (error) {
        console.error('获取订单详情失败:', error)
        throw error
      } finally {
        commit('SET_ORDER_DETAIL_LOADING', false)
      }
    },
    
    // 关闭订单
    async closeOrder({ commit, dispatch }, params) {
      try {
        const response = await closeOrder(params)
        if (response.code === 200) {
          // 关闭成功后刷新列表
          await dispatch('fetchOrderList')
          return response.data
        }
        throw new Error(response.message || '关闭订单失败')
      } catch (error) {
        console.error('关闭订单失败:', error)
        throw error
      }
    },
    
    // 删除订单
    async deleteOrder({ commit }, params) {
      try {
        const response = await deleteOrder(params)
        if (response.code === 200) {
          // 删除成功后从列表中移除
          if (params.ids && params.ids.length > 0) {
            params.ids.forEach(id => {
              commit('REMOVE_ORDER_FROM_LIST', id)
            })
          }
          return response.data
        }
        throw new Error(response.message || '删除订单失败')
      } catch (error) {
        console.error('删除订单失败:', error)
        throw error
      }
    },
    
    // 发货
    async deliverOrder({ commit, dispatch }, deliveryData) {
      try {
        const response = await deliveryOrder(deliveryData)
        if (response.code === 200) {
          // 发货成功后刷新列表
          await dispatch('fetchOrderList')
          return response.data
        }
        throw new Error(response.message || '订单发货失败')
      } catch (error) {
        console.error('订单发货失败:', error)
        throw error
      }
    },
    
    // 更新收货人信息
    async updateOrderReceiverInfo({ commit, dispatch }, receiverData) {
      try {
        const response = await updateReceiverInfo(receiverData)
        if (response.code === 200) {
          // 更新成功后刷新当前订单详情
          if (receiverData.orderId) {
            await dispatch('fetchOrderDetail', receiverData.orderId)
          }
          return response.data
        }
        throw new Error(response.message || '更新收货人信息失败')
      } catch (error) {
        console.error('更新收货人信息失败:', error)
        throw error
      }
    },
    
    // 更新订单费用信息
    async updateOrderMoneyInfo({ commit, dispatch }, moneyData) {
      try {
        const response = await updateMoneyInfo(moneyData)
        if (response.code === 200) {
          // 更新成功后刷新当前订单详情
          if (moneyData.orderId) {
            await dispatch('fetchOrderDetail', moneyData.orderId)
          }
          return response.data
        }
        throw new Error(response.message || '更新订单费用信息失败')
      } catch (error) {
        console.error('更新订单费用信息失败:', error)
        throw error
      }
    },
    
    // 更新订单备注
    async updateOrderNote({ commit, dispatch }, params) {
      try {
        const response = await updateOrderNote(params)
        if (response.code === 200) {
          // 更新成功后刷新列表
          await dispatch('fetchOrderList')
          return response.data
        }
        throw new Error(response.message || '更新订单备注失败')
      } catch (error) {
        console.error('更新订单备注失败:', error)
        throw error
      }
    },
    
    // 获取退货申请列表
    async fetchReturnApplyList({ commit, state }, params = {}) {
      commit('SET_RETURN_APPLY_LIST_LOADING', true)
      try {
        const searchParams = { ...state.returnApplyListParams, ...params }
        commit('UPDATE_RETURN_APPLY_LIST_PARAMS', params)
        
        const response = await getReturnApplyList(searchParams)
        if (response.code === 200) {
          commit('SET_RETURN_APPLIES', response.data.list || [])
          commit('SET_RETURN_APPLY_TOTAL', response.data.total || 0)
          return response.data
        }
        throw new Error(response.message || '获取退货申请列表失败')
      } catch (error) {
        console.error('获取退货申请列表失败:', error)
        throw error
      } finally {
        commit('SET_RETURN_APPLY_LIST_LOADING', false)
      }
    },
    
    // 获取退货申请详情
    async fetchReturnApplyDetail({ commit }, applyId) {
      try {
        const response = await getReturnApplyDetail(applyId)
        if (response.code === 200) {
          commit('SET_CURRENT_RETURN_APPLY', response.data)
          return response.data
        }
        throw new Error(response.message || '获取退货申请详情失败')
      } catch (error) {
        console.error('获取退货申请详情失败:', error)
        throw error
      }
    },
    
    // 处理退货申请
    async updateReturnApplyStatus({ commit, dispatch }, { id, statusData }) {
      try {
        const response = await updateReturnApplyStatus(id, statusData)
        if (response.code === 200) {
          // 处理成功后刷新列表
          await dispatch('fetchReturnApplyList')
          return response.data
        }
        throw new Error(response.message || '处理退货申请失败')
      } catch (error) {
        console.error('处理退货申请失败:', error)
        throw error
      }
    },
    
    // 删除退货申请
    async deleteReturnApply({ commit }, params) {
      try {
        const response = await deleteReturnApply(params)
        if (response.code === 200) {
          // 删除成功后从列表中移除
          if (params.ids && params.ids.length > 0) {
            params.ids.forEach(id => {
              commit('REMOVE_RETURN_APPLY_FROM_LIST', id)
            })
          }
          return response.data
        }
        throw new Error(response.message || '删除退货申请失败')
      } catch (error) {
        console.error('删除退货申请失败:', error)
        throw error
      }
    },
    
    // 清理缓存
    clearCache({ commit }, type = 'all') {
      commit('CLEAR_CACHE', type)
    },
    
    // 重置搜索参数
    resetOrderSearchParams({ commit }) {
      commit('UPDATE_ORDER_LIST_PARAMS', {
        pageNum: 1,
        pageSize: 10,
        orderSn: '',
        status: null,
        createTime: [],
        receiverKeyword: ''
      })
    },
    
    resetReturnApplySearchParams({ commit }) {
      commit('UPDATE_RETURN_APPLY_LIST_PARAMS', {
        pageNum: 1,
        pageSize: 10,
        id: null,
        receiverKeyword: '',
        status: null,
        createTime: [],
        handleMan: '',
        handleTime: []
      })
    }
  },
  
  getters: {
    // 订单相关getters
    orders: state => state.orders,
    orderListLoading: state => state.orderListLoading,
    orderTotal: state => state.orderTotal,
    orderListParams: state => state.orderListParams,
    currentOrder: state => state.currentOrder,
    orderDetailLoading: state => state.orderDetailLoading,
    
    // 订单统计getters
    orderStatistics: state => state.orderStatistics,
    statisticsLoading: state => state.statisticsLoading,
    
    // 退货申请getters
    returnApplies: state => state.returnApplies,
    returnApplyListLoading: state => state.returnApplyListLoading,
    returnApplyTotal: state => state.returnApplyTotal,
    returnApplyListParams: state => state.returnApplyListParams,
    currentReturnApply: state => state.currentReturnApply,
    
    // 状态映射getters
    orderStatusMap: state => state.orderStatusMap,
    returnApplyStatusMap: state => state.returnApplyStatusMap,
    
    // 根据状态过滤订单
    ordersByStatus: (state) => (status) => {
      if (status === null || status === undefined) return state.orders
      return state.orders.filter(order => order.status === status)
    },
    
    // 根据状态过滤退货申请
    returnAppliesByStatus: (state) => (status) => {
      if (status === null || status === undefined) return state.returnApplies
      return state.returnApplies.filter(apply => apply.status === status)
    },
    
    // 获取订单状态文本
    getOrderStatusText: (state) => (status) => {
      return state.orderStatusMap[status]?.text || '未知状态'
    },
    
    // 获取退货申请状态文本
    getReturnApplyStatusText: (state) => (status) => {
      return state.returnApplyStatusMap[status]?.text || '未知状态'
    },
    
    // 根据ID获取订单
    getOrderById: (state) => (id) => {
      return state.orders.find(order => order.id === id)
    },
    
    // 根据ID获取退货申请
    getReturnApplyById: (state) => (id) => {
      return state.returnApplies.find(apply => apply.id === id)
    },
    
    // 今日订单统计
    todayOrderStats: (state) => ({
      count: state.orderStatistics.todayOrderCount || 0,
      amount: state.orderStatistics.todayOrderAmount || 0
    }),
    
    // 待处理订单数量
    pendingOrdersCount: (state) => {
      const waitPayment = state.orderStatistics.waitPaymentCount || 0
      const waitDelivery = state.orderStatistics.waitDeliveryCount || 0
      return waitPayment + waitDelivery
    },
    
    // 缓存状态
    cacheStatus: state => ({
      orders: {
        hasCache: state.orders.length > 0,
        lastFetch: state.lastFetchTime.orders,
        age: state.lastFetchTime.orders ? Date.now() - state.lastFetchTime.orders : null
      },
      returnApplies: {
        hasCache: state.returnApplies.length > 0,
        lastFetch: state.lastFetchTime.returnApplies,
        age: state.lastFetchTime.returnApplies ? Date.now() - state.lastFetchTime.returnApplies : null
      }
    })
  }
}

export default oms