/**
 * Prozeduraler Musikgenerator. Erzeugt deterministisch aus einem Seed eine
 * vollständige Komposition (Drums, Bass, Pads, Lead, Arpeggio) als Notenliste.
 * Alle Zeiten sind in 16tel-Schritten angegeben; dieselbe Zeitbasis nutzt das
 * Gameplay, wodurch Musik und Hindernisse exakt synchron sind.
 */
import { chance, mulberry32, pick, randInt, type Rng } from '../core/rng';
import { PROGRESSIONS, SCALES, degreeToMidi, triad, type ScaleName } from './theory';

export const STEPS_PER_BEAT = 4;
export const BEATS_PER_BAR = 4;
export const STEPS_PER_BAR = STEPS_PER_BEAT * BEATS_PER_BAR;

export type Instrument =
  | 'kick'
  | 'snare'
  | 'clap'
  | 'hat'
  | 'openhat'
  | 'bass'
  | 'lead'
  | 'pad'
  | 'arp'
  | 'perc';

export type MusicStyle = 'synthwave' | 'trance' | 'techno' | 'dnb' | 'breakbeat' | 'ambient';
export type SectionKind = 'intro' | 'build' | 'drop' | 'break' | 'outro';

export interface NoteEvent {
  step: number;
  inst: Instrument;
  midi: number;
  /** Dauer in Schritten. */
  dur: number;
  vel: number;
}

export interface Section {
  startBar: number;
  bars: number;
  kind: SectionKind;
  energy: number;
}

export interface Song {
  bpm: number;
  bars: number;
  totalSteps: number;
  notes: NoteEvent[];
  sections: Section[];
  rootMidi: number;
  scale: readonly number[];
  style: MusicStyle;
  /** Akkordstufe pro Takt. */
  chords: number[];
}

export interface SongSpec {
  seed: number;
  bpm: number;
  bars: number;
  style: MusicStyle;
  rootMidi?: number;
  /** Endlos-Modus: keine Intro/Outro-Abschnitte. */
  continuous?: boolean;
}

interface StylePreset {
  kick: string;
  snare: string;
  snareInst: 'snare' | 'clap';
  hat: string;
  bass: string;
  bassDur: number;
  scale: ScaleName;
  leadDensity: number;
  arp: boolean;
  root: [number, number];
}

const STYLES: Record<MusicStyle, StylePreset> = {
  synthwave: {
    kick: 'x...x...x...x...',
    snare: '....x.......x...',
    snareInst: 'snare',
    hat: '..x...x...x...x.',
    bass: 'x.x.x.x.x.x.x.x.',
    bassDur: 2,
    scale: 'minor',
    leadDensity: 0.32,
    arp: false,
    root: [40, 45],
  },
  trance: {
    kick: 'x...x...x...x...',
    snare: '....x.......x...',
    snareInst: 'clap',
    hat: '..o...o...o...o.',
    bass: '.xxx.xxx.xxx.xxx',
    bassDur: 1,
    scale: 'harmonicMinor',
    leadDensity: 0.38,
    arp: true,
    root: [41, 46],
  },
  techno: {
    kick: 'x...x...x...x...',
    snare: '....x.......x...',
    snareInst: 'clap',
    hat: 'xxoxxxoxxxoxxxox',
    bass: '..x...x...x...x.',
    bassDur: 2,
    scale: 'phrygian',
    leadDensity: 0.26,
    arp: true,
    root: [38, 43],
  },
  dnb: {
    kick: 'x.........x.....',
    snare: '....x.......x...',
    snareInst: 'snare',
    hat: 'x.x.x.x.x.x.x.xx',
    bass: 'x.....x...x.....',
    bassDur: 4,
    scale: 'minor',
    leadDensity: 0.3,
    arp: false,
    root: [36, 41],
  },
  breakbeat: {
    kick: 'x.....x...x.....',
    snare: '....x..x....x...',
    snareInst: 'snare',
    hat: 'x.x.x.x.x.x.x.x.',
    bass: 'x..x..x...x.x...',
    bassDur: 2,
    scale: 'dorian',
    leadDensity: 0.34,
    arp: false,
    root: [40, 44],
  },
  ambient: {
    kick: 'x.......x.......',
    snare: '............x...',
    snareInst: 'clap',
    hat: '......x.......x.',
    bass: 'x.......x.......',
    bassDur: 8,
    scale: 'lydian',
    leadDensity: 0.22,
    arp: true,
    root: [41, 46],
  },
};

