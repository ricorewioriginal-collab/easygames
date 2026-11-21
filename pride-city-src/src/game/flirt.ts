/* Mit allen reden: Jede erwachsene Figur in Pride City (Straße, Häuser, Clubs, Darkroom) ist ansprechbar.
   Plaudern geht immer; mit „Inhalte ab 18“ kommen freche Zweideutigkeiten, Flirts, One-Night-Stands, Hauspartys mit
   geschlossener Tür und der Darkroom dazu. Alles nur angedeutet: Wortwitz, Ausziehen bis zur Unterwäsche, Kuss, Abblende.
   Zustimmung beider ist Pflicht, ein Nein wird respektiert, Kondom (oder PrEP-Hinweis) gehört dazu. */
import type { SaveData } from '../engine/Save';
import { STYLE_IDS } from './queer';
import type { Outfit } from './Actor';

/** Erwachsene Rocketbox-Figuren für Gäste: verschiedene Gesichter, Hauttöne, Frisuren und Kleidung */
export const GUEST_POOL = [
  'Male_Adult_01', 'Male_Adult_02', 'Male_Adult_03', 'Male_Adult_04', 'Male_Adult_05', 'Male_Adult_06', 'Male_Adult_07', 'Male_Adult_08', 'Male_Adult_09', 'Male_Adult_10',
  'Female_Adult_01', 'Female_Adult_02', 'Female_Adult_03', 'Female_Adult_04', 'Female_Adult_05', 'Female_Adult_06', 'Female_Adult_07', 'Female_Adult_08', 'Female_Adult_09', 'Female_Adult_10',
  'Female_Party_01', 'Female_Party_02', 'Sports_Male_01', 'Sports_Female_01',
];
const NAMES_M = ['Adrian', 'Benni', 'Cem', 'Dario', 'Emil', 'Felix', 'Gino', 'Hassan', 'Ilias', 'Jannik', 'Kofi', 'Lars', 'Matteo', 'Nils', 'Oskar', 'Paolo', 'Rafael', 'Sven', 'Timo', 'Yusuf', 'Zeno', 'Marlon', 'Tobi', 'Andrés'];
const NAMES_F = ['Alina', 'Bea', 'Chiara', 'Dilara', 'Esra', 'Frida', 'Greta', 'Hanna', 'Ines', 'Juna', 'Kaya', 'Lina', 'Maja', 'Nele', 'Olga', 'Paula', 'Rana', 'Selma', 'Tessa', 'Yara', 'Zoe', 'Mara', 'Ronja', 'Luz'];
const NAMES_X = ['Alex', 'Charlie', 'Jules', 'Kim', 'Luca', 'Mika', 'Noa', 'Robin', 'Sascha', 'Toni'];
const COLORS = ['#ff6ad5', '#5ce1ff', '#ffd23b', '#3ee69a', '#ff8a3b', '#b56bff', '#ff4f6b', '#7fd4ff', '#ffb347', '#9b5cff'];

export const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
const pick = <T>(a: T[], n: number) => a[((n % a.length) + a.length) % a.length];

/** Fremde Person: Name, Farbe und Pronomen fest aus einem Schlüssel (gleiche Person = gleicher Name) */
export interface Stranger { key: string; name: string; color: string; pron: 'er' | 'sie' | 'they'; rb?: string }
export function stranger(key: string, rb?: string, name?: string): Stranger {
  const h = hash(key), f = rb ? /^Female|_Female/.test(rb) : h % 2 === 0, x = h % 9 === 0;
  return { key, rb, color: pick(COLORS, h >> 3), pron: x ? 'they' : f ? 'sie' : 'er', name: name || (x ? pick(NAMES_X, h >> 5) : pick(f ? NAMES_F : NAMES_M, h >> 5)) };
}

