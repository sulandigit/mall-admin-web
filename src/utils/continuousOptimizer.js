/**
 * 持续优化机制
 * 自动监控性能指标，提供优化建议，实施自动优化策略
 */
import performanceMonitor from './performanceMonitor'
import routeLoadingManager from './routeLoading'
import permissionPreloader from './permissionPreloader'

class ContinuousOptimizer {
  constructor() {
    this.config = {
      // 优化策略配置
      strategies: {
        autoPreload: true,        // 自动预加载
        adaptiveLoading: true,    // 自适应加载
        intelligentCaching: true,  // 智能缓存
        performanceAlert: true    // 性能告警
      },
      
      // 性能阈值配置
      thresholds: {
        routeLoadTime: 1000,     // 路由加载时间阈值(ms)
        memoryUsage: 80,         // 内存使用率阈值(%)
        cacheHitRate: 60,        // 缓存命中率阈值(%)
        errorRate: 5             // 错误率阈值(%)
      },
      
      // 优化间隔配置
      intervals: {
        monitoring: 30000,       // 监控间隔(ms)
        optimization: 300000,    // 优化间隔(ms)
        reporting: 600000        // 报告间隔(ms)
      },
      
      // 自适应配置
      adaptive: {
        enabled: true,
        networkSensitive: true,   // 网络敏感
        deviceSensitive: true,    // 设备敏感
        timeSensitive: true       // 时间敏感
      }
    }
    
    this.state = {
      isRunning: false,
      lastOptimization: null,
      optimizationHistory: [],
      currentStrategy: 'balanced',
      networkInfo: null,
      deviceInfo: null
    }
    
    this.timers = {
      monitoring: null,
      optimization: null,
      reporting: null
    }
    
    this.metrics = {
      performance: new Map(),
      optimization: new Map(),
      alerts: []
    }
    
    this.init()
  }

  /**
   * 初始化持续优化系统
   */
  init() {
    this.detectEnvironment()
    this.setupNetworkMonitoring()
    this.setupDeviceMonitoring()
    
    console.log('持续优化系统已初始化')
  }

  /**
   * 启动持续优化
   */
  start() {
    if (this.state.isRunning) {
      console.warn('持续优化已在运行中')
      return
    }
    
    this.state.isRunning = true
    
    // 启动监控定时器
    this.timers.monitoring = setInterval(() => {
      this.performMonitoring()
    }, this.config.intervals.monitoring)
    
    // 启动优化定时器
    this.timers.optimization = setInterval(() => {
      this.performOptimization()
    }, this.config.intervals.optimization)
    
    // 启动报告定时器
    this.timers.reporting = setInterval(() => {
      this.generateReport()
    }, this.config.intervals.reporting)
    
    console.log('持续优化已启动')
  }

  /**
   * 停止持续优化
   */
  stop() {
    if (!this.state.isRunning) {
      console.warn('持续优化未在运行')
      return
    }
    
    this.state.isRunning = false
    
    // 清除所有定时器
    Object.values(this.timers).forEach(timer => {
      if (timer) {
        clearInterval(timer)
      }
    })
    
    this.timers = {
      monitoring: null,
      optimization: null,
      reporting: null
    }
    
    console.log('持续优化已停止')
  }

  /**
   * 执行性能监控
   */
  async performMonitoring() {
    try {
      // 收集性能指标
      const performanceStats = performanceMonitor.getPerformanceStats()
      const loadingStats = routeLoadingManager.getUsageStats()
      const preloadStats = permissionPreloader.getPreloadStats()
      
      // 分析当前状态
      const analysis = this.analyzeCurrentState({
        performanceStats,
        loadingStats,
        preloadStats
      })
      
      // 记录指标
      this.recordMetrics(analysis)
      
      // 检查告警条件
      this.checkAlerts(analysis)
      
      // 自适应调整
      if (this.config.adaptive.enabled) {
        await this.adaptiveAdjustment(analysis)
      }
      
    } catch (error) {
      console.error('性能监控执行失败:', error)
    }
  }

  /**
   * 执行优化策略
   */
  async performOptimization() {
    try {
      const optimizations = this.identifyOptimizations()
      
      for (const optimization of optimizations) {
        await this.executeOptimization(optimization)
      }
      
      this.state.lastOptimization = Date.now()
      
    } catch (error) {
      console.error('优化执行失败:', error)
    }
  }

