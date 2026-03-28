const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  addRouters: state => state.permission.addRouters,
  routers: state => state.permission.routers,
  currentTheme: state => state.theme.currentTheme,
  isThemeTransitioning: state => state.theme.isTransitioning,
  themeConfig: state => state.theme.themeConfig
}
export default getters
