// Visual effects module

// Create shockwave effect
export function createShockwave(x, y) {
    const waves = ['primary', 'secondary', 'tertiary'];
    
    waves.forEach((waveClass, index) => {
        setTimeout(() => {
            const wave = document.createElement('div');
            wave.className = `shockwave ${waveClass}`;
            wave.style.left = (x - 600) + 'px';
            wave.style.top = (y - 600) + 'px';
            
            document.getElementById('gameArea').appendChild(wave);
            setTimeout(() => wave.remove(), 2500);
        }, index * 100);
    });
}

// Create particle and sparkle effects
export function createEffects(x, y) {
    // Particles
    const colors = ['#FF69B4', '#4169E1', '#FFD700', '#FF1493', '#00BFFF'];
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        const angle = (Math.PI * 2 * i) / 20;
        const distance = 80 + Math.random() * 80;
        particle.style.setProperty('--x', Math.cos(angle) * distance + 'px');
        particle.style.setProperty('--y', Math.sin(angle) * distance + 'px');
        
        document.getElementById('gameArea').appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
    }

    // Sparkles
    const sparkles = ['✨', '⭐', '💫', '🌟'];
    for (let i = 0; i < 5; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
        sparkle.style.left = (x - 20 + Math.random() * 40) + 'px';
        sparkle.style.top = (y - 20 + Math.random() * 40) + 'px';
        
        document.getElementById('gameArea').appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1000);
    }
}