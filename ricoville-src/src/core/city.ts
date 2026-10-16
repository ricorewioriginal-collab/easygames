// Spielregeln von RicoVille. Reine Logik ohne DOM/Three.js, Zeit wird injiziert → vollständig testbar.
import { BUILDING, ROAD_COST } from '../catalogs/buildings';
import { CROP, ITEM, MARKET, ORDER, RECIPE } from '../catalogs/items';
import { ACHIEVEMENTS, QUEST, QUESTS, TASK_TEMPLATES } from '../catalogs/quests';
import type { Building, BuildingDef, CityState, GameEvent, GoalSpec, Mode, QuestDef, Result, Rot, SocialState, TaskState } from './types';

export const MAP = 48;
export const SECTOR = 8;
export const SECTORS = MAP / SECTOR;
export const SCHEMA_VERSION = 1;
export const BASE_STORAGE = 50;
export const BASE_POPCAP = 0;
export const ENERGY_REGEN_S = 180;
export const MAX_LEVEL = 60;
/** Nachbarn: so viele Gebäude darf man je Nachbar und Tag helfen; Belohnungen sind feste kleine Werte. */
export const NEIGHBOR_HELPS = 5;
export const HELP_REWARD = { coins: 10, xp: 1 };
export const VISIT_REWARD_PER_HELP = { coins: 15, xp: 1 };
export const GIFT_ITEMS = ['bretter', 'ziegel', 'glas', 'stahl', 'holz'] as const;
export const GIFT_AMOUNT = 2;

/** UTC-Tag als Zahl JJJJMMTT – dieselbe Rechnung wie in den Firestore-Regeln (request.time). */
export function utcDay(ms: number): number {
  const d = new Date(ms);
  return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
}

const ok: Result = { ok: true };
const fail = (msg: string): Result => ({ ok: false, msg });
export const key = (x: number, y: number): string => `${x},${y}`;

/** Wasser an der Westküste: die ersten vier Spalten. */
export function isWater(x: number, y: number): boolean {
  return x < 4 || (x === 4 && y % 7 >= 2 && y % 7 <= 4);
}
export function isBeach(x: number, y: number): boolean {
  return !isWater(x, y) && x < 7;
}

export function footprint(def: BuildingDef, rot: Rot): { w: number; h: number } {
  return rot % 2 ? { w: def.h, h: def.w } : { w: def.w, h: def.h };
}

export function xpToNext(level: number): number {
  return Math.round(30 * Math.pow(level, 1.55)) + 20;
}

export function maxEnergy(level: number): number {
  return Math.min(40, 15 + Math.floor(level / 2));
}

export function sectorCost(owned: number): { coins: number; pop: number } {
  const n = Math.max(0, owned - 4);
  return { coins: Math.round(800 * Math.pow(1.32, n) / 10) * 10, pop: 25 * (n + 1) };
}

