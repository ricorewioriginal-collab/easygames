/** Geräteunabhängige Spielaktionen (Eingabeabstraktion). */
export type GameAction =
  | { type: 'lane'; lane: number }
  | { type: 'shift'; dir: -1 | 1 }
  | { type: 'hit' }
  | { type: 'overdrive' }
  | { type: 'pause' };

export interface TimedAction {
  action: GameAction;
  /** performance.now()-Zeitstempel der Eingabe in Millisekunden. */
  at: number;
  source: 'keyboard' | 'mouse' | 'touch' | 'pad';
}

const KEYMAP: Record<string, GameAction> = {
  KeyA: { type: 'lane', lane: 0 },
  ArrowLeft: { type: 'lane', lane: 0 },
  KeyJ: { type: 'lane', lane: 0 },
  KeyS: { type: 'lane', lane: 1 },
  ArrowDown: { type: 'lane', lane: 1 },
  KeyK: { type: 'lane', lane: 1 },
  KeyD: { type: 'lane', lane: 2 },
  ArrowRight: { type: 'lane', lane: 2 },
  KeyL: { type: 'lane', lane: 2 },
  Space: { type: 'hit' },
  ArrowUp: { type: 'hit' },
  KeyW: { type: 'hit' },
  KeyE: { type: 'overdrive' },
  ShiftLeft: { type: 'overdrive' },
  ShiftRight: { type: 'overdrive' },
  Escape: { type: 'pause' },
  KeyP: { type: 'pause' },
  Comma: { type: 'shift', dir: -1 },
  Period: { type: 'shift', dir: 1 },
};

export function mapKey(code: string): GameAction | null {
  return KEYMAP[code] ?? null;
}
