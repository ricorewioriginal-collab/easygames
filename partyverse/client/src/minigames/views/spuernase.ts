import * as THREE from 'three';
import { BOARD, isGold, type SpuerState } from '@shared/minigames/games/spuernase';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';
import { makeMe, makeRivals, updateRivals } from './rivals';

const PALETTE = [0xff3b4e, 0xff9a2e, 0xffd93b, 0x7ddf3f, 0x27c8b5, 0x3b82ff, 0x9a5bff, 0xff5fb7];
const MAXC = 49;

function shapeOf(kind: number): THREE.Shape {
  const sh = new THREE.Shape();
  const poly = (pts: Array<[number, number]>) => {
    sh.moveTo((pts[0] as [number, number])[0], (pts[0] as [number, number])[1]);
    for (let i = 1; i < pts.length; i++)
      sh.lineTo((pts[i] as [number, number])[0], (pts[i] as [number, number])[1]);
    sh.closePath();
  };
  switch (kind) {
    case 0:
      poly([
        [0, 0.5],
        [0.48, 0.02],
        [0.18, 0.02],
        [0.18, -0.5],
        [-0.18, -0.5],
        [-0.18, 0.02],
        [-0.48, 0.02],
      ]);
      break;
    case 1:
      poly([
        [0, 0.5],
        [0.5, -0.38],
        [-0.5, -0.38],
      ]);
      break;
    case 2:
      poly([
        [-0.42, -0.46],
        [0.46, -0.46],
        [0.46, -0.1],
        [-0.06, -0.1],
        [-0.06, 0.46],
        [-0.42, 0.46],
      ]);
      break;
    case 3:
      sh.absarc(0, 0, 0.48, 0, Math.PI * 2, false);
      break;
    case 4:
      poly([
        [-0.4, -0.4],
        [0.4, -0.4],
        [0.4, 0.4],
        [-0.4, 0.4],
      ]);
      break;
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
      for (let i = 0; i < 6; i++)
        pts.push([Math.cos((i * Math.PI) / 3) * 0.5, Math.sin((i * Math.PI) / 3) * 0.5]);
      poly(pts);
      break;
    }
    default:
      poly([
        [-0.15, -0.5],
        [0.15, -0.5],
        [0.15, -0.15],
        [0.5, -0.15],
        [0.5, 0.15],
        [0.15, 0.15],
        [0.15, 0.5],
        [-0.15, 0.5],
        [-0.15, 0.15],
        [-0.5, 0.15],
        [-0.5, -0.15],
        [-0.15, -0.15],
      ]);
  }
  return sh;
}

