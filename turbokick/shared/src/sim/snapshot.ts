import { lerp3, quatNormalize, quatSlerp } from './math';
import type { CarState, Phase, SimState } from './types';

/**
 * Kompakter Netzwerk-Schnappschuss (Little Endian). Enthält den gesamten dynamischen Zustand für sauberes Weiterrechnen.
 * Aufbau: Kopf (35 B) | je Auto 40 B | Ball 18 B | je Pad 2 B | Prüfsumme (FNV-1a, 4 B)
 * Quantisierung: Positionen Int16 (1/512 m, ±64 m), Geschwindigkeiten Int16 (1/400 m/s), Winkelgeschwindigkeit Int16 (1/2000 rad/s),
 * Quaternion als drei Int16 (w ≥ 0 wird rekonstruiert), Zeiten/Boost als Uint16 (Millisekunden bzw. 1/100).
 */
const MAGIC0 = 0x54;
const MAGIC1 = 0x4b;
const VERSION = 2;
const HEADER = 35;
const CAR_BYTES = 40;
const BALL_BYTES = 18;
const PHASES: readonly Phase[] = ['countdown', 'playing', 'goal', 'ended'];

const POS_SCALE = 512;
const VEL_SCALE = 400;
const ANG_SCALE = 2000;
const QUAT_SCALE = 32767;
const PAD_TIME_SCALE = 1000;

function q16(v: number, scale: number): number {
  const r = Math.round(v * scale);
  return r > 32767 ? 32767 : r < -32768 ? -32768 : r;
}

function u16(v: number, scale: number): number {
  const r = Math.round(v * scale);
  return r > 65535 ? 65535 : r < 0 ? 0 : r;
}

function i8(v: number): number {
  const r = Math.round(v * 127);
  return r > 127 ? 127 : r < -127 ? -127 : r;
}

function fnv(b: Uint8Array, end: number): number {
  let h = 2166136261;
  for (let i = 0; i < end; i++) h = Math.imul(h ^ (b[i] as number), 16777619);
  return h >>> 0;
}

function sizeFor(nCars: number, nPads: number): number {
  return HEADER + nCars * CAR_BYTES + BALL_BYTES + nPads * 2 + 4;
}

export function encodeSnapshot(s: SimState): Uint8Array {
  const nCars = s.cars.length;
  const nPads = s.pads.length;
  const out = new Uint8Array(sizeFor(nCars, nPads));
  const dv = new DataView(out.buffer);
  let o = 0;
  out[o++] = MAGIC0;
  out[o++] = MAGIC1;
  out[o++] = VERSION;
  out[o++] = nCars;
  out[o++] = nPads;
  out[o++] = Math.max(0, PHASES.indexOf(s.phase));
  out[o++] = (s.overtime ? 1 : 0) | ((s.winner + 1) << 1);
  out[o++] = Math.min(255, s.score[0]);
  out[o++] = Math.min(255, s.score[1]);
  dv.setInt8(o++, s.lastTouch);
  dv.setInt8(o++, s.prevTouch);
  dv.setUint32(o, s.tick >>> 0, true);
  o += 4;
  dv.setFloat64(o, s.phaseTimer, true);
  o += 8;
  dv.setFloat64(o, s.clock, true);
  o += 8;
  dv.setUint32(o, s.rngState >>> 0, true);
  o += 4;
  // o == HEADER
  const vec = (a: ArrayLike<number>, scale: number): void => {
    for (let k = 0; k < 3; k++) {
      dv.setInt16(o, q16(a[k] as number, scale), true);
      o += 2;
    }
  };
  for (const c of s.cars) {
    vec(c.pos, POS_SCALE);
    let sg = c.quat[3] < 0 ? -1 : 1;
    const ql = Math.sqrt(c.quat[0] ** 2 + c.quat[1] ** 2 + c.quat[2] ** 2 + c.quat[3] ** 2) || 1;
    sg /= ql;
    for (let k = 0; k < 3; k++) {
      dv.setInt16(o, q16((c.quat[k] as number) * sg, QUAT_SCALE), true);
      o += 2;
    }
    vec(c.vel, VEL_SCALE);
    vec(c.angVel, ANG_SCALE);
    dv.setUint16(o, u16(c.boost, 100), true);
    o += 2;
    const flags =
      (c.jumpUsed ? 1 : 0) |
      (c.canDodge ? 2 : 0) |
      (c.boosting ? 4 : 0) |
      (c.supersonic ? 8 : 0) |
      (c.team << 4) |
      (Math.min(4, c.wheelsOnSurface) << 5) |
      (c.input.jump ? 1 << 8 : 0) |
      (c.input.boost ? 1 << 9 : 0) |
      (c.input.handbrake ? 1 << 10 : 0);
    dv.setUint16(o, flags, true);
    o += 2;
    dv.setUint16(o, u16(c.demolished, 1000), true);
    dv.setUint16(o + 2, u16(c.dodgeTimer, 1000), true);
    dv.setUint16(o + 4, u16(c.jumpTimer, 1000), true);
    o += 6;
    dv.setInt8(o++, i8(c.input.throttle));
    dv.setInt8(o++, i8(c.input.steer));
    dv.setInt8(o++, i8(c.input.pitch));
    dv.setInt8(o++, i8(c.input.yaw));
    dv.setInt8(o++, i8(c.input.roll));
    out[o++] = c.id & 255;
  }
  vec(s.ball.pos, POS_SCALE);
  vec(s.ball.vel, VEL_SCALE);
  vec(s.ball.angVel, ANG_SCALE);
  for (const p of s.pads) {
    dv.setUint16(o, p.active ? 0 : Math.max(1, u16(p.timer, PAD_TIME_SCALE)), true);
    o += 2;
  }
  dv.setUint32(o, fnv(out, o), true);
  return out;
}

