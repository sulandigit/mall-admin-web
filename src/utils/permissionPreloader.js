/**
 * 基于权限的路由预加载系统
 * 根据用户权限智能预加载相关模块
 */
import routeLoadingManager from './routeLoading'
import store from '@/store'

/**
 * 权限与路由的映射关系
 */
const PERMISSION_ROUTE_MAP = {
  // 商品管理权限
  'pms:product:read': {
    routes: ['pms-product'],
    priority: 'high',
    description: '商品管理'
  },
  'pms:brand:read': {
    routes: ['pms-brand'],
    priority: 'high',
    description: '品牌管理'
  },
  'pms:productCategory:read': {
    routes: ['pms-category'],
    priority: 'high',
    description: '商品分类'
  },
  'pms:productAttribute:read': {
    routes: ['pms-attr'],
    priority: 'normal',
    description: '商品属性'
  },

  // 订单管理权限
  'oms:order:read': {
    routes: ['oms-order'],
    priority: 'high',
    description: '订单管理'
  },
  'oms:returnApply:read': {
    routes: ['oms-return'],
    priority: 'normal',
    description: '退货管理'
  },

  // 营销管理权限
  'sms:flash:read': {
    routes: ['sms-flash'],
    priority: 'normal',
    description: '秒杀活动'
  },
  'sms:coupon:read': {
    routes: ['sms-coupon'],
    priority: 'normal',
    description: '优惠券管理'
  },
  'sms:recommend:read': {
    routes: ['sms-recommend'],
    priority: 'low',
    description: '推荐管理'
  },
  'sms:advertise:read': {
    routes: ['sms-ad'],
    priority: 'low',
    description: '广告管理'
  },

  // 权限管理权限
  'ums:admin:read': {
    routes: ['ums-admin'],
    priority: 'low',
    description: '用户管理'
  },
  'ums:role:read': {
    routes: ['ums-role'],
    priority: 'low',
    description: '角色管理'
  },
  'ums:menu:read': {
    routes: ['ums-menu'],
    priority: 'low',
    description: '菜单管理'
  },
  'ums:resource:read': {
    routes: ['ums-resource'],
    priority: 'low',
    description: '资源管理'
  }
}

/**
 * 模块间关联关系，用于关联预加载
 */
const MODULE_RELATIONS = {
  'pms-product': ['pms-brand', 'pms-category'], // 商品管理关联品牌和分类
  'oms-order': ['oms-return'], // 订单管理关联退货管理
  'sms-coupon': ['sms-flash'], // 优惠券关联秒杀活动
  'ums-admin': ['ums-role'], // 用户管理关联角色管理
  'ums-role': ['ums-menu', 'ums-resource'] // 角色管理关联菜单和资源
}

/**
 * 用户访问模式分析
 */
class UserBehaviorAnalyzer {
  constructor() {
    this.accessHistory = this.loadAccessHistory()
    this.sessionAccess = new Set()
    this.hoverHistory = new Map()
  }

  /**
   * 记录页面访问
   */
  recordAccess(routeName) {
    const now = Date.now()
    this.sessionAccess.add(routeName)
    
    if (!this.accessHistory[routeName]) {
      this.accessHistory[routeName] = {
        count: 0,
        lastAccess: now,
        timeSpent: [],
        frequency: 0
      }
    }

    this.accessHistory[routeName].count++
    this.accessHistory[routeName].lastAccess = now
    this.accessHistory[routeName].frequency = this.calculateFrequency(routeName)

    this.saveAccessHistory()
  }

  /**
   * 记录鼠标悬停
   */
  recordHover(routeName) {
    const now = Date.now()
    if (!this.hoverHistory.has(routeName)) {
      this.hoverHistory.set(routeName, [])
    }
    this.hoverHistory.get(routeName).push(now)
  }

  /**
   * 计算访问频率
   */
  calculateFrequency(routeName) {
    const data = this.accessHistory[routeName]
    if (!data || data.count < 2) return 0

    const timeSpan = Date.now() - (data.lastAccess - 24 * 60 * 60 * 1000) // 24小时内
    return data.count / Math.max(1, timeSpan / (60 * 60 * 1000)) // 每小时访问次数
  }

  /**
   * 获取高频访问的模块
   */
  getHighFrequencyRoutes(limit = 5) {
    return Object.entries(this.accessHistory)
      .sort(([,a], [,b]) => b.frequency - a.frequency)
      .slice(0, limit)
      .map(([route]) => route)
  }

  /**
   * 预测用户可能访问的路由
   */
  predictNextRoutes(currentRoute) {
    const predictions = []

    // 基于历史访问模式
    const relatedRoutes = MODULE_RELATIONS[currentRoute] || []
    relatedRoutes.forEach(route => {
      const frequency = this.accessHistory[route]?.frequency || 0
      predictions.push({ route, score: frequency * 2, reason: 'related' })
    })

    // 基于悬停历史
    for (const [route, hovers] of this.hoverHistory) {
      if (route !== currentRoute) {
        const recentHovers = hovers.filter(time => Date.now() - time < 5 * 60 * 1000) // 5分钟内
        if (recentHovers.length > 0) {
          predictions.push({ route, score: recentHovers.length, reason: 'hover' })
        }
      }
    }

    // 基于会话内访问
    this.sessionAccess.forEach(route => {
      if (route !== currentRoute && !predictions.find(p => p.route === route)) {
        predictions.push({ route, score: 1, reason: 'session' })
      }
    })

    return predictions
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(p => p.route)
  }

  /**
   * 加载访问历史
   */
  loadAccessHistory() {
    try {
      const stored = localStorage.getItem('route_access_history')
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.warn('加载访问历史失败:', error)
      return {}
    }
  }

