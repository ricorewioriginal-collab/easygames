import * as THREE from 'three';
import type { GraviState } from '@shared/minigames/games/gravifaenger';
import { WORLD_X, WORLD_Y } from '@shared/minigames/games/gravifaenger';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';

const PLANET_COLORS = [
  { base: 0xff7a59, band: 0xffb36b, ring: 0xffe0a0 },
  { base: 0x3fb8ff, band: 0x8fe0ff, ring: 0xd0f4ff },
  { base: 0xb06bff, band: 0xe0a8ff, ring: 0xf6d6ff },
  { base: 0x3fd69a, band: 0xa6f5cf, ring: 0xdcffee },
];

/** Tiefes All: Planeten mit Gravitationswellen, ein Comic-Raumschiff mit Flammenschweif und funkelnde Sternenorbs. */
export const createView: MiniGameViewFactory<GraviState> = (ctx, initial) => {
  const { root, camera, scene } = ctx;
  scene.background = new THREE.Color(0x120b3a);

  // --- Hintergrund -----------------------------------------------------------
  const nebulaCols = [0xff3d9a, 0x2bd1c4, 0x6a4dff, 0xff8a3d];
  for (let i = 0; i < 4; i++) {
    const n = new THREE.Mesh(new THREE.CircleGeometry(9 + (i % 2) * 4, 32), glow(nebulaCols[i]!, 0.1));
    n.position.set(-14 + i * 9.5, (i % 2 ? 5 : -5), -26);
    root.add(n);
  }
  const SPTS = 260;
  const spos = new Float32Array(SPTS * 3);
  for (let i = 0; i < SPTS; i++) {
    spos[i * 3] = (((i * 97) % 211) / 211 - 0.5) * 80;
    spos[i * 3 + 1] = (((i * 61) % 173) / 173 - 0.5) * 50;
    spos[i * 3 + 2] = -12 - ((i * 13) % 40);
  }
  const sgeo = new THREE.BufferGeometry();
  sgeo.setAttribute('position', new THREE.BufferAttribute(spos, 3));
  const starPoints = new THREE.Points(sgeo, new THREE.PointsMaterial({ color: 0xffffff, size: 2.5, sizeAttenuation: false }));
  root.add(starPoints);
  // Spielfeld-Rahmen (sanft leuchtende Grenze)
  const frame = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(WORLD_X * 2, WORLD_Y * 2, 0.01)),
    new THREE.LineBasicMaterial({ color: 0x6a5cff, transparent: true, opacity: 0.55 }),
  );
  root.add(frame);

  // --- Planeten --------------------------------------------------------------
  const rings: Array<{ m: THREE.Mesh; planet: number; off: number }> = [];
  const planetGroups: THREE.Group[] = initial.planets.map((p, i) => {
    const pal = PLANET_COLORS[i % PLANET_COLORS.length]!;
    const g = new THREE.Group();
    g.position.set(p.x, p.y, 0);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(p.r, 32, 24), toon(pal.base));
    g.add(ball);
    for (let k = 0; k < 3; k++) {
      const phi0 = 0.5 + k * 0.85 + (i % 2) * 0.2;
      const band = new THREE.Mesh(new THREE.SphereGeometry(p.r * 1.012, 32, 8, 0, Math.PI * 2, phi0, 0.26), toon(pal.band));
      g.add(band);
    }
    g.rotation.x = 0.5 + i * 0.3;
    g.rotation.z = 0.35 - i * 0.2;
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(p.r * 1.28, 24, 16), glow(pal.band, 0.16));
    const outer = new THREE.Group();
    outer.position.copy(g.position);
    outer.add(g);
    // Atmosphäre und Ring gehören nicht zur geneigten Gruppe
    const atmoHolder = new THREE.Group();
    atmoHolder.position.copy(g.position);
    atmoHolder.add(atmo);
    root.add(atmoHolder);
    g.position.set(0, 0, 0);
    if (i % 2 === 0) {
      const ringMesh = new THREE.Mesh(new THREE.RingGeometry(p.r * 1.5, p.r * 2.0, 40), new THREE.MeshBasicMaterial({ color: pal.ring, transparent: true, opacity: 0.7, side: THREE.DoubleSide }));
      ringMesh.rotation.x = Math.PI / 2 - 0.9;
      ringMesh.rotation.y = 0.2;
      outer.add(ringMesh);
    }
    root.add(outer);
    // Gravitationswellen laufen nach innen
    for (let k = 0; k < 3; k++) {
      const w = new THREE.Mesh(new THREE.RingGeometry(0.985, 1, 48), glow(pal.band, 0.4));
      w.position.set(p.x, p.y, -0.1);
      root.add(w);
      rings.push({ m: w, planet: i, off: k / 3 });
    }
    return g;
  });

  // --- Schiff ------------------------------------------------------------------
  const ship = new THREE.Group();
  const model = new THREE.Group();
  ship.add(model);
  const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.7, 14), toon(0xf2f4ff));
  model.add(hull);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.42, 14), toon(0xff4d5e));
  nose.position.y = 0.56;
  model.add(nose);
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.265, 0.27, 0.12, 14), toon(0xff4d5e));
  stripe.position.y = -0.2;
  model.add(stripe);
  const win = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), toon(0x5ad2ff, { emissive: 0x2a9fff, emissiveIntensity: 0.6 }));
  win.position.set(0, 0.12, 0.2);
  model.add(win);
  for (let k = 0; k < 3; k++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.38, 0.3), toon(0xff4d5e));
    const a = (k / 3) * Math.PI * 2;
    fin.position.set(Math.cos(a) * 0.3, -0.3, Math.sin(a) * 0.3);
    fin.rotation.y = -a;
    fin.rotation.z = Math.cos(a) * -0.35;
    fin.rotation.x = Math.sin(a) * 0.35;
    model.add(fin);
  }
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.12, 12), toon(0x6a6a8a));
  nozzle.position.y = -0.4;
  model.add(nozzle);
  const flame = new THREE.Group();
  const flameOuter = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.7, 10), glow(0xff8a2d, 0.9));
  flameOuter.rotation.x = Math.PI;
  flameOuter.position.y = -0.78;
  const flameInner = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.45, 10), glow(0xfff06a));
  flameInner.rotation.x = Math.PI;
  flameInner.position.y = -0.66;
  flame.add(flameOuter, flameInner);
  model.add(flame);
  model.scale.setScalar(1.15);
  root.add(ship);
  const bar = new THREE.Group();
  const barBg = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.14), glow(0x0a0624, 0.7));
  const barFg = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.14), glow(0x6dff9a));
  barFg.position.z = 0.01;
  bar.add(barBg, barFg);
  root.add(bar);
  // Schweif
  const TRAIL = 70;
  const trailPos = new Float32Array(TRAIL * 3);
  const trailCol = new Float32Array(TRAIL * 3);
  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
  trailGeo.setAttribute('color', new THREE.BufferAttribute(trailCol, 3));
  const trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ vertexColors: true }));
  trail.frustumCulled = false;
  root.add(trail);
  for (let i = 0; i < TRAIL; i++) {
    const f = 1 - i / TRAIL;
    trailCol[i * 3] = 0.45 * f + 0.07;
    trailCol[i * 3 + 1] = 0.7 * f + 0.04;
    trailCol[i * 3 + 2] = 1 * f + 0.23;
    trailPos[i * 3] = initial.x;
    trailPos[i * 3 + 1] = initial.y;
  }

  // --- Orbs -------------------------------------------------------------------
  interface OrbView {
    group: THREE.Group;
    ring: THREE.Mesh;
    sparks: THREE.Mesh[];
    born: number;
  }
  const orbViews = new Map<number, OrbView>();
  const orbCore = new THREE.SphereGeometry(0.34, 16, 12);
  function makeOrb(): OrbView {
    const group = new THREE.Group();
    const core = new THREE.Mesh(orbCore, toon(0x7df9ff, { emissive: 0x39d5ff, emissiveIntensity: 0.9 }));
    const inner = new THREE.Mesh(new THREE.OctahedronGeometry(0.2), glow(0xffffff));
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.62, 14, 10), glow(0x6af0ff, 0.2));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.035, 6, 24), glow(0xffffff, 0.8));
    ring.rotation.x = 1.1;
    const sparks: THREE.Mesh[] = [];
    for (let k = 0; k < 2; k++) {
      const sp = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), glow(0xfff6a0));
      group.add(sp);
      sparks.push(sp);
    }
    group.add(core, inner, halo, ring);
    root.add(group);
    return { group, ring, sparks, born: -1 };
  }

  const popups: Array<{ sp: THREE.Sprite; t: number }> = [];
  function popup(text: string, x: number, y: number, color: string): void {
    const sp = textSprite(text, { color, size: 72, width: 1.7 });
    sp.position.set(x, y + 0.8, 0.5);
    root.add(sp);
    popups.push({ sp, t: 0 });
  }

  let t = 0;
  let lastCollected = initial.collected;
  let lastCrashes = initial.crashes;
  let lastBumps = initial.bumps;
  let burnT = 0;
  let shake = 0;
  let trailTimer = 0;
  const v3 = new THREE.Vector3();

  return {
    update(s, dt) {
      t += dt;
      starPoints.rotation.z += dt * 0.004;
      planetGroups.forEach((g, i) => (g.rotation.y += dt * (0.25 + i * 0.08)));
      for (const r of rings) {
        const p = s.planets[r.planet]!;
        const k = (t * 0.35 + r.off) % 1;
        const rad = p.r + 0.5 + (1 - k) * 4.2;
        r.m.scale.setScalar(rad);
        (r.m.material as THREE.MeshBasicMaterial).opacity = 0.42 * Math.sin(k * Math.PI);
      }

      // Schiff
      const blink = s.safe > 0 && Math.floor(t * 14) % 2 === 0;
      ship.visible = !(blink && s.safe < 95);
      ship.position.set(s.x, s.y, 0);
      model.rotation.z = s.ang - Math.PI / 2;
      model.rotation.y = Math.sin(t * 3) * 0.12;
      flame.visible = s.thrusting;
      if (s.thrusting) {
        const f = 0.8 + Math.sin(t * 60) * 0.18 + Math.sin(t * 37) * 0.1;
        flame.scale.set(0.9 + Math.sin(t * 50) * 0.1, f, 0.9);
        burnT -= dt;
        if (burnT <= 0) {
          burnT = 0.05;
          const bx = s.x - Math.cos(s.ang) * 0.75;
          const by = s.y - Math.sin(s.ang) * 0.75;
          ctx.burst(v3.set(bx, by, 0), Math.random() < 0.5 ? 0xff8a2d : 0xffe06a, 2);
        }
      }
      bar.position.set(s.x, s.y - 0.95, 0.2);
      barFg.scale.x = Math.max(0.001, s.fuel);
      barFg.position.x = -0.55 * (1 - s.fuel);
      (barFg.material as THREE.MeshBasicMaterial).color.setHex(s.fuel < 0.2 ? 0xff5a5a : s.fuel < 0.45 ? 0xffc933 : 0x6dff9a);
      // Schweif aktualisieren
      trailTimer -= dt;
      if (trailTimer <= 0) {
        trailTimer = 0.03;
        for (let i = TRAIL - 1; i > 0; i--) {
          trailPos[i * 3] = trailPos[(i - 1) * 3]!;
          trailPos[i * 3 + 1] = trailPos[(i - 1) * 3 + 1]!;
        }
        trailPos[0] = s.x;
        trailPos[1] = s.y;
        (trailGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
        (trailGeo.getAttribute('color') as THREE.BufferAttribute).needsUpdate = true;
      }

      // Orbs
      const alive = new Set<number>();
      for (const o of s.orbs) {
        alive.add(o.id);
        let v = orbViews.get(o.id);
        if (!v) {
          v = makeOrb();
          v.group.position.set(o.x, o.y, 0);
          orbViews.set(o.id, v);
        }
        if (v.born < 0) v.born = t;
        const k = Math.min(1, (t - v.born) / 0.4);
        v.group.scale.setScalar(k * (1 + Math.sin(k * Math.PI) * 0.35) * (1 + Math.sin(t * 4 + o.id) * 0.05));
        v.ring.rotation.z = t * 2 + o.id;
        v.sparks.forEach((sp, i) => {
          const a = t * (2.6 + i) + i * Math.PI;
          sp.position.set(Math.cos(a) * 0.7, Math.sin(a) * 0.7, Math.sin(a * 1.7) * 0.2);
        });
      }
      for (const [id, v] of orbViews) {
        if (!alive.has(id)) {
          v.group.removeFromParent();
          orbViews.delete(id);
        }
      }

      // Ereignisse
      if (s.collected !== lastCollected) {
        lastCollected = s.collected;
        ctx.burst(v3.set(s.lastPick.x, s.lastPick.y, 0), 0x7df9ff, 24);
        ctx.burst(v3.set(s.lastPick.x, s.lastPick.y, 0), 0xffffff, 10);
        ctx.sfx('coin');
        popup('+100', s.lastPick.x, s.lastPick.y, '#9ff4ff');
      }
      if (s.crashes !== lastCrashes) {
        lastCrashes = s.crashes;
        ctx.burst(v3.set(s.lastCrash.x, s.lastCrash.y, 0), 0xff8a2d, 36);
        ctx.burst(v3.set(s.lastCrash.x, s.lastCrash.y, 0), 0xff3d5a, 18);
        ctx.sfx('hit');
        ctx.sfx('bad');
        popup('-60', s.lastCrash.x, s.lastCrash.y, '#ff6a7a');
        shake = 0.5;
        trailPos.fill(0);
        for (let i = 0; i < TRAIL; i++) {
          trailPos[i * 3] = s.x;
          trailPos[i * 3 + 1] = s.y;
        }
      }
      if (s.bumps !== lastBumps) {
        lastBumps = s.bumps;
        ctx.sfx('tick');
        ctx.burst(v3.set(s.x, s.y, 0), 0xaaa0ff, 6);
      }
      for (let i = popups.length - 1; i >= 0; i--) {
        const p = popups[i]!;
        p.t += dt;
        p.sp.position.y += dt * 1.4;
        p.sp.material.opacity = Math.max(0, 1 - p.t / 0.9);
        if (p.t > 0.9) {
          p.sp.removeFromParent();
          p.sp.material.map?.dispose();
          p.sp.material.dispose();
          popups.splice(i, 1);
        }
      }

      // Kamera: im Hochformat um 90° gerollt, damit das breite Feld den Bildschirm füllt
      const aspect = camera.aspect;
      const rolled = aspect < 0.85;
      const halfAcross = rolled ? WORLD_Y + 1.2 : WORLD_X + 1.2;
      const halfAlong = rolled ? WORLD_X + 1.2 : WORLD_Y + 1.2;
      const D = Math.max(halfAcross / (0.466 * aspect), halfAlong / 0.466, 12);
      shake = Math.max(0, shake - dt);
      camera.up.set(rolled ? 1 : 0, rolled ? 0 : 1, 0);
      camera.position.set(Math.sin(t * 0.3) * 0.3 + Math.sin(t * 85) * shake * 0.3, -D * 0.12 + Math.cos(t * 0.23) * 0.2, D);
      camera.lookAt(0, 0, 0);
    },
    dispose() {
      camera.up.set(0, 1, 0);
    },
  };
};
