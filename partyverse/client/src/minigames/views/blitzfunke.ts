import * as THREE from 'three';
import type { BlitzState } from '@shared/minigames/games/blitzfunke';
import { glow, toon } from '../../render/materials';
import type { MiniGameViewFactory } from '../viewTypes';

/** Funkbake: großer Leuchtball auf einem Turm; rot = warten, grün = jetzt, grau = Fehlstart. */
export const createView: MiniGameViewFactory<BlitzState> = (ctx) => {
  const { root, camera } = ctx;
  camera.position.set(0, 3.2, 9);
  camera.lookAt(0, 3, 0);
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(7, 7.4, 0.4, 40), toon(0x2a2060));
  floor.position.y = -0.2;
  root.add(floor);
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, 2.6, 16), toon(0x6c63ff));
  tower.position.y = 1.3;
  root.add(tower);
  const ballMat = new THREE.MeshBasicMaterial({ color: 0xff2d55 });
  const ball = new THREE.Mesh(new THREE.SphereGeometry(1.4, 32, 24), ballMat);
  ball.position.y = 3.9;
  root.add(ball);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(1.9, 24, 16), glow(0xff2d55, 0.22));
  halo.position.copy(ball.position);
  root.add(halo);
  // Rundenlichter
  const dots: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0x3b3366 }),
    );
    m.position.set(-2.4 + i * 1.2, 0.5, 3);
    root.add(m);
    dots.push(m);
  }
  const rings: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(2 + i * 0.7, 0.05, 8, 48), glow(0xffffff, 0.35));
    r.position.copy(ball.position);
    r.rotation.x = Math.PI / 2 + i * 0.4;
    root.add(r);
    rings.push(r);
  }
  let t = 0;
  let lastPhase = '';
  let lastPoints = 0;
  return {
    update(s, dt) {
      t += dt;
      const col =
        s.phase === 'go'
          ? 0x2cff7a
          : s.phase === 'lock'
            ? 0x8a8a98
            : s.phase === 'result'
              ? 0xffd23f
              : 0xff2d55;
      ballMat.color.setHex(col);
      (halo.material as THREE.MeshBasicMaterial).color.setHex(col);
      const pulse = s.phase === 'wait' ? 1 + Math.sin(t * 6) * 0.04 : s.phase === 'go' ? 1.18 : 1;
      ball.scale.setScalar(pulse);
      halo.scale.setScalar(pulse * (1 + Math.sin(t * 3) * 0.05));
      rings.forEach((r, i) => (r.rotation.z += dt * (0.6 + i * 0.4)));
      dots.forEach((d, i) => {
        const p = s.points[i];
        (d.material as THREE.MeshBasicMaterial).color.setHex(
          p === undefined ? 0x3b3366 : p > 700 ? 0x2cff7a : p > 0 ? 0xffd23f : 0xff2d55,
        );
      });
      camera.position.x = Math.sin(t * 0.5) * 0.4;
      camera.lookAt(0, 3, 0);
      if (s.phase !== lastPhase) {
        if (s.phase === 'go') ctx.sfx('beep');
        if (s.phase === 'lock') ctx.sfx('bad');
        lastPhase = s.phase;
      }
      if (s.total !== lastPoints) {
        if (s.total - lastPoints > 700) ctx.burst(ball.position.clone(), 0x2cff7a, 22);
        if (s.total > lastPoints) ctx.sfx('good');
        lastPoints = s.total;
      }
    },
    dispose() {
      /* Alles hängt an root und wird vom Stage freigegeben */
    },
  };
};
