import router from './router/index'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { ElMessage } from 'element-plus'
import { getToken } from '@/utils/auth'

// 配置NProgress
NProgress.configure({ showSpinner: false })

// 免登录白名单
const whiteList = ['/login', '/404']

// 路由守卫
router.beforeEach(async (to, from, next) => {
  NProgress.start()

  // 获取token
  const token = getToken()

  if (token) {
    if (to.path === '/login') {
      // 已登录且要跳转的页面是登录页
      next({ path: '/' })
      NProgress.done()
    } else {
      const userStore = useUserStore()
      const permissionStore = usePermissionStore()

      // 判断当前用户是否已拉取完user_info信息
      if (userStore.userRoles.length === 0) {
        try {
          // 获取用户信息
          const userInfo = await userStore.getUserInfo()
          const { menus, username } = userInfo.data

          // 根据权限生成动态路由
          await permissionStore.generateRoutes({ menus, username })

          // 动态添加路由
          const dynamicRoutes = permissionStore.dynamicRouters
          dynamicRoutes.forEach(route => {
            router.addRoute(route)
          })

          // 添加404路由到最后
          router.addRoute({
            path: '/:pathMatch(.*)*',
            redirect: '/404',
            meta: { hidden: true }
          })

          // 确保addRoute已完成，设置 replace: true
          next({ ...to, replace: true })
        } catch (error) {
          // 获取用户信息失败
          await userStore.resetUserInfo()
          ElMessage.error('获取用户信息失败，请重新登录')
          next('/login')
          NProgress.done()
        }
      } else {
        next()
      }
    }
  } else {
    // 没有token
    if (whiteList.includes(to.path)) {
      // 在免登录白名单，直接进入
      next()
    } else {
      next('/login')
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})