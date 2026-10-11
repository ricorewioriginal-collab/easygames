// Zentrale Rezeptverwaltung: Prüfen und Herstellen als reine Funktionen (ohne Oberfläche, dadurch testbar).
import { B, NAMES, LOGO0, LOGO_COUNT, BLOCKS } from './blocks.js';

export const MAX_STACK = 999; // Höchstzahl je Blocktyp im Vorrat

// give: [Typ, Anzahl], need: [[Typ, Anzahl], …]
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
for (const r of RECIPES) r.cat = BLOCKS[r.give[0]].cat;

const have = (inv, t) => inv[t] || 0;

// Prüft ein Rezept: ok, fehlende Zutaten, ob das Ergebnis noch in den Vorrat passt
export function checkRecipe(inv, r, cap = MAX_STACK) {
  const missing = r.need.filter(([t, n]) => have(inv, t) < n).map(([t, n]) => [t, n - have(inv, t)]);
  const full = have(inv, r.give[0]) + r.give[1] > cap;
  return { ok: !missing.length && !full, missing, full };
}

// Stellt einmal her; verändert inv nur bei Erfolg. Rückgabe: { ok, msg }
export function craft(inv, r, cap = MAX_STACK) {
  const c = checkRecipe(inv, r, cap);
  if (!c.ok) {
    const msg = c.missing.length ? 'Es fehlt: ' + c.missing.map(([t, n]) => `${n}× ${NAMES[t]}`).join(', ') : `Vorrat voll: höchstens ${cap}× ${NAMES[r.give[0]]}`;
    return { ok: false, msg };
  }
  for (const [t, n] of r.need) inv[t] = have(inv, t) - n;
  inv[r.give[0]] = have(inv, r.give[0]) + r.give[1];
  return { ok: true, msg: `+${r.give[1]} ${NAMES[r.give[0]]}` };
}

// Wie oft lässt sich das Rezept mit dem aktuellen Vorrat herstellen?
export function craftable(inv, r, cap = MAX_STACK) {
  let k = Math.floor((cap - have(inv, r.give[0])) / r.give[1]);
  for (const [t, n] of r.need) k = Math.min(k, Math.floor(have(inv, t) / n));
  return Math.max(0, k);
}

// Suchtext passt zu Ergebnis oder Zutat
export function recipeMatches(r, q) {
  if (!q) return true;
  q = q.toLowerCase();
  return NAMES[r.give[0]].toLowerCase().includes(q) || r.need.some(([t]) => NAMES[t].toLowerCase().includes(q));
}
