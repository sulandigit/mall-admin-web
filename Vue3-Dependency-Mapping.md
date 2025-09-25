# Mall-Admin-Web 依赖升级映射表

## 概述

本文档提供了Mall-Admin-Web项目从Vue 2升级到Vue 3过程中所有依赖包的详细升级映射，包括版本变更、API变化和迁移注意事项。

## 核心框架依赖升级

### Vue生态核心包

| 依赖包 | 当前版本 | 目标版本 | 变更类型 | 兼容性 | 迁移复杂度 |
|-------|---------|---------|----------|--------|------------|
| **vue** | 2.7.2 | 3.4+ | 🔴 重大升级 | 不兼容 | 高 |
| **vue-router** | 3.0.1 | 4.x | 🔴 重大升级 | 不兼容 | 中 |
| **vuex** | 3.0.1 | 4.x / pinia 2.x | 🔴 重大升级 | 不兼容 | 中 |
| **vue-template-compiler** | 2.5.2 | @vue/compiler-sfc | 🔴 包名变更 | 不兼容 | 低 |
| **vue-loader** | 13.3.0 | 16.x+ | 🔴 重大升级 | 不兼容 | 中 |

### 详细升级指南

#### 1. Vue 核心包升级
```bash
# 卸载Vue 2
npm uninstall vue vue-template-compiler

# 安装Vue 3
npm install vue@^3.4.0 @vue/compiler-sfc
```

**关键变更点:**
- 全局API从`Vue.`改为具名导入
- 创建应用实例: `new Vue()` → `createApp()`
- 挂载方式: `el: '#app'` → `mount('#app')`
- 全局配置: `Vue.config` → `app.config`

#### 2. Vue Router升级
```bash
# 升级Vue Router
npm install vue-router@^4.0.0
```

**关键变更点:**
- 创建路由: `new Router()` → `createRouter()`
- 历史模式: `mode: 'history'` → `history: createWebHistory()`
- 路由守卫参数变更
- 滚动行为API调整

#### 3. 状态管理升级
```bash
# 选项1: 升级Vuex
npm install vuex@^4.0.0

# 选项2: 迁移到Pinia (推荐)
npm install pinia@^2.0.0
```

**Vuex 4变更:**
- 创建store: `new Vuex.Store()` → `createStore()`
- TypeScript支持改善
- 组合式API支持

**Pinia优势:**
- 更简洁的API
- 原生TypeScript支持
- 更好的开发体验
- 自动代码分割

## UI组件库升级

### Element UI → Element Plus

| 依赖包 | 当前版本 | 目标版本 | 变更类型 | 迁移工作量 |
|-------|---------|---------|----------|------------|
| **element-ui** | 2.3.7 | → element-plus 2.x | 🔴 完全替换 | 高 |

#### 升级步骤
```bash
# 卸载Element UI
npm uninstall element-ui

# 安装Element Plus
npm install element-plus@^2.0.0
```

#### 主要变更对照表

| Element UI | Element Plus | 变更说明 |
|------------|--------------|----------|
| 全局引入 | `import ElementUI from 'element-ui'` | `import ElementPlus from 'element-plus'` |
| 样式引入 | `import 'element-ui/lib/theme-chalk/index.css'` | `import 'element-plus/dist/index.css'` |
| 国际化 | `import locale from 'element-ui/lib/locale/lang/zh-CN'` | `import zhCn from 'element-plus/dist/locale/zh-cn.mjs'` |
| 图标 | 内置图标 | 独立图标包 `@element-plus/icons-vue` |
| 主题定制 | SCSS变量 | CSS变量 + SCSS变量 |

#### 组件API变更

**表单组件:**
```vue
<!-- Element UI -->
<el-input v-model="value" placeholder="请输入">
  <i slot="prefix" class="el-icon-search"></i>
</el-input>

<!-- Element Plus -->
<el-input v-model="value" placeholder="请输入">
  <template #prefix>
    <Search />
  </template>
</el-input>
```

**图标使用:**
```vue
<!-- Element UI -->
<i class="el-icon-edit"></i>

<!-- Element Plus -->
<template>
  <Edit />
</template>
<script>
import { Edit } from '@element-plus/icons-vue'
</script>
```

## 构建工具依赖升级

### Webpack生态

