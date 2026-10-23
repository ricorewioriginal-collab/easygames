// Winzflitzer 3D – Klang: Motoren, Effekte und Musik, alles live erzeugt (keine Audiodateien)
'use strict';
var WF = window.WF = window.WF || {};

(function () {
  var ctx = null, master = null, sfxG = null, musG = null, noiseBuf = null, engines = [], music = null;
  var A = WF.Audio = { sfx: true, music: true };

  A.init = function () {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try { ctx = new AC(); } catch (e) { return; }
    master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
    sfxG = ctx.createGain(); sfxG.connect(master); musG = ctx.createGain(); musG.gain.value = 0.22; musG.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    A.apply();
  };
  A.apply = function () {
    if (!ctx) return;
    sfxG.gain.setTargetAtTime(A.sfx ? 1 : 0, ctx.currentTime, 0.05);
    musG.gain.setTargetAtTime(A.music ? 0.22 : 0, ctx.currentTime, 0.1);
  };
  A.suspend = function (on) { if (!ctx) return; if (on) ctx.suspend(); else ctx.resume(); };

  function env(g, t, a, peak, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
  function tone(type, f0, f1, dur, vol, delay) {
    if (!ctx || !A.sfx) return; var t = ctx.currentTime + (delay || 0), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    env(g, t, 0.01, vol, dur); o.connect(g); g.connect(sfxG); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol, fq, q, type, delay, f1) {
    if (!ctx || !A.sfx) return; var t = ctx.currentTime + (delay || 0), s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = type || 'lowpass'; f.frequency.setValueAtTime(fq, t); if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur); f.Q.value = q || 1;
    env(g, t, 0.005, vol, dur); s.connect(f); f.connect(g); g.connect(sfxG); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }

  A.play = function (k, v) {
    v = v == null ? 1 : v;
    switch (k) {
      case 'beep': tone('square', 520, 0, 0.16, 0.18); break;
      case 'go': tone('square', 1040, 0, 0.35, 0.2); break;
      case 'bump': noise(0.12, 0.35 * v, 900, 1); tone('sine', 140, 70, 0.12, 0.25 * v); break;
      case 'wall': noise(0.1, 0.3 * v, 500, 1); break;
      case 'fall': tone('sine', 900, 160, 0.9, 0.16); break;
      case 'land': tone('sine', 120, 50, 0.16, 0.3 * v); break;
      case 'lap': tone('triangle', 880, 0, 0.12, 0.2); tone('triangle', 1320, 0, 0.25, 0.2, 0.1); break;
      case 'finish': [523, 659, 784, 1047].forEach(function (f, i) { tone('triangle', f, 0, 0.3, 0.2, i * 0.12); }); break;
      case 'lose': [392, 330, 262].forEach(function (f, i) { tone('triangle', f, 0, 0.35, 0.18, i * 0.18); }); break;
      case 'boost': noise(0.45, 0.25, 400, 2, 'bandpass', 0, 3000); break;
      case 'shot': noise(0.18, 0.4, 1800, 1, 'lowpass', 0, 300); tone('square', 220, 80, 0.12, 0.15); break;
      case 'boom': noise(0.5, 0.45, 600, 1, 'lowpass', 0, 80); break;
      case 'clack': tone('sine', 2400, 1800, 0.05, 0.25 * v); break;
      case 'splash': noise(0.35, 0.25, 2500, 0.7, 'highpass'); break;
      case 'click': tone('square', 700, 0, 0.05, 0.08); break;
      case 'point': tone('triangle', 660, 990, 0.25, 0.22); break;
      case 'out': tone('sawtooth', 300, 120, 0.4, 0.14); break;
    }
  };

  // Motoren: je menschlichem Fahrer ein Klang
  A.engines = function (types) {
    engines.forEach(function (e) { try { e.o1.stop(); e.o2.stop(); if (e.lfo) e.lfo.stop(); } catch (er) {} e.g.disconnect(); });
    engines = [];
    if (!ctx) return;
    types.forEach(function (tp) {
      var o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(), e = { o1: o1, o2: o2, f: f, g: g, tp: tp };
      o1.type = tp === 'tank' || tp === 'monster' ? 'square' : 'sawtooth'; o2.type = 'square';
      f.type = 'lowpass'; f.frequency.value = 600; g.gain.value = 0;
      o1.connect(f); o2.connect(f); f.connect(g); g.connect(sfxG);
      if (tp === 'heli') { var lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 16; lg.gain.value = 0.5; lfo.connect(lg); lg.connect(g.gain); lfo.start(); e.lfo = lfo; }
      o1.start(); o2.start(); engines.push(e);
    });
  };
  var BASE = { sport: 70, formula: 95, boat: 50, heli: 40, offroad: 55, mini: 85, tank: 32, monster: 45 };
  A.engine = function (i, ratio, on, boost) {
    var e = engines[i]; if (!e || !ctx) return;
    var t = ctx.currentTime, b = BASE[e.tp] || 60, f = b * (1 + ratio * 2.2) * (boost ? 1.15 : 1);
    e.o1.frequency.setTargetAtTime(f, t, 0.05); e.o2.frequency.setTargetAtTime(f * 0.501, t, 0.05);
    e.f.frequency.setTargetAtTime(350 + ratio * 1400, t, 0.08);
    e.g.gain.setTargetAtTime(on ? (0.035 + ratio * 0.05) / Math.max(1, engines.length * 0.7) : 0, t, 0.08);
  };

  // Musik: kleine Schleifen je Welt (Bass + Melodie), Takt per Vorausplanung
  var SCALES = [[0, 2, 4, 7, 9], [0, 3, 5, 7, 10], [0, 2, 4, 5, 7, 9, 11], [0, 2, 3, 5, 7, 8, 10]];
  A.song = function (n) {
    if (music) { clearInterval(music.iv); music = null; }
    if (!ctx || n == null) return;
    var r = WF.rng(n * 977 + 3), sc = SCALES[n % SCALES.length], root = 45 + (n * 5) % 12, bpm = 112 + (n % 4) * 8, spb = 60 / bpm / 2;
    var bass = [], lead = [];
    for (var i = 0; i < 16; i++) { bass.push(i % 4 === 0 ? 0 : (i % 4 === 2 ? sc[(r() * 3) | 0] : (r() < 0.3 ? 12 : -1))); lead.push(r() < 0.55 ? sc[(r() * sc.length) | 0] + 12 + (r() < 0.3 ? 12 : 0) : -1); }
    var prog = [0, 5, 3, 4].map(function (k) { return sc[k % sc.length]; });
    music = { step: 0, next: ctx.currentTime + 0.1 };
    music.iv = setInterval(function () {
      if (!ctx || ctx.state !== 'running') return;
      while (music.next < ctx.currentTime + 0.25) {
        var s = music.step % 16, bar = Math.floor(music.step / 16) % 4, tr = prog[bar];
        if (bass[s] >= 0) note('triangle', root + tr + bass[s] - 12, music.next, spb * 1.6, 0.5);
        if (lead[s] >= 0 && Math.floor(music.step / 64) % 2 === 1 || (lead[s] >= 0 && s < 8)) note('square', root + tr + lead[s], music.next, spb * 0.9, 0.16);
        if (s % 4 === 0) drum(music.next, 0); if (s % 8 === 4) drum(music.next, 1); if (s % 2 === 1) drum(music.next, 2);
        music.next += spb; music.step++;
      }
    }, 90);
  };
  function note(type, midi, t, dur, vol) {
    var o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(musG); o.start(t); o.stop(t + dur + 0.02);
  }
  function drum(t, k) {
    if (k === 0) { var o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12); g.gain.setValueAtTime(0.7, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15); o.connect(g); g.connect(musG); o.start(t); o.stop(t + 0.2); return; }
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g2 = ctx.createGain(); s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = k === 1 ? 1500 : 6000;
    g2.gain.setValueAtTime(k === 1 ? 0.35 : 0.08, t); g2.gain.exponentialRampToValueAtTime(0.0001, t + (k === 1 ? 0.12 : 0.04)); s.connect(f); f.connect(g2); g2.connect(musG); s.start(t, Math.random() * 0.5); s.stop(t + 0.15);
  }
})();
