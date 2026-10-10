// Prozedurale Pixel-Texturen (Atlas 4x4 Kacheln à 16 px) – keine externen Assets.
export const TILE = 16, GRID = 4;

function mulberry(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const clamp = v => Math.max(0, Math.min(255, v | 0));

const PAINT = [
  // 0 Gras oben
  (x, y, r) => { const v = (r() - 0.5) * 34; return [86 + v, 156 + v * 1.2, 56 + v * 0.6, 255]; },
  // 1 Gras Seite
  (x, y, r, ctx) => {
    const edge = ctx.edge[x];
    if (y < edge) { const v = (r() - 0.5) * 34; return [86 + v, 156 + v * 1.2, 56 + v * 0.6, 255]; }
    const v = (r() - 0.5) * 26; return [134 + v, 96 + v, 67 + v, 255];
  },
  // 2 Erde
  (x, y, r) => { const v = (r() - 0.5) * 26, s = r() < 0.08 ? -30 : 0; return [134 + v + s, 96 + v + s, 67 + v + s, 255]; },
  // 3 Stein
  (x, y, r) => { const v = (r() - 0.5) * 26, s = ((x * 7 + y * 13) % 11 === 0) ? -22 : 0; return [124 + v + s, 124 + v + s, 128 + v + s, 255]; },
  // 4 Sand
  (x, y, r) => { const v = (r() - 0.5) * 16; return [219 + v, 203 + v, 142 + v, 255]; },
  // 5 Holz Seite
  (x, y, r) => { const v = (r() - 0.5) * 14, s = x % 4 === 0 ? -26 : x % 4 === 2 ? 10 : 0; return [104 + v + s, 78 + v + s, 46 + v + s, 255]; },
  // 6 Holz oben
  (x, y, r) => {
    const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5)), v = (r() - 0.5) * 10;
    if (d > 6.5) return [92 + v, 68 + v, 40 + v, 255];
    const ring = Math.floor(d) % 2 ? 0 : 22; return [176 + v - ring, 140 + v - ring, 86 + v - ring, 255];
  },
  // 7 Blätter
  (x, y, r) => { const v = (r() - 0.5) * 50; return r() < 0.14 ? [0, 0, 0, 0] : [50 + v * 0.6, 128 + v, 46 + v * 0.5, 255]; },
  // 8 Bretter
  (x, y, r) => {
    const v = (r() - 0.5) * 12, row = y >> 2;
    const seam = y % 4 === 3 ? -34 : ((x + (row % 2) * 8) % 16 === 0 ? -26 : 0);
    return [172 + v + seam, 134 + v + seam, 82 + v + seam, 255];
  },
  // 9 Glas
  (x, y) => {
    if (x === 0 || y === 0 || x === 15 || y === 15) return [226, 244, 250, 235];
    if ((x === y && x > 2 && x < 7) || (x === y + 1 && x > 3 && x < 6)) return [255, 255, 255, 150];
    return [190, 226, 238, 60];
  },
  // 10 Leuchtblock
  (x, y, r) => {
    const v = (r() - 0.5) * 18;
    if (x % 8 === 0 || y % 8 === 0) return [205 + v, 150 + v, 60, 255];
    const c = Math.hypot(x % 8 - 3.5, y % 8 - 3.5) < 2.6 ? 22 : 0; return [255, 222 + v + c * 0.5, 130 + c * 2, 255];
  },
  // 11 Wasser
  (x, y, r) => { const v = (r() - 0.5) * 16, rip = ((x + y * 2) % 9 === 0) ? 24 : 0; return [44 + v + rip, 108 + v + rip, 205 + rip, 176]; }
];

export function drawAtlas() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = TILE * GRID;
  const g = cv.getContext('2d');
  const img = g.createImageData(TILE, TILE);
  for (let t = 0; t < PAINT.length; t++) {
    const r = mulberry(1234 + t * 977);
    const ctx = { edge: Array.from({ length: TILE }, () => 3 + (r() < 0.5 ? 1 : 0) + (r() < 0.2 ? 1 : 0)) };
    for (let y = 0; y < TILE; y++) for (let x = 0; x < TILE; x++) {
      const c = PAINT[t](x, y, r, ctx), i = (y * TILE + x) * 4;
      img.data[i] = clamp(c[0]); img.data[i + 1] = clamp(c[1]); img.data[i + 2] = clamp(c[2]); img.data[i + 3] = clamp(c[3]);
    }
    g.putImageData(img, (t % GRID) * TILE, Math.floor(t / GRID) * TILE);
  }
  return cv;
}