/** Gäste eines Raums: feste, aber je Raum andere Figuren mit Szene-Look und passendem Outfit */
export interface Guest { rb: string; style?: string; outfit: Outfit; st: Stranger }
export function guestCast(roomId: string, n: number, o: { adult: boolean; party: boolean; swim?: boolean; dark?: boolean }): Guest[] {
  const out: Guest[] = [], used = new Set<string>();
  const h0 = hash(roomId);
  for (let i = 0; out.length < n && i < n * 4; i++) {
    const h = hash(roomId + ':' + i), rb = GUEST_POOL[(h0 + h) % GUEST_POOL.length];
    if (used.has(rb)) continue; used.add(rb);
    const style = h % 5 < 2 ? STYLE_IDS[(h >> 4) % STYLE_IDS.length] : undefined;
    let outfit: Outfit = 'clothed';
    if (o.swim) outfit = 'swim';
    else if (o.dark) outfit = h % 3 === 0 ? 'harness' : 'shirtless';
    else if (o.adult && o.party) outfit = (['clothed', 'shirtless', 'clothed', 'harness'] as Outfit[])[h % 4];
    if (!o.adult && outfit === 'harness') outfit = 'shirtless';
    out.push({ rb, style: o.dark ? undefined : style, outfit, st: stranger(roomId + '#' + i, rb) });
  }
  return out;
}

