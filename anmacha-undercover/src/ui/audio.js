/* AnMaCha UNDERCOVER 3D – Klang: nur WebAudio-Synthese (keine Dateien). Ohne WebAudio/in Node: alles ohne Wirkung.
   AMU.Audio.unlock(), sfx(name), alarm(on), music(name|null), setVolumes({ master, sfx, music }), mute(bool), state(), SFX, TRACKS
   Musik: 'menu' | 'play' | 'tension' | 'meeting' | 'lounge' – kleiner Sequenzer mit Vorlauf, Überblendung, pausiert bei verdecktem Tab. */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const AC = root.AudioContext || root.webkitAudioContext;
  const doc = root.document;
  let ctx = null, master = null, sfxBus = null, musBus = null, noiseBuf = null, failed = !AC;
  const vol = { master: 0.8, sfx: 0.9, music: 0.5 };
  let muted = false, alarmOn = false, alarmNode = null, track = null, wantTrack = null, timer = 0;
  const last = {};
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  function ensure() {
    if (ctx || failed) return ctx;
    try {
      ctx = new AC();
      master = ctx.createGain(); sfxBus = ctx.createGain(); musBus = ctx.createGain();
      sfxBus.connect(master); musBus.connect(master); master.connect(ctx.destination);
      const n = ctx.sampleRate | 0; noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); let s = 1234567;
      for (let i = 0; i < n; i++) { s = (s * 1103515245 + 12345) >>> 0; d[i] = s / 2147483648 - 1; }
      applyVol();
    } catch (e) { failed = true; ctx = null; }
    return ctx;
  }
  function applyVol() {
    if (!ctx) return;
    const t = ctx.currentTime;
    master.gain.setTargetAtTime(muted ? 0 : vol.master, t, 0.03);
    sfxBus.gain.setTargetAtTime(vol.sfx, t, 0.03);
    musBus.gain.setTargetAtTime(vol.music * 0.4, t, 0.05);
  }
  function unlock() {
    if (!ensure()) return false;
    if (ctx.state === 'suspended' && !(doc && doc.hidden)) { try { ctx.resume(); } catch (e) { /* egal */ } }
    if (wantTrack && !track) startTrack(wantTrack);
    if (alarmOn && !alarmNode) alarmStart();
    return true;
  }
  const ready = () => ctx && !(doc && doc.hidden);

  // ---------- Bausteine ----------
  function env(g, t, a, peak, d) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  function tone(f, t, dur, o) {
    o = o || {};
    const os = ctx.createOscillator(), g = ctx.createGain();
    os.type = o.type || 'sine'; os.frequency.setValueAtTime(f, t);
    if (o.to) os.frequency.exponentialRampToValueAtTime(o.to, t + (o.slide || dur));
    if (o.det) os.detune.value = o.det;
    env(g, t, o.a || 0.005, o.v || 0.2, dur);
    os.connect(g); g.connect(o.out || sfxBus);
    os.start(t); os.stop(t + (o.a || 0.005) + dur + 0.03);
  }
  function noise(t, dur, o) {
    o = o || {};
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf;
    f.type = o.ft || 'lowpass'; f.frequency.setValueAtTime(o.f || 1200, t); f.Q.value = o.q || 0.8;
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    env(g, t, o.a || 0.004, o.v || 0.2, dur);
    src.connect(f); f.connect(g); g.connect(o.out || sfxBus);
    src.start(t, Math.random() * 0.5); src.stop(t + (o.a || 0.004) + dur + 0.03);
  }
  function seq(ms, t, step, o) { ms.forEach((m, i) => { if (m != null) tone(mtof(m), t + i * step, o.d || step * 1.6, o); }); }

  // ---------- Effekte (jeweils < 1,2 s) ----------
  const SFX = {
    click: t => tone(1100, t, 0.04, { type: 'triangle', v: 0.12, to: 800 }),
    ok: t => seq([76, 83], t, 0.07, { type: 'triangle', v: 0.14, d: 0.12 }),
    bad: t => { tone(220, t, 0.16, { type: 'square', v: 0.07, to: 150 }); tone(165, t + 0.12, 0.2, { type: 'square', v: 0.06, to: 110 }); },
    good: t => seq([72, 76, 79], t, 0.06, { type: 'triangle', v: 0.13, d: 0.14 }),
    done: t => { seq([72, 76, 79], t, 0.08, { type: 'triangle', v: 0.13, d: 0.16 }); tone(mtof(84), t + 0.24, 0.55, { type: 'sine', v: 0.16 }); tone(mtof(91), t + 0.26, 0.45, { type: 'sine', v: 0.05 }); },
    kill: t => { noise(t, 0.3, { f: 2500, to: 180, v: 0.3 }); tone(170, t, 0.35, { type: 'sawtooth', v: 0.12, to: 45 }); },
    report: t => { [0, 0.13, 0.26].forEach((d, i) => tone(i % 2 ? 660 : 880, t + d, 0.1, { type: 'square', v: 0.07 })); noise(t, 0.12, { ft: 'highpass', f: 3000, v: 0.05 }); },
    alarm: t => { const o = { type: 'sawtooth', v: 0.06, a: 0.05 }; tone(520, t, 0.5, Object.assign({ to: 900, slide: 0.5 }, o)); tone(900, t + 0.55, 0.5, Object.assign({ to: 520, slide: 0.5 }, o)); },
    meeting: t => { [[67, 0.22], [79, 0.07], [74, 0.05]].forEach(([m, v]) => tone(mtof(m), t, 1.0, { v })); tone(mtof(60), t + 0.18, 0.9, { v: 0.14 }); },
    vote: t => { noise(t, 0.06, { f: 700, v: 0.25 }); tone(520, t, 0.08, { type: 'triangle', v: 0.12, to: 780 }); },
    eject: t => { noise(t, 0.9, { ft: 'bandpass', f: 3000, to: 250, q: 2, v: 0.25, a: 0.08 }); tone(420, t, 0.9, { v: 0.1, to: 70 }); },
    sab: t => { [190, 140, 260, 120].forEach((f, i) => tone(f, t + i * 0.07, 0.06, { type: 'square', v: 0.07 })); noise(t + 0.05, 0.25, { ft: 'bandpass', f: 900, q: 3, v: 0.12 }); },
    repair: t => { tone(330, t, 0.35, { type: 'triangle', v: 0.1, to: 660 }); [0.1, 0.2, 0.3].forEach(d => noise(t + d, 0.03, { ft: 'highpass', f: 4000, v: 0.08 })); },
    door: t => { noise(t, 0.28, { f: 500, to: 150, v: 0.3, a: 0.02 }); tone(95, t, 0.22, { v: 0.2, to: 60 }); },
    vent: t => { noise(t, 0.4, { ft: 'bandpass', f: 900, to: 200, q: 1.5, v: 0.3 }); tone(210, t, 0.3, { v: 0.12, to: 70 }); },
    win: t => { seq([60, 64, 67, 72], t, 0.11, { type: 'triangle', v: 0.14, d: 0.2 }); seq([48, 55], t, 0.22, { type: 'sine', v: 0.12, d: 0.3 }); tone(mtof(76), t + 0.44, 0.6, { type: 'square', v: 0.04 }); tone(mtof(72), t + 0.44, 0.65, { type: 'triangle', v: 0.14 }); },
    lose: t => { seq([67, 63, 60], t, 0.18, { type: 'triangle', v: 0.13, d: 0.28 }); tone(mtof(55), t + 0.54, 0.6, { type: 'sine', v: 0.15, to: mtof(54) }); },
    clue: t => seq([88, 93, 96], t, 0.05, { v: 0.09, d: 0.25 }),
    beacon: t => { tone(1046, t, 0.8, { v: 0.12 }); tone(1568, t + 0.02, 0.4, { v: 0.04 }); },
    caught: t => { tone(140, t, 0.4, { type: 'sawtooth', v: 0.1, to: 110 }); tone(147, t, 0.4, { type: 'sawtooth', v: 0.08 }); noise(t, 0.08, { f: 1500, v: 0.2 }); },
    escape: t => { noise(t, 0.5, { ft: 'highpass', f: 400, to: 5000, v: 0.12, a: 0.1 }); tone(300, t, 0.5, { type: 'triangle', v: 0.1, to: 1200 }); },
    reveal: t => { [57, 60, 64, 69].forEach((m, i) => tone(mtof(m), t + i * 0.05, 0.9, { type: 'triangle', v: 0.06, a: 0.25 })); tone(mtof(81), t + 0.3, 0.6, { v: 0.05 }); },
    tick: t => tone(2000, t, 0.02, { v: 0.06 }),
    step: t => noise(t, 0.04, { f: 320, v: 0.05 }),
    chat: t => { tone(880, t, 0.06, { v: 0.08 }); tone(1175, t + 0.06, 0.09, { v: 0.08 }); },
    join: t => { tone(523, t, 0.08, { v: 0.1 }); tone(784, t + 0.08, 0.14, { v: 0.1 }); },
    leave: t => { tone(784, t, 0.08, { v: 0.09 }); tone(523, t + 0.08, 0.14, { v: 0.09 }); }
  };

  function sfx(name) {
    const f = SFX[name];
    if (!f || !ready() || muted) return false;
    const t = ctx.currentTime;
    if (last[name] != null && t - last[name] < 0.05) return false;   // gleicher Klang höchstens alle 50 ms
    last[name] = t;
    try { f(t + 0.005); } catch (e) { return false; }
    return true;
  }

  // ---------- Sirene (läuft bis alarm(false)) ----------
  function alarmStart() {
    if (!ready() || alarmNode) return;
    const t = ctx.currentTime, os = ctx.createOscillator(), lfo = ctx.createOscillator(), lg = ctx.createGain(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    os.type = 'sawtooth'; os.frequency.value = 680; lfo.frequency.value = 0.9; lg.gain.value = 200;
    f.type = 'lowpass'; f.frequency.value = 1800;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.05, t + 0.15);
    lfo.connect(lg); lg.connect(os.frequency); os.connect(f); f.connect(g); g.connect(sfxBus);
    os.start(t); lfo.start(t);
    alarmNode = { os, lfo, g };
  }
  function alarmStop() {
    if (!alarmNode) return;
    const n = alarmNode, t = ctx.currentTime; alarmNode = null;
    n.g.gain.cancelScheduledValues(t); n.g.gain.setTargetAtTime(0.0001, t, 0.05);
    n.os.stop(t + 0.3); n.lfo.stop(t + 0.3);
  }
  function alarm(on) { alarmOn = !!on; if (alarmOn) alarmStart(); else alarmStop(); }

  // ---------- Musik ----------
  const CH = { maj: [0, 4, 7], min: [0, 3, 7], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10] };
  // prog: [Grundton (MIDI), Akkord] je Takt; 8 Schritte (Achtel) pro Takt
  const TRACKS = {
    menu: { bpm: 96, prog: [[57, 'min'], [53, 'maj'], [48, 'maj'], [55, 'maj']], bass: [0, 4], arp: [0, 2, 4, 6], hat: [3, 7], pad: 0 },
    play: { bpm: 108, prog: [[50, 'min'], [46, 'maj'], [53, 'maj'], [48, 'maj']], bass: [0, 2, 4, 6], arp: [1, 3, 5, 7], hat: [1, 3, 5, 7], pad: 0 },
    tension: { bpm: 84, prog: [[52, 'min'], [48, 'maj'], [52, 'min'], [47, 'maj']], bass: [0, 3, 6], arp: [], hat: [2, 6], pad: 1, ping: 1 },
    meeting: { bpm: 90, prog: [[48, 'min'], [44, 'maj'], [51, 'maj'], [46, 'maj']], bass: [0, 4], arp: [6], hat: [2, 6], pad: 1 },
    lounge: { bpm: 80, prog: [[53, 'maj7'], [52, 'm7'], [50, 'm7'], [48, 'maj7']], bass: [0, 3, 4, 7], arp: [], hat: [1, 3, 5, 7], pad: 1, swing: 1 }
  };
  function startTrack(name) {
    if (!ready() || !TRACKS[name]) return;
    const g = ctx.createGain(), t = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(1, t + 1.2); g.connect(musBus);
    track = { name, def: TRACKS[name], g, step: 0, next: t + 0.08 };
    if (!timer) timer = root.setInterval(tickMusic, 90);
  }
  function fadeOut(tr) {
    const t = ctx.currentTime;
    tr.g.gain.cancelScheduledValues(t); tr.g.gain.setValueAtTime(tr.g.gain.value, t); tr.g.gain.linearRampToValueAtTime(0.0001, t + 1.2);
    root.setTimeout(() => { try { tr.g.disconnect(); } catch (e) { /* egal */ } }, 3200);
  }
  function stopTimer() { if (timer) { root.clearInterval(timer); timer = 0; } }
  function playStep(tr, t, i) {
    const d = tr.def, spb = 30 / d.bpm, bar = (i >> 3) % d.prog.length, s = i & 7, ch = d.prog[bar], iv = CH[ch[1]], out = tr.g;
    if (d.bass.includes(s)) tone(mtof(ch[0] - 12 + (d.swing && s === 3 ? 7 : 0)), t, spb * (d.bass.length > 3 ? 0.9 : 1.8), { type: 'triangle', v: 0.32, out });
    if (d.arp.includes(s)) tone(mtof(ch[0] + 12 + iv[(i >> 1) % iv.length]), t, spb * 1.2, { type: 'triangle', v: 0.09, out });
    if (d.hat.includes(s)) noise(t, 0.03, { ft: 'highpass', f: 7000, v: d.swing ? 0.04 : 0.05, out });
    if (d.pad && s === 0) iv.slice(0, 3).forEach((k, j) => tone(mtof(ch[0] + k), t, spb * 7.2, { type: j ? 'sine' : 'triangle', v: 0.07, a: spb * 1.5, out }));
    if (d.ping && s === 4 && bar % 2 === 1) tone(mtof(ch[0] + 31), t, 0.9, { v: 0.05, out });
  }
  function tickMusic() {
    if (!track || !ctx) { stopTimer(); return; }
    if (doc && doc.hidden) return;
    const until = ctx.currentTime + 0.3, d = track.def, spb = 30 / d.bpm;
    if (track.next < ctx.currentTime - 0.5) track.next = ctx.currentTime + 0.05;   // nach Pause nicht nachholen
    while (track.next < until) {
      const sw = d.swing && (track.step & 1) ? spb * 0.18 : 0;
      try { playStep(track, track.next + sw, track.step); } catch (e) { /* egal */ }
      track.next += spb; track.step = (track.step + 1) % (8 * d.prog.length);
    }
  }
  function music(name) {
    name = TRACKS[name] ? name : null;
    wantTrack = name;
    if (!ctx) return;
    if (track && track.name === name) return;
    if (track) { fadeOut(track); track = null; }
    if (name) startTrack(name); else stopTimer();
  }

  // ---------- Lautstärke / Zustand ----------
  function setVolumes(v) {
    v = v || {};
    for (const k of ['master', 'sfx', 'music']) if (typeof v[k] === 'number' && isFinite(v[k])) vol[k] = Math.max(0, Math.min(1, v[k]));
    applyVol();
  }
  function mute(on) { muted = !!on; applyVol(); }
  function state() {
    return { available: !!AC && !failed, unlocked: !!ctx, running: ctx ? ctx.state : 'none', muted,
      volumes: { master: vol.master, sfx: vol.sfx, music: vol.music }, music: wantTrack, alarm: alarmOn };
  }

  // Tab verdeckt: alles anhalten, sichtbar: weiter
  if (doc && doc.addEventListener) {
    doc.addEventListener('visibilitychange', () => {
      if (!ctx) return;
      try {
        if (doc.hidden) { ctx.suspend(); stopTimer(); return; }
        ctx.resume();
        if (track) { track.next = ctx.currentTime + 0.05; if (!timer) timer = root.setInterval(tickMusic, 90); }
        else if (wantTrack) startTrack(wantTrack);
        if (alarmOn && !alarmNode) alarmStart();
      } catch (e) { /* egal */ }
    });
  }
  // erste Nutzergeste schaltet den Klang frei
  if (AC && root.addEventListener) {
    const once = () => { unlock(); root.removeEventListener('pointerdown', once, true); root.removeEventListener('keydown', once, true); };
    root.addEventListener('pointerdown', once, true);
    root.addEventListener('keydown', once, true);
  }

  AMU.Audio = { unlock, sfx, alarm, music, setVolumes, mute, state, SFX: Object.keys(SFX), TRACKS: Object.keys(TRACKS) };
})(typeof window !== 'undefined' ? window : globalThis);
