# ESLint/Prettier 代码格式标准化指南

## 概述

本项目已集成 ESLint、Prettier 和 Stylelint 工具，用于统一代码格式标准和提高代码质量。本文档旨在帮助团队成员了解和使用这些工具。

## 工具介绍

### ESLint
- **用途**: JavaScript/Vue.js 代码质量检查
- **配置文件**: `.eslintrc.js`
- **忽略文件**: `.eslintignore`
- **主要功能**: 发现并修复代码质量问题，强制执行编码标准

### Prettier
- **用途**: 代码格式化工具
- **配置文件**: `.prettierrc.js`
- **忽略文件**: `.prettierignore`
- **主要功能**: 自动格式化代码，保持一致的代码风格

### Stylelint
- **用途**: CSS/SCSS 代码规范检查
- **配置文件**: `.stylelintrc.js`
- **主要功能**: 检查和修复样式代码问题

## 安装依赖

首次设置项目时，需要安装相关依赖（确保已安装 Node.js）：

```bash
npm install
```

如果 package.json 中的依赖项发生变化，运行：

```bash
npm install
```

初始化 Git Hooks：

```bash
npm run prepare
```

## 可用脚本命令

### 代码质量检查

```bash
# 检查 JavaScript/Vue 代码质量问题
npm run lint

# 自动修复可修复的代码质量问题
npm run lint:fix

# 检查样式代码质量问题
npm run style:lint

# 自动修复样式代码问题
npm run style:fix

# 检查所有代码质量问题
npm run lint:all
```

### 代码格式化

```bash
# 格式化所有支持的文件
npm run format

# 检查代码格式是否符合规范（CI/CD 使用）
npm run format:check

# 一键修复所有问题并格式化
npm run fix:all
```

## 编辑器配置

### VS Code 配置

项目已包含 `.vscode/settings.json` 和 `.vscode/extensions.json` 配置文件。

#### 推荐安装的扩展

1. **Prettier - Code formatter** (`esbenp.prettier-vscode`)
2. **ESLint** (`dbaeumer.vscode-eslint`)
3. **Stylelint** (`stylelint.vscode-stylelint`)
4. **Vetur** (`octref.vetur`) - Vue.js 支持
5. **EditorConfig for VS Code** (`editorconfig.editorconfig`)

#### 自动配置说明

- **保存时自动格式化**: 文件保存时自动运行 Prettier
- **保存时自动修复**: 自动修复 ESLint 和 Stylelint 问题
- **实时错误提示**: 编写代码时实时显示错误和警告

### WebStorm/IntelliJ IDEA 配置

1. **启用 ESLint**:
   - `Settings` → `Languages & Frameworks` → `JavaScript` → `Code Quality Tools` → `ESLint`
   - 勾选 \"Automatic ESLint configuration\"

2. **启用 Prettier**:
   - `Settings` → `Languages & Frameworks` → `JavaScript` → `Prettier`
   - 设置 \"Prettier package\" 路径
   - 勾选 \"On save\" 和 \"On 'Reformat Code' action\"

3. **启用 Stylelint**:
   - `Settings` → `Languages & Frameworks` → `Style Sheets` → `Stylelint`
   - 勾选 \"Enable\"

## Git Hooks 工作流程

项目配置了 `pre-commit` Hook，在每次提交代码前自动执行以下检查：

1. **对暂存文件运行 ESLint**: 检查 `.js` 和 `.vue` 文件
2. **对暂存文件运行 Stylelint**: 检查 `.vue`、`.scss`、`.css` 文件
3. **对暂存文件运行 Prettier**: 格式化所有支持的文件类型

### Hook 行为说明

- ✅ **检查通过**: 允许提交
- ❌ **检查失败**: 阻止提交并显示错误信息
- 🔧 **自动修复**: 可修复的问题会被自动修复并重新暂存

### 跳过 Hook（紧急情况）

```bash
git commit --no-verify -m \"紧急修复\"
```

**注意**: 仅在紧急情况下使用，建议后续补充修复代码质量问题。

## 代码规范说明

### JavaScript/Vue.js 规范

#### 基础规则
- 使用单引号而非双引号
- 不使用分号（除非必要）
- 使用 2 空格缩进
- 行末不保留空格
- 文件末尾保留一个空行

