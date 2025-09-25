// 性能监控工具
export class PerformanceMonitor {
  constructor() {
    this.marks = new Map()
    this.measures = new Map()
    this.isSupported = typeof performance !== 'undefined' && performance.mark && performance.measure
  }

  // 开始计时
  startMark(name) {
    if (!this.isSupported) return

    const markName = `${name}_start`
    performance.mark(markName)
    this.marks.set(name, markName)
  }

  // 结束计时并返回耗时
  endMark(name) {
    if (!this.isSupported) return 0

    const startMark = this.marks.get(name)
    if (!startMark) {
      console.warn(`No start mark found for: ${name}`)
      return 0
    }

    const endMarkName = `${name}_end`
    const measureName = `${name}_measure`
    
    performance.mark(endMarkName)
    performance.measure(measureName, startMark, endMarkName)
    
    const measure = performance.getEntriesByName(measureName)[0]
    const duration = measure ? measure.duration : 0
    
    this.measures.set(name, duration)
    
    // 清理标记
    performance.clearMarks(startMark)
    performance.clearMarks(endMarkName)
    performance.clearMeasures(measureName)
    
    return duration
  }

  // 获取测量结果
  getMeasure(name) {
    return this.measures.get(name) || 0
  }

  // 获取所有测量结果
  getAllMeasures() {
    return Object.fromEntries(this.measures)
  }

  // 清理所有标记和测量
  clear() {
    this.marks.clear()
    this.measures.clear()
    if (this.isSupported) {
      performance.clearMarks()
      performance.clearMeasures()
    }
  }

  // 监控内存使用
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
      }
    }
    return null
  }

  // 监控页面加载性能
  getPageLoadMetrics() {
    if (!this.isSupported) return null

    const navigation = performance.getEntriesByType('navigation')[0]
    if (!navigation) return null

    return {
      dns: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
      tcp: Math.round(navigation.connectEnd - navigation.connectStart),
      request: Math.round(navigation.responseStart - navigation.requestStart),
      response: Math.round(navigation.responseEnd - navigation.responseStart),
      dom: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
      load: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
      total: Math.round(navigation.loadEventEnd - navigation.navigationStart)
    }
  }

  // 监控资源加载
  getResourceMetrics() {
    if (!this.isSupported) return []

    const resources = performance.getEntriesByType('resource')
    return resources.map(resource => ({
      name: resource.name,
      type: resource.initiatorType,
      size: resource.transferSize || 0,
      duration: Math.round(resource.duration),
      startTime: Math.round(resource.startTime)
    }))
  }
}

// 文件处理性能监控
export class FileProcessingMonitor extends PerformanceMonitor {
  constructor() {
    super()
    this.fileMetrics = new Map()
  }

  // 开始文件处理监控
  startFileProcessing(fileName, fileSize) {
    const key = `file_${fileName}`
    this.startMark(key)
    this.fileMetrics.set(key, {
      fileName,
      fileSize,
      startTime: Date.now(),
      stages: []
    })
    return key
  }

  // 记录处理阶段
  recordStage(fileKey, stageName) {
    const metric = this.fileMetrics.get(fileKey)
    if (metric) {
      metric.stages.push({
        name: stageName,
        timestamp: Date.now(),
        duration: Date.now() - metric.startTime
      })
    }
  }

  // 结束文件处理监控
  endFileProcessing(fileKey) {
    const duration = this.endMark(fileKey.replace('file_', ''))
    const metric = this.fileMetrics.get(fileKey)
    
    if (metric) {
      metric.totalDuration = duration
      metric.endTime = Date.now()
      metric.processingRate = metric.fileSize / duration // bytes per ms
    }
    
    return metric
  }

  // 获取文件处理报告
  getFileProcessingReport() {
    const reports = []
    for (const [key, metric] of this.fileMetrics) {
      reports.push({
        ...metric,
        sizeFormatted: this.formatBytes(metric.fileSize),
        durationFormatted: this.formatDuration(metric.totalDuration),
        rateFormatted: this.formatRate(metric.processingRate)
      })
    }
    return reports
  }

  // 格式化字节数
  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 格式化持续时间
  formatDuration(ms) {
    if (ms < 1000) return Math.round(ms) + 'ms'
    return (ms / 1000).toFixed(2) + 's'
  }

  // 格式化处理速率
  formatRate(rate) {
    if (!rate) return 'N/A'
    const mbPerSec = (rate * 1000) / (1024 * 1024)
    return mbPerSec.toFixed(2) + ' MB/s'
  }
}

