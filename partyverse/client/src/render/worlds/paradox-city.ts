import * as THREE from 'three';
import { disposeTree, glow, toon } from '../materials';
import type { Decor, DecorContext, DecorFactory } from './common';

/**
 * PARADOX CITY: unmögliche Stadt (Escher/Penrose).
 * Stadtteile schweben als Platten und Wände rund um das Brett, Hochhäuser stehen auf BEIDEN Seiten (auch kopfüber),
 * manche Stadtteile klappen sich langsam auf und zu (4D-Faltung). Dazu endlose Treppen, Zahnräder,
 * Neon-Zeichen, schwebende Laternen, Lichtbahnen, zwei Monde und Sterne.
 * Alles liegt außerhalb des Spielbereichs; ca. 24 Draw Calls.
 */

const PALETTE = [0x5a4a9a, 0x7a5ab8, 0x3f6fb0, 0xb04a8a, 0x2f8f9a, 0x8a6ad0, 0xd0587a, 0x4a5ab0];
const WINDOW_COLORS = [0xffe27a, 0x7af0ff, 0xff8fd0, 0xfff4c8, 0xffe27a];
const NEON = [0xff4fa8, 0x4ff0ff, 0xffd84a, 0x9a7bff, 0x6bff9a, 0xff8a3a];

const TAU = Math.PI * 2;
const X_AXIS = new THREE.Vector3(1, 0, 0);
const Z_AXIS = new THREE.Vector3(0, 0, 1);
const Y_AXIS = new THREE.Vector3(0, 1, 0);

// Temporäre Objekte (keine Allokation pro Frame)
const mA = new THREE.Matrix4();
const mB = new THREE.Matrix4();
const mC = new THREE.Matrix4();
const qA = new THREE.Quaternion();
const vA = new THREE.Vector3();
const vB = new THREE.Vector3();
const vC = new THREE.Vector3();
const vS = new THREE.Vector3();
const col = new THREE.Color();

interface Item {
  m: THREE.Matrix4;
  color: number;
}
interface DynItem extends Item {
  part: number;
}

function makeInstanced(geo: THREE.BufferGeometry, mat: THREE.Material, items: Item[], castShadow = false): THREE.InstancedMesh {
  const mesh = new THREE.InstancedMesh(geo, mat, Math.max(1, items.length));
  mesh.count = items.length;
  items.forEach((it, i) => {
    mesh.setMatrixAt(i, it.m);
    mesh.setColorAt(i, col.setHex(it.color));
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.frustumCulled = false;
  mesh.castShadow = castShadow;
  return mesh;
}

/** Einheitswürfel mit Unterkante bei y=0 (Hochhäuser, Platten) */
function baseBox(): THREE.BoxGeometry {
  const g = new THREE.BoxGeometry(1, 1, 1);
  g.translate(0, 0.5, 0);
  return g;
}

function gearGeometry(teeth: number): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  const root = 0.82;
  const step = TAU / teeth;
  for (let k = 0; k < teeth; k++) {
    const a = k * step;
    const pts: [number, number][] = [
      [a - step * 0.32, root],
      [a - step * 0.17, 1],
      [a + step * 0.17, 1],
      [a + step * 0.32, root],
    ];
    pts.forEach(([ang, r], j) => {
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r;
      if (k === 0 && j === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    });
  }
  s.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, 0.2, 0, TAU, true);
  s.holes.push(hole);
  for (let i = 0; i < 5; i++) {
    const h = new THREE.Path();
    h.absarc(Math.cos((i / 5) * TAU) * 0.52, Math.sin((i / 5) * TAU) * 0.52, 0.14, 0, TAU, true);
    s.holes.push(h);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: false, curveSegments: 4 });
  g.translate(0, 0, -0.15);
  return g;
}

