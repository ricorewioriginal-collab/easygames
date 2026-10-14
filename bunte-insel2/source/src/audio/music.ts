/* Klang: Musik je Welt (Step-Sequencer mit den Themen aus Bunte Insel), Geräusche (erzeugt + CC0-Dateien), Umgebung (Wind, Wellen, Vögel).
   Weiche Übergänge, getrennte Lautstärken für Musik, Effekte und Umgebung. */
export interface MusicTheme {
  name?: string; bpm: number; spb?: number; swing?: number; chords: string[];
  pad?: { type?: OscillatorType; vol?: number };
  arp?: { pat: string; type?: OscillatorType; vol?: number; len?: number };
  bass?: { pat: string; type?: OscillatorType; vol?: number; len?: number };
  lead?: { notes: string; type?: OscillatorType; vol?: number; len?: number; bell?: boolean };
  drums?: { k?: string; kv?: number; s?: string; sv?: number; h?: string; hv?: number };
}
const PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const CHQ: Record<string, number[]> = { '': [0, 4, 7], m: [0, 3, 7], '7': [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], dim: [0, 3, 6] };
const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
const noteM = (t: string) => { const m = /^([A-G])([#b]?)(\d)$/.exec(t); return m ? 12 * (+m[3] + 1) + PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) : 0; };
const chordP = (c: string) => { const m = /^([A-G])([#b]?)(m7|maj7|m|7|dim)?$/.exec(c) || ['', 'C', '', '']; return { pc: (PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12, iv: CHQ[m[3] || ''] }; };
interface Parsed { ch: { pc: number; iv: number[] }[]; lead: number[] }
const parsedCache = new WeakMap<MusicTheme, Parsed>();
const parse = (T: MusicTheme): Parsed => {
  let p = parsedCache.get(T);
  if (!p) { p = { ch: T.chords.map(chordP), lead: T.lead?.notes ? T.lead.notes.split(/\s+/).filter(Boolean).map(x => (x === '.' ? 0 : noteM(x))) : [] }; parsedCache.set(T, p); }
  return p;
};

export class AudioEngine {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicBus!: GainNode;
  private sfxBus!: GainNode;
  private ambBus!: GainNode;
  private zBus!: GainNode;
  private cur: MusicTheme | null = null;
  private want: MusicTheme | null = null;
  private switchAt = 0;
  private step = 0;
  private nextT = 0;
  private noise: AudioBuffer | null = null;
  private samples = new Map<string, AudioBuffer | 'loading' | 'fail'>();
  private amb: { wind: GainNode; waves: GainNode; src: AudioBufferSourceNode[] } | null = null;
  night = false;
  private vols = { music: 0.6, sfx: 0.8, amb: 0.6, muted: false };
  constructor(private base: string) { }
  /** Muss nach einer Nutzer-Geste aufgerufen werden (Browser-Regel). */
  unlock(): void {
    if (this.ctx) { if (this.ctx.state === 'suspended') void this.ctx.resume(); return; }
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
    } catch { return; }
    const c = this.ctx;
    this.master = c.createGain(); this.master.connect(c.destination);
    const comp = c.createDynamicsCompressor(); comp.connect(this.master);
    this.musicBus = c.createGain(); this.musicBus.connect(comp);
    this.sfxBus = c.createGain(); this.sfxBus.connect(comp);
    this.ambBus = c.createGain(); this.ambBus.connect(comp);
    this.zBus = c.createGain(); this.zBus.gain.value = 0; this.zBus.connect(this.musicBus);
    const nb = c.createBuffer(1, c.sampleRate, c.sampleRate), d = nb.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.noise = nb;
    this.applyVolumes();
    this.startAmbient();
  }
  setVolumes(music: number, sfx: number, amb: number, muted: boolean): void { this.vols = { music, sfx, amb, muted }; this.applyVolumes(); }
  private applyVolumes(): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(this.vols.muted ? 0 : 1, t, 0.05);
    this.musicBus.gain.setTargetAtTime(this.vols.music * 0.9, t, 0.05);
    this.sfxBus.gain.setTargetAtTime(this.vols.sfx, t, 0.05);
    this.ambBus.gain.setTargetAtTime(this.vols.amb * 0.5, t, 0.05);
  }
  private tone(f: number, dur: number, type: OscillatorType, vol: number, glide: number, delay: number, dest: AudioNode): void {
    const c = this.ctx!; const t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(Math.max(20, glide), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
  }
  private noiseAt(dur: number, vol: number, hp: number, delay: number, dest: AudioNode): void {
    const c = this.ctx!; const t = c.currentTime + delay;
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noise; f.type = 'highpass'; f.frequency.value = hp;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random() * 0.5, dur + 0.02);
  }
  private playStep(T: MusicTheme, n: number, delay: number, sd: number): void {
    const spb = T.spb || 16, P = parse(T), s = n % spb, bar = Math.floor(n / spb), ch = P.ch[bar % P.ch.length];
    const d = delay + (T.swing && s % 4 === 2 ? T.swing * sd * 2 : 0);
    const cn = (k: number) => 48 + ch.pc + ch.iv[k % ch.iv.length] + 12 * Math.floor(k / ch.iv.length);
    const bus = this.zBus;
    if (s === 0 && T.pad?.vol) for (let k = 0; k < ch.iv.length; k++) this.tone(mtof(cn(k)), sd * spb * 0.98, T.pad.type || 'sine', T.pad.vol, 0, d, bus);
    if (T.bass) { const c = T.bass.pat[s]; if (c && c !== '.') this.tone(mtof(36 + ch.pc + (c === '5' ? 7 : c === 'o' ? 12 : 0)), sd * (T.bass.len || 2), T.bass.type || 'sine', T.bass.vol || 0.08, 0, d, bus); }
    if (T.arp) {
      const c = T.arp.pat[s];
      if (c === '*') for (let k = 0; k < ch.iv.length; k++) this.tone(mtof(cn(k) + 12), sd * (T.arp.len || 1.5), T.arp.type || 'triangle', T.arp.vol || 0.03, 0, d, bus);
      else if (c && c !== '.') this.tone(mtof(cn(+c - 1) + 12), sd * (T.arp.len || 2), T.arp.type || 'triangle', T.arp.vol || 0.03, 0, d, bus);
    }
    if (P.lead.length) { const m = P.lead[n % P.lead.length]; if (m) { const L = T.lead!; this.tone(mtof(m), sd * (L.len || 2), L.type || 'triangle', L.vol || 0.06, 0, d, bus); if (L.bell) this.tone(mtof(m + 12), sd * (L.len || 2) * 0.8, 'sine', (L.vol || 0.06) * 0.3, 0, d, bus); } }
    const D = T.drums;
    if (D) {
      if (D.k && D.k[s] === 'x') this.tone(150, 0.14, 'sine', D.kv || 0.1, 45, d, bus);
      if (D.s && D.s[s] === 'x') this.noiseAt(0.12, D.sv || 0.06, 1500, d, bus);
      if (D.h && D.h[s] === 'x') this.noiseAt(0.045, D.hv || 0.02, 6500, d, bus);
    }
  }
  setTheme(t: MusicTheme | null): void { this.want = t; }
  /** Pro Bild aufrufen: plant Musik im Voraus, blendet bei Themenwechsel über. */
  update(): void {
    const c = this.ctx;
    if (!c || c.state !== 'running') return;
    const now = c.currentTime;
    if (this.want !== this.cur) {
      if (!this.cur) { this.cur = this.want; this.step = 0; this.nextT = now + 0.1; this.zBus.gain.setTargetAtTime(1.4, now, 0.4); }
      else if (!this.switchAt) { this.switchAt = now + 1.1; this.zBus.gain.setTargetAtTime(0, now, 0.3); }
      else if (now >= this.switchAt) { this.cur = this.want; this.switchAt = 0; this.step = 0; this.nextT = now + 0.1; this.zBus.gain.setTargetAtTime(this.cur ? 1.4 : 0, now, 0.4); }
    } else if (this.switchAt) { this.switchAt = 0; this.zBus.gain.setTargetAtTime(this.cur ? 1.4 : 0, now, 0.25); }
    if (!this.cur) return;
    if (this.nextT < now - 1) this.nextT = now + 0.05;
    const sd = 60 / (this.cur.bpm * (this.night ? 0.85 : 1)) / 4;
    while (this.nextT < now + 0.5) { this.playStep(this.cur, this.step, this.nextT - now, sd); this.step++; this.nextT += sd; }
  }
  /* ---------- Umgebung ---------- */
  private startAmbient(): void {
    const c = this.ctx!;
    const loop = (freq: number, q: number, type: BiquadFilterType) => {
      const s = c.createBufferSource(); s.buffer = this.noise; s.loop = true;
      const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = c.createGain(); g.gain.value = 0;
      s.connect(f); f.connect(g); g.connect(this.ambBus); s.start();
      return { s, g, f };
    };
    const wind = loop(500, 0.4, 'lowpass'), waves = loop(380, 0.8, 'bandpass');
    this.amb = { wind: wind.g, waves: waves.g, src: [wind.s, waves.s] };
  }
  /** wave = Nähe zum Meer 0..1, wind = Höhe/Offenheit 0..1, birds = Vogelstimmen-Chance */
  ambient(wave: number, wind: number, birds: number, dt: number): void {
    if (!this.ctx || !this.amb) return;
    const t = this.ctx.currentTime;
    const w = 0.5 + 0.5 * Math.sin(t * 0.35);
    this.amb.waves.gain.setTargetAtTime(wave * (0.06 + 0.06 * w), t, 0.4);
    this.amb.wind.gain.setTargetAtTime(wind * 0.05, t, 0.6);
    if (birds > 0 && !this.night && Math.random() < birds * dt * 0.25) {
      const f = 1800 + Math.random() * 1600, n = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) this.tone(f * (1 + i * 0.08), 0.09, 'sine', 0.02, f * 1.3, i * 0.12, this.ambBus);
    }
    if (this.night && Math.random() < birds * dt * 0.2) this.tone(4200, 0.05, 'triangle', 0.008, 4300, 0, this.ambBus); // Grillen
  }
  /* ---------- Effekte ---------- */
  private loadSample(name: string): void {
    if (this.samples.has(name) || !this.ctx) return;
    this.samples.set(name, 'loading');
    fetch(this.base + 'audio/' + name + '.mp3').then(r => { if (!r.ok) throw new Error(String(r.status)); return r.arrayBuffer(); })
      .then(b => this.ctx!.decodeAudioData(b)).then(buf => this.samples.set(name, buf)).catch(() => this.samples.set(name, 'fail'));
  }
  private sample(name: string, vol: number, rate = 1, pan = 0): boolean {
    const s = this.samples.get(name);
    if (!s) { this.loadSample(name); return false; }
    if (s === 'loading' || s === 'fail') return false;
    const c = this.ctx!, src = c.createBufferSource(), g = c.createGain();
    src.buffer = s; src.playbackRate.value = rate; g.gain.value = vol;
    if (pan && c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = pan; src.connect(g); g.connect(p); p.connect(this.sfxBus); }
    else { src.connect(g); g.connect(this.sfxBus); }
    src.start();
    return true;
  }
  /** Räumlicher Effekt: Lautstärke/Stereo nach Entfernung und Richtung. */
  sfxAt(name: string, dist: number, pan: number, vol = 1): void { if (dist > 40) return; this.sfx(name, vol * Math.max(0, 1 - dist / 40), pan); }
  sfx(name: string, vol = 1, pan = 0): void {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const B = this.sfxBus, T = (f: number, d: number, ty: OscillatorType, v: number, gl = 0, de = 0) => this.tone(f, d, ty, v * vol, gl, de, B);
    switch (name) {
      case 'jump': T(420, 0.14, 'sine', 0.12, 760); break;
      case 'jump2': T(560, 0.16, 'sine', 0.12, 1100); T(1100, 0.1, 'triangle', 0.05, 1500, 0.05); break;
      case 'land': this.noiseAt(0.1, 0.08 * vol, 300, 0, B); break;
      case 'step': this.noiseAt(0.04, 0.03 * vol, 900, 0, B); break;
      case 'splash': this.noiseAt(0.4, 0.15 * vol, 600, 0, B); T(300, 0.2, 'sine', 0.05, 120); break;
      case 'star': [0, 0.07, 0.14].forEach((d, i) => T(880 * [1, 1.25, 1.5][i], 0.16, 'triangle', 0.09, 0, d)); break;
      case 'pickup': T(660, 0.08, 'square', 0.04, 990); T(990, 0.12, 'triangle', 0.06, 0, 0.06); break;
      case 'coin': if (!this.sample('coins', 0.5 * vol)) T(1320, 0.1, 'square', 0.05, 1760); break;
      case 'buy': if (!this.sample('buy', 0.6 * vol)) T(523, 0.1, 'triangle', 0.08); break;
      case 'click': T(900, 0.04, 'square', 0.03); break;
      case 'open': T(392, 0.12, 'triangle', 0.08); T(587, 0.16, 'triangle', 0.08, 0, 0.08); break;
      case 'close': T(587, 0.1, 'triangle', 0.06); T(392, 0.14, 'triangle', 0.06, 0, 0.07); break;
      case 'talk': T(300 + Math.random() * 200, 0.05, 'triangle', 0.035); break;
      case 'success': [523, 659, 784, 1047].forEach((f, i) => T(f, 0.25, 'triangle', 0.09, 0, i * 0.1)); break;
      case 'quest': [392, 523, 659, 784, 1047].forEach((f, i) => T(f, 0.3, 'triangle', 0.1, 0, i * 0.09)); T(1568, 0.6, 'sine', 0.05, 0, 0.45); break;
      case 'levelup': [523, 659, 784, 1047, 1319].forEach((f, i) => T(f, 0.35, 'square', 0.05, 0, i * 0.08)); break;
      case 'fail': T(330, 0.2, 'triangle', 0.08, 220); T(220, 0.3, 'triangle', 0.08, 160, 0.15); break;
      case 'hit': if (!this.sample('hit', 0.5 * vol, 0.9 + Math.random() * 0.2, pan)) this.noiseAt(0.12, 0.12 * vol, 800, 0, B); break;
      case 'swing': this.noiseAt(0.15, 0.06 * vol, 2500, 0, B); break;
      case 'poof': this.noiseAt(0.3, 0.1 * vol, 1200, 0, B); [784, 1047, 1319].forEach((f, i) => T(f, 0.15, 'sine', 0.05, 0, i * 0.05)); break;
      case 'hurt': T(220, 0.2, 'sawtooth', 0.05, 140); break;
      case 'magic': for (let i = 0; i < 6; i++) T(880 + i * 220, 0.18, 'sine', 0.04, 0, i * 0.04); break;
      case 'door': if (!this.sample('enter', 0.5 * vol)) T(200, 0.15, 'square', 0.04); break;
      case 'horn': T(392, 0.35, 'square', 0.05); T(494, 0.35, 'square', 0.04); break;
      case 'engine': T(70, 0.25, 'sawtooth', 0.03, 90); break;
      case 'bark': if (!this.sample('dog', 0.6 * vol, 1, pan)) T(500, 0.08, 'square', 0.06, 300); break;
      case 'chop': this.sample('chop', 0.5 * vol); break;
      case 'bump': this.sample('bump', 0.5 * vol); break;
      case 'cow': case 'sheep': case 'pig': case 'chicken': case 'horse': case 'goat': case 'duck': case 'cat': case 'donkey': this.sample(name, 0.5 * vol, 1, pan); break;
      case 'whoosh': this.noiseAt(0.5, 0.08 * vol, 900, 0, B); break;
      case 'fire': this.noiseAt(0.6, 0.06 * vol, 300, 0, B); break;
      case 'note0': case 'note1': case 'note2': case 'note3': case 'note4': case 'note5': case 'note6': case 'note7': {
        const k = +name.slice(4); T(mtof(60 + [0, 2, 4, 5, 7, 9, 11, 12][k]), 0.5, 'triangle', 0.12); T(mtof(72 + [0, 2, 4, 5, 7, 9, 11, 12][k]), 0.4, 'sine', 0.04); break;
      }
      default: T(600, 0.06, 'triangle', 0.04);
    }
  }
  preload(names: string[]): void { for (const n of names) this.loadSample(n); }
}
