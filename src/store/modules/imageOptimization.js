/**
 * 图片优化相关的Vuex状态管理模块
 * 管理懒加载和WebP格式的全局状态
 */

import { lazyLoadManager } from '@/utils/lazyLoadManager'
import { webpManager } from '@/utils/webpManager'

const state = {
  // 懒加载相关状态
  lazyLoad: {
    enabled: true,                    // 是否启用懒加载
    config: {
      threshold: '50px',              // 触发距离
      preloadRatio: 0.1,              // 预加载比例
      maxRetries: 3,                  // 最大重试次数
      retryDelay: 1000,               // 重试延迟
      enableStats: true               // 是否启用统计
    },
    stats: {
      totalImages: 0,                 // 总图片数
      loadedImages: 0,                // 已加载图片数
      errorImages: 0,                 // 加载失败图片数
      savedRequests: 0,               // 节省的请求数
      averageLoadTime: 0              // 平均加载时间
    },
    loadingImages: []                 // 正在加载的图片列表
  },

  // WebP相关状态
  webp: {
    supportStatus: 'unknown',         // 支持状态: unknown/detecting/supported/not_supported
    enabled: true,                    // 是否启用WebP
    config: {
      quality: 80,                    // 压缩质量
      enableFallback: true,           // 启用降级
      maxRetries: 3,                  // 最大重试次数
      urlPattern: 'suffix'            // URL模式: suffix/query/path
    },
    stats: {
      conversionCount: 0,             // 转换次数
      fallbackCount: 0,               // 降级次数
      errorCount: 0,                  // 错误次数
      savedBytes: 0,                  // 节省字节数
      conversionRate: '0%'            // 转换成功率
    },
    blacklist: []                     // 黑名单URL列表
  },

  // 全局图片缓存
  imageCache: {
    enabled: true,                    // 是否启用缓存
    maxSize: 100,                     // 最大缓存数量
    cache: new Map(),                 // 缓存映射
    hits: 0,                          // 缓存命中次数
    misses: 0                         // 缓存未命中次数
  },

  // 性能监控
  performance: {
    enabled: true,                    // 是否启用性能监控
    data: {
      loadTimes: [],                  // 加载时间记录
      errorRates: [],                 // 错误率记录
      memoryUsage: []                 // 内存使用记录
    },
    alerts: []                        // 性能告警
  }
}

const getters = {
  // 懒加载相关getters
  isLazyLoadEnabled: state => state.lazyLoad.enabled,
  lazyLoadConfig: state => state.lazyLoad.config,
  lazyLoadStats: state => state.lazyLoad.stats,
  lazyLoadSuccessRate: state => {
    const { totalImages, loadedImages } = state.lazyLoad.stats
    return totalImages > 0 ? ((loadedImages / totalImages) * 100).toFixed(2) + '%' : '0%'
  },

  // WebP相关getters
  isWebPSupported: state => state.webp.supportStatus === 'supported',
  isWebPEnabled: state => state.webp.enabled,
  webpConfig: state => state.webp.config,
  webpStats: state => state.webp.stats,
  webpSupportStatus: state => state.webp.supportStatus,

  // 图片缓存相关getters
  imageCacheStats: state => ({
    size: state.imageCache.cache.size,
    hits: state.imageCache.hits,
    misses: state.imageCache.misses,
    hitRate: state.imageCache.hits + state.imageCache.misses > 0 
      ? ((state.imageCache.hits / (state.imageCache.hits + state.imageCache.misses)) * 100).toFixed(2) + '%'
      : '0%'
  }),

  // 性能相关getters
  performanceData: state => state.performance.data,
  performanceAlerts: state => state.performance.alerts,
  averageLoadTime: state => {
    const { loadTimes } = state.performance.data
    if (loadTimes.length === 0) return 0
    const total = loadTimes.reduce((sum, item) => sum + item.loadTime, 0)
    return (total / loadTimes.length).toFixed(2)
  }
}

