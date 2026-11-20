/* Akt II „Die Lichter der Hochstadt“ – eigene Missionsreihe im neuen Stadtteil (acht Missionen, eigene Figuren).
   Das alte Revuetheater Kaleidoskop am Neonplatz soll einem Glasturm weichen. Du hilfst dem Haus Vega, es zu retten:
   mit Fahrten, Recherche, Unterschriften und einer großen Ballnacht. Kein Kampf, niemand wird verletzt –
   am Ende steht ein Gespräch, und deine Wahl bestimmt, wie die Hochstadt weiterlebt. */
import type { SaveData } from '../engine/Save';
import type { Line } from '../ui/ui';
import type { NpcDef, StoryCtx, Goal } from './story';
import type { GigStep } from './gigs';

export const SAGA_NPCS: NpcDef[] = [
  { id: 'vega', name: 'Mama Vega', pron: 'sie/ihr', color: '#ff3fb0', look: { body: 'Woman2', rb: 'Female_Party_02', palette: 'neon', skin: 4, hair: 7 }, x: 135, z: 34.3, yaw: Math.PI },
  { id: 'dee', name: 'Dee', pron: 'they/them', color: '#ffd23b', look: { body: 'Man', rb: 'Male_Adult_07', palette: 'nonbinary', skin: 3, hair: 2 }, x: 165, z: -34.3, yaw: 0 },
  { id: 'yusuf', name: 'Yusuf', pron: 'er/ihn', color: '#5ce1ff', look: { body: 'Man2', rb: 'Male_Adult_05', palette: 'bi', skin: 3, hair: 0 }, x: 145.7, z: 8, yaw: Math.PI / 2 },
  { id: 'ines', name: 'Ines Okafor', pron: 'sie/ihr', color: '#3ddc97', look: { body: 'Woman', rb: 'Female_Adult_05', palette: 'progress', skin: 5, hair: 2 }, x: 184.3, z: -15, yaw: -Math.PI / 2 },
  { id: 'piet', name: 'Piet', pron: 'er/ihn', color: '#ff7a3d', look: { body: 'Man2', rb: 'Male_Adult_08', palette: 'bear', skin: 1, hair: 5 }, x: 154.3, z: 26, yaw: -Math.PI / 2 },
  { id: 'kron', name: 'Aurelia Kron', pron: 'sie/ihr', color: '#c9a2ff', look: { body: 'Woman', rb: 'Female_Adult_10', palette: 'ace', skin: 0, hair: 6 }, x: 165, z: 4.3, yaw: Math.PI },
];
const N = (id: string) => SAGA_NPCS.find((n) => n.id === id)!;
const L = (id: string, text: Line['text'], choices?: Line['choices']): Line => { const n = N(id); return { who: n.name, pron: n.pron, color: n.color, text, choices }; };
const S = (x: number, z: number, label: string, icon = '📍'): GigStep => ({ x, z, label, icon });

export interface Mission {
  id: string; title: string; giver: string; pay: number; rep: number;
  /** erst ab 21 Uhr */ night?: boolean; car?: boolean; time: number;
  hint: string; intro: (s: SaveData) => Line[]; steps: GigStep[]; outro: (s: SaveData) => Line[];
}

