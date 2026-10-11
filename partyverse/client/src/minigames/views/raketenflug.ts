import * as THREE from 'three';
import { CAVE_DX, RING_R, caveAt, type RocketState } from '@shared/minigames/games/raketenflug';
import { glow, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';

/** Raketenflug: Kristallhöhle in Violett und Neon. Seitenansicht, Ringtore leicht schräg, Rakete mit Flamme. */
export const createView: MiniGameViewFactory<RocketState> = (ctx, initial) => {
  const { root, camera, scene } = ctx;
  scene.background = new THREE.Color(0x120a2e);
  scene.fog = new THREE.Fog(0x120a2e, 26, 62);
  const n = initial.cy.length;
  const PAD = 14;
  const hash = (i: number): number =>
    (((Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(i + 7, 0x85ebca6b)) >>> 8) & 0xffff) / 65536;

  // ---------- Höhle aus Streifen ----------
  const colorTop = new THREE.Color(0x9a6bf0);
  const colorMid = new THREE.Color(0x4b2f8a);
  const colorDeep = new THREE.Color(0x1e1240);
  const tmpC = new THREE.Color();
  const bandGeo = (sign: 1 | -1, kind: 'front' | 'side' | 'line'): THREE.BufferGeometry => {
    const pos: number[] = [];
    const col: number[] = [];
    const idx: number[] = [];
    for (let k = -PAD; k < n; k++) {
      const i = Math.max(0, k);
      const x = k * CAVE_DX;
      const edge = (initial.cy[i] as number) + sign * (initial.gh[i] as number);
      const wob = hash(i) * 0.25;
      if (kind === 'front') {
        pos.push(x, edge, 2, x, edge + sign * 9, 2);
        tmpC.copy(colorMid).lerp(colorTop, 0.5 + wob);
        col.push(tmpC.r, tmpC.g, tmpC.b);
        tmpC.copy(colorDeep);
        col.push(tmpC.r, tmpC.g, tmpC.b);
      } else if (kind === 'side') {
        pos.push(x, edge, 2, x, edge, -8);
        tmpC.copy(colorMid).lerp(colorTop, 0.2 + wob);
        col.push(tmpC.r, tmpC.g, tmpC.b);
        tmpC.copy(colorDeep);
        col.push(tmpC.r, tmpC.g, tmpC.b);
      } else {
        pos.push(x, edge - sign * 0.02, 2.02, x, edge + sign * 0.16, 2.02);
        tmpC.set(0xa8f0ff);
        col.push(tmpC.r, tmpC.g, tmpC.b, tmpC.r, tmpC.g, tmpC.b);
      }
      if (k < n - 1) {
        const a = (k + PAD) * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    return g;
  };
  const caveMat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
  for (const sign of [1, -1] as const) {
    const a = new THREE.Mesh(bandGeo(sign, 'front'), caveMat);
    const b = new THREE.Mesh(bandGeo(sign, 'side'), caveMat);
    const c = new THREE.Mesh(
      bandGeo(sign, 'line'),
      new THREE.MeshBasicMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      }),
    );
    a.frustumCulled = b.frustumCulled = c.frustumCulled = false;
    root.add(a, b, c);
  }
  // Rückwand
  const back = new THREE.Mesh(new THREE.PlaneGeometry(n * CAVE_DX + 200, 60), glow(0x241352));
  back.position.set((n * CAVE_DX) / 2, 0, -9);
  back.frustumCulled = false;
  root.add(back);

  // Kristalle und Zapfen an den Wänden
  const crystalGeo = new THREE.OctahedronGeometry(1, 0);
  const CR = 140;
  const crystals = new THREE.InstancedMesh(crystalGeo, glow(0xffffff), CR);
  const pal = [0x4af0ff, 0xff5fd0, 0x9dff5a, 0xffd23f].map((c) => new THREE.Color(c));
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const sc = new THREE.Vector3();
  const pos = new THREE.Vector3();
  const e = new THREE.Euler();
  for (let i = 0; i < CR; i++) {
    const sample = 4 + Math.floor((i / CR) * (n - 6));
    const side = hash(i * 3) < 0.5 ? 1 : -1;
    const x = sample * CAVE_DX + hash(i * 5) * CAVE_DX;
    const edge = caveAt(initial.cy, x) + side * caveAt(initial.gh, x);
    const h = 0.5 + hash(i * 7) * 1.1;
    pos.set(x, edge - side * h * 0.45, 0.8 + hash(i * 11) * 0.8);
    e.set(0, 0, side * (0.15 + hash(i * 13) * 0.5 - 0.3));
    q.setFromEuler(e);
    sc.set(h * 0.3, h, h * 0.3);
    m4.compose(pos, q, sc);
    crystals.setMatrixAt(i, m4);
    crystals.setColorAt(i, pal[Math.floor(hash(i * 17) * pal.length) % pal.length] as THREE.Color);
  }
  crystals.frustumCulled = false;
  root.add(crystals);
  const spikeGeo = new THREE.ConeGeometry(0.5, 1, 7);
  const SP = 90;
  const spikes = new THREE.InstancedMesh(spikeGeo, toon(0x6a4bb8), SP);
  for (let i = 0; i < SP; i++) {
    const sample = 5 + Math.floor((i / SP) * (n - 8));
    const side = i % 2 === 0 ? 1 : -1;
    const x = sample * CAVE_DX + hash(i * 19) * CAVE_DX;
    const edge = caveAt(initial.cy, x) + side * caveAt(initial.gh, x);
    const h = 0.8 + hash(i * 23) * 1.4;
    pos.set(x, edge - side * h * 0.5 + side * 0.1, 0.4);
    q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), side > 0 ? Math.PI : 0);
    sc.set(0.7 + hash(i * 29) * 0.6, h, 0.7);
    m4.compose(pos, q, sc);
    spikes.setMatrixAt(i, m4);
  }
  spikes.frustumCulled = false;
  root.add(spikes);

  // Sterne im Hintergrund
  const starGeo = new THREE.BufferGeometry();
  const sp: number[] = [];
  for (let i = 0; i < 220; i++) sp.push((hash(i) - 0.2) * 150, (hash(i * 3 + 1) - 0.5) * 36, -30);
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const starPts = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ color: 0xcfc2ff, size: 0.5, fog: false }),
  );
  starPts.frustumCulled = false;
  root.add(starPts);

  // ---------- Felsen ----------
  const rockMat = toon(0x7d65c4);
  const rockMat2 = toon(0xa68cff);
  const rocks = initial.rocks.map((r, i) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), rockMat);
    body.scale.set(r.r * 1.1, r.r * 0.95, r.r * 1.0);
    body.rotation.set(hash(i) * 3, hash(i + 5) * 3, hash(i + 9) * 3);
    const bump = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), rockMat2);
    bump.scale.setScalar(r.r * 0.5);
    bump.position.set(r.r * 0.4, r.r * 0.5, r.r * 0.6);
    const eyeA = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), glow(0xffe34d));
    eyeA.position.set(-r.r * 0.25, r.r * 0.12, r.r * 0.95);
    const eyeB = eyeA.clone();
    eyeB.position.x = r.r * 0.25;
    g.add(body, bump, eyeA, eyeB);
    g.position.set(r.x, r.y, 0);
    root.add(g);
    return { g, body };
  });

  // ---------- Tore ----------
  const ringGeo = new THREE.TorusGeometry(RING_R, 0.13, 10, 36);
  const ringGeoOuter = new THREE.TorusGeometry(RING_R + 0.28, 0.04, 6, 36);
  const discGeo = new THREE.CircleGeometry(RING_R, 28);
  const gates = initial.gates.map((g0) => {
    const grp = new THREE.Group();
    const mat = glow(0x46eaff);
    const ring = new THREE.Mesh(ringGeo, mat);
    const outer = new THREE.Mesh(ringGeoOuter, glow(0xffffff, 0.6));
    const disc = new THREE.Mesh(discGeo, glow(0x46eaff, 0.14));
    grp.add(ring, outer, disc);
    grp.rotation.y = 1.0;
    grp.position.set(g0.x, g0.y, 0);
    root.add(grp);
    return { grp, mat, disc };
  });

  // ---------- Rakete ----------
  const rocket = new THREE.Group();
  const tilt = new THREE.Group();
  rocket.add(tilt);
  root.add(rocket);
  const white = toon(0xf4f6ff);
  const red = toon(0xff3d6e);
  const blue = toon(0x3d8bff);
  const bodyM = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.8, 6, 14), white);
  bodyM.rotation.z = -Math.PI / 2;
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.6, 14), red);
  nose.rotation.z = -Math.PI / 2;
  nose.position.x = 0.95;
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.355, 0.355, 0.16, 14), blue);
  stripe.rotation.z = Math.PI / 2;
  stripe.position.x = -0.1;
  const win = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 12, 10),
    toon(0x9fe8ff, { emissive: 0x4ac8ff, emissiveIntensity: 0.7 }),
  );
  win.position.set(0.3, 0.12, 0.3);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.04, 6, 14), red);
  rim.position.copy(win.position);
  const finGeo = new THREE.ConeGeometry(0.26, 0.6, 3);
  const fin1 = new THREE.Mesh(finGeo, red);
  fin1.position.set(-0.5, 0.36, 0);
  fin1.rotation.z = Math.PI * 0.12;
  const fin2 = fin1.clone();
  fin2.position.y = -0.36;
  fin2.rotation.z = Math.PI - Math.PI * 0.12;
  const fin3 = new THREE.Mesh(finGeo, red);
  fin3.position.set(-0.5, 0, 0.36);
  fin3.scale.set(1, 1, 0.3);
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.2, 12), toon(0x555a7a));
  nozzle.rotation.z = Math.PI / 2;
  nozzle.position.x = -0.75;
  const flame = new THREE.Group();
  const flameOut = new THREE.Mesh(new THREE.ConeGeometry(0.24, 1, 10), glow(0xff8a1f, 0.9));
  flameOut.rotation.z = Math.PI / 2;
  flameOut.position.x = -0.5;
  const flameIn = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.7, 10), glow(0xfff2a0));
  flameIn.rotation.z = Math.PI / 2;
  flameIn.position.x = -0.35;
  flame.add(flameOut, flameIn);
  flame.position.x = -0.85;
  tilt.add(bodyM, nose, stripe, win, rim, fin1, fin2, fin3, nozzle, flame);
  tilt.scale.setScalar(0.85);

  let t = 0;
  let camX = 4;
  let camY = 0;
  let lastGates = 0;
  let lastMissed = 0;
  let lastCrashes = 0;
  let smokeT = 0;
  let spin = 0;
  const burstPos = new THREE.Vector3();

  return {
    update(s, dt) {
      t += dt;
      // Ereignisse
      if (s.gatesPassed !== lastGates) {
        lastGates = s.gatesPassed;
        ctx.sfx('good');
        const g = s.gates[s.nextGate - 1];
        if (g) ctx.burst(burstPos.set(g.x, g.y, 0.5), 0x46eaff, 22);
      }
      if (s.gatesMissed !== lastMissed) {
        lastMissed = s.gatesMissed;
        ctx.sfx('tick');
      }
      if (s.crashes !== lastCrashes) {
        lastCrashes = s.crashes;
        ctx.sfx('hit');
        ctx.burst(burstPos.set(s.x, s.y, 0.4), 0xff7a3d, 24);
        spin = 1;
      }

      // Tore
      for (let i = 0; i < gates.length; i++) {
        const gv = gates[i] as (typeof gates)[number];
        const g = s.gates[i] as (typeof s.gates)[number];
        const near = Math.abs(g.x - camX) < 30;
        gv.grp.visible = near;
        if (!near) continue;
        const col = g.st === 1 ? 0x62ff7a : g.st === 2 ? 0x7a4a6a : i === s.nextGate ? 0xffe34d : 0x46eaff;
        gv.mat.color.setHex(col);
        (gv.disc.material as THREE.MeshBasicMaterial).color.setHex(col);
        const pulse =
          g.st === 0
            ? 1 + Math.sin(t * 5 + i) * 0.04
            : g.st === 1
              ? 1 + Math.max(0, 1 - (s.x - g.x) * 0.5) * 0.25
              : 0.9;
        gv.grp.scale.setScalar(pulse);
      }
      for (const r of rocks) r.g.visible = Math.abs(r.g.position.x - camX) < 30;
      for (let i = 0; i < rocks.length; i++)
        (rocks[i] as (typeof rocks)[number]).body.rotation.z += dt * 0.3 * (i % 2 ? 1 : -1);

      // Rakete
      rocket.position.set(s.x, s.y, 0);
      const pitch = Math.atan2(s.vy, 7) * 0.9;
      spin = Math.max(0, spin - dt * 1.6);
      tilt.rotation.z = pitch + spin * Math.PI * 4 * (spin > 0 ? 1 : 0);
      tilt.rotation.x = Math.sin(t * 13) * 0.03;
      const on = s.thrust;
      const fl = on ? 1 + Math.sin(t * 60) * 0.18 : 0.15;
      flame.scale.set(fl, on ? 1 : 0.3, on ? 1 : 0.3);
      flame.visible = true;
      rocket.visible = s.invuln <= 0 || Math.floor(s.invuln / 4) % 2 === 0 || s.invuln > 90;
      smokeT -= dt;
      if (on && smokeT <= 0) {
        smokeT = 0.05;
        ctx.burst(burstPos.set(s.x - 1.0, s.y - Math.sin(pitch) * 0.3, 0), 0xffb347, 2);
      }

      // Kamera
      const aspect = camera.aspect;
      const d =
        THREE.MathUtils.clamp(5.6 / Math.tan((camera.fov * Math.PI) / 360), 11, 14) * (aspect < 1 ? 1.45 : 1);
      const tx = s.x + (aspect < 1 ? 2.2 : 4.2);
      const ty = s.y * 0.55 + caveAt(s.cy, s.x + 4) * 0.45;
      const k = dt <= 0 ? 1 : Math.min(1, dt * 6);
      camX += (tx - camX) * k;
      camY += (ty - camY) * k;
      camera.position.set(camX, camY, d);
      camera.lookAt(camX, camY, 0);
      starPts.position.x = camX * 0.6;
      back.position.y = camY * 0.9;
    },
    dispose() {
      scene.fog = null;
    },
  };
};
