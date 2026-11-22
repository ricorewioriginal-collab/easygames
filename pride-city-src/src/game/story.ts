/* Hauptgeschichte „Ein Leben in allen Farben“ – roter Faden vom Zuzug bis zur großen Pride.
   Fünf Kapitel, danach freies Spiel (chapter 6). Entscheidungen landen in save.flags und bestimmen das Ende. */
import type { SaveData } from '../engine/Save';
import type { Line } from '../ui/ui';
import type { Look } from './Actor';
import { LICHT_CHAPTERS, LICHT_PEOPLE, LICHT_START, LICHT_SHOW, LUMA, lichtEnding } from './licht';
import { SAGA_NPCS, sagaTalk, sagaGoal, sagaMarks, sagaHidden } from './saga';
import type { Gig } from './gigs';
import { LF_CHAPTERS, LF_PEOPLE, LF_START, lfEnding } from './leuchtfeuer';
import { NACHT_NPCS, nachtTalk, nachtGoal, nachtMarks, nachtFirst } from './nacht';
import { dragGoal } from './drag';
import { hour } from './life';
import { fadenGoal, fadenTick, fadenPoi, fadenDance, actLabel, history, extraTick, extraHush } from './faden';
import { aufTick, aufHush } from './aufstieg';
import { FLUT_NPCS, flutTalk, flutGoal, flutMarks, flutHidden, flutTick, flutHush } from './flut';
import { LUFT_NPCS, luftTalk } from './luft';
import { lineup, doneThisWeek, isOpen, KINDS } from './live';
import { crewTalk, crewGoal, crewMarks, crewTick } from './crew';

export interface NpcDef {
  id: string; name: string; pron: string; color: string; look: Look;
  x: number; z: number; yaw?: number;
  /** Wegpunkte zum Herumlaufen */
  walk?: Array<[number, number]>;
  anim?: 'idle' | 'sit' | 'cheer' | 'dance1';
  /** Unterschrift für das Regenbogenhaus möglich */
  petition?: boolean;
  /** nur nachts da */
  night?: boolean;
}

export const NPCS: NpcDef[] = [
  { id: 'mo', name: 'Mo', pron: 'sie/ihr', color: '#ff7a3d', look: { body: 'Woman', palette: 'lesbian', skin: 3 }, x: 6.3, z: 12.6, yaw: -Math.PI / 2 },
  { id: 'jules', name: 'Jules', pron: 'they/them', color: '#9c59d1', look: { body: 'Hero', palette: 'nonbinary', skin: 1, hair: 9 }, x: -6.3, z: -12.6, yaw: Math.PI / 2 },
  { id: 'nova', name: 'Nova', pron: 'sie/ihr', color: '#ff2fd2', look: { body: 'Woman2', palette: 'neon', skin: 4, hair: 7 }, x: 6.3, z: -12.8, yaw: -Math.PI / 2 },
  { id: 'rex', name: 'Rex', pron: 'er/ihn', color: '#3b4cff', look: { body: 'Man', palette: 'leather', skin: 2, hair: 0 }, x: 6.4, z: -7, yaw: -Math.PI / 2 },
  { id: 'bruno', name: 'Bruno', pron: 'er/ihn', color: '#d56300', look: { body: 'Man2', palette: 'bear', skin: 1, hair: 5 }, x: -6.3, z: 42.6, yaw: Math.PI / 2 },
  { id: 'lena', name: 'Lena', pron: 'sie/ihr', color: '#ff218c', look: { body: 'Woman2', palette: 'pan', skin: 0, hair: 1 }, x: -11, z: 20, walk: [[-11, 20], [-20, 22], [-21, 9], [-10, 9]], petition: true },
  { id: 'tariq', name: 'Tariq', pron: 'er/ihn', color: '#9b4f96', look: { body: 'Man2', palette: 'bi', skin: 3, hair: 0 }, x: 40, z: 40, walk: [[40, 40], [50, 40], [50, 50], [40, 50]], petition: true },
  { id: 'hilde', name: 'Hilde', pron: 'sie/ihr', color: '#a3a3a3', look: { body: 'Woman', palette: 'ace', skin: 0, hair: 6 }, x: -19.2, z: 19.2, anim: 'sit', petition: true },
  { id: 'sam', name: 'Sam', pron: 'er/ihn', color: '#5bcefa', look: { body: 'Man2', palette: 'trans', skin: 2, hair: 3 }, x: 4, z: 30, walk: [[4, 30], [4, 48], [-4, 48], [-4, 30]], petition: true },
  { id: 'leon', name: 'Leon', pron: 'er/ihn', color: '#ff7ac8', look: { body: 'Man', palette: 'rainbow', skin: 2, hair: 0 }, x: 33.9, z: 22.4, yaw: -Math.PI / 2 },
  { id: 'finn', name: 'Finn', pron: 'er/ihn', color: '#f2b544', look: { body: 'Man2', palette: 'rainbow', skin: 0, hair: 1 }, x: -108.5, z: -2, yaw: Math.PI / 2 },
  // Figuren aus „Leuchtfeuer“, heute erwachsen und in Rainbow City zu Hause (ab Kapitel 2 am Hafen)
  { id: 'ben', name: 'Ben', pron: 'er/ihn', color: '#2f8f5a', look: { body: 'Man', palette: 'gay', skin: 1, hair: 2 }, x: -106.5, z: -2.8, yaw: Math.PI / 2 },
  { id: 'lotte', name: 'Lotte', pron: 'sie/ihr', color: '#ee7a1f', look: { body: 'Woman', palette: 'lesbian', skin: 0, hair: 3 }, x: -80.6, z: 26, yaw: -Math.PI / 2 },
  { id: 'pia', name: 'Pia', pron: 'sie/ihr', color: '#d54a6e', look: { body: 'Woman2', palette: 'pan', skin: 0, hair: 1 }, x: -71, z: 2, walk: [[-71, 2], [-71, 18], [-75, 18], [-75, 2]] },
  { id: 'joerg', name: 'Jörg Albrecht', pron: 'er/ihn', color: '#8fa0aa', look: { body: 'Man2', palette: 'bear', skin: 1, hair: 5 }, x: -76.5, z: -24, yaw: -Math.PI / 2 },
  { id: 'anke', name: 'Anke Albrecht', pron: 'sie/ihr', color: '#9c5066', look: { body: 'Woman', palette: 'ace', skin: 1, hair: 6 }, x: -76.5, z: -22.4, yaw: -Math.PI / 2 },
  { id: 'samira', name: 'Samira', pron: 'sie/ihr', color: '#1e6fb6', look: { body: 'Woman2', palette: 'bi', skin: 4, hair: 2 }, x: -83, z: 34, yaw: Math.PI },
  { id: 'tobi', name: 'Tobi', pron: 'er/ihn', color: '#c9a26a', look: { body: 'Man2', palette: 'rainbow', skin: 0, hair: 3 }, x: -70, z: 30, walk: [[-70, 30], [-70, 40], [-76, 40], [-76, 30]] },
  ...SAGA_NPCS,
  ...NACHT_NPCS,
  ...FLUT_NPCS,
  ...LUFT_NPCS,
  { id: 'kim', name: 'Kim', pron: 'they/them', color: '#3da542', look: { body: 'Woman', palette: 'aro', skin: 4, hair: 2 }, x: -26, z: -20, walk: [[-26, -20], [-26, -4], [-14, -4], [-14, -20]], petition: true },
];

export const CHAPTERS = [
  { n: 1, title: 'Ankommen', text: 'Neue Stadt, neue Leute: Du ziehst nach Rainbow City – und merkst schnell, dass das Regenbogenhaus Hilfe braucht.' },
  { n: 2, title: 'Wurzeln schlagen', text: 'Job, Wohnung, Freundeskreis: Du baust dir dein Leben auf und findest deine Wahlfamilie.' },
  { n: 3, title: 'Die Szene', text: 'Clubnächte, Drag-Shows und eine Rivalität, die mehr ist als ein Tanz-Battle.' },
  { n: 4, title: 'Gegenwind', text: 'DJ Nova verschwindet spurlos. Du sammelst Hinweise – und kommst einem Investor auf die Spur.' },
  { n: 5, title: 'Pride', text: 'Die große Parade. Deine Entscheidungen bestimmen, wie Rainbow City feiert.' },
];

