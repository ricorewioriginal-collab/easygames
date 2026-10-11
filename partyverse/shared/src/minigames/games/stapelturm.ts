import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { clamp, lerp } from '../util';

/**
 * Stapelturm: Ein Kran schwingt einen Block hin und her, A (oder Klick) lässt ihn fallen.
 * Was übersteht, wird abgeschnitten; eine perfekte Landung behält die volle Breite und gibt einen Bonus.
 * Koordinaten: x nach rechts in Einheiten (Blockhöhe = 1).
 */
export interface TowerBlock { x: number; w: number }
export interface TowerState {
  rnd: Rng;
  tick: number;
  blocks: TowerBlock[]; // [0] = Fundament
  w: number; // Breite des aktuellen Blocks
  cx: number; // Kranposition
  dir: number;
  phase: 'swing' | 'fall' | 'wait' | 'over';
  timer: number;
  dropX: number;
  prevA: boolean;
  perfects: number;
  streak: number;
  bonus: number;
  /** Letzter Abwurf für die Ansicht */
  seq: number;
  last: { perfect: boolean; miss: boolean; cutX: number; cutW: number; x: number; w: number };
  lost: boolean;
}

export const RANGE = 5.2;
export const BASE_W = 5;
export const PERFECT_TOL = 0.14;
export const FALL_TICKS = 16;
const WAIT_TICKS = 14;
const MAX_TICKS = 30 * 60;
const MIN_W = 0.2;

export const heightOf = (s: TowerState): number => s.blocks.length - 1;
/** Kranspeed in Einheiten pro Tick bei Turmhöhe n */
export const craneSpeed = (n: number): number => lerp(3.4, 8.6, Math.min(1, n / 26)) / 60;
export const score = (s: TowerState): number => heightOf(s) * 50 + s.bonus;

export const game: MiniGame<TowerState> = {
  id: 'stapelturm',
  name: 'Stapelturm',
  tagline: 'Bau den Turm bis in die Wolken!',
  instructions: [
    'Der Kran schwingt einen Block hin und her. Mit A (oder Klick) lässt du ihn fallen.',
    'Was über den Block darunter hinausragt, wird abgeschnitten – der Turm wird schmaler.',
    'Perfekt getroffen bleibt der Block breit und bringt Bonuspunkte, mehrere Perfekte hintereinander zählen mehr.',
    'Pro Stockwerk gibt es 50 Punkte. Verfehlt = Ende. Der Kran wird immer schneller.',
  ],
  controls: { desktop: 'Leertaste, Enter oder Mausklick: Block fallen lassen', touch: 'Knopf A: Block fallen lassen' },
  category: 'physics',
  duration: 30,
  touch: { stick: false, a: true, b: false },
  init(seed) {
    const rnd = new Rng(seed);
    return {
      rnd,
      tick: 0,
      blocks: [{ x: 0, w: BASE_W }],
      w: BASE_W,
      cx: rnd.float(-RANGE, RANGE),
      dir: rnd.chance(0.5) ? 1 : -1,
      phase: 'swing',
      timer: 0,
      dropX: 0,
      prevA: false,
      perfects: 0,
      streak: 0,
      bonus: 0,
      seq: 0,
      last: { perfect: false, miss: false, cutX: 0, cutW: 0, x: 0, w: 0 },
      lost: false,
    };
  },
  step(s, input) {
    if (s.phase === 'over') return;
    s.tick++;
    const press = (input.a || input.pd) && !s.prevA;
    s.prevA = input.a || input.pd;
    // Kran bewegt sich immer
    s.cx += s.dir * craneSpeed(heightOf(s));
    if (s.cx > RANGE) {
      s.cx = RANGE * 2 - s.cx;
      s.dir = -1;
    } else if (s.cx < -RANGE) {
      s.cx = -RANGE * 2 - s.cx;
      s.dir = 1;
    }
    if (s.phase === 'swing') {
      if (press) {
        s.phase = 'fall';
        s.timer = 0;
        s.dropX = s.cx;
      }
    } else if (s.phase === 'fall') {
      s.timer++;
      if (s.timer >= FALL_TICKS) {
        const top = s.blocks[s.blocks.length - 1] as TowerBlock;
        const lo = Math.max(s.dropX - s.w / 2, top.x - top.w / 2);
        const hi = Math.min(s.dropX + s.w / 2, top.x + top.w / 2);
        const overlap = hi - lo;
        s.seq++;
        if (overlap < MIN_W) {
          s.last = { perfect: false, miss: true, cutX: s.dropX, cutW: s.w, x: s.dropX, w: s.w };
          s.lost = true;
          s.phase = 'over';
          return;
        }
        if (Math.abs(s.dropX - top.x) <= PERFECT_TOL) {
          s.streak++;
          s.perfects++;
          s.bonus += 30 * Math.min(s.streak, 4);
          s.blocks.push({ x: top.x, w: s.w });
          s.last = { perfect: true, miss: false, cutX: 0, cutW: 0, x: top.x, w: s.w };
        } else {
          s.streak = 0;
          const nx = (lo + hi) / 2;
          const cutW = s.w - overlap;
          const cutX = s.dropX < top.x ? s.dropX - s.w / 2 + cutW / 2 : s.dropX + s.w / 2 - cutW / 2;
          s.blocks.push({ x: nx, w: overlap });
          s.w = overlap;
          s.last = { perfect: false, miss: false, cutX, cutW, x: nx, w: overlap };
        }
        s.phase = 'wait';
        s.timer = 0;
      }
    } else if (s.phase === 'wait') {
      s.timer++;
      if (s.timer >= WAIT_TICKS) {
        s.phase = 'swing';
        s.timer = 0;
      }
    }
    if (s.tick >= MAX_TICKS) s.phase = 'over';
  },
  done: (s) => s.phase === 'over',
  score,
  bot(s, skill, rng): InputFrame {
    if (s.phase !== 'swing') return { ...NEUTRAL_INPUT };
    const top = s.blocks[s.blocks.length - 1] as TowerBlock;
    // Der Block fällt nach dem Druck senkrecht: die Kranposition im Moment des Drückens ist die Landeposition.
    const sigma = lerp(1.0, 0.11, skill);
    const err = rng.gaussian() * sigma;
    return { ...NEUTRAL_INPUT, a: Math.abs(s.cx - top.x + err) < 0.12 };
  },
  hud: (s) => ({
    left: `Höhe ${heightOf(s)}`,
    right: `${score(s)} Pkt`,
    hint: s.streak >= 2 ? `Perfekt x${s.streak}!` : s.lost ? 'Verfehlt!' : s.perfects ? `${s.perfects} Perfekte` : undefined,
  }),
};
void clamp;
