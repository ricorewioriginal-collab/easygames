// Weltkarte: entdeckte Gebiete (Bitfeld je Region aus 32×32 Chunks), eigene Markierungen und bekannte Funkstationen.
// Gespeichert wird nur, was nicht aus dem Seed folgt; Farben werden beim Zeichnen berechnet und zwischengespeichert.
import { B, BLOCKS } from './blocks.js';
import { CS, H, SEA } from './consts.js';
import { biomeColumn, BIOME_COLORS } from './worldgen.js';
import { terrainHeight } from './world.js';

export const MAX_MARKS = 20, MAX_RADIOS = 64, TILE = 4; // TILE: Kartenpixel je Chunkkante (1 Pixel = 4 Blöcke)
const RS = 32; // Chunks je Regionskante
const enc = u8 => { let s = ''; for (const b of u8) s += String.fromCharCode(b); return btoa(s); };
const dec = s => { const bin = atob(s), out = new Uint8Array(128); for (let i = 0; i < Math.min(128, bin.length); i++) out[i] = bin.charCodeAt(i); return out; };
const fin = v => Number.isFinite(v);

export class WorldMap {
  constructor(data) {
    this.regions = new Map(); this.marks = []; this.radios = new Map(); this.tiles = new Map(); this.count = 0;
    const d = data && typeof data === 'object' ? data : {};
    if (d.seen && typeof d.seen === 'object') for (const [k, v] of Object.entries(d.seen)) {
      if (!/^-?\d+,-?\d+$/.test(k) || typeof v !== 'string') continue;
      try { const u = dec(v); this.regions.set(k, u); for (const b of u) for (let x = b; x; x &= x - 1) this.count++; } catch { /* kaputter Eintrag */ }
    }
    if (Array.isArray(d.marks)) for (const m of d.marks.slice(0, MAX_MARKS)) if (m && fin(m.x) && fin(m.z)) this.marks.push({ x: Math.round(m.x), z: Math.round(m.z), n: String(m.n || 'Markierung').slice(0, 24) });
    if (Array.isArray(d.radios)) for (const r of d.radios.slice(0, MAX_RADIOS)) if (Array.isArray(r) && r.length === 3 && r.every(Number.isInteger)) this.radios.set(r.join(','), r);
  }
  has(cx, cz) {
    const u = this.regions.get(`${Math.floor(cx / RS)},${Math.floor(cz / RS)}`);
    if (!u) return false;
    const i = (cx - Math.floor(cx / RS) * RS) + (cz - Math.floor(cz / RS) * RS) * RS;
    return (u[i >> 3] & (1 << (i & 7))) !== 0;
  }
  mark(cx, cz) {
    const k = `${Math.floor(cx / RS)},${Math.floor(cz / RS)}`;
    let u = this.regions.get(k);
    if (!u) { u = new Uint8Array(128); this.regions.set(k, u); }
    const i = (cx - Math.floor(cx / RS) * RS) + (cz - Math.floor(cz / RS) * RS) * RS;
    if (u[i >> 3] & (1 << (i & 7))) return false;
    u[i >> 3] |= 1 << (i & 7); this.count++;
    return true;
  }
  // Chunks im Umkreis r als entdeckt markieren; liefert die Zahl neuer Chunks
  markAround(px, pz, r) {
    const cx = Math.floor(px / CS), cz = Math.floor(pz / CS);
    let n = 0;
    for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dz * dz <= r * r + 1 && this.mark(cx + dx, cz + dz)) n++;
    return n;
  }
  // Funkstationen aus geladenen Chunks übernehmen, abgebaute vergessen
  syncRadios(world) {
    for (const [k, r] of this.radios) {
      if (world.getChunk(r[0] >> 4, r[2] >> 4) && world.getBlock(r[0], r[1], r[2]) !== B.RADIO) this.radios.delete(k);
    }
    for (const [k, r] of world.radios) if (this.radios.size < MAX_RADIOS && this.has(r[0] >> 4, r[2] >> 4)) this.radios.set(k, r);
  }
  addMark(x, z, n) {
    if (this.marks.length >= MAX_MARKS) return false;
    this.marks.push({ x: Math.round(x), z: Math.round(z), n: String(n || `Markierung ${this.marks.length + 1}`).slice(0, 24) });
    return true;
  }
  removeMark(i) { if (i >= 0 && i < this.marks.length) this.marks.splice(i, 1); }
  serialize() {
    if (!this.count && !this.marks.length) return undefined;
    const seen = {};
    for (const [k, u] of this.regions) seen[k] = enc(u);
    return { seen, marks: this.marks.length ? this.marks : undefined, radios: this.radios.size ? [...this.radios.values()] : undefined };
  }
  // Farben eines Chunks (TILE×TILE Pixel, RGBA): aus den echten Blöcken, sonst aus dem Generator
  tile(world, cx, cz) {
    const k = `${cx},${cz}`, c = world.getChunk(cx, cz);
    let t = this.tiles.get(k);
    if (t && (t.real || !c)) return t.px;
    if (this.tiles.size > 6000) this.tiles.clear();
    const px = new Uint8ClampedArray(TILE * TILE * 4), col = {}, step = CS / TILE;
    for (let j = 0; j < TILE; j++) for (let i = 0; i < TILE; i++) {
      const lx = i * step + 1, lz = j * step + 1, o = (j * TILE + i) * 4;
      let rgb, k2 = 1;
      if (c) {
        const idx = lx + lz * CS;
        let y = Math.min(H - 1, c.maxY);
        while (y > 0 && c.data[idx + y * CS * CS] === B.AIR) y--;
        const b = c.data[idx + y * CS * CS];
        rgb = BLOCKS[b] && BLOCKS[b].map ? BLOCKS[b].map : [200, 200, 210];
        if (b !== B.WATER) k2 = Math.max(0.6, Math.min(1.3, 0.85 + (y - SEA) * 0.012));
      } else {
        const wx = cx * CS + lx, wz = cz * CS + lz;
        if (world.gen >= 2) { biomeColumn(world.seed, wx, wz, col); rgb = col.h < SEA ? BIOME_COLORS[0] : BIOME_COLORS[col.biome]; if (col.h >= SEA) k2 = Math.max(0.6, Math.min(1.3, 0.85 + (col.h - SEA) * 0.012)); }
        else { const h = terrainHeight(world.seed, wx, wz); rgb = h < SEA ? BIOME_COLORS[0] : h <= SEA + 1 ? BIOME_COLORS[1] : h > 40 ? BIOME_COLORS[5] : BIOME_COLORS[2]; }
      }
      px[o] = rgb[0] * k2; px[o + 1] = rgb[1] * k2; px[o + 2] = rgb[2] * k2; px[o + 3] = 255;
    }
    this.tiles.set(k, { px, real: !!c });
    return px;
  }
}
