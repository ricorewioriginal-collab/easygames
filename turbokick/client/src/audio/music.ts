// Reine, testbare Notenerzeugung für die Hintergrundmusik von TURBOKICK (Synthwave/Electro). Kein Web Audio, kein DOM – nur Daten.
// Pro Thema und Taktnummer entsteht deterministisch eine Liste von Notenereignissen.
import { Rng, hashString } from '@shared/rng';

export type MusicTheme = 'menu' | 'match' | 'overtime' | 'victory' | 'defeat';

export const MUSIC_THEMES: readonly MusicTheme[] = ['menu', 'match', 'overtime', 'victory', 'defeat'];

export type MusicVoice = 'bass' | 'lead' | 'arp' | 'pad' | 'kick' | 'snare' | 'hat' | 'perc';

export type Timbre =
  | 'sine'
  | 'triangle'
  | 'square'
  | 'saw'
  | 'pulse'
  | 'bell'
  | 'marimba'
  | 'organ'
  | 'brass'
  | 'pluck'
  | 'super';

/** Ein Notenereignis. `time` und `dur` in Vierteln (Beats), `time` relativ zum Taktanfang. */
export interface NoteEvent {
  time: number;
  dur: number;
  /** MIDI-Notennummer; bei Schlagwerk nur eine Variante/Tonhöhe */
  midi: number;
  voice: MusicVoice;
  /** Lautstärke 0..1 */
  vel: number;
}

export const MIDI_MIN = 24;
export const MIDI_MAX = 108;

