/**
 * Eine Eingabe-Schicht für Tastatur und Controller: Jede Taste wird zu einer Spielaktion.
 * - Tastatur: Spieltasten frei belegbar (gespeichert in localStorage), Pfeiltasten, Enter und Esc bleiben immer gleich.
 * - Controller: ../gamepad.js schickt feste Tasten (Pfeile, Leertaste, Shift, Q/E, Esc) – die gelten immer,
 *   egal wie die Tastatur belegt ist.
 * - Touch: Stick und Knöpfe setzen dieselben Aktionen direkt (input/controls.ts).
 */
export type KeyAction = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'zoomIn' | 'zoomOut' | 'pause';
export type BindableAction = Exclude<KeyAction, 'pause'>;

export const KEY_ACTIONS: ReadonlyArray<[BindableAction, string]> = [
  ['up', 'Hoch / vor'],
  ['down', 'Runter / zurück'],
  ['left', 'Links'],
  ['right', 'Rechts'],
  ['a', 'Aktion A · Würfeln · Bestätigen'],
  ['b', 'Aktion B'],
  ['zoomIn', 'Kamera näher'],
  ['zoomOut', 'Kamera weiter weg'],
];

const DEFAULTS: Record<BindableAction, string> = {
  up: 'KeyW',
  down: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
  a: 'Space',
  b: 'ShiftLeft',
  zoomIn: 'KeyE',
  zoomOut: 'KeyQ',
};
/** Immer gültig (nicht umbelegbar) */
const FIXED: Record<string, KeyAction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  Enter: 'a',
  NumpadEnter: 'a',
  Escape: 'pause',
};
/** Weitere bekannte Tasten, solange sie nicht anders belegt sind */
const EXTRA: Record<string, KeyAction> = { ShiftRight: 'b', KeyX: 'b', KeyZ: 'b' };
/** Tasten, die der Controller (gamepad.js) schickt – unabhängig von der eigenen Tastatur-Belegung */
const PAD: Record<string, KeyAction> = {
  ...FIXED,
  Space: 'a',
  ShiftLeft: 'b',
  KeyE: 'zoomIn',
  KeyQ: 'zoomOut',
  KeyW: 'up',
  KeyS: 'down',
  KeyA: 'left',
  KeyD: 'right',
};
const STORE = 'partyverse.keys';

let custom: Partial<Record<BindableAction, string>> = {};
try {
  const raw: unknown = JSON.parse(localStorage.getItem(STORE) ?? '{}');
  if (raw && typeof raw === 'object')
    for (const [a] of KEY_ACTIONS) {
      const v = (raw as Record<string, unknown>)[a];
      if (typeof v === 'string' && v.length < 40) custom[a] = v;
    }
} catch {
  custom = {};
}
const save = (): void => {
  try {
    localStorage.setItem(STORE, JSON.stringify(custom));
  } catch {
    /* privater Modus */
  }
};

/** Aktuelle Taste einer Aktion */
export const keyFor = (a: BindableAction): string => custom[a] ?? DEFAULTS[a];

/** Belegt eine Aktion neu; eine Taste gehört immer nur einer Aktion. false = Taste ist fest vergeben. */
export function bindKey(a: BindableAction, code: string): boolean {
  if (FIXED[code]) return false;
  for (const [o] of KEY_ACTIONS) if (o !== a && keyFor(o) === code) custom[o] = keyFor(a);
  custom[a] = code;
  save();
  return true;
}
export function resetKeys(): void {
  custom = {};
  save();
}

/** Welche Spielaktion löst dieses Tasten-Ereignis aus? */
export function actionOf(e: Pick<KeyboardEvent, 'code' | 'isTrusted'>): KeyAction | null {
  if (!e.isTrusted) return PAD[e.code] ?? null; // vom Controller (gamepad.js)
  for (const [a] of KEY_ACTIONS) if (keyFor(a) === e.code) return a;
  if (FIXED[e.code]) return FIXED[e.code] as KeyAction;
  const x = EXTRA[e.code];
  return x && !KEY_ACTIONS.some(([a]) => keyFor(a) === e.code) ? x : null;
}

/** Lesbarer Name einer Taste („KeyW“ → „W“) */
export function keyName(code: string): string {
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  const n: Record<string, string> = {
    Space: 'Leertaste',
    ShiftLeft: 'Shift links',
    ShiftRight: 'Shift rechts',
    ControlLeft: 'Strg links',
    ControlRight: 'Strg rechts',
    AltLeft: 'Alt',
    Tab: 'Tab',
    Backspace: 'Rücktaste',
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
  };
  return n[code] ?? code;
}

let typed = false;
if (typeof window !== 'undefined')
  window.addEventListener('keydown', (e) => e.isTrusted && (typed = true), { passive: true });
/** Hat das Gerät (vermutlich) eine Tastatur? Auf Handys ohne Tastatur wird die Tastatur-Belegung ausgeblendet. */
export const hasKeyboard = (): boolean =>
  typed || (typeof matchMedia !== 'undefined' && matchMedia('(any-pointer:fine)').matches);
