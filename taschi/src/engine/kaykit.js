// KayKit von Kay Lousberg (CC0): Abenteurer-Figuren (KayKit Adventurers 2.0)
// und Waffen/Schilde (KayKit Fantasy Weapons Bits 1.0).
// Die Figuren und ihre Rig-Animationen liegen schon im Repo bei Anmacha Quest
// (anmacha-quest-rpg/models/kk) und werden von dort mitbenutzt – keine Kopie.
// KKCharacter hat dieselbe Schnittstelle wie die gebauten Figuren
// (root, setLocomotion, setTalking, play, hold, update), damit die Welt sie
// wie jeden anderen Bewohner bewegen kann.
import { THREE } from './three.js';
import { modernToon } from './materials.js';
import { cloneRig, outlineMaterial } from './models.js';

const CHAR_BASE = new URL('../../../anmacha-quest-rpg/models/kk/', import.meta.url).href;
const ITEM_BASE = new URL('../../assets/kaykit/', import.meta.url).href;
const files = new Map();

function loadFile(url) {
  if (!files.has(url)) {
    const p = new Promise((resolve, reject) => {
      const Loader = THREE.GLTFLoader;
      if (!Loader) { reject(new Error('GLTFLoader fehlt')); return; }
      new Loader().load(url, (g) => { g.scene.updateMatrixWorld(true); g.box = new THREE.Box3().setFromObject(g.scene); resolve(g); }, undefined, reject);
    });
    p.catch(() => files.delete(url));
    files.set(url, p);
  }
  return files.get(url);
}

// Rig_Medium: Clips unter den Namen der Taschi-Figuren
const ALIAS = { Idle_A: 'idle', Idle_B: 'talk', Walking_A: 'walk', Running_A: 'run', Interact: 'interact', Use_Item: 'wave', PickUp: 'look', Hit_A: 'sad', Death_A: 'defeat', Throw: 'throw', Jump_Full_Short: 'cheer' };
let clipPromise = null;
function rigClips() {
  if (!clipPromise) clipPromise = Promise.all(['Rig_Medium_General.glb', 'Rig_Medium_MovementBasic.glb'].map(f => loadFile(CHAR_BASE + f))).then(gs => {
    const out = {};
    for (const g of gs) for (const c of g.animations) if (ALIAS[c.name]) { const k = c.clone(); k.name = ALIAS[c.name]; out[k.name] = k; }
    return out;
  });
  return clipPromise;
}

// Texturen als Anzeigewerte (der Renderer arbeitet linear), Toon-Look wie die Taschis.
// recolor: { outfit, accent, skin } färbt die Palettentextur zur Trainer-Kleidung um.
function toonify(root, outline, keep, recolor = null) {
  root.traverse(o => {
    if (!o.isMesh) return;
    const src = Array.isArray(o.material) ? o.material[0] : o.material;
    if (src.map) { src.map.encoding = THREE.LinearEncoding; src.map.needsUpdate = true; }
    const map = src.map && recolor ? recolored(src.map, recolor) : src.map;
    const m = modernToon(new THREE.MeshToonMaterial({ map: map || null, color: map ? 0xffffff : (src.color || new THREE.Color(0x999999)), skinning: !!o.isSkinnedMesh }), { rim: 0.22, sheen: 0.1 });
    o.material = m; o.castShadow = true; o.receiveShadow = false;
    keep.push(m);
    if (outline && o.isSkinnedMesh) {
      const ol = new THREE.SkinnedMesh(o.geometry, outlineMaterial(0.005));
      ol.bind(o.skeleton, o.bindMatrix); ol.frustumCulled = false;
      o.parent.add(ol); ol.position.copy(o.position); ol.quaternion.copy(o.quaternion); ol.scale.copy(o.scale);
      ol.userData.outlineOf = o; keep.push(ol.material);
    }
  });
}