export interface StoryCtx {
  s: SaveData;
  /** Original-Romanspiel im Vollbild öffnen (alle Kapitel, Minispiele, Figuren) */
  roman?(id: 'licht' | 'leuchtfeuer', game?: string, done?: () => void): void;
  say(lines: Line[], done?: () => void): void;
  toast(t: string): void;
  reward(money: number, rep: number, why: string): void;
  step(n: number): void;
  skipToHour(h: number): void;
  hour(): number;
  dance(): void;
  /** Kapitel abschließen: Zusammenfassung, nächstes Kapitel beginnt */
  chapterDone(sum: string): void;
  enterHome(after?: () => void): void;
  /** Barkeeper-Schicht im eigenen Club */
  barShift(done?: () => void): void;
  /** Abspann nach dem Finale */
  credits(): void;
  /** Kapitelkarte (Rückblende) */
  card(kick: string, title: string, text: string): Promise<void>;
  /** Mission mit Stationen und Zeit starten (Akt II) */
  mission(g: Gig): void;
  /** 3D-Minispiel spielen (minis.ts), danach weiter (won = Ziel erreicht) */
  mini?(id: string, done?: (won: boolean) => void): void;
  /** Anruf: Handy klingelt, dann das Gespräch */
  phone(lines: Line[], done?: () => void): void;
  /** läuft gerade ein Auftrag oder eine Mission */
  gigOn?(): boolean;
  /** Fahndung (Akt V): mit n Sterne setzen; liefert die aktuellen Sterne */
  wanted?(n?: number): number;
}

const me = (s: SaveData) => s.name;
const L = (who: NpcDef | string, text: Line['text'], choices?: Line['choices']): Line => {
  if (typeof who === 'string') return { who, text, choices, color: '#444' };
  return { who: who.name, pron: who.pron, color: who.color, text, choices };
};
const npc = (id: string) => NPCS.find((n) => n.id === id)!;
const sigs = (s: SaveData) => Object.keys(s.flags).filter((k) => k.startsWith('sig_') && s.flags[k] === true).length;

export interface Goal { title: string; sub?: string; npc?: string; poi?: string; /** Insel der Kette (Akt III): Lichtsäule bei der Gastgeberin */ isle?: string }

/** Kapitel-Überschrift für HUD und Pause */
export function chapterLabel(s: SaveData) {
  const c = CHAPTERS[s.chapter - 1];
  return c ? `Kapitel ${c.n} · ${c.title}` : actLabel(s);
}
const shifts = (s: SaveData) => Object.values(s.jobs).reduce((a, j) => a + (j.shifts || 0), 0);
const known = (s: SaveData) => NPCS.filter((n) => (s.rel[n.id]?.f || 0) > 0).length;
const count = (s: SaveData, pre: string, ids: string[]) => ids.filter((id) => s.flags[pre + id]).length;
export const CLUES = ['rex', 'bruno', 'kim'];
export const HELPERS = ['lena', 'bruno', 'tariq'];
export const BAR_COST = 300;

/** Aktuelles Ziel aus Kapitel und Schritt */
export function goal(s: SaveData): Goal {
  if (s.chapter === 2) switch (s.step) {
    case 0: return { title: 'Frag Mo nach Arbeit', sub: 'Mo kennt jeden Laden im Kiez.', npc: 'mo' };
    case 1: return { title: 'Arbeite deine erste Schicht', sub: 'Handy → Jobs zeigt, wo du anfangen kannst. Am Arbeitsort „Schicht“ wählen.' };
    case 2: return { title: `Lerne Leute kennen (${Math.min(6, known(s))}/6)`, sub: 'Sprich mit allen, die dir über den Weg laufen.' };
    case 3: return { title: 'Abendessen bei Hilde auf der Pride Plaza', sub: 'Ab 18 Uhr wartet die Wahlfamilie.', npc: 'hilde' };
  }
  if (s.chapter === 3) switch (s.step) {
    case 0: return { title: 'Nova hat eine Idee', sub: 'Sie steht vor dem Club Prisma.', npc: 'nova' };
    case 1: return { title: 'Hol dir deinen Drag-Look', sub: 'In der Boutique Fabelhaft im Osten.', poi: 'boutique' };
    case 2: return { title: 'Drag-Show und Revanche gegen Rex', sub: 'Ab 21 Uhr im Club Prisma – sprich Nova an.', npc: 'nova' };
    case 3: return { title: 'Rede mit Rex', sub: 'Er wartet vor dem Club.', npc: 'rex' };
    case 4: return { title: s.money >= BAR_COST ? 'Eröffne deinen Club am Hafen' : `Spare ${BAR_COST} € für deinen eigenen Club (${s.money}/${BAR_COST})`, sub: 'Die alte Lagerhalle im Hafenviertel steht leer. Mit der Tram oder zu Fuß nach Westen.', poi: 'bar' };
  }
  if (s.chapter === 4) switch (s.step) {
    case 0: return { title: 'Jules braucht dich – sofort', sub: 'Im Regenbogenhaus.', npc: 'jules' };
    case 1: return { title: `Such Hinweise auf Nova (${count(s, 'clue_', CLUES)}/3)`, sub: 'Frag Rex, Bruno und Kim. 🔎 zeigt, wer etwas weiß.' };
    case 2: return { title: 'Lass die Fotos im Studio vergrößern', sub: 'Studio Klappe Auf im Westen.', poi: 'studio' };
    case 3: return { title: 'Nachts zum Wasserturm im Park', sub: 'Ab 22 Uhr. Der Park liegt im Südosten.', poi: 'park' };
    case 4: return { title: 'Zurück zu Jules ins Regenbogenhaus', sub: 'Mit Beweisen gegen Glanz Immobilien.', npc: 'jules' };
  }
  if (s.chapter === 5) switch (s.step) {
    case 0: return { title: 'Plane die Pride mit Jules', npc: 'jules' };
    case 1: return { title: `Hol Leute ins Pride-Team (${count(s, 'help_', HELPERS)}/3)`, sub: 'Lena, Bruno und Tariq. 🏳️‍🌈 zeigt, wer fehlt.' };
    case 2: return { title: 'Die Parade beginnt auf der Pride Plaza', sub: 'Ab 12 Uhr. Alle warten auf dich! Der Pride-Bus „CSD-Shuttle“ steht an der Polizeiwache.', poi: 'plaza' };
  }
  const ng = nachtGoal(s);
  if (ng && (s.flags.nachtRun || (s.chapter > 5 && !s.flags.sagaRun && nachtFirst(s)))) return ng;
  const sg = sagaGoal(s);
  if (sg && (s.chapter > 5 || s.flags.sagaRun)) return sg;
  const fg = fadenGoal(s); if (fg) return fg;
  const flg = flutGoal(s); if (flg) return flg;
  const crg = crewGoal(s); if (crg) return crg;
  const sat = (s.day - 1) % 7 === 5, h = hour(s);
  if (s.chapter > 5 && s.flags.wagen && sat && h >= 12 && h < 18 && s.flags.wagenPrize !== s.day) return { title: 'CSD-Parade: Spring auf deinen Festwagen', sub: 'Bis 18 Uhr auf der Hauptstraße. Bleib oben, bis die Jury deinen Wagen gesehen hat.' };
  const dg = s.chapter > 3 ? dragGoal(s) : null;
  if (dg) return { title: dg, sub: 'Mama Vega wartet: erst an den Schminkspiegel, dann auf die Bühne.', poi: 'onelove' };
  if (s.chapter > 5 && !s.flags.wagen) return { title: 'Bau deinen eigenen CSD-Festwagen', sub: 'Handy → Wetter und Termine oder in einer Festwagen-Werkstatt. Samstags fährt er bei der Parade mit, die Jury vergibt Platz 1 bis 3.' };
  // Flugschule Möwenflug (luft.ts): nach Sunnys Anruf erst der Schnupperflug
  if (s.flags.luftCall && !s.flags.luftSchein) return { title: 'Schnupperflug bei Captain Sunny', sub: 'Flugschule Möwenflug am Südende vom Kai. Wasserflugzeug oder Helikopter, fünf Ringe, eine Landung.', npc: 'sunny' };
  // Live-Event der Woche (live.ts), sobald Kiki davon erzählt hat und gerade eines läuft
  if (s.flags.liveCall) { const e = lineup().find((x) => !doneThisWeek(s, x.kind) && isOpen(s, x.kind)); if (e) return { title: `LIVE: ${e.name}`, sub: `${KINDS[e.kind].icon} ${KINDS[e.kind].name} der Woche mit ${e.host}${e.kind === 'boot' ? ' · Im Glitzer-Boot am Steg der Strandbar anhalten' : ' · Folge dem Symbol auf dem Radar'}. Handy → Live-Events.` }; }
  if (s.chapter > 5 && !s.flags.radioShows) return { title: 'Moderiere „Rainbow Talk“ auf Pride FM', sub: 'Handy → Pride FM 88,8. Leute aus der Stadt rufen an, du antwortest live.' };
  if (s.chapter > 1 && s.chapter <= 5) return { title: 'Erkunde Rainbow City', sub: 'Sprich mit deinen Freund*innen – die Geschichte geht gleich weiter.' };
  if (s.chapter > 5) return { title: 'Freies Spiel', sub: 'Die Geschichte ist erzählt. Arbeite, date, feiere – Rainbow City gehört dir.' };
  switch (s.step) {
    case 0: case 1: return { title: 'Triff Mo im Café Kaffeeklatsch', sub: 'Mo wartet vor dem Café an der Hauptstraße.', npc: 'mo' };
    case 2: return { title: 'Bring deinen Koffer in deine Wohnung', sub: 'Deine Wohnung liegt im Süden an der Hauptstraße, hinter der Tram-Haltestelle.', poi: 'home' };
    case 3: return { title: 'Schau im Regenbogenhaus vorbei', sub: 'Im Norden, hinter der großen Kreuzung. Jules kümmert sich dort um alles.', npc: 'jules' };
    case 4: return { title: `Sammle Unterschriften (${sigs(s)}/3)`, sub: 'Sprich Leute mit ✍️ an. Ein Nein ist ein Nein – dann frag einfach jemand anderen.' };
    case 5: return { title: 'Bring die Liste zu Jules', npc: 'jules' };
    case 6: return { title: 'Geh abends in den Club Prisma', sub: 'Ab 21 Uhr legt Nova auf. Vor der Tür kannst du warten.', npc: 'nova' };
    default: return { title: 'Kapitel 1 abgeschlossen', sub: 'Freies Spiel' };
  }
}

