/* Szene-Looks für die Menschen von Rainbow City: Die Rocketbox-Figuren tragen Alltagskleidung. Damit die Straßen nach
   Pride aussehen, malen wir Oberteile in Flaggenfarben, Glitzer, Leder mit Harness, bauchfreie Tops und färben Haare
   in Neonfarben. Gemalt wird in der Textur der einzelnen Figur, die Streifen folgen der Körperhöhe (nicht der
   Textur-Anordnung), deshalb klappt es bei jeder Figur. Läuft nach dem Outfit (outfit.ts) und baut darauf auf. */
import { RawTexture, Texture, type Mesh, type PBRMaterial, type Scene, type AbstractMesh } from '../engine/bjs';
import { palette } from './palettes';

export interface StyleDef {
  name: string;
  /** Oberteil: Flagge (Paletten-ID), Glitzer (Farbe), Leder mit Harness oder Netzshirt */
  top?: { flag: string; crop?: boolean } | { glitter: number; crop?: boolean } | 'harness' | 'leather';
  /** Hose: feste Farbe oder Glitzer */
  legs?: number | { glitter: number };
  /** Haarfarbe (gefärbt) */
  hair?: number;
}
export const STYLES: Record<string, StyleDef> = {
  regenbogen: { name: 'Regenbogen-Shirt', top: { flag: 'rainbow' } },
  progress: { name: 'Progress-Shirt', top: { flag: 'progress' }, hair: 0x9b5cff },
  trans: { name: 'Trans-Farben', top: { flag: 'trans' }, hair: 0x5bcefa },
  bi: { name: 'Bi-Farben', top: { flag: 'bi' }, hair: 0xd60270 },
  lesbisch: { name: 'Lesbische Flagge', top: { flag: 'lesbian' }, hair: 0xff7a3c },
  pan: { name: 'Pan-Farben', top: { flag: 'pan' }, hair: 0xffd800 },
  enby: { name: 'Nichtbinär', top: { flag: 'nonbinary' }, hair: 0x9c59d1 },
  bear: { name: 'Bear', top: { flag: 'bear' } },
  crop: { name: 'Bauchfrei in Regenbogen', top: { flag: 'rainbow', crop: true }, hair: 0xff4fb0 },
  leder: { name: 'Leder und Harness', top: 'harness', legs: 0x15151a },
  lederjacke: { name: 'Ganz in Leder', top: 'leather', legs: 0x15151a },
  glitzer: { name: 'Glitzer in Pink', top: { glitter: 0xff2fd2 }, legs: { glitter: 0x8a2bff }, hair: 0xff4fb0 },
  gold: { name: 'Gold-Pailletten', top: { glitter: 0xffc400 }, legs: 0x15151a, hair: 0x4fc3ff },
  drag: { name: 'Drag in Türkis', top: { glitter: 0x00e5d0, crop: true }, legs: { glitter: 0xff2fd2 }, hair: 0xb57bff },
  neon: { name: 'Neon-Haare', hair: 0x3ee69a },
  pink: { name: 'Pinke Haare', hair: 0xff4fb0 },
};
export const STYLE_IDS = Object.keys(STYLES);

type Zone = 'torso' | 'arm' | 'leg' | 'hand' | 'other';
const zoneOf = (bone: string): Zone => {
  const b = bone.replace(/^Bip0\d ?/, '');
  if (/Hand|Finger/.test(b)) return 'hand';
  if (/Spine|Clavicle/.test(b)) return 'torso';
  if (/UpperArm|Forearm/.test(b)) return 'arm';
  if (/Thigh|Calf/.test(b)) return 'leg';
  return 'other';
};
const rgb = (c: number) => [(c >> 16) & 255, (c >> 8) & 255, c & 255];
const hex = (s: string) => rgb(parseInt(s.slice(1), 16));
/** fester Zufall je Texel (für Pailletten) */
const spark = (x: number, y: number) => { let h = Math.imul(x * 374761393 + y * 668265263, 1274126177); h ^= h >>> 15; return (h >>> 0) / 4294967296; };

const cache = new Map<string, Promise<Texture | null>>();
const skins = new Map<string, number[]>();
type Mat = PBRMaterial & { _orig?: PBRMaterial; _style?: string };

