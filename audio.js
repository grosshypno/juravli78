// =============================================================================
// АУДИОДВИЖОК: СИНТЕЗАТОР И MP3
// =============================================================================
window.AudioEngine = {
  ctx: null,
  bgm: null,
  musicStarted: false,
  isMuted: false,

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.bgm) {
      this.bgm = document.getElementById('bgm');
    }
    if (this.bgm && !this.musicStarted && !this.isMuted) {
      this.bgm.volume = 0.35;
      this.bgm.play().then(() => { this.musicStarted = true; }).catch(() => {});
    }
  },

  playCustom(id) {
    this.init();
    const snd = document.getElementById(id);
    if (snd) {
      snd.currentTime = 0;
      snd.play().catch(() => {});
    }
  },

  toggleMusic() {
    this.isMuted = !this.isMuted;
    const btn = document.getElementById('music-btn');
    if (!this.bgm) this.bgm = document.getElementById('bgm');
    if (this.isMuted) {
      if (this.bgm) this.bgm.pause();
      if (btn) btn.innerText = '🔇';
    } else {
      if (this.bgm) this.bgm.play();
      if (btn) btn.innerText = '🎵';
    }
  },

  playTone(freq, type, duration, vol = 0.2) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch(e) {}
  },

  sfx: {
    shoot() {
      AudioEngine.init();
      if (!AudioEngine.ctx) return;
      const osc = AudioEngine.ctx.createOscillator();
      const gain = AudioEngine.ctx.createGain();
      osc.frequency.setValueAtTime(450, AudioEngine.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, AudioEngine.ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.3, AudioEngine.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, AudioEngine.ctx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(AudioEngine.ctx.destination);
      osc.start();
      osc.stop(AudioEngine.ctx.currentTime + 0.16);
    },
    hit() {
      AudioEngine.playTone(180, 'triangle', 0.1, 0.4);
      setTimeout(() => AudioEngine.playTone(90, 'sawtooth', 0.12, 0.3), 20);
    },
    breakTooth() {
      AudioEngine.playTone(600, 'square', 0.08, 0.25);
      setTimeout(() => AudioEngine.playTone(950, 'triangle', 0.18, 0.3), 50);
      setTimeout(() => AudioEngine.playTone(1200, 'sine', 0.25, 0.25), 100);
    },
    eat() {
      AudioEngine.playTone(320, 'sine', 0.08, 0.3);
      setTimeout(() => AudioEngine.playTone(240, 'triangle', 0.09, 0.3), 90);
      setTimeout(() => AudioEngine.playTone(360, 'sine', 0.1, 0.3), 180);
    },
    enrage() {
      for (let i = 0; i < 4; i++) {
        setTimeout(() => AudioEngine.playTone(400 + i * 150, 'sawtooth', 0.1, 0.2), i * 60);
      }
    },
    regrow() {
      [261, 329, 392, 523].forEach((f, i) => {
        setTimeout(() => AudioEngine.playTone(f, 'sine', 0.2, 0.25), i * 70);
      });
    }
  }
};