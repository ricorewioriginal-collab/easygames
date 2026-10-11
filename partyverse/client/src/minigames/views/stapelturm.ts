import * as THREE from 'three';
import type { TowerState } from '@shared/minigames/games/stapelturm';
import { FALL_TICKS, RANGE, heightOf } from '@shared/minigames/games/stapelturm';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';

const DEPTH = 3.2;
const BASE_PLATE = 9;
const ROPE = 5.5;

const blockColor = (i: number): number =>
  new THREE.Color().setHSL((i * 0.073 + 0.02) % 1, 0.78, 0.5).getHex();

/** Baustelle auf einer Wiese: Portalkran mit Laufkatze, bunte Blöcke, Wolken. Die Kamera klettert mit dem Turm. */
export const createView: MiniGameViewFactory<TowerState> = (ctx, initial) => {
  const { root, camera } = ctx;
  ctx.scene.background = new THREE.Color(0x8fd4ff);
  ctx.scene.fog = new THREE.Fog(0xbfe6ff, 40, 120);
  root.add(new THREE.HemisphereLight(0xffffff, 0x9bd37a, 1.05));
  const sun = new THREE.DirectionalLight(0xfff3d6, 1.5);
  sun.position.set(-8, 20, 14);
  root.add(sun);

  // Boden: Hügelinsel
  const hill = new THREE.Mesh(new THREE.CylinderGeometry(11, 12.5, 2, 40), toon(0x6fd36b));
  hill.position.y = -1;
  root.add(hill);
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(12.5, 5, 7, 40), toon(0x9a6b44));
  soil.position.y = -5.5;
  root.add(soil);
  const plate = new THREE.Mesh(new THREE.BoxGeometry(BASE_PLATE, 0.3, DEPTH + 1), toon(0xc9c3b8));
  plate.position.y = -0.15;
  root.add(plate);
  // Bäume und Häuschen
  const deco = (x: number, z: number, kind: number): void => {
    const g = new THREE.Group();
    if (kind === 0) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 1.2, 8), toon(0x8a5a2b));
      trunk.position.y = 0.6;
      g.add(trunk);
      const top = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.6, 10), toon(0x2fa86a));
      top.position.y = 2.3;
      g.add(top);
    } else {
      const house = new THREE.Mesh(new THREE.BoxGeometry(2, 1.4, 1.6), toon(0xffe0a0));
      house.position.y = 0.7;
      g.add(house);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.7, 1, 4), toon(0xe0573a));
      roof.rotation.y = Math.PI / 4;
      roof.position.y = 1.9;
      g.add(roof);
    }
    g.position.set(x, 0, z);
    root.add(g);
  };
  deco(-8.2, -3, 0);
  deco(8.5, -2.5, 0);
  deco(-9.6, 0.5, 1);
  deco(9.8, 1.5, 0);
  deco(-6.5, -6, 0);
  deco(7, -6.5, 1);

  // Wolken
  const clouds: THREE.Group[] = [];
  const cm = toon(0xffffff);
  for (let i = 0; i < 16; i++) {
    const g = new THREE.Group();
    for (let k = 0; k < 4; k++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(1 + (k % 2) * 0.5, 10, 8), cm);
      m.position.set((k - 1.5) * 1.1, (k % 2) * 0.3, 0);
      g.add(m);
    }
    g.position.set(((i * 37) % 11) * 3 - 15 + (i % 2) * 6, 4 + i * 5, -10 - (i % 3) * 4);
    g.scale.setScalar(1.3 + (i % 3) * 0.4);
    root.add(g);
    clouds.push(g);
  }

  // Kran
  const yel = toon(0xffc83d);
  const darkY = toon(0xe08a1a);
  const postL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.5), yel);
  const postR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.5), yel);
  root.add(postL, postR);
  const beam = new THREE.Mesh(new THREE.BoxGeometry(RANGE * 2 + 5, 0.6, 0.7), yel);
  root.add(beam);
  const beamStripe = new THREE.Mesh(new THREE.BoxGeometry(RANGE * 2 + 5, 0.18, 0.72), darkY);
  root.add(beamStripe);
  const hang = new THREE.Group();
  root.add(hang);
  const trolley = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.5, 0.9), toon(0xe0302b));
  hang.add(trolley);
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, ROPE, 6), toon(0x333344));
  rope.position.y = -ROPE / 2 - 0.2;
  hang.add(rope);
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.07, 8, 14, Math.PI * 1.5), toon(0x333344));
  hook.position.y = -ROPE - 0.35;
  hang.add(hook);

  // Blöcke
  const blockGeo = new THREE.BoxGeometry(1, 1, 1);
  const topGeo = new THREE.BoxGeometry(1, 0.12, 1);
  const mkBlock = (i: number): THREE.Group => {
    const g = new THREE.Group();
    const col = blockColor(i);
    const m = new THREE.Mesh(blockGeo, toon(col));
    m.name = 'body';
    g.add(m);
    const trim = new THREE.Mesh(topGeo, toon(new THREE.Color(col).offsetHSL(0, -0.1, 0.15).getHex()));
    trim.name = 'trim';
    trim.position.y = 0.5;
    g.add(trim);
    const win = new THREE.Mesh(blockGeo, new THREE.MeshBasicMaterial({ color: 0xfff6c8 }));
    win.name = 'win';
    g.add(win);
    g.visible = false;
    root.add(g);
    return g;
  };
  const layout = (g: THREE.Group, w: number): void => {
    (g.getObjectByName('body') as THREE.Mesh).scale.set(w, 1, DEPTH);
    (g.getObjectByName('trim') as THREE.Mesh).scale.set(w + 0.12, 1, DEPTH + 0.12);
    // Fenster: eine Leiste an der Vorderseite
    const win = g.getObjectByName('win') as THREE.Mesh;
    win.scale.set(Math.max(0.1, w * 0.7), 0.28, 0.05);
    win.position.set(0, 0.05, DEPTH / 2 + 0.01);
  };
  const stack: THREE.Group[] = [];
  const held = mkBlock(0);
  hang.add(held);
  held.position.y = -ROPE - 0.2 - 0.5 - 0.05;
  const faller = mkBlock(0);

  // Abgeschnittene Teile
  interface Piece {
    g: THREE.Group;
    vx: number;
    vy: number;
    vr: number;
    t: number;
  }
  const pieces: Piece[] = [];
  const freePieces: THREE.Group[] = [];

  const ring = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.0, 36), glow(0xffffff, 0.9));
  ring.rotation.x = -Math.PI / 2;
  ring.visible = false;
  root.add(ring);
  let ringT = 9;
  const perfectTxt = textSprite('PERFEKT!', { color: '#ffe36e', size: 72, width: 4.2 });
  perfectTxt.visible = false;
  root.add(perfectTxt);
  let txtT = 9;

  let t = 0;
  let camY = 4;
  let lastSeq = initial.seq;
  let squash = 0;
  let wasOver = false;
  const v3 = new THREE.Vector3();

  return {
    update(s, dt) {
      t += dt;
      const n = heightOf(s);
      // Turm
      while (stack.length < s.blocks.length) stack.push(mkBlock(stack.length));
      for (let i = 0; i < stack.length; i++) {
        const b = s.blocks[i];
        const g = stack[i] as THREE.Group;
        if (!b) {
          g.visible = false;
          continue;
        }
        g.visible = true;
        const sway = Math.sin(t * 1.7 + i * 0.35) * 0.012 * Math.max(0, i - 3) * (i / 12);
        g.position.set(b.x + sway, i + 0.5, 0);
        layout(g, b.w);
        const top = i === s.blocks.length - 1;
        g.scale.y = top && squash > 0 ? 1 - squash * 0.25 : 1;
        if (top && squash > 0) g.position.y = i + 0.5 - squash * 0.125;
        (g.getObjectByName('win') as THREE.Mesh).visible = i > 0;
      }
      squash = Math.max(0, squash - dt * 5);
      const topY = n + 1;

      // Kran
      const beamY = topY + 7.8;
      const postH = beamY + 1;
      postL.scale.y = postR.scale.y = postH;
      postL.position.set(-RANGE - 2.4, postH / 2 - 1, 0);
      postR.position.set(RANGE + 2.4, postH / 2 - 1, 0);
      beam.position.set(0, beamY, 0);
      beamStripe.position.set(0, beamY - 0.2, 0);
      hang.position.set(s.cx, beamY - 0.3, 0);
      hang.rotation.z = s.phase === 'swing' ? -s.dir * 0.05 + Math.sin(t * 7) * 0.02 : Math.sin(t * 5) * 0.03;
      // Block, der am Kran hängt (steht vor dem Kranbalken, daher Versatz in z)
      held.visible = s.phase === 'swing';
      if (held.visible) {
        layout(held, s.w);
        held.position.z = 0;
        (held.getObjectByName('win') as THREE.Mesh).visible = true;
        const col = blockColor(n + 1);
        ((held.getObjectByName('body') as THREE.Mesh).material as THREE.MeshToonMaterial) = toon(col);
        ((held.getObjectByName('trim') as THREE.Mesh).material as THREE.MeshToonMaterial) = toon(
          new THREE.Color(col).offsetHSL(0, -0.1, 0.15).getHex(),
        );
      }
      // Fallender Block
      faller.visible = s.phase === 'fall';
      if (faller.visible) {
        const p = Math.min(1, s.timer / FALL_TICKS);
        const y0 = beamY - 0.3 - ROPE - 0.75;
        const y1 = topY + 0.5;
        layout(faller, s.w);
        faller.position.set(s.dropX, y0 + (y1 - y0) * p * p, 0);
        faller.rotation.z = 0;
        const col = blockColor(n + 1);
        ((faller.getObjectByName('body') as THREE.Mesh).material as THREE.MeshToonMaterial) = toon(col);
        ((faller.getObjectByName('trim') as THREE.Mesh).material as THREE.MeshToonMaterial) = toon(
          new THREE.Color(col).offsetHSL(0, -0.1, 0.15).getHex(),
        );
      }

      // Ereignis: Block gelandet
      if (s.seq !== lastSeq) {
        lastSeq = s.seq;
        const L = s.last;
        const idx = L.miss ? n + 1 : n;
        const yBlock = idx + 0.5;
        if (L.cutW > 0.01) {
          const g = freePieces.pop() ?? mkBlock(idx);
          g.visible = true;
          layout(g, L.cutW);
          const col = blockColor(idx);
          ((g.getObjectByName('body') as THREE.Mesh).material as THREE.MeshToonMaterial) = toon(col);
          ((g.getObjectByName('trim') as THREE.Mesh).material as THREE.MeshToonMaterial) = toon(
            new THREE.Color(col).offsetHSL(0, -0.1, 0.15).getHex(),
          );
          (g.getObjectByName('win') as THREE.Mesh).visible = true;
          g.position.set(L.cutX, L.miss ? yBlock + 0.0 : yBlock, 0);
          g.rotation.set(0, 0, 0);
          const dir = L.cutX < (s.blocks[n - 1]?.x ?? 0) || (L.miss && L.cutX < 0) ? -1 : 1;
          pieces.push({ g, vx: dir * (L.miss ? 1.2 : 1.6), vy: 0.5, vr: -dir * (L.miss ? 1.4 : 2.4), t: 0 });
        }
        if (L.miss) {
          ctx.sfx('bad');
        } else {
          squash = 1;
          v3.set(L.x, yBlock + 0.6, 1);
          if (L.perfect) {
            ctx.sfx('good');
            ctx.burst(v3, 0xffe36e, 26);
            ring.visible = true;
            ringT = 0;
            ring.position.set(L.x, yBlock + 0.52, 0);
            perfectTxt.visible = true;
            txtT = 0;
            perfectTxt.position.set(L.x, yBlock + 2.2, 2);
          } else {
            ctx.sfx('hit');
            ctx.burst(v3, 0xffffff, 9);
          }
        }
      }
      for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i] as Piece;
        p.t += dt;
        p.vy -= dt * 22;
        p.g.position.x += p.vx * dt;
        p.g.position.y += p.vy * dt;
        p.g.rotation.z += p.vr * dt;
        if (p.t > 1.8) {
          p.g.visible = false;
          freePieces.push(p.g);
          pieces.splice(i, 1);
        }
      }
      if (ringT < 0.6) {
        ringT += dt;
        ring.scale.setScalar(1 + ringT * 6);
        (ring.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.9 - ringT * 1.6);
        if (ringT >= 0.6) ring.visible = false;
      }
      if (txtT < 1.1) {
        txtT += dt;
        perfectTxt.position.y += dt * 1.6;
        perfectTxt.material.opacity = Math.max(0, 1 - Math.max(0, txtT - 0.6) * 2);
        if (txtT >= 1.1) {
          perfectTxt.visible = false;
          perfectTxt.material.opacity = 1;
        }
      }
      if (s.phase === 'over' && !wasOver) {
        wasOver = true;
        if (!s.lost) ctx.sfx('win');
      }

      for (let i = 0; i < clouds.length; i++)
        (clouds[i] as THREE.Group).position.x += dt * (0.3 + (i % 3) * 0.15);
      for (const c of clouds) if (c.position.x > 24) c.position.x = -24;

      // Kamera folgt dem Turm
      camY += (Math.max(4, topY) - camY) * Math.min(1, dt * 3);
      const asp = camera.aspect || 1.6;
      const hh = Math.max(7.2, (RANGE + 3.2) / asp);
      const dist = hh / Math.tan((camera.fov * Math.PI) / 360) + 3;
      camera.position.set(0, camY + 3.2, dist);
      camera.lookAt(0, camY + 2.2, 0);
    },
    dispose() {
      ctx.scene.fog = null;
    },
  };
};
