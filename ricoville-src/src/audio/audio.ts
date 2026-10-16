// Alle Klänge entstehen im Browser (Web Audio) – keine fremden Sounddateien, keine Lizenzfragen.
// Startet erst nach der ersten Nutzeraktion (kein ungefragter Autoplay-Ton), verstummt im Hintergrund-Tab.

export type Sfx = 'coin' | 'build' | 'plant' | 'harvest' | 'click' | 'level' | 'error' | 'deliver' | 'quest' | 'road';

export class Audio {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private music!: GainNode;
  private fx!: GainNode;
  private amb!: GainNode;
  private musicTimer = 0;
  private step = 0;
  vol = { music: 0.35, fx: 0.7, amb: 0.3 };
  muted = false;

  constructor() {
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.hidden) void this.ctx.suspend();
      else if (!this.muted) void this.ctx.resume();
    });
  }

  /** Muss aus einer Nutzergeste aufgerufen werden. */
  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended' && !document.hidden) void this.ctx.resume();
      return;
    }
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.connect(this.ctx.destination);
    this.music = this.gain(this.vol.music);
    this.fx = this.gain(this.vol.fx);
    this.amb = this.gain(this.vol.amb);
    this.apply();
    this.startMusic();
    this.startAmbience();
  }
  private gain(v: number): GainNode {
    const g = this.ctx!.createGain();
    g.gain.value = v;
    g.connect(this.master);
    return g;
  }
  apply(): void {
    if (!this.ctx) return;
    this.master.gain.value = this.muted ? 0 : 1;
    this.music.gain.value = this.vol.music * 0.5;
    this.fx.gain.value = this.vol.fx;
    this.amb.gain.value = this.vol.amb * 0.6;
  }

  private tone(freq: number, t: number, dur: number, type: OscillatorType, vol: number, out: GainNode, slide = 0): void {
    const c = this.ctx!;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + dur + 0.02);
  }
  private noise(t: number, dur: number, vol: number, out: GainNode, hp = 800): void {
    const c = this.ctx!;
    const b = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = c.createBufferSource();
    s.buffer = b;
    const f = c.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = hp;
    const g = c.createGain();
    g.gain.value = vol;
    s.connect(f).connect(g).connect(out);
    s.start(t);
  }

  play(s: Sfx): void {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const o = this.fx;
    switch (s) {
      case 'coin':
        this.tone(988, t, 0.09, 'square', 0.12, o);
        this.tone(1319, t + 0.07, 0.25, 'square', 0.1, o);
        break;
      case 'build':
        for (let i = 0; i < 3; i++) this.noise(t + i * 0.12, 0.06, 0.25, o, 1200);
        this.tone(220, t, 0.2, 'triangle', 0.15, o);
        break;
      case 'plant':
        this.tone(520, t, 0.12, 'sine', 0.2, o, 1.6);
        break;
      case 'harvest':
        this.noise(t, 0.12, 0.2, o, 2500);
        this.tone(660, t + 0.05, 0.15, 'triangle', 0.18, o, 1.3);
        break;
      case 'click':
        this.tone(700, t, 0.04, 'sine', 0.12, o);
        break;
      case 'road':
        this.noise(t, 0.05, 0.15, o, 400);
        break;
      case 'deliver':
        this.tone(392, t, 0.12, 'triangle', 0.18, o);
        this.tone(523, t + 0.1, 0.18, 'triangle', 0.18, o);
        break;
      case 'quest':
        [523, 659, 784].forEach((f, i) => this.tone(f, t + i * 0.09, 0.3, 'triangle', 0.16, o));
        break;
      case 'level':
        [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tone(f, t + i * 0.1, 0.35, 'square', 0.09, o));
        break;
      case 'error':
        this.tone(200, t, 0.18, 'sawtooth', 0.08, o, 0.7);
        break;
    }
  }

  /** Ruhige, generative Pentatonik-Melodie mit weichem Akkordteppich. */
  private startMusic(): void {
    const scale = [0, 2, 4, 7, 9, 12, 14, 16];
    const chords = [
      [0, 4, 7],
      [-3, 0, 4],
      [-7, -3, 0],
      [-5, -1, 2],
    ];
    const base = 262;
    const f = (n: number) => base * Math.pow(2, n / 12);
    const tick = () => {
      if (!this.ctx || document.hidden) return;
      const t = this.ctx.currentTime + 0.05;
      const bar = Math.floor(this.step / 8) % chords.length;
      if (this.step % 8 === 0) for (const n of chords[bar]!) this.tone(f(n - 12), t, 3.2, 'sine', 0.05, this.music);
      if (Math.random() < 0.62) this.tone(f(scale[Math.floor(Math.random() * scale.length)]!), t, 0.6, 'triangle', 0.05, this.music);
      if (this.step % 4 === 2) this.tone(f(chords[bar]![0]! - 24), t, 0.35, 'sine', 0.06, this.music);
      this.step++;
    };
    this.musicTimer = window.setInterval(tick, 420);
  }
  private startAmbience(): void {
    // Vogelzwitschern und leises Stadtrauschen in unregelmäßigen Abständen.
    const chirp = () => {
      if (this.ctx && !document.hidden && !this.muted) {
        const t = this.ctx.currentTime;
        const n = 2 + Math.floor(Math.random() * 3);
        const fr = 2200 + Math.random() * 1500;
        for (let i = 0; i < n; i++) this.tone(fr, t + i * 0.09, 0.07, 'sine', 0.05, this.amb, 1.25);
        if (Math.random() < 0.3) this.noise(t, 0.8, 0.02, this.amb, 300);
      }
      window.setTimeout(chirp, 3000 + Math.random() * 6000);
    };
    window.setTimeout(chirp, 2000);
  }
  stop(): void {
    clearInterval(this.musicTimer);
  }
}
