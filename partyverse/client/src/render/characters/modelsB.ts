import * as THREE from 'three';
import {
  Face,
  G,
  darken,
  eyePair,
  fitModel,
  grp,
  lighten,
  makeEye,
  makeGlowEye,
  makeMouth,
  mixColor,
  mk,
  shellGeo,
  starGeo,
  type Env,
  type Parts,
  type Style,
} from './kit';

const sin = Math.sin;

/** Mokka – Tüftelmaulwurf mit Schutzbrille und Grabklauen */
export function buildMokka(env: Env): Parts {
  const { primary, secondary, accent } = env.def.colors;
  const model = new THREE.Group();
  const brown = env.m(primary);
  const dark = env.m(secondary);
  const sand = env.m(lighten(primary, 0.42));
  const cream = env.m('#f4ecd8');

  const mkLeg = (s: number): THREE.Group => {
    const l = grp(model, 0.28 * s, 0.46, 0);
    mk(l, G.cyl(0.13, 0.15, 0.36, 10), dark, 0, -0.18, 0);
    mk(l, G.sph(0.17, 12, 8), dark, 0, -0.4, 0.08, 1, 0.55, 1.45);
    return l;
  };
  const legL = mkLeg(1);
  const legR = mkLeg(-1);
  mk(model, G.sph(0.62, 22, 16), brown, 0, 0.98, 0, 1, 1.05, 0.95);
  mk(model, G.sph(0.46, 16, 12), sand, 0, 0.88, 0.32, 1, 1, 0.6);
  const tail = mk(model, G.sph(0.1, 8, 6), dark, 0, 0.55, -0.58);
  void tail;
  const cog = mk(model, G.cyl(0.24, 0.24, 0.09, 8), env.m(accent), 0, 1.08, -0.63);
  cog.rotation.x = Math.PI / 2;

  const HY = 1.6;
  const head = grp(model, 0, HY, 0.1);
  mk(head, G.sph(0.46, 20, 14), brown, 0, 0, 0, 1, 0.92, 1.05);
  const sn = mk(head, G.cone(0.21, 0.55, 12), env.m(lighten(primary, 0.3)), 0, -0.1, 0.46);
  sn.rotation.x = Math.PI / 2;
  mk(head, G.sph(0.105, 10, 8), env.m('#ff8fa3'), 0, -0.07, 0.74);
  for (const s of [1, -1]) mk(head, G.sph(0.09, 8, 6), dark, 0.36 * s, 0.3, -0.12);
  const face = new Face();
  eyePair(env, face, head, 0.2, 0.14, 0.37, 0.07);
  face.setMouth(makeMouth(env, head, 0, -0.29, 0.36, 0.1, 0.035, '#3a1830'), 0.5);
  const brass = env.m(accent);
  const lens = env.glow('#bff3ff', 0.5);
  for (const s of [1, -1]) {
    const r = mk(head, G.tor(0.17, 0.05, 8, 20), brass, 0.2 * s, 0.14, 0.4);
    r.rotation.y = 0.3 * s;
    const l = mk(head, G.sph(0.15, 12, 8), lens, 0.2 * s, 0.14, 0.4, 1, 1, 0.3);
    l.rotation.y = 0.3 * s;
  }
  const strap = mk(head, G.tor(0.47, 0.04, 6, 26), env.m('#3d2a1c'), 0, 0.12, 0, 1, 1.05, 1);
  strap.rotation.x = Math.PI / 2;
  strap.scale.set(1, 1.08, 1);

  const claw = cream;
  const mkArm = (s: number): THREE.Group => {
    const a = grp(model, 0.72 * s, 1.14, 0.05);
    mk(a, G.cap(0.17, 0.3, 4), brown, 0, -0.3, 0);
    const paw = grp(a, 0, -0.68, 0.06);
    mk(paw, G.sph(0.24, 12, 8), sand, 0, 0, 0, 1, 0.8, 1);
    for (const x of [-0.11, 0, 0.11]) {
      const c = mk(paw, G.cone(0.045, 0.26, 6), claw, x, -0.12, 0.2);
      c.rotation.x = Math.PI - 0.64;
    }
    return a;
  };
  const armL = mkArm(1);
  const armR = mkArm(-1);

  const hatAnchor = grp(head, 0, 0.4, -0.02);
  const style: Style = {
    gait: 'waddle',
    idle: 'sniff',
    walkF: 1.35,
    runMul: 1.5,
    jumpH: 0.7,
    squash: 0.9,
    arms: 1,
    dance: { bounce: 0.9, sway: 1.3, spin: 1, speed: 0.95 },
  };
  const k = fitModel(model, 1.65, true);
  return {
    model,
    head,
    armL,
    armR,
    legL,
    legR,
    face,
    hatAnchor,
    hatScale: 0.85,
    headY: HY * k,
    shadow: 0.8,
    height: 1.65,
    ground: true,
    style,
    extra(c) {
      const mv = c.pose.move ?? 0;
      cog.rotation.z += c.dt * (0.8 + mv * 2.5);
    },
  };
}

