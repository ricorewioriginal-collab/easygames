// Fahrzeug „Rift-Buggy“: einfache, robuste Arcade-Fahrphysik auf dem Gelände.
import { GRAVITY, MAP_SIZE, WATER_LEVEL } from './constants';
import { clamp } from './math';
import { Btn, type PlayerInput } from './types';
import type { World } from './world';

export const VEHICLE_SEATS = 4;
export const VEHICLE_HP = 650;
export const VEHICLE_RADIUS = 1.35;
export const VEHICLE_MAX = 25;
export const VEHICLE_BOOST = 31;

/** Sitzpositionen relativ zum Fahrzeug (x rechts, z nach vorn = -z lokal). */
export const SEAT_OFFSETS: readonly [number, number, number][] = [
  [-0.5, 0.75, -0.2],
  [0.5, 0.75, -0.2],
  [-0.5, 0.95, 1.1],
  [0.5, 0.95, 1.1],
];

export interface Vehicle {
  id: number;
  x: number;
  y: number;
  z: number;
  yaw: number;
  speed: number;
  vy: number;
  hp: number;
  alive: boolean;
  seats: number[];
  boost: number;
  /** Letzter Aufprall (für Schaden/Effekte) */
  crash: number;
  crashPiece: number;
}

export const newVehicle = (id: number, x: number, y: number, z: number, yaw: number): Vehicle => ({
  id,
  x,
  y,
  z,
  yaw,
  speed: 0,
  vy: 0,
  hp: VEHICLE_HP,
  alive: true,
  seats: [-1, -1, -1, -1],
  boost: 100,
  crash: 0,
  crashPiece: -1,
});

export function copyVehicle(s: Vehicle, d: Vehicle): Vehicle {
  d.id = s.id;
  d.x = s.x;
  d.y = s.y;
  d.z = s.z;
  d.yaw = s.yaw;
  d.speed = s.speed;
  d.vy = s.vy;
  d.hp = s.hp;
  d.alive = s.alive;
  d.seats = [...s.seats];
  d.boost = s.boost;
  d.crash = s.crash;
  d.crashPiece = s.crashPiece;
  return d;
}

const pos = { x: 0, z: 0 };
const contact = { nx: 0, nz: 0, piece: -1, top: 0 };

/** Ein Schritt Fahrphysik. input = Fahrer-Eingabe oder null (führerlos). */
export function stepVehicle(v: Vehicle, input: PlayerInput | null, dt: number, world: World): void {
  v.crash = 0;
  v.crashPiece = -1;
  const throttle = input ? clamp(input.mz, -1, 1) : 0;
  const steer = input ? clamp(input.mx, -1, 1) : 0;
  const boosting = !!input && (input.buttons & Btn.Sprint) !== 0 && v.boost > 0 && throttle > 0;
  const g = world.groundAt(v.x, v.z, VEHICLE_RADIUS * 0.6, v.y, 0.9);
  const onGround = v.y <= g.h + 0.05;
  const water = WATER_LEVEL - g.h;
  if (onGround) {
    const max = boosting ? VEHICLE_BOOST : VEHICLE_MAX;
    if (throttle > 0) v.speed += throttle * (boosting ? 20 : 13) * dt;
    else if (throttle < 0) v.speed += throttle * (v.speed > 0.5 ? 26 : 9) * dt;
    v.speed = clamp(v.speed, -9, max);
    // Rollwiderstand
    const drag = (throttle === 0 ? 5 : 1.2) * dt;
    v.speed = Math.abs(v.speed) <= drag ? 0 : v.speed - Math.sign(v.speed) * drag;
    if (input && (input.buttons & Btn.Jump) !== 0) v.speed *= 1 - 3 * dt; // Handbremse
    const turn = 1.9 * clamp(v.speed / 7, -1, 1);
    v.yaw -= steer * turn * dt;
  }
  if (boosting) v.boost = Math.max(0, v.boost - 25 * dt);
  else v.boost = Math.min(100, v.boost + 10 * dt);
  if (water > 1.4) v.speed = clamp(v.speed, -2.5, 2.5);

  // Horizontal mit Kollision
  const fx = -Math.sin(v.yaw),
    fz = -Math.cos(v.yaw);
  const dx = fx * v.speed * dt,
    dz = fz * v.speed * dt;
  const n = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.4));
  for (let i = 0; i < n; i++) {
    pos.x = v.x + dx / n;
    pos.z = v.z + dz / n;
    if (world.pushOut(pos, VEHICLE_RADIUS, v.y + 0.25, 1.5, contact)) {
      const into = -(fx * contact.nx + fz * contact.nz) * Math.sign(v.speed || 1);
      if (into > 0.3 && Math.abs(v.speed) > 4) {
        v.crash = Math.abs(v.speed);
        v.crashPiece = contact.piece;
        v.speed *= -0.25;
      } else {
        v.speed *= 0.97;
      }
    }
    v.x = clamp(pos.x, 4, MAP_SIZE - 4);
    v.z = clamp(pos.z, 4, MAP_SIZE - 4);
  }
  // Vertikal
  const g2 = world.groundAt(v.x, v.z, VEHICLE_RADIUS * 0.6, v.y, 0.9);
  v.vy -= GRAVITY * dt;
  const ny = v.y + v.vy * dt;
  if (ny <= g2.h) {
    if (v.vy < -14) v.crash = Math.max(v.crash, -v.vy * 0.6);
    v.y = g2.h;
    v.vy = 0;
  } else if (onGround && v.vy <= 0 && v.y - g2.h < 0.9) {
    v.y = g2.h;
    v.vy = 0;
  } else {
    v.y = ny;
  }
  if (v.y < WATER_LEVEL - 1.2) v.y = WATER_LEVEL - 1.2;
}

/** Weltposition eines Sitzes. */
export function seatPos(v: Vehicle, seat: number): [number, number, number] {
  const o = SEAT_OFFSETS[seat] ?? SEAT_OFFSETS[0]!;
  const c = Math.cos(v.yaw),
    s = Math.sin(v.yaw);
  // lokal x rechts, z hinten (Three.js)
  const x = v.x + o[0] * c + o[2] * s;
  const z = v.z - o[0] * s + o[2] * c;
  return [x, v.y + o[1], z];
}
