import type { CropDef, ItemDef, OrderDef, RecipeDef } from '../core/types';

// Zeiten in Sekunden (Modus Nostalgisch). Entspannt halbiert sie.
const MIN = 60;
const H = 3600;

export const CROPS: CropDef[] = [
  { id: 'erdbeere', name: 'Erdbeeren', icon: '🍓', seed: 10, time: 2 * MIN, yield: 3, xp: 1, level: 1, color: '#e2364b' },
  { id: 'weizen', name: 'Weizen', icon: '🌾', seed: 15, time: 5 * MIN, yield: 4, xp: 2, level: 1, color: '#e8c25a' },
  { id: 'salat', name: 'Salat', icon: '🥬', seed: 20, time: 4 * MIN, yield: 3, xp: 2, level: 2, color: '#7cc64a' },
  { id: 'karotte', name: 'Karotten', icon: '🥕', seed: 25, time: 8 * MIN, yield: 4, xp: 2, level: 3, color: '#f08a2c' },
  { id: 'tomate', name: 'Tomaten', icon: '🍅', seed: 30, time: 12 * MIN, yield: 4, xp: 3, level: 4, color: '#d9402b' },
  { id: 'mais', name: 'Mais', icon: '🌽', seed: 35, time: 15 * MIN, yield: 5, xp: 3, level: 5, color: '#f2d43b' },
  { id: 'kartoffel', name: 'Kartoffeln', icon: '🥔', seed: 40, time: 20 * MIN, yield: 6, xp: 4, level: 6, color: '#b98b4e' },
  { id: 'sonnenblume', name: 'Sonnenblumen', icon: '🌻', seed: 45, time: 30 * MIN, yield: 5, xp: 4, level: 7, color: '#ffc928' },
  { id: 'kuerbis', name: 'Kürbisse', icon: '🎃', seed: 60, time: 45 * MIN, yield: 4, xp: 5, level: 9, color: '#f57b1f' },
  { id: 'zuckerruebe', name: 'Zuckerrüben', icon: '🫜', seed: 70, time: 1.5 * H, yield: 6, xp: 6, level: 10, color: '#c9a3c9' },
  { id: 'baumwolle', name: 'Baumwolle', icon: '☁️', seed: 80, time: 1 * H, yield: 5, xp: 6, level: 11, color: '#f4f1ea' },
  { id: 'traube', name: 'Trauben', icon: '🍇', seed: 90, time: 2 * H, yield: 6, xp: 7, level: 13, color: '#7a3e9c' },
  { id: 'kaffee', name: 'Kaffeesträucher', icon: '🫘', seed: 110, time: 3 * H, yield: 6, xp: 8, level: 16, color: '#6b3d22' },
  { id: 'kakao', name: 'Kakao', icon: '🍫', seed: 130, time: 4 * H, yield: 6, xp: 9, level: 19, color: '#8a5230' },
];

const GOODS: ItemDef[] = [
  { id: 'mehl', name: 'Mehl', icon: '🥡', kind: 'good' },
  { id: 'popcorn', name: 'Popcorn', icon: '🍿', kind: 'good' },
  { id: 'pommes', name: 'Pommes', icon: '🍟', kind: 'good' },
  { id: 'saft', name: 'Saft', icon: '🧃', kind: 'good' },
  { id: 'sosse', name: 'Tomatensoße', icon: '🥫', kind: 'good' },
  { id: 'gemuesekiste', name: 'Gemüsekiste', icon: '🧺', kind: 'good' },
  { id: 'zucker', name: 'Zucker', icon: '🧂', kind: 'good' },
  { id: 'schokolade', name: 'Schokolade', icon: '🍫', kind: 'good' },
  { id: 'kuchen', name: 'Kürbiskuchen', icon: '🥧', kind: 'good' },
  { id: 'roestkaffee', name: 'Röstkaffee', icon: '☕', kind: 'good' },
  { id: 'stoff', name: 'Stoff', icon: '🧵', kind: 'good' },
  { id: 'strauss', name: 'Blumenstrauß', icon: '💐', kind: 'good' },
  { id: 'bretter', name: 'Bretter', icon: '🪵', kind: 'material' },
  { id: 'moebel', name: 'Möbel', icon: '🪑', kind: 'good' },
];

