/* Nachtclub führen wie im glamourösen Nachtleben-Krimi, nur queer und herzlich: Resident-DJ, Getränkepreise, Türpolitik,
   Deko-Thema, Awareness-Team und Themennächte zu echten Tagen der queeren Geschichte. Alles hier ist reine Logik
   (Spielstand in s.flags unter cl_<club>_…), das Aussehen im Club baut clubdeco.ts, die Menüs clubui.ts.
   Ohne Eingriff bleibt alles wie bisher: Faktor 1 auf den Tagesumsatz aus manage.ts. */
import type { SaveData } from '../engine/Save';
import type { Business } from './empire';
import { pcEvents } from './hooks';
import { hour } from './life';

/** Geschäfte, die als Nachtclub geführt werden (Business-ID) */
export const CLUBS = ['prisma', 'onelove', 'kaleido', 'komet', 'wolke'] as const;
export const isClub = (id: string) => (CLUBS as readonly string[]).includes(id);

export interface Dj { id: string; name: string; style: string; fee: number; hype: number; c1: number; c2: number; neon: string; line: string }
export const DJS: Dj[] = [
  { id: 'haus', name: 'Haus-Playlist', style: 'Pop vom Band', fee: 0, hype: 1, c1: 0xff3b8d, c2: 0x3bd1ff, neon: '#ff6ad5', line: 'Läuft. Aber niemand schreit „Noch eins!“.' },
  { id: 'pixel', name: 'DJ Pixel', style: 'Electro und Synthpop', fee: 60, hype: 1.12, c1: 0x5ce1ff, c2: 0x7b5cff, neon: '#5ce1ff', line: 'DJ Pixel bringt die Plattenkiste und die halbe Hafenszene mit.' },
  { id: 'saphira', name: 'DJ Saphira', style: 'Deep House', fee: 110, hype: 1.2, c1: 0x2f6bff, c2: 0x3ee6c8, neon: '#3ee6c8', line: 'Saphira spielt fünf Stunden am Stück. Keiner geht vor Sonnenaufgang.' },
  { id: 'disco', name: 'Mx. Disco', style: 'Disco und 80er', fee: 90, hype: 1.17, c1: 0xffd23b, c2: 0xff4fa3, neon: '#ffd23b', line: 'Mx. Disco legt Diva-Hymnen auf. Bei jedem Refrain singt der ganze Laden mit.' },
  { id: 'bass', name: 'Lady Bass', style: 'Techno', fee: 150, hype: 1.27, c1: 0xff2a2a, c2: 0x8a2be2, neon: '#ff3b3b', line: 'Lady Bass dreht auf. Der Boden vibriert, die Schlange reicht bis um die Ecke.' },
  { id: 'trude', name: 'Tante Trude', style: 'Schlager und ESC', fee: 70, hype: 1.14, c1: 0xff9a3b, c2: 0xff3bd1, neon: '#ff9a3b', line: 'Tante Trude spielt alle Siegerlieder seit 1956. Mit Punktevergabe.' },
  { id: 'vogue', name: 'DJ Vogue', style: 'Ballroom-Beats', fee: 130, hype: 1.24, c1: 0xffc83d, c2: 0xffffff, neon: '#ffc83d', line: 'DJ Vogue legt Ballroom-Beats auf. Duckwalks und Dips auf der ganzen Tanzfläche.' },
];
export const PRICES = [
  { name: 'Günstig', spend: .8, pop: 2, text: 'Drinks ab 3 €: voll, laut, beliebt' },
  { name: 'Normal', spend: 1, pop: 0, text: 'Drinks ab 5 €: der Klassiker' },
  { name: 'Gehoben', spend: 1.22, pop: -1, text: 'Drinks ab 8 €: Craft-Cocktails' },
  { name: 'Luxus', spend: 1.45, pop: -3, text: 'Drinks ab 14 €: Champagner und Glitzer im Glas' },
];
export const PRICE_DEFAULT = 1;
export const DOORS = [
  { id: 'offen', name: 'Offen für alle', guests: 1, spend: 1, rep: 0, text: 'Alle kommen rein, solange sie nett sind.' },
  { id: 'glitzer', name: 'Dresscode Glitzer', guests: .9, spend: 1.18, rep: .5, text: 'Ohne Glitzer kein Eintritt. Die Leute geben sich Mühe.' },
  { id: 'liste', name: 'Nur Gästeliste', guests: .72, spend: 1.42, rep: 1, text: 'Exklusiv: Stars, Drag-Royalty und die Szene.' },
];
export interface Deco { id: string; name: string; icon: string; cost: number; bonus: number; text: string }
export const DECOS: Deco[] = [
  { id: 'neon', name: 'Neon-Nacht', icon: '💡', cost: 600, bonus: .06, text: 'Neonröhren an allen Wänden, pink und türkis' },
  { id: 'disco', name: 'Discokugel-Glitzer', icon: '🪩', cost: 900, bonus: .08, text: 'Riesige Discokugel und Lichtkegel über der Tanzfläche' },
  { id: 'ballroom', name: 'Ballroom-Gold', icon: '👑', cost: 1300, bonus: .1, text: 'Goldener Kronleuchter und ein Laufsteg für die Kategorien' },
  { id: 'tropic', name: 'Tropical Pride', icon: '🌴', cost: 1100, bonus: .09, text: 'Pflanzen, Lichterketten und ein Hauch Gran Canaria' },
];
export const AWARE_COST = 25;   // je Abend

