#!/bin/bash
# 悟空Bot 依赖安装脚本

set -e

echo "🐵 悟空Bot 依赖安装"
echo "================================"
echo ""

# 检查 Node 版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
echo "📍 当前 Node.js 版本: $(node -v)"

if [ "$NODE_VERSION" -lt 22 ]; then
    echo "⚠️  警告: 项目要求 Node.js >= 22，当前版本可能导致问题"
    echo ""
    read -p "是否继续安装? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 安装已取消"
        echo ""
        echo "💡 升级 Node.js:"
        echo "   nvm install 22 && nvm use 22"
        echo "   或"
        echo "   n 22"
        exit 1
    fi
fi

cd "$(dirname "$0")"

echo "🧹 清理旧的 node_modules..."
rm -rf node_modules extensions/*/node_modules

echo ""
echo "📦 安装根项目依赖..."
pnpm install --no-frozen-lockfile --filter '!./extensions/*' || {
    echo "❌ 根项目依赖安装失败"
    exit 1
}

echo ""
echo "📦 安装扩展依赖..."

# 飞书
if [ -d "extensions/feishu" ]; then
    echo "  - 飞书扩展..."
    cd extensions/feishu
    pnpm install || echo "⚠️  飞书扩展安装失败"
    cd ../..
fi

# 企业微信
if [ -d "extensions/wecom" ]; then
    echo "  - 企业微信扩展..."
    cd extensions/wecom
    pnpm install || echo "⚠️  企业微信扩展安装失败"
    cd ../..
fi

# 钉钉
if [ -d "extensions/dingtalk" ]; then
    echo "  - 钉钉扩展..."
    cd extensions/dingtalk
    pnpm install || echo "⚠️  钉钉扩展安装失败"
    cd ../..
fi

echo ""
echo "✅ 依赖安装完成!"
echo ""
echo "📝 下一步:"
echo "  pnpm build              # 构建项目"
echo "  pnpm wukongbot onboard  # 运行配置向导"
echo ""
