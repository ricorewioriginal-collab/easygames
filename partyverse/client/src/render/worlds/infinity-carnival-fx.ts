import * as THREE from 'three';
import type { Rng } from '@shared/rng';
import { glow, toon } from '../materials';
import { PALETTE, type Part } from './infinity-carnival-rides';

/** Effekte der INFINITY-CARNIVAL-Dekoration: Ballons, Lichterketten, Konfetti, Feuerwerk, Scheinwerfer, Sternenhimmel */

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _m = new THREE.Matrix4();
const _s = new THREE.Vector3();
const _c = new THREE.Color();
const TAU = Math.PI * 2;

/** Pseudo-Zufall aus einer Zahl (deterministisch, ohne Zustand) */
function hash01(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export interface Ring {
  cx: number;
  cy: number;
  cz: number;
  /** Mindestabstand vom Mittelpunkt (XZ) */
  min: number;
  s: number;
}

function ringPoint(
  rg: Ring,
  rng: Rng,
  extraMin: number,
  extraMax: number,
  out: THREE.Vector3,
): THREE.Vector3 {
  const angle = rng.next() * TAU;
  const d = rg.min + rng.float(extraMin, extraMax) * rg.s;
  return out.set(rg.cx + Math.cos(angle) * d, 0, rg.cz + Math.sin(angle) * d);
}

// ---------------------------------------------------------------- Luftballon-Trauben

export function createBalloons(rg: Ring, rng: Rng, quality: number): Part {
  const group = new THREE.Group();
  const CLUSTERS = 7;
  const PER = Math.max(3, Math.round(4 + 4 * quality));
  const total = CLUSTERS * PER;
  const balloons = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.62 * rg.s, 10, 8),
    toon(0xffffff),
    total,
  );
  const base = new Float32Array(total * 3);
  const phase = new Float32Array(total);
  const knot = new Float32Array(CLUSTERS * 3);
  const cph = new Float32Array(CLUSTERS);
  const p = new THREE.Vector3();
  for (let c = 0; c < CLUSTERS; c++) {
    ringPoint(rg, rng, 1, 16, p);
    knot[c * 3] = p.x;
    knot[c * 3 + 1] = rg.cy + rng.float(-1, 10) * rg.s;
    knot[c * 3 + 2] = p.z;
    cph[c] = rng.float(0, TAU);
    for (let i = 0; i < PER; i++) {
      const k = c * PER + i;
      const a = rng.float(0, TAU);
      const r = rng.float(0.2, 1.1) * rg.s;
      base[k * 3] = Math.cos(a) * r;
      base[k * 3 + 1] = rng.float(2.2, 3.6) * rg.s;
      base[k * 3 + 2] = Math.sin(a) * r;
      phase[k] = rng.float(0, TAU);
      balloons.setColorAt(k, _c.setHex(PALETTE[rng.int(PALETTE.length)]!));
    }
  }
  balloons.frustumCulled = false;
  const linePos = new Float32Array(total * 6);
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.BufferAttribute(linePos, 3).setUsage(THREE.DynamicDrawUsage));
  const lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0xfff0e0 }));
  lines.frustumCulled = false;
  group.add(balloons, lines);
  return {
    group,
    instanced: [balloons],
    update(_dt, t) {
      for (let c = 0; c < CLUSTERS; c++) {
        const kx = knot[c * 3]! + Math.sin(t * 0.7 + cph[c]!) * 0.8 * rg.s;
        const ky = knot[c * 3 + 1]! + Math.sin(t * 0.9 + cph[c]! * 2) * 0.9 * rg.s;
        const kz = knot[c * 3 + 2]! + Math.cos(t * 0.6 + cph[c]!) * 0.8 * rg.s;
        for (let i = 0; i < PER; i++) {
          const k = c * PER + i;
          const wob = Math.sin(t * 1.3 + phase[k]!) * 0.15 * rg.s;
          const bx = kx + base[k * 3]! + wob;
          const by = ky + base[k * 3 + 1]!;
          const bz = kz + base[k * 3 + 2]! - wob;
          _m.makeTranslation(bx, by, bz);
          balloons.setMatrixAt(k, _m);
          const o = k * 6;
          linePos[o] = kx;
          linePos[o + 1] = ky;
          linePos[o + 2] = kz;
          linePos[o + 3] = bx;
          linePos[o + 4] = by - 0.62 * rg.s;
          linePos[o + 5] = bz;
        }
      }
      balloons.instanceMatrix.needsUpdate = true;
      lg.attributes.position!.needsUpdate = true;
    },
  };
}

