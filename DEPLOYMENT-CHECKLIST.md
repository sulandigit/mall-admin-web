# CSRF防护系统部署清单

## 部署前检查

### 1. 代码完整性验证

- [x] **核心模块** (9个文件)
  - [x] csrf-manager.js - CSRF管理器
  - [x] token-generator.js - 令牌生成器  
  - [x] token-validator.js - 令牌验证器
  - [x] token-storage.js - 存储管理器
  - [x] csrf-interceptor.js - HTTP拦截器
  - [x] csrf-config.js - 配置管理
  - [x] csrf-init.js - 初始化模块
  - [x] vue-plugin.js - Vue插件
  - [x] index.js - 入口文件

- [x] **安全组件** (2个组件)
  - [x] SafeForm.vue - 安全表单组件
  - [x] XSSProtection.vue - XSS防护组件

- [x] **状态管理**
  - [x] store/modules/csrf.js - CSRF Vuex模块
  - [x] store/getters.js - 更新的getters
  - [x] store/index.js - 集成CSRF模块

- [x] **请求集成**
  - [x] utils/request.js - 集成CSRF拦截器
  - [x] main.js - 集成Vue插件

- [x] **测试文件** (3个测试)
  - [x] tests/unit/security/csrf-manager.test.js
  - [x] tests/unit/security/token-generator.test.js  
  - [x] tests/unit/security/token-validator.test.js

- [x] **文档和示例**
  - [x] docs/csrf-protection-guide.md - 使用指南
  - [x] docs/performance-optimization.md - 性能优化
  - [x] examples/csrf-demo.vue - 演示页面
  - [x] README-CSRF.md - 项目文档

### 2. 依赖检查

- [x] **新增依赖**
  - [x] crypto-js - 加密算法库
  - [x] js-cookie - Cookie管理 (已存在)

- [x] **现有依赖兼容性**
  - [x] Vue.js 2.x ✓
  - [x] Vuex 3.x ✓
  - [x] Element UI ✓
  - [x] Axios ✓

### 3. 配置验证

- [ ] **环境配置**
  - [ ] 生产环境安全配置
  - [ ] 开发环境调试配置
  - [ ] 测试环境隔离配置

- [ ] **服务器配置**
  - [ ] CORS头部配置
  - [ ] CSRF令牌验证接口
  - [ ] 错误处理机制

## 部署步骤

### 1. 安装依赖

```bash
# 安装新的依赖
npm install crypto-js

# 验证依赖安装
npm list crypto-js
```

### 2. 环境配置

#### 生产环境配置

```javascript
// .env.production
VUE_APP_CSRF_ENABLED=true
VUE_APP_CSRF_STRATEGY=double-submit
VUE_APP_CSRF_SECURE_COOKIE=true
VUE_APP_CSRF_DEBUG=false
```

#### 开发环境配置

```javascript
// .env.development  
VUE_APP_CSRF_ENABLED=true
VUE_APP_CSRF_STRATEGY=double-submit
VUE_APP_CSRF_SECURE_COOKIE=false
VUE_APP_CSRF_DEBUG=true
```

### 3. 服务器端配置

#### Nginx配置示例

```nginx
# 允许CSRF头部
location /api/ {
    add_header Access-Control-Allow-Headers "X-CSRF-Token,Content-Type,Authorization" always;
    add_header Access-Control-Allow-Methods "GET,POST,PUT,DELETE,OPTIONS" always;
    add_header Access-Control-Allow-Origin "$http_origin" always;
    add_header Access-Control-Allow-Credentials "true" always;
    
    if ($request_method = 'OPTIONS') {
        return 200;
    }
    
    proxy_pass http://backend;
}
```

#### 后端API配置示例

```javascript
// Express.js示例
app.use((req, res, next) => {
    // 检查CSRF令牌
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        const token = req.headers['x-csrf-token'] || req.body._csrf;
        
        if (!token) {
            return res.status(403).json({
                code: 'CSRF_TOKEN_MISSING',
                message: 'CSRF token is required'
            });
        }
        
        // 验证令牌逻辑
        if (!validateCSRFToken(token, req.session)) {
            return res.status(403).json({
                code: 'CSRF_TOKEN_INVALID', 
                message: 'Invalid CSRF token'
            });
        }
    }
    
    next();
});
```

### 4. 构建和部署

```bash
# 运行测试
npm run test:security

# 构建生产版本
npm run build

# 验证构建结果
ls -la dist/
```

## 部署后验证

### 1. 功能验证

#### 基础功能测试