function seeded(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function dayKey(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
export function weekKey(t: number): string {
  const d = new Date(t);
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
  return `w${monday.getFullYear()}-${monday.getMonth() + 1}-${monday.getDate()}`;
}

export function newCityState(name: string, mode: Mode, now: number): CityState {
  const s: CityState = {
    v: SCHEMA_VERSION, rev: 0, name: name.trim().slice(0, 28) || 'RicoVille', slogan: '', crest: '🏰', mode,
    createdAt: now, savedAt: now, seen: now,
    coins: mode === 'creative' ? 999999 : 1200, xp: 0, level: mode === 'creative' ? MAX_LEVEL : 1,
    energy: maxEnergy(1), energyAt: now,
    inv: { weizen: 6, erdbeere: 4 }, buildings: [], roads: [], sectors: [], nextUid: 1,
    quests: {}, achievements: [], stats: {}, tutorial: mode === 'creative' ? 'skipped' : 'on',
  };
  for (const sx of [2, 3]) for (const sy of [2, 3]) s.sectors.push(key(sx, sy));
  const add = (def: string, x: number, y: number): void => {
    s.buildings.push({ uid: s.nextUid++, def, x, y, rot: 0, state: 'done', readyAt: now, t: def.startsWith('haus') ? now : undefined });
  };
  for (let x = 16; x < 32; x++) s.roads.push(key(x, 25));
  for (let y = 16; y < 25; y++) s.roads.push(key(21, y));
  add('rathaus', 22, 22);
  add('haus_rot', 18, 26);
  add('haus_blau', 26, 26);
  add('acker', 17, 19);
  add('acker', 17, 21);
  add('eiche', 25, 21);
  add('birke', 26, 22);
  add('tulpen_rot', 22, 26);
  add('bank', 23, 26);
  return s;
}

/** Deko kostet keine Energie, damit Gestalten nie ausgebremst wird. */
export function placeEnergy(d: BuildingDef): number {
  return d.cat === 'decoration' ? 0 : 1;
}

export type Listener = (e: GameEvent) => void;

export class City {
  s: CityState;
  private clock: () => number;
  private listeners: Listener[] = [];
  private occ: Map<string, number> | null = null;
  private roadSet: Set<string> | null = null;

  constructor(state: CityState, clock: () => number = Date.now) {
    this.s = state;
    this.clock = clock;
    this.refreshQuests();
  }

  on(fn: Listener): () => void {
    this.listeners.push(fn);
    return () => (this.listeners = this.listeners.filter((l) => l !== fn));
  }
  private emit(e: GameEvent): void {
    for (const l of this.listeners) l(e);
  }

  /** Monotone Uhr: läuft nie rückwärts, auch wenn die Geräteuhr zurückgestellt wird. */
  now(): number {
    const t = this.clock();
    if (t > this.s.seen) this.s.seen = t;
    return this.s.seen;
  }

  get creative(): boolean {
    return this.s.mode === 'creative';
  }
  get energyOn(): boolean {
    return this.s.mode === 'nostalgic';
  }
  /** Sekunden aus dem Katalog in echte Millisekunden je nach Modus. */
  dur(sec: number): number {
    const f = this.s.mode === 'relaxed' ? 0.5 : this.s.mode === 'creative' ? 0.1 : 1;
    return Math.round(sec * 1000 * f);
  }

  // ------------------------------------------------------------ Abfragen
  def(b: Building): BuildingDef {
    const d = BUILDING.get(b.def);
    if (!d) throw new Error('Unbekanntes Gebäude ' + b.def);
    return d;
  }
  get(uid: number): Building | undefined {
    return this.s.buildings.find((b) => b.uid === uid);
  }
  private invalidate(): void {
    this.occ = null;
    this.roadSet = null;
  }
  occupancy(): Map<string, number> {
    if (!this.occ) {
      const m = new Map<string, number>();
      for (const b of this.s.buildings) {
        const { w, h } = footprint(this.def(b), b.rot);
        for (let dx = 0; dx < w; dx++) for (let dy = 0; dy < h; dy++) m.set(key(b.x + dx, b.y + dy), b.uid);
      }
      this.occ = m;
    }
    return this.occ;
  }
  roads(): Set<string> {
    if (!this.roadSet) this.roadSet = new Set(this.s.roads);
    return this.roadSet;
  }
  isUnlocked(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= MAP || y >= MAP) return false;
    return this.s.sectors.includes(key(Math.floor(x / SECTOR), Math.floor(y / SECTOR)));
  }
  at(x: number, y: number): Building | undefined {
    const uid = this.occupancy().get(key(x, y));
    return uid === undefined ? undefined : this.get(uid);
  }
  count(defId: string): number {
    return this.s.buildings.filter((b) => b.def === defId).length;
  }
  countCat(cat: string, doneOnly = true): number {
    return this.s.buildings.filter((b) => this.def(b).cat === cat && (!doneOnly || b.state === 'done')).length;
  }

  population(): number {
    let p = 0;
    for (const b of this.s.buildings) if (b.state === 'done') p += this.def(b).pop ?? 0;
    return p;
  }
  /** Einwohner inklusive Häusern im Bau – maßgeblich für die Bauerlaubnis neuer Häuser. */
  plannedPopulation(): number {
    let p = 0;
    for (const b of this.s.buildings) p += this.def(b).pop ?? 0;
    return p;
  }
  popCap(): number {
    let c = BASE_POPCAP;
    for (const b of this.s.buildings) if (b.state === 'done') c += this.def(b).popCap ?? 0;
    return c;
  }
  storageCap(): number {
    let c = BASE_STORAGE;
    for (const b of this.s.buildings) if (b.state === 'done') c += this.def(b).storage ?? 0;
    return c;
  }
  storageUsed(): number {
    let n = 0;
    for (const v of Object.values(this.s.inv)) n += v;
    return n;
  }
  item(id: string): number {
    return this.s.inv[id] ?? 0;
  }
  happiness(): number {
    let civic = 0;
    let decos = 0;
    for (const b of this.s.buildings) {
      if (b.state !== 'done') continue;
      const d = this.def(b);
      civic += d.happiness ?? 0;
      if (d.cat === 'decoration') decos++;
    }
    const crowd = Math.max(0, (this.population() - 100) / 40);
    return Math.max(0, Math.min(100, Math.round(50 + civic * 1.5 + Math.min(30, decos * 0.5) - crowd)));
  }
  /** Mietfaktor aus Zufriedenheit: 0,85 bis 1,15 – sichtbar im Info-Fenster, nie heimlich. */
  rentFactor(): number {
    return 0.85 + this.happiness() * 0.003;
  }
  globalBonus(kind: 'rent' | 'revenue' | 'xp'): number {
    let f = 0;
    for (const b of this.s.buildings) if (b.state === 'done') f += this.def(b).bonus?.[kind] ?? 0;
    return f;
  }
  /** Attraktivität aus Deko im Umkreis: höchstens +50 %. */
  appeal(b: Building): number {
    const d = this.def(b);
    const { w, h } = footprint(d, b.rot);
    const cx = b.x + w / 2;
    const cy = b.y + h / 2;
    let a = 0;
    for (const o of this.s.buildings) {
      const od = this.def(o);
      if (od.cat !== 'decoration' || !od.appeal) continue;
      const ox = o.x + od.w / 2;
      const oy = o.y + od.h / 2;
      const r = (od.radius ?? 3) + Math.max(w, h) / 2;
      if (Math.abs(ox - cx) <= r && Math.abs(oy - cy) <= r) a += od.appeal;
    }
    return Math.min(0.5, a * 0.015);
  }
  levelFactor(b: Building): number {
    return 1 + 0.2 * ((b.lvl ?? 1) - 1);
  }
  rentOf(b: Building): number {
    const d = this.def(b);
    return Math.round((d.rent ?? 0) * this.rentFactor() * (1 + this.appeal(b) + this.globalBonus('rent')) * this.levelFactor(b));
  }
  revenueOf(b: Building): number {
    const d = this.def(b);
    return Math.round((d.revenue ?? 0) * (1 + this.appeal(b) + this.globalBonus('revenue')) * this.levelFactor(b));
  }
  hasRoadAccess(b: { x: number; y: number; rot: Rot; def: string }): boolean {
    const d = BUILDING.get(b.def)!;
    const { w, h } = footprint(d, b.rot);
    const r = this.roads();
    for (let dx = 0; dx < w; dx++) if (r.has(key(b.x + dx, b.y - 1)) || r.has(key(b.x + dx, b.y + h))) return true;
    for (let dy = 0; dy < h; dy++) if (r.has(key(b.x - 1, b.y + dy)) || r.has(key(b.x + w, b.y + dy))) return true;
    return false;
  }
  private touchesWater(x: number, y: number, w: number, h: number): boolean {
    for (let dx = -1; dx <= w; dx++) for (let dy = -1; dy <= h; dy++) if (isWater(x + dx, y + dy)) return true;
    return false;
  }

  // ------------------------------------------------------------ Energie, XP, Münzen
  regen(): void {
    const now = this.now();
    if (!this.energyOn) {
      this.s.energyAt = now;
      return;
    }
    const max = maxEnergy(this.s.level);
    if (this.s.energy >= max) {
      this.s.energyAt = now;
      return;
    }
    const step = ENERGY_REGEN_S * 1000;
    const gained = Math.floor((now - this.s.energyAt) / step);
    if (gained > 0) {
      this.s.energy = Math.min(max, this.s.energy + gained);
      this.s.energyAt = this.s.energy >= max ? now : this.s.energyAt + gained * step;
    }
  }
  /** Millisekunden bis zum nächsten Energiepunkt (0 = voll oder aus). */
  nextEnergyIn(): number {
    if (!this.energyOn || this.s.energy >= maxEnergy(this.s.level)) return 0;
    return Math.max(0, this.s.energyAt + ENERGY_REGEN_S * 1000 - this.now());
  }
  private needEnergy(n: number): Result {
    if (!this.energyOn || n <= 0) return ok;
    this.regen();
    return this.s.energy >= n ? ok : fail('Keine Energie mehr – sie lädt sich von selbst wieder auf.');
  }
  private spendEnergy(n: number): void {
    if (!this.energyOn || n <= 0) return;
    const wasFull = this.s.energy >= maxEnergy(this.s.level);
    this.s.energy -= n;
    if (wasFull) this.s.energyAt = this.now();
  }
  private earn(coins: number, xp: number, at?: Building): void {
    if (coins) {
      this.s.coins += coins;
      this.stat('earned', coins);
    }
    if (xp) this.addXp(xp);
    if (coins || xp) this.emit({ type: 'reward', coins, xp: xp ? Math.round(xp * (1 + this.globalBonus('xp'))) : 0, uid: at?.uid });
  }
  addXp(xp: number): void {
    if (this.creative) return;
    this.s.xp += Math.round(xp * (1 + this.globalBonus('xp')));
    while (this.s.level < MAX_LEVEL && this.s.xp >= xpToNext(this.s.level)) {
      this.s.xp -= xpToNext(this.s.level);
      this.s.level++;
      if (this.energyOn) this.s.energy = Math.max(this.s.energy, maxEnergy(this.s.level));
      this.s.coins += 50 * this.s.level;
      this.emit({ type: 'levelup', n: this.s.level, coins: 50 * this.s.level });
    }
  }
  private pay(coins: number): Result {
    if (this.creative || coins <= 0) return ok;
    if (this.s.coins < coins) return fail(`Dir fehlen ${coins - this.s.coins} Münzen.`);
    this.s.coins -= coins;
    return ok;
  }
  private stat(k: string, n = 1): void {
    this.s.stats[k] = (this.s.stats[k] ?? 0) + n;
  }
  /** Fügt Waren hinzu, wenn alles ins Lager passt (alles oder nichts). */
  canStore(items: Record<string, number>): boolean {
    let n = 0;
    for (const v of Object.values(items)) n += v;
    return this.storageUsed() + n <= this.storageCap();
  }
  private addItems(items: Record<string, number>): void {
    for (const [k, v] of Object.entries(items)) this.s.inv[k] = (this.s.inv[k] ?? 0) + v;
  }
  private hasItems(items: Record<string, number>): boolean {
    return Object.entries(items).every(([k, v]) => this.item(k) >= v);
  }
  private takeItems(items: Record<string, number>): void {
    for (const [k, v] of Object.entries(items)) {
      const left = this.item(k) - v;
      if (left < 0) throw new Error('Lager würde negativ: ' + k);
      if (left === 0) delete this.s.inv[k];
      else this.s.inv[k] = left;
    }
  }

  // ------------------------------------------------------------ Bauen
  canPlace(defId: string, x: number, y: number, rot: Rot, ignoreUid?: number, moving = false): Result {
    const d = BUILDING.get(defId);
    if (!d) return fail('Unbekanntes Gebäude.');
    const { w, h } = footprint(d, rot);
    const occ = this.occupancy();
    const roads = this.roads();
    for (let dx = 0; dx < w; dx++)
      for (let dy = 0; dy < h; dy++) {
        const tx = x + dx;
        const ty = y + dy;
        if (!this.isUnlocked(tx, ty)) return fail('Dieses Gebiet ist noch nicht erschlossen.');
        if (isWater(tx, ty)) return fail('Auf Wasser kann nicht gebaut werden.');
        const o = occ.get(key(tx, ty));
        if (o !== undefined && o !== ignoreUid) return fail('Der Platz ist belegt.');
        if (roads.has(key(tx, ty))) return fail('Hier liegt eine Straße.');
      }
    if (d.nearWater && !this.touchesWater(x, y, w, h)) return fail('Muss direkt am Wasser stehen.');
    if (d.needsRoad && !this.hasRoadAccess({ x, y, rot, def: defId })) return fail('Braucht eine angrenzende Straße.');
    if (moving) return ok;
    if (d.level > this.s.level && !this.creative) return fail(`Ab Stadtlevel ${d.level}.`);
    if (d.max && this.count(defId) >= d.max) return fail('Davon gibt es schon eines.');
    if (!this.creative && this.s.coins < d.cost) return fail(`Dir fehlen ${d.cost - this.s.coins} Münzen.`);
    if (d.pop && !this.creative && this.plannedPopulation() + d.pop > this.popCap())
      return fail('Einwohnergrenze erreicht – baue Gemeinschaftsgebäude für mehr Platz.');
    if (d.minPop && !this.creative && this.population() < d.minPop) return fail(`Braucht ${d.minPop} Einwohner.`);
    return this.needEnergy(placeEnergy(d));
  }

  place(defId: string, x: number, y: number, rot: Rot = 0): Result & { uid?: number } {
    const r = this.canPlace(defId, x, y, rot);
    if (!r.ok) return r;
    const d = BUILDING.get(defId)!;
    this.pay(d.cost);
    this.spendEnergy(placeEnergy(d));
    const now = this.now();
    const b: Building = { uid: this.s.nextUid++, def: defId, x, y, rot, state: 'building', readyAt: now + this.dur(d.buildTime) };
    if (d.materials && !this.creative) {
      b.state = 'site';
      b.delivered = {};
    }
    this.s.buildings.push(b);
    this.invalidate();
    this.emit({ type: 'placed', uid: b.uid, id: defId });
    this.tickBuilding(b, now);
    return { ok: true, uid: b.uid };
  }

  move(uid: number, x: number, y: number, rot: Rot): Result {
    const b = this.get(uid);
    if (!b) return fail('Gebäude nicht gefunden.');
    const r = this.canPlace(b.def, x, y, rot, uid, true);
    if (!r.ok) return r;
    b.x = x;
    b.y = y;
    b.rot = rot;
    this.invalidate();
    this.emit({ type: 'moved', uid });
    return ok;
  }

  demolishRefund(b: Building): number {
    return Math.floor(this.def(b).cost * 0.5);
  }
  demolish(uid: number): Result {
    const b = this.get(uid);
    if (!b) return fail('Gebäude nicht gefunden.');
    const d = this.def(b);
    if (d.id === 'rathaus') return fail('Das Rathaus bleibt stehen.');
    if (d.popCap && b.state === 'done' && this.plannedPopulation() > this.popCap() - d.popCap)
      return fail('Dann hätten deine Einwohner keinen Platz mehr.');
    if (!this.creative) this.s.coins += this.demolishRefund(b);
    this.s.buildings = this.s.buildings.filter((o) => o.uid !== uid);
    this.invalidate();
    this.emit({ type: 'removed', uid });
    return ok;
  }

  canRoad(x: number, y: number): Result {
    if (!this.isUnlocked(x, y)) return fail('Dieses Gebiet ist noch nicht erschlossen.');
    if (isWater(x, y)) return fail('Auf Wasser kann nicht gebaut werden.');
    if (this.roads().has(key(x, y))) return fail('Hier liegt schon eine Straße.');
    if (this.occupancy().has(key(x, y))) return fail('Der Platz ist belegt.');
    if (!this.creative && this.s.coins < ROAD_COST) return fail('Zu wenig Münzen.');
    return ok;
  }
  placeRoad(x: number, y: number): Result {
    const r = this.canRoad(x, y);
    if (!r.ok) return r;
    this.pay(ROAD_COST);
    this.s.roads.push(key(x, y));
    this.invalidate();
    this.stat('road');
    this.progress({ type: 'road' });
    this.emit({ type: 'road', x, y });
    return ok;
  }
  /** undo = eben gelegte Straße zurücknehmen (volle Erstattung), sonst Abriss mit halber Erstattung. */
  removeRoad(x: number, y: number, undo = false): Result {
    const k = key(x, y);
    if (!this.roads().has(k)) return fail('Hier ist keine Straße.');
    this.s.roads = this.s.roads.filter((r) => r !== k);
    if (!this.creative) this.s.coins += undo ? ROAD_COST : Math.floor(ROAD_COST / 2);
    this.invalidate();
    this.emit({ type: 'roadRemoved', x, y });
    return ok;
  }

  // ------------------------------------------------------------ Baustellen
  materialsMissing(b: Building): Record<string, number> {
    const need = this.def(b).materials ?? {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(need)) {
      const m = v - (b.delivered?.[k] ?? 0);
      if (m > 0) out[k] = m;
    }
    return out;
  }
  deliver(uid: number): Result {
    const b = this.get(uid);
    if (!b || b.state !== 'site') return fail('Hier wird kein Material gebraucht.');
    const missing = this.materialsMissing(b);
    let moved = 0;
    for (const [k, v] of Object.entries(missing)) {
      const n = Math.min(v, this.item(k));
      if (n > 0) {
        this.takeItems({ [k]: n });
        b.delivered![k] = (b.delivered![k] ?? 0) + n;
        moved += n;
      }
    }
    if (!moved) return fail('Dir fehlt das Material. Bestelle es per Zug/Schiff oder kauf es beim Baustoffhändler.');
    if (!Object.keys(this.materialsMissing(b)).length) {
      b.state = 'building';
      b.readyAt = this.now() + this.dur(this.def(b).buildTime);
    }
    this.emit({ type: 'delivered', uid, n: moved });
    return ok;
  }
  buyMaterial(id: string, n: number): Result {
    const price = MARKET[id];
    if (!price || n <= 0) return fail('Nicht im Angebot.');
    if (!this.canStore({ [id]: n })) return fail('Das Lager ist voll.');
    const r = this.pay(price * n);
    if (!r.ok) return r;
    this.addItems({ [id]: n });
    this.emit({ type: 'bought', id, n });
    return ok;
  }

  private tickBuilding(b: Building, now: number): void {
    if (b.state === 'building' && now >= b.readyAt) {
      b.state = 'done';
      const d = this.def(b);
      if (d.cat === 'residential') b.t = now + this.dur(d.rentTime ?? 300);
      this.stat('built');
      if (d.cat === 'decoration') this.stat('deco');
      this.emit({ type: 'finished', uid: b.uid, id: d.id, n: d.pop });
      this.earn(0, d.xp, b);
      this.progress({ type: 'build', id: d.id });
      this.progress({ type: 'buildCat', id: d.cat });
    }
  }

  // ------------------------------------------------------------ Aktionen an Gebäuden
  /** Status für Symbole und Info-Fenster. */
  status(b: Building): { kind: string; at?: number } {
    const d = this.def(b);
    if (b.state === 'site') return { kind: 'materials' };
    if (b.state === 'building') return { kind: 'building', at: b.readyAt };
    const now = this.now();
    if (d.needsRoad && !this.hasRoadAccess(b)) return { kind: 'noroad' };
    switch (d.cat) {
      case 'residential':
        return now >= (b.t ?? 0) ? { kind: 'rent' } : { kind: 'wait', at: b.t };
      case 'business':
        if (b.job !== 'sale') return { kind: 'supply' };
        return now >= (b.t ?? 0) ? { kind: 'cash' } : { kind: 'selling', at: b.t };
      case 'farm':
        if (!b.job) return { kind: 'plant' };
        return now >= (b.t ?? 0) ? { kind: 'harvest' } : { kind: 'growing', at: b.t };
      case 'production':
      case 'transport':
        if (!b.job) return { kind: 'idle' };
        return now >= (b.t ?? 0) ? { kind: 'ready' } : { kind: 'working', at: b.t };
      default:
        return { kind: 'none' };
    }
  }

  /** Haupt-Antippen-Aktion: Miete, Kasse, Ernte, Abholen. */
  collect(uid: number): Result {
    const b = this.get(uid);
    if (!b) return fail('Gebäude nicht gefunden.');
    const st = this.status(b);
    switch (st.kind) {
      case 'rent':
        return this.collectRent(b);
      case 'cash':
        return this.collectShop(b);
      case 'harvest':
        return this.harvest(b);
      case 'ready':
        return this.def(b).cat === 'production' ? this.collectProduction(b) : this.collectOrder(b);
      case 'supply':
        return this.supply(uid);
      case 'noroad':
        return fail('Keine Straße angeschlossen.');
      default:
        return fail('Noch nicht bereit.');
    }
  }

  private collectRent(b: Building): Result {
    const e = this.needEnergy(1);
    if (!e.ok) return e;
    const d = this.def(b);
    this.spendEnergy(1);
    b.t = this.now() + this.dur(d.rentTime ?? 300);
    this.stat('collectRent');
    this.earn(this.rentOf(b), Math.max(1, Math.round((d.rent ?? 0) / 25)), b);
    this.progress({ type: 'collectRent', id: d.id });
    return ok;
  }

  supplyChoice(b: Building): string | undefined {
    const d = this.def(b);
    const need = d.stockPer ?? 1;
    const opts = (d.accepts ?? []).filter((i) => this.item(i) > 0);
    const total = opts.reduce((a, i) => a + this.item(i), 0);
    return total >= need ? opts.sort((a, c) => this.item(c) - this.item(a))[0] : undefined;
  }
  supply(uid: number): Result {
    const b = this.get(uid);
    if (!b) return fail('Gebäude nicht gefunden.');
    const d = this.def(b);
    if (d.cat !== 'business' || b.state !== 'done') return fail('Das ist kein Geschäft.');
    if (b.job === 'sale') return fail('Das Geschäft verkauft gerade.');
    if (!this.hasRoadAccess(b)) return fail('Keine Straße angeschlossen.');
    const need = d.stockPer ?? 1;
    const accepts = d.accepts ?? [];
    const total = accepts.reduce((a, i) => a + this.item(i), 0);
    if (total < need) {
      const names = accepts.map((i) => ITEM.get(i)?.name ?? i).join(', ');
      return fail(`Braucht ${need} Waren: ${names}.`);
    }
    const e = this.needEnergy(1);
    if (!e.ok) return e;
    this.spendEnergy(1);
    let left = need;
    for (const i of [...accepts].sort((a, c) => this.item(c) - this.item(a))) {
      const n = Math.min(left, this.item(i));
      if (n > 0) this.takeItems({ [i]: n });
      left -= n;
      if (!left) break;
    }
    b.job = 'sale';
    b.t = this.now() + this.dur(d.saleTime ?? 300);
    this.stat('supply');
    this.emit({ type: 'supplied', uid, n: need });
    this.progress({ type: 'supply', id: d.id });
    return ok;
  }
  private collectShop(b: Building): Result {
    const e = this.needEnergy(1);
    if (!e.ok) return e;
    this.spendEnergy(1);
    const d = this.def(b);
    b.job = undefined;
    b.t = undefined;
    this.stat('collectShop');
    this.earn(this.revenueOf(b), Math.max(2, Math.round((d.revenue ?? 0) / 30)), b);
    this.progress({ type: 'collectShop', id: d.id });
    return ok;
  }

  plant(uid: number, cropId: string): Result {
    const b = this.get(uid);
    const c = CROP.get(cropId);
    if (!b || !c) return fail('Unbekannt.');
    const d = this.def(b);
    if (d.cat !== 'farm' || b.state !== 'done') return fail('Das ist kein Acker.');
    if (b.job) return fail('Hier wächst schon etwas.');
    if (c.level > this.s.level && !this.creative) return fail(`${c.name} gibt es ab Level ${c.level}.`);
    const e = this.needEnergy(1);
    if (!e.ok) return e;
    const p = this.pay(c.seed);
    if (!p.ok) return p;
    this.spendEnergy(1);
    b.job = c.id;
    b.t = this.now() + this.dur(c.time * (d.growFactor ?? 1));
    this.stat('plant');
    this.emit({ type: 'planted', uid, id: c.id });
    this.progress({ type: 'plant', id: c.id });
    return ok;
  }
  private harvest(b: Building): Result {
    const c = CROP.get(b.job ?? '');
    if (!c) return fail('Nichts zu ernten.');
    if (!this.canStore({ [c.id]: c.yield })) return fail('Das Lager ist voll – baue eine Scheune oder verbrauche Waren.');
    const e = this.needEnergy(1);
    if (!e.ok) return e;
    this.spendEnergy(1);
    b.job = undefined;
    b.t = undefined;
    this.addItems({ [c.id]: c.yield });
    this.stat('harvest', c.yield);
    this.emit({ type: 'harvested', uid: b.uid, id: c.id, n: c.yield });
    this.earn(0, c.xp, b);
    this.progress({ type: 'harvest', id: c.id, n: c.yield });
    return ok;
  }

  startProduction(uid: number, recipeId: string): Result {
    const b = this.get(uid);
    const r = RECIPE.get(recipeId);
    if (!b || !r) return fail('Unbekannt.');
    const d = this.def(b);
    if (b.state !== 'done' || !d.recipes?.includes(recipeId)) return fail('Dieses Rezept gibt es hier nicht.');
    if (b.job) return fail('Hier läuft schon etwas.');
    if (!this.hasItems(r.inputs)) return fail('Dir fehlen Zutaten.');
    this.takeItems(r.inputs);
    b.job = r.id;
    b.t = this.now() + this.dur(r.time);
    this.emit({ type: 'started', uid, id: r.id });
    return ok;
  }
  private collectProduction(b: Building): Result {
    const r = RECIPE.get(b.job ?? '');
    if (!r) return fail('Nichts fertig.');
    if (!this.canStore({ [r.output]: r.amount })) return fail('Das Lager ist voll.');
    b.job = undefined;
    b.t = undefined;
    this.addItems({ [r.output]: r.amount });
    this.stat('produce', r.amount);
    this.emit({ type: 'produced', uid: b.uid, id: r.output, n: r.amount });
    this.earn(0, r.xp, b);
    this.progress({ type: 'produce', id: r.output, n: r.amount });
    return ok;
  }

  startOrder(uid: number, orderId: string): Result {
    const b = this.get(uid);
    const o = ORDER.get(orderId);
    if (!b || !o) return fail('Unbekannt.');
    const d = this.def(b);
    if (b.state !== 'done' || d.station !== o.station) return fail('Dieser Auftrag passt nicht zu dieser Station.');
    if (b.job) return fail('Es ist schon eine Lieferung unterwegs.');
    if (o.level > this.s.level && !this.creative) return fail(`Ab Level ${o.level}.`);
    if (o.give && !this.hasItems(o.give)) return fail('Dir fehlen Waren für diesen Auftrag.');
    const p = this.pay(o.cost);
    if (!p.ok) return p;
    if (o.give) this.takeItems(o.give);
    b.job = o.id;
    b.t = this.now() + this.dur(o.time);
    this.emit({ type: 'orderStarted', uid, id: o.station });
    return ok;
  }
  private collectOrder(b: Building): Result {
    const o = ORDER.get(b.job ?? '');
    if (!o) return fail('Keine Lieferung.');
    if (o.get && !this.canStore(o.get)) return fail('Das Lager ist voll.');
    b.job = undefined;
    b.t = undefined;
    if (o.get) this.addItems(o.get);
    this.stat('order');
    this.emit({ type: 'delivery', uid: b.uid, id: o.station });
    this.earn(o.coins ?? 0, o.xp, b);
    this.progress({ type: 'order', id: o.station });
    return ok;
  }

  upgradeCost(b: Building): number {
    return Math.round(this.def(b).cost * 0.75 * (b.lvl ?? 1));
  }
  upgrade(uid: number): Result {
    const b = this.get(uid);
    if (!b) return fail('Gebäude nicht gefunden.');
    const d = this.def(b);
    if (!['residential', 'business'].includes(d.cat) || b.state !== 'done') return fail('Kann nicht ausgebaut werden.');
    if ((b.lvl ?? 1) >= 3) return fail('Höchste Ausbaustufe erreicht.');
    const p = this.pay(this.upgradeCost(b));
    if (!p.ok) return p;
    b.lvl = (b.lvl ?? 1) + 1;
    this.stat('upgrade');
    this.emit({ type: 'upgraded', uid, n: b.lvl });
    this.earn(0, Math.round(d.xp / 2) + 5, b);
    this.progress({ type: 'upgrade', id: d.id });
    return ok;
  }

  // ------------------------------------------------------------ Erweiterung
  canExpand(sx: number, sy: number): Result {
    if (sx < 0 || sy < 0 || sx >= SECTORS || sy >= SECTORS) return fail('Außerhalb der Karte.');
    if (this.s.sectors.includes(key(sx, sy))) return fail('Schon erschlossen.');
    const adj = [key(sx - 1, sy), key(sx + 1, sy), key(sx, sy - 1), key(sx, sy + 1)].some((k) => this.s.sectors.includes(k));
    if (!adj) return fail('Nur angrenzende Gebiete können erschlossen werden.');
    const c = sectorCost(this.s.sectors.length);
    if (!this.creative && this.population() < c.pop) return fail(`Braucht ${c.pop} Einwohner.`);
    if (!this.creative && this.s.coins < c.coins) return fail(`Kostet ${c.coins} Münzen.`);
    return ok;
  }
  expand(sx: number, sy: number): Result {
    const r = this.canExpand(sx, sy);
    if (!r.ok) return r;
    this.pay(sectorCost(this.s.sectors.length).coins);
    this.s.sectors.push(key(sx, sy));
    this.stat('expand');
    this.emit({ type: 'expanded', x: sx, y: sy });
    this.earn(0, 25 * this.s.sectors.length, undefined);
    this.progress({ type: 'expand' });
    return ok;
  }

  // ------------------------------------------------------------ Quests, Aufgaben, Erfolge
  questVisible(q: QuestDef): boolean {
    if (this.s.quests[q.id]?.claimed) return false;
    if ((q.level ?? 0) > this.s.level) return false;
    return (q.after ?? []).every((a) => this.s.quests[a]?.claimed);
  }
  activeQuests(): QuestDef[] {
    return QUESTS.filter((q) => this.questVisible(q));
  }
  goalValue(q: QuestDef, i: number): { have: number; need: number } {
    const g = q.goals[i] as GoalSpec;
    const p = this.s.quests[q.id];
    if ('ev' in g) return { have: Math.min(g.n, p?.c[i] ?? 0), need: g.n };
    if ('own' in g) return { have: Math.min(g.n, this.s.buildings.filter((b) => b.def === g.own && b.state === 'done').length), need: g.n };
    if ('ownCat' in g) return { have: Math.min(g.n, this.countCat(g.ownCat)), need: g.n };
    if ('pop' in g) return { have: Math.min(g.pop, this.population()), need: g.pop };
    if ('level' in g) return { have: Math.min(g.level, this.s.level), need: g.level };
    return { have: Math.min(g.sectors, this.s.sectors.length), need: g.sectors };
  }
  questDone(q: QuestDef): boolean {
    return q.goals.every((_, i) => {
      const v = this.goalValue(q, i);
      return v.have >= v.need;
    });
  }
  /** Legt Fortschritt für neu sichtbare Quests an und markiert erfüllte. */
  refreshQuests(): void {
    if (this.creative) return;
    for (const q of QUESTS) {
      if (!this.questVisible(q)) continue;
      const p = (this.s.quests[q.id] ??= { c: q.goals.map(() => 0) });
      if (!p.done && this.questDone(q)) {
        p.done = true;
        this.emit({ type: 'questDone', id: q.id });
      }
    }
  }
  private progress(e: { type: string; id?: string; n?: number }): void {
    if (this.creative) return;
    for (const q of QUESTS) {
      const p = this.s.quests[q.id];
      if (!p || p.done || p.claimed || !this.questVisible(q)) continue;
      q.goals.forEach((g, i) => {
        if ('ev' in g && g.ev === e.type && (!g.id || g.id === e.id)) p.c[i] = Math.min(g.n, (p.c[i] ?? 0) + (e.n ?? 1));
      });
    }
    for (const ts of [this.s.daily, this.s.weekly]) {
      if (!ts) continue;
      for (const t of ts.tasks) {
        const tpl = TASK_TEMPLATES.find((x) => x.id === t.tpl);
        if (tpl && tpl.ev === e.type && (!tpl.id2 || tpl.id2 === e.id)) t.c = Math.min(t.n, t.c + (e.n ?? 1));
      }
    }
    this.refreshQuests();
    this.checkAchievements();
  }
  claimQuest(id: string): Result {
    const q = QUEST.get(id);
    const p = this.s.quests[id];
    if (!q || !p) return fail('Unbekannte Aufgabe.');
    if (p.claimed) return fail('Belohnung bereits abgeholt.');
    if (!this.questDone(q)) return fail('Noch nicht erfüllt.');
    if (q.reward.items && !this.canStore(q.reward.items)) return fail('Das Lager ist voll.');
    p.done = true;
    p.claimed = true;
    if (q.reward.items) this.addItems(q.reward.items);
    if (q.reward.energy && this.energyOn) this.s.energy += q.reward.energy;
    this.earn(q.reward.coins ?? 0, q.reward.xp ?? 0);
    this.emit({ type: 'questClaimed', id });
    if (id === 'm08' && this.s.tutorial === 'on') this.s.tutorial = 'done';
    this.refreshQuests();
    return ok;
  }

  ensureTasks(): void {
    if (this.creative) return;
    const now = this.now();
    const make = (k: string, weekly: boolean, count: number): TaskState => {
      const rnd = seeded(k + this.s.createdAt);
      const pool = TASK_TEMPLATES.filter((t) => !!t.weekly === weekly);
      const tasks: TaskState['tasks'] = [];
      while (tasks.length < count && pool.length) {
        const tpl = pool.splice(Math.floor(rnd() * pool.length), 1)[0]!;
        tasks.push({ tpl: tpl.id, n: Math.round(tpl.base + tpl.per * this.s.level), c: 0 });
      }
      return { key: k, tasks };
    };
    const dk = dayKey(now);
    if (this.s.daily?.key !== dk) this.s.daily = make(dk, false, 3);
    const wk = weekKey(now);
    if (this.s.weekly?.key !== wk) this.s.weekly = make(wk, true, 2);
  }
  claimTask(weekly: boolean, i: number): Result {
    const ts = weekly ? this.s.weekly : this.s.daily;
    const t = ts?.tasks[i];
    const tpl = t && TASK_TEMPLATES.find((x) => x.id === t.tpl);
    if (!t || !tpl) return fail('Unbekannte Aufgabe.');
    if (t.claimed) return fail('Belohnung bereits abgeholt.');
    if (t.c < t.n) return fail('Noch nicht erfüllt.');
    t.claimed = true;
    this.earn(tpl.coins + 10 * this.s.level, tpl.xp);
    return ok;
  }
  private checkAchievements(): void {
    for (const a of ACHIEVEMENTS) {
      if (this.s.achievements.includes(a.id) || (this.s.stats[a.stat] ?? 0) < a.n) continue;
      this.s.achievements.push(a.id);
      this.emit({ type: 'achievement', id: a.id });
      this.addXp(25);
    }
  }

  /** Simulationsschritt: Bauzeiten, Energie, Aufgaben. Unabhängig vom Rendering. */
  // ------------------------------------------------------------ Nachbarn
  private socialToday(): SocialState {
    const day = utcDay(this.now());
    if (!this.s.social || this.s.social.day !== day) this.s.social = { day, helped: {}, gifted: [] };
    return this.s.social;
  }
  helpsLeft(nid: string): number {
    return Math.max(0, NEIGHBOR_HELPS - (this.socialToday().helped[nid]?.length ?? 0));
  }
  helpedToday(nid: string, uid: number): boolean {
    return this.socialToday().helped[nid]?.includes(uid) ?? false;
  }
  /** Beim Besuch einem Gebäude des Nachbarn helfen: kleine feste Belohnung für den Besucher. */
  helpNeighbor(nid: string, uid: number): Result {
    if (this.creative) return fail('Im Kreativ-Modus gibt es keine Nachbarn.');
    const st = this.socialToday();
    const list = (st.helped[nid] ??= []);
    if (list.includes(uid)) return fail('Hier hast du heute schon geholfen.');
    if (list.length >= NEIGHBOR_HELPS) return fail(`Heute hast du hier schon ${NEIGHBOR_HELPS}× geholfen. Morgen wieder!`);
    list.push(uid);
    this.earn(HELP_REWARD.coins, HELP_REWARD.xp);
    this.stat('helped');
    return ok;
  }
  canGift(nid: string): boolean {
    return !this.creative && !this.socialToday().gifted.includes(nid);
  }
  markGifted(nid: string): void {
    const st = this.socialToday();
    if (!st.gifted.includes(nid)) st.gifted.push(nid);
    this.stat('gifts');
  }
  /** Ein Nachbar hat geholfen (n Gebäude, höchstens NEIGHBOR_HELPS). */
  receiveVisit(n: number): Result {
    if (this.creative) return fail('Im Kreativ-Modus gibt es keine Nachbarn.');
    const k = Math.max(1, Math.min(NEIGHBOR_HELPS, Math.floor(n)));
    this.earn(VISIT_REWARD_PER_HELP.coins * k, VISIT_REWARD_PER_HELP.xp * k);
    return ok;
  }
  canReceiveGift(item: string): Result {
    if (this.creative) return fail('Im Kreativ-Modus gibt es keine Nachbarn.');
    if (!(GIFT_ITEMS as readonly string[]).includes(item)) return fail('Unbekanntes Geschenk.');
    if (!this.canStore({ [item]: GIFT_AMOUNT })) return fail('Dein Lager ist voll. Mach erst Platz.');
    return ok;
  }
  receiveGift(item: string): Result {
    const r = this.canReceiveGift(item);
    if (!r.ok) return r;
    this.addItems({ [item]: GIFT_AMOUNT });
    this.emit({ type: 'gift', id: item, n: GIFT_AMOUNT });
    return ok;
  }

  update(): void {
    const now = this.now();
    this.regen();
    for (const b of this.s.buildings) this.tickBuilding(b, now);
    this.ensureTasks();
    this.refreshQuests();
  }

  // ------------------------------------------------------------ Kreativmodus / Werkzeuge
  setMode(m: Mode): void {
    if (m === 'creative' || this.s.mode === 'creative') return; // Kreativ-Städte sind getrennt
    this.s.mode = m;
    this.regen();
  }
}

