/**
 * API请求重试配置模块
 * 提供不同场景下的重试策略配置
 */

// 重试策略枚举
export const RETRY_STRATEGIES = {
  CRITICAL: 'critical',     // 关键接口，高重试次数
  NORMAL: 'normal',         // 普通接口，标准重试
  FAST_FAIL: 'fastFail',    // 快速失败，低重试次数
  NO_RETRY: 'noRetry'       // 不重试
}

// 预定义的重试配置
export const RETRY_CONFIGS = {
  [RETRY_STRATEGIES.CRITICAL]: {
    retries: 5,
    retryDelay: 2000,
    retryDelayMultiplier: 2,
    retryDelayMax: 30000,
    shouldRetry: true,
    description: '关键接口配置：高重试次数，适用于重要业务操作'
  },
  
  [RETRY_STRATEGIES.NORMAL]: {
    retries: 3,
    retryDelay: 1000,
    retryDelayMultiplier: 2,
    retryDelayMax: 10000,
    shouldRetry: true,
    description: '标准配置：适用于大部分API调用'
  },
  
  [RETRY_STRATEGIES.FAST_FAIL]: {
    retries: 1,
    retryDelay: 500,
    retryDelayMultiplier: 1.5,
    retryDelayMax: 2000,
    shouldRetry: true,
    description: '快速失败配置：适用于非关键接口或实时性要求高的操作'
  },
  
  [RETRY_STRATEGIES.NO_RETRY]: {
    retries: 0,
    shouldRetry: false,
    description: '无重试配置：适用于一次性操作或敏感操作'
  }
}

// 特定接口的重试配置映射
export const API_RETRY_MAPPING = {
  // 登录相关 - 快速失败
  '/admin/login': RETRY_STRATEGIES.FAST_FAIL,
  '/admin/logout': RETRY_STRATEGIES.NO_RETRY,
  
  // 订单相关 - 关键业务
  '/order/create': RETRY_STRATEGIES.CRITICAL,
  '/order/update': RETRY_STRATEGIES.CRITICAL,
  '/order/delete': RETRY_STRATEGIES.CRITICAL,
  
  // 支付相关 - 关键业务
  '/payment/': RETRY_STRATEGIES.CRITICAL,
  
  // 查询类接口 - 标准配置
  '/product/list': RETRY_STRATEGIES.NORMAL,
  '/order/list': RETRY_STRATEGIES.NORMAL,
  '/user/list': RETRY_STRATEGIES.NORMAL,
  
  // 文件上传 - 快速失败
  '/upload/': RETRY_STRATEGIES.FAST_FAIL,
  
  // 统计数据 - 标准配置
  '/statistics/': RETRY_STRATEGIES.NORMAL
}

/**
 * 根据API路径获取重试策略
 * @param {string} url - API路径
 * @returns {string} 重试策略名称
 */
export function getRetryStrategyByUrl(url) {
  // 精确匹配
  if (API_RETRY_MAPPING[url]) {
    return API_RETRY_MAPPING[url]
  }
  
  // 模糊匹配（支持路径前缀）
  for (const [path, strategy] of Object.entries(API_RETRY_MAPPING)) {
    if (url.startsWith(path)) {
      return strategy
    }
  }
  
  // 默认策略
  return RETRY_STRATEGIES.NORMAL
}

/**
 * 根据策略名称获取重试配置
 * @param {string} strategy - 重试策略名称
 * @returns {Object} 重试配置对象
 */
export function getRetryConfigByStrategy(strategy) {
  return RETRY_CONFIGS[strategy] || RETRY_CONFIGS[RETRY_STRATEGIES.NORMAL]
}

/**
 * 获取API的重试配置
 * @param {string} url - API路径
 * @param {Object} customConfig - 自定义配置
 * @returns {Object} 合并后的重试配置
 */
export function getAPIRetryConfig(url, customConfig = {}) {
  const strategy = getRetryStrategyByUrl(url)
  const baseConfig = getRetryConfigByStrategy(strategy)
  
  return {
    ...baseConfig,
    ...customConfig,
    _strategy: strategy
  }
}

/**
 * 判断错误是否可重试
 * @param {Error} error - 错误对象
 * @param {Object} config - 请求配置
 * @returns {boolean} 是否可重试
 */
export function isRetryableError(error, config = {}) {
  // 如果明确配置不重试
  if (config.retry && config.retry.shouldRetry === false) {
    return false
  }
  
  // 网络错误（无响应）
  if (!error.response) {
    return true
  }
  
  const status = error.response.status
  
  // 5xx 服务器错误
  if (status >= 500) {
    return true
  }
  
  // 特定的4xx错误
  const retryable4xxCodes = [408, 429] // 请求超时、请求过多
  if (retryable4xxCodes.includes(status)) {
    return true
  }
  
  // 特定业务错误码（根据实际业务调整）
  if (error.response.data && error.response.data.code) {
    const businessCode = error.response.data.code
    const retryableBusinessCodes = [1001, 1002] // 系统繁忙、临时不可用等
    return retryableBusinessCodes.includes(businessCode)
  }
  
  return false
}

/**
 * 记录重试日志
 * @param {Object} logData - 日志数据
 */
export function logRetry(logData) {
  const {
    url,
    method,
    attempt,
    totalAttempts,
    delay,
    error,
    success = false
  } = logData
  
  const timestamp = new Date().toISOString()
  const logLevel = success ? 'info' : (attempt === totalAttempts ? 'error' : 'warn')
  
  const message = success 
    ? `[RETRY SUCCESS] ${method?.toUpperCase()} ${url} - 第${attempt}次重试成功`
    : attempt === totalAttempts 
      ? `[RETRY FAILED] ${method?.toUpperCase()} ${url} - 所有重试均失败 (${totalAttempts}次)`
      : `[RETRY] ${method?.toUpperCase()} ${url} - 第${attempt}次重试，${delay}ms后执行`
  
  const logData_full = {
    timestamp,
    level: logLevel,
    message,
    url,
    method,
    attempt,
    totalAttempts,
    delay,
    error: error ? {
      message: error.message,
      status: error.response?.status,
      code: error.response?.data?.code
    } : null
  }
  
  // 输出到控制台
  console[logLevel](`[API-RETRY] ${message}`, logData_full)
  
  // 这里可以添加其他日志记录方式
  // 例如发送到日志服务、本地存储等
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const logs = JSON.parse(localStorage.getItem('api_retry_logs') || '[]')
      logs.push(logData_full)
      
      // 只保留最近100条日志
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100)
      }
      
      localStorage.setItem('api_retry_logs', JSON.stringify(logs))
    } catch (e) {
      console.warn('无法保存重试日志到localStorage:', e)
    }
  }
}

/**
 * 获取重试统计信息
 * @returns {Object} 统计信息
 */
export function getRetryStats() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { logs: [], summary: {} }
  }
  
  try {
    const logs = JSON.parse(localStorage.getItem('api_retry_logs') || '[]')
    
    const summary = logs.reduce((acc, log) => {
      const key = `${log.method} ${log.url}`
      if (!acc[key]) {
        acc[key] = { total: 0, success: 0, failed: 0 }
      }
      
      acc[key].total++
      if (log.level === 'info') {
        acc[key].success++
      } else if (log.level === 'error') {
        acc[key].failed++
      }
      
      return acc
    }, {})
    
    return { logs, summary }
  } catch (e) {
    console.warn('无法读取重试统计信息:', e)
    return { logs: [], summary: {} }
  }
}

/**
 * 清除重试日志
 */
export function clearRetryLogs() {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('api_retry_logs')
  }
}