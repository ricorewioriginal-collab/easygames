// Musik und Klänge, komplett im Browser erzeugt (Web Audio, keine Audiodateien, eigene Kompositionen).
// Orchester-Synth: Streicher-Flächen, Bläser-Melodie, Harfe, Chor, Pauken. Jeder Ort hat ein eigenes Stück.
const N = (m) => 440 * Math.pow(2, (m - 69) / 12);
const SCALES = { maj: [0, 2, 4, 5, 7, 9, 11], min: [0, 2, 3, 5, 7, 8, 10], dor: [0, 2, 3, 5, 7, 9, 10], hmin: [0, 2, 3, 5, 7, 8, 11], lyd: [0, 2, 4, 6, 7, 9, 11] };

// Stücke: Tempo, Grundton, Tonleiter, Akkordfolge (Stufen 0–6, je Takt), Instrumente, Schlagzeug, Melodie-Saat
export const TRACKS = {
  title: { bpm: 76, root: 50, sc: 'min', prog: [0, 5, 2, 6, 0, 3, 4, 4], lead: 'horn', pad: 'str', arp: 'harp', drums: 'epic', choir: true, seed: 11, dens: 0.55 },
  intro: { bpm: 64, root: 48, sc: 'min', prog: [0, 5, 3, 4], lead: 'flute', pad: 'str', arp: 'harp', drums: '', choir: true, seed: 3, dens: 0.4 },
  town: { bpm: 96, root: 55, sc: 'maj', prog: [0, 3, 4, 0, 5, 3, 1, 4], lead: 'flute', pad: 'str', arp: 'harp', drums: 'light', seed: 21, dens: 0.7 },
  world: { bpm: 112, root: 53, sc: 'maj', prog: [0, 4, 5, 3, 0, 4, 3, 4], lead: 'horn', pad: 'str', arp: 'pluck', drums: 'march', seed: 7, dens: 0.75 },
  rap: { bpm: 84, root: 45, sc: 'dor', prog: [0, 0, 6, 6, 5, 5, 4, 4], lead: 'bell', pad: 'pad', arp: 'pluck', drums: 'deep', seed: 31, dens: 0.45 },
  schlager: { bpm: 100, root: 57, sc: 'lyd', prog: [0, 1, 0, 4, 5, 1, 4, 4], lead: 'flute', pad: 'str', arp: 'harp', drums: 'light', seed: 41, dens: 0.6 },
  xmas: { bpm: 72, root: 52, sc: 'min', prog: [0, 5, 3, 4, 0, 5, 6, 4], lead: 'bell', pad: 'pad', arp: 'harp', drums: '', choir: true, seed: 51, dens: 0.45 },
  rock: { bpm: 132, root: 45, sc: 'hmin', prog: [0, 0, 5, 4, 0, 0, 5, 4], lead: 'horn', pad: 'str', arp: 'ostinato', drums: 'drive', seed: 61, dens: 0.6 },
  tower: { bpm: 70, root: 47, sc: 'hmin', prog: [0, 1, 0, 4, 5, 1, 4, 4], lead: 'choirlead', pad: 'pad', arp: 'bell', drums: 'deep', choir: true, seed: 71, dens: 0.4 },
  battle: { bpm: 150, root: 50, sc: 'min', prog: [0, 6, 5, 4, 0, 6, 3, 4], lead: 'horn', pad: 'str', arp: 'ostinato', drums: 'drive', seed: 81, dens: 0.8 },
  boss: { bpm: 140, root: 46, sc: 'hmin', prog: [0, 0, 5, 5, 3, 3, 4, 4], lead: 'horn', pad: 'str', arp: 'ostinato', drums: 'epic', choir: true, seed: 91, dens: 0.75 },
  final: { bpm: 148, root: 47, sc: 'hmin', prog: [0, 1, 5, 4, 0, 1, 3, 4], lead: 'horn', pad: 'str', arp: 'ostinato', drums: 'epic', choir: true, seed: 97, dens: 0.85 },
  ending: { bpm: 80, root: 53, sc: 'maj', prog: [0, 4, 5, 3, 0, 4, 3, 4], lead: 'flute', pad: 'str', arp: 'harp', drums: 'light', choir: true, seed: 101, dens: 0.6 }
};