/* ---------- Sätze ---------- */
/** Plaudern: immer jugendfrei */
export const CHAT = [
  'Hey! Neu hier? Ich hab dich noch nie gesehen, und ich kenne hier wirklich alle.',
  'Die Stadt ist heute so bunt, ich krieg meine Sonnenbrille gar nicht mehr ab.',
  'Ich bin nur kurz hier, sagt mein Kalender. Mein Herz sagt was anderes.',
  'Weißt du, wo es den besten Kaffee gibt? Ich frag für mein Nervenkostüm.',
  'Letzte Woche CSD, diese Woche Muskelkater vom Tanzen. Lohnt sich jedes Jahr.',
  'Ich hab mir vorgenommen, heute mit einer fremden Person zu reden. Glückwunsch, du bist es.',
  'Mein Mitbewohner hat schon wieder Glitzer in die Waschmaschine getan. Jetzt funkeln meine Socken.',
  'Wenn du einen Tipp willst: Im One Love singt Lady Luma heute. Gänsehaut garantiert.',
  'Ich bin vor drei Jahren hergezogen. Seitdem fühlt sich jede Straße ein bisschen wie Zuhause an.',
  'Schönes Outfit übrigens. Mutig. Gefällt mir.',
];
/** Zweideutige Sprüche der anderen (18+): Wortwitz, nichts Explizites */
export const TEASE = [
  'Na, hast du heute noch was Großes vor? 😏',
  'Ist das eine Taschenlampe in deiner Hose, oder freust du dich nur, mich zu sehen?',
  'Ich hätte da noch ein Plätzchen frei. Neben mir. Ganz nah.',
  'Du siehst aus, als könntest du gut mit den Händen. Klavier, meine ich. Natürlich.',
  'Ich steh total auf … Gespräche. Lange, tiefe … Gespräche.',
  'Wenn du so weiterguckst, muss ich dir mal meine Briefmarkensammlung zeigen. Ich hab keine.',
  'Bei dir würde ich glatt mein Handy auf lautlos stellen.',
  'Sag mal, tut das weh? Ich meine, so heiß zu sein?',
  'Du darfst mich gern mal auf einen Drink einladen. Oder auf zwei. Oder auf mein Sofa.',
  'Ich hab gehört, du kannst gut zupacken. Beim Umzug, meine ich. 😇',
];
/** Was die Spielfigur sagen kann: [Spruch, Antwort bei Erfolg, Antwort bei Abfuhr] */
export const PICKUP: Array<[string, string, string]> = [
  ['„Bist du ein Parkverbot? Du hast nämlich ein Ticket für meine Augen.“', 'Haha, schlimm. Aber irgendwie süß. Erzähl mir mehr. 😏', 'Oh je. Nein. Aber nett, dass du es versuchst.'],
  ['„Ich hab mein Kondom vergessen … nee, Scherz, ich hab drei. Man weiß ja nie.“', 'Vorbereitet und lustig? Gefährliche Mischung. 😈', 'Gut zu wissen. Ich bin heute aber nur zum Tanzen hier.'],
  ['„Ist es heiß hier, oder liegt das an dir?“', 'An mir. Eindeutig an mir. Und vielleicht ein bisschen an dir. 🔥', 'An der Heizung, glaub ich. Aber danke!'],
  ['„Hast du eine Karte? Ich verlier mich gerade in deinen Augen.“', 'Ich kann dich auch persönlich führen. Überall hin. 😉', 'Ganz schön kitschig. Ich geb dir Punkte für den Mut.'],
  ['„Mein Bett ist frisch bezogen. Wäre schade, wenn das so bleibt.“', 'Frisch bezogen? Das klingt nach einer Herausforderung. 😏', 'Wow, direkt. Heute nicht, aber ich merk mir das Angebot.'],
  ['„Ich mach super Frühstück. Willst du’s morgen probieren?“', 'Ich nehm Rührei. Und dich davor. 🍳', 'Ich frühstücke lieber allein, aber danke für die Einladung.'],
  ['„Ich bin wie ein Gutschein: einmal einlösen, dauernd glücklich.“', 'Und wo kann ich dich einlösen? Ich frag für mich. 😏', 'Läuft dein Gutschein ab, wenn ich Nein sage? Nein.'],
];
/** Ja zur gemeinsamen Nacht */
export const YES = [
  'Ich dachte schon, du fragst nie. Ja, gern. Zu dir?',
  'Mit Gummi und guter Laune: Ich bin dabei. 😏',
  'Ja. Aber ich warne dich: Ich klau morgens die Decke.',
  'Okay, aber nur wenn du mir danach Pancakes machst. Deal?',
];
/** Nein: wird respektiert */
export const NO = [
  'Du bist süß, aber heute nicht. Lass uns einfach weiterquatschen.',
  'Ich hab heute keine Lust, ehrlich gesagt. Nichts gegen dich!',
  'Ich bin vergeben, und unsere Absprache ist exklusiv. Trotzdem danke! 💜',
  'Ich glaube, es funkt nicht genug. Aber das Gespräch war schön.',
];
/** Rückmeldung am Morgen danach: frech, nie grafisch. Nach Bewertung 1–5 */
export const REVIEW: string[][] = [
  [],
  ['Na ja … du warst sehr schnell eingeschlafen. Die Kuschelzeit war aber top. 😴', 'Es war … gemütlich. Fast wie ein Wellness-Wochenende.'],
  ['Süß war es. Beim nächsten Mal bringst du mehr Feuer mit, okay? 😉', 'Gar nicht schlecht für den ersten Abend. Ausbaufähig. 😏'],
  ['Hui. Ich brauch erst mal einen Kaffee. Und vielleicht eine Pause. ☕', 'Das war richtig schön. Ich glaube, die Nachbarn wissen jetzt auch, wie du heißt.'],
  ['Wow, du hattest echt was zu bieten. Ich kann heute nicht mehr gerade laufen. 😮‍💨', 'Ich wusste nicht, dass Lattenrost so laut sein kann. Respekt. 🔥', 'Wer hat dir das beigebracht? Ich will ein Zertifikat für dich drucken.'],
  ['Meine Beine zittern noch. Ich ruf jetzt meine Mama an und erzähl ihr … nein, doch nicht. 😳🔥', 'Fünf Sterne, würde wieder buchen. Ich schreib dir eine Bewertung bei Google Maps. 🌟', 'Ich hab Gott gesehen. Und dann deine Decke. Und dann wieder Gott. 🙌'],
];
/** Hausparty (ohne 18+): witzige Zusammenfassung */
export const PARTY = [
  'Um eins lief „Dancing Queen“ in Dauerschleife. Um drei hat jemand den Kühlschrank zur Bühne erklärt. Um fünf: Gruppenumarmung im Treppenhaus.',
  'Jemand hat den Goldfisch zum DJ gekürt. Er hat überraschend gut aufgelegt. Die Nachbarin kam zum Beschweren und blieb bis zum Frühstück.',
  'Vier Pizzen, zwölf Luftballons, ein Flamingo aus Gummi. Am Morgen weiß niemand mehr, wem er gehört. Aber alle lieben ihn.',
];
/** Hausparty mit geschlossener Tür (18+): nur angedeutet, witzig */
export const ORGY = [
  'Um eins ging das Licht aus und die Musik an. Um zwei hat jemand gerufen: „Hat wer meinen Gürtel?“ Um vier lagen zwölf Leute im Wohnzimmer und haben sich über Steuererklärungen unterhalten. Die Kondomschale ist leer. Gutes Zeichen.',
  'Sieben Leute, ein Sofa, null Hemmungen. Die Tür blieb drei Stunden zu, die Fenster beschlugen. Am Morgen findest du eine fremde Socke in deiner Jackentasche und eine Telefonnummer auf deinem Arm.',
  'Erst Flaschendrehen, dann Wahrheit oder Pflicht, dann nur noch Pflicht. Was in der Wohnung passiert, bleibt in der Wohnung. Die Nachbarn haben trotzdem applaudiert.',
  'Der Gastgeber hat am Ende Pokale verteilt: „Ausdauer“, „Beste Stimme“ und „Meiste Unterhosen verloren“. Rate mal, wer zwei Pokale mitnimmt. 🏆',
];
/** Darkroom: Flüstern aus dem Dunkeln (18+), nur Andeutung */
export const DARK = [
  'Psst … hier drüben ist noch Platz. Ich beiße nicht. Nur wenn du willst.',
  'Ich seh dich nicht, aber ich glaub, du bist genau mein Typ.',
  'Nicht so schüchtern. Hier drin kennt niemand deinen Namen.',
  'Hast du ein Gummi? Dann hast du einen Freund.',
  'Ich steh hier schon seit einer Stunde. Langsam wird mir warm.',
  'Dein Parfüm … oder ist das Nebel? Egal. Komm her.',
];

