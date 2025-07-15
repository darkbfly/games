class SnakeGame extends Phaser.Scene {
    constructor() {
        super({ key: 'SnakeGame' });
        this.snake = [];
        this.food = null;
        this.direction = 'RIGHT';
        this.nextDirection = 'RIGHT';
        this.gridSize = 20;
        this.score = 0;
        this.gameOver = false;
        this.moveTime = 0;
        this.moveDelay = 150; // 移动间隔（毫秒）
    }

    preload() {
        // 不需要预加载资源，直接使用图形API
    }

    create() {
        // 创建蛇的初始位置
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];

        // 创建蛇身体的图形组
        this.snakeGroup = this.add.group();
        this.updateSnakeGraphics();

        // 创建食物
        this.createFood();

        // 设置键盘输入
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');

        // 添加边界
        this.createBorders();

        // 游戏初始化完成
    }

    update(time, delta) {
        if (this.gameOver) return;

        // 处理输入
        this.handleInput();

        // 移动蛇
        this.moveTime += delta;
        if (this.moveTime >= this.moveDelay) {
            this.moveSnake();
            this.moveTime = 0;
        }
    }

    handleInput() {
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            if (this.direction !== 'RIGHT') this.nextDirection = 'LEFT';
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            if (this.direction !== 'LEFT') this.nextDirection = 'RIGHT';
        } else if (this.cursors.up.isDown || this.wasd.W.isDown) {
            if (this.direction !== 'DOWN') this.nextDirection = 'UP';
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            if (this.direction !== 'UP') this.nextDirection = 'DOWN';
        }
    }

    moveSnake() {
        this.direction = this.nextDirection;

        // 计算新的头部位置
        const head = { ...this.snake[0] };

        switch (this.direction) {
            case 'LEFT':
                head.x -= 1;
                break;
            case 'RIGHT':
                head.x += 1;
                break;
            case 'UP':
                head.y -= 1;
                break;
            case 'DOWN':
                head.y += 1;
                break;
        }

        // 检查碰撞
        if (this.checkCollision(head)) {
            this.endGame();
            return;
        }

        // 添加新头部
        this.snake.unshift(head);

        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.eatFood();
        } else {
            // 移除尾部
            this.snake.pop();
        }

        // 更新图形
        this.updateSnakeGraphics();
    }

    checkCollision(head) {
        // 检查边界碰撞
        const maxX = Math.floor(this.sys.game.config.width / this.gridSize) - 1;
        const maxY = Math.floor(this.sys.game.config.height / this.gridSize) - 1;

        if (head.x < 0 || head.x > maxX || head.y < 0 || head.y > maxY) {
            return true;
        }

        // 检查自身碰撞
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                return true;
            }
        }

        return false;
    }

    eatFood() {
        this.score += 10;

        // 增加速度
        if (this.moveDelay > 80) {
            this.moveDelay -= 2;
        }

        this.createFood();

        // 添加吃食物的效果
        this.tweens.add({
            targets: this.foodGraphic,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 100,
            yoyo: true
        });
    }

    createFood() {
        const maxX = Math.floor(this.sys.game.config.width / this.gridSize) - 1;
        const maxY = Math.floor(this.sys.game.config.height / this.gridSize) - 1;

        let foodPosition;
        do {
            foodPosition = {
                x: Phaser.Math.Between(0, maxX),
                y: Phaser.Math.Between(0, maxY)
            };
        } while (this.isPositionOccupied(foodPosition));

        this.food = foodPosition;

        // 移除旧的食物图形
        if (this.foodGraphic) {
            this.foodGraphic.destroy();
        }

        // 创建新的食物图形
        this.foodGraphic = this.add.rectangle(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize - 2,
            this.gridSize - 2,
            0xff0000
        );
    }

    isPositionOccupied(position) {
        for (let segment of this.snake) {
            if (segment.x === position.x && segment.y === position.y) {
                return true;
            }
        }
        return false;
    }

    updateSnakeGraphics() {
        // 清除旧的蛇身图形
        this.snakeGroup.clear(true, true);

        // 创建新的蛇身图形
        this.snake.forEach((segment, index) => {
            const color = index === 0 ? 0x00ff00 : 0x008000; // 头部亮绿色，身体深绿色
            const rect = this.add.rectangle(
                segment.x * this.gridSize + this.gridSize / 2,
                segment.y * this.gridSize + this.gridSize / 2,
                this.gridSize - 2,
                this.gridSize - 2,
                color
            );
            this.snakeGroup.add(rect);
        });
    }

    createBorders() {
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;

        // 创建边界线
        this.add.rectangle(width / 2, 1, width, 2, 0xffffff);
        this.add.rectangle(width / 2, height - 1, width, 2, 0xffffff);
        this.add.rectangle(1, height / 2, 2, height, 0xffffff);
        this.add.rectangle(width - 1, height / 2, 2, height, 0xffffff);
    }

    endGame() {
        this.gameOver = true;

        // 添加游戏结束效果
        this.cameras.main.shake(200, 0.01);

        // 显示游戏结束信息
        this.gameManager.gameOver('贪吃蛇游戏结束！');
    }
}
