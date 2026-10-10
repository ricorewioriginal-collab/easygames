/* Ton & Musik – alles wird im Browser per WebAudio erzeugt (keine Audiodateien, keine Urheberrechtsfragen). */
const AUD = (() => {
  let ac = null, master = null, noiseBuf = null, muted = false, bedTimer = null, bedMode = null, step = 0, nextT = 0, tension = 0, ttsOn = false, voice = null;
  try { muted = localStorage.getItem('akMute') === '1'; ttsOn = localStorage.getItem('akTts') === '1'; } catch (e) {}
  function ctx() {
    if (!ac) {
      ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = muted ? 0 : 0.9; master.connect(ac.destination);
      noiseBuf = ac.createBuffer(1, ac.sampleRate * 1.5, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  const hz = n => 440 * Math.pow(2, (n - 69) / 12);                 // MIDI-Note -> Hz
  function note(f, d, type, v, at, o) {                              // einfacher Synth-Ton mit optionalem Tiefpass / Gleitton
    if (muted) return; try {
      const c = ctx(), t = c.currentTime + (at || 0), os = c.createOscillator(), g = c.createGain(); o = o || {};
      os.type = type || 'sine'; os.frequency.setValueAtTime(f, t); if (o.to) os.frequency.exponentialRampToValueAtTime(o.to, t + d);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v || 0.06, t + (o.atk || 0.012)); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      let out = g; if (o.lp) { const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; os.connect(fl); fl.connect(g); } else os.connect(g);
      out.connect(master); os.start(t); os.stop(t + d + 0.03);
    } catch (e) {}
  }
  function noise(d, v, at, o) {
    if (muted) return; try {
      const c = ctx(), t = c.currentTime + (at || 0), s = c.createBufferSource(), g = c.createGain(), fl = c.createBiquadFilter(); o = o || {};
      s.buffer = noiseBuf; fl.type = o.type || 'bandpass'; fl.frequency.value = o.f || 2000; fl.Q.value = o.q || 0.8;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v || 0.05, t + (o.atk || 0.005)); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      s.connect(fl); fl.connect(g); g.connect(master); s.start(t, Math.random()); s.stop(t + d + 0.03);
    } catch (e) {}
  }
  const chord = (notes, d, type, v, at, lp) => notes.forEach((n, i) => note(hz(n), d, type, v, (at || 0) + i * 0.0, { lp: lp || 2600, atk: 0.02 }));
  let eng = null;
  const SFX = {
    click: () => note(1400, 0.05, 'square', 0.025),
    select: () => { note(hz(72), 0.12, 'triangle', 0.07); note(hz(79), 0.16, 'triangle', 0.05, 0.05); },
    beep: hi => note(hi ? 1320 : 660, hi ? 0.5 : 0.18, 'square', hi ? 0.07 : 0.06),
    box: () => { [76, 80, 83, 88].forEach((n, i) => note(hz(n), 0.12, 'square', 0.035, i * 0.05, { lp: 3000 })); },
    got: () => { note(hz(84), 0.15, 'triangle', 0.06); note(hz(91), 0.2, 'triangle', 0.05, 0.08); },
    boost: () => { noise(0.7, 0.08, 0, { type: 'bandpass', f: 600, q: 0.6, atk: 0.2 }); note(220, 0.7, 'sawtooth', 0.04, 0, { to: 700, lp: 2200 }); },
    mini: t => { for (let i = 0; i <= t; i++) note(hz(72 + i * 4), 0.1, 'square', 0.035, i * 0.06, { lp: 2800 }); noise(0.4, 0.05, 0.05, { f: 1200, q: 0.5 }); },
    hit: () => { note(160, 0.5, 'sawtooth', 0.09, 0, { to: 50, lp: 800 }); noise(0.35, 0.09, 0, { f: 400, q: 0.5 }); },
    boom: () => { noise(0.5, 0.12, 0, { type: 'lowpass', f: 700, q: 0.4 }); note(90, 0.45, 'sine', 0.14, 0, { to: 35 }); },
    wall: () => { noise(0.14, 0.07, 0, { f: 280, q: 0.8 }); note(120, 0.12, 'square', 0.04, 0, { to: 70, lp: 500 }); },
    pad: () => { note(500, 0.35, 'sawtooth', 0.04, 0, { to: 1400, lp: 3000 }); },
    rocket: () => { noise(0.6, 0.06, 0, { type: 'bandpass', f: 1800, q: 0.7, atk: 0.05 }); note(300, 0.5, 'sawtooth', 0.04, 0, { to: 900 }); },
    shield: () => { [79, 83, 86].forEach((n, i) => note(hz(n), 0.4, 'sine', 0.05, i * 0.07)); },
    lap: () => { [72, 79, 84].forEach((n, i) => note(hz(n), 0.2, 'triangle', 0.07, i * 0.09)); },
    bump: () => note(200, 0.08, 'square', 0.04, 0, { to: 120, lp: 600 }),
    finish: () => { [60, 64, 67, 72, 76, 79, 84].forEach((n, i) => { note(hz(n), 0.5, 'sawtooth', 0.05, i * 0.1, { lp: 3000 }); }); chord([60, 67, 72, 76, 84], 1.8, 'sawtooth', 0.05, 0.8, 3200); SFX.applause(4, 0.8); },
    applause: (d, v) => { const n = Math.round(d * 38); for (let i = 0; i < n; i++) noise(0.04 + Math.random() * 0.05, (v || 0.6) * 0.03 * (0.6 + Math.random() * 0.8), Math.random() * d, { f: 1500 + Math.random() * 3500, q: 0.6 }); },
    win: () => SFX.finish(),
    intro: () => { noise(0.5, 0.06, 0, { type: 'bandpass', f: 900, q: 0.5, atk: 0.25 }); [55, 62, 67, 71, 74].forEach((n, i) => note(hz(n), 0.8, 'sawtooth', 0.04, 0.1 + i * 0.14, { lp: 2400 })); }
  };
  // Motorgeräusch (ein durchgehender Oszillator, Tonhöhe folgt dem Tempo)
  function engine(on, sp, boost) {
    if (muted || !on) { if (eng) { try { eng.g.gain.setTargetAtTime(0.0001, ac.currentTime, 0.1); } catch (e) {} } return; }
    try {
      const c = ctx(); if (!eng) { const o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), fl = c.createBiquadFilter(); o.type = 'sawtooth'; o2.type = 'square'; fl.type = 'lowpass'; fl.frequency.value = 700; g.gain.value = 0.0001; o.connect(fl); o2.connect(fl); fl.connect(g); g.connect(master); o.start(); o2.start(); eng = { o, o2, g, fl }; }
      const t = c.currentTime; eng.o.frequency.setTargetAtTime(48 + sp * 120 + (boost ? 25 : 0), t, 0.06); eng.o2.frequency.setTargetAtTime(24 + sp * 60, t, 0.06); eng.fl.frequency.setTargetAtTime(500 + sp * 1500, t, 0.08); eng.g.gain.setTargetAtTime(0.028 + sp * 0.02, t, 0.1);
    } catch (e) {}
  }
  // Hintergrundmusik: 'menu' (locker) | 'race' (schneller Arcade-Groove) | 'off'
  const MENU_BASS = [45, 45, 48, 43, 45, 45, 50, 48], MENU_ARP = [57, 60, 64, 60, 57, 62, 65, 62], RACE_BASS = [40, 40, 43, 40, 38, 38, 41, 43], RACE_LEAD = [64, 67, 71, 67, 64, 69, 72, 69];
  function sched() {
    if (!ac || muted || !bedMode) return; const c = ac;
    while (nextT < c.currentTime + 0.3) {
      const t = nextT - c.currentTime;
      if (bedMode === 'menu') {
        const bpm = 108, st = 60 / bpm / 4, s = step % 32;
        if (s % 4 === 0) note(hz(MENU_BASS[(s >> 2) % 8]), st * 3.5, 'sawtooth', 0.035, t, { lp: 420 });
        if (s % 2 === 0) note(hz(MENU_ARP[(s >> 1) % 8] + 12), st * 1.6, 'triangle', 0.02, t, { lp: 2200 });
        if (s % 8 === 0) note(55, 0.18, 'sine', 0.09, t, { to: 38 }); if (s % 4 === 2) noise(0.03, 0.015, t, { f: 6500, q: 1.2 });
        nextT += st;
      } else {
        const bpm = 138, st = 60 / bpm / 4, s = step % 64, ch = (s >> 3) % 8;
        if (s % 2 === 0) note(hz(RACE_BASS[ch]), st * 1.7, 'sawtooth', 0.04, t, { lp: 520 });
        if (s % 4 === 0) note(60, 0.14, 'sine', 0.1, t, { to: 36 });
        if (s % 8 === 4) noise(0.1, 0.03, t, { f: 3000, q: 0.8 });
        if (s % 2 === 1) noise(0.02, 0.012, t, { f: 7500, q: 1.5 });
        if ((s % 4 === 0 || s % 8 === 3 || s % 8 === 6) && s >= 16) note(hz(RACE_LEAD[ch] + (s % 16 > 7 ? 12 : 0)), st * 1.5, 'square', 0.017, t, { lp: 2400 });
        nextT += st;
      }
      step++;
    }
  }
  function bed(mode) {
    if (mode === bedMode) return; bedMode = mode === 'off' ? null : mode; clearInterval(bedTimer); bedTimer = null; step = 0;
    if (bedMode && !muted) { try { ctx(); } catch (e) { return; } nextT = ac.currentTime + 0.05; bedTimer = setInterval(sched, 90); sched(); }
  }
  function setMute(m) {
    muted = m; try { localStorage.setItem('akMute', m ? '1' : '0'); } catch (e) {}
    if (master) master.gain.value = m ? 0 : 0.9; if (m) { clearInterval(bedTimer); bedTimer = null; engine(false); try { speechSynthesis.cancel(); } catch (e) {} } else if (bedMode) { const mo = bedMode; bedMode = null; bed(mo); }
  }
  // Moderatorstimme (Sprachausgabe des Browsers, falls vorhanden)
  function pickVoice() { try { const vs = speechSynthesis.getVoices(); voice = vs.find(v => /^de[-_]DE/i.test(v.lang)) || vs.find(v => /^de/i.test(v.lang)) || null; } catch (e) {} }
  try { speechSynthesis.onvoiceschanged = pickVoice; pickVoice(); } catch (e) {}
  function say(text, done) {
    let fin = false; const end = () => { if (!fin) { fin = true; done && done(); } };
    if (!ttsOn || muted || !('speechSynthesis' in window)) return end();
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'de-DE'; if (voice) u.voice = voice; u.rate = 1.02; u.pitch = 0.95; u.onend = end; u.onerror = end; speechSynthesis.speak(u); setTimeout(end, 9000); } catch (e) { end(); }
  }
  function setTts(v) { ttsOn = v; try { localStorage.setItem('akTts', v ? '1' : '0'); } catch (e) {} if (!v) try { speechSynthesis.cancel(); } catch (e) {} }
  return { sfx: SFX, bed, engine, say, setMute, setTts, get muted() { return muted; }, get tts() { return ttsOn; }, hasTts: 'speechSynthesis' in window, unlock: () => { try { ctx(); } catch (e) {} } };
})();
