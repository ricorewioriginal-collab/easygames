/* Geschäft führen: Jedes eigene Geschäft hat Personal, Ausbauten, Beliebtheit, Veranstaltungen und ab und zu ein
   Problem, um das du dich kümmerst. Daraus ergibt sich der Tagesgewinn (empire.ts zahlt ihn aus).
   Ohne Eingriff bleibt alles wie bisher: Grundertrag, Beliebtheit 60 = Faktor 1. */
import type { SaveData } from '../engine/Save';
import type { Business } from './empire';
import { clubFactor } from './club';

export const STAFF = [
  { name: 'Nur du', mult: 1, wage: 0, fee: 0, text: 'Du schließt selbst auf und ab.' },
  { name: 'Aushilfe', mult: 1.35, wage: .15, fee: 3, text: 'Eine Aushilfe für die Stoßzeiten.' },
  { name: 'Festes Team', mult: 1.75, wage: .3, fee: 8, text: 'Drei Leute, die den Laden lieben.' },
  { name: 'Geschäftsführung', mult: 2.2, wage: .45, fee: 16, text: 'Regelt Probleme selbst und hält die Beliebtheit.' },
];
export const UPGRADES = [
  { id: 'deko', icon: '🛋️', name: 'Einrichtung', text: 'Neue Möbel, Licht, frische Farbe' },
  { id: 'werbung', icon: '📣', name: 'Werbung', text: 'Plakate, Radio-Spot, Social Media' },
  { id: 'extra', icon: '⭐', name: 'Besonderes', text: 'Das gewisse Etwas' },
] as const;
export type UpId = typeof UPGRADES[number]['id'];
export const UP_MAX = 3, UP_GAIN = .12;
/** Das „Besondere“ und die Veranstaltung je Geschäft */
export const SPECIAL: Record<string, { extra: string; event: string; eventText: string }> = {
  spaeti: { extra: 'Bank vor der Tür und Nachtschalter', event: 'Späti-Sommerfest', eventText: 'Bierbänke, Lichterkette und die ganze Nachbarschaft vor dem Laden.' },
  cafe: { extra: 'Regenbogen-Ecke mit Bühne', event: 'Lesung mit Kuchen', eventText: 'Eine queere Autorin liest, Mo backt dreistöckig.' },
  beach: { extra: 'Sonnendeck mit Feuerschale', event: 'Queer Beach Party', eventText: 'DJ im Sand, Cocktails, Sonnenuntergang und Tanzen bis zur Flut.' },
  boutique: { extra: 'Eigene Drag-Kollektion', event: 'Modenschau auf dem Gehweg', eventText: 'Der Bürgersteig wird zum Laufsteg, das Viertel applaudiert.' },
  onelove: { extra: 'Größere Bühne mit Flügel', event: 'Galaabend mit Lady Luma', eventText: 'Ausverkauft, Stehplätze bis zur Tür, drei Zugaben.' },
  kaleido: { extra: 'Restaurierter Kronleuchter', event: 'Großer Ball der Häuser', eventText: 'Fünf Häuser, zwölf Kategorien, eine Nacht.' },
  komet: { extra: 'Spiegelbühne mit Klavierbar', event: 'Karaoke-Nacht der Stammgäste', eventText: 'Jo singt „I Will Survive“, der ganze Komet singt mit.' },
  wolke: { extra: 'Glasboden über der Stadt', event: 'Sunset-Session über den Dächern', eventText: 'Sonnenuntergang im 40. Stock, Saxofon und Glitzer-Cocktails.' },
  prisma: { extra: 'Lasershow und zweiter Floor', event: 'Prisma-Nacht mit Star-DJ', eventText: 'Die Schlange reicht bis zum Pride Plaza.' },
  wasch: { extra: 'Bar zwischen den Trocknern', event: 'Schaumparty', eventText: 'Schaum bis zu den Knien, DJ auf der Waschmaschine, das Viertel tanzt im Schleudergang.' },
  deli: { extra: 'Fensterplätze mit Blick auf die Avenue', event: 'Mitternachts-Bagel-Battle', eventText: 'Wer belegt den verrücktesten Bagel? Die Jury: drei Taxifahrer und eine Drag-Queen.' },
  pizza: { extra: 'Zweiter Steinofen und Terrasse', event: 'Pizza-Abend mit Nonna', eventText: 'Nonna Rosaria zeigt, wie der Teig fliegt. Alle dürfen mitkneten, keiner darf Ananas sagen.' },
  diner: { extra: 'Neue Jukebox mit Disco-Klassikern', event: 'Drag-Brunch', eventText: 'Pancakes, Mimosas und eine Show auf dem Tresen. Ausverkauft bis Weihnachten.' },
  galerie: { extra: 'Lichtsaal für Fotografie', event: 'Vernissage „Stolz in Öl“', eventText: 'Sekt, Häppchen und vierzig Porträts aus hundert Jahren queerer Stadtgeschichte.' },
  gym: { extra: 'Neue Geräte und Spiegelwand', event: 'Kurs „Bauch, Beine, Pride“', eventText: 'Coach Mehmet brüllt, alle schwitzen, am Ende tanzt der ganze Kurs zu Kylie.' },
  sauna: { extra: 'Panorama-Aufgusssauna', event: 'Mitternachts-Aufguss', eventText: 'Torsten wedelt mit dem Handtuch zu Opernmusik. Der heißeste Aufguss am Hafen.' },
  astra: { extra: 'Restaurierte Samtsessel und Leinwand', event: 'Queere Filmnacht', eventText: 'Drei Klassiker, Popcorn mit Glitzer und ein Saal, der bei jedem Kuss jubelt.' },
  flamingo: { extra: 'Pool mit Regenbogen-Licht', event: 'Pool-Party unter Palmen', eventText: 'Luftmatratzen in Flamingo-Form, DJ am Beckenrand, Sonnenuntergang über der Playa.' },
  aurora: { extra: 'Fünfter Stern und Ballsaal', event: 'Großer Ball in der Aurora', eventText: 'Smoking, Pailletten und ein Walzer unter dem Kronleuchter. Die ganze Stadt will dabei sein.' },
  kranhaus: { extra: 'Dachbar oben im Kran', event: 'Hafenfest im Kranhaus', eventText: 'Lichterketten am Kranarm, Musik vom Kai. Wo Kral Grau wollte, ist es jetzt bunt.' },
};
/** Hotels füllen sich am Wochenende, zur CSD-Parade ist alles ausgebucht (Wochentag: (Tag − 1) % 7, 4 = Freitag, 5 = Samstag) */
export const hotelFactor = (s: SaveData, b: Business) => { if (b.kind !== 'hotel') return 1; const wd = (s.day - 1) % 7; return wd === 5 ? 1.6 : wd === 4 || wd === 6 ? 1.3 : 1; };
export const ISSUES = [
  { id: 'kuehlung', text: 'Die Kühlung ist ausgefallen.', fix: 'Techniker rufen' },
  { id: 'amt', text: 'Das Ordnungsamt hat eine Beschwerde wegen Lärm.', fix: 'Mit den Nachbarn reden und Dämmung einbauen' },
  { id: 'lieferung', text: 'Die Lieferung ist nicht gekommen.', fix: 'Ersatz beim Großmarkt holen' },
  { id: 'krank', text: 'Das halbe Team ist krank.', fix: 'Aushilfen für diese Woche buchen' },
];
export const EVENT_EVERY = 3;

