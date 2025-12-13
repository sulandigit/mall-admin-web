import store from '@/store'
import { getUserInfo } from '@/utils/auth'

/**
 * 系统日志工具类
 * 用于记录用户操作行为和系统事件
 */
class Logger {
  constructor() {
    this.logs = []
    this.batchSize = 10 // 批量上传大小
    this.timer = null
    this.autoSubmitInterval = 5000 // 5秒自动提交一次
    this.init()
  }

  /**
   * 初始化日志记录器
   */
  init() {
    // 启动自动提交定时器
    this.startAutoSubmit()
    
    // 监听页面关闭事件，确保日志不丢失
    window.addEventListener('beforeunload', () => {
      this.forceSubmit()
    })
  }

  /**
   * 记录操作日志
   * @param {Object} logData 日志数据
   */
  log(logData) {
    const log = this.formatLog(logData)
    this.logs.push(log)
    
    // 达到批量大小时立即提交
    if (this.logs.length >= this.batchSize) {
      this.submitLogs()
    }
  }

  /**
   * 格式化日志数据
   * @param {Object} logData 原始日志数据
   * @returns {Object} 格式化后的日志数据
   */
  formatLog(logData) {
    const userInfo = getUserInfo()
    const timestamp = new Date()
    
    return {
      id: this.generateLogId(),
      userId: userInfo?.id || '',
      username: userInfo?.username || '',
      operationType: logData.operationType || 'UNKNOWN',
      moduleName: logData.moduleName || '',
      operationDesc: logData.operationDesc || '',
      requestMethod: logData.requestMethod || '',
      requestUrl: logData.requestUrl || '',
      requestParam: logData.requestParam || null,
      responseData: this.sanitizeResponse(logData.responseData),
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      operationTime: timestamp.toISOString(),
      duration: logData.duration || 0,
      status: logData.status || 'SUCCESS',
      errorMsg: logData.errorMsg || null
    }
  }

  /**
   * 清理响应数据，移除敏感信息
   * @param {Object} responseData 响应数据
   * @returns {Object} 清理后的响应数据
   */
  sanitizeResponse(responseData) {
    if (!responseData) return null
    
    // 创建副本避免修改原数据
    const sanitized = JSON.parse(JSON.stringify(responseData))
    
    // 移除敏感字段
    const sensitiveFields = ['password', 'token', 'secret', 'key']
    this.removeSensitiveData(sanitized, sensitiveFields)
    
    return sanitized
  }

  /**
   * 递归移除敏感数据
   * @param {Object} obj 数据对象
   * @param {Array} sensitiveFields 敏感字段列表
   */
  removeSensitiveData(obj, sensitiveFields) {
    if (typeof obj !== 'object' || obj === null) return
    
    for (const key in obj) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        obj[key] = '***'
      } else if (typeof obj[key] === 'object') {
        this.removeSensitiveData(obj[key], sensitiveFields)
      }
    }
  }

  /**
   * 生成日志ID
   * @returns {string} 日志ID
   */
  generateLogId() {
    return 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  /**
   * 获取客户端IP地址（模拟）
   * @returns {string} IP地址
   */
  getClientIP() {
    // 在真实环境中，这个应该由后端提供
    // 这里使用本地存储或者从接口获取
    return localStorage.getItem('clientIP') || '127.0.0.1'
  }

  /**
   * 提交日志到服务器
   */
  async submitLogs() {
    if (this.logs.length === 0) return
    
    const logsToSubmit = [...this.logs]
    this.logs = []
    
    try {
      // 调用store action提交日志
      await store.dispatch('log/submitLogs', logsToSubmit)
    } catch (error) {
      console.error('提交日志失败:', error)
      // 失败时重新加入队列
      this.logs.unshift(...logsToSubmit)
    }
  }

  /**
   * 强制提交所有日志
   */
  forceSubmit() {
    if (this.logs.length > 0) {
      // 使用同步方式提交，确保页面关闭前完成
      navigator.sendBeacon('/api/logs/batch', JSON.stringify(this.logs))
    }
  }

  /**
   * 启动自动提交定时器
   */
  startAutoSubmit() {
    this.timer = setInterval(() => {
      this.submitLogs()
    }, this.autoSubmitInterval)
  }

  /**
   * 停止自动提交定时器
   */
  stopAutoSubmit() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
}

// 创建全局日志实例
const logger = new Logger()

/**
 * 操作类型枚举
 */
export const OPERATION_TYPES = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  QUERY: 'QUERY',
  EXPORT: 'EXPORT',
  BATCH: 'BATCH'
}

/**
 * 日志记录快捷方法
 */
export const logMethods = {
  login: (data) => logger.log({ ...data, operationType: OPERATION_TYPES.LOGIN }),
  logout: (data) => logger.log({ ...data, operationType: OPERATION_TYPES.LOGOUT }),
  create: (data) => logger.log({ ...data, operationType: OPERATION_TYPES.CREATE }),
  update: (data) => logger.log({ ...data, operationType: OPERATION_TYPES.UPDATE }),
  delete: (data) => logger.log({ ...data, operationType: OPERATION_TYPES.DELETE }),
  query: (data) => logger.log({ ...data, operationType: OPERATION_TYPES.QUERY }),
  export: (data) => logger.log({ ...data, operationType: OPERATION_TYPES.EXPORT }),
  batch: (data) => logger.log({ ...data, operationType: OPERATION_TYPES.BATCH })
}

export default logger