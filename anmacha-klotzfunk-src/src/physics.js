// Spieler-Physik (AABB, achsenweise Bewegung) und Voxel-Raycast.
import { B } from './world.js';

export const HALF = 0.3, HEIGHT = 1.8, EYE = 1.62;
const GAP = 1e-3;

export class Player {
  constructor() {
    this.x = 0; this.y = 0; this.z = 0;
    this.vx = 0; this.vy = 0; this.vz = 0;
    this.onGround = false; this.inWater = false; this.flying = false; this.coyote = 0;
    this.fallT = 0; this.gliding = false; this.hook = false; this.lifted = false; this.bounces = 0;
  }

  collides(world, x, y, z) {
    const x0 = Math.floor(x - HALF), x1 = Math.floor(x + HALF - 1e-7);
    const z0 = Math.floor(z - HALF), z1 = Math.floor(z + HALF - 1e-7);
    const y0 = Math.floor(y), y1 = Math.floor(y + HEIGHT - 1e-7);
    for (let by = y0; by <= y1; by++) for (let bz = z0; bz <= z1; bz++) for (let bx = x0; bx <= x1; bx++) {
      if (world.isSolid(bx, by, bz)) return true;
    }
    return false;
  }

  move(world, axis, d) {
    while (d !== 0) {
      const s = Math.abs(d) > 0.2 ? Math.sign(d) * 0.2 : d;
      d -= s;
      this[axis] += s;
      if (this.collides(world, this.x, this.y, this.z)) {
        if (axis === 'y') this.y = s > 0 ? Math.floor(this.y + HEIGHT) - HEIGHT - GAP : Math.floor(this.y) + 1 + GAP;
        else this[axis] = s > 0 ? Math.floor(this[axis] + HALF) - HALF - GAP : Math.floor(this[axis] - HALF) + 1 + HALF + GAP;
        this['v' + axis] = 0;
        if (axis === 'y' && s < 0) this.onGround = true;
        return;
      }
    }
  }

