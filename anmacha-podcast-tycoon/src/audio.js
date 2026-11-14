/* AnMaCha – Der Podcast – Ton: Effekte und Musik live im Browser erzeugt (Web Audio, keine fremden Dateien),
   dazu drei kurze CC0-Geräusche von Kenney (sounds/). Spielmusik schweigt, solange Radio oder Podcast laufen. */
(function (root) {
  'use strict';
  const AMC = root.AMC = root.AMC || {};
  const A = AMC.Audio = { ctx: null, ready: false, track: '', muted: false };
  let master, musicBus, sfxBus, noiseBuf, comp;
  const samples = {};
  const vol = () => AMC.Save.data.settings;

  A.init = function () {
    if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume().catch(() => {}); return; }
    const C = root.AudioContext || root.webkitAudioContext; if (!C) return;
    const ctx = A.ctx = new C();
    comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(ctx.destination);
    master = ctx.createGain(); master.gain.value = 1; master.connect(comp);
    musicBus = ctx.createGain(); musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.connect(master);
    A.apply();
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    ['coins', 'enter', 'buy'].forEach(n => {
      fetch('sounds/' + n + '.mp3').then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b)).then(buf => { samples[n] = buf; }).catch(() => {});
    });
    A.ready = true;
    if (A.track) { const t = A.track; A.track = ''; A.music(t); }
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => root.addEventListener(ev, () => A.init(), { passive: true }));
  root.addEventListener('easygames:pad', () => A.init());

  let duck = 1, songs0 = 0;
  A.apply = function () {
    if (!A.ctx) return;
    const s = vol(), t = A.ctx.currentTime;
    musicBus.gain.setTargetAtTime(s.music * 0.5 * duck * (songs0 > 0 ? 0.3 : 1), t, 0.3);
    sfxBus.gain.setTargetAtTime(s.sfx * 0.9, t, 0.05);
  };
  /** Spielmusik aus (Radio/Podcast läuft) oder an. */
  A.duck = on => { duck = on ? 0 : 1; A.apply(); };

  // ------------------------------------------------------------------ Bausteine
  function env(g, t, a, peak, dec, sus = 0.0001) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(Math.max(sus, 0.0001), t + a + dec); }
  function tone(freq, t, dur, type, peak, bus, glide) {
    const c = A.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t); if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
    env(g, t, 0.005, peak, dur); o.connect(g); g.connect(bus || sfxBus); o.start(t); o.stop(t + dur + 0.05);
    return o;
  }
  function noise(t, dur, peak, fType, fFreq, bus, q) {
    const c = A.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = noiseBuf; f.type = fType || 'highpass'; f.frequency.value = fFreq || 4000; if (q) f.Q.value = q;
    env(g, t, 0.003, peak, dur); s.connect(f); f.connect(g); g.connect(bus || sfxBus); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
    return f;
  }
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  // ------------------------------------------------------------------ Effekte
  const FX = {
    ui: t => tone(1320, t, 0.05, 'triangle', 0.12),
    move: t => tone(900, t, 0.035, 'triangle', 0.06),
    ok: t => { tone(880, t, 0.08, 'triangle', 0.16); tone(1320, t + 0.06, 0.12, 'triangle', 0.14); },
    back: t => tone(520, t, 0.1, 'triangle', 0.12, null, 380),
    jump: t => tone(300, t, 0.18, 'square', 0.06, null, 700),
    land: t => noise(t, 0.08, 0.12, 'lowpass', 500),
    collect: t => { [0, 4, 7, 12].forEach((s, i) => tone(mtof(84 + s), t + i * 0.045, 0.16, 'triangle', 0.13)); },
    gold: t => { [0, 4, 7, 12, 16, 19].forEach((s, i) => tone(mtof(79 + s), t + i * 0.05, 0.25, 'sine', 0.16)); sample('coins', t, 0.6); },
    dash: t => { const f = noise(t, 0.25, 0.25, 'bandpass', 900, null, 1.2); f.frequency.exponentialRampToValueAtTime(3200, t + 0.2); },
    wave: t => { tone(160, t, 0.35, 'sawtooth', 0.12, null, 60); const f = noise(t, 0.35, 0.18, 'bandpass', 600, null, 2); f.frequency.exponentialRampToValueAtTime(2400, t + 0.3); },
    zap: t => { tone(1400, t, 0.18, 'square', 0.07, null, 200); noise(t, 0.2, 0.2, 'highpass', 2500); },
    hit: t => { tone(180, t, 0.2, 'sawtooth', 0.18, null, 70); noise(t, 0.15, 0.3, 'lowpass', 900); },
    swap: t => { tone(600, t, 0.08, 'sine', 0.14, null, 1200); tone(1200, t + 0.08, 0.08, 'sine', 0.12, null, 600); },
    talk: t => { for (let i = 0; i < 3; i++) tone(U.rand(380, 560), t + i * 0.06, 0.05, 'triangle', 0.05); },
    star: t => { tone(mtof(88), t, 0.4, 'sine', 0.18); tone(mtof(95), t + 0.1, 0.5, 'sine', 0.14); },
    combo: t => { tone(mtof(76), t, 0.08, 'square', 0.07); tone(mtof(83), t + 0.07, 0.12, 'square', 0.07); },
    perfect: t => { [0, 7, 12, 19].forEach((s, i) => tone(mtof(81 + s), t + i * 0.035, 0.2, 'triangle', 0.13)); },
    miss: t => tone(220, t, 0.25, 'square', 0.08, null, 110),
    buzz: t => tone(110, t, 0.4, 'sawtooth', 0.1),
    static: t => noise(t, 0.6, 0.2, 'bandpass', 1800, null, 0.6),
    cheer: t => { for (let i = 0; i < 6; i++) noise(t + i * 0.07, 0.9, 0.08, 'bandpass', U.rand(900, 2600), null, 0.8); tone(mtof(72), t, 0.3, 'triangle', 0.05); },
    applause: t => { for (let i = 0; i < 28; i++) noise(t + Math.random() * 1.4, 0.05, 0.12, 'bandpass', U.rand(1500, 4000), null, 1.5); },
    jingle: t => { const n = [72, 76, 79, 84, 79, 84, 88]; n.forEach((m, i) => { tone(mtof(m), t + i * 0.09, 0.22, 'square', 0.06); tone(mtof(m - 12), t + i * 0.09, 0.2, 'triangle', 0.08); }); },
    onair: t => { tone(mtof(84), t, 0.12, 'sine', 0.15); tone(mtof(84), t + 0.18, 0.12, 'sine', 0.15); tone(mtof(91), t + 0.36, 0.4, 'sine', 0.15); },
    win: t => { [60, 64, 67, 72, 76, 79, 84].forEach((m, i) => tone(mtof(m), t + i * 0.08, 0.5, 'triangle', 0.1)); sample('coins', t + 0.4, 0.5); },
    lose: t => { [67, 63, 60, 55].forEach((m, i) => tone(mtof(m), t + i * 0.16, 0.3, 'triangle', 0.1)); },
    boss: t => { tone(55, t, 1.2, 'sawtooth', 0.2, null, 40); noise(t, 1, 0.2, 'lowpass', 300); },
    door: t => sample('enter', t, 0.6),
    buy: t => sample('buy', t, 0.6),
    tick: t => tone(2000, t, 0.02, 'square', 0.04),
    horn: t => { tone(330, t, 0.35, 'sawtooth', 0.09); tone(415, t, 0.35, 'sawtooth', 0.08); tone(330, t + 0.42, 0.5, 'sawtooth', 0.09); tone(415, t + 0.42, 0.5, 'sawtooth', 0.08); },   // Giselas Hupe
    laugh: t => { for (let i = 0; i < 5; i++) tone(U.rand(260, 340) - i * 12, t + i * 0.11, 0.09, 'triangle', 0.09, null, 200); noise(t, 0.6, 0.04, 'bandpass', 1200, null, 1); },
    spark: t => { noise(t, 0.12, 0.3, 'highpass', 3000); tone(2600, t, 0.08, 'square', 0.05, null, 400); },
    plug: t => { tone(140, t, 0.08, 'square', 0.12, null, 90); tone(900, t + 0.03, 0.05, 'triangle', 0.08); },
    whoosh: t => { const f = noise(t, 0.35, 0.18, 'bandpass', 500, null, 1.5); f.frequency.exponentialRampToValueAtTime(3500, t + 0.3); },
    feedback: t => tone(2900, t, 0.5, 'sine', 0.05, null, 3400),
    drum: t => { const o = tone(150, t, 0.22, 'sine', 0.5, null, 42); o.frequency.exponentialRampToValueAtTime(42, t + 0.12); }
  };
  /** einzelner Ton für Minispiele (MIDI-Nummer), z. B. Soundboard-Pads und Rhythmus-Treffer */
  A.note = function (m, dur, type, peak) { if (!A.ctx || !A.ready) return; try { tone(mtof(m), A.ctx.currentTime + 0.005, dur || 0.25, type || 'triangle', peak || 0.14); } catch (e) { /* still */ } };
  A.now = () => A.ctx ? A.ctx.currentTime : performance.now() / 1000;
  // ------------------------------------------------------------------ Klavierlicht: freie Melodien (../klavierlicht/archiv, gemeinfrei) mit Klavierklang
  let pWave = null;
  /** Klavierton (Obertöne wie in Klavierlicht, Filter schließt beim Abklingen). when = Audiozeit oder sofort */
  A.piano = function (m, when, dur, vel, out) {
    if (!A.ctx || !A.ready) return; const c = A.ctx;
    try {
      if (!pWave) { const h = [0, 1, 0.42, 0.2, 0.1, 0.05, 0.025]; pWave = c.createPeriodicWave(new Float32Array(h.length), new Float32Array(h)); }
      const t = Math.max(c.currentTime + 0.005, when || 0), f = mtof(m), v = Math.max(0.05, Math.min(1, vel == null ? 0.7 : vel));
      const decay = Math.max(0.35, 3.2 - (m - 48) * 0.04), hold = Math.min(Math.max(dur || 0.3, 0.12), decay);
      const o = c.createOscillator(), lp = c.createBiquadFilter(), g = c.createGain();
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(Math.min(12000, f * (4 + v * 6)), t); lp.frequency.setTargetAtTime(Math.max(500, f * 1.6), t, decay / 3);
      const pk = 0.22 * v; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(pk, t + 0.004); g.gain.setTargetAtTime(pk * 0.35, t + 0.004, 0.18); g.gain.setTargetAtTime(0, t + hold, 0.08);
      o.setPeriodicWave(pWave); o.frequency.value = f; o.connect(lp); lp.connect(g); g.connect(out || sfxBus); o.start(t); o.stop(t + hold + 0.5);
    } catch (e) { /* still */ }
  };
  const songs = {};
  /** Lied aus Klavierlicht laden: { title, step (ms je Schritt), mel: [[schritt, midi, länge]], bass } */
  // Erst lokal (Browser, Homepage), sonst online von der easygames-Homepage – die App liefert das Klavierlicht-Archiv nicht mit
  const ARCH = ['../klavierlicht/archiv/', (root.EASYGAMES_PUBLIC_BASE || 'https://ricorewioriginal-collab.github.io/easygames/').replace(/\/?$/, '/') + 'klavierlicht/archiv/'];
  const getJson = (file, i) => (i = i || 0) >= ARCH.length ? Promise.resolve(null) : fetch(ARCH[i] + file).then(r => r.ok ? r.json() : Promise.reject(r.status)).then(j => (j && typeof j === 'object' ? j : Promise.reject(0))).catch(() => getJson(file, i + 1));
  A.song = id => songs[id] || (songs[id] = getJson(id + '.json').then(j => { if (!j) delete songs[id]; return j; }));
  let idx = null;
  /** Liederliste des Klavierlicht-Archivs (Musikshop) */
  A.songIndex = () => idx || (idx = getJson('index.json').then(j => { if (!j) idx = null; return j && j.songs || null; }));
  /** Lied ab Schritt s0 für sec Sekunden abspielen (Melodie optional), gibt Stopp-Funktion zurück */
  A.playSong = function (song, o) {
    o = o || {}; if (!A.ctx || !A.ready || !song) return () => {};
    const st = song.step / 1000 * (o.slow || 1), s0 = o.from || 0, s1 = s0 + (o.sec || 12) / st, t0 = A.ctx.currentTime + 0.1, bus = A.ctx.createGain();
    bus.connect(sfxBus);
    const sched = (arr, vel) => (arr || []).forEach(([s, m, l]) => { if (s >= s0 && s < s1) A.piano(m, t0 + (s - s0) * st, l * st, vel, bus); });
    if (o.mel !== false) sched(song.mel, o.vel || 0.6); sched(song.bass, (o.vel || 0.6) * 0.55);
    // Spielmusik leiser, solange das Lied läuft
    let on = true; const off = () => { if (!on) return; on = false; songs0 = Math.max(0, songs0 - 1); A.apply(); };
    songs0++; A.apply(); const tm = setTimeout(off, ((s1 - s0) * st + 0.8) * 1000);
    return () => { clearTimeout(tm); off(); try { bus.gain.setTargetAtTime(0, A.ctx.currentTime, 0.05); setTimeout(() => bus.disconnect(), 400); } catch (e) { /* still */ } };
  };
  const U = AMC.U;
  function sample(n, t, v) { const b = samples[n]; if (!b) return; const s = A.ctx.createBufferSource(), g = A.ctx.createGain(); g.gain.value = v || 0.7; s.buffer = b; s.connect(g); g.connect(sfxBus); s.start(t); }
  const last = {};
  A.sfx = function (name) {
    if (!A.ctx || !A.ready || !FX[name]) return;
    const now = A.ctx.currentTime; if (last[name] && now - last[name] < 0.03) return; last[name] = now;
    try { FX[name](now + 0.005); } catch (e) { /* Ton darf nie das Spiel stören */ }
  };

  // ------------------------------------------------------------------ Musik (Schrittsequenzer, je Stimmung eigener Track)
  const TRACKS = {
    menu: { bpm: 112, prog: [57, 53, 48, 55], minor: true, kick: 'x...x...x...x...', snare: '....x.......x...', hat: '..x...x...x...x.', bass: 'x..x..x.x..x..x.', arp: false, pad: true, lead: [0, 3, 7, 10, 7, 3] },
    city: { bpm: 124, prog: [50, 46, 53, 48], minor: true, kick: 'x...x...x...x...', snare: '....x.......x...', hat: '.xx..xx..xx..xx.', bass: 'x.xx..x.x.xx..x.', arp: true, pad: true },
    show: { bpm: 104, prog: [45, 48, 43, 50], minor: true, kick: 'x.....x.x.......', snare: '....x.......x..x', hat: 'x.x.x.x.x.x.x.xx', bass: 'x..x....x.x..x..', arp: false, pad: true },
    boss: { bpm: 142, prog: [45, 45, 46, 43], minor: true, kick: 'x...x...x...x.x.', snare: '....x..x....x...', hat: 'xxxxxxxxxxxxxxxx', bass: 'xxxxxxxxxxxxxxxx', arp: true, pad: false },
    quiz: { bpm: 120, prog: [48, 53, 55, 48], minor: false, kick: 'x...x...x...x...', snare: '....x.......x...', hat: '..x...x...x...x.', bass: 'x...x.x.x...x.x.', arp: true, pad: false },
    party: { bpm: 128, prog: [53, 50, 46, 48], minor: false, kick: 'x...x...x...x...', snare: '....x.......x...', hat: '..x...x...x...x.', bass: '..x...x...x...x.', arp: true, pad: true }
  };
  let seq = null;
  A.music = function (name) {
    if (A.track === name && seq) return;
    A.track = name;
    if (!A.ctx) return;
    if (seq) { seq.stop = true; seq = null; }
    const T = TRACKS[name]; if (!T) return;
    const s = seq = { stop: false, step: 0, t: A.ctx.currentTime + 0.1 };
    const stepDur = 60 / T.bpm / 4;
    const run = () => {
      if (s.stop || !A.ctx) return;
      // großzügiger Vorlauf: ruckelnde Bilder (Handy) verzögern die Timer, die Musik läuft trotzdem gleichmäßig weiter
      const now = A.ctx.currentTime; if (s.t < now) s.t = now + 0.05;
      while (s.t < now + 0.7) { playStep(T, s.step, s.t, stepDur); s.t += stepDur; s.step++; }
      setTimeout(run, 120);
    };
    run();
  };
  A.stopMusic = () => { if (seq) seq.stop = true; seq = null; A.track = ''; };
  function playStep(T, step, t, sd) {
    const i = step % 16, bar = Math.floor(step / 16) % T.prog.length, root = T.prog[bar];
    const third = T.minor ? 3 : 4;
    if (T.kick[i] === 'x') { const o = tone(150, t, 0.22, 'sine', 0.55, musicBus, 42); o.frequency.exponentialRampToValueAtTime(42, t + 0.12); }
    if (T.snare[i] === 'x') { noise(t, 0.14, 0.22, 'bandpass', 1900, musicBus, 0.7); tone(220, t, 0.06, 'triangle', 0.08, musicBus); }
    if (T.hat[i] === 'x') noise(t, 0.035, i % 4 === 2 ? 0.07 : 0.04, 'highpass', 7500, musicBus);
    if (T.bass[i] === 'x') {
      const c = A.ctx, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
      o.type = 'sawtooth'; o.frequency.value = mtof(root - 12 + (i === 14 ? 7 : 0)); f.type = 'lowpass'; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(180, t + sd * 1.6);
      env(g, t, 0.005, 0.16, sd * 1.8); o.connect(f); f.connect(g); g.connect(musicBus); o.start(t); o.stop(t + sd * 2);
    }
    if (T.pad && i === 0) [0, third, 7, 12].forEach(s => { const o = tone(mtof(root + s + 12), t, sd * 15, 'triangle', 0.025, musicBus); o.detune.value = U.rand(-8, 8); });
    if (T.arp && i % 2 === 0) { const arp = [0, third, 7, 12, 7, third, 12, 15]; tone(mtof(root + 24 + arp[(i / 2) % 8]), t, sd * 0.9, 'square', 0.022, musicBus); }
    if (T.lead && i % 4 === 0 && (step >> 4) % 2 === 1) tone(mtof(root + 24 + T.lead[(i / 4 + bar) % T.lead.length]), t, sd * 3, 'sine', 0.04, musicBus);
  }
})(typeof window !== 'undefined' ? window : globalThis);
