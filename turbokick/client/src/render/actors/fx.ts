import * as THREE from 'three';
import { Rng } from '@shared/rng';
import { BALL_RADIUS } from '@shared/sim/types';
import { TAU, columnTexture, glowTexture, ringTexture, teamColors } from './common';

/* ------------------------------------------------------- Glow-Partikel (instanziert) */

const VERT = /* glsl */ `
attribute vec4 aPos;
attribute vec4 aCol;
varying vec2 vUv;
varying vec4 vCol;
void main() {
  vUv = uv;
  vCol = aCol;
  vec4 mv = viewMatrix * vec4(aPos.xyz, 1.0);
  mv.xy += position.xy * aPos.w;
  gl_Position = projectionMatrix * mv;
}`;
const FRAG = /* glsl */ `
uniform sampler2D map;
varying vec2 vUv;
varying vec4 vCol;
void main() {
  float a = texture2D(map, vUv).a * vCol.a;
  if (a < 0.004) discard;
  gl_FragColor = vec4(vCol.rgb, a);
  #include <colorspace_fragment>
}`;

const tmpColor = new THREE.Color();

/**
 * Billboard-Partikel in EINEM Draw-Call (InstancedBufferGeometry). Additiv (Glühen) oder normal (Staub/Rauch).
 * Vollständig vorbelegte Arrays: keine Allokation pro Bild.
 */
export class GlowParticles {
  readonly mesh: THREE.Mesh;
  private readonly geo = new THREE.InstancedBufferGeometry();
  private readonly mat: THREE.ShaderMaterial;
  private n = 0;
  private readonly px: Float32Array;
  private readonly py: Float32Array;
  private readonly pz: Float32Array;
  private readonly vx: Float32Array;
  private readonly vy: Float32Array;
  private readonly vz: Float32Array;
  private readonly life: Float32Array;
  private readonly max: Float32Array;
  private readonly s0: Float32Array;
  private readonly s1: Float32Array;
  private readonly cr: Float32Array;
  private readonly cg: Float32Array;
  private readonly cb: Float32Array;
  private readonly a0: Float32Array;
  private readonly grav: Float32Array;
  private readonly drag: Float32Array;
  private readonly aPos: THREE.InstancedBufferAttribute;
  private readonly aCol: THREE.InstancedBufferAttribute;

