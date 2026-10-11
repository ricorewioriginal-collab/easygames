// Zentrale Rezeptverwaltung: Prüfen und Herstellen als reine Funktionen (ohne Oberfläche, dadurch testbar).
import { B, LOGO0, LOGO_COUNT, BLOCKS } from './blocks.js';
import { I, ITEMS, TIERS, KINDS, nameOf } from './items.js';

export const MAX_STACK = 999; // Höchstzahl je Blocktyp im Vorrat

// give: [Typ, Anzahl], need: [[Typ, Anzahl], …], st: nötige Station in der Nähe ('werkbank' | 'ofen'), sonst aus der Hand
export const RECIPES = [
  { id: 'planks', give: [B.PLANKS, 4], need: [[B.WOOD, 1]] },
  { id: 'planks2', give: [B.PLANKS, 4], need: [[B.SPRUCE, 1]] },
  { id: 'glass', give: [B.GLASS, 1], need: [[B.SAND, 2]] },
  { id: 'lamp', give: [B.LAMP, 2], need: [[B.GLASS, 2], [B.WOOD, 1]] },
  { id: 'lampCoal', give: [B.LAMP, 2], need: [[B.COAL, 1], [B.PLANKS, 1]] },
  { id: 'lampCrystal', give: [B.LAMP, 4], need: [[B.CRYSTAL, 1], [B.GLASS, 1]] },
  { id: 'feder', give: [B.FEDER, 2], need: [[B.LEAVES, 4], [B.PLANKS, 1]] },
  { id: 'turbo', give: [B.TURBO, 2], need: [[B.STONE, 2], [B.LAMP, 1]] },
  { id: 'turboIron', give: [B.TURBO, 3], need: [[B.IRON, 1], [B.STONE, 2]] },
  { id: 'wind', give: [B.WIND, 2], need: [[B.GLASS, 2], [B.LEAVES, 2]] },
  { id: 'radio', give: [B.RADIO, 1], need: [[B.PLANKS, 4], [B.LAMP, 1]] },
  { id: 'radioCopper', give: [B.RADIO, 2], need: [[B.PLANKS, 2], [B.COPPER, 1], [B.LAMP, 1]] },
  { id: 'rainbow', give: [B.RAINBOW, 2], need: [[B.GLASS, 2], [B.LAMP, 1]] },
  { id: 'neonR', give: [B.NEON_R, 3], need: [[B.LAMP, 1], [B.SAND, 1]] },
  { id: 'neonB', give: [B.NEON_B, 3], need: [[B.LAMP, 1], [B.GLASS, 1]] },
  { id: 'neonG', give: [B.NEON_G, 3], need: [[B.LAMP, 1], [B.LEAVES, 1]] },
  { id: 'neonP', give: [B.NEON_P, 3], need: [[B.LAMP, 1], [B.DIRT, 1]] },
  { id: 'brick', give: [B.BRICK, 4], need: [[B.DIRT, 2], [B.SAND, 1]] },
  { id: 'brickClay', give: [B.BRICK, 4], need: [[B.CLAY, 2], [B.COAL, 1]] },
  { id: 'marble', give: [B.MARBLE, 2], need: [[B.STONE, 2], [B.SAND, 1]] },
  { id: 'sandstone', give: [B.SANDSTONE, 2], need: [[B.SAND, 4]] }
];
for (let i = 0; i < LOGO_COUNT; i++) RECIPES.push({ id: 'logo' + (i + 1), give: [LOGO0 + i, 2], need: [[B.PLANKS, 1]] });
// Überleben: Stationen, Werkzeuge, Schmelzen, Kochen
RECIPES.push(
  { id: 'sticks', give: [I.STICK, 4], need: [[B.PLANKS, 2]] },
  { id: 'workbench', give: [B.WORKBENCH, 1], need: [[B.PLANKS, 4]] },
  { id: 'furnace', give: [B.FURNACE, 1], need: [[B.STONE, 8]], st: 'werkbank' }
);
const TOOL_MAT = [B.PLANKS, B.STONE, I.COPPER_INGOT, I.IRON_INGOT], HEAD = [3, 3, 1];
TIERS.forEach((t, ti) => KINDS.forEach((k, ki) => {
  const id = I[t.key + '_' + k.key];
  RECIPES.push({ id: 'tool' + id, give: [id, 1], need: [[TOOL_MAT[ti], HEAD[ki]], [I.STICK, 2]], st: 'werkbank' });
}));
const HOE_MAT = [B.PLANKS, B.STONE];
['WOOD', 'STONE'].forEach((k, i) => RECIPES.push({ id: 'tool' + I[k + '_HOE'], give: [I[k + '_HOE'], 1], need: [[HOE_MAT[i], 2], [I.STICK, 2]], st: 'werkbank' }));
TIERS.forEach((t, ti) => RECIPES.push({ id: 'tool' + I[t.key + '_SWORD'], give: [I[t.key + '_SWORD'], 1], need: [[TOOL_MAT[ti], 2], [I.STICK, 1]], st: 'werkbank' }));
RECIPES.push({ id: 'bread', give: [I.BREAD, 1], need: [[I.WHEAT, 3]] });
// Rüstung (Werkbank) und Dorf-Baustoffe
RECIPES.push(
  { id: 'copperHelmet', give: [I.COPPER_HELMET, 1], need: [[I.COPPER_INGOT, 5]], st: 'werkbank' },
  { id: 'copperChest', give: [I.COPPER_CHEST, 1], need: [[I.COPPER_INGOT, 8]], st: 'werkbank' },
  { id: 'ironHelmet', give: [I.IRON_HELMET, 1], need: [[I.IRON_INGOT, 5]], st: 'werkbank' },
  { id: 'ironChest', give: [I.IRON_CHEST, 1], need: [[I.IRON_INGOT, 8]], st: 'werkbank' },
  { id: 'cobble', give: [B.COBBLE, 2], need: [[B.STONE, 2]] },
  { id: 'path', give: [B.PATH, 2], need: [[B.GRAVEL, 1], [B.DIRT, 1]] }
);
RECIPES.push(
  { id: 'ingotCopper', give: [I.COPPER_INGOT, 1], need: [[B.COPPER, 1], [B.COAL, 1]], st: 'ofen' },
  { id: 'ingotIron', give: [I.IRON_INGOT, 1], need: [[B.IRON, 1], [B.COAL, 1]], st: 'ofen' },
  { id: 'cook', give: [I.MEAT_COOKED, 1], need: [[I.MEAT_RAW, 1], [B.PLANKS, 1]], st: 'ofen' },
  { id: 'cookCoal', give: [I.MEAT_COOKED, 4], need: [[I.MEAT_RAW, 4], [B.COAL, 1]], st: 'ofen' },
  { id: 'glassOven', give: [B.GLASS, 3], need: [[B.SAND, 3], [B.COAL, 1]], st: 'ofen' }
);
for (const r of RECIPES) r.cat = (ITEMS[r.give[0]] || BLOCKS[r.give[0]]).cat;
export const STATION_NAMES = { werkbank: 'Werkbank', ofen: 'Schmelzofen' };
const STATION_ACC = { werkbank: 'eine Werkbank', ofen: 'einen Schmelzofen' };

