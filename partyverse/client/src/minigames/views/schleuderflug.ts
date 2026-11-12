import * as THREE from 'three';
import type { Island, SlingState } from '@shared/minigames/games/schleuderflug';
import {
  ANCHOR_X,
  ANCHOR_Y,
  GRAVITY,
  PULL_MAX,
  WIND_MAX,
  X_MAX,
  speedOf,
} from '@shared/minigames/games/schleuderflug';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';
import { makeMe, makeRivals, updateRivals, type Racer } from './rivals';

/** Abstand Kamera → Spielebene; das Spielfeld wird genau auf die sichtbare Fläche gelegt (Zeiger = Schleuderbeutel) */
const CAM_D = 16;

interface IslandV {
  id: number;
  g: THREE.Group;
  board: THREE.Group;
  boardMats: THREE.MeshToonMaterial[];
  halo: THREE.Mesh;
  label: THREE.Sprite | null;
  labelText: string;
  fall: number;
  hit: boolean;
}

/**
 * Schleuder auf einem Hügel, Zielscheiben auf schwebenden Inseln, Windfahne und Wolken, die mit dem Wind ziehen.
 * Die eigene Figur sitzt im Schleuderbeutel und fliegt selbst; Mitspieler fliegen halbdurchsichtig mit.
 */
