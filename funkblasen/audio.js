/* FUNKBLASEN – Ton: alles selbst erzeugt mit WebAudio (keine fremden Dateien). Startet erst nach einer Nutzeraktion. */
(function (root) {
  'use strict';
  let ctx = null, master, musicBus, sfxBus, noise = null, muted = false, vMusic = 0.55, vSfx = 0.8;
  let song = null, nextTime = 0, step = 0;
  const SCALES = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], lydian: [0, 2, 4, 6, 7, 9, 11], mixolydian: [0, 2, 4, 5, 7, 9, 10] };
  const PROG = [[0, 5, 3, 4], [0, 3, 5, 4], [5, 3, 0, 4], [0, 4, 5, 3]];
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  function init() {
    if (ctx) return true;
    const AC = root.AudioContext || root.webkitAudioContext; if (!AC) return false;
    try { ctx = new AC(); } catch (e) { ctx = null; return false; }
    master = ctx.createGain(); master.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.connect(master);
    const b = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    noise = b; apply();
    return true;
  }
  function apply() {
    if (!ctx) return;
    const t = ctx.currentTime;
    master.gain.setTargetAtTime(muted ? 0 : 1, t, 0.03);
    musicBus.gain.setTargetAtTime(vMusic * 0.32, t, 0.05);
    sfxBus.gain.setTargetAtTime(vSfx * 0.7, t, 0.03);
  }
  function unlock() { if (!init()) return; if (ctx.state === 'suspended') ctx.resume().catch(() => {}); }
  function tone(o) {   // o: { f, f2, t, dur, type, vol, bus, attack, q, filt }
    if (!ctx) return;
    const t = o.t != null ? o.t : ctx.currentTime, dur = o.dur || 0.15;
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(o.f, t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), t + dur);
    const a = o.attack || 0.005, v = o.vol == null ? 0.3 : o.vol;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = osc;
    if (o.filt) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.filt; f.Q.value = o.q || 1; osc.connect(f); node = f; }
    node.connect(g); g.connect(o.bus || sfxBus);
    osc.start(t); osc.stop(t + dur + 0.02);
  }
  function hiss(o) {
    if (!ctx) return;
    const t = o.t != null ? o.t : ctx.currentTime, src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noise; f.type = o.hp ? 'highpass' : 'bandpass'; f.frequency.value = o.f || 1200; f.Q.value = o.q || 0.8;
    g.gain.setValueAtTime(o.vol || 0.2, t); g.gain.exponentialRampToValueAtTime(0.0001, t + (o.dur || 0.2));
    src.connect(f); f.connect(g); g.connect(o.bus || sfxBus); src.start(t); src.stop(t + (o.dur || 0.2) + 0.02);
  }
  const SFX = {
    click: () => tone({ f: 880, f2: 660, dur: 0.06, type: 'triangle', vol: 0.15 }),
    shoot: () => { tone({ f: 260, f2: 620, dur: 0.12, type: 'triangle', vol: 0.25 }); hiss({ f: 2400, dur: 0.08, vol: 0.06 }); },
    bounce: () => tone({ f: 520, f2: 380, dur: 0.07, type: 'square', vol: 0.06, filt: 1800 }),
    land: () => tone({ f: 180, f2: 120, dur: 0.1, type: 'sine', vol: 0.25 }),
    pop: (n, combo) => {
      const t = ctx.currentTime, base = 64 + Math.min(combo || 0, 6) * 2, k = Math.min(n || 3, 8);
      for (let i = 0; i < k; i++) tone({ f: hz(base + [0, 4, 7, 12, 16, 19, 24, 28][i]), f2: hz(base + 12 + i * 2), t: t + i * 0.035, dur: 0.12, type: 'sine', vol: 0.18 });
    },
    drop: n => { const t = ctx.currentTime; for (let i = 0; i < Math.min(n, 6); i++) tone({ f: 700 - i * 60, f2: 220, t: t + 0.05 + i * 0.05, dur: 0.18, type: 'triangle', vol: 0.12 }); },
    boom: () => { hiss({ f: 300, q: 0.5, dur: 0.6, vol: 0.5 }); tone({ f: 120, f2: 35, dur: 0.5, type: 'sine', vol: 0.5 }); },
    bolt: () => { hiss({ f: 4000, hp: true, dur: 0.35, vol: 0.25 }); tone({ f: 1800, f2: 200, dur: 0.3, type: 'sawtooth', vol: 0.08, filt: 3000 }); },
    ice: () => { const t = ctx.currentTime; for (let i = 0; i < 3; i++) tone({ f: 2400 + i * 500, f2: 1800, t: t + i * 0.03, dur: 0.08, type: 'triangle', vol: 0.07 }); },
    crack: () => { hiss({ f: 900, q: 3, dur: 0.12, vol: 0.18 }); tone({ f: 200, f2: 90, dur: 0.1, type: 'square', vol: 0.06, filt: 900 }); },
    rainbow: () => { const t = ctx.currentTime; [0, 4, 7, 11, 14].forEach((s, i) => tone({ f: hz(72 + s), t: t + i * 0.05, dur: 0.18, type: 'triangle', vol: 0.12 })); },
    chain: () => { const t = ctx.currentTime; for (let i = 0; i < 4; i++) tone({ f: hz(60 + i * 5), t: t + i * 0.04, dur: 0.1, type: 'square', vol: 0.06, filt: 2400 }); },
    star: () => { const t = ctx.currentTime; [0, 7, 12].forEach((s, i) => tone({ f: hz(84 + s), t: t + i * 0.06, dur: 0.22, type: 'sine', vol: 0.12 })); },
    crystal: () => { const t = ctx.currentTime; [0, 5, 9, 12].forEach((s, i) => tone({ f: hz(81 + s), t: t + i * 0.05, dur: 0.3, type: 'sine', vol: 0.1 })); },
    swap: () => tone({ f: 500, f2: 800, dur: 0.08, type: 'sine', vol: 0.14 }),
    ceil: () => { tone({ f: 90, f2: 60, dur: 0.4, type: 'sawtooth', vol: 0.15, filt: 400 }); hiss({ f: 200, dur: 0.3, vol: 0.15 }); },
    push: () => tone({ f: 140, f2: 100, dur: 0.25, type: 'triangle', vol: 0.18 }),
    win: () => { const t = ctx.currentTime; [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => tone({ f: hz(67 + s), t: t + i * 0.09, dur: 0.35, type: 'triangle', vol: 0.16 })); },
    lose: () => { const t = ctx.currentTime; [7, 5, 3, 0].forEach((s, i) => tone({ f: hz(60 + s), t: t + i * 0.16, dur: 0.35, type: 'triangle', vol: 0.15 })); },
    star3: i => tone({ f: hz(76 + i * 5), dur: 0.3, type: 'sine', vol: 0.16 }),
    coin: () => { const t = ctx.currentTime; tone({ f: hz(88), t, dur: 0.08, type: 'square', vol: 0.05, filt: 4000 }); tone({ f: hz(95), t: t + 0.07, dur: 0.15, type: 'square', vol: 0.05, filt: 4000 }); },
    danger: () => tone({ f: 330, f2: 300, dur: 0.18, type: 'square', vol: 0.05, filt: 1200 })
  };
  function play(name, a, b) { if (!ctx || muted || ctx.state !== 'running') return; const f = SFX[name]; if (f) try { f(a, b); } catch (e) {} }

  // ---------- Musik: kleiner eigener Loop je Welt (Bass, Akkord, Arpeggio, leises Schlagzeug) ----------
  function music(m) {   // m = Welt-Musik {bpm, root, mode, lead} oder null
    song = m ? Object.assign({}, m, { scale: SCALES[m.mode] || SCALES.major, prog: PROG[(m.root + m.bpm) % PROG.length] }) : null;
    step = 0; if (ctx) nextTime = ctx.currentTime + 0.1;
  }
  function note(deg, oct) { const s = song.scale, i = ((deg % 7) + 7) % 7, o = Math.floor(deg / 7); return song.root + s[i] + 12 * (o + (oct || 0)); }
  function schedule(t) {
    const sp = 60 / song.bpm / 2, bar = Math.floor(step / 8) % 4, beat = step % 8, chord = song.prog[bar];
    if (beat === 0) [0, 2, 4].forEach(k => tone({ f: hz(note(chord + k, 0)), t, dur: sp * 7.5, type: 'triangle', vol: 0.05, attack: 0.15, filt: 1400, bus: musicBus }));
    if (beat % 2 === 0) tone({ f: hz(note(chord + (beat === 4 ? 4 : 0), -2)), t, dur: sp * 1.6, type: 'sine', vol: 0.22, bus: musicBus });
    const arp = [0, 2, 4, 7, 4, 2, 4, 2][(beat + bar) % 8];
    tone({ f: hz(note(chord + arp, 1)), t, dur: sp * 0.9, type: song.lead, vol: song.lead === 'square' ? 0.035 : 0.07, filt: 2600, bus: musicBus });
    if (beat === 0 || beat === 4) tone({ f: 110, f2: 45, t, dur: 0.14, type: 'sine', vol: 0.3, bus: musicBus });
    if (beat % 2 === 1) hiss({ f: 7000, hp: true, t, dur: 0.04, vol: 0.05, bus: musicBus });
    step++;
    return sp;
  }
  function update() {   // aus der Spielschleife aufgerufen; plant 0,25 s voraus
    if (!ctx || !song || ctx.state !== 'running' || vMusic <= 0) return;
    if (nextTime < ctx.currentTime - 0.5) nextTime = ctx.currentTime + 0.05;
    while (nextTime < ctx.currentTime + 0.25) nextTime += schedule(nextTime);
  }
  function suspend() { if (ctx && ctx.state === 'running') ctx.suspend().catch(() => {}); }
  function resume() { if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {}); }
  function set(o) {
    if (o.music != null) vMusic = o.music; if (o.sfx != null) vSfx = o.sfx; if (o.muted != null) muted = !!o.muted;
    apply();
  }
  root.FBAudio = { init, unlock, play, music, update, suspend, resume, set, get ready() { return !!ctx && ctx.state === 'running'; } };
})(typeof self !== 'undefined' ? self : this);
