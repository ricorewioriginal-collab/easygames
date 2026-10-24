/* Konfetti-Party – Klänge (Web Audio, ohne Dateien): Bonbon legen, Konfetti-Knall, Karton, Extras, Tröte, Musik. */
(function () {
  'use strict';
  let ac = null, master = null, mus = null, musT = null, beat = 0, vol = { sfx: .8, mus: .4 };
  function ctx() { if (ac) { if (ac.state === 'suspended') ac.resume().catch(() => { }); return ac; } const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; try { ac = new C(); } catch (e) { return null; } master = ac.createGain(); master.gain.value = vol.sfx; master.connect(ac.destination); mus = ac.createGain(); mus.gain.value = vol.mus * .3; mus.connect(ac.destination); return ac; }
  function tone(f, d, type, g, at, slide, out) { const a = ctx(); if (!a) return; const t = a.currentTime + (at || 0), o = a.createOscillator(), v = a.createGain(); o.type = type || 'square'; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, slide), t + d); v.gain.setValueAtTime(g || .15, t); v.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(v); v.connect(out || master); o.start(t); o.stop(t + d + .02); }
  function noise(d, g, f, at, type) { const a = ctx(); if (!a) return; const t = a.currentTime + (at || 0), n = Math.floor(a.sampleRate * d), b = a.createBuffer(1, n, a.sampleRate), c = b.getChannelData(0); for (let i = 0; i < n; i++) c[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2); const s = a.createBufferSource(), fl = a.createBiquadFilter(), v = a.createGain(); s.buffer = b; fl.type = type || 'lowpass'; fl.frequency.value = f || 1500; v.gain.value = g || .3; s.connect(fl); fl.connect(v); v.connect(master); s.start(t); }
  let lastBoom = 0;
  const sfx = {
    place: () => { tone(520, .08, 'triangle', .14); tone(780, .06, 'triangle', .08, .05); },
    boom: () => { const a = ctx(); if (!a || a.currentTime - lastBoom < .05) return; lastBoom = a.currentTime; noise(.45, .5, 1800); noise(.2, .3, 6000, .02, 'highpass'); tone(160, .3, 'sine', .3, 0, 50); },
    crate: () => { noise(.12, .25, 900, 0, 'bandpass'); tone(300, .08, 'square', .06); },
    power: () => { [784, 988, 1319].forEach((f, i) => tone(f, .1, 'square', .1, i * .06)); },
    wirr: () => { tone(600, .4, 'sine', .14, 0, 200); tone(300, .4, 'sine', .1, .1, 900); },
    out: () => { tone(900, .5, 'sawtooth', .12, 0, 120); noise(.3, .2, 3000, .1, 'highpass'); },
    shield: () => { noise(.2, .3, 2500, 0, 'highpass'); tone(500, .2, 'sine', .12, 0, 900); },
    kick: () => tone(220, .08, 'square', .12, 0, 120), drop: () => tone(140, .12, 'square', .1, 0, 70),
    tick: () => tone(1200, .05, 'square', .07), go: () => { tone(784, .12, 'square', .14); tone(1175, .32, 'square', .14, .12); },
    win: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .28, 'square', .12, i * .11)); noise(.6, .2, 5000, .5, 'highpass'); },
    lose: () => { [392, 349, 311, 262].forEach((f, i) => tone(f, .3, 'triangle', .13, i * .18)); },
    horn: () => { tone(330, .5, 'sawtooth', .14, 0, 360); tone(332, .5, 'square', .06, 0, 362); },
    nav: () => tone(880, .05, 'square', .07), ok: () => { tone(988, .07, 'square', .09); tone(1319, .09, 'square', .07, .06); }, hurry: () => { tone(1500, .08, 'square', .1); tone(1500, .08, 'square', .1, .15); }
  };
  const SONG = { bpm: 128, bass: [45, 45, 52, 52, 50, 50, 52, 47], mel: [69, 72, 76, 0, 74, 72, 74, 0, 76, 79, 76, 74, 72, 0, 69, 0] }, mf = n => 440 * Math.pow(2, (n - 69) / 12);
  function music(on, fast) {
    clearInterval(musT); musT = null; if (!on || !ctx()) return; beat = 0; const step = 60 / (SONG.bpm * (fast ? 1.25 : 1)) / 2;
    musT = setInterval(() => { if (!ac || ac.state !== 'running') return; const b = beat % 16; if (b % 2 === 0) tone(mf(SONG.bass[(beat >> 1) % 8] - 12), step * 1.6, 'triangle', .3, 0, 0, mus); const m = SONG.mel[b]; if (m) tone(mf(m), step * .9, 'square', .06, 0, 0, mus); if (b % 4 === 0) tone(60, .12, 'sine', .35, 0, 40, mus); if (b % 4 === 2) noise(.05, .1, 6000, 0, 'highpass'); beat++; }, step * 1000);
  }
  function setVol(k, v) { vol[k] = v; if (master) master.gain.value = vol.sfx; if (mus) mus.gain.value = vol.mus * .3; }
  window.KPSound = { ctx, sfx, music, setVol };
})();
