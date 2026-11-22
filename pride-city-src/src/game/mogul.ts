/* Mogul-Ranking: Wer besitzt Rainbow City? Dein Vermögen (Geld plus Wert deiner Geschäfte, Ausbauten und Wohnungen)
   gegen die großen Namen der Stadt. Die Rivalen wachsen jeden Tag ein Stück, die Geschichte verändert sie:
   Glanz Immobilien verliert nach der Pride (Kapitel 5), Viktor Kral nach Akt IV alles. Alle Namen sind erfunden. */
import type { SaveData } from '../engine/Save';
import { BUSINESSES, owned, priceOf, type Business } from './empire';
import { UPGRADES, upOf, upCost, staffOf } from './manage';

export interface Rival { id: string; name: string; who: string; icon: string; base: number; grow: number; /** Wert nach dem Fall (Geschichte) */ fall?: (s: SaveData) => number | null; motto: string }
export const RIVALS: Rival[] = [
  { id: 'glanz', name: 'Glanz Immobilien', who: 'Cornelius Glanz', icon: '🏦', base: 38000, grow: 900, motto: 'Kauft Häuser, wo es bunt ist, und macht sie grau.',
    fall: (s) => (s.chapter > 5 ? 9000 : null) },
  { id: 'kral', name: 'Kral Holding', who: 'Viktor Kral', icon: '🏭', base: 30000, grow: 700, motto: 'Hafen, Lagerhallen, Club Monolith. Ordnung nennt er das.',
    fall: (s) => (s.flags.flutEnd ? 0 : null) },
  { id: 'sterling', name: 'Sterling Nights', who: 'Rocco Sterling', icon: '🥂', base: 22000, grow: 500, motto: 'Nachtleben mit Stil, solange die Kasse stimmt.' },
  { id: 'ross', name: 'Ross Capital', who: 'Valentin Ross', icon: '✈️', base: 26000, grow: 420, motto: 'Investiert von Lissabon aus, wo die Sonne länger scheint.' },
  { id: 'genossen', name: 'Genossenschaft Regenbogen', who: 'Hilde und das Regenbogenhaus', icon: '🌈', base: 6000, grow: 260, motto: 'Gehört allen, die mitmachen. Hilde führt die Kasse.' },
  { id: 'nonna', name: 'Familie Esposito', who: 'Nonna Rosaria', icon: '🍝', base: 4000, grow: 120, motto: 'Pizza, Enkel und drei Häuser in der Hochstadt.' },
];

/** Wert eines eigenen Geschäfts: Kaufpreis plus Ausbauten plus etwas für Personal und Beliebtheit */
export function bizValue(s: SaveData, b: Business) {
  let v = b.price || b.daily * 20;
  for (const u of UPGRADES) for (let l = 0; l < upOf(s, b.id, u.id); l++) v += upCost(b, l);
  return Math.round(v + staffOf(s, b.id) * b.daily * 2);
}
export const PENTHOUSE_VALUE = 12000;
/** Dein Vermögen: Geld, Geschäfte, Penthouse, Club Leuchtturm */
export function worth(s: SaveData) {
  return Math.max(0, Math.round(s.money + owned(s).reduce((n, b) => n + bizValue(s, b), 0) + (s.flags.penthouse ? PENTHOUSE_VALUE : 0) + (s.flags.bar ? 1500 : 0)));
}
export function rivalWorth(s: SaveData, r: Rival) {
  const f = r.fall?.(s); if (f !== null && f !== undefined) return f;
  return Math.round(r.base + r.grow * Math.max(0, s.day - 1));
}
export interface Rank { id: string; name: string; who: string; icon: string; worth: number; me?: boolean; out?: boolean }
export function ranking(s: SaveData): Rank[] {
  const list: Rank[] = RIVALS.map((r) => { const w = rivalWorth(s, r); return { id: r.id, name: r.name, who: r.who, icon: r.icon, worth: w, out: w === 0 }; });
  list.push({ id: 'me', name: s.name || 'Du', who: `${owned(s).length} Geschäfte`, icon: '👑', worth: worth(s), me: true });
  return list.sort((a, b) => b.worth - a.worth);
}
export const myRank = (s: SaveData) => ranking(s).findIndex((r) => r.me) + 1;
/** Titel nach Platz und Zahl der Geschäfte */
export function mogulTitle(s: SaveData) {
  const r = myRank(s), n = owned(s).length;
  return r === 1 ? 'Mogul*in von Rainbow City' : r <= 3 ? 'Große Nummer' : n >= 5 ? 'Aufsteiger*in' : n ? 'Geschäftsleute' : 'Neu in der Stadt';
}
/** Neue Platzierung seit dem letzten Blick (für Banner und Story): liefert den neuen Platz oder 0 */
export function rankUp(s: SaveData): number {
  const r = myRank(s), best = Number(s.flags.mogulBest) || 99;
  if (r < best) { s.flags.mogulBest = r; return best === 99 ? 0 : r; }
  return 0;
}
/** Immobilien nach Art (Übersicht im Handy) */
export const KINDS: Array<{ id: string; icon: string; name: string; of: (b: Business) => boolean }> = [
  { id: 'laden', icon: '🛍️', name: 'Läden und Lokale', of: (b) => b.kind === 'laden' || (!b.kind && ['spaeti', 'cafe', 'beach', 'boutique'].includes(b.id)) },
  { id: 'bar', icon: '🍸', name: 'Bars und Clubs', of: (b) => !b.kind && !['spaeti', 'cafe', 'beach', 'boutique'].includes(b.id) },
  { id: 'kultur', icon: '🎭', name: 'Kultur', of: (b) => b.kind === 'kultur' },
  { id: 'hotel', icon: '🏨', name: 'Hotels', of: (b) => b.kind === 'hotel' },
];
export const forSale = (s: SaveData) => BUSINESSES.filter((b) => !b.gift && !s.flags['biz_' + b.id]).map((b) => ({ b, price: priceOf(s, b) }));
