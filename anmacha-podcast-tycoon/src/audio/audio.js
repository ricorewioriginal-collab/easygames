/* Klang ohne Audiodateien: WebAudio-Synthese für Effekte (Namen oder Rezepte), kurze Musikschleifen und Sprech-Piepser.
   Getrennte Lautstärken (gesamt, Musik, Effekte, Stimmen). Startet erst nach einer Nutzergeste; pausiert im Hintergrund. */
(function (root) {
  'use strict';
  const PT = root.PT = root.PT || {};
  let ctx = null, master = null, busMusic = null, busFx = null, busVoice = null, noiseBuf = null;
  const vol = { master: 0.8, music: 0.45, fx: 0.8, voice: 0.6 };
  let muted = false, musicName = null, musicTimer = null, musicStep = 0, nextNoteAt = 0, active = 0;
  const NAMED = {
    good: [{ wave: 'triangle', f: 660, t: 0, d: 0.09, v: 0.35 }, { wave: 'triangle', f: 990, t: 0.08, d: 0.14, v: 0.35 }],
    bad: [{ wave: 'sawtooth', f: 220, f2: 140, t: 0, d: 0.25, v: 0.25, filter: { type: 'lowpass', f: 1200 } }],
    tick: [{ wave: 'square', f: 1400, t: 0, d: 0.03, v: 0.12 }],
    win: [523, 659, 784, 1047].map((f, i) => ({ wave: 'triangle', f, t: i * 0.11, d: 0.22, v: 0.3 })),
    lose: [392, 330, 262].map((f, i) => ({ wave: 'sawtooth', f, t: i * 0.16, d: 0.3, v: 0.18, filter: { type: 'lowpass', f: 1400 } })),
    pop: [{ wave: 'sine', f: 300, f2: 900, t: 0, d: 0.08, v: 0.35 }],
    coin: [{ wave: 'square', f: 988, t: 0, d: 0.07, v: 0.15 }, { wave: 'square', f: 1319, t: 0.07, d: 0.2, v: 0.15 }],
    whoosh: [{ wave: 'noise', f: 0, t: 0, d: 0.35, v: 0.3, filter: { type: 'bandpass', f: 900, q: 1.5 } }],
    click: [{ wave: 'square', f: 900, t: 0, d: 0.025, v: 0.12 }],
    beep: [{ wave: 'sine', f: 1000, t: 0, d: 0.12, v: 0.25 }],
    buzz: [{ wave: 'sawtooth', f: 110, t: 0, d: 0.35, v: 0.22 }],
    door: [{ wave: 'noise', f: 0, t: 0, d: 0.15, v: 0.2, filter: { type: 'lowpass', f: 600 } }, { wave: 'sine', f: 180, t: 0.05, d: 0.1, v: 0.2 }],
    cash: [{ wave: 'square', f: 1568, t: 0, d: 0.05, v: 0.12 }, { wave: 'square', f: 2093, t: 0.06, d: 0.25, v: 0.12 }, { wave: 'noise', f: 0, t: 0, d: 0.1, v: 0.1, filter: { type: 'highpass', f: 4000 } }],
    build: [{ wave: 'triangle', f: 200, f2: 120, t: 0, d: 0.12, v: 0.35 }, { wave: 'noise', f: 0, t: 0, d: 0.06, v: 0.15, filter: { type: 'lowpass', f: 1500 } }],
    onair: [{ wave: 'sine', f: 880, t: 0, d: 0.15, v: 0.25 }, { wave: 'sine', f: 880, t: 0.25, d: 0.15, v: 0.25 }, { wave: 'sine', f: 1760, t: 0.5, d: 0.4, v: 0.25 }],
    mission: [523, 784, 1047, 1319].map((f, i) => ({ wave: 'triangle', f, t: i * 0.09, d: 0.35, v: 0.25 }))
  };
  // Musikschleifen: [Bassnoten], [Akkorde], Tempo – alles eigene, einfache Muster
  const SONGS = {
    menu: { bpm: 96, bass: [45, 45, 52, 52, 50, 50, 47, 49], chords: [[57, 61, 64], [57, 61, 64], [52, 56, 59], [50, 54, 57]] },
    city: { bpm: 104, bass: [48, 55, 52, 55, 53, 57, 55, 50], chords: [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]] },
    studio: { bpm: 88, bass: [43, 43, 47, 47, 48, 48, 50, 50], chords: [[55, 59, 62], [59, 62, 66], [60, 64, 67], [62, 66, 69]] },
    night: { bpm: 72, bass: [40, 40, 43, 43, 45, 45, 38, 38], chords: [[52, 55, 59], [55, 59, 62], [57, 60, 64], [50, 54, 57]] },
    festival: { bpm: 124, bass: [41, 41, 53, 41, 43, 43, 55, 43], chords: [[65, 69, 72], [65, 69, 72], [67, 71, 74], [67, 71, 74]] }
  };
  const midi = n => 440 * Math.pow(2, (n - 69) / 12);

  function ensure() {
    if (ctx) return ctx;
    const AC = root.AudioContext || root.webkitAudioContext; if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    master = ctx.createGain(); master.connect(ctx.destination);
    busMusic = ctx.createGain(); busFx = ctx.createGain(); busVoice = ctx.createGain();
    [busMusic, busFx, busVoice].forEach(b => b.connect(master));
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); let s = 12345; for (let i = 0; i < d.length; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; d[i] = s / 0x3fffffff - 1; }
    apply(); return ctx;
  }
  function apply() { if (!ctx) return; master.gain.value = muted ? 0 : vol.master; busMusic.gain.value = vol.music; busFx.gain.value = vol.fx; busVoice.gain.value = vol.voice; }
  function part(p, t0, bus) {
    if (active > 48) return; // Schutz vor zu vielen gleichzeitigen Stimmen
    const t = t0 + (p.t || 0), d = Math.max(0.01, p.d || 0.2), v = Math.min(0.6, p.v == null ? 0.3 : p.v);
    let src;
    if (p.wave === 'noise') { src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true; }
    else { src = ctx.createOscillator(); src.type = p.wave || 'sine'; src.frequency.setValueAtTime(Math.max(1, p.f || 440), t); if (p.f2) src.frequency.exponentialRampToValueAtTime(Math.max(1, p.f2), t + d); }
    let node = src;
    if (p.lfo && src.frequency) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = p.lfo.f || 5; lg.gain.value = p.lfo.depth || 20; l.connect(lg); lg.connect(src.frequency); l.start(t); l.stop(t + d + 0.05); }
    if (p.filter) { const f = ctx.createBiquadFilter(); f.type = p.filter.type || 'lowpass'; f.frequency.value = p.filter.f || 1000; f.Q.value = p.filter.q || 1; node.connect(f); node = f; }
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + Math.min(0.015, d / 4)); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    node.connect(g); g.connect(bus);
    active++; src.onended = () => { active--; try { g.disconnect(); } catch (e) { /* schon getrennt */ } };
    src.start(t); src.stop(t + d + 0.02);
  }
  function play(parts, bus, delay) { if (!ensure() || ctx.state !== 'running') return; const t0 = ctx.currentTime + 0.01 + (delay || 0); parts.forEach(p => part(p, t0, bus)); }

  function musicTick() {
    if (!ctx || !musicName || ctx.state !== 'running') return;
    const S = SONGS[musicName], beat = 60 / S.bpm / 2;
    while (nextNoteAt < ctx.currentTime + 0.25) {
      const i = musicStep % 16, bar = Math.floor(musicStep / 4) % 4;
      const bn = S.bass[Math.floor(musicStep / 2) % S.bass.length];
      if (i % 2 === 0) part({ wave: 'triangle', f: midi(bn - 12), t: 0, d: beat * 1.6, v: 0.22, filter: { type: 'lowpass', f: 600 } }, nextNoteAt, busMusic);
      if (i % 4 === 0) S.chords[bar].forEach(n => part({ wave: 'sine', f: midi(n), t: 0, d: beat * 3.5, v: 0.05 }, nextNoteAt, busMusic));
      if (i % 4 === 2) part({ wave: 'noise', f: 0, t: 0, d: 0.04, v: 0.05, filter: { type: 'highpass', f: 6000 } }, nextNoteAt, busMusic);
      if (i % 8 === 0) part({ wave: 'sine', f: 110, f2: 45, t: 0, d: 0.15, v: 0.25 }, nextNoteAt, busMusic);
      nextNoteAt += beat; musicStep++;
    }
  }

  const A = PT.Audio = {
    unlock() { if (!ensure()) return; if (ctx.state === 'suspended') ctx.resume().catch(() => {}); },
    get ready() { return !!ctx && ctx.state === 'running'; },
    fx(x, delay) { if (!x) return; const parts = typeof x === 'string' ? NAMED[x] : x.recipe ? x.recipe.parts : x.parts; if (parts) play(parts, busFx, delay); },
    /** Liste aus einem Minispiel-Zustand abspielen und leeren. */
    drain(list) { if (!list || !list.length) return; list.splice(0, list.length).slice(0, 6).forEach(x => A.fx(x)); },
    sound(id) { const s = PT.DATA && PT.DATA.sounds && PT.DATA.sounds.find(x => x.id === id); if (s) play(s.parts, busFx); },
    /** Sprech-Piepser für Dialoge; voice: 'marco' | 'andrew' | 'npc' | Zahl (Tonhöhe). */
    blip(voice) {
      const base = voice === 'marco' ? 150 : voice === 'andrew' ? 210 : typeof voice === 'number' ? voice : 260;
      play([{ wave: 'square', f: base * (0.9 + Math.random() * 0.25), t: 0, d: 0.05, v: 0.08, filter: { type: 'lowpass', f: 1800 } }], busVoice);
    },
    music(name) {
      if (name === musicName) return; musicName = SONGS[name] ? name : null;
      if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
      if (!musicName || !ensure()) return;
      musicStep = 0; nextNoteAt = ctx.currentTime + 0.1; musicTimer = setInterval(musicTick, 100);
    },
    setVolume(k, v) { if (k in vol) { vol[k] = Math.max(0, Math.min(1, +v || 0)); apply(); } },
    volume: k => vol[k],
    mute(m) { muted = !!m; apply(); },
    get muted() { return muted; },
    names: Object.keys(NAMED), songs: Object.keys(SONGS)
  };
  if (typeof document !== 'undefined') {
    const go = () => A.unlock();
    ['pointerdown', 'keydown', 'touchend'].forEach(e => document.addEventListener(e, go, { passive: true }));
    document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend().catch(() => {}); else ctx.resume().catch(() => {}); });
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = A;
})(typeof window !== 'undefined' ? window : globalThis);
