/* Nackter Oberkörper mit echter Körperform: Die Rocketbox-Figuren tragen ihre Kleidung als Geometrie (Kragen, Sakko,
   Hemdzipfel, weite Hosen). Nur umgemalt sah das wie hautfarbene Kleidung aus. Für Oberkörperfrei, Harness, Unterwäsche
   und Badesachen bekommt die Figur deshalb den eng anliegenden Körper der Sport-Figur (gleiches Skelett „Bip01 …“),
   behält aber Kopf, Haare und Hautfarbe. Jedes Bild übernimmt der Körper Stellung und Knochenlängen der Figur:
   so sitzt der Hals genau unter dem eigenen Kopf und alle Animationen bleiben gleich. */
import { Quaternion, Color3, Vector3, type Mesh, type Scene, type TransformNode, type AbstractMesh, type PBRMaterial } from '../engine/bjs';
import { skinned } from '../engine/Assets';

export const BARE_OUTFITS = new Set(['shirtless', 'harness', 'underwear', 'swim', 'nude']);
/** Nackter Körper je Figur: realistische MakeHuman-Körper (CC0, scripts/mh-body.mjs) in je vier Formen.
    1 schlank, 2 normal, 3 sportlich, 4 kräftig (Frauen: 3 kurvig, 4 sportlich). Hauptfiguren fest, sonst aus der ID. */
const BODY: Record<string, number> = { pc_rico: 3, pc_c12: 3, pc_yakuza: 3, pc_gangster: 2, pc_streetg: 1 };
export const bareId = (g: 'm' | 'f', id = '') => {
  let h = 2166136261; for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  return 'mh_' + g + (BODY[id] || 1 + ((h >>> 0) % 4));
};

export interface Bare { root: TransformNode; meshes: Mesh[]; /** Faktor je Farbkanal (eigene Haut / Sport-Haut) */ tint(ratio: number[]): void; dispose(): void }
const isBody = (m: AbstractMesh) => !!(m as Mesh).skeleton && /_body/.test((((m.material as { _orig?: { name: string } } | null)?._orig) || m.material)?.name || '');

