# Cloudflare Workers 部署指南

本指南将帮助您将Phaser游戏集合部署到Cloudflare Workers平台。

## 🌟 为什么选择 Cloudflare Workers？

- ✅ **免费额度丰富**: 每天100,000次请求免费
- ✅ **全球CDN**: 自动全球分发，访问速度快
- ✅ **零配置SSL**: 自动HTTPS支持
- ✅ **边缘计算**: 在全球200+数据中心运行
- ✅ **自定义域名**: 支持绑定自己的域名
- ✅ **实时日志**: 完整的监控和日志系统

## 📋 前置要求

1. **Node.js**: 版本 16.0.0 或更高
2. **npm**: Node.js 包管理器
3. **Cloudflare 账户**: [免费注册](https://dash.cloudflare.com/sign-up)

## 🚀 快速部署

### 方法一：使用部署脚本（推荐）

#### Windows 用户
```cmd
# 1. 初始化项目
deploy-cf.bat setup

# 2. 部署到生产环境
deploy-cf.bat deploy
```

#### Linux/macOS 用户
```bash
# 1. 给脚本添加执行权限
chmod +x deploy-cf.sh

# 2. 初始化项目
./deploy-cf.sh setup

# 3. 部署到生产环境
./deploy-cf.sh deploy
```

### 方法二：手动部署

```bash
# 1. 安装依赖
npm install

# 2. 登录 Cloudflare
npx wrangler auth login

# 3. 构建项目
npm run build

# 4. 部署
npx wrangler publish
```

## 🛠️ 详细步骤

### 1. 项目初始化

```bash
# 安装项目依赖
npm install

# 登录 Cloudflare 账户
npx wrangler auth login
```

登录时会打开浏览器，请使用您的Cloudflare账户登录并授权。

### 2. 配置项目

编辑 `wrangler.toml` 文件：

```toml
name = "your-game-name"  # 修改为您的项目名称
main = "src/index.js"
compatibility_date = "2023-12-01"

[site]
bucket = "./dist"

# 可选：自定义域名
# routes = [
#   { pattern = "games.yourdomain.com/*", zone_name = "yourdomain.com" }
# ]
```

### 3. 构建项目

```bash
# 构建项目文件到 dist 目录
npm run build
```

构建脚本会：
- 清理 `dist` 目录
- 复制游戏文件到 `dist`
- 优化 HTML 文件
- 添加 PWA 相关标签

### 4. 部署

```bash
# 部署到生产环境
npm run deploy

# 或部署到开发环境
npm run deploy:dev
```

## 🔧 开发模式

```bash
# 启动本地开发服务器
npm run dev
```

开发服务器会：
- 自动构建项目
- 启动本地 Workers 环境
- 支持热重载
- 提供实时日志

## 📊 管理和监控

### 查看部署状态
```bash
# Windows
deploy-cf.bat status

# Linux/macOS
./deploy-cf.sh status
```

### 查看实时日志
```bash
# Windows
deploy-cf.bat tail

# Linux/macOS
./deploy-cf.sh tail
```

### 预览部署
```bash
npm run preview
```

## 🌐 自定义域名

### 1. 添加域名到 Cloudflare

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击 "Add a Site"
3. 输入您的域名
4. 按照指引更改DNS服务器

### 2. 配置 Workers 路由

在 `wrangler.toml` 中添加：

```toml
routes = [
  { pattern = "games.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

### 3. 重新部署

```bash
npm run deploy
```

## 🔒 环境配置

### 开发环境
```bash
npm run deploy:dev
```

### 生产环境
```bash
npm run deploy:prod
```

### 环境变量

在 `wrangler.toml` 中配置：

```toml
[env.dev]
name = "phaser-games-dev"
vars = { ENVIRONMENT = "development" }

[env.production]
name = "phaser-games-prod"
vars = { ENVIRONMENT = "production" }
```

## 📈 性能优化

### 1. 缓存策略

Workers 脚本已配置了优化的缓存策略：
- HTML 文件：5分钟缓存
- 静态资源：1年缓存
- API 响应：1小时缓存

### 2. 压缩优化

Cloudflare 自动提供：
- Gzip/Brotli 压缩
- 图片优化
- Minification

### 3. 全球分发

您的游戏会自动在全球200+数据中心分发，确保用户就近访问。

## 🐛 故障排除

### 常见问题

#### 1. 登录失败
```bash
# 重新登录
npx wrangler auth login

# 检查登录状态
npx wrangler auth whoami
```

#### 2. 部署失败
```bash
# 检查配置文件
npx wrangler validate

# 查看详细错误
npx wrangler publish --verbose
```

#### 3. 域名配置问题
- 确保域名已添加到 Cloudflare
- 检查 DNS 记录是否正确
- 验证 `wrangler.toml` 中的路由配置

#### 4. 构建错误
```bash
# 清理并重新构建
npm run clean
npm run build
```

### 调试技巧

```bash
# 查看 Workers 日志
npx wrangler tail

# 本地调试
npm run dev

# 检查部署状态
npx wrangler list
```

## 💰 费用说明

### 免费额度
- **请求数**: 每天 100,000 次
- **CPU 时间**: 每次请求 10ms
- **存储**: 1GB

### 付费计划
- **Workers Paid**: $5/月
  - 每月 1000万次请求
  - 每次请求 50ms CPU 时间
  - 更多功能支持

## 🔐 安全配置

Workers 脚本已包含安全头部：
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 📱 PWA 支持

构建脚本会自动添加 PWA 相关的 meta 标签，使您的游戏支持：
- 添加到主屏幕
- 离线访问（需要额外配置 Service Worker）
- 原生应用体验

## 🚀 CI/CD 集成

### GitHub Actions 示例

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '16'
    - run: npm install
    - run: npm run build
    - run: npx wrangler publish
      env:
        CF_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
```

## 📞 获取帮助

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [社区论坛](https://community.cloudflare.com/)

---

**部署成功后，您的游戏将在全球范围内快速访问！** 🌍✨

**示例访问地址**: `https://your-worker-name.your-subdomain.workers.dev`
