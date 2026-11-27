/* Story-Modus „Gitter und Glitzer“: Die Hauptfigur (Rico vom Cover oder die eigene Figur) lebt mit Tarek Saadi in einer offenen
   Beziehung. Tarek ist der mit den krummen Dingern, die Hauptfigur die, die auf Frieden und Spaß setzt. In der Nacht vor dem
   gemeinsamen Umzug nach Rainbow City wird Tarek in einem gestohlenen Cabrio festgenommen: Sein alter Boss, der Autohändler
   Orlando Graf, hat ihn hingehängt, weil Tarek aussteigen wollte. Du holst ihn raus, ohne Zeitdruck: Anwältin, Zeugin,
   Kaution, Beweise und am Ende die letzte Fahrt. Bei jeder Hürde schlägt Tarek seinen Weg vor, du entscheidest.
   Läuft neben Akt I–V (story.ts), jede Etappe ab einem Kapitel; alle Figuren, Namen und Orte sind eigene Erfindungen. */
import type { SaveData } from '../engine/Save';
import type { Line } from '../ui/ui';
import type { NpcDef, StoryCtx, Goal } from './story';
import type { Gig, GigStep } from './gigs';
import type { Look } from './Actor';
import { isNight } from './saga';

export const TAREK_LOOK: Look = { body: 'pc_yakuza', rb: 'pc_yakuza', palette: 'rainbow', skin: 3, hair: 0 };
export const TAREK_NPCS: NpcDef[] = [
  { id: 'tarek', name: 'Tarek', pron: 'er/ihn', color: '#ff9f1c', look: TAREK_LOOK, x: 33.9, z: 17.6, yaw: -Math.PI / 2 },
  { id: 'mira', name: 'Mira Lindqvist', pron: 'sie/ihr', color: '#7fb2ff', look: { body: 'Woman', rb: 'Female_Adult_08', palette: 'progress', skin: 0, hair: 2 }, x: -6.3, z: -15.4, yaw: Math.PI / 2 },
];
const T = TAREK_NPCS[0], M = TAREK_NPCS[1];
const L = (n: NpcDef, text: Line['text'], choices?: Line['choices']): Line => ({ who: n.name, pron: n.pron, color: n.color, text, choices });
const O = (who: string, color: string, text: Line['text']): Line => ({ who, color, text });
const ME = (text: Line['text'], choices?: Line['choices']): Line => ({ who: 'Du', color: '#ff4fa3', text, choices });
const S = (x: number, z: number, label: string, icon = '📍'): GigStep => ({ x, z, label, icon });
const DOERTE = (text: Line['text']) => O('Dörte (Taxi)', '#ffd23b', text);
const SANDER = (text: string) => O('Kommissarin Sander', '#5b86d6', text);
const call = (text: string[]): Line[] => text.map((t) => ({ who: `📞 ${T.name}`, color: T.color, text: t }));

export const KAUTION = 500;
const BAR = [33.9, 17.6] as const, MIRA = [-6.3, -15.4] as const, GRAF = [165, -40] as const;

