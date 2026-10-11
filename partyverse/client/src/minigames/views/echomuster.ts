import * as THREE from 'three';
import { PILLAR_ANGLES, type EchoState } from '@shared/minigames/games/echomuster';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';

const COLORS = [0xff4d6d, 0x4dabff, 0x3ddc84, 0xffd23f, 0xb26bff, 0xff8a3d];
const SOUNDS = ['beep', 'coin', 'jump', 'tick', 'good', 'whoosh'];
const RX = 3.7;
const RZ = 2.9;

/** Kristallhain: Sechs Kristallsäulen im Kreis, in der Mitte ein neugieriger Echo-Geist, der der Folge mit den Augen folgt. */
export const createView: MiniGameViewFactory<EchoState> = (ctx) => {
  const { root, camera } = ctx;
  ctx.scene.background = new THREE.Color(0x1b1148);
  ctx.scene.fog = new THREE.Fog(0x1b1148, 22, 48);

  // Boden: Steinplatte mit Runenring
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(7.2, 7.6, 0.6, 48), toon(0x3a2d78));
  floor.position.y = -0.3;
  root.add(floor);
  const floorTop = new THREE.Mesh(new THREE.CylinderGeometry(6.2, 6.2, 0.08, 48), toon(0x4c3c96));
  floorTop.position.y = 0.02;
  root.add(floorTop);
  const rune = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.06, 6, 64), glow(0x8f7bff, 0.55));
  rune.rotation.x = Math.PI / 2;
  rune.position.y = 0.08;
  root.add(rune);
  const rune2 = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.05, 6, 40), glow(0x8f7bff, 0.5));
  rune2.rotation.x = Math.PI / 2;
  rune2.position.y = 0.08;
  root.add(rune2);

  // Säulen
  interface Pillar {
    g: THREE.Group;
    crystal: THREE.Mesh;
    mat: THREE.MeshToonMaterial;
    halo: THREE.Mesh;
    wave: THREE.Mesh;
    label?: THREE.Sprite;
    x: number;
    z: number;
    pop: number;
  }
  const pillars: Pillar[] = [];
  const crystalGeo = new THREE.OctahedronGeometry(0.85, 0);
  for (let i = 0; i < 6; i++) {
    const a = ((PILLAR_ANGLES[i] as number) * Math.PI) / 180;
    const x = Math.cos(a) * RX;
    const z = -Math.sin(a) * RZ;
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.15, 0.5, 6), toon(0x2a2060));
    base.position.y = 0.25;
    g.add(base);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.75, 0.6, 6), toon(0x5a49b8));
    stem.position.y = 0.8;
    g.add(stem);
    const mat = toon(COLORS[i] as number, { emissive: COLORS[i] as number, emissiveIntensity: 0.15 }).clone();
    mat.userData = {};
    const crystal = new THREE.Mesh(crystalGeo, mat);
    crystal.scale.set(1, 1.9, 1);
    crystal.position.y = 2.3;
    g.add(crystal);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(1.7, 20, 14), glow(COLORS[i] as number, 0));
    halo.position.y = 2.3;
    halo.visible = false;
    g.add(halo);
    const wave = new THREE.Mesh(new THREE.TorusGeometry(1, 0.07, 6, 40), glow(COLORS[i] as number, 0));
    wave.rotation.x = Math.PI / 2;
    wave.position.y = 0.12;
    wave.visible = false;
    g.add(wave);
    let label: THREE.Sprite | undefined;
    if (i >= 4) {
      label = textSprite(i === 4 ? 'B' : 'A', { color: '#ffffff', size: 56 });
      label.scale.multiplyScalar(0.6);
      label.position.set(0, 0.06, 1.55);
      g.add(label);
    }
    root.add(g);
    pillars.push({ g, crystal, mat, halo, wave, label, x, z, pop: i < 4 ? 1 : 0 });
    if (i >= 4) g.scale.setScalar(0.001);
  }

  // Echo-Geist in der Mitte
  const spirit = new THREE.Group();
  spirit.position.y = 1.2;
  root.add(spirit);
  const bodyMat = toon(0xf4f0ff);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.78, 24, 18), bodyMat);
  body.scale.set(1, 1.12, 1);
  spirit.add(body);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.9, 16), bodyMat);
  tail.rotation.x = Math.PI;
  tail.position.y = -0.85;
  spirit.add(tail);
  const face = new THREE.Group();
  spirit.add(face);
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), toon(0xffffff));
    eye.position.set(sx * 0.3, 0.12, 0.62);
    eye.scale.set(1, 1.2, 0.6);
    face.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), toon(0x1b1148));
    pupil.position.set(sx * 0.3, 0.12, 0.76);
    face.add(pupil);
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), glow(0xff9ec4, 0.8));
    cheek.position.set(sx * 0.5, -0.16, 0.54);
    cheek.scale.set(1.3, 0.7, 0.4);
    face.add(cheek);
  }
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.035, 6, 14, Math.PI), toon(0x1b1148));
  mouth.position.set(0, -0.12, 0.74);
  mouth.rotation.z = Math.PI;
  face.add(mouth);
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6), toon(0xc9bcff));
  antenna.position.y = 1.0;
  spirit.add(antenna);
  const antBall = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), glow(0xffe36e));
  antBall.position.y = 1.3;
  spirit.add(antBall);
  const spiritShadow = new THREE.Mesh(new THREE.CircleGeometry(0.8, 20), glow(0x120a33, 0.45));
  spiritShadow.rotation.x = -Math.PI / 2;
  spiritShadow.position.y = 0.1;
  root.add(spiritShadow);

  // Fortschrittsperlen vorn
  const MAXD = 14;
  const dots: THREE.Mesh[] = [];
  const dotGeo = new THREE.SphereGeometry(0.17, 10, 8);
  for (let i = 0; i < MAXD; i++) {
    const m = new THREE.Mesh(dotGeo, glow(0x4a3d8f));
    m.position.set((i - (MAXD - 1) / 2) * 0.5, 0.2, 5.0);
    root.add(m);
    dots.push(m);
  }

  // Schwebende Funken
  const SP = 36;
  const sparks = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.09, 0), glow(0xcfc4ff, 0.8), SP);
  root.add(sparks);
  const sparkSeed = Array.from({ length: SP }, (_, i) => ({ a: (i * 2.399) % 6.283, r: 2.5 + ((i * 37) % 50) / 7, h: ((i * 53) % 40) / 7 + 0.5, sp: 0.1 + ((i * 17) % 10) / 40 }));
  const tmp = new THREE.Object3D();

  let t = 0;
  let lastPresses = 0;
  let lastPhase = '';
  let shake = 0;
  let lastAspect = 0;
  const target = new THREE.Vector3(0, 0.6, 0);
  const look = new THREE.Vector3(0, 0.6, 0);
  const lookAtPillar = new THREE.Vector3();
  const burstPos = new THREE.Vector3();

  const placeCamera = () => {
    const d = Math.max(9.5, 11.6 / camera.aspect);
    camera.position.set(0, d * 0.78, d * 0.64 + 0.5);
    camera.lookAt(0, 0.5, -0.3);
    lastAspect = camera.aspect;
  };
  placeCamera();

  return {
    update(s, dt) {
      t += dt;
      if (Math.abs(camera.aspect - lastAspect) > 0.001) placeCamera();
      rune.rotation.z += dt * 0.15;
      rune2.rotation.z -= dt * 0.3;

      // Sichtbare Säulen (fünfte/sechste erscheinen mit Aufpoppen)
      for (let i = 0; i < 6; i++) {
        const p = pillars[i] as Pillar;
        const want = i < s.pillars ? 1 : 0;
        p.pop += (want - p.pop) * Math.min(1, dt * 6);
        const sc = Math.max(0.001, p.pop * (1 + Math.sin(Math.min(1, p.pop) * Math.PI) * 0.15));
        p.g.scale.setScalar(sc);
        const lit = (s.lit[i] as number) / 14;
        const on = Math.min(1, lit);
        const wrongFlash = s.phase === 'over' && s.wrong === i;
        p.mat.emissiveIntensity = 0.15 + on * 1.1 + (wrongFlash ? 0.8 + Math.sin(t * 30) * 0.3 : 0);
        p.crystal.position.y = 2.3 + Math.sin(t * 1.6 + i) * 0.1 + on * 0.35;
        p.crystal.rotation.y += dt * (0.5 + on * 5);
        const k = 1 + on * 0.28;
        p.crystal.scale.set(k, 1.9 * k, k);
        p.halo.visible = on > 0.02;
        (p.halo.material as THREE.MeshBasicMaterial).opacity = on * 0.35;
        p.halo.scale.setScalar(0.8 + on * 0.5);
        p.wave.visible = on > 0.02;
        if (p.wave.visible) {
          const r = 1 + (1 - on) * 2.6;
          p.wave.scale.setScalar(r);
          (p.wave.material as THREE.MeshBasicMaterial).opacity = on * 0.7;
        }
        if (p.label) p.label.visible = want > 0.5;
        p.g.rotation.z = wrongFlash ? Math.sin(t * 40) * 0.05 : 0;
      }

      // Neue Eingabe/Vorspielton?
      if (s.presses !== lastPresses) {
        lastPresses = s.presses;
        const i = s.lastPress;
        if (i >= 0) {
          const p = pillars[i] as Pillar;
          if (s.lastOk) {
            ctx.sfx(SOUNDS[i] as string);
            burstPos.set(p.x, 2.6, p.z);
            ctx.burst(burstPos, COLORS[i] as number, s.phase === 'show' ? 10 : 16);
          } else {
            ctx.sfx('bad');
            shake = 0.6;
            burstPos.set(p.x, 2.4, p.z);
            ctx.burst(burstPos, 0xff3355, 24);
          }
        }
      }
      if (s.phase !== lastPhase) {
        if (s.phase === 'ok') ctx.sfx('win');
        if (s.phase === 'input') ctx.sfx('tick');
        lastPhase = s.phase;
      }

      // Geist: schaut zur leuchtenden Säule
      let lx = 0;
      let lz = 1;
      let lit = -1;
      for (let i = 0; i < 6; i++) if ((s.lit[i] as number) > 0 && (lit < 0 || (s.lit[i] as number) > (s.lit[lit] as number))) lit = i;
      if (lit >= 0) {
        const p = pillars[lit] as Pillar;
        lookAtPillar.set(p.x, 0, p.z);
        lx = p.x;
        lz = p.z;
      }
      const wantY = lit >= 0 ? Math.atan2(lx, lz) : 0;
      let dy = wantY - face.rotation.y;
      dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      face.rotation.y += dy * Math.min(1, dt * 9);
      const happy = s.phase === 'ok';
      const sad = s.phase === 'over' && s.failed;
      spirit.position.y = 1.2 + Math.sin(t * 2) * 0.12 + (happy ? Math.abs(Math.sin(t * 9)) * 0.6 : 0) - (sad ? 0.35 : 0);
      spirit.rotation.y = face.rotation.y * 0.0;
      body.scale.set(1 + (happy ? Math.sin(t * 18) * 0.06 : 0), 1.12 - (happy ? Math.sin(t * 18) * 0.06 : 0) - (sad ? 0.2 : 0), 1);
      mouth.rotation.z = sad ? 0 : Math.PI;
      mouth.position.y = sad ? -0.22 : -0.12;
      const orb = s.phase === 'input' ? 0x5dff9c : s.phase === 'ok' ? 0xffd23f : sad ? 0xff3355 : 0xffe36e;
      (antBall.material as THREE.MeshBasicMaterial).color.setHex(orb);
      antBall.scale.setScalar(1 + Math.sin(t * (s.phase === 'input' ? 8 : 3)) * 0.25);
      (rune.material as THREE.MeshBasicMaterial).color.setHex(s.phase === 'input' ? 0x5dff9c : sad ? 0xff3355 : 0x8f7bff);
      spiritShadow.scale.setScalar(1 - (spirit.position.y - 1.2) * 0.15);

      // Perlen
      const shown = Math.min(MAXD, s.len);
      for (let i = 0; i < MAXD; i++) {
        const d = dots[i] as THREE.Mesh;
        const m = d.material as THREE.MeshBasicMaterial;
        d.visible = i < shown;
        const done = s.phase === 'ok' ? true : s.phase === 'input' || s.phase === 'over' ? i < s.pos : false;
        const playing = s.phase === 'show' && i === s.showIdx;
        m.color.setHex(done ? 0x5dff9c : playing ? 0xffe36e : 0x4a3d8f);
        d.scale.setScalar(playing ? 1.4 : done ? 1.15 : 1);
        d.position.x = (i - (shown - 1) / 2) * Math.min(0.5, 6.4 / Math.max(1, shown));
      }

      // Funken
      for (let i = 0; i < SP; i++) {
        const q = sparkSeed[i]!;
        const a = q.a + t * q.sp;
        tmp.position.set(Math.cos(a) * q.r, q.h + Math.sin(t * 0.8 + i) * 0.4, -Math.sin(a) * q.r * 0.8);
        tmp.rotation.set(t + i, t * 0.7, 0);
        tmp.scale.setScalar(0.7 + Math.sin(t * 2 + i) * 0.3);
        tmp.updateMatrix();
        sparks.setMatrixAt(i, tmp.matrix);
      }
      sparks.instanceMatrix.needsUpdate = true;

      // Kamera
      shake = Math.max(0, shake - dt);
      const d = Math.max(9.5, 11.6 / camera.aspect);
      camera.position.set((Math.sin(t * 60) * shake * 0.25), d * 0.78, d * 0.64 + 0.5);
      look.lerp(target, 0.1);
      camera.lookAt(0, 0.5, -0.3);
    },
    dispose() {
      /* Alles hängt an root und wird vom Stage freigegeben */
    },
  };
};
