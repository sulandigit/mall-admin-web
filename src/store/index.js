import Vue from 'vue'
import Vuex from 'vuex'

// 核心模块
import app from './modules/app'
import user from './modules/user'
import permission from './modules/permission'
import ui from './modules/ui'

// 业务模块
import pms from './modules/pms'
import oms from './modules/oms'
import sms from './modules/sms'
import ums from './modules/ums'

// 功能模块
import common from './modules/common'
import cache from './modules/cache'
import notification from './modules/notification'

// 全局getters
import getters from './getters'

// 插件
import createPersistencePlugin from './plugins/persistence'
import { createLazyLoadPlugin } from './utils/moduleLoader'

Vue.use(Vuex)

// 持久化配置
const persistencePlugin = createPersistencePlugin({
  keyPrefix: 'mall-admin-',
  modules: {
    app: {
      paths: ['sidebar', 'language', 'theme', 'size'],
      storage: 'local'
    },
    user: {
      paths: ['token', 'userInfo', 'loginTime', 'permissions'],
      storage: 'local',
      expires: 7 * 24 * 60 * 60 * 1000 // 7天过期
    },
    ui: {
      paths: ['fixedHeader', 'showTagsView', 'tabs'],
      storage: 'local'
    },
    common: {
      paths: ['configs', 'dictionaries'],
      storage: 'local', 
      expires: 24 * 60 * 60 * 1000 // 24小时过期
    },
    cache: {
      paths: ['cacheConfig'],
      storage: 'local'
    },
    notification: {
      paths: ['globalConfig'],
      storage: 'local'
    }
  },
  blacklist: [
    'SET_LOADING',
    'UPDATE_LAST_ACTIVITY',
    'SET_CLEANUP_TASK_RUNNING',
    'ADD_MESSAGE',
    'ADD_NOTIFICATION',
    'SET_MEMORY_CACHE',
    'UPDATE_STATISTICS'
  ]
})

// 懒加载配置
const lazyLoadPlugin = createLazyLoadPlugin({
  preload: ['pms'], // 预加载商品管理模块
  autoPreload: true,
  preloadDelay: 3000
})

const store = new Vuex.Store({
  modules: {
    // 核心模块（始终加载）
    app,
    user,
    permission,
    ui,
    
    // 功能模块（始终加载）
    common,
    cache,
    notification,
    
    // 业务模块（可选择性加载，这里暂时都加载）
    // 在实际使用中，可以根据需要通过懒加载来优化
    pms,
    oms,
    sms,
    ums
  },
  getters,
  
  // 严格模式，开发环境下启用
  strict: process.env.NODE_ENV !== 'production',
  
  // Store插件
  plugins: [
    persistencePlugin,
    lazyLoadPlugin,
    // 开发环境下的调试插件
    ...(process.env.NODE_ENV !== 'production' ? [
      // createLogger({ collapsed: false })
    ] : [])
  ]
})

// 初始化各模块
store.dispatch('common/initCommonData')
store.dispatch('cache/initCache')
store.dispatch('cache/startAutoCleanup')
store.dispatch('notification/initNotification')
store.dispatch('ui/initUiSettings')

// 监听路由变化，更新用户活动时间
if (typeof window !== 'undefined') {
  // 页面卸载前保存状态
  window.addEventListener('beforeunload', () => {
    if (store.getters.isLoggedIn) {
      store.dispatch('user/updateActivity')
      // 手动触发持久化
      if (store.$persistence) {
        store.$persistence.persistModule('user')
        store.$persistence.persistModule('ui')
      }
    }
  })
  
  // 页面可见性变化时的处理
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && store.getters.isLoggedIn) {
      // 页面变为可见时更新用户活动时间
      store.dispatch('user/updateActivity')
      
      // 检查会话是否过期
      store.dispatch('user/checkSessionExpiry').then(isValid => {
        if (!isValid) {
          store.dispatch('notification/showWarning', {
            title: '会话提醒',
            content: '您的会话即将过期，请重新登录',
            persistent: true
          })
        }
      })
    }
  })
  
  // 定期检查会话过期
  setInterval(() => {
    if (store.getters.isLoggedIn) {
      store.dispatch('user/checkSessionExpiry').then(isValid => {
        if (!isValid) {
          store.dispatch('notification/showError', {
            title: '会话过期',
            content: '您的会话已过期，即将跳转到登录页面',
            persistent: true
          })
          // 这里可以添加自动跳转到登录页的逻辑
          setTimeout(() => {
            store.dispatch('user/fedLogOut')
            if (window.$router) {
              window.$router.push('/login')
            }
          }, 3000)
        }
      })
    }
  }, 60000) // 每分钟检查一次
  
  // 定期清理过期通知
  setInterval(() => {
    store.dispatch('notification/cleanupExpiredNotifications')
  }, 300000) // 每5分钟清理一次
  
  // 定期清理过期缓存
  setInterval(() => {
    if (store.getters['cache/needCleanup']) {
      store.dispatch('cache/cleanupExpiredCache')
    }
  }, 600000) // 每10分钟检查清理一次
}

// 开发环境下的调试功能
if (process.env.NODE_ENV !== 'production') {
  // 将store挂载到window对象，方便调试
  window.$store = store
  
  // 提供一些调试方法
  window.$storeDebug = {
    // 查看模块加载状态
    getModuleStats: () => store.$moduleLoader?.getModuleLoadStatistics(),
    
    // 查看持久化状态
    getPersistenceInfo: (moduleName) => store.$persistence?.getPersistedInfo(moduleName),
    
    // 查看缓存统计
    getCacheStats: () => store.getters['cache/statistics'],
    
    // 查看通知统计
    getNotificationStats: () => ({
      unread: store.getters['notification/unreadCount'],
      total: store.getters['notification/messages'].length + store.getters['notification/notifications'].length
    }),
    
    // 清除所有持久化数据
    clearAllPersistence: () => store.$persistence?.clearAll(),
    
    // 清除所有缓存
    clearAllCache: () => store.dispatch('cache/clearAllCache'),
    
    // 模拟各种通知
    testNotifications: () => {
      store.dispatch('notification/showSuccess', { title: '成功', content: '这是一个成功消息' })
      store.dispatch('notification/showWarning', { title: '警告', content: '这是一个警告消息' })
      store.dispatch('notification/showError', { title: '错误', content: '这是一个错误消息' })
      store.dispatch('notification/showInfo', { title: '信息', content: '这是一个信息消息' })
    }
  }
  
  console.log('Store initialized in development mode')
  console.log('Available debug methods:', Object.keys(window.$storeDebug))
}

export default store
