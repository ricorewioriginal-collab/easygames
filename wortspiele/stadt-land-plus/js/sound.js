/* Stadt Land Plus – Klänge (Web Audio, ohne Dateien) */
(function () {
  'use strict';
  let ac = null, master = null, mus = null, musT = null, beat = 0, vol = { sfx: .8, mus: .35 };
  function ctx() { if (ac) { if (ac.state === 'suspended') ac.resume().catch(() => { }); return ac; } const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; try { ac = new C(); } catch (e) { return null; } master = ac.createGain(); master.gain.value = vol.sfx; master.connect(ac.destination); mus = ac.createGain(); mus.gain.value = vol.mus * .3; mus.connect(ac.destination); return ac; }
  function tone(f, d, type, g, at, slide, out) { const a = ctx(); if (!a) return; const t = a.currentTime + (at || 0), o = a.createOscillator(), v = a.createGain(); o.type = type || 'square'; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, slide), t + d); v.gain.setValueAtTime(g || .15, t); v.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(v); v.connect(out || master); o.start(t); o.stop(t + d + .02); }
  function noise(d, g, f, at, type) { const a = ctx(); if (!a) return; const t = a.currentTime + (at || 0), n = Math.floor(a.sampleRate * d), b = a.createBuffer(1, n, a.sampleRate), c = b.getChannelData(0); for (let i = 0; i < n; i++) c[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2); const s = a.createBufferSource(), fl = a.createBiquadFilter(), v = a.createGain(); s.buffer = b; fl.type = type || 'lowpass'; fl.frequency.value = f || 1500; v.gain.value = g || .3; s.connect(fl); fl.connect(v); v.connect(master); s.start(t); }
  const sfx = {
    nav: () => tone(880, .05, 'square', .06), ok: () => { tone(988, .07, 'square', .08); tone(1319, .09, 'square', .07, .06); },
    type: () => noise(.03, .08, 3000, 0, 'highpass'), click: () => tone(1400, .02, 'square', .05),
    roll: () => { for (let i = 0; i < 18; i++) tone(700 + (i % 3) * 120, .03, 'square', .05, i * i * .0075); },
    letter: () => { tone(784, .12, 'sine', .2); tone(1175, .3, 'sine', .18, .1); tone(1568, .4, 'sine', .1, .2); },
    tick: () => tone(1200, .04, 'square', .06), hurry: () => tone(1600, .07, 'square', .1),
    stop: () => { tone(330, .5, 'sawtooth', .14, 0, 360); tone(392, .5, 'sawtooth', .1, .02, 420); },
    end: () => { tone(523, .2, 'square', .12); tone(392, .4, 'square', .12, .18); },
    good: () => { tone(1046, .08, 'sine', .14); tone(1568, .12, 'sine', .12, .07); }, bad: () => tone(180, .2, 'square', .1, 0, 120), maybe: () => tone(700, .15, 'triangle', .1, 0, 900),
    vote: () => tone(1320, .06, 'triangle', .1), score: () => { [659, 784, 988].forEach((f, i) => tone(f, .12, 'square', .1, i * .08)); },
    win: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .28, 'square', .12, i * .11)); noise(.6, .2, 5000, .5, 'highpass'); }
  };
  const SONG = { bpm: 96, bass: [48, 48, 43, 43, 45, 45, 41, 43], mel: [72, 0, 76, 74, 72, 0, 67, 0, 69, 72, 74, 0, 72, 0, 0, 0] }, mf = n => 440 * Math.pow(2, (n - 69) / 12);
  function music(on, fast) { clearInterval(musT); musT = null; if (!on || !ctx()) return; beat = 0; const step = 60 / (SONG.bpm * (fast ? 1.3 : 1)) / 2; musT = setInterval(() => { if (!ac || ac.state !== 'running') return; const b = beat % 16; if (b % 2 === 0) tone(mf(SONG.bass[(beat >> 1) % 8] - 12), step * 1.6, 'triangle', .25, 0, 0, mus); const m = SONG.mel[b]; if (m) tone(mf(m), step * .9, 'sine', .08, 0, 0, mus); if (b % 4 === 2) noise(.04, .06, 7000, 0, 'highpass'); beat++; }, step * 1000); }
  function setVol(k, v) { vol[k] = v; if (master) master.gain.value = vol.sfx; if (mus) mus.gain.value = vol.mus * .3; }
  window.SLFSound = { ctx, sfx, music, setVol };
})();
