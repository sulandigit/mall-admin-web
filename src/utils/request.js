import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import { getToken } from '@/utils/auth'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api的base_url
  timeout: 15000 // 请求超时时间
})

import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import { getToken, removeToken } from '@/utils/auth'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api的base_url
  timeout: 15000 // 请求超时时间
})

// request拦截器
service.interceptors.request.use(async config => {
  try {
    // 使用异步方式获取token
    let token = null
    
    // 优先从store获取token（可能为空）
    if (store.getters.token) {
      token = store.getters.token
    } else {
      // 如果store中没有token，从安全存储获取
      token = await getToken()
      
      // 如果获取到token，更新store状态
      if (token) {
        store.commit('SET_TOKEN', token)
      }
    }
    
    // 添加token到请求头
    if (token) {
      config.headers['Authorization'] = token
    }
    
    return config
  } catch (error) {
    console.error('Request interceptor error:', error)
    // 出错时继续请求，但不添加token
    return config
  }
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
        }).then(async () => {
          // 使用异步方式清理token
          try {
            await store.dispatch('FedLogOut')
            location.reload() // 为了重新实例化vue-router对象 避免bug
          } catch (error) {
            console.error('Logout error:', error)
            // 即使登出出错，也要刷新页面
            location.reload()
          }
        })
      }
      return Promise.reject('error')
    } else {
      return response.data
    }
  },
  error => {
    console.log('err' + error)// for debug
    
    // 处理网络错误和未授权错误
    if (error.response) {
      const status = error.response.status
      
      if (status === 401) {
        // Token过期或无效，清理本地存储
        MessageBox.confirm('登录状态已过期，请重新登录', '登录过期', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          try {
            await store.dispatch('FedLogOut')
            location.reload()
          } catch (logoutError) {
            console.error('Logout error:', logoutError)
            location.reload()
          }
        })
      } else if (status === 403) {
        Message({
          message: '没有访问权限，请联系管理员',
          type: 'error',
          duration: 3 * 1000
        })
      } else {
        Message({
          message: error.response.data?.message || error.message || '请求失败',
          type: 'error',
          duration: 3 * 1000
        })
      }
    } else {
      // 网络错误或超时
      Message({
        message: '网络连接失败，请检查网络连接',
        type: 'error',
        duration: 3 * 1000
      })
    }
    
    return Promise.reject(error)
  }
)

export default service
