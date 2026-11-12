import * as THREE from 'three';
import type { GraviState } from '@shared/minigames/games/gravifaenger';
import { COMET_R, DURATION_TICKS, WORLD_X, WORLD_Y, phaseOf } from '@shared/minigames/games/gravifaenger';
import { glow, textSprite, toon } from '../../render/materials';
import type { Avatar, MiniGameViewFactory } from '../viewTypes';
import { makeMe, makeRivals, updateRivals, type Racer } from './rivals';

const PLANET_COLORS = [
  { base: 0xff7a59, band: 0xffb36b, ring: 0xffe0a0 },
  { base: 0x3fb8ff, band: 0x8fe0ff, ring: 0xd0f4ff },
  { base: 0xb06bff, band: 0xe0a8ff, ring: 0xf6d6ff },
  { base: 0x3fd69a, band: 0xa6f5cf, ring: 0xdcffee },
];

interface Ufo {
  g: THREE.Group;
  tilt: THREE.Group;
  flame: THREE.Group;
  mats: THREE.Material[];
}

/**
 * Tiefes All (quadratisches Feld, passt hoch und quer): Planeten mit Gravitationswellen, Kometen, funkelnde Orbs.
 * Die eigene Figur steuert ein Ufo in ihrer Farbe; Mitspieler fliegen halbdurchsichtig in ihren Ufos mit.
 */
