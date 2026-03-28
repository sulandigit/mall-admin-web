# API调用失败自动重试功能使用说明

## 概述

本项目已实现完整的API调用失败自动重试功能，支持智能重试策略、自定义配置和详细的日志记录。该功能可以大大提高应用的稳定性和用户体验。

## 🚀 主要特性

- ✅ **自动重试机制**: 网络错误和服务器错误自动重试
- ✅ **智能重试策略**: 根据API类型自动选择最佳重试策略
- ✅ **指数退避算法**: 避免服务器压力过大
- ✅ **自定义配置**: 支持为特定API设置重试参数
- ✅ **详细日志**: 完整的重试过程记录和统计
- ✅ **便捷方法**: 提供预定义的重试策略
- ✅ **并发安全**: 支持多个请求并发重试

## 📁 文件结构

```
src/
├── utils/
│   ├── request.js          # 增强的axios实例，集成重试功能
│   └── retryConfig.js      # 重试配置和策略管理
├── api/
│   ├── retryExamples.js    # 重试功能使用示例
│   └── order.js            # 更新的订单API示例
└── tests/
    └── retry.test.js       # 重试功能单元测试
```

## 🔧 基础用法

### 1. 自动重试（推荐）

大部分情况下，您无需修改现有代码。系统会根据API路径自动应用合适的重试策略：

```javascript
import request from '@/utils/request'

// 系统自动为订单相关API应用关键业务策略（5次重试）
export function createOrder(data) {
  return request({
    url: '/order/create',
    method: 'post',
    data: data
  })
}

// 系统自动为查询类API应用标准策略（3次重试）
export function fetchProductList(params) {
  return request({
    url: '/product/list',
    method: 'get',
    params: params
  })
}

// 系统自动为登录API应用快速失败策略（1次重试）
export function userLogin(credentials) {
  return request({
    url: '/admin/login',
    method: 'post',
    data: credentials
  })
}
```

### 2. 自定义重试配置

为特定请求设置自定义重试参数：

```javascript
// 自定义重试次数和延迟
export function importantOperation(data) {
  return request({
    url: '/important/operation',
    method: 'post',
    data: data,
    retry: {
      retries: 5,           // 重试5次
      retryDelay: 2000,     // 基础延迟2秒
      retryDelayMax: 20000, // 最大延迟20秒
      retryDelayMultiplier: 1.5 // 延迟倍数
    }
  })
}

// 自定义重试条件
export function sensitiveAPI(data) {
  return request({
    url: '/sensitive/api',
    method: 'post',
    data: data,
    retry: {
      retries: 3,
      retryCondition: (error) => {
        // 只对网络错误和5xx错误重试
        if (!error.response) return true
        return error.response.status >= 500
      }
    }
  })
}
```

### 3. 使用预定义策略

```javascript
// 关键业务操作 - 高重试次数
const criticalRequest = request.createCriticalRequest()
export function processPayment(data) {
  return criticalRequest({
    url: '/payment/process',
    method: 'post',
    data: data
  })
}

// 快速失败操作 - 低重试次数
const fastFailRequest = request.createFastFailRequest()
export function uploadFile(file) {
  return fastFailRequest({
    url: '/upload/file',
    method: 'post',
    data: file
  })
}

// 禁用重试 - 敏感操作
const noRetryRequest = request.createNoRetryRequest()
export function deleteUser(id) {
  return noRetryRequest({
    url: `/user/delete/${id}`,
    method: 'delete'
  })
}
```

## ⚙️ 重试策略

系统提供4种预定义重试策略：

### 1. CRITICAL（关键策略）
- **适用**: 订单、支付、关键业务操作
- **重试次数**: 5次
- **基础延迟**: 2秒
- **最大延迟**: 30秒

### 2. NORMAL（标准策略）
- **适用**: 一般查询、数据获取
- **重试次数**: 3次
- **基础延迟**: 1秒
- **最大延迟**: 10秒

### 3. FAST_FAIL（快速失败策略）
- **适用**: 文件上传、实时数据
- **重试次数**: 1次
- **基础延迟**: 500毫秒
- **最大延迟**: 2秒

### 4. NO_RETRY（无重试策略）
- **适用**: 登出、删除等敏感操作
- **重试次数**: 0次

## 🔍 重试条件

系统默认对以下错误进行重试：

✅ **会重试的错误**:
- 网络错误（无响应）
- 5xx 服务器内部错误
- 408 请求超时
- 429 请求过多

❌ **不会重试的错误**:
- 400 错误请求
- 401 未授权
- 403 禁止访问
- 404 未找到

## 📊 监控和调试

