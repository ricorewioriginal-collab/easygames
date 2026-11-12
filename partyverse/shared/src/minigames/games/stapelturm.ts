import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { lerp } from '../util';

/**
 * Stapelturm: Ein Kran schwingt einen Block hin und her, A (oder Klick) lässt ihn fallen.
 * Was übersteht, wird abgeschnitten; eine perfekte Landung behält die volle Breite und gibt einen Bonus,
 * drei Perfekte in Folge machen den Block wieder breiter. Jedes 5. Stockwerk ist ein Goldblock (Perfekt = +100).
 * Ab Stockwerk 8 weht Wind: der Kran wird ungleichmäßig schnell. Daneben = ein Ersatzblock weniger.
 * Koordinaten: x nach rechts in Einheiten (Blockhöhe = 1).
 */
export interface TowerBlock {
  x: number;
  w: number;
}
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
  last: {
    perfect: boolean;
    miss: boolean;
    cutX: number;
    cutW: number;
    x: number;
    w: number;
    gold: boolean;
    grow: boolean;
    gain: number;
  };
  lost: boolean;
  /** Verbleibende Ersatzblöcke */
  spares: number;
  /** Phase des Windes (Ticks) */
  wind: number;
}

export const RANGE = 5.2;
export const BASE_W = 5;
export const PERFECT_TOL = 0.14;
export const FALL_TICKS = 16;
const WAIT_TICKS = 14;
const MAX_TICKS = 30 * 60;
const MIN_W = 0.2;
export const SPARES = 2;
export const WIND_FROM = 8;
export const GOLD_EVERY = 5;
const GROW = 0.5;

export const heightOf = (s: TowerState): number => s.blocks.length - 1;
/** Kranspeed in Einheiten pro Tick bei Turmhöhe n */
export const craneSpeed = (n: number): number => lerp(3.4, 8.6, Math.min(1, n / 26)) / 60;
/** Windfaktor (1 = ruhig): ab WIND_FROM schwankt das Krantempo immer stärker */
export const windFactor = (n: number, wind: number): number =>
  n < WIND_FROM ? 1 : 1 + Math.min(0.55, 0.25 + (n - WIND_FROM) * 0.03) * Math.sin(wind * 0.045);
/** Ist das nächste Stockwerk (Höhe n + 1) ein Goldblock? */
export const isGold = (n: number): boolean => (n + 1) % GOLD_EVERY === 0;
export const score = (s: TowerState): number => heightOf(s) * 50 + s.bonus;

export const game: MiniGame<TowerState> = {
  id: 'stapelturm',
  name: 'Stapelturm',
  tagline: 'Bau den Turm bis in die Wolken!',
  instructions: [
    'Der Kran fährt hin und her – A (oder Tippen) lässt den Block fallen.',
    'Überstand wird abgeschnitten. Perfekt = volle Breite und Bonus, 3 Perfekte in Folge = wieder breiter.',
    'Jedes 5. Stockwerk ist Gold: perfekt treffen gibt +100. Später macht Wind den Kran unberechenbar.',
    'Daneben kostet einen von zwei Ersatzblöcken – danach ist Schluss.',
  ],
  controls: {
    desktop: 'Leertaste, Enter oder Mausklick: Block fallen lassen',
    touch: 'Knopf A oder irgendwo tippen: Block fallen lassen',
  },
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
      last: { perfect: false, miss: false, cutX: 0, cutW: 0, x: 0, w: 0, gold: false, grow: false, gain: 0 },
      lost: false,
      spares: SPARES,
      wind: 0,
    };
  },
  step(s, input) {
    if (s.phase === 'over') return;
    s.tick++;
    const press = (input.a || input.pd) && !s.prevA;
    s.prevA = input.a || input.pd;
    // Kran bewegt sich immer (ab WIND_FROM mit schwankendem Tempo)
    s.wind++;
    s.cx += s.dir * craneSpeed(heightOf(s)) * windFactor(heightOf(s), s.wind);
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
        const gold = isGold(heightOf(s));
        if (overlap < MIN_W) {
          s.streak = 0;
          s.spares--;
          s.last = {
            perfect: false,
            miss: true,
            cutX: s.dropX,
            cutW: s.w,
            x: s.dropX,
            w: s.w,
            gold,
            grow: false,
            gain: 0,
          };
          if (s.spares < 0) {
            s.lost = true;
            s.phase = 'over';
            return;
          }
        } else if (Math.abs(s.dropX - top.x) <= PERFECT_TOL) {
          s.streak++;
          s.perfects++;
          const gain = 30 * Math.min(s.streak, 4) + (gold ? 100 : 0);
          s.bonus += gain;
          // Drei Perfekte in Folge: Block wächst wieder
          const grow = s.streak % 3 === 0 && s.w < BASE_W;
          const w = grow ? Math.min(BASE_W, s.w + GROW) : s.w;
          s.blocks.push({ x: top.x, w });
          s.w = w;
          s.last = { perfect: true, miss: false, cutX: 0, cutW: 0, x: top.x, w, gold, grow, gain: gain + 50 };
        } else {
          s.streak = 0;
          if (gold) s.bonus += 20;
          const nx = (lo + hi) / 2;
          const cutW = s.w - overlap;
          const cutX = s.dropX < top.x ? s.dropX - s.w / 2 + cutW / 2 : s.dropX + s.w / 2 - cutW / 2;
          s.blocks.push({ x: nx, w: overlap });
          s.w = overlap;
          s.last = {
            perfect: false,
            miss: false,
            cutX,
            cutW,
            x: nx,
            w: overlap,
            gold,
            grow: false,
            gain: 50 + (gold ? 20 : 0),
          };
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
    // Wind macht es schwerer, den Moment zu treffen
    const windy = heightOf(s) >= WIND_FROM ? 1.35 : 1;
    const sigma = lerp(1.0, 0.11, skill) * windy;
    const err = rng.gaussian() * sigma;
    return { ...NEUTRAL_INPUT, a: Math.abs(s.cx - top.x + err) < 0.12 };
  },
  hud: (s) => ({
    left: `Höhe ${heightOf(s)} · Ersatz ${'▮'.repeat(Math.max(0, s.spares))}${'▯'.repeat(SPARES - Math.max(0, s.spares))}`,
    right: `${score(s)} Pkt`,
    hint: s.lost
      ? 'Kein Ersatz mehr!'
      : s.streak >= 2
        ? `Perfekt ×${s.streak}!`
        : isGold(heightOf(s))
          ? 'GOLDBLOCK – perfekt = +100'
          : heightOf(s) >= WIND_FROM
            ? 'Wind!'
            : undefined,
  }),
};
