// Figurensteuerung (kinematisch). Läuft identisch auf Server und Client (Vorhersage + Abgleich).
import {
  AIM_SPEED_MUL,
  CLIMB_MAX,
  CLIMB_TIME,
  CROUCH_HEIGHT,
  CROUCH_SPEED,
  DOWNED_HEIGHT,
  DOWNED_SPEED,
  FREEFALL_DIVE_SPEED,
  FREEFALL_HSPEED,
  FREEFALL_SPEED,
  GLIDE_FALL_SPEED,
  GLIDE_HSPEED,
  GLIDER_AUTO_HEIGHT,
  GRAVITY,
  JUMP_VELOCITY,
  MAP_SIZE,
  MAX_FALL_SPEED,
  PLAYER_HEIGHT,
  PLAYER_RADIUS,
  SLIDE_MIN_SPEED,
  SLIDE_START_SPEED,
  SPRINT_SPEED,
  STEP_HEIGHT,
  SWIM_SPEED,
  WALK_SPEED,
  WATER_LEVEL,
} from './constants';
import { clamp } from './math';
import { Kind } from './pieces';
import { Btn, Mode, type PlayerInput } from './types';
import type { World } from './world';

export interface Body {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  mode: Mode;
  crouch: boolean;
  prevBtn: number;
  climbT: number;
  c0x: number;
  c0y: number;
  c0z: number;
  c1x: number;
  c1y: number;
  c1z: number;
  /** Letzter Wandkontakt (für Klettern) */
  wallNx: number;
  wallNz: number;
  wallTop: number;
  /** Darf nach Sprungpad/Absprung gleiten */
  canGlide: boolean;
  airTime: number;
}

export const newBody = (x = 0, y = 0, z = 0): Body => ({
  x,
  y,
  z,
  vx: 0,
  vy: 0,
  vz: 0,
  mode: Mode.Ground,
  crouch: false,
  prevBtn: 0,
  climbT: 0,
  c0x: 0,
  c0y: 0,
  c0z: 0,
  c1x: 0,
  c1y: 0,
  c1z: 0,
  wallNx: 0,
  wallNz: 0,
  wallTop: 0,
  canGlide: false,
  airTime: 0,
});

export function copyBody(src: Body, dst: Body): Body {
  dst.x = src.x;
  dst.y = src.y;
  dst.z = src.z;
  dst.vx = src.vx;
  dst.vy = src.vy;
  dst.vz = src.vz;
  dst.mode = src.mode;
  dst.crouch = src.crouch;
  dst.prevBtn = src.prevBtn;
  dst.climbT = src.climbT;
  dst.c0x = src.c0x;
  dst.c0y = src.c0y;
  dst.c0z = src.c0z;
  dst.c1x = src.c1x;
  dst.c1y = src.c1y;
  dst.c1z = src.c1z;
  dst.wallNx = src.wallNx;
  dst.wallNz = src.wallNz;
  dst.wallTop = src.wallTop;
  dst.canGlide = src.canGlide;
  dst.airTime = src.airTime;
  return dst;
}

export const enum MoveEv {
  None = 0,
  Jump = 1,
  Land = 2,
  Climb = 4,
  Splash = 8,
  Pad = 16,
  Glide = 32,
  Slide = 64,
}

export interface MoveResult {
  ev: number;
  /** Aufprallgeschwindigkeit bei Landung (positiv). */
  impact: number;
}

export interface MoveOpts {
  /** Waffe im Anschlag / zielt */
  aiming: boolean;
  /** Bewegung erlaubt Sprinten (z. B. nicht beim Heilen) */
  canSprint: boolean;
  /** zusätzlicher Faktor (z. B. Heilen verlangsamt) */
  speedMul: number;
}

export const bodyHeight = (b: Body): number =>
  b.mode === Mode.Downed ? DOWNED_HEIGHT : b.mode === Mode.Slide || b.crouch ? CROUCH_HEIGHT : PLAYER_HEIGHT;

const tmpPos = { x: 0, z: 0 };
const contact = { nx: 0, nz: 0, piece: -1, top: 0 };

