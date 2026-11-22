/* Akt V „Die Lichterkette“: Kral sitzt, aber Dennis Haller ist auf Kaution draußen und sammelt die Reste des Ordnungsbunds.
   Tom gründet mit dir eine eigene Crew, die Lichterkette: Freund*innen aus der Stadt, die nachts zusammen Streife gehen,
   bei Schlägereien mit anpacken (Brawl.ts) und die Viertel schützen. Haller schlägt mit einer falschen Anzeige zurück,
   du wirst gesucht (Fahndung, Verstecke, Umlackieren bei Rosi, flucht.ts) und musst untertauchen, bis die Wahrheit raus ist.
   Kein Blut, niemand stirbt, Hass wird nicht gefeiert. Alle Figuren und Gruppen sind eigene Erfindungen von Pride City. */
import type { SaveData } from '../engine/Save';
import type { Line } from '../ui/ui';
import type { StoryCtx, Goal } from './story';
import type { Gig, GigStep } from './gigs';
import { isNight } from './saga';
import { isleXZ } from './worlds';
import { history } from './faden';

/** Was jemand der Crew kann */
export type Skill = 'schrauber' | 'faust' | 'funk' | 'fahrer' | 'recht' | 'kiez';
export const SKILLS: Record<Skill, { icon: string; name: string; text: string }> = {
  schrauber: { icon: '🔧', name: 'Schrauber', text: 'Umlackieren bei Rosi zum halben Preis' },
  faust: { icon: '👊', name: 'Kämpft mit', text: 'Steht dir bei Schlägereien zur Seite' },
  funk: { icon: '📻', name: 'Polizeifunk', text: 'Fahndung abhängen geht schneller' },
  fahrer: { icon: '🚗', name: 'Fluchtfahrer', text: 'Streifenwagen und Fluchtwagen fahren langsamer' },
  recht: { icon: '⚖️', name: 'Rechtshilfe', text: 'Bußgelder nach einer Festnahme halbiert' },
  kiez: { icon: '🏘️', name: 'Kiez-Netzwerk', text: 'Mehr Geld aus der Kiezkasse, Crew allein schützt besser' },
};

