import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { approach, clamp, lerp } from '../util';

/** Raumschiff im All: Planeten ziehen mit realer Schwerkraft (1/r²) am Schiff. Orbs einsammeln, nicht abstürzen. */
export interface Planet {
  x: number;
  y: number;
  r: number;
  /** Gravitationsparameter G·M */
  gm: number;
}
export interface Orb {
  id: number;
  x: number;
  y: number;
}

export interface GraviState {
  rnd: Rng;
  tick: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Ausrichtung (Bogenmaß, 0 = +x, π/2 = oben) */
  ang: number;
  av: number;
  fuel: number;
  thrusting: boolean;
  /** Unverwundbarkeit nach dem Respawn (Ticks) */
  safe: number;
  planets: Planet[];
  orbs: Orb[];
  spawned: number;
  collected: number;
  crashes: number;
  bumps: number;
  lastPick: { x: number; y: number };
  lastCrash: { x: number; y: number };
}

export const WORLD_X = 12.5;
export const WORLD_Y = 7.5;
export const DURATION_TICKS = 1800;
export const SHIP_R = 0.3;
export const ORB_R = 0.5;
export const START = { x: 0, y: 0 };
export const THRUST = 7.5;
export const CRASH_PENALTY = 60;
export const ORB_POINTS = 100;
const FUEL_DRAIN = 0.14;
const FUEL_REGEN = 0.03;
const TURN = 3.6;
const SOFT = 0.15;
const MAX_SPEED = 13;

/** Schwerebeschleunigung am Punkt (x,y) */
export function gravityAt(planets: readonly Planet[], x: number, y: number): { x: number; y: number } {
  let gx = 0;
  let gy = 0;
  for (const p of planets) {
    const dx = p.x - x;
    const dy = p.y - y;
    const d2 = dx * dx + dy * dy + SOFT;
    const inv = p.gm / (d2 * Math.sqrt(d2));
    gx += dx * inv;
    gy += dy * inv;
  }
  return { x: gx, y: gy };
}

function makePlanets(r: Rng): Planet[] {
  const out: Planet[] = [];
  for (let tries = 0; out.length < 3 && tries < 500; tries++) {
    const rad = r.float(1.0, 1.65);
    const p = { x: r.float(-WORLD_X + 3, WORLD_X - 3), y: r.float(-WORLD_Y + 2.6, WORLD_Y - 2.6), r: rad, gm: rad * 9 };
    if (Math.hypot(p.x - START.x, p.y - START.y) < 4.6 + rad) continue;
    if (out.some((o) => Math.hypot(o.x - p.x, o.y - p.y) < o.r + rad + 4.2)) continue;
    out.push(p);
  }
  return out;
}

function spawnOrb(s: GraviState): Orb {
  const id = s.spawned++;
  for (let i = 0; i < 80; i++) {
    let x = s.rnd.float(-WORLD_X + 1, WORLD_X - 1);
    let y = s.rnd.float(-WORLD_Y + 1, WORLD_Y - 1);
    if (i % 3 !== 2 && s.planets.length) {
      // Viele Orbs kreisen nah an einem Planeten – riskant!
      const p = s.rnd.pick(s.planets);
      const a = s.rnd.float(0, Math.PI * 2);
      const d = p.r + s.rnd.float(1.2, 2.6);
      x = clamp(p.x + Math.cos(a) * d, -WORLD_X + 1, WORLD_X - 1);
      y = clamp(p.y + Math.sin(a) * d, -WORLD_Y + 1, WORLD_Y - 1);
    }
    if (Math.hypot(x - START.x, y - START.y) < 3.5) continue;
    if (s.planets.some((p) => Math.hypot(x - p.x, y - p.y) < p.r + 1.1)) continue;
    if (s.orbs.some((o) => Math.hypot(x - o.x, y - o.y) < 5)) continue;
    return { id, x, y };
  }
  return { id, x: 8, y: 5 };
}

const wrapAngle = (a: number): number => {
  let v = a;
  while (v > Math.PI) v -= Math.PI * 2;
  while (v < -Math.PI) v += Math.PI * 2;
  return v;
};

