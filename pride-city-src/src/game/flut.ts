/* Akt IV „Die graue Flut“: Nach der Pride der Inseln schlägt der Hass zurück. Der Ordnungsbund (graue Jacken) beschmiert
   die Hauptstraße, greift Leute an und wirft Steine auf eine Zuflucht für junge Queers. Dahinter steckt Viktor Kral, Besitzer
   des Club Monolith auf der Hafeninsel Rostwerk, der das queere Nachtleben aus der Stadt drängen will.
   Ernster als die Akte davor: Anfeindungen, Schlägereien, Verfolgungsjagden (Brawl.ts), aber ohne Blut und ohne Hass zu
   feiern. Du stehst dagegen, mit der ganzen Community, und am Ende landet Kral bei der Polizei, nicht im Grab.
   Alle Figuren, Gruppen und Orte sind eigene Erfindungen von Pride City. */
import type { SaveData } from '../engine/Save';
import type { Line } from '../ui/ui';
import type { NpcDef, StoryCtx, Goal } from './story';
import type { Mission } from './saga';
import type { GigStep } from './gigs';
import { isNight } from './saga';
import { worldStage, isleXZ } from './worlds';
import { history, ACTS } from './faden';

const MON = isleXZ('rostwerk', -14, -26.5), MOEWE = isleXZ('zuflucht', -19, 27.5);
export const FLUT_NPCS: NpcDef[] = [
  { id: 'tom', name: 'Tom Wierzbicki', pron: 'er/ihn', color: '#ff7a1a', look: { body: 'Man', rb: 'Male_Adult_08', palette: 'rainbow', skin: 1, hair: 0 }, x: -80, z: -9, yaw: Math.PI / 2 },
  { id: 'kral', name: 'Viktor Kral', pron: 'er/ihn', color: '#cfd6e0', look: { body: 'Man', rb: 'Male_Adult_02', palette: 'rainbow', skin: 0, hair: 0 }, x: MON[0], z: MON[1], yaw: Math.PI },
];
const T = FLUT_NPCS[0], K = FLUT_NPCS[1];
const L = (n: NpcDef, text: Line['text'], choices?: Line['choices']): Line => ({ who: n.name, pron: n.pron, color: n.color, text, choices });
const O = (who: string, color: string, text: string): Line => ({ who, color, text });
const S = (x: number, z: number, label: string, icon = '📍'): GigStep => ({ x, z, label, icon });
const SANDER = (text: string) => O('Kommissarin Sander', '#5b86d6', text);
const AYLA = (text: string) => O('Ayla Demir', '#3ddc97', text);

/** Ringstraße von Rostwerk (Inselkoordinaten → Stadt), n Runden; Start vor dem Monolith */
const ring = (n: number) => {
  const out: Array<[number, number]> = [isleXZ('rostwerk', -14, -12)];
  for (let i = 0; i < n; i++) for (const [x, z] of [[-20, -10], [-20, 20], [20, 20], [20, -10]]) out.push(isleXZ('rostwerk', x, z));
  return out;
};

