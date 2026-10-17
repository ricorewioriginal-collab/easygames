// Ton ohne Audiodateien: kleine Synth-Effekte und eine ruhige, generative Hintergrundmusik (WebAudio, erst nach Nutzergeste).
type Sfx = 'click' | 'coin' | 'event' | 'good' | 'bad' | 'build' | 'buy' | 'delete' | 'notify' | 'chat' | 'levelup';

export class Audio {
  private ctx: AudioContext | null = null;
  private fx: GainNode | null = null;
  private mus: GainNode | null = null;
  private vol = 0.7;
  private music = 0.4;
  private nextBar = 0;
  private bar = 0;
  private enabled = true;
  private mood: 'day' | 'night' | 'build' = 'day';

  constructor() {
    const unlock = (): void => {
      this.init();
      if (this.ctx?.state === 'suspended') void this.ctx.resume();
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.hidden) void this.ctx.suspend();
      else void this.ctx.resume();
    });
  }
  private init(): void {
    if (this.ctx || !this.enabled) return;
    try {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.fx = this.ctx.createGain();
      this.mus = this.ctx.createGain();
      this.fx.connect(this.ctx.destination);
      this.mus.connect(this.ctx.destination);
      this.setVolumes(this.vol, this.music);
    } catch {
      this.enabled = false;
    }
  }
  setVolumes(fx: number, music: number): void {
    this.vol = fx;
    this.music = music;
    if (this.fx) this.fx.gain.value = fx * 0.5;
    if (this.mus) this.mus.gain.value = music * 0.16;
  }
  setMood(m: 'day' | 'night' | 'build'): void {
    this.mood = m;
  }

  private tone(f: number, t0: number, dur: number, type: OscillatorType, gain: number, out: GainNode, slide = 0): void {
    const c = this.ctx!;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f * slide), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(out);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  play(name: Sfx | string): void {
    if (!this.ctx || !this.fx || this.vol <= 0 || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime;
    const o = this.fx;
    switch (name as Sfx) {
      case 'click':
        this.tone(880, t, 0.06, 'triangle', 0.25, o);
        break;
      case 'coin':
        this.tone(988, t, 0.09, 'square', 0.12, o);
        this.tone(1319, t + 0.07, 0.18, 'square', 0.12, o);
        break;
      case 'event':
      case 'notify':
        this.tone(660, t, 0.15, 'sine', 0.3, o);
        this.tone(880, t + 0.12, 0.25, 'sine', 0.3, o);
        break;
      case 'good':
      case 'levelup':
        [523, 659, 784, 1047].forEach((f, i) => this.tone(f, t + i * 0.08, 0.22, 'triangle', 0.25, o));
        break;
      case 'bad':
        this.tone(330, t, 0.25, 'sawtooth', 0.12, o, 0.6);
        break;
      case 'build':
        this.tone(180, t, 0.08, 'square', 0.15, o, 0.5);
        this.tone(120, t + 0.05, 0.1, 'triangle', 0.25, o);
        break;
      case 'buy':
        this.tone(740, t, 0.08, 'triangle', 0.25, o);
        this.tone(988, t + 0.06, 0.14, 'triangle', 0.25, o);
        break;
      case 'delete':
        this.tone(400, t, 0.18, 'triangle', 0.22, o, 0.4);
        break;
      case 'chat':
        for (let i = 0; i < 3; i++) this.tone(500 + Math.random() * 300, t + i * 0.07, 0.06, 'sine', 0.12, o);
        break;
    }
  }

  /** pro Frame aufrufen: plant die nächsten Takte der Musik */
  update(): void {
    if (!this.ctx || !this.mus || this.music <= 0 || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime;
    if (this.nextBar < t) this.nextBar = t + 0.1;
    if (this.nextBar > t + 1.2) return;
    // sanfte Akkordfolge (Dur, warm) – Nacht langsamer und tiefer
    const prog = this.mood === 'night' ? [[220, 277, 330], [196, 247, 294], [175, 220, 262], [196, 247, 294]] : [[262, 330, 392], [220, 277, 330], [175, 220, 262], [196, 247, 294]];
    const chord = prog[this.bar % 4]!;
    const len = this.mood === 'night' ? 3.2 : 2.4;
    for (const f of chord) this.tone(f, this.nextBar, len * 0.95, 'sine', 0.18, this.mus);
    // kleine Melodie
    const notes = [chord[2]! * 2, chord[1]! * 2, chord[0]! * 2, chord[1]! * 2];
    if (this.mood !== 'night' || this.bar % 2 === 0)
      notes.forEach((f, i) => {
        if (Math.random() < 0.7) this.tone(f, this.nextBar + i * (len / 4), len / 4.5, 'triangle', 0.08, this.mus!);
      });
    this.nextBar += len;
    this.bar++;
  }
}
