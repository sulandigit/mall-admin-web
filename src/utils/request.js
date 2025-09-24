import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import { getToken } from '@/utils/auth'
import { handleError } from '@/utils/errorHandler'
import { parseHttpError, parseBusinessError } from '@/utils/errorTypes'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api的base_url
  timeout: 15000 // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['Authorization'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    
    // 添加请求开始时间，用于超时监控
    config.metadata = { startTime: new Date() }
    
    return config
  },
  error => {
    // 请求配置错误
    const errorInfo = {
      type: 'HTTP_BAD_REQUEST',
      message: '请求配置错误',
      level: 'medium',
      extra: {
        config: error.config,
        originalError: error
      }
    }
    
    handleError(errorInfo)
    return Promise.reject(error)
  }
)

// response拦截器
service.interceptors.response.use(
  response => {
    // 计算请求时间
    if (response.config.metadata?.startTime) {
      const duration = new Date() - response.config.metadata.startTime
      if (duration > 5000) { // 5秒以上记录为慢请求
        console.warn(`慢请求检测: ${response.config.url} 耗时 ${duration}ms`)
      }
    }
    
    /**
     * code为非200是抛错 可结合自己业务进行修改
     */
    const res = response.data
    
    // 成功响应
    if (res.code === 200) {
      return response.data
    }
    
    // 业务错误处理
    const businessError = parseBusinessError(res)
    
    // 特殊处理401未登录情况
    if (res.code === 401) {
      // 使用错误处理器的统一处理
      handleError({
        ...businessError,
        extra: {
          ...businessError.extra,
          shouldLogout: true
        }
      })
    } else {
      // 其他业务错误
      handleError(businessError)
    }
    
    return Promise.reject(businessError)
  },
  error => {
    // HTTP错误处理
    const httpError = parseHttpError(error)
    
    // 添加请求上下文信息
    httpError.extra = {
      ...httpError.extra,
      requestUrl: error.config?.url,
      requestMethod: error.config?.method?.toUpperCase(),
      requestData: error.config?.data,
      requestParams: error.config?.params
    }
    
    handleError(httpError)
    return Promise.reject(httpError)
  }
)

export default service