/** Themennächte zu echten Tagen der queeren Geschichte (Monat 1–12, Tag) */
export interface QEvent { id: string; m: number; d: number; name: string; night: string; fact: string; cost: number; pull: number; rep: number }
export const QEVENTS: QEvent[] = [
  { id: 'stonewall', m: 6, d: 28, name: 'Stonewall-Nacht', night: 'STONEWALL 1969', cost: 400, pull: 1.6, rep: 4,
    fact: 'Am 28. Juni 1969 wehrten sich Gäste des Stonewall Inn in New York gegen eine Polizeirazzia. Mit dabei: Marsha P. Johnson und Sylvia Rivera. Daraus wurde die Pride-Bewegung.' },
  { id: 'csd', m: 6, d: 30, name: 'CSD-Afterparty', night: 'CSD AFTERPARTY', cost: 350, pull: 1.55, rep: 3,
    fact: 'Der Christopher Street Day erinnert an Stonewall. Am 30. Juni 1979 zogen in Berlin die ersten Demonstrierenden durch die Stadt, im selben Jahr auch in Bremen.' },
  { id: 'idahobit', m: 5, d: 17, name: 'IDAHOBIT-Soli-Nacht', night: 'IDAHOBIT', cost: 250, pull: 1.35, rep: 3,
    fact: 'Am 17. Mai 1990 strich die Weltgesundheitsorganisation Homosexualität aus ihrer Liste der Krankheiten. Seitdem ist der 17. Mai der Tag gegen Homo-, Bi-, Inter- und Transfeindlichkeit.' },
  { id: 'tdov', m: 3, d: 31, name: 'Trans Visibility Ball', night: 'TRANS VISIBILITY', cost: 300, pull: 1.4, rep: 3,
    fact: 'Den Internationalen Tag der trans Sichtbarkeit am 31. März rief die US-Aktivistin Rachel Crandall-Crocker 2009 ins Leben.' },
  { id: 'comingout', m: 10, d: 11, name: 'Coming-out-Party', night: 'COMING OUT DAY', cost: 250, pull: 1.35, rep: 2,
    fact: 'Den Coming Out Day gibt es seit 1988, ein Jahr nach dem großen Marsch für Gleichberechtigung in Washington am 11. Oktober 1987.' },
  { id: 'bi', m: 9, d: 23, name: 'Bi-Pride-Nacht', night: 'BI VISIBILITY', cost: 220, pull: 1.3, rep: 2,
    fact: 'Der Tag der bisexuellen Sichtbarkeit am 23. September wird seit 1999 gefeiert. Die Bi-Flagge in Pink, Lila und Blau entwarf Michael Page 1998.' },
  { id: 'lesbisch', m: 4, d: 26, name: 'Lesbian Visibility Night', night: 'LESBIAN VISIBILITY', cost: 220, pull: 1.3, rep: 2,
    fact: 'Am 26. April ist der Tag der lesbischen Sichtbarkeit, gefeiert seit 2008.' },
  { id: 'intersex', m: 10, d: 26, name: 'Intersex-Solinacht', night: 'INTERSEX AWARENESS', cost: 200, pull: 1.25, rep: 3,
    fact: 'Am 26. Oktober 1996 demonstrierten intergeschlechtliche Menschen in Boston, der erste öffentliche Protest dieser Art. Daraus wurde der Intersex Awareness Day.' },
  { id: 'ehe', m: 10, d: 1, name: 'Ehe-für-alle-Gala', night: 'EHE FÜR ALLE', cost: 380, pull: 1.45, rep: 3,
    fact: 'Am 30. Juni 2017 beschloss der Bundestag die Ehe für alle, am 1. Oktober 2017 trat sie in Kraft.' },
  { id: 'p175', m: 6, d: 11, name: 'Nacht der Freiheit', night: 'WEG MIT §175', cost: 260, pull: 1.3, rep: 3,
    fact: 'Am 11. Juni 1994 fiel in Deutschland der Paragraf 175 endgültig weg, der Sex zwischen Männern über hundert Jahre lang bestraft hatte.' },
  { id: 'hirschfeld', m: 7, d: 6, name: 'Hirschfeld-Salon', night: 'INSTITUT 1919', cost: 240, pull: 1.25, rep: 3,
    fact: 'Am 6. Juli 1919 eröffnete Magnus Hirschfeld in Berlin das Institut für Sexualwissenschaft, eines der ersten Zentren für queere Menschen weltweit. 1933 wurde es von den Nazis geplündert.' },
  { id: 'tdor', m: 11, d: 20, name: 'Gedenkabend mit Kerzen', night: 'TRANS DAY OF REMEMBRANCE', cost: 150, pull: 1.15, rep: 4,
    fact: 'Am 20. November erinnert der Trans Day of Remembrance an trans Menschen, die durch Gewalt gestorben sind. Gwendolyn Ann Smith begann ihn 1999 im Gedenken an Rita Hester. Ein leiser Abend: Kerzen, Namen, Umarmungen.' },
  { id: 'aids', m: 12, d: 1, name: 'Benefiz zum Welt-Aids-Tag', night: 'WELT-AIDS-TAG', cost: 200, pull: 1.3, rep: 4,
    fact: 'Den Welt-Aids-Tag am 1. Dezember gibt es seit 1988. Heute weiß man: Wer HIV hat und gut behandelt wird, kann es nicht weitergeben (U=U). Der Erlös geht an die Aidshilfe.' },
  { id: 'sbgg', m: 11, d: 1, name: 'Selbstbestimmungs-Party', night: 'SELBST BESTIMMT', cost: 260, pull: 1.3, rep: 3,
    fact: 'Am 1. November 2024 trat in Deutschland das Selbstbestimmungsgesetz in Kraft. Seitdem können trans, inter und nichtbinäre Menschen ihren Geschlechtseintrag beim Standesamt ändern.' },
];
/** Echter Jahrestag in der Nähe (±3 Tage vom heutigen Datum des Geräts)? */
export function anniversary(e: QEvent, now = new Date()) {
  for (const y of [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1]) {
    const d = Math.abs(new Date(y, e.m - 1, e.d).getTime() - now.getTime()) / 864e5;
    if (d <= 3.5) return true;
  }
  return false;
}
/** Nächste echte Jahrestage ab heute (für den Kalender im Menü) */
export function upcoming(now = new Date(), n = 3) {
  const t = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return QEVENTS.map((e) => { let d = new Date(now.getFullYear(), e.m - 1, e.d).getTime(); if (d < t - 3 * 864e5) d = new Date(now.getFullYear() + 1, e.m - 1, e.d).getTime(); return { e, days: Math.round((d - t) / 864e5) }; })
    .sort((a, b) => a.days - b.days).slice(0, n);
}

