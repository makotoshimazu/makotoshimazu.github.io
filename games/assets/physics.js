// Physics engine module

// Apply shockwave force to creatures
export function applyShockwaveForce(creatures, velocities, epicenterX, epicenterY) {
    const shockwaveStrength = 1200;
    const maxDistance = 600;
    
    creatures.forEach((creature, index) => {
        const creatureX = parseFloat(creature.style.left) + 40;
        const creatureY = parseFloat(creature.style.top) + 40;
        
        const dx = creatureX - epicenterX;
        const dy = creatureY - epicenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance && distance > 0) {
            // Calculate force based on distance (closer = stronger)
            const forceMagnitude = shockwaveStrength * (1 - distance / maxDistance);
            const forceX = (dx / distance) * forceMagnitude;
            const forceY = (dy / distance) * forceMagnitude;
            
            // Apply force with dynamic amplification
            velocities[index].vx += forceX / 20;
            velocities[index].vy += forceY / 20;
            
            // Add rotation effect
            creature.style.animation = 'spin 0.5s ease-out';
            setTimeout(() => {
                creature.style.animation = '';
            }, 500);
        }
    });
}

// Update physics simulation
export function updatePhysics(creatures, velocities, gameActive, animationId) {
    if (!gameActive) return null;
    
    const gameArea = document.getElementById('gameArea');
    const maxX = gameArea.clientWidth - 80;
    const maxY = gameArea.clientHeight - 80;
    const repulsionStrength = 3000;
    const damping = 0.92;
    const minDistance = 100;

    for (let i = 0; i < creatures.length; i++) {
        const creature1 = creatures[i];
        const x1 = parseFloat(creature1.style.left);
        const y1 = parseFloat(creature1.style.top);

        // Repulsion between creatures
        for (let j = i + 1; j < creatures.length; j++) {
            const creature2 = creatures[j];
            const x2 = parseFloat(creature2.style.left);
            const y2 = parseFloat(creature2.style.top);

            const dx = x2 - x1;
            const dy = y2 - y1;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance && distance > 0) {
                const force = repulsionStrength / (distance * distance);
                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;

                velocities[i].vx -= fx / 100;
                velocities[i].vy -= fy / 100;
                velocities[j].vx += fx / 100;
                velocities[j].vy += fy / 100;
            }
        }

        // Apply velocity
        velocities[i].vx *= damping;
        velocities[i].vy *= damping;

        let newX = x1 + velocities[i].vx;
        let newY = y1 + velocities[i].vy;

        // Boundary check with bounce effect
        if (newX < 0) {
            newX = 0;
            velocities[i].vx = Math.abs(velocities[i].vx) * 0.7;
        }
        if (newX > maxX) {
            newX = maxX;
            velocities[i].vx = -Math.abs(velocities[i].vx) * 0.7;
        }
        if (newY < 0) {
            newY = 0;
            velocities[i].vy = Math.abs(velocities[i].vy) * 0.7;
        }
        if (newY > maxY) {
            newY = maxY;
            velocities[i].vy = -Math.abs(velocities[i].vy) * 0.7;
        }

        creature1.style.left = newX + 'px';
        creature1.style.top = newY + 'px';
    }

    return requestAnimationFrame(() => updatePhysics(creatures, velocities, gameActive, animationId));
}