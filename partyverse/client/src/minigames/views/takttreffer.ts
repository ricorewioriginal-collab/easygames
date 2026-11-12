import * as THREE from 'three';
import { FEVER, bpmAt, multiplier, type BeatState } from '@shared/minigames/games/takttreffer';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';
import { makeMe, makeRivals, updateRivals } from './rivals';

const LANE_COLORS = [0xff4d8d, 0x39d6ff, 0xffd23f];
const LANE_X = [-2.1, 0, 2.1];
const SPEED = 20; // Einheiten pro Sekunde
const SOUNDS = ['beep', 'coin', 'jump'];
const WHITE = new THREE.Color(0xffffff);

/**
 * Neon-Autobahn: drei Spuren, Noten sind leuchtende Trommelpads, Haltenoten ziehen einen Leuchtschweif, Bomben sind
 * dunkle Stachelkugeln. Die eigene Figur tanzt groß am Horizont, die Mitspieler auf Säulen am Rand (Höhe = Punkte).
 */
export const createView: MiniGameViewFactory<BeatState> = (ctx) => {
  const { root, camera } = ctx;
  ctx.scene.background = new THREE.Color(0x120a38);
  ctx.scene.fog = new THREE.Fog(0x120a38, 20, 46);

  // Spur
  const road = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.3, 70), toon(0x241a63));
  road.position.set(0, -0.2, -26);
  root.add(road);
  const laneMats: THREE.MeshBasicMaterial[] = [];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.95, 70), glow(LANE_COLORS[i] as number, 0.12));
    m.rotation.x = -Math.PI / 2;
    m.position.set(LANE_X[i] as number, -0.04, -26);
    root.add(m);
    laneMats.push(m.material as THREE.MeshBasicMaterial);
  }
  for (const x of [-3.15, -1.05, 1.05, 3.15]) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 70), glow(0x9a8cff, 0.85));
    l.position.set(x, 0, -26);
    root.add(l);
  }
  // Trefferlinie und Pads
  const line = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.08, 0.14), glow(0xffffff, 0.9));
  line.position.set(0, 0.04, 0);
  root.add(line);
  const pads: THREE.Mesh[] = [];
  const padRings: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.22, 28), toon(0x2d2470));
    pad.position.set(LANE_X[i] as number, -0.02, 0);
    root.add(pad);
    pads.push(pad);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.85, 0.07, 8, 32),
      glow(LANE_COLORS[i] as number, 0.95),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(LANE_X[i] as number, 0.2, 0);
    root.add(ring);
    padRings.push(ring);
  }

  // Noten
  const POOL = 28;
  const noteGeo = new THREE.SphereGeometry(0.85, 20, 12);
  const notes = new THREE.InstancedMesh(noteGeo, toon(0xffffff), POOL);
  notes.frustumCulled = false;
  root.add(notes);
  const rimGeo = new THREE.TorusGeometry(0.87, 0.07, 6, 24);
  const rims = new THREE.InstancedMesh(rimGeo, glow(0xffffff, 0.9), POOL);
  rims.frustumCulled = false;
  root.add(rims);
  // Bomben (dunkle Stachelkugeln) und Schweife der Haltenoten
  const BPOOL = 10;
  const bombs = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.62, 0),
    toon(0x2a0f3a, { emissive: 0xff1040, emissiveIntensity: 0.25 }),
    BPOOL,
  );
  bombs.frustumCulled = false;
  root.add(bombs);
  const spikes = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.95, 0), glow(0xff2050, 0.85), BPOOL);
  spikes.frustumCulled = false;
  root.add(spikes);
  const TPOOL = 6;
  const tailMat = glow(0xffffff, 0.55);
  tailMat.depthWrite = false;
  const tails = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), tailMat, TPOOL);
  tails.frustumCulled = false;
  root.add(tails);
  const tmp = new THREE.Object3D();
  const col = new THREE.Color();
  const hide = (m: THREE.InstancedMesh, from: number, to: number) => {
    tmp.position.set(0, -50, 0);
    tmp.rotation.set(0, 0, 0);
    tmp.scale.setScalar(0.001);
    tmp.updateMatrix();
    for (let i = from; i < to; i++) m.setMatrixAt(i, tmp.matrix);
    m.instanceMatrix.needsUpdate = true;
  };

  // Equalizer-Säulen links und rechts
  const EQ = 10;
  const eqGeo = new THREE.BoxGeometry(1, 1, 1);
  const eq = new THREE.InstancedMesh(eqGeo, toon(0xffffff), EQ * 2);
  root.add(eq);
  for (let i = 0; i < EQ * 2; i++)
    eq.setColorAt(i, col.setHex([0xff4d8d, 0x39d6ff, 0xffd23f, 0x7dff8a][i % 4] as number));

  // Eigene Figur tanzt groß auf einer Bühne am Horizont
  const stage = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.2, 1.4, 28), toon(0x3d2f9a));
  stage.position.set(0, 0.2, -22);
  root.add(stage);
  const stageRing = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.08, 6, 40), glow(0xff4d8d, 0.9));
  stageRing.rotation.x = Math.PI / 2;
  stageRing.position.set(0, 0.92, -22);
  root.add(stageRing);
  const me = makeMe(ctx, 2.6);
  me.group.position.set(0, 0.9, -22);
  me.rig.play('dance', { loop: true });
  let meReact = 0;

  // Mitspieler auf Säulen links und rechts; Säulenhöhe zeigt ihre Punkte
  const RIVAL_SPOTS: Array<[number, number]> = [
    [-5.4, -5],
    [5.4, -5],
    [-6.6, -12],
  ];
  /** Hochformat: Säulen weiter hinten, damit sie im schmalen Bild bleiben */
  const RIVAL_SPOTS_TALL: Array<[number, number]> = [
    [-4.3, -14],
    [4.3, -14],
    [4.7, -24],
  ];
  const rivals = makeRivals(ctx, 1.0);
  const rivalCols = rivals.map((r, i) => {
    const [x, z] = RIVAL_SPOTS[i % 3] as [number, number];
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 1, 16), toon(0x2d2470));
    col.position.set(x, 0, z);
    root.add(col);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.06, 6, 24), glow(r.avatar.color, 0.95));
    rim.rotation.x = Math.PI / 2;
    root.add(rim);
    r.group.position.set(x, 0, z);
    r.rig.play('dance', { loop: true });
    return { col, rim, x, z, h: 0.3, seq: 0 };
  });
  let myPoints = 0;

  // Wertungstexte und Multiplikator
  const JUDGE_W: Record<string, number> = {
    perfect: 3.6,
    good: 2.0,
    miss: 3.0,
    hold: 3.6,
    drop: 3.4,
    bomb: 3.8,
  };
  const judgeSprites: Record<string, THREE.Sprite> = {
    perfect: textSprite('PERFEKT!', { color: '#fff176', size: 64, width: 3.6 }),
    good: textSprite('Gut', { color: '#7dff8a', size: 64, width: 2.0 }),
    miss: textSprite('Daneben', { color: '#ff6b81', size: 64, width: 3.0 }),
    hold: textSprite('GEHALTEN!', { color: '#7dfcff', size: 64, width: 3.6 }),
    drop: textSprite('Losgelassen', { color: '#ffb36b', size: 64, width: 3.4 }),
    bomb: textSprite('BOMBE −100', { color: '#ffffff', bg: '#d0204a', size: 64, width: 3.8 }),
  };
  judgeSprites.stray = judgeSprites.miss as THREE.Sprite;
  const feverSign = textSprite('FEVER ×4!', { color: '#2a0a40', bg: '#ffd23f', size: 64, width: 3.6 });
  feverSign.material.fog = false;
  feverSign.visible = false;
  root.add(feverSign);
  for (const k of Object.keys(JUDGE_W)) {
    const sp = judgeSprites[k] as THREE.Sprite;
    sp.userData.h = sp.scale.y;
    sp.material.fog = false;
    sp.visible = false;
    root.add(sp);
  }
  const multSprites = [1, 2, 3, 4].map((m) => {
    const sp = textSprite(`x${m}`, {
      color: '#ffffff',
      bg: m === 1 ? '#3b3189' : '#ff4d8d',
      size: 56,
      width: 1.5,
    });
    sp.material.fog = false;
    sp.position.set(4.3, 1.4, -1);
    sp.visible = m === 1;
    root.add(sp);
    return sp;
  });

  let vt = 0;
  let beat = 0;
  let t = 0;
  let lastSeq = 0;
  let judgeAge = 9;
  let judgeKey = 'perfect';
  let lastAspect = 0;
  const padHit = [0, 0, 0];
  const bp = new THREE.Vector3();
  let lastMult = 1;
  let shake = 0;
  const camBase = new THREE.Vector3();

  const placeCamera = () => {
    lastAspect = camera.aspect;
    if (camera.aspect < 1)
      camera.position.set(0, 8.2 + (1 - camera.aspect) * 3, 10.5 + (1 - camera.aspect) * 4);
    else camera.position.set(0, 5.2, 7.2);
    camera.lookAt(0, 0, -5.5);
    camBase.copy(camera.position);
    const spots = camera.aspect < 1 ? RIVAL_SPOTS_TALL : RIVAL_SPOTS;
    rivalCols.forEach((c, i) => {
      [c.x, c.z] = spots[i % 3] as [number, number];
      c.col.position.x = c.x;
      c.col.position.z = c.z;
    });
  };
  placeCamera();

  return {
    update(s, dt) {
      t += dt;
      if (Math.abs(camera.aspect - lastAspect) > 0.001) placeCamera();
      vt += dt * 60;
      vt += (s.t - vt) * 0.15;
      if (Math.abs(vt - s.t) > 4) vt = s.t;
      beat += (dt * bpmAt(vt)) / 60;
      const pulse = Math.pow(1 - (beat % 1), 3);

      // Noten zeichnen
      let n = 0;
      let nb = 0;
      let nt = 0;
      const zOf = (tick: number) => -(tick - vt) * (SPEED / 60);
      for (let i = s.head > 6 ? s.head - 6 : 0; i < s.notes.length; i++) {
        const note = s.notes[i]!;
        const ahead = note.t - vt;
        if (ahead > 1.7 * 60) break;
        // Schweif der Haltenote: von der Linie (wenn gehalten) bzw. vom Kopf bis zum Ende
        if (note.len > 0 && nt < TPOOL && note.hold !== 2 && note.hold !== 3) {
          const z0 = note.hold === 1 ? 0 : zOf(note.t);
          const z1 = zOf(note.t + note.len);
          if (z0 > z1 && z0 > -60) {
            const held = note.hold === 1;
            tmp.position.set(LANE_X[note.lane] as number, 0.2, (z0 + z1) / 2);
            tmp.rotation.set(0, 0, 0);
            tmp.scale.set(held ? 1.25 : 0.9, held ? 0.26 : 0.16, z0 - z1);
            tmp.updateMatrix();
            tails.setMatrixAt(nt, tmp.matrix);
            tails.setColorAt(
              nt,
              col.setHex(LANE_COLORS[note.lane] as number).lerp(held ? WHITE : col, held ? 0.35 * pulse : 0),
            );
            nt++;
          }
        }
        if (ahead < -22) continue;
        if (note.res === 1 || note.res === 2) continue;
        const z = -ahead * (SPEED / 60);
        if (note.bomb) {
          if (note.res !== 0 || nb >= BPOOL) continue;
          tmp.position.set(LANE_X[note.lane] as number, 0.6, z);
          tmp.rotation.set(t * 2, t * 3 + i, 0);
          tmp.scale.setScalar(1 + pulse * 0.12);
          tmp.updateMatrix();
          bombs.setMatrixAt(nb, tmp.matrix);
          tmp.scale.setScalar(0.85 + pulse * 0.15);
          tmp.rotation.set(t * 2 + 0.6, t * 3 + i + 0.4, 0.3);
          tmp.updateMatrix();
          spikes.setMatrixAt(nb, tmp.matrix);
          nb++;
          continue;
        }
        if (n >= POOL) continue;
        tmp.position.set(LANE_X[note.lane] as number, 0.35, z);
        tmp.rotation.set(0, 0, 0);
        const missed = note.res === 3;
        tmp.scale.set(1, 0.5, 1).multiplyScalar(missed ? 0.8 : 1);
        tmp.updateMatrix();
        notes.setMatrixAt(n, tmp.matrix);
        notes.setColorAt(n, col.setHex(missed ? 0x555069 : (LANE_COLORS[note.lane] as number)));
        tmp.position.y = 0.56;
        tmp.rotation.x = Math.PI / 2;
        tmp.scale.setScalar(missed ? 0.8 : note.len ? 1.12 : 1);
        tmp.updateMatrix();
        rims.setMatrixAt(n, tmp.matrix);
        rims.setColorAt(n, col.setHex(missed ? 0x2b2840 : note.len ? 0x7dfcff : 0xffffff));
        tmp.rotation.x = 0;
        n++;
      }
      for (let i = n; i < POOL; i++) {
        tmp.position.set(0, -50, 0);
        tmp.scale.setScalar(0.001);
        tmp.updateMatrix();
        notes.setMatrixAt(i, tmp.matrix);
        rims.setMatrixAt(i, tmp.matrix);
      }
      hide(bombs, nb, BPOOL);
      hide(spikes, nb, BPOOL);
      hide(tails, nt, TPOOL);
      bombs.instanceMatrix.needsUpdate = true;
      spikes.instanceMatrix.needsUpdate = true;
      tails.instanceMatrix.needsUpdate = true;
      if (tails.instanceColor) tails.instanceColor.needsUpdate = true;
      notes.instanceMatrix.needsUpdate = true;
      rims.instanceMatrix.needsUpdate = true;
      if (notes.instanceColor) notes.instanceColor.needsUpdate = true;
      if (rims.instanceColor) rims.instanceColor.needsUpdate = true;

      // Wertung
      if (s.judgeSeq !== lastSeq) {
        lastSeq = s.judgeSeq;
        const k = s.judgeKind === 'stray' ? 'miss' : s.judgeKind;
        const lane = s.judgeLane;
        if (k === 'perfect' || k === 'good' || k === 'hold') {
          padHit[lane] = 1;
          bp.set(LANE_X[lane] as number, 0.5, 0);
          ctx.burst(bp, k === 'hold' ? 0x7dfcff : (LANE_COLORS[lane] as number), k === 'good' ? 8 : 18);
          ctx.sfx(k === 'hold' ? 'coin' : (SOUNDS[lane] as string));
          if (s.combo > 0 && s.combo % 8 === 0) {
            ctx.sfx('win');
            me.rig.play('cheer');
            meReact = 1.2;
          }
          if (s.combo === FEVER) ctx.burst(bp.set(0, 3, -6), 0xffd23f, 40);
        } else if (k === 'bomb') {
          ctx.sfx('hit');
          bp.set(LANE_X[lane] as number, 0.6, 0);
          ctx.burst(bp, 0xff2050, 30);
          shake = 0.45;
          me.rig.play('shock');
          meReact = 0.9;
        } else if (k === 'miss' || k === 'drop') {
          ctx.sfx('bad');
          shake = Math.max(shake, 0.12);
        }
        if (k) {
          judgeKey = k;
          judgeAge = 0;
        }
      }
      judgeAge += dt;
      for (const k of Object.keys(JUDGE_W)) {
        const sp = judgeSprites[k] as THREE.Sprite;
        const vis = k === judgeKey && judgeAge < 0.7;
        sp.visible = vis;
        if (vis) {
          sp.position.set((LANE_X[s.judgeLane] as number) * 0.6, 1.6 + judgeAge * 1.4, 0.4);
          const sc = 1 + Math.sin(Math.min(1, judgeAge * 5) * Math.PI) * 0.2;
          const w = JUDGE_W[k] as number;
          sp.scale.set(w * sc, (sp.userData.h as number) * sc, 1);
          (sp.material as THREE.SpriteMaterial).opacity = Math.min(1, (0.7 - judgeAge) * 4);
        }
      }
      const mult = multiplier(s.combo);
      if (mult !== lastMult) {
        multSprites.forEach((m, i) => (m.visible = i + 1 === mult));
        if (mult > lastMult) ctx.sfx('good');
        lastMult = mult;
      }
      (multSprites[mult - 1] as THREE.Sprite).scale.setScalar(1 + pulse * 0.1);
      (multSprites[mult - 1] as THREE.Sprite).scale.set(1.5 * (1 + pulse * 0.1), 0.5 * (1 + pulse * 0.1), 1);

      // Pads
      for (let i = 0; i < 3; i++) {
        padHit[i] = Math.max(0, (padHit[i] as number) - dt * 5);
        const h = padHit[i] as number;
        (pads[i] as THREE.Mesh).scale.set(1 + h * 0.2, 1 - h * 0.5, 1 + h * 0.2);
        (padRings[i] as THREE.Mesh).scale.setScalar(1 + h * 0.3 + pulse * 0.06);
        laneMats[i]!.opacity = 0.1 + h * 0.4 + pulse * 0.05;
      }
      (line.material as THREE.MeshBasicMaterial).opacity = 0.6 + pulse * 0.4;

      // Equalizer
      for (let i = 0; i < EQ * 2; i++) {
        const side = i < EQ ? -1 : 1;
        const k = i % EQ;
        const h =
          1.2 + (0.5 + 0.5 * Math.sin(beat * 6.283 * 0.5 * (1 + (k % 3)) + k * 1.3)) * 3.2 + pulse * 1.2;
        tmp.position.set(side * (6 + k * 1.3), h / 2 - 0.4, -6 - k * 2.6);
        tmp.scale.set(0.9, h, 0.9);
        tmp.rotation.set(0, 0, 0);
        tmp.updateMatrix();
        eq.setMatrixAt(i, tmp.matrix);
      }
      eq.instanceMatrix.needsUpdate = true;

      // Eigene Figur: tanzt im Takt, reagiert auf Wertungen
      meReact = Math.max(0, meReact - dt);
      if (meReact <= 0 && me.rig.current !== 'dance') me.rig.play('dance', { loop: true });
      if (me.rig.current === 'dance') me.rig.play('dance', { loop: true, speed: bpmAt(vt) / 110 });
      me.group.position.y = 0.9 + pulse * 0.12;
      me.rig.update(dt);
      const fever = s.combo >= FEVER;
      (stageRing.material as THREE.MeshBasicMaterial).color.setHSL(fever ? (t * 0.8) % 1 : 0.93, 1, 0.6);
      stageRing.scale.setScalar(1 + pulse * 0.08);
      feverSign.visible = fever && Math.floor(t * 4) % 4 !== 0;
      feverSign.position.set(0, 5.2, -17);
      if (fever) for (let i = 0; i < 3; i++) laneMats[i]!.opacity += 0.08 + 0.06 * Math.sin(t * 12 + i * 2);
      myPoints = s.points;
      shake = Math.max(0, shake - dt);
      camera.position.set(
        camBase.x + Math.sin(t * 60) * shake * 0.3,
        camBase.y + Math.cos(t * 47) * shake * 0.2,
        camBase.z,
      );
      camera.lookAt(0, 0, -5.5);
    },
    ghosts(states, dt) {
      updateRivals(rivals, states, dt, (r, rs, i) => {
        const c = rivalCols[i]!;
        // Säulenhöhe: Punkte im Verhältnis zu den eigenen (gleich viel = gleich hoch wie die Mittelhöhe)
        const ref = Math.max(600, myPoints, rs.points);
        const want = 0.3 + (rs.points / ref) * 3.2;
        c.h += (want - c.h) * Math.min(1, dt * 3);
        c.col.scale.y = c.h;
        c.col.position.y = c.h / 2 - 0.2;
        c.rim.position.set(c.x, c.h - 0.18, c.z);
        r.group.position.set(c.x, c.h - 0.2, c.z);
        if (rs.judgeSeq !== c.seq) {
          c.seq = rs.judgeSeq;
          const k = rs.judgeKind;
          if (k === 'bomb' || k === 'miss' || k === 'drop') r.rig.play('shock');
          else if (rs.combo > 0 && rs.combo % 8 === 0) r.rig.play('cheer');
        }
        if (r.rig.current === 'idle') r.rig.play('dance', { loop: true, speed: bpmAt(rs.t) / 110 });
      });
      rivalCols.forEach((c, i) => {
        c.col.visible = c.rim.visible = states[i] != null;
      });
    },
    dispose() {
      /* Alles hängt an root und wird vom Stage freigegeben */
    },
  };
};
