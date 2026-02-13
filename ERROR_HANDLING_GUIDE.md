# 错误处理系统使用文档

## 概述

本项目实现了一套完整的前端错误处理系统，包含以下核心功能：

- 🛡️ 全局错误捕获和监控
- 🔄 智能重试机制
- 📉 错误降级策略
- 🎯 用户友好的错误提示
- 📊 错误统计和分析
- 🧪 组件级错误边界

## 核心组件

### 1. ErrorHandler - 统一错误处理器

```javascript
import ErrorHandler, { ERROR_CODES, ERROR_TYPES } from '@/utils/errorHandler'

// 创建错误
const error = ErrorHandler.createError(
  ERROR_CODES.NETWORK_ERROR,
  '网络连接失败',
  ERROR_TYPES.NETWORK
)

// 处理API错误
ErrorHandler.handleApiError(error, {
  showMessage: true,
  logError: true,
  retryable: true
})

// 处理验证错误
ErrorHandler.handleValidationError({
  username: ['用户名不能为空'],
  password: ['密码长度不足']
})

// 处理业务错误
ErrorHandler.handleBusinessError('库存不足，无法下单')
```

### 2. 全局错误监控

```javascript
import { globalErrorMonitor } from '@/utils/globalErrorMonitor'

// 在main.js中初始化
globalErrorMonitor.init({
  enableConsoleError: true,
  enablePromiseRejection: true,
  enableVueError: true,
  reportUrl: '/api/errors/report'
})

// 设置用户ID（登录后）
globalErrorMonitor.setUserId('user123')

// 获取错误统计
const stats = globalErrorMonitor.getErrorStats()
console.log('错误统计:', stats)
```

### 3. 重试机制

```javascript
import { withRetry, RetryManager } from '@/utils/retryManager'

// 简单重试
const result = await withRetry(
  () => apiCall(),
  {
    maxRetries: 3,
    baseDelay: 1000,
    strategy: 'exponential'
  }
)

// 自定义重试管理器
const retryManager = new RetryManager({
  maxRetries: 5,
  baseDelay: 2000,
  retryCondition: (error) => error.code === 'NETWORK_ERROR'
})

const result = await retryManager.execute(() => apiCall())
```

### 4. 错误恢复服务

```javascript
import { globalErrorRecoveryService, withErrorRecovery } from '@/utils/errorRecoveryService'

// 使用包装器
const safeApiCall = withErrorRecovery(apiCall, {
  cacheKey: 'user-data',
  router: this.$router,
  store: this.$store
})

// 手动恢复
try {
  const data = await apiCall()
} catch (error) {
  const recovery = await globalErrorRecoveryService.recover(error, {
    operation: apiCall,
    cacheKey: 'user-data'
  })
  
  if (recovery.success) {
    return recovery.data
  }
}
```

## 组件级使用

### 1. 使用错误处理Mixin

```vue
<template>
  <div>
    <el-button @click="loadData" :loading="loading">加载数据</el-button>
    <el-table :data="tableData"></el-table>
  </div>
</template>

<script>
import errorHandlingMixin from '@/mixins/errorHandlingMixin'

export default {
  mixins: [errorHandlingMixin],
  data() {
    return {
      tableData: []
    }
  },
  methods: {
    async loadData() {
      // 使用安全执行，自动处理错误和loading状态
      await this.safeExecute(
        async () => {
          const response = await this.$api.getUserList()
          this.tableData = response.data
        },
        {
          showLoading: true,
          loadingText: '加载用户数据...',
          fallback: () => ({ data: [] })
        }
      )
    },

    async saveData() {
      // 表单提交，带重试机制
      await this.submitForm(
        (data) => this.$api.saveUser(data),
        this.formData,
        '保存成功！'
      )
    },

    async batchDelete() {
      // 批量操作
      await this.batchOperation(
        this.selectedItems,
        (item) => this.$api.deleteUser(item.id),
        '删除'
      )
    }
  }
}
</script>
```

### 2. 使用错误边界组件

```vue
<template>
  <ErrorBoundary
    :retryable="true"
    :on-retry="retryLoad"
    :on-error="handleError"
  >
    <UserList />
  </ErrorBoundary>
</template>

<script>
import ErrorBoundary from '@/components/ErrorBoundary'
import UserList from './UserList'

export default {
  components: {
    ErrorBoundary,
    UserList
  },
  methods: {
    retryLoad() {
      // 重试逻辑
      this.$refs.userList.loadData()
    },
    
    handleError(error, vm, info) {
      // 错误处理逻辑
      console.log('组件错误:', error)
    }
  }
}
</script>
```

### 3. 使用错误页面组件

```vue
<template>
  <ErrorPage
    :error-code="500"
    title="服务器内部错误"
    description="服务器遇到了一个意外的问题"
    :retryable="true"
    :on-retry="handleRetry"
  />
</template>

<script>
import ErrorPage from '@/components/ErrorPage'

export default {
  components: {
    ErrorPage
  },
  methods: {
    async handleRetry() {
      // 重试逻辑
      await this.reloadPageData()
    }
  }
}
</script>
```

## 高级用法

### 1. 自定义错误恢复策略

