import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { clamp, lerp } from '../util';

/** Rutschpartie auf dem Eis: Sterne einsammeln, Wasserlöcher meiden. Mit wenig Reibung steuert man nur mit Gefühl. */
export interface Hole {
  /** Mittelpunkt (bei beweglichen Löchern die Ruhelage) */
  x: number;
  y: number;
  r: number;
  /** Schwingung: Amplitude (Welt-Einheiten) in Richtung (dx,dy), Kreisfrequenz, Phase */
  ax: number;
  ay: number;
  w: number;
  ph: number;
}
export interface IceStar {
  id: number;
  x: number;
  y: number;
  value: number;
}

export interface EisState {
  rnd: Rng;
  tick: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  face: number;
  braking: boolean;
  /** Ticks, die man nach einem Sturz am Start festsitzt (Zeitverlust) */
  respawn: number;
  holes: Hole[];
  stars: IceStar[];
  spawned: number;
  starPts: number;
  starCount: number;
  falls: number;
  bumps: number;
  lastPick: { x: number; y: number; value: number };
  lastFall: { x: number; y: number };
}

export const ARENA_X = 8.8;
export const ARENA_Y = 5.8;
export const DURATION_TICKS = 1800;
export const RESPAWN_TICKS = 100;
export const FALL_PENALTY = 80;
export const STAR_POINTS = 100;
const ACCEL = 15;
const MAX_SPEED = 9.5;
const FRICTION = 0.991;
const BRAKE_FRICTION = 0.9;
const START = { x: 0, y: 0 };

export function holePos(h: Hole, tick: number): { x: number; y: number } {
  const s = Math.sin(h.ph + (h.w * tick) / 60);
  return { x: h.x + h.ax * s, y: h.y + h.ay * s };
}
/** Geschwindigkeit eines beweglichen Lochs (Welt-Einheiten pro Sekunde) */
export function holeVel(h: Hole, tick: number): { x: number; y: number } {
  const c = Math.cos(h.ph + (h.w * tick) / 60) * h.w;
  return { x: h.ax * c, y: h.ay * c };
}

function makeHoles(r: Rng): Hole[] {
  const holes: Hole[] = [];
  const want = 7;
  for (let tries = 0; holes.length < want && tries < 400; tries++) {
    const moving = holes.length >= want - 3;
    const rad = r.float(1.05, 1.55);
    const dir = r.chance(0.5);
    const amp = moving ? r.float(1.3, 2.1) : 0;
    const h: Hole = {
      x: r.float(-ARENA_X + 2.4, ARENA_X - 2.4),
      y: r.float(-ARENA_Y + 2.2, ARENA_Y - 2.2),
      r: rad,
      ax: dir ? amp : 0,
      ay: dir ? 0 : amp,
      w: r.float(0.7, 1.1),
      ph: r.float(0, Math.PI * 2),
    };
    const reach = rad + amp;
    if (Math.hypot(h.x - START.x, h.y - START.y) < reach + 2.8) continue;
    if (holes.some((o) => Math.hypot(o.x - h.x, o.y - h.y) < o.r + Math.hypot(o.ax, o.ay) + reach + 2.2))
      continue;
    holes.push(h);
  }
  return holes;
}

function spawnStar(s: EisState): IceStar {
  const id = s.spawned++;
  const golden = id % 5 === 4;
  for (let i = 0; i < 80; i++) {
    let x = s.rnd.float(-ARENA_X + 0.9, ARENA_X - 0.9);
    let y = s.rnd.float(-ARENA_Y + 0.9, ARENA_Y - 0.9);
    if (i % 2 === 0 && s.holes.length) {
      // Viele Sterne locken direkt am Lochrand
      const h = s.rnd.pick(s.holes);
      const a = s.rnd.float(0, Math.PI * 2);
      const d = h.r + Math.hypot(h.ax, h.ay) + s.rnd.float(1.05, 1.8);
      x = clamp(h.x + Math.cos(a) * d, -ARENA_X + 0.9, ARENA_X - 0.9);
      y = clamp(h.y + Math.sin(a) * d, -ARENA_Y + 0.9, ARENA_Y - 0.9);
    }
    if (Math.hypot(x - START.x, y - START.y) < 2.2) continue;
    if (s.holes.some((h) => Math.hypot(x - h.x, y - h.y) < h.r + Math.hypot(h.ax, h.ay) + 0.9)) continue;
    if (s.stars.some((o) => Math.hypot(x - o.x, y - o.y) < 1.6)) continue;
    return { id, x, y, value: golden ? 3 : 1 };
  }
  return { id, x: 5.5, y: 3, value: 1 };
}