/** Vorwärts- und Rechtsvektor aus Blickrichtung (Three.js-Konvention: yaw 0 blickt nach -z). */
export function wishDir(yaw: number, mx: number, mz: number): [number, number] {
  const fx = -Math.sin(yaw),
    fz = -Math.cos(yaw);
  const rx = Math.cos(yaw),
    rz = -Math.sin(yaw);
  let x = fx * mz + rx * mx,
    z = fz * mz + rz * mx;
  const l = Math.hypot(x, z);
  if (l > 1) {
    x /= l;
    z /= l;
  }
  return [x, z];
}

function horizontalMove(b: Body, world: World, dt: number, h: number): boolean {
  const dx = b.vx * dt,
    dz = b.vz * dt;
  const dist = Math.hypot(dx, dz);
  const n = Math.max(1, Math.ceil(dist / 0.3));
  let touched = false;
  b.wallTop = 0;
  for (let i = 0; i < n; i++) {
    tmpPos.x = b.x + dx / n;
    tmpPos.z = b.z + dz / n;
    if (world.pushOut(tmpPos, PLAYER_RADIUS, b.y, h, contact)) {
      touched = true;
      b.wallNx = contact.nx;
      b.wallNz = contact.nz;
      b.wallTop = Math.max(b.wallTop, contact.top);
      // Geschwindigkeit in die Wand hinein entfernen
      const vn = b.vx * contact.nx + b.vz * contact.nz;
      if (vn < 0) {
        b.vx -= vn * contact.nx;
        b.vz -= vn * contact.nz;
      }
    }
    b.x = clamp(tmpPos.x, 2, MAP_SIZE - 2);
    b.z = clamp(tmpPos.z, 2, MAP_SIZE - 2);
  }
  return touched;
}

/** Senkrechte Bewegung mit Boden-/Deckenprüfung. Gibt Aufprall zurück (>0 wenn gelandet). */
function verticalMove(b: Body, world: World, dt: number, h: number, wasGrounded: boolean, res: MoveResult): boolean {
  const g = world.groundAt(b.x, b.z, PLAYER_RADIUS, b.y);
  let ny = b.y + b.vy * dt;
  if (b.vy > 0) {
    const ceil = world.ceilingAt(b.x, b.z, PLAYER_RADIUS, b.y, ny + h);
    if (ny + h > ceil) {
      ny = ceil - h;
      b.vy = 0;
    }
  }
  if (ny <= g.h) {
    if (!wasGrounded && b.vy < -1) {
      res.ev |= MoveEv.Land;
      res.impact = -b.vy;
    }
    b.y = g.h;
    b.vy = 0;
    return true;
  }
  if (wasGrounded && b.vy <= 0 && b.y - g.h < 0.65) {
    // am Boden haften (Hang/Stufe hinab)
    b.y = g.h;
    b.vy = 0;
    return true;
  }
  b.y = ny;
  return false;
}

function checkPad(b: Body, world: World, res: MoveResult): void {
  let launched = false;
  world.query(b.x - 0.5, b.z - 0.5, b.x + 0.5, b.z + 0.5, (p) => {
    if (launched || p.kind !== Kind.Pad || !p.alive) return;
    if (Math.abs(b.x - p.x) < p.hx && Math.abs(b.z - p.z) < p.hz && b.y < p.y + p.hy + 0.6 && b.y > p.y - p.hy - 0.5) launched = true;
  });
  if (launched && b.vy <= 1) {
    b.vy = 31;
    b.mode = Mode.Air;
    b.canGlide = true;
    b.crouch = false;
    res.ev |= MoveEv.Pad;
  }
}

/** Wasser: Kopf bleibt über der Oberfläche. */
const SWIM_FEET = WATER_LEVEL - 1.32;

