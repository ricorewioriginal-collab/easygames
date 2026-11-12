// Taschi-Camp: Streicheln, Spielen und Füttern stärken die Freundschaft.
// Pro Taschi und Tag gibt es höchstens CAMP_DAILY Punkte. Ab AFFECTION
// Freundschaft hält ein Taschi im Kampf manchmal einen K.o.-Treffer aus oder
// schüttelt Statusveränderungen ab (siehe battle.js).
import { dayKey } from './daily.js';
import { SPECIES } from '../data/species.js';

export const CAMP_DAILY = 40, AFFECTION = 220, MAX_FRIENDSHIP = 255;
export const CAMP_ACTIONS = {
  pet: { label: 'Streicheln', icon: '🤚', gain: 3, text: (n) => n + ' schnurrt zufrieden.' },
  play: { label: 'Ball spielen', icon: '⚽', gain: 5, text: (n) => n + ' jagt dem Ball hinterher und bringt ihn stolz zurück!' },
  feed: { label: 'Taschi-Keks geben', icon: '🍪', gain: 12, item: 'taschikeks', text: (n) => n + ' knuspert den Keks mit leuchtenden Augen.' }
};

export function friendshipLabel(f = 70) {
  return f >= AFFECTION ? 'Beste Freunde ❤❤❤' : f >= 150 ? 'Sehr vertraut ❤❤' : f >= 100 ? 'Vertraut ❤' : f >= 60 ? 'Freundlich' : 'Noch schüchtern';
}
export function campLeft(s, m, today = dayKey()) {
  const d = (s.daily ||= {});
  if (d.campDay !== today) { d.campDay = today; d.camp = {}; }
  return Math.max(0, CAMP_DAILY - (d.camp[m.uid] || 0));
}
export function campAction(s, m, action, today = dayKey()) {
  const a = CAMP_ACTIONS[action], name = m.nick || SPECIES[m.id].name;
  if (!a) return { ok: false, text: 'Unbekannt.' };
  if (m.hp <= 0) return { ok: false, text: name + ' ist zu erschöpft zum Spielen.' };
  const left = campLeft(s, m, today);
  if (!left) return { ok: false, text: name + ' ist für heute rundum glücklich. Morgen wieder!' };
  if (a.item && !(s.bag[a.item] > 0)) return { ok: false, text: 'Du hast keine Taschi-Kekse. Es gibt sie im Laden.' };
  if (a.item) { s.bag[a.item]--; if (!s.bag[a.item]) delete s.bag[a.item]; }
  const gain = Math.min(left, a.gain), before = m.friendship ?? 70;
  m.friendship = Math.min(MAX_FRIENDSHIP, before + gain);
  s.daily.camp[m.uid] = (s.daily.camp[m.uid] || 0) + gain;
  const reached = before < AFFECTION && m.friendship >= AFFECTION;
  return { ok: true, gain: m.friendship - before, text: a.text(name) + (reached ? ' ' + name + ' vertraut dir jetzt blind!' : ''), reached };
}
