# 🔐 敏感信息加密存储系统

## 概述

这是一个为商城管理系统设计的企业级敏感信息加密存储解决方案，专门用于安全存储Token、用户凭据等敏感数据，提供多重安全防护和无缝的向后兼容性。

## ✨ 核心特性

### 🛡️ 安全特性
- **多层级加密**：支持 AES-256-GCM、AES-128-CBC 等强加密算法
- **密钥管理**：自动密钥派生、轮换和生命周期管理
- **完整性验证**：HMAC-SHA256 防篡改保护
- **访问控制**：基于数据分类的分级访问策略

### 💾 存储策略
- **多存储支持**：IndexedDB、LocalStorage、SessionStorage、内存缓存
- **智能分类**：根据数据敏感度自动选择存储位置和加密级别
- **过期管理**：自动清理过期数据，支持 TTL 设置

### 🔄 兼容性
- **渐进式迁移**：从明文 Cookie 到加密存储的无缝迁移
- **向后兼容**：保持与现有代码的完全兼容
- **降级处理**：加密存储失败时自动回退到传统方式

### 📊 监控审计
- **访问日志**：详细记录所有存储操作
- **安全事件**：实时监控异常行为和安全威胁
- **性能指标**：加密解密性能和存储使用情况统计

## 🏗️ 系统架构

```
敏感信息加密存储系统
├── 应用层接口
│   ├── auth.js (认证模块)
│   ├── request.js (API拦截器)
│   └── store/user.js (Vuex状态管理)
├── 加密存储核心
│   ├── SecureStorageService (主服务)
│   ├── EncryptionEngine (加密引擎)
│   ├── KeyManager (密钥管理)
│   └── DataClassifier (数据分类)
├── 存储适配层
│   ├── IndexedDBAdapter
│   ├── LocalStorageAdapter
│   ├── SessionStorageAdapter
│   └── MemoryAdapter
├── 安全监控
│   └── SecurityMonitor (安全监控)
└── 数据迁移
    └── migration.js (迁移脚本)
```

## 📋 数据分类策略

| 分类级别 | 数据类型 | 加密算法 | 存储位置 | 有效期 | 示例 |
|---------|---------|---------|---------|---------|-----|
| 高敏感 | 访问Token、刷新Token | AES-256-GCM | IndexedDB | 30分钟 | `loginToken` |
| 中敏感 | 用户信息、会话数据 | AES-128-CBC | LocalStorage | 24小时 | `userInfo` |
| 低敏感 | 应用配置、UI设置 | Base64编码 | LocalStorage | 7天 | `appConfig` |

## 🚀 快速开始

### 1. 基础使用

```javascript
import secureStorage, { DATA_CLASSIFICATIONS } from '@/utils/secure-storage'

// 存储敏感数据
await secureStorage.store('loginToken', tokenValue, {
  classification: DATA_CLASSIFICATIONS.HIGH_SENSITIVE,
  expireTime: Date.now() + 30 * 60 * 1000 // 30分钟后过期
})

// 检索数据
const token = await secureStorage.retrieve('loginToken')

// 删除数据
await secureStorage.remove('loginToken')
```

### 2. 认证集成

```javascript
import { getToken, setToken, removeToken } from '@/utils/auth'

// 设置Token（自动加密存储）
await setToken('Bearer eyJhbGciOiJIUzI1NiIs...')

// 获取Token（自动解密）
const token = await getToken()

// 删除Token（清理所有存储位置）
await removeToken()
```

### 3. 数据迁移

```javascript
import { autoMigrate, needsMigration } from '@/utils/secure-storage/migration'

// 检查是否需要迁移
if (await needsMigration()) {
  // 执行自动迁移
  const result = await autoMigrate()
  console.log('迁移结果:', result)
}
```

## 🔧 高级配置

### 自定义加密选项

```javascript
import { SecureStorageService } from '@/utils/secure-storage'

const customStorage = new SecureStorageService({
  keyOptions: {
    keyRotationInterval: 24 * 60 * 60 * 1000, // 24小时轮换
    pbkdf2Iterations: 150000 // 更高的迭代次数
  },
  cacheTimeout: 10 * 60 * 1000 // 10分钟缓存
})
```

### 自定义数据分类规则

```javascript
import { DataClassifier } from '@/utils/secure-storage'

const classifier = new DataClassifier()

// 添加自定义分类规则
classifier.addClassificationRule('custom_high', {
  keywords: ['api_key', 'secret'],
  patterns: [/^secret_/i],
  encryptionLevel: {
    algorithm: 'aes-256-gcm',
    keyLength: 256
  }
})
```