// Palettentextur (8×4 Farbfelder mit Verlauf) feldweise umfärben:
// Haut -> Hautton, Grau/Metall -> Jackenfarbe, kräftige Farben -> Akzent.
// Braun (Leder), Gold, Weiß und Schwarz bleiben. Ergebnis wird je Kombination gemerkt.
const SKIN_K = [[1.04, 1.0, 1.0], [0.95, 0.86, 0.8], [0.82, 0.68, 0.58], [0.64, 0.5, 0.42], [0.46, 0.35, 0.3]];
const recolorCache = new Map();
function recolored(tex, { outfit = 0x3a7fd0, accent = 0xf2efe6, skin = 0 } = {}) {
  const img = tex.image; if (!img || !img.width) return tex;
  const key = (tex.uuid || img.src || '') + ':' + outfit + ':' + accent + ':' + skin;
  if (recolorCache.has(key)) return recolorCache.get(key);
  const W = img.width, H = img.height, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0);
  const data = cx.getImageData(0, 0, W, H), d = data.data;
  const O = new THREE.Color(outfit), A = new THREE.Color(accent), sk = SKIN_K[skin] || SKIN_K[0];
  const cw = W / 8, ch = H / 4, hsl = {};
  for (let cyI = 0; cyI < 4; cyI++) for (let cxI = 0; cxI < 8; cxI++) {
    // Klasse des Felds aus seinem hellsten Punkt (oben in der Mitte)
    const sx = Math.floor((cxI + 0.5) * cw), sy = Math.floor(cyI * ch + ch * 0.25), si = (sy * W + sx) * 4;
    const c = new THREE.Color(d[si] / 255, d[si + 1] / 255, d[si + 2] / 255); c.getHSL(hsl);
    let kind = 'keep';
    const isSkin = hsl.h > 0.03 && hsl.h < 0.11 && hsl.s > 0.45 && hsl.l > 0.72;
    if (isSkin) kind = 'skin';
    else if (hsl.s < 0.14 && hsl.l > 0.3 && hsl.l < 0.82) kind = 'outfit';
    else if (hsl.s > 0.3 && hsl.h > 0.2 && hsl.h < 0.5 && hsl.l > 0.2 && hsl.l < 0.75) kind = 'outfit';
    else if (hsl.s > 0.5 && (hsl.h < 0.03 || hsl.h > 0.5) && hsl.l < 0.75) kind = 'accent';
    if (kind === 'keep') continue;
    for (let y = Math.floor(cyI * ch); y < Math.floor((cyI + 1) * ch); y++) for (let x = Math.floor(cxI * cw); x < Math.floor((cxI + 1) * cw); x++) {
      const i = (y * W + x) * 4, r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
      const lum = 0.3 * r + 0.59 * g + 0.11 * b;
      if (kind === 'skin') { d[i] = Math.min(255, d[i] * sk[0]); d[i + 1] = Math.min(255, d[i + 1] * sk[1]); d[i + 2] = Math.min(255, d[i + 2] * sk[2]); continue; }
      const T = kind === 'outfit' ? O : A, f = kind === 'outfit' ? lum * 1.55 : lum * 1.9;
      d[i] = Math.min(255, T.r * f * 255); d[i + 1] = Math.min(255, T.g * f * 255); d[i + 2] = Math.min(255, T.b * f * 255);
    }
  }
  cx.putImageData(data, 0, 0);
  const t = new THREE.CanvasTexture(cv); t.flipY = tex.flipY; t.encoding = THREE.LinearEncoding;
  t.wrapS = tex.wrapS; t.wrapT = tex.wrapT; t.magFilter = tex.magFilter; t.minFilter = tex.minFilter;
  recolorCache.set(key, t);
  return t;
}

// Fantasy-Teile, die Trainer nicht tragen (Helm, Umhang, Köcher, Bärenfell, Hut, Maske)
const FANTASY = /_(Helmet|HelmetVisor|Cape|Quiver|BearHat|Hat|Mask)$/;

