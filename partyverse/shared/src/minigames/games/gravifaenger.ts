import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { approach, clamp, lerp } from '../util';

/**
 * Gravitationsfänger: Ufo im All, Planeten ziehen mit echter Schwerkraft (1/r²). Orbs einsammeln, nicht abstürzen.
 * Steuerung direkt: Stick/Pfeile geben die Schubrichtung vor, A zündet den Turbo (verbraucht Energie).
 * Orbs schnell hintereinander geben eine Kette (mehr Punkte). Phasen: ruhig → Kometenschauer → Supernova
 * (stärkere Schwerkraft, Orbs zählen doppelt). Quadratisches Feld, damit es im Hoch- und Querformat passt.
 */
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
  /** goldener Orb kreist um einen Planeten (Index), sonst -1 */
  planet: number;
  orbitR: number;
  orbitA: number;
  orbitW: number;
}
export interface Comet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface GraviState {
  rnd: Rng;
  /** eigener Zufall für Kometen: für alle Spieler gleich */
  crnd: Rng;
  tick: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Ausrichtung (Bogenmaß, 0 = +x, π/2 = oben) */
  ang: number;
  /** Energie für den Turbo (0..1) */
  fuel: number;
  thrusting: boolean;
  boosting: boolean;
  /** Unverwundbarkeit nach dem Respawn (Ticks) */
  safe: number;
  planets: Planet[];
  orbs: Orb[];
  comets: Comet[];
  nextComet: number;
  cometId: number;
  spawned: number;
  collected: number;
  golds: number;
  crashes: number;
  bumps: number;
  points: number;
  /** Kette: Anzahl Orbs in Folge, Ticks seit dem letzten */
  chain: number;
  chainT: number;
  bestChain: number;
  lastPick: { x: number; y: number; pts: number; gold: boolean; chain: number };
  lastCrash: { x: number; y: number };
}

export const WORLD_X = 9.5;
export const WORLD_Y = 9.5;
export const DURATION_TICKS = 1800;
export const SHIP_R = 0.32;
export const ORB_R = 0.5;
export const COMET_R = 0.42;
export const START = { x: 0, y: 0 };
export const THRUST = 8.5;
export const BOOST = 2;
export const CRASH_PENALTY = 80;
export const ORB_POINTS = 100;
export const GOLD_POINTS = 250;
/** Zeitfenster für die Kette (Ticks) */
export const CHAIN_TICKS = 180;
export const COMET_TICK = 10 * 60;
export const NOVA_TICK = 20 * 60;
const FUEL_DRAIN = 0.55;
const FUEL_REGEN = 0.12;
const TURN = 9;
const SOFT = 0.15;
const MAX_SPEED = 12;

/** Phase: 0 ruhig, 1 Kometen, 2 Supernova */
export const phaseOf = (tick: number): 0 | 1 | 2 => (tick >= NOVA_TICK ? 2 : tick >= COMET_TICK ? 1 : 0);
const gravK = (tick: number): number => (tick >= NOVA_TICK ? 1.4 : 1);

/** Schwerebeschleunigung am Punkt (x,y) */
export function gravityAt(planets: readonly Planet[], x: number, y: number, k = 1): { x: number; y: number } {
  let gx = 0;
  let gy = 0;
  for (const p of planets) {
    const dx = p.x - x;
    const dy = p.y - y;
    const d2 = dx * dx + dy * dy + SOFT;
    const inv = (p.gm * k) / (d2 * Math.sqrt(d2));
    gx += dx * inv;
    gy += dy * inv;
  }
  return { x: gx, y: gy };
}

function makePlanets(r: Rng): Planet[] {
  const out: Planet[] = [];
  for (let tries = 0; out.length < 3 && tries < 800; tries++) {
    const rad = r.float(0.9, 1.35);
    const p = {
      x: r.float(-WORLD_X + 2.4, WORLD_X - 2.4),
      y: r.float(-WORLD_Y + 2.4, WORLD_Y - 2.4),
      r: rad,
      gm: rad * 8,
    };
    if (Math.hypot(p.x - START.x, p.y - START.y) < 3.6 + rad) continue;
    if (out.some((o) => Math.hypot(o.x - p.x, o.y - p.y) < o.r + rad + 3.8)) continue;
    out.push(p);
  }
  return out;
}

