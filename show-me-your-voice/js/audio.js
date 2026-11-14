/* SHOW ME YOUR VOICE – Audio: Effekte und Treffer-Klänge (Web Audio, keine Dateien), Klavierlicht-Songs spielt js/klsongs.js
   sowie optionale Tonhöhenerkennung über das Mikrofon. Das Mikrofon wird nur nach ausdrücklicher Freigabe geöffnet,
   nur lokal ausgewertet (Tonhöhe und Lautstärke), nie aufgenommen, gespeichert oder übertragen.
   Musik kommt von echten Songs (YouTube, siehe media.js) oder den RicoReWi-Sendern – im Spiel erzeugte Songs gibt es nicht mehr. */
(function (root) {
  'use strict';
  const AC = root.AudioContext || root.webkitAudioContext;
  let ctx = null, master = null, mus = null, fx = null, noiseBuf = null;
  let vol = { music: 0.7, sfx: 0.8, mute: false };
  let voice = null, mic = null;

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
  function chordTones(style, songTime, bpm) {
    const p = PAT[style] || PAT.pop, bar = Math.floor(songTime / (240 / bpm)) % 4; return p.prog[(bar + 4) % 4];
  }

  // ---------- Effekte ----------
  const SFX = {
    tick() { noise(now(), 0.03, 0.12, 6000); },
    hit(m) { tone('triangle', mtof(m), now(), 0.22, 0.32); tone('sine', mtof(m + 12), now(), 0.12, 0.08); },
    miss() { noise(now(), 0.09, 0.18, 0, fx, 400); },
    // UI-Klang der Show: weiches Glas-Pling, Auswahl als kleiner Dur-Akkord, Bildwechsel als Luftzug
    click() { [76, 83, 88].forEach((m, i) => tone('triangle', mtof(m), now() + i * 0.018, 0.16, 0.07)); },
    move() { const m = [72, 74, 76, 79, 81][(SFX.mi = ((SFX.mi || 0) + 1) % 5)]; tone('sine', mtof(m), now(), 0.09, 0.06); tone('sine', mtof(m + 12), now(), 0.05, 0.02); },
    whoosh() { for (let i = 0; i < 6; i++) noise(now() + i * 0.025, 0.05, 0.035 * (1 - i / 7), 900 + i * 700); },
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
  // Mikrofon-Auswahl (Einstellungen): Gerät (deviceId, '' = Standard) und Kanal – 'mix' (mono/beide), 'left' bzw. 'right'
  // (SingStar-Empfänger ist ein Stereo-Gerät: blaues Mikro links, rotes rechts).
  let micPref = { device: '', ch: 'mix' }, micDuo = false;
  function micSetPrefs(p) { micPref = { device: (p && p.device) || '', ch: p && (p.ch === 'left' || p.ch === 'right') ? p.ch : 'mix' }; }
  // Duett: beide Kanäle eines Stereo-Mikros getrennt auswerten (SingStar-Empfänger: links blau, rechts rot). Gilt ab dem nächsten micStart.
  function micDuet(on) { micDuo = !!on; }
  async function micDevices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return [];
    const l = await navigator.mediaDevices.enumerateDevices();
    return l.filter(d => d.kind === 'audioinput' && d.deviceId !== 'default' && d.deviceId !== 'communications')
      .map(d => ({ id: d.deviceId, label: d.label || 'Mikrofon', singstar: /singstar|usbmic|usb mic|ps2|namtai|logitech usb microphone/i.test(d.label || '') }));
  }
  // voice = true (Vorsingen): ohne Rauschunterdrückung, die lange gehaltene Töne abschneidet und die Aufnahme dumpf macht.
  // hp = true (Kopfhörer): auch ohne Echo-Unterdrückung und automatische Lautstärke – die verzerren Gesang; ohne Lautsprecher-Musik braucht es sie nicht.
  async function micStart(voice, hp) {
    if (!init() || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('nosupport');
    micWant = true; if (mic) return true;
    // Ein Kanal (SingStar): Stereo anfordern und ohne Bearbeitung – die würde beide Mikros zu einem zusammenmischen
    const split = micPref.ch !== 'mix' || micDuo;
    const a = { echoCancellation: !split && !(voice && hp), noiseSuppression: !split && !voice, autoGainControl: !split && !(voice && hp), channelCount: split ? 2 : 1 };
    if (micPref.device) a.deviceId = { exact: micPref.device };
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: a }); }
    catch (e) {
      // Verweigert/gesperrt: nicht noch einmal fragen. Sonst (Android: Gerät belegt, Wunsch-Einstellungen nicht erfüllbar, altes Gerät weg) mit Standard-Mikro und ohne Wünsche erneut.
      if (e && (e.name === 'NotAllowedError' || e.name === 'SecurityError')) throw e;
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    if (!micWant || mic) { if (!mic || mic.stream !== stream) stream.getTracks().forEach(t => t.stop()); return !!mic; }   // inzwischen wieder gestoppt
    const src = ctx.createMediaStreamSource(stream), an = ctx.createAnalyser();
    let node = src, tr = stream.getAudioTracks()[0], set = tr && tr.getSettings ? tr.getSettings() : {};
    let node2 = null, an2 = null;
    if (split && (set.channelCount || 2) >= 2) {   // nur den gewählten Kanal auswerten und aufnehmen
      const sp = ctx.createChannelSplitter(2), g = ctx.createGain(); src.connect(sp); sp.connect(g, micDuo ? 0 : micPref.ch === 'right' ? 1 : 0); node = g;
      if (micDuo) { node2 = ctx.createGain(); sp.connect(node2, 1); an2 = ctx.createAnalyser(); an2.fftSize = 2048; node2.connect(an2); }
    }
    an.fftSize = 2048; node.connect(an);          // nicht mit den Lautsprechern verbunden: kein Echo, keine Aufnahme
    mic = { stream, src, node, an, node2, an2, buf: new Float32Array(1024), label: (tr && tr.label) || '', channels: set.channelCount || 1, ch: node === src ? 'mix' : micDuo ? 'left' : micPref.ch };
    return true;
  }
  // Freigabe-Status ohne Nachfrage: 'granted', 'denied', 'prompt' oder '' (Browser kann es nicht sagen)
  async function micPerm() { try { const st = await navigator.permissions.query({ name: 'microphone' }); return st.state || ''; } catch (e) { return ''; } }
  function micStop() {
    micWant = false; if (!mic) return;
    const rn = mic.rec ? mic.rec.nodes : null;
    try { mic.stream.getTracks().forEach(t => t.stop()); mic.src.disconnect(); if (mic.node !== mic.src) mic.node.disconnect(); if (mic.node2) mic.node2.disconnect(); } catch (e) {}
    if (rn) setTimeout(() => rn.forEach(n => { try { n.disconnect(); } catch (e) {} }), 900);   // erst nach dem Vorlauf: das Ende des letzten Tons kommt noch in die Aufnahme
    mic = null;
  }
  // Studio-Klang für die Aufnahme: Kompressor, etwas Präsenz, ein kurzer Hall und ein Limiter gegen Übersteuern. Geht nur in die Aufnahme, nicht in die Lautsprecher.
  // Die Aufnahme läuft REC_PRE Sekunden verzögert: Sie startet erst beim ersten erkannten Ton und hat trotzdem den Einsatz (Konsonanten, Atem) mit drauf.
  const REC_PRE = 0.4;
  function micRecStream() {
    if (!mic) return null;
    if (mic.rec) return mic.rec.dest.stream;
    try {
      const comp = ctx.createDynamicsCompressor(), eq = ctx.createBiquadFilter(), hp = ctx.createBiquadFilter(), dry = ctx.createGain(), wet = ctx.createGain(), rev = ctx.createConvolver(), dest = ctx.createMediaStreamDestination();
      const pre = ctx.createDelay(1), bus = ctx.createGain(), lim = ctx.createDynamicsCompressor();
      pre.delayTime.value = REC_PRE; bus.gain.value = 1.6;
      lim.threshold.value = -3; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.002; lim.release.value = 0.1;
      hp.type = 'highpass'; hp.frequency.value = 80;
      eq.type = 'peaking'; eq.frequency.value = 3000; eq.Q.value = 0.8; eq.gain.value = 3;
      comp.threshold.value = -24; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.2;
      const sr = ctx.sampleRate, n = Math.floor(sr * 1.6), ir = ctx.createBuffer(2, n, sr);
      for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3); }
      rev.buffer = ir; dry.gain.value = 1; wet.gain.value = 0.3;
      mic.node.connect(pre); pre.connect(hp); hp.connect(eq); eq.connect(comp); comp.connect(dry); comp.connect(rev); rev.connect(wet); dry.connect(bus); wet.connect(bus); bus.connect(lim); lim.connect(dest);
      mic.rec = { dest, nodes: [pre, hp, eq, comp, dry, wet, rev, bus, lim, dest] };
      return dest.stream;
    } catch (e) { return mic.stream; }
  }
  // Lautstärke (RMS) fürs Treffen der Noten mit der Stimme; null ohne Mikrofon
  // k = 1: zweites Mikro im Duett (rechter Kanal)
  const micAn = k => (!mic ? null : k ? mic.an2 : mic.an);
  function micLevel(k) {
    const an = micAn(k); if (!an) return null;
    const b = mic.buf; an.getFloatTimeDomainData(b);
    let rms = 0; for (let i = 0; i < b.length; i++) rms += b[i] * b[i];
    return Math.sqrt(rms / b.length);
  }
  // Grundton per Autokorrelation (70–1000 Hz). Liefert MIDI-Ton (Kommazahl) oder null bei Stille.
  function micPitch(k) {
    const an = micAn(k); if (!an) return null;
    const b = mic.buf; an.getFloatTimeDomainData(b);
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

  root.SMYVAudio = { init, setVolume, ok, chordTones, sfx, guide, voiceOn, voiceSet, voiceOff,
    micStart, micStop, micPerm, micDuet, micDuetOn: () => !!(mic && mic.an2), micPitch, micLevel, micActive: () => !!mic, micDevices, micSetPrefs, micInfo: () => (mic ? { label: mic.label, channels: mic.channels, ch: mic.ch } : null), micStream: () => (mic ? mic.stream : null), micRecStream, micRecPre: () => (mic && mic.rec ? REC_PRE : 0), mtof, ctxTime: () => (ctx ? ctx.currentTime : 0) };
})(window);
