import router from './router'
import store from './store'
import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css'// Progress 进度条样式
import { Message } from 'element-ui'
import { getToken } from '@/utils/auth' // 验权

// NProgress 配置
NProgress.configure({ showSpinner: false })

const whiteList = ['/login'] // 不重定向白名单

// 路由权限检查函数
function hasPermission(route, permissions) {
  if (route.meta && route.meta.permission) {
    return permissions.some(permission => route.meta.permission.includes(permission))
  } else {
    // 没有设置权限要求的路由默认允许访问
    return true
  }
}

// 设置页面标题
function setPageTitle(route) {
  const title = route.meta && route.meta.title
  if (title) {
    document.title = `${title} - Mall Admin`
  } else {
    document.title = 'Mall Admin'
  }
}

router.beforeEach(async (to, from, next) => {
  // 开始进度条
  NProgress.start()
  
  // 设置页面标题
  setPageTitle(to)
  
  const hasToken = getToken()
  
  if (hasToken) {
    if (to.path === '/login') {
      // 如果已登录，重定向到首页
      next({ path: '/' })
      NProgress.done()
    } else {
      // 检查用户是否已获取角色信息
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      
      if (hasRoles) {
        // 用户已有角色信息，检查路由权限
        if (hasPermission(to, store.getters.roles)) {
          next()
        } else {
          Message.error('没有权限访问该页面')
          next({ path: '/404' })
          NProgress.done()
        }
      } else {
        try {
          // 获取用户信息和权限
          const res = await store.dispatch('GetInfo')
          const menus = res.data.menus
          const username = res.data.username
          
          // 生成可访问的路由表
          await store.dispatch('GenerateRoutes', { menus, username })
          
          // 动态添加可访问路由表
          router.addRoutes(store.getters.addRouters)
          
          // 确保路由已添加完成，重新导航到目标路由
          next({ ...to, replace: true })
        } catch (error) {
          console.error('获取用户信息失败:', error)
          
          // 移除 token 并重定向到登录页
          await store.dispatch('FedLogOut')
          Message.error(error.message || '验证失败，请重新登录')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    // 没有 token
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next()
    } else {
      // 其他没有访问权限的页面将重定向到登录页面
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach((to, from) => {
  // 结束进度条
  NProgress.done()
  
  // 记录页面访问日志
  if (process.env.NODE_ENV === 'development') {
    console.log(`导航到: ${to.path} (从 ${from.path})`)
  }
})

// 全局错误处理
router.onError(error => {
  console.error('路由错误:', error)
  NProgress.done()
  
  // 处理动态导入错误
  if (error.message.includes('Loading chunk')) {
    Message.error('页面加载失败，请刷新页面重试')
  }
})
