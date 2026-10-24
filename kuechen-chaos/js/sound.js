/* Küchen-Chaos – Klänge (Web Audio, ohne Dateien): Schneiden, Brutzeln, Blubbern, Glocke, Feuer-Alarm, Musik. */
(function () {
  'use strict';
  let ac = null, master = null, mus = null, musT = null, beat = 0, vol = { sfx: .8, mus: .4 }, sizzle = null;
  function ctx() {
    if (ac) { if (ac.state === 'suspended') ac.resume().catch(() => { }); return ac; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; try { ac = new C(); } catch (e) { return null; }
    master = ac.createGain(); master.gain.value = vol.sfx; master.connect(ac.destination); mus = ac.createGain(); mus.gain.value = vol.mus * .3; mus.connect(ac.destination); return ac;
  }
  function tone(f, d, type, g, at, slide, out) { const a = ctx(); if (!a) return; const t = a.currentTime + (at || 0), o = a.createOscillator(), v = a.createGain(); o.type = type || 'square'; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, slide), t + d); v.gain.setValueAtTime(g || .15, t); v.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(v); v.connect(out || master); o.start(t); o.stop(t + d + .02); }
  function noise(d, g, f, at, type) { const a = ctx(); if (!a) return; const t = a.currentTime + (at || 0), n = Math.floor(a.sampleRate * d), b = a.createBuffer(1, n, a.sampleRate), c = b.getChannelData(0); for (let i = 0; i < n; i++) c[i] = (Math.random() * 2 - 1) * (1 - i / n); const s = a.createBufferSource(), fl = a.createBiquadFilter(), v = a.createGain(); s.buffer = b; fl.type = type || 'lowpass'; fl.frequency.value = f || 1500; v.gain.value = g || .3; s.connect(fl); fl.connect(v); v.connect(master); s.start(t); }
  const sfx = {
    pick: () => tone(660, .06, 'triangle', .12), put: () => tone(440, .07, 'triangle', .12), combine: () => { tone(700, .06, 'triangle', .1); tone(990, .08, 'triangle', .08, .05); },
    nope: () => tone(180, .12, 'square', .08), chop: () => noise(.06, .4, 3000, 0, 'highpass'), chopped: () => tone(1100, .08, 'square', .08),
    serve: () => { [1319, 1760].forEach((f, i) => tone(f, .35, 'sine', .2, i * .09)); }, wrong: () => { tone(220, .15, 'square', .12); tone(180, .2, 'square', .12, .12); },
    expire: () => { tone(330, .25, 'sawtooth', .12, 0, 160); }, order: () => tone(880, .1, 'sine', .1),
    fire: () => { for (let i = 0; i < 4; i++) tone(i % 2 ? 660 : 880, .14, 'square', .1, i * .16); }, out: () => noise(.4, .25, 800),
    done: () => { tone(988, .1, 'sine', .14); tone(1319, .14, 'sine', .12, .1); }, warn: () => { tone(1200, .08, 'square', .1); tone(1200, .08, 'square', .1, .15); },
    trash: () => noise(.2, .3, 500), wash: () => noise(.15, .2, 1200, 0, 'bandpass'), washed: () => tone(1500, .08, 'sine', .1),
    dash: () => noise(.15, .2, 2500, 0, 'bandpass'), spray: () => noise(.12, .12, 4000, 0, 'highpass'), plateback: () => tone(1046, .05, 'triangle', .07),
    nav: () => tone(880, .05, 'square', .07), ok: () => { tone(988, .07, 'square', .09); tone(1319, .09, 'square', .07, .06); },
    tick: () => tone(1500, .04, 'square', .06), go: () => { tone(784, .12, 'square', .14); tone(1175, .3, 'square', .14, .12); },
    win: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .3, 'square', .12, i * .12)); }, star: () => tone(1568, .25, 'sine', .16, 0, 2093)
  };
  // Brutzeln: Rauschen, solange etwas brät
  function sizzleOn(n) {
    const a = ctx(); if (!a) return; if (!sizzle) { const len = a.sampleRate, b = a.createBuffer(1, len, a.sampleRate), c = b.getChannelData(0); for (let i = 0; i < len; i++) c[i] = Math.random() * 2 - 1; const s = a.createBufferSource(); s.buffer = b; s.loop = true; const f = a.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 3500; const g = a.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(master); s.start(); sizzle = g; }
    sizzle.gain.setTargetAtTime(Math.min(.12, n * .05), a.currentTime, .2);
  }
  const SONG = { bpm: 132, bass: [48, 48, 55, 55, 53, 53, 55, 50], mel: [72, 0, 76, 79, 76, 0, 72, 74, 76, 0, 74, 72, 69, 0, 71, 0] }, mf = n => 440 * Math.pow(2, (n - 69) / 12);
  function music(on, fast) {
    clearInterval(musT); musT = null; if (!on || !ctx()) return; beat = 0; const step = 60 / (SONG.bpm * (fast ? 1.2 : 1)) / 2;
    musT = setInterval(() => { if (!ac || ac.state !== 'running') return; const b = beat % 16; if (b % 2 === 0) tone(mf(SONG.bass[(beat >> 1) % 8] - 12), step * 1.6, 'triangle', .3, 0, 0, mus); const m = SONG.mel[b]; if (m) tone(mf(m), step * .9, 'square', .06, 0, 0, mus); if (b % 4 === 2) noise(.05, .1, 6000, 0, 'highpass'); beat++; }, step * 1000);
  }
  function setVol(k, v) { vol[k] = v; if (master) master.gain.value = vol.sfx; if (mus) mus.gain.value = vol.mus * .3; }
  window.KCSound = { ctx, sfx, sizzleOn, music, setVol };
})();
