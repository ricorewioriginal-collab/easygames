// Strukturen für Welt-Generator 3: Dörfer mit Flächenausgleich und verlassene Minen.
// Die Welt ist in Regionen von 160×160 Blöcken geteilt; jede Region hat höchstens ein Dorf und eine Mine,
// beide liegen ganz in ihrer Region. Ein Chunk muss deshalb nur seine eigene Region prüfen.
// Alles hängt nur vom Seed und der Position ab (gleiche Welt, egal in welcher Reihenfolge Chunks entstehen).
import { B } from './blocks.js';
import { CS, H, SEA } from './consts.js';
import { hash } from './noise.js';
import { biomeColumn, BIOME } from './worldgen.js';

export const REGION = 160;
export const VR = 20;            // Radius des ebenen Dorfplatzes
const EDGE = 4;                  // Übergang zum natürlichen Gelände
const VILLAGE_BIOMES = new Set([BIOME.PLAINS, BIOME.FOREST, BIOME.MEADOW, BIOME.TAIGA, BIOME.SNOW, BIOME.DESERT]);
export const ROLES = [
  { key: 'bauer', name: 'Bäuerin Frieda' },
  { key: 'schmied', name: 'Schmied Kalle' },
  { key: 'funker', name: 'Funkerin Lotte' },
  { key: 'hirte', name: 'Hirte Mats' }
];
const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // Häuser im Norden, Osten, Süden, Westen

const cache = new Map();
function cached(key, f) {
  if (cache.has(key)) return cache.get(key);
  const v = f();
  if (cache.size > 512) cache.clear();
  cache.set(key, v);
  return v;
}
export const regionOf = v => Math.floor(v / REGION);

// Dorf der Region (rx, rz) oder null
export function villageIn(seed, rx, rz) {
  return cached(`v${seed},${rx},${rz}`, () => {
    if (hash(rx, rz, seed + 500) > 0.75) return null;
    const x = rx * REGION + 40 + Math.floor(hash(rx, rz, seed + 501) * 80), z = rz * REGION + 40 + Math.floor(hash(rx, rz, seed + 502) * 80);
    const col = {};
    biomeColumn(seed, x, z, col);
    const y = col.h, biome = col.biome;
    if (!VILLAGE_BIOMES.has(biome) || y < SEA + 2 || y > SEA + 22) return null;
    // Gelände muss halbwegs eben und trocken sein
    let lo = y, hi = y;
    for (let dz = -VR - 2; dz <= VR + 2; dz += 4) for (let dx = -VR - 2; dx <= VR + 2; dx += 4) {
      if (dx * dx + dz * dz > (VR + 2) * (VR + 2)) continue;
      biomeColumn(seed, x + dx, z + dz, col);
      if (col.h <= SEA + 1 || col.biome === BIOME.SWAMP || col.biome === BIOME.VOLCANO) return null;
      lo = Math.min(lo, col.h); hi = Math.max(hi, col.h);
    }
    if (hi - lo > 9) return null;
    const n = 3 + (hash(rx, rz, seed + 503) < 0.5 ? 1 : 0);
    const houses = [];
    for (let i = 0; i < n; i++) {
      const [dx, dz] = DIRS[i], hx = x + dx * 11, hz = z + dz * 11;
      houses.push({ x: hx, z: hz, dx, dz, door: { x: hx - dx * 3, z: hz - dz * 3 }, front: { x: hx - dx * 5, z: hz - dz * 5 }, role: ROLES[i] });
    }
    const dry = biome === BIOME.DESERT, cold = biome === BIOME.SNOW || biome === BIOME.TAIGA;
    return {
      id: rx + ',' + rz, x, z, y, biome, houses,
      field: { x0: x + 6, z0: z - 12, x1: x + 12, z1: z - 6 },
      mast: { x: x - 9, z: z + 9 },
      top: dry ? B.SAND : biome === BIOME.SNOW ? B.SNOW : B.GRASS,
      wall: dry ? B.SANDSTONE : cold ? B.SPRUCE : B.PLANKS,
      roof: dry ? B.SANDSTONE : cold ? B.SPRUCE : B.BRICK,
      post: cold ? B.SPRUCE : B.WOOD
    };
  });
}

