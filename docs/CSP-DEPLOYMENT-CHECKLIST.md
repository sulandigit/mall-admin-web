# CSP策略部署检查清单

## 🚀 部署前检查清单

### 阶段1: 开发验证
- [ ] **运行测试套件**: `npm run csp:test-suite`
- [ ] **验证浏览器兼容性**: `npm run csp:validate`
- [ ] **检查策略配置**: `npm run csp:demo`
- [ ] **测试违规报告**: `npm run csp:server` 并检查功能
- [ ] **验证所有页面**: 确保关键业务流程正常工作
- [ ] **检查第三方集成**: Google Analytics、百度统计、TinyMCE等

### 阶段2: 构建验证
- [ ] **CSP增强构建**: `npm run build:csp`
- [ ] **检查构建产物**: 验证dist/中包含CSP meta标签
- [ ] **验证策略注入**: 检查HTML中的CSP meta标签
- [ ] **测试静态文件**: 确保所有资源可正常加载

### 阶段3: 部署配置
- [ ] **服务器配置**: 配置CSP违规报告端点
- [ ] **反向代理**: 设置Nginx/Apache代理规则
- [ ] **SSL证书**: 确保HTTPS正确配置
- [ ] **安全头**: 配置其他安全相关HTTP头

### 阶段4: 监控设置
- [ ] **报告收集**: 配置CSP违规报告收集服务
- [ ] **日志轮转**: 设置日志文件管理策略
- [ ] **告警机制**: 配置异常违规告警
- [ ] **仪表板**: 设置监控面板

## 📋 环境部署策略

### 开发环境
```bash
# 配置检查
npm run csp:demo -- --env development

# 预期结果
✓ Report-Only模式
✓ 宽松策略配置
✓ 详细调试输出
✓ 本地域名支持
```

### 测试环境  
```bash
# 配置检查
npm run csp:demo -- --env testing

# 预期结果
✓ 强制执行模式
✓ 中等严格策略
✓ 违规报告收集
✓ 功能测试通过
```

### 生产环境
```bash
# 配置检查
npm run csp:demo -- --env production

# 预期结果
✓ 强制执行模式
✓ 严格安全策略  
✓ 完整监控配置
✓ 性能优化设置
```

## 🔧 服务器配置模板

### Nginx配置
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL配置
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # CSP违规报告
    location /api/csp-report {
        proxy_pass http://backend:3000;
        proxy_set_header Content-Type application/json;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # 静态文件
    location / {
        root /var/www/dist;
        try_files $uri $uri/ /index.html;
        
        # 安全头
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;
        add_header Referrer-Policy strict-origin-when-cross-origin always;
    }
}
```

### Apache配置
```apache
<VirtualHost *:443>
    ServerName yourdomain.com
    DocumentRoot /var/www/dist
    
    # SSL配置
    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem
    
    # CSP违规报告代理
    ProxyPass /api/csp-report http://backend:3000/csp-report
    ProxyPassReverse /api/csp-report http://backend:3000/csp-report
    
    # 安全头
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set Referrer-Policy strict-origin-when-cross-origin
</VirtualHost>
```

## 🚨 应急响应预案

### 高频违规告警
```bash
# 紧急检查步骤
1. 查看违规统计: curl /api/csp-stats
2. 获取详细报告: curl /api/csp-reports?count=50
3. 分析违规模式: 查看blocked-uri和violated-directive
4. 评估影响范围: 检查用户反馈和功能异常

# 应急措施
- 如果影响关键功能，临时切换到report-only模式
- 如果是新增域名，快速更新白名单
- 如果是攻击行为，加强监控和过滤
```

### 功能异常处理
```bash
# 故障排除流程
1. 确认CSP违规: 检查浏览器控制台
2. 识别受影响功能: 测试关键业务流程
3. 分析根本原因: 检查策略配置
4. 实施临时修复: 更新策略或启用report-only
5. 验证修复效果: 重新测试功能
6. 监控后续影响: 持续观察违规报告
```

## 📊 性能监控指标

### 关键指标
- [ ] **页面加载时间**: 应无明显增加（<5%）
- [ ] **资源加载失败率**: 应保持在正常水平
- [ ] **CSP违规率**: 应控制在可接受范围内
- [ ] **用户体验指标**: 功能正常，无异常报告

### 监控工具
```bash
# 性能测试
npm run csp:test -- perf

# 实时监控
watch -n 30 'curl -s /api/csp-stats | jq'

# 日志分析
tail -f /var/log/csp-violations.log | grep -E "(error|critical)"
```

## 🔄 持续优化

### 每日任务
- [ ] 检查CSP违规报告
- [ ] 监控关键功能状态
- [ ] 审查异常访问模式

### 每周任务
- [ ] 分析违规趋势
- [ ] 更新域名白名单
- [ ] 测试新功能的CSP兼容性
- [ ] 审查安全策略有效性

### 每月任务
- [ ] 全面安全评估
- [ ] 策略优化调整
- [ ] 团队培训更新
- [ ] 应急预案演练

## 📞 联系信息

### 技术支持
- **开发团队**: 负责CSP策略配置和更新
- **运维团队**: 负责服务器配置和监控
- **安全团队**: 负责安全策略审查和事件响应

### 紧急联系
- **关键系统故障**: 立即联系运维负责人
- **安全事件**: 立即联系安全团队
- **策略调整**: 联系开发团队评估

---

**⚠️ 重要提醒**: 
1. 首次部署建议使用report-only模式观察1-2周
2. 生产环境变更必须先在测试环境验证
3. 保持CSP策略文档和实际配置同步
4. 定期备份违规报告日志用于安全分析