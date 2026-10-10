/* Wobbel – Ton: alles per WebAudio erzeugt (keine Audiodateien). */
let ac = null, master = null, noiseBuf = null, sfxOn = true, musicOn = true, musicTimer = null, step = 0, nextT = 0, musicMode = null;
const hz = n => 440 * Math.pow(2, (n - 69) / 12);
function ctx() {
  if (!ac) { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination); noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  if (ac.state === 'suspended') ac.resume(); return ac;
}
function note(f, d, type, v, at, o) {
  try { const c = ctx(), t = c.currentTime + (at || 0), os = c.createOscillator(), g = c.createGain(); o = o || {}; os.type = type || 'sine'; os.frequency.setValueAtTime(f, t); if (o.to) os.frequency.exponentialRampToValueAtTime(o.to, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v || 0.06, t + (o.atk || 0.01)); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    let out = os; if (o.lp) { const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; os.connect(fl); out = fl; } out.connect(g); g.connect(master); os.start(t); os.stop(t + d + 0.03); } catch (e) {}
}
function noise(d, v, at, o) {
  try { const c = ctx(), t = c.currentTime + (at || 0), s = c.createBufferSource(), g = c.createGain(), fl = c.createBiquadFilter(); o = o || {}; s.buffer = noiseBuf; fl.type = o.type || 'bandpass'; fl.frequency.value = o.f || 2000; fl.Q.value = o.q || 0.8;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v || 0.05, t + (o.atk || 0.005)); g.gain.exponentialRampToValueAtTime(0.0001, t + d); s.connect(fl); fl.connect(g); g.connect(master); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.03); } catch (e) {}
}
const on = f => (...a) => { if (sfxOn) f(...a); };
export const SFX = {
  click: on(() => note(1300, 0.05, 'square', 0.03)),
  tone: on((i, len) => note(hz([60, 64, 67, 72][i] + 12), len || 0.28, 'triangle', 0.09)),
  coin: on(() => { note(hz(88), 0.07, 'square', 0.04); note(hz(95), 0.16, 'square', 0.04, 0.06); }),
  bad: on(() => note(150, 0.22, 'sawtooth', 0.05, 0, { to: 70, lp: 700 })),
  step: on(() => { note(420 + Math.random() * 60, 0.07, 'sine', 0.05, 0, { to: 300 }); }),
  push: on(() => { note(130, 0.14, 'triangle', 0.1, 0, { to: 80 }); noise(0.1, 0.04, 0, { f: 500 }); }),
  slide: on(() => noise(0.25, 0.05, 0, { type: 'highpass', f: 3000, q: 0.5 })),
  blocked: on(() => { note(180, 0.12, 'square', 0.05, 0, { to: 120, lp: 600 }); }),
  place: on(() => { [76, 83, 88].forEach((n, i) => note(hz(n), 0.35, 'triangle', 0.06, i * 0.07)); }),
  fill: on(() => { noise(0.4, 0.08, 0, { f: 900, q: 0.4 }); note(300, 0.3, 'sine', 0.06, 0, { to: 120 }); }),
  paint: on(() => { note(hz(72), 0.12, 'sine', 0.05); note(hz(79), 0.14, 'sine', 0.04, 0.06); noise(0.12, 0.03, 0, { f: 2500 }); }),
  key: on(() => { [84, 88, 91, 96].forEach((n, i) => note(hz(n), 0.25, 'square', 0.035, i * 0.06, { lp: 3000 })); }),
  door: on(() => { note(110, 0.4, 'sawtooth', 0.05, 0, { to: 200, lp: 500 }); noise(0.35, 0.05, 0.05, { f: 400 }); }),
  undo: on(() => { note(700, 0.1, 'triangle', 0.05, 0, { to: 350 }); }),
  restart: on(() => { note(500, 0.18, 'triangle', 0.05, 0, { to: 250 }); noise(0.15, 0.03, 0, { f: 1500 }); }),
  win: on(() => { [72, 76, 79, 84, 88, 91, 96].forEach((n, i) => { note(hz(n), 0.4, 'triangle', 0.06, i * 0.09); note(hz(n - 12), 0.4, 'sine', 0.03, i * 0.09); }); [60, 67, 72, 76, 79].forEach(n => note(hz(n), 1.2, 'sawtooth', 0.025, 0.7, { lp: 2400 })); }),
  star: on(i => note(hz(84 + i * 3), 0.3, 'triangle', 0.06))
};
// Hintergrundmusik: sanfte Marimba-Pentatonik, 'menu' ruhiger, 'game' etwas lebhafter
const SC = [60, 62, 64, 67, 69, 72, 74, 76], BASS = [48, 43, 45, 41];
function sched() {
  if (!ac || !musicOn || !musicMode) return; while (nextT < ac.currentTime + 0.3) {
    const t = nextT - ac.currentTime, bpm = musicMode === 'menu' ? 84 : 100, st = 60 / bpm / 2, s = step % 64, bar = (s >> 4) % 4;
    if (s % 8 === 0) note(hz(BASS[bar]), st * 6, 'sine', 0.05, t); if (s % 2 === 0 || (musicMode === 'game' && s % 4 === 3)) { const i = [0, 2, 4, 2, 5, 4, 2, 1, 0, 3, 4, 5, 7, 5, 4, 2][(s >> 1) % 16] ; if ((s * 7 + bar) % 5 !== 0) note(hz(SC[i] + (bar === 2 ? -2 : 0)), st * 1.4, 'triangle', 0.028, t, { atk: 0.004, lp: 2600 }); }
    if (musicMode === 'game' && s % 8 === 4) noise(0.03, 0.012, t, { f: 6000, q: 1 }); nextT += st; step++;
  }
}
export const Music = {
  play(mode) { if (mode === musicMode) return; musicMode = mode; clearInterval(musicTimer); musicTimer = null; step = 0; if (mode && musicOn) { try { ctx(); } catch (e) { return; } nextT = ac.currentTime + 0.05; musicTimer = setInterval(sched, 100); sched(); } },
  setOn(v) { musicOn = v; if (!v) { clearInterval(musicTimer); musicTimer = null; } else if (musicMode) { const m = musicMode; musicMode = null; Music.play(m); } }
};
export const Audio_ = { unlock() { try { ctx(); } catch (e) {} }, setSfx(v) { sfxOn = v; }, get sfx() { return sfxOn; } };
