import * as THREE from 'three';
import { ARENA } from '@shared/sim/types';
import type { Rng } from '@shared/rng';
import { attachPointScale, pointsMaterial } from './shaders';
import type { ArenaUniforms } from './shaders';
import type { ArenaTheme } from './themes';
import { TEAM_COLORS } from './themes';

const VX = 130; // halbe Breite des Wettervolumens
const VZ = 140;
const VY = 48;

/** Schnee (Eis), Staub (Canyon) oder schwebende Neon-Funken (Neon) – ein einziger Punkte-Zeichenaufruf */
export class Weather {
  readonly points: THREE.Points;
  private readonly n: number;
  private readonly pos: Float32Array;
  private readonly vel: Float32Array;
  private readonly ph: Float32Array;
  private readonly posAttr: THREE.BufferAttribute;
  private readonly geo: THREE.BufferGeometry;
  private readonly mat: THREE.ShaderMaterial;
  private readonly kind: number;
  private t = 0;

  constructor(theme: ArenaTheme, u: ArenaUniforms, particles: number, rng: Rng) {
    this.kind = theme === 'eis' ? 1 : theme === 'canyon' ? 2 : 0;
    const base = theme === 'eis' ? 900 : theme === 'canyon' ? 520 : 420;
    const n = Math.max(0, Math.floor(base * (0.3 + 0.7 * Math.min(1, Math.max(0, particles)))));
    this.n = n;
    this.pos = new Float32Array(n * 3);
    this.vel = new Float32Array(n * 3);
    this.ph = new Float32Array(n);
    const col = new Float32Array(n * 3);
    const size = new Float32Array(n);
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      this.pos[i * 3] = rng.float(-VX, VX);
      this.pos[i * 3 + 1] = rng.float(0, VY);
      this.pos[i * 3 + 2] = rng.float(-VZ, VZ);
      this.ph[i] = rng.next();
      if (this.kind === 1) {
        this.vel.set([rng.float(-0.4, 0.4), rng.float(-2.6, -1.1), rng.float(-0.4, 0.4)], i * 3);
        size[i] = rng.float(0.14, 0.3);
        c.setRGB(0.9, 0.95, 1).multiplyScalar(rng.float(0.5, 0.9));
      } else if (this.kind === 2) {
        this.vel.set([rng.float(2, 5), rng.float(-0.2, 0.5), rng.float(-1, 1)], i * 3);
        size[i] = rng.float(0.6, 1.6);
        c.setHex(0xff9a4a).multiplyScalar(rng.float(0.06, 0.18));
      } else {
        this.vel.set([rng.float(-0.3, 0.3), rng.float(0.5, 1.5), rng.float(-0.3, 0.3)], i * 3);
        size[i] = rng.float(0.18, 0.42);
        c.setHex(rng.chance(0.5) ? 0xff3da8 : 0x32e6ff).multiplyScalar(rng.float(0.6, 1.3));
      }
      col.set([c.r, c.g, c.b], i * 3);
    }
    this.geo = new THREE.BufferGeometry();
    this.posAttr = new THREE.BufferAttribute(this.pos, 3);
    this.posAttr.setUsage(THREE.DynamicDrawUsage);
    this.geo.setAttribute('position', this.posAttr);
    this.geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    this.geo.setAttribute('size', new THREE.BufferAttribute(size, 1));
    this.geo.setAttribute('phase', new THREE.BufferAttribute(this.ph, 1));
    this.mat = pointsMaterial(u, { blink: this.kind === 0, alpha: 1 });
    this.points = new THREE.Points(this.geo, this.mat);
    this.points.frustumCulled = false;
    this.points.visible = n > 0;
    attachPointScale(this.points, u);
  }

  update(dt: number): void {
    if (this.n === 0) return;
    this.t += dt;
    const p = this.pos;
    const v = this.vel;
    const k = this.kind;
    for (let i = 0; i < this.n; i++) {
      const j = i * 3;
      const ph = this.ph[i] as number;
      const sway = k === 1 ? Math.sin(this.t * 0.9 + ph * 40) * 0.6 : k === 0 ? Math.sin(this.t * 0.6 + ph * 30) * 0.3 : 0;
      p[j] = (p[j] as number) + ((v[j] as number) + sway) * dt;
      p[j + 1] = (p[j + 1] as number) + (v[j + 1] as number) * dt;
      p[j + 2] = (p[j + 2] as number) + (v[j + 2] as number) * dt;
      if ((p[j] as number) > VX) p[j] = (p[j] as number) - 2 * VX;
      else if ((p[j] as number) < -VX) p[j] = (p[j] as number) + 2 * VX;
      if ((p[j + 2] as number) > VZ) p[j + 2] = (p[j + 2] as number) - 2 * VZ;
      else if ((p[j + 2] as number) < -VZ) p[j + 2] = (p[j + 2] as number) + 2 * VZ;
      if ((p[j + 1] as number) < 0) p[j + 1] = (p[j + 1] as number) + VY;
      else if ((p[j + 1] as number) > VY) p[j + 1] = (p[j + 1] as number) - VY;
    }
    this.posAttr.needsUpdate = true;
  }

  dispose(): void {
    this.geo.dispose();
    this.mat.dispose();
    this.points.removeFromParent();
  }
}