| 依赖包 | 当前版本 | 目标版本 | 变更类型 | 备注 |
|-------|---------|---------|----------|------|
| **webpack** | 3.6.0 | 5.x | 🔴 重大升级 | 或迁移到Vite |
| **webpack-dev-server** | 2.9.1 | 4.x | 🔴 重大升级 | API变更 |
| **webpack-merge** | 4.1.0 | 5.x | 🟡 小版本升级 | 基本兼容 |
| **copy-webpack-plugin** | 4.0.1 | 10.x+ | 🔴 重大升级 | 配置格式变更 |
| **html-webpack-plugin** | 2.30.1 | 5.x | 🔴 重大升级 | 配置选项变更 |

### Babel生态

| 依赖包 | 当前版本 | 目标版本 | 变更类型 | 备注 |
|-------|---------|---------|----------|------|
| **babel-core** | 6.22.1 | @babel/core 7.x | 🔴 包名变更 | 全面重构 |
| **babel-loader** | 7.1.1 | 9.x | 🔴 重大升级 | 配置调整 |
| **babel-preset-env** | 1.3.2 | @babel/preset-env | 🔴 包名变更 | 功能增强 |

### CSS处理

| 依赖包 | 当前版本 | 目标版本 | 变更类型 | 备注 |
|-------|---------|---------|----------|------|
| **css-loader** | 0.28.0 | 6.x | 🔴 重大升级 | 配置格式变更 |
| **sass-loader** | 7.0.1 | 13.x | 🔴 重大升级 | 需要sass依赖 |
| **extract-text-webpack-plugin** | 3.0.0 | mini-css-extract-plugin | 🔴 包替换 | 功能替代 |

## 工具和辅助库升级

### HTTP和网络

| 依赖包 | 当前版本 | 目标版本 | 兼容性 | 升级建议 |
|-------|---------|---------|--------|----------|
| **axios** | 0.18.0 | 1.x | ✅ 兼容 | 推荐升级 |
| **js-cookie** | 2.2.0 | 3.x | ✅ 兼容 | 可选升级 |

### 样式和UI

| 依赖包 | 当前版本 | 目标版本 | 兼容性 | 升级建议 |
|-------|---------|---------|--------|----------|
| **normalize.css** | 8.0.0 | 8.x | ✅ 兼容 | 保持当前版本 |
| **nprogress** | 0.2.0 | 0.2.x | ✅ 兼容 | 保持当前版本 |
| **sass** | 1.32.8 | 1.x | ✅ 兼容 | 推荐升级到最新版 |

### 图表和可视化

| 依赖包 | 当前版本 | 目标版本 | Vue 3兼容性 | 迁移策略 |
|-------|---------|---------|-------------|----------|
| **echarts** | 4.2.0-rc.2 | 5.x | ✅ 兼容 | 升级并验证API |
| **v-charts** | 1.19.0 | ❌ 不兼容 | 需要替换 | 迁移到vue-echarts |
| **v-distpicker** | 1.0.20 | ❌ 未知 | 需要验证 | 寻找Vue 3版本 |

#### v-charts迁移方案
```bash
# 卸载v-charts
npm uninstall v-charts

# 安装vue-echarts
npm install vue-echarts@^6.0.0 echarts@^5.0.0
```

## 开发依赖升级

### 代码质量工具

| 依赖包 | 当前版本 | 目标版本 | 变更类型 | 配置变更 |
|-------|---------|---------|----------|----------|
| **eslint** | 未安装 | 8.x | 🟢 新增 | 需要配置 |
| **prettier** | 未安装 | 2.x | 🟢 新增 | 需要配置 |
| **@vue/eslint-config** | 未安装 | 最新 | 🟢 新增 | Vue 3规则 |

### 测试工具

| 依赖包 | 当前版本 | 目标版本 | 变更类型 | 备注 |
|-------|---------|---------|----------|------|
| **vitest** | 未安装 | 最新 | 🟢 新增 | 推荐测试框架 |
| **@vue/test-utils** | 未安装 | 2.x | 🟢 新增 | Vue 3测试工具 |

## 升级执行脚本

### 自动化升级脚本

