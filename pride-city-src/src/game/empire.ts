/* Imperium wie im Open-World-Krimi, nur queer und herzlich: Läden, Bars und Clubs von Rainbow City kaufen oder
   als Partner*in einsteigen. Jedes Geschäft zahlt jeden Tag Einnahmen aus und bringt Ruf. Dazu das Regenbogen-Taxi:
   Fahrgäste mit eigenen Geschichten, je schneller, desto mehr Trinkgeld. */
import type { SaveData } from '../engine/Save';
import type { Gig } from './gigs';
import { daily, dayTick } from './manage';
import { pcEvents } from './hooks';
import { isClub } from './club';

export interface Business { id: string; name: string; icon: string; poi: string; price: number; daily: number; rep: number; need: number; pitch: string; /** nicht käuflich: Belohnung aus der Geschichte */ gift?: string }

export const BUSINESSES: Business[] = [
  { id: 'spaeti', name: 'Späti Lecker', icon: '🛒', poi: 'spaeti', price: 400, daily: 30, rep: 1, need: 0, pitch: 'Tariq sucht eine Teilhaberschaft. Kalte Mate, warme Worte, offen bis spät.' },
  { id: 'cafe', name: 'Café Kaffeeklatsch', icon: '☕', poi: 'cafe', price: 700, daily: 45, rep: 2, need: 3, pitch: 'Mo will eine Regenbogen-Ecke mit Lesungen. Du steigst als Partner*in ein.' },
  { id: 'beach', name: 'Strandbar Sandbank', icon: '🏖️', poi: 'beach', price: 1200, daily: 80, rep: 3, need: 6, pitch: 'Bruno verkauft die Strandbar. Sonnenuntergang, Cocktails, Queer Beach Party jeden Sonntag.' },
  { id: 'boutique', name: 'Boutique Fabelhaft', icon: '👗', poi: 'boutique', price: 1500, daily: 95, rep: 3, need: 8, pitch: 'Glitzer, Leder, Regenbogen: Die Boutique bekommt eine eigene Drag-Kollektion – mit dir.' },
  { id: 'onelove', name: 'One Love Bar', icon: '💗', poi: 'onelove', price: 2500, daily: 150, rep: 5, need: 12, pitch: 'Lady Luma braucht eine Partnerin für die Bühne und die Bar. Showtime jede Nacht.' },
  { id: 'kaleido', name: 'Theater Kaleidoskop', icon: '🎭', poi: 'kaleido', price: 0, daily: 180, rep: 0, need: 0, gift: 'Belohnung für Akt II in der Hochstadt', pitch: 'Das Revuetheater am Neonplatz. Das Haus Vega spielt, du bist Ehrenmitglied und am Gewinn beteiligt.' },
  { id: 'komet', name: 'Bar Komet', icon: '🍸', poi: 'komet', price: 3200, daily: 190, rep: 6, need: 14, pitch: 'Jo, die Wirtin, will nach dreißig Jahren in Rente. Kleine Bühne, Spiegelwand, Stammgäste seit 1990. Sie sucht jemanden mit Herz.' },
  { id: 'prisma', name: 'Club Prisma', icon: '🪩', poi: 'club', price: 4000, daily: 240, rep: 8, need: 18, pitch: 'Der größte Club der Stadt. Wer das Prisma hat, macht die Nächte von Rainbow City.' },
  { id: 'wolke', name: 'Skybar Wolke 7', icon: '🌃', poi: 'wolke', price: 6500, daily: 340, rep: 10, need: 24, pitch: 'Der 40. Stock über der Hochstadt. Investor Valentin verkauft, weil er nach Lissabon zieht. Wer hier oben feiert, sieht die ganze Stadt.' },
];
/** Wer verkauft (für das Gespräch im Laden) */
export const SELLERS: Record<string, { who: string; color: string; hello: string }> = {
  spaeti: { who: 'Tariq', color: '#3ee69a', hello: 'Teilhaber*in gesucht! Der Späti läuft, aber ich kann nicht jede Nacht hinter der Kasse stehen.' },
  cafe: { who: 'Mo', color: '#ffb36b', hello: 'Ich träume von einer Regenbogen-Ecke mit Lesungen. Allein schaffe ich das nicht.' },
  boutique: { who: 'Coco', color: '#ff6ad5', hello: 'Meine Drag-Kollektion braucht Geld und einen Namen. Bist du dabei?' },
  onelove: { who: 'Lady Luma', color: '#ff3fb0', hello: 'Schätzchen, die Bühne braucht eine Partnerin. Jemand, der die Bar führt, während ich singe.' },
  komet: { who: 'Wirtin Jo', color: '#ff6ad5', hello: 'Dreißig Jahre Komet. Hier hat sich halb Rainbow City zum ersten Mal verliebt. Ich will, dass es so bleibt.' },
  club: { who: 'Clubbesitzer Dario', color: '#b56bff', hello: 'Das Prisma ist mein Baby. Ich gebe es nur an jemanden ab, den die Szene kennt.' },
  wolke: { who: 'Investor Valentin', color: '#7fd4ff', hello: 'Lissabon ruft. Die Wolke 7 braucht jemanden mit Stil. Und mit Kapital.' },
};
/** Preis mit Story-Rabatt (s.flags.deal_<id> in Prozent) und Verhandlungserfolg (s.flags.haggle_<id>) */
export function priceOf(s: SaveData, b: Business) {
  const deal = Math.max(0, Math.min(90, Number(s.flags['deal_' + b.id]) || 0)), hag = s.flags['haggle_' + b.id] === 'ok' ? 15 : 0;
  return Math.round(b.price * (100 - Math.min(90, deal + hag)) / 100);
}
/** Verhandeln (einmal am Tag): mit genug Ruf über dem Mindestruf gibt es 15 % Nachlass */
export function haggle(s: SaveData, b: Business): boolean | string {
  if (s.flags['haggle_' + b.id] === 'ok') return 'Ihr habt euch schon auf einen Preis geeinigt.';
  if (s.flags['haggle_' + b.id] === s.day) return 'Heute nicht mehr. Komm morgen wieder.';
  if (s.rep >= b.need + 5) { s.flags['haggle_' + b.id] = 'ok'; return true; }
  s.flags['haggle_' + b.id] = s.day; return false;
}