```javascript
import { globalErrorRecoveryService, RECOVERY_STRATEGIES } from '@/utils/errorRecoveryService'

// 注册自定义策略
globalErrorRecoveryService.registerStrategy('CUSTOM_ERROR', [
  {
    type: RECOVERY_STRATEGIES.CACHE,
    cacheKey: 'fallback-data'
  },
  {
    type: RECOVERY_STRATEGIES.FALLBACK,
    fallback: 'custom-fallback'
  },
  {
    type: RECOVERY_STRATEGIES.REDIRECT,
    url: '/error-page'
  }
])
```

### 2. 自定义降级策略

```javascript
import { globalFallbackManager } from '@/utils/retryManager'

// 注册降级策略
globalFallbackManager.register('user-list-fallback', (error, options) => {
  return {
    data: [],
    total: 0,
    message: '用户数据暂时无法加载，已显示空列表'
  }
})

// 使用降级策略
const result = await globalFallbackManager.executeWithFallback(
  () => api.getUserList(),
  'user-list-fallback'
)
```

### 3. 错误监听和处理

```javascript
// 监听全局错误
window.addEventListener('error', (event) => {
  console.log('捕获到全局错误:', event.error)
})

// 监听Promise rejection
window.addEventListener('unhandledrejection', (event) => {
  console.log('捕获到未处理的Promise rejection:', event.reason)
})

// Vue错误处理
Vue.config.errorHandler = (err, vm, info) => {
  console.log('Vue组件错误:', err, info)
}
```

## 配置选项

### 错误监控配置

```javascript
globalErrorMonitor.init({
  enableConsoleError: true,        // 启用控制台错误监听
  enablePromiseRejection: true,    // 启用Promise rejection监听
  enableVueError: true,            // 启用Vue错误监听
  enableResourceError: true,       // 启用资源加载错误监听
  maxErrorsPerType: 10,           // 每种错误类型的最大记录数
  reportUrl: '/api/errors/report', // 错误上报URL
  enableLocalStorage: true,        // 启用本地存储
  userId: null,                   // 用户ID
  version: '1.0.0'               // 应用版本
})
```

### 重试配置

```javascript
const retryConfig = {
  maxRetries: 3,                  // 最大重试次数
  baseDelay: 1000,               // 基础延迟时间
  maxDelay: 30000,               // 最大延迟时间
  strategy: 'exponential',        // 重试策略：exponential, linear, fixed
  retryCondition: (error) => {    // 重试条件函数
    return error.code === 'NETWORK_ERROR'
  },
  onRetry: (error, retryCount) => { // 重试回调
    console.log(`重试第${retryCount}次:`, error.message)
  }
}
```

## 最佳实践

### 1. 错误分类和处理

```javascript
// 网络错误 - 自动重试
if (error.type === ERROR_TYPES.NETWORK) {
  // 显示网络错误提示，启用重试
  return withRetry(operation, { maxRetries: 3 })
}

// 业务错误 - 显示具体信息
if (error.type === ERROR_TYPES.BUSINESS) {
  // 显示业务错误信息，不重试
  this.$message.error(error.message)
  return
}

// 系统错误 - 记录并降级
if (error.type === ERROR_TYPES.SYSTEM) {
  // 记录错误，显示通用提示，启用降级
  ErrorHandler.logError(error)
  return fallbackData
}
```

### 2. 渐进式错误处理

```javascript
// 第一级：尝试正常操作
try {
  return await normalOperation()
} catch (error) {
  // 第二级：尝试重试
  try {
    return await withRetry(normalOperation, { maxRetries: 2 })
  } catch (retryError) {
    // 第三级：使用缓存数据
    const cachedData = getFromCache('operation-data')
    if (cachedData) {
      this.$message.warning('数据来自缓存，可能不是最新的')
      return cachedData
    }
    
    // 第四级：使用默认数据
    this.$message.error('操作失败，显示默认数据')
    return getDefaultData()
  }
}
```

### 3. 错误上报和分析

```javascript
// 定期分析错误趋势
setInterval(() => {
  const stats = globalErrorMonitor.getErrorStats()
  
  // 错误率过高时告警
  if (stats.totalErrors > 100) {
    console.warn('错误数量过多，需要关注:', stats)
  }
  
  // 上报错误统计
  if (stats.totalErrors > 0) {
    api.reportErrorStats(stats)
  }
}, 300000) // 5分钟检查一次
```

## 调试和测试

### 运行测试

```javascript
import { runAllTests, manualTest } from '@/utils/errorHandlingTests'

// 运行所有测试
runAllTests()

// 手动测试
manualTest()
```

### 查看错误统计

```javascript
// 在浏览器控制台中运行
console.log('错误监控统计:', window.app.$errorMonitor.getErrorStats())
console.log('恢复服务统计:', window.app.$errorRecovery.getRecoveryStats())
```

## 注意事项

1. **避免过度重试**：网络错误可以重试，但业务错误通常不应该重试
2. **缓存策略**：合理设置缓存过期时间，避免显示过时数据
3. **用户体验**：错误信息要对用户友好，避免显示技术细节
4. **性能影响**：错误处理不应该显著影响应用性能
5. **隐私保护**：错误上报时注意不要包含敏感用户信息

## 更新日志

- v1.0.0: 初始版本，包含基础错误处理功能
- v1.1.0: 添加错误恢复服务和降级策略
- v1.2.0: 增强用户界面和错误边界组件