/** Etappen: n = Stand (Flag `tarek`), ab Kapitel `ch`; Titel fürs Story-Menü */
export const TAREK_STEPS = [
  { n: 0, ch: 1, title: 'Besuch hinter Glas', text: 'Tarek sitzt in U-Haft in der Polizeiwache Mitte. Er erzählt dir, was wirklich passiert ist.' },
  { n: 1, ch: 2, title: 'Wer hat es gesehen?', text: 'Ohne Zeugin keine Chance, sagt Anwältin Mira Lindqvist. Irgendwer war in der Nacht am Kai.' },
  { n: 2, ch: 3, title: 'Die Kaution', text: `${KAUTION} € Kaution, damit Tarek bis zum Prozess raus darf. Ehrlich verdient, wenn es nach dir geht.` },
  { n: 3, ch: 4, title: 'Nacht bei Graf Classics', text: 'Im Büro von Orlando Graf liegt das Fahrtenbuch, das alles beweist.' },
  { n: 4, ch: 5, title: 'Frei', text: 'Haftprüfung bestanden: Tarek kommt raus, gerade rechtzeitig für die Pride.' },
  { n: 5, ch: 6, title: 'Die letzte Fahrt', text: 'Graf will mit den gestohlenen Wagen verschwinden. Tarek und du, ein letztes Mal zusammen am Steuer.' },
];
/** nur im Story-Modus (neues Spiel oder im Story-Menü eingeschaltet); alte Spielstände bleiben, wie sie sind */
export const tarekOn = (s: SaveData) => s.flags.mode === 'story';
export const tarekDone = (s: SaveData) => Math.min(TAREK_STEPS.length, Number(s.flags.tarek) || 0);
/** Tarek sitzt noch (Besuchsraum der Polizeiwache) */
export const tarekInside = (s: SaveData) => tarekOn(s) && !!s.flags.tarekCall && !s.flags.tarekFrei;
/** nächste Etappe ist schon freigespielt (Kapitel erreicht) */
const ready = (s: SaveData) => { const st = TAREK_STEPS[tarekDone(s)]; return !!st && s.chapter >= st.ch && (st.n > 0 || s.chapter > 1 || s.step >= 3); };
/** wie oft du Tareks Weg gewählt hast und wie oft deinen */
export const ways = (s: SaveData) => { let t = 0, r = 0; for (const k of ['zeuge', 'kaution', 'graf']) { if (s.flags['tw_' + k] === 'tarek') t++; else if (s.flags['tw_' + k] === 'rico') r++; } return { t, r }; };

export const tarekHidden = (s: SaveData, id: string) => (id === 'tarek' && !s.flags.tarekFrei) || (id === 'mira' && (!tarekOn(s) || !s.flags.tarekCall || !!s.flags.tarekFrei));

export function tarekGoal(s: SaveData): Goal | null {
  if (!tarekOn(s) || !s.flags.tarekCall || s.flags.tarekEnd || !ready(s)) return null;
  const n = tarekDone(s), head = `💞 Gitter und Glitzer ${n + 1}/${TAREK_STEPS.length}`;
  if (s.flags.tarekRun) return null;
  switch (n) {
    case 0: return { title: `${head}: Besuch bei Tarek`, sub: 'Polizeiwache Mitte, Besuchsraum. Kein Termin nötig, Tarek läuft nicht weg.', poi: 'police' };
    case 1: return { title: `${head}: Anwältin Mira Lindqvist`, sub: 'Sie steht zwischen Regenbogenhaus und Feuerwache. Ganz ohne Zeitdruck.', npc: 'mira' };
    case 2: return { title: `${head}: Kaution ${Math.min(s.money, KAUTION)}/${KAUTION} €`, sub: s.money >= KAUTION ? 'Genug zusammen. Bring das Geld zu Mira.' : 'Spar in deinem Tempo, dann zu Mira. Tarek: „Ich hab hier Tischtennis, lass dir Zeit.“', npc: 'mira' };
    case 3: return { title: `${head}: Nacht bei Graf Classics`, sub: 'Mira hat einen Plan. Ab 21 Uhr.', npc: 'mira' };
    case 4: return { title: `${head}: Tarek abholen`, sub: 'Polizeiwache Mitte. Die Haftprüfung ist durch.', poi: 'police' };
    case 5: return { title: `${head}: Die letzte Fahrt`, sub: 'Tarek wartet vor der One Love Bar.', npc: 'tarek' };
  }
  return null;
}
export const tarekMarks = (s: SaveData): Array<[string, string]> => {
  const g = tarekGoal(s); return g?.npc ? [[g.npc, g.npc === 'tarek' ? '💞' : '⚖️']] : [];
};

