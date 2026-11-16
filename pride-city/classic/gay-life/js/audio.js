/* GayLife – selbst erzeugter Ton (Web Audio, keine Dateien, keine fremden Aufnahmen):
   - Club-Musik: kleiner Beat-Generator je Stil (Kick, Hi-Hat, Bass), läuft nur solange das Tanz-Menü offen ist
   - Regenrauschen: gefiltertes Rauschen, nur draußen bei Regen
   Beides folgt dem Ton-Schalter (S.sound) und startet erst nach einer Bedienung (Browser-Regel). */
(function () {
  'use strict';
  var S = GL.S, A = GL.audio = {};
  var STY = {
    Lounge: { bpm: 84, root: 52, sc: [0, 3, 7, 10], kick: [0, 8], hat: [4, 12], bass: [0, 6, 10] },
    Pop: { bpm: 112, root: 57, sc: [0, 5, 7, 4], kick: [0, 4, 8, 12], hat: [2, 6, 10, 14], bass: [0, 3, 6, 10] },
    Salsa: { bpm: 100, root: 55, sc: [0, 7, 5, 7], kick: [0, 6, 10], hat: [2, 4, 8, 12, 14], bass: [0, 3, 6, 8, 11] },
    Disco: { bpm: 118, root: 53, sc: [0, 3, 7, 3], kick: [0, 4, 8, 12], hat: [2, 6, 10, 14], bass: [0, 2, 3, 6, 8, 10, 11, 14] },
    House: { bpm: 124, root: 50, sc: [0, 0, 7, 5], kick: [0, 4, 8, 12], hat: [2, 6, 10, 14], bass: [2, 6, 10, 14] },
    Techno: { bpm: 132, root: 48, sc: [0, 0, 3, 0], kick: [0, 4, 8, 12], hat: [2, 6, 10, 14, 7, 15], bass: [0, 3, 6, 8, 11, 14] }
  };
  var song = null, timer = 0, nextT = 0, step = 0, master = null, noise = null, guard = null, rain = null, played = 0;
  function ctx() { return S.sound && GL.core && GL.core.ac ? GL.core.ac() : null; }
  function noiseBuf(a) { if (!noise) { noise = a.createBuffer(1, a.sampleRate * 2, a.sampleRate); var d = noise.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } return noise; }
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function tone(a, f, t, dur, type, v) { var o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .02); }
  function kick(a, t) { var o = a.createOscillator(), g = a.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + .12); g.gain.setValueAtTime(.5, t); g.gain.exponentialRampToValueAtTime(.0001, t + .22); o.connect(g); g.connect(master); o.start(t); o.stop(t + .25); }
  function hat(a, t) { var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = noiseBuf(a); f.type = 'highpass'; f.frequency.value = 7000; g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.0001, t + .05); s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random()); s.stop(t + .06); }
  function sched() {
    if (!song) return;
    var a = ctx(), m = document.getElementById('maps');
    if (!a || (guard && (!m || m.style.display !== 'block' || m.dataset.k !== guard))) { A.stop(); return; }
    var sp = 60 / song.bpm / 4;
    if (nextT < a.currentTime) nextT = a.currentTime + .05;
    while (nextT < a.currentTime + .15) {
      var s16 = step % 16, bar = (step >> 4) % 4;
      if (song.kick.indexOf(s16) >= 0) kick(a, nextT);
      if (song.hat.indexOf(s16) >= 0) hat(a, nextT);
      if (song.bass.indexOf(s16) >= 0) tone(a, hz(song.root + song.sc[bar]), nextT, sp * 2.2, 'sawtooth', .09);
      if (s16 % 8 === 0) tone(a, hz(song.root + 24 + song.sc[(bar + 1) % 4]), nextT, sp * 6, 'triangle', .04);
      nextT += sp; step++; played++;
    }
  }
  /* style: Name aus dem Tanzstil; key: das Menü, das die Musik am Leben hält */
  A.song = function (style, key) {
    var a = ctx(), p = STY[style]; if (!a || !p) return;
    A.stop(); song = p; guard = key || null; step = 0; nextT = 0;
    master = a.createGain(); master.gain.value = .35; master.connect(a.destination);
    timer = setInterval(sched, 40);
  };
  A.stop = function () { clearInterval(timer); timer = 0; song = null; if (master) { try { master.disconnect(); } catch (e) {} master = null; } };
  A.rain = function (on) {
    var a = ctx();
    if (!on || !a) { if (rain) { try { rain.src.stop(); rain.g.disconnect(); } catch (e) {} rain = null; } return; }
    if (rain) return;
    var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = noiseBuf(a); s.loop = true; f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = .5;
    g.gain.value = .06; s.connect(f); f.connect(g); g.connect(a.destination); s.start(); rain = { src: s, g: g };
  };
  A.state = function () { return { music: !!song, rain: !!rain, steps: played }; };
  GL.on('muted', function () { if (!S.sound) { A.stop(); A.rain(false); } });
})();
