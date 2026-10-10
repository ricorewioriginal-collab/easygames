/* Ton & Musik – alles wird im Browser per WebAudio erzeugt (keine Audiodateien, keine Urheberrechtsfragen). */
const AUD = (() => {
  let ac = null, master = null, noiseBuf = null, muted = false, bedTimer = null, bedMode = null, step = 0, nextT = 0, tension = 0, ttsOn = false, voice = null;
  try { muted = localStorage.getItem('amqMute') === '1'; ttsOn = localStorage.getItem('amqTts') === '1'; } catch (e) {}
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
  const SFX = {
    click: () => note(1400, 0.05, 'square', 0.025),
    select: () => { note(hz(72), 0.12, 'triangle', 0.07); note(hz(79), 0.16, 'triangle', 0.05, 0.05); },
    lock: () => { note(90, 0.35, 'sine', 0.16, 0, { to: 45 }); noise(0.25, 0.05, 0, { f: 700 }); },
    whoosh: () => noise(0.5, 0.06, 0, { type: 'bandpass', f: 900, q: 0.5, atk: 0.25 }),
    reveal: i => { note(hz(60 + i * 2), 0.18, 'triangle', 0.06, 0, { lp: 1800 }); note(hz(67 + i * 2), 0.2, 'sine', 0.04, 0.04); },
    correct: () => { [60, 64, 67, 72].forEach((n, i) => { note(hz(n), 0.5, 'sawtooth', 0.05, i * 0.09, { lp: 2400 }); note(hz(n + 12), 0.5, 'triangle', 0.03, i * 0.09); }); chord([60, 64, 67, 72, 76], 1.1, 'sawtooth', 0.045, 0.4, 2200); },
    wrong: () => { note(hz(46), 0.7, 'sawtooth', 0.08, 0, { to: hz(40), lp: 900 }); note(hz(45), 0.7, 'square', 0.04, 0.02, { to: hz(39), lp: 700 }); noise(0.5, 0.04, 0, { f: 300 }); },
    safe: () => { [67, 71, 74, 79].forEach((n, i) => note(hz(n), 0.4, 'triangle', 0.07, i * 0.11)); chord([67, 71, 74, 79], 0.9, 'sawtooth', 0.04, 0.45, 2000); },
    million: () => { [60, 64, 67, 72, 76, 79, 84].forEach((n, i) => { note(hz(n), 0.6, 'sawtooth', 0.05, i * 0.12, { lp: 3000 }); note(hz(n - 12), 0.6, 'square', 0.025, i * 0.12, { lp: 1200 }); }); chord([60, 67, 72, 76, 84], 2.2, 'sawtooth', 0.05, 0.9, 3200); SFX.applause(5, 0.9); },
    joker: () => { [72, 76, 79, 84, 88].forEach((n, i) => note(hz(n), 0.18, 'square', 0.035, i * 0.05, { lp: 3000 })); },
    ring: () => { for (let i = 0; i < 2; i++) { note(440, 0.18, 'sine', 0.06, i * 0.5); note(480, 0.18, 'sine', 0.06, i * 0.5 + 0.0); note(440, 0.18, 'sine', 0.06, i * 0.5 + 0.22); note(480, 0.18, 'sine', 0.06, i * 0.5 + 0.22); } },
    tick: () => note(1800, 0.03, 'square', 0.02),
    tickLow: () => note(900, 0.05, 'square', 0.03),
    drum: d => { const n = Math.max(6, Math.round(d * 14)); for (let i = 0; i < n; i++) noise(0.07, 0.03 + 0.05 * (i / n), (i / n) * d, { f: 260 + i * 25, q: 0.7 }); note(60, 0.3, 'sine', 0.12, d, { to: 38 }); },
    intro: () => { SFX.whoosh(); [55, 62, 67, 71, 74].forEach((n, i) => note(hz(n), 0.8, 'sawtooth', 0.04, 0.1 + i * 0.14, { lp: 2400 })); chord([60, 67, 72, 76, 79], 1.6, 'sawtooth', 0.045, 0.9, 3000); SFX.applause(3, 0.7); },
    applause: (d, v) => { const n = Math.round(d * 38); for (let i = 0; i < n; i++) noise(0.04 + Math.random() * 0.05, (v || 0.6) * 0.03 * (0.6 + Math.random() * 0.8), Math.random() * d, { f: 1500 + Math.random() * 3500, q: 0.6 }); },
    // Buzzer: richtig = heller Doppel-Gong, falsch = tiefer Summer
    buzzRight: () => { [1318, 1760].forEach((f, i) => { note(f, 0.55, 'sine', 0.07, i * 0.16); note(f * 2, 0.4, 'sine', 0.025, i * 0.16); }); note(880, 0.5, 'triangle', 0.04, 0.32); },
    buzzWrong: () => { note(118, 0.95, 'square', 0.07, 0, { lp: 520, atk: 0.01 }); note(124, 0.95, 'sawtooth', 0.05, 0, { lp: 600, atk: 0.01 }); noise(0.45, 0.05, 0, { f: 260, q: 0.6 }); },
    // Jubel: Applaus + Johlen + Pfiff
    cheer: (d, v) => {
      d = d || 2.5; v = v || 1; SFX.applause(d, 0.8 * v);
      [250, 310, 390, 470].forEach((f, i) => note(f, 0.5 + Math.random() * 0.25, 'sawtooth', 0.016 * v, 0.05 + i * 0.07 + Math.random() * 0.15, { to: f * (1.5 + Math.random() * 0.4), lp: 1500, atk: 0.06 }));
      note(1800, 0.32, 'sine', 0.035 * v, 0.35, { to: 2700 }); note(2000, 0.28, 'sine', 0.03 * v, 0.75, { to: 2900 });
      if (d > 3) { [330, 420, 520].forEach((f, i) => note(f, 0.6, 'sawtooth', 0.016 * v, 1.2 + i * 0.1, { to: f * 1.8, lp: 1500, atk: 0.06 })); }
    },
    aww: () => { [330, 300, 270].forEach((f, i) => note(f, 0.7, 'sawtooth', 0.02, i * 0.06, { to: f * 0.55, lp: 800, atk: 0.1 })); noise(0.6, 0.012, 0.05, { f: 700, q: 0.5 }); },
    right: () => { SFX.buzzRight(); SFX.cheer(2.4, 1); setTimeout(() => chord([60, 64, 67, 72], 0.9, 'sawtooth', 0.03, 0, 2200), 520); },
    wrongAll: () => { SFX.buzzWrong(); setTimeout(SFX.aww, 450); },
    lose: () => { [64, 60, 57, 52].forEach((n, i) => note(hz(n), 0.5, 'triangle', 0.07, i * 0.22, { lp: 1200 })); },
    win: () => SFX.million()
  };
  // Hintergrundmusik: 'menu' (locker, Moll-Groove) | 'tension' (Herzschlag + Drohne) | 'off'
  const MENU_BASS = [45, 45, 48, 43, 45, 45, 50, 48], MENU_ARP = [57, 60, 64, 60, 57, 62, 65, 62];
  function sched() {
    if (!ac || muted || !bedMode) return; const c = ac;
    while (nextT < c.currentTime + 0.3) {
      const t = nextT - c.currentTime;
      if (bedMode === 'menu') {
        const bpm = 108, st = 60 / bpm / 4, s = step % 32, bar = (step >> 4) % 2;
        if (s % 4 === 0) note(hz(MENU_BASS[(s >> 2) % 8] - (bar ? 0 : 0)), st * 3.5, 'sawtooth', 0.035, t, { lp: 420 });
        if (s % 2 === 0) note(hz(MENU_ARP[(s >> 1) % 8] + 12), st * 1.6, 'triangle', 0.02, t, { lp: 2200 });
        if (s % 8 === 0) note(55, 0.18, 'sine', 0.09, t, { to: 38 });
        if (s % 4 === 2) noise(0.03, 0.015, t, { f: 6500, q: 1.2 });
        nextT += st;
      } else {   // tension = Nachdenk-Melodie (Moll-Arpeggio, steigende Spannung)
        const bpm = 70 + tension * 26, st = 60 / bpm / 2, s = step % 32, ch = s >> 3, ps = s & 7;
        const CH = [[50, 57, 62, 65, 69, 65, 62, 57], [46, 58, 62, 65, 70, 65, 62, 58], [43, 55, 58, 62, 67, 62, 58, 55], [45, 57, 61, 64, 69, 64, 61, 57]][ch];
        note(hz(CH[ps] + 12), st * 1.7, 'triangle', 0.03, t, { lp: 1900, atk: 0.004 });
        if (ps % 2 === 0) note(hz(CH[0] - 12), st * 2.2, 'sine', 0.07, t, { atk: 0.01 });
        if (ps === 0 || ps === 4) note(52, 0.2, 'sine', 0.06 + tension * 0.04, t, { to: 36 });
        if (ps === 0) note(hz(CH[0] + 24), st * 6, 'sine', 0.012, t, { atk: 0.4 });
        if (ps === 6 && tension > 0.45) note(hz(CH[4] + 12), st * 1.4, 'sine', 0.02, t + st * 0.5, { atk: 0.01 });
        nextT += st;
      }
      step++;
    }
  }
  function bed(mode, t) {
    if (t != null) tension = t;
    if (mode === bedMode) return; bedMode = mode === 'off' ? null : mode; clearInterval(bedTimer); bedTimer = null; step = 0;
    if (bedMode && !muted) { try { ctx(); } catch (e) { return; } nextT = ac.currentTime + 0.05; bedTimer = setInterval(sched, 90); sched(); }
  }
  function setMute(m) {
    muted = m; try { localStorage.setItem('amqMute', m ? '1' : '0'); } catch (e) {}
    if (master) master.gain.value = m ? 0 : 0.9; if (m) { clearInterval(bedTimer); bedTimer = null; try { speechSynthesis.cancel(); } catch (e) {} } else if (bedMode) { const mo = bedMode; bedMode = null; bed(mo); }
  }
  // Moderatorstimme (Sprachausgabe des Browsers, falls vorhanden)
  function pickVoice() { try { const vs = speechSynthesis.getVoices(); voice = vs.find(v => /^de[-_]DE/i.test(v.lang)) || vs.find(v => /^de/i.test(v.lang)) || null; } catch (e) {} }
  try { speechSynthesis.onvoiceschanged = pickVoice; pickVoice(); } catch (e) {}
  function say(text, done) {
    let fin = false; const end = () => { if (!fin) { fin = true; done && done(); } };
    if (!ttsOn || muted || !('speechSynthesis' in window)) return end();
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'de-DE'; if (voice) u.voice = voice; u.rate = 1.02; u.pitch = 0.95; u.onend = end; u.onerror = end; speechSynthesis.speak(u); setTimeout(end, 9000); } catch (e) { end(); }
  }
  function setTts(v) { ttsOn = v; try { localStorage.setItem('amqTts', v ? '1' : '0'); } catch (e) {} if (!v) try { speechSynthesis.cancel(); } catch (e) {} }
  return { sfx: SFX, bed, say, setMute, setTts, get muted() { return muted; }, get tts() { return ttsOn; }, hasTts: 'speechSynthesis' in window, unlock: () => { try { ctx(); } catch (e) {} } };
})();