/** Wer in die Crew kann (Figuren aus story.ts); need = Ruf, ab dem sie mitmachen */
export const CREW: Array<{ id: string; name: string; skill: Skill; need: number; pitch: string; yes: string; no: string }> = [
  { id: 'tom', name: 'Tom Wierzbicki', skill: 'schrauber', need: 0, pitch: '', yes: '', no: '' },
  { id: 'bruno', name: 'Bruno', skill: 'faust', need: 20, pitch: 'Eine Crew, die nachts aufpasst? Ich habe Schultern wie ein Kühlschrank und ein weiches Herz. Beides kannst du haben.', yes: 'Dann bin ich dabei. Und wer an der Strandbar Ärger macht, kriegt erst ein Bier und dann eine Ansage.', no: 'Lass uns erst ein paar Mal grillen. Ich will wissen, mit wem ich nachts unterwegs bin.' },
  { id: 'jules', name: 'Jules', skill: 'kiez', need: 15, pitch: 'Das Regenbogenhaus kennt jede Hausmeisterin, jeden Späti und jede Oma mit Fernglas. Wenn du eine Crew willst, brauchst du ein Netzwerk.', yes: 'Ich mache eine Telefonkette. Wenn irgendwo graue Jacken auftauchen, wissen wir es in fünf Minuten.', no: 'Zeig erst ein bisschen mehr Gesicht im Kiez. Dann hören die Leute auch auf dich.' },
  { id: 'kim', name: 'Kim', skill: 'funk', need: 25, pitch: 'Ich habe ein altes Funkgerät und zu viel Zeit. Ich höre, wo die Streifen gerade hinfahren. Ganz legal, nur zuhören.', yes: 'Deal. Wenn sie dich suchen, sage ich dir, wo sie nicht sind.', no: 'Hm. Ich kenne dich noch nicht gut genug. Hilf erst ein bisschen im Kiez mit.' },
  { id: 'rex', name: 'Rex', skill: 'fahrer', need: 35, pitch: 'Du brauchst jemanden, der fährt, wenn es eng wird? Ich bin früher Kurier gefahren. Ich kenne jede Abkürzung in dieser Stadt.', yes: 'Gut. Ich fahre, du redest. Und wehe, jemand fasst mein Lenkrad an.', no: 'Mach dir erst einen Namen. Ich fahre nicht für jede Person.' },
  { id: 'lena', name: 'Lena', skill: 'recht', need: 30, pitch: 'Ich studiere Jura und mache Rechtsberatung im Regenbogenhaus. Wenn sie dich festnehmen, rede ich. Laut.', yes: 'Abgemacht. Und denk dran: Ohne Anwältin sagst du gar nichts.', no: 'Ich helfe gern, aber erst, wenn ich sehe, dass du es ernst meinst.' },
  { id: 'sam', name: 'Sam', skill: 'faust', need: 40, pitch: 'Ich bin Sanitäter und habe Kickboxen gemacht. Ich hoffe, ich brauche nur das Erste. Aber ich kann beides.', yes: 'Ich bin da. Und wenn jemand fällt, egal von welcher Seite, kümmere ich mich.', no: 'Frag mich noch mal, wenn wir uns besser kennen.' },
  { id: 'tariq', name: 'Tariq', skill: 'faust', need: 50, pitch: 'Ich stehe jede Nacht im Späti und sehe, wer vorbeikommt. Wenn die Grauen wieder zuschlagen, will ich nicht nur zusehen.', yes: 'Bin dabei. Nach Feierabend gehört die Nacht uns.', no: 'Komm wieder, wenn du ein bisschen bekannter bist. Dann kommen auch andere mit.' },
];
const memberDef = (id: string) => CREW.find((c) => c.id === id);
/** Mitglieder der Crew */
export const crewOf = (s: SaveData) => CREW.filter((c) => s.flags['crew_' + c.id]);
export const inCrew = (s: SaveData, id: string) => !!s.flags['crew_' + id];
export const crewHas = (s: SaveData, k: Skill) => crewOf(s).some((c) => c.skill === k);
/** Wer bei Schlägereien mitkämpft (höchstens drei) */
export const crewFighters = (s: SaveData) => crewOf(s).filter((c) => c.skill === 'faust').slice(0, 3);

/** Viertel, die die Crew schützt. Schutz 0–3 in flags vt_<id>. */
const MON = isleXZ('rostwerk', -14, -12), MOEWE = isleXZ('zuflucht', -19, 27.5);
export const VIERTEL: Array<{ id: string; name: string; icon: string; x: number; z: number }> = [
  { id: 'plaza', name: 'Pride Plaza', icon: '🏳️‍🌈', x: -15, z: 22 },
  { id: 'park', name: 'Regenbogenpark', icon: '🌳', x: 40, z: 40 },
  { id: 'hafen', name: 'Hafen und Kai', icon: '⚓', x: -78, z: -9 },
  { id: 'meile', name: 'Laternenmeile', icon: '🏮', x: 105, z: -21 },
  { id: 'rostwerk', name: 'Rostwerk', icon: '🏗️', x: MON[0], z: MON[1] },
  { id: 'zuflucht', name: 'Kap Zuflucht', icon: '🏠', x: MOEWE[0], z: MOEWE[1] },
];
export const schutz = (s: SaveData, id: string) => Math.max(0, Math.min(3, Number(s.flags['vt_' + id]) || 0));
const setSchutz = (s: SaveData, id: string, v: number) => { s.flags['vt_' + id] = Math.max(0, Math.min(3, v)); };
export const allSafe = (s: SaveData) => VIERTEL.every((v) => schutz(s, v.id) > 0);
/** Kiezkasse: Geschützte Viertel legen jeden Morgen zusammen */
export const kiezKasse = (s: SaveData) => Math.round(VIERTEL.reduce((a, v) => a + schutz(s, v.id), 0) * 15 * (crewHas(s, 'kiez') ? 1.5 : 1));
/** einmal am Tag auszahlen; liefert den Betrag (0 = heute schon) */
export function payKasse(s: SaveData) {
  if (!s.flags.crewWatch || s.flags.kasseDay === s.day) return 0;
  s.flags.kasseDay = s.day;
  const n = kiezKasse(s); s.money += n; return n;
}
/** Chance, dass die Crew allein ein Viertel hält */
export const crewOdds = (s: SaveData) => Math.min(.9, .3 + crewFighters(s).length * .14 + (crewHas(s, 'kiez') ? .1 : 0) + crewOf(s).length * .02);

