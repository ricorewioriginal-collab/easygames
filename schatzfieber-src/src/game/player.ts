/** Spielfigur-Steuerung (Laufen, Rennen, Springen, Schwimmen, Kollision, Hangneigung) und Verfolgerkamera */
import * as THREE from 'three';
import type { Human } from '../char/human';
import type { Input } from './input';

export interface Ground {
  height(x: number, z: number): number;
  /** Wasseroberfläche an dieser Stelle (oder -Infinity) */
  water(x: number, z: number): number;
  solve(p: { x: number; z: number }, r: number, y: number): void;
  floor(x: number, z: number, y: number): number;
  /** Kamera-Hindernisse: freie Distanz entlang eines Strahls */
  camRay(o: THREE.Vector3, d: THREE.Vector3, max: number): number;
  limit?(p: THREE.Vector3): void;
}

export class Player {
  readonly pos = new THREE.Vector3();
  yaw = 0;
  vy = 0;
  speed = 0;
  onGround = true;
  swimming = false;
  /** Tauchtiefe 0..1 für Tauch-Animation */
  busy = 0;
  busyMode: 'dig' | 'dive' | 'talk' | null = null;
  private vel = new THREE.Vector2();
  constructor(readonly body: Human) {}

  place(x: number, z: number, g: Ground, yaw = this.yaw) {
    this.pos.set(x, Math.max(g.height(x, z), g.floor(x, z, 99)), z);
    this.yaw = yaw;
    this.vy = 0;
    this.vel.set(0, 0);
    this.sync();
  }

  update(dt: number, inp: Input, camYaw: number, g: Ground) {
    const b = this.body;
    if (this.busy > 0) {
      this.busy -= dt;
      b.mode = this.busyMode === 'dive' ? 'dive' : this.busyMode === 'talk' ? 'talk' : 'dig';
      b.speed = 0;
      if (this.busy <= 0) this.busyMode = null;
      b.update(dt);
      this.sync();
      return;
    }
    const gh = g.height(this.pos.x, this.pos.z),
      wl = g.water(this.pos.x, this.pos.z),
      fl = g.floor(this.pos.x, this.pos.z, this.pos.y);
    const ground = Math.max(gh, fl);
    this.swimming = wl - ground > 1.15 && this.pos.y < wl - 0.6 + 0.05 && fl === -Infinity;
    // Wunschrichtung relativ zur Kamera
    const mx = inp.move.x,
      my = inp.move.y,
      ml = Math.hypot(mx, my);
    const run = inp.running && ml > 0.3;
    const max = this.swimming ? (run ? 3.2 : 1.9) : run ? 6.2 : 2.7;
    const s = Math.sin(camYaw),
      c = Math.cos(camYaw);
    // vorwärts = Blickrichtung der Kamera (sin, cos), rechts = (−cos, sin)
    const wx = (-my * s - mx * c) * max,
      wz = (-my * c + mx * s) * max;
    const acc = this.onGround || this.swimming ? 10 : 2.5;
    this.vel.x += (wx - this.vel.x) * Math.min(1, dt * acc);
    this.vel.y += (wz - this.vel.y) * Math.min(1, dt * acc);
    this.speed = this.vel.length();
    if (this.speed > 0.2) {
      const target = Math.atan2(this.vel.x, this.vel.y);
      let d = target - this.yaw;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      this.yaw += d * Math.min(1, dt * 10);
    }
    // horizontale Bewegung mit Hanggrenze
    const nx = this.pos.x + this.vel.x * dt,
      nz = this.pos.z + this.vel.y * dt;
    const step = Math.hypot(nx - this.pos.x, nz - this.pos.z);
    const nh = Math.max(g.height(nx, nz), g.floor(nx, nz, this.pos.y));
    const tooSteep = !this.swimming && step > 1e-4 && (nh - this.pos.y) / step > 1.35 && nh > this.pos.y + 0.25;
    if (!tooSteep) {
      this.pos.x = nx;
      this.pos.z = nz;
    } else {
      this.vel.multiplyScalar(0.3);
    }
    g.solve(this.pos, 0.32, this.pos.y);
    g.limit?.(this.pos);
    // vertikal
    const gh2 = Math.max(g.height(this.pos.x, this.pos.z), g.floor(this.pos.x, this.pos.z, this.pos.y));
    const wl2 = g.water(this.pos.x, this.pos.z);
    if (this.swimming || (wl2 - gh2 > 1.15 && this.pos.y <= wl2 - 0.55)) {
      // schwimmen: Körper auf Wasserhöhe
      const target = wl2 - 1.05;
      this.pos.y += (target - this.pos.y) * Math.min(1, dt * 4);
      this.vy = 0;
      this.onGround = false;
      if (gh2 > target) this.pos.y = gh2;
    } else {
      if (this.onGround && inp.take('jump')) {
        this.vy = 5.2;
        this.onGround = false;
      }
      this.vy -= 15 * dt;
      this.pos.y += this.vy * dt;
      if (this.pos.y <= gh2) {
        // auf dem Boden (auch bergab mitgehen)
        this.pos.y = gh2;
        this.vy = 0;
        this.onGround = true;
      } else if (this.onGround && this.pos.y - gh2 < 0.5 && this.vy <= 0) {
        this.pos.y = gh2;
        this.vy = 0;
      } else this.onGround = false;
    }
    b.mode = this.swimming ? 'swim' : !this.onGround && this.vy !== 0 ? 'jump' : 'walk';
    b.speed = this.speed;
    b.update(dt);
    this.sync();
  }
  sync() {
    this.body.root.position.copy(this.pos);
    this.body.root.rotation.y = this.yaw;
  }
  /** Punkt vor der Figur */
  ahead(d: number, out = new THREE.Vector3()) {
    return out.set(this.pos.x + Math.sin(this.yaw) * d, this.pos.y, this.pos.z + Math.cos(this.yaw) * d);
  }
}