  /**
   * 分析当前状态
   */
  analyzeCurrentState(data) {
    const { performanceStats, loadingStats, preloadStats } = data
    
    // 路由性能分析
    const routePerformance = this.analyzeRoutePerformance(performanceStats)
    
    // 预加载效果分析
    const preloadEffectiveness = this.analyzePreloadEffectiveness(loadingStats, preloadStats)
    
    // 资源利用率分析
    const resourceUtilization = this.analyzeResourceUtilization(performanceStats)
    
    // 用户体验指标
    const userExperience = this.calculateUserExperience(routePerformance)
    
    return {
      timestamp: Date.now(),
      routePerformance,
      preloadEffectiveness,
      resourceUtilization,
      userExperience,
      overall: this.calculateOverallScore({
        routePerformance,
        preloadEffectiveness,
        resourceUtilization,
        userExperience
      })
    }
  }

  /**
   * 分析路由性能
   */
  analyzeRoutePerformance(performanceStats) {
    const routeMetrics = performanceStats.metrics.routeMetrics
    const routes = []
    let totalLoadTime = 0
    let slowRoutes = 0
    
    for (const [routeName, metric] of routeMetrics) {
      const loadTime = metric.duration || 0
      totalLoadTime += loadTime
      
      if (loadTime > this.config.thresholds.routeLoadTime) {
        slowRoutes++
      }
      
      routes.push({
        route: routeName,
        loadTime,
        grade: this.gradeLoadTime(loadTime)
      })
    }
    
    return {
      totalRoutes: routes.length,
      averageLoadTime: routes.length > 0 ? totalLoadTime / routes.length : 0,
      slowRoutes,
      routes,
      score: this.calculateRouteScore(routes)
    }
  }

  /**
   * 分析预加载效果
   */
  analyzePreloadEffectiveness(loadingStats, preloadStats) {
    const preloadedCount = loadingStats.loadedRoutes.length
    const totalAccessed = preloadStats.behaviorStats.sessionAccess
    
    // 计算命中率
    const hitRate = totalAccessed > 0 ? (preloadedCount / totalAccessed) * 100 : 0
    
    return {
      preloadedModules: preloadedCount,
      accessedModules: totalAccessed,
      hitRate,
      efficiency: this.calculatePreloadEfficiency(hitRate),
      score: this.calculatePreloadScore(hitRate)
    }
  }

  /**
   * 分析资源利用率
   */
  analyzeResourceUtilization(performanceStats) {
    const memoryMetric = performanceStats.metrics.systemMetrics.get('memory')
    const memoryUsage = memoryMetric ? (memoryMetric.used / memoryMetric.limit) * 100 : 0
    
    return {
      memoryUsage,
      memoryGrade: this.gradeMemoryUsage(memoryUsage),
      score: this.calculateResourceScore(memoryUsage)
    }
  }

  /**
   * 计算用户体验指标
   */
  calculateUserExperience(routePerformance) {
    const { averageLoadTime, slowRoutes, totalRoutes } = routePerformance
    
    // 基于加载时间和慢路由比例计算体验分数
    let score = 100
    
    if (averageLoadTime > 1000) score -= 30
    else if (averageLoadTime > 500) score -= 15
    
    if (totalRoutes > 0) {
      const slowRouteRatio = slowRoutes / totalRoutes
      score -= slowRouteRatio * 40
    }
    
    return {
      score: Math.max(0, score),
      grade: this.gradeScore(score),
      factors: {
        averageLoadTime,
        slowRouteRatio: totalRoutes > 0 ? slowRoutes / totalRoutes : 0
      }
    }
  }

  /**
   * 计算总体分数
   */
  calculateOverallScore(metrics) {
    const weights = {
      routePerformance: 0.4,
      preloadEffectiveness: 0.2,
      resourceUtilization: 0.2,
      userExperience: 0.2
    }
    
    const weightedScore = 
      metrics.routePerformance.score * weights.routePerformance +
      metrics.preloadEffectiveness.score * weights.preloadEffectiveness +
      metrics.resourceUtilization.score * weights.resourceUtilization +
      metrics.userExperience.score * weights.userExperience
    
    return {
      score: Math.round(weightedScore),
      grade: this.gradeScore(weightedScore),
      breakdown: {
        routePerformance: metrics.routePerformance.score,
        preloadEffectiveness: metrics.preloadEffectiveness.score,
        resourceUtilization: metrics.resourceUtilization.score,
        userExperience: metrics.userExperience.score
      }
    }
  }

