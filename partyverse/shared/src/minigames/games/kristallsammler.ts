import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { approach, clamp, lerp } from '../util';

/** Draufsicht-Arena: Kristalle einsammeln (1/3/5 Punkte), Bomben-Kristalle meiden, mit A kurz sprinten. */
export interface Crystal {
  id: number;
  kind: 'crystal' | 'bomb';
  value: number;
  x: number;
  y: number;
  /** Erscheinen / Verschwinden (Ticks) */
  t0: number;
  t1: number;
  taken: boolean;
}

export interface KristallState {
  tick: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Blickrichtung (Bogenmaß, 0 = +x) */
  face: number;
  stamina: number;
  exhausted: boolean;
  sprinting: boolean;
  /** Restliche Betäubung (Ticks) */
  stun: number;
  points: number;
  pickups: number;
  bombHits: number;
  lastPick: { x: number; y: number; value: number };
  lastHit: { x: number; y: number };
  items: Crystal[];
}

export const ARENA_X = 6.5;
export const ARENA_Y = 6;
export const DURATION_TICKS = 1500;
export const BOMB_ARM_TICKS = 40;
const SPEED = 4.8;
const SPRINT_SPEED = 8.2;
const PICK_R = 0.98;
const BOMB_R = 0.88;
const STUN_TICKS = 66;
const BOMB_PENALTY = 4;
const HOME_R = 1.7;

function randPos(r: Rng): { x: number; y: number } {
  for (let i = 0; i < 30; i++) {
    const x = r.float(-ARENA_X + 0.8, ARENA_X - 0.8);
    const y = r.float(-ARENA_Y + 0.8, ARENA_Y - 0.8);
    if (x * x + y * y > HOME_R * HOME_R) return { x, y };
  }
  return { x: 4, y: 3 };
}

/** Erzeugt den kompletten Erscheinungsplan der Welt aus dem Seed (für alle Spieler identisch). */
export function makeSchedule(seed: number): Crystal[] {
  const r = new Rng(seed ^ 0x51ed);
  const items: Crystal[] = [];
  let id = 0;
  for (let t = 20; t < DURATION_TICKS - 60; t += Math.round(r.float(14, 24))) {
    const roll = r.next();
    const value = roll < 0.58 ? 1 : roll < 0.87 ? 3 : 5;
    const p = randPos(r);
    items.push({
      id: id++,
      kind: 'crystal',
      value,
      x: p.x,
      y: p.y,
      t0: t,
      t1: t + (value === 1 ? 250 : 210),
      taken: false,
    });
  }
  for (let t = 90; t < DURATION_TICKS - 60; t += Math.round(r.float(55, 95))) {
    let p = randPos(r);
    // Manche Bomben lauern bei einem wertvollen Kristall
    if (r.chance(0.4)) {
      const rich = items.filter((c) => c.kind === 'crystal' && c.value >= 3 && c.t0 <= t && c.t1 > t);
      const c = rich.length ? r.pick(rich) : null;
      if (c) {
        const a = r.float(0, Math.PI * 2);
        const q = {
          x: clamp(c.x + Math.cos(a) * 1.5, -ARENA_X + 0.7, ARENA_X - 0.7),
          y: clamp(c.y + Math.sin(a) * 1.5, -ARENA_Y + 0.7, ARENA_Y - 0.7),
        };
        if (q.x * q.x + q.y * q.y > HOME_R * HOME_R) p = q;
      }
    }
    items.push({
      id: id++,
      kind: 'bomb',
      value: -BOMB_PENALTY,
      x: p.x,
      y: p.y,
      t0: t,
      t1: t + 420,
      taken: false,
    });
  }
  items.sort((a, b) => a.t0 - b.t0 || a.id - b.id);
  return items;
}

export const isActive = (c: Crystal, tick: number): boolean => !c.taken && tick >= c.t0 && tick < c.t1;
export const isArmed = (c: Crystal, tick: number): boolean => tick >= c.t0 + BOMB_ARM_TICKS;

