import * as THREE from 'three';
import type { FarbState } from '@shared/minigames/games/farbwechsel';
import { COIN_POINTS, COLOR_NAMES, GRID, HALF, TILE, tileCenter } from '@shared/minigames/games/farbwechsel';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';
import { makeMe, makeRivals, updateRivals, type Racer } from './rivals';

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
  const abyss = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 120),
    new THREE.MeshBasicMaterial({ color: 0xff3d7a }),
  );
  abyss.rotation.x = -Math.PI / 2;
  abyss.position.y = -9;
  root.add(abyss);
  const abyss2 = new THREE.Mesh(new THREE.RingGeometry(3, 11, 48), glow(0xffd23f, 0.35));
  abyss2.rotation.x = -Math.PI / 2;
  abyss2.position.y = -8.9;
  root.add(abyss2);
  // Schwebende Felsbrocken tief unten (Tiefe), der Rahmen hält die Arena
  for (let i = 0; i < 10; i++) {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + (i % 3) * 0.3, 0), toon(0x6a46c0));
    const a = (i / 10) * Math.PI * 2;
    rock.position.set(
      Math.cos(a) * (HALF + 7 + (i % 2) * 3),
      -4 - (i % 4) * 1.5,
      Math.sin(a) * (HALF + 6) - 2,
    );
    rock.rotation.set(i, i * 2, 0);
    root.add(rock);
  }
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

  interface TileV {
    g: THREE.Group;
    body: THREE.Mesh;
    sym: THREE.Mesh;
    h: number;
    vy: number;
    color: number;
    rot: number;
  }
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
    tiles.push({ g, body, sym, h: 1, vy: 0, color: ci, rot: ((i * 7) % 5) - 2 });
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

  // Münzen
  const coinGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.12, 22);
  coinGeo.rotateX(Math.PI / 2);
  const coins = [0, 1].map(() => {
    const m = new THREE.Mesh(coinGeo, toon(0xffd23f, { emissive: 0xffa000, emissiveIntensity: 0.45 }));
    root.add(m);
    return m;
  });

  // Figuren: eigene vorne, Mitspieler halbdurchsichtig auf derselben Arena
  const FIG = 0.95;
  const me = makeMe(ctx, FIG);
  const rivals = makeRivals(ctx, FIG * 0.9);
  interface Track {
    x: number;
    y: number;
    dash: number;
    dead: boolean;
    falls: number;
  }
  const track = (st: FarbState): Track => ({
    x: st.px,
    y: st.py,
    dash: st.dash,
    dead: st.dead,
    falls: st.falls,
  });
  const meT = track(initial);
  const rivT = rivals.map(() => track(initial));
  /** Setzt Figur und Animation aus dem Simulationszustand; liefert true, wenn gerade ein Sturz begann */
  const place = (r: Racer, st: FarbState, tr: Track): boolean => {
    const mvx = st.px - tr.x;
    const mvy = st.py - tr.y;
    const moving = Math.hypot(mvx, mvy) > 0.004 && Math.hypot(mvx, mvy) < 1.5;
    const dashP = st.dash > 0 ? 1 - st.dash / 11 : 0;
    const jumpH = st.dash > 0 ? Math.sin(dashP * Math.PI) * 1.2 : 0;
    let fell = false;
    if (st.dead) {
      if (!tr.dead) {
        r.rig.play('shock');
        fell = true;
      }
      r.group.position.set(st.px, 0.25 - st.fallT * st.fallT * 0.006, -st.py);
      r.group.scale.setScalar(Math.max(0.15, 1 - st.fallT * 0.014));
      r.group.rotation.z = st.fallT * 0.08;
    } else {
      if (tr.dead) r.rig.play('jump');
      r.group.scale.setScalar(1);
      r.group.rotation.z = 0;
      r.group.position.set(st.px, 0.25 + jumpH, -st.py);
      if (st.dash > 0 && tr.dash === 0) r.rig.play('jump', { speed: 1.6 });
      else if (st.dash === 0 && r.rig.current !== 'jump' && r.rig.current !== 'shock') {
        if (moving) r.rig.play('run', { loop: true, speed: 1.4 });
        else if (r.rig.current === 'run') r.rig.play('idle', { loop: true });
      }
      if (moving) r.rig.faceTowards(Math.atan2(mvx, -mvy));
    }
    r.ring.visible = !st.dead && st.dash === 0;
    tr.x = st.px;
    tr.y = st.py;
    tr.dash = st.dash;
    tr.dead = st.dead;
    return fell;
  };
  const popups: Array<{ sp: THREE.Sprite; t: number; y0: number }> = [];
  const popup = (text: string, x: number, y: number, color: string, w = 1.8): void => {
    const sp = textSprite(text, { color, size: 72, width: w });
    sp.position.set(x, 2.6, -y);
    root.add(sp);
    popups.push({ sp, t: 0, y0: 2.6 });
  };
  const switchText = textSprite('FARBWECHSEL!', {
    color: '#ffffff',
    bg: 'rgba(30,10,60,0.85)',
    size: 90,
    width: 7,
  });
  switchText.position.set(0, 2.6, -1);
  switchText.visible = false;
  const swBase = switchText.scale.clone();
  root.add(switchText);
  let switchT = 0;
  let shake = 0;
  let lastCoins = initial.coinCount;
  let lastRounds = initial.rounds;
  let wasOver = false;

  let t = 0;
  let lastPhase = initial.phase;
  let lastRound = initial.round;
  let lastTarget = -1;
  let lastTickSec = -1;
  let lastSwitched = initial.switched;
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
        tv.g.position.y =
          -drop + wob + (isTarget && s.phase === 'warn' ? Math.sin(t * 6 + i) * 0.03 + 0.05 : 0);
        tv.g.rotation.z = (1 - tv.h) * tv.rot * 0.7;
        tv.g.rotation.x = (1 - tv.h) * tv.rot * 0.4;
        tv.g.visible = tv.h > 0.02;
        (tv.body.material as THREE.MeshToonMaterial) =
          flash && !present ? toon(0xffffff) : flash ? toon(DARK[ci] as number) : toon(PALETTE[ci] as number);
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
      signGroup.scale.setScalar(1 + Math.max(0, switchT - 0.7) * 0.5 * Math.abs(Math.sin(t * 20)));
      const frac = s.phase === 'warn' ? Math.max(0, s.timer / s.warnLen) : 0;
      bar.scale.x = Math.max(0.001, frac);
      bar.position.x = -3 * (1 - frac);
      barMat.color.setHex(frac < 0.3 ? 0xff4d4d : 0xffffff);

      // Figur
      const fell = place(me, s, meT);
      if (s.over && !wasOver) {
        wasOver = true;
        if (!s.dead) me.rig.play(s.rounds >= 3 ? 'celebrate' : 'cheer');
      }
      me.group.visible = !(s.over && s.dead);
      me.rig.update(dt);
      // Münzen
      coins.forEach((m, i) => {
        const c = s.coins[i];
        m.visible = !!c && !c.taken && s.phase === 'warn';
        if (c) m.position.set(c.x, 0.85 + Math.sin(t * 4 + i) * 0.12, -c.y);
        m.rotation.y = t * 3 + i;
      });
      if (s.coinCount !== lastCoins) {
        lastCoins = s.coinCount;
        ctx.sfx('coin');
        ctx.burst(v3.set(s.px, 1, -s.py), 0xffd23f, 14);
        popup('+' + COIN_POINTS, s.px, s.py, '#ffe066');
      }
      if (s.rounds !== lastRounds) {
        lastRounds = s.rounds;
        popup('+100', s.px, s.py, '#ffffff');
      }
      // Farbwechsel-Finte
      if (s.switched && !lastSwitched) {
        ctx.sfx('beep');
        ctx.sfx('whoosh');
        switchT = 1.3;
        shake = Math.max(shake, 0.3);
      }
      lastSwitched = s.switched;
      if (switchT > 0) {
        switchT -= dt;
        switchText.visible = true;
        switchText.scale.copy(swBase).multiplyScalar(1 + Math.max(0, switchT - 1) * 1.5);
      } else switchText.visible = false;
      for (let i = popups.length - 1; i >= 0; i--) {
        const p = popups[i]!;
        p.t += dt;
        p.sp.position.y = p.y0 + p.t * 1.5;
        p.sp.material.opacity = Math.max(0, 1 - p.t);
        if (p.t > 1) {
          p.sp.removeFromParent();
          p.sp.material.map?.dispose();
          p.sp.material.dispose();
          popups.splice(i, 1);
        }
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
      if (fell) {
        ctx.sfx('bad');
        v3.set(s.px, 0.8, -s.py);
        ctx.burst(v3, 0xff4d4d, 22);
        shake = 0.45;
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
      if (shake > 0) {
        shake = Math.max(0, shake - dt);
        camera.position.x += Math.sin(t * 71) * shake * 0.6;
        camera.position.y += Math.cos(t * 57) * shake * 0.4;
      }
    },
    ghosts(states, dt) {
      updateRivals(rivals, states, dt, (r, st, i) => {
        // Ausgeschiedene Mitspieler verschwinden nach ihrem Sturz
        r.group.visible = !(st.over && st.dead) && !(st.dead && st.fallT > 40);
        if (place(r, st, rivT[i]!)) ctx.burst(v3.set(st.px, 0.6, -st.py), r.avatar.color, 10);
      });
    },
    dispose() {
      ctx.scene.fog = null;
      coinGeo.dispose();
    },
  };
};
