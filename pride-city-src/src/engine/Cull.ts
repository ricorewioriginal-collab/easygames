/* Vorauswahl für Babylons Sichtbarkeitsprüfung. Babylon geht in jedem Bild zweimal über ALLE Meshes der Szene
   (Rainbow City mit Inseln: über 4.000), auch über Häuser hinter der Kamera. Hier wird die Liste nur ab und zu neu
   gebaut: feste Teile (eingefrorene Weltmatrix) nur, wenn sie grob in Blickrichtung liegen, bewegliche Teile immer.
   Der grobe Kegel ist deutlich weiter als das Bild (+6 m und rund 25° Zugabe), und die Liste wird sofort neu gebaut,
   sobald sich die Kamera merklich dreht oder bewegt. Die genaue Prüfung macht Babylon danach wie immer:
   Aussehen und Inhalt bleiben gleich, nur die Arbeit für Unsichtbares fällt weg. */
import { Vector3, type Scene, type AbstractMesh } from './bjs';
import type { Camera } from '@babylonjs/core/Cameras/camera';

export function cullAhead(scene: Scene) {
  const out = { data: [] as AbstractMesh[], length: 0 };
  const pos = new Vector3(), fwd = new Vector3(), dir = new Vector3(), axis = new Vector3(0, 0, scene.useRightHandedSystem ? -1 : 1);
  let frame = -99, count = -1, cam: Camera | null = null, fov = 0;
  const rebuild = (c: Camera) => {
    const planes = scene.frustumPlanes, all = scene.meshes, list = out.data;
    list.length = 0;
    for (let i = 0; i < all.length; i++) {
      const m = all[i];
      if (!m.isWorldMatrixFrozen || m.alwaysSelectAsActiveMesh || !planes || planes.length < 6) { list.push(m); continue; }
      const b = m.getBoundingInfo().boundingSphere, w = b.centerWorld;
      const r = b.radiusWorld + 6 + Vector3.Distance(w, pos) * .47;
      let inside = true;
      for (let k = 0; k < 6; k++) if (planes[k].dotCoordinate(w) <= -r) { inside = false; break; }
      if (inside) list.push(m);
    }
    out.length = list.length;
    frame = scene.getFrameId(); count = all.length; cam = c; fov = c.fov;
  };
  // neue oder weggeräumte Meshes: Liste sofort neu bauen (nie ein entsorgtes Mesh prüfen, nie ein neues verpassen)
  scene.onNewMeshAddedObservable.add(() => { frame = -99; });
  scene.onMeshRemovedObservable.add(() => { frame = -99; });
  scene.getActiveMeshCandidates = () => {
    const c = scene.activeCamera;
    if (!c) { out.data = scene.meshes; out.length = scene.meshes.length; count = -1; return out; }
    if (out.data === scene.meshes) out.data = [];
    c.getDirectionToRef(axis, dir);
    const p = c.globalPosition;
    if (c !== cam || scene.meshes.length !== count || scene.getFrameId() - frame >= 10 || c.fov !== fov ||
        Vector3.DistanceSquared(p, pos) > 16 || Vector3.Dot(dir, fwd) < .978) {
      pos.copyFrom(p); fwd.copyFrom(dir);
      rebuild(c);
    }
    return out;
  };
}