// Trainer-Ausrüstung aus einfachen Formen, an Knochen gehängt (Mütze, Rucksack, Kapsel-Gürtel)
function trainerGear(inst, look, keep) {
  const bones = {}; inst.traverse(o => { if (o.isBone) bones[o.name] = o; });
  let headMesh = null; inst.traverse(o => { if (o.isMesh && /_Head$/.test(o.name)) headMesh = o; });
  inst.updateMatrixWorld(true);
  const mat = (c) => { const m = modernToon(new THREE.MeshToonMaterial({ color: c }), { rim: 0.2, sheen: 0.12 }); keep.push(m); return m; };
  const put = (geo, color, bone, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat(color)); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = true;
    inst.add(m); m.updateMatrixWorld(true); if (bone) bone.attach(m); return m;
  };
  // Größen im Modellmaßstab: Kopf aus seiner Hülle
  const hb = headMesh ? new THREE.Box3().setFromObject(headMesh) : null;
  const toLocal = (v) => inst.worldToLocal(v.clone());
  if (hb && look.cap != null && bones.head) {
    const lo = toLocal(hb.min), hi = toLocal(hb.max), cxp = (lo.x + hi.x) / 2, czp = (lo.z + hi.z) / 2, r = (hi.x - lo.x) / 2;
    const top = hi.y;
    // Abenteuerbrille statt Schirmmütze: Stirnband rundum, zwei Brillengläser auf der Stirn
    const dz = (hi.z - lo.z) / 2, y = top - r * 0.5;
    put(new THREE.TorusGeometry(r * 1.0, r * 0.1, 8, 28), look.cap, bones.head, cxp, y, czp, Math.PI / 2).scale.set(1.04, (dz / r) * 1.04, 1.25);
    for (const sx of [-1, 1]) {
      const gx = cxp + sx * r * 0.3, gz = czp + dz * 1.02;
      put(new THREE.CylinderGeometry(r * 0.22, r * 0.24, r * 0.16, 16), 0x2a2d36, bones.head, gx, y + r * 0.06, gz, Math.PI / 2 - 0.25);
      put(new THREE.CircleGeometry(r * 0.17, 16), look.lens ?? 0x8ff0ff, bones.head, gx, y + r * 0.08, gz + r * 0.085, -0.25);
    }
  }
  const chest = bones.chest || bones.spine, hips = bones.hips;
  if (chest && look.backpack != null) {
    const p = new THREE.Vector3(); chest.getWorldPosition(p); const lp = toLocal(p), sc = (hb ? (toLocal(hb.max).x - toLocal(hb.min).x) : 1);
    put(new THREE.BoxGeometry(sc * 0.62, sc * 0.7, sc * 0.3), look.backpack, chest, lp.x, lp.y, lp.z - sc * 0.42);
    put(new THREE.BoxGeometry(sc * 0.5, sc * 0.26, sc * 0.1), new THREE.Color(look.backpack).multiplyScalar(0.75).getHex(), chest, lp.x, lp.y - sc * 0.12, lp.z - sc * 0.6);
  }
  if (hips && look.belt) {
    const p = new THREE.Vector3(); hips.getWorldPosition(p); const lp = toLocal(p), sc = (hb ? (toLocal(hb.max).x - toLocal(hb.min).x) : 1);
    for (let i = 0; i < 3; i++) {
      const a = -0.6 + i * 0.6, x = lp.x + Math.sin(a) * sc * 0.42, z = lp.z + Math.cos(a) * sc * 0.36;
      // Taschi-Kapseln: stehende Pillen (türkis/gold) statt Bällen
      const k = sc * 0.05, cy = lp.y + sc * 0.05;
      put(new THREE.CylinderGeometry(k, k, k * 1.6, 12), 0x2ab0c0, hips, x, cy, z);
      put(new THREE.SphereGeometry(k, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), 0xf5cd77, hips, x, cy + k * 0.8, z);
      put(new THREE.SphereGeometry(k, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), 0x2ab0c0, hips, x, cy - k * 0.8, z);
    }
  }
}

export const ADVENTURER_MODELS = ['Knight', 'Mage', 'Ranger', 'Rogue', 'Rogue_Hooded', 'Barbarian'];
// Ausrüstung je Figur: [rechte Hand, linke Hand]
const GEAR = { Knight: ['sword_A', 'shield_A'], Mage: ['staff_A', null], Ranger: ['bow_A_withString', null], Rogue: ['dagger_A', 'dagger_A'], Rogue_Hooded: ['dagger_A', null], Barbarian: ['axe_A', 'shield_C'] };