/** Missionen; Stationen werden je Start frisch gebaut (Schlägerei und Verfolgung verändern sie unterwegs) */
interface FlutMission extends Omit<Mission, 'steps' | 'giver'> { giver: 'tom' | 'kral' | 'ayla'; steps: () => GigStep[] }
export const FLUT: FlutMission[] = [
  { id: 'farbe', title: 'Farbe gegen Grau', giver: 'tom', pay: 220, rep: 5, time: 260, hint: 'Tom Wierzbicki wartet am Kai im Hafen.',
    intro: (s) => [
      L(T, `${s.name}, richtig? Tom. Ich habe eine Werkstatt drüben auf Rostwerk, der Hafeninsel hinter Glitzeria.`),
      L(T, 'Heute Nacht haben sie die halbe Hauptstraße beschmiert. Graue Farbe, überall dieselbe Parole. Ich lese sie dir nicht vor, du kennst sie.'),
      L(T, 'Lady Luma hat Farbe besorgt, Regenbogen in Eimern. Hol sie an der One Love Bar und mal mit mir drüber: am Café und am Regenbogenhaus.'),
      L(T, 'Und wenn die zurückkommen: Nicht weglaufen. Stehen bleiben. Wir sind mehr.')],
    steps: () => [S(33.4, 20, 'Farbe bei Lady Luma an der One Love Bar', '🎨'), S(4.6, 12.6, 'Schmiererei am Café Kaffeeklatsch übermalen', '🖌️'), S(-4.6, -12.6, 'Schmiererei am Regenbogenhaus übermalen', '🖌️'),
      { x: -4.6, z: -12.6, label: 'Drei graue Jacken kommen zurück. Stell dich ihnen!', icon: '👊', fight: ['Ralf', 'Sven', 'Udo'] }],
    outro: () => [
      O('Jules', '#9c59d1', 'Sie sind weg. Und die Wand ist bunter als vorher. Danke, dass du geblieben bist.'),
      SANDER('Kommissarin Sander, Staatsschutz. Ich habe alles gesehen: Die haben angefangen, ihr habt euch gewehrt. So steht es im Bericht.'),
      SANDER('Graue Jacken, Abzeichen mit einer Faust. Sie nennen sich Ordnungsbund. Seit ein paar Wochen sehen wir die überall.'),
      L(T, 'Die kommen von Rostwerk. Seit Viktor Kral dort seinen Club Monolith aufgemacht hat, werden die jeden Tag mutiger.')] },
  { id: 'jagd', title: 'Jagd durch die Nacht', giver: 'tom', pay: 280, rep: 6, time: 320, night: true, car: true, hint: 'Tom wartet ab 21 Uhr am Kai.',
    intro: () => [
      L(T, 'Schlechte Nachrichten. An der Laternenmeile in der Hochstadt wurden zwei Männer angegriffen, weil sie Hand in Hand gegangen sind.'),
      L(T, 'Jonas und Emre aus Lindenhof. Du kennst die beiden. Ein Krankenwagen ist unterwegs, ihnen geht es den Umständen entsprechend.'),
      L(T, 'Die Täter fahren noch Streife, in einem grauen Wagen. Nimm ein Auto. Wir halten sie fest, bis Kommissarin Sander da ist.')],
    steps: () => [S(105, -21, 'Zu Jonas und Emre an der Laternenmeile', '🩹'),
      { x: 105, z: -21, label: 'Der graue Wagen! Bleib dran!', icon: '🚨', chase: { car: 'car_sedan' } },
      { x: 0, z: 0, label: 'Die drei steigen aus. Halt sie fest!', icon: '👊', fight: ['Fahrer Kai', 'Mirko', 'Olaf'] }],
    outro: () => [
      SANDER('Festgenommen, alle drei. Und im Kofferraum: Kisten mit Flugblättern vom Ordnungsbund, frisch gedruckt.'),
      SANDER('Bezahlt hat die Druckerei eine Firma namens Monolith Nightlife. Das ist Viktor Krals Firma.'),
      O('Jonas', '#5ce1ff', 'Emre hat ein blaues Auge und sagt, er sieht damit verwegen aus. Morgen gehen wir wieder Hand in Hand. Jetzt erst recht.'),
      L(T, 'Komm nach Rostwerk. Über Glitzeria und dann die Brücke nach Süden. Bevor wir uns Kral vornehmen, muss ich meine Insel zusammenhalten.')] },
  { id: 'monolith', title: 'Der Mann im Monolith', giver: 'kral', pay: 340, rep: 7, time: 480, night: true, hint: 'Viktor Kral steht ab 21 Uhr vor dem Club Monolith auf Rostwerk.',
    intro: (s) => [
      L(K, `Ah. ${s.name}. Das Gesicht der Pride. Viktor Kral. Setzen Sie sich nicht, es dauert nicht lange.`),
      L(K, 'Ich mache Nachtleben für normale Leute. Ohne Glitzer, ohne Fahnen, ohne Theater. Die Stadt will das. Sie traut sich nur nicht, es laut zu sagen.'),
      L(K, 'Verkaufen Sie mir Ihren Club. Ich zahle gut. Und Ihre Freunde hätten endlich Ruhe vor diesen Herren in Grau. Ich habe da einen gewissen Einfluss.'),
      O('Du', '#ff4fa3', 'Niemals. Und Ihre Herren in Grau kenne ich schon.'),
      L(K, 'Schade. Dann eben anders. Bodo? Begleite unseren Gast zum Ausgang.')],
    steps: () => [{ x: MON[0], z: MON[1] + (MON[1] > 121 ? -3 : 3), label: 'Krals Türsteher kommen raus. Wehr dich!', icon: '👊', fight: ['Türsteher Bodo', 'Jens', 'Patrick', 'Marvin'] },
      { x: MON[0], z: MON[1], label: 'Marvin rennt mit der Spenderliste davon! Hinterher!', icon: '📋', chase: { path: ring(3) } },
      S(5.6, -17, 'Bring die Liste zu Kommissarin Sander an der Polizeiwache', '🚓')],
    outro: () => [
      SANDER('Namen, Beträge, Daten. Kral finanziert den Ordnungsbund seit Monaten. Das reicht für eine Durchsuchung.'),
      SANDER('Aber er hat teure Anwälte. Bis das durch ist, vergehen Wochen. Passt auf euch auf.'),
      L(T, 'Wochen haben wir nicht. Gül hat gehört, dass der Ordnungsbund nach Kap Zuflucht will. Da ist Haus Möwe, eine Zuflucht für junge Leute.'),
      AYLA('Hier ist Ayla vom Haus Möwe. Tom hat mir deine Nummer gegeben. Gestern flogen Steine durch unser Fenster. Kannst du kommen? Hinter Rostwerk, die Brücke nach Süden.')] },
  { id: 'moewe', title: 'Die Nacht vor Haus Möwe', giver: 'ayla', pay: 380, rep: 8, time: 520, night: true, car: true, hint: 'Ayla ruft nachts an, sobald Kap Zuflucht wieder steht.',
    intro: () => [],
    steps: () => [S(MOEWE[0], MOEWE[1], 'Zum Haus Möwe auf Kap Zuflucht', '🏠'),
      { x: MOEWE[0], z: MOEWE[1], label: 'Stell dich vor die Tür. Lass niemanden rein!', icon: '👊', fight: ['Dennis Haller', 'Kurt', 'Lars', 'Timo', 'Holger'] }],
    outro: () => [
      AYLA('Schau. Das ganze Dorf ist da. Jannes mit der Taschenlampe, Frieda mit dem Nudelholz, die Kids stehen hinter dem Fenster und filmen alles.'),
      O('Rafi', '#5bcefa', 'Ihr wolltet, dass wir Angst haben. Wir haben Nachbarn.'),
      O('Dennis Haller', '#8a8f99', 'Ich sage nichts. Ich sage nur: Kral zahlt. Kral hat immer gezahlt. Ohne ihn hätten wir nicht mal Jacken.'),
      SANDER('Das war ein Geständnis vor zwanzig Zeugen. Danke. Morgen holen wir Kral, er weiß es nur noch nicht.'),
      L(T, 'Er weiß es. Er wird abhauen wollen. Komm morgen Nacht an den Kai, ich habe eine Idee. Eine sehr helle.')] },
  { id: 'lichter', title: 'Die Lichterkette', giver: 'tom', pay: 600, rep: 12, time: 640, night: true, car: true, hint: 'Tom wartet ab 21 Uhr am Kai. Heute Nacht holt ihr Kral.',
    intro: () => [
      L(T, 'Kral packt seine Koffer. Heute Nacht will er von Rostwerk verschwinden, über die Brücke und dann weg.'),
      L(T, 'Wir sperren die Brücke. Nicht mit Fäusten, mit Kerzen. Eine Lichterkette von Rainbow City bis Rostwerk, so viele Leute, dass kein Wagen durchkommt.'),
      L(T, 'Hol Lady Luma und Mama Vega an der One Love Bar und Rocco an der Skybar. Wenn die drei rufen, kommt die ganze Stadt.')],
    steps: () => [S(33.4, 20, 'Hol Lady Luma und Mama Vega an der One Love Bar', '🕯️'), S(133, 4.3, 'Hol Rocco Sterling an der Skybar', '🕯️'),
      S(MON[0], MON[1] + (MON[1] > 121 ? -8 : 8), 'Zum Monolith: Die Lichterkette steht', '🕯️'),
      { x: MON[0], z: MON[1], label: 'Kral flieht im Wagen! Die Lichterkette sperrt die Brücke. Stell ihn!', icon: '🚨', chase: { car: 'k:suv_luxury', path: ring(3), trap: true } },
      { x: 0, z: 0, label: 'Krals Leibwächter steigen aus!', icon: '👊', fight: ['Leibwächter Igor', 'Leibwächter Sascha'] }],
    outro: (s) => [
      SANDER('Viktor Kral, Sie sind festgenommen. Bildung einer kriminellen Vereinigung, Anstiftung zu gefährlicher Körperverletzung. Den Rest erzählen Sie dem Gericht.'),
      O('Viktor Kral', K.color, 'Ihr glaubt, ihr habt gewonnen? Es wird immer Leute wie mich geben.'),
      O('Mama Vega', '#ff3fb0', 'Und es wird immer mehr Leute wie uns geben, Schätzchen. Schau dich um.'),
      O('Rocco Sterling', '#ffcf5a', 'Tausend Kerzen auf einer Brücke. Dreißig Jahre Nachtleben, und so etwas habe ich noch nie gesehen.'),
      L(T, `Der Monolith steht ab morgen leer. Gül und Hein wollen daraus ein Jugendzentrum machen. Mit Boxclub. Und mit Regenbogenfahne, ${s.name}. Aus Stahl.`)] },
];

