// Welt: Block-Typen, Terrain-Generierung, Chunk-Speicher.
export const CS = 16;        // Chunk-Kantenlänge
export const H = 64;         // Weltmaximum (Höhe)
export const SEA = 24;       // Meeresspiegel
export const B = { AIR: 0, GRASS: 1, DIRT: 2, STONE: 3, SAND: 4, WOOD: 5, LEAVES: 6, PLANKS: 7, GLASS: 8, LAMP: 9, WATER: 10 };

// Namen und Eigenschaften je Block-Typ
// Funk-Logos sind Blöcke mit den Ids 11..26
export const LOGO0 = 11, LOGO_COUNT = 16;
export const LOGO_NAMES = ['RicoReWi', 'YourTime-FM', 'RapRadio 24', 'SchlagerPop 24', 'ChartRadio 24', 'ClubRadio 24', 'AnMaCha 24', 'RadioFloh!',
  'RockRadio 24', 'ChristmasRadio', 'KultRadio 24', 'Zocker-FM', 'Special-Radio', 'AnMaChaCast', 'SenderWelt', 'RadioPortal'];
export const NAMES = ['Luft', 'Gras', 'Erde', 'Stein', 'Sand', 'Holz', 'Blätter', 'Bretter', 'Glas', 'Leuchtblock', 'Wasser', ...LOGO_NAMES];
export const SOLID = new Uint8Array(32);   // begehbar blockierend
export const OPAQUE = new Uint8Array(32);  // verdeckt Nachbarflächen
export const SKYBLOCK = new Uint8Array(32); // wirft Schatten (Sonnenlicht)
for (const t of [1, 2, 3, 4, 5, 6, 7, 8, 9]) SOLID[t] = 1;
for (const t of [1, 2, 3, 4, 5, 7, 9]) OPAQUE[t] = 1;
for (let i = 0; i < LOGO_COUNT; i++) { SOLID[LOGO0 + i] = 1; OPAQUE[LOGO0 + i] = 1; }
for (let t = 1; t < 32; t++) if (OPAQUE[t] || t === 6) SKYBLOCK[t] = 1;

