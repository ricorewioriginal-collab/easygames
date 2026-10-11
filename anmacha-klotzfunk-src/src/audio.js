// Kleine Geräusche, im Browser erzeugt (kein Asset-Download).
let ctx = null, buf = null;
// enabled = Ton an/aus, vol = Effekte, music = Radio-Musik (je 0..1). Es gibt genau einen AudioContext.
export const sfx = { enabled: true, vol: 0.8, music: 0.8, amb: 0.7 }; // amb = Umgebung (Schritte, Wasser, Tiere)

export function unlockAudio() {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  } catch (e) { ctx = null; }
}

const ready = v => !!ctx && sfx.enabled && ctx.state === 'running' && v > 0.001;
function burst(freq, dur, vol, type = 'lowpass', amb = false) {
  vol *= amb ? sfx.amb : sfx.vol;
  if (!ready(vol)) return;
  if (!buf) {
    buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.25), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), t = ctx.currentTime;
  src.buffer = buf; f.type = type; f.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(f); f.connect(g); g.connect(ctx.destination);
  src.start(t); src.stop(t + dur + 0.02);
}
export const playBreak = () => burst(1100, 0.14, 0.5);
export const playPlace = () => burst(600, 0.09, 0.4);
export const playDeny = () => burst(220, 0.1, 0.3);

// Ton mit Tonhöhen-Verlauf (f0 → f1), optional Vibrato; amb = Umgebungs-Lautstärke
function voice(type, f0, f1, dur, vol, amb, vib = 0, delay = 0) {
  vol *= amb ? sfx.amb : sfx.vol;
  if (!ready(vol)) return;
  const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  if (vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = vib; lg.gain.value = f0 * 0.04; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 0.02); }
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.04, dur / 4)); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
}

// Schritte je Material: weich (Erde, Gras), Stein, Holz, Sand/Kies, Schnee, Glas
const STEP = {
  weich: () => burst(380, 0.08, 0.22, 'lowpass', true),
  stein: () => { burst(2400, 0.05, 0.16, 'bandpass', true); burst(500, 0.04, 0.12, 'lowpass', true); },
  holz: () => { voice('triangle', 190, 120, 0.07, 0.16, true); burst(900, 0.04, 0.08, 'bandpass', true); },
  sand: () => burst(3200, 0.11, 0.12, 'highpass', true),
  schnee: () => { burst(1600, 0.12, 0.16, 'bandpass', true); burst(300, 0.08, 0.1, 'lowpass', true); },
  glas: () => voice('sine', 2200, 1900, 0.06, 0.07, true)
};
export const playStep = kind => (STEP[kind] || STEP.weich)();
export const playSplash = big => { burst(1400, big ? 0.45 : 0.18, big ? 0.35 : 0.14, 'bandpass', true); if (big) burst(400, 0.3, 0.2, 'lowpass', true); };

// Tiere und Gegner (leiser mit Abstand d in Blöcken)
const CALL = {
  huhn: v => { voice('square', 1200, 1500, 0.06, v * 0.08, true); voice('square', 1300, 1000, 0.07, v * 0.08, true, 0, 0.09); },
  schaf: v => voice('sawtooth', 330, 300, 0.5, v * 0.1, true, 7),
  kuh: v => voice('sawtooth', 140, 105, 0.9, v * 0.16, true, 3),
  rauschling: v => { burst(5000, 0.5, v * 0.18, 'bandpass', true); voice('sawtooth', 90, 70, 0.4, v * 0.08, true, 11); },
  hoehlenwesen: v => voice('square', 70, 50, 0.35, v * 0.14, true, 18),
  drohne: v => voice('sawtooth', 210, 230, 0.6, v * 0.06, true, 30),
  dorfbewohner: v => { voice('triangle', 240, 300, 0.12, v * 0.12, true); voice('triangle', 280, 220, 0.15, v * 0.12, true, 0, 0.14); }
};
export function playCall(key, d) { const v = Math.max(0, 1 - d / 20); if (v > 0 && CALL[key]) CALL[key](v); }

