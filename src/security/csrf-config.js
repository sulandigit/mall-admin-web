/**
 * CSRF防护配置管理
 * 集中管理所有CSRF相关的配置选项
 */

/**
 * 环境配置
 */
const ENV_CONFIG = {
  development: {
    debug: true,
    autoRefresh: true,
    retryCount: 3,
    retryDelay: 1000,
    strictMode: false
  },
  
  production: {
    debug: false,
    autoRefresh: true,
    retryCount: 2,
    retryDelay: 2000,
    strictMode: true
  },
  
  test: {
    debug: false,
    autoRefresh: false,
    retryCount: 1,
    retryDelay: 500,
    strictMode: false
  }
}

/**
 * 默认CSRF配置
 */
export const DEFAULT_CSRF_CONFIG = {
  // 基本设置
  enabled: true,
  strategy: 'double-submit', // 'double-submit' | 'sync-token' | 'same-site'
  
  // 令牌设置
  tokenLength: 32,
  expireTime: 3600000, // 1小时
  autoRefresh: true,
  refreshThreshold: 300000, // 5分钟前刷新
  
  // 存储设置
  storageType: 'cookie', // 'cookie' | 'sessionStorage' | 'localStorage' | 'memory'
  cookieName: 'csrf-token',
  storageKey: 'csrf-token',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: 1, // 1天
    httpOnly: false // 前端需要访问
  },
  
  // 网络设置
  headerName: 'X-CSRF-Token',
  retryCount: 3,
  retryDelay: 1000,
  timeout: 5000,
  
  // 保护设置
  protectedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  skipRoutes: [
    '/auth/login',
    '/auth/logout',
    '/auth/refresh',
    '/health',
    '/ping'
  ],
  skipPatterns: [
    /^\/api\/public\//,
    /^\/static\//,
    /\.(jpg|jpeg|png|gif|css|js)$/
  ],
  
  // 调试设置
  debug: process.env.NODE_ENV === 'development',
  logLevel: 'info', // 'error' | 'warn' | 'info' | 'debug'
  
  // 错误处理
  errorHandling: {
    showUserMessage: true,
    autoRetry: true,
    fallbackToNoCSRF: false,
    logErrors: true
  },
  
  // 性能设置
  performance: {
    enableMetrics: false,
    metricsInterval: 60000, // 1分钟
    maxCacheSize: 100,
    cleanupInterval: 300000 // 5分钟清理一次
  }
}

/**
 * 安全级别预设配置
 */
export const SECURITY_PRESETS = {
  // 最高安全级别
  maximum: {
    strategy: 'sync-token',
    tokenLength: 64,
    expireTime: 1800000, // 30分钟
    refreshThreshold: 600000, // 10分钟前刷新
    storageType: 'memory',
    retryCount: 1,
    skipRoutes: [],
    strictMode: true,
    errorHandling: {
      fallbackToNoCSRF: false,
      autoRetry: false
    }
  },
  
  // 高安全级别
  high: {
    strategy: 'double-submit',
    tokenLength: 48,
    expireTime: 2700000, // 45分钟
    refreshThreshold: 900000, // 15分钟前刷新
    storageType: 'sessionStorage',
    retryCount: 2,
    strictMode: true
  },
  
  // 中等安全级别（默认）
  medium: {
    ...DEFAULT_CSRF_CONFIG
  },
  
  // 低安全级别
  low: {
    strategy: 'double-submit',
    tokenLength: 24,
    expireTime: 7200000, // 2小时
    refreshThreshold: 1800000, // 30分钟前刷新
    storageType: 'localStorage',
    retryCount: 5,
    strictMode: false,
    errorHandling: {
      fallbackToNoCSRF: true,
      autoRetry: true
    }
  },
  
  // 开发环境
  development: {
    ...DEFAULT_CSRF_CONFIG,
    debug: true,
    expireTime: 86400000, // 24小时
    refreshThreshold: 3600000, // 1小时前刷新
    retryCount: 10,
    errorHandling: {
      showUserMessage: true,
      autoRetry: true,
      fallbackToNoCSRF: true,
      logErrors: true
    }
  }
}

/**
 * 配置验证规则
 */
export const CONFIG_VALIDATION_RULES = {
  enabled: {
    type: 'boolean',
    required: true
  },
  
  strategy: {
    type: 'string',
    required: true,
    enum: ['double-submit', 'sync-token', 'same-site']
  },
  
  tokenLength: {
    type: 'number',
    required: true,
    min: 16,
    max: 128
  },
  
  expireTime: {
    type: 'number',
    required: true,
    min: 60000, // 最少1分钟
    max: 86400000 // 最多24小时
  },
  
  refreshThreshold: {
    type: 'number',
    required: true,
    min: 30000, // 最少30秒
    max: 3600000 // 最多1小时
  },
  
  storageType: {
    type: 'string',
    required: true,
    enum: ['cookie', 'sessionStorage', 'localStorage', 'memory']
  },
  
  retryCount: {
    type: 'number',
    required: true,
    min: 0,
    max: 10
  },
  
  retryDelay: {
    type: 'number',
    required: true,
    min: 100,
    max: 10000
  }
}

