import * as THREE from 'three';
import { getLayout } from '@shared/levels';
import { Engine, type Screen } from '../render/engine';
import { QUALITY_PRESETS, type QualityLevel } from '../render/quality';
import { WorldScene } from '../render/worlds';

/** Welten-Labor: ?worldlab=<layout-id>[&phase=0][&yaw=30][&pitch=40][&dist=1.3][&q=low|medium|high] – zeigt Brett und Dekoration. */
declare global {
  interface Window {
    __worldlab?: { errors: string[]; frames: number; world: WorldScene };
  }
}

export function startWorldLab(params: URLSearchParams): void {
  const el = document.getElementById('app');
  if (!el) return;
  el.textContent = '';
  el.style.cssText = 'position:relative;width:100vw;height:100vh';
  const errors: string[] = [];
  window.addEventListener('error', (e) => errors.push(String(e.message)));
  const layout = getLayout(params.get('worldlab') === '1' ? 'prismara-01' : (params.get('worldlab') as string));
  if (!layout) {
    el.textContent = 'Unbekanntes Layout';
    return;
  }
  const q = (params.get('q') as QualityLevel) in QUALITY_PRESETS ? (params.get('q') as QualityLevel) : 'medium';
  const engine = new Engine(el, QUALITY_PRESETS[q]);
  const world = new WorldScene(layout, engine.quality);
  world.board.setPhase(Number(params.get('phase') ?? 0), true);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.5, 900);
  const yaw0 = (Number(params.get('yaw') ?? 30) * Math.PI) / 180;
  const pitch = (Number(params.get('pitch') ?? 38) * Math.PI) / 180;
  const dist = world.board.radius * Number(params.get('dist') ?? 1.5);
  let t = 0;
  const api = { errors, frames: 0, world };
  window.__worldlab = api;
  const screen: Screen = {
    scene: world.scene,
    camera,
    update(dt) {
      t += dt;
      const yaw = yaw0 + (params.get('spin') === '1' ? t * 0.15 : 0);
      const c = world.board.center;
      camera.position.set(c.x + Math.sin(yaw) * Math.cos(pitch) * dist, c.y + Math.sin(pitch) * dist, c.z + Math.cos(yaw) * Math.cos(pitch) * dist);
      camera.lookAt(c);
      world.update(dt, camera.position);
      api.frames++;
    },
  };
  engine.setScreen(screen);
  engine.start();
}
