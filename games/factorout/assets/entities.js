import { lerp, easeOutExpo, randomFloat } from './utils.js';

export class PrimeWeapon {
    constructor(value, index, totalPrimes) {
        this.value = value;
        this.index = index;
        this.totalPrimes = totalPrimes;
        this.selected = false;
        this.pulseAnimation = 0;
        this.glowIntensity = 0;
    }

    update(dt) {
        this.pulseAnimation += dt * 2;
        if (this.selected) {
            this.glowIntensity = lerp(this.glowIntensity, 1, dt * 10);
        } else {
            this.glowIntensity = lerp(this.glowIntensity, 0, dt * 5);
        }
    }

    getPosition(canvasHeight, canvasWidth) {
        const spacing = 80;
        const centerY = (canvasHeight - 80) / 2; // Center in game area (excluding status bar)
        const totalHeight = spacing * (this.totalPrimes - 1);
        const startY = centerY - totalHeight / 2;
        return {
            x: 60,
            y: startY + spacing * this.index
        };
    }
}

export class FallingNumber {
    constructor(value, isPrime, factors, canvasWidth, x = null, y = null, speed = null, speedMultiplier = 1) {
        this.value = value;
        this.isPrime = isPrime;
        this.factors = factors || [];
        this.x = x !== null ? x : randomFloat(canvasWidth * 0.4, canvasWidth * 0.95);
        this.y = y !== null ? y : -50;
        this.baseSpeed = speed !== null ? speed : randomFloat(100, 250);
        this.speedMultiplier = speedMultiplier;
        this.rotation = 0;
        this.rotationSpeed = randomFloat(-2, 2);
        this.sliced = false;
        this.deflected = false;
        this.missed = false;
        this.opacity = 1;
        this.scale = 1;
        this.particles = [];
        this.splitNumbers = [];
    }
    
    get speed() {
        return this.baseSpeed * this.speedMultiplier;
    }

    update(dt, canvasHeight) {
        if (!this.sliced && !this.deflected && !this.missed) {
            this.y += this.speed * dt;
            this.rotation += this.rotationSpeed * dt;
        } else if (this.sliced) {
            this.opacity -= dt * 3;
            this.scale += dt * 2;
            for (const particle of this.particles) {
                particle.update(dt);
            }
            this.particles = this.particles.filter(p => p.life > 0);
        } else if (this.deflected) {
            if (this.deflectVx) {
                this.x += this.deflectVx * dt;
                this.y += this.deflectVy * dt;
                this.deflectVy += 500 * dt;
            } else {
                this.y += this.speed * dt;
            }
            this.rotation += this.rotationSpeed * dt * 3;
            this.opacity -= dt * 0.5;
        } else if (this.missed) {
            // Missed numbers fade out quickly
            this.opacity -= dt * 3;
            this.scale *= 0.95;
            this.y += this.speed * dt * 0.5; // Slow down
            this.rotation += this.rotationSpeed * dt;
        }
        
        return this.y < canvasHeight + 100 && this.opacity > 0;
    }

    slice(weaponPrime) {
        if (this.value % weaponPrime === 0) {
            this.sliced = true;
            this.createSliceParticles();
            
            // Create two split numbers
            const quotient = Math.floor(this.value / weaponPrime);
            if (quotient > 1) {
                this.splitNumbers.push({
                    value: quotient,
                    x: this.x - 30,
                    y: this.y,
                    vx: randomFloat(-150, -50),
                    vy: randomFloat(-100, 100)
                });
            }
            
            this.splitNumbers.push({
                value: weaponPrime,
                x: this.x + 30,
                y: this.y,
                vx: randomFloat(50, 150),
                vy: randomFloat(-100, 100)
            });
            
            return this.value;
        }
        return 0;
    }

    deflect() {
        this.deflected = true;
        this.deflectVx = randomFloat(-200, 200);
        this.deflectVy = randomFloat(-300, -100);
    }

    createSliceParticles() {
        for (let i = 0; i < 20; i++) {
            this.particles.push(new Particle(this.x, this.y));
        }
    }

    checkMistake(weaponPrime) {
        return this.isPrime && weaponPrime !== this.value;
    }
}

export class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = randomFloat(-300, 300);
        this.vy = randomFloat(-300, 300);
        this.life = 1;
        this.size = randomFloat(2, 8);
        this.color = `hsl(${randomFloat(120, 180)}, 100%, 50%)`;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += 500 * dt;
        this.life -= dt * 2;
        this.size *= 0.98;
    }
}

export class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 800;
        this.opacity = 1;
        this.shockwaveRadius = 0;
        this.particles = [];
        this.createParticles();
    }

    createParticles() {
        for (let i = 0; i < 100; i++) {
            const angle = (Math.PI * 2 * i) / 100;
            const speed = randomFloat(200, 800);
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                size: randomFloat(3, 12),
                color: `hsl(${randomFloat(0, 60)}, 100%, 50%)`
            });
        }
    }

    update(dt) {
        this.radius += 1500 * dt * easeOutExpo(1 - this.opacity);
        this.shockwaveRadius += 2000 * dt;
        this.opacity -= dt * 0.8;
        
        for (const particle of this.particles) {
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.life -= dt;
            particle.size *= 0.97;
        }
        
        this.particles = this.particles.filter(p => p.life > 0);
        
        return this.opacity > 0;
    }
}