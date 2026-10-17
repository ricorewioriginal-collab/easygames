// Eingabe: Tastatur, Gamepad und Aktionen. Touch-Bedienelemente erzeugen dieselben Aktionen (siehe ui/hud.ts).
export type Action =
  | 'throttleUp' | 'throttleDown' | 'brakeUp' | 'brakeDown' | 'emergency' | 'reverser' | 'reverserBack' | 'horn' | 'doors' | 'doorsClose'
  | 'panto' | 'mainSwitch' | 'lights' | 'sand' | 'pzb' | 'zs1' | 'isolate' | 'couple' | 'uncouple' | 'load' | 'unload' | 'cabChange'
  | 'camera' | 'cam1' | 'cam2' | 'cam3' | 'cam4' | 'cam5' | 'cam6' | 'cam7' | 'map' | 'pause' | 'help' | 'timewarp' | 'screenshot' | 'replay'
  | 'cutoffUp' | 'cutoffDown' | 'injector' | 'firing' | 'wipers' | 'cabLight' | 'parking' | 'shunt' | 'hud' | 'conductor' | 'ticket';

export interface KeyDef { key: string; label: string; act: Action; shift?: boolean; hold?: boolean }

export const KEYS: KeyDef[] = [
  { key: 'KeyW', label: 'W / ↑', act: 'throttleUp', hold: true }, { key: 'ArrowUp', label: '', act: 'throttleUp', hold: true },
  { key: 'KeyS', label: 'S / ↓', act: 'throttleDown', hold: true }, { key: 'ArrowDown', label: '', act: 'throttleDown', hold: true },
  { key: 'KeyE', label: 'E', act: 'brakeUp', hold: true }, { key: 'KeyQ', label: 'Q', act: 'brakeDown', hold: true },
  { key: 'Space', label: 'Leertaste', act: 'emergency' }, { key: 'KeyR', label: 'R', act: 'reverser' }, { key: 'KeyR', label: '⇧R', act: 'reverserBack', shift: true },
  { key: 'KeyH', label: 'H (halten)', act: 'horn', hold: true }, { key: 'KeyT', label: 'T', act: 'doors' }, { key: 'KeyT', label: '⇧T', act: 'doorsClose', shift: true },
  { key: 'KeyP', label: 'P', act: 'panto' }, { key: 'KeyU', label: 'U', act: 'mainSwitch' }, { key: 'KeyL', label: 'L', act: 'lights' },
  { key: 'KeyG', label: 'G (halten)', act: 'sand', hold: true }, { key: 'KeyV', label: 'V', act: 'pzb' }, { key: 'KeyZ', label: 'Z', act: 'zs1' }, { key: 'KeyY', label: '', act: 'zs1' },
  { key: 'KeyI', label: 'I', act: 'isolate' }, { key: 'KeyK', label: 'K', act: 'couple' }, { key: 'KeyJ', label: 'J', act: 'uncouple' },
  { key: 'KeyN', label: 'N', act: 'load' }, { key: 'KeyN', label: '⇧N', act: 'unload', shift: true }, { key: 'KeyF', label: 'F', act: 'cabChange' },
  { key: 'KeyC', label: 'C', act: 'camera' }, { key: 'Digit1', label: '1–7', act: 'cam1' }, { key: 'Digit2', label: '', act: 'cam2' }, { key: 'Digit3', label: '', act: 'cam3' },
  { key: 'Digit4', label: '', act: 'cam4' }, { key: 'Digit5', label: '', act: 'cam5' }, { key: 'Digit6', label: '', act: 'cam6' }, { key: 'Digit7', label: '', act: 'cam7' },
  { key: 'KeyM', label: 'M', act: 'map' }, { key: 'Escape', label: 'Esc', act: 'pause' }, { key: 'F1', label: 'F1', act: 'help' }, { key: 'Tab', label: 'Tab', act: 'timewarp' },
  { key: 'F9', label: 'F9', act: 'screenshot' }, { key: 'F8', label: 'F8', act: 'replay' },
  { key: 'Comma', label: ', / .', act: 'cutoffDown', hold: true }, { key: 'Period', label: '', act: 'cutoffUp', hold: true }, { key: 'KeyI', label: '⇧I', act: 'injector', shift: true },
  { key: 'KeyB', label: 'B', act: 'firing' }, { key: 'KeyO', label: 'O', act: 'wipers' }, { key: 'KeyL', label: '⇧L', act: 'cabLight', shift: true }, { key: 'KeyX', label: 'X', act: 'parking' },
  { key: 'KeyA', label: 'A', act: 'shunt' }, { key: 'F2', label: 'F2', act: 'hud' },
  { key: 'F4', label: 'F4', act: 'conductor' }, { key: 'Enter', label: 'Enter', act: 'ticket' },
];

