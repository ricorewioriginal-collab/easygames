// Skater-Figuren: lädt die gemeinsamen easygames-Grundkörper (figuren/mann.glb, frau.glb – Quaternius, CC0),
// färbt Kleidung nach Knochen-Zonen ein und stellt die Figur jedes Bild per Zwei-Knochen-IK auf das Brett.
import { Vector3, Quaternion, Matrix, Color3 } from '@babylonjs/core/Maths/math';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { LoadAssetContainerAsync } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders/glTF/2.0';

const BASE = '../figuren/';
const cache = new WeakMap();   // je Szene eigene Container (Szenen werden beim Parkwechsel verworfen)
function loadBody(scene, body) {
  const f = body === 'f' ? 'frau' : 'mann';
  let c = cache.get(scene); if (!c) cache.set(scene, c = {});
  return c[f] || (c[f] = LoadAssetContainerAsync(BASE + f + '.glb', scene));
}

const hex = c => Color3.FromHexString(c).toLinearSpace();
const ZONE = { skin: 0, top: 1, bottom: 2, shoe: 3, sole: 4, sock: 5 };

function zoneOf(bone, look) {
  if (/^(foot|ball)/.test(bone)) return ZONE.shoe;
  if (/^calf/.test(bone)) return look.bottomStyle === 'shorts' ? ZONE.skin : ZONE.bottom;
  if (/^(thigh|pelvis|root)/.test(bone)) return ZONE.bottom;
  if (/^(spine|clavicle)/.test(bone)) return ZONE.top;
  if (/^upperarm/.test(bone)) return look.topStyle === 'tank' ? ZONE.skin : ZONE.top;
  if (/^lowerarm/.test(bone)) return look.topStyle === 'long' ? ZONE.top : ZONE.skin;
  return ZONE.skin;
}

export async function makeSkater(scene, look, shadow) {
  const cont = await loadBody(scene, look.body);
  const inst = cont.instantiateModelsToScene(n => n, false, { doNotInstance: true });
  inst.animationGroups.forEach(g => g.stop());
  const root = new TransformNode('skater', scene);
  const fig = inst.rootNodes[0];
  fig.parent = root;
  const nodes = {};
  fig.getDescendants(false).forEach(n => { if (n.name) nodes[n.name.replace(/^Clone of /, '')] = n; });
  const skel = inst.skeletons[0];

  // ---- Farben nach Zonen (dominanter Knochen je Ecke)
  const cols = [hex(look.skin), hex(look.top), hex(look.bottom), hex(look.shoes), hex(look.sole || '#f2f2f2'), hex('#eeeeee')];
  const meshes = fig.getChildMeshes(false);
  for (const m of meshes) {
    if (shadow) shadow.addShadowCaster(m);
    m.receiveShadows = true;
    m.alwaysSelectAsActiveMesh = true;
    const mn = m.material && m.material.name || '';
    if (!/Superhero/i.test(mn)) continue;
    m.makeGeometryUnique();
    const idx = m.getVerticesData(VertexBuffer.MatricesIndicesKind), w = m.getVerticesData(VertexBuffer.MatricesWeightsKind);
    const pos = m.getVerticesData(VertexBuffer.PositionKind);
    const sk = m.skeleton, n = idx.length / 4, colors = new Float32Array(n * 4);
    // Höhe der Ecken in Ruhe (Knochenraum): grob über Fußknochen abschätzen ist unnötig – Sohle = Fußecken mit kleinster Höhe
    let minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < n; i++) { const y = pos[i * 3 + 1]; if (y < minY) minY = y; if (y > maxY) maxY = y; }
    for (let i = 0; i < n; i++) {
      let best = 0, bw = -1;
      for (let k = 0; k < 4; k++) if (w[i * 4 + k] > bw) { bw = w[i * 4 + k]; best = idx[i * 4 + k]; }
      const bn = sk.bones[best] ? sk.bones[best].name : '';
      let z = zoneOf(bn, look);
      colors.set([cols[z].r, cols[z].g, cols[z].b, 1], i * 4);
    }
    m.setVerticesData(VertexBuffer.ColorKind, colors, false, 4);
    const mat = new PBRMaterial('skin_' + look.id, scene);
    mat.albedoColor = Color3.White(); mat.metallic = 0; mat.roughness = 0.62;
    mat.environmentIntensity = 0.7;
    m.material = mat; m.useVertexColors = true; m.hasVertexAlpha = false;
  }

  // ---- Sohlen: Fußecken unterhalb Knöchelhöhe → hell (nach dem Aufstellen messen wir die Weltposition einmal)
  const sk = skel;
  root.computeWorldMatrix(true); fig.getDescendants(false).forEach(n => n.computeWorldMatrix && n.computeWorldMatrix(true));

  // ---- Kopfbedeckung / Frisur
  const head = nodes.Head;
  const hm = new PBRMaterial('hair_' + look.id, scene); hm.albedoColor = hex(look.hair || '#2a1a12'); hm.metallic = 0; hm.roughness = 0.8;
  const hat = new TransformNode('hat', scene); hat.parent = head;
  // Kopf-Knochen: lokales Koordinatensystem unbekannt → Hut in Figurraum ausrichten und dann umhängen
  buildHeadwear(scene, look, hm, hat, head, root, fig, shadow);

  const rig = new Rig(root, fig, nodes, scene);
  return rig;
}

