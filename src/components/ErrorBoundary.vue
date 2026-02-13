<template>
  <div class="error-boundary">
    <div v-if="hasError" class="error-container">
      <!-- 错误显示界面 -->
      <div class="error-content">
        <div class="error-icon">
          <i class="el-icon-warning-outline"></i>
        </div>
        <h3 class="error-title">{{ errorTitle }}</h3>
        <p class="error-message">{{ errorMessage }}</p>
        
        <!-- 错误操作按钮 -->
        <div class="error-actions">
          <el-button 
            type="primary" 
            @click="retry" 
            :loading="retrying"
            v-if="retryable">
            重试
          </el-button>
          <el-button @click="goBack" v-if="showGoBack">
            返回上页
          </el-button>
          <el-button @click="goHome">
            回到首页
          </el-button>
        </div>

        <!-- 开发环境显示详细错误信息 -->
        <div v-if="isDevelopment && showDetails" class="error-details">
          <el-collapse>
            <el-collapse-item title="错误详情" name="details">
              <pre>{{ errorDetails }}</pre>
            </el-collapse-item>
          </el-collapse>
        </div>
        
        <div class="error-help">
          <el-button type="text" @click="showDetails = !showDetails" v-if="isDevelopment">
            {{ showDetails ? '隐藏' : '显示' }}错误详情
          </el-button>
          <el-button type="text" @click="reportError">
            报告此问题
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 正常内容 -->
    <div v-else>
      <slot></slot>
    </div>
  </div>
</template>

<script>
import ErrorHandler, { ERROR_CODES, ERROR_TYPES } from '@/utils/errorHandler'

export default {
  name: 'ErrorBoundary',
  props: {
    // 自定义错误标题
    errorTitle: {
      type: String,
      default: '页面出现问题'
    },
    // 自定义错误消息
    customErrorMessage: {
      type: String,
      default: ''
    },
    // 是否可重试
    retryable: {
      type: Boolean,
      default: true
    },
    // 是否显示返回按钮
    showGoBack: {
      type: Boolean,
      default: true
    },
    // 重试回调函数
    onRetry: {
      type: Function,
      default: null
    },
    // 错误发生时的回调
    onError: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      hasError: false,
      error: null,
      errorInfo: null,
      retrying: false,
      showDetails: false,
      isDevelopment: process.env.NODE_ENV === 'development'
    }
  },
  computed: {
    errorMessage() {
      if (this.customErrorMessage) {
        return this.customErrorMessage
      }
      
      if (this.error) {
        return this.error.message || '发生了未知错误，请稍后重试'
      }
      
      return '页面加载出现问题，请稍后重试'
    },
    
    errorDetails() {
      if (!this.error) return ''
      
      return JSON.stringify({
        message: this.error.message,
        stack: this.error.stack,
        code: this.error.code,
        type: this.error.type,
        details: this.error.details,
        timestamp: this.error.timestamp,
        componentName: this.$options.name,
        route: this.$route
      }, null, 2)
    }
  },
  errorCaptured(err, vm, info) {
    // Vue 2.5+ 错误捕获钩子
    this.handleError(err, vm, info)
    return false // 阻止错误继续向上传播
  },
  methods: {
    /**
     * 处理捕获到的错误
     */
    handleError(err, vm, info) {
      this.hasError = true
      this.error = err
      this.errorInfo = info
      
      // 创建错误信息
      const errorDetail = ErrorHandler.createError(
        ERROR_CODES.SYSTEM_ERROR,
        `组件错误: ${err.message}`,
        ERROR_TYPES.SYSTEM,
        {
          componentName: vm?.$options?.name || 'Unknown',
          errorInfo: info,
          parentComponent: this.$options.name,
          route: this.$route,
          props: vm?.$props
        },
        err
      )
      
      // 记录错误
      ErrorHandler.logError(errorDetail)
      
      // 调用错误回调
      if (this.onError) {
        this.onError(errorDetail, vm, info)
      }
      
      // 上报错误到监控系统
      if (this.$errorMonitor) {
        this.$errorMonitor.recordError({
          type: 'component-error',
          message: err.message,
          stack: err.stack,
          componentName: vm?.$options?.name || 'Unknown',
          parentComponent: this.$options.name,
          errorInfo: info,
          route: this.$route?.path,
          timestamp: Date.now()
        })
      }
    },
    
    /**
     * 重试操作
     */
    async retry() {
      this.retrying = true
      
      try {
        if (this.onRetry) {
          await this.onRetry()
        } else {
          // 默认重试：重新渲染组件
          this.hasError = false
          this.error = null
          this.errorInfo = null
          
          // 强制重新渲染
          this.$nextTick(() => {
            this.$forceUpdate()
          })
        }
        
        this.$message.success('重试成功')
      } catch (retryError) {
        this.$message.error('重试失败，请稍后再试')
        ErrorHandler.handleApiError(retryError)
      } finally {
        this.retrying = false
      }
    },
    
    /**
     * 返回上一页
     */
    goBack() {
      if (window.history.length > 1) {
        this.$router.go(-1)
      } else {
        this.goHome()
      }
    },
    
    /**
     * 回到首页
     */
    goHome() {
      this.$router.push('/')
    },
    
    /**
     * 报告错误
     */
    reportError() {
      const errorReport = {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now(),
        error: this.errorDetails,
        userFeedback: ''
      }
      
      this.$prompt('请描述您遇到的问题（可选）', '问题反馈', {
        inputType: 'textarea',
        inputPlaceholder: '请详细描述问题发生的情况...'
      }).then(({ value }) => {
        errorReport.userFeedback = value || ''
        
        // 这里可以发送到错误收集服务
        console.log('错误报告:', errorReport)
        
        this.$message.success('问题已反馈，谢谢您的报告！')
      }).catch(() => {
        // 用户取消
      })
    },
    
    /**
     * 重置错误状态
     */
    resetError() {
      this.hasError = false
      this.error = null
      this.errorInfo = null
      this.showDetails = false
    }
  }
}
</script>

<style scoped>
.error-boundary {
  width: 100%;
  height: 100%;
}

.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 20px;
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-icon {
  font-size: 64px;
  color: #f56c6c;
  margin-bottom: 20px;
}

.error-title {
  font-size: 24px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 12px;
}

.error-message {
  font-size: 16px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 24px;
}

.error-actions {
  margin-bottom: 20px;
}

.error-actions .el-button {
  margin: 0 8px;
}

.error-details {
  margin-top: 20px;
  text-align: left;
}

.error-details pre {
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  max-height: 300px;
  overflow: auto;
}

.error-help {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.error-help .el-button {
  margin: 0 8px;
}
</style>