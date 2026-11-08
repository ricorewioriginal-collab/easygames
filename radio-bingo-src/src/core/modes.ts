/** RADIO-BINGO – Spielmodi, Runden, Punkte, Studio-Publikum (KI-Mitspieler) und alle Moderationstexte. */
import { completionIndex, makeCard, marksFrom, missing, pattern, PATTERNS, PATTERNS90, rng, shuffle, type Card, type Kind, type Pattern } from './bingo';

export type ModeId = 'show' | 'schnell' | 'blitz' | 'neunzig' | 'tag' | 'online';
export interface RoundDef {
  pattern: string;
  name: string;
  prize: number;
  /** Jackpot, wenn innerhalb dieser Kugelzahl gewonnen wird (nur Finale) */
  jackpot?: number;
  /** 90er: alle Stufen laufen in einer Ziehung weiter */
  continueDraw?: boolean;
}
export interface ModeDef {
  id: ModeId;
  icon: string;
  name: string;
  desc: string;
  kind: Kind;
  ai: boolean;
}
export const MODES: ModeDef[] = [
  { id: 'show', icon: '🎬', name: 'Die große Show', desc: 'Vier Runden mit immer neuen Mustern, Studio-Spiel „Höher oder Tiefer“ und das Finale um den Jackpot – gegen das ganze Studio-Publikum.', kind: 75, ai: true },
  { id: 'schnell', icon: '🎯', name: 'Schnelles Bingo', desc: 'Eine Runde, du wählst das Muster: Linie, Ecken, X, Plus, Rahmen, Funkmast, Herz, Quadrat oder volle Karte.', kind: 75, ai: true },
  { id: 'blitz', icon: '⚡', name: 'Blitz-Bingo', desc: '60 Sekunden Kugelregen: jede Sekunde eine Kugel – markiere so schnell du kannst. Jede Linie, die Ecken und die volle Karte bringen Punkte.', kind: 75, ai: false },
  { id: 'neunzig', icon: '🎡', name: 'Klassik 90', desc: 'Bingo wie in England: 90 Kugeln, Karten mit 3 Reihen. Erst eine Reihe, dann zwei Reihen, dann volles Haus – alles in einer Ziehung.', kind: 90, ai: true },
  { id: 'tag', icon: '📅', name: 'Tages-Show', desc: 'Jeden Tag dieselben Kugeln und Karten für alle – wer holt heute die meisten Punkte? Mit Rangliste.', kind: 75, ai: true },
  { id: 'online', icon: '🌐', name: 'Online & Handys', desc: 'Bingo-Abend mit Freunden: Mitspieler treten per Link, Code oder QR-Code von überall bei. Der Fernseher zeigt die Show, die Karten liegen auf den Handys.', kind: 75, ai: true },
];
export const modeDef = (id: ModeId) => MODES.find((m) => m.id === id) || MODES[0];
export const SCHNELL_PATTERNS = ['linie', 'ecken', 'kreuz', 'plus', 'rahmen', 'antenne', 'herz', 'kleeblatt', 'zwei', 'voll'];

/** Runden eines Abends; r liefert die Zufallsrunde der großen Show */
export function rounds(mode: ModeId, r: () => number, pick?: string): RoundDef[] {
  if (mode === 'neunzig')
    return PATTERNS90.map((p, i) => ({ pattern: p.id, name: ['Erste Stufe', 'Zweite Stufe', 'Volles Haus'][i], prize: [500, 1000, 3000][i], continueDraw: i > 0, jackpot: i === 2 ? 70 : undefined }));
  if (mode === 'schnell') return [{ pattern: pick && PATTERNS[pick] ? pick : 'linie', name: 'Schnelles Bingo', prize: 1000 }];
  if (mode === 'blitz') return [{ pattern: 'voll', name: 'Blitz-Bingo', prize: 0 }];
  const mid = shuffle(['kreuz', 'plus', 'antenne', 'herz', 'rahmen'], r)[0];
  return [
    { pattern: 'linie', name: 'Runde 1', prize: 500 },
    { pattern: 'ecken', name: 'Runde 2', prize: 800 },
    { pattern: mid, name: 'Runde 3', prize: 1500 },
    { pattern: 'voll', name: 'Das Finale', prize: 3000, jackpot: 66 },
  ];
}
/** Punkte für ein Bingo: Grundpreis + bis zu 100 % Bonus für frühes Bingo + Jackpot */
export function prize(rd: RoundDef, balls: number, kind: Kind): { points: number; jackpot: boolean } {
  // Mittelwert, wann zwei Karten das Muster schaffen (gemessen) – früher = Bonus
  const par = { linie: 36, zwei: 46, ecken: 56, kreuz: 65, plus: 65, rahmen: 70, antenne: 66, herz: 70, kleeblatt: 66, voll: 72, l1: 58, l2: 74, haus: 84 }[rd.pattern] ?? 50;
  const bonus = Math.max(0, Math.min(1, (par - balls) / par));
  const jackpot = !!rd.jackpot && balls <= rd.jackpot;
  return { points: Math.round((rd.prize * (1 + bonus)) / 10) * 10 + (jackpot ? (kind === 90 ? 5000 : 10000) : 0), jackpot };
}

