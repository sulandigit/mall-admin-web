import { Message, MessageBox, Notification } from 'element-ui'
import store from '@/store'
import { logError, LOG_LEVELS } from '@/utils/errorLogger'

/**
 * 错误类型枚举
 */
export const ERROR_TYPES = {
  // HTTP错误
  HTTP_NETWORK: 'HTTP_NETWORK',
  HTTP_TIMEOUT: 'HTTP_TIMEOUT',
  HTTP_UNAUTHORIZED: 'HTTP_UNAUTHORIZED',
  HTTP_FORBIDDEN: 'HTTP_FORBIDDEN',
  HTTP_NOT_FOUND: 'HTTP_NOT_FOUND',
  HTTP_SERVER_ERROR: 'HTTP_SERVER_ERROR',
  HTTP_BAD_REQUEST: 'HTTP_BAD_REQUEST',
  
  // 业务错误
  BUSINESS_ERROR: 'BUSINESS_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // 系统错误
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  JS_ERROR: 'JS_ERROR',
  PROMISE_REJECTION: 'PROMISE_REJECTION',
  
  // 资源错误
  RESOURCE_ERROR: 'RESOURCE_ERROR'
}

/**
 * 错误级别
 */
export const ERROR_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

/**
 * 错误消息配置
 */
const ERROR_MESSAGES = {
  [ERROR_TYPES.HTTP_NETWORK]: '网络连接异常，请检查网络设置',
  [ERROR_TYPES.HTTP_TIMEOUT]: '请求超时，请稍后重试',
  [ERROR_TYPES.HTTP_UNAUTHORIZED]: '登录已过期，请重新登录',
  [ERROR_TYPES.HTTP_FORBIDDEN]: '权限不足，无法访问此资源',
  [ERROR_TYPES.HTTP_NOT_FOUND]: '请求的资源不存在',
  [ERROR_TYPES.HTTP_SERVER_ERROR]: '服务器异常，请稍后重试',
  [ERROR_TYPES.HTTP_BAD_REQUEST]: '请求参数错误',
  [ERROR_TYPES.BUSINESS_ERROR]: '操作失败',
  [ERROR_TYPES.VALIDATION_ERROR]: '数据验证失败',
  [ERROR_TYPES.SYSTEM_ERROR]: '系统异常，请联系管理员',
  [ERROR_TYPES.JS_ERROR]: '页面运行异常',
  [ERROR_TYPES.PROMISE_REJECTION]: '异步操作失败',
  [ERROR_TYPES.RESOURCE_ERROR]: '资源加载失败'
}

/**
 * 错误处理配置
 */
const ERROR_CONFIG = {
  // 是否显示详细错误信息（开发环境）
  showDetail: process.env.NODE_ENV === 'development',
  // 是否自动上报错误
  autoReport: true,
  // 错误重试配置
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
    retryCondition: (error) => {
      return error.type === ERROR_TYPES.HTTP_NETWORK || 
             error.type === ERROR_TYPES.HTTP_TIMEOUT
    }
  }
}

/**
 * 集中化错误处理器类
 */
class ErrorHandler {
  constructor() {
    this.errorQueue = []
    this.retryMap = new Map()
    this.init()
  }

  /**
   * 初始化错误处理器
   */
  init() {
    this.setupGlobalErrorListeners()
  }

