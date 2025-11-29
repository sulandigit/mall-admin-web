# 集中化错误处理系统使用指南

## 📖 概述

这个集中化错误处理系统为商城管理后台提供了完整的错误处理、记录、监控和管理功能。系统会自动捕获和处理各种类型的错误，提供用户友好的错误提示，并支持错误日志的本地存储和远程上报。

## 🏗️ 系统架构

```
错误处理系统
├── errorHandler.js      # 核心错误处理器
├── errorTypes.js        # 错误类型定义和映射
├── globalErrorListener.js  # 全局错误监听器
├── errorLogger.js       # 错误日志记录器
├── request.js           # HTTP拦截器优化
└── ErrorManagement.vue  # 错误管理界面
```

## 🚀 功能特性

### 1. 自动错误捕获
- JavaScript运行时错误
- Promise未捕获异常
- HTTP请求错误
- 资源加载错误
- Vue组件错误
- 长任务监控
- 内存使用监控

### 2. 智能错误分类
- 按错误类型分类（JS错误、HTTP错误、业务错误等）
- 按错误级别分类（低、中、高、严重）
- 按错误来源分类（系统错误、网络错误、验证错误等）

### 3. 用户友好提示
- 根据错误级别显示不同类型的提示
- 支持Message、MessageBox、Notification等多种提示方式
- 自动处理特殊错误（如401未授权、403权限不足）

### 4. 完整日志记录
- 本地存储错误日志
- 支持远程上报
- 自动重试机制
- 日志清理和导出功能

### 5. 可视化管理
- 错误统计面板
- 错误列表查看
- 错误详情展示
- 批量操作支持

## 📋 错误类型

### HTTP错误类型
- `HTTP_NETWORK`: 网络连接异常
- `HTTP_TIMEOUT`: 请求超时
- `HTTP_UNAUTHORIZED`: 未授权（401）
- `HTTP_FORBIDDEN`: 权限不足（403）
- `HTTP_NOT_FOUND`: 资源不存在（404）
- `HTTP_SERVER_ERROR`: 服务器错误（5xx）
- `HTTP_BAD_REQUEST`: 请求参数错误（400）

### 业务错误类型
- `BUSINESS_ERROR`: 一般业务错误
- `VALIDATION_ERROR`: 数据验证错误

### 系统错误类型
- `SYSTEM_ERROR`: 系统异常
- `JS_ERROR`: JavaScript运行时错误
- `PROMISE_REJECTION`: Promise异常
- `RESOURCE_ERROR`: 资源加载错误

### 错误级别
- `LOW`: 低级别（信息性错误）
- `MEDIUM`: 中等级别（警告）
- `HIGH`: 高级别（错误）
- `CRITICAL`: 严重级别（致命错误）

## 🔧 使用方法

### 1. 手动处理错误

```javascript
import { handleError, ERROR_TYPES, ERROR_LEVELS } from '@/utils/errorHandler'

// 处理业务逻辑错误
try {
  // 业务代码
  await someBusinessOperation()
} catch (error) {
  handleError({
    type: ERROR_TYPES.BUSINESS_ERROR,
    level: ERROR_LEVELS.MEDIUM,
    message: '操作失败，请稍后重试',
    extra: {
      operation: 'someBusinessOperation',
      userId: getCurrentUserId(),
      data: operationData
    }
  })
}

// 处理表单验证错误
const validateForm = (formData) => {
  const errors = []
  
  if (!formData.username) {
    errors.push({ field: 'username', message: '用户名不能为空' })
  }
  
  if (errors.length > 0) {
    handleError({
      type: ERROR_TYPES.VALIDATION_ERROR,
      level: ERROR_LEVELS.MEDIUM,
      message: '表单验证失败',
      extra: { errors }
    })
    return false
  }
  
  return true
}
```

### 2. HTTP请求错误处理

HTTP错误会被自动捕获和处理，您无需手动处理。但如果需要自定义处理：

```javascript
import request from '@/utils/request'

const api = {
  async getUserInfo(id) {
    try {
      const response = await request({
        url: `/user/${id}`,
        method: 'get'
      })
      return response.data
    } catch (error) {
      // 错误已由拦截器处理，这里可以做额外处理
      console.log('获取用户信息失败:', error)
      throw error
    }
  }
}
```

### 3. 在Vue组件中使用

```javascript
export default {
  methods: {
    async submitForm() {
      try {
        await this.validateAndSubmit()
        this.$message.success('提交成功')
      } catch (error) {
        // 错误已被全局处理，这里可以做组件级别的处理
        this.resetForm()
      }
    },
    
    validateAndSubmit() {
      // 如果验证失败，手动抛出错误
      if (!this.form.username) {
        handleError({
          type: ERROR_TYPES.VALIDATION_ERROR,
          level: ERROR_LEVELS.MEDIUM,
          message: '请填写用户名',
          extra: { component: this.$options.name }
        })
        throw new Error('验证失败')
      }
      
      return this.submitToServer()
    }
  }
}
```

