import { asyncRouterMap, constantRouterMap } from '@/router/index'

// 判断是否有权限访问该菜单
function hasPermission(menus, route) {
  if (route.name) {
    let currMenu = getMenu(route.name, menus)
    if (currMenu != null) {
      // 设置菜单的标题、图标和可见性
      if (currMenu.title != null && currMenu.title !== '') {
        route.meta.title = currMenu.title
      }
      if (currMenu.icon != null && currMenu.icon !== '') {
        route.meta.icon = currMenu.icon
      }
      if (currMenu.hidden != null) {
        route.hidden = currMenu.hidden !== 0
      }
      if (currMenu.sort != null && currMenu.sort !== '') {
        route.sort = currMenu.sort
      }
      return true
    } else {
      route.sort = 0
      if (route.hidden !== undefined && route.hidden === true) {
        route.sort = -1
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
function getMenu(name, menus) {
  for (let i = 0; i < menus.length; i++) {
    let menu = menus[i]
    if (name === menu.name) {
      return menu
    }
  }
  return null
}

// 对菜单进行排序
function sortRouters(accessedRouters) {
  for (let i = 0; i < accessedRouters.length; i++) {
    let router = accessedRouters[i]
    if (router.children && router.children.length > 0) {
      router.children.sort(compare('sort'))
    }
  }
  accessedRouters.sort(compare('sort'))
}

// 降序比较函数
function compare(p) {
  return function(m, n) {
    let a = m[p]
    let b = n[p]
    return b - a
  }
}

const permission = {
  namespaced: true,
  state: {
    routes: constantRouterMap,
    addRouters: [],
    menus: [],
    buttons: {},
    apis: [],
    loadedMenus: false
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routes = constantRouterMap.concat(routers)
    },
    SET_MENUS: (state, menus) => {
      state.menus = menus
      state.loadedMenus = true
    },
    SET_BUTTONS: (state, buttons) => {
      state.buttons = buttons
    },
    SET_APIS: (state, apis) => {
      state.apis = apis
    },
    CLEAR_PERMISSION: (state) => {
      state.routes = constantRouterMap
      state.addRouters = []
      state.menus = []
      state.buttons = {}
      state.apis = []
      state.loadedMenus = false
    }
  },
  actions: {
    generateRoutes({ commit }, data) {
      return new Promise(resolve => {
        const { menus, username } = data
        
        // 过滤可访问的路由
        const accessedRouters = asyncRouterMap.filter(v => {
          // admin账号直接返回所有菜单（如需要可启用）
          // if(username === 'admin') return true
          
          if (hasPermission(menus, v)) {
            if (v.children && v.children.length > 0) {
              v.children = v.children.filter(child => {
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
        
        commit('SET_ROUTERS', accessedRouters)
        commit('SET_MENUS', menus)
        
        resolve(accessedRouters)
      })
    },
    
    setButtonPermissions({ commit }, buttons) {
      commit('SET_BUTTONS', buttons)
    },
    
    setApiPermissions({ commit }, apis) {
      commit('SET_APIS', apis)
    },
    
    clearPermissions({ commit }) {
      commit('CLEAR_PERMISSION')
    }
  },
  
  getters: {
    routes: state => state.routes,
    addRouters: state => state.addRouters,
    menus: state => state.menus,
    buttons: state => state.buttons,
    apis: state => state.apis,
    loadedMenus: state => state.loadedMenus,
    
    // 检查是否有按钮权限
    hasButtonPermission: (state) => (buttonKey) => {
      return state.buttons[buttonKey] || false
    },
    
    // 检查是否有API权限
    hasApiPermission: (state) => (apiPath) => {
      return state.apis.includes(apiPath)
    },
    
    // 获取菜单树结构
    menuTree: (state) => {
      const buildTree = (menus, parentId = 0) => {
        return menus
          .filter(menu => menu.parentId === parentId)
          .map(menu => ({
            ...menu,
            children: buildTree(menus, menu.id)
          }))
          .sort((a, b) => (a.sort || 0) - (b.sort || 0))
      }
      return buildTree(state.menus)
    }
  }
}

export default permission