function buildHeadwear(scene, look, hairMat, holder, head, root, fig, shadow) {
  const parts = [];
  const add = m => { m.parent = holder; parts.push(m); if (shadow) shadow.addShadowCaster(m); m.receiveShadows = true; return m; };
  const style = look.hairStyle || 'short';
  // Kopf in Ruhe: Mittelpunkt ca. 0.11 m über dem Kopfknochen, Radius ~0.105
  if (style !== 'bald') {
    const cap = MeshBuilder.CreateSphere('hair', { diameter: 0.235, segments: 16, slice: 0.55 }, scene);
    cap.material = hairMat; cap.position.set(0, 0.105, -0.012); cap.scaling.set(1, 1.02, 1.1);
    add(cap);
    if (style === 'long' || style === 'pony') {
      const tail = MeshBuilder.CreateCapsule('tail', { radius: style === 'pony' ? 0.04 : 0.09, height: style === 'pony' ? 0.26 : 0.3 }, scene);
      tail.material = hairMat; tail.position.set(0, 0.02, -0.1); tail.rotation.x = 0.25; add(tail);
    }
    if (style === 'afro') { cap.scaling.set(1.35, 1.3, 1.4); cap.position.y = 0.13; }
  }
  if (look.hat) {
    const hm = new PBRMaterial('hat_' + look.id, scene); hm.albedoColor = hex(look.hat.color); hm.roughness = 0.7; hm.metallic = 0;
    if (look.hat.type === 'cap') {
      const c = MeshBuilder.CreateSphere('cap', { diameter: 0.25, segments: 16, slice: 0.5 }, scene); c.material = hm; c.position.set(0, 0.12, -0.005); add(c);
      const brim = MeshBuilder.CreateCylinder('brim', { diameter: 0.2, height: 0.012, tessellation: 20 }, scene); brim.material = hm;
      brim.scaling.set(0.9, 1, 0.75); brim.position.set(0, 0.125, look.hat.back ? -0.13 : 0.12); add(brim);
    } else if (look.hat.type === 'beanie') {
      const c = MeshBuilder.CreateSphere('beanie', { diameter: 0.25, segments: 16, slice: 0.6 }, scene); c.material = hm; c.position.set(0, 0.115, -0.01); c.scaling.set(1, 1.12, 1.05); add(c);
      const rim = MeshBuilder.CreateTorus('rim', { diameter: 0.235, thickness: 0.035, tessellation: 24 }, scene); rim.material = hm; rim.position.set(0, 0.105, -0.01); add(rim);
    } else if (look.hat.type === 'helmet') {
      hm.roughness = 0.3; hm.clearCoat.isEnabled = true;
      const c = MeshBuilder.CreateSphere('helm', { diameter: 0.275, segments: 18, slice: 0.55 }, scene); c.material = hm; c.position.set(0, 0.1, -0.008); c.scaling.set(1, 1, 1.08); add(c);
    }
  }
  // Ausrichtung: holder hängt am Kopfknochen. Wir wollen Figurraum-Achsen (Y hoch, Z vorne) → inverse Kopf-Weltrotation relativ zur Figur.
  head.computeWorldMatrix(true);
  const hw = head.getWorldMatrix().clone(), rw = root.getWorldMatrix().clone();
  const rel = hw.multiply(Matrix.Invert(rw)); // Kopf relativ zu Wurzel
  const q = new Quaternion(); rel.decompose(undefined, q, undefined);
  holder.rotationQuaternion = Quaternion.Inverse(q);
  // Kopfknochen kann skaliert sein (Quantisierung) → Skalierung ausgleichen
  const s = new Vector3(); rel.decompose(s);
  holder.scaling.set(1 / s.x, 1 / s.y, 1 / s.z);
}