#### Vue.js 特定规则
- 组件名称使用 PascalCase
- 模板中组件使用 PascalCase
- HTML 属性每行一个（多属性时）
- 自闭合组件使用自闭合语法
- 属性顺序遵循 Vue 官方风格指南

#### 示例

```vue
<template>
  <div class=\"example-component\">
    <ElButton
      type=\"primary\"
      size=\"medium\"
      @click=\"handleClick\"
    >
      点击按钮
    </ElButton>
  </div>
</template>

<script>
export default {
  name: 'ExampleComponent',
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isLoading: false
    }
  },
  methods: {
    handleClick() {
      this.isLoading = true
      // 处理逻辑
    }
  }
}
</script>

<style lang=\"scss\" scoped>
.example-component {
  padding: 16px;
  background-color: #fff;
}
</style>
```

### CSS/SCSS 规范

#### 基础规则
- 使用单引号
- 颜色值使用小写
- 颜色值使用缩写形式（如 `#fff` 而非 `#ffffff`）
- 数值为 0 时不添加单位
- 属性值使用小写
- 使用 2 空格缩进

#### 属性排序
项目使用 `stylelint-config-recess-order` 进行属性排序：

1. 定位属性（position, top, right, bottom, left）
2. 盒模型（display, float, width, height, margin, padding）
3. 排版（font, line-height, text-align, color）
4. 视觉效果（background, border, opacity）
5. 其他属性

#### 示例

```scss
.example-styles {
  position: relative;
  display: flex;
  width: 100%;
  height: 200px;
  margin: 16px 0;
  padding: 8px;
  font-size: 14px;
  color: #333;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
}
```

## 常见问题解决

### 1. ESLint 错误

**问题**: 提交时出现 ESLint 错误
**解决**: 
```bash
npm run lint:fix
```

### 2. Prettier 格式化冲突

**问题**: 代码格式与 ESLint 冲突
**解决**: 项目已配置 `eslint-config-prettier`，通常不会冲突。如遇到问题，运行：
```bash
npm run fix:all
```

### 3. Stylelint 错误

**问题**: 样式代码不符合规范
**解决**:
```bash
npm run style:fix
```

### 4. Git Hook 无法执行

**问题**: pre-commit hook 不工作
**解决**:
```bash
# 重新安装 husky
npm run prepare

# 检查 hook 文件权限
chmod +x .husky/pre-commit
```

### 5. 编辑器不自动格式化

**问题**: VS Code 保存时不自动格式化
**解决**:
1. 确保安装了推荐的扩展
2. 检查 `.vscode/settings.json` 配置
3. 重启编辑器

### 6. Node.js 版本兼容性

**问题**: 工具运行失败
**解决**: 确保使用 Node.js 12+ 版本

## 团队协作约定

### 1. 代码提交规范
- 每次提交前必须通过所有检查
- 提交信息要清晰描述变更内容
- 大型重构建议分多次提交

### 2. 代码审查要点
- 检查是否遵循代码规范
- 验证格式化是否正确
- 确认无明显的代码质量问题

### 3. 配置文件变更
- ESLint、Prettier、Stylelint 配置变更需团队讨论
- 配置变更需要更新文档
- 重大变更需要提前通知团队

### 4. 新成员入职
1. 阅读本文档
2. 安装推荐的编辑器扩展
3. 运行 `npm install` 和 `npm run prepare`
4. 进行一次测试提交验证配置

## 持续改进

### 定期检查
- 每月检查工具版本更新
- 收集团队反馈优化规则配置
- 关注新的最佳实践

### 指标监控
- 跟踪代码质量指标变化
- 监控构建时间影响
- 统计自动修复的问题数量

## 相关链接

- [ESLint 官方文档](https://eslint.org/docs/)
- [Prettier 官方文档](https://prettier.io/docs/)
- [Stylelint 官方文档](https://stylelint.io/)
- [Vue.js 风格指南](https://v2.vuejs.org/v2/style-guide/)
- [Element UI 文档](https://element.eleme.cn/)

---

*本文档会根据项目需要持续更新，如有问题请联系项目维护者。*