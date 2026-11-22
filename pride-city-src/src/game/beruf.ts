/* Berufe: Jede Figur in Pride City hat einen Beruf – feste Figuren (Mo, Rex, Hilde …), Leute auf der Straße, Gäste in
   Häusern und Clubs und du selbst. Fremde bekommen ihren Beruf fest aus ihrem Schlüssel (gleiche Person = gleicher Beruf),
   Dienstkleidung verrät ihn (Polizei, Feuerwehr …). Beim Ansprechen steht er neben dem Namen, „Was machst du beruflich?“
   erzählt davon. Die Jobbörse im Handy führt alle Karrieren zusammen, die es schon gibt (Schichtjobs, Barkeeper, Drag,
   Pride FM, Clubs), plus „Erwachsenen-Darsteller*in“ (nur 18+, dreh.ts). Dein Hauptberuf bringt +20 % Lohn. */
import type { SaveData } from '../engine/Save';
import { hash } from './flirt';
import { avatar } from './avatars';
import { JOBS, level, title as jobTitle, wage } from './jobs';

export interface Beruf { id: string; name: string; icon: string; talk: string; adult?: boolean }

/** Berufe der Leute in der Stadt (jugendfrei) */
export const BERUFE: Beruf[] = [
  { id: 'pflege', name: 'Pflegekraft', icon: '🩺', talk: 'Ich bin Pflegekraft auf der Intensivstation. Zwölf-Stunden-Schichten, aber jedes Lächeln beim Entlassen ist es wert.' },
  { id: 'lehrer', name: 'Lehrer*in', icon: '📚', talk: 'Ich unterrichte Bio und Sport. Seit ich offen queer bin, kommen Kids zu mir, die sonst mit niemandem reden.' },
  { id: 'baecker', name: 'Bäcker*in', icon: '🥐', talk: 'Bäckerei an der Ecke, Schicht ab drei Uhr morgens. Die Regenbogen-Croissants zur Pride waren meine Idee.' },
  { id: 'friseur', name: 'Friseur*in', icon: '💇', talk: 'Ich hab einen Salon in der Altstadt. Undercut, Pastell, Glatze mit Glitzer – alles geht.' },
  { id: 'it', name: 'Softwareentwickler*in', icon: '💻', talk: 'Ich programmiere Apps. Gerade baue ich eine, die queere Safe Spaces in der Stadt anzeigt.' },
  { id: 'anwalt', name: 'Anwält*in', icon: '⚖️', talk: 'Familienrecht. Ich helfe Regenbogenfamilien bei Adoption und Abstammung. Da gibt es noch viel zu tun.' },
  { id: 'koch', name: 'Koch/Köchin', icon: '👨‍🍳', talk: 'Ich koche im Bistro am Hafen. Mein Rote-Bete-Risotto ist pink und legendär.' },
  { id: 'kellner', name: 'Kellner*in', icon: '🍽️', talk: 'Ich kellnere im Café Kaffeeklatsch. Ich weiß von allen, wer mit wem – aber ich sag nichts.' },
  { id: 'tattoo', name: 'Tätowierer*in', icon: '🖋️', talk: 'Ich steche Tattoos. Am liebsten Flaggen, die erst auf den zweiten Blick eine sind.' },
  { id: 'student', name: 'Student*in', icon: '🎓', talk: 'Ich studiere Gender Studies und Informatik. Ja, beides. Nein, das ist kein Widerspruch.' },
  { id: 'architekt', name: 'Architekt*in', icon: '📐', talk: 'Ich plane gerade ein Wohnprojekt für queere Senior*innen. Hilde will unbedingt das Eckzimmer.' },
  { id: 'gaertner', name: 'Gärtner*in', icon: '🌱', talk: 'Ich pflege den Regenbogenpark. Die Beete in Flaggenfarben pflanze ich jedes Frühjahr neu.' },
  { id: 'busfahrer', name: 'Tramfahrer*in', icon: '🚋', talk: 'Ich fahre die Tram durch Rainbow City. Nachtschicht am Wochenende ist wie eine fahrende Party.' },
  { id: 'tierarzt', name: 'Tierärzt*in', icon: '🐾', talk: 'Ich bin Tierärzt*in beim Tierheim Pfötchenglück. Die Hälfte der Hunde dort ist besser angezogen als ich.' },
  { id: 'journalist', name: 'Journalist*in', icon: '📰', talk: 'Ich schreibe für ein queeres Stadtmagazin. Wenn du eine Geschichte hast, erzähl sie mir.' },
  { id: 'musiker', name: 'Musiker*in', icon: '🎸', talk: 'Ich spiele Bass in einer Band. Unser letztes Album heißt „Glitzer im Getriebe“.' },
  { id: 'sozial', name: 'Sozialarbeiter*in', icon: '🤝', talk: 'Ich arbeite im Regenbogenhaus mit jungen Leuten, die zu Hause rausgeflogen sind. Jeder Tag zählt.' },
  { id: 'piloten', name: 'Flugbegleiter*in', icon: '✈️', talk: 'Ich bin Flugbegleiter*in. Gestern Lissabon, heute Rainbow City, morgen Kapstadt.' },
  { id: 'apotheke', name: 'Apotheker*in', icon: '💊', talk: 'Ich arbeite in der Apotheke am Platz. PrEP-Rezepte gehen bei uns ohne komische Blicke über den Tresen.' },
  { id: 'fitness', name: 'Personal Trainer*in', icon: '🏋️', talk: 'Ich trainiere Leute in der Muckibude. Rücken gerade, Krone richten, weiter geht\'s.' },
  { id: 'kuenstler', name: 'Künstler*in', icon: '🎨', talk: 'Ich male Wandbilder. Das große Regenbogen-Mural am Hafen ist von mir.' },
  { id: 'make', name: 'Visagist*in', icon: '💄', talk: 'Ich schminke Drag-Queens und Brautpaare. Manchmal am selben Tag.' },
  { id: 'rentner', name: 'Rentner*in', icon: '☕', talk: 'Ich bin in Rente. Endlich Zeit für Demos, Enkel und Tanzabende.' },
  { id: 'barista', name: 'Barista', icon: '☕', talk: 'Ich mache Kaffee mit Latte-Art. Mein Meisterstück: ein Einhorn im Milchschaum.' },
];
/** Berufe, die nur mit „Inhalte ab 18“ vorkommen – selbstbestimmt und mit Humor erzählt */
export const BERUFE_18: Beruf[] = [
  { id: 'gogo', name: 'Go-go-Tänzer*in', icon: '🕺', adult: true, talk: 'Ich tanze freitags auf dem Podest im Prisma. Trinkgeld im Hosenbund, Blicke gratis.' },
  { id: 'escort', name: 'Escort', icon: '💋', adult: true, talk: 'Ich bin Escort. Selbstständig, angemeldet, mit eigenen Regeln. Und nein, ich verrate keine Namen.' },
  { id: 'darsteller', name: 'Erwachsenen-Darsteller*in', icon: '🎬', adult: true, talk: 'Ich drehe Filme für Erwachsene. Tests alle zwei Wochen, Absprachen vor jeder Szene – professioneller als manches Büro.' },
  { id: 'cam', name: 'Cam-Model', icon: '📹', adult: true, talk: 'Ich streame abends von zu Hause. Ringlicht an, Grenzen klar, die Fans zahlen gut.' },
  { id: 'burlesque', name: 'Burlesque-Künstler*in', icon: '🪶', adult: true, talk: 'Burlesque im One Love. Federn, Handschuhe, ganz viel Andeutung – mehr braucht es nicht.' },
  { id: 'toys', name: 'Toy-Verkäufer*in', icon: '🍆', adult: true, talk: 'Ich berate im Hinterzimmer der Boutique. Größentabellen sind mein Spezialgebiet. 😏' },
];