export const createView: MiniGameViewFactory<GraviState> = (ctx, initial) => {
  const { root, camera, scene } = ctx;
  const bg = new THREE.Color(0x120b3a);
  scene.background = bg;

  // --- Hintergrund -----------------------------------------------------------
  const nebulaCols = [0xff3d9a, 0x2bd1c4, 0x6a4dff, 0xff8a3d];
  for (let i = 0; i < 4; i++) {
    const n = new THREE.Mesh(new THREE.CircleGeometry(9 + (i % 2) * 4, 32), glow(nebulaCols[i]!, 0.06));
    n.position.set(-14 + i * 9.5, i % 2 ? 6 : -6, -26);
    root.add(n);
  }
  const SPTS = 260;
  const spos = new Float32Array(SPTS * 3);
  for (let i = 0; i < SPTS; i++) {
    spos[i * 3] = (((i * 97) % 211) / 211 - 0.5) * 80;
    spos[i * 3 + 1] = (((i * 61) % 173) / 173 - 0.5) * 70;
    spos[i * 3 + 2] = -12 - ((i * 13) % 40);
  }
  const sgeo = new THREE.BufferGeometry();
  sgeo.setAttribute('position', new THREE.BufferAttribute(spos, 3));
  const starPoints = new THREE.Points(
    sgeo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 2.5, sizeAttenuation: false }),
  );
  root.add(starPoints);
  // Spielfeld-Rahmen (leuchtende Grenze) und dunkle Spielfläche
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(WORLD_X * 2 + 1.2, WORLD_Y * 2 + 1.2),
    new THREE.MeshBasicMaterial({ color: 0x0a0628, transparent: true, opacity: 0.45 }),
  );
  floor.position.z = -0.6;
  root.add(floor);
  const frameMat = new THREE.LineBasicMaterial({ color: 0x8a7cff, transparent: true, opacity: 0.7 });
  const frame = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(WORLD_X * 2 + 0.6, WORLD_Y * 2 + 0.6, 0.01)),
    frameMat,
  );
  root.add(frame);

  // --- Planeten --------------------------------------------------------------
  const rings: Array<{ m: THREE.Mesh; planet: number; off: number }> = [];
  const atmos: THREE.MeshBasicMaterial[] = [];
  const planetGroups: THREE.Group[] = initial.planets.map((p, i) => {
    const pal = PLANET_COLORS[i % PLANET_COLORS.length]!;
    const outer = new THREE.Group();
    outer.position.set(p.x, p.y, 0);
    const g = new THREE.Group();
    const ball = new THREE.Mesh(new THREE.SphereGeometry(p.r, 32, 24), toon(pal.base));
    g.add(ball);
    for (let k = 0; k < 3; k++) {
      const phi0 = 0.5 + k * 0.85 + (i % 2) * 0.2;
      const band = new THREE.Mesh(
        new THREE.SphereGeometry(p.r * 1.012, 32, 8, 0, Math.PI * 2, phi0, 0.26),
        toon(pal.band),
      );
      g.add(band);
    }
    g.rotation.x = 0.5 + i * 0.3;
    g.rotation.z = 0.35 - i * 0.2;
    outer.add(g);
    const atmoMat = glow(pal.band, 0.16);
    atmos.push(atmoMat);
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(p.r * 1.28, 24, 16), atmoMat);
    outer.add(atmo);
    if (i % 2 === 0) {
      const ringMesh = new THREE.Mesh(
        new THREE.RingGeometry(p.r * 1.5, p.r * 1.9, 40),
        new THREE.MeshBasicMaterial({
          color: pal.ring,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide,
        }),
      );
      ringMesh.rotation.x = Math.PI / 2 - 0.9;
      ringMesh.rotation.y = 0.2;
      outer.add(ringMesh);
    }
    root.add(outer);
    // Gravitationswellen laufen nach innen
    for (let k = 0; k < 3; k++) {
      const w = new THREE.Mesh(new THREE.RingGeometry(0.985, 1, 48), glow(pal.band, 0.4));
      w.position.set(p.x, p.y, -0.3);
      root.add(w);
      rings.push({ m: w, planet: i, off: k / 3 });
    }
    return g;
  });

  // --- Ufos -------------------------------------------------------------------
  const makeUfo = (color: number, ghost: boolean): Ufo => {
    const g = new THREE.Group();
    const tilt = new THREE.Group();
    g.add(tilt);
    const mats: THREE.Material[] = [];
    const m = <T extends THREE.Material>(mat: T): T => {
      if (ghost) {
        mat.transparent = true;
        mat.opacity = Math.min(mat.opacity, 0.5);
        mat.depthWrite = false;
      }
      mats.push(mat);
      return mat;
    };
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 28, 12),
      m(new THREE.MeshToonMaterial({ color })),
    );
    body.scale.set(1, 0.28, 1);
    tilt.add(body);
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.78, 0.07, 8, 32),
      m(new THREE.MeshToonMaterial({ color: 0xf2f4ff })),
    );
    rim.rotation.x = Math.PI / 2;
    tilt.add(rim);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), m(glow(0xfff36e)));
      lamp.position.set(Math.cos(a) * 0.78, -0.02, Math.sin(a) * 0.78);
      tilt.add(lamp);
    }
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      m(
        new THREE.MeshBasicMaterial({
          color: 0xbff4ff,
          transparent: true,
          opacity: ghost ? 0.15 : 0.22,
          depthWrite: false,
        }),
      ),
    );
    dome.position.y = 0.12;
    tilt.add(dome);
    tilt.rotation.x = 0.45;
    const flame = new THREE.Group();
    const fo = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.9, 10), m(glow(0xff8a2d, 0.9)));
    fo.rotation.z = Math.PI / 2;
    fo.position.x = -0.95;
    const fi = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.6, 10), m(glow(0xfff06a)));
    fi.rotation.z = Math.PI / 2;
    fi.position.x = -0.85;
    flame.add(fo, fi);
    g.add(flame);
    root.add(g);
    return { g, tilt, flame, mats };
  };
  const pilot = (r: Racer, u: Ufo, scale: number): void => {
    r.ring.visible = false;
    r.group.removeFromParent();
    u.tilt.add(r.group);
    r.group.scale.setScalar(scale);
    r.group.position.set(0, 0.02, 0.05);
    r.group.rotation.x = -0.45;
  };
  const meUfo = makeUfo(ctx.me.color, false);
  meUfo.g.scale.setScalar(1.55);
  const me = makeMe(ctx);
  pilot(me, meUfo, 0.42);
  const rivUfos: Ufo[] = ctx.rivals.map((a: Avatar) => makeUfo(a.color, true));
  const rivals: Racer[] = makeRivals(ctx);
  rivals.forEach((r, i) => {
    pilot(r, rivUfos[i] as Ufo, 0.36);
    (rivUfos[i] as Ufo).g.scale.setScalar(1.25);
  });

  // Turbo-Energie
  const bar = new THREE.Group();
  const barBg = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.16), glow(0x0a0624, 0.7));
  const barFg = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.16), glow(0x6dff9a));
  barFg.position.z = 0.01;
  bar.add(barBg, barFg);
  root.add(bar);
  // Kettenschild über dem Ufo
  const chainSprites = new Map<number, THREE.Sprite>();
  let chainShown: THREE.Sprite | null = null;
  // Schweif
  const TRAIL = 60;
  const trailPos = new Float32Array(TRAIL * 3);
  const trailCol = new Float32Array(TRAIL * 3);
  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
  trailGeo.setAttribute('color', new THREE.BufferAttribute(trailCol, 3));
  const trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ vertexColors: true }));
  trail.frustumCulled = false;
  root.add(trail);
  const myCol = new THREE.Color(ctx.me.color);
  for (let i = 0; i < TRAIL; i++) {
    const f = 1 - i / TRAIL;
    trailCol[i * 3] = myCol.r * f + 0.07 * (1 - f);
    trailCol[i * 3 + 1] = myCol.g * f + 0.04 * (1 - f);
    trailCol[i * 3 + 2] = myCol.b * f + 0.23 * (1 - f);
    trailPos[i * 3] = initial.x;
    trailPos[i * 3 + 1] = initial.y;
    trailPos[i * 3 + 2] = -0.2;
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
  function makeOrb(gold: boolean): OrbView {
    const group = new THREE.Group();
    const core = new THREE.Mesh(
      orbCore,
      gold
        ? toon(0xffd23f, { emissive: 0xffa800, emissiveIntensity: 0.9 })
        : toon(0x7df9ff, { emissive: 0x39d5ff, emissiveIntensity: 0.9 }),
    );
    const inner = new THREE.Mesh(new THREE.OctahedronGeometry(0.2), glow(0xffffff));
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.62, 14, 10),
      glow(gold ? 0xffe36e : 0x6af0ff, 0.22),
    );
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.035, 6, 24), glow(0xffffff, 0.8));
    ring.rotation.x = 1.1;
    const sparks: THREE.Mesh[] = [];
    for (let k = 0; k < (gold ? 4 : 2); k++) {
      const sp = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), glow(0xfff6a0));
      group.add(sp);
      sparks.push(sp);
    }
    group.add(core, inner, halo, ring);
    if (gold) group.scale.setScalar(1.15);
    root.add(group);
    return { group, ring, sparks, born: -1 };
  }

  // --- Kometen -----------------------------------------------------------------
  const cometViews = new Map<number, THREE.Group>();
  const cometGeo = new THREE.IcosahedronGeometry(COMET_R, 0);
  const tailGeo = new THREE.ConeGeometry(COMET_R * 0.9, 2.6, 12, 1, true);
  const makeComet = (): THREE.Group => {
    const g = new THREE.Group();
    const rock = new THREE.Mesh(cometGeo, toon(0x9aa6c8));
    g.add(rock);
    const glowBall = new THREE.Mesh(new THREE.SphereGeometry(COMET_R * 1.5, 12, 8), glow(0xff5a3d, 0.35));
    g.add(glowBall);
    const tail = new THREE.Mesh(tailGeo, glow(0xff8a3d, 0.5));
    tail.rotation.z = Math.PI / 2;
    tail.position.x = -1.35;
    g.add(tail);
    root.add(g);
    return g;
  };

  // --- Texte -------------------------------------------------------------------
  const popups: Array<{ sp: THREE.Sprite; t: number }> = [];
  const popCache = new Map<string, THREE.Sprite[]>();
  function popup(text: string, x: number, y: number, color: string, width = 1.7, bg?: string): void {
    const key = `${text}|${color}|${bg ?? ''}`;
    const arr = popCache.get(key) ?? [];
    popCache.set(key, arr);
    let sp = arr.find((q) => !q.visible);
    if (!sp) {
      sp = textSprite(text, { color, size: 72, width, bg });
      root.add(sp);
      arr.push(sp);
    }
    sp.visible = true;
    sp.material.opacity = 1;
    sp.position.set(x, y + 0.9, 1.5);
    popups.push({ sp, t: 0 });
  }
  const banner = textSprite('SUPERNOVA · ALLES ×2', { color: '#2a0a00', bg: '#ffb13d', size: 72, width: 9 });
  banner.visible = false;
  root.add(banner);
  const cometBanner = textSprite('KOMETEN!', {
    color: '#ffffff',
    bg: 'rgba(255,61,90,0.9)',
    size: 72,
    width: 5,
  });
  cometBanner.visible = false;
  root.add(cometBanner);

  let t = 0;
  let lastCollected = initial.collected;
  let lastCrashes = initial.crashes;
  let lastBumps = initial.bumps;
  let burnT = 0;
  let shake = 0;
  let trailTimer = 0;
  let lastPhase = 0;
  let bannerT = -1;
  let cometT = -1;
  let busy = 0;
  let wasOver = false;
  const v3 = new THREE.Vector3();
  const rivalCrashes = ctx.rivals.map(() => -1);
  const rivalCollected = ctx.rivals.map(() => -1);

  const placeUfo = (
    u: Ufo,
    x: number,
    y: number,
    ang: number,
    vx: number,
    thrust: boolean,
    boost: boolean,
  ): void => {
    u.g.position.set(x, y, 0.2);
    // leicht in Flugrichtung neigen
    u.tilt.rotation.z = THREE.MathUtils.clamp(-vx * 0.05, -0.35, 0.35);
    u.flame.visible = thrust;
    u.flame.rotation.z = ang;
    if (thrust) {
      const f = (boost ? 1.5 : 1) * (0.85 + Math.sin(t * 60 + x) * 0.15);
      u.flame.scale.set(f, boost ? 1.3 : 1, 1);
    }
  };

  return {
    update(s, dt) {
      t += dt;
      starPoints.rotation.z += dt * 0.004;
      planetGroups.forEach((g, i) => (g.rotation.y += dt * (0.25 + i * 0.08)));
      const phase = phaseOf(s.tick);
      const nova = phase === 2;
      for (const r of rings) {
        const p = s.planets[r.planet]!;
        const k = (t * (nova ? 0.6 : 0.35) + r.off) % 1;
        const rad = p.r + 0.5 + (1 - k) * 4;
        r.m.scale.setScalar(rad);
        (r.m.material as THREE.MeshBasicMaterial).opacity = (nova ? 0.6 : 0.4) * Math.sin(k * Math.PI);
      }
      atmos.forEach((m) => {
        m.opacity = nova ? 0.25 + Math.sin(t * 6) * 0.08 : 0.16;
        if (nova) m.color.setHex(0xff7a3d);
      });
      if (nova) bg.setHex(0x2a0b30);

      // Eigenes Ufo
      const blink = s.safe > 0 && Math.floor(t * 14) % 2 === 0;
      meUfo.g.visible = !(blink && s.safe < 75);
      placeUfo(meUfo, s.x, s.y, s.ang, s.vx, s.thrusting, s.boosting);
      if (s.thrusting) {
        burnT -= dt;
        if (burnT <= 0) {
          burnT = s.boosting ? 0.025 : 0.06;
          const bx = s.x - Math.cos(s.ang) * 1.2;
          const by = s.y - Math.sin(s.ang) * 1.2;
          ctx.burst(
            v3.set(bx, by, 0),
            Math.floor(t * 20) % 2 === 0 ? 0xff8a2d : 0xffe06a,
            s.boosting ? 3 : 1,
          );
        }
      }
      busy = Math.max(0, busy - dt);
      if (busy <= 0 && me.rig.current !== 'idle' && !wasOver) me.rig.play('idle', { loop: true });
      me.rig.update(dt);
      bar.position.set(s.x, s.y - 1.6, 0.6);
      barFg.scale.x = Math.max(0.001, s.fuel);
      barFg.position.x = -0.65 * (1 - s.fuel);
      (barFg.material as THREE.MeshBasicMaterial).color.setHex(
        s.fuel < 0.2 ? 0xff5a5a : s.fuel < 0.45 ? 0xffc933 : 0x6dff9a,
      );
      // Kettenschild
      const want = s.chain >= 2 ? s.chain : 0;
      let sp = want ? chainSprites.get(want) : undefined;
      if (want && !sp) {
        sp = textSprite(`Kette ×${want}`, {
          color: '#ffffff',
          bg: 'rgba(255,61,127,0.9)',
          size: 64,
          width: 2.2,
        });
        root.add(sp);
        chainSprites.set(want, sp);
      }
      if (chainShown && chainShown !== sp) chainShown.visible = false;
      chainShown = sp ?? null;
      if (chainShown) {
        chainShown.visible = true;
        chainShown.position.set(s.x, s.y + 2, 1.4);
        chainShown.material.opacity = Math.min(1, 1.5 - s.chainT / 180);
      }
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
      }

      // Orbs
      const alive = new Set<number>();
      for (const o of s.orbs) {
        alive.add(o.id);
        let v = orbViews.get(o.id);
        if (!v) {
          v = makeOrb(o.planet >= 0);
          orbViews.set(o.id, v);
        }
        v.group.position.set(o.x, o.y, 0);
        if (v.born < 0) v.born = t;
        const k = Math.min(1, (t - v.born) / 0.4);
        const base = o.planet >= 0 ? 1.15 : 1;
        v.group.scale.setScalar(
          base * k * (1 + Math.sin(k * Math.PI) * 0.35) * (1 + Math.sin(t * 4 + o.id) * 0.05),
        );
        v.ring.rotation.z = t * 2 + o.id;
        v.sparks.forEach((spk, i) => {
          const a = t * (2.6 + i) + i * Math.PI;
          spk.position.set(Math.cos(a) * 0.7, Math.sin(a) * 0.7, Math.sin(a * 1.7) * 0.2);
        });
      }
      for (const [id, v] of orbViews) {
        if (!alive.has(id)) {
          v.group.removeFromParent();
          orbViews.delete(id);
        }
      }
      // Kometen
      const calive = new Set<number>();
      for (const c of s.comets) {
        calive.add(c.id);
        let g = cometViews.get(c.id);
        if (!g) {
          g = makeComet();
          cometViews.set(c.id, g);
        }
        g.position.set(c.x, c.y, 0.1);
        g.rotation.z = Math.atan2(c.vy, c.vx);
        (g.children[0] as THREE.Object3D).rotation.x += dt * 4;
      }
      for (const [id, g] of cometViews) {
        if (!calive.has(id)) {
          g.removeFromParent();
          cometViews.delete(id);
        }
      }

      // Ereignisse
      if (s.collected !== lastCollected) {
        lastCollected = s.collected;
        const L = s.lastPick;
        ctx.burst(v3.set(L.x, L.y, 0), L.gold ? 0xffd23f : 0x7df9ff, L.gold ? 32 : 22);
        ctx.burst(v3.set(L.x, L.y, 0), 0xffffff, 10);
        ctx.sfx(L.gold ? 'win' : 'coin');
        popup(`+${L.pts}`, L.x, L.y, L.gold || nova ? '#ffd23f' : '#9ff4ff');
        if (L.chain >= 3 && L.chain % 2 === 1) {
          me.rig.play('cheer');
          busy = 1.2;
        }
      }
      if (s.crashes !== lastCrashes) {
        lastCrashes = s.crashes;
        ctx.burst(v3.set(s.lastCrash.x, s.lastCrash.y, 0), 0xff8a2d, 36);
        ctx.burst(v3.set(s.lastCrash.x, s.lastCrash.y, 0), 0xff3d5a, 18);
        ctx.sfx('hit');
        ctx.sfx('bad');
        popup('−80', s.lastCrash.x, s.lastCrash.y, '#ff6a7a');
        shake = 0.6;
        me.rig.play('shock');
        busy = 1.2;
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
      if (phase !== lastPhase) {
        if (phase === 2) {
          bannerT = 0;
          ctx.sfx('whoosh');
          shake = 0.4;
        } else if (phase === 1) {
          cometT = 0;
          ctx.sfx('beep');
        }
        lastPhase = phase;
      }
      if (bannerT >= 0) {
        bannerT += dt;
        banner.visible = bannerT < 2.2;
        const k = Math.min(1, bannerT * 5);
        banner.scale.set(9 * k, 9 * k * 0.15, 1);
        banner.position.set(0, 2, 2);
      }
      if (cometT >= 0) {
        cometT += dt;
        cometBanner.visible = cometT < 1.6;
        const k = Math.min(1, cometT * 5);
        cometBanner.scale.set(5 * k, 5 * k * 0.22, 1);
        cometBanner.position.set(0, 2, 2);
      }
      for (let i = popups.length - 1; i >= 0; i--) {
        const p = popups[i]!;
        p.t += dt;
        p.sp.position.y += dt * 1.4;
        p.sp.material.opacity = Math.max(0, 1 - p.t / 0.9);
        if (p.t > 0.9) {
          p.sp.visible = false;
          popups.splice(i, 1);
        }
      }
      if (s.tick >= DURATION_TICKS && !wasOver) {
        wasOver = true;
        me.rig.play('celebrate');
      }

      // Kamera: quadratisches Feld passt in jede Bildschirmform
      const aspect = camera.aspect || 1.6;
      const half = WORLD_X + 1.3;
      const tanH = Math.tan((camera.fov * Math.PI) / 360);
      const D = Math.max(half / (tanH * aspect), half / tanH, 12) * (aspect < 1 ? 1.02 : 1.06);
      shake = Math.max(0, shake - dt);
      camera.up.set(0, 1, 0);
      camera.position.set(
        Math.sin(t * 0.3) * 0.25 + Math.sin(t * 85) * shake * 0.35,
        -D * 0.1 + Math.cos(t * 0.23) * 0.15 + Math.cos(t * 71) * shake * 0.25,
        D,
      );
      camera.lookAt(0, aspect < 1 ? -0.4 : 0, 0);
    },
    ghosts(states, dt) {
      updateRivals(rivals, states, dt, (r, rs, i) => {
        const u = rivUfos[i] as Ufo;
        u.g.visible = !(rs.safe > 0 && Math.floor(t * 14) % 2 === 0);
        placeUfo(u, rs.x, rs.y, rs.ang, rs.vx, rs.thrusting, rs.boosting);
        u.g.position.z = -0.1 - i * 0.05;
        if (rivalCrashes[i] !== rs.crashes) {
          if (rivalCrashes[i] !== -1) {
            ctx.burst(v3.set(rs.lastCrash.x, rs.lastCrash.y, 0), r.avatar.color, 12);
            r.rig.play('shock');
          }
          rivalCrashes[i] = rs.crashes;
        }
        if (rivalCollected[i] !== rs.collected) {
          if (rivalCollected[i] !== -1) ctx.burst(v3.set(rs.lastPick.x, rs.lastPick.y, 0), r.avatar.color, 6);
          rivalCollected[i] = rs.collected;
        }
      });
      states.forEach((st, i) => {
        if (!st) (rivUfos[i] as Ufo).g.visible = false;
      });
    },
    dispose() {
      camera.up.set(0, 1, 0);
    },
  };
};