/** Akt V läuft (nach Akt IV, bis Haller gefasst ist) */
export const crewOn = (s: SaveData) => !!s.flags.flutEnd && !s.flags.crewEnd;
/** Fortschritt in Akt V: 0 Gründung, 1 Verdacht, 2 Video, 3 Revier, 4 alle Viertel, 5 Haller */
export const crewStep = (s: SaveData) => Number(s.flags.crew) || 0;
export const CREW_STEPS = 6;
const NEED = 3;
const recruits = (s: SaveData) => crewOf(s).filter((c) => c.id !== 'tom').length;

const TOM = { name: 'Tom Wierzbicki', pron: 'er/ihn', color: '#ff7a1a' };
const T = (text: Line['text'], choices?: Line['choices']): Line => ({ who: TOM.name, pron: TOM.pron, color: TOM.color, text, choices });
const O = (who: string, color: string, text: string): Line => ({ who, color, text });
const SANDER = (text: string) => O('Kommissarin Sander', '#5b86d6', text);
const KIM = (text: string) => O('Kim', '#3da542', text);
const S = (x: number, z: number, label: string, icon = '📍'): GigStep => ({ x, z, label, icon });
const call = (who: string, color: string, text: string[]): Line[] => text.map((t) => ({ who: `📞 ${who}`, color, text: t }));
const GRAU = ['Kurt', 'Lars', 'Timo', 'Holger', 'Ralf', 'Sven', 'Udo', 'Mirko', 'Olaf', 'Jens', 'Patrick'];
const pickNames = (n: number) => { const a = GRAU.slice().sort(() => Math.random() - .5); return a.slice(0, n); };

/** Ziel im Story-Feld */
export function crewGoal(s: SaveData): Goal | null {
  if (!crewOn(s) || !s.flags.crewCall) return null;
  const n = crewStep(s), head = `Die Lichterkette ${Math.min(n + 1, CREW_STEPS)}/${CREW_STEPS}`;
  if (s.flags.crewRun) return { title: `${head}: Mission läuft`, sub: 'Folg der Lichtsäule.' };
  switch (n) {
    case 0: return { title: `${head}: Hol Leute in die Crew (${recruits(s)}/${NEED})`, sub: 'Sprich Bruno, Jules, Kim, Rex, Lena, Sam oder Tariq an. Wer genug von dir gehört hat (Ruf), macht mit.', npc: CREW.find((c) => c.id !== 'tom' && !inCrew(s, c.id) && s.rep >= c.need)?.id };
    case 1: return { title: `${head}: Häng die Polizei ab`, sub: 'Haller hat dich angezeigt. Zu Fuß: in ein 🫥 Versteck (Radar). Im Auto: bei Rosi in der Hochstadt 🎨 umlackieren lassen.' };
    case 2: return { title: `${head}: Das Video`, sub: 'Kim hat eine Zeugin gefunden. Kims Anruf startet die Mission.' };
    case 3: return { title: `${head}: Revierwache`, sub: 'Tom wartet am Kai. Ab 21 Uhr gehen wir zusammen Streife.', npc: 'tom' };
    case 4: { const left = VIERTEL.filter((v) => !schutz(s, v.id)); return { title: `${head}: Schütze alle Viertel (${VIERTEL.length - left.length}/${VIERTEL.length})`, sub: `Handy → ✊ Crew → Streife gehen. Noch offen: ${left.map((v) => v.name).join(', ')}.` }; }
    case 5: return { title: `${head}: Hallers letzte Fahrt`, sub: 'Tom wartet nachts am Kai. Heute holt ihr Haller.', npc: 'tom' };
  }
  return null;
}
export const crewMarks = (s: SaveData): Array<[string, string]> => {
  if (!crewOn(s) || !s.flags.crewCall || s.flags.crewRun) return [];
  const n = crewStep(s);
  if (n === 0) return CREW.filter((c) => c.id !== 'tom' && !inCrew(s, c.id) && s.rep >= c.need).map((c) => [c.id, '✊'] as [string, string]);
  return n === 3 || n === 5 ? [['tom', '✊']] : [];
};

