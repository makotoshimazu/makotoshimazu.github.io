// Main game module
import { initSound, isIOS } from './sound.js';
import { createShockwave, createEffects } from './effects.js';
import { applyShockwaveForce, updatePhysics } from './physics.js';
import { createCreature } from './creature.js';

// Game state
const state = {
    creatures: [],
    tapCount: 0,
    gameActive: true,
    creatureTimers: [],
    velocities: [],
    animationId: null,
    updateScore: function() {
        document.getElementById('score').textContent = `タップ数: ${this.tapCount}`;
    },
    gameOver: function() {
        this.gameActive = false;
        document.getElementById('finalScore').textContent = this.tapCount;
        document.getElementById('gameOver').style.display = 'block';
        
        // Clear timers
        this.creatureTimers.forEach(timer => clearTimeout(timer));
        this.creatureTimers = [];
        
        // Stop animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
};

// Toggle fullscreen
window.toggleFullscreen = function() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`全画面モードエラー: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
};

// Enable sound for iOS
window.enableSound = async function() {
    await initSound();
    document.getElementById('enableSoundBtn').style.display = 'none';
};

// Initialize game
function initGame() {
    const gameArea = document.getElementById('gameArea');
    const creatureCount = parseInt(document.getElementById('ballCount').value);
    
    // Stop animation
    if (state.animationId) {
        cancelAnimationFrame(state.animationId);
    }
    
    // Remove existing creatures
    state.creatures.forEach(creature => {
        if (creature.parentNode) {
            creature.parentNode.removeChild(creature);
        }
    });
    state.creatures = [];
    state.velocities = [];
    
    // Create new creatures
    for (let i = 0; i < creatureCount; i++) {
        const creature = createCreature(i, state);
        gameArea.appendChild(creature);
        state.creatures.push(creature);
    }
    
    // Start physics
    function runPhysics() {
        state.animationId = updatePhysics(state.creatures, state.velocities, state.gameActive, state.animationId);
    }
    runPhysics();
}

// Reset game
window.resetGame = function() {
    state.tapCount = 0;
    state.gameActive = true;
    state.updateScore();
    document.getElementById('gameOver').style.display = 'none';
    
    // Clear timers
    state.creatureTimers.forEach(timer => clearTimeout(timer));
    state.creatureTimers = [];
    
    initGame();
};

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Show iOS sound button if needed
    if (isIOS) {
        document.getElementById('enableSoundBtn').style.display = 'inline-block';
    }
    
    const gameArea = document.getElementById('gameArea');
    
    // Game area click for shockwave
    gameArea.addEventListener('click', function(e) {
        if (!state.gameActive) return;
        
        if (e.target === gameArea || e.target === document.querySelector('.score')) {
            const rect = gameArea.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            // Create shockwave
            createShockwave(clickX, clickY);
            
            // Apply physical shockwave
            applyShockwaveForce(state.creatures, state.velocities, clickX, clickY);
            
            // Effects
            createEffects(clickX, clickY);
        }
    });
    
    // Ball count change
    document.getElementById('ballCount').addEventListener('change', function() {
        initGame();
    });
    
    // Initialize game on load
    initGame();
});

// Prevent touch scrolling
document.addEventListener('touchmove', function(e) {
    e.preventDefault();
}, { passive: false });

// Prevent double tap zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', function(e) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);