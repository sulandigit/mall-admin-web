/**
 * CSRF令牌管理器
 * 统一管理CSRF令牌的生成、验证、存储和刷新
 */
import TokenGenerator from './token-generator'
import TokenValidator from './token-validator'
import TokenStorage from './token-storage'

/**
 * CSRF策略常量
 */
export const CSRF_STRATEGIES = {
  DOUBLE_SUBMIT: 'double-submit',
  SYNC_TOKEN: 'sync-token',
  SAME_SITE: 'same-site'
}

/**
 * CSRF管理器配置
 */
const DEFAULT_CONFIG = {
  strategy: CSRF_STRATEGIES.DOUBLE_SUBMIT,
  tokenLength: 32,
  expireTime: 3600000, // 1小时
  autoRefresh: true,
  refreshThreshold: 300000, // 5分钟前刷新
  storageType: 'cookie',
  cookieName: 'csrf-token',
  headerName: 'X-CSRF-Token',
  maxRetries: 3,
  debug: false
}

/**
 * CSRF管理器类
 */
class CSRFManager {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.generator = new TokenGenerator({
      tokenLength: this.config.tokenLength,
      includeTimestamp: true
    })
    this.validator = new TokenValidator({
      maxAge: this.config.expireTime,
      strictMode: this.config.strategy === CSRF_STRATEGIES.SYNC_TOKEN
    })
    this.storage = new TokenStorage({
      storageType: this.config.storageType,
      cookieName: this.config.cookieName
    })
    
    this.currentToken = null
    this.refreshTimer = null
    this.retryCount = 0
    
