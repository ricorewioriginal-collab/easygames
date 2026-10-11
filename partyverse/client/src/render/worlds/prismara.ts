import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { disposeTree, glow, toon } from '../materials';
import type { DecorContext, DecorFactory } from './common';
import { PALETTE, createPortals, createTesseracts } from './prismara-4d';

/**
 * PRISMARA: Licht- und Kristallwelt. Alles liegt ausserhalb des Bretts (horizontal >= 1,1 * Radius)
 * oder tief darunter; Koordinaten sind relativ zum Brett-Mittelpunkt (group.position = center).
 */

const UP = new THREE.Vector3(0, 1, 0);
const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpS = new THREE.Vector3();
const tmpP = new THREE.Vector3();
const tmpC = new THREE.Color();
const TAU = Math.PI * 2;
const eu = new THREE.Euler();
const AXIS_X = new THREE.Vector3(1, 0, 0);

/** Aurora-Baender: ein Mesh, Vertexfarben mit Alpha (unten hell, oben transparent) */
function auroraGeometry(ctx: DecorContext, k: number): THREE.BufferGeometry {
  const rng = ctx.rng;
  const bands = 3;
  const seg = 30;
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const pal = [
    [0x3dffc8, 0x7b6bff],
    [0xff7bd8, 0x7be8ff],
    [0x7bffa0, 0xc07bff],
  ];
  const c1 = new THREE.Color();
  const c2 = new THREE.Color();
  for (let b = 0; b < bands; b++) {
    const rad = ctx.radius * 1.4 + (62 + b * 22) * k;
    const a0 = rng.float(0, TAU);
    const span = 1.5 + rng.float(0, 0.8);
    const base = (16 + b * 9) * k;
    const hgt = (26 + rng.float(0, 12)) * k;
    const ph = rng.float(0, 6);
    c1.setHex(pal[b]![0]!);
    c2.setHex(pal[b]![1]!);
    const v0 = pos.length / 3;
    for (let i = 0; i <= seg; i++) {
      const u = i / seg;
      const a = a0 + u * span;
      const x = Math.cos(a) * rad;
      const z = Math.sin(a) * rad;
      const yb = base + Math.sin(u * 5 + ph) * 4 * k;
      const yt = yb + hgt * (0.75 + 0.25 * Math.sin(u * 9 + ph * 2));
      const fade = Math.pow(Math.sin(Math.PI * u), 0.6);
      tmpC.copy(c1).lerp(c2, u);
      pos.push(x, yb, z, x, yt, z);
      col.push(tmpC.r, tmpC.g, tmpC.b, 0.6 * fade, tmpC.r, tmpC.g, tmpC.b, 0);
    }
    for (let i = 0; i < seg; i++) {
      const a = v0 + i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 4));
  g.setIndex(idx);
  return g;
}

