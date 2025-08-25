class YahtzeeGame extends Phaser.Scene {
    constructor() {
        super({ key: 'YahtzeeGame' });

        // 游戏状态
        this.dice = [1, 1, 1, 1, 1]; // 5个骰子的值
        this.diceHeld = [false, false, false, false, false]; // 骰子是否被保持
        this.rollsLeft = 3; // 剩余投掷次数
        this.currentRound = 1; // 当前回合
        this.totalRounds = 13; // 总回合数
        this.gameOver = false;

        // 计分卡
        this.scoreCard = {
            ones: null, twos: null, threes: null, fours: null, fives: null, sixes: null,
            threeOfAKind: null, fourOfAKind: null, fullHouse: null, smallStraight: null,
            largeStraight: null, yahtzee: null, chance: null
        };

        // UI元素
        this.diceSprites = [];
        this.diceTexts = [];
        this.holdButtons = [];
        this.scoreButtons = [];
        this.totalScore = 0;
        this.upperSectionBonus = 0;

        // 样式配置
        this.colors = {
            primary: 0x4A90E2,
            secondary: 0x7ED321,
            accent: 0xF5A623,
            danger: 0xD0021B,
            background: 0xF8F9FA,
            card: 0xFFFFFF,
            text: 0x333333,
            textLight: 0x666666
        };
    }

    preload() {
        // 创建骰子纹理
        this.createDiceTextures();
    }

    create() {
        // 设置背景
        this.cameras.main.setBackgroundColor('#F0F4F8');

        // 创建背景装饰
        this.createBackground();

        // 创建UI布局
        this.createGameTitle();
        this.createDiceArea();
        this.createControlButtons();
        this.createScoreCard();
        this.createGameInfo();

        // 初始化游戏
        this.startNewGame();
    }

    createDiceTextures() {
        const diceSize = 60;
        const dotSize = 8;
        const colors = [0xFFFFFF, 0x333333]; // 白色背景，黑色点

        for (let i = 1; i <= 6; i++) {
            const graphics = this.add.graphics();

            // 绘制骰子背景
            graphics.fillStyle(colors[0]);
            graphics.fillRoundedRect(0, 0, diceSize, diceSize, 8);
            graphics.lineStyle(2, 0xCCCCCC);
            graphics.strokeRoundedRect(0, 0, diceSize, diceSize, 8);

            // 绘制点数
            graphics.fillStyle(colors[1]);
            this.drawDots(graphics, i, diceSize, dotSize);

            // 生成纹理
            graphics.generateTexture(`dice${i}`, diceSize, diceSize);
            graphics.destroy();
        }
    }

    drawDots(graphics, number, size, dotSize) {
        const center = size / 2;
        const quarter = size / 4;
        const threeQuarter = size * 3 / 4;

        const positions = {
            1: [[center, center]],
            2: [[quarter, quarter], [threeQuarter, threeQuarter]],
            3: [[quarter, quarter], [center, center], [threeQuarter, threeQuarter]],
            4: [[quarter, quarter], [threeQuarter, quarter], [quarter, threeQuarter], [threeQuarter, threeQuarter]],
            5: [[quarter, quarter], [threeQuarter, quarter], [center, center], [quarter, threeQuarter], [threeQuarter, threeQuarter]],
            6: [[quarter, quarter], [threeQuarter, quarter], [quarter, center], [threeQuarter, center], [quarter, threeQuarter], [threeQuarter, threeQuarter]]
        };

        positions[number].forEach(([x, y]) => {
            graphics.fillCircle(x, y, dotSize);
        });
    }

    createBackground() {
        // 创建渐变背景装饰
        const graphics = this.add.graphics();

        // 顶部装饰条
        graphics.fillGradientStyle(0x4A90E2, 0x357ABD, 0x4A90E2, 0x357ABD);
        graphics.fillRect(0, 0, this.cameras.main.width, 80);

        // 底部装饰
        graphics.fillStyle(0xE8F4FD, 0.3);
        graphics.fillRect(0, this.cameras.main.height - 60, this.cameras.main.width, 60);
    }

    createGameTitle() {
        // 游戏标题
        this.add.text(this.cameras.main.centerX, 40, '🎲 快艇骰子 YAHTZEE', {
            fontSize: '32px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
    }

    createDiceArea() {
        const startX = this.cameras.main.centerX - 200;
        const startY = 150;
        const spacing = 80;

        // 骰子区域背景
        const diceAreaBg = this.add.graphics();
        diceAreaBg.fillStyle(0xFFFFFF, 0.9);
        diceAreaBg.fillRoundedRect(startX - 40, startY - 40, 400, 160, 15);
        diceAreaBg.lineStyle(2, 0xE0E0E0);
        diceAreaBg.strokeRoundedRect(startX - 40, startY - 40, 400, 160, 15);

        // 创建5个骰子
        for (let i = 0; i < 5; i++) {
            const x = startX + i * spacing;
            const y = startY;

            // 骰子精灵
            const diceSprite = this.add.image(x, y, 'dice1')
                .setInteractive()
                .setScale(1.2);

            // 骰子点击效果
            diceSprite.on('pointerdown', () => {
                if (this.rollsLeft < 3) {
                    this.toggleHoldDice(i);
                }
            });

            // 悬停效果
            diceSprite.on('pointerover', () => {
                if (this.rollsLeft < 3) {
                    diceSprite.setTint(0xE0E0E0);
                }
            });

            diceSprite.on('pointerout', () => {
                if (!this.diceHeld[i]) {
                    diceSprite.clearTint();
                }
            });

            this.diceSprites.push(diceSprite);

            // 保持状态指示器
            const holdText = this.add.text(x, y + 50, '', {
                fontSize: '14px',
                fill: '#D0021B',
                fontFamily: 'Arial',
                fontWeight: 'bold'
            }).setOrigin(0.5);

            this.holdButtons.push(holdText);
        }
    }

    createControlButtons() {
        const centerX = this.cameras.main.centerX;
        const buttonY = 300;

        // 投掷按钮
        this.rollButton = this.createStyledButton(centerX, buttonY, '🎲 投掷', () => {
            this.rollDice();
        }, this.colors.primary);

        // 投掷次数显示
        this.rollsText = this.add.text(centerX, buttonY + 50, '', {
            fontSize: '18px',
            fill: '#666666',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
    }

    createStyledButton(x, y, text, callback, color) {
        const button = this.add.graphics();
        button.fillStyle(color);
        button.fillRoundedRect(-60, -20, 120, 40, 20);
        button.lineStyle(2, 0xFFFFFF, 0.3); // 添加边框
        button.strokeRoundedRect(-60, -20, 120, 40, 20);
        button.setPosition(x, y);

        const buttonText = this.add.text(x, y, text, {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // 添加交互
        const hitArea = new Phaser.Geom.Rectangle(-60, -20, 120, 40);
        button.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

        // 存储原始颜色
        button.originalColor = color;

        button.on('pointerover', () => {
            button.clear();
            // 使用简单的颜色变亮计算
            const colorObj = Phaser.Display.Color.ValueToColor(color);
            const hoverColor = Phaser.Display.Color.GetColor(
                Math.min(255, colorObj.red + 30),
                Math.min(255, colorObj.green + 30),
                Math.min(255, colorObj.blue + 30)
            );
            button.fillStyle(hoverColor);
            button.fillRoundedRect(-60, -20, 120, 40, 20);
            button.lineStyle(2, 0xFFFFFF, 0.5);
            button.strokeRoundedRect(-60, -20, 120, 40, 20);
        });

        button.on('pointerout', () => {
            button.clear();
            button.fillStyle(color);
            button.fillRoundedRect(-60, -20, 120, 40, 20);
            button.lineStyle(2, 0xFFFFFF, 0.3);
            button.strokeRoundedRect(-60, -20, 120, 40, 20);
        });

        button.on('pointerdown', () => {
            // 点击效果
            button.clear();
            // 使用简单的颜色变暗计算
            const colorObj = Phaser.Display.Color.ValueToColor(color);
            const pressColor = Phaser.Display.Color.GetColor(
                Math.max(0, colorObj.red - 30),
                Math.max(0, colorObj.green - 30),
                Math.max(0, colorObj.blue - 30)
            );
            button.fillStyle(pressColor);
            button.fillRoundedRect(-60, -20, 120, 40, 20);
            button.lineStyle(2, 0xFFFFFF, 0.3);
            button.strokeRoundedRect(-60, -20, 120, 40, 20);

            // 延迟恢复颜色
            this.time.delayedCall(100, () => {
                if (button.active) {
                    button.clear();
                    button.fillStyle(color);
                    button.fillRoundedRect(-60, -20, 120, 40, 20);
                    button.lineStyle(2, 0xFFFFFF, 0.3);
                    button.strokeRoundedRect(-60, -20, 120, 40, 20);
                }
            });

            callback();
        });

        return { graphics: button, text: buttonText };
    }

    createScoreCard() {
        const startX = 50;
        const startY = 360;
        const cardWidth = this.cameras.main.width - 100;
        const cardHeight = 280;

        // 计分卡背景
        const cardBg = this.add.graphics();
        cardBg.fillStyle(0xFFFFFF, 0.95);
        cardBg.fillRoundedRect(startX, startY, cardWidth, cardHeight, 15);
        cardBg.lineStyle(2, 0xE0E0E0);
        cardBg.strokeRoundedRect(startX, startY, cardWidth, cardHeight, 15);

        // 计分卡标题
        this.add.text(startX + 20, startY + 15, '📊 计分卡', {
            fontSize: '20px',
            fill: '#333333',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        });

        // 创建分数项目
        this.createScoreItems(startX + 20, startY + 50);
    }

    createScoreItems(startX, startY) {
        const scoreCategories = [
            { key: 'ones', name: '1点', description: '所有1的总和' },
            { key: 'twos', name: '2点', description: '所有2的总和' },
            { key: 'threes', name: '3点', description: '所有3的总和' },
            { key: 'fours', name: '4点', description: '所有4的总和' },
            { key: 'fives', name: '5点', description: '所有5的总和' },
            { key: 'sixes', name: '6点', description: '所有6的总和' },
            { key: 'threeOfAKind', name: '三同号', description: '至少3个相同数字' },
            { key: 'fourOfAKind', name: '四同号', description: '至少4个相同数字' },
            { key: 'fullHouse', name: '满堂红', description: '3个+2个相同数字' },
            { key: 'smallStraight', name: '小顺子', description: '连续4个数字' },
            { key: 'largeStraight', name: '大顺子', description: '连续5个数字' },
            { key: 'yahtzee', name: '快艇', description: '5个相同数字' },
            { key: 'chance', name: '机会', description: '所有骰子总和' }
        ];

        const itemsPerColumn = 6;
        const columnWidth = 315;

        scoreCategories.forEach((category, index) => {
            const col = Math.floor(index / itemsPerColumn);
            const row = index % itemsPerColumn;
            const x = startX + col * columnWidth;
            const y = startY + row * 35;

            // 分类名称
            this.add.text(x, y, category.name, {
                fontSize: '20px',
                fill: '#333333',
                fontFamily: 'Arial',
                fontWeight: 'bold'
            });

            // 描述
            this.add.text(x + 80, y, category.description, {
                fontSize: '18px',
                fill: '#666666',
                fontFamily: 'Arial'
            });

            // 分数按钮
            const scoreButton = this.createScoreButton(x + 235, y + 10, category.key);
            this.scoreButtons.push({ key: category.key, button: scoreButton });
        });
    }

    createScoreButton(x, y, key) {
        const button = this.add.graphics();
        button.fillStyle(0xF0F0F0);
        button.fillRoundedRect(0, -10, 60, 20, 5);
        button.lineStyle(1, 0xCCCCCC);
        button.strokeRoundedRect(0, -10, 60, 20, 5);
        button.setPosition(x, y);

        const scoreText = this.add.text(x + 30, y, '—', {
            fontSize: '12px',
            fill: '#666666',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        const hitArea = new Phaser.Geom.Rectangle(0, -10, 60, 20);
        button.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

        // 悬停效果
        button.on('pointerover', () => {
            if (this.rollsLeft < 3 && this.scoreCard[key] === null) {
                button.clear();
                button.fillStyle(0xE0E0E0);
                button.fillRoundedRect(0, -10, 60, 20, 5);
                button.lineStyle(1, 0x999999);
                button.strokeRoundedRect(0, -10, 60, 20, 5);
            }
        });

        button.on('pointerout', () => {
            if (this.rollsLeft < 3 && this.scoreCard[key] === null) {
                button.clear();
                button.fillStyle(0xF0F0F0);
                button.fillRoundedRect(0, -10, 60, 20, 5);
                button.lineStyle(1, 0xCCCCCC);
                button.strokeRoundedRect(0, -10, 60, 20, 5);
            }
        });

        button.on('pointerdown', () => {
            if (this.rollsLeft < 3 && this.scoreCard[key] === null) {
                this.selectScore(key);
            }
        });

        return { graphics: button, text: scoreText };
    }

    createGameInfo() {
        // 总分显示
        this.totalScoreText = this.add.text(this.cameras.main.width - 150, 370, '', {
            fontSize: '18px',
            fill: '#333333',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        });

        // 回合显示
        this.roundText = this.add.text(this.cameras.main.width - 150, 400, '', {
            fontSize: '16px',
            fill: '#666666',
            fontFamily: 'Arial'
        });
    }

    startNewGame() {
        // 重置游戏状态
        this.dice = [1, 1, 1, 1, 1];
        this.diceHeld = [false, false, false, false, false];
        this.rollsLeft = 3;
        this.currentRound = 1;
        this.gameOver = false;
        this.totalScore = 0;

        // 重置计分卡
        Object.keys(this.scoreCard).forEach(key => {
            this.scoreCard[key] = null;
        });

        // 更新UI
        this.updateDiceDisplay();
        this.updateScoreCard();
        this.updateGameInfo();
    }

    rollDice() {
        if (this.rollsLeft <= 0 || this.gameOver) return;

        // 投掷未保持的骰子
        for (let i = 0; i < 5; i++) {
            if (!this.diceHeld[i]) {
                this.dice[i] = Phaser.Math.Between(1, 6);
            }
        }

        this.rollsLeft--;
        this.updateDiceDisplay();
        this.updateGameInfo();
        this.updateScorePreview();
    }

    toggleHoldDice(index) {
        if (this.rollsLeft >= 3) return;

        this.diceHeld[index] = !this.diceHeld[index];
        this.updateDiceDisplay();
    }

    updateDiceDisplay() {
        for (let i = 0; i < 5; i++) {
            this.diceSprites[i].setTexture(`dice${this.dice[i]}`);

            if (this.diceHeld[i]) {
                this.diceSprites[i].setTint(0xFFE6E6);
                this.holdButtons[i].setText('锁定骰子');
            } else {
                this.diceSprites[i].clearTint();
                this.holdButtons[i].setText('');
            }
        }
    }

    updateScorePreview() {
        this.scoreButtons.forEach(({ key, button }) => {
            if (this.scoreCard[key] === null) {
                const score = this.calculateScore(key);
                button.text.setText(score.toString());
                button.text.setColor('#4A90E2');
            }
        });
    }

    calculateScore(category) {
        const counts = [0, 0, 0, 0, 0, 0, 0]; // counts[1] = 1的个数
        this.dice.forEach(die => counts[die]++);
        const sum = this.dice.reduce((a, b) => a + b, 0);

        switch (category) {
            case 'ones': return counts[1] * 1;
            case 'twos': return counts[2] * 2;
            case 'threes': return counts[3] * 3;
            case 'fours': return counts[4] * 4;
            case 'fives': return counts[5] * 5;
            case 'sixes': return counts[6] * 6;
            case 'threeOfAKind':
                return counts.some(count => count >= 3) ? sum : 0;
            case 'fourOfAKind':
                return counts.some(count => count >= 4) ? sum : 0;
            case 'fullHouse':
                return counts.includes(3) && counts.includes(2) ? 25 : 0;
            case 'smallStraight':
                return this.hasSequence(4) ? 30 : 0;
            case 'largeStraight':
                return this.hasSequence(5) ? 40 : 0;
            case 'yahtzee':
                return counts.some(count => count === 5) ? 50 : 0;
            case 'chance':
                return sum;
            default:
                return 0;
        }
    }

    hasSequence(length) {
        const sorted = [...new Set(this.dice)].sort((a, b) => a - b);
        let consecutive = 1;

        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] === sorted[i - 1] + 1) {
                consecutive++;
                if (consecutive >= length) return true;
            } else {
                consecutive = 1;
            }
        }
        return false;
    }

    selectScore(category) {
        const score = this.calculateScore(category);
        this.scoreCard[category] = score;
        this.totalScore += score;

        // 重置回合
        this.rollsLeft = 3;
        this.diceHeld = [false, false, false, false, false];
        this.currentRound++;

        this.updateDiceDisplay();
        this.updateScoreCard();
        this.updateGameInfo();

        // 显示新回合提示
        this.showRoundToast(`第 ${this.currentRound} 回合开始！`);

        if (this.currentRound > this.totalRounds) {
            this.endGame();
        }
    }

    updateScoreCard() {
        this.scoreButtons.forEach(({ key, button }) => {
            if (this.scoreCard[key] !== null) {
                button.text.setText(this.scoreCard[key].toString());
                button.text.setColor('#333333');
                button.graphics.clear();
                button.graphics.fillStyle(0xE8F5E8);
                button.graphics.fillRoundedRect(0, -10, 60, 20, 5);
            } else {
                button.text.setText('—');
                button.text.setColor('#666666');
            }
        });
    }

    updateGameInfo() {
        this.rollsText.setText(`剩余投掷次数: ${this.rollsLeft}`);
        this.totalScoreText.setText(`总分: ${this.totalScore}`);
        this.roundText.setText(`回合: ${this.currentRound}/${this.totalRounds}`);
    }

    endGame() {
        this.gameOver = true;

        // 计算上半部分奖励
        const upperScore = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes']
            .reduce((sum, key) => sum + (this.scoreCard[key] || 0), 0);

        if (upperScore >= 63) {
            this.upperSectionBonus = 35;
            this.totalScore += 35;
        }

        // 显示游戏结束
        const endGameText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY,
            `🎉 游戏结束！\n最终得分: ${this.totalScore}`, {
            fontSize: '24px',
            fill: '#333333',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        endGameText.setBackgroundColor('#FFFFFF')
            .setPadding(20, 15);
    }

    showRoundToast(message) {
        // 创建toast背景
        const toastBg = this.add.graphics();
        toastBg.fillStyle(0x333333, 0.9);
        toastBg.fillRoundedRect(-120, -25, 240, 50, 15);

        // 创建toast文本
        const toastText = this.add.text(0, 0, message, {
            fontSize: '20px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // 创建toast容器
        const toastContainer = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY);
        toastContainer.add([toastBg, toastText]);
        toastContainer.setAlpha(0);

        // 淡入效果
        this.tweens.add({
            targets: toastContainer,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });

        // 2秒后淡出并销毁
        this.tweens.add({
            targets: toastContainer,
            alpha: 0,
            duration: 500,
            delay: 2000,
            onComplete: () => {
                toastContainer.destroy();
            }
        });
    }

    update() {
        // 游戏逻辑更新
    }
}