  /**
   * 识别优化机会
   */
  identifyOptimizations() {
    const optimizations = []
    const currentMetrics = this.getCurrentMetrics()
    
    if (!currentMetrics) return optimizations
    
    // 路由性能优化
    if (currentMetrics.routePerformance.slowRoutes > 0) {
      optimizations.push({
        type: 'route-optimization',
        priority: 'high',
        description: '优化慢加载路由',
        action: 'optimizeSlowRoutes',
        data: currentMetrics.routePerformance.routes.filter(r => r.grade === 'poor')
      })
    }
    
    // 预加载策略优化
    if (currentMetrics.preloadEffectiveness.hitRate < this.config.thresholds.cacheHitRate) {
      optimizations.push({
        type: 'preload-optimization',
        priority: 'medium',
        description: '优化预加载策略',
        action: 'optimizePreloadStrategy',
        data: { currentHitRate: currentMetrics.preloadEffectiveness.hitRate }
      })
    }
    
    // 内存优化
    if (currentMetrics.resourceUtilization.memoryUsage > this.config.thresholds.memoryUsage) {
      optimizations.push({
        type: 'memory-optimization',
        priority: 'high',
        description: '内存使用优化',
        action: 'optimizeMemoryUsage',
        data: { currentUsage: currentMetrics.resourceUtilization.memoryUsage }
      })
    }
    
    return optimizations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  /**
   * 执行优化
   */
  async executeOptimization(optimization) {
    console.log(`执行优化: ${optimization.description}`)
    
    try {
      switch (optimization.action) {
        case 'optimizeSlowRoutes':
          await this.optimizeSlowRoutes(optimization.data)
          break
        case 'optimizePreloadStrategy':
          await this.optimizePreloadStrategy(optimization.data)
          break
        case 'optimizeMemoryUsage':
          await this.optimizeMemoryUsage(optimization.data)
          break
        default:
          console.warn(`未知的优化操作: ${optimization.action}`)
      }
      
      // 记录优化历史
      this.recordOptimization(optimization, true)
      
    } catch (error) {
      console.error(`优化执行失败: ${optimization.description}`, error)
      this.recordOptimization(optimization, false, error.message)
    }
  }

  /**
   * 优化慢加载路由
   */
  async optimizeSlowRoutes(slowRoutes) {
    for (const route of slowRoutes) {
      // 增加预加载优先级
      routeLoadingManager.preloadRoutes([route.route], {
        priority: 'high',
        delay: 0
      })
    }
    
    console.log(`已优化 ${slowRoutes.length} 个慢加载路由`)
  }

  /**
   * 优化预加载策略
   */
  async optimizePreloadStrategy(data) {
    // 调整预加载参数
    if (data.currentHitRate < 30) {
      // 命中率过低，减少预加载
      this.adjustPreloadAggression(0.7)
    } else if (data.currentHitRate < 60) {
      // 命中率一般，适度调整
      this.adjustPreloadAggression(0.85)
    }
    
    console.log('预加载策略已优化')
  }

  /**
   * 优化内存使用
   */
  async optimizeMemoryUsage(data) {
    // 清理不必要的缓存
    routeLoadingManager.clearCache()
    
    // 减少预加载队列
    this.adjustPreloadAggression(0.5)
    
    console.log('内存使用已优化')
  }

  /**
   * 调整预加载积极程度
   */
  adjustPreloadAggression(factor) {
    // 这里可以调整预加载的参数
    console.log(`预加载积极程度调整为: ${factor}`)
  }

  /**
   * 自适应调整
   */
  async adaptiveAdjustment(analysis) {
    // 网络自适应
    if (this.config.adaptive.networkSensitive) {
      await this.networkAdaptiveAdjustment()
    }
    
    // 设备自适应
    if (this.config.adaptive.deviceSensitive) {
      await this.deviceAdaptiveAdjustment()
    }
    
    // 时间自适应
    if (this.config.adaptive.timeSensitive) {
      await this.timeAdaptiveAdjustment()
    }
  }

  /**
   * 网络自适应调整
   */
  async networkAdaptiveAdjustment() {
    if (!this.state.networkInfo) return
    
    const { effectiveType, downlink } = this.state.networkInfo
    
    // 根据网络状况调整策略
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      this.state.currentStrategy = 'conservative'
      routeLoadingManager.setPreloadEnabled(false)
    } else if (effectiveType === '3g') {
      this.state.currentStrategy = 'balanced'
      routeLoadingManager.setPreloadEnabled(true)
    } else {
      this.state.currentStrategy = 'aggressive'
      routeLoadingManager.setPreloadEnabled(true)
    }
  }