// Arbeitsplatz eines Dorfbewohners (Tagesablauf: Arbeit, Dorfplatz, Haus)
export function workSpot(v, h) {
  switch (h.role.key) {
    case 'bauer': return { x: v.field.x0 - 1.5, z: (v.field.z0 + v.field.z1) / 2 + 0.5 };
    case 'funker': return { x: v.mast.x + 2.5, z: v.mast.z + 0.5 };
    case 'hirte': return { x: v.x - 8.5, z: v.z - 8.5 };
    default: return { x: h.front.x + 0.5 + h.dz * 2, z: h.front.z + 0.5 + h.dx * 2 }; // Schmied: neben seiner Esse
  }
}

// Verlassene Mine der Region oder null: zwei sich kreuzende Stollen mit Stützbalken
export function mineIn(seed, rx, rz) {
  return cached(`m${seed},${rx},${rz}`, () => {
    if (hash(rx, rz, seed + 600) > 0.5) return null;
    const x = rx * REGION + 40 + Math.floor(hash(rx, rz, seed + 601) * 80), z = rz * REGION + 40 + Math.floor(hash(rx, rz, seed + 602) * 80);
    const y = 10 + Math.floor(hash(rx, rz, seed + 603) * 8), L = 18 + Math.floor(hash(rx, rz, seed + 604) * 12);
    if (biomeColumn(seed, x, z, {}).h < y + 12) return null;
    return { x, y, z, L };
  });
}

// Nächstes Dorf zum Ursprung (für den Startpunkt), Suche über 5×5 Regionen
export function nearestVillage(seed, px = 0, pz = 0, r = 2) {
  const rx0 = regionOf(px), rz0 = regionOf(pz);
  let best = null, bd = Infinity;
  for (let rz = rz0 - r; rz <= rz0 + r; rz++) for (let rx = rx0 - r; rx <= rx0 + r; rx++) {
    const v = villageIn(seed, rx, rz);
    if (!v) continue;
    const d = Math.hypot(v.x - px, v.z - pz);
    if (d < bd) { bd = d; best = v; }
  }
  return best;
}

// Strukturen in einen frisch erzeugten Chunk bauen. onBlock(x, y, z, t) meldet besondere Blöcke (Radio).
// Rückgabe: höchste belegte y (mindestens maxY)
export function placeStructures(seed, cx, cz, data, maxY, onBlock) {
  const X0 = cx * CS, Z0 = cz * CS, rx = regionOf(X0), rz = regionOf(Z0);
  let top = maxY;
  const at = (x, y, z) => (x - X0) + (z - Z0) * CS + y * CS * CS;
  const inside = (x, z) => x >= X0 && x < X0 + CS && z >= Z0 && z < Z0 + CS;
  const set = (x, y, z, t) => {
    if (!inside(x, z) || y < 1 || y >= H) return;
    data[at(x, y, z)] = t;
    if (t && y > top) top = y;
    if (t === B.RADIO && onBlock) onBlock(x, y, z, t);
  };
  const get = (x, y, z) => (inside(x, z) && y >= 0 && y < H ? data[at(x, y, z)] : B.AIR);
  const hits = (x0, z0, x1, z1) => x1 >= X0 && x0 < X0 + CS && z1 >= Z0 && z0 < Z0 + CS;

  const m = mineIn(seed, rx, rz);
  if (m && hits(m.x - m.L - 2, m.z - m.L - 2, m.x + m.L + 2, m.z + m.L + 2)) buildMine(seed, m, X0, Z0, set, get);
  const v = villageIn(seed, rx, rz);
  const R = VR + EDGE;
  if (v && hits(v.x - R, v.z - R, v.x + R, v.z + R)) buildVillage(seed, v, X0, Z0, set, get);
  return top;
}