/** Schreibt einen Schnappschuss in `into`. Gibt false bei ungültigen/zu kurzen/beschädigten Daten zurück (wirft nie, ändert dann nichts). */
export function decodeSnapshot(bytes: Uint8Array, into: SimState): boolean {
  try {
    if (!(bytes instanceof Uint8Array) || bytes.length < HEADER + BALL_BYTES + 4) return false;
    if (bytes[0] !== MAGIC0 || bytes[1] !== MAGIC1 || bytes[2] !== VERSION) return false;
    const nCars = bytes[3] as number;
    const nPads = bytes[4] as number;
    if (nCars !== into.cars.length || nPads !== into.pads.length) return false;
    if (bytes.length !== sizeFor(nCars, nPads)) return false;
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const end = bytes.length - 4;
    if (dv.getUint32(end, true) !== fnv(bytes, end)) return false;
    const phaseIdx = bytes[5] as number;
    const fl = bytes[6] as number;
    if (phaseIdx > 3 || fl > 7 || (fl >> 1) > 2) return false;
    const phaseTimer = dv.getFloat64(15, true);
    const clock = dv.getFloat64(23, true);
    if (!Number.isFinite(phaseTimer) || !Number.isFinite(clock)) return false;

    // Vorprüfung der Quaternionen (nichts schreiben, bevor alles gültig ist)
    let o = HEADER;
    for (let i = 0; i < nCars; i++) {
      const x = dv.getInt16(o + 6, true) / QUAT_SCALE;
      const y = dv.getInt16(o + 8, true) / QUAT_SCALE;
      const z = dv.getInt16(o + 10, true) / QUAT_SCALE;
      if (x * x + y * y + z * z > 1.01) return false;
      o += CAR_BYTES;
    }

    into.phase = PHASES[phaseIdx] as Phase;
    into.overtime = (fl & 1) === 1;
    into.winner = ((fl >> 1) - 1) as -1 | 0 | 1;
    into.score[0] = bytes[7] as number;
    into.score[1] = bytes[8] as number;
    into.lastTouch = dv.getInt8(9);
    into.prevTouch = dv.getInt8(10);
    into.tick = dv.getUint32(11, true);
    into.phaseTimer = phaseTimer;
    into.clock = clock;
    into.rngState = dv.getUint32(31, true);
    o = HEADER;
    const vec = (a: number[], scale: number): void => {
      for (let k = 0; k < 3; k++) {
        a[k] = dv.getInt16(o, true) / scale;
        o += 2;
      }
    };
    for (let i = 0; i < nCars; i++) {
      const c = into.cars[i] as CarState;
      vec(c.pos, POS_SCALE);
      const x = dv.getInt16(o, true) / QUAT_SCALE;
      const y = dv.getInt16(o + 2, true) / QUAT_SCALE;
      const z = dv.getInt16(o + 4, true) / QUAT_SCALE;
      o += 6;
      c.quat[0] = x;
      c.quat[1] = y;
      c.quat[2] = z;
      c.quat[3] = Math.sqrt(Math.max(0, 1 - x * x - y * y - z * z));
      quatNormalize(c.quat);
      vec(c.vel, VEL_SCALE);
      vec(c.angVel, ANG_SCALE);
      c.boost = Math.min(100, dv.getUint16(o, true) / 100);
      o += 2;
      const flags = dv.getUint16(o, true);
      o += 2;
      c.jumpUsed = (flags & 1) !== 0;
      c.canDodge = (flags & 2) !== 0;
      c.boosting = (flags & 4) !== 0;
      c.supersonic = (flags & 8) !== 0;
      c.team = ((flags >> 4) & 1) as 0 | 1;
      c.wheelsOnSurface = (flags >> 5) & 7;
      c.input.jump = (flags & (1 << 8)) !== 0;
      c.input.boost = (flags & (1 << 9)) !== 0;
      c.input.handbrake = (flags & (1 << 10)) !== 0;
      c.demolished = dv.getUint16(o, true) / 1000;
      c.dodgeTimer = dv.getUint16(o + 2, true) / 1000;
      c.jumpTimer = dv.getUint16(o + 4, true) / 1000;
      o += 6;
      c.input.throttle = dv.getInt8(o++) / 127;
      c.input.steer = dv.getInt8(o++) / 127;
      c.input.pitch = dv.getInt8(o++) / 127;
      c.input.yaw = dv.getInt8(o++) / 127;
      c.input.roll = dv.getInt8(o++) / 127;
      c.id = bytes[o++] as number;
    }
    vec(into.ball.pos, POS_SCALE);
    vec(into.ball.vel, VEL_SCALE);
    vec(into.ball.angVel, ANG_SCALE);
    for (let i = 0; i < nPads; i++) {
      const t = dv.getUint16(o, true);
      o += 2;
      const p = into.pads[i]!;
      p.active = t === 0;
      p.timer = t / PAD_TIME_SCALE;
    }
    return true;
  } catch {
    return false;
  }
}

