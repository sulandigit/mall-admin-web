/**
 * 错误日志记录模块
 * 提供本地存储、远程上报等功能
 */

const LOG_STORAGE_KEY = 'mall_admin_error_logs'
const MAX_LOCAL_LOGS = 100 // 本地最大存储日志数量
const LOG_LEVELS = {
  INFO: 'info',
  WARN: 'warn', 
  ERROR: 'error',
  CRITICAL: 'critical'
}

/**
 * 错误日志记录器类
 */
class ErrorLogger {
  constructor() {
    this.isEnabled = true
    this.logQueue = []
    this.maxRetries = 3
    this.retryDelay = 5000
    this.reportEndpoint = '/api/error-logs' // 错误上报接口
    
    // 初始化时加载本地日志
    this.loadLocalLogs()
    
    // 定期清理过期日志
    this.startLogCleanup()
  }

  /**
   * 记录错误日志
   */
  log(error, level = LOG_LEVELS.ERROR) {
    if (!this.isEnabled) {
      return
    }

    try {
      const logEntry = this.createLogEntry(error, level)
      
      // 添加到队列
      this.logQueue.push(logEntry)
      
      // 保存到本地存储
      this.saveToLocal(logEntry)
      
      // 尝试上报到服务器
      this.reportToServer(logEntry)
      
      // 控制台输出（开发环境）
      if (process.env.NODE_ENV === 'development') {
        this.logToConsole(logEntry)
      }
      
    } catch (logError) {
      console.error('错误日志记录失败:', logError)
    }
  }

  /**
   * 创建日志条目
   */
  createLogEntry(error, level) {
    const now = new Date()
    
    return {
      id: this.generateLogId(),
      timestamp: now.toISOString(),
      level,
      type: error.type,
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      extra: {
        ...error.extra,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        screen: {
          width: screen.width,
          height: screen.height
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language
      },
      retryCount: 0,
      reported: false
    }
  }

  /**
   * 生成日志ID
   */
  generateLogId() {
    return 'LOG_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  /**
   * 获取当前用户ID
   */
  getCurrentUserId() {
    try {
      // 从store或cookie中获取用户信息
      const token = localStorage.getItem('token')
      if (token) {
        // 解析token获取用户信息（这里简化处理）
        return 'user_' + Date.now() // 实际项目中应该从token或store中获取
      }
      return 'anonymous'
    } catch {
      return 'anonymous'
    }
  }

  /**
   * 获取会话ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId')
    if (!sessionId) {
      sessionId = 'SESSION_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      sessionStorage.setItem('sessionId', sessionId)
    }
    return sessionId
  }

  /**
   * 保存到本地存储
   */
  saveToLocal(logEntry) {
    try {
      let logs = this.getLocalLogs()
      
      // 添加新日志
      logs.unshift(logEntry)
      
      // 限制数量
      if (logs.length > MAX_LOCAL_LOGS) {
        logs = logs.slice(0, MAX_LOCAL_LOGS)
      }
      
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs))
    } catch (error) {
      console.error('保存日志到本地失败:', error)
    }
  }

  /**
   * 从本地存储获取日志
   */
  getLocalLogs() {
    try {
      const logsStr = localStorage.getItem(LOG_STORAGE_KEY)
      return logsStr ? JSON.parse(logsStr) : []
    } catch {
      return []
    }
  }

  /**
   * 加载本地日志到内存
   */
  loadLocalLogs() {
    const localLogs = this.getLocalLogs()
    this.logQueue = localLogs.filter(log => !log.reported)
  }

  /**
   * 上报到服务器
   */
  async reportToServer(logEntry) {
    if (!this.reportEndpoint) {
      return
    }

    try {
      const response = await fetch(this.reportEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') || ''
        },
        body: JSON.stringify({
          logs: [logEntry]
        })
      })

