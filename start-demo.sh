#!/bin/bash

# 商品性能分析报告功能演示启动脚本

echo "🎬 正在启动商品性能分析报告功能演示..."
echo ""

# 检查Node.js环境
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未检测到Node.js环境"
    echo "请先安装Node.js (建议版本 >= 14.x)"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误：未检测到npm"
    echo "请确保npm已正确安装"
    exit 1
fi

echo "✅ Node.js环境检查通过"
echo ""

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录下运行此脚本"
    exit 1
fi

echo "✅ 项目目录检查通过"
echo ""

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "📦 检测到依赖未安装，正在安装..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已安装"
fi

echo ""
echo "🚀 正在启动开发服务器..."
echo ""

# 设置环境变量启用演示模式
export VUE_APP_USE_MOCK_API=true
export VUE_APP_DEMO_MODE=true

# 启动开发服务器
npm run dev &
DEV_PID=$!

# 等待服务器启动
sleep 5

echo ""
echo "🎉 演示已启动成功！"
echo ""
echo "📍 访问地址："
echo "   主功能页面: http://localhost:8080/#/pms/performance"
echo "   演示页面:   http://localhost:8080/#/pms/performance-demo"
echo ""
echo "📚 演示说明："
echo "   - 演示页面包含完整的功能展示和操作指南"
echo "   - 所有数据为模拟数据，展示完整功能效果"
echo "   - 支持实时数据更新和图表交互"
echo "   - 包含响应式设计演示"
echo ""
echo "🎮 演示功能："
echo "   ✨ 多维度数据筛选"
echo "   📊 丰富的图表可视化"
echo "   📈 实时趋势分析"
echo "   📋 详细数据表格"
echo "   📄 报告导出功能"
echo "   📱 响应式布局适配"
echo ""
echo "⚠️  注意事项："
echo "   - 请保持此终端窗口开启"
echo "   - 按 Ctrl+C 可以停止服务器"
echo "   - 如遇到问题请查看 DEMO_GUIDE.md"
echo ""
echo "🎯 快速体验步骤："
echo "   1. 访问演示页面"
echo "   2. 点击'开始引导体验'"
echo "   3. 按照提示操作各项功能"
echo "   4. 尝试调整筛选条件观察数据变化"
echo "   5. 体验图表交互和报告导出"
echo ""

# 等待用户中断
wait $DEV_PID