  constructor(
    readonly cap: number,
    additive: boolean,
  ) {
    const base = new THREE.PlaneGeometry(1, 1);
    this.geo.index = base.index;
    this.geo.setAttribute('position', base.getAttribute('position'));
    this.geo.setAttribute('uv', base.getAttribute('uv'));
    const mk = (): Float32Array => new Float32Array(cap);
    this.px = mk();
    this.py = mk();
    this.pz = mk();
    this.vx = mk();
    this.vy = mk();
    this.vz = mk();
    this.life = mk();
    this.max = mk();
    this.s0 = mk();
    this.s1 = mk();
    this.cr = mk();
    this.cg = mk();
    this.cb = mk();
    this.a0 = mk();
    this.grav = mk();
    this.drag = mk();
    this.aPos = new THREE.InstancedBufferAttribute(new Float32Array(cap * 4), 4);
    this.aCol = new THREE.InstancedBufferAttribute(new Float32Array(cap * 4), 4);
    this.aPos.setUsage(THREE.DynamicDrawUsage);
    this.aCol.setUsage(THREE.DynamicDrawUsage);
    this.geo.setAttribute('aPos', this.aPos);
    this.geo.setAttribute('aCol', this.aCol);
    this.geo.instanceCount = 0;
    this.mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: glowTexture() } },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    this.mesh = new THREE.Mesh(this.geo, this.mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = additive ? 4 : 3;
  }

  get count(): number {
    return this.n;
  }

  emit(
    x: number,
    y: number,
    z: number,
    vx: number,
    vy: number,
    vz: number,
    color: number,
    size0: number,
    size1: number,
    life: number,
    alpha = 1,
    gravity = 0,
    drag = 0,
  ): void {
    if (this.n >= this.cap || !(life > 0)) return;
    const i = this.n++;
    tmpColor.setHex(color);
    this.px[i] = x;
    this.py[i] = y;
    this.pz[i] = z;
    this.vx[i] = vx;
    this.vy[i] = vy;
    this.vz[i] = vz;
    this.life[i] = life;
    this.max[i] = life;
    this.s0[i] = size0;
    this.s1[i] = size1;
    this.cr[i] = tmpColor.r;
    this.cg[i] = tmpColor.g;
    this.cb[i] = tmpColor.b;
    this.a0[i] = alpha;
    this.grav[i] = gravity;
    this.drag[i] = drag;
  }

  private copy(dst: number, src: number): void {
    this.px[dst] = this.px[src] as number;
    this.py[dst] = this.py[src] as number;
    this.pz[dst] = this.pz[src] as number;
    this.vx[dst] = this.vx[src] as number;
    this.vy[dst] = this.vy[src] as number;
    this.vz[dst] = this.vz[src] as number;
    this.life[dst] = this.life[src] as number;
    this.max[dst] = this.max[src] as number;
    this.s0[dst] = this.s0[src] as number;
    this.s1[dst] = this.s1[src] as number;
    this.cr[dst] = this.cr[src] as number;
    this.cg[dst] = this.cg[src] as number;
    this.cb[dst] = this.cb[src] as number;
    this.a0[dst] = this.a0[src] as number;
    this.grav[dst] = this.grav[src] as number;
    this.drag[dst] = this.drag[src] as number;
  }

  update(dt: number): void {
    const hadAny = this.n > 0;
    for (let i = this.n - 1; i >= 0; i--) {
      const l = (this.life[i] as number) - dt;
      if (l <= 0) {
        this.n--;
        if (i !== this.n) this.copy(i, this.n);
        continue;
      }
      this.life[i] = l;
      const damp = Math.max(0, 1 - (this.drag[i] as number) * dt);
      this.vx[i] = (this.vx[i] as number) * damp;
      this.vz[i] = (this.vz[i] as number) * damp;
      this.vy[i] = (this.vy[i] as number) * damp - (this.grav[i] as number) * dt;
      this.px[i] = (this.px[i] as number) + (this.vx[i] as number) * dt;
      this.py[i] = (this.py[i] as number) + (this.vy[i] as number) * dt;
      this.pz[i] = (this.pz[i] as number) + (this.vz[i] as number) * dt;
    }
    const pa = this.aPos.array as Float32Array;
    const ca = this.aCol.array as Float32Array;
    for (let i = 0; i < this.n; i++) {
      const m = this.max[i] as number;
      const k = 1 - (this.life[i] as number) / m;
      const o = i * 4;
      pa[o] = this.px[i] as number;
      pa[o + 1] = this.py[i] as number;
      pa[o + 2] = this.pz[i] as number;
      pa[o + 3] = (this.s0[i] as number) + ((this.s1[i] as number) - (this.s0[i] as number)) * k;
      ca[o] = this.cr[i] as number;
      ca[o + 1] = this.cg[i] as number;
      ca[o + 2] = this.cb[i] as number;
      // sanftes Einblenden (erste 8 %) und Ausblenden
      ca[o + 3] = (this.a0[i] as number) * Math.min(1, k * 12) * Math.min(1, (1 - k) * 2.2);
    }
    this.geo.instanceCount = this.n;
    if (this.n > 0 || hadAny) {
      this.aPos.needsUpdate = true;
      this.aCol.needsUpdate = true;
    }
  }

  clear(): void {
    this.n = 0;
    this.geo.instanceCount = 0;
  }

  dispose(): void {
    this.mesh.removeFromParent();
    this.geo.dispose();
    this.mat.dispose();
  }
}

/* ------------------------------------------------------------- Trümmer */

const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpP = new THREE.Vector3();
const tmpS = new THREE.Vector3();
const tmpA = new THREE.Vector3();
const tmpCol = new THREE.Color();

