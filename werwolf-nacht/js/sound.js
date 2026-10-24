/* Werwolf-Nacht – Ton: Nacht-Atmosphäre (Wind, Grillen, Eule), Wolfsgeheul, Morgenglocke, Vögel am Tag, Trommel zur Abstimmung,
 * Gong beim Tod – alles live mit WebAudio erzeugt. */
(function () {
  'use strict';
  let AC = null, master = null, amb = null, ambGain = null, sfxOn = true, ambOn = true, nb = null, mode = '';
  function ctx() {
    if (!AC) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AC = new C(); master = AC.createGain(); master.gain.value = .9; master.connect(AC.destination); ambGain = AC.createGain(); ambGain.gain.value = 0; ambGain.connect(master); }
    if (AC.state === 'suspended') AC.resume(); return AC;
  }
  function tone(f, d, vol, type, f2, at, dest) { const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + (at || 0); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(.08, d / 3)); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(dest || master); o.start(t); o.stop(t + d + .05); }
  function noiseBuf() { if (nb) return nb; const n = AC.sampleRate * 2, b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return nb = b; }
  function noise(d, f, vol, f2, at, type, dest) { const s = AC.createBufferSource(), fl = AC.createBiquadFilter(), g = AC.createGain(), t = AC.currentTime + (at || 0); s.buffer = noiseBuf(); fl.type = type || 'lowpass'; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(.3, d / 3)); g.gain.exponentialRampToValueAtTime(.0001, t + d); s.connect(fl); fl.connect(g); g.connect(dest || master); s.start(t, Math.random()); s.stop(t + d + .05); }
  function howl(at, dest) { const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + (at || 0); o.type = 'sawtooth'; o.frequency.setValueAtTime(330, t); o.frequency.linearRampToValueAtTime(520, t + .7); o.frequency.linearRampToValueAtTime(500, t + 1.8); o.frequency.linearRampToValueAtTime(300, t + 2.6); const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 2; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.12, t + .5); g.gain.exponentialRampToValueAtTime(.0001, t + 2.8); o.connect(f); f.connect(g); g.connect(dest || master); o.start(t); o.stop(t + 3); }
  function sfx(k) {
    if (!sfxOn || !ctx()) return;
    try {
      if (k === 'move') tone(700, .04, .04, 'triangle');
      else if (k === 'ok') { tone(440, .1, .07, 'triangle'); tone(660, .14, .06, 'triangle', 0, .07); }
      else if (k === 'back') tone(300, .1, .05, 'triangle', 200);
      else if (k === 'howl') { howl(0); howl(.5); }
      else if (k === 'bell') [0, 1.1, 2.2].forEach(t => { tone(392, 2.2, .1, 'sine', 0, t); tone(784, 1.4, .04, 'sine', 0, t); tone(1180, .8, .02, 'sine', 0, t); });
      else if (k === 'drum') [0, .32, .64, .96, 1.12].forEach((t, i) => { tone(90, .3, .25, 'sine', 50, t); noise(.15, 900, i === 4 ? .2 : .1, 200, t); });
      else if (k === 'death') { tone(110, 2.4, .2, 'sine', 70); tone(165, 2, .08, 'triangle', 0, .02); noise(1.4, 400, .08, 80); }
      else if (k === 'reveal') [0, 3, 7, 12].forEach((s, i) => tone(220 * Math.pow(2, s / 12), .6, .06, 'triangle', 0, i * .1));
      else if (k === 'win') [0, 4, 7, 12, 16, 19].forEach((s, i) => tone(392 * Math.pow(2, s / 12), .5, .07, 'triangle', 0, i * .12));
      else if (k === 'lose') [7, 5, 3, 0, -5].forEach((s, i) => tone(220 * Math.pow(2, s / 12), .6, .07, 'sawtooth', 0, i * .2));
      else if (k === 'tick') tone(1200, .03, .04, 'square');
      else if (k === 'magic') [0, 5, 9, 14, 17].forEach((s, i) => tone(660 * Math.pow(2, s / 12), .4, .04, 'sine', 0, i * .05));
    } catch (e) { }
  }
  // Atmosphäre je Phase: Nacht = Wind + Grillen + Eule, Tag = Vögel
  function ambience(m) {
    if (!ctx()) return; mode = m || '';
    if (!ambOn || !m) { ambGain.gain.setTargetAtTime(0, AC.currentTime, .4); return; }
    ambGain.gain.setTargetAtTime(.5, AC.currentTime, .6);
    if (!amb) amb = setInterval(tick, 700);
  }
  let k = 0;
  function tick() {
    if (!ambOn || !mode || document.hidden) return; k++;
    try {
      if (mode === 'night') { noise(2.2, 380 + Math.random() * 200, .06, 260, 0, 'lowpass', ambGain); if (k % 2) for (let i = 0; i < 3; i++) tone(4200 + Math.random() * 300, .05, .012, 'sine', 0, i * .09, ambGain); if (k % 11 === 0) { tone(380, .35, .05, 'sine', 330, 0, ambGain); tone(370, .5, .05, 'sine', 320, .45, ambGain); } }
      else if (mode === 'day') { if (Math.random() < .6) { const f = 2400 + Math.random() * 1600; tone(f, .08, .02, 'sine', f * 1.3, 0, ambGain); tone(f * 1.1, .08, .018, 'sine', f * .9, .12, ambGain); } noise(1.5, 1200, .012, 600, 0, 'lowpass', ambGain); }
      else if (mode === 'vote') { tone(55, .6, .05, 'sine', 50, 0, ambGain); }
    } catch (e) { }
  }
  document.addEventListener('visibilitychange', () => { if (!AC) return; if (document.hidden) AC.suspend(); else AC.resume(); });
  window.WWSound = { sfx, ambience, unlock: ctx, set sfxOn(v) { sfxOn = !!v; }, set ambOn(v) { ambOn = !!v; if (!v) ambience(''); } };
})();
