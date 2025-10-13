#!/bin/bash

# WMS前端生产环境构建脚本
# 支持多种构建模式和部署选项

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}
 
log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 默认配置
BUILD_MODE="production"
API_BASE_URL="/api/v1"
OUTPUT_DIR="dist"
UPLOAD_SERVER=""
UPLOAD_PATH="/var/www/wms-web"

# 显示使用说明
show_usage() {
    echo "WMS前端生产环境构建脚本"
    echo ""
    echo "用法:"
    echo "  $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -m, --mode <模式>        构建模式 (production|staging|development)"
    echo "  -a, --api <URL>          API基础URL (默认: /api/v1)"
    echo "  -o, --output <目录>      输出目录 (默认: dist)"
    echo "  -s, --server <服务器>    上传服务器地址"
    echo "  -p, --path <路径>        服务器部署路径 (默认: /var/www/wms-web)"
    echo "  -h, --help              显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                                    # 本地构建"
    echo "  $0 -m production -a /api/v1          # 生产环境构建"
    echo "  $0 -s root@192.168.1.100 -p /var/www # 构建并上传"
    echo ""
}

# 解析命令行参数
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -m|--mode)
                BUILD_MODE="$2"
                shift 2
                ;;
            -a|--api)
                API_BASE_URL="$2"
                shift 2
                ;;
            -o|--output)
                OUTPUT_DIR="$2"
                shift 2
                ;;
            -s|--server)
                UPLOAD_SERVER="$2"
                shift 2
                ;;
            -p|--path)
                UPLOAD_PATH="$2"
                shift 2
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                log_error "未知参数: $1"
                show_usage
                exit 1
                ;;
        esac
    done
}

# 检查环境
check_environment() {
    log_info "检查构建环境..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js未安装，请先安装Node.js"
        exit 1
    fi
    
    # 检查npm/pnpm
    if command -v pnpm &> /dev/null; then
        PACKAGE_MANAGER="pnpm"
        log_info "使用pnpm作为包管理器"
    elif command -v npm &> /dev/null; then
        PACKAGE_MANAGER="npm"
        log_info "使用npm作为包管理器"
    else
        log_error "未找到npm或pnpm，请先安装"
        exit 1
    fi
    
    # 显示版本信息
    log_info "Node.js版本: $(node --version)"
    log_info "包管理器版本: $($PACKAGE_MANAGER --version)"
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    
    if [[ $PACKAGE_MANAGER == "pnpm" ]]; then
        pnpm install --frozen-lockfile
    else
        npm ci
    fi
    
    log_success "依赖安装完成"
}

# 创建环境配置文件
create_env_config() {
    log_info "创建环境配置文件..."
    
    # 根据构建模式创建.env文件
    case $BUILD_MODE in
        "production")
            cat > .env.production << EOF
# 生产环境配置
NODE_ENV=production
VITE_APP_TITLE=WMS仓库管理系统
VITE_APP_API_BASE_URL=${API_BASE_URL}
VITE_APP_VERSION=1.0.0
VITE_APP_BUILD_TIME=$(date '+%Y-%m-%d %H:%M:%S')
EOF
            ;;
        "staging")
            cat > .env.staging << EOF
# 预发布环境配置
NODE_ENV=production
VITE_APP_TITLE=WMS仓库管理系统(预发布)
VITE_APP_API_BASE_URL=${API_BASE_URL}
VITE_APP_VERSION=1.0.0-staging
VITE_APP_BUILD_TIME=$(date '+%Y-%m-%d %H:%M:%S')
EOF
            ;;
        "development")
            cat > .env.development << EOF
# 开发环境配置
NODE_ENV=development
VITE_APP_TITLE=WMS仓库管理系统(开发)
VITE_APP_API_BASE_URL=${API_BASE_URL}
VITE_APP_VERSION=1.0.0-dev
VITE_APP_BUILD_TIME=$(date '+%Y-%m-%d %H:%M:%S')
EOF
            ;;
    esac
    
    log_success "环境配置文件创建完成"
}

# 构建项目
build_project() {
    log_info "开始构建项目..."
    log_info "构建模式: $BUILD_MODE"
    log_info "API基础URL: $API_BASE_URL"
    log_info "输出目录: $OUTPUT_DIR"
    
    # 清理之前的构建
    if [[ -d $OUTPUT_DIR ]]; then
        log_info "清理之前的构建文件..."
        rm -rf $OUTPUT_DIR
    fi
    
    # 执行构建
    case $BUILD_MODE in
        "production")
            if [[ $PACKAGE_MANAGER == "pnpm" ]]; then
                pnpm build
            else
                npm run build
            fi
            ;;
        "staging")
            if [[ $PACKAGE_MANAGER == "pnpm" ]]; then
                pnpm build:staging
            else
                npm run build:staging
            fi
            ;;
        "development")
            if [[ $PACKAGE_MANAGER == "pnpm" ]]; then
                pnpm build:dev
            else
                npm run build:dev
            fi
            ;;
    esac
    
    # 检查构建结果
    if [[ -d $OUTPUT_DIR ]]; then
        log_success "项目构建完成"
        
        # 显示构建信息
        local build_size=$(du -sh $OUTPUT_DIR | cut -f1)
        log_info "构建大小: $build_size"
        
        # 显示文件统计
        local file_count=$(find $OUTPUT_DIR -type f | wc -l)
        log_info "文件数量: $file_count"
    else
        log_error "构建失败，输出目录不存在"
        exit 1
    fi
}

