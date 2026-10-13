// Procedural audio engine (WebAudio). All music is composed at runtime from
// seeded motifs over hand-picked chord progressions; sound effects and
// ambience are synthesised. No audio files, no licensed material.
import { createRng } from './rng.js';

const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], mixolydian: [0, 2, 4, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11], harmonic: [0, 2, 3, 5, 7, 8, 11], pentMinor: [0, 3, 5, 7, 10, 12, 15], pentMajor: [0, 2, 4, 7, 9, 12, 14]
};
// Track definitions: root (MIDI), scale, bpm, progression (scale degrees), instruments, drum style.
export const TRACKS = {
  title: { root: 62, scale: 'major', bpm: 92, prog: [0, 4, 5, 3, 0, 4, 3, 4], lead: 'bell', pad: true, drums: 'soft', bass: 'soft', swing: 0 },
  lab: { root: 65, scale: 'major', bpm: 100, prog: [0, 3, 4, 0, 5, 3, 1, 4], lead: 'pluck', pad: true, drums: 'soft', bass: 'walk' },
  moss: { root: 65, scale: 'major', bpm: 98, prog: [0, 3, 4, 0, 5, 3, 4, 4], lead: 'flute', pad: true, drums: 'light', bass: 'soft' },
  coast: { root: 62, scale: 'mixolydian', bpm: 106, prog: [0, 6, 3, 0, 0, 6, 4, 4], lead: 'pluck', pad: true, drums: 'shuffle', bass: 'bounce', swing: 0.18 },
  spark: { root: 69, scale: 'major', bpm: 122, prog: [0, 4, 5, 3, 0, 4, 3, 4], lead: 'square', pad: false, drums: 'pop', bass: 'bounce' },
  blossom: { root: 64, scale: 'pentMinor', bpm: 84, prog: [0, 3, 4, 0, 5, 3, 4, 0], lead: 'bell', pad: true, drums: 'soft', bass: 'soft' },
  forest: { root: 67, scale: 'dorian', bpm: 94, prog: [0, 3, 0, 6, 0, 3, 4, 4], lead: 'flute', pad: true, drums: 'light', bass: 'walk' },
  storm: { root: 59, scale: 'minor', bpm: 116, prog: [0, 5, 3, 6, 0, 5, 6, 4], lead: 'saw', pad: true, drums: 'drive', bass: 'pulse' },
  ember: { root: 62, scale: 'harmonic', bpm: 112, prog: [0, 5, 3, 4, 0, 5, 1, 4], lead: 'saw', pad: true, drums: 'drive', bass: 'pulse' },
  stars: { root: 60, scale: 'lydian', bpm: 80, prog: [0, 1, 0, 4, 0, 1, 5, 4], lead: 'bell', pad: true, drums: 'none', bass: 'soft' },
  mist: { root: 66, scale: 'minor', bpm: 74, prog: [0, 5, 3, 4, 0, 5, 6, 4], lead: 'flute', pad: true, drums: 'none', bass: 'soft' },
  frost: { root: 69, scale: 'minor', bpm: 88, prog: [0, 3, 5, 4, 0, 3, 6, 4], lead: 'bell', pad: true, drums: 'soft', bass: 'soft' },
  canopy: { root: 64, scale: 'major', bpm: 102, prog: [0, 4, 5, 3, 0, 1, 3, 4], lead: 'flute', pad: true, drums: 'light', bass: 'bounce' },
  thunder: { root: 67, scale: 'minor', bpm: 126, prog: [0, 6, 5, 6, 0, 6, 3, 4], lead: 'square', pad: false, drums: 'drive', bass: 'pulse' },
  crystal: { root: 61, scale: 'minor', bpm: 90, prog: [0, 5, 2, 6, 0, 5, 3, 4], lead: 'bell', pad: true, drums: 'soft', bass: 'soft' },
  moon: { root: 63, scale: 'major', bpm: 72, prog: [0, 5, 3, 4, 0, 5, 1, 4], lead: 'bell', pad: true, drums: 'none', bass: 'soft' },
  sun: { root: 70, scale: 'major', bpm: 118, prog: [0, 3, 4, 0, 5, 3, 4, 4], lead: 'square', pad: true, drums: 'pop', bass: 'bounce' },
  sky: { root: 62, scale: 'major', bpm: 108, prog: [0, 4, 5, 3, 0, 4, 3, 4], lead: 'flute', pad: true, drums: 'light', bass: 'walk' },
  route: { root: 67, scale: 'major', bpm: 128, prog: [0, 4, 5, 3, 0, 3, 4, 4], lead: 'square', pad: false, drums: 'pop', bass: 'bounce' },
  cave: { root: 57, scale: 'minor', bpm: 70, prog: [0, 5, 0, 6, 0, 5, 3, 4], lead: 'bell', pad: true, drums: 'none', bass: 'soft' },
  battle: { root: 57, scale: 'minor', bpm: 148, prog: [0, 5, 6, 4, 0, 5, 3, 4], lead: 'saw', pad: false, drums: 'battle', bass: 'run' },
  trainer: { root: 62, scale: 'harmonic', bpm: 152, prog: [0, 5, 3, 4, 0, 6, 5, 4], lead: 'square', pad: false, drums: 'battle', bass: 'run' },
  gym: { root: 64, scale: 'minor', bpm: 156, prog: [0, 6, 5, 4, 0, 6, 3, 4], lead: 'saw', pad: true, drums: 'battle', bass: 'run' },
  champion: { root: 59, scale: 'harmonic', bpm: 160, prog: [0, 5, 3, 4, 0, 1, 5, 4], lead: 'saw', pad: true, drums: 'battle', bass: 'run' },
  guild: { root: 62, scale: 'dorian', bpm: 118, prog: [0, 3, 0, 6, 0, 3, 5, 4], lead: 'square', pad: false, drums: 'sneak', bass: 'walk', swing: 0.22 },
  guildBattle: { root: 60, scale: 'harmonic', bpm: 150, prog: [0, 1, 0, 4, 0, 1, 5, 4], lead: 'square', pad: false, drums: 'battle', bass: 'run' },
  league: { root: 62, scale: 'major', bpm: 112, prog: [0, 4, 5, 3, 0, 4, 1, 4], lead: 'saw', pad: true, drums: 'march', bass: 'pulse' },
  finale: { root: 57, scale: 'harmonic', bpm: 164, prog: [0, 5, 6, 4, 0, 1, 5, 4], lead: 'saw', pad: true, drums: 'battle', bass: 'run' },
  victory: { root: 67, scale: 'major', bpm: 132, prog: [0, 3, 4, 0], lead: 'square', pad: false, drums: 'pop', bass: 'bounce', short: true },
  credits: { root: 62, scale: 'major', bpm: 90, prog: [0, 4, 5, 3, 0, 4, 3, 4], lead: 'bell', pad: true, drums: 'soft', bass: 'soft' }
};

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