const ENERGY: Record<SectionKind, number> = {
  intro: 0.3,
  build: 0.6,
  drop: 1,
  break: 0.45,
  outro: 0.35,
};

export function stepToSeconds(step: number, bpm: number): number {
  return (step * 60) / (bpm * STEPS_PER_BEAT);
}

export function secondsToStep(seconds: number, bpm: number): number {
  return (seconds * bpm * STEPS_PER_BEAT) / 60;
}

export function layoutSections(bars: number, continuous = false): Section[] {
  const sections: Section[] = [];
  let bar = 0;
  const push = (kind: SectionKind, len: number) => {
    if (len <= 0) return;
    sections.push({ startBar: bar, bars: len, kind, energy: ENERGY[kind] });
    bar += len;
  };
  if (continuous) {
    const cycle: [SectionKind, number][] = [
      ['build', 4],
      ['drop', 8],
      ['break', 4],
    ];
    let i = 0;
    while (bar < bars) {
      const [kind, len] = cycle[i % cycle.length];
      push(kind, Math.min(len, bars - bar));
      i++;
    }
    return sections;
  }
  if (bars < 8) {
    push('drop', bars);
    return sections;
  }
  const intro = bars >= 32 ? 4 : 2;
  const outro = 2;
  push('intro', intro);
  const cycle: [SectionKind, number][] = [
    ['build', 4],
    ['drop', 8],
    ['break', 4],
    ['drop', 8],
  ];
  let i = 0;
  while (bar < bars - outro) {
    const [kind, len] = cycle[i % cycle.length];
    push(kind, Math.min(len, bars - outro - bar));
    i++;
  }
  push('outro', outro);
  return sections;
}

function pattern(p: string, i: number): string {
  return p[i % p.length];
}

function makeMotif(rng: Rng, density: number): { step: number; deg: number; dur: number }[] {
  const motif: { step: number; deg: number; dur: number }[] = [];
  let deg = randInt(rng, 0, 4);
  for (let s = 0; s < 32; s++) {
    const onBeat = s % 4 === 0;
    const p = onBeat ? density * 1.6 : s % 2 === 0 ? density : density * 0.35;
    if (!chance(rng, p)) continue;
    deg += pick(rng, [-2, -1, -1, 0, 1, 1, 2, 3, -3]);
    if (deg < -2) deg = -2;
    if (deg > 9) deg = 9;
    const dur = pick(rng, [1, 2, 2, 3, 4]);
    motif.push({ step: s, deg, dur });
  }
  if (motif.length === 0) motif.push({ step: 0, deg: 0, dur: 4 });
  return motif;
}