const key = (id: string) => 'biz_' + id;
export const owns = (s: SaveData, id: string) => !!s.flags[key(id)];
export const owned = (s: SaveData) => BUSINESSES.filter((b) => owns(s, b.id));
/** Tagesgewinn aller Geschäfte (Umsatz minus Lohn, siehe manage.ts) */
export const income = (s: SaveData) => owned(s).reduce((n, b) => n + daily(s, b).net, 0);

/** Kaufen: liefert einen Grund, falls es nicht geht */
export function buy(s: SaveData, b: Business): string | null {
  if (owns(s, b.id)) return 'Gehört dir schon.';
  if (b.gift) return b.gift + '.';
  if (s.rep < b.need) return `Dafür brauchst du ${b.need} Ruf (du hast ${s.rep}).`;
  const price = priceOf(s, b);
  if (s.money < price) return `Dafür fehlen dir ${price - s.money} €.`;
  s.money -= price; s.rep += b.rep; s.flags[key(b.id)] = s.day;
  if (s.flags.bizDay === undefined) s.flags.bizDay = s.day;
  pcEvents.emit('geschaeftGekauft', { id: b.id, name: b.name, price });
  if (isClub(b.id)) pcEvents.emit('clubGekauft', { id: b.id, name: b.name, price });
  return null;
}

/** Meldungen der letzten Auszahlung (Veranstaltungskasse, Probleme) */
export const collectNotes: string[] = [];
const roll = (id: string, day: number) => { let h = day * 2654435761; for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return ((h >>> 0) % 1000) / 1000; };
/** Tageseinnahmen auszahlen (einmal je neuem Tag, höchstens eine Woche rückwirkend). Liefert den ausgezahlten Betrag. */
export function collect(s: SaveData): number {
  const mine = owned(s); if (!mine.length) return 0;
  const last = Number(s.flags.bizDay ?? s.day);
  if (s.day <= last) return 0;
  collectNotes.length = 0;
  let pay = 0;
  for (let d = Math.max(last + 1, s.day - 6); d <= s.day; d++) for (const b of mine) { const t = dayTick(s, b, roll(b.id, d)); pay += t.pay; collectNotes.push(...t.notes); }
  s.money += pay; s.flags.bizDay = s.day;
  pcEvents.emit('clubEinnahmen', { pay, notes: [...collectNotes] });
  return pay;
}

