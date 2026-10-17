// Einstellungen (Grafik, Ton, Spielregeln, Steuerung, Barrierefreiheit) und Hilfe.
import type { Settings } from '../sim/types';
import { DEFAULT_SETTINGS } from '../sim/types';
import { h, modal, tabs } from './dom';

export const PROFILE_SETTINGS_KEY = 'ricolife.profile';

export interface Profile {
  settings: Partial<Settings>;
  tutorial?: boolean;
  lastSlot?: number;
  mpName?: string;
  /** Mehrspieler-Figur (Steckbrief), überlebt Sitzungen */
  mpChar?: unknown;
}
export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(PROFILE_SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as Profile;
  } catch {
    /* privat/gesperrt */
  }
  return { settings: {} };
}
export function saveProfile(p: Profile): void {
  try {
    localStorage.setItem(PROFILE_SETTINGS_KEY, JSON.stringify(p));
  } catch {
    /* ignorieren */
  }
}

export const KEY_ACTIONS: { id: string; label: string; def: string }[] = [
  { id: 'up', label: 'Kamera vor', def: 'w' },
  { id: 'down', label: 'Kamera zurück', def: 's' },
  { id: 'left', label: 'Kamera links', def: 'a' },
  { id: 'right', label: 'Kamera rechts', def: 'd' },
  { id: 'rotL', label: 'Drehen links', def: 'q' },
  { id: 'rotR', label: 'Drehen rechts', def: 'e' },
  { id: 'zoomIn', label: 'Heranzoomen', def: '+' },
  { id: 'zoomOut', label: 'Herauszoomen', def: '-' },
  { id: 'pause', label: 'Pause', def: ' ' },
  { id: 'speed1', label: 'Tempo 1', def: '1' },
  { id: 'speed2', label: 'Tempo 2', def: '2' },
  { id: 'speed3', label: 'Tempo 3', def: '3' },
  { id: 'buy', label: 'Kaufmodus', def: 'b' },
  { id: 'build', label: 'Baumodus', def: 'n' },
  { id: 'live', label: 'Lebensmodus', def: 'f' },
  { id: 'phone', label: 'Handy', def: 'p' },
  { id: 'map', label: 'Karte', def: 'm' },
  { id: 'nextSim', label: 'Nächste Figur', def: 'tab' },
  { id: 'rotate', label: 'Objekt drehen', def: 'r' },
  { id: 'level', label: 'Stockwerk', def: 'pageup' },
  { id: 'walls', label: 'Wände', def: 'v' },
  { id: 'undo', label: 'Rückgängig', def: 'z' },
  { id: 'redo', label: 'Wiederholen', def: 'y' },
];
export function keyFor(s: Settings, id: string): string {
  return (s.keys[id] ?? KEY_ACTIONS.find((k) => k.id === id)?.def ?? '').toLowerCase();
}