/** Quirl – Spiralschnecke mit Hexenhut */
export function buildQuirl(env: Env): Parts {
  const { primary, secondary, accent } = env.def.colors;
  const model = new THREE.Group();
  const flesh = env.m(mixColor(accent, primary, 0.3));
  const fleshDark = env.m(mixColor(accent, primary, 0.5));
  const hatMat = env.m(secondary);

  mk(model, G.sph(0.5, 18, 10), fleshDark, 0, 0.14, 0.05, 0.9, 0.24, 1.35);
  const neck = mk(model, G.cap(0.27, 0.6, 5), flesh, 0, 0.75, 0.08);
  neck.rotation.x = -0.12;
  const shell = mk(
    model,
    shellGeo(mixColor(secondary, secondary, 0), mixColor(primary, 0xffffff, 0.15)),
    env.vertex(),
    0,
    1.0,
    -0.5,
    1.45,
    1.45,
    1.45,
  );
  shell.rotation.set(0.1, Math.PI / 2, 0);

  const HY = 1.4;
  const head = grp(model, 0, HY, 0.14);
  mk(head, G.sph(0.4, 20, 14), flesh, 0, 0, 0, 1, 0.95, 1);
  const face = new Face();
  const stalks: THREE.Group[] = [];
  for (const s of [1, -1]) {
    const st = grp(head, 0.17 * s, 0.1, 0.28);
    st.rotation.set(1.0, 0, -s * 0.28);
    mk(st, G.cyl(0.035, 0.045, 0.34, 6), flesh, 0, 0.17, 0);
    const e = makeEye(env, st, 0, 0.38, 0.0, 0.14, {
      white: '#ffffff',
      pupil: '#241b3a',
      pr: 0.6,
      py: 0.0,
      flat: 1.0,
    });
    e.g.rotation.x = -1.0;
    e.g.position.set(0, 0.38, 0.0);
    face.eyes.push(e);
    stalks.push(st);
  }
  face.setMouth(makeMouth(env, head, 0, -0.17, 0.37, 0.09, 0.045), 0.5);
  const cheek = env.m('#ff9ec9');
  for (const s of [1, -1]) mk(head, G.sph(0.07, 8, 6), cheek, 0.26 * s, -0.11, 0.3, 1, 0.7, 0.4);

  const witch = grp(head, 0, 0.3, -0.08);
  witch.rotation.x = -0.3;
  mk(witch, G.cyl(0.52, 0.52, 0.05, 20), hatMat, 0, 0, 0);
  mk(witch, G.cone(0.36, 0.62, 16), hatMat, 0, 0.33, 0);
  const tip = mk(witch, G.cone(0.15, 0.36, 10), hatMat, 0, 0.7, -0.1);
  tip.rotation.x = -0.65;
  const band = mk(witch, G.tor(0.31, 0.05, 6, 20), env.m(accent), 0, 0.1, 0);
  band.rotation.x = Math.PI / 2;
  const emblem = mk(witch, starGeo(), env.glow('#ffe066'), 0, 0.3, 0.3, 0.2, 0.2, 0.3);
  emblem.rotation.x = -0.28;
  const sparks = [0, 1].map(() => mk(model, starGeo(), env.glow(accent), 0, 2, 0, 0.14, 0.14, 0.14));

  const mkArm = (s: number): THREE.Group => {
    const a = grp(model, 0.3 * s, 1.02, 0.2);
    mk(a, G.cap(0.06, 0.2, 4), flesh, 0, -0.14, 0);
    mk(a, G.sph(0.09, 8, 6), flesh, 0, -0.3, 0);
    return a;
  };
  const armL = mkArm(1);
  const armR = mkArm(-1);

  const hatAnchor = grp(head, 0, 0.33, -0.02);
  const style: Style = {
    gait: 'slither',
    idle: 'sway',
    walkF: 1.1,
    runMul: 1.6,
    jumpH: 0.8,
    squash: 1.1,
    arms: 1,
    dance: { bounce: 0.8, sway: 1.5, spin: 2, speed: 0.9 },
  };
  const k = fitModel(model, 2.0, true);
  return {
    model,
    head,
    armL,
    armR,
    legL: null,
    legR: null,
    face,
    hatAnchor,
    hatScale: 0.9,
    hatHide: [witch],
    headY: HY * k,
    shadow: 0.85,
    height: 2.0,
    ground: true,
    style,
    extra(c) {
      stalks.forEach((s, i) => {
        const sg = i === 0 ? 1 : -1;
        s.rotation.z = -sg * (0.28 + 0.1 * sin(c.t * 2.2 + i * 1.7)) + c.jl * 0.2;
        s.rotation.x = 1.0 - c.j * 0.5 + 0.15 * sin(c.t * 1.7 + i * 2.1);
      });
      shell.rotation.z = 0.04 * sin(c.t * 1.4) + c.jl * 0.1;
      witch.rotation.z = c.jl * 0.15 + 0.02 * sin(c.t * 1.5);
      tip.rotation.x = -0.65 - c.j * 0.5 + 0.1 * sin(c.t * 2.6);
      sparks.forEach((sp, i) => {
        const a = c.t * 1.1 + i * Math.PI;
        sp.position.set(Math.sin(a) * 0.62, 1.75 + 0.25 * sin(c.t * 1.9 + i), Math.cos(a) * 0.62 - 0.1);
        sp.rotation.z = c.t * 2;
        sp.scale.setScalar(0.12 + 0.05 * sin(c.t * 4 + i));
      });
    },
  };
}