function orbPos(s: GraviState, o: Orb): void {
  if (o.planet < 0) return;
  const p = s.planets[o.planet] as Planet;
  o.x = p.x + Math.cos(o.orbitA) * o.orbitR;
  o.y = p.y + Math.sin(o.orbitA) * o.orbitR;
}

function spawnOrb(s: GraviState): Orb {
  const id = s.spawned++;
  // jeder vierte Orb ist golden und kreist eng um einen Planeten (riskant, aber wertvoll)
  if (id % 4 === 3 && s.planets.length) {
    const pi = s.rnd.int(s.planets.length);
    const p = s.planets[pi] as Planet;
    const o: Orb = {
      id,
      x: 0,
      y: 0,
      planet: pi,
      orbitR: p.r + s.rnd.float(1.0, 1.5),
      orbitA: s.rnd.float(0, Math.PI * 2),
      orbitW: (s.rnd.chance(0.5) ? 1 : -1) * s.rnd.float(0.012, 0.02),
    };
    orbPos(s, o);
    return o;
  }
  for (let i = 0; i < 80; i++) {
    let x = s.rnd.float(-WORLD_X + 1, WORLD_X - 1);
    let y = s.rnd.float(-WORLD_Y + 1, WORLD_Y - 1);
    if (i % 3 !== 2 && s.planets.length) {
      const p = s.rnd.pick(s.planets);
      const a = s.rnd.float(0, Math.PI * 2);
      const d = p.r + s.rnd.float(1.4, 3);
      x = clamp(p.x + Math.cos(a) * d, -WORLD_X + 1, WORLD_X - 1);
      y = clamp(p.y + Math.sin(a) * d, -WORLD_Y + 1, WORLD_Y - 1);
    }
    if (Math.hypot(x - s.x, y - s.y) < 3) continue;
    if (s.planets.some((p) => Math.hypot(x - p.x, y - p.y) < p.r + 1.1)) continue;
    if (s.orbs.some((o) => Math.hypot(x - o.x, y - o.y) < 4)) continue;
    return { id, x, y, planet: -1, orbitR: 0, orbitA: 0, orbitW: 0 };
  }
  return { id, x: 6, y: 5, planet: -1, orbitR: 0, orbitA: 0, orbitW: 0 };
}

function spawnComet(s: GraviState): void {
  const r = s.crnd;
  const side = r.int(4);
  const along = r.float(-WORLD_X + 1, WORLD_X - 1);
  const sp = lerp(5, 7.5, clamp((s.tick - COMET_TICK) / 1200, 0, 1)) * r.float(0.85, 1.15);
  const aim = r.float(-0.5, 0.5);
  const e = WORLD_X + 1.5;
  const [x, y, a] =
    side === 0
      ? [-e, along, aim]
      : side === 1
        ? [e, along, Math.PI + aim]
        : side === 2
          ? [along, -e, Math.PI / 2 + aim]
          : [along, e, -Math.PI / 2 + aim];
  s.comets.push({ id: s.cometId++, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp });
  s.nextComet =
    s.tick + Math.round(lerp(80, 45, clamp((s.tick - COMET_TICK) / 1200, 0, 1)) * r.float(0.7, 1.3));
}

