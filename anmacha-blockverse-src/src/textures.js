// Prozedurale, nahtlose Texturen (64 px je Kachel, Atlas 8x8) plus Funk-Logo-Atlas (4x4 à 128 px).
export const TILE = 64, GRID = 8;
export const LOGO_TILE = 128, LOGO_GRID = 4, LOGO_COUNT = 16;

function hash(x, y, s) {
  let h = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x165667b1) ^ Math.imul(s | 0, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b); h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
// nahtloses Value-Noise mit Periode (px, py) Gitterzellen
function pn(x, y, px, py, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const x0 = ((xi % px) + px) % px, x1 = (x0 + 1) % px, y0 = ((yi % py) + py) % py, y1 = (y0 + 1) % py;
  const a = hash(x0, y0, s), b = hash(x1, y0, s), c = hash(x0, y1, s), d = hash(x1, y1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(u, v, base, oct, s) {
  let sum = 0, amp = 0.5, norm = 0, per = base;
  for (let i = 0; i < oct; i++) { sum += amp * pn(u * per, v * per, per, per, s + i * 17); norm += amp; amp *= 0.5; per *= 2; }
  return sum / norm;
}
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const add = (c, d) => [c[0] + d, c[1] + d, c[2] + d];
const grain = (x, y, s, amp) => (hash(x, y, s) - 0.5) * amp;

const GRASS = (u, v, x, y) => {
  const n = fbm(u, v, 6, 3, 2), f = pn(u * 32, v * 32, 32, 32, 5);
  return [...add(mix([58, 122, 38], [120, 186, 72], n * 0.65 + f * 0.45), grain(x, y, 8, 10)), 255];
};
const DIRT = (u, v, x, y) => {
  const n = fbm(u, v, 4, 4, 1), p = fbm(u, v, 12, 2, 9);
  let c = mix([108, 76, 50], [150, 108, 76], n);
  if (p > 0.66) c = add(c, -26); else if (p < 0.28) c = add(c, 12);
  return [...add(c, grain(x, y, 3, 10)), 255];
};
const PAINT = [
  GRASS,
  // 1 Gras Seite
  (u, v, x, y) => {
    const d = 0.17 + 0.11 * pn(u * 8, 0.5, 8, 1, 4) + 0.05 * pn(u * 24, 0.5, 24, 1, 6);
    if (v < d) { const c = GRASS(u, v, x, y); if (v > d - 0.035) { c[0] *= 0.8; c[1] *= 0.85; c[2] *= 0.8; } return c; }
    const c = DIRT(u, v, x, y), sh = Math.max(0, 1 - (v - d) * 7) * 0.28;
    return [c[0] * (1 - sh), c[1] * (1 - sh), c[2] * (1 - sh), 255];
  },
  DIRT,
  // 3 Stein
  (u, v, x, y) => {
    const n = fbm(u, v, 4, 4, 3), r = Math.abs(fbm(u, v, 3, 3, 7) - 0.5);
    let c = mix([92, 94, 100], [142, 144, 150], n);
    if (r < 0.022) c = add(c, -34);
    else if (fbm(u, v, 10, 2, 13) > 0.7) c = add(c, 14);
    return [...add(c, grain(x, y, 4, 9)), 255];
  },
  // 4 Sand
  (u, v, x, y) => {
    const n = fbm(u, v, 5, 3, 21), rip = Math.sin((v + n * 0.35) * Math.PI * 8) * 5;
    return [...add(mix([212, 194, 136], [232, 218, 160], n), rip + grain(x, y, 5, 10)), 255];
  },
  // 5 Holz Seite
  (u, v, x, y) => {
    const g = pn(u * 10, v * 3, 10, 3, 31) * 0.6 + pn(u * 20, v * 6, 20, 6, 32) * 0.4;
    let c = mix([82, 58, 33], [132, 98, 58], g);
    if (g < 0.3) c = add(c, -16);
    return [...add(c, grain(x, y, 6, 8)), 255];
  },
  // 6 Holz oben
  (u, v, x, y) => {
    const dx = u - 0.5, dy = v - 0.5, edge = Math.max(Math.abs(dx), Math.abs(dy));
    const bark = fbm(u, v, 6, 2, 41);
    if (edge > 0.43) return [...add(mix([80, 56, 32], [118, 86, 50], bark), grain(x, y, 7, 8)), 255];
    const r = Math.hypot(dx, dy) * 15 + fbm(u, v, 3, 2, 42) * 2.2, t = 0.5 + 0.5 * Math.sin(r * Math.PI * 2);
    return [...add(mix([186, 148, 94], [148, 108, 62], t), grain(x, y, 9, 7)), 255];
  },
  // 7 Blätter (mit Löchern)
  (u, v, x, y) => {
    const n = fbm(u, v, 8, 3, 11), hole = fbm(u, v, 9, 2, 12);
    let c = mix([30, 92, 30], [92, 168, 58], n);
    if (hole > 0.64) return [c[0], c[1], c[2], 0]; // Farbe bleibt erhalten, sonst dunkle Ränder
    if (pn(u * 16, v * 16, 16, 16, 14) > 0.78) c = add(c, 18);
    return [...add(c, grain(x, y, 10, 10)), 255];
  },
  // 8 Bretter
  (u, v, x, y) => {
    const row = Math.floor(v * 4), fy = (v * 4) % 1;
    const g = pn(u * 6, v * 40, 6, 40, 51 + row) * 0.7 + 0.3 * pn(u * 24, v * 4 + row, 24, 4, 55);
    let c = mix([150, 110, 60], [200, 156, 96], g);
    if (fy < 0.045 || fy > 0.97) c = add(c, -46);
    const jx = row % 2 ? 0.25 : 0.75;
    if (Math.abs(u - jx) < 0.012) c = add(c, -40);
    return [...add(c, grain(x, y, 11, 6)), 255];
  },
  // 9 Glas
  (u, v, x, y) => {
    const e = Math.min(x, y, TILE - 1 - x, TILE - 1 - y);
    if (e < 3) return [228, 245, 252, 238];
    const d = (u + v) % 0.5;
    if (d > 0.1 && d < 0.17 && u + v < 1.0) return [255, 255, 255, 140];
    return [186, 226, 240, 55];
  },
  // 10 Leuchtblock
  (u, v, x, y) => {
    const fx = (u * 2) % 1, fy = (v * 2) % 1, e = Math.min(fx, 1 - fx, fy, 1 - fy);
    if (e < 0.055) return [150, 98, 38, 255];
    const g = Math.max(0, 1 - Math.hypot(fx - 0.5, fy - 0.5) * 1.5), n = fbm(u, v, 6, 2, 61);
    return [...mix([255, 196, 96], [255, 246, 190], g * 0.9 + n * 0.1), 255];
  },
  // 11 Wasser
  (u, v, x, y) => {
    const n = fbm(u, v, 4, 3, 15), r = fbm(u + n * 0.2, v, 8, 2, 16);
    const hi = r > 0.62 ? 26 : 0;
    return [...add(mix([34, 92, 190], [62, 134, 220], n), hi), 172];
  }
];
// Kachel-Rand: leichte Kante, die jeden Block als Körper lesbar macht
const BEVEL = new Set([0, 1, 2, 3, 4, 5, 6, 8]);

export function drawAtlas() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = TILE * GRID;
  const g = cv.getContext('2d');
  const img = g.createImageData(TILE, TILE), d = img.data;
  const W = TILE * GRID, raw = new Uint8Array(W * W * 4); // Rohdaten (nicht vormultipliziert, Zeile 0 = unten) für die GPU
  for (let t = 0; t < PAINT.length; t++) {
    for (let y = 0; y < TILE; y++) for (let x = 0; x < TILE; x++) {
      const c = PAINT[t]((x + 0.5) / TILE, (y + 0.5) / TILE, x, y), i = (y * TILE + x) * 4;
      let k = 0;
      if (BEVEL.has(t)) {
        const e = Math.min(x, y, TILE - 1 - x, TILE - 1 - y);
        if (e < 3) { const lit = (x < TILE / 2 && x <= y) || (y < TILE / 2 && y < x); k = (lit ? 16 : -20) * (1 - e / 3); }
      }
      d[i] = Math.max(0, Math.min(255, c[0] + k)); d[i + 1] = Math.max(0, Math.min(255, c[1] + k));
      d[i + 2] = Math.max(0, Math.min(255, c[2] + k)); d[i + 3] = Math.max(0, Math.min(255, c[3]));
      const ri = ((W - 1 - (Math.floor(t / GRID) * TILE + y)) * W + (t % GRID) * TILE + x) * 4;
      raw[ri] = d[i]; raw[ri + 1] = d[i + 1]; raw[ri + 2] = d[i + 2]; raw[ri + 3] = d[i + 3];
    }
    g.putImageData(img, (t % GRID) * TILE, Math.floor(t / GRID) * TILE);
  }
  cv.raw = raw;
  return cv;
}

// Logo-Atlas: Platzhalter sofort, Bilder werden nachgeladen. onDone() nach dem letzten Bild.
export function createLogoAtlas(onUpdate, onDone) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = LOGO_TILE * LOGO_GRID;
  const g = cv.getContext('2d');
  g.fillStyle = '#0e1224'; g.fillRect(0, 0, cv.width, cv.height);
  let left = LOGO_COUNT;
  for (let i = 0; i < LOGO_COUNT; i++) {
    const im = new Image(), nn = String(i + 1).padStart(2, '0');
    const fin = () => { if (--left === 0) onDone && onDone(); };
    im.onload = () => { g.drawImage(im, (i % LOGO_GRID) * LOGO_TILE, Math.floor(i / LOGO_GRID) * LOGO_TILE, LOGO_TILE, LOGO_TILE); onUpdate && onUpdate(); fin(); };
    im.onerror = fin;
    im.src = `logos/${nn}.png`;
  }
  return cv;
}

// Wolken-Textur (nahtlos, weiß mit weichem Alpha)
export function cloudCanvas() {
  const S = 128, cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const g = cv.getContext('2d'), img = g.createImageData(S, S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = fbm((x + 0.5) / S, (y + 0.5) / S, 4, 4, 77), t = Math.max(0, Math.min(1, (n - 0.5) / 0.18)), i = (y * S + x) * 4;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = 255; img.data[i + 3] = (t * t * (3 - 2 * t)) * 255;
  }
  g.putImageData(img, 0, 0);
  return cv;
}
