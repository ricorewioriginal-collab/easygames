/* Glitzergram: das Foto-Netzwerk von Rainbow City. Fotos aus dem Fotomodus (fotomodus.ts) bekommen Likes je nach Ort,
   Licht, Leuten im Bild, Filter und deinem Auftritt. Follower wachsen mit, ab bestimmten Zahlen melden sich Marken
   für Kooperationen (Influencer-Aufträge mit Bedingungen). Die Bilder selbst liegen nur im Browser (localStorage),
   im Spielstand stehen Follower, Zähler und Aufträge. */
import type { SaveData } from '../engine/Save';
import { post } from './social';
import { pcEvents } from './hooks';

export const FILTERS = [
  { id: 'none', name: 'Ohne Filter', icon: '⚪' },
  { id: 'regenbogen', name: 'Regenbogen', icon: '🌈' },
  { id: 'neon', name: 'Neon', icon: '💜' },
  { id: 'gold', name: 'Goldene Stunde', icon: '🌅' },
  { id: 'vintage', name: 'Vintage', icon: '📼' },
  { id: 'sw', name: 'Schwarz-Weiß', icon: '🖤' },
  { id: 'glitzer', name: 'Glitzer', icon: '✨' },
] as const;
export type FilterId = typeof FILTERS[number]['id'];

/** Was auf dem Foto ist (beim Auslösen gemessen) */
export interface ShotCtx {
  spot: string | null; spotName: string; hour: number; day: number;
  people: number; me: boolean; selfie: boolean; filter: FilterId;
  bare: boolean; mus: number; tattoos: number; parade: boolean; rainbow: boolean; rain: boolean; x: number; z: number;
}
/** Berühmte Orte zählen mehr */
const FAME: Record<string, number> = {
  plaza: 1.45, park: 1.2, beach: 1.35, wolke: 1.5, club: 1.3, onelove: 1.3, kaleido: 1.35, komet: 1.15, hotel: 1.3, bar: 1.25,
  boutique: 1.15, cafe: 1.1, galerie: 1.2, welten: 1.25, laterne: 1.1, astra: 1.15, center: 1.15, penthouse: 1.4,
};
const golden = (h: number) => (h >= 5.5 && h < 8) || (h >= 18 && h < 20.5);
const night = (h: number) => h >= 21 || h < 4.5;
const NEON = new Set(['club', 'onelove', 'komet', 'wolke', 'laterne', 'kopfkino', 'rosa', 'bar', 'astra', 'diner', 'kaleido']);
export const isParade = (s: SaveData, h: number) => (s.day - 1) % 7 === 5 && h >= 12 && h < 18;

export const followers = (s: SaveData) => Math.max(0, Math.round(Number(s.flags.fol) || 0));
/** Bewertung 0,4 … ~4: Ort, Licht, Leute, Auftritt, Filter, Abwechslung */
export function quality(s: SaveData, c: ShotCtx) {
  let q = c.spot ? FAME[c.spot] || 1.05 : .85;
  if (golden(c.hour)) q *= 1.35; else if (night(c.hour)) q *= c.spot && NEON.has(c.spot) ? 1.25 : .95;
  q *= 1 + Math.min(8, c.people) * .07;
  if (c.me) q *= c.selfie ? 1.2 : 1.12; else q *= .85;
  if (c.me && c.bare) q *= 1.08 + Math.max(0, c.mus - 20) * .006;
  if (c.me) q *= 1 + Math.min(3, c.tattoos) * .05;
  if (c.parade) q *= 1.4;
  if (c.rainbow) q *= 1.5;
  if (c.rain && c.filter === 'sw') q *= 1.15;
  const fit = (c.filter === 'neon' && night(c.hour)) || (c.filter === 'gold' && golden(c.hour)) || (c.filter === 'regenbogen' && c.parade) || (c.filter === 'vintage' && (c.spot === 'galerie' || c.spot === 'astra' || c.spot === 'kaleido'));
  q *= c.filter === 'none' ? 1 : fit ? 1.22 : 1.05;
  // dreimal derselbe Ort hintereinander langweilt
  const last = String(s.flags.gramLast || '').split(',');
  if (c.spot && last.filter((x) => x === c.spot).length >= 2) q *= .7;
  return Math.max(.4, q);
}

