/* Funkhaus – Ton: alles per WebAudio erzeugt (keine Audiodateien). */
let ac = null, master = null, noiseBuf = null, on = true;
const hz = n => 440 * Math.pow(2, (n - 69) / 12);
function ctx() { if (!ac) { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = 0.8; master.connect(ac.destination); noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } if (ac.state === 'suspended') ac.resume(); return ac; }
function note(f, d, type, v, at, o) { try { const c = ctx(), t = c.currentTime + (at || 0), os = c.createOscillator(), g = c.createGain(); o = o || {}; os.type = type || 'sine'; os.frequency.setValueAtTime(f, t); if (o.to) os.frequency.exponentialRampToValueAtTime(o.to, t + d); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v || 0.08, t + (o.atk || 0.01)); g.gain.exponentialRampToValueAtTime(0.0001, t + d); os.connect(g); g.connect(master); os.start(t); os.stop(t + d + 0.03); } catch (e) {} }
function noise(d, v, at, f, type) { try { const c = ctx(), t = c.currentTime + (at || 0), s = c.createBufferSource(), g = c.createGain(), fl = c.createBiquadFilter(); s.buffer = noiseBuf; fl.type = type || 'bandpass'; fl.frequency.value = f || 2000; fl.Q.value = 0.7; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v || 0.05, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d); s.connect(fl); fl.connect(g); g.connect(master); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.05); } catch (e) {} }
const g = f => (...a) => { if (on) f(...a); };
export const SFX = {
  click: g(() => note(1200, 0.05, 'square', 0.03)),
  flip: g(() => { note(520, 0.1, 'triangle', 0.06, 0, { to: 880 }); noise(0.08, 0.03, 0, 3500, 'highpass'); }),
  ding: g(() => { [79, 86].forEach((n, i) => note(hz(n), 0.5, 'triangle', 0.08, i * 0.09)); }),
  top: g(() => { [72, 76, 79, 84, 88].forEach((n, i) => note(hz(n), 0.4, 'triangle', 0.08, i * 0.07)); noise(1.2, 0.04, 0.1, 2800); }),
  buzz: g(() => { note(110, 0.7, 'sawtooth', 0.09, 0, { to: 90 }); note(113, 0.7, 'square', 0.05, 0); }),
  type: g(() => note(900 + Math.random() * 300, 0.025, 'square', 0.02)),
  tick: g(() => note(1500, 0.03, 'square', 0.025)),
  clap: g((len = 1.6) => { for (let i = 0; i < len * 14; i++) noise(0.06, 0.035, i * 0.07 + Math.random() * 0.05, 1800 + Math.random() * 1500); }),
  fanfare: g(() => { [[67, 0], [72, 0.15], [76, 0.3], [79, 0.45], [84, 0.65]].forEach(([n, t]) => { note(hz(n), 0.6, 'sawtooth', 0.05, t); note(hz(n + 12), 0.6, 'triangle', 0.05, t); }); noise(1.8, 0.04, 0.6, 3000); }),
  sad: g(() => { [64, 62, 60, 55].forEach((n, i) => note(hz(n), 0.45, 'triangle', 0.07, i * 0.3)); }),
  steal: g(() => { [60, 64, 67, 72, 67, 64, 60].forEach((n, i) => note(hz(n), 0.16, 'square', 0.04, i * 0.09)); }),
  sting: g(() => { note(98, 0.9, 'sawtooth', 0.09, 0, { to: 70 }); note(147, 0.9, 'square', 0.04, 0.02, { to: 105 }); noise(0.5, 0.06, 0, 400, 'lowpass'); }),
  drum: g(() => { note(90, 0.25, 'sine', 0.2, 0, { to: 45 }); noise(0.08, 0.04, 0, 200, 'lowpass'); }),
  beep: g((f = 880) => note(f, 0.18, 'square', 0.05)),
  swoosh: g(() => noise(0.25, 0.05, 0, 1800, 'bandpass')),
  pad: g(i => note([262, 330, 392, 523][i % 4], 0.35, 'triangle', 0.09)),
  jingle: g(() => { [72, 74, 76, 79, 76, 79, 84].forEach((n, i) => note(hz(n), 0.28, 'triangle', 0.07, i * 0.13)); })
};
export const Audio_ = { unlock() { try { ctx(); } catch (e) {} }, setOn(v) { on = v; }, get on() { return on; } };
