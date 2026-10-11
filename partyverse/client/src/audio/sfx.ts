// Klangrezepte: Soundeffekte, Instrumente und Schlagwerk als reine Daten (Schichten aus
// Oszillatoren/Rauschen mit Filter und Hüllkurve). Abgespielt werden sie von audio.ts.
import { mtof, type Timbre } from './music';

export type SfxName =
  | 'click'
  | 'back'
  | 'hover'
  | 'dice'
  | 'diceLand'
  | 'step'
  | 'coin'
  | 'coinLoss'
  | 'good'
  | 'bad'
  | 'jump'
  | 'hit'
  | 'whoosh'
  | 'beep'
  | 'tick'
  | 'win'
  | 'lose'
  | 'countdown'
  | 'go'
  | 'portal'
  | 'item'
  | 'shop'
  | 'event'
  | 'fold'
  | 'fanfare'
  | 'turn'
  | 'shard'
  | 'steal'
  | 'swap'
  | 'pop';

export const SFX_NAMES: readonly SfxName[] = [
  'click',
  'back',
  'hover',
  'dice',
  'diceLand',
  'step',
  'coin',
  'coinLoss',
  'good',
  'bad',
  'jump',
  'hit',
  'whoosh',
  'beep',
  'tick',
  'win',
  'lose',
  'countdown',
  'go',
  'portal',
  'item',
  'shop',
  'event',
  'fold',
  'fanfare',
  'turn',
  'shard',
  'steal',
  'swap',
  'pop',
];

export type LayerWave = 'sine' | 'square' | 'sawtooth' | 'triangle' | 'noise';

/** Eine Klangschicht. Frequenzen in Hz, Zeiten in Sekunden, `gain` 0..1. */
export interface SfxLayer {
  wave: LayerWave;
  /** Startfrequenz (bei Rauschen ohne Bedeutung) */
  f0: number;
  /** Zielfrequenz am Ende (exponentieller Gleitflug) */
  f1?: number;
  /** Startverzögerung */
  at?: number;
  dur: number;
  gain: number;
  attack?: number;
  /** Mit `sustain`: Abklingzeit auf den Haltepegel; ohne: Hüllkurve fällt exponentiell bis zum Ende */
  decay?: number;
  /** Haltepegel 0..1 (relativ zum Spitzenwert) */
  sustain?: number;
  release?: number;
  /** Verstimmung in Cent */
  detune?: number;
  filter?: { type: 'lowpass' | 'highpass' | 'bandpass'; f0: number; f1?: number; q?: number };
  vibrato?: { rate: number; cents: number };
}

const tone = (
  wave: LayerWave,
  f0: number,
  at: number,
  dur: number,
  gain: number,
  rest: Partial<SfxLayer> = {},
): SfxLayer => ({
  wave,
  f0,
  at,
  dur,
  gain,
  ...rest,
});

const noise = (
  at: number,
  dur: number,
  gain: number,
  filter: NonNullable<SfxLayer['filter']>,
  rest: Partial<SfxLayer> = {},
): SfxLayer => ({ wave: 'noise', f0: 0, at, dur, gain, filter, ...rest });

/** Folge von Tönen (MIDI) als Schichten. */
function melody(
  wave: LayerWave,
  notes: readonly number[],
  start: number,
  step: number,
  dur: number,
  gain: number,
  rest: Partial<SfxLayer> = {},
): SfxLayer[] {
  return notes.map((n, i) => tone(wave, mtof(n), start + i * step, dur, gain, rest));
}

