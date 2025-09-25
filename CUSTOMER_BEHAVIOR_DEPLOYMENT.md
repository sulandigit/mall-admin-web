# 客户行为追踪分析功能部署指南

## 概述

客户行为追踪分析功能是Mall Admin Web系统的新增模块，用于监控和分析用户在商城网站上的浏览行为，提供深入的用户画像分析。

## 功能特性

### 核心模块

1. **行为追踪仪表板** (`/customer-behavior/dashboard`)
   - 实时监控关键指标（访问量、停留时间、跳出率、当前在线用户）
   - 可视化趋势图表和数据对比
   - 自动刷新和时间范围选择

2. **页面访问分析** (`/customer-behavior/page-visit`)
   - 页面访问排行榜和统计
   - 用户访问路径分析
   - 访问来源分布可视化

3. **停留时间分析** (`/customer-behavior/stay-time`)
   - 停留时间分布直方图和趋势图
   - 页面停留时间对比分析
   - 多维度时间统计

4. **跳出率分析** (`/customer-behavior/bounce-rate`)
   - 跳出率趋势监控
   - 异常预警系统
   - 页面跳出率排行

5. **用户画像分析** (`/customer-behavior/user-profile`)
   - 基于行为数据的用户画像构建
   - 兴趣标签云和用户分群
   - 行为特征雷达图

## 技术架构

### 前端技术栈
- **Vue.js 2.7.2** - 主框架
- **Element UI 2.3.7** - UI组件库
- **ECharts 4.2.0** - 数据可视化
- **V-Charts 1.19.0** - Vue图表组件
- **Vuex 3.0.1** - 状态管理
- **Vue Router 3.0.1** - 路由管理

### 组件架构
```
src/views/customer-behavior/
├── dashboard.vue              # 行为追踪仪表板
├── page-visit.vue            # 页面访问分析
├── stay-time.vue             # 停留时间分析
├── bounce-rate.vue           # 跳出率分析
├── user-profile.vue          # 用户画像分析
├── index.vue                 # 布局组件
└── components/
    ├── MetricsCards.vue      # 指标卡片组件
    └── TrendCharts.vue       # 趋势图表组件
```

### 状态管理
```
src/store/modules/behavior.js  # 行为数据状态管理
├── state                     # 状态数据
├── mutations                 # 状态变更
├── actions                   # 异步操作
└── getters                   # 计算属性
```

### API服务
```
src/api/behavior.js           # 行为追踪API接口
├── getDashboardData()        # 获取仪表板数据
├── getPageVisitData()        # 获取页面访问数据
├── getStayTimeData()         # 获取停留时间数据
├── getBounceRateData()       # 获取跳出率数据
├── getUserProfileData()      # 获取用户画像数据
└── getRealTimeData()         # 获取实时数据
```

## 部署步骤

### 1. 环境准备

确保以下环境已安装：
- Node.js (>= 6.0.0)
- npm (>= 3.0.0)

### 2. 安装依赖

```bash
cd mall-admin-web
npm install
```

### 3. 开发环境启动

```bash
npm run dev
```

### 4. 生产环境构建

```bash
npm run build
```

### 5. 访问功能

启动成功后，可通过以下路由访问：

- 行为仪表板：`http://localhost:8080/#/customer-behavior/dashboard`
- 页面访问统计：`http://localhost:8080/#/customer-behavior/page-visit`
- 停留时间分析：`http://localhost:8080/#/customer-behavior/stay-time`
- 跳出率分析：`http://localhost:8080/#/customer-behavior/bounce-rate`
- 用户画像分析：`http://localhost:8080/#/customer-behavior/user-profile`

## 文件清单

### 新增文件

1. **API模块**
   - `src/api/behavior.js` - 行为追踪API接口

2. **状态管理**
   - `src/store/modules/behavior.js` - 行为数据状态管理

3. **页面组件**
   - `src/views/customer-behavior/dashboard.vue` - 行为追踪仪表板
   - `src/views/customer-behavior/page-visit.vue` - 页面访问分析
   - `src/views/customer-behavior/stay-time.vue` - 停留时间分析
   - `src/views/customer-behavior/bounce-rate.vue` - 跳出率分析
   - `src/views/customer-behavior/user-profile.vue` - 用户画像分析
   - `src/views/customer-behavior/index.vue` - 布局组件

