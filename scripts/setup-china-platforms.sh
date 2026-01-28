#!/bin/bash
# 国产IM平台集成一键安装脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v "$1" &> /dev/null; then
        print_error "$1 未安装"
        return 1
    fi
    return 0
}

# 打印欢迎信息
print_welcome() {
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                                                        ║"
    echo "║      🐵 悟空Bot - 国产IM平台集成安装向导              ║"
    echo "║                                                        ║"
    echo "║      支持: 飞书 | 企业微信 | 钉钉                      ║"
    echo "║                                                        ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
}

# 检查前置条件
check_prerequisites() {
    print_info "检查前置条件..."
    
    local has_error=0
    
    # 检查 Node.js
    if check_command "node"; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 22 ]; then
            print_warning "Node.js 版本过低 (当前: v$NODE_VERSION),推荐 >= 22"
        else
            print_success "Node.js 版本正常 ($(node -v))"
        fi
    else
        print_error "Node.js 未安装,请先安装 Node.js >= 22"
        has_error=1
    fi
    
    # 检查包管理器
    if check_command "pnpm"; then
        print_success "pnpm 已安装 ($(pnpm -v))"
        PKG_MANAGER="pnpm"
    elif check_command "npm"; then
        print_success "npm 已安装 ($(npm -v))"
        PKG_MANAGER="npm"
    else
        print_error "未找到包管理器 (pnpm 或 npm)"
        has_error=1
    fi
    
    if [ $has_error -eq 1 ]; then
        print_error "前置条件检查失败,请先安装必要的依赖"
        exit 1
    fi
    
    print_success "前置条件检查通过!"
    echo ""
}

# 安装扩展依赖
install_extension_deps() {
    local extension=$1
    local name=$2
    
    print_info "安装 $name 依赖..."
    
    if [ -d "extensions/$extension" ]; then
        cd "extensions/$extension"
        if [ -f "package.json" ]; then
            $PKG_MANAGER install
            print_success "$name 依赖安装完成"
        else
            print_warning "$name package.json 不存在"
        fi
        cd ../..
    else
        print_warning "$name 扩展目录不存在"
    fi
}

# 安装所有扩展
install_all_extensions() {
    print_info "开始安装国产IM平台扩展..."
    echo ""
    
    # 飞书
    install_extension_deps "feishu" "飞书 (Feishu)"
    echo ""
    
    # 企业微信
    install_extension_deps "wecom" "企业微信 (WeCom)"
    echo ""
    
    # 钉钉
    install_extension_deps "dingtalk" "钉钉 (DingTalk)"
    echo ""
    
    print_success "所有扩展安装完成!"
}

# 构建项目
build_project() {
    print_info "构建 WukongBot..."
    
    if $PKG_MANAGER run build; then
        print_success "项目构建完成"
    else
        print_error "项目构建失败"
        exit 1
    fi
}

# 运行测试
run_tests() {
    print_info "运行测试..."
    
    if $PKG_MANAGER test -- extensions/; then
        print_success "测试通过"
    else
        print_warning "测试失败,请检查日志"
    fi
}

# 配置向导
run_configuration_wizard() {
    echo ""
    print_info "是否运行配置向导?"
    read -p "输入 y/n (默认: n): " run_wizard
    
    if [ "$run_wizard" = "y" ] || [ "$run_wizard" = "Y" ]; then
        echo ""
        print_info "选择要配置的平台:"
        echo "1) 飞书 (Feishu)"
        echo "2) 企业微信 (WeCom)"
        echo "3) 钉钉 (DingTalk)"
        echo "4) 全部配置"
        echo "5) 跳过"
        read -p "请选择 (1-5): " choice
        
        case $choice in
            1)
                wukongbot channels onboard feishu
                ;;
            2)
                wukongbot channels onboard wecom
                ;;
            3)
                wukongbot channels onboard dingtalk
                ;;
            4)
                wukongbot channels onboard feishu
                wukongbot channels onboard wecom
                wukongbot channels onboard dingtalk
                ;;
            5)
                print_info "跳过配置向导"
                ;;
            *)
                print_warning "无效的选择,跳过配置"
                ;;
        esac
    fi
}

# 打印后续步骤
print_next_steps() {
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                                                        ║"
    echo "║      🎉 安装完成!                                      ║"
    echo "║                                                        ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
    print_info "下一步操作:"
    echo ""
    echo "1️⃣  配置平台 (如果还没配置):"
    echo "   wukongbot channels onboard feishu"
    echo "   wukongbot channels onboard wecom"
    echo "   wukongbot channels onboard dingtalk"
    echo ""
    echo "2️⃣  测试连接:"
    echo "   wukongbot channels status feishu --probe"
    echo "   wukongbot channels status wecom --probe"
    echo "   wukongbot channels status dingtalk --probe"
    echo ""
    echo "3️⃣  发送测试消息:"
    echo "   wukongbot message send --channel feishu --to \"chat_id\" --message \"测试\""
    echo ""
    echo "4️⃣  启动 Gateway:"
    echo "   wukongbot gateway --port 18789"
    echo ""
    echo "📚 完整文档: docs/platforms/CHINA_IM_INTEGRATION.md"
    echo ""
}

# 主函数
main() {
    print_welcome
    
    # 检查是否在项目根目录
    if [ ! -f "package.json" ]; then
        print_error "请在 WukongBot 项目根目录运行此脚本"
        exit 1
    fi
    
    # 检查前置条件
    check_prerequisites
    
    # 安装扩展依赖
    install_all_extensions
    
    # 构建项目
    echo ""
    build_project
    
    # 询问是否运行测试
    echo ""
    read -p "是否运行测试? (y/n, 默认: n): " run_test
    if [ "$run_test" = "y" ] || [ "$run_test" = "Y" ]; then
        echo ""
        run_tests
    fi
    
    # 配置向导
    run_configuration_wizard
    
    # 打印后续步骤
    print_next_steps
}

# 运行主函数
main
