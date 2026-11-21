/* Bildpunkte einer Textur für das Bemalen der Figuren (outfit.ts, queer.ts). Auslesen aus dem Grafikspeicher hält die
   Grafikkarte an (am Handy ein spürbarer Hänger je Aufruf). Deshalb: jede Textur höchstens einmal auslesen, auch wenn
   viele Figuren sie teilen, und selbst gemalte Texturen gar nicht erst zurücklesen (ihre Bildpunkte kennen wir schon). */
import type { Scene, PBRMaterial } from '../engine/bjs';
import type { BaseTexture } from '@babylonjs/core/Materials/Textures/baseTexture';

const known = new WeakMap<object, Promise<Uint8Array | null>>();
const keyOf = (t: BaseTexture) => t.getInternalTexture() || t;

/** RGBA-Bildpunkte (Breite × Höhe × 4), höchstens einmal je Textur gelesen. Nie verändern: wird geteilt. */
export function pixels(t: BaseTexture): Promise<Uint8Array | null> {
  const k = keyOf(t);
  let p = known.get(k);
  if (!p) {
    const { width: w, height: h } = t.getSize();
    // Auslesen darf nie hängen bleiben (manche Handys antworten nicht): nach 4 s ohne Ergebnis weiter
    p = Promise.race([t.readPixels(), new Promise<null>((r) => setTimeout(() => r(null), 4000))])
      .then((b) => (b ? new Uint8Array(b.buffer, b.byteOffset, w * h * 4) : null)).catch(() => null);
    known.set(k, p);
    void p.then((d) => { if (!d) known.delete(k); });
  }
  return p;
}
/** Bildpunkte einer selbst gemalten Textur merken, damit sie nie aus dem Grafikspeicher zurückgelesen werden muss */
export function remember(t: BaseTexture, data: Uint8Array) { known.set(keyOf(t), Promise.resolve(data)); }
/** Material kopieren, ohne bei jeder übernommenen Eigenschaft alle Meshes der Szene abzuklappern
    (die Kopie hängt noch an keinem Mesh, das Markieren wäre reine Arbeit: bei 4.000 Meshes ein Hänger je Figur) */
export function quietClone(scene: Scene, m: PBRMaterial, name: string, setup?: (c: PBRMaterial) => void): PBRMaterial {
  const s = scene as Scene & { _forceBlockMaterialDirtyMechanism(v: boolean): void };
  const was = scene.blockMaterialDirtyMechanism;
  s._forceBlockMaterialDirtyMechanism(true);
  try { const c = m.clone(name); setup?.(c); return c; } finally { s._forceBlockMaterialDirtyMechanism(was); }
}

/** Lange Malarbeit in Häppchen: nach gut 4 ms im selben Bild aufs nächste Bild warten. Vorher lief eine ganze Figur
    (Hunderttausende Texel) am Stück, am Handy ein Hänger von einer Viertelsekunde je Figur, minutenlang nach dem Laden. */
let sliceT = 0, lastT = 0;
export async function breathe() {
  const n = performance.now();
  if (n - lastT > 40) sliceT = n;   // erster Aufruf seit einer Weile: neues Zeitfenster
  lastT = n;
  if (n - sliceT < 4) return;
  await new Promise<void>((r) => requestAnimationFrame(() => r()));
  sliceT = lastT = performance.now();
}
/** Bemaltes Material je Szene und Schlüssel einmal anlegen und von allen Figuren mit gleichem Look teilen
    (vorher eine Kopie je Figur: über 1.200 Materialien, jede mit eigener Prüfung und eigenem Uniform-Puffer) */
const shared = new WeakMap<Scene, Map<string, PBRMaterial>>();
export function sharedMat(scene: Scene, key: string, make: () => PBRMaterial): PBRMaterial {
  let m = shared.get(scene); if (!m) shared.set(scene, (m = new Map()));
  let x = m.get(key);
  if (!x) { const mm = m, nx = (x = make()); (nx as PBRMaterial & { _pcShared?: boolean })._pcShared = true; mm.set(key, nx); nx.onDisposeObservable.addOnce(() => { if (mm.get(key) === nx) mm.delete(key); }); }
  return x;
}
/** Material wegräumen, außer es wird geteilt */
export function dropMat(m: PBRMaterial) { if (!(m as PBRMaterial & { _pcShared?: boolean })._pcShared) m.dispose(); }
