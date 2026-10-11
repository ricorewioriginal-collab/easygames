import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { lerp } from '../util';
import { hash } from './echomuster';

/**
 * Takt-Treffer: Drei Spuren, Noten fallen im Takt eines aus dem Seed erzeugten Musters (das Tempo steigt).
 * Im richtigen Moment die passende Spur treffen: Perfekt/Gut/Daneben, Kombo erhöht den Multiplikator.
 */
export interface Note {
  /** Trefferzeitpunkt in Ticks */
  t: number;
  lane: 0 | 1 | 2;
  /** 0 offen, 1 perfekt, 2 gut, 3 verpasst */
  res: 0 | 1 | 2 | 3;
}

export interface BeatState {
  notes: Note[];
  /** Index der ersten noch offenen Note */
  head: number;
  t: number;
  points: number;
  combo: number;
  maxCombo: number;
  perfect: number;
  good: number;
  miss: number;
  /** Spur war im vorigen Schritt gedrückt (Flankenerkennung) */
  prevLane: boolean[];
  /** Zähler für die Ansicht, zuletzt vergebene Wertung */
  judgeSeq: number;
  judgeKind: 'perfect' | 'good' | 'miss' | 'stray' | '';
  judgeLane: number;
  judgeTick: number;
  seed: number;
  /** Ende des Musters */
  endTick: number;
}

export const PERFECT_WINDOW = 5;
export const GOOD_WINDOW = 10;
const FIRST_NOTE = 110;
const DURATION = 30;

/** Tempo (Schläge pro Minute) zum Zeitpunkt t (Ticks) */
export const bpmAt = (t: number): number => 100 + 50 * Math.min(1, t / (DURATION * 60));

export const multiplier = (combo: number): number => Math.min(4, 1 + Math.floor(combo / 8));

/** Welche Spuren sind gedrückt? */
export function lanesDown(i: Readonly<InputFrame>): [boolean, boolean, boolean] {
  const mid = i.pd && Math.abs(i.px) <= 1 / 3;
  return [i.x < -0.5 || (i.pd && i.px < -1 / 3), i.a || i.b || mid, i.x > 0.5 || (i.pd && i.px > 1 / 3)];
}