export const game: MiniGame<GraviState> = {
  id: 'gravifaenger',
  name: 'Gravitationsfänger',
  tagline: 'Nutze die Schwerkraft der Planeten und fang die Sternenorbs!',
  instructions: [
    'Dein Raumschiff dreht sich mit links/rechts. Mit A (oder vor) zündest du den Schub.',
    'Die Planeten ziehen dich an. Nutze das für Schwung, aber stürze nicht ab – das kostet Punkte und Treibstoff.',
    'Der Treibstoff ist begrenzt und füllt sich nur langsam wieder auf. Spare ihn!',
    'Jeder Orb bringt 100 Punkte, übrig gebliebener Treibstoff gibt einen Bonus.',
  ],
  controls: { desktop: 'A/D oder Pfeile = drehen, Leertaste oder Pfeil hoch = Schub', touch: 'Stick = drehen (und Schub nach oben), Knopf A = Schub' },
  category: 'physics',
  duration: 30,
  touch: { stick: true, a: true, b: false },
  init(seed) {
    const rnd = new Rng(seed ^ 0x9a1);
    const s: GraviState = {
      rnd,
      tick: 0,
      x: START.x,
      y: START.y,
      vx: 0,
      vy: 0,
      ang: Math.PI / 2,
      av: 0,
      fuel: 1,
      thrusting: false,
      safe: 0,
      planets: makePlanets(rnd),
      orbs: [],
      spawned: 0,
      collected: 0,
      crashes: 0,
      bumps: 0,
      lastPick: { x: 0, y: 0 },
      lastCrash: { x: 0, y: 0 },
    };
    while (s.orbs.length < 3) s.orbs.push(spawnOrb(s));
    return s;
  },
  step(s, input) {
    if (s.tick >= DURATION_TICKS) return;
    s.tick++;
    if (s.safe > 0) s.safe--;
    const ix = clamp(Number.isFinite(input.x) ? input.x : 0, -1, 1);
    const iy = clamp(Number.isFinite(input.y) ? input.y : 0, -1, 1);
    s.av = approach(s.av, -ix * TURN, 28 / 60);
    s.ang = wrapAngle(s.ang + s.av / 60);
    const wantThrust = (input.a || iy > 0.4) && s.fuel > 0;
    s.thrusting = wantThrust;
    if (wantThrust) s.fuel = Math.max(0, s.fuel - FUEL_DRAIN / 60);
    else s.fuel = Math.min(1, s.fuel + FUEL_REGEN / 60);
    // Zwei Teilschritte pro Tick für saubere Bahnen nahe an Planeten
    for (let k = 0; k < 2; k++) {
      const h = 1 / 120;
      const g = gravityAt(s.planets, s.x, s.y);
      const tx = wantThrust ? Math.cos(s.ang) * THRUST : 0;
      const ty = wantThrust ? Math.sin(s.ang) * THRUST : 0;
      s.vx += (g.x + tx) * h;
      s.vy += (g.y + ty) * h;
      const sp = Math.hypot(s.vx, s.vy);
      if (sp > MAX_SPEED) {
        s.vx *= MAX_SPEED / sp;
        s.vy *= MAX_SPEED / sp;
      }
      s.x += s.vx * h;
      s.y += s.vy * h;
    }
    // Rand: sanft zurückfedern
    if (Math.abs(s.x) > WORLD_X) {
      s.x = clamp(s.x, -WORLD_X, WORLD_X);
      s.vx *= -0.5;
      s.bumps++;
    }
    if (Math.abs(s.y) > WORLD_Y) {
      s.y = clamp(s.y, -WORLD_Y, WORLD_Y);
      s.vy *= -0.5;
      s.bumps++;
    }
    // Absturz
    if (s.safe === 0) {
      for (const p of s.planets) {
        if (Math.hypot(s.x - p.x, s.y - p.y) < p.r + SHIP_R * 0.7) {
          s.crashes++;
          s.lastCrash = { x: s.x, y: s.y };
          s.fuel = Math.max(0, s.fuel - 0.2);
          s.x = START.x;
          s.y = START.y;
          s.vx = 0;
          s.vy = 0;
          s.ang = Math.PI / 2;
          s.av = 0;
          s.safe = 100;
          break;
        }
      }
    }
    // Orbs
    for (let i = 0; i < s.orbs.length; i++) {
      const o = s.orbs[i]!;
      if (Math.hypot(o.x - s.x, o.y - s.y) < SHIP_R + ORB_R) {
        s.collected++;
        s.lastPick = { x: o.x, y: o.y };
        s.orbs.splice(i, 1);
        s.orbs.push(spawnOrb(s));
        break;
      }
    }
  },
  done: (s) => s.tick >= DURATION_TICKS,
  score: (s) => Math.max(0, s.collected * ORB_POINTS + (s.collected > 0 ? Math.round(s.fuel * 60) : 0) - s.crashes * CRASH_PENALTY),
  bot(s, skill, rng): InputFrame {
    const horizon = Math.round(lerp(5, 30, skill)); // Vorausschau in Schritten à 0.05 s
    const margin = lerp(0, 0.5, skill);
    // Ziel: nächster Orb (mit Aufschlag, wenn er nahe an einem Planeten liegt)
    let target: Orb | null = null;
    let best = Infinity;
    for (const o of s.orbs) {
      let c = Math.hypot(o.x - s.x, o.y - s.y);
      if (skill > 0.3) for (const p of s.planets) if (Math.hypot(o.x - p.x, o.y - p.y) < p.r + 2) c += 1.2;
      if (c < best) {
        best = c;
        target = o;
      }
    }
    if (!target) return { ...NEUTRAL_INPUT };
    const g = gravityAt(s.planets, s.x, s.y);
    const dx = target.x - s.x;
    const dy = target.y - s.y;
    const d = Math.hypot(dx, dy) || 1;
    const vcap = lerp(2.4, 5.5, skill);
    const vwant = Math.min(vcap, d * 2);
    let ax = (dx / d) * vwant - s.vx;
    let ay = (dy / d) * vwant - s.vy;
    ax *= 1.8;
    ay *= 1.8;
    ax -= g.x * lerp(0.2, 0.95, skill);
    ay -= g.y * lerp(0.2, 0.95, skill);
    // Kollisionsvorhersage (nur Schwerkraft, grob)
    let px = s.x;
    let py = s.y;
    let pvx = s.vx;
    let pvy = s.vy;
    let danger: Planet | null = null;
    let dangerT = 0;
    for (let i = 1; i <= horizon && !danger; i++) {
      const gg = gravityAt(s.planets, px, py);
      pvx += gg.x * 0.05;
      pvy += gg.y * 0.05;
      px += pvx * 0.05;
      py += pvy * 0.05;
      for (const p of s.planets) {
        if (Math.hypot(px - p.x, py - p.y) < p.r + margin + 0.3) {
          danger = p;
          dangerT = i;
          break;
        }
      }
    }
    let urgent = false;
    if (danger && s.safe === 0) {
      // Vom Planeten wegschieben: radial nach außen, plus Tangentialanteil beibehalten
      const rx = s.x - danger.x;
      const ry = s.y - danger.y;
      const rl = Math.hypot(rx, ry) || 1;
      const k = 6 * (1 - dangerT / (horizon + 1)) + 2;
      ax = (rx / rl) * k + ax * 0.3;
      ay = (ry / rl) * k + ay * 0.3;
      urgent = true;
    }
    const am = Math.hypot(ax, ay);
    // Ohne nennenswerten Bedarf zum Ziel hin ausrichten, statt auf Rauschen zu reagieren
    const aim = am > lerp(2.4, 1.1, skill) || urgent ? Math.atan2(ay, ax) : Math.atan2(dy, dx);
    const want = aim + rng.gaussian() * (1 - skill) * 0.5;
    const err = wrapAngle(want - s.ang);
    const thrMin = urgent ? 0.8 : lerp(2.4, 2.2, skill);
    const thrust = am > thrMin && Math.abs(err) < lerp(1.0, 0.35, skill) && s.fuel > 0.02;
    return { ...NEUTRAL_INPUT, x: clamp(-err * lerp(1.5, 3, skill), -1, 1), a: thrust };
  },
  hud: (s) => ({
    left: `${s.collected} Orbs`,
    right: `${Math.max(0, Math.ceil((DURATION_TICKS - s.tick) / 60))} s`,
    hint: s.safe > 70 ? 'Absturz! Neustart …' : s.fuel < 0.15 ? 'Treibstoff fast leer!' : undefined,
  }),
};