export const game: MiniGame<EisState> = {
  id: 'eisrutsche',
  name: 'Eisrutsche',
  tagline: 'Rutsch, sammle Sterne und tauche nicht ab!',
  instructions: [
    'Du bist ein Pinguin auf glattem Eis: Steuern beschleunigt dich, aber du rutschst weiter.',
    'Sammle möglichst viele Sterne – goldene zählen dreifach.',
    'Wer in ein Wasserloch rutscht, landet wieder am Start, verliert Zeit und Punkte.',
    'Halte A gedrückt, um zu bremsen und die Krallen ins Eis zu schlagen.',
  ],
  controls: {
    desktop: 'WASD oder Pfeile = beschleunigen, Leertaste = bremsen',
    touch: 'Stick = beschleunigen, Knopf A = bremsen',
  },
  category: 'physics',
  duration: 30,
  touch: { stick: true, a: true, b: false },
  init(seed) {
    const rnd = new Rng(seed ^ 0x1ce);
    const holes = makeHoles(rnd);
    const s: EisState = {
      rnd,
      tick: 0,
      x: START.x,
      y: START.y,
      vx: 0,
      vy: 0,
      face: -Math.PI / 2,
      braking: false,
      respawn: 0,
      holes,
      stars: [],
      spawned: 0,
      starPts: 0,
      starCount: 0,
      falls: 0,
      bumps: 0,
      lastPick: { x: 0, y: 0, value: 0 },
      lastFall: { x: 0, y: 0 },
    };
    while (s.stars.length < 5) s.stars.push(spawnStar(s));
    return s;
  },
  step(s, input) {
    if (s.tick >= DURATION_TICKS) return;
    s.tick++;
    s.braking = false;
    if (s.respawn > 0) {
      s.respawn--;
      s.vx = 0;
      s.vy = 0;
      s.x = START.x;
      s.y = START.y;
      return;
    }
    let ix = clamp(Number.isFinite(input.x) ? input.x : 0, -1, 1);
    let iy = clamp(Number.isFinite(input.y) ? input.y : 0, -1, 1);
    const len = Math.hypot(ix, iy);
    if (len > 1) {
      ix /= len;
      iy /= len;
    }
    s.braking = input.a;
    const k = s.braking ? 0.45 : 1;
    s.vx += (ix * ACCEL * k) / 60;
    s.vy += (iy * ACCEL * k) / 60;
    const f = s.braking ? BRAKE_FRICTION : FRICTION;
    s.vx *= f;
    s.vy *= f;
    const sp = Math.hypot(s.vx, s.vy);
    if (sp > MAX_SPEED) {
      s.vx *= MAX_SPEED / sp;
      s.vy *= MAX_SPEED / sp;
    }
    s.x += s.vx / 60;
    s.y += s.vy / 60;
    // Bande: federt zurück
    const m = 0.45;
    if (s.x > ARENA_X - m || s.x < -ARENA_X + m) {
      s.x = clamp(s.x, -ARENA_X + m, ARENA_X - m);
      if (Math.abs(s.vx) > 2.5) s.bumps++;
      s.vx *= -0.55;
    }
    if (s.y > ARENA_Y - m || s.y < -ARENA_Y + m) {
      s.y = clamp(s.y, -ARENA_Y + m, ARENA_Y - m);
      if (Math.abs(s.vy) > 2.5) s.bumps++;
      s.vy *= -0.55;
    }
    if (Math.hypot(s.vx, s.vy) > 0.5) s.face = Math.atan2(s.vy, s.vx);
    // Löcher
    for (const h of s.holes) {
      const p = holePos(h, s.tick);
      if (Math.hypot(s.x - p.x, s.y - p.y) < h.r - 0.05) {
        s.falls++;
        s.lastFall = { x: p.x, y: p.y };
        s.respawn = RESPAWN_TICKS;
        s.vx = 0;
        s.vy = 0;
        s.x = START.x;
        s.y = START.y;
        return;
      }
    }
    // Sterne
    for (let i = 0; i < s.stars.length; i++) {
      const st = s.stars[i]!;
      if (Math.hypot(st.x - s.x, st.y - s.y) < 0.95) {
        s.starPts += st.value;
        s.starCount++;
        s.lastPick = { x: st.x, y: st.y, value: st.value };
        s.stars.splice(i, 1);
        s.stars.push(spawnStar(s));
        break;
      }
    }
  },
  done: (s) => s.tick >= DURATION_TICKS,
  score: (s) => Math.max(0, s.starPts * STAR_POINTS - s.falls * FALL_PENALTY),
  bot(s, skill, rng): InputFrame {
    if (s.respawn > 0) return { ...NEUTRAL_INPUT };
    const look = lerp(0.15, 0.7, skill);
    const margin = lerp(0.1, 0.85, skill);
    const cap = lerp(2.6, 8.2, skill);
    const hp = s.holes.map((h) => {
      const p = holePos(h, s.tick);
      return { x: p.x, y: p.y, r: h.r, reach: h.r + Math.hypot(h.ax, h.ay) };
    });
    // Ziel wählen: nah, wertvoll und nicht in der Nähe von Löchern/auf gefährlicher Strecke
    let best: IceStar | null = null;
    let bestCost = Infinity;
    for (const st of s.stars) {
      const d = Math.hypot(st.x - s.x, st.y - s.y);
      let cost = d - (st.value > 1 ? 2.2 * (0.3 + skill) : 0);
      for (const h of hp) {
        const dx = st.x - s.x;
        const dy = st.y - s.y;
        const l2 = dx * dx + dy * dy || 1;
        const u = clamp(((h.x - s.x) * dx + (h.y - s.y) * dy) / l2, 0, 1);
        const dd = Math.hypot(h.x - (s.x + dx * u), h.y - (s.y + dy * u));
        if (dd < h.reach + 0.5) cost += skill > 0.3 ? 5 : 1.5;
      }
      if (cost < bestCost) {
        bestCost = cost;
        best = st;
      }
    }
    if (!best) return { ...NEUTRAL_INPUT };
    const dx = best.x - s.x;
    const dy = best.y - s.y;
    const d = Math.hypot(dx, dy) || 1;
    const vwant = clamp(d * lerp(0.9, 1.8, skill), 0, cap);
    let ax = (dx / d) * vwant - s.vx;
    let ay = (dy / d) * vwant - s.vy;
    ax *= 1.6;
    ay *= 1.6;
    // Löcher meiden: von der vorausberechneten Position wegschieben
    let danger = false;
    for (const h of hp) {
      const fx = s.x + s.vx * look;
      const fy = s.y + s.vy * look;
      for (const [qx, qy] of [
        [s.x, s.y],
        [fx, fy],
      ] as const) {
        const hd = Math.hypot(qx - h.x, qy - h.y);
        const lim = h.r + margin;
        if (hd < lim && hd > 0.01) {
          const k = ((lim - hd) / lim) * 9;
          ax += ((qx - h.x) / hd) * k;
          ay += ((qy - h.y) / hd) * k;
          danger = true;
        }
      }
    }
    const m = Math.hypot(ax, ay);
    if (m > 1) {
      ax /= m;
      ay /= m;
    }
    ax += rng.gaussian() * (1 - skill) * 0.25;
    ay += rng.gaussian() * (1 - skill) * 0.25;
    const sp = Math.hypot(s.vx, s.vy);
    const toward = (s.vx * dx + s.vy * dy) / (sp * d + 1e-6);
    const brake = skill > 0.25 && ((d < 2.4 && sp > 4.5 && toward > 0.5) || (danger && sp > 5.5));
    return { ...NEUTRAL_INPUT, x: ax, y: ay, a: brake };
  },
  hud: (s) => ({
    left: `${s.starCount} Sterne`,
    right: `${Math.max(0, Math.ceil((DURATION_TICKS - s.tick) / 60))} s`,
    hint: s.respawn > 0 ? 'Eingetaucht! Zurück zum Start …' : s.braking ? 'Bremsen' : undefined,
  }),
};
