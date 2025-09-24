/**
 * CSRF拦截器
 * 处理HTTP请求和响应中的CSRF令牌
 */
import CSRFManager from './csrf-manager'

/**
 * 错误代码常量
 */
export const CSRF_ERROR_CODES = {
  TOKEN_MISSING: 'CSRF_TOKEN_MISSING',
  TOKEN_INVALID: 'CSRF_TOKEN_INVALID',
  TOKEN_EXPIRED: 'CSRF_TOKEN_EXPIRED',
  TOKEN_MISMATCH: 'CSRF_TOKEN_MISMATCH',
  VALIDATION_FAILED: 'CSRF_VALIDATION_FAILED'
}

/**
 * HTTP方法配置
 */
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS', 'TRACE']
const UNSAFE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']

/**
 * 拦截器配置
 */
const DEFAULT_CONFIG = {
  enabled: true,
  protectedMethods: UNSAFE_METHODS,
  skipRoutes: ['/auth/login', '/auth/logout'],
  retryCount: 3,
  retryDelay: 1000,
  headerName: 'X-CSRF-Token',
  debug: false
}

/**
 * CSRF拦截器类
 */
class CSRFInterceptor {
  constructor(axiosInstance, config = {}) {
    this.axios = axiosInstance
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.csrfManager = new CSRFManager({
      headerName: this.config.headerName,
      debug: this.config.debug
    })
    
    this.requestInterceptorId = null
    this.responseInterceptorId = null
    this.retryQueue = new Map()
    
    if (this.config.enabled) {
      this.setupInterceptors()
    }
  }

  /**
   * 设置请求和响应拦截器
   */
  setupInterceptors() {
    this.setupRequestInterceptor()
    this.setupResponseInterceptor()
    this._log('CSRF interceptors setup completed')
  }

  /**
   * 设置请求拦截器
   */
  setupRequestInterceptor() {
    this.requestInterceptorId = this.axios.interceptors.request.use(
      async (config) => {
        try {
          // 检查是否需要CSRF保护
          if (!this._needsCSRFProtection(config)) {
            return config
          }

          // 获取CSRF令牌并添加到请求头
          const tokenHeader = await this.csrfManager.getTokenHeader()
          config.headers = {
            ...config.headers,
            ...tokenHeader
          }

          // 添加请求标识
          config.headers['X-Requested-With'] = 'XMLHttpRequest'

          this._log('CSRF token added to request', {
            method: config.method,
            url: config.url,
            hasToken: !!tokenHeader[this.config.headerName]
          })

          return config
        } catch (error) {
          this._log('Failed to add CSRF token to request', error, 'error')
          
          // 如果无法获取令牌，根据配置决定是否继续请求
          if (this.config.strictMode) {
            return Promise.reject(this._createCSRFError(
              CSRF_ERROR_CODES.TOKEN_MISSING,
              'Failed to obtain CSRF token for request',
              error
            ))
          }
          
          return config
        }
      },
      (error) => {
        this._log('Request interceptor error', error, 'error')
        return Promise.reject(error)
      }
    )
  }

  /**
   * 设置响应拦截器
   */
  setupResponseInterceptor() {
    this.responseInterceptorId = this.axios.interceptors.response.use(
      (response) => {
        // 处理成功响应
        this._handleSuccessfulResponse(response)
        return response
      },
      async (error) => {
        // 处理错误响应
        return this._handleErrorResponse(error)
      }
    )
  }

  /**
   * 处理成功响应
   * @param {object} response - 响应对象
   * @private
   */
  _handleSuccessfulResponse(response) {
    try {
      // 检查是否有新的CSRF令牌
      const newToken = response.headers['x-csrf-token'] || response.headers['X-CSRF-Token']
      if (newToken) {
        this._log('New CSRF token received in response')
        // 异步更新令牌，不阻塞响应
        this.csrfManager.generateToken({ token: newToken }).catch(error => {
          this._log('Failed to update CSRF token from response', error, 'warn')
        })
      }

      // 清除重试队列中对应的请求
      const requestKey = this._getRequestKey(response.config)
      if (this.retryQueue.has(requestKey)) {
        this.retryQueue.delete(requestKey)
        this._log('Request removed from retry queue', { requestKey })
      }
    } catch (error) {
      this._log('Error processing successful response', error, 'warn')
    }
  }

