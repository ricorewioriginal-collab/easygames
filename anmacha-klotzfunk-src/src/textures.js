// Prozedurale, nahtlose Texturen (64 px je Kachel, Atlas 8x8) plus Funk-Logo-Atlas (4x4 à 128 px).
export const TILE = 64, GRID = 8, ROWS = 16; // Block-Atlas: 8 Spalten × 16 Zeilen
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
  },
  // 12 Federblock oben
  (u, v, x, y) => {
    const r = Math.hypot(u - 0.5, v - 0.5), e = Math.min(x, y, TILE - 1 - x, TILE - 1 - y);
    let c = mix([255, 120, 170], [255, 70, 130], Math.min(1, r * 1.6));
    if (Math.sin(r * Math.PI * 14) > 0.7) c = add(c, 22);
    if (e < 4) c = mix(c, [150, 30, 80], 0.6);
    return [...c, 255];
  },
  // 13 Federblock Seite: Spiralfeder zwischen rosa Kappen
  (u, v, x, y) => {
    if (v < 0.17 || v > 0.83) { const e = Math.min(v, 1 - v); return [...mix([255, 80, 140], [190, 40, 100], e < 0.04 ? 0.6 : 0), 255]; }
    const w = Math.sin((v * 7 + Math.abs(u - 0.5) * 0.8) * Math.PI * 2);
    return w > -0.1 ? [...add([176, 182, 194], w * 24), 255] : [52, 54, 64, 255];
  },
  // 14 Turbo oben: gelb-schwarze Pfeile
  (u, v) => {
    const t = ((v + Math.abs(u - 0.5)) * 3) % 1, e = Math.min(u, v, 1 - u, 1 - v);
    if (e < 0.04) return [30, 30, 36, 255];
    return t < 0.5 ? [255, 214, 40, 255] : [38, 38, 46, 255];
  },
  // 15 Turbo Seite
  (u, v) => (v > 0.35 && v < 0.65) ? [255, 214, 40, 255] : [40, 40, 50, 255],
  // 16 Aufwind oben: Pfeile nach oben
  (u, v, x, y) => {
    const du = Math.abs(((u * 2) % 1) - 0.5), vv = (v * 2) % 1;
    const shaft = du < 0.07 && vv > 0.4 && vv < 0.88, head = vv > 0.12 && vv < 0.44 && du < (vv - 0.12) * 0.75;
    const base = mix([40, 170, 215], [96, 220, 245], fbm(u, v, 4, 2, 71));
    return shaft || head ? [255, 255, 255, 255] : [...add(base, grain(x, y, 12, 8)), 255];
  },
  // 17 Aufwind Seite
  (u, v, x, y) => {
    const w = Math.sin((v * 5 - u * 0.6) * Math.PI * 2 + Math.sin(u * 9) * 1.2);
    return [...(w > 0.82 ? [235, 250, 255] : mix([40, 160, 205], [80, 205, 235], v)), 255];
  },
  // 18 Radio Seite: Lautsprecher
  (u, v, x, y) => {
    const e = Math.min(u, v, 1 - u, 1 - v), r = Math.hypot(u - 0.5, v - 0.5);
    if (e < 0.05) return [28, 30, 38, 255];
    if (r < 0.34) { const dot = (x % 6 < 3 && y % 6 < 3); return dot ? [18, 20, 26, 255] : [96, 102, 116, 255]; }
    if (v < 0.14 && u > 0.7 && u < 0.84) return [255, 150, 40, 255];
    return [...add([58, 62, 74], grain(x, y, 13, 8)), 255];
  },
  // 19 Radio oben
  (u, v, x, y) => {
    const e = Math.min(u, v, 1 - u, 1 - v);
    if (e < 0.05) return [28, 30, 38, 255];
    if (Math.hypot(u - 0.3, v - 0.5) < 0.16) return [255, 150, 40, 255];
    if (v > 0.42 && v < 0.58 && u > 0.55 && u < 0.9) return [0, 229, 255, 255];
    return [...add([58, 62, 74], grain(x, y, 14, 8)), 255];
  },
  // 20 Regenbogen (Graumuster, wird im Shader eingefärbt)
  (u, v, x, y) => { const g = 0.5 + 0.5 * Math.sin((u + v) * Math.PI * 6 + fbm(u, v, 4, 2, 81) * 5); const e = Math.min(u, v, 1 - u, 1 - v); const k = e < 0.04 ? 0.45 : 0.7 + 0.3 * g; return [k * 255, k * 255, k * 255, 255]; },
  // 21..24 Neon
  ...[[255, 40, 70], [40, 140, 255], [50, 255, 120], [190, 70, 255]].map(col => (u, v) => {
    const fx = (u * 2) % 1, fy = (v * 2) % 1, e = Math.min(fx, 1 - fx, fy, 1 - fy);
    if (e < 0.06) return [col[0] * 0.3, col[1] * 0.3, col[2] * 0.3, 255];
    const g = Math.max(0, 1 - Math.hypot(fx - 0.5, fy - 0.5) * 1.3);
    return [...mix(col, [255, 255, 255], g * g * 0.65), 255];
  }),
  // 25 Ziegel
  (u, v, x, y) => {
    const row = Math.floor(v * 8), fy = (v * 8) % 1, off = row % 2 ? 0.125 : 0, fx = ((u * 4 + off * 4) % 1);
    if (fy < 0.1 || fx < 0.05) return [...add([176, 170, 160], grain(x, y, 15, 10)), 255];
    const n = fbm(u, v, 8, 2, 91 + row);
    return [...add(mix([150, 62, 46], [186, 92, 66], n), grain(x, y, 16, 12)), 255];
  },
  // 26 Marmor
  (u, v, x, y) => {
    const n = fbm(u, v, 3, 4, 95), vein = Math.abs(fbm(u + n * 0.3, v, 3, 3, 96) - 0.5);
    let c = mix([236, 236, 242], [214, 216, 226], n);
    if (vein < 0.03) c = add(c, -52); else if (vein < 0.05) c = add(c, -22);
    return [...add(c, grain(x, y, 17, 5)), 255];
  },
  // ---- ab hier: Biome, Höhlen, Erze (Welt-Generator 2) ----
  // 27 Schnee oben
  (u, v, x, y) => [...add(mix([226, 234, 244], [250, 252, 255], fbm(u, v, 5, 3, 101)), grain(x, y, 18, 6)), 255],
  // 28 Schnee Seite (Erde mit Schneekappe)
  (u, v, x, y) => {
    const d = 0.2 + 0.1 * pn(u * 8, 0.5, 8, 1, 102);
    if (v < d) return [...add([240, 246, 252], grain(x, y, 19, 6)), 255];
    const c = DIRT(u, v, x, y), sh = Math.max(0, 1 - (v - d) * 7) * 0.2;
    return [c[0] * (1 - sh), c[1] * (1 - sh), c[2] * (1 - sh), 255];
  },
  // 29 Eis
  (u, v, x, y) => {
    const n = fbm(u, v, 4, 3, 103), crack = Math.abs(fbm(u, v, 3, 2, 104) - 0.5) < 0.018;
    return [...add(mix([150, 196, 236], [196, 226, 250], n), crack ? 30 : grain(x, y, 20, 5)), 255];
  },
  // 30 Kies
  (u, v, x, y) => {
    const k = pn(u * 10, v * 10, 10, 10, 105), n = fbm(u, v, 16, 2, 106);
    const c = k > 0.6 ? [150, 144, 138] : k < 0.3 ? [96, 92, 90] : [124, 120, 116];
    return [...add(c, (n - 0.5) * 40 + grain(x, y, 21, 10)), 255];
  },
  // 31 Ton
  (u, v, x, y) => {
    const band = Math.sin((v + fbm(u, v, 3, 2, 107) * 0.2) * Math.PI * 6) * 6;
    return [...add(mix([142, 152, 168], [168, 176, 190], fbm(u, v, 4, 3, 108)), band + grain(x, y, 22, 6)), 255];
  },
  // 32 Fichtenholz Seite
  (u, v, x, y) => {
    const g = pn(u * 12, v * 2, 12, 2, 109) * 0.6 + pn(u * 24, v * 5, 24, 5, 110) * 0.4;
    let c = mix([52, 36, 22], [92, 64, 40], g);
    if (g < 0.32) c = add(c, -12);
    return [...add(c, grain(x, y, 23, 8)), 255];
  },
  // 33 Fichtenholz oben
  (u, v, x, y) => {
    const dx = u - 0.5, dy = v - 0.5, edge = Math.max(Math.abs(dx), Math.abs(dy));
    if (edge > 0.43) return [...add([66, 46, 28], grain(x, y, 24, 8)), 255];
    const t = 0.5 + 0.5 * Math.sin((Math.hypot(dx, dy) * 18 + fbm(u, v, 3, 2, 111) * 2) * Math.PI * 2);
    return [...add(mix([170, 128, 80], [130, 92, 56], t), grain(x, y, 25, 7)), 255];
  },
  // 34 Fichtennadeln (mit Löchern)
  (u, v, x, y) => {
    const n = fbm(u, v, 10, 3, 112), hole = fbm(u, v, 11, 2, 113);
    const c = mix([22, 58, 34], [52, 104, 60], n);
    if (hole > 0.66) return [c[0], c[1], c[2], 0];
    return [...add(c, grain(x, y, 26, 12)), 255];
  },
  // 35 Kaktus Seite
  (u, v, x, y) => {
    const rib = Math.abs(((u * 4) % 1) - 0.5) < 0.08;
    let c = mix([44, 120, 44], [70, 150, 58], fbm(u, v, 4, 2, 114));
    if (rib) c = add(c, -24);
    if (hash(x >> 2, y >> 2, 115) > 0.93) c = [230, 226, 190];
    return [...add(c, grain(x, y, 27, 6)), 255];
  },
  // 36 Kaktus oben
  (u, v, x, y) => {
    const r = Math.hypot(u - 0.5, v - 0.5);
    return [...add(mix([92, 168, 70], [50, 124, 44], Math.min(1, r * 2)), grain(x, y, 28, 6)), 255];
  },
  // 37..39 Erze: Stein mit Einschlüssen
  ...[[[34, 34, 38], [58, 58, 64]], [[196, 108, 52], [236, 150, 84]], [[196, 160, 128], [232, 204, 176]]].map((col, k) => (u, v, x, y) => {
    const n = fbm(u, v, 4, 4, 3);
    let c = mix([92, 94, 100], [142, 144, 150], n);
    const o = pn(u * 6, v * 6, 6, 6, 116 + k);
    if (o > 0.68) c = mix(col[0], col[1], pn(u * 24, v * 24, 24, 24, 119 + k));
    return [...add(c, grain(x, y, 29 + k, 9)), 255];
  }),
  // 40 Funkkristall (leuchtet)
  (u, v, x, y) => {
    const f = Math.abs(((u + v) * 3) % 1 - 0.5), g = Math.abs(((u - v + 1) * 3) % 1 - 0.5);
    const facet = Math.min(f, g);
    const c = mix([40, 170, 230], [170, 250, 255], 1 - facet * 2);
    return [...add(c, fbm(u, v, 6, 2, 120) * 30 - 15), 255];
  },
  // 41 Schlamm
  (u, v, x, y) => {
    const n = fbm(u, v, 5, 3, 121), wet = fbm(u, v, 9, 2, 122) > 0.64;
    return [...add(mix([60, 50, 38], [92, 76, 58], n), wet ? 18 : grain(x, y, 32, 8)), 255];
  },
  // 42 Blütenwiese oben (Gras mit Blüten)
  (u, v, x, y) => {
    const c = GRASS(u, v, x, y), cell = hash(x >> 2, y >> 2, 123);
    if (cell > 0.88 && (x & 3) > 0 && (y & 3) > 0) {
      const k = Math.floor(hash(x >> 2, y >> 2, 124) * 4);
      return [...[[250, 230, 70], [240, 80, 110], [250, 250, 250], [150, 110, 240]][k], 255];
    }
    return c;
  },
  // 43 Basalt
  (u, v, x, y) => {
    const col = Math.floor(u * 4), e = Math.abs((u * 4) % 1 - 0.5) > 0.45;
    let c = mix([38, 38, 44], [66, 64, 72], fbm(u, v + col * 0.3, 4, 3, 125));
    if (e) c = add(c, -14);
    return [...add(c, grain(x, y, 33, 8)), 255];
  },
  // 44 Magma (leuchtet)
  (u, v, x, y) => {
    const n = fbm(u, v, 4, 3, 126), crust = Math.abs(fbm(u, v, 5, 2, 127) - 0.5) < 0.06;
    if (crust) return [60, 30, 26, 255];
    return [...mix([230, 70, 20], [255, 200, 60], n), 255];
  },
  // 45 Pilzhut (rot mit Punkten)
  (u, v, x, y) => {
    const dot = pn(u * 5, v * 5, 5, 5, 128) > 0.72;
    if (dot) return [...add([240, 236, 226], grain(x, y, 34, 6)), 255];
    return [...add(mix([170, 34, 38], [214, 60, 56], fbm(u, v, 4, 2, 129)), grain(x, y, 35, 8)), 255];
  },
  // 46 Pilzboden oben
  (u, v, x, y) => [...add(mix([98, 82, 108], [140, 120, 150], fbm(u, v, 6, 3, 130)), grain(x, y, 36, 12)), 255],
  // 47 Pilzboden Seite
  (u, v, x, y) => {
    const d = 0.16 + 0.08 * pn(u * 8, 0.5, 8, 1, 131);
    if (v < d) return [...add([120, 100, 130], grain(x, y, 37, 10)), 255];
    return DIRT(u, v, x, y);
  },
  // 48 Sandstein
  (u, v, x, y) => {
    const band = Math.floor(v * 4), fy = (v * 4) % 1;
    let c = mix([206, 182, 124], [226, 204, 150], fbm(u, v, 5, 2, 132 + band));
    if (fy < 0.06) c = add(c, -22);
    return [...add(c, grain(x, y, 38, 6)), 255];
  },
  // 49 Pilzstiel
  (u, v, x, y) => [...add(mix([214, 206, 188], [240, 234, 222], pn(u * 8, v * 2, 8, 2, 133)), grain(x, y, 39, 6)), 255],
  // 50 Dschungelblätter (mit Löchern)
  (u, v, x, y) => {
    const n = fbm(u, v, 7, 3, 134), hole = fbm(u, v, 8, 2, 135);
    const c = mix([24, 100, 22], [70, 170, 40], n);
    if (hole > 0.68) return [c[0], c[1], c[2], 0];
    return [...add(c, grain(x, y, 40, 10)), 255];
  },
  // 51 Werkbank oben: Bretter mit Werkzeug-Raster
  (u, v, x, y) => {
    const board = Math.floor(v * 4), fy = (v * 4) % 1;
    let c = mix([150, 112, 66], [182, 140, 88], fbm(u * 0.5, v, 6, 2, 140 + board));
    if (fy < 0.05) c = add(c, -40);
    if (Math.abs(u - 0.5) < 0.03 || Math.abs(v - 0.5) < 0.03) c = [84, 58, 34];
    const e = Math.min(u, v, 1 - u, 1 - v);
    if (e < 0.08) c = [104, 76, 44];
    return [...add(c, grain(x, y, 41, 8)), 255];
  },
  // 52 Werkbank Seite: Bretter, Säge und Hammer
  (u, v, x, y) => {
    let c = mix([150, 112, 66], [182, 140, 88], fbm(u, v * 0.5, 6, 2, 142));
    if ((v * 4) % 1 < 0.05) c = add(c, -36);
    if (v < 0.14) c = [110, 80, 46];
    if (u > 0.18 && u < 0.44 && v > 0.32 && v < 0.5) c = [186, 190, 198];          // Sägeblatt
    if (u > 0.4 && u < 0.48 && v > 0.3 && v < 0.52) c = [90, 60, 34];             // Griff
    if (u > 0.6 && u < 0.66 && v > 0.3 && v < 0.78) c = [96, 66, 38];             // Hammerstiel
    if (u > 0.54 && u < 0.74 && v > 0.26 && v < 0.36) c = [120, 124, 132];        // Hammerkopf
    return [...add(c, grain(x, y, 42, 8)), 255];
  },
  // 53 Schmelzofen vorne: Steinziegel mit glühender Öffnung
  (u, v, x, y) => {
    const row = Math.floor(v * 4), off = row & 1 ? 0.25 : 0, fx = (u * 2 + off) % 1, fy = (v * 4) % 1;
    let c = mix([96, 96, 102], [132, 132, 138], fbm(u, v, 5, 3, 144));
    if (fx < 0.05 || fy < 0.07) c = add(c, -38);
    if (u > 0.26 && u < 0.74 && v > 0.52 && v < 0.86) {
      const g = 1 - Math.abs(u - 0.5) * 3;
      c = v > 0.68 ? mix([200, 70, 20], [255, 190, 60], g * pn(u * 8, v * 8, 8, 8, 145)) : [26, 22, 22];
    }
    return [...add(c, grain(x, y, 43, 8)), 255];
  },
  // 54 Schmelzofen oben
  (u, v, x, y) => {
    let c = mix([100, 100, 106], [136, 136, 142], fbm(u, v, 5, 3, 146));
    if (Math.abs(u - 0.5) < 0.16 && Math.abs(v - 0.5) < 0.16) c = [30, 26, 26];
    return [...add(c, grain(x, y, 44, 8)), 255];
  },
  // 55 Wolle
  (u, v, x, y) => {
    const n = fbm(u, v, 8, 3, 147), curl = pn(u * 16, v * 16, 16, 16, 148);
    return [...add(mix([214, 210, 202], [246, 244, 238], n * 0.5 + curl * 0.5), grain(x, y, 45, 6)), 255];
  },
  // 56 Ackerboden oben: dunkle Furchen
  (u, v, x, y) => {
    const f = (v * 5) % 1, furrow = f < 0.32;
    let c = mix([74, 50, 30], [104, 72, 46], fbm(u, v, 6, 3, 150));
    if (furrow) c = add(c, -22);
    return [...add(c, grain(x, y, 46, 10)), 255];
  },
  // 57..60 Weizen in vier Stufen (Halme mit Lücken, Alpha)
  ...[0, 1, 2, 3].map(st => (u, v, x, y) => {
    const h = [0.3, 0.52, 0.76, 0.92][st], col = [[70, 170, 50], [90, 176, 54], [150, 176, 60], [214, 184, 76]][st];
    const stalk = Math.floor(u * 8), sx = (u * 8) % 1, sh = h * (0.8 + 0.2 * hash(stalk, st, 151));
    if (1 - v > sh || sx < 0.3 || sx > 0.7) {
      if (st === 3 && 1 - v > sh - 0.22 && 1 - v < sh + 0.04 && sx > 0.15 && sx < 0.85 && hash(x >> 1, y >> 1, 152) > 0.3) return [228, 196, 90, 255]; // Ähre
      return [0, 0, 0, 0];
    }
    return [...add(col, grain(x, y, 47 + st, 16) - (1 - v) * 20), 255];
  }),
  // 61 Dorfweg oben: festgetretener Kies
  (u, v, x, y) => {
    const n = fbm(u, v, 6, 3, 160), p = pn(u * 16, v * 16, 16, 16, 161);
    let c = mix([128, 110, 84], [160, 142, 112], n);
    if (p > 0.72) c = add(c, 22); else if (p < 0.22) c = add(c, -18);
    return [...add(c, grain(x, y, 50, 10)), 255];
  },
  // 62 Bruchstein: unregelmäßige Steine mit Fugen
  (u, v, x, y) => {
    const cell = (a, b) => hash(Math.floor(a), Math.floor(b), 162);
    const gu = u * 4 + (Math.floor(v * 4) & 1) * 0.5, gv = v * 4, fu = gu % 1, fv = gv % 1;
    let c = mix([96, 96, 100], [150, 150, 156], cell(gu, gv) * 0.6 + fbm(u, v, 5, 2, 163) * 0.4);
    if (fu < 0.08 || fv < 0.1) c = [64, 64, 68];
    return [...add(c, grain(x, y, 51, 8)), 255];
  },
  // 63/64 Schalter aus/an: Steinplatte mit Hebel
  ...[0, 1].map(on => (u, v, x, y) => {
    let c = mix([110, 110, 116], [140, 140, 146], fbm(u, v, 5, 2, 164));
    if (Math.abs(u - 0.5) < 0.2 && Math.abs(v - 0.5) < 0.3) c = [70, 70, 76];
    const lx = 0.5 + (on ? 0.12 : -0.12) * (0.5 - v) * 2;
    if (Math.abs(u - lx) < 0.05 && v > 0.25 && v < 0.6) c = [138, 98, 54];
    if (Math.abs(u - (on ? 0.62 : 0.38)) < 0.08 && v > 0.2 && v < 0.3) c = on ? [80, 240, 120] : [200, 60, 60];
    return [...add(c, grain(x, y, 52, 6)), 255];
  }),
  // 65 Signalleitung: Stein mit Kupferbahnen
  (u, v, x, y) => {
    let c = mix([84, 84, 92], [112, 112, 120], fbm(u, v, 5, 2, 165));
    if (Math.abs(u - 0.5) < 0.07 || Math.abs(v - 0.5) < 0.07) c = [214, 128, 60];
    if (Math.abs(u - 0.5) < 0.12 && Math.abs(v - 0.5) < 0.12) c = [240, 160, 80];
    return [...add(c, grain(x, y, 53, 6)), 255];
  },
  // 66 Funksender oben: Antennenfuß mit Kristall
  (u, v, x, y) => {
    let c = mix([60, 64, 76], [86, 90, 104], fbm(u, v, 5, 2, 166));
    const d = Math.hypot(u - 0.5, v - 0.5);
    if (d < 0.18) c = mix([60, 200, 240], [180, 250, 255], 1 - d / 0.18);
    else if (d < 0.24) c = [200, 120, 60];
    return [...add(c, grain(x, y, 54, 6)), 255];
  },
  // 67 Funksender Seite: Gehäuse mit Funkwellen
  (u, v, x, y) => {
    let c = mix([56, 60, 72], [80, 84, 98], fbm(u, v, 5, 2, 167));
    const d = Math.hypot(u - 0.5, v - 0.15);
    if (v > 0.15 && Math.abs(((d * 5) % 1) - 0.5) < 0.09 && d < 0.75) c = [106, 232, 255];
    if (v > 0.82) c = [200, 120, 60];
    return [...add(c, grain(x, y, 55, 6)), 255];
  },
  // 68 Funkrelais: Gitter mit Kristallpunkt
  (u, v, x, y) => {
    let c = mix([70, 74, 86], [98, 102, 116], fbm(u, v, 5, 2, 168));
    if ((u * 6) % 1 < 0.12 || (v * 6) % 1 < 0.12) c = [180, 110, 56];
    if (Math.hypot(u - 0.5, v - 0.5) < 0.12) c = [106, 232, 255];
    return [...add(c, grain(x, y, 56, 6)), 255];
  },
  // 69/70 Empfänger aus/an: Lautsprecher mit Anzeige
  ...[0, 1].map(on => (u, v, x, y) => {
    let c = mix([48, 52, 62], [70, 74, 86], fbm(u, v, 5, 2, 169));
    const d = Math.hypot(u - 0.5, v - 0.58);
    if (d < 0.26 && (d * 14) % 1 < 0.5) c = [30, 32, 40];
    if (v < 0.2 && Math.abs(u - 0.5) < 0.3) c = on ? [90, 255, 140] : [90, 40, 40];
    return [...add(c, grain(x, y, 57, 6)), 255];
  }),
  // 71/72 Signallampe aus/an
  ...[0, 1].map(on => (u, v, x, y) => {
    const e = Math.min(u, v, 1 - u, 1 - v);
    if (e < 0.1) return [...add([150, 96, 52], grain(x, y, 58, 8)), 255];
    const n = fbm(u, v, 4, 2, 170);
    return [...add(on ? mix([255, 200, 90], [255, 240, 170], n) : mix([86, 70, 50], [110, 92, 66], n), grain(x, y, 59, 6)), 255];
  }),
  // 73 Funktor geschlossen: Eisenplatten mit Nieten
  (u, v, x, y) => {
    let c = mix([150, 152, 160], [188, 190, 198], fbm(u, v, 4, 2, 171));
    if ((v * 2) % 1 < 0.05 || u < 0.05 || u > 0.95) c = [96, 98, 106];
    if (Math.hypot(((u * 4) % 1) - 0.5, ((v * 2) % 1) - 0.2) < 0.09) c = [110, 112, 120];
    return [...add(c, grain(x, y, 60, 6)), 255];
  },
  // 74 Funktor offen: nur der Rahmen (Alpha)
  (u, v, x, y) => {
    const e = Math.min(u, v, 1 - u, 1 - v);
    if (e > 0.1) return [0, 0, 0, 0];
    return [...add([120, 122, 130], grain(x, y, 61, 8)), 255];
  }
];
export const TILE_COUNT = PAINT.length;
// Kachel-Rand: leichte Kante, die jeden Block als Körper lesbar macht
const BEVEL = new Set([0, 1, 2, 3, 4, 5, 6, 8, 14, 15, 18, 19, 25, 26, 27, 28, 29, 30, 31, 32, 33, 35, 37, 38, 39, 41, 42, 43, 45, 46, 47, 48, 49, 52, 53, 54, 55, 61, 63, 64, 65, 66, 67, 68, 69, 70, 73]);