export const ACTION_LABELS: Partial<Record<Action, string>> = {
  throttleUp: 'Fahren / Leistung +', throttleDown: 'Leistung − / Bremsen', brakeUp: 'Führerbremsventil: mehr bremsen', brakeDown: 'Bremse lösen', emergency: 'Schnellbremsung',
  reverser: 'Richtungswender vor', reverserBack: 'Richtungswender zurück', horn: 'Signalhorn / Pfeife', doors: 'Türen freigeben (Bahnsteigseite)', doorsClose: 'Türen schließen',
  panto: 'Stromabnehmer heben/senken', mainSwitch: 'Hauptschalter / Motor an/aus', lights: 'Spitzenlicht', sand: 'Sanden', pzb: 'Wachsam / Sifa quittieren',
  zs1: 'Ersatzsignal anfordern', isolate: 'Gestörte Tür absperren', couple: 'Kuppeln vorbereiten', uncouple: 'Entkuppeln', load: 'Beladen', unload: 'Entladen', cabChange: 'Führerstand wechseln',
  camera: 'Kamera wechseln', map: 'Gleisplan / Karte', pause: 'Pause', help: 'Hilfe', timewarp: 'Zeitraffer', screenshot: 'Bildschirmfoto', replay: 'Wiederholung',
  cutoffDown: 'Dampf: Steuerung', injector: 'Dampf: Injektor', firing: 'Dampf: Feuern', wipers: 'Scheibenwischer', cabLight: 'Führerstandslicht', parking: 'Feststellbremse', shunt: 'Rangierfahrt an/aus', hud: 'Anzeige ein/aus',
  conductor: 'Schaffner-Modus an/aus (Zug fährt selbst, W/S = gehen)', ticket: 'Schaffner: Fahrkarte prüfen',
};

/** Tastatur- und Gamepad-Zustand */
export class Input {
  held = new Set<Action>();
  private listeners: ((a: Action, down: boolean) => void)[] = [];
  private gpPrev: boolean[] = [];
  enabled = true;
  /** Gamepad-Achsen (−1..1) */
  axis = { lever: 0, lookX: 0, lookY: 0, active: false };

  constructor() {
    window.addEventListener('keydown', this.kd);
    window.addEventListener('keyup', this.ku);
    window.addEventListener('blur', this.blur);
  }
  dispose() { window.removeEventListener('keydown', this.kd); window.removeEventListener('keyup', this.ku); window.removeEventListener('blur', this.blur); this.listeners = []; }
  on(f: (a: Action, down: boolean) => void) { this.listeners.push(f); }
  emit(a: Action, down: boolean) { if (down) this.held.add(a); else this.held.delete(a); for (const f of this.listeners) f(a, down); }

  private find(e: KeyboardEvent): KeyDef | undefined {
    return KEYS.find((k) => k.key === e.code && !!k.shift === e.shiftKey) ?? KEYS.find((k) => k.key === e.code && !k.shift);
  }
  private kd = (e: KeyboardEvent) => {
    if (!this.enabled) return;
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return;
    if (e.code === 'Enter' && (t?.tagName === 'BUTTON' || document.querySelector('.overlay.dlg'))) return; // Enter bleibt für Knöpfe/Dialoge
    const k = this.find(e); if (!k) return;
    e.preventDefault();
    if (e.repeat) return;
    this.emit(k.act, true);
  };
  private ku = (e: KeyboardEvent) => {
    for (const k of KEYS) if (k.key === e.code && this.held.has(k.act)) this.emit(k.act, false);
  };
  private blur = () => { for (const a of [...this.held]) this.emit(a, false); };

  /** Gamepad abfragen (Standard-Layout) */
  pollGamepad() {
    const pads = navigator.getGamepads?.() ?? [];
    const gp = [...pads].find((p) => p && p.connected);
    if (!gp) { this.axis.active = false; return; }
    this.axis.active = true;
    const dz = (v: number) => (Math.abs(v) < 0.15 ? 0 : v);
    // Rechter Trigger = Fahren, linker Trigger = Bremsen
    const rt = gp.buttons[7]?.value ?? 0, lt = gp.buttons[6]?.value ?? 0;
    this.axis.lever = rt > 0.05 || lt > 0.05 ? rt - lt : -dz(gp.axes[1] ?? 0);
    this.axis.lookX = dz(gp.axes[2] ?? 0); this.axis.lookY = dz(gp.axes[3] ?? 0);
    const map: [number, Action][] = [[0, 'doors'], [1, 'emergency'], [2, 'horn'], [3, 'camera'], [4, 'pzb'], [5, 'reverser'], [8, 'map'], [9, 'pause'], [12, 'throttleUp'], [13, 'throttleDown'], [14, 'brakeDown'], [15, 'brakeUp']];
    for (const [i, a] of map) {
      const p = !!gp.buttons[i]?.pressed;
      if (p !== !!this.gpPrev[i]) this.emit(a, p);
      this.gpPrev[i] = p;
    }
  }
}
