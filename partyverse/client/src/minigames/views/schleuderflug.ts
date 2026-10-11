import * as THREE from 'three';
import type { SlingState } from '@shared/minigames/games/schleuderflug';
import { ANCHOR_X, ANCHOR_Y, GRAVITY, PULL_MAX, X_MAX, speedOf } from '@shared/minigames/games/schleuderflug';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';

const SC = 5;
const wx = (x: number): number => x * SC;
const wy = (y: number): number => y * SC;

interface IslandV {
  g: THREE.Group;
  board: THREE.Group;
  label: THREE.Sprite;
  fall: number;
  hit: boolean;
}

/** Schleuder auf einem Hügel, Zielscheiben auf schwebenden Inseln, Windfahne und Wolken, die mit dem Wind ziehen. */
export const createView: MiniGameViewFactory<SlingState> = (ctx, initial) => {
  const { root, camera } = ctx;
  ctx.scene.background = new THREE.Color(0x79cfff);
  ctx.scene.fog = new THREE.Fog(0xb9e8ff, 45, 110);
  root.add(new THREE.HemisphereLight(0xffffff, 0x9bd37a, 1.5));
  const sunL = new THREE.DirectionalLight(0xfff3d0, 1.5);
  sunL.position.set(-6, 10, 14);
  root.add(sunL);

  // Sonne weit hinten
  const sunDisc = new THREE.Mesh(
    new THREE.CircleGeometry(4, 32),
    new THREE.MeshBasicMaterial({ color: 0xfff1a0, fog: false }),
  );
  sunDisc.position.set(18, 14, -40);
  root.add(sunDisc);
  const sunHalo = new THREE.Mesh(new THREE.CircleGeometry(7, 32), glow(0xfff6c8, 0.35));
  sunHalo.position.set(18, 14, -41);
  root.add(sunHalo);

  // Wolken (ziehen mit dem Wind)
  const clouds: THREE.Group[] = [];
  const cm = toon(0xffffff);
  for (let i = 0; i < 12; i++) {
    const g = new THREE.Group();
    for (let k = 0; k < 4; k++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(1 + (k % 2) * 0.55, 10, 8), cm);
      m.position.set((k - 1.5) * 1.2, (k % 2) * 0.3, 0);
      g.add(m);
    }
    g.position.set(-30 + ((i * 17) % 60), -6 + ((i * 7) % 18), -10 - (i % 4) * 7);
    g.scale.setScalar(1.2 + (i % 3) * 0.5);
    root.add(g);
    clouds.push(g);
  }
  // Wolkenmeer unten
  for (let i = -8; i <= 8; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1.8 + (i % 3) * 0.3, 12, 8), cm);
    m.position.set(i * 2.4, -6.8 + Math.sin(i * 2.1) * 0.4, -1 - (i % 2));
    root.add(m);
  }

  // Hügel mit Schleuder
  const hill = new THREE.Mesh(new THREE.SphereGeometry(5.2, 28, 18), toon(0x5fcf6a));
  hill.scale.set(1.2, 0.75, 1);
  hill.position.set(wx(ANCHOR_X) - 1.4, wy(ANCHOR_Y) - 4.3, 0);
  root.add(hill);
  const slingBase = new THREE.Group();
  slingBase.position.set(wx(ANCHOR_X), wy(ANCHOR_Y) - 0.85, 0);
  root.add(slingBase);
  const wood = toon(0x8a5a2b);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.1, 10), wood);
  stem.position.y = 0.3;
  slingBase.add(stem);
  for (const sx of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.1, 10), wood);
    arm.position.set(sx * 0.3, 1.2, 0);
    arm.rotation.z = -sx * 0.3;
    slingBase.add(arm);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), toon(0xe0302b));
    tip.position.set(sx * 0.46, 1.72, 0);
    slingBase.add(tip);
  }
  const tipL = new THREE.Vector3(wx(ANCHOR_X) - 0.46, wy(ANCHOR_Y) - 0.85 + 1.72, 0.12);
  const tipR = new THREE.Vector3(wx(ANCHOR_X) + 0.46, wy(ANCHOR_Y) - 0.85 + 1.72, -0.12);
  const bandMat = toon(0xff4d8d);
  const bandUnit = new THREE.CylinderGeometry(0.05, 0.05, 1, 6);
  const bandL = new THREE.Mesh(bandUnit, bandMat);
  const bandR = new THREE.Mesh(bandUnit, bandMat);
  root.add(bandL, bandR);
  const place = (m: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3): void => {
    const d = b.clone().sub(a);
    const len = Math.max(0.01, d.length());
    m.position.copy(a).addScaledVector(d, 0.5);
    m.scale.set(1, len, 1);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  };

  // Windfahne
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3, 6), toon(0xffffff));
  pole.position.set(wx(ANCHOR_X) - 2.4, wy(ANCHOR_Y) + 0.2, 0);
  root.add(pole);
  const sock = new THREE.Group();
  sock.position.set(wx(ANCHOR_X) - 2.4, wy(ANCHOR_Y) + 1.6, 0);
  root.add(sock);
  const sockCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 1.8, 10, 1, true),
    new THREE.MeshToonMaterial({ color: 0xff7a3c, side: THREE.DoubleSide }),
  );
  sockCone.rotation.z = -Math.PI / 2;
  sockCone.position.x = 0.9;
  sock.add(sockCone);
  const sockStripe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.31, 0.27, 0.4, 10, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
  );
  sockStripe.rotation.z = -Math.PI / 2;
  sockStripe.position.x = 0.7;
  sock.add(sockStripe);

  // Windstriche
  const streaks: THREE.Mesh[] = [];
  const streakMat = glow(0xffffff, 0.55);
  for (let i = 0; i < 12; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.04), streakMat);
    m.position.set(-8 + ((i * 53) % 16), -4 + ((i * 29) % 9), 0.3);
    root.add(m);
    streaks.push(m);
  }

  // Inseln und Zielscheiben
  const ringCols = [0xe0302b, 0xffffff, 0x3d8bff, 0xffd23f];
  const islands: IslandV[] = initial.islands.map((isl) => {
    const g = new THREE.Group();
    const rock = new THREE.Mesh(new THREE.ConeGeometry(1.15, 1.7, 9), toon(0x9a6b44));
    rock.rotation.x = Math.PI;
    rock.position.y = -1.6;
    g.add(rock);
    const grass = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.25, 0.35, 16), toon(0x5fcf6a));
    grass.position.y = -0.7;
    g.add(grass);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 6), toon(0x8a5a2b));
    post.position.y = -0.3;
    g.add(post);
    const board = new THREE.Group();
    const R = isl.r * SC;
    const radii = [1, 0.74, 0.55, 0.38];
    radii.forEach((k, i) => {
      const d = new THREE.Mesh(
        new THREE.CylinderGeometry(R * k, R * k, 0.1, 28),
        toon(ringCols[i] as number),
      );
      d.rotation.x = Math.PI / 2;
      d.position.z = i * 0.03;
      board.add(d);
    });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.05, 8, 28), toon(0x6b4423));
    board.add(rim);
    g.add(board);
    const label = textSprite(String(isl.pts), {
      color: '#ffffff',
      bg: 'rgba(40,20,90,0.75)',
      size: 56,
      width: 0.95,
    });
    label.position.set(0, R + 0.7, 0.3);
    g.add(label);
    g.position.set(wx(isl.x), wy(isl.y), 0);
    root.add(g);
    return { g, board, label, fall: 0, hit: false };
  });
  // ferne Deko-Inseln
  for (let i = 0; i < 6; i++) {
    const g = new THREE.Group();
    const rock = new THREE.Mesh(new THREE.ConeGeometry(2, 3, 8), toon(0xb08a6a));
    rock.rotation.x = Math.PI;
    g.add(rock);
    const grass = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.2, 0.5, 12), toon(0x7ad87a));
    grass.position.y = 1.6;
    g.add(grass);
    const tree = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.8, 8), toon(0x2fa86a));
    tree.position.y = 2.9;
    g.add(tree);
    g.position.set(-14 + i * 6.5, -4 + (i % 3) * 5, -16 - (i % 2) * 8);
    root.add(g);
  }

  // Geschoss: Fellknäuel
  const proj = new THREE.Group();
  const furBody = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 14), toon(0xff8a3d));
  proj.add(furBody);
  const spikeMat = toon(0xffb347);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const sp = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 6), spikeMat);
    sp.position.set(Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0);
    sp.rotation.z = a - Math.PI / 2;
    proj.add(sp);
  }
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), toon(0xffffff));
    eye.position.set(sx * 0.12, 0.08, 0.28);
    proj.add(eye);
    const pup = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0x1a1030 }),
    );
    pup.position.set(sx * 0.12, 0.08, 0.36);
    proj.add(pup);
  }
  const brow = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, 0.05), toon(0x6b2a10));
  brow.position.set(0, 0.22, 0.3);
  proj.add(brow);
  root.add(proj);

  // Spur und Zielhilfe
  const trail: THREE.Mesh[] = [];
  for (let i = 0; i < 16; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), glow(0xffe3a0, 0.7));
    m.visible = false;
    root.add(m);
    trail.push(m);
  }
  const dots: THREE.Mesh[] = [];
  const dotMat = glow(0xffffff, 0.8);
  for (let i = 0; i < 12; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), dotMat);
    m.visible = false;
    root.add(m);
    dots.push(m);
  }

  // Textblasen
  interface Pop {
    sp: THREE.Sprite;
    t: number;
  }
  const pops: Pop[] = [];
  const popCache = new Map<string, THREE.Sprite[]>();
  const showPop = (text: string, color: string, x: number, y: number, width = 1.9): void => {
    const arr = popCache.get(text) ?? [];
    popCache.set(text, arr);
    let sp = arr.find((q) => !q.visible);
    if (!sp) {
      sp = textSprite(text, { color, size: 64, width });
      sp.visible = false;
      root.add(sp);
      arr.push(sp);
    }
    sp.visible = true;
    sp.position.set(x, y, 1.4);
    pops.push({ sp, t: 0 });
  };

  let t = 0;
  let lastSeq = initial.seq;
  let lastLaunch = initial.launchSeq;
  let trailIdx = 0;
  let trailTimer = 0;
  let squash = 0;
  let wasOver = false;
  const v3 = new THREE.Vector3();
  const pouch = new THREE.Vector3();

  return {
    update(s, dt) {
      t += dt;
      // Kamera: ganze Szene
      const asp = camera.aspect || 1.6;
      const hh = Math.max(5.2, (X_MAX * SC + 0.1) / asp);
      const dist = hh / Math.tan((camera.fov * Math.PI) / 360);
      camera.position.set(0, 0, dist);
      camera.lookAt(0, 0, 0);

      // Wind
      const wnd = s.wind;
      const wk = wnd / 0.42; // -1..1
      sock.rotation.z = wk > 0 ? -0.5 + Math.sin(t * 7) * 0.08 * Math.abs(wk) : 0;
      sock.scale.x = wk >= 0 ? 1 : -1;
      sock.rotation.z =
        (wk >= 0 ? 1 : -1) * (-0.9 + Math.min(1, Math.abs(wk)) * 0.8) + Math.sin(t * 8) * 0.06 * Math.abs(wk);
      sockCone.scale.y = 0.4 + Math.min(1, Math.abs(wk)) * 0.6;
      for (let i = 0; i < clouds.length; i++) {
        const c = clouds[i] as THREE.Group;
        c.position.x += (wnd * 3.5 + 0.25) * dt;
        if (c.position.x > 34) c.position.x = -34;
        if (c.position.x < -34) c.position.x = 34;
      }
      for (let i = 0; i < streaks.length; i++) {
        const m = streaks[i] as THREE.Mesh;
        m.visible = Math.abs(wk) > 0.12;
        m.position.x += wnd * 14 * dt;
        if (m.position.x > 9) m.position.x = -9;
        if (m.position.x < -9) m.position.x = 9;
        m.scale.x = 0.4 + Math.abs(wk);
      }

      // Inseln
      for (let i = 0; i < islands.length; i++) {
        const iv = islands[i] as IslandV;
        const isl = s.islands[i];
        if (!isl) continue;
        iv.g.position.set(wx(isl.x), wy(isl.y) + (isl.bobA ? 0 : Math.sin(t * 1.4 + i) * 0.06), 0);
        if (isl.hit) {
          if (!iv.hit) {
            iv.hit = true;
            iv.fall = 0;
          }
          iv.fall += dt;
          iv.board.rotation.x = Math.min(1.5, iv.fall * 6);
          iv.board.position.y = -iv.fall * iv.fall * 6;
          iv.board.visible = iv.fall < 0.9;
          iv.label.visible = false;
        } else {
          iv.board.rotation.y = Math.sin(t * 1.2 + i) * 0.12;
        }
      }

      // Schleuder und Geschoss
      const drawing = s.phase === 'aim';
      const pull = drawing ? s.pow * PULL_MAX * SC * 0.95 : 0;
      pouch.set(wx(ANCHOR_X) - Math.cos(s.ang) * pull, wy(ANCHOR_Y) - Math.sin(s.ang) * pull, 0);
      if (drawing) {
        place(bandL, tipL, pouch);
        place(bandR, tipR, pouch);
        proj.visible = true;
        proj.position.copy(pouch);
        proj.position.z = 0.8;
        proj.rotation.z = s.ang;
        proj.scale.set(1 + s.pow * 0.12, 1 - s.pow * 0.1, 1);
      } else if (s.proj) {
        pouch.set(wx(ANCHOR_X), wy(ANCHOR_Y), 0);
        place(bandL, tipL, pouch);
        place(bandR, tipR, pouch);
        proj.visible = true;
        proj.position.set(wx(s.proj.x), wy(s.proj.y), 0.8);
        proj.rotation.z += dt * 9;
        const sp = Math.hypot(s.proj.vx, s.proj.vy);
        proj.scale.set(1 + sp * 0.04, 1 - sp * 0.02, 1);
        trailTimer += dt;
        if (trailTimer > 0.04) {
          trailTimer = 0;
          const m = trail[trailIdx % trail.length] as THREE.Mesh;
          trailIdx++;
          m.visible = true;
          m.position.copy(proj.position);
          m.position.z = 0.6;
          m.scale.setScalar(1);
        }
      } else {
        pouch.set(wx(ANCHOR_X), wy(ANCHOR_Y), 0);
        place(bandL, tipL, pouch);
        place(bandR, tipR, pouch);
        proj.visible = false;
      }
      squash = Math.max(0, squash - dt * 4);
      if (squash > 0) bandL.scale.x = bandR.scale.x = 1 + squash;
      else bandL.scale.x = bandR.scale.x = 1;
      for (const m of trail) {
        if (!m.visible) continue;
        m.scale.multiplyScalar(1 - dt * 3.2);
        if (m.scale.x < 0.1) m.visible = false;
      }

      // Zielhilfe: erste Meter der Flugbahn (ohne Wind)
      const showAim = drawing && (s.drawn || s.aimT > 0);
      const v = speedOf(s.pow);
      const vx = Math.cos(s.ang) * v;
      const vy = Math.sin(s.ang) * v;
      for (let i = 0; i < dots.length; i++) {
        const m = dots[i] as THREE.Mesh;
        const tt = (i + 1) * 0.07;
        m.visible = showAim;
        m.position.set(wx(ANCHOR_X + vx * tt), wy(ANCHOR_Y + vy * tt - 0.5 * GRAVITY * tt * tt), 0.2);
        m.scale.setScalar(1 - i * 0.05);
      }
      (dotMat as THREE.MeshBasicMaterial).opacity = s.drawn ? 0.9 : 0.4;

      // Ereignisse
      if (s.launchSeq !== lastLaunch) {
        lastLaunch = s.launchSeq;
        squash = 1;
        ctx.sfx('whoosh');
      }
      if (s.seq !== lastSeq) {
        lastSeq = s.seq;
        const L = s.last;
        v3.set(wx(L.x), wy(L.y), 0.6);
        if (L.hit) {
          ctx.sfx(L.bull ? 'win' : 'good');
          ctx.burst(v3, L.bull ? 0xffd23f : 0xff6b6b, L.bull ? 30 : 18);
          showPop(`+${L.pts}`, L.bull ? '#ffd23f' : '#ffffff', wx(L.x), wy(L.y) + 1.3);
          if (L.bull) showPop('MITTE!', '#ffd23f', wx(L.x), wy(L.y) + 2.3, 2.4);
        } else {
          ctx.sfx('bad');
          ctx.burst(v3, 0xcfe9ff, 10);
        }
      }
      for (let i = pops.length - 1; i >= 0; i--) {
        const p = pops[i] as Pop;
        p.t += dt;
        p.sp.position.y += dt * 1.5;
        p.sp.material.opacity = Math.max(0, 1 - Math.max(0, p.t - 0.7) * 3);
        if (p.t > 1.1) {
          p.sp.visible = false;
          p.sp.material.opacity = 1;
          pops.splice(i, 1);
        }
      }
      if (s.phase === 'over' && !wasOver) {
        wasOver = true;
        ctx.sfx('win');
      }
    },
    dispose() {
      ctx.scene.fog = null;
    },
  };
};