const have = (inv, t) => inv[t] || 0;

// Prüft ein Rezept: ok, fehlende Zutaten, ob das Ergebnis noch in den Vorrat passt, fehlende Station.
// stations: Menge der Stationen in Reichweite; null = Stationen nicht prüfen
export function checkRecipe(inv, r, cap = MAX_STACK, stations = null) {
  const missing = r.need.filter(([t, n]) => have(inv, t) < n).map(([t, n]) => [t, n - have(inv, t)]);
  const full = have(inv, r.give[0]) + r.give[1] > cap;
  const noStation = !!(r.st && stations && !stations.has(r.st));
  return { ok: !missing.length && !full && !noStation, missing, full, noStation };
}

// Stellt einmal her; verändert inv nur bei Erfolg. Rückgabe: { ok, msg }
export function craft(inv, r, cap = MAX_STACK, stations = null) {
  const c = checkRecipe(inv, r, cap, stations);
  if (!c.ok) {
    const msg = c.noStation ? `Braucht ${STATION_ACC[r.st]} in der Nähe`
      : c.missing.length ? 'Es fehlt: ' + c.missing.map(([t, n]) => `${n}× ${nameOf(t)}`).join(', ') : `Vorrat voll: höchstens ${cap}× ${nameOf(r.give[0])}`;
    return { ok: false, msg };
  }
  for (const [t, n] of r.need) inv[t] = have(inv, t) - n;
  inv[r.give[0]] = have(inv, r.give[0]) + r.give[1];
  return { ok: true, msg: `+${r.give[1]} ${nameOf(r.give[0])}` };
}

// Wie oft lässt sich das Rezept mit dem aktuellen Vorrat herstellen?
export function craftable(inv, r, cap = MAX_STACK, stations = null) {
  if (r.st && stations && !stations.has(r.st)) return 0;
  let k = Math.floor((cap - have(inv, r.give[0])) / r.give[1]);
  for (const [t, n] of r.need) k = Math.min(k, Math.floor(have(inv, t) / n));
  return Math.max(0, k);
}

// Suchtext passt zu Ergebnis oder Zutat
export function recipeMatches(r, q) {
  if (!q) return true;
  q = q.toLowerCase();
  return nameOf(r.give[0]).toLowerCase().includes(q) || r.need.some(([t]) => nameOf(t).toLowerCase().includes(q));
}