export const flutDone = (s: SaveData) => Math.min(FLUT.length, Number(s.flags.flut) || 0);
/** Akt IV läuft: nach der Pride der Inseln, bis Kral festgenommen ist */
export const flutOn = (s: SaveData) => !!s.flags.fadenEnd && !s.flags.flutEnd;
const next = (s: SaveData) => (flutOn(s) && s.flags.flutCall ? FLUT[flutDone(s)] || null : null);
/** Insel, die vor der nächsten Mission dran ist */
const needIsle = (s: SaveData) => { const n = flutDone(s); return n === 2 && worldStage(s.flags, 'rostwerk') < 4 ? 'rostwerk' : n === 3 && worldStage(s.flags, 'zuflucht') < 4 ? 'zuflucht' : ''; };

export const flutHidden = (s: SaveData, id: string) => (id === 'tom' && !s.flags.fadenEnd) || (id === 'kral' && (!s.flags.fadenEnd || flutDone(s) >= 3));

export function flutGoal(s: SaveData): Goal | null {
  if (!flutOn(s) || !s.flags.flutCall) return null;
  const n = flutDone(s), m = next(s), head = `Die graue Flut ${Math.min(n + 1, FLUT.length)}/${FLUT.length}`;
  const isle = needIsle(s);
  if (isle === 'rostwerk') return { title: `${head}: Insel 🏗️ Rostwerk`, sub: `Tom wartet auf dem Platz von Rostwerk (Stand ${worldStage(s.flags, isle)}/4). Über Glitzeria und dann die Brücke nach Süden.`, isle };
  if (isle === 'zuflucht') return { title: `${head}: Insel ⚓ Kap Zuflucht`, sub: `Ayla wartet vor Haus Möwe (Stand ${worldStage(s.flags, isle)}/4). Hinter Rostwerk die Brücke nach Süden.`, isle };
  if (!m) return null;
  if (m.giver === 'ayla') return { title: `${head}: ${m.title}`, sub: 'Ayla fürchtet, dass sie nachts wiederkommen. Halt ab 21 Uhr dein Handy bereit.' };
  return { title: `${head}: ${m.title}`, sub: m.hint, npc: m.giver };
}
export const flutMarks = (s: SaveData): Array<[string, string]> => { const m = next(s); return m && !needIsle(s) && m.giver !== 'ayla' ? [[m.giver, m.giver === 'kral' ? '🖤' : '✊']] : []; };

