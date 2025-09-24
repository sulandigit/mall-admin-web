/**
 * 数据分类器
 * 根据数据类型和内容确定数据敏感级别、加密策略和存储位置
 */

import { DATA_CLASSIFICATIONS, STORAGE_LOCATIONS, ENCRYPTION_ALGORITHMS } from './index'

export default class DataClassifier {
  constructor() {
    // 数据分类规则配置
    this.classificationRules = new Map([
      // 高敏感数据规则
      [DATA_CLASSIFICATIONS.HIGH_SENSITIVE, {
        keywords: ['token', 'password', 'secret', 'key', 'credential', 'auth', 'refresh'],
        patterns: [
          /token/i,
          /password/i,
          /secret/i,
          /credential/i,
          /authorization/i,
          /bearer/i,
          /jwt/i,
          /refresh/i
        ],
        dataTypes: ['access_token', 'refresh_token', 'auth_token', 'api_key'],
        prefixes: ['auth_', 'token_', 'secret_', 'key_'],
        encryptionLevel: {
          algorithm: ENCRYPTION_ALGORITHMS.AES_256_GCM,
          keyLength: 256
        },
        storagePolicy: {
          location: STORAGE_LOCATIONS.INDEXED_DB,
          ttl: 30 * 60 * 1000, // 30分钟
          enableCache: false, // 高敏感数据不缓存
          autoCleanup: true
        }
      }],
      
      // 中敏感数据规则
      [DATA_CLASSIFICATIONS.MEDIUM_SENSITIVE, {
        keywords: ['user', 'profile', 'personal', 'info', 'session', 'preferences'],
        patterns: [
          /user/i,
          /profile/i,
          /personal/i,
          /session/i,
          /preferences/i,
          /settings/i
        ],
        dataTypes: ['user_info', 'user_profile', 'session_data', 'temp_data'],
        prefixes: ['user_', 'profile_', 'session_', 'temp_'],
        encryptionLevel: {
          algorithm: ENCRYPTION_ALGORITHMS.AES_128_CBC,
          keyLength: 128
        },
        storagePolicy: {
          location: STORAGE_LOCATIONS.LOCAL_STORAGE,
          ttl: 24 * 60 * 60 * 1000, // 24小时
          enableCache: true,
          autoCleanup: true
        }
      }],
      
      // 低敏感数据规则
      [DATA_CLASSIFICATIONS.LOW_SENSITIVE, {
        keywords: ['config', 'setting', 'preference', 'theme', 'language', 'cache'],
        patterns: [
          /config/i,
          /setting/i,
          /theme/i,
          /language/i,
          /cache/i,
          /ui/i,
          /display/i
        ],
        dataTypes: ['app_config', 'ui_settings', 'cache_data', 'static_data'],
        prefixes: ['config_', 'setting_', 'cache_', 'ui_'],
        encryptionLevel: {
          algorithm: ENCRYPTION_ALGORITHMS.BASE64,
          keyLength: 0
        },
        storagePolicy: {
          location: STORAGE_LOCATIONS.LOCAL_STORAGE,
          ttl: 7 * 24 * 60 * 60 * 1000, // 7天
          enableCache: true,
          autoCleanup: false
        }
      }]
    ])
    
    // 特殊键名映射（精确匹配优先级最高）
    this.exactKeyMappings = new Map([
      ['loginToken', DATA_CLASSIFICATIONS.HIGH_SENSITIVE],
      ['accessToken', DATA_CLASSIFICATIONS.HIGH_SENSITIVE],
      ['refreshToken', DATA_CLASSIFICATIONS.HIGH_SENSITIVE],
      ['authToken', DATA_CLASSIFICATIONS.HIGH_SENSITIVE],
      ['userInfo', DATA_CLASSIFICATIONS.MEDIUM_SENSITIVE],
      ['userProfile', DATA_CLASSIFICATIONS.MEDIUM_SENSITIVE],
      ['sessionData', DATA_CLASSIFICATIONS.MEDIUM_SENSITIVE],
      ['appConfig', DATA_CLASSIFICATIONS.LOW_SENSITIVE],
      ['uiSettings', DATA_CLASSIFICATIONS.LOW_SENSITIVE],
      ['themeConfig', DATA_CLASSIFICATIONS.LOW_SENSITIVE]
    ])
    
    // 临时会话数据规则
    this.sessionDataRules = {
      keywords: ['temp', 'session', 'temporary', 'volatile'],
      storagePolicy: {
        location: STORAGE_LOCATIONS.SESSION_STORAGE,
        ttl: 0, // 会话期间有效
        enableCache: false,
        autoCleanup: true
      }
    }
  }

