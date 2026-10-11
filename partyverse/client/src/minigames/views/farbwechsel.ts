import * as THREE from 'three';
import type { FarbState } from '@shared/minigames/games/farbwechsel';
import { COLOR_NAMES, GRID, HALF, TILE, tileCenter } from '@shared/minigames/games/farbwechsel';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';

const PALETTE = [0xff4d5e, 0x3d8bff, 0x35d07f, 0xffd23f, 0xa36bff, 0xff8a3d];
const DARK = [0xc0303f, 0x2565c9, 0x1f9f5c, 0xd9a912, 0x7b45d6, 0xd9661d];

/** Schwebende Fliesen über einem glühenden Abgrund; jede Farbe hat zusätzlich ein Symbol (auch für Farbenblinde). */
export const createView: MiniGameViewFactory<FarbState> = (ctx, initial) => {
  const { root, camera } = ctx;
  ctx.scene.background = new THREE.Color(0x3a1d7a);
  ctx.scene.fog = new THREE.Fog(0x3a1d7a, 34, 80);
  root.add(new THREE.HemisphereLight(0xffffff, 0x8a4fd0, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(-6, 14, 10);
  root.add(key);

  // Abgrund
  const abyss = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshBasicMaterial({ color: 0xff3d7a }));
  abyss.rotation.x = -Math.PI / 2;
  abyss.position.y = -9;
  root.add(abyss);
  const abyss2 = new THREE.Mesh(new THREE.RingGeometry(3, 11, 48), glow(0xffd23f, 0.35));
  abyss2.rotation.x = -Math.PI / 2;
  abyss2.position.y = -8.9;
  root.add(abyss2);
  // Sockel unter der Arena
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.4, 8, 20), toon(0x5b3aa8));
  pillar.position.y = -5;
  root.add(pillar);
  for (const [bx, bz, bw, bd] of [
    [0, -HALF - 0.2, HALF * 2 + 0.8, 0.4],
    [0, HALF + 0.2, HALF * 2 + 0.8, 0.4],
    [-HALF - 0.2, 0, 0.4, HALF * 2],
    [HALF + 0.2, 0, 0.4, HALF * 2],
  ] as const) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.5, bd), toon(0xffffff));
    bar.position.set(bx, -0.05, bz);
    root.add(bar);
  }

  // Symbole je Farbe
  const symGeo = [
    new THREE.CircleGeometry(0.5, 20), // Kreis
    new THREE.CircleGeometry(0.62, 3), // Dreieck
    new THREE.PlaneGeometry(0.8, 0.8), // Quadrat
    new THREE.CircleGeometry(0.66, 4), // Raute
    new THREE.CircleGeometry(0.6, 6), // Sechseck
    new THREE.RingGeometry(0.26, 0.55, 20), // Ring
  ];
  const symMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
  const tileGeo = new THREE.BoxGeometry(TILE - 0.12, 0.5, TILE - 0.12);

  interface TileV { g: THREE.Group; body: THREE.Mesh; sym: THREE.Mesh; h: number; vy: number; color: number; rot: number }
  const tiles: TileV[] = [];
  for (let i = 0; i < GRID * GRID; i++) {
    const g = new THREE.Group();
    const c = tileCenter(i);
    g.position.set(c.x, 0, -c.y);
    const ci = initial.colors[i] ?? 0;
    const body = new THREE.Mesh(tileGeo, toon(PALETTE[ci] as number));
    g.add(body);
    const sym = new THREE.Mesh(symGeo[ci] as THREE.BufferGeometry, symMat);
    sym.rotation.x = -Math.PI / 2;
    sym.position.y = 0.26;
    g.add(sym);
    root.add(g);
    tiles.push({ g, body, sym, h: 1, vy: 0, color: ci, rot: (i * 7) % 5 - 2 });
  }

  // Zielschild
  const signGroup = new THREE.Group();
  signGroup.position.set(0, 4.6, -HALF - 3);
  root.add(signGroup);
  const signBack = new THREE.Mesh(new THREE.BoxGeometry(6.2, 2.2, 0.4), toon(0xffffff));
  signGroup.add(signBack);
  const signCol = new THREE.Mesh(new THREE.BoxGeometry(5.8, 1.8, 0.2), toon(0xff4d5e));
  signCol.position.z = 0.22;
  signGroup.add(signCol);
  const signSym = new THREE.Mesh(symGeo[0] as THREE.BufferGeometry, symMat);
  signSym.position.set(-2.1, 0, 0.36);
  signSym.scale.setScalar(1.3);
  signGroup.add(signSym);
  const names: THREE.Sprite[] = COLOR_NAMES.map((n) => {
    const sp = textSprite(n.toUpperCase(), { color: '#ffffff', size: 80, width: 3.4 });
    sp.position.set(0.7, 0, 0.5);
    sp.visible = false;
    signGroup.add(sp);
    return sp;
  });
  const barBack = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.4, 0.3), toon(0x2a1560));
  barBack.position.set(0, -1.7, 0);
  signGroup.add(barBack);
  const barMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const bar = new THREE.Mesh(new THREE.BoxGeometry(6, 0.26, 0.2), barMat);
  bar.position.set(0, -1.7, 0.18);
  signGroup.add(bar);
  for (const sx of [-2.6, 2.6]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 6, 8), toon(0xdddddd));
    post.position.set(sx, -3, -0.1);
    signGroup.add(post);
  }

  // Figur
  const hero = new THREE.Group();
  const lift = new THREE.Group();
  hero.add(lift);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 18), toon(0x3de0d0));
  body.position.y = 0.75;
  body.scale.set(1, 1.1, 1);
  lift.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.44, 16, 12), toon(0xffffff));
  belly.position.set(0, 0.6, 0.3);
  belly.scale.set(1, 1, 0.5);
  lift.add(belly);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.07, 8, 24), toon(0xff4d8d));
  band.position.y = 1.15;
  band.rotation.x = Math.PI / 2;
  lift.add(band);
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), toon(0xffffff));
    eye.position.set(sx * 0.22, 0.98, 0.5);
    lift.add(eye);
    const pup = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), new THREE.MeshBasicMaterial({ color: 0x1a1030 }));
    pup.position.set(sx * 0.22, 0.98, 0.63);
    lift.add(pup);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), toon(0xff8a3d));
    foot.position.set(sx * 0.28, 0.1, 0.12);
    foot.scale.set(1, 0.55, 1.4);
    lift.add(foot);
    const arm = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), toon(0x2bbcae));
    arm.position.set(sx * 0.68, 0.7, 0);
    arm.name = sx < 0 ? 'armL' : 'armR';
    lift.add(arm);
  }
  const hshadow = new THREE.Mesh(new THREE.CircleGeometry(0.6, 20), glow(0x000000, 0.3));
  hshadow.rotation.x = -Math.PI / 2;
  hshadow.position.y = 0.28;
  root.add(hshadow);
  root.add(hero);

  let t = 0;
  let faceY = 0;
  let lastX = initial.px;
  let lastY = initial.py;
  let lastPhase = initial.phase;
  let lastRound = initial.round;
  let lastTarget = -1;
  let lastDead = false;
  let lastTickSec = -1;
  const v3 = new THREE.Vector3();

  return {
    update(s, dt) {
      t += dt;
      // Fliesen
      const warnLeft = s.phase === 'warn' ? s.timer : 999;
      for (let i = 0; i < tiles.length; i++) {
        const tv = tiles[i] as TileV;
        const ci = s.colors[i] ?? 0;
        if (tv.color !== ci) {
          tv.color = ci;
          tv.body.material = toon(PALETTE[ci] as number);
          tv.sym.geometry = symGeo[ci] as THREE.BufferGeometry;
        }
        const present = s.present[i] ?? true;
        const isTarget = ci === s.target;
        if (present) {
          if (tv.h < 1) {
            tv.vy += dt * 40;
            tv.h = Math.min(1, tv.h + tv.vy * dt * 0.1);
          }
          if (tv.h >= 1) tv.vy = 0;
        } else {
          tv.vy += dt * 30;
          tv.h = Math.max(0, tv.h - dt * 2.2 * (0.5 + tv.vy * 0.1));
        }
        const drop = (1 - tv.h) * 12;
        let wob = 0;
        let flash = 0;
        if (!isTarget && warnLeft < 50) {
          wob = Math.sin(t * 50 + i) * 0.05 * (1 - warnLeft / 50) * 2;
          flash = Math.floor(t * 12 + i) % 2 === 0 ? 1 : 0;
        }
        tv.g.position.y = -drop + wob + (isTarget && s.phase === 'warn' ? Math.sin(t * 6 + i) * 0.03 + 0.05 : 0);
        tv.g.rotation.z = (1 - tv.h) * tv.rot * 0.7;
        tv.g.rotation.x = (1 - tv.h) * tv.rot * 0.4;
        tv.g.visible = tv.h > 0.02;
        (tv.body.material as THREE.MeshToonMaterial) = flash && !present ? toon(0xffffff) : flash ? toon(DARK[ci] as number) : toon(PALETTE[ci] as number);
        if (isTarget && s.phase === 'warn') tv.sym.scale.setScalar(1 + Math.sin(t * 8) * 0.12);
        else tv.sym.scale.setScalar(1);
      }

      // Zielschild
      if (s.target !== lastTarget || s.round !== lastRound) {
        (signCol.material as THREE.MeshToonMaterial) = toon(PALETTE[s.target] as number);
        signSym.geometry = symGeo[s.target] as THREE.BufferGeometry;
        names.forEach((n, i) => (n.visible = i === s.target));
        lastTarget = s.target;
      }
      signGroup.position.y = 4.6 + Math.sin(t * 2) * 0.08;
      const frac = s.phase === 'warn' ? Math.max(0, s.timer / s.warnLen) : 0;
      bar.scale.x = Math.max(0.001, frac);
      bar.position.x = -3 * (1 - frac);
      barMat.color.setHex(frac < 0.3 ? 0xff4d4d : 0xffffff);

      // Figur
      const mvx = s.px - lastX;
      const mvy = s.py - lastY;
      lastX = s.px;
      lastY = s.py;
      const moving = Math.hypot(mvx, mvy) > 0.004;
      if (moving) {
        const target = Math.atan2(mvx, -mvy);
        let d = target - faceY;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        faceY += d * Math.min(1, dt * 16);
      }
      const dashP = s.dash > 0 ? 1 - s.dash / 11 : 0;
      const jumpH = s.dash > 0 ? Math.sin(dashP * Math.PI) * 1.2 : 0;
      const hop = moving && s.dash === 0 ? Math.abs(Math.sin(t * 14)) * 0.14 : 0;
      hero.position.set(s.px, 0.28 + jumpH + hop, -s.py);
      hero.rotation.y = faceY;
      lift.scale.set(1 + (s.dash > 0 ? -0.1 : 0), 1 + (s.dash > 0 ? 0.18 : moving ? Math.sin(t * 28) * 0.04 : Math.sin(t * 3) * 0.02), 1);
      lift.rotation.x = s.dash > 0 ? 0.35 : 0;
      (lift.getObjectByName('armL') as THREE.Object3D).position.y = 0.7 + (moving ? Math.sin(t * 14) * 0.15 : 0) + (s.dash > 0 ? 0.35 : 0);
      (lift.getObjectByName('armR') as THREE.Object3D).position.y = 0.7 - (moving ? Math.sin(t * 14) * 0.15 : 0) + (s.dash > 0 ? 0.35 : 0);
      hshadow.position.set(s.px, 0.3, -s.py);
      hshadow.scale.setScalar(1 - jumpH * 0.25);
      hshadow.visible = !s.dead;
      if (s.dead) {
        hero.position.y = 0.28 - s.fallT * s.fallT * 0.012;
        hero.rotation.z = s.fallT * 0.12;
        hero.scale.setScalar(Math.max(0.2, 1 - s.fallT * 0.012));
      }

      // Ereignisse
      if (s.dash > 0 && s.dash === 11 - 1) {
        ctx.sfx('jump');
        v3.set(s.px, 0.5, -s.py);
        ctx.burst(v3, 0xffffff, 8);
      }
      if (s.phase !== lastPhase) {
        if (s.phase === 'drop') {
          ctx.sfx('whoosh');
          if (!s.dead) {
            ctx.sfx('good');
            v3.set(s.px, 1, -s.py);
            ctx.burst(v3, 0xffd23f, 14);
          }
        }
        if (s.phase === 'warn') ctx.sfx('beep');
        lastPhase = s.phase;
      }
      if (s.dead && !lastDead) {
        lastDead = true;
        ctx.sfx('bad');
        v3.set(s.px, 0.8, -s.py);
        ctx.burst(v3, 0xff4d4d, 22);
      }
      if (s.phase === 'warn') {
        const sec = Math.ceil(s.timer / 60);
        if (sec !== lastTickSec && sec <= 2 && s.timer < 125) {
          ctx.sfx('tick');
        }
        lastTickSec = sec;
      }
      lastRound = s.round;

      // Kamera
      const asp = camera.aspect || 1.6;
      const D0 = 17;
      const h0 = D0 * Math.tan((camera.fov * Math.PI) / 360);
      const f = Math.max(1, 8.2 / (h0 * asp));
      camera.position.set(0, 13.5 * f, 11.5 * f);
      camera.lookAt(0, 0.5, -1.2);
    },
    dispose() {
      ctx.scene.fog = null;
    },
  };
};
