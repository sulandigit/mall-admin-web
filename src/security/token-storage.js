/**
 * CSRF令牌存储管理器
 * 支持多种存储方式：Cookie、sessionStorage、localStorage、内存
 */
import Cookies from 'js-cookie'

/**
 * 存储类型常量
 */
export const STORAGE_TYPES = {
  COOKIE: 'cookie',
  SESSION_STORAGE: 'sessionStorage',
  LOCAL_STORAGE: 'localStorage',
  MEMORY: 'memory'
}

/**
 * 存储配置
 */
const DEFAULT_CONFIG = {
  storageType: STORAGE_TYPES.COOKIE,
  cookieName: 'csrf-token',
  storageKey: 'csrf-token',
  cookieOptions: {
    secure: false, // 在生产环境中应设为true
    sameSite: 'strict',
    expires: 1 // 1天
  },
  encryptionEnabled: false,
  encryptionKey: 'csrf-default-key'
}

/**
 * 内存存储容器
 */
const memoryStorage = new Map()

/**
 * 令牌存储管理器类
 */
class TokenStorage {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.storage = this._getStorageProvider()
  }

  /**
   * 存储令牌数据
   * @param {object} tokenData - 令牌数据
   * @returns {Promise<void>}
   */
  async storeToken(tokenData) {
    try {
      if (!tokenData || !tokenData.token) {
        throw new Error('Invalid token data')
      }

      const dataToStore = {
        token: tokenData.token,
        strategy: tokenData.strategy,
        timestamp: tokenData.timestamp || Date.now(),
        expireAt: tokenData.expireAt,
        sessionId: tokenData.sessionId,
        requestCount: tokenData.requestCount || 0,
        version: '1.0'
      }

      // 加密数据（如果启用）
      let serializedData = JSON.stringify(dataToStore)
      if (this.config.encryptionEnabled) {
        serializedData = this._encrypt(serializedData)
      }

      switch (this.config.storageType) {
        case STORAGE_TYPES.COOKIE:
          this._storeToCookie(serializedData)
          break
          
        case STORAGE_TYPES.SESSION_STORAGE:
          this._storeToSessionStorage(serializedData)
          break
          
        case STORAGE_TYPES.LOCAL_STORAGE:
          this._storeToLocalStorage(serializedData)
          break
          
        case STORAGE_TYPES.MEMORY:
          this._storeToMemory(serializedData)
          break
          
        default:
          throw new Error(`Unsupported storage type: ${this.config.storageType}`)
      }

      console.info(`CSRF token stored using ${this.config.storageType}`)
    } catch (error) {
      console.error('Failed to store CSRF token:', error)
      throw error
    }
  }

  /**
   * 检索令牌数据
   * @returns {Promise<object|null>} 令牌数据或null
   */
  async retrieveToken() {
    try {
      let serializedData

      switch (this.config.storageType) {
        case STORAGE_TYPES.COOKIE:
          serializedData = this._retrieveFromCookie()
          break
          
        case STORAGE_TYPES.SESSION_STORAGE:
          serializedData = this._retrieveFromSessionStorage()
          break
          
        case STORAGE_TYPES.LOCAL_STORAGE:
          serializedData = this._retrieveFromLocalStorage()
          break
          
        case STORAGE_TYPES.MEMORY:
          serializedData = this._retrieveFromMemory()
          break
          
        default:
          throw new Error(`Unsupported storage type: ${this.config.storageType}`)
      }

      if (!serializedData) {
        return null
      }

      // 解密数据（如果启用）
      if (this.config.encryptionEnabled) {
        serializedData = this._decrypt(serializedData)
      }

      const tokenData = JSON.parse(serializedData)
      
      // 验证数据完整性
      if (!this._isValidTokenData(tokenData)) {
        console.warn('Invalid token data found in storage, clearing...')
        await this.clearToken()
        return null
      }

      // 检查是否过期
      if (tokenData.expireAt && Date.now() > tokenData.expireAt) {
        console.info('Expired token found in storage, clearing...')
        await this.clearToken()
        return null
      }

      return tokenData
    } catch (error) {
      console.error('Failed to retrieve CSRF token:', error)
      return null
    }
  }

  /**
   * 清除令牌数据
   * @returns {Promise<void>}
   */
  async clearToken() {
    try {
      switch (this.config.storageType) {
        case STORAGE_TYPES.COOKIE:
          this._clearFromCookie()
          break
          
        case STORAGE_TYPES.SESSION_STORAGE:
          this._clearFromSessionStorage()
          break
          
        case STORAGE_TYPES.LOCAL_STORAGE:
          this._clearFromLocalStorage()
          break
          
        case STORAGE_TYPES.MEMORY:
          this._clearFromMemory()
          break
      }

      console.info(`CSRF token cleared from ${this.config.storageType}`)
    } catch (error) {
      console.error('Failed to clear CSRF token:', error)
      throw error
    }
  }

  /**
   * 检查存储是否可用
   * @returns {boolean} 是否可用
   */
  isStorageAvailable() {
    try {
      switch (this.config.storageType) {
        case STORAGE_TYPES.COOKIE:
          return this._isCookieAvailable()
          
        case STORAGE_TYPES.SESSION_STORAGE:
          return this._isSessionStorageAvailable()
          
        case STORAGE_TYPES.LOCAL_STORAGE:
          return this._isLocalStorageAvailable()
          
        case STORAGE_TYPES.MEMORY:
          return true // 内存存储总是可用的
          
        default:
          return false
      }
    } catch {
      return false
    }
  }

  /**
   * 获取存储统计信息
   * @returns {object} 存储统计
   */
  getStorageStats() {
    const stats = {
      type: this.config.storageType,
      available: this.isStorageAvailable(),
      hasToken: false,
      tokenAge: null,
      storageSize: 0
    }

    try {
      const tokenData = this.retrieveToken()
      if (tokenData) {
        stats.hasToken = true
        stats.tokenAge = Date.now() - (tokenData.timestamp || 0)
      }

      // 估算存储大小
      switch (this.config.storageType) {
        case STORAGE_TYPES.COOKIE:
          stats.storageSize = document.cookie.length
          break
          
        case STORAGE_TYPES.SESSION_STORAGE:
          stats.storageSize = JSON.stringify(sessionStorage).length
          break
          
        case STORAGE_TYPES.LOCAL_STORAGE:
          stats.storageSize = JSON.stringify(localStorage).length
          break
          
        case STORAGE_TYPES.MEMORY:
          stats.storageSize = memoryStorage.size
          break
      }
    } catch (error) {
      console.warn('Failed to get storage stats:', error)
    }

    return stats
  }

  // ===== 私有方法 =====

  /**
   * 获取存储提供者
   * @returns {object} 存储提供者
   * @private
   */
  _getStorageProvider() {
    switch (this.config.storageType) {
      case STORAGE_TYPES.COOKIE:
        return Cookies
        
      case STORAGE_TYPES.SESSION_STORAGE:
        return sessionStorage
        
      case STORAGE_TYPES.LOCAL_STORAGE:
        return localStorage
        
      case STORAGE_TYPES.MEMORY:
        return memoryStorage
        
      default:
        throw new Error(`Unsupported storage type: ${this.config.storageType}`)
    }
  }

  /**
   * Cookie存储方法
   */
  _storeToCookie(data) {
    Cookies.set(this.config.cookieName, data, this.config.cookieOptions)
  }

  _retrieveFromCookie() {
    return Cookies.get(this.config.cookieName)
  }

  _clearFromCookie() {
    Cookies.remove(this.config.cookieName)
  }

  _isCookieAvailable() {
    try {
      const testKey = '__test_cookie__'
      Cookies.set(testKey, 'test')
      const result = Cookies.get(testKey) === 'test'
      Cookies.remove(testKey)
      return result
    } catch {
      return false
    }
  }

  /**
   * SessionStorage存储方法
   */
  _storeToSessionStorage(data) {
    sessionStorage.setItem(this.config.storageKey, data)
  }

  _retrieveFromSessionStorage() {
    return sessionStorage.getItem(this.config.storageKey)
  }

  _clearFromSessionStorage() {
    sessionStorage.removeItem(this.config.storageKey)
  }

  _isSessionStorageAvailable() {
    try {
      const testKey = '__test_session__'
      sessionStorage.setItem(testKey, 'test')
      const result = sessionStorage.getItem(testKey) === 'test'
      sessionStorage.removeItem(testKey)
      return result
    } catch {
      return false
    }
  }

  /**
   * LocalStorage存储方法
   */
  _storeToLocalStorage(data) {
    localStorage.setItem(this.config.storageKey, data)
  }

  _retrieveFromLocalStorage() {
    return localStorage.getItem(this.config.storageKey)
  }

  _clearFromLocalStorage() {
    localStorage.removeItem(this.config.storageKey)
  }

  _isLocalStorageAvailable() {
    try {
      const testKey = '__test_local__'
      localStorage.setItem(testKey, 'test')
      const result = localStorage.getItem(testKey) === 'test'
      localStorage.removeItem(testKey)
      return result
    } catch {
      return false
    }
  }

  /**
   * 内存存储方法
   */
  _storeToMemory(data) {
    memoryStorage.set(this.config.storageKey, data)
  }

  _retrieveFromMemory() {
    return memoryStorage.get(this.config.storageKey)
  }

  _clearFromMemory() {
    memoryStorage.delete(this.config.storageKey)
  }

  /**
   * 验证令牌数据
   * @param {object} tokenData - 令牌数据
   * @returns {boolean} 是否有效
   * @private
   */
  _isValidTokenData(tokenData) {
    return tokenData &&
           typeof tokenData === 'object' &&
           typeof tokenData.token === 'string' &&
           tokenData.token.length > 0 &&
           typeof tokenData.timestamp === 'number' &&
           tokenData.timestamp > 0
  }

  /**
   * 简单加密（仅用于演示，生产环境应使用更强的加密）
   * @param {string} data - 要加密的数据
   * @returns {string} 加密后的数据
   * @private
   */
  _encrypt(data) {
    // 这里使用简单的Base64编码作为示例
    // 生产环境应该使用crypto-js的AES等强加密算法
    try {
      return btoa(encodeURIComponent(data))
    } catch {
      return data // 加密失败时返回原数据
    }
  }

  /**
   * 简单解密
   * @param {string} encryptedData - 加密的数据
   * @returns {string} 解密后的数据
   * @private
   */
  _decrypt(encryptedData) {
    try {
      return decodeURIComponent(atob(encryptedData))
    } catch {
      return encryptedData // 解密失败时返回原数据
    }
  }
}

export default TokenStorage