// ---------- Studio-Publikum (KI) ----------
const FIRST = ['Jens', 'Petra', 'Ole', 'Sabine', 'Lukas', 'Hanna', 'Kevin', 'Gisela', 'Tim', 'Anke', 'Mehmet', 'Lea', 'Frank', 'Svenja', 'Paul', 'Marion', 'Jonas', 'Elif', 'Uwe', 'Nina', 'Ben', 'Karin', 'Finn', 'Doris', 'Malte', 'Ayse', 'Ralf', 'Mia', 'Hauke', 'Ute', 'Leon', 'Birgit', 'Tom', 'Heike', 'Can', 'Lena'];
const TOWN = ['Kiel', 'Hamburg', 'Bremen', 'Hannover', 'Lübeck', 'Rostock', 'Flensburg', 'Oldenburg', 'Husum', 'Cuxhaven', 'Lüneburg', 'Göttingen', 'Osnabrück', 'Emden', 'Wismar', 'Celle', 'Stade', 'Itzehoe'];
export interface Bot {
  name: string;
  town: string;
  card: Card;
  /** Kugel-Index, mit dem die Karte fertig ist */
  done: number;
  /** Sekunden Reaktionszeit */
  react: number;
}
export function makeBots(n: number, kind: Kind, order: number[], p: Pattern, seed: number): Bot[] {
  const r = rng(seed ^ 0x51ab);
  const names = shuffle(FIRST, r);
  return Array.from({ length: n }, (_, i) => {
    const card = makeCard(kind, r);
    // Nicht jeder im Studio passt gleich gut auf: manche bemerken ihr Bingo erst ein paar Kugeln später
    const done = completionIndex(card, order, p), late = r() < 0.4 ? 1 + Math.floor(r() * 4) : 0;
    return { name: names[i % names.length], town: TOWN[Math.floor(r() * TOWN.length)], card, done: done < 0 ? -1 : done + late, react: 2.2 + r() * 3.2 };
  });
}
/** Wie viele Bots brauchen nach k gezogenen Kugeln noch genau eine Zahl */
export function botsNear(bots: Bot[], drawn: number[], p: Pattern): number {
  const s = new Set(drawn);
  return bots.reduce((a, b) => a + (missing(b.card, marksFrom(b.card, s), p) === 1 ? 1 : 0), 0);
}