// ---------------------------------------------------------------- Girlanden mit blinkenden Glühbirnen

/** Verbindet die Aufhängepunkte (nach Winkel sortiert) mit durchhängenden Lichterketten auf einem Bogen um die Mitte. */
export function createGarlands(rg: Ring, anchors: THREE.Vector3[], quality: number): Part {
  const group = new THREE.Group();
  const list = anchors
    .slice()
    .sort((a, b) => Math.atan2(a.z - rg.cz, a.x - rg.cx) - Math.atan2(b.z - rg.cz, b.x - rg.cx));
  const SEG = 14;
  const BULB_EVERY = quality < 0.5 ? 3 : 2;
  const bulbPts: number[] = [];
  const flagPts: number[] = [];
  const linePts: number[] = [];
  const n = list.length;
  for (let i = 0; i < n; i++) {
    const a = list[i]!;
    const b = list[(i + 1) % n]!;
    if (a === b) continue;
    const a0 = Math.atan2(a.z - rg.cz, a.x - rg.cx);
    const a1 = Math.atan2(b.z - rg.cz, b.x - rg.cx);
    let da = a1 - a0;
    while (da < 0) da += TAU;
    while (da > TAU) da -= TAU;
    const r0 = Math.hypot(a.x - rg.cx, a.z - rg.cz);
    const r1 = Math.hypot(b.x - rg.cx, b.z - rg.cz);
    const sag = Math.min(4.5, 1.2 + da * 6) * rg.s;
    let px = a.x;
    let py = a.y;
    let pz = a.z;
    for (let k = 1; k <= SEG; k++) {
      const u = k / SEG;
      const ang = a0 + da * u;
      const r = r0 + (r1 - r0) * u;
      const x = rg.cx + Math.cos(ang) * r;
      const z = rg.cz + Math.sin(ang) * r;
      const y = a.y + (b.y - a.y) * u - sag * 4 * u * (1 - u);
      linePts.push(px, py, pz, x, y, z);
      if (k < SEG) (k % BULB_EVERY === 0 ? bulbPts : flagPts).push(x, y, z);
      px = x;
      py = y;
      pz = z;
    }
  }
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.Float32BufferAttribute(linePts, 3));
  const lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x3a2a4a }));
  lines.frustumCulled = false;

  const nb = bulbPts.length / 3;
  const bulbs = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.3 * rg.s, 8, 6),
    glow(0xffffff),
    Math.max(1, nb),
  );
  const bcol = new Float32Array(Math.max(1, nb) * 3);
  for (let i = 0; i < nb; i++) {
    _m.makeTranslation(bulbPts[i * 3]!, bulbPts[i * 3 + 1]! - 0.25 * rg.s, bulbPts[i * 3 + 2]!);
    bulbs.setMatrixAt(i, _m);
    _c.setHex(PALETTE[i % PALETTE.length]!);
    bcol[i * 3] = _c.r;
    bcol[i * 3 + 1] = _c.g;
    bcol[i * 3 + 2] = _c.b;
    bulbs.setColorAt(i, _c);
  }
  bulbs.count = nb;
  bulbs.frustumCulled = false;

  const nf = flagPts.length / 3;
  const flags = new THREE.InstancedMesh(
    new THREE.ConeGeometry(0.38 * rg.s, 0.85 * rg.s, 3).rotateX(Math.PI),
    toon(0xffffff),
    Math.max(1, nf),
  );
  for (let i = 0; i < nf; i++) {
    _m.compose(
      _a.set(flagPts[i * 3]!, flagPts[i * 3 + 1]! - 0.5 * rg.s, flagPts[i * 3 + 2]!),
      _q.identity(),
      _s.set(1, 1, 0.35),
    );
    flags.setMatrixAt(i, _m);
    flags.setColorAt(i, _c.setHex(PALETTE[(i * 3 + 1) % PALETTE.length]!));
  }
  flags.count = nf;
  flags.frustumCulled = false;
  group.add(lines, bulbs, flags);
  let step = -1;
  return {
    group,
    instanced: [bulbs, flags],
    update(_dt, t) {
      const st = Math.floor(t * 3.5);
      if (st === step || !bulbs.instanceColor) return;
      step = st;
      for (let i = 0; i < nb; i++) {
        const on = (i + st) % 2 === 0 ? 1 : 0.2;
        bulbs.setColorAt(i, _c.setRGB(bcol[i * 3]! * on, bcol[i * 3 + 1]! * on, bcol[i * 3 + 2]! * on));
      }
      bulbs.instanceColor.needsUpdate = true;
    },
  };
}