function buildMine(seed, m, X0, Z0, set, get) {
  const col = {};
  const cell = (wx, wz, t, along) => { // t: Abstand zur Mitte entlang des Stollens, along: 'x' | 'z', Seite −1..1
    if (wx < X0 || wx >= X0 + CS || wz < Z0 || wz >= Z0 + CS) return;
    if (biomeColumn(seed, wx, wz, col).h < m.y + 5) return; // nie unter Meer oder flachem Gelände ausbrechen
    const side = along === 'x' ? wz - m.z : wx - m.x;
    for (let y = m.y; y <= m.y + 2; y++) if (get(wx, y, wz) !== B.WATER) set(wx, y, wz, B.AIR);
    if (get(wx, m.y - 1, wz) === B.AIR) set(wx, m.y - 1, wz, B.PLANKS); // Brücke über Höhlen
    if (t % 5 === 0) { // Stützbalken
      if (side !== 0) { set(wx, m.y, wz, B.WOOD); set(wx, m.y + 1, wz, B.WOOD); }
      set(wx, m.y + 2, wz, side === 0 && t % 10 === 0 && hash(wx, wz, seed + 605) < 0.5 ? B.LAMP : B.PLANKS);
    }
  };
  const wall = (wx, wz) => { // Erz an den Stollenwänden
    if (wx < X0 || wx >= X0 + CS || wz < Z0 || wz >= Z0 + CS || get(wx, m.y + 1, wz) !== B.STONE) return;
    const r = hash(wx, wz, seed + 606);
    if (r < 0.07) set(wx, m.y + 1, wz, r < 0.035 ? B.COAL : r < 0.055 ? B.COPPER : B.IRON);
  };
  for (let t = -m.L; t <= m.L; t++) {
    for (let s = -1; s <= 1; s++) { cell(m.x + t, m.z + s, Math.abs(t), 'x'); cell(m.x + s, m.z + t, Math.abs(t), 'z'); }
    wall(m.x + t, m.z - 2); wall(m.x + t, m.z + 2); wall(m.x - 2, m.z + t); wall(m.x + 2, m.z + t);
  }
  // Kammer in der Mitte mit altem Ofen
  for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) {
    const wx = m.x + dx, wz = m.z + dz;
    if (wx < X0 || wx >= X0 + CS || wz < Z0 || wz >= Z0 + CS) continue;
    for (let y = m.y; y <= m.y + 3; y++) set(wx, y, wz, B.AIR);
  }
  set(m.x + 2, m.y, m.z + 2, B.FURNACE);
  set(m.x - 2, m.y, m.z + 2, B.WORKBENCH);
}

