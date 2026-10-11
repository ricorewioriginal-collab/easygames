import * as THREE from 'three';
import type { OrbitState } from '@shared/minigames/games/ausweichorbit';
import { R_MAX, WAVE_START } from '@shared/minigames/games/ausweichorbit';
import { glow, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';

const TAU = Math.PI * 2;
const SEG = 56;

/** Ring um eine Sonne: schräge Verfolgerkamera hinter der Figur, Kometen mit Schweif, Balken und Wellen als Leuchtkacheln. */
export const createView: MiniGameViewFactory<OrbitState> = (ctx, initial) => {
  const { root, camera } = ctx;
  ctx.scene.background = new THREE.Color(0x1d1650);
  ctx.scene.fog = new THREE.Fog(0x1d1650, 24, 60);

  root.add(new THREE.HemisphereLight(0xcfd8ff, 0x3a2a7a, 1.2));
  const sunLight = new THREE.PointLight(0xffb347, 90, 40);
  sunLight.position.set(0, 3, 0);
  root.add(sunLight);
  const dir = new THREE.DirectionalLight(0xffffff, 1.2);
  dir.position.set(4, 12, 6);
  root.add(dir);

  // Boden: Ring mit Rand
  const prof = [new THREE.Vector2(2.0, -0.7), new THREE.Vector2(2.0, 0), new THREE.Vector2(9.5, 0), new THREE.Vector2(9.5, -0.7)];
  const ring = new THREE.Mesh(new THREE.LatheGeometry(prof, 72), toon(0x2a4aa8));
  ring.material = ring.material.clone();
  (ring.material as THREE.Material).side = THREE.DoubleSide;
  root.add(ring);
  const floor = new THREE.Mesh(new THREE.RingGeometry(2.0, 9.5, 96, 1), new THREE.MeshBasicMaterial({ color: 0x3f78e6 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.005;
  root.add(floor);
  const lane = (r: number, c: number, w = 0.05) => {
    const m = new THREE.Mesh(new THREE.RingGeometry(r - w, r + w, 96), glow(c, 0.5));
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.02;
    root.add(m);
  };
  lane(3.6, 0x9fd0ff);
  lane(5.6, 0x9fd0ff);
  lane(7.6, 0x9fd0ff);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(9.55, 0.22, 10, 96), toon(0xff8a3d));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.05;
  root.add(rim);
  const rim2 = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.18, 10, 64), toon(0xffd23f));
  rim2.rotation.x = Math.PI / 2;
  rim2.position.y = 0.05;
  root.add(rim2);
  // Markierungen auf dem Boden (damit Drehung sichtbar ist)
  const tickMat = glow(0xffffff, 0.35);
  for (let i = 0; i < 24; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.02, 0.1), tickMat);
    const a = (i / 24) * TAU;
    m.position.set(Math.cos(a) * 8.9, 0.03, Math.sin(a) * 8.9);
    m.rotation.y = -a;
    root.add(m);
  }

  // Sonne
  const sun = new THREE.Mesh(new THREE.SphereGeometry(1.25, 32, 24), new THREE.MeshBasicMaterial({ color: 0xffc83d }));
  sun.position.y = 1.1;
  root.add(sun);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(1.75, 24, 16), glow(0xff8a3d, 0.28));
  halo.position.y = 1.1;
  root.add(halo);
  const sunRing = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.07, 8, 48), glow(0xfff1a8, 0.8));
  sunRing.position.y = 1.1;
  root.add(sunRing);

  // Sterne
  const starPos: number[] = [];
  let seed = 12345;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 260; i++) {
    const a = rnd() * TAU;
    const r = 28 + rnd() * 30;
    starPos.push(Math.cos(a) * r, 2 + rnd() * 30, Math.sin(a) * r);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  root.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.35, sizeAttenuation: true, fog: false })));

  // Figur
  const hero = new THREE.Group();
  const heroBody = new THREE.Group();
  hero.add(heroBody);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.46, 24, 18), toon(0xffd23f));
  body.position.y = 0.55;
  heroBody.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), toon(0xfff2b8));
  belly.position.set(0, 0.45, 0.28);
  belly.scale.set(1, 1, 0.5);
  heroBody.add(belly);
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), toon(0xffffff));
    eye.position.set(sx * 0.17, 0.72, 0.38);
    heroBody.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), new THREE.MeshBasicMaterial({ color: 0x1a1030 }));
    pupil.position.set(sx * 0.17, 0.72, 0.5);
    heroBody.add(pupil);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), toon(0xff6f3c));
    foot.position.set(sx * 0.2, 0.1, 0.05);
    foot.scale.set(1, 0.6, 1.3);
    heroBody.add(foot);
  }
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.4, 6), toon(0x9aa0ff));
  antenna.position.set(0, 1.18, 0);
  heroBody.add(antenna);
  const antBall = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), glow(0xff4d8d));
  antBall.position.set(0, 1.4, 0);
  heroBody.add(antBall);
  const shield = new THREE.Mesh(new THREE.SphereGeometry(0.85, 20, 14), glow(0x7df9ff, 0.35));
  shield.position.y = 0.55;
  hero.add(shield);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.45, 20), glow(0x000000, 0.3));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.03;
  hero.add(shadow);
  root.add(hero);

  // Kometen (Pool)
  interface CometV { g: THREE.Group; line: THREE.Mesh; lineMat: THREE.MeshBasicMaterial }
  const comets: CometV[] = [];
  for (let i = 0; i < 10; i++) {
    const g = new THREE.Group();
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.46, 16, 12), toon(0xff5a36, { emissive: 0xff3b1f, emissiveIntensity: 0.8 }));
    g.add(core);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.42, 2.4, 12), glow(0xffb347, 0.6));
    tail.rotation.z = -Math.PI / 2; // Spitze zeigt nach -x (Richtung Mitte), Schweif nach außen
    tail.position.x = 1.3;
    g.add(tail);
    g.visible = false;
    root.add(g);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xff4d4d, transparent: true, opacity: 0.4 });
    const line = new THREE.Mesh(new THREE.BoxGeometry(R_MAX - 1.2, 0.02, 0.35), lineMat);
    line.visible = false;
    root.add(line);
    comets.push({ g, line, lineMat });
  }

  // Balken (Pool): 2 Arme
  const beamMats = [0, 1].map(() => new THREE.MeshBasicMaterial({ color: 0xff3df0, transparent: true, opacity: 0.4 }));
  const beams: THREE.Mesh[] = [];
  for (let i = 0; i < 2; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(R_MAX + 1.4, 0.5, 0.64), beamMats[i] as THREE.Material);
    m.visible = false;
    root.add(m);
    beams.push(m);
  }
  const beamCore = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
  const beamCores = beams.map((b) => {
    const c = new THREE.Mesh(new THREE.BoxGeometry(R_MAX + 1.4, 0.52, 0.2), beamCore);
    b.add(c);
    return c;
  });

  // Wellen (Pool): je 1 InstancedMesh
  const waveMats = [0, 1].map(() => new THREE.MeshBasicMaterial({ color: 0x4dffb5, transparent: true, opacity: 0.4 }));
  const waves = waveMats.map((mat) => {
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.5, 0.55), mat, SEG);
    im.visible = false;
    im.frustumCulled = false;
    root.add(im);
    return im;
  });
  const tmp = new THREE.Object3D();

  // Münzen (Pool)
  const coinMesh: THREE.Group[] = [];
  for (let i = 0; i < 4; i++) {
    const g = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 20), toon(0xffd23f, { emissive: 0xffa800, emissiveIntensity: 0.5 }));
    disc.rotation.x = Math.PI / 2;
    g.add(disc);
    const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.2), toon(0xfff2b8));
    star.scale.z = 0.3;
    g.add(star);
    g.visible = false;
    root.add(g);
    coinMesh.push(g);
  }

  let t = 0;
  let camAng = initial.ang;
  let faceY = 0;
  let lastHits = initial.hitCount;
  let lastCoins = initial.coins;
  let shake = 0;
  let wasOver = false;
  const pos = new THREE.Vector3();

  return {
    update(s, dt) {
      t += dt;
      // Figur
      const px = s.rad * Math.cos(s.ang);
      const pz = s.rad * Math.sin(s.ang);
      const moving = Math.hypot(s.mx, s.my) > 0.1;
      const hop = moving ? Math.abs(Math.sin(t * 13)) * 0.16 : Math.sin(t * 3) * 0.03;
      hero.position.set(px, hop, pz);
      // Blickrichtung aus Bewegung (Kamera schaut Richtung Mitte; rechts = Winkel sinkt)
      if (moving) {
        const tx = s.mx * Math.sin(s.ang) - s.my * Math.cos(s.ang);
        const tz = -s.mx * Math.cos(s.ang) - s.my * Math.sin(s.ang);
        const target = Math.atan2(tx, tz);
        let d = target - faceY;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        faceY += d * Math.min(1, dt * 14);
      }
      hero.rotation.y = faceY;
      heroBody.scale.set(1 + (moving ? Math.sin(t * 26) * 0.04 : 0), 1 - (moving ? Math.sin(t * 26) * 0.06 : 0), 1);
      shield.visible = s.inv > 0 && s.lives > 0;
      hero.visible = !(s.inv > 0 && s.lives > 0 && Math.floor(t * 14) % 2 === 0) || s.inv > 80;
      antBall.scale.setScalar(1 + Math.sin(t * 8) * 0.2);
      shield.scale.setScalar(1 + Math.sin(t * 10) * 0.06);

      // Sonne
      sun.scale.setScalar(1 + Math.sin(t * 3) * 0.04);
      halo.scale.setScalar(1 + Math.sin(t * 2.2) * 0.07);
      sunRing.rotation.set(t * 0.8, t * 0.5, 0);

      // Kometen
      for (let i = 0; i < comets.length; i++) {
        const v = comets[i] as CometV;
        const c = s.comets[i];
        if (!c) {
          v.g.visible = false;
          v.line.visible = false;
          continue;
        }
        const cx = c.r * Math.cos(c.a);
        const cz = c.r * Math.sin(c.a);
        v.g.visible = c.r < R_MAX + 2.4;
        v.g.position.set(cx, 0.6, cz);
        v.g.rotation.y = -c.a;
        v.g.rotation.z = Math.sin(t * 10 + i) * 0.1;
        if (c.warn > 0) {
          v.line.visible = true;
          v.line.position.set(Math.cos(c.a) * ((R_MAX + 1.2) / 2 + 0.6), 0.05, Math.sin(c.a) * ((R_MAX + 1.2) / 2 + 0.6));
          v.line.rotation.y = -c.a;
          v.lineMat.opacity = 0.25 + 0.35 * (Math.floor(t * 12) % 2);
        } else v.line.visible = false;
      }

      // Balken
      const b = s.beams[0];
      for (let i = 0; i < beams.length; i++) {
        const m = beams[i] as THREE.Mesh;
        if (!b || i >= b.arms) {
          m.visible = false;
          continue;
        }
        m.visible = true;
        const a = b.a + (i * TAU) / b.arms;
        const mid = (R_MAX + 1.4) / 2 + 1.4;
        m.position.set(Math.cos(a) * mid, 0.3, Math.sin(a) * mid);
        m.rotation.y = -a;
        const active = b.t >= b.warn;
        const mat = beamMats[i] as THREE.MeshBasicMaterial;
        mat.opacity = active ? 0.85 : 0.2 + 0.2 * (Math.floor(t * 10) % 2);
        m.scale.set(1, 1, active ? 1 : 0.5);
        (beamCores[i] as THREE.Mesh).visible = active;
      }

      // Wellen
      for (let wi = 0; wi < waves.length; wi++) {
        const im = waves[wi] as THREE.InstancedMesh;
        const w = s.waves[wi];
        if (!w) {
          im.visible = false;
          continue;
        }
        im.visible = true;
        const active = w.t > w.warn;
        const r = w.r;
        const len = ((r * TAU) / SEG) * 1.05;
        for (let k = 0; k < SEG; k++) {
          const phi = ((k + 0.5) / SEG) * TAU;
          const g1 = Math.abs(Math.atan2(Math.sin(phi - w.gap), Math.cos(phi - w.gap)));
          const g2 = Math.abs(Math.atan2(Math.sin(phi - w.gap - Math.PI), Math.cos(phi - w.gap - Math.PI)));
          const inGap = g1 < w.gapH || g2 < w.gapH;
          tmp.position.set(Math.cos(phi) * r, 0.3, Math.sin(phi) * r);
          tmp.rotation.set(0, -phi - Math.PI / 2, 0);
          const sc = inGap ? 0.0001 : 1;
          tmp.scale.set(len * sc, active ? 1 : 0.25, sc);
          tmp.updateMatrix();
          im.setMatrixAt(k, tmp.matrix);
        }
        im.instanceMatrix.needsUpdate = true;
        (waveMats[wi] as THREE.MeshBasicMaterial).opacity = active ? 0.85 : 0.18 + 0.15 * (Math.floor(t * 8) % 2);
        void WAVE_START;
      }

      // Münzen
      for (let i = 0; i < coinMesh.length; i++) {
        const g = coinMesh[i] as THREE.Group;
        const c = s.field[i];
        if (!c || c.wait > 0) {
          g.visible = false;
          continue;
        }
        g.visible = !(c.life < 70 && Math.floor(t * 10) % 2 === 0);
        g.position.set(c.r * Math.cos(c.a), 0.75 + Math.sin(t * 4 + i) * 0.12, c.r * Math.sin(c.a));
        g.rotation.y = t * 3 + i;
      }

      // Ereignisse
      if (s.hitCount > lastHits) {
        ctx.sfx('hit');
        pos.set(px, 0.8, pz);
        ctx.burst(pos, 0xff4d4d, 26);
        shake = 0.5;
        lastHits = s.hitCount;
      }
      if (s.coins > lastCoins) {
        ctx.sfx('coin');
        pos.set(px, 1.0, pz);
        ctx.burst(pos, 0xffd23f, 14);
        lastCoins = s.coins;
      }
      if (s.over && !wasOver) {
        wasOver = true;
        ctx.sfx(s.lives <= 0 ? 'bad' : 'win');
      }

      // Kamera: hinter der Figur, schräg von oben
      let d = s.ang - camAng;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      camAng += d * Math.min(1, dt * 3.5);
      const asp = camera.aspect || 1.6;
      const f = asp < 1 ? 0.97 / asp : 1;
      const D = 15 * f;
      const H = 14.5 * f;
      shake = Math.max(0, shake - dt * 1.6);
      const sh = shake * 0.35;
      camera.position.set(Math.cos(camAng) * D + Math.sin(t * 63) * sh, H + Math.sin(t * 71) * sh, Math.sin(camAng) * D);
      camera.lookAt(-Math.cos(camAng) * 0.5, 0, -Math.sin(camAng) * 0.5);
    },
    dispose() {
      ctx.scene.fog = null;
    },
  };
};
