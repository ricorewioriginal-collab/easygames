import * as THREE from 'three';
import { ARM, pendulumPos, ROUNDS, type PendelState } from '@shared/minigames/games/pendelpunkt';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';

const XM = 3.7; // Weltbreite für Pendelposition ±1
const PIVOT_Y = 8.2;
const LEN = 7.4;

/** Zirkusbühne: ein goldenes Pendelwesen schwingt über einer leuchtenden Zielzone auf dem Boden. */
export const createView: MiniGameViewFactory<PendelState> = (ctx) => {
  const { root, camera } = ctx;
  ctx.scene.background = new THREE.Color(0x8fd8ff);
  ctx.scene.fog = new THREE.Fog(0x8fd8ff, 28, 60);

  // Boden und Bühne
  const ground = new THREE.Mesh(new THREE.CylinderGeometry(9, 9.4, 0.6, 48), toon(0x58c779));
  ground.position.y = -0.3;
  root.add(ground);
  const stage = new THREE.Mesh(new THREE.BoxGeometry(11, 0.3, 3.4), toon(0xffb347));
  stage.position.set(0, 0.15, 0);
  root.add(stage);
  const stageTop = new THREE.Mesh(new THREE.BoxGeometry(10.6, 0.06, 3.0), toon(0xffd98a));
  stageTop.position.set(0, 0.32, 0);
  root.add(stageTop);
  // Skalenstriche
  const ticks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 0.02, 0.5), toon(0xb87a1f), 21);
  const tmp = new THREE.Object3D();
  for (let i = 0; i < 21; i++) {
    tmp.position.set(((i - 10) / 10) * XM, 0.36, 1.1);
    tmp.scale.set(1, 1, i % 5 === 0 ? 1.6 : 1);
    tmp.updateMatrix();
    ticks.setMatrixAt(i, tmp.matrix);
  }
  root.add(ticks);

  // Gerüst mit Balken
  const postMat = toon(0xe8484f);
  for (const sx of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, PIVOT_Y + 0.9, 10), postMat);
    post.position.set(sx * 5.6, (PIVOT_Y + 0.9) / 2, -1.6);
    root.add(post);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), toon(0xffd23f));
    cap.position.set(sx * 5.6, PIVOT_Y + 0.9, -1.6);
    root.add(cap);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.5, 0.6), toon(0xff7a3d));
  beam.position.set(0, PIVOT_Y + 0.4, -1.6);
  root.add(beam);
  const pivot = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 10), toon(0xffd23f));
  pivot.position.set(0, PIVOT_Y, -1.2);
  root.add(pivot);
  // Wimpel
  for (let i = 0; i < 9; i++) {
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.6, 3), toon([0xff4d8d, 0x39d6ff, 0xffd23f, 0x7dff8a][i % 4] as number));
    f.rotation.z = Math.PI;
    f.position.set(-5 + i * 1.25, PIVOT_Y + 0.0 + Math.sin(i * 0.7) * 0.1, -1.2);
    root.add(f);
  }

  // Zielzone: Boden + Lichtvorhang
  const zone = new THREE.Group();
  zone.position.set(0, 0, 0);
  root.add(zone);
  const zoneFloorMat = glow(0x39ff9a, 0.55);
  const zoneFloor = new THREE.Mesh(new THREE.BoxGeometry(1, 0.05, 2.6), zoneFloorMat);
  zoneFloor.position.set(0, 0.4, 0);
  zone.add(zoneFloor);
  const curtainMat = glow(0x39ff9a, 0.16);
  const curtain = new THREE.Mesh(new THREE.PlaneGeometry(1, PIVOT_Y - 1.6), curtainMat);
  curtain.position.set(0, (PIVOT_Y - 1.6) / 2 + 0.4, 0);
  zone.add(curtain);
  const centerLine = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 2.8), glow(0xffffff, 0.95));
  centerLine.position.set(0, 0.44, 0);
  zone.add(centerLine);
  const centerBeam = new THREE.Mesh(new THREE.BoxGeometry(0.04, PIVOT_Y - 1.6, 0.04), glow(0xffffff, 0.6));
  centerBeam.position.set(0, (PIVOT_Y - 1.6) / 2 + 0.4, 0);
  zone.add(centerBeam);
  const edgeL = new THREE.Mesh(new THREE.BoxGeometry(0.05, PIVOT_Y - 1.6, 0.05), glow(0x39ff9a, 0.7));
  const edgeR = edgeL.clone();
  edgeL.position.y = edgeR.position.y = (PIVOT_Y - 1.6) / 2 + 0.4;
  zone.add(edgeL, edgeR);

  // Pendel
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 8), toon(0xfff1c2));
  root.add(rod);
  const bob = new THREE.Group();
  root.add(bob);
  const bobBody = new THREE.Mesh(new THREE.SphereGeometry(0.95, 28, 20), toon(0xffc72c, { emissive: 0xff9a00, emissiveIntensity: 0.25 }).clone());
  (bobBody.material as THREE.Material).userData = {};
  bob.add(bobBody);
  const bobRing = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.07, 8, 28), toon(0xff7a3d));
  bobRing.rotation.x = Math.PI / 2;
  bob.add(bobRing);
  const eyes: THREE.Mesh[] = [];
  const pupils: THREE.Mesh[] = [];
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), toon(0xffffff));
    eye.position.set(sx * 0.33, 0.2, 0.82);
    eye.scale.set(1, 1.2, 0.5);
    bob.add(eye);
    eyes.push(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), toon(0x2a1a00));
    pupil.position.set(sx * 0.33, 0.2, 0.93);
    bob.add(pupil);
    pupils.push(pupil);
  }
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 6, 14, Math.PI), toon(0x2a1a00));
  mouth.position.set(0, -0.12, 0.88);
  mouth.rotation.z = Math.PI;
  bob.add(mouth);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.8, 20), glow(0x2c5a3a, 0.5));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.4;
  root.add(shadow);
  // Nachbilder
  const GHOSTS = 6;
  const ghosts: THREE.Mesh[] = [];
  for (let i = 0; i < GHOSTS; i++) {
    const g = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 10), glow(0xffc72c, 0.2 - i * 0.03));
    root.add(g);
    ghosts.push(g);
  }
  const history: number[] = [];

  // Stopp-Welle
  const wave = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 6, 36), glow(0xffffff, 0));
  wave.rotation.x = Math.PI / 2;
  wave.position.y = 0.45;
  wave.visible = false;
  root.add(wave);

  // Rundenlaternen
  const lamps: THREE.Mesh[] = [];
  for (let i = 0; i < ROUNDS; i++) {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.27, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    l.position.set((i - (ROUNDS - 1) / 2) * 0.95, 0.2, 1.85);
    root.add(l);
    lamps.push(l);
  }

  // Wolken
  for (let i = 0; i < 6; i++) {
    const c = new THREE.Group();
    for (let k = 0; k < 4; k++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(1.2 - Math.abs(k - 1.5) * 0.25, 10, 8), glow(0xffffff, 0.9));
      m.position.set((k - 1.5) * 1.3, 0, 0);
      c.add(m);
    }
    c.position.set(-18 + i * 7.5, 9 + (i % 3) * 2.2, -16 - (i % 2) * 5);
    root.add(c);
  }
  for (let i = 0; i < 4; i++) {
    const h = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 10), toon([0x3fae6a, 0x2f9a78, 0x57c27a, 0x3fae6a][i] as number));
    h.scale.set(1.6, 0.6, 1);
    h.position.set(-16 + i * 11, -1.2, -17);
    root.add(h);
  }

  let kf = 0;
  let lastRound = -1;
  let lastPhase = '';
  let t = 0;
  let squash = 0;
  let resultSprite: THREE.Sprite | null = null;
  let resultAge = 0;
  let lastAspect = 0;
  let zoneW = 1;
  let zoneX = 0;
  const bp = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);

  const placeCamera = () => {
    lastAspect = camera.aspect;
    const d = Math.max(13.5, 13.2 / camera.aspect);
    camera.position.set(0, 3.4 + d * 0.16, d);
    camera.lookAt(0, 4.0, 0);
  };
  placeCamera();

  return {
    update(s, dt) {
      t += dt;
      if (Math.abs(camera.aspect - lastAspect) > 0.001) placeCamera();
      const r = s.rounds[Math.min(s.round, s.rounds.length - 1)]!;
      // Pendelposition (leicht geglättet zwischen den Simulationsschritten)
      let p: number;
      if (s.phase === 'swing') {
        if (s.round !== lastRound) kf = s.k;
        kf += dt * 60;
        if (Math.abs(kf - s.k) > 2.5) kf = s.k;
        else kf += (s.k - kf) * 0.2;
        p = pendulumPos(r, kf);
      } else {
        p = s.stopPos;
        kf = s.k;
      }
      if (s.round !== lastRound) {
        lastRound = s.round;
        history.length = 0;
        if (resultSprite) resultSprite.visible = false;
      }
      const x = p * XM;
      const y = PIVOT_Y - Math.sqrt(Math.max(1, LEN * LEN - x * x)) ;
      bob.position.set(x, y, 0);
      // Stab
      const px = 0;
      dir.set(x - px, y - PIVOT_Y, 0);
      const len = dir.length();
      rod.position.set(px + dir.x / 2, PIVOT_Y + dir.y / 2, 0);
      rod.scale.set(1, len, 1);
      rod.quaternion.setFromUnitVectors(up, dir.normalize());
      pivot.position.z = 0;
      shadow.position.x = x;
      shadow.scale.setScalar(1 + (y - 0.9) * -0.05 + 0.2);
      // Zone
      const targetW = r.h * 2 * XM;
      zoneW += (targetW - zoneW) * Math.min(1, dt * 6);
      zoneX += (r.c * XM - zoneX) * Math.min(1, dt * 6);
      zone.position.x = zoneX;
      zoneFloor.scale.x = zoneW;
      curtain.scale.x = zoneW;
      edgeL.position.x = -zoneW / 2;
      edgeR.position.x = zoneW / 2;
      const inZone = Math.abs(p - r.c) <= r.h;
      curtainMat.opacity = 0.14 + (inZone ? 0.14 : 0);
      zoneFloorMat.opacity = 0.5 + Math.sin(t * 5) * 0.08;
      // Gesicht
      const armed = s.phase === 'swing' && s.k > ARM;
      const bodyMat = bobBody.material as THREE.MeshToonMaterial;
      bodyMat.emissive.setHex(inZone ? 0x22ff88 : 0xff9a00);
      bodyMat.emissiveIntensity = inZone ? 0.55 : 0.25;
      const look = Math.max(-1, Math.min(1, (r.c * XM - x) * 0.4));
      pupils.forEach((pp, i) => (pp.position.x = (i === 0 ? -0.33 : 0.33) + look * 0.07));
      const eyeScale = s.phase === 'result' && !s.timedOut && Math.abs(s.stopPos - r.c) < r.h ? 1.25 : 1;
      eyes.forEach((e) => e.scale.set(eyeScale, 1.2 * eyeScale, 0.5));
      const happy = s.phase === 'result' && !s.timedOut && Math.abs(s.stopPos - r.c) < r.h * 1.3;
      mouth.rotation.z = s.phase === 'result' && !happy ? 0 : Math.PI;
      mouth.scale.setScalar(happy ? 1.5 : armed ? 1 : 0.8);
      squash = Math.max(0, squash - dt * 3);
      const sq = Math.sin(squash * Math.PI * 3) * squash * 0.25;
      bob.scale.set(1 + sq, 1 - sq, 1 + sq);
      bob.rotation.z = Math.atan2(x, -(y - PIVOT_Y)) * 0.0;
      // Nachbilder
      if (s.phase === 'swing') {
        history.unshift(x, y);
        if (history.length > GHOSTS * 6 * 2) history.length = GHOSTS * 6 * 2;
      }
      for (let i = 0; i < GHOSTS; i++) {
        const gi = (i + 1) * 3 * 2;
        const g = ghosts[i] as THREE.Mesh;
        const hx = history[gi];
        const hy = history[gi + 1];
        g.visible = s.phase === 'swing' && hx !== undefined && hy !== undefined;
        if (g.visible) g.position.set(hx as number, hy as number, -0.2);
      }
      // Ereignisse
      if (s.phase !== lastPhase) {
        if (s.phase === 'result') {
          const pts = s.pts[s.pts.length - 1] ?? 0;
          squash = 1;
          wave.visible = true;
          wave.position.x = s.stopPos * XM;
          resultAge = 0;
          if (resultSprite) resultSprite.visible = false;
          resultSprite = textSprite(s.timedOut ? 'Zu spät!' : `+${pts}`, { color: pts >= 900 ? '#fff176' : pts >= 500 ? '#ffffff' : '#ff9aa8', bg: 'rgba(30,20,60,0.75)', size: 64, width: s.timedOut ? 3.2 : 2.6 });
          resultSprite.material.fog = false;
          root.add(resultSprite);
          bp.set(x, y, 0.4);
          if (s.timedOut) ctx.sfx('bad');
          else if (pts >= 900) {
            ctx.sfx('win');
            ctx.burst(bp, 0xffe066, 34);
            ctx.burst(bp, 0x39ff9a, 20);
          } else if (pts >= 500) {
            ctx.sfx('good');
            ctx.burst(bp, 0xffe066, 18);
          } else {
            ctx.sfx('hit');
            ctx.burst(bp, 0xff9aa8, 10);
          }
        } else if (s.phase === 'swing' && lastPhase !== '') ctx.sfx('whoosh');
        lastPhase = s.phase;
      }
      resultAge += dt;
      if (resultSprite && resultSprite.visible) {
        resultSprite.position.set(Math.max(-3.6, Math.min(3.6, s.stopPos * XM)), 6.6 + Math.min(resultAge, 0.5) * 1.0, 0.5);
        const k = 1 + Math.sin(Math.min(1, resultAge * 4) * Math.PI) * 0.18;
        resultSprite.scale.set(resultSprite.scale.x, resultSprite.scale.y, 1);
        resultSprite.material.opacity = Math.min(1, (1.0 - resultAge) * 4 + 0.2);
        void k;
      }
      if (wave.visible) {
        const a = Math.min(1, resultAge * 1.6);
        wave.scale.setScalar(0.5 + a * 2.5);
        (wave.material as THREE.MeshBasicMaterial).opacity = (1 - a) * 0.8;
        if (a >= 1) wave.visible = false;
      }
      // Laternen
      for (let i = 0; i < ROUNDS; i++) {
        const lm = (lamps[i] as THREE.Mesh).material as THREE.MeshBasicMaterial;
        const pts = s.pts[i];
        lm.color.setHex(pts === undefined ? (i === s.round && s.phase === 'swing' ? 0xffffff : 0x6a8aa8) : pts >= 900 ? 0xffe066 : pts >= 500 ? 0x39ff9a : pts > 0 ? 0xff9a3d : 0xff4d6d);
        (lamps[i] as THREE.Mesh).scale.setScalar(i === s.round && s.phase === 'swing' ? 1.2 + Math.sin(t * 6) * 0.1 : 1);
      }
      // Tempo-Gefühl: leichte Kamerabewegung
      camera.position.x = Math.sin(t * 0.4) * 0.3;
      camera.lookAt(0, 4.0, 0);
    },
    dispose() {
      /* Alles hängt an root und wird vom Stage freigegeben */
    },
  };
};