export function drawAtlas() {
  const cv = document.createElement('canvas');
  cv.width = TILE * GRID; cv.height = TILE * ROWS;
  const g = cv.getContext('2d');
  const img = g.createImageData(TILE, TILE), d = img.data;
  const W = TILE * GRID, HH = TILE * ROWS, raw = new Uint8Array(W * HH * 4); // Rohdaten (nicht vormultipliziert, Zeile 0 = unten) für die GPU
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
      const ri = ((HH - 1 - (Math.floor(t / GRID) * TILE + y)) * W + (t % GRID) * TILE + x) * 4;
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

// Gegenstands-Symbole (Werkzeuge, Barren, Nahrung) im Pixel-Stil: 16×16 Raster, 32 px je Symbol, 8 Spalten
export const ITEM_TILE = 32, ITEM_GRID = 8;
export function drawItems(items) {
  const cv = document.createElement('canvas');
  cv.width = ITEM_TILE * ITEM_GRID; cv.height = ITEM_TILE * Math.max(1, Math.ceil(items.length / ITEM_GRID));
  const g = cv.getContext('2d');
  items.forEach((it, k) => {
    const ox = (k % ITEM_GRID) * ITEM_TILE, oy = Math.floor(k / ITEM_GRID) * ITEM_TILE;
    const px = (x, y, c, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(ox + x * 2, oy + y * 2, w * 2, h * 2); };
    const stick = (from = 2) => { for (let i = from; i < 14; i++) { px(i, 15 - i, '#5a3a1e'); px(i, 14 - i, '#8a6034'); } };
    const shade = (c, f) => { const n = parseInt(c.slice(1), 16), m = v => Math.max(0, Math.min(255, Math.round(v * f))); return `rgb(${m(n >> 16)},${m((n >> 8) & 255)},${m(n & 255)})`; };
    const col = it.col || '#ccc', dk = shade(col, 0.62), lt = shade(col, 1.18);
    switch (it.draw) {
      case 'stick': stick(1); break;
      case 'ingot':
        for (let y = 0; y < 5; y++) px(3 + y, 6 + y, y ? col : lt, 10 - y, 1);
        px(3, 11, dk, 10, 1); px(12, 6, dk, 1, 5); break;
      case 'apple':
        px(5, 5, '#c82a2a', 7, 8); px(4, 6, '#c82a2a', 9, 6); px(6, 6, '#f06a5a', 2, 2); px(5, 12, '#8a1a1a', 7, 1);
        px(8, 2, '#5a3a1e', 1, 3); px(9, 2, '#3c8a2a', 3, 2); break;
      case 'meat':
        px(3, 5, col, 9, 7); px(2, 6, col, 11, 5); px(4, 6, lt, 3, 2); px(3, 11, dk, 9, 1);
        px(12, 9, '#efe6d2', 2, 2); px(13, 8, '#efe6d2', 2, 1); px(13, 11, '#efe6d2', 2, 1); break;
      case 'spitzhacke':
        stick(3);
        for (let i = 0; i < 10; i++) { const x = 3 + i, y = 2 + Math.round(Math.abs(i - 4.5) * 0.55); px(x, y, col); px(x, y + 1, dk); }
        px(3, 4, lt); px(12, 4, lt); break;
      case 'axt':
        stick(3);
        px(8, 2, col, 4, 5); px(7, 3, col, 1, 4); px(12, 3, dk, 1, 3); px(8, 2, lt, 4, 1); px(8, 6, dk, 4, 1); break;
      case 'schaufel':
        stick(5);
        px(10, 2, col, 4, 4); px(9, 3, col, 1, 3); px(14, 3, dk, 1, 3); px(10, 2, lt, 4, 1); px(11, 6, dk, 2, 1); break;
      case 'hacke':
        stick(3);
        px(9, 2, col, 5, 2); px(12, 4, col, 2, 2); px(9, 2, lt, 5, 1); px(13, 4, dk, 1, 2); break;
      case 'schwert':
        for (let i = 0; i < 9; i++) { px(5 + i, 10 - i, col); px(6 + i, 10 - i, lt); px(5 + i, 11 - i, dk); }
        px(3, 10, '#5a3a1e', 4, 1); px(5, 8, '#5a3a1e', 1, 5); px(2, 13, '#8a6034', 2, 2); px(4, 11, '#8a6034', 1, 2); break;
      case 'seeds':
        [[4, 6], [8, 4], [10, 8], [6, 10], [11, 11], [5, 13], [9, 12]].forEach(([x, y]) => { px(x, y, '#c8b060', 2, 1); px(x, y + 1, '#8a7a3a', 2, 1); });
        break;
      case 'wheat':
        for (let i = 0; i < 3; i++) { const x = 5 + i * 3; px(x, 7, '#6a8a2a', 1, 8); px(x - 1, 2, '#e0c060', 3, 5); px(x, 1, '#f0d880', 1, 2); }
        px(4, 11, '#8a6a2a', 9, 1); break;
      case 'bread':
        px(2, 6, '#c8843c', 12, 6); px(3, 5, '#d89848', 10, 1); px(2, 12, '#8a5420', 12, 1);
        for (let i = 0; i < 3; i++) px(4 + i * 3, 7, '#f0c070', 2, 1); break;
      case 'helm':
        px(4, 4, col, 8, 3); px(3, 6, col, 10, 4); px(3, 10, dk, 3, 2); px(10, 10, dk, 3, 2); px(5, 4, lt, 5, 1); px(6, 8, '#1a1a22', 4, 1); break;
      case 'harnisch':
        px(3, 3, col, 3, 3); px(10, 3, col, 3, 3); px(4, 5, col, 8, 8); px(5, 5, lt, 2, 6); px(4, 12, dk, 8, 1); px(7, 3, dk, 2, 3); break;
      default: px(4, 4, col, 8, 8);
    }
  });
  return cv;
}
