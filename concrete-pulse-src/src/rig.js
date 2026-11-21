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
const ZONE = { skin: 0, top: 1, bottom: 2, shoe: 3, sole: 4, sock: 5, print: 6, belly: 7 };

function zoneOf(bone, look) {
  if (/^(foot|ball)/.test(bone)) return ZONE.shoe;
  if (/^calf/.test(bone)) return look.bottomStyle === 'shorts' ? ZONE.skin : ZONE.bottom;
  if (/^(thigh|pelvis|root)/.test(bone)) return ZONE.bottom;
  if (/^(spine|clavicle)/.test(bone)) return ZONE.top;
  if (/^upperarm/.test(bone)) return look.topStyle === 'tank' || look.topStyle === 'vest' ? ZONE.skin : ZONE.top;
  if (/^lowerarm/.test(bone)) return look.topStyle === 'long' || look.topStyle === 'hoodie' ? ZONE.top : ZONE.skin;
  return ZONE.skin;
}
// Wie weit Kleidung absteht (Meter, entlang der Normalen in Ruhepose) – sonst wirkt der Grundkörper wie ein Anzug
const PUFF = { tee: 0.012, tank: 0.008, long: 0.012, hoodie: 0.024, vest: 0.016, pants: 0.016, shorts: 0.018, cargo: 0.026 };

