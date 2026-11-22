/* Szene-Figuren von Pride City: Pups mit Maske, Lederkerle, Daddys, Kinky-Leute mit Halsband, Bears, Twinks, Drag Queens,
   Trans-Divas, stolze Schlampen und Dominas. Jede Art hat eigenen Look (Rocketbox-Figur, Szene-Look, Outfit, kleines
   Zubehör am Kopf/Hals), eigenes Verhalten (Animation, wo sie auftaucht) und eigene Sprüche samt einer Sonder-Aktion
   im Gespräch. Kinky-Arten nur mit „Inhalte ab 18“. Alles bleibt Andeutung, Zustimmung ist Pflicht. */
import type { Anim, Outfit } from './Actor';
/** gleicher Hash wie flirt.ts (eigene Kopie, sonst Ringimport) */
const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };

export type Gear = 'pup' | 'cap' | 'collar' | 'crown';
export interface SzeneTyp {
  id: string; name: string; icon: string; color: string;
  /** Rocketbox-Figuren, aus denen die Art gewählt wird */ rb: string[];
  style?: string; outfit: Outfit; /** Outfit ohne 18+ */ soft?: Outfit; gear?: Gear;
  anim: Anim[]; /** nur mit 18+ */ adult?: boolean; /** wo: Club, Darkroom, Straße (nachts) */ where: Array<'club' | 'dark' | 'street'>;
  hello: string[]; tease: string[];
  act: { label: string; lines: string[]; fun?: number; social?: number };
  /** Flirt leichter (Prozentpunkte) */ flirt: number; /** mehr wechselnde Kontakte (STI-Faktor) */ mul: number;
}

