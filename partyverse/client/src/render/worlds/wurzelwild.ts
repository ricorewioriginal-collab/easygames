import * as THREE from 'three';
import { disposeTree, glow, toon } from '../materials';
import type { Decor, DecorFactory } from './common';
import { InstBuilder, beetleGeo, leafGeo, mushroomGeo, ownToon, wingGeo } from './wurzelwild-parts';

/**
 * WURZELWILD: märchenhafter Riesenurwald. Alles liegt außerhalb des Spielbereichs
 * (Stämme, Äste, Blätter, Inseln, Tiere: mindestens ~1,2 x Radius vom Mittelpunkt) oder weit darunter (Wolkenmeer).
 * Rund 25 Draw Calls, alles instanziert.
 */

interface Island {
  base: THREE.Vector3;
  ph: number;
  off: number;
  r: number;
  parts: Part[];
}
interface Part {
  b: InstBuilder;
  idx: number;
  lp: THREE.Vector3;
  q: THREE.Quaternion;
  s: THREE.Vector3;
}
interface LeafRec {
  idx: number;
  isl: Island | null;
  p: THREE.Vector3;
  yaw: number;
  pitch: number;
  sc: number;
  ph: number;
}
interface Limb {
  start: THREE.Vector3;
  dir: THREE.Vector3;
  len: number;
  rad: number;
  ang: number;
}

const TAU = Math.PI * 2;
const UP = new THREE.Vector3(0, 1, 0);
const clamp = (v: number, a: number, b: number): number => Math.min(b, Math.max(a, v));

