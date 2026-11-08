/** Bauten der Insel: Städtchen mit Bar, Laden und Museum, Hafen, Strandhaus (ausbaubar), Leuchtturm, Höhle, Ruine, Tempel, Lagune, Sonnenstrand */
import * as THREE from 'three';
import { height, poi, LAGOON } from './island';
import { T } from './textures';
import type { Colliders } from './collide';
import { mergeStatic } from './merge';

const matCache = new Map<string, THREE.MeshStandardMaterial>();
/** Materialien mit gleichen Eigenschaften teilen (Voraussetzung fürs Zusammenführen) */
const std = (o: THREE.MeshStandardMaterialParameters) => {
  const key = JSON.stringify(o, (k, v) => (v && typeof v === 'object' && 'uuid' in v ? v.uuid : k === 'color' || k === 'emissive' ? new THREE.Color(v).getHex() : v));
  let m = matCache.get(key);
  if (!m) matCache.set(key, (m = new THREE.MeshStandardMaterial({ roughness: 0.85, ...o })));
  return m;
};
const box = (w: number, h: number, d: number, m: THREE.Material) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const cyl = (r1: number, r2: number, h: number, m: THREE.Material, s = 12) => new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, s), m);
function shadow<T extends THREE.Object3D>(o: T, cast = true): T {
  o.traverse((c) => {
    if ((c as THREE.Mesh).isMesh) {
      c.castShadow = cast;
      c.receiveShadow = true;
    }
  });
  return o;
}
function repeated(t: THREE.Texture, rx: number, ry: number) {
  const c = t.clone();
  c.repeat.set(rx, ry);
  c.needsUpdate = true;
  return c;
}

/** Satteldach als Prisma (First entlang x) */
function roofGeo(w: number, d: number, rh: number): THREE.BufferGeometry {
  const hw = w / 2,
    hd = d / 2;
  const v = [
    // Dachflächen
    -hw, 0, hd, hw, 0, hd, hw, rh, 0, -hw, 0, hd, hw, rh, 0, -hw, rh, 0,
    hw, 0, -hd, -hw, 0, -hd, -hw, rh, 0, hw, 0, -hd, -hw, rh, 0, hw, rh, 0,
    // Giebel
    -hw, 0, -hd, -hw, 0, hd, -hw, rh, 0, hw, 0, hd, hw, 0, -hd, hw, rh, 0,
  ];
  const sl = Math.hypot(hd, rh) / 2;
  const uv = [0, 0, w / 2, 0, w / 2, sl, 0, 0, w / 2, sl, 0, sl, 0, 0, w / 2, 0, w / 2, sl, 0, 0, w / 2, sl, 0, sl, 0, 0, 1, 0, 0.5, 0.5, 0, 0, 1, 0, 0.5, 0.5];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.addGroup(0, 12, 0);
  g.addGroup(12, 6, 1);
  g.computeVertexNormals();
  return g;
}

