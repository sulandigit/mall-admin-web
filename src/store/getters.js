const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  introduction: state => state.user.introduction,
  roles: state => state.user.roles,
  permissions: state => state.user.permissions,
  userInfo: state => state.user.userInfo,
  loginTime: state => state.user.loginTime,
  lastActiveTime: state => state.user.lastActiveTime,
  addRouters: state => state.permission.addRouters,
  routers: state => state.permission.routers,
  shortcuts: state => state.keyboard.shortcuts,
  shortcutPanelVisible: state => state.keyboard.shortcutPanelVisible,
  helpDialogVisible: state => state.keyboard.helpDialogVisible,
  enabledShortcuts: state => state.keyboard.enabledShortcuts,
  // 权限相关的getters
  hasPermission: (state) => (permission) => {
    return state.user.permissions.includes(permission)
  },
  hasRole: (state) => (role) => {
    return state.user.roles.includes(role)
  },
  hasAnyPermission: (state) => (permissions) => {
    return permissions.some(permission => state.user.permissions.includes(permission))
  },
  hasAnyRole: (state) => (roles) => {
    return roles.some(role => state.user.roles.includes(role))
  }
}
export default getters