/** Flora – Blütenwicht: Blütenblätter-Kopf, Blattarme */
export function buildFlora(env: Env): Parts {
  const { primary, secondary, accent } = env.def.colors;
  const model = new THREE.Group();
  const green = env.m('#4fb057');
  const leaf = env.m('#86d36b');

  const mkLeg = (s: number): THREE.Group => {
    const l = grp(model, 0.14 * s, 0.52, 0);
    mk(l, G.cyl(0.045, 0.05, 0.4, 6), green, 0, -0.2, 0);
    mk(l, G.sph(0.1, 10, 8), env.m(accent), 0, -0.44, 0.05, 1, 0.6, 1.5);
    return l;
  };
  const legL = mkLeg(1);
  const legR = mkLeg(-1);
  mk(model, G.cyl(0.2, 0.5, 0.58, 18), env.m(secondary), 0, 0.8, 0);
  mk(model, G.cyl(0.055, 0.065, 0.3, 8), green, 0, 1.22, 0);

  const HY = 1.55;
  const head = grp(model, 0, HY, 0.04);
  mk(head, G.sph(0.36, 20, 14), env.m(lighten(accent, 0.25)), 0, 0, 0, 1, 1, 0.72);
  const petalsA = env.m(primary);
  const petalsB = env.m(lighten(primary, 0.22));
  const petals: THREE.Group[] = [];
  const N = 8;
  for (let i = 0; i < N; i++) {
    const g = grp(head, 0, 0, 0);
    g.rotation.z = (i / N) * Math.PI * 2;
    mk(g, G.sph(0.2, 12, 8), i % 2 ? petalsB : petalsA, 0, 0.5, i % 2 ? -0.1 : -0.04, 0.85, 1.5, 0.35);
    petals.push(g);
  }
  const face = new Face();
  eyePair(env, face, head, 0.135, 0.06, 0.23, 0.07, {
    white: '#ffffff',
    pupil: '#241b3a',
    pr: 0.62,
    py: 0.0,
  });
  face.setMouth(makeMouth(env, head, 0, -0.1, 0.245, 0.08, 0.035), 0.5);
  const blush = env.m('#ff8fb1');
  for (const s of [1, -1]) mk(head, G.sph(0.06, 8, 6), blush, 0.23 * s, -0.04, 0.2, 1, 0.7, 0.4);

  const mkArm = (s: number): THREE.Group => {
    const a = grp(model, 0.3 * s, 1.1, 0.02);
    mk(a, G.cyl(0.03, 0.035, 0.34, 6), green, 0, -0.17, 0);
    mk(a, G.sph(0.1, 10, 8), leaf, 0, -0.44, 0, 1, 2.1, 0.32);
    return a;
  };
  const armL = mkArm(1);
  const armR = mkArm(-1);
  const pollen = [0, 1, 2].map(() => mk(model, G.sph(0.045, 6, 5), env.glow('#fff3a0'), 0, 2, 0));

  const hatAnchor = grp(head, 0, 0.58, 0.0);
  const style: Style = {
    gait: 'skip',
    idle: 'sway',
    walkF: 1.55,
    runMul: 1.4,
    jumpH: 1.0,
    squash: 0.9,
    arms: 1,
    dance: { bounce: 1.2, sway: 1.4, spin: 1.5, speed: 1.0 },
  };
  const k = fitModel(model, 1.9, true);
  return {
    model,
    head,
    armL,
    armR,
    legL,
    legR,
    face,
    hatAnchor,
    hatScale: 0.68,
    headY: HY * k,
    shadow: 0.7,
    height: 1.9,
    ground: true,
    style,
    extra(c) {
      const open = Math.max(0, c.pose.mouth ?? 0);
      petals.forEach((p, i) => {
        const w = 1 + 0.06 * sin(c.t * 2 + i * 0.8) + 0.12 * open - c.j * 0.05;
        p.scale.set(1, w, 1);
        p.rotation.z = (i / N) * Math.PI * 2 + 0.04 * sin(c.t * 1.5 + i) + c.jl * 0.05;
      });
      pollen.forEach((m, i) => {
        const a = c.t * (0.8 + i * 0.25) + i * 2.1;
        m.position.set(Math.sin(a) * 0.8, 1.55 + 0.4 * sin(c.t * 1.2 + i * 2) + 0.1, Math.cos(a) * 0.8);
      });
    },
  };
}

