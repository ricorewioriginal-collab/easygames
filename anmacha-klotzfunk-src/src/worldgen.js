// Welt-Generator 2: mehrstufiges Noise (Kontinente, Gebirge, Temperatur, Feuchtigkeit, Besonderheit),
// 15 Biome, Höhlen (Tunnel, Kavernen, unterirdische Seen, Kristalle), Erzadern und Bäume über Chunkgrenzen.
// Alles hängt nur vom Seed und der Weltposition ab: gleiche Eingabe = gleiche Welt, egal in welcher Reihenfolge Chunks entstehen.
import { B } from './blocks.js';
import { CS, H, SEA } from './consts.js';
import { hash, fbm } from './noise.js';

export const BIOME = {
  OCEAN: 0, BEACH: 1, PLAINS: 2, FOREST: 3, TAIGA: 4, MOUNTAINS: 5, SNOW: 6, DESERT: 7,
  SWAMP: 8, JUNGLE: 9, MEADOW: 10, VOLCANO: 11, MUSHROOM: 12, CRYSTAL: 13, COAST: 14
};
export const BIOME_NAMES = ['Meer', 'Strand', 'Grüne Ebene', 'Laubwald', 'Nadelwald', 'Berge', 'Schneegebiet', 'Wüste',
  'Sumpf', 'Dschungel', 'Blumenwiese', 'Vulkanregion', 'Pilzwald', 'Kristallgebiet', 'Felsküste'];
// Kartenfarben je Biom (Weltkarte)
export const BIOME_COLORS = [[40, 90, 180], [222, 206, 146], [110, 176, 70], [52, 122, 46], [44, 96, 70], [130, 130, 136], [236, 242, 248], [228, 200, 120],
  [78, 98, 60], [36, 140, 40], [170, 190, 90], [70, 50, 50], [130, 100, 140], [110, 220, 240], [120, 118, 112]];
export const GEN2_SPAWN_BIOMES = [BIOME.PLAINS, BIOME.FOREST, BIOME.MEADOW];

const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const stretch = x => Math.max(0, Math.min(1, (x - 0.5) * 2.4 + 0.5));
const SHORE_CAVE_MAX = SEA - 14; // tiefer als jeder Meeresboden: Höhlen unter Küsten laufen nie neben Wasser
const TUNNEL_MIN = 6, LAKE_Y = 5, CAVERN_LO = 5;

