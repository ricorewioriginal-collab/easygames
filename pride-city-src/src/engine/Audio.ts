/* Klang ohne Audiodateien: Effekte und Musik werden live mit WebAudio erzeugt (spart Download, läuft offline). */

export type Sfx = 'rain' | 'thunder' | 'move' | 'ok' | 'back' | 'coin' | 'win' | 'miss' | 'hit' | 'open' | 'step' | 'cheer'
  | 'door' | 'engine' | 'horn' | 'siren' | 'glass' | 'pour' | 'phone' | 'shower' | 'cook' | 'kiss' | 'giggle' | 'sheets' | 'heart' | 'splash' | 'tram' | 'camera' | 'applause' | 'whoosh' | 'slap' | 'boing' | 'squeak' | 'boom' | 'rotor' | 'crash' | 'skid';

let ctx: AudioContext | null = null;
let master: GainNode, sfxBus: GainNode, musicBus: GainNode;
let musicTimer = 0;
let nextNote = 0;
let step = 0;
let song: Song | null = null;
export const vol = { music: .55, sfx: .8, /** Vibration (Handy und Controller) */ vib: true };

/* Vibration als Rückmeldung: Handy (navigator.vibrate) und Controller (Rumble), kostet nichts im Bild-Takt */
const BUZZ: Partial<Record<Sfx, number[]>> = { coin: [14], win: [30, 50, 70], hit: [28], slap: [32], boing: [22], miss: [70], phone: [90, 70, 90], door: [10], horn: [40], thunder: [120] };
let buzzT = 0;
export function buzz(p: number[]) {
  if (!vol.vib) return;
  const now = performance.now(); if (now - buzzT < 90) return; buzzT = now;
  try { if (matchMedia('(pointer: coarse)').matches) navigator.vibrate?.(p); } catch { /* nicht unterstützt */ }
  try {
    for (const g of navigator.getGamepads?.() || []) {
      const a = (g as Gamepad & { vibrationActuator?: { playEffect?(t: string, o: object): Promise<unknown> } } | null)?.vibrationActuator;
      a?.playEffect?.('dual-rumble', { duration: p.reduce((x, y) => x + y, 0), strongMagnitude: p.length > 1 ? .6 : .25, weakMagnitude: .5 })?.catch?.(() => {});
    }
  } catch { /* kein Controller */ }
}
/** weitere Tonquellen (Autoradio), die dem Musikregler folgen */
export const onVolume: Array<() => void> = [];

export interface Song { bpm: number; chords: number[][]; bass?: boolean; hats?: boolean; kick?: boolean; lead?: number[] }

export const SONGS: Record<string, Song> = {
  title: { bpm: 104, chords: [[57, 61, 64, 68], [54, 57, 61, 64], [50, 54, 57, 61], [52, 56, 59, 64]], bass: true, hats: true, kick: true, lead: [76, 0, 73, 0, 71, 73, 0, 76, 78, 0, 76, 0, 73, 0, 71, 0] },
  city: { bpm: 96, chords: [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]], bass: true, hats: true },
  show: { bpm: 120, chords: [[57, 61, 64, 68], [54, 57, 61, 64], [50, 54, 57, 61], [52, 56, 59, 64]], bass: true, hats: true, kick: true, lead: [76, 0, 76, 78, 0, 80, 0, 76, 0, 73, 0, 76, 78, 0, 0, 0] },
  // Autoradio: Neon 88 (Synthwave) und Hafen Lounge (ruhig, ohne Schlagzeug)
  neon: { bpm: 108, chords: [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]], bass: true, hats: true, kick: true, lead: [69, 72, 76, 72, 69, 72, 76, 79, 77, 76, 72, 69, 67, 69, 72, 0] },
  lounge: { bpm: 84, chords: [[50, 53, 57, 60, 64], [55, 59, 62, 65], [48, 52, 55, 59, 62], [45, 48, 52, 55, 59]], bass: true, lead: [74, 0, 0, 72, 0, 69, 0, 0, 71, 0, 0, 67, 0, 0, 0, 0] },
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
  for (const f of onVolume) f();
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
function noise(t: number, d: number, g: number, bus: GainNode, hp = 6000, lp = 0) {
  if (!ctx) return;
  const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * d), ctx.sampleRate), a = b.getChannelData(0);
  for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1;
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), v = ctx.createGain();
  f.type = lp ? 'bandpass' : 'highpass'; f.frequency.value = lp || hp; s.buffer = b;
  v.gain.setValueAtTime(g, t); v.gain.exponentialRampToValueAtTime(.001, t + d);
  s.connect(f); f.connect(v); v.connect(bus); s.start(t);
}