/* ---------- Regenbogen-Taxi ---------- */
const SPOTS: Record<string, [number, number, string]> = {
  plaza: [-15, 22, 'Pride Plaza'], cafe: [4, 10, 'Café Kaffeeklatsch'], club: [4, -10, 'Club Prisma'], spaeti: [-4, 40, 'Späti Lecker'],
  boutique: [34, 10, 'Boutique Fabelhaft'], gym: [34, -20, 'Muckibude'], studio: [-34, 20, 'Studio Klappe Auf'], checkpoint: [-34, -10, 'Checkpoint'],
  onelove: [34, 20, 'One Love Bar'], park: [40, 40, 'Regenbogenpark'], bar: [-71, -12, 'Club Leuchtturm'], beach: [-80, 30, 'Strandbar Sandbank'], center: [-4, -10, 'Regenbogenhaus'],
};
const RIDERS: Array<[string, string, string, string]> = [
  ['Drag-Queen Cherry', 'onelove', 'club', 'Darling, mein Auftritt beginnt in zehn Minuten und die Wimpern sitzen noch nicht. Gib Gas!'],
  ['Brautpaar Jonas & Emre', 'center', 'park', 'Wir haben eben Ja gesagt! Zum Park, da wartet die ganze Familie mit Konfetti.'],
  ['Ballroom-Kid Dee', 'studio', 'plaza', 'Heute ist Vogue-Ball am Plaza. Kategorie: Realness. Ich gewinne das!'],
  ['Opa Herbert', 'cafe', 'checkpoint', 'Ich bin seit 1978 auf jeder Demo. Heute zum Checkpoint, ehrenamtlich Kaffee kochen.'],
  ['Bärenclub-Kurt', 'gym', 'beach', 'Training vorbei, jetzt Bärchen-Treffen an der Strandbar. Fahr schön gemütlich – nee, doch schnell!'],
  ['Lesbenchor „Laut & Lila“', 'plaza', 'onelove', 'Wir proben heute in der One Love Bar. Sopran vorne, Alt hinten, alle anschnallen!'],
  ['Trans-Aktivistin Mira', 'checkpoint', 'center', 'Pressekonferenz im Regenbogenhaus. Wir kämpfen für die Selbstbestimmung, und ich bin spät dran.'],
  ['DJ Pixel', 'spaeti', 'bar', 'Meine Plattenkiste und ich müssen zum Leuchtturm. Ich zahl in Gästelistenplätzen. Und in Euro.'],
  ['Tourist Ole aus Kopenhagen', 'park', 'boutique', 'Erste Pride in Rainbow City! Ich brauche dringend mehr Glitzer. Zur Boutique, bitte!'],
  ['Nonbinary Poet Sasha', 'boutique', 'cafe', 'Lesung im Café, mein neues Gedicht heißt „Fahrstreifen der Liebe“. Passend, oder?'],
];

/** Nächste Fahrt: Fahrgast und Ziel, Lohn steigt mit der Serie */
export function nextFare(streak: number, r: number): Gig {
  const [who, a, b, line] = RIDERS[Math.floor(r * RIDERS.length) % RIDERS.length];
  const from = SPOTS[a], to = SPOTS[b];
  const dist = Math.hypot(from[0] - to[0], from[1] - to[1]);
  return {
    id: 'taxi', who, color: '#ffd23b', title: `🚕 Regenbogen-Taxi${streak ? ` · Serie ${streak + 1}` : ''}`, call: line, car: true,
    steps: [{ x: from[0], z: from[1], label: `${who} am ${from[2]} abholen`, icon: '🙋' }, { x: to[0], z: to[1], label: `Zum ${to[2]}`, icon: '🏁' }],
    time: Math.round(35 + dist * 1.1), pay: Math.round(15 + dist * .5 + streak * 8), rep: streak >= 2 ? 1 : 0,
    done: `${who}: „Danke! Fünf Sterne und ein Herz.“`,
  };
}