### 4. 日志管理

```javascript
import { 
  getLogStats, 
  clearLogs, 
  exportLogs, 
  batchReport,
  setLoggerEnabled 
} from '@/utils/errorLogger'

// 获取日志统计
const stats = getLogStats()
console.log('错误统计:', stats)

// 导出错误日志
exportLogs()

// 批量上报未上报的错误
await batchReport()

// 禁用错误日志记录
setLoggerEnabled(false)

// 清空本地日志
clearLogs()
```

## 🎛️ 配置选项

### 错误处理器配置

可以在 `errorHandler.js` 中修改配置：

```javascript
const ERROR_CONFIG = {
  // 是否显示详细错误信息（开发环境）
  showDetail: process.env.NODE_ENV === 'development',
  
  // 是否自动上报错误
  autoReport: true,
  
  // 错误重试配置
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
    retryCondition: (error) => {
      return error.type === ERROR_TYPES.HTTP_NETWORK || 
             error.type === ERROR_TYPES.HTTP_TIMEOUT
    }
  }
}
```

### 日志记录器配置

可以在 `errorLogger.js` 中修改配置：

```javascript
const MAX_LOCAL_LOGS = 100 // 本地最大存储日志数量
const reportEndpoint = '/api/error-logs' // 错误上报接口

// 设置上报端点
import { setReportEndpoint } from '@/utils/errorLogger'
setReportEndpoint('https://your-api.com/error-logs')
```

## 🔍 错误管理界面

系统提供了一个可视化的错误管理界面，路径为 `src/views/system/ErrorManagement.vue`。

主要功能：
- 📊 错误统计展示
- 📋 错误列表查看
- 🔍 错误搜索和过滤
- 📤 批量上报和导出
- 🔧 系统设置管理

要使用这个界面，需要在路由中添加相应配置：

```javascript
// router/index.js
{
  path: '/system/error-management',
  name: 'ErrorManagement',
  component: () => import('@/views/system/ErrorManagement.vue'),
  meta: {
    title: '错误管理',
    icon: 'error',
    roles: ['admin'] // 只允许管理员访问
  }
}
```

## 🧪 测试功能

在开发环境下，系统会自动添加测试方法到全局：

```javascript
// 在浏览器控制台中运行
window.testErrorHandling() // 运行所有错误处理测试
window.triggerTestErrors() // 触发真实错误进行测试
```

## 📈 监控和指标

### 错误统计指标
- 总错误数量
- 按级别分类统计
- 按类型分类统计
- 上报成功率
- 错误趋势分析

### 性能监控
- 长任务检测（>50ms）
- 内存使用监控
- 错误频率限制
- 自动清理机制

## 🚨 注意事项

### 1. 错误频率限制
系统会限制错误频率（默认每分钟最多50个错误），防止错误风暴影响性能。

### 2. 隐私保护
错误日志中不会包含敏感信息，如密码、令牌等。

### 3. 存储限制
本地存储最多保留100条错误日志，超过限制会自动清理旧日志。

### 4. 网络依赖
错误上报依赖网络连接，离线时错误会存储在本地，联网后自动上报。

### 5. 第三方脚本
系统会自动忽略第三方脚本的错误，避免噪音。

## 🔄 更新和维护

### 版本更新
定期检查和更新错误处理系统：
1. 查看错误类型是否需要扩展
2. 更新错误消息映射
3. 优化错误处理逻辑
4. 检查性能影响

### 日志清理
定期清理过期日志：
- 本地日志保留7天
- 远程日志根据服务器策略
- 可手动清理和导出

## 🆘 故障排除

### 常见问题

1. **错误没有被捕获**
   - 检查 `globalErrorListener` 是否正确初始化
   - 确认错误类型是否在支持范围内
   - 查看控制台是否有初始化错误

2. **错误上报失败**
   - 检查网络连接
   - 确认上报接口地址正确
   - 查看服务器响应状态

3. **错误提示不显示**
   - 检查 Element UI 是否正确加载
   - 确认错误级别配置
   - 查看是否被其他代码拦截

4. **日志存储异常**
   - 检查本地存储是否可用
   - 确认存储配额是否充足
   - 查看控制台错误信息

### 调试模式

开发环境下启用详细日志：

```javascript
import { updateErrorConfig } from '@/utils/errorHandler'

updateErrorConfig({
  showDetail: true
})
```

## 📞 技术支持

如有问题，请：
1. 查看控制台错误信息
2. 检查错误管理界面的统计
3. 导出错误日志进行分析
4. 联系技术团队获取支持

---

*最后更新：2024年12月*