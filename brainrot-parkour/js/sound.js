/* Brainrot Parkour – Klänge ohne Dateien (Web Audio) und eine eigene Tarantella-Schleife im 6/8-Takt. */
(function () {
  'use strict';
  let ac = null, master = null, mus = null, musT = null, beat = 0, vol = { sfx: .8, mus: .5 }, tempo = 1;
  function ctx() { if (ac) { if (ac.state === 'suspended') ac.resume().catch(() => { }); return ac; } const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; try { ac = new C(); } catch (e) { return null; } master = ac.createGain(); master.gain.value = vol.sfx; master.connect(ac.destination); mus = ac.createGain(); mus.gain.value = vol.mus * .25; mus.connect(ac.destination); return ac; }
  function tone(f, d, type, g, at, slide, out) { const a = ctx(); if (!a) return; const t = a.currentTime + (at || 0), o = a.createOscillator(), v = a.createGain(); o.type = type || 'square'; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, slide), t + d); v.gain.setValueAtTime(g || .15, t); v.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(v); v.connect(out || master); o.start(t); o.stop(t + d + .02); }
  function noise(d, g, f, at, type) { const a = ctx(); if (!a) return; const t = a.currentTime + (at || 0), n = Math.floor(a.sampleRate * d), b = a.createBuffer(1, n, a.sampleRate), c = b.getChannelData(0); for (let i = 0; i < n; i++) c[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2); const s = a.createBufferSource(), fl = a.createBiquadFilter(), v = a.createGain(); s.buffer = b; fl.type = type || 'lowpass'; fl.frequency.value = f || 1500; v.gain.value = g || .3; s.connect(fl); fl.connect(v); v.connect(master); s.start(t); }
  const sfx = {
    nav: () => tone(880, .05, 'square', .05), ok: () => { tone(988, .07, 'square', .08); tone(1319, .09, 'square', .07, .06); }, back: () => tone(440, .08, 'square', .06, 0, 330),
    jump: () => tone(320, .16, 'square', .09, 0, 720), jump2: () => tone(520, .14, 'triangle', .1, 0, 1100), land: () => noise(.06, .12, 700),
    bounce: () => { tone(200, .35, 'sine', .2, 0, 900); tone(400, .3, 'triangle', .08, .05, 1400); },
    coin: () => { tone(1568, .06, 'square', .07); tone(2093, .12, 'square', .07, .06); },
    check: () => { [784, 988, 1175, 1568].forEach((f, i) => tone(f, .14, 'square', .09, i * .07)); },
    die: () => { tone(900, .5, 'sawtooth', .08, 0, 120); noise(.25, .25, 600, .35); },
    knock: () => { tone(160, .12, 'square', .12); noise(.1, .2, 1200); },
    tile: () => tone(300, .08, 'triangle', .06, 0, 200), crack: () => noise(.18, .2, 2400, 0, 'highpass'),
    goal: () => { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, .2, 'square', .1, i * .1)); noise(.8, .2, 6000, .6, 'highpass'); },
    tick: () => tone(1200, .04, 'square', .06), go: () => tone(1760, .3, 'square', .1),
    right: () => { tone(1046, .08, 'sine', .14); tone(1568, .14, 'sine', .12, .07); }, wrong: () => tone(180, .25, 'square', .1, 0, 120),
  };
  // eigene Melodie (6/8, a-Moll → C-Dur), Bass auf 1 und 4
  const MEL = [69, 72, 76, 74, 72, 71, 72, 71, 69, 68, 69, 71, 72, 74, 76, 77, 76, 74, 72, 74, 72, 71, 69, 0], BASS = [45, 45, 52, 52, 48, 48, 52, 52], mf = n => 440 * Math.pow(2, (n - 69) / 12);
  function music(on, t) { clearInterval(musT); musT = null; if (t) tempo = t; if (!on || !ctx()) return; beat = 0; const step = 60 / (150 * tempo) / 2;
    musT = setInterval(() => { if (!ac || ac.state !== 'running') return; const b = beat % 24; if (b % 3 === 0) tone(mf(BASS[(beat / 3 | 0) % 8] - 12), step * 2.2, 'triangle', .3, 0, 0, mus); if (b % 3 !== 0) tone(mf(BASS[(beat / 3 | 0) % 8] + 7), step * .6, 'square', .04, 0, 0, mus); const m = MEL[b]; if (m) tone(mf(m), step * .9, 'triangle', .1, 0, 0, mus); if (b % 6 === 3) noise(.03, .05, 8000, 0, 'highpass'); beat++; }, step * 1000); }
  function setVol(k, v) { vol[k] = v; if (master) master.gain.value = vol.sfx; if (mus) mus.gain.value = vol.mus * .25; }
  window.BRSound = { ctx, sfx, music, setVol };
})();
