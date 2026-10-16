// 3D-Stadtansicht: isometrische Kamera, Gelände, Wasser, Straßen, Gebäude, Symbole, Verkehr und Umwelt.
// Liest den Spielstand nur – Änderungen laufen ausschließlich über City (Regeln).
import * as THREE from 'three';
import { BUILDING } from '../catalogs/buildings';
import { CROP } from '../catalogs/items';
import { City, footprint, isBeach, isWater, key, MAP, SECTOR, SECTORS } from '../core/city';
import type { Building, BuildingDef, Rot } from '../core/types';
import { position, spawn, step, type Walker } from '../world/traffic';
import { buildingGeometry, carGeometry, cropGeometry, Parts, personGeometry, scaffoldGeometry } from './models';

export type Quality = 'low' | 'medium' | 'high';

const ICONS: Record<string, string> = {
  rent: '💰', cash: '💵', harvest: '🌾', supply: '📦', ready: '✅', materials: '🧱', noroad: '🚧', plant: '🌱',
};

function emojiTexture(emoji: string, bubble = true): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 96;
  const g = c.getContext('2d')!;
  if (bubble) {
    g.fillStyle = 'rgba(0,0,0,.18)';
    g.beginPath();
    g.ellipse(48, 88, 18, 5, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#ffffff';
    g.strokeStyle = '#2f6fb3';
    g.lineWidth = 5;
    g.beginPath();
    g.arc(48, 42, 34, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    g.beginPath();
    g.moveTo(40, 72);
    g.lineTo(48, 86);
    g.lineTo(56, 72);
    g.fill();
  }
  g.font = '44px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(emoji, 48, bubble ? 44 : 50);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function roadTexture(mask: number): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = '#d9d4c8';
  g.fillRect(0, 0, 64, 64);
  // Asphalt: Mitte + Arme zu verbundenen Nachbarn (Bits: 1=+x, 2=-x, 4=+y, 8=-y)
  g.fillStyle = '#5b6068';
  g.fillRect(10, 10, 44, 44);
  if (mask & 1) g.fillRect(32, 10, 32, 44);
  if (mask & 2) g.fillRect(0, 10, 32, 44);
  if (mask & 4) g.fillRect(10, 32, 44, 32);
  if (mask & 8) g.fillRect(10, 0, 44, 32);
  g.fillStyle = '#f2e6a0';
  const dash = (x: number, y: number, w: number, h: number) => g.fillRect(x, y, w, h);
  const n = [1, 2, 4, 8].filter((b) => mask & b).length;
  if (n <= 2) {
    if (mask & 1) dash(40, 31, 12, 2);
    if (mask & 2) dash(12, 31, 12, 2);
    if (mask & 4) dash(31, 40, 2, 12);
    if (mask & 8) dash(31, 12, 2, 12);
  } else {
    g.fillStyle = '#f5f5f5';
    for (let i = 0; i < 4; i++) {
      if (mask & 1) g.fillRect(52, 13 + i * 11, 6, 6);
      if (mask & 2) g.fillRect(6, 13 + i * 11, 6, 6);
      if (mask & 4) g.fillRect(13 + i * 11, 52, 6, 6);
      if (mask & 8) g.fillRect(13 + i * 11, 6, 6, 6);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface BMesh {
  mesh: THREE.Mesh;
  key: string;
  icon?: THREE.Sprite;
  iconKind?: string;
  crop?: THREE.Mesh;
  cropKey?: string;
}

interface Person {
  w: Walker;
  g: THREE.Group;
  legs: THREE.Mesh[];
  phase: number;
  /** Einzug: läuft zum Ziel und verschwindet. */
  target?: THREE.Vector3;
  life?: number;
}

export class World {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.OrthographicCamera;
  readonly target = new THREE.Vector3(24, 0, 24);
  zoom = 1;
  yaw = 0;
  private yawShown = 0;
  private city: City;
  private mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  private ghostMat = new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.6 });
  private bmeshes = new Map<number, BMesh>();
  private roadMeshes: THREE.InstancedMesh[] = [];
  private roadMats: THREE.MeshLambertMaterial[] = [];
  private roadsKey = '';
  private sectorsKey = '';
  private ground!: THREE.Mesh;
  private groundTex!: THREE.CanvasTexture;
  private forest: THREE.InstancedMesh[] = [];
  private water!: THREE.Mesh;
  private sun!: THREE.DirectionalLight;
  private hemi!: THREE.HemisphereLight;
  private iconMats = new Map<string, THREE.SpriteMaterial>();
  private ghost: THREE.Mesh | null = null;
  private ghostTiles: THREE.Mesh | null = null;
  private highlight: THREE.Mesh;
  private sectorLines: THREE.Group | null = null;
  private cars: { w: Walker; m: THREE.Mesh }[] = [];
  private people: Person[] = [];
  private clouds: THREE.Mesh[] = [];
  private cloudMat: THREE.MeshLambertMaterial | null = null;
  private birds: { g: THREE.Group; a: number; r: number; c: THREE.Vector3 }[] = [];
  private train: THREE.Group;
  private ship: THREE.Group;
  private plane: THREE.Group;
  private rnd = rng(7);
  private time = 0;
  private raycaster = new THREE.Raycaster();
  private groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  quality: Quality = 'medium';
  dayNight = false;
  paused = false;

  constructor(canvas: HTMLCanvasElement, city: City) {
    this.city = city;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.camera = new THREE.OrthographicCamera(-10, 10, 10, -10, -100, 200);
    this.scene.background = new THREE.Color('#9fd7f2');
    this.scene.fog = new THREE.Fog('#9fd7f2', 60, 140);
    this.setupLights();
    this.setupTerrain();
    this.setupEnvironment();
    this.highlight = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, depthWrite: false }),
    );
    this.highlight.visible = false;
    this.scene.add(this.highlight);
    this.train = this.makeTrain();
    this.ship = this.makeShip();
    this.plane = this.makePlane();
    this.scene.add(this.train, this.ship, this.plane);
    this.setCity(city);
  }

  setCity(city: City): void {
    this.city = city;
    for (const b of this.bmeshes.values()) this.disposeB(b);
    this.bmeshes.clear();
    this.roadsKey = '';
    this.sectorsKey = '';
    for (const c of this.cars) this.scene.remove(c.m);
    for (const p of this.people) this.scene.remove(p.g);
    this.cars = [];
    this.people = [];
    this.target.set(24, 0, 24);
    this.sync();
  }

  setQuality(q: Quality): void {
    this.quality = q;
    const dpr = Math.min(window.devicePixelRatio || 1, q === 'high' ? 2 : q === 'medium' ? 1.5 : 1);
    this.renderer.setPixelRatio(dpr);
    this.renderer.shadowMap.enabled = q !== 'low';
    this.sun.castShadow = q !== 'low';
    this.sun.shadow.mapSize.set(q === 'high' ? 2048 : 1024, q === 'high' ? 2048 : 1024);
    this.sun.shadow.map?.dispose();
    this.sun.shadow.map = null;
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.material) (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => (x.needsUpdate = true));
    });
    this.resize();
  }

  resize(): void {
    const el = this.renderer.domElement;
    const w = el.clientWidth || window.innerWidth;
    const h = el.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    const aspect = w / h;
    const size = 9 / this.zoom;
    this.camera.left = -size * aspect;
    this.camera.right = size * aspect;
    this.camera.top = size;
    this.camera.bottom = -size;
    this.camera.updateProjectionMatrix();
  }

  private setupLights(): void {
    this.hemi = new THREE.HemisphereLight('#fffaf0', '#7da35c', 1.2);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight('#fff4dc', 2.0);
    this.sun.position.set(-20, 40, 15);
    this.sun.castShadow = true;
    const s = this.sun.shadow;
    s.mapSize.set(1024, 1024);
    s.camera.left = -22;
    s.camera.right = 22;
    s.camera.top = 22;
    s.camera.bottom = -22;
    s.camera.near = 1;
    s.camera.far = 120;
    s.bias = -0.0008;
    s.normalBias = 0.03;
    this.scene.add(this.sun, this.sun.target);
  }

  private setupTerrain(): void {
    const c = document.createElement('canvas');
    c.width = c.height = MAP * 8;
    this.groundTex = new THREE.CanvasTexture(c);
    this.groundTex.colorSpace = THREE.SRGBColorSpace;
    this.groundTex.magFilter = THREE.NearestFilter;
    this.ground = new THREE.Mesh(
      new THREE.PlaneGeometry(MAP, MAP).rotateX(-Math.PI / 2).translate(MAP / 2, 0, MAP / 2),
      new THREE.MeshLambertMaterial({ map: this.groundTex }),
    );
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
    // Umland: weite Wiese und Hügel als Höhenstufen außerhalb der Baufläche
    const outer = new THREE.Mesh(new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#79b85a' }));
    outer.position.set(MAP / 2 + 150, -0.02, MAP / 2);
    this.scene.add(outer);
    const hills = new Parts();
    const r = rng(3);
    for (let i = 0; i < 26; i++) {
      const a = r() * Math.PI;
      const d = 42 + r() * 20;
      const x = MAP / 2 + Math.sin(a) * d + 6;
      const z = MAP / 2 - Math.cos(a) * d;
      if (x < MAP + 3 && z > -3 && z < MAP + 3) continue;
      hills.add(new THREE.SphereGeometry(6 + r() * 6, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.35 + r() * 0.3, 1), r() > 0.5 ? '#6faa4f' : '#86c062', x, -0.5, z);
    }
    for (let i = 0; i < 60; i++) {
      const x = MAP + 2 + r() * 30;
      const z = -20 + r() * (MAP + 40);
      hills.add(new THREE.ConeGeometry(0.8, 2.2, 6), '#2f6b3a', x, 1.1, z);
    }
    const hm = new THREE.Mesh(hills.build(), this.mat);
    this.scene.add(hm);
    // Wasser
    const wg = new THREE.PlaneGeometry(90, 200, 30, 60).rotateX(-Math.PI / 2);
    this.water = new THREE.Mesh(wg, new THREE.MeshLambertMaterial({ color: '#3fa7d6', transparent: true, opacity: 0.88 }));
    this.water.position.set(4.6 - 45, -0.06, MAP / 2);
    this.scene.add(this.water);
  }

  private drawGround(): void {
    const c = this.groundTex.image as HTMLCanvasElement;
    const g = c.getContext('2d')!;
    const r = rng(11);
    for (let x = 0; x < MAP; x++)
      for (let y = 0; y < MAP; y++) {
        const unlocked = this.city.isUnlocked(x, y);
        let col: string;
        if (isWater(x, y)) col = '#2f8fbf';
        else if (isBeach(x, y)) col = (x + y) % 2 ? '#f1dca4' : '#ecd497';
        else {
          const v = Math.floor(r() * 3);
          col = unlocked ? ['#8ccc62', '#86c65c', '#92d168'][v]! : ['#5f9a46', '#5a9442', '#64a04a'][v]!;
        }
        g.fillStyle = col;
        g.fillRect(x * 8, y * 8, 8, 8);
        if (unlocked && !isWater(x, y)) {
          g.fillStyle = 'rgba(255,255,255,0.06)';
          g.fillRect(x * 8, y * 8, 8, 1);
          g.fillRect(x * 8, y * 8, 1, 8);
        }
      }
    this.groundTex.needsUpdate = true;
  }

  private buildForest(): void {
    for (const f of this.forest) {
      this.scene.remove(f);
      f.dispose();
    }
    this.forest = [];
    const trunk = new Parts().cyl(0.05, 0.07, 0.3, '#6d4c41').build();
    const crowns = [
      new Parts().cone(0.34, 0.9, '#2f6b3a', 0, 0.2, 0, 7).build(),
      new Parts().ball(0.34, '#4f9a3a', 0, 0.55, 0).build(),
    ];
    const spots: [number, number, number][] = [];
    const r = rng(23);
    for (let x = 0; x < MAP; x++)
      for (let y = 0; y < MAP; y++) {
        if (this.city.isUnlocked(x, y) || isWater(x, y) || isBeach(x, y)) continue;
        if (r() < 0.32) spots.push([x + 0.2 + r() * 0.6, y + 0.2 + r() * 0.6, r()]);
      }
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const mk = (geo: THREE.BufferGeometry, list: [number, number, number][]) => {
      const im = new THREE.InstancedMesh(geo, this.mat, Math.max(1, list.length));
      list.forEach(([x, z, s], i) => {
        const k = 0.8 + s * 0.6;
        im.setMatrixAt(i, m4.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(k, k, k)));
      });
      im.count = list.length;
      im.castShadow = this.quality !== 'low';
      this.scene.add(im);
      this.forest.push(im);
    };
    mk(trunk, spots);
    mk(crowns[0]!, spots.filter((s) => s[2] < 0.55));
    mk(crowns[1]!, spots.filter((s) => s[2] >= 0.55));
  }

  private setupEnvironment(): void {
    const cloudGeo = new Parts().ball(1.2, '#ffffff', 0, 0, 0).ball(0.9, '#ffffff', 1.1, -0.2, 0.2).ball(0.8, '#f5f7fa', -1.0, -0.25, -0.1).build();
    const cm = new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.92 });
    for (let i = 0; i < 9; i++) {
      const m = new THREE.Mesh(cloudGeo, cm);
      m.position.set(this.rnd() * 80 - 16, 12 + this.rnd() * 5, this.rnd() * 80 - 16);
      m.scale.setScalar(0.8 + this.rnd() * 0.8);
      this.clouds.push(m);
      this.scene.add(m);
    }
    this.cloudMat = cm;
    const wing = new Parts().add(new THREE.BoxGeometry(0.25, 0.02, 0.06), '#37474f', 0.12, 0, 0, 0, 0, 0.3).add(new THREE.BoxGeometry(0.25, 0.02, 0.06), '#37474f', -0.12, 0, 0, 0, 0, -0.3).build();
    for (let i = 0; i < 4; i++) {
      const g = new THREE.Group();
      for (let j = 0; j < 4; j++) {
        const m = new THREE.Mesh(wing, this.mat);
        m.position.set(-j * 0.35, 0, (j % 2 ? 1 : -1) * j * 0.25);
        g.add(m);
      }
      this.birds.push({ g, a: this.rnd() * 6, r: 8 + this.rnd() * 10, c: new THREE.Vector3(10 + this.rnd() * 30, 7 + this.rnd() * 3, 10 + this.rnd() * 30) });
      this.scene.add(g);
    }
  }

  private makeTrain(): THREE.Group {
    const g = new THREE.Group();
    const loco = new Parts().box(1.2, 0.45, 0.5, '#c0392b', 0, 0.1, 0).box(0.45, 0.35, 0.5, '#2c3e50', -0.35, 0.55, 0).cyl(0.08, 0.08, 0.25, '#2c3e50', 0.4, 0.55, 0).build();
    g.add(new THREE.Mesh(loco, this.mat));
    const colors = ['#f39c12', '#27ae60', '#2980b9'];
    for (let i = 0; i < 3; i++) {
      const w = new THREE.Mesh(new Parts().box(1.1, 0.45, 0.5, colors[i]!, 0, 0.1, 0).build(), this.mat);
      w.position.x = -1.3 * (i + 1);
      g.add(w);
    }
    // Gleis entlang der Nordkante
    const track = new Parts();
    track.box(MAP + 60, 0.04, 0.12, '#9e9e9e', 0, 0, 0.2).box(MAP + 60, 0.04, 0.12, '#9e9e9e', 0, 0, -0.2);
    for (let i = -30; i < MAP + 30; i += 0.7) track.box(0.12, 0.03, 0.7, '#6d4c41', i - MAP / 2, -0.02, 0);
    const tm = new THREE.Mesh(track.build(), this.mat);
    tm.position.set(MAP / 2, 0, -1.5);
    this.scene.add(tm);
    g.position.set(-30, 0, -1.5);
    return g;
  }
  private makeShip(): THREE.Group {
    const g = new THREE.Group();
    const p = new Parts().box(3, 0.5, 1, '#34495e', 0, -0.2, 0).box(0.8, 0.6, 0.8, '#ecf0f1', -1, 0.3, 0);
    for (let i = 0; i < 3; i++) p.box(0.5, 0.4, 0.8, ['#e74c3c', '#f1c40f', '#2ecc71'][i]!, 0.1 + i * 0.55, 0.3, 0);
    g.add(new THREE.Mesh(p.build(), this.mat));
    g.position.set(-6, 0, -20);
    g.rotation.y = -Math.PI / 2;
    return g;
  }
  private makePlane(): THREE.Group {
    const g = new THREE.Group();
    const p = new Parts().add(new THREE.CylinderGeometry(0.18, 0.12, 2, 8), '#ecf0f1', 0, 0, 0, 0, 0, Math.PI / 2);
    p.box(0.5, 0.04, 2.2, '#bdc3c7', 0, -0.02, 0).box(0.3, 0.4, 0.04, '#2e86de', -0.9, 0, 0).box(0.25, 0.03, 0.8, '#bdc3c7', -0.9, 0.1, 0);
    g.add(new THREE.Mesh(p.build(), this.mat));
    g.visible = false;
    return g;
  }

  private iconMat(kind: string): THREE.SpriteMaterial {
    let m = this.iconMats.get(kind);
    if (!m) {
      m = new THREE.SpriteMaterial({ map: emojiTexture(ICONS[kind] ?? CROP.get(kind)?.icon ?? '❔'), depthTest: false, transparent: true });
      this.iconMats.set(kind, m);
    }
    return m;
  }

  private disposeB(b: BMesh): void {
    this.scene.remove(b.mesh);
    if (b.icon) this.scene.remove(b.icon);
  }

  private placeMesh(m: THREE.Object3D, def: BuildingDef, x: number, y: number, rot: Rot): void {
    const { w, h } = footprint(def, rot);
    m.position.set(x + w / 2, 0, y + h / 2);
    m.rotation.y = -rot * (Math.PI / 2);
  }

  /** Gleicht Szene und Spielstand ab (günstig, nur Änderungen werden neu erzeugt). */
  sync(): void {
    const sk = this.city.s.sectors.join('|');
    if (sk !== this.sectorsKey) {
      this.sectorsKey = sk;
      this.drawGround();
      this.buildForest();
    }
    const rk = this.city.s.roads.join('|');
    if (rk !== this.roadsKey) {
      this.roadsKey = rk;
      this.buildRoads();
    }
    const seen = new Set<number>();
    for (const b of this.city.s.buildings) {
      seen.add(b.uid);
      const def = BUILDING.get(b.def)!;
      const k = `${b.def}|${b.x}|${b.y}|${b.rot}|${b.state === 'done' ? 'd' : 's'}|${b.lvl ?? 1}`;
      let bm = this.bmeshes.get(b.uid);
      if (!bm || bm.key !== k) {
        if (bm) this.disposeB(bm);
        const geo = b.state === 'done' ? buildingGeometry(def) : scaffoldGeometry(def.w, def.h);
        const mesh = new THREE.Mesh(geo, this.mat);
        mesh.castShadow = def.cat !== 'decoration' || def.model.kind === 'tree';
        mesh.receiveShadow = true;
        mesh.userData.uid = b.uid;
        this.placeMesh(mesh, def, b.x, b.y, b.rot);
        if ((b.lvl ?? 1) > 1) mesh.scale.set(1, 1 + 0.06 * ((b.lvl ?? 1) - 1), 1);
        this.scene.add(mesh);
        const fresh = !bm;
        bm = { mesh, key: k };
        this.bmeshes.set(b.uid, bm);
        if (!fresh || b.state !== 'done') this.pop(mesh);
      }
      this.updateStatus(b, bm, def);
    }
    for (const [uid, bm] of this.bmeshes) {
      if (!seen.has(uid)) {
        this.disposeB(bm);
        this.bmeshes.delete(uid);
      }
    }
  }

  private pop(m: THREE.Object3D): void {
    m.userData.popT = 0;
  }

  private updateStatus(b: Building, bm: BMesh, def: BuildingDef): void {
    const st = this.city.status(b);
    let kind: string | undefined = ICONS[st.kind] ? st.kind : undefined;
    if (kind === 'plant' && b.state !== 'done') kind = undefined;
    if (kind === 'harvest' && b.job) kind = b.job;
    if (kind !== bm.iconKind) {
      if (bm.icon) this.scene.remove(bm.icon);
      bm.icon = undefined;
      bm.iconKind = kind;
      if (kind) {
        const s = new THREE.Sprite(this.iconMat(kind));
        const sc = kind === 'plant' ? 0.55 : 0.8;
        s.scale.set(sc, sc, sc);
        s.renderOrder = 10;
        s.userData.uid = b.uid;
        const { w, h } = footprint(def, b.rot);
        const top = (bm.mesh.geometry.boundingSphere?.radius ?? 1) * 0.9;
        s.position.set(b.x + w / 2, Math.min(4.5, top + 0.6), b.y + h / 2);
        s.userData.baseY = s.position.y;
        this.scene.add(s);
        bm.icon = s;
      }
    }
    // Pflanzen auf dem Acker
    if (def.cat === 'farm' && b.state === 'done') {
      const crop = b.job ? CROP.get(b.job) : undefined;
      let stage = -1;
      if (crop && b.t) {
        const total = this.city.dur(crop.time * (def.growFactor ?? 1));
        const left = b.t - this.city.now();
        const f = 1 - Math.max(0, left) / Math.max(1, total);
        stage = f >= 1 ? 2 : f > 0.5 ? 1 : 0;
      }
      const ck = crop ? `${crop.id}${stage}` : '';
      if (ck !== bm.cropKey) {
        if (bm.crop) bm.mesh.remove(bm.crop);
        bm.crop = undefined;
        bm.cropKey = ck;
        if (crop) {
          bm.crop = new THREE.Mesh(cropGeometry(crop.color, stage, def.w, def.h), this.mat);
          bm.crop.castShadow = true;
          bm.mesh.add(bm.crop);
        }
      }
    }
  }

  private buildRoads(): void {
    for (const m of this.roadMeshes) {
      this.scene.remove(m);
      m.dispose();
    }
    this.roadMeshes = [];
    if (!this.roadMats.length)
      for (let i = 0; i < 16; i++) this.roadMats.push(new THREE.MeshLambertMaterial({ map: roadTexture(i) }));
    const roads = this.city.roads();
    const byMask: [number, number][][] = Array.from({ length: 16 }, () => []);
    for (const k of roads) {
      const [x, y] = k.split(',').map(Number) as [number, number];
      const mask = (roads.has(key(x + 1, y)) ? 1 : 0) | (roads.has(key(x - 1, y)) ? 2 : 0) | (roads.has(key(x, y + 1)) ? 4 : 0) | (roads.has(key(x, y - 1)) ? 8 : 0);
      byMask[mask]!.push([x, y]);
    }
    const geo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
    const m4 = new THREE.Matrix4();
    byMask.forEach((list, mask) => {
      if (!list.length) return;
      const im = new THREE.InstancedMesh(geo, this.roadMats[mask]!, list.length);
      list.forEach(([x, y], i) => im.setMatrixAt(i, m4.makeTranslation(x + 0.5, 0.012, y + 0.5)));
      im.receiveShadow = true;
      this.scene.add(im);
      this.roadMeshes.push(im);
    });
  }

  // ---------------------------------------------------------------- Werkzeuge: Vorschau, Markierung
  showGhost(defId: string | null, x = 0, y = 0, rot: Rot = 0, valid = true): void {
    if (this.ghost) {
      this.scene.remove(this.ghost);
      this.ghost = null;
    }
    if (this.ghostTiles) {
      this.scene.remove(this.ghostTiles);
      this.ghostTiles.geometry.dispose();
      this.ghostTiles = null;
    }
    if (!defId) return;
    const def = BUILDING.get(defId)!;
    const { w, h } = footprint(def, rot);
    if (defId !== '__road') {
      this.ghost = new THREE.Mesh(buildingGeometry(def), this.ghostMat);
      this.placeMesh(this.ghost, def, x, y, rot);
      this.ghost.position.y = 0.05;
      this.scene.add(this.ghost);
    }
    this.ghostTiles = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: valid ? '#4cd964' : '#ff3b30', transparent: true, opacity: 0.45, depthWrite: false }),
    );
    this.ghostTiles.position.set(x + w / 2, 0.03, y + h / 2);
    this.scene.add(this.ghostTiles);
  }
  showTile(x: number, y: number, valid: boolean | null): void {
    this.highlight.visible = valid !== null;
    this.highlight.position.set(x + 0.5, 0.03, y + 0.5);
    (this.highlight.material as THREE.MeshBasicMaterial).color.set(valid ? '#4cd964' : '#ff3b30');
  }
  showSectors(on: boolean): void {
    if (this.sectorLines) {
      this.scene.remove(this.sectorLines);
      this.sectorLines = null;
    }
    if (!on) return;
    const g = new THREE.Group();
    for (let sx = 0; sx < SECTORS; sx++)
      for (let sy = 0; sy < SECTORS; sy++) {
        const can = this.city.canExpand(sx, sy).ok;
        const owned = this.city.s.sectors.includes(key(sx, sy));
        if (owned) continue;
        const m = new THREE.Mesh(
          new THREE.PlaneGeometry(SECTOR - 0.3, SECTOR - 0.3).rotateX(-Math.PI / 2),
          new THREE.MeshBasicMaterial({ color: can ? '#ffd54f' : '#90a4ae', transparent: true, opacity: can ? 0.35 : 0.15, depthWrite: false }),
        );
        m.position.set(sx * SECTOR + SECTOR / 2, 0.05, sy * SECTOR + SECTOR / 2);
        g.add(m);
      }
    this.sectorLines = g;
    this.scene.add(g);
  }

  /** Bildschirmkoordinate (CSS-Pixel) → Feld. */
  pick(clientX: number, clientY: number): { x: number; y: number; uid?: number } | null {
    const el = this.renderer.domElement;
    const r = el.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camera);
    const objs: THREE.Object3D[] = [];
    for (const b of this.bmeshes.values()) {
      objs.push(b.mesh);
      if (b.icon) objs.push(b.icon);
    }
    const hit = this.raycaster.intersectObjects(objs, false)[0];
    const p = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(this.groundPlane, p)) return null;
    const uid = hit?.object.userData.uid as number | undefined;
    return { x: Math.floor(p.x), y: Math.floor(p.z), uid };
  }
  /** Welt → Bildschirm (für schwebende Texte). */
  project(x: number, y: number, z: number): { x: number; y: number } {
    const v = new THREE.Vector3(x, y, z).project(this.camera);
    const r = this.renderer.domElement.getBoundingClientRect();
    return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
  }
  buildingTop(uid: number): THREE.Vector3 | null {
    const bm = this.bmeshes.get(uid);
    if (!bm) return null;
    const p = bm.mesh.position.clone();
    p.y = Math.min(3.5, (bm.mesh.geometry.boundingSphere?.radius ?? 1) * 0.9);
    return p;
  }
  focus(uid: number): void {
    const bm = this.bmeshes.get(uid);
    if (bm) this.target.set(bm.mesh.position.x, 0, bm.mesh.position.z);
  }

  pan(dxPx: number, dyPx: number): void {
    const el = this.renderer.domElement;
    const worldPerPx = (this.camera.top - this.camera.bottom) / (el.clientHeight || 1);
    const a = this.yawShown + Math.PI / 4;
    // Bildschirm-Rechts / -Oben in Bodenebene
    const rx = Math.cos(a);
    const rz = -Math.sin(a);
    const ux = -Math.sin(a);
    const uz = -Math.cos(a);
    const k = worldPerPx;
    this.target.x -= (dxPx * rx - dyPx * ux * 1.4) * k;
    this.target.z -= (dxPx * rz - dyPx * uz * 1.4) * k;
    this.clampTarget();
  }
  clampTarget(): void {
    this.target.x = Math.max(-2, Math.min(MAP + 2, this.target.x));
    this.target.z = Math.max(-2, Math.min(MAP + 2, this.target.z));
  }
  setZoom(z: number): void {
    this.zoom = Math.max(0.45, Math.min(2.6, z));
    this.resize();
  }

  /** Einwohner ziehen sichtbar ein: Figuren laufen von der Straße zum Haus. */
  moveIn(uid: number, n: number): void {
    const bm = this.bmeshes.get(uid);
    const b = this.city.get(uid);
    if (!bm || !b) return;
    const roads = [...this.city.roads()];
    let best: [number, number] | null = null;
    let bd = 1e9;
    for (const k of roads) {
      const [x, y] = k.split(',').map(Number) as [number, number];
      const d = Math.hypot(x + 0.5 - bm.mesh.position.x, y + 0.5 - bm.mesh.position.z);
      if (d < bd) {
        bd = d;
        best = [x, y];
      }
    }
    if (!best) return;
    for (let i = 0; i < Math.min(4, Math.max(1, Math.round(n / 3))); i++) {
      const p = this.makePerson(i * 7 + uid);
      p.g.position.set(best[0] + 0.5 + (i - 1) * 0.15, 0, best[1] + 0.5);
      p.target = bm.mesh.position.clone();
      p.life = 6;
      this.people.push(p);
      this.scene.add(p.g);
    }
  }

  private makePerson(seed: number): Person {
    const r = rng(seed * 31 + 5);
    const skins = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#ffdbac'];
    const shirts = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c', '#ecf0f1', '#ff6b9d', '#34495e'];
    const pants = ['#2c3e50', '#34495e', '#7f8c8d', '#8e6e53', '#1f3a93'];
    const hair = ['#2d1b0e', '#6d4c41', '#f4d03f', '#e67e22', '#212121', '#bdc3c7'];
    const pick = <T,>(a: T[]): T => a[Math.floor(r() * a.length)]!;
    const s = pick(skins), sh = pick(shirts), pa = pick(pants), ha = pick(hair);
    const g = new THREE.Group();
    const body = new THREE.Mesh(personGeometry(s, sh, pa, ha, 'body'), this.mat);
    body.position.y = 0.2;
    g.add(body);
    const legs: THREE.Mesh[] = [];
    for (const sx of [-1, 1]) {
      const l = new THREE.Mesh(personGeometry(s, sh, pa, ha, 'leg'), this.mat);
      l.position.set(0, 0.2, sx * 0.025);
      g.add(l);
      legs.push(l);
    }
    g.scale.setScalar(1.6);
    return { w: { x: 0, y: 0, px: 0, py: 0, nx: 0, ny: 0, t: 0, speed: 0.45 + r() * 0.25, side: r() > 0.5 ? 0.4 : -0.4 }, g, legs, phase: r() * 6 };
  }

  private updateTraffic(dt: number): void {
    const roads = this.city.roads();
    const list = this.city.s.roads;
    const pop = this.city.population();
    const wantCars = this.quality === 'low' ? Math.min(8, list.length / 8) : Math.min(28, Math.floor(list.length / 6) + Math.floor(pop / 40));
    const wantPeople = this.quality === 'low' ? Math.min(10, pop / 10) : Math.min(46, 4 + Math.floor(pop / 8));
    const palette = ['#e74c3c', '#3498db', '#f1c40f', '#ecf0f1', '#2ecc71', '#9b59b6', '#e67e22', '#34495e'];
    while (this.cars.length < wantCars) {
      const w = spawn(list, this.rnd, 1.2 + this.rnd() * 0.6, 0.2);
      if (!w) break;
      const kind = this.rnd() < 0.15 ? 1 : this.rnd() < 0.1 ? 2 : 0;
      const color = kind === 1 ? '#ffffff' : kind === 2 ? '#f39c12' : this.rnd() < 0.12 ? '#f9ca24' : palette[Math.floor(this.rnd() * palette.length)]!;
      const m = new THREE.Mesh(carGeometry(color, kind), this.mat);
      m.castShadow = this.quality === 'high';
      this.cars.push({ w, m });
      this.scene.add(m);
    }
    while (this.cars.length > wantCars) this.scene.remove(this.cars.pop()!.m);
    this.cars = this.cars.filter((c) => {
      if (!step(roads, c.w, dt, this.rnd)) {
        this.scene.remove(c.m);
        return false;
      }
      const p = position(c.w);
      c.m.position.set(p.x, 0.02, p.z);
      c.m.rotation.y = p.angle;
      return true;
    });
    let walkers = this.people.filter((p) => !p.target).length;
    while (walkers < wantPeople) {
      const w = spawn(list, this.rnd, 0.4, 0);
      if (!w) break;
      const p = this.makePerson(Math.floor(this.rnd() * 1e6));
      w.speed = p.w.speed;
      w.side = p.w.side;
      p.w = w;
      this.people.push(p);
      this.scene.add(p.g);
      walkers++;
    }
    this.people = this.people.filter((p) => {
      p.phase += dt * 9;
      const swing = Math.sin(p.phase) * 0.5;
      p.legs[0]!.rotation.z = swing;
      p.legs[1]!.rotation.z = -swing;
      if (p.target) {
        p.life! -= dt;
        const d = p.target.clone().sub(p.g.position);
        d.y = 0;
        if (d.length() < 0.3 || p.life! <= 0) {
          this.scene.remove(p.g);
          return false;
        }
        d.normalize();
        p.g.position.addScaledVector(d, dt * 0.9);
        p.g.rotation.y = Math.atan2(-d.z, d.x);
        return true;
      }
      if (!step(roads, p.w, dt, this.rnd)) {
        this.scene.remove(p.g);
        return false;
      }
      const pos = position(p.w);
      p.g.position.set(pos.x, 0.02, pos.z);
      p.g.rotation.y = pos.angle;
      return true;
    });
  }

  private updateTransport(): void {
    const t = this.time;
    const active = (station: string): boolean =>
      this.city.s.buildings.some((b) => b.state === 'done' && BUILDING.get(b.def)!.station === station && !!b.job);
    const has = (station: string): boolean => this.city.s.buildings.some((b) => BUILDING.get(b.def)!.station === station);
    // Zug: fährt bei Lieferung, sonst gelegentlich Durchfahrt
    const rail = active('rail') || has('rail');
    const cycle = (t * (active('rail') ? 0.12 : 0.05)) % 1;
    this.train.visible = rail || cycle < 0.4;
    this.train.position.x = -30 + cycle * (MAP + 70);
    const sea = active('sea');
    this.ship.visible = sea || has('sea');
    const sc = (t * 0.03) % 2;
    this.ship.position.set(-7, 0.05 + Math.sin(t * 1.5) * 0.04, -25 + (sc < 1 ? sc : 2 - sc) * (MAP + 30));
    this.ship.rotation.y = sc < 1 ? -Math.PI / 2 : Math.PI / 2;
    this.plane.visible = active('air');
    const a = t * 0.25;
    this.plane.position.set(MAP / 2 + Math.cos(a) * 22, 9 + Math.sin(a * 2) * 0.6, MAP / 2 + Math.sin(a) * 22);
    this.plane.rotation.y = -a - Math.PI / 2;
  }

  private updateAmbient(dt: number): void {
    // Nah herangezoomt würden die Wolken die Stadt verdecken: dann blenden sie aus.
    if (this.cloudMat) {
      const span = Math.min(this.camera.right - this.camera.left, this.camera.top - this.camera.bottom);
      this.cloudMat.opacity = 0.92 * Math.max(0, Math.min(1, (span - 10) / 6));
      for (const c of this.clouds) c.visible = this.cloudMat.opacity > 0.02;
    }
    for (const c of this.clouds) {
      c.position.x += dt * 0.4;
      if (c.position.x > MAP + 40) c.position.x = -40;
    }
    for (const b of this.birds) {
      b.a += dt * 0.3;
      b.g.position.set(b.c.x + Math.cos(b.a) * b.r, b.c.y + Math.sin(b.a * 3) * 0.2, b.c.z + Math.sin(b.a) * b.r);
      b.g.rotation.y = -b.a;
      b.g.children.forEach((w, i) => (w.rotation.x = Math.sin(this.time * 10 + i) * 0.4));
    }
    // Wellen
    const pos = this.water.geometry.getAttribute('position') as THREE.BufferAttribute;
    if (this.quality !== 'low' && Math.floor(this.time * 20) % 2 === 0) {
      for (let i = 0; i < pos.count; i++) pos.setY(i, Math.sin(pos.getX(i) * 0.6 + this.time * 1.4) * 0.04 + Math.cos(pos.getZ(i) * 0.5 + this.time) * 0.03);
      pos.needsUpdate = true;
    }
    // Symbole wippen, neue Gebäude „ploppen“
    for (const bm of this.bmeshes.values()) {
      if (bm.icon) bm.icon.position.y = (bm.icon.userData.baseY as number) + Math.sin(this.time * 3 + bm.mesh.position.x) * 0.08;
      const pt = bm.mesh.userData.popT as number | undefined;
      if (pt !== undefined) {
        const nt = pt + dt * 3;
        const s = nt >= 1 ? 1 : 1 + Math.sin(nt * Math.PI) * 0.15;
        bm.mesh.scale.x = bm.mesh.scale.z = s;
        if (nt >= 1) delete bm.mesh.userData.popT;
        else bm.mesh.userData.popT = nt;
      }
    }
    if (this.dayNight) {
      const k = (Math.sin(this.time * 0.05) + 1) / 2; // 0 Nacht … 1 Tag
      this.sun.intensity = 0.5 + k * 1.5;
      this.hemi.intensity = 0.6 + k * 0.6;
      (this.scene.background as THREE.Color).setRGB(0.2 + k * 0.42, 0.25 + k * 0.6, 0.45 + k * 0.5);
    } else {
      this.sun.intensity = 2.0;
      this.hemi.intensity = 1.2;
      (this.scene.background as THREE.Color).set('#9fd7f2');
    }
    (this.scene.fog as THREE.Fog).color.copy(this.scene.background as THREE.Color);
  }

  frame(dt: number): void {
    if (!this.paused) {
      this.time += dt;
      this.updateTraffic(dt);
      this.updateTransport();
      this.updateAmbient(dt);
    }
    this.yawShown += (this.yaw - this.yawShown) * Math.min(1, dt * 8);
    this.placeCamera();
    this.sun.position.set(this.target.x - 18, 40, this.target.z + 14);
    this.sun.target.position.copy(this.target);
    this.renderer.render(this.scene, this.camera);
  }
  /** Kamera sofort auf das Ziel stellen (auch zwischen zwei Bildern, z. B. direkt nach einem Kamerasprung). */
  placeCamera(): void {
    const a = this.yawShown + Math.PI / 4;
    const d = 40;
    this.camera.position.set(this.target.x + Math.sin(a) * d, d * 0.9, this.target.z + Math.cos(a) * d);
    this.camera.lookAt(this.target);
    this.camera.updateMatrixWorld();
  }

  stats(): { cars: number; people: number; buildings: number; calls: number } {
    return { cars: this.cars.length, people: this.people.length, buildings: this.bmeshes.size, calls: this.renderer.info.render.calls };
  }
}