export function openSettings(settings: Settings, onChange: (s: Settings, key: keyof Settings) => void, inGame: boolean): void {
  const set = <K extends keyof Settings>(k: K, v: Settings[K]): void => {
    settings[k] = v;
    onChange(settings, k);
  };
  const chk = (k: keyof Settings, label: string, hint?: string): HTMLElement =>
    h('label', { class: 'kv', style: 'align-items:center;cursor:pointer' }, h('span', null, label, hint ? h('div', null, h('small', { class: 'muted' }, hint)) : null), h('input', { type: 'checkbox', checked: !!settings[k], onchange: (e: Event) => set(k, (e.target as HTMLInputElement).checked as never) }));
  const sel = <K extends keyof Settings>(k: K, label: string, opts: [Settings[K], string][]): HTMLElement =>
    h('label', { class: 'field' }, h('span', null, label), h('select', { onchange: (e: Event) => { const i = (e.target as HTMLSelectElement).selectedIndex; set(k, opts[i]![0]); } }, opts.map(([v, l]) => h('option', { selected: settings[k] === v }, l))));
  const range = (k: keyof Settings, label: string, min: number, max: number, step: number, fmt: (v: number) => string): HTMLElement => {
    const out = h('b', null, fmt(settings[k] as number));
    return h('label', { class: 'field' }, h('span', { class: 'row' }, h('span', { class: 'grow' }, label), out), h('input', { type: 'range', min, max, step, value: settings[k] as number, oninput: (e: Event) => { const v = Number((e.target as HTMLInputElement).value); out.textContent = fmt(v); set(k, v as never); } }));
  };
  const gfx = (): Node =>
    h('div', null,
      sel('quality', 'Grafikqualität', [['auto', 'Automatisch'], ['low', 'Niedrig (schwache Geräte)'], ['mid', 'Mittel'], ['high', 'Hoch']]),
      chk('shadows', 'Schatten', 'Kostet Leistung'),
      range('resScale', 'Auflösung', 0.5, 1, 0.05, (v) => `${Math.round(v * 100)} %`),
      range('maxNpcs', 'Max. sichtbare Stadtbewohner', 4, 24, 1, (v) => String(v)),
      chk('fps', 'Bildrate anzeigen'),
    );
  const audio = (): Node => h('div', null, range('volume', 'Effekte', 0, 1, 0.05, (v) => `${Math.round(v * 100)} %`), range('music', 'Musik', 0, 1, 0.05, (v) => `${Math.round(v * 100)} %`));
  const game = (): Node =>
    h('div', null,
      sel('autonomy', 'Autonomie deiner Figuren', [[2, 'Normal'], [1, 'Nur bei dringenden Bedürfnissen'], [0, 'Aus']]),
      chk('aging', 'Altern und Familienzuwachs', 'Figuren deines Haushalts werden älter, Babys sind möglich'),
      sel('lifespan', 'Lebensdauer', [[0, 'Kurz'], [1, 'Normal'], [2, 'Lang']]),
      chk('hardEvents', 'Sanfter Abschied im hohen Alter', 'Aus: Senior:innen bleiben für immer'),
      range('needsDecay', 'Bedürfnisse sinken', 0.5, 1.5, 0.05, (v) => (v < 0.8 ? 'langsam' : v > 1.2 ? 'schnell' : 'normal')),
      sel('seasonDays', 'Tage pro Jahreszeit', [[3, '3'], [5, '5'], [7, '7'], [14, '14']]),
      sel('fixedSeason', 'Jahreszeit', [['', 'Wechselnd'], ['spring', 'Immer Frühling'], ['summer', 'Immer Sommer'], ['autumn', 'Immer Herbst'], ['winter', 'Immer Winter']]),
      chk('events', 'Zufallsereignisse'),
      chk('creative', 'Kreativmodus', 'Bauen und Kaufen kostet nichts'),
      inGame ? null : h('small', { class: 'muted' }, 'Spielregeln gelten für den nächsten Spielstand und lassen sich im Spiel ändern.'),
    );
  const access = (): Node => h('div', null, chk('bigText', 'Große Schrift'), chk('highContrast', 'Hoher Kontrast'), chk('reduceMotion', 'Weniger Bewegung', 'Keine Kamerafahrten und Animationen der Oberfläche'), chk('edgeScroll', 'Kamera am Bildschirmrand bewegen (Maus)'), range('padDeadzone', 'Controller-Totzone', 0.05, 0.5, 0.05, (v) => v.toFixed(2)));
  const keys = (): Node => {
    const wrap = h('div', null, h('p', { class: 'muted' }, 'Feld anklicken und neue Taste drücken. Esc behält die alte Belegung.'));
    for (const k of KEY_ACTIONS) {
      const inp = h('input', { type: 'text', value: keyFor(settings, k.id), readonly: true, style: 'width:110px;text-align:center', 'aria-label': k.label });
      inp.addEventListener('keydown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.key === 'Escape') return inp.blur();
        const key = e.key === ' ' ? ' ' : e.key.toLowerCase();
        settings.keys[k.id] = key;
        inp.value = key;
        onChange(settings, 'keys');
        inp.blur();
      });
      wrap.appendChild(h('div', { class: 'kv' }, h('span', null, k.label), inp));
    }
    wrap.appendChild(h('button', { class: 'btn small', onclick: () => { settings.keys = {}; onChange(settings, 'keys'); for (const i of wrap.querySelectorAll('input')) i.value = KEY_ACTIONS.find((x) => x.label === i.getAttribute('aria-label'))?.def ?? ''; } }, 'Standard wiederherstellen'));
    return wrap;
  };
  modal({ title: 'Einstellungen', icon: '⚙️', wide: true, body: tabs([{ id: 'game', label: 'Spiel', render: game }, { id: 'gfx', label: 'Grafik', render: gfx }, { id: 'audio', label: 'Ton', render: audio }, { id: 'access', label: 'Barrierefreiheit', render: access }, { id: 'keys', label: 'Tasten', render: keys }], 'game') });
}