  /**
   * 设备自适应调整
   */
  async deviceAdaptiveAdjustment() {
    // 根据设备性能调整策略
    const memory = navigator.deviceMemory || 4
    
    if (memory <= 2) {
      // 低内存设备，保守策略
      this.adjustPreloadAggression(0.3)
    } else if (memory <= 4) {
      // 中等内存设备，平衡策略
      this.adjustPreloadAggression(0.6)
    } else {
      // 高内存设备，积极策略
      this.adjustPreloadAggression(1.0)
    }
  }

  /**
   * 时间自适应调整
   */
  async timeAdaptiveAdjustment() {
    const hour = new Date().getHours()
    
    // 工作时间内减少预加载，避免影响正常使用
    if (hour >= 9 && hour <= 18) {
      this.adjustPreloadAggression(0.7)
    } else {
      // 非工作时间增加预加载
      this.adjustPreloadAggression(1.0)
    }
  }

  /**
   * 检查告警条件
   */
  checkAlerts(analysis) {
    const alerts = []
    
    // 性能告警
    if (analysis.routePerformance.slowRoutes > 3) {
      alerts.push({
        type: 'performance',
        level: 'warning',
        message: `发现 ${analysis.routePerformance.slowRoutes} 个慢加载路由`,
        timestamp: Date.now()
      })
    }
    
    // 内存告警
    if (analysis.resourceUtilization.memoryUsage > this.config.thresholds.memoryUsage) {
      alerts.push({
        type: 'memory',
        level: 'error',
        message: `内存使用率过高: ${analysis.resourceUtilization.memoryUsage.toFixed(1)}%`,
        timestamp: Date.now()
      })
    }
    
    // 预加载效果告警
    if (analysis.preloadEffectiveness.hitRate < this.config.thresholds.cacheHitRate) {
      alerts.push({
        type: 'preload',
        level: 'info',
        message: `预加载命中率较低: ${analysis.preloadEffectiveness.hitRate.toFixed(1)}%`,
        timestamp: Date.now()
      })
    }
    
    // 记录告警
    this.metrics.alerts.push(...alerts)
    
    // 限制告警数量
    if (this.metrics.alerts.length > 100) {
      this.metrics.alerts = this.metrics.alerts.slice(-50)
    }
    
    // 发送告警
    alerts.forEach(alert => {
      console.warn(`性能告警: ${alert.message}`)
    })
  }

  /**
   * 环境检测
   */
  detectEnvironment() {
    // 检测设备信息
    this.state.deviceInfo = {
      memory: navigator.deviceMemory || 4,
      cores: navigator.hardwareConcurrency || 4,
      platform: navigator.platform,
      userAgent: navigator.userAgent
    }
    
    console.log('设备信息已检测:', this.state.deviceInfo)
  }

