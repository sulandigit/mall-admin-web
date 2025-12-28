/**
 * 安全监控模块
 * 提供访问日志、安全事件监控和审计功能
 */

export default class SecurityMonitor {
  constructor(options = {}) {
    this.maxLogEntries = options.maxLogEntries || 1000
    this.maxEventEntries = options.maxEventEntries || 500
    this.logRetentionPeriod = options.logRetentionPeriod || 7 * 24 * 60 * 60 * 1000 // 7天
    this.enableConsoleLog = options.enableConsoleLog !== false
    this.alertThresholds = options.alertThresholds || {
      failedAccessAttempts: 10,
      securityEventsPerMinute: 5,
      encryptionFailuresPerHour: 3
    }
    
    // 存储日志和事件
    this.accessLogs = []
    this.securityEvents = []
    this.performanceMetrics = new Map()
    
    // 统计计数器
    this.counters = {
      totalAccess: 0,
      successfulAccess: 0,
      failedAccess: 0,
      encryptionOperations: 0,
      decryptionOperations: 0,
      securityEvents: 0
    }
    
    // 启动清理定时器
    this.startCleanupTimer()
    
    // 性能监控
    this.performanceObserver = this.initPerformanceObserver()
  }

  /**
   * 记录访问日志
   * @param {string} operation - 操作类型 (store/retrieve/delete/clear)
   * @param {string} key - 数据键名
   * @param {string} classification - 数据分类
   * @param {string} result - 操作结果 (success/failed/expired/not_found)
   * @param {Object} metadata - 附加元数据
   */
  logAccess(operation, key, classification = null, result = 'success', metadata = {}) {
    try {
      const logEntry = {
        id: this.generateLogId(),
        timestamp: Date.now(),
        operation: operation,
        key: key,
        classification: classification,
        result: result,
        sessionId: this.getSessionId(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        metadata: metadata
      }
      
      this.accessLogs.push(logEntry)
      this.updateCounters(operation, result)
      
      // 如果日志条目过多，删除最旧的
      if (this.accessLogs.length > this.maxLogEntries) {
        this.accessLogs.shift()
      }
      
      // 检查是否需要触发安全告警
      this.checkSecurityAlerts(logEntry)
      
      // 控制台日志
      if (this.enableConsoleLog) {
        this.logToConsole('ACCESS', logEntry)
      }
      
    } catch (error) {
      console.error('Access logging error:', error)
    }
  }

  /**
   * 记录安全事件
   * @param {string} eventType - 事件类型
   * @param {Object} details - 事件详情
   * @param {string} severity - 严重程度 (low/medium/high/critical)
   */
  logSecurityEvent(eventType, details = {}, severity = 'medium') {
    try {
      const eventEntry = {
        id: this.generateEventId(),
        timestamp: Date.now(),
        eventType: eventType,
        severity: severity,
        details: details,
        sessionId: this.getSessionId(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        stackTrace: this.captureStackTrace()
      }
      
      this.securityEvents.push(eventEntry)
      this.counters.securityEvents++
      
      // 如果事件条目过多，删除最旧的
      if (this.securityEvents.length > this.maxEventEntries) {
        this.securityEvents.shift()
      }
      
      // 高严重程度事件立即告警
      if (severity === 'high' || severity === 'critical') {
        this.triggerSecurityAlert(eventEntry)
      }
      
      // 控制台日志
      if (this.enableConsoleLog) {
        this.logToConsole('SECURITY', eventEntry)
      }
      
    } catch (error) {
      console.error('Security event logging error:', error)
    }
  }

  /**
   * 记录性能指标
   * @param {string} operation - 操作类型
   * @param {number} duration - 耗时（毫秒）
   * @param {string} status - 状态 (success/failed)
   */
  logPerformance(operation, duration, status = 'success') {
    try {
      const key = `${operation}_${status}`
      
      if (!this.performanceMetrics.has(key)) {
        this.performanceMetrics.set(key, {
          count: 0,
          totalDuration: 0,
          minDuration: Infinity,
          maxDuration: 0,
          avgDuration: 0
        })
      }
      
      const metric = this.performanceMetrics.get(key)
      metric.count++
      metric.totalDuration += duration
      metric.minDuration = Math.min(metric.minDuration, duration)
      metric.maxDuration = Math.max(metric.maxDuration, duration)
      metric.avgDuration = metric.totalDuration / metric.count
      
    } catch (error) {
      console.error('Performance logging error:', error)
    }
  }

  /**
   * 更新计数器
   * @param {string} operation - 操作类型
   * @param {string} result - 操作结果
   */
  updateCounters(operation, result) {
    this.counters.totalAccess++
    
    if (result === 'success') {
      this.counters.successfulAccess++
    } else {
      this.counters.failedAccess++
    }
    
    // 更新操作特定计数器
    switch (operation) {
      case 'encrypt':
        this.counters.encryptionOperations++
        break
      case 'decrypt':
        this.counters.decryptionOperations++
        break
    }
  }

  /**
   * 检查安全告警条件
   * @param {Object} logEntry - 日志条目
   */
  checkSecurityAlerts(logEntry) {
    try {
      const now = Date.now()
      const oneMinuteAgo = now - 60000
      const oneHourAgo = now - 3600000
      
      // 检查失败访问尝试
      const recentFailures = this.accessLogs.filter(log => 
        log.timestamp > oneMinuteAgo && 
        log.result === 'failed'
      ).length
      
      if (recentFailures >= this.alertThresholds.failedAccessAttempts) {
        this.logSecurityEvent('excessive_failed_access', {
          failureCount: recentFailures,
          timeWindow: '1 minute'
        }, 'high')
      }
      
      // 检查安全事件频率
      const recentSecurityEvents = this.securityEvents.filter(event => 
        event.timestamp > oneMinuteAgo
      ).length
      
      if (recentSecurityEvents >= this.alertThresholds.securityEventsPerMinute) {
        this.logSecurityEvent('high_security_event_frequency', {
          eventCount: recentSecurityEvents,
          timeWindow: '1 minute'
        }, 'high')
      }
      
      // 检查加密失败频率
      const recentEncryptionFailures = this.accessLogs.filter(log => 
        log.timestamp > oneHourAgo && 
        log.operation === 'encrypt' && 
        log.result === 'failed'
      ).length
      
      if (recentEncryptionFailures >= this.alertThresholds.encryptionFailuresPerHour) {
        this.logSecurityEvent('excessive_encryption_failures', {
          failureCount: recentEncryptionFailures,
          timeWindow: '1 hour'
        }, 'critical')
      }
      
    } catch (error) {
      console.error('Security alert check error:', error)
    }
  }

  /**
   * 触发安全告警
   * @param {Object} eventEntry - 安全事件条目
   */
  triggerSecurityAlert(eventEntry) {
    try {
      // 发送自定义事件
      const alertEvent = new CustomEvent('secureStorageAlert', {
        detail: eventEntry
      })
      window.dispatchEvent(alertEvent)
      
      // 控制台告警
      console.warn('🚨 SECURITY ALERT:', eventEntry)
      
      // 可以在这里添加更多告警机制，如发送到监控服务
      
    } catch (error) {
      console.error('Security alert trigger error:', error)
    }
  }

  /**
   * 获取会话ID
   * @returns {string} 会话ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('_security_session_id')
    
    if (!sessionId) {
      sessionId = 'sec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15)
      sessionStorage.setItem('_security_session_id', sessionId)
    }
    
    return sessionId
  }

  /**
   * 生成日志ID
   * @returns {string} 日志ID
   */
  generateLogId() {
    return 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10)
  }

  /**
   * 生成事件ID
   * @returns {string} 事件ID
   */
  generateEventId() {
    return 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10)
  }

