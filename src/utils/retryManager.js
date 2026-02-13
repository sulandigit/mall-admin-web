import ErrorHandler, { ERROR_CODES, ERROR_TYPES } from './errorHandler'

/**
 * 重试策略配置
 */
export const RETRY_STRATEGIES = {
  EXPONENTIAL: 'exponential', // 指数退避
  LINEAR: 'linear',           // 线性增长
  FIXED: 'fixed'              // 固定间隔
}

/**
 * 默认重试配置
 */
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,              // 最大重试次数
  baseDelay: 1000,           // 基础延迟时间(ms)
  maxDelay: 30000,           // 最大延迟时间(ms)
  strategy: RETRY_STRATEGIES.EXPONENTIAL, // 重试策略
  retryCondition: null,       // 重试条件函数
  onRetry: null,             // 重试回调函数
  retryableErrors: [         // 可重试的错误码
    ERROR_CODES.NETWORK_ERROR,
    ERROR_CODES.TIMEOUT_ERROR,
    ERROR_CODES.SYSTEM_ERROR
  ]
}

/**
 * 重试管理器
 */
export class RetryManager {
  constructor(config = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config }
    this.retryCount = 0
    this.isRetrying = false
  }

  /**
   * 执行带重试的异步操作
   * @param {Function} operation 要执行的操作
   * @param {Object} retryConfig 重试配置
   */
  async execute(operation, retryConfig = {}) {
    const config = { ...this.config, ...retryConfig }
    this.retryCount = 0
    this.isRetrying = false

    return this._executeWithRetry(operation, config)
  }

  /**
   * 内部重试执行方法
   * @param {Function} operation 操作函数
   * @param {Object} config 配置
   */
  async _executeWithRetry(operation, config) {
    try {
      const result = await operation()
      this.retryCount = 0
      this.isRetrying = false
      return result
    } catch (error) {
      // 检查是否应该重试
      if (!this._shouldRetry(error, config)) {
        throw error
      }

      this.retryCount++
      this.isRetrying = true

      // 执行重试回调
      if (config.onRetry) {
        config.onRetry(error, this.retryCount)
      }

      // 计算延迟时间
      const delay = this._calculateDelay(config)
      
      // 延迟后重试
      await this._delay(delay)
      
      return this._executeWithRetry(operation, config)
    }
  }

  /**
   * 判断是否应该重试
   * @param {Error} error 错误对象
   * @param {Object} config 配置
   */
  _shouldRetry(error, config) {
    // 检查重试次数
    if (this.retryCount >= config.maxRetries) {
      return false
    }

    // 自定义重试条件
    if (config.retryCondition) {
      return config.retryCondition(error, this.retryCount)
    }

    // 检查错误类型是否可重试
    const errorInfo = ErrorHandler.parseApiError(error)
    return config.retryableErrors.includes(errorInfo.code) || 
           config.retryableErrors.includes(errorInfo.type)
  }

  /**
   * 计算重试延迟时间
   * @param {Object} config 配置
   */
  _calculateDelay(config) {
    let delay

    switch (config.strategy) {
      case RETRY_STRATEGIES.EXPONENTIAL:
        delay = config.baseDelay * Math.pow(2, this.retryCount - 1)
        break
      case RETRY_STRATEGIES.LINEAR:
        delay = config.baseDelay * this.retryCount
        break
      case RETRY_STRATEGIES.FIXED:
      default:
        delay = config.baseDelay
        break
    }

    // 添加随机抖动，避免雷群效应
    const jitter = Math.random() * 0.1 * delay
    delay = delay + jitter

    return Math.min(delay, config.maxDelay)
  }

  /**
   * 延迟执行
   * @param {number} ms 延迟毫秒数
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 获取当前重试状态
   */
  getRetryStatus() {
    return {
      retryCount: this.retryCount,
      isRetrying: this.isRetrying,
      maxRetries: this.config.maxRetries
    }
  }

  /**
   * 重置重试状态
   */
  reset() {
    this.retryCount = 0
    this.isRetrying = false
  }
}

/**
 * 创建重试装饰器
 * @param {Object} retryConfig 重试配置
 */
export function retry(retryConfig = {}) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value
    const retryManager = new RetryManager(retryConfig)

    descriptor.value = function(...args) {
      return retryManager.execute(() => originalMethod.apply(this, args))
    }

    return descriptor
  }
}

/**
 * 创建带重试的Promise包装器
 * @param {Function} operation 操作函数
 * @param {Object} retryConfig 重试配置
 */
export function withRetry(operation, retryConfig = {}) {
  const retryManager = new RetryManager(retryConfig)
  return retryManager.execute(operation)
}

/**
 * 降级策略管理器
 */
export class FallbackManager {
  constructor() {
    this.fallbackStrategies = new Map()
  }

  /**
   * 注册降级策略
   * @param {string} key 策略键
   * @param {Function} fallbackFn 降级函数
   */
  register(key, fallbackFn) {
    this.fallbackStrategies.set(key, fallbackFn)
  }

  /**
   * 执行带降级的操作
   * @param {Function} operation 主要操作
   * @param {string|Function} fallback 降级策略键或函数
   * @param {Object} options 选项
   */
  async executeWithFallback(operation, fallback, options = {}) {
    try {
      return await operation()
    } catch (error) {
      console.warn('主要操作失败，执行降级策略:', error.message)
      
      let fallbackFn
      
      if (typeof fallback === 'string') {
        fallbackFn = this.fallbackStrategies.get(fallback)
        if (!fallbackFn) {
          throw new Error(`未找到降级策略: ${fallback}`)
        }
      } else if (typeof fallback === 'function') {
        fallbackFn = fallback
      } else {
        throw error
      }

      try {
        return await fallbackFn(error, options)
      } catch (fallbackError) {
        console.error('降级策略也失败了:', fallbackError.message)
        
        // 可以选择抛出原始错误或降级错误
        throw options.throwOriginalError ? error : fallbackError
      }
    }
  }

  /**
   * 创建降级装饰器
   * @param {string|Function} fallback 降级策略
   * @param {Object} options 选项
   */
  createFallbackDecorator(fallback, options = {}) {
    return (target, propertyKey, descriptor) => {
      const originalMethod = descriptor.value

      descriptor.value = function(...args) {
        return this.executeWithFallback(
          () => originalMethod.apply(this, args),
          fallback,
          options
        )
      }

      return descriptor
    }
  }
}

// 创建全局实例
export const globalRetryManager = new RetryManager()
export const globalFallbackManager = new FallbackManager()

// 注册一些通用的降级策略
globalFallbackManager.register('empty-data', () => {
  return { data: [], total: 0, message: '数据暂时无法加载，请稍后重试' }
})

globalFallbackManager.register('cached-data', (error, options) => {
  const cachedData = localStorage.getItem(options.cacheKey)
  if (cachedData) {
    return JSON.parse(cachedData)
  }
  throw error
})

globalFallbackManager.register('default-config', () => {
  return { 
    message: '使用默认配置',
    config: {} 
  }
})

export default {
  RetryManager,
  FallbackManager,
  retry,
  withRetry,
  globalRetryManager,
  globalFallbackManager
}