/** Mission der Crew starten (Story-Mission oder Streife) */
function run(c: StoryCtx, g: Omit<Gig, 'after' | 'failed'>, after: () => void, failed?: () => void) {
  const s = c.s; s.flags.crewRun = g.id;
  c.mission({ ...g, after: () => { delete s.flags.crewRun; after(); }, failed: () => { delete s.flags.crewRun; failed?.(); } });
}

/** Streife in einem Viertel (Handy oder Anruf): hinfahren, die Grauen vertreiben, Schutz +1 */
export function patrol(c: StoryCtx, id: string, alarm = false) {
  const s = c.s, v = VIERTEL.find((q) => q.id === id); if (!v) return;
  const n = 2 + Math.floor(Math.random() * 2) + (schutz(s, id) ? 0 : 1);
  run(c, { id: 'crew_' + id, who: 'Die Lichterkette', color: TOM.color, title: `✊ Streife: ${v.name}`, call: '', time: 260, pay: 60, rep: 2, car: true, done: `${v.name} ist sicher.`,
    steps: [S(v.x, v.z, `Zur Streife: ${v.icon} ${v.name}`, '✊'), { x: v.x, z: v.z, label: alarm ? 'Graue Jacken pöbeln Leute an. Stell dich ihnen!' : 'Ein paar graue Jacken lungern herum. Zeig ihnen, dass hier aufgepasst wird!', icon: '👊', fight: pickNames(n) }] },
  () => {
    setSchutz(s, id, schutz(s, id) + 1);
    c.toast(`✊ ${v.name}: Schutz ${'★'.repeat(schutz(s, id))}${'☆'.repeat(3 - schutz(s, id))}`);
    if (crewStep(s) === 4 && allSafe(s)) { s.flags.crew = 5; setTimeout(() => c.phone(call(TOM.name, TOM.color, ['Alle Viertel stehen. Die Leute grüßen uns auf der Straße. Haller tobt, sagt Kim.', 'Er räumt heute Nacht sein Lager am Hafen aus und will verschwinden. Komm nach 21 Uhr an den Kai. Wir holen ihn.'])), 2500); }
  }, () => { setSchutz(s, id, schutz(s, id) - 1); c.toast(`${v.name}: Die Grauen haben sich breitgemacht. Versuch es noch einmal.`); });
}

/** Crew allein losschicken: Ergebnis nach ein paar Sekunden */
export function sendCrew(c: StoryCtx, id: string) {
  const s = c.s, v = VIERTEL.find((q) => q.id === id)!, ok = Math.random() < crewOdds(s);
  c.toast(`📣 Die Lichterkette ist unterwegs nach ${v.name} …`);
  setTimeout(() => {
    if (ok) { setSchutz(s, id, schutz(s, id) + 1); c.reward(0, 1, `✊ Die Crew hat ${v.name} gehalten`); }
    else { setSchutz(s, id, schutz(s, id) - 1); c.toast(`😕 ${v.name}: Die Crew war zu wenige. Schutz sinkt.`); }
  }, 18000);
}

