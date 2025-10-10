import { defineStore } from 'pinia'
import { asyncRouterMap, constantRouterMap } from '@/router/index'
import type { RouteRecordRaw } from 'vue-router'

interface Menu {
  name: string
  title?: string
  icon?: string
  hidden?: number
  sort?: number
}

interface PermissionState {
  routers: RouteRecordRaw[]
  addRouters: RouteRecordRaw[]
}

// 判断是否有权限访问该菜单
function hasPermission(menus: Menu[], route: RouteRecordRaw): boolean {
  if (route.name) {
    const currMenu = getMenu(route.name as string, menus)
    if (currMenu !== null) {
      // 设置菜单的标题、图标和可见性
      if (currMenu.title != null && currMenu.title !== '') {
        route.meta = route.meta || {}
        route.meta.title = currMenu.title
      }
      if (currMenu.icon != null && currMenu.icon !== '') {
        route.meta = route.meta || {}
        route.meta.icon = currMenu.icon
      }
      if (currMenu.hidden != null) {
        ;(route as any).hidden = currMenu.hidden !== 0
      }
      if (currMenu.sort != null && currMenu.sort !== '') {
        ;(route as any).sort = currMenu.sort
      }
      return true
    } else {
      ;(route as any).sort = 0
      if ((route as any).hidden !== undefined && (route as any).hidden === true) {
        ;(route as any).sort = -1
        return true
      } else {
        return false
      }
    }
  } else {
    return true
  }
}

// 根据路由名称获取菜单
function getMenu(name: string, menus: Menu[]): Menu | null {
  for (let i = 0; i < menus.length; i++) {
    const menu = menus[i]
    if (name === menu.name) {
      return menu
    }
  }
  return null
}

// 对菜单进行排序
function sortRouters(accessedRouters: RouteRecordRaw[]) {
  for (let i = 0; i < accessedRouters.length; i++) {
    const router = accessedRouters[i]
    if (router.children && router.children.length > 0) {
      router.children.sort(compare('sort'))
    }
  }
  accessedRouters.sort(compare('sort'))
}

// 降序比较函数
function compare(p: string) {
  return function (m: any, n: any) {
    const a = m[p]
    const b = n[p]
    return b - a
  }
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    routers: constantRouterMap,
    addRouters: []
  }),

  getters: {
    allRouters: (state) => state.routers,
    dynamicRouters: (state) => state.addRouters
  },

  actions: {
    setRouters(routers: RouteRecordRaw[]) {
      this.addRouters = routers
      this.routers = constantRouterMap.concat(routers)
    },

    generateRoutes(data: { menus: Menu[]; username: string }) {
      return new Promise<void>((resolve) => {
        const { menus } = data
        const accessedRouters = asyncRouterMap.filter((v) => {
          if (hasPermission(menus, v)) {
            if (v.children && v.children.length > 0) {
              v.children = v.children.filter((child) => {
                if (hasPermission(menus, child)) {
                  return child
                }
                return false
              })
              return v
            } else {
              return v
            }
          }
          return false
        })
        
        // 对菜单进行排序
        sortRouters(accessedRouters)
        this.setRouters(accessedRouters)
        resolve()
      })
    }
  }
})