```bash
#!/bin/bash
# Vue 3升级脚本

echo "🚀 开始Vue 3升级..."

# 1. 备份当前package.json
cp package.json package.json.backup

# 2. 卸载Vue 2相关依赖
echo "📦 卸载Vue 2依赖..."
npm uninstall vue vue-router vuex vue-template-compiler vue-loader
npm uninstall element-ui v-charts

# 3. 安装Vue 3核心依赖
echo "📦 安装Vue 3核心依赖..."
npm install vue@^3.4.0 vue-router@^4.0.0 vuex@^4.0.0
npm install @vue/compiler-sfc vue-loader@^16.0.0

# 4. 安装Element Plus
echo "📦 安装Element Plus..."
npm install element-plus@^2.0.0 @element-plus/icons-vue

# 5. 升级构建工具 (可选 - 使用Vite)
echo "📦 安装Vite..."
npm install vite @vitejs/plugin-vue --save-dev

# 6. 安装开发工具
echo "📦 安装开发工具..."
npm install eslint prettier @vue/eslint-config-prettier --save-dev

echo "✅ 依赖升级完成!"
echo "⚠️  请手动更新代码以适配新的API"
```

### 依赖检查脚本

```javascript
// check-compatibility.js
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const vue3IncompatiblePackages = [
  'vue-template-compiler',
  'element-ui', 
  'v-charts'
];

const dependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies
};

console.log('🔍 检查Vue 3不兼容的包...');
vue3IncompatiblePackages.forEach(pkg => {
  if (dependencies[pkg]) {
    console.log(`❌ 发现不兼容包: ${pkg}@${dependencies[pkg]}`);
  }
});

console.log('✅ 兼容性检查完成');
```

## 版本锁定建议

### 推荐的package.json核心依赖版本

```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "element-plus": "^2.4.0",
    "@element-plus/icons-vue": "^2.1.0",
    "axios": "^1.6.0",
    "echarts": "^5.4.0",
    "vue-echarts": "^6.6.0",
    "js-cookie": "^3.0.0",
    "normalize.css": "^8.0.1",
    "nprogress": "^0.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.5.0",
    "@vue/compiler-sfc": "^3.4.0",
    "vite": "^5.0.0",
    "eslint": "^8.50.0",
    "prettier": "^3.0.0",
    "@vue/eslint-config-prettier": "^8.0.0",
    "vitest": "^1.0.0",
    "@vue/test-utils": "^2.4.0"
  }
}
```

## 迁移验证清单

### 依赖安装验证
- [ ] 所有Vue 3依赖安装成功
- [ ] 没有版本冲突警告
- [ ] `npm install`无错误
- [ ] 开发服务器可以启动

### 功能验证
- [ ] 应用可以正常启动
- [ ] 路由导航正常
- [ ] 状态管理功能正常
- [ ] UI组件显示正常
- [ ] 图表组件渲染正常

### 性能验证
- [ ] 启动时间对比
- [ ] 打包体积对比
- [ ] 运行时性能对比
- [ ] 内存使用对比

## 常见问题和解决方案

### 1. Element Plus样式问题
**问题**: 组件样式不正确或缺失
**解决**: 确保正确引入Element Plus样式文件
```javascript
import 'element-plus/dist/index.css'
```

### 2. 图标显示问题
**问题**: Element Plus图标不显示
**解决**: 安装并注册图标组件
```javascript
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
```

### 3. 路由跳转问题
**问题**: 编程式导航不工作
**解决**: 更新路由跳转语法
```javascript
// Vue 2
this.$router.push({ path: '/home' })

// Vue 3
import { useRouter } from 'vue-router'
const router = useRouter()
router.push({ path: '/home' })
```

### 4. 状态管理访问问题
**问题**: 组件中无法访问Vuex状态
**解决**: 更新状态访问方式
```javascript
// Vue 2
this.$store.state.user

// Vue 3 Composition API
import { useStore } from 'vuex'
const store = useStore()
store.state.user
```

## 回滚方案

### 快速回滚步骤
1. 恢复package.json备份文件
2. 删除node_modules目录
3. 重新安装依赖: `npm install`
4. 恢复代码更改 (通过Git)

### 回滚验证
- [ ] 应用恢复到升级前状态
- [ ] 所有功能正常工作
- [ ] 没有遗留的Vue 3代码

---

*此映射表将随着升级过程的进行持续更新，确保所有依赖变更都得到准确记录和验证。*