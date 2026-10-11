// Welt: Terrain-Generierung (Generator 1 = Originalwelt, 2 = Biome/Höhlen/Erze, 3 = wie 2 plus Dörfer und Minen), Chunk-Speicher.
import { B, NAMES, LOGO0, LOGO_COUNT, LOGO_NAMES, SPECIAL0, SPECIAL_COUNT, SPECIAL_NAMES, SOLID, OPAQUE, SKYBLOCK, EMIT, isLogo } from './blocks.js';
import { biomeColumn, decorateChunk, BIOME, GEN2_SPAWN_BIOMES } from './worldgen.js';
import { SIG_BLOCKS } from './signal.js';
import { placeStructures, nearestVillage, villageIn, regionOf, VR } from './structures.js';
export { B, NAMES, LOGO0, LOGO_COUNT, LOGO_NAMES, SPECIAL0, SPECIAL_COUNT, SPECIAL_NAMES, SOLID, OPAQUE, SKYBLOCK, EMIT, isLogo };
import { CS, H, SEA } from './consts.js';
import { hash, fbm } from './noise.js';
export { CS, H, SEA };
export const GEN_LATEST = 3; // Generator für neue Welten
export const normGen = g => (g === 2 || g === 3 ? g : 1); // fehlt/unbekannt = Originalwelt
const H1_MAX = 52;           // Höhengrenze der Originalwelt (Generator 1), nie ändern

export function terrainHeight(seed, wx, wz) {
  const n = fbm(wx / 110, wz / 110, seed, 4);
  const m = fbm(wx / 24, wz / 24, seed + 5, 2);
  const h = Math.floor(10 + n * 44 + (m - 0.5) * 5);
  return Math.max(2, Math.min(H1_MAX, h));
}

export function chunkKey(cx, cz) { return (cx + 32768) * 65536 + (cz + 32768); }

export class World {
  constructor(seed, edits, gen = 1) {
    this.seed = seed | 0;
    this.gen = normGen(gen);
    this.chunks = new Map();
    this.edits = edits || new Map(); // key -> Map(index -> type)
    this.dirty = new Set();
    this.radios = new Map(); // Radio-Blöcke: 'x,y,z' -> [x, y, z]
    this.sig = new Map();    // Funk-/Signalblöcke: 'x,y,z' -> [x, y, z, typ] (nur gesetzte, nie erzeugte)
    this.sigDirty = false;   // Signalnetz neu berechnen
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
    let maxY = this.gen >= 2 ? decorateChunk(this.seed, cx, cz, data) : this.generate1(cx, cz, data);
    if (this.gen === 3) maxY = placeStructures(this.seed, cx, cz, data, maxY, (x, y, z) => this.radios.set(`${x},${y},${z}`, [x, y, z]));
    return this.finish(cx, cz, key, data, maxY);
  }

  // Generator 1: unverändert aus Version 1.0, damit alte Spielstände exakt dieselbe Welt bekommen
  generate1(cx, cz, data) {
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
    return maxY;
  }

  finish(cx, cz, key, data, maxY) {
    // gespeicherte Änderungen
    const ed = this.edits.get(key);
    if (ed) for (const [i, t] of ed) {
      const y = (i / (CS * CS)) | 0;
      if (data[i] === B.RADIO && t !== B.RADIO) this.radios.delete(`${cx * CS + (i & 15)},${y},${cz * CS + ((i >> 4) & 15)}`); // erzeugtes Radio abgebaut
      data[i] = t;
      if (y > maxY) maxY = y;
      const wx = cx * CS + (i & 15), wz = cz * CS + ((i >> 4) & 15);
      if (t === B.RADIO) this.radios.set(`${wx},${y},${wz}`, [wx, y, wz]);
      if (SIG_BLOCKS.has(t)) { this.sig.set(`${wx},${y},${wz}`, [wx, y, wz, t]); this.sigDirty = true; }
      else if (this.sig.delete(`${wx},${y},${wz}`)) this.sigDirty = true;
    }
    return { cx, cz, key, data, maxY, hm: null, opaque: null, trans: null, logo: null, meshed: false };
  }

  getBlock(x, y, z) {
    if (y < 0) return B.STONE;
    if (y >= H) return B.AIR;
    const c = this.chunks.get(chunkKey(x >> 4, z >> 4));
    return c ? c.data[(x & 15) + (z & 15) * CS + y * CS * CS] : B.AIR;
  }

  isLoaded(x, z) { return this.chunks.has(chunkKey(x >> 4, z >> 4)); }

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
    const old = c.data[i];
    if (old === t) return false;
    c.data[i] = t;
    if (old === B.RADIO) this.radios.delete(`${x},${y},${z}`);
    if (t === B.RADIO) this.radios.set(`${x},${y},${z}`, [x, y, z]);
    if (SIG_BLOCKS.has(t)) { this.sig.set(`${x},${y},${z}`, [x, y, z, t]); this.sigDirty = true; }
    else if (SIG_BLOCKS.has(old)) { this.sig.delete(`${x},${y},${z}`); this.sigDirty = true; }
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

  // Sicherer Startpunkt: erste Landfläche ohne Baum (Generator 2: in Ebene, Wald oder Blumenwiese)
  // village = false: nicht im Dorf starten (Story: das Dorf ist ein Auftrag)
  findSpawn(village = true) {
    if (this.gen === 3 && village) { // am Dorfplatz des nächsten Dorfes, sonst wie Generator 2
      const v = nearestVillage(this.seed);
      if (v) { this.ensure(v.x >> 4, (v.z + 3) >> 4); return { x: v.x + 0.5, y: v.y + 1.01, z: v.z + 3.5 }; }
    }
    if (this.gen >= 2) {
      const s = this.findSpawn2();
      if (s) return s;
    }
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
    return { x: 0.5, y: H1_MAX + 2, z: 0.5 };
  }

  findSpawn2() {
    const col = {};
    for (let r = 0; r < 120; r++) {
      const n = Math.max(1, r * 8);
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        const x = Math.round(Math.cos(a) * r * 8), z = Math.round(Math.sin(a) * r * 8);
        biomeColumn(this.seed, x, z, col);
        if (!GEN2_SPAWN_BIOMES.includes(col.biome) || col.h < SEA + 2 || col.h > SEA + 18) continue;
        const c = this.ensure(x >> 4, z >> 4);
        let y = H - 1;
        while (y > 0 && c.data[(x & 15) + (z & 15) * CS + y * CS * CS] === B.AIR) y--;
        const t = c.data[(x & 15) + (z & 15) * CS + y * CS * CS];
        if (t !== B.GRASS && t !== B.FLOWERS) continue;
        if (c.data[(x & 15) + (z & 15) * CS + (y + 1) * CS * CS] !== B.AIR || c.data[(x & 15) + (z & 15) * CS + (y + 2) * CS * CS] !== B.AIR) continue;
        return { x: x + 0.5, y: y + 1.01, z: z + 0.5 };
      }
    }
    return null;
  }

  // Biom an einer Weltposition (Generator 1 kennt keine Biome)
  biomeAt(x, z) {
    if (this.gen < 2) return -1;
    return biomeColumn(this.seed, Math.floor(x), Math.floor(z), {}).biome;
  }
  // Dorf, in dessen Bereich (x, z) liegt (nur Generator 3), sonst null
  villageAt(x, z) {
    if (this.gen !== 3) return null;
    const v = villageIn(this.seed, regionOf(Math.floor(x)), regionOf(Math.floor(z)));
    return v && Math.hypot(v.x + 0.5 - x, v.z + 0.5 - z) <= VR + 4 ? v : null;
  }
}
export { BIOME };