/** Mission ohne Zeitdruck starten */
function run(c: StoryCtx, g: Omit<Gig, 'after' | 'failed' | 'time' | 'free'>, after: () => void) {
  const s = c.s;
  s.flags.tarekRun = g.id;
  c.mission({ ...g, time: 9999, free: true, after: () => { delete s.flags.tarekRun; after(); },
    failed: () => { delete s.flags.tarekRun; c.toast(`${T.name}: „Kein Stress. Ich bin ja nicht weg. Nochmal, wann du willst.“`); } });
}
const next = (c: StoryCtx, n: number, lines: Line[], then?: () => void) => {
  const s = c.s;
  c.say(lines, () => {
    s.flags.tarek = n;
    const st = TAREK_STEPS[n];
    if (st) c.toast(s.chapter >= st.ch ? `💞 Als Nächstes: ${st.title}` : `💞 ${st.title} geht ab Kapitel ${st.ch} weiter. Kein Zeitdruck.`);
    then?.();
  });
};

/** Gespräch mit Tarek oder Mira – true, wenn der Story-Modus es übernommen hat */
export function tarekTalk(c: StoryCtx, id: string): boolean {
  if (id !== 'tarek' && id !== 'mira') return false;
  const s = c.s, n = tarekDone(s);
  if (!tarekOn(s)) return false;
  if (s.flags.tarekRun) { c.say([L(id === 'tarek' ? T : M, 'Du bist unterwegs. Folg der Lichtsäule, ganz entspannt.')]); return true; }
  if (id === 'tarek') return talkTarek(c, n);
  return talkMira(c, n);
}