const k = (b: string, f: string) => `mg_${b}_${f}`;
const num = (s: SaveData, key: string, d = 0) => { const v = s.flags[key]; return v === undefined ? d : Number(v); };
export const staffOf = (s: SaveData, b: string) => Math.min(STAFF.length - 1, num(s, k(b, 'staff')));
export const upOf = (s: SaveData, b: string, u: UpId) => Math.min(UP_MAX, num(s, k(b, u)));
export const popOf = (s: SaveData, b: string) => Math.max(0, Math.min(100, num(s, k(b, 'pop'), 60)));
export const issueOf = (s: SaveData, b: string) => ISSUES.find((i) => i.id === s.flags[k(b, 'issue')]) || null;
export const setPop = (s: SaveData, b: string, v: number) => { s.flags[k(b, 'pop')] = Math.max(0, Math.min(100, Math.round(v))); };

/** Faktor aus der Beliebtheit: 60 = 1, 100 = 1,2, 0 = 0,7 */
export const popFactor = (pop: number) => .7 + pop * .005;
export const upCost = (b: Business, level: number) => Math.round(Math.max(300, b.price * .25, b.daily * 6) * (level + 1) / 10) * 10;
export const staffFee = (b: Business, level: number) => Math.round(b.daily * STAFF[level].fee);
export const fixCost = (b: Business) => Math.round(b.daily * 1.2);
export const eventCost = (b: Business) => Math.round(b.daily * 1.5);

/** Umsatz und Lohn eines Tages */
export function daily(s: SaveData, b: Business) {
  const st = STAFF[staffOf(s, b.id)], ups = UPGRADES.reduce((n, u) => n + upOf(s, b.id, u.id), 0);
  const cf = clubFactor(s, b.id);   // Nachtclubs: DJ, Preise, Tür, Deko (club.ts), sonst Faktor 1
  const gross = Math.round(b.daily * st.mult * (1 + ups * UP_GAIN) * popFactor(popOf(s, b.id)) * (issueOf(s, b.id) ? .5 : 1) * cf.mult * hotelFactor(s, b));
  const wage = Math.round(b.daily * st.wage) + cf.cost;
  return { gross, wage, net: gross - wage };
}