/** Mission starten (aus Gespräch oder Anruf) */
function start(c: StoryCtx, m: FlutMission) {
  const s = c.s;
  s.flags.flutRun = m.id;
  c.mission({ id: 'flut_' + m.id, who: m.giver === 'kral' ? 'Kommissarin Sander' : m.giver === 'ayla' ? 'Ayla Demir' : T.name, color: m.giver === 'ayla' ? '#3ddc97' : T.color, title: `✊ ${m.title}`, call: '', steps: m.steps(), time: m.time, pay: m.pay, rep: m.rep, car: m.car, done: 'Zusammen sind wir mehr!',
    after: () => {
      delete s.flags.flutRun; s.flags.flut = flutDone(s) + 1;
      const last = flutDone(s) >= FLUT.length;
      c.say(m.outro(s), () => {
        if (!last) { const nx = FLUT[flutDone(s)]; c.toast(`✊ Als Nächstes: ${needIsle(s) === 'rostwerk' ? 'Rostwerk' : nx.title}`); return; }
        s.flags.flutEnd = s.day;
        c.reward(400, 20, 'Die graue Flut');
        c.card('Akt IV abgeschlossen', 'Die graue Flut', 'Viktor Kral ist festgenommen, der Ordnungsbund zerschlagen. Rostwerk und Kap Zuflucht gehören allen. Hass kommt wieder, aber ihr wisst jetzt, wie man zusammensteht.').then(() => history(s, 'flut', c.card));
      });
    },
    failed: () => { delete s.flags.flutRun; c.toast(`${T.name}: „Kopf hoch. Wir versuchen es noch einmal, zusammen.“`); } });
}

