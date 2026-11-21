/* Nackter Oberkörper mit echter Körperform: Die Rocketbox-Figuren tragen ihre Kleidung als Geometrie (Kragen, Sakko,
   Hemdzipfel, weite Hosen). Nur umgemalt sah das wie hautfarbene Kleidung aus. Für Oberkörperfrei, Harness, Unterwäsche
   und Badesachen bekommt die Figur deshalb den eng anliegenden Körper der Sport-Figur (gleiches Skelett „Bip01 …“),
   behält aber Kopf, Haare und Hautfarbe. Jedes Bild übernimmt der Körper Stellung und Knochenlängen der Figur:
   so sitzt der Hals genau unter dem eigenen Kopf und alle Animationen bleiben gleich. */
import { Quaternion, Color3, type Mesh, type Scene, type TransformNode, type AbstractMesh, type PBRMaterial } from '../engine/bjs';
import { skinned } from '../engine/Assets';

export const BARE_OUTFITS = new Set(['shirtless', 'harness', 'underwear', 'swim']);
export const bareId = (g: 'm' | 'f') => (g === 'f' ? 'Sports_Female_01' : 'Sports_Male_01');

export interface Bare { root: TransformNode; meshes: Mesh[]; tint(rgb: number[]): void; dispose(): void }
const isBody = (m: AbstractMesh) => !!(m as Mesh).skeleton && /_body/.test((((m.material as { _orig?: { name: string } } | null)?._orig) || m.material)?.name || '');

/** Körper anlegen: hängt unter model, folgt den Knochen (Name → Knoten) der Figur */
export async function bareBody(scene: Scene, model: TransformNode, bones: Map<string, TransformNode>, g: 'm' | 'f'): Promise<Bare | null> {
  const { root, groups } = await skinned(scene, 'rb/' + bareId(g) + '.glb');
  groups.forEach((x) => x.dispose());
  if (model.isDisposed()) { root.dispose(); return null; }
  // nur den Körper behalten. Der Kopf der Sport-Figur reicht bis auf die Brust (der Körper hat dort ein Loch):
  // sein Hals- und Brustteil bleibt in Hautfarbe, Gesicht und Haare schrumpfen unsichtbar in den eigenen Kopf.
  let neck: Mesh | null = null;
  for (const m of root.getChildMeshes()) {
    if (!(m as Mesh).skeleton || isBody(m)) continue;
    if (!neck && /_head/.test(m.material?.name || '') && shrinkHead(m as Mesh)) { neck = m as Mesh; continue; }
    m.dispose();
  }
  const meshes = root.getChildMeshes().filter(isBody) as Mesh[];
  if (!meshes.length) { root.dispose(); return null; }
  root.parent = model;
  meshes.forEach((m) => { m.receiveShadows = true; (m as AbstractMesh & { _pcCast?: boolean })._pcCast = true; m.isPickable = false; });
  // Knotenpaare (eigene Figur → Sport-Körper), oberste Knoten mit gleichem Namen (glTF-Wurzel) mitnehmen
  const pairs: Array<[TransformNode, TransformNode]> = [];
  for (const n of root.getChildTransformNodes(false)) {
    const src = bones.get(n.name.replace(/^Bip0\d/, 'Bip01')); if (src && src !== n) pairs.push([src, n]);
  }
  const sync = () => {
    for (const [s, d] of pairs) {
      d.position.copyFrom(s.position); d.scaling.copyFrom(s.scaling);
      if (s.rotationQuaternion) { if (!d.rotationQuaternion) d.rotationQuaternion = new Quaternion(); d.rotationQuaternion.copyFrom(s.rotationQuaternion); }
      else { d.rotationQuaternion = null; d.rotation.copyFrom(s.rotation); }
    }
  };
  sync();
  // nach den Animationen und Posen (liebe.ts arbeitet ebenfalls nach den Animationen: dort wird zuerst registriert)
  const obs = scene.onBeforeRenderObservable.add(() => { if (root.isEnabled()) sync(); });
  root.onDisposeObservable.addOnce(() => scene.onBeforeRenderObservable.remove(obs));
  let neckMat: PBRMaterial | null = null;
  const tint = (rgb: number[]) => {
    if (!neck) return;
    if (!neckMat) { neckMat = (neck.material as PBRMaterial).clone((neck.material?.name || 'hals') + '_haut'); neckMat.albedoTexture = null; neck.material = neckMat; }
    neckMat.albedoColor = Color3.FromInts(Math.round(rgb[0]), Math.round(rgb[1]), Math.round(rgb[2])).toLinearSpace();
  };
  root.onDisposeObservable.addOnce(() => neckMat?.dispose());
  return { root, meshes, tint, dispose: () => root.dispose() };
}

/** Kopf-Mesh der Sport-Figur: alles, was am Kopf (Gesicht, Haare, Kiefer, Augen) hängt, auf einen Punkt im Kopf ziehen */
function shrinkHead(m: Mesh) {
  const pos = m.getVerticesData('position'), mi = m.getVerticesData('matricesIndices'), mw = m.getVerticesData('matricesWeights'), sk = m.skeleton;
  if (!pos || !mi || !mw || !sk) return false;
  const names: string[] = []; sk.bones.forEach((b) => { names[b.getIndex()] = b.name; });
  const nv = pos.length / 3, head: number[] = [];
  for (let v = 0; v < nv; v++) {
    let best = 0, bw = -1; for (let k = 0; k < 4; k++) if (mw[v * 4 + k] > bw) { bw = mw[v * 4 + k]; best = mi[v * 4 + k]; }
    if (!/Neck|Spine|Clavicle|UpperArm|Pelvis/.test(names[best] || '')) head.push(v);
  }
  if (!head.length || head.length === nv) return false;
  let cx = 0, cy = 0, cz = 0; for (const v of head) { cx += pos[v * 3]; cy += pos[v * 3 + 1]; cz += pos[v * 3 + 2]; }
  cx /= head.length; cy /= head.length; cz /= head.length;
  const out = Float32Array.from(pos);
  for (const v of head) { out[v * 3] = cx; out[v * 3 + 1] = cy; out[v * 3 + 2] = cz; }
  m.makeGeometryUnique();   // die Sport-Figur selbst (Rex) behält ihr Gesicht
  m.setVerticesData('position', out, false);
  m.refreshBoundingInfo();
  m.isPickable = false; m.receiveShadows = true;
  return true;
}