/** Look auf die Figur malen; base = Schlüssel des Outfits darunter (für den Zwischenspeicher) */
export async function applyStyle(scene: Scene, root: AbstractMesh | { getChildMeshes(): AbstractMesh[] }, id: string, style: string | undefined, base: string) {
  const def = style ? STYLES[style] : undefined;
  const meshes = root.getChildMeshes().filter((m) => (m as Mesh).skeleton && m.material) as Mesh[];
  // Kopf und Strähnen immer vom Original aus färben (der Körper kommt frisch aus outfit.ts)
  for (const m of meshes) { const mm = m.material as Mat; if (mm._orig && mm._style && mm._style !== style && !/_body$/.test(mm._orig.name)) { m.material = mm._orig; mm.dispose(); } }
  if (!def) return;
  const order = (m: Mesh) => (/_body/.test(((m.material as Mat)._orig || m.material!).name) ? 0 : 1);
  for (const m of meshes.sort((a, b) => order(a) - order(b))) {   // Körper zuerst: dort wird die Hautfarbe gemessen
    const mm = m.material as Mat, orig = mm._orig || mm;
    if (mm._style === style) continue;
    const kind = /_body$/.test(orig.name) ? 'body' : /_head$/.test(orig.name) ? 'head' : /_opacity$/.test(orig.name) ? 'strands' : '';
    if (!kind || (kind === 'body' && !def.top && def.legs === undefined) || (kind !== 'body' && def.hair === undefined)) continue;
    const key = [id, base, style, kind].join('|');
    let job = cache.get(key);
    if (!job) { job = (kind === 'body' ? body(scene, m, mm, def, id) : head(scene, m, mm, def.hair!, id, kind === 'strands')).catch(() => null); cache.set(key, job); }
    const tex = await job; if (!tex) continue;
    const nm = mm.clone(orig.name + '_' + style) as Mat;
    nm._orig = orig; nm._style = style; nm.albedoTexture = tex;
    if (kind === 'strands') nm.opacityTexture = tex;
    if (mm._orig) mm.dispose();
    m.material = nm;
  }
}

/** größte Kante der gemalten Textur */
const MAX = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches ? 512 : 1024;
interface Geo { w: number; h: number; data: Uint8Array; src: Uint8Array; uv: Float32Array | number[]; idx: ArrayLike<number>; pos: Float32Array | number[]; bone: (v: number) => string; up: number; side: number; depth: number; srcTex: Texture }
async function geo(m: Mesh, mat: PBRMaterial): Promise<Geo | null> {
  const srcTex = mat.albedoTexture as Texture | null; if (!srcTex) return null;
  const { width: w0, height: h0 } = srcTex.getSize();
  // Auslesen darf nie hängen bleiben (manche Handys antworten nicht): nach 4 s ohne Look weiter
  const px = await Promise.race([srcTex.readPixels(), new Promise<null>((r) => setTimeout(() => r(null), 4000))]); if (!px) return null;
  // kleiner malen: spart am Handy sehr viel Grafikspeicher (sonst je Figur mehrere volle Texturen)
  const f = Math.max(1, Math.ceil(Math.max(w0, h0) / MAX)), w = Math.max(1, Math.floor(w0 / f)), h = Math.max(1, Math.floor(h0 / f));
  const full = new Uint8Array(px.buffer, px.byteOffset, w0 * h0 * 4), data = new Uint8Array(w * h * 4);
  if (f === 1) data.set(full);
  else for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let r = 0, g = 0, b = 0, al = 0;
    for (let j = 0; j < f; j++) for (let i = 0; i < f; i++) { const o = ((y * f + j) * w0 + x * f + i) * 4; r += full[o]; g += full[o + 1]; b += full[o + 2]; al += full[o + 3]; }
    const o = (y * w + x) * 4, n = f * f; data[o] = r / n; data[o + 1] = g / n; data[o + 2] = b / n; data[o + 3] = al / n;
  }
  const uv = m.getVerticesData('uv'), idx = m.getIndices(), pos = m.getVerticesData('position'), mi = m.getVerticesData('matricesIndices'), mw = m.getVerticesData('matricesWeights'), sk = m.skeleton;
  if (!uv || !idx || !pos || !mi || !mw || !sk) return null;
  const names: string[] = []; sk.bones.forEach((b) => { names[b.getIndex()] = b.name; });
  const bone = (v: number) => { let best = 0, bw = -1; for (let k = 0; k < 4; k++) if (mw[v * 4 + k] > bw) { bw = mw[v * 4 + k]; best = mi[v * 4 + k]; } return names[best] || ''; };
  // Achsen aus der Figur selbst: die längste ist oben/unten, die kürzeste vorne/hinten
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (let i = 0; i < pos.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], pos[i + k]); hi[k] = Math.max(hi[k], pos[i + k]); }
  const ext = [0, 1, 2].map((k) => hi[k] - lo[k]), ax = [0, 1, 2].sort((a, b) => ext[b] - ext[a]);
  return { w, h, data, src: new Uint8Array(data), uv, idx, pos, bone, up: ax[0], side: ax[1], depth: ax[2], srcTex };
}
function finish(scene: Scene, g: Geo, alpha = false) {
  const t = RawTexture.CreateRGBATexture(g.data, g.w, g.h, scene, true, false, Texture.TRILINEAR_SAMPLINGMODE);
  const s = g.srcTex;
  t.wrapU = s.wrapU; t.wrapV = s.wrapV; t.hasAlpha = alpha || s.hasAlpha;
  (t as Texture & { _invertY?: boolean })._invertY = (s as Texture & { _invertY?: boolean })._invertY;
  t.uScale = s.uScale; t.vScale = s.vScale; t.uOffset = s.uOffset; t.vOffset = s.vOffset; t.coordinatesIndex = s.coordinatesIndex;
  return t;
}
const texel = (g: Geo, v: number) => { const x = Math.min(g.w - 1, Math.max(0, Math.round(g.uv[v * 2] * g.w))), y = Math.min(g.h - 1, Math.max(0, Math.round(g.uv[v * 2 + 1] * g.h))); return (y * g.w + x) * 4; };