export async function makeSkater(scene, look, shadow) {
  const cont = await loadBody(scene, look.body);
  const inst = cont.instantiateModelsToScene(n => n, false, { doNotInstance: true });
  inst.animationGroups.forEach(g => g.stop());
  const root = new TransformNode('skater', scene);
  const fig = inst.rootNodes[0];
  fig.parent = root;
  const nodes = {};
  fig.getDescendants(false).forEach(n => { if (n.name) nodes[n.name.replace(/^Clone of /, '')] = n; });
  const fox = look.kind === 'fox';

  // ---- Farben nach Zonen (dominanter Knochen je Ecke) + Kleidung aufpolstern
  const cols = [hex(look.skin), hex(look.top), hex(look.bottom), hex(look.shoes), hex(look.sole || '#f2f2f2'), hex('#eeeeee'), hex(look.print || look.top), hex(look.belly || look.skin)];
  const bulk = (look.bulk || 1) - 1;
  const meshes = fig.getChildMeshes(false);
  for (const m of meshes) {
    if (shadow) shadow.addShadowCaster(m);
    m.receiveShadows = true;
    m.alwaysSelectAsActiveMesh = true;
    const mn = m.material && m.material.name || '';
    if (!/Superhero/i.test(mn)) continue;
    m.makeGeometryUnique();
    const idx = m.getVerticesData(VertexBuffer.MatricesIndicesKind), w = m.getVerticesData(VertexBuffer.MatricesWeightsKind);
    const pos = m.getVerticesData(VertexBuffer.PositionKind), nor = m.getVerticesData(VertexBuffer.NormalKind);
    const sk = m.skeleton, n = idx.length / 4, colors = new Float32Array(n * 4);
    // Kopfmitte (für Fuchskopf: menschlichen Kopf etwas einziehen)
    let hc = [0, 0, 0], hn = 0;
    const boneOf = new Array(n);
    for (let i = 0; i < n; i++) {
      let best = 0, bw = -1;
      for (let k = 0; k < 4; k++) if (w[i * 4 + k] > bw) { bw = w[i * 4 + k]; best = idx[i * 4 + k]; }
      boneOf[i] = sk.bones[best] ? sk.bones[best].name : '';
      if (boneOf[i] === 'Head') { hc[0] += pos[i * 3]; hc[1] += pos[i * 3 + 1]; hc[2] += pos[i * 3 + 2]; hn++; }
    }
    if (hn) hc = hc.map(v => v / hn);
    for (let i = 0; i < n; i++) {
      const bn = boneOf[i];
      let z = zoneOf(bn, look);
      const x = pos[i * 3], y = pos[i * 3 + 1], nz = nor ? nor[i * 3 + 2] : 0;
      if (z === ZONE.top && look.print && /^spine_0[23]/.test(bn) && nz > 0.45 && y > 0.4 && y < 0.6 && Math.abs(x) < 0.1) z = ZONE.print;
      if (z === ZONE.top && look.topStyle === 'vest' && /^spine/.test(bn) && nz > 0.25 && Math.abs(x) < 0.075) z = ZONE.belly;
      if (fox && z === ZONE.skin && /^(lowerarm|upperarm)/.test(bn) && nz > 0.3) z = ZONE.skin;
      colors.set([cols[z].r, cols[z].g, cols[z].b, 1], i * 4);
      if (!nor) continue;
      let off = 0;
      if (z === ZONE.top || z === ZONE.print || (z === ZONE.belly && look.topStyle !== 'vest')) off = PUFF[look.topStyle] || 0.012;
      else if (z === ZONE.bottom) off = PUFF[look.bottomStyle] || 0.016;
      else if (z === ZONE.shoe) off = look.boots ? 0.02 : 0.01;
      if (z === ZONE.belly) off = 0.006;
      if (!/^(Head|neck|hand|index|middle|pinky|ring|thumb)/.test(bn)) off += bulk * 0.12;
      if (/^(hand|index|middle|pinky|ring|thumb)/.test(bn)) off = 0;
      if (off) for (let k = 0; k < 3; k++) pos[i * 3 + k] += nor[i * 3 + k] * off;
      if (fox && bn === 'Head') for (let k = 0; k < 3; k++) pos[i * 3 + k] = hc[k] + (pos[i * 3 + k] - hc[k]) * 0.82;
    }
    m.setVerticesData(VertexBuffer.PositionKind, pos, false);
    m.setVerticesData(VertexBuffer.ColorKind, colors, false, 4);
    m.refreshBoundingInfo();
    const mat = new PBRMaterial('skin_' + look.id, scene);
    mat.albedoColor = Color3.White(); mat.metallic = 0; mat.roughness = 0.66;
    mat.environmentIntensity = 0.75;
    if (look.sheen !== false) { mat.sheen.isEnabled = true; mat.sheen.intensity = 0.25; mat.sheen.color = Color3.White(); }
    m.material = mat; m.useVertexColors = true; m.hasVertexAlpha = false;
  }

  root.computeWorldMatrix(true); fig.getDescendants(false).forEach(n => n.computeWorldMatrix && n.computeWorldMatrix(true));

  // ---- Kopf, Frisur, Bart, Zubehör und Fuchs-Teile
  const kit = new Kit(scene, look, root, shadow);
  buildHead(kit, look, kit.holder(nodes.Head));
  buildBody(kit, look, nodes);

  const rig = new Rig(root, fig, nodes, scene);
  rig.tail = kit.tail || null;
  return rig;
}