/** Kantige Trümmerstücke (InstancedMesh), fliegen, prallen auf den Boden und verschwinden. */
export class Debris {
  readonly mesh: THREE.InstancedMesh;
  private readonly geo = new THREE.BoxGeometry(1, 1, 1);
  private readonly mat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.4, roughness: 0.5, flatShading: true });
  private n = 0;
  private readonly d: Float32Array; // 18 Werte je Stück
  private static readonly W = 18; // px py pz vx vy vz ax ay az ang spin sx sy sz life max (+2 frei)

  constructor(readonly cap: number) {
    this.mesh = new THREE.InstancedMesh(this.geo, this.mat, cap);
    this.mesh.count = 0;
    this.mesh.frustumCulled = false;
    this.mesh.setColorAt(0, tmpCol.set(0xffffff));
    this.d = new Float32Array(cap * Debris.W);
  }

  spawn(x: number, y: number, z: number, vx: number, vy: number, vz: number, color: number, sx: number, sy: number, sz: number, life: number, rng: Rng): void {
    if (this.n >= this.cap) return;
    const o = this.n * Debris.W;
    const d = this.d;
    d[o] = x;
    d[o + 1] = y;
    d[o + 2] = z;
    d[o + 3] = vx;
    d[o + 4] = vy;
    d[o + 5] = vz;
    tmpA.set(rng.float(-1, 1), rng.float(-1, 1), rng.float(-1, 1));
    if (tmpA.lengthSq() < 1e-4) tmpA.set(0, 1, 0);
    tmpA.normalize();
    d[o + 6] = tmpA.x;
    d[o + 7] = tmpA.y;
    d[o + 8] = tmpA.z;
    d[o + 9] = rng.float(0, TAU);
    d[o + 10] = rng.float(-14, 14);
    d[o + 11] = sx;
    d[o + 12] = sy;
    d[o + 13] = sz;
    d[o + 14] = life;
    d[o + 15] = life;
    this.mesh.setColorAt(this.n, tmpCol.setHex(color));
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
    this.n++;
  }

  update(dt: number): void {
    const d = this.d;
    const W = Debris.W;
    for (let i = this.n - 1; i >= 0; i--) {
      const o = i * W;
      d[o + 14] = (d[o + 14] as number) - dt;
      if ((d[o + 14] as number) <= 0) {
        this.n--;
        if (i !== this.n) {
          for (let k = 0; k < W; k++) d[o + k] = d[this.n * W + k] as number;
          this.mesh.getColorAt(this.n, tmpCol);
          this.mesh.setColorAt(i, tmpCol);
          if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
        }
        continue;
      }
      d[o + 4] = (d[o + 4] as number) - 14 * dt;
      d[o] = (d[o] as number) + (d[o + 3] as number) * dt;
      d[o + 1] = (d[o + 1] as number) + (d[o + 4] as number) * dt;
      d[o + 2] = (d[o + 2] as number) + (d[o + 5] as number) * dt;
      if ((d[o + 1] as number) < 0.06 && (d[o + 4] as number) < 0) {
        d[o + 1] = 0.06;
        d[o + 4] = -(d[o + 4] as number) * 0.35;
        d[o + 3] = (d[o + 3] as number) * 0.7;
        d[o + 5] = (d[o + 5] as number) * 0.7;
        d[o + 10] = (d[o + 10] as number) * 0.6;
      }
      d[o + 9] = (d[o + 9] as number) + (d[o + 10] as number) * dt;
    }
    for (let i = 0; i < this.n; i++) {
      const o = i * W;
      const fade = Math.min(1, ((d[o + 14] as number) / (d[o + 15] as number)) * 4);
      tmpP.set(d[o] as number, d[o + 1] as number, d[o + 2] as number);
      tmpA.set(d[o + 6] as number, d[o + 7] as number, d[o + 8] as number);
      tmpQ.setFromAxisAngle(tmpA, d[o + 9] as number);
      tmpS.set((d[o + 11] as number) * fade, (d[o + 12] as number) * fade, (d[o + 13] as number) * fade);
      tmpM.compose(tmpP, tmpQ, tmpS);
      this.mesh.setMatrixAt(i, tmpM);
    }
    this.mesh.count = this.n;
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  clear(): void {
    this.n = 0;
    this.mesh.count = 0;
  }

  dispose(): void {
    this.mesh.removeFromParent();
    this.mesh.dispose();
    this.geo.dispose();
    this.mat.dispose();
  }
}

