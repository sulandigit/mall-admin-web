# Mall Admin Web - CSRF防护系统

## 概述

本项目为mall-admin-web管理系统集成了完整的CSRF（跨站请求伪造）防护系统。该防护系统采用现代化的架构设计，提供多层安全防护，确保系统免受CSRF攻击。

## 特性

### 🛡️ 多重防护策略
- **双重提交Cookie模式**：适用于单页应用和API调用
- **同步令牌模式**：适用于传统服务器渲染页面
- **SameSite Cookie**：现代浏览器的补充防护

### 🔧 灵活的配置选项
- 多种安全级别预设（最高、高、中、低）
- 可自定义令牌长度、过期时间、存储方式
- 支持跳过特定路由和请求方法

### 🏗️ 模块化架构
- **令牌管理器**：统一管理CSRF令牌生命周期
- **令牌生成器**：支持多种算法的安全令牌生成
- **令牌验证器**：全面的令牌有效性验证
- **存储管理器**：支持Cookie、Storage、内存等多种存储方式

### 🎨 Vue.js集成
- **SafeForm组件**：自动CSRF保护的安全表单组件
- **XSSProtection组件**：输入内容XSS防护组件
- **Vuex模块**：全局状态管理
- **Vue插件**：一键安装和配置

### 🚀 自动化功能
- 自动令牌生成和刷新
- 智能错误处理和重试
- 透明的HTTP请求拦截
- 性能监控和日志记录

## 快速开始

### 1. 系统要求

- Vue.js 2.x
- Vuex 3.x
- Axios (用于HTTP请求)
- Element UI (UI组件库)
- Node.js >= 12.0.0

### 2. 安装依赖

```bash
npm install crypto-js
```

### 3. 基础配置

CSRF防护系统已在`main.js`中自动配置：

```javascript
import Vue from 'vue'
import CSRFPlugin from '@/security/vue-plugin'

Vue.use(CSRFPlugin, {
  store,
  router,
  config: {
    debug: process.env.NODE_ENV === 'development'
  }
})
```

### 4. 使用SafeForm组件

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
  </SafeForm>
</template>
```

## 项目结构

```
src/
├── security/                 # CSRF防护核心模块
│   ├── csrf-manager.js       # CSRF管理器
│   ├── token-generator.js    # 令牌生成器
│   ├── token-validator.js    # 令牌验证器
│   ├── token-storage.js      # 存储管理器
│   ├── csrf-interceptor.js   # HTTP拦截器
│   ├── csrf-config.js        # 配置管理
│   ├── csrf-init.js          # 初始化模块
│   ├── vue-plugin.js         # Vue插件
│   └── index.js              # 入口文件
├── components/
│   └── Security/             # 安全组件
│       ├── SafeForm.vue      # 安全表单组件
│       ├── XSSProtection.vue # XSS防护组件
│       └── index.js          # 组件入口
├── store/
│   └── modules/
│       └── csrf.js           # CSRF状态管理模块
├── utils/
│   └── request.js            # HTTP请求工具（已集成CSRF）
├── docs/                     # 文档
│   └── csrf-protection-guide.md
├── examples/                 # 示例
│   └── csrf-demo.vue
└── tests/                    # 测试
    └── unit/
        └── security/         # 安全模块测试
```

## 安全配置

### 生产环境配置

```javascript
const productionConfig = {
  strategy: 'double-submit',
  tokenLength: 32,
  expireTime: 3600000,        // 1小时
  storageType: 'cookie',
  cookieOptions: {
    secure: true,             // HTTPS环境
    sameSite: 'strict',       // 严格的SameSite策略
    httpOnly: false           // 前端需要访问
  },
  retryCount: 2,
  debug: false
}
```

### 开发环境配置

```javascript
const developmentConfig = {
  strategy: 'double-submit',
  tokenLength: 32,
  expireTime: 86400000,       // 24小时（便于开发）
  storageType: 'sessionStorage',
  retryCount: 10,
  debug: true,
  errorHandling: {
    fallbackToNoCSRF: true    // 开发时允许降级
  }
}
```

## API参考

### 核心API

```javascript
// 获取CSRF令牌
const token = await this.$csrf.getToken()

