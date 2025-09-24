<template>
  <div class="error-page">
    <div class="error-container">
      <!-- 错误图标 -->
      <div class="error-illustration">
        <div class="error-code" v-if="showErrorCode">{{ errorCode }}</div>
        <div class="error-graphic">
          <div class="error-circle">
            <i :class="iconClass"></i>
          </div>
        </div>
      </div>

      <!-- 错误内容 -->
      <div class="error-content">
        <h1 class="error-title">{{ title }}</h1>
        <p class="error-description">{{ description }}</p>
        
        <!-- 错误详情（开发环境） -->
        <div v-if="isDevelopment && errorDetails" class="error-details">
          <el-collapse>
            <el-collapse-item title="错误详情" name="details">
              <pre>{{ errorDetails }}</pre>
            </el-collapse-item>
          </el-collapse>
        </div>

        <!-- 建议操作 -->
        <div class="error-suggestions" v-if="suggestions.length > 0">
          <h3>您可以尝试：</h3>
          <ul>
            <li v-for="(suggestion, index) in suggestions" :key="index">
              {{ suggestion }}
            </li>
          </ul>
        </div>

        <!-- 操作按钮 -->
        <div class="error-actions">
          <el-button 
            type="primary" 
            @click="retry" 
            :loading="retrying"
            v-if="retryable">
            <i class="el-icon-refresh"></i>
            重试
          </el-button>
          
          <el-button @click="goBack" v-if="showGoBack">
            <i class="el-icon-back"></i>
            返回上页
          </el-button>
          
          <el-button @click="goHome">
            <i class="el-icon-house"></i>
            回到首页
          </el-button>
          
          <el-button type="text" @click="contactSupport" v-if="showContactSupport">
            <i class="el-icon-service"></i>
            联系技术支持
          </el-button>
        </div>
      </div>
    </div>

    <!-- 底部帮助信息 -->
    <div class="error-footer" v-if="showFooter">
      <p>如果问题持续存在，请联系系统管理员</p>
      <p class="error-id" v-if="errorId">错误ID: {{ errorId }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErrorPage',
  props: {
    // 错误码
    errorCode: {
      type: [String, Number],
      default: '500'
    },
    // 错误标题
    title: {
      type: String,
      default: '页面出现问题'
    },
    // 错误描述
    description: {
      type: String,
      default: '抱歉，页面遇到了一些问题，请稍后重试'
    },
    // 错误详情
    errorDetails: {
      type: [String, Object],
      default: null
    },
    // 建议操作
    suggestions: {
      type: Array,
      default: () => [
        '检查网络连接是否正常',
        '刷新页面重试',
        '清除浏览器缓存',
        '稍后再试'
      ]
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
    // 是否显示联系支持
    showContactSupport: {
      type: Boolean,
      default: true
    },
    // 是否显示底部
    showFooter: {
      type: Boolean,
      default: true
    },
    // 是否显示错误码
    showErrorCode: {
      type: Boolean,
      default: true
    },
    // 重试回调
    onRetry: {
      type: Function,
      default: null
    },
    // 错误ID
    errorId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      retrying: false,
      isDevelopment: process.env.NODE_ENV === 'development'
    }
  },
  computed: {
    iconClass() {
      const code = String(this.errorCode)
      if (code.startsWith('4')) {
        return 'el-icon-warning-outline'
      } else if (code.startsWith('5')) {
        return 'el-icon-error'
      } else {
        return 'el-icon-question'
      }
    },
    
    formattedErrorDetails() {
      if (!this.errorDetails) return ''
      
      if (typeof this.errorDetails === 'object') {
        return JSON.stringify(this.errorDetails, null, 2)
      }
      
      return this.errorDetails
    }
  },
  methods: {
    async retry() {
      this.retrying = true
      
      try {
        if (this.onRetry) {
          await this.onRetry()
        } else {
          // 默认重试：刷新页面
          window.location.reload()
        }
      } catch (error) {
        this.$message.error('重试失败，请稍后再试')
        console.error('重试失败:', error)
      } finally {
        this.retrying = false
      }
    },
    
    goBack() {
      if (window.history.length > 1) {
        this.$router.go(-1)
      } else {
        this.goHome()
      }
    },
    
    goHome() {
      this.$router.push('/')
    },
    
    contactSupport() {
      // 这里可以打开客服聊天、发送邮件或跳转到帮助页面
      const errorInfo = {
        errorCode: this.errorCode,
        errorId: this.errorId,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        errorDetails: this.formattedErrorDetails
      }
      
      // 示例：复制错误信息到剪贴板
      const errorText = `错误报告
错误码: ${errorInfo.errorCode}
错误ID: ${errorInfo.errorId}
页面: ${errorInfo.url}
时间: ${errorInfo.timestamp}
详情: ${errorInfo.errorDetails}`
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(errorText).then(() => {
          this.$message.success('错误信息已复制到剪贴板，请发送给技术支持')
        })
      } else {
        // 降级方案
        this.$alert(errorText, '错误信息', {
          confirmButtonText: '确定',
          type: 'info'
        })
      }
    }
  }
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  padding: 20px;
}

.error-container {
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.error-illustration {
  margin-bottom: 40px;
  position: relative;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #dcdfe6;
  line-height: 1;
  margin-bottom: 20px;
  user-select: none;
}

.error-graphic {
  margin-top: -60px;
}

.error-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f56c6c, #ff8a80);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 8px 24px rgba(245, 108, 108, 0.3);
}

.error-circle i {
  font-size: 48px;
  color: white;
}

.error-content {
  margin-bottom: 40px;
}

.error-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.error-description {
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 24px;
}

.error-details {
  margin: 24px 0;
  text-align: left;
}

.error-details pre {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  max-height: 200px;
  overflow: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.error-suggestions {
  text-align: left;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  margin: 24px 0;
}

.error-suggestions h3 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 12px;
}

.error-suggestions ul {
  margin: 0;
  padding-left: 20px;
}

.error-suggestions li {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 8px;
}

.error-actions {
  margin-top: 32px;
}

.error-actions .el-button {
  margin: 0 8px 8px 0;
}

.error-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.error-id {
  font-family: monospace;
  font-size: 12px;
  margin-top: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-page {
    padding: 16px;
  }
  
  .error-code {
    font-size: 80px;
  }
  
  .error-circle {
    width: 80px;
    height: 80px;
  }
  
  .error-circle i {
    font-size: 32px;
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .error-description {
    font-size: 14px;
  }
  
  .error-actions .el-button {
    display: block;
    width: 100%;
    margin: 8px 0;
  }
}
</style>