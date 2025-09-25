# API限流管理功能

## 功能概述

API限流管理功能为mall后台管理系统提供了完整的API访问频率控制解决方案，支持多种限流策略和实时监控。

## 主要特性

### 1. 多种限流类型
- **IP限流**: 基于客户端IP地址的访问频率控制
- **用户限流**: 基于登录用户的访问频率控制  
- **API限流**: 基于特定API端点的访问频率控制
- **全局限流**: 系统级别的全局访问频率控制

### 2. 灵活的时间窗口配置
- 支持秒、分钟、小时、天等多种时间单位
- 可自定义限制次数和时间窗口大小
- 支持复杂的限流策略组合

### 3. 实时监控和统计
- 限流规则执行状态实时监控
- 请求趋势图表展示
- TOP限流API统计分析
- 实时日志查看

### 4. 完整的管理功能
- 限流规则的增删改查
- 批量操作支持
- 规则导入导出
- 规则测试验证
- 状态开关控制

## 文件结构

```
src/
├── api/
│   └── rateLimiting.js           # API接口模块
└── views/ums/rateLimit/
    ├── index.vue                 # 限流规则管理页面
    └── stats.vue                 # 限流监控统计面板
```

## API接口说明

### 基础CRUD接口
- `fetchRateLimitList()` - 获取限流规则列表
- `createRateLimit()` - 创建限流规则
- `updateRateLimit()` - 更新限流规则
- `deleteRateLimit()` - 删除限流规则
- `deleteBatchRateLimit()` - 批量删除限流规则

### 状态管理接口
- `updateRateLimitStatus()` - 修改限流规则状态
- `resetRateLimitCounter()` - 重置限流计数器

### 功能增强接口
- `getRateLimitDetail()` - 获取限流规则详情
- `fetchApiPathList()` - 获取API路径列表
- `testRateLimit()` - 测试限流规则
- `getRateLimitStats()` - 获取限流统计信息

### 导入导出接口
- `exportRateLimitRules()` - 导出限流规则
- `importRateLimitRules()` - 导入限流规则

## 页面功能说明

### 限流规则管理页面 (`/ums/rateLimit`)

#### 主要功能
1. **规则列表展示**
   - 分页显示所有限流规则
   - 支持按规则名称、API路径、状态筛选
   - 实时显示当前计数状态

2. **规则编辑**
   - 添加新的限流规则
   - 编辑现有规则配置
   - 表单验证确保数据完整性

3. **批量操作**
   - 多选删除规则
   - 批量状态修改
   - 导入导出规则配置

4. **规则测试**
   - 模拟请求测试规则效果
   - 验证限流逻辑正确性

#### 字段说明
- **规则名称**: 限流规则的识别名称
- **API路径**: 需要限流的API端点路径
- **请求方法**: HTTP请求方法 (GET/POST/PUT/DELETE/ALL)
- **限流类型**: IP/用户/API/全局四种类型
- **限制次数**: 在时间窗口内允许的最大请求次数
- **时间窗口**: 限流计算的时间范围
- **时间单位**: 秒/分钟/小时/天
- **描述**: 规则的详细说明
- **状态**: 启用/禁用规则

### 限流监控统计面板 (`/ums/rateLimitStats`)

#### 统计概览
- 总规则数量统计
- 今日请求总数
- 限流拦截率分析
- 活跃规则数量

#### 图表展示
1. **请求趋势图**
   - 显示总请求、限流拦截、正常通过的时间趋势
   - 支持1小时、6小时、24小时、7天等时间范围

2. **限流类型分布图**
   - 饼图展示不同限流类型的分布情况

#### TOP API统计
- 显示限流次数最多的API端点
- 包含拦截率、总请求数等详细信息
- 支持不同时间范围的统计

#### 实时日志
- 显示限流事件的实时日志
- 支持开启/关闭实时监控
- 可清空历史日志记录

## 路由配置

在 `src/router/index.js` 中已添加以下路由：

