/* Weitere Fahrzeuge als echte Modelle (Sketchfab, CC BY 4.0, scripts/rides.mjs, Credits in public/CREDITS.md):
   E-Roller „Einhorn“ (du stehst sichtbar drauf), Pride-Bus (Stadtbus als CSD-Shuttle) und Sportboot „Glitzer“ (Riva,
   fährt nur auf dem Wasser, zwischen Kai und Inseln). Steuerung wie die Autos (CityScene.moveCar).
   Drehende Teile heißen „spin“ (direkt unter der Wurzel) und tragen ihren Radius in metadata.r. Die Modelle laden
   im Hintergrund; buildRide bleibt synchron. */
import { Node3, Vector3, type Scene, type TransformNode } from '../engine/bjs';
import { instance } from '../engine/Assets';
import { glow, planeZ, canvasTex, pbr } from '../engine/geo';

export type RideKind = 'scooter' | 'bus' | 'boat';
const RAINBOW = ['#e40303', '#ff8c00', '#ffed00', '#008026', '#004dff', '#750787'];
/** Datei, Maßstab (Modell → Spiel) und Höhe im Wasser bzw. auf der Straße */
const FILE: Record<RideKind, { f: string; k: number; y: number }> = {
  scooter: { f: 'escooter', k: 1, y: 0 },
  bus: { f: 'bus', k: 10.5 / 12, y: 0 },
  boat: { f: 'boat', k: 6.4 / 8.2, y: -.42 },
};

/** Räder des Modells unter eigene „spin“-Knoten direkt unter root hängen (Lage bleibt gleich) */
export function wheelsToSpin(sc: Scene, root: TransformNode, inner: TransformNode) {
  root.computeWorldMatrix(true); inner.getChildTransformNodes(false).forEach((n) => n.computeWorldMatrix(true));
  const inv = root.getWorldMatrix().clone().invert();
  for (const m of inner.getChildMeshes(false)) {
    if (!/^wheel_/.test(m.name)) continue;
    m.computeWorldMatrix(true);
    const b = m.getBoundingInfo().boundingBox, r = (b.extendSizeWorld.y || .4);
    const n = new Node3('spin', sc); n.parent = root; n.position.copyFrom(Vector3.TransformCoordinates(m.getAbsolutePosition(), inv)); n.metadata = { r };
    m.setParent(n);
  }
}

export function buildRide(sc: Scene, root: Node3, kind: RideKind) {
  root.getChildMeshes().forEach((m) => m.dispose());
  root.getChildTransformNodes(true).forEach((n) => n.dispose());
  const want = (root.metadata = { ...(root.metadata || {}), ride: kind, gen: ((root.metadata?.gen as number) || 0) + 1 }).gen;
  const fm = FILE[kind];
  void instance(sc, 'rides/' + fm.f + '.glb', { clone: true }).then((inner) => {
    if (root.isDisposed() || root.metadata?.gen !== want) { inner.dispose(); return; }
    inner.parent = root; inner.scaling.setAll(fm.k); inner.position.y = fm.y;
    inner.getChildMeshes().forEach((m) => { m.isPickable = false; });
    wheelsToSpin(sc, root, inner);
    if (kind === 'bus') busDeco(sc, root, fm.k);
    if (kind === 'boat') {
      // Regenbogenflagge am Heck
      const f = planeZ(sc, .55, .35, true); f.parent = root; f.position.set(0, 1.45, -3.05); f.rotation.y = Math.PI / 2; f.isPickable = false;
      f.material = pbr(sc, 0xffffff, .7, 0, { double: true }); (f.material as ReturnType<typeof pbr>).albedoTexture = canvasTex(sc, 64, 48, (g) => RAINBOW.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, i * 8, 64, 8); }));
    }
  });
}

/** CSD-Shuttle: leuchtende Zielanzeige vorne und ein Regenbogen-Band an beiden Seiten */
function busDeco(sc: Scene, root: Node3, k: number) {
  const L = 12 * k, H = 2.96 * k, W = 2.55 * k;
  const sign = canvasTex(sc, 256, 32, (g) => { g.fillStyle = '#111'; g.fillRect(0, 0, 256, 32); g.fillStyle = '#ffb000'; g.font = 'bold 22px monospace'; g.textAlign = 'center'; g.fillText('CSD-SHUTTLE 69', 128, 24); });
  const s = planeZ(sc, 1.7, .24); s.material = glow(sc, 0xffffff, 1.2, { tex: sign }); s.parent = root; s.position.set(0, H - .32, L / 2 + .02); s.rotation.y = Math.PI; s.isPickable = false;
  const band = canvasTex(sc, 8, 60, (g) => RAINBOW.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, i * 10, 8, 10); }));
  const bm = pbr(sc, 0xffffff, .45, .1, { double: true }); bm.albedoTexture = band;
  for (const sx of [-1, 1]) { const p = planeZ(sc, L * .62, .36, true); p.material = bm; p.parent = root; p.position.set(sx * (W / 2 + .015), .78, -L * .1); p.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2; p.isPickable = false; }
}
