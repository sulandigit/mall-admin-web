import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import { getToken } from '@/utils/auth'
import ErrorHandler, { ERROR_CODES, ERROR_TYPES } from './errorHandler'
import { globalRetryManager, withRetry } from './retryManager'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api的base_url
  timeout: 15000 // 请求超时时间
})

// 请求队列管理
const pendingRequests = new Map()
const CancelToken = axios.CancelToken

// 生成请求唯一标识
function generateRequestKey(config) {
  return `${config.method}:${config.url}:${JSON.stringify(config.params)}:${JSON.stringify(config.data)}`
}

// 添加请求到队列
function addPendingRequest(config) {
  const requestKey = generateRequestKey(config)
  
  // 如果已有相同请求在进行中，取消新请求
  if (pendingRequests.has(requestKey)) {
    config.cancelToken = new CancelToken(cancel => {
      cancel(`重复请求被取消: ${requestKey}`)
    })
  } else {
    config.cancelToken = new CancelToken(cancel => {
      pendingRequests.set(requestKey, cancel)
    })
  }
}

// 从队列中移除请求
function removePendingRequest(config) {
  const requestKey = generateRequestKey(config)
  if (pendingRequests.has(requestKey)) {
    pendingRequests.delete(requestKey)
  }
}

// request拦截器
service.interceptors.request.use(
  config => {
    // 添加请求标识和重复请求控制
    addPendingRequest(config)
    
    // 添加请求时间戳
    config.metadata = {
      startTime: Date.now(),
      requestId: Math.random().toString(36).substr(2, 9)
    }
    
    // 添加认证token
    if (store.getters.token) {
      config.headers['Authorization'] = getToken()
    }
    
    // 添加请求追踪头
    config.headers['X-Request-ID'] = config.metadata.requestId
    config.headers['X-Timestamp'] = config.metadata.startTime
    
    // 打印请求日志（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request [${config.metadata.requestId}]:`, {
        method: config.method.toUpperCase(),
        url: config.url,
        params: config.params,
        data: config.data
      })
    }
    
    return config
  },
  error => {
    // 请求配置错误
    const errorInfo = ErrorHandler.createError(
      ERROR_CODES.UNKNOWN_ERROR,
      `请求配置错误: ${error.message}`,
      ERROR_TYPES.SYSTEM,
      { originalError: error }
    )
    
    ErrorHandler.logError(errorInfo)
    return Promise.reject(error)
  }
)

// response拦截器
service.interceptors.response.use(
  response => {
    // 移除请求队列中的请求
    removePendingRequest(response.config)
    
    // 计算请求耗时
    const endTime = Date.now()
    const duration = endTime - (response.config.metadata?.startTime || endTime)
    
    // 打印响应日志（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response [${response.config.metadata?.requestId}]:`, {
        status: response.status,
        duration: `${duration}ms`,
        data: response.data
      })
    }
    
    const res = response.data
    
    // 业务成功
    if (res.code === 200) {
      return response.data
    }
    
    // 业务错误处理
    const errorInfo = ErrorHandler.createError(
      res.code || ERROR_CODES.BUSINESS_ERROR,
      res.message || '业务处理失败',
      ERROR_TYPES.BUSINESS,
      {
        response: res,
        requestId: response.config.metadata?.requestId,
        duration
      }
    )
    
    // 特殊处理401错误
    if (res.code === 401) {
      ErrorHandler.handleUnauthorized()
    } else {
      ErrorHandler.showErrorMessage(errorInfo.message)
    }
    
    ErrorHandler.logError(errorInfo)
    return Promise.reject(errorInfo)
  },
  error => {
    // 移除请求队列中的请求
    if (error.config) {
      removePendingRequest(error.config)
    }
    
    // 计算请求耗时
    const endTime = Date.now()
    const duration = error.config?.metadata?.startTime 
      ? endTime - error.config.metadata.startTime 
      : 0
    
    // 打印错误日志（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log(`❌ API Error [${error.config?.metadata?.requestId}]:`, {
        message: error.message,
        status: error.response?.status,
        duration: `${duration}ms`,
        response: error.response?.data
      })
    }
    
    // 处理请求取消
    if (axios.isCancel(error)) {
      console.log('请求被取消:', error.message)
      return Promise.reject(error)
    }
    
    // 统一错误处理
    const errorInfo = ErrorHandler.handleApiError(error, {
      showMessage: true,
      logError: true,
      retryable: true
    })
    
    return Promise.reject(errorInfo)
  }
)

