/* Beziehungen, Dating, Gesundheit, Feed und Glossar (Durchgang 3).
   Alle Figuren sind erwachsen und frei erfunden. Zustimmung ist immer Pflicht, ein Nein wird respektiert.
   Inhalte ab 18 (Vorlieben, angedeutete Nächte, Toys) erscheinen nur mit settings.adult; Gesundheit ist immer sichtbar. */
import type { SaveData } from '../engine/Save';

export interface Profile {
  id: string; name: string; age: number; pron: string; color: string; body: string; palette: string; skin: number;
  bio: string; likes: string; at: 'cafe' | 'club';
  /** nur mit 18+ sichtbar */ role: string; into: string;
}

export const PROFILES: Profile[] = [
  { id: 'kai', skin: 2, name: 'Kai', age: 29, pron: 'er', color: '#ff7a59', body: 'Man', palette: 'bear', at: 'club',
    bio: 'Bär mit weichem Kern. Koche gern für zu viele Leute.', likes: 'Brunch, Techno, Hunde', role: 'Vers', into: 'Kuscheln, lange Nächte, Massagen' },
  { id: 'luca', skin: 0, name: 'Luca', age: 24, pron: 'er', color: '#5ce1ff', body: 'Man2', palette: 'neon', at: 'club',
    bio: 'Tänzer, Nachtmensch, Sternzeichen: Glitzer.', likes: 'Voguing, Pop, Späti-Nächte', role: 'Bottom', into: 'Tanzen bis zum Morgen, Flirten mit Blicken' },
  { id: 'malik', skin: 4, name: 'Malik', age: 34, pron: 'er', color: '#b56bff', body: 'Man', palette: 'leather', at: 'cafe',
    bio: 'Krankenpfleger. Leder am Wochenende, Strickjacke unter der Woche.', likes: 'Motorräder, Krimis, guter Kaffee', role: 'Top', into: 'Leder, klare Absprachen, Respekt' },
  { id: 'robin', skin: 1, name: 'Robin', age: 27, pron: 'they', color: '#ffd23b', body: 'Hero', palette: 'nonbinary', at: 'cafe',
    bio: 'Illustrator*in, zeichnet Leute in der Tram.', likes: 'Comics, Pflanzen, Karaoke', role: 'Switch', into: 'Spielerisches, Rollenspiele, viel Lachen' },
  { id: 'ella', skin: 3, name: 'Ella', age: 31, pron: 'sie', color: '#ff6ad5', body: 'Woman', palette: 'lesbian', at: 'cafe',
    bio: 'Gärtnerin mit Hang zu Drama – auf der Bühne.', likes: 'Theater, Wandern, Katzen', role: 'Femme', into: 'Romantik, Kerzen, langsames Kennenlernen' },
  { id: 'jonas', skin: 1, name: 'Jonas', age: 42, pron: 'er', color: '#3ee69a', body: 'Man2', palette: 'gay', at: 'cafe',
    bio: 'Frisch geschieden, frisch geoutet. Lerne gerade alles neu.', likes: 'Joggen, Jazz, Kochkurse', role: 'Side', into: 'Nähe ohne Eile, Händchenhalten, Neues entdecken' },
];
export const profile = (id: string) => PROFILES.find((p) => p.id === id);
/** Fotos im Profil: angezogen und locker; mit 18+ zusätzlich sexy Pose (oberkörperfrei) und Unterwäsche */
export function profileShots(p: Profile, adult: boolean) {
  const look = (outfit: 'clothed' | 'shirtless' | 'underwear') => ({ body: p.body, palette: p.palette, skin: p.skin, outfit, top: p.pron !== 'er' });
  const out = [{ look: look('clothed'), clip: 'idle', t: .4, bg: p.color, close: true, label: 'Profilbild' }];
  if (adult) out.push({ look: look('shirtless'), clip: 'pose', t: .35, bg: p.color, close: false, label: 'Sexy Pose' }, { look: look('underwear'), clip: 'idle', t: 1.2, bg: p.color, close: false, label: 'Unterwäsche' });
  else out.push({ look: look('clothed'), clip: 'cheer', t: .5, bg: p.color, close: false, label: 'Gute Laune' });
  return out;
}

