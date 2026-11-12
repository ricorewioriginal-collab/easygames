import * as THREE from 'three';
import type { KristallState } from '@shared/minigames/games/kristallsammler';
import {
  ARENA_X,
  ARENA_Y,
  BOMB_ARM_TICKS,
  DURATION_TICKS,
  RUSH_TICKS,
} from '@shared/minigames/games/kristallsammler';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';
import { makeMe, makeRivals, updateRivals } from './rivals';

const CRYSTAL_COLORS: Record<number, number> = { 1: 0x4cc9ff, 3: 0x3dff9a, 5: 0xffc933 };

interface ItemView {
  group: THREE.Group;
  core: THREE.Object3D;
  halo: THREE.Mesh;
  spawnT: number;
  extra?: THREE.Object3D;
}

/** Schwebende Kristallinsel: die eigene Figur läuft über bunte Fliesen, Mitspieler halbdurchsichtig daneben, Kristalle schweben und funkeln, Bomben pulsieren. */
export const createView: MiniGameViewFactory<KristallState> = (ctx, initial) => {
  const { root, camera, scene } = ctx;
  scene.background = new THREE.Color(0x2a2a74);
  scene.fog = new THREE.Fog(0x2a2a74, 30, 80);

  // --- Insel -----------------------------------------------------------
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(ARENA_X * 2 + 0.8, 1.6, ARENA_Y * 2 + 0.8),
    toon(0x3b2f8f),
  );
  base.position.y = -1;
  root.add(base);
  const under = new THREE.Mesh(new THREE.ConeGeometry(6.2, 5, 7), toon(0x5a3d9a));
  under.rotation.x = Math.PI;
  under.position.y = -4.3;
  root.add(under);
  const cols = Math.round(ARENA_X * 2);
  const rows = Math.round(ARENA_Y * 2);
  const tiles = new THREE.InstancedMesh(new THREE.BoxGeometry(0.96, 0.2, 0.96), toon(0xffffff), cols * rows);
  const m4 = new THREE.Matrix4();
  const c4 = new THREE.Color();
  let ti = 0;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      m4.makeTranslation(-ARENA_X + 0.5 + i, -0.1, -ARENA_Y + 0.5 + j);
      tiles.setMatrixAt(ti, m4);
      c4.setHex((i + j) % 2 === 0 ? 0x8f7cff : 0xa99bff);
      tiles.setColorAt(ti, c4);
      ti++;
    }
  }
  root.add(tiles);
  const rimMat = toon(0xffd23f);
  for (const [w, d, x, z] of [
    [ARENA_X * 2 + 0.8, 0.4, 0, -ARENA_Y - 0.2],
    [ARENA_X * 2 + 0.8, 0.4, 0, ARENA_Y + 0.2],
    [0.4, ARENA_Y * 2, -ARENA_X - 0.2, 0],
    [0.4, ARENA_Y * 2, ARENA_X + 0.2, 0],
  ] as const) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(w, 0.35, d), rimMat);
    r.position.set(x, 0.0, z);
    root.add(r);
  }
  const lamps: THREE.Mesh[] = [];
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.5, 8), toon(0xffffff));
      post.position.set(sx * (ARENA_X + 0.2), 0.7, sz * (ARENA_Y + 0.2));
      root.add(post);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10), glow(0xfff2a8));
      lamp.position.set(post.position.x, 1.6, post.position.z);
      root.add(lamp);
      lamps.push(lamp);
    }
  }
  // Schwebende Felsbrocken und Sterne im Hintergrund
  const rockMat = [toon(0x6a4fc8), toon(0x4f7bd9), toon(0xb25fd6)];
  const rocks: THREE.Mesh[] = [];
  for (let i = 0; i < 9; i++) {
    const rk = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8 + (i % 3) * 0.5, 0), rockMat[i % 3]!);
    const a = (i / 9) * Math.PI * 2 + 0.4;
    rk.position.set(
      Math.cos(a) * (13 + (i % 4) * 2.5),
      -2 + (i % 5) * 1.8,
      Math.sin(a) * (10 + (i % 3) * 3) - 4,
    );
    root.add(rk);
    rocks.push(rk);
  }
  const starGeo = new THREE.BufferGeometry();
  const sp: number[] = [];
  for (let i = 0; i < 140; i++) {
    const a = i * 2.399;
    const rr = 30 + (i % 17) * 3;
    sp.push(Math.cos(a) * rr, 8 + ((i * 37) % 31), Math.sin(a) * rr - 20);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const starPts = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.35, sizeAttenuation: true, fog: false }),
  );
  root.add(starPts);

  // --- Spielfigur (gewählte Figur) und Mitspieler ---------------------------
  const me = makeMe(ctx, 0.9);
  const hero = me.group;
  const rivals = makeRivals(ctx, 0.8);
  const rivalStun = rivals.map(() => 0);
  // Betäubungssterne
  const dizzy: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new THREE.Mesh(new THREE.OctahedronGeometry(0.14), glow(0xfff06a));
    d.visible = false;
    hero.add(d);
    dizzy.push(d);
  }
  // Ausdauerleiste
  const barBg = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.16), glow(0x1b1030, 0.7));
  const barFg = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.16), glow(0x7dff6a));
  barFg.position.z = 0.005;
  const bar = new THREE.Group();
  bar.add(barBg, barFg);
  bar.visible = false;
  root.add(bar);

  // --- Kristalle und Bomben --------------------------------------------
  const crystalGeo = new THREE.OctahedronGeometry(0.5, 0);
  const spikeGeo = new THREE.ConeGeometry(0.1, 0.32, 6);
  const itemViews = new Map<number, ItemView>();
  function makeItem(c: KristallState['items'][number]): ItemView {
    const group = new THREE.Group();
    let core: THREE.Object3D;
    let halo: THREE.Mesh;
    let extra: THREE.Object3D | undefined;
    if (c.kind === 'crystal') {
      const col = CRYSTAL_COLORS[c.value] ?? 0x4cc9ff;
      const m = new THREE.Mesh(crystalGeo, toon(col, { emissive: col, emissiveIntensity: 0.35 }));
      const sc = c.value === 5 ? 1.5 : c.value === 3 ? 1.25 : 1.15;
      m.scale.set(0.7 * sc, 1.1 * sc, 0.7 * sc);
      core = m;
      halo = new THREE.Mesh(new THREE.SphereGeometry(0.75 * sc, 12, 8), glow(col, 0.12));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62 * sc, 0.03, 6, 24), glow(0xffffff, 0.5));
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.55 * sc;
      group.add(ring);
      extra = ring;
    } else {
      const g = new THREE.Group();
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 12), toon(0x1c1a2a));
      g.add(sphere);
      const dirs: Array<[number, number, number]> = [
        [1, 0, 0],
        [-1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
        [0, 0, -1],
        [0.7, 0.7, 0],
        [-0.7, 0.7, 0],
      ];
      for (const [dx, dy, dz] of dirs) {
        const sp2 = new THREE.Mesh(spikeGeo, toon(0xff3d5a, { emissive: 0xff1a3c, emissiveIntensity: 0.6 }));
        const v = new THREE.Vector3(dx, dy, dz).normalize();
        sp2.position.copy(v.clone().multiplyScalar(0.5));
        sp2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v);
        g.add(sp2);
      }
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), glow(0xff3d5a));
      eye.position.set(0, 0.05, 0.4);
      g.add(eye);
      core = g;
      halo = new THREE.Mesh(new THREE.SphereGeometry(0.9, 14, 10), glow(0xff2d55, 0.18));
      const warn = new THREE.Mesh(new THREE.RingGeometry(0.8, 0.95, 24), glow(0xff2d55, 0.65));
      warn.rotation.x = -Math.PI / 2;
      warn.position.y = -0.55;
      group.add(warn);
      extra = warn;
    }
    group.add(core, halo);
    group.position.set(c.x, 0.9, -c.y);
    group.visible = false;
    root.add(group);
    return { group, core, halo, spawnT: 0, extra };
  }

  // --- Effekte -------------------------------------------------------------
  const popups: Array<{ sp: THREE.Sprite; t: number; y0: number }> = [];
  function popup(text: string, x: number, y: number, color: string, w = 1.3, h = 1.8): void {
    const sp = textSprite(text, { color, size: 72, width: w });
    sp.position.set(x, h, -y);
    root.add(sp);
    popups.push({ sp, t: 0, y0: h });
  }

  let t = 0;
  let lastPick = initial.pickups;
  let lastHit = initial.bombHits;
  let shake = 0;
  let trail = 0;
  let pickPop = 0;
  let rivalBest = 0;
  let rush = false;
  const rushTint = new THREE.Color(0xffd23f);
  const camTarget = new THREE.Vector3();
  const tmp = new THREE.Vector3();

  return {
    update(s, dt) {
      t += dt;
      // Lampen, Felsen, Sterne
      lamps.forEach((l, i) => l.scale.setScalar(1 + Math.sin(t * 3 + i) * 0.12));
      rocks.forEach((r, i) => {
        r.rotation.x += dt * 0.2;
        r.rotation.y += dt * 0.3;
        r.position.y += Math.sin(t * 0.8 + i) * dt * 0.3;
      });
      starPts.rotation.y += dt * 0.01;

      // Spielfigur
      const speed = Math.hypot(s.vx, s.vy);
      const stunned = s.stun > 0;
      hero.position.set(s.x, 0, -s.y);
      const targetRot = Math.atan2(Math.cos(s.face), -Math.sin(s.face));
      me.rig.faceTowards(targetRot);
      if (s.tick >= DURATION_TICKS) me.rig.play(s.points >= rivalBest ? 'celebrate' : 'lose', { loop: true });
      else if (stunned) {
        if (me.rig.current !== 'shock') me.rig.play('shock');
      } else if (speed > 0.6)
        me.rig.play(s.sprinting || speed > 5.2 ? 'run' : 'walk', {
          loop: true,
          speed: s.sprinting ? 1.4 : 1,
        });
      else me.rig.play('idle', { loop: true });
      me.rig.update(dt);
      hero.scale.setScalar(1 + pickPop * 0.18);
      pickPop = Math.max(0, pickPop - dt * 4);
      dizzy.forEach((d, i) => {
        d.visible = stunned;
        const a = t * 7 + (i * Math.PI * 2) / 3;
        d.position.set(Math.cos(a) * 0.5, 1.75, Math.sin(a) * 0.5);
        d.rotation.y = a;
      });
      // Sprint-Staub
      if (s.sprinting) {
        trail -= dt;
        if (trail <= 0) {
          trail = 0.07;
          ctx.burst(tmp.set(s.x, 0.15, -s.y), 0xffffff, 2);
        }
      }
      // Ausdauerleiste (zur Kamera gedreht)
      bar.visible = s.stamina < 0.995 || s.exhausted;
      bar.position.set(s.x, 2.3, -s.y);
      bar.quaternion.copy(camera.quaternion);
      barFg.scale.x = Math.max(0.001, s.stamina);
      barFg.position.x = -0.55 * (1 - s.stamina);
      (barFg.material as THREE.MeshBasicMaterial).color.setHex(
        s.exhausted ? 0xff5a5a : s.stamina < 0.35 ? 0xffc933 : 0x7dff6a,
      );

      // Kristalle und Bomben
      for (const c of s.items) {
        if (c.t0 > s.tick + 10) break;
        let v = itemViews.get(c.id);
        const active = !c.taken && s.tick >= c.t0 && s.tick < c.t1;
        if (!active) {
          if (v) v.group.visible = false;
          continue;
        }
        if (!v) {
          v = makeItem(c);
          v.spawnT = t;
          itemViews.set(c.id, v);
        }
        const age = t - v.spawnT;
        const pop = Math.min(1, age / 0.28);
        const overshoot = pop < 1 ? 1 + Math.sin(pop * Math.PI) * 0.35 : 1;
        const left = c.t1 - s.tick;
        const blink = left < 70 && Math.floor(t * 12) % 2 === 0 ? 0.55 : 1;
        v.group.visible = true;
        if (c.kind === 'crystal') {
          v.group.position.y = 0.95 + Math.sin(t * 2.4 + c.id) * 0.12;
          v.core.rotation.y = t * 1.6 + c.id;
          v.group.scale.setScalar(pop * overshoot * blink);
          v.halo.scale.setScalar(1 + Math.sin(t * 5 + c.id) * 0.1);
          if (v.extra) v.extra.scale.setScalar(1 + Math.sin(t * 3 + c.id) * 0.15);
        } else {
          v.group.position.x = c.x;
          v.group.position.z = -c.y;
          if (c.vx || c.vy) {
            v.core.rotation.x = -c.y * 2.2;
            v.core.rotation.z = c.x * 2.2;
          }
          const armed = s.tick >= c.t0 + BOMB_ARM_TICKS;
          const pulse = armed ? 1 + Math.sin(t * 9 + c.id) * 0.1 : 0.75;
          v.group.position.y = 0.75 + Math.abs(Math.sin(t * 3 + c.id)) * 0.1;
          v.group.scale.setScalar(pop * overshoot * pulse * blink);
          if (!c.vx && !c.vy) {
            v.core.rotation.y = t * 0.9;
            v.core.rotation.z = Math.sin(t * 4 + c.id) * 0.2;
          }
          (v.halo.material as THREE.MeshBasicMaterial).opacity = armed ? 0.14 + Math.sin(t * 9) * 0.07 : 0.05;
          if (v.extra) {
            v.extra.scale.setScalar(armed ? 1 + Math.sin(t * 9 + c.id) * 0.12 : 0.6);
            ((v.extra as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = armed ? 0.7 : 0.25;
          }
        }
      }

      // Ereignisse
      if (s.pickups !== lastPick) {
        lastPick = s.pickups;
        const col = CRYSTAL_COLORS[s.lastPick.value] ?? 0xffffff;
        ctx.burst(new THREE.Vector3(s.lastPick.x, 1, -s.lastPick.y), col, 8 + s.lastPick.value * 3);
        ctx.sfx(s.lastPick.value >= 5 ? 'win' : s.lastPick.value >= 3 ? 'good' : 'coin');
        popup(
          `+${s.lastPick.value}${s.combo >= 2 ? ` ×${s.combo}` : ''}`,
          s.lastPick.x,
          s.lastPick.y,
          s.lastPick.value >= 8 ? '#ffd23f' : s.lastPick.value >= 3 ? '#6dffb0' : '#8fe0ff',
          s.combo >= 2 ? 1.8 : 1.3,
        );
        pickPop = 1;
      }
      if (s.bombHits !== lastHit) {
        lastHit = s.bombHits;
        ctx.burst(new THREE.Vector3(s.lastHit.x, 0.8, -s.lastHit.y), 0xff3d5a, 32);
        ctx.burst(new THREE.Vector3(s.lastHit.x, 0.8, -s.lastHit.y), 0xffd23f, 16);
        ctx.sfx('hit');
        ctx.sfx('bad');
        popup('-4', s.x, s.y, '#ff6a7a');
        me.rig.play('shock');
        shake = 0.45;
      }
      for (let i = popups.length - 1; i >= 0; i--) {
        const p = popups[i]!;
        p.t += dt;
        p.sp.position.y = p.y0 + p.t * 1.6;
        p.sp.material.opacity = Math.max(0, 1 - p.t / 0.9);
        if (p.t > 0.9) {
          p.sp.removeFromParent();
          p.sp.material.map?.dispose();
          p.sp.material.dispose();
          popups.splice(i, 1);
        }
      }

      // Goldrausch: Fliesen golden, Banner
      if (!rush && s.tick >= RUSH_TICKS) {
        rush = true;
        ctx.sfx('win');
        popup('GOLDRAUSCH ×2', 0, -ARENA_Y * 0.1, '#ffd23f', 6, 2.6);
        for (let i = 0; i < cols * rows; i++) {
          tiles.getColorAt(i, c4);
          tiles.setColorAt(i, c4.lerp(rushTint, 0.55));
        }
        if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true;
        shake = 0.3;
      }

      // Kamera: schräg von vorn, folgt dem Spieler ein Stück
      const aspect = camera.aspect;
      const portrait = aspect < 1;
      const elev = portrait ? 1.15 : 0.98;
      const needW = (ARENA_X + 1.2) / (0.466 * aspect);
      const needH = (ARENA_Y * Math.sin(elev) + 1.0) / 0.466;
      // Hochformat: näher heran und dem Spieler folgen, sonst wäre alles winzig
      const R = portrait ? Math.max(needW * 0.6, 13) : Math.max(needW * 1.08, needH * 1.14, 13);
      shake = Math.max(0, shake - dt);
      const follow = portrait ? 0.7 : 0.2;
      camTarget.set(
        THREE.MathUtils.clamp(s.x * follow, -ARENA_X + 3.2, ARENA_X - 3.2),
        0,
        -s.y * follow + 0.9,
      );
      camera.position.set(
        camTarget.x + Math.sin(t * 90) * shake * 0.25,
        R * Math.sin(elev) + Math.cos(t * 83) * shake * 0.2,
        camTarget.z + R * Math.cos(elev),
      );
      camera.lookAt(camTarget);
    },
    ghosts(states, dt) {
      updateRivals(rivals, states, dt, (r, st, i) => {
        r.group.position.set(st.x, 0, -st.y);
        r.rig.faceTowards(Math.atan2(Math.cos(st.face), -Math.sin(st.face)));
        rivalBest = Math.max(rivalBest, st.points);
        const sp = Math.hypot(st.vx, st.vy);
        if (st.stun > 0) {
          if (rivalStun[i] === 0) r.rig.play('shock');
        } else if (sp > 0.6) r.rig.play(sp > 5.2 ? 'run' : 'walk', { loop: true });
        else if (r.rig.current === 'walk' || r.rig.current === 'run') r.rig.play('idle', { loop: true });
        rivalStun[i] = st.stun;
      });
    },
    dispose() {
      scene.fog = null;
    },
  };
};