function talkTarek(c: StoryCtx, n: number): boolean {
  const s = c.s;
  if (!s.flags.tarekCall) return false;
  // im Besuchsraum: erster Besuch oder Abholen
  if (!s.flags.tarekFrei) {
    if (n === 0) {
      c.say([
        L(T, `Da bist du ja. ${s.name}. Schau nicht so, das Orange steht mir.`),
        ME('Was ist passiert? Du wolltest gestern den Umzugswagen holen.'),
        L(T, 'Wollte ich auch. Dann ruft Orlando an. Orlando Graf, Graf Classics, du weißt schon. Mein alter Boss.'),
        L(T, '„Eine letzte Überführung, Tarek, dann bist du raus.“ Ein kirschrotes Cabrio vom Kai in die Hochstadt. Ich dachte, als Abschied.'),
        L(T, 'Auf der Regenbogenbrücke standen schon drei Streifenwagen. Das Cabrio war gestohlen. Orlando hat selbst angerufen. Ich bin sein Denkzettel.'),
        ME('Und jetzt?'),
        L(T, 'Jetzt weißt du, warum ich aussteigen wollte. Für dich. Für uns. Für die Wohnung mit dem Balkon.'),
        L(T, 'Und keine Sorge um unsere Abmachung: Du darfst flirten, ich darf flirten, nach Hause kommen wir zueinander. Gilt auch hinter Gittern. Nur flirte ich hier mit niemandem, glaub mir.', [
          { label: '😄 Offen bleibt offen', sub: 'Ihr bleibt in eurer offenen Beziehung', fn: () => { s.flags.tarekOpen = true; if (!s.flags.relModel) s.flags.relModel = 'offen'; } },
          { label: '💬 Darüber reden wir, wenn du draußen bist', fn: () => { s.flags.tarekOpen = 'later'; } }]),
        L(T, 'Hol mich hier raus. Aber ohne Stress, hörst du? Ich laufe nicht weg. Wortwörtlich.'),
        L(T, 'Frag Mira Lindqvist, die macht Rechtshilfe beim Regenbogenhaus. Sie ist streng. Du wirst sie mögen.'),
      ], () => { s.rel.tarek = { f: Math.max(60, s.rel.tarek?.f || 0), last: s.day }; s.flags.tarek = 1; c.reward(0, 2, 'Tarek besucht'); c.toast(s.chapter >= 2 ? '💞 Als Nächstes: Mira Lindqvist' : '💞 Mira hilft ab Kapitel 2. Bis dahin: Rainbow City kennenlernen.'); });
      return true;
    }
    if (n === 4) {
      c.say([
        SANDER('Herr Saadi, Ihre Sachen. Die Haftrichterin hat entschieden: Fahrtenbuch, Zeugin, Kaution. Sie sind bis zum Prozess frei.'),
        L(T, 'Frei. Sag das nochmal.'),
        ME('Frei.'),
        L(T, `Komm her. … Du riechst nach Glitzer und Kaffee. Genau so habe ich mir das vorgestellt, ${s.name}.`),
        L(T, 'Du hast das alles gemacht, ohne jemandem eine reinzuhauen, oder? Das kannst nur du.'),
        ways(s).t > ways(s).r ? L(T, 'Na gut, ein paar Mal hast du es auf meine Art gemacht. Ich sag es keinem.') : L(T, 'Ich glaube, ich lerne gerade was. Frieden und Spaß. Klingt komisch aus meinem Mund, oder?'),
        L(T, 'Ich warte vor der One Love Bar. Erst duschen, dann tanzen, dann reden wir über Orlando. Der ist noch nicht fertig mit uns.'),
      ], () => {
        s.flags.tarekFrei = s.day; s.flags.tarek = 5;
        s.rel.tarek = { f: Math.max(80, s.rel.tarek?.f || 0), last: s.day };
        c.reward(0, 8, 'Tarek ist frei');
        void c.card('Gitter und Glitzer', 'Tarek ist frei', 'Bis zum Prozess, und mit der Zeugin und dem Fahrtenbuch sieht der gut aus. Tarek wartet vor der One Love Bar.');
      });
      return true;
    }
    c.say([L(T, n < 4 ? 'Hey du. Kein Stress, ehrlich. Ich spiele hier Tischtennis gegen einen Rentner, der Banken überfallen hat. Er gewinnt immer.' : 'Gleich. Mira sagt, gleich.'), L(T, n === 1 ? 'Frag Mira, die weiß, wie es weitergeht.' : n === 2 ? `Die Kaution, ja. ${KAUTION} €. Mach langsam, ich hab Zeit.` : 'Orlando hat ein Fahrtenbuch. Das ist sein größter Fehler, er schreibt alles auf.')]);
    return true;
  }
  // draußen: die letzte Fahrt oder Plaudern
  if (n === 5) {
    if (s.chapter < 6) { c.say([L(T, 'Erst die Pride. Orlando läuft nicht weg, und wenn doch, holen wir ihn. Heute wird getanzt.')]); return true; }
    if (!isNight(c.hour())) { c.say([L(T, 'Orlando verlädt nachts. Komm nach 21 Uhr wieder.', [{ label: 'Bis 21 Uhr warten', fn: () => c.skipToHour(21) }, { label: 'Später', fn: () => {} }])]); return true; }
    c.say([
      L(T, 'Orlando lässt heute Nacht seine Wagen verladen. Zehn gestohlene Autos, ein Transporter, dann ist er weg.'),
      L(T, 'Mein Weg wäre: Wir klauen ihm den Transporter. Dein Weg?'),
      ME('Wir folgen ihm, bis Kommissarin Sander da ist. Und danach bringen wir die Wagen zurück. Mit Hupkonzert.'),
      L(T, 'Mit Hupkonzert. Natürlich. Los, ich fahre mit dir.', [{ label: 'Los geht’s (ohne Zeitdruck)', fn: () => letzte(c) }, { label: 'Noch nicht', fn: () => {} }]),
    ]);
    return true;
  }
  const d = s.day % 4;
  c.say([L(T, s.flags.tarekEnd ? [
    'Ich hab einen Job, weißt du. Bei Tom in der Werkstatt. Ehrliche Autos. Fühlt sich komisch an, und gut.',
    'Ich habe heute jemandem die Tür aufgehalten, statt sie aufzubrechen. Siehst du, was du aus mir machst?',
    `Wer war denn der Süße gestern an der Bar? Erzähl. Offen heißt auch: Wir erzählen uns alles, ${s.name}.`,
    'Wenn du heute Nacht nicht heimkommst, schreib mir nur ein Herz. Ein Regenbogen-Herz heißt: alles gut, viel Spaß.',
  ][d] : 'Orlando kommt dran. Erst feiern wir.')]);
  return true;
}

