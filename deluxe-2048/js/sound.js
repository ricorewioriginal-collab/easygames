/* 2048 Deluxe – Ton: Effekte und eine entspannte Radio-Lofi-Schleife, alles live mit WebAudio erzeugt (keine Dateien). */
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
  const SC = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28, 31, 33, 36];
  function sfx(k, p) {
    if (!sfxOn || !ctx()) return;
    try {
      if (k === 'move') tone(700, .04, .04, 'square');
      else if (k === 'ok') { tone(520, .07, .07, 'triangle'); tone(780, .09, .06, 'triangle', 0, .05); }
      else if (k === 'back') tone(360, .08, .05, 'triangle', 240);
      else if (k === 'slide') noise(.09, 1800, .06, 500, 0, 'bandpass');
      else if (k === 'merge') { const l = Math.max(1, Math.round(Math.log2(p || 4))), n = SC[Math.min(SC.length - 1, l - 1)]; tone(392 * Math.pow(2, n / 12), .16, .1, 'triangle', 0, .1); tone(392 * Math.pow(2, (n + 7) / 12), .12, .04, 'sine', 0, .12); }
      else if (k === 'big') [0, 4, 7, 12].forEach((s, i) => tone(523 * Math.pow(2, s / 12), .22, .09, 'triangle', 0, .1 + i * .06));
      else if (k === 'combo') { noise(.3, 6000, .08, 1500, .1, 'highpass'); tone(990, .18, .06, 'square', 1480, .1); }
      else if (k === 'spawn') tone(1200, .03, .025, 'sine');
      else if (k === 'bump') tone(140, .1, .1, 'sine', 90);
      else if (k === 'undo') tone(600, .14, .07, 'triangle', 300);
      else if (k === 'smash') { tone(120, .3, .3, 'sine', 40); noise(.35, 2500, .35, 200); }
      else if (k === 'warn') { tone(880, .08, .05, 'square'); tone(660, .1, .05, 'square', 0, .1); }
      else if (k === 'tick') tone(1400, .03, .05, 'square');
      else if (k === 'win') { [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => tone(523 * Math.pow(2, s / 12), .3, .1, 'triangle', 0, i * .09)); for (let i = 0; i < 4; i++) noise(.8, 2400 + i * 300, .07, 1200, .3 + i * .08, 'bandpass'); }
      else if (k === 'lose') [7, 4, 0, -5].forEach((s, i) => tone(330 * Math.pow(2, s / 12), .32, .09, 'triangle', 0, i * .17));
    } catch (e) { }
  }
  // Musik: 88 BPM, weiche Akkorde, Bass, Besen-Hi-Hats (Spiel mit etwas mehr Groove)
  const BPM = 88, SP = 60 / BPM / 2, ROOTS = [50, 47, 43, 45], CH = [[0, 4, 7, 11], [0, 3, 7, 10], [0, 4, 7, 11], [0, 4, 7, 10]];
  const hz = n => 440 * Math.pow(2, (n - 69) / 12);
  function sched() {
    if (!mus) return; const now = AC.currentTime;
    while (mus.next < now + .25) {
      const s = mus.step, t = mus.next - now, bar = Math.floor(s / 16) % 4, r = ROOTS[bar], game = mus.mode === 'game', st = s % 16;
      if (st === 0 || st === 10) tone(120, .25, .28, 'sine', 50, t, musicGain);
      if (st === 4 || st === 12) noise(.12, 3000, game ? .12 : .07, 900, t, 'bandpass', musicGain);
      if (game && st % 2 === 1) noise(.04, 9000, .05, 0, t, 'highpass', musicGain);
      if (st === 0 || st === 7 || st === 11) tone(hz(r - 12), SP * 2.2, .16, 'sine', 0, t, musicGain);
      if (st === 0) CH[bar].forEach((c, i) => tone(hz(r + 12 + c), SP * 7, .03, 'triangle', 0, t + i * .02, musicGain));
      if (st === 8 && bar % 2) CH[bar].forEach(c => tone(hz(r + 12 + c), SP * 5, .022, 'triangle', 0, t, musicGain));
      if (game && (st === 6 || st === 14)) tone(hz(r + 24 + CH[bar][(s >> 3) % 4]), SP * 1.2, .03, 'sine', 0, t, musicGain);
      mus.step++; mus.next += SP;
    }
  }
  function music(mode) {
    if (!ctx()) return;
    if (!musicOn || !mode) { if (mus) { clearInterval(mus.iv); mus = null; } musicGain.gain.setTargetAtTime(0, AC.currentTime, .2); return; }
    musicGain.gain.setTargetAtTime(.34, AC.currentTime, .3);
    if (mus) { mus.mode = mode; return; }
    mus = { mode, step: 0, next: AC.currentTime + .05, iv: setInterval(sched, 70) }; sched();
  }
  document.addEventListener('visibilitychange', () => { if (!AC) return; if (document.hidden) AC.suspend(); else AC.resume(); });
  window.D2048Sound = { sfx, music, unlock: ctx, set sfxOn(v) { sfxOn = !!v; }, set musicOn(v) { musicOn = !!v; if (!v) music(null); } };
})();
