/* Spinwelten 3D – Klang: alle Geräusche werden mit WebAudio erzeugt (keine Audiodateien), dazu eine leise Inselmelodie
 * aus Tonleiter und Tempo der Welt. Startet erst nach der ersten Berührung, pausiert im Hintergrund. */
(function (SW) {
  'use strict';
  let ctx = null, master = null, sfxG = null, musG = null, timer = null, step = 0, song = null;
  const set = { sfx: 0.8, music: 0.4 };
  const SCALES = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], penta: [0, 2, 4, 7, 9], pentatonic: [0, 2, 4, 7, 9], dorian: [0, 2, 3, 5, 7, 9, 10], lydian: [0, 2, 4, 6, 7, 9, 11], mixo: [0, 2, 4, 5, 7, 9, 10], whole: [0, 2, 4, 6, 8, 10], blues: [0, 3, 5, 6, 7, 10] };
  const ROOT = { C: 0, 'C#': 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext; if (!AC) return false;
    try { ctx = new AC(); } catch (e) { return false; }
    master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
    sfxG = ctx.createGain(); sfxG.gain.value = set.sfx; sfxG.connect(master);
    musG = ctx.createGain(); musG.gain.value = set.music * 0.35; musG.connect(master);
    document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else ctx.resume(); });
    return true;
  }
  function tone(f, t0, dur, type, vol, dest, slide) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.3, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(dest || sfxG); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noise(t0, dur, vol, freq) {
    const n = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = b; f.type = 'bandpass'; f.frequency.value = freq || 800; g.gain.value = vol || 0.3;
    s.connect(f); f.connect(g); g.connect(sfxG); s.start(t0);
  }
  const FX = {
    click: t => tone(880, t, 0.06, 'triangle', 0.15),
    spin: t => { tone(220, t, 0.25, 'sawtooth', 0.08, null, 2.5); noise(t, 0.3, 0.12, 1200); },
    stop: t => { tone(440, t, 0.08, 'square', 0.08); noise(t, 0.06, 0.15, 3000); },
    coin: t => { tone(1320, t, 0.08, 'square', 0.07); tone(1760, t + 0.06, 0.12, 'square', 0.06); },
    win: t => [0, 4, 7, 12].forEach((n, i) => tone(523 * Math.pow(2, n / 12), t + i * 0.08, 0.25, 'triangle', 0.18)),
    big: t => [0, 4, 7, 12, 16, 19, 24].forEach((n, i) => tone(392 * Math.pow(2, n / 12), t + i * 0.07, 0.4, 'triangle', 0.2)),
    build: t => { noise(t, 0.12, 0.2, 400); tone(330, t + 0.05, 0.2, 'triangle', 0.15); tone(495, t + 0.15, 0.25, 'triangle', 0.15); },
    attack: t => { tone(160, t, 0.6, 'sawtooth', 0.12, null, 0.4); noise(t, 0.5, 0.15, 500); },
    hit: t => { noise(t, 0.5, 0.4, 200); tone(90, t, 0.4, 'sine', 0.35, null, 0.5); },
    shield: t => { tone(660, t, 0.35, 'sine', 0.2, null, 1.6); tone(990, t + 0.05, 0.3, 'sine', 0.12, null, 1.4); },
    dig: t => { noise(t, 0.18, 0.3, 300); noise(t + 0.2, 0.18, 0.3, 350); },
    chest: t => { tone(392, t, 0.15, 'triangle', 0.15); tone(587, t + 0.12, 0.15, 'triangle', 0.15); tone(784, t + 0.24, 0.4, 'triangle', 0.18); },
    error: t => tone(180, t, 0.18, 'square', 0.1, null, 0.8),
    level: t => [0, 7, 12].forEach((n, i) => tone(659 * Math.pow(2, n / 12), t + i * 0.1, 0.3, 'sine', 0.2)),
    island: t => [0, 4, 7, 11, 12, 16].forEach((n, i) => tone(440 * Math.pow(2, n / 12), t + i * 0.12, 0.6, 'triangle', 0.16))
  };
  function sfx(name) {
    if (!ctx || set.sfx <= 0 || ctx.state !== 'running') return;
    const f = FX[name]; if (f) try { f(ctx.currentTime + 0.01); } catch (e) { /* ignorieren */ }
  }
  // Musik: einfacher Achtel-Loop (Bass + Arpeggio + gelegentliche Melodie), aus Weltdaten
  function music(def) {
    song = def || song;
    if (timer) { clearInterval(timer); timer = null; }
    if (!ctx || !song || set.music <= 0) return;
    const sc = SCALES[song.scale] || SCALES.penta, root = typeof song.root === 'number' ? song.root : 48 + (ROOT[song.root] || 0), tempo = song.tempo || 96;
    const eighth = 60 / tempo / 2; let next = ctx.currentTime + 0.1; step = 0;
    const rng = SW.rng ? SW.rng.seeded('mus' + song.root + song.scale + tempo) : { next: Math.random };
    const prog = [0, 3, 4, 2].map(d => d % sc.length);
    const mel = Array.from({ length: 32 }, () => (rng.next() < 0.45 ? Math.floor(rng.next() * sc.length) : -1));
    const midi = (deg, oct) => root + sc[((deg % sc.length) + sc.length) % sc.length] + 12 * (oct + Math.floor(deg / sc.length));
    const hz = m => 440 * Math.pow(2, (m - 69) / 12);
    timer = setInterval(() => {
      if (ctx.state !== 'running') { next = ctx.currentTime + 0.1; return; }
      while (next < ctx.currentTime + 0.25) {
        const bar = Math.floor(step / 8) % 4, ch = prog[bar], s8 = step % 8;
        if (s8 === 0) tone(hz(midi(ch, -1)), next, eighth * 7, 'sine', 0.22, musG);
        if (s8 % 2 === 0) tone(hz(midi(ch + [0, 2, 4, 2][(s8 / 2) | 0], 1)), next, eighth * 1.6, 'triangle', 0.07, musG);
        const m = mel[step % 32]; if (m >= 0 && s8 % 2 === 1) tone(hz(midi(m, 2)), next, eighth * 2.5, 'sine', 0.06, musG);
        next += eighth; step++;
      }
    }, 100);
  }
  function setVol(k, v) {
    set[k] = Math.max(0, Math.min(1, v));
    if (!ctx) return;
    if (k === 'sfx') sfxG.gain.value = set.sfx;
    if (k === 'music') { musG.gain.value = set.music * 0.35; if (set.music <= 0 && timer) { clearInterval(timer); timer = null; } else if (set.music > 0 && !timer) music(); }
  }
  SW.Audio = { init, sfx, music, setVol, get ready() { return !!ctx; } };
})(globalThis.SW = globalThis.SW || {});
