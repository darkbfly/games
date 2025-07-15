// 全局变量声明
let gameManager;
let gameSelector;

// 页面加载完成后初始化游戏管理器和选择器
document.addEventListener('DOMContentLoaded', () => {
    gameManager = new GameManager();
    gameManager.init();

    gameSelector = new GameSelector();
    gameSelector.init();

    // 添加控制提示
    console.log('🎮 多游戏合集已加载完成！');
    console.log('📋 控制说明:');
    console.log('  • 方向键/WASD - 选择游戏');
    console.log('  • Enter/空格键 - 开始游戏');
    console.log('  • ESC - 返回主菜单');
    console.log('  • P - 暂停/继续游戏');
    console.log('  • 支持鼠标拖拽和手柄操作');
    console.log('🎯 包含游戏: 贪吃蛇、打砖块、太空射击、猜颜色');
});

// 防止页面刷新时的意外行为
window.addEventListener('beforeunload', (e) => {
    if (gameManager && gameManager.currentGame) {
        e.preventDefault();
        e.returnValue = '确定要离开吗？游戏进度将会丢失。';
    }
});

// 处理窗口大小变化
window.addEventListener('resize', () => {
    if (gameManager && gameManager.currentGame) {
        // 可以在这里添加响应式处理逻辑
        gameManager.currentGame.scale.refresh();
    }
});
