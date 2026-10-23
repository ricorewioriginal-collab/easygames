/* FABELKICK 3D – Klänge, im Browser erzeugt (keine Dateien) */
'use strict';
(function () {
  let ctx = null, master = null, sfx = null, crowdGain = null, musicGain = null, noiseBuf = null, crowdLevel = 0.05, musicTimer = 0, musicStep = 0;
  const A = FK.Audio = {};

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    sfx = ctx.createGain(); sfx.gain.value = 0.8; sfx.connect(master);
    musicGain = ctx.createGain(); musicGain.gain.value = 0; musicGain.connect(master);
    // Rauschen für Publikum, Schüsse, Wind
    const len = ctx.sampleRate * 2; noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); let b = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; b = 0.97 * b + 0.03 * w; d[i] = b * 3 + w * 0.15; }
    // Publikum: zwei gefilterte Rauschschleifen
    crowdGain = ctx.createGain(); crowdGain.gain.value = 0; crowdGain.connect(master);
    [380, 900].forEach((f, i) => {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; s.loopStart = i * 0.7;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 0.7;
      s.connect(bp); bp.connect(crowdGain); s.start(0, i * 0.5);
    });
    return ctx;
  }
  A.unlock = () => { const c = ensure(); if (c && c.state === 'suspended') c.resume().catch(() => {}); A.apply(); };
  A.apply = () => {
    if (!ctx) return;
    master.gain.setTargetAtTime(FK.settings.sound ? 0.9 : 0, ctx.currentTime, 0.05);
  };
  const ok = () => ctx && FK.settings.sound && ctx.state === 'running';

  function tone(freq, dur, type, vol, slideTo, delay) {
    if (!ok()) return;
    const t = ctx.currentTime + (delay || 0), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(sfx); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, freq, vol, type, delay) {
    if (!ok()) return;
    const t = ctx.currentTime + (delay || 0), s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = type || 'lowpass'; f.frequency.value = freq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(sfx); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }

  A.kick = p => { p = p == null ? 0.5 : p; tone(140, 0.12, 'sine', 0.35 + p * 0.3, 45); noise(0.07, 1800 + p * 2000, 0.25 + p * 0.3); };
  A.post = () => { tone(980, 0.5, 'triangle', 0.25); tone(1470, 0.35, 'sine', 0.12); };
  A.tackle = () => { noise(0.18, 600, 0.35); tone(90, 0.15, 'sine', 0.25, 50); };
  A.whistle = (n, long) => {
    for (let i = 0; i < (n || 1); i++) {
      const d = (long && i === n - 1) ? 0.75 : 0.22, dl = i * 0.32;
      if (!ok()) return;
      const t = ctx.currentTime + dl, o = ctx.createOscillator(), lfo = ctx.createOscillator(), lg = ctx.createGain(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = 2650; lfo.frequency.value = 38; lg.gain.value = 140;
      lfo.connect(lg); lg.connect(o.frequency);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.02); g.gain.setValueAtTime(0.16, t + d - 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(sfx); o.start(t); lfo.start(t); o.stop(t + d + 0.05); lfo.stop(t + d + 0.05);
    }
  };
  A.ui = () => tone(660, 0.07, 'triangle', 0.12, 880);
  A.move = () => tone(520, 0.04, 'sine', 0.06);
  A.back = () => tone(500, 0.08, 'triangle', 0.1, 330);
  A.special = () => { tone(220, 0.6, 'sawtooth', 0.12, 880); noise(0.6, 3000, 0.2, 'highpass'); tone(880, 0.4, 'sine', 0.15, 1760, 0.15); };
  A.save = () => { noise(0.2, 900, 0.3); tone(200, 0.15, 'sine', 0.2, 80); };
  A.goal = () => {
    A.crowdBurst(1, 4.5);
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.45, 'square', 0.06, null, i * 0.11));
  };
  A.miss = () => A.crowdBurst(0.45, 1.4);
  // Publikum
  A.crowd = lvl => { crowdLevel = lvl; if (ctx) crowdGain.gain.setTargetAtTime(FK.settings.sound ? lvl : 0, ctx.currentTime, 0.4); };
  A.crowdBurst = (amt, dur) => {
    if (!ctx) return; const t = ctx.currentTime, g = crowdGain.gain;
    g.cancelScheduledValues(t); g.setTargetAtTime(FK.settings.sound ? 0.16 + amt * 0.3 : 0, t, 0.08);
    g.setTargetAtTime(FK.settings.sound ? crowdLevel : 0, t + dur, 0.8);
  };

  // Menümusik: ruhiger Synth-Loop, sehr sparsam
  const CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
  const mf = n => 440 * Math.pow(2, (n - 69) / 12);
  function musicTick() {
    if (!ctx || !FK.settings.music || !FK.settings.sound) return;
    const t = ctx.currentTime + 0.05, step = musicStep++, bar = Math.floor(step / 8) % 4, ch = CH[bar], beat = 0.3;
    if (step % 8 === 0) ch.forEach(n => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.value = mf(n); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.035, t + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + beat * 8); o.connect(g); g.connect(musicGain); o.start(t); o.stop(t + beat * 8 + 0.05); });
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine';
    o.frequency.value = mf(ch[(step * 2) % 3] + 12 + (step % 4 === 3 ? 12 : 0));
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.03, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    o.connect(g); g.connect(musicGain); o.start(t); o.stop(t + 0.3);
    if (step % 2 === 0) { const k = ctx.createOscillator(), kg = ctx.createGain(); k.frequency.setValueAtTime(110, t); k.frequency.exponentialRampToValueAtTime(40, t + 0.15); kg.gain.setValueAtTime(0.08, t); kg.gain.exponentialRampToValueAtTime(0.0001, t + 0.18); k.connect(kg); kg.connect(musicGain); k.start(t); k.stop(t + 0.2); }
  }
  A.music = on => {
    if (!ctx) return;
    musicGain.gain.setTargetAtTime(on && FK.settings.music ? 1 : 0, ctx.currentTime, 0.4);
    clearInterval(musicTimer); musicTimer = 0;
    if (on && FK.settings.music) musicTimer = setInterval(musicTick, 300);
  };
  // Pausieren, wenn der Tab verdeckt ist (spart Akku)
  document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend().catch(() => {}); else ctx.resume().catch(() => {}); });
})();
