// Ein Bedienkonzept für alle Geräte: Mit Controller erscheinen die passenden Tastensymbole (PlayStation ✕○□△, Switch A B X Y,
// Xbox) an denselben Bildschirm-Knöpfen, die man am Handy antippt, dazu ein Zielkreuz in der Bildmitte und eine Hinweisleiste.
// TV-/Konsolen-Oberfläche: größer, mit Rand für Fernseher (automatisch an Konsolen-/TV-Browsern und im Controller-Modus am großen Bildschirm).
import { h } from './dom';

type Kind = 'ps' | 'switch' | 'xbox';
interface EgPad {
  glyph?(k: string): string;
  active?(): boolean;
}
interface EgPadNormal {
  kind?(): Kind;
}
const W = window as unknown as { EasyGamesPad?: EgPad; EasyGamesPadNormal?: EgPadNormal };

const GLYPHS: Record<Kind, Record<string, string>> = {
  ps: { a: '✕', b: '○', x: '□', y: '△', lb: 'L1', rb: 'R1', lt: 'L2', rt: 'R2', back: 'Create', start: 'Options', l3: 'L3', r3: 'R3' },
  switch: { a: 'A', b: 'B', x: 'X', y: 'Y', lb: 'L', rb: 'R', lt: 'ZL', rt: 'ZR', back: '−', start: '+', l3: 'L🕹', r3: 'R🕹' },
  xbox: { a: 'A', b: 'B', x: 'X', y: 'Y', lb: 'LB', rb: 'RB', lt: 'LT', rt: 'RT', back: '⧉', start: '☰', l3: 'LS', r3: 'RS' },
};
const DPAD: Record<string, string> = { dpad: '✚', dud: '✚↕', dlr: '✚↔', ls: 'L🕹', rs: 'R🕹' };

function detectKind(): Kind {
  try {
    const k = W.EasyGamesPadNormal?.kind?.();
    if (k === 'ps' || k === 'switch' || k === 'xbox') return k;
  } catch {
    /* gamepad.js fehlt */
  }
  const pads = navigator.getGamepads?.() ?? [];
  for (const p of pads) {
    if (!p) continue;
    if (/054c|playstation|dualsense|dualshock|wireless controller/i.test(p.id)) return 'ps';
    if (/057e|nintendo|pro controller|joy-?con|switch/i.test(p.id)) return 'switch';
    return 'xbox';
  }
  return 'xbox';
}

/** Tastensymbol für einen logischen Knopf (nach Umbelegung in gamepad.js) */
export function glyph(k: string): string {
  if (DPAD[k]) return DPAD[k]!;
  const kind = detectKind();
  if (kind !== 'ps') {
    // gamepad.js kennt die Umbelegung des Spielers
    try {
      const g = W.EasyGamesPad?.glyph?.(k === 'back' ? 'select' : k);
      if (g && g.length <= 7) return g;
    } catch {
      /* ohne gamepad.js */
    }
  }
  return GLYPHS[kind][k] ?? k.toUpperCase();
}

/** Farbklasse eines Knopfs: PlayStation-Farben, Switch/Xbox einheitlich */
function tone(k: string): string {
  return ['a', 'b', 'x', 'y'].includes(k) ? `pg-${detectKind()}-${k}` : 'pg-sys';
}

export function glyphEl(k: string): HTMLElement {
  return h('span', { class: `pg ${tone(k)}`, 'data-pad': k }, glyph(k));
}

/** TV/Konsole erkennen (Browser auf Fernseher und Spielkonsolen) */
export const TV_UA = /SMART-TV|SmartTV|Tizen|Web0S|webOS|NetCast|BRAVIA|Android TV|GoogleTV|AFT[A-Z]|CrKey|PlayStation|Nintendo|Xbox|HbbTV|VIDAA/i;

export type PadCtx = 'off' | 'menu' | 'pie' | 'live' | 'build' | 'buy' | 'drag';

const HINTS: Record<Exclude<PadCtx, 'off'>, [string, string][]> = {
  menu: [['dpad', 'Wählen'], ['a', 'OK'], ['b', 'Zurück'], ['lb', 'Reiter'], ['rs', 'Blättern']],
  pie: [['dpad', 'Wählen'], ['a', 'Ausführen'], ['b', 'Schließen']],
  live: [['a', 'Aktion'], ['y', 'Ich'], ['x', 'Handy'], ['lb', 'Figur'], ['lt', 'Kaufen'], ['rt', 'Bauen'], ['dlr', 'Tempo'], ['start', 'Menü']],
  build: [['a', 'Setzen'], ['x', 'Drehen'], ['y', 'Abriss'], ['lb', 'Werkzeug'], ['dud', 'Etage'], ['rt', 'Fertig'], ['b', 'Zurück']],
  buy: [['a', 'Setzen/Nehmen'], ['x', 'Drehen'], ['y', 'Verkaufen'], ['lb', 'Objekt'], ['dud', 'Etage'], ['lt', 'Fertig'], ['b', 'Zurück']],
  drag: [['ls', 'Ziehen'], ['a', 'Ende setzen'], ['b', 'Abbrechen']],
};

