// Spielzustand und Simulationsschleife von RicoLife 3D (ohne Darstellung, testbar in Node).
import { Bus } from '../core/bus';
import { Clock, SPEEDS } from '../core/clock';
import { Rng } from '../core/rng';
import { clamp, uid } from '../core/util';
import { MOODLETS, ITEMS } from '../data/moodlets';
import type { EmotionId, NeedId, SkillId, WeatherId } from '../data/types';
import { NEED_IDS } from '../data/types';
import { SKILLS, skillLevel, traitById } from '../data/traits';
import { LOTS, lotById } from '../data/lots';
import { World, type ObjInst, cellKey } from '../world/world';
import { getDef } from '../world/defs';
import type { Action, Household, Pet, Rel, Settings, Sim } from './types';
import { DEFAULT_SETTINGS } from './types';

export interface WeatherState {
  now: WeatherId;
  until: number;
  temp: number;
  wind: number;
}

export interface StoryState {
  id: string;
  quest: string;
  base: Record<string, number>;
  done: string[];
  finished: boolean;
}

export type Role = 'solo' | 'host' | 'guest';

const MOOD_MAP = new Map(MOODLETS.map((m) => [m.id, m]));
export const moodDef = (id: string) => MOOD_MAP.get(id);
export const itemDef = (id: string) => ITEMS.find((i) => i.id === id);

let actionUid = 1;
export const nextActionUid = (): number => actionUid++;

export class Game {
  bus = new Bus();
  rng = new Rng(Date.now() & 0xffff);
  clock = new Clock();
  world = new World();
  sims = new Map<string, Sim>();
  pets = new Map<string, Pet>();
  hhs = new Map<string, Household>();
  rels = new Map<string, Rel>();
  settings: Settings = { ...DEFAULT_SETTINGS, keys: {} };
  weather: WeatherState = { now: 'sunny', until: 0, temp: 16, wind: 0.2 };
  story: StoryState | null = null;
  activeHh: string | null = null;
  activeSim: string | null = null;
  flags: Record<string, number> = {};
  evCool: Record<string, number> = {};
  nextEventAt = 0;
  /** Reservierungen: "objId:slot" → Sim-ID */
  reserved = new Map<string, string>();
  role: Role = 'solo';
  /** Kamerafokus (bestimmt, welche Stadtbewohner sichtbar simuliert werden) */
  focus = { x: 80, z: 50 };
  /** Spielstand-Platz und Name */
  slot = 1;
  saveName = 'Neues Leben';
  created = Date.now();
  /** Laufzeit-Systeme hängen sich hier ein (vermeidet Zirkelimporte) */
  systems: { name: string; tick?: (g: Game, dt: number) => void; hourly?: (g: Game) => void; daily?: (g: Game) => void; minute?: (g: Game) => void }[] = [];
  /** Ereignis zur Anzeige (UI holt es ab) */
  pendingEvent: { id: string; npc: string | null } | null = null;
  /** Geschichte: anzuzeigender Dialog (Einleitung, Abschluss, Verzweigung) */
  pendingStory: { kind: 'intro' | 'outro' | 'branch' | 'finale'; quest: string } | null = null;
  /** Zähler für Ziele (Interaktionen, Käufe, Bauen …) */
  stats: Record<string, number> = {};
  private lastHour = -1;
  private lastDay = -1;
  private minuteAcc = 0;

  // ---------- Zeit ----------
  tick(dtReal: number): void {
    const dt = Math.min(dtReal, 0.25) * SPEEDS[this.clock.speed]!;
    if (dt <= 0) {
      for (const s of this.systems) if (s.name === 'visual') s.tick?.(this, 0);
      return;
    }
    this.step(dt);
  }

  /** Simulationsschritt um dt Spielminuten (in Tests direkt aufrufbar) */
  step(dt: number): void {
    if (this.role === 'guest') {
      for (const s of this.systems) if (s.name === 'visual' || s.name === 'guest') s.tick?.(this, dt);
      return;
    }
    // große Schritte in Teilschritte zerlegen (Zeitraffer)
    while (dt > 0) {
      const d = Math.min(dt, 2);
      dt -= d;
      if (!this.settings.fixedTime) this.clock.min += d;
      for (const s of this.systems) s.tick?.(this, d);
      this.minuteAcc += d;
      if (this.minuteAcc >= 1) {
        this.minuteAcc -= Math.floor(this.minuteAcc);
        for (const s of this.systems) s.minute?.(this);
      }
      const h = Math.floor(this.clock.min / 60);
      if (h !== this.lastHour) {
        const first = this.lastHour < 0;
        this.lastHour = h;
        if (!first) for (const s of this.systems) s.hourly?.(this);
      }
      const day = this.clock.day;
      if (day !== this.lastDay) {
        const first = this.lastDay < 0;
        this.lastDay = day;
        if (!first) for (const s of this.systems) s.daily?.(this);
      }
    }
  }
  resetTimeMarks(): void {
    this.lastHour = Math.floor(this.clock.min / 60);
    this.lastDay = this.clock.day;
  }

