/** Alle Kampagnenlevel. Musik und Strecke werden aus den Parametern generiert. */
import { hashString } from '../core/rng';
import type { MusicStyle } from '../audio/music';

export type TunnelShape = 'ring' | 'hex' | 'tri' | 'square' | 'star' | 'octa';

export interface LevelDef {
  id: string;
  index: number;
  world: number;
  name: string;
  style: MusicStyle;
  bpm: number;
  bars: number;
  seed: number;
  density: number;
  wallRate: number;
  orbRate: number;
  hue: number;
  hue2: number;
  tunnel: TunnelShape;
  /** Krümmung der Strecke (surreale Raumverzerrung). */
  bend: number;
  twist: number;
}

export interface WorldDef {
  index: number;
  name: string;
  subtitle: string;
}

export const WORLDS: WorldDef[] = [
  { index: 0, name: 'Neon-Aufbruch', subtitle: 'Synthwave unter violettem Himmel' },
  { index: 1, name: 'Kristallhallen', subtitle: 'Trance zwischen gläsernen Facetten' },
  { index: 2, name: 'Pulsar-Tiefe', subtitle: 'Techno aus dem Herz eines Sterns' },
  { index: 3, name: 'Hyperprisma', subtitle: 'Drum & Bass in Lichtgeschwindigkeit' },
];

type Row = [name: string, style: MusicStyle, bpm: number, tunnel: TunnelShape];

const TABLE: Row[][] = [
  [
    ['Erster Funke', 'synthwave', 96, 'ring'],
    ['Lichtpuls', 'synthwave', 100, 'hex'],
    ['Neonregen', 'synthwave', 102, 'ring'],
    ['Chromdämmerung', 'breakbeat', 104, 'square'],
    ['Pixelhorizont', 'ambient', 100, 'octa'],
    ['Laservenen', 'synthwave', 108, 'hex'],
    ['Synthsonne', 'breakbeat', 110, 'star'],
    ['Mitternachtsgitter', 'synthwave', 112, 'square'],
  ],
  [
    ['Prismentor', 'trance', 118, 'tri'],
    ['Glasharfe', 'ambient', 116, 'hex'],
    ['Facettenflug', 'trance', 122, 'octa'],
    ['Spektralbrücke', 'trance', 124, 'ring'],
    ['Eisstrom', 'synthwave', 120, 'tri'],
    ['Kaleidoskop', 'trance', 126, 'star'],
    ['Lichtbrechung', 'techno', 128, 'hex'],
    ['Diamantherz', 'trance', 132, 'octa'],
  ],
  [
    ['Pulsar', 'techno', 124, 'square'],
    ['Schwerkraftbass', 'techno', 128, 'ring'],
    ['Ereignishorizont', 'ambient', 120, 'star'],
    ['Quantenschaum', 'breakbeat', 130, 'tri'],
    ['Tiefenecho', 'techno', 132, 'hex'],
    ['Nebelkern', 'trance', 134, 'octa'],
    ['Magnetsturm', 'techno', 136, 'square'],
    ['Singularität', 'breakbeat', 140, 'star'],
  ],
  [
    ['Hyperraum', 'dnb', 150, 'tri'],
    ['Fraktalflut', 'breakbeat', 146, 'hex'],
    ['Lichtgeschwindigkeit', 'dnb', 160, 'ring'],
    ['Chromatische Aberration', 'techno', 142, 'star'],
    ['Supernova', 'dnb', 166, 'octa'],
    ['Zeitkristall', 'trance', 140, 'tri'],
    ['Prismensturm', 'dnb', 170, 'square'],
    ['Prismrush', 'dnb', 174, 'star'],
  ],
];

const WORLD_HUES: [number, number][] = [
  [0.83, 0.55],
  [0.52, 0.72],
  [0.08, 0.95],
  [0.33, 0.9],
];

function barsFor(bpm: number, targetSec: number): number {
  const bars = (targetSec * bpm) / 240;
  return Math.max(16, Math.round(bars / 4) * 4);
}

export const LEVELS: LevelDef[] = TABLE.flatMap((rows, world) =>
  rows.map(([name, style, bpm, tunnel], i) => {
    const index = world * 8 + i;
    const progress = index / 31;
    const [h1, h2] = WORLD_HUES[world];
    return {
      id: `L${String(index + 1).padStart(2, '0')}`,
      index,
      world,
      name,
      style,
      bpm,
      bars: barsFor(bpm, 58 + world * 6 + (i % 4) * 2),
      seed: hashString(`prismrush:${name}`),
      density: 0.62 + progress * 0.38,
      wallRate: 0.45 + progress * 0.55,
      orbRate: 0.55 + (i % 3) * 0.12,
      hue: (h1 + i * 0.035) % 1,
      hue2: (h2 + i * 0.05) % 1,
      tunnel,
      bend: 0.15 + progress * 0.85,
      twist: world >= 1 ? 0.1 + progress * 0.6 : 0,
    } satisfies LevelDef;
  }),
);

export function levelById(id: string): LevelDef | undefined {
  return LEVELS.find((l) => l.id === id);
}
