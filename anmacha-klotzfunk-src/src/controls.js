// Steuerung: frei belegbare Tasten und Gamepad-Belegung (Standard-Layout der Gamepad-API).
export const ACTIONS = [
  ['fwd', 'Vorwärts', 'KeyW'], ['back', 'Rückwärts', 'KeyS'], ['left', 'Links', 'KeyA'], ['right', 'Rechts', 'KeyD'],
  ['jump', 'Springen / Hoch', 'Space'], ['sneak', 'Schleichen / Runter', 'ShiftLeft'], ['sprint', 'Rennen', 'ControlLeft'],
  ['inv', 'Inventar', 'KeyE'], ['map', 'Weltkarte', 'KeyM'], ['hook', 'Seilhaken', 'KeyQ'], ['wp', 'Wegpunkt', 'KeyB'],
  ['fly', 'Fliegen (Kreativ)', 'KeyF'], ['build', 'Bauform', 'KeyG'], ['quests', 'Aufträge ein/aus', 'KeyJ']
];
const RESERVED = new Set(['Escape', 'Tab', 'MetaLeft', 'MetaRight', ...Array.from({ length: 9 }, (_, i) => 'Digit' + (i + 1))]);
export const DEFAULT_KEYS = Object.fromEntries(ACTIONS.map(a => [a[0], a[2]]));

// Gespeicherte Belegung prüfen: unbekannte Aktionen, reservierte und doppelte Tasten fallen auf den Standard zurück
export function keyBinds(saved) {
  const out = { ...DEFAULT_KEYS };
  if (!saved || typeof saved !== 'object') return out;
  for (const [a] of ACTIONS) {
    const c = saved[a];
    if (typeof c === 'string' && /^[A-Za-z0-9]{1,24}$/.test(c) && !RESERVED.has(c)) out[a] = c;
  }
  const seen = new Map();
  for (const [a] of ACTIONS) { if (seen.has(out[a])) out[a] = DEFAULT_KEYS[a]; seen.set(out[a], a); }
  // ein Rückfall kann selbst doppelt sein: dann gilt für alle die Standardbelegung
  return new Set(Object.values(out)).size === ACTIONS.length ? out : { ...DEFAULT_KEYS };
}
// Neue Taste für eine Aktion; hatte eine andere Aktion diese Taste, bekommt sie die alte (Tausch)
export function rebind(binds, action, code) {
  if (RESERVED.has(code) || !(action in binds)) return null;
  const out = { ...binds }, other = Object.keys(out).find(a => out[a] === code);
  if (other && other !== action) out[other] = out[action];
  out[action] = code;
  return out;
}
export function actionOf(binds, code) { for (const a in binds) if (binds[a] === code) return a; return null; }
// Anzeigename einer Taste
export function keyName(code) {
  if (/^Key[A-Z]$/.test(code)) return code[3];
  if (/^Digit\d$/.test(code)) return code[5];
  return { Space: 'Leertaste', ShiftLeft: 'Umschalt links', ShiftRight: 'Umschalt rechts', ControlLeft: 'Strg links', ControlRight: 'Strg rechts', AltLeft: 'Alt', AltRight: 'Alt Gr', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Enter: 'Eingabe', Backspace: '⌫', CapsLock: 'Feststell' }[code] || code;
}

// Gamepad (Standard-Layout): Tastennummern
export const PAD = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, BACK: 8, START: 9, L3: 10 };
const DEAD = 0.18;
export const deadzone = v => Math.abs(v) < DEAD ? 0 : (v - Math.sign(v) * DEAD) / (1 - DEAD);
// Gamepad-Zustand → Eingaben; prev: gedrückte Tasten des letzten Abrufs (für Flanken)
export function readPad(pad, prev) {
  const ax = i => deadzone(pad.axes[i] || 0), btn = i => { const b = pad.buttons[i]; return !!b && (b.pressed || b.value > 0.5); };
  const now = pad.buttons.map((_, i) => btn(i)), pressed = i => now[i] && !prev[i];
  return {
    r: ax(0), f: -ax(1), lx: ax(2), ly: ax(3),
    jump: now[PAD.A], down: now[PAD.B], sprint: now[PAD.L3], breakHeld: now[PAD.RT], placeHeld: now[PAD.LT],
    hook: pressed(PAD.X), inv: pressed(PAD.Y), prev: pressed(PAD.LB), next: pressed(PAD.RB), pause: pressed(PAD.START), map: pressed(PAD.BACK), back: pressed(PAD.B),
    buttons: now
  };
}
