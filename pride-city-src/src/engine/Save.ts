/* Spielstand: ein localStorage-Schlüssel (von ../cloud/anmacha-cloud.js mit dem Google-Konto abgeglichen).
   Übernimmt beim ersten Start einen alten Gay-Life!-Spielstand (Name, Geld, Tag, Glitzer). */

export const KEY = 'prideCity.save';
const OLD = 'anmachaGayLife';
export const VERSION = 1;

export interface Settings { music: number; sfx: number; quality: number; touch: number; invertY: boolean; camSpeed: number; /** Inhalte ab 18 (Flirts, Erotik angedeutet), Standard aus */ adult: boolean }

export interface SaveData {
  v: number;
  started: boolean;
  name: string;
  pronouns: string;
  body: string;
  palette: string;
  skin: number;
  money: number;
  /** Ruf in der Szene, schaltet Viertel und Kapitel frei */
  rep: number;
  glitter: number;
  day: number;
  /** Tagesanteil 0..1, 0 = 6:00 */
  time: number;
  chapter: number;
  step: number;
  flags: Record<string, string | number | boolean>;
  goals: string[];
  best: Record<string, number>;
  pos: { x: number; z: number; yaw: number };
  /** Bedürfnisse 0..100 (hoch = gut) */
  needs: { energy: number; hunger: number; hygiene: number; social: number; fun: number };
  /** Lebensmittel zum Kochen */
  food: number;
  jobs: Record<string, { xp: number; shifts: number; earned: number }>;
  /** Schichten heute: Tag und Anzahl */
  jobDay: { d: number; n: number };
  /** Kontakte: Freundschaft 0..100, letzter Gesprächstag */
  rel: Record<string, { f: number; last: number }>;
  /** Tagesziele: Tag, erledigte Ziel-IDs, Zähler */
  daily: { d: number; done: string[]; c: Record<string, number> };
  /** Ziel auf der Karte markiert (POI-ID) */
  pin: string;
  /** Gegenstände: Kondome, Gleitgel, Toys … */
  inv: Record<string, number>;
  /** Gesundheit: letzter Test (Tag), PrEP an/aus */
  health: { test: number; prep: boolean };
  /** Dating: Stufe 0..3 je Profil, letzter Date-Tag, geplantes Date (Tag) und Ort */
  dates: Record<string, { st: number; last: number; plan: number; at: string }>;
  /** Social-Feed: eigene Beiträge und Ereignisse */
  feed: Array<{ d: number; who: string; t: string }>;
  /** zuletzt drinnen (Wohnung) gespeichert */
  inside: boolean;
  imported: boolean;
  playMs: number;
  settings: Settings;
}

export function defaults(): SaveData {
  return {
    v: VERSION, started: false, name: 'Alex', pronouns: 'they', body: 'Rogue', palette: 'rainbow', skin: 1,
    money: 150, rep: 0, glitter: 0, day: 1, time: .1, chapter: 1, step: 0, flags: {}, goals: [], best: {},
    pos: { x: 0, z: 18, yaw: Math.PI }, imported: false, playMs: 0,
    needs: { energy: 85, hunger: 75, hygiene: 80, social: 60, fun: 65 }, food: 2, jobs: {}, jobDay: { d: 0, n: 0 }, rel: {},
    daily: { d: 0, done: [], c: {} }, pin: '', inside: false,
    inv: { condom: 0, lube: 0, toy: 0 }, health: { test: 0, prep: false }, dates: {}, feed: [],
    settings: { music: .55, sfx: .8, quality: -1, touch: -1, invertY: false, camSpeed: 1, adult: false },
  };
}

type Obj = Record<string, unknown>;
function merge<T>(d: T, s: unknown): T {
  if (!s || typeof s !== 'object') return d;
  const o = d as Obj;
  for (const [k, v] of Object.entries(s as Obj)) {
    if (!(k in o)) continue;
    const cur = o[k];
    if (cur && typeof cur === 'object' && !Array.isArray(cur) && v && typeof v === 'object' && !Array.isArray(v) && k !== 'flags' && k !== 'best' && k !== 'jobs' && k !== 'rel' && k !== 'c' && k !== 'inv' && k !== 'dates') o[k] = merge(cur, v);
    else if (v !== null && v !== undefined && typeof v === typeof cur) o[k] = v;
  }
  return d;
}

/** Reine Funktion (getestet): roher Stand → gültiger Stand */
export function migrate(raw: unknown): SaveData {
  return merge(defaults(), raw);
}

/** Reine Funktion (getestet): alter Gay-Life!-Stand → Startwerte */
export function fromGayLife(old: unknown): Partial<SaveData> | null {
  if (!old || typeof old !== 'object') return null;
  const o = old as { name?: unknown; glitzer?: unknown; life?: { money?: unknown; day?: unknown } };
  const out: Partial<SaveData> = {};
  if (typeof o.name === 'string' && o.name.trim() && o.name !== 'Du') out.name = o.name.trim().slice(0, 16);
  const m = Number(o.life?.money);
  if (Number.isFinite(m) && m > 0) out.money = Math.min(5000, Math.round(m));
  const g = Number(o.glitzer);
  if (Number.isFinite(g) && g > 0) out.glitter = Math.min(9999, Math.round(g));
  return Object.keys(out).length ? out : null;
}

export class Save {
  data: SaveData;
  oldFound: Partial<SaveData> | null = null;
  constructor() {
    let raw: unknown = null;
    try { raw = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { raw = null; }
    this.data = migrate(raw);
    if (!raw) {
      try { this.oldFound = fromGayLife(JSON.parse(localStorage.getItem(OLD) || 'null')); } catch { this.oldFound = null; }
    }
  }
  get hasGame() { return this.data.started; }
  write() {
    try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch { /* Speicher voll oder gesperrt */ }
  }
  newGame(keepSettings = true) {
    const s = this.data.settings;
    this.data = defaults();
    if (keepSettings) this.data.settings = s;
  }
  importOld() {
    if (!this.oldFound) return;
    Object.assign(this.data, this.oldFound, { imported: true });
  }
}
