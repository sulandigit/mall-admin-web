# CSP（内容安全策略）实施指南

## 📋 目录

1. [概述](#概述)
2. [快速开始](#快速开始)
3. [配置详解](#配置详解)
4. [开发指南](#开发指南)
5. [部署指南](#部署指南)
6. [监控与维护](#监控与维护)
7. [故障排除](#故障排除)
8. [最佳实践](#最佳实践)
9. [API参考](#api参考)

## 概述

本项目已集成了完整的内容安全策略（CSP）实施方案，为商城管理后台系统提供强化的安全防护。CSP通过控制页面可以加载的资源类型和来源，有效防止XSS攻击、数据注入攻击和其他代码注入攻击。

### 🔐 安全防护能力

- **XSS防护**: 阻止恶意脚本注入和执行
- **数据泄露防护**: 限制数据传输目标域名
- **点击劫持防护**: 防止页面被恶意嵌入
- **混合内容防护**: 强制使用HTTPS加载资源
- **插件攻击防护**: 禁用危险的浏览器插件

### 📁 文件结构

```
build/
├── csp-config.js           # CSP策略配置模块
├── csp-webpack-plugin.js   # Webpack集成插件
├── csp-report-server.js    # 违规报告收集服务
├── csp-test.js            # 基础测试工具
├── csp-test-suite.js      # 完整测试套件
├── csp-demo.js            # 演示和展示工具
├── build-with-csp.js      # CSP增强构建脚本
└── webpack.*.conf.js      # 已更新的Webpack配置

config/
└── csp.env.js             # 环境配置文件

src/utils/
└── csp-reporter.js        # 客户端报告收集器
```

## 快速开始

### 1. 查看CSP策略配置

```bash
# 查看所有环境的CSP策略
npm run csp:demo

# 查看特定环境
npm run csp:demo -- --env production

# 比较不同环境
npm run csp:demo -- --compare
```

### 2. 验证CSP配置

```bash
# 运行完整测试套件
npm run csp:test-suite

# 生成测试报告
npm run csp:test-report

# 验证浏览器兼容性
npm run csp:validate
```

### 3. 开发环境测试

```bash
# 启动CSP违规报告服务器（开发调试用）
npm run csp:server

# 启动开发服务器（已集成CSP）
npm run dev
```

### 4. 构建生产版本

```bash
# 标准构建
npm run build

# CSP增强构建（推荐）
npm run build:csp
```

## 配置详解

### 环境配置

系统支持三种环境的不同CSP策略：

#### 🔧 开发环境 (Development)
- **模式**: Report-Only（仅报告，不阻止）
- **安全级别**: 宽松
- **unsafe-inline**: 允许（便于开发调试）
- **unsafe-eval**: 允许（支持热重载）
- **域名限制**: 包含localhost和开发域名

#### 🧪 测试环境 (Testing)  
- **模式**: Enforcing（强制执行）
- **安全级别**: 中等
- **unsafe-inline**: 允许（保持开发灵活性）
- **unsafe-eval**: 允许（支持测试工具）
- **域名限制**: 中等严格

#### 🚀 生产环境 (Production)
- **模式**: Enforcing（强制执行）
- **安全级别**: 严格
- **unsafe-inline**: 临时允许（现有代码兼容）
- **unsafe-eval**: 临时允许（第三方脚本兼容）
- **域名限制**: 最严格白名单

### CSP指令说明

| 指令 | 用途 | 配置示例 |
|------|------|----------|
| `default-src` | 默认源策略 | `'self'` |
| `script-src` | 脚本源控制 | `'self' 'unsafe-inline' *.googleapis.com` |
| `style-src` | 样式源控制 | `'self' 'unsafe-inline' fonts.googleapis.com` |
| `img-src` | 图片源控制 | `'self' data: blob: *.baidu.com` |
| `connect-src` | 连接源控制 | `'self' *.macrozheng.com localhost:8080` |
| `font-src` | 字体源控制 | `'self' fonts.gstatic.com data:` |
| `object-src` | 对象嵌入控制 | `'none'` |
| `base-uri` | Base URI限制 | `'self'` |
| `form-action` | 表单提交限制 | `'self'` |

## 开发指南

### 在现有项目中集成CSP

#### 1. 自动集成（推荐）

CSP已经自动集成到Webpack构建流程中：

```javascript
// webpack.dev.conf.js 已包含
new CSPWebpackPlugin.forDevelopment({
  verbose: true,
  cspOptions: {
    enableReporting: true,
    reportUri: '/api/csp-report-dev'
  }
})

// webpack.prod.conf.js 已包含  
new CSPWebpackPlugin.forProduction({
  cspOptions: {
    enableReporting: true,
    reportUri: '/api/csp-report'
  }
})
```

#### 2. 手动配置

如需自定义配置，可以修改 `config/csp.env.js`：

```javascript
// 生产环境自定义配置
const productionConfig = {
  cspOptions: {
    allowUnsafe: false,  // 禁用不安全策略
    enableReporting: true,
    reportUri: '/api/custom-csp-report'
  },
  pluginOptions: {
    reportOnly: false,
    verbose: true
  }
}
```

### 处理CSP违规

#### 1. 监听违规事件

```javascript
// 在main.js中添加
import { initCSPReporter } from '@/utils/csp-reporter'

// 初始化CSP报告器
initCSPReporter({
  verbose: true,
  storage: {
    type: 'api',
    endpoint: '/api/csp-report'
  }
})
```

#### 2. 查看违规报告

```bash
# 启动报告收集服务器
npm run csp:server

# 查看违规统计
curl http://localhost:3001/api/csp-stats

# 查看最近的违规报告
curl http://localhost:3001/api/csp-reports?count=10
```

### 常见开发场景处理

#### 1. 添加新的外部域名

修改 `build/csp-config.js` 中的域名配置：

```javascript
const DOMAINS = {
  // 添加新的第三方服务域名
  thirdParty: [
    'newservice.example.com',
    '*.newcdn.com'
  ]
}
```

#### 2. 处理内联脚本

如果需要使用内联脚本，建议使用nonce或hash：

```html
<!-- 使用nonce -->
<script nonce="random-nonce-value">
  // 内联脚本代码
</script>
```

```javascript
// CSP配置中添加nonce支持
'script-src': "'self' 'nonce-random-nonce-value'"
```

#### 3. 处理动态内容

对于Vue组件中的`v-html`指令，确保内容已经过安全过滤：

```vue
<template>
  <!-- 避免直接使用用户输入 -->
  <div v-html="sanitizedContent"></div>
</template>

<script>
import DOMPurify from 'dompurify'

export default {
  computed: {
    sanitizedContent() {
      return DOMPurify.sanitize(this.rawContent)
    }
  }
}
</script>
```

## 部署指南

### 1. 服务器配置

#### Nginx配置示例

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # CSP违规报告端点
    location /api/csp-report {
        proxy_pass http://backend:3000/csp-report;
        proxy_set_header Content-Type application/json;
    }
    
    # 静态文件服务
    location / {
        root /var/www/dist;
        try_files $uri $uri/ /index.html;
        
        # 额外的安全头
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header Referrer-Policy strict-origin-when-cross-origin;
    }
}
```

#### Apache配置示例

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /var/www/dist
    
    # CSP违规报告代理
    ProxyPass /api/csp-report http://backend:3000/csp-report
    ProxyPassReverse /api/csp-report http://backend:3000/csp-report
    
    # 安全头
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set Referrer-Policy strict-origin-when-cross-origin
</VirtualHost>
```

### 2. 后端API集成

#### Express.js集成示例

```javascript
const express = require('express')
const { CSPReportServer } = require('./build/csp-report-server')

const app = express()
const cspReportServer = new CSPReportServer({
  logDir: './logs',
  verbose: true
})

// 使用CSP报告中间件
app.use(cspReportServer.createExpressMiddleware())

// 或者手动处理
app.post('/api/csp-report', express.json(), (req, res) => {
  const success = cspReportServer.handleReport(req.body)
  res.json({ success })
})
```

### 3. 渐进式部署策略

#### 阶段1: 观察模式（1-2周）

1. 启用Report-Only模式
2. 收集违规报告
3. 分析常见违规模式
4. 调整策略配置

```javascript
// 临时使用report-only模式
const prodConfig = {
  pluginOptions: {
    reportOnly: true,  // 暂时只报告，不阻止
    verbose: true
  }
}
```

#### 阶段2: 逐步强化（1-2周）

1. 修复主要违规问题
2. 启用部分指令的强制模式
3. 继续监控报告
4. 优化白名单配置

#### 阶段3: 全面启用（持续）

1. 启用完整强制模式
2. 建立日常监控流程
3. 定期审查和更新策略
4. 响应新的安全威胁

## 监控与维护

### 1. 违规监控设置

#### 设置报告收集

```javascript
// 生产环境报告配置
const reportingConfig = {
  // 报告端点
  reportUri: '/api/csp-report',
  
  // 报告过滤
  filter: {
    // 忽略浏览器扩展
    ignoreUris: [
      /chrome-extension:/,
      /moz-extension:/
    ],
    
    // 报告频率限制
    maxReports: 1000
  },
  
  // 告警阈值
  alertThreshold: 50
}
```

#### 监控仪表板

使用提供的工具查看违规统计：

```bash
# 查看实时统计
curl http://yourserver.com/api/csp-stats

# 获取违规报告
curl http://yourserver.com/api/csp-reports?count=50
```

### 2. 日常维护任务

#### 每日检查

- [ ] 查看CSP违规报告数量
- [ ] 检查新的违规类型
- [ ] 验证关键业务功能正常

#### 每周检查

- [ ] 分析违规趋势
- [ ] 更新域名白名单
- [ ] 检查安全策略有效性

#### 每月检查

- [ ] 审查整体安全策略
- [ ] 更新威胁模型
- [ ] 测试应急响应流程

### 3. 告警配置

#### 基于频率的告警

```javascript
// 在报告处理器中设置告警
const alertConfig = {
  // 单个违规类型超过阈值
  violationThreshold: 10,
  
  // 总违规数超过阈值  
  totalThreshold: 100,
  
  // 时间窗口（分钟）
  timeWindow: 60,
  
  // 告警处理函数
  onAlert: (violation, count) => {
    console.error(`CSP Alert: ${violation} occurred ${count} times`)
    // 发送邮件、推送通知等
  }
}
```

## 故障排除

### 常见问题及解决方案

#### 1. 🚫 页面功能异常

**症状**: 页面部分功能不工作，控制台出现CSP违规错误

**解决步骤**:
```bash
# 1. 查看具体违规信息
npm run dev  # 开发模式下查看控制台

# 2. 分析违规原因
npm run csp:demo -- --env development

# 3. 临时使用report-only模式
# 修改webpack.dev.conf.js中的reportOnly为true

# 4. 更新CSP策略
# 在csp-config.js中添加需要的域名或指令
```

#### 2. 📊 第三方统计代码失效

**症状**: Google Analytics、百度统计等不工作

**解决方案**:
```javascript
// 在csp-config.js中确保包含统计域名
const DOMAINS = {
  google: [
    '*.googleapis.com',
    '*.googletagmanager.com',
    '*.google-analytics.com'  // 添加这行
  ],
  baidu: [
    '*.baidu.com',
    'hm.baidu.com'
  ]
}
```

#### 3. 🖼️ 图片或字体加载失败

**症状**: 外部图片或字体无法加载

**解决方案**:
```javascript
// 更新img-src和font-src策略
imgSrc: (isDev = false) => {
  const sources = [DOMAINS.self, 'data:', 'blob:']
  // 添加图片CDN域名
  sources.push('*.example-cdn.com')
  return sources.join(' ')
}
```

#### 4. 🔄 AJAX请求被阻止

**症状**: API调用失败，connect-src违规

**解决方案**:
```javascript
// 更新connect-src策略
connectSrc: (isDev = false) => {
  const sources = [DOMAINS.self]
  // 添加API域名
  sources.push('api.yourdomain.com', '*.api-service.com')
  return sources.join(' ')
}
```

### 调试工具使用

#### 1. 详细违规信息

```javascript
// 在浏览器控制台中查看详细违规信息
document.addEventListener('securitypolicyviolation', (event) => {
  console.group('CSP Violation')
  console.log('Blocked URI:', event.blockedURI)
  console.log('Violated Directive:', event.violatedDirective)
  console.log('Original Policy:', event.originalPolicy)
  console.log('Source File:', event.sourceFile)
  console.log('Line Number:', event.lineNumber)
  console.groupEnd()
})
```

#### 2. 策略测试

```bash
# 测试特定环境的策略
npm run csp:test -- env production

# 运行完整兼容性测试
npm run csp:validate

# 性能影响测试
npm run csp:test -- perf
```

#### 3. 实时监控

```bash
# 启动开发环境监控服务
npm run csp:server &
npm run dev

# 在另一个终端查看实时报告
watch -n 5 'curl -s http://localhost:3001/api/csp-stats'
```

## 最佳实践

### 1. 🔒 安全最佳实践

#### 逐步收紧策略

```javascript
// 阶段1: 宽松策略（兼容性优先）
'script-src': "'self' 'unsafe-inline' 'unsafe-eval' *"

// 阶段2: 中等策略（移除通配符）
'script-src': "'self' 'unsafe-inline' 'unsafe-eval' trusted-domain.com"

// 阶段3: 严格策略（移除unsafe）
'script-src': "'self' 'nonce-12345' trusted-domain.com"
```

#### 使用nonce替代unsafe-inline

```javascript
// Webpack配置中生成nonce
const nonce = require('crypto').randomBytes(16).toString('base64')

new HtmlWebpackPlugin({
  templateParameters: {
    cspNonce: nonce
  }
})

// HTML模板中使用
<script nonce="<%= cspNonce %>">
  // 内联脚本
</script>
```

### 2. 🚀 性能最佳实践

#### 优化策略长度

```javascript
// 避免过长的域名列表
// 不好的做法
'script-src': "'self' domain1.com domain2.com domain3.com ..."

// 好的做法  
'script-src': "'self' *.trusted-cdn.com"
```

#### 缓存策略配置

```javascript
// 在webpack中缓存CSP配置
const cspCache = new Map()

function getCachedCSP(env) {
  if (!cspCache.has(env)) {
    cspCache.set(env, generateCSPForEnvironment(env))
  }
  return cspCache.get(env)
}
```

### 3. 🔧 开发最佳实践

#### 分环境管理

```javascript
// 使用环境变量控制CSP严格程度
const strictness = process.env.CSP_STRICTNESS || 'medium'

const strictnessLevels = {
  low: { allowUnsafe: true, reporting: false },
  medium: { allowUnsafe: true, reporting: true },
  high: { allowUnsafe: false, reporting: true }
}
```

#### 自动化测试集成

```javascript
// 在CI/CD中集成CSP测试
// package.json
{
  "scripts": {
    "test:csp": "npm run csp:test-suite",
    "pretest": "npm run test:csp"
  }
}
```

#### 文档化策略变更

```javascript
// 在代码中记录策略变更原因
const DOMAIN_WHITELIST = {
  // 2024-01-15: 添加新的支付服务域名
  payment: ['pay.example.com'],
  
  // 2024-01-20: 添加新的CDN域名提升加载速度  
  cdn: ['*.fastcdn.com']
}
```

### 4. 📊 监控最佳实践

#### 设置合理的告警阈值

```javascript
const alertThresholds = {
  // 开发环境：更宽松
  development: { maxViolations: 1000, timeWindow: 3600 },
  
  // 生产环境：更严格
  production: { maxViolations: 50, timeWindow: 300 }
}
```

#### 分类处理违规

```javascript
const violationCategories = {
  critical: ['script-src', 'object-src'],    // 立即处理
  important: ['style-src', 'img-src'],       // 24小时内处理  
  minor: ['font-src', 'media-src']           // 一周内处理
}
```

## API参考

### CSP配置模块 (csp-config.js)

#### `generateCSPForEnvironment(env, options)`

生成指定环境的CSP策略。

**参数**:
- `env` (string): 环境名称 ('development', 'testing', 'production')
- `options` (object): 可选配置

**返回值**:
```javascript
{
  policy: {},           // CSP策略对象
  policyString: '',     // CSP策略字符串
  validation: {},       // 验证结果
  environment: ''       // 环境名称
}
```

**示例**:
```javascript
const { generateCSPForEnvironment } = require('./build/csp-config')

const result = generateCSPForEnvironment('production', {
  allowUnsafe: false,
  enableReporting: true,
  reportUri: '/api/csp-violations'
})

console.log(result.policyString)
```

#### `validatePolicy(policy)`

验证CSP策略的有效性。

**参数**:
- `policy` (object): CSP策略对象

**返回值**:
```javascript
{
  isValid: true,        // 是否有效
  issues: [],           // 问题列表
  warnings: []          // 警告列表
}
```

### CSP Webpack插件 (csp-webpack-plugin.js)

#### `new CSPWebpackPlugin(options)`

创建CSP Webpack插件实例。

**选项**:
```javascript
{
  environment: 'production',    // 环境
  cspOptions: {},              // CSP配置选项
  reportOnly: false,           // 是否仅报告模式
  verbose: false,              // 是否输出详细信息
  validate: true               // 是否验证策略
}
```

#### 静态方法

```javascript
// 开发环境实例
CSPWebpackPlugin.forDevelopment(options)

// 生产环境实例  
CSPWebpackPlugin.forProduction(options)

// 测试环境实例
CSPWebpackPlugin.forTesting(options)
```

### CSP报告服务器 (csp-report-server.js)

#### `new CSPReportServer(options)`

创建CSP报告服务器实例。

**选项**:
```javascript
{
  logDir: './logs',            // 日志目录
  logFile: 'csp-violations.log',  // 日志文件名
  verbose: true,               // 详细输出
  maxLogSize: 10485760,        // 最大日志大小
  maxLogFiles: 5               // 保留文件数量
}
```

#### 方法

```javascript
const server = new CSPReportServer()

// 处理违规报告
server.handleReport(reportObject)

// 获取统计信息
server.getStatistics()

// 获取最近报告
server.getRecentReports(count)

// 创建Express中间件
app.use(server.createExpressMiddleware())
```

### CSP报告器 (csp-reporter.js)

#### `initCSPReporter(options)`

初始化客户端CSP报告器。

**选项**:
```javascript
{
  verbose: true,               // 详细输出
  storage: {
    type: 'api',              // 存储类型
    endpoint: '/api/csp-report'  // API端点
  },
  filter: {
    ignoreUris: [],           // 忽略的URI模式
    maxReports: 100           // 最大报告数
  }
}
```

**示例**:
```javascript
import { initCSPReporter } from '@/utils/csp-reporter'

initCSPReporter({
  verbose: true,
  storage: {
    type: 'api',
    endpoint: '/api/csp-report'
  }
})
```

---

## 🆘 获取帮助

如果遇到问题，可以通过以下方式获取帮助：

1. **查看内置帮助**:
   ```bash
   npm run csp:demo -- --help
   npm run csp:test-suite -- --help
   ```

2. **运行诊断**:
   ```bash
   npm run csp:test-suite --report
   ```

3. **检查配置**:
   ```bash
   npm run csp:validate
   ```

4. **查看演示**:
   ```bash
   npm run csp:demo --all
   ```

CSP策略实施是一个持续的过程，需要根据应用的发展不断调整和优化。建议定期审查和更新策略，确保既保障安全性又不影响用户体验。