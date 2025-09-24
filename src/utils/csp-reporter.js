/**
 * CSP违规报告收集和处理模块
 * 提供客户端CSP违规报告的收集、分析和响应功能
 */

/**
 * CSP违规报告处理器
 */
class CSPReportHandler {
  constructor(options = {}) {
    this.options = {
      // 是否启用详细日志
      verbose: options.verbose || false,
      
      // 报告存储配置
      storage: options.storage || {
        type: 'console', // 'console', 'file', 'api'
        endpoint: '/api/csp-violations',
        filename: 'csp-violations.log'
      },
      
      // 报告过滤配置
      filter: options.filter || {
        // 忽略的URI模式
        ignoreUris: [
          /chrome-extension:/,
          /moz-extension:/,
          /safari-extension:/,
          /^data:/,
          /^blob:/
        ],
        
        // 忽略的违规类型
        ignoreDirectives: [],
        
        // 最大报告数量（防止垃圾邮件）
        maxReports: 100
      },
      
      // 报告分析配置
      analysis: options.analysis || {
        enabled: true,
        aggregateWindow: 60000, // 1分钟聚合窗口
        alertThreshold: 10 // 超过10个相同违规触发告警
      }
    }
    
    this.reports = []
    this.reportCounts = new Map()
    this.lastCleanup = Date.now()
  }

  /**
   * 处理CSP违规报告
   * @param {Object} report CSP违规报告对象
   */
  handleReport(report) {
    try {
      // 验证报告格式
      if (!this.validateReport(report)) {
        if (this.options.verbose) {
          console.warn('[CSP Reporter] Invalid report format:', report)
        }
        return
      }

      // 过滤报告
      if (this.shouldIgnoreReport(report)) {
        if (this.options.verbose) {
          console.log('[CSP Reporter] Report filtered:', report['blocked-uri'])
        }
        return
      }

      // 处理报告
      this.processReport(report)
      
      // 存储报告
      this.storeReport(report)
      
      // 分析报告
      if (this.options.analysis.enabled) {
        this.analyzeReport(report)
      }
      
      // 清理旧报告
      this.cleanupOldReports()
      
    } catch (error) {
      console.error('[CSP Reporter] Error handling report:', error)
    }
  }

  /**
   * 验证CSP报告格式
   * @param {Object} report CSP报告
   * @returns {boolean} 是否有效
   */
  validateReport(report) {
    const requiredFields = ['document-uri', 'violated-directive']
    return requiredFields.every(field => report.hasOwnProperty(field))
  }

  /**
   * 判断是否应该忽略该报告
   * @param {Object} report CSP报告
   * @returns {boolean} 是否忽略
   */
  shouldIgnoreReport(report) {
    const blockedUri = report['blocked-uri'] || ''
    const violatedDirective = report['violated-directive'] || ''
    
    // 检查URI过滤器
    if (this.options.filter.ignoreUris.some(pattern => pattern.test(blockedUri))) {
      return true
    }
    
    // 检查指令过滤器
    if (this.options.filter.ignoreDirectives.includes(violatedDirective)) {
      return true
    }
    
    // 检查报告数量限制
    if (this.reports.length >= this.options.filter.maxReports) {
      return true
    }
    
    return false
  }

  /**
   * 处理CSP报告
   * @param {Object} report CSP报告
   */
  processReport(report) {
    // 添加时间戳
    report.timestamp = new Date().toISOString()
    
    // 添加用户代理信息（如果可用）
    if (typeof navigator !== 'undefined') {
      report.userAgent = navigator.userAgent
    }
    
    // 生成报告ID
    report.id = this.generateReportId(report)
    
    // 添加到报告列表
    this.reports.push(report)
    
    if (this.options.verbose) {
      console.log('[CSP Reporter] Processed report:', report.id)
    }
  }

  /**
   * 存储CSP报告
   * @param {Object} report CSP报告
   */
  storeReport(report) {
    switch (this.options.storage.type) {
      case 'console':
        this.storeToConsole(report)
        break
      case 'file':
        this.storeToFile(report)
        break
      case 'api':
        this.storeToApi(report)
        break
      default:
        console.warn('[CSP Reporter] Unknown storage type:', this.options.storage.type)
    }
  }

  /**
   * 控制台存储
   * @param {Object} report CSP报告
   */
  storeToConsole(report) {
    console.group('[CSP Violation Report]')
    console.log('Document URI:', report['document-uri'])
    console.log('Violated Directive:', report['violated-directive'])
    console.log('Blocked URI:', report['blocked-uri'])
    console.log('Source File:', report['source-file'])
    console.log('Line Number:', report['line-number'])
    console.log('Column Number:', report['column-number'])
    console.log('Timestamp:', report.timestamp)
    console.groupEnd()
  }

  /**
   * 文件存储（Node.js环境）
   * @param {Object} report CSP报告
   */
  storeToFile(report) {
    // 这个功能需要在Node.js环境中实现
    if (typeof require !== 'undefined') {
      try {
        const fs = require('fs')
        const logEntry = JSON.stringify(report) + '\n'
        fs.appendFileSync(this.options.storage.filename, logEntry)
      } catch (error) {
        console.error('[CSP Reporter] File storage error:', error)
      }
    } else {
      console.warn('[CSP Reporter] File storage not available in browser environment')
    }
  }

