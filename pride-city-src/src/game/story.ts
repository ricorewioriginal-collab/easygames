/* Hauptgeschichte „Ein Leben in allen Farben“ – roter Faden vom Zuzug bis zur großen Pride.
   Kapitel 1 „Ankommen“ ist voll spielbar; die übrigen Kapitel stehen als Vorschau im Story-Menü.
   Entscheidungen landen in save.flags und werden später wieder aufgegriffen. */
import type { SaveData } from '../engine/Save';
import type { Line } from '../ui/ui';
import type { Look } from './Actor';

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
  { id: 'sam', name: 'Sam', pron: 'er/ihn', color: '#5bcefa', look: { body: 'Human', palette: 'trans', skin: 2 }, x: 4, z: 30, walk: [[4, 30], [4, 48], [-4, 48], [-4, 30]], petition: true },
  { id: 'kim', name: 'Kim', pron: 'they/them', color: '#3da542', look: { body: 'Rogue_Hooded', palette: 'aro', skin: 4 }, x: -26, z: -20, walk: [[-26, -20], [-26, -4], [-14, -4], [-14, -20]], petition: true },
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
  say(lines: Line[], done?: () => void): void;
  toast(t: string): void;
  reward(money: number, rep: number, why: string): void;
  step(n: number): void;
  skipToHour(h: number): void;
  hour(): number;
  dance(): void;
  chapterDone(): void;
  enterHome(after?: () => void): void;
}

const me = (s: SaveData) => s.name;
const L = (who: NpcDef | string, text: Line['text'], choices?: Line['choices']): Line => {
  if (typeof who === 'string') return { who, text, choices, color: '#444' };
  return { who: who.name, pron: who.pron, color: who.color, text, choices };
};
const npc = (id: string) => NPCS.find((n) => n.id === id)!;
const sigs = (s: SaveData) => Object.keys(s.flags).filter((k) => k.startsWith('sig_') && s.flags[k] === true).length;

export interface Goal { title: string; sub?: string; npc?: string; poi?: string }

/** Aktuelles Ziel aus Kapitel und Schritt */
export function goal(s: SaveData): Goal {
  if (s.chapter > 1) return { title: 'Freies Spiel', sub: 'Kapitel 2 „Wurzeln schlagen“ folgt im nächsten Update. Sammle Sticker, tanze im Prisma und erkunde die Stadt.' };
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

/** Gespräch – true, wenn die Geschichte es übernommen hat */
export function talk(c: StoryCtx, id: string): boolean {
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
      ], () => c.step(4));
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
  // Allgemeine Gespräche
  const lines: Record<string, string[]> = {
    mo: ['Kaffee geht heute aufs Haus. Morgen nicht mehr!', 'Wenn du was brauchst: Ich bin hier.'],
    jules: ['Jede Unterschrift zählt.', 'Das Regenbogenhaus gehört allen, die es brauchen.'],
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
  if (s.chapter === 1 && id === 'home' && s.step === 2) {
    c.enterHome(() => c.say([L('Du', 'Klein, aber meins. Ein Bett, eine Küche, eine Dusche – und von irgendwo kommt Musik.'), L('Du', 'Hier kann ich schlafen, kochen und mich frisch machen. Mit dem Handy behalte ich alles im Blick.'), L('Du', 'Okay. Raus durch die Tür und auf ins Regenbogenhaus.')], () => { c.step(3); c.reward(0, 2, 'Eingezogen'); }));
    return true;
  }
  return false;
}

/** Nach dem Tanz-Battle */
export function danceResult(c: StoryCtx, won: boolean) {
  const s = c.s;
  if (s.chapter !== 1 || s.step !== 6) { if (won) c.reward(25, 2, 'Battle gewonnen'); return; }
  if (!won) {
    c.say([L(npc('nova'), 'Knapp! Rex hatte heute die Menge. Atme durch und fordere ihn nochmal heraus.')]);
    return;
  }
  c.say([
    L(npc('nova'), 'DIE MENGE HAT ENTSCHIEDEN! Der Erlös geht ans Regenbogenhaus!'),
    L(npc('rex'), '… Nicht schlecht. Wirklich nicht schlecht.'),
    L(npc('jules'), s.flags.style === 'creative' ? 'Siehst du? Wir feiern dagegen an – und gewinnen!' : 'Das war der Anfang. Jetzt wissen alle, dass wir da sind.'),
  ], () => { c.reward(120, 15, 'Benefiz-Battle gewonnen'); c.chapterDone(); });
}
