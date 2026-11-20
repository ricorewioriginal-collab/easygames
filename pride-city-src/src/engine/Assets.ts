/* Assets: lädt glTF-Modelle einmal je Szene (Babylon-AssetContainer), meldet den Fortschritt an den Ladebildschirm
   und liefert Kopien: statische Teile als Instanzen (ein Zeichenaufruf für viele Häuser), Figuren mit eigenem Skelett. */
import { LoadAssetContainerAsync, Texture, TransformNode, type AssetContainer, type Scene, type AnimationGroup, type AbstractMesh } from './bjs';

const BASE = './assets/';
const added = new WeakSet<AssetContainer>();
const cache = new WeakMap<Scene, Map<string, Promise<AssetContainer>>>();

export type Progress = (done: number, total: number) => void;
let prog: Progress | null = null, pDone = 0, pTotal = 0;

/** Fortschritt einer Ladephase beobachten. Liefert eine Funktion zum Abmelden. */
export function trackProgress(fn: Progress) {
  prog = fn; pDone = 0; pTotal = 0;
  return () => { prog = null; };
}

export function container(scene: Scene, path: string): Promise<AssetContainer> {
  let m = cache.get(scene); if (!m) cache.set(scene, (m = new Map()));
  let p = m.get(path);
  if (!p) {
    pTotal++; prog?.(pDone, pTotal);
    const i = path.lastIndexOf('/');
    p = LoadAssetContainerAsync(BASE + path.slice(0, i + 1) + path.slice(i + 1), scene).then((c) => {
      // KayKit-Texturen sind auf „Nearest“ gestellt – das wirkt am Handy pixelig. Weich filtern mit Mipmaps.
      for (const t of c.textures) if (t instanceof Texture) { t.updateSamplingMode(Texture.TRILINEAR_SAMPLINGMODE); t.anisotropicFilteringLevel = 4; }
      pDone++; prog?.(pDone, pTotal);
      return c;
    });
    p.catch(() => m!.delete(path));
    m.set(path, p);
  }
  return p;
}

/** Statische Kopie (Gebäude, Requisiten): Instanzen teilen Geometrie und Material */
export async function instance(scene: Scene, path: string, opts: { shadows?: boolean; clone?: boolean } = {}): Promise<TransformNode> {
  const c = await container(scene, path);
  if (!opts.clone && !added.has(c)) {
    // Quellen in die Szene holen (sonst bekommen Instanzen keine Lichter zugewiesen), selbst aber unsichtbar
    added.add(c); c.addAllToScene();
    for (const m of c.meshes) { m.isVisible = false; m.isPickable = false; }
    for (const g of c.animationGroups) g.stop();
  }
  const e = c.instantiateModelsToScene((n) => n, false, { doNotInstantiate: !!opts.clone });
  const root = new TransformNode(path, scene);
  for (const n of e.rootNodes) n.parent = root;
  root.getChildMeshes().forEach((m) => { m.isVisible = true; m.receiveShadows = true; (m as AbstractMesh & { _pcCast?: boolean })._pcCast = opts.shadows !== false; m.isPickable = false; });
  return root;
}

/** Kopie mit eigenem Skelett und eigenen Animationen (Figuren) */
export async function skinned(scene: Scene, path: string): Promise<{ root: TransformNode; groups: AnimationGroup[] }> {
  const c = await container(scene, path);
  const e = c.instantiateModelsToScene((n) => n, false, { doNotInstantiate: true });
  const root = new TransformNode(path, scene);
  for (const n of e.rootNodes) n.parent = root;
  root.getChildMeshes().forEach((m) => { m.isPickable = false; });
  return { root, groups: e.animationGroups };
}

export function preload(scene: Scene, paths: string[]): Promise<unknown> {
  return Promise.all(paths.map((p) => container(scene, p)));
}

/** Alle Meshes unter einem Knoten (für Schattenwurf) */
export function meshesOf(n: TransformNode) { return n.getChildMeshes(false); }
