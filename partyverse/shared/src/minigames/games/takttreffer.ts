import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { lerp } from '../util';
import { hash } from './echomuster';

/**
 * Takt-Treffer: Drei Spuren, Noten fallen im Takt eines aus dem Seed erzeugten Musters (das Tempo steigt).
 * Im richtigen Moment die passende Spur treffen: Perfekt/Gut/Daneben, Kombo erhöht den Multiplikator.
 * Später kommen Haltenoten (Spur gedrückt halten bis zum Ende) und Störnoten (Bomben: NICHT drücken) dazu.
 */
export interface Note {
  /** Trefferzeitpunkt in Ticks */
  t: number;
  lane: 0 | 1 | 2;
  /** 0 offen, 1 perfekt, 2 gut, 3 verpasst (Bombe: 1 ausgewichen, 3 erwischt) */
  res: 0 | 1 | 2 | 3;
  /** Haltedauer in Ticks (0 = normale Note) */
  len: number;
  /** Störnote: nicht drücken! */
  bomb: boolean;
  /** Haltenote: 0 offen, 1 wird gehalten, 2 geschafft, 3 zu früh losgelassen */
  hold: 0 | 1 | 2 | 3;
}

export type Judge = 'perfect' | 'good' | 'miss' | 'stray' | 'bomb' | 'hold' | 'drop' | '';

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
  bombs: number;
  holds: number;
  /** Spur war im vorigen Schritt gedrückt (Flankenerkennung) */
  prevLane: boolean[];
  /** Je Spur: Index der gerade gehaltenen Haltenote, -1 = keine */
  holding: number[];
  /** Zähler für die Ansicht, zuletzt vergebene Wertung */
  judgeSeq: number;
  judgeKind: Judge;
  judgeLane: number;
  judgeTick: number;
  seed: number;
  /** Ende des Musters */
  endTick: number;
}

export const PERFECT_WINDOW = 5;
export const GOOD_WINDOW = 10;
/** So viele Ticks vor dem Ende einer Haltenote darf man schon loslassen */
export const HOLD_GRACE = 6;
const FIRST_NOTE = 110;
const DURATION = 30;
export const HOLDS_FROM = 6 * 60;
export const BOMBS_FROM = 11 * 60;
export const BOMB_PENALTY = 100;
/** Ab dieser Kombo: FEVER (×4) */
export const FEVER = 24;

/** Tempo (Schläge pro Minute) zum Zeitpunkt t (Ticks) */
export const bpmAt = (t: number): number => 100 + 50 * Math.min(1, t / (DURATION * 60));

export const multiplier = (combo: number): number => Math.min(4, 1 + Math.floor(combo / 8));

/** Welche Spuren sind gedrückt? Mitte: A, B oder hoch/runter */
export function lanesDown(i: Readonly<InputFrame>): [boolean, boolean, boolean] {
  const mid = i.pd && Math.abs(i.px) <= 1 / 3;
  return [
    i.x < -0.5 || (i.pd && i.px < -1 / 3),
    i.a || i.b || Math.abs(i.y) > 0.5 || mid,
    i.x > 0.5 || (i.pd && i.px > 1 / 3),
  ];
}

