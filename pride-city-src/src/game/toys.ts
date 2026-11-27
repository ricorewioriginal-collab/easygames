/* Sextoys (18+): Hinterzimmer-Ecke der Boutique, Dildos und Kondome in Größen, Fleshlight und Penisring,
   das Penisring-Mobil für die Straße und comichafte Penis-Silhouetten in der Stadt.
   Alles stilisiert und glitzernd, nie explizit. Ohne „Inhalte ab 18“ gibt es harmlose Ersatzmodelle
   (Donut-Mobil, Herz-Hecken, Herz-Neon, Herz-Wolke). */
import { Mesh, Node3, type Scene, type PBRMaterial } from '../engine/bjs';
import { box, cyl, sphere, torus, pbr, glow, planeZ, canvasTex } from '../engine/geo';
import { worldTex } from '../engine/surfaces';
import type { SaveData } from '../engine/Save';

/* ---------- Katalog ---------- */
export interface Toy { id: string; name: string; icon: string; price: number; text: string; fun: number; size?: string; /** Dildo: Maßstab in der Hand */ scale?: number }
export const DILDOS: Toy[] = [
  { id: 'dildo_s', size: 'S', name: 'Glitzer-Dildo „Pinkie“', icon: '🍆', price: 15, scale: .7, fun: 8, text: 'Klein, fein, passt in jede Clutch.' },
  { id: 'dildo_m', size: 'M', name: 'Glitzer-Dildo „Klassiker“', icon: '🍆', price: 25, scale: 1, fun: 10, text: 'Der Bestseller. Liegt gut in der Hand.' },
  { id: 'dildo_l', size: 'L', name: 'Glitzer-Dildo „Big Bertha Jr.“', icon: '🍆', price: 40, scale: 1.35, fun: 12, text: 'Die kleine Schwester vom Flitzer.' },
  { id: 'dildo_xl', size: 'XL', name: 'Glitzer-Dildo „Monster-Glitzer“', icon: '🍆', price: 60, scale: 1.8, fun: 14, text: 'Für Fortgeschrittene. Und für die Polizei ein Ärgernis.' },
  { id: 'dildo_xxl', size: 'XXL', name: 'Glitzer-Dildo „Regenbogen-Riese“', icon: '🍆', price: 90, scale: 2.5, fun: 16, text: 'Eher Keule als Toy. Zwei Hände empfohlen.' },
];
export const EXTRAS: Toy[] = [
  { id: 'fleshlight', name: 'Glitzer-Fleshlight „Taschenlampe“', icon: '🔦', price: 35, fun: 14, text: 'Sieht aus wie eine Taschenlampe. Ist keine.' },
  { id: 'cockring', name: 'Vibro-Penisring „Kreisel“', icon: '⭕', price: 20, fun: 12, text: 'Mit kleinem Vibro-Ei. Brummt wie ein Kühlschrank.' },
];
export const TOYS = [...DILDOS, ...EXTRAS];
export const CONDOMS: Array<[string, string]> = [['S', 'Knirps'], ['M', 'Standard'], ['L', 'Large'], ['XL', 'Magnum'], ['XXL', 'King Size']];

export const ownsToy = (s: SaveData, id: string) => (s.inv['t_' + id] || 0) > 0;
/** Kaufen: liefert einen Fehlertext oder null */
export function buyToy(s: SaveData, t: Toy): string | null {
  if (s.money < t.price) return `Dafür fehlen dir ${t.price - s.money} €.`;
  s.money -= t.price; s.inv['t_' + t.id] = (s.inv['t_' + t.id] || 0) + 1; s.inv.toy = (s.inv.toy || 0) + 1;
  if (t.size) s.flags.dildo = t.id;
  return null;
}
/** Kondome in deiner Größe (3 Stück); die Größe merkt sich das Spiel */
export function buyCondoms(s: SaveData, size: string): string | null {
  if (s.money < 3) return 'Dafür fehlt dir Geld.';
  s.money -= 3; s.inv.condom = (s.inv.condom || 0) + 3; s.flags.condomSize = size;
  return null;
}
/** „Kondom“ bzw. „Kondom XL“, wenn du eine Größe gewählt hast */
export const condomLabel = (s: SaveData) => (s.flags.condomSize ? `Kondom ${s.flags.condomSize}` : 'Kondom');
/** Dildo-Größen, die du in der Hand halten kannst (der Klassiker gehört ab 18 dazu) */
export const dildoSizes = (s: SaveData) => DILDOS.filter((d) => d.id === 'dildo_m' || ownsToy(s, d.id));
export function dildoNow(s: SaveData) {
  const l = dildoSizes(s); return l.find((d) => d.id === s.flags.dildo) || l.find((d) => d.id === 'dildo_m')!;
}
/** Waffenwerte je Größe: größer = mehr Reichweite und Wucht, ab XL reicht ein Treffer */
export function dildoStats(d: Toy) {
  const k = d.scale || 1;
  return { reach: 1.6 * (1 + (k - 1) * .45), push: .7 * k, hits: k >= 1.8 ? 1 : 2 };
}

