// Katalogbilder: kleine 3/4-Ansicht jedes Objekts, gerendert mit EINEM gemeinsamen Offscreen-Renderer.
// Lazy: nur sichtbare Karten (IntersectionObserver), wenige pro Frame, Ergebnis je Variante als Data-URL gecacht.
// Geometrie und Materialien des Spiels werden nicht direkt benutzt (Kopie bzw. eigene Materialien), damit der
// Vorschau-Renderer sich nirgends einhängt und beim Schließen des Baumodus vollständig freigegeben werden kann.
// Ohne WebGL oder bei Fehlern bleibt einfach das Emoji stehen.
import * as THREE from 'three';
import { objectGeometry } from '../render/object-mesh';

const SIZE = 96;
const PER_FRAME = 3;

interface Job {
  key: string;
  defId: string;
  ca: number;
  cb: number;
  el: HTMLElement;
}

interface Kit {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  cam: THREE.PerspectiveCamera;
  mesh: THREE.Mesh;
  mats: THREE.Material[];
}

/** fertige Bilder je `defId|ca|cb` (bleiben über Öffnen/Schließen erhalten) */
const urls = new Map<string, string>();
/** Varianten, deren Rendern fehlschlug – nicht erneut versuchen */
const failed = new Set<string>();
const queue: Job[] = [];
const waiting = new Map<Element, Job>();
let kit: Kit | null = null;
let broken = false;
let raf = 0;
let io: IntersectionObserver | null = null;

const EMPTY = new THREE.BufferGeometry();
const _box = new THREE.Box3();
const _c = new THREE.Vector3();
const _sz = new THREE.Vector3();
const VIEW_DIR = new THREE.Vector3(1.05, 0.85, 1.45).normalize();

function getKit(): Kit | null {
  if (kit || broken) return kit;
  try {
    if (typeof document === 'undefined') throw new Error('kein DOM');
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(SIZE, SIZE, false);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.domElement.addEventListener('webglcontextlost', () => {
      // nur ein echter Verlust zählt – nicht das eigene forceContextLoss() beim Freigeben
      if (kit?.renderer !== renderer) return;
      broken = true;
      disposeThumbs();
    });
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xfff8ee, 0x7a6f62, 1.7));
    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(2, 3.2, 2.6);
    scene.add(sun);
    const cam = new THREE.PerspectiveCamera(28, 1, 0.05, 60);
    const mats: THREE.Material[] = [
      new THREE.MeshLambertMaterial({ vertexColors: true }),
      new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.45, depthWrite: false }),
      new THREE.MeshBasicMaterial({ vertexColors: true }),
    ];
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mats);
    mesh.frustumCulled = false;
    scene.add(mesh);
    kit = { renderer, scene, cam, mesh, mats };
  } catch {
    broken = true;
    kit = null;
  }
  return kit;
}

/** eine Variante rendern → Data-URL (oder null bei Fehler) */
function renderOne(k: Kit, defId: string, ca: number, cb: number): string | null {
  // Kopie der gecachten Geometrie: das Original bleibt unberührt, die Kopie wird gleich wieder freigegeben
  const geo = objectGeometry(defId, ca, cb).clone();
  try {
    k.mesh.geometry = geo;
    if (geo.boundingBox) _box.copy(geo.boundingBox);
    else _box.setFromBufferAttribute(geo.getAttribute('position') as THREE.BufferAttribute);
    _box.getCenter(_c);
    _box.getSize(_sz);
    const r = Math.max(0.15, 0.5 * _sz.length());
    const dist = (r / Math.sin(THREE.MathUtils.degToRad(k.cam.fov / 2))) * 0.92;
    k.cam.position.copy(VIEW_DIR).multiplyScalar(dist).add(_c);
    k.cam.near = Math.max(0.01, dist - r * 2);
    k.cam.far = dist + r * 2;
    k.cam.updateProjectionMatrix();
    k.cam.lookAt(_c);
    k.renderer.render(k.scene, k.cam);
    const url = k.renderer.domElement.toDataURL('image/webp', 0.9);
    return url.startsWith('data:image') ? url : null;
  } finally {
    k.mesh.geometry = EMPTY;
    geo.dispose();
  }
}

/** Emoji-Platzhalter durch das fertige Bild ersetzen */
function apply(el: HTMLElement, url: string): void {
  if (!el.isConnected && !el.parentNode) return;
  const img = document.createElement('img');
  img.className = 'bm-thumb';
  img.alt = '';
  img.width = SIZE;
  img.height = SIZE;
  img.draggable = false;
  img.src = url;
  el.replaceWith(img);
}

function pump(): void {
  raf = 0;
  let n = 0;
  while (queue.length && n < PER_FRAME) {
    const j = queue.shift()!;
    if (!j.el.isConnected) continue;
    const hit = urls.get(j.key);
    if (hit) {
      apply(j.el, hit);
      continue;
    }
    if (failed.has(j.key)) continue;
    const k = getKit();
    if (!k) {
      queue.length = 0;
      return;
    }
    n++;
    let url: string | null = null;
    try {
      url = renderOne(k, j.defId, j.ca, j.cb);
    } catch {
      url = null;
    }
    if (!url) {
      failed.add(j.key);
      continue;
    }
    urls.set(j.key, url);
    apply(j.el, url);
  }
  if (queue.length) raf = requestAnimationFrame(pump);
}

function enqueue(j: Job): void {
  if (typeof requestAnimationFrame === 'undefined') return;
  queue.push(j);
  if (!raf) raf = requestAnimationFrame(pump);
}

function observer(): IntersectionObserver | null {
  if (io) return io;
  if (typeof IntersectionObserver === 'undefined') return null;
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const j = waiting.get(e.target);
        io?.unobserve(e.target);
        waiting.delete(e.target);
        if (j) enqueue(j);
      }
    },
    { rootMargin: '64px' },
  );
  return io;
}

/**
 * Bild für die Katalogkarte anfordern. `el` ist der Emoji-Platzhalter; er wird ersetzt, sobald das Bild fertig ist.
 * Ist die Variante schon gecacht, geschieht das sofort.
 */
export function requestThumb(el: HTMLElement, defId: string, ca = 0, cb = 0): void {
  if (broken) return;
  const key = `${defId}|${ca}|${cb}`;
  if (failed.has(key)) return;
  const hit = urls.get(key);
  if (hit) {
    // Karte wird gerade erst gebaut → nach dem Einfügen ersetzen
    queueMicrotask(() => apply(el, hit));
    return;
  }
  const j: Job = { key, defId, ca, cb, el };
  const o = observer();
  if (!o) return enqueue(j);
  waiting.set(el, j);
  o.observe(el);
}

/** offene Anforderungen verwerfen (z. B. bevor der Katalog neu aufgebaut wird) */
export function cancelThumbs(): void {
  io?.disconnect();
  waiting.clear();
  queue.length = 0;
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

/** Renderer und eigene Materialien freigeben; der Bild-Cache bleibt erhalten */
export function disposeThumbs(): void {
  cancelThumbs();
  const k = kit;
  kit = null;
  if (!k) return;
  for (const m of k.mats) m.dispose();
  k.mesh.geometry = EMPTY;
  k.renderer.dispose();
  k.renderer.forceContextLoss();
}