# 优化构建文件
optimize_build() {
    log_info "优化构建文件..."
    
    # 压缩HTML文件
    if command -v html-minifier &> /dev/null; then
        log_info "压缩HTML文件..."
        find $OUTPUT_DIR -name "*.html" -exec html-minifier --collapse-whitespace --remove-comments --minify-css --minify-js {} -o {} \;
    fi
    
    # 生成构建报告
    log_info "生成构建报告..."
    cat > $OUTPUT_DIR/build-info.json << EOF
{
  "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "buildMode": "$BUILD_MODE",
  "apiBaseUrl": "$API_BASE_URL",
  "nodeVersion": "$(node --version)",
  "packageManager": "$PACKAGE_MANAGER",
  "packageManagerVersion": "$($PACKAGE_MANAGER --version)",
  "buildSize": "$(du -sh $OUTPUT_DIR | cut -f1)",
  "fileCount": $(find $OUTPUT_DIR -type f | wc -l)
}
EOF
    
    log_success "构建文件优化完成"
}

# 上传到服务器
upload_to_server() {
    if [[ -z $UPLOAD_SERVER ]]; then
        log_info "未指定上传服务器，跳过上传步骤"
        return
    fi
    
    log_info "上传文件到服务器..."
    log_info "服务器: $UPLOAD_SERVER"
    log_info "路径: $UPLOAD_PATH"
    
    # 检查SSH连接
    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes $UPLOAD_SERVER exit 2>/dev/null; then
        log_error "无法连接到服务器 $UPLOAD_SERVER"
        exit 1
    fi
    
    # 创建服务器目录
    ssh $UPLOAD_SERVER "mkdir -p $UPLOAD_PATH"
    
    # 上传文件
    log_info "正在上传文件..."
    rsync -avz --delete $OUTPUT_DIR/ $UPLOAD_SERVER:$UPLOAD_PATH/
    
    # 设置权限
    ssh $UPLOAD_SERVER "chown -R nginx:nginx $UPLOAD_PATH && chmod -R 755 $UPLOAD_PATH"
    
    log_success "文件上传完成"
}

# 验证部署
verify_deployment() {
    if [[ -z $UPLOAD_SERVER ]]; then
        log_info "本地构建完成，跳过部署验证"
        return
    fi
    
    log_info "验证部署..."
    
    # 检查文件是否上传成功
    local remote_file_count=$(ssh $UPLOAD_SERVER "find $UPLOAD_PATH -type f | wc -l")
    local local_file_count=$(find $OUTPUT_DIR -type f | wc -l)
    
    if [[ $remote_file_count -eq $local_file_count ]]; then
        log_success "部署验证通过，文件数量一致: $remote_file_count"
    else
        log_warning "部署验证警告，文件数量不一致 (本地: $local_file_count, 远程: $remote_file_count)"
    fi
}

# 清理临时文件
cleanup() {
    log_info "清理临时文件..."
    
    # 删除环境配置文件
    rm -f .env.production .env.staging .env.development
    
    log_success "清理完成"
}

# 显示构建总结
show_summary() {
    echo ""
    echo "=========================================="
    echo "           构建完成总结"
    echo "=========================================="
    echo "构建模式: $BUILD_MODE"
    echo "API基础URL: $API_BASE_URL"
    echo "输出目录: $OUTPUT_DIR"
    echo "构建大小: $(du -sh $OUTPUT_DIR | cut -f1)"
    echo "文件数量: $(find $OUTPUT_DIR -type f | wc -l)"
    
    if [[ -n $UPLOAD_SERVER ]]; then
        echo "部署服务器: $UPLOAD_SERVER"
        echo "部署路径: $UPLOAD_PATH"
    fi
    
    echo ""
    echo "构建文件位置: $(pwd)/$OUTPUT_DIR"
    echo "构建报告: $(pwd)/$OUTPUT_DIR/build-info.json"
    echo ""
    
    if [[ -n $UPLOAD_SERVER ]]; then
        log_success "前端已成功部署到服务器！"
        echo "访问地址: https://your-domain.com"
    else
        log_success "前端构建完成！"
        echo "可以使用以下命令启动本地服务器进行测试："
        echo "  cd $OUTPUT_DIR && python -m http.server 8080"
        echo "  或使用 npx serve $OUTPUT_DIR"
    fi
    echo ""
}

# 主函数
main() {
    echo "=========================================="
    echo "      WMS前端生产环境构建脚本"
    echo "=========================================="
    echo ""
    
    # 解析参数
    parse_args "$@"
    
    # 检查环境
    check_environment
    
    # 安装依赖
    install_dependencies
    
    # 创建环境配置
    create_env_config
    
    # 构建项目
    build_project
    
    # 优化构建文件
    optimize_build
    
    # 上传到服务器
    upload_to_server
    
    # 验证部署
    verify_deployment
    
    # 清理临时文件
    cleanup
    
    # 显示总结
    show_summary
}

# 捕获中断信号
trap cleanup EXIT

# 执行主函数
main "$@"