const IMPORTS: ItemDef[] = [
  { id: 'holz', name: 'Holzstämme', icon: '🌲', kind: 'import' },
  { id: 'ziegel', name: 'Ziegel', icon: '🧱', kind: 'material' },
  { id: 'stahl', name: 'Stahlträger', icon: '🔩', kind: 'material' },
  { id: 'glas', name: 'Glasscheiben', icon: '🪟', kind: 'material' },
  { id: 'spielzeug', name: 'Spielzeug', icon: '🧸', kind: 'import' },
  { id: 'buecher', name: 'Bücher', icon: '📚', kind: 'import' },
  { id: 'elektronik', name: 'Elektronik', icon: '📱', kind: 'import' },
  { id: 'fisch', name: 'Fisch', icon: '🐟', kind: 'import' },
  { id: 'gewuerze', name: 'Gewürze', icon: '🌶️', kind: 'import' },
];

export const ITEMS: ItemDef[] = [
  ...CROPS.map((c): ItemDef => ({ id: c.id, name: c.name, icon: c.icon, kind: 'crop' })),
  ...GOODS,
  ...IMPORTS,
];

export const RECIPES: RecipeDef[] = [
  { id: 'r_mehl', inputs: { weizen: 3 }, output: 'mehl', amount: 3, time: 3 * MIN, xp: 2 },
  { id: 'r_popcorn', inputs: { mais: 3 }, output: 'popcorn', amount: 4, time: 5 * MIN, xp: 3 },
  { id: 'r_pommes', inputs: { kartoffel: 3 }, output: 'pommes', amount: 4, time: 6 * MIN, xp: 3 },
  { id: 'r_saft_e', inputs: { erdbeere: 4 }, output: 'saft', amount: 3, time: 3 * MIN, xp: 2 },
  { id: 'r_saft_t', inputs: { traube: 3 }, output: 'saft', amount: 5, time: 6 * MIN, xp: 4 },
  { id: 'r_sosse', inputs: { tomate: 3 }, output: 'sosse', amount: 3, time: 5 * MIN, xp: 3 },
  { id: 'r_kiste', inputs: { karotte: 2, salat: 2 }, output: 'gemuesekiste', amount: 3, time: 4 * MIN, xp: 3 },
  { id: 'r_zucker', inputs: { zuckerruebe: 3 }, output: 'zucker', amount: 4, time: 8 * MIN, xp: 4 },
  { id: 'r_schoko', inputs: { kakao: 2, zucker: 1 }, output: 'schokolade', amount: 3, time: 15 * MIN, xp: 6 },
  { id: 'r_kuchen', inputs: { mehl: 2, kuerbis: 1, zucker: 1 }, output: 'kuchen', amount: 3, time: 12 * MIN, xp: 5 },
  { id: 'r_kaffee', inputs: { kaffee: 3 }, output: 'roestkaffee', amount: 4, time: 10 * MIN, xp: 5 },
  { id: 'r_stoff', inputs: { baumwolle: 3 }, output: 'stoff', amount: 3, time: 10 * MIN, xp: 5 },
  { id: 'r_strauss', inputs: { sonnenblume: 3 }, output: 'strauss', amount: 3, time: 5 * MIN, xp: 3 },
  { id: 'r_bretter', inputs: { holz: 2 }, output: 'bretter', amount: 3, time: 6 * MIN, xp: 3 },
  { id: 'r_moebel', inputs: { bretter: 3, stoff: 1 }, output: 'moebel', amount: 2, time: 20 * MIN, xp: 8 },
];