const _t: [number, number, number, number] = [0, 0, 0, 1];

/** Interpolation für den Client: Positionen/Geschwindigkeiten linear, Quaternionen sphärisch; Diskretes kommt aus b (k ≥ 0,5) bzw. a. */
export function interpolateStates(a: SimState, b: SimState, k: number, out: SimState): void {
  const src = k >= 0.5 ? b : a;
  out.tick = src.tick;
  out.phase = src.phase;
  out.phaseTimer = src.phaseTimer;
  out.clock = src.clock;
  out.overtime = src.overtime;
  out.score[0] = src.score[0];
  out.score[1] = src.score[1];
  out.lastTouch = src.lastTouch;
  out.prevTouch = src.prevTouch;
  out.winner = src.winner;
  out.rngState = src.rngState;
  const n = Math.min(out.cars.length, a.cars.length, b.cars.length);
  for (let i = 0; i < n; i++) {
    const ca = a.cars[i] as CarState;
    const cb = b.cars[i] as CarState;
    const co = out.cars[i] as CarState;
    const cs = k >= 0.5 ? cb : ca;
    lerp3(ca.pos, cb.pos, k, co.pos);
    lerp3(ca.vel, cb.vel, k, co.vel);
    lerp3(ca.angVel, cb.angVel, k, co.angVel);
    // Respawn/Demolition: kein Gleiten über das ganze Feld
    if (ca.demolished > 0 !== cb.demolished > 0) {
      co.pos[0] = cs.pos[0];
      co.pos[1] = cs.pos[1];
      co.pos[2] = cs.pos[2];
    }
    quatSlerp(ca.quat, cb.quat, k, _t);
    co.quat[0] = _t[0];
    co.quat[1] = _t[1];
    co.quat[2] = _t[2];
    co.quat[3] = _t[3];
    co.boost = cs.boost;
    co.wheelsOnSurface = cs.wheelsOnSurface;
    co.jumpUsed = cs.jumpUsed;
    co.canDodge = cs.canDodge;
    co.demolished = cs.demolished;
    co.dodgeTimer = cs.dodgeTimer;
    co.jumpTimer = cs.jumpTimer;
    co.boosting = cs.boosting;
    co.supersonic = cs.supersonic;
    co.team = cs.team;
    co.id = cs.id;
    Object.assign(co.input, cs.input);
  }
  lerp3(a.ball.pos, b.ball.pos, k, out.ball.pos);
  lerp3(a.ball.vel, b.ball.vel, k, out.ball.vel);
  lerp3(a.ball.angVel, b.ball.angVel, k, out.ball.angVel);
  const m = Math.min(out.pads.length, b.pads.length);
  for (let i = 0; i < m; i++) {
    const p = out.pads[i]!;
    const q = b.pads[i]!;
    p.active = q.active;
    p.timer = q.timer;
  }
}