const mutations = {
  // 懒加载相关mutations
  SET_LAZY_LOAD_ENABLED(state, enabled) {
    state.lazyLoad.enabled = enabled
  },

  UPDATE_LAZY_LOAD_CONFIG(state, config) {
    state.lazyLoad.config = { ...state.lazyLoad.config, ...config }
  },

  UPDATE_LAZY_LOAD_STATS(state, stats) {
    state.lazyLoad.stats = { ...state.lazyLoad.stats, ...stats }
  },

  ADD_LOADING_IMAGE(state, imageInfo) {
    state.lazyLoad.loadingImages.push(imageInfo)
  },

  REMOVE_LOADING_IMAGE(state, imageUrl) {
    const index = state.lazyLoad.loadingImages.findIndex(img => img.url === imageUrl)
    if (index > -1) {
      state.lazyLoad.loadingImages.splice(index, 1)
    }
  },

  // WebP相关mutations
  SET_WEBP_SUPPORT_STATUS(state, status) {
    state.webp.supportStatus = status
  },

  SET_WEBP_ENABLED(state, enabled) {
    state.webp.enabled = enabled
  },

  UPDATE_WEBP_CONFIG(state, config) {
    state.webp.config = { ...state.webp.config, ...config }
  },

  UPDATE_WEBP_STATS(state, stats) {
    state.webp.stats = { ...state.webp.stats, ...stats }
  },

  ADD_TO_WEBP_BLACKLIST(state, url) {
    if (!state.webp.blacklist.includes(url)) {
      state.webp.blacklist.push(url)
    }
  },

  REMOVE_FROM_WEBP_BLACKLIST(state, url) {
    const index = state.webp.blacklist.indexOf(url)
    if (index > -1) {
      state.webp.blacklist.splice(index, 1)
    }
  },

  CLEAR_WEBP_BLACKLIST(state) {
    state.webp.blacklist = []
  },

  // 图片缓存相关mutations
  SET_IMAGE_CACHE_ENABLED(state, enabled) {
    state.imageCache.enabled = enabled
  },

  SET_IMAGE_CACHE_MAX_SIZE(state, maxSize) {
    state.imageCache.maxSize = maxSize
    // 如果当前缓存超过新的最大值，清理最旧的条目
    if (state.imageCache.cache.size > maxSize) {
      const keys = Array.from(state.imageCache.cache.keys())
      const keysToDelete = keys.slice(0, state.imageCache.cache.size - maxSize)
      keysToDelete.forEach(key => state.imageCache.cache.delete(key))
    }
  },

  ADD_TO_IMAGE_CACHE(state, { key, value }) {
    // 如果缓存已满，删除最旧的条目
    if (state.imageCache.cache.size >= state.imageCache.maxSize) {
      const firstKey = state.imageCache.cache.keys().next().value
      state.imageCache.cache.delete(firstKey)
    }
    state.imageCache.cache.set(key, value)
  },

  INCREMENT_CACHE_HITS(state) {
    state.imageCache.hits++
  },

  INCREMENT_CACHE_MISSES(state) {
    state.imageCache.misses++
  },

  CLEAR_IMAGE_CACHE(state) {
    state.imageCache.cache.clear()
    state.imageCache.hits = 0
    state.imageCache.misses = 0
  },

  // 性能监控相关mutations
  SET_PERFORMANCE_MONITORING_ENABLED(state, enabled) {
    state.performance.enabled = enabled
  },

  ADD_LOAD_TIME_RECORD(state, record) {
    state.performance.data.loadTimes.push(record)
    // 限制记录数量
    if (state.performance.data.loadTimes.length > 1000) {
      state.performance.data.loadTimes = state.performance.data.loadTimes.slice(-500)
    }
  },

  ADD_ERROR_RECORD(state, record) {
    state.performance.data.errorRates.push(record)
    // 限制记录数量
    if (state.performance.data.errorRates.length > 500) {
      state.performance.data.errorRates = state.performance.data.errorRates.slice(-250)
    }
  },

  ADD_MEMORY_USAGE_RECORD(state, record) {
    state.performance.data.memoryUsage.push(record)
    // 限制记录数量
    if (state.performance.data.memoryUsage.length > 100) {
      state.performance.data.memoryUsage = state.performance.data.memoryUsage.slice(-50)
    }
  },

  ADD_PERFORMANCE_ALERT(state, alert) {
    state.performance.alerts.push(alert)
    // 限制告警数量
    if (state.performance.alerts.length > 50) {
      state.performance.alerts = state.performance.alerts.slice(-25)
    }
  },

  CLEAR_PERFORMANCE_DATA(state) {
    state.performance.data = {
      loadTimes: [],
      errorRates: [],
      memoryUsage: []
    }
    state.performance.alerts = []
  }
}

