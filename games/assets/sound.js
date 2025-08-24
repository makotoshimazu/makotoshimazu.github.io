// Sound management module
let synth;
let reverb;
let delay;
let soundInitialized = false;

export const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

// Initialize sound system
export async function initSound() {
    if (soundInitialized) return;
    
    await Tone.start();
    
    reverb = new Tone.Reverb({
        decay: 2.5,
        wet: 0.4
    }).toDestination();
    
    delay = new Tone.FeedbackDelay({
        delayTime: "16n",
        feedback: 0.4,
        wet: 0.3
    }).connect(reverb);
    
    synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
            type: "sine"
        },
        envelope: {
            attack: 0.005,
            decay: 0.3,
            sustain: 0.1,
            release: 2
        },
        volume: -8
    }).connect(delay);
    
    soundInitialized = true;
}

// Play piroron sound effect
export function playPiroron() {
    if (!document.getElementById('soundEnabled').checked) return;
    if (!soundInitialized) return;
    
    const notes = [
        ["E5", "16n"],
        ["G5", "16n", "+16n"],
        ["B5", "16n", "+8n"],
        ["E6", "8n", "+8n+16n"],
        ["G6", "8n", "+4n"]
    ];
    
    const now = Tone.now();
    let time = 0;
    
    notes.forEach((note, index) => {
        synth.triggerAttackRelease(note[0], note[1], now + time);
        time += 0.03;
    });
    
    setTimeout(() => {
        synth.triggerAttackRelease(["B6", "E7"], "32n", Tone.now());
    }, 100);
}

export function isSoundInitialized() {
    return soundInitialized;
}