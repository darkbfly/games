class ShooterGame extends Phaser.Scene {
    constructor() {
        super({ key: 'ShooterGame' });
        this.player = null;
        this.enemies = null;
        this.bullets = null;
        this.enemyBullets = null;
        this.score = 0;
        this.lives = 3;
        this.enemySpawnTimer = 0;
        this.enemySpawnDelay = 2000;
        this.playerSpeed = 300;
        this.bulletSpeed = 400;
        this.enemySpeed = 100;
    }

    preload() {
        // 不需要预加载资源，直接使用图形API
    }

    create() {
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;

        // 创建星空背景
        this.createStarfield();

        // 创建玩家飞船
        this.player = this.physics.add.existing(this.add.rectangle(width / 2, height - 50, 40, 30, 0x00ff00));
        this.player.body.setCollideWorldBounds(true);

        // 创建组
        this.enemies = this.physics.add.group();
        this.bullets = this.physics.add.group();
        this.enemyBullets = this.physics.add.group();

        // 设置键盘输入
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // 设置碰撞
        this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);
        this.physics.add.overlap(this.player, this.enemyBullets, this.hitPlayerBullet, null, this);

        // 初始化生命显示
        this.createUI();

        // 开始生成敌人
        this.enemySpawnTimer = this.time.addEvent({
            delay: this.enemySpawnDelay,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }

    update(time, delta) {
        // 玩家移动
        this.handlePlayerMovement();

        // 射击
        if (this.spaceKey.isDown) {
            this.shoot();
        }

        // 清理超出边界的子弹
        this.cleanupBullets();

        // 敌人AI
        this.updateEnemies();

        // 更新星空背景
        this.updateStarfield();
    }

    createStarfield() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(0, this.sys.game.config.width),
                Phaser.Math.Between(0, this.sys.game.config.height),
                Phaser.Math.Between(1, 3),
                0xffffff,
                Phaser.Math.FloatBetween(0.3, 1)
            );
            star.speed = Phaser.Math.FloatBetween(20, 100);
            this.stars.push(star);
        }
    }

    updateStarfield() {
        this.stars.forEach(star => {
            star.y += star.speed * 0.016; // 假设60fps
            if (star.y > this.sys.game.config.height) {
                star.y = 0;
                star.x = Phaser.Math.Between(0, this.sys.game.config.width);
            }
        });
    }

    handlePlayerMovement() {
        const speed = this.playerSpeed;

        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.player.body.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.player.body.setVelocityX(speed);
        } else {
            this.player.body.setVelocityX(0);
        }

        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            this.player.body.setVelocityY(-speed);
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            this.player.body.setVelocityY(speed);
        } else {
            this.player.body.setVelocityY(0);
        }
    }

    shoot() {
        // 限制射击频率
        if (!this.lastShot || this.time.now - this.lastShot > 200) {
            const bullet = this.physics.add.existing(this.add.rectangle(this.player.x, this.player.y - 20, 4, 10, 0xffff00));
            bullet.body.setVelocityY(-this.bulletSpeed);
            this.bullets.add(bullet);
            this.lastShot = this.time.now;

            // 添加射击效果
            this.tweens.add({
                targets: this.player,
                scaleY: 0.9,
                duration: 100,
                yoyo: true
            });
        }
    }

    spawnEnemy() {
        const x = Phaser.Math.Between(50, this.sys.game.config.width - 50);
        const enemy = this.physics.add.existing(this.add.rectangle(x, -30, 30, 25, 0xff0000));
        enemy.body.setVelocityY(this.enemySpeed);
        enemy.health = 1;
        enemy.lastShot = 0;
        this.enemies.add(enemy);

        // 随机移动模式
        enemy.movePattern = Phaser.Math.Between(0, 2);
        enemy.moveTimer = 0;
    }

    updateEnemies() {
        this.enemies.children.entries.forEach(enemy => {
            // 移动模式
            enemy.moveTimer += 16; // 假设60fps

            switch (enemy.movePattern) {
                case 0: // 直线下降
                    break;
                case 1: // 左右摆动
                    enemy.body.setVelocityX(Math.sin(enemy.moveTimer * 0.01) * 100);
                    break;
                case 2: // 螺旋下降
                    enemy.body.setVelocityX(Math.sin(enemy.moveTimer * 0.02) * 150);
                    break;
            }

            // 敌人射击
            if (this.time.now - enemy.lastShot > 1500 && Phaser.Math.Between(0, 100) < 2) {
                this.enemyShoot(enemy);
                enemy.lastShot = this.time.now;
            }

            // 清理超出边界的敌人
            if (enemy.y > this.sys.game.config.height + 50) {
                enemy.destroy();
            }
        });
    }

    enemyShoot(enemy) {
        const bullet = this.physics.add.existing(this.add.rectangle(enemy.x, enemy.y + 15, 3, 8, 0xff8800));
        bullet.body.setVelocityY(200);
        this.enemyBullets.add(bullet);
    }

    cleanupBullets() {
        // 清理玩家子弹
        this.bullets.children.entries.forEach(bullet => {
            if (bullet.y < -50) {
                bullet.destroy();
            }
        });

        // 清理敌人子弹
        this.enemyBullets.children.entries.forEach(bullet => {
            if (bullet.y > this.sys.game.config.height + 50) {
                bullet.destroy();
            }
        });
    }

    hitEnemy(bullet, enemy) {
        // 创建爆炸效果
        this.createExplosion(enemy.x, enemy.y);

        // 增加分数
        this.score += 100;

        // 销毁子弹和敌人
        bullet.destroy();
        enemy.destroy();

        // 增加难度
        if (this.score % 1000 === 0) {
            this.enemySpawnDelay = Math.max(500, this.enemySpawnDelay - 200);
            this.enemySpawnTimer.delay = this.enemySpawnDelay;
            this.enemySpeed += 20;
        }
    }

    hitPlayer(player, enemy) {
        this.createExplosion(player.x, player.y);
        this.createExplosion(enemy.x, enemy.y);

        enemy.destroy();
        this.loseLife();
    }

    hitPlayerBullet(player, bullet) {
        this.createExplosion(bullet.x, bullet.y);
        bullet.destroy();
        this.loseLife();
    }

    createExplosion(x, y) {
        // 创建爆炸粒子效果
        for (let i = 0; i < 12; i++) {
            const particle = this.add.circle(x, y, Phaser.Math.Between(2, 6), 0xff4400);

            const angle = (i / 12) * Math.PI * 2;
            const speed = Phaser.Math.Between(50, 150);

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0,
                duration: 500,
                onComplete: () => {
                    particle.destroy();
                }
            });
        }

        // 屏幕震动
        this.cameras.main.shake(100, 0.01);
    }

    loseLife() {
        this.lives--;
        this.updateUI();

        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // 短暂无敌时间
            this.player.setTint(0xff0000);
            this.time.delayedCall(1000, () => {
                this.player.setTint(0x00ff00);
            });
        }
    }

    createUI() {
        this.livesText = this.add.text(10, 50, `生命: ${this.lives}`, {
            fontSize: '20px',
            fill: '#ffffff'
        });
    }

    updateUI() {
        this.livesText.setText(`生命: ${this.lives}`);
    }

    gameOver() {
        // 停止敌人生成
        this.enemySpawnTimer.destroy();

        // 清理所有对象
        this.enemies.clear(true, true);
        this.bullets.clear(true, true);
        this.enemyBullets.clear(true, true);

        this.gameManager.gameOver('太空射击游戏结束！');
    }
}
