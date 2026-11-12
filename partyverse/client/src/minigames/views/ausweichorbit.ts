import * as THREE from 'three';
import type { OrbitState } from '@shared/minigames/games/ausweichorbit';
import { R_MAX, R_MIN, coinValue } from '@shared/minigames/games/ausweichorbit';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';
import { makeMe, makeRivals, updateRivals, type Racer } from './rivals';

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
  const prof = [
    new THREE.Vector2(2.0, -0.7),
    new THREE.Vector2(2.0, 0),
    new THREE.Vector2(9.5, 0),
    new THREE.Vector2(9.5, -0.7),
  ];
  const ring = new THREE.Mesh(new THREE.LatheGeometry(prof, 72), toon(0x2a4aa8));
  ring.material = ring.material.clone();
  (ring.material as THREE.Material).side = THREE.DoubleSide;
  root.add(ring);
  const floor = new THREE.Mesh(
    new THREE.RingGeometry(2.0, 9.5, 96, 1),
    new THREE.MeshBasicMaterial({ color: 0x3f78e6 }),
  );
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
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(1.25, 32, 24),
    new THREE.MeshBasicMaterial({ color: 0xffc83d }),
  );
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
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < 260; i++) {
    const a = rnd() * TAU;
    const r = 28 + rnd() * 30;
    starPos.push(Math.cos(a) * r, 2 + rnd() * 30, Math.sin(a) * r);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  root.add(
    new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.35, sizeAttenuation: true, fog: false }),
    ),
  );

  // Figuren: eigener Charakter, Mitspieler halbdurchsichtig auf demselben Ring (gleiche Hindernisse für alle)
  const me = makeMe(ctx, 0.78);
  const hero = me.group;
  const shield = new THREE.Mesh(new THREE.SphereGeometry(0.95, 20, 14), glow(0x7df9ff, 0.3));
  shield.position.y = 0.75;
  hero.add(shield);
  const rivals = makeRivals(ctx, 0.7);
  interface Track {
    face: number;
    hits: number;
    over: boolean;
    ang: number;
    rad: number;
  }
  const track = (st: OrbitState): Track => ({
    face: 0,
    hits: st.hitCount,
    over: false,
    ang: st.ang,
    rad: st.rad,
  });
  const meT = track(initial);
  const rivT = rivals.map(() => track(initial));
  /** Position, Blickrichtung und Animation einer Figur aus ihrem Zustand */
  const place = (r: Racer, st: OrbitState, tr: Track, dt: number): void => {
    const px = st.rad * Math.cos(st.ang);
    const pz = st.rad * Math.sin(st.ang);
    r.group.position.set(px, 0, pz);
    const moving = Math.hypot(st.mx, st.my) > 0.1 && (st.ang !== tr.ang || st.rad !== tr.rad);
    tr.ang = st.ang;
    tr.rad = st.rad;
    if (moving) {
      const tx = st.mx * Math.sin(st.ang) - st.my * Math.cos(st.ang);
      const tz = -st.mx * Math.cos(st.ang) - st.my * Math.sin(st.ang);
      tr.face = Math.atan2(tx, tz);
      r.rig.faceTowards(tr.face);
    }
    if (st.over && !tr.over) {
      tr.over = true;
      r.rig.play(st.lives <= 0 ? 'lose' : 'celebrate');
    } else if (st.hitCount !== tr.hits) {
      tr.hits = st.hitCount;
      r.rig.play('shock');
    } else if (!st.over && r.rig.current !== 'shock') {
      if (moving) r.rig.play('run', { loop: true, speed: 1.3 });
      else if (r.rig.current === 'run') r.rig.play('idle', { loop: true });
    }
    // Unverwundbar: blinken
    r.rig.root.visible = !(st.inv > 0 && st.inv < 92 && Math.floor(t * 14) % 2 === 0);
    void dt;
  };

  // Sonnen-Eruptionen (Pool, Sektor-Fläche wird je Eruption neu gebaut)
  const flareViews = [0, 1].map(() => {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xff7a2e,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const m = new THREE.Mesh(new THREE.BufferGeometry(), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.06;
    m.visible = false;
    root.add(m);
    return { m, mat, key: '' };
  });
  let lastFlareActive = false;

  const popups: Array<{ sp: THREE.Sprite; t: number; y0: number }> = [];
  const popup = (text: string, x: number, z: number, color: string): void => {
    const sp = textSprite(text, { color, size: 64, width: 1.9 });
    sp.position.set(x, 2.2, z);
    root.add(sp);
    popups.push({ sp, t: 0, y0: 2.2 });
  };

  // Kometen (Pool)
  interface CometV {
    g: THREE.Group;
    line: THREE.Mesh;
    lineMat: THREE.MeshBasicMaterial;
  }
  const comets: CometV[] = [];
  for (let i = 0; i < 16; i++) {
    const g = new THREE.Group();
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.46, 16, 12),
      toon(0xff5a36, { emissive: 0xff3b1f, emissiveIntensity: 0.8 }),
    );
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
  const beamMats = [0, 1].map(
    () => new THREE.MeshBasicMaterial({ color: 0xff3df0, transparent: true, opacity: 0.4 }),
  );
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
  const waveMats = [0, 1].map(
    () => new THREE.MeshBasicMaterial({ color: 0x4dffb5, transparent: true, opacity: 0.4 }),
  );
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
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.12, 20),
      toon(0xffd23f, { emissive: 0xffa800, emissiveIntensity: 0.5 }),
    );
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
      place(me, s, meT, dt);
      me.rig.update(dt);
      shield.visible = s.inv > 0 && s.lives > 0;
      shield.scale.setScalar(1 + Math.sin(t * 10) * 0.06);

      // Eruptionen
      let flareActive = false;
      flareViews.forEach((fv, i) => {
        const f = s.flares[i];
        if (!f) {
          fv.m.visible = false;
          return;
        }
        const key = `${f.a.toFixed(4)}|${f.h.toFixed(4)}`;
        if (key !== fv.key) {
          fv.key = key;
          fv.m.geometry.dispose();
          // Lokaler Winkel θ wird nach der Drehung um x zur Weltrichtung −θ
          fv.m.geometry = new THREE.RingGeometry(R_MIN - 0.5, R_MAX + 0.9, 40, 1, -(f.a + f.h), 2 * f.h);
        }
        fv.m.visible = true;
        const active = f.t >= f.warn;
        if (active) flareActive = true;
        const k = Math.min(1, f.t / f.warn);
        fv.mat.color.setHex(active ? 0xffc23d : 0xff7a2e);
        fv.mat.opacity = active ? 0.85 : 0.12 + 0.3 * k * (0.5 + 0.5 * Math.sin(t * (10 + k * 20)));
        fv.m.position.y = active ? 0.08 + Math.sin(t * 40) * 0.02 : 0.06;
      });
      if (flareActive && !lastFlareActive) {
        ctx.sfx('whoosh');
        shake = Math.max(shake, 0.35);
      }
      lastFlareActive = flareActive;

      // Sonne (pumpt vor und während einer Eruption)
      const charging = s.flares.some((f) => f.t < f.warn);
      sun.scale.setScalar(
        1 + Math.sin(t * (charging ? 18 : 3)) * (charging ? 0.1 : 0.04) + (flareActive ? 0.2 : 0),
      );
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
          v.line.position.set(
            Math.cos(c.a) * ((R_MAX + 1.2) / 2 + 0.6),
            0.05,
            Math.sin(c.a) * ((R_MAX + 1.2) / 2 + 0.6),
          );
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
        (waveMats[wi] as THREE.MeshBasicMaterial).opacity = active
          ? 0.85
          : 0.18 + 0.15 * (Math.floor(t * 8) % 2);
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
        popup(
          `+${coinValue(s.chain - 1)}${s.chain >= 2 ? ` ×${s.chain}` : ''}`,
          px,
          pz,
          s.chain >= 3 ? '#ffe066' : '#ffffff',
        );
      }
      if (s.over && !wasOver) {
        wasOver = true;
        ctx.sfx(s.lives <= 0 ? 'bad' : 'win');
      }
      for (let i = popups.length - 1; i >= 0; i--) {
        const p = popups[i]!;
        p.t += dt;
        p.sp.position.y = p.y0 + p.t * 1.4;
        p.sp.material.opacity = Math.max(0, 1 - p.t);
        if (p.t > 1) {
          p.sp.removeFromParent();
          p.sp.material.map?.dispose();
          p.sp.material.dispose();
          popups.splice(i, 1);
        }
      }

      // Kamera: hinter der Figur, schräg von oben
      let d = s.ang - camAng;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      camAng += d * Math.min(1, dt * 3.5);
      const asp = camera.aspect || 1.6;
      const f = asp < 1 ? 0.92 / asp : 1;
      const fog = ctx.scene.fog as THREE.Fog | null;
      if (fog) {
        fog.near = 24 * f;
        fog.far = 60 * f;
      }
      const D = 15 * f;
      const H = 14.5 * f;
      shake = Math.max(0, shake - dt * 1.6);
      const sh = shake * 0.35;
      camera.position.set(
        Math.cos(camAng) * D + Math.sin(t * 63) * sh,
        H + Math.sin(t * 71) * sh,
        Math.sin(camAng) * D,
      );
      camera.lookAt(-Math.cos(camAng) * 0.5, 0, -Math.sin(camAng) * 0.5);
    },
    ghosts(states, dt) {
      updateRivals(rivals, states, dt, (r, st, i) => {
        // Ausgeschiedene Mitspieler verschwinden kurz nach dem letzten Treffer
        r.group.visible = !(st.over && st.lives <= 0 && st.inv < 60);
        place(r, st, rivT[i]!, dt);
      });
    },
    dispose() {
      ctx.scene.fog = null;
      flareViews.forEach((fv) => fv.m.geometry.dispose());
    },
  };
};
