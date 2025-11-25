# 会员积分系统开发文档

## 项目概述

会员积分系统是基于 mall-admin-web 项目开发的用户运营核心模块，通过积分奖励机制激励用户消费，提升用户粘性。

## 技术架构

### 前端技术栈
- **Vue.js 2.7.2** - 前端框架
- **Vuex 3.0.1** - 状态管理
- **Vue Router 3.0.1** - 路由管理
- **Element UI 2.3.7** - UI组件库
- **ECharts 4.2.0** - 数据可视化
- **Axios 0.18.0** - HTTP请求

### 目录结构

```
src/
├── api/                          # API接口层
│   ├── pointsRules.js           # 积分规则API
│   ├── pointsRecords.js         # 积分记录API
│   ├── pointsExchange.js        # 积分兑换API
│   ├── pointsAnalytics.js       # 积分统计API
│   └── memberLevel.js           # 会员等级API（扩展）
├── store/
│   └── modules/
│       └── points.js            # 积分状态管理模块
├── views/
│   └── member/
│       ├── points/
│       │   ├── rules.vue        # 积分规则管理
│       │   ├── records.vue      # 积分记录管理
│       │   ├── exchange.vue     # 积分兑换管理
│       │   └── analytics.vue    # 积分统计分析
│       └── levels.vue           # 会员等级管理
├── components/
│   └── Pagination/              # 分页组件
└── styles/
    ├── points-management.scss   # 积分管理样式
    └── points-charts.scss       # 积分图表样式
```

## 功能模块

### 1. 积分规则管理 (`/member/points/rules`)
- 积分规则的增删改查
- 规则类型：获取积分/消费积分
- 触发事件：订单完成、登录、评价等
- 积分计算：固定积分或按比例计算
- 规则启用/禁用状态管理

### 2. 积分记录管理 (`/member/points/records`)
- 积分变动记录查询
- 支持按用户、时间、变动类型筛选
- 积分余额实时查看
- 手动积分调整功能

### 3. 积分兑换管理 (`/member/points/exchange`)
- 兑换商品管理（实物/优惠券/服务）
- 兑换记录查询和审核
- 库存管理和兑换限制
- 发货状态跟踪

### 4. 积分统计分析 (`/member/points/analytics`)
- 积分数据概览（总发放、总消费、活跃用户等）
- 积分趋势图表
- 用户积分分布统计
- 兑换商品排行榜
- 会员等级分布

### 5. 会员等级管理 (`/member/levels`)
- 会员等级配置（积分范围、倍率等）
- 等级权益设置（折扣、免邮等）
- 等级排序和状态管理

## API接口说明

### 积分规则API
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/points/rules/list` | 获取规则列表 |
| POST | `/points/rules/create` | 创建规则 |
| PUT | `/points/rules/update/{id}` | 更新规则 |
| DELETE | `/points/rules/delete/{id}` | 删除规则 |
| PUT | `/points/rules/toggle/{id}` | 启用/禁用规则 |

### 积分记录API
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/points/records/list` | 获取记录列表 |
| GET | `/points/records/{id}` | 获取记录详情 |
| POST | `/points/records/adjust` | 手动调整积分 |
| GET | `/points/records/export` | 导出记录 |

### 积分兑换API
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/points/exchange/items` | 获取兑换商品 |
| POST | `/points/exchange/items/create` | 创建商品 |
| PUT | `/points/exchange/items/update/{id}` | 更新商品 |
| GET | `/points/exchange/records` | 获取兑换记录 |
| PUT | `/points/exchange/audit/{id}` | 审核兑换 |

### 积分统计API
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/points/analytics/overview` | 获取概览数据 |
| GET | `/points/analytics/trend` | 获取趋势数据 |
| GET | `/points/analytics/distribution` | 获取分布数据 |
| GET | `/points/analytics/exchange` | 获取兑换统计 |

## Vuex状态管理

### State结构
```javascript
state: {
  pointsRules: [],           // 积分规则列表
  pointsRecords: {},         // 积分记录分页数据
  exchangeItems: [],         // 兑换商品列表
  exchangeRecords: {},       // 兑换记录分页数据
  memberLevels: [],          // 会员等级列表
  analyticsData: {},         // 统计数据
  memberPointsCache: Map()   // 用户积分缓存
}
```

### 主要Actions
- `fetchPointsRules` - 获取积分规则
- `createPointsRule` - 创建积分规则
- `fetchPointsRecords` - 获取积分记录
- `adjustPoints` - 调整用户积分
- `fetchExchangeItems` - 获取兑换商品
- `fetchAnalyticsData` - 获取统计数据

## 路由配置

积分系统路由已集成到主路由配置中：

```javascript
{
  path: '/member',
  component: Layout,
  meta: { title: '会员管理', icon: 'user' },
  children: [
    {
      path: 'points/rules',
      component: () => import('@/views/member/points/rules'),
      meta: { title: '积分规则', icon: 'setting' }
    },
    // ... 其他路由
  ]
}
```

## 样式主题

### 主要样式文件
- `points-management.scss` - 积分管理通用样式
- `points-charts.scss` - 图表组件专用样式

### 响应式设计
- 支持桌面端和移动端适配
- 使用CSS Grid和Flexbox布局
- 断点：768px（移动端）、1200px（大屏）

## 测试

### 单元测试
- 组件测试：`test/unit/points-rules.spec.js`
- Store测试：`test/unit/points-store.spec.js`
- 使用Jest + Vue Test Utils

### 测试覆盖
- 组件渲染测试
- 用户交互测试
- Store状态变更测试
- API调用测试

## 部署说明

### 开发环境
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 生产构建
```bash
# 构建生产版本
npm run build
```

### 环境要求
- Node.js >= 6.0.0
- npm >= 3.0.0
- 现代浏览器支持（> 1%, last 2 versions, not ie <= 8）

## 后续优化

### 性能优化
1. 组件懒加载
2. 图表数据缓存
3. 虚拟滚动（大数据量表格）

### 功能扩展
1. 积分规则模板
2. 批量操作功能
3. 数据导入导出
4. 实时通知推送

### 代码质量
1. TypeScript迁移
2. ESLint规则完善
3. 单元测试覆盖率提升
4. 端到端测试

## 联系方式

如有问题请联系开发团队或查看项目仓库issue。