const actions = {
  // 检测WebP支持
  async detectWebPSupport({ commit }) {
    commit('SET_WEBP_SUPPORT_STATUS', 'detecting')
    try {
      const isSupported = await webpManager.detectSupport()
      const status = isSupported ? 'supported' : 'not_supported'
      commit('SET_WEBP_SUPPORT_STATUS', status)
      return isSupported
    } catch (error) {
      commit('SET_WEBP_SUPPORT_STATUS', 'not_supported')
      throw error
    }
  },

  // 更新懒加载配置
  updateLazyLoadConfig({ commit }, config) {
    commit('UPDATE_LAZY_LOAD_CONFIG', config)
    lazyLoadManager.updateConfig(config)
  },

  // 更新WebP配置
  updateWebPConfig({ commit }, config) {
    commit('UPDATE_WEBP_CONFIG', config)
    webpManager.updateConfig(config)
  },

  // 记录图片加载统计
  recordImageLoadStats({ commit }, { type, data }) {
    switch (type) {
      case 'load_success':
        commit('ADD_LOAD_TIME_RECORD', {
          timestamp: Date.now(),
          loadTime: data.loadTime,
          url: data.url
        })
        break
      case 'load_error':
        commit('ADD_ERROR_RECORD', {
          timestamp: Date.now(),
          error: data.error,
          url: data.url
        })
        break
      case 'memory_usage':
        commit('ADD_MEMORY_USAGE_RECORD', {
          timestamp: Date.now(),
          used: data.used,
          total: data.total
        })
        break
    }
  },

  // 刷新统计数据
  async refreshStats({ commit }) {
    try {
      // 获取懒加载统计
      const lazyLoadStats = lazyLoadManager.getStats()
      commit('UPDATE_LAZY_LOAD_STATS', lazyLoadStats)

      // 获取WebP统计
      const webpStats = webpManager.getStats()
      commit('UPDATE_WEBP_STATS', webpStats)

      return { lazyLoadStats, webpStats }
    } catch (error) {
      console.error('Failed to refresh stats:', error)
      throw error
    }
  },

  // 清理图片缓存
  clearImageCache({ commit }) {
    commit('CLEAR_IMAGE_CACHE')
    // 同时清理管理器中的缓存
    webpManager.clearCache()
  },

  // 重置所有统计数据
  resetAllStats({ commit }) {
    commit('UPDATE_LAZY_LOAD_STATS', {
      totalImages: 0,
      loadedImages: 0,
      errorImages: 0,
      savedRequests: 0,
      averageLoadTime: 0
    })
    
    commit('UPDATE_WEBP_STATS', {
      conversionCount: 0,
      fallbackCount: 0,
      errorCount: 0,
      savedBytes: 0,
      conversionRate: '0%'
    })

    commit('CLEAR_PERFORMANCE_DATA')

    // 重置管理器统计
    lazyLoadManager.resetStats()
    webpManager.resetStats()
  },

  // 添加到WebP黑名单
  addToWebPBlacklist({ commit }, url) {
    commit('ADD_TO_WEBP_BLACKLIST', url)
    webpManager.addToBlacklist(url)
  },

  // 从WebP黑名单移除
  removeFromWebPBlacklist({ commit }, url) {
    commit('REMOVE_FROM_WEBP_BLACKLIST', url)
    webpManager.removeFromBlacklist(url)
  },

  // 检查图片缓存
  checkImageCache({ commit, state }, url) {
    if (!state.imageCache.enabled) return null

    if (state.imageCache.cache.has(url)) {
      commit('INCREMENT_CACHE_HITS')
      return state.imageCache.cache.get(url)
    } else {
      commit('INCREMENT_CACHE_MISSES')
      return null
    }
  },

  // 添加到图片缓存
  addToImageCache({ commit, state }, { url, data }) {
    if (!state.imageCache.enabled) return

    commit('ADD_TO_IMAGE_CACHE', { key: url, value: data })
  },

  // 性能告警检查
  checkPerformanceAlerts({ commit, state }) {
    if (!state.performance.enabled) return

    const { loadTimes } = state.performance.data
    
    if (loadTimes.length >= 10) {
      // 检查平均加载时间
      const recentTimes = loadTimes.slice(-10)
      const averageTime = recentTimes.reduce((sum, item) => sum + item.loadTime, 0) / recentTimes.length

      if (averageTime > 3000) {
        commit('ADD_PERFORMANCE_ALERT', {
          type: 'slow_loading',
          message: `平均加载时间过慢: ${averageTime.toFixed(2)}ms`,
          timestamp: Date.now(),
          severity: 'warning'
        })
      }

      // 检查错误率
      const recentErrors = state.performance.data.errorRates.filter(
        error => error.timestamp > Date.now() - 5 * 60 * 1000 // 最近5分钟
      )

      if (recentErrors.length > 5) {
        commit('ADD_PERFORMANCE_ALERT', {
          type: 'high_error_rate',
          message: `最近5分钟内发生了${recentErrors.length}次加载错误`,
          timestamp: Date.now(),
          severity: 'error'
        })
      }
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}