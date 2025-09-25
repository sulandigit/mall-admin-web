import router from './router'
import store from './store'
import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css'// Progress 进度条样式
import { Message } from 'element-ui'
import { getToken } from '@/utils/auth' // 验权
import permissionPreloader from '@/utils/permissionPreloader' // 权限预加载
import routeLoadingManager from '@/utils/routeLoading' // 路由加载管理
import performanceMonitor from '@/utils/performanceMonitor' // 性能监控

// 初始化预加载系统
permissionPreloader.init()

// 配置NProgress
NProgress.configure({ showSpinner: false })

const whiteList = ['/login'] // 不重定向白名单
router.beforeEach((to, from, next) => {
  NProgress.start()
  
  // 开始路由加载状态管理和性能监控
  let routeMonitor = null
  if (to.name && from.name) {
    routeLoadingManager.startLoading(to.name)
    routeMonitor = performanceMonitor.recordRouteChange(from.name, to.name)
  }
  
  // 将性能监控器存储到路由元信息中
  if (routeMonitor) {
    to.meta = to.meta || {}
    to.meta.routeMonitor = routeMonitor
  }
  
  if (getToken()) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
    } else {
      if (store.getters.roles.length === 0) {
        store.dispatch('GetInfo').then(res => { // 拉取用户信息
          let menus=res.data.menus;
          let username=res.data.username;
          
          // 提取用户权限用于预加载
          const permissions = res.data.permissions || []
          
          store.dispatch('GenerateRoutes', { menus,username }).then(() => { // 生成可访问的路由表
            router.addRoutes(store.getters.addRouters); // 动态添加可访问路由表
            
            // 基于权限进行预加载
            setTimeout(() => {
              permissionPreloader.preloadByPermissions(permissions)
            }, 1000)
            
            next({ ...to, replace: true })
          })
        }).catch((err) => {
          store.dispatch('FedLogOut').then(() => {
            Message.error(err || 'Verification failed, please login again')
            next({ path: '/' })
          })
        })
      } else {
        next()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next('/login')
      NProgress.done()
    }
  }
})

router.afterEach((to, from) => {
  NProgress.done() // 结束Progress
  
  // 完成路由加载和性能监控
  if (to.name) {
    routeLoadingManager.finishLoading(to.name)
    // 记录访问历史
    permissionPreloader.recordRouteAccess(to.name)
    
    // 完成性能监控
    if (to.meta && to.meta.routeMonitor) {
      to.meta.routeMonitor.finish()
    }
  }
  
  // 智能预加载相关模块
  if (to.name && from.name) {
    const userPermissions = store.getters.roles || []
    const suggestions = permissionPreloader.getPreloadSuggestions(to.name, userPermissions)
    
    // 执行建议的预加载
    suggestions.forEach(suggestion => {
      routeLoadingManager.preloadRoutes(suggestion.routes, {
        priority: suggestion.priority,
        delay: 2000
      })
    })
  }
})
