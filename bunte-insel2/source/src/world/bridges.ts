/* Brücken zwischen den Inseln: immer geladen (leicht), begehbar und befahrbar, mit Laternen und Wegweisern. */
import { GeoBuilder } from '../engine/geo.ts';
import { mats } from '../engine/materials.ts';
import { labelSprite } from '../engine/textures.ts';
import type { Physics } from './physics.ts';
import { BRIDGES, bridgeEnds } from './layout.ts';
import { bridgeGeo } from './props.ts';

const STYLE = {
  holz: { deck: 0xb07a45, rail: 0x8a5a33 },
  stein: { deck: 0xd9d2c3, rail: 0xb7a89a },
  licht: { deck: 0xe6dcff, rail: 0x9f8fff },
  seil: { deck: 0xc9a26b, rail: 0x7a5a3a }
};

export function buildBridges(scene: THREE.Scene, physics: Physics, height: (x: number, z: number) => number, names: Record<string, { name: string; icon: string }>): THREE.Group {
  const g = new THREE.Group(); g.name = 'bridges';
  const b = new GeoBuilder(), glow = new GeoBuilder();
  for (const br of BRIDGES) {
    if (!names[br.from] || !names[br.to]) continue;
    const e = bridgeEnds(br), st = STYLE[br.style ?? 'holz'], w = br.w ?? 7;
    const ay = height(e.ax, e.az) + 0.08, by = height(e.bx, e.bz) + 0.08;
    const { segs } = bridgeGeo(b, e.ax, e.az, ay, e.bx, e.bz, by, w, st.deck, st.rail);
    for (const s of segs) {
      physics.ramp('bridges', s.x, s.z, w, s.len, s.y0, s.y1, s.rot);
      // Geländer als Wand
      for (const side of [-1, 1]) {
        const px = s.x + Math.cos(s.rot) * side * (w / 2), pz = s.z - Math.sin(s.rot) * side * (w / 2);
        physics.box('bridges', px, pz, 0.25, s.len, Math.min(s.y0, s.y1) - 2, Math.max(s.y0, s.y1) + 1.0, s.rot, { noWalk: true });
      }
    }
    // Laternen
    const L = Math.hypot(e.bx - e.ax, e.bz - e.az), rot = Math.atan2(e.bx - e.ax, e.bz - e.az);
    const n = Math.max(2, Math.floor(L / 24));
    for (let i = 1; i < n; i++) {
      const t = i / n, x = e.ax + (e.bx - e.ax) * t, z = e.az + (e.bz - e.az) * t, y = ay + (by - ay) * t + Math.sin(t * Math.PI) * Math.min(4, L * 0.03);
      const side = i % 2 ? 1 : -1;
      const px = x + Math.cos(rot) * side * (w / 2 - 0.1), pz = z - Math.sin(rot) * side * (w / 2 - 0.1);
      b.cyl(px, y, pz, 0.07, 0.09, 2.4, 0x3a4250, 6);
      glow.sph(px, y + 2.55, pz, 0.2, br.style === 'licht' ? 0xd6c8ff : 0xfff2b0);
    }
    // Wegweiser an beiden Enden
    for (const [x, z, dest, back] of [[e.ax, e.az, br.to, rot], [e.bx, e.bz, br.from, rot + Math.PI]] as const) {
      const info = names[dest];
      if (!info) continue;
      const s = labelSprite(info.name, 0.9, { icon: info.icon, sub: '→ ' + Math.round(L) + ' m' });
      const ox = x + Math.sin(back) * 3, oz = z + Math.cos(back) * 3;
      s.position.set(ox + Math.cos(back) * (w / 2 + 1.2), height(x, z) + 3.4, oz - Math.sin(back) * (w / 2 + 1.2));
      g.add(s);
      b.cyl(s.position.x, height(x, z), s.position.z, 0.1, 0.12, 2.8, 0x8a5a33, 6);
    }
  }
  const m = b.mesh(mats().vc, true); g.add(m);
  const gm = glow.mesh(mats().vcGlow, false); gm.receiveShadow = false; g.add(gm);
  scene.add(g);
  return g;
}
