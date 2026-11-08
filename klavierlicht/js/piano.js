/* Klavierlicht – Klavierklang ohne Samples (Web Audio): je Ton drei Teiltöne mit leichter Verstimmung, Hammer-Geräusch,
 * tonhöhenabhängiges Abklingen und Filter, dazu ein kleiner Raumhall. Begrenzte Stimmenzahl, damit es auch auf Handys läuft. */
(function (root) {
  'use strict';
  let ctx = null, master = null, wet = null, noiseBuf = null, voices = [];
  const MAX = 28;
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    const AC = root.AudioContext || root.webkitAudioContext; if (!AC) return null;
    ctx = new AC({ latencyHint: 'interactive' });
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3; comp.connect(ctx.destination);
    master = ctx.createGain(); master.gain.value = 0.8; master.connect(comp);
    // kurzer Hall aus abklingendem Rauschen (einmal erzeugt)
    const len = Math.floor(ctx.sampleRate * 1.6), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    const conv = ctx.createConvolver(); conv.buffer = ir; wet = ctx.createGain(); wet.gain.value = 0.18; wet.connect(conv); conv.connect(comp);
    noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate); const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * (1 - i / nd.length);
    return ctx;
  }
  const hz = p => 440 * Math.pow(2, (p - 69) / 12);
  function note(p, when, dur, vel) {
    if (!ctx) return; const t = Math.max(ctx.currentTime, when || ctx.currentTime); vel = Math.max(0.05, Math.min(1, vel == null ? 0.7 : vel));
    voices = voices.filter(v => v.end > ctx.currentTime); if (voices.length >= MAX) { const o = voices.shift(); try { o.g.gain.cancelScheduledValues(t); o.g.gain.setTargetAtTime(0, t, 0.015); } catch (e) { /* schon zu Ende */ } }
    const f = hz(p), decay = Math.max(0.5, 3.4 - (p - 48) * 0.045), rel = Math.min(dur, decay), end = t + rel + 0.35;
    const g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(Math.min(16000, f * (3 + vel * 9)), t); lp.frequency.exponentialRampToValueAtTime(Math.max(f * 1.6, 300), t + decay);
    lp.Q.value = 0.4; g.connect(master); g.connect(wet); lp.connect(g);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32 * vel, t + 0.006); g.gain.exponentialRampToValueAtTime(0.14 * vel, t + 0.25);
    g.gain.setTargetAtTime(0.0001, t + 0.25, decay / 3); g.gain.setTargetAtTime(0.0001, t + rel, 0.12);
    [[1, 1, 'triangle'], [2, 0.32, 'sine'], [3, 0.12, 'sine'], [1.003, 0.35, 'sine']].forEach(([m, a, type]) => {
      const o = ctx.createOscillator(), og = ctx.createGain(); o.type = type; o.frequency.value = f * m; og.gain.value = a; o.connect(og).connect(lp); o.start(t); o.stop(end);
    });
    const n = ctx.createBufferSource(), ng = ctx.createGain(), nf = ctx.createBiquadFilter(); n.buffer = noiseBuf; nf.type = 'bandpass'; nf.frequency.value = Math.min(6000, f * 4); ng.gain.value = 0.05 * vel;
    n.connect(nf).connect(ng).connect(g); n.start(t);
    voices.push({ g, end });
  }
  function stopAll() { if (!ctx) return; const t = ctx.currentTime; voices.forEach(v => { try { v.g.gain.cancelScheduledValues(t); v.g.gain.setTargetAtTime(0, t, 0.03); } catch (e) { /* egal */ } }); voices = []; }
  root.KLPiano = { init, note, stopAll, get ctx() { return ctx; }, setVolume(v) { if (master) master.gain.value = v; } };
})(window);