/** Körper anlegen: hängt unter model, folgt den Knochen (Name → Knoten) der Figur */
export async function bareBody(scene: Scene, model: TransformNode, bones: Map<string, TransformNode>, g: 'm' | 'f', id = ''): Promise<Bare | null> {
  const { root, groups } = await skinned(scene, 'rb/' + bareId(g, id) + '.glb');
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
  // MakeHuman-Körper: Halsrand unter den eigenen Kopf der Figur rücken (die Köpfe sitzen je Modell etwas anders am Gelenk)
  const head = model.getChildMeshes().find((x) => (x as Mesh).skeleton && !x.isDescendantOf(root) && /_head$/.test((((x.material as { _orig?: { name: string } } | null)?._orig) || x.material)?.name || '')) as Mesh | undefined;
  if (head && /^mh_/.test(bareId(g, id))) meshes.forEach((m) => fitNeck(m, head));
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
  const tint = (rgb: number[]) => {   // rgb = Faktor
    if (!neck) return;
    // echte Haut-Textur behalten, nur umfärben (Faktor eigene Haut / Sport-Haut, linear)
    if (!neckMat) { neckMat = (neck.material as PBRMaterial).clone((neck.material?.name || 'hals') + '_haut'); neck.material = neckMat; }
    const f = (v: number) => Math.pow(Math.max(.35, Math.min(2.4, v)), 2.2);
    neckMat.albedoColor = new Color3(f(rgb[0]), f(rgb[1]), f(rgb[2]));
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

const boneOf = (m: Mesh) => { const names: string[] = []; m.skeleton?.bones.forEach((b) => { names[b.getIndex()] = b.name; }); return names; };
/** Kopf-Gelenk in Ruhelage (Mesh-Raum) */
function headJoint(m: Mesh) {
  const b = m.skeleton?.bones.find((x) => /Head$/.test(x.name)); if (!b) return null;
  const t = b.getAbsoluteInverseBindMatrix().clone().invert().getTranslation();
  return t;
}
/** Halsrand des MakeHuman-Körpers unter den Kopf der Figur schieben: Mitte des oberen Halsrands (Körper) auf die Mitte
    des unteren Kopfrands (Figur, ohne eingeklappten Kragen), beides relativ zum Kopf-Gelenk. Bewegt wird nach Kopf-Gewicht. */
function fitNeck(body: Mesh, head: Mesh) {
  const hp = head.getVerticesData('position'), hi = head.getVerticesData('matricesIndices'), hw = head.getVerticesData('matricesWeights');
  const bp = body.getVerticesData('position'), bi = body.getVerticesData('matricesIndices'), bw = body.getVerticesData('matricesWeights');
  const hj = headJoint(head), bj = headJoint(body); if (!hp || !hi || !hw || !bp || !bi || !bw || !hj || !bj) return;
  const hn = boneOf(head), bn = boneOf(body);
  const dom = (mi: ArrayLike<number>, mw: ArrayLike<number>, names: string[], v: number) => { let best = 0, x = -1; for (let k = 0; k < 4; k++) if (mw[v * 4 + k] > x) { x = mw[v * 4 + k]; best = mi[v * 4 + k]; } return names[best] || ''; };
  // Kopf der Figur: was nach Actor.collar sichtbar bleibt (nicht Rumpf, nicht weit unter dem Kinn)
  let chin = 1e9; const nh = hp.length / 3; for (let v = 0; v < nh; v++) if (/Head/.test(dom(hi, hw, hn, v))) chin = Math.min(chin, hp[v * 3 + 1]);
  const keep: number[] = []; for (let v = 0; v < nh; v++) if (!/Spine|Clavicle|UpperArm|Pelvis/.test(dom(hi, hw, hn, v)) && hp[v * 3 + 1] >= chin - .12) keep.push(v);
  if (keep.length < 20) return;
  const ring = (P: ArrayLike<number>, vs: number[], top: boolean) => {
    let e = top ? -1e9 : 1e9; for (const v of vs) e = top ? Math.max(e, P[v * 3 + 1]) : Math.min(e, P[v * 3 + 1]);
    const c = new Vector3(); let n = 0;
    for (const v of vs) if (Math.abs(P[v * 3 + 1] - e) < .02) { c.x += P[v * 3]; c.y += P[v * 3 + 1]; c.z += P[v * 3 + 2]; n++; }
    return n ? c.scaleInPlace(1 / n) : null;
  };
  const nb = bp.length / 3, all: number[] = []; for (let v = 0; v < nb; v++) all.push(v);
  const want = ring(hp, keep, false), have = ring(bp, all, true); if (!want || !have) return;
  const d = want.subtract(hj).subtract(have.subtract(bj));
  // Feinkorrektur: seitlich und nach vorne/hinten bis 3 cm, nach oben bis 4 cm (Lücke schließen), nie nach unten
  d.y = Math.max(0, Math.min(.04, d.y)); d.x = Math.max(-.03, Math.min(.03, d.x)); d.z = Math.max(-.03, Math.min(.03, d.z));
  if (d.lengthSquared() < 1e-6) return;
  const out = Float32Array.from(bp);
  for (let v = 0; v < nb; v++) {
    let w = 0; for (let k = 0; k < 4; k++) if (/Head$/.test(bn[bi[v * 4 + k]] || '')) w += bw[v * 4 + k];
    if (w <= 0) continue;
    out[v * 3] += d.x * w; out[v * 3 + 1] += d.y * w; out[v * 3 + 2] += d.z * w;
  }
  body.makeGeometryUnique();
  body.setVerticesData('position', out, false);
  body.refreshBoundingInfo();
}
