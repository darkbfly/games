# 多游戏合集 - Phaser.js

一个使用Phaser.js框架开发的包含多种经典游戏的网页应用。

## 🎮 包含的游戏

### 1. 贪吃蛇 (Snake)
- **控制方式**: 方向键或WASD键
- **游戏目标**: 控制蛇吃食物，避免撞到墙壁或自己的身体
- **特色**: 随着分数增加，蛇的移动速度会逐渐加快

### 2. 打砖块 (Breakout)
- **控制方式**: 鼠标移动或方向键控制挡板
- **游戏目标**: 用球击破屏幕上的所有砖块
- **特色**: 不同颜色的砖块有不同的分数，球速会随着游戏进行而增加

### 3. 太空射击 (Space Shooter)
- **控制方式**: 方向键或WASD移动，空格键射击
- **游戏目标**: 控制飞船射击敌人，避免被击中
- **特色**: 多种敌人移动模式，随着分数增加难度递增

### 4. 猜颜色 (Color Guess / Mastermind)
- **控制方式**: 鼠标点击或数字键1-6选择颜色
- **游戏目标**: 在8轮内猜出系统生成的4个颜色组合
- **特色**: 经典逻辑推理游戏，提供全对/半对提示帮助分析

## 🚀 快速开始

### 方法一：Docker 部署（推荐）

#### 使用 Docker Compose
```bash
# 构建并启动容器
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止容器
docker-compose down
```

#### 直接使用 Docker
```bash
# 构建镜像
docker build -t phaser-games .

# 运行容器
docker run -d -p 8080:80 --name phaser-games phaser-games

# 停止容器
docker stop phaser-games && docker rm phaser-games
```

访问地址：http://localhost:8080

### 方法二：Cloudflare Workers 部署

#### 快速部署
```bash
# Windows
deploy-cf.bat setup
deploy-cf.bat deploy

# Linux/macOS
chmod +x deploy-cf.sh
./deploy-cf.sh setup
./deploy-cf.sh deploy
```

#### 手动部署
```bash
# 安装依赖并登录
npm install
npx wrangler auth login

# 构建并部署
npm run deploy
```

访问地址：https://your-worker-name.your-subdomain.workers.dev

详细说明请查看：[CLOUDFLARE_GUIDE.md](CLOUDFLARE_GUIDE.md)

### 方法三：直接打开
1. 下载所有文件到本地目录
2. 双击打开 `index.html` 文件

### 方法四：本地服务器
1. 在项目目录下运行以下命令之一：
   ```bash
   # Python 3
   python -m http.server 8000

   # Python 2
   python -m SimpleHTTPServer 8000

   # Node.js (需要安装 http-server)
   npx http-server -p 8000
   ```
2. 在浏览器中访问 `http://localhost:8000`

## 🎯 游戏功能

### 🎮 游戏选择器
- **滑动选择**: 支持鼠标拖拽、触摸滑动选择游戏
- **键盘导航**: 使用方向键或WASD键切换游戏
- **手柄支持**: 支持Xbox/PlayStation等手柄操作
- **视觉指示**: 实时显示当前选中的游戏
- **流畅动画**: 平滑的过渡动画和视觉反馈

### 通用功能
- **计分系统**: 实时显示当前分数
- **暂停功能**: 按P键或点击暂停按钮
- **返回菜单**: 按ESC键或点击返回按钮
- **响应式设计**: 支持不同屏幕尺寸

### 🎹 控制方式

#### 主菜单导航
- `方向键` 或 `WASD` - 切换游戏选择
- `Enter` 或 `空格键` - 开始选中的游戏
- `鼠标拖拽` - 滑动选择游戏
- `鼠标滚轮` - 快速切换游戏
- `手柄左摇杆/十字键` - 导航选择
- `手柄A键` - 确认选择

#### 游戏中控制
- `ESC` - 返回主菜单
- `P` - 暂停/继续游戏
- 各游戏特定控制见游戏说明

## 📁 项目结构

```
games/
├── index.html              # 主页面
├── styles/
│   └── main.css            # 样式文件
├── js/
│   ├── main.js             # 主入口文件
│   ├── gameManager.js      # 游戏管理器
│   ├── gameSelector.js     # 游戏选择器
│   └── games/
│       ├── snake.js        # 贪吃蛇游戏
│       ├── breakout.js     # 打砖块游戏
│       ├── shooter.js      # 太空射击游戏
│       └── colorGuess.js   # 猜颜色游戏
└── README.md               # 项目说明
```

## 🛠️ 技术栈

- **Phaser.js 3.70.0** - 游戏开发框架
- **HTML5 Canvas** - 游戏渲染
- **ES6+ JavaScript** - 游戏逻辑
- **CSS3** - 界面样式

## 🎨 特色功能

### 🎪 交互体验
- **多输入支持**: 鼠标、键盘、触摸、手柄全方位支持
- **滑动选择器**: 流畅的游戏切换体验
- **视觉反馈**: 丰富的动画和过渡效果
- **响应式设计**: 适配各种屏幕尺寸

### 🎭 视觉效果
- **现代化UI设计**: 使用渐变背景和毛玻璃效果
- **流畅的动画效果**: 按钮悬停、游戏过渡动画
- **粒子效果**: 爆炸、碰撞等视觉效果
- **脉冲动画**: 选中游戏的图标脉冲效果
- **平滑过渡**: 游戏切换的平滑动画

### 🎯 游戏体验
- **自适应难度**: 游戏难度随分数动态调整
- **即时反馈**: 视觉和触觉反馈增强游戏体验
- **无缝切换**: 快速在游戏间切换

## 🔧 自定义和扩展

### 添加新游戏
1. 在 `js/games/` 目录下创建新的游戏文件
2. 继承 `Phaser.Scene` 类
3. 在 `gameManager.js` 中添加游戏类型
4. 在 `index.html` 中添加游戏按钮和脚本引用

### 修改游戏参数
每个游戏文件中都有可调整的参数：
- 移动速度
- 难度递增
- 视觉效果
- 计分规则

## 📱 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 📄 许可证

本项目仅供学习和演示使用。

## 🤝 贡献

欢迎提交问题和改进建议！

---

**享受游戏时光！** 🎮✨
