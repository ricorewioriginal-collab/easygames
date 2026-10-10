/* Wobbel – Muscheln verdienen und im Laden einlösen (reine Logik, ohne Oberfläche). */
import { Save } from '../storage.js';

export const SKIN_COLORS = [
  { id: 'c-pink', name: 'Bonbon-Pink', value: '#ff6fb0', price: 0 }, { id: 'c-sky', name: 'Himmelblau', value: '#5ab8ff', price: 15 }, { id: 'c-mint', name: 'Minze', value: '#4fe0b0', price: 15 },
  { id: 'c-sun', name: 'Sonnengelb', value: '#ffcf3f', price: 20 }, { id: 'c-grape', name: 'Traube', value: '#a97bff', price: 20 }, { id: 'c-fire', name: 'Feuerorange', value: '#ff8a3d', price: 25 },
  { id: 'c-teal', name: 'Türkis', value: '#2ad4d4', price: 20 }, { id: 'c-red', name: 'Erdbeere', value: '#ff4a4a', price: 20 }, { id: 'c-snow', name: 'Schneeweiß', value: '#f4f8ff', price: 25 }, { id: 'c-shadow', name: 'Schatten', value: '#4a4a68', price: 30 }, { id: 'c-rainbow', name: 'Regenbogen', value: 'rainbow', price: 60 }
];
export const HATS = [
  { id: '', name: 'Kein Hut', price: 0 }, { id: 'flower', name: 'Blümchen', price: 10 }, { id: 'party', name: 'Partyhut', price: 15 }, { id: 'bow', name: 'Schleife', price: 20 }, { id: 'shades', name: 'Sonnenbrille', price: 20 }, { id: 'cat', name: 'Katzenohren', price: 25 },
  { id: 'top', name: 'Zylinder', price: 30 }, { id: 'pirate', name: 'Piratenhut', price: 35 }, { id: 'prop', name: 'Propeller', price: 40 }, { id: 'crown', name: 'Krone', price: 60 }
];
export const TRAILS = [{ id: '', name: 'Keine Spur', price: 0 }, { id: 'bubbles', name: 'Blasen', price: 20 }, { id: 'stars', name: 'Sternchen', price: 25 }, { id: 'hearts', name: 'Herzchen', price: 25 }];
export const CRATES = [{ id: '', name: 'Holzkiste', price: 0 }, { id: 'ice', name: 'Eiskiste', price: 25 }, { id: 'berry', name: 'Beerenkiste', price: 25 }, { id: 'dark', name: 'Steinkiste', price: 30 }, { id: 'gold', name: 'Goldkiste', price: 50 }];
// Kategorie → { Liste, Schlüssel im Look }
export const CATALOG = { color: { list: SKIN_COLORS, key: 'color' }, hat: { list: HATS, key: 'hat' }, trail: { list: TRAILS, key: 'trail' }, crate: { list: CRATES, key: 'crate' } };
export const SKIP_PRICE = 25, TIP_PRICE = 5;

// Muscheln für ein Hauptlevel: erstes Lösen 5 (übersprungen: 3), dazu 3 je neu erreichtem Stern
export function levelReward(old, stars) {
  const prevStars = old ? old.stars : 0, first = !old || (old.skipped && !old.plays);
  return (first ? (old && old.skipped ? 3 : 5) : 0) + 3 * Math.max(0, stars - prevStars);
}
// Muscheln für ein Bonusspiel: Punkte → Muscheln, gedeckelt (damit Levelspielen sich lohnt)
export const BONUS_CAP = 15;
export const bonusReward = (score, per) => Math.max(0, Math.min(BONUS_CAP, Math.floor(score / per)));

const item = (kind, id) => CATALOG[kind] && CATALOG[kind].list.find(x => x.id === id);
const val = (kind, it) => (kind === 'color' ? it.value : it.id);
export const Shop = {
  owned(kind, id) { const it = item(kind, id); return !!it && (it.price === 0 || Save.owns(kind + ':' + id)); },
  equipped(kind, id) { const it = item(kind, id); return !!it && (Save.look[CATALOG[kind].key] || (kind === 'color' ? SKIN_COLORS[0].value : '')) === val(kind, it); },
  /** Kaufen: {ok, reason} */
  buy(kind, id) { const it = item(kind, id); if (!it) return { ok: false, reason: 'unbekannt' }; if (Shop.owned(kind, id)) return { ok: false, reason: 'schon gekauft' }; if (Save.coins < it.price) return { ok: false, reason: 'zu wenig Muscheln' }; Save.addCoins(-it.price); Save.own(kind + ':' + id); Save.addStat('buys', 1); return { ok: true }; },
  equip(kind, id) { const it = item(kind, id); if (!it || !Shop.owned(kind, id)) return false; Save.setLook(CATALOG[kind].key, val(kind, it)); return true; },
  /** Level überspringen (Hauptlevel ohne Sterne) */
  skip(index) { if (Save.level(index)) return { ok: false, reason: 'schon gelöst' }; if (Save.coins < SKIP_PRICE) return { ok: false, reason: 'zu wenig Muscheln' }; Save.addCoins(-SKIP_PRICE); Save.skip(index); Save.addStat('skips', 1); return { ok: true }; }
};
