/**
 * 图片懒加载管理器
 * 负责全局懒加载配置管理、Observer实例生命周期管理、加载状态统一处理、性能监控和统计
 */

class LazyLoadManager {
  constructor() {
    // 全局配置
    this.config = {
      threshold: '50px',           // 懒加载触发距离
      preloadRatio: 0.1,          // 预加载比例
      enableStats: true,          // 是否启用统计
      maxRetries: 3,              // 最大重试次数
      retryDelay: 1000           // 重试延迟(ms)
    }

    // Observer实例池
    this.observerPool = new Map()
    
    // 加载统计
    this.stats = {
      totalImages: 0,           // 总图片数
      loadedImages: 0,          // 已加载图片数
      errorImages: 0,           // 加载失败图片数
      savedRequests: 0,         // 节省的请求数
      totalLoadTime: 0,         // 总加载时间
      averageLoadTime: 0        // 平均加载时间
    }

    // 加载队列
    this.loadQueue = []
    this.loadingQueue = new Set()
    
    // 性能监控
    this.performanceData = {
      loadTimes: [],            // 加载时间记录
      errorRates: [],           // 错误率记录
      memoryUsage: []           // 内存使用记录
    }

    // 初始化
    this.init()
  }

  /**
   * 初始化管理器
   */
  init() {
    // 检测浏览器支持
    this.checkBrowserSupport()
    
    // 加载配置
    this.loadConfig()
    
    // 启动性能监控
    if (this.config.enableStats) {
      this.startPerformanceMonitoring()
    }

    // 页面卸载时清理
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.cleanup()
      })
    }
  }

  /**
   * 检测浏览器支持
   */
  checkBrowserSupport() {
    this.support = {
      intersectionObserver: 'IntersectionObserver' in window,
      performanceObserver: 'PerformanceObserver' in window,
      requestIdleCallback: 'requestIdleCallback' in window
    }

    // 如果不支持IntersectionObserver，加载polyfill
    if (!this.support.intersectionObserver) {
      console.warn('LazyLoadManager: IntersectionObserver not supported, falling back to scroll events')
    }
  }

  /**
   * 加载配置
   */
  loadConfig() {
    try {
      const savedConfig = localStorage.getItem('lazy-load-config')
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) }
      }
    } catch (error) {
      console.warn('LazyLoadManager: Failed to load config from localStorage')
    }
  }

  /**
   * 保存配置
   */
  saveConfig() {
    try {
      localStorage.setItem('lazy-load-config', JSON.stringify(this.config))
    } catch (error) {
      console.warn('LazyLoadManager: Failed to save config to localStorage')
    }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
    this.saveConfig()
  }

  /**
   * 创建Observer实例
   */
  createObserver(options = {}) {
    const observerOptions = {
      rootMargin: options.threshold || this.config.threshold,
      threshold: options.intersectionRatio || 0.1
    }

    const observerId = JSON.stringify(observerOptions)
    
    if (!this.observerPool.has(observerId)) {
      const observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        observerOptions
      )
      this.observerPool.set(observerId, {
        instance: observer,
        targets: new Set(),
        options: observerOptions
      })
    }

    return this.observerPool.get(observerId)
  }

  /**
   * 处理交集变化
   */
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target
        const callback = target._lazyCallback
        
        if (callback && typeof callback === 'function') {
          // 添加到加载队列
          this.addToLoadQueue(target, callback)
        }
      }
    })
  }

  /**
   * 添加到加载队列
   */
  addToLoadQueue(target, callback) {
    if (this.loadingQueue.has(target)) return

    this.loadQueue.push({
      target,
      callback,
      timestamp: Date.now(),
      retries: 0
    })

    // 处理队列
    this.processLoadQueue()
  }

  /**
   * 处理加载队列
   */
  async processLoadQueue() {
    if (this.loadQueue.length === 0) return

    // 批量处理，避免同时加载过多图片
    const batchSize = 3
    const batch = this.loadQueue.splice(0, batchSize)

    const promises = batch.map(item => this.processLoadItem(item))
    
    try {
      await Promise.allSettled(promises)
    } catch (error) {
      console.error('LazyLoadManager: Batch processing error:', error)
    }

    // 继续处理剩余队列
    if (this.loadQueue.length > 0) {
      setTimeout(() => this.processLoadQueue(), 100)
    }
  }

  /**
   * 处理单个加载项
   */
  async processLoadItem(item) {
    const { target, callback, timestamp } = item
    
    try {
      this.loadingQueue.add(target)
      
      const startTime = performance.now()
      await callback()
      const endTime = performance.now()
      
      // 记录加载成功
      this.recordLoadSuccess(target, endTime - startTime)
      
      // 移除Observer监听
      this.unobserveTarget(target)
      
    } catch (error) {
      // 记录加载失败
      this.recordLoadError(target, error)
      
      // 重试逻辑
      if (item.retries < this.config.maxRetries) {
        item.retries++
        setTimeout(() => {
          this.loadQueue.push(item)
          this.processLoadQueue()
        }, this.config.retryDelay)
      } else {
        this.unobserveTarget(target)
      }
    } finally {
      this.loadingQueue.delete(target)
    }
  }

  /**
   * 观察目标元素
   */
  observeTarget(target, callback, options = {}) {
    if (!target || typeof callback !== 'function') {
      console.warn('LazyLoadManager: Invalid target or callback')
      return
    }

    const observer = this.createObserver(options)
    target._lazyCallback = callback
    target._observerId = JSON.stringify(observer.options)
    
    observer.instance.observe(target)
    observer.targets.add(target)

    this.stats.totalImages++
  }

  /**
   * 停止观察目标元素
   */
  unobserveTarget(target) {
    if (!target || !target._observerId) return

    const observer = this.observerPool.get(target._observerId)
    if (observer) {
      observer.instance.unobserve(target)
      observer.targets.delete(target)
      
      // 清理目标元素上的数据
      delete target._lazyCallback
      delete target._observerId
    }
  }

  /**
   * 记录加载成功
   */
  recordLoadSuccess(target, loadTime) {
    this.stats.loadedImages++
    this.stats.totalLoadTime += loadTime
    this.stats.averageLoadTime = this.stats.totalLoadTime / this.stats.loadedImages

    if (this.config.enableStats) {
      this.performanceData.loadTimes.push({
        timestamp: Date.now(),
        loadTime,
        target: target.src || target.dataset.src
      })

      // 限制数据量
      if (this.performanceData.loadTimes.length > 1000) {
        this.performanceData.loadTimes = this.performanceData.loadTimes.slice(-500)
      }
    }
  }

  /**
   * 记录加载错误
   */
  recordLoadError(target, error) {
    this.stats.errorImages++

    if (this.config.enableStats) {
      this.performanceData.errorRates.push({
        timestamp: Date.now(),
        error: error.message || 'Unknown error',
        target: target.src || target.dataset.src
      })

      // 限制数据量
      if (this.performanceData.errorRates.length > 500) {
        this.performanceData.errorRates = this.performanceData.errorRates.slice(-250)
      }
    }
  }

  /**
   * 获取统计数据
   */
  getStats() {
    const successRate = this.stats.totalImages > 0 
      ? (this.stats.loadedImages / this.stats.totalImages * 100).toFixed(2)
      : 0

    const errorRate = this.stats.totalImages > 0
      ? (this.stats.errorImages / this.stats.totalImages * 100).toFixed(2)
      : 0

    return {
      ...this.stats,
      successRate: `${successRate}%`,
      errorRate: `${errorRate}%`,
      savedRequests: this.stats.totalImages - this.stats.loadedImages - this.stats.errorImages
    }
  }

  /**
   * 获取性能数据
   */
  getPerformanceData() {
    return this.performanceData
  }

  /**
   * 启动性能监控
   */
  startPerformanceMonitoring() {
    if (!this.support.performanceObserver) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.initiatorType === 'img') {
            this.performanceData.loadTimes.push({
              timestamp: Date.now(),
              loadTime: entry.responseEnd - entry.startTime,
              target: entry.name
            })
          }
        })
      })

      observer.observe({ entryTypes: ['resource'] })
    } catch (error) {
      console.warn('LazyLoadManager: Performance monitoring failed:', error)
    }

    // 内存使用监控
    if (this.support.requestIdleCallback) {
      const monitorMemory = () => {
        if (performance.memory) {
          this.performanceData.memoryUsage.push({
            timestamp: Date.now(),
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize
          })

          // 限制数据量
          if (this.performanceData.memoryUsage.length > 100) {
            this.performanceData.memoryUsage = this.performanceData.memoryUsage.slice(-50)
          }
        }

        requestIdleCallback(monitorMemory)
      }

      requestIdleCallback(monitorMemory)
    }
  }

  /**
   * 清理资源
   */
  cleanup() {
    // 清理Observer实例
    this.observerPool.forEach(observer => {
      observer.instance.disconnect()
    })
    this.observerPool.clear()

    // 清理队列
    this.loadQueue = []
    this.loadingQueue.clear()

    // 保存统计数据
    if (this.config.enableStats) {
      try {
        localStorage.setItem('lazy-load-stats', JSON.stringify(this.stats))
      } catch (error) {
        console.warn('LazyLoadManager: Failed to save stats')
      }
    }
  }

  /**
   * 重置统计数据
   */
  resetStats() {
    this.stats = {
      totalImages: 0,
      loadedImages: 0,
      errorImages: 0,
      savedRequests: 0,
      totalLoadTime: 0,
      averageLoadTime: 0
    }

    this.performanceData = {
      loadTimes: [],
      errorRates: [],
      memoryUsage: []
    }
  }
}

// 创建全局实例
const lazyLoadManager = new LazyLoadManager()

export { lazyLoadManager, LazyLoadManager }