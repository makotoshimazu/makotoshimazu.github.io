// Creature management module
import { initSound, playPiroron, isIOS, isSoundInitialized } from './sound.js';
import { createShockwave, createEffects } from './effects.js';
import { applyShockwaveForce } from './physics.js';

export function getRandomPosition() {
    const gameArea = document.getElementById('gameArea');
    const margin = 100;
    const maxX = gameArea.clientWidth - margin;
    const maxY = gameArea.clientHeight - margin;
    
    return {
        x: margin/2 + Math.random() * (maxX - margin/2),
        y: margin/2 + Math.random() * (maxY - margin/2)
    };
}

export function createCreature(index, state) {
    const creature = document.createElement('div');
    creature.className = 'creature blue';
    creature.id = `creature-${index}`;
    
    // Body
    const body = document.createElement('div');
    body.className = 'body';
    creature.appendChild(body);
    
    // Eyes
    const leftEye = document.createElement('div');
    leftEye.className = 'eye left';
    const leftPupil = document.createElement('div');
    leftPupil.className = 'pupil';
    leftEye.appendChild(leftPupil);
    creature.appendChild(leftEye);
    
    const rightEye = document.createElement('div');
    rightEye.className = 'eye right';
    const rightPupil = document.createElement('div');
    rightPupil.className = 'pupil';
    rightEye.appendChild(rightPupil);
    creature.appendChild(rightEye);
    
    // Tentacles
    for (let i = 1; i <= 3; i++) {
        const tentacle = document.createElement('div');
        tentacle.className = `tentacle tentacle${i}`;
        creature.appendChild(tentacle);
    }
    
    const pos = getRandomPosition();
    creature.style.left = pos.x + 'px';
    creature.style.top = pos.y + 'px';
    
    // Initialize velocity
    state.velocities[index] = { vx: 0, vy: 0 };
    
    creature.addEventListener('click', async function(e) {
        e.stopPropagation();
        
        if (!state.gameActive) return;
        
        if (this.classList.contains('blue')) {
            if (!isSoundInitialized() && !isIOS) {
                await initSound();
            }
            
            this.classList.remove('blue');
            this.classList.add('red');
            state.tapCount++;
            state.updateScore();
            
            playPiroron();
            
            const rect = this.getBoundingClientRect();
            const gameAreaRect = document.getElementById('gameArea').getBoundingClientRect();
            const clickX = rect.left - gameAreaRect.left + 40;
            const clickY = rect.top - gameAreaRect.top + 40;
            
            // Create shockwave
            createShockwave(clickX, clickY);
            
            // Apply physical shockwave
            applyShockwaveForce(state.creatures, state.velocities, clickX, clickY);
            
            // Particle effects
            createEffects(clickX, clickY);
            
            // Get difficulty time
            const difficulty = parseInt(document.getElementById('difficulty').value);
            const creatureIndex = parseInt(this.id.split('-')[1]);
            
            // Clear existing timer
            if (state.creatureTimers[creatureIndex]) {
                clearTimeout(state.creatureTimers[creatureIndex]);
            }
            
            // Set timer for game over if not tapped
            state.creatureTimers[creatureIndex] = setTimeout(() => {
                if (this.classList.contains('red') && state.gameActive) {
                    state.gameOver();
                }
            }, difficulty);
            
            // Timer to return to blue
            setTimeout(() => {
                if (state.gameActive) {
                    this.classList.remove('red');
                    this.classList.add('blue');
                    // Clear timer
                    if (state.creatureTimers[creatureIndex]) {
                        clearTimeout(state.creatureTimers[creatureIndex]);
                        state.creatureTimers[creatureIndex] = null;
                    }
                }
            }, difficulty);
        } else if (this.classList.contains('red')) {
            // When tapped while red, turn back to blue
            const creatureIndex = parseInt(this.id.split('-')[1]);
            
            // Clear timer
            if (state.creatureTimers[creatureIndex]) {
                clearTimeout(state.creatureTimers[creatureIndex]);
                state.creatureTimers[creatureIndex] = null;
            }
            
            this.classList.remove('red');
            this.classList.add('blue');
            state.tapCount++;
            state.updateScore();
            
            playPiroron();
            
            const rect = this.getBoundingClientRect();
            const gameAreaRect = document.getElementById('gameArea').getBoundingClientRect();
            const clickX = rect.left - gameAreaRect.left + 40;
            const clickY = rect.top - gameAreaRect.top + 40;
            
            // Create shockwave
            createShockwave(clickX, clickY);
            
            // Apply physical shockwave
            applyShockwaveForce(state.creatures, state.velocities, clickX, clickY);
            
            // Particle effects
            createEffects(clickX, clickY);
        }
    });
    
    return creature;
}