/* ---------------------------------------------- Ringe, Kugelblitze, Lichtsäulen */

type FlashKind = 'ringFlat' | 'ringVert' | 'sphere' | 'column';

interface Flash {
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  t: number;
  life: number;
  s0: number;
  s1: number;
  h: number;
  a: number;
}

/** Kleiner Pool wiederverwendeter Meshes gleicher Art (additiv, ein Material je Stück wegen eigener Deckkraft). */
class FlashPool {
  readonly items: Flash[] = [];
  private geo: THREE.BufferGeometry;
  constructor(
    parent: THREE.Object3D,
    private readonly kind: FlashKind,
    count: number,
  ) {
    switch (kind) {
      case 'ringFlat':
        this.geo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
        break;
      case 'ringVert':
        this.geo = new THREE.PlaneGeometry(1, 1);
        break;
      case 'sphere':
        this.geo = new THREE.IcosahedronGeometry(0.5, 1);
        break;
      default:
        this.geo = new THREE.CylinderGeometry(0.5, 0.5, 1, 14, 1, true).translate(0, 0.5, 0);
    }
    const tex = kind === 'column' ? columnTexture() : kind === 'sphere' ? null : ringTexture();
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: tex,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: kind === 'sphere' ? THREE.FrontSide : THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(this.geo, mat);
      mesh.visible = false;
      mesh.frustumCulled = false;
      mesh.renderOrder = 5;
      parent.add(mesh);
      this.items.push({ mesh, mat, t: 1, life: 1, s0: 1, s1: 1, h: 1, a: 1 });
    }
  }

  spawn(x: number, y: number, z: number, color: number, s0: number, s1: number, life: number, alpha: number, h = 1): void {
    // Das älteste/fertige Stück verwenden
    let f = this.items[0] as Flash;
    for (const it of this.items) {
      if (it.t >= 1) {
        f = it;
        break;
      }
      if (it.t > f.t) f = it;
    }
    f.t = 0;
    f.life = Math.max(0.05, life);
    f.s0 = s0;
    f.s1 = s1;
    f.h = h;
    f.a = alpha;
    f.mat.color.setHex(color);
    f.mesh.position.set(x, y, z);
    f.mesh.visible = true;
    this.apply(f, s0, 1);
  }

  private apply(f: Flash, s: number, k: number): void {
    switch (this.kind) {
      case 'ringFlat':
        f.mesh.scale.set(s, 1, s);
        break;
      case 'ringVert':
        f.mesh.scale.set(s, s, 1);
        break;
      case 'sphere':
        f.mesh.scale.setScalar(s);
        break;
      default:
        f.mesh.scale.set(s, f.h * (0.35 + 0.65 * k), s);
    }
  }

  update(dt: number): void {
    for (const f of this.items) {
      if (f.t >= 1) continue;
      f.t += dt / f.life;
      if (f.t >= 1) {
        f.t = 1;
        f.mesh.visible = false;
        continue;
      }
      const k = 1 - Math.pow(1 - f.t, 3); // schnell raus, dann ausklingen
      this.apply(f, f.s0 + (f.s1 - f.s0) * k, k);
      f.mat.opacity = f.a * Math.pow(1 - f.t, 1.6);
    }
  }

  dispose(): void {
    for (const f of this.items) {
      f.mesh.removeFromParent();
      f.mat.dispose();
    }
    this.geo.dispose();
  }
}

/* ------------------------------------------------------------- Fx-Sammlung */

