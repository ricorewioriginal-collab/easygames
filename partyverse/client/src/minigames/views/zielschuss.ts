import * as THREE from 'three';
import type { Target, TargetKind, ZielState } from '@shared/minigames/games/zielschuss';
import { MAG, ROW_Y, X_MAX, multOf, phaseOf } from '@shared/minigames/games/zielschuss';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';
import { makeMe, makeRivals, updateRivals, type Racer } from './rivals';

interface TV {
  g: THREE.Group;
  kind: TargetKind;
  inner: THREE.Group;
  spin: THREE.Object3D | null;
}

/** Abstand Kamera → Zielwand; daraus ergibt sich die sichtbare Fläche, auf die das Spielfeld genau abgebildet wird */
const CAM_D = 14;

/**
 * Schießbude: Zelt mit gestreiftem Vordach, drei Schienen, Pappziele (Enten, Raketen, Sterne) und schwarze Köder-Bomben.
 * Das Spielfeld wird so auf den Bildschirm gelegt, dass Maus/Finger genau auf dem Fadenkreuz liegen (auch im Hochformat).
 * Die eigene Figur steht links vorne an der Theke, die Mitspieler rechts – ihre Fadenkreuze sieht man in ihren Farben.
 */
export const createView: MiniGameViewFactory<ZielState> = (ctx, initial) => {
  const { root, camera } = ctx;
  ctx.scene.background = new THREE.Color(0x24164f);
  ctx.scene.fog = null;
  root.add(new THREE.HemisphereLight(0xffffff, 0x6a4a98, 1.7));
  const key = new THREE.DirectionalLight(0xfff0d0, 1.5);
  key.position.set(-3, 8, 14);
  root.add(key);
  const rim = new THREE.DirectionalLight(0x9ad8ff, 0.6);
  rim.position.set(6, 3, -4);
  root.add(rim);

  // Abbildung Spielfeld → Welt (wird bei jeder Seitenverhältnis-Änderung neu berechnet)
  let kx = 4;
  let ky = 4;
  let S = 4; // Größenmaßstab für Ziele
  let halfW = 7;
  let halfH = 6;
  const wx = (x: number): number => x * kx;
  const wy = (y: number): number => y * ky;

  // Rückwand und Zeltstoff
  const back = new THREE.Mesh(new THREE.PlaneGeometry(120, 90), toon(0x3a2d78));
  back.position.set(0, 0, -4);
  root.add(back);
  for (let i = -24; i <= 24; i += 2) {
    const st = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 90), toon(0x4a3a96));
    st.position.set(i * 1.8 + 1.8, 0, -3.95);
    root.add(st);
  }
  // Schienen
  const rails: THREE.Group[] = ROW_Y.map(() => {
    const g = new THREE.Group();
    const rail = new THREE.Mesh(new THREE.BoxGeometry(80, 0.12, 0.12), toon(0x6b4423));
    rail.position.set(0, 0, -0.25);
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(80, 0.08, 0.5), toon(0x8a5a2b));
    shelf.position.set(0, -0.08, -0.4);
    g.add(rail, shelf);
    root.add(g);
    return g;
  });
  // Theke (vorne unten)
  const counter = new THREE.Group();
  const cBody = new THREE.Mesh(new THREE.BoxGeometry(80, 3, 1.2), toon(0xc0572e));
  cBody.position.set(0, -1.5, 0);
  const cTop = new THREE.Mesh(new THREE.BoxGeometry(80, 0.2, 1.6), toon(0xffe0a0));
  cTop.position.set(0, 0.05, 0.1);
  const cStripe = new THREE.Mesh(new THREE.BoxGeometry(80, 0.18, 0.05), toon(0xffd23f));
  cStripe.position.set(0, -0.55, 0.62);
  counter.add(cBody, cTop, cStripe);
  counter.position.z = 1.2;
  root.add(counter);
  // Vordach + Lichterkette (oben)
  const awn = new THREE.Group();
  for (let i = -22; i <= 22; i++) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.0, 4, 1), toon(i % 2 === 0 ? 0xff4d6d : 0xffffff));
    m.rotation.z = Math.PI;
    m.rotation.y = Math.PI / 4;
    m.position.set(i * 1.27, 0, 0);
    m.scale.set(1.0, 1, 0.4);
    awn.add(m);
  }
  const bar = new THREE.Mesh(new THREE.BoxGeometry(80, 0.5, 0.5), toon(0xff4d6d));
  bar.position.set(0, 0.55, 0);
  awn.add(bar);
  const bulbMats = [0xffe36e, 0x7df9ff, 0xff7ad9].map((c) => new THREE.MeshBasicMaterial({ color: c }));
  const bulbs: THREE.Mesh[] = [];
  for (let i = -20; i <= 20; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), bulbMats[(i + 21) % 3] as THREE.Material);
    b.position.set(i * 1.3, -0.75 - Math.abs(Math.sin(i * 0.9)) * 0.1, 0.15);
    awn.add(b);
    bulbs.push(b);
  }
  awn.position.z = 0.4;
  root.add(awn);

  // Munition auf der Theke
  const ammoG = new THREE.Group();
  const bulletOn = toon(0xffd23f, { emissive: 0xffa800, emissiveIntensity: 0.5 });
  const bulletOff = toon(0x6b5a40);
  const bullets: THREE.Mesh[] = [];
  for (let i = 0; i < MAG; i++) {
    const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.3, 4, 8), bulletOn);
    b.position.set(i * 0.38, 0.35, 0);
    ammoG.add(b);
    bullets.push(b);
  }
  root.add(ammoG);

  // Figuren: ich links vorne, Mitspieler rechts
  const me = makeMe(ctx, 1);
  const rivals: Racer[] = makeRivals(ctx, 0.7);

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
  // Ziele werden in Einheitsgröße (R = 1) gebaut und beim Zeichnen skaliert
  const build = (kind: TargetKind): TV => {
    const g = new THREE.Group();
    const inner = new THREE.Group();
    g.add(inner);
    let spin: THREE.Object3D | null = null;
    const R = 1;
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6), toon(0x6b4423));
    stick.position.set(0, -R - 1.1, -0.1);
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
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(R * 0.05, 8, 6),
        new THREE.MeshBasicMaterial({ color: 0x1a1030 }),
      );
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
      const halo = new THREE.Mesh(new THREE.RingGeometry(R * 1.2, R * 1.38, 28), glow(0xfff6a8, 0.6));
      halo.position.z = 0.1;
      inner.add(halo);
      spin = halo;
    } else {
      const bomb = new THREE.Mesh(new THREE.SphereGeometry(R * 0.85, 20, 14), toon(0x1c1c28));
      inner.add(bomb);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.2, R * 0.25, R * 0.25, 10), toon(0x555566));
      cap.position.y = R * 0.85;
      inner.add(cap);
      const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, R * 0.45, 6), toon(0xc9a36b));
      fuse.position.set(R * 0.1, R * 1.15, 0);
      fuse.rotation.z = -0.4;
      inner.add(fuse);
      const spark = new THREE.Mesh(new THREE.OctahedronGeometry(R * 0.18), glow(0xffe36e));
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
  const sizeOf = new Map<number, number>();
  interface Dying {
    tv: TV;
    t: number;
    hit: boolean;
    sc: number;
  }
  const dying: Dying[] = [];
  const acquire = (t: Target): TV => {
    const arr = pool.get(t.kind) ?? [];
    pool.set(t.kind, arr);
    const tv = arr.pop() ?? build(t.kind);
    tv.g.visible = true;
    tv.inner.rotation.set(0, 0, 0);
    return tv;
  };
  const release = (tv: TV): void => {
    tv.g.visible = false;
    const arr = pool.get(tv.kind) ?? [];
    pool.set(tv.kind, arr);
    arr.push(tv);
  };

  // Fadenkreuz (eigenes) und kleine Fadenkreuze der Mitspieler
  const makeCross = (color: number, opacity: number, order: number): THREE.Group => {
    const cross = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true, opacity });
    const mkc = (geo: THREE.BufferGeometry, x = 0, y = 0): void => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, 0);
      m.renderOrder = order;
      cross.add(m);
    };
    mkc(new THREE.RingGeometry(0.3, 0.38, 32));
    mkc(new THREE.CircleGeometry(0.05, 12));
    mkc(new THREE.PlaneGeometry(0.07, 0.3), 0, 0.5);
    mkc(new THREE.PlaneGeometry(0.07, 0.3), 0, -0.5);
    mkc(new THREE.PlaneGeometry(0.3, 0.07), 0.5, 0);
    mkc(new THREE.PlaneGeometry(0.3, 0.07), -0.5, 0);
    cross.position.z = 1.5;
    cross.userData.mat = mat;
    root.add(cross);
    return cross;
  };
  const cross = makeCross(0xff2d55, 1, 30);
  const crossMat = cross.userData.mat as THREE.MeshBasicMaterial;
  // Weißer Rand ums eigene Fadenkreuz, damit es auf jedem Hintergrund lesbar bleibt
  const crossOutline = new THREE.Mesh(
    new THREE.RingGeometry(0.26, 0.42, 32),
    new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false, transparent: true, opacity: 0.55 }),
  );
  crossOutline.renderOrder = 29;
  cross.add(crossOutline);
  // Munitionsanzeige direkt unter dem Fadenkreuz (dort schaut man ohnehin hin)
  const pipOn = new THREE.MeshBasicMaterial({ color: 0xffd23f, depthTest: false, transparent: true });
  const pipOff = new THREE.MeshBasicMaterial({
    color: 0x1a1030,
    depthTest: false,
    transparent: true,
    opacity: 0.45,
  });
  const pipGeo = new THREE.CircleGeometry(0.07, 10);
  const pips: THREE.Mesh[] = [];
  for (let i = 0; i < MAG; i++) {
    const m = new THREE.Mesh(pipGeo, pipOn);
    m.position.set((i - (MAG - 1) / 2) * 0.19, -0.78, 0);
    m.renderOrder = 31;
    cross.add(m);
    pips.push(m);
  }
  const rivalCross = ctx.rivals.map((a) => {
    const c = makeCross(a.color, 0.55, 25);
    c.scale.setScalar(0.6);
    c.position.z = 1.4;
    return c;
  });

  // Mündungsblitz / Einschlag
  const flash = new THREE.Mesh(
    new THREE.RingGeometry(0.2, 0.34, 20),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthTest: false }),
  );
  flash.renderOrder = 29;
  flash.visible = false;
  root.add(flash);
  let flashT = 1;

  // Punkte-Texte (je Text einige wiederverwendbare Sprites)
  interface Pop {
    sp: THREE.Sprite;
    t: number;
    big: boolean;
  }
  const pops: Pop[] = [];
  const popCache = new Map<string, THREE.Sprite[]>();
  const showPop = (text: string, color: string, x: number, y: number, big = false): void => {
    const key = `${text}|${color}`;
    const arr = popCache.get(key) ?? [];
    popCache.set(key, arr);
    let sp = arr.find((q) => !q.visible);
    if (!sp) {
      sp = textSprite(text, { color, size: 64, width: big ? 2.6 : 1.7 });
      sp.visible = false;
      root.add(sp);
      arr.push(sp);
    }
    sp.visible = true;
    sp.position.set(x, y, 2.2);
    pops.push({ sp, t: 0, big });
  };

  // Multiplikator-Schild über der Theke und Finale-Banner
  const multSprites = new Map<string, THREE.Sprite>();
  const multSprite = (text: string, bg: string): THREE.Sprite => {
    let sp = multSprites.get(text);
    if (!sp) {
      sp = textSprite(text, { color: '#ffffff', bg, size: 72, width: 1.6 });
      sp.visible = false;
      root.add(sp);
      multSprites.set(text, sp);
    }
    return sp;
  };
  const finaleBanner = textSprite('FINALE · ALLES ×2', {
    color: '#2a1600',
    bg: '#ffd23f',
    size: 72,
    width: 5,
  });
  finaleBanner.visible = false;
  root.add(finaleBanner);
  let shownMult: THREE.Sprite | null = null;

  let t = 0;
  let lastSeq = initial.shotSeq;
  let lastAmmo = initial.ammo;
  let wasOver = false;
  let lastAspect = -1;
  let shake = 0;
  let meBusy = 0;
  let lastPhase = 0;
  let finaleT = -1;
  const v3 = new THREE.Vector3();
  const rivalSeq = ctx.rivals.map(() => -1);
  const rivalBusy = ctx.rivals.map(() => 0);

  const layout = (): void => {
    const asp = camera.aspect || 1.6;
    halfH = CAM_D * Math.tan((camera.fov * Math.PI) / 360);
    halfW = halfH * asp;
    kx = halfW / X_MAX;
    ky = halfH;
    // Ziele bleiben rund; im Hochformat etwas größer gezeichnet, damit der Finger sie gut trifft
    S = asp < 1 ? Math.min(ky, kx * 1.25) : Math.min(kx, ky);
    rails.forEach((g, i) => g.position.set(0, wy(ROW_Y[i] as number) - 0.17 * S - 1.2 * (S / 4), -0.1));
    const cy = wy(-0.8);
    counter.position.set(0, cy, 1.2);
    awn.position.set(0, halfH - 0.2, 0.4);
    const portrait = asp < 1;
    ammoG.visible = !portrait;
    // Figuren stehen weiter vorne (z): dort ist die sichtbare Breite kleiner
    const zf = (CAM_D - 1.9) / CAM_D;
    const vw = halfW * zf;
    ammoG.position.set(vw - 0.4 - MAG * 0.38, cy + 0.1, 1.9);
    me.group.scale.setScalar(portrait ? 0.8 : 1.1);
    me.group.position.set(-vw + (portrait ? 0.75 : 1.3), cy + 0.12, 1.9);
    rivals.forEach((r, i) => {
      r.group.scale.setScalar(portrait ? 0.62 : 0.9);
      const x = portrait ? vw - 0.55 - (2 - i) * 0.95 : vw - 1.1 - (2 - i) * 1.25 - MAG * 0.38;
      r.group.position.set(x, cy + 0.12, 1.7 - i * 0.05);
    });
  };

  return {
    update(s, dt) {
      t += dt;
      if (Math.abs((camera.aspect || 1.6) - lastAspect) > 1e-3) {
        lastAspect = camera.aspect || 1.6;
        layout();
      }
      shake = Math.max(0, shake - dt * 2.5);
      const sx = shake > 0 ? Math.sin(t * 61) * shake * 0.35 : 0;
      const sy = shake > 0 ? Math.cos(t * 47) * shake * 0.25 : 0;
      camera.position.set(sx, sy, CAM_D);
      camera.lookAt(sx * 0.5, sy * 0.5, 0);

      // Ziele aktualisieren
      const seen = new Set<number>();
      for (const tg of s.targets) {
        seen.add(tg.id);
        let tv = live.get(tg.id);
        if (!tv) {
          tv = acquire(tg);
          live.set(tg.id, tv);
        }
        const size = tg.r * S;
        sizeOf.set(tg.id, size);
        const row = tg.kind === 'pop' ? 0 : Math.round((tg.y0 - 0.55) / -0.5);
        tv.g.position.set(wx(tg.x), wy(tg.y), -0.05 * row + (tg.kind === 'pop' ? 0.2 : 0));
        const age = tg.age;
        let k = 1;
        if (tg.kind === 'pop') {
          const up = Math.min(1, age / 8);
          const down = Math.min(1, (tg.life - age) / 8);
          k = Math.max(0.001, Math.min(up, down));
          tv.inner.rotation.z = Math.sin(age * 0.3) * 0.1;
        } else {
          tv.inner.rotation.z = Math.sin(age * 0.12 + tg.id) * 0.12;
          tv.inner.rotation.y = tg.kind === 'bonus' ? Math.sin(age * 0.08) * 0.6 : 0;
        }
        tv.g.scale.setScalar(size * k);
        if (tv.spin) tv.spin.rotation.z = t * 3;
      }
      for (const [id, tv] of live) {
        if (seen.has(id)) continue;
        live.delete(id);
        const hit = s.lastShot.id === id;
        dying.push({ tv, t: 0, hit, sc: sizeOf.get(id) ?? 0.6 });
        sizeOf.delete(id);
      }
      for (let i = dying.length - 1; i >= 0; i--) {
        const d = dying[i] as Dying;
        d.t += dt;
        if (d.hit) {
          d.tv.inner.rotation.x = Math.min(1.5, d.t * 7);
          d.tv.g.position.y -= dt * (1 + d.t * 6);
          d.tv.g.scale.setScalar(Math.max(0.01, d.sc * (1 - d.t * 1.4)));
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
      const csc = (S / 4) * (1 + (flashT < 0.2 ? (0.2 - flashT) * 1.5 : 0));
      cross.scale.setScalar(Math.max(0.6, csc));

      // Schuss-Ereignis
      if (s.shotSeq !== lastSeq) {
        lastSeq = s.shotSeq;
        const ls = s.lastShot;
        flash.visible = true;
        flashT = 0;
        flash.position.set(wx(ls.x), wy(ls.y), 1.6);
        if (ls.id) {
          v3.set(wx(ls.x), wy(ls.y), 0.5);
          if (ls.pts > 0) {
            const gold = ls.kind === 'bonus';
            ctx.sfx(gold ? 'win' : ls.mult > 1 ? 'coin' : 'good');
            ctx.burst(v3, gold ? 0xffd23f : ls.mult > 1 ? 0xff7ad9 : 0x7df9ff, gold ? 28 : 12 + ls.mult * 4);
            showPop(`+${ls.pts}`, gold || ls.mult > 1 ? '#ffd23f' : '#ffffff', v3.x, v3.y + 0.9, ls.mult > 2);
            if (s.combo > 0 && s.combo % 4 === 0) {
              me.rig.play('cheer');
              meBusy = 1.2;
            }
          } else {
            ctx.sfx('bad');
            ctx.burst(v3, 0xff4d4d, 26);
            showPop(`${ls.pts}`, '#ff6b6b', v3.x, v3.y + 0.9, true);
            shake = 0.6;
            me.rig.play('shock');
            meBusy = 0.9;
          }
        } else {
          ctx.sfx('hit');
        }
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
        b.scale.setScalar(has ? 1 : 0.55);
        b.material = has ? bulletOn : bulletOff;
        b.position.y = 0.35 + (reloading ? Math.abs(Math.sin(t * 8 + i)) * 0.15 : 0);
      }
      pips.forEach((m, i) => {
        m.material = i < s.ammo ? pipOn : pipOff;
        m.visible = !reloading || Math.sin(t * 14) > 0;
      });
      bulbs.forEach((b, i) => b.scale.setScalar(0.8 + 0.4 * Math.max(0, Math.sin(t * 5 + i * 0.7))));

      // Multiplikator-Schild über der eigenen Figur
      const phase = phaseOf(s.tick);
      const m = multOf(s.combo) * (phase === 2 ? 2 : 1);
      const want = m > 1 ? multSprite(`×${m}`, m >= 4 ? '#ff3d7f' : m >= 3 ? '#ff7a3c' : '#7a4dff') : null;
      if (want !== shownMult) {
        if (shownMult) shownMult.visible = false;
        shownMult = want;
        if (want && m > 1) ctx.sfx('beep');
      }
      if (shownMult) {
        shownMult.visible = true;
        shownMult.position.set(
          Math.max(me.group.position.x, -halfW * 0.8 + 0.9),
          me.group.position.y + 2.6 * me.group.scale.x,
          2.6,
        );
        const k = 1 + Math.sin(t * 9) * 0.05;
        shownMult.scale.set(1.6 * k, 0.8 * k, 1);
      }
      if (phase === 2 && lastPhase !== 2) {
        finaleT = 0;
        ctx.sfx('whoosh');
      }
      lastPhase = phase;
      if (finaleT >= 0) {
        finaleT += dt;
        finaleBanner.visible = finaleT < 2.2 || (s.tick % 40 < 30 && !s.over);
        const k = finaleT < 0.25 ? finaleT * 4 : 1;
        const w = Math.min(5, halfW * 1.6) * k;
        finaleBanner.scale.set(w, w * 0.18, 1);
        finaleBanner.position.set(0, finaleT < 2.2 ? 0 : halfH - 1.6, 2.4);
        if (finaleT >= 2.2) finaleBanner.scale.multiplyScalar(0.6);
      }

      // Eigene Figur
      meBusy = Math.max(0, meBusy - dt);
      if (s.over && !wasOver) {
        wasOver = true;
        ctx.sfx('win');
        me.rig.play('celebrate');
        meBusy = 99;
      }
      if (meBusy <= 0 && me.rig.current !== 'idle') me.rig.play('idle', { loop: true });
      me.rig.faceTowards(Math.atan2(wx(s.cx) - me.group.position.x, -6) * 0.8);
      me.rig.update(dt);
    },
    ghosts(states, dt) {
      updateRivals(rivals, states, dt, (r, rs, i) => {
        const c = rivalCross[i] as THREE.Group;
        c.visible = !rs.over;
        c.position.set(wx(rs.cx), wy(rs.cy), 1.4);
        c.scale.setScalar(Math.max(0.45, (S / 4) * 0.6));
        rivalBusy[i] = Math.max(0, (rivalBusy[i] as number) - dt);
        if (rivalSeq[i] !== rs.shotSeq) {
          const first = rivalSeq[i] === -1;
          rivalSeq[i] = rs.shotSeq;
          const ls = rs.lastShot;
          if (!first && ls.id) {
            v3.set(wx(ls.x), wy(ls.y), 0.4);
            ctx.burst(v3, r.avatar.color, ls.pts > 0 ? 7 : 12);
            if (ls.pts < 0) {
              r.rig.play('shock');
              rivalBusy[i] = 0.9;
            } else if (rs.combo > 0 && rs.combo % 4 === 0) {
              r.rig.play('cheer');
              rivalBusy[i] = 1.2;
            }
          }
        }
        if (rs.over && r.rig.current === 'idle') r.rig.play('celebrate');
        else if ((rivalBusy[i] as number) <= 0 && !rs.over && r.rig.current !== 'idle')
          r.rig.play('idle', { loop: true });
        r.rig.faceTowards(Math.atan2(wx(rs.cx) - r.group.position.x, -6) * 0.8);
      });
      states.forEach((st, i) => {
        if (!st) (rivalCross[i] as THREE.Group).visible = false;
      });
    },
    dispose() {
      /* Alles hängt an root */
    },
  };
};