/** Dreieck füllen; col bekommt Höhe t, Seite s (je 0 … 1 bzw. −1 … 1), Texel und Helligkeit des Originals */
function tri(g: Geo, a: number, b: number, c: number, val: (v: number) => [number, number], col: (t: number, s: number, x: number, y: number, lum: number) => number[] | null) {
  const { w, h, uv, data: d, src } = g;
  const A = [uv[a * 2] * w, uv[a * 2 + 1] * h], B = [uv[b * 2] * w, uv[b * 2 + 1] * h], C = [uv[c * 2] * w, uv[c * 2 + 1] * h];
  const area = (B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1]); if (Math.abs(area) < 1e-6) return;
  const va = val(a), vb = val(b), vc = val(c);
  const minX = Math.max(0, Math.floor(Math.min(A[0], B[0], C[0]) - 1)), maxX = Math.min(w - 1, Math.ceil(Math.max(A[0], B[0], C[0]) + 1));
  const minY = Math.max(0, Math.floor(Math.min(A[1], B[1], C[1]) - 1)), maxY = Math.min(h - 1, Math.ceil(Math.max(A[1], B[1], C[1]) + 1));
  for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
    const px = x + .5, py = y + .5;
    let u = ((B[0] - px) * (C[1] - py) - (C[0] - px) * (B[1] - py)) / area, v = ((C[0] - px) * (A[1] - py) - (A[0] - px) * (C[1] - py)) / area, q = 1 - u - v;
    if (u < -.06 || v < -.06 || q < -.06) continue;   // kleiner Rand gegen Nähte
    u = Math.max(0, u); v = Math.max(0, v); q = Math.max(0, q); const n = u + v + q; u /= n; v /= n; q /= n;
    const o = (y * w + x) * 4, lum = (src[o] + src[o + 1] + src[o + 2]) / 765;
    const k = col(u * va[0] + v * vb[0] + q * vc[0], u * va[1] + v * vb[1] + q * vc[1], x, y, lum); if (!k) continue;
    d[o] = Math.min(255, k[0]); d[o + 1] = Math.min(255, k[1]); d[o + 2] = Math.min(255, k[2]);
  }
}