/** Alle Ereignis-Effekte: Tor-Explosion, Zerstörung, Pad-Blitz, Staub, Funken … */
export class Fx {
  readonly group = new THREE.Group();
  readonly glow: GlowParticles;
  readonly smoke: GlowParticles;
  private readonly debris: Debris;
  private readonly ringsFlat: FlashPool;
  private readonly ringsVert: FlashPool;
  private readonly spheres: FlashPool;
  private readonly columns: FlashPool;
  private readonly rng = new Rng(0x7b0b1c1c);
  /** 0…1: Anteil der Partikel (Qualität) */
  q: number;

  constructor(particles: number) {
    this.q = Math.max(0, Math.min(1, particles));
    this.glow = new GlowParticles(1400, true);
    this.smoke = new GlowParticles(260, false);
    this.debris = new Debris(40);
    this.ringsFlat = new FlashPool(this.group, 'ringFlat', 8);
    this.ringsVert = new FlashPool(this.group, 'ringVert', 4);
    this.spheres = new FlashPool(this.group, 'sphere', 6);
    this.columns = new FlashPool(this.group, 'column', 6);
    this.group.add(this.glow.mesh, this.smoke.mesh, this.debris.mesh);
  }

  /** Anzahl nach Qualität (mind. 0) */
  private n(base: number): number {
    return Math.round(base * this.q);
  }

  private dir(out: THREE.Vector3): THREE.Vector3 {
    const z = this.rng.float(-1, 1);
    const a = this.rng.float(0, TAU);
    const r = Math.sqrt(1 - z * z);
    return out.set(r * Math.cos(a), z, r * Math.sin(a));
  }

  private readonly d = new THREE.Vector3();

  /** Funken-Salve: von (x,y,z) in alle Richtungen (mit Aufwärtsneigung) */
  private sparks(x: number, y: number, z: number, count: number, speed: number, cols: readonly number[], size: number, life: number, grav: number, up = 0.3): void {
    const n = this.n(count);
    const d = this.d;
    for (let i = 0; i < n; i++) {
      this.dir(d);
      const s = speed * this.rng.float(0.35, 1);
      this.glow.emit(
        x,
        y,
        z,
        d.x * s,
        Math.abs(d.y) * s * (0.4 + up) + d.y * s * 0.3,
        d.z * s,
        cols[this.rng.int(cols.length)] as number,
        size * this.rng.float(0.7, 1.2),
        0.02,
        life * this.rng.float(0.6, 1.1),
        1,
        grav,
        0.6,
      );
    }
  }

  goal(x: number, y: number, z: number, team: number): void {
    const c = teamColors(team);
    this.spheres.spawn(x, y, z, c.main, BALL_RADIUS * 1.6, 15, 0.6, 0.8);
    this.spheres.spawn(x, y, z, 0xffffff, BALL_RADIUS * 1.2, 7, 0.28, 1);
    this.ringsFlat.spawn(x, 0.07, z, c.main, 3, 64, 1.15, 0.95);
    this.ringsFlat.spawn(x, 0.08, z, c.accent, 2, 38, 0.8, 0.8);
    this.ringsVert.spawn(x, y, z, c.accent, 3, 48, 0.95, 0.9);
    this.columns.spawn(x, 0, z, c.main, 2.2, 3.2, 1.2, 0.85, 26);
    this.sparks(x, y, z, 130, 24, [c.main, c.accent, 0xffffff], 0.3, 2.2, 14);
    // Wolken aus Licht
    const n = this.n(22);
    const d = this.d;
    for (let i = 0; i < n; i++) {
      this.dir(d);
      const s = this.rng.float(2, 8);
      this.glow.emit(x, y, z, d.x * s, d.y * s * 0.6, d.z * s, i % 2 ? c.main : c.accent, 2.6, 5.2, this.rng.float(0.5, 0.95), 0.55, 0, 2.5);
    }
    // Funkenregen von oben
    const rain = this.n(80);
    for (let i = 0; i < rain; i++) {
      this.glow.emit(
        x + this.rng.float(-8, 8),
        y + this.rng.float(5, 13),
        z + this.rng.float(-6, 6),
        this.rng.float(-0.6, 0.6),
        this.rng.float(-1, -3.5),
        this.rng.float(-0.6, 0.6),
        this.rng.chance(0.5) ? c.accent : 0xffffff,
        0.24,
        0.03,
        this.rng.float(1.6, 3),
        0.9,
        2.2,
        0.2,
      );
    }
  }

