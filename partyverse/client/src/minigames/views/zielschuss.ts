import * as THREE from 'three';
import type { Target, TargetKind, ZielState } from '@shared/minigames/games/zielschuss';
import { MAG, X_MAX } from '@shared/minigames/games/zielschuss';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';

const SC = 4; // Spielfeld-Einheit -> Weltmeter
const wx = (x: number): number => x * SC;
const wy = (y: number): number => 4 + y * SC;

interface TV {
  g: THREE.Group;
  kind: TargetKind;
  inner: THREE.Group;
  spin: THREE.Object3D | null;
}

/** Schießbude: Zelt mit gestreiftem Vordach, drei Schienen, Pappziele (Enten, Raketen, Sterne) und schwarze Köder-Bomben. */
export const createView: MiniGameViewFactory<ZielState> = (ctx, initial) => {
  const { root, camera } = ctx;
  ctx.scene.background = new THREE.Color(0x2a1a5e);
  ctx.scene.fog = null;
  root.add(new THREE.HemisphereLight(0xffffff, 0x7a5aa8, 1.9));
  const key = new THREE.DirectionalLight(0xfff0d0, 1.4);
  key.position.set(-3, 8, 12);
  root.add(key);

  // Rückwand und Zeltstoff
  const back = new THREE.Mesh(new THREE.PlaneGeometry(90, 70), toon(0x3a2d78));
  back.position.set(0, 4, -4);
  root.add(back);
  for (let i = -14; i <= 14; i++) {
    if (i % 2 === 0) continue;
    const st = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 70), toon(0x4a3a96));
    st.position.set(i * 1.8, 4, -3.95);
    root.add(st);
  }
  // Schienen
  for (const y of [0.55, 0.05, -0.45]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(60, 0.12, 0.12), toon(0x6b4423));
    rail.position.set(0, wy(y) - 0.62, -0.25);
    root.add(rail);
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(60, 0.08, 0.5), toon(0x8a5a2b));
    shelf.position.set(0, wy(y) - 0.7, -0.35);
    root.add(shelf);
  }
  // Theke
  const counter = new THREE.Mesh(new THREE.BoxGeometry(60, 1.1, 1.2), toon(0xc0572e));
  counter.position.set(0, 0.2, 0.6);
  root.add(counter);
  const counterTop = new THREE.Mesh(new THREE.BoxGeometry(60, 0.18, 1.5), toon(0xffe0a0));
  counterTop.position.set(0, 0.84, 0.65);
  root.add(counterTop);
  const below = new THREE.Mesh(new THREE.PlaneGeometry(90, 40), toon(0x4b2a7a));
  below.position.set(0, -21, 0.2);
  root.add(below);
  // Vordach
  const awnY = 8.25;
  const awn = new THREE.Group();
  for (let i = -16; i <= 16; i++) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.0, 4, 1), toon(i % 2 === 0 ? 0xff4d6d : 0xffffff));
    m.rotation.z = Math.PI;
    m.rotation.y = Math.PI / 4;
    m.position.set(i * 1.27, 0, 0);
    m.scale.set(1.0, 1, 0.4);
    awn.add(m);
  }
  awn.position.set(0, awnY, 0.4);
  root.add(awn);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(60, 0.5, 0.5), toon(0xff4d6d));
  bar.position.set(0, awnY + 0.55, 0.4);
  root.add(bar);
  // Lichterkette
  const bulbMats = [0xffe36e, 0x7df9ff, 0xff7ad9].map((c) => new THREE.MeshBasicMaterial({ color: c }));
  for (let i = -15; i <= 15; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), bulbMats[(i + 15) % 3] as THREE.Material);
    b.position.set(i * 1.3, awnY - 0.75 - Math.abs(Math.sin(i * 0.9)) * 0.1, 0.55);
    root.add(b);
  }

  // Munition auf der Theke
  const bullets: THREE.Mesh[] = [];
  for (let i = 0; i < MAG; i++) {
    const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.34, 4, 8), toon(0xffd23f, { emissive: 0xffa800, emissiveIntensity: 0.5 }));
    b.position.set(-5.4 + i * 0.5, 1.2, 1.0);
    root.add(b);
    bullets.push(b);
  }

  // ---- Ziele ----
  const disc = (r: number, col: number, z = 0): THREE.Mesh => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.12, 28), toon(col));
    m.rotation.x = Math.PI / 2;
    m.position.z = z;
    return m;
  };
  const starShape = (R: number): THREE.Shape => {
    const sh = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 === 0 ? R : R * 0.45;
      if (i === 0) sh.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      else sh.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    sh.closePath();
    return sh;
  };
  const build = (kind: TargetKind, r: number): TV => {
    const g = new THREE.Group();
    const inner = new THREE.Group();
    g.add(inner);
    let spin: THREE.Object3D | null = null;
    const R = r * SC;
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6), toon(0x6b4423));
    stick.position.y = -R - 0.35;
    g.add(stick);
    if (kind === 'duck') {
      inner.add(disc(R, 0x3aa0ff));
      inner.add(disc(R * 0.8, 0xffffff, 0.04));
      const body = new THREE.Mesh(new THREE.SphereGeometry(R * 0.5, 16, 12), toon(0xffd23f));
      body.scale.set(1.15, 0.85, 0.5);
      body.position.set(0, -R * 0.1, 0.12);
      inner.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(R * 0.28, 12, 10), toon(0xffd23f));
      head.position.set(R * 0.35, R * 0.28, 0.14);
      inner.add(head);
      const beak = new THREE.Mesh(new THREE.ConeGeometry(R * 0.1, R * 0.28, 8), toon(0xff7a3c));
      beak.rotation.z = -Math.PI / 2;
      beak.position.set(R * 0.65, R * 0.25, 0.14);
      inner.add(beak);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(R * 0.05, 8, 6), new THREE.MeshBasicMaterial({ color: 0x1a1030 }));
      eye.position.set(R * 0.42, R * 0.34, 0.3);
      inner.add(eye);
    } else if (kind === 'fast') {
      inner.add(disc(R, 0xff8a3d));
      inner.add(disc(R * 0.7, 0xffffff, 0.04));
      for (let i = 0; i < 2; i++) {
        const c = new THREE.Mesh(new THREE.ConeGeometry(R * 0.32, R * 0.5, 3), toon(0xe0302b));
        c.rotation.z = -Math.PI / 2;
        c.position.set(-R * 0.18 + i * R * 0.34, 0, 0.12);
        inner.add(c);
      }
    } else if (kind === 'big') {
      inner.add(disc(R, 0x2fbf71));
      inner.add(disc(R * 0.72, 0xffffff, 0.03));
      inner.add(disc(R * 0.5, 0xe0302b, 0.06));
      inner.add(disc(R * 0.25, 0xffffff, 0.09));
    } else if (kind === 'pop') {
      inner.add(disc(R, 0xb04dff));
      inner.add(disc(R * 0.75, 0xffffff, 0.04));
      inner.add(disc(R * 0.45, 0xff4d8d, 0.08));
    } else if (kind === 'bonus') {
      const geo = new THREE.ExtrudeGeometry(starShape(R * 1.15), { depth: 0.14, bevelEnabled: false });
      const star = new THREE.Mesh(geo, toon(0xffd23f, { emissive: 0xffa800, emissiveIntensity: 0.9 }));
      star.position.z = -0.07;
      inner.add(star);
      const halo = new THREE.Mesh(new THREE.RingGeometry(R * 1.15, R * 1.3, 28), glow(0xfff6a8, 0.6));
      halo.position.z = 0.1;
      inner.add(halo);
      spin = halo;
    } else {
      const bomb = new THREE.Mesh(new THREE.SphereGeometry(R * 0.85, 20, 14), toon(0x1c1c28));
      inner.add(bomb);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.2, R * 0.25, R * 0.25, 10), toon(0x555566));
      cap.position.y = R * 0.85;
      inner.add(cap);
      const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, R * 0.45, 6), toon(0xc9a36b));
      fuse.position.set(R * 0.1, R * 1.15, 0);
      fuse.rotation.z = -0.4;
      inner.add(fuse);
      const spark = new THREE.Mesh(new THREE.OctahedronGeometry(R * 0.16), glow(0xffe36e));
      spark.position.set(R * 0.22, R * 1.4, 0);
      inner.add(spark);
      spin = spark;
      for (const rot of [Math.PI / 4, -Math.PI / 4]) {
        const x = new THREE.Mesh(new THREE.BoxGeometry(R * 1.0, R * 0.16, 0.06), glow(0xff3d3d));
        x.position.z = R * 0.86;
        x.rotation.z = rot;
        inner.add(x);
      }
      stick.visible = false;
    }
    root.add(g);
    g.visible = false;
    return { g, kind, inner, spin };
  };
  const pool = new Map<TargetKind, TV[]>();
  const live = new Map<number, TV>();
  interface Dying { tv: TV; t: number; hit: boolean; vx: number }
  const dying: Dying[] = [];
  const acquire = (t: Target): TV => {
    const arr = pool.get(t.kind) ?? [];
    pool.set(t.kind, arr);
    const tv = arr.pop() ?? build(t.kind, t.r);
    tv.g.visible = true;
    tv.inner.rotation.set(0, 0, 0);
    tv.g.scale.setScalar(1);
    return tv;
  };
  const release = (tv: TV): void => {
    tv.g.visible = false;
    const arr = pool.get(tv.kind) ?? [];
    pool.set(tv.kind, arr);
    arr.push(tv);
  };

  // Fadenkreuz
  const cross = new THREE.Group();
  const crossMat = new THREE.MeshBasicMaterial({ color: 0xff2d55, depthTest: false, transparent: true });
  const mkc = (geo: THREE.BufferGeometry, x = 0, y = 0): void => {
    const m = new THREE.Mesh(geo, crossMat);
    m.position.set(x, y, 0);
    m.renderOrder = 30;
    cross.add(m);
  };
  mkc(new THREE.RingGeometry(0.3, 0.37, 32));
  mkc(new THREE.CircleGeometry(0.05, 12));
  mkc(new THREE.PlaneGeometry(0.07, 0.3), 0, 0.5);
  mkc(new THREE.PlaneGeometry(0.07, 0.3), 0, -0.5);
  mkc(new THREE.PlaneGeometry(0.3, 0.07), 0.5, 0);
  mkc(new THREE.PlaneGeometry(0.3, 0.07), -0.5, 0);
  cross.position.z = 1.5;
  root.add(cross);

  // Mündungsblitz / Einschlag
  const flash = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.34, 20), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthTest: false }));
  flash.renderOrder = 29;
  flash.visible = false;
  root.add(flash);
  let flashT = 1;

  // Punkte-Texte (je Text einige wiederverwendbare Sprites)
  interface Pop { sp: THREE.Sprite; t: number }
  const pops: Pop[] = [];
  const popCache = new Map<string, THREE.Sprite[]>();
  const showPop = (text: string, color: string, x: number, y: number): void => {
    const arr = popCache.get(text) ?? [];
    popCache.set(text, arr);
    let sp = arr.find((q) => !q.visible);
    if (!sp) {
      sp = textSprite(text, { color, size: 64, width: 1.7 });
      sp.visible = false;
      root.add(sp);
      arr.push(sp);
    }
    sp.visible = true;
    sp.position.set(x, y, 1.2);
    pops.push({ sp, t: 0 });
  };

  let t = 0;
  let lastSeq = initial.shotSeq;
  let lastAmmo = initial.ammo;
  let wasOver = false;
  const v3 = new THREE.Vector3();

  return {
    update(s, dt) {
      t += dt;
      // Kamera: ganze Bude sichtbar (Hochformat: weiter weg)
      const asp = camera.aspect || 1.6;
      const hh = Math.max(4.1, (X_MAX * SC + 0.1) / asp);
      const dist = hh / Math.tan((camera.fov * Math.PI) / 360);
      camera.position.set(0, 4, dist);
      camera.lookAt(0, 4, 0);

      // Ziele aktualisieren
      const seen = new Set<number>();
      for (const tg of s.targets) {
        seen.add(tg.id);
        let tv = live.get(tg.id);
        if (!tv) {
          tv = acquire(tg);
          live.set(tg.id, tv);
        }
        const row = tg.kind === 'pop' ? 0 : Math.round((tg.y0 - 0.55) / -0.5);
        tv.g.position.set(wx(tg.x), wy(tg.y), -0.05 * row);
        const age = tg.age;
        if (tg.kind === 'pop') {
          const up = Math.min(1, age / 8);
          const down = Math.min(1, (tg.life - age) / 8);
          const k = Math.max(0.001, Math.min(up, down));
          tv.g.scale.setScalar(k);
          tv.inner.rotation.z = Math.sin(age * 0.3) * 0.1;
        } else {
          tv.inner.rotation.z = Math.sin(age * 0.12 + tg.id) * 0.12;
          tv.inner.rotation.y = tg.kind === 'bonus' ? Math.sin(age * 0.08) * 0.6 : 0;
        }
        if (tv.spin) tv.spin.rotation.z = t * 3;
      }
      for (const [id, tv] of live) {
        if (seen.has(id)) continue;
        live.delete(id);
        const hit = s.lastShot.id === id;
        dying.push({ tv, t: 0, hit, vx: 0 });
      }
      for (let i = dying.length - 1; i >= 0; i--) {
        const d = dying[i] as Dying;
        d.t += dt;
        if (d.hit) {
          d.tv.inner.rotation.x = Math.min(1.5, d.t * 7);
          d.tv.g.position.y -= dt * (1 + d.t * 6);
          d.tv.g.scale.setScalar(Math.max(0.01, 1 - d.t * 1.4));
          if (d.t > 0.7) {
            dying.splice(i, 1);
            release(d.tv);
          }
        } else {
          dying.splice(i, 1);
          release(d.tv);
        }
      }

      // Fadenkreuz
      cross.position.x = wx(s.cx);
      cross.position.y = wy(s.cy);
      const reloading = s.reload > 0;
      crossMat.color.setHex(reloading ? 0xffd23f : 0xff2d55);
      crossMat.opacity = reloading ? 0.6 : 1;
      cross.rotation.z = reloading ? t * 4 : 0;
      const sc = 1 + (flashT < 0.2 ? (0.2 - flashT) * 1.5 : 0);
      cross.scale.setScalar(sc);

      // Schuss-Ereignis
      if (s.shotSeq !== lastSeq) {
        lastSeq = s.shotSeq;
        const ls = s.lastShot;
        flash.visible = true;
        flashT = 0;
        flash.position.set(wx(ls.x), wy(ls.y), 1.3);
        if (ls.id) {
          v3.set(wx(ls.x), wy(ls.y), 0.5);
          if (ls.pts > 0) {
            ctx.sfx(ls.kind === 'bonus' ? 'win' : 'good');
            ctx.burst(v3, ls.kind === 'bonus' ? 0xffd23f : 0x7df9ff, ls.kind === 'bonus' ? 26 : 14);
            showPop(`+${ls.pts}`, ls.kind === 'bonus' ? '#ffd23f' : '#ffffff', wx(ls.x), wy(ls.y) + 0.8);
          } else {
            ctx.sfx('bad');
            ctx.burst(v3, 0xff4d4d, 22);
            showPop(`${ls.pts}`, '#ff6b6b', wx(ls.x), wy(ls.y) + 0.8);
          }
        } else ctx.sfx('hit');
      }
      if (flashT < 0.25) {
        flashT += dt;
        flash.scale.setScalar(1 + flashT * 3);
        (flash.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - flashT * 4.5);
        if (flashT >= 0.25) flash.visible = false;
      }
      for (let i = pops.length - 1; i >= 0; i--) {
        const p = pops[i] as Pop;
        p.t += dt;
        p.sp.position.y += dt * 1.8;
        p.sp.material.opacity = Math.max(0, 1 - Math.max(0, p.t - 0.5) * 2.5);
        if (p.t > 1) {
          p.sp.visible = false;
          p.sp.material.opacity = 1;
          pops.splice(i, 1);
        }
      }
      if (s.ammo !== lastAmmo) {
        if (s.ammo === MAG && lastAmmo === 0) ctx.sfx('tick');
        lastAmmo = s.ammo;
      }
      for (let i = 0; i < bullets.length; i++) {
        const b = bullets[i] as THREE.Mesh;
        const has = i < s.ammo;
        b.visible = true;
        b.scale.setScalar(has ? 1 : 0.55);
        (b.material as THREE.MeshToonMaterial) = has ? toon(0xffd23f, { emissive: 0xffa800, emissiveIntensity: 0.5 }) : toon(0x6b5a40);
        b.position.y = 1.2 + (reloading ? Math.abs(Math.sin(t * 8 + i)) * 0.15 : 0);
      }
      awn.position.y = awnY + Math.sin(t * 1.5) * 0.02;
      if (s.over && !wasOver) {
        wasOver = true;
        ctx.sfx('win');
      }
    },
    dispose() {
      /* Alles hängt an root */
    },
  };
};