export const MISSIONS: Mission[] = [
  { id: 'bruecke', title: 'Über die Brücke', giver: 'vega', pay: 80, rep: 2, time: 150, hint: 'Mama Vega steht am Neonplatz in der Hochstadt, hinter der Regenbogenbrücke.',
    intro: (s) => [
      L('vega', `Na sieh mal an. Ein neues Gesicht aus Rainbow City. Du bist ${s.name}, oder? Man redet über dich.`),
      L('vega', 'Ich bin Vega. Mutter vom Haus Vega. Wir tanzen, nähen und wohnen im Kaleidoskop – dem alten Revuetheater hier am Platz.'),
      L('vega', 'Seit heute Morgen hängt ein Zettel an der Tür. Ich habe meine Brille nicht dabei und ehrlich gesagt auch nicht den Mut.'),
      L('vega', 'Liest du ihn für mich? Und schau dir das Haus von allen Seiten an. Du sollst wissen, worum es geht.')],
    steps: [S(124.3, 45, 'Zettel an der Theatertür lesen', '📄'), S(135, 55.7, 'Bühneneingang hinter dem Haus ansehen', '🎭'), S(135, 34.3, 'Zurück zu Mama Vega', '💬')],
    outro: () => [
      L('vega', 'Räumung in dreißig Tagen. „Kron Türme AG“. Ein Glasturm, wo seit neunzig Jahren getanzt wird.'),
      L('vega', 'Hier haben Leute ihr erstes Kleid getragen, ihren ersten Kuss bekommen und ihren richtigen Namen gesagt. Das reißt man nicht ab.'),
      L('vega', 'Du hast ein gutes Herz und anscheinend einen Führerschein. Frag Dee am Parkplatz unter der Hochbahn. Wir brauchen alle Kinder des Hauses hier.')] },
  { id: 'haus', title: 'Das Haus Vega', giver: 'dee', pay: 120, rep: 2, time: 170, car: true, hint: 'Dee wartet am Parkplatz unter der Hochbahn (Südosten der Hochstadt).',
    intro: () => [
      L('dee', 'Du kommst von Mama? Dann steig ein, also bildlich. Mein Taxi ist in der Werkstatt, deins muss reichen.'),
      L('dee', 'Heute Abend ist Hausversammlung. Kiki wohnt in den Brownstones, die Zwillinge Lux und Lumen arbeiten am Glasturm, Oma Tilly sitzt im Park.'),
      L('dee', 'Sammel sie ein und bring sie zum Neonplatz. Und fahr sanft – Tilly hat Kuchen dabei.')],
    steps: [S(105, -30, 'Kiki an den Brownstones abholen', '🙋'), S(180, -10, 'Lux und Lumen am Glasturm abholen', '👯'), S(120, 15, 'Oma Tilly am Hochstadtpark abholen', '🍰'), S(135, 30, 'Alle zum Neonplatz bringen', '🏁')],
    outro: () => [
      L('dee', 'Alle da, Kuchen heil. Du fährst besser als ich, sag das bloß niemandem.'),
      L('dee', 'Das Haus hat abgestimmt: Wir gehen nicht. Aber Mut allein reicht nicht, wir brauchen Papier. Yusuf vom „Hochstadt Kurier“ weiß, wo man sucht.')] },
  { id: 'papier', title: 'Papierkrieg', giver: 'yusuf', pay: 150, rep: 3, time: 300, car: true, hint: 'Yusuf vom „Hochstadt Kurier“ steht unter der Hochbahn, mitten in der Hochstadt.',
    intro: () => [
      L('yusuf', 'Kaleidoskop, ja? Ich schreibe seit Wochen darüber, und niemand druckt es. Zu wenig Beweise, sagt die Chefin.'),
      L('yusuf', 'Das Theater stand einmal unter Denkmalschutz. Die Akte ist aus dem Rathaus verschwunden – aber im Regenbogenhaus drüben hebt Jules alles auf.'),
      L('yusuf', 'Hol die Akte, lass sie im Studio Klappe Auf kopieren und bring mir die Kopie. Das Original bleibt bei Jules. Sicher ist sicher.')],
    steps: [S(-4, -10, 'Denkmalakte im Regenbogenhaus holen', '📁'), S(-34, 20, 'Im Studio Klappe Auf kopieren', '🖨️'), S(150, 4, 'Kopie zu Yusuf in die Hochstadt', '📰')],
    outro: () => [
      L('yusuf', 'Da ist es. Stempel von 1987: „Kulturdenkmal der queeren Stadtgeschichte“. Der Schutz wurde nie aufgehoben, nur vergessen.'),
      L('yusuf', 'Das ist eine Geschichte. Aber ich brauche Bilder von dem, was Kron wirklich vorhat. Komm nach Einbruch der Dunkelheit wieder.')] },
  { id: 'nacht', title: 'Nachtschicht', giver: 'yusuf', pay: 160, rep: 3, time: 210, night: true, hint: 'Yusuf wartet ab 21 Uhr unter der Hochbahn.',
    intro: () => [
      L('yusuf', 'Nachts hängen die Pläne offen im Baubüro, und die Vermesser arbeiten heimlich am Theater. Hier, meine Kamera.'),
      L('yusuf', 'Nur fotografieren. Nichts anfassen, niemanden bedrängen. Wir sind die Guten, und so sollen die Fotos auch aussehen.')],
    steps: [S(165, -34.3, 'Baupläne am Baubüro fotografieren', '📸'), S(175.7, 4.3, 'Modell des Kron-Turms im Schaufenster fotografieren', '📸'), S(124.3, 45, 'Vermessung am Kaleidoskop fotografieren', '📸'), S(145.7, 8, 'Fotos zu Yusuf bringen', '📰')],
    outro: () => [
      L('yusuf', 'Vierzig Stockwerke, und im Erdgeschoss eine „Erlebnisgastronomie im Stil der wilden Jahre“. Sie reißen das Echte ab und bauen eine Kopie davon.'),
      L('yusuf', 'Morgen steht das auf Seite eins. Jetzt braucht es Stimmen im Stadtrat. Geh zu Ines Okafor, sie hat ihr Büro im Osten bei den Türmen.')] },
  { id: 'rat', title: 'Stimmen für das Kaleidoskop', giver: 'ines', pay: 140, rep: 4, time: 260, hint: 'Stadträtin Ines Okafor steht vor ihrem Büro im Osten der Hochstadt.',
    intro: () => [
      L('ines', 'Ich habe den Artikel gelesen. Ich bin auf eurer Seite, aber im Rat zählen Unterschriften und keine Sympathie.'),
      L('ines', 'Fünfhundert Namen aus der Hochstadt, und ich setze den Denkmalschutz wieder auf die Tagesordnung. Die Listen liegen überall aus – sammel sie ein.'),
      L('ines', 'Und frag niemanden zweimal. Wer nicht unterschreiben will, hat Gründe.')],
    steps: [S(108.5, 15, 'Liste am Basketballplatz', '✍️'), S(105, -24.4, 'Liste an der Laternenmeile', '✍️'), S(157, 22, 'Liste an der Hochbahn-Station', '✍️'), S(195, -34.3, 'Liste bei den Brownstones im Osten', '✍️'), S(184.3, -15, 'Alle Listen zu Ines', '🏛️')],
    outro: () => [
      L('ines', 'Sechshundertzwölf. Sogar die Nachbarn vom Glasturm haben unterschrieben.'),
      L('ines', 'Die Sitzung ist in drei Tagen. Bis dahin muss das Theater zeigen, dass es lebt. Vega plant etwas Großes, aber die Bühnentechnik hängt fest. Frag Piet an der Hochbahn.')] },
  { id: 'zug', title: 'Der letzte Zug', giver: 'piet', pay: 180, rep: 3, time: 95, car: true, hint: 'Piet, der Fahrer der Hochbahn, steht an der Station Hochstadt.',
    intro: () => [
      L('piet', 'Die Scheinwerfer für Vegas Ball liegen im Depot am Südende der Strecke. Der letzte Zug nimmt sie mit zur Schrottpresse, Befehl von oben.'),
      L('piet', 'Ich fahre diesen Zug. Ich kann langsam fahren, aber anhalten darf ich nicht. Wenn du vor mir am Depot bist, lade ich „versehentlich“ bei dir aus.'),
      L('piet', 'Immer unter den Gleisen lang, dann bist du schneller als ich. Abfahrt in zehn Sekunden!')],
    steps: [S(150, 30, 'Unter der Hochbahn nach Süden', '🚆'), S(150, 0, 'Weiter unter den Gleisen', '🚆'), S(150, -30, 'Scheinwerfer am Depot aufladen', '💡'), S(135, 30, 'Zum Kaleidoskop am Neonplatz', '🎭')],
    outro: () => [
      L('piet', 'Ich habe nichts gesehen. Und meine Kolleginnen von der Gewerkschaft auch nicht. Wir kommen übrigens alle zum Ball.'),
      L('piet', 'Vega wartet auf dich. Sie sagt, es fehlt nur noch der Glanz.')] },
  { id: 'ball', title: 'Nacht der tausend Lichter', giver: 'vega', pay: 220, rep: 5, time: 330, car: true, night: true, hint: 'Mama Vega wartet ab 21 Uhr am Neonplatz.',
    intro: () => [
      L('vega', 'Heute Nacht zeigen wir der ganzen Stadt, was im Kaleidoskop steckt. Ein Ball, wie ihn die Hochstadt noch nicht gesehen hat.'),
      L('vega', 'Mir fehlen Kostüme aus der Boutique Fabelhaft, Novas Anlage aus dem Club Prisma und eine Moderatorin. Lady Luma in der One Love Bar schuldet mir noch einen Gefallen.'),
      L('vega', 'Hol sie alle. Und dann, Liebes, tanzt du mit.')],
    steps: [S(34, 10, 'Kostüme in der Boutique Fabelhaft', '👗'), S(4, -10, 'Novas Anlage am Club Prisma', '🔊'), S(34, 20, 'Lady Luma an der One Love Bar abholen', '🎤'), S(135, 30, 'Zurück zum Neonplatz', '🪩')],
    outro: () => [
      L('vega', 'Schau dir das an. Der Platz ist voll bis zur Hochbahn. Die Zwillinge laufen Kategorie „Glasturm-Realness“ und Oma Tilly sitzt in der Jury.'),
      L('vega', 'Zehn, zehn, zehn auf der ganzen Linie. Und dort hinten, im grauen Mantel: Das ist Aurelia Kron. Sie ist gekommen.'),
      L('vega', 'Sie will morgen mit uns reden. Ich möchte, dass du dabei bist.')] },
  { id: 'finale', title: 'Das Kaleidoskop bleibt', giver: 'kron', pay: 1500, rep: 10, time: 200, hint: 'Aurelia Kron wartet vor dem Kron-Turm in der Mitte der Hochstadt.',
    intro: (s) => [
      L('kron', 'Sie sind also die Person, die mir sechshundert Unterschriften, eine Titelseite und einen schlaflosen Aufsichtsrat eingebracht hat.'),
      L('kron', 'Ich war gestern auf Ihrem Ball. Meine Großmutter hat im Kaleidoskop Garderobe gemacht. Das hatte ich … weggelegt.'),
      L('vega', 'Dann wissen Sie ja, was Sie da abreißen wollen.'),
      L('kron', 'Der Rat wird den Denkmalschutz bestätigen, das ist mir klar. Die Frage ist, was danach kommt. Was schlagen Sie vor?', [
        { label: 'Bauen Sie mit uns: Ihr Turm nebenan, das Theater bleibt und wird saniert.', fn: () => { s.flags.sagaEnd = 'bridge'; } },
        { label: 'Das Kaleidoskop gehört dem Viertel. Ziehen Sie Ihre Pläne zurück.', fn: () => { s.flags.sagaEnd = 'stand'; } }]),
      L('kron', () => (s.flags.sagaEnd === 'bridge' ? 'Ein Turm mit einem Theater im Herzen. Das ist … ehrlich gesagt die bessere Idee. Ich lasse neu zeichnen.' : 'Sie verhandeln nicht. Das respektiere ich. Ich ziehe den Antrag zurück, heute noch.')),
      L('vega', 'Dann sag es den Leuten selbst. Sie warten am Platz. Geh vor, Liebes, und hol alle zusammen.')],
    steps: [S(157, 22, 'Piet und die Bahner an der Station holen', '🚆'), S(108.5, 15, 'Die Kids vom Basketballplatz holen', '🏀'), S(135, 34.3, 'Alle zum Neonplatz', '🎉')],
    outro: (s) => [
      L('kron', () => (s.flags.sagaEnd === 'bridge' ? 'Die Kron Türme AG saniert das Kaleidoskop und überschreibt es dem Haus Vega. Mein Turm entsteht daneben – mit einem Fenster zur Bühne.' : 'Die Kron Türme AG zieht sich vom Neonplatz zurück. Das Kaleidoskop geht an eine Stiftung des Viertels.')),
      L('vega', `Neunzig Jahre. Und es kommen neunzig dazu. ${s.name}, im Foyer hängt ab heute ein Stern mit deinem Namen.`),
      L('dee', 'Und du hast Freifahrten auf Lebenszeit. Sobald mein Taxi aus der Werkstatt ist.')] },
];