export function defaultSettings(p: Profile): Settings {
  return { ...DEFAULT_SETTINGS, ...p.settings, keys: { ...(p.settings.keys ?? {}) } };
}

export function openHelp(): void {
  const sec = (t: string, ...lines: string[]): HTMLElement => h('div', { class: 'card', style: 'margin:6px 0' }, h('h3', null, t), lines.map((l) => h('p', null, l)));
  modal({
    title: 'Hilfe',
    icon: '❓',
    wide: true,
    body: tabs(
      [
        { id: 'start', label: 'Erste Schritte', render: () => h('div', null,
          sec('Leben', 'Tippe oder klicke auf Gegenstände, Personen oder Haustiere, um Aktionen zu wählen. Deine Figur läuft hin und führt sie aus.', 'Bis zu acht Aktionen stehen in der Warteschlange unten. Antippen bricht eine Aktion ab.', 'Halte die Bedürfnisse (Hunger, Energie, Hygiene, Blase, Soziales, Spaß, Komfort) im grünen Bereich – dann ist die Stimmung gut und alles gelingt besser.'),
          sec('Geld', 'Mit einem Job (Handy → Jobs) verdienst du RicoTaler. Montags kommen Rechnungen; bezahle sie am Briefkasten oder im Handy, sonst wird nach drei Tagen der Strom abgestellt.'),
          sec('Ziele', 'Jede Figur hat ein Lebensziel mit drei Meilensteinen. Geschichten führen mit Aufgaben durch das Spiel – es bleibt trotzdem alles frei.'),
        ) },
        { id: 'ctrl', label: 'Steuerung', render: () => h('div', null,
          sec('Maus & Tastatur', 'Linksklick: auswählen/Aktion · Rechte Maustaste ziehen oder Q/E: drehen · Mittlere Maustaste oder WASD: verschieben · Mausrad: zoomen', 'Leertaste: Pause · 1/2/3: Tempo · Tab: nächste Figur · B/N/F: Kaufen/Bauen/Leben · R: Objekt drehen · Strg+Z / Strg+Y: Rückgängig/Wiederholen · Bild↑/↓: Stockwerk · V: Wände · Esc: Menü schließen'),
          sec('Touch', 'Tippen: auswählen · Ein Finger ziehen: verschieben · Zwei Finger: zoomen und drehen · Langes Tippen: Aktionsmenü'),
          sec('Controller', 'Linker Stick: Kamera · Rechter Stick: drehen/zoomen · A: Aktion in der Bildmitte · B: zurück · X: Handy · Y: eigene Aktionen · LB/RB: Figur wechseln · Steuerkreuz ←/→: Tempo, ↑/↓: Stockwerk · Back: Stadtkarte · Start: Menü'),
        ) },
        { id: 'build', label: 'Bauen & Kaufen', render: () => h('div', null,
          sec('Kaufmodus', 'Wähle ein Objekt im Katalog und tippe auf dein Grundstück. Grün = passt, Rot = geht nicht (Grund steht oben). Drehen mit R oder dem Drehknopf. Antippen eines vorhandenen Objekts: verschieben, drehen, verkaufen.'),
          sec('Baumodus', 'Wände ziehen, Räume aufziehen, Böden legen, Türen und Fenster in Wände setzen, Treppen für das Obergeschoss, Wandfarben ändern, Abreißen. Rückgängig/Wiederholen jederzeit.'),
          sec('Regeln', 'Gebaut wird nur auf dem eigenen Grundstück. Jede Figur muss Türen, Betten und Geräte erreichen können – zugestellte Wege werden rot angezeigt.'),
        ) },
        { id: 'mp', label: 'Mehrspieler', render: () => h('div', null, sec('Gemeinsam spielen', 'Im Menü „Mehrspieler“ eröffnest du einen Raum und bekommst einen Code. Bis zu drei Freund:innen treten mit dem Code bei und bringen ihre eigene Figur mit.', 'Das Gerät, das den Raum eröffnet, rechnet das Spiel und speichert. Gäste steuern ihre Figur, plaudern, arbeiten und erleben die Stadt mit. Bauen kann nur der Gastgeber.', 'Die Verbindung wird über Firebase vermittelt und läuft dann direkt zwischen den Geräten (WebRTC).')) },
      ],
      'start',
    ),
  });
}
