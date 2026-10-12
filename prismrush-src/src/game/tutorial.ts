/** Interaktives Tutorial mit handgesetzten Ereignissen und Hinweisen. */
import { STEPS_PER_BAR, generateSong } from '../audio/music';
import { hashString } from '../core/rng';
import type { ChartEvent } from './chart';
import type { LevelDef } from './levels';
import { singleSongTrack, type Track } from './track';

export interface TutorialHint {
  fromBar: number;
  toBar: number;
  desktop: string;
  touch: string;
}

export const TUTORIAL_LEVEL: LevelDef = {
  id: 'tutorial',
  index: -1,
  world: 0,
  name: 'Tutorial',
  style: 'synthwave',
  bpm: 100,
  bars: 20,
  seed: hashString('prismrush:tutorial'),
  density: 0.5,
  wallRate: 0.5,
  orbRate: 0.5,
  hue: 0.8,
  hue2: 0.55,
  tunnel: 'hex',
  bend: 0.2,
  twist: 0,
};

/** Ab diesem Takt wird die Energie für die Overdrive-Lektion aufgefüllt. */
export const TUTORIAL_ENERGY_BAR = 17;

export const TUTORIAL_HINTS: TutorialHint[] = [
  {
    fromBar: 0,
    toBar: 2,
    desktop: 'Willkommen bei PRISMRUSH! Die Musik ist deine Strecke.',
    touch: 'Willkommen bei PRISMRUSH! Die Musik ist deine Strecke.',
  },
  {
    fromBar: 2,
    toBar: 6,
    desktop: 'Triff die Kristalle, wenn sie den Ring erreichen: Leertaste, ↑ oder ↓.',
    touch: 'Triff die Kristalle, wenn sie den Ring erreichen: Tippe die mittlere Spurtaste.',
  },
  {
    fromBar: 6,
    toBar: 10,
    desktop:
      'Spur wechseln: ← / → (trifft gleich mit), A / S / D direkt oder Mausklick auf die Spur.',
    touch: 'Andere Spuren: Tippe die Spurtaste oder gleite mit dem Finger hinüber.',
  },
  {
    fromBar: 10,
    toBar: 13,
    desktop: 'Rhythmus-Orbs sammelst du automatisch, wenn du in ihrer Spur bist.',
    touch: 'Orbs sammelst du in ihrer Spur. Wische links/rechts zum Spurwechsel.',
  },
  {
    fromBar: 13,
    toBar: 17,
    desktop: 'Weiche den Prismenwänden aus, indem du rechtzeitig die Spur wechselst!',
    touch: 'Weiche den Prismenwänden aus, indem du rechtzeitig die Spur wechselst!',
  },
  {
    fromBar: 17,
    toBar: 20,
    desktop: 'Energie voll! Zünde den Overdrive mit E oder Umschalt: doppelte Punkte.',
    touch: 'Energie voll! Tippe ⚡ oder wische nach oben: doppelte Punkte.',
  },
];

type Ev = Omit<ChartEvent, 'id' | 'time'>;

function note(step: number, lane: number): Ev {
  return { step, kind: 'note', lane, lanes: [lane] };
}
function orb(step: number, lane: number): Ev {
  return { step, kind: 'orb', lane, lanes: [lane] };
}
function wall(step: number, lanes: number[]): Ev {
  return { step, kind: 'wall', lane: lanes[0], lanes };
}

export function tutorialEvents(): Ev[] {
  const evs: Ev[] = [];
  for (let s = 2 * STEPS_PER_BAR; s < 6 * STEPS_PER_BAR; s += 8) evs.push(note(s, 1));
  const alt = [0, 2, 1, 0, 2, 1, 2, 0];
  for (let i = 0; i < 8; i++) evs.push(note(6 * STEPS_PER_BAR + i * 8, alt[i]));
  const orbLanes = [0, 0, 0, 0, 2, 2, 2, 2, 1, 1, 1, 1];
  orbLanes.forEach((l, i) => evs.push(orb(10 * STEPS_PER_BAR + i * 4, l)));
  evs.push(wall(216, [1]), note(224, 0), note(228, 2), wall(232, [0, 1]));
  evs.push(
    note(240, 2),
    note(244, 0),
    wall(248, [1, 2]),
    note(256, 0),
    note(260, 1),
    wall(264, [0]),
  );
  const fin = [1, 0, 1, 2, 1, 0, 2, 1, 1];
  fin.forEach((l, i) => evs.push(note(17 * STEPS_PER_BAR + i * 4, l)));
  return evs.sort((a, b) => a.step - b.step);
}

export function tutorialTrack(): Track {
  const L = TUTORIAL_LEVEL;
  const song = generateSong({ seed: L.seed, bpm: L.bpm, bars: L.bars, style: L.style });
  return singleSongTrack({ song, params: null, events: tutorialEvents() });
}

export function hintForBar(bar: number, touch: boolean): string | null {
  const h = TUTORIAL_HINTS.find((x) => bar >= x.fromBar && bar < x.toBar);
  if (!h) return null;
  return touch ? h.touch : h.desktop;
}
