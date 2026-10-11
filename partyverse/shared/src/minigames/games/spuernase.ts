import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { lerp } from '../util';
import { hash } from './echomuster';

/**
 * Spürnase: Auf der Tafel sehen alle Symbole gleich aus – bis auf eines. Es weicht in Form, Farbe oder Drehung ab.
 * Anklicken (oder Cursor bewegen + A). Falsch = Zeitstrafe. Das Raster wächst mit jedem Fund.
 */
export interface Cell {
  /** 0 Pfeil, 1 Dreieck, 2 Keil (diese drei haben eine Richtung), 3 Kreis, 4 Quadrat, 5 Stern, 6 Sechseck, 7 Kreuz */
  shape: number;
  /** 0..7, nach Farbton sortiert */
  color: number;
  /** Drehung in Vierteldrehungen */
  rot: number;
}

export interface SpuerState {
  rnd: Rng;
  n: number;
  cells: Cell[];
  oddIdx: number;
  oddKind: 'shape' | 'color' | 'rot';
  found: number;
  wrong: number;
  total: number;
  /** Spieluhr in Ticks (Zeitstrafen erhöhen sie zusätzlich) */
  clock: number;
  roundTicks: number;
  curC: number;
  curR: number;
  /** Cursor sichtbar (Tastaturbedienung) */
  useCursor: boolean;
  lock: number;
  prevPd: boolean;
  prevA: boolean;
  moveDirX: number;
  moveDirY: number;
  moveHold: number;
  /** Zähler für die Ansicht */
  okSeq: number;
  badSeq: number;
  lastCell: number;
  lastBonus: number;
  seed: number;
}

/** Bereich der Tafel im Zeigerraum (px, py in [-1,1], py nach oben) */
export const BOARD = { x0: -0.9, x1: 0.9, y0: -0.84, y1: 0.6 };
export const SHAPE_COUNT = 8;
export const ASYM_SHAPES = 3;
export const COLOR_COUNT = 8;
const LIMIT = 30 * 60;
const PENALTY = 90;
const LOCK = 22;

export const gridSize = (found: number): number => Math.min(6, 3 + Math.floor(found / 2));
export const cellValue = (n: number): number => 100 + 15 * (n - 3);
export const parTicks = (n: number): number => Math.round(60 * (2 + 0.6 * n));

/** Mittelpunkt einer Zelle im Zeigerraum */
export function cellCenter(n: number, idx: number): { px: number; py: number } {
  const c = idx % n;
  const r = Math.floor(idx / n);
  return {
    px: BOARD.x0 + ((c + 0.5) / n) * (BOARD.x1 - BOARD.x0),
    py: BOARD.y1 - ((r + 0.5) / n) * (BOARD.y1 - BOARD.y0),
  };
}

/** Zelle unter einem Zeigerpunkt, -1 = außerhalb der Tafel */
export function cellAt(n: number, px: number, py: number): number {
  if (px < BOARD.x0 || px > BOARD.x1 || py < BOARD.y0 || py > BOARD.y1) return -1;
  const c = Math.min(n - 1, Math.floor(((px - BOARD.x0) / (BOARD.x1 - BOARD.x0)) * n));
  const r = Math.min(n - 1, Math.floor(((BOARD.y1 - py) / (BOARD.y1 - BOARD.y0)) * n));
  return r * n + c;
}

function newRound(s: SpuerState): void {
  const r = s.rnd;
  const n = gridSize(s.found);
  // Alle Zufallszahlen werden immer gezogen, damit jede Runde gleich viele verbraucht (gleiche Welt für alle)
  const kindRoll = r.int(3);
  const shapeRoll = r.int(SHAPE_COUNT);
  const asymRoll = r.int(ASYM_SHAPES);
  const colorRoll = r.int(COLOR_COUNT);
  const rotRoll = r.int(4);
  const oddRoll = r.int(n * n);
  const shapeShift = 1 + r.int(SHAPE_COUNT - 1);
  const colorFar = 2 + r.int(5);
  const colorNear = r.chance(0.5) ? 1 : COLOR_COUNT - 1;
  const rotShift = 1 + r.int(3);
  const kind = (['shape', 'color', 'rot'] as const)[kindRoll] as 'shape' | 'color' | 'rot';
  const base: Cell = { shape: kind === 'rot' ? asymRoll : shapeRoll, color: colorRoll, rot: rotRoll };
  const odd: Cell = { ...base };
  if (kind === 'shape') odd.shape = (base.shape + shapeShift) % SHAPE_COUNT;
  else if (kind === 'color') odd.color = (base.color + (s.found < 4 ? colorFar : colorNear)) % COLOR_COUNT;
  else odd.rot = (base.rot + rotShift) % 4;
  s.n = n;
  s.oddIdx = oddRoll;
  s.oddKind = kind;
  s.cells = Array.from({ length: n * n }, (_, i) => ({ ...(i === oddRoll ? odd : base) }));
  s.curC = Math.min(s.curC, n - 1);
  s.curR = Math.min(s.curR, n - 1);
  s.roundTicks = 0;
}

