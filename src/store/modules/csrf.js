/**
 * Vuex CSRF状态管理模块
 * 管理CSRF令牌的全局状态
 */
import { getCSRFManager, initCSRF } from '@/security'

/**
 * CSRF状态类型常量
 */
export const CSRF_MUTATION_TYPES = {
  SET_TOKEN: 'SET_CSRF_TOKEN',
  CLEAR_TOKEN: 'CLEAR_CSRF_TOKEN',
  SET_STRATEGY: 'SET_CSRF_STRATEGY',
  SET_ENABLED: 'SET_CSRF_ENABLED',
  INCREMENT_REQUEST_COUNT: 'INCREMENT_REQUEST_COUNT',
  SET_LAST_REFRESH: 'SET_LAST_REFRESH',
  SET_ERROR: 'SET_CSRF_ERROR',
  CLEAR_ERROR: 'CLEAR_CSRF_ERROR'
}

export const CSRF_ACTION_TYPES = {
  INIT: 'initCSRF',
  GENERATE_TOKEN: 'generateCSRFToken',
  REFRESH_TOKEN: 'refreshCSRFToken',
  VALIDATE_TOKEN: 'validateCSRFToken',
  CLEAR_TOKEN: 'clearCSRFToken',
  HANDLE_ERROR: 'handleCSRFError',
  UPDATE_CONFIG: 'updateCSRFConfig'
}

/**
 * 初始状态
 */
const initialState = {
  // 令牌信息
  token: null,
  tokenExpires: 0,
  tokenTimestamp: 0,
  
  // 配置信息
  strategy: 'double-submit',
  enabled: true,
  autoRefresh: true,
  
  // 统计信息
  requestCount: 0,
  lastRefresh: 0,
  
  // 错误信息
  lastError: null,
  errorCount: 0,
  
  // 状态信息
  initialized: false,
  refreshing: false
}

/**
 * State
 */
const state = {
  ...initialState
}

/**
 * Getters
 */
const getters = {
  // 基本信息获取器
  csrfToken: state => state.token,
  csrfEnabled: state => state.enabled,
  csrfStrategy: state => state.strategy,
  csrfInitialized: state => state.initialized,
  
  // 状态检查器
  hasValidToken: state => {
    return state.token && state.tokenExpires > Date.now()
  },
  
  isTokenExpired: state => {
    return state.tokenExpires > 0 && state.tokenExpires <= Date.now()
  },
  
  needsRefresh: state => {
    if (!state.token || !state.autoRefresh) return false
    const now = Date.now()
    const refreshThreshold = 5 * 60 * 1000 // 5分钟
    return state.tokenExpires - now <= refreshThreshold
  },
  
  // 统计信息获取器
  csrfStats: state => ({
    requestCount: state.requestCount,
    lastRefresh: state.lastRefresh,
    errorCount: state.errorCount,
    tokenAge: state.tokenTimestamp ? Date.now() - state.tokenTimestamp : 0
  }),
  
  // 错误信息获取器
  csrfError: state => state.lastError,
  hasError: state => !!state.lastError
}

/**
 * Mutations
 */
const mutations = {
  [CSRF_MUTATION_TYPES.SET_TOKEN](state, payload) {
    const { token, expires, timestamp } = payload
    state.token = token
    state.tokenExpires = expires || (Date.now() + 3600000) // 默认1小时
    state.tokenTimestamp = timestamp || Date.now()
    state.lastError = null
  },
  
  [CSRF_MUTATION_TYPES.CLEAR_TOKEN](state) {
    state.token = null
    state.tokenExpires = 0
    state.tokenTimestamp = 0
  },
  
  [CSRF_MUTATION_TYPES.SET_STRATEGY](state, strategy) {
    state.strategy = strategy
  },
  
  [CSRF_MUTATION_TYPES.SET_ENABLED](state, enabled) {
    state.enabled = enabled
  },
  
  [CSRF_MUTATION_TYPES.INCREMENT_REQUEST_COUNT](state) {
    state.requestCount += 1
  },
  
  [CSRF_MUTATION_TYPES.SET_LAST_REFRESH](state, timestamp) {
    state.lastRefresh = timestamp || Date.now()
    state.refreshing = false
  },
  
  [CSRF_MUTATION_TYPES.SET_ERROR](state, error) {
    state.lastError = error
    state.errorCount += 1
  },
  
  [CSRF_MUTATION_TYPES.CLEAR_ERROR](state) {
    state.lastError = null
  },
  
  // 设置初始化状态
  SET_INITIALIZED(state, initialized) {
    state.initialized = initialized
  },
  
  // 设置刷新状态
  SET_REFRESHING(state, refreshing) {
    state.refreshing = refreshing
  },
  
  // 重置状态
  RESET_CSRF_STATE(state) {
    Object.assign(state, initialState)
  }
}

