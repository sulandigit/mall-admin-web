import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import user from '@/store/modules/user'
import * as authUtils from '@/utils/auth'

// Mock API modules
jest.mock('@/api/login', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  getInfo: jest.fn()
}))

jest.mock('@/utils/auth', () => ({
  getToken: jest.fn(),
  setToken: jest.fn(),
  removeToken: jest.fn()
}))

import { login, logout, getInfo } from '@/api/login'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('store/user.js', () => {
  let store
  
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
    
    authUtils.getToken.mockReturnValue('test-token')
    
    store = new Vuex.Store({
      modules: {
        user: {
          namespaced: true,
          ...user
        }
      }
    })
  })
  
  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const state = store.state.user
      
      expect(state.token).toBe('test-token')
      expect(state.name).toBe('')
      expect(state.avatar).toBe('')
      expect(state.roles).toEqual([])
      expect(state.permissions).toEqual([])
      expect(state.userInfo).toEqual({})
      expect(state.loginTime).toBeNull()
      expect(typeof state.lastActivity).toBe('number')
    })
  })
  
  describe('mutations', () => {
    it('SET_TOKEN 应该设置token', () => {
      store.commit('user/SET_TOKEN', 'new-token')
      
      expect(store.state.user.token).toBe('new-token')
    })
    
    it('SET_NAME 应该设置用户名', () => {
      store.commit('user/SET_NAME', 'test-user')
      
      expect(store.state.user.name).toBe('test-user')
    })
    
    it('SET_AVATAR 应该设置头像', () => {
      store.commit('user/SET_AVATAR', 'avatar-url')
      
      expect(store.state.user.avatar).toBe('avatar-url')
    })
    
    it('SET_ROLES 应该设置角色', () => {
      const roles = ['admin', 'user']
      store.commit('user/SET_ROLES', roles)
      
      expect(store.state.user.roles).toEqual(roles)
    })
    
    it('SET_PERMISSIONS 应该设置权限', () => {
      const permissions = ['read', 'write']
      store.commit('user/SET_PERMISSIONS', permissions)
      
      expect(store.state.user.permissions).toEqual(permissions)
    })
    
    it('SET_USER_INFO 应该设置用户信息', () => {
      const userInfo = { id: 1, name: 'test' }
      store.commit('user/SET_USER_INFO', userInfo)
      
      expect(store.state.user.userInfo).toEqual(userInfo)
    })
    
    it('SET_LOGIN_TIME 应该设置登录时间并持久化', () => {
      const loginTime = Date.now()
      store.commit('user/SET_LOGIN_TIME', loginTime)
      
      expect(store.state.user.loginTime).toBe(loginTime)
      expect(localStorage.getItem('loginTime')).toBe(loginTime.toString())
    })
    
    it('UPDATE_LAST_ACTIVITY 应该更新最后活动时间', () => {
      const beforeTime = store.state.user.lastActivity
      
      store.commit('user/UPDATE_LAST_ACTIVITY')
      
      expect(store.state.user.lastActivity).toBeGreaterThan(beforeTime)
    })
    
    it('CLEAR_USER_DATA 应该清除所有用户数据', () => {
      // 先设置一些数据
      store.commit('user/SET_TOKEN', 'test-token')
      store.commit('user/SET_NAME', 'test-user')
      store.commit('user/SET_LOGIN_TIME', Date.now())
      
      // 清除数据
      store.commit('user/CLEAR_USER_DATA')
      
      expect(store.state.user.token).toBe('')
      expect(store.state.user.name).toBe('')
      expect(store.state.user.roles).toEqual([])
      expect(store.state.user.permissions).toEqual([])
      expect(store.state.user.userInfo).toEqual({})
      expect(store.state.user.loginTime).toBeNull()
      expect(localStorage.getItem('loginTime')).toBeNull()
    })
  })
  
  describe('actions', () => {
    describe('login', () => {
      it('应该成功登录并设置token和登录时间', async () => {
        const mockResponse = {
          data: {
            token: 'api-token',
            tokenHead: 'Bearer '
          }
        }
        login.mockResolvedValue(mockResponse)
        
        const userInfo = { username: 'testuser', password: 'password' }
        
        await store.dispatch('user/login', userInfo)
        
        expect(login).toHaveBeenCalledWith('testuser', 'password')
        expect(authUtils.setToken).toHaveBeenCalledWith('Bearer api-token')
        expect(store.state.user.token).toBe('Bearer api-token')
        expect(store.state.user.loginTime).toBeTruthy()
      })
      
      it('应该处理登录失败', async () => {
        const error = new Error('Login failed')
        login.mockRejectedValue(error)
        
        const userInfo = { username: 'testuser', password: 'password' }
        
        await expect(store.dispatch('user/login', userInfo)).rejects.toThrow('Login failed')
      })
    })
    
    describe('getInfo', () => {
      it('应该成功获取用户信息', async () => {
        const mockResponse = {
          data: {
            username: 'testuser',
            icon: 'avatar-url',
            roles: ['admin'],
            menus: [{ name: 'dashboard' }]
          }
        }
        getInfo.mockResolvedValue(mockResponse)
        
        const response = await store.dispatch('user/getInfo')
        
        expect(getInfo).toHaveBeenCalled()
        expect(store.state.user.name).toBe('testuser')
        expect(store.state.user.avatar).toBe('avatar-url')
        expect(store.state.user.roles).toEqual(['admin'])
        expect(store.state.user.permissions).toEqual(['dashboard'])
        expect(response).toBe(mockResponse)
      })
      
      it('应该处理空角色错误', async () => {
        const mockResponse = {
          data: {
            username: 'testuser',
            roles: []
          }
        }
        getInfo.mockResolvedValue(mockResponse)
        
        await expect(store.dispatch('user/getInfo')).rejects.toThrow('getInfo: roles must be a non-null array !')
      })
    })
    
    describe('logout', () => {
      it('应该成功登出', async () => {
        logout.mockResolvedValue({})
        
        await store.dispatch('user/logout')
        
        expect(logout).toHaveBeenCalledWith(store.state.user.token)
        expect(authUtils.removeToken).toHaveBeenCalled()
        expect(store.state.user.token).toBe('')
      })
    })
    
    describe('fedLogOut', () => {
      it('应该前端登出', async () => {
        await store.dispatch('user/fedLogOut')
        
        expect(authUtils.removeToken).toHaveBeenCalled()
        expect(store.state.user.token).toBe('')
      })
    })
    
    describe('updateActivity', () => {
      it('应该更新用户活动时间', () => {
        const beforeTime = store.state.user.lastActivity
        
        store.dispatch('user/updateActivity')
        
        expect(store.state.user.lastActivity).toBeGreaterThan(beforeTime)
      })
    })
    
    describe('checkSessionExpiry', () => {
      it('应该返回true当会话未过期时', () => {
        // 设置最近的活动时间
        store.commit('user/UPDATE_LAST_ACTIVITY')
        store.commit('user/SET_TOKEN', 'valid-token')
        
        const isValid = store.dispatch('user/checkSessionExpiry', 30 * 60 * 1000) // 30分钟
        
        expect(isValid).toBe(true)
      })
      
      it('应该返回false并清除token当会话过期时', () => {
        // 设置过期的活动时间
        const expiredTime = Date.now() - 31 * 60 * 1000 // 31分钟前
        store.state.user.lastActivity = expiredTime
        store.commit('user/SET_TOKEN', 'expired-token')
        
        const isValid = store.dispatch('user/checkSessionExpiry', 30 * 60 * 1000) // 30分钟
        
        expect(isValid).toBe(false)
        expect(store.state.user.token).toBe('')
      })
    })
  })
  
  describe('getters', () => {
    it('应该正确返回基本getter值', () => {
      store.commit('user/SET_TOKEN', 'test-token')
      store.commit('user/SET_NAME', 'test-user')
      store.commit('user/SET_AVATAR', 'avatar-url')
      store.commit('user/SET_ROLES', ['admin'])
      
      expect(store.getters['user/token']).toBe('test-token')
      expect(store.getters['user/name']).toBe('test-user')
      expect(store.getters['user/avatar']).toBe('avatar-url')
      expect(store.getters['user/roles']).toEqual(['admin'])
    })
    
    it('isLoggedIn 应该正确判断登录状态', () => {
      store.commit('user/SET_TOKEN', '')
      expect(store.getters['user/isLoggedIn']).toBe(false)
      
      store.commit('user/SET_TOKEN', 'valid-token')
      expect(store.getters['user/isLoggedIn']).toBe(true)
    })
    
    it('hasRole 应该正确判断角色权限', () => {
      store.commit('user/SET_ROLES', ['admin', 'user'])
      
      expect(store.getters['user/hasRole']('admin')).toBe(true)
      expect(store.getters['user/hasRole']('guest')).toBe(false)
    })
    
    it('hasPermission 应该正确判断操作权限', () => {
      store.commit('user/SET_PERMISSIONS', ['read', 'write'])
      
      expect(store.getters['user/hasPermission']('read')).toBe(true)
      expect(store.getters['user/hasPermission']('delete')).toBe(false)
    })
    
    it('sessionDuration 应该计算会话持续时间', () => {
      const loginTime = Date.now() - 60000 // 1分钟前
      store.commit('user/SET_LOGIN_TIME', loginTime)
      
      const duration = store.getters['user/sessionDuration']
      expect(duration).toBeGreaterThanOrEqual(60000)
      expect(duration).toBeLessThan(65000) // 允许5秒误差
    })
    
    it('inactiveTime 应该计算非活动时间', () => {
      const lastActivity = Date.now() - 30000 // 30秒前
      store.state.user.lastActivity = lastActivity
      
      const inactiveTime = store.getters['user/inactiveTime']
      expect(inactiveTime).toBeGreaterThanOrEqual(30000)
      expect(inactiveTime).toBeLessThan(35000) // 允许5秒误差
    })
  })
})