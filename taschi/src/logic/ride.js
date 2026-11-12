// Reiten & Surfen: Große Taschis tragen dich über Land (schneller als Rennen),
// Wasser-Taschis über Seen, Flüsse und das Meer. Reine Logik.
import { SPECIES } from '../data/species.js';

export const RIDE_BADGES = 1, SURF_BADGES = 3, FLY_BADGES = 5;
export const RIDE_SPEED = 10.5, SURF_SPEED = 6.5;
export const RIDE_MIN_SIZE = 1.15, SURF_MIN_SIZE = 0.9;
const RIDE_PLANS = ['quad', 'golem', 'serpent'];

const types = (id) => [SPECIES[id].type, SPECIES[id].type2].filter(Boolean);
const sizeOf = (id) => SPECIES[id]?.look?.size || 1;

export function rideable(id) { return !!SPECIES[id] && RIDE_PLANS.includes(SPECIES[id].look?.plan) && sizeOf(id) >= RIDE_MIN_SIZE; }
export function surfable(id) { return !!SPECIES[id] && types(id).includes('wasser') && sizeOf(id) >= SURF_MIN_SIZE; }

// Der Begleiter hat Vorrang, sonst das erste passende, kampffähige Taschi im Team.
function pick(s, test) {
  const fit = s.team.filter(m => m.hp > 0 && test(m.id));
  return fit.find(m => m.uid === s.companion) || fit[0] || null;
}
// Fliegen: Flug-Taschis (Typ Flug oder Vogel-/Drachenkörper mit Flügeln), groß genug für eine Person
export const FLY_MIN_SIZE = 0.85;
export function flyable(id) { const sp = SPECIES[id]; return !!sp && (types(id).includes('flug') || sp.look?.plan === 'bird' || !!sp.look?.features?.wings) && sizeOf(id) >= FLY_MIN_SIZE; }
export function flyMount(s) { return (s.badges || 0) >= FLY_BADGES ? pick(s, flyable) : null; }
export function flyHint(s) {
  if ((s.badges || 0) < FLY_BADGES) return 'Fliegen lernst du mit dem fünften Licht-Siegel. Bis dahin hilft das Flugtaxi im Heilzentrum.';
  return 'Zum Fliegen brauchst du ein kampffähiges Flug-Taschi, das groß genug ist (z. B. ein entwickeltes Vogel-Taschi).';
}
export function rideMount(s) { return (s.badges || 0) >= RIDE_BADGES ? pick(s, rideable) : null; }
export function surfMount(s) { return (s.badges || 0) >= SURF_BADGES ? pick(s, surfable) : null; }

// Hinweis, warum (noch) nicht geritten oder gesurft werden kann
export function rideHint(s) {
  if ((s.badges || 0) < RIDE_BADGES) return 'Reiten lernst du mit dem ersten Licht-Siegel.';
  return 'Kein Taschi im Team ist groß genug zum Reiten (z. B. ein voll entwickeltes Vierbeiner-Taschi).';
}
export function surfHint(s) {
  if ((s.badges || 0) < SURF_BADGES) return 'Surfen kannst du ab dem dritten Licht-Siegel.';
  return 'Zum Surfen brauchst du ein kampffähiges Wasser-Taschi, das groß genug ist.';
}