  /**
   * 捕获堆栈跟踪
   * @returns {string} 堆栈跟踪信息
   */
  captureStackTrace() {
    try {
      throw new Error()
    } catch (error) {
      return error.stack || 'Stack trace not available'
    }
  }

  /**
   * 控制台日志输出
   * @param {string} type - 日志类型
   * @param {Object} entry - 日志条目
   */
  logToConsole(type, entry) {
    const prefix = type === 'SECURITY' ? '🔒' : '📝'
    const style = type === 'SECURITY' ? 'color: red; font-weight: bold;' : 'color: blue;'
    
    console.log(
      `%c${prefix} SecureStorage ${type}:`,
      style,
      `${entry.operation || entry.eventType} - ${entry.result || entry.severity}`,
      entry
    )
  }

  /**
   * 启动清理定时器
   */
  startCleanupTimer() {
    // 清除现有定时器
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    
    // 设置新的定时器，每小时清理一次
    this.cleanupTimer = setInterval(() => {
      this.cleanupOldLogs()
    }, 60 * 60 * 1000) // 1小时
  }

  /**
   * 清理过期日志
   */
  cleanupOldLogs() {
    try {
      const cutoffTime = Date.now() - this.logRetentionPeriod
      
      // 清理访问日志
      this.accessLogs = this.accessLogs.filter(log => log.timestamp > cutoffTime)
      
      // 清理安全事件
      this.securityEvents = this.securityEvents.filter(event => event.timestamp > cutoffTime)
      
      // 清理性能指标（保留最近的数据）
      // 这里可以添加更复杂的清理逻辑
      
    } catch (error) {
      console.error('Log cleanup error:', error)
    }
  }