  /**
   * 处理错误响应
   * @param {object} error - 错误对象
   * @returns {Promise} 处理后的结果
   * @private
   */
  async _handleErrorResponse(error) {
    try {
      // 检查是否是CSRF相关错误
      if (!this._isCSRFError(error)) {
        return Promise.reject(error)
      }

      this._log('CSRF error detected', {
        status: error.response?.status,
        message: error.response?.data?.message,
        url: error.config?.url
      })

      // 检查是否可以重试
      const requestKey = this._getRequestKey(error.config)
      const retryInfo = this.retryQueue.get(requestKey) || { count: 0, lastAttempt: 0 }

      if (retryInfo.count >= this.config.retryCount) {
        this._log('Max retry attempts exceeded', { requestKey, retryCount: retryInfo.count }, 'error')
        this.retryQueue.delete(requestKey)
        return Promise.reject(this._enhanceCSRFError(error))
      }

      // 执行重试
      return this._retryWithNewToken(error, requestKey, retryInfo)
    } catch (retryError) {
      this._log('Error during CSRF error handling', retryError, 'error')
      return Promise.reject(error)
    }
  }

  /**
   * 使用新令牌重试请求
   * @param {object} originalError - 原始错误
   * @param {string} requestKey - 请求键
   * @param {object} retryInfo - 重试信息
   * @returns {Promise} 重试结果
   * @private
   */
  async _retryWithNewToken(originalError, requestKey, retryInfo) {
    try {
      // 更新重试信息
      retryInfo.count++
      retryInfo.lastAttempt = Date.now()
      this.retryQueue.set(requestKey, retryInfo)

      // 延迟重试
      if (this.config.retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay))
      }

      // 处理CSRF令牌错误
      const newToken = await this.csrfManager.handleTokenError({
        code: this._getCSRFErrorCode(originalError),
        message: originalError.response?.data?.message || 'CSRF token error'
      })

      // 更新请求配置
      const retryConfig = { ...originalError.config }
      retryConfig.headers = {
        ...retryConfig.headers,
        [this.config.headerName]: newToken
      }

      this._log('Retrying request with new CSRF token', {
        requestKey,
        retryCount: retryInfo.count,
        hasNewToken: !!newToken
      })