export function sfx(k: Sfx) {
  const b = BUZZ[k]; if (b) buzz(b);
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
    case 'applause': for (let i = 0; i < 40; i++) noise(t + Math.random() * 1.6, .03, .05 + Math.random() * .05, sfxBus, 0, 1500 + Math.random() * 2500); break;
    case 'door': tone(45, t, .12, 'square', .06, sfxBus, -3); noise(t, .08, .1, sfxBus, 0, 400); tone(40, t + .18, .2, 'sine', .25, sfxBus, -6); noise(t + .18, .1, .12, sfxBus, 0, 250); break;
    case 'engine': for (let i = 0; i < 3; i++) tone(31 + i, t + i * .12, .5, 'sawtooth', .07, sfxBus, 7); break;
    case 'horn': tone(64, t, .35, 'square', .06, sfxBus); tone(68, t, .35, 'square', .05, sfxBus); break;
    case 'rain': noise(t, 1.5, .022, sfxBus, 0, 2600); noise(t + .3, 1.3, .014, sfxBus, 7000); break;
    case 'thunder': noise(t, 2.6, .28, sfxBus, 0, 110); noise(t + .15, 1.8, .16, sfxBus, 0, 70); break;
    case 'siren': for (let i = 0; i < 4; i++) tone(i % 2 ? 76 : 81, t + i * .45, .45, 'triangle', .07, sfxBus); break;
    case 'glass': tone(100, t, .5, 'sine', .08, sfxBus); tone(105, t + .01, .4, 'sine', .05, sfxBus); break;
    case 'pour': noise(t, .9, .06, sfxBus, 0, 900); noise(t + .3, .6, .04, sfxBus, 0, 1400); break;
    case 'phone': tone(88, t, .07, 'sine', .12, sfxBus); tone(93, t + .09, .1, 'sine', .12, sfxBus); break;
    case 'shower': noise(t, 1.6, .05, sfxBus, 0, 5000); noise(t, 1.6, .03, sfxBus, 0, 2500); break;
    case 'cook': for (let i = 0; i < 18; i++) noise(t + i * .07 + Math.random() * .05, .03, .04, sfxBus, 0, 3000 + Math.random() * 2000); break;
    case 'kiss': noise(t, .06, .12, sfxBus, 0, 2200); tone(84, t + .02, .05, 'sine', .05, sfxBus, 5); break;
    case 'giggle': for (let i = 0; i < 4; i++) tone(74 + (i % 2) * 3, t + i * .11, .08, 'sine', .07, sfxBus, -2); break;
    case 'sheets': noise(t, .5, .05, sfxBus, 0, 1200); noise(t + .45, .6, .04, sfxBus, 0, 900); break;
    case 'heart': for (let i = 0; i < 3; i++) { tone(36, t + i * .7, .12, 'sine', .4, sfxBus, -4); tone(35, t + i * .7 + .18, .12, 'sine', .3, sfxBus, -4); } break;
    case 'splash': noise(t, .5, .12, sfxBus, 0, 800); noise(t + .05, .3, .06, sfxBus, 3000); break;
    case 'tram': tone(84, t, .5, 'sine', .08, sfxBus); tone(84, t + .6, .5, 'sine', .08, sfxBus); noise(t, 1.2, .03, sfxBus, 0, 300); break;
    case 'whoosh': noise(t, .16, .09, sfxBus, 0, 900); noise(t + .05, .12, .06, sfxBus, 0, 1800); break;
    case 'slap': noise(t, .05, .32, sfxBus, 0, 2600); noise(t, .09, .16, sfxBus, 0, 900); break;
    case 'boing': tone(52, t, .22, 'sine', .3, sfxBus, 9); tone(64, t + .04, .18, 'triangle', .12, sfxBus, -7); noise(t, .05, .12, sfxBus, 0, 700); break;
    case 'squeak': tone(86, t, .09, 'sine', .16, sfxBus, 7); tone(79, t + .09, .14, 'sine', .14, sfxBus, -9); noise(t, .05, .14, sfxBus, 0, 1200); break;
    case 'boom': noise(t, .9, .2, sfxBus, 0, 160); noise(t + .02, .5, .08, sfxBus, 0, 900); for (let i = 0; i < 10; i++) noise(t + .25 + Math.random() * .7, .03, .03, sfxBus, 4000); break;
    case 'crash': noise(t, .35, .3, sfxBus, 0, 500); noise(t, .2, .14, sfxBus, 3500); tone(33, t, .3, 'square', .1, sfxBus, -8); for (let i = 0; i < 5; i++) noise(t + .08 + Math.random() * .25, .05, .05, sfxBus, 6000); break;
    case 'skid': noise(t, .45, .05, sfxBus, 0, 2900); noise(t + .05, .35, .03, sfxBus, 0, 3600); break;
    case 'rotor': for (let i = 0; i < 8; i++) noise(t + i * .09, .06, .07, sfxBus, 0, 220); break;
    case 'camera': noise(t, .05, .15, sfxBus, 3000); noise(t + .09, .07, .1, sfxBus, 2000); break;
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

/* Stimmen der Nacht (18+, Abblende): Atmen, Seufzen und Stöhnen als echte Stimmlaute aus dem Synthesizer –
   ein Sägezahn mit leichtem Vibrato läuft durch zwei Formant-Filter (Vokal „ah“, „oh“ oder gesummtes „mmh“),
   darüber Atemrauschen. Tiefe und hohe Stimme wechseln sich ab, das Tempo steigt, das Bett knarzt im Takt. */
const VOWEL: Record<'a' | 'o' | 'm', [number, number, number]> = { a: [820, 1250, 2600], o: [520, 900, 2400], m: [260, 900, 2200] };
/** ein Seufzer/Stöhner: f0 Grundton (Hz), d Dauer, g Lautstärke, v Vokal */
export function moan(t: number, f0: number, d: number, g: number, v: 'a' | 'o' | 'm' = 'a') {
  if (!ctx) return;
  const o = ctx.createOscillator(), lfo = ctx.createOscillator(), lg = ctx.createGain(), out = ctx.createGain();
  o.type = 'sawtooth';
  // Tonhöhe: kurz steigen, dann weich fallen (wie ein „Aah…“)
  o.frequency.setValueAtTime(f0 * .92, t); o.frequency.linearRampToValueAtTime(f0 * 1.12, t + d * .25); o.frequency.exponentialRampToValueAtTime(f0 * .78, t + d);
  lfo.frequency.value = 5.2 + Math.random(); lg.gain.value = f0 * .025; lfo.connect(lg); lg.connect(o.frequency);
  const [f1, f2, f3] = VOWEL[v];
  for (const [f, q, k] of [[f1, 6, 1], [f2, 8, v === 'm' ? .15 : .55], [f3, 10, .18]] as Array<[number, number, number]>) {
    const bp = ctx.createBiquadFilter(), bg = ctx.createGain(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q; bg.gain.value = k;
    o.connect(bp); bp.connect(bg); bg.connect(out);
  }
  out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(g, t + d * .3); out.gain.setValueAtTime(g, t + d * .5); out.gain.exponentialRampToValueAtTime(.0005, t + d);
  out.connect(sfxBus);
  o.start(t); lfo.start(t); o.stop(t + d + .05); lfo.stop(t + d + .05);
  breath(t, d * .9, g * .5, v === 'm' ? 900 : 1600);
}
/** hörbares Atmen (gefiltertes Rauschen, an- und abschwellend) */
export function breath(t: number, d: number, g: number, f = 1400) {
  if (!ctx) return;
  const n0 = Math.ceil(ctx.sampleRate * d), b = ctx.createBuffer(1, n0, ctx.sampleRate), a = b.getChannelData(0);
  for (let i = 0; i < n0; i++) a[i] = Math.random() * 2 - 1;
  const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), v = ctx.createGain(); s.buffer = b; fl.type = 'bandpass'; fl.frequency.value = f; fl.Q.value = 1.2;
  v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(g, t + d * .4); v.gain.linearRampToValueAtTime(0, t + d);
  s.connect(fl); fl.connect(v); v.connect(sfxBus); s.start(t);
}
/** Bettgestell knarzt einmal */
function creak(t: number, g: number) {
  if (!ctx) return;
  tone(46 + Math.random() * 2, t, .16, 'sawtooth', g, sfxBus, 2); noise(t, .1, g * .8, sfxBus, 0, 700);
}

/** Angedeutete Nacht hinter der Abblende: Küsse, Atmen, Stöhnen zweier Stimmen mit steigendem Tempo,
    Bett im Takt, Höhepunkt, Ausatmen, Kichern und Herzschlag. dur = Länge in Sekunden; voices = Grundtöne der beiden. */
export function nightSounds(dur = 2.6, voices: [number, number] = [120, 205]) {
  if (!ctx) return;
  const t0 = ctx.currentTime + .05;
  sfx('kiss'); setTimeout(() => sfx('sheets'), 250);
  let t = .45, i = 0;
  while (t < dur - 1.6) {
    const p = t / dur, gap = .95 - .5 * p, hi = i % 2 === 1, f = voices[hi ? 1 : 0] * (1 + p * .18 + Math.random() * .06);
    if (p < .25) breath(t0 + t, .6, .05 + .04 * p);
    else moan(t0 + t, f, .5 + .25 * (1 - p), .06 + .1 * p, p < .5 ? 'm' : i % 3 ? 'a' : 'o');
    if (p > .2) { creak(t0 + t + gap * .5, .025 + .045 * p); if (p > .55) creak(t0 + t + gap * .02, .03 + .04 * p); }
    if (i % 4 === 2) setTimeout(() => sfx('kiss'), t * 1000);
    t += gap; i++;
  }
  const top = Math.max(.8, dur - 1.6);
  moan(t0 + top, voices[0] * 1.25, 1.15, .2, 'a'); moan(t0 + top + .12, voices[1] * 1.2, 1.1, .17, 'o');
  breath(t0 + top + 1.2, 1, .08, 1100);
  setTimeout(() => { sfx('giggle'); sfx('heart'); }, (top + 1.6) * 1000);
}

/** Darkroom-Atmo (18+, nur Andeutung): gedämpfter Bass von nebenan, Flüstern, Seufzen und Atmen als gefilterte
    Rausch-Wellen, ab und zu ein Kichern. Läuft, solange alive() stimmt. */
export function darkAtmo(alive: () => boolean) {
  const tick = () => {
    if (!alive()) return;
    if (ctx) {
      const t = ctx.currentTime;
      tone(33, t, .35, 'sine', .22, sfxBus, -4); tone(33, t + .5, .35, 'sine', .18, sfxBus, -4);
      const r = Math.random();
      if (r < .45) { // tiefes Ausatmen/Seufzen: weich anschwellendes Rauschen um 500–900 Hz
        const d = .7 + Math.random() * .6, f = 500 + Math.random() * 400, n0 = Math.ceil(ctx.sampleRate * d), b = ctx.createBuffer(1, n0, ctx.sampleRate), a = b.getChannelData(0);
        for (let i = 0; i < n0; i++) a[i] = Math.random() * 2 - 1;
        const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), v = ctx.createGain(); s.buffer = b; fl.type = 'bandpass'; fl.frequency.setValueAtTime(f, t + .9); fl.frequency.linearRampToValueAtTime(f * .7, t + .9 + d); fl.Q.value = 4;
        v.gain.setValueAtTime(0, t + .9); v.gain.linearRampToValueAtTime(.09, t + .9 + d * .35); v.gain.linearRampToValueAtTime(0, t + .9 + d);
        s.connect(fl); fl.connect(v); v.connect(sfxBus); s.start(t + .9);
        tone(57 + Math.floor(Math.random() * 5), t + .9, d * .8, 'sine', .018, sfxBus, -3);   // leiser Stimmton darunter
      } else if (r < .6) sfx('giggle');
      else if (r < .72) sfx('kiss');
    }
    setTimeout(tick, 1000 + Math.random() * 700);
  };
  tick();
}

