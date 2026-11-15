import * as THREE from 'three';
import type { SimState } from '@shared/sim/types';
import { RING_RADIUS } from '@shared/sim/types';

/**
 * Turboringe (Modi Überladung/Chaos): schwebende Doppelringe mit leuchtender Scheibe.
 * Wird beim ersten update() aus state.rings aufgebaut; leer in Modi ohne Ringe.
 */
export class RingsView {
  readonly group = new THREE.Group();
  private built = false;
  private items: Array<{ root: THREE.Group; outer: THREE.Mesh; inner: THREE.Mesh; disc: THREE.Mesh; was: boolean; pop: number }> = [];
  private readonly geos: THREE.BufferGeometry[] = [];
  private readonly mats: THREE.Material[] = [];
  private time = 0;

  private build(state: SimState): void {
    this.built = true;
    if (!state.rings.length) return;
    const r = RING_RADIUS * 0.82;
    const gOuter = new THREE.TorusGeometry(r, 0.16, 10, 48);
    const gInner = new THREE.TorusGeometry(r * 0.78, 0.07, 8, 40);
    const gDisc = new THREE.CircleGeometry(r * 0.76, 40);
    this.geos.push(gOuter, gInner, gDisc);
    for (const ring of state.rings) {
      const mOuter = new THREE.MeshBasicMaterial({ color: 0xffc23d, toneMapped: false, transparent: true });
      const mInner = new THREE.MeshBasicMaterial({ color: 0xfff1b0, toneMapped: false, transparent: true, opacity: 0.85 });
      const mDisc = new THREE.MeshBasicMaterial({
        color: 0xffc23d,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      this.mats.push(mOuter, mInner, mDisc);
      const root = new THREE.Group();
      root.position.set(ring.pos[0], ring.pos[1], ring.pos[2]);
      const outer = new THREE.Mesh(gOuter, mOuter);
      const inner = new THREE.Mesh(gInner, mInner);
      const disc = new THREE.Mesh(gDisc, mDisc);
      root.add(outer, inner, disc);
      this.group.add(root);
      this.items.push({ root, outer, inner, disc, was: true, pop: 0 });
    }
  }

  update(dt: number, state: SimState): void {
    if (!this.built) this.build(state);
    this.time += dt;
    const t = this.time;
    this.items.forEach((it, i) => {
      const ring = state.rings[i];
      if (!ring) return;
      const on = ring.timer <= 0;
      if (on && !it.was) it.pop = 1;
      it.was = on;
      it.pop = Math.max(0, it.pop - dt * 2.5);
      // Ringe drehen sich langsam zur Mitte hin, Innenring gegenläufig
      it.root.rotation.y = t * 0.6 + i * 1.3;
      it.inner.rotation.z = -t * 1.8;
      it.outer.rotation.z = t * 0.7;
      it.root.position.y = ring.pos[1] + Math.sin(t * 1.6 + i) * 0.25;
      const s = on ? 1 + it.pop * 0.5 + Math.sin(t * 4 + i) * 0.03 : 0.55;
      it.root.scale.setScalar(s);
      const mo = it.outer.material as THREE.MeshBasicMaterial;
      mo.color.setHex(on ? 0xffc23d : 0x8a7cc0);
      mo.opacity = on ? 1 : 0.16;
      mo.depthWrite = on;
      (it.inner.material as THREE.MeshBasicMaterial).opacity = on ? 0.85 : 0.08;
      (it.disc.material as THREE.MeshBasicMaterial).opacity = on ? 0.1 + Math.sin(t * 3 + i) * 0.05 + it.pop * 0.4 : 0;
    });
  }

  dispose(): void {
    this.geos.forEach((g) => g.dispose());
    this.mats.forEach((m) => m.dispose());
  }
}