export const SZENE: Record<string, SzeneTyp> = {
  pup: { id: 'pup', name: 'Pup', icon: '🐶', color: '#3ee69a', rb: ['Male_Adult_03', 'Male_Adult_07', 'Male_Adult_10', 'Sports_Male_01'], outfit: 'harness', gear: 'pup', anim: ['cheer', 'dance3', 'laugh'], adult: true, where: ['club', 'dark', 'street'],
    hello: ['Wuff! 🐾 Ich bin heute im Headspace. Reden geht trotzdem, nur mit mehr Schwanzwedeln.', 'Grrr … nee, Spaß. Ich bin der freundlichste Pup der Stadt. Kraulen hinterm Ohr ist erlaubt.'],
    tease: ['Wuff. Du riechst nach Abenteuer. Darf ich mal schnuppern?', 'Mein Handler sagt, ich darf heute Abend spielen. Willst du der Ball sein? 🎾', 'Ich apportiere alles. Auch Kondome. Besonders Kondome.'],
    act: { label: '🦴 Hinterm Ohr kraulen', lines: ['*wedelt, wackelt, rollt sich fast auf den Boden* Wuff! Du bist gut. Richtig gut.', 'Pup-Play ist Spiel, nicht Unterwerfung um jeden Preis: Wir haben Regeln, ein Stoppzeichen und viel Spaß.'], fun: 6, social: 4 },
    flirt: 15, mul: 1.2 },
  leder: { id: 'leder', name: 'Lederkerl', icon: '🖤', color: '#c9c9d6', rb: ['Male_Adult_05', 'Male_Adult_08', 'Male_Adult_04', 'Male_Adult_06'], style: 'lederjacke', outfit: 'clothed', gear: 'cap', anim: ['idle', 'drink', 'talk'], where: ['club', 'dark', 'street'],
    hello: ['Leder ist keine Mode, Leder ist Haltung. Und sehr warm im Sommer.', 'Der Leder-Stammtisch ist jeden Donnerstag im Prisma. Auch für Neue.'],
    tease: ['Du schaust auf meine Stiefel. Willst du sie putzen oder anprobieren?', 'Ich bin streng, aber gerecht. Und nach Mitternacht ziemlich verschmust.', 'Riechst du das? Frisch gefettetes Leder. Das ist mein Parfüm.'],
    act: { label: '🥾 Leder bewundern', lines: ['Fass ruhig an. Die Jacke ist älter als du und hat mehr CSDs gesehen als jedes Archiv.', 'Die Lederszene war früh solidarisch, als in den 80ern Aids kam. Wir haben gepflegt, gesammelt, getragen.'], fun: 4, social: 5 },
    flirt: 5, mul: 1 },
  kinky: { id: 'kinky', name: 'Kinky', icon: '⛓️', color: '#ff4f6b', rb: ['Male_Adult_02', 'Male_Adult_09', 'Female_Adult_09', 'Female_Adult_04'], outfit: 'harness', gear: 'collar', anim: ['pose', 'talk', 'dance2'], adult: true, where: ['club', 'dark', 'street'],
    hello: ['Mein Halsband? Gehört zu meinem Spiel. Und ja, ich hab ein Safeword.', 'Kink heißt für mich: alles abgesprochen, alles freiwillig, alles mit Lachen danach.'],
    tease: ['Mein Safeword ist „Ananas“. Bisher hab ich es nie gebraucht. Willst du das ändern?', 'Ich mag es, wenn jemand weiß, was er will. Weißt du es?', 'Fesseln, Federn, Flüstern. Such dir eins aus. Oder alle drei.'],
    act: { label: '🍍 Nach dem Safeword fragen', lines: ['„Ananas“. Wer es sagt, bei dem hört alles sofort auf. Ohne Diskussion, ohne Schmollen.', 'Vorher reden, währenddessen achten, danach kuscheln: Aftercare ist das Beste am ganzen Spiel.'], fun: 3, social: 6 },
    flirt: 10, mul: 1.1 },
  bear: { id: 'bear', name: 'Bear', icon: '🐻', color: '#c98b4f', rb: ['Male_Adult_06', 'Male_Adult_08', 'Male_Adult_01', 'Business_Male_01'], style: 'bear', outfit: 'shirtless', soft: 'clothed', anim: ['laugh', 'drink', 'talk'], where: ['club', 'street'],
    hello: ['Brummm. Willkommen in der Höhle. Bier oder Kuscheln?', 'Bauch ist kein Makel, Bauch ist Kuschelfläche. Merk dir das.'],
    tease: ['Ich bin weich wie ein Teddy. Fast überall.', 'Komm her, du siehst aus, als bräuchtest du eine Bärenumarmung. Oder zwei. Oder die ganze Nacht.', 'Mein Bart kitzelt. Willst du testen, wo?'],
    act: { label: '🐻 Bärenumarmung', lines: ['*drückt dich fest an sich, es knackt kurz im Rücken* Na? Besser?', 'Die Bear-Szene hat in den 80ern gezeigt: Begehrt wird nicht nur der Sixpack. Alle Körper sind schön.'], fun: 4, social: 10 },
    flirt: 10, mul: .9 },
  twink: { id: 'twink', name: 'Twink', icon: '✨', color: '#7fd4ff', rb: ['Male_Adult_03', 'Sports_Male_01', 'Male_Adult_10', 'Male_Adult_07'], style: 'crop', outfit: 'clothed', anim: ['dance1', 'dance3', 'cheer'], where: ['club', 'street'],
    hello: ['Oh mein Gott, dein Outfit! Wo hast du das her? Ich brauch das!', 'Ich tanze seit sechs Stunden. Meine Beine sind Wackelpudding, meine Laune ist Konfetti.'],
    tease: ['Ich bin klein, aber laut. Das ist ein Versprechen.', 'Trag mich zur Bar, und ich zeig dir später, wie biegsam Ballettunterricht macht.', 'Daddys bitte hier entlang. Alle anderen auch. 💅'],
    act: { label: '💃 Zusammen tanzen', lines: ['*dreht dich, wirft die Haare, landet in deinen Armen* Okay, du kannst was!', 'Wichtig: Twink ist ein Szenewort für junge, schlanke Erwachsene. Hier drin sind alle volljährig, sonst kommt niemand rein.'], fun: 10, social: 4 },
    flirt: 8, mul: 1 },
  daddy: { id: 'daddy', name: 'Daddy', icon: '🥃', color: '#ffb347', rb: ['Business_Male_01', 'Male_Adult_04'], style: 'leder', outfit: 'shirtless', soft: 'clothed', anim: ['drink', 'idle', 'talk'], where: ['club', 'dark', 'street'],
    hello: ['Graue Schläfen, ruhige Hand, guter Whisky. Setz dich, ich lade dich ein.', 'Ich hab schon CSDs organisiert, als es noch Steine statt Konfetti gab.'],
    tease: ['Komm her, Kleine*r. Daddy erklärt dir die Welt. Und danach zeigt er sie dir.', 'Ich weiß genau, was ich tue. Und ich hab’s nie eilig.', 'Du brauchst jemanden, der dich führt? Ich führe gern. Mit Gefühl.'],
    act: { label: '🥃 Auf einen Whisky einladen lassen', lines: ['*schiebt dir ein Glas rüber* Auf die Jungen, die es leichter haben sollen als wir.', 'Daddy ist in der Szene kein Alter, sondern eine Haltung: fürsorglich, souverän, ein bisschen bestimmend. Immer mit Absprache.'], fun: 5, social: 8 },
    flirt: 12, mul: .9 },
  drag: { id: 'drag', name: 'Drag Queen', icon: '👑', color: '#ff6ad5', rb: ['Female_Party_01', 'Female_Party_02'], style: 'drag', outfit: 'clothed', gear: 'crown', anim: ['pose', 'cheer', 'laugh'], where: ['club', 'street'],
    hello: ['Darling! Die Perücke sitzt, die Wimpern kleben, die Welt darf kommen.', 'Ich heiße heute Miss Glitzertrauma. Morgen wieder Kevin. Beide lieben dich.'],
    tease: ['Ich hab mehr Kurven als die Hafenstraße, Schätzchen. Und weniger Schlaglöcher.', 'Nach der Show geht das Make-up ab. Was sonst noch abgeht, entscheiden wir zwei.', 'Du darfst mir das Korsett aufmachen. Aber nur, wenn du es wieder zukriegst.'],
    act: { label: '👑 Ein Kompliment machen', lines: ['*fächelt sich Luft zu* Endlich jemand mit Geschmack! Kuss links, Kuss rechts, mwah.', 'Drag ist Kunst, Politik und Party. Die ersten Steine bei Stonewall kamen auch aus Drag-Händen.'], fun: 8, social: 6 },
    flirt: 6, mul: 1 },
  trans: { id: 'trans', name: 'Trans-Diva', icon: '💖', color: '#5bcefa', rb: ['Female_Party_02', 'Female_Adult_08', 'Female_Adult_06', 'Female_Adult_02'], style: 'trans', outfit: 'clothed', anim: ['pose', 'dance2', 'talk'], where: ['club', 'street'],
    hello: ['Hi Süße*r! Ich bin trans, glücklich und heute unwiderstehlich. Nur eins davon ist neu.', 'Mein Name ist meine Entscheidung. Und meine Absätze auch.'],
    tease: ['Ich weiß, was ich will. Und gerade schaue ich dich an.', 'Andere zeigen ihren Ausweis, ich zeig meine Kurven. Beides echt.', 'Frag mich nicht, was ich „unten“ habe. Frag mich, was ich mit dir vorhabe. 😘'],
    act: { label: '💖 Nach ihrem Glow fragen', lines: ['Drei Jahre Hormone, zwei neue Freundinnen, eine Familie, die es endlich kapiert. Das ist mein Glow.', 'Seit 2024 gibt es in Deutschland das Selbstbestimmungsgesetz: Name und Geschlechtseintrag ändern geht beim Standesamt, ohne Gutachten.'], fun: 4, social: 8 },
    flirt: 8, mul: 1 },
  slut: { id: 'slut', name: 'Stolze Schlampe', icon: '💋', color: '#ffd23b', rb: ['Male_Adult_09', 'Male_Adult_02', 'Female_Party_01', 'Sports_Female_01'], outfit: 'shirtless', gear: 'collar', anim: ['dance2', 'pose', 'laugh'], adult: true, where: ['club', 'dark', 'street'],
    hello: ['Ja, ich hab Spaß, viel und oft. Und ja, ich teste alle drei Monate. Noch Fragen?', 'Schlampe ist für mich ein Ehrentitel. Ich hab ihn mir hart erarbeitet.'],
    tease: ['Ich hab heute schon drei Nummern. Deine wäre die schönste.', 'Mein Kalender ist voll, aber für dich mach ich eine Lücke. Eine große.', 'Kondom oder Testergebnis, Schatz. Ohne eins von beiden kommt hier keiner rein.'],
    act: { label: '📋 Nach dem letzten Test fragen', lines: ['*zeigt das Handy* Letzten Monat, alles negativ, PrEP läuft. Das ist sexy, nicht peinlich.', 'Wer viel Sex hat und offen darüber redet, schützt oft besser als die, die heimlich machen. Testen ist Teil vom Spaß.'], fun: 5, social: 5 },
    flirt: 25, mul: 1.3 },
  domina: { id: 'domina', name: 'Domina', icon: '🖤', color: '#b56bff', rb: ['Female_Adult_09', 'Female_Adult_05', 'Female_Adult_03'], style: 'lederjacke', outfit: 'clothed', gear: 'cap', anim: ['pose', 'idle', 'talk'], adult: true, where: ['club', 'dark'],
    hello: ['Auf die Knie? Nein. Erst reden, dann Regeln, dann vielleicht Knie.', 'Ich führe gern. Auf der Tanzfläche und anderswo.'],
    tease: ['Du darfst mich ansehen. Anfassen musst du dir verdienen.', 'Ich hab eine Gerte und sehr viel Geduld. Die Gerte brauche ich selten.', 'Sag „bitte“. Schöner. Na also.'],
    act: { label: '🙇 Höflich „bitte“ sagen', lines: ['*lächelt kühl, dann warm* Brav. So fängt jede gute Nacht an.', 'Dominanz ist Vertrauen: Wer führt, trägt Verantwortung. Ohne Zustimmung ist es kein Spiel, sondern Gewalt.'], fun: 5, social: 5 },
    flirt: 4, mul: 1 },
};
export const SZENE_IDS = Object.keys(SZENE);

