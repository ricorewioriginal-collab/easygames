/* FALL·AKTE – Ton: Noir-Jazz (Walking Bass, Besen, Klavier-Akkorde, gedämpftes Horn) und Geräusche (Schreibmaschine, Papier,
 * Fund, Fehler, Lösung) – alles live mit WebAudio erzeugt, keine Dateien. */
(function () {
  'use strict';
  let AC = null, master = null, musicGain = null, sfxOn = true, musicOn = true, mus = null, nb = null;
  function ctx() {
    if (!AC) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AC = new C(); master = AC.createGain(); master.gain.value = .85; master.connect(AC.destination); musicGain = AC.createGain(); musicGain.gain.value = 0; musicGain.connect(master); }
    if (AC.state === 'suspended') AC.resume(); return AC;
  }
  function tone(f, d, vol, type, f2, at, dest) { const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + (at || 0); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(dest || master); o.start(t); o.stop(t + d + .03); }
  function noiseBuf() { if (nb) return nb; const n = AC.sampleRate, b = AC.createBuffer(1, n, n), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return nb = b; }
  function noise(d, f, vol, f2, at, type, dest) { const s = AC.createBufferSource(), fl = AC.createBiquadFilter(), g = AC.createGain(), t = AC.currentTime + (at || 0); s.buffer = noiseBuf(); fl.type = type || 'lowpass'; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); s.connect(fl); fl.connect(g); g.connect(dest || master); s.start(t, Math.random() * .5); s.stop(t + d + .05); }
  function sfx(k) {
    if (!sfxOn || !ctx()) return;
    try {
      if (k === 'move') tone(900, .03, .04, 'square');
      else if (k === 'ok') { noise(.03, 3000, .12, 0, 0, 'bandpass'); tone(180, .05, .1, 'square', 90, .01); }      // Schreibmaschinen-Anschlag
      else if (k === 'back') tone(320, .08, .05, 'triangle', 220);
      else if (k === 'type') [0, .06, .11, .19].forEach(t => noise(.025, 3200, .1, 0, t, 'bandpass'));
      else if (k === 'paper') noise(.25, 4000, .08, 900, 0, 'highpass');
      else if (k === 'look') noise(.12, 1800, .05, 600, 0, 'bandpass');
      else if (k === 'find') [0, 4, 7, 11].forEach((s, i) => tone(660 * Math.pow(2, s / 12), .5, .05, 'sine', 0, i * .07));
      else if (k === 'wrong') { tone(150, .35, .1, 'sawtooth', 110); tone(156, .35, .08, 'sawtooth', 112); }
      else if (k === 'ask') { tone(220, .12, .05, 'triangle'); tone(277, .12, .04, 'triangle', 0, .08); }
      else if (k === 'solve') [0, 3, 7, 10, 14].forEach((s, i) => tone(330 * Math.pow(2, s / 12), .9, .06, 'triangle', 0, i * .12));
      else if (k === 'sting') { [0, 1, 6].forEach(s => tone(110 * Math.pow(2, s / 12), 1.2, .07, 'sawtooth')); noise(.8, 300, .1, 60); }
      else if (k === 'fail') [7, 5, 3, 0].forEach((s, i) => tone(196 * Math.pow(2, s / 12), .45, .07, 'triangle', 0, i * .22));
    } catch (e) { }
  }
  // Noir-Jazz in d-Moll, 84 BPM, Swing-Achtel
  const BPM = 84, Q = 60 / BPM, PROG = [[50, 53, 57, 60], [43, 46, 50, 53], [45, 49, 52, 55], [50, 53, 57, 61]], WALK = [[38, 41, 43, 44], [31, 34, 36, 37], [33, 37, 40, 39], [38, 36, 34, 33]];
  const hz = n => 440 * Math.pow(2, (n - 69) / 12);
  function sched() {
    if (!mus) return; const now = AC.currentTime;
    while (mus.next < now + .25) {
      const b = mus.beat, t = mus.next - now, bar = Math.floor(b / 4) % 4, st = b % 4;
      tone(hz(WALK[bar][st]), Q * .9, .16, 'sine', 0, t, musicGain); tone(hz(WALK[bar][st] + 12), Q * .4, .03, 'triangle', 0, t, musicGain);
      noise(Q * .9, 5000, .025, 2000, t, 'highpass', musicGain); if (st % 2) noise(.05, 6000, .04, 0, t + Q * .66, 'highpass', musicGain);
      if (st === 1 || st === 3) PROG[bar].forEach(n => tone(hz(n + 12), Q * .5, .018, 'triangle', 0, t + Q * .66, musicGain));
      if (mus.mode === 'case' && bar === 3 && st === 0) [74, 72, 69].forEach((n, i) => tone(hz(n), Q * .9, .02, 'sawtooth', 0, t + i * Q * .66, musicGain));
      mus.beat++; mus.next += Q;
    }
  }
  function music(mode) {
    if (!ctx()) return;
    if (!musicOn || !mode) { if (mus) { clearInterval(mus.iv); mus = null; } musicGain.gain.setTargetAtTime(0, AC.currentTime, .2); return; }
    musicGain.gain.setTargetAtTime(.3, AC.currentTime, .4);
    if (mus) { mus.mode = mode; return; }
    mus = { mode, beat: 0, next: AC.currentTime + .05, iv: setInterval(sched, 90) }; sched();
  }
  document.addEventListener('visibilitychange', () => { if (!AC) return; if (document.hidden) AC.suspend(); else AC.resume(); });
  window.FASound = { sfx, music, unlock: ctx, set sfxOn(v) { sfxOn = !!v; }, set musicOn(v) { musicOn = !!v; if (!v) music(null); } };
})();