function talkMira(c: StoryCtx, n: number): boolean {
  const s = c.s;
  if (n < 1 || s.flags.tarekFrei) return false;
  if (!ready(s)) { c.say([L(M, `Ich arbeite an Tareks Akte. Die nächste Etappe kommt in Kapitel ${TAREK_STEPS[n].ch}. Bis dahin: Leben Sie Ihr Leben.`)]); return true; }
  if (n === 1) {
    c.say([
      L(M, `Sie sind ${s.name}. Tarek hat von Ihnen erzählt. Viel. Sehr viel.`),
      L(M, 'Mira Lindqvist, Rechtshilfe. Ich glaube ihm. Das Problem: Der Richter wird ihm nicht glauben. Wir brauchen eine Zeugin.'),
      L(M, 'Das Cabrio stand am Kai, bevor Tarek kam. Irgendwer hat gesehen, wer es dort abgestellt hat. Fragen Sie herum. Die Fischbude, die Taxis.'),
      L(M, 'Und: Es gibt kein Datum. Lassen Sie sich Zeit, ich mag gründliche Leute.', [{ label: 'Ich frage herum', fn: () => zeuge(c) }, { label: 'Später', fn: () => {} }]),
    ]);
    return true;
  }
  if (n === 2) {
    if (s.money < KAUTION) { c.say([L(M, `${KAUTION} € Kaution, und Tarek darf bis zum Prozess raus. Sie haben ${s.money} €. Kein Grund zur Eile.`), L(M, 'Schichten, Aufträge, Ihr Club: Ehrliches Geld ist vor Gericht das beste Geld.')]); return true; }
    c.say([L(M, `${KAUTION} €? Bar? Ich frage nicht, woher. Doch, ich frage: Woher?`, [
      { label: '💜 Ehrlich verdient', fn: () => { s.flags.tw_kaution = 'rico'; } },
      { label: '🕶️ Tareks Kumpel hat was beigelegt', fn: () => { s.flags.tw_kaution = 'tarek'; } }]),
      L(M, () => (s.flags.tw_kaution === 'tarek' ? 'Ich habe das nicht gehört. Ich ziehe den Teil wieder ab und Sie zahlen ihn ehrlich nach, wenn Tarek draußen ist. Abgemacht.' : 'Das höre ich gern. Ich hinterlege die Kaution beim Gericht.')),
      L(M, 'Fehlt nur noch der Beweis, dass Graf das Cabrio selbst hingestellt hat. Dafür brauche ich Sie noch einmal. Nachts.'),
    ], () => { s.money -= KAUTION; s.flags.tarek = 3; c.reward(0, s.flags.tw_kaution === 'rico' ? 4 : 1, 'Kaution hinterlegt'); c.toast(s.chapter >= 4 ? '💞 Als Nächstes: Nacht bei Graf Classics' : '💞 Mira meldet sich ab Kapitel 4. Kein Zeitdruck.'); });
    return true;
  }
  if (n === 3) {
    if (!isNight(c.hour())) { c.say([L(M, 'Graf Classics schließt um 21 Uhr. Dann reden wir.', [{ label: 'Bis 21 Uhr warten', fn: () => c.skipToHour(21) }, { label: 'Später', fn: () => {} }])]); return true; }
    c.say([
      L(M, 'Orlando Graf schreibt jede Überführung in ein Fahrtenbuch. Wenn da „Cabrio, Kai, 23 Uhr“ steht, ohne Tareks Namen, ist er raus.'),
      L(M, 'Das Buch liegt im Büro hinter dem Laden in der Hochstadt, bei der Garage. Ich darf Ihnen nicht sagen, wie Sie es sich ansehen. Ich sage nur: Fotos reichen.'),
      { who: `📞 ${T.name}`, color: T.color, text: 'Mira ist gerade bei dir? Gib ihr kurz nicht zu hören. Mein Kumpel Flo hat noch einen Schlüssel. Reinschleichen, fertig.' },
      ME('Oder ich hole Lady Luma, und wir machen vor dem Laden eine Show. Der Wachmann ist Fan, das weiß die ganze Stadt.', [
        { label: '💃 Ricos Weg: Show vor dem Laden', sub: 'Friedlich, laut, mit Glitzer', fn: () => { s.flags.tw_graf = 'rico'; graf(c, false); } },
        { label: '🕶️ Tareks Weg: Flos Schlüssel', sub: 'Leise, schnell, nicht ganz legal', fn: () => { s.flags.tw_graf = 'tarek'; graf(c, true); } },
        { label: 'Noch nicht', fn: () => {} }]),
    ]);
    return true;
  }
  return false;
}

