/* Sendemast-Sumo – Ton: Soundeffekte und eine kleine Musikschleife, alles live mit WebAudio erzeugt (keine Dateien). */
(function () {
  'use strict';
  let AC = null, master = null, musicGain = null, sfxOn = true, musicOn = true, mus = null;
  function ctx() {
    if (!AC) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AC = new C(); master = AC.createGain(); master.gain.value = .9; master.connect(AC.destination); musicGain = AC.createGain(); musicGain.gain.value = .0; musicGain.connect(master); }
    if (AC.state === 'suspended') AC.resume(); return AC;
  }
  function tone(f, d, vol, type, f2, at, dest) { const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + (at || 0); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(dest || master); o.start(t); o.stop(t + d + .03); }
  let nb = null; function noiseBuf() { if (nb) return nb; const n = AC.sampleRate, b = AC.createBuffer(1, n, n), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return nb = b; }
  function noise(d, f, vol, f2, at, type, dest) { const s = AC.createBufferSource(), fl = AC.createBiquadFilter(), g = AC.createGain(), t = AC.currentTime + (at || 0); s.buffer = noiseBuf(); fl.type = type || 'lowpass'; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); s.connect(fl); fl.connect(g); g.connect(dest || master); s.start(t, Math.random() * .5); s.stop(t + d + .05); }
  function sfx(k, p) {
    if (!sfxOn || !ctx()) return;
    try {
      if (k === 'move') tone(660, .04, .05, 'square');
      else if (k === 'ok') { tone(520, .08, .08, 'square'); tone(780, .1, .07, 'square', 0, .06); }
      else if (k === 'back') tone(330, .08, .06, 'square', 220);
      else if (k === 'dash') noise(.22, 3000, .22, 600, 0, 'bandpass');
      else if (k === 'clash') { const v = Math.min(1, (p || 4) / 10); tone(160 + v * 60, .14, .25 * v + .08, 'sine', 60); noise(.1, 1800, .25 * v + .05, 300); }
      else if (k === 'jump') tone(300, .3, .1, 'triangle', 700);
      else if (k === 'slam') { tone(110, .45, .35, 'sine', 40); noise(.45, 900, .5, 80); }
      else if (k === 'fall') tone(900, 1.1, .12, 'sine', 140);
      else if (k === 'out') { noise(.6, 600, .25, 100, .7); tone(70, .5, .25, 'sine', 35, .7); }
      else if (k === 'pu') [0, 4, 7, 12].forEach((s, i) => tone(620 * Math.pow(2, s / 12), .12, .09, 'triangle', 0, i * .05));
      else if (k === 'beep') tone(880, .14, .12, 'square');
      else if (k === 'go') { tone(1320, .35, .14, 'square'); noise(.5, 5000, .15, 1500, 0, 'highpass'); }
      else if (k === 'ring') { noise(.9, 400, .4, 60); tone(90, .7, .2, 'sawtooth', 40); }
      else if (k === 'warn') { tone(1000, .09, .08, 'square'); tone(1000, .09, .08, 'square', 0, .16); }
      else if (k === 'zap') { noise(.5, 8000, .45, 600, 0, 'highpass'); tone(60, .5, .3, 'sawtooth', 30); }
      else if (k === 'wind') noise(2.2, 700, .25, 1800, 0, 'bandpass');
      else if (k === 'win') [0, 4, 7, 12, 16].forEach((s, i) => tone(523 * Math.pow(2, s / 12), .25, .1, 'triangle', 0, i * .1));
      else if (k === 'cheer') { for (let i = 0; i < 4; i++) noise(.9, 2400 + i * 300, .1, 1200, i * .08, 'bandpass'); }
      else if (k === 'lose') [7, 4, 0].forEach((s, i) => tone(330 * Math.pow(2, s / 12), .3, .1, 'triangle', 0, i * .16));
    } catch (e) { }
  }
  // Musik: 128 BPM, Bass + Akkord-Stabs + Drums, zwei Stimmungen (Menü ruhiger, Kampf mit Hi-Hats)
  const BPM = 128, SP = 60 / BPM / 2, ROOTS = [45, 41, 43, 40], CH = [[0, 3, 7], [0, 4, 7], [0, 4, 7], [0, 3, 7]];
  const hz = n => 440 * Math.pow(2, (n - 69) / 12);
  function sched() {
    if (!mus) return; const now = AC.currentTime;
    while (mus.next < now + .2) {
      const s = mus.step, t = mus.next - now, bar = Math.floor(s / 16) % 4, r = ROOTS[bar], fight = mus.mode === 'fight', st = s % 16;
      if (st % 4 === 0) { tone(150, .18, fight ? .5 : .3, 'sine', 45, t, musicGain); }
      if (fight && st % 4 === 2) noise(.05, 9000, .12, 0, t, 'highpass', musicGain);
      if (st === 4 || st === 12) noise(.15, 2500, fight ? .22 : .1, 800, t, 'bandpass', musicGain);
      if (st % 2 === 0) tone(hz(r + (st % 8 === 6 ? 12 : 0)), SP * 1.6, .16, 'triangle', 0, t, musicGain);
      if (st === 0 || st === 6 || st === 10) CH[bar].forEach(c => tone(hz(r + 24 + c), SP * 1.4, .045, 'square', 0, t, musicGain));
      if (fight && (st === 3 || st === 7 || st === 11 || st === 14)) tone(hz(r + 36 + CH[bar][(s >> 2) % 3]), SP * .8, .035, 'square', 0, t, musicGain);
      mus.step++; mus.next += SP;
    }
  }
  function music(mode) {
    if (!ctx()) return;
    if (!musicOn || !mode) { if (mus) { clearInterval(mus.iv); mus = null; } musicGain.gain.setTargetAtTime(0, AC.currentTime, .2); return; }
    musicGain.gain.setTargetAtTime(.32, AC.currentTime, .3);
    if (mus) { mus.mode = mode; return; }
    mus = { mode, step: 0, next: AC.currentTime + .05, iv: setInterval(sched, 60) }; sched();
  }
  document.addEventListener('visibilitychange', () => { if (!AC) return; if (document.hidden) AC.suspend(); else AC.resume(); });
  window.SMSound = { sfx, music, unlock: ctx, set sfxOn(v) { sfxOn = !!v; }, set musicOn(v) { musicOn = !!v; if (!v) music(null); } };
})();
