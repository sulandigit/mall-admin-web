/**
 * CSRF令牌验证器
 * 负责验证CSRF令牌的有效性
 */
import CryptoJS from 'crypto-js'

/**
 * 验证器配置
 */
const DEFAULT_CONFIG = {
  maxAge: 3600000, // 1小时
  tolerance: 300000, // 5分钟容错时间
  strictMode: false // 严格模式
}

/**
 * CSRF令牌验证器类
 */
class TokenValidator {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * 验证同步令牌模式
   * @param {string} token - 要验证的令牌
   * @param {string} sessionId - 会话ID
   * @param {string} secret - 服务器密钥
   * @returns {object} 验证结果
   */
  validateSyncToken(token, sessionId, secret = '') {
    const result = {
      valid: false,
      reason: '',
      timestamp: null
    }

    if (!token || !sessionId) {
      result.reason = 'Missing token or session ID'
      return result
    }

    // 基本格式验证
    if (!this.isValidTokenFormat(token)) {
      result.reason = 'Invalid token format'
      return result
    }

    // 这里需要服务器端支持来完全验证同步令牌
    // 前端只能做基本的格式验证
    result.valid = true
    result.reason = 'Sync token validation requires server support'
    
    return result
  }

  /**
   * 验证双重提交Cookie模式
   * @param {string} headerToken - 请求头中的令牌
   * @param {string} cookieToken - Cookie中的令牌
   * @returns {object} 验证结果
   */
  validateDoubleSubmit(headerToken, cookieToken) {
    const result = {
      valid: false,
      reason: '',
      timestamp: null
    }

    // 检查两个令牌是否都存在
    if (!headerToken || !cookieToken) {
      result.reason = 'Missing header token or cookie token'
      return result
    }

    // 检查两个令牌是否相等
    if (headerToken !== cookieToken) {
      result.reason = 'Token mismatch between header and cookie'
      return result
    }

    // 格式验证
    if (!this.isValidTokenFormat(headerToken)) {
      result.reason = 'Invalid token format'
      return result
    }

    // 时间戳验证（如果令牌包含时间戳）
    const timestamp = this.extractTimestamp(headerToken)
    if (timestamp !== null) {
      const ageCheck = this.isTokenExpired(timestamp)
      if (ageCheck.expired) {
        result.reason = ageCheck.reason
        return result
      }
      result.timestamp = timestamp
    }

    result.valid = true
    result.reason = 'Valid double submit token'
    
    return result
  }

  /**
   * 检查令牌是否过期
   * @param {number} timestamp - 令牌时间戳
   * @returns {object} 过期检查结果
   */
  isTokenExpired(timestamp) {
    const result = {
      expired: false,
      reason: '',
      age: 0
    }

    if (!timestamp) {
      result.expired = true
      result.reason = 'No timestamp provided'
      return result
    }

    const now = Date.now()
    const age = now - timestamp
    result.age = age

    // 检查是否过期
    if (age > this.config.maxAge) {
      result.expired = true
      result.reason = `Token expired (age: ${Math.round(age / 1000)}s, max: ${Math.round(this.config.maxAge / 1000)}s)`
      return result
    }

    // 检查是否来自未来（时钟偏差容错）
    if (age < -this.config.tolerance) {
      result.expired = true
      result.reason = 'Token timestamp is too far in the future'
      return result
    }

    return result
  }

  /**
   * 验证令牌格式
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
    
    // 检查字符集（只允许字母数字）
    const validChars = /^[A-Za-z0-9]+$/
    return validChars.test(token)
  }

  /**
   * 提取令牌中的时间戳
   * @param {string} token - 令牌
   * @returns {number|null} 时间戳或null
   */
  extractTimestamp(token) {
    if (!token) {
      return null
    }
    
    try {
      // 尝试从令牌开头提取时间戳（Base36编码）
      const timestampPart = token.substr(0, 8)
      const timestamp = parseInt(timestampPart, 36)
      
      // 验证时间戳是否合理
      const now = Date.now()
      const oneDay = 86400000 // 24小时
      
      if (timestamp > 0 && 
          timestamp < now + oneDay && 
          timestamp > now - oneDay * 30) { // 不超过30天前
        return timestamp * 1000 // 转换为毫秒
      }
    } catch (error) {
      console.warn('Failed to extract timestamp from token:', error)
    }
    
    return null
  }

  /**
   * 验证令牌强度
   * @param {string} token - 要验证的令牌
   * @returns {object} 强度评估结果
   */
  validateTokenStrength(token) {
    const result = {
      strength: 'weak',
      score: 0,
      recommendations: []
    }

    if (!token) {
      result.recommendations.push('Token is missing')
      return result
    }

    let score = 0

    // 长度检查
    if (token.length >= 32) {
      score += 25
    } else if (token.length >= 24) {
      score += 15
    } else {
      result.recommendations.push('Token should be at least 32 characters long')
    }

    // 字符多样性检查
    const hasLower = /[a-z]/.test(token)
    const hasUpper = /[A-Z]/.test(token)
    const hasNumbers = /[0-9]/.test(token)

    if (hasLower && hasUpper && hasNumbers) {
      score += 25
    } else if ((hasLower && hasUpper) || (hasLower && hasNumbers) || (hasUpper && hasNumbers)) {
      score += 15
    } else {
      result.recommendations.push('Token should contain mixed case letters and numbers')
    }

    // 熵检查（简单的重复字符检查）
    const uniqueChars = new Set(token).size
    const entropyRatio = uniqueChars / token.length
    
    if (entropyRatio > 0.7) {
      score += 25
    } else if (entropyRatio > 0.5) {
      score += 15
    } else {
      result.recommendations.push('Token has low entropy (too many repeated characters)')
    }

    // 时间戳存在性
    if (this.extractTimestamp(token) !== null) {
      score += 25
    }

    result.score = score

    // 确定强度等级
    if (score >= 90) {
      result.strength = 'very-strong'
    } else if (score >= 75) {
      result.strength = 'strong'
    } else if (score >= 50) {
      result.strength = 'medium'
    } else if (score >= 25) {
      result.strength = 'weak'
    } else {
      result.strength = 'very-weak'
    }

    return result
  }
}

export default TokenValidator