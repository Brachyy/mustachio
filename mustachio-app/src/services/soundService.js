// Simple Sound Service using Web Audio API
// No external assets needed

class SoundService {
  constructor() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.enabled = true;
  }

  playTone(freq, type, duration, vol = 0.1) {
    if (!this.enabled) return;
    
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    
    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  }

  playClick() {
    this.playTone(800, 'sine', 0.1, 0.05);
  }

  playDraw() {
    // Whoosh sound simulation
    this.playTone(200, 'triangle', 0.2, 0.05);
  }

  playWin() {
    // Arpeggio
    const now = this.audioCtx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'square', 0.2, 0.05), i * 100);
    });
  }

  playLose() {
    // Sad trombone-ish
    [392.00, 369.99, 349.23, 329.63].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sawtooth', 0.4, 0.05), i * 300);
    });
  }

  playTick() {
    this.playTone(1000, 'square', 0.05, 0.02);
  }

  playGo() {
    // High pitch "GO!"
    this.playTone(880, 'sine', 0.4, 0.1);
    setTimeout(() => this.playTone(1760, 'square', 0.2, 0.05), 100);
  }
}

export const soundService = new SoundService();
