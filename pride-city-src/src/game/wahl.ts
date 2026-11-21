/* Wahlfamilie: Freund*innen oder dein Match ziehen bei dir ein, ihr verbringt gemeinsame Abende, und ein Haustier
   aus dem Tierheim Pfötchenglück wohnt mit euch. Mitbewohner*innen sind abends und nachts zu Hause (18–9 Uhr),
   tagsüber arbeiten sie in der Stadt. Alles im Spielstand unter flags (wg_…, pet…). Echtes Wissen über Wahlfamilien
   gibt es an den Abenden. */
import type { SaveData } from '../engine/Save';
import type { Look } from './Actor';
import { NPCS } from './story';
import { PROFILES, dateRec, post } from './social';
import { change } from './life';
import { addCloseness } from './bond';

export const MAX_MATES = 2;
/** ab dieser Freundschaft (0–100) kann jemand einziehen */
export const MATE_BOND = 50;
/** Kern-Figuren der Stadt, die als Mitbewohner*innen in Frage kommen */
const CITY_MATES = ['mo', 'jules', 'nova', 'rex', 'bruno', 'lena', 'tariq', 'hilde', 'sam'];

export interface Mate { id: string; name: string; color: string; look: Look; match: boolean }
export function mateInfo(id: string): Mate | null {
  const n = NPCS.find((x) => x.id === id);
  if (n) return { id, name: n.name, color: n.color, look: { ...n.look, outfit: 'clothed' }, match: false };
  const p = PROFILES.find((x) => x.id === id);
  if (p) return { id, name: p.name, color: p.color, look: { body: p.body, palette: p.palette, skin: p.skin, outfit: 'clothed', top: p.pron !== 'er' }, match: true };
  return null;
}
export const mates = (s: SaveData): string[] => String(s.flags.wg || '').split(',').filter((x) => x && mateInfo(x));
/** Wer einziehen könnte (gute Freund*innen und feste Partner*innen, nicht schon Ehepartner*in) */
export function candidates(s: SaveData): Array<{ m: Mate; why: string | null }> {
  const have = mates(s), full = have.length >= MAX_MATES;
  const out: Array<{ m: Mate; why: string | null }> = [];
  for (const id of CITY_MATES) {
    const m = mateInfo(id)!, f = Number(s.rel[id]?.f) || 0;
    if (have.includes(id) || !s.rel[id]) continue;
    out.push({ m, why: full ? `Die WG ist voll (${MAX_MATES} Zimmer).` : f < MATE_BOND ? `erst ab „befreundet“ (${f}/${MATE_BOND})` : null });
  }
  for (const p of PROFILES) {
    if (have.includes(p.id) || !s.dates[p.id] || s.flags.spouse === p.id || s.flags.engaged === p.id) continue;
    const st = dateRec(s, p.id).st; if (st < 2) continue;
    out.push({ m: mateInfo(p.id)!, why: full ? `Die WG ist voll (${MAX_MATES} Zimmer).` : st < 3 ? 'erst, wenn ihr „Zusammen“ seid' : null });
  }
  return out;
}
export function moveIn(s: SaveData, id: string): string | null {
  const c = candidates(s).find((x) => x.m.id === id); if (!c) return 'Diese Person kann gerade nicht einziehen.';
  if (c.why) return c.why;
  s.flags.wg = [...mates(s), id].join(','); s.flags['wg_' + id] = s.day;
  if (s.rel[id]) s.rel[id].f = Math.min(100, s.rel[id].f + 15);
  if (c.m.match) addCloseness(s, id, 10);
  post(s, c.m.name, c.m.match ? 'Wir sind zusammengezogen! Zwei Zahnbürsten, ein Bad. 🏠💞' : 'Neue WG! Ich wohne jetzt mit meiner Wahlfamilie. 🏠🌈');
  return null;
}
export function moveOut(s: SaveData, id: string) { s.flags.wg = mates(s).filter((x) => x !== id).join(','); delete s.flags['wg_' + id]; }
/** Mitbewohner*innen sind abends und nachts zu Hause */
export const homeNow = (h: number) => h >= 18 || h < 9;