/** Vex – Würfelgeist: Würfelkopf mit sechs Augenpunkten, schwebende Hände */
export function buildVex(env: Env): Parts {
  const { primary, secondary, accent } = env.def.colors;
  const model = new THREE.Group();
  const HY = 1.38;
  const head = grp(model, 0, HY, 0);
  mk(head, G.rbox(0.94, 0.94, 0.94, 0.13, 3), env.m(primary), 0, 0, 0);
  mk(head, G.rbox(0.74, 0.74, 0.06, 0.05, 2), env.m('#2b3036'), 0, 0, 0.465);
  const dotMat = env.glow(accent);
  const face = new Face();
  for (const x of [-0.17, 0.17])
    for (const y of [0.22, 0, -0.22]) face.eyes.push(makeGlowEye(head, dotMat, x, y, 0.5, 0.075));
  const pipMat = env.m('#3a4047');
  const pips: Array<[number, number, number]> = [
    [1, -0.2, 0.2],
    [1, 0, 0],
    [1, 0.2, -0.2],
    [-1, -0.18, 0.18],
    [-1, 0.18, -0.18],
  ];
  for (const [s, z, y] of pips) mk(head, G.sph(0.065, 8, 6), pipMat, 0.47 * s, y, z, 0.35, 1, 1);
  const halo = mk(head, G.tor(0.62, 0.03, 6, 36), env.glow(accent, 0.9), 0, -0.62, 0);
  halo.rotation.x = Math.PI / 2 + 0.12;

  const cubes: THREE.Mesh[] = [];
  const cubeSizes = [0.4, 0.29, 0.2];
  const cubeMats = [env.m(secondary), env.m(darken(primary, 0.35)), env.glow(accent)];
  cubeSizes.forEach((sz, i) =>
    cubes.push(mk(model, G.rbox(sz, sz, sz, sz * 0.18, 2), cubeMats[i], 0, [0.56, 0.33, 0.17][i], -0.03)),
  );

  const mkHand = (s: number): THREE.Group => {
    const a = grp(model, 0.16 * s, 1.0, 0);
    const hand = grp(a, 0.82 * s, -0.05, 0.14);
    mk(hand, G.rbox(0.27, 0.23, 0.15, 0.06, 2), env.m(lighten(primary, 0.15)), 0, 0, 0);
    mk(hand, G.sph(0.07, 8, 6), env.m(lighten(primary, 0.15)), 0.0, 0.11, 0.07);
    const cuff = mk(hand, G.tor(0.13, 0.02, 6, 16), env.glow(accent), -0.17 * s, 0, 0);
    cuff.rotation.y = Math.PI / 2;
    return a;
  };
  const armL = mkHand(1);
  const armR = mkHand(-1);
  const dust = [0, 1, 2].map(() => mk(model, G.box(0.07, 0.07, 0.07), env.glow(accent), 0, 1, 0));

  const hatAnchor = grp(head, 0, 0.45, 0);
  const style: Style = {
    gait: 'float',
    idle: 'hover',
    walkF: 1.0,
    runMul: 1.6,
    jumpH: 0.65,
    squash: 0.15,
    arms: 1,
    dance: { bounce: 0.8, sway: 0.9, spin: 1.2, speed: 1.0 },
  };
  const k = fitModel(model, 1.8, false);
  return {
    model,
    head,
    armL,
    armR,
    legL: null,
    legR: null,
    face,
    hatAnchor,
    hatScale: 0.95,
    headY: HY * k,
    shadow: 0.62,
    height: 1.8,
    ground: false,
    style,
    extra(c) {
      const mv = c.pose.move ?? 0;
      halo.rotation.z += c.dt * (1.2 + mv);
      halo.rotation.x = Math.PI / 2 + 0.12 + 0.08 * sin(c.t * 1.3);
      cubes.forEach((m, i) => {
        m.rotation.y = c.t * (0.9 + i * 0.5) * (i % 2 ? -1 : 1);
        m.rotation.x = 0.35 * sin(c.t * 1.4 + i) - c.j * 0.2;
        m.position.y = [0.56, 0.33, 0.17][i] + 0.04 * sin(c.t * 2.2 + i * 1.3) - c.j * 0.05 * i;
      });
      dust.forEach((m, i) => {
        const a = c.t * (1.0 + i * 0.4) + i * 2.1;
        m.position.set(Math.sin(a) * 0.9, 0.9 + 0.5 * sin(c.t * 1.1 + i * 2) + 0.2, Math.cos(a) * 0.9);
        m.rotation.set(c.t * 2, c.t * 1.5, 0);
      });
    },
  };
}