/** Arten, die an einem Ort vorkommen dürfen */
export function szeneFor(where: 'club' | 'dark' | 'street', adult: boolean) { return SZENE_IDS.map((k) => SZENE[k]).filter((t) => t.where.includes(where) && (adult || !t.adult)); }
/** Figur einer Art: feste Wahl je Schlüssel */
export function szeneRb(t: SzeneTyp, key: string) { return t.rb[hash(key) % t.rb.length]; }
export const szeneOutfit = (t: SzeneTyp, adult: boolean): Outfit => (adult ? t.outfit : t.soft || (t.outfit === 'harness' || t.outfit === 'underwear' ? 'shirtless' : t.outfit));
/** Spruch zum Gesprächsbeginn */
export const szeneLine = (t: SzeneTyp, adult: boolean, n: number) => { const a = adult ? t.tease : t.hello; return a[((n % a.length) + a.length) % a.length]; };

/** Plätze auf der Straße (vor Clubs, Bars, Haus Rosa, Hochstadt): [Art, x, z, Blick] */
export const STREET_SZENE: Array<[string, number, number, number]> = [
  ['pup', 6.2, -6.4, -1.2], ['leder', 6.9, -7.3, -2.4], ['kinky', 5.8, -13, -.8],
  ['bear', -12.8, 10.6, 1.9], ['twink', -10.6, 11.3, -2.6], ['drag', -6.2, 16.6, 1.8],
  ['trans', -6.1, 12.4, 1.2], ['slut', -6, -32.6, 1.6], ['pup', -6.3, -30.9, 2.5],
  ['bear', 127, 36.2, -1.2], ['daddy', 7.4, -9.8, -1.8], ['daddy', 128.2, 8.8, 1.2], ['trans', 129.6, 38.9, -2.4], ['twink', 126.8, 12, 1.4],
];