  /**
   * 对数据进行分类
   * @param {string} key - 数据键名
   * @param {any} data - 数据内容
   * @param {Object} context - 上下文信息
   * @returns {string} 数据分类级别
   */
  classify(key, data = null, context = {}) {
    try {
      // 1. 首先检查精确键名映射
      if (this.exactKeyMappings.has(key)) {
        return this.exactKeyMappings.get(key)
      }
      
      // 2. 检查是否为临时会话数据
      if (this.isSessionData(key, context)) {
        return DATA_CLASSIFICATIONS.MEDIUM_SENSITIVE // 临时数据按中敏感处理
      }
      
      // 3. 基于键名的模式匹配
      const keyClassification = this.classifyByKey(key)
      if (keyClassification) {
        return keyClassification
      }
      
      // 4. 基于数据内容的分析
      if (data !== null) {
        const contentClassification = this.classifyByContent(data)
        if (contentClassification) {
          return contentClassification
        }
      }
      
      // 5. 基于上下文信息
      if (context.dataType) {
        const contextClassification = this.classifyByDataType(context.dataType)
        if (contextClassification) {
          return contextClassification
        }
      }
      
      // 6. 默认分类为低敏感
      return DATA_CLASSIFICATIONS.LOW_SENSITIVE
      
    } catch (error) {
      console.error('Data classification error:', error)
      // 出错时默认为高敏感，确保安全
      return DATA_CLASSIFICATIONS.HIGH_SENSITIVE
    }
  }

  /**
   * 根据键名进行分类
   * @param {string} key - 数据键名
   * @returns {string|null} 分类级别
   */
  classifyByKey(key) {
    const lowerKey = key.toLowerCase()
    
    for (const [classification, rules] of this.classificationRules.entries()) {
      // 检查前缀匹配
      if (rules.prefixes.some(prefix => lowerKey.startsWith(prefix))) {
        return classification
      }
      
      // 检查关键词匹配
      if (rules.keywords.some(keyword => lowerKey.includes(keyword))) {
        return classification
      }
      
      // 检查正则表达式匹配
      if (rules.patterns.some(pattern => pattern.test(key))) {
        return classification
      }
    }
    
    return null
  }

  /**
   * 根据数据内容进行分类
   * @param {any} data - 数据内容
   * @returns {string|null} 分类级别
   */
  classifyByContent(data) {
    try {
      // 将数据转换为字符串进行分析
      let content = ''
      if (typeof data === 'string') {
        content = data.toLowerCase()
      } else if (typeof data === 'object') {
        content = JSON.stringify(data).toLowerCase()
      } else {
        content = String(data).toLowerCase()
      }
      
      // 检查是否包含JWT Token
      if (this.isJWTToken(content)) {
        return DATA_CLASSIFICATIONS.HIGH_SENSITIVE
      }
      
      // 检查是否包含敏感字段
      const sensitivePatterns = [
        /password/,
        /token/,
        /secret/,
        /private[_-]?key/,
        /api[_-]?key/,
        /credential/,
        /authorization/,
        /bearer\s+/
      ]
      
      if (sensitivePatterns.some(pattern => pattern.test(content))) {
        return DATA_CLASSIFICATIONS.HIGH_SENSITIVE
      }
      
      // 检查用户信息模式
      const userInfoPatterns = [
        /user[_-]?id/,
        /username/,
        /email/,
        /phone/,
        /address/,
        /profile/
      ]
      
      if (userInfoPatterns.some(pattern => pattern.test(content))) {
        return DATA_CLASSIFICATIONS.MEDIUM_SENSITIVE
      }
      
      return null
      
    } catch (error) {
      console.error('Content classification error:', error)
      return null
    }
  }

  /**
   * 根据数据类型进行分类
   * @param {string} dataType - 数据类型
   * @returns {string|null} 分类级别
   */
  classifyByDataType(dataType) {
    const lowerType = dataType.toLowerCase()
    
    for (const [classification, rules] of this.classificationRules.entries()) {
      if (rules.dataTypes.includes(lowerType)) {
        return classification
      }
    }
    
    return null
  }

  /**
   * 检查是否为JWT Token
   * @param {string} content - 内容
   * @returns {boolean} 是否为JWT
   */
  isJWTToken(content) {
    // JWT格式：header.payload.signature
    const jwtPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/
    return jwtPattern.test(content.trim())
  }

  /**
   * 检查是否为临时会话数据
   * @param {string} key - 键名
   * @param {Object} context - 上下文
   * @returns {boolean} 是否为会话数据
   */
  isSessionData(key, context) {
    const lowerKey = key.toLowerCase()
    
    // 检查键名中的临时数据关键词
    const isSessionKey = this.sessionDataRules.keywords.some(keyword => 
      lowerKey.includes(keyword)
    )
    
    // 检查上下文中的会话标识
    const isSessionContext = context.isSession || context.temporary || context.volatile
    
    return isSessionKey || isSessionContext
  }