export const SFX_RECIPES: Record<SfxName, SfxLayer[]> = {
  click: [tone('square', 1300, 0, 0.05, 0.22, { f1: 800 }), tone('sine', 2000, 0, 0.03, 0.2)],
  back: [tone('triangle', 720, 0, 0.1, 0.35, { f1: 380 })],
  hover: [tone('sine', 920, 0, 0.035, 0.16)],
  dice: [
    ...[0, 0.05, 0.11, 0.17, 0.22, 0.29, 0.35].map((at, i) =>
      noise(at, 0.045, 0.32 - i * 0.025, { type: 'bandpass', f0: 1800 + (i % 3) * 900, q: 3 }),
    ),
    ...[0.03, 0.14, 0.26].map((at) => tone('square', 180, at, 0.04, 0.12, { f1: 110 })),
  ],
  diceLand: [
    tone('sine', 170, 0, 0.16, 0.7, { f1: 55 }),
    noise(0, 0.05, 0.3, { type: 'highpass', f0: 2500 }),
    noise(0.07, 0.04, 0.12, { type: 'bandpass', f0: 3200, q: 2 }),
  ],
  step: [tone('sine', 230, 0, 0.07, 0.45, { f1: 130 }), noise(0, 0.03, 0.12, { type: 'lowpass', f0: 1800 })],
  coin: [
    tone('triangle', 1175, 0, 0.07, 0.4),
    tone('sine', 1568, 0.06, 0.28, 0.4, { attack: 0.003 }),
    tone('sine', 3136, 0.06, 0.18, 0.12),
  ],
  coinLoss: [
    tone('sawtooth', 620, 0, 0.32, 0.22, { f1: 160, filter: { type: 'lowpass', f0: 2200, f1: 400 } }),
    tone('triangle', 310, 0.04, 0.28, 0.3, { f1: 90 }),
  ],
  good: melody('triangle', [72, 76, 79, 84], 0, 0.075, 0.2, 0.34),
  bad: [
    ...melody('square', [63, 60, 56], 0, 0.12, 0.2, 0.16, { filter: { type: 'lowpass', f0: 1800 } }),
    tone('sawtooth', 98, 0.2, 0.3, 0.16, { f1: 70, filter: { type: 'lowpass', f0: 600 } }),
  ],
  jump: [tone('sine', 280, 0, 0.17, 0.5, { f1: 760 }), tone('triangle', 560, 0, 0.12, 0.12, { f1: 1200 })],
  hit: [
    noise(0, 0.16, 0.6, { type: 'lowpass', f0: 2400, f1: 200 }),
    tone('sine', 160, 0, 0.14, 0.7, { f1: 45 }),
  ],
  whoosh: [
    noise(0, 0.38, 0.4, { type: 'bandpass', f0: 300, f1: 3200, q: 1.2 }, { attack: 0.12 }),
    noise(0.05, 0.3, 0.12, { type: 'highpass', f0: 4000, f1: 1500 }, { attack: 0.1 }),
  ],
  beep: [tone('square', 880, 0, 0.1, 0.2, { filter: { type: 'lowpass', f0: 4000 } })],
  tick: [tone('sine', 1500, 0, 0.025, 0.3), noise(0, 0.012, 0.18, { type: 'highpass', f0: 5000 })],
  win: [
    ...melody('triangle', [67, 72, 76, 79, 84], 0, 0.1, 0.25, 0.36),
    ...melody('sine', [79, 84, 88, 91, 96], 0, 0.1, 0.3, 0.14),
    tone('triangle', mtof(84), 0.5, 0.6, 0.34, { sustain: 0.6, decay: 0.1, release: 0.25 }),
    tone('triangle', mtof(88), 0.5, 0.6, 0.26, { sustain: 0.6, decay: 0.1, release: 0.25 }),
    tone('triangle', mtof(91), 0.5, 0.6, 0.26, { sustain: 0.6, decay: 0.1, release: 0.25 }),
  ],
  lose: [
    ...melody('triangle', [67, 64, 62, 55], 0, 0.17, 0.3, 0.34),
    tone('sawtooth', mtof(43), 0.55, 0.5, 0.14, { f1: mtof(41), filter: { type: 'lowpass', f0: 500 } }),
  ],
  countdown: [
    tone('square', 660, 0, 0.18, 0.22, {
      sustain: 0.7,
      decay: 0.03,
      release: 0.05,
      filter: { type: 'lowpass', f0: 3000 },
    }),
  ],
  go: [
    tone('square', 990, 0, 0.5, 0.2, {
      sustain: 0.6,
      decay: 0.06,
      release: 0.2,
      filter: { type: 'lowpass', f0: 4500 },
    }),
    tone('square', 1485, 0, 0.5, 0.12, { sustain: 0.6, decay: 0.06, release: 0.2 }),
    tone('sawtooth', 495, 0, 0.5, 0.12, {
      sustain: 0.6,
      decay: 0.06,
      release: 0.2,
      filter: { type: 'lowpass', f0: 1500 },
    }),
  ],
  portal: [
    tone('sine', 200, 0, 0.7, 0.4, { f1: 1500, attack: 0.15, vibrato: { rate: 14, cents: 60 } }),
    tone('sawtooth', 100, 0, 0.7, 0.2, {
      f1: 750,
      attack: 0.2,
      detune: 8,
      filter: { type: 'lowpass', f0: 400, f1: 3500, q: 4 },
    }),
    tone('sine', 2400, 0.35, 0.35, 0.15, { f1: 3600 }),
    noise(0.1, 0.5, 0.1, { type: 'bandpass', f0: 800, f1: 5000, q: 2 }, { attack: 0.2 }),
  ],
  item: melody('sine', [79, 83, 86, 91, 95], 0, 0.055, 0.22, 0.28).concat(
    melody('triangle', [91, 95], 0.25, 0.06, 0.2, 0.12),
  ),
  shop: [
    noise(0, 0.03, 0.3, { type: 'highpass', f0: 4000 }),
    tone('sine', 2093, 0.02, 0.55, 0.3, { attack: 0.002 }),
    tone('sine', 2093 * 2.76, 0.02, 0.3, 0.08),
    tone('sine', 1568, 0.12, 0.5, 0.25, { attack: 0.002 }),
  ],
  event: [
    ...melody('triangle', [64, 68, 71], 0, 0.13, 0.35, 0.3, { vibrato: { rate: 6, cents: 15 } }),
    tone('sine', mtof(52), 0, 0.6, 0.25, { sustain: 0.7, decay: 0.1, release: 0.3 }),
  ],
  fold: [
    noise(0, 0.07, 0.3, { type: 'bandpass', f0: 1600, f1: 3000, q: 1.5 }),
    noise(0.09, 0.06, 0.22, { type: 'bandpass', f0: 2400, f1: 1200, q: 1.5 }),
  ],
  fanfare: [
    ...melody('sawtooth', [60, 60, 60, 67, 64, 67, 72], 0, 0.13, 0.2, 0.17, {
      filter: { type: 'lowpass', f0: 3200, q: 1 },
    }),
    ...[60, 64, 67, 72].map((n) =>
      tone('sawtooth', mtof(n), 0.9, 0.8, 0.12, {
        sustain: 0.7,
        decay: 0.1,
        release: 0.3,
        filter: { type: 'lowpass', f0: 2800 },
      }),
    ),
    tone('triangle', mtof(48), 0.9, 0.8, 0.3, { sustain: 0.7, decay: 0.1, release: 0.3 }),
  ],
  turn: [tone('sine', 784, 0, 0.18, 0.36), tone('sine', 1047, 0.1, 0.4, 0.36, { attack: 0.004 })],
  shard: [
    tone('sine', 2637, 0, 0.45, 0.24),
    tone('sine', 3136, 0.05, 0.4, 0.2),
    tone('sine', 3951, 0.1, 0.5, 0.18),
    tone('triangle', 5274, 0.14, 0.25, 0.07),
  ],
  steal: [
    tone('sawtooth', 420, 0, 0.2, 0.2, { f1: 140, filter: { type: 'lowpass', f0: 1800, f1: 300 } }),
    tone('square', 180, 0.18, 0.2, 0.16, { f1: 520, filter: { type: 'lowpass', f0: 1200 } }),
    noise(0.05, 0.25, 0.08, { type: 'bandpass', f0: 1400, q: 4 }),
  ],
  swap: [
    tone('sine', 400, 0, 0.3, 0.34, { f1: 900 }),
    tone('sine', 900, 0, 0.3, 0.34, { f1: 400 }),
    tone('triangle', 1200, 0.28, 0.1, 0.18),
  ],
  pop: [tone('sine', 620, 0, 0.07, 0.6, { f1: 140 }), noise(0, 0.025, 0.2, { type: 'highpass', f0: 3000 })],
};

