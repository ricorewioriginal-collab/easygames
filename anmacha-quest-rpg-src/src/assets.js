// Modelle laden (GLB, einmal pro Datei) und als Figuren mit Animationen klonen.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as skClone } from 'three/examples/jsm/utils/SkeletonUtils.js';

const loader = new GLTFLoader();
const cache = new Map();
const BASE = './models/';
let onProgress = null;
let pending = 0, done = 0;
export function setProgress(fn) { onProgress = fn; }

export function load(path) {
  if (!cache.has(path)) {
    pending++;
    const p = loader.loadAsync(BASE + path).then((g) => {
      g.scene.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          for (const m of mats) {
            if (m.map) { m.map.anisotropy = 4; m.map.colorSpace = THREE.SRGBColorSpace; }
            if (m.roughness !== undefined) { m.roughness = Math.max(0.55, m.roughness); m.metalness = Math.min(m.metalness, 0.1); }
          }
        }
      });
      const box = new THREE.Box3().setFromObject(g.scene);
      g.box = box;
      // KayKit-Figuren: Bewegungen kommen aus den gemeinsamen Rig-Dateien
      if (path.startsWith('kk/') && !path.startsWith('kk/Rig_') && !path.endsWith('.gltf')) return kkClips().then(c => { g.animations = c; return g; });
      return g;
    }).finally(() => { done++; onProgress && onProgress(done, pending); });
    cache.set(path, p);
  }
  return cache.get(path);
}
export const loaded = (path) => cache.has(path);
// Rig_Medium (KayKit, CC0): Clips unter den Namen, die Kampf und Karte erwarten
const KK_ALIAS = { Idle_A: 'idle', Walking_A: 'walk', Running_A: 'run', Hit_A: 'hit', Hit_B: 'recievehit', Death_A: 'death', Throw: 'attack', Use_Item: 'spell1', Idle_B: 'idle_weapon', Interact: 'interact' };
let kkPromise = null;
function kkClips() {
  if (!kkPromise) kkPromise = Promise.all([load('kk/Rig_Medium_General.glb'), load('kk/Rig_Medium_MovementBasic.glb')]).then(gs => {
    const out = [];
    for (const g of gs) for (const c of g.animations) if (KK_ALIAS[c.name]) { const k = c.clone(); k.name = KK_ALIAS[c.name]; out.push(k); }
    return out;
  });
  return kkPromise;
}

// Helden und Stadtbewohner: KayKit Adventurers (CC0); kk:Name = models/kk/Name.glb
export const HERO_MODEL = { andrew: 'kk:Knight', marco: 'kk:Mage', teresa: 'kk:Rogue', rico: 'kk:Ranger', andy: 'kk:Barbarian' };
// Größen wie in der Godot-Fassung (Modell 3 m hoch × Faktor)
export const HERO_SCALE = { andrew: 0.46, marco: 0.46, teresa: 0.46, rico: 0.50, andy: 0.54 };
export const NPC_MODEL = { shop: ['kk:Rogue_Hooded', '#ffd8a0', 0.44], elder: ['kk:Mage', '#b8c8ff', 0.44], kid: ['kk:Rogue', '#ffc0d0', 0.32], guard: ['kk:Knight', '#d8c0b0', 0.46],
  inn: ['kk:Rogue', '#ffe8c0', 0.44], smith: ['kk:Barbarian', '#d0a080', 0.5], trader: ['kk:Ranger', '#b0d8ff', 0.44], sage: ['kk:Mage', '#c0ffd0', 0.46], kid2: ['kk:Rogue_Hooded', '#ffd0f0', 0.32],
  angler: ['kk:Ranger', '#c0f0ff', 0.44], casino: ['kk:Rogue_Hooded', '#ffa0d8', 0.44], arena: ['kk:Mage', '#ffe08a', 0.46] };
// Waffen je Held, aufsteigend nach Ausrüstungsstufe (models/weapons, KayKit Fantasy Weapons Bits, CC0)
export const WEAPONS = { andrew: ['sword_A', 'sword_B', 'sword_C', 'sword_D', 'sword_E'], marco: ['staff_A', 'staff_B'], teresa: ['wand_A', 'staff_A'],
  rico: ['bow_A_withString', 'bow_B_withString'], andy: ['hammer_A', 'hammer_B', 'hammer_C'] };
// Hand für die Hauptwaffe und Zweitausrüstung in der anderen Hand (KayKit-Handslots)
export const WEAPON_HAND = { rico: 'handslotl' };
export const OFFHAND = { andrew: 'kk/shield_badge_color.gltf', andy: 'kk/shield_round_barbarian.gltf' };
// Haltung: Richtung der Spitze in Figur-Koordinaten (+Z = Blickrichtung, +Y = oben) und Länge relativ zur Körpergröße
export const WEAPON_GRIP = { andrew: { dir: [0.1, -0.45, 1], len: 0.55 }, marco: { dir: [0, 1, 0.12], len: 0.95 }, teresa: { dir: [0, 1, 0.25], len: 0.5 },
  rico: { dir: [0, 1, 0.05], len: 0.62 }, andy: { dir: [0, 0.35, 1], len: 0.5 } };
export const monsterPath = (d) => d.model.startsWith('kk:') ? `kk/${d.model.slice(3)}.glb` : d.model.startsWith('bestiary:') ? `bestiary/${d.model.slice(9)}.glb` : `mon_${d.model}.glb`;
export const heroPath = (m) => m.startsWith('kk:') ? `kk/${m.slice(3)}.glb` : `hero_${m}.glb`;
// Skelett-Gegner tragen ihre Waffe
export const MONSTER_WEAPON = { 'kk:Skeleton_Warrior': 'kk/Skeleton_Blade.gltf', 'kk:Skeleton_Minion': 'kk/Skeleton_Axe.gltf', 'kk:Skeleton_Rogue': 'kk/Skeleton_Blade.gltf', 'kk:Skeleton_Mage': 'kk/Skeleton_Staff.gltf' };

