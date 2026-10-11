import * as THREE from 'three';
import {
  Face,
  G,
  boltGeo,
  darken,
  eyePair,
  fitModel,
  grp,
  lighten,
  makeGlowEye,
  makeMouth,
  mk,
  type Env,
  type Parts,
  type Style,
} from './kit';

const sin = Math.sin;

/** Pip – rundes, flauschiges Hüpfknäuel mit Fühlern */
export function buildPip(env: Env): Parts {
  const { primary, secondary, accent } = env.def.colors;
  const model = new THREE.Group();
  const body = mk(model, G.sph(0.66, 22, 16), env.m(primary), 0, 0.78, 0, 1, 0.94, 0.96);
  void body;
  mk(model, G.sph(0.42, 16, 12), env.m(lighten(primary, 0.55)), 0, 0.48, 0.34, 1, 0.9, 0.7);
  const orange = env.m(secondary);
  const tufts: Array<[number, number, number]> = [
    [0.62, 1.06, 0],
    [-0.62, 1.06, 0],
    [0.42, 1.32, -0.05],
    [-0.42, 1.32, -0.05],
    [0, 1.44, -0.02],
    [0.6, 0.6, -0.02],
    [-0.6, 0.6, -0.02],
  ];
  for (const [x, y, z] of tufts) mk(model, G.sph(0.15, 10, 8), orange, x, y, z);

  const mkLeg = (s: number): THREE.Group => {
    const l = grp(model, 0.28 * s, 0.3, 0.05);
    mk(l, G.sph(0.2, 12, 8), orange, 0, -0.18, 0.1, 1, 0.6, 1.3);
    return l;
  };
  const legL = mkLeg(1);
  const legR = mkLeg(-1);
  const mkArm = (s: number): THREE.Group => {
    const a = grp(model, 0.6 * s, 0.92, 0.06);
    mk(a, G.cap(0.1, 0.24, 4), orange, 0, -0.2, 0);
    return a;
  };
  const armL = mkArm(1);
  const armR = mkArm(-1);

  const head = grp(model, 0, 0.78, 0);
  const face = new Face();
  eyePair(env, face, head, 0.25, 0.2, 0.56, 0.17, { white: '#ffffff', pupil: '#241b3a', pr: 0.58, py: 0.05 });
  face.setMouth(makeMouth(env, head, 0, -0.07, 0.62, 0.12, 0.06), 0.4);
  const pink = env.m(accent);
  for (const s of [1, -1]) mk(head, G.sph(0.1, 10, 8), pink, 0.43 * s, -0.02, 0.48, 1, 0.7, 0.4);
  const ants: THREE.Group[] = [];
  for (const s of [1, -1]) {
    const a = grp(head, 0.2 * s, 0.6, 0);
    mk(a, G.cyl(0.032, 0.04, 0.42, 6), orange, 0, 0.21, 0);
    mk(a, G.sph(0.105, 10, 8), pink, 0, 0.47, 0);
    ants.push(a);
  }
  const hatAnchor = grp(head, 0, 0.58, -0.02);

  const style: Style = {
    gait: 'hop',
    idle: 'bounce',
    walkF: 1.5,
    runMul: 1.35,
    jumpH: 1.1,
    squash: 1.0,
    arms: 1,
    dance: { bounce: 1.6, sway: 1, spin: 1, speed: 1.1 },
  };
  const k = fitModel(model, 1.7, true);
  return {
    model,
    head,
    armL,
    armR,
    legL,
    legR,
    face,
    hatAnchor,
    hatScale: 0.95 * 1,
    headY: 0.78 * k,
    shadow: 0.72,
    height: 1.7,
    ground: true,
    style,
    extra(c) {
      ants.forEach((a, i) => {
        const s = i === 0 ? 1 : -1;
        a.rotation.z = s * (0.32 + 0.1 * sin(c.t * 3.1 + i * 2)) + c.jl * 0.2;
        a.rotation.x = -c.j * 0.7 + 0.12 * sin(c.t * 2.3 + i);
      });
    },
  };
}

