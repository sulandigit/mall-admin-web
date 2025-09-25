// 批量导入导出错误处理工具
export class ImportExportErrorHandler {
  // 错误类型定义
  static ERROR_TYPES = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    FILE_FORMAT_ERROR: 'FILE_FORMAT_ERROR',
    FILE_SIZE_ERROR: 'FILE_SIZE_ERROR',
    DATA_VALIDATION_ERROR: 'DATA_VALIDATION_ERROR',
    BUSINESS_RULE_ERROR: 'BUSINESS_RULE_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR'
  }

  // 错误消息映射
  static ERROR_MESSAGES = {
    [this.ERROR_TYPES.NETWORK_ERROR]: '网络连接失败，请检查网络状态后重试',
    [this.ERROR_TYPES.FILE_FORMAT_ERROR]: '文件格式不正确，请上传正确的Excel文件',
    [this.ERROR_TYPES.FILE_SIZE_ERROR]: '文件大小超出限制，请上传小于10MB的文件',
    [this.ERROR_TYPES.DATA_VALIDATION_ERROR]: '数据验证失败，请检查数据格式',
    [this.ERROR_TYPES.BUSINESS_RULE_ERROR]: '业务规则验证失败，请检查数据内容',
    [this.ERROR_TYPES.SERVER_ERROR]: '服务器错误，请稍后重试',
    [this.ERROR_TYPES.TIMEOUT_ERROR]: '请求超时，请稍后重试'
  }

  // 处理API错误
  static handleApiError(error, context = '') {
    console.error(`[${context}] API Error:`, error)
    
    let errorType = this.ERROR_TYPES.SERVER_ERROR
    let message = this.ERROR_MESSAGES[errorType]
    
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      errorType = this.ERROR_TYPES.NETWORK_ERROR
    } else if (error.code === 'TIMEOUT') {
      errorType = this.ERROR_TYPES.TIMEOUT_ERROR
    } else if (error.response) {
      const status = error.response.status
      const data = error.response.data
      
      if (status === 400) {
        errorType = this.ERROR_TYPES.DATA_VALIDATION_ERROR
        if (data && data.message) {
          message = data.message
        }
      } else if (status === 413) {
        errorType = this.ERROR_TYPES.FILE_SIZE_ERROR
      } else if (status === 415) {
        errorType = this.ERROR_TYPES.FILE_FORMAT_ERROR
      } else if (status >= 500) {
        errorType = this.ERROR_TYPES.SERVER_ERROR
      }
    }
    
    return {
      type: errorType,
      message: this.ERROR_MESSAGES[errorType] || message,
      originalError: error
    }
  }

  // 处理文件验证错误
  static handleFileValidationError(file) {
    if (!file) {
      return {
        type: this.ERROR_TYPES.DATA_VALIDATION_ERROR,
        message: '请选择要上传的文件'
      }
    }

    // 检查文件类型
    const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
    if (!allowedTypes.includes(file.type)) {
      return {
        type: this.ERROR_TYPES.FILE_FORMAT_ERROR,
        message: this.ERROR_MESSAGES[this.ERROR_TYPES.FILE_FORMAT_ERROR]
      }
    }

    // 检查文件大小 (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        type: this.ERROR_TYPES.FILE_SIZE_ERROR,
        message: this.ERROR_MESSAGES[this.ERROR_TYPES.FILE_SIZE_ERROR]
      }
    }

    return null
  }

  // 格式化验证错误
  static formatValidationErrors(errors) {
    if (!errors || !Array.isArray(errors)) {
      return []
    }

    return errors.map(error => ({
      row: error.row || 0,
      field: error.field || '',
      message: error.message || '数据验证失败',
      value: error.value || ''
    }))
  }

  // 生成错误报告
  static generateErrorReport(errors) {
    if (!errors || errors.length === 0) {
      return {
        hasErrors: false,
        totalErrors: 0,
        errorSummary: {}
      }
    }

    const errorSummary = {}
    errors.forEach(error => {
      const key = error.field || 'unknown'
      if (!errorSummary[key]) {
        errorSummary[key] = {
          field: key,
          count: 0,
          examples: []
        }
      }
      errorSummary[key].count++
      if (errorSummary[key].examples.length < 3) {
        errorSummary[key].examples.push({
          row: error.row,
          message: error.message,
          value: error.value
        })
      }
    })

    return {
      hasErrors: true,
      totalErrors: errors.length,
      errorSummary
    }
  }
}

