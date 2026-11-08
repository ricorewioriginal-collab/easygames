/** Show-Klänge ohne Dateien (Web Audio): Erkennungsmelodie, Trommel-Rauschen, Kugel-Plopp, Markieren, Bingo-Fanfare, Applaus, Spannung, leise Studiomusik. */
export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private music: GainNode | null = null;
  private musicOn = false;
  private noiseBuf: AudioBuffer | null = null;
  vol = 0.8;
  musicVol = 0.35;
  private ac(): AudioContext | null {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC({ latencyHint: 'interactive' });
      this.master = this.ctx.createGain();
      this.master.gain.value = this.vol;
      this.master.connect(this.ctx.destination);
      this.music = this.ctx.createGain();
      this.music.gain.value = 0;
      this.music.connect(this.master);
      const b = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate),
        d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = b;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }
  unlock() {
    this.ac();
  }
  setVol(v: number) {
    this.vol = v;
    if (this.master) this.master.gain.value = v;
  }
  private tone(f: number, t: number, d: number, type: OscillatorType = 'triangle', v = 0.2, dest?: AudioNode) {
    const c = this.ctx!,
      o = c.createOscillator(),
      g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g);
    g.connect(dest || this.master!);
    o.start(t);
    o.stop(t + d + 0.05);
  }
  private noise(t: number, d: number, f: number, v: number, q = 1) {
    const c = this.ctx!,
      s = c.createBufferSource(),
      bp = c.createBiquadFilter(),
      g = c.createGain();
    s.buffer = this.noiseBuf;
    bp.type = 'bandpass';
    bp.frequency.value = f;
    bp.Q.value = q;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + d * 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(bp);
    bp.connect(g);
    g.connect(this.master!);
    s.start(t, Math.random() * 0.5);
    s.stop(t + d + 0.05);
  }
  jingle() {
    const c = this.ac();
    if (!c) return;
    const t = c.currentTime + 0.05,
      mel = [523, 659, 784, 1047, 988, 1047, 1319];
    mel.forEach((f, i) => {
      this.tone(f, t + i * 0.13, 0.32, 'square', 0.07);
      this.tone(f / 2, t + i * 0.13, 0.3, 'triangle', 0.1);
    });
    [261, 329, 392].forEach((f) => this.tone(f, t + 0.95, 1.2, 'sawtooth', 0.05));
  }
  whoosh(d = 1.4) {
    const c = this.ac();
    if (!c) return;
    this.noise(c.currentTime, d, 900, 0.18, 0.6);
  }
  pop() {
    const c = this.ac();
    if (!c) return;
    const t = c.currentTime;
    this.tone(620, t, 0.18, 'sine', 0.25);
    this.tone(930, t + 0.05, 0.16, 'sine', 0.15);
  }
  dab() {
    const c = this.ac();
    if (!c) return;
    this.tone(1200, c.currentTime, 0.09, 'triangle', 0.15);
  }
  wrong() {
    const c = this.ac();
    if (!c) return;
    const t = c.currentTime;
    this.tone(200, t, 0.25, 'sawtooth', 0.09);
    this.tone(150, t + 0.15, 0.3, 'sawtooth', 0.09);
  }
  bingo(big = false) {
    const c = this.ac();
    if (!c) return;
    const t = c.currentTime + 0.02;
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, t + i * 0.09, 0.5, 'square', 0.08));
    [1047, 1319, 1568].forEach((f) => this.tone(f, t + 0.45, big ? 1.8 : 1.1, 'sawtooth', 0.05));
    this.applause(big ? 4 : 2.6);
  }
  applause(d = 2.5) {
    const c = this.ac();
    if (!c) return;
    const t = c.currentTime;
    for (let i = 0; i < 26; i++) this.noise(t + Math.random() * d * 0.7, 0.12 + Math.random() * 0.1, 1500 + Math.random() * 2500, 0.05, 3);
    this.noise(t, d, 2200, 0.08, 0.4);
  }
  tick() {
    const c = this.ac();
    if (!c) return;
    this.tone(880, c.currentTime, 0.05, 'square', 0.06);
  }
  near() {
    const c = this.ac();
    if (!c) return;
    const t = c.currentTime;
    [0, 0.42].forEach((d) => {
      this.tone(70, t + d, 0.2, 'sine', 0.35);
      this.tone(60, t + d + 0.16, 0.22, 'sine', 0.28);
    });
  }
  /** Leise Studiomusik (Akkorde + Bass im Viervierteltakt), läuft im Hintergrund der Show */
  setMusic(on: boolean) {
    const c = this.ac();
    if (!c || !this.music) return;
    this.music.gain.setTargetAtTime(on ? this.musicVol * 0.5 : 0, c.currentTime, 0.4);
    if (on && !this.musicOn) {
      this.musicOn = true;
      const chords = [
        [262, 330, 392],
        [220, 262, 330],
        [175, 220, 262],
        [196, 247, 294],
      ];
      let bar = 0;
      const sched = () => {
        if (!this.musicOn || !this.ctx) return;
        const t = this.ctx.currentTime + 0.05,
          ch = chords[bar % 4];
        for (let b = 0; b < 4; b++) {
          this.tone(ch[0] / 2, t + b * 0.5, 0.42, 'triangle', 0.16, this.music!);
          ch.forEach((f) => this.tone(f, t + b * 0.5 + 0.25, 0.2, 'sine', 0.05, this.music!));
        }
        bar++;
        setTimeout(sched, 2000);
      };
      sched();
    }
    if (!on) this.musicOn = false;
  }
}
