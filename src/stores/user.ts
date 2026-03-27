import { defineStore } from 'pinia'
import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'

interface UserState {
  token: string
  name: string
  avatar: string
  roles: string[]
}

interface LoginParams {
  username: string
  password: string
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: getToken() || '',
    name: '',
    avatar: '',
    roles: []
  }),

  getters: {
    userToken: (state) => state.token,
    userName: (state) => state.name,
    userAvatar: (state) => state.avatar,
    userRoles: (state) => state.roles,
    isLoggedIn: (state) => !!state.token
  },

  actions: {
    // 设置token
    setToken(token: string) {
      this.token = token
    },

    // 设置用户信息
    setUserInfo(info: { name: string; avatar: string; roles: string[] }) {
      this.name = info.name
      this.avatar = info.avatar
      this.roles = info.roles
    },

    // 登录
    async login(userInfo: LoginParams) {
      try {
        const username = userInfo.username.trim()
        const response = await login(username, userInfo.password)
        const data = response.data
        const tokenStr = data.tokenHead + data.token
        
        setToken(tokenStr)
        this.setToken(tokenStr)
        
        return Promise.resolve()
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 获取用户信息
    async getUserInfo() {
      try {
        const response = await getInfo()
        const data = response.data
        
        if (data.roles && data.roles.length > 0) {
          this.setUserInfo({
            name: data.username,
            avatar: data.icon,
            roles: data.roles
          })
        } else {
          throw new Error('getUserInfo: roles must be a non-null array!')
        }
        
        return Promise.resolve(response)
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 登出
    async logout() {
      try {
        await logout(this.token)
        this.resetUserInfo()
        return Promise.resolve()
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 前端登出
    fedLogout() {
      this.resetUserInfo()
      return Promise.resolve()
    },

    // 重置用户信息
    resetUserInfo() {
      this.token = ''
      this.name = ''
      this.avatar = ''
      this.roles = []
      removeToken()
    }
  }
})