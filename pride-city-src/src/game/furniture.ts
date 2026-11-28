/* Küche, Bett und Stehlampe statt KayKit-Spielzeug: maßstäblich nachgebaut wie moderne Möbel
   (weiße Lackfronten, Arbeitsplatte aus Marmor ambientCG Marble016, Edelstahl, Bettwäsche aus Leinen Fabric001,
   Polster aus Samt Fabric003; CC0). Maße in Metern, Front zeigt nach +z, Mitte auf dem Ursprung, Fuß bei y = 0.
   Je Szene einmal gebaut (ein Netz je Material) und als Instanzen verteilt. */
import { Color3, type Mesh, type Scene, type TransformNode, type AbstractMesh } from '../engine/bjs';
import { box, cyl, pbr } from '../engine/geo';
import { PROCS } from '../engine/Assets';
import { photo, merge } from './streetprops';

type Parts = Array<[Mesh, string]>;   // Teil + Materialschlüssel
const cache = new WeakMap<Scene, Map<string, Mesh[]>>();
const mats = new WeakMap<Scene, Record<string, ReturnType<typeof pbr>>>();

function M(sc: Scene) {
  let m = mats.get(sc);
  if (!m) {
    m = {
      lack: pbr(sc, 0xf1efea, .32), plinth: pbr(sc, 0x2b2b2e, .7), steel: pbr(sc, 0xd9dcdf, .3, .55), dark: pbr(sc, 0x3a3c40, .3, .8),
      glass: pbr(sc, 0x0b0b0e, .06, .1), ring: pbr(sc, 0x2c2c31, .3), top: photo(sc, 'worktop', 'marble', 2.4, .9, new Color3(1, 1, 1), .18),
      linen: photo(sc, 'linen', 'linen', 2, 2, new Color3(1, 1, 1), .95), duvet: photo(sc, 'duvet', 'linen', 2.5, 2, new Color3(.86, .88, .95), .95),
      velvet: photo(sc, 'velvet', 'velvet', 2, 2, new Color3(1.05, 1.05, 1.1), .85), shade: photo(sc, 'shade', 'linen', 2, 1, new Color3(1.05, 1, .9), .9),
    };
    m.shade.backFaceCulling = false; m.shade.emissiveColor = new Color3(.25, .2, .12);
    mats.set(sc, m);
  }
  return m;
}
const at = (m: Mesh, x: number, y: number, z: number, rx = 0) => { m.position.set(x, y, z); m.rotation.x = rx; return m; };

