#!/bin/bash
# 应用汉化到项目

set -e

echo "🐵 悟空Bot 汉化应用脚本"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在 wukongbot 项目根目录运行此脚本"
    exit 1
fi

print_info "开始应用汉化..."
echo ""

# 1. 更新 UI 页面标题
print_info "1/5 更新 Web UI 标题和元数据..."
if [ -f "ui/index.html" ]; then
    if grep -q "悟空Bot" ui/index.html; then
        print_success "Web UI 标题已汉化"
    else
        print_warning "Web UI 标题可能需要手动检查"
    fi
else
    print_warning "未找到 ui/index.html"
fi

# 2. 检查语言包
print_info "2/5 检查中文语言包..."
if [ -f "ui/src/ui/i18n.ts" ]; then
    print_success "中文语言包已就位"
else
    print_warning "未找到语言包文件 ui/src/ui/i18n.ts"
fi

# 3. 检查 CLI Banner
print_info "3/5 检查 CLI Banner..."
if [ -f "src/cli/banner.ts" ]; then
    if grep -q "悟空Bot" src/cli/banner.ts; then
        print_success "CLI Banner 已汉化"
    else
        print_warning "CLI Banner 可能需要手动检查"
    fi
else
    print_warning "未找到 src/cli/banner.ts"
fi

# 4. 检查 Tagline
print_info "4/5 检查 CLI 标语..."
if [ -f "src/cli/tagline.ts" ]; then
    if grep -q "七十二变" src/cli/tagline.ts; then
        print_success "CLI 标语已汉化"
    else
        print_warning "CLI 标语可能需要手动检查"
    fi
else
    print_warning "未找到 src/cli/tagline.ts"
fi

# 5. 检查向导
print_info "5/5 检查配置向导..."
if [ -f "src/wizard/onboarding.ts" ]; then
    if grep -q "悟空Bot 配置向导" src/wizard/onboarding.ts; then
        print_success "配置向导已汉化"
    else
        print_warning "配置向导可能需要手动检查"
    fi
else
    print_warning "未找到 src/wizard/onboarding.ts"
fi

echo ""
echo "================================"
print_success "汉化检查完成!"
echo ""
echo "📝 下一步:"
echo "  1. 运行 'pnpm build' 构建项目"
echo "  2. 运行 'pnpm wukongbot --help' 查看 CLI"
echo "  3. 运行 'cd ui && pnpm dev' 查看 Web UI"
echo ""
echo "📚 完整汉化报告: LOCALIZATION_DONE.md"
echo ""
