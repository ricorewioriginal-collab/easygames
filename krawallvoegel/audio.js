/* Krawallvögel 3D – Klänge und Musik, komplett mit Web Audio erzeugt (keine Audiodateien). */
(function () {
'use strict';
let ctx = null, master = null, sfxBus = null, musicBus = null, noise = null;
let soundOn = true, musicOn = true, musicTimer = 0, musicTheme = null, nextNote = 0, step = 0;
const last = Object.create(null);
const SCALES = { major:[0, 2, 4, 5, 7, 9, 11], minor:[0, 2, 3, 5, 7, 8, 10], dorian:[0, 2, 3, 5, 7, 9, 10] };

function init() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); return ctx; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try { ctx = new AC(); } catch (_) { return null; }
  master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
  sfxBus = ctx.createGain(); sfxBus.gain.value = soundOn ? 1 : 0; sfxBus.connect(master);
  musicBus = ctx.createGain(); musicBus.gain.value = musicOn ? 0.55 : 0; musicBus.connect(master);
  const len = ctx.sampleRate; noise = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = noise.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return ctx;
}
const ok = () => ctx && soundOn && ctx.state === 'running';
function env(g, t, a, peak, dur) {
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
}
function out(pan) {
  const g = ctx.createGain();
  if (ctx.createStereoPanner && pan) { const p = ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); g.connect(p); p.connect(sfxBus); }
  else g.connect(sfxBus);
  return g;
}
function tone(type, f0, f1, dur, vol, pan, delay) {
  const t = ctx.currentTime + (delay || 0), o = ctx.createOscillator(), g = out(pan);
  o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  env(g, t, 0.008, vol, dur); o.connect(g); o.start(t); o.stop(t + dur + 0.05);
  return o;
}
function hiss(filter, f0, f1, dur, vol, pan, q, delay) {
  const t = ctx.currentTime + (delay || 0), s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = out(pan);
  s.buffer = noise; s.loop = true; fl.type = filter; fl.Q.value = q || 0.8;
  fl.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
  env(g, t, 0.005, vol, dur); s.connect(fl); fl.connect(g); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
}
const BIRD_PITCH = { red:1, blue:1.5, yellow:1.25, black:0.7, white:1.1, green:0.95, big:0.55, orange:1.15 };

const SFX = {
  ui(p) { tone('triangle', 880, 1320, 0.07, 0.12, p); },
  back(p) { tone('triangle', 660, 440, 0.08, 0.1, p); },
  stretch(p) { tone('sawtooth', 120, 210, 0.22, 0.05, p); },
  launch(p) { hiss('bandpass', 2400, 500, 0.35, 0.3, p, 1.2); tone('sine', 300, 140, 0.25, 0.12, p); },
  squawk(p, type) {
    const k = BIRD_PITCH[type] || 1, o = tone('sawtooth', 620 * k, 420 * k, 0.32, 0.1, p);
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 22; lg.gain.value = 60 * k;
    lfo.connect(lg); lg.connect(o.frequency); lfo.start(); lfo.stop(ctx.currentTime + 0.4);
  },
  wood(p, s) { hiss('lowpass', 1100, 300, 0.12 + 0.1 * s, 0.25 + 0.3 * s, p); tone('sine', 190, 120, 0.12, 0.15 * s + 0.05, p); },
  glass(p, s) { hiss('highpass', 3500, 5000, 0.15 + 0.15 * s, 0.12 + 0.2 * s, p); [2100, 3150, 4200].forEach((f, i) => tone('sine', f * (0.9 + Math.random() * 0.2), 0, 0.25, 0.03 + 0.04 * s, p, i * 0.03)); },
  stone(p, s) { hiss('lowpass', 500, 120, 0.2 + 0.15 * s, 0.3 + 0.3 * s, p); tone('sine', 95, 55, 0.2, 0.2 * s + 0.08, p); },
  tnt(p, s) { SFX.wood(p, s); },
  logo(p, s) { SFX.wood(p, s); },
  gold(p, s) { SFX.glass(p, s); },
  pig(p, s) {
    const t = ctx.currentTime, o = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = out(p);
    o.type = 'sawtooth'; o.frequency.setValueAtTime(210, t); o.frequency.exponentialRampToValueAtTime(120, t + 0.18);
    lp.type = 'lowpass'; lp.frequency.value = 900; env(g, t, 0.01, 0.1 + 0.08 * (s || 0), 0.2);
    o.connect(lp); lp.connect(g); o.start(t); o.stop(t + 0.25);
  },
  pigpop(p) { tone('sine', 900, 160, 0.16, 0.25, p); hiss('bandpass', 1200, 300, 0.2, 0.15, p); SFX.pig(p, 1); },
  boom(p) { hiss('lowpass', 900, 60, 0.9, 0.9, p, 0.6); tone('sine', 110, 35, 0.7, 0.5, p); },
  ability(p) { tone('square', 500, 1000, 0.12, 0.06, p); },
  boost(p) { hiss('bandpass', 600, 3000, 0.3, 0.25, p, 2); },
  inflate(p) { tone('sine', 120, 480, 0.35, 0.2, p); },
  eagle(p) { tone('sawtooth', 1400, 900, 0.6, 0.1, p); hiss('bandpass', 800, 300, 1.2, 0.25, p, 0.7); },
  quake() { hiss('lowpass', 160, 70, 2.4, 0.6, 0, 0.5); },
  star(p, i) { const f = 660 * Math.pow(1.26, i || 0); tone('triangle', f, f, 0.35, 0.18, p); tone('sine', f * 2, f * 2, 0.3, 0.05, p, 0.02); },
  win() { [0, 4, 7, 12, 16].forEach((n, i) => tone('triangle', 523 * Math.pow(2, n / 12), 0, 0.3, 0.14, 0, i * 0.09)); },
  lose() { [7, 5, 3, 0].forEach((n, i) => tone('triangle', 392 * Math.pow(2, n / 12), 0, 0.35, 0.12, 0, i * 0.16)); SFX.pig(0, 1); },
  jingle(p) { [0, 4, 7].forEach((n, i) => tone('square', 784 * Math.pow(2, n / 12), 0, 0.14, 0.06, p, i * 0.08)); },
  goldJingle(p) { [0, 4, 7, 12, 16, 19].forEach((n, i) => tone('triangle', 880 * Math.pow(2, n / 12), 0, 0.22, 0.1, p, i * 0.07)); },
  clear() { [0, 7, 12].forEach((n, i) => tone('sine', 659 * Math.pow(2, n / 12), 0, 0.2, 0.1, 0, i * 0.06)); }
};

