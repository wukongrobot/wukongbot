#!/bin/bash
# WukongBot NPM 发布助手脚本
# 使用方法: bash scripts/publish.sh

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 WukongBot 发布助手"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 读取版本号
VERSION=$(node -p "require('./package.json').version")
PACKAGE_NAME=$(node -p "require('./package.json').name")

echo "📦 包名: $PACKAGE_NAME"
echo "📌 版本: $VERSION"
echo ""

# 检查 npm 登录状态
echo "🔐 检查 NPM 登录状态..."
if npm whoami &> /dev/null; then
    NPM_USER=$(npm whoami)
    echo "✅ 已登录为: $NPM_USER"
else
    echo "❌ 未登录到 NPM"
    echo ""
    echo "请先运行: npm login"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 发布前检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查 dist 目录
if [ -d "dist" ]; then
    echo "✅ dist/ 目录存在"
else
    echo "❌ dist/ 目录不存在，请先构建:"
    echo "   pnpm build"
    exit 1
fi

# 检查 git 状态
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ Git 工作目录干净"
else
    echo "⚠️  有未提交的更改"
    git status --short
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 准备发布"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "即将发布: $PACKAGE_NAME@$VERSION"
echo ""
read -p "确认发布？(y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 已取消发布"
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 发布到 NPM"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查是否需要 OTP
echo "如果你启用了 2FA，请输入 OTP（6位数字）"
echo "如果没有启用，直接按回车跳过"
read -p "OTP: " OTP

if [ -z "$OTP" ]; then
    echo "发布命令: npm publish --access public"
    npm publish --access public
else
    echo "发布命令: npm publish --access public --otp=\"$OTP\""
    npm publish --access public --otp="$OTP"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 发布成功！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 验证发布
echo "验证发布..."
PUBLISHED_VERSION=$(npm view $PACKAGE_NAME version)
echo "已发布版本: $PUBLISHED_VERSION"

if [ "$PUBLISHED_VERSION" = "$VERSION" ]; then
    echo "✅ 版本匹配"
else
    echo "⚠️  版本不匹配！本地: $VERSION, NPM: $PUBLISHED_VERSION"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 后续步骤"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. 创建 Git 标签:"
echo "   git tag v$VERSION"
echo "   git push origin v$VERSION"
echo ""
echo "2. 访问 NPM 页面:"
echo "   https://www.npmjs.com/package/$PACKAGE_NAME"
echo ""
echo "3. 创建 GitHub Release:"
echo "   https://github.com/yourorg/wukongbot/releases/new"
echo ""
echo "4. 测试安装:"
echo "   npm install -g $PACKAGE_NAME@$VERSION"
echo ""