export const createDecor: DecorFactory = (ctx) => {
  const { rng, center: c, radius: R } = ctx;
  const q01 = clamp(ctx.quality.particles, 0, 1);
  const S = clamp(R / 22, 0.6, 1.5);
  const inner = R * 1.2 + 10 * S;
  const yCloud = c.y - R * 1.25 - 22;

  const group = new THREE.Group();
  const meshes: THREE.InstancedMesh[] = [];

  const P = new THREE.Vector3();
  const Q = new THREE.Quaternion();
  const Sc = new THREE.Vector3();
  const ID = new THREE.Quaternion();
  const ONE = new THREE.Vector3(1, 1, 1);
  const M = new THREE.Matrix4();
  const E = new THREE.Euler();
  const qa = new THREE.Quaternion();
  const qb = new THREE.Quaternion();
  const AX = new THREE.Vector3(1, 0, 0);
  const AY = new THREE.Vector3(0, 1, 0);
  const pPrev = new THREE.Vector3();
  const pCur = new THREE.Vector3();
  const dirV = new THREE.Vector3();

  const pick = (list: readonly number[]): number => list[rng.int(list.length)]!;

  /* ------------------------------------------------------------------ Stämme, Rinde, Moos */
  const trunkB = new InstBuilder();
  const ridgeB = new InstBuilder();
  const mossB = new InstBuilder();
  const limbB = new InstBuilder();
  const rootB = new InstBuilder();
  const limbs: Limb[] = [];
  const yBot = yCloud - 25;
  const yTop = c.y + 150;
  const tH = yTop - yBot;
  const nT = 9;
  const barkCols = [0x6b4a2e, 0x7a5636, 0x5e4129, 0x80603a];
  for (let i = 0; i < nT; i++) {
    const a = ((i + rng.float(-0.25, 0.25)) / nT) * TAU;
    const rt = S * rng.float(3.6, 6.6);
    const d = inner + rt + rng.float(0, R * 0.9 + 10);
    const tx = c.x + Math.cos(a) * d;
    const tz = c.z + Math.sin(a) * d;
    const col = pick(barkCols);
    trunkB.add(P.set(tx, yBot + tH / 2, tz), ID, Sc.set(rt, tH, rt), col);
    const rAt = (y: number): number => rt * (1 - 0.2 * ((y - yBot) / tH));
    // Rindenwülste
    for (let k = 0; k < 11; k++) {
      const ph = rng.next() * TAU;
      const y = rng.float(yCloud - 4, c.y + 70);
      const h = rng.float(7, 20);
      const w = rt * rng.float(0.1, 0.17);
      const rr = rAt(y) * 0.97;
      ridgeB.add(P.set(tx + Math.cos(ph) * rr, y, tz + Math.sin(ph) * rr), ID, Sc.set(w, h, w), 0x4a3322);
    }
    // Moospolster
    for (let k = 0; k < 8; k++) {
      const ph = rng.next() * TAU;
      const y = rng.float(yCloud + 2, c.y + 60);
      const rr = rAt(y) * 0.98;
      dirV.set(Math.cos(ph), 0.25, Math.sin(ph)).normalize();
      Q.setFromUnitVectors(UP, dirV);
      const w = rt * rng.float(0.35, 0.6);
      mossB.add(P.set(tx + Math.cos(ph) * rr, y, tz + Math.sin(ph) * rr), Q, Sc.set(w, w * 0.4, w), pick([0x4fa63e, 0x6cc04a, 0x3f8f3a]));
    }
    // Äste (tangential bzw. nach außen, entfernen sich also immer vom Brett)
    const nL = 2 + rng.int(2);
    for (let k = 0; k < nL; k++) {
      const y = c.y + rng.float(6, 55);
      const sgn = rng.chance(0.5) ? 1 : -1;
      const th = a + sgn * Math.PI * rng.float(0.3, 0.5);
      dirV.set(Math.cos(th), 0.16, Math.sin(th)).normalize();
      const len = S * rng.float(16, 30);
      const rad = rt * rng.float(0.32, 0.46);
      const start = new THREE.Vector3(tx + dirV.x * rt * 0.5, y, tz + dirV.z * rt * 0.5);
      limbs.push({ start, dir: dirV.clone(), len, rad, ang: th });
      Q.setFromUnitVectors(UP, dirV);
      P.copy(start).addScaledVector(dirV, len / 2);
      limbB.add(P, Q, Sc.set(rad, len, rad), col);
    }
    // Wurzelanläufe am Fuß (über dem Wolkenmeer)
    const nR = 6;
    for (let k = 0; k < nR; k++) {
      const ph = ((k + rng.float(-0.3, 0.3)) / nR) * TAU;
      dirV.set(Math.cos(ph) * 0.85, -0.5, Math.sin(ph) * 0.85).normalize();
      const len = S * rng.float(14, 27);
      const rad = rt * rng.float(0.28, 0.42);
      P.set(tx + Math.cos(ph) * rt * 0.75, yCloud + rng.float(0, 9), tz + Math.sin(ph) * rt * 0.75).addScaledVector(dirV, len / 2);
      Q.setFromUnitVectors(UP, dirV);
      rootB.add(P, Q, Sc.set(rad, len, rad), col);
    }
  }
  const trunkGeo = new THREE.CylinderGeometry(0.8, 1, 1, 10, 1, true);
  meshes.push(trunkB.build(trunkGeo, toon(0xffffff), group));
  meshes.push(ridgeB.build(new THREE.SphereGeometry(1, 6, 5), toon(0xffffff), group));
  meshes.push(mossB.build(new THREE.SphereGeometry(1, 8, 6), toon(0xffffff), group));
  const coneGeo = new THREE.ConeGeometry(1, 1, 8, 1, true);
  meshes.push(limbB.build(coneGeo, toon(0xffffff), group));
  meshes.push(rootB.build(coneGeo.clone(), toon(0xffffff), group));

  /* ------------------------------------------------------------------ Blätter */
  const leafB = new InstBuilder();
  const leaves: LeafRec[] = [];
  const leafCols = [0x3f9d3a, 0x5ccf4a, 0x2f8a4a, 0x8fd44e, 0x4cb860, 0xb4dc4a];
  const addLeaf = (p: THREE.Vector3, isl: Island | null, yaw: number, pitch: number, sc: number): void => {
    const idx = leafB.add(p, ID, Sc.setScalar(sc), pick(leafCols));
    leaves.push({ idx, isl, p: p.clone(), yaw, pitch, sc, ph: rng.next() * TAU });
  };
  const headingFor = (angle: number): number => Math.atan2(-Math.cos(angle), -Math.sin(angle));
  for (const l of limbs) {
    const n = 3 + rng.int(3);
    for (let k = 0; k < n; k++) {
      const u = rng.float(0.25, 1);
      P.copy(l.start).addScaledVector(l.dir, l.len * u);
      P.y -= l.rad * (1 - u) * 0.5;
      const sgn = rng.chance(0.5) ? 1 : -1;
      addLeaf(P, null, headingFor(l.ang + sgn * rng.float(0.6, 1.4)), -rng.float(0.15, 0.7), S * rng.float(7, 13));
    }
  }
  // Riesen-Ohrenblätter, die aus dem Wolkenmeer ragen
  for (let k = 0; k < 14; k++) {
    const a = rng.next() * TAU;
    const d = inner + rng.float(0, R * 1.7);
    P.set(c.x + Math.cos(a) * d, yCloud + rng.float(-1, 3), c.z + Math.sin(a) * d);
    addLeaf(P, null, headingFor(a + rng.float(-1.2, 1.2)), rng.float(0.9, 1.25), S * rng.float(10, 17));
  }

  /* ------------------------------------------------------------------ Schwebende Wurzelinseln + Pilze + Käfer */
  const islTopB = new InstBuilder();
  const islBodyB = new InstBuilder();
  const islRootB = new InstBuilder();
  const mushA = new InstBuilder();
  const mushB = new InstBuilder();
  const islands: Island[] = [];
  const nI = 6 + Math.round(2 * q01);
  const attach = (isl: Island, b: InstBuilder, lp: THREE.Vector3, q: THREE.Quaternion, s: THREE.Vector3, color: number): void => {
    const idx = b.add(P.copy(lp).add(isl.base), q, s, color);
    isl.parts.push({ b, idx, lp: lp.clone(), q: q.clone(), s: s.clone() });
  };
  const beetleHome: { isl: Island; idx: number; rr: number; sp: number; ph: number; sc: number }[] = [];
  const beetleB = new InstBuilder();
  const lp = new THREE.Vector3();
  for (let i = 0; i < nI; i++) {
    const a = ((i + rng.float(-0.3, 0.3)) / nI) * TAU;
    const ri = S * rng.float(2.8, 4.6);
    const d = inner + ri + rng.float(0, R * 0.8);
    const base = new THREE.Vector3(c.x + Math.cos(a) * d, c.y + rng.float(-12, 16) * Math.max(1, S * 0.9), c.z + Math.sin(a) * d);
    const isl: Island = { base, ph: rng.next() * TAU, off: 0, r: ri, parts: [] };
    islands.push(isl);
    attach(isl, islTopB, lp.set(0, 0, 0), ID, Sc.set(ri, 1, ri), pick([0x5fbf4a, 0x6fd04a, 0x4fae52]));
    const hb = ri * rng.float(1.6, 2.4);
    attach(isl, islBodyB, lp.set(0, -0.25 - hb / 2, 0), ID, Sc.set(ri * 0.95, hb, ri * 0.95), pick([0x7a5a38, 0x6b4a2e, 0x86623c]));
    const nr = 4 + rng.int(3);
    for (let k = 0; k < nr; k++) {
      const ph = rng.next() * TAU;
      const rho = ri * rng.float(0.15, 0.7);
      const f = rho / (ri * 0.95);
      const len = S * rng.float(3, 9);
      attach(isl, islRootB, lp.set(Math.cos(ph) * rho, -0.25 - hb + f * hb - len / 2, Math.sin(ph) * rho), ID, Sc.set(S, len, S), 0x6b4a2e);
    }
    const nm = 1 + rng.int(3);
    for (let k = 0; k < nm; k++) {
      const ph = rng.next() * TAU;
      const rho = ri * rng.float(0.2, 0.78);
      const sc = S * rng.float(1.1, 2.4);
      Q.setFromAxisAngle(AY, rng.next() * TAU);
      attach(isl, rng.chance(0.5) ? mushA : mushB, lp.set(Math.cos(ph) * rho, 0.2, Math.sin(ph) * rho), Q, Sc.set(sc * rng.float(0.9, 1.25), sc, sc * rng.float(0.9, 1.25)), pick([0xffffff, 0xfff0e0, 0xf0ffe0]));
    }
    // Setzlinge
    const ns = 2 + rng.int(2);
    for (let k = 0; k < ns; k++) {
      const ph = rng.next() * TAU;
      const rho = ri * rng.float(0.3, 0.8);
      P.set(base.x + Math.cos(ph) * rho, base.y + 0.2, base.z + Math.sin(ph) * rho);
      addLeaf(P, isl, headingFor(ph + rng.float(-0.8, 0.8)), rng.float(0.7, 1.1), S * rng.float(2.2, 4));
    }
    if (rng.chance(0.75)) {
      const idx = beetleB.add(P.set(0, 0, 0), ID, ONE, pick([0xffffff, 0xffd0a0, 0xffa8a8, 0xffe0c0]));
      beetleHome.push({ isl, idx, rr: ri * rng.float(0.45, 0.68), sp: rng.float(0.15, 0.3) * (rng.chance(0.5) ? 1 : -1), ph: rng.next() * TAU, sc: S * rng.float(0.8, 1.1) });
    }
  }
  // Riesenpilze im Wolkenmeer
  for (let k = 0; k < 9; k++) {
    const a = rng.next() * TAU;
    const d = inner + rng.float(0, R * 1.8);
    const sc = S * rng.float(4, 8);
    Q.setFromAxisAngle(AY, rng.next() * TAU);
    (k % 2 ? mushA : mushB).add(P.set(c.x + Math.cos(a) * d, yCloud + rng.float(-3, 1), c.z + Math.sin(a) * d), Q, Sc.set(sc, sc * rng.float(1, 1.6), sc), pick([0xffffff, 0xfff0e0, 0xf0ffe0]));
  }
  const cylGeo = new THREE.CylinderGeometry(1, 1, 0.5, 14);
  const bodyGeo = new THREE.ConeGeometry(1, 1, 10);
  bodyGeo.rotateX(Math.PI);
  const dangleGeo = new THREE.ConeGeometry(0.16, 1, 5);
  dangleGeo.rotateX(Math.PI);
  meshes.push(islTopB.build(cylGeo, toon(0xffffff), group));
  meshes.push(islBodyB.build(bodyGeo, toon(0xffffff), group));
  meshes.push(islRootB.build(dangleGeo, toon(0xffffff), group));
  const vcMat = ownToon(0xffffff, (m) => {
    m.vertexColors = true;
  });
  const vcMat2 = vcMat.clone();
  vcMat2.userData.shared = false;
  meshes.push(mushA.build(mushroomGeo(0xe84a4a, 0xfff4e0), vcMat, group));
  meshes.push(mushB.build(mushroomGeo(0xb06be8, 0xffe9a0), vcMat2, group));
  const beetleMat = vcMat.clone();
  beetleMat.userData.shared = false;
  const beetleGeometry = beetleGeo();
  meshes.push(beetleB.build(beetleGeometry, beetleMat, group));
  const leafMat = ownToon(0xffffff, (m) => {
    m.side = THREE.DoubleSide;
  });
  meshes.push(leafB.build(leafGeo(), leafMat, group));

  /* ------------------------------------------------------------------ Lianen mit Glockenblüten */
  const NSEG = 9;
  interface Liana {
    ax: number;
    ay: number;
    az: number;
    seg: number;
    amp: number;
    ph: number;
    sp: number;
    rad: number;
  }
  const lianas: Liana[] = [];
  const lianaB = new InstBuilder();
  const bellB = new InstBuilder();
  const budB = new InstBuilder();
  const nLi = 8 + Math.round(8 * q01);
  const lianaCols = [0x3f8f3a, 0x4fa63e, 0x2f7a3a];
  const bellCols = [0xff7ab8, 0xb77bff, 0xffa43a, 0x7ad8ff];
  for (let i = 0; i < nLi && limbs.length > 0; i++) {
    const l = limbs[rng.int(limbs.length)]!;
    const u = rng.float(0.35, 0.95);
    const anchor = new THREE.Vector3().copy(l.start).addScaledVector(l.dir, l.len * u);
    anchor.y -= l.rad * (1 - u) * 0.6;
    const len = S * rng.float(14, 32);
    lianas.push({ ax: anchor.x, ay: anchor.y, az: anchor.z, seg: len / NSEG, amp: S * rng.float(0.8, 1.7), ph: rng.next() * TAU, sp: rng.float(0.5, 0.9), rad: 0.3 * S });
    const col = pick(lianaCols);
    for (let k = 0; k < NSEG; k++) lianaB.add(P.copy(anchor), ID, ONE, col);
    bellB.add(P.copy(anchor), ID, ONE, pick(bellCols));
    budB.add(P.copy(anchor), ID, ONE, 0xfff2a0);
  }
  meshes.push(lianaB.build(new THREE.CylinderGeometry(1, 0.8, 1, 5, 1, true), toon(0xffffff), group));
  const bellMat = ownToon(0xffffff, (m) => {
    m.side = THREE.DoubleSide;
  });
  meshes.push(bellB.build(new THREE.ConeGeometry(0.75, 1.5, 8, 1, true), bellMat, group));
  meshes.push(budB.build(new THREE.SphereGeometry(0.28, 6, 5), glow(0xffffff), group));

  /* ------------------------------------------------------------------ Glühwürmchen */
  interface Fly {
    hx: number;
    hy: number;
    hz: number;
    amp: number;
    f1: number;
    f2: number;
    f3: number;
    p1: number;
    p2: number;
    p3: number;
    fb: number;
    pb: number;
    sz: number;
  }
  const flies: Fly[] = [];
  const flyB = new InstBuilder();
  const haloB = new InstBuilder();
  const nF = 12 + Math.round(70 * q01);
  for (let i = 0; i < nF; i++) {
    const amp = rng.float(0.8, 2.2);
    const a = rng.next() * TAU;
    const d = R * 1.2 + amp + rng.float(0, R * 1.4);
    flies.push({
      hx: c.x + Math.cos(a) * d,
      hy: c.y + rng.float(-16, 28),
      hz: c.z + Math.sin(a) * d,
      amp,
      f1: rng.float(0.3, 0.8),
      f2: rng.float(0.4, 0.9),
      f3: rng.float(0.3, 0.7),
      p1: rng.next() * TAU,
      p2: rng.next() * TAU,
      p3: rng.next() * TAU,
      fb: rng.float(0.8, 1.8),
      pb: rng.next() * TAU,
      sz: S * rng.float(0.8, 1.2),
    });
    const col = pick([0xd8ff5a, 0xeaff7a, 0xbaff6a]);
    flyB.add(P.set(0, 0, 0), ID, ONE, col);
    haloB.add(P.set(0, 0, 0), ID, ONE, col);
  }
  const haloMat = glow(0xffffff, 0.13);
  haloMat.blending = THREE.AdditiveBlending;
  haloMat.depthWrite = false;
  meshes.push(flyB.build(new THREE.SphereGeometry(0.2, 6, 5), glow(0xffffff), group));
  meshes.push(haloB.build(new THREE.SphereGeometry(0.5, 8, 6), haloMat, group));

  /* ------------------------------------------------------------------ Pollen und Samen */
  interface Pol {
    x: number;
    z: number;
    y0: number;
    v: number;
    ph: number;
    w: number;
  }
  const pols: Pol[] = [];
  const polB = new InstBuilder();
  const polH = 70;
  const nP = 16 + Math.round(80 * q01);
  for (let i = 0; i < nP; i++) {
    const a = rng.next() * TAU;
    const d = R * 1.2 + 3 + rng.float(0, R * 1.8);
    pols.push({ x: c.x + Math.cos(a) * d, z: c.z + Math.sin(a) * d, y0: rng.float(0, polH), v: rng.float(0.5, 1.6), ph: rng.next() * TAU, w: rng.float(1.2, 3) });
    Q.setFromEuler(E.set(rng.next() * 3, rng.next() * 3, 0));
    polB.add(P.set(0, 0, 0), Q, Sc.setScalar(S * rng.float(0.5, 1.2)), pick([0xfff6a8, 0xffffff, 0xffd6f0, 0xd8ffd0]));
  }
  meshes.push(polB.build(new THREE.OctahedronGeometry(0.2), glow(0xffffff), group));

  /* ------------------------------------------------------------------ Sonnenstrahlen */
  const beamB = new InstBuilder();
  const sunDir = new THREE.Vector3(0.8, 1.4, 0.5).normalize();
  const beamH = 150;
  let beams = 0;
  for (let tries = 0; tries < 80 && beams < 6; tries++) {
    const a = rng.next() * TAU;
    const d = R * rng.float(1.3, 2.8);
    const w = S * rng.float(5, 9);
    const mid = new THREE.Vector3(c.x + Math.cos(a) * d, c.y + rng.float(-5, 30), c.z + Math.sin(a) * d);
    let ok = true;
    for (let k = -4; k <= 4 && ok; k++) {
      const t = (k / 4) * (beamH / 2);
      const px = mid.x - sunDir.x * t;
      const pz = mid.z - sunDir.z * t;
      const hd = Math.hypot(px - c.x, pz - c.z);
      const rr = w * (0.22 + 0.78 * (0.5 - k / 8));
      if (hd < R * 1.12 + rr) ok = false;
    }
    if (!ok) continue;
    Q.setFromUnitVectors(UP, sunDir);
    beamB.add(mid, Q, Sc.set(w, beamH, w), 0xfff0a8);
    beamB.add(mid, Q, Sc.set(w * 0.55, beamH, w * 0.55), 0xfff6c8);
    beams++;
  }
  const beamGeo = new THREE.CylinderGeometry(0.22, 1, 1, 18, 6, true);
  {
    const pos = beamGeo.getAttribute('position');
    const col = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const v = pos.getY(i) + 0.5;
      const g = Math.pow(Math.sin(v * Math.PI), 0.9);
      col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = g;
    }
    beamGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  }
  const beamMat = glow(0xffffff, 0.1);
  beamMat.vertexColors = true;
  beamMat.blending = THREE.AdditiveBlending;
  beamMat.depthWrite = false;
  beamMat.side = THREE.DoubleSide;
  meshes.push(beamB.build(beamGeo, beamMat, group));

  /* ------------------------------------------------------------------ Schmetterlinge */
  interface Bfly {
    rho: number;
    base: number;
    a0: number;
    w: number;
    ph: number;
    flap: number;
    sc: number;
  }
  const bflies: Bfly[] = [];
  const wingR = new InstBuilder();
  const wingL = new InstBuilder();
  const bodyB = new InstBuilder();
  const nB = 3 + Math.round(7 * q01);
  for (let i = 0; i < nB; i++) {
    bflies.push({
      rho: R * rng.float(1.35, 2.1),
      base: c.y + rng.float(-8, 18),
      a0: rng.next() * TAU,
      w: rng.float(0.04, 0.1) * (rng.chance(0.5) ? 1 : -1),
      ph: rng.next() * TAU,
      flap: rng.float(8, 12),
      sc: S * rng.float(1.2, 1.9),
    });
    const col = pick([0xff8a3a, 0xff7ab8, 0x6ad0ff, 0xffe04a, 0xb77bff]);
    wingR.add(P.set(0, 0, 0), ID, ONE, col);
    wingL.add(P.set(0, 0, 0), ID, ONE, col);
    bodyB.add(P.set(0, 0, 0), ID, ONE, 0x4a3322);
  }
  const wingMat = ownToon(0xffffff, (m) => {
    m.side = THREE.DoubleSide;
  });
  const wg = wingGeo();
  meshes.push(wingR.build(wg, wingMat, group));
  meshes.push(wingL.build(wg, wingMat, group));
  const bodyGeo2 = new THREE.CapsuleGeometry(0.06, 0.5, 3, 6);
  bodyGeo2.rotateZ(Math.PI / 2);
  meshes.push(bodyB.build(bodyGeo2, toon(0xffffff), group));

  /* ------------------------------------------------------------------ Wolkenmeer */
  const cloudB = new InstBuilder();
  const nCl = 26 + Math.round(14 * q01);
  for (let i = 0; i < nCl; i++) {
    const a = rng.next() * TAU;
    const d = Math.sqrt(rng.next()) * 150;
    const cs = rng.float(8, 18);
    const cx = Math.cos(a) * d;
    const cz = Math.sin(a) * d;
    const np = 4 + rng.int(3);
    for (let k = 0; k < np; k++) {
      const pr = cs * rng.float(0.5, 1);
      const lift = rng.float(0, 1);
      const col = new THREE.Color(0xb4d8c6).lerp(new THREE.Color(0xffffff), lift);
      cloudB.add(P.set(cx + rng.float(-cs, cs), yCloud + lift * 3 - 1, cz + rng.float(-cs, cs) * 0.7), ID, Sc.set(pr, pr * 0.48, pr), col.getHex());
    }
  }
  const cloudMat = toon(0xffffff, { emissive: 0xcfeedd, emissiveIntensity: 0.35 });
  const cloudMesh = cloudB.build(new THREE.SphereGeometry(1, 9, 7), cloudMat, group);
  cloudMesh.frustumCulled = false;
  meshes.push(cloudMesh);
  const sea = new THREE.Mesh(new THREE.CircleGeometry(190, 24), toon(0xcfe9c8, { emissive: 0xbfe0c0, emissiveIntensity: 0.3 }));
  sea.rotation.x = -Math.PI / 2;
  sea.position.set(c.x, yCloud - 5, c.z);
  group.add(sea);
  const cloudOrigin = new THREE.Vector3(c.x, 0, c.z);

  /* ------------------------------------------------------------------ Animation */
  // Wolken wandern langsam um den Brettmittelpunkt: Instanzen liegen absolut, daher um c drehen
  const cloudPivot = new THREE.Group();
  group.remove(cloudMesh);
  cloudPivot.add(cloudMesh);
  cloudPivot.position.copy(cloudOrigin).setY(0);
  cloudMesh.position.set(-c.x, 0, -c.z);
  group.add(cloudPivot);

  const setM = (mesh: THREE.InstancedMesh, i: number): void => {
    mesh.setMatrixAt(i, M.compose(P, Q, Sc));
  };

  const update = (dt: number, t: number): void => {
    void dt;
    cloudPivot.rotation.y = t * 0.006;

    // Inseln wippen
    for (const isl of islands) {
      isl.off = Math.sin(t * 0.6 + isl.ph) * 0.45 * S;
      for (const p of isl.parts) {
        P.copy(p.lp).add(isl.base);
        P.y += isl.off;
        p.b.mesh.setMatrixAt(p.idx, M.compose(P, p.q, p.s));
      }
    }
    for (const m of [islTopB, islBodyB, islRootB, mushA, mushB]) m.mesh.instanceMatrix.needsUpdate = true;

    // Blätter wiegen sich
    for (const lf of leaves) {
      P.copy(lf.p);
      if (lf.isl) P.y += lf.isl.off;
      E.set(lf.pitch + Math.sin(t * 0.9 + lf.ph) * 0.06, lf.yaw, Math.sin(t * 0.7 + lf.ph * 1.3) * 0.05, 'YXZ');
      Q.setFromEuler(E);
      Sc.setScalar(lf.sc);
      setM(leafB.mesh, lf.idx);
    }
    leafB.mesh.instanceMatrix.needsUpdate = true;

    // Käfer krabbeln über die Inseln
    for (const b of beetleHome) {
      const ang = b.ph + t * b.sp;
      P.set(b.isl.base.x + Math.cos(ang) * b.rr, b.isl.base.y + b.isl.off + 0.25, b.isl.base.z + Math.sin(ang) * b.rr);
      const tx = -Math.sin(ang) * Math.sign(b.sp);
      const tz = Math.cos(ang) * Math.sign(b.sp);
      Q.setFromAxisAngle(AY, Math.atan2(-tz, tx) + Math.sin(t * 6 + b.ph) * 0.08);
      Sc.setScalar(b.sc);
      setM(beetleB.mesh, b.idx);
    }
    beetleB.mesh.instanceMatrix.needsUpdate = true;

    // Lianen
    for (let li = 0; li < lianas.length; li++) {
      const ln = lianas[li]!;
      pPrev.set(ln.ax, ln.ay, ln.az);
      for (let i = 1; i <= NSEG; i++) {
        const f = i / NSEG;
        const sw = ln.amp * Math.pow(f, 1.4);
        pCur.set(ln.ax + Math.sin(t * ln.sp + ln.ph + i * 0.25) * sw, ln.ay - i * ln.seg, ln.az + Math.cos(t * ln.sp * 0.8 + ln.ph * 1.3 + i * 0.2) * sw * 0.6);
        dirV.subVectors(pCur, pPrev);
        const len = dirV.length();
        const r = ln.rad * (1 - 0.45 * f);
        if (len > 1e-5) {
          dirV.multiplyScalar(1 / len);
          Q.setFromUnitVectors(UP, dirV);
        } else Q.identity();
        P.addVectors(pPrev, pCur).multiplyScalar(0.5);
        Sc.set(r, Math.max(len, 1e-4), r);
        setM(lianaB.mesh, li * NSEG + i - 1);
        pPrev.copy(pCur);
      }
      // Glockenblüte am Ende (Spitze oben), mit leuchtender Knospe darin
      const bs = S * 1.3;
      Q.setFromAxisAngle(AX, Math.sin(t * ln.sp + ln.ph) * 0.15);
      P.set(pPrev.x, pPrev.y - 0.75 * bs, pPrev.z);
      Sc.setScalar(bs);
      setM(bellB.mesh, li);
      P.set(pPrev.x, pPrev.y - 1.25 * bs, pPrev.z);
      Q.identity();
      Sc.setScalar(bs * (0.9 + 0.2 * Math.sin(t * 2 + ln.ph)));
      setM(budB.mesh, li);
    }
    lianaB.mesh.instanceMatrix.needsUpdate = true;
    bellB.mesh.instanceMatrix.needsUpdate = true;
    budB.mesh.instanceMatrix.needsUpdate = true;

    // Glühwürmchen
    Q.identity();
    for (let i = 0; i < flies.length; i++) {
      const f = flies[i]!;
      P.set(f.hx + Math.sin(t * f.f1 + f.p1) * f.amp, f.hy + Math.sin(t * f.f2 + f.p2) * f.amp * 0.6, f.hz + Math.cos(t * f.f3 + f.p3) * f.amp);
      const blink = 0.45 + 0.55 * Math.max(0, Math.sin(t * f.fb + f.pb));
      Sc.setScalar(f.sz * (0.55 + 0.45 * blink));
      setM(flyB.mesh, i);
      Sc.setScalar(Math.max(1e-3, f.sz * blink));
      setM(haloB.mesh, i);
    }
    flyB.mesh.instanceMatrix.needsUpdate = true;
    haloB.mesh.instanceMatrix.needsUpdate = true;

    // Pollen: steigt langsam auf und beginnt unten von vorn
    for (let i = 0; i < pols.length; i++) {
      const p = pols[i]!;
      const y = (p.y0 + t * p.v) % polH;
      P.set(p.x + Math.sin(t * 0.4 + p.ph) * p.w, c.y - 25 + y, p.z + Math.cos(t * 0.33 + p.ph) * p.w);
      polB.mesh.getMatrixAt(i, M);
      M.setPosition(P);
      polB.mesh.setMatrixAt(i, M);
    }
    polB.mesh.instanceMatrix.needsUpdate = true;

    beamMat.opacity = 0.09 + 0.025 * Math.sin(t * 0.5);

    // Schmetterlinge
    for (let i = 0; i < bflies.length; i++) {
      const b = bflies[i]!;
      const ang = b.a0 + b.w * t;
      const rho = b.rho + Math.sin(t * 0.5 + b.ph) * R * 0.08;
      P.set(c.x + Math.cos(ang) * rho, b.base + Math.sin(t * 0.9 + b.ph) * 1.8 + Math.sin(t * b.flap) * 0.15, c.z + Math.sin(ang) * rho);
      const sg = Math.sign(b.w);
      const yaw = Math.atan2(-Math.cos(ang) * sg, -Math.sin(ang) * sg);
      qa.setFromAxisAngle(AY, yaw);
      const phi = 0.2 + Math.sin(t * b.flap) * 0.85;
      qb.setFromAxisAngle(AX, -phi);
      Q.multiplyQuaternions(qa, qb);
      Sc.setScalar(b.sc);
      setM(wingR.mesh, i);
      qb.setFromAxisAngle(AX, phi);
      Q.multiplyQuaternions(qa, qb);
      Sc.set(b.sc, b.sc, -b.sc);
      setM(wingL.mesh, i);
      Q.copy(qa);
      Sc.setScalar(b.sc);
      setM(bodyB.mesh, i);
    }
    wingR.mesh.instanceMatrix.needsUpdate = true;
    wingL.mesh.instanceMatrix.needsUpdate = true;
    bodyB.mesh.instanceMatrix.needsUpdate = true;
  };

  const dispose = (): void => {
    for (const m of meshes) m.dispose();
    disposeTree(group);
  };
  const decor: Decor = { group, update, dispose };
  return decor;
};