4. **子组件**
   - `src/views/customer-behavior/components/MetricsCards.vue` - 指标卡片
   - `src/views/customer-behavior/components/TrendCharts.vue` - 趋势图表

5. **测试文件**
   - `tests/customer-behavior.test.js` - 综合测试用例

### 修改文件

1. **路由配置**
   - `src/router/index.js` - 添加客户行为分析路由

2. **状态管理**
   - `src/store/index.js` - 注册behavior模块

## 配置说明

### 路由配置

在 `src/router/index.js` 中新增的路由配置：

```javascript
{
  path: '/customer-behavior',
  component: Layout,
  redirect: '/customer-behavior/dashboard',
  name: 'customerBehavior',
  meta: {title: '客户行为分析', icon: 'chart'},
  children: [
    // ... 子路由配置
  ]
}
```

### 状态管理配置

在 `src/store/index.js` 中注册新模块：

```javascript
import behavior from './modules/behavior'

const store = new Vuex.Store({
  modules: {
    app,
    user,
    permission,
    behavior  // 新增
  },
  getters
})
```

## API接口说明

### 仪表板数据接口

```
GET /api/behavior/dashboard
参数：
- timeRange: 时间范围 (1d/7d/30d)
- refresh: 是否强制刷新

响应：
{
  totalVisits: 总访问量,
  averageStayTime: 平均停留时间,
  bounceRate: 跳出率,
  trendData: 趋势数据
}
```

### 页面访问分析接口

```
GET /api/behavior/page-visits
参数：
- startDate: 开始日期
- endDate: 结束日期
- limit: 返回数量限制

响应：
{
  pageRanking: 页面访问排行,
  visitSources: 访问来源分布,
  visitPaths: 访问路径分析
}
```

### 其他接口

详见 `src/api/behavior.js` 文件中的完整接口定义。

## 样式规范

遵循现有Mall Admin Web的设计规范：

- **主色调**：#409EFF（Element UI主色）
- **成功色**：#67C23A（正向指标）
- **警告色**：#E6A23C（注意指标）
- **危险色**：#F56C6C（异常指标）

## 测试

### 运行测试

```bash
npm test tests/customer-behavior.test.js
```

### 测试覆盖

- 组件渲染测试
- 数据处理逻辑测试
- 用户交互测试
- API集成测试
- 错误处理测试
- 性能测试

## 权限控制

基于现有的角色权限系统：

- **运营人员**：查看所有分析报告
- **数据分析师**：查看所有数据，支持导出
- **管理员**：完整功能权限

## 性能优化

1. **组件懒加载**：所有页面组件使用动态导入
2. **数据缓存**：Vuex状态缓存，减少重复请求
3. **图表优化**：使用V-Charts提供的性能优化特性
4. **响应式设计**：适配不同屏幕尺寸

## 注意事项

1. **依赖版本**：确保所有依赖版本与package.json一致
2. **API端点**：需要后端提供对应的API接口实现
3. **数据格式**：前后端数据格式需要保持一致
4. **浏览器兼容**：支持现代浏览器，IE需要额外配置

## 故障排除

### 常见问题

1. **路由无法访问**
   - 检查路由配置是否正确
   - 确认权限设置是否正确

2. **图表不显示**
   - 检查ECharts和V-Charts是否正确引入
   - 确认数据格式是否符合要求

3. **API请求失败**
   - 检查网络连接
   - 确认后端API是否正常

4. **状态管理异常**
   - 检查Vuex模块是否正确注册
   - 确认action和mutation是否正确定义

## 未来扩展

1. **实时数据推送**：使用WebSocket实现实时数据更新
2. **高级分析**：添加更多分析维度和算法
3. **报告导出**：支持PDF、Excel等格式导出
4. **自定义仪表板**：允许用户自定义分析面板

## 技术支持

如遇到技术问题，请参考：

1. Vue.js官方文档：https://cn.vuejs.org/
2. Element UI官方文档：https://element.eleme.cn/
3. ECharts官方文档：https://echarts.apache.org/
4. V-Charts文档：https://v-charts.js.org/