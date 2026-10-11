import * as THREE from 'three';
import { bpmAt, multiplier, type BeatState } from '@shared/minigames/games/takttreffer';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';

const LANE_COLORS = [0xff4d8d, 0x39d6ff, 0xffd23f];
const LANE_X = [-2.1, 0, 2.1];
const SPEED = 20; // Einheiten pro Sekunde
const SOUNDS = ['beep', 'coin', 'jump'];

/** Neon-Autobahn: drei Spuren, ein DJ-Blob am Horizont wippt im Takt, Noten sind leuchtende Trommelpads. */
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
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.07, 8, 32), glow(LANE_COLORS[i] as number, 0.95));
    ring.rotation.x = Math.PI / 2;
    ring.position.set(LANE_X[i] as number, 0.2, 0);
    root.add(ring);
    padRings.push(ring);
  }

  // Noten
  const POOL = 28;
  const noteGeo = new THREE.SphereGeometry(0.72, 20, 12);
  const notes = new THREE.InstancedMesh(noteGeo, toon(0xffffff), POOL);
  notes.frustumCulled = false;
  root.add(notes);
  const rimGeo = new THREE.TorusGeometry(0.74, 0.06, 6, 24);
  const rims = new THREE.InstancedMesh(rimGeo, glow(0xffffff, 0.9), POOL);
  rims.frustumCulled = false;
  root.add(rims);
  const tmp = new THREE.Object3D();
  const col = new THREE.Color();

  // Equalizer-Säulen links und rechts
  const EQ = 10;
  const eqGeo = new THREE.BoxGeometry(1, 1, 1);
  const eq = new THREE.InstancedMesh(eqGeo, toon(0xffffff), EQ * 2);
  root.add(eq);
  for (let i = 0; i < EQ * 2; i++) eq.setColorAt(i, col.setHex([0xff4d8d, 0x39d6ff, 0xffd23f, 0x7dff8a][i % 4] as number));

  // DJ-Blob am Horizont
  const dj = new THREE.Group();
  dj.position.set(0, 0, -24);
  dj.scale.setScalar(2.2);
  root.add(dj);
  const podium = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 0.7, 20), toon(0x3d2f9a));
  podium.position.y = 0.35;
  dj.add(podium);
  const djBody = new THREE.Group();
  djBody.position.y = 1.5;
  dj.add(djBody);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.8, 22, 16), toon(0x7dff8a));
  body.scale.set(1, 1.1, 1);
  djBody.add(body);
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8), toon(0xffffff));
    eye.position.set(sx * 0.28, 0.15, 0.68);
    djBody.add(eye);
    const pup = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), toon(0x120a38));
    pup.position.set(sx * 0.28, 0.15, 0.82);
    djBody.add(pup);
    const cup = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 8), toon(0xff4d8d));
    cup.scale.set(0.6, 1, 1);
    cup.position.set(sx * 0.86, 0.2, 0);
    djBody.add(cup);
  }
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.05, 6, 20, Math.PI), toon(0xff4d8d));
  band.position.y = 0.2;
  djBody.add(band);
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 6, 12, Math.PI), toon(0x120a38));
  mouth.rotation.z = Math.PI;
  mouth.position.set(0, -0.12, 0.76);
  djBody.add(mouth);
  const arms: THREE.Mesh[] = [];
  for (const sx of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.5, 4, 8), toon(0x7dff8a));
    arm.position.set(sx * 0.95, -0.2, 0.2);
    djBody.add(arm);
    arms.push(arm);
  }
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.06, 20), toon(0x120a38));
  disc.position.set(0, 0.74, 0.6);
  dj.add(disc);

  // Wertungstexte und Multiplikator
  const judgeSprites: Record<string, THREE.Sprite> = {
    perfect: textSprite('PERFEKT!', { color: '#fff176', size: 64, width: 3.6 }),
    good: textSprite('Gut', { color: '#7dff8a', size: 64, width: 2.0 }),
    miss: textSprite('Daneben', { color: '#ff6b81', size: 64, width: 3.0 }),
  };
  judgeSprites.stray = judgeSprites.miss as THREE.Sprite;
  for (const k of ['perfect', 'good', 'miss']) {
    const sp = judgeSprites[k] as THREE.Sprite;
    sp.visible = false;
    root.add(sp);
  }
  const multSprites = [1, 2, 3, 4].map((m) => {
    const sp = textSprite(`x${m}`, { color: '#ffffff', bg: m === 1 ? '#3b3189' : '#ff4d8d', size: 56, width: 1.5 });
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

  const placeCamera = () => {
    lastAspect = camera.aspect;
    if (camera.aspect < 1) camera.position.set(0, 8.2 + (1 - camera.aspect) * 3, 10.5 + (1 - camera.aspect) * 4);
    else camera.position.set(0, 5.2, 7.2);
    camera.lookAt(0, 0, -5.5);
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
      for (let i = s.head > 3 ? s.head - 3 : 0; i < s.notes.length && n < POOL; i++) {
        const note = s.notes[i]!;
        const ahead = note.t - vt;
        if (ahead > (SPEED * 1.7 * 60) / SPEED) break;
        if (ahead < -22) continue;
        if (note.res === 1 || note.res === 2) continue;
        const z = -ahead * (SPEED / 60);
        tmp.position.set(LANE_X[note.lane] as number, 0.35, z);
        const missed = note.res === 3;
        tmp.scale.set(1, 0.5, 1).multiplyScalar(missed ? 0.8 : 1);
        tmp.updateMatrix();
        notes.setMatrixAt(n, tmp.matrix);
        notes.setColorAt(n, col.setHex(missed ? 0x555069 : (LANE_COLORS[note.lane] as number)));
        tmp.position.y = 0.56;
        tmp.rotation.x = Math.PI / 2;
        tmp.scale.setScalar(missed ? 0.8 : 1);
        tmp.updateMatrix();
        rims.setMatrixAt(n, tmp.matrix);
        rims.setColorAt(n, col.setHex(missed ? 0x2b2840 : 0xffffff));
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
      notes.instanceMatrix.needsUpdate = true;
      rims.instanceMatrix.needsUpdate = true;
      if (notes.instanceColor) notes.instanceColor.needsUpdate = true;
      if (rims.instanceColor) rims.instanceColor.needsUpdate = true;

      // Wertung
      if (s.judgeSeq !== lastSeq) {
        lastSeq = s.judgeSeq;
        const k = s.judgeKind === 'stray' ? 'miss' : s.judgeKind;
        const lane = s.judgeLane;
        if (k === 'perfect' || k === 'good') {
          padHit[lane] = 1;
          bp.set(LANE_X[lane] as number, 0.5, 0);
          ctx.burst(bp, LANE_COLORS[lane] as number, k === 'perfect' ? 18 : 8);
          ctx.sfx(SOUNDS[lane] as string);
          if (k === 'perfect' && s.combo > 0 && s.combo % 8 === 0) ctx.sfx('win');
        } else if (k === 'miss') {
          ctx.sfx('bad');
        }
        if (k) {
          judgeKey = k;
          judgeAge = 0;
        }
      }
      judgeAge += dt;
      for (const k of ['perfect', 'good', 'miss']) {
        const sp = judgeSprites[k] as THREE.Sprite;
        const vis = k === judgeKey && judgeAge < 0.7;
        sp.visible = vis;
        if (vis) {
          sp.position.set(LANE_X[s.judgeLane] as number * 0.6, 1.6 + judgeAge * 1.4, 0.4);
          const sc = 1 + Math.sin(Math.min(1, judgeAge * 5) * Math.PI) * 0.2;
          sp.scale.set(((k === 'perfect' ? 3.6 : k === 'good' ? 2.0 : 3.0) * sc), 0.5 * sc * (k === 'perfect' ? 1.1 : 1), 1);
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
        const h = 1.2 + (0.5 + 0.5 * Math.sin(beat * 6.283 * 0.5 * (1 + (k % 3)) + k * 1.3)) * 3.2 + pulse * 1.2;
        tmp.position.set(side * (6 + k * 1.3), h / 2 - 0.4, -6 - k * 2.6);
        tmp.scale.set(0.9, h, 0.9);
        tmp.rotation.set(0, 0, 0);
        tmp.updateMatrix();
        eq.setMatrixAt(i, tmp.matrix);
      }
      eq.instanceMatrix.needsUpdate = true;

      // DJ
      const happy = s.combo >= 8;
      djBody.position.y = 1.5 + pulse * 0.18 + (happy ? Math.abs(Math.sin(t * 8)) * 0.15 : 0);
      djBody.rotation.z = Math.sin(beat * Math.PI) * 0.1;
      arms[0]!.rotation.z = 0.5 + Math.sin(beat * Math.PI * 2) * 0.5 - (happy ? 1 : 0);
      arms[1]!.rotation.z = -0.5 - Math.cos(beat * Math.PI * 2) * 0.5 + (happy ? 1 : 0);
      mouth.rotation.z = s.combo === 0 && s.miss > 2 ? 0 : Math.PI;
      disc.rotation.y += dt * 4;
    },
    dispose() {
      /* Alles hängt an root und wird vom Stage freigegeben */
    },
  };
};
