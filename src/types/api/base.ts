/**
 * API 基础响应类型定义
 */

// 基础响应接口
export interface BaseResponse<T = any> {
  code: number
  message: string
  data: T
}

// 简单响应（无数据）
export interface SimpleResponse {
  code: number
  message: string
}

// 分页数据结构
export interface PageInfo {
  pageNum: number
  pageSize: number
  total: number
  totalPage: number
}

// 列表响应接口
export interface ListResponse<T = any> extends BaseResponse<T[]> {
  data: T[]
  pageInfo?: PageInfo
}

// 详情响应接口
export interface DetailResponse<T = any> extends BaseResponse<T> {
  data: T
}

// 基础实体接口
export interface BaseEntity {
  id?: number
  createTime?: string
  updateTime?: string
}

// 查询参数基础接口
export interface BaseQuery {
  pageNum?: number
  pageSize?: number
  keyword?: string
}

// 状态枚举
export enum Status {
  DISABLED = 0,
  ENABLED = 1
}

// HTTP 方法类型
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// 请求配置接口
export interface RequestConfig {
  url: string
  method: HttpMethod
  data?: any
  params?: any
  headers?: Record<string, string>
}