/* ---------- Comic-Formen ---------- */
type Put = (m: Mesh, mt: PBRMaterial, x: number, y: number, z: number) => Mesh;
const putter = (root: Node3): Put => (m, mt, x, y, z) => { m.material = mt; m.position.set(x, y, z); m.parent = root; m.isPickable = false; return m; };
/** Stehender Comic-Penis aus Kugeln und Zylinder (Maß s = Schaftlänge), Fuß bei y */
function comic(sc: Scene, P: Put, mt: PBRMaterial, x: number, y: number, z: number, s: number, seg = 12) {
  const r = s * .2;
  for (const sx of [-1, 1]) P(sphere(sc, r * 1.1, seg), mt, x + sx * r * 1.05, y + r * 1.05, z);
  P(cyl(sc, r * .92, r, s, seg), mt, x, y + r * 1.2 + s / 2, z);
  const tip = P(sphere(sc, r * 1.12, seg), mt, x, y + r * 1.2 + s, z); tip.scaling.set(1, .85, 1);
  P(torus(sc, r * .98, r * .16, seg + 4), mt, x, y + r * 1.2 + s * .9, z);
}
/** Herz aus zwei Kugeln und einem Kegel (Spitze unten), Mitte bei y */
function heart(sc: Scene, P: Put, mt: PBRMaterial, x: number, y: number, z: number, s: number, seg = 12) {
  for (const sx of [-1, 1]) P(sphere(sc, s * .32, seg), mt, x + sx * s * .26, y + s * .12, z);
  const c = P(cyl(sc, s * .55, 0, s * .7, seg), mt, x, y - s * .3, z); c.scaling.z = .6;
}

/* ---------- Penisring-Mobil (18+) bzw. Donut-Mobil ---------- */
/** Einrad-Mobil: riesiger aufrecht rollender Ring, du sitzt mittendrin. Das Rad heißt „wheel“ (dreht beim Fahren). */
export function buildRingMobil(sc: Scene, root: Node3, adult: boolean) {
  root.getChildMeshes().forEach((m) => m.dispose());
  root.getChildTransformNodes().forEach((n) => n.dispose());
  root.metadata = { adult };
  const P = putter(root), R = 1.25;
  const wheel = new Node3('wheel', sc); wheel.parent = root; wheel.position.y = R + .3;
  const W: Put = (m, mt, x, y, z) => { m.material = mt; m.position.set(x, y, z); m.parent = wheel; m.isPickable = false; return m; };
  const main = adult ? pbr(sc, 0xff4fa3, .22, .1, { emissive: 0xff2f8a, ei: .22 }) : pbr(sc, 0xd99a5b, .7);
  const ring = W(torus(sc, R, .3, 40), main, 0, 0, 0); ring.rotation.z = Math.PI / 2;
  if (adult) {
    // Glitzersteinchen ringsum und ein kleines Vibro-Ei oben auf dem Ring (brummt beim Fahren)
    const glit = glow(sc, 0xfff0fa, 1.3);
    for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; W(sphere(sc, .07, 6), glit, (i % 2 ? .22 : -.22), Math.cos(a) * R, Math.sin(a) * R); }
    const egg = P(sphere(sc, .32, 14), pbr(sc, 0xb56bff, .2, .3, { emissive: 0x8a3bff, ei: .3 }), 0, R * 2 + .55, 0); egg.scaling.set(.8, .8, 1.3); egg.name = 'egg';
  } else {
    // Zuckerguss und Streusel: ein Riesen-Donut
    const icing = W(torus(sc, R, .31, 40), pbr(sc, 0xff8ad8, .4), .06, 0, 0); icing.rotation.z = Math.PI / 2; icing.scaling.set(.7, 1, 1);
    const cols = [0xff3b3b, 0xffd23b, 0x3ee69a, 0x3a7bff, 0xffffff];
    for (let i = 0; i < 22; i++) { const a = i * 2.39, s = W(box(sc, .05, .05, .16), pbr(sc, cols[i % 5], .5), .26, Math.cos(a) * (R + (i % 3 - 1) * .12), Math.sin(a) * (R + (i % 3 - 1) * .12)); s.rotation.x = a; }
  }
  // Sitz mit Gabel: hängt in der Mitte, dreht nicht mit
  const frame = pbr(sc, 0xe8e8f0, .3, .8);
  P(box(sc, .55, .12, .6), pbr(sc, 0x1a1a22, .6), 0, .62, 0);
  for (const sx of [-1, 1]) { const f = P(cyl(sc, .045, .045, R * 2 + .1, 8), frame, sx * .4, R + .3, 0); f.rotation.z = 0; }
  P(cyl(sc, .06, .06, .9, 8), frame, 0, R + .3, 0).rotation.z = Math.PI / 2;
  // Scheinwerfer vorn
  P(sphere(sc, .12, 8), glow(sc, 0xfff6d0, 1.4), 0, .9, .55);
}

