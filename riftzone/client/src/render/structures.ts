// Darstellung aller Bauteile über InstancedMesh, gruppiert nach 256-m-Abschnitten und Art.
// Zerstörte Teile werden ausgeblendet, gebaute Teile kommen in wachsende dynamische Puffer.
import * as THREE from 'three';
import { MAP_SIZE } from '../../../shared/src/constants';
import { Kind, Mat, isBuilt, type Piece } from '../../../shared/src/pieces';
import type { World } from '../../../shared/src/world';
import { Style } from '../../../shared/src/worldgen';
import { ammoBoxGeometry, bushGeometry, cactusGeometry, carGeometry, chestGeometry, crystalGeometry, padGeometry, rockGeometry, treeGeometry, wedgeGeometry } from './models';

const SEC = 256;
const NSEC = Math.ceil(MAP_SIZE / SEC);

type Cat =
  | 'box'
  | 'ramp'
  | 'glass'
  | 'tree0'
  | 'tree1'
  | 'tree2'
  | 'tree3'
  | 'tree4'
  | 'rock'
  | 'car'
  | 'bush'
  | 'cactus'
  | 'crystal'
  | 'pad'
  | 'chest'
  | 'ammo'
  | 'built'
  | 'builtRamp';

const SMALL: ReadonlySet<Cat> = new Set<Cat>(['bush', 'cactus', 'chest', 'ammo', 'pad']);

/** Wandfarben je Stil */
export const STYLE_COLORS: Record<number, number> = {
  [Style.Plaster]: 0xf1e6d2,
  [Style.Brick]: 0xc8664a,
  [Style.Timber]: 0xb98a5a,
  [Style.Concrete]: 0xb4b8c2,
  [Style.MetalBlue]: 0x5f86c4,
  [Style.MetalRed]: 0xc4574a,
  [Style.Adobe]: 0xe0b07c,
  [Style.Glass]: 0x9fdcff,
  [Style.Roof]: 0xd0533f,
  [Style.RoofDark]: 0x46506a,
  [Style.Floor]: 0x9a7a5a,
  [Style.Neon]: 0x2a2148,
  [Style.Pier]: 0x8a6a4a,
  [Style.Container1]: 0xe07a2c,
  [Style.Container2]: 0x2c8ae0,
  [Style.Container3]: 0x2cbf6a,
  [Style.Hay]: 0xe8c95a,
  [Style.Crystal]: 0xb64bff,
  [Style.Snowwall]: 0xdfe8f5,
  [Style.Lighthouse]: 0xf5f0ea,
  [Style.Barn]: 0xb23a2f,
};
const MAT_COLORS = [0xd29a5c, 0xa3a7b3, 0x7a90a8];
const CAR_COLORS = [0xe74c3c, 0x3498db, 0xf1c40f, 0x2ecc71, 0x9b59b6, 0xecf0f1];
const ROCK_COLORS = [0x8f939c, 0x9a8f86, 0xdfe6f0, 0xb06a4a];

interface Bucket {
  cat: Cat;
  sec: number;
  mesh: THREE.InstancedMesh;
  ids: number[];
  count: number;
  dynamic: boolean;
}

const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();
const p3 = new THREE.Vector3();
const s3 = new THREE.Vector3();
const col = new THREE.Color();
const yAxis = new THREE.Vector3(0, 1, 0);
const hideM = new THREE.Matrix4().makeScale(0, 0, 0);

function catOf(p: Piece): Cat | null {
  switch (p.kind) {
    case Kind.Block:
    case Kind.Fence:
    case Kind.Crate:
    case Kind.Prop:
    case Kind.Door:
      return 'box';
    case Kind.Glass:
      return 'glass';
    case Kind.Ramp:
      return 'ramp';
    case Kind.Tree:
      return (`tree${Math.min(4, p.style)}` as Cat);
    case Kind.Rock:
      return 'rock';
    case Kind.Car:
      return 'car';
    case Kind.Bush:
      return p.style === 1 ? 'cactus' : 'bush';
    case Kind.Crystal:
      return 'crystal';
    case Kind.Pad:
      return 'pad';
    case Kind.Chest:
      return 'chest';
    case Kind.AmmoBox:
      return 'ammo';
    case Kind.BWall:
    case Kind.BFloor:
      return 'built';
    case Kind.BRamp:
    case Kind.BRoof:
      return 'builtRamp';
    default:
      return null;
  }
}

