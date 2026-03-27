/**
 * 移动端性能优化工具
 * 提供懒加载、缓存、资源优化等功能
 */

/**
 * 图片懒加载指令
 */
export const lazyLoad = {
  bind(el, binding) {
    const { value, modifiers } = binding
    
    // 创建Intersection Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          const src = img.dataset.src
          
          if (src) {
            // 预加载图片
            const image = new Image()
            image.onload = () => {
              img.src = src
              img.classList.add('loaded')
              img.classList.remove('loading')
            }
            image.onerror = () => {
              img.classList.add('error')
              img.classList.remove('loading')
            }
            image.src = src
            
            // 停止观察
            observer.unobserve(img)
          }
        }
      })
    }, {
      threshold: modifiers.eager ? 0.1 : 0,
      rootMargin: modifiers.eager ? '50px' : '0px'
    })
    
    // 设置占位符
    el.classList.add('loading')
    el.dataset.src = value
    
    // 开始观察
    observer.observe(el)
    el._observer = observer
  },
  
  update(el, binding) {
    el.dataset.src = binding.value
  },
  
  unbind(el) {
    if (el._observer) {
      el._observer.disconnect()
      delete el._observer
    }
  }
}

/**
 * 虚拟滚动列表组件
 */
export class VirtualList {
  constructor(container, options = {}) {
    this.container = container
    this.options = {
      itemHeight: 50,
      bufferSize: 5,
      threshold: 0,
      ...options
    }
    
    this.items = []
    this.startIndex = 0
    this.endIndex = 0
    this.scrollTop = 0
    this.containerHeight = 0
    
    this.init()
  }
  
  init() {
    this.container.style.overflow = 'auto'
    this.container.style.position = 'relative'
    
    // 创建虚拟容器
    this.virtualContainer = document.createElement('div')
    this.virtualContainer.style.position = 'absolute'
    this.virtualContainer.style.top = '0'
    this.virtualContainer.style.left = '0'
    this.virtualContainer.style.right = '0'
    this.container.appendChild(this.virtualContainer)
    
    // 绑定滚动事件
    this.container.addEventListener('scroll', this.handleScroll.bind(this))
    
    // 监听容器大小变化
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateContainerHeight()
        this.render()
      })
      this.resizeObserver.observe(this.container)
    }
    
    this.updateContainerHeight()
  }
  
  setItems(items) {
    this.items = items
    this.updateTotalHeight()
    this.render()
  }
  
  updateContainerHeight() {
    this.containerHeight = this.container.clientHeight
    this.visibleCount = Math.ceil(this.containerHeight / this.options.itemHeight)
  }
  
  updateTotalHeight() {
    const totalHeight = this.items.length * this.options.itemHeight
    this.container.style.height = `${totalHeight}px`
  }
  
  handleScroll() {
    this.scrollTop = this.container.scrollTop
    this.render()
  }
  
  render() {
    const startIndex = Math.floor(this.scrollTop / this.options.itemHeight)
    const endIndex = Math.min(
      startIndex + this.visibleCount + this.options.bufferSize * 2,
      this.items.length
    )
    
    this.startIndex = Math.max(0, startIndex - this.options.bufferSize)
    this.endIndex = endIndex
    
    // 清空虚拟容器
    this.virtualContainer.innerHTML = ''
    
    // 渲染可见项
    for (let i = this.startIndex; i < this.endIndex; i++) {
      const item = this.items[i]
      if (item) {
        const element = this.renderItem(item, i)
        element.style.position = 'absolute'
        element.style.top = `${i * this.options.itemHeight}px`
        element.style.left = '0'
        element.style.right = '0'
        element.style.height = `${this.options.itemHeight}px`
        this.virtualContainer.appendChild(element)
      }
    }
  }
  
  renderItem(item, index) {
    // 由子类实现具体的渲染逻辑
    const element = document.createElement('div')
    element.textContent = JSON.stringify(item)
    return element
  }
  
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
    this.container.removeEventListener('scroll', this.handleScroll)
  }
}

/**
 * 防抖函数
 */
export function debounce(func, wait, immediate = false) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

/**
 * 节流函数
 */
export function throttle(func, limit) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 资源预加载器
 */
export class ResourcePreloader {
  constructor() {
    this.cache = new Map()
    this.loading = new Set()
  }
  
  /**
   * 预加载图片
   */
  preloadImage(src) {
    return new Promise((resolve, reject) => {
      if (this.cache.has(src)) {
        resolve(this.cache.get(src))
        return
      }
      
      if (this.loading.has(src)) {
        return
      }
      
      this.loading.add(src)
      
      const img = new Image()
      img.onload = () => {
        this.cache.set(src, img)
        this.loading.delete(src)
        resolve(img)
      }
      img.onerror = () => {
        this.loading.delete(src)
        reject(new Error(`Failed to load image: ${src}`))
      }
      img.src = src
    })
  }
  
  /**
   * 预加载多个图片
   */
  preloadImages(srcs) {
    return Promise.all(srcs.map(src => this.preloadImage(src)))
  }
  
  /**
   * 预加载组件
   */
  preloadComponent(componentLoader) {
    return componentLoader().catch(error => {
      console.error('Component preload failed:', error)
      return null
    })
  }
}

/**
 * 内存管理器
 */
export class MemoryManager {
  constructor() {
    this.cleanupTasks = []
    this.observers = []
  }
  
  /**
   * 添加清理任务
   */
  addCleanupTask(task) {
    this.cleanupTasks.push(task)
  }
  
  /**
   * 添加观察者
   */
  addObserver(observer) {
    this.observers.push(observer)
  }
  