/* ---------- Kooperationen (Influencer-Aufträge) ---------- */
export interface Brief { id: string; brand: string; who: string; color: string; icon: string; need: number; pay: number; fol: number; text: string; check: (c: ShotCtx, s: SaveData) => string | null }
const at = (c: ShotCtx, ...spots: string[]) => (c.spot && spots.includes(c.spot) ? null : 'Falscher Ort');
export const BRIEFS: Brief[] = [
  { id: 'lavendel', brand: 'Café Kaffeeklatsch', who: 'Mo', color: '#ff7a3d', icon: '☕', need: 0, pay: 40, fol: 60,
    text: 'Unser Lavendel-Cappuccino braucht Liebe. Ein Foto vor dem Café, bei Tageslicht.', check: (c) => at(c, 'cafe') || (c.hour >= 7 && c.hour < 18 ? null : 'Nur bei Tageslicht (7–18 Uhr)') },
  { id: 'kollektion', brand: 'Boutique Fabelhaft', who: 'Coco', color: '#ff6ad5', icon: '👗', need: 60, pay: 70, fol: 90,
    text: 'Zeig dich vor der Boutique! Du musst selbst im Bild sein, Schätzchen.', check: (c) => at(c, 'boutique') || (c.me ? null : 'Du musst selbst im Bild sein') },
  { id: 'club', brand: 'Club Prisma', who: 'DJ Nova', color: '#ff2fd2', icon: '🪩', need: 250, pay: 120, fol: 160,
    text: 'Clubnacht-Werbung: Foto vor dem Prisma, nachts, mit mindestens drei Leuten im Bild.', check: (c) => at(c, 'club') || (night(c.hour) ? null : 'Nur nachts (21–4 Uhr)') || (c.people >= 3 ? null : 'Mindestens drei Leute ins Bild') },
  { id: 'sunrise', brand: 'Galerie Farbrausch', who: 'Odette', color: '#c9a2ff', icon: '🖼️', need: 300, pay: 140, fol: 200,
    text: 'Bring mir ein Foto vom Pride Plaza bei Sonnenaufgang, und ich hänge es auf.', check: (c) => at(c, 'plaza') || (c.hour >= 5 && c.hour < 8 ? null : 'Nur bei Sonnenaufgang (5–8 Uhr)') },
  { id: 'sunset', brand: 'Strandbar Sandbank', who: 'Bruno', color: '#d56300', icon: '🍹', need: 400, pay: 130, fol: 220,
    text: 'Sonnenuntergang an der Strandbar, mit Filter „Goldene Stunde“. Das ist unser Plakat für den Sommer.', check: (c) => at(c, 'beach') || (c.hour >= 18 && c.hour < 21 ? null : 'Nur bei Sonnenuntergang (18–21 Uhr)') || (c.filter === 'gold' ? null : 'Filter „Goldene Stunde“ wählen') },
  { id: 'tinte', brand: 'Tinte & Stolz', who: 'Ink-Ines', color: '#3ddc97', icon: '🖋️', need: 500, pay: 150, fol: 260,
    text: 'Zeig dein Tattoo! Du im Bild, mit Haut, mit Tinte.', check: (c) => (c.me ? null : 'Du musst selbst im Bild sein') || (c.tattoos ? null : 'Erst ein Tattoo stechen lassen (Boutique)') || (c.bare ? null : 'Oberkörperfrei, Badesachen oder Harness tragen') },
  { id: 'sommer', brand: 'Muckibude Muskelkater', who: 'Coach Mehmet', color: '#ffd23b', icon: '💪', need: 700, pay: 180, fol: 320,
    text: 'Sommer-Body-Kampagne: Du, oberkörperfrei, mit sichtbaren Muskeln (ab 45). Jedes Körpergefühl ist willkommen, aber diese Kampagne heißt nun mal Muskelkater.', check: (c) => (c.me ? null : 'Du musst selbst im Bild sein') || (c.bare ? null : 'Oberkörperfrei, Badesachen oder Harness tragen') || (c.mus >= 45 ? null : `Muskeln ${c.mus}/45: mehr trainieren`) },
  { id: 'skyline', brand: 'Skybar Wolke 7', who: 'Valentin Ross', color: '#7fd4ff', icon: '🌃', need: 1000, pay: 220, fol: 420,
    text: 'Die Hochstadt bei Nacht, mit Filter „Neon“. Am besten vor der Wolke 7.', check: (c) => (c.x > 80 ? null : 'In der Hochstadt fotografieren') || (night(c.hour) ? null : 'Nur nachts (21–4 Uhr)') || (c.filter === 'neon' ? null : 'Filter „Neon“ wählen') },
  { id: 'parade', brand: 'CSD Rainbow City e. V.', who: 'Jules', color: '#9c59d1', icon: '🏳️‍🌈', need: 1500, pay: 260, fol: 600,
    text: 'Die Parade live: Samstag 12–18 Uhr, mindestens fünf Leute im Bild. Zeig, wie viele wir sind.', check: (c) => (c.parade ? null : 'Nur während der CSD-Parade (Samstag 12–18 Uhr)') || (c.people >= 5 ? null : 'Mindestens fünf Leute ins Bild') },
  { id: 'aurora', brand: 'Grand Hotel Aurora', who: 'Direktor von Rhein', color: '#ffd9a0', icon: '🏨', need: 3000, pay: 400, fol: 900,
    text: 'Luxus mit Glitzer: ein Selfie vor der Aurora, abends, mit Filter „Glitzer“.', check: (c) => at(c, 'hotel') || (c.selfie ? null : 'Als Selfie (🤳)') || (c.hour >= 18 || c.hour < 2 ? null : 'Abends ab 18 Uhr') || (c.filter === 'glitzer' ? null : 'Filter „Glitzer“ wählen') },
];
export const briefOpen = (s: SaveData, b: Brief) => followers(s) >= b.need && !s.flags['brief_' + b.id];
export const activeBrief = (s: SaveData) => BRIEFS.find((b) => b.id === s.flags.brief) || null;
export function takeBrief(s: SaveData, id: string): string | null {
  const b = BRIEFS.find((x) => x.id === id); if (!b) return 'Gibt es nicht.';
  if (s.flags['brief_' + id]) return 'Schon erledigt.';
  if (followers(s) < b.need) return `Ab ${b.need} Followern.`;
  s.flags.brief = id; return null;
}

