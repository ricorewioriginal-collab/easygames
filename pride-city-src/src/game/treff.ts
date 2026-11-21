/* Treffpunkte am Hafen mit eigenen Aufträgen: Sauna Heißer Stein (Sauna-Torsten) und Strandbar Sandbank (Bruno).
   Die Aufträge laufen wie alle anderen (Lichtsäule, Radar, Zeit) und stehen zusätzlich im Ortsmenü. Wer alle drei
   eines Ortes geschafft hat, wird Stammgast: dort ist der Eintritt frei und es gibt einen Bonus. 18+ nur angedeutet. */
import type { SaveData } from '../engine/Save';
import type { Gig, GigStep } from './gigs';

const S = (x: number, z: number, label: string, icon = '📦'): GigStep => ({ x, z, label, icon });
export const SAUNA_POS = { x: -77, z: 40.4 }, BEACH_POS = { x: -80.4, z: 30 };

export interface TreffGig extends Gig { place: 'sauna' | 'beach' }
export const TREFF_GIGS: TreffGig[] = [
  { place: 'sauna', id: 'aufguss', who: 'Sauna-Torsten', color: '#d56300', title: 'Kräuter für den Aufguss', time: 110, pay: 45, rep: 1, car: true,
    call: 'Moin! Gleich ist Aufguss und mir sind Eukalyptus und Minze ausgegangen. Der Späti hat welche, das Regenbogenhaus hat Minze im Garten.',
    steps: [S(-4, 40, 'Eukalyptus beim Späti', '🌿'), S(-4, -10, 'Minze im Garten vom Regenbogenhaus', '🌱'), S(SAUNA_POS.x, SAUNA_POS.z, 'Zur Sauna Heißer Stein', '🧖')], done: 'Torsten: „Riechst du das? So muss ein Aufguss duften.“' },
  { place: 'sauna', id: 'handtuch', who: 'Sauna-Torsten', color: '#d56300', title: 'Handtuch-Notstand', time: 100, pay: 40, rep: 1,
    call: 'Die Waschmaschine ist kaputt und Samstag ist volles Haus. Die Muckibude leiht uns frische Handtücher. Holst du sie?',
    steps: [S(34, -20, 'Handtücher in der Muckibude', '🧺'), S(SAUNA_POS.x, SAUNA_POS.z, 'Zur Sauna Heißer Stein', '🧖')], done: 'Ein Stapel in allen Regenbogenfarben. Torsten ist gerührt.' },
  { place: 'sauna', id: 'saunanacht', who: 'Sauna-Torsten', color: '#d56300', title: 'Lange Saunanacht', time: 150, pay: 70, rep: 2, night: true,
    call: 'Heute ist lange Saunanacht mit Kerzen. Kannst du Plakate in die Bars bringen? Wer kommt, kommt entspannt.',
    steps: [S(34, 20, 'Plakat in die One Love Bar', '🕯️'), S(4, -10, 'Plakat ins Club Prisma', '🕯️'), S(-71, -12, 'Plakat in den Club Leuchtturm', '🕯️'), S(SAUNA_POS.x, SAUNA_POS.z, 'Zurück zur Sauna', '🧖')], done: 'Die Sauna ist voll, die Kerzen brennen, alle flüstern. Schön.' },
  { place: 'beach', id: 'liegen', who: 'Bruno', color: '#d56300', title: 'Liegestühle retten', time: 90, pay: 40, rep: 1,
    call: 'Sturm heute Nacht! Die Liegestühle liegen verstreut am Kai. Sammelst du sie ein, bevor sie baden gehen?',
    steps: [S(-86, 14, 'Liegestuhl am Weltentor', '🏖️'), S(-72, -2, 'Liegestuhl am Steg', '🏖️'), S(-84, 2, 'Liegestuhl an der Kaimauer', '🏖️'), S(BEACH_POS.x, BEACH_POS.z, 'Zurück zur Strandbar', '🍹')], done: 'Alle Stühle da. Bruno mixt dir einen Sonnenuntergang.' },
  { place: 'beach', id: 'sonne', who: 'Bruno', color: '#d56300', title: 'Sonnencreme-Station', time: 100, pay: 45, rep: 2,
    call: 'Ich will eine Gratis-Sonnencreme-Station am Strand. Der Checkpoint spendet Creme und Infoblätter. Holst du alles?',
    steps: [S(-34, -10, 'Creme und Infoblätter im Checkpoint', '🧴'), S(BEACH_POS.x, BEACH_POS.z, 'Zur Strandbar Sandbank', '🍹')], done: 'Bruno: „Lichtschutz 50 für alle. Sonnenbrand ist so 2010.“' },
  { place: 'beach', id: 'beachparty', who: 'Bruno', color: '#d56300', title: 'Queer Beach Party', time: 130, pay: 75, rep: 3, night: true, car: true,
    call: 'Beach Party heute Nacht! Novas Boxen stehen im Prisma, die Lichterketten im Studio. Ohne die wird das nix.',
    steps: [S(4, -10, 'Boxen im Club Prisma', '🔊'), S(-34, 20, 'Lichterketten im Studio', '💡'), S(BEACH_POS.x, BEACH_POS.z, 'Zur Strandbar Sandbank', '🎉')], done: 'Bass, Sand, Lichterketten. Die ganze Stadt tanzt barfuß.' },
];
export const placeGigs = (place: TreffGig['place']) => TREFF_GIGS.filter((g) => g.place === place);
/** Stammgast: alle Aufträge eines Ortes mindestens einmal geschafft */
export const regular = (s: SaveData, place: TreffGig['place']) => placeGigs(place).every((g) => s.flags['tg_' + g.id]);
/** nach einem Auftrag merken; liefert true, wenn man gerade Stammgast geworden ist */
export function treffDone(s: SaveData, g: TreffGig): boolean {
  const was = regular(s, g.place); s.flags['tg_' + g.id] = (Number(s.flags['tg_' + g.id]) || 0) + 1;
  const now = regular(s, g.place); if (now && !was) s.rep += 2;
  return now && !was;
}

