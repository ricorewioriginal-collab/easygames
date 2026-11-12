// Taschis aus 3D-Modellen (assets/models, Ultimate Monsters Bundle von
// Quaternius, CC0). Jedes Modell wird einmal geladen und pro Auftritt mit
// eigenem Skelett geklont. ModelCreature hat dieselbe Schnittstelle wie die
// prozeduralen Taschis (play, hitFlash, setTint, setMoving, update, dispose),
// damit Welt, Kampf und Vorschau nichts Besonderes tun müssen.
import { THREE } from './three.js';
import { SPECIES, SPECIES_IDS } from '../data/species.js';
import { Creature, creatureFactories } from './creatures.js';
import { toonGradient } from './textures.js';

const BASE = new URL('../../assets/models/', import.meta.url).href;
const HEIGHT = 1.25;          // Modellhöhe vor displayScale (wie die gebauten Taschis)
const files = new Map();      // Modellname -> Promise<{ scene, clips, height, box }>
const ready = new Map();      // Modellname -> geladenes Ergebnis

export const isModelSpecies = (id) => SPECIES[id]?.look?.plan === 'model';
export const modelReady = (id) => !isModelSpecies(id) || ready.has(SPECIES[id].look.model);

export function loadModel(name) {
  if (files.has(name)) return files.get(name);
  const p = new Promise((resolve, reject) => {
    const Loader = THREE.GLTFLoader;
    if (!Loader) { reject(new Error('GLTFLoader fehlt')); return; }
    new Loader().load(BASE + name + '.glb', (g) => {
      g.scene.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(g.scene);
      const res = { scene: g.scene, clips: g.animations, height: Math.max(0.01, box.max.y - box.min.y), box };
      ready.set(name, res); resolve(res);
    }, undefined, reject);
  });
  p.catch(() => files.delete(name));
  files.set(name, p);
  return p;
}
export function loadSpeciesModel(id) { return isModelSpecies(id) ? loadModel(SPECIES[id].look.model) : Promise.resolve(null); }
// Alle Modelle nacheinander im Hintergrund laden (für Vorschaubilder und Begegnungen)
export async function preloadModels() {
  const names = [...new Set(SPECIES_IDS.filter(isModelSpecies).map(id => SPECIES[id].look.model))];
  for (const n of names) { try { await loadModel(n); } catch (e) { console.warn('Modell', n, e); } }
}

// Skelett samt Haut klonen (ohne SkeletonUtils)
function cloneRig(src) {
  const c = src.clone(true), bones = {};
  c.traverse(o => { if (o.isBone) bones[o.name] = o; });
  c.traverse(o => {
    if (!o.isSkinnedMesh) return;
    const sk = o.skeleton;
    o.bind(new THREE.Skeleton(sk.bones.map(b => bones[b.name] || b), sk.boneInverses.map(m => m.clone())), o.bindMatrix.clone());
    o.frustumCulled = false;
  });
  return c;
}