// Baukasten für angehängte Teile: Halter am Knochen, Achsen wie Figurraum (Y hoch, Z vorne, X links)
class Kit {
  constructor(scene, look, root, shadow) { this.scene = scene; this.look = look; this.root = root; this.shadow = shadow; this.mats = {}; }
  mat(col, rough = 0.75, metal = 0) {
    const k = col + rough + metal;
    if (this.mats[k]) return this.mats[k];
    const m = new PBRMaterial('kit_' + this.look.id + '_' + Object.keys(this.mats).length, this.scene);
    m.albedoColor = hex(col); m.roughness = rough; m.metallic = metal; m.environmentIntensity = 0.8;
    return this.mats[k] = m;
  }
  holder(bone) {
    const h = new TransformNode('kit', this.scene); h.parent = bone;
    bone.computeWorldMatrix(true);
    const rel = bone.getWorldMatrix().multiply(Matrix.Invert(this.root.getWorldMatrix()));
    const q = new Quaternion(), s = new Vector3(); rel.decompose(s, q, undefined);
    h.rotationQuaternion = Quaternion.Inverse(q); h.scaling.set(1 / s.x, 1 / s.y, 1 / s.z);
    return h;
  }
  add(m, parent, col, rough, metal) {
    m.parent = parent; if (col) m.material = this.mat(col, rough, metal);
    if (this.shadow) this.shadow.addShadowCaster(m); m.receiveShadows = true; m.alwaysSelectAsActiveMesh = true; return m;
  }
  sphere(parent, col, d, p, sc, opts = {}) {
    const m = MeshBuilder.CreateSphere('k', Object.assign({ diameter: d, segments: 14 }, opts), this.scene);
    m.position.set(p[0], p[1], p[2]); if (sc) m.scaling.set(sc[0], sc[1], sc[2]);
    return this.add(m, parent, col, opts.rough, opts.metal);
  }
  // Kapsel/Kegel zwischen zwei Punkten
  limb(parent, col, a, b, r1, r2 = r1, opts = {}) {
    const A = new Vector3(...a), B = new Vector3(...b), d = B.subtract(A), L = d.length();
    const m = r1 === r2 && !opts.cone ? MeshBuilder.CreateCapsule('k', { radius: r1, height: L + 2 * r1, tessellation: 12 }, this.scene)
      : MeshBuilder.CreateCylinder('k', { diameterTop: r2 * 2, diameterBottom: r1 * 2, height: L, tessellation: opts.tess || 12 }, this.scene);
    m.position.copyFrom(A.add(B).scale(0.5));
    m.rotationQuaternion = fromTo(Vector3.Up(), d.normalize(), new Quaternion());
    return this.add(m, parent, col, opts.rough, opts.metal);
  }
  ring(parent, col, d, t, p, rot, opts = {}) {
    const m = MeshBuilder.CreateTorus('k', { diameter: d, thickness: t, tessellation: 20 }, this.scene);
    m.position.set(p[0], p[1], p[2]); if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
    if (opts.sc) m.scaling.set(...opts.sc);
    return this.add(m, parent, col, opts.rough, opts.metal);
  }
  box(parent, col, s, p, rot, opts = {}) {
    const m = MeshBuilder.CreateBox('k', { width: s[0], height: s[1], depth: s[2] }, this.scene);
    m.position.set(p[0], p[1], p[2]); if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
    return this.add(m, parent, col, opts.rough, opts.metal);
  }
}

const mix = (a, b, t) => { const A = Color3.FromHexString(a), B = Color3.FromHexString(b); return Color3.Lerp(A, B, t).toHexString(); };

