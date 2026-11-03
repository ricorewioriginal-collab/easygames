// Leuchtfeuer – Klänge und leise Musik, komplett im Browser erzeugt (WebAudio)
let AC = null, master = null, amb = null, mus = null, opt = { sfx: true, music: true }, unlocked = false;
const want = { amb: null, mood: null };
// Erst nach der ersten Berührung/Taste starten (Browser-Regel für Ton)
export function unlock() { if (unlocked) return; unlocked = true; ac(); if (want.mood) music(want.mood); if (want.amb) ambient(want.amb); }
export function setOpt(o) { opt = o; if (mus) mus.g.gain.value = o.music ? 0.06 : 0; if (amb) amb.g.gain.value = o.sfx ? amb.v : 0; }
export function ac() {
  if (!unlocked) return null;
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = 0.9; master.connect(AC.destination); } catch (e) { return null; } }
  if (AC.state === 'suspended') AC.resume(); return AC;
}
export function suspend(on) { if (!AC) return; on ? AC.suspend() : AC.resume(); }
function tone(f, d, type = 'sine', v = 0.12, when = 0, slide) {
  const a = ac(); if (!a) return; const t = when || a.currentTime, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g).connect(master); o.start(t); o.stop(t + d + 0.05);
}
let nbuf = null;
function noiseBuf() { const a = ac(); if (nbuf) return nbuf; nbuf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate); const c = nbuf.getChannelData(0); for (let i = 0; i < c.length; i++) c[i] = Math.random() * 2 - 1; return nbuf; }
function noise(d, v, f, type = 'bandpass', when = 0, q = 1) {
  const a = ac(); if (!a) return; const t = when || a.currentTime, n = a.createBufferSource(); n.buffer = noiseBuf(); const fl = a.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
  const g = a.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d); n.connect(fl).connect(g).connect(master); n.start(t); n.stop(t + d + 0.05);
}
export function sfx(name) {
  if (!opt.sfx) return; const a = ac(); if (!a) return; const t = a.currentTime;
  switch (name) {
    case 'tick': tone(880, 0.05, 'sine', 0.05); break;
    case 'next': tone(660, 0.05, 'sine', 0.04); break;
    case 'choice': tone(523, 0.14, 'triangle', 0.08); tone(784, 0.22, 'triangle', 0.07, t + 0.09); break;
    case 'bottle': tone(1046, 0.1, 'sine', 0.08); tone(1318, 0.12, 'sine', 0.07, t + 0.08); tone(1568, 0.25, 'sine', 0.06, t + 0.16); break;
    case 'horn': tone(110, 0.9, 'sawtooth', 0.05); tone(165, 0.9, 'sawtooth', 0.03); break;
    case 'sink': tone(330, 0.3, 'sine', 0.05, 0, 160); break;
    case 'flash': noise(0.5, 0.08, 3000, 'highpass'); tone(1200, 0.4, 'sine', 0.05, 0, 2400); break;
    case 'swap': noise(0.12, 0.06, 1800); tone(700, 0.08, 'triangle', 0.05); break;
    case 'win': [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.35, 'triangle', 0.08, t + i * 0.11)); break;
    case 'bell': tone(1568, 0.5, 'sine', 0.05); tone(2093, 0.4, 'sine', 0.03, t + 0.02); break;
    case 'coin': tone(988, 0.08, 'square', 0.04); tone(1318, 0.2, 'square', 0.04, t + 0.07); break;
    case 'wrong': tone(220, 0.25, 'sawtooth', 0.05, 0, 160); break;
    case 'light': tone(1318 + Math.random() * 200, 0.12, 'sine', 0.06); break;
    case 'jump': tone(300, 0.18, 'sine', 0.05, 0, 600); break;
    case 'hit': noise(0.3, 0.15, 400, 'lowpass'); tone(120, 0.25, 'sine', 0.1, 0, 60); break;
    case 'wind': noise(1.4, 0.12, 600, 'bandpass', 0, 0.6); break;
    case 'step': noise(0.06, 0.03, 900); break;
    case 'page': noise(0.25, 0.05, 4000, 'highpass'); break;
    case 'clue': tone(784, 0.1, 'triangle', 0.07); tone(1175, 0.25, 'triangle', 0.06, t + 0.1); break;
  }
}
// Umgebungsgeräusch: Meer, Wind, Regen, Halle, Feuer
export function ambient(kind) {
  want.amb = kind; const a = ac(); if (!a) return; if (amb && amb.kind === kind) return;
  if (amb) { const o = amb; o.g.gain.setTargetAtTime(0, a.currentTime, 0.4); setTimeout(() => { try { o.src.stop(); } catch (e) { } }, 1500); amb = null; }
  if (!kind) return;
  const src = a.createBufferSource(); src.buffer = noiseBuf(); src.loop = true;
  const f = a.createBiquadFilter(), lfo = a.createOscillator(), lg = a.createGain(), g = a.createGain();
  const P = { meer: ['lowpass', 500, 0.07, 0.12, 120], wind: ['bandpass', 700, 0.05, 0.2, 300], regen: ['highpass', 2500, 0.05, 0.4, 400], sturm: ['bandpass', 500, 0.1, 0.25, 350], halle: ['lowpass', 300, 0.03, 0.3, 80], feuer: ['highpass', 1800, 0.025, 2.4, 600], innen: ['lowpass', 180, 0.015, 0.1, 30] }[kind] || ['lowpass', 400, 0.04, 0.1, 100];
  f.type = P[0]; f.frequency.value = P[1]; lfo.frequency.value = P[3]; lg.gain.value = P[4]; lfo.connect(lg).connect(f.frequency);
  const v = P[2]; g.gain.value = 0; g.gain.setTargetAtTime(opt.sfx ? v : 0, a.currentTime, 0.8);
  src.connect(f).connect(g).connect(master); src.start(); lfo.start(); amb = { kind, src, g, v };
}
// Leise Musik: Klavierähnliche Arpeggien über vier Akkorden (je Stimmung)
const MOODS = { ruhig: [[57, 60, 64, 69], [53, 57, 60, 65], [60, 64, 67, 72], [55, 59, 62, 67]], nacht: [[50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 63], [45, 52, 57, 60]], hell: [[60, 64, 67, 72], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67]], spiel: [[62, 66, 69, 74], [59, 62, 66, 71], [55, 59, 62, 67], [57, 61, 64, 69]] };
export function music(mood) {
  want.mood = mood; const a = ac(); if (!a) return;
  if (!mus) { const g = a.createGain(); g.gain.value = opt.music ? 0.06 : 0; const d = a.createDelay(); d.delayTime.value = 0.33; const fb = a.createGain(); fb.gain.value = 0.3; g.connect(master); g.connect(d); d.connect(fb).connect(d); d.connect(master); mus = { g, mood: null, next: 0, step: 0, timer: null };
    mus.timer = setInterval(() => pump(), 120); }
  mus.mood = mood;
}
function pump() {
  if (!AC || !mus || !mus.mood || AC.state !== 'running') return; const a = AC;
  const ch = MOODS[mus.mood] || MOODS.ruhig, spb = mus.mood === 'spiel' ? 0.24 : 0.36;
  if (mus.next < a.currentTime) mus.next = a.currentTime + 0.05;
  while (mus.next < a.currentTime + 0.4) {
    const s = mus.step, c = ch[Math.floor(s / 8) % 4], n = c[[0, 1, 2, 3, 2, 1, 2, 3][s % 8]], f = 440 * Math.pow(2, (n - 69) / 12), t = mus.next;
    const o = a.createOscillator(), o2 = a.createOscillator(), g = a.createGain(); o.type = 'triangle'; o2.type = 'sine'; o.frequency.value = f; o2.frequency.value = f * 2;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    o.connect(g); o2.connect(g); g.connect(mus.g); o.start(t); o2.start(t); o.stop(t + 1.5); o2.stop(t + 1.5);
    if (s % 8 === 0) { const b = a.createOscillator(), bg = a.createGain(); b.type = 'sine'; b.frequency.value = 440 * Math.pow(2, (c[0] - 12 - 69) / 12); bg.gain.setValueAtTime(0.0001, t); bg.gain.exponentialRampToValueAtTime(0.6, t + 0.05); bg.gain.exponentialRampToValueAtTime(0.0001, t + spb * 8); b.connect(bg).connect(mus.g); b.start(t); b.stop(t + spb * 8 + 0.1); }
    mus.step++; mus.next += spb;
  }
}
