// 🐾 Taschi-Rufe: Jede Art hat einen eigenen, prozedural erzeugten Ruf aus
// Silbenlauten (WebAudio, keine Dateien). Der Ruf ergibt sich fest aus Art-ID,
// Name (Vokale → Silben), Größe (Tonlage), Typ (Klangfarbe) und Tempo-Wert.
// Gleiche Art klingt immer gleich, verschiedene Arten verschieden.

function hash(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const FORMANT = { a: 850, e: 560, i: 330, o: 480, u: 360, ä: 620, ö: 500, ü: 340, y: 340 };
const TYPE = {
  normal: { wave: 'triangle', vib: [6, 0.02] }, feuer: { wave: 'sawtooth', vib: [9, 0.03], noise: 1600 },
  wasser: { wave: 'sine', vib: [7, 0.05] }, pflanze: { wave: 'triangle', vib: [5, 0.02] },
  elektro: { wave: 'square', vib: [24, 0.04] }, gestein: { wave: 'sawtooth', vib: [4, 0.01], noise: 380, low: 0.7 },
  flug: { wave: 'triangle', vib: [11, 0.035] }, geist: { wave: 'sine', vib: [3.5, 0.09] },
  eis: { wave: 'sine', vib: [13, 0.02], bright: 1.5 }, erde: { wave: 'sawtooth', vib: [5, 0.015], noise: 300, low: 0.8 }
};
const SHAPES = ['rise', 'fall', 'arc', 'dip', 'hold'];

// Ruf-Bauplan (rein rechnerisch, testbar ohne Audio)
export function cryFor(id, sp = {}) {
  const h = hash(id), name = String(sp.name || id).toLowerCase();
  const T = TYPE[sp.type] || TYPE.normal, size = sp.look?.size || sp.size || 1;
  const vowels = [...name].filter(c => FORMANT[c]);
  const n = clamp(vowels.length || 2, 2, 4);
  const base = clamp(560 / Math.pow(size, 0.9) * (T.low || 1) * Math.pow(2, ((h % 9) - 4) / 12), 90, 1100);
  const pace = clamp(1.25 - (sp.speed || 60) / 200, 0.7, 1.15);
  const syl = [];
  for (let i = 0; i < n; i++) {
    const hv = h >>> (i * 5);
    const v = vowels[i % Math.max(1, vowels.length)] || 'a';
    syl.push({
      f: base * Math.pow(2, ((hv % 7) - 3 + (i === n - 1 ? ((h >>> 3) & 1 ? 3 : -2) : 0)) / 12),
      formant: FORMANT[v] * (T.bright || 1) * clamp(1.2 / size, 0.7, 1.6),
      dur: (0.09 + ((hv >>> 3) % 6) * 0.02) * pace * (i === n - 1 ? 1.6 : 1),
      shape: SHAPES[(hv >>> 6) % SHAPES.length],
      gap: 0.02 + ((hv >>> 9) % 3) * 0.02
    });
  }
  return { wave: T.wave, vib: T.vib, noise: T.noise || 0, syl };
}

// Abspielen über die vorhandene Audio-Engine. faint: tiefer, langsamer, fallend.
export function playCry(audio, id, sp, { faint = false, when = 0, vol = 0.12 } = {}) {
  const c = audio?.ctx; if (!c || !audio.sfxBus) return 0;
  const cry = cryFor(id, sp), k = faint ? 0.72 : 1, slow = faint ? 1.6 : 1;
  let t = c.currentTime + 0.02 + when;
  const start = t;
  if (cry.noise && !faint) {
    const s = c.createBufferSource(); s.buffer = audio.noiseBuf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = cry.noise;
    const g = c.createGain(); g.gain.setValueAtTime(vol * 0.8, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    s.connect(f); f.connect(g); g.connect(audio.sfxBus); s.start(t, Math.random()); s.stop(t + 0.15);
  }
  for (const s of cry.syl) {
    const d = s.dur * slow, f0 = s.f * k;
    const o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(), l = c.createOscillator(), lg = c.createGain();
    o.type = cry.wave;
    const [a, b] = faint ? [1, 0.6] : { rise: [0.85, 1.25], fall: [1.2, 0.8], arc: [0.9, 0.95], dip: [1.1, 1.05], hold: [1, 1] }[s.shape];
    o.frequency.setValueAtTime(f0 * a, t);
    if (s.shape === 'arc' && !faint) { o.frequency.exponentialRampToValueAtTime(f0 * 1.3, t + d * 0.45); o.frequency.exponentialRampToValueAtTime(f0 * b, t + d); }
    else if (s.shape === 'dip' && !faint) { o.frequency.exponentialRampToValueAtTime(f0 * 0.78, t + d * 0.5); o.frequency.exponentialRampToValueAtTime(f0 * b, t + d); }
    else o.frequency.exponentialRampToValueAtTime(f0 * b, t + d);
    l.frequency.value = cry.vib[0]; lg.gain.value = f0 * cry.vib[1]; l.connect(lg); lg.connect(o.frequency);
    f.type = 'bandpass'; f.frequency.value = s.formant; f.Q.value = 1.6;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol * (cry.wave === 'sine' ? 2.2 : cry.wave === 'triangle' ? 1.6 : 1), t + 0.015);
    g.gain.setValueAtTime(vol * 0.8, t + d * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(f); f.connect(g); g.connect(audio.sfxBus);
    o.start(t); l.start(t); o.stop(t + d + 0.02); l.stop(t + d + 0.02);
    t += d + s.gap * slow;
  }
  return t - start;
}
