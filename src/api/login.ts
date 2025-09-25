import request from '@/utils/request'
import {
  LoginRequest,
  LoginApiResponse,
  UserInfoApiResponse,
  UserListApiResponse,
  UserDetailApiResponse,
  RoleListApiResponse,
  UserForm,
  UserQuery,
  AllocRoleRequest,
  BaseResponse,
  SimpleResponse
} from '@/types'

export function login(username: string, password: string): Promise<LoginApiResponse> {
  return request({
    url: '/admin/login',
    method: 'post',
    data: {
      username,
      password
    }
  })
}

export function getInfo(): Promise<UserInfoApiResponse> {
  return request({
    url: '/admin/info',
    method: 'get',
  })
}

export function logout(): Promise<SimpleResponse> {
  return request({
    url: '/admin/logout',
    method: 'post'
  })
}

export function fetchList(params: UserQuery): Promise<UserListApiResponse> {
  return request({
    url: '/admin/list',
    method: 'get',
    params: params
  })
}

export function createAdmin(data: UserForm): Promise<SimpleResponse> {
  return request({
    url: '/admin/register',
    method: 'post',
    data: data
  })
}

export function updateAdmin(id: number, data: UserForm): Promise<SimpleResponse> {
  return request({
    url: '/admin/update/' + id,
    method: 'post',
    data: data
  })
}

export function updateStatus(id: number, params: { status: number }): Promise<SimpleResponse> {
  return request({
    url: '/admin/updateStatus/' + id,
    method: 'post',
    params: params
  })
}

export function deleteAdmin(id: number): Promise<SimpleResponse> {
  return request({
    url: '/admin/delete/' + id,
    method: 'post'
  })
}

export function getRoleByAdmin(id: number): Promise<RoleListApiResponse> {
  return request({
    url: '/admin/role/' + id,
    method: 'get'
  })
}

export function allocRole(data: AllocRoleRequest): Promise<SimpleResponse> {
  return request({
    url: '/admin/role/update',
    method: 'post',
    data: data
  })
}
