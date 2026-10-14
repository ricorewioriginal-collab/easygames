/* Spielfigur: Laufen, Rennen, Springen (mit Doppelsprung, Sprungpuffer und Kanten-Gnadenzeit), Schwimmen, Gleiten, Ki-Sprung.
   Bewegung relativ zur Kamera; Physik über world/physics. */
import { clamp, damp, dampAngle } from '../core/math.ts';
import type { Avatar } from '../characters/avatar.ts';
import type { Physics } from '../world/physics.ts';
import type { Input } from '../input/input.ts';

export interface PlayerAbilities { has(id: string): boolean }

export class Player {
  readonly pos = new THREE.Vector3();
  vy = 0;
  yaw = Math.PI;
  speed = 0;
  grounded = true;
  swimming = false;
  gliding = false;
  private jumps = 0;
  private coyote = 0;
  private buffer = 0;
  private hvx = 0;
  private hvz = 0;
  radius = 0.38;
  frozen = false;
  /** Externer Schub (z. B. Rückstoß im Kampf). */
  push = { x: 0, z: 0 };
  lastGroundY = 0;
  waterLevel = -Infinity;
  /** Zusatz-Geschwindigkeit (Ausrüstung). */
  speedMul = 1;
  jumpMul = 1;
  private kiCharge = 0;
  kiCharging = false;
  onLand: ((fall: number) => void) | null = null;
  onJump: ((double: boolean) => void) | null = null;
  onSplash: (() => void) | null = null;
  airTime = 0;
  fallStartY = 0;

  constructor(public avatar: Avatar, private physics: Physics, private abil: PlayerAbilities) { }

  teleport(x: number, z: number, yaw?: number): void {
    const g = this.physics.ground(x, z, 200);
    this.pos.set(x, Math.max(g.y, g.water - 1.1 > g.y ? g.water - 1.1 : g.y) + 0.05, z);
    this.vy = 0; this.hvx = this.hvz = 0;
    if (yaw !== undefined) this.yaw = yaw;
    this.avatar.root.position.copy(this.pos);
    this.avatar.root.rotation.y = this.yaw;
  }