// ---------------------------------------------------------------- Konfetti

export function createConfetti(rg: Ring, rng: Rng, quality: number): Part {
  const group = new THREE.Group();
  const N = Math.round(40 + 260 * quality);
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const baseA = new Float32Array(N);
  const baseR = new Float32Array(N);
  const baseY = new Float32Array(N);
  const spd = new Float32Array(N);
  const ph = new Float32Array(N);
  const H = 30 * rg.s;
  for (let i = 0; i < N; i++) {
    baseA[i] = rng.next() * TAU;
    baseR[i] = rg.min + rng.float(0.5, 22) * rg.s;
    baseY[i] = rng.next() * H;
    spd[i] = rng.float(0.8, 1.8) * rg.s;
    ph[i] = rng.float(0, TAU);
    _c.setHex(PALETTE[rng.int(PALETTE.length)]!);
    col[i * 3] = _c.r;
    col[i * 3 + 1] = _c.g;
    col[i * 3 + 2] = _c.b;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(
    g,
    new THREE.PointsMaterial({ size: 0.45 * rg.s, vertexColors: true, sizeAttenuation: true }),
  );
  pts.frustumCulled = false;
  group.add(pts);
  const y0 = rg.cy - 8 * rg.s;
  return {
    group,
    update(dt, t) {
      for (let i = 0; i < N; i++) {
        let y = baseY[i]! - spd[i]! * dt;
        if (y < 0) y += H;
        baseY[i] = y;
        const a = baseA[i]! + Math.sin(t * 0.5 + ph[i]!) * 0.05;
        const r = baseR[i]! + Math.sin(t * 1.7 + ph[i]!) * 0.6;
        pos[i * 3] = rg.cx + Math.cos(a) * r;
        pos[i * 3 + 1] = y0 + y;
        pos[i * 3 + 2] = rg.cz + Math.sin(a) * r;
      }
      g.attributes.position!.needsUpdate = true;
    },
  };
}

// ---------------------------------------------------------------- Feuerwerk (wiederverwendete Partikel)

export function createFireworks(rg: Ring, rng: Rng, quality: number): Part {
  const group = new THREE.Group();
  const BURSTS = 4;
  const P = Math.round(24 + 44 * quality);
  const TRAIL = 6;
  const N = BURSTS * (P + TRAIL);
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const dirs = new Float32Array(BURSTS * P * 3);
  const speeds = new Float32Array(BURSTS * P);
  for (let b = 0; b < BURSTS; b++) {
    for (let i = 0; i < P; i++) {
      const u = rng.float(-1, 1);
      const a = rng.float(0, TAU);
      const r = Math.sqrt(1 - u * u);
      const k = b * P + i;
      dirs[k * 3] = Math.cos(a) * r;
      dirs[k * 3 + 1] = u;
      dirs[k * 3 + 2] = Math.sin(a) * r;
      speeds[k] = rng.float(0.65, 1) * 7.5 * rg.s;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage));
  const mat = new THREE.PointsMaterial({
    size: 0.8 * rg.s,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    fog: false,
  });
  const pts = new THREE.Points(g, mat);
  pts.frustumCulled = false;
  group.add(pts);

  const CYCLE = 4.2;
  const LAUNCH = 0.9;
  const LIFE = 2.2;
  const GRAV = 3.2 * rg.s;
  const hueA = [0xff4a6a, 0xffd04a, 0x4ae0ff, 0x7be86a, 0xb77bff, 0xff9a3a];
  return {
    group,
    update(_dt, t) {
      for (let b = 0; b < BURSTS; b++) {
        const tt = t + b * (CYCLE / BURSTS) + b * 0.37;
        const cyc = Math.floor(tt / CYCLE);
        const local = tt - cyc * CYCLE;
        const seed = b * 31 + cyc * 7.13;
        const ang = hash01(seed) * TAU;
        const d = rg.min + (6 + hash01(seed + 1) * 12) * rg.s;
        const ox = rg.cx + Math.cos(ang) * d;
        const oz = rg.cz + Math.sin(ang) * d;
        const oy = rg.cy + (15 + hash01(seed + 2) * 9) * rg.s;
        _c.setHex(hueA[Math.floor(hash01(seed + 3) * hueA.length)]!);
        const age = local - LAUNCH;
        const fade =
          age <= 0 || age >= LIFE ? 0 : Math.pow(1 - age / LIFE, 1.4) * (0.75 + 0.25 * Math.sin(age * 40));
        const ca = Math.max(0, age);
        const e = (1 - Math.exp(-2.2 * ca)) / 2.2;
        for (let i = 0; i < P; i++) {
          const k = b * P + i;
          const o = (b * (P + TRAIL) + i) * 3;
          const sp = speeds[k]!;
          pos[o] = ox + dirs[k * 3]! * sp * e;
          pos[o + 1] = oy + dirs[k * 3 + 1]! * sp * e - 0.5 * GRAV * ca * ca;
          pos[o + 2] = oz + dirs[k * 3 + 2]! * sp * e;
          col[o] = _c.r * fade;
          col[o + 1] = _c.g * fade;
          col[o + 2] = _c.b * fade;
        }
        // Rakete: steigt vor dem Platzen auf
        const rise = Math.min(1, Math.max(0, local / LAUNCH));
        for (let i = 0; i < TRAIL; i++) {
          const o = (b * (P + TRAIL) + P + i) * 3;
          const lag = Math.max(0, rise - i * 0.035);
          const vis = local < LAUNCH && local > 0 ? 1 - i / TRAIL : 0;
          pos[o] = ox;
          pos[o + 1] = oy - (1 - lag * lag) * 13 * rg.s;
          pos[o + 2] = oz;
          col[o] = vis;
          col[o + 1] = 0.85 * vis;
          col[o + 2] = 0.5 * vis;
        }
      }
      g.attributes.position!.needsUpdate = true;
      g.attributes.color!.needsUpdate = true;
    },
  };
}

// ---------------------------------------------------------------- Scheinwerfer

export function createSearchlights(rg: Ring, rng: Rng): Part {
  const group = new THREE.Group();
  const N = 4;
  const H = 70 * rg.s;
  const geo = new THREE.ConeGeometry(3.2 * rg.s, H, 14, 1, true);
  geo.rotateX(Math.PI);
  geo.translate(0, H / 2, 0);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xfff2c0,
    transparent: true,
    opacity: 0.1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: false,
  });
  const beams = new THREE.InstancedMesh(geo, mat, N);
  beams.frustumCulled = false;
  const lamps = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.9 * rg.s, 1.3 * rg.s, 1.4 * rg.s, 8),
    toon(0x6a5a8a),
    N,
  );
  const ox = new Float32Array(N);
  const oy = new Float32Array(N);
  const oz = new Float32Array(N);
  const ph = new Float32Array(N);
  const a0 = rng.next() * TAU;
  for (let i = 0; i < N; i++) {
    const a = a0 + (i / N) * TAU + rng.float(-0.25, 0.25);
    const d = rg.min + rng.float(16, 26) * rg.s;
    ox[i] = rg.cx + Math.cos(a) * d;
    oy[i] = rg.cy - 9 * rg.s;
    oz[i] = rg.cz + Math.sin(a) * d;
    ph[i] = rng.float(0, TAU);
    _m.makeTranslation(ox[i]!, oy[i]!, oz[i]!);
    lamps.setMatrixAt(i, _m);
  }
  lamps.frustumCulled = false;
  group.add(beams, lamps);
  const e = new THREE.Euler();
  return {
    group,
    instanced: [beams, lamps],
    update(_dt, t) {
      for (let i = 0; i < N; i++) {
        const sweep = t * 0.35 * (i % 2 ? 1 : -1) + ph[i]!;
        e.set(Math.sin(sweep) * 0.55, 0, Math.cos(sweep * 0.8) * 0.55, 'XZY');
        _q.setFromEuler(e);
        _m.compose(_a.set(ox[i]!, oy[i]!, oz[i]!), _q, _s.set(1, 1, 1));
        beams.setMatrixAt(i, _m);
      }
      beams.instanceMatrix.needsUpdate = true;
    },
  };
}