export const createDecor: DecorFactory = (ctx: DecorContext): Decor => {
  const { rng, center, radius, theme } = ctx;
  const p = Math.min(1, Math.max(0, ctx.quality.particles));
  const group = new THREE.Group();
  const meshes: THREE.InstancedMesh[] = [];

  let minY = Infinity;
  for (const n of ctx.layout.nodes) minY = Math.min(minY, n.pos[1]);
  if (!isFinite(minY)) minY = center.y - 4;

  // ------------------------------------------------------------------ Stadtteile
  const staticBlocks: Item[] = [];
  const dynBlocks: DynItem[] = [];
  const staticWin: Item[] = [];
  const dynWin: DynItem[] = [];
  const parts: { frame: THREE.Matrix4; amp: number; speed: number; phase: number; angle: number }[] = [];

  const dmin = radius * 1.1 + 14;
  const winFaces = p > 0.5 ? 4 : 2;

  const addBlock = (frame: THREE.Matrix4, local: THREE.Matrix4, color: number, part: number): void => {
    if (part < 0) staticBlocks.push({ m: new THREE.Matrix4().multiplyMatrices(frame, local), color });
    else dynBlocks.push({ m: local.clone(), color, part });
  };
  const addWin = (frame: THREE.Matrix4, local: THREE.Matrix4, color: number, part: number): void => {
    if (part < 0) staticWin.push({ m: new THREE.Matrix4().multiplyMatrices(frame, local), color });
    else dynWin.push({ m: local.clone(), color, part });
  };

  const addBuilding = (frame: THREE.Matrix4, bx: number, by: number, bz: number, flip: boolean, w: number, h: number, d: number, part: number, ci: number): void => {
    const lb = new THREE.Matrix4().makeTranslation(bx, by, bz);
    if (flip) lb.multiply(mA.makeRotationX(Math.PI));
    lb.multiply(mA.makeRotationY(rng.float(0, TAU)));
    if (rng.chance(0.3)) lb.multiply(mA.makeRotationZ(rng.float(-0.12, 0.12)));
    const color = PALETTE[ci % PALETTE.length]!;
    addBlock(frame, new THREE.Matrix4().multiplyMatrices(lb, mB.makeScale(w, h, d)), color, part);
    // Dachkappe
    if (rng.chance(0.65)) {
      const cap = new THREE.Matrix4().multiplyMatrices(lb, mB.makeTranslation(0, h, 0).multiply(mC.makeScale(w * 1.18, 0.35, d * 1.18)));
      addBlock(frame, cap, PALETTE[(ci + 3) % PALETTE.length]!, part);
    }
    // Fenster
    for (let f = 0; f < winFaces; f++) {
      const yaw = f * (Math.PI / 2);
      const faceW = f % 2 === 0 ? w : d;
      const halfD = (f % 2 === 0 ? d : w) / 2 + 0.03;
      const cols = Math.max(1, Math.floor(faceW / 1.5));
      const rows = Math.max(1, Math.floor((h - 1.2) / 1.7));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (!rng.chance(0.68)) continue;
          const x = ((c + 0.5) / cols - 0.5) * faceW;
          const y = 0.9 + (r + 0.5) * ((h - 1.5) / rows);
          const wm = new THREE.Matrix4().multiplyMatrices(lb, mA.makeRotationY(yaw));
          wm.multiply(mB.makeTranslation(x, y, halfD)).multiply(mC.makeScale(0.55, 0.8, 0.08));
          addWin(frame, wm, rng.pick(WINDOW_COLORS), part);
        }
      }
    }
  };

  const buildCluster = (kind: 'ground' | 'wall' | 'below', pos: THREE.Vector3, fold: boolean): void => {
    const S = rng.float(6, 8);
    const T = 1.2;
    const frame = new THREE.Matrix4();
    if (kind === 'wall') {
      const phi = Math.atan2(-(center.z - pos.z), center.x - pos.x);
      frame.makeTranslation(pos.x, pos.y, pos.z);
      frame.multiply(mA.makeRotationY(phi)).multiply(mA.makeRotationZ(-Math.PI / 2 + rng.float(-0.12, 0.12))).multiply(mA.makeRotationY(rng.float(-0.6, 0.6)));
    } else {
      frame.makeTranslation(pos.x, pos.y, pos.z);
      frame.multiply(mA.makeRotationY(rng.float(0, TAU)));
      frame.multiply(mA.makeRotationX(rng.float(-0.3, 0.3))).multiply(mA.makeRotationZ(rng.float(-0.3, 0.3)));
    }
    const slabColor = rng.chance(0.5) ? theme.islandTop : theme.island;
    const partB = fold ? parts.push({ frame, amp: rng.pick([-1, 1]) * rng.float(0.9, 1.25), speed: rng.float(0.18, 0.3), phase: rng.float(0, TAU), angle: 0 }) - 1 : -1;
    // Platte(n)
    if (fold) {
      addBlock(frame, new THREE.Matrix4().makeTranslation(-S / 2, -T / 2, 0).multiply(mB.makeScale(S, T, S * 2)), slabColor, -1);
      addBlock(frame, new THREE.Matrix4().makeTranslation(S / 2, -T / 2, 0).multiply(mB.makeScale(S, T, S * 2)), slabColor, partB);
    } else {
      addBlock(frame, new THREE.Matrix4().makeTranslation(0, -T / 2, 0).multiply(mB.makeScale(S * 2, T, S * 2)), slabColor, -1);
    }
    // Gebäude auf beiden Seiten
    const cells = 3;
    const cs = (S * 2) / cells;
    for (let gx = 0; gx < cells; gx++) {
      for (let gz = 0; gz < cells; gz++) {
        const x = -S + (gx + 0.5) * cs + rng.float(-0.4, 0.4);
        const z = -S + (gz + 0.5) * cs + rng.float(-0.4, 0.4);
        if (fold && Math.abs(x) < 2) continue;
        const part = fold && x > 0 ? partB : -1;
        const ci = rng.int(PALETTE.length);
        if (rng.chance(0.85)) addBuilding(frame, x, 0, z, false, rng.float(2, 3.6), rng.float(3, 11), rng.float(2, 3.6), part, ci);
        if (rng.chance(0.75)) addBuilding(frame, x, -T, z, true, rng.float(2, 3.4), rng.float(3, 9), rng.float(2, 3.4), part, ci + 2);
      }
    }
  };

  const clusterN = Math.round(6 + 5 * p);
  const foldCount = Math.max(2, Math.round(2 + 2 * p));
  for (let i = 0; i < clusterN; i++) {
    const ang = (i / clusterN) * TAU + rng.float(-0.25, 0.25);
    const d = dmin + rng.float(0, radius * 0.9) + (i % 2) * 8;
    const pos = new THREE.Vector3(center.x + Math.cos(ang) * d, center.y + rng.float(-8, 16), center.z + Math.sin(ang) * d);
    const kind = i % 3 === 1 ? 'wall' : 'ground';
    buildCluster(kind, pos, i % 3 === 0 && i / 3 < foldCount);
  }
  // Tief unter dem Brett: umgedrehte Unterstadt
  const belowN = Math.round(2 + 2 * p);
  for (let i = 0; i < belowN; i++) {
    const ang = rng.float(0, TAU);
    const d = rng.float(0.2, 1.5) * radius;
    const pos = new THREE.Vector3(center.x + Math.cos(ang) * d, minY - rng.float(24, 34), center.z + Math.sin(ang) * d);
    buildCluster('below', pos, i === 0);
  }
  // Ferne Skyline (Silhouetten im Dunst)
  const skyN = Math.round(24 + 24 * p);
  for (let i = 0; i < skyN; i++) {
    const ang = (i / skyN) * TAU + rng.float(-0.05, 0.05);
    const d = rng.float(150, 200);
    const w = rng.float(10, 22);
    const h = rng.float(-10, 30);
    mA.makeTranslation(center.x + Math.cos(ang) * d, center.y - 60, center.z + Math.sin(ang) * d);
    mA.multiply(mB.makeRotationY(rng.float(0, TAU)));
    if (rng.chance(0.25)) mA.multiply(mB.makeRotationZ(rng.float(-0.35, 0.35)));
    mA.multiply(mB.makeScale(w, h + 60, w * rng.float(0.7, 1.2)));
    staticBlocks.push({ m: mA.clone(), color: rng.pick([0x2a1c48, 0x33225a, 0x3a2a66]) });
  }

  const bGeo = baseBox();
  const blocksStatic = makeInstanced(bGeo, toon(0xffffff), staticBlocks);
  const blocksDyn = makeInstanced(bGeo, toon(0xffffff), dynBlocks);
  const wGeo = new THREE.BoxGeometry(1, 1, 1);
  const winMat = glow(0xffffff);
  const winStatic = makeInstanced(wGeo, winMat, staticWin);
  const winDyn = makeInstanced(wGeo, winMat, dynWin);
  group.add(blocksStatic, blocksDyn, winStatic, winDyn);
  meshes.push(blocksStatic, blocksDyn, winStatic, winDyn);

  // ------------------------------------------------------------------ Treppen
  const stairItems: Item[] = [];
  const loops: { cx: number; cy: number; cz: number; L: number; n: number; rise: number; yaw: number }[] = [];
  const stepGeo = baseBox();
  const stepAt = (x: number, y: number, z: number, yaw: number, len: number, hgt: number, wid: number, color: number): void => {
    mA.makeTranslation(x, y, z).multiply(mB.makeRotationY(yaw)).multiply(mB.makeScale(len, hgt, wid));
    stairItems.push({ m: mA.clone(), color });
  };
  const loopCount = p > 0.5 ? 2 : 1;
  for (let l = 0; l < loopCount; l++) {
    const ang = rng.float(0, TAU) + l * Math.PI;
    const d = dmin + radius * 0.9 + 14 + l * 8;
    const loop = { cx: center.x + Math.cos(ang) * d, cy: center.y + rng.float(-4, 8), cz: center.z + Math.sin(ang) * d, L: 11, n: 9, rise: 0.32, yaw: rng.float(0, TAU) };
    loops.push(loop);
    const total = 4 * loop.n;
    const h = loop.L / 2;
    for (let i = 0; i < total; i++) {
      const pt = loopPoint(loop, i + 0.5, vA);
      const side = Math.floor(i / loop.n);
      stepAt(pt.x, pt.y - 0.35, pt.z, loop.yaw - side * (Math.PI / 2), loop.L / loop.n * 1.02, 0.45, 2.2, i % 2 === 0 ? 0xe0d8ff : 0xb4a8f0);
    }
    // Stützsäulen an den Ecken
    for (let s = 0; s < 4; s++) {
      const cx = s === 0 || s === 3 ? -h : h;
      const cz = s < 2 ? -h : h;
      const cyaw = loop.yaw;
      vB.set(cx, 0, cz).applyAxisAngle(Y_AXIS, cyaw);
      stepAt(loop.cx + vB.x, loop.cy - 14, loop.cz + vB.z, cyaw, 0.5, 14 + s * 2.2 * loop.rise * loop.n * 0.5, 0.5, 0x6a5aa8);
    }
  }
  // Endlose Wendeltreppe in den Himmel
  {
    const ang = rng.float(0, TAU);
    const d = dmin + radius * 0.5 + 24;
    const bx = center.x + Math.cos(ang) * d;
    const bz = center.z + Math.sin(ang) * d;
    const steps = Math.round(24 + 20 * p);
    for (let i = 0; i < steps; i++) {
      const a = i * 0.5;
      stepAt(bx + Math.cos(a) * 5, center.y - 6 + i * 0.7, bz + Math.sin(a) * 5, -a + Math.PI / 2, 3.4, 0.3, 1.5, i % 2 ? 0xffd0f0 : 0xd0c4ff);
    }
    stepAt(bx, center.y - 8, bz, 0, 0.8, steps * 0.7 + 4, 0.8, 0x7a6ab8);
  }
  const stairs = makeInstanced(stepGeo, toon(0xffffff), stairItems);
  group.add(stairs);
  meshes.push(stairs);

  // Wanderer auf den Treppen
  const walkerN = loops.length * 2;
  const walkers = new THREE.InstancedMesh(new THREE.SphereGeometry(0.42, 8, 6), glow(0xffffff), Math.max(1, walkerN));
  walkers.count = walkerN;
  walkers.frustumCulled = false;
  for (let i = 0; i < walkerN; i++) walkers.setColorAt(i, col.setHex(NEON[i % NEON.length]!));
  if (walkers.instanceColor) walkers.instanceColor.needsUpdate = true;
  group.add(walkers);
  meshes.push(walkers);

  // ------------------------------------------------------------------ Zahnräder
  const gearGeo = gearGeometry(14);
  const gears: { x: number; y: number; z: number; yaw: number; s: number; dir: number; speed: number; phase: number }[] = [];
  const gearPairs = Math.round(2 + 2 * p);
  for (let i = 0; i < gearPairs; i++) {
    const ang = (i / gearPairs) * TAU + rng.float(0.2, 0.9);
    const d = dmin + radius * rng.float(0.5, 1.2) + 10;
    const s = rng.float(3.2, 5.5);
    const gx = center.x + Math.cos(ang) * d;
    const gz = center.z + Math.sin(ang) * d;
    const gy = center.y + rng.float(-6, 14);
    const yaw = Math.atan2(center.x - gx, center.z - gz);
    const sp = rng.float(0.25, 0.45);
    gears.push({ x: gx, y: gy, z: gz, yaw, s, dir: 1, speed: sp, phase: 0 });
    // Nachbar rechts davon (lokale X-Achse)
    const off = s * 1.84;
    gears.push({ x: gx + Math.cos(yaw) * off, y: gy, z: gz - Math.sin(yaw) * off, yaw, s, dir: -1, speed: sp, phase: Math.PI / 14 });
  }
  const gearMesh = new THREE.InstancedMesh(gearGeo, toon(0xffffff), gears.length);
  gearMesh.frustumCulled = false;
  gears.forEach((_, i) => gearMesh.setColorAt(i, col.setHex(i % 4 < 2 ? 0xd9a04a : 0x4fb8c8)));
  if (gearMesh.instanceColor) gearMesh.instanceColor.needsUpdate = true;
  group.add(gearMesh);
  meshes.push(gearMesh);

  // ------------------------------------------------------------------ Unmögliche Dreiecke (Balken)
  interface Tri { x: number; y: number; z: number; r: number; spin: number; tilt: number }
  const tris: Tri[] = [];
  const triN = p > 0.5 ? 2 : 1;
  for (let i = 0; i < triN; i++) {
    const ang = rng.float(0, TAU);
    const d = dmin + radius * rng.float(1.0, 1.6) + 18;
    tris.push({ x: center.x + Math.cos(ang) * d, y: center.y + rng.float(10, 26), z: center.z + Math.sin(ang) * d, r: rng.float(5, 7), spin: rng.float(0.1, 0.2) * (i ? -1 : 1), tilt: rng.float(-0.35, 0.35) });
  }
  const beamLocal: THREE.Matrix4[] = [];
  const beamLen: number[] = [];
  const beams = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), toon(0xffffff), tris.length * 3);
  beams.frustumCulled = false;
  tris.forEach((tr, ti) => {
    for (let k = 0; k < 3; k++) {
      const a0 = (k / 3) * TAU + Math.PI / 2;
      const a1 = ((k + 1) / 3) * TAU + Math.PI / 2;
      vA.set(Math.cos(a0) * tr.r, Math.sin(a0) * tr.r, 0);
      vB.set(Math.cos(a1) * tr.r, Math.sin(a1) * tr.r, 0);
      vC.subVectors(vB, vA);
      const len = vC.length() + 1.4;
      mA.makeTranslation((vA.x + vB.x) / 2, (vA.y + vB.y) / 2, k * 0.55 - 0.55).multiply(mB.makeRotationZ(Math.atan2(vC.y, vC.x))).multiply(mB.makeScale(len, 1.2, 1.2));
      beamLocal.push(mA.clone());
      beamLen.push(len);
      beams.setColorAt(ti * 3 + k, col.setHex([0xff7ac8, 0x6ae0ff, 0xffd84a][k]!));
    }
  });
  if (beams.instanceColor) beams.instanceColor.needsUpdate = true;
  group.add(beams);
  meshes.push(beams);

  // ------------------------------------------------------------------ Neon-Zeichen
  interface Sign { x: number; y: number; z: number; yaw: number; s: number; ph: number }
  const signs: Sign[] = [];
  const signN = Math.round(8 + 8 * p);
  const ringL: { m: THREE.Matrix4; sign: number; color: number }[] = [];
  const barL: typeof ringL = [];
  const coneL: typeof ringL = [];
  for (let i = 0; i < signN; i++) {
    const ang = rng.float(0, TAU);
    const d = dmin + rng.float(2, radius * 1.1) + 6;
    const x = center.x + Math.cos(ang) * d;
    const z = center.z + Math.sin(ang) * d;
    signs.push({ x, y: center.y + rng.float(-10, 22), z, yaw: Math.atan2(center.x - x, center.z - z), s: rng.float(1.4, 2.6), ph: rng.float(0, TAU) });
    const color = NEON[i % NEON.length]!;
    const t = i % 3;
    if (t === 0) {
      ringL.push({ m: new THREE.Matrix4(), sign: i, color });
      barL.push({ m: new THREE.Matrix4().makeTranslation(0, -1.5, 0).multiply(mB.makeScale(2.4, 0.18, 0.18)), sign: i, color });
    } else if (t === 1) {
      coneL.push({ m: new THREE.Matrix4().makeTranslation(-0.8, 0, 0), sign: i, color });
      coneL.push({ m: new THREE.Matrix4().makeTranslation(0.8, 0, 0).multiply(mB.makeRotationZ(Math.PI)), sign: i, color });
      barL.push({ m: new THREE.Matrix4().makeScale(2.4, 0.18, 0.18), sign: i, color });
    } else {
      for (let k = -1; k <= 1; k++) barL.push({ m: new THREE.Matrix4().makeTranslation(0, k * 0.7, 0).multiply(mB.makeScale(2.6 - Math.abs(k) * 0.6, 0.2, 0.2)), sign: i, color });
      ringL.push({ m: new THREE.Matrix4().makeTranslation(0, 1.9, 0).multiply(mB.makeScale(0.35, 0.35, 0.35)), sign: i, color });
    }
  }
  const mkNeon = (geo: THREE.BufferGeometry, list: typeof ringL): THREE.InstancedMesh => {
    const m = new THREE.InstancedMesh(geo, glow(0xffffff), Math.max(1, list.length));
    m.count = list.length;
    m.frustumCulled = false;
    list.forEach((it, i) => m.setColorAt(i, col.setHex(it.color)));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    group.add(m);
    meshes.push(m);
    return m;
  };
  const ringMesh = mkNeon(new THREE.TorusGeometry(1, 0.1, 6, 24), ringL);
  const barMesh = mkNeon(new THREE.BoxGeometry(1, 1, 1), barL);
  const coneMesh = mkNeon(new THREE.ConeGeometry(0.55, 1.2, 4), coneL);

  // ------------------------------------------------------------------ Schwebende Laternen
  interface Lamp { x: number; y: number; z: number; flip: boolean; ph: number; tilt: number }
  const lamps: Lamp[] = [];
  const arcs = Math.round(3 + 2 * p);
  for (let a = 0; a < arcs; a++) {
    const a0 = rng.float(0, TAU);
    const d = dmin + rng.float(2, radius * 0.9) + 4;
    const y0 = center.y + rng.float(-6, 12);
    const span = rng.float(0.5, 0.9);
    const cnt = 5;
    for (let k = 0; k < cnt; k++) {
      const an = a0 + (k / (cnt - 1)) * span;
      lamps.push({ x: center.x + Math.cos(an) * d, y: y0 + Math.sin(k * 0.9) * 1.5, z: center.z + Math.sin(an) * d, flip: rng.chance(0.35), ph: rng.float(0, TAU), tilt: rng.float(-0.25, 0.25) });
    }
  }
  const poleMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.1, 0.16, 3.4, 6).translate(0, 1.7, 0), toon(0x3a2a5a), lamps.length);
  const bulbMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.42, 10, 8), glow(0xffffff), lamps.length);
  const haloMat = glow(0xffe8a0, 0.2);
  haloMat.depthWrite = false;
  const haloMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), haloMat, lamps.length);
  for (const m of [poleMesh, bulbMesh, haloMesh]) {
    m.frustumCulled = false;
    group.add(m);
    meshes.push(m);
  }
  lamps.forEach((_, i) => bulbMesh.setColorAt(i, col.setHex(i % 3 === 0 ? 0xffb0e0 : 0xffe48a)));
  if (bulbMesh.instanceColor) bulbMesh.instanceColor.needsUpdate = true;

  // ------------------------------------------------------------------ Lichtbahnen
  const SEG = 9;
  const lanes: { R: number; cy: number; m: THREE.Matrix4; p: number }[] = [];
  const laneN = Math.round(3 + 3 * p);
  for (let i = 0; i < laneN; i++) {
    const R = radius * 1.35 + 22 + i * 7;
    const m = new THREE.Matrix4().makeTranslation(center.x, center.y + rng.float(-3, 18), center.z);
    m.multiply(mB.makeRotationY(rng.float(0, TAU))).multiply(mB.makeRotationX(rng.float(-0.35, 0.35))).multiply(mB.makeRotationZ(rng.float(-0.35, 0.35)));
    lanes.push({ R, cy: 0, m, p: rng.pick([3, 4, 6]) });
  }
  const cars: { lane: number; u: number; speed: number }[] = [];
  const carN = Math.round(8 + 6 * p);
  for (let i = 0; i < carN; i++) cars.push({ lane: i % laneN, u: rng.float(0, 1), speed: rng.float(0.012, 0.03) * (rng.chance(0.5) ? 1 : -1) });
  const trailMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), glow(0xffffff), carN * SEG);
  trailMesh.frustumCulled = false;
  for (let i = 0; i < carN; i++) for (let s = 0; s < SEG; s++) trailMesh.setColorAt(i * SEG + s, col.setHex(NEON[(i * 2) % NEON.length]!));
  if (trailMesh.instanceColor) trailMesh.instanceColor.needsUpdate = true;
  group.add(trailMesh);
  meshes.push(trailMesh);

  // ------------------------------------------------------------------ Himmel: Monde und Sterne
  const mdist = 240;
  const moonDefs = [
    { az: rng.float(0, TAU), el: 0.38, r: 26, color: 0xfff0d8, ring: false },
    { az: 0, el: 0.2, r: 13, color: 0xb8d4ff, ring: true },
  ];
  moonDefs[1]!.az = moonDefs[0]!.az + rng.float(1.6, 2.4);
  const craterItems: Item[] = [];
  const moonBasic = (c: number, opacity = 1): THREE.MeshBasicMaterial => {
    const m = new THREE.MeshBasicMaterial({ color: c, fog: false, transparent: opacity < 1, opacity });
    if (opacity < 1) m.depthWrite = false;
    return m;
  };
  for (const md of moonDefs) {
    const dir = new THREE.Vector3(Math.cos(md.az) * Math.cos(md.el), Math.sin(md.el), Math.sin(md.az) * Math.cos(md.el));
    const mp = new THREE.Vector3(center.x, center.y, center.z).addScaledVector(dir, mdist);
    const moon = new THREE.Mesh(new THREE.SphereGeometry(md.r, 20, 14), moonBasic(md.color));
    moon.position.copy(mp);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(md.r * 1.3, 16, 10), moonBasic(md.color, 0.14));
    halo.position.copy(mp);
    halo.renderOrder = -5;
    moon.renderOrder = -6;
    group.add(moon, halo);
    if (md.ring) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(md.r * 1.7, md.r * 0.07, 6, 48), moonBasic(0xffc4ec));
      ring.position.copy(mp);
      ring.rotation.set(1.1, 0.2, 0.5);
      ring.renderOrder = -6;
      group.add(ring);
    }
    // Krater auf der zugewandten Seite
    for (let i = 0; i < 5; i++) {
      vA.copy(dir).multiplyScalar(-1);
      vB.set(rng.float(-0.6, 0.6), rng.float(-0.6, 0.6), rng.float(-0.6, 0.6));
      vA.add(vB).normalize();
      const cr = md.r * rng.float(0.1, 0.22);
      qA.setFromUnitVectors(Z_AXIS, vA);
      vC.copy(mp).addScaledVector(vA, md.r * 1.004);
      mA.compose(vC, qA, vS.set(cr, cr, cr));
      craterItems.push({ m: mA.clone(), color: md.ring ? 0x8aa8e0 : 0xe0c8a8 });
    }
  }
  const craterMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  const craters = makeInstanced(new THREE.CircleGeometry(1, 10), craterMat, craterItems);
  craters.renderOrder = -4;
  group.add(craters);
  meshes.push(craters);

  const starN = Math.round(160 + 240 * p);
  const starPos = new Float32Array(starN * 3);
  for (let i = 0; i < starN; i++) {
    const az = rng.float(0, TAU);
    const el = Math.acos(rng.float(0.05, 1)) ;
    const y = Math.cos(el);
    starPos[i * 3] = center.x + Math.cos(az) * Math.sin(el) * 330;
    starPos[i * 3 + 1] = center.y + y * 330 - 20;
    starPos[i * 3 + 2] = center.z + Math.sin(az) * Math.sin(el) * 330;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xfff4d8, size: 2.4, sizeAttenuation: false, fog: false, depthWrite: false }));
  stars.frustumCulled = false;
  stars.renderOrder = -8;
  group.add(stars);

  // ------------------------------------------------------------------ Animation
  const partM = new THREE.Matrix4();

  function loopPoint(loop: { cx: number; cy: number; cz: number; L: number; n: number; rise: number; yaw: number }, s: number, out: THREE.Vector3): THREE.Vector3 {
    const total = 4 * loop.n;
    const w = ((s % total) + total) % total;
    const side = Math.min(3, Math.floor(w / loop.n));
    const k = w - side * loop.n;
    const h = loop.L / 2;
    const f = k / loop.n;
    let x: number;
    let z: number;
    if (side === 0) { x = -h + f * loop.L; z = -h; }
    else if (side === 1) { x = h; z = -h + f * loop.L; }
    else if (side === 2) { x = h - f * loop.L; z = h; }
    else { x = -h; z = h - f * loop.L; }
    const climb = 3 * loop.n * loop.rise;
    const y = w < 3 * loop.n ? w * loop.rise : climb * (1 - (w - 3 * loop.n) / loop.n);
    out.set(x, 0, z).applyAxisAngle(Y_AXIS, loop.yaw);
    out.x += loop.cx;
    out.z += loop.cz;
    out.y = loop.cy + y;
    return out;
  }
  // Plausibilität: Treppen-Schleifenpunkte werden oben mit loopPoint gebaut (Funktionsdeklaration ist gehoistet)

  function lanePos(lane: { R: number; m: THREE.Matrix4; p: number }, u: number, out: THREE.Vector3): THREE.Vector3 {
    const a = u * TAU;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const e = 2 / lane.p;
    out.set(Math.sign(c) * Math.pow(Math.abs(c), e) * lane.R, Math.sin(a * 3) * 1.2, Math.sign(s) * Math.pow(Math.abs(s), e) * lane.R);
    return out.applyMatrix4(lane.m);
  }

  function setScaled(mesh: THREE.InstancedMesh, i: number, m: THREE.Matrix4): void {
    mesh.setMatrixAt(i, m);
  }

  const vP = new THREE.Vector3();
  const vQ = new THREE.Vector3();

  function update(dt: number, t: number): void {
    void dt;
    // Faltende Stadtteile
    for (const pt of parts) pt.angle = pt.amp * (0.5 - 0.5 * Math.cos(t * pt.speed * TAU * 0.5 + pt.phase));
    for (let i = 0; i < dynBlocks.length; i++) {
      const it = dynBlocks[i]!;
      const pt = parts[it.part]!;
      partM.makeRotationZ(pt.angle);
      mC.multiplyMatrices(pt.frame, partM);
      mA.multiplyMatrices(mC, it.m);
      blocksDyn.setMatrixAt(i, mA);
    }
    for (let i = 0; i < dynWin.length; i++) {
      const it = dynWin[i]!;
      const pt = parts[it.part]!;
      partM.makeRotationZ(pt.angle);
      mC.multiplyMatrices(pt.frame, partM);
      mA.multiplyMatrices(mC, it.m);
      winDyn.setMatrixAt(i, mA);
    }
    blocksDyn.instanceMatrix.needsUpdate = true;
    winDyn.instanceMatrix.needsUpdate = true;

    // Wanderer
    for (let i = 0; i < walkerN; i++) {
      const loop = loops[i % loops.length]!;
      loopPoint(loop, t * 1.6 * (i < loops.length ? 1 : 0.7) + i * 7.3, vP);
      vP.y += 0.7;
      mA.makeTranslation(vP.x, vP.y, vP.z);
      walkers.setMatrixAt(i, mA);
    }
    walkers.instanceMatrix.needsUpdate = true;

    // Zahnräder
    for (let i = 0; i < gears.length; i++) {
      const g = gears[i]!;
      qA.setFromAxisAngle(Y_AXIS, g.yaw);
      mA.compose(vP.set(g.x, g.y, g.z), qA, vS.set(g.s, g.s, g.s));
      mB.makeRotationZ(g.dir * t * g.speed + g.phase);
      mA.multiply(mB);
      gearMesh.setMatrixAt(i, mA);
    }
    gearMesh.instanceMatrix.needsUpdate = true;

    // Dreiecke aus Balken
    for (let ti = 0; ti < tris.length; ti++) {
      const tr = tris[ti]!;
      mC.makeTranslation(tr.x, tr.y, tr.z).multiply(mA.makeRotationY(t * tr.spin)).multiply(mA.makeRotationX(tr.tilt));
      for (let k = 0; k < 3; k++) {
        mB.multiplyMatrices(mC, beamLocal[ti * 3 + k]!);
        beams.setMatrixAt(ti * 3 + k, mB);
      }
    }
    beams.instanceMatrix.needsUpdate = true;

    // Neon-Zeichen (pulsieren leicht)
    const signM = (si: number): THREE.Matrix4 => {
      const sg = signs[si]!;
      const pulse = sg.s * (1 + 0.07 * Math.sin(t * 2.2 + sg.ph));
      qA.setFromAxisAngle(Y_AXIS, sg.yaw + Math.sin(t * 0.3 + sg.ph) * 0.15);
      return mC.compose(vP.set(sg.x, sg.y + Math.sin(t * 0.8 + sg.ph) * 0.6, sg.z), qA, vS.set(pulse, pulse, pulse));
    };
    for (let i = 0; i < ringL.length; i++) {
      mA.multiplyMatrices(signM(ringL[i]!.sign), ringL[i]!.m);
      ringMesh.setMatrixAt(i, mA);
    }
    for (let i = 0; i < barL.length; i++) {
      mA.multiplyMatrices(signM(barL[i]!.sign), barL[i]!.m);
      barMesh.setMatrixAt(i, mA);
    }
    for (let i = 0; i < coneL.length; i++) {
      mA.multiplyMatrices(signM(coneL[i]!.sign), coneL[i]!.m);
      coneMesh.setMatrixAt(i, mA);
    }
    ringMesh.instanceMatrix.needsUpdate = barMesh.instanceMatrix.needsUpdate = coneMesh.instanceMatrix.needsUpdate = true;

    // Laternen
    for (let i = 0; i < lamps.length; i++) {
      const l = lamps[i]!;
      const by = l.y + Math.sin(t * 0.9 + l.ph) * 0.5;
      mA.makeRotationZ(l.tilt + Math.sin(t * 0.7 + l.ph) * 0.06);
      if (l.flip) mA.multiply(mB.makeRotationX(Math.PI));
      mA.setPosition(l.x, by, l.z);
      poleMesh.setMatrixAt(i, mA);
      // Birne an der Spitze (lokal 0, 3.5, 0)
      vP.set(0, 3.55, 0).applyMatrix4(mA);
      mB.makeTranslation(vP.x, vP.y, vP.z);
      bulbMesh.setMatrixAt(i, mB);
      const hs = 1.5 + 0.2 * Math.sin(t * 2.5 + l.ph);
      mB.makeScale(hs, hs, hs).setPosition(vP.x, vP.y, vP.z);
      haloMesh.setMatrixAt(i, mB);
    }
    poleMesh.instanceMatrix.needsUpdate = bulbMesh.instanceMatrix.needsUpdate = haloMesh.instanceMatrix.needsUpdate = true;

    // Lichtbahnen
    const delta = 0.012;
    for (let c = 0; c < cars.length; c++) {
      const car = cars[c]!;
      const lane = lanes[car.lane]!;
      const dirSign = car.speed < 0 ? -1 : 1;
      const head = car.u + t * car.speed;
      lanePos(lane, head, vP);
      for (let s = 0; s < SEG; s++) {
        lanePos(lane, head - dirSign * (s + 1) * delta, vQ);
        vC.subVectors(vP, vQ);
        const len = vC.length();
        const k = 1 - s / SEG;
        const idx = c * SEG + s;
        if (len < 1e-4) {
          mA.makeScale(0.0001, 0.0001, 0.0001);
        } else {
          vC.multiplyScalar(1 / len);
          qA.setFromUnitVectors(X_AXIS, vC);
          vB.addVectors(vP, vQ).multiplyScalar(0.5);
          const th = 0.06 + 0.26 * k * k;
          mA.compose(vB, qA, vS.set(len * 1.05, th, th));
        }
        setScaled(trailMesh, idx, mA);
        vP.copy(vQ);
      }
    }
    trailMesh.instanceMatrix.needsUpdate = true;
  }

  update(0, 0);

  return {
    group,
    update,
    dispose() {
      for (const m of meshes) m.dispose();
      disposeTree(group);
    },
  };
};