  demo(x: number, y: number, z: number, team: number): void {
    const c = teamColors(team);
    this.spheres.spawn(x, y, z, 0xffe6c0, 0.6, 5.2, 0.38, 1);
    this.spheres.spawn(x, y, z, c.main, 0.8, 8.5, 0.55, 0.7);
    this.ringsFlat.spawn(x, 0.07, z, c.accent, 1.2, 15, 0.7, 0.9);
    this.ringsFlat.spawn(x, y, z, c.main, 1, 10, 0.5, 0.7);
    this.columns.spawn(x, 0, z, c.main, 0.9, 1.6, 0.55, 0.7, 7);
    const d = this.d;
    // Feuerball
    const fb = this.n(16);
    for (let i = 0; i < fb; i++) {
      this.dir(d);
      const s = this.rng.float(1.5, 6.5);
      const col = i % 3 === 0 ? 0xffffff : i % 3 === 1 ? c.accent : c.main;
      this.glow.emit(x, y, z, d.x * s, d.y * s, d.z * s, col, 1.3, 3.2, this.rng.float(0.4, 0.85), 0.8, 0, 2.2);
    }
    this.sparks(x, y, z, 55, 15, [c.main, c.accent, 0xffffff], 0.2, 1.4, 12);
    // Qualm (normale Überblendung, dunkel)
    const sm = this.n(12);
    for (let i = 0; i < sm; i++) {
      this.dir(d);
      const s = this.rng.float(0.8, 3.5);
      this.smoke.emit(x, y, z, d.x * s, Math.abs(d.y) * s + 0.6, d.z * s, 0x1b1e2b, 0.9, 3, this.rng.float(1, 1.8), 0.75, -0.8, 1.4);
    }
    // Trümmer
    const dbr = Math.max(3, this.n(9));
    for (let i = 0; i < dbr; i++) {
      this.dir(d);
      const s = this.rng.float(4, 10);
      const sz = this.rng.float(0.07, 0.2);
      this.debris.spawn(x, y, z, d.x * s, Math.abs(d.y) * s + 2, d.z * s, i % 3 === 0 ? c.main : i % 3 === 1 ? 0x232838 : c.accent, sz, sz * this.rng.float(0.4, 1), sz * this.rng.float(0.8, 1.8), this.rng.float(1.3, 2.1), this.rng);
    }
  }

  respawn(x: number, y: number, z: number, team: number): void {
    const c = teamColors(team);
    this.ringsFlat.spawn(x, 0.07, z, c.accent, 0.6, 5.5, 0.6, 0.85);
    this.columns.spawn(x, 0, z, c.main, 0.9, 0.5, 0.5, 0.6, 4.5);
    this.sparks(x, y, z, 18, 4, [c.accent, 0xffffff], 0.14, 0.6, 3);
  }

  pad(x: number, y: number, z: number, team: number, big: boolean): void {
    const c = teamColors(team);
    this.ringsFlat.spawn(x, y + 0.08, z, big ? c.main : c.accent, 0.5, big ? 6.4 : 3.4, big ? 0.6 : 0.4, 0.95);
    this.columns.spawn(x, y, z, big ? c.main : c.accent, big ? 1.3 : 0.8, big ? 0.8 : 0.5, big ? 0.55 : 0.4, 0.8, big ? 9 : 4.5);
    this.glow.emit(x, y + 0.5, z, 0, 0, 0, 0xffffff, big ? 3.2 : 1.8, 0.2, 0.22, 0.9);
    const n = this.n(big ? 34 : 12);
    for (let i = 0; i < n; i++) {
      const a = this.rng.float(0, TAU);
      const r = this.rng.float(0.1, big ? 0.9 : 0.5);
      this.glow.emit(x + Math.cos(a) * r, y + 0.1, z + Math.sin(a) * r, Math.cos(a) * 0.8, this.rng.float(2.5, big ? 7 : 4.5), Math.sin(a) * 0.8, i % 2 ? 0xffffff : c.accent, 0.2, 0.02, this.rng.float(0.5, 0.9), 1, 6, 0.3);
    }
  }