export const ORDERS: OrderDef[] = [
  // Schiene
  { id: 'o_holz', station: 'rail', name: 'Holz aus dem Bergland', cost: 120, time: 5 * MIN, xp: 5, level: 1, get: { holz: 10 } },
  { id: 'o_ziegel', station: 'rail', name: 'Ziegelwagen', cost: 200, time: 8 * MIN, xp: 6, level: 1, get: { ziegel: 8 } },
  { id: 'o_spielzeug', station: 'rail', name: 'Spielwaren-Express', cost: 260, time: 12 * MIN, xp: 8, level: 1, get: { spielzeug: 8 } },
  { id: 'o_buecher', station: 'rail', name: 'Bücherzug', cost: 260, time: 12 * MIN, xp: 8, level: 10, get: { buecher: 8 } },
  { id: 'o_stahl', station: 'rail', name: 'Stahlwerk-Lieferung', cost: 380, time: 20 * MIN, xp: 10, level: 12, get: { stahl: 6 } },
  { id: 'o_ex_weizen', station: 'rail', name: 'Getreide ins Umland', cost: 0, time: 10 * MIN, xp: 6, level: 1, give: { weizen: 12 }, coins: 420 },
  { id: 'o_ex_mehl', station: 'rail', name: 'Mehl für die Großbäckerei', cost: 0, time: 15 * MIN, xp: 8, level: 10, give: { mehl: 10 }, coins: 640 },
  // See
  { id: 'o_fisch', station: 'sea', name: 'Fischkutter', cost: 220, time: 10 * MIN, xp: 7, level: 1, get: { fisch: 10 } },
  { id: 'o_gewuerze', station: 'sea', name: 'Gewürzfrachter', cost: 340, time: 20 * MIN, xp: 9, level: 1, get: { gewuerze: 8 } },
  { id: 'o_glas', station: 'sea', name: 'Glas aus Übersee', cost: 360, time: 25 * MIN, xp: 10, level: 1, get: { glas: 8 } },
  { id: 'o_holz_see', station: 'sea', name: 'Holzflöße', cost: 200, time: 15 * MIN, xp: 8, level: 1, get: { holz: 20 } },
  { id: 'o_ex_stoff', station: 'sea', name: 'Stoffballen für den Export', cost: 0, time: 30 * MIN, xp: 12, level: 1, give: { stoff: 8 }, coins: 1100 },
  { id: 'o_ex_saft', station: 'sea', name: 'Saftkisten nach Norden', cost: 0, time: 20 * MIN, xp: 10, level: 1, give: { saft: 10 }, coins: 760 },
  // Luft
  { id: 'o_elektronik', station: 'air', name: 'Elektronik-Luftfracht', cost: 520, time: 25 * MIN, xp: 12, level: 1, get: { elektronik: 10 } },
  { id: 'o_stahl_luft', station: 'air', name: 'Eilfracht Stahl', cost: 640, time: 15 * MIN, xp: 12, level: 1, get: { stahl: 10 } },
  { id: 'o_spielzeug_luft', station: 'air', name: 'Spielzeugmesse', cost: 560, time: 20 * MIN, xp: 12, level: 1, get: { spielzeug: 16 } },
  { id: 'o_ex_schoko', station: 'air', name: 'Pralinen in die Hauptstadt', cost: 0, time: 30 * MIN, xp: 16, level: 1, give: { schokolade: 8 }, coins: 1600 },
  { id: 'o_ex_moebel', station: 'air', name: 'Designermöbel-Export', cost: 0, time: 40 * MIN, xp: 18, level: 1, give: { moebel: 4 }, coins: 1800 },
];

/** Baustoffhändler: faire Solo-Alternative zu Lieferungen und Nachbarhilfe (teurer, aber sofort). */
export const MARKET: Record<string, number> = { bretter: 45, ziegel: 55, stahl: 80, glas: 70, holz: 25 };

export const ITEM = new Map(ITEMS.map((i) => [i.id, i]));
export const CROP = new Map(CROPS.map((c) => [c.id, c]));
export const RECIPE = new Map(RECIPES.map((r) => [r.id, r]));
export const ORDER = new Map(ORDERS.map((o) => [o.id, o]));