export interface HouseOpts { x: number; z: number; rot: number; w: number; d: number; h: number; wall: string; shutter: string; roof: string; door?: string; sign?: [string, string, string]; porch?: boolean; floors?: number }
export function house(o: HouseOpts, col: Colliders): THREE.Group {
  const g = new THREE.Group();
  const y = height(o.x, o.z);
  const fac = T.facade(o.wall, o.shutter, Math.round(o.x + o.z));
  const fl = o.floors || Math.max(1, Math.round(o.h / 3.2));
  const mFront = std({ map: repeated(fac, Math.max(1, Math.round(o.w / 3.2)), fl) });
  const mSide = std({ map: repeated(fac, Math.max(1, Math.round(o.d / 3.2)), fl) });
  const plain = std({ color: o.wall });
  const body = new THREE.Mesh(new THREE.BoxGeometry(o.w, o.h, o.d), [mSide, mSide, plain, plain, mFront, mFront]);
  body.position.y = o.h / 2;
  // Sockel
  const base = box(o.w + 0.3, 0.6, o.d + 0.3, std({ color: 0x8a7f72, map: T.stone('#9a8f80', 2) }));
  base.position.y = 0.1;
  const rh = Math.min(3, o.d * 0.38);
  const roof = new THREE.Mesh(roofGeo(o.w + 0.9, o.d + 1.1, rh), [std({ map: T.roof(o.roof), side: THREE.DoubleSide }), std({ color: o.wall, side: THREE.DoubleSide })]);
  roof.position.y = o.h;
  g.add(body, base, roof);
  // Tür
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.6), std({ map: T.door(o.door || o.shutter) }));
  door.position.set(0, 1.4, o.d / 2 + 0.02);
  g.add(door);
  if (o.sign) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(o.w * 0.8, 7), 1.3), std({ map: T.sign(...o.sign), roughness: 0.6 }));
    s.position.set(0, Math.min(o.h - 0.5, 3.6), o.d / 2 + 0.06);
    g.add(s);
  }
  if (o.porch) {
    const pm = std({ map: T.wood('#9a6a40') });
    const deck = box(o.w, 0.25, 2.6, pm);
    deck.position.set(0, 0.3, o.d / 2 + 1.3);
    const awn = box(o.w + 0.4, 0.12, 3, std({ map: T.roof(o.roof) }));
    awn.position.set(0, 3.1, o.d / 2 + 1.4);
    awn.rotation.x = 0.12;
    g.add(deck, awn);
    for (const sx of [-o.w / 2 + 0.3, o.w / 2 - 0.3]) {
      const p = cyl(0.1, 0.1, 2.9, pm, 6);
      p.position.set(sx, 1.6, o.d / 2 + 2.6);
      g.add(p);
    }
  }
  g.position.set(o.x, y, o.z);
  g.rotation.y = o.rot;
  col.box(o.x, o.z, o.w / 2, o.d / 2, o.rot);
  return shadow(g);
}

export interface TownResult {
  group: THREE.Group;
  lampMat: THREE.MeshStandardMaterial;
  lights: THREE.PointLight[];
  beam: THREE.Object3D;
  falls: THREE.Texture;
  fire: THREE.Object3D;
  boats: THREE.Object3D[];
}

function lamp(x: number, z: number, m: THREE.Material, bulb: THREE.Material, g: THREE.Group, col: Colliders) {
  const y = height(x, z);
  const p = cyl(0.07, 0.11, 3.6, m, 6);
  p.position.set(x, y + 1.8, z);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), bulb);
  head.position.set(x, y + 3.75, z);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.25, 8), m);
  cap.position.set(x, y + 4, z);
  g.add(p, head, cap);
  col.circle(x, z, 0.15);
}

function boat(color: string, sail: boolean): THREE.Group {
  const g = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), std({ color, side: THREE.DoubleSide, roughness: 0.5 }));
  hull.scale.set(1.1, 0.7, 3);
  const deck = new THREE.Mesh(new THREE.CircleGeometry(1, 18), std({ map: T.wood('#b88a5a') }));
  deck.rotation.x = -Math.PI / 2;
  deck.scale.set(1.05, 2.9, 1);
  deck.position.y = -0.05;
  g.add(hull, deck);
  if (sail) {
    const mast = cyl(0.05, 0.06, 6, std({ color: 0xdddddd }), 6);
    mast.position.y = 3;
    const s = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 4.6), std({ color: 0xfaf6ec, side: THREE.DoubleSide }));
    s.position.set(0, 3.3, 0.9);
    s.rotation.y = Math.PI / 2;
    g.add(mast, s);
  }
  return shadow(g);
}

