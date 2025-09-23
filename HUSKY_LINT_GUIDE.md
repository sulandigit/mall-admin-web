# Mall Admin Web - Husky + lint-staged 集成指南

## 概述

本项目已集成 Husky + lint-staged 工具链，用于在 Git 提交前自动执行代码质量检查，包括：

- **ESLint**: JavaScript 和 Vue.js 代码语法检查
- **Prettier**: 代码格式化
- **Stylelint**: CSS/SCSS 样式检查
- **Husky**: Git hooks 管理
- **lint-staged**: 只对暂存的文件执行检查

## 安装依赖

在开始使用之前，请确保安装所有必要的依赖包：

```bash
npm install
```

如果依赖安装失败，可以尝试：

```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

## 可用命令

### 代码检查命令

```bash
# 运行 ESLint 检查 JavaScript 和 Vue 文件
npm run lint

# 运行 ESLint 并自动修复可修复的问题
npm run lint:fix

# 检查代码格式是否符合 Prettier 规范
npm run format:check

# 使用 Prettier 格式化代码
npm run format

# 运行 Stylelint 检查样式文件
npm run stylelint

# 运行 Stylelint 并自动修复可修复的问题
npm run stylelint:fix
```

### 工具链管理

```bash
# 重新安装 Husky hooks（如果 .husky 目录被删除）
npm run prepare
```

## Git 提交流程

### 1. 正常提交流程

```bash
# 1. 添加文件到暂存区
git add .

# 2. 提交（会自动触发代码检查）
git commit -m "feat(user): add user login functionality"

# 3. 如果检查通过，提交成功
# 4. 如果检查失败，修复问题后重新提交
```

### 2. 提交信息格式

提交信息必须遵循以下格式：

```
type(scope): subject
```

**类型（type）** - 必需：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整（不影响代码运行）
- `refactor`: 重构（既不是新增功能，也不是修复 bug）
- `perf`: 性能优化
- `test`: 添加测试
- `chore`: 构建过程或辅助工具的变动
- `revert`: 回滚之前的 commit

**范围（scope）** - 可选：
- 影响的模块或组件名称
- 例如：`user`, `product`, `order`, `api`

**主题（subject）** - 必需：
- 简短描述（不超过 50 个字符）
- 使用动词原形，首字母小写
- 结尾不加句号

**示例：**
```bash
git commit -m "feat(user): add user login functionality"
git commit -m "fix(api): resolve authentication issue"
git commit -m "docs: update installation guide"
git commit -m "style(component): adjust button spacing"
```

### 3. 检查失败处理

如果提交时代码检查失败：

1. **查看错误信息**：终端会显示具体的错误详情
2. **修复问题**：根据错误信息修复代码
3. **重新添加**：`git add .`
4. **重新提交**：`git commit -m "your message"`

## 编辑器集成

### VS Code 推荐配置

在项目根目录创建 `.vscode/settings.json`：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.stylelint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "vue"
  ],
  "stylelint.validate": [
    "css",
    "scss",
    "vue"
  ]
}
```

### 推荐的 VS Code 插件

- **ESLint**: 提供 ESLint 集成
- **Prettier**: 代码格式化
- **Stylelint**: CSS/SCSS 检查
- **Vetur**: Vue.js 支持

## 配置文件说明

### ESLint 配置 (`.eslintrc.js`)

```javascript
module.exports = {
  // 基础配置
  root: true,
  parserOptions: {
    parser: '@babel/eslint-parser',
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: [
    'plugin:vue/essential',
    'eslint:recommended',
    'plugin:prettier/recommended'
  ],
  // 自定义规则...
}
```

### Prettier 配置 (`.prettierrc`)

```json
{
  "semi": true,
  "trailingComma": "es5", 
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Stylelint 配置 (`.stylelintrc.js`)

```javascript
module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    // 自定义样式规则...
  }
}
```

### lint-staged 配置 (`package.json`)

```json
{
  "lint-staged": {
    "*.{js,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,vue}": [
      "stylelint --fix"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

## 常见问题

### Q1: 提交时卡住不动

**原因**: 可能是某个检查工具执行时间过长

**解决方案**:
```bash
# 手动运行检查，查看具体问题
npm run lint
npm run format:check
npm run stylelint
```

### Q2: ESLint 报告解析错误

**原因**: Babel 配置问题或 ESLint 解析器配置不正确

**解决方案**:
1. 检查 `.babelrc` 文件是否存在且配置正确
2. 确保 `@babel/eslint-parser` 已安装
3. 检查 `.eslintrc.js` 中的 `parserOptions` 配置

### Q3: Prettier 和 ESLint 冲突

**原因**: 格式化规则冲突

**解决方案**:
项目已配置 `eslint-config-prettier` 来解决冲突。如果仍有问题：
```bash
# 先运行 Prettier
npm run format
# 再运行 ESLint
npm run lint:fix
```

### Q4: Stylelint 报告未知规则

**原因**: SCSS 语法或 Vue 单文件组件样式解析问题

**解决方案**:
项目配置已包含对 SCSS 和 Vue 文件的支持。如果仍有问题，检查 `.stylelintrc.js` 中的 `overrides` 配置。

### Q5: Git hooks 不生效

**原因**: Husky 未正确安装或权限问题

**解决方案**:
```bash
# 重新安装 Husky
npm run prepare

# 检查 hooks 文件权限
ls -la .husky/
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### Q6: 想跳过某次提交的检查

**临时跳过**（不推荐）:
```bash
# 跳过 pre-commit hook
git commit -m "your message" --no-verify
```

**注意**: 频繁跳过检查会降低代码质量，建议修复问题后正常提交。

## 团队协作规范

### 1. 新成员加入

1. **克隆项目**:
   ```bash
   git clone <repository-url>
   cd mall-admin-web
   ```

2. **安装依赖**:
   ```bash
   npm install
   ```

3. **验证工具链**:
   ```bash
   npm run lint
   npm run format:check
   npm run stylelint
   ```

### 2. 代码审查要点

- 确保所有文件通过 ESLint 检查
- 确保代码格式符合 Prettier 规范
- 确保样式文件通过 Stylelint 检查
- 确保提交信息格式正确

### 3. 持续集成

建议在 CI/CD 流程中添加以下检查：

```bash
# 安装依赖
npm ci

# 运行所有检查
npm run lint
npm run format:check
npm run stylelint

# 构建项目
npm run build
```

## 升级和维护

### 依赖包升级

定期检查和升级依赖包：

```bash
# 检查过时的包
npm outdated

# 升级特定包
npm update eslint
npm update prettier
npm update stylelint

# 或者升级所有包
npm update
```

### 配置文件调整

如需调整规则：

1. **ESLint 规则**: 修改 `.eslintrc.js` 中的 `rules` 部分
2. **Prettier 格式**: 修改 `.prettierrc` 文件
3. **Stylelint 规则**: 修改 `.stylelintrc.js` 中的 `rules` 部分
4. **lint-staged 配置**: 修改 `package.json` 中的 `lint-staged` 部分

### 规则调整建议

- 新规则先设为 `warn`，稳定后改为 `error`
- 团队讨论后再进行重大规则变更
- 保持规则配置的版本控制历史

## 支持和反馈

如遇到问题或有改进建议，请：

1. 检查本文档的常见问题部分
2. 查看项目的 Issues
3. 联系项目维护者

---

*本文档最后更新时间：2025年9月*