/* ---------- Gemeinsame Abende ---------- */
export interface Evening { id: string; icon: string; name: string; text: string; min: number; fx: Parameters<typeof change>[1]; food?: number; cost?: number; facts?: string[] }
export const EVENINGS: Evening[] = [
  { id: 'spiele', icon: '🎲', name: 'Spieleabend', text: 'Brettspiele, viel zu ehrgeizig und viel zu laut. Am Ende gewinnt die Person, die am lautesten lacht.', min: 120, fx: { fun: 28, social: 26, energy: -8 } },
  { id: 'koch', icon: '🍲', name: 'Kochabend', text: 'Jede*r bringt ein Familienrezept mit. Am Tisch wird es eng und warm.', min: 120, fx: { hunger: 70, social: 24, fun: 12 }, food: 1 },
  { id: 'film', icon: '🎬', name: 'Filmabend: queere Klassiker', text: 'Decken, Popcorn und ein Film, bei dem alle mitsprechen können.', min: 150, fx: { fun: 26, social: 18, energy: 6 }, cost: 6, facts: [
    '„Paris Is Burning“ (1990) zeigt die Ballroom-Szene in New York. Die „Houses“ dort sind Wahlfamilien mit einer „Mother“ an der Spitze.',
    '„Pose“ (2018–2021) erzählt von der Ballroom-Szene der 80er und 90er – mit der bis dahin größten Besetzung aus trans Schauspielerinnen.',
    '„Stadtgeschichten“ von Armistead Maupin (ab 1978) prägte die Idee der „logical family“: die Familie, die man sich selbst aussucht.',
  ] },
  { id: 'geschichte', icon: '📜', name: 'Erzählabend: Wahlfamilie damals', text: 'Hilde hat Fotos mitgebracht. Ihr hört zu, fragt nach und schweigt manchmal.', min: 90, fx: { social: 30, fun: 10 }, facts: [
    'In der Aids-Krise der 80er pflegten sich queere Freund*innen gegenseitig, als viele Herkunftsfamilien wegblieben. Daraus wuchsen Hilfsnetze wie die Deutsche Aidshilfe (gegründet 1983).',
    'In Ballroom-Houses fanden junge queere Menschen of Color ein Zuhause, oft nachdem ihre Familien sie verstoßen hatten.',
    'Queere Wohnprojekte wie der „Lebensort Vielfalt“ in Berlin bieten heute auch älteren Queers eine Wahlfamilie unter einem Dach.',
  ] },
  { id: 'karaoke', icon: '🎤', name: 'Wohnzimmer-Karaoke', text: 'Ein Mikrofon, eine Haarbürste als Ersatz und sehr viel ABBA.', min: 90, fx: { fun: 32, social: 20, energy: -10 } },
];
export function eveningWhy(s: SaveData, e: Evening, hour: number, people: number): string | null {
  if (!people) return 'Erst braucht es Mitbewohner*innen oder Familie zu Hause.';
  if (!(hour >= 18 || hour < 2)) return 'Gemeinsame Abende gibt es ab 18 Uhr.';
  if (s.flags.wgAbend === s.day) return 'Heute hattet ihr schon einen gemeinsamen Abend.';
  if (e.food && s.food < e.food) return 'Für den Kochabend fehlen Lebensmittel (Späti).';
  if (e.cost && s.money < e.cost) return `Snacks kosten ${e.cost} €.`;
  return null;
}
/** Abend verbringen: Wirkung, Freundschaft, ein Stück Wissen (falls vorhanden) */
export function doEvening(s: SaveData, e: Evening): string | null {
  s.flags.wgAbend = s.day; s.flags.wgAbende = (Number(s.flags.wgAbende) || 0) + 1;
  if (e.food) s.food -= e.food; if (e.cost) s.money -= e.cost;
  change(s, e.fx);
  for (const id of mates(s)) { if (s.rel[id]) s.rel[id].f = Math.min(100, s.rel[id].f + 4); if (mateInfo(id)?.match) addCloseness(s, id, 4); }
  if (!e.facts) return null;
  const n = Number(s.flags['wgf_' + e.id]) || 0; s.flags['wgf_' + e.id] = n + 1;
  return e.facts[n % e.facts.length];
}

