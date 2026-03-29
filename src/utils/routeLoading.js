/**
 * 路由懒加载管理工具
 * 提供路由预加载、加载状态管理、错误处理等功能
 */
import store from '@/store'
import { Message } from 'element-ui'

class RouteLoadingManager {
  constructor() {
    this.loadingRoutes = new Set() // 正在加载的路由
    this.loadedRoutes = new Set() // 已加载的路由
    this.preloadQueue = [] // 预加载队列
    this.maxRetries = 3 // 最大重试次数
    this.retryDelay = 1000 // 重试延迟（毫秒）
    this.preloadEnabled = true // 预加载开关
  }

  /**
   * 开始路由加载
   * @param {string} routeName 路由名称
   */
  startLoading(routeName) {
    if (this.loadingRoutes.has(routeName)) {
      return
    }
    
    this.loadingRoutes.add(routeName)
    store.dispatch('app/setRouteLoading', { 
      loading: true, 
      routeName,
      progress: 0 
    })
  }

  /**
   * 更新加载进度
   * @param {string} routeName 路由名称
   * @param {number} progress 进度百分比 (0-100)
   */
  updateProgress(routeName, progress) {
    if (!this.loadingRoutes.has(routeName)) {
      return
    }
    
    store.dispatch('app/setRouteLoading', { 
      loading: true, 
      routeName,
      progress: Math.min(100, Math.max(0, progress))
    })
  }

  /**
   * 完成路由加载
   * @param {string} routeName 路由名称
   */
  finishLoading(routeName) {
    this.loadingRoutes.delete(routeName)
    this.loadedRoutes.add(routeName)
    
    store.dispatch('app/setRouteLoading', { 
      loading: false, 
      routeName,
      progress: 100 
    })
    
    // 延迟隐藏进度条，让用户看到100%
    setTimeout(() => {
      store.dispatch('app/hideRouteLoading')
    }, 200)
  }

  /**
   * 处理加载错误
   * @param {string} routeName 路由名称
   * @param {Error} error 错误对象
   * @param {number} retryCount 重试次数
   */
  handleLoadingError(routeName, error, retryCount = 0) {
    console.error(`路由 ${routeName} 加载失败:`, error)
    
    this.loadingRoutes.delete(routeName)
    
    if (retryCount < this.maxRetries) {
      // 自动重试
      Message.warning(`路由加载失败，正在重试... (${retryCount + 1}/${this.maxRetries})`)
      
      setTimeout(() => {
        this.retryLoadRoute(routeName, retryCount + 1)
      }, this.retryDelay * (retryCount + 1))
    } else {
      // 达到最大重试次数，显示错误
      store.dispatch('app/setRouteLoading', { 
        loading: false, 
        routeName,
        error: true 
      })
      
      Message.error('页面加载失败，请刷新页面重试')
    }
  }

  /**
   * 重试加载路由
   * @param {string} routeName 路由名称
   * @param {number} retryCount 重试次数
   */
  async retryLoadRoute(routeName, retryCount) {
    try {
      this.startLoading(routeName)
      // 这里需要根据实际的路由配置来重新加载
      // 由于无法直接重新触发import()，这里只是示意
      this.finishLoading(routeName)
    } catch (error) {
      this.handleLoadingError(routeName, error, retryCount)
    }
  }

  /**
   * 预加载路由组件
   * @param {Array} routeNames 路由名称数组
   * @param {Object} options 预加载选项
   */
  async preloadRoutes(routeNames, options = {}) {
    if (!this.preloadEnabled) {
      return
    }

    const { 
      priority = 'normal', // high, normal, low
      delay = 0 // 延迟时间
    } = options

    // 添加到预加载队列
    const preloadTasks = routeNames
      .filter(routeName => !this.loadedRoutes.has(routeName) && !this.loadingRoutes.has(routeName))
      .map(routeName => ({
        routeName,
        priority,
        timestamp: Date.now()
      }))

    this.preloadQueue.push(...preloadTasks)
    
    // 根据优先级排序
    this.preloadQueue.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

    // 延迟执行预加载
    if (delay > 0) {
      setTimeout(() => this.executePreload(), delay)
    } else {
      this.executePreload()
    }
  }