// 用户反馈工具
export class UserFeedbackManager {
  constructor(vueInstance) {
    this.vm = vueInstance
  }

  // 显示成功消息
  showSuccess(message, duration = 3000) {
    this.vm.$message({
      type: 'success',
      message,
      duration,
      showClose: true
    })
  }

  // 显示警告消息
  showWarning(message, duration = 4000) {
    this.vm.$message({
      type: 'warning',
      message,
      duration,
      showClose: true
    })
  }

  // 显示错误消息
  showError(message, duration = 5000) {
    this.vm.$message({
      type: 'error',
      message,
      duration,
      showClose: true
    })
  }

  // 显示信息消息
  showInfo(message, duration = 3000) {
    this.vm.$message({
      type: 'info',
      message,
      duration,
      showClose: true
    })
  }

  // 显示加载提示
  showLoading(message = '处理中...') {
    return this.vm.$loading({
      lock: true,
      text: message,
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    })
  }

  // 显示确认对话框
  showConfirm(message, title = '提示', options = {}) {
    const defaultOptions = {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      center: true
    }

    return this.vm.$confirm(message, title, { ...defaultOptions, ...options })
  }

  // 显示通知
  showNotification(title, message, type = 'info', duration = 4500) {
    this.vm.$notify({
      title,
      message,
      type,
      duration,
      position: 'top-right'
    })
  }

  // 显示导入成功通知
  showImportSuccess(result) {
    const { successCount, failureCount } = result
    let message = ''
    let type = 'success'

    if (failureCount === 0) {
      message = `导入成功！共导入 ${successCount} 条商品数据`
    } else if (successCount === 0) {
      message = `导入失败！${failureCount} 条数据导入失败`
      type = 'error'
    } else {
      message = `部分导入成功！成功 ${successCount} 条，失败 ${failureCount} 条`
      type = 'warning'
    }

    this.showNotification('批量导入结果', message, type)
  }

  // 显示导出成功通知
  showExportSuccess(result) {
    const { recordCount, fileName } = result
    const message = `成功导出 ${recordCount} 条商品数据到文件 ${fileName}`
    this.showNotification('批量导出成功', message, 'success')
  }

  // 显示进度提示
  showProgressToast(message, progress) {
    const progressText = progress !== undefined ? ` (${progress}%)` : ''
    this.showInfo(`${message}${progressText}`)
  }
}

// 重试机制
export class RetryManager {
  constructor(maxRetries = 3, baseDelay = 1000) {
    this.maxRetries = maxRetries
    this.baseDelay = baseDelay
  }

  // 执行带重试的异步操作
  async executeWithRetry(asyncFunction, context = '') {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await asyncFunction()
      } catch (error) {
        console.warn(`[${context}] Attempt ${attempt} failed:`, error)
        
        if (attempt === this.maxRetries) {
          throw error
        }
        
        // 指数退避延迟
        const delay = this.baseDelay * Math.pow(2, attempt - 1)
        await this.delay(delay)
      }
    }
  }

  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 文件操作工具
export class FileOperationUtils {
  // 下载文件
  static downloadFile(url, fileName) {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 清理 blob URL
    if (url.startsWith('blob:')) {
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 1000)
    }
  }

  // 创建下载链接
  static createDownloadUrl(blob, fileName) {
    const url = URL.createObjectURL(blob)
    return { url, fileName }
  }

  // 格式化文件大小
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 验证文件名
  static validateFileName(fileName) {
    // 检查文件名长度
    if (fileName.length > 100) {
      return '文件名过长，请使用不超过100个字符的文件名'
    }
    
    // 检查非法字符
    const invalidChars = /[<>:"/\\|?*]/
    if (invalidChars.test(fileName)) {
      return '文件名包含非法字符，请去除 < > : " / \\ | ? * 等字符'
    }
    
    return null
  }
}

// 导出所有工具
export default {
  ImportExportErrorHandler,
  UserFeedbackManager,
  RetryManager,
  FileOperationUtils
}