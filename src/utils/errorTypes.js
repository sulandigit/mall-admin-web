import { ERROR_TYPES, ERROR_LEVELS } from './errorHandler'

/**
 * HTTP状态码错误映射
 */
export const HTTP_ERROR_MAP = {
  400: {
    type: ERROR_TYPES.HTTP_BAD_REQUEST,
    level: ERROR_LEVELS.MEDIUM,
    message: '请求参数错误，请检查输入信息'
  },
  401: {
    type: ERROR_TYPES.HTTP_UNAUTHORIZED,
    level: ERROR_LEVELS.HIGH,
    message: '身份验证失败，请重新登录'
  },
  403: {
    type: ERROR_TYPES.HTTP_FORBIDDEN,
    level: ERROR_LEVELS.HIGH,
    message: '权限不足，无法访问此资源'
  },
  404: {
    type: ERROR_TYPES.HTTP_NOT_FOUND,
    level: ERROR_LEVELS.MEDIUM,
    message: '请求的资源不存在'
  },
  408: {
    type: ERROR_TYPES.HTTP_TIMEOUT,
    level: ERROR_LEVELS.MEDIUM,
    message: '请求超时，请稍后重试'
  },
  500: {
    type: ERROR_TYPES.HTTP_SERVER_ERROR,
    level: ERROR_LEVELS.HIGH,
    message: '服务器内部错误，请稍后重试'
  },
  502: {
    type: ERROR_TYPES.HTTP_SERVER_ERROR,
    level: ERROR_LEVELS.HIGH,
    message: '网关错误，请稍后重试'
  },
  503: {
    type: ERROR_TYPES.HTTP_SERVER_ERROR,
    level: ERROR_LEVELS.HIGH,
    message: '服务暂时不可用，请稍后重试'
  },
  504: {
    type: ERROR_TYPES.HTTP_TIMEOUT,
    level: ERROR_LEVELS.MEDIUM,
    message: '网关超时，请稍后重试'
  }
}

/**
 * 业务错误码映射（根据实际业务调整）
 */
export const BUSINESS_ERROR_MAP = {
  1001: {
    type: ERROR_TYPES.VALIDATION_ERROR,
    level: ERROR_LEVELS.MEDIUM,
    message: '用户名或密码错误'
  },
  1002: {
    type: ERROR_TYPES.BUSINESS_ERROR,
    level: ERROR_LEVELS.MEDIUM,
    message: '用户已被禁用'
  },
  1003: {
    type: ERROR_TYPES.VALIDATION_ERROR,
    level: ERROR_LEVELS.MEDIUM,
    message: '验证码错误'
  },
  2001: {
    type: ERROR_TYPES.BUSINESS_ERROR,
    level: ERROR_LEVELS.MEDIUM,
    message: '商品库存不足'
  },
  2002: {
    type: ERROR_TYPES.BUSINESS_ERROR,
    level: ERROR_LEVELS.MEDIUM,
    message: '商品已下架'
  },
  3001: {
    type: ERROR_TYPES.BUSINESS_ERROR,
    level: ERROR_LEVELS.MEDIUM,
    message: '订单状态异常'
  },
  3002: {
    type: ERROR_TYPES.BUSINESS_ERROR,
    level: ERROR_LEVELS.MEDIUM,
    message: '订单已过期'
  }
}

/**
 * 网络错误类型检查
 */
export const NETWORK_ERROR_PATTERNS = [
  'Network Error',
  'timeout',
  'ECONNABORTED',
  'ENOTFOUND',
  'ECONNREFUSED',
  'ERR_NETWORK',
  'ERR_INTERNET_DISCONNECTED'
]

/**
 * 解析HTTP错误
 */
export function parseHttpError(error) {
  // 网络错误
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    return {
      type: ERROR_TYPES.HTTP_TIMEOUT,
      level: ERROR_LEVELS.MEDIUM,
      message: '请求超时，请检查网络连接后重试',
      code: error.code,
      originalError: error
    }
  }

  // 网络连接错误
  if (NETWORK_ERROR_PATTERNS.some(pattern => 
    error.message.includes(pattern) || error.code?.includes?.(pattern)
  )) {
    return {
      type: ERROR_TYPES.HTTP_NETWORK,
      level: ERROR_LEVELS.HIGH,
      message: '网络连接异常，请检查网络设置',
      code: error.code,
      originalError: error
    }
  }

  // HTTP状态码错误
  if (error.response) {
    const status = error.response.status
    const errorInfo = HTTP_ERROR_MAP[status]
    
    if (errorInfo) {
      return {
        ...errorInfo,
        code: status,
        responseData: error.response.data,
        originalError: error,
        extra: {
          url: error.config?.url,
          method: error.config?.method?.toUpperCase()
        }
      }
    }
  }

  // 默认HTTP错误
  return {
    type: ERROR_TYPES.HTTP_SERVER_ERROR,
    level: ERROR_LEVELS.MEDIUM,
    message: error.message || '请求失败，请稍后重试',
    originalError: error
  }
}

/**
 * 解析业务错误
 */
export function parseBusinessError(response) {
  const { code, message, data } = response
  
  // 检查是否是已知的业务错误码
  const errorInfo = BUSINESS_ERROR_MAP[code]
  
  if (errorInfo) {
    return {
      ...errorInfo,
      code,
      message: message || errorInfo.message,
      data,
      extra: {
        originalResponse: response
      }
    }
  }

  // 默认业务错误
  return {
    type: ERROR_TYPES.BUSINESS_ERROR,
    level: ERROR_LEVELS.MEDIUM,
    message: message || '操作失败，请稍后重试',
    code,
    data,
    extra: {
      originalResponse: response
    }
  }
}

/**
 * 判断错误是否可重试
 */
export function isRetryableError(error) {
  const retryableTypes = [
    ERROR_TYPES.HTTP_NETWORK,
    ERROR_TYPES.HTTP_TIMEOUT,
    ERROR_TYPES.HTTP_SERVER_ERROR
  ]
  
  const retryableStatus = [408, 500, 502, 503, 504]
  
  return retryableTypes.includes(error.type) || 
         retryableStatus.includes(error.code)
}

/**
 * 获取错误的用户友好描述
 */
export function getErrorDescription(error) {
  const descriptions = {
    [ERROR_TYPES.HTTP_NETWORK]: '请检查您的网络连接是否正常',
    [ERROR_TYPES.HTTP_TIMEOUT]: '服务器响应较慢，请稍后再试',
    [ERROR_TYPES.HTTP_UNAUTHORIZED]: '请重新登录后继续操作',
    [ERROR_TYPES.HTTP_FORBIDDEN]: '请联系管理员获取相应权限',
    [ERROR_TYPES.HTTP_NOT_FOUND]: '请求的接口或资源可能已变更',
    [ERROR_TYPES.HTTP_SERVER_ERROR]: '服务器暂时出现问题，请稍后重试',
    [ERROR_TYPES.BUSINESS_ERROR]: '请根据提示信息检查操作',
    [ERROR_TYPES.VALIDATION_ERROR]: '请检查输入的信息是否正确'
  }
  
  return descriptions[error.type] || '如问题持续出现，请联系技术支持'
}