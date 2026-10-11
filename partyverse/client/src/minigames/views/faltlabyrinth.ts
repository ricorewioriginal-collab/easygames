import * as THREE from 'three';
import type { FaltState, Maze } from '@shared/minigames/games/faltlabyrinth';
import { HALF_WALL, PHASE_TICKS, WARN_TICKS } from '@shared/minigames/games/faltlabyrinth';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';

const WALL_H = 0.8;
const COL_STATIC = 0xc9b8ff;
const COL_A = 0x3fa0ff; // Wand nur in Phase A
const COL_B = 0xff9a3d; // Wand nur in Phase B
const BG_A = new THREE.Color(0x2c3a8c);
const BG_B = new THREE.Color(0x86356b);

interface FoldWall {
  pivot: THREE.Group;
  mesh: THREE.Mesh;
  code: number;
  axisZ: boolean;
  sign: number;
  fold: number;
  vel: number;
  mats: [THREE.Material, THREE.Material];
}

interface Built {
  index: number;
  n: number;
  group: THREE.Group;
  statics: THREE.InstancedMesh;
  staticBase: Array<{ x: number; z: number; sx: number; sz: number }>;
  posts: THREE.InstancedMesh;
  folds: FoldWall[];
  goal: THREE.Group;
  flag: THREE.Group;
  flagCloth: THREE.Mesh;
  grow: number;
}