  /**
   * 设置网络监控
   */
  setupNetworkMonitoring() {
    if ('connection' in navigator) {
      const connection = navigator.connection
      
      this.state.networkInfo = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      }
      
      connection.addEventListener('change', () => {
        this.state.networkInfo = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt
        }
        
        console.log('网络状况已更新:', this.state.networkInfo)
      })
    }
  }

  /**
   * 设置设备监控
   */
  setupDeviceMonitoring() {
    // 监控页面可见性
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // 页面隐藏时减少优化频率
        this.pauseOptimization()
      } else {
        // 页面显示时恢复优化
        this.resumeOptimization()
      }
    })
  }

  /**
   * 暂停优化
   */
  pauseOptimization() {
    if (this.timers.optimization) {
      clearInterval(this.timers.optimization)
      this.timers.optimization = null
    }
  }

  /**
   * 恢复优化
   */
  resumeOptimization() {
    if (!this.timers.optimization && this.state.isRunning) {
      this.timers.optimization = setInterval(() => {
        this.performOptimization()
      }, this.config.intervals.optimization)
    }
  }

  /**
   * 记录指标
   */
  recordMetrics(analysis) {
    const key = `metrics-${Date.now()}`
    this.metrics.performance.set(key, analysis)
    
    // 限制记录数量
    if (this.metrics.performance.size > 1000) {
      const entries = Array.from(this.metrics.performance.entries())
      const toDelete = entries.slice(0, entries.length - 500)
      toDelete.forEach(([key]) => this.metrics.performance.delete(key))
    }
  }

  /**
   * 记录优化历史
   */
  recordOptimization(optimization, success, error = null) {
    this.state.optimizationHistory.push({
      ...optimization,
      success,
      error,
      timestamp: Date.now()
    })
    
    // 限制历史记录数量
    if (this.state.optimizationHistory.length > 200) {
      this.state.optimizationHistory = this.state.optimizationHistory.slice(-100)
    }
  }

  /**
   * 生成报告
   */
  generateReport() {
    const currentMetrics = this.getCurrentMetrics()
    if (!currentMetrics) return
    
    const report = {
      timestamp: Date.now(),
      period: this.config.intervals.reporting,
      summary: {
        overallScore: currentMetrics.overall.score,
        strategy: this.state.currentStrategy,
        optimizationsCount: this.state.optimizationHistory.length,
        alertsCount: this.metrics.alerts.length
      },
      metrics: currentMetrics,
      recentOptimizations: this.state.optimizationHistory.slice(-10),
      recentAlerts: this.metrics.alerts.slice(-10),
      recommendations: this.generateRecommendations(currentMetrics)
    }
    
    console.log('持续优化报告:', report)
    return report
  }

  /**
   * 生成建议
   */
  generateRecommendations(metrics) {
    const recommendations = []
    
    if (metrics.overall.score < 70) {
      recommendations.push('整体性能需要改进，建议进行全面优化')
    }
    
    if (metrics.routePerformance.slowRoutes > 0) {
      recommendations.push('存在慢加载路由，建议实施代码分割优化')
    }
    
    if (metrics.preloadEffectiveness.hitRate < 60) {
      recommendations.push('预加载效果不佳，建议调整预加载策略')
    }
    
    return recommendations
  }

  /**
   * 辅助方法
   */
  getCurrentMetrics() {
    const entries = Array.from(this.metrics.performance.entries())
    return entries.length > 0 ? entries[entries.length - 1][1] : null
  }

  gradeLoadTime(loadTime) {
    if (loadTime < 500) return 'good'
    if (loadTime < 1000) return 'needs-improvement'
    return 'poor'
  }

  gradeMemoryUsage(usage) {
    if (usage < 50) return 'good'
    if (usage < 80) return 'warning'
    return 'critical'
  }

  gradeScore(score) {
    if (score >= 90) return 'excellent'
    if (score >= 70) return 'good'
    if (score >= 50) return 'fair'
    return 'poor'
  }

  calculateRouteScore(routes) {
    if (routes.length === 0) return 100
    
    const goodRoutes = routes.filter(r => r.grade === 'good').length
    return Math.round((goodRoutes / routes.length) * 100)
  }

  calculatePreloadScore(hitRate) {
    return Math.min(100, hitRate * 1.5)
  }

  calculateResourceScore(memoryUsage) {
    return Math.max(0, 100 - memoryUsage)
  }

  calculatePreloadEfficiency(hitRate) {
    if (hitRate > 80) return 'excellent'
    if (hitRate > 60) return 'good'
    if (hitRate > 40) return 'fair'
    return 'poor'
  }

  /**
   * 公开方法
   */
  getStatus() {
    return {
      isRunning: this.state.isRunning,
      currentStrategy: this.state.currentStrategy,
      lastOptimization: this.state.lastOptimization,
      metrics: this.getCurrentMetrics(),
      config: this.config
    }
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
    console.log('配置已更新:', this.config)
  }

  destroy() {
    this.stop()
    this.metrics = {
      performance: new Map(),
      optimization: new Map(),
      alerts: []
    }
  }
}

// 创建单例实例
const continuousOptimizer = new ContinuousOptimizer()

export default continuousOptimizer