/**
 * Actions
 */
const actions = {
  /**
   * 初始化CSRF
   */
  async [CSRF_ACTION_TYPES.INIT]({ commit }, config = {}) {
    try {
      commit('CLEAR_CSRF_ERROR')
      
      // 初始化CSRF管理器
      const csrfManager = initCSRF({
        debug: process.env.NODE_ENV === 'development',
        ...config
      })
      
      // 更新状态
      commit('SET_INITIALIZED', true)
      
      // 尝试加载现有令牌
      const existingToken = await csrfManager.getToken()
      if (existingToken) {
        commit(CSRF_MUTATION_TYPES.SET_TOKEN, {
          token: existingToken,
          timestamp: Date.now()
        })
      }
      
      return true
    } catch (error) {
      commit(CSRF_MUTATION_TYPES.SET_ERROR, {
        message: 'CSRF initialization failed',
        code: 'INIT_FAILED',
        originalError: error
      })
      throw error
    }
  },
  
  /**
   * 生成新的CSRF令牌
   */
  async [CSRF_ACTION_TYPES.GENERATE_TOKEN]({ commit, state }, options = {}) {
    try {
      if (!state.initialized) {
        throw new Error('CSRF not initialized')
      }
      
      const csrfManager = getCSRFManager()
      const token = await csrfManager.generateToken(options)
      
      commit(CSRF_MUTATION_TYPES.SET_TOKEN, {
        token,
        timestamp: Date.now(),
        expires: Date.now() + (options.expireTime || 3600000)
      })
      
      return token
    } catch (error) {
      commit(CSRF_MUTATION_TYPES.SET_ERROR, {
        message: 'Token generation failed',
        code: 'GENERATION_FAILED',
        originalError: error
      })
      throw error
    }
  },
  
  /**
   * 刷新CSRF令牌
   */
  async [CSRF_ACTION_TYPES.REFRESH_TOKEN]({ commit, state }, options = {}) {
    try {
      if (!state.initialized || state.refreshing) {
        return state.token
      }
      
      commit('SET_REFRESHING', true)
      
      const csrfManager = getCSRFManager()
      const newToken = await csrfManager.refreshToken(options)
      
      commit(CSRF_MUTATION_TYPES.SET_TOKEN, {
        token: newToken,
        timestamp: Date.now(),
        expires: Date.now() + (options.expireTime || 3600000)
      })
      commit(CSRF_MUTATION_TYPES.SET_LAST_REFRESH, Date.now())
      
      return newToken
    } catch (error) {
      commit(CSRF_MUTATION_TYPES.SET_ERROR, {
        message: 'Token refresh failed',
        code: 'REFRESH_FAILED',
        originalError: error
      })
      commit('SET_REFRESHING', false)
      throw error
    }
  },
  
  /**
   * 清除CSRF令牌
   */
  async [CSRF_ACTION_TYPES.CLEAR_TOKEN]({ commit, state }) {
    try {
      if (state.initialized) {
        const csrfManager = getCSRFManager()
        await csrfManager.clearToken()
      }
      
      commit(CSRF_MUTATION_TYPES.CLEAR_TOKEN)
      commit('CLEAR_CSRF_ERROR')
      
      return true
    } catch (error) {
      commit(CSRF_MUTATION_TYPES.SET_ERROR, {
        message: 'Token clear failed',
        code: 'CLEAR_FAILED',
        originalError: error
      })
      throw error
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}