// Technik und Story
export const playClick = () => voice('square', 1800, 900, 0.04, 0.12, false);
export const playClank = () => { burst(700, 0.25, 0.3, 'bandpass'); voice('square', 160, 110, 0.18, 0.1, false); };
export const playBeep = () => voice('sine', 880, 880, 0.12, 0.12, false);
export const playJingle = () => [0, 4, 7, 12].forEach((n, i) => voice('triangle', 523 * Math.pow(2, n / 12), 523 * Math.pow(2, n / 12), 0.22, 0.14, false, 0, i * 0.11));
export const playHurt = () => { voice('sawtooth', 300, 120, 0.18, 0.16, false); burst(800, 0.1, 0.2); };

// ---------- Radio-Block: kleiner Beat-Generator (Kick, Hi-Hat, Clap, Bass, Arpeggio) ----------
const radio = { on: false, timer: 0, next: 0, step: 0, master: null, seed: 0, vol: 0 };
const SCALES = [[0, 3, 5, 7, 10], [0, 2, 4, 7, 9], [0, 2, 3, 7, 8]];
const mtof = n => 440 * Math.pow(2, (n - 69) / 12);

function tone(type, freq, t, dur, vol, cutoff) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  let node = o;
  if (cutoff) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cutoff; o.connect(f); node = f; }
  node.connect(g); g.connect(radio.master); o.start(t); o.stop(t + dur + 0.02);
}
function noiseHit(t, dur, vol, type, freq) {
  if (!buf) { buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.25), ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = buf; f.type = type; f.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f); f.connect(g); g.connect(radio.master); s.start(t); s.stop(t + dur + 0.02);
}
function radioStep(step, t) {
  const sc = SCALES[radio.seed % 3], root = 45 + (radio.seed >> 2) % 5, s16 = step % 16, bar = Math.floor(step / 16) % 4;
  if (s16 % 4 === 0) { // Kick
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
    g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.connect(g); g.connect(radio.master); o.start(t); o.stop(t + 0.22);
  }
  if (s16 === 4 || s16 === 12) noiseHit(t, 0.12, 0.35, 'bandpass', 1800);       // Clap
  if (s16 % 2 === 0) noiseHit(t, 0.04, s16 % 4 === 2 ? 0.22 : 0.1, 'highpass', 7000); // Hi-Hat
  if (s16 % 4 === 2 || s16 === 7 || s16 === 15) tone('sawtooth', mtof(root + sc[(bar + (s16 >> 2)) % 5] - 12), t, 0.2, 0.2, 500); // Bass
  const idx = (step * 3 + radio.seed + bar * 2) % 5;
  if (s16 % 2 === 1 || s16 % 4 === 0) tone('triangle', mtof(root + 24 + sc[idx] + (s16 > 8 ? 12 : 0)), t, 0.16, 0.12, 3000); // Arpeggio
}
function scheduler() {
  if (!ctx || ctx.state !== 'running') return;
  const bpm = 118 + (radio.seed % 3) * 6, dur = 60 / bpm / 4;
  if (radio.next < ctx.currentTime) radio.next = ctx.currentTime + 0.05;
  while (radio.next < ctx.currentTime + 0.25) { radioStep(radio.step++, radio.next); radio.next += dur; }
}
// vol 0..1 (Nähe zum Radio-Block), seed = Variante je Block; vol 0 stoppt die Musik
export function setRadio(vol, seed) {
  vol *= sfx.music;
  if (!ctx || !sfx.enabled || vol <= 0.01) {
    if (radio.on) { radio.on = false; clearInterval(radio.timer); if (radio.master) radio.master.gain.setTargetAtTime(0, ctx.currentTime, 0.1); }
    return;
  }
  if (!radio.master) { radio.master = ctx.createGain(); radio.master.gain.value = 0; radio.master.connect(ctx.destination); }
  if (!radio.on) { radio.on = true; radio.seed = seed; radio.next = 0; radio.timer = setInterval(scheduler, 80); }
  radio.master.gain.setTargetAtTime(Math.min(1, vol) * 0.45, ctx.currentTime, 0.15);
}