export function mtof(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Faltet eine Note per Oktaven in den erlaubten Bereich (NaN-sicher). */
export function foldMidi(m: number): number {
  if (!Number.isFinite(m)) return 60;
  let x = Math.round(m);
  while (x < MIDI_MIN) x += 12;
  while (x > MIDI_MAX) x -= 12;
  return x;
}

// ---- Tonleitern (Halbtöne ab Grundton) ----
export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
  pentaMajor: [0, 2, 4, 7, 9],
  pentaMinor: [0, 3, 5, 7, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
} as const satisfies Record<string, readonly number[]>;

function mod(a: number, n: number): number {
  return ((a % n) + n) % n;
}

/** MIDI-Note für eine (beliebig große/negative) Stufe einer Tonleiter. */
export function scaleMidi(root: number, scale: readonly number[], degree: number): number {
  const len = scale.length;
  return root + 12 * Math.floor(degree / len) + (scale[mod(degree, len)] as number);
}

export interface LeadSpec {
  /** 'x' = mögliche Note, '.' = Pause */
  pattern: string;
  /** Wahrscheinlichkeit, dass eine mögliche Position wirklich erklingt */
  density: number;
  /** Stufenbereich relativ zum Akkordgrundton */
  lo: number;
  hi: number;
  /** Wahrscheinlichkeit für einen chromatischen Ausreißer (+1 Halbton) */
  chroma: number;
}

export interface ThemeSpec {
  bpm: number;
  /** Viertel pro Takt (Dreivierteltakt 3, 7/8-Takt 3,5) */
  beats: number;
  /** Rasterschritte pro Takt (alle Patterns haben diese Länge) */
  steps: number;
  /** Grundton, MIDI (Oktave 4) */
  root: number;
  scale: readonly number[];
  /** Akkordgrundstufen pro Takt, zyklisch */
  prog: readonly number[];
  seventh: boolean;
  /** Länge des Loops in Takten; bei loop=false Gesamtlänge */
  bars: number;
  loop: boolean;
  /** Verzögerung ungerader Schritte (Bruchteil eines Schritts) */
  swing: number;
  /** Ziffern = Akkordton-Index (0 Grundton, 1 Terz, 2 Quinte, 3 Septime/Oktave ...), '.' = Pause */
  bass: string;
  arp: string;
  /** Stellen, an denen der ganze Akkord kurz angeschlagen wird ('x') */
  chordHits: string;
  /** Lautstärke des liegenden Akkords über den ganzen Takt (0 = aus) */
  padVel: number;
  lead: LeadSpec | null;
  /** Schlagwerk: 'x' = laut, 'o' = leise, '.' = Pause */
  kick: string;
  snare: string;
  hat: string;
  perc: string;
  percNote: number;
  timbre: { bass: Timbre; lead: Timbre; arp: Timbre; pad: Timbre };
}

const REST_16 = '................';

export const THEMES: Record<MusicTheme, ThemeSpec> = {
  // Menü: ruhiger Synthwave in a-Moll, Arpeggio + breites Pad, ~100 BPM
  menu: {
    bpm: 100,
    beats: 4,
    steps: 16,
    root: 57,
    scale: SCALES.minor,
    prog: [0, 5, 2, 6],
    seventh: false,
    bars: 8,
    loop: true,
    swing: 0,
    bass: '0.......0.....2.',
    arp: '0120210301202103',
    chordHits: REST_16,
    padVel: 0.3,
    lead: { pattern: 'x.......x.x.....', density: 0.6, lo: 0, hi: 6, chroma: 0 },
    kick: 'x.......x.......',
    snare: REST_16,
    hat: '..o...o...o...o.',
    perc: REST_16,
    percNote: 72,
    timbre: { bass: 'saw', lead: 'bell', arp: 'pluck', pad: 'super' },
  },
  // Spiel: treibender Electro, Offbeat-Bass, Four-on-the-floor, ~124 BPM
  match: {
    bpm: 124,
    beats: 4,
    steps: 16,
    root: 57,
    scale: SCALES.minor,
    prog: [0, 5, 2, 6],
    seventh: false,
    bars: 8,
    loop: true,
    swing: 0,
    bass: '.0.0.0.0.0.0.0.0',
    arp: '0.1.2.1.0.1.2.3.',
    chordHits: '......x.......x.',
    padVel: 0.2,
    lead: { pattern: 'x..x..x.x..x.x..', density: 0.55, lo: 0, hi: 6, chroma: 0 },
    kick: 'x...x...x...x...',
    snare: '....x.......x...',
    hat: 'o.x.o.x.o.x.o.x.',
    perc: '..............o.',
    percNote: 76,
    timbre: { bass: 'saw', lead: 'pulse', arp: 'pluck', pad: 'super' },
  },
  // Verlängerung: dichter, harmonisch Moll (g), schneller, ~136 BPM
  overtime: {
    bpm: 136,
    beats: 4,
    steps: 16,
    root: 55,
    scale: SCALES.harmonicMinor,
    prog: [0, 5, 3, 4],
    seventh: false,
    bars: 8,
    loop: true,
    swing: 0,
    bass: '0.00.0.00.00.0.0',
    arp: '0120120301201203',
    chordHits: '.....x.......x..',
    padVel: 0.24,
    lead: { pattern: 'x.xx.xx.x.xx.xx.', density: 0.8, lo: 0, hi: 7, chroma: 0.12 },
    kick: 'x..xx...x..xx...',
    snare: '....x.......x..x',
    hat: 'xoxoxoxoxoxoxoxo',
    perc: '..x.....' + '..x.....',
    percNote: 67,
    timbre: { bass: 'saw', lead: 'pulse', arp: 'pluck', pad: 'super' },
  },
  // Sieg: kurzer, strahlender Jingle in C-Dur, endet auf Schlussakkord
  victory: {
    bpm: 126,
    beats: 4,
    steps: 16,
    root: 60,
    scale: SCALES.major,
    prog: [0, 3, 4, 0],
    seventh: false,
    bars: 4,
    loop: false,
    swing: 0,
    bass: '0.......0.0.....',
    arp: '0123456765432101',
    chordHits: REST_16,
    padVel: 0.32,
    lead: { pattern: 'x..xx.x.x..xx.x.', density: 0.9, lo: 0, hi: 7, chroma: 0 },
    kick: 'x...x...x...x...',
    snare: '....x.......x.xx',
    hat: '..x...x...x...x.',
    perc: REST_16,
    percNote: 88,
    timbre: { bass: 'brass', lead: 'brass', arp: 'pluck', pad: 'super' },
  },
  // Niederlage: langsam, sinkend, a-Moll, kein Loop
  defeat: {
    bpm: 72,
    beats: 4,
    steps: 16,
    root: 57,
    scale: SCALES.minor,
    prog: [0, 5, 3, 0],
    seventh: false,
    bars: 4,
    loop: false,
    swing: 0,
    bass: '0.......0.......',
    arp: '0...2...1...0...',
    chordHits: REST_16,
    padVel: 0.34,
    lead: { pattern: 'x.......x.......', density: 1, lo: -2, hi: 3, chroma: 0 },
    kick: 'x...............',
    snare: REST_16,
    hat: REST_16,
    perc: REST_16,
    percNote: 60,
    timbre: { bass: 'saw', lead: 'sine', arp: 'sine', pad: 'triangle' },
  },
};

/** Länge eines Takts in Sekunden. */
export function barSeconds(theme: MusicTheme): number {
  const s = THEMES[theme];
  return (s.beats * 60) / s.bpm;
}

/** Akkordton Nummer `i` (0 = Grundton, wächst über Oktaven) zum Akkordgrundton `rootDeg`. */
function chordDegree(spec: ThemeSpec, rootDeg: number, i: number): number {
  const base = spec.seventh ? [0, 2, 4, 6] : [0, 2, 4];
  const n = base.length;
  return rootDeg + (base[mod(i, n)] as number) + spec.scale.length * Math.floor(i / n);
}

interface Hit {
  step: number;
  ch: string;
  /** Schritte bis zum nächsten Treffer (zyklisch bis Taktende begrenzt) */
  gap: number;
}

function hitsOf(pattern: string, steps: number, isHit: (c: string) => boolean): Hit[] {
  const idx: number[] = [];
  for (let s = 0; s < steps; s++) {
    const c = pattern[s] ?? '.';
    if (isHit(c)) idx.push(s);
  }
  return idx.map((s, k) => ({
    step: s,
    ch: pattern[s] as string,
    gap: (idx[k + 1] ?? steps) - s,
  }));
}

const isDigit = (c: string): boolean => c >= '0' && c <= '9';
const isDrum = (c: string): boolean => c === 'x' || c === 'o';

/**
 * Liefert alle Notenereignisse eines Takts (sortiert nach Zeit). Deterministisch:
 * gleiche Eingabe → gleiche Ausgabe. Looping-Themen kennen jede Taktnummer, ein
 * nicht loopendes Thema liefert nach seiner Länge eine leere Liste.
 */
export function generateBar(theme: MusicTheme, bar: number): NoteEvent[] {
  const spec = THEMES[theme];
  if (!Number.isFinite(bar) || bar < 0) return [];
  const barInt = Math.floor(bar);
  if (!spec.loop && barInt >= spec.bars) return [];
  const b = spec.loop ? barInt % spec.bars : barInt;
  const stepBeats = spec.beats / spec.steps;
  const chordRoot = spec.prog[b % spec.prog.length] as number;
  const out: NoteEvent[] = [];

  const push = (time: number, dur: number, midi: number, voice: MusicVoice, vel: number): void => {
    const t = Math.min(Math.max(0, time), spec.beats - 0.001);
    const d = Math.max(0.03, Math.min(dur, spec.beats - t + 1)); // darf leicht in den nächsten Takt klingen
    out.push({ time: t, dur: d, midi: foldMidi(midi), voice, vel: Math.min(1, Math.max(0.05, vel)) });
  };
  const stepTime = (s: number): number => s * stepBeats + (s % 2 === 1 ? spec.swing * stepBeats : 0);
  const tone = (octave: number, i: number): number =>
    scaleMidi(spec.root + octave, spec.scale, chordDegree(spec, chordRoot, i));

  // Schlusstakt eines nicht loopenden Themas: ein langer Schlussakkord
  if (!spec.loop && b === spec.bars - 1) {
    push(0, spec.beats * 1.5, tone(-24, 0), 'bass', 0.85);
    for (let i = 0; i < 3; i++) push(0, spec.beats * 1.5, tone(0, i), 'pad', 0.45);
    push(0, spec.beats * 1.5, tone(12, 0), 'lead', 0.7);
    push(0, 0.3, 36, 'kick', 1);
    return out;
  }

  // Bass
  for (const h of hitsOf(spec.bass, spec.steps, isDigit)) {
    const dur = Math.min(h.gap * stepBeats * 0.9, 1.5);
    push(stepTime(h.step), dur, tone(-24, Number(h.ch)), 'bass', 0.8);
  }
  // Arpeggio
  for (const h of hitsOf(spec.arp, spec.steps, isDigit)) {
    const dur = Math.min(h.gap * stepBeats * 0.95, 1);
    push(stepTime(h.step), dur, tone(0, Number(h.ch)), 'arp', 0.5);
  }
  // Akkord-Stakkato (z. B. "Ta" des Walzers)
  for (const h of hitsOf(spec.chordHits, spec.steps, (c) => c === 'x')) {
    for (let i = 0; i < 3; i++) push(stepTime(h.step), stepBeats * 2, tone(0, i), 'pad', 0.42);
  }
  // liegender Akkord
  if (spec.padVel > 0) {
    for (let i = 0; i < 3; i++) push(0, spec.beats, tone(-12, i), 'pad', spec.padVel);
  }
  // Melodie (zufällige Wanderung, an Akkordtönen verankert)
  if (spec.lead) {
    const L = spec.lead;
    const rng = new Rng((hashString(theme) ^ Math.imul(b + 1, 0x9e3779b1)) >>> 0);
    const slots = hitsOf(L.pattern, spec.steps, (c) => c === 'x');
    let cur = 0;
    const chordTones = [0, 2, 4];
    slots.forEach((h, k) => {
      if (!rng.chance(L.density) && h.step !== 0) return;
      if (h.step === 0 || rng.chance(0.25)) cur = rng.pick(chordTones);
      else cur += rng.pick([-2, -1, -1, 0, 1, 1, 2]);
      cur = Math.max(L.lo, Math.min(L.hi, cur));
      const next = slots[k + 1];
      const gapSteps = (next ? next.step : spec.steps) - h.step;
      const len = Math.min(gapSteps, rng.pick([1, 1, 2, 2, 3])) * stepBeats * 0.92;
      let midi = scaleMidi(spec.root + 12, spec.scale, chordRoot + cur);
      if (L.chroma > 0 && rng.chance(L.chroma)) midi += 1;
      push(stepTime(h.step), len, midi, 'lead', 0.55 + rng.next() * 0.2);
    });
  }
  // Schlagwerk
  const drum = (pattern: string, voice: MusicVoice, midi: number, vel: number): void => {
    for (const h of hitsOf(pattern, spec.steps, isDrum)) {
      push(stepTime(h.step), 0.1, midi, voice, h.ch === 'x' ? vel : vel * 0.55);
    }
  };
  drum(spec.kick, 'kick', 36, 1);
  drum(spec.snare, 'snare', 38, 0.9);
  drum(spec.hat, 'hat', 42, 0.6);
  drum(spec.perc, 'perc', spec.percNote, 0.7);

  out.sort((a, c) => a.time - c.time);
  return out;
}
