/* Darts-Arena 3D – Ton: Wurf-Zischen, dumpfer Einschlag im Sisal, Klacken an Draht und Wand, Jubel bei 180, Bust-Summer,
 * Game-Shot-Fanfare, ruhiger Kneipen-Groove – alles live mit WebAudio. Dazu ein Caller per Sprachausgabe (falls vorhanden). */
(function () {
  'use strict';
  let AC = null, master = null, musicGain = null, sfxOn = true, musicOn = true, callerOn = true, mus = null;
  function ctx() {
    if (!AC) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AC = new C(); master = AC.createGain(); master.gain.value = .9; master.connect(AC.destination); musicGain = AC.createGain(); musicGain.gain.value = 0; musicGain.connect(master); }
    if (AC.state === 'suspended') AC.resume(); return AC;
  }
  function tone(f, d, vol, type, f2, at, dest) { const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + (at || 0); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(dest || master); o.start(t); o.stop(t + d + .03); }
  let nb = null; function noiseBuf() { if (nb) return nb; const n = AC.sampleRate * 2, b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return nb = b; }
  function noise(d, f, vol, f2, at, type, dest, q, attack) { const s = AC.createBufferSource(), fl = AC.createBiquadFilter(), g = AC.createGain(), t = AC.currentTime + (at || 0); s.buffer = noiseBuf(); fl.type = type || 'lowpass'; fl.frequency.setValueAtTime(f, t); if (q) fl.Q.value = q; if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (attack || .005)); g.gain.exponentialRampToValueAtTime(.0001, t + d); s.connect(fl); fl.connect(g); g.connect(dest || master); s.start(t, Math.random()); s.stop(t + d + .05); }
  function sfx(k) {
    if (!sfxOn || !ctx()) return;
    try {
      if (k === 'move') tone(760, .035, .04, 'square');
      else if (k === 'ok') { tone(520, .07, .07, 'triangle'); tone(780, .09, .06, 'triangle', 0, .05); }
      else if (k === 'back') tone(360, .08, .05, 'triangle', 240);
      else if (k === 'whoosh') noise(.22, 1800, .09, 500, 0, 'bandpass', null, 1.5, .06);
      else if (k === 'thud') { noise(.07, 900, .45, 200, 0, 'lowpass'); tone(130, .07, .25, 'sine', 70); }
      else if (k === 'wire') { tone(2400, .05, .05, 'triangle', 1800); noise(.05, 900, .3, 200); }
      else if (k === 'wall') { noise(.06, 2600, .3, 900, 0, 'bandpass', null, 2); tone(420, .05, .1, 'square', 200); noise(.05, 3000, .15, 1200, .22, 'bandpass', null, 2); }
      else if (k === 'good') [0, 4, 7].forEach((s, i) => tone(660 * Math.pow(2, s / 12), .12, .06, 'triangle', 0, i * .05));
      else if (k === 'ton') { [0, 4, 7, 12].forEach((s, i) => tone(523 * Math.pow(2, s / 12), .16, .07, 'triangle', 0, i * .06)); cheer(.6, .12); }
      else if (k === '180') { [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => tone(523 * Math.pow(2, s / 12), .22, .08, 'square', 0, i * .07)); cheer(1.8, .3); }
      else if (k === 'bust') { tone(140, .45, .16, 'sawtooth', 110); tone(147, .45, .1, 'square', 116); }
      else if (k === 'kick') { tone(880, .1, .08, 'square', 220); tone(220, .3, .1, 'sawtooth', 90, .1); }
      else if (k === 'leg') { [0, 4, 7, 12, 7, 12, 16].forEach((s, i) => tone(523 * Math.pow(2, s / 12), .2, .08, 'triangle', 0, i * .08)); cheer(1.4, .22); }
      else if (k === 'win') { [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => tone(523 * Math.pow(2, s / 12), .28, .08, 'triangle', 0, i * .09)); cheer(2.2, .3); }
      else if (k === 'lose') [7, 4, 0, -5].forEach((s, i) => tone(330 * Math.pow(2, s / 12), .3, .08, 'triangle', 0, i * .17));
    } catch (e) { }
  }
  // Publikum: gefiltertes Rauschen, das an- und abschwillt
  function cheer(d, vol) { noise(d, 1400, vol, 900, 0, 'bandpass', null, .7, d * .25); noise(d * .8, 3200, vol * .5, 1500, .05, 'bandpass', null, 1, d * .2); }
  // Musik: ruhiger Kneipen-Groove (92 BPM) – Bass, Rimshot, Hi-Hat, Orgel-Akkorde
  const BPM = 92, SP = 60 / BPM / 4, ROOTS = [43, 43, 48, 50], BASS = [0, -1, -1, 7, 0, -1, 10, -1, 0, -1, -1, 7, 12, -1, 10, 7];
  const hz = n => 440 * Math.pow(2, (n - 69) / 12);
  function sched() {
    if (!mus) return; const now = AC.currentTime;
    while (mus.next < now + .2) {
      const s = mus.step, t = mus.next - now, r = ROOTS[Math.floor(s / 16) % 4], st = s % 16;
      if (st === 0 || st === 8 || st === 11) tone(100, .14, .22, 'sine', 45, t, musicGain);
      if (st === 4 || st === 12) noise(.07, 2200, .07, 900, t, 'bandpass', musicGain, 3);
      if (st % 2 === 0) noise(.02, 9000, .025, 0, t, 'highpass', musicGain);
      if (BASS[st] >= 0) tone(hz(r - 12 + BASS[st]), SP * 1.6, .11, 'triangle', 0, t, musicGain);
      if (st === 2 || st === 10) [0, 4, 7, 10].forEach(c => tone(hz(r + 12 + c), SP * 1.2, .012, 'sine', 0, t, musicGain));
      mus.step++; mus.next += SP;
    }
  }
  function music(mode) {
    if (!ctx()) return;
    if (!musicOn || !mode) { if (mus) { clearInterval(mus.iv); mus = null; } musicGain.gain.setTargetAtTime(0, AC.currentTime, .2); return; }
    musicGain.gain.setTargetAtTime(mode === 'game' ? .14 : .22, AC.currentTime, .3);
    if (mus) { mus.mode = mode; return; }
    mus = { mode, step: 0, next: AC.currentTime + .05, iv: setInterval(sched, 70) }; sched();
  }
  // Caller: deutsche Sprachausgabe, wenn das Gerät eine Stimme hat
  let voice = null;
  function pickVoice() { try { const v = speechSynthesis.getVoices(); voice = v.find(x => /^de/i.test(x.lang) && /\b(x-deg|smtm\d*|stefan|conrad|killian|florian|markus|yannick|viktor|male|männlich)\b/i.test(x.name) && !/female/i.test(x.name)) || v.find(x => /^de/i.test(x.lang) && /google/i.test(x.name)) || v.find(x => /^de/i.test(x.lang)) || null; } catch (e) { voice = null; } }
  if (window.speechSynthesis) { pickVoice(); try { speechSynthesis.addEventListener('voiceschanged', pickVoice); } catch (e) { } }
  function call(txt) {
    if (!callerOn || !window.speechSynthesis || !txt) return;
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(txt); u.lang = 'de-DE'; if (voice) u.voice = voice; u.rate = 1.02; u.pitch = .85; u.volume = .9; speechSynthesis.speak(u); } catch (e) { }
  }
  document.addEventListener('visibilitychange', () => { if (!AC) return; if (document.hidden) { AC.suspend(); try { speechSynthesis.cancel(); } catch (e) { } } else AC.resume(); });
  window.DASound = { sfx, music, call, unlock: ctx, set sfxOn(v) { sfxOn = !!v; }, set musicOn(v) { musicOn = !!v; if (!v) music(null); }, set callerOn(v) { callerOn = !!v; } };
})();
