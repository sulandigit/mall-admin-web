import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import { getToken } from '@/utils/auth'
import { 
  getAPIRetryConfig, 
  isRetryableError, 
  logRetry,
  RETRY_STRATEGIES,
  getRetryConfigByStrategy 
} from '@/utils/retryConfig'

// 重试配置
const DEFAULT_RETRY_CONFIG = {
  retries: 3, // 默认重试次数
  retryDelay: 1000, // 基础重试延迟（毫秒）
  retryDelayMultiplier: 2, // 延迟倍数（指数退避）
  retryDelayMax: 10000, // 最大重试延迟
  retryCondition: isRetryableError, // 使用统一的重试条件判断
  shouldRetry: true // 全局重试开关
}

// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api的base_url
  timeout: 15000, // 请求超时时间
  // 添加默认重试配置
  retry: DEFAULT_RETRY_CONFIG
})

// 重试工具函数
function getRetryConfig(config) {
  // 优先使用URL智能配置
  if (config.url) {
    const urlBasedConfig = getAPIRetryConfig(config.url, config.retry)
    return {
      ...DEFAULT_RETRY_CONFIG,
      ...urlBasedConfig
    }
  }
  
  return {
    ...DEFAULT_RETRY_CONFIG,
    ...(config.retry || {})
  }
}

// 计算重试延迟
function calculateRetryDelay(retryNumber, config) {
  const delay = config.retryDelay * Math.pow(config.retryDelayMultiplier, retryNumber - 1)
  return Math.min(delay, config.retryDelayMax)
}

// 延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 执行重试逻辑
async function executeWithRetry(config) {
  const retryConfig = getRetryConfig(config)
  
  if (!retryConfig.shouldRetry) {
    return axios(config)
  }
  
  let lastError
  const totalAttempts = retryConfig.retries + 1
  
  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
    try {
      if (attempt > 1) {
        const delayMs = calculateRetryDelay(attempt - 1, retryConfig)
        
        // 记录重试日志
        logRetry({
          url: config.url,
          method: config.method,
          attempt: attempt - 1,
          totalAttempts: retryConfig.retries,
          delay: delayMs,
          error: lastError
        })
        
        await delay(delayMs)
      }
      
      // 复制配置以避免修改原始配置
      const requestConfig = { 
        ...config,
        _currentRetry: attempt - 1,
        _totalRetries: retryConfig.retries
      }
      delete requestConfig.retry // 移除重试配置，避免无限递归
      
      const response = await axios(requestConfig)
      
      // 记录成功日志
      if (attempt > 1) {
        logRetry({
          url: config.url,
          method: config.method,
          attempt: attempt - 1,
          totalAttempts: retryConfig.retries,
          success: true
        })
      }
      
      return response
    } catch (error) {
      lastError = error
      
      // 检查是否应该重试
      if (attempt === totalAttempts || !retryConfig.retryCondition(error, config)) {
        break
      }
    }
  }
  
  // 记录最终失败日志
  logRetry({
    url: config.url,
    method: config.method,
    attempt: retryConfig.retries,
    totalAttempts: retryConfig.retries,
    error: lastError
  })
  
  throw lastError
}

// request拦截器
service.interceptors.request.use(config => {
  if (store.getters.token) {
    config.headers['Authorization'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
  }
  
  // 标记这是通过service发送的请求，需要重试机制
  config._useRetry = true
  
  return config
}, error => {
  // Do something with request error
  console.log(error) // for debug
  return Promise.reject(error)
})

// 重写service的request方法以支持重试
const originalRequest = service.request
service.request = function(config) {
  // 如果配置了重试且不是重试中的请求，使用重试逻辑
  if (config._useRetry && !config._isRetrying) {
    return executeWithRetry({
      ...config,
      _isRetrying: true // 标记为重试中，避免嵌套重试
    })
  }
  return originalRequest.call(this, config)
}

// respone拦截器
service.interceptors.response.use(
  response => {
  /**
  * code为非200是抛错 可结合自己业务进行修改
  */
    const res = response.data
    if (res.code !== 200) {
      // 仅在非重试过程中显示错误消息，避免重复提示
      if (!response.config._isRetrying || response.config._currentRetry === response.config.retry?.retries) {
        Message({
          message: res.message,
          type: 'error',
          duration: 3 * 1000
        })
      }

      // 401:未登录;
      if (res.code === 401) {
        MessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('FedLogOut').then(() => {
            location.reload()// 为了重新实例化vue-router对象 避免bug
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return response.data
    }
  },
  error => {
    console.log('err' + error)// for debug
    
    // 仅在非重试过程中或最后一次重试失败时显示错误消息
    if (!error.config || !error.config._isRetrying || 
        (error.config._currentRetry >= (error.config._totalRetries || 0))) {
      const message = error.response?.data?.message || error.message || '请求失败'
      Message({
        message: message,
        type: 'error',
        duration: 3 * 1000
      })
    }
    
    return Promise.reject(error)
  }
)

// 创建自定义请求函数，支持单独配置重试参数
service.createRequest = function(customRetryConfig = {}) {
  return function(config) {
    const mergedConfig = {
      ...config,
      retry: {
        ...customRetryConfig,
        ...(config.retry || {})
      },
      _useRetry: true
    }
    return service.request(mergedConfig)
  }
}

// 导出重试配置以供外部使用
service.DEFAULT_RETRY_CONFIG = DEFAULT_RETRY_CONFIG
service.RETRY_STRATEGIES = RETRY_STRATEGIES

// 便捷方法：创建不同策略的请求函数
service.createCriticalRequest = service.createRequest(getRetryConfigByStrategy(RETRY_STRATEGIES.CRITICAL))
service.createFastFailRequest = service.createRequest(getRetryConfigByStrategy(RETRY_STRATEGIES.FAST_FAIL))
service.createNoRetryRequest = service.createRequest(getRetryConfigByStrategy(RETRY_STRATEGIES.NO_RETRY))

export default service
