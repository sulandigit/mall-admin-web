/**
 * 图片优化配置管理模块
 * 管理全局配置、环境变量、运行时配置等
 */

class ImageOptimizationConfig {
  constructor() {
    // 默认配置
    this.defaultConfig = {
      // 懒加载配置
      lazyLoad: {
        enabled: true,
        threshold: '50px',
        preloadRatio: 0.1,
        maxRetries: 3,
        retryDelay: 1000,
        enableStats: true,
        placeholder: '/static/placeholder.png',
        errorImage: '/static/error.png',
        loadingClass: 'lazy-loading',
        loadedClass: 'lazy-loaded'
      },

      // WebP配置
      webp: {
        enabled: true,
        quality: 80,
        enableFallback: true,
        maxRetries: 3,
        retryDelay: 1000,
        urlPattern: 'suffix', // suffix, query, path
        autoConvert: true,
        urlPatterns: {
          webpSuffix: '.webp',
          webpQuery: '?format=webp',
          webpPath: '/webp/'
        }
      },

      // 图片缓存配置
      cache: {
        enabled: true,
        maxSize: 100,
        maxAge: 24 * 60 * 60 * 1000, // 24小时
        cleanupInterval: 60 * 60 * 1000 // 1小时清理一次
      },

      // 性能监控配置
      performance: {
        enabled: true,
        maxRecords: 1000,
        alertThresholds: {
          loadTime: 3000,
          errorRate: 0.1,
          memoryUsage: 100 * 1024 * 1024 // 100MB
        }
      },

      // 上传配置
      upload: {
        maxSize: 10, // MB
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        enableWebPConversion: true,
        enableThumbnail: true,
        thumbnailSizes: [150, 300, 600],
        uploadUrl: '/api/upload/image'
      },

      // 响应式配置
      responsive: {
        enabled: true,
        breakpoints: {
          mobile: 768,
          tablet: 1024,
          desktop: 1200
        },
        imageSizes: {
          small: 300,
          medium: 600,
          large: 1200
        }
      },

      // 开发模式配置
      development: {
        enableDebug: false,
        enableMockData: false,
        logLevel: 'warn', // debug, info, warn, error
        showPerformanceMetrics: false
      }
    }

    // 当前配置
    this.currentConfig = {}

    // 配置存储键
    this.storageKey = 'image-optimization-config'

    // 环境变量前缀
    this.envPrefix = 'VUE_APP_IMAGE_OPT_'

    // 配置验证规则
    this.validationRules = {
      'lazyLoad.threshold': {
        type: 'string',
        pattern: /^\d+(px|%|rem|em)$/,
        message: '阈值必须是有效的CSS尺寸值'
      },
      'webp.quality': {
        type: 'number',
        min: 0,
        max: 100,
        message: 'WebP质量必须在0-100之间'
      },
      'cache.maxSize': {
        type: 'number',
        min: 1,
        max: 1000,
        message: '缓存大小必须在1-1000之间'
      },
      'upload.maxSize': {
        type: 'number',
        min: 1,
        max: 100,
        message: '上传大小限制必须在1-100MB之间'
      }
    }

    // 配置变更监听器
    this.listeners = new Map()

    this.init()
  }

  /**
   * 初始化配置
   */
  init() {
    // 合并默认配置
    this.currentConfig = this.deepClone(this.defaultConfig)

    // 加载环境变量配置
    this.loadEnvConfig()

    // 加载存储的配置
    this.loadStoredConfig()

    // 验证配置
    this.validateConfig()

    // 启动自动保存
    this.setupAutoSave()

    console.log('Image optimization config initialized:', this.currentConfig)
  }