function zeuge(c: StoryCtx) {
  const s = c.s;
  run(c, { id: 'tarek_zeuge', who: M.name, color: M.color, title: '💞 Wer hat es gesehen?', call: '', pay: 60, rep: 3, done: 'Dörte hat es gesehen.',
    steps: [S(-76, -2, 'Am Kai: Hein von der Fischbude fragen', '🐟'), S(2, 49, 'Taxifahrerin Dörte an der Tram Rainbow City', '🚕')] }, () => {
    c.say([
      DOERTE('Das kirschrote Cabrio? Klar. Zwei Typen in Graf-Classics-Jacken haben es um elf am Kai abgestellt, Schlüssel stecken lassen und telefoniert.'),
      DOERTE('Ich soll aussagen? Vor Gericht? Ich weiß nicht. Mit Graf legt man sich nicht an.'),
      { who: `📞 ${T.name}`, color: T.color, text: 'Biete ihr was an. Hundert Euro, und sie erinnert sich ganz genau. So läuft das.' },
      ME('So läuft das bei Orlando. Bei uns läuft das anders.', [
        { label: '💜 Ricos Weg: Sie zum Kiezabend einladen', sub: 'Mo und Hilde stehen hinter ihr', fn: () => { s.flags.tw_zeuge = 'rico'; } },
        { label: '🕶️ Tareks Weg: 100 € „Taxigeld“', sub: 'schneller, aber Mira wird es merken', fn: () => { s.flags.tw_zeuge = 'tarek'; s.money = Math.max(0, s.money - 100); } }]),
      DOERTE(() => (s.flags.tw_zeuge === 'tarek' ? 'Taxigeld. Na gut. Aber ich sage nur die Wahrheit, verstanden? Die gibt es nicht billiger.' : 'Hilde vom Regenbogenhaus kocht? Und alle kommen mit zum Gericht? Dann sage ich aus. Laut.')),
    ], () => next(c, 2, [L(M, s.flags.tw_zeuge === 'tarek' ? 'Dörte sagt aus. Und sie hat mir erzählt, dass sie Geld bekommen hat. Bitte nie wieder. Die Wahrheit muss nicht bezahlt werden.' : 'Dörte sagt aus, und der halbe Kiez kommt mit. Das macht Eindruck auf jeden Richter.'),
      L(M, `Nächster Schritt: ${KAUTION} € Kaution. Kein Datum, kein Druck.`)]));
  });
}