const k = (c: string, f: string) => `cl_${c}_${f}`;
const num = (s: SaveData, key: string, d = 0) => { const v = s.flags[key]; return v === undefined ? d : Number(v); };
export interface ClubState { dj: Dj; price: number; door: number; deco: string; decos: string[]; aware: boolean }
export function clubOf(s: SaveData, id: string): ClubState {
  const dj = DJS.find((d) => d.id === s.flags[k(id, 'dj')]) || DJS[0];
  const decos = String(s.flags[k(id, 'decos')] || '').split(',').filter(Boolean);
  const deco = String(s.flags[k(id, 'deco')] || '');
  return { dj, price: Math.max(0, Math.min(PRICES.length - 1, num(s, k(id, 'price'), PRICE_DEFAULT))), door: Math.max(0, Math.min(DOORS.length - 1, num(s, k(id, 'door')))), deco: decos.includes(deco) ? deco : '', decos, aware: !!s.flags[k(id, 'aware')] };
}
const changed = (s: SaveData, id: string, what: string) => pcEvents.emit('clubGeaendert', { id, what, state: clubOf(s, id) });
export function setDj(s: SaveData, id: string, dj: string) { s.flags[k(id, 'dj')] = dj; changed(s, id, 'dj'); }
export function setPrice(s: SaveData, id: string, p: number) { s.flags[k(id, 'price')] = Math.max(0, Math.min(PRICES.length - 1, p)); changed(s, id, 'price'); }
export function setDoor(s: SaveData, id: string, d: number) { s.flags[k(id, 'door')] = Math.max(0, Math.min(DOORS.length - 1, d)); changed(s, id, 'door'); }
export function setAware(s: SaveData, id: string, on: boolean) { if (on) s.flags[k(id, 'aware')] = true; else delete s.flags[k(id, 'aware')]; changed(s, id, 'aware'); }
/** Deko kaufen (einmalig) oder eine gekaufte aufhängen; '' = keine */
export function setDeco(s: SaveData, id: string, deco: string): string | null {
  const st = clubOf(s, id);
  if (deco && !st.decos.includes(deco)) {
    const d = DECOS.find((x) => x.id === deco); if (!d) return 'Gibt es nicht.';
    if (s.money < d.cost) return `Dafür fehlen dir ${d.cost - s.money} €.`;
    s.money -= d.cost; s.flags[k(id, 'decos')] = [...st.decos, deco].join(',');
  }
  s.flags[k(id, 'deco')] = deco; changed(s, id, 'deco');
  return null;
}