/** Gespräch mit Tom oder Kral – true, wenn Akt IV es übernommen hat */
export function flutTalk(c: StoryCtx, id: string): boolean {
  if (id !== 'tom' && id !== 'kral') return false;
  const s = c.s, n = id === 'tom' ? T : K, m = next(s);
  if (!flutOn(s)) { c.say([L(n, id === 'tom' ? (s.flags.flutEnd ? 'Der Monolith wird gerade umgebaut. Komm mal rüber, die Kids haben schon einen Boxring.' : 'Schöne Pride, oder? Genieß es. Ich habe so ein Gefühl, dass nicht alle mitgefeiert haben.') : 'Kein Kommentar.')]); return true; }
  if (!m || m.giver !== id || s.flags.flutRun || needIsle(s)) {
    c.say([L(n, s.flags.flutRun ? 'Du bist unterwegs. Folg der Lichtsäule, ich bin direkt hinter dir.'
      : id === 'kral' ? 'Sie schon wieder. Ich habe Ihnen nichts mehr zu sagen. Noch nicht.'
      : needIsle(s) === 'rostwerk' ? 'Wir sehen uns auf Rostwerk. Über Glitzeria und dann nach Süden über die Brücke.'
      : needIsle(s) === 'zuflucht' ? 'Ayla braucht dich auf Kap Zuflucht. Hinter Rostwerk, die Brücke nach Süden.'
      : m?.giver === 'ayla' ? 'Halt dein Handy bereit. Wenn Ayla anruft, fahren wir.' : 'Halt die Augen offen. Die grauen Jacken schlafen nicht.')]);
    return true;
  }
  if (m.night && !isNight(c.hour())) {
    c.say([L(n, id === 'kral' ? 'Ich empfange nur nachts. Ab 21 Uhr.' : 'Das machen wir im Dunkeln, da sind sie unterwegs. Komm nach 21 Uhr wieder.', [
      { label: 'Bis 21 Uhr warten', fn: () => c.skipToHour(21) }, { label: 'Später', fn: () => {} }])]);
    return true;
  }
  const lines = m.intro(s);
  lines.push(L(id === 'kral' ? T : n, id === 'kral' ? '📞 Tom: „Ich habe alles mitgehört. Wehr dich, ich rufe Sander!“' : m.car ? 'Bereit? Mit einem Wagen bist du schneller.' : 'Bereit?', [{ label: `Los geht’s (${m.pay} €)`, fn: () => start(c, m) }, { label: 'Noch nicht', fn: () => {} }]));
  c.say(lines);
  return true;
}

