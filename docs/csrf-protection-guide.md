# CSRF防护系统使用文档

## 概述

本CSRF防护系统为mall-admin-web管理系统提供了全面的跨站请求伪造(CSRF)防护功能。该系统采用模块化设计，支持多种防护策略，并与现有的Vue.js和Vuex生态系统无缝集成。

## 快速开始

### 1. 基础配置

在`main.js`中，CSRF防护系统已经自动集成：

```javascript
import Vue from 'vue'
import CSRFPlugin from '@/security/vue-plugin'

// CSRF防护系统会自动初始化
Vue.use(CSRFPlugin, {
  store,
  router,
  config: {
    debug: process.env.NODE_ENV === 'development'
  }
})
```

### 2. 使用SafeForm组件

SafeForm组件提供了自动的CSRF保护：

```vue
<template>
  <SafeForm
    :model-value="formData"
    :on-submit="handleSubmit"
    csrf-protection
    xss-protection
  >
    <el-form-item label="用户名">
      <el-input v-model="formData.username"></el-input>
    </el-form-item>
    
    <el-form-item label="邮箱">
      <el-input v-model="formData.email"></el-input>
    </el-form-item>
  </SafeForm>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        username: '',
        email: ''
      }
    }
  },
  
  methods: {
    async handleSubmit(formData) {
      // 表单数据已自动包含CSRF令牌
      const response = await this.$http.post('/api/users', formData)
      return response
    }
  }
}
</script>
```

### 3. 使用XSS防护组件

XSSProtection组件提供输入内容的安全过滤：

```vue
<template>
  <div>
    <XSSProtection
      v-model="userInput"
      component-type="el-input"
      protection-level="medium"
      :show-security-status="true"
      :show-threat-warning="true"
      placeholder="请输入内容"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      userInput: ''
    }
  }
}
</script>
```

## 高级用法

### 1. 手动获取CSRF令牌

```javascript
// 方法1：使用Vue实例方法
const token = await this.$csrf.getToken()

// 方法2：使用安全模块
import { getCSRFToken } from '@/security'
const token = await getCSRFToken()
```

### 2. 验证CSRF令牌

```javascript
import { validateCSRFToken } from '@/security'

const result = await validateCSRFToken(token)
if (result.valid) {
  console.log('令牌有效')
} else {
  console.log('令牌无效:', result.reason)
}
```

### 3. 自定义表单CSRF保护

对于不使用SafeForm的表单，可以使用指令：

```vue
<template>
  <form v-csrf-protect @submit="handleSubmit">
    <input type="text" name="username" v-model="username" />
    <button type="submit">提交</button>
  </form>
</template>
```

### 4. Vuex状态管理

系统提供了完整的Vuex模块：

```javascript
// 获取CSRF状态
const csrfToken = this.$store.getters.csrfToken
const isEnabled = this.$store.getters.csrfEnabled
const hasValidToken = this.$store.getters.hasValidCSRFToken

// 生成新令牌
await this.$store.dispatch('csrf/generateCSRFToken')

// 刷新令牌
await this.$store.dispatch('csrf/refreshCSRFToken')

// 清除令牌
await this.$store.dispatch('csrf/clearCSRFToken')
```

## 配置选项

### 安全级别预设

系统提供了多个安全级别预设：

```javascript
import { initializeCSRFProtection } from '@/security/csrf-init'

// 最高安全级别
await initializeCSRFProtection({
  securityPreset: 'maximum'
})

// 高安全级别
await initializeCSRFProtection({
  securityPreset: 'high'
})

// 中等安全级别（默认）
await initializeCSRFProtection({
  securityPreset: 'medium'
})

// 低安全级别
await initializeCSRFProtection({
  securityPreset: 'low'
})
```

### 自定义配置

```javascript
import { createCSRFConfig } from '@/security/csrf-config'

const config = createCSRFConfig({
  // 基本设置
  enabled: true,
  strategy: 'double-submit', // 'double-submit' | 'sync-token'
  
  // 令牌设置
  tokenLength: 32,
  expireTime: 3600000, // 1小时
  autoRefresh: true,
  refreshThreshold: 300000, // 5分钟前刷新
  
  // 存储设置
  storageType: 'cookie', // 'cookie' | 'sessionStorage' | 'localStorage' | 'memory'
  
  // 网络设置
  retryCount: 3,
  retryDelay: 1000,
  
  // 跳过的路由
  skipRoutes: ['/login', '/logout'],
  
  // 调试设置
  debug: process.env.NODE_ENV === 'development'
})
```

## API参考

### CSRFManager

主要的CSRF管理类：

```javascript
import CSRFManager from '@/security/csrf-manager'

const manager = new CSRFManager(config)

// 生成令牌
const token = await manager.generateToken()

// 获取令牌
const token = await manager.getToken()

// 验证令牌
const result = await manager.validateToken(token)

// 刷新令牌
const newToken = await manager.refreshToken()

// 清除令牌
await manager.clearToken()

// 获取请求头
const headers = await manager.getTokenHeader()

// 处理错误
const newToken = await manager.handleTokenError(error)
```

