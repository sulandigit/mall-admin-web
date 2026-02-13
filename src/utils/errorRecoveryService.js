import ErrorHandler, { ERROR_CODES, ERROR_TYPES } from './errorHandler'
import { globalRetryManager, globalFallbackManager } from './retryManager'
import { clearPendingRequests } from './request'

/**
 * 错误恢复策略类型
 */
export const RECOVERY_STRATEGIES = {
  RETRY: 'retry',                    // 重试
  FALLBACK: 'fallback',              // 降级
  CACHE: 'cache',                    // 缓存
  DEFAULT: 'default',                // 默认值
  REDIRECT: 'redirect',              // 重定向
  REFRESH: 'refresh',                // 刷新页面
  CLEAR_CACHE: 'clear_cache',        // 清除缓存
  LOGOUT: 'logout'                   // 登出
}

/**
 * 错误恢复服务
 */
class ErrorRecoveryService {
  constructor() {
    this.recoveryStrategies = new Map()
    this.cacheManager = new Map()
    this.recoveryHistory = []
    this.maxHistorySize = 50
    
    this.initDefaultStrategies()
  }

  /**
   * 初始化默认恢复策略
   */
  initDefaultStrategies() {
    // 网络错误恢复策略
    this.registerStrategy(ERROR_CODES.NETWORK_ERROR, [
      {
        type: RECOVERY_STRATEGIES.RETRY,
        maxAttempts: 3,
        delay: 1000,
        condition: () => navigator.onLine
      },
      {
        type: RECOVERY_STRATEGIES.CACHE,
        fallback: 'cached-data'
      },
      {
        type: RECOVERY_STRATEGIES.DEFAULT,
        value: { message: '网络连接失败，请检查网络设置' }
      }
    ])

    // 超时错误恢复策略
    this.registerStrategy(ERROR_CODES.TIMEOUT_ERROR, [
      {
        type: RECOVERY_STRATEGIES.RETRY,
        maxAttempts: 2,
        delay: 2000
      },
      {
        type: RECOVERY_STRATEGIES.DEFAULT,
        value: { message: '请求超时，请稍后重试' }
      }
    ])

    // 未授权错误恢复策略
    this.registerStrategy(ERROR_CODES.UNAUTHORIZED, [
      {
        type: RECOVERY_STRATEGIES.CLEAR_CACHE,
        clearTokens: true
      },
      {
        type: RECOVERY_STRATEGIES.LOGOUT
      }
    ])

    // 系统错误恢复策略
    this.registerStrategy(ERROR_CODES.SYSTEM_ERROR, [
      {
        type: RECOVERY_STRATEGIES.RETRY,
        maxAttempts: 1,
        delay: 3000
      },
      {
        type: RECOVERY_STRATEGIES.REFRESH,
        condition: () => this.shouldRefreshPage()
      },
      {
        type: RECOVERY_STRATEGIES.DEFAULT,
        value: { message: '系统暂时不可用，请稍后重试' }
      }
    ])
  }

  /**
   * 注册错误恢复策略
   * @param {string|number} errorCode 错误码
   * @param {Array} strategies 恢复策略数组
   */
  registerStrategy(errorCode, strategies) {
    this.recoveryStrategies.set(errorCode, strategies)
  }

  /**
   * 执行错误恢复
   * @param {Error} error 错误对象
   * @param {Object} context 上下文信息
   */
  async recover(error, context = {}) {
    const errorInfo = ErrorHandler.parseApiError(error)
    const strategies = this.recoveryStrategies.get(errorInfo.code) || 
                      this.recoveryStrategies.get(errorInfo.type) ||
                      this.getDefaultStrategy()

    console.log(`🔧 开始错误恢复，错误码: ${errorInfo.code}, 策略数量: ${strategies.length}`)

    for (let i = 0; i < strategies.length; i++) {
      const strategy = strategies[i]
      
      try {
        // 检查策略执行条件
        if (strategy.condition && !strategy.condition()) {
          continue
        }

        const result = await this.executeStrategy(strategy, error, context)
        
        if (result.success) {
          this.recordRecovery(errorInfo, strategy, true)
          console.log(`✅ 错误恢复成功，使用策略: ${strategy.type}`)
          return result
        }
      } catch (strategyError) {
        console.warn(`❌ 恢复策略 ${strategy.type} 执行失败:`, strategyError)
        this.recordRecovery(errorInfo, strategy, false, strategyError)
      }
    }

    // 所有策略都失败了
    this.recordRecovery(errorInfo, null, false)
    console.error('💥 所有错误恢复策略都失败了')
    
    return {
      success: false,
      error: errorInfo,
      message: '系统遇到问题，请联系技术支持'
    }
  }