  /**
   * 深度克隆对象
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime())
    if (obj instanceof Array) return obj.map(item => this.deepClone(item))
    if (typeof obj === 'object') {
      const cloned = {}
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key])
        }
      }
      return cloned
    }
  }

  /**
   * 加载环境变量配置
   */
  loadEnvConfig() {
    const envConfig = {}

    // 从环境变量中读取配置
    if (typeof process !== 'undefined' && process.env) {
      Object.keys(process.env).forEach(key => {
        if (key.startsWith(this.envPrefix)) {
          const configPath = key.substring(this.envPrefix.length).toLowerCase()
          const value = this.parseEnvValue(process.env[key])
          this.setNestedValue(envConfig, configPath, value)
        }
      })
    }

    // 合并环境配置
    this.currentConfig = this.mergeConfig(this.currentConfig, envConfig)
  }

  /**
   * 解析环境变量值
   */
  parseEnvValue(value) {
    if (value === 'true') return true
    if (value === 'false') return false
    if (/^\d+$/.test(value)) return parseInt(value, 10)
    if (/^\d+\.\d+$/.test(value)) return parseFloat(value)
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }

  /**
   * 设置嵌套对象值
   */
  setNestedValue(obj, path, value) {
    const keys = path.split('_')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }

    current[keys[keys.length - 1]] = value
  }

  /**
   * 加载存储的配置
   */
  loadStoredConfig() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const storedConfig = JSON.parse(stored)
        this.currentConfig = this.mergeConfig(this.currentConfig, storedConfig)
      }
    } catch (error) {
      console.warn('Failed to load stored config:', error)
    }
  }

  /**
   * 合并配置对象
   */
  mergeConfig(target, source) {
    const result = this.deepClone(target)

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          result[key] = this.mergeConfig(result[key] || {}, source[key])
        } else {
          result[key] = source[key]
        }
      }
    }

    return result
  }

  /**
   * 验证配置
   */
  validateConfig() {
    const errors = []

    for (const path in this.validationRules) {
      const rule = this.validationRules[path]
      const value = this.getNestedValue(this.currentConfig, path)

      if (value !== undefined) {
        const error = this.validateValue(value, rule, path)
        if (error) {
          errors.push(error)
        }
      }
    }

    if (errors.length > 0) {
      console.warn('Configuration validation errors:', errors)
    }

    return errors
  }

  /**
   * 验证单个值
   */
  validateValue(value, rule, path) {
    if (rule.type && typeof value !== rule.type) {
      return `${path}: 期望类型 ${rule.type}, 实际类型 ${typeof value}`
    }

    if (rule.min !== undefined && value < rule.min) {
      return `${path}: 值 ${value} 小于最小值 ${rule.min}`
    }

    if (rule.max !== undefined && value > rule.max) {
      return `${path}: 值 ${value} 大于最大值 ${rule.max}`
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return `${path}: 值 ${value} 不匹配模式 ${rule.pattern}`
    }

    return null
  }

  /**
   * 获取嵌套对象值
   */
  getNestedValue(obj, path) {
    const keys = path.split('.')
    let current = obj

    for (const key of keys) {
      if (current === null || current === undefined || !current.hasOwnProperty(key)) {
        return undefined
      }
      current = current[key]
    }

    return current
  }

  /**
   * 设置配置值
   */
  set(path, value) {
    const keys = path.split('.')
    let current = this.currentConfig

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }

    const lastKey = keys[keys.length - 1]
    const oldValue = current[lastKey]
    current[lastKey] = value

    // 验证新值
    const rule = this.validationRules[path]
    if (rule) {
      const error = this.validateValue(value, rule, path)
      if (error) {
        current[lastKey] = oldValue // 恢复旧值
        throw new Error(error)
      }
    }

    // 触发变更事件
    this.notifyChange(path, value, oldValue)

    // 保存配置
    this.saveConfig()
  }

  /**
   * 获取配置值
   */
  get(path, defaultValue = undefined) {
    const value = this.getNestedValue(this.currentConfig, path)
    return value !== undefined ? value : defaultValue
  }

  /**
   * 批量更新配置
   */
  update(configUpdates) {
    const errors = []

    // 验证所有更新
    for (const path in configUpdates) {
      const rule = this.validationRules[path]
      if (rule) {
        const error = this.validateValue(configUpdates[path], rule, path)
        if (error) {
          errors.push(error)
        }
      }
    }

    if (errors.length > 0) {
      throw new Error('配置验证失败: ' + errors.join(', '))
    }

    // 应用更新
    const oldConfig = this.deepClone(this.currentConfig)
    
    for (const path in configUpdates) {
      this.setNestedValue(this.currentConfig, path.replace(/\./g, '_'), configUpdates[path])
    }

    // 触发批量变更事件
    this.notifyChange('*', this.currentConfig, oldConfig)

    // 保存配置
    this.saveConfig()
  }

  /**
   * 重置配置
   */
  reset(section = null) {
    if (section) {
      // 重置指定部分
      if (this.defaultConfig[section]) {
        this.currentConfig[section] = this.deepClone(this.defaultConfig[section])
        this.notifyChange(section, this.currentConfig[section], null)
      }
    } else {
      // 重置全部配置
      const oldConfig = this.currentConfig
      this.currentConfig = this.deepClone(this.defaultConfig)
      this.notifyChange('*', this.currentConfig, oldConfig)
    }

    this.saveConfig()
  }

  /**
   * 保存配置
   */
  saveConfig() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.currentConfig))
    } catch (error) {
      console.warn('Failed to save config:', error)
    }
  }

  /**
   * 设置自动保存
   */
  setupAutoSave() {
    // 定期保存配置（防止数据丢失）
    setInterval(() => {
      this.saveConfig()
    }, 5 * 60 * 1000) // 5分钟保存一次
  }

  /**
   * 添加配置变更监听器
   */
  addListener(path, callback) {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set())
    }
    this.listeners.get(path).add(callback)

    // 返回移除监听器的函数
    return () => {
      const pathListeners = this.listeners.get(path)
      if (pathListeners) {
        pathListeners.delete(callback)
        if (pathListeners.size === 0) {
          this.listeners.delete(path)
        }
      }
    }
  }

  /**
   * 通知配置变更
   */
  notifyChange(path, newValue, oldValue) {
    // 通知特定路径的监听器
    const pathListeners = this.listeners.get(path)
    if (pathListeners) {
      pathListeners.forEach(callback => {
        try {
          callback(newValue, oldValue, path)
        } catch (error) {
          console.error('Config listener error:', error)
        }
      })
    }

    // 通知全局监听器
    const globalListeners = this.listeners.get('*')
    if (globalListeners && path !== '*') {
      globalListeners.forEach(callback => {
        try {
          callback(newValue, oldValue, path)
        } catch (error) {
          console.error('Global config listener error:', error)
        }
      })
    }
  }

  /**
   * 获取完整配置
   */
  getAll() {
    return this.deepClone(this.currentConfig)
  }

  /**
   * 导出配置
   */
  export() {
    return {
      timestamp: Date.now(),
      version: '1.0.0',
      config: this.getAll()
    }
  }

  /**
   * 导入配置
   */
  import(configData) {
    try {
      if (configData.config) {
        const oldConfig = this.currentConfig
        this.currentConfig = this.mergeConfig(this.defaultConfig, configData.config)
        this.validateConfig()
        this.notifyChange('*', this.currentConfig, oldConfig)
        this.saveConfig()
        return true
      }
    } catch (error) {
      console.error('Failed to import config:', error)
      return false
    }
  }

  /**
   * 获取配置状态
   */
  getStatus() {
    return {
      isValid: this.validateConfig().length === 0,
      lastSaved: localStorage.getItem(this.storageKey + '_timestamp'),
      size: JSON.stringify(this.currentConfig).length,
      listeners: this.listeners.size
    }
  }
}

// 创建全局配置实例
const imageOptimizationConfig = new ImageOptimizationConfig()

export { imageOptimizationConfig, ImageOptimizationConfig }