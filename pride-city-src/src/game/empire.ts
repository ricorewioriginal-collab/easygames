/* Imperium wie im Open-World-Krimi, nur queer und herzlich: Läden, Bars und Clubs von Rainbow City kaufen oder
   als Partner*in einsteigen. Jedes Geschäft zahlt jeden Tag Einnahmen aus und bringt Ruf. Dazu das Regenbogen-Taxi:
   Fahrgäste mit eigenen Geschichten, je schneller, desto mehr Trinkgeld. */
import type { SaveData } from '../engine/Save';
import type { Gig } from './gigs';

export interface Business { id: string; name: string; icon: string; poi: string; price: number; daily: number; rep: number; need: number; pitch: string }

export const BUSINESSES: Business[] = [
  { id: 'spaeti', name: 'Späti Lecker', icon: '🛒', poi: 'spaeti', price: 400, daily: 30, rep: 1, need: 0, pitch: 'Tariq sucht eine Teilhaberschaft. Kalte Mate, warme Worte, offen bis spät.' },
  { id: 'cafe', name: 'Café Kaffeeklatsch', icon: '☕', poi: 'cafe', price: 700, daily: 45, rep: 2, need: 3, pitch: 'Mo will eine Regenbogen-Ecke mit Lesungen. Du steigst als Partner*in ein.' },
  { id: 'beach', name: 'Strandbar Sandbank', icon: '🏖️', poi: 'beach', price: 1200, daily: 80, rep: 3, need: 6, pitch: 'Bruno verkauft die Strandbar. Sonnenuntergang, Cocktails, Queer Beach Party jeden Sonntag.' },
  { id: 'boutique', name: 'Boutique Fabelhaft', icon: '👗', poi: 'boutique', price: 1500, daily: 95, rep: 3, need: 8, pitch: 'Glitzer, Leder, Regenbogen: Die Boutique bekommt eine eigene Drag-Kollektion – mit dir.' },
  { id: 'onelove', name: 'One Love Bar', icon: '💗', poi: 'onelove', price: 2500, daily: 150, rep: 5, need: 12, pitch: 'Lady Luma braucht eine Partnerin für die Bühne und die Bar. Showtime jede Nacht.' },
  { id: 'prisma', name: 'Club Prisma', icon: '🪩', poi: 'club', price: 4000, daily: 240, rep: 8, need: 18, pitch: 'Der größte Club der Stadt. Wer das Prisma hat, macht die Nächte von Rainbow City.' },
];

const key = (id: string) => 'biz_' + id;
export const owns = (s: SaveData, id: string) => !!s.flags[key(id)];
export const owned = (s: SaveData) => BUSINESSES.filter((b) => owns(s, b.id));
export const income = (s: SaveData) => owned(s).reduce((n, b) => n + b.daily, 0);

/** Kaufen: liefert einen Grund, falls es nicht geht */
export function buy(s: SaveData, b: Business): string | null {
  if (owns(s, b.id)) return 'Gehört dir schon.';
  if (s.rep < b.need) return `Dafür brauchst du ${b.need} Ruf (du hast ${s.rep}).`;
  if (s.money < b.price) return `Dafür fehlen dir ${b.price - s.money} €.`;
  s.money -= b.price; s.rep += b.rep; s.flags[key(b.id)] = s.day;
  if (s.flags.bizDay === undefined) s.flags.bizDay = s.day;
  return null;
}

/** Tageseinnahmen auszahlen (einmal je neuem Tag). Liefert den ausgezahlten Betrag. */
export function collect(s: SaveData): number {
  const n = income(s); if (!n) return 0;
  const last = Number(s.flags.bizDay ?? s.day);
  if (s.day <= last) return 0;
  const pay = n * Math.min(7, s.day - last);
  s.money += pay; s.flags.bizDay = s.day;
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
