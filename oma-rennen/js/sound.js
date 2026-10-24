/* Oma-Rennen – Klänge (Web Audio, ohne Dateien): Raketen-Rollator-Motor, Hupe, Treffer, Items, Countdown,
 * Zieleinlauf und eine kleine Schlager-Orgel als Musik. */
(function () {
  'use strict';
  let ac = null, master = null, mus = null, eng = null, musT = null, vol = { sfx: .8, mus: .45 }, beat = 0;
  function ctx() {
    if (ac) { if (ac.state === 'suspended') ac.resume().catch(() => { }); return ac; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
    try { ac = new C(); } catch (e) { return null; }
    master = ac.createGain(); master.gain.value = vol.sfx; master.connect(ac.destination);
    mus = ac.createGain(); mus.gain.value = vol.mus * .35; mus.connect(ac.destination);
    return ac;
  }
  function tone(f, d, type, g, out, at, slide) {
    const a = ctx(); if (!a) return; const t = a.currentTime + (at || 0), o = a.createOscillator(), v = a.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, slide), t + d);
    v.gain.setValueAtTime(g || .2, t); v.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(v); v.connect(out || master); o.start(t); o.stop(t + d + .02);
  }
  function noise(d, g, f, at) {
    const a = ctx(); if (!a) return; const t = a.currentTime + (at || 0), n = Math.floor(a.sampleRate * d), b = a.createBuffer(1, n, a.sampleRate), c = b.getChannelData(0);
    for (let i = 0; i < n; i++) c[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = a.createBufferSource(), fl = a.createBiquadFilter(), v = a.createGain(); s.buffer = b; fl.type = 'lowpass'; fl.frequency.value = f || 1500; v.gain.value = g || .3;
    s.connect(fl); fl.connect(v); v.connect(master); s.start(t);
  }
  const sfx = {
    tick: () => tone(660, .09, 'square', .12),
    go: () => { tone(990, .35, 'square', .18); tone(1320, .35, 'triangle', .1); },
    count: () => tone(523, .2, 'square', .16),
    box: () => { [784, 988, 1175].forEach((f, i) => tone(f, .08, 'square', .1, null, i * .05)); },
    got: () => tone(1568, .12, 'triangle', .14),
    use: () => tone(420, .18, 'sawtooth', .12, null, 0, 220),
    hit: () => { noise(.35, .35, 900); tone(220, .3, 'sawtooth', .14, null, 0, 80); },
    slip: () => tone(900, .4, 'triangle', .16, null, 0, 160),
    boom: () => { noise(.5, .45, 600); tone(110, .4, 'sine', .3, null, 0, 40); },
    boost: () => { noise(.6, .3, 2400); tone(200, .6, 'sawtooth', .1, null, 0, 900); },
    turbo: t => tone(500 + t * 200, .2, 'square', .1, null, 0, 1200 + t * 300),
    wall: () => noise(.15, .22, 500),
    shield: () => tone(1200, .25, 'sine', .15, null, 0, 600),
    honk: () => { tone(392, .22, 'square', .12); tone(494, .22, 'square', .1); },
    whistle: () => { tone(2400, .5, 'sine', .14, null, 0, 3200); },
    lap: () => { [659, 880].forEach((f, i) => tone(f, .14, 'square', .14, null, i * .1)); },
    fin: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, .25, 'square', .14, null, i * .13)); },
    lose: () => { [392, 349, 311, 262].forEach((f, i) => tone(f, .3, 'triangle', .14, null, i * .2)); },
    nav: () => tone(880, .05, 'square', .08),
    ok: () => { tone(988, .07, 'square', .1); tone(1319, .09, 'square', .08, null, .06); },
    pigeon: () => { tone(700, .08, 'sine', .1, null, 0, 500); tone(650, .08, 'sine', .08, null, .1, 450); }
  };
  // Motor: zwei verstimmte Sägezähne mit Tiefpass; Tonhöhe folgt dem Tempo
  function engine(on) {
    const a = ctx(); if (!a) return;
    if (on && !eng) { const o1 = a.createOscillator(), o2 = a.createOscillator(), f = a.createBiquadFilter(), g = a.createGain(); o1.type = o2.type = 'sawtooth'; o1.frequency.value = 60; o2.frequency.value = 61.5; f.type = 'lowpass'; f.frequency.value = 500; g.gain.value = 0; o1.connect(f); o2.connect(f); f.connect(g); g.connect(master); o1.start(); o2.start(); eng = { o1, o2, f, g }; }
    else if (!on && eng) { try { eng.g.gain.setTargetAtTime(0, a.currentTime, .05); const e = eng; setTimeout(() => { try { e.o1.stop(); e.o2.stop(); } catch (x) { } }, 300); } catch (e) { } eng = null; }
  }
  function engineSet(speed, boost) { if (!eng || !ac) return; const f = 55 + speed * 2.2 + (boost ? 40 : 0), t = ac.currentTime; eng.o1.frequency.setTargetAtTime(f, t, .08); eng.o2.frequency.setTargetAtTime(f * 1.02, t, .08); eng.f.frequency.setTargetAtTime(400 + speed * 18 + (boost ? 800 : 0), t, .1); eng.g.gain.setTargetAtTime(.05 + Math.min(.07, speed / 600), t, .1); }
  // Musik: Schlager-Orgel (Akkorde + Bass + Melodie) im 4/4-Takt
  const SONGS = {
    menu: { bpm: 112, ch: [[60, 64, 67], [65, 69, 72], [67, 71, 74], [60, 64, 67]], mel: [72, 0, 76, 74, 72, 0, 69, 0, 71, 72, 74, 0, 72, 0, 0, 0] },
    race: { bpm: 148, ch: [[57, 60, 64], [62, 65, 69], [64, 68, 71], [57, 60, 64]], mel: [69, 72, 76, 72, 74, 72, 69, 0, 71, 74, 76, 74, 72, 71, 69, 0] },
    win: { bpm: 126, ch: [[60, 64, 67], [65, 69, 72], [67, 71, 74], [72, 76, 79]], mel: [72, 76, 79, 84, 0, 79, 84, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
  };
  const mf = n => 440 * Math.pow(2, (n - 69) / 12);
  function music(name) {
    clearInterval(musT); musT = null; const s = SONGS[name]; if (!s || !ctx() || vol.mus <= 0) return; beat = 0;
    const step = 60 / s.bpm / 2;
    musT = setInterval(() => {
      if (!ac || ac.state !== 'running') return; const bar = Math.floor(beat / 8) % 4, ch = s.ch[bar], st = beat % 8;
      if (st === 0 || st === 4) tone(mf(ch[0] - 24), step * 3, 'triangle', .35, mus);
      if (st === 2 || st === 6) ch.forEach(n => tone(mf(n), step * 1.2, 'square', .05, mus));
      const m = s.mel[beat % 16]; if (m) tone(mf(m), step * 1.6, 'triangle', .16, mus);
      if (st % 2 === 0) { const a = ac, t = a.currentTime, n = a.createBufferSource(), b = a.createBuffer(1, 800, a.sampleRate), c = b.getChannelData(0); for (let i = 0; i < 800; i++) c[i] = (Math.random() * 2 - 1) * (1 - i / 800); n.buffer = b; const g = a.createGain(); g.gain.value = st === 4 ? .25 : .08; n.connect(g); g.connect(mus); n.start(t); }
      beat++;
    }, step * 1000);
  }
  function setVol(k, v) { vol[k] = Math.max(0, Math.min(1, v)); if (master) master.gain.value = vol.sfx; if (mus) mus.gain.value = vol.mus * .35; }
  window.OmaSound = { ctx, sfx, engine, engineSet, music, setVol, get vol() { return vol; } };
})();
