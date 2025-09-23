# 代码质量工具集成说明

## 新增功能

本项目已集成以下代码质量工具：

- ✅ **ESLint**: JavaScript/Vue.js 代码检查
- ✅ **Prettier**: 代码格式化 
- ✅ **Stylelint**: CSS/SCSS 样式检查
- ✅ **Husky**: Git hooks 管理
- ✅ **lint-staged**: 增量代码检查

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 日常开发命令
```bash
# 代码检查
npm run lint          # ESLint 检查
npm run format        # Prettier 格式化
npm run stylelint     # Stylelint 检查

# 自动修复
npm run lint:fix      # 修复 ESLint 问题
npm run stylelint:fix # 修复样式问题
```

### 3. Git 提交
```bash
git add .
git commit -m "feat(module): add new feature"
```

提交时会自动执行代码检查，只有通过检查才能成功提交。

## 提交信息格式

```
type(scope): subject
```

**类型**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

**示例**:
- `feat(user): add login functionality`
- `fix(api): resolve authentication issue`
- `docs: update README`

## 详细文档

完整使用指南请参考：[HUSKY_LINT_GUIDE.md](./HUSKY_LINT_GUIDE.md)

## 注意事项

- 首次使用请确保运行 `npm install` 安装所有依赖
- 如遇到问题，请参考详细文档中的常见问题部分
- 编辑器建议安装 ESLint、Prettier、Stylelint 插件以获得更好的开发体验