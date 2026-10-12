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

/**
 * A/S/D und J/K/L wählen eine Spur direkt; die Pfeiltasten links/rechts wechseln
 * relativ um eine Spur (so wie man es von Runnern kennt).
 */
const KEYMAP: Record<string, GameAction> = {
  KeyA: { type: 'lane', lane: 0 },
  KeyJ: { type: 'lane', lane: 0 },
  KeyS: { type: 'lane', lane: 1 },
  KeyK: { type: 'lane', lane: 1 },
  KeyD: { type: 'lane', lane: 2 },
  KeyL: { type: 'lane', lane: 2 },
  ArrowLeft: { type: 'shift', dir: -1 },
  ArrowRight: { type: 'shift', dir: 1 },
  Space: { type: 'hit' },
  ArrowUp: { type: 'hit' },
  ArrowDown: { type: 'hit' },
  KeyW: { type: 'hit' },
  KeyE: { type: 'overdrive' },
  ShiftLeft: { type: 'overdrive' },
  ShiftRight: { type: 'overdrive' },
  Escape: { type: 'pause' },
  KeyP: { type: 'pause' },
};

export function mapKey(code: string): GameAction | null {
  return KEYMAP[code] ?? null;
}
