// Gegenstände ohne Block (Werkzeuge, Barren, Nahrung). Eigener Id-Bereich ab 1000, damit sie nie mit Block-Ids
// (0–255, stehen in den Welt-Änderungen) kollidieren. Ids sind dauerhaft – nur hinten anhängen.
import { BLOCKS, NAMES } from './blocks.js';

export const ITEM0 = 1000;
export const ITEMS = [];   // nach Id (Lücken = undefined)
export const I = {};       // Name -> Id
export const ITEM_LIST = []; // Anzeige-Reihenfolge

// Werkzeugstufen: Abbau-Tempo mit passendem Werkzeug, Haltbarkeit (Anzahl Blöcke), Kopffarbe im Symbol
export const TIERS = [
  { key: 'WOOD', name: 'Holz', speed: 2, dur: 60, col: '#b48a52' },
  { key: 'STONE', name: 'Stein', speed: 3, dur: 140, col: '#8c8c94' },
  { key: 'COPPER', name: 'Kupfer', speed: 4, dur: 220, col: '#d8803c' },
  { key: 'IRON', name: 'Eisen', speed: 6, dur: 360, col: '#dcdce4' }
];
export const KINDS = [
  { key: 'PICK', kind: 'spitzhacke', name: 'spitzhacke' },
  { key: 'AXE', kind: 'axt', name: 'axt' },
  { key: 'SHOVEL', kind: 'schaufel', name: 'schaufel' }
];

function add(id, key, name, p) {
  if (ITEMS[id]) throw new Error('Item-Id doppelt: ' + id);
  const it = { id, key, name, cat: 'items', icon: ITEM_LIST.length, food: 0, tool: null, ...p };
  ITEMS[id] = it; I[key] = id; ITEM_LIST.push(id);
  return it;
}
add(1000, 'STICK', 'Stock', { draw: 'stick' });
add(1001, 'COPPER_INGOT', 'Kupferbarren', { draw: 'ingot', col: '#d8803c' });
add(1002, 'IRON_INGOT', 'Eisenbarren', { draw: 'ingot', col: '#dcdce4' });
add(1003, 'APPLE', 'Apfel', { draw: 'apple', food: 4 });
add(1004, 'MEAT_RAW', 'Rohes Fleisch', { draw: 'meat', col: '#e0605a', food: 2 });
add(1005, 'MEAT_COOKED', 'Braten', { draw: 'meat', col: '#9a5a2a', food: 7 });
TIERS.forEach((t, ti) => KINDS.forEach((k, ki) => {
  add(1010 + ti * 3 + ki, t.key + '_' + k.key, t.name + k.name, { draw: k.kind, col: t.col, tool: { kind: k.kind, tier: ti + 1, speed: t.speed, dur: t.dur } });
}));

export const isItem = id => id >= ITEM0;
export const nameOf = id => (id >= ITEM0 ? (ITEMS[id] ? ITEMS[id].name : '?') : NAMES[id] || '?');
export const toolOf = id => (id >= ITEM0 && ITEMS[id] ? ITEMS[id].tool : null);
export const foodOf = id => (id >= ITEM0 && ITEMS[id] ? ITEMS[id].food : 0);
export const known = id => !!(id >= ITEM0 ? ITEMS[id] : BLOCKS[id]);

// ---------- Abbauen (Überlebensmodus) ----------
const HAND = 0.9; // Sekunden je Härtepunkt mit der Hand

// Abbauzeit in Sekunden für Block mit gehaltenem Gegenstand
export function mineTime(block, held) {
  const b = BLOCKS[block];
  if (!b) return 0.5;
  const t = toolOf(held), speed = t && b.tool === t.kind ? t.speed : 1;
  return Math.max(0.12, b.hard * HAND / speed);
}
// Wirft der Block etwas ab? (Erze brauchen eine Spitzhacke der Mindeststufe)
export function canHarvest(block, held) {
  const b = BLOCKS[block];
  if (!b || !b.tier) return true;
  const t = toolOf(held);
  return !!t && t.kind === 'spitzhacke' && t.tier >= b.tier;
}
// passt das Werkzeug zum Block? (nur dann nutzt es sich ab)
export function toolFits(block, held) {
  const b = BLOCKS[block], t = toolOf(held);
  return !!(b && t && b.tool === t.kind);
}