export const sagaDone = (s: SaveData) => Math.min(MISSIONS.length, Number(s.flags.saga) || 0);
/** Akt II beginnt, sobald du in Rainbow City angekommen bist (ab Kapitel 2) */
export const sagaOpen = (s: SaveData) => s.chapter >= 2;
export const sagaNext = (s: SaveData): Mission | null => (sagaOpen(s) ? MISSIONS[sagaDone(s)] || null : null);
export const sagaHidden = (s: SaveData, id: string) => id === 'kron' && sagaDone(s) < 6;
export const isNight = (h: number) => h >= 21 || h < 5;

/** Ziel fürs HUD, wenn die Hauptgeschichte gerade nichts vorgibt */
export function sagaGoal(s: SaveData): Goal | null {
  const m = sagaNext(s); if (!m) return null;
  return { title: `Hochstadt ${sagaDone(s) + 1}/${MISSIONS.length}: ${m.title}`, sub: m.hint, npc: m.giver };
}
/** Symbol über der Figur, die den nächsten Auftrag hat */
export function sagaMarks(s: SaveData): Array<[string, string]> { const m = sagaNext(s); return m ? [[m.giver, '🌆']] : []; }

const SMALL: Record<string, string[]> = {
  vega: ['Im Kaleidoskop ist immer eine Nähmaschine frei und ein Platz am Tisch.', 'Kopf hoch, Schultern zurück. So läuft man durch die Hochstadt.'],
  dee: ['Die Hochstadt lernt man nur im Stau kennen. Oder im Taxi.', 'Unter der Hochbahn ist immer ein Parkplatz frei. Fast immer.'],
  yusuf: ['Eine gute Geschichte beginnt mit einer Frage, die niemand stellen will.', 'Ich trinke zu viel Kaffee und schlafe zu wenig. Berufskrankheit.'],
  ines: ['Politik ist langsam. Aber sie bewegt sich, wenn genug Leute schieben.', 'Mein Büro steht allen offen. Auch denen, die schimpfen wollen.'],
  piet: ['Dreißig Jahre Hochbahn. Von oben sieht jede Stadt freundlicher aus.', 'Nächster Halt: Feierabend. Schön wär’s.'],
  kron: ['Ich baue seit zwanzig Jahren Türme. Zum ersten Mal baue ich um etwas herum.', 'Meine Großmutter hätte Sie gemocht.'],
};