### TokenGenerator

令牌生成器：

```javascript
import TokenGenerator from '@/security/token-generator'

const generator = new TokenGenerator()

// 生成双重提交令牌
const token = generator.createDoubleSubmitToken()

// 生成同步令牌
const token = generator.createSyncToken(sessionId, secret)

// 生成随机字符串
const randomString = generator.generateRandomString(length)

// 验证令牌格式
const isValid = generator.isValidTokenFormat(token)
```

### TokenValidator

令牌验证器：

```javascript
import TokenValidator from '@/security/token-validator'

const validator = new TokenValidator()

// 验证双重提交令牌
const result = validator.validateDoubleSubmit(headerToken, cookieToken)

// 验证同步令牌
const result = validator.validateSyncToken(token, sessionId, secret)

// 检查令牌是否过期
const expiredResult = validator.isTokenExpired(timestamp)

// 验证令牌强度
const strengthResult = validator.validateTokenStrength(token)
```

## 错误处理

### CSRF错误类型

系统定义了以下CSRF错误类型：

```javascript
import { CSRF_ERROR_CODES } from '@/security/csrf-interceptor'

// 令牌缺失
CSRF_ERROR_CODES.TOKEN_MISSING

// 令牌无效
CSRF_ERROR_CODES.TOKEN_INVALID

// 令牌过期
CSRF_ERROR_CODES.TOKEN_EXPIRED

// 令牌不匹配
CSRF_ERROR_CODES.TOKEN_MISMATCH

// 验证失败
CSRF_ERROR_CODES.VALIDATION_FAILED
```

### 错误处理示例

```javascript
import { handleCSRFError } from '@/security'

try {
  const response = await this.$http.post('/api/data', formData)
} catch (error) {
  if (error.isCSRFError) {
    // 自动处理CSRF错误
    const newToken = await handleCSRFError(error, {
      onTokenRefresh: (token) => {
        console.log('令牌已刷新:', token)
      },
      onError: (error) => {
        console.error('CSRF错误处理失败:', error)
      }
    })
  } else {
    // 处理其他错误
    console.error('请求失败:', error)
  }
}
```

## 安全最佳实践

### 1. 令牌存储

- **生产环境**：使用`cookie`存储，并设置`secure: true`和`sameSite: 'strict'`
- **开发环境**：可以使用`sessionStorage`或`localStorage`便于调试
- **测试环境**：使用`memory`存储避免状态污染

### 2. 令牌过期时间

- **高敏感操作**：15-30分钟
- **常规操作**：1-2小时
- **低敏感操作**：4-8小时

### 3. 防护策略选择

- **同步令牌模式**：适用于传统服务器渲染页面
- **双重提交Cookie**：适用于单页应用和API调用（推荐）
- **SameSite Cookie**：现代浏览器的补充防护

### 4. XSS防护级别

- **strict**：最高安全级别，过滤所有可能的XSS内容
- **medium**：平衡安全性和易用性（推荐）
- **loose**：最低限度的过滤，保持内容完整性

## 性能优化

### 1. 令牌缓存

系统自动缓存有效令牌，避免频繁生成：

```javascript
// 配置缓存设置
const config = {
  performance: {
    enableMetrics: true,
    maxCacheSize: 100,
    cleanupInterval: 300000 // 5分钟清理一次
  }
}
```

### 2. 自动刷新

启用自动刷新可以减少用户遇到过期令牌的情况：

```javascript
const config = {
  autoRefresh: true,
  refreshThreshold: 300000 // 在过期前5分钟刷新
}
```

### 3. 批量操作

对于需要多次API调用的操作，先获取令牌再批量使用：

```javascript
// 获取一次令牌
const token = await this.$csrf.getToken()

// 批量使用
const promises = data.map(item => 
  this.$http.post('/api/items', item, {
    headers: { 'X-CSRF-Token': token }
  })
)

await Promise.all(promises)
```

## 故障排除

### 常见问题

1. **令牌验证失败**
   - 检查时钟同步
   - 验证存储配置
   - 查看网络请求头

2. **自动刷新不工作**
   - 确认`autoRefresh`已启用
   - 检查`refreshThreshold`设置
   - 查看浏览器控制台错误

3. **跨域问题**
   - 配置CORS允许CSRF头部
   - 检查`sameSite`设置
   - 验证域名配置

### 调试模式

启用调试模式获取详细日志：

```javascript
const config = {
  debug: true,
  logLevel: 'debug'
}
```

### 性能监控

启用性能指标监控：

```javascript
const config = {
  performance: {
    enableMetrics: true,
    metricsInterval: 60000
  }
}
```

## 更新日志

### v1.0.0
- 初始版本发布
- 支持双重提交Cookie和同步令牌模式
- 集成Vue.js和Vuex
- 提供SafeForm和XSSProtection组件
- 完整的单元测试覆盖

---

## 技术支持

如果在使用过程中遇到问题，请：

1. 查看浏览器控制台日志
2. 检查网络请求详情
3. 验证配置是否正确
4. 参考本文档的故障排除部分

更多技术细节请参考源代码注释和单元测试用例。