```javascript
{
  path: 'rateLimit',
  name: 'rateLimit',
  component: () => import('@/views/ums/rateLimit/index'),
  meta: {title: 'API限流管理', icon: 'el-icon-connection'}
},
{
  path: 'rateLimitStats',
  name: 'rateLimitStats',
  component: () => import('@/views/ums/rateLimit/stats'),
  meta: {title: '限流监控面板', icon: 'el-icon-data-analysis'}
}
```

## 使用方法

### 1. 创建限流规则

1. 进入"权限 > API限流管理"页面
2. 点击"添加限流规则"按钮
3. 填写规则信息：
   - 规则名称：如"用户登录限流"
   - API路径：如"/api/auth/login"
   - 请求方法：选择对应的HTTP方法
   - 限流类型：根据需求选择IP/用户/API/全局
   - 限制次数：如100次
   - 时间窗口：如60秒
4. 点击确定保存规则

### 2. 管理现有规则

- **编辑规则**: 点击列表中的"编辑"按钮
- **删除规则**: 点击列表中的"删除"按钮
- **启用/禁用**: 使用状态开关控制规则生效
- **重置计数**: 点击"重置计数"清空当前计数器
- **测试规则**: 点击"测试"验证规则效果

### 3. 监控限流状态

1. 进入"权限 > 限流监控面板"页面
2. 查看统计概览了解系统状态
3. 通过图表分析请求趋势和限流效果
4. 查看TOP API了解哪些接口被限流最多
5. 开启实时日志查看限流事件

### 4. 批量管理

- **批量删除**: 勾选多个规则后点击"批量删除"
- **导出规则**: 点击"导出规则"下载Excel文件
- **导入规则**: 点击"导入规则"上传Excel文件

## 后端集成说明

### 1. API接口实现

后端需要实现对应的REST API接口，接口路径基于 `/rateLimiting` 前缀：

```
GET    /rateLimiting/list              # 获取规则列表
POST   /rateLimiting/create            # 创建规则
POST   /rateLimiting/update/{id}       # 更新规则
POST   /rateLimiting/delete/{id}       # 删除规则
POST   /rateLimiting/delete/batch      # 批量删除
POST   /rateLimiting/update/status/{id} # 更新状态
GET    /rateLimiting/{id}              # 获取详情
GET    /rateLimiting/apiPaths          # 获取API路径列表
GET    /rateLimiting/stats             # 获取统计信息
POST   /rateLimiting/reset/{id}        # 重置计数器
POST   /rateLimiting/test              # 测试规则
GET    /rateLimiting/export            # 导出规则
POST   /rateLimiting/import            # 导入规则
```

### 2. 数据模型

```json
{
  "id": 1,
  "ruleName": "用户登录限流",
  "apiPath": "/api/auth/login",
  "httpMethod": "POST",
  "limitType": "IP",
  "limitCount": 100,
  "timeWindow": 60,
  "timeUnit": "SECOND",
  "description": "防止暴力破解",
  "status": 1,
  "currentCount": 15,
  "createTime": "2023-12-01 10:00:00"
}
```

### 3. 限流中间件

建议使用Redis等缓存系统实现限流计数器，支持以下算法：
- 固定窗口算法
- 滑动窗口算法
- 令牌桶算法
- 漏桶算法

## 注意事项

1. **性能考虑**: 限流计数器操作要快速，建议使用Redis
2. **集群部署**: 多实例部署时需要共享计数器状态
3. **异常处理**: 当限流服务不可用时的降级策略
4. **监控告警**: 设置限流触发阈值告警
5. **规则热更新**: 支持不重启服务更新限流规则

## 扩展功能

可以考虑添加以下高级功能：
- 动态限流：根据系统负载自动调整限流阈值
- 白名单管理：特定IP或用户免于限流
- 限流告警：触发限流时发送通知
- 地理位置限流：基于用户地理位置的限流策略
- API优先级：不同重要级别的API使用不同限流策略

## 技术栈

- **前端**: Vue 2.x + Element UI + ECharts
- **后端**: Spring Boot + Redis + MySQL (推荐)
- **限流算法**: 滑动窗口/令牌桶 (推荐)
- **监控**: Prometheus + Grafana (可选)

---

*更多技术细节和使用问题，请参考项目文档或联系开发团队。*