/** Figuren, die gerade ein Symbol über dem Kopf brauchen */
export function marks(s: SaveData): Array<[string, string]> { return [...mainMarks(s), ...sagaMarks(s), ...nachtMarks(s), ...flutMarks(s), ...crewMarks(s)]; }
function mainMarks(s: SaveData): Array<[string, string]> {
  if (s.chapter === 1 && s.step === 4) return NPCS.filter((n) => n.petition && s.flags['sig_' + n.id] === undefined).map((n) => [n.id, '✍️']);
  if (s.chapter === 4 && s.step === 1) return CLUES.filter((id) => !s.flags['clue_' + id]).map((id) => [id, '🔎']);
  if (s.chapter === 5 && s.step === 1) return HELPERS.filter((id) => !s.flags['help_' + id]).map((id) => [id, '🏳️‍🌈']);
  return [];
}

/** Nova ist in Kapitel 4 verschwunden */
export function hidden(s: SaveData, id: string) { return sagaHidden(s, id) || flutHidden(s, id) || (id === 'nova' && s.chapter === 4 && s.step < 4) || (id === 'leon' && s.chapter < 2) || (['finn', 'ben', 'lotte', 'pia', 'joerg', 'anke', 'samira', 'tobi'].includes(id) && s.chapter < 2); }

/** Ziele, die sich von selbst erfüllen (Schicht gearbeitet, Leute kennengelernt) – zweimal pro Sekunde */
export function storyTick(c: StoryCtx) {
  const s = c.s;
  if (s.chapter === 2 && s.step === 1 && shifts(s) >= 1) { c.step(2); c.reward(0, 3, 'Erste Schicht geschafft'); }
  else if (s.chapter === 2 && s.step === 2 && known(s) >= 6) { c.step(3); c.toast('💌 Hilde: „Heute Abend Essen bei mir auf der Plaza. Keine Widerrede!“'); }
  else if (s.chapter === 3 && s.step === 4 && s.flags.bar) c.chapterDone('Drag-Show, eine ehrliche Aussprache mit Rex und dein eigener Club: Du bist jetzt Teil der Szene.');
  else {
    // Akt IV (flut.ts) klingelt nur, wenn der rote Faden in diesem Takt nicht schon angerufen hat
    let rang = false;
    fadenTick({ ...c, phone: (l, d) => { rang = true; c.phone(l, d); } });
    if (rang) { flutHush(); extraHush(); aufHush(); return; }
    // Flugschule, Live-Events und Festtage (faden.ts) erst, wenn auch Akt IV/V gerade nichts zu sagen haben; der Aufstieg (aufstieg.ts) ganz zuletzt
    let rang4 = false;
    const quiet = { ...c, phone: (l: Parameters<typeof c.phone>[0], d?: Parameters<typeof c.phone>[1]) => { rang4 = true; c.phone(l, d); } };
    flutTick(quiet); crewTick(quiet);
    if (rang4) { extraHush(); aufHush(); return; }
    extraTick(quiet);
    if (rang4) aufHush(); else aufTick(c);
  }
}