function crash(s: GraviState): void {
  s.crashes++;
  s.points = Math.max(0, s.points - CRASH_PENALTY);
  s.chain = 0;
  s.lastCrash = { x: s.x, y: s.y };
  s.x = START.x;
  s.y = START.y;
  s.vx = 0;
  s.vy = 0;
  s.ang = Math.PI / 2;
  s.safe = 80;
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
  tagline: 'Flieg dein Ufo durch die Schwerkraft und schnapp dir die Orbs!',
  instructions: [
    'Stick/Pfeile geben die Flugrichtung vor, A zündet den Turbo. Die Planeten ziehen dich an – nicht abstürzen!',
    'Orbs schnell hintereinander geben eine Kette mit Bonus. Goldene Orbs kreisen um Planeten: riskant, aber 250 Punkte.',
    'Ab 10 s fliegen Kometen durchs Bild, ab 20 s Supernova: stärkere Schwerkraft, alle Orbs doppelt!',
  ],
  controls: {
    desktop: 'Pfeile/WASD = Flugrichtung, Leertaste = Turbo',
    touch: 'Stick = Flugrichtung, A = Turbo',
  },
  category: 'physics',
  duration: 30,
  touch: { stick: true, a: true, b: false },
  init(seed) {
    const rnd = new Rng(seed ^ 0x9a1);
    const s: GraviState = {
      rnd,
      crnd: new Rng(seed).fork(31),
      tick: 0,
      x: START.x,
      y: START.y,
      vx: 0,
      vy: 0,
      ang: Math.PI / 2,
      fuel: 1,
      thrusting: false,
      boosting: false,
      safe: 0,
      planets: makePlanets(rnd),
      orbs: [],
      comets: [],
      nextComet: COMET_TICK,
      cometId: 0,
      spawned: 0,
      collected: 0,
      golds: 0,
      crashes: 0,
      bumps: 0,
      points: 0,
      chain: 0,
      chainT: 0,
      bestChain: 0,
      lastPick: { x: 0, y: 0, pts: 0, gold: false, chain: 0 },
      lastCrash: { x: 0, y: 0 },
    };
    while (s.orbs.length < 3) s.orbs.push(spawnOrb(s));
    return s;
  },
  step(s, input) {
    if (s.tick >= DURATION_TICKS) return;
    s.tick++;
    if (s.safe > 0) s.safe--;
    if (s.chain > 0 && ++s.chainT > CHAIN_TICKS) s.chain = 0;
    const ix = clamp(Number.isFinite(input.x) ? input.x : 0, -1, 1);
    const iy = clamp(Number.isFinite(input.y) ? input.y : 0, -1, 1);
    const mag = Math.min(1, Math.hypot(ix, iy));
    const steer = mag > 0.15;
    if (steer) {
      // Ufo dreht sich schnell in die gewünschte Richtung
      const want = Math.atan2(iy, ix);
      const d = wrapAngle(want - s.ang);
      s.ang = wrapAngle(s.ang + clamp(d, -TURN / 60, TURN / 60));
    }
    const boost = !!input.a && s.fuel > 0;
    s.boosting = boost;
    s.thrusting = steer || boost;
    if (boost) s.fuel = Math.max(0, s.fuel - FUEL_DRAIN / 60);
    else s.fuel = Math.min(1, s.fuel + FUEL_REGEN / 60);
    const power = (steer ? mag : 0) * THRUST + (boost ? THRUST * (BOOST - 1) + (steer ? 0 : THRUST) : 0);
    const gk = gravK(s.tick);
    // Zwei Teilschritte pro Tick für saubere Bahnen nahe an Planeten
    for (let k = 0; k < 2; k++) {
      const h = 1 / 120;
      const g = gravityAt(s.planets, s.x, s.y, gk);
      const tx = Math.cos(s.ang) * power;
      const ty = Math.sin(s.ang) * power;
      s.vx += (g.x + tx) * h;
      s.vy += (g.y + ty) * h;
      // leichte Dämpfung, damit das Ufo kontrollierbar bleibt
      if (!s.thrusting) {
        s.vx = approach(s.vx, 0, 0.6 * h);
        s.vy = approach(s.vy, 0, 0.6 * h);
      }
      const sp = Math.hypot(s.vx, s.vy);
      const cap = boost ? MAX_SPEED * 1.25 : MAX_SPEED;
      if (sp > cap) {
        s.vx *= cap / sp;
        s.vy *= cap / sp;
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
    // Kometen (für alle Spieler gleich)
    if (s.tick >= s.nextComet) spawnComet(s);
    for (const c of s.comets) {
      c.x += c.vx / 60;
      c.y += c.vy / 60;
    }
    s.comets = s.comets.filter((c) => Math.abs(c.x) < WORLD_X + 2 && Math.abs(c.y) < WORLD_Y + 2);
    // Absturz
    if (s.safe === 0) {
      let hit = s.planets.some((p) => Math.hypot(s.x - p.x, s.y - p.y) < p.r + SHIP_R * 0.7);
      if (!hit) hit = s.comets.some((c) => Math.hypot(s.x - c.x, s.y - c.y) < COMET_R + SHIP_R * 0.8);
      if (hit) crash(s);
    }
    // Orbs
    for (const o of s.orbs) {
      if (o.planet >= 0) {
        o.orbitA += o.orbitW;
        orbPos(s, o);
      }
    }
    for (let i = 0; i < s.orbs.length; i++) {
      const o = s.orbs[i] as Orb;
      if (Math.hypot(o.x - s.x, o.y - s.y) < SHIP_R + ORB_R) {
        const gold = o.planet >= 0;
        s.chain++;
        s.chainT = 0;
        s.bestChain = Math.max(s.bestChain, s.chain);
        const pts =
          ((gold ? GOLD_POINTS : ORB_POINTS) + 25 * Math.min(s.chain - 1, 6)) *
          (phaseOf(s.tick) === 2 ? 2 : 1);
        s.points += pts;
        s.collected++;
        if (gold) s.golds++;
        s.lastPick = { x: o.x, y: o.y, pts, gold, chain: s.chain };
        s.orbs.splice(i, 1);
        s.orbs.push(spawnOrb(s));
        break;
      }
    }
  },
  done: (s) => s.tick >= DURATION_TICKS,
  score: (s) => Math.max(0, s.points),
  bot(s, skill, rng): InputFrame {
    const horizon = Math.round(lerp(6, 30, skill)); // Vorausschau in Schritten à 0.05 s
    const margin = lerp(0, 0.6, skill);
    const gk = gravK(s.tick);
    // Ziel: nächster Orb (mit Aufschlag, wenn er nahe an einem Planeten liegt; Gold lohnt sich für gute Bots)
    let target: Orb | null = null;
    let best = Infinity;
    for (const o of s.orbs) {
      let c = Math.hypot(o.x - s.x, o.y - s.y);
      if (o.planet >= 0) c += skill > 0.7 ? 0 : 4;
      if (skill > 0.3) for (const p of s.planets) if (Math.hypot(o.x - p.x, o.y - p.y) < p.r + 2) c += 1;
      if (c < best) {
        best = c;
        target = o;
      }
    }
    if (!target) return { ...NEUTRAL_INPUT };
    const g = gravityAt(s.planets, s.x, s.y, gk);
    const vcap = lerp(2.4, 7, clamp((skill - 0.2) / 0.7, 0, 1) ** 1.3);
    // Ziel vorausberechnen (goldene Orbs kreisen)
    let tx = target.x;
    let ty = target.y;
    if (target.planet >= 0 && skill > 0.4) {
      const p = s.planets[target.planet] as Planet;
      const lead = (Math.hypot(tx - s.x, ty - s.y) / vcap) * 60 * Math.min(1, skill);
      const a = target.orbitA + target.orbitW * lead;
      tx = p.x + Math.cos(a) * target.orbitR;
      ty = p.y + Math.sin(a) * target.orbitR;
    }
    // Gute Bots fliegen um Planeten herum statt hindurch (Wegpunkt seitlich am Planeten)
    if (skill > 0.45) {
      for (const p of s.planets) {
        const sx = tx - s.x;
        const sy = ty - s.y;
        const L2 = sx * sx + sy * sy || 1;
        const u = clamp(((p.x - s.x) * sx + (p.y - s.y) * sy) / L2, 0, 1);
        const cx = s.x + sx * u - p.x;
        const cy = s.y + sy * u - p.y;
        const cd = Math.hypot(cx, cy);
        if (u > 0.02 && u < 0.98 && cd < p.r + 1.1) {
          const nl = cd > 1e-3 ? cd : 1;
          const nx = cd > 1e-3 ? cx / nl : -sy / Math.sqrt(L2);
          const ny = cd > 1e-3 ? cy / nl : sx / Math.sqrt(L2);
          tx = p.x + nx * (p.r + 1.7);
          ty = p.y + ny * (p.r + 1.7);
          break;
        }
      }
    }
    const dx = tx - s.x;
    const dy = ty - s.y;
    const d = Math.hypot(dx, dy) || 1;
    const vwant = Math.min(vcap, 2 + d * 1.5);
    let ax = ((dx / d) * vwant - s.vx) * 1.8 - g.x * lerp(0.2, 0.95, skill);
    let ay = ((dy / d) * vwant - s.vy) * 1.8 - g.y * lerp(0.2, 0.95, skill);
    // Kollisionsvorhersage (Schwerkraft und Kometen, grob)
    let px = s.x;
    let py = s.y;
    let pvx = s.vx;
    let pvy = s.vy;
    let danger: { x: number; y: number } | null = null;
    let dangerT = 0;
    for (let i = 1; i <= horizon && !danger; i++) {
      const gg = gravityAt(s.planets, px, py, gk);
      pvx += gg.x * 0.05;
      pvy += gg.y * 0.05;
      px += pvx * 0.05;
      py += pvy * 0.05;
      for (const p of s.planets) {
        if (Math.hypot(px - p.x, py - p.y) < p.r + margin + 0.45) {
          danger = p;
          dangerT = i;
          break;
        }
      }
      if (!danger && skill > 0.35)
        for (const c of s.comets) {
          const cx = c.x + c.vx * 0.05 * i;
          const cy = c.y + c.vy * 0.05 * i;
          if (Math.hypot(px - cx, py - cy) < COMET_R + 0.5 + margin) {
            danger = { x: cx, y: cy };
            dangerT = i;
            break;
          }
        }
    }
    if (danger && s.safe === 0) {
      const rx = s.x - danger.x;
      const ry = s.y - danger.y;
      const rl = Math.hypot(rx, ry) || 1;
      const k = lerp(6, 12, skill) * (1 - dangerT / (horizon + 1)) + 2;
      ax = (rx / rl) * k + ax * 0.3;
      ay = (ry / rl) * k + ay * 0.3;
    }
    const am = Math.hypot(ax, ay);
    if (am < lerp(1.6, 0.4, skill)) return { ...NEUTRAL_INPUT };
    const a = Math.atan2(ay, ax) + rng.gaussian() * (1 - skill) * 0.45;
    const m = clamp(am / 5, 0.3, 1);
    const boost = !!danger && skill > 0.5 ? s.fuel > 0.25 : skill > 0.6 && d > 7 && s.fuel > 0.6;
    return { ...NEUTRAL_INPUT, x: Math.cos(a) * m, y: Math.sin(a) * m, a: boost };
  },
  hud: (s) => {
    const ph = phaseOf(s.tick);
    const left = Math.max(0, Math.ceil((DURATION_TICKS - s.tick) / 60));
    return {
      left: `${s.collected} Orbs · ${left} s`,
      right: `${Math.max(0, s.points)} Pkt`,
      hint:
        s.safe > 50
          ? 'Absturz! −80'
          : s.chain >= 2
            ? `Kette ×${s.chain}!`
            : ph === 2
              ? 'SUPERNOVA: alles doppelt!'
              : ph === 1 && s.tick < COMET_TICK + 150
                ? 'Kometen!'
                : s.fuel < 0.15
                  ? 'Turbo leer'
                  : undefined,
    };
  },
};
