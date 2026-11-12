import * as THREE from 'three';
import type { Drop, MuenzState } from '@shared/minigames/games/muenzregen';
import {
  BASE_SPEED,
  BASKET_HW,
  BLAST_R,
  DURATION_TICKS,
  HALF_W,
  MAGNET_COOLDOWN,
  MAGNET_RADIUS,
  MAGNET_TICKS,
  multOf,
  rampFor,
  RUSH_TICK,
  TOP_Y,
  WIND_TICK,
} from '@shared/minigames/games/muenzregen';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';
import { makeMe, makeRivals, updateRivals, type Racer } from './rivals';

function skyTexture(top: string, mid: string, low: string, bottom: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 256;
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  const grd = g.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, top);
  grd.addColorStop(0.5, mid);
  grd.addColorStop(0.82, low);
  grd.addColorStop(1, bottom);
  g.fillStyle = grd;
  g.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

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

interface DropView {
  group: THREE.Group;
  spin: THREE.Object3D;
  born: number;
  /** verfehlt: fällt in der Ansicht bis zum Boden weiter */
  fallY: number;
  fallV: number;
  falling: boolean;
}

interface Carrier {
  racer: Racer;
  basket: THREE.Group;
  lastCaught: number;
  lastHits: number;
  lastStun: number;
  ended: boolean;
  z: number;
}

/** Hinter der eigenen Figur laufen die Mitspieler halbdurchsichtig mit */
const RIVAL_Z = [-1.7, -2.9, -4.1];
/** Unterkante des Korbs (die Simulation fängt bei y ≈ 0) */
const BASKET_Y = -0.5;

/**
 * Sonniger Himmel, die eigene Figur trägt den Korb auf dem Kopf und fängt goldenen Regen.
 * Ab 8 s ziehen Windschlieren durchs Bild, ab 16 s färbt der Goldrausch den Himmel.
 */
