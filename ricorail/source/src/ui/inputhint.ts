// Eingabehilfe passend zum Gerät: Tasten-/Controller-Bezeichnungen direkt an den Bedienelementen.
// Modus folgt der zuletzt benutzten Eingabe (Controller, Tastatur/Maus, Touch). Controller-Typ: Xbox-Stil oder PlayStation.
import { PAD, KEYS, type Action } from '../input/input';
import { h } from './dom';

export type InMode = 'pad' | 'kb' | 'touch';

/** Knopfnamen im Standard-Layout: [Xbox-Stil, PlayStation] */
const PADN: Record<number, [string, string]> = {
  0: ['A', '✕'], 1: ['B', '○'], 2: ['X', '□'], 3: ['Y', '△'], 4: ['LB', 'L1'], 5: ['RB', 'R1'], 6: ['LT', 'L2'], 7: ['RT', 'R2'],
  8: ['Select', 'Share'], 9: ['Start', 'Options'], 10: ['L3', 'L3'], 11: ['R3', 'R3'], 12: ['✚↑', '✚↑'], 13: ['✚↓', '✚↓'], 14: ['✚←', '✚←'], 15: ['✚→', '✚→'],
};
/** Fahrschalter liegt auf den Triggern (Steuerkreuz geht auch) */
const PAD_PREF: Partial<Record<Action, number>> = { throttleUp: 7, throttleDown: 6 };
const KB_SHORT: Record<string, string> = { Leertaste: 'Leer', 'W / ↑': 'W', 'S / ↓': 'S', 'H (halten)': 'H', 'G (halten)': 'G', '1–7': '1' };

export function padIndex(a: Action): number | undefined { return PAD_PREF[a] ?? PAD.find(([, x]) => x === a)?.[0]; }
export function kbLabel(a: Action): string | undefined {
  const k = KEYS.find((x) => x.act === a && x.label); if (!k) return undefined;
  return KB_SHORT[k.label] ?? k.label;
}
const isPs = (id: string) => /054c|playstation|dualsense|dualshock|wireless controller/i.test(id);
let psStyle = false;
/** Name eines Controller-Knopfs im aktuell erkannten Stil */
export function padName(i: number): string { const n = PADN[i]; return n ? n[psStyle ? 1 : 0] : '?'; }

function padBadge(i: number) {
  const [x, p] = PADN[i] ?? ['?', '?'];
  const face = i <= 3 ? ` f${i}` : '';
  return h('b', { class: 'hp' + face }, x === p ? x : [h('span', { class: 'px' }, x), h('span', { class: 'pp' }, p)]);
}

/** Kleine Plakette mit Taste/Controller-Knopf für eine Aktion (oder eigene Angaben) */
export function hint(a: Action | null, o: { pad?: number; kb?: string } = {}): HTMLElement | null {
  const pi = o.pad ?? (a ? padIndex(a) : undefined), kb = o.kb ?? (a ? kbLabel(a) : undefined);
  if (pi === undefined && !kb) return null;
  return h('span', { class: 'ih', 'aria-hidden': 'true' }, pi !== undefined ? padBadge(pi) : null, kb ? h('b', { class: 'hk' }, kb) : null);
}

let mode: InMode = 'kb';
export const inputMode = () => mode;
export function setInputMode(m: InMode, padId?: string) {
  if (padId !== undefined && isPs(padId) !== psStyle) { psStyle = isPs(padId); document.documentElement.dataset.padt = psStyle ? 'ps' : 'x'; }
  if (m === mode && document.documentElement.dataset.in) return;
  mode = m; document.documentElement.dataset.in = m;
}

let started = false;
/** Einmal beim Start: Eingabe beobachten */
export function startInputHints() {
  if (started || typeof window === 'undefined') return;
  started = true;
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  setInputMode(coarse ? 'touch' : 'kb');
  window.addEventListener('keydown', (e) => { if (!['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) setInputMode('kb'); }, true);
  // Geräte ohne feinen Zeiger melden Fingertipps teils als Maus: dort zählt alles als Touch
  const fine = typeof matchMedia === 'function' && matchMedia('(any-pointer: fine)').matches;
  window.addEventListener('pointerdown', (e) => setInputMode(e.pointerType === 'mouse' && fine ? 'kb' : 'touch'), true);
  const poll = () => {
    const gp = [...(navigator.getGamepads?.() ?? [])].find((p) => p && p.connected);
    if (gp && (gp.buttons.some((b) => b?.pressed) || gp.axes.some((v) => Math.abs(v) > 0.5))) setInputMode('pad', gp.id);
    setTimeout(poll, 250);
  };
  window.addEventListener('gamepadconnected', (e) => setInputMode('pad', (e as GamepadEvent).gamepad.id));
  poll();
}

export const HINT_CSS = `
.ih{display:inline-flex;gap:3px;pointer-events:none}
.ih b{display:none;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border-radius:7px;background:#0b1626;border:1px solid #6d93c2;color:#fff;font:800 10.5px/1 system-ui,sans-serif;white-space:nowrap;box-shadow:0 1px 3px #0009}
:root[data-in=pad] .ih .hp,:root[data-in=kb] .ih .hk{display:inline-flex}
.ih .hp.f0{background:#2f9e55;border-color:#7fe0a0}.ih .hp.f1{background:#c9363c;border-color:#ff9a9e}.ih .hp.f2{background:#2d6fd0;border-color:#8fbaff}.ih .hp.f3{background:#c99a12;border-color:#ffe08a;color:#1b1400}
.pp{display:none}:root[data-padt=ps] .pp{display:inline}:root[data-padt=ps] .px{display:none}
.tbtn{position:relative}.tbtn .ih{position:absolute;right:-5px;bottom:-6px}
.btn .ih{margin-left:7px;vertical-align:middle}
.lkeys{position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);display:flex;gap:3px;align-items:center;font-size:11px;color:#fff;white-space:nowrap;pointer-events:none;text-shadow:0 1px 2px #000}
:root[data-in=touch] .lkeys{display:none}
`;
