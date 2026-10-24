/* SHOW ME YOUR VOICE – Audio: im Browser erzeugte Beats, Melodien und Effekte (Web Audio, keine Dateien)
   sowie optionale Tonhöhenerkennung über das Mikrofon. Das Mikrofon wird nur nach ausdrücklicher Freigabe geöffnet,
   nur lokal ausgewertet (Tonhöhe und Lautstärke), nie aufgenommen, gespeichert oder übertragen.
   Austauschbar: Songs liefern nur bpm/Stil/Akkorde – später können hier echte Audiodateien eingehängt werden. */
(function (root) {
  'use strict';
  const AC = root.AudioContext || root.webkitAudioContext;
  let ctx = null, master = null, mus = null, fx = null, noiseBuf = null;
  let vol = { music: 0.7, sfx: 0.8, mute: false };
  let voice = null, mic = null, radio = null;

  function init() {
    if (!AC) return false;
    try {
      if (!ctx) {
        ctx = new AC();
        master = ctx.createGain(); master.connect(ctx.destination);
        mus = ctx.createGain(); mus.connect(master);
        fx = ctx.createGain(); fx.connect(master);
        noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        apply();
      }
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      return true;
    } catch (e) { ctx = null; return false; }
  }
  function apply() {
    if (!ctx) return;
    master.gain.value = vol.mute ? 0 : 1;
    mus.gain.value = vol.music * 0.55; fx.gain.value = vol.sfx * 0.8;
    if (radio && radio.plain && !radio.muted) radio.el.volume = musVol();
  }
  const musVol = () => (vol.mute ? 0 : Math.max(0.001, Math.min(1, vol.music)));
  function setVolume(v) { Object.assign(vol, v); apply(); }
  const ok = () => !!ctx && ctx.state === 'running' && !vol.mute;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  function env(g, t, a, peak, d) {
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  function tone(type, freq, t, dur, peak, dest, f2) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    env(g, t, 0.006, peak, dur); o.connect(g); g.connect(dest || fx); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, dur, peak, hp, dest, lp) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = lp ? 'lowpass' : 'highpass'; f.frequency.value = lp || hp;
    env(g, t, 0.003, peak, dur); s.connect(f); f.connect(g); g.connect(dest || fx);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }

  // ---------- Musik ----------
  const PAT = {   // 16tel-Raster: k = Kick, s = Snare, h = HiHat
    ballade: { k: 'x.......x.......', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', prog: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], bass: [45, 41, 36, 43] },
    pop: { k: 'x...x...x...x...', s: '....x.......x...', h: '..x...x...x...x.', prog: [[48, 52, 55], [55, 59, 62], [57, 60, 64], [53, 57, 60]], bass: [36, 43, 45, 41] },
    soul: { k: 'x.....x...x.....', s: '....x.......x..x', h: 'x.xxx.x.x.xxx.x.', prog: [[50, 53, 57], [55, 59, 62], [48, 52, 55], [57, 60, 64]], bass: [38, 43, 36, 45] },
    rock: { k: 'x.x...x.x.x...x.', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', prog: [[45, 48, 52], [41, 45, 48], [48, 52, 55], [43, 47, 50]], bass: [33, 29, 36, 31] },
    winter: { k: 'x.......x...x...', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', prog: [[48, 52, 55], [57, 60, 64], [53, 57, 60], [55, 59, 62]], bass: [36, 45, 41, 43], bell: true }
  };
  function song(style, bpm) { return { pat: PAT[style] || PAT.pop, step: 0, spb: 60 / bpm / 4, on: true }; }
  // Plant alle Schläge bis songNow + 0,15 s. songNow = Spielzeit in Sekunden (Taktbeginn bei 0).
  function tick(sg, songNow) {
    if (!sg || !sg.on || !ok()) { if (sg) sg.step = Math.max(sg.step, Math.ceil(songNow / sg.spb)); return; }
    while (sg.step * sg.spb < songNow + 0.15) {
      const st = sg.step * sg.spb; sg.step++;
      if (st < songNow - 0.05) continue;
      const t = ctx.currentTime + (st - songNow), i = (sg.step - 1) % 16, bar = Math.floor((sg.step - 1) / 16) % 4, p = sg.pat;
      if (p.k[i] === 'x') tone('sine', 140, t, 0.22, 0.9, mus, 42);
      if (p.s[i] === 'x') { noise(t, 0.14, 0.45, 1400, mus); tone('triangle', 190, t, 0.08, 0.25, mus); }
      if (p.h[i] === 'x') noise(t, 0.035, 0.12, 7000, mus);
      if (i % 4 === 0) tone('triangle', mtof(p.bass[bar]), t, sg.spb * 3.2, 0.35, mus);
      if (i === 0) p.prog[bar].forEach(m => tone('sine', mtof(m + 12), t, sg.spb * 15, 0.06, mus));
      if (p.bell && i % 8 === 4) tone('sine', mtof(p.prog[bar][2] + 24), t, 0.5, 0.08, mus);
    }
  }
  function chordTones(style, songTime, bpm) {
    const p = PAT[style] || PAT.pop, bar = Math.floor(songTime / (240 / bpm)) % 4; return p.prog[(bar + 4) % 4];
  }

  // ---------- Effekte ----------
  const SFX = {
    tick() { noise(now(), 0.03, 0.12, 6000); },
    hit(m) { tone('triangle', mtof(m), now(), 0.22, 0.32); tone('sine', mtof(m + 12), now(), 0.12, 0.08); },
    miss() { noise(now(), 0.09, 0.18, 0, fx, 400); },
    click() { tone('square', 880, now(), 0.04, 0.08); },
    move() { tone('sine', 660, now(), 0.03, 0.05); },
    yes() { [60, 64, 67, 72].forEach((m, i) => tone('triangle', mtof(m + 12), now() + i * 0.07, 0.25, 0.25)); },
    no() { [62, 58].forEach((m, i) => tone('sawtooth', mtof(m), now() + i * 0.16, 0.3, 0.12)); },
    buzzer() { tone('sawtooth', 110, now(), 0.6, 0.18); tone('square', 116, now(), 0.6, 0.08); },
    cue() { tone('sine', 1320, now(), 0.12, 0.2); tone('sine', 1760, now() + 0.06, 0.12, 0.15); },
    star() { [72, 76, 79, 84, 88].forEach((m, i) => tone('sine', mtof(m), now() + i * 0.05, 0.3, 0.16)); },
    fanfare() { [[60, 0], [64, 0.12], [67, 0.24], [72, 0.36], [67, 0.6], [72, 0.72]].forEach(([m, d]) => { tone('square', mtof(m), now() + d, 0.3, 0.1); tone('triangle', mtof(m - 12), now() + d, 0.3, 0.18); }); },
    drumroll(sec) { const t0 = now(); for (let t = 0; t < (sec || 1.4); t += 0.045) noise(t0 + t, 0.04, 0.08 + t * 0.12, 1800); },
    applause(sec) { const t0 = now(); for (let t = 0; t < (sec || 2); t += 0.03) noise(t0 + t + Math.random() * 0.02, 0.03, 0.05 * (1 - t / (sec || 2)) + 0.02, 2500); },
    golden() { [79, 83, 86, 91, 95, 98].forEach((m, i) => tone('sine', mtof(m), now() + i * 0.08, 0.5, 0.14)); this.applause(2.5); }
  };
  function now() { return ctx.currentTime + 0.005; }
  function sfx(name, a) { if (!ok() || !SFX[name]) return; try { SFX[name](a); } catch (e) { /* Ton ist optional */ } }
  function guide(m, dur) { if (ok()) try { tone('sine', mtof(m), now(), dur, 0.07); } catch (e) {} }

  // Gesangsstimme für Tasten/Touch: Ton folgt der Markierung
  function voiceOn() {
    if (!ok() || voice) return;
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth'; o2.type = 'sine'; f.type = 'lowpass'; f.frequency.value = 1400; g.gain.value = 0;
    o.connect(f); o2.connect(f); f.connect(g); g.connect(fx); o.start(); o2.start();
    voice = { o, o2, g };
  }
  function voiceSet(m, on) {
    if (!voice) return; const t = ctx.currentTime;
    voice.o.frequency.setTargetAtTime(mtof(m), t, 0.03); voice.o2.frequency.setTargetAtTime(mtof(m), t, 0.03);
    voice.g.gain.setTargetAtTime(on ? 0.07 : 0, t, 0.05);
  }
  function voiceOff() {
    if (!voice) return; const v = voice; voice = null;
    try { v.g.gain.setTargetAtTime(0, ctx.currentTime, 0.03); v.o.stop(ctx.currentTime + 0.2); v.o2.stop(ctx.currentTime + 0.2); } catch (e) {}
  }

  // ---------- Mikrofon (optional) ----------
  let micWant = false;
  async function micStart() {
    if (!init() || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('nosupport');
    micWant = true; if (mic) return true;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    if (!micWant || mic) { if (!mic || mic.stream !== stream) stream.getTracks().forEach(t => t.stop()); return !!mic; }   // inzwischen wieder gestoppt
    const src = ctx.createMediaStreamSource(stream), an = ctx.createAnalyser();
    an.fftSize = 2048; src.connect(an);           // nicht mit den Lautsprechern verbunden: kein Echo, keine Aufnahme
    mic = { stream, src, an, buf: new Float32Array(1024) };
    return true;
  }
  function micStop() {
    micWant = false; if (!mic) return;
    try { mic.stream.getTracks().forEach(t => t.stop()); mic.src.disconnect(); } catch (e) {}
    mic = null;
  }
  // Lautstärke (RMS) fürs Treffen der Noten mit der Stimme; null ohne Mikrofon
  function micLevel() {
    if (!mic) return null;
    const b = mic.buf; mic.an.getFloatTimeDomainData(b);
    let rms = 0; for (let i = 0; i < b.length; i++) rms += b[i] * b[i];
    return Math.sqrt(rms / b.length);
  }
  // Grundton per Autokorrelation (70–1000 Hz). Liefert MIDI-Ton (Kommazahl) oder null bei Stille.
  function micPitch() {
    if (!mic) return null;
    const b = mic.buf; mic.an.getFloatTimeDomainData(b);
    let rms = 0; for (let i = 0; i < b.length; i++) rms += b[i] * b[i];
    rms = Math.sqrt(rms / b.length); if (rms < 0.012) return null;
    const sr = ctx.sampleRate, minL = Math.floor(sr / 1000), maxL = Math.min(b.length - 1, Math.floor(sr / 70));
    let e0 = 0; for (let i = 0; i < b.length; i++) e0 += b[i] * b[i];
    // erst bis zum ersten Tal laufen, dann den nächsten Gipfel suchen (Periodenlänge)
    let best = 0, bestL = 0, prev = Infinity, dipped = false;
    for (let L = minL; L <= maxL; L++) {
      let s = 0; for (let i = 0; i + L < b.length; i++) s += b[i] * b[i + L];
      if (!dipped) { if (s > prev) dipped = true; else { prev = s; continue; } }
      if (s > best) { best = s; bestL = L; } else if (bestL && s < best * 0.85) break;
      prev = s;
    }
    if (!bestL || best < e0 * 0.3) return null;
    return 69 + 12 * Math.log2(sr / bestL / 440);
  }

  // ---------- Radio (laut.fm-Sender der RicoReWi-Familie) ----------
  // Der Stream läuft durch einen Analysator (Beat-Erkennung) und dann um delaySec verzögert in die Lautsprecher:
  // So entsteht jede Note genau dann oben im Bild, wenn ihr Beat gleich unten zu hören ist.
  // Ohne CORS-Freigabe des Streams lässt der Browser keine Analyse zu – dann kommt ein Fehler und das Spiel nimmt eigene Beats.
  // plain = true: Sender nur abspielen (ohne Analyse). So läuft er auch, wenn der Stream keine CORS-Freigabe hat.
  function radioStart(slug, delaySec, url, plain) {
    return new Promise((resolve, reject) => {
      if (!init()) { reject(new Error('noaudio')); return; }
      radioStop();
      let done = false, el, g;
      const fail = why => { if (done) return; done = true; clearTimeout(to); radioStop(); reject(new Error(why)); };
      const to = setTimeout(() => fail('timeout'), plain ? 12000 : 6000);
      try {
        el = new Audio(); el.preload = 'auto';
        if (plain) { el.volume = musVol(); radio = { el, plain: true }; }
        else {
        el.crossOrigin = 'anonymous';
        const src = ctx.createMediaElementSource(el), an = ctx.createAnalyser(), dl = ctx.createDelay(5);
        g = ctx.createGain(); g.gain.value = 0;
        an.fftSize = 1024; an.smoothingTimeConstant = 0; dl.delayTime.value = Math.min(4.5, Math.max(0, delaySec));
        src.connect(an); src.connect(dl); dl.connect(g); g.connect(mus);
        radio = { el, src, an, dl, g, spec: new Uint8Array(an.frequencyBinCount), prev: [0, 0, 0, 0], avg: [0.02, 0.02, 0.02, 0.02], last: [0, 0, 0, 0], alt: [0, 0, 0, 0] };
        }
      } catch (e) { fail('graph'); return; }
      el.addEventListener('error', () => fail('error'), { once: true });
      el.addEventListener('error', () => { if (done && radio && radio.el === el) { radioStop(); if (onLost) onLost(); } });
      el.addEventListener('ended', () => { if (done && radio && radio.el === el) { radioStop(); if (onLost) onLost(); } });
      el.addEventListener('playing', () => { if (done) return; done = true; clearTimeout(to); if (g) g.gain.setTargetAtTime(1, ctx.currentTime, 0.05); resolve(true); }, { once: true });
      el.src = url || 'https://stream.laut.fm/' + encodeURIComponent(slug);
      const pr = el.play(); if (pr && pr.catch) pr.catch(() => fail('play'));
    });
  }
  let onLost = null;   // Rückruf, wenn der Stream nach dem Start abbricht
  function radioStop() {
    if (!radio) return; const r = radio; radio = null;
    try { r.el.pause(); r.el.removeAttribute('src'); r.el.load(); if (r.src) { r.src.disconnect(); r.g.disconnect(); } } catch (e) { /* schon weg */ }
  }
  function radioMute(on) { if (!radio) return; radio.muted = on; if (radio.plain) radio.el.volume = on ? 0 : musVol(); else radio.g.gain.setTargetAtTime(on ? 0 : 1, ctx.currentTime, 0.08); }
  // Beat-Erkennung: Energiezuwachs (spektraler Fluss) in vier Frequenzbändern. Liefert erkannte Schläge mit Band und Stärke.
  const BANDS = [[1, 4], [4, 12], [12, 40], [40, 120]];
  function radioOnsets(t) {
    if (!radio || radio.plain) return [];
    const r = radio, sp = r.spec, out = []; r.an.getByteFrequencyData(sp);
    for (let b = 0; b < 4; b++) {
      let e = 0; const [lo, hi] = BANDS[b]; for (let i = lo; i < hi; i++) e += sp[i]; e /= (hi - lo) * 255;
      const flux = Math.max(0, e - r.prev[b]); r.prev[b] = e;
      if (t < r.last[b]) r.last[b] = -9;   // neuer Teil: Uhr beginnt wieder bei 0
      if (flux > r.avg[b] * 2.4 + 0.025 && t - r.last[b] > 0.13) { r.last[b] = t; out.push({ band: b, s: flux, lane: (b + (r.alt[b]++ % 2)) % 4 }); }
      r.avg[b] = r.avg[b] * 0.92 + flux * 0.08;
    }
    return out;
  }
  function radioSong(slug) {
    return fetch('https://api.laut.fm/station/' + encodeURIComponent(slug) + '/current_song').then(r => (r.ok ? r.json() : null))
      .then(j => (j && j.title ? { title: String(j.title), artist: j.artist && j.artist.name ? String(j.artist.name) : '',
        start: Date.parse(j.started_at) || 0, end: Date.parse(j.ends_at) || 0, type: String(j.type || 'song') } : null)).catch(() => null);
  }

  root.SMYVAudio = { radioOnLost: cb => { onLost = cb; }, radioStart, radioStop, radioMute, radioOnsets, radioSong, radioActive: () => !!radio, radioPlain: () => !!(radio && radio.plain), init, setVolume, ok, song, tick, chordTones, sfx, guide, voiceOn, voiceSet, voiceOff,
    micStart, micStop, micPitch, micLevel, micActive: () => !!mic, mtof, ctxTime: () => (ctx ? ctx.currentTime : 0) };
})(window);
