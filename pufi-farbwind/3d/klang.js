/* Pufi 3D – Klang: eigene Musik (im Code komponiert, WebAudio-Sequenzer mit Hall) und Effekte.
 * Effekte: Momo Adventures SFX (GreenRetroman), Kenney CC0 (aus bunte-insel/sounds), dazu Synthesizer-Töne. */
(function (root) {
  'use strict';
  let ac = null, master, musicBus, sfxBus, verb, verbIn, comp, lp;
  const buffers = {};
  const opt = { music: 0.7, sfx: 0.85, on: true };
  const FILES = {
    jump: 'assets/sfx/jump.mp3', superjump: 'assets/sfx/super-jump.mp3', ultra: 'assets/sfx/ultra-jump.mp3', gift: 'assets/sfx/gift.mp3',
    life: 'assets/sfx/life.mp3', hit: 'assets/sfx/hit.mp3', hurt: 'assets/sfx/hurt.mp3', button: 'assets/sfx/button.mp3',
    leaf: 'assets/sfx/leaf.mp3', land: 'assets/sfx/on-ground.mp3', shoot: 'assets/sfx/shoot-normal.mp3', kid: 'assets/sfx/kid.mp3', kidjump: 'assets/sfx/kid-jump.mp3',
    bump: '../bunte-insel/sounds/bump.mp3', bonk: '../bunte-insel/sounds/bonk.mp3', thwack: '../bunte-insel/sounds/thwack.mp3', kick: '../bunte-insel/sounds/kick.mp3', coins: '../bunte-insel/sounds/coins.mp3'
  };
  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume().catch(() => { }); return ac; }
    const AC = root.AudioContext || root.webkitAudioContext; if (!AC) return null;
    try { ac = new AC(); } catch (e) { return null; }
    comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3;
    master = ac.createGain(); master.gain.value = opt.on ? 1 : 0; master.connect(comp); comp.connect(ac.destination);
    lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 20000;
    musicBus = ac.createGain(); musicBus.gain.value = opt.music * 0.55; musicBus.connect(lp); lp.connect(master);
    sfxBus = ac.createGain(); sfxBus.gain.value = opt.sfx; sfxBus.connect(master);
    // Hall: selbst erzeugte Impulsantwort
    verb = ac.createConvolver(); const len = ac.sampleRate * 2.2, ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    verb.buffer = ir; verbIn = ac.createGain(); verbIn.gain.value = 0.32; verbIn.connect(verb); const vOut = ac.createGain(); vOut.gain.value = 0.55; verb.connect(vOut); vOut.connect(master);
    for (const k in FILES) load(k);
    return ac;
  }
  function load(k) {
    try {
      fetch(FILES[k]).then(r => r.ok ? r.arrayBuffer() : null).then(b => b && ac.decodeAudioData(b, d => { buffers[k] = d; }, () => { })).catch(() => { });
    } catch (e) { }
  }
  function sample(k, vol = 1, rate = 1) {
    if (!ac || !buffers[k]) return false;
    const s = ac.createBufferSource(), g = ac.createGain(); s.buffer = buffers[k]; s.playbackRate.value = rate; g.gain.value = vol;
    s.connect(g); g.connect(sfxBus); s.start(); return true;
  }
  // ---------- Synthesizer-Bausteine ----------
  function tone(f, t0, dur, type = 'square', vol = 0.2, bus = sfxBus, slide = 0, send = 0.15) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(bus); if (send) { const s = ac.createGain(); s.gain.value = send; g.connect(s); s.connect(verbIn); }
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  let noiseBuf = null;
  function noise(t0, dur, f = 1200, q = 1, vol = 0.2, type = 'bandpass', bus = sfxBus, sweep = 0) {
    if (!noiseBuf) { noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noiseBuf; s.loop = true;
    fl.type = type; fl.frequency.setValueAtTime(f, t0); if (sweep) fl.frequency.exponentialRampToValueAtTime(f * sweep, t0 + dur); fl.Q.value = q;
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(fl); fl.connect(g); g.connect(bus); s.start(t0); s.stop(t0 + dur + 0.05);
  }
  const N = n => 440 * Math.pow(2, (n - 69) / 12);
  // ---------- Effekte ----------
  const SFX = {
    jump: () => sample('jump', 0.55) || tone(380, ac.currentTime, 0.18, 'square', 0.12, sfxBus, 2.2),
    flutter: () => { const t = ac.currentTime; for (let i = 0; i < 4; i++) noise(t + i * 0.06, 0.05, 900 + i * 200, 2, 0.12); },
    land: () => sample('land', 0.5),
    spring: () => { sample('superjump', 0.6) || 0; const t = ac.currentTime; tone(220, t, 0.45, 'sine', 0.25, sfxBus, 3.2, 0.3); },
    coin: () => { const t = ac.currentTime; tone(N(83), t, 0.07, 'square', 0.09); tone(N(88), t + 0.06, 0.28, 'square', 0.09); },
    red: () => { const t = ac.currentTime; [76, 80, 83, 88].forEach((n, i) => tone(N(n), t + i * 0.05, 0.22, 'triangle', 0.16)); },
    flower: () => { const t = ac.currentTime; [72, 76, 79, 84, 88].forEach((n, i) => tone(N(n), t + i * 0.07, 0.6, 'sine', 0.16, sfxBus, 0, 0.5)); sample('gift', 0.4); },
    star: () => { const t = ac.currentTime; tone(N(91), t, 0.12, 'sine', 0.12, sfxBus, 0, 0.5); tone(N(96), t + 0.05, 0.2, 'sine', 0.1, sfxBus, 0, 0.5); },
    tongue: () => { const t = ac.currentTime; noise(t, 0.16, 800, 3, 0.25, 'bandpass', sfxBus, 4); tone(500, t, 0.1, 'sine', 0.1, sfxBus, 1.8); },
    gulp: () => { const t = ac.currentTime; tone(300, t, 0.14, 'sine', 0.25, sfxBus, 0.4); },
    egg: () => { const t = ac.currentTime; tone(600, t, 0.08, 'sine', 0.2, sfxBus, 1.6); tone(900, t + 0.07, 0.1, 'sine', 0.15, sfxBus, 1.4); },
    throw: () => { sample('shoot', 0.6) || 0; const t = ac.currentTime; noise(t, 0.22, 600, 1.5, 0.22, 'bandpass', sfxBus, 5); },
    bounce: () => sample('bonk', 0.35, 1.4) || tone(500, ac.currentTime, 0.06, 'square', 0.08),
    pound: () => { const t = ac.currentTime; noise(t, 0.12, 2000, 1, 0.15, 'highpass', sfxBus, 0.3); },
    poundland: () => { sample('thwack', 0.8) || 0; const t = ac.currentTime; tone(110, t, 0.3, 'sine', 0.5, sfxBus, 0.4, 0.3); },
    stomp: () => { sample('kick', 0.7) || 0; const t = ac.currentTime; tone(240, t, 0.15, 'square', 0.12, sfxBus, 0.5); },
    poof: () => { const t = ac.currentTime; noise(t, 0.3, 1500, 0.7, 0.25, 'bandpass', sfxBus, 0.3); tone(660, t, 0.2, 'triangle', 0.12, sfxBus, 1.5, 0.4); },
    block: () => sample('bump', 0.7) || tone(150, ac.currentTime, 0.12, 'square', 0.2),
    hurt: () => { sample('hurt', 0.7); sample('kid', 0.5, 1.15); },
    bubble: () => { const t = ac.currentTime; tone(500, t, 0.15, 'sine', 0.2, sfxBus, 2.5, 0.4); tone(900, t + 0.1, 0.25, 'sine', 0.15, sfxBus, 1.5, 0.5); sample('kidjump', 0.5); },
    tick: () => tone(1320, ac.currentTime, 0.05, 'square', 0.06, sfxBus, 0, 0),
    ring: () => { const t = ac.currentTime; [67, 71, 74, 79, 83, 86].forEach((n, i) => tone(N(n), t + i * 0.06, 0.5, 'triangle', 0.13, sfxBus, 0, 0.5)); },
    oneup: () => { sample('life', 0.7) || 0; const t = ac.currentTime; [76, 79, 88, 84, 86, 91].forEach((n, i) => tone(N(n), t + i * 0.08, 0.14, 'square', 0.08)); },
    switch: () => { const t = ac.currentTime; tone(N(60), t, 0.08, 'square', 0.15); tone(N(67), t + 0.08, 0.08, 'square', 0.15); tone(N(72), t + 0.16, 0.2, 'square', 0.15); },
    swtick: () => tone(N(84), ac.currentTime, 0.04, 'square', 0.05, sfxBus, 0, 0),
    cloud: () => { sample('leaf', 0.6) || 0; const t = ac.currentTime; [72, 79, 84].forEach((n, i) => tone(N(n), t + i * 0.05, 0.4, 'sine', 0.18, sfxBus, 0, 0.6)); },
    crumble: () => { const t = ac.currentTime; noise(t, 0.4, 400, 0.8, 0.3, 'lowpass', sfxBus, 0.5); },
    select: () => sample('button', 0.5) || tone(N(79), ac.currentTime, 0.06, 'square', 0.08),
    ok: () => { const t = ac.currentTime; tone(N(79), t, 0.08, 'square', 0.08); tone(N(86), t + 0.06, 0.16, 'square', 0.08); },
    back: () => { const t = ac.currentTime; tone(N(74), t, 0.08, 'square', 0.07); tone(N(67), t + 0.06, 0.14, 'square', 0.07); },
    start: () => { const t = ac.currentTime; [60, 64, 67, 72, 76, 79, 84].forEach((n, i) => tone(N(n), t + i * 0.045, 0.5, 'triangle', 0.12, sfxBus, 0, 0.5)); sample('ultra', 0.35); },
    retro: () => { const t = ac.currentTime; [48, 55, 60, 67, 72].forEach((n, i) => tone(N(n), t + i * 0.05, 0.12, 'square', 0.09, sfxBus, 0, 0)); },
    bosshit: () => { sample('hit', 0.9); const t = ac.currentTime; tone(180, t, 0.5, 'sawtooth', 0.18, sfxBus, 0.3, 0.4); },
    bossroar: () => { const t = ac.currentTime; noise(t, 0.9, 300, 0.6, 0.35, 'lowpass', sfxBus, 0.4); tone(90, t, 0.9, 'sawtooth', 0.16, sfxBus, 0.6, 0.4); },
    shock: () => { const t = ac.currentTime; noise(t, 0.6, 200, 0.8, 0.45, 'lowpass', sfxBus); tone(60, t, 0.5, 'sine', 0.5, sfxBus, 0.5); },
    lose: () => { const t = ac.currentTime; [67, 66, 65, 64, 60].forEach((n, i) => tone(N(n), t + i * 0.16, 0.3, 'square', 0.1)); },
    splash: () => { const t = ac.currentTime; noise(t, 0.5, 900, 0.6, 0.3, 'bandpass', sfxBus, 0.3); }
  };
  function sfx(name) { if (!ac || !opt.on) return; const f = SFX[name]; if (f) try { f(); } catch (e) { } }

  // ---------- Musik ----------
  // Akkordname → MIDI-Töne
  function chord(name) {
    const m = /^([A-G])([#b]?)(m7|maj7|m|7|sus4|dim)?/.exec(name); const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    const q = m[3] || ''; const iv = q === 'm' ? [0, 3, 7] : q === 'm7' ? [0, 3, 7, 10] : q === '7' ? [0, 4, 7, 10] : q === 'maj7' ? [0, 4, 7, 11] : q === 'sus4' ? [0, 5, 7] : q === 'dim' ? [0, 3, 6] : [0, 4, 7];
    return iv.map(i => base + i);
  }
  const midi = s => { const m = /^([A-G])([#b]?)(\d)$/.exec(s); return 12 * (+m[3] + 1) + { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); };
  // Lieder: Akkorde je Takt, Melodie in Achteln ('.' Pause, '-' halten)
  const SONGS = {
    titel: { bpm: 100, style: 'pad', chords: ['F', 'C', 'Dm', 'Bb', 'F', 'C', 'Bb', 'C'],
      lead: 'A4 . C5 . F5 . E5 D5 | E5 - - . G4 . C5 . | D5 . F5 . A5 . G5 F5 | F5 - - . D5 . Bb4 . | C5 . A4 . C5 . F5 . | G5 . E5 . C5 . E5 G5 | F5 . D5 . Bb4 . D5 F5 | E5 - - - G4 - - .' },
    wiese: { bpm: 128, style: 'hop', chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G'],
      lead: 'E5 . G5 . C6 . G5 . | D5 . G5 . B5 . G5 . | C5 . E5 . A5 . G5 E5 | F5 - - . E5 . D5 . | E5 . G5 . C6 . D6 . | B5 . G5 . D5 . G5 . | A5 . F5 . C5 . F5 A5 | G5 - - - D5 . G4 .' },
    abend: { bpm: 118, style: 'hop', chords: ['Fmaj7', 'Em', 'Dm', 'G', 'Fmaj7', 'Em', 'Dm7', 'G'],
      lead: 'A5 . G5 . E5 . C5 . | B4 . E5 . G5 - - . | F5 . E5 . D5 . A4 . | B4 - - . D5 . G5 . | A5 . C6 . A5 . G5 E5 | G5 - - . E5 . B4 . | C5 . D5 . F5 . A5 . | G5 - - - - - - .' },
    klippe: { bpm: 112, style: 'swing', chords: ['Dm7', 'G', 'Dm7', 'G', 'Bb', 'C', 'Dm', 'Dm'],
      lead: 'D5 . F5 A5 . G5 F5 . | G5 - - . B4 . D5 . | F5 . A5 C6 . A5 G5 . | B4 - - . D5 . G5 . | F5 . D5 . Bb4 . D5 F5 | G5 . E5 . C5 . E5 G5 | A5 . F5 . D5 . F5 A5 | D6 - - - A5 - - .' },
    wolken: { bpm: 96, style: 'pad', chords: ['Eb', 'Cm', 'Ab', 'Bb', 'Eb', 'Gm', 'Ab', 'Bb'],
      lead: 'G5 - - Bb5 - - Eb6 . | D6 - - C6 - - G5 . | Ab5 - - C6 - - Eb6 . | D6 - - - Bb5 - - . | G5 . Bb5 . Eb6 . G6 . | F6 - - D6 - - Bb5 . | C6 . Ab5 . Eb5 . Ab5 C6 | Bb5 - - - - - - .' },
    glut: { bpm: 140, style: 'drive', chords: ['Am', 'F', 'G', 'E', 'Am', 'F', 'G', 'E'],
      lead: 'A4 . A4 C5 . E5 . A5 | F5 . E5 . C5 . A4 . | G4 . B4 D5 . G5 . F5 | E5 - - . G#4 . B4 . | A5 . G5 . E5 . C5 . | F5 . A5 . C6 . A5 . | B5 . G5 . D5 . B4 . | G#5 - - - E5 - - .' },
    burg: { bpm: 150, style: 'drive', chords: ['Em', 'C', 'D', 'B', 'Em', 'C', 'Am', 'B'],
      lead: 'E5 E5 . G5 . E5 B4 . | C5 C5 . E5 . G5 F#5 . | D5 D5 . F#5 . A5 G5 . | F#5 - - . D#5 . B4 . | E5 . G5 . B5 . A5 G5 | E6 - - . C6 . G5 . | A5 . C6 . E6 . D6 C6 | B5 - - - D#5 - F#5 .' }
  };
  function parse(song) {
    const toks = song.lead.replace(/\|/g, ' ').trim().split(/\s+/); const ev = [];
    toks.forEach((t, i) => { if (t !== '.' && t !== '-') { let len = 1; while (toks[i + len] === '-') len++; ev.push({ step: i, note: midi(t), len }); } });
    song._lead = ev; song._steps = toks.length; return song;
  }
  let cur = null, curName = '', nextT = 0, step = 0, timer = 0, retroMode = false;
  function playMusic(name) {
    if (!init()) return;
    if (curName === name && cur) return;
    stopMusic(); if (!SONGS[name]) return;
    cur = SONGS[name]._lead ? SONGS[name] : parse(SONGS[name]); curName = name; step = 0; nextT = ac.currentTime + 0.08;
    timer = setInterval(sched, 25);
  }
  function stopMusic() { if (timer) clearInterval(timer); timer = 0; cur = null; curName = ''; }
  function sched() {
    if (!cur || !ac) return;
    const e8 = 60 / cur.bpm / 2;
    while (nextT < ac.currentTime + 0.15) {
      const swing = cur.style === 'swing' && step % 2 ? e8 * 0.18 : 0, t = nextT + swing;
      const bar = Math.floor(step / 8) % cur.chords.length, ch = chord(cur.chords[bar]), sb = step % 8;
      // Melodie
      cur._lead.forEach(n => { if (n.step === step % cur._steps) lead(N(n.note), t, n.len * e8 * 0.95); });
      // Bass
      const bassPat = cur.style === 'pad' ? [0, 4] : cur.style === 'drive' ? [0, 1, 2, 3, 4, 5, 6, 7] : [0, 3, 4, 6];
      if (bassPat.includes(sb)) { const r = 36 + ch[0] + (cur.style === 'drive' && sb % 2 ? 12 : 0) + (sb === 6 && cur.style === 'hop' ? 7 : 0); bass(N(r), t, e8 * (cur.style === 'pad' ? 3.6 : 0.9)); }
      // Begleitung
      if (cur.style === 'pad') { if (sb === 0) ch.forEach(n => pad(N(60 + n), t, e8 * 8)); if (sb % 2 === 0) pluck(N(72 + ch[(sb / 2) % ch.length]), t, 0.06); }
      else { if (sb % 2 === 1 || cur.style === 'drive') pluck(N(60 + ch[sb % ch.length] + (sb > 3 ? 12 : 0)), t, cur.style === 'drive' ? 0.05 : 0.07); if (sb === 0) ch.forEach(n => pad(N(60 + n), t, e8 * 7.5, 0.025)); }
      // Schlagzeug
      if (cur.style !== 'pad' || sb === 0) { if (sb === 0 || sb === 4 || (cur.style === 'drive' && sb % 2 === 0)) kick(t); }
      if (cur.style !== 'pad' && (sb === 2 || sb === 6)) snare(t);
      if (cur.style !== 'pad') hat(t, sb % 2 ? 0.035 : 0.06);
      else if (sb % 2) hat(t, 0.02);
      nextT += e8; step++;
    }
  }
  function lead(f, t, dur) {
    const o1 = ac.createOscillator(), o2 = ac.createOscillator(), fl = ac.createBiquadFilter(), g = ac.createGain(), vib = ac.createOscillator(), vg = ac.createGain();
    o1.type = retroMode ? 'square' : 'triangle'; o2.type = 'square'; o1.frequency.value = f; o2.frequency.value = f * 1.004;
    vib.frequency.value = 5.5; vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(f * 0.012, t + Math.min(0.25, dur)); vib.connect(vg); vg.connect(o1.frequency); vg.connect(o2.frequency);
    fl.type = 'lowpass'; fl.frequency.setValueAtTime(retroMode ? 6000 : 3200, t); fl.frequency.exponentialRampToValueAtTime(retroMode ? 3000 : 1400, t + dur);
    const v = retroMode ? 0.05 : 0.07;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.015); g.gain.setValueAtTime(v * 0.8, t + Math.max(0.03, dur - 0.04)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.08);
    const g2 = ac.createGain(); g2.gain.value = retroMode ? 0.5 : 0.25; o1.connect(fl); o2.connect(g2); g2.connect(fl); fl.connect(g); g.connect(musicBus);
    const s = ac.createGain(); s.gain.value = 0.35; g.connect(s); s.connect(verbIn);
    [o1, o2, vib].forEach(o => { o.start(t); o.stop(t + dur + 0.12); });
  }
  function bass(f, t, dur) {
    const o = ac.createOscillator(), g = ac.createGain(), fl = ac.createBiquadFilter(); o.type = retroMode ? 'square' : 'triangle'; o.frequency.value = f;
    fl.type = 'lowpass'; fl.frequency.value = 900;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(fl); fl.connect(g); g.connect(musicBus); o.start(t); o.stop(t + dur + 0.05);
  }
  function pad(f, t, dur, vol = 0.03) {
    const o = ac.createOscillator(), o2 = ac.createOscillator(), fl = ac.createBiquadFilter(), g = ac.createGain();
    o.type = 'sawtooth'; o2.type = 'sawtooth'; o.frequency.value = f * 0.997; o2.frequency.value = f * 1.003; fl.type = 'lowpass'; fl.frequency.value = 1100;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + dur * 0.3); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(fl); o2.connect(fl); fl.connect(g); g.connect(musicBus); const s = ac.createGain(); s.gain.value = 0.6; g.connect(s); s.connect(verbIn);
    o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }
  function pluck(f, t, vol) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = retroMode ? 'square' : 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol * (retroMode ? 0.5 : 1), t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g); g.connect(musicBus); const s = ac.createGain(); s.gain.value = 0.4; g.connect(s); s.connect(verbIn); o.start(t); o.stop(t + 0.3);
  }
  function kick(t) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12); g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2); o.connect(g); g.connect(musicBus); o.start(t); o.stop(t + 0.25); }
  function snare(t) { noise(t, 0.12, 1800, 0.8, 0.12, 'bandpass', musicBus); tone(200, t, 0.08, 'triangle', 0.06, musicBus, 0.6, 0); }
  function hat(t, v) { noise(t, 0.04, 8000, 0.7, v, 'highpass', musicBus); }
  // Kurze Melodien (einmalig)
  function jingle(kind) {
    if (!init()) return; stopMusic();
    const t = ac.currentTime + 0.05;
    const seq = kind === 'clear' ? [[72, 0, .15], [76, .15, .15], [79, .3, .15], [84, .45, .3], [79, .8, .15], [84, .95, .7]]
      : kind === 'over' ? [[67, 0, .3], [63, .35, .3], [60, .7, .3], [55, 1.05, .8]]
        : [[60, 0, .1], [67, .1, .1], [72, .2, .3]];
    seq.forEach(([n, d, l]) => { lead(N(n), t + d, l); lead(N(n - 12), t + d, l); });
    if (kind === 'clear') [0, .45, .95].forEach(d => { kick(t + d); chord('C').forEach(n => pad(N(60 + n), t + d, 0.9, 0.04)); });
  }
  function setRetro(on) { retroMode = !!on; }
  function muffle(on) { if (lp && ac) lp.frequency.setTargetAtTime(on ? 700 : 20000, ac.currentTime, 0.15); }
  function apply() {
    if (!ac) return;
    master.gain.setTargetAtTime(opt.on ? 1 : 0, ac.currentTime, 0.05);
    musicBus.gain.setTargetAtTime(opt.music * 0.55, ac.currentTime, 0.05); sfxBus.gain.setTargetAtTime(opt.sfx, ac.currentTime, 0.05);
  }
  // Windrauschen (Dauerton, Lautstärke nach Nähe)
  let windSrc = null, windGain = null;
  function wind(level) {
    if (!ac) return;
    if (!windSrc) {
      if (!noiseBuf) noise(ac.currentTime, 0.01, 1000, 1, 0.0001);
      windSrc = ac.createBufferSource(); windSrc.buffer = noiseBuf; windSrc.loop = true; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 500; f.Q.value = 0.7;
      windGain = ac.createGain(); windGain.gain.value = 0; windSrc.connect(f); f.connect(windGain); windGain.connect(sfxBus); windSrc.start();
    }
    windGain.gain.setTargetAtTime(Math.max(0, Math.min(1, level)) * 0.12, ac.currentTime, 0.2);
  }
  function vibrate(ms) { try { if (root.navigator.vibrate) root.navigator.vibrate(ms); } catch (e) { } }

  root.PufiKlang = { init, sfx, playMusic, stopMusic, jingle, opt, apply, setRetro, muffle, wind, vibrate, get ctx() { return ac; }, get song() { return curName; } };
})(window);