// ---------------------------------------------------------------- Rig mit IK
const tmpQ = new Quaternion(), tmpV = new Vector3();
function fromTo(a, b, out) {
  const d = Vector3.Dot(a, b);
  if (d < -0.99999) { let ax = Vector3.Cross(Vector3.Right(), a); if (ax.lengthSquared() < 1e-6) ax = Vector3.Cross(Vector3.Up(), a); ax.normalize(); return Quaternion.RotationAxisToRef(ax, Math.PI, out); }
  const c = Vector3.Cross(a, b);
  out.set(c.x, c.y, c.z, 1 + d); return out.normalize();
}

export class Rig {
  constructor(root, fig, nodes, scene) {
    this.root = root; this.fig = fig; this.n = nodes; this.scene = scene;
    // geordnete Knochenliste (Eltern vor Kindern)
    this.order = [];
    const walk = t => { this.order.push(t); t.getChildren(c => c instanceof TransformNode, true).forEach(walk); };
    walk(fig);
    this.rest = new Map();
    for (const t of this.order) {
      if (!t.rotationQuaternion) t.rotationQuaternion = Quaternion.FromEulerVector(t.rotation);
      this.rest.set(t, { q: t.rotationQuaternion.clone(), p: t.position.clone() });
    }
    this.updateAll();
    const P = k => this.n[k].getAbsolutePosition().clone();
    this.len = {};
    for (const s of ['l', 'r']) {
      this.len['leg' + s] = [P('thigh_' + s).subtract(P('calf_' + s)).length(), P('calf_' + s).subtract(P('foot_' + s)).length()];
      this.len['arm' + s] = [P('upperarm_' + s).subtract(P('lowerarm_' + s)).length(), P('lowerarm_' + s).subtract(P('hand_' + s)).length()];
    }
    // Ruhe-Maße im Figurraum
    const inv = Matrix.Invert(this.root.getWorldMatrix());
    this.restPelvis = Vector3.TransformCoordinates(P('pelvis'), inv);
    this.footH = Vector3.TransformCoordinates(P('foot_l'), inv).y;
  }
  updateAll() { this.root.computeWorldMatrix(true); for (const t of this.order) t.computeWorldMatrix(true); }
  updFrom(t) { // t und alle Nachfahren neu rechnen
    const i = this.order.indexOf(t); t.computeWorldMatrix(true);
    for (const c of t.getDescendants(false)) if (c.computeWorldMatrix) c.computeWorldMatrix(true);
  }
  reset() { for (const t of this.order) { const r = this.rest.get(t); t.rotationQuaternion.copyFrom(r.q); t.position.copyFrom(r.p); } }
  worldRot(t) { const q = new Quaternion(); t.getWorldMatrix().decompose(undefined, q, undefined); return q; }
  // Welt-Drehung d auf Knoten t anwenden
  rotateWorld(t, d) {
    const pw = t.parent ? this.worldRot(t.parent) : Quaternion.Identity();
    const w = d.multiply(pw.multiply(t.rotationQuaternion));
    Quaternion.Inverse(pw).multiplyToRef(w, t.rotationQuaternion);
    t.rotationQuaternion.normalize();
  }
  aim(t, childPos, target, weight = 1) {
    const o = t.getAbsolutePosition();
    const a = childPos.subtract(o).normalize(), b = target.subtract(o).normalize();
    let d = fromTo(a, b, new Quaternion());
    if (weight < 1) d = Quaternion.Slerp(Quaternion.Identity(), d, weight);
    this.rotateWorld(t, d); this.updFrom(t);
  }
  twoBone(a, b, c, lens, target, pole) {
    const A = a.getAbsolutePosition().clone();
    const [l1, l2] = lens; let T = target.subtract(A); let d = T.length();
    const maxd = (l1 + l2) * 0.999, mind = Math.abs(l1 - l2) + 0.01;
    d = Math.min(maxd, Math.max(mind, d)); const n = T.normalize();
    const cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
    let u = pole.subtract(A); u.subtractInPlace(n.scale(Vector3.Dot(u, n))); if (u.lengthSquared() < 1e-8) u = Vector3.Up(); u.normalize();
    const knee = A.add(n.scale(l1 * cosA)).add(u.scale(l1 * sinA));
    const tgt = A.add(n.scale(d));
    this.aim(a, b.getAbsolutePosition().clone(), knee);
    this.aim(b, c.getAbsolutePosition().clone(), tgt);
  }
  // p in Figurraum → Welt
  W(x, y, z) { return Vector3.TransformCoordinates(new Vector3(x, y, z), this.root.getWorldMatrix()); }
  Wd(x, y, z) { return Vector3.TransformNormal(new Vector3(x, y, z), this.root.getWorldMatrix()).normalize(); }