  /**
   * 执行清理
   */
  cleanup() {
    // 执行清理任务
    this.cleanupTasks.forEach(task => {
      try {
        task()
      } catch (error) {
        console.error('Cleanup task failed:', error)
      }
    })
    
    // 断开观察者
    this.observers.forEach(observer => {
      if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect()
      }
    })
    
    // 清空数组
    this.cleanupTasks.length = 0
    this.observers.length = 0
  }
}

/**
 * 移动端缓存管理器
 */
export class MobileCacheManager {
  constructor(options = {}) {
    this.options = {
      maxSize: 50 * 1024 * 1024, // 50MB
      maxAge: 24 * 60 * 60 * 1000, // 24小时
      storageKey: 'mobile_cache',
      ...options
    }
    
    this.cache = new Map()
    this.loadFromStorage()
  }
  
  /**
   * 设置缓存
   */
  set(key, value, maxAge = this.options.maxAge) {
    const item = {
      value,
      timestamp: Date.now(),
      maxAge
    }
    
    this.cache.set(key, item)
    this.saveToStorage()
    this.cleanup()
  }
  
  /**
   * 获取缓存
   */
  get(key) {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }
    
    // 检查是否过期
    if (Date.now() - item.timestamp > item.maxAge) {
      this.cache.delete(key)
      this.saveToStorage()
      return null
    }
    
    return item.value
  }
  
  /**
   * 删除缓存
   */
  delete(key) {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.saveToStorage()
    }
    return deleted
  }
  
  /**
   * 清空缓存
   */
  clear() {
    this.cache.clear()
    this.saveToStorage()
  }
  
  /**
   * 从localStorage加载
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.options.storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        this.cache = new Map(data)
      }
    } catch (error) {
      console.error('Failed to load cache from storage:', error)
    }
  }
  
  /**
   * 保存到localStorage
   */
  saveToStorage() {
    try {
      const data = Array.from(this.cache.entries())
      localStorage.setItem(this.options.storageKey, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save cache to storage:', error)
      // 如果存储失败，可能是空间不足，执行清理
      this.cleanup()
    }
  }
  
  /**
   * 清理过期缓存
   */
  cleanup() {
    const now = Date.now()
    let deleted = false
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.maxAge) {
        this.cache.delete(key)
        deleted = true
      }
    }
    
    if (deleted) {
      this.saveToStorage()
    }
    
    // 检查缓存大小
    this.checkSize()
  }
  
  /**
   * 检查缓存大小
   */
  checkSize() {
    const data = Array.from(this.cache.entries())
    const size = JSON.stringify(data).length
    
    if (size > this.options.maxSize) {
      // 删除最老的缓存项
      const sortedEntries = data.sort((a, b) => a[1].timestamp - b[1].timestamp)
      const deleteCount = Math.ceil(sortedEntries.length * 0.3) // 删除30%
      
      for (let i = 0; i < deleteCount; i++) {
        this.cache.delete(sortedEntries[i][0])
      }
      
      this.saveToStorage()
    }
  }
}

/**
 * 移动端性能监控器
 */
export class MobilePerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: [],
      memory: [],
      loadTimes: []
    }
    
    this.startTime = performance.now()
    this.frameCount = 0
    this.isMonitoring = false
  }
  
  /**
   * 开始监控
   */
  start() {
    this.isMonitoring = true
    this.monitorFPS()
    this.monitorMemory()
  }
  
  /**
   * 停止监控
   */
  stop() {
    this.isMonitoring = false
  }
  
  /**
   * 监控FPS
   */
  monitorFPS() {
    if (!this.isMonitoring) return
    
    const now = performance.now()
    this.frameCount++
    
    if (now - this.startTime >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / (now - this.startTime))
      this.metrics.fps.push(fps)
      
      // 保持最近10秒的数据
      if (this.metrics.fps.length > 10) {
        this.metrics.fps.shift()
      }
      
      this.frameCount = 0
      this.startTime = now
    }
    
    requestAnimationFrame(() => this.monitorFPS())
  }
  
  /**
   * 监控内存使用
   */
  monitorMemory() {
    if (!this.isMonitoring || !performance.memory) return
    
    const memory = {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit,
      timestamp: Date.now()
    }
    
    this.metrics.memory.push(memory)
    
    // 保持最近20个数据点
    if (this.metrics.memory.length > 20) {
      this.metrics.memory.shift()
    }
    
    setTimeout(() => this.monitorMemory(), 2000)
  }
  
  /**
   * 记录加载时间
   */
  recordLoadTime(name, duration) {
    this.metrics.loadTimes.push({
      name,
      duration,
      timestamp: Date.now()
    })
  }
  
  /**
   * 获取性能报告
   */
  getReport() {
    const avgFPS = this.metrics.fps.reduce((sum, fps) => sum + fps, 0) / this.metrics.fps.length || 0
    const lastMemory = this.metrics.memory[this.metrics.memory.length - 1]
    
    return {
      fps: {
        current: this.metrics.fps[this.metrics.fps.length - 1] || 0,
        average: Math.round(avgFPS),
        history: this.metrics.fps
      },
      memory: {
        used: lastMemory ? Math.round(lastMemory.used / 1024 / 1024) : 0,
        total: lastMemory ? Math.round(lastMemory.total / 1024 / 1024) : 0,
        history: this.metrics.memory
      },
      loadTimes: this.metrics.loadTimes.slice(-10)
    }
  }
}

// 全局实例
export const preloader = new ResourcePreloader()
export const cacheManager = new MobileCacheManager()
export const performanceMonitor = new MobilePerformanceMonitor()

export default {
  lazyLoad,
  VirtualList,
  debounce,
  throttle,
  ResourcePreloader,
  MemoryManager,
  MobileCacheManager,
  MobilePerformanceMonitor,
  preloader,
  cacheManager,
  performanceMonitor
}