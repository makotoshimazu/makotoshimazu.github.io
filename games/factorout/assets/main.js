import { Game } from './game.js';

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    const game = new Game(canvas, ctx);
    game.start();
    
    // Fullscreen button
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    fullscreenBtn.addEventListener('click', async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                fullscreenBtn.textContent = '📺 全画面を終了';
            } else {
                await document.exitFullscreen();
                fullscreenBtn.textContent = '🎮 全画面で表示';
            }
        } catch (e) {
            console.error('Fullscreen error:', e);
        }
    });
    
    // Update button text on fullscreen change
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            fullscreenBtn.textContent = '📺 全画面を終了';
        } else {
            fullscreenBtn.textContent = '🎮 全画面で表示';
        }
    });
    
    console.log('Factor Out - 素因数分解アクション');
    console.log('操作方法:');
    console.log('- 数字キー1-4: 素数武器を選択');
    console.log('- 矢印キー上下: 素数武器を切り替え');
    console.log('- クリック/タップ: 狙った数を切る');
    console.log('- 長押し: ビーム連射');
    console.log('- スペースキー: 画面上のすべての数を攻撃');
    console.log('- 画面下部の素数をクリックして選択も可能');
});