/** Gespräch: Tom als Auftraggeber, die anderen als mögliche Crew – true, wenn Akt V es übernommen hat */
export function crewTalk(c: StoryCtx, id: string): boolean {
  const s = c.s;
  if (!crewOn(s) || !s.flags.crewCall) return false;
  const n = crewStep(s);
  if (id === 'tom') {
    if (s.flags.crewRun) { c.say([T('Du bist unterwegs. Folg der Lichtsäule, wir sind direkt hinter dir.')]); return true; }
    if (n === 0) { c.say([T(`Wir brauchen Leute. ${recruits(s)} von ${NEED} haben wir. Sprich mit allen, die du kennst. Je bekannter du bist, desto mehr machen mit.`)]); return true; }
    if (n === 3 || n === 5) {
      if (!isNight(c.hour())) { c.say([T('Das machen wir im Dunkeln, da sind sie unterwegs. Komm nach 21 Uhr wieder.', [{ label: 'Bis 21 Uhr warten', fn: () => c.skipToHour(21) }, { label: 'Später', fn: () => {} }])]); return true; }
      const go = n === 3 ? revier : finale;
      c.say([...(n === 3 ? [
        T('Seit Hallers Anzeige geplatzt ist, schickt er seine Leute nachts in die Viertel. Immer zu dritt, immer da, wo gerade niemand ist.'),
        T('Also sind wir ab jetzt da. Heute Nacht der Regenbogenpark. Die Crew kommt mit, du gehst vorne.')] : [
        T('Kim hat es auf dem Funk gehört: Haller räumt sein Lager am Hafen aus. Geld, Flugblätter, Listen. Dann will er weg.'),
        T('Er fährt einen grauen Wagen. Rex kennt jede Abkürzung, Bruno und Sam stehen bereit. Heute Nacht endet das.')]),
      T(n === 3 ? 'Bereit?' : 'Los?', [{ label: n === 3 ? 'Los geht’s (150 €)' : 'Wir holen ihn (500 €)', fn: () => go(c) }, { label: 'Noch nicht', fn: () => {} }])]);
      return true;
    }
    c.say([T(n === 4 ? 'Geh mit der Crew Streife, bis jedes Viertel geschützt ist. Handy → ✊ Crew.' : n === 1 ? 'Tauch erst unter. Ein Versteck zu Fuß oder bei Rosi umlackieren, dann sehen wir weiter.' : 'Kim kümmert sich um das Video. Halt dein Handy bereit.')]);
    return true;
  }
  const m = memberDef(id);
  if (!m || inCrew(s, id) || s.flags['crewAsk_' + id] === s.day) return false;
  const sk = SKILLS[m.skill];
  c.say([{ who: m.name, color: '#ff7a1a', text: m.pitch, choices: [
    { label: s.rep >= m.need ? `✊ Komm in die Lichterkette (${sk.icon} ${sk.name})` : `✊ Komm in die Lichterkette (ab ${m.need} Ruf)`, fn: () => {
      if (s.rep < m.need) { s.flags['crewAsk_' + id] = s.day; c.say([{ who: m.name, color: '#ff7a1a', text: m.no }]); return; }
      s.flags['crew_' + id] = s.day;
      c.say([{ who: m.name, color: '#ff7a1a', text: m.yes }], () => {
        c.reward(0, 2, `✊ ${m.name} ist in der Crew (${sk.text})`);
        if (crewStep(s) === 0 && recruits(s) >= NEED) founded(c);
      });
    } },
    { label: 'Ein andermal', fn: () => { s.flags['crewAsk_' + id] = s.day; } }] }]);
  return true;
}

/** Drei Leute dabei: Die Lichterkette ist gegründet */
function founded(c: StoryCtx) {
  const s = c.s; s.flags.crew = 1;
  c.phone(call(TOM.name, TOM.color, [
    `${crewOf(s).filter((q) => q.id !== 'tom').map((q) => q.name).join(', ')} und wir zwei. Das ist eine Crew. Wir nennen uns Lichterkette, nach der Nacht auf der Brücke.`,
    'Wir sind keine Bürgerwehr. Wir gehen in Gruppen, wir schauen hin, und wenn jemand angegriffen wird, stehen wir daneben. Mehr nicht. Aber auch nicht weniger.',
  ]), () => c.card('Die Lichterkette', 'Eine Crew für alle Viertel', 'Tom und deine Freund*innen gehen ab jetzt nachts gemeinsam durch die Stadt. Handy → ✊ Crew zeigt, wer dabei ist und was sie können.'));
}