export class Audio {
  constructor(settings) {
    this.settings = settings; this.ctx = null; this.track = null; this.nextBar = 0; this.bar = 0; this.ambience = null;
    settings.on('change', () => this.applyVolumes());
  }
  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    const c = this.ctx;
    this.master = c.createGain(); this.master.connect(c.destination);
    this.musicBus = c.createGain(); this.sfxBus = c.createGain(); this.ambBus = c.createGain();
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3;
    this.musicBus.connect(comp); this.sfxBus.connect(comp); this.ambBus.connect(comp); comp.connect(this.master);
    // simple echo send for atmosphere
    this.delay = c.createDelay(1); this.delay.delayTime.value = 0.28; this.fb = c.createGain(); this.fb.gain.value = 0.25; this.wet = c.createGain(); this.wet.gain.value = 0.18;
    this.delay.connect(this.fb); this.fb.connect(this.delay); this.delay.connect(this.wet); this.wet.connect(this.musicBus);
    this.noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = this.noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.applyVolumes();
    this.timer = setInterval(() => this.schedule(), 40);
    if (this.pendingTrack) { const t = this.pendingTrack; this.pendingTrack = null; this.play(t); }
    if (this.pendingAmb) { const a = this.pendingAmb; this.pendingAmb = null; this.setAmbience(a); }
  }
  applyVolumes() {
    if (!this.ctx) return;
    const s = this.settings, m = s.get('muted') ? 0 : 1, t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(m, t, 0.05);
    this.musicBus.gain.setTargetAtTime(s.get('musicVolume') * 0.55, t, 0.1);
    this.sfxBus.gain.setTargetAtTime(s.get('sfxVolume') * 0.9, t, 0.05);
    this.ambBus.gain.setTargetAtTime(s.get('ambienceVolume') * 0.6, t, 0.2);
  }
  // ------------------------------------------------------------ music
  play(id, { restart = false } = {}) {
    if (!this.ctx) { this.pendingTrack = id; return; }
    if (!TRACKS[id]) return;
    if (this.track?.id === id && !restart) return;
    const now = this.ctx.currentTime;
    if (this.track) { const old = this.track.gain; old.gain.setTargetAtTime(0, now, 0.25); setTimeout(() => old.disconnect(), 1500); }
    const g = this.ctx.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(1, now + 0.05, 0.3); g.connect(this.musicBus); g.connect(this.delay);
    this.track = { id, def: TRACKS[id], gain: g, rng: createRng('music:' + id), melody: composeMelody(id, TRACKS[id]) };
    this.bar = 0; this.nextBar = now + 0.12;
  }
  stopMusic() { if (this.track && this.ctx) { this.track.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2); this.track = null; } }
  schedule() {
    if (!this.ctx || !this.track || document.hidden) return;
    const c = this.ctx;
    while (this.nextBar < c.currentTime + 0.35) {
      const t = this.track, def = t.def, beat = 60 / def.bpm, barLen = beat * 4;
      const bi = this.bar % def.prog.length;
      if (def.short && this.bar >= def.prog.length) { this.stopMusic(); return; }
      this.scheduleBar(t, bi, this.nextBar, beat);
      this.nextBar += barLen; this.bar++;
    }
  }
  scheduleBar(t, bi, start, beat) {
    const def = t.def, sc = SCALES[def.scale], deg = def.prog[bi];
    const note = (d, oct = 0) => def.root + sc[((d % 7) + 7) % 7] + 12 * (Math.floor(d / 7) + oct);
    const chord = [note(deg, -1), note(deg + 2, -1), note(deg + 4, -1)];
    const out = t.gain, sw = def.swing || 0;
    const at = (i8) => start + i8 * beat / 2 + ((i8 % 2) ? sw * beat / 2 : 0);
    // pad
    if (def.pad) for (const n of chord) this.voice('pad', mtof(n), start, beat * 4, 0.05, out);
    // bass
    const b = note(deg, -2);
    const bp = { soft: [0, 4], walk: [0, 2, 4, 6], bounce: [0, 1.5, 2, 3.5], pulse: [0, 1, 2, 3, 4, 5, 6, 7].map(x => x / 2), run: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5] }[def.bass] || [0, 2];
    bp.forEach((p, i) => { const n = def.bass === 'walk' ? b + [0, 7, 12, 7][i % 4] : def.bass === 'run' ? b + [0, 12, 7, 12][i % 4] : b + (i % 2 ? 7 : 0); this.voice('bass', mtof(n), start + p * beat, beat * (def.bass === 'soft' ? 1.8 : 0.45), 0.16, out); });
    // melody (8 eighths per bar)
    const mel = t.melody[bi % t.melody.length];
    mel.forEach((m, i) => { if (m === null) return; this.voice(def.lead, mtof(note(m, 1)), at(i), beat * 0.48 * (m.long ? 2 : 1), 0.09, out); });
    // arpeggio for bell/pluck tracks
    if (def.lead === 'bell' || def.lead === 'pluck') for (let i = 0; i < 4; i++) this.voice('pluck', mtof(chord[i % 3] + 12), start + i * beat + beat / 2, beat * 0.3, 0.035, out);
    // drums
    const dr = def.drums;
    if (dr !== 'none') for (let i = 0; i < 8; i++) {
      const tt = at(i);
      if (dr === 'battle' || dr === 'drive') { if (i % 2 === 0) this.drum('kick', tt); if (i === 2 || i === 6) this.drum('snare', tt); this.drum('hat', tt, 0.5); if (dr === 'battle' && i === 7) this.drum('snare', tt + beat / 4, 0.5); }
      else if (dr === 'pop') { if (i === 0 || i === 3 || i === 4) this.drum('kick', tt); if (i === 2 || i === 6) this.drum('snare', tt, 0.8); if (i % 2) this.drum('hat', tt, 0.4); }
      else if (dr === 'march') { if (i % 4 === 0) this.drum('kick', tt); if (i % 2 === 1) this.drum('snare', tt, 0.45); }
      else if (dr === 'sneak') { if (i === 0 || i === 5) this.drum('kick', tt, 0.7); if (i === 4) this.drum('snare', tt, 0.4); if (i % 2 === 0) this.drum('hat', tt, 0.3); }
      else if (dr === 'shuffle') { if (i === 0 || i === 4) this.drum('kick', tt, 0.8); if (i === 2 || i === 6) this.drum('snare', tt, 0.5); this.drum('hat', tt, 0.3); }
      else if (dr === 'light') { if (i === 0 || i === 4) this.drum('kick', tt, 0.6); if (i % 2) this.drum('hat', tt, 0.25); }
      else if (dr === 'soft') { if (i === 0) this.drum('kick', tt, 0.4); if (i === 4) this.drum('hat', tt, 0.2); }
    }
  }
  voice(type, freq, t, dur, vol, out = this.sfxBus) {
    const c = this.ctx;
    const g = c.createGain(); g.connect(out);
    const o = c.createOscillator();
    let filter = null;
    switch (type) {
      case 'pad': { o.type = 'sawtooth'; filter = c.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 900; o.detune.value = Math.random() * 14 - 7; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + dur * 0.3); g.gain.linearRampToValueAtTime(0, t + dur); break; }
      case 'bass': o.type = 'triangle'; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); break;
      case 'bell': { o.type = 'sine'; const m = c.createOscillator(), mg = c.createGain(); m.frequency.value = freq * 3.5; mg.gain.value = freq * 0.8; mg.gain.exponentialRampToValueAtTime(1, t + dur); m.connect(mg); mg.connect(o.frequency); m.start(t); m.stop(t + dur * 2.2); g.gain.setValueAtTime(vol * 1.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur * 2.2); dur *= 2.2; break; }
      case 'pluck': o.type = 'triangle'; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur * 1.5); dur *= 1.5; break;
      case 'flute': { o.type = 'sine'; const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 5.2; lg.gain.value = freq * 0.012; lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t + dur + 0.1); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol * 1.3, t + 0.04); g.gain.setValueAtTime(vol * 1.1, t + dur * 0.7); g.gain.linearRampToValueAtTime(0, t + dur); break; }
      case 'saw': o.type = 'sawtooth'; filter = c.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.setValueAtTime(2400, t); filter.frequency.exponentialRampToValueAtTime(700, t + dur); g.gain.setValueAtTime(vol * 0.8, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur * 1.1); break;
      case 'square': default: o.type = 'square'; filter = c.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 2600; g.gain.setValueAtTime(vol * 0.6, t); g.gain.setValueAtTime(vol * 0.5, t + dur * 0.6); g.gain.exponentialRampToValueAtTime(0.001, t + dur); break;
    }
    o.frequency.setValueAtTime(freq, t);
    if (filter) { o.connect(filter); filter.connect(g); } else o.connect(g);
    o.start(t); o.stop(t + dur + 0.05);
  }
  drum(kind, t, vol = 1) {
    const c = this.ctx, out = this.track?.gain || this.sfxBus;
    if (kind === 'kick') { const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12); g.gain.setValueAtTime(0.32 * vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.25); return; }
    const s = c.createBufferSource(); s.buffer = this.noiseBuf;
    const f = c.createBiquadFilter(), g = c.createGain();
    if (kind === 'snare') { f.type = 'bandpass'; f.frequency.value = 1800; g.gain.setValueAtTime(0.16 * vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.16); }
    else { f.type = 'highpass'; f.frequency.value = 7000; g.gain.setValueAtTime(0.05 * vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05); }
    s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random()); s.stop(t + 0.2);
  }
  // ------------------------------------------------------------ sound effects
  sfx(name, opts = {}) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + 0.01, v = (f, d, vol, type = 'square', when = 0) => this.voice(type, f, t + when, d, vol, this.sfxBus);
    switch (name) {
      case 'move': v(880, 0.04, 0.05, 'pluck'); break;
      case 'confirm': v(990, 0.06, 0.07, 'pluck'); v(1320, 0.08, 0.06, 'pluck', 0.05); break;
      case 'back': v(660, 0.06, 0.06, 'pluck'); v(440, 0.08, 0.05, 'pluck', 0.05); break;
      case 'error': v(220, 0.12, 0.08, 'square'); v(180, 0.14, 0.08, 'square', 0.1); break;
      case 'text': v(700 + Math.random() * 120, 0.02, 0.025, 'pluck'); break;
      case 'door': this.noise(0.25, 600, 0.12, 'lowpass'); v(220, 0.12, 0.05, 'triangle', 0.05); break;
      case 'step': this.noise(0.05, 900, 0.03, 'lowpass'); break;
      case 'item': [0, 4, 7, 12].forEach((n, i) => v(mtof(72 + n), 0.12, 0.08, 'square', i * 0.07)); break;
      case 'chest': [0, 4, 7, 11, 12, 16].forEach((n, i) => v(mtof(67 + n), 0.15, 0.07, 'pluck', i * 0.06)); break;
      case 'heal': [0, 4, 7, 12, 7, 12, 16, 19].forEach((n, i) => v(mtof(72 + n), 0.22, 0.07, 'bell', i * 0.13)); break;
      case 'levelup': [0, 4, 7, 12].forEach((n, i) => v(mtof(74 + n), 0.14, 0.08, 'square', i * 0.08)); v(mtof(86), 0.4, 0.08, 'square', 0.32); break;
      case 'catch': [0, 4, 7, 12, 16].forEach((n, i) => v(mtof(67 + n), 0.18, 0.08, 'square', i * 0.1)); v(mtof(91), 0.5, 0.08, 'bell', 0.5); break;
      case 'shake': this.noise(0.08, 1200, 0.09, 'bandpass'); v(300, 0.05, 0.05, 'triangle'); break;
      case 'throw': this.sweep(400, 1200, 0.25, 0.06); break;
      case 'ballOpen': this.sweep(1400, 300, 0.3, 0.07); this.noise(0.2, 3000, 0.05, 'highpass'); break;
      case 'faint': this.sweep(500, 80, 0.6, 0.09); break;
      case 'run': this.sweep(300, 900, 0.2, 0.05); this.noise(0.25, 2000, 0.04, 'highpass'); break;
      case 'puzzle': v(mtof(79), 0.1, 0.06, 'bell'); break;
      case 'solve': [0, 7, 12, 16, 19, 24].forEach((n, i) => v(mtof(67 + n), 0.2, 0.07, 'bell', i * 0.09)); break;
      case 'push': this.noise(0.3, 300, 0.12, 'lowpass'); break;
      case 'thunder': this.noise(1.6, 180, 0.3, 'lowpass'); break;
      case 'evolve': for (let i = 0; i < 16; i++) v(mtof(60 + i * 2), 0.15, 0.05, 'bell', i * 0.09); break;
      case 'encounter': [0, 3, 6, 9, 12].forEach((n, i) => v(mtof(64 + n), 0.07, 0.08, 'square', i * 0.05)); break;
      case 'hit': {
        const type = opts.type || 'normal', eff = opts.eff || 1;
        const base = { feuer: 'flame', wasser: 'splash', pflanze: 'leaf', elektro: 'zap', eis: 'ice', geist: 'ghost', gestein: 'rock', erde: 'rock', flug: 'wind' }[type] || 'impact';
        if (base === 'flame') this.noise(0.35, 900, 0.14, 'lowpass');
        else if (base === 'splash') { this.noise(0.3, 1400, 0.12, 'bandpass'); this.sweep(900, 300, 0.2, 0.04); }
        else if (base === 'leaf') this.noise(0.25, 4000, 0.08, 'highpass');
        else if (base === 'zap') { for (let i = 0; i < 5; i++) v(1200 + Math.random() * 1600, 0.03, 0.05, 'square', i * 0.03); }
        else if (base === 'ice') v(mtof(96), 0.3, 0.06, 'bell');
        else if (base === 'ghost') this.sweep(300, 600, 0.5, 0.05);
        else if (base === 'rock') { this.noise(0.25, 300, 0.18, 'lowpass'); v(90, 0.2, 0.12, 'triangle'); }
        else if (base === 'wind') this.noise(0.4, 2000, 0.08, 'bandpass');
        else { this.noise(0.12, 800, 0.14, 'lowpass'); v(140, 0.1, 0.1, 'triangle'); }
        if (eff > 1) v(mtof(88), 0.12, 0.06, 'square', 0.08);
        break;
      }
      case 'cry': { const f0 = opts.pitch || 400; this.sweep(f0, f0 * 1.6, 0.18, 0.07, 'square'); this.sweep(f0 * 1.6, f0 * 0.9, 0.2, 0.06, 'square', 0.18); break; }
    }
  }
  noise(dur, freq, vol, type = 'lowpass') {
    const c = this.ctx, t = c.currentTime + 0.01;
    const s = c.createBufferSource(); s.buffer = this.noiseBuf;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq;
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.sfxBus); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  sweep(f0, f1, dur, vol, type = 'triangle', when = 0) {
    const c = this.ctx, t = c.currentTime + 0.01 + when;
    const o = c.createOscillator(), g = c.createGain(); o.type = type;
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.sfxBus); o.start(t); o.stop(t + dur + 0.05);
  }
  // ------------------------------------------------------------ ambience
  setAmbience(kind) {
    if (!this.ctx) { this.pendingAmb = kind; return; }
    if (this.ambience?.kind === kind) return;
    if (this.ambience) { const a = this.ambience; a.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4); clearInterval(a.timer); setTimeout(() => { try { a.src?.stop(); } catch {} a.gain.disconnect(); }, 2000); }
    this.ambience = null;
    if (!kind) return;
    const c = this.ctx, g = c.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(1, c.currentTime, 0.6); g.connect(this.ambBus);
    const amb = { kind, gain: g };
    const bed = (freq, type, vol, lfoRate = 0.1) => {
      const s = c.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true;
      const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq;
      const v = c.createGain(); v.gain.value = vol;
      const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = lfoRate; lg.gain.value = vol * 0.6; lfo.connect(lg); lg.connect(v.gain); lfo.start();
      s.connect(f); f.connect(v); v.connect(g); s.start(); amb.src = s;
    };
    const chirp = () => { const t = c.currentTime + Math.random() * 0.2, f = 2400 + Math.random() * 1800; for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) { const o = c.createOscillator(), gg = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f, t + i * 0.09); o.frequency.exponentialRampToValueAtTime(f * 1.3, t + i * 0.09 + 0.06); gg.gain.setValueAtTime(0.025, t + i * 0.09); gg.gain.exponentialRampToValueAtTime(0.001, t + i * 0.09 + 0.07); o.connect(gg); gg.connect(g); o.start(t + i * 0.09); o.stop(t + i * 0.09 + 0.08); } };
    const cricket = () => { const t = c.currentTime; for (let i = 0; i < 6; i++) { const o = c.createOscillator(), gg = c.createGain(); o.frequency.value = 4400; gg.gain.setValueAtTime(0.012, t + i * 0.05); gg.gain.exponentialRampToValueAtTime(0.0005, t + i * 0.05 + 0.035); o.connect(gg); gg.connect(g); o.start(t + i * 0.05); o.stop(t + i * 0.05 + 0.04); } };
    const drip = () => { const t = c.currentTime, o = c.createOscillator(), gg = c.createGain(); o.frequency.setValueAtTime(1400 + Math.random() * 800, t); o.frequency.exponentialRampToValueAtTime(500, t + 0.08); gg.gain.setValueAtTime(0.04, t); gg.gain.exponentialRampToValueAtTime(0.001, t + 0.12); o.connect(gg); gg.connect(g); o.start(t); o.stop(t + 0.15); };
    const frog = () => { const t = c.currentTime, o = c.createOscillator(), gg = c.createGain(); o.type = 'square'; o.frequency.setValueAtTime(180, t); o.frequency.linearRampToValueAtTime(120, t + 0.15); gg.gain.setValueAtTime(0.02, t); gg.gain.exponentialRampToValueAtTime(0.001, t + 0.18); o.connect(gg); gg.connect(g); o.start(t); o.stop(t + 0.2); };
    switch (kind) {
      case 'birds': case 'forest': bed(500, 'lowpass', 0.04, 0.07); amb.timer = setInterval(() => Math.random() < (kind === 'forest' ? 0.5 : 0.35) && chirp(), 700); break;
      case 'sea': bed(700, 'lowpass', 0.2, 0.12); amb.timer = setInterval(() => Math.random() < 0.15 && chirp(), 1500); break;
      case 'wind': bed(900, 'bandpass', 0.12, 0.18); break;
      case 'lava': bed(160, 'lowpass', 0.25, 0.25); break;
      case 'night': bed(400, 'lowpass', 0.03, 0.05); amb.timer = setInterval(() => Math.random() < 0.6 && cricket(), 600); break;
      case 'swamp': bed(300, 'lowpass', 0.06, 0.08); amb.timer = setInterval(() => Math.random() < 0.35 && frog(), 900); break;
      case 'cave': bed(220, 'lowpass', 0.05, 0.06); amb.timer = setInterval(() => Math.random() < 0.4 && drip(), 900); break;
      case 'town': bed(600, 'lowpass', 0.03, 0.05); amb.timer = setInterval(() => Math.random() < 0.25 && chirp(), 1100); break;
      case 'indoor': bed(300, 'lowpass', 0.015, 0.03); break;
    }
    this.ambience = amb;
  }
}

// Melody composer: a 2-bar motif repeated with variations over the
// progression (A A' B A''), using chord tones on strong beats.
function composeMelody(id, def) {
  const rng = createRng('melody:' + id);
  const bars = def.prog.length;
  const motif = (deg) => {
    const out = [];
    for (let i = 0; i < 8; i++) {
      if (rng.next() < (i % 2 ? 0.28 : 0.1)) { out.push(null); continue; }
      const strong = i % 4 === 0;
      const tones = strong ? [0, 2, 4] : [0, 1, 2, 3, 4, 5];
      out.push(deg + rng.pick(tones) + (rng.next() < 0.15 ? 7 : 0));
    }
    return out;
  };
  const A = motif(0), B = motif(0);
  const res = [];
  for (let b = 0; b < bars; b++) {
    const deg = def.prog[b];
    const src = b % 4 === 2 ? B : A;
    res.push(src.map((n, i) => n === null ? null : n + deg - (b % 4 === 3 && i > 5 ? 1 : 0)));
  }
  return res;
}
