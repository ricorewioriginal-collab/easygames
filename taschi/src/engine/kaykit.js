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

// Texturen als Anzeigewerte (der Renderer arbeitet linear), Toon-Look wie die Taschis
function toonify(root, outline, keep) {
  root.traverse(o => {
    if (!o.isMesh) return;
    const src = Array.isArray(o.material) ? o.material[0] : o.material;
    if (src.map) { src.map.encoding = THREE.LinearEncoding; src.map.needsUpdate = true; }
    const m = modernToon(new THREE.MeshToonMaterial({ map: src.map || null, color: src.map ? 0xffffff : (src.color || new THREE.Color(0x999999)), skinning: !!o.isSkinnedMesh }), { rim: 0.22, sheen: 0.1 });
    o.material = m; o.castShadow = true; o.receiveShadow = false;
    keep.push(m);
    if (outline && o.isSkinnedMesh) {
      const ol = new THREE.SkinnedMesh(o.geometry, outlineMaterial(0.005));
      ol.bind(o.skeleton, o.bindMatrix); ol.frustumCulled = false;
      o.parent.add(ol); ol.position.copy(o.position); ol.quaternion.copy(o.quaternion); ol.scale.copy(o.scale);
      keep.push(ol.material);
    }
  });
}

export const ADVENTURER_MODELS = ['Knight', 'Mage', 'Ranger', 'Rogue', 'Rogue_Hooded', 'Barbarian'];
// Ausrüstung je Figur: [rechte Hand, linke Hand]
const GEAR = { Knight: ['sword_A', 'shield_A'], Mage: ['staff_A', null], Ranger: ['bow_A_withString', null], Rogue: ['dagger_A', 'dagger_A'], Rogue_Hooded: ['dagger_A', null], Barbarian: ['axe_A', 'shield_C'] };

export class KKCharacter {
  constructor(model, { outline = true, height = 1.78 } = {}) {
    this.root = new THREE.Group(); this.root.name = 'kk:' + model;
    this.model = model; this.height = height; this.outline = outline;
    this.target = 'idle'; this.oneShot = null; this.oneShotT = 0; this.speed = 0; this.talking = false;
    this.mixer = null; this.actions = {}; this.current = null; this.materials = []; this.disposed = false;
    this.dims = { legLen: 0.8 };
    Promise.all([loadFile(CHAR_BASE + model + '.glb'), rigClips()]).then(([g, clips]) => { if (!this.disposed) this.build(g, clips); }).catch(e => console.warn('KayKit', model, e));
  }
  get object() { return this.root; }
  build(g, clips) {
    const inst = cloneRig(g.scene);
    toonify(inst, this.outline, this.materials);
    const b = g.box, k = this.height / Math.max(0.01, b.max.y - b.min.y);
    inst.scale.setScalar(k);
    inst.position.set(-(b.min.x + b.max.x) / 2 * k, -b.min.y * k, -(b.min.z + b.max.z) / 2 * k);
    this.root.add(inst);
    this.mixer = new THREE.AnimationMixer(inst);
    for (const [n, c] of Object.entries(clips)) this.actions[n] = this.mixer.clipAction(c);
    // Ausrüstung an die Handslots
    const [r, l] = GEAR[this.model] || [];
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