// 清除所有待处理的请求
export function clearPendingRequests() {
  pendingRequests.forEach((cancel, key) => {
    cancel(`清除待处理请求: ${key}`)
  })
  pendingRequests.clear()
}

// 带重试的请求方法
export const requestWithRetry = {
  /**
   * GET请求（带重试）
   * @param {string} url 请求地址
   * @param {Object} params 请求参数
   * @param {Object} retryConfig 重试配置
   */
  get(url, params = {}, retryConfig = {}) {
    return withRetry(
      () => service.get(url, { params }),
      {
        maxRetries: 3,
        baseDelay: 1000,
        retryableErrors: [ERROR_CODES.NETWORK_ERROR, ERROR_CODES.TIMEOUT_ERROR],
        ...retryConfig
      }
    )
  },

  /**
   * POST请求（带重试）
   * @param {string} url 请求地址
   * @param {Object} data 请求数据
   * @param {Object} retryConfig 重试配置
   */
  post(url, data = {}, retryConfig = {}) {
    return withRetry(
      () => service.post(url, data),
      {
        maxRetries: 2, // POST请求重试次数较少
        baseDelay: 1500,
        retryableErrors: [ERROR_CODES.NETWORK_ERROR, ERROR_CODES.TIMEOUT_ERROR],
        ...retryConfig
      }
    )
  },

  /**
   * PUT请求（带重试）
   */
  put(url, data = {}, retryConfig = {}) {
    return withRetry(
      () => service.put(url, data),
      {
        maxRetries: 2,
        baseDelay: 1500,
        retryableErrors: [ERROR_CODES.NETWORK_ERROR, ERROR_CODES.TIMEOUT_ERROR],
        ...retryConfig
      }
    )
  },

  /**
   * DELETE请求（带重试）
   */
  delete(url, retryConfig = {}) {
    return withRetry(
      () => service.delete(url),
      {
        maxRetries: 2,
        baseDelay: 1500,
        retryableErrors: [ERROR_CODES.NETWORK_ERROR, ERROR_CODES.TIMEOUT_ERROR],
        ...retryConfig
      }
    )
  }
}

// 安全的请求方法（自动处理错误，不抛出异常）
export const safeRequest = {
  /**
   * 安全的GET请求
   * @param {string} url 请求地址
   * @param {Object} params 请求参数
   * @param {*} defaultValue 默认返回值
   */
  async get(url, params = {}, defaultValue = null) {
    try {
      return await service.get(url, { params })
    } catch (error) {
      ErrorHandler.logError(error)
      return defaultValue
    }
  },

  /**
   * 安全的POST请求
   */
  async post(url, data = {}, defaultValue = null) {
    try {
      return await service.post(url, data)
    } catch (error) {
      ErrorHandler.logError(error)
      return defaultValue
    }
  }
}

// 批量请求方法
export const batchRequest = {
  /**
   * 并行执行多个请求
   * @param {Array} requests 请求数组
   * @param {Object} options 选项
   */
  async parallel(requests, options = {}) {
    const { 
      maxConcurrency = 5,
      continueOnError = true,
      timeout = 30000
    } = options

    try {
      const results = []
      
      // 分批处理请求
      for (let i = 0; i < requests.length; i += maxConcurrency) {
        const batch = requests.slice(i, i + maxConcurrency)
        
        const batchPromises = batch.map(async (request, index) => {
          try {
            const result = await Promise.race([
              request(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('请求超时')), timeout)
              )
            ])
            return { success: true, data: result, index: i + index }
          } catch (error) {
            if (continueOnError) {
              return { success: false, error, index: i + index }
            }
            throw error
          }
        })
        
        const batchResults = await Promise.all(batchPromises)
        results.push(...batchResults)
      }
      
      return results
    } catch (error) {
      ErrorHandler.handleApiError(error)
      throw error
    }
  },

  /**
   * 串行执行多个请求
   * @param {Array} requests 请求数组
   * @param {Object} options 选项
   */
  async sequence(requests, options = {}) {
    const { continueOnError = false } = options
    const results = []

    for (let i = 0; i < requests.length; i++) {
      try {
        const result = await requests[i]()
        results.push({ success: true, data: result, index: i })
      } catch (error) {
        if (continueOnError) {
          results.push({ success: false, error, index: i })
        } else {
          ErrorHandler.handleApiError(error)
          throw error
        }
      }
    }

    return results
  }
}

export default service
