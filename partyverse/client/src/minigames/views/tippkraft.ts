import * as THREE from 'three';
import { flowLevel, gustAt, sectionAt, warnAt, type TippState } from '@shared/minigames/games/tippkraft';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';
import { makeMe, makeRivals, updateRivals } from './rivals';

const FLOW_COLORS = [0xffffff, 0xffd23f, 0xff9a2e, 0xff4d6d];

/**
 * Felsenschieber: Die eigene Figur stemmt einen Felsen über die Wiese, die Mitspieler schieben auf den Bahnen dahinter.
 * Bergauf kippt die ganze Welt leicht, Böen wehen von vorn, im Endspurt glüht alles golden.
 */
export const createView: MiniGameViewFactory<TippState> = (ctx) => {
  const { root, camera } = ctx;
  ctx.scene.background = new THREE.Color(0x9fe0ff);
  ctx.scene.fog = new THREE.Fog(0x9fe0ff, 34, 80);
  const tmp = new THREE.Object3D();
  /** Alles, was bergauf mitkippt */
  const world = new THREE.Group();
  root.add(world);

  // Boden
  const ground = new THREE.Mesh(new THREE.BoxGeometry(160, 1, 80), toon(0x6fcf6a));
  ground.position.set(0, -0.5, 0);
  world.add(ground);
  const path = new THREE.Mesh(new THREE.BoxGeometry(120, 0.05, 3.2), toon(0xe9c17a));
  path.position.set(0, 0.02, 0);
  world.add(path);
  const STR = 18;
  const stripes = new THREE.InstancedMesh(new THREE.BoxGeometry(1.4, 0.06, 0.25), toon(0xd3a45c), STR);
  world.add(stripes);
  const TUFT = 22;
  const tufts = new THREE.InstancedMesh(new THREE.ConeGeometry(0.22, 0.6, 5), toon(0x3fae4a), TUFT);
  world.add(tufts);
  const TREES = 12;
  const trunks = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.18, 0.25, 1.2, 6),
    toon(0x8a5a2b),
    TREES,
  );
  const crowns = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 10), toon(0x2fa05a), TREES);
  world.add(trunks, crowns);
  const MT = 8;
  const mounts = new THREE.InstancedMesh(new THREE.ConeGeometry(4, 7, 5), toon(0x8a9be0), MT);
  const caps = new THREE.InstancedMesh(new THREE.ConeGeometry(1.35, 2.3, 5), toon(0xffffff), MT);
  root.add(mounts, caps);
  const CL = 7;
  const clouds = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), glow(0xffffff, 0.92), CL * 3);
  root.add(clouds);
  // Wegweiser alle 10 m
  const signs: Array<{ g: THREE.Group; m: number }> = [];
  for (let m = 10; m <= 200; m += 10) {
    const g = new THREE.Group();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 6), toon(0x8a5a2b));
    post.position.y = 0.9;
    g.add(post);
    const board = textSprite(`${m} m`, { color: '#3a2a10', bg: '#ffe9a8', size: 52, width: 1.6 });
    board.position.y = 2.0;
    board.material.fog = false;
    board.material.depthTest = true;
    g.add(board);
    g.position.set(m, 0, 2.0);
    g.visible = false;
    world.add(g);
    signs.push({ g, m });
  }

  // Felsen (rollt) mit Gesicht
  const rockGeo = new THREE.IcosahedronGeometry(1.35, 1).toNonIndexed();
  rockGeo.computeVertexNormals();
  const ROCK_X = 0.2;
  const rockGroup = new THREE.Group();
  rockGroup.position.set(ROCK_X, 1.35, 0.2);
  world.add(rockGroup);
  const rock = new THREE.Mesh(rockGeo, toon(0xa89a8a));
  rockGroup.add(rock);
  const rockSpots = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), toon(0x8a7d6e));
  rockSpots.position.set(-0.6, 0.8, 1.1);
  rock.add(rockSpots);
  const face = new THREE.Group();
  face.position.set(0, 0.2, 1.28);
  rockGroup.add(face);
  for (const sx of [-0.45, 0.45]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.27, 12, 10), toon(0xffffff));
    e.position.set(sx, 0.25, 0);
    e.scale.set(1, 1, 0.5);
    face.add(e);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), toon(0x1c1228));
    p.position.set(sx - 0.05, 0.22, 0.12);
    face.add(p);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.1), toon(0x4a3f35));
    brow.position.set(sx, 0.58, 0.05);
    brow.rotation.z = sx > 0 ? 0.35 : -0.35;
    face.add(brow);
  }
  const rMouth = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.07, 6, 14, Math.PI), toon(0x4a3f35));
  rMouth.position.set(0, -0.4, 0);
  face.add(rMouth);
  const rockShadow = new THREE.Mesh(new THREE.CircleGeometry(1.7, 24), glow(0x2c5a2a, 0.35));
  rockShadow.rotation.x = -Math.PI / 2;
  rockShadow.position.set(ROCK_X, 0.06, 0.2);
  world.add(rockShadow);

  // Eigene Figur stemmt sich von links gegen den Felsen (Blick nach +x)
  const me = makeMe(ctx, 1.5);
  root.remove(me.group);
  world.add(me.group);
  const HERO_X = -2.35;
  me.group.position.set(HERO_X, 0, 0.2);
  // leicht zur Kamera gedreht, damit man das Gesicht sieht
  me.rig.faceTowards(Math.PI / 2 - 0.55);
  me.rig.play('run', { loop: true });
  // Schwung-Aura
  const auraMat = glow(0xffd23f, 0);
  auraMat.depthWrite = false;
  const aura = new THREE.Mesh(new THREE.SphereGeometry(1.15, 18, 12), auraMat);
  aura.position.set(0, 1.0, 0);
  aura.scale.set(0.9, 1.15, 0.9);
  me.group.add(aura);

  // Mitspieler auf Nachbarbahnen, jeder mit eigenem Felsen
  const LANE_Z = [-3.4, -6.0, -8.6];
  const rivals = makeRivals(ctx, 0.9);
  const rivalRocks = rivals.map((r, i) => {
    root.remove(r.group);
    world.add(r.group);
    r.rig.faceTowards(Math.PI / 2);
    r.rig.play('run', { loop: true });
    const rk = new THREE.Mesh(rockGeo, toon(0xb7aa9c));
    rk.scale.setScalar(0.62);
    world.add(rk);
    const lane = new THREE.Mesh(new THREE.BoxGeometry(120, 0.05, 1.7), toon(0xdcb878));
    lane.position.set(0, 0.02, LANE_Z[i % 3] as number);
    world.add(lane);
    return rk;
  });
  const rivalVis = rivals.map(() => 0);
  const rivalStumble = rivals.map(() => 0);
  const rivalShock = rivals.map(() => 0);

  // Kraftleiste mit Schwung-Stufen (kippt nicht mit)
  const gauge = new THREE.Group();
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
  const pips: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const pip = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), glow(0x5a4f9a));
    pip.position.set(2.5 + i * 0.52, 0, 0.1);
    gauge.add(pip);
    pips.push(pip);
  }
  const sign = (txt: string, fg: string, bg: string, w: number): THREE.Sprite => {
    const sp = textSprite(txt, { color: fg, bg, size: 64, width: w });
    sp.material.fog = false;
    sp.visible = false;
    root.add(sp);
    return sp;
  };
  const warnSign = sign('BÖE KOMMT!', '#ffffff', '#ff4d6d', 3.6);
  const holdSign = sign('HALTEN!', '#2a2060', '#ffe066', 3.0);
  const hillSign = sign('BERGAUF!', '#ffffff', '#7a5cff', 3.3);
  const sprintSign = sign('ENDSPURT ×2', '#2a2060', '#ffd23f', 4.2);
  const sprintBanner = sign('ENDSPURT ×2', '#2a2060', '#ffd23f', 2.8);
  const stumbleSign = sign('Stolperer!', '#ffffff', '#ff4d6d', 2.6);
  const flowSigns = [1, 2, 3].map((l) =>
    sign(`SCHWUNG ${l}`, '#2a2060', ['#ffe066', '#ffb347', '#ff7a8a'][l - 1] as string, 3.0),
  );
  const braveSign = sign('Gehalten! +', '#2a2060', '#7dffd8', 3.0);

  // Windstreifen
  const WS = 30;
  const wind = new THREE.InstancedMesh(new THREE.BoxGeometry(2.6, 0.12, 0.12), glow(0xffffff, 0.9), WS);
  root.add(wind);
  const windSeed = Array.from({ length: WS }, (_, i) => ({
    y: 0.4 + ((i * 37) % 60) / 10,
    z: -8 + ((i * 53) % 100) / 10,
    off: ((i * 29) % 100) / 100,
    sp: 0.8 + ((i * 17) % 10) / 20,
  }));
  const shieldMat = glow(0x7dffd8, 0.22);
  shieldMat.depthWrite = false;
  const shield = new THREE.Mesh(new THREE.SphereGeometry(1.7, 20, 14), shieldMat);
  shield.visible = false;
  world.add(shield);

  let t = 0;
  let visDist = 0;
  let lastTap = 0;
  let lastStumble = 0;
  let wasGust = false;
  let lastBraved = 0;
  let lastMark = 0;
  let lastFlow = 0;
  let lastSec = 'wiese';
  let squash = 0;
  let lastAspect = 0;
  let shake = 0;
  let tilt = 0;
  let relMax = 13;
  let popT = 9;
  let popSign: THREE.Sprite | null = null;
  let anim = '';
  let ended = false;
  const bp = new THREE.Vector3();
  const colA = new THREE.Color(0x39ff9a);
  const colB = new THREE.Color(0xffe066);
  const colC = new THREE.Color(0xff4d6d);
  const tmpC = new THREE.Color();
  const look = new THREE.Vector3(-0.6, 2.0, -2);
  const camPos = new THREE.Vector3();

  const placeCamera = () => {
    lastAspect = camera.aspect;
    const portrait = camera.aspect < 1;
    const d = portrait ? Math.min(24, 9.5 / camera.aspect) : Math.max(14, 12.5 / camera.aspect);
    camPos.set(-0.8, 4.2 + d * 0.12, d);
    look.set(-0.8, portrait ? 2.6 : 2.0, -2);
    relMax = portrait ? 4.2 : 13;
    // Kraftleiste und Schilder knapp über dem Geschehen
    gauge.position.set(-1.0, camera.aspect < 1 ? 6.4 : 5.5, 1.5);
    gauge.scale.setScalar(camera.aspect < 1 ? 0.8 : 1);
  };
  placeCamera();
  const play = (a: 'run' | 'idle' | 'shock' | 'celebrate' | 'lose' | 'walk', speed = 1) => {
    if (anim === a && (a === 'shock' || a === 'celebrate' || a === 'lose')) return;
    anim = a;
    me.rig.play(a, { loop: a === 'run' || a === 'idle' || a === 'walk', speed });
  };
  const pop = (sp: THREE.Sprite) => {
    if (popSign) popSign.visible = false;
    popSign = sp;
    popT = 0;
  };

  return {
    update(s, dt) {
      t += dt;
      if (Math.abs(camera.aspect - lastAspect) > 0.001) placeCamera();
      visDist += (s.dist - visDist) * Math.min(1, dt * 10);
      const gi = gustAt(s.gusts, s.t);
      const gust = gi >= 0;
      const warn = warnAt(s.gusts, s.t);
      const sec = sectionAt(s.t);
      const lvl = flowLevel(s.flow);
      const strain = s.power / 100;
      const D = visDist;

      // Bergauf kippt die Welt
      tilt += ((sec === 'berg' ? 0.13 : 0) - tilt) * Math.min(1, dt * 2.5);
      world.rotation.z = tilt;

      // Landschaft scrollt (Parallax)
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
        const z = -11 - (i % 3) * 1.8;
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
        tmp.position.set(x, 3.5 * sc, -26 - (i % 2) * 4);
        tmp.updateMatrix();
        mounts.setMatrixAt(i, tmp.matrix);
        tmp.position.set(x, 3.5 * sc + 2.55 * sc, -26 - (i % 2) * 4);
        tmp.updateMatrix();
        caps.setMatrixAt(i, tmp.matrix);
      }
      mounts.instanceMatrix.needsUpdate = true;
      caps.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < CL; i++) {
        const x = ((((i * 11 - D * 0.06 - t * 0.4) % 80) + 80) % 80) - 38;
        const y = 12 + (i % 3) * 2.4;
        for (let k = 0; k < 3; k++) {
          tmp.position.set(x + (k - 1) * 1.6, y + (k === 1 ? 0.5 : 0), -22);
          tmp.scale.set(1.6 - Math.abs(k - 1) * 0.3, 1.1, 1);
          tmp.updateMatrix();
          clouds.setMatrixAt(i * 3 + k, tmp.matrix);
        }
      }
      clouds.instanceMatrix.needsUpdate = true;
      for (const sg of signs) {
        const x = sg.m - D + HERO_X;
        sg.g.visible = x > -26 && x < 24;
        sg.g.position.x = x;
      }

      // Felsen rollt, wackelt in Böen
      const blown = gust && !s.bracing;
      rock.rotation.z = -D / 1.35;
      rockGroup.position.y = 1.35 + (blown ? Math.sin(t * 30) * 0.04 : 0);
      rockGroup.position.x = ROCK_X + (blown ? -0.25 : 0);
      rockShadow.position.x = rockGroup.position.x;
      rMouth.rotation.z = s.power > 25 ? 0 : Math.PI;
      rMouth.scale.setScalar(0.6 + strain * 0.8);

      // Eigene Figur
      squash = Math.max(0, squash - dt * 6);
      const hx = HERO_X + (blown ? -0.45 : 0);
      me.group.position.x += (hx - me.group.position.x) * Math.min(1, dt * 8);
      const lean = 0.06 + strain * 0.16 + (gust && s.bracing ? 0.1 : 0) + squash * 0.05;
      me.group.rotation.z = -lean;
      me.group.position.y = gust && s.bracing ? -0.05 : 0;
      if (s.t >= 1200) {
        if (!ended) {
          ended = true;
          play('celebrate');
        }
      } else if (s.stumbleSeq !== lastStumble) play('shock');
      else if (anim === 'shock' && me.rig.current === 'idle') play('run');
      else if (anim !== 'shock') {
        if (blown) play('walk', 0.6);
        else if (gust) play('idle');
        else play('run', 0.5 + strain * 1.6 + lvl * 0.25);
      }
      me.rig.update(dt);
      const aOp = lvl > 0 ? 0.12 + lvl * 0.07 + Math.sin(t * 14) * 0.03 : 0;
      auraMat.opacity += (aOp - auraMat.opacity) * Math.min(1, dt * 8);
      auraMat.color.setHex(FLOW_COLORS[lvl] as number);
      aura.visible = auraMat.opacity > 0.01;
      shield.visible = gust && s.bracing;
      shield.scale.setScalar(1 + Math.sin(t * 12) * 0.04);
      shield.position.set(me.group.position.x + 0.2, 1.1, 0.2);

      // Kraftleiste
      const f = Math.max(0.001, strain);
      gFill.scale.x = f;
      gFill.position.x = -(3.95 * (1 - f)) / 2;
      gFillMat.color.copy(
        f < 0.5 ? tmpC.copy(colC).lerp(colB, f * 2) : tmpC.copy(colB).lerp(colA, (f - 0.5) * 2),
      );
      gauge.scale.setScalar((camera.aspect < 1 ? 0.8 : 1) * (1 + (gust ? 0.08 : 0) + squash * 0.04));
      for (let i = 0; i < 3; i++) {
        const on = i < lvl;
        const pp = pips[i] as THREE.Mesh;
        (pp.material as THREE.MeshBasicMaterial).color.setHex(on ? (FLOW_COLORS[i + 1] as number) : 0x5a4f9a);
        pp.rotation.y = t * (on ? 6 : 1);
        pp.scale.setScalar(on ? 1.15 + Math.sin(t * 10 + i) * 0.1 : 0.85);
      }
      const gy = gauge.position.y;
      const signY = gy + 1.0;
      warnSign.visible = warn && Math.floor(t * 8) % 2 === 0;
      warnSign.position.set(-1.0, signY, 1.6);
      holdSign.visible = gust && !s.bracing;
      holdSign.position.set(-1.0, signY, 1.6);
      const hs = 1 + Math.sin(t * 12) * 0.06;
      holdSign.scale.set(3.0 * hs, 0.62 * hs, 1);

      // Einblendungen (eine zur Zeit)
      if (popSign) {
        popT += dt;
        popSign.visible = popT < 1.1 && !gust && !warn;
        popSign.position.set(-1.0, signY + popT * 0.4, 1.6);
        popSign.material.opacity = Math.min(1, (1.1 - popT) * 4);
      }

      // Wind
      for (let i = 0; i < WS; i++) {
        const w = windSeed[i]!;
        if (!gust && !warn) {
          tmp.position.set(0, -50, 0);
          tmp.scale.setScalar(0.001);
        } else {
          const cyc = (((t * 1.6 * w.sp + w.off) % 1) + 1) % 1;
          tmp.position.set(16 - cyc * 36, w.y, w.z);
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
        if (s.taps % 4 === 0) ctx.sfx('tick');
        bp.set(me.group.position.x - 0.5, 0.2, 0.8);
        if (s.taps % 2 === 0 && s.power > 20) ctx.burst(bp, lvl >= 2 ? 0xffb03a : 0xe9c17a, 3 + lvl);
      }
      if (s.stumbleSeq !== lastStumble) {
        lastStumble = s.stumbleSeq;
        ctx.sfx('bad');
        shake = Math.max(shake, 0.25);
        bp.set(me.group.position.x, 2.2, 0.8);
        ctx.burst(bp, 0xff4d6d, 12);
        pop(stumbleSign);
      }
      if (lvl > lastFlow) {
        ctx.sfx(lvl === 3 ? 'win' : 'good');
        bp.set(me.group.position.x, 1.2, 0.6);
        ctx.burst(bp, FLOW_COLORS[lvl] as number, 10 + lvl * 6);
        pop(flowSigns[lvl - 1] as THREE.Sprite);
      }
      lastFlow = lvl;
      if (gust !== wasGust) {
        if (gust) ctx.sfx('whoosh');
        wasGust = gust;
      }
      if (s.braved !== lastBraved) {
        lastBraved = s.braved;
        ctx.sfx('good');
        bp.set(me.group.position.x + 0.5, 2.2, 1);
        ctx.burst(bp, 0x7dffd8, 22);
        pop(braveSign);
      }
      if (sec !== lastSec) {
        lastSec = sec;
        ctx.sfx(sec === 'sprint' ? 'win' : 'beep');
        pop(sec === 'sprint' ? sprintSign : hillSign);
      }
      const mark = Math.floor(s.dist / 10);
      if (mark > lastMark) {
        lastMark = mark;
        ctx.sfx('coin');
        bp.set(me.group.position.x + 1.5, 3.2, 1);
        ctx.burst(bp, 0xffe066, 18);
      }
      sprintBanner.visible = sec === 'sprint' && popSign !== sprintSign && !gust && !warn;
      sprintBanner.position.set(-1.0, signY, 1.6);
      sprintBanner.material.opacity = 0.75 + Math.sin(t * 8) * 0.2;

      // Kamera: leichtes Wackeln bei Böe und Stolperer
      shake = Math.max(blown ? 0.16 : gust ? 0.05 : 0, shake - dt * 1.5);
      camera.position.set(
        camPos.x + Math.sin(t * 50) * shake,
        camPos.y + Math.cos(t * 43) * shake * 0.5,
        camPos.z,
      );
      camera.lookAt(look);
    },
    ghosts(states, dt) {
      updateRivals(rivals, states, dt, (r, rs, i) => {
        const z = LANE_Z[i % 3] as number;
        // Abstand zur eigenen Strecke: 1 m = 1 Einheit, am Bildrand festgehalten
        rivalVis[i] = (rivalVis[i] as number) + (rs.dist - (rivalVis[i] as number)) * Math.min(1, dt * 10);
        const rel = THREE.MathUtils.clamp((rivalVis[i] as number) - visDist, -relMax, relMax);
        const g = gustAt(rs.gusts, rs.t) >= 0;
        const blown = g && !rs.bracing;
        const x = HERO_X + 0.4 + rel + (blown ? -0.3 : 0);
        r.group.position.set(x, 0, z);
        r.group.rotation.z = -(0.1 + (rs.power / 100) * 0.25);
        const rk = rivalRocks[i] as THREE.Mesh;
        rk.position.set(x + 1.45, 0.95 + (blown ? Math.sin(t * 30 + i) * 0.03 : 0), z);
        rk.rotation.z = -(rivalVis[i] as number) / 0.95;
        rk.visible = r.group.visible;
        if (rs.stumbleSeq !== rivalStumble[i]) {
          rivalStumble[i] = rs.stumbleSeq;
          rivalShock[i] = 0.6;
          r.rig.play('shock');
        }
        rivalShock[i] = Math.max(0, (rivalShock[i] as number) - dt);
        if (rs.t >= 1200) {
          if (r.rig.current !== 'celebrate') r.rig.play('celebrate');
        } else if ((rivalShock[i] as number) <= 0)
          r.rig.play(blown ? 'walk' : g ? 'idle' : 'run', {
            loop: true,
            speed: blown || g ? 1 : 0.5 + (rs.power / 100) * 1.6,
          });
      });
      rivalRocks.forEach((rk, i) => (rk.visible = states[i] != null));
    },
    dispose() {
      ctx.scene.fog = null;
    },
  };
};
