export class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.backgroundGradient = null;
        this.updateCanvasSize();
    }

    updateCanvasSize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = (window.innerHeight || window.screen.availHeight) - 80;
        this.createBackgroundGradient();
    }

    createBackgroundGradient() {
        this.backgroundGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        this.backgroundGradient.addColorStop(0, '#0a0a1e');
        this.backgroundGradient.addColorStop(1, '#1a0a2e');
    }

    clear() {
        this.ctx.fillStyle = this.backgroundGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.canvas.width; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i < this.canvas.height; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }
        
        // Draw weapon selection area background
        this.ctx.fillStyle = 'rgba(0, 255, 136, 0.05)';
        this.ctx.fillRect(0, 0, 120, this.canvas.height);
        
        // Draw vertical line to separate weapon area
        this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(120, 0);
        this.ctx.lineTo(120, this.canvas.height);
        this.ctx.stroke();
    }

    renderPrimeWeapon(weapon) {
        const pos = weapon.getPosition(this.canvas.height, this.canvas.width);
        const pulse = Math.sin(weapon.pulseAnimation) * 0.1 + 1;
        
        this.ctx.save();
        this.ctx.translate(pos.x, pos.y);
        
        if (weapon.selected) {
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 60);
            gradient.addColorStop(0, `rgba(0, 255, 136, ${0.3 * weapon.glowIntensity})`);
            gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 60 * pulse, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.strokeStyle = weapon.selected ? '#00ff88' : 'rgba(0, 255, 136, 0.5)';
        this.ctx.lineWidth = weapon.selected ? 3 : 2;
        this.ctx.fillStyle = weapon.selected ? '#00ff88' : '#00aa66';
        this.ctx.font = weapon.selected ? 'bold 36px Courier New' : '30px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const circleSize = 35 * (weapon.selected ? pulse : 1);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, circleSize, 0, Math.PI * 2);
        this.ctx.stroke();
        
        if (weapon.selected) {
            this.ctx.shadowColor = '#00ff88';
            this.ctx.shadowBlur = 20;
        }
        this.ctx.fillText(weapon.value, 0, 0);
        this.ctx.shadowBlur = 0;
        
        // Add keyboard hint
        this.ctx.font = '12px Courier New';
        this.ctx.fillStyle = 'rgba(0, 255, 136, 0.7)';
        this.ctx.fillText(`[${weapon.index + 1}]`, 0, -circleSize - 15);
        
        this.ctx.restore();
    }

    renderFallingNumber(number) {
        this.ctx.save();
        this.ctx.translate(number.x, number.y);
        this.ctx.rotate(number.rotation);
        this.ctx.scale(number.scale, number.scale);
        this.ctx.globalAlpha = number.opacity;
        
        if (number.missed) {
            // Black/dark gray missed numbers
            this.ctx.strokeStyle = '#1a1a1a';
            this.ctx.fillStyle = '#2a2a2a';
            this.ctx.shadowColor = '#000000';
            this.ctx.shadowBlur = 10;
        } else if (number.isPrime) {
            this.ctx.strokeStyle = '#ffaa00';
            this.ctx.fillStyle = '#ffaa00';
            this.ctx.shadowColor = '#ffaa00';
            this.ctx.shadowBlur = 15;
        } else {
            this.ctx.strokeStyle = '#00aaff';
            this.ctx.fillStyle = '#00aaff';
            this.ctx.shadowColor = '#00aaff';
            this.ctx.shadowBlur = 10;
        }
        
        this.ctx.lineWidth = 2;
        this.ctx.font = 'bold 28px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const rectSize = 50;
        const borderRadius = 10;
        this.ctx.beginPath();
        this.ctx.roundRect(-rectSize/2, -rectSize/2, rectSize, rectSize, borderRadius);
        this.ctx.stroke();
        
        // Add X mark over missed numbers
        if (number.missed) {
            this.ctx.lineWidth = 4;
            this.ctx.strokeStyle = '#880000';
            this.ctx.beginPath();
            this.ctx.moveTo(-rectSize/3, -rectSize/3);
            this.ctx.lineTo(rectSize/3, rectSize/3);
            this.ctx.moveTo(rectSize/3, -rectSize/3);
            this.ctx.lineTo(-rectSize/3, rectSize/3);
            this.ctx.stroke();
            this.ctx.fillStyle = '#2a2a2a';
        }
        
        this.ctx.fillText(number.value, 0, 0);
        
        for (const particle of number.particles) {
            this.renderParticle(particle);
        }
        
        this.ctx.restore();
    }

    renderParticle(particle) {
        this.ctx.save();
        this.ctx.globalAlpha = particle.life;
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x - this.canvas.width/2, particle.y - this.canvas.height/2, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    renderExplosion(explosion) {
        this.ctx.save();
        this.ctx.globalAlpha = explosion.opacity;
        
        const gradient = this.ctx.createRadialGradient(explosion.x, explosion.y, 0, explosion.x, explosion.y, explosion.radius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.4, 'rgba(255, 200, 0, 0.6)');
        gradient.addColorStop(0.7, 'rgba(255, 50, 0, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = `rgba(255, 100, 0, ${explosion.opacity * 0.5})`;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(explosion.x, explosion.y, explosion.shockwaveRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        for (const particle of explosion.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
        
        this.ctx.restore();
    }

    renderSlashEffect(startX, startY, endX, endY, progress) {
        this.ctx.save();
        this.ctx.globalAlpha = 1 - progress;
        
        const gradient = this.ctx.createLinearGradient(startX, startY, endX, endY);
        gradient.addColorStop(0, 'rgba(0, 255, 136, 0)');
        gradient.addColorStop(0.5, 'rgba(0, 255, 136, 1)');
        gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
        
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 5 * (1 - progress);
        this.ctx.lineCap = 'round';
        this.ctx.shadowColor = '#00ff88';
        this.ctx.shadowBlur = 20;
        
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    renderBeam(startX, startY, endX, endY) {
        this.ctx.save();
        
        // Main beam
        const gradient = this.ctx.createLinearGradient(startX, startY, endX, endY);
        gradient.addColorStop(0, 'rgba(0, 255, 136, 0.2)');
        gradient.addColorStop(0.5, 'rgba(0, 255, 136, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 255, 136, 0.2)');
        
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 20;
        this.ctx.lineCap = 'round';
        this.ctx.shadowColor = '#00ff88';
        this.ctx.shadowBlur = 30;
        this.ctx.globalAlpha = 0.8;
        
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        
        // Inner bright beam
        this.ctx.strokeStyle = '#00ff88';
        this.ctx.lineWidth = 3;
        this.ctx.shadowBlur = 10;
        this.ctx.globalAlpha = 1;
        
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        
        // Pulsing effect at the end
        const pulseSize = 10 + Math.sin(Date.now() * 0.01) * 5;
        this.ctx.fillStyle = '#00ff88';
        this.ctx.shadowBlur = 20;
        this.ctx.beginPath();
        this.ctx.arc(endX, endY, pulseSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
}