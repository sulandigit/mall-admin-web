/**
 * 工具函数类型定义
 */

// HTTP 请求配置类型
export interface HttpRequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: any
  params?: any
  headers?: Record<string, string>
  timeout?: number
  baseURL?: string
}

// HTTP 响应类型
export interface HttpResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: any
  config: HttpRequestConfig
}

// 认证相关类型
export interface AuthToken {
  token: string
  refreshToken?: string
  expiresIn?: number
  tokenType?: string
}

// Cookie 选项
export interface CookieOptions {
  expires?: number | Date
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

// 日期格式化选项
export interface DateFormatOptions {
  format?: string
  locale?: string
  timezone?: string
}

// 验证规则类型
export interface ValidationRule {
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'date'
  min?: number
  max?: number
  pattern?: RegExp | string
  message?: string
  validator?: (value: any) => boolean | string
}

// 文件上传类型
export interface FileUploadOptions {
  accept?: string
  maxSize?: number
  multiple?: boolean
  compress?: boolean
  quality?: number
}

// 工具函数返回类型
export type UtilResult<T = any> = {
  success: boolean
  data?: T
  message?: string
  error?: Error
}

// 异步操作状态
export interface AsyncState<T = any> {
  loading: boolean
  data: T | null
  error: Error | null
}