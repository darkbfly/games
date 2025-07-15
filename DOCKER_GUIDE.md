# Docker 部署指南

本指南将帮助您使用Docker部署Phaser游戏集合。

## 📋 前置要求

### Windows 系统
1. 安装 [Docker Desktop for Windows](https://docs.docker.com/desktop/windows/)
2. 启动 Docker Desktop 应用程序
3. 确保 Docker Desktop 正在运行（系统托盘中有Docker图标）

### Linux/macOS 系统
1. 安装 Docker Engine
2. 确保 Docker 服务正在运行

## 🚀 快速部署

### 方法一：使用构建脚本（推荐）

#### Windows 用户
```cmd
# 完整部署（构建+运行）
build.bat deploy

# 或者分步执行
build.bat build
build.bat run
```

#### Linux/macOS 用户
```bash
# 给脚本添加执行权限
chmod +x build.sh

# 完整部署（构建+运行）
./build.sh deploy

# 或者分步执行
./build.sh build
./build.sh run
```

### 方法二：使用 Docker Compose

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 方法三：手动 Docker 命令

```bash
# 1. 构建镜像
docker build -t phaser-games .

# 2. 运行容器
docker run -d -p 8080:80 --name phaser-games phaser-games

# 3. 访问应用
# 打开浏览器访问: http://localhost:8080
```

## 🛠️ 管理命令

### 查看容器状态
```bash
docker ps                    # 查看运行中的容器
docker ps -a                 # 查看所有容器
```

### 查看日志
```bash
docker logs phaser-games     # 查看容器日志
docker logs -f phaser-games  # 实时查看日志
```

### 停止和启动
```bash
docker stop phaser-games     # 停止容器
docker start phaser-games    # 启动容器
docker restart phaser-games  # 重启容器
```

### 清理资源
```bash
docker stop phaser-games     # 停止容器
docker rm phaser-games       # 删除容器
docker rmi phaser-games      # 删除镜像
docker system prune -f       # 清理未使用的资源
```

## 🔧 配置说明

### 端口配置
- 默认端口：8080
- 修改端口：编辑 `docker-compose.yml` 或在运行时指定
  ```bash
  docker run -d -p 3000:80 --name phaser-games phaser-games
  ```

### 环境变量
在 `docker-compose.yml` 中可以配置：
```yaml
environment:
  - NGINX_HOST=localhost
  - NGINX_PORT=80
```

### 自定义配置
如需修改nginx配置，可以：
1. 修改 `Dockerfile` 中的nginx配置部分
2. 重新构建镜像

## 🐛 故障排除

### 常见问题

#### 1. Docker Desktop 未启动
**错误信息**: `error during connect: Head "http://..."`
**解决方案**: 启动 Docker Desktop 应用程序

#### 2. 端口被占用
**错误信息**: `port is already allocated`
**解决方案**: 
- 更换端口：`docker run -d -p 8081:80 --name phaser-games phaser-games`
- 或停止占用端口的程序

#### 3. 容器名称冲突
**错误信息**: `name is already in use`
**解决方案**: 
```bash
docker stop phaser-games
docker rm phaser-games
```

#### 4. 镜像构建失败
**解决方案**: 
- 检查 Dockerfile 语法
- 确保所有文件都在项目目录中
- 检查网络连接

### 查看详细错误
```bash
# 查看容器详细信息
docker inspect phaser-games

# 查看构建过程
docker build -t phaser-games . --no-cache

# 进入容器调试
docker exec -it phaser-games /bin/sh
```

## 📊 性能优化

### 镜像优化
- 使用 `.dockerignore` 排除不必要的文件
- 多阶段构建（如果需要）
- 使用轻量级基础镜像（已使用 `nginx:alpine`）

### 运行时优化
```bash
# 限制内存使用
docker run -d -p 8080:80 --memory=512m --name phaser-games phaser-games

# 设置重启策略
docker run -d -p 8080:80 --restart=unless-stopped --name phaser-games phaser-games
```

## 🔒 安全配置

### 生产环境建议
1. 使用非root用户运行
2. 配置防火墙规则
3. 使用HTTPS（配置SSL证书）
4. 定期更新基础镜像

### SSL配置示例
```yaml
# docker-compose.yml 中添加
volumes:
  - ./ssl:/etc/nginx/ssl:ro
```

## 📝 日志管理

### 配置日志轮转
```bash
docker run -d \
  --log-driver=json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  -p 8080:80 \
  --name phaser-games \
  phaser-games
```

## 🌐 网络配置

### 自定义网络
```bash
# 创建自定义网络
docker network create games-network

# 在自定义网络中运行
docker run -d --network=games-network -p 8080:80 --name phaser-games phaser-games
```

## 📈 监控

### 资源使用监控
```bash
# 查看资源使用情况
docker stats phaser-games

# 查看容器进程
docker top phaser-games
```

---

## 🆘 获取帮助

如果遇到问题，可以：
1. 查看容器日志：`docker logs phaser-games`
2. 检查Docker状态：`docker info`
3. 查看构建脚本帮助：`build.bat help` 或 `./build.sh help`

**访问地址**: http://localhost:8080

**享受游戏时光！** 🎮✨