/** Knöpfe der Oberfläche, die eine feste Controller-Taste haben (gleiche Funktion wie Antippen) */
const BADGES: [string, string][] = [
  ['#btnMenu', 'start'],
  ['#btnBuy', 'lt'],
  ['#btnBuild', 'rt'],
  ['#btnPhone', 'x'],
  ['#btnMap', 'back'],
  ['#btnLevel', 'dud'],
  ['#btnWalls', 'l3'],
];

export class PadUi {
  private bar = h('div', { class: 'padbar', 'aria-hidden': 'true' });
  private reticle = h('div', { class: 'reticle', 'aria-hidden': 'true' });
  private on = false;
  private sig = '';
  private kind: Kind | '' = '';

  constructor(root: HTMLElement, private ctx: () => PadCtx, private uiMode: () => 'auto' | 'touch' | 'pc' | 'tv') {
    root.append(this.reticle, this.bar);
    // echte Berührung oder Maus beendet den Controller-Modus (Klicks von gamepad.js sind keine Berührung)
    window.addEventListener(
      'pointerdown',
      (e) => {
        if (e.isTrusted) this.set(false);
      },
      true,
    );
    window.addEventListener('keydown', (e) => {
      if (e.isTrusted && !e.repeat && /^Key|^Digit|^Arrow/.test(e.code) && this.on) this.set(false);
    });
    window.addEventListener('gamepaddisconnected', () => {
      if (!navigator.getGamepads?.().some((p) => p?.connected)) this.set(false);
    });
    window.addEventListener('resize', () => this.applyMode());
    this.applyMode();
  }

  /** Controller wurde benutzt */
  touch(): void {
    if (!this.on) this.set(true);
  }
  get active(): boolean {
    return this.on;
  }

  private set(on: boolean): void {
    if (this.on === on) return;
    this.on = on;
    document.documentElement.classList.toggle('pad', on);
    this.sig = '';
    this.applyMode();
  }

  /** TV-Oberfläche an/aus (Einstellung „Oberfläche“) */
  applyMode(): void {
    const m = this.uiMode();
    const big = window.innerWidth >= 1100 && window.innerHeight >= 600;
    const tv = m === 'tv' || (m === 'auto' && (TV_UA.test(navigator.userAgent) || new URLSearchParams(location.search).has('tv') || (this.on && big)));
    document.documentElement.classList.toggle('tv', tv);
    document.documentElement.classList.toggle('touchui', m === 'touch');
  }

  /** pro Bild: Hinweise nur bei Änderung neu aufbauen */
  update(): void {
    if (!this.on) return;
    const k = detectKind();
    const c = this.ctx();
    const sig = `${k}|${c}`;
    if (sig === this.sig) {
      if (!document.querySelector('.hud-top > .pgwrap') && document.querySelector('.hud-top')) this.badges();
      return;
    }
    this.sig = sig;
    const kindChanged = k !== this.kind;
    this.kind = k;
    this.reticle.classList.toggle('hidden', !(c === 'live' || c === 'build' || c === 'buy' || c === 'drag'));
    this.bar.replaceChildren(...(c === 'off' ? [] : HINTS[c].map(([b, t]) => h('span', { class: 'ph' }, glyphEl(b), t))));
    this.bar.classList.toggle('hidden', c === 'off');
    this.reticle.classList.toggle('drag', c === 'drag');
    this.bar.classList.toggle('top', c === 'build' || c === 'buy' || c === 'drag');
    if (kindChanged || !document.querySelector('#btnMenu .pg')) this.badges();
  }

  /** Tastensymbole an die Bildschirm-Knöpfe hängen (nur im Controller-Modus sichtbar) */
  badges(): void {
    for (const [sel, k] of BADGES) {
      const el = document.querySelector<HTMLElement>(sel);
      if (!el) continue;
      el.querySelector('.pg')?.remove();
      el.appendChild(glyphEl(k));
    }
    const top = document.querySelector<HTMLElement>('.hud-top');
    top?.querySelector(':scope > .pgwrap')?.remove();
    top?.prepend(h('span', { class: 'pgwrap' }, glyphEl('lb'), glyphEl('rb')));
    const spd = document.querySelector<HTMLElement>('.spd');
    spd?.querySelector('.pg')?.remove();
    spd?.prepend(glyphEl('dlr'));
  }
}
