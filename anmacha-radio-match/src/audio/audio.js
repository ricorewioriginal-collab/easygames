/* Royal Radio Match 3D – Klänge und Musik, komplett im Browser erzeugt (WebAudio, kein fremdes Audiomaterial).
 * Startet erst nach der ersten Nutzeraktion (Autoplay-Regeln). Musik und Effekte getrennt schaltbar. */
(function (root) {
  'use strict';
  var RRM = root.RRM || (root.RRM = {});
  var ac = null, master = null, sfxBus = null, musBus = null, on = { sfx: true, music: true }, musTimer = 0, musWorld = -1, step = 0;

  function ctx() {
    if (!ac) {
      try {
        ac = new (root.AudioContext || root.webkitAudioContext)();
        master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
        sfxBus = ac.createGain(); sfxBus.gain.value = 0.55; sfxBus.connect(master);
        musBus = ac.createGain(); musBus.gain.value = 0.16; musBus.connect(master);
      } catch (e) { ac = null; }
    }
    if (ac && ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(f, d, type, v, at, bus, glide) {
    if (!ac) return;
    var t = ac.currentTime + (at || 0), o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v || 0.2, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(bus || sfxBus); o.start(t); o.stop(t + d + 0.03);
  }
  var noiseBuf = null;
  function noise(d, v, at, hp, bus) {
    if (!ac) return;
    if (!noiseBuf) { noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate); var a = noiseBuf.getChannelData(0); for (var i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; }
    var t = ac.currentTime + (at || 0), s = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter();
    s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = hp || 1200;
    g.gain.setValueAtTime(v || 0.15, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(f); f.connect(g); g.connect(bus || sfxBus); s.start(t); s.stop(t + d + 0.02);
  }
  var S = {
    click: function () { tone(660, 0.05, 'triangle', 0.12); },
    swap: function () { tone(420, 0.07, 'triangle', 0.14, 0, null, 560); },
    bad: function () { tone(220, 0.1, 'square', 0.06); tone(170, 0.12, 'square', 0.06, 0.07); },
    match: function (combo) { var f = 523 * Math.pow(1.0595, Math.min(14, (combo - 1) * 2)); tone(f, 0.11, 'sine', 0.22); tone(f * 1.5, 0.13, 'triangle', 0.1, 0.04); noise(0.06, 0.05, 0, 3000); },
    special: function () { [659, 880, 1175].forEach(function (f, i) { tone(f, 0.12, 'triangle', 0.14, i * 0.05); }); },
    rocket: function () { noise(0.35, 0.18, 0, 800); tone(300, 0.3, 'sawtooth', 0.06, 0, null, 1400); },
    bomb: function () { tone(110, 0.45, 'sine', 0.5, 0, null, 40); noise(0.25, 0.2, 0, 200); },
    orb: function () { for (var i = 0; i < 6; i++) tone(880 + i * 180, 0.16, 'sine', 0.08, i * 0.04); },
    drone: function () { tone(180, 0.35, 'sawtooth', 0.05, 0, null, 360); },
    block: function () { noise(0.12, 0.14, 0, 600); tone(240, 0.08, 'square', 0.05); },
    collect: function () { tone(988, 0.1, 'sine', 0.18); tone(1319, 0.16, 'sine', 0.16, 0.08); },
    booster: function () { tone(392, 0.12, 'triangle', 0.16); tone(784, 0.2, 'triangle', 0.14, 0.08); },
    star: function (i) { tone(784 * Math.pow(1.26, i), 0.25, 'triangle', 0.2); },
    win: function () { [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, 0.28, 'triangle', 0.18, i * 0.11); tone(f / 2, 0.3, 'sine', 0.1, i * 0.11); }); },
    lose: function () { [392, 330, 262, 196].forEach(function (f, i) { tone(f, 0.26, 'sawtooth', 0.06, i * 0.14); }); },
    coin: function () { tone(1568, 0.08, 'square', 0.06); tone(2093, 0.12, 'square', 0.05, 0.06); }
  };
  // Kleine Loop-Musik je Welt (Bass, Akkorde, Hi-Hat), wird im Takt nachgeplant
  var SCALES = [[0, 4, 7, 11], [0, 3, 7, 10], [0, 4, 7, 9], [0, 5, 7, 10], [0, 4, 7, 12], [0, 3, 7, 12], [0, 4, 9, 11], [0, 3, 5, 10], [0, 2, 7, 11], [0, 4, 7, 14]];
  var ROOTS = [57, 55, 60, 53, 58, 50, 62, 48, 64, 57];
  function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }
  function tick() {
    if (!ac || !on.music || musWorld < 0) return;
    var sc = SCALES[musWorld % 10], r = ROOTS[musWorld % 10], bar = Math.floor(step / 8) % 4, prog = [0, 5, 3, 4][bar], beat = step % 8;
    if (beat % 4 === 0) tone(midi(r - 24 + prog), 0.32, 'triangle', 0.5, 0, musBus);
    if (beat === 2 || beat === 6) sc.slice(0, 3).forEach(function (iv) { tone(midi(r + prog + iv), 0.22, 'sine', 0.12, 0, musBus); });
    if (beat % 2 === 1) noise(0.04, 0.05, 0, 7000, musBus);
    if (beat === 3 || beat === 7) tone(midi(r + 12 + sc[(step >> 3) % sc.length]), 0.18, 'triangle', 0.16, 0, musBus);
    step++;
  }
  RRM.Audio = {
    unlock: function () { ctx(); },
    set: function (k, v) { on[k] = !!v; if (k === 'music') { if (!v) this.stopMusic(); else if (musWorld >= 0) this.music(musWorld, true); } },
    play: function (name, a) { if (!on.sfx || !ctx() || !S[name]) return; S[name](a); },
    music: function (world, force) {
      if (musWorld === world && musTimer && !force) return;
      musWorld = world; clearInterval(musTimer); musTimer = 0;
      if (!on.music) return;
      ctx(); musTimer = setInterval(tick, 230);
    },
    stopMusic: function () { clearInterval(musTimer); musTimer = 0; },
    pause: function () { if (ac && ac.state === 'running') ac.suspend(); },
    resume: function () { if (ac && ac.state === 'suspended') ac.resume(); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
