/**
 * 缓存控制服务
 * 提供自动缓存清理、监控和管理功能
 */

import store from '@/store'

class CacheControlService {
  constructor() {
    this.cleanupTimer = null
    this.monitorTimer = null
    this.isRunning = false
    this.performanceMetrics = {
      cacheHitCount: 0,
      cacheMissCount: 0,
      cacheCleanCount: 0,
      lastCleanTime: null
    }
  }

  /**
   * 启动缓存控制服务
   */
  start() {
    if (this.isRunning) return

    this.isRunning = true
    this.startCleanupTimer()
    this.startMonitorTimer()
    this.setupPerformanceObserver()

    console.log('[CacheControlService] 缓存控制服务已启动')
  }

  /**
   * 停止缓存控制服务
   */
  stop() {
    if (!this.isRunning) return

    this.isRunning = false
    
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }

    if (this.monitorTimer) {
      clearInterval(this.monitorTimer)
      this.monitorTimer = null
    }

    console.log('[CacheControlService] 缓存控制服务已停止')
  }

  /**
   * 启动定期清理定时器
   */
  startCleanupTimer() {
    // 每5分钟执行一次清理检查
    this.cleanupTimer = setInterval(() => {
      this.performCleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * 启动性能监控定时器
   */
  startMonitorTimer() {
    // 每分钟收集一次性能数据
    this.monitorTimer = setInterval(() => {
      this.collectMetrics()
    }, 60 * 1000)
  }

  /**
   * 执行缓存清理
   */
  async performCleanup() {
    try {
      const cacheInfo = store.getters.cacheInfo
      const config = store.getters.cacheConfig

      // 检查缓存使用率
      const usageRatio = cacheInfo.usage
      let shouldClean = false
      let cleanOptions = {}

      // 根据使用率确定清理策略
      if (usageRatio >= 0.9) {
        // 使用率超过90%，激进清理
        shouldClean = true
        cleanOptions = { forceClean: true, cleanRatio: 0.5 }
      } else if (usageRatio >= 0.7) {
        // 使用率超过70%，标准清理
        shouldClean = true
        cleanOptions = { forceClean: false, cleanRatio: 0.3 }
      }

      // 检查内存使用情况
      if (this.isMemoryPressureHigh()) {
        shouldClean = true
        cleanOptions = { forceClean: true, cleanRatio: 0.6 }
      }

      if (shouldClean) {
        const beforeCount = cacheInfo.total
        await store.dispatch('smartCacheClean', cleanOptions)
        const afterCount = store.getters.cacheCount

        this.performanceMetrics.cacheCleanCount += beforeCount - afterCount
        this.performanceMetrics.lastCleanTime = Date.now()

        console.log(`[CacheControlService] 执行缓存清理: ${beforeCount} -> ${afterCount}`)
      }

      // 清理过期缓存
      await store.dispatch('clearExpiredCache')

    } catch (error) {
      console.error('[CacheControlService] 缓存清理失败:', error)
    }
  }

  /**
   * 检查内存压力
   */
  isMemoryPressureHigh() {
    // 使用性能API检查内存使用情况
    if ('memory' in performance) {
      const memInfo = performance.memory
      const usedRatio = memInfo.usedJSHeapSize / memInfo.totalJSHeapSize
      return usedRatio > 0.8
    }

    // 如果没有memory API，使用简单的启发式方法
    const cacheCount = store.getters.cacheCount
    return cacheCount > 15 // 超过15个缓存组件认为压力较高
  }

  /**
   * 收集性能指标
   */
  collectMetrics() {
    const cacheInfo = store.getters.cacheInfo
    
    // 记录缓存使用统计
    const metrics = {
      timestamp: Date.now(),
      cacheCount: cacheInfo.total,
      cacheUsage: cacheInfo.usage,
      hitRate: this.calculateHitRate(),
      memoryUsage: this.getMemoryUsage(),
      cleanupCount: this.performanceMetrics.cacheCleanCount
    }

    // 存储到localStorage用于调试
    try {
      const history = JSON.parse(localStorage.getItem('cache_metrics_history') || '[]')
      history.push(metrics)
      
      // 只保留最近100条记录
      if (history.length > 100) {
        history.splice(0, history.length - 100)
      }
      
      localStorage.setItem('cache_metrics_history', JSON.stringify(history))
    } catch (error) {
      console.warn('[CacheControlService] 无法保存性能指标:', error)
    }
  }

  /**
   * 计算缓存命中率
   */
  calculateHitRate() {
    const total = this.performanceMetrics.cacheHitCount + this.performanceMetrics.cacheMissCount
    return total > 0 ? this.performanceMetrics.cacheHitCount / total : 0
  }

  /**
   * 获取内存使用情况
   */
  getMemoryUsage() {
    if ('memory' in performance) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      }
    }
    return null
  }

  /**
   * 设置性能观察器
   */
  setupPerformanceObserver() {
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // 页面隐藏时执行轻量清理
        this.performLightweightCleanup()
      }
    })

    // 监听内存警告
    if ('memory' in performance) {
      const checkMemory = () => {
        if (this.isMemoryPressureHigh()) {
          this.performEmergencyCleanup()
        }
      }

      // 每30秒检查一次内存
      setInterval(checkMemory, 30000)
    }
  }

  /**
   * 执行轻量级清理
   */
  async performLightweightCleanup() {
    try {
      await store.dispatch('clearExpiredCache')
      console.log('[CacheControlService] 执行轻量级清理')
    } catch (error) {
      console.error('[CacheControlService] 轻量级清理失败:', error)
    }
  }

  /**
   * 执行紧急清理
   */
  async performEmergencyCleanup() {
    try {
      await store.dispatch('smartCacheClean', { 
        forceClean: true, 
        cleanRatio: 0.7 
      })
      console.log('[CacheControlService] 执行紧急清理')
    } catch (error) {
      console.error('[CacheControlService] 紧急清理失败:', error)
    }
  }

  /**
   * 记录缓存命中
   */
  recordCacheHit() {
    this.performanceMetrics.cacheHitCount++
  }

  /**
   * 记录缓存未命中
   */
  recordCacheMiss() {
    this.performanceMetrics.cacheMissCount++
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport() {
    const cacheInfo = store.getters.cacheInfo
    
    return {
      cacheStatus: {
        total: cacheInfo.total,
        maxSize: cacheInfo.maxSize,
        usage: cacheInfo.usage,
        components: cacheInfo.components
      },
      performance: {
        hitRate: this.calculateHitRate(),
        totalHits: this.performanceMetrics.cacheHitCount,
        totalMisses: this.performanceMetrics.cacheMissCount,
        cleanupCount: this.performanceMetrics.cacheCleanCount,
        lastCleanTime: this.performanceMetrics.lastCleanTime
      },
      memory: this.getMemoryUsage(),
      isRunning: this.isRunning
    }
  }

  /**
   * 手动触发清理
   */
  async manualCleanup(options = {}) {
    return await store.dispatch('smartCacheClean', {
      forceClean: true,
      cleanRatio: 0.5,
      ...options
    })
  }

  /**
   * 清空所有缓存
   */
  async clearAllCache() {
    return await store.dispatch('clearAllCache')
  }

  /**
   * 更新缓存配置
   */
  async updateConfig(config) {
    return await store.dispatch('updateCacheConfig', config)
  }

  /**
   * 获取缓存配置
   */
  getConfig() {
    return store.getters.cacheConfig
  }
}

// 创建单例实例
const cacheControlService = new CacheControlService()

// 在Vue应用启动时自动启动服务
if (typeof window !== 'undefined') {
  // 页面加载完成后启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      cacheControlService.start()
    })
  } else {
    cacheControlService.start()
  }

  // 页面卸载时停止服务
  window.addEventListener('beforeunload', () => {
    cacheControlService.stop()
  })
}

export default cacheControlService