/* ---------- Klavier: Noten aus Klavierlicht abspielen (Melodie + Begleitung), zeitgenau im Voraus geplant ---------- */
function piano(n: number, t: number, d: number, g: number, bus: GainNode) {
  if (!ctx) return;
  const o = ctx.createOscillator(), o2 = ctx.createOscillator(), v = ctx.createGain();
  o.type = 'triangle'; o2.type = 'sine'; o.frequency.value = freq(n); o2.frequency.value = freq(n) * 2.001;
  const len = Math.min(2.5, Math.max(.25, d * 1.4));
  v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(g, t + .006); v.gain.exponentialRampToValueAtTime(g * .35, t + .25); v.gain.exponentialRampToValueAtTime(.0005, t + len);
  o.connect(v); o2.connect(v); v.connect(bus); o.start(t); o2.start(t); o.stop(t + len + .05); o2.stop(t + len + .05);
}
/** Spielt [Zeit, Ton, Dauer] ab `delay` Sekunden; gibt eine Stopp-Funktion zurück */
export function playScore(mel: Array<[number, number, number]>, acc: Array<[number, number, number, number?]>, delay: number) {
  if (!ctx) return () => {};
  const bus = ctx.createGain(); bus.gain.value = vol.music * 1.1; bus.connect(master);
  const t0 = ctx.currentTime + delay;
  for (const [t, p, d] of mel) piano(p, t0 + t, d, .22, bus);
  for (const [t, p, d, v] of acc) piano(p, t0 + t, d, .1 * (v ?? .7), bus);
  return () => { try { bus.gain.setTargetAtTime(0, ctx!.currentTime, .05); setTimeout(() => bus.disconnect(), 300); } catch { /* schon weg */ } };
}
/** aktuelle Zeit der Tonausgabe (0 ohne Ton) */
/** Motor als Dauerton: Drehzahl 0–1 (null = aus). Zwei verstimmte Sägezähne hinter einem Tiefpass, leise unter dem Radio. */
let eng: { o: OscillatorNode; o2: OscillatorNode; f: BiquadFilterNode; g: GainNode } | null = null;
export function engineHum(rpm: number | null) {
  if (!ctx || !sfxBus) return;
  if (rpm === null) { if (eng) { const e = eng; eng = null; e.g.gain.setTargetAtTime(0, ctx.currentTime, .08); setTimeout(() => { try { e.o.stop(); e.o2.stop(); } catch { /* schon aus */ } }, 400); } return; }
  if (!eng) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth'; o2.type = 'square'; f.type = 'lowpass'; f.Q.value = 2; g.gain.value = 0;
    o.connect(f); o2.connect(f); f.connect(g); g.connect(sfxBus); o.start(); o2.start();
    eng = { o, o2, f, g };
  }
  const t = ctx.currentTime, r = Math.max(0, Math.min(1.2, rpm));
  eng.o.frequency.setTargetAtTime(38 + r * 95, t, .08); eng.o2.frequency.setTargetAtTime(19 + r * 47.5, t, .08);
  eng.f.frequency.setTargetAtTime(260 + r * 900, t, .1); eng.g.gain.setTargetAtTime(.022 + r * .03, t, .1);
}
export function now() { return ctx ? ctx.currentTime : 0; }
