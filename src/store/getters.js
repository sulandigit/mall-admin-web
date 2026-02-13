const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  viewport: state => state.app.viewport,
  interaction: state => state.app.interaction,
  
  // 设备类型判断
  isMobile: state => state.app.device === 'mobile',
  isTablet: state => state.app.device === 'tablet',
  isDesktop: state => state.app.device === 'desktop' || state.app.device === 'desktop-large',
  isMobileOrTablet: state => state.app.device === 'mobile' || state.app.device === 'tablet',
  
  // 交互状态
  isTouchDevice: state => state.app.interaction.touchSupported,
  isGestureEnabled: state => state.app.interaction.gestureEnabled,
  isKeyboardVisible: state => state.app.interaction.keyboardVisible,
  currentBreakpoint: state => state.app.interaction.currentBreakpoint,
  
  // 布局状态
  isPortrait: state => state.app.viewport.orientation === 'portrait',
  isLandscape: state => state.app.viewport.orientation === 'landscape',
  
  // 用户和权限相关（保持原有）
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  addRouters: state => state.permission.addRouters,
  routers: state => state.permission.routers
}
export default getters