function graf(c: StoryCtx, sneak: boolean) {
  const s = c.s;
  const steps = sneak
    ? [S(-4, 40, 'Flo am Späti Lecker: Schlüssel holen', '🔑'), S(GRAF[0] + 5, GRAF[1] - 4, 'Hintertür von Graf Classics: reinschleichen', '🕶️'), S(GRAF[0] + 3, GRAF[1] - 6, 'Fahrtenbuch fotografieren', '📸'), S(MIRA[0], MIRA[1], 'Fotos zu Mira', '📁')]
    : [S(33.4, 20, 'Lady Luma an der One Love Bar abholen', '💃'), S(GRAF[0], GRAF[1], 'Vor Graf Classics: Show starten, der Wachmann schaut zu', '🪩'), S(GRAF[0] + 3, GRAF[1] - 6, 'Durchs Bürofenster: Fahrtenbuch fotografieren', '📸'), S(MIRA[0], MIRA[1], 'Fotos zu Mira', '📁')];
  run(c, { id: 'tarek_graf', who: M.name, color: M.color, title: '💞 Nacht bei Graf Classics', call: '', pay: 120, rep: 4, night: true, car: true, done: 'Das Fahrtenbuch ist im Kasten.', steps }, () => {
    if (sneak) c.wanted?.(1);
    next(c, 4, sneak ? [
      L(M, '„Cabrio, Kai, 23 Uhr, Polizei anrufen.“ In Orlandos Handschrift. Das ist es.'),
      L(M, 'Wie Sie da reingekommen sind, will ich nicht wissen. Vor Gericht zählt nur, dass ich jetzt weiß, wonach ich fragen muss. Die Polizei holt das Buch morgen ganz offiziell.'),
      O('Lady Luma', '#ff3fb0', 'Und ich hätte so gern getanzt. Nächstes Mal, Schätzchen.'),
    ] : [
      O('Lady Luma', '#ff3fb0', 'Drei Zugaben! Der Wachmann hat geweint. Und du hattest die ganze Zeit Zeit für Fotos, Schätzchen.'),
      L(M, '„Cabrio, Kai, 23 Uhr, Polizei anrufen.“ In Orlandos Handschrift, fotografiert von der Straße aus. Das darf ich verwenden.'),
      L(M, 'Haftprüfung beantrage ich gleich morgen.'),
    ], () => c.toast(s.chapter >= 5 ? '💞 Tarek kommt raus: ab zur Polizeiwache!' : '💞 Die Haftprüfung kommt in Kapitel 5. Kein Zeitdruck.'));
  });
}

function letzte(c: StoryCtx) {
  const s = c.s;
  run(c, { id: 'tarek_letzte', who: T.name, color: T.color, title: '💞 Die letzte Fahrt', call: '', pay: 400, rep: 10, night: true, car: true, done: 'Orlando Graf ist gefasst.',
    steps: [S(105, -21, 'Zur Laternenmeile: Dort verlädt Orlando', '🚚'),
      { x: 105, z: -21, label: 'Orlando gibt Gas! Dranbleiben, Sander ist unterwegs', icon: '🚨', chase: { car: 'car_sedan' } },
      S(BAR[0] + 1.5, BAR[1], 'Zurück zur One Love Bar: Hupkonzert für die Wagen', '🥂')] }, () => {
    c.say([
      SANDER('Orlando Graf ist festgenommen. Zehn gestohlene Wagen, ein Fahrtenbuch und eine Zeugin. Der Prozess gegen Tarek Saadi wird eingestellt.'),
      O('Orlando Graf', '#b0a48a', 'Tarek. Ausgerechnet du. Mit so einem Gutmenschen.'),
      L(T, 'Ja, Orlando. Ausgerechnet ich. Mit dem besten Menschen der Stadt. Tschüss.'),
      L(T, `${s.name}, weißt du, was das Komische ist? Ich dachte immer, ich muss für uns die krummen Dinger drehen. Dabei warst du die ganze Zeit der Mutigere.`),
      ME('Und du der Schnellere. Wir sind ein gutes Team.'),
      L(T, 'Tom sucht in seiner Werkstatt einen, der Autos kennt. Ehrlich. Ich fange Montag an.', [
        { label: '💞 Offen, ehrlich, zusammen', sub: 'Ihr bleibt eine offene Beziehung', fn: () => { s.flags.relModel = 'offen'; s.flags.tarekOpen = true; } },
        { label: '💍 Nur noch wir zwei', sub: 'Ab jetzt exklusiv', fn: () => { s.flags.relModel = 'mono'; s.flags.tarekOpen = false; } }]),
      L(T, () => (s.flags.tarekOpen ? 'Offen und ehrlich. Und nach Hause kommen wir zueinander. Abgemacht.' : 'Nur wir zwei. Ich hätte nie gedacht, dass ich das mal sage. Und es fühlt sich richtig an.')),
    ], () => {
      s.flags.tarek = TAREK_STEPS.length; s.flags.tarekEnd = s.day;
      c.reward(250, 10, 'Gitter und Glitzer');
      const w = ways(s);
      void c.card('Gitter und Glitzer abgeschlossen', w.t > w.r ? 'Zwei Seiten einer Medaille' : 'Frieden und Spaß',
        w.t > w.r ? 'Ein paar Abkürzungen auf Tareks Art, am Ende aber ein ehrlicher Neuanfang. Orlando Graf sitzt, Tarek schraubt bei Tom, und ihr zwei lacht über die Nacht im Büro.'
          : 'Ohne einen einzigen Schlag: Zeugin, Kaution, Show und Hupkonzert. Orlando Graf sitzt, Tarek schraubt bei Tom, und Rainbow City hat ein Lieblingspaar mehr.');
    });
  });
}