// 验证令牌
const result = await this.$csrf.validateToken(token)

// 刷新令牌
const newToken = await this.$csrf.refreshToken()

// 创建安全表单数据
const secureData = await this.$csrf.createSecureFormData(formData)
```

### Vuex状态管理

```javascript
// 获取状态
const csrfToken = this.$store.getters.csrfToken
const isEnabled = this.$store.getters.csrfEnabled

// 分发动作
await this.$store.dispatch('csrf/generateCSRFToken')
await this.$store.dispatch('csrf/refreshCSRFToken')
```

## 组件使用

### SafeForm安全表单

```vue
<SafeForm
  :model-value="formData"
  :on-submit="handleSubmit"
  :rules="formRules"
  csrf-protection            <!-- 启用CSRF保护 -->
  xss-protection            <!-- 启用XSS防护 -->
  :show-security-status="true"
  :max-retries="3"
  submit-text="提交"
  @submit-success="onSuccess"
  @submit-error="onError"
>
  <!-- 表单内容 -->
</SafeForm>
```

### XSSProtection防护组件

```vue
<XSSProtection
  v-model="userInput"
  component-type="el-input"
  protection-level="medium"  <!-- strict/medium/loose -->
  :show-security-status="true"
  :show-threat-warning="true"
  @threat-detected="onThreatDetected"
/>
```

## 测试

### 运行单元测试

```bash
# 运行所有安全模块测试
npm run test:security

# 运行特定测试文件
npm run test tests/unit/security/csrf-manager.test.js

# 生成覆盖率报告
npm run test:coverage
```

### 测试覆盖率目标

- **总体覆盖率**: 80%+
- **CSRF管理器**: 85%+
- **令牌生成器**: 90%+
- **令牌验证器**: 90%+

## 性能监控

### 启用性能指标

```javascript
const config = {
  performance: {
    enableMetrics: true,
    metricsInterval: 60000,   // 1分钟报告一次
    maxCacheSize: 100,
    cleanupInterval: 300000   // 5分钟清理一次
  }
}
```

### 监控指标

- 令牌生成次数和耗时
- 令牌验证成功/失败率
- 令牌刷新频率
- 错误发生率和类型
- 存储性能指标

## 故障排除

### 常见问题

1. **令牌验证失败**
   ```bash
   # 检查服务器时间同步
   # 验证CORS配置
   # 查看浏览器控制台错误
   ```

2. **自动刷新不工作**
   ```javascript
   // 确认配置
   autoRefresh: true,
   refreshThreshold: 300000
   ```

3. **跨域问题**
   ```javascript
   // 服务器CORS配置
   Access-Control-Allow-Headers: X-CSRF-Token
   ```

### 调试模式

```javascript
// 启用详细日志
const config = {
  debug: true,
  logLevel: 'debug'
}
```

## 安全最佳实践

### 1. 令牌配置
- 生产环境使用32位以上令牌长度
- 设置合理的过期时间（1-4小时）
- 启用自动刷新机制

### 2. 存储安全
- 生产环境使用secure cookie
- 设置strict SameSite策略
- 避免在localStorage中存储敏感令牌

### 3. 网络安全
- 仅在HTTPS环境下启用
- 配置正确的CORS策略
- 监控异常请求模式

### 4. 代码安全
- 定期更新依赖
- 进行安全代码审查
- 实施安全测试

## 版本历史

### v1.0.0 (当前版本)
- ✅ 完整的CSRF防护系统
- ✅ 双重提交Cookie和同步令牌模式
- ✅ Vue.js和Vuex集成
- ✅ SafeForm和XSSProtection组件
- ✅ 全面的单元测试覆盖
- ✅ 详细的文档和示例

## 贡献指南

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 技术支持

- 📖 [完整文档](docs/csrf-protection-guide.md)
- 🧪 [演示页面](examples/csrf-demo.vue)
- 🔍 [测试用例](tests/unit/security/)
- 📊 [性能基准测试](benchmarks/)

---

⚠️ **安全提醒**: 请确保在生产环境中正确配置CSRF防护系统，并定期更新到最新版本以获得最佳安全保护。