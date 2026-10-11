import * as THREE from 'three';
import { BOARD, type SpuerState } from '@shared/minigames/games/spuernase';
import { glow, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';

const PALETTE = [0xff3b4e, 0xff9a2e, 0xffd93b, 0x7ddf3f, 0x27c8b5, 0x3b82ff, 0x9a5bff, 0xff5fb7];
const MAXC = 36;

function shapeOf(kind: number): THREE.Shape {
  const sh = new THREE.Shape();
  const poly = (pts: Array<[number, number]>) => {
    sh.moveTo((pts[0] as [number, number])[0], (pts[0] as [number, number])[1]);
    for (let i = 1; i < pts.length; i++) sh.lineTo((pts[i] as [number, number])[0], (pts[i] as [number, number])[1]);
    sh.closePath();
  };
  switch (kind) {
    case 0: poly([[0, 0.5], [0.48, 0.02], [0.18, 0.02], [0.18, -0.5], [-0.18, -0.5], [-0.18, 0.02], [-0.48, 0.02]]); break;
    case 1: poly([[0, 0.5], [0.5, -0.38], [-0.5, -0.38]]); break;
    case 2: poly([[-0.42, -0.46], [0.46, -0.46], [0.46, -0.1], [-0.06, -0.1], [-0.06, 0.46], [-0.42, 0.46]]); break;
    case 3: sh.absarc(0, 0, 0.48, 0, Math.PI * 2, false); break;
    case 4: poly([[-0.4, -0.4], [0.4, -0.4], [0.4, 0.4], [-0.4, 0.4]]); break;
    case 5: {
      const pts: Array<[number, number]> = [];
      for (let i = 0; i < 10; i++) {
        const a = Math.PI / 2 + (i * Math.PI) / 5;
        const r = i % 2 === 0 ? 0.54 : 0.23;
        pts.push([Math.cos(a) * r, Math.sin(a) * r]);
      }
      poly(pts);
      break;
    }
    case 6: {
      const pts: Array<[number, number]> = [];
      for (let i = 0; i < 6; i++) pts.push([Math.cos((i * Math.PI) / 3) * 0.5, Math.sin((i * Math.PI) / 3) * 0.5]);
      poly(pts);
      break;
    }
    default: poly([[-0.15, -0.5], [0.15, -0.5], [0.15, -0.15], [0.5, -0.15], [0.5, 0.15], [0.15, 0.15], [0.15, 0.5], [-0.15, 0.5], [-0.15, 0.15], [-0.5, 0.15], [-0.5, -0.15], [-0.15, -0.15]]);
  }
  return sh;
}

/** Klassenzimmer-Tafel: bunte Kreide-Symbole auf grüner Tafel, unten schnüffelt eine Detektiv-Nase mit. */
export const createView: MiniGameViewFactory<SpuerState> = (ctx) => {
  const { root, camera } = ctx;
  ctx.scene.background = new THREE.Color(0xf0d7a1);
  const D = 10;
  const symGeos = Array.from({ length: 8 }, (_, i) => {
    const g = new THREE.ExtrudeGeometry(shapeOf(i), { depth: 0.22, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 2, curveSegments: 14 });
    g.translate(0, 0, -0.11);
    return g;
  });
  const tileGeo = new THREE.BoxGeometry(1, 1, 0.2);
  const tileA = toon(0x2f7a5e);
  const tileB = toon(0x34856a);

  // Wand-Deko
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(80, 50), toon(0xf0d7a1));
  wall.position.z = -1.5;
  root.add(wall);
  const stripes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 40, 0.05), toon(0xe9cb8c), 24);
  const tmp = new THREE.Object3D();
  for (let i = 0; i < 24; i++) {
    tmp.position.set((i - 11.5) * 1.6, 0, -1.4);
    tmp.updateMatrix();
    stripes.setMatrixAt(i, tmp.matrix);
  }
  root.add(stripes);

  // Tafelrahmen und -fläche (werden bei jedem Layout skaliert)
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.3), toon(0xa8672f));
  frame.position.z = -0.3;
  root.add(frame);
  const boardFace = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.2), toon(0x24604b));
  boardFace.position.z = -0.17;
  root.add(boardFace);
  const tray = new THREE.Mesh(new THREE.BoxGeometry(1, 0.2, 0.5), toon(0x8a5224));
  root.add(tray);
  const chalkA = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 8), toon(0xffffff));
  chalkA.rotation.z = Math.PI / 2;
  root.add(chalkA);
  const chalkB = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 8), toon(0xffd93b));
  chalkB.rotation.z = Math.PI / 2 + 0.2;
  root.add(chalkB);

  // Zellen
  interface CellView { tile: THREE.Mesh; sym: THREE.Mesh; delay: number; age: number; shake: number; flash: number }
  const cellsV: CellView[] = [];
  for (let i = 0; i < MAXC; i++) {
    const tile = new THREE.Mesh(tileGeo, (i % 2 ? tileA : tileB).clone());
    (tile.material as THREE.Material).userData = {};
    tile.position.z = 0;
    const sym = new THREE.Mesh(symGeos[0], toon(PALETTE[0] as number));
    sym.position.z = 0.2;
    root.add(tile, sym);
    cellsV.push({ tile, sym, delay: 0, age: 9, shake: 0, flash: 0 });
  }
  // Cursor-Rahmen
  const cursor = new THREE.Group();
  const curMat = glow(0xfff176, 0.95);
  const bars = [0, 1, 2, 3].map(() => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.1), curMat);
    cursor.add(b);
    return b;
  });
  cursor.position.z = 0.45;
  root.add(cursor);

  // Detektiv-Nase unten
  const mascot = new THREE.Group();
  root.add(mascot);
  const head = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), toon(0xd9923c));
  head.scale.set(1.25, 1, 0.9);
  mascot.add(head);
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.55, 18, 14), toon(0xf6d9a6));
  snout.position.set(0, -0.2, 0.75);
  snout.scale.set(1.1, 0.8, 1);
  mascot.add(snout);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), toon(0x2a1a2e));
  nose.position.set(0, 0.0, 1.22);
  mascot.add(nose);
  const noseShine = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), glow(0xffffff, 0.9));
  noseShine.position.set(-0.08, 0.08, 1.45);
  mascot.add(noseShine);
  const eyeG: THREE.Group[] = [];
  for (const sx of [-1, 1]) {
    const eg = new THREE.Group();
    eg.position.set(sx * 0.55, 0.35, 0.78);
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 10), toon(0xffffff));
    eg.add(w);
    const pu = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), toon(0x1c1228));
    pu.position.z = 0.2;
    eg.add(pu);
    mascot.add(eg);
    eyeG.push(eg);
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.9, 6), toon(0xb8741f));
    ear.position.set(sx * 1.05, 0.95, 0);
    ear.rotation.z = -sx * 0.4;
    mascot.add(ear);
  }
  const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.85, 0.35, 16), toon(0x6c4a2a));
  hat.position.set(0, 1.05, 0);
  mascot.add(hat);
  const hatTop = new THREE.Mesh(new THREE.SphereGeometry(0.62, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon(0x7d5733));
  hatTop.position.set(0, 1.15, 0);
  mascot.add(hatTop);

  let lastAspect = 0;
  let lastN = 0;
  let lastOdd = -1;
  let lastOk = 0;
  let lastBad = 0;
  let t = 0;
  let boardShake = 0;
  let mood = 0; // >0 freudig, <0 enttäuscht
  const bp = new THREE.Vector3();
  let geom = { cx: 0, cy: 0, cw: 1, ch: 1, bw: 1, bh: 1, H: 1, W: 1 };
  let cursorOn = false;

  const cellPos = (n: number, i: number): { x: number; y: number } => {
    const c = i % n;
    const r = Math.floor(i / n);
    return { x: geom.cx - geom.bw / 2 + (c + 0.5) * geom.cw, y: geom.cy + geom.bh / 2 - (r + 0.5) * geom.ch };
  };

  const layout = () => {
    lastAspect = camera.aspect;
    camera.position.set(0, 0, D);
    camera.lookAt(0, 0, 0);
    const H = D * Math.tan((camera.fov * Math.PI) / 360);
    const W = H * camera.aspect;
    const bw = (BOARD.x1 - BOARD.x0) * W;
    const bh = (BOARD.y1 - BOARD.y0) * H;
    const cx = ((BOARD.x0 + BOARD.x1) / 2) * W;
    const cy = ((BOARD.y0 + BOARD.y1) / 2) * H;
    geom = { cx, cy, cw: 1, ch: 1, bw, bh, H, W };
    const pad = 0.12;
    frame.scale.set(bw + pad * 2 + 0.4, bh + pad * 2 + 0.4, 1);
    frame.position.set(cx, cy, -0.3);
    boardFace.scale.set(bw + pad * 2, bh + pad * 2, 1);
    boardFace.position.set(cx, cy, -0.12);
    tray.scale.set(Math.min(bw * 0.5, 6), 1, 1);
    tray.position.set(cx, cy - bh / 2 - pad - 0.3, 0.1);
    chalkA.position.set(cx - 0.5, cy - bh / 2 - pad - 0.12, 0.25);
    chalkB.position.set(cx + 0.2, cy - bh / 2 - pad - 0.12, 0.25);
    mascot.position.set(cx + bw / 2 - 1.2, -H * 1.0 + 0.45, 1.0);
    mascot.scale.setScalar(Math.min(0.62, H * 0.13));
    lastN = 0;
  };
  layout();

  const applyCells = (s: SpuerState) => {
    const n = s.n;
    geom.cw = geom.bw / n;
    geom.ch = geom.bh / n;
    const sz = Math.min(geom.cw, geom.ch);
    for (let i = 0; i < MAXC; i++) {
      const cv = cellsV[i] as CellView;
      const on = i < n * n;
      cv.tile.visible = cv.sym.visible = on;
      if (!on) continue;
      const cell = s.cells[i];
      if (!cell) continue;
      cv.sym.geometry = symGeos[cell.shape] as THREE.BufferGeometry;
      cv.sym.material = toon(PALETTE[cell.color] as number);
      cv.sym.rotation.z = (cell.rot * Math.PI) / 2;
      const p = cellPos(n, i);
      cv.tile.position.set(p.x, p.y, 0);
      cv.tile.userData.base = { x: p.x, y: p.y, w: geom.cw * 0.94, h: geom.ch * 0.94 };
      cv.sym.userData.size = sz * 0.74;
      cv.delay = (Math.floor(i / n) + (i % n)) * 0.035;
      cv.age = 0;
      cv.flash = 0;
      cv.shake = 0;
    }
    lastN = n;
  };

  return {
    update(s, dt) {
      t += dt;
      if (Math.abs(camera.aspect - lastAspect) > 0.001) {
        layout();
        applyCells(s);
      }
      const newRound = s.okSeq !== lastOk;
      if (newRound) {
        // Fund: Burst am bisherigen abweichenden Symbol
        if (lastN > 0 && lastOdd >= 0) {
          const p = cellPos(lastN, lastOdd);
          bp.set(p.x, p.y, 1);
          ctx.burst(bp, 0xffe066, 26);
          ctx.burst(bp, 0x7dff8a, 14);
        }
        ctx.sfx(s.lastBonus > 60 ? 'win' : 'coin');
        mood = 1;
        lastOk = s.okSeq;
      }
      if (newRound || s.n !== lastN || (cellsV[0] as CellView).sym.userData.size === undefined) applyCells(s);
      if (s.badSeq !== lastBad) {
        lastBad = s.badSeq;
        const cv = cellsV[s.lastCell] as CellView | undefined;
        if (cv) {
          cv.shake = 1;
          cv.flash = 1;
          const p = cellPos(s.n, s.lastCell);
          bp.set(p.x, p.y, 1);
          ctx.burst(bp, 0xff4d6d, 10);
        }
        ctx.sfx('bad');
        boardShake = 0.5;
        mood = -1;
      }
      lastOdd = s.oddIdx;
      mood *= Math.max(0, 1 - dt * 1.4);
      boardShake = Math.max(0, boardShake - dt);

      const sx = Math.sin(t * 60) * boardShake * 0.06;
      for (let i = 0; i < s.n * s.n; i++) {
        const cv = cellsV[i] as CellView;
        cv.age += dt;
        cv.flash = Math.max(0, cv.flash - dt * 2.2);
        cv.shake = Math.max(0, cv.shake - dt * 2.5);
        const b = cv.tile.userData.base as { x: number; y: number; w: number; h: number };
        const k = Math.max(0, Math.min(1, (cv.age - cv.delay) / 0.38));
        const pop = k === 0 ? 0.001 : 1 + Math.sin(k * Math.PI) * 0.18 * (1 - k) * 2 - (1 - k) * (1 - k) * 0.9;
        const wob = Math.sin(t * 50) * cv.shake * 0.08;
        cv.tile.position.set(b.x + sx + wob, b.y, 0);
        cv.tile.scale.set(b.w * Math.max(0.001, pop), b.h * Math.max(0.001, pop), 1);
        const m = cv.tile.material as THREE.MeshToonMaterial;
        m.emissive.setHex(0xff2d4d);
        m.emissiveIntensity = cv.flash * 0.8;
        const size = cv.sym.userData.size as number;
        cv.sym.position.set(b.x + sx + wob, b.y, 0.2);
        // Diskrete Eigenbewegung: sanftes Atmen verrät nichts über das abweichende Symbol
        const breathe = 1 + Math.sin(t * 2 + i * 0.7) * 0.03;
        cv.sym.scale.setScalar(size * Math.max(0.001, pop) * breathe);
      }

      // Cursor
      cursorOn = s.useCursor;
      cursor.visible = cursorOn;
      if (cursorOn) {
        const p = cellPos(s.n, s.curR * s.n + s.curC);
        const w = geom.cw * 0.98;
        const h = geom.ch * 0.98;
        const th = Math.min(w, h) * 0.07;
        cursor.position.set(p.x + sx, p.y, 0.45);
        const pulse = 1 + Math.sin(t * 8) * 0.03;
        (bars[0] as THREE.Mesh).scale.set(w * pulse, th, 1);
        (bars[0] as THREE.Mesh).position.set(0, h / 2, 0);
        (bars[1] as THREE.Mesh).scale.set(w * pulse, th, 1);
        (bars[1] as THREE.Mesh).position.set(0, -h / 2, 0);
        (bars[2] as THREE.Mesh).scale.set(th, h * pulse, 1);
        (bars[2] as THREE.Mesh).position.set(-w / 2, 0, 0);
        (bars[3] as THREE.Mesh).scale.set(th, h * pulse, 1);
        (bars[3] as THREE.Mesh).position.set(w / 2, 0, 0);
      }

      // Maskottchen: schnüffelt, nickt bei Erfolg, schüttelt bei Fehler
      const sniff = 1 + Math.sin(t * 9) * 0.05 * (1 + Math.max(0, -mood));
      nose.scale.setScalar(sniff);
      mascot.position.y = -geom.H * 1.0 + 0.45 + Math.max(0, mood) * 0.35 * Math.abs(Math.sin(t * 10)) + (mood < 0 ? -0.1 : 0);
      mascot.rotation.z = mood < 0 ? Math.sin(t * 30) * 0.12 * -mood : Math.sin(t * 1.3) * 0.05;
      const target = cellPos(s.n, s.curR * s.n + s.curC);
      const lookX = Math.max(-1, Math.min(1, (target.x - mascot.position.x) / geom.W));
      eyeG.forEach((e) => {
        e.rotation.y = lookX * 0.4;
        e.rotation.x = -0.25;
      });
      void mood;
    },
    dispose() {
      symGeos.forEach((g) => g.dispose());
    },
  };
};
