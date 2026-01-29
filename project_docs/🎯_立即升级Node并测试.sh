#!/bin/bash
# 悟空Bot - 升级 Node.js 并测试汉化效果

set -e

echo "🐵 悟空Bot - 升级 Node.js 并测试"
echo "================================"
echo ""

# 检查当前 Node 版本
CURRENT_NODE=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
echo "📍 当前 Node.js 版本: $(node -v)"
echo "📍 要求 Node.js 版本: >= 22.0.0"
echo ""

if [ "$CURRENT_NODE" -lt 22 ]; then
    echo "⚠️  需要升级 Node.js"
    echo ""
    
    # 检查是否有 nvm
    if command -v nvm &> /dev/null; then
        echo "✅ 检测到 nvm，开始升级..."
        echo ""
        
        # 安装 Node.js 22
        nvm install 22
        nvm use 22
        
        echo ""
        echo "✅ Node.js 升级成功！"
        echo "📍 新版本: $(node -v)"
    else
        echo "❌ 未检测到 nvm"
        echo ""
        echo "请手动升级 Node.js:"
        echo ""
        echo "方法 1: 安装 nvm 后运行"
        echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
        echo "  nvm install 22"
        echo ""
        echo "方法 2: 使用 n"
        echo "  npm install -g n"
        echo "  n 22"
        echo ""
        echo "方法 3: 从官网下载"
        echo "  https://nodejs.org/"
        exit 1
    fi
else
    echo "✅ Node.js 版本满足要求"
fi

echo ""
echo "🔨 开始构建项目..."
cd "$(dirname "$0")"
pnpm build

echo ""
echo "🎉 构建完成！开始测试汉化效果..."
echo ""
echo "================================"
echo "1️⃣  测试 CLI 帮助信息"
echo "================================"
echo ""
pnpm wukongbot --help | head -50

echo ""
echo ""
echo "================================"
echo "2️⃣  测试配置向导（按 Ctrl+C 退出）"
echo "================================"
echo ""
echo "提示：在向导中查看:"
echo "  - 标题应显示 '悟空Bot 配置向导'"
echo "  - 安全警告应为中文"
echo "  - 选项应为中文"
echo "  - 模型列表应优先显示国产模型（🇨🇳 DeepSeek, Qwen 等）"
echo ""
read -p "按回车键开始测试配置向导..." 

pnpm wukongbot onboard

echo ""
echo "🎊 测试完成！"
echo ""
echo "如果看到以下内容，说明汉化成功："
echo "  ✅ CLI 帮助显示'使用方法:'、'选项:'、'示例:'"
echo "  ✅ 配置向导显示'悟空Bot 配置向导'"
echo "  ✅ 模型列表优先显示国产模型（🇨🇳）"
echo ""