/** Unterschrank 1,8 m mit Arbeitsplatte; kind: Spüle, Kochfeld mit Backofen oder schlicht */
function counter(sc: Scene, kind: 'counter' | 'sink' | 'stove'): Parts {
  const W = 1.8, D = .62, z = D / 2, p: Parts = [];
  p.push([at(box(sc, W - .02, .1, D - .1), 0, .05, -.04), 'plinth'], [at(box(sc, W - .02, .77, D - .04), 0, .485, -.02), 'lack']);
  p.push([at(box(sc, W, .04, D), 0, .89, 0), 'top']);
  const door = (x: number, w: number) => { p.push([at(box(sc, w - .006, .74, .02), x, .48, z - .02), 'lack'], [at(box(sc, .22, .014, .022), x, .8, z + .005), 'steel']); };
  if (kind === 'stove') {
    door(-.6, .6); door(.6, .6);
    p.push([at(box(sc, .6, .52, .022), 0, .4, z - .02), 'glass'], [at(box(sc, .5, .02, .03), 0, .69, z + .01), 'steel'], [at(box(sc, .6, .1, .022), 0, .79, z - .02), 'dark']);
    p.push([at(box(sc, .62, .008, .52), 0, .913, 0), 'glass']);
    for (const [x, zz, r] of [[-.15, -.12, .1], [.15, -.12, .08], [-.15, .12, .08], [.15, .12, .1]]) p.push([at(cyl(sc, r, r, .002, 24), x, .918, zz), 'ring']);
  } else {
    door(-.45, .9); door(.45, .9);
    if (kind === 'sink') {
      p.push([at(box(sc, .58, .006, .44), .1, .912, -.01), 'steel'], [at(box(sc, .5, .006, .36), .1, .914, -.01), 'dark']);
      p.push([at(cyl(sc, .025, .03, .32, 12), .1, 1.07, -.25), 'steel'], [at(box(sc, .03, .03, .22), .1, 1.22, -.15), 'steel'], [at(cyl(sc, .018, .018, .05, 10), .1, 1.19, -.05), 'steel']);
    }
  }
  return p;
}
function fridge(sc: Scene): Parts {
  const W = .7, D = .68, z = D / 2;
  return [
    [at(box(sc, W, 1.85, D - .04), 0, .925, -.02), 'steel'], [at(box(sc, W - .01, .012, .01), 0, .7, z), 'dark'],
    [at(box(sc, .03, .5, .04), W / 2 - .07, 1.2, z + .02), 'dark'], [at(box(sc, .4, .03, .04), 0, .62, z + .02), 'dark'],
    [at(box(sc, .12, .05, .006), -.18, 1.6, z + .002), 'glass'],
  ];
}
function bed(sc: Scene): Parts {
  const p: Parts = [];
  for (const [x, z] of [[-.85, -.95], [.85, -.95], [-.85, 1], [.85, 1]]) p.push([at(box(sc, .07, .08, .07), x, .04, z), 'dark']);
  p.push([at(box(sc, 1.86, .3, 2.12), 0, .23, .02), 'velvet'], [at(box(sc, 1.94, 1.08, .1), 0, .62, -1.08), 'velvet']);
  p.push([at(box(sc, 1.76, .2, 2.0), 0, .48, .03), 'linen'], [at(box(sc, 1.84, .07, 1.45), 0, .6, .33), 'duvet']);
  for (const e of [-1, 1]) p.push([at(box(sc, .03, .26, 1.45), e * .925, .5, .33), 'duvet']);
  p.push([at(box(sc, 1.84, .26, .03), 0, .5, 1.06), 'duvet']);
  for (const x of [-.43, .43]) p.push([at(box(sc, .66, .15, .42), x, .65, -.72, -.35), 'linen']);
  return p;
}
function floorLamp(sc: Scene): Parts {
  return [
    [at(cyl(sc, .17, .18, .03, 24), 0, .015, 0), 'dark'], [at(cyl(sc, .012, .012, 1.42, 8), 0, .74, 0), 'steel'],
    [at(cyl(sc, .17, .23, .3, 28, false), 0, 1.5, 0), 'shade'],
  ];
}
const BUILD: Record<string, (sc: Scene) => Parts> = { counter: (s) => counter(s, 'counter'), sink: (s) => counter(s, 'sink'), stove: (s) => counter(s, 'stove'), fridge, bed, floorLamp };

function sources(sc: Scene, kind: string) {
  let c = cache.get(sc); if (!c) cache.set(sc, (c = new Map()));
  let out = c.get(kind);
  if (!out) {
    const parts = BUILD[kind](sc), m = M(sc), by = new Map<string, Mesh[]>();
    for (const [mesh, k] of parts) { if (!by.has(k)) by.set(k, []); by.get(k)!.push(mesh); }
    out = [...by].map(([k, ms]) => { const g = merge(ms, kind + '_' + k); g.material = m[k]; g.isVisible = false; g.isPickable = false; g.receiveShadows = true; return g; });
    c.set(kind, out);
  }
  return out;
}
for (const kind of Object.keys(BUILD)) {
  PROCS[kind] = (parent: TransformNode) => {
    for (const s of sources(parent.getScene(), kind)) { const i = s.createInstance(kind); i.parent = parent; (i as AbstractMesh & { _pcCast?: boolean })._pcCast = true; }
  };
}