async function body(scene: Scene, m: Mesh, mat: PBRMaterial, def: StyleDef, id: string): Promise<Texture | null> {
  const g = await geo(m, mat); if (!g) return null;
  const { idx, pos } = g, nv = pos.length / 3, zone: Zone[] = new Array(nv);
  let tLo = 1e9, tHi = -1e9, sMax = 1e-6, sr = 0, sg = 0, sb = 0, sn = 0;
  for (let v = 0; v < nv; v++) {
    const z = (zone[v] = zoneOf(g.bone(v)));
    if (z === 'torso') { const y = pos[v * 3 + g.up]; tLo = Math.min(tLo, y); tHi = Math.max(tHi, y); sMax = Math.max(sMax, Math.abs(pos[v * 3 + g.side])); }
    else if (z === 'hand') { const o = texel(g, v); sr += g.src[o]; sg += g.src[o + 1]; sb += g.src[o + 2]; sn++; }
  }
  const skin = sn ? [sr / sn, sg / sn, sb / sn] : [200, 160, 130];
  skins.set(id, skin);
  const val = (v: number): [number, number] => [(pos[v * 3 + g.up] - tLo) / Math.max(1e-6, tHi - tLo), pos[v * 3 + g.side] / sMax];
  const shade = (c: number[], lum: number, k = .55) => { const f = 1 - k + k * 2 * Math.min(.75, lum + .12); return [c[0] * f, c[1] * f, c[2] * f]; };
  const skinAt = (lum: number) => shade(skin, lum, .25);
  const glit = (base: number[], x: number, y: number, lum: number) => { const r = spark(x >> 1, y >> 1); return r > .93 ? [255, 255, 255] : r > .8 ? shade(base, .62 + r * .3, .9) : shade(base, lum, .5); };
  const top = def.top, leather = [24, 24, 30];
  type Fn = ((t: number, s: number, x: number, y: number, lum: number) => number[] | null) | null;
  let torso: Fn = null, arm: Fn = null;
  if (top === 'harness') {
    // nackter Oberkörper mit Brustgurt und zwei Schulterriemen, die sich in der Mitte treffen
    torso = (t, s, _x, _y, lum) => (Math.abs(t - .62) < .035 || (t > .62 && Math.abs(Math.abs(s) - (.12 + (t - .62) * 1.25)) < .07) || (t < .62 && t > .3 && Math.abs(s) < .05) ? shade(leather, lum, .3) : skinAt(lum));
    arm = (_t, _s, _x, _y, lum) => skinAt(lum);
  } else if (top === 'leather') {
    torso = (_t, s, _x, _y, lum) => (Math.abs(s) < .03 ? [150, 150, 160] : shade(leather, lum, .35));   // Reißverschluss
    arm = (_t, _s, _x, _y, lum) => shade(leather, lum, .35);
  } else if (top && 'flag' in top) {
    const cols = palette(top.flag).colors.map(hex), cut = top.crop ? .42 : -1;
    torso = (t, _s, _x, _y, lum) => (t < cut ? skinAt(lum) : shade(cols[Math.max(0, Math.min(cols.length - 1, Math.floor((1 - (t - Math.max(0, cut)) / (1 - Math.max(0, cut))) * cols.length)))], lum));
  } else if (top && 'glitter' in top) {
    const base = rgb(top.glitter), cut = top.crop ? .42 : -1;
    torso = (t, _s, x, y, lum) => (t < cut ? skinAt(lum) : glit(base, x, y, lum));
  }
  const lg = def.legs, legBase = typeof lg === 'number' ? rgb(lg) : lg ? rgb(lg.glitter) : null;
  const leg: Fn = !legBase ? null : typeof lg === 'number' ? (_t, _s, _x, _y, lum) => shade(legBase, lum, .4) : (_t, _s, x, y, lum) => glit(legBase, x, y, lum);
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i], b = idx[i + 1], c = idx[i + 2], za = zone[a], zb = zone[b], zc = zone[c];
    const z = za === zb || za === zc ? za : zb === zc ? zb : za;
    const fn = z === 'torso' ? torso : z === 'arm' ? arm : z === 'leg' ? leg : null;
    if (fn) tri(g, a, b, c, val, fn);
  }
  return finish(scene, g);
}

