import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'

const user = {
  state: {
    token: getToken(),
    name: '',
    avatar: '',
    introduction: '',
    roles: [],
    permissions: [],
    userInfo: {},
    loginTime: null,
    lastActiveTime: null
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
    SET_INTRODUCTION: (state, introduction) => {
      state.introduction = introduction
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
    SET_LOGIN_TIME: (state, time) => {
      state.loginTime = time
    },
    SET_LAST_ACTIVE_TIME: (state, time) => {
      state.lastActiveTime = time
    },
    CLEAR_USER_INFO: (state) => {
      state.token = ''
      state.name = ''
      state.avatar = ''
      state.introduction = ''
      state.roles = []
      state.permissions = []
      state.userInfo = {}
      state.loginTime = null
      state.lastActiveTime = null
    }
  },

  actions: {
    // 登录
    Login({ commit, dispatch }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        login(username, userInfo.password).then(response => {
          const data = response.data
          const tokenStr = data.tokenHead + data.token
          setToken(tokenStr)
          commit('SET_TOKEN', tokenStr)
          commit('SET_LOGIN_TIME', new Date())
          
          // 登录成功后开始活跃时间监控
          dispatch('StartActiveTimeMonitor')
          
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo().then(response => {
          const data = response.data
          
          if (data.roles && data.roles.length > 0) {
            commit('SET_ROLES', data.roles)
          } else {
            reject('getInfo: roles must be a non-null array !')
          }
          
          commit('SET_NAME', data.username)
          commit('SET_AVATAR', data.icon || '/static/images/default-avatar.png')
          commit('SET_INTRODUCTION', data.introduction || '')
          commit('SET_PERMISSIONS', data.permissions || [])
          commit('SET_USER_INFO', {
            id: data.id,
            username: data.username,
            email: data.email,
            phone: data.phone,
            status: data.status,
            createTime: data.createTime,
            loginTime: data.loginTime
          })
          
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 更新用户信息
    UpdateUserInfo({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        // 这里应该调用更新用户信息的API
        // updateUserInfo(userInfo).then(response => {
          commit('SET_NAME', userInfo.username)
          commit('SET_AVATAR', userInfo.avatar)
          commit('SET_INTRODUCTION', userInfo.introduction)
          commit('SET_USER_INFO', userInfo)
          resolve()
        // }).catch(error => {
        //   reject(error)
        // })
      })
    },

    // 修改密码
    ChangePassword({ state }, passwordData) {
      return new Promise((resolve, reject) => {
        // 这里应该调用修改密码的API
        // changePassword(passwordData).then(response => {
          resolve()
        // }).catch(error => {
        //   reject(error)
        // })
      })
    },

    // 登出
    LogOut({ commit, state, dispatch }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          dispatch('StopActiveTimeMonitor')
          commit('CLEAR_USER_INFO')
          removeToken()
          resolve()
        }).catch(error => {
          // 即使后端登出失败，也清除本地信息
          dispatch('StopActiveTimeMonitor')
          commit('CLEAR_USER_INFO')
          removeToken()
          resolve()
        })
      })
    },

    // 前端登出
    FedLogOut({ commit, dispatch }) {
      return new Promise(resolve => {
        dispatch('StopActiveTimeMonitor')
        commit('CLEAR_USER_INFO')
        removeToken()
        resolve()
      })
    },

    // 刷新Token
    RefreshToken({ commit, state }) {
      return new Promise((resolve, reject) => {
        // 这里应该调用刷新Token的API
        // refreshToken(state.token).then(response => {
        //   const data = response.data
        //   const tokenStr = data.tokenHead + data.token
        //   setToken(tokenStr)
        //   commit('SET_TOKEN', tokenStr)
        //   resolve()
        // }).catch(error => {
        //   reject(error)
        // })
        resolve()
      })
    },

    // 开始活跃时间监控
    StartActiveTimeMonitor({ commit, dispatch }) {
      // 每30秒更新一次最后活跃时间
      const interval = setInterval(() => {
        commit('SET_LAST_ACTIVE_TIME', new Date())
      }, 30000)
      
      // 保存定时器ID到全局，以便后续清除
      window.activeTimeInterval = interval
      
      // 监听用户活动
      const updateActiveTime = () => {
        commit('SET_LAST_ACTIVE_TIME', new Date())
      }
      
      // 添加事件监听器
      document.addEventListener('click', updateActiveTime)
      document.addEventListener('keypress', updateActiveTime)
      document.addEventListener('scroll', updateActiveTime)
      
      // 保存事件监听器引用，以便后续移除
      window.activeTimeListeners = {
        click: updateActiveTime,
        keypress: updateActiveTime,
        scroll: updateActiveTime
      }
    },

    // 停止活跃时间监控
    StopActiveTimeMonitor() {
      // 清除定时器
      if (window.activeTimeInterval) {
        clearInterval(window.activeTimeInterval)
        window.activeTimeInterval = null
      }
      
      // 移除事件监听器
      if (window.activeTimeListeners) {
        document.removeEventListener('click', window.activeTimeListeners.click)
        document.removeEventListener('keypress', window.activeTimeListeners.keypress)
        document.removeEventListener('scroll', window.activeTimeListeners.scroll)
        window.activeTimeListeners = null
      }
    },

    // 检查用户权限
    CheckPermission({ state }, permission) {
      return state.permissions.includes(permission)
    },

    // 检查用户角色
    CheckRole({ state }, role) {
      return state.roles.includes(role)
    }
  }
}

export default user
