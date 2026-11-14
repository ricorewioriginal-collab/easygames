// Wesen (natures), Fähigkeiten (abilities) and battle weather – original Taschi
// systems that give every caught Taschi a character and make fights deeper.
import { SPECIES } from '../data/species.js';

// each Wesen raises one value by 10 % and lowers another by 10 % (or nothing)
export const NATURES = [
  { name: 'Mutig', up: 'atk', down: 'speed' }, { name: 'Wild', up: 'atk', down: 'def' },
  { name: 'Ruhig', up: 'def', down: 'speed' }, { name: 'Standhaft', up: 'def', down: 'atk' },
  { name: 'Flink', up: 'speed', down: 'def' }, { name: 'Hastig', up: 'speed', down: 'atk' },
  { name: 'Ausgeglichen' }, { name: 'Verträumt' }, { name: 'Neugierig' }, { name: 'Fröhlich' }
];
function hash(str) { let h = 2166136261; for (const c of String(str)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
// older saves have no Wesen yet – derive a stable one from the Taschi's id
export function natureOf(m) { return NATURES[m.nature ?? hash(m.uid ?? m.id) % NATURES.length] || NATURES[6]; }
export function natureFactor(m, stat) { const n = natureOf(m); return n.up === stat ? 1.1 : n.down === stat ? 0.9 : 1; }

const ABILITY_BY_TYPE = {
  feuer: { kind: 'core', name: 'Glutkern', text: 'Feuer-Attacken +30 %, wenn höchstens ein Drittel KP übrig ist.' },
  wasser: { kind: 'core', name: 'Strudelkern', text: 'Wasser-Attacken +30 %, wenn höchstens ein Drittel KP übrig ist.' },
  pflanze: { kind: 'core', name: 'Wurzelkern', text: 'Pflanzen-Attacken +30 %, wenn höchstens ein Drittel KP übrig ist.' },
  elektro: { kind: 'core', name: 'Funkenkern', text: 'Elektro-Attacken +30 %, wenn höchstens ein Drittel KP übrig ist.' },
  eis: { kind: 'core', name: 'Frostkern', text: 'Eis-Attacken +30 %, wenn höchstens ein Drittel KP übrig ist.' },
  gestein: { kind: 'rock', name: 'Felsenhaut', text: 'Erleidet 10 % weniger Schaden.' },
  erde: { kind: 'rock', name: 'Erdpanzer', text: 'Erleidet 10 % weniger Schaden.' },
  flug: { kind: 'tail', name: 'Aufwind', text: '10 % mehr Schaden, wenn es schneller als das Ziel ist.' },
  geist: { kind: 'veil', name: 'Schattenschleier', text: 'Sehr effektive Treffer richten 15 % weniger Schaden an.' },
  normal: { kind: 'thick', name: 'Dickfell', text: 'Volltreffer richten keinen Extraschaden an.' }
};
export function abilityOf(id) { return ABILITY_BY_TYPE[SPECIES[id]?.type] || ABILITY_BY_TYPE.normal; }

// overworld weather carries into battle
export const WEATHER = {
  rain: { name: 'Regen', icon: '🌧', boost: { wasser: 1.3, feuer: 0.7 } },
  storm: { name: 'Gewitter', icon: '⛈', boost: { elektro: 1.3, flug: 1.1 } },
  wind: { name: 'Sturmböen', icon: '🌬', boost: { flug: 1.3 } },
  embers: { name: 'Glutregen', icon: '🔥', boost: { feuer: 1.3, wasser: 0.8 } },
  leaves: { name: 'Blätterwind', icon: '🍃', boost: { pflanze: 1.2 } },
  petals: { name: 'Blütenwind', icon: '🌸', boost: { pflanze: 1.2 } },
  fog: { name: 'Nebel', icon: '🌫', boost: { geist: 1.2 } },
  sparkle: { name: 'Funkeln', icon: '✨', boost: { eis: 1.2 } }
};
export function weatherText(w) { const d = WEATHER[w]; if (!d) return ''; return d.name + ': ' + Object.entries(d.boost).map(([t, f]) => t[0].toUpperCase() + t.slice(1) + (f > 1 ? ' stärker' : ' schwächer')).join(', '); }