export const game: MiniGame<BeatState> = {
  id: 'takttreffer',
  name: 'Takt-Treffer',
  tagline: 'Triff jede Note – halten, ausweichen, Fever!',
  instructions: [
    'Drücke die passende Spur, wenn die Note die Linie berührt. Perfekt zählt doppelt.',
    'Lange Noten: Spur gedrückt HALTEN bis zum Ende.',
    'Dunkle Stachel-Noten sind Bomben – NICHT drücken!',
    'Kombo erhöht den Multiplikator bis ×4 (FEVER). Das Tempo steigt.',
  ],
  controls: {
    desktop: 'Links/Rechts (A/D) = äußere Spuren, Leertaste oder Hoch/Runter = Mitte – oder Spur anklicken',
    touch: 'Die drei Spuren antippen bzw. gedrückt halten',
  },
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
    /** Bis wann ist jede Spur durch eine Haltenote belegt? */
    const busy = [0, 0, 0];
    const limit = DURATION * 60 - 70;
    while (t < limit) {
      const eighth = 1800 / bpmAt(t);
      const onBeat = step % 2 === 0;
      const tt = Math.round(t);
      // Während einer Haltenote bleiben alle Spuren frei (mit einem Finger/Zeiger spielbar)
      const holdActive = busy.some((b) => b > tt - GOOD_WINDOW * 2);
      if (holdActive) {
        /* Pause für die Haltenote */
      } else if (rnd.chance(onBeat ? (step % 4 === 0 ? 0.92 : 0.8) : 0.42)) {
        // Spur: bevorzugt Wechsel, selten Wiederholung
        let lane = rnd.int(3);
        if (lane === lastLane && rnd.chance(0.55)) lane = (lane + 1 + rnd.int(2)) % 3;
        const hold = onBeat && t > HOLDS_FROM && t < limit - 120 && rnd.chance(0.16 + 0.1 * (t / limit));
        const len = hold ? Math.round(eighth * rnd.range(3, 5)) : 0;
        notes.push({ t: tt, lane: lane as 0 | 1 | 2, res: 0, len, bomb: false, hold: 0 });
        if (len) busy[lane] = tt + len;
        lastLane = lane;
      } else if (!onBeat && t > BOMBS_FROM && rnd.chance(0.42 + 0.2 * (t / limit))) {
        // Störnote, nicht direkt neben einer echten Note derselben Spur
        const lane = rnd.int(3);
        const near = notes.some(
          (n) => !n.bomb && n.lane === lane && Math.abs(n.t - tt) <= GOOD_WINDOW * 2 + 2,
        );
        if (!near) notes.push({ t: tt, lane: lane as 0 | 1 | 2, res: 0, len: 0, bomb: true, hold: 0 });
      }
      t += eighth;
      step++;
    }
    return {
      notes,
      head: 0,
      t: 0,
      points: 0,
      combo: 0,
      maxCombo: 0,
      perfect: 0,
      good: 0,
      miss: 0,
      bombs: 0,
      holds: 0,
      prevLane: [false, false, false],
      holding: [-1, -1, -1],
      judgeSeq: 0,
      judgeKind: '',
      judgeLane: 1,
      judgeTick: -999,
      seed,
      endTick: Math.round(t),
    };
  },
  step(s, input) {
    if (s.t >= DURATION * 60) return;
    const judge = (kind: Judge, lane: number) => {
      s.judgeKind = kind;
      s.judgeLane = lane;
      s.judgeSeq++;
      s.judgeTick = s.t;
    };
    // Verpasste Noten (Bomben, die man in Ruhe lässt, sind ausgewichen)
    for (let i = s.head; i < s.notes.length; i++) {
      const n = s.notes[i] as Note;
      if (n.t - s.t > GOOD_WINDOW) break;
      if (n.res === 0 && s.t - n.t > GOOD_WINDOW) {
        if (n.bomb) {
          n.res = 1;
          continue;
        }
        n.res = 3;
        if (n.len) n.hold = 3;
        s.miss++;
        s.combo = 0;
        judge('miss', n.lane);
      }
    }
    while (s.head < s.notes.length && (s.notes[s.head] as Note).res !== 0) s.head++;
    const down = lanesDown(input);
    const mult = multiplier(s.combo);
    // Haltenoten
    for (let lane = 0; lane < 3; lane++) {
      const hi = s.holding[lane] as number;
      if (hi < 0) continue;
      const n = s.notes[hi] as Note;
      const end = n.t + n.len;
      if (s.t >= end) {
        n.hold = 2;
        s.holding[lane] = -1;
        s.holds++;
        s.combo++;
        s.maxCombo = Math.max(s.maxCombo, s.combo);
        s.points += 50 * multiplier(s.combo);
        judge('hold', lane);
      } else if (!down[lane]) {
        s.holding[lane] = -1;
        if (s.t >= end - HOLD_GRACE) {
          n.hold = 2;
          s.holds++;
          s.combo++;
          s.maxCombo = Math.max(s.maxCombo, s.combo);
          s.points += 50 * multiplier(s.combo);
          judge('hold', lane);
        } else {
          n.hold = 3;
          s.combo = 0;
          judge('drop', lane);
        }
      } else s.points += mult;
    }
    // Eingaben
    for (let lane = 0; lane < 3; lane++) {
      const press = down[lane] && !s.prevLane[lane];
      s.prevLane[lane] = down[lane] as boolean;
      if (!press || (s.holding[lane] as number) >= 0) continue;
      let hit = -1;
      let bomb = -1;
      for (let i = s.head; i < s.notes.length; i++) {
        const n = s.notes[i] as Note;
        if (n.t - s.t > GOOD_WINDOW) break;
        if (n.res !== 0 || n.lane !== lane || Math.abs(n.t - s.t) > GOOD_WINDOW) continue;
        if (n.bomb) {
          if (bomb < 0) bomb = i;
        } else if (hit < 0) hit = i;
      }
      if (hit >= 0) {
        const n = s.notes[hit] as Note;
        const perfect = Math.abs(n.t - s.t) <= PERFECT_WINDOW;
        n.res = perfect ? 1 : 2;
        if (perfect) s.perfect++;
        else s.good++;
        s.combo++;
        s.maxCombo = Math.max(s.maxCombo, s.combo);
        s.points += (perfect ? 100 : 50) * multiplier(s.combo);
        if (n.len) {
          n.hold = 1;
          s.holding[lane] = hit;
        }
        judge(perfect ? 'perfect' : 'good', lane);
      } else if (bomb >= 0 && Math.abs((s.notes[bomb] as Note).t - s.t) <= PERFECT_WINDOW + 2) {
        (s.notes[bomb] as Note).res = 3;
        s.bombs++;
        s.combo = 0;
        s.points = Math.max(0, s.points - BOMB_PENALTY);
        judge('bomb', lane);
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
    const out: InputFrame = { ...NEUTRAL_INPUT };
    const want = [false, false, false];
    // Haltenoten weiter halten (schwache Bots lassen manchmal zu früh los)
    for (let lane = 0; lane < 3; lane++) {
      const hi = s.holding[lane] as number;
      if (hi < 0) continue;
      const n = s.notes[hi] as Note;
      const early = (hash(s.seed + 5, hi) % 10000) / 10000 < 0.5 * (1 - skill) * (1 - skill);
      const release = early ? n.t + Math.floor(n.len / 2) : n.t + n.len;
      want[lane] = s.t < release;
    }
    for (let i = s.head; i < Math.min(s.notes.length, s.head + 10); i++) {
      const n = s.notes[i] as Note;
      if (n.res !== 0) continue;
      if (n.t - s.t > 14) break;
      const u1 = ((hash(s.seed, i * 3 + 1) % 10000) + 0.5) / 10000;
      const u2 = ((hash(s.seed, i * 3 + 2) % 10000) + 0.5) / 10000;
      const roll = (hash(s.seed + 3, i * 3 + 3) % 10000) / 10000;
      // Bomben: schwache Bots fallen gelegentlich darauf herein
      if (n.bomb) {
        if (roll < 0.35 * (1 - skill) * (1 - skill) && s.t === n.t + Math.round(bias)) want[n.lane] = true;
        continue;
      }
      if (roll < skipP) continue;
      const gauss = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const off = Math.round(gauss * sigma + bias);
      if (s.t === n.t + off) want[n.lane] = true;
    }
    if (want[0]) out.x = -1;
    else if (want[2]) out.x = 1;
    if (want[1]) out.a = true;
    return out;
  },
  hud: (s) => {
    const fresh = s.t - s.judgeTick <= 40;
    const k = s.judgeKind;
    return {
      left: `Kombo ${s.combo}  ·  ×${multiplier(s.combo)}${s.combo >= FEVER ? ' FEVER' : ''}`,
      right: `${s.points} Pkt`,
      hint: !fresh
        ? s.holding.some((h) => h >= 0)
          ? 'Halten!'
          : `${Math.round(bpmAt(s.t))} BPM`
        : k === 'perfect'
          ? 'Perfekt!'
          : k === 'good'
            ? 'Gut'
            : k === 'hold'
              ? 'Gehalten!'
              : k === 'drop'
                ? 'Zu früh losgelassen'
                : k === 'bomb'
                  ? `Bombe! −${BOMB_PENALTY}`
                  : k === 'miss' || k === 'stray'
                    ? 'Daneben'
                    : `${Math.round(bpmAt(s.t))} BPM`,
    };
  },
};
