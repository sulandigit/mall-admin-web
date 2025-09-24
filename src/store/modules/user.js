import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'

const user = {
  namespaced: true,
  state: {
    token: getToken(),
    name: '',
    avatar: '',
    roles: [],
    permissions: [],
    userInfo: {},
    loginTime: localStorage.getItem('loginTime') ? parseInt(localStorage.getItem('loginTime')) : null,
    lastActivity: Date.now()
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
    },
    SET_PERMISSIONS: (state, permissions) => {
      state.permissions = permissions
    },
    SET_USER_INFO: (state, userInfo) => {
      state.userInfo = userInfo
    },
    SET_LOGIN_TIME: (state, loginTime) => {
      state.loginTime = loginTime
      localStorage.setItem('loginTime', loginTime.toString())
    },
    UPDATE_LAST_ACTIVITY: (state) => {
      state.lastActivity = Date.now()
    },
    CLEAR_USER_DATA: (state) => {
      state.token = ''
      state.name = ''
      state.avatar = ''
      state.roles = []
      state.permissions = []
      state.userInfo = {}
      state.loginTime = null
      state.lastActivity = Date.now()
      localStorage.removeItem('loginTime')
    }
  },

  actions: {
    // 登录
    login({ commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        login(username, userInfo.password).then(response => {
          const data = response.data
          const tokenStr = data.tokenHead + data.token
          const loginTime = Date.now()
          
          setToken(tokenStr)
          commit('SET_TOKEN', tokenStr)
          commit('SET_LOGIN_TIME', loginTime)
          commit('UPDATE_LAST_ACTIVITY')
          
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    getInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo().then(response => {
          const data = response.data
          if (data.roles && data.roles.length > 0) {
            commit('SET_ROLES', data.roles)
          } else {
            reject('getInfo: roles must be a non-null array !')
          }
          
          commit('SET_NAME', data.username)
          commit('SET_AVATAR', data.icon)
          commit('SET_USER_INFO', data)
          commit('UPDATE_LAST_ACTIVITY')
          
          // 设置权限信息
          if (data.menus) {
            const permissions = data.menus.map(menu => menu.name).filter(Boolean)
            commit('SET_PERMISSIONS', permissions)
          }
          
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    logout({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('CLEAR_USER_DATA')
          removeToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端登出
    fedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('CLEAR_USER_DATA')
        removeToken()
        resolve()
      })
    },

    // 更新用户活动时间
    updateActivity({ commit }) {
      commit('UPDATE_LAST_ACTIVITY')
    },

    // 检查会话是否过期
    checkSessionExpiry({ state, dispatch }, maxInactiveTime = 30 * 60 * 1000) { // 30分钟
      const now = Date.now()
      const inactive = now - state.lastActivity
      
      if (inactive > maxInactiveTime && state.token) {
        dispatch('fedLogOut')
        return false
      }
      return true
    }
  },
  
  getters: {
    token: state => state.token,
    name: state => state.name,
    avatar: state => state.avatar,
    roles: state => state.roles,
    permissions: state => state.permissions,
    userInfo: state => state.userInfo,
    loginTime: state => state.loginTime,
    lastActivity: state => state.lastActivity,
    isLoggedIn: state => !!state.token,
    hasRole: (state) => (role) => state.roles.includes(role),
    hasPermission: (state) => (permission) => state.permissions.includes(permission),
    sessionDuration: (state) => {
      if (!state.loginTime) return 0
      return Date.now() - state.loginTime
    },
    inactiveTime: (state) => Date.now() - state.lastActivity
  }
}

export default user
