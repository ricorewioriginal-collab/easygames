/* ColorPop Universe – Ton. Alles prozedural mit WebAudio (keine Audiodateien): eigene Musik je Welt (Tonleiter, Tempo, Klangfarbe)
 * mit Intensitätsstufe, dazu Effekte für Knallen, Fallen, Sondersteine, Sterne und Rekorde. AudioContext erst nach der ersten Eingabe,
 * Musik pausiert bei verborgener Seite. Musik und Effekte getrennt regelbar. */
(function (root) {
  'use strict';
  var CPU = root.CPU || (root.CPU = {});
  var AC = root.AudioContext || root.webkitAudioContext;
  var ctx = null, master = null, mus = null, fx = null, noiseBuf = null;
  var vol = { music: 0.5, sfx: 0.8, musicOn: true, sfxOn: true };
  var song = null, timer = 0, intensity = 0, lastPop = 0;

  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function ensure() {
    if (ctx || !AC) return ctx;
    try {
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
      var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(master);
      mus = ctx.createGain(); mus.connect(comp); fx = ctx.createGain(); fx.connect(comp);
      var len = Math.floor(ctx.sampleRate * 0.5); noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0), s = 1; for (var i = 0; i < len; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 1073741823.5) - 1; }
      apply();
    } catch (e) { ctx = null; }
    return ctx;
  }
  function apply() {
    if (!ctx) return;
    var t = ctx.currentTime;
    mus.gain.setTargetAtTime(vol.musicOn ? vol.music * 0.32 : 0, t, 0.08);
    fx.gain.setTargetAtTime(vol.sfxOn ? vol.sfx * 0.7 : 0, t, 0.03);
  }
  function ok(kind) { return ctx && ctx.state === 'running' && (kind === 'm' ? vol.musicOn && vol.music > 0 : vol.sfxOn && vol.sfx > 0); }

  // Ein Ton mit Hüllkurve
  function tone(dest, f, t, dur, o) {
    o = o || {};
    var osc = ctx.createOscillator(), g = ctx.createGain(), a = o.a || 0.006, peak = o.v == null ? 0.3 : o.v;
    osc.type = o.wave || 'sine'; osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + dur);
    if (o.detune) osc.detune.value = o.detune;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    var out = g;
    if (o.lp) { var flt = ctx.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = o.lp; g.connect(flt); out = flt; }
    osc.connect(g); out.connect(dest);
    osc.start(t); osc.stop(t + dur + 0.03);
  }
  function noise(dest, t, dur, o) {
    o = o || {};
    var src = ctx.createBufferSource(), g = ctx.createGain(), flt = ctx.createBiquadFilter();
    src.buffer = noiseBuf; flt.type = o.type || 'bandpass'; flt.frequency.setValueAtTime(o.f || 3000, t); if (o.to) flt.frequency.exponentialRampToValueAtTime(o.to, t + dur); flt.Q.value = o.q || 1;
    g.gain.setValueAtTime(o.v || 0.2, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(flt); flt.connect(g); g.connect(dest); src.start(t, Math.random() * 0.3); src.stop(t + dur + 0.02);
  }

  // ---------- Musik ----------
  // Muster entstehen deterministisch aus der Welt: Bass, Akkordfläche, Arpeggio; Intensität fügt Hi-Hat und dichteres Arpeggio hinzu.
  function makeSong(world, mood) {
    var w = CPU.WORLDS[(world || 1) - 1] || CPU.WORLDS[0], m = w.music, r = CPU.rng(CPU.hash('cpu-music-' + w.key));
    var bpm = mood === 'calm' ? Math.round(m.bpm * 0.8) : mood === 'fast' ? Math.round(m.bpm * 1.18) : m.bpm;
    var sc = m.scale, prog = [0, 3, 4, 2].map(function (k) { return (k + r.int(2)) % sc.length; }), arp = [], i;
    for (i = 0; i < 16; i++) arp.push(r.int(100) < 72 ? r.int(sc.length) + (r.int(3) === 0 ? sc.length : 0) : -1);
    return { root: m.root, scale: sc, bpm: bpm, wave: m.wave, prog: prog, arp: arp, step: 0, next: 0, calm: mood === 'calm' };
  }
  function deg(s, d) { var n = s.scale.length, o = Math.floor(d / n); return s.root + s.scale[((d % n) + n) % n] + 12 * o; }
  function schedule() {
    if (!song || !ctx) return;
    if (!ok('m')) { song.next = ctx.currentTime + 0.05; return; }
    var spb = 60 / song.bpm / 4, ahead = ctx.currentTime + 0.25;
    if (song.next < ctx.currentTime) song.next = ctx.currentTime + 0.05;
    while (song.next < ahead) {
      var t = song.next, st = song.step % 64, bar = Math.floor(st / 16), beat = st % 16, ch = song.prog[bar], wv = song.wave === 'sawtooth' ? 'triangle' : song.wave;
      if (beat === 0) {   // Akkordfläche
        [0, 2, 4].forEach(function (k) { tone(mus, mtof(deg(song, ch + k) - 12), t, spb * 15, { wave: 'sine', v: song.calm ? 0.05 : 0.04, a: 0.25 }); });
      }
      if (beat % 8 === 0 || (!song.calm && beat === 10)) tone(mus, mtof(deg(song, ch) - 24), t, spb * 3.2, { wave: 'triangle', v: 0.16, a: 0.01, lp: 600 });
      var a = song.arp[beat], dense = intensity > 0.5 || beat % 2 === 0;
      if (a >= 0 && dense && !(song.calm && beat % 4)) tone(mus, mtof(deg(song, ch + a) + 12), t, spb * 1.6, { wave: wv, v: 0.06 + intensity * 0.03, a: 0.005, lp: song.wave === 'sawtooth' ? 2200 : 5000 });
      if (!song.calm && intensity > 0.25 && beat % 2 === 0) noise(mus, t, 0.04, { f: 8000, type: 'highpass', v: beat % 4 ? 0.03 : 0.06 });
      if (!song.calm && intensity > 0.7 && beat % 8 === 4) noise(mus, t, 0.12, { f: 1800, v: 0.08 });
      song.step++; song.next += spb;
    }
  }

  var A = {
    // Erste Eingabe: Kontext anlegen bzw. fortsetzen (Browser verlangen eine Geste)
    unlock: function () { if (!ensure()) return; if (ctx.state === 'suspended' && !document.hidden) { try { ctx.resume(); } catch (e) {} } },
    available: function () { return !!AC; },
    set: function (s) { vol.music = +s.music || 0; vol.sfx = +s.sfx || 0; vol.musicOn = !!s.musicOn; vol.sfxOn = !!s.sfxOn; apply(); },
    music: function (world, mood) {
      var key = (world || 1) + '/' + (mood || 'normal');
      if (song && song.key === key) return;
      song = makeSong(world, mood); song.key = key; song.next = 0;
      if (!timer) timer = setInterval(schedule, 90);
    },
    stopMusic: function () { song = null; if (timer) { clearInterval(timer); timer = 0; } },
    intensity: function (x) { intensity = Math.max(0, Math.min(1, x)); },
    // Seite verborgen → alles anhalten (spart Akku), sichtbar → weiter
    visibility: function (hidden) { if (!ctx) return; try { if (hidden) ctx.suspend(); else ctx.resume(); } catch (e) {} },
    sfx: function (name, o) {
      if (!ok('s')) return;
      o = o || {};
      var t = ctx.currentTime + 0.005, n;
      switch (name) {
        case 'pop':   // Tonhöhe steigt mit Gruppengröße und Combo
          n = o.n || 2; if (t - lastPop < 0.03) return; lastPop = t;
          var f = 330 * Math.pow(2, Math.min(24, (n - 2) * 0.9 + (o.combo || 0)) / 12);
          tone(fx, f, t, 0.12, { wave: 'triangle', v: 0.32, to: f * 1.6 });
          tone(fx, f * 2, t + 0.02, 0.09, { wave: 'sine', v: 0.12 });
          noise(fx, t, 0.05, { f: 2500 + n * 100, v: 0.12, q: 2 });
          if (n >= 8) { tone(fx, f * 1.5, t + 0.06, 0.2, { wave: 'sine', v: 0.14 }); }
          if (n >= 14) noise(fx, t, 0.35, { f: 600, to: 120, type: 'lowpass', v: 0.25 });
          break;
        case 'fall': tone(fx, 140, t, 0.08, { wave: 'sine', v: 0.12, to: 70 }); break;
        case 'bomb': noise(fx, t, 0.5, { f: 900, to: 80, type: 'lowpass', v: 0.5 }); tone(fx, 90, t, 0.4, { wave: 'sine', v: 0.4, to: 40 }); break;
        case 'rocket': noise(fx, t, 0.3, { f: 600, to: 6000, v: 0.25, q: 4 }); tone(fx, 300, t, 0.25, { wave: 'sawtooth', v: 0.07, to: 1600, lp: 3000 }); break;
        case 'chain': for (var k = 0; k < 4; k++) tone(fx, 900 + k * 220, t + k * 0.035, 0.06, { wave: 'square', v: 0.05, lp: 4000 }); break;
        case 'magic': [0, 4, 7, 12].forEach(function (s, k) { tone(fx, mtof(76 + s), t + k * 0.05, 0.25, { wave: 'sine', v: 0.12 }); }); break;
        case 'ice': noise(fx, t, 0.12, { f: 6000, v: 0.18, q: 6 }); tone(fx, 2600, t, 0.08, { wave: 'sine', v: 0.06 }); break;
        case 'block': noise(fx, t, 0.16, { f: 500, v: 0.3, q: 1.5 }); break;
        case 'item': [0, 7, 12].forEach(function (s, k) { tone(fx, mtof(79 + s), t + k * 0.07, 0.3, { wave: 'triangle', v: 0.16 }); }); break;
        case 'clear': [0, 4, 7, 12, 16, 19, 24].forEach(function (s, k) { tone(fx, mtof(67 + s), t + k * 0.06, 0.4, { wave: 'triangle', v: 0.16 }); }); break;
        case 'star': tone(fx, mtof(84 + (o.k || 0) * 4), t, 0.5, { wave: 'sine', v: 0.22 }); tone(fx, mtof(96 + (o.k || 0) * 4), t, 0.3, { wave: 'sine', v: 0.06 }); break;
        case 'record': [0, 4, 7, 4, 7, 12].forEach(function (s, k) { tone(fx, mtof(72 + s), t + k * 0.09, k === 5 ? 0.6 : 0.16, { wave: 'square', v: 0.07, lp: 3500 }); }); break;
        case 'win': [0, 7, 12, 16].forEach(function (s, k) { tone(fx, mtof(64 + s), t + k * 0.11, 0.5, { wave: 'triangle', v: 0.16 }); }); break;
        case 'lose': [7, 4, 0, -5].forEach(function (s, k) { tone(fx, mtof(64 + s), t + k * 0.13, 0.3, { wave: 'triangle', v: 0.13 }); }); break;
        case 'invalid': tone(fx, 150, t, 0.12, { wave: 'square', v: 0.07, lp: 800 }); tone(fx, 120, t + 0.06, 0.12, { wave: 'square', v: 0.06, lp: 800 }); break;
        case 'click': tone(fx, 1400, t, 0.03, { wave: 'sine', v: 0.08 }); break;
        case 'hover': tone(fx, 900 + (o.n || 0) * 30, t, 0.03, { wave: 'sine', v: 0.03 }); break;
        case 'tick': tone(fx, 1800, t, 0.04, { wave: 'square', v: 0.04, lp: 3000 }); break;
        case 'gravity': tone(fx, 200, t, 0.35, { wave: 'sine', v: 0.18, to: 600 }); break;
        case 'ach': [0, 4, 7, 11, 14].forEach(function (s, k) { tone(fx, mtof(74 + s), t + k * 0.05, 0.35, { wave: 'sine', v: 0.12 }); }); break;
      }
    }
  };
  CPU.audio = A;
})(typeof window !== 'undefined' ? window : globalThis);
