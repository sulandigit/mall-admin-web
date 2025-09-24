import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import secureStorage, { DATA_CLASSIFICATIONS } from '@/utils/secure-storage'

const user = {
  state: {
    token: '',
    name: '',
    avatar: '',
    roles: []
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    }
  },

  actions: {
    // 登录
    async Login({ commit }, userInfo) {
      const username = userInfo.username.trim()
      
      try {
        const response = await login(username, userInfo.password)
        const data = response.data
        const tokenStr = data.tokenHead + data.token
        
        // 使用异步方式设置token
        const tokenSet = await setToken(tokenStr, {
          expireTime: Date.now() + (data.expires || 30 * 60) * 1000 // 使用服务器返回的过期时间或默认30分钟
        })
        
        if (tokenSet) {
          commit('SET_TOKEN', tokenStr)
          
          // 存储用户基本信息到加密存储
          if (data.username || data.avatar) {
            await secureStorage.store('userInfo', {
              username: data.username,
              avatar: data.avatar,
              loginTime: Date.now()
            }, {
              classification: DATA_CLASSIFICATIONS.MEDIUM_SENSITIVE,
              expireTime: Date.now() + 24 * 60 * 60 * 1000 // 24小时
            })
          }
          
          console.log('✅ Login successful, token and user info stored securely')
        } else {
          throw new Error('Failed to store authentication token')
        }
        
      } catch (error) {
        console.error('Login error:', error)
        throw error
      }
    },

    // 获取用户信息
    async GetInfo({ commit, state }) {
      try {
        // 优先从加密存储获取缓存的用户信息
        const cachedUserInfo = await secureStorage.retrieve('userInfo')
        
        // 如果有缓存且在有效期内，使用缓存数据
        if (cachedUserInfo && cachedUserInfo.loginTime && 
            (Date.now() - cachedUserInfo.loginTime) < 10 * 60 * 1000) { // 10分钟内的缓存
          commit('SET_NAME', cachedUserInfo.username)
          commit('SET_AVATAR', cachedUserInfo.avatar)
          
          // 仍需要获取最新的权限信息
          if (cachedUserInfo.roles && cachedUserInfo.roles.length > 0) {
            commit('SET_ROLES', cachedUserInfo.roles)
            return { data: cachedUserInfo }
          }
        }
        
        // 从服务器获取最新用户信息
        const response = await getInfo()
        const data = response.data
        
        if (data.roles && data.roles.length > 0) {
          commit('SET_ROLES', data.roles)
        } else {
          throw new Error('getInfo: roles must be a non-null array !')
        }
        
        commit('SET_NAME', data.username)
        commit('SET_AVATAR', data.icon)
        
        // 更新加密存储中的用户信息
        await secureStorage.store('userInfo', {
          username: data.username,
          avatar: data.icon,
          roles: data.roles,
          updateTime: Date.now(),
          loginTime: cachedUserInfo?.loginTime || Date.now()
        }, {
          classification: DATA_CLASSIFICATIONS.MEDIUM_SENSITIVE,
          expireTime: Date.now() + 24 * 60 * 60 * 1000 // 24小时
        })
        
        return response
        
      } catch (error) {
        console.error('Get user info error:', error)
        throw error
      }
    },

    // 登出
    async LogOut({ commit, state }) {
      try {
        // 调用服务器登出接口
        await logout(state.token)
        
      } catch (error) {
        console.warn('Server logout failed:', error)
        // 即使服务器登出失败，也要清理本地数据
      } finally {
        // 清理本地状态和存储
        await this.dispatch('FedLogOut')
      }
    },

    // 前端 登出
    async FedLogOut({ commit }) {
      try {
        // 清理Vuex状态
        commit('SET_TOKEN', '')
        commit('SET_NAME', '')
        commit('SET_AVATAR', '')
        commit('SET_ROLES', [])
        
        // 清理加密存储中的token
        await removeToken()
        
        // 清理用户信息
        await secureStorage.remove('userInfo')
        
        // 清理所有中等敏感数据（用户会话相关）
        await secureStorage.clear(DATA_CLASSIFICATIONS.MEDIUM_SENSITIVE)
        
        console.log('✅ Logout completed, all user data cleared securely')
        
      } catch (error) {
        console.error('Logout cleanup error:', error)
        // 即使清理出错，也要确保状态被清空
        commit('SET_TOKEN', '')
        commit('SET_NAME', '')
        commit('SET_AVATAR', '')
        commit('SET_ROLES', [])
      }
    },
    
    // 刷新token
    async RefreshToken({ commit, state }) {
      try {
        if (!state.token) {
          throw new Error('No token to refresh')
        }
        
        // 这里可以调用刷新token的API
        // 暂时只延长当前token的有效期
        const success = await setToken(state.token, {
          expireTime: Date.now() + 30 * 60 * 1000 // 延长30分钟
        })
        
        if (!success) {
          throw new Error('Failed to refresh token')
        }
        
        console.log('✅ Token refreshed successfully')
        return true
        
      } catch (error) {
        console.error('Token refresh error:', error)
        // token刷新失败，可能需要重新登录
        await this.dispatch('FedLogOut')
        throw error
      }
    },
    
    // 初始化用户状态（在应用启动时调用）
    async InitUserState({ commit }) {
      try {
        // 从加密存储恢复用户状态
        const token = await getToken()
        if (token) {
          commit('SET_TOKEN', token)
          
          // 尝试恢复用户信息
          const userInfo = await secureStorage.retrieve('userInfo')
          if (userInfo) {
            commit('SET_NAME', userInfo.username || '')
            commit('SET_AVATAR', userInfo.avatar || '')
            commit('SET_ROLES', userInfo.roles || [])
          }
          
          console.log('✅ User state initialized from secure storage')
          return true
        }
        
        return false
        
      } catch (error) {
        console.error('Init user state error:', error)
        return false
      }
    }
  }
}

export default user