/** Eintritt der Sauna (Stammgast frei) */
export const SAUNA_FEE = 12;
/** Sauna-Knigge und Gesundheit: echtes Wissen */
export const SAUNA_INFO: Array<[string, string]> = [
  ['Handtuch', 'Immer ein Handtuch unterlegen, sodass kein Schweiß aufs Holz kommt. Das ist Hygiene und Höflichkeit.'],
  ['Aufguss', 'Beim Aufguss wird nicht geredet und die Tür bleibt zu. Wer raus muss, geht in der Pause.'],
  ['Abkühlen', 'Nach dem Saunagang erst an die frische Luft, dann kalt abduschen, dann ruhen. Viel Wasser trinken.'],
  ['Gesundheit', 'Mit Fieber, nach Alkohol oder bei Herzproblemen lieber nicht in die Sauna. Im Zweifel ärztlich fragen.'],
  ['Geschichte', 'Schwule Saunen waren über Jahrzehnte geschützte Treffpunkte, als Männer sich anderswo nicht zeigen konnten. In der Aids-Krise wurden sie wichtige Orte für Aufklärung über Safer Sex.'],
  ['Zustimmung', 'Auch hier gilt: Nur Ja heißt Ja. Blicke sind keine Einladung, ein Nein ist ein Nein.'],
];
/** Sonne und Strand: echtes Wissen für die Strandbar */
export const BEACH_INFO: Array<[string, string]> = [
  ['UV-Index', 'Ab UV-Index 3 braucht die Haut Schutz: Sonnencreme, Hut, Schatten. Mittags zwischen 11 und 15 Uhr ist die Sonne am stärksten.'],
  ['Nachcremen', 'Nach dem Baden und alle zwei Stunden nachcremen. Nachcremen verlängert den Schutz nicht, es erhält ihn nur.'],
  ['Trinken', 'Alkohol in der Sonne trocknet aus. Zu jedem Cocktail ein Glas Wasser.'],
  ['Queere Strände', 'Viele Städte haben queere Strandabschnitte mit langer Tradition, zum Beispiel am Playa del Inglés auf Gran Canaria.'],
];
