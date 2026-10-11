import * as THREE from 'three';
import { gustAt, warnAt, type TippState } from '@shared/minigames/games/tippkraft';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';

/** Felsenschieber: Ein Held stemmt einen Felsen über die Wiese. Die Landschaft zieht vorbei, Böen wehen von vorn. */
export const createView: MiniGameViewFactory<TippState> = (ctx) => {
  const { root, camera } = ctx;
  ctx.scene.background = new THREE.Color(0x9fe0ff);
  ctx.scene.fog = new THREE.Fog(0x9fe0ff, 30, 70);
  const tmp = new THREE.Object3D();

  // Boden
  const ground = new THREE.Mesh(new THREE.BoxGeometry(120, 1, 30), toon(0x6fcf6a));
  ground.position.set(0, -0.5, -4);
  root.add(ground);
  const path = new THREE.Mesh(new THREE.BoxGeometry(120, 0.05, 3.2), toon(0xe9c17a));
  path.position.set(0, 0.02, 0);
  root.add(path);
  // Wegstreifen (scrollen)
  const STR = 18;
  const stripes = new THREE.InstancedMesh(new THREE.BoxGeometry(1.4, 0.06, 0.25), toon(0xd3a45c), STR);
  root.add(stripes);
  // Gras-Büschel vorn
  const TUFT = 22;
  const tufts = new THREE.InstancedMesh(new THREE.ConeGeometry(0.22, 0.6, 5), toon(0x3fae4a), TUFT);
  root.add(tufts);
  // Bäume (Mittelgrund)
  const TREES = 12;
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.18, 0.25, 1.2, 6), toon(0x8a5a2b), TREES);
  const crowns = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 10), toon(0x2fa05a), TREES);
  root.add(trunks, crowns);
  // Berge (Hintergrund)
  const MT = 8;
  const mounts = new THREE.InstancedMesh(new THREE.ConeGeometry(4, 7, 5), toon(0x8a9be0), MT);
  const caps = new THREE.InstancedMesh(new THREE.ConeGeometry(1.35, 2.3, 5), toon(0xffffff), MT);
  root.add(mounts, caps);
  // Wolken
  const CL = 7;
  const clouds = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), glow(0xffffff, 0.92), CL * 3);
  root.add(clouds);
  // Wegweiser alle 10 m
  const signs: Array<{ g: THREE.Group; m: number }> = [];
  for (let m = 0; m <= 200; m += 10) {
    const g = new THREE.Group();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 6), toon(0x8a5a2b));
    post.position.y = 0.9;
    g.add(post);
    const board = textSprite(`${m} m`, { color: '#3a2a10', bg: '#ffe9a8', size: 52, width: 1.9 });
    board.position.y = 2.1;
    board.material.fog = false;
    board.material.depthTest = true;
    g.add(board);
    g.position.set(m, 0, -2.4);
    g.visible = false;
    root.add(g);
    signs.push({ g, m });
  }

  // Held
  const hero = new THREE.Group();
  hero.position.set(-3.6, 0, 0.2);
  root.add(hero);
  const heroLean = new THREE.Group();
  hero.add(heroLean);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.8, 22, 16), toon(0x4f8cff));
  body.scale.set(1, 1.08, 0.95);
  body.position.y = 1.55;
  heroLean.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 10), toon(0xdbe8ff));
  belly.position.set(0.18, 1.4, 0.45);
  belly.scale.set(1, 1.1, 0.6);
  heroLean.add(belly);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.09, 8, 20), toon(0xff4d6d));
  band.position.set(0, 2.0, 0);
  band.rotation.x = Math.PI / 2 - 0.15;
  heroLean.add(band);
  const bandTail = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.7, 5), toon(0xff4d6d));
  bandTail.position.set(-0.75, 1.95, 0);
  bandTail.rotation.z = Math.PI / 2 + 0.3;
  heroLean.add(bandTail);
  const eyeL: THREE.Mesh[] = [];
  for (const sz of [-0.3, 0.3]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), toon(0xffffff));
    e.position.set(0.6, 1.75, sz);
    e.scale.set(0.5, 1.2, 1);
    heroLean.add(e);
    eyeL.push(e);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), toon(0x1c1228));
    p.position.set(0.72, 1.75, sz);
    heroLean.add(p);
  }
  const grit = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 6, 10, Math.PI), toon(0x1c1228));
  grit.position.set(0.74, 1.4, 0);
  grit.rotation.y = Math.PI / 2;
  heroLean.add(grit);
  const arms: THREE.Mesh[] = [];
  for (const sz of [-0.62, 0.62]) {
    const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.9, 4, 8), toon(0x3a72d8));
    a.position.set(1.0, 1.55, sz * 0.6);
    a.rotation.z = Math.PI / 2 - 0.2;
    heroLean.add(a);
    arms.push(a);
  }
  const legs: THREE.Group[] = [];
  for (const sz of [-0.35, 0.35]) {
    const lg = new THREE.Group();
    lg.position.set(0, 0.85, sz);
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.55, 4, 8), toon(0x2d56b3));
    leg.position.y = -0.4;
    lg.add(leg);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), toon(0xffd23f));
    foot.scale.set(1.5, 0.7, 1);
    foot.position.set(0.18, -0.85, 0);
    lg.add(foot);
    hero.add(lg);
    legs.push(lg);
  }
  const heroShadow = new THREE.Mesh(new THREE.CircleGeometry(1, 20), glow(0x2c5a2a, 0.35));
  heroShadow.rotation.x = -Math.PI / 2;
  heroShadow.position.set(-3.4, 0.06, 0.2);
  heroShadow.scale.set(1.3, 0.8, 1);
  root.add(heroShadow);

  // Felsen (rollt) mit stehendem Gesicht
  const rockGroup = new THREE.Group();
  rockGroup.position.set(0.6, 1.7, 0);
  root.add(rockGroup);
  const rockGeo = new THREE.IcosahedronGeometry(1.7, 1).toNonIndexed();
  rockGeo.computeVertexNormals();
  const rock = new THREE.Mesh(rockGeo, toon(0xa89a8a));
  rockGroup.add(rock);
  const rockSpots = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 0), toon(0x8a7d6e));
  rockSpots.position.set(-0.7, 0.9, 1.3);
  rock.add(rockSpots);
  const face = new THREE.Group();
  face.position.set(0, 0.2, 1.62);
  rockGroup.add(face);
  const rEyes: THREE.Mesh[] = [];
  for (const sx of [-0.5, 0.5]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), toon(0xffffff));
    e.position.set(sx, 0.25, 0);
    e.scale.set(1, 1, 0.5);
    face.add(e);
    rEyes.push(e);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), toon(0x1c1228));
    p.position.set(sx - 0.05, 0.22, 0.12);
    face.add(p);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.1, 0.1), toon(0x4a3f35));
    brow.position.set(sx, 0.62, 0.05);
    brow.rotation.z = sx > 0 ? 0.35 : -0.35;
    face.add(brow);
  }
  const rMouth = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.07, 6, 14, Math.PI), toon(0x4a3f35));
  rMouth.position.set(0, -0.45, 0);
  face.add(rMouth);
  const rockShadow = new THREE.Mesh(new THREE.CircleGeometry(1.9, 24), glow(0x2c5a2a, 0.35));
  rockShadow.rotation.x = -Math.PI / 2;
  rockShadow.position.set(0.6, 0.06, 0);
  root.add(rockShadow);

  // Kraftleiste über dem Helden
  const gauge = new THREE.Group();
  gauge.position.set(-1.8, 5.1, 0.5);
  root.add(gauge);
  const gFrame = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.62, 0.15), toon(0x2a2060));
  gauge.add(gFrame);
  const gBack = new THREE.Mesh(new THREE.BoxGeometry(3.95, 0.4, 0.18), toon(0x4a3d8f));
  gBack.position.z = 0.02;
  gauge.add(gBack);
  const gFillMat = new THREE.MeshBasicMaterial({ color: 0x39ff9a });
  const gFill = new THREE.Mesh(new THREE.BoxGeometry(3.95, 0.4, 0.2), gFillMat);
  gFill.position.z = 0.04;
  gauge.add(gFill);
  const gMark = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.55, 0.22), glow(0xffffff, 0.9));
  gMark.position.z = 0.05;
  gauge.add(gMark);
  const warnSign = textSprite('BÖE!', { color: '#ffffff', bg: '#ff4d6d', size: 64, width: 2.6 });
  warnSign.material.fog = false;
  warnSign.position.set(-1.8, 6.4, 0.6);
  warnSign.visible = false;
  root.add(warnSign);
  const holdSign = textSprite('HALTEN!', { color: '#2a2060', bg: '#ffe066', size: 64, width: 3.0 });
  holdSign.material.fog = false;
  holdSign.position.set(-1.8, 6.4, 0.6);
  holdSign.visible = false;
  root.add(holdSign);

  // Windstreifen
  const WS = 26;
  const wind = new THREE.InstancedMesh(new THREE.BoxGeometry(2.6, 0.14, 0.14), glow(0xffffff, 0.9), WS);
  root.add(wind);
  const windSeed = Array.from({ length: WS }, (_, i) => ({ y: 0.4 + ((i * 37) % 60) / 10, z: -1 + ((i * 53) % 30) / 10, off: ((i * 29) % 100) / 100, sp: 0.8 + ((i * 17) % 10) / 20 }));
  // Schutzschild beim Halten
  const shield = new THREE.Mesh(new THREE.SphereGeometry(2.0, 20, 14), glow(0x7dffd8, 0.18));
  shield.position.set(-3.3, 1.5, 0.2);
  shield.visible = false;
  root.add(shield);

  let t = 0;
  let phase = 0;
  let visDist = 0;
  let lastTap = 0;
  let lastStumble = 0;
  let wasGust = false;
  let wasBrace = false;
  let lastMark = 0;
  let squash = 0;
  let lastAspect = 0;
  let shake = 0;
  const bp = new THREE.Vector3();
  const colA = new THREE.Color(0x39ff9a);
  const colB = new THREE.Color(0xffe066);
  const colC = new THREE.Color(0xff4d6d);

  const placeCamera = () => {
    lastAspect = camera.aspect;
    const d = Math.max(13.5, 11.5 / camera.aspect);
    camera.position.set(0, 3.4 + d * 0.1, d);
    camera.lookAt(-0.8, 2.6, 0);
  };
  placeCamera();

  return {
    update(s, dt) {
      t += dt;
      if (Math.abs(camera.aspect - lastAspect) > 0.001) placeCamera();
      // Weg glätten
      visDist += (s.dist - visDist) * Math.min(1, dt * 10);
      const speedNow = Math.max(0, (s.dist - visDist) * 10);
      const gi = gustAt(s.gusts, s.t);
      const gust = gi >= 0;
      const warn = warnAt(s.gusts, s.t);
      const run = Math.min(1, speedNow / 5 + (s.power > 1 ? 0.25 : 0));
      phase += dt * (2 + speedNow * 2.4) * (s.power > 1 ? 1 : 0.2);

      // Landschaft scrollt (Parallax)
      const D = visDist;
      for (let i = 0; i < STR; i++) {
        const x = ((((i * 3.0 - D) % 54) + 54) % 54) - 24;
        tmp.position.set(x, 0.06, 0.3 + ((i % 3) - 1) * 0.5);
        tmp.rotation.set(0, 0, 0);
        tmp.scale.setScalar(1);
        tmp.updateMatrix();
        stripes.setMatrixAt(i, tmp.matrix);
      }
      stripes.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < TUFT; i++) {
        const x = ((((i * 2.6 - D * 1.1) % 57) + 57) % 57) - 25;
        tmp.position.set(x, 0.3, 2.2 + (i % 4) * 0.9);
        tmp.rotation.set(0, 0, Math.sin(t * 3 + i) * 0.1 + (gust ? -0.5 : 0));
        tmp.scale.set(1, 0.8 + (i % 3) * 0.3, 1);
        tmp.updateMatrix();
        tufts.setMatrixAt(i, tmp.matrix);
      }
      tufts.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < TREES; i++) {
        const x = ((((i * 5.3 - D * 0.55) % 66) + 66) % 66) - 28;
        const z = -4.5 - (i % 3) * 1.6;
        const sc = 1.1 + (i % 4) * 0.25;
        tmp.rotation.set(0, 0, gust ? -0.08 : 0);
        tmp.scale.set(sc, sc, sc);
        tmp.position.set(x, 0.6 * sc, z);
        tmp.updateMatrix();
        trunks.setMatrixAt(i, tmp.matrix);
        tmp.position.set(x, 1.9 * sc, z);
        tmp.scale.set(sc * 1.15, sc * 1.35, sc * 1.15);
        tmp.updateMatrix();
        crowns.setMatrixAt(i, tmp.matrix);
      }
      trunks.instanceMatrix.needsUpdate = true;
      crowns.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < MT; i++) {
        const x = ((((i * 9.5 - D * 0.18) % 76) + 76) % 76) - 34;
        const sc = 1 + (i % 3) * 0.35;
        tmp.rotation.set(0, 0, 0);
        tmp.scale.set(sc, sc, sc);
        tmp.position.set(x, 3.5 * sc, -22 - (i % 2) * 4);
        tmp.updateMatrix();
        mounts.setMatrixAt(i, tmp.matrix);
        tmp.position.set(x, 3.5 * sc + 2.55 * sc, -22 - (i % 2) * 4);
        tmp.updateMatrix();
        caps.setMatrixAt(i, tmp.matrix);
      }
      mounts.instanceMatrix.needsUpdate = true;
      caps.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < CL; i++) {
        const x = ((((i * 11 - D * 0.06 - t * 0.4) % 80) + 80) % 80) - 38;
        const y = 10 + (i % 3) * 2.4;
        for (let k = 0; k < 3; k++) {
          tmp.position.set(x + (k - 1) * 1.6, y + (k === 1 ? 0.5 : 0), -18);
          tmp.scale.set(1.6 - Math.abs(k - 1) * 0.3, 1.1, 1);
          tmp.updateMatrix();
          clouds.setMatrixAt(i * 3 + k, tmp.matrix);
        }
      }
      clouds.instanceMatrix.needsUpdate = true;
      for (const sg of signs) {
        const x = sg.m - D - 3.6 + 3.0;
        sg.g.visible = x > -26 && x < 24;
        sg.g.position.x = x;
      }

      // Felsen rollt, wackelt in Böen
      rock.rotation.z = -D / 1.7;
      rockGroup.position.y = 1.7 + (gust && !s.bracing ? Math.sin(t * 30) * 0.03 : 0);
      rockGroup.position.x = 0.6 + (gust && !s.bracing ? -0.3 : 0);
      rockShadow.position.x = rockGroup.position.x;
      const strain = s.power / 100;
      rEyes.forEach((e) => e.scale.set(1, Math.max(0.2, 1 - (gust ? 0 : 0.0) - Math.sin(t * 0.7) * 0.0 + strain * 0.2), 0.5));
      rMouth.rotation.z = s.power > 25 ? 0 : Math.PI;
      rMouth.scale.setScalar(0.6 + strain * 0.8);

      // Held
      squash = Math.max(0, squash - dt * 5);
      const lean = 0.08 + strain * 0.32 + (gust && s.bracing ? 0.12 : 0) + squash * 0.1;
      heroLean.rotation.z = -lean;
      heroLean.position.x = squash * 0.12;
      legs[0]!.rotation.z = Math.sin(phase * 3) * 0.7 * run - 0.1;
      legs[1]!.rotation.z = Math.sin(phase * 3 + Math.PI) * 0.7 * run - 0.1;
      body.position.y = 1.55 + Math.abs(Math.sin(phase * 3)) * 0.08 * run - (gust && s.bracing ? 0.25 : 0);
      arms[0]!.rotation.z = Math.PI / 2 - 0.2 + squash * 0.25;
      arms[1]!.rotation.z = Math.PI / 2 - 0.2 + squash * 0.25;
      grit.rotation.z = strain > 0.5 || gust ? Math.PI : 0;
      bandTail.rotation.z = Math.PI / 2 + 0.3 + Math.sin(t * 14) * 0.25 * (0.4 + run);
      hero.position.y = 0;
      const hx = -3.6 + (gust && !s.bracing ? -0.5 : 0);
      hero.position.x += (hx - hero.position.x) * Math.min(1, dt * 8);
      heroShadow.position.x = hero.position.x + 0.2;
      shield.visible = gust && s.bracing;
      shield.scale.setScalar(1 + Math.sin(t * 12) * 0.04);
      shield.position.x = hero.position.x + 0.3;

      // Kraftleiste
      const f = s.power / 100;
      gFill.scale.x = Math.max(0.001, f);
      gFill.position.x = -(3.95 * (1 - Math.max(0.001, f))) / 2;
      gFillMat.color.copy(f < 0.5 ? colC.clone().lerp(colB, f * 2) : colB.clone().lerp(colA, (f - 0.5) * 2));
      gMark.position.x = -3.95 / 2 + 3.95 * f;
      gauge.scale.setScalar(1 + (gust ? 0.1 : 0) + squash * 0.04);
      warnSign.visible = warn && Math.floor(t * 8) % 2 === 0;
      holdSign.visible = gust;
      holdSign.scale.set(3.0 * (1 + Math.sin(t * 12) * 0.05), 0.5 * 1.1 * (1 + Math.sin(t * 12) * 0.05), 1);
      warnSign.scale.set(2.6, 0.55, 1);

      // Wind
      for (let i = 0; i < WS; i++) {
        const w = windSeed[i]!;
        if (!gust && !warn) {
          tmp.position.set(0, -50, 0);
          tmp.scale.setScalar(0.001);
        } else {
          const cyc = (((t * 1.6 * w.sp + w.off) % 1) + 1) % 1;
          const x = 14 - cyc * 34;
          tmp.position.set(x, w.y, w.z + 0.8);
          tmp.scale.set(gust ? 1 : 0.35, 1, 1);
        }
        tmp.rotation.set(0, 0, 0);
        tmp.updateMatrix();
        wind.setMatrixAt(i, tmp.matrix);
      }
      wind.instanceMatrix.needsUpdate = true;

      // Ereignisse
      if (s.tapSeq !== lastTap) {
        lastTap = s.tapSeq;
        squash = 1;
        if (s.taps % 3 === 0) ctx.sfx('tick');
        bp.set(hero.position.x - 0.8, 0.3, 0.6);
        if (s.taps % 2 === 0 && s.power > 20) ctx.burst(bp, 0xe9c17a, 4);
      }
      if (s.stumbleSeq !== lastStumble) {
        lastStumble = s.stumbleSeq;
        ctx.sfx('bad');
        heroLean.rotation.z += 0.0;
        squash = 0;
        bp.set(hero.position.x, 2.2, 0.8);
        ctx.burst(bp, 0xff4d6d, 8);
      }
      if (gust !== wasGust) {
        if (gust) ctx.sfx('whoosh');
        else if (wasBrace) {
          ctx.sfx('good');
          bp.set(hero.position.x + 0.5, 2.4, 1);
          ctx.burst(bp, 0x7dffd8, 20);
        }
        wasGust = gust;
      }
      wasBrace = gust && s.bracing;
      const mark = Math.floor(s.dist / 10);
      if (mark > lastMark) {
        lastMark = mark;
        ctx.sfx('coin');
        bp.set(hero.position.x + 2, 3.4, 1);
        ctx.burst(bp, 0xffe066, 18);
      }
      shake = gust && !s.bracing ? 0.2 : gust ? 0.07 : 0;
      camera.position.x = Math.sin(t * 50) * shake;
      camera.lookAt(-0.8, 2.6, 0);
    },
    dispose() {
      /* Alles hängt an root und wird vom Stage freigegeben */
    },
  };
};