/** Gespräch – true, wenn die Geschichte es übernommen hat */
export function talk(c: StoryCtx, id: string): boolean {
  if (crewTalk(c, id) || sagaTalk(c, id) || nachtTalk(c, id) || flutTalk(c, id) || luftTalk(c, id)) return true;
  const s = c.s, n = npc(id);
  if (!n) return false;
  if (s.chapter === 1) {
    if (id === 'mo' && s.step <= 1) {
      c.say([
        L(n, `${me(s)}! Da bist du ja endlich! Willkommen in Rainbow City.`),
        L(n, 'Und? Wie fühlt es sich an, hier zu sein?', [
          { label: 'Aufgeregt – ich will alles sehen!', fn: () => { s.flags.feel = 'excited'; } },
          { label: 'Ehrlich gesagt ein bisschen nervös.', fn: () => { s.flags.feel = 'nervous'; } },
          { label: 'Bereit. Hier fange ich neu an.', fn: () => { s.flags.feel = 'ready'; } },
        ]),
        L(n, () => (s.flags.feel === 'nervous' ? 'Völlig normal. Hier musst du niemandem was beweisen.' : 'So kenne ich dich!')),
        L(n, 'Hier sind deine Schlüssel. Die Wohnung ist im Süden, an der Hauptstraße. Bring erst mal deinen Koffer weg.'),
        L(n, 'Und danach: Schau im Regenbogenhaus vorbei. Jules kann jede Hand gebrauchen. Es gibt … Ärger.'),
      ], () => { c.step(2); c.reward(0, 2, 'Mo wiedergetroffen'); });
      return true;
    }
    if (id === 'jules' && s.step === 3) {
      c.say([
        L(n, 'Hey, du musst die neue Person sein, von der Mo erzählt hat. Ich bin Jules, they/them.'),
        L(n, 'Das Regenbogenhaus ist seit dreißig Jahren der Treffpunkt hier. Beratung, Jugendgruppe, Kaffee, Kummer.'),
        L(n, 'Jetzt will ein Investor das Haus kaufen. Wenn wir bis zur Pride nicht zeigen, dass der Kiez hinter uns steht, ist es weg.'),
        L(n, 'Hilfst du uns?', [
          { label: 'Laut: Wir machen Druck!', sub: 'Protest, Plakate, Aufmerksamkeit', fn: () => { s.flags.style = 'loud'; } },
          { label: 'Kreativ: Wir feiern dagegen an.', sub: 'Partys, Kunst, Musik', fn: () => { s.flags.style = 'creative'; } },
          { label: 'Diplomatisch: Wir reden mit allen.', sub: 'Gespräche, Bündnisse', fn: () => { s.flags.style = 'diplomatic'; } },
        ]),
        L(n, 'Das merke ich mir. Fang klein an: Wir brauchen drei Unterschriften von Leuten aus dem Kiez.'),
        L(n, 'Weißt du, warum wir jedes Jahr im Sommer feiern? Wegen einer Nacht in New York, 1969.'),
      ], () => { c.step(4); void history(s, 'k1', c.card); });
      return true;
    }
    if (id === 'jules' && s.step === 5) {
      c.say([
        L(n, 'Drei Unterschriften! Das ist ein Anfang. Danke dir.'),
        L(n, 'Heute Nacht gibt es im Club Prisma ein Benefiz-Battle. Wer gewinnt, bestimmt, wohin der Erlös geht.'),
        L(n, 'Rex tanzt für das Investoren-Team – die haben den Abend gesponsert. Nova legt auf. Zeig ihnen, was du kannst!'),
      ], () => c.step(6));
      return true;
    }
    if (id === 'nova' && s.step === 6) {
      if (c.hour() < 21 && c.hour() > 5) {
        c.say([L(n, 'Schätzchen, die Türen öffnen erst um 21 Uhr. Komm später wieder.', [
          { label: 'Bis 21 Uhr warten', fn: () => c.skipToHour(21) },
          { label: 'Später', fn: () => {} },
        ])]);
        return true;
      }
      c.say([
        L(n, `Du bist also ${me(s)}. Jules hat mir von dir erzählt.`),
        L(npc('rex'), 'Ein Neuling? Das wird schnell gehen.'),
        L(n, 'Große Worte, Rex. Auf die Tanzfläche, ihr zwei. Drei Runden, die Menge entscheidet!'),
      ], () => c.dance());
      return true;
    }
    if (n.petition && s.step === 4 && s.flags['sig_' + id] === undefined) {
      petition(c, n);
      return true;
    }
  }
  if (s.chapter === 2) {
    if (id === 'mo' && s.step === 0) {
      c.say([
        L(n, 'Na, Held*in vom Benefiz-Battle? Die halbe Stadt redet von dir.'),
        L(n, 'Aber Ruhm bezahlt keine Miete. Du brauchst einen Job.'),
        L(n, 'Ich suche jemanden fürs Café, Bruno braucht Hilfe im Späti, und in der Muckibude fehlt ein Coach. Schau mal auf dein Handy unter Jobs.', [
          { label: 'Ich fang gleich an!', fn: () => { s.flags.work = 'eager'; } },
          { label: 'Erst mal umschauen, dann entscheiden.', fn: () => { s.flags.work = 'calm'; } },
        ]),
        L(n, 'Und: Lern die Leute hier kennen. Eine Stadt wird erst durch ihre Menschen zu deinem Zuhause.'),
      ], () => c.step(1));
      return true;
    }
    if (id === 'hilde' && s.step === 3) {
      if (c.hour() < 18 && c.hour() > 5) {
        c.say([L(n, 'Kindchen, das Essen gibt es erst um 18 Uhr. Komm später wieder.', [
          { label: 'Bis 18 Uhr warten', fn: () => c.skipToHour(18) },
          { label: 'Später', fn: () => {} },
        ])]);
        return true;
      }
      c.say([
        L(n, 'Da bist du ja! Setz dich. Mo, Jules, Bruno – alle sind schon da.'),
        L(n, 'Weißt du, als ich jung war, hat uns die eigene Familie oft nicht gewollt. Also haben wir uns selbst eine gesucht.'),
        L(n, 'Was bringst du an den Tisch mit?', [
          { label: 'Meine Lieblingsmusik', sub: 'Die Runde tanzt zwischen Suppe und Nachtisch', fn: () => { s.flags.family = 'music'; } },
          { label: 'Selbst gebackenen Kuchen', sub: 'Bruno will das Rezept', fn: () => { s.flags.family = 'cake'; } },
          { label: 'Meine Geschichte', sub: 'Warum ich hergekommen bin', fn: () => { s.flags.family = 'story'; } },
        ]),
        L(npc('mo'), () => (s.flags.family === 'story' ? 'Danke, dass du uns das erzählt hast. Du gehörst dazu.' : 'Siehst du? Du gehörst schon dazu.')),
        L(npc('jules'), 'Auf die Wahlfamilie. Und aufs Regenbogenhaus!'),
      ], () => { c.reward(0, 10, 'Wahlfamilie gefunden'); c.chapterDone('Job, Freund*innen und eine Wahlfamilie: Rainbow City ist dein Zuhause geworden.'); });
      return true;
    }
  }
  if (s.chapter === 3) {
    if (id === 'nova' && s.step === 0) {
      c.say([
        L(n, 'Schätzchen! Ich plane die größte Drag-Show, die das Prisma je gesehen hat. Alle Einnahmen fürs Regenbogenhaus.'),
        L(n, 'Und rate, wer den Abend eröffnet? Du.'),
        L(n, 'Rex will sich revanchieren, er tanzt nach dir. Aber erst brauchst du einen Look. Ab in die Boutique Fabelhaft!'),
      ], () => c.step(1));
      return true;
    }
    if (id === 'nova' && s.step === 2) {
      if (c.hour() < 21 && c.hour() > 5) {
        c.say([L(n, 'Die Show beginnt um 21 Uhr. Schmink dich nicht zu früh ab!', [
          { label: 'Bis 21 Uhr warten', fn: () => c.skipToHour(21) },
          { label: 'Später', fn: () => {} },
        ])]);
        return true;
      }
      c.say([
        L(n, `Meine Damen, Herren und alle dazwischen und außerhalb: ${String(s.flags.drag || me(s))}!`),
        L(npc('rex'), 'Hübsches Kostüm. Mal sehen, ob du darin auch tanzen kannst.'),
        L(n, 'Bühne frei! Die Menge entscheidet.'),
      ], () => c.dance());
      return true;
    }
    if (id === 'rex' && s.step === 3) {
      c.say([
        L(n, 'Warte kurz. Ich … muss dir was sagen.'),
        L(n, 'Ich tanze nicht für die Investoren, weil ich sie mag. Glanz Immobilien zahlt meine Miete, seit ich meinen Job verloren habe.'),
        L(n, 'Ich hab mich geschämt. Deshalb war ich so ein Arsch.', [
          { label: 'Danke für deine Ehrlichkeit. Freunde?', sub: 'Rex wird dein Verbündeter', fn: () => { s.flags.rex = 'friend'; } },
          { label: 'Komm zu uns. Wir finden einen Job für dich.', sub: 'Rex legt später in deinem Club auf', fn: () => { s.flags.rex = 'dj'; } },
          { label: 'Das entschuldigt gar nichts.', sub: 'Rex bleibt dein Rivale', fn: () => { s.flags.rex = 'rival'; } },
        ]),
        L(n, () => (s.flags.rex === 'rival' ? 'Verstehe. Dann sehen wir uns auf der Tanzfläche.' : 'Das … bedeutet mir viel. Wirklich.')),
        L(npc('jules'), `Übrigens: Die alte Lagerhalle am Hafen steht leer. Mit ${BAR_COST} € kannst du sie mieten – Rainbow City braucht einen zweiten Club. Einen, der uns gehört.`),
      ], () => { c.step(4); c.reward(0, 3, 'Ehrliches Gespräch'); });
      return true;
    }
  }
  if (s.chapter === 4) {
    if (id === 'jules' && s.step === 0) {
      c.say([
        L(n, 'Gut, dass du da bist. Nova ist weg.'),
        L(n, 'Seit drei Tagen kein Set, kein Anruf, ihr Handy ist aus. Und gestern lag dieser Brief vor der Tür.'),
        L('Brief', '„Glanz Immobilien bedankt sich für Ihr Engagement. Das Regenbogenhaus wird zum 1. des Monats geräumt.“'),
        L(n, 'Ich glaube nicht an Zufälle. Frag herum – Rex, Bruno, Kim. Irgendwer hat etwas gesehen.'),
      ], () => c.step(1));
      return true;
    }
    if (s.step === 1 && CLUES.includes(id) && !s.flags['clue_' + id]) {
      const T: Record<string, Line[]> = {
        rex: [L(n, s.flags.rex === 'rival' ? 'Warum sollte ich dir helfen? … Na gut. Für Nova.' : 'Für dich? Sofort.'), L(n, 'Glanz hat Nova ein Angebot gemacht: Sie soll das Prisma verlassen und in seinem neuen Club auflegen. Sie hat abgelehnt. Laut.')],
        bruno: [L(n, 'Nova war vorgestern Nacht hier, hat Wasser und Brezeln gekauft. Viel zu viel für eine Person.'), L(n, 'Sie hatte Angst. Und ein Typ im Anzug hat draußen Fotos gemacht. Ich hab ihn auch fotografiert!')],
        kim: [L(n, 'Ich laufe nachts gern durch den Park. Am Wasserturm brannte die letzten Nächte Licht.'), L(n, 'Da ist sonst nie jemand. Und ich hab Bass gehört. Ganz leise.')],
      };
      c.say(T[id], () => {
        s.flags['clue_' + id] = true; c.reward(0, 2, 'Hinweis gefunden');
        if (count(s, 'clue_', CLUES) >= 3) { c.toast('🔎 Bruno hat dir seine Fotos geschickt. Lass sie im Studio vergrößern.'); c.step(2); }
      });
      return true;
    }
    if (id === 'jules' && s.step === 4) {
      const loud = s.flags.style === 'loud', dipl = s.flags.style === 'diplomatic';
      c.say([
        L(n, 'Nova ist zurück! Und die Fotos … Glanz hat Leute eingeschüchtert, damit niemand gegen den Verkauf aussagt.'),
        L(npc('nova'), 'Ich hab mich versteckt, weil ich dachte, ich bin allein. Ich hab mich geirrt.'),
        L(n, 'Was machen wir mit den Beweisen?', [
          { label: loud ? 'Ab damit in die Zeitung – heute noch!' : 'Öffentlich machen.', fn: () => { s.flags.proof = 'press'; } },
          { label: dipl ? 'Zum Bezirksamt. Mit allen Unterschriften.' : 'Zur Stadt bringen.', fn: () => { s.flags.proof = 'city'; } },
          { label: 'Glanz direkt konfrontieren.', fn: () => { s.flags.proof = 'face'; } },
        ]),
        L(n, () => (s.flags.proof === 'press' ? 'Die Schlagzeile morgen: „Investor bedroht Szene-DJ“. Glanz zieht sein Angebot zurück!' : s.flags.proof === 'city' ? 'Das Bezirksamt stellt das Regenbogenhaus unter Schutz. Glanz kann nichts mehr machen!' : 'Glanz war sprachlos. Ohne Nova kein neuer Club, ohne Ruhe kein Geschäft. Er zieht sich zurück.')),
        L(n, 'Das Regenbogenhaus bleibt. Und jetzt: Pride. Die größte, die diese Stadt je gesehen hat.'),
      ], () => { c.reward(150, 15, 'Regenbogenhaus gerettet'); c.chapterDone('Nova ist zurück, Glanz Immobilien hat aufgegeben – das Regenbogenhaus bleibt.'); });
      return true;
    }
  }
  if (s.chapter === 5) {
    if (id === 'jules' && s.step === 0) {
      c.say([
        L(n, 'Pride! In einer Woche. Und du bist im Orga-Team, keine Widerrede.'),
        L(n, 'Was ist dein Part?', [
          { label: 'Ich halte die Rede auf der Bühne', fn: () => { s.flags.role = 'speech'; } },
          { label: 'Ich baue den Wagen für den Club', fn: () => { s.flags.role = 'float'; } },
          { label: 'Ich tanze vorne weg', fn: () => { s.flags.role = 'dance'; } },
        ]),
        L(n, 'Perfekt. Wir brauchen noch Leute: Lena für die Plakate, Bruno für Essen und Getränke, Tariq als Ordner.'),
      ], () => c.step(1));
      return true;
    }
    if (s.step === 1 && HELPERS.includes(id) && !s.flags['help_' + id]) {
      const T: Record<string, string> = {
        lena: 'Plakate? Ich male dir die ganze Stadt bunt! Schon angefangen, eigentlich.',
        bruno: 'Essen für tausend Leute? Ich mach Brezeln in Regenbogenfarben. Ja, das geht!',
        tariq: 'Ordner? Klar. Ich passe auf, dass alle sicher feiern. Wasserstationen nicht vergessen!',
      };
      c.say([L(n, T[id])], () => {
        s.flags['help_' + id] = true; c.reward(0, 2, `${n.name} ist dabei`);
        if (count(s, 'help_', HELPERS) >= 3) { c.toast('🏳️‍🌈 Das Team steht! Die Parade beginnt auf der Pride Plaza.'); c.step(2); }
      });
      return true;
    }
  }
  if (id === 'leon') { licht(c); return true; }
  if (id === 'finn') { leuchtfeuer(c); return true; }
  if (LF_TALK[id]) { const t = LF_TALK[id]; c.say(t.map(([w, x]) => FP(w, x))); return true; }
  // Allgemeine Gespräche
  const lines: Record<string, string[]> = {
    mo: ['Kaffee geht heute aufs Haus. Morgen nicht mehr!', 'Wenn du was brauchst: Ich bin hier.'],
    jules: ['Das Regenbogenhaus gehört allen, die es brauchen.', 'Kaffee? Wir haben immer Kaffee.'],
    nova: ['Mein Pult, meine Regeln. Und die erste Regel: Spaß haben.', 'Das Prisma öffnet um 21 Uhr.'],
    rex: ['Glaub nicht, dass du nochmal Glück hast.', 'Training ist alles.'],
    bruno: ['Willkommen im Späti Lecker! Die Brezeln sind von heute.', 'Wenn du Hunger hast: Ich hab immer was da.'],
    lena: ['Hast du die neuen Murals am Platz gesehen?', 'Ich bin Lena. Pan, Künstlerin, chronisch zu spät.'],
    tariq: ['Der Park ist mein Lieblingsort. Ruhig, grün, bunt.', 'Ich laufe hier jeden Morgen.'],
    hilde: ['Ich war beim ersten CSD dabei, Kindchen. 1979!', 'Setz dich ruhig kurz zu mir.'],
    sam: ['Endlich mal eine Stadt, in der ich einfach Sam sein kann.', 'Die Tram fährt alle zehn Minuten.'],
    kim: ['Ich mag meine Freund*innen mehr als jedes Date.', 'Das Regenbogenhaus hat mir viel geholfen.'],
  };
  const pool = lines[id] || ['Hallo!'];
  c.say([L(n, pool[(s.day + id.length) % pool.length])]);
  return true;
}

