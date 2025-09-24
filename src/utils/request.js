import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import { getToken } from '@/utils/auth'
import CSRFInterceptor from '@/security/csrf-interceptor'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api的base_url
  timeout: 15000 // 请求超时时间
})

// 初始化CSRF拦截器
const csrfInterceptor = new CSRFInterceptor(service, {
  enabled: true,
  debug: process.env.NODE_ENV === 'development',
  skipRoutes: ['/auth/login', '/auth/logout', '/auth/refresh'],
  retryCount: 2,
  retryDelay: 1000
})

// request拦截器
service.interceptors.request.use(config => {
  // 添加认证token
  if (store.getters.token) {
    config.headers['Authorization'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
  }
  
  // CSRF拦截器会自动处理CSRF token
  return config
}, error => {
  // Do something with request error
  console.log(error) // for debug
  Promise.reject(error)
})

// respone拦截器
service.interceptors.response.use(
  response => {
  /**
  * code为非200是抛错 可结合自己业务进行修改
  */
    const res = response.data
    if (res.code !== 200) {
      Message({
        message: res.message,
        type: 'error',
        duration: 3 * 1000
      })

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
      return Promise.reject('error')
    } else {
      return response.data
    }
  },
  error => {
    console.log('err' + error)// for debug
    
    // 检查是否是CSRF错误，如果是则由CSRF拦截器处理
    if (error.isCSRFError) {
      Message({
        message: 'CSRF验证失败，请刷新页面重试',
        type: 'error',
        duration: 3 * 1000
      })
    } else {
      Message({
        message: error.message,
        type: 'error',
        duration: 3 * 1000
      })
    }
    
    return Promise.reject(error)
  }
)

export default service

// 导出CSRF拦截器实例，供其他模块使用
export { csrfInterceptor }