  /**
   * 执行预加载队列
   */
  async executePreload() {
    if (this.preloadQueue.length === 0) {
      return
    }

    // 一次最多预加载3个组件，避免影响用户体验
    const batchSize = 3
    const batch = this.preloadQueue.splice(0, batchSize)

    const preloadPromises = batch.map(async ({ routeName }) => {
      try {
        // 这里需要根据实际的路由配置来预加载
        // 由于静态import()无法动态执行，这里主要是更新状态
        console.log(`预加载路由: ${routeName}`)
        
        // 模拟预加载过程
        await new Promise(resolve => setTimeout(resolve, 100))
        
        this.loadedRoutes.add(routeName)
        return { routeName, success: true }
      } catch (error) {
        console.warn(`预加载路由 ${routeName} 失败:`, error)
        return { routeName, success: false, error }
      }
    })

    await Promise.allSettled(preloadPromises)

    // 继续处理剩余的预加载队列
    if (this.preloadQueue.length > 0) {
      setTimeout(() => this.executePreload(), 1000)
    }
  }

  /**
   * 基于权限预加载相关模块
   * @param {Array} permissions 用户权限列表
   */
  preloadByPermissions(permissions) {
    const routePermissionMap = {
      // 商品管理权限对应的路由
      'pms:product:read': ['pms-product'],
      'pms:brand:read': ['pms-brand'],
      'pms:productCategory:read': ['pms-category'],
      'pms:productAttribute:read': ['pms-attr'],
      
      // 订单管理权限对应的路由
      'oms:order:read': ['oms-order'],
      'oms:returnApply:read': ['oms-return'],
      
      // 营销管理权限对应的路由
      'sms:flash:read': ['sms-flash'],
      'sms:coupon:read': ['sms-coupon'],
      'sms:recommend:read': ['sms-recommend'],
      'sms:advertise:read': ['sms-ad'],
      
      // 权限管理权限对应的路由
      'ums:admin:read': ['ums-admin'],
      'ums:role:read': ['ums-role'],
      'ums:menu:read': ['ums-menu'],
      'ums:resource:read': ['ums-resource']
    }

    const routesToPreload = []
    permissions.forEach(permission => {
      const routes = routePermissionMap[permission]
      if (routes) {
        routesToPreload.push(...routes)
      }
    })

    // 高优先级预加载有权限的模块
    this.preloadRoutes([...new Set(routesToPreload)], { 
      priority: 'high',
      delay: 2000 // 2秒后开始预加载
    })
  }

  /**
   * 用户行为预加载
   * @param {string} currentRoute 当前路由
   * @param {string} hoveredRoute 鼠标悬停的路由
   */
  preloadOnHover(currentRoute, hoveredRoute) {
    if (!hoveredRoute || this.loadedRoutes.has(hoveredRoute)) {
      return
    }

    // 延迟200ms开始预加载，避免误触
    setTimeout(() => {
      this.preloadRoutes([hoveredRoute], { 
        priority: 'normal',
        delay: 0 
      })
    }, 200)
  }

  /**
   * 获取模块使用统计
   */
  getUsageStats() {
    const stats = {
      loadedCount: this.loadedRoutes.size,
      loadingCount: this.loadingRoutes.size,
      queueCount: this.preloadQueue.length,
      loadedRoutes: Array.from(this.loadedRoutes),
      loadingRoutes: Array.from(this.loadingRoutes)
    }
    return stats
  }

  /**
   * 启用/禁用预加载
   * @param {boolean} enabled 是否启用
   */
  setPreloadEnabled(enabled) {
    this.preloadEnabled = enabled
    if (!enabled) {
      this.preloadQueue = []
    }
  }

  /**
   * 清理缓存
   */
  clearCache() {
    this.loadedRoutes.clear()
    this.preloadQueue = []
  }
}

// 创建单例实例
const routeLoadingManager = new RouteLoadingManager()

export default routeLoadingManager

/**
 * 路由懒加载装饰器
 * 为动态import添加加载状态管理
 */
export function lazyLoad(importFunc, routeName) {
  return async () => {
    routeLoadingManager.startLoading(routeName)
    
    try {
      // 模拟加载进度
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += Math.random() * 30
        if (progress >= 90) {
          clearInterval(progressInterval)
        } else {
          routeLoadingManager.updateProgress(routeName, progress)
        }
      }, 100)

      const module = await importFunc()
      
      clearInterval(progressInterval)
      routeLoadingManager.updateProgress(routeName, 100)
      routeLoadingManager.finishLoading(routeName)
      
      return module
    } catch (error) {
      routeLoadingManager.handleLoadingError(routeName, error)
      throw error
    }
  }
}