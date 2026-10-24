/* Wolkenhopser – Ton: Soundeffekte und eine kleine Musikschleife, alles live mit WebAudio erzeugt (keine Dateien). */
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
      else if (k === 'jump') tone(380 + (p || 0) * 6, .13, .09, 'triangle', 760 + (p || 0) * 6);
      else if (k === 'spring') { tone(300, .25, .12, 'square', 1200); }
      else if (k === 'tramp') { tone(200, .5, .12, 'triangle', 1600); tone(400, .4, .06, 'square', 2000, .05); }
      else if (k === 'break') noise(.25, 1200, .3, 200);
      else if (k === 'vanish') tone(1200, .15, .05, 'sine', 2400);
      else if (k === 'coin') { tone(988, .06, .07, 'square'); tone(1319, .12, .07, 'square', 0, .06); }
      else if (k === 'shoot') tone(900, .08, .06, 'square', 1800);
      else if (k === 'kill') { tone(600, .1, .12, 'square', 200); noise(.2, 3000, .2, 400); }
      else if (k === 'hurt') tone(400, .08, .08, 'square', 300);
      else if (k === 'item') [0, 4, 7, 12].forEach((s, i) => tone(620 * Math.pow(2, s / 12), .1, .08, 'triangle', 0, i * .05));
      else if (k === 'fly') noise(.6, 600, .15, 1800, 0, 'bandpass');
      else if (k === 'shieldPop') { noise(.3, 4000, .25, 800, 0, 'highpass'); tone(500, .2, .1, 'sine', 200); }
      else if (k === 'die') { tone(700, 1.1, .12, 'triangle', 90); }
      else if (k === 'zone') [0, 7, 12, 16].forEach((s, i) => tone(523 * Math.pow(2, s / 12), .2, .07, 'triangle', 0, i * .09));
      else if (k === 'rec') [0, 4, 7, 12, 16, 19].forEach((s, i) => tone(523 * Math.pow(2, s / 12), .22, .09, 'triangle', 0, i * .08));
    } catch (e) { }
  }
  // Musik: 128 BPM, Bass + Akkord-Stabs + Drums, zwei Stimmungen (Menü ruhiger, Kampf mit Hi-Hats)
  const BPM = 112, SP = 60 / BPM / 2, ROOTS = [45, 41, 43, 40], CH = [[0, 3, 7], [0, 4, 7], [0, 4, 7], [0, 3, 7]];
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
  window.WHSound = { sfx, music, unlock: ctx, set sfxOn(v) { sfxOn = !!v; }, set musicOn(v) { musicOn = !!v; if (!v) music(null); } };
})();