## 📊 监控和调试

### 获取系统统计

```javascript
const stats = await secureStorage.getStats()
console.log('系统统计:', stats)
```

### 查看访问日志

```javascript
import { SecurityMonitor } from '@/utils/secure-storage'

const monitor = new SecurityMonitor()
const logs = monitor.getAccessLogs({
  operation: 'retrieve',
  startTime: Date.now() - 24 * 60 * 60 * 1000 // 最近24小时
})
```

### 安全事件监听

```javascript
window.addEventListener('secureStorageAlert', (event) => {
  console.warn('安全告警:', event.detail)
  // 处理安全事件
})
```

## 🧪 测试

### 运行基础测试

在浏览器中打开 `tests/basic-test.html` 文件，点击"运行所有测试"按钮。

### 运行集成测试

```javascript
// 在浏览器控制台中运行
import IntegrationTestSuite from './tests/integration-test.js'

const testSuite = new IntegrationTestSuite()
const results = await testSuite.runFullIntegrationSuite()
```

## 🔄 迁移指南

### 从Cookie迁移

系统会自动检测现有的Cookie数据并迁移到加密存储：

1. **自动迁移**：应用启动时自动执行
2. **渐进式**：保持原有功能正常工作
3. **向后兼容**：支持回退到Cookie存储

### 迁移状态检查

```javascript
import { getMigrationStatus } from '@/utils/secure-storage/migration'

const status = getMigrationStatus()
console.log('迁移进度:', status.progress + '%')
```

## ⚡ 性能优化

### 缓存策略

- **L1缓存**：内存缓存，5分钟有效期
- **L2缓存**：SessionStorage，会话期间有效
- **L3缓存**：LocalStorage，24小时有效期
- **L4存储**：IndexedDB，长期持久化

### 性能建议

1. **批量操作**：避免频繁的单个操作
2. **合理设置TTL**：避免数据过期导致重新加密
3. **监控性能指标**：定期检查加密解密耗时

## 🛠️ 故障排除

### 常见问题

#### 1. 加密存储失败
```javascript
// 检查浏览器支持
if (!window.crypto || !window.crypto.subtle) {
  console.error('浏览器不支持Web Crypto API')
}

// 检查存储空间
const stats = await secureStorage.getStats()
console.log('存储使用情况:', stats)
```

#### 2. 迁移失败
```javascript
// 重置迁移状态
import { resetMigrationState } from '@/utils/secure-storage/migration'
resetMigrationState()

// 手动执行迁移
await autoMigrate({ force: true })
```

#### 3. 性能问题
```javascript
// 清理过期数据
await secureStorage.clear()

// 检查密钥轮换
await secureStorage.rotateKeys()
```

## 🔮 API 参考

### SecureStorageService

| 方法 | 参数 | 返回值 | 描述 |
|-----|------|--------|------|
| `store(key, data, options)` | key: string, data: any, options: object | Promise\<boolean\> | 存储数据 |
| `retrieve(key, options)` | key: string, options: object | Promise\<any\> | 检索数据 |
| `remove(key)` | key: string | Promise\<boolean\> | 删除数据 |
| `clear(classification)` | classification: string | Promise\<boolean\> | 清空数据 |
| `isExpired(key)` | key: string | Promise\<boolean\> | 检查是否过期 |
| `rotateKeys()` | - | Promise\<boolean\> | 轮换密钥 |

### 认证模块

| 方法 | 参数 | 返回值 | 描述 |
|-----|------|--------|------|
| `getToken()` | - | Promise\<string\> | 获取Token |
| `setToken(token, options)` | token: string, options: object | Promise\<boolean\> | 设置Token |
| `removeToken()` | - | Promise\<boolean\> | 删除Token |
| `hasToken()` | - | Promise\<boolean\> | 检查Token是否存在 |
| `isTokenExpired()` | - | Promise\<boolean\> | 检查Token是否过期 |

## 📈 安全最佳实践

1. **定期密钥轮换**：建议每7天自动轮换密钥
2. **监控异常访问**：关注失败访问尝试和安全事件
3. **数据分类管理**：严格按照敏感度分类存储数据
4. **及时清理过期数据**：避免敏感信息长期残留
5. **安全事件响应**：建立安全事件的响应机制

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

## 📞 支持

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件至 [support@example.com]
- 查看 [Wiki 文档](wiki)

---

**⚠️ 安全提醒**：本系统涉及敏感数据处理，请在生产环境中仔细测试并遵循安全最佳实践。