// Kopf in Ruhe: Mittelpunkt ca. 0.11 m über dem Kopfknochen, Radius ~0.105, Gesicht bei z ≈ +0.1
function buildHead(K, look, H) {
  const hair = look.hair || '#2a1a12', style = look.hairStyle || 'short';
  if (look.kind === 'fox') {
    const fur = look.skin, cream = look.belly || '#fff2dc', dark = look.furDark || mix(fur, '#3a1a08', 0.45);
    K.sphere(H, fur, 0.25, [0, 0.11, -0.005], [1, 0.98, 1.02], { rough: 0.9 });
    K.sphere(H, cream, 0.19, [0, 0.07, 0.045], [1.12, 0.72, 1], { rough: 0.9 });            // helle Wangen
    K.limb(H, cream, [0, 0.075, 0.07], [0, 0.07, 0.2], 0.055, 0.02, { cone: true });       // Schnauze
    K.sphere(H, '#17110e', 0.034, [0, 0.074, 0.2], null, { rough: 0.35 });                  // Nase
    for (const sx of [1, -1]) {
      K.sphere(H, '#f6fbf4', 0.046, [sx * 0.048, 0.132, 0.1], [1, 1.05, 0.7], { rough: 0.3 });
      K.sphere(H, look.eyes || '#2f9a5a', 0.03, [sx * 0.05, 0.132, 0.115], [1, 1.1, 0.6], { rough: 0.2 });
      K.sphere(H, '#0b0b0b', 0.014, [sx * 0.05, 0.133, 0.124], null, { rough: 0.2 });
      K.limb(H, fur, [sx * 0.07, 0.19, -0.015], [sx * 0.115, 0.33, -0.03], 0.05, 0.004, { cone: true, tess: 6, rough: 0.9 });
      K.limb(H, dark, [sx * 0.104, 0.29, -0.028], [sx * 0.116, 0.335, -0.031], 0.017, 0.002, { cone: true, tess: 6 });
      K.limb(H, cream, [sx * 0.072, 0.2, -0.0], [sx * 0.108, 0.3, -0.012], 0.03, 0.003, { cone: true, tess: 6 });
      K.limb(H, fur, [sx * 0.1, 0.07, 0.0], [sx * 0.15, 0.03, -0.02], 0.035, 0.005, { cone: true, tess: 6, rough: 0.9 }); // Backenfell
    }
    return;
  }
  // Frisuren
  const cap = (d, sl, p, sc) => { const m = K.sphere(H, hair, d, p, sc, { slice: sl, rough: 0.85 }); m.rotation.x = -0.22; m.scaling.x *= 0.96; return m; };
  if (style === 'short') cap(0.232, 0.56, [0, 0.106, -0.014], [1, 1.02, 1.1]);
  else if (style === 'buzz') cap(0.226, 0.55, [0, 0.106, -0.008], [1, 1, 1.06]);
  else if (style === 'spiky') {
    cap(0.232, 0.56, [0, 0.106, -0.014], [1, 1.02, 1.1]);
    const sp = [[0, 0.06], [0.045, 0.03], [-0.045, 0.03], [0.02, -0.02], [-0.025, -0.03], [0, -0.07], [0.06, -0.04], [-0.06, -0.05], [0.03, 0.08], [-0.03, 0.075]];
    for (const [x, z] of sp) K.limb(H, hair, [x, 0.19, z], [x * 1.3, 0.26 + (z > 0 ? 0.015 : 0), z + 0.02], 0.03, 0.003, { cone: true, tess: 6, rough: 0.85 });
  } else if (style === 'mohawk') {
    cap(0.226, 0.55, [0, 0.106, -0.008], [0.96, 1, 1.06]);
    for (let i = 0; i < 6; i++) { const z = 0.08 - i * 0.035; K.limb(H, look.hair2 || hair, [0, 0.19 + (i > 3 ? -0.03 : 0), z], [0, 0.29 - i * 0.01, z - 0.025], 0.028, 0.004, { cone: true, tess: 6 }); }
  } else if (style === 'long' || style === 'pony' || style === 'bob') {
    cap(0.237, 0.58, [0, 0.105, -0.012], [1.02, 1.03, 1.1]);
    if (style === 'long') K.limb(H, hair, [0, 0.1, -0.07], [0, -0.12, -0.1], 0.085, 0.07, { rough: 0.85 });
    if (style === 'pony') K.limb(H, hair, [0, 0.13, -0.12], [0, -0.06, -0.16], 0.035, 0.02, { rough: 0.85 });
    if (style === 'bob') K.sphere(H, hair, 0.26, [0, 0.075, -0.02], [1.02, 0.7, 1.05], { slice: 0.7, rough: 0.85 });
  } else if (style === 'afro') cap(0.235, 0.55, [0, 0.13, -0.012], [1.35, 1.3, 1.4]);
  else if (style === 'curly') { cap(0.24, 0.55, [0, 0.11, -0.012], [1.08, 1.08, 1.15]); for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; K.sphere(H, hair, 0.07, [Math.cos(a) * 0.09, 0.2 + Math.sin(i) * 0.01, Math.sin(a) * 0.09 - 0.01], null, { rough: 0.9 }); } }
  // Bart
  const skin = look.skin, bc = look.beardColor || hair;
  if (look.beard === 'full') {
    K.sphere(H, bc, 0.234, [0, 0.106, 0.02], [0.96, 1, 1], { slice: 0.42, rough: 0.95 }).rotation.x = Math.PI;
    K.sphere(H, bc, 0.06, [0, 0.03, 0.08], [1.35, 0.9, 1], { rough: 0.95 });
    K.box(H, bc, [0.075, 0.016, 0.03], [0, 0.07, 0.098], null, { rough: 0.95 });
  } else if (look.beard === 'stubble') K.sphere(H, mix(skin, bc, 0.6), 0.226, [0, 0.106, 0.016], [0.95, 1, 1], { slice: 0.42, rough: 0.95 }).rotation.x = Math.PI;
  else if (look.beard === 'goatee') { K.sphere(H, bc, 0.055, [0, 0.035, 0.088], [1, 1.2, 0.8], { rough: 0.95 }); K.box(H, bc, [0.06, 0.012, 0.02], [0, 0.068, 0.1]); }
  else if (look.beard === 'moustache') K.box(H, bc, [0.07, 0.016, 0.025], [0, 0.07, 0.103]);
  // Brille
  if (look.glasses === 'round' || look.glasses === 'square') {
    for (const sx of [1, -1]) {
      if (look.glasses === 'round') K.ring(H, '#1a1a1a', 0.046, 0.007, [sx * 0.037, 0.118, 0.105], [Math.PI / 2, 0, 0], { rough: 0.4 });
      else K.box(H, '#1a1a1a', [0.05, 0.035, 0.006], [sx * 0.037, 0.118, 0.105], null, { rough: 0.4 });
      K.box(H, '#1a1a1a', [0.004, 0.006, 0.1], [sx * 0.09, 0.12, 0.06]);
    }
    K.box(H, '#1a1a1a', [0.026, 0.005, 0.005], [0, 0.122, 0.107]);
  } else if (look.glasses === 'shades') {
    K.box(H, '#0b0d12', [0.13, 0.036, 0.01], [0, 0.118, 0.107], null, { rough: 0.15, metal: 0.4 });
    for (const sx of [1, -1]) K.box(H, '#0b0d12', [0.004, 0.006, 0.1], [sx * 0.09, 0.12, 0.06]);
  }
  // Schmuck
  if (look.earring) for (const sx of look.earring === 'both' ? [1, -1] : [1]) K.ring(H, '#d8dce6', 0.022, 0.005, [sx * 0.107, 0.07, 0.005], [0, Math.PI / 2, 0], { rough: 0.2, metal: 1 });
  if (look.earplug) for (const sx of [1, -1]) K.limb(H, '#20222a', [sx * 0.1, 0.085, 0.0], [sx * 0.112, 0.085, 0.0], 0.012, 0.012, { cone: true });
  if (look.septum) K.ring(H, look.septum, 0.018, 0.004, [0, 0.084, 0.112], [0, 0, 0], { rough: 0.2, metal: 1 });
  // Kopfbedeckung
  const hat = look.hat;
  if (hat) {
    const c = hat.color, back = hat.back;
    if (hat.type === 'cap') {
      K.sphere(H, c, 0.25, [0, 0.12, -0.005], null, { slice: 0.5, rough: 0.7 });
      const brim = MeshBuilder.CreateCylinder('brim', { diameter: 0.2, height: 0.012, tessellation: 20 }, K.scene); K.add(brim, H, c, 0.7);
      brim.scaling.set(0.9, 1, 0.75); brim.position.set(0, 0.125, back ? -0.13 : 0.12);
    } else if (hat.type === 'beanie') {
      K.sphere(H, c, 0.25, [0, 0.115, -0.01], [1, 1.12, 1.05], { slice: 0.6, rough: 0.95 });
      K.ring(H, c, 0.235, 0.035, [0, 0.105, -0.01], null, { rough: 0.95 });
    } else if (hat.type === 'helmet') {
      K.sphere(H, c, 0.275, [0, 0.1, -0.008], [1, 1, 1.08], { slice: 0.55, rough: 0.25 });
    } else if (hat.type === 'bucket') {
      K.sphere(H, c, 0.245, [0, 0.12, -0.008], [1, 0.95, 1.05], { slice: 0.5, rough: 0.9 });
      K.limb(H, c, [0, 0.105, -0.008], [0, 0.135, -0.008], 0.17, 0.125, { cone: true, tess: 20 });
    }
  }
  if (look.headphones) {
    const hc = look.headphones === true ? '#1d1f26' : look.headphones;
    K.ring(H, hc, 0.25, 0.016, [0, 0.11, -0.01], [Math.PI / 2, Math.PI / 2, 0], { sc: [1, 1, 1], rough: 0.4 });
    for (const sx of [1, -1]) { K.limb(H, hc, [sx * 0.105, 0.1, -0.005], [sx * 0.135, 0.1, -0.005], 0.042, 0.042, { cone: true, tess: 16, rough: 0.4 }); K.limb(H, look.print || '#ff8a1e', [sx * 0.135, 0.1, -0.005], [sx * 0.138, 0.1, -0.005], 0.03, 0.03, { cone: true, tess: 16 }); }
  }
}

