import * as THREE from 'three';
import { HEARTS, PILLAR_SCREEN, type EchoState } from '@shared/minigames/games/echomuster';
import { glow, textSprite, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';
import { makeMe, makeRivals, updateRivals } from './rivals';

const COLORS = [0xff4d6d, 0x4dabff, 0x3ddc84, 0xffd23f, 0xb26bff, 0xff8a3d];
const SOUNDS = ['beep', 'coin', 'jump', 'tick', 'good', 'whoosh'];
/** Höhe der Kristalle (auf diese Ebene werden die Bildschirmpositionen der Säulen projiziert) */
const CRYSTAL_Y = 2.1;

/**
 * Kristallhain: Sechs Kristallsäulen im Kreis, in der Mitte die eigene Figur, die der Folge mit dem Blick folgt.
 * Die Mitspieler stehen am Rand der Plattform, über ihnen ihre aktuelle Länge und Herzen.
 */
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
  rune2.position.set(0, 0.08, -0.3);
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
  const crystalGeo = new THREE.OctahedronGeometry(0.62, 0);
  for (let i = 0; i < 6; i++) {
    // vorläufig; placeCamera() stellt die Säulen genau an ihre Bildschirmposition
    const x = (PILLAR_SCREEN[i] as readonly [number, number])[0] * 6;
    const z = -(PILLAR_SCREEN[i] as readonly [number, number])[1] * 8;
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
    crystal.scale.set(1, 1.8, 1);
    crystal.position.y = 2.1;
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
      label.position.set(0, 0.95, 1.05);
      g.add(label);
    }
    root.add(g);
    pillars.push({ g, crystal, mat, halo, wave, label, x, z, pop: i < 4 ? 1 : 0 });
    if (i >= 4) g.scale.setScalar(0.001);
  }

  // Eigene Figur in der Mitte
  const me = makeMe(ctx, 1.05);
  me.group.position.set(0, 0.08, -0.3);
  const lookP = new THREE.Vector3();
  let meAnim = '';
  const playMe = (a: 'idle' | 'celebrate' | 'shock' | 'lose' | 'cheer') => {
    if (meAnim === a) return;
    meAnim = a;
    me.rig.play(a, { loop: a === 'idle' });
  };

  // Mitspieler am Rand
  const rivals = makeRivals(ctx, 0.85);
  const rivalInfo = rivals.map(() => {
    return { key: '', label: null as THREE.Sprite | null, presses: 0, phase: '' };
  });
  const setLabel = (i: number, text: string, color: number): void => {
    const info = rivalInfo[i]!;
    if (info.key === text) return;
    info.key = text;
    if (info.label) {
      info.label.material.map?.dispose();
      info.label.material.dispose();
      info.label.removeFromParent();
    }
    const sp = textSprite(text, {
      color: '#ffffff',
      bg: '#' + new THREE.Color(color).multiplyScalar(0.6).getHexString(),
      size: 44,
      width: 1.5,
    });
    sp.material.fog = false;
    const g = (rivals[i] as (typeof rivals)[number]).group.position;
    sp.position.set(g.x, 2.45, g.z);
    root.add(sp);
    info.label = sp;
  };

  // Herzen und Rückwärts-Schild
  const hearts = [0, 1, 2].map((i) => {
    const h = textSprite('♥', { color: '#ff4d6d', size: 72 });
    h.scale.multiplyScalar(0.75);
    h.position.set(-0.8 + i * 0.8, 0.5, 5.4);
    h.userData.base = h.scale.clone();
    root.add(h);
    return h;
  });
  const sign = (txt: string, fg: string, bg: string, w: number): THREE.Sprite => {
    const sp = textSprite(txt, { color: fg, bg, size: 64, width: w });
    sp.material.fog = false;
    sp.visible = false;
    root.add(sp);
    return sp;
  };
  const revSign = sign('⟲ RÜCKWÄRTS!', '#ffffff', '#ff8a3d', 4.4);
  const againSign = sign('Nochmal!', '#ffffff', '#ff4d6d', 3.0);
  const okSign = sign('Richtig!', '#1b1148', '#5dff9c', 3.0);
  const turnSign = sign('Du bist dran!', '#1b1148', '#5dff9c', 3.6);

  // Fortschrittsperlen vorn
  const MAXD = 14;
  const dots: THREE.Mesh[] = [];
  const dotGeo = new THREE.SphereGeometry(0.2, 10, 8);
  for (let i = 0; i < MAXD; i++) {
    const m = new THREE.Mesh(dotGeo, glow(0x7a6ad8));
    m.position.set((i - (MAXD - 1) / 2) * 0.5, 0.2, 5.6);
    root.add(m);
    dots.push(m);
  }

  // Schwebende Funken
  const SP = 36;
  const sparks = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.09, 0), glow(0xcfc4ff, 0.8), SP);
  root.add(sparks);
  const sparkSeed = Array.from({ length: SP }, (_, i) => ({
    a: (i * 2.399) % 6.283,
    r: 2.5 + ((i * 37) % 50) / 7,
    h: ((i * 53) % 40) / 7 + 0.5,
    sp: 0.1 + ((i * 17) % 10) / 40,
  }));
  const tmp = new THREE.Object3D();

  let t = 0;
  let lastPresses = 0;
  let lastPhase = '';
  let shake = 0;
  let lastAspect = 0;
  const burstPos = new THREE.Vector3();

  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3(0, CRYSTAL_Y, 0);
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const hit = new THREE.Vector3();
  /** Weltpunkt auf der Höhe y unter dem Bildschirmpunkt (nx, ny) */
  const onScreen = (nx: number, ny: number, y: number, out: THREE.Vector3): THREE.Vector3 => {
    ray.setFromCamera(ndc.set(nx, ny), camera);
    const r = ray.ray;
    const k = (y - r.origin.y) / (Math.abs(r.direction.y) > 1e-4 ? r.direction.y : -1e-4);
    return out.copy(r.origin).addScaledVector(r.direction, Math.max(0, k));
  };
  const placeCamera = () => {
    lastAspect = camera.aspect;
    const portrait = camera.aspect < 1;
    // Hochformat: steiler von oben, damit der Kreis nicht zu tief wirkt
    const d = portrait ? Math.min(24, 10.8 / camera.aspect) : Math.max(13, 12 / camera.aspect);
    camPos.set(0, portrait ? d : d * 0.78, (portrait ? d * 0.3 : d * 0.64) + 0.5);
    camera.position.copy(camPos);
    camera.lookAt(camLook);
    camera.updateMatrixWorld();
    // Kristalle exakt dorthin, wo die Simulation den Zeiger zuordnet
    for (let i = 0; i < 6; i++) {
      const [nx, ny] = PILLAR_SCREEN[i] as readonly [number, number];
      onScreen(nx, ny, CRYSTAL_Y, hit);
      const p = pillars[i] as Pillar;
      p.x = hit.x;
      p.z = hit.z;
      p.g.position.set(hit.x, 0, hit.z);
    }
    // Perlen und Herzen vorn unten, Mitspieler am Rand oben
    onScreen(0, -0.88, 0.5, hit);
    hearts.forEach((h, i) => h.position.set(-0.8 + i * 0.8, 0.5, hit.z));
    const rp: Array<[number, number]> = [
      [-0.84, 0.58],
      [0.84, 0.58],
      [0.86, -0.52],
    ];
    rivals.forEach((r, i) => {
      const [nx, ny] = rp[i % 3] as [number, number];
      onScreen(nx, ny, 0.08, hit);
      // auf der Plattform bleiben
      const len = Math.hypot(hit.x, hit.z);
      if (len > 6.5) hit.multiplyScalar(6.5 / len);
      r.group.position.set(hit.x, 0.08, hit.z);
      r.group.rotation.y = Math.atan2(camPos.x - hit.x, camPos.z - hit.z) * 0.6;
      const info = rivalInfo[i];
      if (info?.label) info.label.position.set(hit.x, 2.45, hit.z);
    });
    onScreen(0, 0.68, 4.2, signPos);
  };
  const signPos = new THREE.Vector3(0, 5.4, -1.2);
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
        p.crystal.position.y = 2.1 + Math.sin(t * 1.6 + i) * 0.1 + on * 0.35;
        p.crystal.rotation.y += dt * (0.5 + on * 5);
        const k = 1 + on * 0.28;
        p.crystal.scale.set(k, 1.8 * k, k);
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
        if (s.phase === 'ok') {
          ctx.sfx('win');
          burstPos.set(0, 2.4, 0.4);
          ctx.burst(burstPos, s.reverse ? 0xff8a3d : 0x5dff9c, 26);
        }
        if (s.phase === 'input') ctx.sfx('tick');
        if (s.phase === 'show' && s.reverse) ctx.sfx('whoosh');
        lastPhase = s.phase;
      }

      // Eigene Figur: schaut zur leuchtenden Säule, freut sich / erschrickt
      let lit = -1;
      for (let i = 0; i < 6; i++)
        if ((s.lit[i] as number) > 0 && (lit < 0 || (s.lit[i] as number) > (s.lit[lit] as number))) lit = i;
      if (lit >= 0) {
        const p = pillars[lit] as Pillar;
        lookP.set(p.x, 2.2, p.z);
        me.rig.lookAt(lookP);
        me.rig.faceTowards(Math.atan2(p.x, p.z - 0.2) * 0.5);
      } else {
        me.rig.lookAt(null);
        me.rig.faceTowards(0);
      }
      const sad = s.phase === 'over' && s.hearts <= 0;
      if (s.phase === 'ok') playMe('celebrate');
      else if (s.phase === 'fail') playMe('shock');
      else if (sad) playMe('lose');
      else if (s.phase === 'over') playMe('cheer');
      else playMe('idle');
      me.rig.update(dt);
      (rune.material as THREE.MeshBasicMaterial).color.setHex(
        s.phase === 'input'
          ? s.reverse
            ? 0xff8a3d
            : 0x5dff9c
          : s.phase === 'fail' || sad
            ? 0xff3355
            : 0x8f7bff,
      );
      for (let i = 0; i < HEARTS; i++) {
        const h = hearts[i] as THREE.Sprite;
        const alive = i < s.hearts;
        h.material.opacity = alive ? 1 : 0.22;
        const beat = alive && s.phase === 'fail' && i === s.hearts - 1 ? 1 + Math.sin(t * 20) * 0.1 : 1;
        h.scale.copy(h.userData.base as THREE.Vector3).multiplyScalar(beat);
      }
      const rev = s.reverse && (s.phase === 'show' || s.phase === 'input' || s.phase === 'intro');
      revSign.visible = rev && (s.phase === 'input' || Math.floor(t * 5) % 4 !== 0);
      revSign.position.copy(signPos);
      againSign.visible = s.phase === 'fail';
      againSign.position.set(0, 4.2, 0.4);
      okSign.visible = s.phase === 'ok';
      okSign.position.set(0, 4.2 + Math.min(0.5, s.timer / 60), 0.4);
      turnSign.visible = s.phase === 'input' && s.inputTicks < 50 && !rev;
      turnSign.position.set(0, 4.2, 0.4);

      // Perlen
      const shown = Math.min(MAXD, s.len);
      for (let i = 0; i < MAXD; i++) {
        const d = dots[i] as THREE.Mesh;
        const m = d.material as THREE.MeshBasicMaterial;
        d.visible = i < shown;
        const k = s.reverse ? shown - 1 - i : i;
        const done = s.phase === 'ok' ? true : s.phase === 'input' || s.phase === 'over' ? k < s.pos : false;
        const playing = s.phase === 'show' && i === s.showIdx;
        m.color.setHex(done ? 0x5dff9c : playing ? 0xffe36e : 0x7a6ad8);
        d.scale.setScalar(playing ? 1.4 : done ? 1.15 : 1);
        // Perlen im Kreis um die eigene Figur, im Uhrzeigersinn ab hinten
        const ang = Math.PI / 2 - (i / Math.max(1, shown)) * Math.PI * 2;
        d.position.set(Math.cos(ang) * 1.75, 0.2, -0.3 - Math.sin(ang) * 1.75);
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
      camera.position.set(camPos.x + Math.sin(t * 60) * shake * 0.25, camPos.y, camPos.z);
      camera.lookAt(camLook);
    },
    ghosts(states, dt) {
      updateRivals(rivals, states, dt, (r, rs, i) => {
        const info = rivalInfo[i]!;
        const lvl = rs.phase === 'over' ? rs.cleared : rs.len;
        setLabel(i, `${lvl} ${'♥'.repeat(Math.max(0, rs.hearts))}`, r.avatar.color);
        if (info.label) info.label.visible = true;
        if (rs.phase !== info.phase) {
          info.phase = rs.phase;
          if (rs.phase === 'ok') r.rig.play('celebrate');
          else if (rs.phase === 'fail') r.rig.play('shock');
          else if (rs.phase === 'over' && rs.hearts <= 0) r.rig.play('lose');
        }
        // kleiner Hüpfer bei jedem eigenen Tastendruck
        if (rs.presses !== info.presses) {
          info.presses = rs.presses;
          if (rs.phase === 'input' || rs.phase === 'ok') r.group.position.y = 0.3;
        }
        r.group.position.y = Math.max(0.08, r.group.position.y - dt * 2.5);
        if (info.label) info.label.position.set(r.group.position.x, 2.45, r.group.position.z);
      });
      rivalInfo.forEach((info, i) => info.label && (info.label.visible = states[i] != null));
    },
    dispose() {
      /* Alles hängt an root und wird vom Stage freigegeben */
    },
  };
};