/** Mission 3: Video holen, Haller-Leute wollen es zurück, zur Wache */
function video(c: StoryCtx) {
  run(c, { id: 'crew_video', who: 'Kim', color: '#3da542', title: '✊ Das Video', call: '', time: 360, pay: 220, rep: 6, car: true, done: 'Die Wahrheit ist auf deiner Seite.',
    steps: [S(-15, 22, 'Zu Nele an der Pride Plaza, sie hat das Video', '📱'),
      { x: -15, z: 22, label: 'Hallers Leute wollen das Handy! Halt sie auf!', icon: '👊', fight: ['Kurt', 'Lars', 'Timo'] },
      S(5.6, -17, 'Bring das Video zu Kommissarin Sander an die Wache', '🚓')] },
  () => { c.s.flags.crew = 3; c.say([
    SANDER('Das Video ist eindeutig. Haller kommt auf dich zu, schubst, fällt über seine eigenen Füße und filmt sich dann selbst mit Schmerzensgesicht.'),
    SANDER('Die Fahndung ist aufgehoben. Gegen Haller läuft jetzt ein Verfahren wegen falscher Verdächtigung. Aber er ist auf Kaution draußen, bis zum Prozess.'),
    O('Nele', '#ff9ad5', 'Ich habe nur draufgehalten. Meine Mutter sagt immer: Wenn du etwas siehst, film es. Und dann ruf deine Leute an.'),
    T('Haller wird jetzt nicht ruhiger, sondern lauter. Komm nachts an den Kai. Wir müssen anfangen, auf die Viertel aufzupassen.')]); },
  () => c.toast('Kim: „Das Video ist noch da. Wir versuchen es noch einmal.“ (Kims Anruf kommt wieder)'));
}

/** Mission 4: erste gemeinsame Streife, danach Viertel-Schutz für alle */
function revier(c: StoryCtx) {
  run(c, { id: 'crew_revier', who: TOM.name, color: TOM.color, title: '✊ Revierwache', call: '', time: 300, pay: 150, rep: 5, car: true, done: 'Der Park bleibt bunt.',
    steps: [S(40, 40, 'Zum Regenbogenpark, die Crew wartet', '🌳'), { x: 40, z: 40, label: 'Vier graue Jacken reißen die Fahnen ab. Stellt euch ihnen!', icon: '👊', fight: ['Holger', 'Ralf', 'Sven', 'Udo'] }] },
  () => { const s = c.s; s.flags.crew = 4; s.flags.crewWatch = true; setSchutz(s, 'park', 1);
    c.say([
      O('Bruno', '#d56300', 'Habt ihr gesehen, wie die gerannt sind? Ich glaube, einer hat seinen Schuh verloren.'),
      T('Gut gemacht. Ab jetzt ruft dich die Crew an, wenn irgendwo Graue auftauchen. Du kannst hinfahren oder die Crew allein schicken.'),
      T('Und jeder Kiez, den wir schützen, legt jeden Morgen etwas in die Kiezkasse. Damit bezahlen wir Funkgeräte, Pflaster und Pizza.'),
      T('Jetzt alle Viertel. Plaza, Hafen, Laternenmeile, Rostwerk, Kap Zuflucht. Handy → ✊ Crew → Streife gehen.')], () => {
      if (allSafe(s)) { s.flags.crew = 5; }
    }); },
  () => c.toast('Tom: „Nicht schlimm. Wir versuchen es noch einmal, zusammen.“'));
}