const call = (who: string, color: string, text: string[]): Line[] => text.map((t) => ({ who: `📞 ${who}`, color, text: t }));
let calm = 0, later = 0;
/** der rote Faden hat gerade angerufen: Akt IV wartet wieder ein paar ruhige Sekunden */
export const flutHush = () => { calm = 0; };

/** Anrufe in Akt IV – aus storyTick, also nur, wenn nichts anderes läuft */
export function flutTick(c: StoryCtx) {
  const s = c.s, f = s.flags;
  if (!flutOn(s) || f.flutRun) { calm = 0; return; }
  if (++calm < 8) return;
  // Auftakt: Mo ruft am Morgen nach der Pride der Inseln an
  if (!f.flutCall) {
    calm = 0; f.flutCall = true;
    c.phone(call('Mo', '#ff7a3d', [
      'Hast du es schon gesehen? Über Nacht haben sie die Hauptstraße beschmiert. Das Café, das Regenbogenhaus, die One Love Bar. Graue Farbe, hässliche Worte.',
      'Hilde hat geweint. Hilde weint nie. Ein Mann vom Hafen hat geholfen, die Leute zu beruhigen. Tom heißt er. Er wartet am Kai auf dich.',
    ]), () => c.card('Akt IV', ACTS[3].title, ACTS[3].text).then(() => history(s, 'a4', c.card)));
    return;
  }
  const n = flutDone(s);
  // Rostwerk steht wieder: Kral meldet sich selbst
  if (n === 2 && worldStage(f, 'rostwerk') >= 4 && !f.kralCall) {
    calm = 0; f.kralCall = true;
    c.phone(call('Viktor Kral', K.color, [
      'Guten Abend. Viktor Kral. Sie haben meinen Hafen bunt angemalt, wie ich höre. Mit Fahne. Und Hafenfest.',
      'Kommen Sie heute Nacht in den Monolith. Wir sollten reden. Unter Geschäftsleuten.',
    ]));
    return;
  }
  // Haus Möwe: Ayla ruft nachts an, wenn sie wiederkommen
  const m = FLUT[n];
  if (m?.giver === 'ayla' && !needIsle(s) && isNight(c.hour())) {
    if (later > 0) { later--; return; }
    calm = 0;
    c.phone(call('Ayla Demir', '#3ddc97', [
      'Sie sind da. Unten am Strand, mit Taschenlampen und Fahnen. Mindestens fünf. Die Kids sind oben im Dachzimmer.',
      'Jannes ist unterwegs, aber er braucht noch. Bitte komm. Bitte.',
    ]), () => c.say([{ who: 'Ayla Demir', color: '#3ddc97', text: 'Kommst du?', choices: [
      { label: '✊ Ich komme!', fn: () => start(c, m) },
      { label: 'Gleich (ruft wieder an)', fn: () => { later = 60; } }] }]));
  }
}