/* ---------- Dates ---------- */
export const DATE_STAGE = ['Match', 'Erstes Date', 'Verliebt', 'Zusammen'];
export function dateRec(s: SaveData, id: string) { return (s.dates[id] ||= { st: 0, last: 0, plan: 0, at: '' }); }
/** Fragen für ein Date: jede Antwort mit Punkten (0–2). Zwei Treffer = gutes Date. */
export const DATE_Q: Array<[string, Array<[string, number]>]> = [
  ['Worüber wollt ihr reden?', [['Nach den Lieblingsorten in der Stadt fragen', 2], ['Nur von dir erzählen', 0], ['Übers Wetter', 1]]],
  ['Der Kaffee kippt um – auf deine Hose.', [['Lachen und es mit Humor nehmen', 2], ['Genervt aufstehen', 0], ['So tun, als wäre nichts', 1]]],
  ['Dein Date erzählt von einem schwierigen Coming-out.', [['Zuhören und nachfragen', 2], ['Schnell das Thema wechseln', 0], ['Eigene Geschichte danebenlegen', 1]]],
  ['Wie soll der Abend weitergehen?', [['Fragen, worauf ihr beide Lust habt', 2], ['Einfach bestimmen', 0], ['Abwarten', 1]]],
];
export function dateQuestions(s: SaveData, id: string) {
  const r = dateRec(s, id), k = (s.day + r.st + id.length) % DATE_Q.length;
  return [DATE_Q[k], DATE_Q[(k + 1) % DATE_Q.length], DATE_Q[(k + 3) % DATE_Q.length]];
}
/** Date abrechnen: Punkte 0..6 → Stufe steigt ab 4 Punkten */
export function finishDate(s: SaveData, id: string, pts: number) {
  const r = dateRec(s, id); r.last = s.day; r.plan = 0;
  const up = pts >= 4 && r.st < 3;
  if (up) r.st++;
  return { up, stage: DATE_STAGE[r.st] };
}
/** Zusammen die Nacht verbringen (nur 18+): Zustimmung beider und Kondom nötig */
export function canStay(s: SaveData, id: string): string | null {
  if (!s.settings.adult) return 'off';
  if (dateRec(s, id).st < 2) return 'early';
  if ((s.inv.condom || 0) < 1) return 'condom';
  return null;
}

/* ---------- Gesundheit (immer sichtbar) ---------- */
/** Tage zwischen Tests im Spiel (stellvertretend für die echten drei Monate bei PrEP) */
export const TEST_EVERY = 14;
export function testDue(s: SaveData) { return s.health.prep && s.day - s.health.test >= TEST_EVERY; }
export const HEALTH_INFO: Array<[string, string]> = [
  ['U=U', 'Undetectable = Untransmittable: Wer mit HIV lebt und unter der Nachweisgrenze ist, gibt HIV beim Sex nicht weiter. Therapie wirkt.'],
  ['PrEP', 'Die Prä-Expositions-Prophylaxe ist eine Tablette, die vor HIV schützt. In Deutschland verschreiben sie Ärzt*innen, die Krankenkasse zahlt. Dazu gehören regelmäßige Tests alle drei Monate.'],
  ['PEP', 'Nach einem Risiko (Kondom gerissen) schützt die Post-Expositions-Prophylaxe – möglichst innerhalb von 2, spätestens 72 Stunden in einer Notaufnahme oder HIV-Schwerpunktpraxis.'],
  ['Kondome', 'Schützen vor HIV und senken das Risiko für andere STI wie Tripper oder Syphilis. Mit wasser- oder silikonbasiertem Gleitgel reißen sie seltener.'],
  ['Tests', 'HIV- und STI-Tests sind in Checkpoints oft kostenlos oder günstig und anonym. Viele STI machen keine Beschwerden – testen hilft dir und anderen.'],
  ['Zustimmung', 'Nur Ja heißt Ja. Zustimmung kann man jederzeit zurücknehmen, und ein Nein wird respektiert – ohne Diskussion.'],
];

