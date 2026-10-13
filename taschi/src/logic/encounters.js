// Wild encounter tables per region and habitat.
import { SPECIES, SPECIES_IDS } from '../data/species.js';
import { REGIONS } from '../data/regions.js';
import { baseForm, fitSpecies, prevLevel } from '../data/trainers.js';
import { makeMonster } from './monster.js';

// Additional habitat types per biome so every element lives somewhere.
export const BIOME_EXTRA = {
  valley: ['wasser'], coast: ['normal'], plains: ['flug'], grove: ['normal'], forest: ['geist'], cliffs: ['gestein'],
  volcanic: ['erde'], 'meadow-night': ['elektro'], swamp: ['pflanze'], snow: ['wasser'], canopy: ['elektro'],
  savanna: ['erde'], crystal: ['erde', 'eis'], 'bay-night': ['eis'], mesa: ['erde'], sky: ['elektro']
};
export const HABITAT_TYPES = {
  grass: null, water: ['wasser', 'eis'], cave: ['gestein', 'erde', 'geist'], flowers: ['pflanze', 'flug'], night: ['geist']
};

const cache = new Map();
export function regionPool(r, habitat = 'grass') {
  const k = r + ':' + habitat;
  if (cache.has(k)) return cache.get(k);
  const region = REGIONS[r];
  const primary = HABITAT_TYPES[habitat] || region.types;
  const extra = BIOME_EXTRA[region.biome] || [];
  const ids = SPECIES_IDS.filter(id => !SPECIES[id].ancient && id !== 'schnurrik');
  const weighted = [];
  const lvl = levelRange(r);
  for (const id of ids) {
    const s = SPECIES[id];
    // only base forms (or forms a wild one could plausibly have reached)
    const base = baseForm(id);
    const isBase = base === id;
    const evolvedOk = !isBase && SPECIES[base].evo?.level && lvl[1] >= SPECIES[base].evo.level + 4;
    if (!isBase && !evolvedOk) continue;
    let w = 0;
    if (primary.includes(s.type)) w += 6;
    if (s.type2 && primary.includes(s.type2)) w += 3;
    if (extra.includes(s.type)) w += 1.5;
    if (!w) continue;
    if (!isBase) w *= 0.25;
    // lineage flavour: every region favours two lineages for variety
    if (s.lineage !== undefined && (s.lineage === r % 12 || s.lineage === (r * 5 + 3) % 12)) w *= 1.8;
    weighted.push([id, w]);
  }
  cache.set(k, weighted);
  return weighted;
}

export function levelRange(r) {
  const lo = Math.max(2, prevLevel(r) - 1), hi = Math.max(lo + 2, REGIONS[r].gym.level - 2);
  return [lo, hi];
}

export function rollEncounter(r, rng, { habitat = 'grass', night = false, levelBoost = 0 } = {}) {
  const pool = regionPool(r, night && rng.next() < 0.25 ? 'night' : habitat);
  const total = pool.reduce((a, [, w]) => a + w, 0);
  let roll = rng.next() * total, id = pool[0][0];
  for (const [sid, w] of pool) { roll -= w; if (roll <= 0) { id = sid; break; } }
  const [lo, hi] = levelRange(r);
  const lv = Math.min(70, rng.int(lo, hi) + levelBoost);
  return makeMonster(fitSpecies(id, lv) === id ? id : id, lv, rng);
}

// Every catchable species must be obtainable in at least one table (or as
// evolution of an obtainable species). Used by tests and the Taschidex.
export function obtainableSpecies() {
  const out = new Set();
  for (let r = 0; r < REGIONS.length; r++) for (const h of Object.keys(HABITAT_TYPES)) for (const [id] of regionPool(r, h)) {
    let cur = id, guard = 0;
    while (cur && guard++ < 5) { out.add(cur); cur = SPECIES[cur].evo?.to; }
  }
  return out;
}

export function habitatsOf(id) {
  const out = [];
  for (let r = 0; r < REGIONS.length; r++) for (const h of Object.keys(HABITAT_TYPES)) if (regionPool(r, h).some(([x]) => x === baseForm(id) || x === id)) out.push({ region: r, habitat: h });
  return out;
}