/** Gesamtdauer eines Rezepts in Sekunden. */
export function recipeDuration(layers: readonly SfxLayer[]): number {
  let max = 0;
  for (const l of layers) max = Math.max(max, (l.at ?? 0) + l.dur);
  return max;
}

// Abbildung fremder Namen (z. B. aus Minispielen) auf vorhandene Klänge
const ALIASES: Record<string, SfxName> = {
  select: 'click',
  confirm: 'click',
  button: 'click',
  ok: 'click',
  cancel: 'back',
  close: 'back',
  roll: 'dice',
  land: 'diceLand',
  move: 'step',
  walk: 'step',
  collect: 'coin',
  pickup: 'coin',
  gain: 'coin',
  loss: 'coinLoss',
  lose_coin: 'coinLoss',
  success: 'good',
  correct: 'good',
  score: 'good',
  error: 'bad',
  wrong: 'bad',
  fail: 'bad',
  miss: 'bad',
  hurt: 'hit',
  damage: 'hit',
  crash: 'hit',
  bump: 'hit',
  dash: 'whoosh',
  swing: 'whoosh',
  throw: 'whoosh',
  victory: 'win',
  defeat: 'lose',
  gameover: 'lose',
  start: 'go',
  teleport: 'portal',
  powerup: 'item',
  buy: 'shop',
  card: 'fold',
  next: 'turn',
  crystal: 'shard',
  star: 'shard',
  bounce: 'jump',
  hop: 'jump',
  burst: 'pop',
  bubble: 'pop',
};

