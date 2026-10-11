import * as THREE from 'three';
import type { Drop, MuenzState } from '@shared/minigames/games/muenzregen';
import { BASKET_HW, HALF_W, MAGNET_COOLDOWN, MAGNET_RADIUS, MAGNET_TICKS, TOP_Y } from '@shared/minigames/games/muenzregen';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';

function skyTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 256;
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  const grd = g.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, '#3f6fff');
  grd.addColorStop(0.5, '#8fb9ff');
  grd.addColorStop(0.82, '#ffd6e8');
  grd.addColorStop(1, '#ffe9b0');
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
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 1 });
  g.translate(0, 0, -depth / 2);
  return g;
}

interface DropView {
  group: THREE.Group;
  spin: THREE.Object3D;
  last: number;
  born: number;
}

/** Sonniger Himmel, ein Körbchen-Kerlchen mit Gesicht fängt goldenen Regen; Steine und Bomben sind böse. */
export const createView: MiniGameViewFactory<MuenzState> = (ctx, initial) => {
  const { root, camera, scene } = ctx;
  const sky = skyTexture();
  scene.background = sky;

  // --- Landschaft ----------------------------------------------------------
  const ground = new THREE.Mesh(new THREE.BoxGeometry(80, 30, 40), toon(0x58c95a));
  ground.position.set(0, -16, 4);
  root.add(ground);
  for (let i = -7; i <= 7; i++) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2, 0.05, 14), toon(i % 2 ? 0x6bdc66 : 0x4fbe55));
    stripe.position.set(i * 2, -0.98, -1);
    root.add(stripe);
  }
  const hillMat = [toon(0x3fae6a), toon(0x2f9a7a), toon(0x5ac86e)];
  for (let i = 0; i < 6; i++) {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(3.4 + (i % 3) * 1.3, 24, 14), hillMat[i % 3]!);
    hill.position.set(-17 + i * 6.8, -3.4, -12 - (i % 2) * 3);
    root.add(hill);
  }
  // Sonne
  const sun = new THREE.Mesh(new THREE.CircleGeometry(1.8, 32), glow(0xfff2a0));
  sun.position.set(-8.5, 9.8, -14);
  root.add(sun);
  const sunHalo = new THREE.Mesh(new THREE.CircleGeometry(3.2, 32), glow(0xfff2a0, 0.25));
  sunHalo.position.copy(sun.position);
  sunHalo.position.z -= 0.1;
  root.add(sunHalo);
  // Wolken (hier fällt der Regen heraus)
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

  // --- Körbchen ----------------------------------------------------------------
  const basket = new THREE.Group();
  const inner = new THREE.Group();
  basket.add(inner);
  const weave = toon(0xc98a45);
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(BASKET_HW + 0.12, BASKET_HW - 0.2, 0.95, 24, 1, true), weave);
  (wall.material as THREE.MeshToonMaterial).side = THREE.DoubleSide;
  wall.position.y = 0.48;
  inner.add(wall);
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(BASKET_HW - 0.2, 20), toon(0x6a4220));
  bottom.rotation.x = -Math.PI / 2;
  bottom.position.y = 0.06;
  inner.add(bottom);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(BASKET_HW + 0.12, 0.1, 8, 28), toon(0xe9b15f));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.95;
  inner.add(rim);
  for (let k = 0; k < 3; k++) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(BASKET_HW - 0.03 + (k - 1) * 0.0 + (k * 0.04), 0.035, 6, 24), toon(0x8a5a28));
    band.rotation.x = Math.PI / 2;
    band.position.y = 0.2 + k * 0.28;
    band.scale.setScalar(1 + k * 0.045);
    inner.add(band);
  }
  const eyes: THREE.Mesh[] = [];
  const pupils: THREE.Mesh[] = [];
  for (const sx of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), toon(0xffffff));
    e.position.set(sx * 0.32, 0.55, BASKET_HW - 0.05);
    inner.add(e);
    eyes.push(e);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), toon(0x2a1a10));
    p.position.set(sx * 0.32, 0.55, BASKET_HW + 0.12);
    inner.add(p);
    pupils.push(p);
    const cheek = new THREE.Mesh(new THREE.CircleGeometry(0.1, 10), glow(0xff8a8a, 0.7));
    cheek.position.set(sx * 0.6, 0.38, BASKET_HW - 0.02);
    cheek.rotation.y = sx * 0.5;
    inner.add(cheek);
  }
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), toon(0x4a1620));
  mouth.position.set(0, 0.33, BASKET_HW + 0.03);
  mouth.scale.set(1.2, 0.5, 0.4);
  inner.add(mouth);
  // Magnet-Hufeisen am Körbchen
  const magnet = new THREE.Group();
  const horseshoe = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.1, 8, 16, Math.PI), toon(0xff4d4d));
  horseshoe.rotation.z = Math.PI;
  magnet.add(horseshoe);
  for (const sx of [-1, 1]) {
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.2, 8), toon(0xdddddd));
    tip.position.set(sx * 0.28, 0.12, 0);
    magnet.add(tip);
  }
  magnet.position.set(0, 1.55, 0);
  basket.add(magnet);
  basket.position.set(0, -0.5, 0);
  root.add(basket);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.1, 20), glow(0x1a3a1a, 0.35));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, -0.97, 0.2);
  root.add(shadow);
  // Magnet-Welle und Abklingleiste
  const wave = new THREE.Mesh(new THREE.RingGeometry(0.92, 1.0, 40), glow(0x6aa8ff, 0.7));
  wave.visible = false;
  root.add(wave);
  const barBg = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.14), glow(0x20304a, 0.6));
  const barFg = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.14), glow(0x6aa8ff));
  barFg.position.z = 0.01;
  const bar = new THREE.Group();
  bar.add(barBg, barFg);
  bar.position.z = 1.4;
  root.add(bar);

  // --- Fallobjekte ---------------------------------------------------------------
  const coinGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.13, 22);
  const coinInner = new THREE.CylinderGeometry(0.29, 0.29, 0.15, 18);
  const coinRim = new THREE.TorusGeometry(0.42, 0.045, 6, 22);
  const starGeo = starGeometry(0.62, 0.3, 0.22);
  const rockGeo = new THREE.DodecahedronGeometry(0.52, 0);
  const bombGeo = new THREE.SphereGeometry(0.46, 18, 14);
  const views = new Map<number, DropView>();
  function makeDrop(d: Drop): DropView {
    const group = new THREE.Group();
    const spin = new THREE.Group();
    group.add(spin);
    if (d.kind === 'coin') {
      const c = new THREE.Mesh(coinGeo, toon(0xffc933, { emissive: 0xffa000, emissiveIntensity: 0.25 }));
      c.rotation.x = Math.PI / 2;
      const i2 = new THREE.Mesh(coinInner, toon(0xffe27a));
      i2.rotation.x = Math.PI / 2;
      const r = new THREE.Mesh(coinRim, toon(0xffa51f));
      spin.add(c, i2, r);
    } else if (d.kind === 'star') {
      const st = new THREE.Mesh(starGeo, toon(0xffe04a, { emissive: 0xffb000, emissiveIntensity: 0.5 }));
      spin.add(st);
      const halo = new THREE.Mesh(new THREE.CircleGeometry(0.95, 20), glow(0xfff2a0, 0.3));
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
    return { group, spin, last: 0, born: -1 };
  }

  const popups: Array<{ sp: THREE.Sprite; t: number }> = [];
  function popup(text: string, x: number, color: string): void {
    const sp = textSprite(text, { color, size: 72, width: 1.4 });
    sp.position.set(x, 1.7, 1);
    root.add(sp);
    popups.push({ sp, t: 0 });
  }

  let t = 0;
  let lastCaught = initial.caught;
  let lastHits = initial.hits;
  let lastMagnet = 0;
  let squash = 0;
  let shake = 0;
  const v3 = new THREE.Vector3();
  const camPos = new THREE.Vector3();

  return {
    update(s, dt) {
      t += dt;
      clouds.forEach((c, i) => (c.position.x += Math.sin(t * 0.2 + i) * dt * 0.25));
      sunHalo.scale.setScalar(1 + Math.sin(t * 1.5) * 0.04);

      // Körbchen
      const stunned = s.stun > 0;
      basket.position.x = s.bx;
      basket.rotation.z = -s.bvx * 0.022 + (stunned ? Math.sin(t * 30) * 0.18 : 0);
      squash = Math.max(0, squash - dt * 4);
      const sq = Math.sin(squash * Math.PI) * 0.18;
      inner.scale.set(1 + sq * 0.6, 1 - sq, 1 + sq * 0.6);
      pupils.forEach((p, i) => (p.position.x = (i === 0 ? -0.32 : 0.32) + Math.max(-0.07, Math.min(0.07, s.bvx * 0.012))));
      // Mund geht auf, wenn etwas Gutes nahe kommt
      let open = 0.5;
      for (const d of s.drops) {
        if (d.t0 > s.tick) break;
        if (d.state !== 0 || d.y > 3.2 || d.y < 0) continue;
        if (Math.abs(d.x - s.bx) < BASKET_HW + 1) open = d.kind === 'coin' || d.kind === 'star' ? 1.5 : 0.25;
      }
      mouth.scale.y += (open - mouth.scale.y) * Math.min(1, dt * 14);
      shadow.position.x = s.bx;
      // Magnet
      const mg = s.magnet / MAGNET_TICKS;
      magnet.visible = s.cooldown === 0 || s.magnet > 0;
      magnet.rotation.y = t * 2;
      magnet.position.y = 1.5 + Math.sin(t * 4) * 0.08;
      wave.visible = s.magnet > 0;
      if (s.magnet > 0) {
        const k = 1 - mg;
        wave.position.set(s.bx, 1.2, 0);
        wave.scale.setScalar(0.5 + k * MAGNET_RADIUS * 1.0);
        (wave.material as THREE.MeshBasicMaterial).opacity = 0.7 * mg;
      }
      if (s.magnet > lastMagnet) {
        ctx.sfx('whoosh');
        ctx.burst(v3.set(s.bx, 1.2, 0), 0x6aa8ff, 16);
      }
      lastMagnet = s.magnet;
      const ready = 1 - s.cooldown / MAGNET_COOLDOWN;
      bar.position.set(s.bx, -0.78, 1.4);
      barFg.scale.x = Math.max(0.001, ready);
      barFg.position.x = -0.9 * (1 - ready);
      (barFg.material as THREE.MeshBasicMaterial).color.setHex(ready >= 1 ? 0x6dff9a : 0x6aa8ff);

      // Fallobjekte
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
          if (d.kind === 'coin') v.spin.rotation.y = t * 5 + d.id;
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
        } else {
          if (v.group.visible) {
            v.group.visible = false;
            if (d.state === 2) {
              const col = d.kind === 'coin' || d.kind === 'star' ? 0xffd23f : d.kind === 'bomb' ? 0xff8a3d : 0xaab0c0;
              ctx.burst(v3.set(d.x, -0.8, 0), col, 5);
            }
          }
        }
      }
      // Ereignisse
      if (s.caught !== lastCaught) {
        lastCaught = s.caught;
        const v = s.lastCatch.value;
        ctx.burst(v3.set(s.lastCatch.x, 0.5, 0.2), v >= 5 ? 0xfff06a : 0xffc933, v >= 5 ? 26 : 12);
        ctx.sfx(v >= 5 ? 'win' : 'coin');
        popup('+' + v, s.lastCatch.x, v >= 5 ? '#fff06a' : '#ffffff');
        squash = 1;
      }
      if (s.hits !== lastHits) {
        lastHits = s.hits;
        const bomb = s.lastHit.kind === 'bomb';
        ctx.burst(v3.set(s.lastHit.x, 0.6, 0.2), bomb ? 0xff6a2d : 0xaab0c0, bomb ? 36 : 16);
        ctx.sfx('hit');
        ctx.sfx('bad');
        popup(bomb ? '-6' : '-3', s.lastHit.x, '#ff6a7a');
        shake = bomb ? 0.5 : 0.25;
        squash = 1;
      }
      for (let i = popups.length - 1; i >= 0; i--) {
        const p = popups[i]!;
        p.t += dt;
        p.sp.position.y = 1.7 + p.t * 1.8;
        p.sp.material.opacity = Math.max(0, 1 - p.t / 0.8);
        if (p.t > 0.8) {
          p.sp.removeFromParent();
          p.sp.material.map?.dispose();
          p.sp.material.dispose();
          popups.splice(i, 1);
        }
      }

      // Kamera frontal, Breite hat Vorrang
      const aspect = camera.aspect;
      const D = Math.max(12.5, (HALF_W + 0.9) / (0.466 * aspect));
      shake = Math.max(0, shake - dt);
      camPos.set(Math.sin(t * 80) * shake * 0.3, 4.6 + (D > 14 ? (D - 14) * 0.18 : 0), D);
      camera.position.copy(camPos);
      camera.lookAt(0, 4.2 + (D > 14 ? (D - 14) * 0.15 : 0), 0);
    },
    dispose() {
      sky.dispose();
    },
  };
};
