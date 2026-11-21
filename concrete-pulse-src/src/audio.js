// Klang: alle Geräusche und die Musik entstehen im Browser (WebAudio), keine Dateien, keine fremden Samples.
let ctx = null, master, sfxBus, musBus, noiseBuf, roll, rollGain, rollFilt, grind, grindGain, grindFilt;
export const vol = { sfx: 0.8, music: 0.55 };

export function initAudio() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  ctx = new AC();
  master = ctx.createDynamicsCompressor(); master.threshold.value = -14; master.ratio.value = 4; master.connect(ctx.destination);
  sfxBus = ctx.createGain(); sfxBus.gain.value = vol.sfx; sfxBus.connect(master);
  musBus = ctx.createGain(); musBus.gain.value = vol.music; musBus.connect(master);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  // Rollgeräusch (dauerhaft, Lautstärke nach Tempo)
  roll = ctx.createBufferSource(); roll.buffer = noiseBuf; roll.loop = true;
  rollFilt = ctx.createBiquadFilter(); rollFilt.type = 'bandpass'; rollFilt.frequency.value = 300; rollFilt.Q.value = 0.7;
  rollGain = ctx.createGain(); rollGain.gain.value = 0; roll.connect(rollFilt); rollFilt.connect(rollGain); rollGain.connect(sfxBus); roll.start();
  // Grind (metallisches Kratzen)
  grind = ctx.createBufferSource(); grind.buffer = noiseBuf; grind.loop = true;
  grindFilt = ctx.createBiquadFilter(); grindFilt.type = 'bandpass'; grindFilt.frequency.value = 2400; grindFilt.Q.value = 6;
  grindGain = ctx.createGain(); grindGain.gain.value = 0; grind.connect(grindFilt); grindFilt.connect(grindGain); grindGain.connect(sfxBus); grind.start();
  document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else ctx.resume(); });
  return ctx;
}
export function setVolumes() { if (!ctx) return; sfxBus.gain.value = vol.sfx; musBus.gain.value = vol.music; }

function env(g, t, a, peak, dcy) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dcy); }
function noise(t, dur, f, q, peak, type = 'bandpass', bus = sfxBus) {
  const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.playbackRate.value = 1;
  const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
  const g = ctx.createGain(); env(g, t, 0.003, peak, dur);
  s.connect(fl); fl.connect(g); g.connect(bus); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  return fl;
}
function tone(t, f, dur, type, peak, bus = sfxBus, slide) {
  const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  const g = ctx.createGain(); env(g, t, 0.004, peak, dur); o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.05);
}

export function sfx(name, k = 1) {
  if (!ctx) return; const t = ctx.currentTime;
  switch (name) {
    case 'pop': noise(t, 0.05, 1800, 1.5, 0.9 * k, 'highpass'); tone(t, 140, 0.09, 'sine', 0.6 * k, sfxBus, 60); break;
    case 'land': noise(t, 0.12, 220, 0.8, 0.9 * k, 'lowpass'); tone(t, 90, 0.14, 'sine', 0.7 * k, sfxBus, 45); noise(t + 0.01, 0.06, 2500, 1, 0.25 * k); break;
    case 'flip': noise(t, 0.12, 900, 3, 0.25, 'bandpass').frequency.exponentialRampToValueAtTime(2600, t + 0.12); break;
    case 'grab': noise(t, 0.05, 3200, 2, 0.15); break;
    case 'grindStart': noise(t, 0.06, 3000, 4, 0.5); tone(t, 1300, 0.08, 'triangle', 0.08); break;
    case 'manual': noise(t, 0.04, 600, 2, 0.3); break;
    case 'revert': noise(t, 0.25, 1400, 1.2, 0.35, 'bandpass').frequency.exponentialRampToValueAtTime(500, t + 0.25); break;
    case 'bail': noise(t, 0.3, 300, 0.7, 1, 'lowpass'); tone(t, 120, 0.3, 'sawtooth', 0.15, sfxBus, 50); noise(t + 0.12, 0.2, 1500, 2, 0.4); break;
    case 'bump': noise(t, 0.08, 400, 1, 0.6 * k, 'lowpass'); break;
    case 'bank': [0, 4, 7, 12].forEach((s, i) => tone(t + i * 0.05, 523 * Math.pow(2, s / 12), 0.18, 'triangle', 0.12)); break;
    case 'special': [0, 7, 12, 19, 24].forEach((s, i) => tone(t + i * 0.04, 392 * Math.pow(2, s / 12), 0.25, 'sawtooth', 0.06)); noise(t, 0.4, 5000, 0.5, 0.15, 'highpass'); break;
    case 'collect': [0, 12].forEach((s, i) => tone(t + i * 0.07, 880 * Math.pow(2, s / 12), 0.2, 'sine', 0.2)); break;
    case 'goal': [0, 4, 7, 11, 14].forEach((s, i) => tone(t + i * 0.08, 440 * Math.pow(2, s / 12), 0.35, 'triangle', 0.16)); break;
    case 'gap': [0, 5, 9].forEach((s, i) => tone(t + i * 0.06, 660 * Math.pow(2, s / 12), 0.2, 'square', 0.05)); break;
    case 'ui': tone(t, 880, 0.05, 'sine', 0.12); break;
    case 'uiBack': tone(t, 520, 0.06, 'sine', 0.1); break;
    case 'tick': tone(t, 1200, 0.04, 'square', 0.05); break;
    case 'end': [12, 7, 4, 0].forEach((s, i) => tone(t + i * 0.12, 440 * Math.pow(2, s / 12), 0.4, 'triangle', 0.14)); break;
  }
}
export function setRoll(speed, grounded) {
  if (!ctx) return; const t = ctx.currentTime;
  const v = grounded ? Math.min(1, speed / 12) : 0;
  rollGain.gain.setTargetAtTime(v * 0.32, t, 0.05); rollFilt.frequency.setTargetAtTime(180 + speed * 45, t, 0.1);
}
export function setGrind(on, kind) {
  if (!ctx) return; const t = ctx.currentTime;
  grindGain.gain.setTargetAtTime(on ? (kind === 'ledge' ? 0.25 : 0.35) : 0, t, 0.03);
  grindFilt.frequency.setTargetAtTime(kind === 'ledge' ? 900 : 2600, t, 0.02); grindFilt.Q.value = kind === 'ledge' ? 2 : 7;
}

