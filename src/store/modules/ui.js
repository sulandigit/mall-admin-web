import { shallowReactive } from 'vue'

const state = () => ({
  // 全局加载状态
  loading: shallowReactive({
    productList: false,
    productDetail: false,
    brandList: false,
    categoryList: false,
    batchOperation: false
  }),
  
  // 弹窗状态
  modals: shallowReactive({
    editSku: {
      visible: false,
      productId: null,
      productSn: '',
      productAttributeCategoryId: null,
      stockList: [],
      productAttr: [],
      keyword: null
    },
    selectProduct: {
      visible: false,
      data: {
        list: [],
        total: 0,
        listQuery: {
          pageNum: 1,
          pageSize: 5,
          keyword: null
        }
      }
    },
    sortDialog: {
      visible: false,
      data: {
        sort: null
      }
    },
    verifyDetail: {
      visible: false,
      data: null
    }
  }),
  
  // 错误状态
  errors: shallowReactive({
    lastError: null,
    errorHistory: []
  }),
  
  // 用户交互状态
  interaction: shallowReactive({
    lastAction: null,
    actionHistory: [],
    isProcessing: false
  })
})

const mutations = {
  // 设置加载状态
  SET_LOADING(state, { key, value }) {
    state.loading[key] = value
  },
  
  // 批量设置加载状态
  SET_MULTIPLE_LOADING(state, loadingStates) {
    Object.assign(state.loading, loadingStates)
  },
  
  // 设置弹窗状态
  SET_MODAL_STATE(state, { modalName, data }) {
    if (state.modals[modalName]) {
      Object.assign(state.modals[modalName], data)
    }
  },
  
  // 显示弹窗
  SHOW_MODAL(state, modalName) {
    if (state.modals[modalName]) {
      state.modals[modalName].visible = true
    }
  },
  
  // 隐藏弹窗
  HIDE_MODAL(state, modalName) {
    if (state.modals[modalName]) {
      state.modals[modalName].visible = false
    }
  },
  
  // 隐藏所有弹窗
  HIDE_ALL_MODALS(state) {
    Object.keys(state.modals).forEach(modalName => {
      state.modals[modalName].visible = false
    })
  },
  
  // 设置错误
  SET_ERROR(state, error) {
    state.errors.lastError = error
    state.errors.errorHistory.unshift({
      error,
      timestamp: Date.now()
    })
    
    // 只保留最近10个错误
    if (state.errors.errorHistory.length > 10) {
      state.errors.errorHistory = state.errors.errorHistory.slice(0, 10)
    }
  },
  
  // 清除错误
  CLEAR_ERROR(state) {
    state.errors.lastError = null
  },
  
  // 记录用户交互
  RECORD_INTERACTION(state, action) {
    state.interaction.lastAction = action
    state.interaction.actionHistory.unshift({
      action,
      timestamp: Date.now()
    })
    
    // 只保留最近20个交互记录
    if (state.interaction.actionHistory.length > 20) {
      state.interaction.actionHistory = state.interaction.actionHistory.slice(0, 20)
    }
  },
  
  // 设置处理状态
  SET_PROCESSING(state, isProcessing) {
    state.interaction.isProcessing = isProcessing
  }
}

const actions = {
  // 显示加载状态
  showLoading({ commit }, key) {
    commit('SET_LOADING', { key, value: true })
  },
  
  // 隐藏加载状态
  hideLoading({ commit }, key) {
    commit('SET_LOADING', { key, value: false })
  },
  
  // 显示弹窗
  showModal({ commit }, { modalName, data = {} }) {
    commit('SET_MODAL_STATE', { modalName, data })
    commit('SHOW_MODAL', modalName)
    commit('RECORD_INTERACTION', `show_modal_${modalName}`)
  },
  
  // 隐藏弹窗
  hideModal({ commit }, modalName) {
    commit('HIDE_MODAL', modalName)
    commit('RECORD_INTERACTION', `hide_modal_${modalName}`)
  },
  
  // 处理错误
  handleError({ commit }, error) {
    commit('SET_ERROR', error)
    console.error('应用错误:', error)
  },
  
  // 清除错误
  clearError({ commit }) {
    commit('CLEAR_ERROR')
  },
  
  // 开始处理
  startProcessing({ commit }, action) {
    commit('SET_PROCESSING', true)
    commit('RECORD_INTERACTION', action)
  },
  
  // 结束处理
  endProcessing({ commit }) {
    commit('SET_PROCESSING', false)
  }
}

const getters = {
  // 获取加载状态
  isLoading: state => key => state.loading[key] || false,
  
  // 是否有任何加载状态
  hasAnyLoading: state => Object.values(state.loading).some(loading => loading),
  
  // 获取弹窗状态
  getModal: state => modalName => state.modals[modalName] || null,
  
  // 是否有弹窗显示
  hasVisibleModal: state => Object.values(state.modals).some(modal => modal.visible),
  
  // 获取最后的错误
  lastError: state => state.errors.lastError,
  
  // 是否有错误
  hasError: state => !!state.errors.lastError,
  
  // 是否正在处理
  isProcessing: state => state.interaction.isProcessing,
  
  // 获取最后的交互
  lastInteraction: state => state.interaction.lastAction
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}