```javascript
// 在浏览器控制台运行
console.log('CSRF Status:', window.Vue.prototype.$csrf.getStatus());

// 测试令牌生成
window.Vue.prototype.$csrf.getToken().then(token => {
    console.log('CSRF Token:', token);
});
```

#### 表单提交测试

- [ ] SafeForm组件正常提交
- [ ] 自动添加CSRF令牌
- [ ] 令牌验证失败时自动重试
- [ ] XSS防护正常工作

#### API请求测试

- [ ] POST请求自动添加CSRF头部
- [ ] PUT/DELETE请求包含令牌
- [ ] GET请求不受影响
- [ ] 令牌过期时自动刷新

### 2. 安全验证

#### CSRF攻击测试

```html
<!-- 在外部站点测试CSRF攻击 -->
<form action="https://your-site.com/api/sensitive-action" method="POST">
    <input type="hidden" name="action" value="delete-all-data">
    <input type="submit" value="Click Me">
</form>
```

预期结果：请求应该被拒绝，返回403错误

#### XSS防护测试

```javascript
// 测试XSS输入
const testInputs = [
    '<script>alert("XSS")</script>',
    '<img src="x" onerror="alert(\'XSS\')">',
    'javascript:alert("XSS")',
    '<iframe src="javascript:alert(\'XSS\')"></iframe>'
];

// 这些输入应该被安全地过滤
```

### 3. 性能验证

#### 性能基准测试

```javascript
// 在浏览器控制台运行性能测试
const benchmark = new CSRFPerformanceBenchmark();
benchmark.runBenchmarks();
```

预期结果：
- 令牌生成 < 5ms
- 令牌验证 < 2ms  
- 存储操作 < 10ms

#### 内存使用监控

```javascript
// 监控内存使用
setInterval(() => {
    if (performance.memory) {
        console.log('Memory Usage:', {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB'
        });
    }
}, 10000);
```

### 4. 兼容性验证

#### 浏览器兼容性

- [ ] Chrome (最新版)
- [ ] Firefox (最新版)
- [ ] Safari (最新版)
- [ ] Edge (最新版)
- [ ] 移动端浏览器

#### 设备兼容性

- [ ] 桌面端正常工作
- [ ] 移动端正常工作
- [ ] 平板端正常工作

## 监控和维护

### 1. 错误监控

```javascript
// 设置错误监控
window.addEventListener('error', (event) => {
    if (event.error && event.error.isCSRFError) {
        // 上报CSRF相关错误
        console.error('CSRF Error:', event.error);
    }
});
```

### 2. 性能监控

```javascript
// 设置性能监控
const performanceObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
        if (entry.name.includes('csrf')) {
            console.log('CSRF Performance:', entry);
        }
    });
});

performanceObserver.observe({ entryTypes: ['measure'] });
```

### 3. 日志收集

```javascript
// 配置日志收集
const csrfLogger = {
    log: (level, message, data) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            data,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // 发送到日志服务
        if (level === 'error') {
            sendToErrorTracking(logEntry);
        }
    }
};
```

## 回滚计划

### 1. 回滚触发条件

- CSRF功能完全失效
- 性能严重下降 (>50%)
- 安全漏洞被发现
- 用户体验严重受影响

### 2. 回滚步骤

```bash
# 1. 备份当前配置
cp src/main.js src/main.js.backup

# 2. 禁用CSRF插件
# 注释掉main.js中的CSRF插件安装

# 3. 重新构建和部署
npm run build

# 4. 验证回滚成功
# 确认系统正常运行
```

### 3. 回滚验证

- [ ] 系统基础功能正常
- [ ] 性能恢复到预期水平
- [ ] 无安全告警
- [ ] 用户反馈正常

## 签收确认

### 开发团队确认

- [ ] **前端开发** - 代码审查通过
- [ ] **后端开发** - 接口对接完成
- [ ] **测试工程师** - 功能测试通过
- [ ] **安全工程师** - 安全评估通过

### 运维团队确认

- [ ] **系统管理员** - 服务器配置完成
- [ ] **网络管理员** - 网络配置验证
- [ ] **监控工程师** - 监控告警配置

### 产品团队确认

- [ ] **产品经理** - 功能验收通过
- [ ] **UI/UX设计师** - 用户体验确认
- [ ] **项目经理** - 整体进度确认

---

**部署负责人：** _________________ **日期：** _________________

**技术负责人：** _________________ **日期：** _________________

**项目经理：** _________________ **日期：** _________________

## 联系信息

如遇部署问题，请联系：

- **技术支持：** 开发团队
- **紧急联系：** 项目经理
- **文档位置：** `/docs/csrf-protection-guide.md`

---

*此清单应在每次CSRF防护系统部署时使用，确保部署过程的标准化和可靠性。*