/** Mission 6: Haller flieht, Verfolgung, Festnahme */
function finale(c: StoryCtx) {
  const s = c.s;
  run(c, { id: 'crew_haller', who: TOM.name, color: TOM.color, title: '✊ Hallers letzte Fahrt', call: '', time: 520, pay: 500, rep: 12, car: true, done: 'Die Lichterkette hält.',
    steps: [S(-74, -20, 'Zu Hallers Lager am Hafen', '📦'),
      { x: -74, z: -20, label: 'Haller springt in den grauen Wagen! Hinterher!', icon: '🚨', chase: { car: 'car_sedan' } },
      { x: 0, z: 0, label: 'Haller und zwei Kumpel steigen aus!', icon: '👊', fight: ['Dennis Haller', 'Mirko', 'Olaf'] },
      S(5.6, -17, 'Bring Haller zu Kommissarin Sander an die Wache', '🚓')] },
  () => {
    s.flags.crewEnd = s.day; s.flags.crew = CREW_STEPS;
    c.say([
      SANDER('Dennis Haller, Sie sind festgenommen. Kautionsbruch, Fluchtversuch, und im Kofferraum Listen mit Namen und Adressen. Das wird ein langer Prozess.'),
      O('Dennis Haller', '#8a8f99', 'Ihr seid doch auch nur eine Gang.'),
      T('Nein. Eine Gang macht Leuten Angst. Wir sorgen dafür, dass niemand mehr Angst haben muss. Das ist der Unterschied.'),
      SANDER('Ganz ehrlich? Als Polizistin sollte ich das nicht sagen. Aber die Stadt ist sicherer, seit ihr nachts unterwegs seid. Ruft uns, wir kommen.'),
      O('Jules', '#9c59d1', 'Die Telefonkette steht. Morgen Abend Pizza im Regenbogenhaus. Für alle Viertel.')], () => {
      c.reward(300, 15, 'Die Lichterkette');
      c.card('Akt V abgeschlossen', 'Die Lichterkette', 'Haller ist gefasst, der Ordnungsbund hat keine Köpfe mehr. Deine Crew geht weiter Streife, und jedes geschützte Viertel legt jeden Morgen in die Kiezkasse.');
    });
  }, () => c.toast('Tom: „Er ist entwischt, aber weit kommt er nicht. Komm nachts wieder an den Kai.“'));
}

