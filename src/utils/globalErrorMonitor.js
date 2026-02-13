import Vue from 'vue'
import ErrorHandler, { ERROR_CODES, ERROR_TYPES } from './errorHandler'
import { clearPendingRequests } from './request'

/**
 * 全局错误监控类
 */
class GlobalErrorMonitor {
  constructor() {
    this.isInitialized = false
    this.errorQueue = []
    this.maxQueueSize = 100
    this.reportInterval = 5000
    this.reportTimer = null
    this.errorCounts = new Map()
  }

  /**
   * 初始化全局错误监控
   */
  init(options = {}) {
    if (this.isInitialized) return

    this.options = {
      enableConsoleError: true,
      enablePromiseRejection: true,
      enableVueError: true,
      enableResourceError: true,
      maxErrorsPerType: 10,
      reportUrl: '/api/errors/report',
      enableLocalStorage: true,
      userId: null,
      version: '1.0.0',
      ...options
    }

    this.setupErrorHandlers()
    this.startReportTimer()
    this.isInitialized = true
    console.log('🛡️ 全局错误监控已启动')
  }

  /**
   * 设置各种错误处理器
   */
  setupErrorHandlers() {
    if (this.options.enableConsoleError) {
      window.addEventListener('error', this.handleGlobalError.bind(this))
    }

    if (this.options.enablePromiseRejection) {
      window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this))
    }

    if (this.options.enableVueError) {
      Vue.config.errorHandler = this.handleVueError.bind(this)
    }

    if (this.options.enableResourceError) {
      window.addEventListener('error', this.handleResourceError.bind(this), true)
    }
  }

  /**
   * 处理全局JavaScript错误
   */
  handleGlobalError(event) {
    const errorInfo = {
      type: 'javascript-error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      timestamp: Date.now(),
      url: window.location.href
    }

    this.recordError(errorInfo)
    
    const error = ErrorHandler.createError(
      ERROR_CODES.SYSTEM_ERROR,
      `JavaScript错误: ${event.message}`,
      ERROR_TYPES.SYSTEM,
      errorInfo,
      event.error
    )

    ErrorHandler.logError(error)
  }

  /**
   * 处理Promise rejection错误
   */
  handlePromiseRejection(event) {
    const errorInfo = {
      type: 'promise-rejection',
      reason: event.reason,
      message: event.reason?.message || '未捕获的Promise rejection',
      stack: event.reason?.stack,
      timestamp: Date.now(),
      url: window.location.href
    }

    this.recordError(errorInfo)
    event.preventDefault()

    const error = ErrorHandler.createError(
      ERROR_CODES.SYSTEM_ERROR,
      `Promise Rejection: ${errorInfo.message}`,
      ERROR_TYPES.SYSTEM,
      errorInfo,
      event.reason
    )

    ErrorHandler.logError(error)
  }

  /**
   * 处理Vue错误
   */
  handleVueError(err, vm, info) {
    const errorInfo = {
      type: 'vue-error',
      message: err.message,
      stack: err.stack,
      componentName: vm?.$options?.name || 'Unknown',
      componentInfo: info,
      route: vm?.$route,
      timestamp: Date.now(),
      url: window.location.href
    }

    this.recordError(errorInfo)
    ErrorHandler.handleVueError(vm, err, info)
  }

  /**
   * 处理资源加载错误
   */
  handleResourceError(event) {
    if (event.target && event.target !== window) {
      const errorInfo = {
        type: 'resource-error',
        tagName: event.target.tagName,
        source: event.target.src || event.target.href,
        message: `资源加载失败: ${event.target.tagName}`,
        timestamp: Date.now(),
        url: window.location.href
      }

      this.recordError(errorInfo)
      console.error('资源加载错误:', errorInfo)
    }
  }

  /**
   * 记录错误信息
   */
  recordError(errorInfo) {
    if (this.options.userId) {
      errorInfo.userId = this.options.userId
    }
    errorInfo.version = this.options.version

    // 错误去重
    const errorKey = `${errorInfo.type}-${errorInfo.message}`
    const count = this.errorCounts.get(errorKey) || 0
    
    if (count >= this.options.maxErrorsPerType) return
    
    this.errorCounts.set(errorKey, count + 1)
    errorInfo.count = count + 1

    this.errorQueue.push(errorInfo)

    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift()
    }

    if (this.options.enableLocalStorage) {
      this.saveToLocalStorage(errorInfo)
    }
  }

  /**
   * 保存错误到本地存储
   */
  saveToLocalStorage(errorInfo) {
    try {
      const key = 'app_error_logs'
      const existingLogs = JSON.parse(localStorage.getItem(key) || '[]')
      
      existingLogs.push(errorInfo)
      
      if (existingLogs.length > 50) {
        existingLogs.splice(0, existingLogs.length - 50)
      }
      
      localStorage.setItem(key, JSON.stringify(existingLogs))
    } catch (e) {
      console.warn('保存错误日志失败:', e)
    }
  }

  /**
   * 启动定时上报
   */
  startReportTimer() {
    if (this.reportTimer) {
      clearInterval(this.reportTimer)
    }

    this.reportTimer = setInterval(() => {
      this.reportErrors()
    }, this.reportInterval)
  }

  /**
   * 上报错误信息
   */
  async reportErrors() {
    if (this.errorQueue.length === 0) return

    const errors = [...this.errorQueue]
    this.errorQueue = []

    try {
      if (this.options.reportUrl) {
        await fetch(this.options.reportUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            errors,
            reportTime: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
          })
        })
      }
      console.log(`📤 上报了 ${errors.length} 条错误信息`)
    } catch (e) {
      console.warn('错误上报失败:', e)
      this.errorQueue.unshift(...errors)
    }
  }

  /**
   * 获取本地错误日志
   */
  getLocalErrorLogs() {
    try {
      return JSON.parse(localStorage.getItem('app_error_logs') || '[]')
    } catch (e) {
      return []
    }
  }

  /**
   * 获取错误统计信息
   */
  getErrorStats() {
    const stats = {
      totalErrors: this.errorQueue.length,
      errorsByType: {},
      errorCounts: Object.fromEntries(this.errorCounts)
    }

    this.errorQueue.forEach(error => {
      stats.errorsByType[error.type] = (stats.errorsByType[error.type] || 0) + 1
    })

    return stats
  }

  /**
   * 设置用户ID
   */
  setUserId(userId) {
    this.options.userId = userId
  }

  /**
   * 销毁监控
   */
  destroy() {
    if (this.reportTimer) {
      clearInterval(this.reportTimer)
      this.reportTimer = null
    }
    
    window.removeEventListener('error', this.handleGlobalError)
    window.removeEventListener('unhandledrejection', this.handlePromiseRejection)
    window.removeEventListener('error', this.handleResourceError, true)

    this.errorQueue = []
    this.errorCounts.clear()
    this.isInitialized = false
    console.log('🛡️ 全局错误监控已停止')
  }
}

// 创建全局实例
export const globalErrorMonitor = new GlobalErrorMonitor()

// 页面卸载时处理
window.addEventListener('beforeunload', () => {
  clearPendingRequests()
  globalErrorMonitor.reportErrors()
})

export default GlobalErrorMonitor