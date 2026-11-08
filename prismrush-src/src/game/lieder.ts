/**
 * 🎹 Lieder: über 100 gemeinfreie Lieder aus Klavierlicht (../klavierlicht/js/songlib.js) als PRISMRUSH-Strecke.
 * Die Melodie wird zum Lead (Kristalle folgen ihr), die Originalbegleitung zu Bass, Arpeggio und Flächen, dazu ein leichter Beat.
 * Jedes Lied trägt seine Rechte-Angabe (credit) – Menü und Ergebnis zeigen sie an.
 */
import { STEPS_PER_BAR, type NoteEvent, type Section, type Song } from '../audio/music';
import { hashString } from '../core/rng';
import { generateChart } from './chart';
import { DIFFICULTIES, type Difficulty } from './difficulty';
import type { LevelDef, TunnelShape } from './levels';
import { singleSongTrack, type Track } from './track';

export interface KLChart {
  id: string;
  title: string;
  bpm: number;
  step: number;
  off?: number;
  mel: [number, number, number][];
}
export interface Lied {
  id: string;
  title: string;
  artist: string;
  cat: string;
  diff?: number;
  dur?: number;
  lic: string;
}
interface SongLib {
  list(): Promise<Lied[]>;
  chart(s: Lied): Promise<KLChart>;
  CATS: Record<string, string>;
}
interface KLCoreLike {
  accompaniment(c: KLChart): [number, number, number, number][];
}
declare global {
  interface Window {
    KLSongLib?: SongLib;
    KLCore?: KLCoreLike;
  }
}

export const lib = (): SongLib | null =>
  typeof window !== 'undefined' ? (window.KLSongLib ?? null) : null;

const CAT_LOOK: Record<string, [number, number, TunnelShape]> = {
  kinder: [0.14, 0.55, 'ring'],
  weihnacht: [0.0, 0.36, 'star'],
  volk: [0.33, 0.08, 'hex'],
  klassik: [0.72, 0.9, 'octa'],
  choral: [0.6, 0.12, 'square'],
};

/** Lied (Klavierlicht-Chart) → PRISMRUSH-Song im selben 16tel-Raster, mit einem Einzähltakt vorne und einem Takt hinten. */
export function liedSong(c: KLChart): Song {
  const bpm = c.bpm || 100;
  const stepSec = 60 / bpm / 4;
  const pre = STEPS_PER_BAR;
  const notes: NoteEvent[] = [];
  let last = 0;
  for (const [s, p, d] of c.mel) {
    notes.push({ step: s + pre, inst: 'lead', midi: p, dur: Math.max(1, d), vel: 0.85 });
    last = Math.max(last, s + pre + d);
  }
  const core = typeof window !== 'undefined' ? window.KLCore : undefined;
  if (core) {
    const off = (c.off ?? 0) / 1000;
    for (const [t, p, d, v] of core.accompaniment(c)) {
      const step = Math.round((t - off) / stepSec) + pre;
      const dur = Math.max(1, Math.round(d / stepSec));
      notes.push({
        step,
        inst: p < 52 ? 'bass' : dur >= 6 ? 'pad' : 'arp',
        midi: p,
        dur,
        vel: Math.min(1, v * 1.8),
      });
      last = Math.max(last, step + dur);
    }
  }
  const bars = Math.ceil(last / STEPS_PER_BAR) + 1;
  const totalSteps = bars * STEPS_PER_BAR;
  // leichter Beat: Kick auf 1 und 3, Clap auf 2 und 4, Hi-Hat auf den Achteln dazwischen
  for (let s = 0; s < totalSteps - STEPS_PER_BAR; s += 2) {
    if (s % 8 === 0) notes.push({ step: s, inst: 'kick', midi: 36, dur: 1, vel: 0.7 });
    else if (s % 8 === 4) notes.push({ step: s, inst: 'clap', midi: 38, dur: 1, vel: 0.5 });
    else notes.push({ step: s, inst: 'hat', midi: 42, dur: 1, vel: 0.45 });
  }
  notes.sort((a, b) => a.step - b.step);
  const sections: Section[] = [
    { startBar: 0, bars: 1, kind: 'intro', energy: 0.3 },
    { startBar: 1, bars: Math.max(1, bars - 2), kind: 'drop', energy: 0.8 },
    { startBar: bars - 1, bars: 1, kind: 'outro', energy: 0.3 },
  ];
  return {
    bpm,
    bars,
    totalSteps,
    notes,
    sections,
    rootMidi: 48,
    scale: [0, 2, 4, 5, 7, 9, 11],
    style: 'synthwave',
    chords: new Array<number>(bars).fill(0),
  };
}

const charts = new Map<string, KLChart>();

/** Level-Beschreibung für ein Lied (Farben und Tunnel je Liedart). */
export function liedLevel(s: Lied, c: KLChart): LevelDef {
  charts.set('lied-' + s.id, c);
  const [hue, hue2, tunnel] = CAT_LOOK[s.cat] ?? [0.5, 0.85, 'ring'];
  return {
    id: 'lied-' + s.id,
    index: -1,
    world: 0,
    name: s.title,
    credit: s.lic,
    style: 'synthwave',
    bpm: Math.round(c.bpm || 100),
    bars: 0,
    seed: hashString('lied:' + s.id),
    density: 0.85,
    wallRate: 0.35,
    orbRate: 0.5,
    hue,
    hue2,
    tunnel,
    bend: 0.35,
    twist: 0.2,
  };
}

/** Strecke: Kristalle nur auf Melodietönen (Spur folgt der Tonhöhe), Orbs auf Hi-Hats, wenige Wände. */
export function liedTrack(level: LevelDef, difficulty: Difficulty): Track {
  const c = charts.get(level.id);
  if (!c) throw new Error('Lied nicht geladen');
  const song = liedSong(c);
  const d = DIFFICULTIES[difficulty];
  const chartSong: Song = {
    ...song,
    notes: song.notes.filter((n) => n.inst === 'lead' || n.inst === 'hat'),
  };
  const events = generateChart(chartSong, {
    seed: level.seed ^ hashString(difficulty),
    density: 0.85,
    wallRate: level.wallRate * d.wallRate,
    orbRate: level.orbRate,
    minGap: d.minGap,
    doubleWalls: false,
    startStep: STEPS_PER_BAR,
    endStep: song.totalSteps - STEPS_PER_BAR,
  }).map(({ step, kind, lane, lanes }) => ({ step, kind, lane, lanes }));
  return singleSongTrack({ song, params: null, events });
}