  jump(x: number, y: number, z: number, team: number, dodge: boolean, grounded: boolean): void {
    const c = teamColors(team);
    if (dodge) {
      this.ringsFlat.spawn(x, y, z, c.accent, 0.8, 3.6, 0.35, 0.6);
      this.sparks(x, y, z, 14, 5, [c.accent, 0xffffff], 0.15, 0.5, 2, 0);
      return;
    }
    if (!grounded && y > 1.2) {
      this.sparks(x, y - 0.1, z, 6, 3, [c.accent], 0.12, 0.4, 2);
      return;
    }
    const n = this.n(9);
    for (let i = 0; i < n; i++) {
      const a = (i / Math.max(1, n)) * TAU + this.rng.float(-0.3, 0.3);
      const s = this.rng.float(1.2, 3);
      this.smoke.emit(x + Math.cos(a) * 0.35, y - 0.15, z + Math.sin(a) * 0.35, Math.cos(a) * s, this.rng.float(0.1, 0.7), Math.sin(a) * s, 0x8f98b8, 0.4, 1.3, this.rng.float(0.45, 0.8), 0.32, -0.2, 3);
    }
    this.ringsFlat.spawn(x, y - 0.12, z, 0x9ab0e0, 0.6, 2.8, 0.35, 0.35);
  }

  touch(x: number, y: number, z: number, nx: number, ny: number, nz: number, team: number, speed: number, ballSpeed: number): void {
    const c = teamColors(team);
    const power = Math.min(1, Math.max(0.15, (speed + ballSpeed) / 60));
    this.glow.emit(x, y, z, 0, 0, 0, 0xffffff, 0.8 + power * 2, 0.2, 0.14, 0.9);
    const n = this.n(5 + power * 26);
    const d = this.d;
    for (let i = 0; i < n; i++) {
      this.dir(d);
      // zur Außenseite des Balls hin
      d.x += nx * 1.3;
      d.y += ny * 1.3;
      d.z += nz * 1.3;
      d.normalize();
      const s = this.rng.float(2, 7 + power * 12);
      this.glow.emit(x, y, z, d.x * s, d.y * s, d.z * s, i % 3 === 0 ? 0xffffff : i % 3 === 1 ? c.accent : c.main, 0.17, 0.02, this.rng.float(0.25, 0.6), 1, 9, 0.8);
    }
    if (ballSpeed > 22) this.spheres.spawn(x, y, z, 0xffffff, BALL_RADIUS * 1.0, BALL_RADIUS * 2.6, 0.2, 0.5);
  }

  wall(x: number, y: number, z: number, speed: number): void {
    const power = Math.min(1, speed / 40);
    this.glow.emit(x, y, z, 0, 0, 0, 0xcfeaff, 0.6 + power * 1.4, 0.2, 0.12, 0.8);
    this.sparks(x, y, z, 4 + power * 14, 3 + power * 8, [0xcfeaff, 0xffffff, 0x7fd8ff], 0.13, 0.45, 8, 0.1);
  }

  update(dt: number): void {
    this.glow.update(dt);
    this.smoke.update(dt);
    this.debris.update(dt);
    this.ringsFlat.update(dt);
    this.ringsVert.update(dt);
    this.spheres.update(dt);
    this.columns.update(dt);
  }

  dispose(): void {
    this.glow.dispose();
    this.smoke.dispose();
    this.debris.dispose();
    this.ringsFlat.dispose();
    this.ringsVert.dispose();
    this.spheres.dispose();
    this.columns.dispose();
    this.group.removeFromParent();
  }
}
