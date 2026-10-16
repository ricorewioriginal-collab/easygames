/*! RicoPoly 3D – eigene Audio-Engine: alle Klänge und Musikstücke werden live im Browser erzeugt (Web Audio), keine fremden Aufnahmen. */
(function (root) {
  'use strict';
  var ctx = null, master, music, sfxBus, amb, vol = { master: 0.8, music: 0.45, sfx: 0.8, mute: false }, song = null, ambNode = null, noiseBuf = null;

  function init() {
    if (ctx) return ctx;
    var AC = root.AudioContext || root.webkitAudioContext; if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.connect(ctx.destination);
    music = ctx.createGain(); music.connect(master);
    sfxBus = ctx.createGain(); sfxBus.connect(master);
    amb = ctx.createGain(); amb.connect(music);
    apply();
    var len = ctx.sampleRate; noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate); var d = noiseBuf.getChannelData(0); for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    document.addEventListener('visibilitychange', function () { if (!ctx) return; if (document.hidden) ctx.suspend(); else if (!vol.mute) ctx.resume(); });
    return ctx;
  }
  function unlock() { if (!init()) return; if (ctx.state === 'suspended' && !document.hidden) ctx.resume(); }
  function apply() { if (!ctx) return; master.gain.value = vol.mute ? 0 : vol.master; music.gain.value = vol.music; sfxBus.gain.value = vol.sfx; }
  function set(o) { for (var k in o) if (k in vol) vol[k] = o[k]; apply(); }

  function tone(f, t, dur, type, gain, bus, slide) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain || 0.2, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus || sfxBus); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, dur, freq, gain, q, bus) {
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q || 1;
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(bus || sfxBus); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }
  var SFX = {
    click: function (t) { tone(880, t, 0.06, 'triangle', 0.12); },
    hover: function (t) { tone(1320, t, 0.03, 'sine', 0.04); },
    dice: function (t) { for (var i = 0; i < 7; i++) noise(t + i * 0.09 + Math.random() * 0.04, 0.05, 2500 + Math.random() * 2000, 0.25, 4); },
    diceHit: function (t) { noise(t, 0.08, 900, 0.35, 2); },
    step: function (t) { noise(t, 0.04, 400, 0.08, 3); },
    coin: function (t) { tone(1568, t, 0.08, 'square', 0.06); tone(2093, t + 0.07, 0.18, 'square', 0.06); },
    pay: function (t) { for (var i = 0; i < 3; i++) { tone(1400 - i * 150, t + i * 0.06, 0.1, 'square', 0.05); } },
    bigpay: function (t) { for (var i = 0; i < 6; i++) tone(1200 - i * 120, t + i * 0.05, 0.12, 'square', 0.06); tone(110, t, 0.5, 'sawtooth', 0.12, null, 70); },
    buy: function (t) { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, t + i * 0.07, 0.22, 'triangle', 0.14); }); },
    build: function (t) { noise(t, 0.12, 300, 0.4, 1); tone(196, t, 0.18, 'square', 0.08, null, 98); tone(392, t + 0.12, 0.15, 'triangle', 0.1); },
    card: function (t) { noise(t, 0.15, 3000, 0.12, 0.8); tone(660, t + 0.1, 0.15, 'sine', 0.1); tone(990, t + 0.18, 0.2, 'sine', 0.1); },
    bonus: function (t) { [784, 988, 1175, 1568].forEach(function (f, i) { tone(f, t + i * 0.06, 0.25, 'sine', 0.12); }); },
    jail: function (t) { tone(220, t, 0.35, 'sawtooth', 0.12, null, 110); noise(t + 0.25, 0.25, 600, 0.3, 2); tone(160, t + 0.3, 0.4, 'square', 0.08); },
    free: function (t) { [392, 523, 659].forEach(function (f, i) { tone(f, t + i * 0.08, 0.2, 'triangle', 0.12); }); },
    bid: function (t) { tone(740, t, 0.08, 'square', 0.08); },
    gavel: function (t) { noise(t, 0.12, 500, 0.5, 1.5); noise(t + 0.18, 0.15, 450, 0.5, 1.5); },
    trade: function (t) { tone(587, t, 0.12, 'triangle', 0.12); tone(880, t + 0.1, 0.2, 'triangle', 0.12); },
    error: function (t) { tone(200, t, 0.18, 'square', 0.08, null, 150); },
    turn: function (t) { tone(660, t, 0.1, 'sine', 0.08); tone(880, t + 0.08, 0.12, 'sine', 0.08); },
    bankrupt: function (t) { [392, 349, 311, 262].forEach(function (f, i) { tone(f, t + i * 0.18, 0.3, 'sawtooth', 0.1); }); },
    win: function (t) { [523, 659, 784, 1047, 784, 1047, 1319].forEach(function (f, i) { tone(f, t + i * 0.12, 0.35, 'triangle', 0.16); }); },
    achievement: function (t) { [1047, 1319, 1568, 2093].forEach(function (f, i) { tone(f, t + i * 0.05, 0.3, 'sine', 0.1); }); },
    cheer: function (t) { noise(t, 0.6, 1500, 0.18, 0.4); tone(523, t, 0.2, 'triangle', 0.08); },
    groan: function (t) { tone(300, t, 0.5, 'sawtooth', 0.06, null, 180); }
  };
  function sfx(name) { if (!ctx || vol.mute || ctx.state !== 'running') return; var f = SFX[name]; if (f) try { f(ctx.currentTime + 0.01); } catch (e) {} }

  // ---------- Musik: kleiner Sequenzer je Welt (Bass, Akkord, Melodie aus der Weltskala) ----------
  function playSong(cfg) {
    stopSong();
    if (!ctx || !cfg) return;
    var step = 60 / cfg.tempo / 2, t0 = ctx.currentTime + 0.1, n = 0, seed = cfg.root * 7 + cfg.tempo;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    var prog = [0, 3, 4, 2].map(function (d) { return cfg.scale[d % cfg.scale.length]; }), melody = [];
    for (var i = 0; i < 32; i++) melody.push(rnd() < 0.62 ? cfg.scale[Math.floor(rnd() * cfg.scale.length)] + (rnd() < 0.3 ? 12 : 0) : null);
    function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
    song = { timer: setInterval(function () {
      if (!ctx || ctx.state !== 'running') return;
      while (t0 < ctx.currentTime + 0.4) {
        var bar = Math.floor(n / 8) % 4, chord = cfg.root + prog[bar], pos = n % 8;
        if (pos === 0 || pos === 4) tone(hz(chord - 12), t0, step * 3.5, 'triangle', 0.09, music);
        if (pos === 0) [0, 4, 7].forEach(function (iv) { tone(hz(chord + 12 + iv), t0, step * 7, cfg.wave === 'sawtooth' ? 'triangle' : 'sine', 0.025, music); });
        var m = melody[n % 32]; if (m != null) tone(hz(cfg.root + 24 + m), t0, step * 1.6, cfg.wave, cfg.wave === 'sawtooth' ? 0.018 : 0.04, music);
        if (pos % 2 === 0) noise(t0, 0.03, cfg.wave === 'sawtooth' ? 8000 : 6000, 0.03, 1, music);
        t0 += step; n++;
      }
    }, 120) };
  }
  function stopSong() { if (song) { clearInterval(song.timer); song = null; } }
  // Umgebungsgeräusche: gefiltertes Rauschen plus kleine Ereignisse (Vögel, Hupen, Summen)
  function ambience(kind) {
    if (ambNode) { try { ambNode.s.stop(); } catch (e) {} clearInterval(ambNode.iv); ambNode = null; }
    if (!ctx || !kind) return;
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; s.loop = true; f.type = 'lowpass'; f.frequency.value = kind === 'city' ? 500 : kind === 'forest' ? 1200 : 300; g.gain.value = kind === 'forest' ? 0.025 : 0.035;
    s.connect(f); f.connect(g); g.connect(amb); s.start();
    var iv = setInterval(function () {
      if (!ctx || ctx.state !== 'running' || Math.random() < 0.5) return;
      var t = ctx.currentTime;
      if (kind === 'forest') { var b = 2500 + Math.random() * 1500; tone(b, t, 0.08, 'sine', 0.02, amb, b * 1.3); tone(b * 1.1, t + 0.12, 0.08, 'sine', 0.018, amb, b * 1.4); }
      else if (kind === 'city') { if (Math.random() < 0.3) { tone(440, t, 0.25, 'square', 0.012, amb); tone(554, t, 0.25, 'square', 0.012, amb); } else noise(t, 1.2, 250, 0.02, 0.5, amb); }
      else { tone(110 + Math.random() * 60, t, 1.5, 'sawtooth', 0.01, amb, 220); }
    }, 1800);
    ambNode = { s: s, iv: iv };
  }

  root.RicoAudio = { unlock: unlock, set: set, vol: vol, sfx: sfx, playSong: function (c) { if (init()) playSong(c); }, stopSong: stopSong, ambience: function (k) { if (init()) ambience(k); } };
})(typeof self !== 'undefined' ? self : this);
