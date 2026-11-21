/* Der Flitzer: Fluggerät zum Fahren und Fliegen, in den Welten und über Rainbow City.
   Mit 18+ ein riesiger Glitzer-Dildo, sonst eine Regenbogen-Rakete. */
import { Mesh, Node3, type Scene, type PBRMaterial } from '../engine/bjs';
import { box, cyl, sphere, torus, pbr, glow } from '../engine/geo';

const RAINBOW = [0xff3b3b, 0xff8a3b, 0xffd23b, 0x3ee69a, 0x3a7bff, 0xb56bff];

/** baut den Flitzer neu in root (alte Teile werden entfernt); die Flamme am Heck heißt „flame“ */
export function buildFlitzer(sc: Scene, root: Node3, adult: boolean) {
  root.getChildMeshes().forEach((m) => m.dispose());
  root.metadata = { adult };
  const P = (m: Mesh, mt: PBRMaterial, x: number, y: number, z: number) => { m.material = mt; m.position.set(x, y, z); m.parent = root; m.isPickable = false; return m; };
  if (adult) {
    const skin = pbr(sc, 0xff4fa3, .25, .1, { emissive: 0xff2f8a, ei: .25 }), glit = glow(sc, 0xfff0fa, 1.3);
    const shaft = P(cyl(sc, .42, .46, 3.4, 20), skin, 0, 0, .2); shaft.rotation.x = Math.PI / 2;
    const tip = P(sphere(sc, .52, 14), skin, 0, 0, 2.05); tip.scaling.set(1, 1, 1.25);
    const rim = P(torus(sc, .44, .09, 20), skin, 0, 0, 1.62); rim.rotation.x = Math.PI / 2;
    for (const sx of [-1, 1]) P(sphere(sc, .52, 12), skin, sx * .42, -.12, -1.55);
    for (let i = 0; i < 14; i++) { const a = i * 2.4, z = -1.2 + (i / 14) * 3; P(sphere(sc, .05, 6), glit, Math.sin(a) * .45, Math.cos(a) * .45, z); }
  } else {
    const body = pbr(sc, 0xffffff, .3, .2), tipM = pbr(sc, 0xff4fa3, .3);
    const shaft = P(cyl(sc, .42, .42, 3, 20), body, 0, 0, 0); shaft.rotation.x = Math.PI / 2;
    const tip = P(cyl(sc, 0, .42, 1.1, 20), tipM, 0, 0, 2.05); tip.rotation.x = Math.PI / 2;
    RAINBOW.forEach((c, i) => { const r = P(torus(sc, .43, .05, 20), pbr(sc, c, .4), 0, 0, -1.1 + i * .42); r.rotation.x = Math.PI / 2; });
    for (const a of [0, 2.1, 4.2]) { const f = P(box(sc, .08, .7, .9), tipM, Math.sin(a) * .55, Math.cos(a) * .55, -1.3); f.rotation.z = -a; }
  }
  // Flamme aus Regenbogenfunken am Heck
  const fl = P(cyl(sc, .3, 0, 1.2, 12), glow(sc, 0xffd23b, 1.4, { alpha: .8 }), 0, 0, adult ? -2.5 : -2.1); fl.rotation.x = Math.PI / 2; fl.name = 'flame';
}