  // ---------- Abfragen ----------
  sim(id: string | null | undefined): Sim | undefined {
    return id ? this.sims.get(id) : undefined;
  }
  get active(): Sim | undefined {
    return this.sim(this.activeSim);
  }
  get hh(): Household | undefined {
    return this.activeHh ? this.hhs.get(this.activeHh) : undefined;
  }
  members(hhId: string | null = this.activeHh): Sim[] {
    const h = hhId ? this.hhs.get(hhId) : undefined;
    return h ? h.members.map((m) => this.sims.get(m)).filter((s): s is Sim => !!s) : [];
  }
  name(s: Sim | string | undefined): string {
    const x = typeof s === 'string' ? this.sims.get(s) : s;
    return x ? x.first : 'Jemand';
  }
  fullName(s: Sim): string {
    return `${s.first} ${s.last}`;
  }
  isAdult(s: Sim): boolean {
    return s.age === 'youngadult' || s.age === 'adult' || s.age === 'senior';
  }
  isControllable(s: Sim): boolean {
    return !!s.hh && s.hh === this.activeHh && !s.guest;
  }
  skillLv(s: Sim, k: SkillId): number {
    return skillLevel(s.skills[k] ?? 0);
  }
  hasTrait(s: Sim, t: string): boolean {
    return s.traits.includes(t as never);
  }
  /** Lot, auf dem die Figur gerade ist */
  lotOf(s: Sim): string {
    return this.world.lotAt(s.x, s.z)?.id ?? '';
  }
  objsWith(lot: string | null, func: string): ObjInst[] {
    const out: ObjInst[] = [];
    for (const o of this.world.objs.values()) {
      if (lot !== null && o.lot !== lot) continue;
      if (getDef(o.def).func?.includes(func as never)) out.push(o);
    }
    return out;
  }
  /** Reservierung eines Platzes */
  reserve(o: ObjInst, slot: number, simId: string): boolean {
    const k = `${o.id}:${slot}`;
    const cur = this.reserved.get(k);
    if (cur && cur !== simId && this.sims.get(cur)?.queue.some((a) => a.obj === o.id && a.slot === slot)) return false;
    this.reserved.set(k, simId);
    return true;
  }
  isReserved(o: ObjInst, slot: number, simId: string): boolean {
    const cur = this.reserved.get(`${o.id}:${slot}`);
    if (!cur || cur === simId) return false;
    const s = this.sims.get(cur);
    return !!s && s.queue.some((a) => a.obj === o.id && a.slot === slot && (a.phase === 'route' || a.phase === 'perform'));
  }
  release(simId: string, objId?: string): void {
    for (const [k, v] of this.reserved) if (v === simId && (!objId || k.startsWith(objId + ':'))) this.reserved.delete(k);
  }

