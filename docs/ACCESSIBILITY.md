# 无障碍访问指南

本项目遵循 WCAG 2.1 AA 级无障碍标准，为所有用户提供平等的访问体验。

## 目录

- [概述](#概述)
- [已实现的无障碍功能](#已实现的无障碍功能)
- [键盘导航](#键盘导航)
- [屏幕阅读器支持](#屏幕阅读器支持)
- [开发指南](#开发指南)
- [测试工具](#测试工具)
- [已知问题](#已知问题)

## 概述

本系统支持以下无障碍技术：
- 屏幕阅读器（NVDA、JAWS、VoiceOver等）
- 键盘导航
- 高对比度模式
- 缩放至200%
- 减少动画模式

## 已实现的无障碍功能

### 1. 语义化标记
- 使用正确的HTML语义元素
- 实现ARIA landmarks（banner、navigation、main、complementary等）
- 为所有表单控件提供标签
- 使用heading层级结构

### 2. 键盘可访问性
- 所有交互元素都可通过键盘访问
- 实现逻辑的Tab导航顺序
- 提供跳转链接
- 支持自定义快捷键

### 3. 颜色和对比度
- 所有文本与背景的对比度至少为4.5:1
- 大文本对比度至少为3:1
- 不仅依赖颜色传达信息
- 支持高对比度模式

### 4. 响应式设计
- 支持移动设备访问
- 最小点击目标44x44像素
- 支持缩放至200%而不丢失功能

## 键盘导航

### 全局快捷键
- `Alt + M`: 跳转到主菜单
- `Alt + C`: 跳转到主内容区域
- `Alt + S`: 跳转到搜索框
- `F6`: 在主要区域间循环导航
- `Esc`: 关闭对话框或取消操作

### 导航规则
- `Tab`: 向前移动焦点
- `Shift + Tab`: 向后移动焦点
- `Enter/Space`: 激活按钮和链接
- `Arrow Keys`: 在菜单、列表中导航
- `Home/End`: 跳转到列表开始/结束

### 表单导航
- `Tab`: 在表单字段间移动
- `Enter`: 提交表单
- `Esc`: 取消输入

## 屏幕阅读器支持

### 实时通知
系统会自动宣告以下信息：
- 页面切换
- 表单验证错误
- 操作成功/失败
- 状态变化

### ARIA标签
- `aria-label`: 为元素提供可访问名称
- `aria-describedby`: 关联描述信息
- `aria-expanded`: 指示展开/折叠状态
- `aria-selected`: 指示选中状态
- `aria-live`: 实时通知区域

## 开发指南

### 使用无障碍组件

#### 1. 无障碍表格
```vue
<template>
  <AccessibleTable
    :data="tableData"
    caption="用户列表"
    description="显示所有注册用户的信息"
    :field-labels="fieldLabels"
    @selection-change="handleSelection">
    
    <el-table-column prop="name" label="姓名"></el-table-column>
    <el-table-column prop="email" label="邮箱"></el-table-column>
    
    <template slot="actions" slot-scope="scope">
      <el-button @click="edit(scope.row)">编辑</el-button>
      <el-button @click="delete(scope.row)">删除</el-button>
    </template>
  </AccessibleTable>
</template>
```

#### 2. 无障碍表单
```vue
<template>
  <AccessibleForm
    :model="form"
    :rules="rules"
    form-title="用户信息"
    description="请填写用户的基本信息"
    :field-labels="fieldLabels">
    
    <el-form-item prop="name">
      <el-input v-model="form.name" placeholder="请输入姓名"></el-input>
    </el-form-item>
    
    <template slot="actions">
      <el-button @click="submit" type="primary">保存</el-button>
      <el-button @click="cancel">取消</el-button>
    </template>
  </AccessibleForm>
</template>
```

#### 3. 使用无障碍指令
```vue
<template>
  <!-- 自动焦点 -->
  <el-input v-focus="true"></el-input>
  
  <!-- ARIA属性 -->
  <div v-aria="{ label: '用户头像', describedby: 'avatar-desc' }">
    <img src="avatar.jpg" alt="用户头像">
    <span id="avatar-desc">点击可更换头像</span>
  </div>
  
  <!-- 键盘导航 -->
  <div v-keyboard-nav="{ role: 'menu' }">
    <button role="menuitem">选项1</button>
    <button role="menuitem">选项2</button>
  </div>
  
  <!-- 实时宣告 -->
  <div v-announce="statusMessage"></div>
  
  <!-- 焦点陷阱 -->
  <div v-trap-focus="dialogVisible">
    <!-- 对话框内容 -->
  </div>
</template>
```

### 开发规范

#### 1. 图片
```html
<!-- 内容图片 -->
<img src="chart.png" alt="2023年销售趋势图，显示持续增长">

<!-- 装饰图片 -->
<img src="decoration.png" alt="" aria-hidden="true">

<!-- 复杂图片 -->
<img src="complex-chart.png" alt="销售数据图表" aria-describedby="chart-desc">
<div id="chart-desc">
  详细描述：该图表显示了2023年1-12月的销售数据...
</div>
```

#### 2. 按钮
```html
<!-- 文本按钮 -->
<el-button>保存</el-button>

<!-- 图标按钮 -->
<el-button aria-label="删除用户">
  <i class="el-icon-delete" aria-hidden="true"></i>
</el-button>

<!-- 切换按钮 -->
<el-button 
  :aria-pressed="isPressed.toString()"
  @click="toggle">
  {{ isPressed ? '已开启' : '已关闭' }}
</el-button>
```

#### 3. 表单
```html
<!-- 带标签的输入框 -->
<el-form-item label="用户名" prop="username">
  <el-input 
    v-model="form.username"
    aria-label="用户名"
    aria-required="true"
    aria-describedby="username-help">
  </el-input>
  <div id="username-help">用户名长度为3-20个字符</div>
</el-form-item>

<!-- 错误状态 -->
<el-form-item prop="email" :error="emailError">
  <el-input 
    v-model="form.email"
    aria-label="邮箱地址"
    :aria-invalid="!!emailError"
    aria-describedby="email-error">
  </el-input>
  <div id="email-error" v-if="emailError" role="alert">
    {{ emailError }}
  </div>
</el-form-item>
```

## 测试工具

### 自动化测试
使用 `accessibility-checker.js` 进行自动化无障碍测试：

```javascript
import AccessibilityChecker from '@/utils/accessibility-checker'

// 检查页面无障碍性
const checker = new AccessibilityChecker()
const issues = await checker.checkPage()
console.log('无障碍问题：', issues)

// 检查特定元素
const elementIssues = checker.checkElement(document.querySelector('.my-component'))
```

### 手动测试清单

#### 键盘测试
- [ ] 使用Tab键可以访问所有交互元素
- [ ] Tab顺序符合逻辑
- [ ] 焦点指示器清晰可见
- [ ] 可以使用Enter/Space激活按钮
- [ ] 可以使用Esc关闭对话框

#### 屏幕阅读器测试
- [ ] 所有内容都能被正确朗读
- [ ] 表单字段有正确的标签
- [ ] 图片有合适的alt文本
- [ ] 页面有正确的heading结构
- [ ] 状态变化会被宣告

#### 视觉测试
- [ ] 文本对比度符合标准
- [ ] 页面可以缩放至200%
- [ ] 高对比度模式下正常显示
- [ ] 点击目标足够大（44x44px）

### 浏览器扩展
推荐使用以下浏览器扩展进行测试：
- axe DevTools
- WAVE Evaluation Tool
- Lighthouse

## 已知问题

### 当前限制
1. 某些第三方组件可能不完全符合无障碍标准
2. 复杂图表可能需要额外的描述
3. 拖拽功能可能对某些用户不可用

### 计划改进
1. 增加更多语音操作支持
2. 改进复杂数据可视化的可访问性
3. 添加更多自定义快捷键

## 联系我们

如果您在使用过程中遇到无障碍问题，请联系我们：
- 邮箱：accessibility@example.com
- 电话：400-xxx-xxxx

我们致力于为所有用户提供最佳的访问体验。