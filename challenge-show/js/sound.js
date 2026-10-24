/* Die große Challenge-Show – Klänge ohne Dateien (Web Audio): Show-Fanfaren, Publikum, Ampel, Keks-Knacken, Stuhltanz-Musik. */
(function () {
  'use strict';
  let ac = null, master = null, mus = null, musT = null, beat = 0, vol = { sfx: .8, mus: .5 }, style = 'show';
  function ctx() { if (ac) { if (ac.state === 'suspended') ac.resume().catch(() => { }); return ac; } const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; try { ac = new C(); } catch (e) { return null; } master = ac.createGain(); master.gain.value = vol.sfx; master.connect(ac.destination); mus = ac.createGain(); mus.gain.value = vol.mus * .22; mus.connect(ac.destination); return ac; }
  function tone(f, d, type, g, at, slide, out) { const a = ctx(); if (!a) return; const t = a.currentTime + (at || 0), o = a.createOscillator(), v = a.createGain(); o.type = type || 'square'; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, slide), t + d); v.gain.setValueAtTime(g || .15, t); v.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(v); v.connect(out || master); o.start(t); o.stop(t + d + .02); }
  function noise(d, g, f, at, type, out) { const a = ctx(); if (!a) return; const t = a.currentTime + (at || 0), n = Math.floor(a.sampleRate * d), b = a.createBuffer(1, n, a.sampleRate), c = b.getChannelData(0); for (let i = 0; i < n; i++) c[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2); const s = a.createBufferSource(), fl = a.createBiquadFilter(), v = a.createGain(); s.buffer = b; fl.type = type || 'lowpass'; fl.frequency.value = f || 1500; v.gain.value = g || .3; s.connect(fl); fl.connect(v); v.connect(out || master); s.start(t); }
  // Publikum: viele kurze, gefilterte Rauschstöße = Jubel/Applaus
  function crowd(d, g) { for (let i = 0; i < d * 30; i++) noise(.05 + Math.random() * .06, (g || .12) * Math.random(), 1800 + Math.random() * 2500, Math.random() * d, 'bandpass'); }
  const sfx = {
    nav: () => tone(880, .05, 'square', .05), ok: () => { tone(988, .07, 'square', .08); tone(1319, .09, 'square', .07, .06); }, back: () => tone(440, .08, 'square', .06, 0, 330),
    tick: () => tone(1200, .05, 'square', .06), go: () => { tone(880, .12, 'square', .1); tone(1760, .3, 'square', .1, .1); },
    fanfare: () => { [523, 659, 784, 1047, 0, 784, 1047].forEach((f, i) => f && tone(f, .22, 'sawtooth', .07, i * .13)); [262, 330, 392].forEach(f => tone(f, .9, 'triangle', .1, .65)); crowd(1.6, .14); },
    green: () => { tone(660, .12, 'sine', .14); tone(990, .2, 'sine', .14, .1); }, red: () => { tone(330, .35, 'square', .12, 0, 220); noise(.2, .1, 300); },
    turn: () => tone(520, .3, 'triangle', .1, 0, 780),
    out: () => { tone(700, .3, 'sawtooth', .07, 0, 200); noise(.25, .25, 4000, .05, 'highpass'); [1200, 1500, 1800].forEach((f, i) => tone(f, .05, 'square', .03, .2 + i * .04)); },
    safe: () => { [784, 988, 1319].forEach((f, i) => tone(f, .12, 'square', .08, i * .07)); },
    jump: () => tone(320, .16, 'square', .09, 0, 720), land: () => noise(.08, .14, 600), splash: () => { noise(.5, .3, 900); tone(200, .4, 'sine', .1, 0, 80); },
    tap: () => tone(1100, .04, 'square', .06), good: () => { tone(1320, .05, 'square', .07); tone(1760, .06, 'square', .05, .04); },
    crack: () => { noise(.12, .4, 3500, 0, 'highpass'); noise(.2, .2, 900, .06); }, trace: () => tone(1500 + Math.random() * 300, .02, 'sine', .02),
    sit: () => { noise(.08, .2, 500); tone(240, .1, 'triangle', .1); }, dash: () => tone(260, .14, 'sawtooth', .1, 0, 700), bump: () => { tone(140, .15, 'square', .14); noise(.1, .2, 1200); },
    fall: () => tone(600, .7, 'sine', .1, 0, 90), cheer: () => crowd(1.8, .16), clap: () => crowd(.9, .1),
    win: () => { [523, 659, 784, 1047, 1319, 1047, 1319, 1568].forEach((f, i) => tone(f, .25, 'square', .09, i * .12)); crowd(3, .18); },
  };
  // zwei eigene Schleifen: „show“ (Spielshow-Groove) und „chairs“ (Stuhltanz, schneller, Polka-artig)
  const mf = n => 440 * Math.pow(2, (n - 69) / 12);
  const MEL = { show: [72, 0, 76, 79, 77, 76, 74, 0, 71, 74, 77, 76, 74, 72, 71, 0], chairs: [76, 74, 72, 74, 76, 76, 76, 0, 74, 74, 74, 0, 76, 79, 79, 0] };
  const BASS = { show: [48, 48, 53, 53, 55, 55, 48, 52], chairs: [48, 55, 48, 55, 53, 48, 55, 48] };
  function music(on, st, tempo) {
    clearInterval(musT); musT = null; if (st) style = st; if (!on || !ctx()) return; beat = 0; const step = 60 / ((style === 'chairs' ? 170 : 118) * (tempo || 1)) / 2;
    musT = setInterval(() => { if (!ac || ac.state !== 'running') return; const b = beat % 16, M = MEL[style], B = BASS[style];
      if (b % 2 === 0) tone(mf(B[(beat / 2 | 0) % 8] - 12), step * 1.6, 'triangle', .3, 0, 0, mus);
      if (style === 'chairs' && b % 2) tone(mf(B[(beat / 2 | 0) % 8] + 4), step * .5, 'square', .05, 0, 0, mus);
      if (M[b]) tone(mf(M[b]), step * .85, style === 'chairs' ? 'square' : 'triangle', style === 'chairs' ? .06 : .1, 0, 0, mus);
      if (b % 4 === 2) noise(.03, .06, 8000, 0, 'highpass', mus); if (b % 8 === 0) noise(.08, .12, 160, 0, 'lowpass', mus); beat++; }, step * 1000); }
  function setVol(k, v) { vol[k] = v; if (master) master.gain.value = vol.sfx; if (mus) mus.gain.value = vol.mus * .22; }
  window.CSSound = { ctx, sfx, music, setVol };
})();
