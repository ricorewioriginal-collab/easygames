// Kleine Geräusche, im Browser erzeugt (kein Asset-Download).
let ctx = null, buf = null;
export const sfx = { enabled: true };

export function unlockAudio() {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  } catch (e) { ctx = null; }
}

function burst(freq, dur, vol) {
  if (!ctx || !sfx.enabled || ctx.state !== 'running') return;
  if (!buf) {
    buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.25), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), t = ctx.currentTime;
  src.buffer = buf; f.type = 'lowpass'; f.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(f); f.connect(g); g.connect(ctx.destination);
  src.start(t); src.stop(t + dur + 0.02);
}
export const playBreak = () => burst(1100, 0.14, 0.5);
export const playPlace = () => burst(600, 0.09, 0.4);
export const playDeny = () => burst(220, 0.1, 0.3);

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
function playStep(step, t) {
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
  while (radio.next < ctx.currentTime + 0.25) { playStep(radio.step++, radio.next); radio.next += dur; }
}
// vol 0..1 (Nähe zum Radio-Block), seed = Variante je Block; vol 0 stoppt die Musik
export function setRadio(vol, seed) {
  if (!ctx || !sfx.enabled || vol <= 0.01) {
    if (radio.on) { radio.on = false; clearInterval(radio.timer); if (radio.master) radio.master.gain.setTargetAtTime(0, ctx.currentTime, 0.1); }
    return;
  }
  if (!radio.master) { radio.master = ctx.createGain(); radio.master.gain.value = 0; radio.master.connect(ctx.destination); }
  if (!radio.on) { radio.on = true; radio.seed = seed; radio.next = 0; radio.timer = setInterval(scheduler, 80); }
  radio.master.gain.setTargetAtTime(Math.min(1, vol) * 0.45, ctx.currentTime, 0.15);
}