  /**
   * 保存访问历史
   */
  saveAccessHistory() {
    try {
      localStorage.setItem('route_access_history', JSON.stringify(this.accessHistory))
    } catch (error) {
      console.warn('保存访问历史失败:', error)
    }
  }

  /**
   * 清理过期数据
   */
  cleanup() {
    const now = Date.now()
    const expireTime = 7 * 24 * 60 * 60 * 1000 // 7天

    Object.keys(this.accessHistory).forEach(route => {
      if (now - this.accessHistory[route].lastAccess > expireTime) {
        delete this.accessHistory[route]
      }
    })

    this.saveAccessHistory()
  }
}

/**
 * 权限预加载管理器
 */
class PermissionPreloader {
  constructor() {
    this.behaviorAnalyzer = new UserBehaviorAnalyzer()
    this.preloadScheduled = false
    this.workingHours = { start: 9, end: 18 } // 工作时间
  }

  /**
   * 初始化预加载系统
   */
  init() {
    // 监听路由变化
    this.setupRouteListener()
    
    // 定期清理数据
    setInterval(() => {
      this.behaviorAnalyzer.cleanup()
    }, 24 * 60 * 60 * 1000) // 每天清理一次
  }

  /**
   * 基于用户权限进行预加载
   */
  async preloadByPermissions(permissions) {
    if (!permissions || permissions.length === 0) {
      return
    }

    console.log('开始基于权限的预加载:', permissions)

    // 收集需要预加载的路由
    const preloadGroups = {
      high: [],
      normal: [],
      low: []
    }

    permissions.forEach(permission => {
      const config = PERMISSION_ROUTE_MAP[permission]
      if (config) {
        preloadGroups[config.priority].push(...config.routes)
      }
    })

    // 去重
    Object.keys(preloadGroups).forEach(priority => {
      preloadGroups[priority] = [...new Set(preloadGroups[priority])]
    })

    // 分批预加载
    await this.batchPreload(preloadGroups)
  }

  /**
   * 分批预加载
   */
  async batchPreload(preloadGroups) {
    // 高优先级立即预加载
    if (preloadGroups.high.length > 0) {
      await routeLoadingManager.preloadRoutes(preloadGroups.high, {
        priority: 'high',
        delay: 1000 // 1秒后开始
      })
    }

    // 中优先级延迟预加载
    if (preloadGroups.normal.length > 0) {
      await routeLoadingManager.preloadRoutes(preloadGroups.normal, {
        priority: 'normal',
        delay: 3000 // 3秒后开始
      })
    }

    // 低优先级在空闲时间预加载
    if (preloadGroups.low.length > 0) {
      this.scheduleIdlePreload(preloadGroups.low)
    }
  }

  /**
   * 在空闲时间预加载
   */
  scheduleIdlePreload(routes) {
    if (this.preloadScheduled) return

    this.preloadScheduled = true

    // 检查是否在工作时间
    const now = new Date()
    const hour = now.getHours()
    const isWorkingTime = hour >= this.workingHours.start && hour < this.workingHours.end

    const delay = isWorkingTime ? 10000 : 5000 // 工作时间延迟更长

    setTimeout(() => {
      routeLoadingManager.preloadRoutes(routes, {
        priority: 'low',
        delay: 0
      })
      this.preloadScheduled = false
    }, delay)
  }

  /**
   * 智能预加载建议
   */
  getPreloadSuggestions(currentRoute, userPermissions) {
    const suggestions = []

    // 基于权限的建议
    userPermissions.forEach(permission => {
      const config = PERMISSION_ROUTE_MAP[permission]
      if (config && !routeLoadingManager.loadedRoutes.has(config.routes[0])) {
        suggestions.push({
          routes: config.routes,
          reason: `用户拥有${config.description}权限`,
          priority: config.priority
        })
      }
    })

    // 基于用户行为的建议
    const predictedRoutes = this.behaviorAnalyzer.predictNextRoutes(currentRoute)
    if (predictedRoutes.length > 0) {
      suggestions.push({
        routes: predictedRoutes,
        reason: '基于用户访问模式预测',
        priority: 'normal'
      })
    }

    // 基于关联模块的建议
    const relatedRoutes = MODULE_RELATIONS[currentRoute] || []
    if (relatedRoutes.length > 0) {
      suggestions.push({
        routes: relatedRoutes,
        reason: '与当前模块相关',
        priority: 'normal'
      })
    }

    return suggestions
  }

  /**
   * 设置路由监听
   */
  setupRouteListener() {
    // 这里需要在路由守卫中调用
    // 记录访问历史用于智能预加载
  }

  /**
   * 处理鼠标悬停事件
   */
  handleMenuHover(routeName) {
    this.behaviorAnalyzer.recordHover(routeName)
    
    // 延迟预加载，避免误触
    setTimeout(() => {
      routeLoadingManager.preloadOnHover(null, routeName)
    }, 300)
  }

  /**
   * 记录路由访问
   */
  recordRouteAccess(routeName) {
    this.behaviorAnalyzer.recordAccess(routeName)
  }

  /**
   * 获取预加载统计
   */
  getPreloadStats() {
    return {
      behaviorStats: {
        totalAccess: Object.keys(this.behaviorAnalyzer.accessHistory).length,
        sessionAccess: this.behaviorAnalyzer.sessionAccess.size,
        highFrequencyRoutes: this.behaviorAnalyzer.getHighFrequencyRoutes()
      },
      loadingStats: routeLoadingManager.getUsageStats()
    }
  }
}

// 创建单例实例
const permissionPreloader = new PermissionPreloader()

export default permissionPreloader
export { UserBehaviorAnalyzer, PERMISSION_ROUTE_MAP, MODULE_RELATIONS }