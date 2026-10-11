import * as THREE from 'three';
import { LANE_W, type DashCoin, type DashRow, type DashState } from '@shared/minigames/games/hindernisdash';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { glow, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';

/** Hindernis-Dash: Neon-Zuckerbahn im Abendrot. Läufer von hinten, Welt rauscht entgegen. */
export const createView: MiniGameViewFactory<DashState> = (ctx) => {
  const { root, camera, scene } = ctx;
  scene.background = new THREE.Color(0xff8a5c);
  scene.fog = new THREE.Fog(0x7a3b9c, 45, 135);
  const SLOTS = 12;
  const VISIBLE = 92;

  // ---------- Himmel: Sonne mit Streifen ----------
  const sky = new THREE.Group();
  root.add(sky);
  const sunMat = glow(0xffe86b);
  sunMat.fog = false;
  const sun = new THREE.Mesh(new THREE.CircleGeometry(26, 40), sunMat);
  sun.position.set(0, 20, -150);
  sky.add(sun);
  const sunRim = new THREE.Mesh(new THREE.CircleGeometry(33, 40), glow(0xffb347, 0.5));
  (sunRim.material as THREE.MeshBasicMaterial).fog = false;
  sunRim.position.set(0, 20, -151);
  sky.add(sunRim);
  for (let i = 0; i < 5; i++) {
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(70, 1.0 + i * 0.55), glow(0xff8a5c));
    (bar.material as THREE.MeshBasicMaterial).fog = false;
    bar.position.set(0, 9 + i * 3.2, -149);
    sky.add(bar);
  }
  const hillMat = toon(0x52277f);
  for (let i = 0; i < 9; i++) {
    const h = new THREE.Mesh(new THREE.ConeGeometry(14, 16 + (i % 3) * 7, 5), hillMat);
    h.position.set(-100 + i * 25, 4, -135 - (i % 2) * 10);
    sky.add(h);
  }

  // ---------- Bahn ----------
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(300, 400), glow(0x3b1a6b));
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.06, -120);
  root.add(ground);
  const track = new THREE.Mesh(new THREE.PlaneGeometry(LANE_W * 3 + 0.4, 400), glow(0x5a3aa8));
  track.rotation.x = -Math.PI / 2;
  track.position.set(0, -0.02, -120);
  root.add(track);
  for (const sx of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 400), glow(sx < 0 ? 0xff4fd8 : 0x3de7ff));
    rail.position.set(sx * (LANE_W * 1.5 + 0.3), 0.14, -120);
    root.add(rail);
  }
  // Spurtrenner (laufende Striche)
  const DASH = 20;
  const dashMesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.12, 0.03, 2.2),
    glow(0xcbb8ff, 0.9),
    DASH * 2,
  );
  root.add(dashMesh);
  // Seitendeko: Lollipops
  const POSTS = 16;
  const stemMesh = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.16, 0.2, 1, 8),
    toon(0xfff1d6),
    POSTS * 2,
  );
  const topMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), toon(0xffffff), POSTS * 2);
  root.add(stemMesh, topMesh);
  const candy = [0xff4f9a, 0x3de7ff, 0xffd23f, 0x8dff6a, 0xb18cff, 0xff7a3d].map((c) => new THREE.Color(c));
  const hash = (i: number): number =>
    (((Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(i + 3, 0x85ebca6b)) >>> 8) & 0xffff) / 65536;
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const sc = new THREE.Vector3();
  const pos = new THREE.Vector3();

  /** Fasst eine Gruppe aus Primitiven zu EINEM Mesh mit Vertexfarben zusammen (spart Draw Calls). */
  const vcMat = toon(0xffffff).clone();
  vcMat.vertexColors = true;
  vcMat.userData = {};
  const bake = (grp: THREE.Group): THREE.Mesh => {
    grp.updateMatrixWorld(true);
    const geos: THREE.BufferGeometry[] = [];
    grp.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const geo = m.geometry.clone();
      geo.applyMatrix4(m.matrixWorld);
      geo.deleteAttribute('uv');
      const col = (m.material as THREE.MeshToonMaterial).color;
      const n = geo.getAttribute('position').count;
      const arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) col.toArray(arr, i * 3);
      geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
      geos.push(geo);
    });
    return new THREE.Mesh(mergeGeometries(geos, false) as THREE.BufferGeometry, vcMat);
  };

  // ---------- Hindernis-Pool ----------
  const posts = toon(0xf4f0ff);
  const red = toon(0xff3d6e);
  const white = toon(0xffffff);
  const yellow = toon(0xffd23f);
  const black = toon(0x2b2140);
  const wallMat = toon(0x8f5bff);
  const wallTop = toon(0xc9a6ff);
  interface Cell {
    g: THREE.Group;
    low: THREE.Object3D;
    high: THREE.Object3D;
    wall: THREE.Object3D;
    lamp: THREE.Mesh;
  }
  const lampOn = glow(0xff3030);
  const lampOff = glow(0x551111);
  const makeCell = (): Cell => {
    const g = new THREE.Group();
    // Hürde
    const low = new THREE.Group();
    for (const sx of [-0.85, 0.85]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.0, 8), posts);
      p.position.set(sx, 0.5, 0);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.9), black);
      foot.position.set(sx, 0.04, 0);
      low.add(p, foot);
    }
    for (let i = 0; i < 5; i++) {
      const seg = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.26, 0.26), i % 2 ? white : red);
      seg.position.set(-0.72 + i * 0.36, 0.78, 0);
      low.add(seg);
    }
    // Balken
    const high = new THREE.Group();
    for (const sx of [-0.98, 0.98]) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.1, 0.3), posts);
      p.position.set(sx, 1.05, 0);
      high.add(p);
    }
    for (let i = 0; i < 6; i++) {
      const seg = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.7, 0.5), i % 2 ? black : yellow);
      seg.position.set(-0.83 + i * 0.33, 1.45, 0);
      high.add(seg);
    }
    // Mauer
    const wall = new THREE.Group();
    const block = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2.3, 1.1), wallMat);
    block.position.y = 1.15;
    const cap = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.22, 1.25), wallTop);
    cap.position.y = 2.4;
    wall.add(block, cap);
    for (let i = 0; i < 3; i++) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.08, 1.15), toon(0x6d3dd8));
      line.position.y = 0.55 + i * 0.7;
      wall.add(line);
    }
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), lampOn);
    lamp.position.set(0, 2.7, 0);
    const lowM = bake(low);
    const highM = bake(high);
    const wallM = bake(wall);
    wallM.add(lamp);
    g.add(lowM, highM, wallM);
    root.add(g);
    return { g, low: lowM, high: highM, wall: wallM, lamp };
  };
  const cells: Cell[] = [];
  for (let i = 0; i < SLOTS * 3; i++) cells.push(makeCell());

  // ---------- Münzen ----------
  const COINS = 70;
  const coinGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.09, 16);
  coinGeo.rotateX(Math.PI / 2);
  const coinMesh = new THREE.InstancedMesh(
    coinGeo,
    toon(0xffd23f, { emissive: 0xffa200, emissiveIntensity: 0.8 }),
    COINS,
  );
  root.add(coinMesh);

  // ---------- Läufer ----------
  const hero = new THREE.Group();
  const body = new THREE.Group();
  hero.add(body);
  root.add(hero);
  const skin = toon(0x37c8ff);
  const skinDark = toon(0x1f93d6);
  const visor = toon(0x23123f);
  const orangeM = toon(0xff9d2e);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.45, 6, 12), skin);
  torso.position.y = 0.88;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 12), skin);
  head.position.y = 1.5;
  const vis = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10, -1.1, 2.2, 0.5, 1.3), visor);
  vis.position.set(0, 1.55, 0.14);
  vis.rotation.y = Math.PI;
  vis.scale.set(1.0, 0.9, 1.0);
  const visFront = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.2, 0.2), visor);
  visFront.position.set(0, 1.55, 0.3);
  const glint = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.02), glow(0xffffff));
  glint.position.set(0.12, 1.6, 0.41);
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6), orangeM);
  antenna.position.set(0, 1.98, 0);
  const antBall = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), orangeM);
  antBall.position.set(0, 2.15, 0);
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.2), orangeM);
  pack.position.set(0, 0.95, -0.34);
  const legL = new THREE.Group();
  const legR = new THREE.Group();
  for (const lg of [legL, legR]) {
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.3, 4, 8), skinDark);
    thigh.position.y = -0.22;
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.4), orangeM);
    shoe.position.set(0, -0.44, 0.07);
    lg.add(thigh, shoe);
    lg.position.set(lg === legL ? -0.17 : 0.17, 0.62, 0);
    body.add(lg);
  }
  const armL = new THREE.Group();
  const armR = new THREE.Group();
  for (const am of [armL, armR]) {
    const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.28, 4, 8), skinDark);
    a.position.y = -0.2;
    am.add(a);
    am.position.set(am === armL ? -0.42 : 0.42, 1.1, 0);
    body.add(am);
  }
  body.add(torso, head, vis, visFront, glint, antenna, antBall, pack);
  // Betäubungs-Sterne
  const dizzy = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const st = new THREE.Mesh(new THREE.OctahedronGeometry(0.13), glow(0xffe34d));
    st.position.set(Math.cos((i / 3) * Math.PI * 2) * 0.5, 0, Math.sin((i / 3) * Math.PI * 2) * 0.5);
    dizzy.add(st);
  }
  dizzy.position.y = 2.35;
  hero.add(dizzy);
  // Schatten
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.5, 16),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  root.add(shadow);

  let t = 0;
  let shake = 0;
  let lastJumps = 0;
  let lastSlides = 0;
  let lastCrashes = 0;
  let lastCoins = 0;
  let lastLands = 0;
  let camPX = 0;
  const heroPos = new THREE.Vector3();

  return {
    update(s, dt) {
      t += dt;
      // ---------- Ereignisse ----------
      heroPos.set(s.px, s.py + 0.8, 0);
      if (s.jumps !== lastJumps) {
        lastJumps = s.jumps;
        ctx.sfx('jump');
        ctx.burst(new THREE.Vector3(s.px, 0.1, 0.2), 0xffffff, 6);
      }
      if (s.slides !== lastSlides) {
        lastSlides = s.slides;
        ctx.sfx('whoosh');
      }
      if (s.lands !== lastLands) {
        lastLands = s.lands;
        ctx.burst(new THREE.Vector3(s.px, 0.1, 0.2), 0xd9c6ff, 4);
      }
      if (s.crashes !== lastCrashes) {
        lastCrashes = s.crashes;
        ctx.sfx('hit');
        ctx.burst(new THREE.Vector3(s.px, 1.0, -0.8), 0xff5a5a, 18);
        shake = 0.5;
      }
      if (s.coinCount !== lastCoins) {
        lastCoins = s.coinCount;
        ctx.sfx('coin');
        ctx.burst(new THREE.Vector3(s.px, s.py + 1.1, -0.4), 0xffd23f, 6);
      }

      // ---------- Spurstriche ----------
      for (let i = 0; i < DASH; i++) {
        const zw = -(i * 7 - (s.z % 7)) - 3;
        for (let k = 0; k < 2; k++) {
          pos.set((k === 0 ? -1 : 1) * (LANE_W / 2), 0.0, zw);
          m4.compose(pos, q.identity(), sc.set(1, 1, 1));
          dashMesh.setMatrixAt(i * 2 + k, m4);
        }
      }
      dashMesh.instanceMatrix.needsUpdate = true;
      // ---------- Lollipops ----------
      const SP = 11;
      const base = Math.floor(s.z / SP);
      for (let i = 0; i < POSTS; i++) {
        const idx = base + i;
        const zw = -(i * SP - (s.z - base * SP)) - 4;
        for (let k = 0; k < 2; k++) {
          const side = k === 0 ? -1 : 1;
          const h = hash(idx * 2 + k);
          const hgt = 2.2 + h * 3.2;
          const x = side * (LANE_W * 1.5 + 2.0 + h * 2.8);
          const j = i * 2 + k;
          pos.set(x, hgt / 2, zw);
          m4.compose(pos, q.identity(), sc.set(1, hgt, 1));
          stemMesh.setMatrixAt(j, m4);
          const rr = 0.85 + hash(idx * 3 + k + 7) * 0.7;
          pos.set(x, hgt + rr * 0.6, zw);
          m4.compose(pos, q.identity(), sc.set(rr, rr, rr));
          topMesh.setMatrixAt(j, m4);
          topMesh.setColorAt(
            j,
            candy[Math.floor(hash(idx * 5 + k) * candy.length) % candy.length] as THREE.Color,
          );
        }
      }
      stemMesh.instanceMatrix.needsUpdate = true;
      topMesh.instanceMatrix.needsUpdate = true;
      if (topMesh.instanceColor) topMesh.instanceColor.needsUpdate = true;
      sky.position.x = camPX * 0.9;

      // ---------- Hindernisse ----------
      let slot = 0;
      for (let i = s.curRow; i < s.rows.length && slot < SLOTS; i++) {
        const r = s.rows[i] as DashRow;
        const dz = r.z - s.z;
        if (dz > VISIBLE) break;
        if (dz < -6) continue;
        for (let l = 0; l < 3; l++) {
          const cell = cells[slot * 3 + l] as Cell;
          const v = r.c[l] as number;
          cell.g.visible = v >= 0;
          if (v < 0) continue;
          cell.g.position.set((l - 1) * LANE_W, 0, -dz - 0.6);
          cell.low.visible = v === 0;
          cell.high.visible = v === 1;
          cell.wall.visible = v === 2;
          if (v === 2) cell.lamp.material = Math.floor(t * 4 + i) % 2 ? lampOn : lampOff;
        }
        slot++;
      }
      for (let k = slot * 3; k < cells.length; k++) (cells[k] as Cell).g.visible = false;

      // ---------- Münzen ----------
      let n = 0;
      for (let i = s.curCoin; i < s.coins.length && n < COINS; i++) {
        const c = s.coins[i] as DashCoin;
        const dz = c.z - s.z;
        if (dz > VISIBLE) break;
        if (c.got || dz < -4) continue;
        pos.set(c.lane * LANE_W, c.y + Math.sin(t * 4 + i) * 0.05, -dz);
        q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), t * 4 + i * 0.7);
        m4.compose(pos, q, sc.set(1, 1, 1));
        coinMesh.setMatrixAt(n++, m4);
      }
      coinMesh.count = n;
      coinMesh.instanceMatrix.needsUpdate = true;

      // ---------- Läufer ----------
      hero.position.set(s.px, s.py, 0);
      const stunned = s.stun > 0;
      const sliding = s.slideT > 0;
      const air = s.py > 0.02;
      const phase = t * (11 + s.pace * 5);
      const lean = THREE.MathUtils.clamp((s.lane * LANE_W - s.px) * 0.15, -0.35, 0.35);
      body.rotation.z = -lean + (stunned ? Math.sin(t * 30) * 0.12 : 0);
      body.rotation.x = sliding ? -1.25 : air ? -0.15 : 0.1;
      body.position.y = sliding ? -0.55 : stunned ? -0.1 : air ? 0 : Math.abs(Math.sin(phase)) * 0.08;
      body.position.z = sliding ? 0.2 : 0;
      const sw = stunned ? 0 : Math.sin(phase) * (air ? 0.2 : 0.9);
      legL.rotation.x = air ? -0.7 : sw;
      legR.rotation.x = air ? 0.4 : -sw;
      armL.rotation.x = air ? -2.5 : -sw * 0.9;
      armR.rotation.x = air ? -2.5 : sw * 0.9;
      const sy = air ? 1 + Math.min(0.15, Math.abs(s.vy) * 0.015) : 1;
      body.scale.set(1 / Math.sqrt(sy), sy, 1 / Math.sqrt(sy));
      hero.visible = s.invuln <= 0 || Math.floor(s.invuln / 3) % 2 === 0 || s.stun > 0;
      dizzy.visible = stunned;
      dizzy.rotation.y = t * 8;
      shadow.position.set(s.px, 0.02, 0);
      shadow.scale.setScalar(1 - Math.min(0.5, s.py * 0.3));

      // ---------- Kamera ----------
      const aspect = camera.aspect;
      const back = aspect < 1 ? 11.5 : 7.6;
      const hgt = aspect < 1 ? 5.6 : 3.7;
      camPX += (s.px * 0.6 - camPX) * Math.min(1, dt * 6);
      shake = Math.max(0, shake - dt * 2.5);
      const sx = Math.sin(t * 61) * shake * 0.15;
      const sy2 = Math.cos(t * 53) * shake * 0.12;
      camera.position.set(camPX + sx, hgt + sy2 + s.py * 0.25, back);
      camera.lookAt(camPX * 0.8, 1.1, -12);
      camera.fov = 58 + s.pace * 6;
      camera.updateProjectionMatrix();
    },
    dispose() {
      scene.fog = null;
    },
  };
};
