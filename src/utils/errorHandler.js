import { Message, MessageBox, Notification } from 'element-ui'
import store from '@/store'

/**
 * 错误码定义
 */
export const ERROR_CODES = {
  // 系统级错误
  SYSTEM_ERROR: 500,
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // 业务级错误
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  
  // 自定义错误
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BUSINESS_ERROR: 'BUSINESS_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}

/**
 * 错误类型定义
 */
export const ERROR_TYPES = {
  API: 'API',
  VALIDATION: 'VALIDATION',
  NETWORK: 'NETWORK',
  BUSINESS: 'BUSINESS',
  SYSTEM: 'SYSTEM'
}

/**
 * 错误信息映射
 */
const ERROR_MESSAGES = {
  [ERROR_CODES.SYSTEM_ERROR]: '系统内部错误，请稍后重试',
  [ERROR_CODES.NETWORK_ERROR]: '网络连接异常，请检查网络设置',
  [ERROR_CODES.TIMEOUT_ERROR]: '请求超时，请稍后重试',
  [ERROR_CODES.UNAUTHORIZED]: '登录已过期，请重新登录',
  [ERROR_CODES.FORBIDDEN]: '权限不足，无法访问',
  [ERROR_CODES.NOT_FOUND]: '请求的资源不存在',
  [ERROR_CODES.VALIDATION_ERROR]: '数据验证失败',
  [ERROR_CODES.BUSINESS_ERROR]: '业务处理失败',
  [ERROR_CODES.UNKNOWN_ERROR]: '未知错误，请联系技术支持'
}

/**
 * 错误处理器类
 */
export class ErrorHandler {
  /**
   * 创建错误对象
   * @param {string|number} code 错误码
   * @param {string} message 错误信息
   * @param {string} type 错误类型
   * @param {Object} details 错误详情
   * @param {Error} originalError 原始错误对象
   */
  static createError(code, message, type = ERROR_TYPES.SYSTEM, details = {}, originalError = null) {
    const error = new Error(message || ERROR_MESSAGES[code] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR])
    error.code = code
    error.type = type
    error.details = details
    error.originalError = originalError
    error.timestamp = new Date().toISOString()
    error.userAgent = navigator.userAgent
    error.url = window.location.href
    
    return error
  }

  /**
   * 处理API错误
   * @param {Error} error 错误对象
   * @param {Object} options 处理选项
   */
  static handleApiError(error, options = {}) {
    const {
      showMessage = true,
      showDialog = false,
      logError = true,
      retryable = false
    } = options

    let errorInfo = this.parseApiError(error)
    
    if (logError) {
      this.logError(errorInfo)
    }

    // 特殊处理401错误
    if (errorInfo.code === ERROR_CODES.UNAUTHORIZED) {
      this.handleUnauthorized()
      return errorInfo
    }

    if (showMessage) {
      this.showErrorMessage(errorInfo.message, errorInfo.type)
    }

    if (showDialog) {
      this.showErrorDialog(errorInfo, retryable)
    }

    return errorInfo
  }

  /**
   * 解析API错误
   * @param {Error} error 原始错误
   */
  static parseApiError(error) {
    // 网络错误
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return this.createError(ERROR_CODES.TIMEOUT_ERROR, null, ERROR_TYPES.NETWORK, {}, error)
      }
      return this.createError(ERROR_CODES.NETWORK_ERROR, null, ERROR_TYPES.NETWORK, {}, error)
    }

    const { status, data } = error.response
    
    // HTTP状态码错误
    switch (status) {
      case 401:
        return this.createError(ERROR_CODES.UNAUTHORIZED, data?.message, ERROR_TYPES.API, data, error)
      case 403:
        return this.createError(ERROR_CODES.FORBIDDEN, data?.message, ERROR_TYPES.API, data, error)
      case 404:
        return this.createError(ERROR_CODES.NOT_FOUND, data?.message, ERROR_TYPES.API, data, error)
      case 500:
        return this.createError(ERROR_CODES.SYSTEM_ERROR, data?.message, ERROR_TYPES.SYSTEM, data, error)
      default:
        // 业务错误
        if (data && data.code && data.code !== 200) {
          return this.createError(data.code, data.message, ERROR_TYPES.BUSINESS, data, error)
        }
        return this.createError(ERROR_CODES.UNKNOWN_ERROR, data?.message || error.message, ERROR_TYPES.API, data, error)
    }
  }

  /**
   * 处理未授权错误
   */
  static handleUnauthorized() {
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
    }).catch(() => {
      // 用户取消，不做处理
    })
  }

  /**
   * 显示错误消息
   * @param {string} message 错误信息
   * @param {string} type 错误类型
   */
  static showErrorMessage(message, type = ERROR_TYPES.SYSTEM) {
    const duration = type === ERROR_TYPES.NETWORK ? 5000 : 3000
    
    Message({
      message: message,
      type: 'error',
      duration: duration,
      showClose: true
    })
  }

  /**
   * 显示错误对话框
   * @param {Object} errorInfo 错误信息
   * @param {boolean} retryable 是否可重试
   */
  static showErrorDialog(errorInfo, retryable = false) {
    const options = {
      title: '错误详情',
      message: `
        <div>
          <p><strong>错误信息:</strong> ${errorInfo.message}</p>
          <p><strong>错误类型:</strong> ${errorInfo.type}</p>
          <p><strong>错误码:</strong> ${errorInfo.code}</p>
          <p><strong>发生时间:</strong> ${new Date(errorInfo.timestamp).toLocaleString()}</p>
        </div>
      `,
      dangerouslyUseHTMLString: true,
      type: 'error',
      showCancelButton: retryable,
      confirmButtonText: retryable ? '重试' : '确定',
      cancelButtonText: '取消'
    }

    return MessageBox(options)
  }

  /**
   * 显示错误通知
   * @param {Object} errorInfo 错误信息
   */
  static showErrorNotification(errorInfo) {
    Notification({
      title: '系统错误',
      message: errorInfo.message,
      type: 'error',
      duration: 4500,
      position: 'top-right'
    })
  }

  /**
   * 记录错误日志
   * @param {Object} errorInfo 错误信息
   */
  static logError(errorInfo) {
    // 控制台输出
    console.group('🚨 错误详情')
    console.error('错误信息:', errorInfo.message)
    console.error('错误类型:', errorInfo.type)
    console.error('错误码:', errorInfo.code)
    console.error('错误详情:', errorInfo.details)
    console.error('原始错误:', errorInfo.originalError)
    console.error('发生时间:', errorInfo.timestamp)
    console.error('页面URL:', errorInfo.url)
    console.error('用户代理:', errorInfo.userAgent)
    console.groupEnd()

    // TODO: 这里可以集成第三方日志服务，如Sentry、LogRocket等
    // this.sendToLogService(errorInfo)
  }

  /**
   * 发送错误到日志服务
   * @param {Object} errorInfo 错误信息
   */
  static sendToLogService(errorInfo) {
    // 示例：发送到后端日志接口
    // 实际使用时需要根据具体的日志服务进行配置
    try {
      fetch('/api/logs/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorInfo)
      }).catch(() => {
        // 静默处理日志发送失败
      })
    } catch (e) {
      // 静默处理日志发送异常
    }
  }

  /**
   * 处理验证错误
   * @param {Object} validationErrors 验证错误对象
   */
  static handleValidationError(validationErrors) {
    const errorInfo = this.createError(
      ERROR_CODES.VALIDATION_ERROR,
      '数据验证失败，请检查输入信息',
      ERROR_TYPES.VALIDATION,
      { validationErrors }
    )

    this.logError(errorInfo)
    
    // 显示第一个验证错误
    if (validationErrors && typeof validationErrors === 'object') {
      const firstError = Object.values(validationErrors)[0]
      if (firstError) {
        this.showErrorMessage(Array.isArray(firstError) ? firstError[0] : firstError)
        return errorInfo
      }
    }

    this.showErrorMessage(errorInfo.message)
    return errorInfo
  }

  /**
   * 处理业务错误
   * @param {string} message 错误消息
   * @param {Object} details 错误详情
   */
  static handleBusinessError(message, details = {}) {
    const errorInfo = this.createError(
      ERROR_CODES.BUSINESS_ERROR,
      message,
      ERROR_TYPES.BUSINESS,
      details
    )

    this.logError(errorInfo)
    this.showErrorMessage(errorInfo.message)
    
    return errorInfo
  }

  /**
   * 创建错误边界处理器
   * @param {Vue} vm Vue实例
   * @param {Error} error 错误对象
   * @param {string} info 错误信息
   */
  static handleVueError(vm, error, info) {
    const errorInfo = this.createError(
      ERROR_CODES.SYSTEM_ERROR,
      `Vue组件错误: ${error.message}`,
      ERROR_TYPES.SYSTEM,
      { 
        componentName: vm?.$options?.name || 'Unknown',
        errorInfo: info,
        props: vm?.$props,
        route: vm?.$route
      },
      error
    )

    this.logError(errorInfo)
    this.showErrorNotification(errorInfo)
    
    return errorInfo
  }
}

/**
 * 错误处理装饰器
 * @param {Object} options 配置选项
 */
export function errorHandler(options = {}) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function(...args) {
      try {
        return await originalMethod.apply(this, args)
      } catch (error) {
        return ErrorHandler.handleApiError(error, options)
      }
    }

    return descriptor
  }
}

/**
 * 异步错误处理包装器
 * @param {Function} fn 异步函数
 * @param {Object} options 处理选项
 */
export function withErrorHandler(fn, options = {}) {
  return async function(...args) {
    try {
      return await fn.apply(this, args)
    } catch (error) {
      ErrorHandler.handleApiError(error, options)
      throw error
    }
  }
}

export default ErrorHandler