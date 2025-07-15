class ColorGuessGame extends Phaser.Scene {
    constructor() {
        super({ key: 'ColorGuessGame' });

        // 游戏配置
        this.colors = [
            { name: 'blue', hex: 0x0066ff, display: '蓝' },
            { name: 'red', hex: 0xff0000, display: '红' },
            { name: 'green', hex: 0x00cc00, display: '绿' },
            { name: 'yellow', hex: 0xffcc00, display: '黄' },
            { name: 'purple', hex: 0xcc00cc, display: '紫' },
            { name: 'white', hex: 0xffffff, display: '白' }
        ];

        this.secretCode = [];
        this.gameRows = [];
        this.currentRowIndex = 0;
        this.selectedColorIndex = 1; // 默认选中红色（索引1）
        this.gameOver = false;
        this.isDragging = false; // 拖拽状态标记
    }

    preload() {
        // 不需要预加载任何资源
    }

    create() {
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;

        // 检测是否为移动设备
        this.isMobile = this.sys.game.device.input.touch || width < 768;

        // 重置所有游戏状态
        this.resetGameState();

        // 生成密码
        this.generateSecretCode();

        // 创建背景
        this.add.rectangle(width / 2, height / 2, width, height, 0x2c3e50);

        // 创建游戏界面
        this.createGameInterface();

        // 设置输入
        this.setupInput();
    }

    generateSecretCode() {
        this.secretCode = [];
        const availableColors = [...this.colors]; // 创建颜色数组的副本

        for (let i = 0; i < 4; i++) {
            const randomIndex = Phaser.Math.Between(0, availableColors.length - 1);
            this.secretCode.push(availableColors[randomIndex]);
            // 移除已选择的颜色，确保不重复
            availableColors.splice(randomIndex, 1);
        }
        console.log('密码:', this.secretCode.map(c => c.display).join(', '));
    }

    resetGameState() {
        // 重置游戏核心状态
        this.currentRowIndex = 0;
        this.gameOver = false;
        this.selectedColorIndex = 1; // 默认选中红色

        // 重置拖拽状态
        this.isDragging = false;

        // 重置游戏数据
        this.gameRows = [];
        this.colorButtons = [];

        // 重置答案显示变量
        this.answerLabel = null;
        this.answerSlots = [];
        this.answerText = null;

        console.log('游戏状态已重置 - 当前行:', this.currentRowIndex);
    }

    createGameInterface() {
        // 创建顶部说明
        this.createTopInfo();

        // 创建主游戏板
        this.createMainBoard();

        // 创建颜色选择器
        this.createColorSelector();
    }

    createTopInfo() {
        const width = this.sys.game.config.width;

        // 根据设备调整顶部信息
        if (this.isMobile) {
            // 移动设备：简化顶部信息
            this.add.rectangle(width / 2, 25, width - 10, 40, 0x4a90e2);

            // 简化的说明文字
            this.add.text(width / 2, 25, '🔴全对 ⚪半对', {
                fontSize: '16px',
                fill: '#ffffff',
                fontWeight: 'bold',
                fontFamily: 'Microsoft YaHei, Arial, sans-serif'
            }).setOrigin(0.5);
        } else {
            // 桌面设备：完整的顶部信息
            this.add.rectangle(width / 2, 30, width - 20, 50, 0x4a90e2);

            // 全对示例 - 居中布局
            const leftExampleX = width / 2 - 150;
            this.add.circle(leftExampleX - 50, 30, 8, 0xff4500);
            this.add.text(leftExampleX - 30, 30, '全对：颜色和位置都正确', {
                fontSize: '20px',
                fill: '#ffffff',
                fontWeight: 'bold',
                fontFamily: 'Microsoft YaHei, Arial, sans-serif'
            }).setOrigin(0, 0.5);

            // 半对示例 - 居中布局
            const rightExampleX = width / 2 + 50;
            this.add.circle(rightExampleX, 30, 8, 0xffffff);
            this.add.text(rightExampleX + 20, 30, '半对：只有颜色正确', {
                fontSize: '20px',
                fill: '#ffffff',
                fontWeight: 'bold',
                fontFamily: 'Microsoft YaHei, Arial, sans-serif'
            }).setOrigin(0, 0.5);
        }

        // 根据设备调整按钮布局
        if (this.isMobile) {
            // 移动设备：按钮放在顶部右侧，更小尺寸
            const buttonY = 25;
            const buttonWidth = 80;
            const buttonHeight = 30;

            // 返回菜单按钮
            const backButton = this.add.rectangle(40, buttonY, buttonWidth, buttonHeight, 0x333333);
            backButton.setStrokeStyle(2, 0x666666);
            backButton.setInteractive();

            this.add.text(40, buttonY, '菜单', {
                fontSize: '16px',
                fill: '#ffffff',
                fontWeight: 'bold',
                fontFamily: 'Microsoft YaHei, Arial, sans-serif'
            }).setOrigin(0.5);

            // 重新游戏按钮
            const restartButton = this.add.rectangle(120, buttonY, buttonWidth, buttonHeight, 0x4CAF50);
            restartButton.setStrokeStyle(2, 0x45a049);
            restartButton.setInteractive();

            this.add.text(120, buttonY, '重开', {
                fontSize: '16px',
                fill: '#ffffff',
                fontWeight: 'bold',
                fontFamily: 'Microsoft YaHei, Arial, sans-serif'
            }).setOrigin(0.5);

            // 添加按钮事件
            this.setupButtonEvents(backButton, restartButton);
        } else {
            // 桌面设备：原有布局
            const backButton = this.add.rectangle(80, 30, 120, 35, 0x333333);
            backButton.setStrokeStyle(2, 0x666666);
            backButton.setInteractive();

            this.add.text(80, 30, '返回菜单', {
                fontSize: '20px',
                fill: '#ffffff',
                fontWeight: 'bold',
                fontFamily: 'Microsoft YaHei, Arial, sans-serif'
            }).setOrigin(0.5);

            const restartButton = this.add.rectangle(220, 30, 120, 35, 0x4CAF50);
            restartButton.setStrokeStyle(2, 0x45a049);
            restartButton.setInteractive();

            this.add.text(220, 30, '重新游戏', {
                fontSize: '20px',
                fill: '#ffffff',
                fontWeight: 'bold',
                fontFamily: 'Microsoft YaHei, Arial, sans-serif'
            }).setOrigin(0.5);

            // 添加按钮事件
            this.setupButtonEvents(backButton, restartButton);
        }
    }

    setupButtonEvents(backButton, restartButton) {
        backButton.on('pointerdown', () => {
            this.resetAllDragStates();
            this.scene.start('MainMenu');
        });

        backButton.on('pointerover', () => {
            backButton.setFillStyle(0x555555);
        });

        backButton.on('pointerout', () => {
            backButton.setFillStyle(0x333333);
        });

        restartButton.on('pointerdown', () => {
            this.resetAllDragStates();
            this.scene.restart();
        });

        restartButton.on('pointerover', () => {
            restartButton.setFillStyle(0x66BB6A);
        });

        restartButton.on('pointerout', () => {
            restartButton.setFillStyle(0x4CAF50);
        });
    }

    createMainBoard() {
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;

        // 根据设备调整游戏板尺寸
        let boardWidth, boardHeight, slotSize, slotSpacing, rowHeight, boardStartX, boardStartY;
        let fontSize, arrowFontSize, okButtonWidth, okButtonHeight, okFontSize;

        if (this.isMobile) {
            // 移动设备：紧凑布局
            boardWidth = Math.min(350, width * 0.9);
            boardHeight = Math.min(500, height * 0.7);
            slotSize = 25;
            slotSpacing = 40;
            rowHeight = 50;
            fontSize = '20px';
            arrowFontSize = '16px';
            okButtonWidth = 60;
            okButtonHeight = 30;
            okFontSize = '14px';
        } else {
            // 桌面设备：原有尺寸
            boardWidth = Math.min(700, width * 0.8);
            boardHeight = Math.min(650, height * 0.8);
            slotSize = 40;
            slotSpacing = 60;
            rowHeight = 65;
            fontSize = '32px';
            arrowFontSize = '24px';
            okButtonWidth = 80;
            okButtonHeight = 40;
            okFontSize = '20px';
        }

        const boardCenterX = width / 2;
        const boardCenterY = this.isMobile ? height / 2 - 10 : height / 2 - 30;
        boardStartX = boardCenterX - (slotSpacing * 1.5);
        boardStartY = boardCenterY - (rowHeight * 3.5);

        // 游戏板背景
        this.add.rectangle(boardCenterX, boardCenterY, boardWidth, boardHeight, 0x2a2a2a);
        this.add.rectangle(boardCenterX, boardCenterY, boardWidth, boardHeight, 0x000000, 0).setStrokeStyle(this.isMobile ? 2 : 4, 0x666666);

        this.gameRows = [];

        for (let row = 0; row < 8; row++) {
            const y = boardStartY + row * rowHeight;

            // 行号 - 响应式字体
            this.add.text(boardStartX - (this.isMobile ? 25 : 40), y, (row + 1).toString(), {
                fontSize: fontSize,
                fill: '#ffffff',
                fontWeight: 'bold',
                fontFamily: 'Microsoft YaHei, Arial, sans-serif'
            }).setOrigin(0.5);

            // 箭头 - 响应式字体和位置
            this.add.text(boardStartX + (this.isMobile ? 150 : 260), y, '▶', {
                fontSize: arrowFontSize,
                fill: '#ffffff'
            }).setOrigin(0.5);

            // 4个猜测槽位
            const guessSlots = [];
            for (let col = 0; col < 4; col++) {
                const x = boardStartX + col * slotSpacing;
                const slot = this.add.circle(x, y, slotSize / 2, 0x606060);
                slot.setStrokeStyle(3, 0x808080);  // 从2增加到3
                slot.setInteractive();

                // 点击槽位放置颜色
                slot.on('pointerdown', () => {
                    if (row === this.currentRowIndex) {
                        this.placeColorInSlot(row, col);
                    }
                });

                // 拖拽悬停效果
                slot.on('pointerover', () => {
                    if (row === this.currentRowIndex) {
                        slot.setStrokeStyle(4, 0xffd700);  // 从3增加到4
                    }
                });

                slot.on('pointerout', () => {
                    if (row === this.currentRowIndex) {
                        slot.setStrokeStyle(3, 0x808080);  // 从2增加到3
                    }
                });

                guessSlots.push({
                    sprite: slot,
                    color: null,
                    x: x,
                    y: y
                });
            }

            // OK按钮和提示区域 - 响应式尺寸和位置
            const okButtonX = boardStartX + (this.isMobile ? 200 : 330);
            const okButton = this.add.rectangle(okButtonX, y, okButtonWidth, okButtonHeight, 0x4CAF50);
            okButton.setStrokeStyle(this.isMobile ? 2 : 3, 0x45a049);
            okButton.setInteractive();

            // 只有当前行显示OK按钮
            okButton.setVisible(row === this.currentRowIndex);

            const okText = this.add.text(okButtonX, y, '确认', {
                fontSize: okFontSize,
                fill: '#ffffff',
                fontWeight: 'bold',
                fontFamily: 'Microsoft YaHei, Arial, sans-serif'
            }).setOrigin(0.5);

            // 只有当前行显示OK文本
            okText.setVisible(row === this.currentRowIndex);

            // 提示区域（2x2小圆点）- 响应式尺寸
            const hintSlots = [];
            const hintSpacing = this.isMobile ? 12 : 20;
            const hintRadius = this.isMobile ? 5 : 8;
            const hintStartX = boardStartX + (this.isMobile ? 180 : 290);

            for (let hintRow = 0; hintRow < 2; hintRow++) {
                for (let hintCol = 0; hintCol < 2; hintCol++) {
                    const hintX = hintStartX + hintCol * hintSpacing;
                    const hintY = y - (hintSpacing / 2) + hintRow * hintSpacing;
                    const hintSlot = this.add.circle(hintX, hintY, hintRadius, 0x303030);
                    hintSlot.setStrokeStyle(this.isMobile ? 1 : 2, 0x505050);
                    hintSlot.setVisible(false); // 初始隐藏
                    hintSlots.push(hintSlot);
                }
            }

            // OK按钮点击事件
            okButton.on('pointerdown', () => {
                if (row === this.currentRowIndex && this.isRowComplete(row)) {
                    this.submitGuess(row);
                }
            });

            okButton.on('pointerover', () => {
                if (row === this.currentRowIndex && this.isRowComplete(row)) {
                    okButton.setFillStyle(0x66BB6A);
                }
            });

            okButton.on('pointerout', () => {
                okButton.setFillStyle(0x4CAF50);
            });

            this.gameRows.push({
                guessSlots: guessSlots,
                hintSlots: hintSlots,
                okButton: okButton,
                okText: okText,
                completed: false
            });
        }

        // 创建正确答案显示区域
        this.createAnswerDisplay(boardStartX, boardStartY, rowHeight, slotSize, slotSpacing);

        // 高亮当前行
        this.highlightCurrentRow();
    }

    createAnswerDisplay(boardStartX, boardStartY, rowHeight, slotSize, slotSpacing) {
        // 正确答案显示在第9行位置
        const answerY = boardStartY + 8 * rowHeight;

        // "答案"标签
        this.answerLabel = this.add.text(boardStartX - 40, answerY, '答案', {
            fontSize: '32px',
            fill: '#ffff00',  // 黄色突出显示
            fontWeight: 'bold',
            fontFamily: 'Microsoft YaHei, Arial, sans-serif'
        }).setOrigin(0.5);
        this.answerLabel.setVisible(false);  // 初始隐藏

        // 4个答案槽位
        this.answerSlots = [];
        for (let col = 0; col < 4; col++) {
            const x = boardStartX + col * slotSpacing;
            const answerSlot = this.add.circle(x, answerY, slotSize / 2, 0x606060);
            answerSlot.setStrokeStyle(3, 0xffff00);  // 黄色边框
            answerSlot.setVisible(false);  // 初始隐藏
            this.answerSlots.push(answerSlot);
        }

        // "正确答案"文字说明
        this.answerText = this.add.text(boardStartX + 260, answerY, '正确答案', {
            fontSize: '24px',
            fill: '#ffff00',
            fontWeight: 'bold',
            fontFamily: 'Microsoft YaHei, Arial, sans-serif'
        }).setOrigin(0.5);
        this.answerText.setVisible(false);  // 初始隐藏
    }

    showCorrectAnswer() {
        // 显示答案标签和文字
        // this.answerLabel.setVisible(true);
        // this.answerText.setVisible(true);

        // 显示正确答案的颜色
        this.answerSlots.forEach((slot, index) => {
            slot.setVisible(true);
            slot.setFillStyle(this.secretCode[index].hex);

            // 添加闪烁效果
            this.tweens.add({
                targets: slot,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 300,
                yoyo: true,
                repeat: 2
            });
        });
    }

    createColorSelector() {
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;

        // 根据设备调整颜色选择器
        let selectorY, spacing, ballRadius, selectorRadius, selectorWidth, selectorHeight;

        if (this.isMobile) {
            selectorY = height - 60;
            spacing = 50;
            ballRadius = 18;
            selectorRadius = 22;
            selectorWidth = Math.min(320, width * 0.9);
            selectorHeight = 60;
        } else {
            selectorY = height - 100;
            spacing = 80;
            ballRadius = 28;
            selectorRadius = 35;
            selectorWidth = Math.min(550, width * 0.8);
            selectorHeight = 100;
        }

        const selectorCenterX = width / 2;
        const totalWidth = (this.colors.length - 1) * spacing;
        const startX = selectorCenterX - totalWidth / 2;

        // 选择器背景 - 响应式尺寸
        this.add.rectangle(selectorCenterX, selectorY, selectorWidth, selectorHeight, 0x505050);

        this.colorButtons = [];
        this.colors.forEach((color, index) => {
            const x = startX + index * spacing;

            // 颜色球 - 响应式尺寸
            const colorBall = this.add.circle(x, selectorY, ballRadius, color.hex);
            colorBall.setStrokeStyle(this.isMobile ? 2 : 3, 0xffffff);
            colorBall.setInteractive();

            // 选中指示器 - 响应式尺寸
            const selector = this.add.circle(x, selectorY, selectorRadius, 0xffffff, 0);
            selector.setStrokeStyle(this.isMobile ? 3 : 4, 0xffd700);
            selector.setVisible(index === 1); // 默认选中红色

            // 设置拖拽功能
            this.setupColorDrag(colorBall, color, index);

            // 点击选择颜色
            colorBall.on('pointerdown', () => {
                this.selectColor(index);
            });

            this.colorButtons.push({
                ball: colorBall,
                selector: selector,
                color: color,
                originalX: x,
                originalY: selectorY
            });
        });
    }

    setupColorDrag(colorBall, color, colorIndex) {
        // 直接设置颜色球为可拖拽，不创建副本
        colorBall.setData('originalX', colorBall.x);
        colorBall.setData('originalY', colorBall.y);
        colorBall.setData('color', color);
        colorBall.setData('colorIndex', colorIndex);

        // 开始拖拽
        colorBall.on('dragstart', () => {
            // 防止多重拖拽
            if (this.isDragging) return;

            this.isDragging = true;

            // 设置拖拽时的视觉效果 - 移动设备更明显
            colorBall.setAlpha(0.8);
            colorBall.setDepth(1000);
            colorBall.setScale(this.isMobile ? 1.3 : 1.1);

            // 选择这个颜色
            this.selectColor(colorIndex);
        });

        // 拖拽中
        colorBall.on('drag', (pointer, dragX, dragY) => {
            if (this.isDragging) {
                colorBall.x = dragX;
                colorBall.y = dragY;
            }
        });

        // 结束拖拽
        colorBall.on('dragend', (pointer) => {
            if (!this.isDragging) return;

            // 检查是否拖拽到了有效的槽位
            const dropSlot = this.findDropSlot(pointer.x, pointer.y);

            if (dropSlot) {
                // 获取被拖拽球的颜色信息
                const draggedColor = colorBall.getData('color');
                const draggedColorIndex = colorBall.getData('colorIndex');

                // 放置被拖拽的颜色到槽位
                this.placeColorInSlotWithColor(dropSlot.row, dropSlot.col, draggedColor, draggedColorIndex);
            }

            // 恢复颜色球到原位置和状态
            this.resetColorBall(colorBall);
        });

        // 启用拖拽
        this.input.setDraggable(colorBall);
    }

    resetColorBall(colorBall) {
        // 恢复颜色球的位置和状态
        const originalX = colorBall.getData('originalX');
        const originalY = colorBall.getData('originalY');

        colorBall.x = originalX;
        colorBall.y = originalY;
        colorBall.setAlpha(1);
        colorBall.setDepth(0);
        colorBall.setScale(1);

        this.isDragging = false;
    }

    resetAllDragStates() {
        // 重置所有颜色球的拖拽状态
        if (this.colorButtons) {
            this.colorButtons.forEach(button => {
                if (button.ball && button.ball.active) {
                    this.resetColorBall(button.ball);
                }
            });
        }
        this.isDragging = false;
    }



    findDropSlot(x, y) {
        const currentRow = this.gameRows[this.currentRowIndex];
        if (!currentRow || this.gameOver) return null;

        // 根据设备调整检测范围
        const detectionRadius = this.isMobile ? 60 : 45;

        // 检查每个槽位
        for (let col = 0; col < currentRow.guessSlots.length; col++) {
            const slot = currentRow.guessSlots[col];
            const distance = Phaser.Math.Distance.Between(x, y, slot.x, slot.y);

            // 移动设备使用更大的检测范围
            if (distance < detectionRadius) {
                return {
                    row: this.currentRowIndex,
                    col: col,
                    x: slot.x,
                    y: slot.y
                };
            }
        }

        return null;
    }

    isRowComplete(rowIndex) {
        const row = this.gameRows[rowIndex];
        if (!row) return false;

        // 检查所有槽位是否都有颜色
        return row.guessSlots.every(slot => slot.color !== null);
    }

    submitGuess(rowIndex) {
        if (this.gameOver || rowIndex !== this.currentRowIndex) return;

        const row = this.gameRows[rowIndex];
        const guess = row.guessSlots.map(slot => slot.color);

        // 隐藏OK按钮和文本
        row.okButton.setVisible(false);
        row.okText.setVisible(false);

        // 显示提示区域
        row.hintSlots.forEach(slot => slot.setVisible(true));

        // 计算提示
        const hints = this.calculateHints(guess);
        this.displayHints(row, hints);

        // 标记行为已完成
        row.completed = true;

        // 检查游戏结果
        if (this.checkWin(guess)) {
            this.gameOver = true;
            setTimeout(() => {
                alert('恭喜！你猜对了！');
                this.resetAllDragStates();
                this.scene.start('MainMenu');
            }, 500);
        } else if (this.currentRowIndex >= 7) {
            this.gameOver = true;
            // 显示正确答案
            this.showCorrectAnswer();

            // 显示游戏结束提示，但不跳转场景
            const width = this.sys.game.config.width;
            const height = this.sys.game.config.height;

            // 创建半透明背景
            const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
            overlay.setDepth(2000);

            // 游戏结束文字
            const gameOverText = this.add.text(width / 2, height / 2 - 50, '游戏结束！', {
                fontSize: '48px',
                fill: '#ff0000',
                fontWeight: 'bold',
                fontFamily: 'Microsoft YaHei, Arial, sans-serif'
            }).setOrigin(0.5);
            gameOverText.setDepth(2001);

            const hintText = this.add.text(width / 2, height / 2 + 10, '正确答案已显示在游戏板下方', {
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: 'Microsoft YaHei, Arial, sans-serif'
            }).setOrigin(0.5);
            hintText.setDepth(2001);

            // 点击任意位置继续的提示
            const continueText = this.add.text(width / 2, height / 2 + 60, '点击任意位置继续游戏', {
                fontSize: '20px',
                fill: '#ffff00',
                fontFamily: 'Microsoft YaHei, Arial, sans-serif'
            }).setOrigin(0.5);
            continueText.setDepth(2001);

            // 添加闪烁效果
            this.tweens.add({
                targets: continueText,
                alpha: 0.3,
                duration: 800,
                yoyo: true,
                repeat: -1
            });

            // 点击继续游戏
            overlay.setInteractive();
            overlay.on('pointerdown', () => {
                overlay.destroy();
                gameOverText.destroy();
                hintText.destroy();
                continueText.destroy();
            });
        } else {
            // 移动到下一行
            this.currentRowIndex++;
            this.highlightCurrentRow();
        }
    }

    highlightCurrentRow() {
        // 可以添加当前行高亮效果
        // 更新当前行OK按钮的可见性
        this.updateOkButtonVisibility();
    }

    updateOkButtonVisibility() {
        this.gameRows.forEach((row, index) => {
            if (index === this.currentRowIndex && !row.completed) {
                // 当前行：显示OK按钮，根据完成状态调整透明度
                const isComplete = this.isRowComplete(index);
                row.okButton.setVisible(true);
                row.okText.setVisible(true);
                row.okButton.setAlpha(isComplete ? 1 : 0.5);
                row.okText.setAlpha(isComplete ? 1 : 0.5);
            } else {
                // 其他行：隐藏OK按钮
                row.okButton.setVisible(false);
                row.okText.setVisible(false);
            }
        });
    }

    selectColor(index) {
        // 隐藏之前的选择
        this.colorButtons[this.selectedColorIndex].selector.setVisible(false);

        // 显示新选择
        this.selectedColorIndex = index;
        this.colorButtons[index].selector.setVisible(true);
    }

    placeColorInSlot(row, col) {
        if (this.gameOver || row !== this.currentRowIndex) return;

        const selectedColor = this.colors[this.selectedColorIndex];
        this.placeColorInSlotWithColor(row, col, selectedColor, this.selectedColorIndex);
    }

    placeColorInSlotWithColor(row, col, color, colorIndex) {
        if (this.gameOver || row !== this.currentRowIndex) return;

        const slot = this.gameRows[row].guessSlots[col];

        // 设置颜色
        slot.sprite.setFillStyle(color.hex);
        slot.color = color;

        // 动画效果
        this.tweens.add({
            targets: slot.sprite,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            yoyo: true
        });

        // 更新选中的颜色索引（这样拖拽后会自动选中该颜色）
        this.selectColor(colorIndex);

        // 更新OK按钮状态
        this.updateOkButtonVisibility();
    }



    calculateHints(guess) {
        let exact = 0;
        let color = 0;

        const secretCopy = [...this.secretCode];
        const guessCopy = [...guess];

        // 计算完全匹配
        for (let i = 0; i < 4; i++) {
            if (guessCopy[i] && guessCopy[i].name === secretCopy[i].name) {
                exact++;
                secretCopy[i] = null;
                guessCopy[i] = null;
            }
        }

        // 计算颜色匹配
        for (let i = 0; i < 4; i++) {
            if (guessCopy[i]) {
                for (let j = 0; j < 4; j++) {
                    if (secretCopy[j] && guessCopy[i].name === secretCopy[j].name) {
                        color++;
                        secretCopy[j] = null;
                        break;
                    }
                }
            }
        }

        return { exact, color };
    }

    checkWin(guess) {
        return guess.every((color, index) => color.name === this.secretCode[index].name);
    }

    displayHints(row, hints) {
        let hintIndex = 0;

        // 显示完全匹配（橙色）
        for (let i = 0; i < hints.exact; i++) {
            row.hintSlots[hintIndex].setFillStyle(0xff4500);
            hintIndex++;
        }

        // 显示颜色匹配（白色）
        for (let i = 0; i < hints.color; i++) {
            row.hintSlots[hintIndex].setFillStyle(0xffffff);
            hintIndex++;
        }
    }

    setupInput() {
        this.input.keyboard.on('keydown', (event) => {
            if (this.gameOver) return;

            switch (event.key) {
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                    const colorIndex = parseInt(event.key) - 1;
                    if (colorIndex < this.colors.length) {
                        this.selectColor(colorIndex);
                    }
                    break;
                case ' ':
                    // 空格键自动放置到下一个空位
                    this.placeColorInNextSlot();
                    break;
                case 'Enter':
                    if (this.isRowComplete(this.currentRowIndex)) {
                        this.submitGuess(this.currentRowIndex);
                    }
                    break;
            }
        });
    }

    placeColorInNextSlot() {
        const currentRow = this.gameRows[this.currentRowIndex];
        const emptySlot = currentRow.guessSlots.findIndex(slot => slot.color === null);

        if (emptySlot !== -1) {
            this.placeColorInSlot(this.currentRowIndex, emptySlot);
        }
    }

    gameWon() {
        this.gameOver = true;
        this.add.text(400, 250, '恭喜！你猜对了！', {
            fontSize: '32px',
            fill: '#00ff00',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            this.resetAllDragStates();
            this.scene.start('MainMenu');
        });
    }

    gameLost() {
        this.gameOver = true;

        // 显示正确答案
        this.showCorrectAnswer();

        // 显示游戏结束提示，但不跳转场景
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;

        // 创建半透明背景
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        overlay.setDepth(2000);

        // 游戏结束文字
        const gameOverText = this.add.text(width / 2, height / 2 - 50, '游戏结束！', {
            fontSize: '48px',
            fill: '#ff0000',
            fontWeight: 'bold',
            fontFamily: 'Microsoft YaHei, Arial, sans-serif'
        }).setOrigin(0.5);
        gameOverText.setDepth(2001);

        const hintText = this.add.text(width / 2, height / 2 + 10, '正确答案已显示在游戏板下方', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Microsoft YaHei, Arial, sans-serif'
        }).setOrigin(0.5);
        hintText.setDepth(2001);

        // 点击任意位置继续的提示
        const continueText = this.add.text(width / 2, height / 2 + 60, '点击任意位置继续游戏', {
            fontSize: '20px',
            fill: '#ffff00',
            fontFamily: 'Microsoft YaHei, Arial, sans-serif'
        }).setOrigin(0.5);
        continueText.setDepth(2001);

        // 添加闪烁效果
        this.tweens.add({
            targets: continueText,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // 点击继续游戏
        overlay.setInteractive();
        overlay.on('pointerdown', () => {
            overlay.destroy();
            gameOverText.destroy();
            hintText.destroy();
            continueText.destroy();
        });
    }
}