// ---------------------------------------------------------------- schwebende Clown-Hüte und Sterne

export function createFloaters(rg: Ring, rng: Rng, quality: number): Part {
  const group = new THREE.Group();
  const HATS = Math.round(5 + 4 * quality);
  const STARS = Math.round(7 + 6 * quality);
  const hats = new THREE.InstancedMesh(
    new THREE.ConeGeometry(0.9 * rg.s, 2.0 * rg.s, 10),
    toon(0xffffff),
    HATS,
  );
  const poms = new THREE.InstancedMesh(new THREE.SphereGeometry(0.3 * rg.s, 8, 6), toon(0xffffff), HATS);
  const brims = new THREE.InstancedMesh(
    new THREE.TorusGeometry(0.9 * rg.s, 0.12 * rg.s, 5, 14).rotateX(Math.PI / 2),
    toon(0xfff0d0),
    HATS,
  );
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.45 : 1;
    const a = (i / 10) * TAU + Math.PI / 2;
    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  shape.closePath();
  const starGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.35,
    bevelEnabled: true,
    bevelSize: 0.08,
    bevelThickness: 0.08,
    bevelSegments: 1,
  });
  starGeo.center();
  starGeo.scale(1.1 * rg.s, 1.1 * rg.s, 1.1 * rg.s);
  const stars = new THREE.InstancedMesh(
    starGeo,
    toon(0xffffff, { emissive: 0xffb020, emissiveIntensity: 0.5 }),
    STARS,
  );
  const hp = new Float32Array(HATS * 3);
  const hph = new Float32Array(HATS);
  const sp = new Float32Array(STARS * 3);
  const sph = new Float32Array(STARS);
  const p = new THREE.Vector3();
  for (let i = 0; i < HATS; i++) {
    ringPoint(rg, rng, 2, 20, p);
    hp[i * 3] = p.x;
    hp[i * 3 + 1] = rg.cy + rng.float(-3, 14) * rg.s;
    hp[i * 3 + 2] = p.z;
    hph[i] = rng.float(0, TAU);
    hats.setColorAt(i, _c.setHex(PALETTE[rng.int(PALETTE.length)]!));
    poms.setColorAt(i, _c.setHex(0xfff8e8));
  }
  for (let i = 0; i < STARS; i++) {
    ringPoint(rg, rng, 2, 24, p);
    sp[i * 3] = p.x;
    sp[i * 3 + 1] = rg.cy + rng.float(0, 20) * rg.s;
    sp[i * 3 + 2] = p.z;
    sph[i] = rng.float(0, TAU);
    stars.setColorAt(i, _c.setHex(rng.chance(0.5) ? 0xffe066 : 0xfff6c0));
  }
  for (const m of [hats, poms, brims, stars]) m.frustumCulled = false;
  group.add(hats, poms, brims, stars);
  const e = new THREE.Euler();
  return {
    group,
    instanced: [hats, poms, brims, stars],
    update(_dt, t) {
      for (let i = 0; i < HATS; i++) {
        const y = hp[i * 3 + 1]! + Math.sin(t * 0.8 + hph[i]!) * 0.9 * rg.s;
        e.set(Math.sin(t * 0.6 + hph[i]!) * 0.25, t * 0.3 + hph[i]!, Math.cos(t * 0.5 + hph[i]!) * 0.25);
        _q.setFromEuler(e);
        _a.set(hp[i * 3]!, y, hp[i * 3 + 2]!);
        _m.compose(_a, _q, _s.set(1, 1, 1));
        hats.setMatrixAt(i, _m);
        _b.set(0, -1.0 * rg.s, 0)
          .applyQuaternion(_q)
          .add(_a);
        _m.compose(_b, _q, _s.set(1, 1, 1));
        brims.setMatrixAt(i, _m);
        _b.set(0, 1.05 * rg.s, 0)
          .applyQuaternion(_q)
          .add(_a);
        _m.compose(_b, _q, _s.set(1, 1, 1));
        poms.setMatrixAt(i, _m);
      }
      for (let i = 0; i < STARS; i++) {
        const y = sp[i * 3 + 1]! + Math.sin(t * 1.1 + sph[i]!) * 0.7 * rg.s;
        e.set(0, t * 0.9 + sph[i]!, Math.sin(t * 0.7 + sph[i]!) * 0.2);
        _q.setFromEuler(e);
        _m.compose(_a.set(sp[i * 3]!, y, sp[i * 3 + 2]!), _q, _s.set(1, 1, 1));
        stars.setMatrixAt(i, _m);
      }
      hats.instanceMatrix.needsUpdate =
        poms.instanceMatrix.needsUpdate =
        brims.instanceMatrix.needsUpdate =
        stars.instanceMatrix.needsUpdate =
          true;
    },
  };
}

