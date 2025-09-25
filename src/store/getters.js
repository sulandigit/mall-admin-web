const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  addRouters: state => state.permission.addRouters,
  routers: state => state.permission.routers,
  
  // 积分相关getters
  pointsRules: state => state.points.pointsRules,
  activeRules: state => state.points.pointsRules.filter(rule => rule.isActive),
  pointsRecords: state => state.points.pointsRecords,
  exchangeItems: state => state.points.exchangeItems,
  memberLevels: state => state.points.memberLevels,
  analyticsData: state => state.points.analyticsData,
  totalPoints: state => {
    const overview = state.points.analyticsData.overview
    return overview.totalPoints || 0
  },
  exchangeStats: state => state.points.analyticsData.exchangeStats
}
export default getters
