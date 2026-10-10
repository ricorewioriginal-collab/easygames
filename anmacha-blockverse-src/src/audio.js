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