  /**
   * 获取加密级别配置
   * @param {string} classification - 数据分类
   * @returns {Object} 加密配置
   */
  getEncryptionLevel(classification) {
    if (this.classificationRules.has(classification)) {
      return this.classificationRules.get(classification).encryptionLevel
    }
    
    // 默认使用中等加密
    return {
      algorithm: ENCRYPTION_ALGORITHMS.AES_128_CBC,
      keyLength: 128
    }
  }

  /**
   * 获取存储策略配置
   * @param {string} classification - 数据分类
   * @returns {Object} 存储策略
   */
  getStoragePolicy(classification) {
    if (this.classificationRules.has(classification)) {
      return this.classificationRules.get(classification).storagePolicy
    }
    
    // 默认存储策略
    return {
      location: STORAGE_LOCATIONS.LOCAL_STORAGE,
      ttl: 24 * 60 * 60 * 1000, // 24小时
      enableCache: true,
      autoCleanup: true
    }
  }

  /**
   * 获取会话数据存储策略
   * @returns {Object} 会话存储策略
   */
  getSessionStoragePolicy() {
    return this.sessionDataRules.storagePolicy
  }

  /**
   * 验证访问权限
   * @param {string} classification - 数据分类
   * @param {Object} context - 访问上下文
   * @returns {boolean} 是否允许访问
   */
  validateAccess(classification, context = {}) {
    // 基础访问控制逻辑
    switch (classification) {
      case DATA_CLASSIFICATIONS.HIGH_SENSITIVE:
        // 高敏感数据需要更严格的访问控制
        return this.validateHighSensitiveAccess(context)
        
      case DATA_CLASSIFICATIONS.MEDIUM_SENSITIVE:
        // 中敏感数据的访问控制
        return this.validateMediumSensitiveAccess(context)
        
      case DATA_CLASSIFICATIONS.LOW_SENSITIVE:
        // 低敏感数据一般允许访问
        return true
        
      default:
        return false
    }
  }

  /**
   * 验证高敏感数据访问权限
   * @param {Object} context - 访问上下文
   * @returns {boolean} 是否允许访问
   */
  validateHighSensitiveAccess(context) {
    // 检查来源页面是否安全
    if (context.origin && !this.isSecureOrigin(context.origin)) {
      return false
    }
    
    // 检查是否在安全时间窗口内
    if (context.timestamp && !this.isWithinSecureTimeWindow(context.timestamp)) {
      return false
    }
    
    // 检查访问频率限制
    if (context.accessCount && context.accessCount > 100) {
      return false
    }
    
    return true
  }

  /**
   * 验证中敏感数据访问权限
   * @param {Object} context - 访问上下文
   * @returns {boolean} 是否允许访问
   */
  validateMediumSensitiveAccess(context) {
    // 中敏感数据的访问控制相对宽松
    return true
  }

  /**
   * 检查是否为安全来源
   * @param {string} origin - 来源
   * @returns {boolean} 是否安全
   */
  isSecureOrigin(origin) {
    // 检查HTTPS协议
    if (!origin.startsWith('https://')) {
      return false
    }
    
    // 可以添加更多安全检查，如域名白名单等
    return true
  }

  /**
   * 检查是否在安全时间窗口内
   * @param {number} timestamp - 时间戳
   * @returns {boolean} 是否在安全窗口内
   */
  isWithinSecureTimeWindow(timestamp) {
    const now = Date.now()
    const timeDiff = now - timestamp
    
    // 允许5分钟的时间窗口
    return timeDiff >= 0 && timeDiff <= 5 * 60 * 1000
  }

  /**
   * 添加自定义分类规则
   * @param {string} classification - 分类级别
   * @param {Object} rules - 规则配置
   */
  addClassificationRule(classification, rules) {
    this.classificationRules.set(classification, rules)
  }

  /**
   * 添加精确键名映射
   * @param {string} key - 键名
   * @param {string} classification - 分类级别
   */
  addExactKeyMapping(key, classification) {
    this.exactKeyMappings.set(key, classification)
  }

  /**
   * 获取所有分类规则
   * @returns {Map} 分类规则映射
   */
  getAllRules() {
    return new Map(this.classificationRules)
  }

  /**
   * 获取分类统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      totalRules: this.classificationRules.size,
      exactMappings: this.exactKeyMappings.size,
      classifications: Array.from(this.classificationRules.keys()),
      ruleDetails: Object.fromEntries(
        Array.from(this.classificationRules.entries()).map(([key, rules]) => [
          key, {
            keywords: rules.keywords.length,
            patterns: rules.patterns.length,
            dataTypes: rules.dataTypes.length,
            prefixes: rules.prefixes.length
          }
        ])
      )
    }
  }
}