/**
 * CSRF防护系统初始化模块
 * 负责初始化和配置整个CSRF防护系统
 */
import { createCSRFConfig, SECURITY_PRESETS } from './csrf-config'
import { initCSRF as initSecurityCSRF } from './index'

/**
 * 全局CSRF初始化状态
 */
let isInitialized = false
let initializationPromise = null
let csrfConfig = null

/**
 * 初始化CSRF防护系统
 * @param {object} options - 初始化选项
 * @returns {Promise<boolean>} 初始化结果
 */
export async function initializeCSRFProtection(options = {}) {
  // 如果已经在初始化中，返回现有的Promise
  if (initializationPromise) {
    return initializationPromise
  }
  
  // 如果已经初始化，直接返回成功
  if (isInitialized) {
    return true
  }
  
  initializationPromise = performInitialization(options)
  
  try {
    const result = await initializationPromise
    isInitialized = result
    return result
  } catch (error) {
    initializationPromise = null
    throw error
  }
}

/**
 * 执行初始化
 * @param {object} options - 初始化选项
 * @returns {Promise<boolean>} 初始化结果
 */
async function performInitialization(options) {
  try {
    console.info('Initializing CSRF protection system...')
    
    // 1. 创建配置管理器
    csrfConfig = createCSRFConfig(options.config || {})
    
    // 2. 应用安全预设（如果指定）
    if (options.securityPreset) {
      csrfConfig.applyPreset(options.securityPreset)
    }
    
    // 3. 环境特定配置
    applyEnvironmentSpecificConfig(csrfConfig)
    
    // 4. 初始化核心CSRF系统
    const csrfManager = initSecurityCSRF(csrfConfig.getConfig())
    
    // 5. 设置全局错误处理
    setupGlobalErrorHandling(csrfConfig.getConfig())
    
    // 6. 初始化Vuex模块（如果可用）
    await initializeVuexModule(options.store, csrfConfig.getConfig())
    
    // 7. 注册全局组件（如果指定）
    if (options.Vue) {
      registerGlobalComponents(options.Vue)
    }
    
    // 8. 设置性能监控（如果启用）
    if (csrfConfig.getConfig('performance.enableMetrics')) {
      setupPerformanceMonitoring(csrfConfig.getConfig())
    }
    
    // 9. 启动清理任务
    startCleanupTasks(csrfConfig.getConfig())
    
    console.info('CSRF protection system initialized successfully')
    
    // 触发初始化完成事件
    if (options.onInitialized) {
      options.onInitialized(csrfManager, csrfConfig)
    }
    
    return true
  } catch (error) {
    console.error('Failed to initialize CSRF protection system:', error)
    
    if (options.onError) {
      options.onError(error)
    }
    
    throw error
  }
}

/**
 * 应用环境特定配置
 */
function applyEnvironmentSpecificConfig(config) {
  const env = process.env.NODE_ENV
  
  switch (env) {
    case 'development':
      config.updateConfig({
        debug: true,
        expireTime: 86400000, // 24小时，方便开发
        retryCount: 10, // 更多重试次数
        errorHandling: {
          showUserMessage: true,
          fallbackToNoCSRF: true,
          logErrors: true
        }
      })
      break
      
    case 'production':
      config.updateConfig({
        debug: false,
        cookieOptions: {
          secure: true,
          sameSite: 'strict',
          httpOnly: false
        },
        errorHandling: {
          showUserMessage: false,
          fallbackToNoCSRF: false,
          logErrors: true
        }
      })
      break
      
    case 'test':
      config.updateConfig({
        debug: false,
        autoRefresh: false,
        retryCount: 1,
        storageType: 'memory',
        errorHandling: {
          showUserMessage: false,
          autoRetry: false,
          logErrors: false
        }
      })
      break
  }
}

/**
 * 设置全局错误处理
 */
function setupGlobalErrorHandling(config) {
  if (!config.errorHandling.logErrors) {
    return
  }
  
  // 监听未捕获的CSRF错误
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.isCSRFError) {
      console.error('Unhandled CSRF error:', event.reason)
      
      if (config.errorHandling.showUserMessage) {
        // 这里可以集成到全局消息系统
        console.warn('CSRF error occurred, please refresh the page')
      }
    }
  })
}

/**
 * 初始化Vuex模块
 */
async function initializeVuexModule(store, config) {
  if (!store) {
    console.info('No Vuex store provided, skipping CSRF module initialization')
    return
  }
  
  try {
    await store.dispatch('csrf/initCSRF', config)
    console.info('CSRF Vuex module initialized')
  } catch (error) {
    console.error('Failed to initialize CSRF Vuex module:', error)
    // 不抛出错误，因为这不是致命错误
  }
}

/**
 * 注册全局组件
 */