  /**
   * 设置全局错误监听器
   */
  setupGlobalErrorListeners() {
    // 监听JavaScript运行时错误
    window.addEventListener('error', (event) => {
      this.handleError({
        type: ERROR_TYPES.JS_ERROR,
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        level: ERROR_LEVELS.HIGH
      })
    })

    // 监听Promise未捕获的拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: ERROR_TYPES.PROMISE_REJECTION,
        message: event.reason?.message || '未捕获的Promise异常',
        error: event.reason,
        level: ERROR_LEVELS.MEDIUM
      })
    })

    // 监听资源加载错误
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.handleError({
          type: ERROR_TYPES.RESOURCE_ERROR,
          message: `资源加载失败: ${event.target.src || event.target.href}`,
          target: event.target,
          level: ERROR_LEVELS.LOW
        })
      }
    }, true)
  }

  /**
   * 主要错误处理方法
   */
  handleError(errorInfo) {
    try {
      // 规范化错误信息
      const normalizedError = this.normalizeError(errorInfo)
      
      // 记录错误日志
      this.logError(normalizedError)
      
      // 显示用户友好的错误消息
      this.showUserMessage(normalizedError)
      
      // 处理特殊错误类型
      this.handleSpecialErrors(normalizedError)
      
      // 自动上报错误（如果配置了）
      if (ERROR_CONFIG.autoReport) {
        this.reportError(normalizedError)
      }
      
      return normalizedError
    } catch (handlerError) {
      console.error('错误处理器自身出现异常:', handlerError)
    }
  }

  /**
   * 规范化错误信息
   */
  normalizeError(errorInfo) {
    const timestamp = new Date().toISOString()
    const userAgent = navigator.userAgent
    const url = window.location.href
    
    return {
      id: this.generateErrorId(),
      timestamp,
      url,
      userAgent,
      type: errorInfo.type || ERROR_TYPES.SYSTEM_ERROR,
      level: errorInfo.level || ERROR_LEVELS.MEDIUM,
      message: errorInfo.message || '未知错误',
      stack: errorInfo.error?.stack,
      code: errorInfo.code,
      extra: errorInfo.extra || {},
      ...errorInfo
    }
  }

  /**
   * 生成错误ID
   */
  generateErrorId() {
    return 'ERR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  /**
   * 记录错误日志
   */
  logError(error) {
    // 映射错误级别到日志级别
    const logLevelMap = {
      [ERROR_LEVELS.LOW]: LOG_LEVELS.INFO,
      [ERROR_LEVELS.MEDIUM]: LOG_LEVELS.WARN,
      [ERROR_LEVELS.HIGH]: LOG_LEVELS.ERROR,
      [ERROR_LEVELS.CRITICAL]: LOG_LEVELS.CRITICAL
    }
    
    const logLevel = logLevelMap[error.level] || LOG_LEVELS.ERROR
    
    // 记录到错误日志系统
    logError(error, logLevel)
    
    const consoleLogLevel = this.getLogLevel(error.level)
    
    if (ERROR_CONFIG.showDetail) {
      console.group(`🚨 ${consoleLogLevel} ${error.type}`)
      console.error('错误消息:', error.message)
      console.error('错误时间:', error.timestamp)
      console.error('错误URL:', error.url)
      if (error.stack) {
        console.error('错误堆栈:', error.stack)
      }
      if (Object.keys(error.extra).length > 0) {
        console.error('额外信息:', error.extra)
      }
      console.groupEnd()
    } else {
      console.error(`[${error.type}] ${error.message}`)
    }
    
    // 将错误添加到队列中
    this.errorQueue.push(error)
    
    // 限制队列长度
    if (this.errorQueue.length > 100) {
      this.errorQueue = this.errorQueue.slice(-50)
    }
  }

  /**
   * 获取日志级别标识
   */
  getLogLevel(level) {
    const levelMap = {
      [ERROR_LEVELS.LOW]: 'INFO',
      [ERROR_LEVELS.MEDIUM]: 'WARN',
      [ERROR_LEVELS.HIGH]: 'ERROR',
      [ERROR_LEVELS.CRITICAL]: 'CRITICAL'
    }
    return levelMap[level] || 'ERROR'
  }

  /**
   * 显示用户友好的错误消息
   */
  showUserMessage(error) {
    const message = this.getUserMessage(error)
    
    switch (error.level) {
      case ERROR_LEVELS.LOW:
        // 低级别错误，只在控制台记录，不打扰用户
        break
        
      case ERROR_LEVELS.MEDIUM:
        Message({
          message,
          type: 'warning',
          duration: 3000,
          showClose: true
        })
        break
        
      case ERROR_LEVELS.HIGH:
        Message({
          message,
          type: 'error',
          duration: 5000,
          showClose: true
        })
        break
        
      case ERROR_LEVELS.CRITICAL:
        Notification({
          title: '严重错误',
          message,
          type: 'error',
          duration: 0, // 不自动关闭
          showClose: true
        })
        break
    }
  }

  /**
   * 获取用户友好的错误消息
   */
  getUserMessage(error) {
    // 如果是业务错误且有自定义消息，直接返回
    if (error.type === ERROR_TYPES.BUSINESS_ERROR && error.message) {
      return error.message
    }
    
    // 返回预定义的错误消息
    return ERROR_MESSAGES[error.type] || error.message || '操作失败，请稍后重试'
  }

  /**
   * 处理特殊错误类型
   */
  handleSpecialErrors(error) {
    switch (error.type) {
      case ERROR_TYPES.HTTP_UNAUTHORIZED:
        this.handleUnauthorized()
        break
        
      case ERROR_TYPES.HTTP_FORBIDDEN:
        this.handleForbidden()
        break
        
      case ERROR_TYPES.HTTP_NETWORK:
      case ERROR_TYPES.HTTP_TIMEOUT:
        this.handleRetryableError(error)
        break
    }
  }

  /**
   * 处理未授权错误
   */
  handleUnauthorized() {
    MessageBox.confirm(
      '登录状态已过期，您可以继续留在该页面，或者重新登录',
      '系统提示',
      {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      store.dispatch('FedLogOut').then(() => {
        location.reload()
      })
    })
  }

  /**
   * 处理权限不足错误
   */
  handleForbidden() {
    MessageBox.alert(
      '您没有权限执行此操作，请联系管理员',
      '权限不足',
      {
        confirmButtonText: '确定',
        type: 'error'
      }
    )
  }

  /**
   * 处理可重试的错误
   */
  handleRetryableError(error) {
    if (!ERROR_CONFIG.retry.retryCondition(error)) {
      return
    }

    const retryCount = this.retryMap.get(error.id) || 0
    
    if (retryCount < ERROR_CONFIG.retry.maxRetries) {
      this.retryMap.set(error.id, retryCount + 1)
      
      setTimeout(() => {
        // 这里可以触发重试逻辑，具体实现依赖于业务场景
        console.log(`错误 ${error.id} 准备进行第 ${retryCount + 1} 次重试`)
      }, ERROR_CONFIG.retry.retryDelay * (retryCount + 1))
    } else {
      this.retryMap.delete(error.id)
    }
  }

  /**
   * 上报错误到服务器
   */
  async reportError(error) {
    try {
      // 这里可以调用API上报错误
      // 为避免错误上报失败导致循环错误，使用简单的fetch
      const reportData = {
        errorId: error.id,
        type: error.type,
        level: error.level,
        message: error.message,
        stack: error.stack,
        url: error.url,
        timestamp: error.timestamp,
        userAgent: error.userAgent,
        userId: store.getters.name || 'anonymous'
      }
      
      // 模拟上报（实际项目中替换为真实的API端点）
      if (ERROR_CONFIG.showDetail) {
        console.log('错误上报数据:', reportData)
      }
      
      // fetch('/api/error-report', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(reportData)
      // })
      
    } catch (reportError) {
      console.error('错误上报失败:', reportError)
    }
  }

  /**
   * 获取错误历史记录
   */
  getErrorHistory() {
    return [...this.errorQueue]
  }

  /**
   * 清空错误历史记录
   */
  clearErrorHistory() {
    this.errorQueue = []
    this.retryMap.clear()
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    Object.assign(ERROR_CONFIG, newConfig)
  }
}

// 创建全局错误处理器实例
const errorHandler = new ErrorHandler()

// 导出便捷方法
export const handleError = (errorInfo) => errorHandler.handleError(errorInfo)
export const getErrorHistory = () => errorHandler.getErrorHistory()
export const clearErrorHistory = () => errorHandler.clearErrorHistory()
export const updateErrorConfig = (config) => errorHandler.updateConfig(config)

export default errorHandler