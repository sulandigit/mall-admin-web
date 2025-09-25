import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { UserState, StoreContext, RootState, MutationType, ActionType } from '@/types/store'
import { LoginRequest, UserInfoResponse } from '@/types'

// 初始状态
const state: UserState = {
  token: getToken() || '',
  name: '',
  avatar: '',
  introduction: '',
  roles: []
}

// Mutations
const mutations = {
  [MutationType.SET_TOKEN]: (state: UserState, token: string) => {
    state.token = token
  },
  [MutationType.SET_NAME]: (state: UserState, name: string) => {
    state.name = name
  },
  [MutationType.SET_AVATAR]: (state: UserState, avatar: string) => {
    state.avatar = avatar
  },
  [MutationType.SET_ROLES]: (state: UserState, roles: string[]) => {
    state.roles = roles
  },
  [MutationType.SET_INTRODUCTION]: (state: UserState, introduction: string) => {
    state.introduction = introduction
  }
}

// Actions
const actions = {
  // 登录
  [ActionType.LOGIN]: ({ commit }: StoreContext<UserState, RootState>, userInfo: LoginRequest) => {
    const username = userInfo.username.trim()
    return new Promise((resolve, reject) => {
      login(username, userInfo.password).then(response => {
        const data = response.data
        const tokenStr = data.tokenHead + data.token
        setToken(tokenStr)
        commit(MutationType.SET_TOKEN, tokenStr)
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获取用户信息
  [ActionType.GET_INFO]: ({ commit, state }: StoreContext<UserState, RootState>) => {
    return new Promise((resolve, reject) => {
      getInfo().then(response => {
        const data: UserInfoResponse = response.data
        if (data.roles && data.roles.length > 0) { // 验证返回的roles是否是一个非空数组
          commit(MutationType.SET_ROLES, data.roles)
        } else {
          reject(new Error('getInfo: roles must be a non-null array !'))
        }
        commit(MutationType.SET_NAME, data.username)
        if (data.icon) {
          commit(MutationType.SET_AVATAR, data.icon)
        }
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 登出
  [ActionType.LOGOUT]: ({ commit, state }: StoreContext<UserState, RootState>) => {
    return new Promise((resolve, reject) => {
      logout().then(() => {
        commit(MutationType.SET_TOKEN, '')
        commit(MutationType.SET_ROLES, [])
        removeToken()
        resolve(null)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 前端 登出
  [ActionType.FED_LOG_OUT]: ({ commit }: StoreContext<UserState, RootState>) => {
    return new Promise(resolve => {
      commit(MutationType.SET_TOKEN, '')
      removeToken()
      resolve(null)
    })
  }
}

const user = {
  state,
  mutations,
  actions
}

export default user