/** Berufe aus der Dienstkleidung der Rocketbox-Figuren */
const UNIFORM: Record<string, Beruf> = {
  police: { id: 'polizei', name: 'Polizist*in', icon: '👮', talk: 'Ich fahre Streife in der Innenstadt. Und ja, ich bin auch Ansprechperson für queere Menschen – sprich mich an, wenn was ist.' },
  fire: { id: 'feuerwehr', name: 'Feuerwehr', icon: '🚒', talk: 'Feuerwache Regenbogen. Katzen vom Baum, Brände löschen, einmal im Jahr der Pride-Kalender.' },
  medical: { id: 'sani', name: 'Sanitäter*in', icon: '🚑', talk: 'Ich fahre Rettungswagen. Auf der Parade versorge ich Blasen, Sonnenbrand und gebrochene Herzen.' },
  security: { id: 'tuer', name: 'Türsteher*in', icon: '🛡️', talk: 'Ich stehe an der Tür vom Prisma. Wer respektvoll ist, kommt rein. Wer nicht, lernt mich kennen.' },
  chef: { id: 'koechin', name: 'Köchin', icon: '👩‍🍳', talk: 'Ich koche im Café Kaffeeklatsch. Der Käsekuchen ist ein Familienrezept, mehr sag ich nicht.' },
  delivery: { id: 'kurier', name: 'Kurier*in', icon: '🚲', talk: 'Ich liefere Pakete. Ich kenne jedes Treppenhaus und jeden Hund in Rainbow City.' },
  business: { id: 'manager', name: 'Manager*in', icon: '💼', talk: 'Ich leite ein Start-up. Diversity steht bei uns nicht nur im Leitbild.' },
  kid: { id: 'schule', name: 'Schüler*in', icon: '🎒', talk: 'Ich geh in die sechste Klasse. Mathe ist doof, aber Kunst ist toll!' },
};
/** Berufe der festen Figuren aus der Geschichte */
export const NPC_BERUF: Record<string, [string, string]> = {
  mo: ['☕', 'Café-Besitzerin'], jules: ['📣', 'Aktivist*in'], nova: ['🎧', 'DJ'], rex: ['🪩', 'Clubbetreiber'], bruno: ['🍺', 'Späti-Inhaber'],
  lena: ['🖊️', 'Grafikdesignerin'], tariq: ['🥙', 'Imbisskoch'], hilde: ['🌈', 'Zeitzeugin, im Ruhestand'], sam: ['🏳️‍⚧️', 'Peer-Berater im Regenbogenhaus'],
  leon: ['🎤', 'Sänger (Lady Luma)'], finn: ['🗼', 'Leuchtturmwärter'], ben: ['⚓', 'Bootsbauer'], lotte: ['🏖️', 'Strandbar-Chefin'], pia: ['🩺', 'Ärztin'],
  joerg: ['🏢', 'Bauunternehmer'], anke: ['📚', 'Bibliothekarin'], samira: ['📷', 'Fotografin'], tobi: ['🎣', 'Fischer'], kim: ['🧪', 'Beraterin im Checkpoint'],
};

