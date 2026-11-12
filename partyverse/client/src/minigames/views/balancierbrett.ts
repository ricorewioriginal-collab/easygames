import * as THREE from 'three';
import type { BoardState } from '@shared/minigames/games/balancierbrett';
import {
  BALL_R,
  BOARD_R,
  HOLE_R,
  MAX_HOLES,
  TARGET_R,
  activeHoles,
  edgeR,
  gustAt,
} from '@shared/minigames/games/balancierbrett';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';
import { makeMe, makeRivals, updateRivals, type Racer } from './rivals';

const MAX_TILT = 0.3;

/** Rundes Holzbrett auf einem Zapfen über den Wolken; die Kugel rollt in Brett-Koordinaten (lokal), das Brett kippt. */
export const createView: MiniGameViewFactory<BoardState> = (ctx, initial) => {
  const { root, camera } = ctx;
  ctx.scene.background = new THREE.Color(0x8fd8ff);
  ctx.scene.fog = new THREE.Fog(0x8fd8ff, 30, 70);
  root.add(new THREE.HemisphereLight(0xffffff, 0xa6c8ff, 1.6));
  const sun = new THREE.DirectionalLight(0xfff2cc, 1.6);
  sun.position.set(-5, 12, 8);
  root.add(sun);

  // Wolken
  const cloudMat = toon(0xffffff);
  const clouds: THREE.Group[] = [];
  for (let i = 0; i < 9; i++) {
    const g = new THREE.Group();
    for (let k = 0; k < 4; k++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(1.3 + (k % 2) * 0.5, 12, 10), cloudMat);
      m.position.set((k - 1.5) * 1.3, (k % 2) * 0.3, 0);
      g.add(m);
    }
    const a = (i / 9) * Math.PI * 2;
    g.position.set(Math.cos(a) * (17 + (i % 3) * 3), -5.5 - (i % 2) * 1.5, Math.sin(a) * (15 + (i % 3) * 3));
    root.add(g);
    clouds.push(g);
  }
  // Zapfen
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.4, 6, 16), toon(0xff7a3c));
  post.position.y = -3.4;
  root.add(post);
  const base = new THREE.Mesh(new THREE.SphereGeometry(1.0, 16, 12), toon(0xffd23f));
  base.position.y = -0.5;
  root.add(base);

  // Brett
  const board = new THREE.Group();
  root.add(board);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(BOARD_R, BOARD_R, 0.5, 64), toon(0xf2b46b));
  disc.position.y = -0.25;
  board.add(disc);
  const top = new THREE.Mesh(new THREE.CircleGeometry(BOARD_R - 0.1, 64), toon(0x59c9a5));
  top.rotation.x = -Math.PI / 2;
  top.position.y = 0.01;
  board.add(top);
  for (const r of [2, 4]) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(r - 0.05, r + 0.05, 64), glow(0xffffff, 0.35));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.03;
    board.add(ring);
  }
  const rim = new THREE.Mesh(new THREE.TorusGeometry(BOARD_R, 0.22, 10, 72), toon(0xe0573a));
  rim.rotation.x = Math.PI / 2;
  board.add(rim);
  // Kreuzmarkierung in der Mitte
  const cross = new THREE.Mesh(new THREE.RingGeometry(0.25, 0.4, 24), glow(0xffffff, 0.5));
  cross.rotation.x = -Math.PI / 2;
  cross.position.y = 0.03;
  board.add(cross);

  // Löcher
  interface HoleV {
    g: THREE.Group;
  }
  const holes: HoleV[] = [];
  for (let i = 0; i < MAX_HOLES; i++) {
    const g = new THREE.Group();
    const hole = new THREE.Mesh(
      new THREE.CircleGeometry(HOLE_R, 28),
      new THREE.MeshBasicMaterial({ color: 0x120a24 }),
    );
    hole.rotation.x = -Math.PI / 2;
    hole.position.y = 0.05;
    g.add(hole);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(HOLE_R + 0.05, 0.1, 8, 28), toon(0xb03a2e));
    lip.rotation.x = Math.PI / 2;
    lip.position.y = 0.06;
    g.add(lip);
    const h = initial.holes[i];
    g.position.set(h ? h.x : 0, 0, h ? -h.y : 0);
    g.visible = false;
    board.add(g);
    holes.push({ g });
  }

  // Ziel
  const target = new THREE.Group();
  const tDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(TARGET_R, TARGET_R, 0.12, 28),
    toon(0xffd23f, { emissive: 0xffa800, emissiveIntensity: 0.6 }),
  );
  tDisc.position.y = 0.07;
  target.add(tDisc);
  const tRing = new THREE.Mesh(new THREE.TorusGeometry(TARGET_R + 0.15, 0.06, 8, 36), glow(0xfff6a8, 0.9));
  tRing.rotation.x = Math.PI / 2;
  tRing.position.y = 0.16;
  target.add(tRing);
  const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6), toon(0xffffff));
  flagPole.position.y = 0.9;
  target.add(flagPole);
  const flag = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.8, 3), toon(0xff4d8d));
  flag.rotation.z = -Math.PI / 2;
  flag.position.set(0.4, 1.4, 0);
  target.add(flag);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 4, 14, 1, true), glow(0xffe36e, 0.14));
  beam.position.y = 2;
  target.add(beam);
  board.add(target);
  const nextGhost = new THREE.Mesh(
    new THREE.RingGeometry(TARGET_R * 0.6, TARGET_R * 0.75, 24),
    glow(0xffffff, 0.5),
  );
  nextGhost.rotation.x = -Math.PI / 2;
  nextGhost.position.y = 0.05;
  board.add(nextGhost);

  // Kugel
  const ballRoot = new THREE.Group();
  board.add(ballRoot);
  const ballSpin = new THREE.Group();
  ballRoot.add(ballSpin);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(BALL_R, 28, 20), toon(0xff4d4d));
  ballSpin.add(ball);
  const stripe = new THREE.Mesh(new THREE.TorusGeometry(BALL_R * 1.005, 0.06, 8, 28), toon(0xffffff));
  ballSpin.add(stripe);
  const stripe2 = new THREE.Mesh(new THREE.TorusGeometry(BALL_R * 1.005, 0.06, 8, 28), toon(0xffffff));
  stripe2.rotation.y = Math.PI / 2;
  ballSpin.add(stripe2);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), toon(0xffe36e));
  dot.position.set(0, BALL_R, 0);
  ballSpin.add(dot);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(BALL_R * 0.95, 20), glow(0x000000, 0.28));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.04;
  board.add(shadow);
  (ball.material as THREE.Material) = toon(ctx.me.color);

  // Figuren balancieren auf ihren Kugeln: eigene vorne, Mitspieler halbdurchsichtig auf demselben Brett
  const FIG = 0.5;
  const me = makeMe(ctx, FIG);
  board.add(me.group);
  me.ring.visible = false;
  const rivals = makeRivals(ctx, FIG * 0.9);
  const ballGeo = new THREE.SphereGeometry(BALL_R, 20, 14);
  const rivalBalls = rivals.map((r) => {
    board.add(r.group);
    r.ring.visible = false;
    const b = new THREE.Mesh(
      ballGeo,
      new THREE.MeshBasicMaterial({
        color: r.avatar.color,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      }),
    );
    board.add(b);
    return b;
  });
  interface Track {
    x: number;
    y: number;
    cp: number;
    falls: number;
    over: boolean;
  }
  const track = (st: BoardState): Track => ({ x: st.px, y: st.py, cp: st.cp, falls: st.falls, over: false });
  const meT = track(initial);
  const rivT = rivals.map(() => track(initial));
  /** Figur oben auf der Kugel (ballY = Kugelmitte, lokal) */
  const ride = (r: Racer, st: BoardState, tr: Track, ballY: number): void => {
    const lx = st.px;
    const lz = -st.py;
    const sp = Math.hypot(st.vx, st.vy);
    r.group.position.set(lx, ballY + BALL_R * 0.95, lz);
    if (st.over && !tr.over) {
      tr.over = true;
      r.rig.play(st.cp >= 6 ? 'celebrate' : 'cheer');
    } else if (st.falls !== tr.falls) {
      r.rig.play('shock');
    } else if (st.cp !== tr.cp) {
      r.rig.play('jump', { speed: 1.4 });
    } else if (!st.over && st.fallT === 0 && r.rig.current !== 'jump' && r.rig.current !== 'shock') {
      // Läuft auf der Kugel mit – je schneller sie rollt, desto schneller die Beine
      if (sp > 0.6) r.rig.play('run', { loop: true, speed: Math.min(2.2, 0.5 + sp * 0.3) });
      else r.rig.play('idle', { loop: true });
    }
    if (sp > 0.6) r.rig.faceTowards(Math.atan2(st.vx, -st.vy));
    tr.x = st.px;
    tr.y = st.py;
    tr.cp = st.cp;
    tr.falls = st.falls;
  };

  // Windböen-Pfeil auf dem Brett
  const arrow = new THREE.Group();
  const arrowMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.04, 0.7), arrowMat);
  shaft.position.x = -0.6;
  const headShape = new THREE.Shape();
  headShape.moveTo(0, 0.9);
  headShape.lineTo(1.5, 0);
  headShape.lineTo(0, -0.9);
  headShape.closePath();
  const head = new THREE.Mesh(new THREE.ShapeGeometry(headShape), arrowMat);
  head.rotation.x = -Math.PI / 2;
  head.position.set(0.7, 0.02, 0);
  arrow.add(shaft, head);
  arrow.position.y = 0.08;
  arrow.visible = false;
  board.add(arrow);
  let lastGustActive = false;
  let windT = 0;

  const popups: Array<{ sp: THREE.Sprite; t: number }> = [];
  const popup = (text: string, color: string): void => {
    const sp = textSprite(text, { color, size: 64, width: 1.8 });
    ballRoot.getWorldPosition(sp.position);
    sp.position.y += 2.2;
    root.add(sp);
    popups.push({ sp, t: 0 });
  };

  let t = 0;
  let vx = 0;
  let vz = 0;
  let lastX = initial.px;
  let lastZ = -initial.py;
  let lastCp = initial.cp;
  let lastFalls = initial.falls;
  let wasOver = false;
  let tiltX = 0;
  let tiltZ = 0;
  let fallVy = 0;
  const q = new THREE.Quaternion();
  const axis = new THREE.Vector3();
  const wp = new THREE.Vector3();

  return {
    update(s, dt) {
      t += dt;
      // Brettneigung (x>0: rechts nach unten; y>0: hinten nach unten)
      tiltX += (-s.tx * MAX_TILT - tiltX) * Math.min(1, dt * 18);
      tiltZ += (-s.ty * MAX_TILT - tiltZ) * Math.min(1, dt * 18);
      board.rotation.z = tiltX;
      board.rotation.x = tiltZ;
      board.position.y = Math.sin(t * 1.3) * 0.08;
      for (let i = 0; i < clouds.length; i++) {
        const c = clouds[i] as THREE.Group;
        c.position.y += Math.sin(t * 0.6 + i) * dt * 0.1;
      }

      // Brettrand bröckelt
      const er = edgeR(s.tick);
      const ek = er / BOARD_R;
      disc.scale.set(ek, 1, ek);
      top.scale.set(ek, ek, 1);
      rim.scale.set(ek, ek, 1);
      if (ek < 0.999 && Math.floor(t * 4) !== Math.floor((t - dt) * 4)) {
        const a = t * 2.3;
        board.localToWorld(wp.set(Math.cos(a) * er, 0, Math.sin(a) * er));
        ctx.burst(wp, 0xc98a4b, 4);
      }

      // Windböe: Pfeil zeigt die Richtung (blinkt als Warnung, dann wandert er mit dem Wind)
      const gu = gustAt(s, s.tick);
      const g = gu.warn ?? gu.active;
      arrow.visible = !!g;
      if (g) {
        arrow.rotation.y = g.a;
        const blink = gu.warn ? 0.35 + 0.45 * (Math.floor(t * 8) % 2) : 0.85;
        arrowMat.opacity = blink;
        arrowMat.color.setHex(gu.active ? 0xbff4ff : 0xffffff);
        const off = gu.active ? ((t * 3) % 1) * 1.5 - 0.75 : 0;
        arrow.position.set(Math.cos(g.a) * off, 0.08, -Math.sin(g.a) * off);
        arrow.scale.setScalar(gu.active ? 1.15 : 1);
      }
      if (gu.active && !lastGustActive) {
        ctx.sfx('whoosh');
      }
      lastGustActive = !!gu.active;
      if (gu.active) {
        windT -= dt;
        if (windT <= 0) {
          windT = 0.06;
          const g2 = gu.active;
          const side = Math.sin(t * 37) * er;
          // Windstreifen: von der Luv-Seite übers Brett
          board.localToWorld(
            wp.set(
              -Math.cos(g2.a) * er + Math.sin(g2.a) * side * 0.6,
              0.6,
              Math.sin(g2.a) * er + Math.cos(g2.a) * side * 0.6,
            ),
          );
          ctx.burst(wp, 0xe8fbff, 2);
        }
      }

      const nh = Math.min(activeHoles(s.cp), s.holes.length);
      for (let i = 0; i < holes.length; i++) {
        const h = s.holes[i];
        const v = holes[i] as HoleV;
        v.g.visible = i < nh;
        if (h) v.g.position.set(h.x, 0, -h.y);
        if (i < nh) v.g.scale.setScalar(1 + Math.sin(t * 3 + i) * 0.03);
      }
      const tg = s.targets[s.cp];
      target.visible = !!tg;
      if (tg) {
        target.position.set(tg.x, 0, -tg.y);
        target.rotation.y = t * 1.5;
        tDisc.scale.setScalar(1 + Math.sin(t * 6) * 0.05);
        tRing.scale.setScalar(1 + Math.sin(t * 6 + 1) * 0.06);
        beam.scale.set(1 + Math.sin(t * 4) * 0.08, 1, 1 + Math.sin(t * 4) * 0.08);
      }
      const ng = s.targets[s.cp + 1];
      nextGhost.visible = !!ng;
      if (ng) nextGhost.position.set(ng.x, 0.05, -ng.y);

      // Kugel
      const lx = s.px;
      const lz = -s.py;
      const mvx = lx - lastX;
      const mvz = lz - lastZ;
      lastX = lx;
      lastZ = lz;
      vx = mvx;
      vz = mvz;
      const len = Math.hypot(vx, vz);
      if (len > 1e-5 && len < 1) {
        axis.set(vz, 0, -vx).normalize();
        q.setFromAxisAngle(axis, len / BALL_R);
        ballSpin.quaternion.premultiply(q);
      }
      let ballY = BALL_R + 0.02;
      if (s.fallT > 0) {
        const k = s.fallT / 55;
        if (s.fallKind === 'hole') {
          ballRoot.position.set(s.fallX + (lx - s.fallX) * 0.0, BALL_R * k - (1 - k) * 0.9, -s.fallY);
          ballRoot.position.x = s.fallX;
          ballRoot.scale.setScalar(Math.max(0.05, k * 0.9 + 0.1));
          shadow.visible = false;
        } else {
          fallVy -= dt * 22;
          ballRoot.position.set(lx, Math.max(-14, ballRoot.position.y + fallVy * dt), lz);
          ballRoot.scale.setScalar(1);
          shadow.visible = false;
        }
      } else {
        fallVy = 0;
        ballRoot.position.set(lx, BALL_R + 0.02, lz);
        const sp = Math.min(1, Math.hypot(s.vx, s.vy) / 8);
        ballRoot.scale.set(1 + sp * 0.06, 1 - sp * 0.06, 1 + sp * 0.06);
        shadow.visible = true;
        shadow.position.set(lx, 0.04, lz);
      }
      ballY = ballRoot.position.y;
      ride(me, s, meT, ballY);
      if (s.fallT > 0) me.group.position.set(ballRoot.position.x, ballY + BALL_R * 0.8, ballRoot.position.z);
      me.group.scale.setScalar(ballRoot.scale.x < 0.9 && s.fallKind === 'hole' ? ballRoot.scale.x : 1);
      me.rig.update(dt);
      if (s.over && !wasOver) {
        wasOver = true;
        ctx.sfx('win');
      }
      for (let i = popups.length - 1; i >= 0; i--) {
        const p = popups[i]!;
        p.t += dt;
        p.sp.position.y += dt * 1.3;
        p.sp.material.opacity = Math.max(0, 1 - p.t);
        if (p.t > 1) {
          p.sp.removeFromParent();
          p.sp.material.map?.dispose();
          p.sp.material.dispose();
          popups.splice(i, 1);
        }
      }

      // Ereignisse
      if (s.cp > lastCp) {
        ctx.sfx('good');
        board.localToWorld(wp.set(lx, 0.8, lz));
        ctx.burst(wp, 0xffd23f, 22);
        lastCp = s.cp;
        popup(s.lastBonus > 0 ? `+${100 + s.lastBonus}` : '+100', s.lastBonus >= 30 ? '#ffe066' : '#ffffff');
      }
      if (s.falls > lastFalls) {
        ctx.sfx('bad');
        board.localToWorld(wp.set(lx, 0.5, lz));
        ctx.burst(wp, 0x6a5cff, 16);
        lastFalls = s.falls;
        popup('−40', '#ff8080');
      }

      // Kamera
      const asp = camera.aspect || 1.6;
      const f = asp < 1.25 ? 1.08 / Math.max(0.45, asp) : 1;
      camera.position.set(0, 10.5 * f, 8.6 * f);
      camera.lookAt(0, -0.5, 0.2);
      const fog = ctx.scene.fog as THREE.Fog | null;
      if (fog) {
        fog.near = 30 * f;
        fog.far = 70 * f;
      }
    },
    ghosts(states, dt) {
      updateRivals(rivals, states, dt, (r, st, i) => {
        const b = rivalBalls[i]!;
        // Abgestürzte Mitspieler kurz ausblenden
        const vis = st.fallT === 0;
        r.group.visible = vis;
        b.visible = vis;
        b.position.set(st.px, BALL_R + 0.02, -st.py);
        ride(r, st, rivT[i]!, BALL_R + 0.02);
      });
      rivalBalls.forEach((b, i) => {
        if (states[i] == null) b.visible = false;
      });
    },
    dispose() {
      ctx.scene.fog = null;
      ballGeo.dispose();
    },
  };
};
