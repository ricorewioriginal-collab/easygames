import * as THREE from 'three';
import { LANE_W, type DashCoin, type DashRow, type DashState } from '@shared/minigames/games/hindernisdash';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { glow, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';
import { makeMe, makeRivals, updateRivals } from './rivals';

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

  // ---------- Turbo-Felder ----------
  const BOOSTS = 8;
  const arrow = new THREE.Shape();
  arrow.moveTo(-0.75, -0.2);
  arrow.lineTo(0, 0.45);
  arrow.lineTo(0.75, -0.2);
  arrow.lineTo(0.75, -0.55);
  arrow.lineTo(0, 0.1);
  arrow.lineTo(-0.75, -0.55);
  arrow.closePath();
  const arrowGeo = new THREE.ShapeGeometry(arrow);
  arrowGeo.rotateX(-Math.PI / 2);
  const padGeo = new THREE.PlaneGeometry(1.9, 2.6);
  padGeo.rotateX(-Math.PI / 2);
  const padMat = glow(0x14e0ff, 0.35);
  padMat.depthWrite = false;
  const arrowMat = glow(0x9cf6ff);
  const pads: THREE.Group[] = [];
  for (let i = 0; i < BOOSTS; i++) {
    const g = new THREE.Group();
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.y = 0.015;
    g.add(pad);
    for (let k = 0; k < 3; k++) {
      const a = new THREE.Mesh(arrowGeo, arrowMat);
      a.position.set(0, 0.03, 0.75 - k * 0.75);
      g.add(a);
    }
    g.visible = false;
    root.add(g);
    pads.push(g);
  }

  // ---------- Läufer: eigene Figur, Mitspieler halbdurchsichtig ----------
  const me = makeMe(ctx, 0.95);
  const hero = me.group;
  hero.rotation.y = Math.PI;
  me.ring.visible = false;
  const rivals = makeRivals(ctx, 0.9);
  rivals.forEach((r) => {
    r.group.rotation.y = Math.PI;
    r.ring.visible = false;
  });
  const rivalSeen = rivals.map(() => ({ jumps: 0, slides: 0, crashes: 0 }));
  let myZ = 0;
  // Betäubungs-Sterne
  const dizzy = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const st = new THREE.Mesh(new THREE.OctahedronGeometry(0.13), glow(0xffe34d));
    st.position.set(Math.cos((i / 3) * Math.PI * 2) * 0.5, 0, Math.sin((i / 3) * Math.PI * 2) * 0.5);
    dizzy.add(st);
  }
  dizzy.position.y = 2.35;
  hero.add(dizzy);
  let t = 0;
  let shake = 0;
  let lastJumps = 0;
  let lastSlides = 0;
  let lastCrashes = 0;
  let lastCoins = 0;
  let lastLands = 0;
  let lastBoosts = 0;
  let boostTrail = 0;
  let fovBoost = 0;
  let camPX = 0;
  const heroPos = new THREE.Vector3();

  return {
    update(s, dt) {
      t += dt;
      // ---------- Ereignisse ----------
      heroPos.set(s.px, s.py + 0.8, 0);
      if (s.jumps !== lastJumps) {
        lastJumps = s.jumps;
        me.rig.play('jump', { speed: 1.4 });
        ctx.sfx('jump');
        ctx.burst(new THREE.Vector3(s.px, 0.1, 0.2), 0xffffff, 6);
      }
      if (s.slides !== lastSlides) {
        lastSlides = s.slides;
        me.rig.play('roll', { speed: 1.6 });
        ctx.sfx('whoosh');
      }
      if (s.lands !== lastLands) {
        lastLands = s.lands;
        ctx.burst(new THREE.Vector3(s.px, 0.1, 0.2), 0xd9c6ff, 4);
      }
      if (s.crashes !== lastCrashes) {
        lastCrashes = s.crashes;
        me.rig.play('shock');
        ctx.sfx('hit');
        ctx.burst(new THREE.Vector3(s.px, 1.0, -0.8), 0xff5a5a, 18);
        shake = 0.5;
      }
      if (s.boostCount !== lastBoosts) {
        lastBoosts = s.boostCount;
        ctx.sfx('whoosh');
        ctx.sfx('good');
        ctx.burst(new THREE.Vector3(s.px, 0.6, -0.5), 0x3de7ff, 22);
      }
      if (s.boost > 0) {
        boostTrail -= dt;
        if (boostTrail <= 0) {
          boostTrail = 0.05;
          ctx.burst(
            new THREE.Vector3(s.px + (Math.random() - 0.5) * 1.2, 0.4 + Math.random(), 0.6),
            0x9cf6ff,
            2,
          );
        }
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

      // ---------- Turbo-Felder ----------
      let pi = 0;
      for (const b of s.boosts) {
        if (pi >= BOOSTS) break;
        const dz = b.z - s.z;
        if (dz < -6 || b.got) continue;
        if (dz > VISIBLE) break;
        const g = pads[pi++] as THREE.Group;
        g.visible = true;
        g.position.set(b.lane * LANE_W, 0, -dz);
        g.children.forEach((c, k) => {
          if (k > 0) (c as THREE.Mesh).position.y = 0.03 + (Math.floor(t * 8 - k) % 3 === 0 ? 0.04 : 0);
        });
      }
      for (let k = pi; k < BOOSTS; k++) (pads[k] as THREE.Group).visible = false;

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
      myZ = s.z;
      const stunned = s.stun > 0;
      const sliding = s.slideT > 0;
      const air = s.py > 0.02;
      hero.position.set(s.px, s.py, 0);
      const lean = THREE.MathUtils.clamp((s.lane * LANE_W - s.px) * 0.15, -0.35, 0.35);
      hero.rotation.z = lean;
      if (s.over) me.rig.play('celebrate', { loop: true });
      else if (!stunned && !sliding && !air && me.rig.current !== 'jump')
        me.rig.play('run', { loop: true, speed: 1.1 + s.pace * 0.6 + (s.boost > 0 ? 0.5 : 0) });
      if (sliding && me.rig.current !== 'roll') me.rig.play('roll', { speed: 1.6 });
      hero.scale.set(1, sliding ? 0.55 : 1, 1);
      me.rig.update(dt);
      hero.visible = s.invuln <= 0 || Math.floor(s.invuln / 3) % 2 === 0 || s.stun > 0;
      dizzy.visible = stunned;
      dizzy.rotation.y = t * 8;

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
      fovBoost += ((s.boost > 0 ? 8 : 0) - fovBoost) * Math.min(1, dt * 5);
      camera.fov = 58 + s.pace * 6 + fovBoost;
      camera.updateProjectionMatrix();
    },
    ghosts(states, dt) {
      updateRivals(rivals, states, dt, (r, st, i) => {
        // Nur wer vor mir läuft, ist zu sehen – Zurückliegende würden die eigene Figur verdecken
        const dz = st.z - myZ;
        r.group.visible = dz > 1.2;
        r.group.position.set(st.px, st.py, -dz);
        r.group.scale.set(1, st.slideT > 0 ? 0.55 : 1, 1);
        const seen = rivalSeen[i] as { jumps: number; slides: number; crashes: number };
        if (st.jumps !== seen.jumps) r.rig.play('jump', { speed: 1.4 });
        if (st.slides !== seen.slides) r.rig.play('roll', { speed: 1.6 });
        if (st.crashes !== seen.crashes) r.rig.play('shock');
        seen.jumps = st.jumps;
        seen.slides = st.slides;
        seen.crashes = st.crashes;
        if (st.stun <= 0 && st.slideT <= 0 && st.py <= 0.02 && r.rig.current !== 'jump')
          r.rig.play('run', { loop: true, speed: 1.1 + st.pace * 0.6 });
      });
    },
    dispose() {
      scene.fog = null;
    },
  };
};