function tryClimb(b: Body, world: World): boolean {
  if (b.wallTop <= 0) return false;
  const rise = b.wallTop - b.y;
  if (rise <= STEP_HEIGHT || rise > CLIMB_MAX) return false;
  // Zielpunkt: etwas hinter die Kante
  const tx = b.x - b.wallNx * (PLAYER_RADIUS + 0.45),
    tz = b.z - b.wallNz * (PLAYER_RADIUS + 0.45);
  const g = world.groundAt(tx, tz, PLAYER_RADIUS, b.wallTop + 0.05, 0.3);
  if (Math.abs(g.h - b.wallTop) > 0.35) return false;
  // Platz über der Kante?
  if (world.ceilingAt(tx, tz, PLAYER_RADIUS, g.h, g.h + PLAYER_HEIGHT) < g.h + CROUCH_HEIGHT) return false;
  const probe = { x: tx, z: tz };
  if (world.pushOut(probe, PLAYER_RADIUS * 0.9, g.h + 0.05, CROUCH_HEIGHT, { nx: 0, nz: 0, piece: -1, top: 0 })) return false;
  b.mode = Mode.Climb;
  b.climbT = 0;
  b.c0x = b.x;
  b.c0y = b.y;
  b.c0z = b.z;
  b.c1x = tx;
  b.c1y = g.h;
  b.c1z = tz;
  b.vx = b.vy = b.vz = 0;
  return true;
}

/**
 * Einen Simulationsschritt für eine Figur ausführen.
 * Bus, Fahrzeug und Tod werden vom Match behandelt (keine Bewegung hier).
 */