const MAX_SHELLS = 8;
const MAX_FOUNTAINS = 4;

/** Torjubel: Feuerwerksraketen, Funkenfontänen an den Pfosten – ein einziger Punkte-Zeichenaufruf mit Ringpuffer */
export class Fireworks {
  readonly points: THREE.Points;
  private readonly n: number;
  private readonly pos: Float32Array;
  private readonly vel: Float32Array;
  private readonly base: Float32Array;
  private readonly out: Float32Array;
  private readonly life: Float32Array;
  private readonly maxLife: Float32Array;
  private readonly sz: Float32Array;
  private readonly szOut: Float32Array;
  private readonly g: number[];
  private readonly geo: THREE.BufferGeometry;
  private readonly mat: THREE.ShaderMaterial;
  private readonly posAttr: THREE.BufferAttribute;
  private readonly colAttr: THREE.BufferAttribute;
  private readonly szAttr: THREE.BufferAttribute;
  private cursor = 0;
  private idle = true;
  private readonly quality: number;
  // Raketen
  private shState = new Uint8Array(MAX_SHELLS);
  private shTime = new Float32Array(MAX_SHELLS);
  private shFuse = new Float32Array(MAX_SHELLS);
  private shPos = new Float32Array(MAX_SHELLS * 3);
  private shVel = new Float32Array(MAX_SHELLS * 3);
  private shCol = new Float32Array(MAX_SHELLS * 3);
  // Fontänen
  private foTime = new Float32Array(MAX_FOUNTAINS);
  private foPos = new Float32Array(MAX_FOUNTAINS * 3);
  private foCol = new Float32Array(MAX_FOUNTAINS * 3);
  private foAcc = new Float32Array(MAX_FOUNTAINS);
  private readonly tmp = new THREE.Color();

