'use strict';
/* Bunte Insel – Sounds & Musik: echte lizenzfreie Tierstimmen/Effekte (kleine MP3 in sounds/, siehe LICENSES.txt, CC0/Public Domain, kein API-Schlüssel),
   alles andere und der Notfall-Ersatz (wenn eine Datei fehlt/offline) wird im Browser erzeugt (WebAudio). */
BI.audio = (function () {
  let wet = null, ctx = null, master = null, sfxBus = null, musBus = null, muted = false, musicOn = true;
  let eng = null, hornNodes = null, sirenNodes = null, trainNodes = null, melodyTimer = 0, mt = 0, beat = 0, last = 0;
  const PENT = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 784.0];

  function init() {
    if (ctx) return;
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; return; }
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.8 * (A._vol == null ? 1 : A._vol); master.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(master);
    musBus = ctx.createGain(); musBus.gain.value = musicOn ? 0.5 : 0; musBus.connect(master);
    /* kleines Echo/Hall für helle Klänge (macht Sterne, Glocken & Fanfaren schöner) */
    wet = ctx.createGain(); wet.gain.value = .22; const dl = ctx.createDelay(.5), fb = ctx.createGain(), lp = ctx.createBiquadFilter(); dl.delayTime.value = .17; fb.gain.value = .32; lp.type = 'lowpass'; lp.frequency.value = 3200; wet.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(master);
  }
  function resume() { init(); if (ctx && ctx.state === 'suspended') ctx.resume(); }
  function tone(f, dur, type, vol, slideTo, delay, bus) {
    if (!ctx) return;
    const t = ctx.currentTime + (delay || 0), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus || sfxBus); if (wet && !bus && f >= 600 && type !== 'square' && type !== 'sawtooth') g.connect(wet); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol, hp) {
    if (!ctx) return; const len = Math.ceil(ctx.sampleRate * dur), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource(); s.buffer = buf; const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp || 800; const g = ctx.createGain(); g.gain.setValueAtTime(vol, ctx.currentTime); g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + dur);
    s.connect(f); f.connect(g); g.connect(sfxBus); s.start();
  }
  function osc(type, f, vol, dest) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f; g.gain.value = vol; o.connect(g); g.connect(dest || sfxBus); o.start(); return { o, g }; }

  const A = {
    resume,
    get muted() { return muted; },
    get musicOn() { return musicOn; },
    setMuted(m) { muted = m; if (master) master.gain.value = m ? 0 : 0.8 * A._vol; },
    _vol: 1, setVolume(v) { A._vol = BI.clamp(v, 0, 1); if (master) master.gain.value = muted ? 0 : 0.8 * A._vol; },
    setMusic(m) { musicOn = m; if (musBus) musBus.gain.value = m ? 0.5 : 0; },
    star() { tone(880, .12, 'triangle', .18); tone(1318, .18, 'triangle', .16, 0, .07); },
    fanfare() { [523, 659, 784, 1046].forEach((f, i) => tone(f, .22, 'triangle', .2, 0, i * .1)); tone(1318, .5, 'sine', .15, 0, .4); },
    step() { tone(660, .1, 'triangle', .14); tone(990, .16, 'triangle', .14, 0, .08); },
    jump() { tone(300, .18, 'square', .06, 640); },
    hello() { tone(520, .1, 'triangle', .16); tone(700, .14, 'triangle', .16, 0, .09); },
    enter() { tone(220, .08, 'square', .08); tone(330, .1, 'square', .08, 0, .07); },
    leave() { tone(330, .08, 'square', .08); tone(220, .1, 'square', .08, 0, .07); },
    bump() { tone(110, .16, 'sawtooth', .16, 55); },
    splash() { tone(500, .25, 'sine', .1, 150); },
    /* Musik machen: Klavier, Xylophon, Trompete + Trommeln */
    note(f, inst, vol) { /* echte Instrumentklänge aus Teiltönen: Klavier (Anschlag + Ausklingen), Xylophon (hell, kurz), Trompete (Blech mit Anschwellen + Vibrato) */
      if (!ctx) return; vol = vol || 1; const t = ctx.currentTime;
      const part = (fr, type, v, a, d, dly) => { const o = ctx.createOscillator(), g = ctx.createGain(), s = t + (dly || 0); o.type = type; o.frequency.value = fr; g.gain.setValueAtTime(.0001, s); g.gain.exponentialRampToValueAtTime(v * vol, s + a); g.gain.exponentialRampToValueAtTime(.0001, s + a + d); o.connect(g); g.connect(sfxBus); if (wet && fr >= 500) g.connect(wet); o.start(s); o.stop(s + a + d + .05); };
      if (inst === 1) { part(f * 2, 'sine', .3, .004, .55); part(f * 2 * 3.93, 'sine', .08, .002, .16); part(f * 2 * 9.2, 'sine', .02, .002, .06); }
      else if (inst === 2) {
        const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter(), lf = ctx.createOscillator(), lg = ctx.createGain();
        o.type = 'sawtooth'; o.frequency.value = f; lp.type = 'lowpass'; lp.Q.value = 2; lp.frequency.setValueAtTime(f * 1.5, t); lp.frequency.exponentialRampToValueAtTime(f * 6, t + .09); lp.frequency.exponentialRampToValueAtTime(f * 3, t + .6);
        lf.frequency.value = 5.5; lg.gain.value = f * .006; lf.connect(lg); lg.connect(o.frequency);
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.2 * vol, t + .05); g.gain.setValueAtTime(.2 * vol, t + .42); g.gain.exponentialRampToValueAtTime(.0001, t + .68);
        o.connect(lp); lp.connect(g); g.connect(sfxBus); o.start(t); lf.start(t); o.stop(t + .72); lf.stop(t + .72);
      }
      else { part(f, 'triangle', .3, .006, 1.1); part(f * 2, 'sine', .12, .004, .7); part(f * 3, 'sine', .05, .004, .4); part(f * 4, 'sine', .02, .003, .25); noise(.03, .05 * vol, 3000); }
    },
    drum(k, vol) { vol = vol || 1; if (k === 0) { tone(150, .22, 'sine', .45 * vol, 40); } else if (k === 1) { noise(.16, .3 * vol, 1200); tone(220, .1, 'triangle', .15 * vol, 120); } else if (k === 2) { noise(.06, .18 * vol, 6000); } else { tone(200, .3, 'sine', .35 * vol, 90); } },
    shutter() { noise(.05, .35, 2500); tone(1800, .04, 'square', .08); tone(900, .06, 'square', .08, 0, .07); },
    meow() { tone(620, .3, 'triangle', .12, 960); tone(900, .3, 'triangle', .1, 520, .28); },
    oink() { tone(190, .1, 'sawtooth', .12, 140); tone(170, .12, 'sawtooth', .12, 120, .14); },
    ribbit() { tone(190, .07, 'square', .09, 320); tone(230, .09, 'square', .09, 360, .1); },
    cluck() { tone(520, .07, 'square', .06, 430); tone(560, .06, 'square', .06, 450, .1); },
    neigh() { tone(500, .45, 'sawtooth', .07, 950); tone(950, .3, 'sawtooth', .06, 420, .4); },
    ia() { tone(300, .3, 'sawtooth', .08, 520); tone(520, .35, 'sawtooth', .08, 240, .3); },
    whistle() { tone(2400, .5, 'sine', .12, 2900); tone(2900, .3, 'sine', .08, 2400, .45); },
    swish() { noise(.08, .05, 1500); },
    moo() { tone(150, .6, 'sawtooth', .07, 110); },
    baa() { tone(380, .35, 'sawtooth', .05, 300); },
    hit() { tone(200, .09, 'square', .1, 80); tone(520, .05, 'triangle', .08, 260, .02); },
    pop() { tone(700, .08, 'sine', .12, 1100); },
    blow() { tone(900, .25, 'sine', .05, 1500); tone(1300, .2, 'sine', .03, 700, .08); },
    bubblePop() { tone(1500, .05, 'sine', .06, 600); },
    bigpop() { tone(220, .22, 'sawtooth', .1, 70); tone(1300, .12, 'sine', .08, 400); },
    inflate() { tone(300, .9, 'sine', .07, 900); },
    buy() { tone(784, .1, 'triangle', .14); tone(1046, .12, 'triangle', .14, 0, .09); tone(1568, .25, 'triangle', .12, 0, .18); },
        giggle() { [0, .1, .2, .3].forEach((d, i) => tone(700 + i * 90 + (i % 2) * 140, .09, 'triangle', .1, 0, d)); },
        cannon() { tone(70, .5, 'sine', .32, 25); tone(180, .25, 'sawtooth', .12, 50); tone(1400, .2, 'square', .03, 300, .02); },
    arr() { tone(160, .45, 'sawtooth', .1, 110); tone(200, .35, 'sawtooth', .07, 150, .12); },
    coins() { [0, .06, .12, .18, .24].forEach((d, i) => tone(1500 + i * 120, .12, 'triangle', .08, 0, d)); },
        bark() { tone(330, .11, 'sawtooth', .13, 210); tone(270, .1, 'square', .07, 160, .14); },
        bonk() { tone(140, .2, 'square', .2, 55); tone(520, .06, 'triangle', .08, 220); },
        splat() { tone(260, .14, 'sawtooth', .09, 80); tone(900, .05, 'square', .04, 300); },
    kick() { tone(190, .12, 'sine', .22, 60); },
    boing() { tone(180, .35, 'sine', .2, 760); },
    whoosh() { tone(250, .7, 'sawtooth', .04, 1700); },
    boom() { tone(90, .6, 'sine', .3, 30); tone(1500, .35, 'triangle', .05, 200); tone(2400, .2, 'square', .02, 400, .05); },
    ding() { tone(1046, .35, 'sine', .18); tone(784, .45, 'sine', .14, 0, .12); },
    pew() { tone(900, .12, 'square', .09, 300); tone(180, .08, 'triangle', .1); },
    squirt() { tone(2400, .09, 'sine', .05, 1200); tone(1500, .06, 'triangle', .04, 800, .03); },
    thwack() { tone(140, .14, 'triangle', .2, 60); tone(1200, .05, 'square', .05); },
    quack() { tone(520, .1, 'sawtooth', .09, 380); tone(470, .12, 'sawtooth', .08, 340, .1); },
    tin() { tone(1800, .12, 'square', .06, 1500); tone(2400, .18, 'sine', .06, 0, .03); },
    place() { tone(330, .08, 'square', .08); tone(520, .1, 'triangle', .1, 0, .06); },
    /* Tanz-Beat (vom Spiel pro Frame aufgerufen, solange getanzt wird) */
    dance(dt) {
      if (!ctx) return; A._dt = (A._dt || 0) + dt; if (A._dt < .24) return; A._dt -= .24; const n = (A._dn = (A._dn || 0) + 1) % 16;
      if (n % 4 === 0) tone(190, .15, 'sine', .26, 55);
      if (n % 2 === 1) tone(6500, .04, 'square', .03);
      if (n === 4 || n === 12) tone(330, .1, 'square', .06, 120);
      const bass = [98, 98, 0, 131, 98, 0, 147, 0, 110, 110, 0, 147, 110, 0, 165, 131][n]; if (bass) tone(bass, .2, 'sawtooth', .07);
      if (n % 2 === 0) tone(PENT[(n * 3 + 2) % PENT.length] * 2, .16, 'triangle', .05);
    },
    /* Motor: Typ bestimmt Klang, speed 0..1 */
    engine(kind, speed, on) {
      if (!ctx) return;
      if (!on) { if (eng) { eng.g.gain.setTargetAtTime(0, ctx.currentTime, .1); const e = eng; eng = null; setTimeout(() => { try { e.o.stop(); e.o2.stop(); if (e.lfo) e.lfo.stop(); } catch (x) { } }, 400); } return; }
      if (!eng || eng.kind !== kind) {
        if (eng) { try { eng.o.stop(); eng.o2.stop(); if (eng.lfo) eng.lfo.stop(); } catch (x) { } }
        const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500; const g = ctx.createGain(); g.gain.value = 0;
        const o = ctx.createOscillator(), o2 = ctx.createOscillator();
        o.type = kind === 'bike' ? 'sawtooth' : 'triangle'; o2.type = 'square';
        o.connect(f); o2.connect(f); f.connect(g); g.connect(sfxBus); o.start(); o2.start();
        eng = { kind, o, o2, f, g };
        if (kind === 'heli') { const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 13; lg.gain.value = .05; lfo.connect(lg); lg.connect(g.gain); lfo.start(); eng.lfo = lfo; o.type = 'sawtooth'; }
      }
      const base = { cycle: 40, bike: 70, car: 50, tractor: 36, train: 30, heli: 52 }[kind] || 50, k = { cycle: 1.2, bike: 2.8, car: 2.2, tractor: 1.3, train: 1.0, heli: .5 }[kind] || 2;
      const fr = base * (1 + speed * k), t = ctx.currentTime;
      eng.o.frequency.setTargetAtTime(fr, t, .08); eng.o2.frequency.setTargetAtTime(fr * .5, t, .08);
      eng.f.frequency.setTargetAtTime(350 + speed * 700, t, .1);
      eng.g.gain.setTargetAtTime(kind === 'cycle' ? .015 + speed * .015 : .07 + speed * .06, t, .1);
    },
    horn(kind, on) {
      if (!ctx) return;
      if (!on) { if (hornNodes) { const h = hornNodes; hornNodes = null; h.g.gain.setTargetAtTime(0, ctx.currentTime, .03); setTimeout(() => { try { h.a.o.stop(); h.b.o.stop(); } catch (x) { } }, 200); } return; }
      if (hornNodes) return;
      const fr = { bell: [1760, 2349], car: [392, 494], bus: [196, 247], bike: [700, 700], tractor: [165, 208], train: [440, 587], truck: [262, 330] }[kind] || [392, 494];
      const g = ctx.createGain(); g.gain.value = .0001; g.connect(sfxBus); g.gain.setTargetAtTime(.14, ctx.currentTime, .01);
      const a = osc(kind === 'train' ? 'sawtooth' : kind === 'bell' ? 'sine' : 'square', fr[0], .5, g), b = osc(kind === 'train' || kind === 'bell' ? 'sine' : 'square', fr[1], .5, g);
      hornNodes = { a, b, g };
    },
    melody() { // Eiswagen-Lied
      if (!ctx || melodyTimer > ctx.currentTime) return;
      const n = [523, 523, 659, 784, 659, 523, 587, 659, 523]; melodyTimer = ctx.currentTime + 2.2;
      n.forEach((f, i) => tone(f, .22, 'triangle', .16, 0, i * .22));
    },
    siren(kind, on) {
      if (!ctx) return;
      if (!on) { if (sirenNodes) { const s = sirenNodes; sirenNodes = null; s.g.gain.setTargetAtTime(0, ctx.currentTime, .05); setTimeout(() => { try { s.o.stop(); } catch (x) { } }, 300); } return; }
      if (!sirenNodes) { const g = ctx.createGain(); g.gain.value = 0; g.connect(sfxBus); const o = ctx.createOscillator(); o.type = 'triangle'; o.connect(g); o.start(); g.gain.setTargetAtTime(.1, ctx.currentTime, .05); sirenNodes = { o, g, kind }; }
      const t = performance.now() / 1000, lo = kind === 'fire' ? 560 : 650, hi = kind === 'fire' ? 840 : 960, per = kind === 'ambulance' ? .55 : kind === 'fire' ? 1.4 : .7;
      const f = kind === 'fire' ? lo + (hi - lo) * (.5 + .5 * Math.sin(t * BI.TAU / per)) : ((t % per) < per / 2 ? lo : hi);
      sirenNodes.o.frequency.setTargetAtTime(f, ctx.currentTime, .02);
    },
    water(on) {
      if (!ctx) return;
      if (!on) { if (A._w) { const w = A._w; A._w = null; w.g.gain.setTargetAtTime(0, ctx.currentTime, .05); setTimeout(() => { try { w.s.stop(); } catch (x) { } }, 300); } return; }
      if (A._w) return;
      const len = ctx.sampleRate, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800; const g = ctx.createGain(); g.gain.value = 0;
      s.connect(f); f.connect(g); g.connect(sfxBus); s.start(); g.gain.setTargetAtTime(.12, ctx.currentTime, .05); A._w = { s, g };
    },
    /* sanfte Hintergrundmusik: zufällige Pentatonik-Melodie */
    music(dt, night) {
      if (!ctx || !musicOn || muted) return;
      mt += dt;
      const step = night ? .75 : .55;
      if (mt < step) return; mt -= step; beat++;
      if (beat % 8 === 0) { const root = [130.8, 146.8, 164.8, 196][(beat >> 3) % 4]; tone(root, 2.2, 'sine', .07, 0, 0, musBus); tone(root * 1.5, 2.2, 'sine', .035, 0, 0, musBus); }
      if (Math.random() < .62) { const f = PENT[(Math.random() * PENT.length) | 0]; tone(f, .5, 'triangle', .05, 0, 0, musBus); if (Math.random() < .2) tone(f * 2, .3, 'sine', .02, 0, .12, musBus); }
    },
    /* Vorlesen: eingebaute Browser-Stimme (kostenlos, offline, kein Laden). Beste deutsche Stimme wird automatisch gewählt. */
    voiceOn: true,
    speak(txt) {
      const ss = window.speechSynthesis; if (!A.voiceOn || muted || !ss || !txt || typeof SpeechSynthesisUtterance === 'undefined') return;
      const clean = String(txt).replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}→➤✔✖]/gu, ' ').replace(/[„“"]/g, '').replace(/\s+/g, ' ').trim(); if (clean.length < 4 || clean === A._said && ss.speaking) return;
      A._said = clean; A._want = clean;
      if (A._spT) return; /* mehrere Aufrufe kurz hintereinander: nur der letzte wird gesprochen (Chrome verschluckt speak() direkt nach cancel()) */
      A._spT = setTimeout(() => {
        A._spT = 0; const t = A._want; A._want = ''; if (!t || !A.voiceOn || muted) return;
        try {
          if (ss.speaking || ss.pending) ss.cancel();
          if (ss.paused) ss.resume();
          if (!A._v) { const vs = ss.getVoices().filter(v => /^de/i.test(v.lang)); if (vs.length) { const sc = v => (/natural|neural|online/i.test(v.name) ? 6 : 0) + (/google|anna|petra|katja|marlene|vicki|amala|seraphina|yannick/i.test(v.name) ? 3 : 0) + (v.lang === 'de-DE' ? 2 : 0) + (v.localService ? 1 : 0); A._v = vs.sort((a, b) => sc(b) - sc(a))[0]; } }
          const u = new SpeechSynthesisUtterance(t); u.lang = 'de-DE'; if (A._v) u.voice = A._v; u.rate = .92; u.pitch = 1.12; u.volume = 1;
          u.onerror = e => { if (A._v && e && e.error !== 'canceled' && e.error !== 'interrupted') { A._v = null; A._bad = (A._bad || 0) + 1; if (A._bad < 3 && A.voiceOn) { const u2 = new SpeechSynthesisUtterance(t); u2.lang = 'de-DE'; try { ss.speak(u2); } catch (x) { } } } };
          A._u = u; ss.speak(u); /* Referenz halten (sonst räumt Chrome die Äußerung manchmal vorzeitig weg) */
        } catch (e) { }
      }, 90);
    },
    setVoice(on) { A.voiceOn = on; if (!on && window.speechSynthesis) { try { window.speechSynthesis.cancel(); } catch (e) { } } },
    rain(on) { // leises Regenrauschen (Schleife aus gefiltertem Rauschen)
      if (!ctx) return; if (on && !A._rain) { const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 3200; f.Q.value = .5; const g = ctx.createGain(); g.gain.value = .0001; g.gain.linearRampToValueAtTime(.09, ctx.currentTime + 1.5); s.connect(f); f.connect(g); g.connect(sfxBus); s.start(); A._rain = { s, g }; }
      else if (!on && A._rain) { const r = A._rain; A._rain = null; r.g.gain.linearRampToValueAtTime(.0001, ctx.currentTime + 1); setTimeout(() => { try { r.s.stop(); } catch (e) { } }, 1200); }
    },
    stopAll() { A.rain(false); A.engine('car', 0, false); A.horn('car', false); A.siren('police', false); A.water(false); if (window.speechSynthesis) { try { window.speechSynthesis.cancel(); } catch (e) { } } }
  };
  /* ---------- Echte Töne (Samples): lazy laden, bei Fehler bleibt der erzeugte Ton ---------- */
  const bank = {}; let sfxBase = '';
  try { const s = document.currentScript && document.currentScript.src; if (s) sfxBase = s.replace(/js\/audio\.js.*$/, 'sounds/'); } catch (e) { }
  function loadSample(name) {
    if (bank[name] !== undefined || !ctx) return; bank[name] = 'loading';
    fetch((sfxBase || 'sounds/') + name + '.mp3').then(r => { if (!r.ok) throw 0; return r.arrayBuffer(); })
      .then(ab => new Promise((res, rej) => { const p = ctx.decodeAudioData(ab, res, rej); if (p && p.catch) p.catch(rej); }))
      .then(buf => { bank[name] = buf; }).catch(() => { bank[name] = 'fail'; });
  }
  function sample(name, vol, rate) {
    if (!ctx) return false; const b = bank[name]; if (b === undefined) { loadSample(name); return false; } if (!b || typeof b === 'string') return false;
    const s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = b; s.playbackRate.value = (rate || 1) * (.96 + Math.random() * .08); g.gain.value = vol || 1; s.connect(g); g.connect(sfxBus); s.start(); return true;
  }
  A.sample = sample; A.ready = fn => { const m = MAP[fn]; if (!m) return true; loadSample(m[0]); const b = bank[m[0]]; return b !== undefined && b !== 'loading'; };
  const MAP = { moo: ['cow', 1], baa: ['sheep', 1], goat: ['goat', 1], oink: ['pig', 1], cluck: ['chicken', 1], neigh: ['horse', .9], ia: ['donkey', 1], bark: ['dog', 1], meow: ['cat', 1], quack: ['duck', 1], hit: ['hit', .9], kick: ['kick', .9], thwack: ['thwack', .9], bonk: ['bonk', .9], bump: ['bump', .9], coins: ['coins', .8], buy: ['buy', .8], enter: ['enter', .8], leave: ['leave', .8] };
  for (const k in MAP) { const orig = A[k], [nm, v] = MAP[k]; A[k] = function () { if (!sample(nm, v)) { if (orig) orig.apply(A, arguments); } }; }
  A.goat = A.goat || A.baa;
  /* Beim ersten Tippen die Tierstimmen schon mal im Hintergrund laden */
  const _res = A.resume; A.resume = function () { _res(); if (ctx && !A._pre) { A._pre = true; setTimeout(() => ['cow', 'sheep', 'goat', 'pig', 'chicken', 'horse', 'donkey', 'dog', 'cat', 'duck', 'hit', 'coins', 'enter'].forEach(loadSample), 1500); } };
  /* Stimmenliste früh anstoßen (Chrome lädt sie asynchron) */
  try { const ss = window.speechSynthesis; if (ss) { ss.getVoices(); if (ss.addEventListener) ss.addEventListener('voiceschanged', () => { A._v = null; }); } } catch (e) { }
  return A;
})();
