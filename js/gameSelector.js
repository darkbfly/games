class GameSelector {
    constructor() {
        this.currentIndex = 0;
        this.games = ['snake', 'breakout', 'shooter', 'colorguess', 'dotsandboxes', 'yahtzee'];
        this.isTransitioning = false;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.gamepadIndex = -1;
        this.gamepadDeadzone = 0.3;
        this.lastGamepadInput = 0;
        this.gamepadInputDelay = 300; // 毫秒

        this.carousel = null;
        this.cards = null;
        this.indicators = null;
        this.prevBtn = null;
        this.nextBtn = null;
        this.startBtn = null;
    }

    init() {
        this.carousel = document.getElementById('game-carousel');
        this.cards = document.querySelectorAll('.game-card');
        this.indicators = document.querySelectorAll('.indicator');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.startBtn = document.getElementById('start-game-btn');

        this.setupEventListeners();
        this.setupGamepadSupport();
        this.updateDisplay();
    }

    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('menu-container').style.display !== 'none') {
                this.handleKeyboard(e);
            }
        });

        // 鼠标拖拽事件
        this.carousel.addEventListener('mousedown', (e) => {
            this.startDrag(e.clientX);
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            this.handleDrag(e.clientX);
        });

        document.addEventListener('mouseup', () => {
            this.endDrag();
        });

        // 触摸事件
        this.carousel.addEventListener('touchstart', (e) => {
            this.startDrag(e.touches[0].clientX);
        });

        this.carousel.addEventListener('touchmove', (e) => {
            this.handleDrag(e.touches[0].clientX);
            e.preventDefault();
        });

        this.carousel.addEventListener('touchend', () => {
            this.endDrag();
        });

        // 导航按钮
        this.prevBtn.addEventListener('click', () => {
            this.previousGame();
        });

        this.nextBtn.addEventListener('click', () => {
            this.nextGame();
        });

        // 指示器点击
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.goToGame(index);
            });
        });

        // 游戏卡片点击
        this.cards.forEach((card, index) => {
            card.addEventListener('click', () => {
                if (index === this.currentIndex) {
                    this.startCurrentGame();
                } else {
                    this.goToGame(index);
                }
            });
        });

        // 开始游戏按钮
        this.startBtn.addEventListener('click', () => {
            this.startCurrentGame();
        });

        // 鼠标滚轮事件
        this.carousel.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY > 0) {
                this.nextGame();
            } else {
                this.previousGame();
            }
        });
    }

    setupGamepadSupport() {
        // 检测手柄连接
        window.addEventListener('gamepadconnected', (e) => {
            console.log('手柄已连接:', e.gamepad.id);
            this.gamepadIndex = e.gamepad.index;
        });

        window.addEventListener('gamepaddisconnected', (e) => {
            console.log('手柄已断开:', e.gamepad.id);
            this.gamepadIndex = -1;
        });

        // 手柄输入检测循环
        this.gamepadLoop();
    }

    gamepadLoop() {
        this.checkGamepadInput();
        requestAnimationFrame(() => this.gamepadLoop());
    }

    checkGamepadInput() {
        if (this.gamepadIndex === -1) return;
        if (document.getElementById('menu-container').style.display === 'none') return;

        const gamepad = navigator.getGamepads()[this.gamepadIndex];
        if (!gamepad) return;

        const now = Date.now();
        if (now - this.lastGamepadInput < this.gamepadInputDelay) return;

        // 左摇杆或十字键
        const leftStickX = gamepad.axes[0];
        const dpadLeft = gamepad.buttons[14].pressed;
        const dpadRight = gamepad.buttons[15].pressed;

        if (leftStickX < -this.gamepadDeadzone || dpadLeft) {
            this.previousGame();
            this.lastGamepadInput = now;
        } else if (leftStickX > this.gamepadDeadzone || dpadRight) {
            this.nextGame();
            this.lastGamepadInput = now;
        }

        // A按钮 (通常是按钮0)
        if (gamepad.buttons[0].pressed) {
            this.startCurrentGame();
            this.lastGamepadInput = now;
        }
    }

    handleKeyboard(e) {
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.previousGame();
                e.preventDefault();
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.nextGame();
                e.preventDefault();
                break;
            case 'Enter':
            case ' ':
                this.startCurrentGame();
                e.preventDefault();
                break;
        }
    }

    startDrag(clientX) {
        this.isDragging = true;
        this.dragStartX = clientX;
        this.dragCurrentX = clientX;
        this.carousel.style.cursor = 'grabbing';
    }

    handleDrag(clientX) {
        if (!this.isDragging) return;

        this.dragCurrentX = clientX;
        const deltaX = this.dragCurrentX - this.dragStartX;
        const threshold = 50; // 拖拽阈值

        if (Math.abs(deltaX) > threshold) {
            if (deltaX > 0) {
                this.previousGame();
            } else {
                this.nextGame();
            }
            this.endDrag();
        }
    }

    endDrag() {
        this.isDragging = false;
        this.carousel.style.cursor = 'grab';
    }

    previousGame() {
        if (this.isTransitioning) return;
        this.currentIndex = (this.currentIndex - 1 + this.games.length) % this.games.length;
        this.updateDisplay();
    }

    nextGame() {
        if (this.isTransitioning) return;
        this.currentIndex = (this.currentIndex + 1) % this.games.length;
        this.updateDisplay();
    }

    goToGame(index) {
        if (this.isTransitioning || index === this.currentIndex) return;
        this.currentIndex = index;
        this.updateDisplay();
    }

    updateDisplay() {
        this.isTransitioning = true;

        // 更新轮播图位置
        const translateX = -this.currentIndex * 100;
        this.carousel.style.transform = `translateX(${translateX}%)`;

        // 更新卡片状态
        this.cards.forEach((card, index) => {
            card.classList.toggle('active', index === this.currentIndex);
        });

        // 更新指示器
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });

        // 添加视觉反馈
        this.addVisualFeedback();

        // 重置过渡状态
        setTimeout(() => {
            this.isTransitioning = false;
        }, 500);
    }

    addVisualFeedback() {
        // 当前卡片的脉冲效果
        const activeCard = this.cards[this.currentIndex];
        activeCard.style.transform = 'scale(1.05)';

        setTimeout(() => {
            activeCard.style.transform = 'scale(1)';
        }, 200);

        // 指示器动画
        const activeIndicator = this.indicators[this.currentIndex];
        activeIndicator.style.transform = 'scale(1.5)';

        setTimeout(() => {
            activeIndicator.style.transform = 'scale(1.2)';
        }, 200);
    }

    startCurrentGame() {
        const currentGame = this.games[this.currentIndex];

        // 添加启动动画
        this.startBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.startBtn.style.transform = 'scale(1)';
        }, 150);

        // 启动游戏
        if (gameManager) {
            gameManager.startGame(currentGame);
        } else {
            console.error('gameManager未初始化');
        }
    }

    getCurrentGame() {
        return this.games[this.currentIndex];
    }
}