export const game: MiniGame<SpuerState> = {
  id: 'spuernase',
  name: 'Spürnase',
  tagline: 'Welches Symbol fällt aus der Reihe?',
  instructions: [
    'Auf der Tafel sehen alle Symbole gleich aus – bis auf eines.',
    'Es hat eine andere Form, Farbe oder Drehung. Klicke es an!',
    'Ein falscher Treffer kostet Zeit. Schnelle Funde geben Bonuspunkte.',
    'Mit jedem Fund wird das Raster größer.',
  ],
  controls: {
    desktop: 'Mausklick auf das Symbol – oder Pfeiltasten/WASD bewegen den Cursor, Leertaste wählt',
    touch: 'Das abweichende Symbol antippen',
  },
  category: 'puzzle',
  duration: 30,
  usesPointer: true,
  touch: { stick: false, a: false, b: false },
  init(seed) {
    const s: SpuerState = {
      rnd: new Rng(seed),
      n: 3,
      cells: [],
      oddIdx: 0,
      oddKind: 'shape',
      found: 0,
      wrong: 0,
      total: 0,
      clock: 0,
      roundTicks: 0,
      curC: 1,
      curR: 1,
      useCursor: false,
      lock: 0,
      prevPd: false,
      prevA: false,
      moveDirX: 0,
      moveDirY: 0,
      moveHold: 0,
      okSeq: 0,
      badSeq: 0,
      lastCell: -1,
      lastBonus: 0,
      seed,
    };
    newRound(s);
    return s;
  },
  step(s, input) {
    if (s.clock >= LIMIT) return;
    s.clock++;
    s.roundTicks++;
    if (s.lock > 0) s.lock--;
    // Cursor mit Stick/Tasten: ein Feld pro Druck, bei Halten Wiederholung
    let dx = 0;
    let dy = 0;
    if (Math.abs(input.x) >= Math.abs(input.y)) dx = input.x > 0.5 ? 1 : input.x < -0.5 ? -1 : 0;
    else dy = input.y > 0.5 ? -1 : input.y < -0.5 ? 1 : 0; // Zeilen zählen von oben
    if (dx !== s.moveDirX || dy !== s.moveDirY) {
      s.moveDirX = dx;
      s.moveDirY = dy;
      s.moveHold = 0;
      if (dx !== 0 || dy !== 0) moveCursor(s, dx, dy);
    } else if (dx !== 0 || dy !== 0) {
      s.moveHold++;
      if (s.moveHold >= 14 && (s.moveHold - 14) % 6 === 0) moveCursor(s, dx, dy);
    }
    const pdPress = input.pd && !s.prevPd;
    const aPress = input.a && !s.prevA;
    s.prevPd = input.pd;
    s.prevA = input.a;
    let pick = -1;
    if (pdPress) {
      pick = cellAt(s.n, input.px, input.py);
      if (pick >= 0) {
        s.curC = pick % s.n;
        s.curR = Math.floor(pick / s.n);
        s.useCursor = false;
      }
    } else if (aPress) {
      pick = s.curR * s.n + s.curC;
      s.useCursor = true;
    }
    if (pick < 0 || s.lock > 0) return;
    s.lastCell = pick;
    if (pick === s.oddIdx) {
      const bonus = Math.max(0, Math.round(100 * (1 - s.roundTicks / parTicks(s.n))));
      s.lastBonus = bonus;
      s.total += cellValue(s.n) + bonus;
      s.found++;
      s.okSeq++;
      newRound(s);
    } else {
      s.wrong++;
      s.badSeq++;
      s.clock += PENALTY;
      s.lock = LOCK;
    }
  },
  done: (s) => s.clock >= LIMIT,
  score: (s) => s.total,
  bot(s, skill): InputFrame {
    const n = s.n;
    const h = hash(s.seed, s.found * 31 + 1);
    const t1 = Math.round((lerp(200, 62, skill) * n) / 3 + (h % 20));
    const errP = 0.03 + 0.5 * (1 - skill) * (1 - skill);
    const wrongFirst = (hash(s.seed + 5, s.found * 31 + 2) % 1000) / 1000 < errP;
    const click = (idx: number): InputFrame => {
      const c = cellCenter(n, idx);
      return { ...NEUTRAL_INPUT, pd: true, px: c.px, py: c.py };
    };
    if (s.roundTicks === t1) {
      if (wrongFirst) return click((s.oddIdx + 1 + (h % (n * n - 1))) % (n * n));
      return click(s.oddIdx);
    }
    // Nach einem Fehlgriff (Sperre!) erneut versuchen
    if (s.roundTicks === t1 + LOCK + 8 + (h % 10)) return click(s.oddIdx);
    return { ...NEUTRAL_INPUT };
  },
  hud: (s) => ({
    left: `Gefunden ${s.found}`,
    right: `${Math.max(0, Math.ceil((LIMIT - s.clock) / 60))} s · ${s.total} Pkt`,
    hint: s.lock > 0 ? 'Daneben! −1,5 s' : 'Welches Symbol fällt aus der Reihe?',
  }),
};

function moveCursor(s: SpuerState, dx: number, dy: number): void {
  s.curC = Math.max(0, Math.min(s.n - 1, s.curC + dx));
  s.curR = Math.max(0, Math.min(s.n - 1, s.curR + dy));
  s.useCursor = true;
}
