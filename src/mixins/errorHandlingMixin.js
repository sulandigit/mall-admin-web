import ErrorHandler, { ERROR_CODES, ERROR_TYPES } from '@/utils/errorHandler'
import { withRetry, globalFallbackManager } from '@/utils/retryManager'

/**
 * 错误处理Mixin
 * 为组件提供统一的错误处理能力
 */
export default {
  data() {
    return {
      loading: false,
      error: null,
      retryCount: 0,
      maxRetries: 3
    }
  },
  
  methods: {
    /**
     * 安全执行异步操作
     * @param {Function} operation 要执行的操作
     * @param {Object} options 配置选项
     */
    async safeExecute(operation, options = {}) {
      const {
        showLoading = true,
        showError = true,
        retryable = false,
        fallback = null,
        loadingText = '加载中...',
        errorMessage = '操作失败'
      } = options

      if (showLoading) {
        this.loading = true
        if (loadingText) {
          this.$loading({
            text: loadingText
          })
        }
      }

      try {
        this.error = null
        const result = await operation()
        return result
      } catch (error) {
        this.error = error
        
        if (showError) {
          ErrorHandler.handleApiError(error, {
            showMessage: true,
            logError: true,
            retryable
          })
        }

        // 尝试降级策略
        if (fallback) {
          try {
            if (typeof fallback === 'string') {
              return await globalFallbackManager.executeWithFallback(
                operation,
                fallback
              )
            } else if (typeof fallback === 'function') {
              return await fallback(error)
            }
          } catch (fallbackError) {
            console.warn('降级策略执行失败:', fallbackError)
          }
        }

        throw error
      } finally {
        if (showLoading) {
          this.loading = false
          this.$loading().close()
        }
      }
    },

    /**
     * 带重试的安全执行
     * @param {Function} operation 要执行的操作
     * @param {Object} retryOptions 重试配置
     */
    async safeExecuteWithRetry(operation, retryOptions = {}) {
      const defaultRetryOptions = {
        maxRetries: this.maxRetries,
        baseDelay: 1000,
        onRetry: (error, retryCount) => {
          this.retryCount = retryCount
          this.$message.warning(`操作失败，正在重试... (${retryCount}/${this.maxRetries})`)
        },
        retryableErrors: [
          ERROR_CODES.NETWORK_ERROR,
          ERROR_CODES.TIMEOUT_ERROR,
          ERROR_CODES.SYSTEM_ERROR
        ]
      }

      try {
        return await withRetry(
          () => this.safeExecute(operation, { showError: false }),
          { ...defaultRetryOptions, ...retryOptions }
        )
      } catch (error) {
        ErrorHandler.handleApiError(error, {
          showMessage: true,
          logError: true
        })
        throw error
      } finally {
        this.retryCount = 0
      }
    },

    /**
     * 处理表单验证错误
     * @param {Object} validationErrors 验证错误对象
     */
    handleValidationError(validationErrors) {
      return ErrorHandler.handleValidationError(validationErrors)
    },

    /**
     * 处理业务错误
     * @param {string} message 错误消息
     * @param {Object} details 错误详情
     */
    handleBusinessError(message, details = {}) {
      return ErrorHandler.handleBusinessError(message, details)
    },

    /**
     * 显示错误消息
     * @param {string} message 错误消息
     * @param {string} type 错误类型
     */
    showError(message, type = 'error') {
      this.$message({
        message,
        type,
        duration: 3000,
        showClose: true
      })
    },

    /**
     * 显示成功消息
     * @param {string} message 成功消息
     */
    showSuccess(message) {
      this.$message.success(message)
    },

    /**
     * 显示警告消息
     * @param {string} message 警告消息
     */
    showWarning(message) {
      this.$message.warning(message)
    },

    /**
     * 确认对话框
     * @param {string} message 确认消息
     * @param {string} title 标题
     * @param {Object} options 选项
     */
    async confirmDialog(message, title = '确认', options = {}) {
      const defaultOptions = {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        ...options
      }

      try {
        await this.$confirm(message, title, defaultOptions)
        return true
      } catch {
        return false
      }
    },

    /**
     * 处理表格数据加载
     * @param {Function} loadFunction 加载函数
     * @param {Object} params 查询参数
     */
    async loadTableData(loadFunction, params = {}) {
      return this.safeExecute(
        async () => {
          const response = await loadFunction(params)
          return response.data || response
        },
        {
          showLoading: true,
          loadingText: '加载数据中...',
          fallback: () => ({ list: [], total: 0 })
        }
      )
    },

    /**
     * 处理表单提交
     * @param {Function} submitFunction 提交函数
     * @param {Object} data 表单数据
     * @param {string} successMessage 成功消息
     */
    async submitForm(submitFunction, data, successMessage = '操作成功') {
      return this.safeExecuteWithRetry(
        async () => {
          const result = await submitFunction(data)
          this.showSuccess(successMessage)
          return result
        },
        {
          maxRetries: 1 // 表单提交通常不需要太多重试
        }
      )
    },

    /**
     * 处理文件上传
     * @param {Function} uploadFunction 上传函数
     * @param {File} file 文件对象
     */
    async uploadFile(uploadFunction, file) {
      return this.safeExecute(
        async () => {
          const result = await uploadFunction(file)
          this.showSuccess('文件上传成功')
          return result
        },
        {
          showLoading: true,
          loadingText: '文件上传中...',
          retryable: true
        }
      )
    },

    /**
     * 批量操作处理
     * @param {Array} items 操作项目列表
     * @param {Function} operationFunction 操作函数
     * @param {string} operationName 操作名称
     */
    async batchOperation(items, operationFunction, operationName = '批量操作') {
      if (!items || items.length === 0) {
        this.showWarning('请选择要操作的项目')
        return false
      }

      const confirmed = await this.confirmDialog(
        `确定要${operationName} ${items.length} 个项目吗？`,
        '批量操作确认'
      )

      if (!confirmed) return false

      let successCount = 0
      let failureCount = 0
      const failures = []

      for (let i = 0; i < items.length; i++) {
        try {
          await operationFunction(items[i])
          successCount++
        } catch (error) {
          failureCount++
          failures.push({
            item: items[i],
            error: error.message || '操作失败'
          })
        }

        // 显示进度
        if (items.length > 1) {
          this.$message.info(`${operationName}进度: ${i + 1}/${items.length}`)
        }
      }

      // 显示结果
      if (failureCount === 0) {
        this.showSuccess(`${operationName}完成！成功处理 ${successCount} 个项目`)
      } else {
        this.showWarning(
          `${operationName}完成！成功 ${successCount} 个，失败 ${failureCount} 个`
        )
        
        // 显示失败详情
        if (failures.length > 0) {
          console.warn('批量操作失败详情:', failures)
        }
      }

      return {
        successCount,
        failureCount,
        failures
      }
    }
  },

  /**
   * 组件错误处理
   */
  errorCaptured(err, vm, info) {
    // 记录组件错误
    const errorInfo = ErrorHandler.createError(
      ERROR_CODES.SYSTEM_ERROR,
      `组件错误: ${err.message}`,
      ERROR_TYPES.SYSTEM,
      {
        componentName: vm?.$options?.name || 'Unknown',
        parentComponent: this.$options.name,
        errorInfo: info,
        route: this.$route,
        props: vm?.$props
      },
      err
    )

    ErrorHandler.logError(errorInfo)

    // 不阻止错误向上传播，让ErrorBoundary处理
    return true
  }
}