// Vue 组件性能监控 Mixin
export const PerformanceMonitorMixin = {
  data() {
    return {
      performanceMonitor: new PerformanceMonitor()
    }
  },
  
  methods: {
    // 开始监控操作
    startPerformanceMonitoring(operationName) {
      this.performanceMonitor.startMark(operationName)
    },
    
    // 结束监控操作
    endPerformanceMonitoring(operationName) {
      const duration = this.performanceMonitor.endMark(operationName)
      console.log(`[Performance] ${operationName}: ${duration.toFixed(2)}ms`)
      return duration
    },
    
    // 获取内存使用情况
    logMemoryUsage(label = '') {
      const memory = this.performanceMonitor.getMemoryUsage()
      if (memory) {
        console.log(`[Memory${label ? ' ' + label : ''}] Used: ${memory.used}MB, Total: ${memory.total}MB`)
      }
    },
    
    // 监控组件渲染性能
    monitorRender(callback) {
      this.startPerformanceMonitoring('component_render')
      this.$nextTick(() => {
        const duration = this.endPerformanceMonitoring('component_render')
        if (callback) callback(duration)
      })
    }
  },
  
  beforeDestroy() {
    if (this.performanceMonitor) {
      this.performanceMonitor.clear()
    }
  }
}

// 性能警告阈值
export const PERFORMANCE_THRESHOLDS = {
  FILE_UPLOAD: 5000, // 5秒
  FILE_PROCESSING: 10000, // 10秒
  DATA_RENDERING: 1000, // 1秒
  API_REQUEST: 3000, // 3秒
  MEMORY_WARNING: 100, // 100MB
  MEMORY_CRITICAL: 200 // 200MB
}

// 性能报告生成器
export class PerformanceReporter {
  constructor() {
    this.reports = []
  }

  // 添加性能报告
  addReport(operation, duration, details = {}) {
    const report = {
      operation,
      duration,
      timestamp: new Date().toISOString(),
      isSlowOperation: this.isSlowOperation(operation, duration),
      ...details
    }
    
    this.reports.push(report)
    
    // 如果操作较慢，输出警告
    if (report.isSlowOperation) {
      console.warn(`[Performance Warning] ${operation} took ${duration.toFixed(2)}ms`, details)
    }
    
    return report
  }

  // 判断是否为慢操作
  isSlowOperation(operation, duration) {
    const thresholds = {
      'file_upload': PERFORMANCE_THRESHOLDS.FILE_UPLOAD,
      'file_processing': PERFORMANCE_THRESHOLDS.FILE_PROCESSING,
      'data_render': PERFORMANCE_THRESHOLDS.DATA_RENDERING,
      'api_request': PERFORMANCE_THRESHOLDS.API_REQUEST
    }
    
    for (const [key, threshold] of Object.entries(thresholds)) {
      if (operation.includes(key)) {
        return duration > threshold
      }
    }
    
    return false
  }

  // 获取性能摘要
  getSummary() {
    if (this.reports.length === 0) return null

    const totalOperations = this.reports.length
    const slowOperations = this.reports.filter(r => r.isSlowOperation).length
    const averageDuration = this.reports.reduce((sum, r) => sum + r.duration, 0) / totalOperations
    
    const operationTypes = {}
    this.reports.forEach(report => {
      const type = report.operation.split('_')[0]
      if (!operationTypes[type]) {
        operationTypes[type] = { count: 0, totalDuration: 0 }
      }
      operationTypes[type].count++
      operationTypes[type].totalDuration += report.duration
    })

    return {
      totalOperations,
      slowOperations,
      slowOperationRate: (slowOperations / totalOperations * 100).toFixed(1) + '%',
      averageDuration: averageDuration.toFixed(2) + 'ms',
      operationTypes: Object.keys(operationTypes).map(type => ({
        type,
        count: operationTypes[type].count,
        averageDuration: (operationTypes[type].totalDuration / operationTypes[type].count).toFixed(2) + 'ms'
      }))
    }
  }

  // 清空报告
  clear() {
    this.reports = []
  }

  // 导出报告
  exportReports() {
    return {
      summary: this.getSummary(),
      details: this.reports,
      timestamp: new Date().toISOString()
    }
  }
}

// 创建全局实例
export const globalPerformanceMonitor = new PerformanceMonitor()
export const globalPerformanceReporter = new PerformanceReporter()

export default {
  PerformanceMonitor,
  FileProcessingMonitor,
  PerformanceMonitorMixin,
  PerformanceReporter,
  PERFORMANCE_THRESHOLDS,
  globalPerformanceMonitor,
  globalPerformanceReporter
}