function petition(c: StoryCtx, n: NpcDef) {
  const s = c.s;
  const ok = () => { s.flags['sig_' + n.id] = true; c.reward(0, 3, `${n.name} unterschreibt`); if (sigs(s) >= 3) c.step(5); else c.step(4); };
  const no = () => { s.flags['sig_' + n.id] = false; c.toast(`${n.name} möchte nicht. Das ist okay – frag jemand anderen.`); };
  const Q: Record<string, Line[]> = {
    lena: [L(n, 'Eine Petition? Erzähl mal, worum geht es?', [
      { label: 'Ums Regenbogenhaus – es soll verkauft werden.', fn: ok },
      { label: 'Unterschreib einfach, geht schnell.', fn: no },
    ])],
    tariq: [L(n, 'Ich unterschreibe nicht gern einfach so irgendwas …', [
      { label: 'Verstehe. Darf ich dir kurz erklären, worum es geht?', fn: ok },
      { label: 'Komm schon, alle machen mit!', fn: no },
    ])],
    hilde: [L(n, 'Das Regenbogenhaus? Da habe ich 1985 meine Frau kennengelernt.', [
      { label: 'Dann helfen Sie uns, es zu retten?', fn: ok },
      { label: 'Schön. Hier unterschreiben, bitte.', fn: ok },
    ])],
    sam: [L(n, 'Ich hab gerade echt keinen Kopf dafür.', [
      { label: 'Kein Problem. Vielleicht ein andermal.', fn: () => { s.flags['sig_' + n.id] = false; c.reward(0, 1, 'Respektiert'); } },
      { label: 'Dauert nur zehn Sekunden!', fn: no },
    ])],
    kim: [L(n, 'Fürs Regenbogenhaus? Klar, sofort. Die Jugendgruppe dort war mein Rettungsanker.', [
      { label: 'Danke dir, Kim!', fn: ok },
    ])],
  };
  c.say(Q[n.id] || [L(n, 'Ich unterschreibe.', [{ label: 'Danke!', fn: ok }])]);
}

