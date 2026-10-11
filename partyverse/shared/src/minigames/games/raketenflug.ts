import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { clamp, lerp } from '../util';

/**
 * Raketenflug: Schub halten (A oder Zeiger) = steigen, sonst Schwerkraft. Fliege durch Ringtore in einer Höhle
 * mit Felsbrocken. Score = Tore × 100 + Strecke. Aufprall = ein Leben weniger (3).
 */
export interface Gate {
  x: number;
  y: number;
  /** 0 offen, 1 durchflogen, 2 verfehlt */
  st: 0 | 1 | 2;
}
export interface Rock {
  x: number;
  y: number;
  r: number;
}
export interface RocketState {
  /** Höhlenmitte und halbe Höhe an Stützstellen im Abstand CAVE_DX */
  cy: number[];
  gh: number[];
  gates: Gate[];
  rocks: Rock[];
  t: number;
  x: number;
  y: number;
  vy: number;
  thrust: boolean;
  lives: number;
  invuln: number;
  slow: number;
  nextGate: number;
  gatesPassed: number;
  gatesMissed: number;
  crashes: number;
  over: boolean;
}

export const CAVE_DX = 3;
export const RING_R = 1.5;
export const ROCKET_R = 0.4;
const DT = 1 / 60;
const TOTAL_TICKS = 30 * 60;
const A_UP = 24;
const A_DOWN = -16;
const V_MAX = 7;
const CAVE_LEN = 360;

export const speedOf = (t: number): number => 7 + 2 * Math.min(1, t / TOTAL_TICKS);

export function caveAt(arr: number[], x: number): number {
  const f = Math.max(0, x) / CAVE_DX;
  const i = Math.min(arr.length - 2, Math.floor(f));
  const k = f - i;
  return (arr[i] as number) * (1 - k) + (arr[i + 1] as number) * k;
}

function genCave(seed: number) {
  const r = new Rng((seed ^ 0x1b873593) >>> 0);
  const n = Math.floor(CAVE_LEN / CAVE_DX) + 3;
  const cy: number[] = [];
  const gh: number[] = [];
  let c = 0;
  let cv = 0;
  let prevGh = 3.6;
  for (let i = 0; i < n; i++) {
    const prog = clamp((i * CAVE_DX) / 240, 0, 1);
    if (i > 6) {
      cv = clamp(cv * 0.8 + r.float(-0.6, 0.6), -1.15, 1.15);
      c = clamp(c + cv, -3.2, 3.2);
    }
    const base = lerp(3.7, 2.7, prog) + r.float(-0.25, 0.25);
    prevGh = i < 6 ? 3.8 : (prevGh + base) / 2;
    cy.push(c);
    gh.push(Math.max(2.55, prevGh));
  }
  const gates: Gate[] = [];
  const rocks: Rock[] = [];
  for (let gx = 24; gx < CAVE_LEN - 20; gx += 14) {
    const center = caveAt(cy, gx);
    gates.push({ x: gx, y: center + r.float(-0.7, 0.7), st: 0 });
    if (r.chance(0.8)) {
      const rx = gx + 7 + r.float(-1.5, 1.5);
      const rr = r.float(0.6, 0.85);
      const side = r.chance(0.5) ? 1 : -1;
      rocks.push({ x: rx, y: caveAt(cy, rx) + side * 0.9, r: rr });
    }
  }
  return { cy, gh, gates, rocks };
}

const hash01 = (i: number): number =>
  (((Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(i + 3, 0x85ebca6b)) >>> 8) & 0xffff) / 65536;