export const createView: MiniGameViewFactory<MuenzState> = (ctx, initial) => {
  const { root, camera, scene } = ctx;
  const sky = skyTexture('#3f6fff', '#8fb9ff', '#ffd6e8', '#ffe9b0');
  const goldSky = skyTexture('#ff8a3d', '#ffc45a', '#ffe7a0', '#fff3c8');
  scene.background = sky;

  // --- Figur messen: Kopf direkt unter dem Korb ---------------------------------
  const me = makeMe(ctx, 1);
  me.rig.update(0);
  const box = new THREE.Box3().setFromObject(me.rig.root);
  const figH = Math.max(1.2, Math.min(2.4, box.max.y - box.min.y || 1.8));
  const GROUND = BASKET_Y - figH * 0.94;

  // --- Landschaft ----------------------------------------------------------
  const ground = new THREE.Mesh(new THREE.BoxGeometry(80, 30, 40), toon(0x58c95a));
  ground.position.set(0, GROUND - 15, 4);
  root.add(ground);
  for (let i = -7; i <= 7; i++) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2, 0.04, 9), toon(i % 2 ? 0x6bdc66 : 0x4fbe55));
    stripe.position.set(i * 2, GROUND + 0.02, -1.5);
    root.add(stripe);
  }
  const hillMat = [toon(0x3fae6a), toon(0x2f9a7a), toon(0x5ac86e)];
  for (let i = 0; i < 6; i++) {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(3.4 + (i % 3) * 1.3, 24, 14), hillMat[i % 3]!);
    hill.position.set(-17 + i * 6.8, GROUND - 2.4, -12 - (i % 2) * 3);
    root.add(hill);
  }
  const sun = new THREE.Mesh(new THREE.CircleGeometry(1.8, 32), glow(0xfff2a0));
  sun.position.set(-8.5, 9.8, -14);
  root.add(sun);
  const sunHalo = new THREE.Mesh(new THREE.CircleGeometry(3.2, 32), glow(0xfff2a0, 0.25));
  sunHalo.position.copy(sun.position);
  sunHalo.position.z -= 0.1;
  root.add(sunHalo);
  const clouds: THREE.Group[] = [];
  const cloudMat = toon(0xffffff, { emissive: 0xdde8ff, emissiveIntensity: 0.7 });
  for (let i = 0; i < 7; i++) {
    const g = new THREE.Group();
    for (let k = 0; k < 4; k++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.75 + (k % 2) * 0.3, 14, 10), cloudMat);
      b.position.set((k - 1.5) * 1.1, (k % 2) * 0.35, 0);
      b.scale.y = 0.75;
      g.add(b);
    }
    g.position.set(-15 + i * 5, TOP_Y + 2.4 + (i % 3) * 0.5, -8 - (i % 2) * 2);
    root.add(g);
    clouds.push(g);
  }
  // Windschlieren (ab der Windphase)
  const streakMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const streaks: THREE.Mesh[] = [];
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6 + (i % 3) * 0.8, 0.05), streakMat);
    m.position.set(-HALF_W + ((i * 3.7) % (HALF_W * 2)), 0.6 + ((i * 2.3) % 8), -2.5 - (i % 3));
    root.add(m);
    streaks.push(m);
  }

  // --- Korb ---------------------------------------------------------------------
  const wallMat = toon(0xc98a45).clone();
  wallMat.side = THREE.DoubleSide;
  const wallGeo = new THREE.CylinderGeometry(BASKET_HW + 0.12, BASKET_HW - 0.2, 0.95, 24, 1, true);
  const bottomGeo = new THREE.CircleGeometry(BASKET_HW - 0.2, 20);
  const rimGeo = new THREE.TorusGeometry(BASKET_HW + 0.12, 0.1, 8, 28);
  const bandGeo = new THREE.TorusGeometry(BASKET_HW - 0.03, 0.035, 6, 24);
  const makeBasket = (color: number, ghost: boolean): THREE.Group => {
    const g = new THREE.Group();
    const fade = <M extends THREE.Material>(m: M): M => {
      if (!ghost) return m;
      const c = m.clone() as M;
      c.transparent = true;
      c.opacity = 0.5;
      c.depthWrite = false;
      return c;
    };
    const wall = new THREE.Mesh(wallGeo, fade(wallMat));
    wall.position.y = 0.48;
    const bottom = new THREE.Mesh(bottomGeo, fade(toon(0x6a4220)));
    bottom.rotation.x = -Math.PI / 2;
    bottom.position.y = 0.04;
    const rim = new THREE.Mesh(rimGeo, fade(toon(color)));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.95;
    g.add(wall, bottom, rim);
    if (!ghost)
      for (let k = 0; k < 3; k++) {
        const band = new THREE.Mesh(bandGeo, toon(0x8a5a28));
        band.rotation.x = Math.PI / 2;
        band.position.y = 0.2 + k * 0.28;
        band.scale.setScalar(1 + k * 0.045);
        g.add(band);
      }
    root.add(g);
    return g;
  };
  const myBasket = makeBasket(me.avatar.color, false);
  me.ring.visible = true;
  const mine: Carrier = {
    racer: me,
    basket: myBasket,
    lastCaught: initial.caught,
    lastHits: initial.hits,
    lastStun: 0,
    ended: false,
    z: 0,
  };
  const rivals = makeRivals(ctx, 0.9);
  const others: Carrier[] = rivals.map((r, i) => ({
    racer: r,
    basket: makeBasket(r.avatar.color, true),
    lastCaught: 0,
    lastHits: 0,
    lastStun: 0,
    ended: false,
    z: RIVAL_Z[i] ?? -5,
  }));
  const placeCarrier = (c: Carrier, s: MuenzState, scale: number): void => {
    const g = c.racer.group;
    g.position.set(s.bx, GROUND + 0.02, c.z);
    const rig = c.racer.rig;
    const tilt = -s.bvx * 0.022 + (s.stun > 0 ? Math.sin(t * 30) * 0.16 : 0);
    c.basket.position.set(s.bx - Math.sin(tilt) * 0.3, GROUND + (BASKET_Y - GROUND) * scale + 0.02, c.z);
    c.basket.rotation.z = tilt;
    c.basket.scale.setScalar(scale);
    const loopAnim = rig.current === 'idle' || rig.current === 'run' || rig.current === 'walk';
    if (s.stun > 0 && c.lastStun === 0) rig.play('shock');
    else if (loopAnim) {
      const sp = Math.abs(s.bvx);
      if (sp > 1.5) rig.play('run', { speed: 0.6 + sp / 10 });
      else rig.play('idle', { loop: true });
    }
    c.lastStun = s.stun;
    rig.faceTowards(Math.abs(s.bvx) > 1.5 ? Math.sign(s.bvx) * 0.9 : 0);
    if (s.tick >= DURATION_TICKS && !c.ended) {
      c.ended = true;
      rig.play(s.points >= 120 ? 'celebrate' : 'cheer');
    }
  };

  // Magnet über dem eigenen Korb
  const magnet = new THREE.Group();
  const horseshoe = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.1, 8, 16, Math.PI), toon(0xff4d4d));
  horseshoe.rotation.z = Math.PI;
  magnet.add(horseshoe);
  for (const sx of [-1, 1]) {
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.2, 8), toon(0xdddddd));
    tip.position.set(sx * 0.28, 0.12, 0);
    magnet.add(tip);
  }
  root.add(magnet);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.9, 20), glow(0x1a3a1a, 0.3));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, GROUND + 0.05, 0.1);
  root.add(shadow);
  const wave = new THREE.Mesh(new THREE.RingGeometry(0.92, 1.0, 40), glow(0x6aa8ff, 0.7));
  wave.visible = false;
  root.add(wave);
  const barBg = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.16), glow(0x20304a, 0.6));
  const barFg = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.16), glow(0x6aa8ff));
  barFg.position.z = 0.01;
  const bar = new THREE.Group();
  bar.add(barBg, barFg);
  root.add(bar);

  // --- Fallobjekte ---------------------------------------------------------------
  const coinGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.13, 22);
  const coinInner = new THREE.CylinderGeometry(0.29, 0.29, 0.15, 18);
  const coinRim = new THREE.TorusGeometry(0.42, 0.045, 6, 22);
  const starGeo = starGeometry(0.62, 0.3, 0.22);
  const rockGeo = new THREE.DodecahedronGeometry(0.52, 0);
  const bombGeo = new THREE.SphereGeometry(0.46, 18, 14);
  const haloGeo = new THREE.CircleGeometry(0.95, 20);
  const views = new Map<number, DropView>();
  function makeCoin(spin: THREE.Object3D, big: boolean): void {
    const c = new THREE.Mesh(
      coinGeo,
      big
        ? toon(0xffb800, { emissive: 0xff8a00, emissiveIntensity: 0.45 })
        : toon(0xffc933, { emissive: 0xffa000, emissiveIntensity: 0.25 }),
    );
    c.rotation.x = Math.PI / 2;
    const i2 = new THREE.Mesh(coinInner, toon(big ? 0xfff0a0 : 0xffe27a));
    i2.rotation.x = Math.PI / 2;
    const r = new THREE.Mesh(coinRim, toon(big ? 0xff7a1f : 0xffa51f));
    spin.add(c, i2, r);
  }
  function makeDrop(d: Drop): DropView {
    const group = new THREE.Group();
    const spin = new THREE.Group();
    group.add(spin);
    if (d.kind === 'coin') makeCoin(spin, false);
    else if (d.kind === 'big') {
      makeCoin(spin, true);
      spin.scale.setScalar(1.75);
      const halo = new THREE.Mesh(haloGeo, glow(0xffd23f, 0.35));
      halo.scale.setScalar(1.25);
      halo.position.z = -0.4;
      group.add(halo);
    } else if (d.kind === 'star') {
      const st = new THREE.Mesh(starGeo, toon(0xffe04a, { emissive: 0xffb000, emissiveIntensity: 0.5 }));
      spin.add(st);
      const halo = new THREE.Mesh(haloGeo, glow(0xfff2a0, 0.3));
      halo.position.z = -0.2;
      group.add(halo);
    } else if (d.kind === 'stone') {
      const rk = new THREE.Mesh(rockGeo, toon(0x8b92a8));
      spin.add(rk);
      for (const sx of [-1, 1]) {
        const e = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), toon(0xffffff));
        e.position.set(sx * 0.18, 0.1, 0.45);
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), toon(0x201028));
        p.position.set(sx * 0.18, 0.1, 0.54);
        const brow = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.05), toon(0x2a2438));
        brow.position.set(sx * 0.18, 0.26, 0.5);
        brow.rotation.z = sx * -0.45;
        group.add(e, p, brow);
      }
    } else {
      const b = new THREE.Mesh(bombGeo, toon(0x24202e));
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.14, 10), toon(0x9a9aa8));
      cap.position.y = 0.46;
      const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.28, 6), toon(0xc98a45));
      fuse.position.set(0.06, 0.65, 0);
      fuse.rotation.z = -0.4;
      const spark = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), glow(0xffd23f));
      spark.position.set(0.14, 0.8, 0);
      spark.name = 'spark';
      const shine = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), glow(0xffffff, 0.8));
      shine.position.set(-0.18, 0.18, 0.36);
      const warn = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 8), glow(0xff2d55, 0.18));
      spin.add(b, cap, fuse, spark, shine);
      group.add(warn);
    }
    group.visible = false;
    root.add(group);
    return { group, spin, born: -1, fallY: 0, fallV: 0, falling: false };
  }
  // Explosionsringe am Boden
  const blastRings: Array<{ m: THREE.Mesh; t: number }> = [];
  const blastGeo = new THREE.RingGeometry(0.8, 1, 36);
  function groundBlast(x: number, near: boolean): void {
    const m = new THREE.Mesh(blastGeo, glow(near ? 0xff4d2d : 0xff9a3d, 0.85));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, GROUND + 0.08, 0);
    root.add(m);
    blastRings.push({ m, t: 0 });
    ctx.burst(v3.set(x, GROUND + 0.4, 0.2), 0xff7a2d, near ? 34 : 18);
    ctx.burst(v3.set(x, GROUND + 0.6, 0.2), 0x55505e, 10);
    ctx.sfx('hit');
    shake = Math.max(shake, near ? 0.45 : 0.18);
  }

  // --- Texte (zwischengespeichert) -----------------------------------------------
  const spriteCache = new Map<string, THREE.Sprite>();
  const sprite = (text: string, color: string, bg: string | undefined, width: number): THREE.Sprite => {
    const key = `${text}|${color}|${bg ?? ''}`;
    let sp = spriteCache.get(key);
    if (!sp) {
      sp = textSprite(text, bg ? { color, bg, size: 64, width } : { color, size: 72, width });
      sp.visible = false;
      root.add(sp);
      spriteCache.set(key, sp);
    }
    return sp;
  };
  interface Pop {
    sp: THREE.Sprite;
    t: number;
    x: number;
    y: number;
    rise: number;
    life: number;
  }
  const pops: Pop[] = [];
  const showPop = (sp: THREE.Sprite, x: number, y: number, rise = 1.8, life = 0.8): void => {
    for (const p of pops) if (p.sp === sp) p.t = p.life;
    sp.visible = true;
    pops.push({ sp, t: 0, x: Math.max(-HALF_W + 1, Math.min(HALF_W - 1, x)), y, rise, life });
  };
  const multSign = (m: number) => sprite(`×${m}`, '#ffffff', m >= 3 ? '#ff4d8a' : '#ff9a1f', 0.9);

  let t = 0;
  let lastMagnet = 0;
  let lastBlasts = initial.blasts;
  let lastMult = 1;
  let squash = 0;
  let shake = 0;
  let windShown = initial.tick >= WIND_TICK;
  let rushShown = initial.tick >= RUSH_TICK;
  let rushK = 0;
  const v3 = new THREE.Vector3();

  return {
    update(s, dt) {
      t += dt;
      clouds.forEach((c, i) => (c.position.x += Math.sin(t * 0.2 + i) * dt * 0.25));
      sunHalo.scale.setScalar(1 + Math.sin(t * 1.5) * 0.04);

      // Phasen: Wind und Goldrausch
      const windy = s.tick >= WIND_TICK;
      streakMat.opacity += ((windy ? 0.5 : 0) - streakMat.opacity) * Math.min(1, dt * 3);
      if (streakMat.opacity > 0.01)
        for (const [i, m] of streaks.entries()) {
          m.position.x += dt * (6 + (i % 4) * 2) * (i % 2 ? 1 : -1);
          if (m.position.x > HALF_W + 3) m.position.x = -HALF_W - 3;
          if (m.position.x < -HALF_W - 3) m.position.x = HALF_W + 3;
        }
      if (windy && !windShown) {
        windShown = true;
        showPop(sprite('WIND!', '#ffffff', '#3f6fff', 3.2), 0, TOP_Y - 2.2, 0.6, 1.8);
        ctx.sfx('whoosh');
      }
      const rush = s.tick >= RUSH_TICK;
      if (rush && !rushShown) {
        rushShown = true;
        showPop(sprite('GOLDRAUSCH!', '#ffffff', '#ff8a1f', 4.2), 0, TOP_Y - 2.2, 0.6, 1.8);
        ctx.sfx('win');
        shake = Math.max(shake, 0.2);
      }
      rushK += ((rush ? 1 : 0) - rushK) * Math.min(1, dt * 2);
      scene.background = rushK > 0.5 ? goldSky : sky;

      // eigene Figur mit Korb
      placeCarrier(mine, s, 1);
      squash = Math.max(0, squash - dt * 4);
      const sq = Math.sin(squash * Math.PI) * 0.18;
      myBasket.scale.set(1 + sq * 0.6, 1 - sq, 1 + sq * 0.6);
      me.rig.update(dt);
      shadow.position.x = s.bx;

      // Magnet
      const mg = s.magnet / MAGNET_TICKS;
      magnet.visible = s.cooldown === 0 || s.magnet > 0;
      magnet.rotation.y = t * 2;
      magnet.position.set(s.bx, 1.4 + Math.sin(t * 4) * 0.08, 0);
      wave.visible = s.magnet > 0;
      if (s.magnet > 0) {
        wave.position.set(s.bx, 1.0, 0);
        wave.scale.setScalar(0.5 + (1 - mg) * MAGNET_RADIUS);
        (wave.material as THREE.MeshBasicMaterial).opacity = 0.7 * mg;
      }
      if (s.magnet > lastMagnet) {
        ctx.sfx('whoosh');
        ctx.burst(v3.set(s.bx, 1.0, 0), 0x6aa8ff, 16);
      }
      lastMagnet = s.magnet;
      const ready = 1 - s.cooldown / MAGNET_COOLDOWN;
      bar.position.set(s.bx, GROUND - 0.25, 1.3);
      barFg.scale.x = Math.max(0.001, ready);
      barFg.position.x = -0.9 * (1 - ready);
      (barFg.material as THREE.MeshBasicMaterial).color.setHex(ready >= 1 ? 0x6dff9a : 0x6aa8ff);

      // Multiplikator-Schild über dem Korb
      const mult = multOf(s.combo);
      for (let m = 2; m <= 3; m++) {
        const sp = multSign(m);
        if (pops.some((p) => p.sp === sp)) continue;
        sp.visible = m === mult;
        if (sp.visible) sp.position.set(s.bx + 1.45, 0.9 + Math.sin(t * 5) * 0.06, 0.6);
      }
      if (mult > lastMult) {
        ctx.sfx('good');
        ctx.burst(v3.set(s.bx, 1.2, 0.3), mult >= 3 ? 0xff4d8a : 0xff9a1f, 22);
        showPop(
          sprite(`SERIE! ×${mult}`, '#ffffff', mult >= 3 ? '#ff4d8a' : '#ff9a1f', 2.4),
          s.bx,
          2.0,
          1.2,
          1.1,
        );
        me.rig.play('cheer');
      } else if (mult < lastMult) {
        showPop(sprite('Serie weg', '#ffffff', '#5a5a6e', 1.9), s.bx, 1.8, 1.0, 0.9);
      }
      lastMult = mult;

      // Fallobjekte
      const vy = (BASE_SPEED * rampFor(s.tick)) / 60;
      for (const d of s.drops) {
        if (d.t0 > s.tick + 1) break;
        let v = views.get(d.id);
        if (!v) {
          v = makeDrop(d);
          views.set(d.id, v);
        }
        if (d.state === 0 && v.born < 0) v.born = t;
        if (d.state === 0) {
          v.group.visible = true;
          v.group.position.set(d.x, d.y, 0);
          const k = Math.min(1, (t - v.born) / 0.25);
          v.group.scale.setScalar(k);
          if (d.kind === 'coin' || d.kind === 'big') v.spin.rotation.y = t * 5 + d.id;
          else if (d.kind === 'star') {
            v.spin.rotation.y = Math.sin(t * 3 + d.id) * 0.6;
            v.spin.rotation.z = Math.sin(t * 5 + d.id) * 0.2;
            v.group.scale.setScalar(k * (1 + Math.sin(t * 8 + d.id) * 0.07));
          } else if (d.kind === 'stone') {
            v.spin.rotation.x = t * 2.2 + d.id;
            v.spin.rotation.z = t * 1.6;
          } else {
            v.spin.rotation.z = Math.sin(t * 6 + d.id) * 0.25;
            const sp = v.spin.getObjectByName('spark');
            if (sp) sp.scale.setScalar(0.8 + Math.sin(t * 40) * 0.3);
          }
        } else if (v.group.visible) {
          if (d.state === 1) v.group.visible = false;
          else if (!v.falling) {
            // verfehlt: in der Ansicht bis zum Boden weiterfallen
            v.falling = true;
            v.fallY = d.y;
            v.fallV = vy * d.speed * 60;
          }
          if (v.falling) {
            v.fallY -= v.fallV * dt;
            v.group.position.y = v.fallY;
            if (v.fallY <= GROUND + 0.35) {
              v.group.visible = false;
              v.falling = false;
              if (d.kind !== 'bomb') {
                const col = d.kind === 'stone' ? 0xaab0c0 : 0xffd23f;
                ctx.burst(v3.set(d.x, GROUND + 0.3, 0), col, 5);
              }
            }
          }
        }
      }
      // Bomben am Boden
      if (s.blasts !== lastBlasts) {
        lastBlasts = s.blasts;
        groundBlast(s.lastBlast.x, s.lastBlast.near);
        if (s.lastBlast.near) showPop(sprite('-2', '#ff6a7a', undefined, 1.0), s.bx, 1.6);
      }
      for (let i = blastRings.length - 1; i >= 0; i--) {
        const b = blastRings[i]!;
        b.t += dt;
        b.m.scale.setScalar(0.4 + (b.t / 0.5) * BLAST_R);
        (b.m.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.85 * (1 - b.t / 0.5));
        if (b.t > 0.5) {
          b.m.removeFromParent();
          (b.m.material as THREE.Material).dispose();
          blastRings.splice(i, 1);
        }
      }
      // Fänge und Treffer
      if (s.caught !== mine.lastCaught) {
        mine.lastCaught = s.caught;
        const val = s.lastCatch.value;
        const big = val >= 5;
        ctx.burst(v3.set(s.lastCatch.x, 0.5, 0.2), big ? 0xfff06a : 0xffc933, big ? 26 : 12);
        ctx.sfx(big ? 'win' : 'coin');
        showPop(
          sprite('+' + val, big ? '#fff06a' : '#ffffff', undefined, big ? 1.4 : 1.1),
          s.lastCatch.x,
          1.5,
        );
        squash = 1;
      }
      if (s.hits !== mine.lastHits) {
        mine.lastHits = s.hits;
        const bomb = s.lastHit.kind === 'bomb';
        ctx.burst(v3.set(s.lastHit.x, 0.6, 0.2), bomb ? 0xff6a2d : 0xaab0c0, bomb ? 36 : 16);
        ctx.sfx('hit');
        ctx.sfx('bad');
        showPop(sprite(bomb ? '-6' : '-3', '#ff6a7a', undefined, 1.1), s.lastHit.x, 1.5);
        shake = Math.max(shake, bomb ? 0.5 : 0.25);
        squash = 1;
      }
      for (let i = pops.length - 1; i >= 0; i--) {
        const p = pops[i]!;
        p.t += dt;
        p.sp.position.set(p.x, p.y + p.t * p.rise, 0.8);
        p.sp.material.opacity = Math.max(0, 1 - Math.max(0, p.t - p.life * 0.6) / (p.life * 0.4));
        if (p.t >= p.life) {
          p.sp.visible = false;
          p.sp.material.opacity = 1;
          pops.splice(i, 1);
        }
      }

      // Kamera frontal: ganzes Feld in der Breite, Boden bis Wolken in der Höhe; im Hochformat Boden unten
      const aspect = camera.aspect;
      const halfTan = Math.tan((camera.fov * Math.PI) / 360);
      const span = (TOP_Y + 1.2 - (GROUND - 0.9)) / 2;
      const D = Math.max(span / halfTan, (HALF_W + (aspect < 1 ? 0.4 : 0.9)) / (halfTan * aspect));
      const lookY = Math.max((GROUND + TOP_Y) / 2 + 0.15, GROUND - 0.9 + D * halfTan * 0.97);
      shake = Math.max(0, shake - dt);
      camera.position.set(Math.sin(t * 80) * shake * 0.3, lookY + Math.cos(t * 67) * shake * 0.15, D);
      camera.lookAt(0, lookY, 0);
    },
    ghosts(states, dt) {
      updateRivals(rivals, states, dt, (rc, rs, i) => {
        const c = others[i] as Carrier;
        placeCarrier(c, rs, 0.9);
        if (rs.caught > c.lastCaught) {
          ctx.burst(v3.set(rs.bx, BASKET_Y + 0.8, c.z), rc.avatar.color, 4);
          c.lastCaught = rs.caught;
        }
        if (rs.hits > c.lastHits) {
          ctx.burst(v3.set(rs.bx, BASKET_Y + 0.8, c.z), 0x9a9aa8, 6);
          c.lastHits = rs.hits;
        }
      });
      states.forEach((st, i) => {
        (others[i] as Carrier).basket.visible = !!st;
      });
    },
    dispose() {
      sky.dispose();
      goldSky.dispose();
      wallMat.dispose();
      streakMat.dispose();
      for (const sp of spriteCache.values()) {
        sp.material.map?.dispose();
        sp.material.dispose();
      }
    },
  };
};
