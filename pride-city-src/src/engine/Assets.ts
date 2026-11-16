/* Assets: lädt glTF-Modelle einmal, meldet den Fortschritt an den Ladebildschirm und liefert Kopien. */
import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as skClone } from 'three/examples/jsm/utils/SkeletonUtils.js';

const BASE = './assets/';
const cache = new Map<string, Promise<GLTF>>();
let manager = new THREE.LoadingManager();
let loader = new GLTFLoader(manager);

export type Progress = (done: number, total: number) => void;

/** Fortschritt einer Ladephase beobachten. Liefert eine Funktion zum Abmelden. */
export function trackProgress(fn: Progress) {
  manager.onProgress = (_u, done, total) => fn(done, total);
  return () => { manager.onProgress = () => {}; };
}

export function gltf(path: string): Promise<GLTF> {
  let p = cache.get(path);
  if (!p) {
    p = loader.loadAsync(BASE + path);
    p.catch(() => cache.delete(path));
    cache.set(path, p);
  }
  return p;
}

/** Statische Kopie (Gebäude, Requisiten) – Geometrie und Material bleiben geteilt */
export async function instance(path: string): Promise<THREE.Object3D> {
  const g = await gltf(path);
  const o = g.scene.clone(true);
  o.traverse((c) => { const m = c as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return o;
}

/** Kopie mit eigenem Skelett (animierte Figuren) */
export async function skinned(path: string): Promise<{ scene: THREE.Object3D; clips: THREE.AnimationClip[] }> {
  const g = await gltf(path);
  return { scene: skClone(g.scene), clips: g.animations };
}

export function preload(paths: string[]): Promise<unknown> {
  return Promise.all(paths.map((p) => gltf(p)));
}