export const game: MiniGame<BeatState> = {
  id: 'takttreffer',
  name: 'Takt-Treffer',
  tagline: 'Triff jede Note im Takt',
  instructions: [
    'Leuchtende Noten fallen auf drei Spuren zur Trefferlinie.',
    'Drücke die passende Spur genau dann, wenn die Note die Linie berührt.',
    'Perfekte Treffer bringen mehr Punkte, eine Kombo erhöht den Multiplikator.',
    'Wer danebendrückt oder eine Note verpasst, verliert die Kombo. Das Tempo steigt!',
  ],
  controls: { desktop: 'Links/Rechts-Pfeil (oder A/D) und Leertaste für die Mitte – oder Spur anklicken', touch: 'Die drei Spuren antippen' },
  category: 'rhythm',
  duration: DURATION,
  usesPointer: true,
  touch: { stick: false, a: false, b: false },
  init(seed) {
    const rnd = new Rng(seed);
    const notes: Note[] = [];
    let t = FIRST_NOTE;
    let step = 0;
    let lastLane = 1;
    const limit = DURATION * 60 - 70;
    while (t < limit) {
      const eighth = 1800 / bpmAt(t);
      const onBeat = step % 2 === 0;
      if (rnd.chance(onBeat ? (step % 4 === 0 ? 0.92 : 0.8) : 0.42)) {
        // Spur: bevorzugt Wechsel, selten Wiederholung
        let lane = rnd.int(3);
        if (lane === lastLane && rnd.chance(0.55)) lane = (lane + 1 + rnd.int(2)) % 3;
        notes.push({ t: Math.round(t), lane: lane as 0 | 1 | 2, res: 0 });
        lastLane = lane;
      }
      t += eighth;
      step++;
    }
    return { notes, head: 0, t: 0, points: 0, combo: 0, maxCombo: 0, perfect: 0, good: 0, miss: 0, prevLane: [false, false, false], judgeSeq: 0, judgeKind: '', judgeLane: 1, judgeTick: -999, seed, endTick: Math.round(t) };
  },
  step(s, input) {
    if (s.t >= DURATION * 60) return;
    const judge = (kind: BeatState['judgeKind'], lane: number) => {
      s.judgeKind = kind;
      s.judgeLane = lane;
      s.judgeSeq++;
      s.judgeTick = s.t;
    };
    // Verpasste Noten
    for (let i = s.head; i < s.notes.length; i++) {
      const n = s.notes[i] as Note;
      if (n.t - s.t > GOOD_WINDOW) break;
      if (n.res === 0 && s.t - n.t > GOOD_WINDOW) {
        n.res = 3;
        s.miss++;
        s.combo = 0;
        judge('miss', n.lane);
      }
    }
    while (s.head < s.notes.length && (s.notes[s.head] as Note).res !== 0) s.head++;
    // Eingaben
    const down = lanesDown(input);
    for (let lane = 0; lane < 3; lane++) {
      const press = down[lane] && !s.prevLane[lane];
      s.prevLane[lane] = down[lane] as boolean;
      if (!press) continue;
      let hit: Note | null = null;
      for (let i = s.head; i < s.notes.length; i++) {
        const n = s.notes[i] as Note;
        if (n.t - s.t > GOOD_WINDOW) break;
        if (n.res === 0 && n.lane === lane && Math.abs(n.t - s.t) <= GOOD_WINDOW) {
          hit = n;
          break;
        }
      }
      if (hit) {
        const perfect = Math.abs(hit.t - s.t) <= PERFECT_WINDOW;
        hit.res = perfect ? 1 : 2;
        if (perfect) s.perfect++;
        else s.good++;
        s.combo++;
        s.maxCombo = Math.max(s.maxCombo, s.combo);
        s.points += (perfect ? 100 : 50) * multiplier(s.combo);
        judge(perfect ? 'perfect' : 'good', lane);
      } else {
        s.combo = 0;
        s.points = Math.max(0, s.points - 15);
        judge('stray', lane);
      }
    }
    while (s.head < s.notes.length && (s.notes[s.head] as Note).res !== 0) s.head++;
    s.t++;
  },
  done: (s) => s.t >= DURATION * 60,
  score: (s) => Math.max(0, Math.round(s.points)),
  bot(s, skill): InputFrame {
    const sigma = lerp(7.5, 1.6, skill);
    const bias = lerp(2.5, 0, skill);
    const skipP = 0.02 + 0.45 * (1 - skill) * (1 - skill) + 0.1 * (1 - skill);
    for (let i = s.head; i < Math.min(s.notes.length, s.head + 8); i++) {
      const n = s.notes[i] as Note;
      if (n.res !== 0) continue;
      if (n.t - s.t > 14) break;
      const u1 = ((hash(s.seed, i * 3 + 1) % 10000) + 0.5) / 10000;
      const u2 = ((hash(s.seed, i * 3 + 2) % 10000) + 0.5) / 10000;
      const skip = ((hash(s.seed + 3, i * 3 + 3) % 10000) / 10000) < skipP;
      if (skip) continue;
      const gauss = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const off = Math.round(gauss * sigma + bias);
      if (s.t === n.t + off) return n.lane === 0 ? { ...NEUTRAL_INPUT, x: -1 } : n.lane === 2 ? { ...NEUTRAL_INPUT, x: 1 } : { ...NEUTRAL_INPUT, a: true };
    }
    return { ...NEUTRAL_INPUT };
  },
  hud: (s) => ({
    left: `Kombo ${s.combo}  ·  x${multiplier(s.combo)}`,
    right: `${s.points} Pkt`,
    hint: s.t - s.judgeTick > 40 ? `${Math.round(bpmAt(s.t))} BPM` : s.judgeKind === 'perfect' ? 'Perfekt!' : s.judgeKind === 'good' ? 'Gut' : s.judgeKind === 'miss' || s.judgeKind === 'stray' ? 'Daneben' : `${Math.round(bpmAt(s.t))} BPM`,
  }),
};
