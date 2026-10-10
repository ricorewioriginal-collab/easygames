/* Wobbel – Muscheln verdienen und im Laden einlösen (reine Logik, ohne Oberfläche). */
import { Save } from '../storage.js';

export const SKIN_COLORS = [
  { id: 'c-pink', name: 'Bonbon-Pink', value: '#ff6fb0', price: 0 }, { id: 'c-sky', name: 'Himmelblau', value: '#5ab8ff', price: 15 }, { id: 'c-mint', name: 'Minze', value: '#4fe0b0', price: 15 },
  { id: 'c-sun', name: 'Sonnengelb', value: '#ffcf3f', price: 20 }, { id: 'c-grape', name: 'Traube', value: '#a97bff', price: 20 }, { id: 'c-fire', name: 'Feuerorange', value: '#ff8a3d', price: 25 }
];
export const HATS = [
  { id: '', name: 'Kein Hut', price: 0 }, { id: 'party', name: 'Partyhut', price: 15 }, { id: 'bow', name: 'Schleife', price: 20 }, { id: 'top', name: 'Zylinder', price: 30 }, { id: 'prop', name: 'Propeller', price: 40 }, { id: 'crown', name: 'Krone', price: 60 }
];
export const SKIP_PRICE = 25;

// Muscheln für ein Hauptlevel: erstes Lösen 5 (übersprungen: 3), dazu 3 je neu erreichtem Stern
export function levelReward(old, stars) {
  const prevStars = old ? old.stars : 0, first = !old || (old.skipped && !old.plays);
  return (first ? (old && old.skipped ? 3 : 5) : 0) + 3 * Math.max(0, stars - prevStars);
}
// Muscheln für ein Bonusspiel: Punkte → Muscheln, gedeckelt (damit Levelspielen sich lohnt)
export const BONUS_CAP = 15;
export const bonusReward = (score, per) => Math.max(0, Math.min(BONUS_CAP, Math.floor(score / per)));

const item = (kind, id) => (kind === 'color' ? SKIN_COLORS : HATS).find(x => x.id === id);
export const Shop = {
  owned(kind, id) { const it = item(kind, id); return !!it && (it.price === 0 || Save.owns(kind + ':' + id)); },
  equipped(kind, id) { const it = item(kind, id); return !!it && (kind === 'color' ? Save.look.color === it.value : Save.look.hat === id); },
  /** Kaufen: {ok, reason} */
  buy(kind, id) { const it = item(kind, id); if (!it) return { ok: false, reason: 'unbekannt' }; if (Shop.owned(kind, id)) return { ok: false, reason: 'schon gekauft' }; if (Save.coins < it.price) return { ok: false, reason: 'zu wenig Muscheln' }; Save.addCoins(-it.price); Save.own(kind + ':' + id); return { ok: true }; },
  equip(kind, id) { const it = item(kind, id); if (!it || !Shop.owned(kind, id)) return false; Save.setLook(kind === 'color' ? 'color' : 'hat', kind === 'color' ? it.value : id); return true; },
  /** Level überspringen (Hauptlevel ohne Sterne) */
  skip(index) { if (Save.level(index)) return { ok: false, reason: 'schon gelöst' }; if (Save.coins < SKIP_PRICE) return { ok: false, reason: 'zu wenig Muscheln' }; Save.addCoins(-SKIP_PRICE); Save.skip(index); return { ok: true }; }
};
