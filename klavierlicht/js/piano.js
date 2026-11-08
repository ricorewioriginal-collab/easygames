/* Klavierlicht – Klavierklang ohne Samples und ohne Rauschen (Web Audio): je Ton ein Oszillator mit Klavier-Obertönen
 * (PeriodicWave), sanfter Anschlag, Filter schließt sich beim Abklingen. Sparsam, damit Handys nicht aussetzen (Knistern).
 * Ton lässt sich mit release() vorzeitig dämpfen (Taste loslassen). Raumklang aus drei kurzen Echos statt Rausch-Hall. Begrenzte Stimmenzahl und genug Reserve gegen Übersteuern. */
(function (root) {
  'use strict';
  let ctx = null, master = null, room = null, wave = null, voices = [], MAX = 16;
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    const AC = root.AudioContext || root.webkitAudioContext; if (!AC) return null;
    const phone = root.matchMedia && root.matchMedia('(pointer: coarse)').matches;
    // Handy: größerer Puffer (kein Knistern/Rauschen durch Aussetzer) und weniger gleichzeitige Stimmen
    try { ctx = new AC({ latencyHint: phone ? 'balanced' : 'interactive' }); } catch (e) { ctx = new AC(); }
    if (phone) MAX = 12;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = 0.005; comp.release.value = 0.2; comp.connect(ctx.destination);
    master = ctx.createGain(); master.gain.value = 0.8; master.connect(comp);
    room = ctx.createGain(); room.gain.value = 0.16;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600; room.connect(lp);
    [[0.043, 0.55], [0.089, 0.35], [0.137, 0.2]].forEach(([t, g]) => { const d = ctx.createDelay(0.5), gg = ctx.createGain(); d.delayTime.value = t; gg.gain.value = g; lp.connect(d); d.connect(gg); gg.connect(comp); });
    // Klavier-Obertöne als eine Wellenform: ein Oszillator je Ton statt fünf (spart Rechenleistung)
    const H = [0, 1, 0.42, 0.2, 0.1, 0.05, 0.025], re = new Float32Array(H.length), im = new Float32Array(H);
    wave = ctx.createPeriodicWave(re, im);
    return ctx;
  }
  const hz = p => 440 * Math.pow(2, (p - 69) / 12);
  function note(p, when, dur, vel) {
    if (!ctx) return null; const t = Math.max(ctx.currentTime + 0.005, when || 0); vel = Math.max(0.05, Math.min(1, vel == null ? 0.7 : vel));
    voices = voices.filter(v => v.end > ctx.currentTime);
    if (voices.length >= MAX) { const o = voices.shift(); try { o.g.gain.cancelScheduledValues(ctx.currentTime); o.g.gain.setTargetAtTime(0, ctx.currentTime, 0.015); o.os.forEach(x => x.stop(ctx.currentTime + 0.1)); } catch (e) { /* schon zu Ende */ } }
    const f = hz(p), decay = Math.max(0.6, 3.2 - (p - 48) * 0.04), hold = Math.min(Math.max(dur, 0.12), decay), end = t + hold + 0.4;
    const g = ctx.createGain(), lp = ctx.createBiquadFilter(), o = ctx.createOscillator();
    // Helligkeit klingt ab wie beim echten Klavier: Filter schließt sich langsam
    lp.type = 'lowpass'; lp.Q.value = 0.3; lp.frequency.setValueAtTime(Math.min(12000, f * (4 + vel * 6)), t); lp.frequency.setTargetAtTime(Math.max(500, f * 1.6), t, decay / 3);
    const peak = 0.5 * vel * (p > 84 ? 0.7 : 1);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + 0.004);
    g.gain.setTargetAtTime(peak * 0.35, t + 0.004, 0.18); g.gain.setTargetAtTime(0, t + hold, 0.08);
    o.setPeriodicWave(wave); o.frequency.value = f; o.connect(lp); lp.connect(g); g.connect(master); g.connect(room);
    o.start(t); o.stop(end);
    const v = { g, end, os: [o] }; voices.push(v); return v;
  }
  // Taste loslassen: Ton kurz ausklingen lassen (wie der Dämpfer beim echten Klavier)
  function release(v) {
    if (!ctx || !v || v.end <= ctx.currentTime) return; const t = ctx.currentTime, gp = v.g.gain;
    try { if (gp.cancelAndHoldAtTime) gp.cancelAndHoldAtTime(t); else { gp.cancelScheduledValues(t); gp.setValueAtTime(gp.value, t); } gp.setTargetAtTime(0, t, 0.07); v.os.forEach(o => o.stop(t + 0.5)); v.end = t + 0.5; } catch (e) { /* schon zu Ende */ }
  }
  function stopAll() { if (!ctx) return; const t = ctx.currentTime; voices.forEach(v => { try { v.g.gain.cancelScheduledValues(t); v.g.gain.setTargetAtTime(0, t, 0.03); } catch (e) { /* egal */ } }); voices = []; }
  root.KLPiano = { init, note, release, stopAll, get ctx() { return ctx; }, setVolume(v) { if (master) master.gain.value = v; } };
})(window);