  // ---------- Veränderungen ----------
  addNeed(s: Sim, n: NeedId, v: number): void {
    s.needs[n] = clamp(s.needs[n] + v, 0, 100);
  }
  addMood(s: Sim, id: string, opts: { hours?: number; power?: number; src?: string } = {}): void {
    const def = moodDef(id);
    if (!def) return;
    const until = this.clock.min + (opts.hours ?? def.hours) * 60;
    const ex = s.moods.find((m) => m.id === id);
    if (ex) {
      ex.until = Math.max(ex.until, until);
      if (opts.power) ex.power = opts.power;
      if (opts.src) ex.src = opts.src;
    } else s.moods.push({ id, until, power: opts.power, src: opts.src });
    if (s.moods.length > 14) s.moods.sort((a, b) => b.until - a.until).length = 14;
  }
  removeMood(s: Sim, id: string): void {
    s.moods = s.moods.filter((m) => m.id !== id);
  }
  addSkill(s: Sim, k: SkillId, xp: number): void {
    const t = s.traits.reduce((f, id) => f * (traitById(id).skills?.[k] ?? 1), 1);
    const emoBoost =
      (s.emo === 'focused' && (k === 'logic' || k === 'programming' || k === 'writing')) ||
      (s.emo === 'inspired' && (k === 'painting' || k === 'music' || k === 'writing' || k === 'photography')) ||
      (s.emo === 'confident' && (k === 'charisma' || k === 'fitness')) ||
      (s.emo === 'playful' && (k === 'music' || k === 'charisma'))
        ? 1.5
        : s.emo === 'tense' || s.emo === 'sad' || s.emo === 'tired'
          ? 0.7
          : 1;
    const youth = s.age === 'child' || s.age === 'teen' ? 1.25 : 1;
    const before = skillLevel(s.skills[k] ?? 0);
    s.skills[k] = (s.skills[k] ?? 0) + xp * t * emoBoost * youth;
    const after = skillLevel(s.skills[k]!);
    if (after > before) {
      this.addMood(s, 'skillup');
      const un = SKILLS[k].unlocks[after];
      this.notify(`${s.first}: ${SKILLS[k].name} Stufe ${after}${un ? ' – freigeschaltet: ' + un : ''}`, SKILLS[k].icon, s.id, 'good');
      this.memory(s, `${SKILLS[k].name} auf Stufe ${after} gebracht`, SKILLS[k].icon, after >= 5);
      this.bus.emit('skill', { sim: s.id, skill: k, level: after });
    }
  }
  /** Buchung aufs Haushaltskonto. key verhindert Doppelbuchungen (z. B. Lohn einer Schicht). */
  money(hhId: string | null, amount: number, label: string, key?: string): boolean {
    const h = hhId ? this.hhs.get(hhId) : undefined;
    if (!h) return false;
    if (key && h.booked.includes(key)) return false;
    if (amount < 0 && h.funds + amount < 0 && !this.settings.creative) return false;
    if (key) {
      h.booked.push(key);
      if (h.booked.length > 200) h.booked.splice(0, h.booked.length - 200);
    }
    if (!(this.settings.creative && amount < 0 && label.startsWith('Bau'))) h.funds = Math.round(h.funds + amount);
    h.ledger.unshift({ id: key ?? uid('t'), m: Math.floor(this.clock.min), a: Math.round(amount), t: label });
    if (h.ledger.length > 60) h.ledger.length = 60;
    this.bus.emit('money', { hh: h.id, amount, label });
    return true;
  }
  canAfford(hhId: string | null, amount: number): boolean {
    if (this.settings.creative) return true;
    const h = hhId ? this.hhs.get(hhId) : undefined;
    return !!h && h.funds >= amount;
  }
  memory(s: Sim, text: string, icon = '📝', big = false): void {
    s.mem.unshift({ d: this.clock.day, t: text, i: icon, big: big || undefined });
    if (s.mem.length > 80) s.mem.length = 80;
  }
  bubble(s: Sim, icon: string, minutes = 4): void {
    s.rt.bubble = { icon, until: this.clock.min + minutes };
  }
  notify(text: string, icon = 'ℹ️', sim?: string, kind: 'info' | 'good' | 'bad' | 'warn' = 'info'): void {
    this.bus.emit('notify', { text, icon, sim, kind });
  }
  giveItem(s: Sim, id: string, n = 1): void {
    s.inv[id] = (s.inv[id] ?? 0) + n;
    if (s.inv[id]! <= 0) delete s.inv[id];
  }

  // ---------- Beziehungen ----------
  relKey(a: string, b: string): string {
    return a < b ? `${a}|${b}` : `${b}|${a}`;
  }
  rel(a: string, b: string): Rel {
    const k = this.relKey(a, b);
    let r = this.rels.get(k);
    if (!r) this.rels.set(k, (r = { f: 0, r: 0, t: 30, met: false, h: [], last: 0 }));
    return r;
  }
  peekRel(a: string, b: string): Rel | undefined {
    return this.rels.get(this.relKey(a, b));
  }
  relHistory(a: string, b: string, text: string): void {
    const r = this.rel(a, b);
    r.h.unshift(`Tag ${this.clock.day + 1}: ${text}`);
    if (r.h.length > 8) r.h.length = 8;
  }
  partnerOf(s: Sim): Sim | undefined {
    for (const [k, r] of this.rels) {
      if (!r.k || r.k === 'ex') continue;
      const [a, b] = k.split('|');
      if (a === s.id) return this.sims.get(b!);
      if (b === s.id) return this.sims.get(a!);
    }
    return undefined;
  }
  isFamily(a: Sim, b: Sim): boolean {
    if (a.parents.includes(b.id) || b.parents.includes(a.id)) return true;
    if (a.parents.some((p) => b.parents.includes(p))) return true;
    // Großeltern
    const ga = a.parents.flatMap((p) => this.sims.get(p)?.parents ?? []);
    const gb = b.parents.flatMap((p) => this.sims.get(p)?.parents ?? []);
    return ga.includes(b.id) || gb.includes(a.id) || !!a.flags[`fam:${b.id}`] || !!b.flags[`fam:${a.id}`];
  }
  friends(s: Sim, min = 40): Sim[] {
    const out: Sim[] = [];
    for (const [k, r] of this.rels) {
      if (r.f < min) continue;
      const [a, b] = k.split('|');
      const o = a === s.id ? b : b === s.id ? a : null;
      const os = o ? this.sims.get(o) : undefined;
      if (os) out.push(os);
    }
    return out;
  }
  known(s: Sim): Sim[] {
    const out: Sim[] = [];
    for (const [k, r] of this.rels) {
      if (!r.met) continue;
      const [a, b] = k.split('|');
      const o = a === s.id ? b : b === s.id ? a : null;
      const os = o ? this.sims.get(o) : undefined;
      if (os) out.push(os);
    }
    return out;
  }

