const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  addRouters: state => state.permission.addRouters,
  routers: state => state.permission.routers,
  // 路由加载状态getters
  routeLoading: state => state.app.routeLoading,
  globalLoading: state => state.app.globalLoading
}
export default getters