  /**
   * API存储
   * @param {Object} report CSP报告
   */
  storeToApi(report) {
    // 发送到服务器端点
    if (typeof fetch !== 'undefined') {
      fetch(this.options.storage.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      }).catch(error => {
        console.error('[CSP Reporter] API storage error:', error)
      })
    } else if (typeof XMLHttpRequest !== 'undefined') {
      // 降级到XMLHttpRequest
      const xhr = new XMLHttpRequest()
      xhr.open('POST', this.options.storage.endpoint, true)
      xhr.setRequestHeader('Content-Type', 'application/json')
      xhr.send(JSON.stringify(report))
    }
  }

  /**
   * 分析CSP报告
   * @param {Object} report CSP报告
   */
  analyzeReport(report) {
    const key = `${report['violated-directive']}:${report['blocked-uri']}`
    const count = this.reportCounts.get(key) || 0
    const newCount = count + 1
    
    this.reportCounts.set(key, newCount)
    
    // 检查是否触发告警阈值
    if (newCount >= this.options.analysis.alertThreshold) {
      this.triggerAlert(report, newCount)
    }
  }

  /**
   * 触发告警
   * @param {Object} report CSP报告
   * @param {number} count 违规次数
   */
  triggerAlert(report, count) {
    console.warn(`[CSP Alert] High frequency violation detected:`)
    console.warn(`  Directive: ${report['violated-directive']}`)
    console.warn(`  Blocked URI: ${report['blocked-uri']}`)
    console.warn(`  Count: ${count}`)
    
    // 可以在这里添加更多告警逻辑，如发送邮件、推送通知等
  }

  /**
   * 生成报告ID
   * @param {Object} report CSP报告
   * @returns {string} 报告ID
   */
  generateReportId(report) {
    const content = `${report['document-uri']}:${report['violated-directive']}:${report['blocked-uri']}:${report.timestamp}`
    return this.simpleHash(content)
  }

  /**
   * 简单哈希函数
   * @param {string} str 输入字符串
   * @returns {string} 哈希值
   */
  simpleHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * 清理旧报告
   */
  cleanupOldReports() {
    const now = Date.now()
    
    // 每分钟清理一次
    if (now - this.lastCleanup < 60000) {
      return
    }
    
    const cutoff = now - this.options.analysis.aggregateWindow
    
    // 移除超过聚合窗口的报告
    this.reports = this.reports.filter(report => {
      const reportTime = new Date(report.timestamp).getTime()
      return reportTime > cutoff
    })
    
    // 重置计数器
    this.reportCounts.clear()
    
    this.lastCleanup = now
  }

  /**
   * 获取报告统计信息
   * @returns {Object} 统计信息
   */
  getStatistics() {
    const stats = {
      totalReports: this.reports.length,
      uniqueViolations: this.reportCounts.size,
      topViolations: [],
      lastReport: this.reports.length > 0 ? this.reports[this.reports.length - 1].timestamp : null
    }
    
    // 获取最频繁的违规
    const sorted = Array.from(this.reportCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      
    stats.topViolations = sorted.map(([key, count]) => {
      const [directive, uri] = key.split(':')
      return { directive, uri, count }
    })
    
    return stats
  }
}

/**
 * 全局CSP报告处理器实例
 */
let globalReportHandler = null

/**
 * 初始化CSP报告处理器
 * @param {Object} options 配置选项
 * @returns {CSPReportHandler} 报告处理器实例
 */
function initCSPReporter(options = {}) {
  globalReportHandler = new CSPReportHandler(options)
  
  // 在浏览器环境中设置全局报告处理函数
  if (typeof window !== 'undefined') {
    window.cspReportHandler = globalReportHandler
    
    // 监听CSP违规事件
    document.addEventListener('securitypolicyviolation', (event) => {
      const report = {
        'document-uri': event.documentURI,
        'violated-directive': event.violatedDirective,
        'blocked-uri': event.blockedURI,
        'source-file': event.sourceFile,
        'line-number': event.lineNumber,
        'column-number': event.columnNumber,
        'status-code': event.statusCode
      }
      
      globalReportHandler.handleReport(report)
    })
  }
  
  return globalReportHandler
}

/**
 * 手动报告CSP违规
 * @param {Object} report 报告对象
 */
function reportCSPViolation(report) {
  if (globalReportHandler) {
    globalReportHandler.handleReport(report)
  } else {
    console.warn('[CSP Reporter] Reporter not initialized. Call initCSPReporter() first.')
  }
}

// 如果在浏览器环境中，自动初始化
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // 延迟初始化，确保DOM已加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initCSPReporter()
    })
  } else {
    initCSPReporter()
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CSPReportHandler,
    initCSPReporter,
    reportCSPViolation
  }
}

// 如果在浏览器环境中，添加到全局对象
if (typeof window !== 'undefined') {
  window.CSPReporter = {
    CSPReportHandler,
    initCSPReporter,
    reportCSPViolation
  }
}"