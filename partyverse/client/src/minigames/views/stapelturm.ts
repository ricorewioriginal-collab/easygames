import * as THREE from 'three';
import type { TowerState } from '@shared/minigames/games/stapelturm';
import { FALL_TICKS, GOLD_EVERY, RANGE, WIND_FROM, heightOf } from '@shared/minigames/games/stapelturm';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';
import { makeMe, makeRivals, updateRivals } from './rivals';

const DEPTH = 3.2;
const BASE_PLATE = 9;
const ROPE = 5.5;

const GOLD = 0xffc533;
const isGoldIdx = (i: number): boolean => i > 0 && i % GOLD_EVERY === 0;
const blockColor = (i: number): number =>
  isGoldIdx(i) ? GOLD : new THREE.Color().setHSL((i * 0.073 + 0.02) % 1, 0.78, 0.5).getHex();
/** Mitspieler-Türme: schmaler und weiter hinten, aber gleiche Stockwerkshöhe (direkt vergleichbar) */
const RIVAL_TOWERS: Array<[number, number]> = [
  [-7.2, -7],
  [7.2, -7],
  [-11.5, -12],
];
const RIVAL_W = 0.42;
const RIVAL_MAX = 48;

/**
 * Baustelle auf einer Wiese: Portalkran mit Laufkatze, bunte Blöcke, Goldblöcke, Wolken. Die eigene Figur fährt auf
 * einer Hebebühne neben dem Turm mit nach oben, die Mitspieler bauen live ihre (schmaleren) Türme dahinter.
 * Die Kamera klettert mit dem Turm.
 */
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

  // Eigene Figur auf einer Hebebühne rechts neben dem Turm
  const lift = new THREE.Group();
  root.add(lift);
  const liftPlate = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.22, 1.5), toon(0x4a5a7a));
  liftPlate.position.y = -0.11;
  lift.add(liftPlate);
  const liftRail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1, 0.12), toon(0xffc83d));
  root.add(liftRail);
  const me = makeMe(ctx, 0.95);
  root.remove(me.group);
  lift.add(me.group);
  me.group.position.set(0, 0, 0.1);
  me.rig.faceTowards(-0.35);
  let liftY = 1;
  let meAnim = '';
  const playMe = (a: 'idle' | 'cheer' | 'celebrate' | 'shock' | 'lose' | 'jump') => {
    meAnim = a;
    me.rig.play(a, { loop: a === 'idle' });
  };

  // Mitspieler: eigene schmale Türme mit Figur obendrauf
  const rivals = makeRivals(ctx, 0.75);
  const rivalTowers = rivals.map((r, i) => {
    const [x, z] = RIVAL_TOWERS[i % 3] as [number, number];
    const inst = new THREE.InstancedMesh(blockGeo, toon(0xffffff), RIVAL_MAX);
    inst.count = 0;
    inst.position.set(x, 0, z);
    root.add(inst);
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.3, 1.8), toon(0xc9c3b8));
    base.position.set(x, -0.15, z);
    root.add(base);
    r.group.position.set(x, 0, z);
    return { inst, x, z, n: -1, seq: 0, y: 0 };
  });
  const rTmp = new THREE.Object3D();
  const rCol = new THREE.Color();

  // Einblendungen
  const sign = (txt: string, fg: string, bg: string, w: number): THREE.Sprite => {
    const sp = textSprite(txt, { color: fg, bg, size: 64, width: w });
    sp.material.fog = false;
    sp.visible = false;
    root.add(sp);
    return sp;
  };
  const growSign = sign('BREITER!', '#1b3a12', '#7dff8a', 3.0);
  const missSign = sign('DANEBEN! −1 Ersatz', '#ffffff', '#ff4d6d', 4.6);
  const goldSign = sign('GOLD +100!', '#5a3a00', '#ffd23f', 3.6);
  const windSign = sign('WIND!', '#ffffff', '#5b8cff', 2.2);
  let signT = 9;
  let signSp: THREE.Sprite | null = null;
  const showSign = (sp: THREE.Sprite) => {
    if (signSp) signSp.visible = false;
    signSp = sp;
    signT = 0;
  };
  const popCache = new Map<number, THREE.Sprite>();
  let pop: THREE.Sprite | null = null;
  let popT = 9;
  // Windstreifen
  const WS = 22;
  const windMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(2.2, 0.08, 0.08), glow(0xffffff, 0.7), WS);
  windMesh.count = 0;
  root.add(windMesh);
  let wasWindy = false;
  let shake = 0;

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
          shake = 0.4;
          if (s.phase !== 'over') showSign(missSign);
          playMe(s.phase === 'over' ? 'lose' : 'shock');
        } else {
          let sp = popCache.get(L.gain);
          if (!sp) {
            sp = textSprite(`+${L.gain}`, {
              color: '#ffffff',
              bg: L.gold ? '#e0a000' : L.perfect ? '#ff4d8d' : '#3d5aa8',
              size: 48,
              width: 1.6,
            });
            sp.material.fog = false;
            root.add(sp);
            popCache.set(L.gain, sp);
          }
          if (pop) pop.visible = false;
          pop = sp;
          popT = 0;
          pop.position.set(L.x, n + 1.6, 2);
          if (L.grow) showSign(growSign);
          else if (L.gold && L.perfect) showSign(goldSign);
          playMe(L.perfect ? 'celebrate' : L.cutW > 1.2 ? 'shock' : 'cheer');
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
        if (!s.lost) {
          ctx.sfx('win');
          playMe('celebrate');
        } else playMe('lose');
      }

      // Hebebühne mit eigener Figur: fährt neben dem obersten Block mit nach oben
      const top = s.blocks[s.blocks.length - 1];
      const liftX = Math.min(RANGE + 1.2, (top ? top.x + top.w / 2 : 2.5) + 1.0);
      liftY += (topY - liftY) * Math.min(1, dt * 5);
      lift.position.set(lift.position.x + (liftX - lift.position.x) * Math.min(1, dt * 6), liftY, 1.0);
      liftRail.scale.y = Math.max(0.1, liftY);
      liftRail.position.set(lift.position.x + 0.7, liftY / 2, 0.4);
      if (meAnim !== 'idle' && me.rig.current === 'idle' && s.phase !== 'over') meAnim = 'idle';
      me.rig.lookAt(s.phase === 'swing' ? v3.set(s.cx, topY + 2, 0) : null);
      me.rig.update(dt);

      // Einblendungen
      if (signSp) {
        signT += dt;
        signSp.visible = signT < 1.2;
        signSp.position.set(0, topY + 3.4 + signT * 0.6, 2.5);
        signSp.material.opacity = Math.min(1, (1.2 - signT) * 4);
      }
      if (pop) {
        popT += dt;
        pop.visible = popT < 0.9;
        pop.position.y += dt * 1.4;
        pop.material.opacity = Math.min(1, (0.9 - popT) * 4);
      }

      // Wind ab WIND_FROM
      const windy = n >= WIND_FROM && s.phase !== 'over';
      if (windy && !wasWindy) {
        showSign(windSign);
        ctx.sfx('whoosh');
      }
      wasWindy = windy;
      windMesh.count = windy ? WS : 0;
      if (windy) {
        for (let i = 0; i < WS; i++) {
          const cyc = (t * (0.6 + (i % 5) * 0.12) + i * 0.37) % 1;
          rTmp.position.set(-16 + cyc * 32, camY - 3 + ((i * 1.7) % 11), -3 + (i % 4) * 1.5);
          rTmp.rotation.set(0, 0, 0);
          rTmp.scale.set(0.6 + (i % 3) * 0.4, 1, 1);
          rTmp.updateMatrix();
          windMesh.setMatrixAt(i, rTmp.matrix);
        }
        windMesh.instanceMatrix.needsUpdate = true;
      }

      for (let i = 0; i < clouds.length; i++)
        (clouds[i] as THREE.Group).position.x += dt * (0.3 + (i % 3) * 0.15);
      for (const c of clouds) if (c.position.x > 24) c.position.x = -24;

      // Kamera folgt dem Turm
      camY += (Math.max(4, topY) - camY) * Math.min(1, dt * 3);
      const asp = camera.aspect || 1.6;
      // Hochformat etwas näher ran (Kranstützen dürfen knapp am Rand stehen)
      const hh = Math.max(7.2, (RANGE + (asp < 1 ? 2.2 : 3.2)) / asp);
      const dist = hh / Math.tan((camera.fov * Math.PI) / 360) + 3;
      shake = Math.max(0, shake - dt);
      camera.position.set(Math.sin(t * 55) * shake * 0.4, camY + 3.2, dist);
      camera.lookAt(0, camY + 2.2, 0);
    },
    ghosts(states, dt) {
      updateRivals(rivals, states, dt, (r, rs, i) => {
        const tw = rivalTowers[i]!;
        const h = heightOf(rs);
        if (h !== tw.n) {
          tw.n = h;
          const cnt = Math.min(RIVAL_MAX, rs.blocks.length);
          const from = rs.blocks.length - cnt;
          for (let k = 0; k < cnt; k++) {
            const b = rs.blocks[from + k]!;
            rTmp.position.set(b.x * RIVAL_W, from + k + 0.5, 0);
            rTmp.rotation.set(0, 0, 0);
            rTmp.scale.set(Math.max(0.05, b.w * RIVAL_W), 1, 1.4);
            rTmp.updateMatrix();
            tw.inst.setMatrixAt(k, rTmp.matrix);
            tw.inst.setColorAt(k, rCol.setHex(blockColor(from + k)));
          }
          tw.inst.count = cnt;
          tw.inst.instanceMatrix.needsUpdate = true;
          if (tw.inst.instanceColor) tw.inst.instanceColor.needsUpdate = true;
        }
        if (rs.seq !== tw.seq) {
          tw.seq = rs.seq;
          r.rig.play(
            rs.last.miss ? (rs.phase === 'over' ? 'lose' : 'shock') : rs.last.perfect ? 'cheer' : 'jump',
          );
        }
        const topB = rs.blocks[rs.blocks.length - 1];
        tw.y += (h + 1 - tw.y) * Math.min(1, dt * 5);
        r.group.position.set(tw.x + (topB ? topB.x * RIVAL_W : 0), tw.y, tw.z);
      });
      rivalTowers.forEach((tw, i) => (tw.inst.visible = states[i] != null));
    },
    dispose() {
      ctx.scene.fog = null;
    },
  };
};