// Säuleninfo an (wx, wz): Höhe, Biom, Klima und Höhlen-Intervalle. out wird befüllt und zurückgegeben.
export function biomeColumn(seed, wx, wz, out) {
  const c = fbm(wx / 640, wz / 640, seed + 1, 4);
  const land = smooth(0.4, 0.5, c);
  const d = fbm(wx / 52, wz / 52, seed + 3, 3);
  const mount = smooth(0.56, 0.72, fbm(wx / 300, wz / 300, seed + 2, 3)) * land;
  const t0 = stretch(fbm(wx / 520, wz / 520, seed + 11, 3)) + (hash(wx, wz, seed + 5) - 0.5) * 0.05;
  const u = stretch(fbm(wx / 480, wz / 480, seed + 23, 3)) + (hash(wx, wz, seed + 6) - 0.5) * 0.05;
  const w = stretch(fbm(wx / 360, wz / 360, seed + 37, 2));

  let h = (SEA - 13 + d * 8) * (1 - land) + (SEA + 2 + d * 12) * land;
  if (mount > 0) {
    const ridge = 1 - Math.abs(fbm(wx / 80, wz / 80, seed + 4, 2) * 2 - 1);
    h += mount * (12 + ridge * 36);
  }
  // Sumpf: flach auf Wasserhöhe, mit Tümpeln
  const swampy = smooth(0.74, 0.82, u) * smooth(0.42, 0.5, t0) * (1 - smooth(0, 0.2, mount)) * land;
  if (swampy > 0) h += (SEA + (d < 0.45 ? -1 : 1) - h) * swampy;
  // Vulkan: Kegel mit Magmakrater
  const volc = t0 > 0.6 ? smooth(0.86, 0.98, w) * land * (1 - swampy) : 0;
  if (volc > 0) h += volc * 26 - smooth(0.8, 0.95, volc) * 5;
  h = Math.max(2, Math.min(H - 12, Math.floor(h)));
  const t = t0 - Math.max(0, h - (SEA + 18)) * 0.012;

  let b;
  if (swampy > 0.5) b = BIOME.SWAMP;
  else if (h < SEA) b = BIOME.OCEAN;
  else if (volc > 0.05) b = BIOME.VOLCANO;
  else if (mount > 0.3 && h > SEA + 18) b = BIOME.MOUNTAINS;
  else if (h <= SEA + 1) b = t < 0.32 || mount > 0.15 ? BIOME.COAST : BIOME.BEACH;
  else if (w > 0.86) b = u > 0.5 ? BIOME.MUSHROOM : BIOME.CRYSTAL;
  else if (t < 0.16) b = BIOME.SNOW;
  else if (t < 0.3) b = BIOME.TAIGA;
  else if (t > 0.7 && u < 0.4) b = BIOME.DESERT;
  else if (t > 0.66 && u > 0.62) b = BIOME.JUNGLE;
  else if (u > 0.56) b = BIOME.FOREST;
  else if (fbm(wx / 110, wz / 110, seed + 41, 2) > 0.6) b = BIOME.MEADOW;
  else b = BIOME.PLAINS;

  out.h = h; out.biome = b; out.t = t; out.u = u; out.d = d; out.volc = volc;

  // Höhlen: zwei Tunnel-Ebenen (2D-Noise-Adern) und Kavernen; Grenze nach oben je nach Lage
  const nearWater = h < SEA + 6;
  const lim = nearWater ? Math.min(h - 5, SHORE_CAVE_MAX) : h; // an Land dürfen Tunnel Eingänge bilden
  out.t0lo = out.t1lo = out.cvlo = 1e9; out.t0hi = out.t1hi = out.cvhi = -1; out.lake = false; out.open = false;
  for (let L = 0; L < 2; L++) {
    const dist = Math.abs(fbm(wx / 64, wz / 64, seed + 50 + L * 7, 2) - 0.5);
    if (dist >= 0.024) continue;
    const yc = 8 + L * 13 + fbm(wx / 90, wz / 90, seed + 60 + L, 2) * 16, r = 1.4 + (1 - dist / 0.024) * 1.6;
    const lo = Math.max(TUNNEL_MIN, Math.ceil(yc - r)), hi = Math.min(lim, Math.floor(yc + r * 0.75));
    if (hi < lo) continue;
    if (L === 0) { out.t0lo = lo; out.t0hi = hi; } else { out.t1lo = lo; out.t1hi = hi; }
    if (hi >= h) out.open = true;
  }
  const cv = fbm(wx / 36, wz / 36, seed + 70, 2);
  if (cv > 0.66) {
    const hi = Math.min(h - 6, nearWater ? SHORE_CAVE_MAX : H, CAVERN_LO + Math.floor((cv - 0.66) * 55));
    if (hi >= CAVERN_LO) { out.cvlo = CAVERN_LO; out.cvhi = hi; out.lake = fbm(wx / 200, wz / 200, seed + 71, 2) > 0.52; }
  }
  return out;
}

// Oberflächenmaterial: [oben, Füllung, Füllungstiefe, zweite Schicht, Tiefe, darunter]
function layers(col, seed, wx, wz) {
  const h = col.h, d = col.d;
  switch (col.biome) {
    case BIOME.OCEAN: return [d > 0.62 ? B.GRAVEL : d < 0.32 ? B.CLAY : B.SAND, B.SAND, 3, B.STONE, 0, B.STONE];
    case BIOME.BEACH: return [B.SAND, B.SAND, 4, B.SANDSTONE, 3, B.STONE];
    case BIOME.COAST: return [B.GRAVEL, B.STONE, 2, B.STONE, 0, B.STONE];
    case BIOME.MEADOW: return [B.FLOWERS, B.DIRT, 3, B.STONE, 0, B.STONE];
    case BIOME.SNOW: return [B.SNOW, B.DIRT, 3, B.STONE, 0, B.STONE];
    case BIOME.MOUNTAINS:
      if (h > SEA + 44) return [B.SNOW, B.STONE, 1, B.STONE, 0, B.STONE];
      if (h < SEA + 26) return [B.GRASS, B.DIRT, 2, B.STONE, 0, B.STONE];
      return [d > 0.6 ? B.GRAVEL : B.STONE, B.STONE, 1, B.STONE, 0, B.STONE];
    case BIOME.DESERT: return [B.SAND, B.SAND, 4, B.SANDSTONE, 3, B.STONE];
    case BIOME.SWAMP: return [hash(wx, wz, seed + 8) < 0.4 ? B.MUD : B.GRASS, B.MUD, 2, B.DIRT, 2, B.STONE];
    case BIOME.VOLCANO: return [d > 0.74 || fbm(wx / 14, wz / 14, seed + 9, 2) > 0.7 ? B.MAGMA : B.BASALT, B.BASALT, 4, B.STONE, 0, B.STONE]; // Magma nur in Becken und Rinnen
    case BIOME.MUSHROOM: return [B.MYCEL, B.DIRT, 3, B.STONE, 0, B.STONE];
    case BIOME.CRYSTAL: return [d > 0.55 ? B.GRAVEL : B.STONE, B.STONE, 1, B.STONE, 0, B.STONE];
    default: return [B.GRASS, B.DIRT, 3, B.STONE, 0, B.STONE];
  }
}

