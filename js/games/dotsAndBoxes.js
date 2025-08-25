class DotsAndBoxesGame extends Phaser.Scene {
    constructor() {
        super({ key: 'DotsAndBoxesGame' });
        this.gridSize = 5; // 5x5的点阵
        this.cellSize = 80; // 每个格子的大小
        this.dotSize = 6; // 点的大小
        this.lineWidth = 4; // 线的宽度
        this.margin = 100; // 边距

        this.dots = []; // 存储所有点的位置
        this.lines = []; // 存储已画的线
        this.boxes = []; // 存储已占领的格子
        this.currentPlayer = 1; // 当前玩家 (1 或 2)
        this.player1Score = 0;
        this.player2Score = 0;
        this.gameOver = false;
        this.canContinue = false; // 是否可以继续画线

        this.hoverLine = null;
        this.hoverGraphics = null;
    }

    preload() {
        // 不需要预加载资源
    }

    create() {
        // 设置背景色为亮灰色
        this.cameras.main.setBackgroundColor('#E8E8E8');

        this.createGrid();
        this.createUI();
        this.setupInput();
        this.updateScore();
    }

    createGrid() {
        // 计算游戏区域的总大小
        const totalWidth = this.gridSize * this.cellSize;
        const totalHeight = this.gridSize * this.cellSize;

        // 计算居中位置
        const startX = (this.cameras.main.width - totalWidth) / 2;
        const startY = (this.cameras.main.height - totalHeight) / 2 + 50; // 向下偏移一点给UI留空间

        // 创建所有点
        for (let row = 0; row <= this.gridSize; row++) {
            this.dots[row] = [];
            for (let col = 0; col <= this.gridSize; col++) {
                const x = startX + col * this.cellSize;
                const y = startY + row * this.cellSize;
                this.dots[row][col] = { x, y, row, col };

                // 绘制点
                this.add.circle(x, y, this.dotSize, 0x333333);
            }
        }

        // 初始化格子状态
        for (let row = 0; row < this.gridSize; row++) {
            this.boxes[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                this.boxes[row][col] = {
                    owner: 0, // 0 = 未占领, 1 = 玩家1, 2 = 玩家2
                    edges: { top: false, right: false, bottom: false, left: false }
                };
            }
        }
    }

    createUI() {
        // 创建分数显示
        this.scoreText = this.add.text(20, 20, '', {
            fontSize: '24px',
            fill: '#333333',
            fontFamily: 'Arial'
        });

        // 创建当前玩家显示
        this.playerText = this.add.text(20, 60, '', {
            fontSize: '20px',
            fill: '#333333',
            fontFamily: 'Arial'
        });

        // 创建继续提示文本
        this.continueText = this.add.text(20, 100, '', {
            fontSize: '18px',
            fill: '#666666',
            fontFamily: 'Arial'
        });

        // 创建游戏结束文本
        this.gameOverText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '', {
            fontSize: '32px',
            fill: '#FF0000',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setVisible(false);

        // 创建悬停效果图形
        this.hoverGraphics = this.add.graphics();
    }

    setupInput() {
        // 鼠标输入
        this.input.on('pointermove', (pointer) => {
            if (this.gameOver) return;
            this.handleHover(pointer);
        });

        this.input.on('pointerdown', (pointer) => {
            if (this.gameOver) return;
            this.handleClick(pointer);
        });
    }

    handleHover(pointer) {
        const line = this.findClosestLine(pointer.x, pointer.y);

        if (line && !this.isLineDrawn(line)) {
            this.showHoverLine(line);
        } else {
            this.hideHoverLine();
        }
    }

    handleClick(pointer) {
        const line = this.findClosestLine(pointer.x, pointer.y);

        if (line && !this.isLineDrawn(line)) {
            this.drawLine(line);
            const boxesCompleted = this.checkForCompletedBoxes();
            this.updateScore();
            this.checkGameOver();

            if (!this.gameOver) {
                // 如果没有完成格子，切换玩家
                if (!boxesCompleted) {
                    this.switchPlayer();
                } else {
                    // 如果完成了格子，当前玩家可以继续
                    this.canContinue = true;
                    this.updateContinueDisplay();
                }
            }
        }
    }

    findClosestLine(x, y) {
        const threshold = 20; // 点击容差

        // 检查水平线
        for (let row = 0; row <= this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const dot1 = this.dots[row][col];
                const dot2 = this.dots[row][col + 1];

                if (this.isPointNearLine(x, y, dot1, dot2, threshold)) {
                    return { type: 'horizontal', row, col };
                }
            }
        }

        // 检查垂直线
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col <= this.gridSize; col++) {
                const dot1 = this.dots[row][col];
                const dot2 = this.dots[row + 1][col];

                if (this.isPointNearLine(x, y, dot1, dot2, threshold)) {
                    return { type: 'vertical', row, col };
                }
            }
        }

        return null;
    }

    isPointNearLine(px, py, dot1, dot2, threshold) {
        const x1 = dot1.x, y1 = dot1.y;
        const x2 = dot2.x, y2 = dot2.y;

        // 计算点到线段的距离
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;

        if (lenSq === 0) return false;

        const param = dot / lenSq;

        let xx, yy;
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= threshold;
    }

    showHoverLine(line) {
        this.hoverGraphics.clear();
        this.hoverGraphics.lineStyle(this.lineWidth, 0xCCCCCC);

        if (line.type === 'horizontal') {
            const dot1 = this.dots[line.row][line.col];
            const dot2 = this.dots[line.row][line.col + 1];
            this.hoverGraphics.beginPath();
            this.hoverGraphics.moveTo(dot1.x, dot1.y);
            this.hoverGraphics.lineTo(dot2.x, dot2.y);
            this.hoverGraphics.strokePath();
        } else {
            const dot1 = this.dots[line.row][line.col];
            const dot2 = this.dots[line.row + 1][line.col];
            this.hoverGraphics.beginPath();
            this.hoverGraphics.moveTo(dot1.x, dot1.y);
            this.hoverGraphics.lineTo(dot2.x, dot2.y);
            this.hoverGraphics.strokePath();
        }
    }

    hideHoverLine() {
        this.hoverGraphics.clear();
    }

    drawLine(line) {
        const lineColor = this.currentPlayer === 1 ? 0xFF0000 : 0x0000FF;

        // 创建线条图形
        const graphics = this.add.graphics();
        graphics.lineStyle(this.lineWidth, lineColor);

        if (line.type === 'horizontal') {
            const dot1 = this.dots[line.row][line.col];
            const dot2 = this.dots[line.row][line.col + 1];
            graphics.beginPath();
            graphics.moveTo(dot1.x, dot1.y);
            graphics.lineTo(dot2.x, dot2.y);
            graphics.strokePath();

            // 更新格子边缘状态
            if (line.row > 0) {
                this.boxes[line.row - 1][line.col].edges.bottom = true;
            }
            if (line.row < this.gridSize) {
                this.boxes[line.row][line.col].edges.top = true;
            }
        } else {
            const dot1 = this.dots[line.row][line.col];
            const dot2 = this.dots[line.row + 1][line.col];
            graphics.beginPath();
            graphics.moveTo(dot1.x, dot1.y);
            graphics.lineTo(dot2.x, dot2.y);
            graphics.strokePath();

            // 更新格子边缘状态
            if (line.col > 0) {
                this.boxes[line.row][line.col - 1].edges.right = true;
            }
            if (line.col < this.gridSize) {
                this.boxes[line.row][line.col].edges.left = true;
            }
        }

        this.lines.push({ ...line, graphics });
    }

    isLineDrawn(line) {
        return this.lines.some(l =>
            l.type === line.type && l.row === line.row && l.col === line.col
        );
    }

    checkForCompletedBoxes() {
        let boxesCompleted = false;

        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const box = this.boxes[row][col];
                if (box.owner === 0 && this.isBoxComplete(box)) {
                    box.owner = this.currentPlayer;
                    this.fillBox(row, col);
                    boxesCompleted = true;

                    if (this.currentPlayer === 1) {
                        this.player1Score++;
                    } else {
                        this.player2Score++;
                    }
                }
            }
        }

        // 如果完成了格子，当前玩家继续
        return boxesCompleted;
    }

    isBoxComplete(box) {
        return box.edges.top && box.edges.right && box.edges.bottom && box.edges.left;
    }

    fillBox(row, col) {
        const startX = this.dots[row][col].x;
        const startY = this.dots[row][col].y;

        // 创建彩色斜线图案
        const graphics = this.add.graphics();

        // 定义玩家单一颜色
        const playerColor = this.currentPlayer === 1 ? 0xFF4757 : 0x6495ED; // 红色和蓝色
        const lineSpacing = 20; // 斜线间距

        // 绘制密集的彩色斜线填充
        graphics.lineStyle(3, playerColor);

        // 从左上到右下的斜线 (\\\)
        for (let i = -this.cellSize; i <= this.cellSize * 2; i += lineSpacing) {
            graphics.beginPath();
            // 起点
            let x1 = startX + i;
            let y1 = startY;
            // 终点
            let x2 = startX + i + this.cellSize;
            let y2 = startY + this.cellSize;

            // 裁剪到方块内部
            if (x1 < startX) {
                y1 = startY + (startX - x1);
                x1 = startX;
            }
            if (x2 > startX + this.cellSize) {
                y2 = startY + this.cellSize - (x2 - startX - this.cellSize);
                x2 = startX + this.cellSize;
            }
            if (y1 <= startY + this.cellSize && y2 >= startY) {
                graphics.moveTo(x1, y1);
                graphics.lineTo(x2, y2);
                graphics.strokePath();
            }
        }

        // 从右上到左下的斜线 (///)
        for (let i = -this.cellSize; i <= this.cellSize * 2; i += lineSpacing) {
            graphics.beginPath();
            // 起点
            let x1 = startX + this.cellSize - i;
            let y1 = startY;
            // 终点
            let x2 = startX + this.cellSize - i - this.cellSize;
            let y2 = startY + this.cellSize;

            // 裁剪到方块内部
            if (x1 > startX + this.cellSize) {
                y1 = startY + (x1 - startX - this.cellSize);
                x1 = startX + this.cellSize;
            }
            if (x2 < startX) {
                y2 = startY + this.cellSize - (startX - x2);
                x2 = startX;
            }
            if (y1 <= startY + this.cellSize && y2 >= startY) {
                graphics.moveTo(x1, y1);
                graphics.lineTo(x2, y2);
                graphics.strokePath();
            }
        }

        // 添加半透明背景
        graphics.fillStyle(this.currentPlayer === 1 ? 0xFF4757 : 0x6495ED, 0.1);
        graphics.fillRect(startX + 2, startY + 2, this.cellSize - 4, this.cellSize - 4);

        // 添加玩家标记
        const centerX = startX + this.cellSize / 2;
        const centerY = startY + this.cellSize / 2;
        const textColor = this.currentPlayer === 1 ? '#FFFFFF' : '#FFFFFF';

        this.add.text(centerX, centerY, this.currentPlayer.toString(), {
            fontSize: '28px',
            fill: textColor,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            stroke: this.currentPlayer === 1 ? '#FF4757' : '#6495ED',
            strokeThickness: 3
        }).setOrigin(0.5);
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.canContinue = false;
        this.updatePlayerDisplay();
        this.updateContinueDisplay();
    }

    updateScore() {
        this.scoreText.setText(`玩家1: ${this.player1Score} | 玩家2: ${this.player2Score}`);
        this.updatePlayerDisplay();
    }

    updatePlayerDisplay() {
        const playerColor = this.currentPlayer === 1 ? '#FF0000' : '#0000FF';
        this.playerText.setText(`当前玩家: ${this.currentPlayer}`).setColor(playerColor);
    }

    updateContinueDisplay() {
        if (this.canContinue) {
            this.continueText.setText(`玩家${this.currentPlayer}可以继续画线！`).setColor('#FF6600');
        } else {
            this.continueText.setText('');
        }
    }

    checkGameOver() {
        const totalBoxes = this.gridSize * this.gridSize;
        const completedBoxes = this.player1Score + this.player2Score;

        if (completedBoxes === totalBoxes) {
            this.gameOver = true;
            this.hideHoverLine();

            let message = '';
            if (this.player1Score > this.player2Score) {
                message = '游戏结束！玩家1获胜！';
            } else if (this.player2Score > this.player1Score) {
                message = '游戏结束！玩家2获胜！';
            } else {
                message = '游戏结束！平局！';
            }

            this.gameOverText.setText(message).setVisible(true);
        }
    }

    update() {
        // 游戏逻辑在事件处理中完成
    }
}
