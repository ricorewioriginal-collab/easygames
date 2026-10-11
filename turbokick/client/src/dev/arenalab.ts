import * as THREE from 'three';
import { BOOST_PADS } from '@shared/sim';
import { ARENA, BALL_RADIUS, BIG_PAD_RESPAWN, CAR_HALF, SMALL_PAD_RESPAWN } from '@shared/sim/types';
import type { PadState, SimState } from '@shared/sim/types';
import { createArena } from '../render/arena';
import type { ArenaTheme } from '../render/arena';
import { Engine } from '../render/engine';
import type { Screen } from '../render/engine';
import { QUALITY_PRESETS } from '../render/quality';
import type { QualityLevel } from '../render/quality';

interface LabState {
  errors: string[];
  frames: number;
}

/**
 * Arena-Labor (?lab=arena&theme=neon|eis|canyon&cam=0..3&celebrate=1[&speed=n][&q=low|medium|high])
 * cam 0 = Übersicht schräg von oben, 1 = Mittellinie in Bodennähe, 2 = Tor-Kamera, 3 = Zuschauerblick.
 * Ziehen mit der Maus dreht die Kamera.
 */
export function startArenaLab(params: URLSearchParams): void {
  const host = document.getElementById('app');
  if (!host) return;
  const lab: LabState = { errors: [], frames: 0 };
  (window as unknown as { __lab: LabState }).__lab = lab;
  window.addEventListener('error', (e) => lab.errors.push(String(e.message)));
  window.addEventListener('unhandledrejection', (e) => lab.errors.push(String((e as PromiseRejectionEvent).reason)));

  const themeParam = params.get('theme');
  const theme: ArenaTheme = themeParam === 'eis' || themeParam === 'canyon' ? themeParam : 'neon';
  const camIdx = Math.max(0, Math.min(3, Number(params.get('cam') ?? '0') || 0));
  const speed = Number(params.get('speed') ?? '1') || 1;
  const qParam = params.get('q');
  const level: QualityLevel = qParam === 'low' || qParam === 'high' ? qParam : 'medium';

  const engine = new Engine(host, QUALITY_PRESETS[level]);
  engine.autoQuality = false;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(62, 1, 0.3, 1500);
  const arena = createArena(theme, engine.quality);
  scene.add(arena.group);
  arena.applyTo(scene);

  // Attrappen: Ball und zwei Autos (Größenvergleich, Schatten)
  const ballMesh = new THREE.Mesh(new THREE.SphereGeometry(BALL_RADIUS, 24, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x88ccff, emissiveIntensity: 0.9, roughness: 0.3 }));
  ballMesh.castShadow = true;
  scene.add(ballMesh);
  const carGeo = new THREE.BoxGeometry(CAR_HALF[0] * 2, CAR_HALF[1] * 2, CAR_HALF[2] * 2);
  const cars: THREE.Mesh[] = [];
  for (const [x, z, c] of [[-6, -10, 0xff7a1a], [8, 14, 0x2ac8ff]] as Array<[number, number, number]>) {
    const m = new THREE.Mesh(carGeo, new THREE.MeshStandardMaterial({ color: c, roughness: 0.4 }));
    m.scale.setScalar(2.2);
    m.position.set(x, CAR_HALF[1] * 2.2, z);
    m.castShadow = true;
    scene.add(m);
    cars.push(m);
  }

  // Pads: genau die Positionen der Physik (6 große + 28 kleine)
  const pads: PadState[] = BOOST_PADS.map((p) => ({ pos: [p.pos[0], p.pos[1], p.pos[2]], big: p.big, active: true, timer: 0 }));

  const state: SimState = {
    tick: 0,
    phase: 'playing',
    phaseTimer: 0,
    clock: 213,
    overtime: false,
    score: [2, 1],
    cars: [],
    ball: { pos: [0, 3, 0], vel: [0, 0, 0], angVel: [0, 0, 0] },
    pads,
    lastTouch: -1,
    prevTouch: -1,
    winner: -1,
    rngState: 1,
  };

  // Kamera
  const views: Array<{ pos: [number, number, number]; look: [number, number, number]; fov: number }> = [
    { pos: [0, 78, 112], look: [0, 0, 6], fov: 55 },
    { pos: [0, 3.2, 0], look: [0, 4.5, 50], fov: 70 },
    { pos: [13, 5.5, 30], look: [0, 3.5, 54], fov: 66 },
    { pos: [-(ARENA.halfWidth + 9), 9.5, 12], look: [4, 2, 0], fov: 62 },
  ];
  const v = views[camIdx] as (typeof views)[number];
  camera.fov = v.fov;
  camera.updateProjectionMatrix();
  let yaw = 0;
  let pitch = 0;
  const dir = new THREE.Vector3();
  const tgt = new THREE.Vector3();
  const applyCam = (): void => {
    camera.position.set(v.pos[0], v.pos[1], v.pos[2]);
    dir.set(v.look[0] - v.pos[0], v.look[1] - v.pos[1], v.look[2] - v.pos[2]);
    const len = dir.length();
    dir.normalize();
    const ang = Math.atan2(dir.x, dir.z) + yaw;
    const el = Math.max(-1.4, Math.min(1.4, Math.asin(dir.y) + pitch));
    tgt.set(camera.position.x + Math.sin(ang) * Math.cos(el) * len, camera.position.y + Math.sin(el) * len, camera.position.z + Math.cos(ang) * Math.cos(el) * len);
    camera.lookAt(tgt);
  };
  applyCam();
  let drag = false;
  engine.canvas.addEventListener('pointerdown', () => (drag = true));
  window.addEventListener('pointerup', () => (drag = false));
  window.addEventListener('pointermove', (e) => {
    if (!drag) return;
    yaw -= e.movementX * 0.004;
    pitch -= e.movementY * 0.004;
    applyCam();
  });

  let t = 0;
  let celebrated = false;
  const wantCelebrate = params.get('celebrate') === '1';
  const screen: Screen = {
    scene,
    camera,
    update(rawDt: number): void {
      const dt = rawDt * speed;
      t += dt;
      lab.frames++;
      state.tick++;
      // Ball auf einer Bahn, damit Lichtpfütze und Wandglühen sichtbar werden
      const bx = Math.sin(t * 0.4) * 22;
      const bz = Math.cos(t * 0.3) * 30;
      const by = 1.4 + Math.abs(Math.sin(t * 1.3)) * 6;
      state.ball.pos[0] = bx;
      state.ball.pos[1] = by;
      state.ball.pos[2] = bz;
      ballMesh.position.set(bx, by, bz);
      for (let i = 0; i < pads.length; i++) {
        const p = pads[i] as PadState;
        const respawn = p.big ? BIG_PAD_RESPAWN : SMALL_PAD_RESPAWN;
        const ph = (t * 0.12 + i * 0.173) % 1;
        if (i % 3 === 0 && ph < 0.45) {
          p.active = false;
          p.timer = respawn * (1 - ph / 0.45);
        } else {
          p.active = true;
          p.timer = 0;
        }
      }
      if (wantCelebrate && !celebrated && t >= 1) {
        celebrated = true;
        arena.celebrate(0);
        state.score[0]++;
      }
      arena.update(dt, state);
    },
  };
  engine.setScreen(screen);
  engine.start();
}
