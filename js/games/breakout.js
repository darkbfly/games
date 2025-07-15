class BreakoutGame extends Phaser.Scene {
    constructor() {
        super({ key: 'BreakoutGame' });
        this.paddle = null;
        this.ball = null;
        this.bricks = null;
        this.score = 0;
        this.lives = 3;
        this.gameStarted = false;
        this.ballSpeed = 300;
    }

    preload() {
        // 不需要预加载资源，直接使用图形API
    }

    create() {
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;

        // 创建挡板
        this.paddle = this.physics.add.existing(this.add.rectangle(width / 2, height - 50, 100, 20, 0x00ff00));
        this.paddle.body.setImmovable(true);
        this.paddle.body.setCollideWorldBounds(true);

        // 创建球
        this.ball = this.physics.add.existing(this.add.circle(width / 2, height - 80, 7.5, 0xffffff));
        this.ball.body.setCollideWorldBounds(true);
        this.ball.body.setBounce(1, 1);

        // 创建砖块组
        this.bricks = this.physics.add.staticGroup();
        this.createBricks();

        // 设置碰撞
        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);
        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);

        // 设置键盘输入
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // 鼠标控制
        this.input.on('pointermove', (pointer) => {
            if (pointer.x >= 50 && pointer.x <= width - 50) {
                this.paddle.x = pointer.x;
            }
        });

        // 点击开始游戏
        this.input.on('pointerdown', () => {
            if (!this.gameStarted) {
                this.startGame();
            }
        });

        // 创建边界（除了底部）
        this.physics.world.setBoundsCollision(true, true, true, false);

        // 检测球掉落
        this.physics.world.on('worldbounds', (event, body) => {
            if (body.gameObject === this.ball && event.down) {
                this.ballFell();
            }
        });

        // 显示开始提示
        this.startText = this.add.text(width / 2, height / 2, '点击或按空格键开始游戏', {
            fontSize: '24px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // 游戏初始化完成
    }

    update() {
        if (!this.gameStarted) {
            // 球跟随挡板
            this.ball.x = this.paddle.x;

            // 空格键开始游戏
            if (this.spaceKey.isDown) {
                this.startGame();
            }
        }

        // 挡板控制
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.paddle.body.setVelocityX(-400);
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.paddle.body.setVelocityX(400);
        } else {
            this.paddle.body.setVelocityX(0);
        }
    }

    createBricks() {
        const brickWidth = 75;
        const brickHeight = 30;
        const brickPadding = 5;
        const brickOffsetTop = 80;
        const brickOffsetLeft = 35;

        const brickRows = 5;
        const brickCols = 10;

        const colors = [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff];

        for (let row = 0; row < brickRows; row++) {
            for (let col = 0; col < brickCols; col++) {
                const brickX = brickOffsetLeft + col * (brickWidth + brickPadding);
                const brickY = brickOffsetTop + row * (brickHeight + brickPadding);

                const brick = this.physics.add.existing(this.add.rectangle(brickX, brickY, brickWidth, brickHeight, colors[row]));
                brick.body.setImmovable(true);
                brick.points = (brickRows - row) * 10; // 上面的砖块分数更高

                this.bricks.add(brick);
            }
        }
    }

    startGame() {
        if (this.gameStarted) return;

        this.gameStarted = true;
        this.startText.destroy();

        // 给球一个随机的初始速度
        const angle = Phaser.Math.Between(-45, 45);
        const radians = Phaser.Math.DegToRad(angle);

        this.ball.body.setVelocity(
            Math.sin(radians) * this.ballSpeed,
            -Math.cos(radians) * this.ballSpeed
        );
    }

    hitPaddle(ball, paddle) {
        // 根据球击中挡板的位置改变球的方向
        const diff = ball.x - paddle.x;
        const paddleWidth = paddle.displayWidth;
        const normalizedDiff = diff / (paddleWidth / 2);

        // 计算新的速度
        const angle = normalizedDiff * 45; // 最大45度角
        const radians = Phaser.Math.DegToRad(angle);

        ball.body.setVelocity(
            Math.sin(radians) * this.ballSpeed,
            -Math.abs(Math.cos(radians) * this.ballSpeed)
        );

        // 添加击中效果
        this.tweens.add({
            targets: paddle,
            scaleY: 0.8,
            duration: 100,
            yoyo: true
        });
    }

    hitBrick(ball, brick) {
        // 增加分数
        this.score += brick.points;

        // 移除砖块
        brick.destroy();

        // 添加击中效果
        this.cameras.main.flash(50, 255, 255, 255, false, (camera, progress) => {
            if (progress === 1) {
                // 闪光结束
            }
        });

        // 粒子效果
        this.createBrickParticles(brick.x, brick.y, brick.tintTopLeft);

        // 检查是否所有砖块都被击破
        if (this.bricks.children.entries.length === 0) {
            this.levelComplete();
        }

        // 稍微增加球速
        this.ballSpeed += 2;
        const currentVel = ball.body.velocity;
        const currentSpeed = Math.sqrt(currentVel.x * currentVel.x + currentVel.y * currentVel.y);
        ball.body.setVelocity(
            (currentVel.x / currentSpeed) * this.ballSpeed,
            (currentVel.y / currentSpeed) * this.ballSpeed
        );
    }

    createBrickParticles(x, y, color) {
        // 创建简单的粒子效果
        for (let i = 0; i < 8; i++) {
            const particle = this.add.rectangle(x, y, 4, 4, color);

            this.tweens.add({
                targets: particle,
                x: x + Phaser.Math.Between(-50, 50),
                y: y + Phaser.Math.Between(-50, 50),
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    ballFell() {
        this.lives--;

        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.resetBall();
        }
    }

    resetBall() {
        this.gameStarted = false;
        this.ball.setPosition(this.paddle.x, this.sys.game.config.height - 80);
        this.ball.body.setVelocity(0, 0);

        this.startText = this.add.text(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2,
            `生命: ${this.lives}\n点击或按空格键继续`, {
            fontSize: '20px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
    }

    levelComplete() {
        this.ball.body.setVelocity(0, 0);
        this.gameManager.gameOver('恭喜！你击破了所有砖块！');
    }

    gameOver() {
        this.ball.body.setVelocity(0, 0);
        this.gameManager.gameOver('打砖块游戏结束！');
    }
}
