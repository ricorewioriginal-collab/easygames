/* Urwaldlager – Klang: alles im Browser erzeugt (Web Audio), keine Audiodateien
   Musik: Marimba-Loop (Camp), Trommeln (Prüfung), Fanfare (Sieg). Atmo: Dschungel (Zikaden, Vögel) oder Studio-Publikum. */
(function () {
  'use strict';
  const UL = window.UL;
  const Au = UL.Audio = { ctx: null, on: false };
  let master, musicG, sfxG, atmoG, noiseBuf;
  Au.init = () => {
    if (Au.ctx) { if (Au.ctx.state === 'suspended') Au.ctx.resume(); return; }
    try { Au.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    const c = Au.ctx;
    master = c.createGain(); master.connect(c.destination);
    musicG = c.createGain(); musicG.connect(master); sfxG = c.createGain(); sfxG.connect(master); atmoG = c.createGain(); atmoG.connect(master);
    noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    Au.vol(); Au.on = true;
    setInterval(tick, 50);
  };
  Au.vol = () => { if (!master) return; musicG.gain.value = UL.settings.music * 0.35; sfxG.gain.value = UL.settings.sfx * 0.6; atmoG.gain.value = UL.settings.sfx * 0.25; };
  const now = () => Au.ctx.currentTime;
  function tone(f, t0, dur, type = 'sine', vol = 0.3, dest = sfxG, slide = 0) {
    const c = Au.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(dest); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noise(t0, dur, vol = 0.2, f = 1200, q = 1, dest = sfxG, type = 'bandpass') {
    const c = Au.ctx, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    s.buffer = noiseBuf; fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(fl); fl.connect(g); g.connect(dest); s.start(t0, Math.random()); s.stop(t0 + dur + 0.05);
  }
  // Stimme per Formant-Synthese: Schreie, Ekel-Laute, Jubel (kein Sprachsample)
  const VOW = { a: [800, 1200, 2600], i: [300, 2300, 3000], u: [350, 800, 2400], e: [500, 1900, 2600], o: [500, 900, 2500] };
  function voice(t0, { f0 = 300, to = 1, dur = 0.6, v = 'a', vol = 0.32, vib = 6, rough = 0 } = {}) {
    const c = Au.ctx, o = c.createOscillator(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(Math.max(60, f0 * to), t0 + dur);
    lfo.frequency.value = vib; lg.gain.value = f0 * (0.03 + rough); lfo.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.04); g.gain.setValueAtTime(vol, t0 + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    const mix = c.createGain(); mix.gain.value = 1; g.connect(mix);
    (VOW[v] || VOW.a).forEach((f, i) => { const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 6 + i * 2; const bg = c.createGain(); bg.gain.value = [1, 0.6, 0.25][i]; o.connect(bp); bp.connect(bg); bg.connect(g); });
    mix.connect(sfxG); o.start(t0); lfo.start(t0); o.stop(t0 + dur + 0.05); lfo.stop(t0 + dur + 0.05);
  }
  Au.voicePitch = 1;   // höher/tiefer je nach Figur
  const vp = () => Au.voicePitch * (0.94 + Math.random() * 0.12);
  const SFX = {
    scream: t => { const p = vp(); voice(t, { f0: 420 * p, to: 1.5, dur: 0.75, v: 'a', vol: 0.3, vib: 9, rough: 0.05 }); noise(t, 0.5, 0.05, 2500, 1); },
    yuck: t => { const p = vp(); voice(t, { f0: 320 * p, to: 1.35, dur: 0.6, v: 'i', vol: 0.28, vib: 7 }); },
    ugh: t => { const p = vp(); voice(t, { f0: 160 * p, to: 0.7, dur: 0.45, v: 'u', vol: 0.3, vib: 4, rough: 0.08 }); },
    yay: t => { const p = vp(); voice(t, { f0: 330 * p, to: 1.6, dur: 0.35, v: 'e', vol: 0.22 }); voice(t + 0.32, { f0: 520 * p, to: 1.1, dur: 0.45, v: 'a', vol: 0.24 }); },
    gasp: t => noise(t, 0.35, 0.18, 1800, 0.8, sfxG, 'highpass'),
    ooh: t => { for (let i = 0; i < 5; i++) voice(t + i * 0.03, { f0: 180 + i * 35, to: 0.8, dur: 1.1, v: 'o', vol: 0.06 }); },
    laugh: t => { const p = vp(); for (let i = 0; i < 4; i++) voice(t + i * 0.16, { f0: 260 * p * (1 - i * 0.04), to: 0.9, dur: 0.12, v: 'a', vol: 0.18 }); },
    tick: t => tone(880, t, 0.05, 'triangle', 0.08),
    ok: t => { tone(660, t, 0.08, 'triangle', 0.15); tone(990, t + 0.06, 0.1, 'triangle', 0.12); },
    back: t => tone(440, t, 0.1, 'triangle', 0.12, sfxG, 0.7),
    star: t => { [988, 1319, 1760].forEach((f, i) => tone(f, t + i * 0.06, 0.25, 'triangle', 0.18)); },
    bad: t => { tone(220, t, 0.25, 'sawtooth', 0.12, sfxG, 0.6); },
    splash: t => noise(t, 0.5, 0.35, 600, 0.7, sfxG, 'lowpass'),
    slime: t => { noise(t, 0.35, 0.3, 300, 2); tone(140, t, 0.3, 'sine', 0.2, sfxG, 0.5); },
    pick: t => tone(520, t, 0.08, 'square', 0.08, sfxG, 1.5),
    chop: t => noise(t, 0.12, 0.35, 900, 3),
    step: t => noise(t, 0.06, 0.06, 300, 1, sfxG, 'lowpass'),
    jump: t => tone(300, t, 0.18, 'square', 0.07, sfxG, 2.2),
    gong: t => { tone(110, t, 2.5, 'sine', 0.35); tone(165, t, 2.2, 'sine', 0.15); tone(331, t, 1.4, 'triangle', 0.06); },
    drum: t => { tone(90, t, 0.3, 'sine', 0.4, sfxG, 0.5); noise(t, 0.08, 0.2, 2000, 1); },
    fanfare: t => { [523, 659, 784, 1047].forEach((f, i) => { tone(f, t + i * 0.14, 0.5, 'sawtooth', 0.1); tone(f / 2, t + i * 0.14, 0.5, 'triangle', 0.1); }); },
    cheer: t => { for (let i = 0; i < 6; i++) noise(t + i * 0.05, 1.4, 0.12, 900 + i * 300, 0.6); },
    boo: t => { noise(t, 1, 0.15, 250, 1); tone(120, t, 1, 'sawtooth', 0.04, sfxG, 0.8); },
    eat: t => { for (let i = 0; i < 3; i++) noise(t + i * 0.12, 0.08, 0.25, 700, 4); },
    gulp: t => tone(200, t, 0.25, 'sine', 0.3, sfxG, 0.5),
    tense: t => { tone(55, t, 1.6, 'sawtooth', 0.08); tone(58, t, 1.6, 'sawtooth', 0.08); },
    phone: t => { for (let i = 0; i < 4; i++) tone(i % 2 ? 1200 : 1500, t + i * 0.09, 0.08, 'square', 0.06); },
    whoosh: t => noise(t, 0.4, 0.2, 1500, 0.5, sfxG, 'highpass'),
    hiss: t => { noise(t, 0.7, 0.16, 5200, 2, sfxG, 'highpass'); },
    crunch: t => { for (let i = 0; i < 4; i++) noise(t + i * 0.04, 0.05, 0.3, 2500, 5); }
  };
  Au.sfx = (n) => { if (!Au.on) return; const f = SFX[n]; if (f) try { f(now()); } catch (e) { } };

  // ---------- Musik (Schritt-Sequenzer) ----------
  const SONG = {
    camp: { bpm: 104, steps: 16, f: (s, t, b) => { const sc = [0, 2, 4, 7, 9]; const bass = [48, 48, 43, 45][Math.floor(b % 4)]; if (s % 4 === 0) tone(mt(bass), t, 0.35, 'triangle', 0.18, musicG); if ([0, 3, 6, 8, 11, 14].includes(s)) tone(mt(60 + sc[(s * 7 + b * 3) % 5] + (s > 8 ? 12 : 0)), t, 0.22, 'sine', 0.12, musicG); if (s % 2 === 1) noise(t, 0.03, 0.05, 6000, 1, musicG, 'highpass'); } },
    trial: { bpm: 128, steps: 16, f: (s, t, b) => { if (s % 4 === 0) tone(60, t, 0.25, 'sine', 0.35, musicG, 0.5); if (s % 8 === 4) noise(t, 0.12, 0.18, 1800, 1, musicG); if (s % 2) noise(t, 0.03, 0.06, 7000, 1, musicG, 'highpass'); if ([0, 6, 10].includes(s)) tone(mt([45, 45, 41, 43][b % 4]), t, 0.18, 'sawtooth', 0.06, musicG); } },
    tense: { bpm: 70, steps: 8, f: (s, t, b) => { if (s === 0) { tone(mt(40), t, 3, 'sawtooth', 0.05, musicG); tone(mt(47), t, 3, 'sine', 0.06, musicG); } if (s % 2 === 0) tone(1200 + (s * 50), t, 0.05, 'sine', 0.02, musicG); } },
    show: { bpm: 118, steps: 16, f: (s, t, b) => { if (s % 4 === 0) tone(55, t, 0.2, 'sine', 0.3, musicG, 0.5); if (s % 4 === 2) noise(t, 0.1, 0.12, 2500, 1, musicG); const ch = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]][b % 4]; if (s === 0 || s === 10) ch.forEach(n => tone(mt(n + 12), t, 0.4, 'triangle', 0.05, musicG)); if (s % 2 === 0) tone(mt(ch[0] - 12), t, 0.15, 'square', 0.04, musicG); } },
    night: { bpm: 60, steps: 8, f: (s, t, b) => { if (s === 0) [48, 55, 64].forEach(n => tone(mt(n), t, 3.5, 'sine', 0.06, musicG)); if (s === 4) tone(mt(67 + (b % 2) * 2), t, 1.5, 'sine', 0.05, musicG); } }
  };
  const mt = n => 440 * Math.pow(2, (n - 69) / 12);
  let song = null, step = 0, bar = 0, nextT = 0;
  Au.music = (name) => { if (!Au.on) { Au._want = name; return; } song = SONG[name] || null; step = 0; bar = 0; nextT = now() + 0.1; };
  // ---------- Atmo ----------
  let atmo = null, atmoT = 0;
  Au.atmo = (name) => { atmo = name; };
  function tick() {
    if (!Au.ctx || Au.ctx.state !== 'running') return;
    const t = now();
    if (Au._want) { const w = Au._want; Au._want = null; Au.music(w); }
    if (song) {
      const dt = 60 / song.bpm / 4;
      while (nextT < t + 0.15) { try { song.f(step, nextT, bar); } catch (e) { } step++; if (step >= song.steps) { step = 0; bar++; } nextT += dt; }
    }
    if (atmo && t > atmoT) {
      if (atmo === 'jungle') {
        atmoT = t + 0.6 + Math.random() * 1.6;
        if (Math.random() < 0.5) { const f = 2400 + Math.random() * 1800; for (let i = 0; i < 3; i++) tone(f * (1 + i * 0.06), t + i * 0.09, 0.07, 'sine', 0.05, atmoG, 1.2); }
        else noise(t, 1.6, 0.05, 5500, 8, atmoG);
      } else if (atmo === 'night') {
        atmoT = t + 0.4 + Math.random(); noise(t, 0.9, 0.04, 4200, 14, atmoG);
        if (Math.random() < 0.15) tone(380, t, 0.4, 'sine', 0.04, atmoG, 0.8);
      } else if (atmo === 'studio') {
        atmoT = t + 1.5 + Math.random() * 2; noise(t, 1.8, 0.03, 800, 0.5, atmoG);
      } else atmoT = t + 1;
    }
  }
  // Start erst nach einer Nutzeraktion (Browser-Regel)
  ['pointerdown', 'keydown', 'touchstart'].forEach(e => addEventListener(e, () => Au.init(), { once: false, passive: true }));
  setInterval(() => { try { const g = navigator.getGamepads && navigator.getGamepads(); if (g) for (const p of g) if (p && p.buttons && p.buttons.some(b => b.pressed)) { Au.init(); break; } } catch (e) { } }, 500);
})();
