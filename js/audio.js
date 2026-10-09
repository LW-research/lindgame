/* Audio helpers: browser text-to-speech (Web Speech API) + tiny Web Audio sound effects. */

const Speech = {
  supported: 'speechSynthesis' in window,
  enabled: true,
  voice: null,

  init() {
    if (!this.supported) return;
    const choose = () => {
      const voices = speechSynthesis.getVoices().filter((v) => /^en[-_]/i.test(v.lang));
      // Prioritize sweet, clear female voices matching the Teenieping cartoon anime aesthetic
      const preferred = ['Samantha', 'Victoria', 'Tessa', 'Karen', 'Google US English', 'Zira', 'Susan', 'Moira'];
      this.voice =
        preferred.map((n) => voices.find((v) => v.name.includes(n))).find(Boolean) ||
        voices.find((v) => /female/i.test(v.name)) ||
        voices.find((v) => /en[-_]US/i.test(v.lang)) ||
        voices[0] ||
        null;
    };
    choose();
    speechSynthesis.addEventListener('voiceschanged', choose);
  },

  // onBoundary(charIndex) fires as each word is spoken (used for read-along highlighting).
  say(text, { rate = 0.88, pitch = 1.25, onBoundary, onEnd } = {}) {
    if (!this.supported || !this.enabled) { onEnd?.(); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (this.voice) u.voice = this.voice;
    u.lang = this.voice?.lang || 'en-US';
    u.rate = rate;
    u.pitch = pitch;
    if (onBoundary) u.onboundary = (e) => { if (e.name !== 'sentence') onBoundary(e.charIndex); };
    u.onend = u.onerror = () => onEnd?.();
    speechSynthesis.speak(u);
  },

  stop() { if (this.supported) speechSynthesis.cancel(); },
};

const Sound = {
  enabled: true,
  ctx: null,

  get() {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  tone(freq, start, dur, type = 'sine', vol = 0.16) {
    const c = this.get();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    const t = c.currentTime + start;
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  },

  tap() { this.tone(660, 0, 0.08, 'triangle', 0.07); },
  correct() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, i * 0.09, 0.25, 'triangle')); },
  wrong() { this.tone(240, 0, 0.18); this.tone(200, 0.15, 0.25); },
  win() { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => this.tone(f, i * 0.12, 0.3, 'triangle')); },
};
