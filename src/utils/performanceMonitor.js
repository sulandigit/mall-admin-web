/**
 * 性能监控工具
 * 提供组件渲染性能、API请求性能、内存使用等监控功能
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      // 页面性能指标
      pageMetrics: new Map(),
      // 组件渲染性能
      componentMetrics: new Map(),
      // API请求性能
      apiMetrics: new Map(),
      // 内存使用情况
      memoryMetrics: [],
      // 用户交互性能
      interactionMetrics: new Map()
    }
    
    this.observers = {
      performance: null,
      memory: null,
      longTask: null
    }
    
    this.thresholds = {
      // 首次内容绘制时间阈值
      FCP: 2000, // 2秒
      // 最大内容绘制时间阈值
      LCP: 4000, // 4秒
      // 首次输入延迟阈值
      FID: 100, // 100毫秒
      // 累积布局偏移阈值
      CLS: 0.1,
      // 组件渲染时间阈值
      componentRender: 16, // 16毫秒 (60fps)
      // API请求时间阈值
      apiRequest: 1000, // 1秒
      // 长任务阈值
      longTask: 50 // 50毫秒
    }
    
    this.init()
  }

  /**
   * 初始化性能监控
   */
  init() {
    this.observeWebVitals()
    this.observeMemoryUsage()
    this.observeLongTasks()
    this.observeNavigation()
  }

  /**
   * 监控Web Vitals指标
   */
  observeWebVitals() {
    // 监控FCP (First Contentful Paint)
    this.observePerformanceEntry('paint', (entries) => {
      entries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('pageMetrics', 'FCP', {
            value: entry.startTime,
            timestamp: Date.now(),
            isGood: entry.startTime < this.thresholds.FCP
          })
        }
      })
    })

    // 监控LCP (Largest Contentful Paint)
    this.observePerformanceEntry('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) {
        this.recordMetric('pageMetrics', 'LCP', {
          value: lastEntry.startTime,
          timestamp: Date.now(),
          isGood: lastEntry.startTime < this.thresholds.LCP
        })
      }
    })

    // 监控FID (First Input Delay)
    this.observePerformanceEntry('first-input', (entries) => {
      entries.forEach(entry => {
        this.recordMetric('pageMetrics', 'FID', {
          value: entry.processingStart - entry.startTime,
          timestamp: Date.now(),
          isGood: (entry.processingStart - entry.startTime) < this.thresholds.FID
        })
      })
    })

    // 监控CLS (Cumulative Layout Shift)
    let clsValue = 0
    this.observePerformanceEntry('layout-shift', (entries) => {
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      
      this.recordMetric('pageMetrics', 'CLS', {
        value: clsValue,
        timestamp: Date.now(),
        isGood: clsValue < this.thresholds.CLS
      })
    })
  }

  /**
   * 监控内存使用情况
   */
  observeMemoryUsage() {
    if ('memory' in performance) {
      const recordMemory = () => {
        const memory = performance.memory
        const memoryInfo = {
          used: Math.round(memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(memory.totalJSHeapSize / 1048576), // MB
          limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
          timestamp: Date.now()
        }
        
        this.metrics.memoryMetrics.push(memoryInfo)
        
        // 只保留最近100条记录
        if (this.metrics.memoryMetrics.length > 100) {
          this.metrics.memoryMetrics.shift()
        }
      }

      // 每30秒记录一次内存使用情况
      setInterval(recordMemory, 30000)
      recordMemory() // 立即记录一次
    }
  }

  /**
   * 监控长任务
   */
  observeLongTasks() {
    this.observePerformanceEntry('longtask', (entries) => {
      entries.forEach(entry => {
        if (entry.duration > this.thresholds.longTask) {
          this.recordMetric('pageMetrics', 'longTask', {
            duration: entry.duration,
            startTime: entry.startTime,
            timestamp: Date.now()
          })
        }
      })
    })
  }

  /**
   * 监控导航性能
   */
  observeNavigation() {
    this.observePerformanceEntry('navigation', (entries) => {
      entries.forEach(entry => {
        const metrics = {
          // DNS查询时间
          dnsTime: entry.domainLookupEnd - entry.domainLookupStart,
          // TCP连接时间
          tcpTime: entry.connectEnd - entry.connectStart,
          // 请求响应时间
          requestTime: entry.responseEnd - entry.requestStart,
          // DOM解析时间
          domParseTime: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
          // 页面加载总时间
          loadTime: entry.loadEventEnd - entry.navigationStart,
          timestamp: Date.now()
        }
        
        this.recordMetric('pageMetrics', 'navigation', metrics)
      })
    })
  }

  /**
   * 观察性能条目
   */
  observePerformanceEntry(entryType, callback) {
    try {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          callback(list.getEntries())
        })
        
        observer.observe({ entryTypes: [entryType] })
        return observer
      }
    } catch (error) {
      console.warn(`无法观察性能条目 ${entryType}:`, error)
    }
  }

  /**
   * 记录指标
   */
  recordMetric(category, name, data) {
    if (!this.metrics[category]) {
      this.metrics[category] = new Map()
    }
    
    if (!this.metrics[category].has(name)) {
      this.metrics[category].set(name, [])
    }
    
    const metrics = this.metrics[category].get(name)
    metrics.push(data)
    
    // 只保留最近50条记录
    if (metrics.length > 50) {
      metrics.shift()
    }
  }

  /**
   * 监控组件渲染性能
   */
  measureComponentRender(componentName, renderFunction) {
    return async (...args) => {
      const startTime = performance.now()
      
      try {
        const result = await renderFunction(...args)
        const endTime = performance.now()
        const duration = endTime - startTime
        
        this.recordMetric('componentMetrics', componentName, {
          duration,
          timestamp: Date.now(),
          isGood: duration < this.thresholds.componentRender,
          args: args.length
        })
        
        return result
      } catch (error) {
        const endTime = performance.now()
        const duration = endTime - startTime
        
        this.recordMetric('componentMetrics', componentName, {
          duration,
          timestamp: Date.now(),
          error: error.message,
          args: args.length
        })
        
        throw error
      }
    }
  }

  /**
   * 监控API请求性能
   */
  measureApiRequest(apiName, requestFunction) {
    return async (...args) => {
      const startTime = performance.now()
      
      try {
        const result = await requestFunction(...args)
        const endTime = performance.now()
        const duration = endTime - startTime
        
        this.recordMetric('apiMetrics', apiName, {
          duration,
          timestamp: Date.now(),
          isGood: duration < this.thresholds.apiRequest,
          success: true,
          args: args.length
        })
        
        return result
      } catch (error) {
        const endTime = performance.now()
        const duration = endTime - startTime
        
        this.recordMetric('apiMetrics', apiName, {
          duration,
          timestamp: Date.now(),
          success: false,
          error: error.message,
          args: args.length
        })
        
        throw error
      }
    }
  }

  /**
   * 监控用户交互性能
   */
  measureInteraction(interactionName, startTime) {
    const endTime = performance.now()
    const duration = endTime - startTime
    
    this.recordMetric('interactionMetrics', interactionName, {
      duration,
      timestamp: Date.now(),
      isGood: duration < this.thresholds.FID
    })
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport() {
    const report = {
      timestamp: Date.now(),
      pageMetrics: this.getMetricsSummary('pageMetrics'),
      componentMetrics: this.getMetricsSummary('componentMetrics'),
      apiMetrics: this.getMetricsSummary('apiMetrics'),
      memoryMetrics: this.getMemorySummary(),
      interactionMetrics: this.getMetricsSummary('interactionMetrics')
    }
    
    return report
  }

  /**
   * 获取指标摘要
   */
  getMetricsSummary(category) {
    const metrics = this.metrics[category]
    if (!metrics) return {}
    
    const summary = {}
    
    for (const [name, data] of metrics.entries()) {
      if (data.length === 0) continue
      
      const values = data.map(item => item.duration || item.value).filter(v => v != null)
      
      if (values.length > 0) {
        summary[name] = {
          count: data.length,
          average: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          latest: data[data.length - 1],
          goodCount: data.filter(item => item.isGood).length
        }
      }
    }
    
    return summary
  }

  /**
   * 获取内存摘要
   */
  getMemorySummary() {
    if (this.metrics.memoryMetrics.length === 0) return null
    
    const latest = this.metrics.memoryMetrics[this.metrics.memoryMetrics.length - 1]
    const usedValues = this.metrics.memoryMetrics.map(m => m.used)
    
    return {
      current: latest,
      average: usedValues.reduce((a, b) => a + b, 0) / usedValues.length,
      min: Math.min(...usedValues),
      max: Math.max(...usedValues),
      trend: this.calculateTrend(usedValues)
    }
  }

  /**
   * 计算趋势
   */
  calculateTrend(values) {
    if (values.length < 2) return 'stable'
    
    const recent = values.slice(-5) // 最近5个值
    const older = values.slice(-10, -5) // 之前5个值
    
    if (recent.length === 0 || older.length === 0) return 'stable'
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
    
    const change = (recentAvg - olderAvg) / olderAvg
    
    if (change > 0.1) return 'increasing'
    if (change < -0.1) return 'decreasing'
    return 'stable'
  }

  /**
   * 获取性能警告
   */
  getPerformanceWarnings() {
    const warnings = []
    const report = this.getPerformanceReport()
    
    // 检查页面性能警告
    if (report.pageMetrics.FCP && report.pageMetrics.FCP.latest.value > this.thresholds.FCP) {
      warnings.push({
        type: 'FCP',
        message: `首次内容绘制时间过长: ${report.pageMetrics.FCP.latest.value.toFixed(2)}ms`,
        severity: 'warning'
      })
    }
    
    if (report.pageMetrics.LCP && report.pageMetrics.LCP.latest.value > this.thresholds.LCP) {
      warnings.push({
        type: 'LCP',
        message: `最大内容绘制时间过长: ${report.pageMetrics.LCP.latest.value.toFixed(2)}ms`,
        severity: 'error'
      })
    }
    
    // 检查内存警告
    if (report.memoryMetrics && report.memoryMetrics.current.used > 100) {
      warnings.push({
        type: 'memory',
        message: `内存使用过高: ${report.memoryMetrics.current.used}MB`,
        severity: 'warning'
      })
    }
    
    // 检查API性能警告
    Object.entries(report.apiMetrics).forEach(([apiName, metrics]) => {
      if (metrics.average > this.thresholds.apiRequest) {
        warnings.push({
          type: 'api',
          message: `API ${apiName} 平均响应时间过长: ${metrics.average.toFixed(2)}ms`,
          severity: 'warning'
        })
      }
    })
    
    return warnings
  }

  /**
   * 导出性能数据
   */
  exportData() {
    return {
      metrics: {
        pageMetrics: Object.fromEntries(this.metrics.pageMetrics),
        componentMetrics: Object.fromEntries(this.metrics.componentMetrics),
        apiMetrics: Object.fromEntries(this.metrics.apiMetrics),
        memoryMetrics: this.metrics.memoryMetrics,
        interactionMetrics: Object.fromEntries(this.metrics.interactionMetrics)
      },
      report: this.getPerformanceReport(),
      warnings: this.getPerformanceWarnings(),
      timestamp: Date.now()
    }
  }

  /**
   * 清空所有数据
   */
  clear() {
    this.metrics.pageMetrics.clear()
    this.metrics.componentMetrics.clear()
    this.metrics.apiMetrics.clear()
    this.metrics.memoryMetrics = []
    this.metrics.interactionMetrics.clear()
  }
}

// 全局性能监控实例
const performanceMonitor = new PerformanceMonitor()

// Vue插件
export const PerformanceMonitorPlugin = {
  install(Vue) {
    // 添加全局方法
    Vue.prototype.$performanceMonitor = performanceMonitor
    
    // 添加组件性能监控混入
    Vue.mixin({
      beforeCreate() {
        if (this.$options.name && this.$options.performanceMonitor !== false) {
          const originalRender = this.$options.render
          if (originalRender) {
            this.$options.render = performanceMonitor.measureComponentRender(
              this.$options.name,
              originalRender.bind(this)
            )
          }
        }
      }
    })
  }
}

export default performanceMonitor