/** Brumm – kantig-breiter Moosgolem mit Pflanzen */
export function buildBrumm(env: Env): Parts {
  const { primary, secondary, accent } = env.def.colors;
  const model = new THREE.Group();
  const stone = env.m(secondary);
  const stoneLight = env.m(lighten(secondary, 0.14));
  const moss = env.m(primary);
  const mossDark = env.m(darken(primary, 0.25));
  const lime = env.glow(accent);

  const mkLeg = (s: number): THREE.Group => {
    const l = grp(model, 0.3 * s, 0.52, 0);
    mk(l, G.rbox(0.36, 0.46, 0.4, 0.06), stone, 0, -0.22, 0);
    mk(l, G.rbox(0.44, 0.14, 0.54, 0.05), mossDark, 0, -0.45, 0.06);
    return l;
  };
  const legL = mkLeg(1);
  const legR = mkLeg(-1);
  mk(model, G.rbox(1.15, 0.95, 0.85, 0.14), stone, 0, 1.0, 0);
  mk(model, G.rbox(1.2, 0.2, 0.9, 0.08), moss, 0, 0.62, 0);
  const rune = mk(model, G.octa(0.12), lime, 0, 1.02, 0.44, 1, 1.4, 0.4);
  void rune;

  const mkArm = (s: number): THREE.Group => {
    const a = grp(model, 0.82 * s, 1.34, 0);
    mk(a, G.rbox(0.34, 0.62, 0.36, 0.08), stone, 0, -0.3, 0);
    mk(a, G.rbox(0.48, 0.42, 0.48, 0.1), stoneLight, 0, -0.78, 0.02);
    return a;
  };
  const armL = mkArm(1);
  const armR = mkArm(-1);
  // Moos auf den Schultern
  for (const s of [1, -1]) mk(model, G.sph(0.22, 12, 8), moss, 0.68 * s, 1.47, 0, 1.1, 0.5, 1.1);

  const HY = 1.45;
  const head = grp(model, 0, HY, 0);
  mk(head, G.rbox(0.92, 0.74, 0.7, 0.14), stoneLight, 0, 1.78 - HY, 0.05);
  mk(head, G.rbox(0.96, 0.12, 0.22, 0.05), stone, 0, 1.94 - HY, 0.36);
  const face = new Face();
  for (const s of [1, -1])
    face.eyes.push(makeGlowEye(head, lime, 0.22 * s, 1.78 - HY, 0.405, 0.115, 1, 1.15));
  face.setMouth(makeMouth(env, head, 0, 1.6 - HY, 0.405, 0.16, 0.045, '#143d3b'), 0.5);
  for (const [x, z, sc] of [
    [0.25, 0.0, 0.2],
    [-0.25, 0.02, 0.18],
    [0, -0.16, 0.2],
  ] as const)
    mk(head, G.sph(sc, 12, 8), moss, x, 2.13 - HY, z, 1, 0.5, 1);
  const grass = grp(head, 0, 2.15 - HY, 0);
  const tufts: Array<[number, number, number]> = [
    [-0.05, 0.12, 0.2],
    [0.1, 0.1, -0.2],
    [-0.18, 0.05, -0.28],
  ];
  for (const [x, z, rz] of tufts) {
    const c = mk(grass, G.cone(0.045, 0.32, 6), moss, x, 0.14, z);
    c.rotation.z = rz;
  }
  // Pilz auf der linken, Blume auf der rechten Schulter
  mk(model, G.cyl(0.05, 0.06, 0.2, 8), env.m('#f4ecd8'), 0.7, 1.65, -0.05);
  mk(model, G.sph(0.14, 12, 8), env.m('#e4572e'), 0.7, 1.76, -0.05, 1.1, 0.65, 1.1);
  const flower = grp(model, -0.65, 1.6, 0);
  mk(flower, G.cyl(0.02, 0.025, 0.34, 6), mossDark, 0, 0.17, 0);
  mk(flower, G.sph(0.1, 10, 8), env.m('#ff8fab'), 0, 0.37, 0);

  const hatAnchor = grp(head, 0, 2.1 - HY - 0.02, 0.0);
  const style: Style = {
    gait: 'stomp',
    idle: 'heavy',
    walkF: 0.95,
    runMul: 1.5,
    jumpH: 0.5,
    squash: 0.45,
    arms: 1,
    dance: { bounce: 0.7, sway: 0.8, spin: 0.7, speed: 0.75 },
  };
  const k = fitModel(model, 1.95, true);
  return {
    model,
    head,
    armL,
    armR,
    legL,
    legR,
    face,
    hatAnchor,
    hatScale: 0.8,
    hatHide: [],
    headY: 1.7 * k,
    shadow: 0.95,
    height: 1.95,
    ground: true,
    style,
    extra(c) {
      flower.rotation.z = 0.12 * sin(c.t * 1.7) + c.jl * 0.3;
      flower.rotation.x = -c.j * 0.5;
      grass.rotation.z = 0.06 * sin(c.t * 2.1);
      grass.rotation.x = -c.j * 0.3;
    },
  };
}