export const game: MiniGame<RocketState> = {
  id: 'raketenflug',
  name: 'Raketenflug',
  tagline: 'Schub, Schwerkraft und glühende Ringe!',
  instructions: [
    'Halte A (oder drücke mit dem Finger/der Maus), um zu steigen – loslassen heißt fallen.',
    'Fliege durch die leuchtenden Ringe: Jedes Tor gibt 100 Punkte, die Strecke zählt auch.',
    'Weiche Felsen und den Höhlenwänden aus. Ein Aufprall kostet eines von drei Leben.',
  ],
  controls: { desktop: 'Leertaste oder Maustaste gedrückt halten = Schub', touch: 'Knopf A gedrückt halten' },
  category: 'race',
  duration: 30,
  touch: { stick: false, a: true, b: false },
  init(seed) {
    const { cy, gh, gates, rocks } = genCave(seed);
    return {
      cy,
      gh,
      gates,
      rocks,
      t: 0,
      x: 0,
      y: 0,
      vy: 0,
      thrust: false,
      lives: 3,
      invuln: 0,
      slow: 0,
      nextGate: 0,
      gatesPassed: 0,
      gatesMissed: 0,
      crashes: 0,
      over: false,
    };
  },
  step(s, input) {
    if (s.over) return;
    s.t++;
    s.thrust = !!(input.a || input.pd);
    s.vy = clamp(s.vy + (s.thrust ? A_UP : A_DOWN) * DT, -V_MAX, V_MAX);
    const prevX = s.x;
    s.y += s.vy * DT;
    s.x += speedOf(s.t) * (s.slow > 0 ? 0.45 : 1) * DT;
    if (s.slow > 0) s.slow--;
    if (s.invuln > 0) s.invuln--;
    // Tore
    const g = s.gates[s.nextGate];
    if (g && prevX < g.x && s.x >= g.x) {
      if (Math.abs(s.y - g.y) < RING_R - 0.05) {
        g.st = 1;
        s.gatesPassed++;
      } else {
        g.st = 2;
        s.gatesMissed++;
      }
      s.nextGate++;
    }
    // Kollision
    if (s.invuln <= 0) {
      const c = caveAt(s.cy, s.x);
      const h = caveAt(s.gh, s.x);
      let hit = s.y + ROCKET_R > c + h || s.y - ROCKET_R < c - h;
      if (!hit) {
        for (const rk of s.rocks) {
          if (rk.x < s.x - 2) continue;
          if (rk.x > s.x + 2) break;
          const dx = rk.x - s.x;
          const dy = rk.y - s.y;
          const rr = rk.r + ROCKET_R - 0.06;
          if (dx * dx + dy * dy < rr * rr) {
            hit = true;
            break;
          }
        }
      }
      if (hit) {
        s.lives--;
        s.crashes++;
        if (s.lives <= 0) {
          s.over = true;
          return;
        }
        s.y = c;
        s.vy = 0;
        s.invuln = 110;
        s.slow = 45;
      }
    }
    if (s.t >= TOTAL_TICKS) s.over = true;
  },
  done: (s) => s.over,
  score: (s) => s.gatesPassed * 100 + Math.floor(s.x),
  bot(s, skill, rng): InputFrame {
    if (s.over) return { ...NEUTRAL_INPUT };
    const err = 1 - skill;
    let tgt = caveAt(s.cy, s.x + 3);
    const g = s.gates[s.nextGate];
    if (g && g.x - s.x < 13) {
      tgt = g.y + (hash01(s.nextGate) - 0.5) * 2 * err * 3.4;
    }
    for (const rk of s.rocks) {
      const dx = rk.x - s.x;
      if (dx < -0.6) continue;
      if (dx > 9) break;
      if (Math.abs(tgt - rk.y) < rk.r + 1.0) {
        const c = caveAt(s.cy, rk.x);
        tgt = rk.y + (rk.y >= c ? -1 : 1) * (rk.r + 0.95);
      }
    }
    const c = caveAt(s.cy, s.x + 2);
    const h = caveAt(s.gh, s.x + 2);
    tgt = clamp(tgt, c - h + 1.0, c + h - 1.0);
    const kd = lerp(2.2, 3.6, skill);
    const acmd = 6 * (tgt - s.y) - kd * s.vy;
    let thrust = acmd > 0;
    if (rng.chance(err * 0.1)) thrust = !thrust;
    return { ...NEUTRAL_INPUT, a: thrust };
  },
  hud: (s) => ({
    left: `${s.gatesPassed} Tore · ${Math.floor(s.x)} m`,
    right: `Leben ${'♥'.repeat(Math.max(0, s.lives))}`,
    hint: s.invuln > 70 ? 'Aufprall!' : undefined,
  }),
};