  // ---------- Objekte ----------
  spawnProp(defId: string, lot: string, l: number, near: { x: number; z: number }, st: ObjInst['st'] = {}): ObjInst | null {
    // freie Fläche (Tisch/Theke) nahe der Position, sonst Boden
    const def = getDef(defId);
    let best: { x: number; z: number; d: number } | null = null;
    for (let dz = -3; dz <= 3; dz++)
      for (let dx = -3; dx <= 3; dx++) {
        const x = Math.floor(near.x) + dx,
          z = Math.floor(near.z) + dz;
        const k = cellKey(l, x, z);
        if (def.mount === 'surface') {
          const base = this.world.occ.get(k);
          if (!base || this.world.surf.has(k)) continue;
          const bd = getDef(this.world.objs.get(base)!.def);
          if (!bd.func?.some((f) => f === 'table' || f === 'counter' || f === 'desk')) continue;
        } else if (!this.world.cellWalkable(l, x, z)) continue;
        const d = Math.hypot(x + 0.5 - near.x, z + 0.5 - near.z);
        if (!best || d < best.d) best = { x, z, d };
      }
    if (!best) return null;
    const o: ObjInst = { id: this.world.newId(), def: defId, x: best.x, z: best.z, l, r: 0, lot, st };
    this.world.addObj(o);
    this.world.touch(lot);
    return o;
  }
  removeObject(id: string): void {
    const o = this.world.objs.get(id);
    if (!o) return;
    this.world.removeObj(id);
    for (const [k] of this.reserved) if (k.startsWith(id + ':')) this.reserved.delete(k);
    this.world.touch(o.lot);
  }

  // ---------- Stimmung ----------
  mood(s: Sim): number {
    // -100..100 aus Bedürfnissen und Moodlets
    let v = 0;
    for (const n of NEED_IDS) v += (s.needs[n] - 50) / 5;
    for (const m of s.moods) {
      const d = moodDef(m.id);
      if (!d) continue;
      const p = m.power ?? d.power;
      v += d.emo === 'sad' || d.emo === 'tense' || d.emo === 'angry' || d.emo === 'embarrassed' || d.emo === 'tired' ? -p * 4 : p * 4;
    }
    return clamp(v, -100, 100);
  }
  dominantEmotion(s: Sim): [EmotionId, number] {
    const sum = new Map<EmotionId, number>();
    for (const m of s.moods) {
      const d = moodDef(m.id);
      if (!d) continue;
      sum.set(d.emo, (sum.get(d.emo) ?? 0) + (m.power ?? d.power));
    }
    for (const t of s.traits) {
      const e = traitById(t).emo;
      if (e) sum.set(e, (sum.get(e) ?? 0) + 0.8);
    }
    let best: EmotionId = 'fine',
      bp = 1.5;
    for (const [e, p] of sum)
      if (p > bp) {
        best = e;
        bp = p;
      }
    if (best === 'fine' && this.mood(s) > 45) best = 'happy';
    return [best, best === 'fine' ? 0 : bp];
  }

  // ---------- Aktionen ----------
  queueAction(s: Sim, def: string, opts: Partial<Action> = {}): Action | null {
    if (s.queue.length >= 8 && opts.user) {
      this.notify(`${s.first} hat schon viel vor – erst etwas abbrechen.`, '⏳', s.id, 'warn');
      return null;
    }
    const a: Action = { uid: nextActionUid(), def, phase: 'queued', t: 0, dur: 0, user: !!opts.user, ...opts } as Action;
    if (opts.user) {
      // Spielerbefehl ersetzt autonome Handlungen
      const cur = s.queue[0];
      if (cur && !cur.user && cur.phase !== 'done') {
        cur.phase = 'done';
        cur.data = { ...(cur.data ?? {}), cancelled: 1 };
      }
    }
    s.queue.push(a);
    return a;
  }
  cancelAction(s: Sim, uidN: number): void {
    const a = s.queue.find((x) => x.uid === uidN);
    if (!a) return;
    a.data = { ...(a.data ?? {}), cancelled: 1 };
    if (a.phase === 'queued') s.queue = s.queue.filter((x) => x !== a);
    else a.phase = 'done';
  }

  lotName(id: string): string {
    return lotById(id)?.name ?? (id.startsWith('apt-') ? 'Wohnung' : id || 'unterwegs');
  }
  homeLotOf(s: Sim): string | null {
    if (s.hh) return this.hhs.get(s.hh)?.lot ?? null;
    return LOTS.some((l) => l.id === s.home) ? s.home : null;
  }
}
