// Der Riftsturm: schrumpfende Zone in mehreren Phasen.
import { MAP_CENTER } from './constants';
import { ISLAND_RADIUS } from './mapdef';
import { clamp, lerp, type Rng } from './math';
import type { Terrain } from './terrain';
import { WATER_LEVEL } from './constants';

export interface ZonePhaseDef {
  wait: number;
  shrink: number;
  radius: number;
  dps: number;
}

export const ZONE_PHASES: readonly ZonePhaseDef[] = [
  { wait: 70, shrink: 55, radius: 480, dps: 1 },
  { wait: 50, shrink: 45, radius: 290, dps: 2 },
  { wait: 45, shrink: 40, radius: 170, dps: 4 },
  { wait: 35, shrink: 32, radius: 95, dps: 6 },
  { wait: 30, shrink: 28, radius: 48, dps: 8 },
  { wait: 22, shrink: 22, radius: 20, dps: 10 },
  { wait: 15, shrink: 30, radius: 0, dps: 14 },
];

export interface ZoneState {
  /** Index der aktuellen Phase (−1 vor Phase 1, ZONE_PHASES.length = beendet). */
  phase: number;
  shrinking: boolean;
  /** Restzeit des aktuellen Abschnitts (Warten oder Schrumpfen) */
  timer: number;
  cx: number;
  cz: number;
  r: number;
  /** Ausgangskreis der laufenden Phase */
  fx: number;
  fz: number;
  fr: number;
  /** Zielkreis */
  tx: number;
  tz: number;
  tr: number;
  dps: number;
}

export function newZone(): ZoneState {
  const r0 = ISLAND_RADIUS * 1.45;
  return { phase: -1, shrinking: false, timer: 0, cx: MAP_CENTER, cz: MAP_CENTER, r: r0, fx: MAP_CENTER, fz: MAP_CENTER, fr: r0, tx: MAP_CENTER, tz: MAP_CENTER, tr: r0, dps: 1 };
}

/** Nächsten Zielkreis innerhalb des aktuellen wählen – möglichst auf Land. */
function pickTarget(z: ZoneState, def: ZonePhaseDef, rng: Rng, terrain: Terrain): void {
  const maxOff = Math.max(0, z.r - def.radius);
  for (let tries = 0; tries < 30; tries++) {
    const a = rng.next() * Math.PI * 2;
    const d = Math.sqrt(rng.next()) * maxOff * (z.phase <= 0 ? 0.55 : 0.9);
    const x = z.cx + Math.cos(a) * d,
      zz = z.cz + Math.sin(a) * d;
    if (terrain.height(x, zz) > WATER_LEVEL + 0.8 || tries === 29) {
      z.tx = clamp(x, 100, 1436);
      z.tz = clamp(zz, 100, 1436);
      break;
    }
  }
  z.tr = def.radius;
}

/** Zone um dt weiterführen. scale < 1 beschleunigt alle Zeiten. */
export function stepZone(z: ZoneState, dt: number, scale: number, rng: Rng, terrain: Terrain): boolean {
  let changed = false;
  if (z.phase >= ZONE_PHASES.length) return false;
  if (z.phase < 0) {
    z.phase = 0;
    z.shrinking = false;
    const def = ZONE_PHASES[0]!;
    z.timer = def.wait * scale;
    pickTarget(z, def, rng, terrain);
    z.dps = def.dps;
    return true;
  }
  const def = ZONE_PHASES[z.phase]!;
  z.timer -= dt;
  if (!z.shrinking) {
    if (z.timer <= 0) {
      z.shrinking = true;
      z.timer = def.shrink * scale;
      z.fx = z.cx;
      z.fz = z.cz;
      z.fr = z.r;
      changed = true;
    }
  } else {
    const total = def.shrink * scale;
    const t = clamp(1 - z.timer / total, 0, 1);
    z.cx = lerp(z.fx, z.tx, t);
    z.cz = lerp(z.fz, z.tz, t);
    z.r = lerp(z.fr, z.tr, t);
    if (z.timer <= 0) {
      z.cx = z.tx;
      z.cz = z.tz;
      z.r = z.tr;
      z.phase++;
      z.shrinking = false;
      changed = true;
      if (z.phase < ZONE_PHASES.length) {
        const nd = ZONE_PHASES[z.phase]!;
        z.timer = nd.wait * scale;
        z.dps = nd.dps;
        pickTarget(z, nd, rng, terrain);
      }
    }
  }
  return changed;
}

export const outsideZone = (z: ZoneState, x: number, zz: number): boolean => (x - z.cx) ** 2 + (zz - z.cz) ** 2 > z.r * z.r;