/** Faktor auf den Tagesumsatz und Kosten des Abends (DJ-Gage, Awareness-Team) */
export function clubFactor(s: SaveData, id: string) {
  if (!isClub(id)) return { mult: 1, cost: 0, pop: 0 };
  const st = clubOf(s, id), p = PRICES[st.price], d = DOORS[st.door], deco = DECOS.find((x) => x.id === st.deco);
  const mult = st.dj.hype * p.spend * d.guests * d.spend * (1 + (deco?.bonus || 0)) * (st.aware ? 1.04 : 1);
  return { mult, cost: st.dj.fee + (st.aware ? AWARE_COST : 0), pop: p.pop + (st.aware ? 2 : 0) + (st.dj.hype > 1.15 ? 1 : 0) - (st.door === 2 ? 1 : 0) };
}

/* ---------- Clubnacht live: drei Entscheidungen, dann die Abrechnung ---------- */
export interface Choice { label: string; sub: string; mood: number; cost?: number; rep?: number }
export interface Moment { who: string; text: string; choices: Choice[] }
export const MOMENTS: Moment[] = [
  { who: 'Türsteherin Kim', text: 'Die Schlange geht bis zur Ecke, und es fängt an zu nieseln. Was machen wir?', choices: [
    { label: 'Schneller reinlassen', sub: 'mehr Gäste, etwas mehr Trubel', mood: 6 },
    { label: 'Warme Getränke an die Schlange', sub: '−60 € · alle lieben dich', mood: 10, cost: 60, rep: 1 },
    { label: 'Alles wie immer', sub: 'ruhig bleiben', mood: 2 }] },
  { who: 'Awareness-Team', text: 'Ein Gast fühlt sich von einem anderen bedrängt.', choices: [
    { label: 'Ruhig dazwischengehen', sub: 'den Gast begleiten, den anderen rausbitten', mood: 8, rep: 1 },
    { label: 'Ein Taxi auf Kosten des Hauses', sub: '−30 € · sicher nach Hause', mood: 9, cost: 30, rep: 1 },
    { label: 'Weggucken', sub: 'keine gute Idee', mood: -12, rep: -1 }] },
  { who: 'Am DJ-Pult', text: 'Die Tanzfläche kocht. Mehr Bass oder jetzt die große Diva-Hymne?', choices: [
    { label: 'Mehr Bass!', sub: 'der Boden bebt', mood: 7 },
    { label: 'Die Diva-Hymne', sub: 'alle singen mit', mood: 9 },
    { label: 'Kurze Pause', sub: 'Wasser für alle', mood: 3 }] },
  { who: 'Barchef Rocco', text: 'Uns geht das Eis aus, und es ist erst eins.', choices: [
    { label: 'Eis beim Späti holen lassen', sub: '−40 € · weiter geht’s', mood: 6, cost: 40 },
    { label: 'Drinks ohne Eis, dafür Glitzer', sub: 'Improvisation', mood: 3 },
    { label: 'Bar früher schließen', sub: 'weniger Umsatz', mood: -6 }] },
  { who: 'Drag-Queen Cherry', text: 'Darling, ich könnte spontan eine Nummer auf dem Tresen machen. Für die Gäste?', choices: [
    { label: 'Bühne frei!', sub: '−50 € Gage · Showtime', mood: 12, cost: 50, rep: 1 },
    { label: 'Lieber nächstes Mal', sub: 'die Nacht läuft auch so', mood: 1 }] },
  { who: 'Nachbar Herr Ludwig', text: 'Es ist laut! Ich kann nicht schlafen!', choices: [
    { label: 'Einladen auf einen Drink', sub: 'vielleicht tanzt er ja mit', mood: 5, rep: 1 },
    { label: 'Fenster zu, Bass etwas runter', sub: 'Kompromiss', mood: 2 },
    { label: 'Ignorieren', sub: 'Ärger mit dem Amt droht', mood: -3, rep: -1 }] },
];
/** Drei Momente für die Nacht, je Tag fest */
export function momentsFor(day: number, id: string) {
  let h = day * 2654435761; for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const idx = MOMENTS.map((_, i) => i).sort((a, b) => ((Math.imul(h ^ a, 2246822519) >>> 0) % 997) - ((Math.imul(h ^ b, 2246822519) >>> 0) % 997));
  return idx.slice(0, 3).map((i) => MOMENTS[i]);
}
/** Eine Nacht gehört zum Abend davor: nach Mitternacht zählt noch der Vortag */
const nightKey = (s: SaveData) => hour(s) >= 12 ? s.day : s.day - 1;
export const nightDone = (s: SaveData, id: string) => s.flags[k(id, 'night')] === nightKey(s);
export const nightOpen = (h: number) => h >= 20 || h < 4;
export interface NightResult { guests: number; revenue: number; cost: number; rep: number; mood: number; event?: QEvent; anniv: boolean; lines: string[] }
/** Eine Clubnacht abrechnen. pop = Beliebtheit (0–100), base = Grundertrag am Tag, mood = Summe der Entscheidungen */
export function runNight(s: SaveData, b: Business, pop: number, mood: number, ev?: QEvent, now = new Date()): NightResult {
  const st = clubOf(s, b.id), f = clubFactor(s, b.id), d = DOORS[st.door], anniv = !!ev && anniversary(ev, now);
  const pull = (ev ? ev.pull * (anniv ? 1.35 : 1) : 1), m = Math.max(-30, Math.min(40, mood));
  const guests = Math.max(20, Math.round((60 + pop * 2.4 + b.daily * .35) * st.dj.hype * d.guests * pull * (1 + m / 200)));
  const revenue = Math.round(guests * 2.2 * PRICES[st.price].spend * d.spend * (1 + (DECOS.find((x) => x.id === st.deco)?.bonus || 0)) * (1 + m / 150));
  const cost = f.cost + (ev?.cost || 0);
  const rep = Math.max(0, Math.round(1 + d.rep + (ev?.rep || 0) * (anniv ? 1.5 : 1) + (m >= 20 ? 1 : 0) + (st.aware ? 1 : 0)));
  const lines = [st.dj.line];
  if (ev) lines.push(`${ev.name}${anniv ? ' – genau zum echten Jahrestag, die Presse ist da' : ''}. ${ev.fact}`);
  if (st.aware) lines.push('Das Awareness-Team war die ganze Nacht ansprechbar. Alle haben sich sicher gefühlt.');
  lines.push(m >= 20 ? 'Stimmung: legendär. Die Nacht ist morgen Stadtgespräch.' : m >= 5 ? 'Stimmung: richtig gut.' : m >= -5 ? 'Stimmung: ganz okay.' : 'Stimmung: durchwachsen. Nächstes Mal wird’s besser.');
  return { guests, revenue, cost, rep, mood: m, event: ev, anniv, lines };
}
/** Abrechnung buchen: Geld, Ruf, Beliebtheit, Merker für heute */
export function bookNight(s: SaveData, b: Business, r: NightResult, setPop: (v: number) => void, pop: number) {
  s.money += r.revenue - r.cost; s.rep += r.rep; s.flags[k(b.id, 'night')] = nightKey(s);
  s.flags[k(b.id, 'nights')] = num(s, k(b.id, 'nights')) + 1;
  s.flags[k(b.id, 'best')] = Math.max(num(s, k(b.id, 'best')), r.guests);
  setPop(pop + Math.round(6 + r.mood / 4 + (r.event ? 6 : 0)));
  pcEvents.emit('clubNacht', { id: b.id, name: b.name, guests: r.guests, revenue: r.revenue, cost: r.cost, rep: r.rep, event: r.event?.id || '' });
}
export const nightsOf = (s: SaveData, id: string) => num(s, k(id, 'nights'));
export const bestOf = (s: SaveData, id: string) => num(s, k(id, 'best'));