/* ---------- Glossar ---------- */
export const GLOSSARY: Array<[string, string, boolean?]> = [
  ['Coming-out', 'Anderen erzählen, wer man ist und wen man liebt – passiert oft nicht nur einmal.'],
  ['Wahlfamilie', 'Freund*innen, die zur Familie geworden sind.'],
  ['Queer', 'Sammelbegriff für alle, die nicht hetero oder nicht cis sind.'],
  ['Nichtbinär', 'Geschlechtsidentität jenseits von nur Mann oder nur Frau.'],
  ['Drag', 'Kunstform, bei der Geschlechterrollen auf der Bühne übertrieben gespielt werden.'],
  ['Bär', 'Kräftiger, oft behaarter Mann – und eine ganze Community.'],
  ['Twink', 'Junger, schlanker schwuler Mann (Szene-Begriff, nicht immer nett gemeint).'],
  ['Top', 'Wer beim Sex lieber eindringt.', true],
  ['Bottom', 'Wer lieber aufnimmt.', true],
  ['Vers', 'Versatil: mal so, mal so.', true],
  ['Side', 'Mag Nähe und Sex ohne Analverkehr.', true],
  ['Switch', 'Wechselt zwischen führender und folgender Rolle, oft im Kink-Kontext.', true],
  ['Cruising', 'Unverbindliche Begegnungen an bekannten Orten, z. B. nachts im Park.', true],
  ['Darkroom', 'Abgedunkelter Raum in Clubs für Begegnungen. Auch hier gilt: Zustimmung.', true],
  ['Kink', 'Vorlieben jenseits des Üblichen, z. B. Leder oder Rollenspiel – immer abgesprochen.', true],
  ['Safeword', 'Vereinbartes Wort, das sofort alles stoppt.', true],
  ['Stellungen', 'Missionar, Reiterstellung, Löffelchen, Doggy, 69 – Hauptsache, alle fühlen sich wohl und sagen, was sie mögen.', true],
];

/* ---------- Feed ---------- */
const POSTS: Array<[string, string]> = [
  ['Mo', 'Neuer Hafer-Cappuccino mit Lavendel. Wer traut sich? ☕💜'],
  ['Jules', 'Jugendgruppe heute ab 17 Uhr im Regenbogenhaus. Snacks sind da!'],
  ['Nova', 'Heute Nacht im Prisma: Neon-Battle. Kommt glitzernd. 🪩'],
  ['Bruno', 'Späti hat wieder Club-Mate. Ihr wisst, was das heißt.'],
  ['Hilde', 'Vor 40 Jahren haben wir hier die erste Demo gemacht. Ich war dabei. 🏳️‍🌈'],
  ['Kim', 'Wer hat meine Sonnenbrille im Park gefunden? 😎'],
  ['Checkpoint', 'Testen ist Selbstfürsorge. Mittwochs ohne Termin, anonym und kostenlos. 🩺'],
  ['Sam', 'Suche Leute für eine Queer-Volleyball-Runde im Park!'],
  ['Lena', 'Mein Laden hat jetzt einen Regenbogen-Ständer mit Büchern. 📚'],
  ['Tariq', 'Kochabend bei mir: Bringt Hunger und Geschichten mit.'],
  ['Rex', 'Revanche im Tanz-Battle? Ich bin bereit. 😏'],
  ['Checkpoint', 'U=U: Unter der Nachweisgrenze heißt nicht übertragbar. Teilt das! 💊'],
];
export function feed(s: SaveData) {
  const out: Array<{ d: number; who: string; t: string }> = [];
  for (let d = s.day; d > Math.max(0, s.day - 3); d--) for (let k = 0; k < 2; k++) { const [who, t] = POSTS[(d * 5 + k * 7) % POSTS.length]; out.push({ d, who, t }); }
  return [...s.feed.filter((p) => p.d > s.day - 5), ...out].sort((a, b) => b.d - a.d).slice(0, 14);
}
export function post(s: SaveData, who: string, t: string) { s.feed.unshift({ d: s.day, who, t }); s.feed.length = Math.min(s.feed.length, 20); }