/** Papierfalt-Welt: Wände klappen um, Phase A (blau) und Phase B (orange) wechseln sich ab. */
export const createView: MiniGameViewFactory<FaltState> = (ctx, initial) => {
  const { root, camera, scene } = ctx;
  const bg = new THREE.Color().copy(BG_A);
  scene.background = bg;

  // Gemeinsame Geometrien
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const postGeo = new THREE.CylinderGeometry(0.11, 0.11, 1, 10);
  const tileGeo = new THREE.BoxGeometry(0.96, 0.2, 0.96);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const sc = new THREE.Vector3();
  const pos = new THREE.Vector3();
  const colr = new THREE.Color();

  // Dekoration: schwebende Papierkristalle
  const deco: THREE.Mesh[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.7 + (i % 3) * 0.4, 0),
      toon([0xffffff, 0xffd6f0, 0xd6e6ff][i % 3]!, { emissive: 0x6a5cff, emissiveIntensity: 0.15 }),
    );
    const a = (i / 14) * Math.PI * 2;
    d.position.set(
      Math.cos(a) * (11 + (i % 4) * 2.2),
      -1 + (i % 5) * 1.6,
      Math.sin(a) * (9 + (i % 3) * 2) - 3,
    );
    root.add(d);
    deco.push(d);
  }

  const mazeRoot = new THREE.Group();
  root.add(mazeRoot);
  let built: Built | null = null;

  function build(m: Maze, index: number): Built {
    const n = m.n;
    const group = new THREE.Group();
    group.position.set(-n / 2, 0, n / 2); // Zelle (i,j) -> (i, 0, -j)
    const toW = (x: number, y: number): [number, number] => [x, -y];
    // Boden
    const baseBox = new THREE.Mesh(boxGeo, toon(0x40307a));
    baseBox.scale.set(n + 0.6, 1.2, n + 0.6);
    baseBox.position.set(n / 2, -0.8, -n / 2);
    group.add(baseBox);
    const tiles = new THREE.InstancedMesh(tileGeo, toon(0xffffff), n * n);
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        m4.makeTranslation(i + 0.5, -0.1, -(j + 0.5));
        tiles.setMatrixAt(j * n + i, m4);
        colr.setHex((i + j) % 2 === 0 ? 0xfff1d6 : 0xe7dcff);
        tiles.setColorAt(j * n + i, colr);
      }
    }
    group.add(tiles);
    // Start-, Ziel- und Checkpunkt-Markierung
    const mark = (cx: number, cy: number, color: number): void => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.05, 20), toon(color));
      p.position.set(cx + 0.5, 0.0, -(cy + 0.5));
      group.add(p);
    };
    mark(m.start.x, m.start.y, 0x5ee08a);
    mark(m.check.x, m.check.y, 0x5ad2ff);
    // Ziel: goldenes Portal
    const goal = new THREE.Group();
    goal.position.set(m.goal.x + 0.5, 0, -(m.goal.y + 0.5));
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.05, 20),
      toon(0xffd23f, { emissive: 0xffa800, emissiveIntensity: 0.5 }),
    );
    pad.position.y = 0.0;
    goal.add(pad);
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.05, 8, 24), glow(0xfff0a0));
    ring1.position.y = 0.55;
    ring1.name = 'r1';
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 8, 20), glow(0xffffff));
    ring2.position.y = 0.55;
    ring2.name = 'r2';
    const gem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.15),
      toon(0xffe27a, { emissive: 0xffa800, emissiveIntensity: 0.8 }),
    );
    gem.position.y = 0.55;
    gem.name = 'gem';
    const gh = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 10), glow(0xffe27a, 0.18));
    gh.position.y = 0.55;
    goal.add(ring1, ring2, gem, gh);
    group.add(goal);
    // Fähnchen am Checkpunkt
    const flag = new THREE.Group();
    flag.position.set(m.check.x + 0.5, 0, -(m.check.y + 0.5));
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 6), toon(0xffffff));
    pole.position.y = 0.4;
    const cloth = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 3), glow(0x5ad2ff));
    cloth.rotation.z = -Math.PI / 2;
    cloth.position.set(0.2, 0.62, 0);
    flag.add(pole, cloth);
    group.add(flag);

    // Wände: statische (instanziert) und faltbare (einzeln)
    const T = HALF_WALL * 2;
    const staticList: Array<{ x: number; z: number; sx: number; sz: number }> = [];
    const folds: FoldWall[] = [];
    const matA: [THREE.Material, THREE.Material] = [
      toon(COL_A, { emissive: COL_A, emissiveIntensity: 0.1 }),
      toon(COL_A, { emissive: 0x9fd0ff, emissiveIntensity: 0.9 }),
    ];
    const matB: [THREE.Material, THREE.Material] = [
      toon(COL_B, { emissive: COL_B, emissiveIntensity: 0.1 }),
      toon(COL_B, { emissive: 0xffd09f, emissiveIntensity: 0.9 }),
    ];
    let foldIdx = 0;
    const addWall = (code: number, cx: number, cy: number, alongY: boolean): void => {
      if (code === 0) return;
      const [wx, wz] = toW(cx, cy);
      if (code === 1) {
        staticList.push(alongY ? { x: wx, z: wz, sx: T, sz: 1 + T } : { x: wx, z: wz, sx: 1 + T, sz: T });
        return;
      }
      const mats = code === 2 ? matA : matB;
      const pivot = new THREE.Group();
      pivot.position.set(wx, 0, wz);
      const mesh = new THREE.Mesh(boxGeo, mats[0]);
      if (alongY) mesh.scale.set(T, WALL_H, 1 + T);
      else mesh.scale.set(1 + T, WALL_H, T);
      mesh.position.y = WALL_H / 2;
      pivot.add(mesh);
      group.add(pivot);
      folds.push({
        pivot,
        mesh,
        code,
        axisZ: alongY,
        sign: foldIdx++ % 2 === 0 ? 1 : -1,
        fold: 0,
        vel: 0,
        mats,
      });
    };
    for (let j = 0; j < n; j++)
      for (let i = 0; i <= n; i++) addWall(m.vw[j * (n + 1) + i]!, i, j + 0.5, true);
    for (let j = 0; j <= n; j++) for (let i = 0; i < n; i++) addWall(m.hw[j * n + i]!, i + 0.5, j, false);
    const statics = new THREE.InstancedMesh(boxGeo, toon(COL_STATIC), Math.max(1, staticList.length));
    statics.count = staticList.length;
    statics.frustumCulled = false;
    group.add(statics);
    // Pfosten an den Gitterpunkten
    const posts = new THREE.InstancedMesh(postGeo, toon(0xffffff), (n + 1) * (n + 1));
    for (let j = 0; j <= n; j++) {
      for (let i = 0; i <= n; i++) {
        pos.set(i, WALL_H / 2 + 0.03, -j);
        sc.set(1, WALL_H + 0.06, 1);
        m4.compose(pos, q.identity(), sc);
        posts.setMatrixAt(j * (n + 1) + i, m4);
      }
    }
    group.add(posts);
    mazeRoot.add(group);
    return {
      index,
      n,
      group,
      statics,
      staticBase: staticList,
      posts,
      folds,
      goal,
      flag,
      flagCloth: cloth,
      grow: 0,
    };
  }

  function applyStatics(b: Built, grow: number): void {
    const h = Math.max(0.001, WALL_H * grow);
    b.staticBase.forEach((w, k) => {
      pos.set(w.x, h / 2, w.z);
      sc.set(w.sx, h, w.sz);
      m4.compose(pos, q.identity(), sc);
      b.statics.setMatrixAt(k, m4);
    });
    b.statics.instanceMatrix.needsUpdate = true;
  }

  // Spielfigur: kleiner Gummi-Wicht
  const hero = new THREE.Group();
  const body = new THREE.Group();
  hero.add(body);
  const blob = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 14), toon(0xff6fa5));
  blob.scale.set(1, 1.1, 1);
  blob.position.y = 0.23;
  body.add(blob);
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), toon(0xffffff));
    eye.position.set(sx * 0.08, 0.3, 0.16);
    body.add(eye);
    const pu = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), toon(0x1a1030));
    pu.position.set(sx * 0.08, 0.3, 0.205);
    body.add(pu);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), toon(0xd04a82));
    foot.scale.set(1, 0.6, 1.3);
    foot.position.set(sx * 0.09, 0.03, 0.05);
    body.add(foot);
  }
  const hat = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.24, 4), toon(0xffffff));
  hat.position.y = 0.52;
  hat.rotation.y = Math.PI / 4;
  body.add(hat);
  hero.scale.setScalar(1.4);
  const heroShadow = new THREE.Mesh(new THREE.CircleGeometry(0.22, 14), glow(0x1a1030, 0.35));
  heroShadow.rotation.x = -Math.PI / 2;
  heroShadow.position.y = 0.03;
  mazeRoot.add(heroShadow);
  mazeRoot.add(hero);

  const popups: Array<{ sp: THREE.Sprite; t: number }> = [];
  function popup(text: string, wx: number, wz: number, color: string): void {
    const sp = textSprite(text, { color, size: 72, width: 1.2 });
    sp.position.set(wx, 1.4, wz);
    mazeRoot.add(sp);
    popups.push({ sp, t: 0 });
  }

  let t = 0;
  let lastFolds = initial.folds;
  let lastMazes = initial.mazes;
  let lastCheck = initial.checkCount;
  let lastTickSfx = -1;
  let px = initial.x;
  let py = initial.y;
  let hop = 0;
  let camR = 14;
  let trail = 0;
  const v3 = new THREE.Vector3();
  const camT = new THREE.Vector3();

  return {
    update(s, dt) {
      t += dt;
      if (!built || built.index !== s.mazeIndex) {
        if (built) {
          built.group.removeFromParent();
          built.group.traverse((o) => {
            const mm = o as THREE.Mesh;
            if (mm.geometry && mm.geometry !== boxGeo && mm.geometry !== postGeo && mm.geometry !== tileGeo)
              mm.geometry.dispose();
          });
        }
        built = build(s.maze, s.mazeIndex);
        applyStatics(built, 0);
        lastFolds = s.folds;
        lastCheck = s.checkCount;
      }
      const b = built;
      const n = b.n;
      deco.forEach((d, i) => {
        d.rotation.y += dt * (0.3 + (i % 3) * 0.15);
        d.rotation.x += dt * 0.2;
        d.position.y += Math.sin(t * 0.7 + i) * dt * 0.3;
      });
      // Hintergrundfarbe zeigt die Phase
      bg.lerp(s.phase === 0 ? BG_A : BG_B, Math.min(1, dt * 3));

      // Wände
      if (b.grow < 1) {
        b.grow = Math.min(1, b.grow + dt * 2.2);
        applyStatics(b, 1 - Math.pow(1 - b.grow, 3));
      }
      const warn = PHASE_TICKS - s.phaseTick <= WARN_TICKS;
      const blinkOn = warn && Math.floor(t * 12) % 2 === 0;
      for (const w of b.folds) {
        const standing = (w.code === 2 && s.phase === 0) || (w.code === 3 && s.phase === 1);
        const target = standing ? 1 : 0;
        // Feder mit Überschwingen
        w.vel += (target - w.fold) * 150 * dt;
        w.vel *= Math.pow(0.0008, dt);
        w.fold += w.vel * dt;
        const f = Math.max(-0.1, Math.min(1.15, w.fold));
        const ang = (1 - f) * (Math.PI / 2) * w.sign;
        const wob = warn ? Math.sin(t * 45 + w.pivot.position.x * 3) * 0.05 : 0;
        if (w.axisZ) w.pivot.rotation.set(0, 0, ang + wob);
        else w.pivot.rotation.set(ang + wob, 0, 0);
        w.mesh.scale.y = WALL_H * (0.35 + 0.65 * Math.max(0, Math.min(1, f)));
        w.mesh.position.y = w.mesh.scale.y / 2;
        w.mesh.material = blinkOn ? w.mats[1] : w.mats[0];
      }

      // Ziel & Flagge
      b.goal.rotation.y = t * 1.5;
      const gem = b.goal.getObjectByName('gem');
      if (gem) {
        gem.position.y = 0.6 + Math.sin(t * 3) * 0.08;
        gem.rotation.y = t * 3;
      }
      const r1 = b.goal.getObjectByName('r1');
      const r2 = b.goal.getObjectByName('r2');
      if (r1) r1.rotation.set(t * 1.2, t * 0.7, 0);
      if (r2) r2.rotation.set(0, t * 1.9, t * 1.1);
      (b.flagCloth.material as THREE.MeshBasicMaterial).color.setHex(s.checkHit ? 0x8a8aa8 : 0x5ad2ff);
      b.flag.rotation.z = s.checkHit ? 0.25 : 0;
      b.flagCloth.scale.y = 1 + Math.sin(t * 6) * 0.08;

      // Spielfigur
      const wx = s.x - n / 2;
      const wz = n / 2 - s.y;
      const mvx = (s.x - px) / Math.max(dt, 1e-3);
      const mvy = (s.y - py) / Math.max(dt, 1e-3);
      px = s.x;
      py = s.y;
      const speed = Math.min(5, Math.hypot(mvx, mvy));
      hop += dt * (5 + speed * 2.2);
      const bob = Math.abs(Math.sin(hop)) * 0.09 * Math.min(1, speed / 2.5);
      hero.position.set(wx, bob, wz);
      heroShadow.position.set(wx, 0.03, wz);
      heroShadow.scale.setScalar(1 - bob * 2);
      if (speed > 0.8) {
        const target = Math.atan2(mvx, -mvy);
        let d2 = target - hero.rotation.y;
        d2 = Math.atan2(Math.sin(d2), Math.cos(d2));
        hero.rotation.y += d2 * Math.min(1, dt * 14);
      }
      const sq = 1 + Math.sin(hop * 2) * 0.06 * Math.min(1, speed / 2.5);
      body.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));
      body.rotation.x = Math.min(0.25, speed * 0.05);
      if (speed > 2.5) {
        trail -= dt;
        if (trail <= 0) {
          trail = 0.12;
          ctx.burst(v3.set(wx, 0.1, wz), 0xffffff, 1);
        }
      }

      // Ereignisse
      if (s.folds !== lastFolds) {
        lastFolds = s.folds;
        ctx.sfx('whoosh');
        // Papierflattern an den Wänden
        const w0 = b.folds[(s.folds * 7) % Math.max(1, b.folds.length)];
        if (w0)
          ctx.burst(
            v3.set(w0.pivot.position.x - n / 2, 0.5, w0.pivot.position.z + n / 2),
            s.phase === 0 ? COL_A : COL_B,
            8,
          );
      }
      const secLeft = Math.ceil((PHASE_TICKS - s.phaseTick) / 60);
      if (
        warn &&
        secLeft !== lastTickSfx &&
        PHASE_TICKS - s.phaseTick <= WARN_TICKS &&
        (PHASE_TICKS - s.phaseTick) % 15 === 0
      ) {
        ctx.sfx('tick');
        lastTickSfx = secLeft;
      }
      if (s.checkCount !== lastCheck) {
        lastCheck = s.checkCount;
        ctx.sfx('good');
        ctx.burst(v3.set(b.flag.position.x - n / 2, 0.7, b.flag.position.z + n / 2), 0x5ad2ff, 16);
        popup('+15', wx, wz, '#8fe6ff');
      }
      if (s.mazes !== lastMazes) {
        lastMazes = s.mazes;
        ctx.sfx('win');
        ctx.burst(v3.set(wx, 0.7, wz), 0xffd23f, 30);
        popup('+' + (100 + s.lastBonus), wx, wz, '#ffd23f');
      }
      for (let i = popups.length - 1; i >= 0; i--) {
        const p = popups[i]!;
        p.t += dt;
        p.sp.position.y = 1.4 + p.t * 1.4;
        p.sp.material.opacity = Math.max(0, 1 - p.t / 1.0);
        if (p.t > 1.0) {
          p.sp.removeFromParent();
          p.sp.material.map?.dispose();
          p.sp.material.dispose();
          popups.splice(i, 1);
        }
      }

      // Kamera: schräg von oben, Größe passt sich dem Labyrinth an
      const aspect = camera.aspect;
      const portrait = aspect < 1;
      const elev = portrait ? 1.28 : 1.12;
      const needW = (n / 2 + 0.9) / (0.466 * aspect);
      const needH = ((n / 2) * Math.sin(elev) + 1.1) / 0.466;
      const Rt = Math.max(needW * 1.05, needH * 1.12, 8);
      camR += (Rt - camR) * Math.min(1, dt * 3);
      camT.set(0, 0, portrait ? 0.2 : 0.4);
      camera.position.set(0, camR * Math.sin(elev), camT.z + camR * Math.cos(elev));
      camera.lookAt(camT);
    },
    dispose() {
      boxGeo.dispose();
      postGeo.dispose();
      tileGeo.dispose();
    },
  };
};