export const game: MiniGame<KristallState> = {
  id: 'kristallsammler',
  name: 'Kristallsammler',
  tagline: 'Sammle funkelnde Kristalle – Bomben bringen dich zum Taumeln!',
  instructions: [
    'Laufe über die Plattform und sammle Kristalle ein: Blau zählt 1, Grün 3 und Gold 5 Punkte.',
    'Schwarze Bomben-Kristalle betäuben dich kurz und kosten Punkte. Weiche ihnen aus!',
    'Mit A sprintest du ein Stück – aber die Ausdauerleiste leert sich schnell.',
    'Kristalle verschwinden nach einigen Sekunden wieder. Wer die meisten Punkte holt, gewinnt.',
  ],
  controls: {
    desktop: 'WASD oder Pfeile = laufen, Leertaste = Sprint',
    touch: 'Stick = laufen, Knopf A = Sprint',
  },
  category: 'collect',
  duration: 25,
  touch: { stick: true, a: true, b: false },
  init(seed) {
    return {
      tick: 0,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      face: Math.PI / 2,
      stamina: 1,
      exhausted: false,
      sprinting: false,
      stun: 0,
      points: 0,
      pickups: 0,
      bombHits: 0,
      lastPick: { x: 0, y: 0, value: 0 },
      lastHit: { x: 0, y: 0 },
      items: makeSchedule(seed),
    };
  },
  step(s, input) {
    if (s.tick >= DURATION_TICKS) return;
    s.tick++;
    let ix = clamp(Number.isFinite(input.x) ? input.x : 0, -1, 1);
    let iy = clamp(Number.isFinite(input.y) ? input.y : 0, -1, 1);
    const len = Math.hypot(ix, iy);
    if (len > 1) {
      ix /= len;
      iy /= len;
    }
    if (s.stun > 0) {
      s.stun--;
      ix = 0;
      iy = 0;
    }
    // Sprint
    const moving = len > 0.15;
    if (s.exhausted && s.stamina > 0.3) s.exhausted = false;
    s.sprinting = input.a && moving && !s.exhausted && s.stamina > 0 && s.stun === 0;
    if (s.sprinting) {
      s.stamina = Math.max(0, s.stamina - 0.85 / 60);
      if (s.stamina <= 0) {
        s.exhausted = true;
        s.sprinting = false;
      }
    } else {
      s.stamina = Math.min(1, s.stamina + (input.a ? 0.12 : 0.34) / 60);
    }
    const sp = s.sprinting ? SPRINT_SPEED : SPEED;
    s.vx = approach(s.vx, ix * sp, 48 / 60);
    s.vy = approach(s.vy, iy * sp, 48 / 60);
    s.x = clamp(s.x + s.vx / 60, -ARENA_X + 0.4, ARENA_X - 0.4);
    s.y = clamp(s.y + s.vy / 60, -ARENA_Y + 0.4, ARENA_Y - 0.4);
    if (Math.hypot(s.vx, s.vy) > 0.6) s.face = Math.atan2(s.vy, s.vx);
    // Einsammeln
    for (const c of s.items) {
      if (c.t0 > s.tick) break;
      if (!isActive(c, s.tick)) continue;
      const d = Math.hypot(c.x - s.x, c.y - s.y);
      if (c.kind === 'crystal') {
        if (d < PICK_R) {
          c.taken = true;
          s.points += c.value;
          s.pickups++;
          s.lastPick = { x: c.x, y: c.y, value: c.value };
        }
      } else if (isArmed(c, s.tick) && d < BOMB_R && s.stun === 0) {
        c.taken = true;
        s.points = Math.max(0, s.points - BOMB_PENALTY);
        s.bombHits++;
        s.stun = STUN_TICKS;
        s.vx *= 0.2;
        s.vy *= 0.2;
        s.lastHit = { x: c.x, y: c.y };
      }
    }
  },
  done: (s) => s.tick >= DURATION_TICKS,
  score: (s) => Math.max(0, s.points),
  bot(s, skill, rng): InputFrame {
    if (s.stun > 0) return { ...NEUTRAL_INPUT };
    const delay = lerp(75, 8, skill);
    const aware = skill > 0.25;
    let best: Crystal | null = null;
    let bestVal = -Infinity;
    for (const c of s.items) {
      if (c.t0 > s.tick) break;
      if (c.kind !== 'crystal' || !isActive(c, s.tick) || s.tick - c.t0 < delay) continue;
      const d = Math.hypot(c.x - s.x, c.y - s.y);
      if (s.tick + (d / SPEED) * 60 > c.t1 - 5) continue;
      let val = lerp(1, c.value, 0.1 + 0.9 * skill) / (d + 1.3);
      if (aware) {
        for (const b of s.items) {
          if (b.t0 > s.tick + 30) break;
          if (b.kind !== 'bomb' || b.taken || s.tick >= b.t1) continue;
          // Abstand der Bombe zur Laufstrecke
          const dx = c.x - s.x;
          const dy = c.y - s.y;
          const l2 = dx * dx + dy * dy || 1;
          const u = clamp(((b.x - s.x) * dx + (b.y - s.y) * dy) / l2, 0, 1);
          const dd = Math.hypot(b.x - (s.x + dx * u), b.y - (s.y + dy * u));
          if (dd < 1.15) val *= 0.15;
        }
      }
      if (val > bestVal) {
        bestVal = val;
        best = c;
      }
    }
    if (!best) return { ...NEUTRAL_INPUT };
    let dx = best.x - s.x;
    let dy = best.y - s.y;
    const d = Math.hypot(dx, dy) || 1;
    dx /= d;
    dy /= d;
    // Bomben ausweichen (seitlich wegdrücken)
    if (aware) {
      for (const b of s.items) {
        if (b.t0 > s.tick + 20) break;
        if (b.kind !== 'bomb' || b.taken || s.tick >= b.t1) continue;
        const bd = Math.hypot(b.x - s.x, b.y - s.y);
        if (bd < 1.9 && bd > 0.01) {
          const k = ((1.9 - bd) / 1.9) * (0.6 + skill * 1.6);
          dx -= ((b.x - s.x) / bd) * k;
          dy -= ((b.y - s.y) / bd) * k;
        }
      }
    }
    const a = Math.atan2(dy, dx) + rng.gaussian() * (1 - skill) * 0.28;
    const mag = Math.min(1, Math.hypot(dx, dy));
    return {
      ...NEUTRAL_INPUT,
      x: Math.cos(a) * mag,
      y: Math.sin(a) * mag,
      a: skill > 0.35 && d > 3.6 && s.stamina > 0.35 && !s.exhausted,
    };
  },
  hud: (s) => ({
    left: `${s.points} Punkte`,
    right: `${Math.max(0, Math.ceil((DURATION_TICKS - s.tick) / 60))} s`,
    hint: s.stun > 0 ? 'Betäubt!' : s.exhausted ? 'Ausdauer leer' : undefined,
  }),
};
