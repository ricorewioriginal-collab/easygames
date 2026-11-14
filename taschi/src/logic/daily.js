// Tagesereignisse nach echtem Kalendertag: Revanchen, Massenausbrüche, Glücksrad.
// Alles deterministisch aus dem Datum, damit jeder Tag gleich bleibt.
import { createRng } from '../core/rng.js';
import { regionPool } from './encounters.js';
import { REGIONS } from '../data/regions.js';
import { SPECIES } from '../data/species.js';
export function dayKey(d = new Date()) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

// Revanche einmal pro Tag und Trainer; ab dem zweiten Siegel
export function rematchReady(s, trainerId, today = dayKey()) {
  return (s.badges || 0) >= 2 && !!s.trainers[trainerId] && s.rematch?.[trainerId] !== today;
}
export function markRematch(s, trainerId, today = dayKey()) { (s.rematch ||= {})[trainerId] = today; }

// Massenausbruch: an jedem Tag tritt in einer (schon besuchten) Region eine Art
// gehäuft auf – jede zweite Gras-Begegnung, dreifache Schillerchance.

export function outbreak(s, today = dayKey()) {
  const regions = Object.keys(s.visited || { 0: true }).map(Number).filter(r => r >= 0 && r < 16);
  if (!regions.length || !s.flags?.firstQuest) return null;
  const rng = createRng('outbreak:' + today + ':' + regions.length);
  const region = rng.pick(regions.sort((a, b) => a - b));
  const pool = regionPool(region, 'grass');
  const id = rng.pick(pool.map(([sid]) => sid));
  return { region, id, name: SPECIES[id].name, place: REGIONS[region].name };
}

// Glücksrad im Heilzentrum: einmal pro Tag. Gewichte summieren sich auf 100.
export const WHEEL = [
  { label: '★ 200', coins: 200, w: 22 }, { label: '3× Heiltropfen', items: { trank: 3 }, w: 18 }, { label: '2× Plus-Kapsel', items: { superball: 2 }, w: 14 },
  { label: '★ 500', coins: 500, w: 10 }, { label: 'Heilbeere', items: { heilbeere: 1 }, w: 10 }, { label: '2× Klarbeere', items: { klarbeere: 2 }, w: 8 },
  { label: 'Stufenhonig', items: { levelbonbon: 1 }, w: 8 }, { label: 'Sternsplitter', items: { sternsplitter: 1 }, w: 6 }, { label: '★ 1500', coins: 1500, w: 3 }, { label: 'Sternkapsel ×3', items: { sternball: 3 }, w: 1 }
];
export function wheelReady(s, today = dayKey()) { return s.daily?.wheel !== today; }
export function spinWheel(s, rng, today = dayKey()) {
  if (!wheelReady(s, today)) return null;
  let roll = rng.next() * WHEEL.reduce((a, x) => a + x.w, 0), index = 0;
  for (let i = 0; i < WHEEL.length; i++) { roll -= WHEEL[i].w; if (roll <= 0) { index = i; break; } }
  const p = WHEEL[index];
  (s.daily ||= {}).wheel = today;
  if (p.coins) s.coins += p.coins;
  for (const [id, n] of Object.entries(p.items || {})) s.bag[id] = (s.bag[id] | 0) + n;
  return { index, prize: p };
}