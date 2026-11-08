/* Klavierlicht – Klavierklang ohne Samples und ohne Rauschen (Web Audio): je Ton reine Sinus-Teiltöne mit eigenem Abklingen
 * (höhere Teiltöne klingen schneller ab, leicht gespreizt wie beim echten Klavier), sanfter Anschlag, weicher Filter.
 * Raumklang aus zwei kurzen Echos statt Rausch-Hall. Begrenzte Stimmenzahl und genug Reserve gegen Übersteuern. */
(function (root) {
  'use strict';
  let ctx = null, master = null, room = null, voices = [];
  const MAX = 24;
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    const AC = root.AudioContext || root.webkitAudioContext; if (!AC) return null;
    ctx = new AC({ latencyHint: 'interactive' });
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = 0.005; comp.release.value = 0.2; comp.connect(ctx.destination);
    master = ctx.createGain(); master.gain.value = 0.55; master.connect(comp);
    // Raum: zwei gedämpfte Echos (kein Rauschen)
    room = ctx.createGain(); room.gain.value = 0.16;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600; room.connect(lp);
    [[0.043, 0.55], [0.089, 0.35], [0.137, 0.2]].forEach(([t, g]) => { const d = ctx.createDelay(0.5), gg = ctx.createGain(); d.delayTime.value = t; gg.gain.value = g; lp.connect(d); d.connect(gg); gg.connect(comp); });
    return ctx;
  }
  const hz = p => 440 * Math.pow(2, (p - 69) / 12);
  const PART = [[1, 1, 1], [2, 0.42, 0.62], [3, 0.2, 0.42], [4, 0.1, 0.3], [5, 0.05, 0.22]];   // [Vielfaches, Lautstärke, Abklingfaktor]
  function note(p, when, dur, vel) {
    if (!ctx) return; const t = Math.max(ctx.currentTime + 0.005, when || 0); vel = Math.max(0.05, Math.min(1, vel == null ? 0.7 : vel));
    voices = voices.filter(v => v.end > ctx.currentTime);
    if (voices.length >= MAX) { const o = voices.shift(); try { o.g.gain.cancelScheduledValues(ctx.currentTime); o.g.gain.setTargetAtTime(0, ctx.currentTime, 0.02); } catch (e) { /* schon zu Ende */ } }
    const f = hz(p), decay = Math.max(0.6, 3.2 - (p - 48) * 0.04), hold = Math.min(Math.max(dur, 0.12), decay), end = t + hold + 0.5;
    const g = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.Q.value = 0.3; lp.frequency.setValueAtTime(Math.min(12000, f * (4 + vel * 6)), t); lp.frequency.setTargetAtTime(Math.max(600, f * 2.2), t, decay / 2);
    const peak = 0.2 * vel * (p > 84 ? 0.7 : 1);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + 0.004);
    g.gain.setTargetAtTime(peak * 0.35, t + 0.004, 0.18); g.gain.setTargetAtTime(0, t + hold, 0.09);
    lp.connect(g); g.connect(master); g.connect(room);
    const nyq = ctx.sampleRate / 2.2;
    for (const [m, a, dk] of PART) {
      const fm = f * m * (1 + 0.0004 * m * m); if (fm > nyq) break;   // leichte Spreizung der Obertöne
      const o = ctx.createOscillator(), og = ctx.createGain(); o.type = 'sine'; o.frequency.value = fm;
      og.gain.setValueAtTime(a, t); og.gain.setTargetAtTime(0, t + 0.01, decay * dk / 3);
      o.connect(og).connect(lp); o.start(t); o.stop(end);
    }
    voices.push({ g, end });
  }
  function stopAll() { if (!ctx) return; const t = ctx.currentTime; voices.forEach(v => { try { v.g.gain.cancelScheduledValues(t); v.g.gain.setTargetAtTime(0, t, 0.03); } catch (e) { /* egal */ } }); voices = []; }
  root.KLPiano = { init, note, stopAll, get ctx() { return ctx; }, setVolume(v) { if (master) master.gain.value = v; } };
})(window);
