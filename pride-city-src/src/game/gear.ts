/* Zubehör für Szene-Figuren (szene.ts): Pup-Maske mit Ohren und Schnauze, Ledermütze, Halsband mit Ring, Krone.
   Einfache Formen, an Kopf- bzw. Halsknochen gehängt (bewegen sich mit), Materialien je Szene geteilt. */
import { Vector3, type Mesh, type Scene, type TransformNode, type PBRMaterial } from '../engine/bjs';
import { box, cyl, sphere, torus, pbr } from '../engine/geo';
import type { Actor } from './Actor';
import type { Gear } from './szene';

const mats = new WeakMap<Scene, Map<string, PBRMaterial>>();
function mat(sc: Scene, k: string, c: number, r: number, m = 0, emissive?: number) {
  let all = mats.get(sc); if (!all) mats.set(sc, (all = new Map()));
  let x = all.get(k);
  if (!x || !sc.materials.includes(x)) { x = pbr(sc, c, r, m, emissive ? { emissive, ei: .6 } : {}); x.freeze(); all.set(k, x); }
  return x;
}
/** Neonfarbe je Figur (Maske, Halsband-Ring) */
const NEON = [0x3ee69a, 0xff4fa3, 0x5ce1ff, 0xffd23b, 0xb56bff];

/** Zubehör anlegen; Maße in Metern um die Kopf- bzw. Halsposition in Grundstellung (Blick nach +z) */
export function wearGear(a: Actor, gear: Gear, seed = 0) {
  const sc = a.scene, head = a.bones.get('Bip01 Head'), neck = a.bones.get('Bip01 Neck');
  if (!head || !neck) return;
  const yaw = a.root.rotation.y, rq = a.root.rotationQuaternion;
  a.root.rotationQuaternion = null; a.root.rotation.y = 0;
  a.root.computeWorldMatrix(true);
  for (let n: TransformNode | null = head; n; n = n.parent as TransformNode | null) n.computeWorldMatrix(true);
  const H = head.getAbsolutePosition().clone(), N = neck.getAbsolutePosition().clone();
  const f = a.avatar.g === 'f' ? .93 : 1, neon = NEON[seed % NEON.length];
  const parts: Array<[Mesh, TransformNode]> = [];
  const put = (m: Mesh, at: Vector3, to: TransformNode, material: PBRMaterial) => { m.position.copyFrom(at); m.material = material; m.isPickable = false; m.receiveShadows = false; parts.push([m, to]); return m; };
  const at = (base: Vector3, x: number, y: number, z: number) => base.add(new Vector3(x * f, y * f, z * f));
  if (gear === 'pup') {
    const black = mat(sc, 'pupBlack', 0x111116, .35, .1), col = mat(sc, 'pup' + neon, neon, .4, 0, neon);
    const hood = put(sphere(sc, .128, 14), at(H, 0, .105, .012), head, black); hood.scaling.set(1, 1.08, 1.12);
    const snout = put(box(sc, .11, .075, .1), at(H, 0, .07, .135), head, black); snout.rotation.x = .12;
    put(box(sc, .045, .03, .02), at(H, 0, .09, .19), head, col);   // Nase
    for (const s of [-1, 1]) {
      const ear = put(box(sc, .055, .1, .02), at(H, s * .075, .235, -.01), head, black); ear.rotation.z = -s * .35; ear.rotation.x = -.2;
      const in2 = put(box(sc, .03, .065, .006), at(H, s * .075, .232, .003), head, col); in2.rotation.z = -s * .35; in2.rotation.x = -.2;
      const eye = put(box(sc, .04, .016, .01), at(H, s * .045, .13, .13), head, col); eye.rotation.y = s * .25;
    }
  }
  if (gear === 'cap') {
    const lea = mat(sc, 'capLeather', 0x16161c, .3, .15), chrome = mat(sc, 'capChrome', 0xd8d8e0, .15, 1);
    put(cyl(sc, .098, .104, .065, 18), at(H, 0, .19, .005), head, lea);
    const brim = put(box(sc, .16, .012, .07), at(H, 0, .16, .11), head, lea); brim.rotation.x = .18;
    put(box(sc, .15, .016, .012), at(H, 0, .172, .102), head, chrome);
  }
  if (gear === 'crown') {
    const gold = mat(sc, 'crownGold', 0xffc400, .2, 1, 0xff9a00);
    put(cyl(sc, .085, .075, .045, 8, false), at(H, 0, .235, 0), head, gold);
    for (let i = 0; i < 5; i++) { const t = (i - 2) * .5; const sp = put(box(sc, .02, .05, .01), at(H, Math.sin(t) * .08, .275, Math.cos(t) * .08), head, gold); sp.rotation.y = t; }
  }
  if (gear === 'collar' || gear === 'pup') {
    const lea = mat(sc, 'collarLeather', 0x1a1a20, .35, .1), ringM = mat(sc, 'collarRing', 0xd8d8e0, .15, 1);
    const c = put(torus(sc, .065 * f, .014, 20), at(N, 0, .045, .008), neck, lea); c.scaling.z = 1.1;
    const r = put(torus(sc, .018, .005, 12), at(N, 0, .02, .085), neck, gear === 'pup' ? mat(sc, 'pup' + neon, neon, .4, 0, neon) : ringM); r.rotation.x = Math.PI / 2;
  }
  for (const [m, to] of parts) { m.setParent(to); }
  if (rq) a.root.rotationQuaternion = rq; else a.root.rotation.y = yaw;
  a.root.computeWorldMatrix(true);
  return parts.length;
}