function play(name, pan, arg, throttleMs) {
  if (!ok() || !SFX[name]) return;
  const now = performance.now(), key = name;
  if (throttleMs && last[key] && now - last[key] < throttleMs) return;
  last[key] = now;
  try { SFX[name](pan || 0, arg); } catch (_) {}
}

// ---------- Musik: kleiner Sequenzer, plant immer nur ~0,3 s voraus ----------
function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }
function note(type, n, t, dur, vol) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = midi(n);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(musicBus); o.start(t); o.stop(t + dur + 0.05);
}
function makePattern(theme) {
  let seed = theme.root * 131 + theme.tempo; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const sc = SCALES[theme.scale] || SCALES.major, deg = d => theme.root + 12 * Math.floor(d / sc.length) + sc[((d % sc.length) + sc.length) % sc.length];
  const chords = [0, 3, 4, 0].map(c => (theme.scale === 'major' ? c : [0, 5, 3, 4][[0, 3, 4, 0].indexOf(c)]));
  const melody = []; let d = 7;
  for (let i = 0; i < 64; i++) { if (rnd() < 0.62) { d += Math.round((rnd() - 0.5) * 4); d = Math.max(4, Math.min(13, d)); melody.push(deg(d)); } else melody.push(null); }
  return { chords:chords.map(c => [deg(c) - 12, deg(c + 2) - 12, deg(c + 4) - 12]), bass:chords.map(c => deg(c) - 24), melody };
}
function schedule() {
  if (!ctx || !musicTheme) return;
  const spb = 60 / musicTheme.tempo / 2; // Achtel
  while (nextNote < ctx.currentTime + 0.3) {
    const pat = musicTheme.pattern, bar = Math.floor(step / 16) % 4, i = step % 16;
    if (i % 4 === 0) note('triangle', pat.bass[bar] + (i === 8 ? 7 : 0), nextNote, spb * 1.8, 0.16);
    if (i === 0) pat.chords[bar].forEach(n => note('sine', n + 12, nextNote, spb * 14, 0.035));
    const m = pat.melody[step % 64];
    if (m !== null && i % 2 === 0) note('square', m, nextNote, spb * 1.4, 0.03);
    if (i % 4 === 2) { const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noise; f.type = 'highpass'; f.frequency.value = 7000;
      g.gain.setValueAtTime(0.04, nextNote); g.gain.exponentialRampToValueAtTime(0.0001, nextNote + 0.05); s.connect(f); f.connect(g); g.connect(musicBus); s.start(nextNote, Math.random() * 0.5); s.stop(nextNote + 0.06); }
    nextNote += spb; step++;
  }
}
function setMusic(theme) {
  musicTheme = theme ? Object.assign({ pattern:makePattern(theme) }, theme) : null;
  if (!ctx) return;
  step = 0; nextNote = ctx.currentTime + 0.1;
  if (musicTimer) { clearInterval(musicTimer); musicTimer = 0; }
  if (musicTheme && musicOn) musicTimer = setInterval(schedule, 120);
}
function setEnabled(sound, music) {
  soundOn = !!sound; musicOn = !!music;
  if (!ctx) return;
  sfxBus.gain.setTargetAtTime(soundOn ? 1 : 0, ctx.currentTime, 0.05);
  musicBus.gain.setTargetAtTime(musicOn ? 0.55 : 0, ctx.currentTime, 0.1);
  if (!musicOn && musicTimer) { clearInterval(musicTimer); musicTimer = 0; }
  if (musicOn && !musicTimer && musicTheme) { nextNote = ctx.currentTime + 0.1; musicTimer = setInterval(schedule, 120); }
}
function suspend(yes) {
  if (!ctx) return;
  if (yes) { ctx.suspend().catch(() => {}); if (musicTimer) { clearInterval(musicTimer); musicTimer = 0; } }
  else { ctx.resume().catch(() => {}); if (musicOn && musicTheme && !musicTimer) { nextNote = ctx.currentTime + 0.1; musicTimer = setInterval(schedule, 120); } }
}

window.KVAudio = { init, play, setMusic, setEnabled, suspend };
})();
