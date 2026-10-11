// Klangrezepte: Soundeffekte (Stadion, Tore, Autos), Instrumente und Schlagwerk als reine Daten (Schichten aus
// Oszillatoren/Rauschen mit Filter und Hüllkurve). Abgespielt werden sie von audio.ts.
import { mtof, type Timbre } from './music';

export type SfxName =
  | 'click'
  | 'back'
  | 'hover'
  | 'countdown'
  | 'go'
  | 'goal'
  | 'goalConceded'
  | 'whistle'
  | 'jump'
  | 'dodge'
  | 'pad'
  | 'padBig'
  | 'hit'
  | 'hitHard'
  | 'wall'
  | 'demo'
  | 'respawn'
  | 'win'
  | 'lose'
  | 'overtime';

export const SFX_NAMES: readonly SfxName[] = [
  'click',
  'back',
  'hover',
  'countdown',
  'go',
  'goal',
  'goalConceded',
  'whistle',
  'jump',
  'dodge',
  'pad',
  'padBig',
  'hit',
  'hitHard',
  'wall',
  'demo',
  'respawn',
  'win',
  'lose',
  'overtime',
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

const SUS = { sustain: 0.7, decay: 0.08, release: 0.2 };

export const SFX_RECIPES: Record<SfxName, SfxLayer[]> = {
  click: [tone('square', 1300, 0, 0.05, 0.22, { f1: 800 }), tone('sine', 2000, 0, 0.03, 0.2)],
  back: [tone('triangle', 720, 0, 0.1, 0.35, { f1: 380 })],
  hover: [tone('sine', 920, 0, 0.035, 0.16)],
  countdown: [
    tone('square', 660, 0, 0.2, 0.22, { ...SUS, filter: { type: 'lowpass', f0: 3000 } }),
    tone('sine', 330, 0, 0.2, 0.3, SUS),
  ],
  go: [
    tone('square', 990, 0, 0.6, 0.2, { ...SUS, filter: { type: 'lowpass', f0: 4500 } }),
    tone('square', 1485, 0, 0.6, 0.12, SUS),
    tone('sawtooth', 495, 0, 0.6, 0.14, { ...SUS, filter: { type: 'lowpass', f0: 1500 } }),
    noise(0, 0.4, 0.12, { type: 'bandpass', f0: 600, f1: 3500, q: 1 }, { attack: 0.1 }),
  ],
  // Torhupe + Sirene + Jubel
  goal: [
    ...[233, 294, 349].map((f, i) =>
      tone('sawtooth', f, 0, 1.6, 0.14, {
        ...SUS,
        attack: 0.03,
        detune: (i - 1) * 7,
        filter: { type: 'lowpass', f0: 1500, q: 1 },
      }),
    ),
    tone('sine', 520, 0.1, 1.5, 0.22, { f1: 980, attack: 0.1, vibrato: { rate: 2.5, cents: 500 } }),
    noise(0, 2, 0.22, { type: 'bandpass', f0: 900, f1: 1900, q: 0.7 }, { attack: 0.35 }),
    ...melody('triangle', [72, 76, 79, 84], 0.2, 0.09, 0.25, 0.2),
  ],
  goalConceded: [
    tone('sawtooth', 156, 0, 1.4, 0.2, {
      ...SUS,
      f1: 98,
      attack: 0.04,
      filter: { type: 'lowpass', f0: 900, f1: 300 },
    }),
    tone('sawtooth', 147, 0, 1.4, 0.16, { ...SUS, f1: 93, detune: 12, filter: { type: 'lowpass', f0: 800 } }),
    tone('sine', 78, 0.05, 1.2, 0.3, { f1: 52 }),
    noise(0, 1.2, 0.08, { type: 'lowpass', f0: 700, f1: 250 }, { attack: 0.2 }),
  ],
  whistle: [
    tone('sine', 2850, 0, 0.6, 0.3, { ...SUS, attack: 0.02, vibrato: { rate: 30, cents: 140 } }),
    tone('sine', 3400, 0, 0.6, 0.12, { ...SUS, attack: 0.02, vibrato: { rate: 26, cents: 120 } }),
    noise(0, 0.6, 0.05, { type: 'highpass', f0: 4500 }),
  ],
  jump: [tone('sine', 280, 0, 0.17, 0.5, { f1: 760 }), tone('triangle', 560, 0, 0.12, 0.12, { f1: 1200 })],
  dodge: [
    noise(0, 0.28, 0.35, { type: 'bandpass', f0: 500, f1: 4000, q: 1.4 }, { attack: 0.06 }),
    tone('triangle', 400, 0, 0.2, 0.2, { f1: 1100 }),
  ],
  pad: [...melody('sine', [76, 83, 88], 0, 0.045, 0.2, 0.3), tone('triangle', 1760, 0.1, 0.2, 0.1)],
  padBig: [
    ...melody('sawtooth', [64, 71, 76, 83, 88], 0, 0.05, 0.32, 0.14, {
      filter: { type: 'lowpass', f0: 3500, q: 1 },
    }),
    tone('sine', 110, 0, 0.45, 0.45, { f1: 220 }),
    noise(0, 0.5, 0.3, { type: 'bandpass', f0: 400, f1: 4500, q: 1.2 }, { attack: 0.15 }),
  ],
  hit: [
    noise(0, 0.14, 0.5, { type: 'lowpass', f0: 2400, f1: 200 }),
    tone('sine', 150, 0, 0.14, 0.65, { f1: 48 }),
  ],
  hitHard: [
    noise(0, 0.3, 0.7, { type: 'lowpass', f0: 3200, f1: 150 }),
    tone('sine', 110, 0, 0.3, 0.85, { f1: 32 }),
    noise(0, 0.04, 0.4, { type: 'highpass', f0: 3000 }),
    tone('square', 90, 0, 0.12, 0.2, { f1: 45, filter: { type: 'lowpass', f0: 600 } }),
  ],
  wall: [
    tone('sine', 230, 0, 0.1, 0.55, { f1: 95 }),
    noise(0, 0.07, 0.25, { type: 'bandpass', f0: 900, q: 1.5 }),
  ],
  demo: [
    noise(0, 0.9, 0.7, { type: 'lowpass', f0: 3600, f1: 90 }),
    tone('sine', 120, 0, 0.7, 0.85, { f1: 28 }),
    tone('sawtooth', 220, 0, 0.5, 0.2, { f1: 40, filter: { type: 'lowpass', f0: 1200, f1: 120 } }),
    noise(0, 0.06, 0.4, { type: 'highpass', f0: 4000 }),
    noise(0.12, 0.35, 0.18, { type: 'bandpass', f0: 3000, f1: 800, q: 2 }),
  ],
  respawn: [
    tone('sine', 220, 0, 0.5, 0.35, { f1: 1320, attack: 0.1, vibrato: { rate: 12, cents: 40 } }),
    tone('triangle', 110, 0, 0.5, 0.2, { f1: 660, attack: 0.1 }),
    ...melody('sine', [88, 91, 95], 0.4, 0.06, 0.2, 0.14),
  ],
  win: [
    ...melody('triangle', [67, 72, 76, 79, 84], 0, 0.1, 0.25, 0.36),
    ...melody('sine', [79, 84, 88, 91, 96], 0, 0.1, 0.3, 0.14),
    ...[84, 88, 91].map((n) => tone('triangle', mtof(n), 0.5, 0.7, 0.26, { ...SUS, release: 0.3 })),
  ],
  lose: [
    ...melody('triangle', [67, 64, 62, 55], 0, 0.17, 0.3, 0.34),
    tone('sawtooth', mtof(43), 0.55, 0.5, 0.14, { f1: mtof(41), filter: { type: 'lowpass', f0: 500 } }),
  ],
  overtime: [
    ...[0, 0.3, 0.6].flatMap((at) => [
      tone('square', 660, at, 0.14, 0.18, { filter: { type: 'lowpass', f0: 3500 } }),
      tone('square', 880, at + 0.14, 0.14, 0.18, { filter: { type: 'lowpass', f0: 3500 } }),
    ]),
    tone('sawtooth', 110, 0, 0.95, 0.16, { ...SUS, filter: { type: 'lowpass', f0: 500 } }),
  ],
};

/** Gesamtdauer eines Rezepts in Sekunden. */
export function recipeDuration(layers: readonly SfxLayer[]): number {
  let max = 0;
  for (const l of layers) max = Math.max(max, (l.at ?? 0) + l.dur);
  return max;
}

// Abbildung fremder Namen auf vorhandene Klänge
const ALIASES: Record<string, SfxName> = {
  select: 'click',
  confirm: 'click',
  button: 'click',
  cancel: 'back',
  close: 'back',
  tor: 'goal',
  boostpad: 'pad',
  boostpadbig: 'padBig',
  crash: 'hit',
  explode: 'demo',
  kickoff: 'whistle',
  victory: 'win',
  defeat: 'lose',
  start: 'go',
  bounce: 'jump',
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
    case 'super': {
      const f = Math.min(6000, freq * 5);
      return [-12, 0, 12].map((dt) =>
        tone('sawtooth', freq, 0, dur, g(0.1), {
          attack: 0.03,
          sustain: 0.85,
          decay: 0.1,
          release: Math.min(0.12, dur * 0.4),
          detune: dt,
          filter: { type: 'lowpass', f0: f, f1: f * 0.6, q: 1 },
        }),
      );
    }
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