const hash = (n: number): number => {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

export class StructureView {
  readonly group = new THREE.Group();
  private readonly sections: THREE.Group[] = [];
  private readonly detail: THREE.Group[] = [];
  private readonly buckets = new Map<string, Bucket>();
  private readonly loc = new Map<number, { b: Bucket; i: number }>();
  private readonly geos: Record<string, THREE.BufferGeometry> = {};
  private readonly mats: Record<string, THREE.Material> = {};
  viewDistance = 600;
  shadows = true;
  night = 0;

  constructor(private readonly world: World) {
    for (let i = 0; i < NSEC * NSEC; i++) {
      const g = new THREE.Group();
      const d = new THREE.Group();
      g.add(d);
      this.sections.push(g);
      this.detail.push(d);
      this.group.add(g);
    }
    const box = new THREE.BoxGeometry(1, 1, 1);
    this.geos.box = box;
    this.geos.glass = box;
    this.geos.built = box;
    this.geos.ramp = wedgeGeometry();
    this.geos.builtRamp = this.geos.ramp;
    for (let s = 0; s < 5; s++) this.geos[`tree${s}`] = treeGeometry(s);
    this.geos.rock = rockGeometry();
    this.geos.car = carGeometry();
    this.geos.bush = bushGeometry();
    this.geos.cactus = cactusGeometry();
    this.geos.crystal = crystalGeometry();
    this.geos.pad = padGeometry();
    this.geos.chest = chestGeometry();
    this.geos.ammo = ammoBoxGeometry();
    const lam = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const lamV = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true });
    this.mats.box = lam;
    this.mats.ramp = lam;
    this.mats.built = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.93 });
    this.mats.builtRamp = this.mats.built;
    this.mats.glass = new THREE.MeshPhongMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.35, shininess: 120, specular: 0xffffff, depthWrite: false });
    for (const k of ['tree0', 'tree1', 'tree2', 'tree3', 'tree4', 'rock', 'car', 'bush', 'cactus', 'chest', 'ammo', 'pad']) this.mats[k] = lamV;
    this.mats.crystal = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true, emissive: 0x6a2aff, emissiveIntensity: 0.9 });
    this.mats.pad = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true, emissive: 0x1a5f7a, emissiveIntensity: 0.7 });
    this.mats.chest = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true, emissive: 0x332200, emissiveIntensity: 0.6 });
    this.buildAll();
  }

  private secOf(x: number, z: number): number {
    const sx = Math.max(0, Math.min(NSEC - 1, Math.floor(x / SEC))),
      sz = Math.max(0, Math.min(NSEC - 1, Math.floor(z / SEC)));
    return sz * NSEC + sx;
  }

  private makeBucket(cat: Cat, sec: number, cap: number, dynamic: boolean): Bucket {
    const mesh = new THREE.InstancedMesh(this.geos[cat]!, this.mats[cat]!, Math.max(1, cap));
    mesh.count = 0;
    mesh.castShadow = cat !== 'glass' && !SMALL.has(cat);
    mesh.receiveShadow = cat !== 'glass';
    if (cat === 'glass') mesh.renderOrder = 3;
    mesh.instanceMatrix.setUsage(dynamic ? THREE.DynamicDrawUsage : THREE.StaticDrawUsage);
    const b: Bucket = { cat, sec, mesh, ids: [], count: 0, dynamic };
    (SMALL.has(cat) ? this.detail[sec]! : this.sections[sec]!).add(mesh);
    return b;
  }

  private buildAll(): void {
    const groups = new Map<string, Piece[]>();
    for (const p of this.world.pieces) {
      if (!p.alive) continue;
      const cat = catOf(p);
      if (!cat) continue;
      const key = `${this.secOf(p.x, p.z)}:${cat}`;
      const arr = groups.get(key) ?? [];
      arr.push(p);
      groups.set(key, arr);
    }
    for (const [key, arr] of groups) {
      const [secS, cat] = key.split(':') as [string, Cat];
      const dynamic = cat === 'built' || cat === 'builtRamp' || cat === 'box' || cat === 'chest' || cat === 'ammo';
      const b = this.makeBucket(cat, Number(secS), arr.length + (dynamic ? 32 : 0), dynamic);
      this.buckets.set(key, b);
      for (const p of arr) this.place(b, p);
      b.mesh.instanceMatrix.needsUpdate = true;
      if (b.mesh.instanceColor) b.mesh.instanceColor.needsUpdate = true;
      b.mesh.computeBoundingSphere();
    }
  }

  private place(b: Bucket, p: Piece): void {
    let i = b.count;
    if (i >= b.mesh.instanceMatrix.count) {
      // Puffer vergrößern
      const nm = new THREE.InstancedMesh(b.mesh.geometry, b.mesh.material, Math.ceil(i * 1.6) + 16);
      nm.count = b.count;
      nm.castShadow = b.mesh.castShadow;
      nm.receiveShadow = b.mesh.receiveShadow;
      nm.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      for (let k = 0; k < b.count; k++) {
        b.mesh.getMatrixAt(k, m4);
        nm.setMatrixAt(k, m4);
        if (b.mesh.instanceColor) {
          b.mesh.getColorAt(k, col);
          nm.setColorAt(k, col);
        }
      }
      b.mesh.parent?.add(nm);
      b.mesh.removeFromParent();
      b.mesh.dispose();
      b.mesh = nm;
      i = b.count;
    }
    this.writeInstance(b, i, p);
    b.ids[i] = p.id;
    b.count++;
    b.mesh.count = b.count;
    this.loc.set(p.id, { b, i });
  }

  private writeInstance(b: Bucket, i: number, p: Piece): void {
    const h = hash(p.id);
    switch (b.cat) {
      case 'ramp':
      case 'builtRamp': {
        const even = (p.dir & 1) === 0;
        const L = even ? p.hx * 2 : p.hz * 2,
          W = even ? p.hz * 2 : p.hx * 2;
        const ang = [0, -Math.PI / 2, Math.PI, Math.PI / 2][p.dir & 3]!;
        q.setFromAxisAngle(yAxis, ang);
        m4.compose(p3.set(p.x, p.y, p.z), q, s3.set(L, p.hy * 2, W));
        break;
      }
      case 'tree0':
      case 'tree1':
      case 'tree2':
      case 'tree3':
      case 'tree4': {
        const height = p.hy * 2 - 0.5;
        const s = height / 10;
        q.setFromAxisAngle(yAxis, h * Math.PI * 2);
        m4.compose(p3.set(p.x, p.y - p.hy + 0.5, p.z), q, s3.set(s * (0.9 + h * 0.3), s, s * (0.9 + h * 0.3)));
        break;
      }
      case 'rock':
        q.setFromAxisAngle(yAxis, h * Math.PI * 2);
        m4.compose(p3.set(p.x, p.y, p.z), q, s3.set(p.hx * 2.1, p.hy * 2.2, p.hz * 2.1));
        break;
      case 'car': {
        const alongZ = p.hz >= p.hx;
        q.setFromAxisAngle(yAxis, (alongZ ? 0 : Math.PI / 2) + (h > 0.5 ? Math.PI : 0));
        m4.compose(p3.set(p.x, p.y - p.hy, p.z), q, s3.set(1, 1, 1));
        break;
      }
      case 'bush':
        m4.compose(p3.set(p.x, p.y - p.hy, p.z), q.identity(), s3.set(p.hx * 1.6, p.hy * 1.3, p.hz * 1.6));
        break;
      case 'cactus':
        q.setFromAxisAngle(yAxis, h * 6);
        m4.compose(p3.set(p.x, p.y - p.hy, p.z), q, s3.set(1.6, p.hy * 2, 1.6));
        break;
      case 'crystal':
        q.setFromAxisAngle(yAxis, h * 6).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), (h - 0.5) * 0.4));
        m4.compose(p3.set(p.x, p.y - p.hy, p.z), q, s3.set(p.hx * 2, (p.hy * 2) / 1.8, p.hz * 2));
        break;
      case 'pad':
        m4.compose(p3.set(p.x, p.y - p.hy, p.z), q.identity(), s3.set(1, 1, 1));
        break;
      case 'chest':
      case 'ammo': {
        const alongZ = p.hz > p.hx;
        q.setFromAxisAngle(yAxis, alongZ ? Math.PI / 2 : 0);
        m4.compose(p3.set(p.x, p.y - p.hy, p.z), q, s3.set(1, 1, 1));
        break;
      }
      default: {
        if (p.kind === Kind.Door && p.state) {
          // geöffnete Tür: um 90° an der Angel gedreht (bleibt achsenparallel)
          if (p.hx > p.hz) m4.compose(p3.set(p.x - p.hx, p.y, p.z + p.hx), q.identity(), s3.set(p.hz * 2, p.hy * 2, p.hx * 2));
          else m4.compose(p3.set(p.x + p.hz, p.y, p.z - p.hz), q.identity(), s3.set(p.hz * 2, p.hy * 2, p.hx * 2));
        } else {
          m4.compose(p3.set(p.x, p.y, p.z), q.identity(), s3.set(p.hx * 2, p.hy * 2, p.hz * 2));
        }
      }
    }
    b.mesh.setMatrixAt(i, m4);
    b.mesh.setColorAt(i, this.colorOf(p, h, col));
  }

  private colorOf(p: Piece, h: number, out: THREE.Color): THREE.Color {
    const v = 0.93 + h * 0.12;
    if (isBuilt(p.kind)) {
      out.setHex(MAT_COLORS[p.mat] ?? 0xcccccc);
      // Beschädigung abdunkeln
      const k = 0.6 + 0.4 * Math.min(1, p.hp / Math.max(1, p.maxHp));
      return out.multiplyScalar(k);
    }
    switch (p.kind) {
      case Kind.Tree:
        return out.setRGB(v, v * (0.96 + h * 0.08), v);
      case Kind.Rock:
        return out.setHex(ROCK_COLORS[p.style] ?? ROCK_COLORS[0]!).multiplyScalar(v);
      case Kind.Car:
        return out.setHex(CAR_COLORS[p.style % CAR_COLORS.length]!).multiplyScalar(0.85 + h * 0.2);
      case Kind.Bush:
        return p.style === 1 ? out.setHex(0x4f9a4a) : out.setHex(0x3f9a3a).multiplyScalar(v);
      case Kind.Crystal:
        return out.setHex(0xc89bff);
      case Kind.Chest:
        return p.state ? out.setHex(0x5a4a3a) : out.setHex(0xffc23a);
      case Kind.AmmoBox:
        return p.state ? out.setHex(0x555555) : out.setHex(0xffffff);
      case Kind.Door:
        return out.setHex(0x8a5a35);
      case Kind.Fence:
        return out.setHex(0xc9a777).multiplyScalar(v);
      case Kind.Crate:
        return p.style === Style.Hay ? out.setHex(0xe8c95a).multiplyScalar(v) : out.setHex(0xb07a45).multiplyScalar(v);
      case Kind.Prop:
        return out.setHex(STYLE_COLORS[p.style] ?? 0x888888).multiplyScalar(v);
      case Kind.Pad:
        return out.setHex(0xffffff);
      default: {
        const c = STYLE_COLORS[p.style] ?? 0xcccccc;
        out.setHex(c);
        if (p.style === Style.Neon) out.lerp(new THREE.Color(0xff2fd0), this.night * 0.0);
        // leichte Unterschiede, Schaden abdunkeln
        const dmg = p.destructible && p.maxHp > 0 ? 0.75 + 0.25 * Math.min(1, p.hp / p.maxHp) : 1;
        return out.multiplyScalar((0.95 + h * 0.08) * dmg);
      }
    }
  }

  /** Geänderte Bauteile übernehmen. */
  apply(ids: number[]): void {
    const touched = new Set<Bucket>();
    for (const id of ids) {
      const p = this.world.pieces[id];
      if (!p) continue;
      const l = this.loc.get(id);
      if (!p.alive) {
        if (l) {
          l.b.mesh.setMatrixAt(l.i, hideM);
          touched.add(l.b);
          this.loc.delete(id);
        }
        continue;
      }
      if (l) {
        this.writeInstance(l.b, l.i, p);
        touched.add(l.b);
        continue;
      }
      const cat = catOf(p);
      if (!cat) continue;
      const key = `${this.secOf(p.x, p.z)}:${cat}`;
      let b = this.buckets.get(key);
      if (!b) {
        b = this.makeBucket(cat, this.secOf(p.x, p.z), 32, true);
        this.buckets.set(key, b);
      }
      this.place(b, p);
      touched.add(b);
    }
    for (const b of touched) {
      b.mesh.instanceMatrix.needsUpdate = true;
      if (b.mesh.instanceColor) b.mesh.instanceColor.needsUpdate = true;
      b.mesh.computeBoundingSphere();
    }
  }

  update(cam: THREE.Vector3): void {
    for (let sz = 0; sz < NSEC; sz++)
      for (let sx = 0; sx < NSEC; sx++) {
        const i = sz * NSEC + sx;
        const cx = sx * SEC + SEC / 2,
          cz = sz * SEC + SEC / 2;
        const d = Math.max(0, Math.hypot(cx - cam.x, cz - cam.z) - SEC * 0.71);
        this.sections[i]!.visible = d < this.viewDistance + 40;
        this.detail[i]!.visible = d < Math.min(220, this.viewDistance * 0.5);
      }
    for (const b of this.buckets.values()) {
      if (b.mesh.castShadow !== (this.shadows && b.cat !== 'glass' && !SMALL.has(b.cat))) b.mesh.castShadow = this.shadows && b.cat !== 'glass' && !SMALL.has(b.cat);
    }
  }

  dispose(): void {
    for (const b of this.buckets.values()) b.mesh.dispose();
    for (const g of Object.values(this.geos)) g.dispose();
    for (const m of Object.values(this.mats)) m.dispose();
  }

  static readonly MAT_COLORS = MAT_COLORS;
  static readonly WOOD = Mat.Wood;
}