// Figur: Modell normiert auf eine Höhe (Felder) mit eigener Animationssteuerung
export function makeActor(gltf, height, tint) {
  const inst = skClone(gltf.scene);
  if (tint) {
    const c = new THREE.Color(tint);
    inst.traverse((o) => {
      if (!o.isMesh) return;
      const tintOne = (m) => { const d = m.clone(); d.color = d.color.clone().multiply(c); return d; };
      o.material = Array.isArray(o.material) ? o.material.map(tintOne) : tintOne(o.material);
      o.userData.ownMat = true;   // eigene Kopie: wird beim Abbau der Szene freigegeben
    });
  }
  const box = gltf.box;
  const s = height / Math.max(0.01, box.max.y - box.min.y);
  inst.scale.setScalar(s);
  inst.position.y = -box.min.y * s;
  const root = new THREE.Group();
  const pivot = new THREE.Group();
  pivot.add(inst);
  root.add(pivot);
  const a = { root, pivot, inst, mixer: null, clips: gltf.animations, state: '', cur: null, h: height };
  a.mixer = gltf.animations.length ? new THREE.AnimationMixer(inst) : procMixer(a);
  return a;
}
// T-Pose lösen: Oberarme seitlich herunterklappen (Skelett nach UE-Art: upperarm_l/_r → lowerarm_l/_r)
function relaxArms(inst, deg = 68) {
  inst.updateMatrixWorld(true);
  for (const side of ['l', 'r']) {
    const up = inst.getObjectByName('upperarm_' + side), low = inst.getObjectByName('lowerarm_' + side);
    if (!up || !low || !up.parent) continue;
    const pu = new THREE.Vector3().setFromMatrixPosition(up.matrixWorld), pl = new THREE.Vector3().setFromMatrixPosition(low.matrixWorld);
    inst.worldToLocal(pu); inst.worldToLocal(pl);
    const ang = THREE.MathUtils.degToRad(deg) * (pl.x > pu.x ? -1 : 1);
    // Drehung um die Vorwärtsachse des Modells, in den Raum des Elternknochens übertragen
    const qW = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), ang);
    const qInst = inst.getWorldQuaternion(new THREE.Quaternion());
    const qParent = up.parent.getWorldQuaternion(new THREE.Quaternion());
    const qWorld = qInst.clone().multiply(qW).multiply(qInst.clone().invert());
    up.quaternion.premultiply(qParent.clone().invert().multiply(qWorld).multiply(qParent));
    up.updateMatrixWorld(true);
  }
}
// Modelle ohne Animationen (Bestiarium): atmen, wiegen, beim Tod umkippen
function procMixer(a) {
  relaxArms(a.inst);
  const y0 = a.inst.position.y;
  let t = Math.random() * 6;
  return {
    update(dt) {
      t += dt;
      if (a.dead) { a.inst.rotation.x = Math.max(-1.45, a.inst.rotation.x - dt * 3); a.inst.position.y = y0 - Math.min(1, -a.inst.rotation.x) * a.h * 0.1; return; }
      const walk = a.state === 'walk' || a.state === 'run';
      a.inst.position.y = y0 + Math.abs(Math.sin(t * (walk ? 9 : 2.4))) * a.h * (walk ? 0.06 : 0.025);
      a.inst.rotation.z = Math.sin(t * (walk ? 4.5 : 1.2)) * (walk ? 0.08 : 0.035);
      a.inst.rotation.x = Math.sin(t * 1.7) * 0.03;
    },
    clipAction() { return null; },
    stopAllAction() { }
  };
}

export function clipFor(a, key) {
  const k = key.toLowerCase();
  for (const c of a.clips) { const n = c.name.toLowerCase(); if (n.endsWith('|' + k) || n.endsWith('_' + k) || n === k) return c; }
  for (const c of a.clips) if (c.name.toLowerCase().includes(k)) return c;
  return null;
}
function fadeTo(a, clip, loop, fade) {
  const act = a.mixer.clipAction(clip);
  act.reset();
  act.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
  act.clampWhenFinished = !loop;
  act.enabled = true;
  act.setEffectiveWeight(1);
  if (a.cur && a.cur !== act) act.crossFadeFrom(a.cur, fade, false);
  act.play();
  a.cur = act;
  return act;
}
export function playLoop(a, key) {
  if (!a.mixer || a.state === key) return;
  const clip = clipFor(a, key) || clipFor(a, 'idle') || clipFor(a, 'flying');
  if (!clip) { if (!a.clips.length) a.state = key; return; }
  fadeTo(a, clip, true, 0.15);
  a.state = key;
}
// Einmal abspielen, danach zurück in die Schleife `back` ('' = stehen bleiben)
export function playOnce(a, keys, back = 'idle') {
  if (!a.mixer) return false;
  let clip = null;
  for (const k of [].concat(keys)) { clip = clipFor(a, k); if (clip) break; }
  if (!clip) return false;
  fadeTo(a, clip, false, 0.08);
  a.state = 'once';
  if (a.onFin) a.mixer.removeEventListener('finished', a.onFin);
  a.onFin = (e) => {
    if (e.action !== a.cur) return;
    a.mixer.removeEventListener('finished', a.onFin);
    a.onFin = null;
    if (back) { a.state = ''; playLoop(a, back); }
  };
  a.mixer.addEventListener('finished', a.onFin);
  return true;
}