let calm = 0;
/** Anrufe von Tarek (aus storyTick): Auftakt aus der U-Haft, danach kurze Grüße bei neuen Etappen */
export function tarekTick(c: StoryCtx) {
  const s = c.s, f = s.flags;
  if (!tarekOn(s) || f.tarekRun || f.tarekEnd || c.gigOn?.()) { calm = 0; return; }
  if (++calm < 10) return;
  if (!f.tarekCall) {
    if (s.chapter === 1 && s.step < 3) return;   // erst Koffer abstellen
    calm = 0; f.tarekCall = true;
    c.phone(call(f.tarekIntro ? [
      `Ich bin’s. Ja, aus der Wache. Nein, mir geht’s gut. Das Essen ist schlechter als bei Mo, aber das ist alles.`,
      'Komm vorbei, wenn du kannst. Besuchsraum, Polizeiwache Mitte. Kein Stress, ich laufe nicht weg.',
    ] : [
      `${s.name}? Ich bin’s, Tarek. Ruf nicht gleich die Kavallerie, ich sitze in U-Haft. Polizeiwache Mitte.`,
      'Lange Geschichte, und sie ist nicht so, wie sie aussieht. Diesmal wirklich nicht.',
      'Komm vorbei, wenn du kannst. Besuchsraum. Kein Stress, ich laufe nicht weg. Wortwörtlich.',
    ]), () => void c.card('Story-Modus', 'Gitter und Glitzer', `Tarek, ${s.name}s große Liebe in einer offenen Beziehung, sitzt unschuldig in U-Haft. Hol ihn raus, Schritt für Schritt und ohne Zeitdruck. Jede Etappe öffnet sich mit einem neuen Kapitel.`));
    return;
  }
  // neue Etappe offen: Tarek meldet sich einmal
  const n = tarekDone(s), key = 'tarekPing' + n;
  if (n > 0 && n < TAREK_STEPS.length && ready(s) && !f[key] && !(n === 5 && s.chapter < 6)) {
    calm = 0; f[key] = true;
    c.phone(call([
      ['', 'Mira sagt, du sollst sie besuchen. Sie hat diesen Blick, du weißt schon. Den „Ich habe einen Plan“-Blick.',
        `Die Kaution, ja. ${KAUTION} €. Mach dir keinen Stress, ehrlich. Ich lerne hier gerade Häkeln.`,
        'Mira hat was über Orlandos Fahrtenbuch gehört. Geh zu ihr, aber erst nach 21 Uhr. Orlando ist tagsüber da.',
        'Mira hat angerufen: Haftprüfung bestanden! Holst du mich ab? Polizeiwache Mitte. Ich habe schon gepackt. Eine Zahnbürste.',
        'Orlando will verschwinden. Komm nachts zur One Love Bar. Diesmal machen wir es zusammen.'][n],
    ]));
  }
}
