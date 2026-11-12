import * as THREE from 'three';
import {
  ARM,
  GOOD,
  ROUNDS,
  pendulumPos,
  roundKind,
  zoneCenter,
  type PendelRound,
  type PendelState,
} from '@shared/minigames/games/pendelpunkt';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';
import { makeMe, makeRivals, updateRivals, type Racer } from './rivals';

const XM = 3.7; // Weltbreite für Pendelposition ±1
const PIVOT_Y = 8.2;
const LEN = 6.6;
const FLOOR_Y = 0.34;
/** Mitspieler-Pendel hängen weiter hinten am langen Ausleger */
const RIVAL_Z = [-1.5, -2.9, -4.3];

interface Swing {
  rod: THREE.Mesh;
  seat: THREE.Group;
  racer: Racer;
  /** Fall nach dem Loslassen */
  fallY: number;
  fallV: number;
  landed: boolean;
  lastPhase: string;
  lastRound: number;
  z: number;
}

/**
 * Zirkusbühne: Die eigene Figur steht auf einer Trapez-Plattform am Pendel und lässt sich auf A in die Zielzone fallen.
 * Mitspieler schwingen halbdurchsichtig an eigenen Pendeln weiter hinten mit.
 */
export const createView: MiniGameViewFactory<PendelState> = (ctx) => {
  const { root, camera } = ctx;
  ctx.scene.background = new THREE.Color(0x8fd8ff);
  ctx.scene.fog = new THREE.Fog(0x8fd8ff, 30, 70);
  root.add(new THREE.HemisphereLight(0xffffff, 0x5a9a6a, 0.6));

  // Boden und Bühne
  const ground = new THREE.Mesh(new THREE.CylinderGeometry(10, 10.4, 0.6, 48), toon(0x58c779));
  ground.position.set(0, -0.3, -2);
  root.add(ground);
  const stage = new THREE.Mesh(new THREE.BoxGeometry(11, 0.3, 7.6), toon(0xffb347));
  stage.position.set(0, 0.15, -2.1);
  root.add(stage);
  const stageTop = new THREE.Mesh(new THREE.BoxGeometry(10.6, 0.06, 7.2), toon(0xffd98a));
  stageTop.position.set(0, 0.32, -2.1);
  root.add(stageTop);
  // Skalenstriche
  const ticks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 0.02, 0.5), toon(0xb87a1f), 21);
  const tmp = new THREE.Object3D();
  for (let i = 0; i < 21; i++) {
    tmp.position.set(((i - 10) / 10) * XM, 0.36, 1.1);
    tmp.scale.set(1, 1, i % 5 === 0 ? 1.6 : 1);
    tmp.updateMatrix();
    ticks.setMatrixAt(i, tmp.matrix);
  }
  root.add(ticks);

  // Gerüst: zwei Masten hinten, langer Ausleger nach vorn
  const postMat = toon(0xe8484f);
  const BACK_Z = -5.4;
  for (const sx of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, PIVOT_Y + 0.9, 10), postMat);
    post.position.set(sx * 5.6, (PIVOT_Y + 0.9) / 2, BACK_Z);
    root.add(post);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), toon(0xffd23f));
    cap.position.set(sx * 5.6, PIVOT_Y + 0.9, BACK_Z);
    root.add(cap);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.5, 0.6), toon(0xff7a3d));
  beam.position.set(0, PIVOT_Y + 0.4, BACK_Z);
  root.add(beam);
  const boom = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, -BACK_Z + 0.6), toon(0xff7a3d));
  boom.position.set(0, PIVOT_Y + 0.35, BACK_Z / 2 + 0.3);
  root.add(boom);
  for (let i = 0; i < 9; i++) {
    const f = new THREE.Mesh(
      new THREE.ConeGeometry(0.26, 0.6, 3),
      toon([0xff4d8d, 0x39d6ff, 0xffd23f, 0x7dff8a][i % 4] as number),
    );
    f.rotation.z = Math.PI;
    f.position.set(-5 + i * 1.25, PIVOT_Y + Math.sin(i * 0.7) * 0.1, BACK_Z + 0.4);
    root.add(f);
  }

  // Zielzone: Boden + Lichtvorhang (nur für die eigene Bahn vorne)
  const zone = new THREE.Group();
  root.add(zone);
  const zoneFloorMat = glow(0x39ff9a, 0.55);
  const zoneFloor = new THREE.Mesh(new THREE.BoxGeometry(1, 0.05, 2.2), zoneFloorMat);
  zoneFloor.position.set(0, 0.38, 0);
  zone.add(zoneFloor);
  const curtainMat = glow(0x39ff9a, 0.16);
  const curtain = new THREE.Mesh(new THREE.PlaneGeometry(1, PIVOT_Y - 2.2), curtainMat);
  curtain.position.set(0, (PIVOT_Y - 2.2) / 2 + 0.4, 0);
  zone.add(curtain);
  const centerLine = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 2.4), glow(0xffffff, 0.95));
  centerLine.position.set(0, 0.42, 0);
  zone.add(centerLine);
  const bull = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.06, 32), glow(0xffe066, 0.8));
  bull.position.set(0, 0.42, 0);
  zone.add(bull);
  const centerBeam = new THREE.Mesh(new THREE.BoxGeometry(0.04, PIVOT_Y - 2.2, 0.04), glow(0xffffff, 0.6));
  centerBeam.position.set(0, (PIVOT_Y - 2.2) / 2 + 0.4, 0);
  zone.add(centerBeam);
  const edgeL = new THREE.Mesh(new THREE.BoxGeometry(0.05, PIVOT_Y - 2.2, 0.05), glow(0x39ff9a, 0.7));
  const edgeR = edgeL.clone();
  edgeL.position.y = edgeR.position.y = (PIVOT_Y - 2.2) / 2 + 0.4;
  zone.add(edgeL, edgeR);

  // Pendel mit Trapez-Plattform
  const rodGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
  const makeSwing = (racer: Racer, z: number, ghost: boolean): Swing => {
    const rodMat = ghost
      ? new THREE.MeshBasicMaterial({ color: racer.avatar.color, transparent: true, opacity: 0.45 })
      : toon(0xfff1c2);
    const rod = new THREE.Mesh(rodGeo, rodMat);
    root.add(rod);
    const seat = new THREE.Group();
    const plateMat = ghost
      ? new THREE.MeshBasicMaterial({ color: racer.avatar.color, transparent: true, opacity: 0.4 })
      : toon(0xffc72c);
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.5, 0.16, 20), plateMat);
    seat.add(plate);
    if (!ghost) {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.06, 8, 24), toon(racer.avatar.color));
      rim.rotation.x = Math.PI / 2;
      seat.add(rim);
    }
    root.add(seat);
    racer.ring.visible = false;
    return { rod, seat, racer, fallY: 0, fallV: 0, landed: false, lastPhase: '', lastRound: -1, z };
  };
  const me = makeMe(ctx, 0.95);
  const mine = makeSwing(me, 0, false);
  const rivals = makeRivals(ctx, 0.85);
  const rivalSwings = rivals.map((r, i) => makeSwing(r, RIVAL_Z[i] ?? -5, true));
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.6, 20), glow(0x2c5a3a, 0.45));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.37;
  root.add(shadow);
  // Fallspur (Lot) – zeigt, wo die Figur landen würde
  const plumbMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 });
  const plumb = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1, 0.03), plumbMat);
  root.add(plumb);

  // Stopp-Welle
  const wave = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 6, 36), glow(0xffffff, 0));
  wave.rotation.x = Math.PI / 2;
  wave.position.y = 0.45;
  wave.visible = false;
  root.add(wave);

  // Rundenlaternen
  const lamps: THREE.Mesh[] = [];
  for (let i = 0; i < ROUNDS; i++) {
    const l = new THREE.Mesh(
      new THREE.SphereGeometry(0.27, 12, 10),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    );
    l.position.set((i - (ROUNDS - 1) / 2) * 0.95, 0.2, 1.85);
    root.add(l);
    lamps.push(l);
  }

  // Wolken und Hügel
  for (let i = 0; i < 6; i++) {
    const c = new THREE.Group();
    for (let k = 0; k < 4; k++) {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(1.2 - Math.abs(k - 1.5) * 0.25, 10, 8),
        glow(0xffffff, 0.9),
      );
      m.position.set((k - 1.5) * 1.3, 0, 0);
      c.add(m);
    }
    c.position.set(-18 + i * 7.5, 10 + (i % 3) * 2.2, -20 - (i % 2) * 5);
    root.add(c);
  }
  for (let i = 0; i < 4; i++) {
    const h = new THREE.Mesh(
      new THREE.SphereGeometry(6, 16, 10),
      toon([0x3fae6a, 0x2f9a78, 0x57c27a, 0x3fae6a][i] as number),
    );
    h.scale.set(1.6, 0.6, 1);
    h.position.set(-16 + i * 11, -1.2, -21);
    root.add(h);
  }

  // Texte
  const spriteCache = new Map<string, THREE.Sprite>();
  const sprite = (text: string, color: string, bg: string, width: number): THREE.Sprite => {
    const key = `${text}|${color}|${bg}`;
    let sp = spriteCache.get(key);
    if (!sp) {
      sp = textSprite(text, { color, bg, size: 64, width });
      sp.material.fog = false;
      sp.visible = false;
      root.add(sp);
      spriteCache.set(key, sp);
    }
    return sp;
  };
  interface Pop {
    sp: THREE.Sprite;
    t: number;
    x: number;
    y: number;
    z: number;
    life: number;
  }
  const pops: Pop[] = [];
  const showPop = (sp: THREE.Sprite, x: number, y: number, z: number, life = 1.1): void => {
    for (const p of pops) if (p.sp === sp) p.t = p.life;
    sp.visible = true;
    pops.push({ sp, t: 0, x, y, z, life });
  };

  let kf = 0;
  let lastRound = -1;
  let lastPhase = '';
  let t = 0;
  let lastAspect = 0;
  let zoneW = 1;
  let zoneX = 0;
  let shake = 0;
  const bp = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  let camD = 14;

  const placeCamera = () => {
    lastAspect = camera.aspect;
    camD = Math.max(14, 10.6 / camera.aspect);
  };
  placeCamera();

  /** Pendel, Plattform und Figur zeichnen; liefert die Weltposition der Plattform */
  const drawSwing = (sw: Swing, r: PendelRound, p: number, swinging: boolean): { x: number; y: number } => {
    const x = p * XM;
    const y = PIVOT_Y - Math.sqrt(Math.max(1, LEN * LEN - x * x));
    dir.set(x, y - PIVOT_Y, 0);
    const len = dir.length();
    sw.rod.position.set(x / 2, PIVOT_Y + dir.y / 2, sw.z);
    sw.rod.scale.set(1, len, 1);
    sw.rod.quaternion.setFromUnitVectors(up, dir.normalize());
    sw.seat.position.set(x, y, sw.z);
    sw.seat.rotation.z = Math.atan2(x, PIVOT_Y - y) * 0.6;
    void r;
    if (swinging) {
      sw.racer.group.position.set(x, y + 0.08, sw.z);
      sw.racer.group.rotation.z = sw.seat.rotation.z;
    }
    return { x, y };
  };
  /** Fall der Figur nach dem Loslassen */
  const fall = (sw: Swing, x: number, dt: number): boolean => {
    let justLanded = false;
    if (!sw.landed) {
      sw.fallV += 22 * dt;
      sw.fallY -= sw.fallV * dt;
      if (sw.fallY <= FLOOR_Y) {
        sw.fallY = FLOOR_Y;
        sw.landed = true;
        justLanded = true;
      }
    }
    sw.racer.group.position.set(x, sw.fallY, sw.z);
    sw.racer.group.rotation.z *= 0.8;
    return justLanded;
  };

  return {
    update(s, dt) {
      t += dt;
      if (Math.abs(camera.aspect - lastAspect) > 0.001) placeCamera();
      const r = s.rounds[Math.min(s.round, s.rounds.length - 1)]!;
      // Pendelposition (leicht geglättet zwischen den Simulationsschritten)
      if (s.phase === 'swing') {
        if (s.round !== lastRound) kf = s.k;
        kf += dt * 60;
        if (Math.abs(kf - s.k) > 2.5) kf = s.k;
        else kf += (s.k - kf) * 0.2;
      } else kf = s.k;
      const p = s.phase === 'swing' ? pendulumPos(r, kf) : s.stopPos;
      const pos = drawSwing(mine, r, p, s.phase === 'swing');
      // Zone
      const zc = s.phase === 'swing' ? zoneCenter(r, kf) : s.stopC;
      const targetW = r.h * 2 * XM;
      zoneW += (targetW - zoneW) * Math.min(1, dt * 6);
      zoneX = s.round !== lastRound ? zc * XM : zoneX + (zc * XM - zoneX) * Math.min(1, dt * 14);
      zone.position.x = zoneX;
      zoneFloor.scale.x = zoneW;
      curtain.scale.x = zoneW;
      bull.scale.set(zoneW * 0.18, 1, 0.5);
      edgeL.position.x = -zoneW / 2;
      edgeR.position.x = zoneW / 2;
      const inZone = Math.abs(p - zc) <= r.h;
      curtainMat.opacity = 0.14 + (inZone ? 0.16 : 0);
      zoneFloorMat.opacity = 0.5 + Math.sin(t * 5) * 0.08;
      zoneFloorMat.color.setHex(s.round === ROUNDS - 1 ? 0xffd23f : 0x39ff9a);
      curtainMat.color.setHex(s.round === ROUNDS - 1 ? 0xffd23f : 0x39ff9a);
      plumb.visible = s.phase === 'swing' && s.k > ARM;
      plumb.position.set(pos.x, (pos.y + FLOOR_Y) / 2, 0);
      plumb.scale.y = Math.max(0.1, pos.y - FLOOR_Y);
      plumbMat.color.setHex(inZone ? 0x39ff9a : 0xffffff);
      plumbMat.opacity = inZone ? 0.8 : 0.35;
      shadow.position.x = s.phase === 'swing' ? pos.x : mine.racer.group.position.x;

      // Rundenwechsel
      if (s.round !== lastRound) {
        lastRound = s.round;
        if (s.phase === 'swing') {
          for (const pp of pops) pp.t = Math.max(pp.t, pp.life - 0.15);
          mine.landed = true;
          me.rig.play('teleportIn');
          const fin = s.round === ROUNDS - 1;
          const label = fin
            ? sprite('FINALE · ×2', '#2a1600', '#ffd23f', 4.2)
            : sprite(roundKind(r) + '!', '#ffffff', 'rgba(60,30,120,0.82)', 4.6);
          if (
            s.round >= 2 &&
            (fin || r.zm !== s.rounds[s.round - 1]!.zm || r.wa !== s.rounds[s.round - 1]!.wa)
          )
            showPop(label, 0, 5.6, 1, 1.6);
        }
      }
      // Ereignisse
      if (s.phase !== lastPhase) {
        if (s.phase === 'result') {
          mine.fallY = pos.y + 0.08;
          mine.fallV = 0;
          mine.landed = false;
          me.rig.play('jump');
          wave.visible = false;
          if (s.timedOut) {
            ctx.sfx('bad');
            me.rig.play('shock');
          } else ctx.sfx('whoosh');
        } else if (s.phase === 'swing' && lastPhase !== '') ctx.sfx('tick');
        lastPhase = s.phase;
      }
      if (s.phase === 'result' || s.phase === 'over') {
        if (fall(mine, pos.x, dt) && !s.timedOut) {
          const pts = s.pts[s.pts.length - 1] ?? 0;
          wave.visible = true;
          wave.position.x = pos.x;
          (wave.userData as { t: number }).t = 0;
          bp.set(pos.x, 0.8, 0.4);
          const good = pts >= GOOD * (s.round === ROUNDS - 1 ? 2 : 1);
          showPop(
            sprite(
              `+${pts}`,
              good ? '#fff176' : pts >= 500 ? '#ffffff' : '#ff9aa8',
              'rgba(30,20,60,0.78)',
              2.4,
            ),
            pos.x,
            4.2,
            0.6,
          );
          if (s.lastBonus)
            showPop(sprite(`Serie ${s.streak}!`, '#ffffff', 'rgba(255,61,127,0.9)', 2.6), pos.x, 5.4, 0.6);
          if (good) {
            ctx.sfx('win');
            ctx.burst(bp, 0xffe066, 34);
            ctx.burst(bp, 0x39ff9a, 20);
            me.rig.play('celebrate');
            shake = 0.25;
          } else if (pts >= 500) {
            ctx.sfx('good');
            ctx.burst(bp, 0xffe066, 18);
            me.rig.play('cheer');
          } else {
            ctx.sfx('hit');
            ctx.burst(bp, 0xff9aa8, 10);
            me.rig.play('lose');
            shake = 0.35;
          }
        }
      }
      me.rig.faceTowards(0);
      me.rig.update(dt);
      if (wave.visible) {
        const ud = wave.userData as { t: number };
        ud.t = (ud.t ?? 0) + dt;
        const a = Math.min(1, ud.t * 1.6);
        wave.scale.setScalar(0.5 + a * 2.5);
        (wave.material as THREE.MeshBasicMaterial).opacity = (1 - a) * 0.8;
        if (a >= 1) wave.visible = false;
      }
      for (let i = pops.length - 1; i >= 0; i--) {
        const pp = pops[i] as Pop;
        pp.t += dt;
        pp.sp.position.set(Math.max(-3.4, Math.min(3.4, pp.x)), pp.y + Math.min(pp.t, 0.5) * 0.8, pp.z);
        pp.sp.material.opacity = Math.min(1, (pp.life - pp.t) * 4);
        if (pp.t >= pp.life) {
          pp.sp.visible = false;
          pops.splice(i, 1);
        }
      }
      // Laternen
      for (let i = 0; i < ROUNDS; i++) {
        const lm = (lamps[i] as THREE.Mesh).material as THREE.MeshBasicMaterial;
        const pts = s.pts[i];
        const fin = i === ROUNDS - 1 ? 2 : 1;
        lm.color.setHex(
          pts === undefined
            ? i === s.round && s.phase === 'swing'
              ? 0xffffff
              : 0x6a8aa8
            : pts >= GOOD * fin
              ? 0xffe066
              : pts >= 500 * fin
                ? 0x39ff9a
                : pts > 0
                  ? 0xff9a3d
                  : 0xff4d6d,
        );
        (lamps[i] as THREE.Mesh).scale.setScalar(
          i === s.round && s.phase === 'swing' ? 1.2 + Math.sin(t * 6) * 0.1 : 1,
        );
      }
      // Kamera mit leichter Bewegung und Wackeln
      shake = Math.max(0, shake - dt);
      camera.position.set(Math.sin(t * 0.4) * 0.3 + Math.sin(t * 70) * shake * 0.3, 3.6 + camD * 0.16, camD);
      camera.lookAt(0, 4.0, -0.6);
    },
    ghosts(states, dt) {
      updateRivals(rivals, states, dt, (rc, rs, i) => {
        const sw = rivalSwings[i] as Swing;
        const r = rs.rounds[Math.min(rs.round, rs.rounds.length - 1)]!;
        const swinging = rs.phase === 'swing';
        const p = swinging ? pendulumPos(r, rs.k) : rs.stopPos;
        const pos = drawSwing(sw, r, p, swinging);
        if (sw.lastRound !== rs.round && swinging) {
          sw.lastRound = rs.round;
          sw.landed = true;
          rc.rig.play('idle', { loop: true });
        }
        if (rs.phase !== sw.lastPhase) {
          if (rs.phase === 'result' && sw.lastPhase !== '') {
            sw.fallY = pos.y + 0.08;
            sw.fallV = 0;
            sw.landed = false;
            rc.rig.play('jump');
          }
          sw.lastPhase = rs.phase;
        }
        if (!swinging && fall(sw, pos.x, dt) && !rs.timedOut) {
          const pts = rs.pts[rs.pts.length - 1] ?? 0;
          rc.rig.play(pts >= GOOD ? 'celebrate' : pts >= 500 ? 'cheer' : 'lose');
          bp.set(pos.x, 0.6, sw.z);
          ctx.burst(bp, rc.avatar.color, pts >= GOOD ? 12 : 5);
        }
        rc.rig.faceTowards(0);
      });
      states.forEach((st, i) => {
        const sw = rivalSwings[i] as Swing;
        sw.rod.visible = sw.seat.visible = !!st;
      });
    },
    dispose() {
      ctx.scene.fog = null;
    },
  };
};
