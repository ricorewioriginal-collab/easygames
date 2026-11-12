// ⭐ Sternennest-Raids: Ein riesiges Taschi wartet in jeder besuchten Region
// (eines pro Tag). Du kämpfst mit einem Helfer – einer Ranger-Figur oder einem
// Freund online – zu zweit gegen den Riesen. Er hat vielfache KP und handelt
// zweimal pro Runde. Nach dem Sieg darfst du es mit einer Kapsel sicher fangen.
// Reine Logik.
import { SPECIES } from '../data/species.js';
import { createRng } from '../core/rng.js';
import { makeMonster, healMonster } from './monster.js';
import { regionPool } from './encounters.js';
import { dayKey } from './daily.js';

export const RAID_HP = [0, 3, 3.5, 4, 5, 6];        // KP-Faktor je Sternzahl
export const HELPERS = ['Ranger Mika', 'Rangerin Juna', 'Ranger Tomek', 'Rangerin Ivy'];

// Endstufe einer Linie (höchstens zwei Entwicklungen weiter)
export function finalForm(id) { let cur = id; for (let k = 0; k < 3 && SPECIES[cur]?.evo?.to && SPECIES[SPECIES[cur].evo.to]; k++) cur = SPECIES[cur].evo.to; return cur; }
// Sterne nach Fortschritt: 1 (Start) … 5 (ab 12 Siegeln)
export function raidStars(s) { const b = s.badges || 0; return b >= 12 ? 5 : b >= 8 ? 4 : b >= 4 ? 3 : b >= 1 ? 2 : 1; }

export function raidOf(s, region, today = dayKey()) {
  const rng = createRng('raid:' + today + ':' + region);
  const pool = regionPool(region, rng.next() < 0.3 ? 'water' : 'grass');
  const base = rng.pick(pool.map(([sid]) => sid));
  const id = finalForm(base), stars = raidStars(s);
  return { region, id, stars, lv: Math.min(90, 12 + stars * 12 + (region >> 1)), shiny: rng.next() < 0.02, key: today + ':' + region };
}
export function raidDone(s, raid) { return s.daily?.['raid:' + raid.region] === raid.key; }
export function markRaid(s, raid) { (s.daily ||= {})['raid:' + raid.region] = raid.key; }

// Der Riese: vielfache KP (statOf bleibt gleich, nur maxHp/hp über m.boss)
export function makeBoss(raid, rng) {
  const m = makeMonster(raid.id, raid.lv, rng, raid.shiny ? { shiny: true } : {});
  m.boss = RAID_HP[raid.stars] || 3;
  healMonster(m);
  return m;
}
// Helfer-Taschi einer Ranger-Figur: passend zur Stufe, kampferprobt
export function makeHelper(raid, s, rng) {
  const name = HELPERS[(raid.region + raid.stars) % HELPERS.length];
  const strongest = [...s.team].sort((a, b) => b.lv - a.lv)[0];
  const lv = Math.max(5, Math.min(raid.lv, (strongest?.lv || 10) + 2));
  const pool = regionPool(raid.region, 'grass').map(([sid]) => finalForm(sid)).filter(id => id !== raid.id);
  const m = makeMonster(pool.length ? pool[Math.floor(rng.next() * pool.length)] : 'fellisto', lv, rng);
  m.ally = name;
  return { name, m };
}
// Belohnungen nach Sternen
export function raidReward(stars) {
  const items = { superball: 1 + stars, trank: 2 };
  if (stars >= 2) items.levelbonbon = stars - 1;
  if (stars >= 3) items.sternsplitter = 1;
  if (stars >= 4) items.supertrank = 2;
  return { coins: 150 * stars, items };
}
