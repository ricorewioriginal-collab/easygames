/* Hüpfstraße – Ton: Effekte und eine fröhliche Chiptune-Schleife, alles live mit WebAudio erzeugt (keine Dateien). */
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
  function sfx(k, p) {
    if (!sfxOn || !ctx()) return;
    try {
      if (k === 'move') tone(700, .04, .05, 'square');
      else if (k === 'ok') { tone(520, .07, .08, 'square'); tone(780, .09, .07, 'square', 0, .05); }
      else if (k === 'back') tone(360, .08, .06, 'square', 240);
      else if (k === 'hop') tone(420 + Math.random() * 60, .07, .07, 'square', 760);
      else if (k === 'bump') tone(150, .08, .1, 'triangle', 100);
      else if (k === 'coin') { tone(988, .06, .08, 'square'); tone(1319, .14, .08, 'square', 0, .06); }
      else if (k === 'log') noise(.08, 600, .12, 200);
      else if (k === 'pad') tone(300, .1, .08, 'sine', 500);
      else if (k === 'splash') { noise(.5, 1800, .35, 300); tone(500, .3, .1, 'sine', 120); }
      else if (k === 'crash') { noise(.35, 2500, .45, 200); tone(110, .3, .3, 'sawtooth', 50); }
      else if (k === 'honk') { tone(392, .14, .07, 'square'); tone(494, .14, .05, 'square'); }
      else if (k === 'warn') { for (let i = 0; i < 4; i++) tone(1046, .09, .06, 'square', 0, i * .22); }
      else if (k === 'train') { tone(220, .6, .12, 'sawtooth'); tone(277, .6, .1, 'sawtooth'); noise(1.1, 900, .3, 300); }
      else if (k === 'drone') { tone(180, 1.1, .1, 'sawtooth', 260); noise(1, 3000, .12, 1500, 0, 'bandpass'); }
      else if (k === 'step10') [0, 7, 12].forEach((s, i) => tone(660 * Math.pow(2, s / 12), .1, .06, 'square', 0, i * .05));
      else if (k === 'buy') [0, 4, 7, 12, 16].forEach((s, i) => tone(523 * Math.pow(2, s / 12), .16, .08, 'square', 0, i * .06));
      else if (k === 'record') [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => tone(523 * Math.pow(2, s / 12), .22, .08, 'triangle', 0, i * .08));
      else if (k === 'lose') [7, 4, 0].forEach((s, i) => tone(392 * Math.pow(2, s / 12), .2, .08, 'square', 0, i * .14));
    } catch (e) { }
  }
  // Musik: 124 BPM, hüpfender Bass, Akkord-Tupfer und Melodie (Spiel mit Hi-Hats)
  const BPM = 124, SP = 60 / BPM / 2, ROOTS = [48, 53, 55, 53], MEL = [12, 16, 19, 16, 14, 12, 16, 19, 21, 19, 16, 14, 12, 9, 12, 16];
  const hz = n => 440 * Math.pow(2, (n - 69) / 12);
  function sched() {
    if (!mus) return; const now = AC.currentTime;
    while (mus.next < now + .2) {
      const s = mus.step, t = mus.next - now, bar = Math.floor(s / 16) % 4, r = ROOTS[bar], game = mus.mode === 'game', st = s % 16;
      if (st % 4 === 0) tone(140, .12, .25, 'sine', 50, t, musicGain);
      if (game && st % 2 === 1) noise(.03, 9000, .06, 0, t, 'highpass', musicGain);
      if (st === 4 || st === 12) noise(.08, 2600, .08, 900, t, 'bandpass', musicGain);
      if (st % 4 === 0 || st % 4 === 3) tone(hz(r - 12 + (st % 8 === 4 ? 7 : 0)), SP * .9, .13, 'triangle', 0, t, musicGain);
      if (st === 2 || st === 10) [0, 4, 7].forEach(c => tone(hz(r + 12 + c), SP * .6, .025, 'square', 0, t, musicGain));
      if (st % 2 === 0 && (game || bar % 2 === 0)) tone(hz(r + MEL[(st + bar * 4) % 16]), SP * .8, .03, 'square', 0, t, musicGain);
      mus.step++; mus.next += SP;
    }
  }
  function music(mode) {
    if (!ctx()) return;
    if (!musicOn || !mode) { if (mus) { clearInterval(mus.iv); mus = null; } musicGain.gain.setTargetAtTime(0, AC.currentTime, .2); return; }
    musicGain.gain.setTargetAtTime(.3, AC.currentTime, .3);
    if (mus) { mus.mode = mode; return; }
    mus = { mode, step: 0, next: AC.currentTime + .05, iv: setInterval(sched, 70) }; sched();
  }
  document.addEventListener('visibilitychange', () => { if (!AC) return; if (document.hidden) AC.suspend(); else AC.resume(); });
  window.HSSound = { sfx, music, unlock: ctx, set sfxOn(v) { sfxOn = !!v; }, set musicOn(v) { musicOn = !!v; if (!v) music(null); } };
})();