/* ---------- Zufallsereignisse und Gerüchte ---------- */
export const RUMORS = [
  'Gerücht: Der Investor wurde gestern im Club Prisma gesehen – ohne Krawatte.',
  'Gerücht: Nova plant eine geheime Drag-Show auf der Plaza.',
  'Gerücht: Jemand hat im Park einen alten Pride-Banner von 1985 gefunden.',
  'Gerücht: Mo und Bruno hatten mal was miteinander. Pssst!',
  'Gerücht: Im Regenbogenhaus gibt es einen Keller, den niemand betreten darf.',
];
export type Event = { kind: 'money' | 'rumor' | 'friend'; text: string; money?: number };
/** Würfelt ein kleines Ereignis (oder nichts). r = Zufallszahl 0..1 */
export function rollEvent(s: SaveData, r: number): Event | null {
  if (r < .55) return null;
  if (r < .7) return { kind: 'money', text: 'Du findest 5 € auf dem Gehweg. Glückstag!', money: 5 };
  if (r < .9) return { kind: 'rumor', text: RUMORS[(s.day + Math.floor(r * 100)) % RUMORS.length] };
  return { kind: 'friend', text: 'Jemand winkt dir zu und lädt dich zum Kaffee ein. +Kontakte' };
}
/** Freundschaftsstufe */
export const bond = (f: number) => (f >= 80 ? 'Wahlfamilie' : f >= 50 ? 'befreundet' : f >= 20 ? 'bekannt' : 'neu');

/* ---------- Nachtleben 18+ (Durchgang 3b) ----------
   Nur mit settings.adult. Alles ist angedeutet: Abblende statt Darstellung, Zustimmung und Kondom sind Pflicht.
   Sexarbeiter*innen sind selbstbestimmte Erwachsene mit eigenen Regeln und Preisen. */
