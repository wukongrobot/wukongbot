#!/bin/bash
# 悟空Bot 简化构建脚本 (适用于 Node < 22)

set -e

echo "🐵 悟空Bot 简化构建"
echo "================================"
echo ""

cd "$(dirname "$0")"

echo "📦 跳过 A2UI 打包 (需要 Node.js 22+)..."
echo ""

echo "🔨 编译 TypeScript..."
pnpm exec tsc -p tsconfig.json || {
    echo "❌ TypeScript 编译失败"
    exit 1
}

echo ""
echo "📝 复制 Hook 元数据..."
node --import tsx scripts/copy-hook-metadata.ts || echo "⚠️  Hook 元数据复制失败（可选步骤）"

echo ""
echo "📝 写入构建信息..."
node --import tsx scripts/write-build-info.ts || echo "⚠️  构建信息写入失败（可选步骤）"

echo ""
echo "✅ 构建完成！"
echo ""
echo "📝 注意: A2UI canvas 功能已跳过（需要 Node.js 22+）"
echo "   核心功能不受影响，可以正常使用"
echo ""
echo "🚀 现在可以运行:"
echo "   pnpm wukongbot --help"
echo ""
