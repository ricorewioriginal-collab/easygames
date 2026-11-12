import * as THREE from 'three';
import {
  cloudOffX,
  cloudTop,
  speedAt,
  spikeY,
  SPIKE_R,
  type Cloud,
  type Spike,
  type WolkenState,
} from '@shared/minigames/games/wolkenhuepfer';
import { glow, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';
import { makeMe, makeRivals, updateRivals } from './rivals';

/** Wolkenhüpfer: weicher Himmel, bauschige Wolken, eigene Figur als Läufer, Mitspieler halbdurchsichtig dahinter. Seitenansicht, Kamera folgt. */
export const createView: MiniGameViewFactory<WolkenState> = (ctx, initial) => {
  const { root, camera, scene } = ctx;
  scene.background = new THREE.Color(0x7cc8ff);
  scene.fog = new THREE.Fog(0xb8e4ff, 38, 95);

  const sphere = new THREE.SphereGeometry(1, 14, 10);
  const cone = new THREE.ConeGeometry(1, 1, 10);

  // ---------- Hintergrund (Parallaxe) ----------
  const far = new THREE.Group();
  root.add(far);
  const sun = new THREE.Mesh(new THREE.CircleGeometry(5, 32), glow(0xfff2a8));
  sun.position.set(18, 14, -60);
  far.add(sun);
  const sunHalo = new THREE.Mesh(new THREE.CircleGeometry(8.5, 32), glow(0xfff7c9, 0.35));
  sunHalo.position.set(18, 14, -61);
  far.add(sunHalo);
  const farMat = glow(0xe6f4ff);
  const farMat2 = glow(0xd0e8ff);
  for (let i = 0; i < 16; i++) {
    const g = new THREE.Group();
    const n = 3 + (i % 3);
    for (let k = 0; k < n; k++) {
      const m = new THREE.Mesh(sphere, i % 2 ? farMat : farMat2);
      const r = 2.2 + ((i * 7 + k * 3) % 5) * 0.55;
      m.scale.set(r, r * 0.75, r * 0.7);
      m.position.set((k - n / 2) * r * 1.2, (k % 2) * 0.6, 0);
      g.add(m);
    }
    g.position.set(-30 + i * 14, -6 + ((i * 5) % 7) * 3.2, -38 - (i % 3) * 10);
    far.add(g);
  }
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(400, 120), glow(0x8fc6f2));
  sea.rotation.x = -Math.PI / 2;
  sea.position.set(0, -11, -20);
  far.add(sea);

  // ---------- Wolken ----------
  interface CloudView {
    g: THREE.Group;
    c: Cloud;
    pad?: THREE.Group;
  }
  const white = toon(0xffffff, { emissive: 0xc8dcf2, emissiveIntensity: 0.55 });
  const blue = toon(0xcfeaff, { emissive: 0x8fbce6, emissiveIntensity: 0.55 });
  const lilac = toon(0xe6d8ff, { emissive: 0xb59be0, emissiveIntensity: 0.55 });
  const pink = toon(0xffc2de, { emissive: 0xe58bb4, emissiveIntensity: 0.55 });
  const padMat = toon(0xff3d6e);
  const coilMat = toon(0xffd23f);
  const arrowMat = glow(0x4aa8ff, 0.9);
  const clouds: CloudView[] = initial.clouds.map((c) => {
    const g = new THREE.Group();
    const mat = c.kind === 1 ? blue : c.kind === 2 ? lilac : c.kind === 3 ? pink : white;
    const len = c.x1 - c.x0;
    const n = Math.max(3, Math.round(len / 1.15));
    for (let k = 0; k < n; k++) {
      const f = n === 1 ? 0.5 : k / (n - 1);
      const edge = Math.min(f, 1 - f) * 2; // 0 am Rand, 1 in der Mitte
      const m = new THREE.Mesh(sphere, mat);
      const r = 0.55 + 0.35 * edge + ((k * 37) % 5) * 0.04;
      m.scale.set(r * 1.25, r * 0.8, 0.95);
      m.position.set(-len / 2 + 0.4 + f * (len - 0.8), -0.55 + r * 0.2, ((k % 2) - 0.5) * 0.35);
      g.add(m);
    }
    // Flache Oberseite, damit die Landefläche klar zu erkennen ist
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 14), mat);
    top.rotation.z = Math.PI / 2;
    top.scale.set(0.5, len - 0.7, 0.9);
    top.position.set(0, -0.28, 0);
    g.add(top);
    let pad: THREE.Group | undefined;
    if (c.kind === 3) {
      pad = new THREE.Group();
      const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.5, 10), coilMat);
      coil.position.y = 0.25;
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.2, 18), padMat);
      disc.position.y = 0.55;
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.07, 6, 18), coilMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.6;
      pad.add(coil, disc, rim);
      g.add(pad);
    }
    if (c.kind === 1) {
      const a = new THREE.Mesh(cone, arrowMat);
      a.scale.set(0.3, 0.45, 0.3);
      a.position.set(0, 0.5, 0.6);
      g.add(a);
    }
    if (c.kind === 2) {
      for (const sgn of [-1, 1]) {
        const a = new THREE.Mesh(cone, arrowMat);
        a.scale.set(0.3, 0.45, 0.3);
        a.rotation.z = (-sgn * Math.PI) / 2;
        a.position.set(sgn * 0.5, 0.45, 0.6);
        g.add(a);
      }
    }
    root.add(g);
    return { g, c, pad };
  });

  // ---------- Sterne ----------
  const starShape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    const rr = i % 2 === 0 ? 0.5 : 0.22;
    const px = Math.cos(a) * rr;
    const py = Math.sin(a) * rr;
    if (i === 0) starShape.moveTo(px, py);
    else starShape.lineTo(px, py);
  }
  starShape.closePath();
  const starGeo = new THREE.ExtrudeGeometry(starShape, {
    depth: 0.18,
    bevelEnabled: true,
    bevelSize: 0.05,
    bevelThickness: 0.05,
    bevelSegments: 1,
  });
  starGeo.translate(0, 0, -0.09);
  const starMat = toon(0xffd23f, { emissive: 0xffa000, emissiveIntensity: 0.9 });
  const stars = initial.stars.map((st) => {
    const m = new THREE.Mesh(starGeo, starMat);
    m.position.set(st.x, st.y, 0);
    root.add(m);
    return m;
  });

  // ---------- Stachelballons ----------
  const spikeMat = toon(0x6b3cff, { emissive: 0x3a1a99, emissiveIntensity: 0.5 });
  const spikeTip = toon(0xffe14d);
  const stringMat = glow(0xffffff, 0.6);
  const spikeGeo = new THREE.ConeGeometry(0.13, 0.36, 6);
  const spikes = initial.spikes.map((k) => {
    const g = new THREE.Group();
    const ball = new THREE.Mesh(sphere, spikeMat);
    ball.scale.setScalar(SPIKE_R * 0.82);
    g.add(ball);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const c = new THREE.Mesh(spikeGeo, spikeTip);
      const tilt = i % 2 ? 0.5 : -0.5;
      const dir = new THREE.Vector3(Math.cos(a), Math.sin(a), tilt).normalize();
      c.position.copy(dir).multiplyScalar(SPIKE_R * 0.9);
      c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      g.add(c);
    }
    const eyeL = new THREE.Mesh(sphere, toon(0xffffff));
    eyeL.scale.set(0.1, 0.13, 0.05);
    eyeL.position.set(-0.13, 0.06, SPIKE_R * 0.78);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.13;
    g.add(eyeL, eyeR);
    const str = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.6, 4), stringMat);
    str.position.y = -SPIKE_R - 0.8;
    g.add(str);
    g.position.set(k.x, k.y, 0);
    root.add(g);
    return g;
  });

  // ---------- Eigene Figur und Mitspieler ----------
  const me = makeMe(ctx, 0.85);
  me.ring.visible = false;
  me.group.rotation.y = Math.PI / 2;
  me.rig.play('run', { loop: true });
  const rivals = makeRivals(ctx, 0.8);
  rivals.forEach((r) => {
    r.ring.visible = false;
    r.group.rotation.y = Math.PI / 2;
  });
  const rivalAnim = rivals.map(() => ({ jumps: 0, falls: 0, over: false }));

  // ---------- Zustand für Ereignisse ----------
  let camX = initial.x + 3.5;
  let camY = 1.6;
  let t = 0;
  let lastJumps = 0;
  let lastLands = 0;
  let lastFalls = 0;
  let lastSprings = 0;
  let lastStars = 0;
  let lastBonks = 0;
  let shake = 0;
  let landSquash = 0;
  let bump = { i: -1, v: 0 };
  const tmp = new THREE.Vector3();
  const gotStars = new Set<number>();

  return {
    update(s, dt) {
      t += dt;
      // --- Ereignisse ---
      const feet = tmp.set(s.x, s.y, 0.3);
      if (s.jumps !== lastJumps) {
        lastJumps = s.jumps;
        me.rig.play('jump');
        ctx.sfx('jump');
        ctx.burst(feet.clone(), 0xffffff, 6);
      }
      if (s.lands !== lastLands) {
        lastLands = s.lands;
        landSquash = 1;
        bump = { i: s.on, v: 1 };
        ctx.burst(feet.clone(), 0xffffff, 5);
      }
      if (s.springs !== lastSprings) {
        lastSprings = s.springs;
        ctx.sfx('whoosh');
        ctx.burst(feet.clone(), 0xff7fb0, 14);
        landSquash = 1.2;
        bump = { i: s.on, v: 1.4 };
      }
      if (s.bonks !== lastBonks) {
        lastBonks = s.bonks;
        ctx.sfx('hit');
        me.rig.play('shock');
        ctx.burst(new THREE.Vector3(s.x, s.y + 1.2, 0.4), 0xb18cff, 16);
        shake = 0.5;
      }
      if (s.falls !== lastFalls) {
        lastFalls = s.falls;
        shake = 0.35;
        ctx.sfx('bad');
        ctx.burst(new THREE.Vector3(s.x, -3.5, 0.5), 0x9ad0ff, 18);
      }
      if (s.starCount !== lastStars) {
        lastStars = s.starCount;
        ctx.sfx('coin');
      }

      // --- Wolken ---
      for (let i = 0; i < clouds.length; i++) {
        const cv = clouds[i] as CloudView;
        const c = cv.c;
        const cx = (c.x0 + c.x1) / 2 + cloudOffX(c, s.t);
        const vis = Math.abs(cx - camX) < 34;
        cv.g.visible = vis;
        if (!vis) continue;
        const top = cloudTop(c, s.t);
        cv.g.position.set(cx, top, 0);
        const bob = bump.i === i ? bump.v : 0;
        cv.g.scale.set(1, 1 - 0.14 * bob, 1);
        if (cv.pad)
          cv.pad.scale.y = 1 - 0.55 * (bump.i === i ? Math.min(1, bump.v) : 0) + Math.sin(t * 6 + i) * 0.03;
      }
      bump.v = Math.max(0, bump.v - dt * 5);

      // --- Sterne ---
      for (let i = 0; i < stars.length; i++) {
        const st = initial.stars[i] as { x: number; y: number; got: boolean };
        const m = stars[i] as THREE.Mesh;
        const live = s.stars[i] as { x: number; y: number; got: boolean };
        const near = Math.abs(st.x - camX) < 30;
        if (live.got && !gotStars.has(i)) {
          gotStars.add(i);
          ctx.burst(new THREE.Vector3(st.x, st.y, 0.3), 0xffd23f, 10);
        }
        m.visible = near && !live.got;
        if (m.visible) {
          m.rotation.y = t * 2.6 + i;
          m.position.y = st.y + Math.sin(t * 3 + i) * 0.08;
        }
      }

      // --- Eigene Figur ---
      for (let i = 0; i < spikes.length; i++) {
        const k = s.spikes[i] as Spike;
        const g = spikes[i] as THREE.Group;
        g.visible = Math.abs(k.x - camX) < 30;
        if (g.visible) {
          g.position.y = spikeY(k, s.t);
          g.rotation.z = Math.sin(t * 2 + i) * 0.15;
        }
      }
      landSquash = Math.max(0, landSquash - dt * 4.5);
      me.group.position.set(s.x, s.y, 0.15);
      me.group.scale.set(1, 1 - landSquash * 0.18, 1);
      const air = !s.grounded;
      if (s.over) me.rig.play(s.lives > 0 ? 'celebrate' : 'lose', { loop: true });
      else if (s.respawn > 0) me.rig.play('idle', { loop: true });
      else if (!air) me.rig.play('run', { loop: true, speed: speedAt(s.t) / 6.4 });
      else if (s.springing && me.rig.current !== 'roll') me.rig.play('roll');
      me.rig.update(dt);
      me.group.visible = s.respawn <= 0 || Math.floor(s.respawn / 4) % 2 === 0;

      // --- Kamera ---
      const aspect = camera.aspect;
      const halfW = aspect < 1 ? 5.0 : 9.8;
      const d = THREE.MathUtils.clamp(halfW / (Math.tan((camera.fov * Math.PI) / 360) * aspect), 11, 26);
      const tx = s.x + (aspect < 1 ? 2.2 : 3.6);
      const ty = THREE.MathUtils.clamp(
        s.grounded ? s.y * 0.7 + 1.6 : camY + (s.y * 0.5 + 1.6 - camY) * 0.4,
        -0.6,
        4.2,
      );
      const k = dt <= 0 ? 1 : Math.min(1, dt * 5);
      camX += (tx - camX) * k;
      camY += (ty - camY) * k;
      shake = Math.max(0, shake - dt * 2);
      const sh = shake * shake;
      camera.position.set(camX + (Math.random() - 0.5) * sh, camY + 1.2 + (Math.random() - 0.5) * sh, d);
      camera.lookAt(camX, camY, 0);
      far.position.set(camX * 0.8, camY * 0.5, 0);
    },
    ghosts(states, dt) {
      updateRivals(rivals, states, dt, (r, st, i) => {
        // leicht nach hinten versetzt, damit die eigene Figur vorne bleibt
        r.group.position.set(st.x, st.y, -0.7 - i * 0.45);
        r.group.visible = st.respawn <= 0 || Math.floor(st.respawn / 4) % 2 === 0;
        const ra = rivalAnim[i] as { jumps: number; falls: number; over: boolean };
        if (st.jumps !== ra.jumps) {
          ra.jumps = st.jumps;
          r.rig.play('jump');
        }
        if (st.over && !ra.over) {
          ra.over = true;
          r.rig.play('cheer', { loop: true });
        } else if (!st.over && st.grounded && st.respawn <= 0) r.rig.play('run', { loop: true });
        else if (st.respawn > 0) r.rig.play('idle', { loop: true });
      });
    },
    dispose() {
      scene.fog = null;
    },
  };
};