/** Löst einen (ggf. fremden) Namen auf einen bekannten Klang auf; unbekannt → null. */
export function resolveSfx(name: string): SfxName | null {
  if (Object.prototype.hasOwnProperty.call(SFX_RECIPES, name)) return name as SfxName;
  const key = String(name).toLowerCase().replace(/[-\s]/g, '_');
  if (Object.prototype.hasOwnProperty.call(ALIASES, key)) return ALIASES[key] as SfxName;
  return null;
}

// ---- Instrumente der Musik ----

/** Schichten für einen Ton: `freq` in Hz, `dur` in Sekunden, `vel` 0..1. */
export function instrumentLayers(timbre: Timbre, freq: number, dur: number, vel: number): SfxLayer[] {
  const g = (x: number): number => x * vel;
  const hold = { sustain: 0.8, decay: 0.05, release: Math.min(0.08, dur * 0.4) };
  switch (timbre) {
    case 'sine':
      return [tone('sine', freq, 0, dur, g(0.5), { attack: 0.01, ...hold })];
    case 'triangle':
      return [tone('triangle', freq, 0, dur, g(0.5), { attack: 0.01, ...hold })];
    case 'square':
      return [
        tone('square', freq, 0, dur, g(0.22), {
          attack: 0.01,
          ...hold,
          filter: { type: 'lowpass', f0: 3000 },
        }),
      ];
    case 'saw':
      return [
        tone('sawtooth', freq, 0, dur, g(0.24), {
          attack: 0.01,
          ...hold,
          filter: { type: 'lowpass', f0: Math.min(6000, freq * 6), f1: Math.max(200, freq * 2), q: 2 },
        }),
      ];
    case 'pulse':
      return [
        tone('square', freq, 0, dur, g(0.16), {
          attack: 0.008,
          ...hold,
          detune: -7,
          filter: { type: 'lowpass', f0: 2600 },
        }),
        tone('square', freq, 0, dur, g(0.16), {
          attack: 0.008,
          ...hold,
          detune: 7,
          filter: { type: 'lowpass', f0: 2600 },
        }),
      ];
    case 'bell': {
      const d = Math.max(dur, 0.5);
      return [
        tone('sine', freq, 0, d, g(0.5), { attack: 0.002 }),
        tone('sine', freq * 2.76, 0, d * 0.5, g(0.18), { attack: 0.002 }),
        tone('sine', freq * 5.4, 0, d * 0.25, g(0.06), { attack: 0.002 }),
      ];
    }
    case 'marimba': {
      const d = Math.max(dur, 0.3);
      return [
        tone('sine', freq, 0, d, g(0.6), { attack: 0.002 }),
        tone('sine', freq * 4, 0, 0.1, g(0.25), { attack: 0.001 }),
        noise(0, 0.02, g(0.1), { type: 'bandpass', f0: Math.min(8000, freq * 3), q: 3 }),
      ];
    }
    case 'organ':
      return [
        tone('sine', freq, 0, dur, g(0.3), { attack: 0.015, ...hold, vibrato: { rate: 5.5, cents: 8 } }),
        tone('sine', freq * 2, 0, dur, g(0.18), { attack: 0.015, ...hold }),
        tone('sine', freq * 3, 0, dur, g(0.09), { attack: 0.015, ...hold }),
      ];
    case 'brass':
      return [
        tone('sawtooth', freq, 0, dur, g(0.2), {
          attack: 0.04,
          sustain: 0.75,
          decay: 0.12,
          release: Math.min(0.1, dur * 0.4),
          detune: -6,
          filter: { type: 'lowpass', f0: freq * 2, f1: Math.min(7000, freq * 5), q: 1 },
        }),
        tone('sawtooth', freq, 0, dur, g(0.2), {
          attack: 0.04,
          sustain: 0.75,
          decay: 0.12,
          release: Math.min(0.1, dur * 0.4),
          detune: 6,
          filter: { type: 'lowpass', f0: freq * 2, f1: Math.min(7000, freq * 5), q: 1 },
        }),
      ];
    case 'pluck':
      return [
        tone('sawtooth', freq, 0, Math.max(dur, 0.2), g(0.3), {
          attack: 0.002,
          filter: { type: 'lowpass', f0: Math.min(7000, freq * 8), f1: Math.max(150, freq), q: 2 },
        }),
      ];
  }
}

/** Schichten für ein Schlagwerk-Ereignis der Musik. */
export function drumLayers(voice: 'kick' | 'snare' | 'hat' | 'perc', midi: number, vel: number): SfxLayer[] {
  const g = (x: number): number => x * vel;
  switch (voice) {
    case 'kick':
      return [
        tone('sine', 150, 0, 0.2, g(0.95), { f1: 42, attack: 0.001 }),
        noise(0, 0.015, g(0.2), { type: 'lowpass', f0: 3000 }),
      ];
    case 'snare':
      return [
        noise(0, 0.15, g(0.5), { type: 'bandpass', f0: 1900, q: 0.8 }, { attack: 0.001 }),
        tone('triangle', 230, 0, 0.1, g(0.3), { f1: 150, attack: 0.001 }),
      ];
    case 'hat':
      return [noise(0, 0.04, g(0.22), { type: 'highpass', f0: 7000 }, { attack: 0.001 })];
    case 'perc': {
      const f = mtof(midi);
      return [
        tone('triangle', f, 0, 0.1, g(0.45), { f1: f * 0.8, attack: 0.001 }),
        noise(0, 0.02, g(0.12), { type: 'bandpass', f0: Math.min(9000, f * 2), q: 4 }),
      ];
    }
  }
}