/**
 * CSRF配置管理器类
 */
export class CSRFConfig {
  constructor(initialConfig = {}) {
    this.config = this.mergeConfig(initialConfig)
    this.listeners = new Set()
  }
  
  /**
   * 合并配置
   */
  mergeConfig(userConfig) {
    const envConfig = ENV_CONFIG[process.env.NODE_ENV] || ENV_CONFIG.development
    
    return {
      ...DEFAULT_CSRF_CONFIG,
      ...envConfig,
      ...userConfig
    }
  }
  
  /**
   * 应用安全预设
   */
  applyPreset(presetName) {
    if (!SECURITY_PRESETS[presetName]) {
      throw new Error(`Unknown security preset: ${presetName}`)
    }
    
    const preset = SECURITY_PRESETS[presetName]
    this.updateConfig(preset)
    
    return this
  }
  
  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    const mergedConfig = {
      ...this.config,
      ...newConfig
    }
    
    // 验证配置
    this.validateConfig(mergedConfig)
    
    const oldConfig = { ...this.config }
    this.config = mergedConfig
    
    // 通知监听器
    this.notifyListeners(oldConfig, this.config)
    
    return this
  }
  
  /**
   * 获取配置
   */
  getConfig(key = null) {
    if (key) {
      return this.config[key]
    }
    return { ...this.config }
  }
  
  /**
   * 验证配置
   */
  validateConfig(config) {
    const errors = []
    
    Object.keys(CONFIG_VALIDATION_RULES).forEach(key => {
      const rule = CONFIG_VALIDATION_RULES[key]
      const value = config[key]
      
      // 检查必需字段
      if (rule.required && (value === undefined || value === null)) {
        errors.push(`${key} is required`)
        return
      }
      
      if (value === undefined || value === null) {
        return
      }
      
      // 检查类型
      if (rule.type && typeof value !== rule.type) {
        errors.push(`${key} must be of type ${rule.type}`)
      }
      
      // 检查枚举值
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`${key} must be one of: ${rule.enum.join(', ')}`)
      }
      
      // 检查数值范围
      if (rule.type === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          errors.push(`${key} must be at least ${rule.min}`)
        }
        if (rule.max !== undefined && value > rule.max) {
          errors.push(`${key} must be at most ${rule.max}`)
        }
      }
    })
    
    // 业务逻辑验证
    if (config.refreshThreshold >= config.expireTime) {
      errors.push('refreshThreshold must be less than expireTime')
    }
    
    if (errors.length > 0) {
      throw new Error(`CSRF configuration validation failed: ${errors.join(', ')}`)
    }
  }
  
  /**
   * 添加配置变更监听器
   */
  addListener(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
  
  /**
   * 通知监听器
   */
  notifyListeners(oldConfig, newConfig) {
    this.listeners.forEach(listener => {
      try {
        listener(newConfig, oldConfig)
      } catch (error) {
        console.error('Error in config listener:', error)
      }
    })
  }
  
  /**
   * 重置为默认配置
   */
  reset() {
    this.config = { ...DEFAULT_CSRF_CONFIG }
    return this
  }
  
  /**
   * 检查路由是否需要跳过CSRF保护
   */
  shouldSkipRoute(url) {
    // 检查精确匹配的路由
    if (this.config.skipRoutes.includes(url)) {
      return true
    }
    
    // 检查模式匹配
    return this.config.skipPatterns.some(pattern => pattern.test(url))
  }
  
  /**
   * 检查HTTP方法是否需要CSRF保护
   */
  isProtectedMethod(method) {
    return this.config.protectedMethods.includes(method.toUpperCase())
  }
  
  /**
   * 获取存储配置
   */
  getStorageConfig() {
    return {
      type: this.config.storageType,
      cookieName: this.config.cookieName,
      storageKey: this.config.storageKey,
      cookieOptions: this.config.cookieOptions
    }
  }
  
  /**
   * 导出配置为JSON
   */
  toJSON() {
    return JSON.stringify(this.config, null, 2)
  }
  
  /**
   * 从JSON导入配置
   */
  fromJSON(jsonString) {
    try {
      const config = JSON.parse(jsonString)
      this.updateConfig(config)
      return this
    } catch (error) {
      throw new Error(`Failed to parse configuration JSON: ${error.message}`)
    }
  }
}

/**
 * 创建配置实例
 */
export function createCSRFConfig(initialConfig = {}) {
  return new CSRFConfig(initialConfig)
}

/**
 * 获取环境特定的配置
 */
export function getEnvironmentConfig(env = process.env.NODE_ENV) {
  return ENV_CONFIG[env] || ENV_CONFIG.development
}

/**
 * 合并多个配置对象
 */
export function mergeConfigs(...configs) {
  return configs.reduce((merged, config) => ({
    ...merged,
    ...config
  }), {})
}