export function buildTown(quality: number, col: Colliders): TownResult {
  const g = new THREE.Group();
  const iron = std({ color: 0x2a2a2a, metalness: 0.6, roughness: 0.5 });
  const lampMat = std({ color: 0xfff1c8, emissive: 0xffc870, emissiveIntensity: 0 });
  const wood = std({ map: T.wood('#8a5a34') });
  const stone = std({ map: T.stone('#b0a594', 3) });
  const lights: THREE.PointLight[] = [];

  // ---------- Museum ----------
  const mus = house({ x: 0, z: 104, rot: 0, w: 22, d: 12, h: 8, wall: '#efe4cc', shutter: '#5a7a9a', roof: '#7a7a80', door: '#4a3020', sign: ['INSELMUSEUM', '#1e3a5a', '#f4e4b0'] }, col);
  const my = height(0, 110);
  const steps = box(10, 0.5, 3, stone);
  steps.position.set(0, my + 0.25, 111.5);
  g.add(mus, steps);
  for (let i = -2; i <= 2; i++) {
    const c = cyl(0.35, 0.4, 7, std({ color: 0xf4ecd8 }), 14);
    c.position.set(i * 2.4, my + 3.9, 111.2);
    g.add(shadow(c));
  }
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 7.5, 1.8, 3, 1), std({ color: 0xefe4cc }));
  ped.rotation.set(Math.PI / 2, 0, 0);
  ped.scale.set(1, 0.1, 1);
  ped.position.set(0, my + 8.3, 111.6);
  g.add(ped);

  // ---------- Bar Gezeitenperle (Front nach Osten) ----------
  g.add(house({ x: -46, z: 142, rot: Math.PI / 2, w: 14, d: 11, h: 6, wall: '#2a9a9a', shutter: '#f4d35e', roof: '#c0563a', sign: ['GEZEITENPERLE', '#f4d35e', '#16404a'] }, col));
  const by = height(-36, 142);
  const deck = box(8, 0.3, 14, std({ map: T.wood('#a8784a') }));
  deck.position.set(-36.5, by + 0.15, 142);
  const counter = box(1, 1.15, 6, std({ map: T.wood('#6a3a1e') }));
  counter.position.set(-38.5, by + 0.85, 142);
  g.add(shadow(deck), shadow(counter));
  col.box(-38.5, 142, 0.5, 3);
  for (let i = 0; i < 4; i++) {
    const st = cyl(0.25, 0.2, 0.8, iron, 8);
    st.position.set(-37.4, by + 0.7, 139.8 + i * 1.5);
    g.add(st);
  }
  for (const [tx, tz] of [[-34, 137.5], [-34, 146.5]]) {
    const t = cyl(0.6, 0.6, 0.06, wood, 14);
    t.position.set(tx, by + 1.05, tz);
    const leg = cyl(0.06, 0.06, 0.9, iron, 6);
    leg.position.set(tx, by + 0.6, tz);
    const umb = new THREE.Mesh(new THREE.ConeGeometry(2.1, 0.8, 10, 1, true), std({ color: 0xf4d35e, side: THREE.DoubleSide }));
    umb.position.set(tx, by + 3, tz);
    const pole = cyl(0.04, 0.04, 2.6, iron, 6);
    pole.position.set(tx, by + 1.9, tz);
    g.add(shadow(t), leg, shadow(umb), pole);
    col.circle(tx, tz, 0.65);
  }
  const barLight = new THREE.PointLight(0xffb060, 0, 18, 1.6);
  barLight.position.set(-36, by + 3, 142);
  lights.push(barLight);
  g.add(barLight);
  // Lichterkette an der Bar
  for (let i = 0; i < 12; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 4), lampMat);
    b.position.set(-32.6, by + 2.9 - Math.sin((i / 11) * Math.PI) * 0.5, 135.5 + i * 1.2);
    g.add(b);
  }

  // ---------- Kramladen (Front nach Westen) ----------
  g.add(house({ x: 44, z: 136, rot: -Math.PI / 2, w: 12, d: 10, h: 6, wall: '#f2b84b', shutter: '#2a6a9a', roof: '#a8452e', sign: ['KRAMLADEN', '#2a6a9a', '#fff4d8'], porch: true }, col));
  const sy = height(36, 136);
  for (let i = 0; i < 3; i++) {
    const cr = box(0.9, 0.6, 0.9, wood);
    cr.position.set(36.2, sy + 0.62, 132 + i * 1.3);
    const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 6, 0, 6.3, 0, 1.4), std({ color: [0xff8a2a, 0xffd23a, 0x8ac43a][i] }));
    fruit.position.set(36.2, sy + 0.95, 132 + i * 1.3);
    g.add(shadow(cr), fruit);
  }

  // ---------- Wohnhäuser ----------
  const HOUSES: [number, number, number, string, string, string][] = [
    [-28, 116, 0, '#f4a6a6', '#ffffff', '#b0503a'],
    [28, 114, 0, '#a8d8b8', '#e85a5a', '#8a3a2a'],
    [-62, 128, Math.PI / 2, '#f6e27a', '#3a7aba', '#b0503a'],
    [64, 122, -Math.PI / 2, '#9ac4f0', '#ffffff', '#7a4a3a'],
    [-56, 170, Math.PI / 2, '#f0c0e0', '#4a9a6a', '#a04a3a'],
    [58, 166, -Math.PI / 2, '#fcd2a0', '#2a8a9a', '#b8603a'],
    [-18, 184, Math.PI, '#c8e6f8', '#f4a020', '#a85030'],
    [-44, 196, Math.PI, '#e8f4c8', '#c04060', '#9a4a32'],
  ];
  HOUSES.forEach(([x, z, rot, wall, sh, roof], i) => g.add(house({ x, z, rot, w: 9 + (i % 3), d: 8, h: i % 2 ? 6.4 : 3.6, wall, shutter: sh, roof, porch: i % 3 === 1 }, col)));

  // ---------- Marktplatz ----------
  const py = height(0, 150);
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(17, 40), std({ map: repeated(T.stone('#c8b89a', 8), 8, 8), roughness: 0.9 }));
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.set(0, py + 0.03, 150);
  plaza.receiveShadow = true;
  g.add(plaza);
  const basin = cyl(3.6, 3.8, 0.8, stone, 24);
  basin.position.set(0, py + 0.4, 150);
  const water = new THREE.Mesh(new THREE.CircleGeometry(3.3, 24), std({ color: 0x3ab0c8, roughness: 0.1, metalness: 0.2 }));
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, py + 0.72, 150);
  const col1 = cyl(0.4, 0.5, 2.2, stone, 12);
  col1.position.set(0, py + 1.5, 150);
  const bowl = cyl(1.2, 0.4, 0.4, stone, 16);
  bowl.position.set(0, py + 2.6, 150);
  g.add(shadow(basin), water, shadow(col1), shadow(bowl));
  col.circle(0, 150, 3.9);
  const fLight = new THREE.PointLight(0xffd8a0, 0, 26, 1.5);
  fLight.position.set(0, py + 4.5, 150);
  lights.push(fLight);
  g.add(fLight);
  // Marktstände
  const awnC = ['#e85a5a', '#3a9ad8', '#f4c040'];
  [[-12, 158, 0.6], [12, 160, -0.6], [-13, 141, 2.5]].forEach(([x, z, r], i) => {
    const s = new THREE.Group();
    const tbl = box(3, 0.9, 1.4, wood);
    tbl.position.y = 0.45;
    const roofS = box(3.4, 0.08, 2, std({ color: awnC[i] }));
    roofS.position.y = 2.4;
    roofS.rotation.x = 0.15;
    s.add(tbl, roofS);
    for (const [dx, dz] of [[-1.5, -0.8], [1.5, -0.8], [-1.5, 0.8], [1.5, 0.8]]) {
      const p = cyl(0.05, 0.05, 2.4, wood, 6);
      p.position.set(dx, 1.2, dz);
      s.add(p);
    }
    for (let k = 0; k < 6; k++) {
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), std({ color: [0xff6a2a, 0xffd23a, 0x6ac43a, 0xd02a4a][k % 4] }));
      f.position.set(-1.1 + k * 0.45, 1.02, (k % 2) * 0.3 - 0.15);
      s.add(f);
    }
    s.position.set(x, height(x, z), z);
    s.rotation.y = r;
    g.add(shadow(s));
    col.box(x, z, 1.6, 0.8, r);
  });
  // Laternen
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    lamp(Math.cos(a) * 18.5, 150 + Math.sin(a) * 18.5, iron, lampMat, g, col);
  }
  for (const [x, z] of [[12, 168], [24, 182], [32, 194], [-20, 146], [20, 144], [0, 128], [-60, 151], [-95, 160], [60, 147], [95, 162]]) lamp(x + 2.5, z, iron, lampMat, g, col);

  // ---------- Hafen ----------
  const pierTop = 1.65;
  const pier = box(5, 0.4, 46, std({ map: repeated(T.wood('#9a7048'), 1, 8) }));
  pier.position.set(34, pierTop - 0.2, 214);
  g.add(shadow(pier, false));
  col.box(34, 214, 2.5, 23, 0, pierTop);
  for (let z = 194; z <= 236; z += 4)
    for (const x of [31.7, 36.3]) {
      const p = cyl(0.18, 0.18, 6, std({ color: 0x4a3a2a }), 6);
      p.position.set(x, -1.2, z);
      g.add(p);
    }
  const ferryDock = box(10, 0.4, 6, std({ map: T.wood('#9a7048') }));
  ferryDock.position.set(34, pierTop - 0.2, 236);
  g.add(ferryDock);
  col.box(34, 236, 5, 3, 0, pierTop);
  const boats: THREE.Object3D[] = [];
  [[40.5, 226, '#e8f0f8', true], [27.5, 228, '#d84a3a', false], [41, 233, '#2a6aaa', false], [26.5, 236, '#f4d35e', true]].forEach(([x, z, c, s]) => {
    const b = boat(c as string, s as boolean);
    b.position.set(x as number, 0.4, z as number);
    b.userData.dyn = true;
    boats.push(b);
    g.add(b);
  });
  // Hafenbüro
  g.add(house({ x: 50, z: 192, rot: -Math.PI / 2, w: 6, d: 5, h: 3.4, wall: '#ffffff', shutter: '#1e4a8a', roof: '#3a5a8a', sign: ['HAFEN', '#1e4a8a', '#ffffff'] }, col));
  for (let i = 0; i < 6; i++) {
    const b = cyl(0.35, 0.35, 0.9, std({ map: T.wood('#6a4a2a') }), 10);
    b.position.set(26 + (i % 3) * 0.8, height(26, 192) + 0.45, 190 + Math.floor(i / 3) * 0.8);
    g.add(shadow(b));
  }
  col.circle(27, 190.5, 1.4);

  // ---------- Leuchtturm ----------
  const L = poi('lighthouse'),
    ly = height(L.x, L.z - 4);
  const stripes = document.createElement('canvas');
  stripes.width = 8;
  stripes.height = 64;
  const sx = stripes.getContext('2d')!;
  for (let i = 0; i < 8; i++) {
    sx.fillStyle = i % 2 ? '#c8202a' : '#f8f6f0';
    sx.fillRect(0, i * 8, 8, 8);
  }
  const stTex = new THREE.CanvasTexture(stripes);
  stTex.colorSpace = THREE.SRGBColorSpace;
  const tower = cyl(2.1, 3.1, 20, std({ map: stTex, roughness: 0.6 }), 24);
  tower.position.set(L.x, ly + 10, L.z - 4);
  const gallery = cyl(3, 3, 0.3, iron, 24);
  gallery.position.set(L.x, ly + 20.2, L.z - 4);
  const glass = cyl(1.6, 1.6, 2.4, lampMat, 16);
  glass.position.set(L.x, ly + 21.5, L.z - 4);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(2.1, 1.8, 16), std({ color: 0x2a2a2a }));
  cap.position.set(L.x, ly + 23.6, L.z - 4);
  g.add(shadow(tower), gallery, glass, cap);
  col.circle(L.x, L.z - 4, 3.2);
  const beam = new THREE.Group();
  const cone = new THREE.Mesh(new THREE.ConeGeometry(4, 70, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff2c0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  cone.rotation.z = Math.PI / 2;
  cone.position.x = 35;
  beam.add(cone);
  beam.position.set(L.x, ly + 21.5, L.z - 4);
  beam.userData.dyn = true;
  g.add(beam);
  const ldoor = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.4), std({ map: T.door('#3a2a1a') }));
  ldoor.position.set(L.x, ly + 1.2, L.z - 4 + 3.02);
  g.add(ldoor);
  g.add(house({ x: L.x + 9, z: L.z + 2, rot: 0, w: 6, d: 5, h: 3.2, wall: '#f4f0e8', shutter: '#c8202a', roof: '#4a4a4a' }, col));

  // ---------- Höhle der Gezeiten ----------
  const C = poi('cave');
  const rockMat = std({ map: T.rock(), roughness: 0.95 });
  const arch = new THREE.Group();
  for (let i = 0; i < 9; i++) {
    const a = (i / 8) * Math.PI;
    const r = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2 + (i % 3) * 0.5, 1), rockMat);
    r.position.set(-1, Math.sin(a) * 4.8, Math.cos(a) * 4.2);
    r.rotation.set(i, i * 2, i * 3);
    arch.add(r);
  }
  const hole = new THREE.Mesh(new THREE.CircleGeometry(3.4, 20, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0x050403 }));
  hole.rotation.y = Math.PI / 2;
  hole.position.set(-1.6, 0, 0);
  arch.add(hole);
  for (let i = 0; i < 6; i++) {
    const r = new THREE.Mesh(new THREE.DodecahedronGeometry(4 + i * 0.6, 1), rockMat);
    r.position.set(-6 - i * 2, 2 + i, (i - 2.5) * 4);
    arch.add(r);
  }
  arch.position.set(C.x - 1, height(C.x, C.z) - 0.3, C.z);
  g.add(shadow(arch));
  col.circle(C.x - 2, C.z - 4.4, 2);
  col.circle(C.x - 2, C.z + 4.4, 2);
  col.box(C.x - 8, C.z, 5, 8);

  // ---------- Dschungelruine ----------
  const R = poi('ruins'),
    ry = height(R.x, R.z);
  const ruinStone = std({ map: T.stone('#7a8a6a', 12) });
  const ruin = new THREE.Group();
  const tiers = [[16, 2.2, 12], [12, 2, 9], [8, 1.8, 6]];
  let ty = 0;
  for (const [w, h, d] of tiers) {
    const t = box(w, h, d, ruinStone);
    t.position.set(0, ty + h / 2, -8);
    ruin.add(t);
    ty += h;
  }
  const portal = box(3, 3.4, 0.6, std({ color: 0x0a0806 }));
  portal.position.set(0, 1.7, -1.95);
  ruin.add(portal);
  const vineMat = std({ map: T.leaves(100), alphaTest: 0.5, side: THREE.DoubleSide });
  for (let i = 0; i < 5; i++) {
    const v = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 3.2), vineMat);
    v.position.set(-1.2 + i * 0.6, 1.8, -1.55);
    ruin.add(v);
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const hgt = 1.5 + ((i * 37) % 5);
    const c = cyl(0.45, 0.5, hgt, ruinStone, 10);
    c.position.set(Math.cos(a) * 13, hgt / 2, Math.sin(a) * 11 + 2);
    c.rotation.z = (i % 3) * 0.05;
    ruin.add(c);
    col.circle(R.x + Math.cos(a) * 13, R.z + Math.sin(a) * 11 + 2, 0.55);
  }
  ruin.position.set(R.x, ry - 0.2, R.z);
  g.add(shadow(ruin));
  col.box(R.x, R.z - 8, 8, 6);

  // ---------- Vulkantempel ----------
  const P = poi('temple'),
    tpy = height(P.x, P.z);
  const tStone = std({ map: T.stone('#6a5a50', 14) });
  const temple = new THREE.Group();
  ty = 0;
  for (const [w, h] of [[16, 3], [12, 3], [8, 3], [4, 2]]) {
    const t = box(w, h, w, tStone);
    t.position.set(0, ty + h / 2, -9);
    temple.add(t);
    ty += h;
  }
  const tDoor = box(2.6, 3, 0.4, std({ color: 0x0a0605 }));
  tDoor.position.set(0, 1.5, -0.85);
  const glowM = std({ color: 0xff6a20, emissive: 0xff4a10, emissiveIntensity: 1.5 });
  temple.add(tDoor);
  for (const sx2 of [-2.2, 2.2]) {
    const b = cyl(0.3, 0.4, 1, tStone, 8);
    b.position.set(sx2, 0.5, -0.4);
    const fl = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 8), glowM);
    fl.position.set(sx2, 1.25, -0.4);
    temple.add(b, fl);
  }
  temple.position.set(P.x, tpy - 0.3, P.z);
  g.add(shadow(temple));
  col.box(P.x, P.z - 9, 8, 8);

  // ---------- Lagune: Wasserfall ----------
  const fallTex = (() => {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 128;
    const x = c.getContext('2d')!;
    x.fillStyle = 'rgba(200,240,255,.55)';
    x.fillRect(0, 0, 64, 128);
    for (let i = 0; i < 40; i++) {
      x.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.5})`;
      x.fillRect(Math.random() * 64, Math.random() * 128, 2 + Math.random() * 3, 10 + Math.random() * 30);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  })();
  const fall = new THREE.Mesh(new THREE.PlaneGeometry(5, 11), new THREE.MeshStandardMaterial({ map: fallTex, transparent: true, depthWrite: false, roughness: 0.2, emissive: 0x335566, emissiveIntensity: 0.4 }));
  fall.position.set(LAGOON.x, LAGOON.y + 5.3, LAGOON.z - LAGOON.r - 0.8);
  fall.userData.dyn = true;
  g.add(fall);
  for (let i = 0; i < 7; i++) {
    const rr = new THREE.Mesh(new THREE.DodecahedronGeometry(3 + (i % 3), 1), rockMat);
    const a = -Math.PI / 2 + (i - 3) * 0.28;
    rr.position.set(LAGOON.x + Math.cos(a) * (LAGOON.r + 3.5), LAGOON.y + 3 + (i % 2) * 3, LAGOON.z + Math.sin(a) * (LAGOON.r + 3.5));
    g.add(shadow(rr));
    col.circle(rr.position.x, rr.position.z, 3);
  }

  // ---------- Sonnenstrand ----------
  const SB = poi('sunset'),
    sby = height(SB.x, SB.z);
  const fire = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const log = cyl(0.12, 0.12, 1.4, std({ color: 0x4a3020 }), 6);
    log.rotation.set(Math.PI / 2, 0, (i / 5) * Math.PI);
    log.position.y = 0.12;
    fire.add(log);
  }
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.3, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0xff9a30, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
  flame.position.y = 0.7;
  flame.name = 'flame';
  const fireLight = new THREE.PointLight(0xff8a3a, 0, 14, 1.6);
  fireLight.position.y = 1.2;
  fire.add(flame, fireLight);
  lights.push(fireLight);
  fire.position.set(SB.x + 4, sby, SB.z + 4);
  fire.userData.dyn = true;
  g.add(fire);
  for (let i = 0; i < 4; i++) {
    const board = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 2, 4, 10), std({ color: ['#ff5a3a', '#3ac4e8', '#f4d35e', '#7ad84a'][i], roughness: 0.4 }));
    board.scale.z = 0.25;
    board.position.set(SB.x - 6 + i * 1.1, sby + 1.1, SB.z - 6);
    board.rotation.z = (i - 1.5) * 0.08;
    g.add(shadow(board));
  }
  col.box(SB.x - 4.4, SB.z - 6, 2.4, 0.4);
  for (let i = 0; i < 3; i++) {
    const lounger = box(0.8, 0.25, 2, std({ color: 0xf4f0e8 }));
    lounger.position.set(SB.x + 8 + i * 2, sby + 0.35, SB.z - 2);
    lounger.rotation.x = -0.12;
    const umb = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.6, 10, 1, true), std({ color: ['#ff5a7a', '#3a9ad8', '#ffd23a'][i], side: THREE.DoubleSide }));
    umb.position.set(SB.x + 8 + i * 2, sby + 2.4, SB.z - 3);
    const pole = cyl(0.03, 0.03, 2.4, iron, 6);
    pole.position.set(SB.x + 8 + i * 2, sby + 1.2, SB.z - 3);
    g.add(shadow(lounger), shadow(umb), pole);
  }
  return { group: mergeStatic(g, quality > 0), lampMat, lights, beam, falls: fallTex, fire, boats };
}

/** Strandhaus in vier Ausbaustufen (0 = Bruchbude) */
export function buildBeachHouse(stage: number, col: Colliders | null, lampMat: THREE.Material): THREE.Group {
  const H = poi('house'),
    x = H.x,
    z = H.z - 4.5,
    y = height(x, z);
  const g = new THREE.Group();
  const weather = stage === 0;
  const planks = std({ map: T.wood(weather ? '#9a8a78' : '#e8dcc4') });
  const body = box(8, 3.4, 6.5, planks);
  body.position.set(0, 2.1, 0);
  const stilts = std({ color: 0x5a4632 });
  for (const sx of [-3.8, 3.8]) for (const sz of [-3, 3]) {
    const s = cyl(0.15, 0.15, 1.2, stilts, 6);
    s.position.set(sx, 0.2, sz);
    g.add(s);
  }
  const floor = box(8.4, 0.25, 6.9, planks);
  floor.position.y = 0.45;
  g.add(body, floor);
  // Dach
  const roof = new THREE.Mesh(roofGeo(9.4, 8, 2.2), [std({ map: T.roof(weather ? '#7a6a5a' : '#2a8a8a'), side: THREE.DoubleSide }), std({ map: T.wood(weather ? '#8a7a68' : '#e8dcc4'), side: THREE.DoubleSide })]);
  roof.position.y = 3.8;
  g.add(roof);
  if (weather) {
    // Löcher im Dach, vernagelte Fenster
    const hole = box(2, 0.1, 1.6, std({ color: 0x1a1410 }));
    hole.position.set(1.6, 4.6, 1.6);
    hole.rotation.x = -0.5;
    g.add(hole);
    for (const sx of [-2.4, 2.4]) {
      for (const r of [0.6, -0.6]) {
        const b = box(1.7, 0.18, 0.06, std({ map: T.wood('#7a6a58') }));
        b.position.set(sx, 2.4, 3.3);
        b.rotation.z = r;
        g.add(b);
      }
    }
  } else {
    for (const sx of [-2.4, 2.4]) {
      const win = box(1.4, 1.2, 0.08, std({ color: 0x8ab8d0, roughness: 0.1, metalness: 0.3 }));
      win.position.set(sx, 2.4, 3.27);
      g.add(win);
      for (const d of [-1, 1]) {
        const sh = box(0.65, 1.3, 0.06, std({ color: 0x2ac4b8 }));
        sh.position.set(sx + d * 1.05, 2.4, 3.3);
        g.add(sh);
      }
    }
  }
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.3), std({ map: T.door(weather ? '#6a5a48' : '#2ac4b8') }));
  door.position.set(0, 1.75, 3.27);
  g.add(door);
  const stepsB = box(1.6, 0.5, 0.8, planks);
  stepsB.position.set(0, 0.25, 3.8);
  g.add(stepsB);
  if (stage >= 2) {
    const terr = box(8.4, 0.25, 3.4, std({ map: T.wood('#b8865a') }));
    terr.position.set(0, 0.45, 5.0);
    const sofa = box(2.4, 0.5, 0.9, std({ color: 0xf4efe6 }));
    sofa.position.set(-2.6, 0.85, 5.6);
    const back = box(2.4, 0.6, 0.25, std({ color: 0xf4efe6 }));
    back.position.set(-2.6, 1.2, 6.0);
    const tbl = cyl(0.55, 0.55, 0.07, std({ map: T.wood('#6a4a2a') }), 14);
    tbl.position.set(2.4, 1.3, 5.2);
    const leg = cyl(0.06, 0.06, 0.75, std({ color: 0x3a2a1a }), 6);
    leg.position.set(2.4, 0.9, 5.2);
    g.add(terr, sofa, back, tbl, leg);
    for (const sx of [1.7, 3.1]) {
      const c = box(0.5, 0.06, 0.5, std({ map: T.wood('#6a4a2a') }));
      c.position.set(sx, 0.95, 5.2);
      g.add(c);
    }
  }
  if (stage >= 3) {
    for (let i = 0; i < 16; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), lampMat);
      b.position.set(-4 + i * 0.53, 3.6 - Math.sin((i / 15) * Math.PI) * 0.4, 6.6);
      g.add(b);
    }
    const ham = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 6, 0, Math.PI * 2, Math.PI * 0.6, Math.PI * 0.4), std({ color: 0xe8604a, side: THREE.DoubleSide }));
    ham.scale.set(0.6, 0.5, 1.8);
    ham.position.set(8, 1.6, 6);
    g.add(ham);
  }
  if (stage >= 4) {
    const pool = box(4.5, 0.6, 3.2, std({ color: 0xf4f4f0 }));
    pool.position.set(8.5, 0.3, 0);
    const pw = new THREE.Mesh(new THREE.PlaneGeometry(4.1, 2.8), std({ color: 0x2ad4e8, roughness: 0.05, metalness: 0.2, emissive: 0x0a4a5a, emissiveIntensity: 0.4 }));
    pw.rotation.x = -Math.PI / 2;
    pw.position.set(8.5, 0.62, 0);
    const shower = cyl(0.05, 0.05, 2.4, std({ color: 0xc0c0c0, metalness: 0.8, roughness: 0.3 }), 6);
    shower.position.set(11.6, 1.2, -2);
    g.add(pool, pw, shower);
    col?.box(x + 8.5, z, 2.25, 1.6, 0, 0.6);
  }
  g.position.set(x, y, z);
  if (col) col.box(x, z, 4.1, 3.4);
  return mergeStatic(shadow(g), true);
}
