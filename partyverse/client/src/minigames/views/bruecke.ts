import * as THREE from 'three';
import {
  FALL_PENALTY,
  FALL_TICKS,
  towerAt,
  towerOff,
  type BridgeState,
  type Tower,
} from '@shared/minigames/games/bruecke';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';
import { makeMe, makeRivals, updateRivals, type Racer } from './rivals';

/**
 * Brückenbauer: Himmelsschlucht bei Sonnenaufgang, Steintürme mit Grasdach. Die eigene Figur baut Holzbrücken;
 * Mitspieler bauen halbdurchsichtig auf eigenen Schwebe-Plattformen weiter hinten.
 */
export const createView: MiniGameViewFactory<BridgeState> = (ctx, initial) => {
  const { root, camera, scene } = ctx;
  scene.background = new THREE.Color(0xffc7a1);
  scene.fog = new THREE.Fog(0xffd7bd, 30, 90);
  const sphere = new THREE.SphereGeometry(1, 14, 10);
  const hash = (i: number): number =>
    (((Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(i + 5, 0x85ebca6b)) >>> 8) & 0xffff) / 65536;

  // ---------- Himmel ----------
  const far = new THREE.Group();
  root.add(far);
  const skyGeo = new THREE.PlaneGeometry(600, 160);
  const skyCol: number[] = [];
  const cTop = new THREE.Color(0x6cc3ff);
  const cMid = new THREE.Color(0xffb3c7);
  const cBot = new THREE.Color(0xffe3b8);
  const skyPos = skyGeo.getAttribute('position');
  for (let i = 0; i < skyPos.count; i++) {
    const y = skyPos.getY(i) / 80; // -1..1
    const c = y > 0 ? cMid.clone().lerp(cTop, y) : cMid.clone().lerp(cBot, -y);
    skyCol.push(c.r, c.g, c.b);
  }
  skyGeo.setAttribute('color', new THREE.Float32BufferAttribute(skyCol, 3));
  const skyMat = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false });
  const skyPlane = new THREE.Mesh(skyGeo, skyMat);
  skyPlane.position.set(0, 18, -90);
  far.add(skyPlane);
  const sunMat = glow(0xfff0a8);
  sunMat.fog = false;
  const sun = new THREE.Mesh(new THREE.CircleGeometry(9, 36), sunMat);
  sun.position.set(14, 8, -80);
  far.add(sun);
  const haloMat = glow(0xfff6cf, 0.35);
  haloMat.fog = false;
  const halo = new THREE.Mesh(new THREE.CircleGeometry(15, 36), haloMat);
  halo.position.set(14, 8, -81);
  far.add(halo);
  const mount1 = toon(0xc98fd6, { emissive: 0xc98fd6, emissiveIntensity: 0.35 });
  const mount2 = toon(0xa774c9, { emissive: 0xa774c9, emissiveIntensity: 0.3 });
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(
      new THREE.ConeGeometry(9 + hash(i) * 6, 14 + hash(i + 3) * 12, 5),
      i % 2 ? mount1 : mount2,
    );
    m.position.set(-70 + i * 12, -3 + hash(i + 9) * 3, -55 - (i % 2) * 12);
    far.add(m);
  }
  const cloudMat = glow(0xffffff, 0.85);
  const puffs: THREE.Mesh[] = [];
  for (let i = 0; i < 24; i++) {
    const p = new THREE.Mesh(sphere, cloudMat);
    p.scale.set(4 + hash(i) * 4, 1.3 + hash(i + 7), 2.5);
    p.position.set(-60 + i * 5.2, -8.5 + hash(i + 13) * 1.5, 3 - (i % 3) * 5);
    far.add(p);
    puffs.push(p);
  }
  for (let i = 0; i < 9; i++) {
    const g = new THREE.Group();
    for (let k = 0; k < 3; k++) {
      const m = new THREE.Mesh(sphere, cloudMat);
      m.scale.set(1.8 - k * 0.3, 0.9, 0.9);
      m.position.set(k * 1.5 - 1.4, k === 1 ? 0.4 : 0, 0);
      g.add(m);
    }
    g.position.set(-50 + i * 14, 10 + hash(i + 21) * 9, -30 - hash(i) * 10);
    far.add(g);
  }

  // ---------- Türme ----------
  const stoneA = toon(0xd9a779);
  const stoneB = toon(0xc88f68);
  const grass = toon(0x7bd65a);
  const grassDark = toon(0x55b84a);
  const goldCap = toon(0xffd23f, { emissive: 0xffa000, emissiveIntensity: 0.35 });
  const goldLip = toon(0xe0a020);
  const moveMat = glow(0x6ad7ff, 0.85);
  const targetMat = glow(0xff2d55);
  interface TowerView {
    g: THREE.Group;
    base: number;
    mid: number;
    star: THREE.Object3D | null;
  }
  const towerViews: TowerView[] = initial.towers.map((tw, i) => {
    const g = new THREE.Group();
    const w = tw.r - tw.l;
    const mid = (tw.l + tw.r) / 2;
    const stone = new THREE.Mesh(new THREE.BoxGeometry(w, 30, 2.6), i % 2 ? stoneA : stoneB);
    stone.position.set(0, -15.2, 0);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.18, 0.3, 2.8), tw.gold ? goldCap : grass);
    cap.position.set(0, -0.1, 0);
    const lip = new THREE.Mesh(new THREE.BoxGeometry(w + 0.18, 0.5, 0.3), tw.gold ? goldLip : grassDark);
    lip.position.set(0, -0.4, 1.4);
    g.add(stone, cap, lip);
    for (let k = 1; k < 5; k++) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.07, 2.62), toon(0xa9744f));
      line.position.set(0, -k * 1.6 - hash(i * 7 + k), 0);
      g.add(line);
    }
    for (let k = 0; k < 2; k++) {
      const fl = new THREE.Mesh(sphere, toon(k ? 0xff7fb0 : 0xfff06a));
      fl.scale.setScalar(0.09);
      fl.position.set(-w / 2 + 0.3 + hash(i * 5 + k) * (w - 0.6), 0.1, 1.0);
      g.add(fl);
    }
    let star: THREE.Object3D | null = null;
    if (tw.gold) {
      star = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), goldCap);
      star.position.set(0, 1.1, -0.6);
      g.add(star);
    }
    if (tw.m) {
      // wandernder Turm: leuchtende Pfeile an der Vorderseite
      for (const sx of [-1, 1]) {
        const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 3), moveMat);
        arrow.rotation.z = (-sx * Math.PI) / 2;
        arrow.position.set(sx * Math.max(0.35, w / 2 - 0.3), -0.95, 1.36);
        g.add(arrow);
      }
      if (w > 1.5) {
        const band = new THREE.Mesh(new THREE.BoxGeometry(w - 1.2, 0.08, 0.02), moveMat);
        band.position.set(0, -0.95, 1.36);
        g.add(band);
      }
    }
    g.position.x = mid;
    root.add(g);
    return { g, base: tw.l, mid, star };
  });
  // Ziel-Punkt (perfekte Mitte)
  const target = new THREE.Group();
  const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 20), targetMat);
  const dotRing = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 6, 24), glow(0xffffff, 0.9));
  dotRing.rotation.x = Math.PI / 2;
  target.add(dot, dotRing);
  target.position.y = 0.08;
  root.add(target);

  // ---------- Stab / Brücken ----------
  const plankMat = toon(0xe0a040);
  const railMat = toon(0x8a5a2b);
  const boardGeo = new THREE.BoxGeometry(1, 0.14, 0.7);
  const railGeo = new THREE.BoxGeometry(1, 0.09, 0.09);
  const makePlank = (board: THREE.Material = plankMat, rail: THREE.Material = railMat): THREE.Group => {
    const g = new THREE.Group();
    const b = new THREE.Mesh(boardGeo, board);
    b.position.x = 0.5;
    const rA = new THREE.Mesh(railGeo, rail);
    rA.position.set(0.5, 0.1, 0.33);
    const rB = new THREE.Mesh(railGeo, rail);
    rB.position.set(0.5, 0.1, -0.33);
    g.add(b, rA, rB);
    return g;
  };
  const stickPivot = new THREE.Group();
  const stick = makePlank();
  stickPivot.add(stick);
  root.add(stickPivot);
  const placed: THREE.Group[] = [];
  for (let i = 0; i < 6; i++) {
    const p = makePlank();
    p.visible = false;
    root.add(p);
    placed.push(p);
  }
  let placedN = 0;
  const stickAngle = (s: BridgeState): number => {
    if (s.phase === 'fall') {
      const f = Math.min(1, s.timer / FALL_TICKS);
      return (Math.PI / 2) * f * f;
    }
    return s.phase === 'walk' || s.phase === 'drop' ? Math.PI / 2 : 0;
  };

  // ---------- Figuren ----------
  const me = makeMe(ctx, 0.85);
  me.ring.visible = false;
  const rivals = makeRivals(ctx, 0.75);
  /** Mitspieler: eigene Schwebe-Plattformen weiter hinten (ihre wandernden Türme können woanders stehen) */
  interface Lane {
    z: number;
    pads: THREE.Group[];
    caps: THREE.Mesh[];
    pivot: THREE.Group;
    plank: THREE.Group;
    lastResults: number;
    lastPhase: string;
  }
  const padGeo = new THREE.BoxGeometry(1, 0.3, 1.1);
  const pillarGeo = new THREE.CylinderGeometry(0.18, 0.05, 1.4, 8);
  const ghostMats: THREE.Material[] = [];
  const ghost = (m: THREE.Material): THREE.Material => {
    const c = m.clone();
    c.transparent = true;
    c.opacity = 0.5;
    c.depthWrite = false;
    ghostMats.push(c);
    return c;
  };
  const lanes: Lane[] = rivals.map((rc, i) => {
    const z = -3.2 - i * 1.7;
    const capMat = ghost(toon(rc.avatar.color));
    const pillarMat = ghost(toon(0xc88f68));
    const caps: THREE.Mesh[] = [];
    const pads = [0, 1].map(() => {
      const g = new THREE.Group();
      const cap = new THREE.Mesh(padGeo, capMat);
      cap.position.y = -0.15;
      const pil = new THREE.Mesh(pillarGeo, pillarMat);
      pil.position.y = -1.0;
      g.add(cap, pil);
      root.add(g);
      caps.push(cap);
      return g;
    });
    const pivot = new THREE.Group();
    const plank = makePlank(ghost(plankMat), ghost(railMat));
    pivot.add(plank);
    root.add(pivot);
    rc.ring.visible = false;
    return { z, pads, caps, pivot, plank, lastResults: 0, lastPhase: 'idle' };
  });
  const placePad = (pad: THREE.Group, cap: THREE.Mesh, tw: Tower, t: number, z: number): void => {
    const p = towerAt(tw, t);
    pad.position.set((p.l + p.r) / 2, 0, z);
    cap.scale.x = p.r - p.l;
  };
  /** Animation der Figur je Phase (eigene Figur und Mitspieler) */
  const animate = (r: Racer, s: BridgeState, prevPhase: string): void => {
    const rig = r.rig;
    if (s.phase !== prevPhase) {
      if (s.phase === 'walk') rig.play('run', { loop: true, speed: 1.3 });
      else if (s.phase === 'drop') rig.play('shock');
      else if (s.phase === 'idle' && prevPhase === 'drop') rig.play('teleportIn');
      else if (s.phase === 'idle' && prevPhase === 'walk')
        rig.play(s.last === 2 ? 'celebrate' : 'cheer', { speed: 1.6 });
      else if (s.phase === 'grow') rig.play('point', { speed: 0.6 });
    }
    if (s.phase === 'drop' && s.timer > 16 && rig.current !== 'roll') rig.play('roll', { loop: true });
    rig.faceTowards(s.phase === 'walk' ? Math.PI / 2 : 0.7);
  };

  // ---------- Texte ----------
  const spriteCache = new Map<string, THREE.Sprite>();
  const sprite = (text: string, bg: string, width: number): THREE.Sprite => {
    const key = `${text}|${bg}`;
    let sp = spriteCache.get(key);
    if (!sp) {
      sp = textSprite(text, { color: '#ffffff', bg, size: 56, width });
      sp.visible = false;
      root.add(sp);
      spriteCache.set(key, sp);
    }
    return sp;
  };
  interface Pop {
    sp: THREE.Sprite;
    t: number;
    life: number;
    x: number;
    y: number;
  }
  const pops: Pop[] = [];
  const showPop = (sp: THREE.Sprite, x: number, y: number, life = 1.1): void => {
    for (const p of pops) if (p.sp === sp) p.t = p.life;
    sp.visible = true;
    pops.push({ sp, t: 0, life, x, y });
  };

  let t = 0;
  let camX = 2;
  let camY = 3;
  let shake = 0;
  let lastResults = 0;
  let lastIdx = 0;
  let lastLen = 0;
  let lastPhase: string = initial.phase;
  const bp = new THREE.Vector3();

  return {
    update(s, dt) {
      t += dt;
      const cur = s.towers[s.idx] as Tower;
      const next = s.towers[s.idx + 1] as Tower;
      const nx = towerAt(next, s.t);

      // ---------- Stab ----------
      stickPivot.visible = s.len > 0.02 && s.phase !== 'idle';
      stickPivot.position.set(cur.r, 0.09, 0);
      stickPivot.rotation.z = Math.PI / 2 - stickAngle(s);
      stick.scale.x = Math.max(0.01, s.len);
      stick.scale.z = s.phase === 'grow' ? 1 + Math.sin(t * 40) * 0.04 : 1;
      if (s.len > 0.02) lastLen = s.len;

      // gesetzte Brücken
      if (s.idx !== lastIdx) {
        const prev = s.towers[s.idx - 1] as Tower;
        const p = placed[placedN % placed.length] as THREE.Group;
        placedN++;
        p.visible = true;
        p.position.set(prev.r, 0.09, 0);
        p.scale.set(lastLen, 1, 1);
        lastIdx = s.idx;
        lastLen = 0;
      }

      // ---------- Ereignisse ----------
      const prevPhase = lastPhase;
      if (s.phase !== prevPhase) {
        if (prevPhase === 'fall') {
          shake = Math.max(shake, 0.35);
          ctx.burst(bp.set(cur.r + s.len, 0.3, 0.4), 0xf3d9a0, 9);
        }
        if (s.phase === 'grow') ctx.sfx('tick');
        if (s.phase === 'drop') {
          shake = Math.max(shake, 0.5);
          showPop(sprite(`ABSTURZ −${FALL_PENALTY}`, '#5a4a6e', 3.4), s.heroX, 2.6, 1.0);
        }
        if (s.phase === 'idle' && prevPhase === 'drop') {
          ctx.sfx('whoosh');
          ctx.burst(bp.set(s.heroX, 1.0, 0.4), me.avatar.color, 18);
        }
        lastPhase = s.phase;
      }
      animate(me, s, prevPhase);
      if (s.results !== lastResults) {
        lastResults = s.results;
        const mx = (nx.l + nx.r) / 2;
        if (s.last === 2) {
          ctx.sfx('win');
          ctx.burst(bp.set(mx, 0.6, 0.5), 0xffd23f, 26);
          ctx.burst(bp.set(mx, 0.8, 0.5), 0xff4f7d, 14);
          showPop(
            sprite(s.pstreak > 1 ? `PERFEKT ×${s.pstreak}!` : 'PERFEKT!', '#ff4f7d', 3.6),
            mx,
            3.0,
            1.2,
          );
        } else if (s.last === 1) {
          ctx.sfx('good');
          ctx.burst(bp.set(nx.r - 0.6, 0.5, 0.5), 0x7bd65a, 10);
        } else ctx.sfx('bad');
        if (s.last !== 3) {
          showPop(
            sprite(`+${s.lastPts}`, next.gold ? '#e0a020' : '#2cc57a', next.gold ? 1.9 : 1.5),
            nx.r - 0.4,
            1.9,
            0.9,
          );
          if (next.gold) {
            ctx.burst(bp.set(mx, 1.2, 0), 0xffd23f, 30);
            shake = Math.max(shake, 0.25);
          }
        }
      }
      for (let i = pops.length - 1; i >= 0; i--) {
        const p = pops[i]!;
        p.t += dt;
        p.sp.position.set(p.x, p.y + p.t * 0.7, 0.9);
        p.sp.material.opacity = Math.max(0, Math.min(1, (p.life - p.t) / 0.3));
        if (p.t >= p.life) {
          p.sp.visible = false;
          pops.splice(i, 1);
        }
      }

      // ---------- Türme ----------
      for (const [i, tv] of towerViews.entries()) {
        const tw = s.towers[i] as Tower;
        tv.g.position.x = tv.mid + (tw.l - tv.base) + towerOff(tw, s.t);
        tv.g.visible = Math.abs(tv.g.position.x - camX) < 32;
        if (tv.star) {
          tv.star.visible = i > s.idx;
          tv.star.rotation.y = t * 2;
          tv.star.position.y = 1.1 + Math.sin(t * 3 + i) * 0.12;
        }
      }
      target.visible = s.phase === 'idle' || s.phase === 'grow' || s.phase === 'fall';
      target.position.x = (nx.l + nx.r) / 2;
      const pulse = 1 + Math.sin(t * 6) * 0.1;
      target.scale.set(pulse, 1, pulse);

      // ---------- Figur ----------
      me.group.position.set(s.heroX, s.heroY, 0.3);
      me.rig.update(dt);

      // ---------- Kamera ----------
      const aspect = camera.aspect;
      const halfW = aspect < 1 ? 7.0 : 8.2;
      const d = THREE.MathUtils.clamp(halfW / (Math.tan((camera.fov * Math.PI) / 360) * aspect), 11, 30);
      const focus = (Math.max(s.heroX, cur.r - 1.0) + (nx.l + nx.r) / 2) / 2 + 0.6;
      const k = dt <= 0 ? 1 : Math.min(1, dt * 4);
      camX += (focus - camX) * k;
      const ty = (aspect < 1 ? 4.2 : 3.0) + (s.phase === 'drop' ? -Math.min(s.timer, 30) * 0.04 : 0);
      camY += (ty - camY) * k;
      shake = Math.max(0, shake - dt * 2);
      camera.position.set(camX + Math.sin(t * 70) * shake * 0.12, camY + Math.cos(t * 60) * shake * 0.1, d);
      camera.lookAt(camX, camY - (aspect < 1 ? 1.2 : 0.6), 0);
      far.position.x = camX * 0.9;
      for (let i = 0; i < puffs.length; i++)
        (puffs[i] as THREE.Mesh).position.x = -60 + i * 5.2 + Math.sin(t * 0.3 + i) * 0.8 - camX * 0.1;
    },
    ghosts(states, dt) {
      updateRivals(rivals, states, dt, (rc, rs, i) => {
        const lane = lanes[i] as Lane;
        const cur = rs.towers[rs.idx] as Tower;
        const nxt = rs.towers[rs.idx + 1] as Tower;
        placePad(lane.pads[0]!, lane.caps[0]!, cur, rs.t, lane.z);
        placePad(lane.pads[1]!, lane.caps[1]!, nxt, rs.t, lane.z);
        lane.pivot.visible = rs.len > 0.02 && rs.phase !== 'idle';
        lane.pivot.position.set(cur.r, 0.07, lane.z);
        lane.pivot.rotation.z = Math.PI / 2 - stickAngle(rs);
        lane.plank.scale.set(Math.max(0.01, rs.len), 1, 0.7);
        rc.group.position.set(rs.heroX, rs.heroY, lane.z);
        animate(rc, rs, lane.lastPhase);
        lane.lastPhase = rs.phase;
        if (rs.results !== lane.lastResults) {
          lane.lastResults = rs.results;
          if (rs.last === 2) ctx.burst(bp.set(rs.target, 0.8, lane.z), rc.avatar.color, 8);
        }
      });
      states.forEach((st, i) => {
        const lane = lanes[i] as Lane;
        for (const p of lane.pads) p.visible = !!st;
        if (!st) lane.pivot.visible = false;
      });
    },
    dispose() {
      scene.fog = null;
      for (const m of ghostMats) m.dispose();
      for (const sp of spriteCache.values()) {
        sp.material.map?.dispose();
        sp.material.dispose();
      }
    },
  };
};