  /**
   * 执行具体的恢复策略
   * @param {Object} strategy 策略配置
   * @param {Error} error 原始错误
   * @param {Object} context 上下文
   */
  async executeStrategy(strategy, error, context) {
    switch (strategy.type) {
      case RECOVERY_STRATEGIES.RETRY:
        return await this.executeRetryStrategy(strategy, error, context)
      
      case RECOVERY_STRATEGIES.FALLBACK:
        return await this.executeFallbackStrategy(strategy, error, context)
      
      case RECOVERY_STRATEGIES.CACHE:
        return await this.executeCacheStrategy(strategy, error, context)
      
      case RECOVERY_STRATEGIES.DEFAULT:
        return this.executeDefaultStrategy(strategy, error, context)
      
      case RECOVERY_STRATEGIES.REDIRECT:
        return this.executeRedirectStrategy(strategy, error, context)
      
      case RECOVERY_STRATEGIES.REFRESH:
        return this.executeRefreshStrategy(strategy, error, context)
      
      case RECOVERY_STRATEGIES.CLEAR_CACHE:
        return this.executeClearCacheStrategy(strategy, error, context)
      
      case RECOVERY_STRATEGIES.LOGOUT:
        return this.executeLogoutStrategy(strategy, error, context)
      
      default:
        throw new Error(`未知的恢复策略: ${strategy.type}`)
    }
  }

  /**
   * 执行重试策略
   */
  async executeRetryStrategy(strategy, error, context) {
    const { maxAttempts = 3, delay = 1000 } = strategy
    const { operation } = context

    if (!operation) {
      throw new Error('重试策略需要提供operation函数')
    }

    try {
      const result = await globalRetryManager.execute(operation, {
        maxRetries: maxAttempts,
        baseDelay: delay
      })

      return { success: true, data: result }
    } catch (retryError) {
      return { success: false, error: retryError }
    }
  }

  /**
   * 执行降级策略
   */
  async executeFallbackStrategy(strategy, error, context) {
    const { fallback } = strategy
    const { operation } = context

    if (!operation || !fallback) {
      throw new Error('降级策略需要提供operation和fallback')
    }

    try {
      const result = await globalFallbackManager.executeWithFallback(
        operation,
        fallback
      )

      return { success: true, data: result }
    } catch (fallbackError) {
      return { success: false, error: fallbackError }
    }
  }

  /**
   * 执行缓存策略
   */
  async executeCacheStrategy(strategy, error, context) {
    const { cacheKey, fallback = 'cached-data' } = strategy
    const key = cacheKey || context.cacheKey || this.generateCacheKey(context)

    try {
      const cachedData = this.getFromCache(key)
      if (cachedData) {
        return { success: true, data: cachedData, fromCache: true }
      }

      // 如果没有缓存，尝试降级策略
      if (fallback) {
        return await this.executeFallbackStrategy({ fallback }, error, context)
      }

      return { success: false, error: new Error('没有可用的缓存数据') }
    } catch (cacheError) {
      return { success: false, error: cacheError }
    }
  }

  /**
   * 执行默认值策略
   */
  executeDefaultStrategy(strategy, error, context) {
    const { value } = strategy
    return { success: true, data: value, isDefault: true }
  }

  /**
   * 执行重定向策略
   */
  executeRedirectStrategy(strategy, error, context) {
    const { url = '/', router } = strategy
    const targetRouter = router || context.router

    if (targetRouter) {
      targetRouter.push(url)
      return { success: true, redirected: true, url }
    }

    window.location.href = url
    return { success: true, redirected: true, url }
  }

  /**
   * 执行页面刷新策略
   */
  executeRefreshStrategy(strategy, error, context) {
    const { force = false, delay = 0 } = strategy

    if (delay > 0) {
      setTimeout(() => {
        if (force) {
          window.location.reload(true)
        } else {
          window.location.reload()
        }
      }, delay)
    } else {
      if (force) {
        window.location.reload(true)
      } else {
        window.location.reload()
      }
    }

    return { success: true, refreshed: true }
  }

