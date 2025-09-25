# 库存周转率报表功能说明

## 功能概述

库存周转率报表功能已成功集成到商城管理后台系统中，提供了完整的库存周转率分析和管理功能。

## 新增文件清单

### API层
- `src/api/inventoryTurnover.js` - 库存周转率相关API接口

### 状态管理
- `src/store/modules/inventoryReport.js` - 库存报表状态管理模块
- `src/store/index.js` - 已更新，注册新的状态模块

### 工具类
- `src/utils/turnoverCalculator.js` - 周转率计算工具类和混入

### 视图组件
- `src/views/pms/report/inventory-turnover/index.vue` - 主报表页面
- `src/views/pms/report/inventory-turnover/components/FilterPanel.vue` - 筛选条件面板
- `src/views/pms/report/inventory-turnover/components/SummaryCard.vue` - 汇总指标卡片
- `src/views/pms/report/inventory-turnover/components/TurnoverChart.vue` - 周转率趋势图表
- `src/views/pms/report/inventory-turnover/components/TurnoverTable.vue` - 详细数据表格

### 路由配置
- `src/router/index.js` - 已更新，添加报表路由

## 功能特性

### 1. 筛选条件面板 (FilterPanel)
- 日期范围选择（支持快速选择：近7天、30天、90天、一年）
- 商品分类级联选择
- 品牌筛选
- 周转率级别筛选（快速、正常、缓慢、滞销）
- 商品名称搜索
- 库存价值范围筛选

### 2. 汇总指标卡片 (SummaryCard)
- 总商品数统计
- 平均周转率及增长趋势
- 快速周转商品数及占比
- 滞销风险库存价值
- 周转率分布统计
- 库存价值分类统计
- 智能管理建议

### 3. 趋势图表 (TurnoverChart)
- 支持折线图、柱状图、面积图切换
- 时间粒度选择（日、周、月、季）
- 交互式数据点提示
- 区域缩放功能
- 基线标识（快速周转4.0次、正常周转2.0次）
- 图表导出功能

### 4. 详细数据表格 (TurnoverTable)
- 商品信息展示（图片、名称、编码、品牌）
- 库存信息（期初、期末、平均库存）
- 销售数据（销量、成本）
- 周转率和天数计算
- 风险等级标识
- 多列排序支持
- 分页功能
- 批量操作（导出、分析）

### 5. 计算逻辑 (TurnoverCalculator)
- 周转率计算：销售成本 ÷ 平均库存价值
- 周转天数计算：统计天数 ÷ 库存周转率
- 智能分级标准：
  - 快速周转：≥4.0次 (绿色)
  - 正常周转：2.0-3.9次 (蓝色)
  - 缓慢周转：1.0-1.9次 (橙色)
  - 滞销风险：<1.0次 (红色)

## 访问路径

功能已集成到PMS（商品管理）模块下：
```
商品 -> 商品报表 -> 库存周转率报表
```

路由路径：`/pms/report/inventory-turnover`

## 技术实现

### 状态管理
使用Vuex进行集中状态管理，包括：
- 筛选条件状态
- 分页信息
- 排序设置
- 加载状态
- 报表数据

### 组件化架构
采用高度模块化的组件设计：
- 职责单一，易于维护
- 组件间通过事件通信
- 支持复用和扩展

### 响应式设计
- 适配不同屏幕尺寸
- 表格支持横向滚动
- 图表自适应容器大小

## 后端接口需求

系统需要以下后端API支持：

### 1. 获取库存周转率列表
```
GET /api/report/inventory-turnover
```
查询参数：时间范围、分类、品牌、级别、分页等

### 2. 获取周转率趋势数据
```
GET /api/report/inventory-turnover/trend
```
查询参数：时间范围、粒度、分类等

### 3. 导出周转率报表
```
POST /api/report/inventory-turnover/export
```
支持Excel、PDF等格式导出

### 4. 获取分类和品牌选项
```
GET /api/productCategory/list/withChildren
GET /api/brand/listAll
```

## 部署说明

1. 确保项目已安装依赖：
   - Vue.js 2.7.2
   - Element UI 2.3.7
   - v-charts 1.19.0
   - Vuex 3.0.1

2. 无需额外配置，功能已完全集成

3. 建议在生产环境中配置CDN加速图表组件加载

## 扩展功能

该报表系统为未来扩展预留了接口：
- 支持添加更多图表类型
- 支持自定义筛选条件
- 支持数据钻取分析
- 支持报表订阅和定时推送

---

**注意**: 该功能模块已通过语法检查，无编译错误，可直接在具备Node.js环境的开发环境中运行测试。