function buildVillage(seed, v, X0, Z0, set, get) {
  const col = {}, y = v.y, R = VR + EDGE;
  // 1) Gelände angleichen: innen eben auf Platzhöhe, am Rand weicher Übergang; Bäume darüber entfernen
  for (let z = Z0; z < Z0 + CS; z++) for (let x = X0; x < X0 + CS; x++) {
    const r = Math.hypot(x - v.x, z - v.z);
    if (r > R) continue;
    const ho = biomeColumn(seed, x, z, col).h;
    const ht = r <= VR ? y : Math.round(y + (ho - y) * (r - VR) / EDGE);
    for (let yy = Math.min(ho + 1, ht - 3); yy < ht; yy++) set(x, yy, z, B.DIRT); // auffüllen, Höhleneingänge schließen
    set(x, ht, z, v.top);
    for (let yy = ht + 1, end = Math.min(H - 1, Math.max(ho, ht) + 18); yy <= end; yy++) if (get(x, yy, z) !== B.AIR) set(x, yy, z, B.AIR);
  }
  const fill = (x0, y0, z0, x1, y1, z1, t) => {
    for (let yy = y0; yy <= y1; yy++) for (let z = Math.max(z0, Z0); z <= Math.min(z1, Z0 + CS - 1); z++)
      for (let x = Math.max(x0, X0); x <= Math.min(x1, X0 + CS - 1); x++) set(x, yy, z, t);
  };
  // 2) Dorfplatz mit Brunnen und Laternen, Wege zu den Häusern
  fill(v.x - 3, y, v.z - 3, v.x + 3, y, v.z + 3, B.PATH);
  for (const h of v.houses) {
    const x0 = Math.min(v.x, h.front.x), x1 = Math.max(v.x, h.front.x), z0 = Math.min(v.z, h.front.z), z1 = Math.max(v.z, h.front.z);
    fill(x0, y, z0, x1, y, z1, B.PATH);
    fill(h.front.x, y, h.front.z, h.door.x, y, h.door.z, B.PATH);
  }
  fill(v.x - 1, y, v.z - 1, v.x + 1, y + 1, v.z + 1, B.COBBLE);
  fill(v.x, y - 1, v.z, v.x, y, v.z, B.WATER);
  set(v.x, y + 1, v.z, B.AIR);
  for (const [dx, dz] of [[-4, -4], [4, -4], [4, 4], [-4, 4]]) { fill(v.x + dx, y + 1, v.z + dz, v.x + dx, y + 2, v.z + dz, v.post); set(v.x + dx, y + 3, v.z + dz, B.LAMP); }
  // 3) Häuser: 7×7, Wände 4 hoch, Pyramidendach, Tür zum Platz, Fenster an den Seiten
  for (const h of v.houses) {
    fill(h.x - 3, y, h.z - 3, h.x + 3, y, h.z + 3, B.COBBLE);
    fill(h.x - 2, y, h.z - 2, h.x + 2, y, h.z + 2, B.PLANKS);
    for (let dz = -3; dz <= 3; dz++) for (let dx = -3; dx <= 3; dx++) {
      const edge = Math.abs(dx) === 3 || Math.abs(dz) === 3, corner = Math.abs(dx) === 3 && Math.abs(dz) === 3;
      for (let yy = y + 1; yy <= y + 4; yy++) set(h.x + dx, yy, h.z + dz, corner ? v.post : edge ? v.wall : B.AIR);
      const mid = (Math.abs(dx) === 3 && dz === 0) || (Math.abs(dz) === 3 && dx === 0);
      if (mid && !(dx === -h.dx * 3 && dz === -h.dz * 3)) set(h.x + dx, y + 2, h.z + dz, B.GLASS);
    }
    set(h.door.x, y + 1, h.door.z, B.AIR); set(h.door.x, y + 2, h.door.z, B.AIR);
    for (let k = 0; k <= 4; k++) fill(h.x - 4 + k, y + 5 + k, h.z - 4 + k, h.x + 4 - k, y + 5 + k, h.z + 4 - k, v.roof);
    set(h.x, y + 4, h.z, B.LAMP);
    // Einrichtung in der hinteren Ecke (weg von der Tür)
    const bx = h.x + h.dx * 2 + (h.dz ? 2 : 0), bz = h.z + h.dz * 2 + (h.dx ? 2 : 0);
    const furn = { bauer: B.WORKBENCH, schmied: B.FURNACE, funker: B.RADIO, hirte: B.WOOL }[h.role.key];
    set(bx, y + 1, bz, furn);
    if (h.role.key === 'schmied') { // Esse vor dem Haus
      const fx = h.front.x + h.dz * 3, fz = h.front.z + h.dx * 3;
      set(fx, y + 1, fz, B.FURNACE); set(fx, y + 2, fz, B.COBBLE);
    }
  }
  // 4) Weizenfeld mit Wasserrinne
  const f = v.field, wz = (f.z0 + f.z1) >> 1;
  for (let z = f.z0; z <= f.z1; z++) for (let x = f.x0; x <= f.x1; x++) {
    if (z === wz) { set(x, y, z, B.WATER); continue; }
    set(x, y, z, B.FARMLAND);
    set(x, y + 1, z, hash(x, z, seed + 510) < 0.7 ? B.WHEAT3 : B.WHEAT2);
  }
  // 5) Funkmast der Funkerin: Holzmast mit Leuchtfeuer, Radio am Fuß
  fill(v.mast.x, y + 1, v.mast.z, v.mast.x, y + 7, v.mast.z, v.post);
  set(v.mast.x, y + 8, v.mast.z, B.LAMP);
  set(v.mast.x + 1, y + 1, v.mast.z, B.RADIO);
}
