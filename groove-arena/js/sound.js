/* Groove Arena – kleine Klänge ohne Dateien (Web Audio). Die Musik kommt aus dem YouTube-Video. */
(function () {
  'use strict';
  let ac = null, master = null;
  function ctx() { if (ac) { if (ac.state === 'suspended') ac.resume().catch(() => { }); return ac; } const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; try { ac = new C(); } catch (e) { return null; } master = ac.createGain(); master.gain.value = .5; master.connect(ac.destination); return ac; }
  function tone(f, d, type, g, at, slide) { const a = ctx(); if (!a) return; const t = a.currentTime + (at || 0), o = a.createOscillator(), v = a.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d); v.gain.setValueAtTime(g || .12, t); v.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(v); v.connect(master); o.start(t); o.stop(t + d + .02); }
  const sfx = {
    nav: () => tone(900, .04, 'square', .04), ok: () => { tone(988, .06, 'square', .06); tone(1319, .08, 'square', .05, .05); }, back: () => tone(440, .07, 'square', .05, 0, 330),
    tap: () => tone(1200, .03, 'square', .05), lock: () => { [660, 880, 1320].forEach((f, i) => tone(f, .1, 'sine', .1, i * .06)); },
    perfect: () => tone(1760, .08, 'sine', .05), gold: () => { [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, .14, 'triangle', .08, i * .05)); },
    finish: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .2, 'triangle', .09, i * .1)); },
  };
  window.GASound = { ctx, sfx };
})();