// Baum- und Objektdichte je Biom (Anteil der Säulen)
const FEATURE = [];
FEATURE[BIOME.PLAINS] = ['oak', 0.004]; FEATURE[BIOME.FOREST] = ['oak', 0.035]; FEATURE[BIOME.MEADOW] = ['oak', 0.002];
FEATURE[BIOME.TAIGA] = ['spruce', 0.03]; FEATURE[BIOME.SNOW] = ['spruce', 0.008]; FEATURE[BIOME.MOUNTAINS] = ['spruce', 0.006];
FEATURE[BIOME.JUNGLE] = ['jungle', 0.045]; FEATURE[BIOME.SWAMP] = ['oak', 0.012]; FEATURE[BIOME.DESERT] = ['cactus', 0.006];
FEATURE[BIOME.MUSHROOM] = ['mushroom', 0.012]; FEATURE[BIOME.CRYSTAL] = ['spire', 0.012];
const GROUND = new Set([B.GRASS, B.DIRT, B.SNOW, B.FLOWERS, B.MUD, B.MYCEL, B.SAND, B.STONE, B.GRAVEL]);

const M = 3, W = CS + 2 * M;            // Rand für Bäume aus Nachbar-Chunks
const COLS = Array.from({ length: W * W }, () => ({}));

// Füllt data (CS*CS*H, leer) für Chunk (cx, cz); gibt die höchste belegte y zurück.
export function decorateChunk(seed, cx, cz, data) {
  const X0 = cx * CS, Z0 = cz * CS;
  for (let z = 0; z < W; z++) for (let x = 0; x < W; x++) biomeColumn(seed, X0 + x - M, Z0 + z - M, COLS[z * W + x]);
  let maxY = SEA;
  const at = (x, y, z) => x + z * CS + y * CS * CS;

  // 1) Gelände, Wasser, Eis
  for (let z = 0; z < CS; z++) for (let x = 0; x < CS; x++) {
    const col = COLS[(z + M) * W + x + M], h = col.h, wx = X0 + x, wz = Z0 + z;
    const [top, f1, n1, f2, n2, deep] = layers(col, seed, wx, wz);
    for (let y = 0; y <= h; y++) {
      const k = h - y;
      data[at(x, y, z)] = y === 0 ? B.STONE : k === 0 ? top : k <= n1 ? f1 : k <= n1 + n2 ? f2 : deep;
    }
    for (let y = h + 1; y <= SEA; y++) data[at(x, y, z)] = y === SEA && col.t < 0.16 && col.biome !== BIOME.SWAMP ? B.ICE : B.WATER;
    if (h > maxY) maxY = h;
  }

  // 2) Höhlen ausschneiden, Seen füllen, Kristalle setzen
  for (let z = 0; z < CS; z++) for (let x = 0; x < CS; x++) {
    const col = COLS[(z + M) * W + x + M];
    for (let y = col.t0lo; y <= col.t0hi; y++) data[at(x, y, z)] = B.AIR;
    for (let y = col.t1lo; y <= col.t1hi; y++) data[at(x, y, z)] = B.AIR;
    if (col.cvhi >= 0) {
      for (let y = col.cvlo; y <= col.cvhi; y++) data[at(x, y, z)] = B.AIR;
      if (col.lake) data[at(x, LAKE_Y, z)] = B.WATER;
      else if (hash(X0 + x, Z0 + z, seed + 72) < (col.biome === BIOME.CRYSTAL ? 0.22 : 0.04)) {
        const n = 1 + Math.floor(hash(X0 + x, Z0 + z, seed + 73) * 3);
        for (let y = CAVERN_LO; y < CAVERN_LO + n && y <= col.cvhi; y++) data[at(x, y, z)] = B.CRYSTAL;
      }
    }
  }

  // 3) Erzadern (nur in Stein, innerhalb des Chunks)
  const vein = (type, tries, ymin, ymax, size, salt) => {
    for (let k = 0; k < tries; k++) {
      const r = i => hash(cx * 31 + k * 7 + i, cz * 17 - k, seed + salt);
      let x = Math.floor(r(1) * CS), z = Math.floor(r(2) * CS), y = ymin + Math.floor(r(3) * (ymax - ymin));
      for (let s = 0; s < size; s++) {
        const i = at(x, y, z);
        if (data[i] === B.STONE) data[i] = type;
        const dir = Math.floor(r(4 + s) * 6), sg = dir & 1 ? 1 : -1;
        if (dir < 2) x = Math.max(0, Math.min(CS - 1, x + sg));
        else if (dir < 4) z = Math.max(0, Math.min(CS - 1, z + sg));
        else y = Math.max(1, Math.min(H - 1, y + sg));
      }
    }
  };
  vein(B.COAL, 16, 6, 70, 6, 80);
  vein(B.COPPER, 9, 4, 44, 5, 81);
  vein(B.IRON, 7, 2, 30, 4, 82);
  vein(B.CRYSTAL, 2, 2, 14, 3, 83);

  // 4) Bäume und Objekte (auch aus Nachbarsäulen, damit Kronen über Chunkgrenzen passen)
  const put = (x, y, z, t, any) => {
    if (x < 0 || x >= CS || z < 0 || z >= CS || y < 1 || y >= H) return;
    const i = at(x, y, z);
    if (any || data[i] === B.AIR) { data[i] = t; if (y > maxY) maxY = y; }
  };
  for (let z = 0; z < W; z++) for (let x = 0; x < W; x++) {
    const col = COLS[z * W + x], f = FEATURE[col.biome];
    if (!f || col.open || col.h <= SEA) continue;
    const wx = X0 + x - M, wz = Z0 + z - M;
    if (hash(wx, wz, seed + 99) >= f[1]) continue;
    const lx = x - M, lz = z - M, h = col.h, r1 = hash(wx, wz, seed + 7);
    // Untergrund muss zum Objekt passen (berechnet wie Schritt 1, also auch für Nachbarsäulen gültig)
    const top = layers(col, seed, wx, wz)[0];
    if (!GROUND.has(top)) continue;
    if (f[0] === 'cactus') {
      if (top !== B.SAND) continue;
      const n = 1 + Math.floor(r1 * 3);
      for (let y = 1; y <= n; y++) put(lx, h + y, lz, B.CACTUS);
    } else if (f[0] === 'spire') {
      const n = 2 + Math.floor(r1 * 4);
      for (let y = 1; y <= n; y++) put(lx, h + y, lz, B.CRYSTAL);
      put(lx + (r1 < 0.5 ? 1 : -1), h + 1, lz, B.CRYSTAL);
    } else if (f[0] === 'mushroom') {
      const th = 4 + Math.floor(r1 * 3);
      for (let y = 1; y <= th; y++) put(lx, h + y, lz, B.STEM, true);
      for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) {
        const corner = Math.abs(dx) === 2 && Math.abs(dz) === 2;
        if (!corner) put(lx + dx, h + th + 1, lz + dz, B.SHROOM);
        if (!corner && (Math.abs(dx) === 2 || Math.abs(dz) === 2)) put(lx + dx, h + th, lz + dz, B.SHROOM);
      }
    } else if (f[0] === 'spruce') {
      const th = 6 + Math.floor(r1 * 4), tip = h + th + 1;
      for (let y = 1; y <= th; y++) put(lx, h + y, lz, B.SPRUCE, true);
      for (let y = h + 3; y <= tip; y++) {
        const r = Math.min(3, Math.floor((tip - y) / 2.2 + (y % 2 ? 0.4 : 0)));
        for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dz * dz <= r * r + 0.5) put(lx + dx, y, lz + dz, B.NEEDLES);
      }
    } else if (f[0] === 'jungle') {
      const th = 8 + Math.floor(r1 * 5);
      for (let y = 1; y <= th; y++) put(lx, h + y, lz, B.WOOD, true);
      for (let dy = -1; dy <= 1; dy++) {
        const r = dy === 1 ? 2 : 3;
        for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
          if (dx * dx + dz * dz > r * r + 1) continue;
          if (r === 3 && hash(wx + dx, wz + dz + dy, seed + 3) < 0.25) continue;
          put(lx + dx, h + th + dy, lz + dz, B.JLEAVES);
        }
      }
    } else { // Laubbaum wie in der Originalwelt
      const th = 4 + Math.floor(r1 * 3);
      for (let dy = 1; dy <= th; dy++) put(lx, h + dy, lz, B.WOOD, true);
      for (let dy = th - 2; dy <= th + 1; dy++) {
        const r = dy >= th ? 1 : 2;
        for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
          if (r === 2 && Math.abs(dx) === 2 && Math.abs(dz) === 2 && hash(wx + dx, wz + dz + dy, seed + 3) < 0.5) continue;
          put(lx + dx, h + dy, lz + dz, B.LEAVES);
        }
      }
    }
  }
  return Math.min(H - 1, maxY);
}
