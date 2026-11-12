import * as THREE from 'three';
import {
  MAX_HITS,
  currentTurn,
  multiplier,
  nextCrossing,
  ropeAngle,
  type RopeState,
} from '@shared/minigames/games/seilsprung';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';
import { makeMe, makeRivals, updateRivals, type Racer } from './rivals';

/**
 * Seilspringen: Spielplatz im Sonnenschein, zwei Bären schwingen ein langes Seil, alle Spieler springen nebeneinander
 * (die eigene Figur vorn in der Mitte). Goldene Doppelschwünge leuchten, Täuschungen halten oben an.
 */
export const createView: MiniGameViewFactory<RopeState> = (ctx) => {
  const { root, camera, scene } = ctx;
  scene.background = new THREE.Color(0x8fdcff);
  scene.fog = new THREE.Fog(0xc4ecff, 30, 80);
  const sphere = new THREE.SphereGeometry(1, 16, 12);
  const HX = 4.9; // Griffposition
  const HY = 1.35;
  const R = 1.45; // Seilradius (Mitte unten knapp über dem Boden)
  /** Plätze: eigene Figur, dann die Mitspieler */
  const ME_X = -0.95;
  const SLOTS = [0.95, -2.85, 2.85];

  // ---------- Umgebung ----------
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 50), glow(0xe9b96e));
  floor.position.z = 10;
  floor.rotation.x = -Math.PI / 2;
  root.add(floor);
  for (let i = -5; i <= 14; i++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(60, 0.01, 0.06), glow(0xc8934d));
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
  const ropeMesh = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.055, 0.055, 1, 6),
    toon(0xffffff),
    SEG,
  );
  const ca = new THREE.Color(0xff3d6e);
  const cb = new THREE.Color(0xffffff);
  for (let i = 0; i < SEG; i++) ropeMesh.setColorAt(i, Math.floor(i / 2) % 2 ? ca : cb);
  root.add(ropeMesh);
  const ropeShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2 * HX, 0.25),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 }),
  );
  ropeShadow.rotation.x = -Math.PI / 2;
  ropeShadow.position.y = 0.02;
  root.add(ropeShadow);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= SEG; i++) pts.push(new THREE.Vector3());
  const m4 = new THREE.Matrix4();
  const qq = new THREE.Quaternion();
  const sc3 = new THREE.Vector3();
  const p3 = new THREE.Vector3();

  // ---------- Springer ----------
  const me = makeMe(ctx, 1.0);
  me.group.position.set(ME_X, 0, 0.35);
  const stars = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const st = new THREE.Mesh(new THREE.OctahedronGeometry(0.12), glow(0xffe34d));
    st.position.set(Math.cos((i / 4) * Math.PI * 2) * 0.55, 0, Math.sin((i / 4) * Math.PI * 2) * 0.55);
    stars.add(st);
  }
  stars.position.y = 2.2;
  me.group.add(stars);
  const rivals = makeRivals(ctx, 0.9);
  rivals.forEach((r, i) => r.group.position.set(SLOTS[i % 3] as number, 0, -0.05));
  /** Je Springer: letzter Sprungzähler, Stolperer, Salto-Winkel */
  interface JumpVis {
    jumps: number;
    hits: number;
    flip: number;
    wasAir: boolean;
    squash: number;
    out: boolean;
  }
  const newVis = (): JumpVis => ({ jumps: 0, hits: 0, flip: 0, wasAir: false, squash: 0, out: false });
  const meVis = newVis();
  const rivalVis = rivals.map(newVis);
  /** Gemeinsame Darstellung eines Springers (eigene Figur und Mitspieler) */
  const poseJumper = (
    r: Racer,
    pv: THREE.Group,
    st: RopeState,
    v: JumpVis,
    dt: number,
    x: number,
    z: number,
  ): void => {
    const air = st.y > 0.001;
    if (st.jumps !== v.jumps) {
      v.jumps = st.jumps;
      v.squash = -0.35;
    }
    if (v.wasAir && !air) v.squash = 0.45;
    v.wasAir = air;
    v.squash += (0 - v.squash) * Math.min(1, dt * 9);
    // Hoher Sprung: Salto
    if (st.high && air) v.flip = Math.min(Math.PI * 2, v.flip + dt * 13);
    else if (!air) v.flip = 0;
    const out = st.over && st.hits >= MAX_HITS;
    if (st.hits !== v.hits) {
      v.hits = st.hits;
      r.rig.play(out ? 'lose' : 'shock');
    } else if (out && !v.out) r.rig.play('lose');
    else if (st.over && !out && r.rig.current !== 'celebrate') r.rig.play('celebrate');
    v.out = out;
    const stretch = air ? 1 + Math.min(0.2, Math.abs(st.vy) * 0.03) : 1 - v.squash * 0.3;
    r.group.position.set(out ? x + (x < 0 ? -1.2 : 1.2) : x, st.y * 1.45, out ? z + 1.3 : z);
    pv.scale.set(1 / Math.sqrt(stretch), stretch, 1 / Math.sqrt(stretch));
    pv.rotation.x = st.high ? -v.flip : 0;
    r.ring.position.y = 0.03 - st.y * 1.45;
  };

  // ---------- Punkte-Popups (Sprites je Wert, bei Bedarf erzeugt) ----------
  const POP_BG = ['#4aa8ff', '#2cc57a', '#ff9d2e', '#ff4f7d', '#9a5bff'];
  const popCache = new Map<number, THREE.Sprite>();
  const popupFor = (v: number, m: number, gold: boolean): THREE.Sprite => {
    let sp = popCache.get(v);
    if (!sp) {
      sp = textSprite(`+${v}`, {
        color: gold ? '#5a3a00' : '#ffffff',
        bg: gold ? '#ffd23f' : (POP_BG[m - 1] as string),
        size: 48,
        width: 1.5,
      });
      sp.visible = false;
      root.add(sp);
      popCache.set(v, sp);
    }
    return sp;
  };
  let popup: THREE.Sprite | null = null;
  let popupT = 0;
  const banner = (txt: string, fg: string, bg: string, w: number): THREE.Sprite => {
    const sp = textSprite(txt, { color: fg, bg, size: 64, width: w });
    sp.material.fog = false;
    sp.visible = false;
    root.add(sp);
    return sp;
  };
  const goldSign = banner('GOLD – A HALTEN!', '#5a3a00', '#ffd23f', 4.4);
  const fakeSign = banner('Täuschung!', '#ffffff', '#7a5cff', 2.9);
  const outSign = banner('RAUS!', '#ffffff', '#ff4f7d', 2.2);
  const ropeMat = ropeMesh.material as THREE.MeshToonMaterial;
  ropeMat.emissive = new THREE.Color(0xffb300);
  ropeMat.emissiveIntensity = 0;

  // Drehpunkt in Körpermitte für Salto und Stauchen (die Figur selbst steuert Drehung/Größe ihrer Wurzel)
  const pivotOf = (r: Racer): THREE.Group => {
    const pv = new THREE.Group();
    pv.position.y = 0.9;
    r.group.add(pv);
    pv.add(r.rig.root);
    r.rig.root.position.y = -0.9;
    return pv;
  };
  const mePivot = pivotOf(me);
  const rivalPivots = rivals.map(pivotOf);

  let t = 0;
  let lastJumps = 0;
  let lastClears = 0;
  let lastHits = 0;
  let shake = 0;
  const feet = new THREE.Vector3();
  const bp = new THREE.Vector3();

  return {
    update(s, dt) {
      t += dt;
      const tr = currentTurn(s);
      const holding = s.u < tr.hold;
      const theta = ropeAngle(s) + (holding ? Math.sin(t * 22) * 0.05 : 0);
      const cs = Math.cos(theta);
      const sn = Math.sin(theta);
      // Seil entlang des Bogens (flaches Profil, damit es auch bei den äußeren Springern den Boden erreicht)
      for (let i = 0; i <= SEG; i++) {
        const f = i / SEG;
        const prof = Math.pow(Math.sin(Math.PI * f), 0.45);
        pts[i]?.set(-HX + 2 * HX * f, Math.max(0.06, HY + R * cs * prof), R * sn * prof);
      }
      pts[0]?.set(-HX, HY + 0.1 * cs, 0.1 * sn);
      pts[SEG]?.set(HX, HY + 0.1 * cs, 0.1 * sn);
      for (let i = 0; i < SEG; i++) {
        const a = pts[i] as THREE.Vector3;
        const b = pts[i + 1] as THREE.Vector3;
        dirV.subVectors(b, a);
        const len = dirV.length();
        p3.copy(a).addScaledVector(dirV, 0.5);
        qq.setFromUnitVectors(up, dirV.divideScalar(Math.max(1e-6, len)));
        sc3.set(tr.n === 2 ? 1.5 : 1, len * 1.04, tr.n === 2 ? 1.5 : 1);
        m4.compose(p3, qq, sc3);
        ropeMesh.setMatrixAt(i, m4);
      }
      ropeMesh.instanceMatrix.needsUpdate = true;
      // Goldener Doppelschwung: Seil glüht
      const goldNow = tr.n === 2;
      ropeMat.emissiveIntensity += ((goldNow ? 0.9 : 0) - ropeMat.emissiveIntensity) * Math.min(1, dt * 10);
      ropeShadow.position.z = R * sn;
      (ropeShadow.material as THREE.MeshBasicMaterial).opacity = 0.12 + 0.18 * Math.max(0, -cs);
      // Bären (wackeln beim Täuschen)
      for (let k = 0; k < 2; k++) {
        const b = bears[k] as (typeof bears)[number];
        const side = k === 0 ? -1 : 1;
        const hp = pts[k === 0 ? 0 : SEG] as THREE.Vector3;
        b.handle.position.copy(hp);
        limb(b.arm, b.shoulder, hp);
        b.hand.position.copy(hp);
        b.g.position.y = Math.abs(Math.sin(t * 3 + k)) * 0.04;
        b.head.rotation.z = holding ? Math.sin(t * 9 + k) * 0.25 : Math.sin(t * 2.2 + k) * 0.08;
        b.head.rotation.y = -side * 0.35 + Math.sin(t * 1.3) * 0.1;
      }

      // Ereignisse (eigene Figur)
      feet.set(ME_X, 0.1, 0.6);
      if (s.jumps !== lastJumps) {
        lastJumps = s.jumps;
        ctx.sfx('jump');
        ctx.burst(feet, 0xffffff, 5);
      }
      if (s.clears !== lastClears) {
        lastClears = s.clears;
        const m = multiplier(s.streak);
        const gold = s.lastGain === 25 * m;
        ctx.sfx(gold ? 'coin' : s.streak >= 4 ? 'good' : 'tick');
        bp.set(ME_X, 1.0, 0.7);
        ctx.burst(
          bp,
          gold ? 0xffd23f : new THREE.Color(POP_BG[m - 1] ?? '#ffffff').getHex(),
          7 + m * 2 + (gold ? 12 : 0),
        );
        if (popup) popup.visible = false;
        popup = popupFor(s.lastGain, m, gold);
        popupT = 0.9;
      }
      if (s.hits !== lastHits) {
        lastHits = s.hits;
        ctx.sfx('bad');
        bp.set(ME_X, 0.6, 0.6);
        ctx.burst(bp, 0xff5a5a, 16);
        shake = 0.35;
      }
      if (popup && popupT > 0) {
        popupT -= dt;
        popup.position.set(ME_X + 0.1, 3.0 + (0.9 - popupT) * 0.9, 0.6);
        popup.visible = popupT > 0;
      }
      const out = s.over && s.hits >= MAX_HITS;
      const nc = nextCrossing(s);
      goldSign.visible = !s.over && (goldNow || (nc.gold && nc.tc < 70)) && Math.floor(t * 6) % 3 !== 0;
      goldSign.position.set(0, 4.35, 0);
      fakeSign.visible = !s.over && holding && !goldNow && tr.hold > 0;
      fakeSign.position.set(0, 4.35, 0);
      fakeSign.scale.set(2.9 * (1 + Math.sin(t * 14) * 0.05), 0.62, 1);
      outSign.visible = out;
      outSign.position.set(ME_X, 3.2, 1.5);

      // Eigene Figur
      poseJumper(me, mePivot, s, meVis, dt, ME_X, 0.35);
      stars.visible = s.stumble > 0 && !out;
      stars.rotation.y = t * 7;
      me.group.visible = s.invuln <= 0 || s.stumble > 0 || Math.floor(s.invuln / 3) % 2 === 0;
      me.rig.update(dt);

      // Kamera
      shake = Math.max(0, shake - dt);
      const aspect = camera.aspect;
      // Hochformat: näher ran (die Bären dürfen angeschnitten sein), Blick leicht von oben
      const halfW = aspect < 1 ? 3.7 : 6.6;
      const d = THREE.MathUtils.clamp(halfW / (Math.tan((camera.fov * Math.PI) / 360) * aspect), 9, 24);
      const camH = aspect < 1 ? 3.6 : 2.7;
      camera.position.set(-0.3 + Math.sin(t * 50) * shake * 0.3, camH, d);
      camera.lookAt(-0.3, aspect < 1 ? 2.9 : 1.45, 0);
    },
    ghosts(states, dt) {
      updateRivals(rivals, states, dt, (r, st, i) => {
        const v = rivalVis[i] as JumpVis;
        const x = SLOTS[i % 3] as number;
        poseJumper(r, rivalPivots[i] as THREE.Group, st, v, dt, x, -0.05);
      });
    },
    dispose() {
      scene.fog = null;
    },
  };
};