export class FollowCam {
  yaw = Math.PI;
  pitch = 0.32;
  dist = 6;
  private cur = new THREE.Vector3();
  private look = new THREE.Vector3();
  /** Feste Einstellung (Gespräch, Szene) statt Verfolgen */
  shot: { pos: THREE.Vector3; at: THREE.Vector3 } | null = null;
  private lastShot: { pos: THREE.Vector3; at: THREE.Vector3 } | null = null;
  constructor(readonly cam: THREE.PerspectiveCamera) {}

  update(dt: number, target: THREE.Vector3, inp: Input, g: Ground, sens: number, invert: boolean, inDungeon: boolean) {
    if (this.shot) {
      if (this.shot !== this.lastShot && !this.lastShot) {
        // Schnitt: neue Einstellung sofort
        this.cur.copy(this.shot.pos);
        this.look.copy(this.shot.at);
      }
      this.lastShot = this.shot;
      this.cur.lerp(this.shot.pos, Math.min(1, dt * 3.5));
      this.look.lerp(this.shot.at, Math.min(1, dt * 3.5));
      this.cam.position.copy(this.cur);
      this.cam.lookAt(this.look);
      return;
    }
    this.lastShot = null;
    this.yaw -= inp.look.x * 0.0042 * sens;
    this.pitch += inp.look.y * 0.0034 * sens * (invert ? -1 : 1);
    this.pitch = Math.max(-0.35, Math.min(1.25, this.pitch));
    this.dist = Math.max(2.4, Math.min(inDungeon ? 6 : 11, this.dist + inp.zoom * 0.6));
    const head = new THREE.Vector3(target.x, target.y + 1.55, target.z);
    // Kamera hinter der Figur: Richtung von Figur zur Kamera
    const back = new THREE.Vector3(-Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), -Math.cos(this.yaw) * Math.cos(this.pitch));
    let d = g.camRay(head, back, this.dist);
    const p = head.clone().addScaledVector(back, d);
    // nicht unter Gelände oder Wasser
    for (let i = 0; i < 6; i++) {
      const gh = g.height(p.x, p.z) + 0.45,
        wl = g.water(p.x, p.z) + 0.35;
      const minY = Math.max(gh, wl);
      if (p.y >= minY) break;
      d *= 0.82;
      p.copy(head).addScaledVector(back, d);
      if (i === 5) p.y = minY;
    }
    this.cur.lerp(p, Math.min(1, dt * 12));
    this.look.copy(head);
    this.cam.position.copy(this.cur);
    this.cam.lookAt(this.look);
  }
  snap(target: THREE.Vector3) {
    this.cur.set(target.x - Math.sin(this.yaw) * this.dist, target.y + 3, target.z - Math.cos(this.yaw) * this.dist);
    this.look.set(target.x, target.y + 1.5, target.z);
  }
  /** Kamera-Blickrichtung (Gieren) für Bewegung relativ zur Kamera */
  get moveYaw() {
    return this.yaw;
  }
}