  /* Pose (alles im Figurraum, Figur blickt +Z, links = +X):
     pose = { pelvis:[x,y,z], hipTwist, lean, side, footL:[x,y,z], footR:[...], toeL:[dx,dz], toeR, handL:[...], handR:[...], look:[x,y,z] } */
  apply(p) {
    this.reset(); this.updateAll();
    const N = this.n;
    // Becken verschieben
    const pel = N.pelvis;
    const want = this.W(p.pelvis[0], p.pelvis[1], p.pelvis[2]);
    const parentInv = Matrix.Invert(pel.parent.getWorldMatrix());
    Vector3.TransformCoordinatesToRef(want, parentInv, pel.position);
    this.updFrom(pel);
    // Becken- und Oberkörperdrehung
    const up = this.Wd(0, 1, 0), side = this.Wd(1, 0, 0), fwd = this.Wd(0, 0, 1);
    if (p.hipTwist) { this.rotateWorld(pel, Quaternion.RotationAxis(up, p.hipTwist)); this.updFrom(pel); }
    const sp = [N.spine_01, N.spine_02, N.spine_03];
    for (const s of sp) {
      let q = Quaternion.Identity();
      if (p.lean) q = Quaternion.RotationAxis(side, p.lean / 3).multiply(q);
      if (p.side) q = Quaternion.RotationAxis(fwd, p.side / 3).multiply(q);
      if (p.twist) q = Quaternion.RotationAxis(up, p.twist / 3).multiply(q);
      this.rotateWorld(s, q); this.updFrom(s);
    }
    // Beine
    for (const s of ['l', 'r']) {
      const f = s === 'l' ? p.footL : p.footR; if (!f) continue;
      const T = this.W(f[0], f[1] + this.footH, f[2]);
      const kneeOut = s === 'l' ? 1 : -1;
      const pole = this.W(f[0] * 0.5 + kneeOut * 0.12 + (p.kneeX || 0), 0.6, 0.6 + (p.kneeZ || 0));
      this.twoBone(N['thigh_' + s], N['calf_' + s], N['foot_' + s], this.len['leg' + s], T, pole);
      const toe = s === 'l' ? p.toeL : p.toeR;
      if (toe) {
        const fp = N['foot_' + s].getAbsolutePosition().clone();
        const ballW = N['ball_' + s].getAbsolutePosition().clone();
        const dir = this.Wd(toe[0], toe[2] || -0.35, toe[1]);
        this.aim(N['foot_' + s], ballW, fp.add(dir));
      }
    }
    // Arme
    for (const s of ['l', 'r']) {
      const h = s === 'l' ? p.handL : p.handR; if (!h) continue;
      const T = this.W(h[0], h[1], h[2]);
      const pole = this.W(h[0] * 1.3 + (s === 'l' ? 0.3 : -0.3), h[1] - 0.5, -0.5);
      this.twoBone(N['upperarm_' + s], N['lowerarm_' + s], N['hand_' + s], this.len['arm' + s], T, pole);
    }
    // Kopf schauen
    if (p.look) {
      const hp = N.Head.getAbsolutePosition().clone();
      const neck = N.neck_01;
      const lookW = this.W(p.look[0], p.look[1], p.look[2]);
      // Kopf „vorne“ ist Figur +Z in Ruhe: Ziel relativ zur Vorwärtsrichtung drehen
      const cur = this.Wd(0, 0, 1), des = lookW.subtract(hp).normalize();
      const d = Quaternion.Slerp(Quaternion.Identity(), fromTo(cur, des, new Quaternion()), 0.7);
      this.rotateWorld(neck, d); this.updFrom(neck);
    }
  }
  dispose() { this.root.dispose(false, true); }
}