/** Ort betreten – true, wenn die Geschichte es übernommen hat */
export function poi(c: StoryCtx, id: string): boolean {
  const s = c.s;
  if (fadenPoi(c, id)) return true;
  if (s.chapter === 1 && id === 'home' && s.step === 2) {
    c.enterHome(() => c.say([L('Du', 'Klein, aber meins. Ein Bett, eine Küche, eine Dusche – und von irgendwo kommt Musik.'), L('Du', 'Hier kann ich schlafen, kochen und mich frisch machen. Mit dem Handy behalte ich alles im Blick.'), L('Du', 'Okay. Raus durch die Tür und auf ins Regenbogenhaus.')], () => { c.step(3); c.reward(0, 2, 'Eingezogen'); }));
    return true;
  }
  if (s.chapter === 3 && s.step === 1 && id === 'boutique') {
    c.say([
      L('Boutique Fabelhaft', 'Eine Drag-Show? Dann brauchst du Glitzer, Absätze und einen Namen, der hängen bleibt.'),
      L('Boutique Fabelhaft', 'Wie soll deine Bühnenfigur heißen?', [
        { label: 'Lady Glitzerhafen', fn: () => { s.flags.drag = 'Lady Glitzerhafen'; } },
        { label: 'Miss Regenbogen', fn: () => { s.flags.drag = 'Miss Regenbogen'; } },
        { label: 'Divine Dynamite', fn: () => { s.flags.drag = 'Divine Dynamite'; } },
      ]),
      L('Boutique Fabelhaft', () => `${String(s.flags.drag)}! Fabelhaft. Der Look geht aufs Haus – für die gute Sache.`),
    ], () => { c.step(2); c.reward(0, 2, 'Drag-Look'); });
    return true;
  }
  if (s.chapter === 3 && s.step === 4 && id === 'bar' && !s.flags.bar) {
    if (s.money < BAR_COST) {
      c.say([L('Vermieterin', `Die Halle kostet ${BAR_COST} € Startmiete. Dir fehlen noch ${BAR_COST - s.money} €. Schichten im Job helfen!`)]);
      return true;
    }
    c.say([
      L('Vermieterin', `${BAR_COST} € Startmiete, und die Halle gehört dir. Strom, Wasser, Bass – alles da.`),
      L('Du', 'Abgemacht. Ab heute heißt sie Club Leuchtturm. Ein Licht für alle, die nach Hause finden wollen.'),
      L(npc('nova'), 'Ich leg zur Eröffnung auf! Und jetzt hinter die Bar mit dir – die ersten Gäste sind schon da.'),
    ], () => {
      s.money -= BAR_COST; s.flags.bar = true; c.reward(0, 10, 'Club Leuchtturm eröffnet');
      c.barShift(() => c.chapterDone('Drag-Show, eine ehrliche Aussprache mit Rex und dein eigener Club: Du bist jetzt Teil der Szene.'));
    });
    return true;
  }
  if (s.chapter === 4 && s.step === 2 && id === 'studio') {
    c.say([
      L('Studio Klappe Auf', 'Brunos Fotos? Lass mal vergrößern …'),
      L('Studio Klappe Auf', 'Der Mann im Anzug – das ist Gerd Glanz von Glanz Immobilien. Und hier im Hintergrund: der Wasserturm im Park. Mit Licht drin.'),
      L('Du', 'Nova versteckt sich im Wasserturm. Heute Nacht gehe ich hin.'),
    ], () => c.step(3));
    return true;
  }
  if (s.chapter === 4 && s.step === 3 && id === 'park') {
    if (c.hour() < 22 && c.hour() > 4) {
      c.say([L('Du', 'Tagsüber ist hier zu viel los. Ich komme nachts wieder.', [
        { label: 'Bis 22 Uhr warten', fn: () => c.skipToHour(22) },
        { label: 'Später', fn: () => {} },
      ])]);
      return true;
    }
    const n = npc('nova');
    c.say([
      L('Du', 'Nova? Ich bin es. Ich bin allein.'),
      L(n, '… Wie hast du mich gefunden?'),
      L(n, 'Glanz hat gedroht, das Prisma dichtzumachen, wenn ich nicht für ihn arbeite. Ich wollte niemanden mit reinziehen.'),
      L(n, 'Was soll ich jetzt tun?', [
        { label: 'Komm zurück. Wir stehen hinter dir.', fn: () => { s.flags.nova = 'back'; } },
        { label: 'Wir haben Beweise. Er kommt damit nicht durch.', fn: () => { s.flags.nova = 'fight'; } },
      ]),
      L(n, 'Okay. Für das Regenbogenhaus. Und für dich.'),
    ], () => { c.step(4); c.reward(0, 5, 'Nova gefunden'); });
    return true;
  }
  if (s.chapter === 5 && s.step === 2 && id === 'plaza') {
    if (c.hour() < 12 && c.hour() > 4) {
      c.say([L(npc('jules'), 'Die Parade startet um 12 Uhr! Noch kurz Glitzer nachlegen?', [
        { label: 'Bis 12 Uhr warten', fn: () => c.skipToHour(12) },
        { label: 'Später', fn: () => {} },
      ])]);
      return true;
    }
    const role = s.flags.role;
    c.say([
      L(npc('jules'), 'Schau dich um. Tausende Menschen. Und alle sind gekommen, weil wir nicht aufgegeben haben.'),
      L(role === 'speech' ? 'Du' : npc('mo'), role === 'speech' ? 'Ich weiß noch, wie nervös ich war, als ich hier ankam. Heute weiß ich: Hier darf ich sein, wer ich bin. Und ihr auch!' : role === 'float' ? 'Der Wagen vom Club Leuchtturm! Hast du den wirklich selbst gebaut?' : 'Du tanzt vorne weg? Dann zeig allen, wie man feiert!'),
      L(npc('nova'), c.mini ? 'Der Wagen vom Regenbogenhaus fährt los! Lauf vorne mit, am Ende der Strecke wird getanzt.' : 'Musik ab! Rainbow City, TANZT!'),
    ], () => { if (c.mini) c.mini('run', () => c.say([L(npc('nova'), 'Angekommen! Musik ab! Rainbow City, TANZT!')], () => c.dance())); else c.dance(); });
    return true;
  }
  return false;
}

/** Ende der Geschichte – Text hängt von den Entscheidungen ab */
export function ending(s: SaveData): Line[] {
  const out: Line[] = [];
  out.push(L(npc('jules'), s.flags.style === 'loud' ? 'Wir waren laut, und die Stadt hat zugehört.' : s.flags.style === 'creative' ? 'Wir haben dagegen angefeiert – und gewonnen.' : 'Wir haben mit allen geredet. Und am Ende standen alle hinter uns.'));
  if (s.flags.rex === 'rival') out.push(L(npc('rex'), 'Nächstes Jahr schlage ich dich. Versprochen. … Schöne Parade.'));
  else out.push(L(npc('rex'), s.flags.rex === 'dj' ? 'Ab nächster Woche lege ich jeden Freitag im Leuchtturm auf. Danke, Boss.' : 'Danke, dass du mir eine Chance gegeben hast.'));
  out.push(L(npc('hilde'), s.flags.family === 'cake' ? 'Und jetzt Kuchen für alle! Das Rezept kennt inzwischen die ganze Plaza.' : 'Seit 1979 war ich auf jeder Pride. Diese war die schönste.'));
  out.push(L(npc('mo'), s.rep >= 80 ? 'Weißt du, was die Leute über dich sagen? Dass Rainbow City ohne dich nicht dieselbe wäre.' : 'Ich bin stolz auf dich. Und das hier ist erst der Anfang.'));
  if (s.flags.lfEnd) out.push(FP('finn', 'Ben und ich laufen ganz vorne mit. Und heute Nacht brennt der Leuchtturm am Steg für alle.'));
  if (s.flags.lichtEnd) out.push(LP('luma', 'Und jetzt alle zusammen, Rainbow City: Ich bin das Licht!'));
  out.push(L('Rainbow City', 'Ende der Geschichte – aber nicht deines Lebens hier. Arbeite, date, feiere, und führe deinen Club weiter.'));
  return out;
}