export function generateSong(spec: SongSpec): Song {
  const rng = mulberry32(spec.seed);
  const preset = STYLES[spec.style];
  const scale = SCALES[preset.scale];
  const rootMidi = spec.rootMidi ?? randInt(rng, preset.root[0], preset.root[1]);
  const progression = pick(rng, PROGRESSIONS);
  const sections = layoutSections(spec.bars, spec.continuous);
  const motif = makeMotif(rng, preset.leadDensity);
  const motifB = makeMotif(rng, preset.leadDensity * 0.8);
  const notes: NoteEvent[] = [];
  const chords: number[] = [];

  const add = (step: number, inst: Instrument, midi: number, dur: number, vel: number) => {
    notes.push({ step, inst, midi, dur, vel });
  };

  for (const sec of sections) {
    for (let b = 0; b < sec.bars; b++) {
      const bar = sec.startBar + b;
      const chordDeg = progression[bar % progression.length];
      chords[bar] = chordDeg;
      const chord = triad(rootMidi + 24, scale, chordDeg);
      const base = bar * STEPS_PER_BAR;
      const lastBarOfSection = b === sec.bars - 1;
      const kind = sec.kind;
      const full = kind === 'drop';

      // Pads tragen in allen Abschnitten die Harmonie.
      for (const m of chord) add(base, 'pad', m, STEPS_PER_BAR, full ? 0.5 : 0.7);

      for (let s = 0; s < STEPS_PER_BAR; s++) {
        const step = base + s;
        const k = pattern(preset.kick, s);
        const sn = pattern(preset.snare, s);
        const ht = pattern(preset.hat, s);
        const bs = pattern(preset.bass, s);

        const kickOn =
          k === 'x' &&
          (kind === 'drop' ||
            kind === 'build' ||
            (kind === 'intro' && s % 8 === 0) ||
            (kind === 'outro' && s % 4 === 0));
        if (kickOn) add(step, 'kick', 36, 1, s === 0 ? 1 : 0.9);

        if (sn === 'x' && (kind === 'drop' || (kind === 'build' && !lastBarOfSection))) {
          add(step, preset.snareInst, 50, 1, 0.85);
        }
        if (kind === 'build' && lastBarOfSection) {
          // Snare-Wirbel steigert die Spannung vor dem Drop.
          const roll = s >= 8 ? 1 : s % 2 === 0;
          if (roll) add(step, 'snare', 50, 1, 0.35 + (s / 16) * 0.6);
        }
        if (ht !== '.' && kind !== 'intro') {
          const open = ht === 'o';
          if (kind !== 'break' || s % 4 === 2) {
            add(
              step,
              open ? 'openhat' : 'hat',
              80,
              1,
              open ? 0.55 : 0.4 + (s % 4 === 0 ? 0.15 : 0),
            );
          }
        }
        if (bs === 'x' && (kind === 'drop' || kind === 'build' || (kind === 'break' && s === 0))) {
          const bassNote = chord[0] - 24 + (spec.style === 'trance' && s % 4 === 3 ? 12 : 0);
          add(step, 'bass', bassNote, preset.bassDur, 0.85);
        }
        if (preset.arp && (kind === 'drop' || kind === 'break') && s % 2 === 0) {
          const arpNote = chord[(s / 2) % 3] + 12 + (s >= 8 ? 12 : 0);
          add(step, 'arp', arpNote, 1, kind === 'drop' ? 0.35 : 0.25);
        }
        if (full && spec.style !== 'ambient' && s % 16 === 14 && chance(rng, 0.4)) {
          add(step, 'perc', 64, 1, 0.5);
        }
      }

      // Lead-Melodie: Motiv über zwei Takte, an den Akkord angepasst.
      if (kind === 'drop' || kind === 'break') {
        const m = kind === 'drop' ? motif : motifB;
        const half = bar % 2;
        for (const n of m) {
          if (Math.floor(n.step / 16) !== half) continue;
          if (kind === 'break' && n.step % 4 !== 0) continue;
          const midi = degreeToMidi(rootMidi + 36, scale, chordDeg + n.deg);
          add(base + (n.step % 16), 'lead', midi, n.dur, kind === 'drop' ? 0.6 : 0.45);
        }
      }
    }
  }

  notes.sort((a, b) => a.step - b.step);
  return {
    bpm: spec.bpm,
    bars: spec.bars,
    totalSteps: spec.bars * STEPS_PER_BAR,
    notes,
    sections,
    rootMidi,
    scale,
    style: spec.style,
    chords,
  };
}

export function sectionAt(song: Song, step: number): Section {
  const bar = Math.floor(step / STEPS_PER_BAR);
  for (const s of song.sections) {
    if (bar >= s.startBar && bar < s.startBar + s.bars) return s;
  }
  return song.sections[song.sections.length - 1];
}
