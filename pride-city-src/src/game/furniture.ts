/* Küche, Bett und Stehlampe statt KayKit-Spielzeug: maßstäblich nachgebaut wie moderne Möbel
   (weiße Lackfronten, Arbeitsplatte aus Marmor ambientCG Marble016, Edelstahl, Bettwäsche aus Leinen Fabric001,
   Polster aus Samt Fabric003; CC0). Maße in Metern, Front zeigt nach +z, Mitte auf dem Ursprung, Fuß bei y = 0.
   Je Szene einmal gebaut (ein Netz je Material) und als Instanzen verteilt. */
import { Color3, PBRMaterial, type Mesh, type Scene, type TransformNode, type AbstractMesh } from '../engine/bjs';
import { box, cyl, pbr, canvasTex } from '../engine/geo';
import { PALETTES } from './palettes';
import { PROCS } from '../engine/Assets';
import { photo, merge } from './streetprops';

type Parts = Array<[Mesh, string]>;   // Teil + Materialschlüssel
const cache = new WeakMap<Scene, Map<string, Mesh[]>>();
const mats = new WeakMap<Scene, Record<string, PBRMaterial>>();

/** Abstraktes Gemälde (Pinselstriche in Pride-Farben auf Leinwand), aspect = Breite/Höhe */
function art(sc: Scene, seed: number, aspect: number) {
  const W = 256 * aspect, H = 256; let r = seed * 9301 + 49297; const rnd = () => ((r = (r * 16807) % 2147483647) / 2147483647);
  const t = canvasTex(sc, W, H, (g) => {
    g.fillStyle = '#efe9df'; g.fillRect(0, 0, W, H);
    const cs = PALETTES[0].colors;
    for (let i = 0; i < 26; i++) {
      g.globalAlpha = .35 + rnd() * .5; g.strokeStyle = cs[Math.floor(rnd() * cs.length)]; g.lineWidth = 6 + rnd() * 28; g.lineCap = 'round';
      g.beginPath(); const x = rnd() * W, y = rnd() * H; g.moveTo(x, y); g.bezierCurveTo(x + (rnd() - .5) * W, y + (rnd() - .5) * H, x + (rnd() - .5) * W, y + (rnd() - .5) * H, rnd() * W, rnd() * H); g.stroke();
    }
    g.globalAlpha = .06; for (let i = 0; i < 1500; i++) { g.fillStyle = rnd() < .5 ? '#000' : '#fff'; g.fillRect(rnd() * W, rnd() * H, 1, 1); }
  });
  const m = new PBRMaterial('art' + seed, sc); m.albedoTexture = t; m.roughness = .85; m.metallic = 0;
  return m;
}

function M(sc: Scene) {
  let m = mats.get(sc) as Record<string, PBRMaterial> | undefined;
  if (!m) {
    m = {
      lack: pbr(sc, 0xf1efea, .32), plinth: pbr(sc, 0x2b2b2e, .7), steel: pbr(sc, 0xd9dcdf, .3, .55), dark: pbr(sc, 0x3a3c40, .3, .8),
      glass: pbr(sc, 0x0b0b0e, .06, .1), ring: pbr(sc, 0x2c2c31, .3), top: photo(sc, 'worktop', 'marble', 2.4, .9, new Color3(1, 1, 1), .18),
      linen: photo(sc, 'linen', 'linen', 2, 2, new Color3(1, 1, 1), .95), duvet: photo(sc, 'duvet', 'linen', 2.5, 2, new Color3(.86, .88, .95), .95),
      velvet: photo(sc, 'velvet', 'velvet', 2, 2, new Color3(1.05, 1.05, 1.1), .85), shade: photo(sc, 'shade', 'linen', 2, 1, new Color3(1.05, 1, .9), .9),
    };
    m.frame = pbr(sc, 0x1c1714, .45); m.mat = pbr(sc, 0xf4f1ea, .9); m.wool = photo(sc, 'wool', 'linen', 6, 4, new Color3(.62, .58, .55), .95);
    PALETTES[0].colors.forEach((c, i) => { const t = photo(sc, 'woolP' + i, 'linen', 6, 1, Color3.FromHexString(c).toLinearSpace().scale(1.1), .95); m!['stripe' + i] = t; });
    for (const [k, seed] of [['artA', 3], ['artB', 7], ['artM', 11]] as const) m[k] = art(sc, seed, k === 'artB' ? 2 : 1);
    ['#7a2e3a', '#1f3b5c', '#2f5d3a', '#c9b27c', '#3b3b3b', '#8a5a2b'].forEach((c, i) => { m!['book' + i] = pbr(sc, c, .6); });
    m.paper = pbr(sc, 0xefe8d8, .9);
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
/** Teppich 2,7 × 1,8 m: schlicht, gestreift (Regenbogen) oder oval */
function rug(sc: Scene, kind: 'plain' | 'stripes' | 'oval'): Parts {
  if (kind === 'oval') { const o = cyl(sc, .9, .9, .012, 40); o.scaling.x = 1.5; o.position.y = .006; o.bakeCurrentTransformIntoVertices(); return [[o, 'wool']]; }
  if (kind === 'plain') return [[at(box(sc, 2.7, .012, 1.8), 0, .006, 0), 'wool']];
  return PALETTES[0].colors.map((_c, i, a) => [at(box(sc, 2.7, .012, 1.8 / a.length), 0, .006, -.9 + (i + .5) * 1.8 / a.length), 'stripe' + i] as [Mesh, string]);
}
/** Bilderrahmen (Rückseite bei z = 0, Mitte in y) mit Passepartout und Gemälde */
function frame(sc: Scene, w: number, h: number, art: string): Parts {
  const p: Parts = [[at(box(sc, w, h, .04), 0, 0, .02), 'frame'], [at(box(sc, w - .08, h - .08, .006), 0, 0, .043), 'mat']];
  const a = box(sc, w - .22, h - .22, .004); at(a, 0, 0, .047); p.push([a, art]);
  return p;
}
/** Bücherreihe (Mitte in y wie beim Bausatz) */
function books(sc: Scene): Parts {
  const p: Parts = []; let x = -.33, i = 0;
  while (x < .31) {
    const t = .03 + ((i * 7) % 5) * .008, h = .3 + ((i * 5) % 4) * .035, d = .2 + ((i * 3) % 3) * .02, y = -.2 + h / 2;
    p.push([at(box(sc, t, h, d), x + t / 2, y, 0), 'book' + (i % 6)], [at(box(sc, t - .006, h - .012, .004), x + t / 2, y, -d / 2 - .001), 'paper']);
    x += t + .002; i++;
  }
  return p;
}
const BUILD: Record<string, (sc: Scene) => Parts> = {
  rug: (s) => rug(s, 'plain'), rugStripes: (s) => rug(s, 'stripes'), rugOval: (s) => rug(s, 'oval'), books,
  frameA: (s) => frame(s, .91, 1.08, 'artA'), frameB: (s) => frame(s, 1.8, 1.08, 'artB'), frameM: (s) => frame(s, .63, .81, 'artM'), counter: (s) => counter(s, 'counter'), sink: (s) => counter(s, 'sink'), stove: (s) => counter(s, 'stove'), fridge, bed, floorLamp };

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