// ---------------------------------------------------------------- Musik: eigener Lo-Fi/Boom-Bap-Generator
export const TRACKS = [
  { name: 'Asphaltwelle', bpm: 90, key: 45, prog: [0, 5, 3, 7], swing: 0.12, seed: 3, style: 'boom' },
  { name: 'Hafenlichter', bpm: 98, key: 50, prog: [0, 3, 8, 7], swing: 0.08, seed: 11, style: 'drive' },
  { name: 'Neonflut', bpm: 104, key: 43, prog: [0, 8, 3, 10], swing: 0.04, seed: 21, style: 'synth' },
  { name: 'Spätschicht', bpm: 86, key: 48, prog: [0, 9, 5, 7], swing: 0.16, seed: 33, style: 'boom' }
];
let mus = null;
export function playMusic(i) {
  if (!ctx) return; stopMusic();
  const tr = TRACKS[i % TRACKS.length];
  let s = tr.seed; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const kick = [], snare = [], hat = [], bass = [];
  for (let k = 0; k < 16; k++) { kick.push(k % 8 === 0 || (rnd() < 0.22 && k % 2 === 0 && k % 8 !== 4)); snare.push(k % 8 === 4 || (rnd() < 0.06)); hat.push(k % 2 === 0 || rnd() < 0.35); bass.push(k % 4 === 0 || rnd() < 0.25); }
  const minor = [0, 2, 3, 5, 7, 8, 10];
  const mel = []; for (let k = 0; k < 32; k++) mel.push(rnd() < 0.32 ? minor[(rnd() * 7) | 0] + 12 * ((rnd() * 2) | 0) : null);
  const spb = 60 / tr.bpm / 4;
  mus = { tr, step: 0, next: ctx.currentTime + 0.1, timer: null, kick, snare, hat, bass, mel, spb };
  const filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = tr.style === 'synth' ? 5200 : 3200; filt.connect(musBus); mus.out = filt;
  const tick = () => {
    if (!mus) return;
    while (mus.next < ctx.currentTime + 0.25) { schedule(mus, mus.step, mus.next); mus.step++; mus.next += spb * (mus.step % 2 ? 1 + tr.swing : 1 - tr.swing); }
    mus.timer = setTimeout(tick, 60);
  };
  tick();
}
function mtone(t, f, dur, type, peak, out, cutoff) {
  const o = ctx.createOscillator(); o.type = type; o.frequency.value = f;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  if (cutoff) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = cutoff; o.connect(fl); fl.connect(g); } else o.connect(g);
  g.connect(out); o.start(t); o.stop(t + dur + 0.05);
}
function schedule(m, step, t) {
  const k = step % 16, bar = Math.floor(step / 16), tr = m.tr, out = m.out;
  const root = tr.key + tr.prog[bar % tr.prog.length];
  const hz = n => 440 * Math.pow(2, (n - 69) / 12);
  if (m.kick[k]) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12); g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.32); }
  if (m.snare[k]) { const s = ctx.createBufferSource(); s.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1900; f.Q.value = 0.8; const g = ctx.createGain(); g.gain.setValueAtTime(0.45, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18); s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random()); s.stop(t + 0.2); mtone(t, 190, 0.08, 'triangle', 0.18, out); }
  if (m.hat[k]) { const s = ctx.createBufferSource(); s.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7500; const g = ctx.createGain(); const pk = k % 4 === 2 ? 0.16 : 0.08; g.gain.setValueAtTime(pk, t); g.gain.exponentialRampToValueAtTime(0.001, t + (k % 8 === 6 ? 0.12 : 0.04)); s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random()); s.stop(t + 0.14); }
  if (m.bass[k]) mtone(t, hz(root - 12 + (k === 14 ? 7 : 0)), m.spb * 1.8, tr.style === 'synth' ? 'sawtooth' : 'triangle', 0.28, out, 420);
  if (k === 0 || (tr.style !== 'boom' && k === 8)) for (const iv of [0, 3, 7, 10, 14]) mtone(t, hz(root + 12 + iv), m.spb * (tr.style === 'boom' ? 14 : 7), tr.style === 'synth' ? 'sawtooth' : 'sine', 0.045, out, tr.style === 'synth' ? 1800 : 2400);
  const mn = m.mel[(step % 32)]; if (mn != null && bar % 4 !== 3) mtone(t, hz(root + 24 + mn), m.spb * 2.2, tr.style === 'drive' ? 'square' : 'triangle', tr.style === 'drive' ? 0.035 : 0.07, out, 3000);
}
export function stopMusic() { if (mus) { clearTimeout(mus.timer); try { mus.out.disconnect(); } catch (e) {} mus = null; } }
export function currentTrack() { return mus ? mus.tr.name : ''; }
