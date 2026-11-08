/** Palmen, Dschungelbäume, Büsche, Felsen und Gras – instanziert, mit Wind; liefert Kollisionen und Palmen-Standorte */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { height, ground, roadDist, landMask, POIS } from './island';
import { rng, fbm } from './noise';
import { T } from './textures';
import type { Colliders } from './collide';

const windUniform = { value: 0 };
export function setWind(t: number) {
  windUniform.value = t;
}
/** Wind im Vertex-Shader: Ausschlag wächst mit der Höhe im Objekt */
function addWind(mat: THREE.Material, amp: number, ref: number) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uWind = windUniform;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uWind;').replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
       float wh = max(0.0, transformed.y) / ${ref.toFixed(2)};
       #ifdef USE_INSTANCING
         float ph = instanceMatrix[3].x * 0.13 + instanceMatrix[3].z * 0.11;
       #else
         float ph = 0.0;
       #endif
       transformed.x += sin(uWind * 1.3 + ph) * ${amp.toFixed(3)} * wh * wh;
       transformed.z += cos(uWind * 1.1 + ph * 1.3) * ${(amp * 0.6).toFixed(3)} * wh * wh;`,
    );
  };
}

function palmGeometry(seed: number): { trunk: THREE.BufferGeometry; fronds: THREE.BufferGeometry; top: THREE.Vector3 } {
  const r = rng(seed),
    hgt = 7 + r() * 4,
    lean = 0.8 + r() * 1.8;
  const pts = [0, 0.33, 0.66, 1].map((t) => new THREE.Vector3(lean * t * t, hgt * t, 0));
  const curve = new THREE.CatmullRomCurve3(pts);
  const trunk = new THREE.TubeGeometry(curve, 12, 0.22, 8, false);
  const p = trunk.attributes.position as THREE.BufferAttribute,
    uv = trunk.attributes.uv as THREE.BufferAttribute;
  // verjüngen: Ringe um die Kurve skalieren
  for (let i = 0; i < p.count; i++) {
    const t = uv.getX(i),
      c = curve.getPoint(t),
      s = 1.35 - t * 0.55;
    p.setXYZ(i, c.x + (p.getX(i) - c.x) * s, p.getY(i), c.z + (p.getZ(i) - c.z) * s);
    uv.setXY(i, uv.getY(i), t * hgt * 0.6);
  }
  trunk.computeVertexNormals();
  const top = curve.getPoint(1);
  const parts: THREE.BufferGeometry[] = [];
  const n = 12 + Math.floor(r() * 4);
  for (let i = 0; i < n; i++) {
    const len = 3.6 + r() * 1.4,
      f = new THREE.PlaneGeometry(1.25, len, 1, 8);
    f.translate(0, len / 2, 0);
    f.rotateX(-Math.PI / 2); // liegt flach, zeigt nach +z
    const fp = f.attributes.position as THREE.BufferAttribute;
    const droop = 0.1 + r() * 0.06,
      up = 0.45 + r() * 0.35;
    for (let k = 0; k < fp.count; k++) {
      const z = fp.getZ(k),
        x = fp.getX(k);
      fp.setY(k, z * up - z * z * droop + Math.abs(x) * 0.25);
      fp.setX(k, x * (0.6 + 0.5 * Math.sin((z / len) * Math.PI)));
    }
    f.rotateY((i / n) * Math.PI * 2 + r() * 0.3);
    f.translate(top.x, top.y, top.z);
    parts.push(f);
  }
  const fronds = mergeGeometries(parts)!;
  fronds.computeVertexNormals();
  return { trunk, fronds, top };
}

/** Laubkrone aus gekreuzten Blattkarten (wirkt viel voller als Kugeln) */
function canopyGeometry(seed: number, radius: number, cards: number, y: number, flat = 0.7): THREE.BufferGeometry {
  const r = rng(seed),
    parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < cards; i++) {
    const s = radius * (0.7 + r() * 0.6),
      g = new THREE.PlaneGeometry(s, s);
    g.rotateY(r() * Math.PI);
    g.rotateX((r() - 0.5) * 1.2);
    const th = r() * Math.PI * 2,
      ph = Math.acos(r() * 2 - 1),
      d = radius * 0.75 * Math.cbrt(r());
    g.translate(Math.sin(ph) * Math.cos(th) * d, y + Math.cos(ph) * d * flat, Math.sin(ph) * Math.sin(th) * d);
    parts.push(g);
  }
  const m = mergeGeometries(parts)!;
  // Normalen nach außen (weiche Beleuchtung der Krone)
  const p = m.attributes.position as THREE.BufferAttribute,
    nn = m.attributes.normal as THREE.BufferAttribute,
    v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.set(p.getX(i), p.getY(i) - y, p.getZ(i)).normalize();
    nn.setXYZ(i, v.x, v.y * 0.7 + 0.3, v.z);
  }
  return m;
}

function rockGeometry(seed: number, detail: number): THREE.BufferGeometry {
  const g = new THREE.IcosahedronGeometry(1, detail),
    p = g.attributes.position as THREE.BufferAttribute,
    v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = fbm(v.x * 1.6 + seed, v.y * 1.6 + v.z * 1.3, 4);
    v.multiplyScalar(0.7 + n * 0.6);
    v.y *= 0.65;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

export interface FloraResult { group: THREE.Group; palms: THREE.Vector3[] }

/** Freiflächen für Häuser und Orte, die frei bleiben müssen */
const KEEP_OUT = [
  ...POIS.map((p) => ({ x: p.x, z: p.z, r: p.id === 'plaza' ? 30 : p.id === 'lagoon' ? 24 : 12 })),
  { x: 0, z: 140, r: 60 },
  { x: 34, z: 210, r: 22 },
  { x: -128, z: 164, r: 16 },
  { x: 70, z: -100, r: 18 },
  { x: -150, z: -146, r: 14 },
];
const free = (x: number, z: number, pad = 0) => roadDist(x, z) > 4 + pad && KEEP_OUT.every((k) => Math.hypot(x - k.x, z - k.z) > k.r + pad);

export function buildFlora(quality: number, col: Colliders): FloraResult {
  const group = new THREE.Group(),
    r = rng(4242),
    dummy = new THREE.Object3D();
  const shadows = quality > 0;
  // ---------- Palmen ----------
  const palmPos: THREE.Vector3[] = [];
  const want = [220, 360, 480][quality];
  for (let tries = 0; palmPos.length < want && tries < want * 40; tries++) {
    const x = (r() - 0.5) * 520,
      z = (r() - 0.5) * 520,
      m = landMask(x, z),
      h = height(x, z);
    if (h < 0.9 || h > 14 || m > 0.85 || !free(x, z)) continue;
    const g = ground(x, z, h);
    if (g === 'rock' || g === 'ash' || g === 'road') continue;
    if (g === 'grass' && r() > 0.35) continue;
    if (palmPos.some((p) => Math.abs(p.x - x) < 4 && Math.abs(p.z - z) < 4)) continue;
    palmPos.push(new THREE.Vector3(x, h - 0.2, z));
  }
  // Palmen am Marktplatz und am Strandhaus
  for (const [x, z] of [[-14, 136], [14, 136], [-14, 164], [14, 164], [-138, 172], [-118, 174], [-136, 158], [120, 186], [136, 172]] as [number, number][])
    palmPos.push(new THREE.Vector3(x, height(x, z) - 0.2, z));
  const variants = [0, 1, 2].map((i) => palmGeometry(100 + i));
  const barkMat = new THREE.MeshStandardMaterial({ map: T.bark(), roughness: 0.9 });
  const frondMat = new THREE.MeshStandardMaterial({ map: T.frond(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.7 });
  addWind(frondMat, 0.35, 10);
  addWind(barkMat, 0.12, 10);
  variants.forEach((v, vi) => {
    const list = palmPos.filter((_, i) => i % 3 === vi);
    const tm = new THREE.InstancedMesh(v.trunk, barkMat, list.length),
      fm = new THREE.InstancedMesh(v.fronds, frondMat, list.length);
    list.forEach((p, i) => {
      dummy.position.copy(p);
      dummy.rotation.set(0, (p.x * 13.7 + p.z) % (Math.PI * 2), 0);
      dummy.scale.setScalar(0.85 + ((p.x * 7.1) % 1 + 1) % 1 * 0.35);
      dummy.updateMatrix();
      tm.setMatrixAt(i, dummy.matrix);
      fm.setMatrixAt(i, dummy.matrix);
      col.circle(p.x, p.z, 0.35);
    });
    tm.castShadow = fm.castShadow = shadows;
    tm.receiveShadow = true;
    group.add(tm, fm);
  });

  // ---------- Dschungelbäume ----------
  const trees: THREE.Vector3[] = [];
  const wantT = [160, 280, 380][quality];
  for (let tries = 0; trees.length < wantT && tries < wantT * 40; tries++) {
    const x = (r() - 0.5) * 480,
      z = (r() - 0.5) * 480,
      h = height(x, z);
    if (h < 3 || !free(x, z, 2)) continue;
    const g = ground(x, z, h);
    if (g !== 'jungle' && !(g === 'grass' && r() < 0.12)) continue;
    if (trees.some((p) => Math.abs(p.x - x) < 6 && Math.abs(p.z - z) < 6)) continue;
    trees.push(new THREE.Vector3(x, h - 0.3, z));
  }
  const trunkG = new THREE.CylinderGeometry(0.22, 0.42, 8, 7, 3);
  trunkG.translate(0, 4, 0);
  const tTrunk = new THREE.InstancedMesh(trunkG, new THREE.MeshStandardMaterial({ color: 0x5a4a3a, map: T.bark(), roughness: 0.95 }), trees.length);
  const leafMat = new THREE.MeshStandardMaterial({ map: T.leaves(108), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8 });
  addWind(leafMat, 0.25, 11);
  const crownA = canopyGeometry(7, 3.6, [22, 34, 44][quality], 8.4),
    crownB = canopyGeometry(9, 3, [18, 28, 36][quality], 7.2, 0.9);
  const cA = new THREE.InstancedMesh(crownA, leafMat, Math.ceil(trees.length / 2)),
    cB = new THREE.InstancedMesh(crownB, leafMat, Math.floor(trees.length / 2));
  let ia = 0,
    ib = 0;
  trees.forEach((p, i) => {
    dummy.position.copy(p);
    dummy.rotation.set(0, r() * 6.28, 0);
    dummy.scale.setScalar(0.8 + r() * 0.5);
    dummy.updateMatrix();
    tTrunk.setMatrixAt(i, dummy.matrix);
    if (i % 2 === 0) cA.setMatrixAt(ia++, dummy.matrix);
    else cB.setMatrixAt(ib++, dummy.matrix);
    col.circle(p.x, p.z, 0.5);
  });
  tTrunk.castShadow = cA.castShadow = cB.castShadow = shadows;
  group.add(tTrunk, cA, cB);

  // ---------- Büsche ----------
  const bushG = canopyGeometry(13, 1.4, [8, 12, 14][quality], 0.8, 0.6);
  const bushMat = new THREE.MeshStandardMaterial({ map: T.leaves(95), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.85 });
  addWind(bushMat, 0.12, 2);
  const nb = [260, 520, 800][quality];
  const bush = new THREE.InstancedMesh(bushG, bushMat, nb);
  let bi = 0;
  for (let tries = 0; bi < nb && tries < nb * 30; tries++) {
    const x = (r() - 0.5) * 500,
      z = (r() - 0.5) * 500,
      h = height(x, z);
    if (h < 1.6 || !free(x, z, -2)) continue;
    const g = ground(x, z, h);
    if (g === 'ash' || g === 'road' || g === 'sand') continue;
    dummy.position.set(x, h - 0.1, z);
    dummy.rotation.set(0, r() * 6.28, 0);
    dummy.scale.setScalar(0.7 + r() * 0.9);
    dummy.updateMatrix();
    bush.setMatrixAt(bi++, dummy.matrix);
  }
  bush.count = bi;
  bush.castShadow = shadows;
  group.add(bush);

  // ---------- Felsen ----------
  const rockMat = new THREE.MeshStandardMaterial({ map: T.rock(), roughness: 0.92 });
  const rocks = [rockGeometry(1, quality + 1), rockGeometry(2, quality + 1)].map((g) => new THREE.InstancedMesh(g, rockMat, 90));
  const rc = [0, 0];
  for (let tries = 0; rc[0] + rc[1] < 170 && tries < 6000; tries++) {
    const x = (r() - 0.5) * 520,
      z = (r() - 0.5) * 520,
      h = height(x, z);
    if (h < -2 || !free(x, z)) continue;
    const g = ground(x, z, h);
    const s = g === 'rock' || g === 'ash' ? 1 + r() * 3 : h < 2 ? 0.5 + r() * 1.6 : r() < 0.3 ? 0.6 + r() * 1.5 : 0;
    if (!s) continue;
    const vi = rc[0] < 90 ? (rc[1] < 90 ? (r() < 0.5 ? 0 : 1) : 0) : 1;
    if (rc[vi] >= 90) continue;
    dummy.position.set(x, h - s * 0.2, z);
    dummy.rotation.set(r() * 0.4, r() * 6.28, r() * 0.4);
    dummy.scale.set(s * (0.8 + r() * 0.5), s, s * (0.8 + r() * 0.5));
    dummy.updateMatrix();
    rocks[vi].setMatrixAt(rc[vi]++, dummy.matrix);
    if (s > 1.1) col.circle(x, z, s * 0.85);
  }
  rocks.forEach((m, i) => {
    m.count = rc[i];
    m.castShadow = shadows;
    m.receiveShadow = true;
    group.add(m);
  });

  // ---------- Gras ----------
  const ng = [0, 3500, 8000][quality];
  if (ng) {
    const a = new THREE.PlaneGeometry(0.9, 0.7);
    a.translate(0, 0.35, 0);
    const b = a.clone().rotateY(Math.PI / 2);
    const tuft = mergeGeometries([a, b])!;
    tuft.computeVertexNormals();
    const nn = tuft.attributes.normal as THREE.BufferAttribute;
    for (let i = 0; i < nn.count; i++) nn.setXYZ(i, 0, 1, 0);
    const gm = new THREE.MeshStandardMaterial({ map: T.tuft(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9 });
    addWind(gm, 0.12, 0.7);
    const grass = new THREE.InstancedMesh(tuft, gm, ng);
    let gi = 0;
    for (let tries = 0; gi < ng && tries < ng * 12; tries++) {
      const x = (r() - 0.5) * 480,
        z = (r() - 0.5) * 480,
        h = height(x, z);
      if (h < 2.4 || roadDist(x, z) < 2.8 || Math.hypot(x, z - 150) < 19) continue;
      const g = ground(x, z, h);
      if (g !== 'grass' && g !== 'jungle') continue;
      dummy.position.set(x, h - 0.05, z);
      dummy.rotation.set(0, r() * 6.28, 0);
      dummy.scale.setScalar(0.7 + r() * 0.8);
      dummy.updateMatrix();
      grass.setMatrixAt(gi++, dummy.matrix);
    }
    grass.count = gi;
    group.add(grass);
  }
  return { group, palms: palmPos };
}