export function stepBody(b: Body, input: PlayerInput, dt: number, world: World, opts: MoveOpts): MoveResult {
  const res: MoveResult = { ev: 0, impact: 0 };
  const btn = input.buttons;
  const pressed = btn & ~b.prevBtn;
  b.prevBtn = btn;
  const [wx, wz] = wishDir(input.yaw, clamp(input.mx, -1, 1), clamp(input.mz, -1, 1));
  const moving = wx !== 0 || wz !== 0;

  switch (b.mode) {
    case Mode.Bus:
    case Mode.Vehicle:
    case Mode.Dead:
      return res;

    case Mode.Climb: {
      b.climbT += dt / CLIMB_TIME;
      const t = Math.min(1, b.climbT);
      // erst hoch, dann nach vorn
      const ty = Math.min(1, t * 1.6);
      const tf = Math.max(0, (t - 0.45) / 0.55);
      b.x = b.c0x + (b.c1x - b.c0x) * tf;
      b.z = b.c0z + (b.c1z - b.c0z) * tf;
      b.y = b.c0y + (b.c1y - b.c0y) * ty;
      if (t >= 1) {
        b.mode = Mode.Ground;
        b.x = b.c1x;
        b.y = b.c1y;
        b.z = b.c1z;
      }
      return res;
    }

    case Mode.Freefall: {
      const ground = world.groundAt(b.x, b.z, PLAYER_RADIUS, b.y).h;
      const dive = (btn & Btn.Dive) !== 0 || input.pitch < -0.75;
      const target = dive ? -FREEFALL_DIVE_SPEED : -FREEFALL_SPEED;
      b.vy += (target - b.vy) * Math.min(1, dt * 2.5);
      const hs = dive ? FREEFALL_HSPEED * 0.6 : FREEFALL_HSPEED;
      b.vx += (wx * hs - b.vx) * Math.min(1, dt * 2);
      b.vz += (wz * hs - b.vz) * Math.min(1, dt * 2);
      b.x = clamp(b.x + b.vx * dt, 2, MAP_SIZE - 2);
      b.z = clamp(b.z + b.vz * dt, 2, MAP_SIZE - 2);
      b.y += b.vy * dt;
      const above = b.y - ground;
      if (above < GLIDER_AUTO_HEIGHT || ((pressed & Btn.Jump) !== 0 && above < 160)) {
        b.mode = Mode.Glide;
        res.ev |= MoveEv.Glide;
      }
      if (b.y <= ground) {
        b.y = ground;
        b.vy = 0;
        b.mode = Mode.Ground;
        res.ev |= MoveEv.Land;
      }
      return res;
    }

    case Mode.Glide: {
      const ground = world.groundAt(b.x, b.z, PLAYER_RADIUS, b.y).h;
      // Gleiter: immer etwas Vortrieb in Blickrichtung, Eingabe lenkt
      const [fx, fz] = wishDir(input.yaw, 0, 1);
      const push = 0.45 + Math.max(0, input.mz) * 0.55;
      const tx = fx * GLIDE_HSPEED * push + wx * 5,
        tz = fz * GLIDE_HSPEED * push + wz * 5;
      b.vx += (tx - b.vx) * Math.min(1, dt * 1.6);
      b.vz += (tz - b.vz) * Math.min(1, dt * 1.6);
      const fall = (btn & Btn.Dive) !== 0 ? GLIDE_FALL_SPEED * 2.2 : GLIDE_FALL_SPEED;
      b.vy += (-fall - b.vy) * Math.min(1, dt * 3);
      const h = PLAYER_HEIGHT;
      horizontalMove(b, world, dt, h);
      const landed = verticalMove(b, world, dt, h, false, res);
      if (landed) {
        b.mode = Mode.Ground;
        b.canGlide = false;
        res.ev |= MoveEv.Land;
        res.impact = 0; // Gleiter landen weich
      } else if (b.y < SWIM_FEET) {
        b.mode = Mode.Swim;
        b.y = SWIM_FEET;
        b.vy = 0;
        res.ev |= MoveEv.Splash;
      } else if ((pressed & Btn.Jump) !== 0 && b.y - ground > 30) {
        b.mode = Mode.Freefall;
      }
      return res;
    }

    case Mode.Swim: {
      b.crouch = false;
      const sp = SWIM_SPEED * opts.speedMul * ((btn & Btn.Sprint) !== 0 ? 1.3 : 1);
      b.vx += (wx * sp - b.vx) * Math.min(1, dt * 6);
      b.vz += (wz * sp - b.vz) * Math.min(1, dt * 6);
      b.vy = 0;
      horizontalMove(b, world, dt, PLAYER_HEIGHT);
      const g = world.groundAt(b.x, b.z, PLAYER_RADIUS, b.y + 0.8);
      if (g.h > SWIM_FEET + 0.05) {
        b.y = g.h;
        b.mode = Mode.Ground;
      } else {
        b.y = SWIM_FEET;
        if ((pressed & Btn.Jump) !== 0 && b.wallTop > 0) tryClimb(b, world);
      }
      return res;
    }

    default:
      break;
  }

  // ---- Boden / Luft / Rutschen / Niedergeschlagen ----
  const downed = b.mode === Mode.Downed;
  let grounded = b.mode === Mode.Ground || b.mode === Mode.Slide || (downed && b.airTime === 0);
  const wantCrouch = (btn & Btn.Crouch) !== 0;
  const sprint = (btn & Btn.Sprint) !== 0 && opts.canSprint && !opts.aiming && input.mz > 0.3 && !downed;

  if (!downed) {
    if (b.mode === Mode.Slide) {
      const sp = Math.hypot(b.vx, b.vz);
      if (!wantCrouch || sp < SLIDE_MIN_SPEED) {
        b.mode = Mode.Ground;
        b.crouch = wantCrouch;
      }
    } else if (grounded) {
      const sp = Math.hypot(b.vx, b.vz);
      if ((pressed & Btn.Crouch) !== 0 && sp > WALK_SPEED + 0.6) {
        b.mode = Mode.Slide;
        const boost = Math.max(sp, SLIDE_START_SPEED) / (sp || 1);
        b.vx *= boost;
        b.vz *= boost;
        res.ev |= MoveEv.Slide;
      } else if (wantCrouch !== b.crouch) {
        if (wantCrouch) b.crouch = true;
        else if (world.ceilingAt(b.x, b.z, PLAYER_RADIUS, b.y, b.y + PLAYER_HEIGHT) >= b.y + PLAYER_HEIGHT) b.crouch = false;
      }
    }
  }

  const h = bodyHeight(b);
  if (b.mode === Mode.Slide) {
    // Hangabtrieb und Reibung
    const n = world.terrain.normal(b.x, b.z, { x: 0, y: 1, z: 0 });
    b.vx += n.x * GRAVITY * 0.9 * dt;
    b.vz += n.z * GRAVITY * 0.9 * dt;
    const sp = Math.hypot(b.vx, b.vz);
    const fr = Math.max(0, sp - 5.5 * dt) / (sp || 1);
    b.vx *= fr;
    b.vz *= fr;
    // leichtes Lenken
    if (moving) {
      b.vx += wx * 3 * dt;
      b.vz += wz * 3 * dt;
    }
  } else {
    let speed = downed ? DOWNED_SPEED : b.crouch ? CROUCH_SPEED : sprint ? SPRINT_SPEED : WALK_SPEED;
    if (opts.aiming && !downed) speed *= AIM_SPEED_MUL;
    speed *= opts.speedMul;
    const accel = grounded ? 55 : 9;
    const tx = wx * speed,
      tz = wz * speed;
    const ax = tx - b.vx,
      az = tz - b.vz;
    const al = Math.hypot(ax, az);
    const maxA = accel * dt;
    if (al > maxA) {
      b.vx += (ax / al) * maxA;
      b.vz += (az / al) * maxA;
    } else {
      b.vx = tx;
      b.vz = tz;
    }
  }

  // Springen / Klettern
  if ((pressed & Btn.Jump) !== 0 && !downed) {
    if (grounded && b.wallTop > 0 && moving && b.wallNx * wx + b.wallNz * wz < -0.5 && tryClimb(b, world)) {
      res.ev |= MoveEv.Climb;
      return res;
    }
    if (grounded) {
      if (b.crouch && world.ceilingAt(b.x, b.z, PLAYER_RADIUS, b.y, b.y + PLAYER_HEIGHT) < b.y + PLAYER_HEIGHT) {
        // kein Platz zum Aufstehen
      } else {
        b.vy = JUMP_VELOCITY;
        b.crouch = false;
        if (b.mode === Mode.Slide) b.mode = Mode.Ground;
        grounded = false;
        res.ev |= MoveEv.Jump;
      }
    } else if (b.airTime > 0.05 && b.wallTop > 0 && b.wallNx * wx + b.wallNz * wz < -0.5 && tryClimb(b, world)) {
      res.ev |= MoveEv.Climb;
      return res;
    }
  }

  if (!grounded) {
    b.vy = Math.max(-MAX_FALL_SPEED, b.vy - GRAVITY * dt);
    b.airTime += dt;
  }

  horizontalMove(b, world, dt, h);
  const wasGrounded = grounded;
  grounded = verticalMove(b, world, dt, h, wasGrounded, res);
  if (grounded) b.airTime = 0;

  if (downed) {
    // bleibt Downed
  } else if (b.mode === Mode.Slide) {
    if (!grounded) b.mode = Mode.Air;
  } else {
    b.mode = grounded ? Mode.Ground : Mode.Air;
  }

  // Nach Sprungpad automatisch gleiten
  if (b.mode === Mode.Air && b.canGlide && b.vy < -4) {
    const ground = world.groundAt(b.x, b.z, PLAYER_RADIUS, b.y).h;
    if (b.y - ground > 8) {
      b.mode = Mode.Glide;
      res.ev |= MoveEv.Glide;
    }
  }
  if (grounded) b.canGlide = false;

  // Wasser
  if (b.y < SWIM_FEET && !downed) {
    b.mode = Mode.Swim;
    b.y = SWIM_FEET;
    b.vy = 0;
    b.crouch = false;
    res.ev |= MoveEv.Splash;
  } else if (downed && b.y < SWIM_FEET) {
    b.y = SWIM_FEET;
    b.vy = 0;
  }

  if (grounded && !downed) checkPad(b, world, res);
  return res;
}

/** Fallschaden aus Aufprallgeschwindigkeit. */
export function fallDamage(impact: number): number {
  return impact > 17 ? Math.round((impact - 17) * 6.5) : 0;
}
