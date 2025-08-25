class GameManager {
    constructor() {
        this.currentGame = null;
        this.gameConfig = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: 'game-canvas-container',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            },
            scene: [],
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH
            }
        };
        this.isPaused = false;
        this.gameInstances = {};
    }

    init() {
        this.setupEventListeners();
        this.setupResizeHandler();
        this.showMenu();
    }

    setupResizeHandler() {
        window.addEventListener('resize', () => {
            if (this.currentGame) {
                this.currentGame.scale.resize(window.innerWidth, window.innerHeight);
            }
        });
    }

    setupEventListeners() {
        // 控制按钮事件
        const pauseBtn = document.getElementById('pause-btn');
        const backBtn = document.getElementById('back-btn');

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.togglePause();
            });
        }

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.backToMenu();
            });
        }

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.currentGame) {
                    this.backToMenu();
                }
            } else if (e.key === 'p' || e.key === 'P') {
                if (this.currentGame) {
                    this.togglePause();
                    e.preventDefault();
                }
            }
        });
    }

    startGame(gameType) {
        this.hideMenu();
        this.showGameCanvas();

        // 销毁之前的游戏实例
        if (this.currentGame) {
            this.currentGame.destroy(true);
        }

        // 根据游戏类型创建对应的场景
        let gameScene;
        switch (gameType) {
            case 'snake':
                gameScene = new SnakeGame();
                this.updateGameInfo('贪吃蛇', '使用方向键控制蛇的移动，吃食物获得分数！');
                break;
            case 'breakout':
                gameScene = new BreakoutGame();
                this.updateGameInfo('打砖块', '使用鼠标或方向键控制挡板，击破所有砖块！');
                break;
            case 'shooter':
                gameScene = new ShooterGame();
                this.updateGameInfo('太空射击', '使用方向键移动，空格键射击，消灭所有敌人！');
                break;
            case 'colorguess':
                gameScene = new ColorGuessGame();
                this.updateGameInfo('猜颜色', '通过逻辑推理猜出隐藏的颜色组合！');
                break;
            case 'dotsandboxes':
                gameScene = new DotsAndBoxesGame();
                this.updateGameInfo('点格棋', '两人轮流画线，占领更多格子的一方获胜！');
                break;
            default:
                console.error('未知的游戏类型:', gameType);
                return;
        }

        // 创建新的游戏配置
        const config = {
            ...this.gameConfig,
            scene: [gameScene]
        };

        // 创建游戏实例
        this.currentGame = new Phaser.Game(config);
        this.gameInstances[gameType] = this.currentGame;

        // 设置游戏管理器引用
        gameScene.gameManager = this;
    }

    updateGameInfo(title, description) {
        // 由于新的UI设计，这个方法不再需要更新游戏信息
        // 游戏信息现在直接显示在游戏卡片中
        console.log(`启动游戏: ${title} - ${description}`);
    }

    showMenu() {
        const menuContainer = document.getElementById('menu-container');
        const gameCanvasContainer = document.getElementById('game-canvas-container');

        if (menuContainer) menuContainer.style.display = 'block';
        if (gameCanvasContainer) gameCanvasContainer.style.display = 'none';
    }

    hideMenu() {
        const menuContainer = document.getElementById('menu-container');
        if (menuContainer) menuContainer.style.display = 'none';
    }

    showGameCanvas() {
        const gameCanvasContainer = document.getElementById('game-canvas-container');
        if (gameCanvasContainer) {
            gameCanvasContainer.style.display = 'flex';
            gameCanvasContainer.style.justifyContent = 'center';
            gameCanvasContainer.style.alignItems = 'center';
        }
    }

    backToMenu() {
        if (this.currentGame) {
            this.currentGame.destroy(true);
            this.currentGame = null;
        }
        this.showMenu();
        this.isPaused = false;
        this.updatePauseButton();
    }

    togglePause() {
        if (!this.currentGame) return;

        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.currentGame.scene.pause();
        } else {
            this.currentGame.scene.resume();
        }

        this.updatePauseButton();
    }

    updatePauseButton() {
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.textContent = this.isPaused ? '继续' : '暂停';
        }
    }

    gameOver(message = '游戏结束！') {
        setTimeout(() => {
            alert(message);
            this.backToMenu();
        }, 100);
    }
}