/* ---------- Haustiere ---------- */
export interface PetKind { id: 'hund' | 'katze'; name: string; icon: string; fee: number; text: string; names: string[] }
export const PETS: PetKind[] = [
  { id: 'hund', name: 'Hund', icon: '🐶', fee: 90, text: 'Will raus, will spielen, will dich. Gassi gehen macht euch beide glücklich.', names: ['Bowie', 'Frida', 'Keks', 'Lotte', 'Rocky'] },
  { id: 'katze', name: 'Katze', icon: '🐱', fee: 70, text: 'Schläft 16 Stunden und entscheidet selbst, wann gekuschelt wird.', names: ['Freddie', 'Cher', 'Mimi', 'Oskar', 'Tilda'] },
];
export const pet = (s: SaveData) => { const k = PETS.find((p) => p.id === s.flags.pet); return k ? { kind: k, name: String(s.flags.petName || k.names[0]) } : null; };
/** Was das Tierheim erklärt (echte Abläufe in Deutschland) */
export const SHELTER_INFO = [
  'Tierheime verlangen eine Schutzgebühr und einen Vertrag. Vorher lernt ihr euch bei Besuchen kennen.',
  'Für Hunde zahlt man in fast allen Gemeinden Hundesteuer, und in einigen Bundesländern braucht es eine Haftpflichtversicherung.',
  'Katzen mit Freigang sollten kastriert, gechippt und registriert sein – das schützt vor ungewolltem Nachwuchs.',
];
export function adoptPet(s: SaveData, kind: PetKind['id'], name: string): string | null {
  if (s.flags.pet) return 'Ihr habt schon ein Haustier.';
  const k = PETS.find((p) => p.id === kind)!; if (s.money < k.fee) return `Die Schutzgebühr ist ${k.fee} € (dir fehlen ${k.fee - s.money} €).`;
  s.money -= k.fee; s.flags.pet = kind; s.flags.petName = name; s.flags.petDay = s.day; s.flags.petFed = s.day;
  post(s, 'Tierheim Pfötchenglück', `${name} hat ein neues Zuhause gefunden! ${k.icon}💕`);
  return null;
}
/** Hunger des Tiers: wer einen Tag nicht füttert, hat ein trauriges Tier */
export const petHungry = (s: SaveData) => !!s.flags.pet && s.day - (Number(s.flags.petFed) || 0) >= 1;
export function petAct(s: SaveData, act: 'feed' | 'pet' | 'play' | 'walk'): string | null {
  const p = pet(s); if (!p) return 'Kein Haustier.';
  const k = 'pet_' + act;
  if (act === 'feed') { if (!petHungry(s)) return `${p.name} ist satt.`; if (s.money < 3) return 'Futter kostet 3 €.'; s.money -= 3; s.flags.petFed = s.day; change(s, { fun: 4 }); return null; }
  if (s.flags[k] === s.day) return 'Heute schon gemacht.';
  if (act === 'walk' && p.kind.id !== 'hund') return 'Katzen gehen nicht Gassi. Sie gehen, wohin sie wollen.';
  s.flags[k] = s.day;
  change(s, act === 'pet' ? { fun: 10, social: 6 } : act === 'play' ? { fun: 16, energy: -4 } : { fun: 14, social: 12, energy: -8, hygiene: -4 });
  return null;
}
