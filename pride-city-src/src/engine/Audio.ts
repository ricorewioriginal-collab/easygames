/* Klang ohne Audiodateien: Effekte und Musik werden live mit WebAudio erzeugt (spart Download, läuft offline). */

type Sfx = 'move' | 'ok' | 'back' | 'coin' | 'win' | 'miss' | 'hit' | 'open' | 'step' | 'cheer';

let ctx: AudioContext | null = null;
let master: GainNode, sfxBus: GainNode, musicBus: GainNode;
let musicTimer = 0;
let nextNote = 0;
let step = 0;
let song: Song | null = null;
export const vol = { music: .55, sfx: .8 };

export interface Song { bpm: number; chords: number[][]; bass?: boolean; hats?: boolean; kick?: boolean; lead?: number[] }

export const SONGS: Record<string, Song> = {
  title: { bpm: 104, chords: [[57, 61, 64, 68], [54, 57, 61, 64], [50, 54, 57, 61], [52, 56, 59, 64]], bass: true, hats: true, kick: true, lead: [76, 0, 73, 0, 71, 73, 0, 76, 78, 0, 76, 0, 73, 0, 71, 0] },
  city: { bpm: 96, chords: [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]], bass: true, hats: true },
  club: { bpm: 124, chords: [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]], bass: true, hats: true, kick: true, lead: [81, 0, 79, 81, 0, 76, 0, 79, 0, 81, 0, 84, 81, 0, 79, 0] },
};

export function unlock() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain(); master.connect(ctx.destination);
  sfxBus = ctx.createGain(); sfxBus.connect(master);
  musicBus = ctx.createGain(); musicBus.connect(master);
  applyVolume();
  if (song) startLoop();
}

export function applyVolume() {
  if (!ctx) return;
  sfxBus.gain.value = vol.sfx;
  musicBus.gain.value = vol.music * .32;
}

const freq = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

function tone(n: number, t: number, d: number, type: OscillatorType, g: number, bus: GainNode, slide = 0) {
  if (!ctx) return;
  const o = ctx.createOscillator(), v = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq(n), t);
  if (slide) o.frequency.exponentialRampToValueAtTime(freq(n + slide), t + d);
  v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(g, t + .01); v.gain.exponentialRampToValueAtTime(.0008, t + d);
  o.connect(v); v.connect(bus); o.start(t); o.stop(t + d + .05);
}
function noise(t: number, d: number, g: number, bus: GainNode, hp = 6000) {
  if (!ctx) return;
  const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * d), ctx.sampleRate), a = b.getChannelData(0);
  for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1;
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), v = ctx.createGain();
  f.type = 'highpass'; f.frequency.value = hp; s.buffer = b;
  v.gain.setValueAtTime(g, t); v.gain.exponentialRampToValueAtTime(.001, t + d);
  s.connect(f); f.connect(v); v.connect(bus); s.start(t);
}

export function sfx(k: Sfx) {
  if (!ctx) return;
  const t = ctx.currentTime;
  switch (k) {
    case 'move': tone(84, t, .05, 'triangle', .12, sfxBus); break;
    case 'ok': tone(76, t, .08, 'triangle', .2, sfxBus); tone(83, t + .06, .12, 'triangle', .18, sfxBus); break;
    case 'back': tone(72, t, .1, 'triangle', .16, sfxBus, -5); break;
    case 'open': tone(67, t, .12, 'sine', .2, sfxBus, 12); break;
    case 'coin': tone(88, t, .07, 'square', .08, sfxBus); tone(95, t + .07, .2, 'square', .08, sfxBus); break;
    case 'win': [72, 76, 79, 84].forEach((n, i) => tone(n, t + i * .09, .3, 'triangle', .18, sfxBus)); break;
    case 'miss': tone(50, t, .18, 'sawtooth', .08, sfxBus, -4); break;
    case 'hit': tone(91, t, .06, 'square', .07, sfxBus); noise(t, .05, .08, sfxBus, 8000); break;
    case 'step': noise(t, .04, .03, sfxBus, 1800); break;
    case 'cheer': for (let i = 0; i < 6; i++) noise(t + i * .05, .25, .05, sfxBus, 1200 + i * 300); break;
  }
}

/* ---------- Musik: kleiner Sequenzer, plant immer 0,2 s voraus ---------- */
export function music(name: keyof typeof SONGS | null) {
  const s = name ? SONGS[name] : null;
  if (s === song) return;
  song = s; step = 0;
  if (ctx) { clearInterval(musicTimer); if (song) startLoop(); }
}
function startLoop() {
  if (!ctx) return;
  nextNote = ctx.currentTime + .05;
  clearInterval(musicTimer);
  musicTimer = window.setInterval(schedule, 50);
}
function schedule() {
  if (!ctx || !song) return;
  const s16 = 60 / song.bpm / 4;
  while (nextNote < ctx.currentTime + .2) {
    const bar = Math.floor(step / 16) % song.chords.length, i = step % 16, ch = song.chords[bar], t = nextNote;
    if (i === 0 || i === 8) ch.forEach((n) => tone(n, t, s16 * 7.5, 'sawtooth', .025, musicBus));
    if (i % 4 === 2) ch.forEach((n) => tone(n + 12, t, s16 * 1.2, 'triangle', .02, musicBus));
    if (song.bass && i % 2 === 0) tone(ch[0] - 24 + (i % 8 === 6 ? 12 : 0), t, s16 * 1.6, 'triangle', .16, musicBus);
    if (song.kick && i % 4 === 0) tone(40, t, .18, 'sine', .5, musicBus, -16);
    if (song.hats && i % 2 === 1) noise(t, .04, .06, musicBus, 7000);
    if (song.kick && (i === 4 || i === 12)) noise(t, .12, .1, musicBus, 1500);
    if (song.lead && song.lead[i]) tone(song.lead[i], t, s16 * 1.8, 'square', .03, musicBus);
    nextNote += s16; step++;
  }
}
/** Aktueller Takt in Schlägen (für Rhythmus-Minispiele), null ohne Ton */
export function beatClock(): { t: number; bpm: number } | null {
  if (!ctx || !song) return null;
  return { t: ctx.currentTime, bpm: song.bpm };
}