/** Lumi – schlanke Laternenqualle mit leuchtendem Kopf und Tentakeln */
export function buildLumi(env: Env): Parts {
  const { primary, secondary, accent } = env.def.colors;
  const model = new THREE.Group();
  const HY = 1.45;
  const head = grp(model, 0, HY, 0);
  mk(head, G.sph(0.56, 24, 16), env.glass(primary, 0.74, secondary, 0.55), 0, 0, 0, 1, 0.92, 1).renderOrder =
    2;
  const core = mk(head, G.sph(0.3, 16, 12), env.glow('#f6feff'), 0, -0.02, -0.02);
  mk(head, G.tor(0.4, 0.05, 8, 28), env.m(lighten(primary, 0.35)), 0, -0.5, 0).rotation.x = Math.PI / 2;
  mk(head, G.tor(0.16, 0.03, 8, 20), env.m('#e8c170'), 0, 0.64, 0);
  mk(head, G.cyl(0.13, 0.17, 0.1, 12), env.m('#e8c170'), 0, 0.52, 0);

  const face = new Face();
  eyePair(env, face, head, 0.2, 0.0, 0.5, 0.11, {
    pupil: '#ffffff',
    pr: 0.3,
    px: 0.25,
    py: 0.3,
    flat: 0.5,
    aspect: 1.25,
  });
  face.setMouth(makeMouth(env, head, 0, -0.17, 0.52, 0.07, 0.035, '#27506a'), 0.5);
  const cheek = env.m(accent);
  for (const s of [1, -1]) mk(head, G.sph(0.07, 8, 6), cheek, 0.33 * s, -0.1, 0.4, 1, 0.7, 0.4);

  mk(model, G.cyl(0.38, 0.2, 0.34, 14), env.m(lighten(primary, 0.2)), 0, 0.86, 0);

  const tents: Array<{ a: THREE.Group; b: THREE.Group; ph: number; ang: number }> = [];
  const tm1 = env.m(lighten(primary, 0.1));
  const tm2 = env.m(lighten(primary, 0.45));
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    const a = grp(model, Math.sin(ang) * 0.24, 0.74, Math.cos(ang) * 0.24);
    mk(a, G.cap(0.065, 0.34, 4), tm1, 0, -0.23, 0);
    const b = grp(a, 0, -0.44, 0);
    mk(b, G.cap(0.048, 0.3, 4), tm2, 0, -0.2, 0);
    tents.push({ a, b, ph: i * 1.3, ang });
  }
  const mkArm = (s: number): THREE.Group => {
    const a = grp(model, 0.38 * s, 1.04, 0.05);
    mk(a, G.cap(0.045, 0.28, 4), tm1, 0, -0.17, 0);
    const b = grp(a, 0, -0.33, 0);
    mk(b, G.cap(0.038, 0.22, 4), tm1, 0, -0.14, 0);
    mk(b, G.sph(0.075, 8, 6), env.glow('#fff6c8'), 0, -0.3, 0);
    return a;
  };
  const armL = mkArm(1);
  const armR = mkArm(-1);
  const armBits = [armL.children[1] as THREE.Group, armR.children[1] as THREE.Group];
  const motes = [0, 1].map(() => mk(model, G.sph(0.055, 8, 6), env.glow('#e6fbff'), 0, 1.2, 0));

  const hatAnchor = grp(head, 0, 0.5, 0);
  const style: Style = {
    gait: 'glide',
    idle: 'float',
    walkF: 0.9,
    runMul: 1.6,
    jumpH: 0.9,
    squash: 0.8,
    arms: 1,
    dance: { bounce: 0.6, sway: 1.2, spin: 2, speed: 0.8 },
  };
  const k = fitModel(model, 1.9, true);
  return {
    model,
    head,
    armL,
    armR,
    legL: null,
    legR: null,
    face,
    hatAnchor,
    hatScale: 0.75,
    headY: HY * k,
    shadow: 0.7,
    height: 1.9,
    ground: true,
    style,
    extra(c) {
      const mv = c.pose.move ?? 0;
      core.scale.setScalar(1 + 0.07 * sin(c.t * 3) + 0.05 * (c.pose.glow ?? 0));
      for (const t of tents) {
        const w = sin(c.t * 2.4 - t.ph);
        const amp = 0.3 + 0.2 * Math.min(1.8, mv);
        t.a.rotation.x = Math.cos(t.ang) * 0.12 + (0.25 * mv + c.j * 0.35) + w * amp * 0.6;
        t.a.rotation.z = -Math.sin(t.ang) * 0.12 + w * amp * 0.4;
        t.b.rotation.x = 0.3 * mv + sin(c.t * 2.4 - t.ph - 1) * amp;
        t.b.rotation.z = 0.2 * sin(c.t * 1.7 - t.ph);
      }
      armBits.forEach((b, i) => {
        b.rotation.x = 0.35 + 0.35 * sin(c.t * 2.6 + i * 1.7) + c.j * 0.3;
        b.rotation.z = (i === 0 ? 1 : -1) * 0.25 * sin(c.t * 2 + i);
      });
      motes.forEach((m, i) => {
        const a = c.t * (0.9 + i * 0.3) + i * 3.1;
        m.position.set(Math.sin(a) * 0.85, 1.35 + 0.35 * sin(c.t * 1.3 + i * 2), Math.cos(a) * 0.85);
        m.scale.setScalar(0.8 + 0.4 * sin(c.t * 4 + i));
      });
    },
  };
}