/** Klassenzimmer-Tafel: bunte Kreide-Symbole auf grüner Tafel, unten stehen alle Spieler und fiebern mit. */
export const createView: MiniGameViewFactory<SpuerState> = (ctx) => {
  const { root, camera } = ctx;
  ctx.scene.background = new THREE.Color(0xf0d7a1);
  const D = 10;
  const symGeos = Array.from({ length: 8 }, (_, i) => {
    const g = new THREE.ExtrudeGeometry(shapeOf(i), {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.04,
      bevelSegments: 2,
      curveSegments: 14,
    });
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
  interface CellView {
    tile: THREE.Mesh;
    sym: THREE.Mesh;
    delay: number;
    age: number;
    shake: number;
    flash: number;
  }
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

  // Spieler unter der Tafel: eigene Figur rechts (groß), Mitspieler links mit Fund-Zähler
  const me = makeMe(ctx, 0.8);
  const rivals = makeRivals(ctx, 0.62);
  const rivalSeen = rivals.map(() => ({ ok: 0, bad: 0, found: -1 }));
  const rivalTags: Array<THREE.Sprite | null> = rivals.map(() => null);
  const rivalTag = (i: number, found: number): void => {
    rivalTags[i]?.removeFromParent();
    rivalTags[i]?.material.map?.dispose();
    rivalTags[i]?.material.dispose();
    const col = '#' + (rivals[i]!.avatar.color & 0xffffff).toString(16).padStart(6, '0');
    const sp = textSprite(`${found}`, { color: '#ffffff', bg: col, size: 56, width: 0.55 });
    root.add(sp);
    rivalTags[i] = sp;
  };
  const popups: Array<{ sp: THREE.Sprite; t: number; y0: number }> = [];
  const popup = (text: string, x: number, y: number, color: string, w = 2): void => {
    const sp = textSprite(text, { color, bg: 'rgba(20,12,40,0.75)', size: 64, width: w * popScale });
    const lim = geom.W * 0.9 - (w * popScale) / 2;
    sp.position.set(Math.max(-lim, Math.min(lim, x)), y, 0.6);
    root.add(sp);
    popups.push({ sp, t: 0, y0: y });
  };
  let popScale = 1;
  let lastTotal = 0;
  let lastBlinks = 0;
  let blinkT = 0;
  let wasDone = false;

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
    // Figuren stehen auf der Leiste unter der Tafel
    // (Figuren stehen näher an der Kamera: dort ist das sichtbare Feld etwas kleiner)
    const zf = 0.9;
    const Hz = (H * (D - zf)) / D;
    const Wz = (W * (D - zf)) / D;
    const avail = (1 + BOARD.y0) * Hz - 0.12;
    const figS = Math.max(0.32, Math.min(0.8, avail / 1.75));
    const floorY = -Hz + 0.04;
    me.group.position.set(Wz * 0.86 - 0.5 * figS, floorY, zf);
    me.group.scale.setScalar(figS);
    const step = Math.min(1.3, Wz * 0.2) * Math.max(0.7, figS / 0.6);
    rivals.forEach((r, i) => {
      r.group.position.set(-Wz * 0.86 + 0.4 * figS + i * step, floorY, zf);
      r.group.scale.setScalar(figS * 0.85);
    });
    popScale = Math.max(0.6, Math.min(1, W / 6));
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
        const gain = s.total - lastTotal;
        if (lastN > 0 && lastOdd >= 0) {
          const p = cellPos(lastN, lastOdd);
          popup(`+${gain}`, p.x, p.y + 0.25, isGold(s.found - 1) ? '#ffd23f' : '#ffffff', 1.1);
          if (s.streak >= 2) popup(`Kombo ×${s.streak}`, p.x, p.y - 0.3, '#7dff8a', 1.8);
        }
        me.rig.play(isGold(s.found - 1) || s.streak >= 3 ? 'celebrate' : 'jump');
      }
      lastTotal = s.total;
      if (s.blinks !== lastBlinks) {
        lastBlinks = s.blinks;
        blinkT = 0.45;
        ctx.sfx('whoosh');
        boardShake = 0.25;
      }
      blinkT = Math.max(0, blinkT - dt);
      // Goldtafel: goldener Rahmen
      frame.material = isGold(s.found)
        ? toon(0xffc93c, { emissive: 0xff9a00, emissiveIntensity: 0.35 })
        : toon(0xa8672f);
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
        me.rig.play('shock');
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
        const pop =
          k === 0 ? 0.001 : 1 + Math.sin(k * Math.PI) * 0.18 * (1 - k) * 2 - (1 - k) * (1 - k) * 0.9;
        const wob = Math.sin(t * 50) * cv.shake * 0.08;
        cv.tile.position.set(b.x + sx + wob, b.y, 0);
        cv.tile.scale.set(b.w * Math.max(0.001, pop), b.h * Math.max(0.001, pop), 1);
        const m = cv.tile.material as THREE.MeshToonMaterial;
        m.emissive.setHex(0xff2d4d);
        m.emissiveIntensity = cv.flash * 0.8;
        const size = cv.sym.userData.size as number;
        cv.sym.position.set(b.x + sx + wob, b.y, 0.2);
        // Blinzeln: alle Symbole drehen sich gleichzeitig um – man sieht nicht, wohin der Ausreißer springt
        cv.sym.rotation.y = blinkT > 0 ? (1 - blinkT / 0.45) * Math.PI * 2 : 0;
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

      // Eigene Figur: schaut auf die Tafel bzw. den Cursor, jubelt am Ende
      const target = cellPos(s.n, s.curR * s.n + s.curC);
      me.rig.lookAt(bp.set(target.x, target.y, 0));
      me.rig.faceTowards(-0.35);
      const done = s.clock >= 30 * 60;
      if (done && !wasDone) {
        wasDone = true;
        me.rig.play(s.found >= 6 ? 'celebrate' : s.found >= 3 ? 'cheer' : 'lose');
      }
      me.rig.update(dt);
      for (let i = popups.length - 1; i >= 0; i--) {
        const p = popups[i]!;
        p.t += dt;
        p.sp.position.y = p.y0 + p.t * 0.9;
        p.sp.material.opacity = Math.max(0, 1.2 - p.t);
        if (p.t > 1.2) {
          p.sp.removeFromParent();
          p.sp.material.map?.dispose();
          p.sp.material.dispose();
          popups.splice(i, 1);
        }
      }
      void mood;
    },
    ghosts(states, dt) {
      updateRivals(rivals, states, dt, (r, rs, i) => {
        const seen = rivalSeen[i]!;
        if (rs.okSeq !== seen.ok) {
          seen.ok = rs.okSeq;
          r.rig.play(rs.streak >= 3 ? 'celebrate' : 'jump');
          bp.copy(r.group.position).setY(r.group.position.y + 1);
          ctx.burst(bp, r.avatar.color, 8);
        }
        if (rs.badSeq !== seen.bad) {
          seen.bad = rs.badSeq;
          r.rig.play('shock');
        }
        if (rs.found !== seen.found) {
          seen.found = rs.found;
          rivalTag(i, rs.found);
        }
        const tag = rivalTags[i];
        if (tag) {
          tag.position.set(
            r.group.position.x + 0.45 * r.group.scale.y,
            r.group.position.y + 1.7 * r.group.scale.y,
            1,
          );
          tag.scale.set(0.55 * popScale, (0.55 * popScale * tag.scale.y) / tag.scale.x, 1);
        }
        r.rig.faceTowards(0.25);
      });
      rivalTags.forEach((tg, i) => tg && (tg.visible = states[i] != null));
    },
    dispose() {
      symGeos.forEach((g) => g.dispose());
    },
  };
};
