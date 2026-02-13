# ESLint/Prettier 配置安装指南

## 环境要求

- Node.js 12.0 或更高版本
- npm 6.0 或更高版本

## 依赖安装

### 第一步：安装核心依赖

```bash
# ESLint 相关
npm install --save-dev eslint@^8.12.0
npm install --save-dev eslint-plugin-vue@^8.6.0
npm install --save-dev @vue/eslint-config-standard@^6.1.0
npm install --save-dev @babel/eslint-parser@^7.17.0

# Prettier 相关
npm install --save-dev prettier@^2.6.2
npm install --save-dev eslint-config-prettier@^8.5.0
npm install --save-dev eslint-plugin-prettier@^4.0.0

# ESLint 插件
npm install --save-dev eslint-plugin-import@^2.25.4
npm install --save-dev eslint-plugin-node@^11.1.0
npm install --save-dev eslint-plugin-promise@^6.0.0
npm install --save-dev eslint-plugin-standard@^5.0.0
```

### 第二步：安装 Stylelint 依赖

```bash
# Stylelint 核心
npm install --save-dev stylelint@^14.6.1
npm install --save-dev stylelint-config-standard@^25.0.0
npm install --save-dev stylelint-config-prettier@^9.0.3

# SCSS 支持
npm install --save-dev stylelint-config-standard-scss@^3.0.0
npm install --save-dev stylelint-scss@^4.2.0
npm install --save-dev postcss-scss@^4.0.3

# Vue 支持
npm install --save-dev stylelint-config-standard-vue@^1.0.0
npm install --save-dev postcss-html@^1.4.1

# 属性排序
npm install --save-dev stylelint-config-recess-order@^3.0.0
npm install --save-dev stylelint-order@^5.0.0
```

### 第三步：安装 Git Hooks 依赖

```bash
# Git Hooks
npm install --save-dev husky@^7.0.4
npm install --save-dev lint-staged@^12.3.7
```

### 第四步：一键安装（推荐）

```bash
# 直接运行此命令安装所有依赖
npm install --save-dev eslint@^8.12.0 eslint-plugin-vue@^8.6.0 @vue/eslint-config-standard@^6.1.0 @babel/eslint-parser@^7.17.0 prettier@^2.6.2 eslint-config-prettier@^8.5.0 eslint-plugin-prettier@^4.0.0 eslint-plugin-import@^2.25.4 eslint-plugin-node@^11.1.0 eslint-plugin-promise@^6.0.0 eslint-plugin-standard@^5.0.0 stylelint@^14.6.1 stylelint-config-standard@^25.0.0 stylelint-config-prettier@^9.0.3 stylelint-config-standard-scss@^3.0.0 stylelint-scss@^4.2.0 postcss-scss@^4.0.3 stylelint-config-standard-vue@^1.0.0 postcss-html@^1.4.1 stylelint-config-recess-order@^3.0.0 stylelint-order@^5.0.0 husky@^7.0.4 lint-staged@^12.3.7
```

## 初始化配置

### 初始化 Git Hooks

```bash
npm run prepare
```

### 验证安装

```bash
# 检查 ESLint
npx eslint --version

# 检查 Prettier
npx prettier --version

# 检查 Stylelint
npx stylelint --version
```

## 测试配置

### 测试 ESLint

```bash
npm run lint
```

### 测试 Prettier

```bash
npm run format:check
```

### 测试 Stylelint

```bash
npm run style:lint
```

### 测试 Git Hooks

```bash
# 提交一个测试文件来验证 pre-commit hook
git add .
git commit -m \"test: 验证代码质量工具配置\"
```

## 故障排除

### 常见错误及解决方案

1. **权限错误**
   ```bash
   chmod +x .husky/pre-commit
   ```

2. **Node.js 版本过低**
   - 升级到 Node.js 12+ 版本

3. **依赖冲突**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Git Hooks 不工作**
   ```bash
   rm -rf .husky
   npm run prepare
   ```

## 注意事项

1. 确保在项目根目录执行安装命令
2. 安装完成后运行 `npm run prepare` 初始化 Git Hooks
3. 建议团队使用相同的 Node.js 版本
4. 配置文件已经创建完成，无需手动编辑

## 下一步

安装完成后，请参考 `CODE_STANDARDS.md` 文档了解具体的使用方法和团队协作规范。