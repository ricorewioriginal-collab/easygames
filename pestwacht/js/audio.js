/* Pestwacht · Klang: alles per WebAudio erzeugt (keine Audiodateien). Startet erst nach der ersten Eingabe (Browser-Regel). */
(function (root) {
  'use strict';
  const PW = root.PW = root.PW || {};
  const A = PW.Audio = { music: 0.5, sfx: 0.8 };
  let ctx = null, mGain = null, sGain = null, musicOn = false, nextNote = 0, step = 0, mood = 'ruhe', timer = null, last = {};

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); return ctx; }
    const AC = root.AudioContext || root.webkitAudioContext; if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    mGain = ctx.createGain(); sGain = ctx.createGain();
    mGain.connect(ctx.destination); sGain.connect(ctx.destination);
    A.setVolume(A.music, A.sfx);
    return ctx;
  }
  A.unlock = function () { ensure(); if (musicOn) startLoop(); };
  A.setVolume = function (m, s) {
    A.music = m; A.sfx = s;
    if (mGain) mGain.gain.value = m * 0.22;
    if (sGain) sGain.gain.value = s * 0.5;
  };
  function tone(freq, t, dur, type, vol, dest, slide) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.3, t + Math.min(0.03, dur / 4)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || sGain); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, dur, vol, freq) {
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur)), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = buf; f.type = 'lowpass'; f.frequency.value = freq || 1200; g.gain.value = vol || 0.3;
    s.connect(f); f.connect(g); g.connect(sGain); s.start(t);
  }
  const SFX = {
    klick: t => tone(660, t, 0.06, 'triangle', 0.18),
    bau: t => { noise(t, 0.12, 0.35, 600); tone(180, t + 0.05, 0.12, 'square', 0.12); },
    fertig: t => { tone(523, t, 0.15, 'triangle', 0.2); tone(784, t + 0.12, 0.25, 'triangle', 0.2); },
    fehler: t => tone(200, t, 0.18, 'sawtooth', 0.12, null, 120),
    glocke: t => { tone(392, t, 1.4, 'sine', 0.3); tone(784, t, 0.9, 'sine', 0.12); tone(588, t + 0.5, 1.2, 'sine', 0.2); },
    pfeil: t => tone(1400, t, 0.07, 'triangle', 0.06, null, 500),
    bolzen: t => { tone(220, t, 0.12, 'square', 0.08, null, 90); noise(t, 0.05, 0.1, 2000); },
    feuer: t => noise(t, 0.3, 0.18, 500),
    treffer: t => noise(t, 0.06, 0.12, 1600),
    tor: t => { noise(t, 0.2, 0.4, 300); tone(70, t, 0.25, 'sine', 0.3); },
    tod: t => tone(300, t, 0.15, 'sine', 0.06, null, 120),
    boss: t => { tone(55, t, 1.6, 'sawtooth', 0.2, null, 45); tone(82, t + 0.1, 1.4, 'sawtooth', 0.12); },
    sieg: t => { [523, 659, 784, 1046].forEach((f, i) => tone(f, t + i * 0.13, 0.5, 'triangle', 0.18)); },
    niederlage: t => { [392, 330, 262].forEach((f, i) => tone(f, t + i * 0.25, 0.6, 'sine', 0.2)); },
    erfolg: t => { tone(880, t, 0.12, 'triangle', 0.15); tone(1175, t + 0.1, 0.3, 'triangle', 0.15); },
    marsch: t => { tone(147, t, 0.1, 'square', 0.08); tone(147, t + 0.2, 0.1, 'square', 0.08); },
    brief: t => { tone(700, t, 0.08, 'sine', 0.12); tone(940, t + 0.08, 0.12, 'sine', 0.12); },
    schwert: t => { noise(t, 0.08, 0.2, 3000); tone(900, t, 0.08, 'triangle', 0.05, null, 300); }
  };
  A.play = function (name) {
    if (!ensure() || A.sfx <= 0 || !SFX[name]) return;
    const now = ctx.currentTime;
    if (last[name] && now - last[name] < 0.05) return;   // Häufungen dämpfen (viele Pfeile gleichzeitig)
    last[name] = now;
    try { SFX[name](now + 0.01); } catch (e) {}
  };

  // Musik: ruhige Modal-Melodie (dorisch) über einem Bordun; „gefahr“ wird schneller und tiefer
  const SCALE = [0, 2, 3, 5, 7, 9, 10, 12], BASE = { ruhe: 146.8, gefahr: 110, nacht: 130.8 };
  function startLoop() {
    if (!ctx || timer) return;
    nextNote = ctx.currentTime + 0.1;
    timer = setInterval(schedule, 120);
  }
  function schedule() {
    if (!ctx || !musicOn || A.music <= 0) return;
    const spb = mood === 'gefahr' ? 0.32 : 0.62, base = BASE[mood] || BASE.ruhe;
    while (nextNote < ctx.currentTime + 0.4) {
      const t = nextNote;
      if (step % 8 === 0) { tone(base / 2, t, spb * 8, 'sine', 0.35, mGain); tone(base * 0.75, t, spb * 8, 'sine', 0.12, mGain); }
      const r = (Math.sin(step * 12.9898) * 43758.5453) % 1, deg = SCALE[Math.floor(Math.abs(r) * SCALE.length)];
      if (step % 2 === 0 || mood === 'gefahr') tone(base * Math.pow(2, deg / 12) * (step % 16 < 8 ? 1 : 2), t, spb * 1.6, mood === 'gefahr' ? 'triangle' : 'sine', 0.16, mGain);
      if (mood === 'gefahr' && step % 4 === 0) noise(t, 0.12, 0.12, 200);
      nextNote += spb; step++;
    }
  }
  A.startMusic = function () { musicOn = true; if (ensure()) startLoop(); };
  A.stopMusic = function () { musicOn = false; };
  A.mood = function (m) { mood = m; };

  if (typeof module !== 'undefined' && module.exports) module.exports = PW;
})(typeof window !== 'undefined' ? window : globalThis);