// Umriss wie bei den gebauten Taschis: Rückseite, entlang der (gehäuteten) Normalen verschoben
function outlineMaterial(width) {
  const m = new THREE.MeshToonMaterial({ color: 0x000000, emissive: 0x202638, side: THREE.BackSide, skinning: true });
  // gleich breit auf dem Bildschirm, unabhängig von Skelett-Skalierung und Abstand
  m.onBeforeCompile = (s) => { s.vertexShader = s.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n{ vec3 vn = normalize(normalMatrix * objectNormal); gl_Position.xy += vn.xy * ' + width.toFixed(4) + ' * gl_Position.w; }'); };
  return m;
}

const CLIPS = {
  idle: ['Idle', 'Flying_Idle'], walk: ['Walk', 'Fast_Flying', 'Run'], run: ['Run', 'Fast_Flying', 'Walk'],
  attack: ['Punch', 'Headbutt', 'Bite_Front', 'Weapon'], special: ['Weapon', 'Jump', 'Headbutt', 'Dance'], hit: ['HitReact', 'HitRecieve'],
  faint: ['Death'], happy: ['Yes', 'Dance', 'Jump', 'Wave'], cry: ['Yes', 'No'], appear: ['Jump', 'Yes'], sleep: ['Idle', 'Flying_Idle']
};

export class ModelCreature extends Creature {
  constructor(id, { outline = true, shiny = false } = {}) {
    const sp = SPECIES[id], root = new THREE.Group(), body = new THREE.Group();
    root.name = 'creature:' + id; root.add(body);
    const mat = { emissive: new THREE.Color(0, 0, 0), dispose() {} };
    super(root, { root, body, eyes: new THREE.Object3D() }, { plan: 'model', legs: [], flyer: false, bodyTop: 1.2, behavior: sp.behavior, size: sp.look.size || 1, mat, meshes: [] });
    this.id = id; this.look = sp.look; this.outline = outline; this.shiny = shiny;
    this.materials = []; this.mixer = null; this.base = null; this.oneShot = null; this.disposed = false;
    root.userData.creature = this;
    const res = ready.get(sp.look.model);
    if (res) this.build(res);
    else loadModel(sp.look.model).then(r => { if (!this.disposed) this.build(r); }).catch(e => console.warn(e));
  }
  build(res) {
    const model = cloneRig(res.scene), k = HEIGHT / res.height, look = this.look, tint = look.tint;
    const glow = tint?.glow ? 0.12 : 0;
    model.traverse(o => {
      if (!o.isMesh) return;
      const src = Array.isArray(o.material) ? o.material[0] : o.material;
      const c = (src.color ? src.color.clone() : new THREE.Color(0x999999)).convertLinearToSRGB();
      const hsl = {}; c.getHSL(hsl);
      // Entwicklungen mit eigenem Farbton (look.tint) und schillernde Taschis (Farbton verschoben, heller)
      if (tint && hsl.s > 0.12) c.setHSL(tint.hue / 360, Math.min(1, hsl.s * 1.1), hsl.l);
      if (this.shiny && hsl.s > 0.08) { c.getHSL(hsl); c.setHSL((hsl.h + 0.14) % 1, Math.min(1, hsl.s + 0.15), Math.min(0.8, hsl.l * 1.08 + 0.04)); }
      const m = new THREE.MeshToonMaterial({ color: c, gradientMap: toonGradient(), skinning: !!o.isSkinnedMesh });
      m.userData.glow = c.clone().multiplyScalar(glow);
      m.emissive.copy(m.userData.glow);
      o.material = m; o.castShadow = true; o.receiveShadow = false;
      this.materials.push(m);
      if (this.outline && o.isSkinnedMesh) {
        const ol = new THREE.SkinnedMesh(o.geometry, outlineMaterial(0.006));
        ol.bind(o.skeleton, o.bindMatrix); ol.frustumCulled = false;
        o.parent.add(ol); ol.position.copy(o.position); ol.quaternion.copy(o.quaternion); ol.scale.copy(o.scale);
        this.materials.push(ol.material);
      }
    });
    // Füße auf den Boden, Mitte auf die Achse, einheitliche Höhe
    const b = res.box;
    model.scale.setScalar(k);
    model.position.set(-(b.min.x + b.max.x) / 2 * k, -b.min.y * k, -(b.min.z + b.max.z) / 2 * k);
    this.parts.body.add(model);
    this.model = model;
    this.mixer = new THREE.AnimationMixer(model);
    this.clips = {};
    for (const clip of res.clips) this.clips[clip.name.split('|').pop()] = clip;
    this.setBase('idle');
    if (this.action) this.playClip(this.action);
  }
  clip(kind) { for (const n of CLIPS[kind] || []) if (this.clips?.[n]) return this.clips[n]; return null; }
  setBase(kind) {
    const c = this.clip(kind) || this.clip('idle');
    if (!c || this.base?.getClip() === c) return;
    const a = this.mixer.clipAction(c);
    a.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.2).play();
    if (this.base && !this.oneShot) this.base.fadeOut(0.2);
    this.base = a; this.baseKind = kind;
  }
  playClip(kind) {
    const c = this.clip(kind); if (!c || !this.mixer) return;
    if (this.oneShot) this.oneShot.stop();
    const a = this.mixer.clipAction(c);
    a.reset().setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = kind === 'faint';
    a.timeScale = kind === 'faint' ? 1 : Math.max(0.6, c.duration / Math.max(0.3, this.actionDur || 0.6));
    a.fadeIn(0.08).play();
    this.base?.fadeOut(0.08);
    this.oneShot = a; this.oneShotKind = kind;
  }
  play(action, duration = 0.6, onDone) {
    super.play(action, duration, onDone);
    if (this.mixer) { if (action === 'sleep') { this.base && (this.base.timeScale = 0.35); } else this.playClip(action); }
  }
  update(dt) {
    super.update(dt);
    if (!this.mixer) return;
    // Laufen, Rennen oder Stehen je nach Tempo
    const kind = this.speed > 4.5 ? 'run' : this.speed > 0.2 ? 'walk' : 'idle';
    if (kind !== this.baseKind) this.setBase(kind);
    if (this.oneShot && this.oneShotKind !== 'faint' && !this.oneShot.isRunning()) {
      this.oneShot.fadeOut(0.15); this.oneShot = null;
      this.base?.reset().fadeIn(0.15).play();
    }
    if (this.action !== 'sleep' && this.base) this.base.timeScale = 1;
    this.mixer.update(dt);
    // Treffer-Blitz und Tönung (setTint) auf alle Materialien übertragen
    const e = this.mat.emissive;
    for (const m of this.materials) if (m.userData.glow) m.emissive.copy(m.userData.glow).add(e);
  }
  dispose() {
    this.disposed = true;
    this.mixer?.stopAllAction();
    for (const m of this.materials) m.dispose();
  }
}

creatureFactories.model = (id, opts) => new ModelCreature(id, opts);