// ---------- Moderation ----------
const SAY: Record<number, string[]> = {
  1: ['Die Eins – ganz vorne dabei!'], 7: ['Die Sieben – die Glückszahl!'], 11: ['Die Elf – eine Schnapszahl!'], 12: ['Die Zwölf – ein Dutzend!'], 13: ['Die Dreizehn – Glück oder Pech?'],
  18: ['Die Achtzehn – endlich volljährig!'], 22: ['Zweiundzwanzig – zwei kleine Entchen!'], 24: ['Vierundzwanzig – Stunden Radio am Tag!'], 33: ['Dreiunddreißig – Schnapszahl!'], 42: ['Zweiundvierzig – die Antwort auf alles!'],
  44: ['Vierundvierzig – Schnapszahl!'], 50: ['Fünfzig – halbe Hundert!'], 55: ['Fünfundfünfzig – Schnapszahl!'], 66: ['Sechsundsechzig – Schnapszahl!'], 75: ['Fünfundsiebzig – die letzte Kugel der Trommel!'], 77: ['Siebenundsiebzig – zwei Glückszahlen!'],
  88: ['Achtundachtzig – zwei dicke Damen!'], 90: ['Neunzig – Endstation!'],
};
export const LINES = {
  hello: [
    'Herzlich willkommen zu Radio-Bingo, der großen Kugelshow! Schön, dass ihr alle da seid – im Studio und zu Hause!',
    'Guten Abend und willkommen bei Radio-Bingo! Die Trommel ist voll, die Karten liegen bereit – heute wird gewonnen!',
    'Hallo und herzlich willkommen! Hier ist Radio-Bingo, die Show, bei der jede Kugel zählt!',
  ],
  helloTag: ['Willkommen zur Tages-Show! Heute spielen alle mit denselben Kugeln und denselben Karten – mal sehen, wer die meisten Punkte holt!'],
  helloBlitz: ['Blitz-Bingo! Sechzig Sekunden, jede Sekunde eine Kugel. Markiert so schnell ihr könnt – los gehts!'],
  hello90: ['Willkommen zu Klassik Neunzig! Neunzig Kugeln, drei Stufen: erst eine Reihe, dann zwei Reihen, dann das volle Haus!'],
  helloOnline: ['Willkommen zum Bingo-Abend! Alle Mitspieler sind dabei – die Trommel läuft gleich an!'],
  round: ['{round}! Gesucht wird: {pattern}. {rule}', 'Und weiter gehts mit {round}! Diesmal zählt: {pattern}. {rule}', '{round} – das Muster heißt {pattern}. {rule}'],
  first: ['Und hier kommt die erste Kugel!', 'Die Trommel dreht sich – die erste Kugel!', 'Los gehts – Kugel Nummer eins!'],
  near1: ['Im Studio fehlt jemandem nur noch eine einzige Zahl!', 'Achtung, es wird spannend – eine Zahl noch bis zum Bingo!', 'Ich sehe schon die ersten Kandidaten zittern – nur noch eine Zahl!'],
  nearN: ['Schon {n} Leute im Studio brauchen nur noch eine Zahl!', '{n} Mitspieler sind kurz vor dem Bingo!'],
  meNear: ['Du brauchst nur noch eine Zahl – Daumen drücken!', 'Bei dir fehlt nur noch eine Zahl!'],
  meBingoReady: ['Du hast es – ruf Bingo!', 'Schnell, ruf Bingo!'],
  youWin: ['Bingo! Wir haben einen Gewinner – und das bist du! Herzlichen Glückwunsch!', 'Bingo! Und es ist korrekt! Applaus für dich!', 'Das ist ein Bingo! Glückwunsch, du hast diese Runde gewonnen!'],
  shared: ['Und gleich mehrere Bingos auf einmal – der Gewinn geht an alle!'],
  botWin: ['Bingo im Studio! {name} aus {town} hat gewonnen – herzlichen Glückwunsch!', 'Bingo! {name} aus {town} war am schnellsten!', 'Da ruft jemand Bingo! Es ist {name} aus {town} – korrekt!'],
  tooSlow: ['Oh, du hattest auch Bingo – aber {name} war schneller! Nächstes Mal schneller rufen!'],
  falseBingo: ['Moment, Moment – das ist leider noch kein Bingo! Schau nochmal genau hin.', 'Hoppla, da fehlt noch was! Kein Bingo – weiter gehts!'],
  guestWin: ['Bingo! {name} hat gewonnen – Applaus!', 'Wir haben ein Bingo von {name}! Glückwunsch!'],
  jackpot: ['Und das ist der Jackpot! Unglaublich, innerhalb der Jackpot-Grenze! Zehntausend Extrapunkte!', 'Jackpot! Jackpot! Das gibt es nicht alle Tage!'],
  jackpotGone: ['Die Jackpot-Grenze ist überschritten – aber die volle Karte bringt immer noch richtig viele Punkte!'],
  half: ['Wir haben schon die Hälfte der Kugeln gezogen!', 'Halbzeit in der Trommel!'],
  studioIntro: ['Zeit für unser Studio-Spiel: Höher oder Tiefer! Kommt die nächste Kugel höher oder tiefer als die {n}? Dreimal richtig gibt die goldene Glückskugel!'],
  hlRight: ['Richtig!', 'Genau getippt!', 'Super, stimmt!'],
  hlWrong: ['Leider daneben!', 'Oh, das war nichts!', 'Knapp vorbei!'],
  hlGold: ['Dreimal richtig – die goldene Glückskugel gehört dir! Damit darfst du in der nächsten Runde ein Feld deiner Wahl markieren!'],
  finale: ['Das große Finale! Jetzt zählt nur noch die volle Karte. Wer sie innerhalb von {j} Kugeln schafft, knackt den Jackpot!'],
  stage90: ['Die erste Stufe ist geschafft! Jetzt brauchen wir zwei volle Reihen!', 'Weiter gehts mit dem vollen Haus – alle fünfzehn Zahlen!'],
  blitzEnd: ['Die Zeit ist um! Was für ein Kugelregen!'],
  bye: ['Das war Radio-Bingo! Danke fürs Mitspielen – bis zum nächsten Mal, und bleibt dran!', 'Das wars für heute! Danke, dass ihr dabei wart – tschüss und bis bald bei Radio-Bingo!'],
  empty: ['Die Trommel ist leer – diese Runde endet ohne Bingo!'],
};
const bag: Record<string, string[]> = {};
export function line(k: keyof typeof LINES, v?: Record<string, string | number>): string {
  const a = LINES[k],
    used = bag[k] || (bag[k] = []);
  let pool = a.filter((x) => !used.includes(x));
  if (!pool.length) {
    used.length = 0;
    pool = a;
  }
  const x = pool[Math.floor(Math.random() * pool.length)];
  used.push(x);
  return x.replace(/\{(\w+)\}/g, (_, n) => String(v?.[n] ?? ''));
}
/** Ansage einer Kugel: „B – 7!“ plus manchmal ein Spruch */
export function callText(n: number, kind: Kind, extra = true): string {
  const head = kind === 75 ? `${['B', 'I', 'N', 'G', 'O'][Math.min(4, Math.floor((n - 1) / 15))]} – ${n}!` : `Die ${n}!`;
  const s = SAY[n];
  return extra && s && Math.random() < 0.75 ? `${head} ${s[0]}` : head;
}
export const patternOf = (rd: RoundDef) => pattern(rd.pattern);
