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
      return g;
    }).finally(() => { done++; onProgress && onProgress(done, pending); });
    cache.set(path, p);
  }
  return cache.get(path);
}
export const loaded = (path) => cache.has(path);

export const HERO_MODEL = { andrew: 'Warrior', marco: 'Wizard', teresa: 'Cleric', rico: 'Ranger', andy: 'Monk' };
// Größen wie in der Godot-Fassung (Modell 3 m hoch × Faktor)
export const HERO_SCALE = { andrew: 0.46, marco: 0.46, teresa: 0.46, rico: 0.50, andy: 0.54 };
export const NPC_MODEL = { shop: ['Rogue', '#ffd8a0', 0.44], elder: ['Wizard', '#f0f0ff', 0.44], kid: ['Rogue', '#ffa0c0', 0.32], guard: ['Warrior', '#ff9a8a', 0.46] };
export const monsterPath = (d) => `mon_${d.model}.glb`;
export const heroPath = (m) => `hero_${m}.glb`;

// Figur: Modell normiert auf eine Höhe (Felder) mit eigener Animationssteuerung
export function makeActor(gltf, height, tint) {
  const inst = skClone(gltf.scene);
  if (tint) {
    const c = new THREE.Color(tint);
    inst.traverse((o) => {
      if (!o.isMesh) return;
      const tintOne = (m) => { const d = m.clone(); d.color = d.color.clone().multiply(c); return d; };
      o.material = Array.isArray(o.material) ? o.material.map(tintOne) : tintOne(o.material);
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
  const mixer = gltf.animations.length ? new THREE.AnimationMixer(inst) : null;
  return { root, pivot, inst, mixer, clips: gltf.animations, state: '', cur: null, h: height };
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
  if (!clip) return;
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