export const createView: MiniGameViewFactory<SlingState> = (ctx, initial) => {
  const { root, camera } = ctx;
  ctx.scene.background = new THREE.Color(0x79cfff);
  ctx.scene.fog = new THREE.Fog(0xb9e8ff, 50, 120);
  root.add(new THREE.HemisphereLight(0xffffff, 0x9bd37a, 1.5));
  const sunL = new THREE.DirectionalLight(0xfff3d0, 1.5);
  sunL.position.set(-6, 10, 14);
  root.add(sunL);

  let kx = 5;
  let ky = 5;
  let S = 5;
  let halfW = 8;
  let halfH = 6;
  const wx = (x: number): number => x * kx;
  const wy = (y: number): number => y * ky;

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
  for (let i = 0; i < 8; i++) {
    const g = new THREE.Group();
    for (let k = 0; k < 4; k++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(1 + (k % 2) * 0.55, 10, 8), cm);
      m.position.set((k - 1.5) * 1.2, (k % 2) * 0.3, 0);
      g.add(m);
    }
    g.position.set(-30 + ((i * 17) % 60), -6 + ((i * 7) % 22), -26 - (i % 4) * 6);
    g.scale.setScalar(1.4 + (i % 3) * 0.5);
    root.add(g);
    clouds.push(g);
  }
  // Wolkenmeer unten
  const cloudSea = new THREE.Group();
  for (let i = -12; i <= 12; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1.8 + (Math.abs(i) % 3) * 0.3, 12, 8), cm);
    m.position.set(i * 2.4, Math.sin(i * 2.1) * 0.4, -1 - (Math.abs(i) % 2));
    cloudSea.add(m);
  }
  root.add(cloudSea);

  // Hügel mit Schleuder
  const hill = new THREE.Mesh(new THREE.SphereGeometry(5.2, 28, 18), toon(0x5fcf6a));
  hill.scale.set(1.2, 0.75, 1);
  root.add(hill);
  const slingBase = new THREE.Group();
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
  const tipL = new THREE.Vector3();
  const tipR = new THREE.Vector3();
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
  const windG = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3, 6), toon(0xffffff));
  windG.add(pole);
  const sock = new THREE.Group();
  sock.position.y = 1.4;
  windG.add(sock);
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
  root.add(windG);

  // Großer Windpfeil oben (gut lesbar)
  const arrowG = new THREE.Group();
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
  const shaft = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.22), arrowMat);
  shaft.position.x = -0.1;
  const head = new THREE.Mesh(new THREE.CircleGeometry(0.36, 3), arrowMat);
  head.position.x = 0.45;
  const plate = new THREE.Mesh(
    new THREE.CircleGeometry(0.75, 28),
    new THREE.MeshBasicMaterial({ color: 0x1d2a6b, transparent: true, opacity: 0.35 }),
  );
  plate.position.z = -0.05;
  plate.scale.set(1.3, 0.75, 1);
  arrowG.add(plate, shaft, head);
  arrowG.renderOrder = 10;
  root.add(arrowG);

  // Windstriche
  const streaks: THREE.Mesh[] = [];
  const streakMat = glow(0xffffff, 0.55);
  for (let i = 0; i < 16; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.04), streakMat);
    m.position.set(-12 + ((i * 53) % 24), -5 + ((i * 29) % 11), 0.3);
    root.add(m);
    streaks.push(m);
  }

  // ferne Deko-Inseln
  for (let i = 0; i < 4; i++) {
    const g = new THREE.Group();
    const rock = new THREE.Mesh(new THREE.ConeGeometry(2, 3, 8), toon(0xc9b8d8));
    rock.rotation.x = Math.PI;
    g.add(rock);
    const grass = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.2, 0.5, 12), toon(0xb8e6c8));
    grass.position.y = 1.6;
    g.add(grass);
    const tree = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.8, 8), toon(0x9fd6b8));
    tree.position.y = 2.9;
    g.add(tree);
    g.position.set(-24 + i * 16, -6 + (i % 3) * 6, -60 - (i % 2) * 10);
    root.add(g);
  }

  // Inseln und Zielscheiben (Einheitsgröße R = 1, beim Zeichnen skaliert)
  const ringCols = [0xe0302b, 0xffffff, 0x3d8bff, 0xffd23f];
  const goldCols = [0xffb300, 0xfff3b0, 0xffd23f, 0xffffff];
  const labelCache = new Map<string, THREE.Sprite[]>();
  const getLabel = (text: string, gold: boolean): THREE.Sprite => {
    const key = `${text}|${gold}`;
    const arr = labelCache.get(key) ?? [];
    labelCache.set(key, arr);
    let sp = arr.find((q) => !q.parent);
    if (!sp) {
      sp = textSprite(text, {
        color: gold ? '#3a2200' : '#ffffff',
        bg: gold ? 'rgba(255,210,63,0.95)' : 'rgba(40,20,90,0.78)',
        size: 56,
        width: gold ? 1.5 : 1,
      });
      arr.push(sp);
    }
    return sp;
  };
  const buildIsland = (id: number): IslandV => {
    const g = new THREE.Group();
    const land = new THREE.Group();
    const rock = new THREE.Mesh(new THREE.ConeGeometry(1.15, 1.7, 9), toon(0x9a6b44));
    rock.rotation.x = Math.PI;
    rock.position.y = -2.1;
    land.add(rock);
    const grass = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.25, 0.35, 16), toon(0x5fcf6a));
    grass.position.y = -1.2;
    land.add(grass);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 6), toon(0x8a5a2b));
    post.position.y = -1.0;
    land.add(post);
    land.scale.setScalar(0.55);
    g.add(land);
    const board = new THREE.Group();
    const boardMats: THREE.MeshToonMaterial[] = [];
    [1, 0.74, 0.5, 0.28].forEach((k, i) => {
      const mat = new THREE.MeshToonMaterial({ color: ringCols[i] as number });
      boardMats.push(mat);
      const d = new THREE.Mesh(new THREE.CylinderGeometry(k, k, 0.1, 28), mat);
      d.rotation.x = Math.PI / 2;
      d.position.z = i * 0.03;
      board.add(d);
    });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.06, 8, 28), toon(0x6b4423));
    board.add(rim);
    g.add(board);
    const halo = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.45, 32), glow(0xfff1a0, 0.7));
    halo.position.z = -0.1;
    halo.visible = false;
    board.add(halo);
    root.add(g);
    return { id, g, board, boardMats, halo, label: null, labelText: '', fall: 0, hit: false };
  };
  const islandViews = new Map<number, IslandV>();
  const falling: IslandV[] = [];

  // Figuren: ich sitze im Schleuderbeutel, Mitspieler warten neben der Schleuder
  const FIG = 0.55;
  const me = makeMe(ctx, FIG);
  me.ring.visible = false;
  me.rig.setTrail(ctx.me.color);
  const rivals: Racer[] = makeRivals(ctx, FIG * 0.8);
  rivals.forEach((r) => (r.ring.visible = false));
  const rivalPhase = rivals.map(() => '');
  const rivalSeq = rivals.map(() => -1);

  // Spur und Zielhilfe
  const trail: THREE.Mesh[] = [];
  for (let i = 0; i < 18; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), glow(0xffe3a0, 0.7));
    m.visible = false;
    root.add(m);
    trail.push(m);
  }
  const dots: THREE.Mesh[] = [];
  const dotMat = glow(0xffffff, 0.8);
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), dotMat);
    m.visible = false;
    root.add(m);
    dots.push(m);
  }
  // kleine Punkte der Mitspieler-Flugbahnen
  const rivalDots: THREE.Mesh[][] = ctx.rivals.map((a) => {
    const mat = glow(a.color, 0.55);
    const arr: THREE.Mesh[] = [];
    for (let i = 0; i < 10; i++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), mat);
      m.visible = false;
      root.add(m);
      arr.push(m);
    }
    return arr;
  });
  const rivalDotIdx = ctx.rivals.map(() => 0);

  // Textblasen
  interface Pop {
    sp: THREE.Sprite;
    t: number;
    vy: number;
  }
  const pops: Pop[] = [];
  const popCache = new Map<string, THREE.Sprite[]>();
  const showPop = (text: string, color: string, x: number, y: number, width = 1.9, bg?: string): void => {
    const key = `${text}|${color}|${bg ?? ''}`;
    const arr = popCache.get(key) ?? [];
    popCache.set(key, arr);
    let sp = arr.find((q) => !q.visible);
    if (!sp) {
      sp = textSprite(text, { color, size: 64, width, bg });
      sp.visible = false;
      root.add(sp);
      arr.push(sp);
    }
    sp.visible = true;
    sp.position.set(x, y, 2.4);
    pops.push({ sp, t: 0, vy: 1.5 });
  };

  let t = 0;
  let lastSeq = initial.seq;
  let lastLaunch = initial.launchSeq;
  let lastWind = initial.wind;
  let trailIdx = 0;
  let trailTimer = 0;
  let squash = 0;
  let shake = 0;
  let wasOver = false;
  let lastAspect = -1;
  let spin = 0;
  const v3 = new THREE.Vector3();
  const pouch = new THREE.Vector3();
  const anchor = new THREE.Vector3();

  const layout = (): void => {
    const asp = camera.aspect || 1.6;
    halfH = CAM_D * Math.tan((camera.fov * Math.PI) / 360);
    halfW = halfH * asp;
    kx = halfW / X_MAX;
    ky = halfH;
    S = asp < 1 ? Math.min(ky, kx * 1.35) : Math.min(kx, ky);
    anchor.set(wx(ANCHOR_X), wy(ANCHOR_Y), 0);
    const k = S / 6;
    slingBase.scale.setScalar(k);
    slingBase.position.set(anchor.x, anchor.y - 1.55 * k, 0);
    tipL.set(anchor.x - 0.46 * k, anchor.y + 0.17 * k, 0.12);
    tipR.set(anchor.x + 0.46 * k, anchor.y + 0.17 * k, -0.12);
    const hk = Math.max(k, 0.45);
    hill.scale.set(1.2 * hk, 0.75 * hk, 0.3);
    hill.position.set(anchor.x - 1.6 * k, anchor.y - 1.55 * k - 3.9 * hk, -1.4);
    windG.scale.setScalar(Math.max(0.55, k));
    windG.position.set(Math.max(-halfW + 0.5, anchor.x - 2.6 * k), anchor.y - 0.2 * k, -0.3);
    cloudSea.position.set(0, -halfH - 0.6, 0);
    arrowG.position.set(0, halfH - (asp < 1 ? 3.2 : 1.6), 1);
    me.group.scale.setScalar(Math.max(0.7, S / 6));
  };

  return {
    update(s, dt) {
      t += dt;
      if (Math.abs((camera.aspect || 1.6) - lastAspect) > 1e-3) {
        lastAspect = camera.aspect || 1.6;
        layout();
      }
      shake = Math.max(0, shake - dt * 2.5);
      const sx = shake > 0 ? Math.sin(t * 57) * shake * 0.3 : 0;
      const sy = shake > 0 ? Math.cos(t * 43) * shake * 0.25 : 0;
      camera.position.set(sx, sy, CAM_D);
      camera.lookAt(sx * 0.5, sy * 0.5, 0);

      // Wind
      const wnd = s.wind;
      const wk = wnd / WIND_MAX; // -1..1
      sock.scale.x = wk >= 0 ? 1 : -1;
      sock.rotation.z =
        (wk >= 0 ? 1 : -1) * (-0.9 + Math.min(1, Math.abs(wk)) * 0.8) + Math.sin(t * 8) * 0.06 * Math.abs(wk);
      sockCone.scale.y = 0.4 + Math.min(1, Math.abs(wk)) * 0.6;
      const ak = Math.min(1, halfW / 7);
      arrowG.scale.set(
        (wk >= 0 ? 1 : -1) * (0.8 + Math.abs(wk) * 1.8) * ak,
        (1 + Math.abs(wk) * 0.4) * ak,
        1,
      );
      arrowG.position.x = Math.sin(t * 3) * 0.15 * Math.abs(wk);
      arrowMat.color.setHex(Math.abs(wk) > 0.66 ? 0xff7a3c : Math.abs(wk) > 0.33 ? 0xffe36e : 0xffffff);
      if (wnd !== lastWind) {
        lastWind = wnd;
        ctx.sfx('whoosh');
        showPop('Wind dreht!', '#ffffff', 0, halfH - 2.6, 2.6, 'rgba(40,20,90,0.7)');
      }
      for (const c of clouds) {
        c.position.x += (wnd * 4 + 0.2) * dt;
        if (c.position.x > 34) c.position.x = -34;
        if (c.position.x < -34) c.position.x = 34;
      }
      for (const m of streaks) {
        m.visible = Math.abs(wk) > 0.12;
        m.position.x += wnd * 16 * dt;
        if (m.position.x > halfW + 1) m.position.x = -halfW - 1;
        if (m.position.x < -halfW - 1) m.position.x = halfW + 1;
        m.scale.x = 0.4 + Math.abs(wk) * 1.4;
      }

      // Inseln
      const seen = new Set<number>();
      for (const isl of s.islands as Island[]) {
        if (isl.respawn > 0) continue;
        seen.add(isl.id);
        let iv = islandViews.get(isl.id);
        if (!iv) {
          iv = buildIsland(isl.id);
          islandViews.set(isl.id, iv);
        }
        const R = isl.r;
        // Scheibe zeigt genau die Trefferfläche (im Hochformat leicht gestreckt)
        const rx = R * kx;
        const ry = Math.min(R * ky, rx * 1.8);
        const pop = Math.min(1, isl.age / 12);
        const k = pop < 1 ? pop * (1.25 - 0.25 * pop) : 1;
        iv.g.position.set(wx(isl.x), wy(isl.y), 0);
        iv.board.scale.set(rx * k, ry * k, Math.max(rx, 0.3));
        const land = iv.g.children[0] as THREE.Object3D;
        land.scale.setScalar(Math.max(0.35, rx) * k);
        land.position.y = -(ry - rx) * 0.9;
        const gold = isl.gold > 0;
        const blink = gold && isl.gold < 60 && Math.sin(t * 20) > 0;
        iv.halo.visible = gold && !blink;
        iv.halo.rotation.z = t * 2;
        iv.boardMats.forEach((m, i) =>
          m.color.setHex(((gold && !blink ? goldCols : ringCols)[i] as number) ?? 0xffffff),
        );
        iv.board.rotation.y = Math.sin(t * 1.2 + isl.id) * 0.15;
        const text = gold ? `${isl.pts}×2` : String(isl.pts);
        if (text !== iv.labelText) {
          if (iv.label) iv.g.remove(iv.label);
          iv.label = getLabel(text, gold);
          iv.g.add(iv.label);
          iv.labelText = text;
        }
        if (iv.label) {
          const lw = gold ? 1.5 : 1;
          const ls = Math.max(0.8, S / 6.5);
          iv.label.scale.set(lw * ls, 0.42 * ls, 1);
          iv.label.position.set(0, ry * k + 0.55 * ls, 0.4);
        }
      }
      for (const [id, iv] of islandViews) {
        if (seen.has(id)) continue;
        islandViews.delete(id);
        iv.fall = 0;
        if (iv.label) iv.g.remove(iv.label);
        iv.label = null;
        falling.push(iv);
      }
      for (let i = falling.length - 1; i >= 0; i--) {
        const iv = falling[i] as IslandV;
        iv.fall += dt;
        iv.board.rotation.x = Math.min(1.5, iv.fall * 6);
        iv.g.position.y -= dt * (2 + iv.fall * 14);
        iv.g.scale.setScalar(Math.max(0.01, 1 - iv.fall));
        if (iv.fall > 1) {
          falling.splice(i, 1);
          root.remove(iv.g);
          iv.boardMats.forEach((m) => m.dispose());
        }
      }

      // Schleuder, eigene Figur als Geschoss
      const drawing = s.phase === 'aim';
      const pull = drawing ? s.pow * PULL_MAX : 0;
      pouch.set(wx(ANCHOR_X - Math.cos(s.ang) * pull), wy(ANCHOR_Y - Math.sin(s.ang) * pull), 0);
      const figScale = me.group.scale.x;
      if (drawing) {
        place(bandL, tipL, pouch);
        place(bandR, tipR, pouch);
        me.group.visible = true;
        me.group.position.set(pouch.x, pouch.y - 0.35 * figScale, 0.8);
        me.group.rotation.z = 0;
        me.rig.faceTowards(Math.PI / 2);
        if (s.drawn && me.rig.current !== 'shock') me.rig.play('shock', { speed: 0.6 });
        else if (!s.drawn && me.rig.current !== 'idle' && me.rig.current !== 'jump')
          me.rig.play('idle', { loop: true });
      } else if (s.proj) {
        place(bandL, tipL, anchor);
        place(bandR, tipR, anchor);
        me.group.visible = true;
        spin -= dt * 14;
        // Figur dreht sich um ihre Mitte
        const c = 0.45 * figScale;
        me.group.rotation.z = spin;
        me.group.position.set(wx(s.proj.x) + Math.sin(spin) * c, wy(s.proj.y) - Math.cos(spin) * c, 0.8);
        if (me.rig.current !== 'roll') me.rig.play('roll', { loop: true });
        trailTimer += dt;
        if (trailTimer > 0.035) {
          trailTimer = 0;
          const m = trail[trailIdx % trail.length] as THREE.Mesh;
          trailIdx++;
          m.visible = true;
          m.position.set(wx(s.proj.x), wy(s.proj.y), 0.6);
          m.scale.setScalar(1.3);
        }
      } else {
        place(bandL, tipL, anchor);
        place(bandR, tipR, anchor);
        me.group.visible = s.phase !== 'wait';
        me.group.rotation.z = 0;
      }
      squash = Math.max(0, squash - dt * 4);
      bandL.scale.x = bandR.scale.x = 1 + squash;
      for (const m of trail) {
        if (!m.visible) continue;
        m.scale.multiplyScalar(1 - dt * 3.2);
        if (m.scale.x < 0.1) m.visible = false;
      }
      me.rig.update(dt);

      // Zielhilfe: erste Meter der Flugbahn (ohne Wind)
      const showAim = drawing;
      const v = speedOf(s.pow);
      const vx = Math.cos(s.ang) * v;
      const vy = Math.sin(s.ang) * v;
      for (let i = 0; i < dots.length; i++) {
        const m = dots[i] as THREE.Mesh;
        const tt = (i + 1) * 0.055;
        m.visible = showAim;
        m.position.set(wx(ANCHOR_X + vx * tt), wy(ANCHOR_Y + vy * tt - 0.5 * GRAVITY * tt * tt), 0.2);
        m.scale.setScalar((1 - i * 0.05) * Math.max(0.8, S / 6));
      }
      dotMat.opacity = s.drawn ? 0.95 : 0.45;

      // Ereignisse
      if (s.launchSeq !== lastLaunch) {
        lastLaunch = s.launchSeq;
        squash = 1;
        spin = 0;
        ctx.sfx('whoosh');
      }
      if (s.seq !== lastSeq) {
        lastSeq = s.seq;
        const L = s.last;
        v3.set(wx(L.x), wy(L.y), 0.6);
        if (L.hit) {
          ctx.sfx(L.bull || L.gold ? 'win' : 'good');
          ctx.burst(v3, L.gold ? 0xffd23f : L.bull ? 0xffe36e : 0xff6b6b, L.bull || L.gold ? 32 : 18);
          showPop(`+${L.pts}`, L.bull || L.gold ? '#ffd23f' : '#ffffff', v3.x, v3.y + 1.3);
          if (L.bull) showPop('MITTE!', '#3a2200', v3.x, v3.y + 2.4, 2.4, 'rgba(255,210,63,0.95)');
          if (L.streak >= 2)
            showPop(
              `Serie ${L.streak}!`,
              '#ffffff',
              v3.x,
              v3.y + (L.bull ? 3.4 : 2.4),
              2.6,
              'rgba(255,61,127,0.9)',
            );
          shake = L.gold || L.bull ? 0.6 : 0.35;
        } else {
          ctx.sfx('bad');
          ctx.burst(v3, 0xcfe9ff, 10);
        }
        // Figur taucht wieder in der Schleuder auf
        me.group.visible = false;
        me.rig.play('jump');
      }
      for (let i = pops.length - 1; i >= 0; i--) {
        const p = pops[i] as Pop;
        p.t += dt;
        p.sp.position.y += dt * p.vy;
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
        me.group.visible = true;
        me.group.rotation.z = 0;
        me.group.position.set(anchor.x + 0.9 * figScale, anchor.y - 1.5 * (S / 6), 0.8);
        me.rig.faceTowards(0);
        me.rig.play('celebrate');
      }
    },
    ghosts(states, dt) {
      updateRivals(rivals, states, dt, (r, rs, i) => {
        const sc = Math.max(0.55, S / 6) * 0.8;
        r.group.scale.setScalar(sc);
        const dotsI = rivalDots[i] as THREE.Mesh[];
        if (rs.proj) {
          const c = 0.45 * sc;
          const a = -t * 12 - i;
          r.group.rotation.z = a;
          r.group.position.set(
            wx(rs.proj.x) + Math.sin(a) * c,
            wy(rs.proj.y) - Math.cos(a) * c,
            0.3 - i * 0.05,
          );
          if (rivalPhase[i] !== 'fly') r.rig.play('roll', { loop: true });
          rivalPhase[i] = 'fly';
          if (Math.floor(t * 25) % 2 === 0) {
            const m = dotsI[(rivalDotIdx[i] as number) % dotsI.length] as THREE.Mesh;
            rivalDotIdx[i] = (rivalDotIdx[i] as number) + 1;
            m.visible = true;
            m.position.set(wx(rs.proj.x), wy(rs.proj.y), 0.2);
            m.scale.setScalar(1);
          }
        } else {
          // wartet neben der Schleuder
          r.group.rotation.z = 0;
          const k = S / 6;
          r.group.position.set(
            anchor.x - (1.0 + i * 0.75) * Math.max(0.6, k),
            anchor.y - 1.55 * k,
            -0.2 - i * 0.1,
          );
          r.rig.faceTowards(Math.PI / 2);
          if (rs.phase === 'over') {
            if (rivalPhase[i] !== 'over') r.rig.play('celebrate');
            rivalPhase[i] = 'over';
          } else if (rivalPhase[i] !== 'aim') {
            r.rig.play('idle', { loop: true });
            rivalPhase[i] = 'aim';
          }
        }
        for (const m of dotsI) {
          if (!m.visible) continue;
          m.scale.multiplyScalar(1 - dt * 2.2);
          if (m.scale.x < 0.15) m.visible = false;
        }
        if (rivalSeq[i] !== rs.seq) {
          const first = rivalSeq[i] === -1;
          rivalSeq[i] = rs.seq;
          if (!first && rs.last.hit) {
            v3.set(wx(rs.last.x), wy(rs.last.y), 0.3);
            ctx.burst(v3, r.avatar.color, 8);
          }
        }
      });
    },
    dispose() {
      ctx.scene.fog = null;
    },
  };
};