/** Zapp – Blitzfuchs: spitze Ohren, Zackenschweif, Blitzzeichnung */
export function buildZapp(env: Env): Parts {
  const { primary, secondary, accent } = env.def.colors;
  const model = new THREE.Group();
  const orange = env.m(primary);
  const dark = env.m(darken(primary, 0.6));
  const cream = env.m(lighten(secondary, 0.55));
  const blue = env.glow(accent);

  const mkLeg = (s: number): THREE.Group => {
    const l = grp(model, 0.2 * s, 0.52, 0);
    mk(l, G.cap(0.09, 0.3, 4), orange, 0, -0.22, 0);
    mk(l, G.sph(0.12, 10, 8), dark, 0, -0.5, 0.07, 1, 0.6, 1.5);
    return l;
  };
  const legL = mkLeg(1);
  const legR = mkLeg(-1);
  mk(model, G.sph(0.5, 18, 14), orange, 0, 0.98, 0, 1.0, 1.05, 0.85);
  mk(model, G.sph(0.38, 14, 10), cream, 0, 0.92, 0.26, 0.9, 1, 0.55);
  for (const s of [1, -1]) {
    const b = mk(model, boltGeo(), blue, 0.435 * s, 1.0, 0, 0.5, 0.5, 0.3);
    b.rotation.y = s > 0 ? Math.PI / 2 : -Math.PI / 2;
  }

  const HY = 1.62;
  const head = grp(model, 0, HY, 0.05);
  mk(head, G.sph(0.46, 20, 14), orange, 0, 0, 0, 1.22, 0.95, 1.05);
  for (const s of [1, -1]) {
    const c = mk(head, G.cone(0.17, 0.36, 8), cream, 0.5 * s, -0.12, 0.0);
    c.rotation.set(0, 0.7 * s, (-s * Math.PI) / 2);
  }
  const sn = mk(head, G.cone(0.2, 0.46, 12), cream, 0, -0.1, 0.5);
  sn.rotation.x = Math.PI / 2;
  mk(head, G.sph(0.075, 8, 6), env.m('#2a1a22'), 0, -0.05, 0.73);
  const face = new Face();
  eyePair(env, face, head, 0.2, 0.1, 0.38, 0.105, {
    white: '#ffffff',
    pupil: '#16213e',
    pr: 0.6,
    py: -0.05,
    rz: 0.3,
    aspect: 1.0,
  });
  face.setMouth(makeMouth(env, head, 0, -0.2, 0.52, 0.07, 0.03, '#40131e'), 0.4);
  const bolt = mk(head, boltGeo(), blue, 0, 0.34, 0.37, 0.28, 0.28, 0.3);
  bolt.rotation.x = -0.5;
  const earMats = [orange, dark];
  for (const s of [1, -1]) {
    const e = mk(head, G.cone(0.17, 0.52, 10), earMats[0], 0.3 * s, 0.56, -0.06);
    e.rotation.z = -s * 0.22;
    const e2 = mk(head, G.cone(0.095, 0.36, 8), earMats[1], 0.3 * s, 0.5, 0.0);
    e2.rotation.z = -s * 0.22;
  }

  const mkArm = (s: number): THREE.Group => {
    const a = grp(model, 0.52 * s, 1.3, 0);
    mk(a, G.cap(0.075, 0.3, 4), orange, 0, -0.2, 0);
    mk(a, G.sph(0.1, 8, 6), dark, 0, -0.42, 0.02);
    return a;
  };
  const armL = mkArm(1);
  const armR = mkArm(-1);

  // Zackenschweif
  const tail = grp(model, 0, 0.72, -0.4);
  tail.rotation.x = -0.5;
  const segs: THREE.Group[] = [];
  let parent: THREE.Group = tail;
  const tcols = [orange, env.m(secondary), orange, blue];
  for (let i = 0; i < 4; i++) {
    const sgrp = grp(parent, 0, i === 0 ? 0 : 0.62 * Math.pow(0.88, i - 1), 0);
    const sc = Math.pow(0.88, i);
    mk(sgrp, G.cone(0.22 * sc, 0.74 * sc, 8), tcols[i], 0, 0.3 * sc, 0);
    sgrp.userData.base = (i % 2 ? -1 : 1) * 0.95;
    segs.push(sgrp);
    parent = sgrp;
  }

  const hatAnchor = grp(head, 0, 0.4, -0.06);
  const style: Style = {
    gait: 'sprint',
    idle: 'jitter',
    walkF: 2.0,
    runMul: 1.5,
    jumpH: 1.0,
    squash: 1,
    arms: 1,
    dance: { bounce: 1.3, sway: 1.1, spin: 1.2, speed: 1.4 },
  };
  const k = fitModel(model, 1.85, true);
  return {
    model,
    head,
    armL,
    armR,
    legL,
    legR,
    face,
    hatAnchor,
    hatScale: 0.7,
    headY: HY * k,
    shadow: 0.75,
    height: 1.85,
    ground: true,
    style,
    extra(c) {
      const mv = c.pose.move ?? 0;
      tail.rotation.z = 0.2 * sin(c.t * 3.6) * (0.5 + mv) + c.jl * 0.4;
      tail.rotation.x = -0.5 + c.j * 0.25 - 0.18 * Math.min(1.8, mv);
      segs.forEach((s, i) => {
        s.rotation.z = (s.userData.base as number) + 0.14 * sin(c.t * 6 - i * 0.9) * (0.6 + mv);
      });
    },
  };
}
