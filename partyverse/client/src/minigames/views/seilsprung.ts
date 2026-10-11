import * as THREE from 'three';
import { multiplier, type RopeState } from '@shared/minigames/games/seilsprung';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';

/** Seilspringen: Spielplatz im Sonnenschein, zwei Bären schwingen das Seil, ein Pinguin springt. Seil kommt von hinten über den Kopf. */
export const createView: MiniGameViewFactory<RopeState> = (ctx) => {
  const { root, camera, scene } = ctx;
  scene.background = new THREE.Color(0x8fdcff);
  scene.fog = new THREE.Fog(0xc4ecff, 30, 80);
  const sphere = new THREE.SphereGeometry(1, 16, 12);
  const HX = 3.7; // Griffposition
  const HY = 1.2;
  const R = 1.2; // Seilradius (Mitte unten = Boden)

  // ---------- Umgebung ----------
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), glow(0xe9b96e));
  floor.rotation.x = -Math.PI / 2;
  root.add(floor);
  for (let i = -5; i <= 5; i++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(40, 0.01, 0.06), glow(0xc8934d));
    line.position.set(0, 0.006, i * 1.5);
    root.add(line);
  }
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(200, 80), glow(0x6fd36a));
  grass.rotation.x = -Math.PI / 2;
  grass.position.set(0, -0.02, -45);
  root.add(grass);
  const hillMat = glow(0x58c75a);
  for (let i = 0; i < 7; i++) {
    const h = new THREE.Mesh(sphere, i % 2 ? hillMat : glow(0x7bdc6e));
    h.scale.set(14 + (i % 3) * 4, 5 + (i % 4) * 2, 8);
    h.position.set(-48 + i * 16, -1.5, -34 - (i % 2) * 6);
    root.add(h);
  }
  // Zaun
  const fenceMat = toon(0xffffff);
  for (let i = -9; i <= 9; i++) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.3, 0.12), fenceMat);
    post.position.set(i * 1.2, 0.65, -8);
    root.add(post);
  }
  for (const yy of [0.45, 0.95]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(24, 0.14, 0.1), fenceMat);
    rail.position.set(0, yy, -8);
    root.add(rail);
  }
  // Bäume
  const trunk = toon(0x9a6a3b);
  const leaves = [toon(0x3fbf5a), toon(0x59d36a), toon(0x2fae52)];
  for (let i = 0; i < 8; i++) {
    const x = -22 + i * 6.3 + (i % 2) * 1.5;
    const z = -13 - (i % 3) * 3;
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 3, 8), trunk);
    tr.position.set(x, 1.5, z);
    const crown = new THREE.Mesh(sphere, leaves[i % 3]);
    crown.scale.set(2.2, 2.0, 2.2);
    crown.position.set(x, 4.2, z);
    root.add(tr, crown);
  }
  // Sonne und Wolken
  const sun = new THREE.Mesh(new THREE.CircleGeometry(4, 28), glow(0xfff2a0));
  (sun.material as THREE.MeshBasicMaterial).fog = false;
  sun.position.set(14, 17, -50);
  root.add(sun);
  const cloudMat = glow(0xffffff);
  for (let i = 0; i < 7; i++) {
    const g = new THREE.Group();
    for (let k = 0; k < 3; k++) {
      const m = new THREE.Mesh(sphere, cloudMat);
      m.scale.set(2.2 + k * 0.3, 1.2, 1.1);
      m.position.set((k - 1) * 2.3, k === 1 ? 0.5 : 0, 0);
      g.add(m);
    }
    g.position.set(-30 + i * 10, 12 + (i % 3) * 2.5, -42);
    root.add(g);
  }

  // ---------- Hilfsfunktionen ----------
  const up = new THREE.Vector3(0, 1, 0);
  const dirV = new THREE.Vector3();
  const limb = (m: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3): void => {
    dirV.subVectors(b, a);
    const len = dirV.length();
    m.position.copy(a).addScaledVector(dirV, 0.5);
    m.scale.set(1, len, 1);
    m.quaternion.setFromUnitVectors(up, dirV.divideScalar(Math.max(1e-6, len)));
  };

  // ---------- Bären ----------
  const fur = toon(0xa8693a);
  const furLight = toon(0xe7b98a);
  const dark = toon(0x2b2140);
  const shirt = [toon(0xff4f7d), toon(0x3d8bff)];
  const limbGeo = new THREE.CylinderGeometry(0.14, 0.14, 1, 8);
  interface Bear {
    g: THREE.Group;
    arm: THREE.Mesh;
    hand: THREE.Mesh;
    shoulder: THREE.Vector3;
    handle: THREE.Mesh;
    head: THREE.Group;
  }
  const makeBear = (side: -1 | 1): Bear => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(sphere, shirt[side === -1 ? 0 : 1]);
    body.scale.set(0.78, 0.95, 0.7);
    body.position.y = 0.95;
    const head = new THREE.Group();
    head.position.y = 2.1;
    const skull = new THREE.Mesh(sphere, fur);
    skull.scale.setScalar(0.58);
    const snout = new THREE.Mesh(sphere, furLight);
    snout.scale.set(0.28, 0.22, 0.2);
    snout.position.set(0, -0.12, 0.5);
    const nose = new THREE.Mesh(sphere, dark);
    nose.scale.setScalar(0.07);
    nose.position.set(0, -0.04, 0.68);
    const earA = new THREE.Mesh(sphere, fur);
    earA.scale.setScalar(0.2);
    earA.position.set(-0.42, 0.42, 0);
    const earB = earA.clone();
    earB.position.x = 0.42;
    const eyeA = new THREE.Mesh(sphere, dark);
    eyeA.scale.setScalar(0.07);
    eyeA.position.set(-0.2, 0.12, 0.5);
    const eyeB = eyeA.clone();
    eyeB.position.x = 0.2;
    head.add(skull, snout, nose, earA, earB, eyeA, eyeB);
    const footA = new THREE.Mesh(sphere, fur);
    footA.scale.set(0.3, 0.16, 0.4);
    footA.position.set(-0.3, 0.12, 0.1);
    const footB = footA.clone();
    footB.position.x = 0.3;
    const arm = new THREE.Mesh(limbGeo, fur);
    const hand = new THREE.Mesh(sphere, furLight);
    hand.scale.setScalar(0.2);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8), toon(0xffd23f));
    handle.rotation.z = Math.PI / 2;
    g.add(body, head, footA, footB);
    g.position.set(side * (HX + 0.75), 0, 0);
    g.rotation.y = side === -1 ? 1.1 : -1.1;
    root.add(g, arm, hand, handle);
    return { g, arm, hand, handle, head, shoulder: new THREE.Vector3(side * (HX + 0.75 - 0.45), 1.6, 0) };
  };
  const bears = [makeBear(-1), makeBear(1)];

  // ---------- Seil ----------
  const SEG = 30;
  const ropeMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.055, 0.055, 1, 6), toon(0xffffff), SEG);
  const ca = new THREE.Color(0xff3d6e);
  const cb = new THREE.Color(0xffffff);
  for (let i = 0; i < SEG; i++) ropeMesh.setColorAt(i, Math.floor(i / 2) % 2 ? ca : cb);
  root.add(ropeMesh);
  const ropeShadow = new THREE.Mesh(new THREE.PlaneGeometry(2 * HX, 0.25), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 }));
  ropeShadow.rotation.x = -Math.PI / 2;
  ropeShadow.position.y = 0.02;
  root.add(ropeShadow);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= SEG; i++) pts.push(new THREE.Vector3());
  const m4 = new THREE.Matrix4();
  const qq = new THREE.Quaternion();
  const sc3 = new THREE.Vector3();
  const p3 = new THREE.Vector3();

  // ---------- Pinguin ----------
  const hero = new THREE.Group();
  const inner = new THREE.Group();
  hero.add(inner);
  root.add(hero);
  const navy = toon(0x2a3a7a);
  const belly = toon(0xffffff);
  const orange = toon(0xff9d2e);
  const pBody = new THREE.Mesh(sphere, navy);
  pBody.scale.set(0.6, 0.78, 0.55);
  pBody.position.y = 0.85;
  const pBelly = new THREE.Mesh(sphere, belly);
  pBelly.scale.set(0.44, 0.6, 0.3);
  pBelly.position.set(0, 0.8, 0.28);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 8), orange);
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 1.2, 0.56);
  const eA = new THREE.Mesh(sphere, belly);
  eA.scale.setScalar(0.11);
  eA.position.set(-0.19, 1.3, 0.45);
  const eB = eA.clone();
  eB.position.x = 0.19;
  const pA = new THREE.Mesh(sphere, dark);
  pA.scale.setScalar(0.05);
  pA.position.set(-0.19, 1.3, 0.55);
  const pB = pA.clone();
  pB.position.x = 0.19;
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.36, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon(0xff4f7d));
  cap.position.y = 1.5;
  const bobble = new THREE.Mesh(sphere, belly);
  bobble.scale.setScalar(0.09);
  bobble.position.y = 1.88;
  const flipA = new THREE.Mesh(sphere, navy);
  flipA.scale.set(0.12, 0.38, 0.22);
  flipA.position.set(-0.62, 0.9, 0);
  const flipB = flipA.clone();
  flipB.position.x = 0.62;
  const footA = new THREE.Mesh(sphere, orange);
  footA.scale.set(0.22, 0.08, 0.34);
  footA.position.set(-0.22, 0.06, 0.2);
  const footB = footA.clone();
  footB.position.x = 0.22;
  inner.add(pBody, pBelly, beak, eA, eB, pA, pB, cap, bobble, flipA, flipB, footA, footB);
  const stars = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const st = new THREE.Mesh(new THREE.OctahedronGeometry(0.12), glow(0xffe34d));
    st.position.set(Math.cos((i / 4) * Math.PI * 2) * 0.55, 0, Math.sin((i / 4) * Math.PI * 2) * 0.55);
    stars.add(st);
  }
  stars.position.y = 2.1;
  hero.add(stars);
  const heroShadow = new THREE.Mesh(new THREE.CircleGeometry(0.55, 16), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28 }));
  heroShadow.rotation.x = -Math.PI / 2;
  heroShadow.position.y = 0.03;
  root.add(heroShadow);

  // ---------- Punkte-Popups ----------
  const popups: THREE.Sprite[] = [];
  for (let m = 1; m <= 5; m++) {
    const sp = textSprite(`+${10 * m}`, { color: '#ffffff', bg: ['#4aa8ff', '#2cc57a', '#ff9d2e', '#ff4f7d', '#9a5bff'][m - 1], size: 48, width: 1.5 });
    sp.visible = false;
    root.add(sp);
    popups.push(sp);
  }
  let popupT = 0;
  let popupIdx = 0;

  let t = 0;
  let lastJumps = 0;
  let lastClears = 0;
  let lastHits = 0;
  let squash = 0;
  let wasAir = false;
  const feet = new THREE.Vector3();

  return {
    update(s, dt) {
      t += dt;
      const per = s.turns[s.turn] ?? 96;
      const theta = Math.PI * 2 * (s.u / per);
      const cs = Math.cos(theta);
      const sn = Math.sin(theta);
      // Seil entlang des Bogens
      for (let i = 0; i <= SEG; i++) {
        const f = i / SEG;
        const prof = Math.sin(Math.PI * f);
        pts[i]?.set(-HX + 2 * HX * f, HY + (R * cs) * prof - 0.0, R * sn * prof);
      }
      // Griffe schwingen leicht mit
      pts[0]?.set(-HX, HY + 0.1 * cs, 0.1 * sn);
      pts[SEG]?.set(HX, HY + 0.1 * cs, 0.1 * sn);
      for (let i = 0; i < SEG; i++) {
        const a = pts[i] as THREE.Vector3;
        const b = pts[i + 1] as THREE.Vector3;
        dirV.subVectors(b, a);
        const len = dirV.length();
        p3.copy(a).addScaledVector(dirV, 0.5);
        qq.setFromUnitVectors(up, dirV.divideScalar(Math.max(1e-6, len)));
        sc3.set(1, len * 1.04, 1);
        m4.compose(p3, qq, sc3);
        ropeMesh.setMatrixAt(i, m4);
      }
      ropeMesh.instanceMatrix.needsUpdate = true;
      const zMid = R * sn;
      ropeShadow.position.z = zMid;
      (ropeShadow.material as THREE.MeshBasicMaterial).opacity = 0.12 + 0.18 * Math.max(0, -cs);
      // Bären
      for (let k = 0; k < 2; k++) {
        const b = bears[k] as (typeof bears)[number];
        const side = k === 0 ? -1 : 1;
        const hp = pts[k === 0 ? 0 : SEG] as THREE.Vector3;
        b.handle.position.copy(hp);
        limb(b.arm, b.shoulder, hp);
        b.hand.position.copy(hp);
        b.g.position.y = Math.abs(Math.sin(t * 3 + k)) * 0.04;
        b.head.rotation.z = Math.sin(t * 2.2 + k) * 0.08;
        b.head.rotation.y = -side * 0.35 + Math.sin(t * 1.3) * 0.1;
      }

      // Ereignisse
      feet.set(0, 0.1, 0.3);
      if (s.jumps !== lastJumps) {
        lastJumps = s.jumps;
        ctx.sfx('jump');
        ctx.burst(feet.clone(), 0xffffff, 5);
        squash = -0.4;
      }
      if (s.clears !== lastClears) {
        lastClears = s.clears;
        ctx.sfx(s.streak >= 4 ? 'good' : 'tick');
        ctx.burst(new THREE.Vector3(0, 0.9, 0.5), [0x4aa8ff, 0x2cc57a, 0xff9d2e, 0xff4f7d, 0x9a5bff][multiplier(s.streak) - 1] ?? 0xffffff, 7 + multiplier(s.streak) * 2);
        const sp = popups[multiplier(s.streak) - 1] as THREE.Sprite;
        popups.forEach((p) => (p.visible = false));
        sp.visible = true;
        popupIdx = multiplier(s.streak) - 1;
        popupT = 0.9;
      }
      if (s.hits !== lastHits) {
        lastHits = s.hits;
        ctx.sfx('bad');
        ctx.burst(new THREE.Vector3(0, 0.6, 0.5), 0xff5a5a, 16);
        squash = 0.6;
      }
      if (popupT > 0) {
        popupT -= dt;
        const sp = popups[popupIdx] as THREE.Sprite;
        sp.position.set(0.1, 2.9 + (0.9 - popupT) * 0.9, 0.5);
        sp.visible = popupT > 0;
      }

      // Pinguin
      const air = s.y > 0.001;
      const stumbling = s.stumble > 0;
      if (wasAir && !air) {
        squash = 0.5;
        ctx.burst(feet.clone(), 0xf5deb3, 4);
      }
      wasAir = air;
      squash += (0 - squash) * Math.min(1, dt * 9);
      const vy = s.y * 1.9;
      const stretch = air ? 1 + Math.min(0.22, Math.abs(s.vy) * 0.03) : 1 - squash * 0.3;
      hero.position.set(0, vy, 0.25);
      inner.scale.set(1 / Math.sqrt(stretch), stretch, 1 / Math.sqrt(stretch));
      inner.rotation.z = stumbling ? Math.sin(t * 25) * 0.25 : 0;
      inner.rotation.x = stumbling ? 0.35 : 0;
      const flap = air ? -0.9 : Math.sin(t * 5) * 0.1;
      flipA.rotation.z = -flap - (stumbling ? Math.sin(t * 30) * 0.6 : 0);
      flipB.rotation.z = flap + (stumbling ? Math.sin(t * 30) * 0.6 : 0);
      pBody.position.y = 0.85 + (air || stumbling ? 0 : Math.sin(t * 5) * 0.015);
      stars.visible = stumbling;
      stars.rotation.y = t * 7;
      hero.visible = s.invuln <= 0 || stumbling || Math.floor(s.invuln / 3) % 2 === 0;
      heroShadow.position.set(0, 0.03, 0.25);
      heroShadow.scale.setScalar(Math.max(0.5, 1 - vy * 0.25));

      // Kamera
      const aspect = camera.aspect;
      const halfW = 5.6;
      const d = THREE.MathUtils.clamp(halfW / (Math.tan((camera.fov * Math.PI) / 360) * aspect), 8.5, 19);
      const camH = aspect < 1 ? 3.6 : 2.5;
      camera.position.set(0, camH, d);
      camera.lookAt(0, aspect < 1 ? 1.6 : 1.35, 0);
    },
    dispose() {
      scene.fog = null;
    },
  };
};
