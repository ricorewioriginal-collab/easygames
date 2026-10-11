// Alle Klänge werden per WebAudio im Browser erzeugt – keine Audio-Dateien.
let ac = null, master = null, musicBus = null, muted = false;
try { muted = localStorage.getItem('anmachaTDMute') === '1'; } catch (e) {}

function ctx() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 1;
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(comp); comp.connect(ac.destination);
    musicBus = ac.createGain(); musicBus.gain.value = 0.55;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800; lp.Q.value = 0.4;
    musicBus.connect(lp); lp.connect(master);
  }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}

export function tone(f, d, type, v, at, f2, bus) {
  if (muted) return;
  try {
    const a = ctx(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + (at || 0);
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v || 0.06, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(bus || master); o.start(t); o.stop(t + d + 0.02);
  } catch (e) {}
}
function noise(d, v, f, at) {
  if (muted) return;
  try {
    const a = ctx(); if (!a) return;
    const n = Math.floor(a.sampleRate * d), buf = a.createBuffer(1, n, a.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = a.createBufferSource(), g = a.createGain(), fl = a.createBiquadFilter(), t = a.currentTime + (at || 0);
    s.buffer = buf; fl.type = 'bandpass'; fl.frequency.value = f || 800; g.gain.value = v || 0.1;
    s.connect(fl); fl.connect(g); g.connect(master); s.start(t);
  } catch (e) {}
}

let lastShot = 0, lastKill = 0;
export const SFX = {
  shot: k => {
    const n = performance.now(); if (n - lastShot < 55) return; lastShot = n;
    if (k === 'sniper') { tone(260, 0.2, 'sawtooth', 0.05, 0, 60); noise(0.12, 0.05, 2400); }
    else if (k === 'bass') tone(120, 0.24, 'sine', 0.11, 0, 42);
    else if (k === 'chain') { tone(1400, 0.1, 'square', 0.025, 0, 300); noise(0.1, 0.04, 3000); }
    else if (k === 'laser') tone(900, 0.16, 'sawtooth', 0.025, 0, 1800);
    else if (k === 'frost') tone(1200, 0.12, 'triangle', 0.04, 0, 700);
    else tone(720, 0.07, 'square', 0.025, 0, 380);
  },
  kill: () => { const n = performance.now(); if (n - lastKill < 50) return; lastKill = n; tone(300 + Math.random() * 200, 0.1, 'triangle', 0.05, 0, 100); },
  boom: () => { tone(90, 0.5, 'sine', 0.16, 0, 30); noise(0.35, 0.12, 400); },
  build: () => { tone(330, 0.08, 'square', 0.04); tone(660, 0.14, 'square', 0.04, 0.07); noise(0.08, 0.05, 1500); },
  up: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, 'triangle', 0.06, i * 0.06)),
  sell: () => tone(500, 0.2, 'triangle', 0.06, 0, 180),
  bad: () => tone(140, 0.15, 'square', 0.05),
  wave: () => { tone(196, 0.5, 'sawtooth', 0.045); tone(294, 0.6, 'sawtooth', 0.045, 0.12); tone(392, 0.7, 'sawtooth', 0.035, 0.24); },
  leak: () => { tone(220, 0.5, 'sawtooth', 0.09, 0, 45); noise(0.3, 0.1, 300); },
  coin: () => { tone(1320, 0.07, 'square', 0.025); tone(1760, 0.12, 'square', 0.025, 0.06); },
  win: () => [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.3, 'sine', 0.09, i * 0.1)),
  lose: () => { tone(300, 0.8, 'sawtooth', 0.08, 0, 45); tone(150, 0.9, 'square', 0.05, 0.15, 32); }
};

// Ruhige, generative Hintergrundmusik (Pad + Arpeggio), wird mit der Wellen-Intensität lebhafter.
const CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];   // Am F C G
const mf = n => 440 * Math.pow(2, (n - 69) / 12);
let mTimer = 0, mNext = 0, mStep = 0, mOn = false, intensity = 0;
function schedule() {
  const a = ac; if (!a || muted || !mOn) return;
  const spb = 60 / 96 / 2;   // Achtel bei 96 BPM
  if (mNext < a.currentTime) mNext = a.currentTime + 0.05;
  while (mNext < a.currentTime + 0.35) {
    const bar = Math.floor(mStep / 8) % 4, st = mStep % 8, ch = CH[bar], t = mNext - a.currentTime;
    if (st === 0) {
      ch.forEach(n => tone(mf(n), spb * 8.5, 'triangle', 0.05, t, 0, musicBus));
      tone(mf(ch[0] - 24), spb * 4, 'sine', 0.16, t, 0, musicBus);
    }
    if (st % 2 === 0 || intensity > 0.5) tone(mf(ch[(st >> 1) % 3] + 12 + (st > 5 ? 12 : 0)), spb * 1.6, 'sine', 0.035, t, 0, musicBus);
    if (intensity > 0.3 && st % 4 === 0) tone(110, 0.18, 'sine', 0.2, t, 40, musicBus);
    if (intensity > 0.6 && st % 2 === 1) noise(0.04, 0.012, 7000, t);
    mNext += spb; mStep++;
  }
}
export const music = {
  start() { if (mOn) return; mOn = true; if (!ctx()) return; clearInterval(mTimer); mTimer = setInterval(schedule, 120); },
  stop() { mOn = false; clearInterval(mTimer); },
  intensity(v) { intensity = v; }
};

export const audio = {
  get muted() { return muted; },
  setMute(m) { muted = m; try { localStorage.setItem('anmachaTDMute', m ? '1' : '0'); } catch (e) {} if (master) master.gain.value = m ? 0 : 1; },
  unlock() { ctx(); if (master) master.gain.value = muted ? 0 : 1; },
  suspend(s) { if (!ac) return; if (s) ac.suspend(); else ac.resume(); }
};