export class KKCharacter {
  // look (optional): Trainer-Optik { outfit, accent, skin, cap, backpack, belt } ohne Fantasy-Teile und Waffen
  constructor(model, { outline = true, height = 1.78, look = null } = {}) {
    this.root = new THREE.Group(); this.root.name = 'kk:' + model;
    this.model = model; this.height = height; this.outline = outline; this.look = look;
    this.target = 'idle'; this.oneShot = null; this.oneShotT = 0; this.speed = 0; this.talking = false;
    this.mixer = null; this.actions = {}; this.current = null; this.materials = []; this.disposed = false;
    this.dims = { legLen: 0.8 };
    Promise.all([loadFile(CHAR_BASE + model + '.glb'), rigClips()]).then(([g, clips]) => { if (!this.disposed) this.build(g, clips); }).catch(e => console.warn('KayKit', model, e));
  }
  get object() { return this.root; }
  build(g, clips) {
    const inst = cloneRig(g.scene);
    if (this.look) inst.traverse(o => { if (o.isMesh && FANTASY.test(o.name) && !(this.look.cape && /_Cape$/.test(o.name))) o.visible = false; });
    toonify(inst, this.outline, this.materials, this.look);
    if (this.look) { inst.traverse(o => { if (o.userData.outlineOf && !o.userData.outlineOf.visible) o.visible = false; }); trainerGear(inst, this.look, this.materials); }
    const b = g.box, k = this.height / Math.max(0.01, b.max.y - b.min.y);
    inst.scale.setScalar(k);
    inst.position.set(-(b.min.x + b.max.x) / 2 * k, -b.min.y * k, -(b.min.z + b.max.z) / 2 * k);
    this.root.add(inst); this.dims.legLen = this.height * 0.42;
    this.mixer = new THREE.AnimationMixer(inst);
    for (const [n, c] of Object.entries(clips)) this.actions[n] = this.mixer.clipAction(c);
    // Ausrüstung an die Handslots
    const [r, l] = this.look ? [] : GEAR[this.model] || [];
    const slots = {}; inst.traverse(o => { if (o.name === 'handslotr' || o.name === 'handslotl') slots[o.name] = o; });
    for (const [item, slot] of [[r, 'handslotr'], [l, 'handslotl']]) {
      if (!item || !slots[slot]) continue;
      loadItem(item).then(m => { if (!this.disposed) slots[slot].add(m); }).catch(() => {});
    }
    this.fade(this.oneShot || this.target, 0);
  }
  fade(name, t = 0.25) {
    const a = this.actions[name] || this.actions[name === 'talk' ? 'idle' : 'idle'];
    if (!a || a === this.current) return;
    const once = !!this.oneShot && name === this.oneShot;
    a.reset(); a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat); a.clampWhenFinished = once; a.play();
    if (this.current) a.crossFadeFrom(this.current, t, false);
    this.current = a;
  }
  setLocomotion(speed) { this.speed = speed; if (!this.oneShot) this.target = speed > 4.2 ? 'run' : speed > 0.25 ? 'walk' : (this.talking ? 'talk' : 'idle'); }
  setTalking(on, mood = 'talk') { this.talking = on; this.mood = mood; if (!this.oneShot && this.speed < 0.25) this.target = on ? 'talk' : 'idle'; }
  play(name, duration = 1.2, onDone) { this.oneShot = name; this.oneShotT = 0; this.oneShotDur = duration; this.oneShotDone = onDone; }
  hold(name) { this.target = name; this.oneShot = null; }
  update(dt) {
    if (this.oneShot) {
      this.oneShotT += dt;
      if (this.oneShotT >= this.oneShotDur) { const cb = this.oneShotDone; this.oneShot = null; this.oneShotDone = null; cb && cb(); }
    }
    if (!this.mixer) return;
    this.fade(this.oneShot || this.target);
    // Laufanimation an die Geschwindigkeit koppeln (keine rutschenden Füße)
    if (this.current === this.actions.walk) this.current.timeScale = Math.max(0.6, this.speed / 1.6);
    else if (this.current) this.current.timeScale = 1;
    this.mixer.update(dt);
  }
  dispose() { this.disposed = true; this.mixer?.stopAllAction(); for (const m of this.materials) m.dispose(); }
}

// Waffen und Schilde als Deko (Fantasy Weapons Bits)
export function loadItem(name) {
  return loadFile(ITEM_BASE + name + '.gltf').then(g => {
    if (!g.toon) { toonify(g.scene, false, []); g.toon = true; }
    return g.scene.clone(true);
  });
}
export const ITEM_NAMES = ['shield_A', 'shield_B', 'shield_C', 'axe_A', 'sword_A', 'sword_C', 'hammer_A', 'spear_A', 'halberd', 'staff_A', 'bow_A_withString', 'dagger_A'];