  update(dt: number, input: Input, camYaw: number, allowMove: boolean): void {
    const P = this.physics;
    // Eingabe relativ zur Kamera
    let mx = allowMove && !this.frozen ? input.moveX : 0, my = allowMove && !this.frozen ? input.moveY : 0;
    const mag = Math.min(1, Math.hypot(mx, my));
    const fx = Math.sin(camYaw), fz = Math.cos(camYaw);   // Kamera schaut entlang (fx,fz)
    let dx = fx * my - fz * mx, dz = fz * my + fx * mx;
    const dl = Math.hypot(dx, dz);
    if (dl > 1e-4) { dx /= dl; dz /= dl; }
    const run = input.isHeld('sprint') || (input.lastDevice === 'touch' && mag > 0.92) || (input.lastDevice === 'gamepad' && mag > 0.95);
    let target = this.swimming ? (run ? 4.4 : 3.0) : run ? 7.6 : 4.4 * clamp(mag * 1.15, 0, 1);
    if (this.gliding) target = 8.5;
    target *= this.speedMul;
    if (mag < 0.08) target = 0;
    const accel = this.grounded || this.swimming ? 12 : 4.5;
    this.hvx = damp(this.hvx, dx * target, accel, dt);
    this.hvz = damp(this.hvz, dz * target, accel, dt);
    if (mag > 0.08) this.yaw = dampAngle(this.yaw, Math.atan2(dx, dz), this.grounded ? 14 : 7, dt);
    // Sprung (Puffer + Kanten-Gnadenzeit)
    if (allowMove && !this.frozen && input.pressed('jump')) this.buffer = 0.14;
    this.buffer -= dt;
    this.coyote = this.grounded ? 0.12 : this.coyote - dt;
    if (this.buffer > 0 && !this.swimming) {
      if (this.coyote > 0) { this.vy = 9.2 * this.jumpMul; this.grounded = false; this.coyote = 0; this.buffer = 0; this.jumps = 1; this.onJump?.(false); this.fallStartY = this.pos.y; }
      else if (this.jumps < 2 && this.abil.has('doppelsprung')) { this.vy = 8.2 * this.jumpMul; this.jumps = 2; this.buffer = 0; this.onJump?.(true); }
    }
    if (this.buffer > 0 && this.swimming) { this.vy = 7.5; this.swimming = false; this.buffer = 0; this.jumps = 1; }
    // Ki-Sprung: Springen gedrückt halten am Boden lädt auf
    if (this.abil.has('kisprung') && this.grounded && input.isHeld('down') && allowMove) {
      this.kiCharging = true; this.kiCharge = Math.min(1, this.kiCharge + dt * 0.9);
    } else if (this.kiCharging) {
      this.kiCharging = false;
      if (this.kiCharge > 0.35) { this.vy = 9 + this.kiCharge * 9; this.grounded = false; this.jumps = 2; this.onJump?.(true); }
      this.kiCharge = 0;
    }
    // Gleiten: in der Luft Springen halten
    this.gliding = !this.grounded && !this.swimming && this.vy < 0 && this.abil.has('gleiten') && input.isHeld('jump') && allowMove;
    // Schwerkraft
    if (!this.swimming) {
      this.vy -= (this.gliding ? 6 : 24) * dt;
      if (this.gliding) this.vy = Math.max(this.vy, -2.2);
      this.vy = Math.max(this.vy, -40);
    }
    // Waagerechte Bewegung mit Kollision
    const h = this.avatar.height * 0.95;
    P.move(this.pos, (this.hvx + this.push.x) * dt, (this.hvz + this.push.z) * dt, this.radius, h);
    this.push.x = damp(this.push.x, 0, 6, dt); this.push.z = damp(this.push.z, 0, 6, dt);
    // Senkrecht
    const g = P.ground(this.pos.x, this.pos.z, this.pos.y);
    this.waterLevel = g.water;
    const wasGrounded = this.grounded;
    if (g.water > g.y + 1.05 && this.pos.y < g.water - 0.9) {
      // Schwimmen
      if (!this.swimming) this.onSplash?.();
      this.swimming = true; this.grounded = false; this.jumps = 0;
      this.pos.y = damp(this.pos.y, g.water - 1.05, 6, dt);
      this.vy = 0;
    } else {
      if (this.swimming && this.pos.y >= g.y - 0.05) { this.swimming = false; }
      this.swimming = false;
      this.pos.y += this.vy * dt;
      if (this.pos.y <= g.y) {
        const fall = this.fallStartY - g.y;
        this.pos.y = g.y;
        if (this.vy < -2 && !wasGrounded) this.onLand?.(fall);
        this.vy = 0; this.grounded = true; this.jumps = 0; this.lastGroundY = g.y;
      } else if (this.pos.y - g.y > 0.08 || this.vy > 0) {
        if (wasGrounded && this.vy <= 0 && this.pos.y - g.y < 0.6) { this.pos.y = g.y; this.grounded = true; }
        else { if (wasGrounded) this.fallStartY = this.pos.y; this.grounded = false; }
      } else { this.pos.y = g.y; this.grounded = true; }
    }
    if (!this.grounded) this.airTime += dt; else this.airTime = 0;
    // Kopf stößt an Decke? (einfach: über Körper hinweg)
    this.speed = Math.hypot(this.hvx, this.hvz);
    // Weltgrenze
    const R = Math.hypot(this.pos.x, this.pos.z);
    if (R > 1700) { this.pos.x *= 1700 / R; this.pos.z *= 1700 / R; }
    // Avatar
    const av = this.avatar;
    av.root.position.copy(this.pos);
    av.root.rotation.y = this.yaw;
    av.speed = this.speed; av.vy = this.vy;
    av.pose = this.swimming ? 'swim' : this.gliding ? 'glide' : !this.grounded && this.airTime > 0.08 ? 'air' : this.speed > 0.3 ? 'walk' : 'idle';
    if (this.kiCharging) { av.pose = 'idle'; if (!av.emoting) av.play('cast', 0.3); }
  }
  get kiLevel(): number { return this.kiCharge; }
  stop(): void { this.hvx = this.hvz = 0; this.speed = 0; }
}