/* ---------- Logik ---------- */
const today = (s: SaveData, k: string) => s.flags[k] === s.day;
/** Heute schon erfolgreich geflirtet? */
export const flirted = (s: SaveData, key: string) => today(s, 'fl_' + hash(key).toString(36));
/** Flirtversuch: Erfolg hängt an Ruf, Spaß und Glück (feste Zahl je Person und Tag, damit Neuladen nichts ändert) */
export function flirtTry(s: SaveData, key: string, line: number) {
  const k = 'fl_' + hash(key).toString(36);
  if (s.flags[k] === s.day) return true;
  const roll = hash(key + ':' + s.day + ':' + line) % 100;
  const chance = 45 + Math.min(25, Math.round((s.rep || 0) / 4)) + Math.round((s.needs.fun - 50) / 5);
  const ok = roll < chance;
  if (ok) s.flags[k] = s.day;
  return ok;
}
/** Sagt die Person Ja zur Nacht? Nur nach geglücktem Flirt am selben Tag, sonst meist Nein (feste Antwort je Tag) */
export function nightAnswer(s: SaveData, key: string): { yes: boolean; text: string } {
  const h = hash(key + ':night:' + s.day);
  const yes = flirted(s, key) && h % 100 < 78;
  return { yes, text: yes ? pick(YES, h >> 3) : pick(NO, h >> 3) };
}
/** Rückmeldung zur Nacht: Bewertung 1–5 aus Stimmung (Spaß, Energie, Hygiene) und Ruf, Wirkung auf Ruf und Laune */
export function nightReview(s: SaveData, key: string) {
  const n = s.needs, mood = (n.fun + n.energy + n.hygiene) / 3;
  const base = mood > 70 ? 4 : mood > 50 ? 3 : mood > 30 ? 2 : 1;
  const stars = Math.max(1, Math.min(5, base + (hash(key + s.day) % 3) - 1 + ((s.rep || 0) > 40 ? 1 : 0)));
  const text = pick(REVIEW[stars], hash(key) >> 2);
  const rep = stars >= 4 ? 2 : stars >= 3 ? 1 : 0;
  s.flags.ons = (Number(s.flags.ons) || 0) + 1;
  return { stars, text, rep, fun: 10 + stars * 6 };
}
export const starLine = (n: number) => '🔥'.repeat(n) + '·'.repeat(5 - n);
/** Gruppen-Zusammenfassung (Hausparty bzw. 18+ mit geschlossener Tür) */
export function partySummary(s: SaveData, key: string, adult: boolean) {
  const h = hash(key + ':party:' + s.day);
  return adult ? pick(ORGY, h) : pick(PARTY, h);
}
