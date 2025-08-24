import { PrimeWeapon, FallingNumber, Explosion } from './entities.js';
import { generatePrimes, generateComposite, isPrime, randomFloat } from './utils.js';
import { Renderer } from './renderer.js';
import { AudioManager } from './audio.js';

export class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.renderer = new Renderer(canvas, ctx);
        this.audio = new AudioManager();
        
        this.primes = [2, 3, 5, 7]; // Only 4 prime weapons
        this.weapons = this.primes.map((p, i) => new PrimeWeapon(p, i, this.primes.length));
        this.selectedWeaponIndex = 0;
        this.weapons[0].selected = true;
        
        this.fallingNumbers = [];
        this.explosions = [];
        this.slashEffects = [];
        
        this.score = 0;
        this.combo = 1;
        this.comboTimer = 0;
        this.spawnTimer = 0;
        this.spawnInterval = 2;
        this.difficulty = 1;
        
        this.missCount = 0;
        this.maxMisses = 10;
        
        this.lastTime = 0;
        this.isGameOver = false;
        
        // Multi-touch beam support
        this.activeBeams = new Map(); // touchId -> beam info
        this.beamTimer = 0;
        this.beamInterval = 0.1;
        
        // Slide gesture tracking
        this.slidingTouchId = null;
        this.isSliding = false;
        
        // Speed increase over time
        this.speedMultiplier = 1;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Mouse events for beam
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Touch events for beam
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        
        window.addEventListener('resize', () => this.handleResize());
        
        // Clear all beams when window loses focus
        window.addEventListener('blur', () => this.handleBlur());
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handleBlur();
            }
        });
        
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        document.addEventListener('gesturestart', (e) => e.preventDefault());
        document.addEventListener('gesturechange', (e) => e.preventDefault());
        
        // Initialize audio on first interaction
        const initAudio = async () => {
            await this.audio.init();
            document.removeEventListener('click', initAudio);
            document.removeEventListener('touchstart', initAudio);
        };
        document.addEventListener('click', initAudio);
        document.addEventListener('touchstart', initAudio);
    }

    handleKeyDown(e) {
        if (this.isGameOver) return;
        
        const keyNum = parseInt(e.key);
        if (keyNum >= 1 && keyNum <= this.weapons.length) {
            this.selectWeapon(keyNum - 1);
        } else if (e.key === 'ArrowUp') {
            this.selectWeapon((this.selectedWeaponIndex - 1 + this.weapons.length) % this.weapons.length);
        } else if (e.key === 'ArrowDown') {
            this.selectWeapon((this.selectedWeaponIndex + 1) % this.weapons.length);
        } else if (e.key === ' ') {
            this.attackAll();
        }
    }

    handleMouseDown(e) {
        if (this.isGameOver) {
            this.reset();
            return;
        }
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if clicking on weapon area (left side)
        if (x < 120) {
            this.isSliding = true;
            // Find closest weapon
            let closestIndex = 0;
            let closestDistance = Infinity;
            for (let i = 0; i < this.weapons.length; i++) {
                const pos = this.weapons[i].getPosition(this.canvas.height, this.canvas.width);
                const distance = Math.abs(y - pos.y);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = i;
                }
            }
            this.selectWeapon(closestIndex);
        } else {
            this.isBeaming = true;
            this.beamTarget = { x, y };
            this.beamTimer = 0;
            this.audio.playBeamStart();
            this.attackAt(x, y);
        }
    }
    
    handleMouseUp(e) {
        if (this.isBeaming) {
            this.audio.playBeamStop();
        }
        this.isBeaming = false;
        this.beamTarget = null;
        this.isSliding = false;
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.isSliding && x < 120) {
            // Find closest weapon while sliding
            let closestIndex = 0;
            let closestDistance = Infinity;
            for (let i = 0; i < this.weapons.length; i++) {
                const pos = this.weapons[i].getPosition(this.canvas.height, this.canvas.width);
                const distance = Math.abs(y - pos.y);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = i;
                }
            }
            if (closestIndex !== this.selectedWeaponIndex) {
                this.selectWeapon(closestIndex);
            }
        } else if (this.isBeaming) {
            this.beamTarget = { x, y };
        }
    }

    handleTouchStart(e) {
        e.preventDefault();
        
        if (this.isGameOver && e.touches.length === 1) {
            this.reset();
            return;
        }
        
        const rect = this.canvas.getBoundingClientRect();
        
        // Process all new touches
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            // Check if touching weapon area (left side)
            if (x < 120 && !this.isSliding) {
                this.slidingTouchId = touch.identifier;
                this.isSliding = true;
                // Find closest weapon
                let closestIndex = 0;
                let closestDistance = Infinity;
                for (let j = 0; j < this.weapons.length; j++) {
                    const pos = this.weapons[j].getPosition(this.canvas.height, this.canvas.width);
                    const distance = Math.abs(y - pos.y);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestIndex = j;
                    }
                }
                this.selectWeapon(closestIndex);
            } else if (x >= 120) {
                // Add new beam for this touch
                this.activeBeams.set(touch.identifier, { x, y });
                if (this.activeBeams.size === 1) {
                    this.audio.playBeamStart();
                }
                this.attackAt(x, y);
            }
        }
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        
        // Process all ended touches
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            
            // Remove beam for this touch
            if (this.activeBeams.has(touch.identifier)) {
                this.activeBeams.delete(touch.identifier);
                if (this.activeBeams.size === 0) {
                    this.audio.playBeamStop();
                }
            }
            
            // Check if sliding touch ended
            if (touch.identifier === this.slidingTouchId) {
                this.isSliding = false;
                this.slidingTouchId = null;
            }
        }
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        
        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            // Handle sliding for weapon selection
            if (touch.identifier === this.slidingTouchId && x < 120) {
                // Find closest weapon while sliding
                let closestIndex = 0;
                let closestDistance = Infinity;
                for (let j = 0; j < this.weapons.length; j++) {
                    const pos = this.weapons[j].getPosition(this.canvas.height, this.canvas.width);
                    const distance = Math.abs(y - pos.y);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestIndex = j;
                    }
                }
                if (closestIndex !== this.selectedWeaponIndex) {
                    this.selectWeapon(closestIndex);
                }
            }
            
            // Update beam position for this touch
            if (this.activeBeams.has(touch.identifier)) {
                this.activeBeams.set(touch.identifier, { x, y });
            }
        }
    }

    handleResize() {
        this.renderer.updateCanvasSize();
    }
    
    handleBlur() {
        // Clear all active beams when window loses focus
        if (this.activeBeams.size > 0) {
            this.activeBeams.clear();
            this.audio.playBeamStop();
        }
        // Reset sliding state
        this.isSliding = false;
        this.slidingTouchId = null;
        // For mouse compatibility
        this.isBeaming = false;
        this.beamTarget = null;
    }

    selectWeapon(index) {
        this.weapons[this.selectedWeaponIndex].selected = false;
        this.selectedWeaponIndex = index;
        this.weapons[index].selected = true;
    }

    attackAt(x, y) {
        const weaponPrime = this.weapons[this.selectedWeaponIndex].value;
        const weaponPos = this.weapons[this.selectedWeaponIndex].getPosition(this.canvas.height, this.canvas.width);
        
        for (let i = this.fallingNumbers.length - 1; i >= 0; i--) {
            const number = this.fallingNumbers[i];
            if (!number.sliced && !number.deflected && !number.missed &&
                Math.abs(number.x - x) < 80 && Math.abs(number.y - y) < 80) {
                
                if (number.checkMistake(weaponPrime)) {
                    // Mark as missed and it will be grayed out
                    number.missed = true;
                    this.audio.playDeflect();
                    this.combo = 1;
                    this.updateUI();
                    return;
                }
                
                const points = number.slice(weaponPrime);
                if (points > 0) {
                    this.score += points * this.combo;
                    this.combo++;
                    this.comboTimer = 2;
                    this.audio.playHit();
                    this.addSlashEffect(weaponPos.x, weaponPos.y, number.x, number.y);
                    
                    // Add split numbers back to the game
                    for (const split of number.splitNumbers) {
                        const newNumber = new FallingNumber(
                            split.value,
                            isPrime(split.value),
                            [],
                            this.canvas.width,
                            split.x,
                            split.y,
                            null,
                            this.speedMultiplier
                        );
                        newNumber.deflectVx = split.vx;
                        newNumber.deflectVy = split.vy;
                        this.fallingNumbers.push(newNumber);
                    }
                } else {
                    number.deflect();
                    this.audio.playDeflect();
                    this.combo = 1;
                }
                
                this.updateUI();
                break;
            }
        }
    }

    attackAll() {
        const weaponPrime = this.weapons[this.selectedWeaponIndex].value;
        const weaponPos = this.weapons[this.selectedWeaponIndex].getPosition(this.canvas.height, this.canvas.width);
        let hitAny = false;
        
        for (const number of this.fallingNumbers) {
            if (!number.sliced && !number.deflected && !number.missed) {
                if (number.checkMistake(weaponPrime)) {
                    // Mark as missed and it will be grayed out
                    number.missed = true;
                    this.audio.playDeflect();
                    this.combo = 1;
                    this.updateUI();
                    return;
                }
                
                const points = number.slice(weaponPrime);
                if (points > 0) {
                    this.score += points * this.combo;
                    this.combo++;
                    this.comboTimer = 2;
                    this.audio.playHit();
                    this.addSlashEffect(weaponPos.x, weaponPos.y, number.x, number.y);
                    hitAny = true;
                } else {
                    number.deflect();
                }
            }
        }
        
        if (!hitAny) {
            this.combo = 1;
        }
        this.updateUI();
    }

    addSlashEffect(startX, startY, endX, endY) {
        this.slashEffects.push({
            startX, startY, endX, endY,
            progress: 0,
            speed: 3
        });
    }

    triggerExplosion(x, y) {
        this.explosions.push(new Explosion(x, y));
    }

    clearScreen() {
        for (const number of this.fallingNumbers) {
            if (!number.sliced && !number.deflected && !number.missed) {
                number.sliced = true;
                number.createSliceParticles();
            }
        }
    }

    spawnNumber() {
        const isSpecialPrime = Math.random() < 0.05 + this.difficulty * 0.01;
        
        if (isSpecialPrime) {
            const specialPrimes = generatePrimes(50).filter(p => !this.primes.includes(p));
            if (specialPrimes.length > 0) {
                const prime = specialPrimes[Math.floor(Math.random() * specialPrimes.length)];
                this.fallingNumbers.push(new FallingNumber(
                    prime, true, [], this.canvas.width, 
                    null, null, null, this.speedMultiplier
                ));
            }
        } else {
            const minValue = 4;
            const maxValue = Math.min(30 + Math.floor(this.difficulty * 10), 100);
            const composite = generateComposite(minValue, maxValue, this.primes);
            this.fallingNumbers.push(new FallingNumber(
                composite.value, false, composite.factors, this.canvas.width,
                null, null, null, this.speedMultiplier
            ));
        }
    }

    update(currentTime) {
        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;
        
        if (this.isGameOver) return;
        
        for (const weapon of this.weapons) {
            weapon.update(dt);
        }
        
        this.spawnTimer += dt;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnNumber();
            this.spawnTimer = 0;
            this.spawnInterval = Math.max(0.5, 2 - this.difficulty * 0.1);
        }
        
        this.fallingNumbers = this.fallingNumbers.filter(number => 
            number.update(dt, this.canvas.height)
        );
        
        for (const number of this.fallingNumbers) {
            if (!number.sliced && !number.deflected && !number.missed && number.y > this.canvas.height - 50) {
                // Only count miss for composite numbers (blue blocks)
                if (!number.isPrime) {
                    this.missCount++;
                    this.audio.playMiss();
                    number.missed = true; // Mark as missed instead of deflected
                    this.updateUI(); // Update UI when miss occurs
                    if (this.missCount >= this.maxMisses) {
                        this.isGameOver = true;
                        this.audio.playGameOver();
                        this.triggerExplosion(this.canvas.width / 2, this.canvas.height / 2);
                        break;
                    }
                } else {
                    // Prime numbers just get deflected
                    number.deflected = true;
                }
            }
        }
        
        this.explosions = this.explosions.filter(explosion => 
            explosion.update(dt)
        );
        
        this.slashEffects = this.slashEffects.filter(slash => {
            slash.progress += slash.speed * dt;
            return slash.progress < 1;
        });
        
        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) {
                this.combo = 1;
                this.updateUI();
            }
        }
        
        this.difficulty += dt * 0.01;
        
        // Increase speed over time
        this.speedMultiplier = 1 + (this.difficulty * 0.3); // 30% speed increase per difficulty level
        
        // Handle continuous beams for all active touches
        if (this.activeBeams.size > 0) {
            this.beamTimer += dt;
            if (this.beamTimer >= this.beamInterval) {
                for (const [touchId, beamInfo] of this.activeBeams) {
                    this.attackAt(beamInfo.x, beamInfo.y);
                }
                this.beamTimer = 0;
            }
        }
    }

    render() {
        this.renderer.clear();
        
        for (const weapon of this.weapons) {
            this.renderer.renderPrimeWeapon(weapon);
        }
        
        for (const number of this.fallingNumbers) {
            this.renderer.renderFallingNumber(number);
        }
        
        for (const slash of this.slashEffects) {
            this.renderer.renderSlashEffect(
                slash.startX, slash.startY,
                slash.endX, slash.endY,
                slash.progress
            );
        }
        
        for (const explosion of this.explosions) {
            this.renderer.renderExplosion(explosion);
        }
        
        // Render all active beams
        if (this.activeBeams.size > 0) {
            const weaponPos = this.weapons[this.selectedWeaponIndex].getPosition(this.canvas.height, this.canvas.width);
            for (const [touchId, beamInfo] of this.activeBeams) {
                this.renderer.renderBeam(weaponPos.x, weaponPos.y, beamInfo.x, beamInfo.y);
            }
        }
        
        if (this.isGameOver) {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#ff0066';
            this.ctx.font = 'bold 60px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.shadowColor = '#ff0066';
            this.ctx.shadowBlur = 20;
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
            
            this.ctx.fillStyle = '#00ff88';
            this.ctx.font = '30px Courier New';
            this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '20px Courier New';
            this.ctx.fillText('Click to restart', this.canvas.width / 2, this.canvas.height / 2 + 80);
            
            this.ctx.restore();
        }
    }

    updateUI() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('combo').textContent = `Combo: x${this.combo}`;
        document.getElementById('misses').textContent = `Misses: ${this.missCount}/${this.maxMisses}`;
        // Show speed indicator when it increases
        if (this.speedMultiplier > 1.5) {
            document.getElementById('combo').textContent += ` 🚀×${this.speedMultiplier.toFixed(1)}`;
        }
    }

    reset() {
        this.fallingNumbers = [];
        this.explosions = [];
        this.slashEffects = [];
        this.score = 0;
        this.combo = 1;
        this.comboTimer = 0;
        this.spawnTimer = 0;
        this.difficulty = 1;
        this.missCount = 0;
        this.isGameOver = false;
        this.activeBeams.clear();
        this.beamTimer = 0;
        this.speedMultiplier = 1;
        this.updateUI();
    }

    start() {
        this.updateUI();
        const gameLoop = (currentTime) => {
            this.update(currentTime);
            this.render();
            requestAnimationFrame(gameLoop);
        };
        requestAnimationFrame(gameLoop);
    }
}