// 全局getters - 提供快捷访问和向后兼容支持
const getters = {
  // ==================== 核心模块快捷访问 ====================
  // App模块快捷访问 (保持向后兼容)
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  language: state => state.app.language,
  theme: state => state.app.theme,
  loading: state => state.app.loading,
  
  // User模块快捷访问 (保持向后兼容)
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  permissions: state => state.user.permissions,
  userInfo: state => state.user.userInfo,
  isLoggedIn: state => state.user.isLoggedIn,
  
  // Permission模块快捷访问 (保持向后兼容)
  addRouters: state => state.permission.addRouters,
  routers: state => state.permission.routes, // 注意：这里从routers改为routes
  menus: state => state.permission.menus,
  
  // UI模块快捷访问
  breadcrumb: state => state.ui.breadcrumb,
  tabs: state => state.ui.tabs,
  activeTab: state => state.ui.activeTab,
  fullscreen: state => state.ui.fullscreen,
  
  // ==================== 业务模块快捷访问 ====================
  // PMS商品管理模块
  products: state => state.pms.products,
  productListLoading: state => state.pms.productListLoading,
  categories: state => state.pms.categories,
  brands: state => state.pms.brands,
  
  // OMS订单管理模块
  orders: state => state.oms.orders,
  orderListLoading: state => state.oms.orderListLoading,
  orderStatistics: state => state.oms.orderStatistics,
  
  // SMS营销管理模块
  coupons: state => state.sms.coupons,
  flashSales: state => state.sms.flashSales,
  advertisements: state => state.sms.advertisements,
  
  // UMS用户权限管理模块
  adminUsers: state => state.ums.adminUsers,
  roleList: state => state.ums.roles,
  resourceList: state => state.ums.resources,
  
  // ==================== 功能模块快捷访问 ====================
  // Common通用模块
  dictionaries: state => state.common.dictionaries,
  constants: state => state.common.constants,
  configs: state => state.common.configs,
  
  // Cache缓存模块
  cacheConfig: state => state.cache.cacheConfig,
  cacheStatistics: state => state.cache.statistics,
  hitRate: state => state.cache.hitRate,
  
  // Notification消息通知模块
  messages: state => state.notification.messages,
  notifications: state => state.notification.notifications,
  unreadCount: state => state.notification.unreadCount,
  
  // ==================== 复合计算属性 ====================
  // 用户完整信息（组合多个模块数据）
  userProfile: (state, getters) => {
    return {
      token: getters.token,
      userInfo: getters.userInfo,
      roles: getters.roles,
      permissions: getters.permissions,
      loginTime: state.user.loginTime,
      lastActivity: state.user.lastActivity
    }
  },
  
  // 应用状态摘要
  appStatus: (state, getters) => {
    return {
      sidebar: getters.sidebar,
      device: getters.device,
      theme: getters.theme,
      language: getters.language,
      loading: getters.loading,
      fullscreen: getters.fullscreen
    }
  },
  
  // 业务数据摘要
  businessSummary: (state, getters) => {
    return {
      productCount: getters.products.length,
      orderCount: getters.orders.length,
      couponCount: getters.coupons.length,
      unreadNotifications: getters.unreadCount.total
    }
  },
  
  // 系统状态摘要
  systemStatus: (state, getters) => {
    return {
      isLoggedIn: getters.isLoggedIn,
      cacheHitRate: getters.hitRate,
      unreadMessages: getters.unreadCount.total,
      currentUser: getters.name
    }
  },
  
  // ==================== 向后兼容的别名 ====================
  // 为了保持向后兼容，提供一些别名
  sidebarOpened: state => state.app.sidebar.opened,
  withoutAnimation: state => state.app.sidebar.withoutAnimation,
  isMobile: state => state.app.device === 'mobile',
  isDesktop: state => state.app.device === 'desktop',
  
  // 用户权限检查（向后兼容）
  hasRole: (state) => (role) => {
    return state.user.roles.includes(role)
  },
  
  hasPermission: (state) => (permission) => {
    return state.user.permissions.includes(permission)
  },
  
  // ==================== 高级计算属性 ====================
  // 根据用户角色过滤的菜单
  availableMenus: (state, getters) => {
    if (!getters.isLoggedIn) return []
    
    return state.permission.menus.filter(menu => {
      // 这里可以根据用户角色过滤菜单
      return true // 简化实现
    })
  },
  
  // 当前用户可访问的路由
  accessibleRoutes: (state, getters) => {
    return getters.routers.filter(route => {
      // 根据权限过滤路由
      return true // 简化实现
    })
  },
  
  // 获取字典项的便捷方法
  getDictionary: (state) => (key) => {
    return state.common.dictionaries[key] || []
  },
  
  // 获取配置项的便捷方法
  getConfig: (state) => (path, defaultValue = null) => {
    const keys = path.split('.')
    let value = state.common.configs
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        return defaultValue
      }
    }
    
    return value
  },
  
  // 获取常量的便捷方法
  getConstant: (state) => (path) => {
    const keys = path.split('.')
    let value = state.constants
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        return undefined
      }
    }
    
    return value
  },
  
  // ==================== 数据统计 ====================
  // 获取各模块的数据统计
  dataStatistics: (state) => {
    return {
      products: {
        total: state.pms.products.length,
        loading: state.pms.productListLoading
      },
      orders: {
        total: state.oms.orders.length,
        loading: state.oms.orderListLoading,
        statistics: state.oms.orderStatistics
      },
      coupons: {
        total: state.sms.coupons.length,
        loading: state.sms.couponListLoading
      },
      admins: {
        total: state.ums.adminUsers.length,
        loading: state.ums.adminListLoading
      },
      cache: {
        hits: state.cache.statistics.hits,
        misses: state.cache.statistics.misses,
        hitRate: state.cache.statistics.hits + state.cache.statistics.misses > 0 
          ? (state.cache.statistics.hits / (state.cache.statistics.hits + state.cache.statistics.misses) * 100).toFixed(2)
          : '0.00'
      },
      notifications: {
        total: state.notification.unreadCount.total,
        messages: state.notification.unreadCount.messages,
        notifications: state.notification.unreadCount.notifications
      }
    }
  },
  
  // 获取当前活跃的加载状态
  activeLoadings: (state) => {
    const loadings = []
    
    if (state.app.loading) loadings.push('app')
    if (state.pms.productListLoading) loadings.push('products')
    if (state.oms.orderListLoading) loadings.push('orders')
    if (state.sms.couponListLoading) loadings.push('coupons')
    if (state.ums.adminListLoading) loadings.push('admins')
    if (state.notification.loading.messages) loadings.push('messages')
    
    return loadings
  },
  
  // 检查是否有任何加载状态
  isAnyLoading: (state, getters) => {
    return getters.activeLoadings.length > 0
  }
}

export default getters
