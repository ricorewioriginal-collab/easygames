import * as THREE from 'three';
import { fakeOn, type BlitzOutcome, type BlitzState } from '@shared/minigames/games/blitzfunke';
import { disposeTree, glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';
import { makeMe, makeRivals, type Racer } from './rivals';

/**
 * Blitzfunke: Showbühne mit Funkbake. Alle Spieler stehen nebeneinander auf Podesten (eigene Figur in der Mitte vorn)
 * und reagieren gleichzeitig auf dasselbe Signal – Podestlicht und Zeitanzeige zeigen, wer wie schnell war.
 */
const COL_WAIT = 0xff3d6e;
const COL_A = 0x2cff7a;
const COL_B = 0x3d8bff;
const COL_FAKE = 0xffd23f;
const OUT_COL: Record<BlitzOutcome, number> = {
  0: 0x3a3266,
  1: COL_A,
  2: 0xff3d3d,
  3: 0xff8a3d,
  4: 0x8a8aa0,
};

export const createView: MiniGameViewFactory<BlitzState> = (ctx, initial) => {
  const { root, camera, scene } = ctx;
  scene.background = new THREE.Color(0x120c2c);
  scene.fog = new THREE.Fog(0x120c2c, 22, 48);

  // ---------- Bühne ----------
  const stage = new THREE.Mesh(new THREE.CylinderGeometry(11, 11.6, 0.5, 48), toon(0x2b2163));
  stage.position.set(0, -0.25, -2);
  root.add(stage);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(11.05, 0.12, 8, 64), glow(0x7a5cff));
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0, 0.02, -2);
  root.add(rim);
  // Leuchtstreifen am Boden
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 4.5), glow(i % 2 ? 0x4b3aa8 : 0x3a2d86));
    strip.position.set(Math.sin(a) * 7.5, 0.01, -2 + Math.cos(a) * 7.5);
    strip.rotation.y = a;
    root.add(strip);
  }
  // Rückwand mit Lichtsäulen
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(60, 22), glow(0x1b1442));
  wall.position.set(0, 9, -16);
  root.add(wall);
  const pillars: THREE.Mesh[] = [];
  for (let i = -4; i <= 4; i++) {
    if (i === 0) continue;
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.35, 14, 0.35), glow(0x6c4dff, 0.85));
    p.position.set(i * 3.4, 7, -15.5);
    root.add(p);
    pillars.push(p);
  }

  // ---------- Funkbake ----------
  const BEACON = new THREE.Vector3(0, 6.1, -6);
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 1.1, 4.8, 18), toon(0x6c63ff));
  tower.position.set(0, 2.4, -6);
  root.add(tower);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.22, 10, 32), toon(0xb8b2ff));
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, 4.75, -6);
  root.add(collar);
  const ballMat = new THREE.MeshBasicMaterial({ color: COL_WAIT });
  const ball = new THREE.Mesh(new THREE.SphereGeometry(1.35, 32, 24), ballMat);
  ball.position.copy(BEACON);
  root.add(ball);
  const haloMat = glow(COL_WAIT, 0.22);
  haloMat.depthWrite = false;
  const halo = new THREE.Mesh(new THREE.SphereGeometry(2.0, 24, 16), haloMat);
  halo.position.copy(BEACON);
  root.add(halo);
  const rings: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const m = glow(0xffffff, 0.3);
    m.depthWrite = false;
    const r = new THREE.Mesh(new THREE.TorusGeometry(2.1 + i * 0.55, 0.045, 8, 48), m);
    r.position.copy(BEACON);
    r.rotation.x = Math.PI / 2 + i * 0.45;
    root.add(r);
    rings.push(r);
  }
  // Zeichen auf der Bake
  const sign = (txt: string, bg: string): THREE.Sprite => {
    const sp = textSprite(txt, { color: '#ffffff', bg, size: 96, width: 1.7 });
    sp.position.copy(BEACON).add(new THREE.Vector3(0, 0, 1.45));
    sp.visible = false;
    root.add(sp);
    return sp;
  };
  const signA = sign('A', '#14a84bdd');
  const signB = sign('B', '#1f5fe0dd');
  const signFake = sign('?', '#c99a00dd');
  // Rundenlampen unter der Bake
  const dots: THREE.MeshBasicMaterial[] = [];
  const n = initial.rounds;
  for (let i = 0; i < n; i++) {
    const m = new THREE.MeshBasicMaterial({ color: 0x3b3366 });
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), m);
    d.position.set((i - (n - 1) / 2) * 0.62, 3.6, -4.95);
    root.add(d);
    dots.push(m);
  }

  // ---------- Spieler auf Podesten ----------
  interface Slot {
    racer: Racer;
    ped: THREE.Group;
    k: number;
    lamp: THREE.MeshBasicMaterial;
    outcome: BlitzOutcome;
    round: number;
    pop: THREE.Sprite | null;
    popT: number;
    popW: THREE.Vector2;
  }
  const me = makeMe(ctx, 1.35);
  const rivals = makeRivals(ctx, 1.1);
  const total = rivals.length + 1;
  // Plätze: Mitte für mich, Mitspieler abwechselnd links/rechts, nach hinten versetzt (Hochformat: enger und gestuft)
  let portrait = false;
  const place = (k: number): THREE.Vector3 => {
    if (k === 0) return new THREE.Vector3(0, 0, 1.2);
    const side = k % 2 ? -1 : 1;
    const step = Math.ceil(k / 2);
    if (portrait) return new THREE.Vector3(side * step * 1.55, step * 0.55, 1.2 - step * 2.1);
    const gap = total > 5 ? 2.3 : 2.9;
    return new THREE.Vector3(side * step * gap, 0, 1.2 - step * 0.9);
  };
  const makeSlot = (racer: Racer, k: number): Slot => {
    const p = place(k);
    const ped = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.1, 0.6, 24), toon(0x3d3380));
    base.position.y = 0.3;
    const lamp = new THREE.MeshBasicMaterial({ color: OUT_COL[0] });
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.98, 0.1, 24), lamp);
    top.position.y = 0.64;
    const band = new THREE.Mesh(new THREE.TorusGeometry(1.03, 0.06, 6, 28), glow(racer.avatar.color));
    band.rotation.x = Math.PI / 2;
    band.position.y = 0.45;
    ped.add(base, top, band);
    // Sockel nach unten verlängert, damit gestufte Podeste nicht schweben
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 3, 24), toon(0x2b2163));
    leg.position.y = -1.5;
    ped.add(leg);
    ped.position.copy(p);
    root.add(ped);
    racer.group.position.set(p.x, p.y + 0.7, p.z);
    racer.group.rotation.y = 0;
    racer.ring.visible = false;
    return { racer, ped, k, lamp, outcome: 0, round: 0, pop: null, popT: 0, popW: new THREE.Vector2(1, 1) };
  };
  const mine = makeSlot(me, 0);
  const others = rivals.map((r, i) => makeSlot(r, i + 1));
  // Namensschild über der eigenen Figur
  const relayout = (): void => {
    for (const sl of [mine, ...others]) {
      const p = place(sl.k);
      sl.ped.position.copy(p);
      sl.racer.group.position.set(p.x, p.y + 0.7, p.z);
    }
  };
  const tag = textSprite('DU', { color: '#ffffff', bg: '#ff4d6dcc', size: 48, width: 0.9 });
  tag.position.set(0, 3.75, 1.2);
  root.add(tag);

  const popup = (slot: Slot, txt: string, bg: string, big: boolean): void => {
    if (slot.pop) disposeTree(slot.pop);
    const sp = textSprite(txt, { color: '#ffffff', bg, size: 56, width: big ? 2.0 : 1.5 });
    const p = slot.racer.group.position;
    sp.position.set(p.x, p.y + (big ? 2.6 : 2.3), p.z + 0.3);
    root.add(sp);
    slot.pop = sp;
    slot.popT = 0;
    slot.popW.set(sp.scale.x, sp.scale.y);
  };

  /** Reaktion einer Figur auf ihr Rundenergebnis */
  const react = (slot: Slot, s: BlitzState, own: boolean): void => {
    if (s.round !== slot.round) {
      slot.round = s.round;
      slot.outcome = 0;
      slot.lamp.color.setHex(OUT_COL[0]);
      if (slot.pop) {
        disposeTree(slot.pop);
        slot.pop = null;
      }
    }
    if (s.outcome === slot.outcome) return;
    slot.outcome = s.outcome;
    slot.lamp.color.setHex(OUT_COL[s.outcome]);
    const r = slot.racer.rig;
    const pos = slot.racer.group.position.clone().add(new THREE.Vector3(0, 1.2, 0));
    if (s.outcome === 1) {
      r.play(s.lastMs < 260 ? 'celebrate' : 'jump');
      popup(slot, `${s.lastMs} ms`, s.lastMs < 260 ? '#14a84bee' : '#2a7a4aee', own);
      if (own) {
        ctx.sfx(s.lastMs < 260 ? 'win' : 'good');
        ctx.burst(pos, COL_A, 26);
        ctx.burst(BEACON.clone(), COL_A, 18);
        kick = 0.12;
      }
    } else if (s.outcome === 2) {
      r.play('shock');
      popup(slot, 'Fehlstart', '#c0283cee', own);
      if (own) {
        ctx.sfx('bad');
        kick = 0.35;
      }
    } else if (s.outcome === 3) {
      r.play('shock');
      popup(slot, 'Falsch!', '#c4601eee', own);
      if (own) {
        ctx.sfx('bad');
        kick = 0.3;
      }
    } else if (s.outcome === 4) {
      r.play('lose');
      popup(slot, 'zu spät', '#55556aee', own);
      if (own) ctx.sfx('hit');
    }
  };

  camera.position.set(0, 4.3, 10.5);
  camera.lookAt(0, 3.1, -2);
  let t = 0;
  let kick = 0;
  let lastPhase = '';
  let lastFake = false;
  let ended = false;
  let rivalBest = 0;
  const tmp = new THREE.Color();

  return {
    update(s, dt) {
      t += dt;
      const rd = s.sched[s.round];
      const fake = fakeOn(s);
      const col =
        s.phase === 'go'
          ? rd?.want === 'a'
            ? COL_A
            : COL_B
          : fake
            ? COL_FAKE
            : s.phase === 'result'
              ? 0x6c63ff
              : COL_WAIT;
      ballMat.color.setHex(col);
      haloMat.color.setHex(col);
      haloMat.opacity = s.phase === 'go' ? 0.38 : fake ? 0.32 : 0.2;
      const pulse =
        s.phase === 'wait' && !fake ? 1 + Math.sin(t * 7) * 0.035 : s.phase === 'go' ? 1.15 : fake ? 1.08 : 1;
      ball.scale.setScalar(pulse);
      halo.scale.setScalar(pulse * (1 + Math.sin(t * 3) * 0.05));
      rings.forEach((r, i) => {
        r.rotation.z += dt * (0.6 + i * 0.4) * (s.phase === 'go' ? 4 : 1);
        (r.material as THREE.MeshBasicMaterial).color.setHex(s.phase === 'go' || fake ? col : 0xffffff);
      });
      signA.visible = s.phase === 'go' && rd?.want === 'a';
      signB.visible = s.phase === 'go' && rd?.want === 'b';
      signFake.visible = fake;
      // Säulen pulsieren mit der Bake
      tmp.setHex(col).lerp(new THREE.Color(0x6c4dff), s.phase === 'go' || fake ? 0.2 : 0.75);
      pillars.forEach((p) => (p.material as THREE.MeshBasicMaterial).color.copy(tmp));
      dots.forEach((m, i) => {
        const o = s.outcomes[i];
        const cur = i === s.round && s.phase !== 'over';
        m.color.setHex(
          o === undefined
            ? cur
              ? (rd?.mult ?? 1) > 1
                ? 0xffd23f
                : 0x8f86ff
              : (s.sched[i]?.mult ?? 1) > 1
                ? 0x6b5a1f
                : 0x3b3366
            : OUT_COL[o],
        );
      });

      if (s.phase !== lastPhase) {
        if (s.phase === 'go') {
          ctx.sfx('beep');
          kick = Math.max(kick, 0.18);
        }
        if (s.phase === 'wait' && lastPhase === 'result') ctx.sfx('tick');
        lastPhase = s.phase;
      }
      if (fake && !lastFake) ctx.sfx('whoosh');
      lastFake = fake;

      react(mine, s, true);
      if (mine.outcome === 0) {
        me.rig.play('idle', { loop: true, speed: s.phase === 'go' ? 1.8 : 1 });
      }
      for (const sl of [mine, ...others]) {
        if (sl.pop) {
          sl.popT += dt;
          const k = Math.min(1, sl.popT * 6);
          sl.pop.scale.set(sl.popW.x * (0.6 + 0.4 * k), sl.popW.y * (0.6 + 0.4 * k), 1);
          sl.pop.position.y += dt * 0.25;
        }
      }
      if (s.phase === 'over' && !ended) {
        ended = true;
        me.rig.play(s.total >= rivalBest ? 'celebrate' : 'lose');
      }
      me.rig.update(dt);

      // Kamera: sanftes Schwanken, Ruck beim Signal
      kick = Math.max(0, kick - dt * 1.4);
      const sh = kick * kick * 2.2;
      if (camera.aspect < 0.9 !== portrait) {
        portrait = camera.aspect < 0.9;
        relayout();
      }
      camera.position.set(
        Math.sin(t * 0.45) * 0.5 + (Math.random() - 0.5) * sh,
        (portrait ? 5.6 : 4.3) + (Math.random() - 0.5) * sh,
        (portrait ? 15.5 : 10.5) - (s.phase === 'go' ? 0.6 : 0),
      );
      camera.lookAt(0, portrait ? 3.3 : 3.1, -2);
    },
    ghosts(states, dt) {
      others.forEach((sl, i) => {
        const st = states[i];
        sl.racer.group.visible = st != null;
        if (st) {
          react(sl, st, false);
          rivalBest = Math.max(rivalBest, st.total);
          if (st.phase === 'over' && sl.racer.rig.current === 'idle') sl.racer.rig.play('cheer');
        }
        sl.racer.rig.update(dt);
      });
    },
    dispose() {
      /* Alles hängt an root und wird von der Bühne freigegeben */
    },
  };
};
