/* Bowling-Bahn 3D – Ton: rollende Kugel, krachende Kegel, Rinne, Strike-/Spare-Jingles und Disko-Funk, alles live mit WebAudio erzeugt. */
(function () {
  'use strict';
  let AC = null, master = null, musicGain = null, sfxOn = true, musicOn = true, mus = null;
  function ctx() {
    if (!AC) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AC = new C(); master = AC.createGain(); master.gain.value = .9; master.connect(AC.destination); musicGain = AC.createGain(); musicGain.gain.value = 0; musicGain.connect(master); }
    if (AC.state === 'suspended') AC.resume(); return AC;
  }
  function tone(f, d, vol, type, f2, at, dest) { const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + (at || 0); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(dest || master); o.start(t); o.stop(t + d + .03); }
  let nb = null; function noiseBuf() { if (nb) return nb; const n = AC.sampleRate, b = AC.createBuffer(1, n, n), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return nb = b; }
  function noise(d, f, vol, f2, at, type, dest) { const s = AC.createBufferSource(), fl = AC.createBiquadFilter(), g = AC.createGain(), t = AC.currentTime + (at || 0); s.buffer = noiseBuf(); fl.type = type || 'lowpass'; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); s.connect(fl); fl.connect(g); g.connect(dest || master); s.start(t, Math.random() * .5); s.stop(t + d + .05); }
  let lastClick = 0;
  function sfx(k, p) {
    if (!sfxOn || !ctx()) return;
    try {
      if (k === 'move') tone(700, .04, .05, 'square');
      else if (k === 'ok') { tone(520, .07, .07, 'triangle'); tone(780, .09, .06, 'triangle', 0, .05); }
      else if (k === 'back') tone(360, .08, .05, 'triangle', 240);
      else if (k === 'hit') { const now = AC.currentTime; if (now - lastClick < .025) return; lastClick = now; const v = Math.min(1, (p || 1) / 4); noise(.09 + v * .12, 2400 + v * 2000, .06 + v * .3, 600, 0, 'bandpass'); tone(520 + v * 300, .05, .04 + v * .08, 'triangle', 260); }
      else if (k === 'release') { tone(90, .12, .2, 'sine', 50); noise(.08, 400, .12, 120); }
      else if (k === 'gutter') { tone(160, .35, .12, 'sawtooth', 70); }
      else if (k === 'strike') { [0, 4, 7, 12, 16, 19, 24, 28].forEach((s, i) => tone(523 * Math.pow(2, s / 12), .22, .08, 'square', 0, i * .06)); noise(.5, 6000, .08, 1500, .1, 'highpass'); }
      else if (k === 'spare') [0, 7, 12, 19].forEach((s, i) => tone(587 * Math.pow(2, s / 12), .2, .08, 'triangle', 0, i * .08));
      else if (k === 'miss') [5, 0].forEach((s, i) => tone(300 * Math.pow(2, s / 12), .22, .07, 'triangle', 0, i * .16));
      else if (k === 'good') [0, 4, 7].forEach((s, i) => tone(523 * Math.pow(2, s / 12), .14, .07, 'triangle', 0, i * .06));
      else if (k === 'win') [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => tone(523 * Math.pow(2, s / 12), .25, .08, 'triangle', 0, i * .09));
      else if (k === 'lose') [7, 4, 0, -5].forEach((s, i) => tone(330 * Math.pow(2, s / 12), .3, .08, 'triangle', 0, i * .17));
    } catch (e) { }
  }
  // Musik: 116 BPM Disko-Funk – slappender Bass, Clavinet-Tupfer, Hi-Hats
  const BPM = 116, SP = 60 / BPM / 4, ROOTS = [45, 45, 50, 52], BASS = [0, -1, 0, 12, -1, 10, 0, -1, 7, -1, 0, 12, -1, 10, 7, 5];
  const hz = n => 440 * Math.pow(2, (n - 69) / 12);
  function sched() {
    if (!mus) return; const now = AC.currentTime;
    while (mus.next < now + .2) {
      const s = mus.step, t = mus.next - now, bar = Math.floor(s / 16) % 4, r = ROOTS[bar], st = s % 16, game = mus.mode === 'game';
      if (st === 0 || st === 10) tone(110, .14, .3, 'sine', 45, t, musicGain);
      if (st === 4 || st === 12) noise(.12, 2600, .12, 800, t, 'bandpass', musicGain);
      if (st % 2 === 0) noise(.025, 9000, game ? .05 : .03, 0, t, 'highpass', musicGain);
      if (BASS[st] >= 0) tone(hz(r - 12 + BASS[st]), SP * 1.4, .13, 'sawtooth', 0, t, musicGain);
      if (st === 3 || st === 7 || st === 11) [0, 3, 7, 10].forEach(c => tone(hz(r + 12 + c), SP * .7, .018, 'square', 0, t, musicGain));
      mus.step++; mus.next += SP;
    }
  }
  function music(mode) {
    if (!ctx()) return;
    if (!musicOn || !mode) { if (mus) { clearInterval(mus.iv); mus = null; } musicGain.gain.setTargetAtTime(0, AC.currentTime, .2); return; }
    musicGain.gain.setTargetAtTime(.24, AC.currentTime, .3);
    if (mus) { mus.mode = mode; return; }
    mus = { mode, step: 0, next: AC.currentTime + .05, iv: setInterval(sched, 70) }; sched();
  }
  // Rollgeräusch (Rauschen, Lautstärke = Tempo)
  let rl = null;
  function roll(v) {
    if (!sfxOn || !ctx()) { if (rl) { rl.g.gain.setTargetAtTime(0, AC.currentTime, .05); } return; }
    if (!rl) { const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = noiseBuf(); s.loop = true; f.type = 'lowpass'; f.frequency.value = 220; g.gain.value = 0; s.connect(f); f.connect(g); g.connect(master); s.start(); rl = { s, f, g }; }
    rl.g.gain.setTargetAtTime(Math.min(.35, v * .045), AC.currentTime, .06); rl.f.frequency.setTargetAtTime(120 + v * 25, AC.currentTime, .1);
  }
  document.addEventListener('visibilitychange', () => { if (!AC) return; if (document.hidden) AC.suspend(); else AC.resume(); });
  window.BWSound = { sfx, music, unlock: ctx, roll, set sfxOn(v) { sfxOn = !!v; }, set musicOn(v) { musicOn = !!v; if (!v) music(null); } };
})();
