const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  addRouters: state => state.permission.addRouters,
  routers: state => state.permission.routers,
  cachedViews: state => state.cache.cachedViews,
  cacheConfig: state => state.cache.cacheConfig,
  cacheCount: state => state.cache.cacheCount,
  cacheInfo: state => state.cache.cacheInfo
}
export default getters