/** Nach dem Tanz-Battle */
export function danceResult(c: StoryCtx, won: boolean) {
  const s = c.s;
  if (fadenDance(c, won)) return;
  if (s.flags.lichtShow) {
    s.flags.lichtShow = false;
    addLight(s, won ? LICHT_SHOW : 10);
    s.flags.licht = Number(s.flags.licht || 0) + 1;
    c.say([LP('velvet', won ? 'Hörst du das? Der ganze Saal singt mit. DAS ist Lady Luma.' : 'Ein paar Schritte daneben, aber deine Stimme war echt. Das zählt.'), LP('leon', 'Komm nachher noch mal zu mir. Die Geschichte ist noch nicht ganz zu Ende.')], () => c.reward(won ? 40 : 15, 4, 'Lady Lumas Show'));
    return;
  }
  if (s.chapter === 3 && s.step === 2) {
    if (!won) { c.say([L(npc('nova'), 'Rex hatte heute die Menge. Kopf hoch, Schätzchen – sprich mich an, wenn du nochmal willst.')]); return; }
    c.say([L(npc('nova'), `${String(s.flags.drag || me(s))} reißt das Prisma ab! Die Revanche geht an dich!`), L(npc('rex'), '… Okay. Du bist gut. Komm nach der Show kurz raus.')], () => { c.reward(80, 8, 'Drag-Show'); c.step(3); });
    return;
  }
  if (s.chapter === 5 && s.step === 2) {
    c.say([L(npc('nova'), won ? 'DIE GANZE STADT TANZT MIT DIR!' : 'Die Menge liebt dich – ob Bestnote oder nicht!'), ...ending(s)], () => {
      c.reward(won ? 200 : 120, 20, 'Pride-Parade');
      c.chapterDone('Die größte Pride, die Rainbow City je gesehen hat. Danke fürs Spielen!');
      c.credits();
    });
    return;
  }
  if (s.chapter !== 1 || s.step !== 6) { if (won) c.reward(25, 2, 'Battle gewonnen'); return; }
  if (!won) {
    c.say([L(npc('nova'), 'Knapp! Rex hatte heute die Menge. Atme durch und fordere ihn nochmal heraus.')]);
    return;
  }
  c.say([
    L(npc('nova'), 'DIE MENGE HAT ENTSCHIEDEN! Der Erlös geht ans Regenbogenhaus!'),
    L(npc('rex'), '… Nicht schlecht. Wirklich nicht schlecht.'),
    L(npc('jules'), s.flags.style === 'creative' ? 'Siehst du? Wir feiern dagegen an – und gewinnen!' : 'Das war der Anfang. Jetzt wissen alle, dass wir da sind.'),
  ], () => { c.reward(120, 15, 'Benefiz-Battle gewonnen'); c.chapterDone('Das Regenbogenhaus hat neue Hoffnung – und du hast Freund*innen gefunden.'); });
}

/** Nebengeschichten laufen parallel zur Hauptstory: pro Kapitel wird nur ein Teil der Rückblenden frei, der Rest nach der Pride. */
const SIDE_SHARE: Record<number, number> = { 2: .25, 3: .5, 4: .75, 5: .92 };
export const sideOpen = (s: SaveData, total: number) => s.chapter >= 6 ? total : Math.max(1, Math.floor(total * (SIDE_SHARE[s.chapter] || 0)));
const SIDE_WAIT: Record<number, string> = {
  2: 'Leb dich erst mal ein – such dir Arbeit und Leute. Wenn du in der Szene angekommen bist, erzähl ich weiter.',
  3: 'Du hast gerade genug mit deinem Drag-Debüt und dem Club zu tun. Wenn der Leuchtturm offen hat, erzähl ich weiter.',
  4: 'Erst muss Nova wieder auftauchen. Danach hab ich wieder Kopf für alte Geschichten.',
  5: 'Den Schluss erzähl ich dir nach der Parade. Der passt nur dahin.',
};
const sideWait = (s: SaveData) => SIDE_WAIT[s.chapter] || SIDE_WAIT[2];

/* ---------- „Ich bin das Licht“: Leons Geschichte in Rückblenden (ab Kapitel 2, One Love Bar) ---------- */
const LP = (id: string, text: Line['text'], choices?: Line['choices']): Line => {
  const p = LICHT_PEOPLE[id];
  return p ? { who: p.name, pron: p.pron, color: p.color, text, choices } : { who: 'Erzählung', color: '#9a8fb8', text, choices };
};
const addLight = (s: SaveData, n: number) => { s.flags.lichtLight = Math.max(0, Math.min(100, Number(s.flags.lichtLight ?? LICHT_START) + n)); };
export const lichtLight = (s: SaveData) => Number(s.flags.lichtLight ?? LICHT_START);
export const lichtPart = (s: SaveData) => Number(s.flags.licht || 0);

export function licht(c: StoryCtx) {
  const s = c.s, i = lichtPart(s);
  if (!s.flags.lichtIntro) {
    c.say([
      LP('leon', `Hey, du bist ${me(s)}, oder? Ich bin Leon. Und abends, auf der Bühne der One Love Bar, bin ich Lady Luma.`),
      LP('leon', 'Weißt du, ich war auch mal neu hier. Und davor … ein Junge an einem Esstisch, an dem keiner redet.'),
      LP('leon', 'Willst du meine Geschichte hören? Sie heißt „Ich bin das Licht“.', [
        { label: 'Ja, erzähl mir alles.', fn: () => { s.flags.lichtIntro = true; s.flags.lichtLight = LICHT_START; } },
        { label: 'Später gern.', fn: () => {} },
      ]),
    ], () => { if (s.flags.lichtIntro) setTimeout(() => part(c, 0), 60); });
    return;
  }
  if (i >= LICHT_CHAPTERS.length) {
    const e = lichtEnding(lichtLight(s));
    c.say([LP('leon', `Danke, dass du mir zugehört hast. Mein Ende heißt „${e.title}“.`), LP('leon', 'Den ganzen Roman kannst du übrigens im Handy lesen, unter 📖 „Ich bin das Licht“.')]);
    return;
  }
  if (i >= sideOpen(s, LICHT_CHAPTERS.length)) { c.say([LP('leon', sideWait(s))]); return; }
  c.say([LP('leon', i === 0 ? 'Wo war ich? Ach ja, ganz am Anfang.' : 'Setz dich. Ich erzähl weiter.', [
    { label: 'Weiter zuhören', fn: () => setTimeout(() => part(c, i), 60) },
    { label: 'Ein andermal', fn: () => {} },
  ])]);
}

function part(c: StoryCtx, i: number) {
  const s = c.s, ch = LICHT_CHAPTERS[i];
  const lines: Line[] = ch.lines.map(([who, t]) => LP(who, t));
  let reply = '';
  const next = () => { s.flags.licht = i + 1; c.reward(0, 2, 'Leons Geschichte'); };
  if (ch.choices) lines.push(LP(ch.cast.includes('luma') ? 'luma' : 'leon', 'Was tust du an Leons Stelle?', ch.choices.map((x) => ({ label: x.t, sub: `+${x.light} Licht`, fn: () => { addLight(s, x.light); reply = x.r; } }))), LP('', () => reply));
  if (ch.studio) {
    const pick = (k: keyof typeof LUMA, q: string) => LP('leon', q, LUMA[k].map((v) => ({ label: v, fn: () => { s.flags['luma_' + k] = v; } })));
    lines.push(pick('wig', 'Welche Perücke trägt Lady Luma?'), pick('dress', 'Und welches Kleid?'), pick('jewel', 'Dazu?'),
      LP('luma', () => `${String(s.flags.luma_dress)}, ${String(s.flags.luma_wig)}, ${String(s.flags.luma_jewel)}. Hallo, Lady Luma.`));
  }
  c.card(`Rückblende · Kapitel ${ch.n}`, ch.title, 'Ich bin das Licht – Leons Geschichte').then(() => {
    if (ch.show) { c.say([...lines, LP('velvet', 'Bühne frei für Lady Luma! Spiel den Buchsong – jeder Treffer bringt Licht.')], () => { s.flags.lichtShow = true; c.dance(); }); return; }
    if (ch.end) {
      const e = () => lichtEnding(lichtLight(s));
      c.say([...lines, LP('', () => `Ende: „${e().title}“ – ${e().text}`), LP('leon', 'Und jetzt bin ich hier, in Rainbow City. Mit dir.')], () => {
        next(); s.flags.lichtEnd = e().id; c.reward(0, 10, '„Ich bin das Licht“ zu Ende erlebt');
        c.card('Ich bin das Licht', e().title, e().text);
      });
      return;
    }
    c.say(lines, () => { if (ch.studio) addLight(s, 6); next(); });
  });
}

