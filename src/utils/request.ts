import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getToken } from '@/utils/auth'

// 响应接口定义
interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = getToken()
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = token
    }
    
    // 添加请求时间戳，防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        t: Date.now()
      }
    }
    
    return config
  },
  (error: AxiosError) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    
    // 成功响应
    if (res.code === 200) {
      return res
    }
    
    // 业务错误处理
    ElMessage.error(res.message || '请求失败')
    
    // 身份验证失败
    if (res.code === 401) {
      handleAuthError()
      return Promise.reject(new Error(res.message || '身份验证失败'))
    }
    
    // 权限不足
    if (res.code === 403) {
      ElMessage.error('权限不足')
      return Promise.reject(new Error('权限不足'))
    }
    
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error: AxiosError) => {
    console.error('Response error:', error)
    
    let message = '网络错误'
    
    if (error.response) {
      const status = error.response.status
      switch (status) {
        case 401:
          message = '身份验证失败'
          handleAuthError()
          break
        case 403:
          message = '权限不足'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        case 502:
          message = '网关错误'
          break
        case 503:
          message = '服务暂不可用'
          break
        case 504:
          message = '网关超时'
          break
        default:
          message = `请求失败 ${status}`
      }
    } else if (error.request) {
      message = '网络连接失败'
    }
    
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

// 处理身份验证错误
function handleAuthError() {
  ElMessageBox.confirm(
    '您的登录状态已过期，请重新登录',
    '登录过期',
    {
      confirmButtonText: '重新登录',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const userStore = useUserStore()
    userStore.fedLogout().then(() => {
      window.location.reload()
    })
  }).catch(() => {
    // 用户取消
  })
}

// 导出常用请求方法
export const request = {
  get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    return service.get(url, { params })
  },
  
  post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return service.post(url, data)
  },
  
  put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return service.put(url, data)
  },
  
  delete<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    return service.delete(url, { params })
  }
}

export default service