    this._init()
  }

  /**
   * 初始化管理器
   * @private
   */
  _init() {
    // 尝试从存储中恢复令牌
    this._loadTokenFromStorage()
    
    // 设置自动刷新
    if (this.config.autoRefresh) {
      this._setupAutoRefresh()
    }
    
    this._log('CSRF Manager initialized', {
      strategy: this.config.strategy,
      autoRefresh: this.config.autoRefresh,
      storageType: this.config.storageType
    })
  }

  /**
   * 生成新的CSRF令牌
   * @param {object} options - 生成选项
   * @returns {Promise<string>} 生成的令牌
   */
  async generateToken(options = {}) {
    try {
      let token

      switch (this.config.strategy) {
        case CSRF_STRATEGIES.SYNC_TOKEN:
          const sessionId = options.sessionId || this._getSessionId()
          token = this.generator.createSyncToken(sessionId, options.secret)
          break
          
        case CSRF_STRATEGIES.DOUBLE_SUBMIT:
        default:
          token = this.generator.createDoubleSubmitToken()
          break
      }

      // 创建令牌对象
      const tokenData = {
        token,
        strategy: this.config.strategy,
        timestamp: Date.now(),
        expireAt: Date.now() + this.config.expireTime,
        sessionId: options.sessionId,
        requestCount: 0
      }

      // 存储令牌
      await this.storage.storeToken(tokenData)
      
      this.currentToken = tokenData
      this.retryCount = 0
      
      this._log('New CSRF token generated', { tokenLength: token.length })
      
      return token
    } catch (error) {
      this._log('Failed to generate CSRF token', error, 'error')
      throw new Error(`CSRF token generation failed: ${error.message}`)
    }
  }

  /**
   * 获取当前有效的CSRF令牌
   * @returns {Promise<string>} 令牌字符串
   */
  async getToken() {
    try {
      // 检查当前令牌是否有效
      if (this.currentToken && this._isTokenValid(this.currentToken)) {
        return this.currentToken.token
      }

      // 尝试从存储中加载
      await this._loadTokenFromStorage()
      
      if (this.currentToken && this._isTokenValid(this.currentToken)) {
        return this.currentToken.token
      }

      // 生成新令牌
      return await this.generateToken()
    } catch (error) {
      this._log('Failed to get CSRF token', error, 'error')
      throw error
    }
  }

  /**
   * 验证CSRF令牌
   * @param {string} token - 要验证的令牌
   * @param {object} options - 验证选项
   * @returns {Promise<object>} 验证结果
   */
  async validateToken(token, options = {}) {
    try {
      if (!token) {
        return {
          valid: false,
          reason: 'Token is missing',
          action: 'generate'
        }
      }

      let result

      switch (this.config.strategy) {
        case CSRF_STRATEGIES.SYNC_TOKEN:
          result = this.validator.validateSyncToken(
            token, 
            options.sessionId || this._getSessionId(),
            options.secret
          )
          break
          
        case CSRF_STRATEGIES.DOUBLE_SUBMIT:
        default:
          const cookieToken = await this.storage.retrieveToken()
          result = this.validator.validateDoubleSubmit(
            token, 
            cookieToken ? cookieToken.token : null
          )
          break
      }

      // 确定建议的操作
      if (!result.valid) {
        if (result.reason.includes('expired')) {
          result.action = 'refresh'
        } else if (result.reason.includes('missing') || result.reason.includes('mismatch')) {
          result.action = 'generate'
        } else {
          result.action = 'retry'
        }
      }

      this._log('Token validation result', result)
      
      return result
    } catch (error) {
      this._log('Token validation failed', error, 'error')
      return {
        valid: false,
        reason: `Validation error: ${error.message}`,
        action: 'generate'
      }
    }
  }

  /**
   * 刷新CSRF令牌
   * @param {object} options - 刷新选项
   * @returns {Promise<string>} 新令牌
   */
  async refreshToken(options = {}) {
    try {
      this._log('Refreshing CSRF token')
      
      // 清除旧令牌
      await this.clearToken()
      
      // 生成新令牌
      const newToken = await this.generateToken(options)
      
      this._log('CSRF token refreshed successfully')
      
      return newToken
    } catch (error) {
      this._log('Failed to refresh CSRF token', error, 'error')
      throw error
    }
  }

  /**
   * 获取令牌请求头配置
   * @returns {Promise<object>} 请求头对象
   */
  async getTokenHeader() {
    try {
      const token = await this.getToken()
      return {
        [this.config.headerName]: token
      }
    } catch (error) {
      this._log('Failed to get token header', error, 'error')
      return {}
    }
  }

  /**
   * 清除CSRF令牌
   * @returns {Promise<void>}
   */
  async clearToken() {
    try {
      await this.storage.clearToken()
      this.currentToken = null
      
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer)
        this.refreshTimer = null
      }
      
      this._log('CSRF token cleared')
    } catch (error) {
      this._log('Failed to clear CSRF token', error, 'error')
      throw error
    }
  }

  /**
   * 处理令牌相关错误
   * @param {object} error - 错误对象
   * @returns {Promise<string>} 新令牌
   */
  async handleTokenError(error) {
    this._log('Handling token error', error)
    
    if (this.retryCount >= this.config.maxRetries) {
      this._log('Max retries exceeded', { retryCount: this.retryCount }, 'error')
      throw new Error('CSRF token error: Max retries exceeded')
    }

    this.retryCount++
    
    // 根据错误类型决定处理策略
    if (error.code === 'CSRF_TOKEN_EXPIRED' || error.code === 'CSRF_TOKEN_INVALID') {
      return await this.refreshToken()
    } else if (error.code === 'CSRF_TOKEN_MISSING') {
      return await this.generateToken()
    } else {
      // 默认刷新令牌
      return await this.refreshToken()
    }
  }

  /**
   * 从存储中加载令牌
   * @private
   */
  async _loadTokenFromStorage() {
    try {
      const tokenData = await this.storage.retrieveToken()
      if (tokenData && this._isTokenValid(tokenData)) {
        this.currentToken = tokenData
        this._log('Token loaded from storage')
      }
    } catch (error) {
      this._log('Failed to load token from storage', error, 'warn')
    }
  }

  /**
   * 检查令牌是否有效
   * @param {object} tokenData - 令牌数据
   * @returns {boolean} 是否有效
   * @private
   */
  _isTokenValid(tokenData) {
    if (!tokenData || !tokenData.token) {
      return false
    }

    const now = Date.now()
    return tokenData.expireAt > now
  }

  /**
   * 设置自动刷新
   * @private
   */
  _setupAutoRefresh() {
    const checkInterval = Math.min(this.config.refreshThreshold / 2, 60000) // 最多1分钟检查一次
    
    const scheduleRefresh = () => {
      this.refreshTimer = setTimeout(async () => {
        try {
          if (this.currentToken) {
            const timeUntilExpiry = this.currentToken.expireAt - Date.now()
            if (timeUntilExpiry <= this.config.refreshThreshold) {
              await this.refreshToken()
            }
          }
          scheduleRefresh() // 重新调度
        } catch (error) {
          this._log('Auto refresh failed', error, 'error')
          scheduleRefresh() // 即使失败也要重新调度
        }
      }, checkInterval)
    }

    scheduleRefresh()
  }

  /**
   * 获取会话ID
   * @returns {string} 会话ID
   * @private
   */
  _getSessionId() {
    // 可以从cookie、localStorage或其他地方获取
    return document.cookie.replace(/(?:(?:^|.*;\s*)sessionId\s*\=\s*([^;]*).*$)|^.*$/, "$1") || 'anonymous'
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
    
    console[level](`[CSRF Manager] ${timestamp} - ${message}`, logData)
  }

  /**
   * 销毁管理器
   */
  destroy() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
    
    this.currentToken = null
    this._log('CSRF Manager destroyed')
  }
}

export default CSRFManager