// ---------------------------------------------------------------- Abendhimmel: Sterne, Mond

export function createNightSky(rg: Ring, rng: Rng, quality: number): Part {
  const group = new THREE.Group();
  const N = Math.round(60 + 160 * quality);
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const R = 170;
  for (let i = 0; i < N; i++) {
    const a = rng.float(0, TAU);
    const el = rng.float(0.2, 1.35);
    pos[i * 3] = rg.cx + Math.cos(a) * Math.cos(el) * R;
    pos[i * 3 + 1] = rg.cy + Math.sin(el) * R;
    pos[i * 3 + 2] = rg.cz + Math.sin(a) * Math.cos(el) * R;
    _c.setHex(rng.chance(0.3) ? 0xffd9a0 : 0xffffff).multiplyScalar(rng.float(0.5, 1));
    col[i * 3] = _c.r;
    col[i * 3 + 1] = _c.g;
    col[i * 3 + 2] = _c.b;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const stars = new THREE.Points(
    g,
    new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      sizeAttenuation: true,
      fog: false,
      depthWrite: false,
    }),
  );
  stars.frustumCulled = false;
  stars.renderOrder = -9;
  const ma = rng.float(0, TAU);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(14, 20, 14), glow(0xfff0c0));
  const halo = new THREE.Mesh(new THREE.SphereGeometry(22, 16, 12), glow(0xffd890, 0.2));
  (moon.material as THREE.MeshBasicMaterial).fog = false;
  (halo.material as THREE.MeshBasicMaterial).fog = false;
  (halo.material as THREE.MeshBasicMaterial).depthWrite = false;
  moon.position.set(rg.cx + Math.cos(ma) * 150, rg.cy + 95, rg.cz + Math.sin(ma) * 150);
  halo.position.copy(moon.position);
  moon.renderOrder = halo.renderOrder = -8;
  group.add(stars, moon, halo);
  return { group, update() {} };
}
