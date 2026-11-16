/* Fotostudio für Profilbilder (Rainbow Match): rendert eine Figur mit eigenem kleinen Renderer und liefert ein JPEG.
   Bilder werden pro Profil und Motiv zwischengespeichert. */
import * as THREE from 'three';
import { Actor, type Look } from './Actor';

export interface Shot { look: Look; clip: string; t?: number; bg: string; yaw?: number; close?: boolean }

let r: THREE.WebGLRenderer | null = null;
const cache = new Map<string, string>();
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(30, 4 / 3, .1, 50);
scene.add(new THREE.HemisphereLight(0xfff1f8, 0x2a1650, 1.6));
const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(2, 4, 4); scene.add(key);
const rim = new THREE.DirectionalLight(0xb9a6ff, 1.2); rim.position.set(-3, 2, -3); scene.add(rim);

export async function photo(id: string, s: Shot): Promise<string> {
  const k = id + '|' + JSON.stringify(s);
  const hit = cache.get(k); if (hit) return hit;
  if (!r) {
    r = new THREE.WebGLRenderer({ canvas: document.createElement('canvas'), antialias: true, preserveDrawingBuffer: true });
    r.setPixelRatio(2); r.setSize(400, 300, false); r.toneMapping = THREE.ACESFilmicToneMapping; r.outputColorSpace = THREE.SRGBColorSpace;
  }
  const a = await Actor.create(s.look);
  a.pose(s.clip, s.t ?? .6);
  a.root.rotation.y = s.yaw ?? .35;
  scene.background = new THREE.Color(s.bg).lerp(new THREE.Color(0x1a0f33), .7);
  scene.add(a.root);
  if (s.close) { const hy = a.head().y; cam.position.set(0, hy - .05, 2.4); cam.lookAt(0, hy - .2, 0); } else { cam.position.set(0, .75, 4.3); cam.lookAt(0, .95, 0); } // leicht von unten: wirkt größer und selbstbewusster
  r.render(scene, cam);
  const url = r.domElement.toDataURL('image/jpeg', .86);
  scene.remove(a.root);
  cache.set(k, url);
  return url;
}
