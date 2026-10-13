// Effekte: Partikel, Leuchtspuren, Mündungsfeuer, Explosionen, Sturmwand, Riftfähre, Bodenbeute, Geschosse.
import * as THREE from 'three';
import { BUS_HEIGHT, MAP_SIZE } from '../../../shared/src/constants';
import { AMMO_COLORS, DropKind, RARITY_COLORS } from '../../../shared/src/items';
import type { GroundItem } from '../../../shared/src/match';
import { merge, tint } from './models';
import { weaponGeometry, weaponMaterial } from './weapons';

// ---------- Partikel ----------

export class Particles {
  readonly points: THREE.Points;
  private readonly max: number;
  private readonly pos: Float32Array;
  private readonly col: Float32Array;
  private readonly size: Float32Array;
  private readonly vel: Float32Array;
  private readonly life: Float32Array;
  private readonly maxLife: Float32Array;
  private readonly grav: Float32Array;
  private readonly baseCol: Float32Array;
  private next = 0;
  density = 1;

  constructor(max = 2400) {
    this.max = max;
    this.pos = new Float32Array(max * 3);
    this.col = new Float32Array(max * 3);
    this.size = new Float32Array(max);
    this.vel = new Float32Array(max * 3);
    this.life = new Float32Array(max);
    this.maxLife = new Float32Array(max);
    this.grav = new Float32Array(max);
    this.baseCol = new Float32Array(max * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('size', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    const m = new THREE.ShaderMaterial({
      uniforms: { scale: { value: 600 } },
      vertexShader: `attribute float size; varying vec3 vC; uniform float scale;
        void main(){ vC = color; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = size * scale / max(0.5, -mv.z); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying vec3 vC; void main(){ vec2 d = gl_PointCoord - 0.5; float r = dot(d,d); if (r > 0.25) discard; gl_FragColor = vec4(vC, 1.0 - r * 3.2); }`,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.points = new THREE.Points(g, m);
    this.points.frustumCulled = false;
    this.points.renderOrder = 5;
  }

  setScale(px: number): void {
    (this.points.material as THREE.ShaderMaterial).uniforms.scale!.value = px;
  }

  emit(x: number, y: number, z: number, n: number, color: number, speed: number, life: number, size: number, gravity = 9, up = 0): void {
    n = Math.max(1, Math.round(n * this.density));
    const c = new THREE.Color(color);
    for (let k = 0; k < n; k++) {
      const i = this.next;
      this.next = (this.next + 1) % this.max;
      this.pos[i * 3] = x;
      this.pos[i * 3 + 1] = y;
      this.pos[i * 3 + 2] = z;
      const a = Math.random() * Math.PI * 2,
        b = Math.acos(Math.random() * 2 - 1);
      const s = speed * (0.4 + Math.random() * 0.6);
      this.vel[i * 3] = Math.sin(b) * Math.cos(a) * s;
      this.vel[i * 3 + 1] = Math.cos(b) * s + up;
      this.vel[i * 3 + 2] = Math.sin(b) * Math.sin(a) * s;
      this.life[i] = this.maxLife[i] = life * (0.6 + Math.random() * 0.6);
      this.grav[i] = gravity;
      this.size[i] = size * (0.6 + Math.random() * 0.8);
      this.baseCol[i * 3] = c.r;
      this.baseCol[i * 3 + 1] = c.g;
      this.baseCol[i * 3 + 2] = c.b;
    }
  }

  update(dt: number): void {
    for (let i = 0; i < this.max; i++) {
      if (this.life[i]! <= 0) continue;
      const l = (this.life[i]! -= dt);
      if (l <= 0) {
        this.size[i] = 0;
        continue;
      }
      this.vel[i * 3 + 1]! -= this.grav[i]! * dt;
      this.pos[i * 3]! += this.vel[i * 3]! * dt;
      this.pos[i * 3 + 1]! += this.vel[i * 3 + 1]! * dt;
      this.pos[i * 3 + 2]! += this.vel[i * 3 + 2]! * dt;
      const f = l / this.maxLife[i]!;
      this.col[i * 3] = this.baseCol[i * 3]! * f;
      this.col[i * 3 + 1] = this.baseCol[i * 3 + 1]! * f;
      this.col[i * 3 + 2] = this.baseCol[i * 3 + 2]! * f;
    }
    const g = this.points.geometry;
    (g.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (g.attributes.color as THREE.BufferAttribute).needsUpdate = true;
    (g.attributes.size as THREE.BufferAttribute).needsUpdate = true;
  }
}

// ---------- Leuchtspuren ----------

export class Tracers {
  readonly lines: THREE.LineSegments;
  private readonly max = 160;
  private readonly pos: Float32Array;
  private readonly col: Float32Array;
  private readonly life: Float32Array;
  private readonly base: Float32Array;
  private next = 0;
  constructor() {
    this.pos = new Float32Array(this.max * 6);
    this.col = new Float32Array(this.max * 6);
    this.life = new Float32Array(this.max);
    this.base = new Float32Array(this.max * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    this.lines = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.lines.frustumCulled = false;
  }
  add(ax: number, ay: number, az: number, bx: number, by: number, bz: number, color = 0xfff2b0): void {
    const i = this.next;
    this.next = (this.next + 1) % this.max;
    // Leuchtspur nur ein Stück lang, startet etwas vor der Mündung
    const dx = bx - ax,
      dy = by - ay,
      dz = bz - az;
    const L = Math.hypot(dx, dy, dz) || 1;
    const s0 = Math.min(1, 0.6 / L);
    this.pos.set([ax + dx * s0, ay + dy * s0, az + dz * s0, bx, by, bz], i * 6);
    const c = new THREE.Color(color);
    this.base.set([c.r, c.g, c.b], i * 3);
    this.life[i] = 0.09;
  }
  update(dt: number): void {
    for (let i = 0; i < this.max; i++) {
      const l = Math.max(0, this.life[i]! - dt);
      this.life[i] = l;
      const f = l / 0.09;
      for (let k = 0; k < 2; k++) {
        this.col[i * 6 + k * 3] = this.base[i * 3]! * f * (k ? 1 : 0.3);
        this.col[i * 6 + k * 3 + 1] = this.base[i * 3 + 1]! * f * (k ? 1 : 0.3);
        this.col[i * 6 + k * 3 + 2] = this.base[i * 3 + 2]! * f * (k ? 1 : 0.3);
      }
    }
    (this.lines.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (this.lines.geometry.attributes.color as THREE.BufferAttribute).needsUpdate = true;
  }
}

// ---------- Blitze (Mündungsfeuer, Explosionen) ----------

export class Flashes {
  readonly group = new THREE.Group();
  private readonly pool: { m: THREE.Mesh; life: number; max: number; grow: number }[] = [];
  private readonly light: THREE.PointLight;
  private lightLife = 0;
  constructor() {
    const g = new THREE.SphereGeometry(1, 10, 8);
    for (let i = 0; i < 24; i++) {
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
      m.visible = false;
      this.group.add(m);
      this.pool.push({ m, life: 0, max: 1, grow: 0 });
    }
    this.light = new THREE.PointLight(0xffaa55, 0, 18, 2);
    this.group.add(this.light);
  }
  flash(x: number, y: number, z: number, size: number, color: number, life: number, grow = 0): void {
    const f = this.pool.find((p) => p.life <= 0) ?? this.pool[0]!;
    f.life = f.max = life;
    f.grow = grow;
    f.m.visible = true;
    f.m.position.set(x, y, z);
    f.m.scale.setScalar(size);
    (f.m.material as THREE.MeshBasicMaterial).color.setHex(color);
    if (size > 0.8) {
      this.light.position.set(x, y + 0.5, z);
      this.light.intensity = 40 * size;
      this.light.distance = 8 + size * 6;
      this.lightLife = life;
    }
  }
  update(dt: number): void {
    for (const f of this.pool) {
      if (f.life <= 0) continue;
      f.life -= dt;
      const t = Math.max(0, f.life / f.max);
      (f.m.material as THREE.MeshBasicMaterial).opacity = t;
      if (f.grow) f.m.scale.multiplyScalar(1 + f.grow * dt);
      if (f.life <= 0) f.m.visible = false;
    }
    if (this.lightLife > 0) {
      this.lightLife -= dt;
      if (this.lightLife <= 0) this.light.intensity = 0;
      else this.light.intensity *= 0.85;
    }
  }
}

// ---------- Sturmwand ----------

export class StormWall {
  readonly mesh: THREE.Mesh;
  private readonly mat: THREE.ShaderMaterial;
  private t = 0;
  constructor() {
    this.mat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, color: { value: new THREE.Color(0xb64bff) }, color2: { value: new THREE.Color(0x3ff2ff) } },
      vertexShader: `varying vec2 vUv; varying vec3 vW; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `uniform float time; uniform vec3 color; uniform vec3 color2; varying vec2 vUv; varying vec3 vW;
        void main(){
          float a = atan(vW.z - 768.0, vW.x - 768.0);
          float s = sin(a * 18.0 + vW.y * 0.02 - time * 0.6) * 0.5 + 0.5;
          float s2 = sin(a * 7.0 - vW.y * 0.035 + time * 0.4) * 0.5 + 0.5;
          float fall = smoothstep(0.0, 0.04, vUv.y) * (1.0 - smoothstep(0.45, 1.0, vUv.y));
          vec3 c = mix(color, color2, s2 * 0.25) * (0.85 + s * 0.3);
          gl_FragColor = vec4(c, (0.16 + s * s2 * 0.18) * fall);
        }`,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      fog: false,
    });
    const g = new THREE.CylinderGeometry(1, 1, 1, 128, 1, true);
    g.translate(0, 0.5, 0);
    this.mesh = new THREE.Mesh(g, this.mat);
    this.mesh.renderOrder = 4;
    this.mesh.frustumCulled = false;
  }
  update(dt: number, cx: number, cz: number, r: number): void {
    this.t += dt;
    this.mat.uniforms.time!.value = this.t;
    this.mesh.position.set(cx, -20, cz);
    this.mesh.scale.set(Math.max(0.1, r), 420, Math.max(0.1, r));
  }
}

// ---------- Riftfähre (Absprung-Luftschiff) ----------

export function makeAirship(): THREE.Group {
  const g = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), new THREE.MeshLambertMaterial({ color: 0x3a2d6a }));
  hull.scale.set(9, 6, 26);
  g.add(hull);
  const band = new THREE.Mesh(new THREE.TorusGeometry(9.1, 0.5, 6, 32), new THREE.MeshLambertMaterial({ color: 0x3ff2ff, emissive: 0x1aa6c9 }));
  band.scale.set(1, 0.66, 1);
  band.rotation.y = Math.PI / 2;
  g.add(band);
  const gond = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 12), new THREE.MeshLambertMaterial({ color: 0xf2e9ff }));
  gond.position.y = -7;
  g.add(gond);
  const win = new THREE.Mesh(new THREE.BoxGeometry(5.1, 1, 10), new THREE.MeshLambertMaterial({ color: 0xffb02e, emissive: 0x7a4a00 }));
  win.position.y = -6.6;
  g.add(win);
  for (const [x, y, rz] of [
    [0, 5.5, 0],
    [5.5, 0, Math.PI / 2],
    [-5.5, 0, Math.PI / 2],
  ] as const) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5, 6), new THREE.MeshLambertMaterial({ color: 0xb64bff }));
    fin.position.set(x, y, 22);
    fin.rotation.z = rz;
    g.add(fin);
  }
  const prop = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 0.4), new THREE.MeshLambertMaterial({ color: 0x222233 }));
  prop.position.set(0, 0, 27);
  prop.name = 'prop';
  g.add(prop);
  g.position.y = BUS_HEIGHT + 6;
  return g;
}

// ---------- Bodenbeute ----------

const ammoGeo = merge([tint(new THREE.BoxGeometry(0.38, 0.22, 0.26).translate(0, 0.11, 0), 0xffffff), tint(new THREE.BoxGeometry(0.4, 0.05, 0.28).translate(0, 0.2, 0), 0x333333)]);
const matGeo = [
  tint(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 6).rotateZ(Math.PI / 2).translate(0, 0.12, 0), 0xc8955a),
  tint(new THREE.DodecahedronGeometry(0.22, 0).translate(0, 0.18, 0), 0xa9a9b3),
  tint(new THREE.BoxGeometry(0.4, 0.12, 0.3).translate(0, 0.06, 0), 0x7d8fa3),
];

export class ItemViews {
  readonly group = new THREE.Group();
  private readonly views = new Map<number, THREE.Object3D>();
  private readonly beamGeo = new THREE.CylinderGeometry(0.03, 0.06, 1.6, 6, 1, true).translate(0, 0.8, 0);
  private readonly beamMats = new Map<number, THREE.Material>();
  private t = 0;

  private beamMat(c: number): THREE.Material {
    let m = this.beamMats.get(c);
    if (!m) {
      m = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
      this.beamMats.set(c, m);
    }
    return m;
  }

  sync(items: Map<number, GroundItem>, rarityColor: (r: number) => number): void {
    for (const [id, v] of this.views) {
      if (!items.has(id)) {
        v.removeFromParent();
        this.views.delete(id);
      }
    }
    for (const it of items.values()) {
      let v = this.views.get(it.id);
      if (v) {
        v.position.set(it.x, it.y, it.z);
        continue;
      }
      v = new THREE.Group();
      let mesh: THREE.Mesh;
      if (it.kind === DropKind.Item) {
        mesh = new THREE.Mesh(weaponGeometry(it.item, it.rarity), weaponMaterial);
        mesh.rotation.set(0, 0, Math.PI / 2);
        mesh.position.y = 0.25;
        const beam = new THREE.Mesh(this.beamGeo, this.beamMat(rarityColor(it.rarity)));
        v.add(beam);
      } else if (it.kind === DropKind.Ammo) {
        mesh = new THREE.Mesh(ammoGeo, new THREE.MeshLambertMaterial({ vertexColors: true, color: AMMO_COLORS[it.item] ?? 0xffffff }));
      } else {
        mesh = new THREE.Mesh(matGeo[it.item] ?? matGeo[0]!, new THREE.MeshLambertMaterial({ vertexColors: true }));
      }
      mesh.name = 'spin';
      v.add(mesh);
      v.position.set(it.x, it.y, it.z);
      v.userData.r = RARITY_COLORS[it.rarity];
      this.group.add(v);
      this.views.set(it.id, v);
    }
  }

  update(dt: number, cam: THREE.Vector3): void {
    this.t += dt;
    for (const v of this.views.values()) {
      const d2 = (v.position.x - cam.x) ** 2 + (v.position.z - cam.z) ** 2;
      v.visible = d2 < 90 * 90;
      if (!v.visible) continue;
      const m = v.getObjectByName('spin');
      if (m) {
        m.rotation.y = this.t * 1.2 + v.id;
        m.position.y = 0.22 + Math.sin(this.t * 2 + v.id) * 0.05;
      }
    }
  }

  clear(): void {
    for (const v of this.views.values()) v.removeFromParent();
    this.views.clear();
  }
}

// ---------- Fahrzeug „Rift-Buggy“ ----------

export function makeBuggy(): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    merge([
      tint(new THREE.BoxGeometry(2.0, 0.45, 3.6).translate(0, 0.65, 0), 0xffb02e),
      tint(new THREE.BoxGeometry(1.9, 0.2, 1.0).translate(0, 0.95, -1.3), 0x2a2f45),
      tint(new THREE.BoxGeometry(0.08, 0.8, 0.08).translate(-0.85, 1.3, 0.2), 0x2a2f45),
      tint(new THREE.BoxGeometry(0.08, 0.8, 0.08).translate(0.85, 1.3, 0.2), 0x2a2f45),
      tint(new THREE.BoxGeometry(1.78, 0.08, 0.08).translate(0, 1.7, 0.2), 0x2a2f45),
      tint(new THREE.BoxGeometry(0.5, 0.4, 0.5).translate(-0.5, 0.95, -0.15), 0x1a1d29),
      tint(new THREE.BoxGeometry(0.5, 0.4, 0.5).translate(0.5, 0.95, -0.15), 0x1a1d29),
      tint(new THREE.BoxGeometry(1.4, 0.4, 0.5).translate(0, 1.15, 1.1), 0x1a1d29),
      tint(new THREE.BoxGeometry(0.6, 0.12, 0.05).translate(0, 0.7, -1.82), 0x3ff2ff),
    ]),
    new THREE.MeshLambertMaterial({ vertexColors: true }),
  );
  body.castShadow = true;
  g.add(body);
  const wg = new THREE.CylinderGeometry(0.45, 0.45, 0.35, 12).rotateZ(Math.PI / 2);
  const wm = new THREE.MeshLambertMaterial({ color: 0x1a1a1f });
  for (const [x, z] of [
    [-1.1, -1.25],
    [1.1, -1.25],
    [-1.1, 1.25],
    [1.1, 1.25],
  ] as const) {
    const w = new THREE.Mesh(wg, wm);
    w.position.set(x, 0.45, z);
    w.name = 'wheel';
    w.castShadow = true;
    g.add(w);
  }
  return g;
}

// ---------- Geschosse ----------

export function makeRocket(): THREE.Object3D {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8).rotateX(Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0x556655 }));
  g.add(b);
  const f = new THREE.Mesh(new THREE.SphereGeometry(0.15, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffa040 }));
  f.position.z = 0.35;
  g.add(f);
  return g;
}

export function makeGrenade(): THREE.Object3D {
  return new THREE.Mesh(weaponGeometry(7, 1), weaponMaterial);
}

export const MAP_EDGE = MAP_SIZE;