/** Regenbogenbogen: 7 farbige Halbtori, zu einer Geometrie verschmolzen */
function rainbowGeometry(k: number): THREE.BufferGeometry {
  const cols = [0xff5a7a, 0xff9a4a, 0xffe45a, 0x6bdc7a, 0x4fd6ff, 0x6a7bff, 0xb77bff];
  const parts: THREE.BufferGeometry[] = [];
  const w = 1.2 * k;
  for (let i = 0; i < cols.length; i++) {
    const g = new THREE.TorusGeometry(14 * k - i * w, w * 0.56, 6, 36, Math.PI).toNonIndexed();
    const n = g.attributes.position!.count;
    const c = new THREE.Color(cols[i]);
    const arr = new Float32Array(n * 3);
    for (let v = 0; v < n; v++) {
      arr[v * 3] = c.r;
      arr[v * 3 + 1] = c.g;
      arr[v * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    g.deleteAttribute('uv');
    parts.push(g);
  }
  const merged = mergeGeometries(parts, false) as THREE.BufferGeometry;
  for (const p of parts) p.dispose();
  return merged;
}

export const createDecor: DecorFactory = (ctx) => {
  const rng = ctx.rng;
  const R = ctx.radius;
  const q = Math.max(0, Math.min(1, ctx.quality.particles));
  const k = Math.max(1, Math.min(2.2, R / 18));
  const group = new THREE.Group();
  group.position.copy(ctx.center);
  const meshes: THREE.InstancedMesh[] = [];
  const track = <T extends THREE.InstancedMesh>(m: T): T => {
    m.frustumCulled = false;
    meshes.push(m);
    return m;
  };

  // --- Aurora ---
  const aurora = new THREE.Mesh(
    auroraGeometry(ctx, k),
    new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    }),
  );
  aurora.renderOrder = -5;
  aurora.frustumCulled = false;
  group.add(aurora);

  // --- Regenbogenbogen (instanziert, stehen mit dem Fuss tief unter dem Brett) ---
  const rbN = 3;
  const rainbows = track(
    new THREE.InstancedMesh(rainbowGeometry(k), new THREE.MeshBasicMaterial({ vertexColors: true }), rbN),
  );
  const rbData: { x: number; y: number; z: number; q: THREE.Quaternion; s: number; ph: number }[] = [];
  {
    const a0 = rng.float(0, TAU);
    for (let i = 0; i < rbN; i++) {
      const s = 0.8 + rng.float(0, 0.6);
      const d = R * 1.15 + 15 * k * s + R * rng.float(0.5, 1.2);
      const a = a0 + (i * TAU) / rbN + rng.float(-0.35, 0.35);
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      const face = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(-x, 0, -z).normalize(),
      );
      rbData.push({ x, y: -9 * k - rng.float(0, 6) * k, z, q: face, s, ph: rng.float(0, 6) });
    }
  }

  // --- Schwebende Prismen ---
  const prismN = 8 + Math.floor(34 * q);
  const prismGeo = new THREE.OctahedronGeometry(1, 0);
  const prisms = track(
    new THREE.InstancedMesh(prismGeo, toon(0xffffff, { emissive: 0x5a3a88, emissiveIntensity: 0.7 }), prismN),
  );
  const prismD: { x: number; y: number; z: number; s: number; ph: number; sp: number; tx: number }[] = [];
  for (let i = 0; i < prismN; i++) {
    const s = (0.7 + rng.next() * 1.5) * k;
    const d = R * 1.12 + s * 2.2 + R * rng.float(0, 1.5);
    const a = rng.float(0, TAU);
    prismD.push({
      x: Math.cos(a) * d,
      y: rng.float(-9, 24) * k,
      z: Math.sin(a) * d,
      s,
      ph: rng.float(0, 6),
      sp: rng.float(0.3, 0.9) * (rng.chance(0.5) ? 1 : -1),
      tx: rng.float(0.1, 0.5),
    });
    prisms.setColorAt(
      i,
      tmpC.setHex(PALETTE[i % PALETTE.length]!).lerp(new THREE.Color(0xffffff), rng.float(0, 0.35)),
    );
  }

  // --- Kreisende Kristallinseln ---
  const islN = 4 + Math.round(3 * q);
  const islTop = track(
    new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 0.9, 0.3, 9, 1), toon(0xffffff), islN),
  );
  const islTip = track(new THREE.InstancedMesh(new THREE.ConeGeometry(0.9, 1.6, 9), toon(0xffffff), islN));
  const islCry = track(
    new THREE.InstancedMesh(
      new THREE.OctahedronGeometry(1, 0),
      toon(0xffffff, { emissive: 0x6a4aa0, emissiveIntensity: 0.8 }),
      islN * 2,
    ),
  );
  const islD: { d: number; a: number; y: number; s: number; w: number; ph: number }[] = [];
  const topCols = [0xe6c8ff, 0xc8f0ff, 0xffd6f0];
  for (let i = 0; i < islN; i++) {
    const s = (2.8 + rng.next() * 2.6) * k;
    const d = R * 1.1 + s * 1.3 + R * rng.float(0.25, 1.1);
    const w = ((0.035 + rng.next() * 0.03) / Math.max(1, d / 40)) * (i % 2 ? 1 : -1);
    islD.push({
      d,
      a: (i / islN) * TAU + rng.float(0, 0.6),
      y: rng.float(-6, 16) * k,
      s,
      w,
      ph: rng.float(0, 6),
    });
    islTop.setColorAt(i, tmpC.setHex(topCols[i % 3]!));
    islTip.setColorAt(i, tmpC.setHex(0x8a77d8));
    islCry.setColorAt(i * 2, tmpC.setHex(PALETTE[(i * 2) % PALETTE.length]!));
    islCry.setColorAt(i * 2 + 1, tmpC.setHex(PALETTE[(i * 2 + 3) % PALETTE.length]!));
  }

  // --- Lichtstaub ---
  const dustN = 30 + Math.floor(260 * q);
  const dust = track(new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.22, 0), glow(0xffffff), dustN));
  const dustD = new Float32Array(dustN * 5); // r, a, y0, speed, phase
  const DUST_H = 48 * k;
  for (let i = 0; i < dustN; i++) {
    dustD[i * 5] = R * 1.3 + rng.float(0, 2.4) * R;
    dustD[i * 5 + 1] = rng.float(0, TAU);
    dustD[i * 5 + 2] = rng.float(0, DUST_H);
    dustD[i * 5 + 3] = rng.float(0.4, 1.4);
    dustD[i * 5 + 4] = rng.float(0, 6);
    dust.setColorAt(i, tmpC.setHex(PALETTE[i % PALETTE.length]!).lerp(new THREE.Color(0xffffff), 0.5));
  }

  // --- Kristallspitzen in der Tiefe ---
  const spireN = 8 + Math.floor(10 * q);
  const spires = track(
    new THREE.InstancedMesh(
      new THREE.ConeGeometry(1, 1, 5),
      toon(0xffffff, { emissive: 0x3a2a70, emissiveIntensity: 0.6 }),
      spireN,
    ),
  );
  for (let i = 0; i < spireN; i++) {
    const a = rng.float(0, TAU);
    const d = rng.float(0.2, 2.6) * R + 8;
    const h = (14 + rng.next() * 18) * k;
    const wd = (3 + rng.next() * 3) * k;
    tmpQ.setFromAxisAngle(UP, rng.float(0, TAU));
    tmpP.set(Math.cos(a) * d, -72 * k - rng.float(0, 12), Math.sin(a) * d);
    spires.setMatrixAt(i, tmpM.compose(tmpP, tmpQ, tmpS.set(wd, h, wd)));
    spires.setColorAt(i, tmpC.setHex(PALETTE[i % PALETTE.length]!).lerp(new THREE.Color(0x6a5cff), 0.45));
  }
  spires.instanceMatrix.needsUpdate = true;

  // --- 4D ---
  const tess = createTesseracts(ctx, k);
  const portals = createPortals(ctx, k);

  group.add(rainbows, prisms, islTop, islTip, islCry, dust, spires, ...tess.objects, ...portals.objects);
  for (const o of [...tess.objects, ...portals.objects]) meshes.push(o as THREE.InstancedMesh);

  const update = (dt: number, t: number): void => {
    aurora.rotation.y = Math.sin(t * 0.05) * 0.18;
    aurora.scale.y = 1 + Math.sin(t * 0.4) * 0.08;

    for (let i = 0; i < rbN; i++) {
      const r = rbData[i]!;
      const s = r.s * (1 + Math.sin(t * 0.5 + r.ph) * 0.02);
      rainbows.setMatrixAt(i, tmpM.compose(tmpP.set(r.x, r.y, r.z), r.q, tmpS.set(s, s, s)));
    }
    rainbows.instanceMatrix.needsUpdate = true;

    for (let i = 0; i < prismN; i++) {
      const p = prismD[i]!;
      tmpQ.setFromEuler(eu.set(Math.sin(t * p.tx + p.ph) * 0.35, t * p.sp, 0));
      tmpP.set(p.x, p.y + Math.sin(t * 0.7 + p.ph) * 0.9, p.z);
      tmpS.set(p.s * 0.6, p.s * 1.5, p.s * 0.6);
      prisms.setMatrixAt(i, tmpM.compose(tmpP, tmpQ, tmpS));
    }
    prisms.instanceMatrix.needsUpdate = true;

    for (let i = 0; i < islN; i++) {
      const o = islD[i]!;
      o.a += o.w * dt;
      const x = Math.cos(o.a) * o.d;
      const z = Math.sin(o.a) * o.d;
      const y = o.y + Math.sin(t * 0.45 + o.ph) * 0.9 * k;
      const s = o.s;
      tmpQ.identity();
      islTop.setMatrixAt(i, tmpM.compose(tmpP.set(x, y, z), tmpQ, tmpS.set(s, s * 0.6, s)));
      islTip.setMatrixAt(
        i,
        tmpM.compose(
          tmpP.set(x, y - s * 0.86, z),
          tmpQ.setFromAxisAngle(AXIS_X, Math.PI),
          tmpS.set(s, s * 0.9, s),
        ),
      );
      tmpQ.setFromAxisAngle(UP, t * 0.5 + o.ph);
      const cs = s * 0.34;
      islCry.setMatrixAt(
        i * 2,
        tmpM.compose(
          tmpP.set(x + s * 0.25, y + cs * 1.5, z + s * 0.1),
          tmpQ,
          tmpS.set(cs * 0.55, cs * 1.5, cs * 0.55),
        ),
      );
      islCry.setMatrixAt(
        i * 2 + 1,
        tmpM.compose(
          tmpP.set(x - s * 0.35, y + cs * 1.0, z - s * 0.2),
          tmpQ,
          tmpS.set(cs * 0.4, cs * 1.0, cs * 0.4),
        ),
      );
    }
    islTop.instanceMatrix.needsUpdate =
      islTip.instanceMatrix.needsUpdate =
      islCry.instanceMatrix.needsUpdate =
        true;

    tmpQ.identity();
    for (let i = 0; i < dustN; i++) {
      const j = i * 5;
      const a = dustD[j + 1]! + t * 0.02 * dustD[j + 3]!;
      let h = (dustD[j + 2]! + t * dustD[j + 3]! * 0.8) % DUST_H;
      if (h < 0) h += DUST_H;
      const edge = Math.sin((h / DUST_H) * Math.PI);
      const tw = 0.5 + 0.5 * Math.sin(t * 3 + dustD[j + 4]!);
      const sc = Math.max(0.0001, edge * (0.45 + tw * 0.9));
      tmpP.set(Math.cos(a) * dustD[j]!, h - 14 * k, Math.sin(a) * dustD[j]!);
      dust.setMatrixAt(i, tmpM.compose(tmpP, tmpQ, tmpS.setScalar(sc)));
    }
    dust.instanceMatrix.needsUpdate = true;

    tess.update(dt, t);
    portals.update(dt, t);
  };
  update(0, 0);
  for (const m of meshes) {
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }

  return {
    group,
    update,
    dispose() {
      for (const m of meshes) m.dispose();
      disposeTree(group);
    },
  };
};