function hash(x, z, s) {
  let h = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(z | 0, 0x165667b1) ^ Math.imul(s | 0, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function vnoise(x, z, s) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash(xi, zi, s), b = hash(xi + 1, zi, s), c = hash(xi, zi + 1, s), d = hash(xi + 1, zi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, z, s, oct) {
  let sum = 0, amp = 0.5, f = 1, norm = 0;
  for (let i = 0; i < oct; i++) { sum += amp * vnoise(x * f, z * f, s + i * 101); norm += amp; amp *= 0.5; f *= 2; }
  return sum / norm;
}
export function terrainHeight(seed, wx, wz) {
  const n = fbm(wx / 110, wz / 110, seed, 4);
  const m = fbm(wx / 24, wz / 24, seed + 5, 2);
  const h = Math.floor(10 + n * 44 + (m - 0.5) * 5);
  return Math.max(2, Math.min(H - 12, h));
}

export function chunkKey(cx, cz) { return (cx + 32768) * 65536 + (cz + 32768); }

export class World {
  constructor(seed, edits) {
    this.seed = seed | 0;
    this.chunks = new Map();
    this.edits = edits || new Map(); // key -> Map(index -> type)
    this.dirty = new Set();
  }

  getChunk(cx, cz) { return this.chunks.get(chunkKey(cx, cz)); }

  ensure(cx, cz) {
    const key = chunkKey(cx, cz);
    let c = this.chunks.get(key);
    if (!c) { c = this.generate(cx, cz, key); this.chunks.set(key, c); }
    return c;
  }

  generate(cx, cz, key) {
    const data = new Uint8Array(CS * CS * H);
    const seed = this.seed;
    let maxY = 0;
    for (let z = 0; z < CS; z++) {
      for (let x = 0; x < CS; x++) {
        const wx = cx * CS + x, wz = cz * CS + z;
        const h = terrainHeight(seed, wx, wz);
        const beach = h <= SEA + 1;
        for (let y = 0; y <= h; y++) {
          let t;
          if (y === 0 || y < h - 3) t = B.STONE;
          else if (beach) t = B.SAND;
          else if (y < h) t = B.DIRT;
          else t = h >= 46 ? B.STONE : B.GRASS;
          data[x + z * CS + y * CS * CS] = t;
        }
        for (let y = h + 1; y <= SEA; y++) data[x + z * CS + y * CS * CS] = B.WATER;
        const top = Math.max(h, h < SEA ? SEA : 0);
        if (top > maxY) maxY = top;
      }
    }
    // Bäume (nur im Chunk-Inneren, damit die Krone nie über den Rand ragt)
    for (let z = 2; z < CS - 2; z++) {
      for (let x = 2; x < CS - 2; x++) {
        const wx = cx * CS + x, wz = cz * CS + z;
        if (hash(wx, wz, seed + 99) >= 0.012) continue;
        const h = terrainHeight(seed, wx, wz);
        if (h <= SEA + 1 || h >= 44 || data[x + z * CS + h * CS * CS] !== B.GRASS) continue;
        const th = 4 + Math.floor(hash(wx, wz, seed + 7) * 3);
        for (let dy = 1; dy <= th; dy++) data[x + z * CS + (h + dy) * CS * CS] = B.WOOD;
        for (let dy = th - 2; dy <= th + 1; dy++) {
          const r = dy >= th ? 1 : 2;
          for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
            if (r === 2 && Math.abs(dx) === 2 && Math.abs(dz) === 2 && hash(wx + dx, wz + dz + dy, seed + 3) < 0.5) continue;
            const i = (x + dx) + (z + dz) * CS + (h + dy) * CS * CS;
            if (data[i] === B.AIR) data[i] = B.LEAVES;
          }
        }
        if (h + th + 1 > maxY) maxY = h + th + 1;
      }
    }
    // gespeicherte Änderungen
    const ed = this.edits.get(key);
    if (ed) for (const [i, t] of ed) {
      data[i] = t;
      const y = (i / (CS * CS)) | 0;
      if (y > maxY) maxY = y;
    }
    return { cx, cz, key, data, maxY, hm: null, opaque: null, trans: null, logo: null, meshed: false };
  }

  getBlock(x, y, z) {
    if (y < 0) return B.STONE;
    if (y >= H) return B.AIR;
    const c = this.chunks.get(chunkKey(x >> 4, z >> 4));
    return c ? c.data[(x & 15) + (z & 15) * CS + y * CS * CS] : B.AIR;
  }

  // Für Physik: nicht geladene Bereiche gelten als fest.
  isSolid(x, y, z) {
    if (y < 0) return true;
    if (y >= H) return false;
    const c = this.chunks.get(chunkKey(x >> 4, z >> 4));
    return c ? SOLID[c.data[(x & 15) + (z & 15) * CS + y * CS * CS]] === 1 : true;
  }

  setBlock(x, y, z, t) {
    if (y < 0 || y >= H) return false;
    const cx = x >> 4, cz = z >> 4, c = this.chunks.get(chunkKey(cx, cz));
    if (!c) return false;
    const lx = x & 15, lz = z & 15, i = lx + lz * CS + y * CS * CS;
    if (c.data[i] === t) return false;
    c.data[i] = t;
    if (y > c.maxY) c.maxY = y;
    c.hm = null;
    let ed = this.edits.get(c.key);
    if (!ed) { ed = new Map(); this.edits.set(c.key, ed); }
    ed.set(i, t);
    this.dirty.add(c);
    const nx = lx === 0 ? -1 : lx === CS - 1 ? 1 : 0, nz = lz === 0 ? -1 : lz === CS - 1 ? 1 : 0;
    for (let dz = Math.min(0, nz); dz <= Math.max(0, nz); dz++) {
      for (let dx = Math.min(0, nx); dx <= Math.max(0, nx); dx++) {
        if (dx || dz) { const n = this.chunks.get(chunkKey(cx + dx, cz + dz)); if (n) this.dirty.add(n); }
      }
    }
    return true;
  }

  // Höhenkarte (oberster lichtblockierender Block + 1, 0 = keiner) für Licht
  heightmap(c) {
    if (c.hm) return c.hm;
    const hm = new Uint8Array(CS * CS), d = c.data;
    for (let i = 0; i < CS * CS; i++) {
      for (let y = Math.min(H - 1, c.maxY); y >= 0; y--) if (SKYBLOCK[d[i + y * CS * CS]]) { hm[i] = y + 1; break; }
    }
    return (c.hm = hm);
  }

  // 3x3-Nachbarschaft (Daten) eines Chunks; null wenn nicht vollständig
  neighborhood(c) {
    const out = new Array(9);
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
      const n = this.chunks.get(chunkKey(c.cx + dx, c.cz + dz));
      if (!n) return null;
      out[(dz + 1) * 3 + dx + 1] = n.data;
    }
    return out;
  }

  // Sicherer Startpunkt: erste Landfläche ohne Baum
  findSpawn() {
    for (let r = 0; r < 60; r++) {
      for (let k = 0; k < Math.max(1, r * 8); k++) {
        const a = (k / Math.max(1, r * 8)) * Math.PI * 2;
        const x = Math.round(Math.cos(a) * r * 4), z = Math.round(Math.sin(a) * r * 4);
        const h = terrainHeight(this.seed, x, z);
        if (h <= SEA + 1 || h >= 44) continue;
        const c = this.ensure(x >> 4, z >> 4);
        let y = H - 1;
        while (y > 0 && c.data[(x & 15) + (z & 15) * CS + y * CS * CS] === B.AIR) y--;
        const t = c.data[(x & 15) + (z & 15) * CS + y * CS * CS];
        if (t === B.WOOD || t === B.LEAVES || t === B.WATER) continue;
        return { x: x + 0.5, y: y + 1.01, z: z + 0.5 };
      }
    }
    return { x: 0.5, y: H - 2, z: 0.5 };
  }
}