function buildBody(K, look, N) {
  if (look.scarf) {
    const nk = K.holder(N.neck_01);
    K.ring(nk, look.scarf, 0.16, 0.05, [0, 0.045, 0.005], [0.15, 0, 0], { sc: [1, 1, 1.05], rough: 0.95 });
    K.limb(nk, look.scarf, [0.045, 0.02, 0.085], [0.07, -0.16, 0.11], 0.026, 0.03, { rough: 0.95 });
  }
  if (look.topStyle === 'hoodie') {
    const nk = K.holder(N.neck_01);
    K.sphere(nk, look.top, 0.2, [0, 0.07, -0.075], [1, 0.75, 0.75], { slice: 0.6, rough: 0.95 }).rotation.x = -1.2;
    for (const sx of [1, -1]) K.limb(nk, look.print || '#eeeeee', [sx * 0.03, 0.0, 0.1], [sx * 0.035, -0.14, 0.13], 0.006, 0.006);
  }
  if (look.guards) for (const s of ['l', 'r']) {
    const h = K.holder(N['lowerarm_' + s]), sx = s === 'l' ? 1 : -1;
    K.limb(h, look.guards, [sx * 0.07, 0, 0], [sx * 0.2, 0, 0], 0.048, 0.042, { cone: true, tess: 10, rough: 0.35, metal: 0.85 });
  }
  if (look.chain) { const sp = K.holder(N.spine_03); K.ring(sp, look.chain, 0.2, 0.008, [0, 0.13, 0.04], [0.9, 0, 0], { rough: 0.2, metal: 1 }); }
  if (look.kind === 'fox' && look.tail) {
    const pv = K.holder(N.pelvis), t = new TransformNode('tail', K.scene); t.parent = pv; t.position.set(0, -0.02, -0.1);
    K.limb(t, look.tail, [0, 0, 0], [0, -0.1, -0.22], 0.045, 0.075, { cone: true, rough: 0.95 });
    K.limb(t, look.tail, [0, -0.1, -0.22], [0, -0.06, -0.44], 0.075, 0.07, { cone: true, rough: 0.95 });
    K.sphere(t, look.tail, 0.15, [0, -0.1, -0.22], null, { rough: 0.95 });
    K.limb(t, look.tailTip || '#fff6ea', [0, -0.06, -0.44], [0, 0.02, -0.6], 0.07, 0.01, { cone: true, rough: 0.95 });
    K.sphere(t, look.tail, 0.14, [0, -0.06, -0.44], null, { rough: 0.95 });
    K.tail = t;
  }
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
    if (this.tail) this.tail.rotation.set(-(p.lean || 0) * 0.4 + Math.sin(performance.now() / 260) * 0.08, -(p.side || 0) * 1.2 + Math.sin(performance.now() / 410) * 0.22, 0);
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
