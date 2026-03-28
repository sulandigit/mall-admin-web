# CSP策略实施 - 快速开始

本项目已集成完整的内容安全策略(CSP)实施方案，为商城管理后台系统提供强化的安全防护。

## 🚀 快速开始

### 1. 查看CSP策略

```bash
# 查看所有环境的CSP策略
npm run csp:demo

# 查看生产环境策略
npm run csp:demo -- --env production
```

### 2. 验证配置

```bash
# 运行完整测试套件
npm run csp:test-suite

# 生成详细测试报告
npm run csp:test-report
```

### 3. 开发调试

```bash
# 启动CSP违规报告服务器
npm run csp:server

# 启动开发服务器（已集成CSP）
npm run dev
```

### 4. 构建部署

```bash
# CSP增强构建（推荐）
npm run build:csp

# 标准构建
npm run build
```

## 📊 主要特性

- ✅ **分环境策略**: 开发/测试/生产环境不同的安全策略
- ✅ **自动集成**: Webpack自动注入CSP meta标签
- ✅ **违规监控**: 实时收集和分析CSP违规报告
- ✅ **兼容性验证**: 自动验证浏览器兼容性
- ✅ **渐进式部署**: 支持report-only到强制模式的平滑过渡

## 🔐 安全防护

| 威胁类型 | 防护状态 | 说明 |
|---------|---------|------|
| XSS攻击 | ✅ 防护 | 限制脚本执行来源 |
| 数据泄露 | ✅ 防护 | 控制网络连接目标 |
| 点击劫持 | ✅ 防护 | 禁止页面嵌入 |
| 混合内容 | ✅ 防护 | 强制HTTPS加载 |
| 插件攻击 | ✅ 防护 | 禁用危险插件 |

## 📋 可用命令

| 命令 | 用途 |
|------|------|
| `npm run csp:demo` | 查看CSP策略配置 |
| `npm run csp:test-suite` | 运行完整测试 |
| `npm run csp:test-report` | 生成测试报告 |
| `npm run csp:server` | 启动违规报告服务器 |
| `npm run csp:validate` | 验证浏览器兼容性 |
| `npm run build:csp` | CSP增强构建 |

## ⚙️ 环境配置

### 开发环境
- **模式**: Report-Only（仅报告）
- **安全级别**: 宽松
- **调试**: 详细输出

### 生产环境  
- **模式**: Enforcing（强制执行）
- **安全级别**: 严格
- **监控**: 完整报告收集

## 📚 详细文档

查看完整的实施指南：[CSP-IMPLEMENTATION-GUIDE.md](./docs/CSP-IMPLEMENTATION-GUIDE.md)

## 🔧 故障排除

### 常见问题

1. **页面功能异常**
   ```bash
   # 查看违规详情
   npm run dev
   # 检查浏览器控制台
   ```

2. **第三方服务失效**
   ```bash
   # 检查域名白名单
   npm run csp:demo -- --env production
   ```

3. **构建失败**
   ```bash
   # 验证配置
   npm run csp:validate
   ```

## 📞 技术支持

- 🛠️ **配置问题**: 检查 `build/csp-config.js`
- 🐛 **功能异常**: 运行 `npm run csp:test-suite`  
- 📊 **违规监控**: 启动 `npm run csp:server`
- 📖 **详细文档**: 查看 `docs/CSP-IMPLEMENTATION-GUIDE.md`

---

**💡 提示**: CSP策略已针对当前项目进行优化，支持Google Analytics、百度统计、TinyMCE编辑器等第三方服务。如需添加新的外部资源，请更新域名白名单配置。