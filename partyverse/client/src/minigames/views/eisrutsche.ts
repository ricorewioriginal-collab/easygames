import * as THREE from 'three';
import type { EisState } from '@shared/minigames/games/eisrutsche';
import {
  ARENA_X,
  ARENA_Y,
  CRACK_WARN,
  DURATION_TICKS,
  game,
  holeCracking,
  holeOpen,
  holePos,
} from '@shared/minigames/games/eisrutsche';
import { disposeTree, glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';
import { makeMe, makeRivals, updateRivals } from './rivals';

const scoreOf = (s: EisState): number => game.score(s);

function starGeometry(outer: number, inner: number, depth: number): THREE.ExtrudeGeometry {
  const sh = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? outer : inner;
    if (i === 0) sh.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else sh.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 1,
  });
  g.translate(0, 0, -depth / 2);
  return g;
}

/** Schwimmende Eisscholle im Polarmeer: ein Pinguin rutscht nach Sternen, Wasserlöcher lauern. */
export const createView: MiniGameViewFactory<EisState> = (ctx, initial) => {
  const { root, camera, scene } = ctx;
  scene.background = new THREE.Color(0xa9dcff);
  scene.fog = new THREE.Fog(0xa9dcff, 28, 70);

  // --- Meer, Scholle, Schneewall --------------------------------------------
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(160, 120), toon(0x2b8fd8));
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -1.6;
  root.add(sea);
  const wavesGeo = new THREE.RingGeometry(0.9, 1.0, 40);
  const waves: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    const w = new THREE.Mesh(wavesGeo, glow(0xffffff, 0.35));
    w.rotation.x = -Math.PI / 2;
    w.position.set(
      -ARENA_X - 3 + (i % 3) * (ARENA_X + 3),
      -1.55,
      -ARENA_Y - 2.5 + Math.floor(i / 3) * (ARENA_Y * 2 + 5),
    );
    root.add(w);
    waves.push(w);
  }
  const floeBase = new THREE.Mesh(
    new THREE.BoxGeometry(ARENA_X * 2 + 1.2, 2.2, ARENA_Y * 2 + 1.2),
    toon(0x8ed3f0),
  );
  floeBase.position.y = -1.15;
  root.add(floeBase);
  const ice = new THREE.Mesh(new THREE.BoxGeometry(ARENA_X * 2, 0.3, ARENA_Y * 2), toon(0xdaf7ff));
  ice.position.y = -0.15;
  root.add(ice);
  // Eis-Glanzstreifen
  for (let i = 0; i < 7; i++) {
    const st = new THREE.Mesh(
      new THREE.PlaneGeometry(0.35 + (i % 3) * 0.2, 5 + (i % 4)),
      glow(0xffffff, 0.35),
    );
    st.rotation.x = -Math.PI / 2;
    st.rotation.z = 0.7;
    st.position.set(-ARENA_X + 2 + i * 2.4, 0.01, ((i * 5) % 7) - 3);
    root.add(st);
  }
  const bankMat = toon(0xffffff);
  const banks: Array<[number, number, number, number]> = [
    [ARENA_X * 2 + 1.2, 0.6, 0, -ARENA_Y - 0.3],
    [ARENA_X * 2 + 1.2, 0.6, 0, ARENA_Y + 0.3],
    [0.6, ARENA_Y * 2, -ARENA_X - 0.3, 0],
    [0.6, ARENA_Y * 2, ARENA_X + 0.3, 0],
  ];
  for (const [w, d, x, z] of banks) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.55, d), bankMat);
    b.position.set(x, 0.15, z);
    root.add(b);
  }
  for (let i = 0; i < 26; i++) {
    const side = i % 4;
    const k = Math.floor(i / 4);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.34 + (i % 3) * 0.08, 10, 8), bankMat);
    const x = side < 2 ? -ARENA_X + 0.6 + k * 2.6 : side === 2 ? -ARENA_X - 0.3 : ARENA_X + 0.3;
    const z = side < 2 ? (side === 0 ? -ARENA_Y - 0.3 : ARENA_Y + 0.3) : -ARENA_Y + 0.6 + k * 1.9;
    b.position.set(x, 0.5, z);
    root.add(b);
  }
  // Berge in der Ferne
  const mountainMat = [toon(0xe9f6ff), toon(0xc6e3ff), toon(0xd8efff)];
  for (let i = 0; i < 7; i++) {
    const h = 6 + (i % 3) * 2.5;
    const m = new THREE.Mesh(new THREE.ConeGeometry(4 + (i % 2) * 1.5, h, 6), mountainMat[i % 3]!);
    m.position.set(-24 + i * 8, h / 2 - 2, -26 - (i % 2) * 5);
    root.add(m);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(1.8 + (i % 2) * 0.6, h * 0.28, 6), toon(0xffffff));
    cap.position.set(m.position.x, h - 2 - h * 0.14, m.position.z);
    root.add(cap);
  }
  // Schneefall
  const SNOW = 110;
  const snowPos = new Float32Array(SNOW * 3);
  for (let i = 0; i < SNOW; i++) {
    snowPos[i * 3] = ((i * 53) % 40) - 20;
    snowPos[i * 3 + 1] = (i * 7) % 14;
    snowPos[i * 3 + 2] = ((i * 31) % 26) - 14;
  }
  const snowGeo = new THREE.BufferGeometry();
  snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
  const snow = new THREE.Points(
    snowGeo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 3, sizeAttenuation: false, fog: false }),
  );
  root.add(snow);

  // --- Löcher -----------------------------------------------------------------
  interface HoleView {
    group: THREE.Group;
    ripples: THREE.Mesh[];
    /** eigentliches Loch (erst sichtbar, wenn es offen ist) */
    open: THREE.Group;
    /** Risse im Eis vor dem Aufbrechen */
    crack: THREE.Group;
    crackMat: THREE.MeshBasicMaterial;
    opened: boolean;
  }
  const crackLine = new THREE.BoxGeometry(1, 0.02, 0.07);
  const holeViews: HoleView[] = initial.holes.map((h, hi) => {
    const group = new THREE.Group();
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(h.r + 0.18, h.r + 0.18, 0.12, 28), toon(0xb6e8ff));
    rim.position.y = 0.0;
    const water = new THREE.Mesh(new THREE.CircleGeometry(h.r, 28), toon(0x1b6fc4));
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.07;
    const deep = new THREE.Mesh(new THREE.CircleGeometry(h.r * 0.62, 24), toon(0x0f4a94));
    deep.rotation.x = -Math.PI / 2;
    deep.position.y = 0.08;
    group.add(rim, water, deep);
    const ripples: THREE.Mesh[] = [];
    for (let k = 0; k < 2; k++) {
      const rp = new THREE.Mesh(new THREE.RingGeometry(0.92, 1.0, 28), glow(0xffffff, 0.5));
      rp.rotation.x = -Math.PI / 2;
      rp.position.y = 0.1;
      group.add(rp);
      ripples.push(rp);
    }
    // Eissplitter am Rand
    const chips = Math.round(h.r * 9);
    for (let k = 0; k < chips; k++) {
      const a = (k / chips) * Math.PI * 2 + hi;
      const c = new THREE.Mesh(
        new THREE.ConeGeometry(0.12 + (k % 3) * 0.04, 0.3 + (k % 2) * 0.12, 4),
        toon(0xf4fdff),
      );
      c.position.set(Math.cos(a) * (h.r + 0.1), 0.2, Math.sin(a) * (h.r + 0.1));
      c.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
      group.add(c);
    }
    if (h.ax !== 0 || h.ay !== 0) {
      // bewegliche Löcher: Strudel-Markierung
      const sw = new THREE.Mesh(
        new THREE.TorusGeometry(h.r * 0.45, 0.05, 6, 20, Math.PI * 1.5),
        glow(0xbfe6ff, 0.8),
      );
      sw.rotation.x = -Math.PI / 2;
      sw.position.y = 0.12;
      group.add(sw);
      ripples.push(sw);
    }
    // Lochteile in eine eigene Gruppe, daneben die Risse für das Aufbrechen
    const open = new THREE.Group();
    open.add(...group.children);
    group.add(open);
    const crack = new THREE.Group();
    const crackMat = glow(0xff4d5e, 0.85);
    const lines = 9;
    for (let k = 0; k < lines; k++) {
      const a = (k / lines) * Math.PI * 2 + hi * 0.7;
      const len = h.r * (0.7 + ((k * 37) % 5) * 0.12);
      const l = new THREE.Mesh(crackLine, crackMat);
      l.scale.x = len;
      l.position.set(Math.cos(a) * len * 0.5, 0.03, Math.sin(a) * len * 0.5);
      l.rotation.y = -a;
      crack.add(l);
    }
    const warnRing = new THREE.Mesh(new THREE.RingGeometry(h.r * 0.95, h.r * 1.08, 32), crackMat);
    warnRing.rotation.x = -Math.PI / 2;
    warnRing.position.y = 0.03;
    crack.add(warnRing);
    group.add(crack);
    root.add(group);
    return { group, ripples, open, crack, crackMat, opened: h.t0 === 0 };
  });

  // --- Eigene Figur (statt Pinguin) und Mitspieler ------------------------------
  const me = makeMe(ctx, 0.95);
  const peng = me.group;
  const rivals = makeRivals(ctx, 0.85);
  const rivalSeen = rivals.map(() => ({ falls: 0, stars: 0 }));
  let rivalBest = 0;

  // --- Sterne -------------------------------------------------------------------
  const starGeo = starGeometry(0.62, 0.3, 0.2);
  interface StarView {
    group: THREE.Group;
    spin: THREE.Group;
    halo: THREE.Mesh;
    born: number;
  }
  const starViews = new Map<number, StarView>();
  function makeStar(golden: boolean): StarView {
    const group = new THREE.Group();
    const spin = new THREE.Group();
    const col = golden ? 0xffb21f : 0xffe96a;
    const tilt = new THREE.Group();
    tilt.rotation.x = -0.95;
    tilt.add(
      new THREE.Mesh(starGeo, toon(col, { emissive: golden ? 0xff7a00 : 0xffc400, emissiveIntensity: 0.55 })),
    );
    spin.add(tilt);
    const halo = new THREE.Mesh(
      new THREE.CircleGeometry(golden ? 0.95 : 0.7, 20),
      glow(golden ? 0xffd05a : 0xfff2a0, 0.3),
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = -0.55;
    group.add(spin, halo);
    group.scale.setScalar(golden ? 1.45 : 1);
    root.add(group);
    return { group, spin, halo, born: -1 };
  }

  const popups: Array<{ sp: THREE.Sprite; t: number }> = [];
  function popup(text: string, x: number, y: number, color: string): void {
    const sp = textSprite(text, { color, size: 72, width: text.length > 5 ? 2.2 : 1.5 });
    sp.position.set(x, 1.9, -y);
    root.add(sp);
    popups.push({ sp, t: 0 });
  }

  let t = 0;
  let lastStars = initial.starCount;
  let lastFalls = initial.falls;
  let lastBumps = initial.bumps;
  let trail = 0;
  let shake = 0;
  let wasRespawn = 0;
  let pop = 1;
  const v3 = new THREE.Vector3();
  const camT = new THREE.Vector3();

  return {
    update(s, dt) {
      t += dt;
      waves.forEach((w, i) => {
        const k = (t * 0.25 + i * 0.37) % 1;
        w.scale.setScalar(1 + k * 3);
        (w.material as THREE.MeshBasicMaterial).opacity = 0.35 * (1 - k);
      });
      const a = snowGeo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < SNOW; i++) {
        let y = a.getY(i) - dt * (0.9 + (i % 5) * 0.2);
        if (y < -1) y += 14;
        a.setY(i, y);
        a.setX(i, a.getX(i) + Math.sin(t + i) * dt * 0.3);
      }
      a.needsUpdate = true;

      // Löcher folgen ihrer Bahn
      s.holes.forEach((h, i) => {
        const hv = holeViews[i]!;
        const p = holePos(h, s.tick);
        hv.group.position.set(p.x, 0.0, -p.y);
        const isOpen = holeOpen(h, s.tick);
        const cracking = holeCracking(h, s.tick);
        hv.group.visible = isOpen || cracking;
        hv.open.visible = isOpen;
        hv.crack.visible = cracking;
        if (cracking) {
          const k = 1 - (h.t0 - s.tick) / CRACK_WARN;
          hv.crack.scale.setScalar(0.4 + 0.6 * k);
          hv.crackMat.opacity = 0.45 + 0.45 * Math.abs(Math.sin(t * (6 + k * 14)));
        }
        if (isOpen && !hv.opened) {
          hv.opened = true;
          ctx.sfx('hit');
          ctx.burst(v3.set(p.x, 0.4, -p.y), 0xbfe6ff, 26);
          shake = Math.max(shake, 0.3);
        }
        if (isOpen) hv.open.scale.setScalar(Math.min(1, (s.tick - h.t0) / 20 + 0.2));
        hv.ripples.forEach((r, k) => {
          if (k < 2) {
            const q = (t * 0.5 + k * 0.5 + i * 0.13) % 1;
            r.scale.setScalar(h.r * (0.35 + q * 0.62));
            (r.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - q);
          } else r.rotation.z = t * 2;
        });
      });

      // Eigene Figur
      const speed = Math.hypot(s.vx, s.vy);
      const hidden = s.respawn > 45;
      if (wasRespawn > 45 && s.respawn <= 45) {
        pop = 0;
        ctx.sfx('jump');
        ctx.burst(v3.set(0, 0.3, 0), 0xbfe6ff, 14);
        me.rig.play('jump');
      }
      wasRespawn = s.respawn;
      pop = Math.min(1, pop + dt * 3);
      const popK = pop < 1 ? 1 + Math.sin(pop * Math.PI) * 0.4 : 1;
      peng.visible = !hidden;
      peng.scale.setScalar(Math.min(1, pop * 1.4) * popK);
      peng.position.set(s.x, 0.05, -s.y);
      me.rig.faceTowards(Math.atan2(Math.cos(s.face), -Math.sin(s.face)));
      if (s.tick >= DURATION_TICKS)
        me.rig.play(scoreOf(s) >= rivalBest ? 'celebrate' : 'lose', { loop: true });
      else if (s.respawn > 0) me.rig.play('idle', { loop: true });
      else if (s.braking && speed > 1) me.rig.play('walk', { loop: true, speed: 0.5 });
      else if (speed > 1.2 && me.rig.current !== 'jump')
        me.rig.play('run', { loop: true, speed: 0.5 + speed * 0.08 });
      else if (speed <= 1.2 && me.rig.current !== 'jump') me.rig.play('idle', { loop: true });
      // auf dem Eis leicht schräg in Fahrtrichtung
      peng.rotation.x = Math.min(0.3, speed * 0.03);
      me.rig.update(dt);
      if (!hidden && (speed > 4.5 || s.braking) && speed > 1.5) {
        trail -= dt;
        if (trail <= 0) {
          trail = s.braking ? 0.04 : 0.09;
          ctx.burst(v3.set(s.x, 0.15, -s.y), 0xffffff, s.braking ? 3 : 1);
        }
      }

      // Sterne
      const alive = new Set<number>();
      for (const st of s.stars) {
        alive.add(st.id);
        let v = starViews.get(st.id);
        if (!v) {
          v = makeStar(st.value > 1);
          v.group.position.set(st.x, 0.9, -st.y);
          starViews.set(st.id, v);
        }
        if (v.born < 0) v.born = t;
        const k = Math.min(1, (t - v.born) / 0.4);
        const base = st.value > 1 ? 1.45 : 1;
        v.group.scale.setScalar(base * (k < 1 ? k * (1 + Math.sin(k * Math.PI) * 0.4) : 1));
        v.group.visible = true;
        v.group.position.y = 0.95 + Math.sin(t * 2.5 + st.id) * 0.14;
        v.spin.rotation.y = Math.sin(t * 1.8 + st.id) * 0.7;
        v.halo.position.y = -0.85 - Math.sin(t * 2.5 + st.id) * 0.14;
        (v.halo.material as THREE.MeshBasicMaterial).opacity = 0.26 + Math.sin(t * 4 + st.id) * 0.08;
      }
      for (const [id, v] of starViews) {
        if (!alive.has(id)) {
          disposeTree(v.group);
          starViews.delete(id);
        }
      }

      // Ereignisse
      if (s.starCount !== lastStars) {
        lastStars = s.starCount;
        const gold = s.lastPick.value > 1;
        ctx.burst(v3.set(s.lastPick.x, 0.9, -s.lastPick.y), gold ? 0xffa21f : 0xffe96a, gold ? 30 : 16);
        ctx.sfx(gold ? 'win' : 'coin');
        popup(
          `+${s.lastGain}${s.streak > 1 ? ` ×${s.streak}` : ''}`,
          s.lastPick.x,
          s.lastPick.y,
          gold ? '#ff9a1f' : '#ffd23f',
        );
        if (s.streak > 0 && s.streak % 5 === 0) me.rig.play('cheer');
      }
      if (s.falls !== lastFalls) {
        lastFalls = s.falls;
        ctx.burst(v3.set(s.lastFall.x, 0.4, -s.lastFall.y), 0x4fb4ff, 34);
        ctx.burst(v3.set(s.lastFall.x, 0.6, -s.lastFall.y), 0xffffff, 12);
        ctx.sfx('bad');
        popup('-80', s.lastFall.x, s.lastFall.y, '#ff5a6a');
        shake = 0.35;
      }
      if (s.bumps !== lastBumps) {
        lastBumps = s.bumps;
        ctx.burst(v3.set(s.x, 0.4, -s.y), 0xffffff, 8);
        ctx.sfx('hit');
      }
      for (let i = popups.length - 1; i >= 0; i--) {
        const p = popups[i]!;
        p.t += dt;
        p.sp.position.y = 1.9 + p.t * 1.5;
        p.sp.material.opacity = Math.max(0, 1 - p.t / 0.9);
        if (p.t > 0.9) {
          p.sp.removeFromParent();
          p.sp.material.map?.dispose();
          p.sp.material.dispose();
          popups.splice(i, 1);
        }
      }

      // Kamera
      const aspect = camera.aspect;
      const portrait = aspect < 1;
      const elev = portrait ? 1.2 : 1.0;
      const needW = (ARENA_X + 1.4) / (0.466 * aspect);
      const needH = (ARENA_Y * Math.sin(elev) + 1.1) / 0.466;
      // Hochformat: näher heran und der Figur folgen, sonst wäre alles winzig
      const R = portrait ? Math.max(needW * 0.55, 13) : Math.max(needW * 1.06, needH * 1.14, 13);
      shake = Math.max(0, shake - dt);
      const fx = portrait ? THREE.MathUtils.clamp(s.x * 0.8, -ARENA_X + 3.6, ARENA_X - 3.6) : 0;
      const fz = portrait ? THREE.MathUtils.clamp(-s.y * 0.6, -ARENA_Y + 2, ARENA_Y - 2) : 0;
      const k = Math.min(1, dt * 4);
      camT.set(camT.x + (fx - camT.x) * k, 0, camT.z + (fz + 0.6 - camT.z) * k);
      camera.position.set(
        camT.x + Math.sin(t * 90) * shake * 0.3,
        R * Math.sin(elev),
        camT.z + R * Math.cos(elev),
      );
      camera.lookAt(camT);
    },
    ghosts(states, dt) {
      updateRivals(rivals, states, dt, (r, st, i) => {
        r.group.visible = st.respawn <= 45;
        r.group.position.set(st.x, 0.05, -st.y);
        r.rig.faceTowards(Math.atan2(Math.cos(st.face), -Math.sin(st.face)));
        rivalBest = Math.max(rivalBest, scoreOf(st));
        const seen = rivalSeen[i] as { falls: number; stars: number };
        if (st.falls !== seen.falls) {
          seen.falls = st.falls;
          ctx.burst(v3.set(st.lastFall.x, 0.4, -st.lastFall.y), 0x4fb4ff, 10);
        }
        const sp = Math.hypot(st.vx, st.vy);
        if (sp > 1.2) r.rig.play('run', { loop: true, speed: 0.5 + sp * 0.08 });
        else r.rig.play('idle', { loop: true });
      });
    },
    dispose() {
      scene.fog = null;
    },
  };
};