export function hire(s: SaveData, b: Business, level: number): string | null {
  const cur = staffOf(s, b.id);
  if (level === cur) return 'So ist es schon besetzt.';
  if (level > cur) { const fee = staffFee(b, level) - staffFee(b, cur); if (s.money < fee) return `Für Einarbeitung und Verträge fehlen dir ${fee - s.money} €.`; s.money -= fee; }
  s.flags[k(b.id, 'staff')] = level;
  return null;
}
export function upgrade(s: SaveData, b: Business, u: UpId): string | null {
  const l = upOf(s, b.id, u);
  if (l >= UP_MAX) return 'Mehr geht nicht. Schöner wird es nicht mehr.';
  const c = upCost(b, l); if (s.money < c) return `Dafür fehlen dir ${c - s.money} €.`;
  s.money -= c; s.flags[k(b.id, u)] = l + 1;
  if (u === 'werbung') setPop(s, b.id, popOf(s, b.id) + 8);
  return null;
}
/** Selbst mit anpacken (einmal am Tag): Beliebtheit steigt */
export function workIn(s: SaveData, b: Business): string | null {
  if (s.flags[k(b.id, 'work')] === s.day) return 'Heute hast du hier schon mit angepackt.';
  s.flags[k(b.id, 'work')] = s.day; setPop(s, b.id, popOf(s, b.id) + 12);
  return null;
}
export const eventReady = (s: SaveData, b: string) => { const last = s.flags[k(b, 'ev')]; return last === undefined ? 0 : Math.max(0, EVENT_EVERY - (s.day - Number(last))); };
/** Veranstaltung ausrichten: kostet sofort, bringt am nächsten Morgen Einnahmen, Ruf und Beliebtheit */
export function hostEvent(s: SaveData, b: Business): string | null {
  const wait = eventReady(s, b.id);
  if (wait) return `Das Team braucht noch ${wait} ${wait === 1 ? 'Tag' : 'Tage'} Pause bis zur nächsten Veranstaltung.`;
  if (issueOf(s, b.id)) return 'Erst das Problem lösen, dann feiern.';
  const c = eventCost(b); if (s.money < c) return `Dafür fehlen dir ${c - s.money} €.`;
  s.money -= c; s.flags[k(b.id, 'ev')] = s.day; s.flags[k(b.id, 'evPay')] = Math.round(b.daily * 4 * popFactor(popOf(s, b.id)));
  setPop(s, b.id, popOf(s, b.id) + 20); s.rep += 2;
  return null;
}
export function fixIssue(s: SaveData, b: Business): string | null {
  if (!issueOf(s, b.id)) return 'Hier läuft alles rund.';
  const c = fixCost(b); if (s.money < c) return `Dafür fehlen dir ${c - s.money} €.`;
  s.money -= c; delete s.flags[k(b.id, 'issue')];
  return null;
}

/** Ein Tag vergeht in einem Geschäft: Gewinn, Kasse der Veranstaltung, Beliebtheit, vielleicht ein Problem.
    r = Zufallszahl 0 … 1 für diesen Tag. Liefert Gewinn und Meldungen. */
export function dayTick(s: SaveData, b: Business, r: number): { pay: number; notes: string[] } {
  const notes: string[] = [], st = staffOf(s, b.id);
  let pay = daily(s, b).net;
  const ev = num(s, k(b.id, 'evPay'));
  if (ev) { pay += ev; delete s.flags[k(b.id, 'evPay')]; notes.push(`${b.icon} ${SPECIAL[b.id]?.event || 'Veranstaltung'}: +${ev} € in der Kasse`); }
  // Beliebtheit pendelt sich ein: ohne Personal bei 60, mit Team bei 75, die Geschäftsführung hält sie zwischen 70 und 90
  const pop = popOf(s, b.id);
  if (st === 3 && pop < 70) setPop(s, b.id, pop + 2); else if (pop > [60, 75, 75, 90][st]) setPop(s, b.id, pop - (st ? 1 : 2));
  { const cp = clubFactor(s, b.id).pop; if (cp) setPop(s, b.id, popOf(s, b.id) + cp); }
  if (issueOf(s, b.id)) { if (st === 3) { delete s.flags[k(b.id, 'issue')]; notes.push(`${b.icon} ${b.name}: Die Geschäftsführung hat das Problem gelöst.`); } }
  else if (r < .1 && s.day - Number(s.flags['biz_' + b.id] || 0) >= 3) { const i = ISSUES[Math.floor(r * 10 * ISSUES.length) % ISSUES.length]; s.flags[k(b.id, 'issue')] = i.id; notes.push(`⚠️ ${b.name}: ${i.text} Bis das geklärt ist, kommt nur der halbe Umsatz.`); }
  return { pay, notes };
}
