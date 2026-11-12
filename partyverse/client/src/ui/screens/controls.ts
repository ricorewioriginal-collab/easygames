import { btn, h, toast } from '../dom';
import {
  KEY_ACTIONS,
  bindKey,
  hasKeyboard,
  keyFor,
  keyName,
  resetKeys,
  type BindableAction,
} from '../../input/keymap';
import { section } from './common';

/** gamepad.js (für alle easygames-Spiele): Symbole, Bestätigen-Knopf, Belegung */
interface PadNormal {
  style(v?: string): string;
  confirm(v?: string): string;
}
interface Pad {
  openMenu(): void;
  showLegend(ms?: number): void;
}
const padNormal = (): PadNormal | undefined =>
  (window as unknown as { EasyGamesPadNormal?: PadNormal }).EasyGamesPadNormal;
const pad = (): Pad | undefined => (window as unknown as { EasyGamesPad?: Pad }).EasyGamesPad;
const padConnected = (): boolean => {
  try {
    return [...(navigator.getGamepads?.() ?? [])].some(Boolean);
  } catch {
    return false;
  }
};

/** Knopfreihe zur Auswahl eines Werts (gewählter Knopf hervorgehoben) */
function choice(
  label: string,
  opts: Array<[string, string]>,
  get: () => string,
  set: (v: string) => void,
): HTMLElement {
  const row = h('div', { class: 'chips' });
  const draw = (): void => {
    const cur = get();
    row.replaceChildren(
      ...opts.map(([v, txt]) =>
        btn(
          txt,
          () => {
            set(v);
            draw();
          },
          cur === v ? 'good' : 'ghost',
          { 'aria-pressed': cur === v ? 'true' : 'false' },
        ),
      ),
    );
  };
  draw();
  return h('div', { class: 'row' }, h('span', { class: 'lbl' }, label), row);
}

/** Optionen „🎮 Controller“ */
export function controllerSection(): HTMLElement {
  const N = padNormal();
  const needPad = (fn: (p: Pad) => void): void => {
    const p = pad();
    if (!p || !padConnected())
      toast(
        '🎮 Schließ zuerst einen Controller an (USB oder Bluetooth) und drück einen Knopf.',
        'info',
        4000,
      );
    else fn(p);
  };
  const legendSoon = (): void => {
    if (padConnected()) pad()?.showLegend(5000);
  };
  return section(
    '🎮 Controller',
    h(
      'p',
      { class: 'hint' },
      'Linker Stick oder Steuerkreuz: laufen und in Menüs wählen · rechter Stick: Zeiger und Kamera · A bestätigen/würfeln · B zurück · X Aktion B · LB/RB Kamera · Start Pausemenü. Symbole und Bestätigen-Knopf gelten für alle easygames-Spiele.',
    ),
    N
      ? choice(
          'Symbole',
          [
            ['auto', 'Automatisch'],
            ['xbox', 'Xbox'],
            ['ps', 'PlayStation'],
            ['switch', 'Switch'],
          ],
          () => N.style(),
          (v) => {
            N.style(v);
            legendSoon();
          },
        )
      : null,
    N
      ? choice(
          'Bestätigen',
          [
            ['auto', 'Automatisch'],
            ['bottom', 'Unten (✕ / A)'],
            ['right', 'Rechts (Switch)'],
          ],
          () => N.confirm(),
          (v) => {
            N.confirm(v);
            legendSoon();
          },
        )
      : null,
    h(
      'div',
      { class: 'btnrow' },
      btn('Knöpfe belegen', () => needPad((p) => p.openMenu()), 'ghost'),
      btn('Belegung zeigen', () => needPad((p) => p.showLegend(8000)), 'ghost'),
    ),
  );
}

/** Optionen „⌨️ Tastatur“: jede Spieltaste frei belegbar (gespeichert); auf Handys ohne Tastatur ausgeblendet */
export function keyboardSection(): { el: HTMLElement; dispose(): void } | null {
  if (!hasKeyboard()) return null;
  let waiting: BindableAction | null = null;
  const grid = h('div', { class: 'keygrid' });
  const draw = (): void => {
    grid.replaceChildren(
      ...KEY_ACTIONS.flatMap(([a, label]) => [
        h('span', null, label),
        btn(
          waiting === a ? 'Taste drücken …' : keyName(keyFor(a)),
          () => {
            waiting = waiting === a ? null : a;
            draw();
          },
          waiting === a ? 'hot' : 'ghost',
          { 'aria-label': `${label}: ${keyName(keyFor(a))} – ändern` },
        ),
      ]),
    );
  };
  const onKey = (e: KeyboardEvent): void => {
    if (!waiting || !e.isTrusted) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (e.code !== 'Escape') {
      if (!bindKey(waiting, e.code))
        toast(`${keyName(e.code)} ist fest belegt (Pfeile, Enter, Esc).`, 'info');
    }
    waiting = null;
    draw();
  };
  window.addEventListener('keydown', onKey, true);
  draw();
  const sec = section(
    '⌨️ Tastatur',
    h(
      'p',
      { class: 'hint' },
      'Aktion anklicken, dann die neue Taste drücken (Esc bricht ab). Pfeiltasten, Enter und Esc bleiben immer gleich. Esc = Pausemenü bzw. zurück.',
    ),
    grid,
    h(
      'div',
      { class: 'btnrow' },
      btn(
        'Standard-Tasten',
        () => {
          resetKeys();
          waiting = null;
          draw();
        },
        'ghost',
      ),
    ),
  );
  return { el: sec, dispose: () => window.removeEventListener('keydown', onKey, true) };
}