  // inp: { f, r, jump, down, sprint } – f/r analog in [-1, 1]
  update(world, dt, inp, yaw) {
    // aus Blöcken befreien (z. B. nach geladenen Änderungen)
    for (let i = 0; i < 12 && this.collides(world, this.x, this.y, this.z); i++) this.y += 1;

    const sin = Math.sin(yaw), cos = Math.cos(yaw);
    let wx = -inp.f * sin + inp.r * cos, wz = -inp.f * cos - inp.r * sin;
    const len = Math.hypot(wx, wz);
    if (len > 1) { wx /= len; wz /= len; }

    const fx = Math.floor(this.x), fz = Math.floor(this.z);
    this.inWater = world.getBlock(fx, Math.floor(this.y + 0.4), fz) === B.WATER;
    const eyeWater = world.getBlock(fx, Math.floor(this.y + 1.5), fz) === B.WATER;
    const under = this.onGround ? world.getBlock(fx, Math.floor(this.y - 0.05), fz) : B.AIR;

    // Aufwind: Aufwind-Block höchstens 11 Felder unter den Füßen, dazwischen nur Luft/Wasser
    this.lifted = false;
    if (!this.flying) {
      for (let k = 0, by = Math.floor(this.y - 0.1); k <= 11; k++, by--) {
        const b = world.getBlock(fx, by, fz);
        if (b === B.WIND) { this.lifted = true; break; }
        if (b !== B.AIR && b !== B.WATER) break;
      }
    }

    // Gleiten: Sprungtaste im Fall gehalten (nicht beim normalen Sprung)
    const air = !this.onGround && !this.inWater && !this.flying;
    this.fallT = air && this.vy < 0 ? this.fallT + dt : 0;
    this.gliding = air && inp.jump && this.fallT > 0.45 && !this.lifted && !this.hook;

    if (this.hook) { // Seilhaken zieht: Geschwindigkeit kommt von außen
      // nichts ändern
    } else {
      let speed;
      if (this.flying) speed = inp.sprint ? 16 : 10.5;
      else if (this.gliding) { speed = 9.5; if (len < 0.1) { wx = -sin; wz = -cos; } }
      else if (this.inWater) speed = 2.8;
      else speed = inp.sprint ? 5.9 : 4.3;
      if (under === B.TURBO) speed *= 2.4;
      const acc = Math.min(1, (this.flying ? 8 : this.onGround ? 14 : this.inWater ? 5 : this.gliding ? 2.5 : 4) * dt);
      this.vx += (wx * speed - this.vx) * acc;
      this.vz += (wz * speed - this.vz) * acc;

      if (this.flying) {
        const tv = ((inp.jump ? 1 : 0) - (inp.down ? 1 : 0)) * (inp.sprint ? 12 : 8);
        this.vy += (tv - this.vy) * Math.min(1, 8 * dt);
      } else if (this.inWater) {
        this.vy -= 9 * dt;
        if (inp.jump) {
          if (eyeWater) this.vy += 24 * dt;
          else this.vy = Math.max(this.vy, 6.5); // am Ufer aus dem Wasser hüpfen
        }
        this.vy -= this.vy * Math.min(1, 3 * dt);
        this.vy = Math.max(-4, Math.min(this.vy, 4));
      } else {
        this.vy = Math.max(-55, this.vy - 28 * dt);
        if (this.gliding) this.vy = Math.max(this.vy, -2.2);
        if (this.lifted) this.vy = Math.min(7.5, this.vy + 60 * dt);
        if (inp.jump && (this.onGround || this.coyote > 0)) { this.vy = under === B.FEDER ? 15 : 8.8; this.onGround = false; this.coyote = 0; }
      }
    }

    const pvy = this.vy;
    this.move(world, 'x', this.vx * dt);
    this.move(world, 'z', this.vz * dt);
    this.onGround = false;
    this.move(world, 'y', this.vy * dt);
    // Federblock: Aufprall wird zurückgeworfen
    if (this.onGround && pvy < -2 && world.getBlock(fx, Math.floor(this.y - 0.05), fz) === B.FEDER) {
      this.vy = Math.min(26, Math.max(10, -pvy * 0.92)); this.onGround = false; this.bounces++;
    }
    this.coyote = this.onGround ? 0.1 : this.coyote - dt;
  }
}

// Amanatides-Woo-Traversal; Luft und Wasser werden durchstrahlt.
export function raycast(world, ox, oy, oz, dx, dy, dz, reach) {
  let x = Math.floor(ox), y = Math.floor(oy), z = Math.floor(oz);
  const sx = dx > 0 ? 1 : -1, sy = dy > 0 ? 1 : -1, sz = dz > 0 ? 1 : -1;
  const tdx = dx !== 0 ? Math.abs(1 / dx) : Infinity, tdy = dy !== 0 ? Math.abs(1 / dy) : Infinity, tdz = dz !== 0 ? Math.abs(1 / dz) : Infinity;
  let tx = dx !== 0 ? (dx > 0 ? x + 1 - ox : ox - x) * tdx : Infinity;
  let ty = dy !== 0 ? (dy > 0 ? y + 1 - oy : oy - y) * tdy : Infinity;
  let tz = dz !== 0 ? (dz > 0 ? z + 1 - oz : oz - z) * tdz : Infinity;
  for (;;) {
    let nx = 0, ny = 0, nz = 0, t;
    if (tx <= ty && tx <= tz) { t = tx; tx += tdx; x += sx; nx = -sx; }
    else if (ty <= tz) { t = ty; ty += tdy; y += sy; ny = -sy; }
    else { t = tz; tz += tdz; z += sz; nz = -sz; }
    if (t > reach) return null;
    const b = world.getBlock(x, y, z);
    if (b !== B.AIR && b !== B.WATER) return { x, y, z, nx, ny, nz, type: b };
  }
}
