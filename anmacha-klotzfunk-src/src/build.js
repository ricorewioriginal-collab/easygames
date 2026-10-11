// Bau-Werkzeuge ohne Grafik: Formen zwischen zwei Eckpunkten, Kopieren und Einfügen (testbar).
import { B } from './blocks.js';
import { H } from './consts.js';

// key, Anzeigename, Zahl der Klicks (1 = sofort, 2 = Eckpunkt A, dann B), nur Kreativ
export const BUILD_MODES = [
  { key: 'einzeln', name: 'Einzeln', clicks: 1 },
  { key: 'linie', name: 'Linie', clicks: 2 },
  { key: 'flaeche', name: 'Fläche', clicks: 2 },
  { key: 'wand', name: 'Wand', clicks: 2 },
  { key: 'saeule', name: 'Säule', clicks: 2 },
  { key: 'kopieren', name: 'Kopieren', clicks: 2, creative: true },
  { key: 'einfuegen', name: 'Einfügen', clicks: 1, creative: true }
];
export const MAX_CELLS = { creative: 8192, survival: 512 };
export const MAX_CLIP = 32768;

const range = (a, b) => { const out = [], s = a <= b ? 1 : -1; for (let v = a; v !== b + s; v += s) out.push(v); return out; };

// Zellen einer Form zwischen a und b ([x, y, z]); höchstens max Zellen, sonst null
export function shapeCells(mode, a, b, max = MAX_CELLS.creative) {
  const out = [];
  const push = (x, y, z) => { if (y >= 0 && y < H) out.push([x, y, z]); return out.length <= max; };
  if (mode === 'linie') { // 3D-Linie: so viele Schritte wie die längste Achse
    const n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), Math.abs(b[2] - a[2]));
    if (n + 1 > max) return null;
    for (let i = 0; i <= n; i++) {
      const t = n ? i / n : 0;
      push(Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t));
    }
    return out;
  }
  let xs, ys, zs;
  if (mode === 'flaeche') { xs = range(a[0], b[0]); ys = [a[1]]; zs = range(a[2], b[2]); }
  else if (mode === 'saeule') { xs = [a[0]]; ys = range(a[1], b[1]); zs = [a[2]]; }
  else if (mode === 'wand') { // senkrecht entlang der längeren waagerechten Achse
    ys = range(a[1], b[1]);
    if (Math.abs(b[0] - a[0]) >= Math.abs(b[2] - a[2])) { xs = range(a[0], b[0]); zs = [a[2]]; } else { xs = [a[0]]; zs = range(a[2], b[2]); }
  } else if (mode === 'kopieren') { xs = range(a[0], b[0]); ys = range(a[1], b[1]); zs = range(a[2], b[2]); }
  else return [a.slice()];
  if (xs.length * ys.length * zs.length > max) return null;
  for (const y of ys) for (const z of zs) for (const x of xs) push(x, y, z);
  return out;
}

// Begrenzungsquader zweier Punkte: [x0, y0, z0, x1, y1, z1]
export function bounds(a, b) {
  return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[2], b[2])];
}

// Quader kopieren: { sx, sy, sz, data } (Luft wird beim Einfügen übersprungen) oder null, wenn zu groß
export function copyRegion(world, a, b) {
  const [x0, y0, z0, x1, y1, z1] = bounds(a, b), sx = x1 - x0 + 1, sy = y1 - y0 + 1, sz = z1 - z0 + 1;
  if (sx * sy * sz > MAX_CLIP) return null;
  const data = new Uint8Array(sx * sy * sz);
  let n = 0;
  for (let y = 0; y < sy; y++) for (let z = 0; z < sz; z++) for (let x = 0; x < sx; x++) {
    const t = world.getBlock(x0 + x, y0 + y, z0 + z);
    data[x + z * sx + y * sx * sz] = t === B.WATER ? B.AIR : t;
    if (t && t !== B.WATER) n++;
  }
  return { sx, sy, sz, data, n };
}

// Einfügen ab Ecke at: Liste [x, y, z, typ] (ohne Luft)
export function pasteCells(clip, at) {
  const out = [];
  for (let y = 0; y < clip.sy; y++) for (let z = 0; z < clip.sz; z++) for (let x = 0; x < clip.sx; x++) {
    const t = clip.data[x + z * clip.sx + y * clip.sx * clip.sz];
    if (t && at[1] + y >= 0 && at[1] + y < H) out.push([at[0] + x, at[1] + y, at[2] + z, t]);
  }
  return out;
}
