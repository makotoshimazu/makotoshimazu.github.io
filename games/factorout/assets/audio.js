export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.isInitialized = false;
        this.beamOscillator = null;
        this.beamGain = null;
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    playBeamStart() {
        if (!this.audioContext) return;
        
        // Create oscillator for continuous beam sound
        this.beamOscillator = this.audioContext.createOscillator();
        this.beamGain = this.audioContext.createGain();
        
        this.beamOscillator.type = 'sawtooth';
        this.beamOscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
        this.beamOscillator.frequency.linearRampToValueAtTime(150, this.audioContext.currentTime + 0.1);
        
        this.beamGain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        
        this.beamOscillator.connect(this.beamGain);
        this.beamGain.connect(this.audioContext.destination);
        
        this.beamOscillator.start();
    }

    playBeamStop() {
        if (!this.audioContext || !this.beamOscillator) return;
        
        this.beamGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        this.beamOscillator.stop(this.audioContext.currentTime + 0.1);
        this.beamOscillator = null;
        this.beamGain = null;
    }

    playHit() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1600, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    playExplosion() {
        if (!this.audioContext) return;
        
        // White noise for explosion
        const bufferSize = this.audioContext.sampleRate * 0.5;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() - 0.5) * 2;
        }
        
        const noise = this.audioContext.createBufferSource();
        const filter = this.audioContext.createBiquadFilter();
        const gainNode = this.audioContext.createGain();
        
        noise.buffer = buffer;
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, this.audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        noise.start();
        
        // Add sub bass
        const sub = this.audioContext.createOscillator();
        const subGain = this.audioContext.createGain();
        
        sub.type = 'sine';
        sub.frequency.setValueAtTime(50, this.audioContext.currentTime);
        sub.frequency.exponentialRampToValueAtTime(20, this.audioContext.currentTime + 0.3);
        
        subGain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        subGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
        
        sub.connect(subGain);
        subGain.connect(this.audioContext.destination);
        
        sub.start();
        sub.stop(this.audioContext.currentTime + 0.4);
    }

    playMiss() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    playGameOver() {
        if (!this.audioContext) return;
        
        // Play descending tones
        const notes = [523, 392, 294, 196];
        
        notes.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            const startTime = this.audioContext.currentTime + index * 0.2;
            
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(freq, startTime);
            
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.4);
        });
    }

    playDeflect() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(150, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }
}