function registerGlobalComponents(Vue) {
  try {
    // 动态导入安全组件
    import('../components/Security').then(SecurityComponents => {
      Vue.use(SecurityComponents.default)
      console.info('Security components registered globally')
    }).catch(error => {
      console.warn('Failed to register security components:', error)
    })
  } catch (error) {
    console.warn('Failed to register global components:', error)
  }
}

/**
 * 设置性能监控
 */
function setupPerformanceMonitoring(config) {
  const metrics = {
    tokenGenerations: 0,
    tokenValidations: 0,
    tokenRefreshes: 0,
    errors: 0,
    lastMetricsReport: Date.now()
  }
  
  // 定期报告性能指标
  setInterval(() => {
    const now = Date.now()
    const timeDiff = now - metrics.lastMetricsReport
    
    console.info('CSRF Performance Metrics:', {
      period: `${timeDiff / 1000}s`,
      tokenGenerations: metrics.tokenGenerations,
      tokenValidations: metrics.tokenValidations,
      tokenRefreshes: metrics.tokenRefreshes,
      errors: metrics.errors,
      averageGenerationsPerSecond: (metrics.tokenGenerations / (timeDiff / 1000)).toFixed(2)
    })
    
    // 重置计数器
    Object.keys(metrics).forEach(key => {
      if (key !== 'lastMetricsReport') {
        metrics[key] = 0
      }
    })
    metrics.lastMetricsReport = now
    
  }, config.performance.metricsInterval)
}

/**
 * 启动清理任务
 */
function startCleanupTasks(config) {
  // 定期清理过期数据
  setInterval(() => {
    try {
      // 这里可以清理过期的令牌、缓存等
      console.debug('Running CSRF cleanup tasks')
    } catch (error) {
      console.error('CSRF cleanup task failed:', error)
    }
  }, config.performance.cleanupInterval)
}

/**
 * 检查系统是否已初始化
 */
export function isCSRFInitialized() {
  return isInitialized
}

/**
 * 获取当前配置
 */
export function getCurrentConfig() {
  return csrfConfig ? csrfConfig.getConfig() : null
}

/**
 * 更新配置
 */
export function updateCSRFConfig(newConfig) {
  if (!csrfConfig) {
    throw new Error('CSRF system not initialized')
  }
  
  csrfConfig.updateConfig(newConfig)
  return csrfConfig.getConfig()
}

/**
 * 销毁CSRF系统
 */
export function destroyCSRFProtection() {
  isInitialized = false
  initializationPromise = null
  csrfConfig = null
  
  // 清理事件监听器、定时器等
  console.info('CSRF protection system destroyed')
}

/**
 * 快速初始化预设
 */
export const QUICK_INIT_PRESETS = {
  /**
   * 开发环境快速初始化
   */
  development: (Vue, store) => initializeCSRFProtection({
    securityPreset: 'development',
    Vue,
    store,
    config: {
      debug: true,
      showSecurityStatus: true
    }
  }),
  
  /**
   * 生产环境快速初始化
   */
  production: (Vue, store) => initializeCSRFProtection({
    securityPreset: 'high',
    Vue,
    store,
    config: {
      debug: false,
      cookieOptions: {
        secure: true,
        sameSite: 'strict'
      }
    }
  }),
  
  /**
   * 测试环境快速初始化
   */
  test: (Vue, store) => initializeCSRFProtection({
    securityPreset: 'low',
    Vue,
    store,
    config: {
      debug: false,
      storageType: 'memory',
      autoRefresh: false
    }
  })
}

/**
 * 使用预设进行快速初始化
 */
export function quickInit(preset, Vue, store) {
  if (!QUICK_INIT_PRESETS[preset]) {
    throw new Error(`Unknown quick init preset: ${preset}`)
  }
  
  return QUICK_INIT_PRESETS[preset](Vue, store)
}

/**
 * 初始化助手 - 用于main.js
 */
export function setupCSRFProtection(Vue, options = {}) {
  const { store, router, config } = options
  
  // 确定环境预设
  const preset = process.env.NODE_ENV || 'development'
  
  return initializeCSRFProtection({
    securityPreset: preset === 'production' ? 'high' : preset,
    Vue,
    store,
    config: {
      ...config,
      // 基于路由设置跳过规则
      skipRoutes: [
        '/login',
        '/register',
        '/forgot-password',
        ...(config?.skipRoutes || [])
      ]
    },
    onInitialized: (csrfManager, csrfConfig) => {
      console.info('CSRF protection is now active')
      
      // 如果有路由器，可以添加路由守卫
      if (router) {
        router.beforeEach((to, from, next) => {
          // 这里可以添加路由级别的CSRF检查
          next()
        })
      }
    },
    onError: (error) => {
      console.error('CSRF protection setup failed:', error)
      // 可以显示用户友好的错误消息
    }
  })
}