      // 重新发送请求
      return this.axios.request(retryConfig)
    } catch (error) {
      this._log('Failed to retry request with new token', error, 'error')
      this.retryQueue.delete(requestKey)
      return Promise.reject(this._enhanceCSRFError(originalError))
    }
  }

  /**
   * 检查请求是否需要CSRF保护
   * @param {object} config - 请求配置
   * @returns {boolean} 是否需要保护
   * @private
   */
  _needsCSRFProtection(config) {
    // 检查是否启用
    if (!this.config.enabled) {
      return false
    }

    // 检查HTTP方法
    const method = (config.method || 'GET').toUpperCase()
    if (!this.config.protectedMethods.includes(method)) {
      return false
    }

    // 检查跳过的路由
    const url = config.url || ''
    if (this.config.skipRoutes.some(route => url.includes(route))) {
      return false
    }

    // 检查是否已经有CSRF令牌
    if (config.headers && config.headers[this.config.headerName]) {
      this._log('Request already has CSRF token, skipping')
      return false
    }

    return true
  }

  /**
   * 检查是否是CSRF错误
   * @param {object} error - 错误对象
   * @returns {boolean} 是否是CSRF错误
   * @private
   */
  _isCSRFError(error) {
    if (!error.response) {
      return false
    }

    const status = error.response.status
    const data = error.response.data || {}

    // 检查状态码
    if (status === 403) {
      // 检查错误消息或错误代码
      const message = data.message || ''
      const code = data.code || data.error || ''
      
      return message.toLowerCase().includes('csrf') ||
             code.toLowerCase().includes('csrf') ||
             Object.values(CSRF_ERROR_CODES).includes(code)
    }

    return false
  }

  /**
   * 获取CSRF错误代码
   * @param {object} error - 错误对象
   * @returns {string} 错误代码
   * @private
   */
  _getCSRFErrorCode(error) {
    const data = error.response?.data || {}
    const code = data.code || data.error

    if (Object.values(CSRF_ERROR_CODES).includes(code)) {
      return code
    }

    // 根据错误消息推断错误类型
    const message = (data.message || '').toLowerCase()
    if (message.includes('missing')) {
      return CSRF_ERROR_CODES.TOKEN_MISSING
    } else if (message.includes('expired')) {
      return CSRF_ERROR_CODES.TOKEN_EXPIRED
    } else if (message.includes('invalid')) {
      return CSRF_ERROR_CODES.TOKEN_INVALID
    } else if (message.includes('mismatch')) {
      return CSRF_ERROR_CODES.TOKEN_MISMATCH
    }

    return CSRF_ERROR_CODES.VALIDATION_FAILED
  }

  /**
   * 生成请求键
   * @param {object} config - 请求配置
   * @returns {string} 请求键
   * @private
   */
  _getRequestKey(config) {
    if (!config) return 'unknown'
    return `${config.method || 'GET'}:${config.url || 'unknown'}`
  }

  /**
   * 创建CSRF错误对象
   * @param {string} code - 错误代码
   * @param {string} message - 错误消息
   * @param {Error} originalError - 原始错误
   * @returns {Error} CSRF错误
   * @private
   */
  _createCSRFError(code, message, originalError = null) {
    const error = new Error(message)
    error.code = code
    error.isCSRFError = true
    error.originalError = originalError
    return error
  }

  /**
   * 增强CSRF错误信息
   * @param {object} error - 原始错误
   * @returns {object} 增强后的错误
   * @private
   */
  _enhanceCSRFError(error) {
    if (!error.isCSRFError) {
      error.isCSRFError = true
      error.code = this._getCSRFErrorCode(error)
    }
    return error
  }

  /**
   * 日志记录
   * @param {string} message - 日志消息
   * @param {any} data - 日志数据
   * @param {string} level - 日志级别
   * @private
   */
  _log(message, data = null, level = 'info') {
    if (!this.config.debug && level === 'info') {
      return
    }

    const timestamp = new Date().toISOString()
    const logData = data ? { ...data } : {}
    
    console[level](`[CSRF Interceptor] ${timestamp} - ${message}`, logData)
  }

  /**
   * 启用拦截器
   */
  enable() {
    if (!this.config.enabled) {
      this.config.enabled = true
      this.setupInterceptors()
      this._log('CSRF interceptor enabled')
    }
  }

  /**
   * 禁用拦截器
   */
  disable() {
    if (this.config.enabled) {
      this.config.enabled = false
      this.removeInterceptors()
      this._log('CSRF interceptor disabled')
    }
  }

  /**
   * 移除拦截器
   */
  removeInterceptors() {
    if (this.requestInterceptorId !== null) {
      this.axios.interceptors.request.eject(this.requestInterceptorId)
      this.requestInterceptorId = null
    }

    if (this.responseInterceptorId !== null) {
      this.axios.interceptors.response.eject(this.responseInterceptorId)
      this.responseInterceptorId = null
    }

    this.retryQueue.clear()
    this._log('CSRF interceptors removed')
  }

  /**
   * 获取状态信息
   * @returns {object} 状态信息
   */
  getStatus() {
    return {
      enabled: this.config.enabled,
      hasRequestInterceptor: this.requestInterceptorId !== null,
      hasResponseInterceptor: this.responseInterceptorId !== null,
      retryQueueSize: this.retryQueue.size,
      protectedMethods: this.config.protectedMethods,
      skipRoutes: this.config.skipRoutes
    }
  }

  /**
   * 销毁拦截器
   */
  destroy() {
    this.removeInterceptors()
    
    if (this.csrfManager) {
      this.csrfManager.destroy()
    }
    
    this._log('CSRF interceptor destroyed')
  }
}

export default CSRFInterceptor