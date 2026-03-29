/**
 * 性能监控系统
 * 提供路由加载性能监控、用户行为分析、性能指标收集等功能
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      // 路由性能指标
      routeMetrics: new Map(),
      // 资源加载指标
      resourceMetrics: new Map(),
      // 用户交互指标
      interactionMetrics: new Map(),
      // 系统性能指标
      systemMetrics: new Map()
    }
    
    this.config = {
      // 是否启用监控
      enabled: true,
      // 采样率 (0-1)
      sampleRate: 0.1,
      // 上报间隔 (毫秒)
      reportInterval: 30000,
      // 最大存储条数
      maxRecords: 1000
    }
    
    this.observers = {
      performance: null,
      intersection: null,
      mutation: null
    }
    
    this.isSupported = this.checkSupport()
    this.init()
  }

  /**
   * 检查浏览器支持情况
   */
  checkSupport() {
    return !!(
      window.performance &&
      window.performance.now &&
      window.performance.getEntriesByType &&
      window.PerformanceObserver
    )
  }

  /**
   * 初始化监控系统
   */
  init() {
    if (!this.isSupported || !this.config.enabled) {
      console.warn('性能监控不可用或已禁用')
      return
    }

    this.setupPerformanceObserver()
    this.setupResourceObserver()
    this.setupNavigationMonitor()
    this.setupMemoryMonitor()
    this.setupErrorMonitor()
    this.startReporting()
    
    console.log('性能监控系统已启动')
  }

  /**
   * 设置性能观察者
   */
  setupPerformanceObserver() {
    if (!window.PerformanceObserver) return

    try {
      // 监控导航性能
      this.observers.performance = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          this.recordPerformanceEntry(entry)
        })
      })

      this.observers.performance.observe({ 
        entryTypes: ['navigation', 'measure', 'mark'] 
      })
    } catch (error) {
      console.warn('设置性能观察者失败:', error)
    }
  }

  /**
   * 设置资源监控
   */
  setupResourceObserver() {
    if (!window.PerformanceObserver) return

    try {
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.name.includes('.js') || entry.name.includes('.css')) {
            this.recordResourceEntry(entry)
          }
        })
      })

      resourceObserver.observe({ entryTypes: ['resource'] })
    } catch (error) {
      console.warn('设置资源观察者失败:', error)
    }
  }

  /**
   * 设置导航监控
   */
  setupNavigationMonitor() {
    // 监控页面加载时间
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.recordPageLoadMetrics()
      }, 100)
    })

    // 监控页面可见性变化
    document.addEventListener('visibilitychange', () => {
      this.recordVisibilityChange()
    })
  }

  /**
   * 设置内存监控
   */
  setupMemoryMonitor() {
    if (!performance.memory) return

    setInterval(() => {
      this.recordMemoryUsage()
    }, 10000) // 每10秒记录一次内存使用
  }

  /**
   * 设置错误监控
   */
  setupErrorMonitor() {
    window.addEventListener('error', (event) => {
      this.recordError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now()
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        type: 'promise',
        message: event.reason?.message || '未处理的Promise拒绝',
        stack: event.reason?.stack,
        timestamp: Date.now()
      })
    })
  }

  /**
   * 记录路由切换性能
   */
  recordRouteChange(fromRoute, toRoute) {
    const startTime = performance.now()
    const routeKey = `${fromRoute || 'initial'}_to_${toRoute}`
    
    const metric = {
      fromRoute,
      toRoute,
      startTime,
      endTime: null,
      duration: null,
      timestamp: Date.now()
    }
    
    this.metrics.routeMetrics.set(routeKey, metric)
    
    // 设置标记点
    performance.mark(`route-start-${toRoute}`)
    
    return {
      finish: () => {
        const endTime = performance.now()
        metric.endTime = endTime
        metric.duration = endTime - startTime
        
        performance.mark(`route-end-${toRoute}`)
        performance.measure(
          `route-${toRoute}`, 
          `route-start-${toRoute}`, 
          `route-end-${toRoute}`
        )
        
        this.analyzeRoutePerformance(metric)
      }
    }
  }

  /**
   * 记录组件加载性能
   */
  recordComponentLoad(componentName, loadTime) {
    const metric = {
      component: componentName,
      loadTime,
      timestamp: Date.now(),
      url: window.location.href
    }
    
    this.metrics.resourceMetrics.set(`component-${componentName}`, metric)
    
    // 检查加载时间是否异常
    if (loadTime > 2000) {
      console.warn(`组件 ${componentName} 加载时间过长: ${loadTime}ms`)
    }
  }

  /**
   * 记录用户交互
   */
  recordUserInteraction(type, target, duration = 0) {
    if (!this.shouldSample()) return

    const metric = {
      type,
      target,
      duration,
      timestamp: Date.now(),
      url: window.location.href
    }
    
    const key = `${type}-${Date.now()}`
    this.metrics.interactionMetrics.set(key, metric)
    
    this.cleanupOldMetrics('interactionMetrics')
  }

  /**
   * 记录系统性能指标
   */
  recordSystemMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0]
    if (!navigation) return

    const metrics = {
      // 页面加载指标
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      
      // 网络指标
      dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcpConnect: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      
      // 渲染指标
      domParsing: navigation.domInteractive - navigation.responseEnd,
      
      timestamp: Date.now()
    }
    
    this.metrics.systemMetrics.set('latest', metrics)
  }

  /**
   * 记录性能条目
   */
  recordPerformanceEntry(entry) {
    if (entry.entryType === 'navigation') {
      this.recordNavigationEntry(entry)
    } else if (entry.entryType === 'measure') {
      this.recordMeasureEntry(entry)
    }
  }

  /**
   * 记录导航条目
   */
  recordNavigationEntry(entry) {
    const metrics = {
      type: 'navigation',
      duration: entry.duration,
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      transferSize: entry.transferSize,
      timestamp: Date.now()
    }
    
    this.metrics.systemMetrics.set('navigation', metrics)
  }

  /**
   * 记录测量条目
   */
  recordMeasureEntry(entry) {
    if (entry.name.startsWith('route-')) {
      const routeName = entry.name.replace('route-', '')
      this.metrics.routeMetrics.set(routeName, {
        ...this.metrics.routeMetrics.get(routeName),
        measureDuration: entry.duration
      })
    }
  }

  /**
   * 记录资源条目
   */
  recordResourceEntry(entry) {
    const metrics = {
      name: entry.name,
      duration: entry.duration,
      transferSize: entry.transferSize,
      decodedBodySize: entry.decodedBodySize,
      encodedBodySize: entry.encodedBodySize,
      timestamp: Date.now()
    }
    
    this.metrics.resourceMetrics.set(entry.name, metrics)
  }

  /**
   * 记录页面加载指标
   */
  recordPageLoadMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0]
    if (!navigation) return

    // 计算关键性能指标
    const metrics = {
      // First Contentful Paint
      fcp: this.getFirstContentfulPaint(),
      // Largest Contentful Paint
      lcp: this.getLargestContentfulPaint(),
      // First Input Delay
      fid: this.getFirstInputDelay(),
      // Cumulative Layout Shift
      cls: this.getCumulativeLayoutShift(),
      // 页面完全加载时间
      loadTime: navigation.loadEventEnd - navigation.fetchStart,
      // DOM 就绪时间
      domReady: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      timestamp: Date.now()
    }
    
    this.metrics.systemMetrics.set('core-vitals', metrics)
    this.analyzePerformance(metrics)
  }

  /**
   * 获取首次内容绘制时间
   */
  getFirstContentfulPaint() {
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0]
    return fcpEntry ? fcpEntry.startTime : null
  }

  /**
   * 获取最大内容绘制时间
   */
  getLargestContentfulPaint() {
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
    return lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : null
  }

  /**
   * 获取首次输入延迟
   */
  getFirstInputDelay() {
    const fidEntries = performance.getEntriesByType('first-input')
    return fidEntries.length > 0 ? fidEntries[0].processingStart - fidEntries[0].startTime : null
  }

  /**
   * 获取累积布局偏移
   */
  getCumulativeLayoutShift() {
    let cls = 0
    const clsEntries = performance.getEntriesByType('layout-shift')
    clsEntries.forEach(entry => {
      if (!entry.hadRecentInput) {
        cls += entry.value
      }
    })
    return cls
  }

  /**
   * 记录内存使用
   */
  recordMemoryUsage() {
    if (!performance.memory) return

    const memory = {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit,
      timestamp: Date.now()
    }
    
    this.metrics.systemMetrics.set('memory', memory)
    
    // 检查内存使用是否过高
    const usagePercent = (memory.used / memory.limit) * 100
    if (usagePercent > 80) {
      console.warn(`内存使用率过高: ${usagePercent.toFixed(1)}%`)
    }
  }

  /**
   * 记录可见性变化
   */
  recordVisibilityChange() {
    const metric = {
      hidden: document.hidden,
      visibilityState: document.visibilityState,
      timestamp: Date.now()
    }
    
    this.metrics.interactionMetrics.set(`visibility-${Date.now()}`, metric)
  }

  /**
   * 记录错误
   */
  recordError(error) {
    const key = `error-${Date.now()}`
    this.metrics.systemMetrics.set(key, error)
    
    // 只保留最近的错误记录
    this.cleanupOldMetrics('systemMetrics', 100)
  }

  /**
   * 分析路由性能
   */
  analyzeRoutePerformance(metric) {
    const { toRoute, duration } = metric
    
    // 性能评级
    let grade = 'good'
    if (duration > 1000) {
      grade = 'poor'
    } else if (duration > 500) {
      grade = 'needs-improvement'
    }
    
    metric.grade = grade
    
    // 记录性能异常
    if (grade === 'poor') {
      console.warn(`路由 ${toRoute} 加载性能较差: ${duration}ms`)
    }
  }

  /**
   * 分析整体性能
   */
  analyzePerformance(metrics) {
    const analysis = {
      fcp: this.gradeMetric(metrics.fcp, [1800, 3000]),
      lcp: this.gradeMetric(metrics.lcp, [2500, 4000]),
      fid: this.gradeMetric(metrics.fid, [100, 300]),
      cls: this.gradeMetric(metrics.cls, [0.1, 0.25], true),
      loadTime: this.gradeMetric(metrics.loadTime, [2000, 4000])
    }
    
    metrics.analysis = analysis
    
    // 输出性能报告
    this.generatePerformanceReport(analysis)
  }

  /**
   * 性能指标评级
   */
  gradeMetric(value, thresholds, lowerIsBetter = false) {
    if (value === null || value === undefined) return 'unknown'
    
    const [good, poor] = thresholds
    
    if (lowerIsBetter) {
      if (value <= good) return 'good'
      if (value <= poor) return 'needs-improvement'
      return 'poor'
    } else {
      if (value <= good) return 'good'
      if (value <= poor) return 'needs-improvement'
      return 'poor'
    }
  }

  /**
   * 生成性能报告
   */
  generatePerformanceReport(analysis) {
    const report = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      analysis
    }
    
    console.log('性能分析报告:', report)
    
    // 检查是否有性能问题
    const issues = Object.entries(analysis)
      .filter(([, grade]) => grade === 'poor')
      .map(([metric]) => metric)
    
    if (issues.length > 0) {
      console.warn('检测到性能问题:', issues)
    }
  }

  /**
   * 是否应该采样
   */
  shouldSample() {
    return Math.random() < this.config.sampleRate
  }

  /**
   * 清理旧指标
   */
  cleanupOldMetrics(metricsType, maxRecords = null) {
    const metrics = this.metrics[metricsType]
    const limit = maxRecords || this.config.maxRecords
    
    if (metrics.size > limit) {
      const entries = Array.from(metrics.entries())
      const toDelete = entries.slice(0, entries.length - limit)
      toDelete.forEach(([key]) => metrics.delete(key))
    }
  }

  /**
   * 开始定期上报
   */
  startReporting() {
    setInterval(() => {
      this.reportMetrics()
    }, this.config.reportInterval)
  }

  /**
   * 上报指标
   */
  reportMetrics() {
    if (!this.shouldSample()) return

    const report = this.generateReport()
    
    // 这里可以发送到后端服务
    console.log('性能指标报告:', report)
    
    // 清理旧数据
    this.cleanupAllMetrics()
  }

  /**
   * 生成完整报告
   */
  generateReport() {
    return {
      timestamp: Date.now(),
      url: window.location.href,
      metrics: {
        routes: Object.fromEntries(this.metrics.routeMetrics),
        resources: Object.fromEntries(this.metrics.resourceMetrics),
        interactions: Object.fromEntries(this.metrics.interactionMetrics),
        system: Object.fromEntries(this.metrics.systemMetrics)
      },
      summary: this.generateSummary()
    }
  }

  /**
   * 生成摘要统计
   */
  generateSummary() {
    const routeMetrics = Array.from(this.metrics.routeMetrics.values())
    const avgRouteTime = routeMetrics.length > 0 
      ? routeMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / routeMetrics.length 
      : 0

    return {
      totalRoutes: routeMetrics.length,
      avgRouteTime: Math.round(avgRouteTime),
      totalResources: this.metrics.resourceMetrics.size,
      totalInteractions: this.metrics.interactionMetrics.size,
      memoryUsage: this.metrics.systemMetrics.get('memory')
    }
  }

  /**
   * 清理所有指标
   */
  cleanupAllMetrics() {
    Object.keys(this.metrics).forEach(type => {
      this.cleanupOldMetrics(type)
    })
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    return {
      metrics: this.metrics,
      summary: this.generateSummary(),
      config: this.config
    }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * 销毁监控器
   */
  destroy() {
    Object.values(this.observers).forEach(observer => {
      if (observer) {
        observer.disconnect()
      }
    })
    
    this.metrics = {
      routeMetrics: new Map(),
      resourceMetrics: new Map(),
      interactionMetrics: new Map(),
      systemMetrics: new Map()
    }
  }
}

// 创建单例实例
const performanceMonitor = new PerformanceMonitor()

export default performanceMonitor