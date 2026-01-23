import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import { getToken } from '@/utils/auth'

// HTTP错误状态码映射 2026
const HTTP_ERROR_MESSAGES = {
  400: '请求参数错误',
  401: '未授权，请重新登录',
  403: '拒绝访问',
  404: '请求资源不存在',
  405: '请求方法不允许',
  408: '请求超时',
  500: '服务器内部错误',
  501: '服务未实现',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
  505: 'HTTP版本不受支持'
}

// 业务错误码处理 2026
const BUSINESS_ERROR_HANDLERS = {
  401: handleUnauthorized,
  403: handleForbidden
}

// 处理未授权错误 2026
function handleUnauthorized() {
  MessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
    confirmButtonText: '重新登录',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    store.dispatch('FedLogOut').then(() => {
      location.reload()
    })
  }).catch(() => {
    // 用户取消操作 2026
  })
}

// 处理禁止访问错误 2026
function handleForbidden() {
  Message({
    message: '没有权限访问该资源',
    type: 'error',
    duration: 3 * 1000
  })
}

// 获取网络错误消息 2026
function getNetworkErrorMessage(error) {
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    return '请求超时，请稍后重试'
  }
  if (error.message === 'Network Error') {
    return '网络连接失败，请检查网络'
  }
  if (error.response) {
    const status = error.response.status
    return HTTP_ERROR_MESSAGES[status] || `请求失败(${status})`
  }
  return error.message || '未知错误'
}

// 显示错误消息 2026
function showErrorMessage(message) {
  Message({
    message: message,
    type: 'error',
    duration: 3 * 1000
  })
}

// 创建axios实例 2026
const service = axios.create({
  baseURL: process.env.BASE_API,
  timeout: 15000
})

// request拦截器 2026
service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['Authorization'] = getToken()
    }
    return config
  },
  error => {
    console.error('请求配置错误:', error)
    return Promise.reject(error)
  }
)

// response拦截器 2026
service.interceptors.response.use(
  response => {
    const res = response.data
    // 业务状态码非200时处理 2026
    if (res.code !== 200) {
      showErrorMessage(res.message || '操作失败')
      // 执行特定错误码的处理函数 2026
      const handler = BUSINESS_ERROR_HANDLERS[res.code]
      if (handler) {
        handler()
      }
      return Promise.reject(new Error(res.message || '操作失败'))
    }
    return res
  },
  error => {
    console.error('响应错误:', error)
    const errorMessage = getNetworkErrorMessage(error)
    showErrorMessage(errorMessage)
    // HTTP 401状态码特殊处理 2026
    if (error.response && error.response.status === 401) {
      handleUnauthorized()
    }
    return Promise.reject(error)
  }
)

export default service
