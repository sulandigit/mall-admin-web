import { handleError } from './errorHandler'
import { ERROR_TYPES, ERROR_LEVELS } from './errorHandler'

/**
 * 全局错误监听器
 */
class GlobalErrorListener {
  constructor() {
    this.isInitialized = false
    this.errorCount = 0
    this.maxErrorsPerMinute = 50 // 每分钟最大错误数量，防止错误风暴
    this.errorTimestamps = []
  }

  /**
   * 初始化全局错误监听
   */
  init() {
    if (this.isInitialized) {
      console.warn('全局错误监听器已经初始化')
      return
    }

    this.setupErrorListeners()
    this.setupPerformanceMonitoring()
    this.isInitialized = true
    
    console.log('✅ 全局错误监听器初始化完成')
  }

  /**
   * 设置错误监听器
   */
  setupErrorListeners() {
    // JavaScript运行时错误
    window.addEventListener('error', this.handleJavaScriptError.bind(this))
    
    // Promise未捕获异常
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this))
    
    // 资源加载错误
    window.addEventListener('error', this.handleResourceError.bind(this), true)
    
    // Vue错误处理（如果使用Vue）
    if (window.Vue) {
      this.setupVueErrorHandler()
    }
  }

  /**
   * 处理JavaScript运行时错误
   */
  handleJavaScriptError(event) {
    if (this.shouldIgnoreError(event)) {
      return
    }

    if (!this.checkErrorThreshold()) {
      return
    }

    const errorInfo = {
      type: ERROR_TYPES.JS_ERROR,
      level: this.getErrorLevel(event.error),
      message: event.message || '未知JavaScript错误',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      extra: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        errorEvent: {
          type: event.type,
          target: event.target?.tagName
        }
      }
    }

    handleError(errorInfo)
  }

  /**
   * 处理Promise未捕获异常
   */
  handlePromiseRejection(event) {
    if (this.shouldIgnorePromiseRejection(event)) {
      return
    }

    if (!this.checkErrorThreshold()) {
      return
    }

    const reason = event.reason
    let message = 'Promise异步操作失败'
    let stack = null

    if (reason instanceof Error) {
      message = reason.message
      stack = reason.stack
    } else if (typeof reason === 'string') {
      message = reason
    } else if (reason && typeof reason === 'object') {
      message = reason.message || JSON.stringify(reason)
    }

    const errorInfo = {
      type: ERROR_TYPES.PROMISE_REJECTION,
      level: ERROR_LEVELS.MEDIUM,
      message,
      stack,
      extra: {
        promiseReason: reason,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    }

    handleError(errorInfo)
    
    // 阻止控制台输出Promise异常
    event.preventDefault()
  }

  /**
   * 处理资源加载错误
   */
  handleResourceError(event) {
    // 只处理资源加载错误，不处理JavaScript错误
    if (event.target === window) {
      return
    }

    if (this.shouldIgnoreResourceError(event)) {
      return
    }

    const target = event.target
    const resourceType = this.getResourceType(target)
    const resourceUrl = target.src || target.href || '未知资源'

    const errorInfo = {
      type: ERROR_TYPES.RESOURCE_ERROR,
      level: ERROR_LEVELS.LOW,
      message: `${resourceType}加载失败: ${resourceUrl}`,
      extra: {
        resourceType,
        resourceUrl,
        tagName: target.tagName,
        id: target.id,
        className: target.className,
        timestamp: new Date().toISOString()
      }
    }

    handleError(errorInfo)
  }

  /**
   * 设置Vue错误处理器
   */
  setupVueErrorHandler() {
    const originalErrorHandler = window.Vue.config.errorHandler

    window.Vue.config.errorHandler = (error, vm, info) => {
      if (!this.checkErrorThreshold()) {
        return
      }

      const errorInfo = {
        type: ERROR_TYPES.JS_ERROR,
        level: this.getErrorLevel(error),
        message: error.message || 'Vue组件错误',
        stack: error.stack,
        extra: {
          vueInfo: info,
          componentName: vm?.$options?.name || '未知组件',
          componentData: vm?.$data,
          timestamp: new Date().toISOString()
        }
      }

      handleError(errorInfo)

      // 调用原始错误处理器
      if (originalErrorHandler) {
        originalErrorHandler.call(this, error, vm, info)
      }
    }
  }

  /**
   * 设置性能监控
   */
  setupPerformanceMonitoring() {
    // 监控长任务
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // 超过50ms的任务
              handleError({
                type: ERROR_TYPES.SYSTEM_ERROR,
                level: ERROR_LEVELS.LOW,
                message: `检测到长任务: ${entry.duration.toFixed(2)}ms`,
                extra: {
                  duration: entry.duration,
                  startTime: entry.startTime,
                  name: entry.name,
                  entryType: entry.entryType
                }
              })
            }
          }
        })

        longTaskObserver.observe({ entryTypes: ['longtask'] })
      } catch (error) {
        console.warn('长任务监控初始化失败:', error)
      }
    }

    // 监控内存使用情况
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576)
        const totalMB = Math.round(memory.totalJSHeapSize / 1048576)
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576)

        // 内存使用超过80%时警告
        if (usedMB / limitMB > 0.8) {
          handleError({
            type: ERROR_TYPES.SYSTEM_ERROR,
            level: ERROR_LEVELS.MEDIUM,
            message: `内存使用率过高: ${usedMB}MB/${limitMB}MB (${Math.round(usedMB / limitMB * 100)}%)`,
            extra: {
              usedMB,
              totalMB,
              limitMB,
              usagePercent: Math.round(usedMB / limitMB * 100)
            }
          })
        }
      }, 30000) // 每30秒检查一次
    }
  }

  /**
   * 检查错误频率阈值
   */
  checkErrorThreshold() {
    const now = Date.now()
    const oneMinuteAgo = now - 60000

    // 清理过期的时间戳
    this.errorTimestamps = this.errorTimestamps.filter(timestamp => timestamp > oneMinuteAgo)
    
    // 检查是否超过阈值
    if (this.errorTimestamps.length >= this.maxErrorsPerMinute) {
      console.warn('错误频率过高，暂停错误处理')
      return false
    }

    this.errorTimestamps.push(now)
    return true
  }

  /**
   * 判断是否应该忽略特定错误
   */
  shouldIgnoreError(event) {
    const message = event.message || ''
    const filename = event.filename || ''

    // 忽略的错误模式
    const ignorePatterns = [
      'Script error.',
      'Non-Error promise rejection captured',
      'ResizeObserver loop limit exceeded',
      'ChunkLoadError',
      'Loading chunk',
      'Loading CSS chunk'
    ]

    // 忽略第三方脚本错误
    const thirdPartyDomains = [
      'google-analytics.com',
      'googletagmanager.com',
      'facebook.net',
      'connect.facebook.net'
    ]

    return ignorePatterns.some(pattern => message.includes(pattern)) ||
           thirdPartyDomains.some(domain => filename.includes(domain))
  }

  /**
   * 判断是否应该忽略Promise异常
   */
  shouldIgnorePromiseRejection(event) {
    const reason = event.reason
    
    // 忽略已处理的网络错误（避免重复处理）
    if (reason && reason.type && reason.type.startsWith('HTTP_')) {
      return true
    }

    return false
  }

  /**
   * 判断是否应该忽略资源错误
   */
  shouldIgnoreResourceError(event) {
    const target = event.target
    const url = target.src || target.href || ''

    // 忽略第三方资源错误
    const thirdPartyDomains = [
      'google.com',
      'facebook.com',
      'twitter.com',
      'linkedin.com'
    ]

    return thirdPartyDomains.some(domain => url.includes(domain))
  }

  /**
   * 获取错误级别
   */
  getErrorLevel(error) {
    if (!error) return ERROR_LEVELS.LOW

    const message = error.message || ''

    // 严重错误
    if (message.includes('ChunkLoadError') || 
        message.includes('Loading chunk') ||
        message.includes('Cannot read property') ||
        message.includes('Cannot access before initialization')) {
      return ERROR_LEVELS.HIGH
    }

    // 中等错误
    if (message.includes('TypeError') || 
        message.includes('ReferenceError') ||
        message.includes('SyntaxError')) {
      return ERROR_LEVELS.MEDIUM
    }

    return ERROR_LEVELS.LOW
  }

  /**
   * 获取资源类型
   */
  getResourceType(target) {
    const tagName = target.tagName.toLowerCase()
    
    const resourceTypeMap = {
      'img': '图片',
      'script': 'JavaScript脚本',
      'link': '样式表',
      'audio': '音频',
      'video': '视频',
      'iframe': '内嵌框架',
      'object': '对象',
      'embed': '嵌入内容'
    }
    
    return resourceTypeMap[tagName] || '未知资源'
  }

  /**
   * 销毁监听器
   */
  destroy() {
    window.removeEventListener('error', this.handleJavaScriptError.bind(this))
    window.removeEventListener('unhandledrejection', this.handlePromiseRejection.bind(this))
    window.removeEventListener('error', this.handleResourceError.bind(this), true)
    
    this.isInitialized = false
    console.log('全局错误监听器已销毁')
  }
}

// 创建全局实例
const globalErrorListener = new GlobalErrorListener()

export default globalErrorListener