let calm = 0, alarmT = 0;
/** Anrufe in Akt V und Überfälle auf die Viertel (danach im freien Spiel weiter) – aus storyTick, also nur, wenn nichts anderes läuft */
export function crewTick(c: StoryCtx) {
  const s = c.s, f = s.flags;
  if (!f.flutEnd || f.crewRun || c.gigOn?.()) { calm = 0; return; }
  if (++calm < 10) return;
  // Auftakt: am Tag nach Krals Festnahme ruft Tom an
  if (!f.crewCall) {
    if (Number(f.flutEnd) >= s.day) return;
    calm = 0; f.crewCall = true; f.crew_tom = s.day;
    c.phone(call(TOM.name, TOM.color, [
      'Kral sitzt. Aber Dennis Haller ist auf Kaution draußen und sammelt, was vom Ordnungsbund übrig ist. Gestern Nacht haben sie wieder jemanden am Kai angepöbelt.',
      'Sander kann nicht überall sein. Wir schon, wenn wir genug sind. Ich will eine Crew. Leute, die nachts gemeinsam hinschauen. Hol drei aus deinem Freundeskreis dazu.',
    ]), () => c.card('Akt V', 'Die Lichterkette', 'Haller sammelt die Reste des Ordnungsbunds. Gründe mit Tom eine eigene Crew, schütze die Viertel und überstehe eine falsche Anzeige.').then(() => history(s, 'a5', c.card)));
    return;
  }
  const n = crewStep(s);
  // Haller zeigt dich an: Fahndung
  if (n === 1 && !f.crewFrame) {
    calm = 0; f.crewFrame = true;
    c.phone(call('Kommissarin Sander', '#5b86d6', [
      'Hören Sie zu, ich habe nicht viel Zeit. Dennis Haller hat Sie angezeigt. Körperverletzung, mit Attest und zwei Zeugen aus seinem Verein.',
      'Ich glaube kein Wort davon. Aber es gibt einen Haftbefehl, und meine Kollegen müssen Sie mitnehmen, wenn sie Sie sehen. Tauchen Sie unter, bis ich Beweise habe.',
    ]), () => { c.wanted?.(3); c.toast('🫥 Verstecke zu Fuß stehen auf dem Radar · 🎨 Im Auto: Rosi lackiert in der Hochstadt um'); });
    return;
  }
  if (n === 1 && f.crewFrame && !(c.wanted?.() || 0)) {
    calm = 0; f.crew = 2;
    c.phone(call('Kim', '#3da542', [
      'Du bist sie los? Sehr gut. Und jetzt die gute Nachricht: Ich habe auf dem Funk gehört, wo Haller angeblich angegriffen wurde.',
      'Eine Nele hat alles gefilmt. Sie wartet an der Pride Plaza. Aber Hallers Leute suchen sie auch. Beeil dich.',
    ]), () => c.say([KIM('Holst du das Video?'), { who: 'Kim', color: '#3da542', text: 'Jetzt los?', choices: [{ label: '✊ Ich hole es!', fn: () => video(c) }, { label: 'Gleich (Kim ruft wieder an)', fn: () => { alarmT = 40; } }] }]));
    return;
  }
  if (n === 2) {
    if (alarmT > 0) { alarmT--; return; }
    calm = 0;
    c.phone(call('Kim', '#3da542', ['Nele wartet noch an der Plaza mit dem Video. Kommst du?']), () => c.say([{ who: 'Kim', color: '#3da542', text: 'Los?', choices: [{ label: '✊ Ich hole es!', fn: () => video(c) }, { label: 'Gleich', fn: () => { alarmT = 40; } }] }]));
    return;
  }
  // Überfälle auf die Viertel (ab der Revierwache, auch nach Akt V)
  if (!f.crewWatch || n === 5) return;
  if ((alarmT -= 1) > 0) return;
  alarmT = 220 + Math.floor(Math.random() * 160);   // alle zwei bis drei Minuten (Takt 0,5 s)
  calm = 0;
  const open = VIERTEL.filter((v) => schutz(s, v.id) < 3), v = (open.find((q) => !schutz(s, q.id)) || open[Math.floor(Math.random() * open.length)]);
  if (!v) return;
  const who = crewOf(s).find((q) => q.id !== 'tom') || memberDef('tom')!;
  c.phone(call(who.name, '#ff7a1a', [`Alarm! Graue Jacken in ${v.icon} ${v.name}. Sie pöbeln Leute an und reißen Fahnen ab.`]), () => c.say([{ who: who.name, color: '#ff7a1a', text: 'Was machen wir?', choices: [
    { label: '✊ Ich komme!', fn: () => patrol(c, v.id, true) },
    { label: `📣 Crew allein schicken (${Math.round(crewOdds(s) * 100)} %)`, fn: () => sendCrew(c, v.id) },
    { label: 'Diesmal nicht (Schutz sinkt)', fn: () => { setSchutz(s, v.id, schutz(s, v.id) - 1); } }] }]));
}

/** Handy-App: Crew, Fähigkeiten, Viertel */
export function crewApp(s: SaveData) {
  const members = crewOf(s), open = CREW.filter((q) => !inCrew(s, q.id));
  const html = `<div class="pbody"><p>Die Lichterkette geht nachts gemeinsam durch die Stadt, hilft bei Schlägereien und schützt die Viertel vor dem Ordnungsbund.${s.flags.crewWatch ? `<br>🪙 Kiezkasse: <b>${kiezKasse(s)} €</b> jeden Morgen` : ''}</p>
    <h4>Crew (${members.length})</h4>${members.map((m) => `<p>${SKILLS[m.skill].icon} <b>${m.name}</b> · ${SKILLS[m.skill].name}<br><small>${SKILLS[m.skill].text}</small></p>`).join('') || '<p>Noch niemand.</p>'}
    ${open.length ? `<h4>Ansprechen</h4><p><small>${open.map((m) => `${m.name} (${SKILLS[m.skill].icon}, ab ${m.need} Ruf)`).join(' · ')}</small></p>` : ''}
    <h4>Viertel</h4>${VIERTEL.map((v) => `<p>${v.icon} ${v.name}: ${'★'.repeat(schutz(s, v.id))}${'☆'.repeat(3 - schutz(s, v.id))}</p>`).join('')}</div>`;
  return { html, canPatrol: !!s.flags.crewWatch };
}