      if (response.ok) {
        // 标记为已上报
        logEntry.reported = true
        this.updateLocalLog(logEntry)
        
        if (process.env.NODE_ENV === 'development') {
          console.log('错误日志上报成功:', logEntry.id)
        }
      } else {
        throw new Error(`上报失败: ${response.status}`)
      }
      
    } catch (error) {
      console.warn('错误日志上报失败:', error.message)
      
      // 重试机制
      if (logEntry.retryCount < this.maxRetries) {
        logEntry.retryCount++
        setTimeout(() => {
          this.reportToServer(logEntry)
        }, this.retryDelay * logEntry.retryCount)
      }
    }
  }

  /**
   * 更新本地日志状态
   */
  updateLocalLog(updatedLog) {
    try {
      const logs = this.getLocalLogs()
      const index = logs.findIndex(log => log.id === updatedLog.id)
      
      if (index !== -1) {
        logs[index] = updatedLog
        localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs))
      }
    } catch (error) {
      console.error('更新本地日志失败:', error)
    }
  }

  /**
   * 控制台输出日志
   */
  logToConsole(logEntry) {
    const { level, message, type, timestamp } = logEntry
    
    const style = this.getConsoleStyle(level)
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${type}]`
    
    switch (level) {
      case LOG_LEVELS.INFO:
        console.log(`%c${prefix}`, style, message)
        break
      case LOG_LEVELS.WARN:
        console.warn(`%c${prefix}`, style, message)
        break
      case LOG_LEVELS.ERROR:
      case LOG_LEVELS.CRITICAL:
        console.error(`%c${prefix}`, style, message)
        if (logEntry.stack) {
          console.error('Stack trace:', logEntry.stack)
        }
        break
    }
  }

  /**
   * 获取控制台样式
   */
  getConsoleStyle(level) {
    const styles = {
      [LOG_LEVELS.INFO]: 'color: #2196F3; font-weight: bold;',
      [LOG_LEVELS.WARN]: 'color: #FF9800; font-weight: bold;',
      [LOG_LEVELS.ERROR]: 'color: #F44336; font-weight: bold;',
      [LOG_LEVELS.CRITICAL]: 'color: #FFFFFF; background-color: #F44336; font-weight: bold; padding: 2px 4px;'
    }
    
    return styles[level] || styles[LOG_LEVELS.ERROR]
  }

  /**
   * 批量上报未上报的日志
   */
  async batchReport() {
    const unReportedLogs = this.logQueue.filter(log => !log.reported && log.retryCount < this.maxRetries)
    
    if (unReportedLogs.length === 0) {
      return
    }

    try {
      const response = await fetch(this.reportEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') || ''
        },
        body: JSON.stringify({
          logs: unReportedLogs
        })
      })

      if (response.ok) {
        // 标记所有日志为已上报
        unReportedLogs.forEach(log => {
          log.reported = true
          this.updateLocalLog(log)
        })
        
        console.log(`批量上报 ${unReportedLogs.length} 条错误日志成功`)
      }
      
    } catch (error) {
      console.warn('批量上报错误日志失败:', error.message)
    }
  }

  /**
   * 定期清理过期日志
   */
  startLogCleanup() {
    setInterval(() => {
      this.cleanupExpiredLogs()
    }, 60000) // 每分钟清理一次
  }

  /**
   * 清理过期日志
   */
  cleanupExpiredLogs() {
    try {
      const logs = this.getLocalLogs()
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000) // 7天前
      
      const validLogs = logs.filter(log => {
        const logTime = new Date(log.timestamp).getTime()
        return logTime > sevenDaysAgo
      })
      
      if (validLogs.length < logs.length) {
        localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(validLogs))
        console.log(`清理了 ${logs.length - validLogs.length} 条过期日志`)
      }
      
      // 同时清理内存中的队列
      this.logQueue = this.logQueue.filter(log => {
        const logTime = new Date(log.timestamp).getTime()
        return logTime > sevenDaysAgo
      })
      
    } catch (error) {
      console.error('清理过期日志失败:', error)
    }
  }

  /**
   * 获取日志统计信息
   */
  getLogStats() {
    const logs = this.getLocalLogs()
    
    const stats = {
      total: logs.length,
      reported: logs.filter(log => log.reported).length,
      pending: logs.filter(log => !log.reported).length,
      byLevel: {
        info: logs.filter(log => log.level === LOG_LEVELS.INFO).length,
        warn: logs.filter(log => log.level === LOG_LEVELS.WARN).length,
        error: logs.filter(log => log.level === LOG_LEVELS.ERROR).length,
        critical: logs.filter(log => log.level === LOG_LEVELS.CRITICAL).length
      },
      byType: {}
    }
    
    // 按错误类型统计
    logs.forEach(log => {
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1
    })
    
    return stats
  }

  /**
   * 清空所有日志
   */
  clearLogs() {
    try {
      localStorage.removeItem(LOG_STORAGE_KEY)
      this.logQueue = []
      console.log('所有错误日志已清空')
    } catch (error) {
      console.error('清空日志失败:', error)
    }
  }

  /**
   * 导出日志数据
   */
  exportLogs() {
    const logs = this.getLocalLogs()
    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  /**
   * 启用/禁用日志记录
   */
  setEnabled(enabled) {
    this.isEnabled = enabled
    console.log(`错误日志记录已${enabled ? '启用' : '禁用'}`)
  }

  /**
   * 设置上报端点
   */
  setReportEndpoint(endpoint) {
    this.reportEndpoint = endpoint
  }
}

// 创建全局日志记录器实例
const errorLogger = new ErrorLogger()

// 导出便捷方法
export const logError = (error, level) => errorLogger.log(error, level)
export const getLogStats = () => errorLogger.getLogStats()
export const clearLogs = () => errorLogger.clearLogs()
export const exportLogs = () => errorLogger.exportLogs()
export const batchReport = () => errorLogger.batchReport()
export const setLoggerEnabled = (enabled) => errorLogger.setEnabled(enabled)
export const setReportEndpoint = (endpoint) => errorLogger.setReportEndpoint(endpoint)

export { LOG_LEVELS }
export default errorLogger", "original_text": ""}]