  /**
   * 初始化性能观察器
   */
  initPerformanceObserver() {
    try {
      if (typeof PerformanceObserver !== 'undefined') {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          for (const entry of entries) {
            if (entry.name.includes('secure-storage')) {
              this.logPerformance(entry.name, entry.duration)
            }
          }
        })
        
        observer.observe({ entryTypes: ['measure'] })
        return observer
      }
    } catch (error) {
      console.warn('Performance observer not available:', error)
    }
    
    return null
  }

  /**
   * 获取访问日志
   * @param {Object} filters - 过滤条件
   * @returns {Array} 过滤后的访问日志
   */
  getAccessLogs(filters = {}) {
    try {
      let logs = [...this.accessLogs]
      
      // 应用过滤条件
      if (filters.operation) {
        logs = logs.filter(log => log.operation === filters.operation)
      }
      
      if (filters.classification) {
        logs = logs.filter(log => log.classification === filters.classification)
      }
      
      if (filters.result) {
        logs = logs.filter(log => log.result === filters.result)
      }
      
      if (filters.startTime) {
        logs = logs.filter(log => log.timestamp >= filters.startTime)
      }
      
      if (filters.endTime) {
        logs = logs.filter(log => log.timestamp <= filters.endTime)
      }
      
      // 按时间戳倒序排列
      logs.sort((a, b) => b.timestamp - a.timestamp)
      
      return logs
      
    } catch (error) {
      console.error('Get access logs error:', error)
      return []
    }
  }

  /**
   * 获取安全事件
   * @param {Object} filters - 过滤条件
   * @returns {Array} 过滤后的安全事件
   */
  getSecurityEvents(filters = {}) {
    try {
      let events = [...this.securityEvents]
      
      // 应用过滤条件
      if (filters.eventType) {
        events = events.filter(event => event.eventType === filters.eventType)
      }
      
      if (filters.severity) {
        events = events.filter(event => event.severity === filters.severity)
      }
      
      if (filters.startTime) {
        events = events.filter(event => event.timestamp >= filters.startTime)
      }
      
      if (filters.endTime) {
        events = events.filter(event => event.timestamp <= filters.endTime)
      }
      
      // 按时间戳倒序排列
      events.sort((a, b) => b.timestamp - a.timestamp)
      
      return events
      
    } catch (error) {
      console.error('Get security events error:', error)
      return []
    }
  }

  /**
   * 获取性能指标
   * @returns {Object} 性能指标对象
   */
  getPerformanceMetrics() {
    try {
      const metrics = {}
      
      for (const [key, value] of this.performanceMetrics.entries()) {
        metrics[key] = { ...value }
      }
      
      return metrics
      
    } catch (error) {
      console.error('Get performance metrics error:', error)
      return {}
    }
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  async getStats() {
    try {
      const now = Date.now()
      const oneHourAgo = now - 3600000
      const oneDayAgo = now - 86400000
      
      // 近期活动统计
      const recentAccessLogs = this.accessLogs.filter(log => log.timestamp > oneHourAgo)
      const recentSecurityEvents = this.securityEvents.filter(event => event.timestamp > oneHourAgo)
      
      // 今日统计
      const todayAccessLogs = this.accessLogs.filter(log => log.timestamp > oneDayAgo)
      const todaySecurityEvents = this.securityEvents.filter(event => event.timestamp > oneDayAgo)
      
      return {
        counters: { ...this.counters },
        recent: {
          accessLogs: recentAccessLogs.length,
          securityEvents: recentSecurityEvents.length,
          successRate: recentAccessLogs.length > 0 ? 
            Math.round((recentAccessLogs.filter(log => log.result === 'success').length / recentAccessLogs.length) * 100) : 0
        },
        today: {
          accessLogs: todayAccessLogs.length,
          securityEvents: todaySecurityEvents.length,
          successRate: todayAccessLogs.length > 0 ? 
            Math.round((todayAccessLogs.filter(log => log.result === 'success').length / todayAccessLogs.length) * 100) : 0
        },
        storage: {
          accessLogsCount: this.accessLogs.length,
          securityEventsCount: this.securityEvents.length,
          performanceMetricsCount: this.performanceMetrics.size,
          retentionPeriod: this.logRetentionPeriod
        },
        session: {
          sessionId: this.getSessionId(),
          sessionStartTime: this.getSessionStartTime()
        }
      }
      
    } catch (error) {
      console.error('Get stats error:', error)
      return {
        counters: this.counters,
        recent: { accessLogs: 0, securityEvents: 0, successRate: 0 },
        today: { accessLogs: 0, securityEvents: 0, successRate: 0 },
        storage: { accessLogsCount: 0, securityEventsCount: 0, performanceMetricsCount: 0, retentionPeriod: this.logRetentionPeriod },
        session: { sessionId: null, sessionStartTime: null }
      }
    }
  }

  /**
   * 获取会话开始时间
   * @returns {number|null} 会话开始时间戳
   */
  getSessionStartTime() {
    try {
      const startTime = sessionStorage.getItem('_security_session_start_time')
      if (!startTime) {
        const now = Date.now()
        sessionStorage.setItem('_security_session_start_time', now.toString())
        return now
      }
      return parseInt(startTime, 10)
    } catch (error) {
      return null
    }
  }

  /**
   * 导出日志数据
   * @param {Object} options - 导出选项
   * @returns {Object} 导出的数据
   */
  exportLogs(options = {}) {
    try {
      const exportData = {
        timestamp: Date.now(),
        sessionId: this.getSessionId(),
        counters: { ...this.counters },
        accessLogs: options.includeAccessLogs !== false ? [...this.accessLogs] : [],
        securityEvents: options.includeSecurityEvents !== false ? [...this.securityEvents] : [],
        performanceMetrics: options.includePerformanceMetrics !== false ? this.getPerformanceMetrics() : {}
      }
      
      // 应用时间过滤
      if (options.startTime) {
        exportData.accessLogs = exportData.accessLogs.filter(log => log.timestamp >= options.startTime)
        exportData.securityEvents = exportData.securityEvents.filter(event => event.timestamp >= options.startTime)
      }
      
      if (options.endTime) {
        exportData.accessLogs = exportData.accessLogs.filter(log => log.timestamp <= options.endTime)
        exportData.securityEvents = exportData.securityEvents.filter(event => event.timestamp <= options.endTime)
      }
      
      return exportData
      
    } catch (error) {
      console.error('Export logs error:', error)
      return null
    }
  }

  /**
   * 清除所有日志和事件
   */
  clearAllLogs() {
    try {
      this.accessLogs = []
      this.securityEvents = []
      this.performanceMetrics.clear()
      
      // 重置计数器
      Object.keys(this.counters).forEach(key => {
        this.counters[key] = 0
      })
      
    } catch (error) {
      console.error('Clear logs error:', error)
    }
  }

  /**
   * 销毁监控器
   */
  destroy() {
    try {
      // 清除定时器
      if (this.cleanupTimer) {
        clearInterval(this.cleanupTimer)
        this.cleanupTimer = null
      }
      
      // 断开性能观察器
      if (this.performanceObserver) {
        this.performanceObserver.disconnect()
        this.performanceObserver = null
      }
      
      // 清除数据
      this.clearAllLogs()
      
    } catch (error) {
      console.error('Security monitor destroy error:', error)
    }
  }
}