  constructor(u: ArenaUniforms, particles: number, private readonly rng: Rng) {
    this.quality = Math.min(1, Math.max(0, particles));
    const n = Math.floor(900 * (0.35 + 0.65 * this.quality));
    this.n = n;
    this.g = [0, -9.5, 0];
    this.pos = new Float32Array(n * 3);
    this.vel = new Float32Array(n * 3);
    this.base = new Float32Array(n * 3);
    this.out = new Float32Array(n * 3);
    this.life = new Float32Array(n);
    this.maxLife = new Float32Array(n).fill(1);
    this.sz = new Float32Array(n);
    this.szOut = new Float32Array(n);
    for (let i = 0; i < n; i++) this.pos[i * 3 + 1] = -100;
    this.geo = new THREE.BufferGeometry();
    this.posAttr = new THREE.BufferAttribute(this.pos, 3);
    this.colAttr = new THREE.BufferAttribute(this.out, 3);
    this.szAttr = new THREE.BufferAttribute(this.szOut, 1);
    for (const a of [this.posAttr, this.colAttr, this.szAttr]) a.setUsage(THREE.DynamicDrawUsage);
    this.geo.setAttribute('position', this.posAttr);
    this.geo.setAttribute('color', this.colAttr);
    this.geo.setAttribute('size', this.szAttr);
    this.geo.setAttribute('phase', new THREE.BufferAttribute(new Float32Array(n), 1));
    this.mat = pointsMaterial(u, { alpha: 1 });
    this.points = new THREE.Points(this.geo, this.mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 6;
    attachPointScale(this.points, u);
  }

  private spawn(x: number, y: number, z: number, vx: number, vy: number, vz: number, c: THREE.Color, life: number, size: number): void {
    const i = this.cursor;
    this.cursor = (this.cursor + 1) % this.n;
    const j = i * 3;
    this.pos[j] = x;
    this.pos[j + 1] = y;
    this.pos[j + 2] = z;
    this.vel[j] = vx;
    this.vel[j + 1] = vy;
    this.vel[j + 2] = vz;
    this.base[j] = c.r;
    this.base[j + 1] = c.g;
    this.base[j + 2] = c.b;
    this.life[i] = life;
    this.maxLife[i] = life;
    this.sz[i] = size;
    this.idle = false;
  }

  /** Startet das Spektakel für das Team, das getroffen hat */
  celebrate(team: 0 | 1): void {
    if (this.n === 0) return;
    const r = this.rng;
    const L = ARENA.halfLength;
    const sgn = team === 0 ? 1 : -1; // Team 0 greift das Tor bei +z an
    const shells = Math.max(3, Math.round(MAX_SHELLS * (0.5 + 0.5 * this.quality)));
    for (let i = 0; i < shells; i++) {
      const k = i * 3;
      this.shState[i] = 1;
      this.shTime[i] = i * 0.28 + r.float(0, 0.25);
      this.shFuse[i] = r.float(1.0, 1.5);
      const along = i % 3 === 0 ? 0 : 1;
      this.shPos[k] = r.float(-34, 34);
      this.shPos[k + 1] = 1;
      this.shPos[k + 2] = sgn * (along ? r.float(L + 14, L + 34) : r.float(-18, 18));
      this.shVel[k] = r.float(-3, 3);
      this.shVel[k + 1] = r.float(30, 38);
      this.shVel[k + 2] = r.float(-3, 3);
      const col = this.tmp.setHex(i % 2 ? 0xffe9a8 : TEAM_COLORS[team]);
      this.shCol[k] = col.r;
      this.shCol[k + 1] = col.g;
      this.shCol[k + 2] = col.b;
    }
    // Fontänen an beiden Pfosten des getroffenen Tors
    const gw = ARENA.goalHalfWidth;
    for (let i = 0; i < MAX_FOUNTAINS; i++) {
      const k = i * 3;
      this.foTime[i] = 2.8;
      this.foAcc[i] = 0;
      this.foPos[k] = i % 2 ? gw : -gw;
      this.foPos[k + 1] = 0.5;
      this.foPos[k + 2] = (i < 2 ? sgn : -sgn) * (L - 0.6);
      const col = this.tmp.setHex(i < 2 ? TEAM_COLORS[team] : 0xffd98a);
      this.foCol[k] = col.r;
      this.foCol[k + 1] = col.g;
      this.foCol[k + 2] = col.b;
    }
    this.idle = false;
  }

  update(dt: number): void {
    if (this.idle) return;
    const r = this.rng;
    const c = this.tmp;
    let busy = false;
    // Raketen
    for (let i = 0; i < MAX_SHELLS; i++) {
      const st = this.shState[i] as number;
      if (st === 0) continue;
      busy = true;
      const k = i * 3;
      if (st === 1) {
        this.shTime[i] = (this.shTime[i] as number) - dt;
        if ((this.shTime[i] as number) <= 0) this.shState[i] = 2;
        continue;
      }
      this.shPos[k] = (this.shPos[k] as number) + (this.shVel[k] as number) * dt;
      this.shPos[k + 1] = (this.shPos[k + 1] as number) + (this.shVel[k + 1] as number) * dt;
      this.shPos[k + 2] = (this.shPos[k + 2] as number) + (this.shVel[k + 2] as number) * dt;
      this.shVel[k + 1] = (this.shVel[k + 1] as number) - 6 * dt;
      c.setRGB(1, 0.8, 0.45);
      this.spawn(this.shPos[k] as number, this.shPos[k + 1] as number, this.shPos[k + 2] as number, r.float(-0.6, 0.6), r.float(-3, -1), r.float(-0.6, 0.6), c, 0.55, 0.5);
      this.shFuse[i] = (this.shFuse[i] as number) - dt;
      if ((this.shFuse[i] as number) <= 0) {
        this.shState[i] = 0;
        const cnt = Math.round(70 * (0.5 + 0.5 * this.quality));
        const hot = r.chance(0.5);
        for (let m = 0; m < cnt; m++) {
          const uu = r.float(-1, 1);
          const a = r.float(0, Math.PI * 2);
          const rr = Math.sqrt(1 - uu * uu);
          const sp = r.float(7, 15);
          if (hot && r.chance(0.35)) c.setRGB(1.2, 1.1, 0.8);
          else c.setRGB(this.shCol[k] as number, this.shCol[k + 1] as number, this.shCol[k + 2] as number).multiplyScalar(1.4);
          this.spawn(this.shPos[k] as number, this.shPos[k + 1] as number, this.shPos[k + 2] as number, rr * Math.cos(a) * sp, uu * sp, rr * Math.sin(a) * sp, c, r.float(1.4, 2.4), r.float(0.7, 1.3));
        }
      }
    }
    // Fontänen
    for (let i = 0; i < MAX_FOUNTAINS; i++) {
      const left = this.foTime[i] as number;
      if (left <= 0) continue;
      busy = true;
      this.foTime[i] = left - dt;
      const k = i * 3;
      this.foAcc[i] = (this.foAcc[i] as number) + dt * 110 * (0.4 + 0.6 * this.quality);
      c.setRGB(this.foCol[k] as number, this.foCol[k + 1] as number, this.foCol[k + 2] as number).multiplyScalar(1.5);
      while ((this.foAcc[i] as number) >= 1) {
        this.foAcc[i] = (this.foAcc[i] as number) - 1;
        const a = r.float(0, Math.PI * 2);
        const sp = r.float(0.5, 3.5);
        this.spawn(this.foPos[k] as number, this.foPos[k + 1] as number, this.foPos[k + 2] as number, Math.cos(a) * sp, r.float(11, 17), Math.sin(a) * sp, c, r.float(0.8, 1.4), r.float(0.4, 0.8));
      }
    }
    // Funken
    const drag = Math.max(0, 1 - 1.1 * dt);
    for (let i = 0; i < this.n; i++) {
      const l = this.life[i] as number;
      const j = i * 3;
      if (l <= 0) {
        if ((this.szOut[i] as number) !== 0) {
          this.szOut[i] = 0;
          this.out[j] = this.out[j + 1] = this.out[j + 2] = 0;
        }
        continue;
      }
      busy = true;
      this.life[i] = l - dt;
      this.vel[j] = (this.vel[j] as number) * drag;
      this.vel[j + 1] = (this.vel[j + 1] as number) * drag + (this.g[1] as number) * dt;
      this.vel[j + 2] = (this.vel[j + 2] as number) * drag;
      this.pos[j] = (this.pos[j] as number) + (this.vel[j] as number) * dt;
      this.pos[j + 1] = (this.pos[j + 1] as number) + (this.vel[j + 1] as number) * dt;
      this.pos[j + 2] = (this.pos[j + 2] as number) + (this.vel[j + 2] as number) * dt;
      const f = Math.max(0, l / (this.maxLife[i] as number));
      const fade = f * f;
      this.out[j] = (this.base[j] as number) * fade;
      this.out[j + 1] = (this.base[j + 1] as number) * fade;
      this.out[j + 2] = (this.base[j + 2] as number) * fade;
      this.szOut[i] = (this.sz[i] as number) * (0.5 + 0.5 * f);
    }
    this.posAttr.needsUpdate = true;
    this.colAttr.needsUpdate = true;
    this.szAttr.needsUpdate = true;
    if (!busy) this.idle = true;
  }

  dispose(): void {
    this.geo.dispose();
    this.mat.dispose();
    this.points.removeFromParent();
  }
}