/** Videothek: Titel und Cover nur als Text (Parodien, frei erfunden) */
export const FILMS: Array<[string, string]> = [
  ['Bärenhunger 3: Die Rückkehr der Holzfäller', 'Zwei Bären in Karohemden vor einer Blockhütte, Titel in Neonpink'],
  ['Fifty Shades of Gay', 'Eine Krawatte, ein Augenzwinkern und sehr viel Grau'],
  ['Der Herr der Riemen', 'Ein Lederharness auf Samtkissen, darunter in Goldschrift: „Ein Riemen, sie zu knechten“'],
  ['Harte Schicht im Hafen', 'Muskulöse Matrosen im Gegenlicht, Rettungsringe im Vordergrund'],
  ['Stoßverkehr in Rainbow City', 'Ein Tramfahrer zwinkert aus dem Führerstand, Untertitel: „Bitte alle einsteigen!“'],
  ['Der Lack-Detektiv', 'Ein Mann in glänzendem Trenchcoat mit Lupe, Schatten an der Wand'],
  ['Feuerwehrmänner löschen nicht nur Brände', 'Helme, Hosenträger, ein Schlauch – mehr verrät das Cover nicht'],
  ['Sauna-Geflüster', 'Dampf, Holzbänke und zwei Handtücher, die sehr knapp sitzen'],
];
export interface Worker { id: string; name: string; age: number; pron: string; color: string; offer: string; price: number; rules: string }
/** Laufhaus „Haus Rosa“: selbstbestimmte erwachsene Sexarbeiter*innen mieten hier eigene Zimmer */
export const WORKERS: Worker[] = [
  { id: 'jasper', name: 'Jasper', age: 31, pron: 'er', color: '#ff9a56', offer: 'Massage und Kuscheln', price: 80, rules: 'Ich bestimme, was in meinem Zimmer passiert. Kondom ist Pflicht, Küssen nur, wenn ich es anbiete.' },
  { id: 'viktor', name: 'Viktor', age: 38, pron: 'er', color: '#c0102a', offer: 'Leder und Rollenspiel', price: 120, rules: 'Wir sprechen vorher ab, was du magst und was nicht. Ein Safeword gilt für uns beide: „Regenbogen“.' },
  { id: 'dani', name: 'Dani', age: 29, pron: 'they', color: '#9c59d1', offer: 'Gespräch und Zärtlichkeit', price: 70, rules: 'Viele kommen eigentlich zum Reden. Alles andere nur mit Kondom und wenn wir beide Ja sagen.' },
  { id: 'sina', name: 'Sina', age: 34, pron: 'sie', color: '#ff6ad5', offer: 'Begleitung und Verwöhnen', price: 90, rules: 'Bezahlt wird vorher, gefragt wird immer. Ein Nein ist ein Nein – auch mittendrin.' },
];
/** Laternenmeile in der Hochstadt: steigen nachts zu dir ins Auto, wenn du hupst (18+, Absprache vorab, Kondom haben sie dabei) */
export const CURB: Worker[] = [
  { id: 'nico', name: 'Nico', age: 26, pron: 'er', color: '#ff5a8a', offer: 'Eine Runde im Auto', price: 60, rules: 'Erst reden, dann fahren. Ich sage, was geht, und das Gummi ist von mir.' },
  { id: 'roxy', name: 'Roxy', age: 32, pron: 'sie', color: '#ff2a55', offer: 'Eine Runde im Auto', price: 70, rules: 'Bezahlt wird vorher. Ein Nein ist ein Nein, auch mittendrin. Kondom ist Pflicht.' },
  { id: 'teo', name: 'Teo', age: 29, pron: 'er', color: '#ffb347', offer: 'Eine Runde im Auto', price: 60, rules: 'Ich steig nur ein, wenn du freundlich bleibst. Safer Sex oder gar nicht.' },
  { id: 'jules', name: 'Jules', age: 35, pron: 'they', color: '#b56bff', offer: 'Eine Runde im Auto', price: 80, rules: 'Wir sprechen kurz ab, was du magst. Meine Grenzen gelten, deine auch.' },
];
export const isLateNight = (h: number) => h >= 22 || h < 4;
/** Begegnung im Nachtleben: braucht 18+, Zustimmung und (außer beim Reden) ein Kondom. Gibt einen Grund zurück, falls es nicht geht. */
export function canMeet(s: SaveData, needsCondom = true): 'off' | 'condom' | null {
  if (!s.settings.adult) return 'off';
  if (needsCondom && (s.inv.condom || 0) < 1) return 'condom';
  return null;
}
/** Folgen einer Begegnung (angedeutet): Kondom verbraucht, Bedürfnisse, Test-Erinnerung */
export function encounter(s: SaveData, kind: 'cabin' | 'cruising' | 'room' | 'talk') {
  if (kind !== 'talk') s.inv.condom = Math.max(0, (s.inv.condom || 0) - 1);
  const fx = { cabin: { fun: 22, social: 4, hygiene: -15 }, cruising: { fun: 25, social: 8, hygiene: -20, energy: -8 }, room: { fun: 32, social: 12, hygiene: -20, energy: -15 }, talk: { social: 25, fun: 10 } }[kind];
  for (const [k, v] of Object.entries(fx)) (s.needs as Record<string, number>)[k] = Math.max(0, Math.min(100, (s.needs as Record<string, number>)[k] + v));
  s.flags.lastNight = s.day;
  return { remindTest: s.day - (s.health.test || 0) >= TEST_EVERY || !s.health.test };
}