/** Beruf einer fremden Person: Uniform zuerst, sonst fest aus dem Schlüssel; Sexarbeit, wenn das Spiel es so sagt */
export function berufOf(key: string, rb: string | undefined, adult: boolean, kind?: string): Beruf {
  if (kind === 'worker' || kind === 'curb') return { id: 'sexarbeit', name: 'Sexarbeiter*in', icon: '🏮', adult: true, talk: 'Sexarbeit ist Arbeit. Ich bin angemeldet, entscheide selbst und habe klare Regeln. Respekt kostet nichts.' };
  const job = rb ? avatar(rb)?.job : undefined;
  if (job && UNIFORM[job]) return UNIFORM[job];
  const h = hash('beruf:' + key), pool = adult && h % 7 === 0 ? BERUFE_18 : BERUFE;
  return pool[(h >>> 3) % pool.length];
}

/* ---------- Karrieren für dich (Jobbörse) ---------- */
export interface Karriere {
  id: string; name: string; icon: string; place: string; text: string; adult?: boolean;
  /** Ort zum Markieren auf der Karte */ poi?: string; /** Handy-App, die direkt aufgeht */ app?: string;
}
/** Alle Karrieren: die Schichtjobs aus jobs.ts und die Laufbahnen, die es schon gibt – nichts doppelt gebaut */
export const KARRIEREN: Karriere[] = [
  ...JOBS.map((j): Karriere => ({ id: j.id, name: j.name, icon: '💼', place: j.place, poi: j.poi, text: `Schichten von ${j.from} bis ${j.to} Uhr, drei Situationen pro Schicht, Beförderung mit Erfahrung.` })),
  { id: 'bar', name: 'Barkeeper*in', icon: '🍸', place: 'Club Leuchtturm am Hafen', poi: 'bar', text: 'Cocktails mixen gegen die Uhr (Barkeeper-Minispiel). Trinkgeld je nach Tempo.' },
  { id: 'drag', name: 'Drag-Queen', icon: '👑', place: 'One Love Bar', poi: 'onelove', text: 'Look am Schminkspiegel bauen, fünf Queens im Lip-Sync schlagen, Krone von Rainbow City holen.' },
  { id: 'radio', name: 'Radiomoderator*in', icon: '📻', place: 'Pride FM 88,8', app: 'fm', text: 'Eigene Sendung „Rainbow Talk“ moderieren, Grüße vorlesen, Wissen um halb.' },
  { id: 'unternehmer', name: 'Club- und Ladenbesitzer*in', icon: '🏙️', place: 'Imperium', app: 'empire', text: 'Läden, Bars und Clubs kaufen, Personal und Events planen, jeden Morgen Einnahmen.' },
  { id: 'dreh', name: 'Erwachsenen-Darsteller*in', icon: '🎬', place: 'Studio Klappe Auf · Nachtschicht', poi: 'studio', adult: true, text: 'Casting, Tests, Absprachen am Set, Regie, Dreh mit Abblende. Fans und Gagen steigen mit jeder Szene.' },
];
export const karriere = (id: string) => KARRIEREN.find((k) => k.id === id);
export const karrieren = (s: SaveData) => KARRIEREN.filter((k) => !k.adult || s.settings.adult);
/** Dein Hauptberuf (oder null) */
export function meinBeruf(s: SaveData): Karriere | null { const k = karriere(String(s.flags.beruf || '')); return k && (!k.adult || s.settings.adult) ? k : null; }
/** Hauptberuf annehmen (oder mit null kündigen); liefert die alte Karriere */
export function annehmen(s: SaveData, id: string | null) {
  const old = meinBeruf(s);
  if (id) { s.flags.beruf = id; s.flags.berufSeit = s.day; s.flags.berufe = (Number(s.flags.berufe) || 0) + 1; } else { delete s.flags.beruf; delete s.flags.berufSeit; }
  return old;
}
/** Lohn-Aufschlag für den Hauptberuf */
export const HAUPT_BONUS = 1.2;
export function bonus(s: SaveData, id: string) { return s.flags.beruf === id ? HAUPT_BONUS : 1; }
/** Stand einer Karriere für die Jobbörse */
export function stand(s: SaveData, k: Karriere): string {
  const j = JOBS.find((x) => x.id === k.id);
  if (j) return `${jobTitle(s, j)} · ${Math.round(wage(s, j) * bonus(s, j.id))} €/h · Stufe ${level(s, j.id) + 1}`;
  const f = s.flags;
  switch (k.id) {
    case 'bar': return s.best.bar ? `Rekord ${s.best.bar} Drinks` : 'noch keine Schicht';
    case 'drag': return f.dragKrone ? '👑 Krone von Rainbow City' : f.dragWins ? `${f.dragWins} von 5 Queens geschlagen` : 'noch kein Battle';
    case 'radio': return f.radioShows ? `${f.radioShows} Sendungen` : 'noch keine Sendung';
    case 'unternehmer': return 'Läden, Bars, Clubs';
    case 'dreh': return f.drehN ? `${DREH_STUFEN[drehStufe(s)]} · ${f.drehN} Szenen · ${Number(f.drehFans) || 0} Fans` : 'Casting offen';
  }
  return '';
}
/** Stellenanzeigen der Leute in der Stadt: Abwechslung im Feed der Jobbörse */
export const ANZEIGEN = [
  'Café Kaffeeklatsch sucht Barista mit Herz und Hafermilch-Erfahrung.',
  'Regenbogenhaus: Ehrenamtliche für die Jugendgruppe gesucht. Kekse inklusive.',
  'Muckibude Muskelkater: Trainer*in für den Kurs „Bauch, Beine, Pride“.',
  'Club Prisma: Garderobe Freitag und Samstag. Glitzer an der Kleidung ist kein Mangel.',
  'Tierheim Pfötchenglück: Gassigeher*innen am Wochenende.',
  'Pride FM 88,8 sucht Stimmen für den Rainbow Talk.',
  'Studio Klappe Auf: Models für die neue Pride-Plakatkampagne.',
];

/* ---------- Erwachsenen-Darsteller*in (Stand, für dreh.ts und Jobbörse) ---------- */
export const DREH_STUFEN = ['Newcomer', 'Darsteller*in', 'Publikumsliebling', 'Star', 'Legende'];
export function drehStufe(s: SaveData) { const n = Number(s.flags.drehFans) || 0; return n >= 20000 ? 4 : n >= 8000 ? 3 : n >= 3000 ? 2 : n >= 800 ? 1 : 0; }