### 查看重试日志

```javascript
import { getRetryStats, clearRetryLogs } from '@/utils/retryConfig'

// 获取重试统计信息
const stats = getRetryStats()
console.log('重试日志:', stats.logs)
console.log('重试统计:', stats.summary)

// 清除重试日志
clearRetryLogs()
```

### 日志格式

重试过程会产生详细的日志：

```javascript
{
  timestamp: \"2023-10-10T10:30:00.000Z\",
  level: \"warn\",
  message: \"[RETRY] POST /order/create - 第1次重试，2000ms后执行\",
  url: \"/order/create\",
  method: \"POST\",
  attempt: 1,
  totalAttempts: 5,
  delay: 2000,
  error: {
    message: \"Network Error\",
    status: null,
    code: null
  }
}
```

## 🧪 测试

运行重试功能测试：

```bash
# 进入测试目录
cd tests

# 安装测试依赖
npm install

# 运行测试
npm test

# 运行覆盖率测试
npm run test:coverage
```

## 📝 最佳实践

### 1. API路径映射配置

在 `retryConfig.js` 中配置您的API路径映射：

```javascript
export const API_RETRY_MAPPING = {
  // 关键业务
  '/order/': RETRY_STRATEGIES.CRITICAL,
  '/payment/': RETRY_STRATEGIES.CRITICAL,
  
  // 标准操作
  '/product/list': RETRY_STRATEGIES.NORMAL,
  '/user/list': RETRY_STRATEGIES.NORMAL,
  
  // 快速失败
  '/upload/': RETRY_STRATEGIES.FAST_FAIL,
  '/realtime/': RETRY_STRATEGIES.FAST_FAIL,
  
  // 不重试
  '/admin/logout': RETRY_STRATEGIES.NO_RETRY
}
```

### 2. 错误处理

```javascript
export async function robustAPICall() {
  try {
    const result = await request({
      url: '/api/endpoint',
      method: 'post',
      data: { /* ... */ }
    })
    return result
  } catch (error) {
    // 重试失败后的业务处理
    console.error('API调用失败:', error.message)
    
    // 可以根据错误类型进行不同处理
    if (error.response?.status === 401) {
      // 处理认证错误
      redirectToLogin()
    } else {
      // 显示用户友好的错误信息
      showErrorMessage('操作失败，请稍后重试')
    }
    
    throw error
  }
}
```

### 3. 批量操作

```javascript
export async function batchOperation(items) {
  const results = []
  
  for (const item of items) {
    try {
      const result = await request({
        url: '/api/process',
        method: 'post',
        data: item,
        retry: {
          retries: 2, // 批量操作中减少重试次数
          retryCondition: (error) => {
            // 批量操作中避免对数据错误重试
            if (!error.response) return true
            return error.response.status >= 500
          }
        }
      })
      results.push({ success: true, data: result })
    } catch (error) {
      results.push({ success: false, error: error.message })
    }
  }
  
  return results
}
```

## ⚠️ 注意事项

1. **超时配置**: 重试会增加总的请求时间，请合理设置timeout
2. **服务器压力**: 避免设置过高的重试次数，以免给服务器造成压力
3. **用户体验**: 对于用户界面操作，建议显示重试状态
4. **幂等性**: 确保重试的API操作是幂等的
5. **监控**: 定期检查重试统计，优化重试策略

## 🔧 高级配置

### 全局重试配置修改

如需修改全局默认配置，请编辑 `request.js` 中的 `DEFAULT_RETRY_CONFIG`:

```javascript
const DEFAULT_RETRY_CONFIG = {
  retries: 3,                    // 默认重试次数
  retryDelay: 1000,             // 基础延迟（毫秒）
  retryDelayMultiplier: 2,      // 延迟倍数
  retryDelayMax: 10000,         // 最大延迟
  retryCondition: isRetryableError, // 重试条件函数
  shouldRetry: true             // 全局重试开关
}
```

### 自定义重试策略

创建新的重试策略：

```javascript
// 在 retryConfig.js 中添加新策略
export const CUSTOM_STRATEGY = {
  retries: 7,
  retryDelay: 3000,
  retryDelayMultiplier: 1.8,
  retryDelayMax: 45000,
  description: '自定义策略：超高重试次数'
}

// 使用自定义策略
const customRequest = request.createRequest(CUSTOM_STRATEGY)
```

## 📞 技术支持

如果您在使用过程中遇到问题，请：

1. 查看浏览器控制台的重试日志
2. 检查网络状况和服务器状态
3. 确认API路径映射配置
4. 运行单元测试验证功能

祝您使用愉快！ 🎉