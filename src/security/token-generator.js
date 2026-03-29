/**
 * CSRF令牌生成器
 * 负责生成安全的CSRF令牌
 */
import CryptoJS from 'crypto-js'

/**
 * 令牌生成器配置
 */
const DEFAULT_CONFIG = {
  tokenLength: 32,
  algorithm: 'SHA256',
  charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  includeTimestamp: true
}

/**
 * CSRF令牌生成器类
 */
class TokenGenerator {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * 生成同步令牌模式的CSRF令牌
   * @param {string} sessionId - 会话ID
   * @param {string} secret - 服务器密钥
   * @returns {string} 生成的令牌
   */
  createSyncToken(sessionId, secret = '') {
    const timestamp = Date.now()
    const random = this.generateRandomString(16)
    const payload = `${sessionId}:${timestamp}:${random}`
    
    if (secret) {
      return CryptoJS.HmacSHA256(payload, secret).toString()
    }
    
    return CryptoJS.SHA256(payload).toString().substr(0, this.config.tokenLength)
  }

  /**
   * 生成双重提交Cookie模式的CSRF令牌
   * @returns {string} 生成的令牌
   */
  createDoubleSubmitToken() {
    const timestamp = this.config.includeTimestamp ? Date.now().toString(36) : ''
    const random = this.generateRandomString(this.config.tokenLength - timestamp.length)
    
    return timestamp + random
  }

  /**
   * 生成随机字符串
   * @param {number} length - 字符串长度
   * @returns {string} 随机字符串
   */
  generateRandomString(length = 32) {
    const charset = this.config.charset
    let result = ''
    
    // 使用crypto-js生成随机数
    for (let i = 0; i < length; i++) {
      const randomBytes = CryptoJS.lib.WordArray.random(1)
      const randomIndex = Math.abs(randomBytes.words[0]) % charset.length
      result += charset.charAt(randomIndex)
    }
    
    return result
  }

  /**
   * 生成基于时间戳的令牌
   * @param {number} expireTime - 过期时间（毫秒）
   * @returns {object} 包含令牌和过期时间的对象
   */
  generateTimestampToken(expireTime = 3600000) {
    const now = Date.now()
    const expireAt = now + expireTime
    const payload = `${now}:${expireAt}:${this.generateRandomString(16)}`
    const token = CryptoJS.SHA256(payload).toString().substr(0, this.config.tokenLength)
    
    return {
      token,
      timestamp: now,
      expireAt
    }
  }

  /**
   * 验证令牌格式是否有效
   * @param {string} token - 要验证的令牌
   * @returns {boolean} 是否有效
   */
  isValidTokenFormat(token) {
    if (!token || typeof token !== 'string') {
      return false
    }
    
    // 检查长度
    if (token.length < 16 || token.length > 64) {
      return false
    }
    
    // 检查字符集
    const validChars = /^[A-Za-z0-9]+$/
    return validChars.test(token)
  }

  /**
   * 提取令牌中的时间戳（如果存在）
   * @param {string} token - 令牌
   * @returns {number|null} 时间戳或null
   */
  extractTimestamp(token) {
    if (!this.config.includeTimestamp || !token) {
      return null
    }
    
    try {
      // 尝试从令牌开头提取时间戳
      const timestampPart = token.substr(0, 8)
      const timestamp = parseInt(timestampPart, 36)
      
      // 验证时间戳是否合理（不能太久远或太未来）
      const now = Date.now()
      if (timestamp > 0 && timestamp < now + 86400000) { // 不超过24小时
        return timestamp * 1000 // 转换为毫秒
      }
    } catch (error) {
      console.warn('Failed to extract timestamp from token:', error)
    }
    
    return null
  }
}

export default TokenGenerator