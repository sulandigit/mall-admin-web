/**
 * Store 状态管理类型定义
 */

// 根状态接口
export interface RootState {
  app: AppState
  user: UserState
  permission: PermissionState
}

// 应用状态接口
export interface AppState {
  sidebar: {
    opened: boolean
    withoutAnimation: boolean
  }
  device: 'desktop' | 'mobile'
  language: string
  size: string
}

// 用户状态接口
export interface UserState {
  token: string
  name: string
  avatar: string
  introduction: string
  roles: string[]
}

// 权限状态接口
export interface PermissionState {
  routes: any[]
  addRoutes: any[]
}

// Getters 类型定义
export interface RootGetters {
  sidebar: AppState['sidebar']
  device: AppState['device']
  token: UserState['token']
  avatar: UserState['avatar']
  name: UserState['name']
  introduction: UserState['introduction']
  roles: UserState['roles']
  permission_routes: PermissionState['routes']
  addRoutes: PermissionState['addRoutes']
}

// Mutation 类型枚举
export enum MutationType {
  // App mutations
  TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR',
  CLOSE_SIDEBAR = 'CLOSE_SIDEBAR',
  TOGGLE_DEVICE = 'TOGGLE_DEVICE',
  SET_LANGUAGE = 'SET_LANGUAGE',
  SET_SIZE = 'SET_SIZE',
  
  // User mutations
  SET_TOKEN = 'SET_TOKEN',
  SET_INTRODUCTION = 'SET_INTRODUCTION',
  SET_NAME = 'SET_NAME',
  SET_AVATAR = 'SET_AVATAR',
  SET_ROLES = 'SET_ROLES',
  
  // Permission mutations
  SET_ROUTES = 'SET_ROUTES'
}

// Action 类型枚举
export enum ActionType {
  // App actions
  TOGGLE_SIDE_BAR = 'toggleSideBar',
  CLOSE_SIDE_BAR = 'closeSideBar',
  TOGGLE_DEVICE = 'toggleDevice',
  SET_LANGUAGE = 'setLanguage',
  SET_SIZE = 'setSize',
  
  // User actions
  LOGIN = 'Login',
  GET_INFO = 'GetInfo',
  LOGOUT = 'LogOut',
  FED_LOG_OUT = 'FedLogOut',
  
  // Permission actions
  GENERATE_ROUTES = 'GenerateRoutes'
}

// Store Context 类型
export interface StoreContext<S, R> {
  state: S
  rootState: R
  commit: Function
  dispatch: Function
  getters: any
  rootGetters: any
}