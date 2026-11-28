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

/** Straßenmöbel: KayKit-Spielzeug durch echte Poly-Haven-Modelle (CC0, verkleinert, scratch prep.mjs) ersetzen.
    Aufrufer skalieren KayKit-Teile mit 5 (2 Einheiten = 10 m); die Ersatzteile sind in Metern, daher innen 1/5. */
const KAY = 5;
/** Teil eines Ersatzes: Datei, Versatz x/y/z in Metern, Drehung, Maßstab */
type Part = [string, number, number, number, number, number];
export const PROP_SWAP: Record<string, { file: string; scale: number; rot: number; extra?: string; parts?: Part[]; kay?: number }> = {
  'city/streetlight.gltf': { file: 'props/street_lamp_01.glb', scale: 1.25, rot: 0 },
  'city/bench.gltf': { file: 'props/modular_street_seating.glb', scale: .9, rot: Math.PI },
  'city/firehydrant.gltf': { file: 'props/fire_hydrant.glb', scale: 1.15, rot: 0 },
  'city/trash_A.gltf': { file: 'props/metal_trash_can.glb', scale: 1, rot: 0 },
  'city/bush.gltf': { file: 'props/planter_box_02.glb', scale: 1.3, rot: 0, extra: 'shrub' },
  // Wasserturm: Holztank auf Stahlbeinen, von der Welt gebaut (Teile als Instanzen)
  'city/watertower.gltf': { file: '', scale: 1, rot: 0, extra: 'tower' },
  // Möbel (Aufrufer skalieren mit 0,9): scale ist hier der echte Maßstab des Poly-Haven-Modells
  'home/couch_pillows.gltf': { file: 'furniture/sofa_02.glb', scale: 1.3, rot: 0, kay: .9 },
  'home/armchair_pillows.gltf': { file: 'furniture/modern_arm_chair_01.glb', scale: 1.2, rot: 0, kay: .9 },
  'home/table_low.gltf': { file: 'furniture/modern_coffee_table_01.glb', scale: 1.3, rot: Math.PI / 2, kay: .9 },
  'home/chair_A.gltf': { file: 'furniture/dining_chair_02.glb', scale: 1.1, rot: 0, kay: .9 },
  'home/cabinet_medium_decorated.gltf': { file: 'furniture/modern_wooden_cabinet.glb', scale: .9, rot: 0, kay: .9 },
  'home/cabinet_small.gltf': { file: 'furniture/side_table_01.glb', scale: 1.63, rot: 0, kay: .9 },
  'home/cactus_medium_A.gltf': { file: 'furniture/potted_plant_02.glb', scale: 1.4, rot: 0, kay: .9 },
  'home/cactus_medium_B.gltf': { file: 'furniture/potted_plant_01.glb', scale: 1, rot: 0, kay: .9 },
  'home/cactus_small_A.gltf': { file: 'furniture/potted_plant_04.glb', scale: 1.8, rot: 0, kay: .9 },
  'home/lamp_table.gltf': { file: 'furniture/industrial_pipe_lamp.glb', scale: 1.4, rot: 0, kay: .9 },
  // Küche, Bett und Stehlampe: maßstäblich nachgebaut (furniture.ts), Mitte wie beim Bausatz
  'home/bed_double_A.gltf': { file: '', scale: 1, rot: 0, kay: .9, extra: 'bed' },
  'home/lamp_standing.gltf': { file: '', scale: 1, rot: 0, kay: .9, extra: 'floorLamp' },
  'home/rug_rectangle_A.gltf': { file: '', scale: 1, rot: 0, kay: .9, extra: 'rug' },
  'home/rug_rectangle_stripes_A.gltf': { file: '', scale: 1, rot: 0, kay: .9, extra: 'rugStripes' },
  'home/rug_oval_A.gltf': { file: '', scale: 1, rot: 0, kay: .9, extra: 'rugOval' },
  'home/pictureframe_large_A.gltf': { file: '', scale: 1, rot: 0, kay: .9, extra: 'frameA' },
  'home/pictureframe_large_B.gltf': { file: '', scale: 1, rot: 0, kay: .9, extra: 'frameB' },
  'home/pictureframe_medium.gltf': { file: '', scale: 1, rot: 0, kay: .9, extra: 'frameM' },
  'home/book_set.gltf': { file: '', scale: 1, rot: 0, kay: .9, extra: 'books' },
  'kitchen/fridge_A.gltf': { file: '', scale: 1, rot: 0, kay: .9, extra: 'fridge' },
  'kitchen/kitchencounter_straight_A.gltf': { file: '', scale: 1, rot: 0, kay: .9, extra: 'counter' },
  'kitchen/kitchencounter_sink.gltf': { file: '', scale: 1, rot: 0, kay: .9, extra: 'sink' },
  'kitchen/stove_single.gltf': { file: '', scale: 1, rot: 0, kay: .9, extra: 'stove' },
  'city/box_A.gltf': { file: 'props/cardboard_box_01.glb', scale: 1.6, rot: .2 },
  // Müllcontainer-Platz: Haufen aus Müllsäcken und Kartons statt Spielzeug-Container
  'city/dumpster.gltf': { file: 'props/trashbag.glb', scale: 1.5, rot: 0, parts: [
    ['props/trashbag.glb', .75, 0, .15, 2.1, 1.35], ['props/trashbag.glb', -.7, 0, -.1, 4, 1.4], ['props/trashbag.glb', .2, .62, .05, 1.2, 1.15],
    ['props/cardboard_box_01.glb', -.3, 0, .62, .5, 1.5], ['props/cardboard_box_01.glb', 1.15, 0, -.5, -.3, 1.3]] },
};

/** Zusatzteile je Szene (z. B. Busch aus Laubkarten im Pflanzkübel), von der Welt angemeldet */
export const EXTRAS = new WeakMap<Scene, Record<string, (parent: TransformNode) => void>>();
/** Zusatzteile für alle Szenen (z. B. Möbel aus furniture.ts), beim Start angemeldet */
export const PROCS: Record<string, (parent: TransformNode) => void> = {};

/** Statische Kopie (Gebäude, Requisiten): Instanzen teilen Geometrie und Material */
export async function instance(scene: Scene, path: string, opts: { shadows?: boolean; clone?: boolean } = {}): Promise<TransformNode> {
  const sw = PROP_SWAP[path];
  if (sw) {
    const inner = sw.file ? await instance(scene, sw.file, opts) : new TransformNode(path + '_in', scene), root = new TransformNode(path, scene);
    inner.parent = root; inner.scaling.setAll(sw.scale / (sw.kay ?? KAY)); inner.rotation.y = sw.rot; root.metadata = { swapped: true };
    if (sw.extra) (EXTRAS.get(scene)?.[sw.extra] ?? PROCS[sw.extra])?.(inner);
    for (const [f, x, y, z, r, k] of sw.parts || []) {
      const q = await instance(scene, f, opts); q.parent = root; q.position.set(x / KAY, y / KAY, z / KAY); q.rotation.y = r; q.scaling.setAll(k / KAY);
    }
    return root;
  }
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
  // Ersetzte Bausatz-Teile nicht mehr laden, sondern ihre Ersatzmodelle
  const files = new Set(paths.flatMap((p) => { const sw = PROP_SWAP[p]; return sw ? [sw.file, ...(sw.parts || []).map((q) => q[0])].filter(Boolean) : [p]; }));
  return Promise.all([...files].map((p) => container(scene, p)));
}

/** Alle Meshes unter einem Knoten (für Schattenwurf) */
export function meshesOf(n: TransformNode) { return n.getChildMeshes(false); }
