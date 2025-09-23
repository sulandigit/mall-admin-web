#!/bin/bash

# Mall Admin Web - Husky + lint-staged 安装脚本
# 此脚本用于安装项目所需的代码质量工具依赖

echo "🚀 开始安装 Mall Admin Web 代码质量工具..."
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未检测到 Node.js"
    echo "请先安装 Node.js (推荐版本 >= 14.0.0)"
    echo "下载地址：https://nodejs.org/"
    exit 1
fi

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误：未检测到 npm"
    echo "请确保 npm 已正确安装"
    exit 1
fi

# 显示版本信息
echo "📋 环境信息："
echo "Node.js 版本：$(node --version)"
echo "npm 版本：$(npm --version)"
echo ""

# 清理旧的安装
echo "🧹 清理旧的安装文件..."
rm -rf node_modules
rm -f package-lock.json

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 检查安装是否成功
if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败！"
    echo ""
    echo "可能的解决方案："
    echo "1. 检查网络连接"
    echo "2. 清理 npm 缓存：npm cache clean --force"
    echo "3. 使用国内镜像：npm install --registry=https://registry.npmmirror.com"
    echo "4. 使用 yarn 替代：yarn install"
    exit 1
fi

# 初始化 Husky
echo "🔧 初始化 Husky..."
npm run prepare

# 检查关键工具是否可用
echo ""
echo "🔍 验证工具安装..."

# 检查 ESLint
if npx eslint --version &> /dev/null; then
    echo "✅ ESLint: $(npx eslint --version)"
else
    echo "❌ ESLint 安装失败"
fi

# 检查 Prettier
if npx prettier --version &> /dev/null; then
    echo "✅ Prettier: $(npx prettier --version)"
else
    echo "❌ Prettier 安装失败"
fi

# 检查 Stylelint
if npx stylelint --version &> /dev/null; then
    echo "✅ Stylelint: $(npx stylelint --version)"
else
    echo "❌ Stylelint 安装失败"
fi

# 检查 Husky
if [ -d ".husky" ] && [ -f ".husky/pre-commit" ]; then
    echo "✅ Husky: Git hooks 已配置"
else
    echo "❌ Husky 配置失败"
fi

echo ""
echo "🎉 安装完成！"
echo ""
echo "📚 接下来你可以："
echo "1. 运行 'npm run lint' 检查代码"
echo "2. 运行 'npm run format' 格式化代码"
echo "3. 查看 HUSKY_LINT_GUIDE.md 了解详细使用方法"
echo ""
echo "💡 提示：提交代码时会自动执行检查，格式："
echo "   git commit -m \"feat(module): add new feature\""