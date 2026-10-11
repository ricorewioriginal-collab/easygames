import * as THREE from 'three';
import { FALL_TICKS, type BridgeState, type Tower } from '@shared/minigames/games/bruecke';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';

/** Brückenbauer: Himmelsschlucht bei Sonnenaufgang, Steintürme mit Grasdach, eine Maus mit Umhang baut Holzbrücken. */
export const createView: MiniGameViewFactory<BridgeState> = (ctx, initial) => {
  const { root, camera, scene } = ctx;
  scene.background = new THREE.Color(0xffc7a1);
  scene.fog = new THREE.Fog(0xffd7bd, 30, 90);
  const sphere = new THREE.SphereGeometry(1, 14, 10);
  const hash = (i: number): number => ((Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(i + 5, 0x85ebca6b)) >>> 8 & 0xffff) / 65536;

  // ---------- Himmel ----------
  const far = new THREE.Group();
  root.add(far);
  const skyGeo = new THREE.PlaneGeometry(600, 160);
  const skyCol: number[] = [];
  const cTop = new THREE.Color(0x6cc3ff);
  const cMid = new THREE.Color(0xffb3c7);
  const cBot = new THREE.Color(0xffe3b8);
  const skyPos = skyGeo.getAttribute('position');
  for (let i = 0; i < skyPos.count; i++) {
    const y = skyPos.getY(i) / 80; // -1..1
    const c = y > 0 ? cMid.clone().lerp(cTop, y) : cMid.clone().lerp(cBot, -y);
    skyCol.push(c.r, c.g, c.b);
  }
  skyGeo.setAttribute('color', new THREE.Float32BufferAttribute(skyCol, 3));
  const skyMat = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false });
  const skyPlane = new THREE.Mesh(skyGeo, skyMat);
  skyPlane.position.set(0, 18, -90);
  far.add(skyPlane);
  const sunMat = glow(0xfff0a8);
  sunMat.fog = false;
  const sun = new THREE.Mesh(new THREE.CircleGeometry(9, 36), sunMat);
  sun.position.set(14, 8, -80);
  far.add(sun);
  const haloMat = glow(0xfff6cf, 0.35);
  haloMat.fog = false;
  const halo = new THREE.Mesh(new THREE.CircleGeometry(15, 36), haloMat);
  halo.position.set(14, 8, -81);
  far.add(halo);
  const mount1 = toon(0xc98fd6, { emissive: 0xc98fd6, emissiveIntensity: 0.35 });
  const mount2 = toon(0xa774c9, { emissive: 0xa774c9, emissiveIntensity: 0.3 });
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(9 + hash(i) * 6, 14 + hash(i + 3) * 12, 5), i % 2 ? mount1 : mount2);
    m.position.set(-70 + i * 12, -3 + hash(i + 9) * 3, -55 - (i % 2) * 12);
    far.add(m);
  }
  const cloudMat = glow(0xffffff, 0.85);
  const puffs: THREE.Mesh[] = [];
  for (let i = 0; i < 24; i++) {
    const p = new THREE.Mesh(sphere, cloudMat);
    p.scale.set(4 + hash(i) * 4, 1.3 + hash(i + 7), 2.5);
    p.position.set(-60 + i * 5.2, -8.5 + hash(i + 13) * 1.5, 3 - (i % 3) * 5);
    far.add(p);
    puffs.push(p);
  }
  const floaters: THREE.Group[] = [];
  for (let i = 0; i < 9; i++) {
    const g = new THREE.Group();
    for (let k = 0; k < 3; k++) {
      const m = new THREE.Mesh(sphere, cloudMat);
      m.scale.set(1.8 - k * 0.3, 0.9, 0.9);
      m.position.set(k * 1.5 - 1.4, k === 1 ? 0.4 : 0, 0);
      g.add(m);
    }
    g.position.set(-50 + i * 14, 10 + hash(i + 21) * 9, -30 - hash(i) * 10);
    far.add(g);
    floaters.push(g);
  }

  // ---------- Türme ----------
  const stoneA = toon(0xd9a779);
  const stoneB = toon(0xc88f68);
  const grass = toon(0x7bd65a);
  const grassDark = toon(0x55b84a);
  const targetMat = glow(0xff2d55);
  interface TowerView {
    g: THREE.Group;
    t: Tower;
  }
  const towerViews: TowerView[] = initial.towers.map((tw, i) => {
    const g = new THREE.Group();
    const w = tw.r - tw.l;
    const stone = new THREE.Mesh(new THREE.BoxGeometry(w, 30, 2.6), i % 2 ? stoneA : stoneB);
    stone.position.set((tw.l + tw.r) / 2, -15, 0);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.18, 0.3, 2.8), grass);
    cap.position.set((tw.l + tw.r) / 2, -0.1, 0);
    const lip = new THREE.Mesh(new THREE.BoxGeometry(w + 0.18, 0.5, 0.3), grassDark);
    lip.position.set((tw.l + tw.r) / 2, -0.4, 1.4);
    g.add(stone, cap, lip);
    // Steinfugen
    for (let k = 1; k < 5; k++) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.07, 2.62), toon(0xa9744f));
      line.position.set((tw.l + tw.r) / 2, -k * 1.6 - hash(i * 7 + k), 0);
      g.add(line);
    }
    // Blümchen
    for (let k = 0; k < 2; k++) {
      const fl = new THREE.Mesh(sphere, toon(k ? 0xff7fb0 : 0xfff06a));
      fl.scale.setScalar(0.09);
      fl.position.set(tw.l + 0.3 + hash(i * 5 + k) * (w - 0.6), 0.1, 1.0);
      g.add(fl);
    }
    root.add(g);
    return { g, t: tw };
  });
  // Ziel-Punkt (perfekte Mitte)
  const target = new THREE.Group();
  const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 20), targetMat);
  const dotRing = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 6, 24), glow(0xffffff, 0.9));
  dotRing.rotation.x = Math.PI / 2;
  target.add(dot, dotRing);
  target.position.y = 0.08;
  root.add(target);

  // ---------- Stab / Brücken ----------
  const plankMat = toon(0xe0a040);
  const railMat = toon(0x8a5a2b);
  const makePlank = (): THREE.Group => {
    const g = new THREE.Group();
    const board = new THREE.Mesh(new THREE.BoxGeometry(1, 0.14, 0.7), plankMat);
    board.position.x = 0.5;
    const rA = new THREE.Mesh(new THREE.BoxGeometry(1, 0.09, 0.09), railMat);
    rA.position.set(0.5, 0.1, 0.33);
    const rB = rA.clone();
    rB.position.z = -0.33;
    g.add(board, rA, rB);
    return g;
  };
  const stickPivot = new THREE.Group();
  const stick = makePlank();
  stickPivot.add(stick);
  root.add(stickPivot);
  const placed: THREE.Group[] = [];
  for (let i = 0; i < 6; i++) {
    const p = makePlank();
    p.visible = false;
    root.add(p);
    placed.push(p);
  }
  let placedN = 0;

  // ---------- Held: Maus mit Umhang ----------
  const hero = new THREE.Group();
  const inner = new THREE.Group();
  hero.add(inner);
  root.add(hero);
  const gray = toon(0x9ba4d0);
  const pinkM = toon(0xffa6c4);
  const cream = toon(0xfff1e0);
  const dark = toon(0x2b2140);
  const cape = toon(0xe8366b);
  const mBody = new THREE.Mesh(sphere, gray);
  mBody.scale.set(0.42, 0.5, 0.4);
  mBody.position.y = 0.6;
  const mBelly = new THREE.Mesh(sphere, cream);
  mBelly.scale.set(0.28, 0.34, 0.2);
  mBelly.position.set(0.12, 0.55, 0.22);
  const mHead = new THREE.Mesh(sphere, gray);
  mHead.scale.set(0.36, 0.32, 0.32);
  mHead.position.set(0.12, 1.18, 0);
  const mEarA = new THREE.Mesh(sphere, gray);
  mEarA.scale.set(0.2, 0.22, 0.06);
  mEarA.position.set(0.0, 1.5, 0.12);
  const mEarB = mEarA.clone();
  mEarB.position.z = -0.12;
  const mInA = new THREE.Mesh(sphere, pinkM);
  mInA.scale.set(0.13, 0.15, 0.03);
  mInA.position.set(0.02, 1.5, 0.16);
  const mInB = mInA.clone();
  mInB.position.z = -0.16;
  const mNose = new THREE.Mesh(sphere, pinkM);
  mNose.scale.setScalar(0.07);
  mNose.position.set(0.47, 1.14, 0);
  const mEyeA = new THREE.Mesh(sphere, dark);
  mEyeA.scale.set(0.05, 0.07, 0.04);
  mEyeA.position.set(0.4, 1.24, 0.13);
  const mEyeB = mEyeA.clone();
  mEyeB.position.z = -0.13;
  const mCape = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.7, 0.62), cape);
  mCape.position.set(-0.26, 0.72, 0);
  const mTail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.7, 6), pinkM);
  mTail.rotation.z = Math.PI / 2.5;
  mTail.position.set(-0.52, 0.28, 0);
  const mFootA = new THREE.Mesh(sphere, dark);
  mFootA.scale.set(0.16, 0.09, 0.12);
  mFootA.position.set(0, 0.09, 0.16);
  const mFootB = mFootA.clone();
  mFootB.position.z = -0.16;
  const mArm = new THREE.Mesh(sphere, gray);
  mArm.scale.set(0.09, 0.2, 0.09);
  mArm.position.set(0.15, 0.75, 0.38);
  const mArmB = mArm.clone();
  mArmB.position.z = -0.38;
  inner.add(mBody, mBelly, mHead, mEarA, mEarB, mInA, mInB, mNose, mEyeA, mEyeB, mCape, mTail, mFootA, mFootB, mArm, mArmB);

  // Texte
  const perfect = textSprite('PERFEKT!', { color: '#ffffff', bg: '#ff4f7d', size: 56, width: 3.4 });
  perfect.visible = false;
  root.add(perfect);
  const goodTxt = textSprite('Geschafft!', { color: '#ffffff', bg: '#2cc57a', size: 56, width: 3.4 });
  goodTxt.visible = false;
  root.add(goodTxt);
  let popT = 0;
  let popSprite: THREE.Sprite | null = null;

  let t = 0;
  let camX = 2;
  let camY = 3;
  let shake = 0;
  let lastResults = 0;
  let lastIdx = 0;
  let lastLen = 0;
  let lastFallPhase = '';
  let walkBob = 0;
  const bp = new THREE.Vector3();

  return {
    update(s, dt) {
      t += dt;
      const cur = s.towers[s.idx] as Tower;
      const next = s.towers[s.idx + 1] as Tower;

      // ---------- Stab ----------
      let ang = 0;
      if (s.phase === 'fall') {
        const f = Math.min(1, s.timer / FALL_TICKS);
        ang = (Math.PI / 2) * f * f;
      } else if (s.phase === 'walk' || s.phase === 'drop') ang = Math.PI / 2;
      const showStick = s.len > 0.02 && s.phase !== 'idle';
      stickPivot.visible = showStick;
      stickPivot.position.set(cur.r, 0.09, 0);
      stickPivot.rotation.z = Math.PI / 2 - ang;
      stick.scale.x = Math.max(0.01, s.len);
      stick.scale.z = s.phase === 'grow' ? 1 + Math.sin(t * 40) * 0.04 : 1;
      if (s.len > 0.02) lastLen = s.len;

      // gesetzte Brücken
      if (s.idx !== lastIdx) {
        const prev = s.towers[s.idx - 1] as Tower;
        const p = placed[placedN % placed.length] as THREE.Group;
        placedN++;
        p.visible = true;
        p.position.set(prev.r, 0.09, 0);
        p.scale.set(lastLen, 1, 1);
        lastIdx = s.idx;
        lastLen = 0;
      }

      // ---------- Ereignisse ----------
      if (s.phase !== lastFallPhase) {
        if (lastFallPhase === 'fall') {
          shake = 0.35;
          ctx.burst(bp.set(cur.r + s.len, 0.3, 0.4), 0xf3d9a0, 9);
        }
        if (s.phase === 'grow') ctx.sfx('tick');
        lastFallPhase = s.phase;
      }
      if (s.results !== lastResults) {
        lastResults = s.results;
        if (s.last === 2) {
          ctx.sfx('win');
          ctx.burst(bp.set((next.l + next.r) / 2, 0.6, 0.5), 0xffd23f, 26);
          ctx.burst(bp.set((next.l + next.r) / 2, 0.8, 0.5), 0xff4f7d, 14);
          popSprite = perfect;
          popT = 1.2;
        } else if (s.last === 1) {
          ctx.sfx('good');
          ctx.burst(bp.set(next.r - 0.6, 0.5, 0.5), 0x7bd65a, 10);
          popSprite = goodTxt;
          popT = 0.9;
        } else if (s.last === 3) {
          ctx.sfx('bad');
        }
      }
      if (popT > 0 && popSprite) {
        popT -= dt;
        popSprite.visible = popT > 0;
        popSprite.position.set(cur.r - 1.2, 2.8 + (1.2 - popT) * 0.6, 0.8);
      } else if (popSprite) popSprite.visible = false;

      // ---------- Türme ----------
      for (const tv of towerViews) tv.g.visible = Math.abs((tv.t.l + tv.t.r) / 2 - camX) < 32;
      target.visible = s.phase !== 'drop' && (s.phase === 'idle' || s.phase === 'grow' || s.phase === 'fall');
      target.position.x = (next.l + next.r) / 2;
      const pulse = 1 + Math.sin(t * 6) * 0.1;
      target.scale.set(pulse, 1, pulse);

      // ---------- Held ----------
      const walking = s.phase === 'walk';
      walkBob += dt * (walking ? 18 : 4);
      hero.position.set(s.heroX, s.heroY, 0);
      if (s.phase === 'drop') {
        inner.rotation.z = -s.timer * 0.12;
        inner.position.y = 0;
      } else {
        inner.rotation.z = 0;
        inner.position.y = walking ? Math.abs(Math.sin(walkBob)) * 0.1 : Math.sin(walkBob) * 0.02;
      }
      const grow = s.phase === 'grow';
      mArm.rotation.z = grow ? -2.4 + Math.sin(t * 30) * 0.15 : walking ? Math.sin(walkBob) * 0.7 : 0;
      mArmB.rotation.z = grow ? -2.4 + Math.sin(t * 30 + 1) * 0.15 : walking ? -Math.sin(walkBob) * 0.7 : 0;
      mArm.position.y = grow ? 0.95 : 0.75;
      mArmB.position.y = mArm.position.y;
      mHead.rotation.z = grow ? 0.35 : 0;
      mCape.rotation.z = (walking ? 0.5 : 0.15) + Math.sin(t * 8) * 0.12;
      mFootA.position.x = walking ? Math.sin(walkBob) * 0.2 : 0;
      mFootB.position.x = walking ? -Math.sin(walkBob) * 0.2 : 0;
      mTail.rotation.z = Math.PI / 2.5 + Math.sin(t * 6) * 0.2;
      // Freude bei Erfolg
      if (s.phase === 'idle' && s.last > 0 && s.last < 3 && s.timer < 18) inner.position.y += Math.abs(Math.sin(s.timer * 0.35)) * 0.35;

      // ---------- Kamera ----------
      const aspect = camera.aspect;
      const halfW = aspect < 1 ? 7.0 : 8.2;
      const d = THREE.MathUtils.clamp(halfW / (Math.tan((camera.fov * Math.PI) / 360) * aspect), 11, 30);
      const focus = (Math.max(s.heroX, cur.r - 1.0) + (next.l + next.r) / 2) / 2 + 0.6;
      const k = dt <= 0 ? 1 : Math.min(1, dt * 4);
      camX += (focus - camX) * k;
      const ty = (aspect < 1 ? 4.2 : 3.0) + (s.phase === 'drop' ? -s.timer * 0.04 : 0);
      camY += (ty - camY) * k;
      shake = Math.max(0, shake - dt * 2);
      camera.position.set(camX + Math.sin(t * 70) * shake * 0.12, camY + Math.cos(t * 60) * shake * 0.1, d);
      camera.lookAt(camX, camY - (aspect < 1 ? 1.2 : 0.6), 0);
      far.position.x = camX * 0.9;
      for (let i = 0; i < puffs.length; i++) (puffs[i] as THREE.Mesh).position.x = -60 + i * 5.2 + Math.sin(t * 0.3 + i) * 0.8 - camX * 0.1;
    },
    dispose() {
      scene.fog = null;
    },
  };
};
