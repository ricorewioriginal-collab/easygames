/**
 * RADIO-BINGO – Spielkern ohne Browser: Zufall mit Startwert, Bingo-Karten (75 Kugeln: 5×5 mit B-I-N-G-O-Spalten und freier Mitte;
 * 90 Kugeln: 3×9 mit 15 Zahlen), Gewinnmuster, „wie viele fehlen noch“, Kugeltrommel und Prüfung eines Bingo-Rufs.
 */
export type Kind = 75 | 90;
export interface Card {
  id: string;
  kind: Kind;
  /** 75: 25 Felder zeilenweise, 0 = freie Mitte. 90: 27 Felder (3 Zeilen × 9 Spalten), 0 = leer. */
  cells: number[];
}
export interface Pattern {
  id: string;
  name: string;
  short: string;
  kind: Kind;
  /** Beispielfelder für die Vorschau (Indizes); bei „eine Linie“ eine Beispielreihe */
  preview: number[];
  /** Wie viele Zahlen fehlen noch (0 = Bingo) – marked[i] gilt für Feld i der Karte */
  missing(card: Card, marked: boolean[]): number;
  /** Text für die Moderation: was gilt als Bingo */
  rule: string;
}

export function rng(seed: number): () => number {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function shuffle<T>(a: T[], r: () => number): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
let cid = 0;

export const LETTERS = ['B', 'I', 'N', 'G', 'O'];
/** Buchstabe der Spalte einer 75er-Kugel */
export const letterOf = (n: number) => LETTERS[Math.min(4, Math.floor((n - 1) / 15))];

export function makeCard75(r: () => number): Card {
  const cells = new Array<number>(25).fill(0);
  for (let c = 0; c < 5; c++) {
    const col = shuffle(range(c * 15 + 1, c * 15 + 15), r)
      .slice(0, 5)
      .sort((x, y) => x - y);
    for (let row = 0; row < 5; row++) cells[row * 5 + c] = col[row];
  }
  cells[12] = 0;
  return { id: 'k' + (cid++).toString(36), kind: 75, cells };
}
/** 90er-Karte: 3 Zeilen × 9 Spalten, je Zeile 5 Zahlen, jede Spalte mindestens eine Zahl (1–9, 10–19 … 80–90) */
export function makeCard90(r: () => number): Card {
  for (let tries = 0; tries < 500; tries++) {
    const cnt = new Array<number>(9).fill(1);
    let rest = 6;
    while (rest > 0) {
      const c = Math.floor(r() * 9);
      if (cnt[c] < 3) {
        cnt[c]++;
        rest--;
      }
    }
    const rows = [0, 0, 0],
      grid: boolean[][] = [[], [], []];
    let ok = true;
    // Spalten mit vielen Zahlen zuerst, dann jeweils die Zeilen mit den wenigsten Zahlen bevorzugen
    const order = shuffle(range(0, 8), r).sort((a, b) => cnt[b] - cnt[a]);
    for (const c of order) {
      const pick = shuffle([0, 1, 2], r)
        .sort((a, b) => rows[a] - rows[b])
        .slice(0, cnt[c]);
      for (const rr of pick) {
        rows[rr]++;
        grid[rr][c] = true;
      }
    }
    if (rows.some((x) => x !== 5)) ok = false;
    if (!ok) continue;
    const cells = new Array<number>(27).fill(0);
    for (let c = 0; c < 9; c++) {
      const lo = c === 0 ? 1 : c * 10,
        hi = c === 8 ? 90 : c * 10 + 9;
      const n = [0, 1, 2].filter((rr) => grid[rr][c]).length;
      const nums = shuffle(range(lo, hi), r)
        .slice(0, n)
        .sort((x, y) => x - y);
      let k = 0;
      for (let rr = 0; rr < 3; rr++) if (grid[rr][c]) cells[rr * 9 + c] = nums[k++];
    }
    return { id: 'k' + (cid++).toString(36), kind: 90, cells };
  }
  throw new Error('Karte nicht erzeugt');
}
export const makeCard = (kind: Kind, r: () => number) => (kind === 90 ? makeCard90(r) : makeCard75(r));

/** Markierungen aus den gezogenen Kugeln (freie Mitte zählt immer) */
export function marksFrom(card: Card, drawn: Iterable<number>): boolean[] {
  const s = drawn instanceof Set ? (drawn as Set<number>) : new Set(drawn);
  return card.cells.map((n, i) => (card.kind === 75 && i === 12 ? true : n > 0 && s.has(n)));
}

// ---------- Gewinnmuster ----------
const LINES75: number[][] = [];
for (let r = 0; r < 5; r++) LINES75.push(range(0, 4).map((c) => r * 5 + c));
for (let c = 0; c < 5; c++) LINES75.push(range(0, 4).map((r) => r * 5 + c));
LINES75.push([0, 6, 12, 18, 24], [4, 8, 12, 16, 20]);
const miss = (m: boolean[], idx: number[]) => idx.reduce((a, i) => a + (m[i] ? 0 : 1), 0);
const linesMissing = (m: boolean[]) => LINES75.map((l) => miss(m, l)).sort((a, b) => a - b);
const mask75 = (id: string, name: string, short: string, idx: number[], rule: string): Pattern => ({
  id,
  name,
  short,
  kind: 75,
  preview: idx,
  rule,
  missing: (_c, m) => miss(m, idx),
});
const ALL25 = range(0, 24);
export const PATTERNS: Record<string, Pattern> = {
  linie: {
    id: 'linie',
    name: 'Eine Linie',
    short: 'Linie',
    kind: 75,
    preview: [10, 11, 12, 13, 14],
    rule: 'Eine volle Reihe – waagerecht, senkrecht oder diagonal.',
    missing: (_c, m) => linesMissing(m)[0],
  },
  zwei: {
    id: 'zwei',
    name: 'Zwei Linien',
    short: '2 Linien',
    kind: 75,
    preview: [0, 1, 2, 3, 4, 2, 7, 17, 22],
    rule: 'Zwei volle Reihen in beliebiger Richtung.',
    missing: (_c, m) => {
      // Zwei verschiedene Linien – geteilte Felder zählen nur einmal
      let best = 99;
      for (let a = 0; a < LINES75.length; a++)
        for (let b = a + 1; b < LINES75.length; b++) best = Math.min(best, miss(m, [...new Set([...LINES75[a], ...LINES75[b]])]));
      return best;
    },
  },
  ecken: mask75('ecken', 'Vier Ecken', 'Ecken', [0, 4, 20, 24], 'Alle vier Ecken der Karte.'),
  kreuz: mask75('kreuz', 'Großes X', 'X', [0, 4, 6, 8, 12, 16, 18, 20, 24], 'Beide Diagonalen – ein großes X.'),
  plus: mask75('plus', 'Pluszeichen', 'Plus', [2, 7, 10, 11, 12, 13, 14, 17, 22], 'Die mittlere Reihe und die mittlere Spalte – ein Plus.'),
  rahmen: mask75('rahmen', 'Bilderrahmen', 'Rahmen', ALL25.filter((i) => i < 5 || i > 19 || i % 5 === 0 || i % 5 === 4), 'Der ganze äußere Rand der Karte.'),
  antenne: mask75('antenne', 'Funkmast', 'Funkmast', [0, 1, 2, 3, 4, 7, 12, 17, 22], 'Die oberste Reihe und die Mitte nach unten – ein Funkmast.'),
  herz: mask75('herz', 'Herz', 'Herz', [1, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 22], 'Ein Herz in der Mitte der Karte.'),
  kleeblatt: mask75('kleeblatt', 'Kleines Quadrat', 'Quadrat', [6, 7, 8, 11, 12, 13, 16, 17, 18], 'Das kleine Quadrat um die Mitte.'),
  voll: mask75('voll', 'Volle Karte', 'Volle Karte', ALL25, 'Alle Zahlen der Karte – die volle Karte!'),
};
const rowMissing90 = (m: boolean[], c: Card) =>
  [0, 1, 2].map((r) => range(0, 8).reduce((a, k) => a + (c.cells[r * 9 + k] && !m[r * 9 + k] ? 1 : 0), 0)).sort((a, b) => a - b);
const p90 = (id: string, name: string, short: string, rows: number, rule: string, preview: number[]): Pattern => ({
  id,
  name,
  short,
  kind: 90,
  preview,
  rule,
  missing: (c, m) => rowMissing90(m, c).slice(0, rows).reduce((a, b) => a + b, 0),
});
export const PATTERNS90: Pattern[] = [
  p90('l1', 'Eine Reihe', 'Reihe', 1, 'Eine ganze Reihe mit allen fünf Zahlen.', range(9, 17)),
  p90('l2', 'Zwei Reihen', '2 Reihen', 2, 'Zwei ganze Reihen.', range(0, 17)),
  p90('haus', 'Volles Haus', 'Volles Haus', 3, 'Alle fünfzehn Zahlen – volles Haus!', range(0, 26)),
];
export const pattern = (id: string): Pattern => PATTERNS[id] || PATTERNS90.find((p) => p.id === id) || PATTERNS.linie;
export const missing = (card: Card, marked: boolean[], p: Pattern) => p.missing(card, marked);

/** Ein Bingo-Ruf zählt, wenn alle markierten Felder wirklich gezogen sind und das Muster damit vollständig ist. */
export function validClaim(card: Card, marks: boolean[], drawn: Iterable<number>, p: Pattern): boolean {
  const real = marksFrom(card, drawn),
    use = card.cells.map((_, i) => !!marks[i] && real[i]);
  if (card.kind === 75) use[12] = true;
  return p.missing(card, use) === 0;
}
/** Kugelnummer, mit der eine Karte das Muster schafft (Index in der Ziehung, -1 = nie) */
export function completionIndex(card: Card, order: number[], p: Pattern): number {
  const m = marksFrom(card, []);
  const pos = new Map(card.cells.map((n, i) => [n, i] as [number, number]));
  for (let k = 0; k < order.length; k++) {
    const i = pos.get(order[k]);
    if (i != null && order[k] > 0) m[i] = true;
    if (p.missing(card, m) === 0) return k;
  }
  return -1;
}

export class Drum {
  readonly order: number[];
  private k = 0;
  constructor(
    readonly kind: Kind,
    r: () => number,
  ) {
    this.order = shuffle(range(1, kind), r);
  }
  next(): number {
    return this.k < this.order.length ? this.order[this.k++] : 0;
  }
  get left() {
    return this.order.length - this.k;
  }
  get count() {
    return this.k;
  }
  get drawn(): number[] {
    return this.order.slice(0, this.k);
  }
}

/** Tagesnummer nach deutscher Zeit (für Tages-Show und Ranglisten) */
export function dayNumber(d = new Date()): number {
  const s = d.toLocaleString('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).slice(0, 10);
  return Math.floor(Date.parse(s + 'T00:00:00Z') / 864e5);
}
