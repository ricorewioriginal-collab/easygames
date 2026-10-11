import * as THREE from 'three';
import { G, grp, mk, starGeo, type Env } from './kit';

export type HatId = 'krone' | 'zylinder' | 'propeller' | 'sternenband' | 'blumenkranz';
export const HAT_IDS: readonly HatId[] = ['krone', 'zylinder', 'propeller', 'sternenband', 'blumenkranz'];

export interface HatInstance {
  group: THREE.Group;
  /** Wird jedes Bild aufgerufen (Propeller drehen, Wackeln) */
  update(t: number, dt: number, j: number): void;
}

/** Hüte sind für einen Kopfdurchmesser von ca. 1 Einheit modelliert; die Unterkante liegt bei y = 0. */
export function buildHat(id: HatId, env: Env): HatInstance {
  const g = grp(null);
  let spin: THREE.Object3D | null = null;
  switch (id) {
    case 'krone': {
      const gold = env.m('#ffcf33');
      mk(g, G.cyl(0.36, 0.38, 0.16, 16), gold, 0, 0.08, 0);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        mk(g, G.cone(0.085, 0.24, 8), gold, Math.sin(a) * 0.33, 0.27, Math.cos(a) * 0.33);
      }
      const jewel = mk(g, G.sph(0.06, 10, 8), env.glow('#ff3860'), 0, 0.09, 0.38);
      jewel.scale.set(1, 1, 0.6);
      break;
    }
    case 'zylinder': {
      const black = env.m('#26263a');
      mk(g, G.cyl(0.52, 0.52, 0.05, 20), black, 0, 0.025, 0);
      mk(g, G.cyl(0.31, 0.33, 0.55, 18), black, 0, 0.32, 0);
      mk(g, G.cyl(0.335, 0.335, 0.11, 18), env.m('#d62839'), 0, 0.12, 0);
      break;
    }
    case 'propeller': {
      mk(g, G.sph(0.34, 16, 8), env.m('#2ec4b6'), 0, 0.0, 0, 1, 0.62, 1);
      mk(g, G.cyl(0.02, 0.02, 0.14, 6), env.m('#f1f1f1'), 0, 0.24, 0);
      const rotor = grp(g, 0, 0.32, 0);
      mk(rotor, G.sph(0.045, 8, 6), env.m('#ffd166'), 0, 0, 0);
      mk(rotor, G.box(0.62, 0.02, 0.11), env.m('#ef476f'), 0, 0, 0);
      const bl2 = mk(rotor, G.box(0.62, 0.02, 0.11), env.m('#ffd166'), 0, 0.001, 0);
      bl2.rotation.y = Math.PI / 2;
      spin = rotor;
      break;
    }
    case 'sternenband': {
      const band = mk(g, G.tor(0.38, 0.045, 8, 28), env.m('#3a2f6b'), 0, 0.05, 0);
      band.rotation.x = Math.PI / 2;
      const gold = env.glow('#ffe066');
      const s1 = mk(g, starGeo(), gold, 0, 0.16, 0.38, 0.34);
      s1.rotation.x = -0.15;
      for (const s of [1, -1]) {
        const s2 = mk(g, starGeo(), gold, s * 0.34, 0.15, 0.16, 0.2);
        s2.rotation.y = s * 1.1;
      }
      break;
    }
    case 'blumenkranz': {
      const ring = mk(g, G.tor(0.37, 0.04, 8, 26), env.m('#4caf50'), 0, 0.04, 0);
      ring.rotation.x = Math.PI / 2;
      const cols = ['#ff70a6', '#ffd670', '#ffffff', '#70d6ff', '#ff9770', '#e9ff70'];
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        mk(g, G.sph(0.09, 10, 8), env.m(cols[i]), Math.sin(a) * 0.37, 0.07, Math.cos(a) * 0.37, 1, 0.85, 1);
      }
      break;
    }
  }
  const rotor = spin;
  return {
    group: g,
    update(t, dt, j) {
      if (rotor) rotor.rotation.y += dt * 22;
      g.rotation.z = j * 0.12 + Math.sin(t * 2.1) * 0.015;
    },
  };
}
