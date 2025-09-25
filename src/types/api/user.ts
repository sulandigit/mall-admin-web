import { BaseEntity, BaseQuery, BaseResponse, DetailResponse, ListResponse } from './base'

/**
 * 用户相关类型定义
 */

// 用户实体接口
export interface User extends BaseEntity {
  username: string
  password?: string
  email?: string
  nickName?: string
  note?: string
  status: number
  icon?: string
  loginTime?: string
}

// 管理员用户接口
export interface AdminUser extends User {
  roles?: Role[]
}

// 角色接口
export interface Role extends BaseEntity {
  name: string
  description?: string
  adminCount?: number
  sort?: number
  status: number
}

// 权限资源接口
export interface Resource extends BaseEntity {
  categoryId?: number
  name: string
  url?: string
  description?: string
  sort?: number
}

// 菜单接口
export interface Menu extends BaseEntity {
  parentId?: number
  title: string
  level: number
  sort?: number
  name?: string
  icon?: string
  hidden: number
  children?: Menu[]
}

// 登录请求参数
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应数据
export interface LoginResponse {
  token: string
  tokenHead: string
}

// 用户信息响应
export interface UserInfoResponse {
  username: string
  icon?: string
  roles: string[]
  menus: Menu[]
}

// 用户查询参数
export interface UserQuery extends BaseQuery {
  name?: string
  status?: number
}

// 用户表单数据
export interface UserForm {
  username: string
  password?: string
  email?: string
  nickName?: string
  note?: string
  status: number
  roleIds?: number[]
}

// 角色分配请求
export interface AllocRoleRequest {
  adminId: number
  roleIds: number[]
}

// API 响应类型
export type LoginApiResponse = BaseResponse<LoginResponse>
export type UserInfoApiResponse = BaseResponse<UserInfoResponse>
export type UserListApiResponse = ListResponse<AdminUser>
export type UserDetailApiResponse = DetailResponse<AdminUser>
export type RoleListApiResponse = ListResponse<Role>
export type MenuListApiResponse = ListResponse<Menu>
export type ResourceListApiResponse = ListResponse<Resource>