const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  addRouters: state => state.permission.addRouters,
  routers: state => state.permission.routers,
  // CSRF相关getters
  csrfToken: state => state.csrf.token,
  csrfEnabled: state => state.csrf.enabled,
  csrfInitialized: state => state.csrf.initialized,
  hasValidCSRFToken: state => state.csrf.token && state.csrf.tokenExpires > Date.now()
}
export default getters