/* ---------- Penis-Silhouetten in der Stadt (18+) bzw. Herzen ---------- */
function neonTex(sc: Scene, adult: boolean) {
  return canvasTex(sc, 256, 256, (g) => {
    g.clearRect(0, 0, 256, 256); g.lineCap = 'round'; g.lineJoin = 'round';
    const line = (c: string, w: number, blur: number) => { g.strokeStyle = c; g.lineWidth = w; g.shadowColor = c; g.shadowBlur = blur; };
    g.beginPath();
    if (adult) {
      // Umriss: zwei Kugeln unten, Schaft, runde Spitze
      g.arc(98, 196, 34, Math.PI * .5, Math.PI * 1.75); g.lineTo(108, 70);
      g.arc(128, 66, 22, Math.PI, 0); g.lineTo(148, 166);
      g.arc(158, 196, 34, Math.PI * 1.25, Math.PI * .5); g.moveTo(98, 230); g.lineTo(158, 230);
      g.moveTo(110, 84); g.quadraticCurveTo(128, 92, 146, 84);
    } else {
      g.moveTo(128, 222); g.bezierCurveTo(30, 150, 50, 50, 128, 90); g.bezierCurveTo(206, 50, 226, 150, 128, 222);
    }
    line('#ff4fd8', 14, 22); g.stroke(); line('#ffe6fa', 5, 6); g.stroke();
  }, true);
}
function graffitiTex(sc: Scene, adult: boolean) {
  return canvasTex(sc, 512, 256, (g) => {
    g.fillStyle = '#5a5f6a'; g.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(0,0,0,${.05 + (i % 5) * .02})`; g.fillRect((i * 97) % 512, (i * 53) % 256, 30, 6); }
    const cols = ['#ff3b3b', '#ff8a3b', '#ffd23b', '#3ee69a', '#3a7bff', '#b56bff'];
    cols.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, 196 + i * 10, 512, 10); });
    g.lineWidth = 8; g.strokeStyle = '#111'; g.lineJoin = 'round';
    if (adult) {
      // Comic-Penis mit Sonnenbrille und Lächeln
      g.fillStyle = '#ff8ad8';
      g.beginPath(); g.arc(205, 160, 40, 0, Math.PI * 2); g.arc(275, 160, 40, 0, Math.PI * 2); g.fill(); g.stroke();
      g.beginPath(); g.roundRect(208, 30, 64, 140, 32); g.fill(); g.stroke();
      g.fillStyle = '#111'; g.fillRect(212, 70, 26, 14); g.fillRect(244, 70, 26, 14); g.fillRect(236, 74, 10, 4);
      g.beginPath(); g.arc(240, 100, 14, .2, Math.PI - .2); g.stroke();
    } else {
      g.fillStyle = '#ff4fa3'; g.beginPath(); g.moveTo(240, 190); g.bezierCurveTo(150, 130, 170, 40, 240, 80); g.bezierCurveTo(310, 40, 330, 130, 240, 190); g.fill(); g.stroke();
    }
    g.font = 'bold 40px Impact, sans-serif'; g.fillStyle = '#fff'; g.strokeStyle = '#111'; g.lineWidth = 6; g.textAlign = 'center';
    const t = adult ? 'SIZE QUEEN' : 'LOVE WINS';
    g.strokeText(t, 398, 110); g.fillText(t, 398, 110);
    g.font = 'bold 34px Impact, sans-serif'; g.strokeText('PRIDE', 398, 160); g.fillText('PRIDE', 398, 160);
  });
}

/** Wo die Silhouetten stehen (Innenstadt, Park, Kai, Hochstadt) */
export const SPOTS = {
  hedges: [[39, 36.4, 0], [45, 36.4, 0], [51, 36.4, 0]] as Array<[number, number, number]>,
  neon: [[9, -44, -Math.PI / 2], [-9, -36, Math.PI / 2], [139, 34, Math.PI]] as Array<[number, number, number]>,
  graffiti: [[34.9, 45, -Math.PI / 2], [-60, 41.4, Math.PI]] as Array<[number, number, number]>,
  cloud: [-4, 26, -52] as [number, number, number],
};

/** Baut beide Fassungen; CityScene schaltet je nach 18+ eine davon sichtbar. Alles zusammengefasst und eingefroren. */
export function buildSilhouettes(sc: Scene, parent: Node3, low: boolean) {
  const out = { adult: new Node3('sil18', sc), safe: new Node3('silSafe', sc) };
  const seg = low ? 8 : 12;
  for (const adult of [true, false]) {
    const root = adult ? out.adult : out.safe; root.parent = parent;
    const P = putter(root), byMat = new Map<PBRMaterial, Mesh[]>();
    const before = new Set(root.getChildMeshes());
    // Hecken-Figuren im Regenbogenpark
    // Foto-Laub (Hecke) und Beton-Kübel statt glatter Farben
    const leaf = pbr(sc, 0xffffff, .95), pot = pbr(sc, 0xc9c4bc, .85);
    { const t = worldTex(sc, 'hedge_col.jpg').clone(); t.uScale = t.vScale = 3; leaf.albedoTexture = t;
      const c = worldTex(sc, 'asphalt_col.jpg').clone(); c.uScale = c.vScale = .5; pot.albedoTexture = c; pot.albedoColor.set(2.2, 2.15, 2.05); }
    for (const [x, z] of SPOTS.hedges) {
      P(box(sc, 1.6, .5, 1.6), pot, x, .35, z);
      if (adult) comic(sc, P, leaf, x, .6, z, 2.6, seg); else heart(sc, P, leaf, x, 2.1, z, 2.2, seg);
    }
    // Wolke über der Stadt
    const cloud = glow(sc, 0xfff4fb, .95);
    const [cx, cy, cz] = SPOTS.cloud, cr = new Node3('cloud', sc); cr.parent = root; cr.position.set(cx, cy, cz); cr.rotation.z = adult ? -.5 : 0;
    const C = putter(cr);
    if (adult) { comic(sc, C, cloud, 0, 0, 0, 14, seg); for (let i = 0; i < 6; i++) C(sphere(sc, 2.4 + (i % 3), seg), cloud, (i - 2.5) * 3.4, -1 + (i % 2) * 2, 1.5); }
    else { heart(sc, C, cloud, 0, 8, 0, 16, seg); for (let i = 0; i < 6; i++) C(sphere(sc, 2.4 + (i % 3), seg), cloud, (i - 2.5) * 3.4, -1 + (i % 2) * 2, 1.5); }
    // Neonschilder an Masten (Kopfkino, Haus Rosa, Neonplatz)
    const nt = neonTex(sc, adult), nm = glow(sc, 0xffffff, 1.5, { tex: nt, double: true }), post = pbr(sc, 0x2a2a33, .5, .7);
    for (const [x, z, yaw] of SPOTS.neon) {
      P(cyl(sc, .07, .07, 3.4, 8), post, x, 1.7, z);
      const pl = P(planeZ(sc, 2.4, 2.4, true), nm, x, 4.4, z); pl.rotation.y = yaw;
    }
    // Graffiti auf Bauzäunen
    const gm = pbr(sc, 0xffffff, .9, 0, { double: true }); gm.albedoTexture = graffitiTex(sc, adult);
    for (const [x, z, yaw] of SPOTS.graffiti) {
      const pl = P(planeZ(sc, 6, 3, true), gm, x, 1.6, z); pl.rotation.y = yaw;
      for (const k of [-3, 3]) P(box(sc, .12, 3.2, .12), post, x + Math.cos(yaw) * k, 1.6, z - Math.sin(yaw) * k);
    }
    // gleiche Materialien zusammenfassen: wenige Zeichenaufrufe, am Handy schonend
    for (const m of root.getChildMeshes()) { if (before.has(m) || !m.material) continue; const k = m.material as PBRMaterial; (byMat.get(k) || byMat.set(k, []).get(k)!).push(m as Mesh); }
    for (const [mt, list] of byMat) {
      let fin: Mesh[] = list;
      if (list.length > 1 && mt !== nm && mt !== gm) try { const mg = Mesh.MergeMeshes(list, true, true); if (mg) { mg.material = mt; mg.parent = root; fin = [mg]; } } catch { /* einzeln lassen */ }
      for (const m of fin) { m.isPickable = false; m.computeWorldMatrix(true); m.freezeWorldMatrix(); m.doNotSyncBoundingInfo = true; }
    }
    root.setEnabled(false);
  }
  return out;
}