  /**
   * 执行清除缓存策略
   */
  executeClearCacheStrategy(strategy, error, context) {
    const { clearTokens = false, clearLocalStorage = false, clearSessionStorage = false } = strategy

    try {
      if (clearTokens) {
        // 清除认证相关缓存
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
        sessionStorage.removeItem('token')
      }

      if (clearLocalStorage) {
        localStorage.clear()
      }

      if (clearSessionStorage) {
        sessionStorage.clear()
      }

      // 清除应用缓存
      this.cacheManager.clear()
      
      // 清除待处理的请求
      clearPendingRequests()

      return { success: true, cacheCleared: true }
    } catch (clearError) {
      return { success: false, error: clearError }
    }
  }

  /**
   * 执行登出策略
   */
  async executeLogoutStrategy(strategy, error, context) {
    const { store, router } = context

    try {
      // 如果有store，调用登出action
      if (store && store.dispatch) {
        await store.dispatch('FedLogOut')
      }

      // 清除所有认证信息
      await this.executeClearCacheStrategy({ clearTokens: true }, error, context)

      // 重定向到登录页
      const loginUrl = strategy.loginUrl || '/login'
      if (router) {
        router.push(loginUrl)
      } else {
        window.location.href = loginUrl
      }

      return { success: true, loggedOut: true }
    } catch (logoutError) {
      return { success: false, error: logoutError }
    }
  }

  /**
   * 获取默认策略
   */
  getDefaultStrategy() {
    return [
      {
        type: RECOVERY_STRATEGIES.DEFAULT,
        value: { message: '操作失败，请稍后重试' }
      }
    ]
  }

  /**
   * 判断是否应该刷新页面
   */
  shouldRefreshPage() {
    // 避免频繁刷新
    const lastRefresh = localStorage.getItem('last_error_refresh')
    const now = Date.now()
    
    if (lastRefresh && (now - parseInt(lastRefresh)) < 30000) {
      return false
    }

    localStorage.setItem('last_error_refresh', now.toString())
    return true
  }

  /**
   * 生成缓存键
   */
  generateCacheKey(context) {
    const { url, method = 'GET', params = {} } = context
    return `${method}:${url}:${JSON.stringify(params)}`
  }

  /**
   * 从缓存获取数据
   */
  getFromCache(key) {
    try {
      const cached = this.cacheManager.get(key) || localStorage.getItem(`cache_${key}`)
      return cached ? JSON.parse(cached) : null
    } catch (e) {
      return null
    }
  }

  /**
   * 设置缓存数据
   */
  setCache(key, data, ttl = 300000) { // 默认5分钟
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl
      }
      
      this.cacheManager.set(key, JSON.stringify(cacheData))
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData))
    } catch (e) {
      console.warn('设置缓存失败:', e)
    }
  }

  /**
   * 记录恢复历史
   */
  recordRecovery(errorInfo, strategy, success, error = null) {
    const record = {
      timestamp: Date.now(),
      errorCode: errorInfo.code,
      errorType: errorInfo.type,
      strategy: strategy?.type || 'none',
      success,
      error: error?.message || null
    }

    this.recoveryHistory.push(record)

    // 保持历史记录大小
    if (this.recoveryHistory.length > this.maxHistorySize) {
      this.recoveryHistory.shift()
    }
  }

  /**
   * 获取恢复统计信息
   */
  getRecoveryStats() {
    const stats = {
      totalRecoveries: this.recoveryHistory.length,
      successRate: 0,
      strategiesUsed: {},
      errorsByCode: {},
      recentFailures: []
    }

    if (this.recoveryHistory.length === 0) {
      return stats
    }

    let successCount = 0
    
    this.recoveryHistory.forEach(record => {
      if (record.success) successCount++
      
      stats.strategiesUsed[record.strategy] = (stats.strategiesUsed[record.strategy] || 0) + 1
      stats.errorsByCode[record.errorCode] = (stats.errorsByCode[record.errorCode] || 0) + 1
      
      if (!record.success) {
        stats.recentFailures.push(record)
      }
    })

    stats.successRate = (successCount / this.recoveryHistory.length * 100).toFixed(2)
    stats.recentFailures = stats.recentFailures.slice(-10) // 最近10次失败

    return stats
  }

  /**
   * 清除恢复历史
   */
  clearRecoveryHistory() {
    this.recoveryHistory = []
  }
}

// 创建全局实例
export const globalErrorRecoveryService = new ErrorRecoveryService()

// 导出包装函数，方便使用
export function withErrorRecovery(operation, context = {}) {
  return async (...args) => {
    try {
      return await operation(...args)
    } catch (error) {
      const recoveryResult = await globalErrorRecoveryService.recover(error, {
        ...context,
        operation: () => operation(...args)
      })

      if (recoveryResult.success) {
        return recoveryResult.data
      }

      throw error
    }
  }
}

export default ErrorRecoveryService