const COMMENTS = {
  me: ['Wow, du strahlst! ✨', 'Dieser Look 😍', 'Main character energy 💅', 'Ich will dein Leben 🌈', 'Stilikone!'],
  muscles: ['Die Arme! 💪', 'Muckibude zahlt sich aus 🔥', 'Bist du das wirklich? 😳💪'],
  people: ['So viele schöne Menschen 🏳️‍🌈', 'Wir sind mehr! ✊', 'Ich seh mich hinten links 👋'],
  golden: ['Dieses Licht 🌅', 'Goldene Stunde, goldene Stadt', 'Sonnenuntergang mit dir? 🥹'],
  night: ['Rainbow City bei Nacht 💜', 'Neon-Träume 🪩', 'Wer ist noch wach?'],
  plain: ['Schönes Bild!', 'Wo ist das? 😍', 'Rainbow City ❤️', 'Hach 💛', 'Mehr davon!'],
};
const WHO = ['nova_glitzt', 'kai.baerchen', 'robin.zeichnet', 'jules.they', 'hilde1978', 'luca_tanzt', 'mo.kaffee', 'dragcherry', 'sam.trans.joy', 'tariq.kocht'];

export interface GramPost { id: number; d: number; img: string; likes: number; spot: string; cap: string; comments: Array<[string, string]> }
const KEY = 'pc_gram';
export function photos(): GramPost[] { try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } }
function keep(list: GramPost[]) {
  for (let n = Math.min(list.length, 12); n > 0; n--) { try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, n))); return; } catch { /* voll: weniger Bilder behalten */ } }
}

export interface Posted { likes: number; gain: number; brief: Brief | null; briefWhy: string | null; post: GramPost; milestone: number }
/** Foto posten: Likes, Follower, Kommentare, vielleicht ein erfüllter Auftrag. r = Zufallszahl 0 … 1 */
export function postShot(s: SaveData, c: ShotCtx, img: string, cap: string, r = Math.random()): Posted {
  const q = quality(s, c), f0 = followers(s);
  const likes = Math.max(1, Math.round((10 + f0 * .09) * q * (.85 + r * .3)));
  let gain = Math.round(likes * .22 + q * 4);
  const b = activeBrief(s);
  let done: Brief | null = null, why: string | null = null;
  if (b) { why = b.check(c, s); if (!why) { done = b; s.flags['brief_' + b.id] = s.day; delete s.flags.brief; s.money += b.pay; gain += b.fol; s.rep += 2; } }
  const f1 = f0 + gain; s.flags.fol = f1;
  s.flags.gramPosts = (Number(s.flags.gramPosts) || 0) + 1;
  s.flags.gramLikes = Math.max(Number(s.flags.gramLikes) || 0, likes);
  s.flags.gramLast = [c.spot || '-', ...String(s.flags.gramLast || '').split(',')].slice(0, 3).join(',');
  // Creator-Fonds: ab 1.000 Followern 1 € je 50 Likes
  if (f1 >= 1000) s.money += Math.floor(likes / 50);
  const pool = [...(c.me ? COMMENTS.me : []), ...(c.me && c.bare && c.mus >= 45 ? COMMENTS.muscles : []), ...(c.people >= 3 ? COMMENTS.people : []), ...(golden(c.hour) ? COMMENTS.golden : []), ...(night(c.hour) ? COMMENTS.night : []), ...COMMENTS.plain];
  const comments: Array<[string, string]> = [0, 1, 2].map((i) => [WHO[Math.floor((r * 97 + i * 31) % WHO.length)], pool[Math.floor((r * 53 + i * 17) % pool.length)]]);
  const p: GramPost = { id: Date.now(), d: s.day, img, likes, spot: c.spotName, cap, comments };
  keep([p, ...photos()]);
  post(s, s.name || 'Du', `📸 ${cap || c.spotName} · ❤️ ${likes}`);
  const milestone = [100, 1000, 10000, 100000].find((m) => f0 < m && f1 >= m) || 0;
  pcEvents.emit('glitzergram', { likes, followers: f1, spot: c.spot || '', brief: done?.id || null });
  return { likes, gain, brief: done, briefWhy: why, post: p, milestone };
}
export const fmtNum = (n: number) => (n >= 10000 ? (n / 1000).toFixed(n >= 100000 ? 0 : 1).replace('.', ',') + ' Tsd.' : n.toLocaleString('de-DE'));