/* ---------- „Leuchtfeuer“: Finns Geschichte in Rückblenden (ab Kapitel 2, Leuchtturm auf dem Steg am Hafen) ---------- */
const FP = (id: string, text: Line['text'], choices?: Line['choices']): Line => {
  const p = LF_PEOPLE[id];
  return p ? { who: p.name, pron: p.pron, color: p.color, text, choices } : { who: 'Erzählung', color: '#7fa6c9', text, choices };
};
const addGlow = (s: SaveData, n: number) => { s.flags.lfGlow = Math.max(0, Number(s.flags.lfGlow ?? LF_START) + n); };
export const lfGlow = (s: SaveData) => Number(s.flags.lfGlow ?? LF_START);
export const lfPart = (s: SaveData) => Number(s.flags.lf || 0);

export function leuchtfeuer(c: StoryCtx) {
  const s = c.s, i = lfPart(s);
  if (!s.flags.lfIntro) {
    c.say([
      FP('finn', `Hey, ${me(s)}. Ich bin Finn. Ben und ich wohnen seit letztem Sommer in Rainbow City – wegen des Leuchtturms hier am Steg komme ich jeden Abend her.`),
      FP('finn', 'Er erinnert mich an zu Hause. An Warnholm, an mein letztes Schuljahr, an den Leuchtturm Rotenhorn. Und daran, wie Ben und ich uns gefunden haben.'),
      FP('finn', 'Willst du die Geschichte hören? Sie heißt „Leuchtfeuer“.', [
        { label: 'Ja, erzähl.', fn: () => { s.flags.lfIntro = true; s.flags.lfGlow = LF_START; } },
        { label: 'Später gern.', fn: () => {} },
      ]),
    ], () => { if (s.flags.lfIntro) setTimeout(() => lfChapter(c, 0), 60); });
    return;
  }
  if (i >= LF_CHAPTERS.length) {
    const e = lfEnding(lfGlow(s));
    c.say([FP('finn', `Danke fürs Zuhören. Unser Ende heißt „${e.title}“.`), FP('finn', 'Das ganze Buch steht übrigens im Handy, unter 🗼 „Leuchtfeuer“.')]);
    return;
  }
  if (i >= sideOpen(s, LF_CHAPTERS.length)) { c.say([FP('finn', sideWait(s))]); return; }
  c.say([FP('finn', i === 0 ? 'Also, ganz von vorn. Erster Schultag.' : 'Setz dich auf den Steg. Ich erzähl weiter.', [
    { label: 'Weiter zuhören', fn: () => setTimeout(() => lfChapter(c, i), 60) },
    { label: 'Ein andermal', fn: () => {} },
  ])]);
}

/** Minispiel einer Leuchtfeuer-Rückblende (Original-Spiel, Sprung direkt hinein) */
function lfGameId(g?: string) {
  if (!g) return '';
  return g.startsWith('🗼') ? 'beam' : g.startsWith('🎨') ? 'poster' : g.startsWith('💨') ? 'run' : g.startsWith('🐟') ? 'booth' : g.startsWith('🔎') ? 'case' : '';
}

function lfChapter(c: StoryCtx, i: number) {
  const s = c.s, ch = LF_CHAPTERS[i];
  const lines: Line[] = ch.lines.map(([who, t]) => FP(who, t));
  let reply = '';
  if (ch.choices) lines.push(FP('finn', 'Was tust du an meiner Stelle?', ch.choices.map((x) => ({ label: x.t, sub: `+${x.g} Leuchtkraft`, fn: () => { addGlow(s, x.g); reply = x.r; } }))), FP('', () => reply));
  // Minispiel der Rückblende direkt mitspielen (Leuchtturm, Plakat, Deich, Räucherei, Pias Fall)
  let play = false;
  const gid = lfGameId(ch.game);
  if (ch.game) lines.push(FP('', `${ch.game} +6 Leuchtkraft`, c.roman && gid ? [
    { label: '▶ Mit Finn erleben (Minispiel)', fn: () => { play = true; } },
    { label: 'Nur erzählen lassen', fn: () => {} }] : undefined));
  const withGame = (then: () => void) => { if (play && gid && c.roman) c.roman('leuchtfeuer', gid, then); else then(); };
  const next = () => { if (ch.game) addGlow(s, 6); s.flags.lf = i + 1; c.reward(0, 2, 'Finns Geschichte'); };
  c.card(`Rückblende · ${/^\d/.test(ch.n) ? 'Kapitel ' + ch.n : ch.n}`, ch.title, 'Leuchtfeuer – Finns Geschichte').then(() => {
    if (ch.end) {
      c.say(lines, () => withGame(() => {
        next();
        const e = lfEnding(lfGlow(s));
        s.flags.lfEnd = e.id;
        c.say([FP('', `Ende: „${e.title}“ – ${e.text}`), FP('ben', 'Und jetzt sind wir hier. Rainbow City hat auch einen Leuchtturm.')], () => {
          c.reward(0, 10, '„Leuchtfeuer“ zu Ende erlebt');
          c.card('Leuchtfeuer', e.title, e.text);
        });
      }));
      return;
    }
    c.say(lines, () => withGame(next));
  });
}

/** Was die Leuchtfeuer-Figuren heute in Rainbow City sagen */
const LF_TALK: Record<string, Array<[string, string]>> = {
  ben: [['ben', 'Finn erzählt dir unsere Geschichte? Dann hör gut zu – er lässt die peinlichen Stellen gern weg.'], ['ben', 'Ich trainiere jetzt die Handball-Jugend im Hafenviertel. Und abends sitzen wir am Leuchtturm. Wie früher am Kap Rotenhorn.']],
  lotte: [['lotte', 'Ich merke immer alles. Das ist ja das Problem. Zum Beispiel, dass du gerade lächelst.'], ['lotte', 'Ich male jetzt Wandbilder für die Stadt. Das Sturmnacht-Plakat hängt immer noch bei Finn und Ben im Flur.']],
  pia: [['pia', 'Fall 14 ist gelöst, Fall 15 läuft. Ermittlerin Pia Albrecht, inzwischen mit Detektivbüro.'], ['pia', 'Mein Bruder? Hat sich verliebt. Beweise lagen damals in der Küche. Ich hatte recht.']],
  joerg: [['joerg', 'Albrecht am Hafen, seit 1974 – und jetzt auch in Rainbow City. Buchenholz, Heilbutt, und für dich ein Fischbrötchen.'], ['joerg', 'Wenn einer nett ist, darf Finn ihn mitbringen. Hab ich damals gesagt. Ben ist mehr als nett.']],
  anke: [['anke', 'Wir haben den Stand hier aufgemacht, um näher bei den Jungs zu sein.'], ['anke', '„Zwei mit Zwiebeln“? Das bestellt Ben immer noch jedes Mal. Ich glaube, das ist ihr Geheimcode.']],
  samira: [['samira', 'Ich weiß Dinge. Damals wusste ich als Erste, was mit Finn los ist.'], ['samira', 'Heute arbeite ich in der Jugendberatung im Checkpoint. Damit keiner allein bleiben muss.']],
  tobi: [['tobi', 'Ich war damals ein Idiot. Finn hat mir trotzdem einen Platz am Feuer gemacht.'], ['tobi', 'Heute laufe ich bei jeder Pride mit. Nennt man wohl Wiedergutmachung. Oder Freundschaft.']],
};
