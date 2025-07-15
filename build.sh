#!/bin/bash

# Phaser Games Docker 构建脚本
# 使用方法: ./build.sh [选项]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目配置
PROJECT_NAME="phaser-games"
IMAGE_NAME="phaser-games"
CONTAINER_NAME="phaser-games"
PORT="8080"

# 显示帮助信息
show_help() {
    echo -e "${BLUE}Phaser Games Docker 构建脚本${NC}"
    echo ""
    echo "使用方法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  build     构建Docker镜像"
    echo "  run       运行容器"
    echo "  stop      停止容器"
    echo "  restart   重启容器"
    echo "  logs      查看容器日志"
    echo "  clean     清理容器和镜像"
    echo "  deploy    完整部署（构建+运行）"
    echo "  help      显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 deploy    # 完整部署"
    echo "  $0 build     # 只构建镜像"
    echo "  $0 logs      # 查看日志"
}

# 构建镜像
build_image() {
    echo -e "${YELLOW}正在构建Docker镜像...${NC}"
    docker build -t $IMAGE_NAME .
    echo -e "${GREEN}镜像构建完成！${NC}"
}

# 运行容器
run_container() {
    echo -e "${YELLOW}正在启动容器...${NC}"
    
    # 检查容器是否已存在
    if docker ps -a --format 'table {{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo -e "${YELLOW}容器已存在，正在删除旧容器...${NC}"
        docker stop $CONTAINER_NAME 2>/dev/null || true
        docker rm $CONTAINER_NAME 2>/dev/null || true
    fi
    
    # 启动新容器
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT:80 \
        --restart unless-stopped \
        $IMAGE_NAME
    
    echo -e "${GREEN}容器启动成功！${NC}"
    echo -e "${BLUE}访问地址: http://localhost:$PORT${NC}"
}

# 停止容器
stop_container() {
    echo -e "${YELLOW}正在停止容器...${NC}"
    docker stop $CONTAINER_NAME 2>/dev/null || echo -e "${RED}容器未运行${NC}"
    echo -e "${GREEN}容器已停止${NC}"
}

# 重启容器
restart_container() {
    stop_container
    echo -e "${YELLOW}正在重启容器...${NC}"
    docker start $CONTAINER_NAME 2>/dev/null || run_container
    echo -e "${GREEN}容器重启完成！${NC}"
}

# 查看日志
show_logs() {
    echo -e "${YELLOW}显示容器日志...${NC}"
    docker logs -f $CONTAINER_NAME
}

# 清理资源
clean_resources() {
    echo -e "${YELLOW}正在清理Docker资源...${NC}"
    
    # 停止并删除容器
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    
    # 删除镜像
    docker rmi $IMAGE_NAME 2>/dev/null || true
    
    # 清理未使用的资源
    docker system prune -f
    
    echo -e "${GREEN}清理完成！${NC}"
}

# 完整部署
deploy() {
    echo -e "${BLUE}开始完整部署...${NC}"
    build_image
    run_container
    echo -e "${GREEN}部署完成！${NC}"
    echo -e "${BLUE}访问地址: http://localhost:$PORT${NC}"
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}错误: Docker未安装或未在PATH中${NC}"
        echo "请先安装Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
}

# 主函数
main() {
    check_docker
    
    case "${1:-help}" in
        build)
            build_image
            ;;
        run)
            run_container
            ;;
        stop)
            stop_container
            ;;
        restart)
            restart_container
            ;;
        logs)
            show_logs
            ;;
        clean)
            clean_resources
            ;;
        deploy)
            deploy
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            echo -e "${RED}未知选项: $1${NC}"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
