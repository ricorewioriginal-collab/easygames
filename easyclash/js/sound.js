/* EASYCLASH – Ton: Schläge, Tritte, Treffer, Ansagen-Jingles und treibende Kampfmusik, alles live mit WebAudio erzeugt (keine Dateien). */
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
      else if (k === 'ok') { tone(440, .08, .09, 'sawtooth'); tone(660, .12, .08, 'sawtooth', 0, .06); }
      else if (k === 'back') tone(330, .08, .06, 'square', 200);
      else if (k === 'swing') noise(.1, 2500, .1, 900, 0, 'bandpass');
      else if (k === 'hit') { const v = Math.min(1, (p || 8) / 20); noise(.1, 2200, .25 + v * .3, 300); tone(160 - v * 50, .12, .3 * v + .12, 'sine', 50); }
      else if (k === 'big') { noise(.25, 3000, .5, 200); tone(90, .35, .45, 'sine', 35); }
      else if (k === 'block') { tone(1200, .05, .08, 'square', 600); noise(.06, 6000, .12, 2000, 0, 'highpass'); }
      else if (k === 'counter') { tone(1500, .1, .08, 'square'); tone(1900, .14, .07, 'square', 0, .07); }
      else if (k === 'throw') { noise(.3, 900, .4, 100); tone(110, .3, .35, 'sine', 40, .05); }
      else if (k === 'proj') tone(300, .35, .1, 'sawtooth', 900);
      else if (k === 'side') noise(.12, 1400, .08, 3000, 0, 'bandpass');
      else if (k === 'land') { noise(.2, 500, .3, 80); tone(70, .2, .3, 'sine', 40); }
      else if (k === 'rage') { tone(110, .6, .15, 'sawtooth', 220); noise(.6, 900, .15, 3000, 0, 'bandpass'); }
      else if (k === 'finale') { [0, 3, 7, 12].forEach((s, i) => tone(220 * Math.pow(2, s / 12), .4, .1, 'sawtooth', 0, i * .05)); noise(1, 5000, .2, 500, 0, 'highpass'); }
      else if (k === 'round') { tone(523, .18, .1, 'square'); tone(784, .3, .1, 'square', 0, .2); }
      else if (k === 'fight') { tone(392, .1, .12, 'sawtooth'); tone(784, .4, .12, 'sawtooth', 0, .1); noise(.5, 4000, .2, 800, .05, 'highpass'); }
      else if (k === 'ko') { tone(220, 1.2, .2, 'sawtooth', 55); noise(1.2, 1200, .4, 80); }
      else if (k === 'win') [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => tone(523 * Math.pow(2, s / 12), .25, .09, 'square', 0, i * .09));
      else if (k === 'lose') [7, 4, 0, -5].forEach((s, i) => tone(330 * Math.pow(2, s / 12), .3, .09, 'triangle', 0, i * .17));
      else if (k === 'select') tone(880, .06, .07, 'square', 1320);
    } catch (e) { }
  }
  // Musik: 140 BPM, treibender Bass, Power-Akkorde, Snare (im Menü ruhiger)
  const BPM = 140, SP = 60 / BPM / 2, ROOTS = [40, 40, 43, 38], CH = [[0, 7, 12], [0, 7, 12], [0, 7, 12], [0, 7, 12]];
  const hz = n => 440 * Math.pow(2, (n - 69) / 12);
  function sched() {
    if (!mus) return; const now = AC.currentTime;
    while (mus.next < now + .2) {
      const s = mus.step, t = mus.next - now, bar = Math.floor(s / 16) % 4, r = ROOTS[bar], fight = mus.mode === 'game', st = s % 16;
      if (st % 4 === 0 || (fight && st === 10)) tone(130, .14, fight ? .45 : .25, 'sine', 45, t, musicGain);
      if (st === 4 || st === 12) noise(.13, 2400, fight ? .25 : .1, 700, t, 'bandpass', musicGain);
      if (fight && st % 2 === 1) noise(.03, 9000, .07, 0, t, 'highpass', musicGain);
      tone(hz(r + (st % 4 === 3 ? 12 : 0)), SP * .9, fight ? .11 : .07, 'sawtooth', 0, t, musicGain);
      if (st === 0 || st === 6 || (fight && st === 12)) CH[bar].forEach(c => tone(hz(r + 24 + c), SP * 2.6, .028, 'square', 0, t, musicGain));
      mus.step++; mus.next += SP;
    }
  }
  function music(mode) {
    if (!ctx()) return;
    if (!musicOn || !mode) { if (mus) { clearInterval(mus.iv); mus = null; } musicGain.gain.setTargetAtTime(0, AC.currentTime, .2); return; }
    musicGain.gain.setTargetAtTime(.26, AC.currentTime, .3);
    if (mus) { mus.mode = mode; return; }
    mus = { mode, step: 0, next: AC.currentTime + .05, iv: setInterval(sched, 70) }; sched();
  }
  document.addEventListener('visibilitychange', () => { if (!AC) return; if (document.hidden) AC.suspend(); else AC.resume(); });
  window.ECSound = { sfx, music, unlock: ctx, set sfxOn(v) { sfxOn = !!v; }, set musicOn(v) { musicOn = !!v; if (!v) music(null); } };
})();
