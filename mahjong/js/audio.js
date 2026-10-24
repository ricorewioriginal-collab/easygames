/* Mahjong 3D – Klänge und Musik, im Browser erzeugt (keine Audiodateien).
 * Musik: ruhige pentatonische Zupf-Melodie mit leisem Klangteppich; läuft nur, wenn sichtbar und eingeschaltet. */
(function (root) {
  'use strict';
  const PENTA = [0, 2, 4, 7, 9];
  let ctx = null, master = null, sfxBus = null, musicBus = null, noiseBuf = null;
  let sfxVol = 0.8, musicVol = 0.45, musicOn = true, musicTimer = 0, nextNote = 0, step = 0, pad = null, unlocked = false;

  function init() {
    if (ctx) return ctx;
    const AC = root.AudioContext || root.webkitAudioContext; if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = sfxVol; sfxBus.connect(master);
    musicBus = ctx.createGain(); musicBus.gain.value = musicVol * 0.5; musicBus.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }
  function unlock() {
    if (!init()) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    if (!unlocked) { unlocked = true; if (musicOn && !document.hidden) startMusic(); }
  }
  function hz(semi) { return 261.63 * Math.pow(2, semi / 12); }
  function tone(freq, t, dur, type, vol, bus, attack) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (attack || 0.005)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus || sfxBus); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, dur, freq, q, vol) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t); s.stop(t + dur + 0.02);
  }
  // Stein auf Stein: kurzes, hölzern-kerniges Klacken
  function clack(t, pitch) { noise(t, 0.05, 2400 * (pitch || 1), 3, 0.5); tone(520 * (pitch || 1), t, 0.06, 'triangle', 0.18); }

  const SFX = {
    select() { clack(ctx.currentTime, 1); },
    deselect() { clack(ctx.currentTime, 0.8); },
    blocked() { const t = ctx.currentTime; tone(150, t, 0.16, 'square', 0.05); tone(120, t + 0.06, 0.16, 'square', 0.04); },
    match(combo) {
      const t = ctx.currentTime, c = Math.min(combo || 1, 6), base = PENTA[(c - 1) % 5] + 12 * Math.floor((c - 1) / 5);
      clack(t, 1.15); clack(t + 0.05, 1.3);
      tone(hz(12 + base), t + 0.04, 0.5, 'sine', 0.22); tone(hz(19 + base), t + 0.1, 0.6, 'sine', 0.16);
      if (c >= 3) tone(hz(24 + base), t + 0.16, 0.7, 'triangle', 0.1);
    },
    hint() { const t = ctx.currentTime; [0, 4, 7].forEach((s, i) => tone(hz(24 + s), t + i * 0.07, 0.4, 'sine', 0.1)); },
    undo() { const t = ctx.currentTime; clack(t, 0.9); tone(hz(7), t, 0.25, 'triangle', 0.08); },
    shuffle() { const t = ctx.currentTime; for (let i = 0; i < 9; i++) clack(t + i * 0.045 + Math.random() * 0.02, 0.8 + Math.random() * 0.6); },
    click() { tone(880, ctx.currentTime, 0.05, 'sine', 0.06); },
    stuck() { const t = ctx.currentTime; [7, 4, 0].forEach((s, i) => tone(hz(s), t + i * 0.16, 0.5, 'triangle', 0.12)); },
    win() {
      const t = ctx.currentTime;
      [0, 2, 4, 7, 9, 12, 16, 19, 24].forEach((s, i) => tone(hz(12 + s), t + i * 0.09, 0.9, 'triangle', 0.13));
      tone(hz(0), t + 0.8, 1.6, 'sine', 0.12); tone(hz(7), t + 0.8, 1.6, 'sine', 0.08);
    },
    star(i) { const t = ctx.currentTime; tone(hz(24 + [0, 4, 7][i || 0]), t, 0.5, 'sine', 0.15); },
    tick() { tone(1200, ctx.currentTime, 0.03, 'square', 0.03); }
  };
  function play(name, arg) {
    if (!ctx || sfxVol <= 0 || ctx.state !== 'running') return;
    try { SFX[name] && SFX[name](arg); } catch (e) {}
  }

  // ---------- Musik ----------
  function pluck(freq, t, vol) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'triangle'; o2.type = 'sawtooth'; o.frequency.value = freq; o2.frequency.value = freq * 1.003;
    f.type = 'lowpass'; f.frequency.setValueAtTime(freq * 6, t); f.frequency.exponentialRampToValueAtTime(freq * 1.2, t + 0.6);
    const g2 = ctx.createGain(); g2.gain.value = 0.25;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    o.connect(f); o2.connect(g2); g2.connect(f); f.connect(g); g.connect(musicBus);
    o.start(t); o2.start(t); o.stop(t + 1.7); o2.stop(t + 1.7);
  }
  const PHRASES = [[0, 2, 4, 7, 4, 2, 0, -1], [7, 9, 12, 9, 7, 4, 2, -1], [4, 7, 9, 7, 4, 2, 4, -1], [12, 9, 7, 4, 7, 4, 2, 0]];
  const ROOTS = [0, -3, 5, 2];
  function startPad() {
    if (pad) return;
    const t = ctx.currentTime, g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 3);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 600;
    const oscs = [hz(-24), hz(-17), hz(-12) * 1.002].map(fr => { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = fr; o.connect(f); o.start(); return o; });
    f.connect(g); g.connect(musicBus); pad = { g, oscs };
  }
  function stopPad() {
    if (!pad) return; const p = pad; pad = null;
    try { p.g.gain.cancelScheduledValues(ctx.currentTime); p.g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.4); setTimeout(() => p.oscs.forEach(o => { try { o.stop(); } catch (e) {} }), 1500); } catch (e) {}
  }
  function schedule() {
    if (!ctx || ctx.state !== 'running') return;
    const beat = 0.42;
    while (nextNote < ctx.currentTime + 0.6) {
      const bar = Math.floor(step / 8), ph = PHRASES[(bar * 7 + Math.floor(bar / 4)) % PHRASES.length], s = ph[step % 8], r = ROOTS[Math.floor(bar / 2) % ROOTS.length];
      if (s >= 0 && Math.random() > 0.12) pluck(hz(r + s), nextNote, 0.16 + (step % 4 === 0 ? 0.05 : 0));
      if (step % 8 === 0) pluck(hz(r - 12), nextNote, 0.12);
      nextNote += beat * (step % 2 ? 0.92 : 1.08);   // leicht schwingend
      step++;
    }
  }
  function startMusic() {
    if (!ctx || !musicOn || musicTimer || document.hidden) return;
    nextNote = ctx.currentTime + 0.2; startPad();
    musicTimer = setInterval(schedule, 200);
  }
  function stopMusic() { if (musicTimer) { clearInterval(musicTimer); musicTimer = 0; } if (ctx) stopPad(); }
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) { stopMusic(); ctx.suspend().catch(() => {}); }
    else { ctx.resume().then(() => { if (musicOn && unlocked) startMusic(); }).catch(() => {}); }
  });

  root.MJAudio = {
    unlock, play,
    setSfx(v) { sfxVol = v; if (sfxBus) sfxBus.gain.value = v; },
    setMusic(v) {
      musicVol = v; musicOn = v > 0;
      if (musicBus) musicBus.gain.value = v * 0.5;
      if (!ctx) return;
      if (musicOn && unlocked) startMusic(); else stopMusic();
    }
  };
})(window);