function rngOf(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// Melodie: zweitaktiges Motiv, in der Form A A' B A'' über 8 Takte, an die Akkorde angepasst
function compose(tr) {
  const r = rngOf(tr.seed);
  const RH = [[0, 4, 6, 8, 12], [0, 3, 4, 8, 10, 12], [0, 6, 8, 14], [0, 2, 4, 8, 12, 14], [0, 8, 12], [0, 4, 8, 10]];
  const motif = (var_) => {
    const out = [];
    for (let b = 0; b < 2; b++) {
      const rh = RH[Math.floor(r() * RH.length)];
      let deg = b === 0 ? [0, 2, 4][Math.floor(r() * 3)] : [1, 2, 3][Math.floor(r() * 3)];
      rh.forEach((st, i) => {
        const len = (rh[i + 1] ?? 16) - st;
        if (r() > tr.dens + 0.3 && i > 0) return;
        out.push({ st: b * 16 + st, deg: deg + var_, len });
        deg += [-1, 1, 1, 2, -2, 0][Math.floor(r() * 6)];
      });
    }
    return out;
  };
  const A = motif(0), B = motif(2);
  const melody = [];
  const add = (m, bar, shift) => m.forEach(n => melody.push({ st: bar * 16 + n.st, deg: n.deg + shift, len: n.len }));
  add(A, 0, 0); add(A, 2, 1); add(B, 4, 0); add(A, 6, -1);
  return melody;
}

export class Sound {
  constructor() {
    this.ctx = null;
    this.on = true;
    this.cur = null;
    this.want = null;
    this.vol = 0.8;
  }
  // Erst nach einer Nutzereingabe darf Ton starten
  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const c = this.ctx = new AC();
    this.master = c.createGain();
    this.master.gain.value = this.on ? this.vol : 0;
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 3;
    this.master.connect(comp).connect(c.destination);
    this.mus = c.createGain(); this.mus.gain.value = 0.55; this.mus.connect(this.master);
    this.sfxG = c.createGain(); this.sfxG.gain.value = 0.7; this.sfxG.connect(this.master);
    // Hall aus erzeugtem Impuls
    const len = c.sampleRate * 2.6, ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    this.rev = c.createConvolver(); this.rev.buffer = ir;
    this.revG = c.createGain(); this.revG.gain.value = 0.32;
    this.rev.connect(this.revG).connect(this.master);
    this.noise = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const nd = this.noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    this.timer = setInterval(() => this.pump(), 25);
    if (this.want) { const w = this.want; this.want = null; this.music(w); }
  }
  setOn(v) {
    this.on = v;
    if (this.master) this.master.gain.setTargetAtTime(v ? this.vol : 0, this.ctx.currentTime, 0.1);
  }

  // ---------------------------------------------------------------- Musik
  music(key) {
    if (this.want === key && (this.cur?.key === key || !this.ctx)) return;
    this.want = key;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    if (this.cur) { const old = this.cur; old.out.gain.setTargetAtTime(0, t, 0.35); old.stop = true; setTimeout(() => old.out.disconnect(), 2500); }
    this.cur = null;
    const tr = TRACKS[key];
    if (!tr) return;
    const out = this.ctx.createGain();
    out.gain.value = 0;
    out.gain.setTargetAtTime(1, t + 0.15, 0.4);
    out.connect(this.mus);
    this.cur = { key, tr, out, step: 0, next: t + 0.2, mel: compose(tr), sec: 60 / tr.bpm / 4 };
  }
  pump() {
    const c = this.cur, ctx = this.ctx;
    if (!c || c.stop || ctx.state !== 'running') return;
    while (c.next < ctx.currentTime + 0.12) {
      this.stepAt(c, c.step, c.next);
      c.step++;
      c.next += c.sec;
    }
  }
  chord(tr, bar) {
    const sc = SCALES[tr.sc], d = tr.prog[bar % tr.prog.length];
    const pc = (k) => { const o = Math.floor(k / 7); return tr.root + sc[((k % 7) + 7) % 7] + 12 * o; };
    return { d, notes: [pc(d), pc(d + 2), pc(d + 4)], pc };
  }
  stepAt(c, step, t) {
    const tr = c.tr, s16 = step % 16, bar = Math.floor(step / 16), len = tr.prog.length;
    const ch = this.chord(tr, bar), sec = c.sec, o = c.out;
    // Fläche: einmal pro Takt
    if (s16 === 0) {
      for (const n of ch.notes) this.voice(tr.pad, N(n), t, sec * 16, 0.07, o);
      this.voice('bass', N(ch.notes[0] - 12), t, sec * 8, 0.22, o);
      if (tr.choir && bar % 2 === 0) this.voice('choir', N(ch.notes[2]), t, sec * 30, 0.05, o);
    }
    if (s16 === 8) this.voice('bass', N(ch.notes[(bar % 2) ? 1 : 0] - 12), t, sec * 7, 0.16, o);
    // Begleitung
    const a = tr.arp;
    if (a === 'harp' && s16 % 2 === 0) { const k = [0, 1, 2, 1, 2, 0, 1, 2][(s16 / 2) % 8]; this.voice('harp', N(ch.notes[k] + 12), t, sec * 3, 0.07, o); }
    if (a === 'pluck' && [0, 3, 6, 8, 11, 14].includes(s16)) this.voice('pluck', N(ch.notes[s16 % 3] + 12), t, sec * 2, 0.07, o);
    if (a === 'bell' && s16 % 4 === 2) this.voice('bell', N(ch.notes[(s16 / 4 | 0) % 3] + 24), t, sec * 6, 0.035, o);
    if (a === 'ostinato') { const k = [0, 0, 1, 0, 2, 0, 1, 0][s16 % 8]; this.voice('ost', N(ch.notes[k]), t, sec * 0.9, 0.06, o); }
    // Melodie: Takt 1–8, danach (je zweite Runde) Pause für Abwechslung
    const round = Math.floor(bar / 8);
    if (round % 3 !== 2) {
      const pos = (bar % 8) * 16 + s16;
      for (const n of c.mel) if (n.st === pos) {
        const base = this.chord(tr, Math.floor(n.st / 16));
        const m = base.pc(n.deg + base.d) + 12;
        this.voice(tr.lead, N(m), t, sec * Math.max(1, n.len) * 0.95, 0.12, o);
        if (round % 3 === 1 && tr.lead !== 'flute') this.voice('flute', N(m + 12), t, sec * Math.max(1, n.len) * 0.9, 0.04, o);
      }
    }
    // Schlagzeug
    const dr = tr.drums;
    if (dr === 'epic') {
      if (s16 === 0 || s16 === 10) this.drum('timp', t, 0.5, N(ch.notes[0] - 24));
      if (s16 === 8) this.drum('snare', t, 0.18);
      if (bar % len === len - 1 && s16 >= 12) this.drum('timp', t, 0.3, N(ch.notes[0] - 24));
    } else if (dr === 'drive') {
      if (s16 % 4 === 0) this.drum('kick', t, 0.5);
      if (s16 === 4 || s16 === 12) this.drum('snare', t, 0.28);
      if (s16 % 2 === 0) this.drum('hat', t, 0.06);
      if (s16 === 0 && bar % 4 === 0) this.drum('crash', t, 0.12);
    } else if (dr === 'march') {
      if (s16 === 0 || s16 === 8) this.drum('kick', t, 0.35);
      if (s16 === 4 || s16 === 12 || s16 === 14) this.drum('snare', t, 0.14);
      if (s16 % 2 === 0) this.drum('hat', t, 0.035);
    } else if (dr === 'light') {
      if (s16 === 0) this.drum('kick', t, 0.22);
      if (s16 % 4 === 2) this.drum('hat', t, 0.04);
      if (s16 === 12) this.drum('snare', t, 0.06);
    } else if (dr === 'deep') {
      if (s16 === 0) this.drum('timp', t, 0.3, N(ch.notes[0] - 24));
      if (s16 === 6 && bar % 2) this.drum('kick', t, 0.2);
    }
  }
  env(g, t, a, d, peak, rel = 0.25) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setValueAtTime(peak, t + Math.max(a, d));
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(a, d) + rel);
  }
  osc(type, f, t, end, dest, det = 0) {
    const o = this.ctx.createOscillator();
    o.type = type; o.frequency.value = f; o.detune.value = det;
    o.connect(dest); o.start(t); o.stop(end + 0.4);
    return o;
  }
  voice(kind, f, t, dur, vel, out) {
    const c = this.ctx, g = c.createGain(), end = t + dur;
    const wet = c.createGain(); wet.gain.value = kind === 'bass' || kind === 'ost' ? 0.1 : 0.5;
    g.connect(out); g.connect(wet); wet.connect(this.rev);
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.connect(g);
    switch (kind) {
      case 'str': case 'pad': {
        lp.frequency.value = kind === 'str' ? 2400 : 1100; lp.Q.value = 0.4;
        for (const dt of [-8, 0, 7]) this.osc('sawtooth', f, t, end + 0.6, lp, dt);
        this.env(g, t, kind === 'str' ? 0.35 : 0.6, dur, vel, 0.7);
        break;
      }
      case 'choir': {
        const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 1.5; bp.connect(g);
        for (const dt of [-12, 0, 11]) this.osc('sawtooth', f, t, end + 1, bp, dt);
        this.env(g, t, 1.2, dur, vel * 1.4, 1.2);
        lp.disconnect();
        break;
      }
      case 'horn': {
        lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(2600, t + 0.08); lp.frequency.exponentialRampToValueAtTime(1300, t + 0.4);
        const v = this.osc('sawtooth', f, t, end, lp);
        this.osc('square', f / 2, t, end, lp).detune.value = 4;
        const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 5.2; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.006, t + 0.4);
        lfo.connect(lg).connect(v.frequency); lfo.start(t); lfo.stop(end + 0.1);
        this.env(g, t, 0.05, dur, vel * 0.8, 0.18);
        break;
      }
      case 'flute': case 'choirlead': {
        lp.frequency.value = kind === 'flute' ? 3200 : 1400;
        const v = this.osc(kind === 'flute' ? 'triangle' : 'sawtooth', f, t, end, lp);
        const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 5.5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.008, t + 0.3);
        lfo.connect(lg).connect(v.frequency); lfo.start(t); lfo.stop(end + 0.1);
        this.env(g, t, 0.06, dur, vel * (kind === 'flute' ? 1.3 : 0.7), 0.2);
        break;
      }
      case 'harp': case 'pluck': {
        lp.frequency.setValueAtTime(kind === 'harp' ? 4000 : 2400, t); lp.frequency.exponentialRampToValueAtTime(600, t + 0.5);
        this.osc(kind === 'harp' ? 'triangle' : 'sawtooth', f, t, t + 1.2, lp);
        g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + (kind === 'harp' ? 1.1 : 0.4));
        break;
      }
      case 'bell': {
        lp.frequency.value = 6000;
        this.osc('sine', f, t, t + 2.5, lp);
        const m = c.createGain(); m.gain.value = 0.35; m.connect(lp);
        this.osc('sine', f * 2.76, t, t + 1.2, m);
        g.gain.setValueAtTime(vel * 2, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
        break;
      }
      case 'ost': {
        lp.frequency.setValueAtTime(1800, t); lp.frequency.exponentialRampToValueAtTime(400, t + 0.12);
        this.osc('sawtooth', f, t, end, lp);
        g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0001, end + 0.05);
        break;
      }
      case 'bass': {
        lp.frequency.value = 420;
        this.osc('sawtooth', f, t, end, lp);
        this.osc('sine', f / 2, t, end, lp);
        this.env(g, t, 0.02, dur, vel, 0.15);
        break;
      }
    }
  }
  drum(kind, t, vel, f) {
    const c = this.ctx, g = c.createGain(), out = this.cur ? this.cur.out : this.sfxG;
    g.connect(out);
    if (kind === 'kick' || kind === 'timp') {
      const o = c.createOscillator(); o.type = 'sine';
      const f0 = kind === 'kick' ? 120 : f * 2, f1 = kind === 'kick' ? 42 : f;
      o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + (kind === 'kick' ? 0.12 : 0.2));
      o.connect(g); o.start(t); o.stop(t + 1.2);
      g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + (kind === 'kick' ? 0.35 : 1.1));
      if (kind === 'timp') { const w = c.createGain(); w.gain.value = 0.4; g.connect(w); w.connect(this.rev); }
      return;
    }
    const n = c.createBufferSource(); n.buffer = this.noise;
    const f2 = c.createBiquadFilter();
    f2.type = kind === 'hat' || kind === 'crash' ? 'highpass' : 'bandpass';
    f2.frequency.value = kind === 'hat' ? 7000 : kind === 'crash' ? 4000 : 1800;
    n.connect(f2).connect(g);
    const dec = kind === 'hat' ? 0.05 : kind === 'crash' ? 1.4 : 0.18;
    g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
    n.start(t); n.stop(t + dec + 0.05);
    if (kind === 'snare') { const w = c.createGain(); w.gain.value = 0.3; g.connect(w); w.connect(this.rev); }
  }

  // ---------------------------------------------------------------- Klänge
  sfx(k) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const c = this.ctx, t = c.currentTime + 0.01, o = this.sfxG;
    const blip = (type, f0, f1, dur, vel) => {
      const g = c.createGain(); g.connect(o);
      const v = c.createOscillator(); v.type = type; v.frequency.setValueAtTime(f0, t); v.frequency.exponentialRampToValueAtTime(f1, t + dur);
      v.connect(g); v.start(t); v.stop(t + dur + 0.05);
      g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    };
    const noise = (fq, dur, vel, type = 'bandpass') => {
      const g = c.createGain(); g.connect(o);
      const n = c.createBufferSource(); n.buffer = this.noise;
      const f = c.createBiquadFilter(); f.type = type; f.frequency.value = fq;
      n.connect(f).connect(g); n.start(t); n.stop(t + dur + 0.05);
      g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    };
    const arp = (notes, step, type = 'triangle', vel = 0.15) => notes.forEach((m, i) => {
      const g = c.createGain(); g.connect(o); const w = c.createGain(); w.gain.value = 0.5; g.connect(w); w.connect(this.rev);
      const v = c.createOscillator(); v.type = type; v.frequency.value = N(m); v.connect(g);
      const tt = t + i * step; v.start(tt); v.stop(tt + 0.6);
      g.gain.setValueAtTime(vel, tt); g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.55);
    });
    switch (k) {
      case 'move': blip('triangle', 880, 990, 0.05, 0.05); break;
      case 'ok': blip('triangle', 990, 1480, 0.08, 0.08); break;
      case 'cancel': blip('triangle', 660, 440, 0.09, 0.07); break;
      case 'hit': noise(1200, 0.12, 0.35); blip('square', 220, 80, 0.1, 0.08); break;
      case 'slash': noise(3000, 0.16, 0.3, 'highpass'); break;
      case 'heavy': noise(600, 0.3, 0.5); blip('sine', 160, 40, 0.3, 0.3); break;
      case 'magic': arp([84, 88, 91, 96], 0.04, 'sine', 0.08); noise(5000, 0.4, 0.06, 'highpass'); break;
      case 'heal': arp([72, 76, 79, 84, 88], 0.06, 'sine', 0.09); break;
      case 'chest': arp([67, 72, 76, 79, 84], 0.07, 'triangle', 0.12); break;
      case 'door': blip('sawtooth', 90, 60, 0.5, 0.12); noise(300, 0.5, 0.15); break;
      case 'step': noise(500, 0.04, 0.03, 'lowpass'); break;
      case 'push': noise(220, 0.25, 0.25, 'lowpass'); blip('sine', 90, 60, 0.2, 0.15); break;
      case 'encounter': arp([62, 65, 69, 74, 77, 81], 0.035, 'sawtooth', 0.06); break;
      case 'victory': arp([67, 67, 67, 72, 79, 76, 79, 84], 0.11, 'square', 0.07); break;
      case 'levelup': arp([72, 76, 79, 84, 79, 84, 88], 0.07, 'triangle', 0.12); break;
      case 'special': arp([60, 67, 72, 79, 84, 91], 0.05, 'sawtooth', 0.07); noise(800, 0.6, 0.2); break;
    }
  }
}