/** Haare färben: alles am Kopf, was oben oder hinten liegt und nicht nach Haut aussieht; Strähnen-Textur komplett */
async function head(scene: Scene, m: Mesh, mat: PBRMaterial, color: number, id: string, strands: boolean): Promise<Texture | null> {
  const g = await geo(m, mat); if (!g) return null;
  const c = rgb(color), dye = (o: number) => { const l = Math.max(g.src[o], g.src[o + 1], g.src[o + 2]) / 255, f = .42 + l * .95; g.data[o] = Math.min(255, c[0] * f); g.data[o + 1] = Math.min(255, c[1] * f); g.data[o + 2] = Math.min(255, c[2] * f); };
  if (strands) { for (let o = 0; o < g.data.length; o += 4) if (g.src[o + 3] > 8) dye(o); return finish(scene, g, true); }
  const skin = skins.get(id) || [200, 160, 130];
  const like = (o: number) => { const dr = g.src[o] - skin[0], dg = g.src[o + 1] - skin[1], db = g.src[o + 2] - skin[2]; return Math.sqrt(dr * dr + dg * dg + db * db) < 70 || (g.src[o] > 150 && g.src[o] > g.src[o + 2] * 1.25 && g.src[o] - g.src[o + 1] < 90 && g.src[o + 1] > g.src[o + 2]); };
  const { pos, idx } = g, nv = pos.length / 3;
  let lo = 1e9, hi = -1e9, dAll = 0, dSkin = 0, nSkin = 0;
  // der Kopf ist alles, was nicht an Hals oder Rumpf hängt: nur dort färben
  const isHead = (v: number) => !/Neck|Spine|Clavicle|Arm|Pelvis/.test(g.bone(v));
  for (let v = 0; v < nv; v++) { if (!isHead(v)) continue; const y = pos[v * 3 + g.up]; lo = Math.min(lo, y); hi = Math.max(hi, y); }
  if (hi <= lo) return null;
  const bottom = lo, hgt = Math.max(1e-6, hi - bottom);
  let dLo = 1e9, dHi = -1e9;
  for (let v = 0; v < nv; v++) { const t = (pos[v * 3 + g.up] - bottom) / hgt; if (t < 0) continue; const z = pos[v * 3 + g.depth]; dAll += z; dLo = Math.min(dLo, z); dHi = Math.max(dHi, z); if (t > .25 && t < .6 && like(texel(g, v))) { dSkin += z; nSkin++; } }
  const mid = (dLo + dHi) / 2, front = nSkin ? Math.sign(dSkin / nSkin - mid) || 1 : 1, dExt = Math.max(1e-6, dHi - dLo);
  const val = (v: number): [number, number] => [(pos[v * 3 + g.up] - bottom) / hgt, (pos[v * 3 + g.depth] - mid) / dExt * front];
  const { w, h, uv } = g;
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i], b = idx[i + 1], c2 = idx[i + 2], va = val(a), vb = val(b), vc = val(c2);
    const t = (va[0] + vb[0] + vc[0]) / 3, z = (va[1] + vb[1] + vc[1]) / 3;
    if (t < .12 || !(t > .64 || z < -.12)) continue;
    const A = [uv[a * 2] * w, uv[a * 2 + 1] * h], B = [uv[b * 2] * w, uv[b * 2 + 1] * h], C = [uv[c2 * 2] * w, uv[c2 * 2 + 1] * h];
    const area = (B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1]); if (Math.abs(area) < 1e-6) continue;
    const minX = Math.max(0, Math.floor(Math.min(A[0], B[0], C[0]))), maxX = Math.min(w - 1, Math.ceil(Math.max(A[0], B[0], C[0])));
    const minY = Math.max(0, Math.floor(Math.min(A[1], B[1], C[1]))), maxY = Math.min(h - 1, Math.ceil(Math.max(A[1], B[1], C[1])));
    for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
      const px = x + .5, py = y + .5;
      const u = ((B[0] - px) * (C[1] - py) - (C[0] - px) * (B[1] - py)) / area, v = ((C[0] - px) * (A[1] - py) - (A[0] - px) * (C[1] - py)) / area;
      if (u < -.05 || v < -.05 || 1 - u - v < -.05) continue;
      const o = (y * w + x) * 4; if (!like(o)) dye(o);
    }
  }
  return finish(scene, g);
}
