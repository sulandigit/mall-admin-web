# ESLint + Prettier 代码规范配置指南

## 概述

本项目已集成 ESLint 和 Prettier 代码规范工具，提供统一的代码风格标准和自动格式化功能。

## 安装依赖

首先需要安装相关依赖包：

```bash
npm install --save-dev eslint@^7.32.0 prettier@^2.8.0 eslint-plugin-vue@^7.20.0 eslint-config-prettier@^8.6.0 eslint-plugin-prettier@^4.2.0 @vue/eslint-config-standard@^6.1.0 @babel/eslint-parser@^7.19.0
```

## 配置文件说明

### ESLint 配置 (.eslintrc.js)

- **基础配置**：继承 Vue 官方推荐规则和 JavaScript 标准规则
- **Vue 特定规则**：组件命名、属性命名等 Vue.js 最佳实践
- **自定义规则**：针对项目需求的特殊规则配置
- **环境配置**：支持浏览器、Node.js 和 ES6 环境

### Prettier 配置 (.prettierrc.js)

- **代码风格**：单引号、无分号、2空格缩进等
- **文件特定配置**：Vue、JSON、Markdown 等不同文件类型的特殊处理
- **兼容性设置**：与 ESLint 规则保持一致

### 忽略文件

- **.eslintignore**：指定 ESLint 不检查的文件和目录
- **.prettierignore**：指定 Prettier 不格式化的文件和目录

## 使用方法

### 命令行使用

```bash
# 检查代码规范
npm run lint

# 自动修复可修复的问题
npm run lint:fix

# 格式化代码
npm run format

# 检查代码格式
npm run format:check
```

### VS Code 集成

项目已配置 VS Code 工作区设置：

1. **自动保存时格式化**：保存文件时自动运行 Prettier
2. **实时错误提示**：编码时实时显示 ESLint 错误
3. **推荐插件**：自动推荐必要的 VS Code 扩展

#### 必需插件

- **Vetur**：Vue.js 语法支持
- **ESLint**：代码检查
- **Prettier**：代码格式化

### WebStorm 集成

1. 启用 ESLint 插件并指向项目配置文件
2. 配置 Prettier 插件使用项目配置
3. 设置保存时自动格式化
4. 配置代码检查实时运行

## 代码规范说明

### 基本规则

#### JavaScript/Vue 代码风格

- 使用单引号而非双引号
- 不使用分号结尾
- 缩进使用 2 个空格
- 对象和数组尾随逗号（ES5 兼容）
- 箭头函数单参数时省略括号

#### Vue 特定规则

- 组件名使用 PascalCase（大驼峰）命名
- 属性名使用 camelCase（小驼峰）命名
- 模板中组件使用 PascalCase
- 避免在模板中使用 v-html

#### 示例代码

**推荐的代码风格：**

```javascript
// JavaScript
const userInfo = {
  name: 'John',
  age: 25,
  roles: ['admin', 'user'],
}

const getUserName = user => user.name

// Vue 组件
export default {
  name: 'UserProfile',
  props: {
    userName: {
      type: String,
      required: true
    }
  },
  methods: {
    handleClick() {
      console.log('Button clicked')
    }
  }
}
```

**Vue 模板：**

```vue
<template>
  <div class="user-profile">
    <UserCard :user-name="userName" @click="handleClick" />
  </div>
</template>
```

### 错误处理

#### 常见错误及解决方案

1. **解析错误**
   - 检查 Babel 配置兼容性
   - 确保 @babel/eslint-parser 正确安装

2. **规则冲突**
   - ESLint 与 Prettier 冲突时，Prettier 规则优先
   - 检查 .eslintrc.js 中是否正确配置 prettier

3. **Vue 语法错误**
   - 确保 eslint-plugin-vue 版本与 Vue 版本匹配
   - 检查 Vue 组件语法是否正确

## 团队协作

### 配置文件管理

- 所有配置文件已纳入版本控制
- 团队成员克隆项目后自动获得统一配置
- 禁止个人修改全局配置规则

### 规则变更流程

1. 团队讨论新规则的必要性
2. 更新配置文件并在测试环境验证
3. 通过 Pull Request 流程审核
4. 合并后通知团队更新开发环境

### 新成员接入

1. 克隆项目仓库
2. 安装推荐的编辑器插件
3. 运行 `npm install` 安装依赖
4. 运行 `npm run lint` 验证环境配置
5. 阅读本指南了解代码规范

## 高级用法

### 自定义规则

在 .eslintrc.js 中添加项目特定规则：

```javascript
rules: {
  // 自定义规则示例
  'vue/component-name-in-template-casing': ['error', 'PascalCase'],
  'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn'
}
```

### 文件特定配置

针对特定文件或目录的规则覆盖：

```javascript
overrides: [
  {
    files: ['src/views/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off'
    }
  }
]
```

### Git Hooks 集成

安装 husky 和 lint-staged 实现提交前检查：

```bash
npm install --save-dev husky lint-staged
```

配置 package.json：

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "src/**/*.{js,vue}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  }
}
```

## 故障排除

### 性能优化

- 使用 .eslintignore 排除不必要的文件
- 配置编辑器只对修改的文件运行检查
- 定期更新依赖包版本

### 调试配置

查看实际使用的配置：

```bash
# 查看 ESLint 配置
npx eslint --print-config src/main.js

# 检查特定文件
npx eslint src/views/home/index.vue --debug
```

## 总结

通过配置 ESLint 和 Prettier，我们实现了：

- 统一的代码风格标准
- 自动化的代码格式化
- 实时的错误检测和修复
- 提升的代码质量和可维护性

建议开发过程中：
1. 保持配置文件的更新
2. 及时处理 ESLint 警告和错误
3. 充分利用编辑器集成功能
4. 定期检查和更新规则配置