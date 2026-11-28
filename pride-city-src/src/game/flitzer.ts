/* Der Flitzer: Fluggerät zum Fahren und Fliegen, in den Welten und über Rainbow City.
   Mit 18+ ein riesiger Glitzer-Dildo, sonst das Hoverbike „The Rocket“. */
import { Mesh, Node3, type Scene, type PBRMaterial } from '../engine/bjs';
import { cyl, sphere, torus, pbr, glow } from '../engine/geo';
import { instance } from '../engine/Assets';


/** baut den Flitzer neu in root (alte Teile werden entfernt); die Flamme am Heck heißt „flame“ */
export function buildFlitzer(sc: Scene, root: Node3, adult: boolean) {
  root.getChildMeshes().forEach((m) => m.dispose());
  root.getChildTransformNodes(true).forEach((n) => n.dispose());
  root.metadata = { adult, gen: root.metadata?.gen };
  const P = (m: Mesh, mt: PBRMaterial, x: number, y: number, z: number) => { m.material = mt; m.position.set(x, y, z); m.parent = root; m.isPickable = false; return m; };
  if (adult) {
    const skin = pbr(sc, 0xff4fa3, .25, .1, { emissive: 0xff2f8a, ei: .25 }), glit = glow(sc, 0xfff0fa, 1.3);
    const shaft = P(cyl(sc, .42, .46, 3.4, 20), skin, 0, 0, .2); shaft.rotation.x = Math.PI / 2;
    const tip = P(sphere(sc, .52, 14), skin, 0, 0, 2.05); tip.scaling.set(1, 1, 1.25);
    const rim = P(torus(sc, .44, .09, 20), skin, 0, 0, 1.62); rim.rotation.x = Math.PI / 2;
    for (const sx of [-1, 1]) P(sphere(sc, .52, 12), skin, sx * .42, -.12, -1.55);
    for (let i = 0; i < 14; i++) { const a = i * 2.4, z = -1.2 + (i / 14) * 3; P(sphere(sc, .05, 6), glit, Math.sin(a) * .45, Math.cos(a) * .45, z); }
  } else {
    // Hoverbike „The Rocket“ (Sketchfab, TuppsM, CC BY 4.0, scripts/rides.mjs); lädt im Hintergrund
    const gen = (root.metadata.gen = ((root.metadata.gen as number) || 0) + 1);
    void instance(sc, 'rides/hoverbike.glb', { clone: true }).then((inner) => {
      if (root.isDisposed() || root.metadata?.adult || root.metadata?.gen !== gen) { inner.dispose(); return; }
      inner.parent = root; inner.position.y = -.62; inner.getChildMeshes().forEach((m) => { m.isPickable = false; });
    });
  }
  // Flamme aus Regenbogenfunken am Heck
  const fl = P(cyl(sc, .3, 0, 1.2, 12), glow(sc, 0xffd23b, 1.4, { alpha: .8 }), 0, adult ? 0 : -.1, adult ? -2.5 : -2.0); fl.rotation.x = Math.PI / 2; fl.name = 'flame'; fl.setEnabled(false);
}