/** Gespräch mit einer Hochstadt-Figur – true, wenn Akt II es übernommen hat */
export function sagaTalk(c: StoryCtx, id: string): boolean {
  const n = SAGA_NPCS.find((x) => x.id === id); if (!n) return false;
  const s = c.s, m = sagaNext(s);
  if (!sagaOpen(s)) { c.say([L(id, 'Neu hier? Komm erst mal in Rainbow City an. Die Hochstadt läuft dir nicht weg.')]); return true; }
  if (!m || m.giver !== id || s.flags.sagaRun) {
    const lines = SMALL[id];
    c.say([L(id, s.flags.sagaRun && m?.giver === id ? 'Du bist schon unterwegs. Folge der Lichtsäule!' : !m ? (id === 'vega' ? 'Das Kaleidoskop bleibt. Komm vorbei, wann immer du tanzen willst.' : lines[0]) : lines[s.day % lines.length])]);
    return true;
  }
  if (m.night && !isNight(c.hour())) {
    c.say([L(id, 'Dafür ist es noch zu hell. Komm nach 21 Uhr wieder.', [
      { label: 'Bis 21 Uhr warten', fn: () => c.skipToHour(21) }, { label: 'Ich komme später', fn: () => {} }])]);
    return true;
  }
  const start = () => {
    s.flags.sagaRun = m.id;
    c.mission({ id: 'saga_' + m.id, who: n.name, color: n.color, title: `🌆 ${m.title}`, call: '', steps: m.steps, time: m.time, pay: m.pay, rep: m.rep, car: m.car, done: 'Mission geschafft!',
      after: () => {
        delete s.flags.sagaRun; s.flags.saga = sagaDone(s) + 1;
        c.say(m.outro(s), () => {
          if (sagaDone(s) >= MISSIONS.length) { s.flags.biz_kaleido = s.day; c.card('Akt II abgeschlossen', 'Die Lichter der Hochstadt', s.flags.sagaEnd === 'bridge' ? 'Das Kaleidoskop wird saniert, und daneben wächst ein Turm mit einem Fenster zur Bühne. Du hast eine Brücke gebaut.' : 'Das Kaleidoskop gehört jetzt dem Viertel. Du bist standhaft geblieben, und die Hochstadt mit dir.'); }
          else c.toast(`🌆 Nächste Mission: ${MISSIONS[sagaDone(s)].title}`);
        });
      },
      failed: () => { delete s.flags.sagaRun; c.toast(`${n.name}: „Nicht schlimm. Komm zu mir, wir versuchen es noch einmal.“`); } });
  };
  const lines = m.intro(s);
  lines.push(L(id, m.car ? 'Bereit? Mit einem Auto bist du schneller.' : 'Bereit?', [{ label: `Los geht’s (${m.pay} €)`, fn: start }, { label: 'Noch nicht', fn: () => {} }]));
  c.say(lines);
  return true;
}
