/** Spielstand und reine Spielregeln (ohne Darstellung) – vollständig testbar */
import type { Gender, Look, Need, NpcDef, Pref, Spot, TimeSlot } from './types';
import { ARTIFACTS, DIG_LOOT, DIVE_LOOT, MUSEUM_REWARDS, RENOVATIONS, item } from './data';
import { NPCS } from './npcs';
import { rng } from '../world/noise';

export interface Rel { pts: number; lvl: number; romance: boolean | null; talkDay: number; giftDay: number; dateDay: number; open: boolean; met: boolean; known: string[] }
export interface PlayerCfg { name: string; gender: Gender; pref: Pref; look: Look }
export interface DungeonSave { crates: string[]; open: string[]; chests: string[]; levers: number[] }
export interface Settings { quality: number; music: number; sfx: number; sens: number; invert: boolean; textSpeed: number }
export interface Save {
  v: 1;
  player: PlayerCfg;
  day: number;
  time: number; // Minuten seit Mitternacht (kann über 24:00 hinaus bis 26:00 laufen)
  money: number;
  inv: Record<string, number>;
  flags: Record<string, number>;
  rel: Record<string, Rel>;
  pos: { x: number; z: number; ry: number };
  museum: string[];
  renov: number;
  picked: string[];
  dungeons: Record<string, DungeonSave>;
  gallery: string[];
  ending: string;
  stats: { dug: number; dived: number; earned: number; scenes: number };
  settings: Settings;
}

export const THRESH = [0, 10, 25, 45, 70];
/** Treffpunkte für Verabredungen (an der Lagune am Ufer statt im Wasser) */
const DATE_SPOT: Record<string, { dx: number; dz: number }> = { lagoon: { dx: 16, dz: 18 }, bar: { dx: 3, dz: 5 } };
export const START_MONEY = 150;
export const DAY_START = 7 * 60;
export const DAY_END = 26 * 60; // 2 Uhr nachts: Erschöpfung

export function newRel(): Rel {
  return { pts: 0, lvl: 0, romance: null, talkDay: -1, giftDay: -1, dateDay: -1, open: false, met: false, known: [] };
}
export function defaultSettings(): Settings {
  return { quality: 1, music: 0.6, sfx: 0.8, sens: 1, invert: false, textSpeed: 1 };
}
export function newSave(player: PlayerCfg): Save {
  const rel: Record<string, Rel> = {};
  for (const n of NPCS) rel[n.id] = newRel();
  return {
    v: 1, player, day: 1, time: 9 * 60, money: START_MONEY, inv: { shovel: 1 }, flags: {}, rel,
    pos: { x: 30, z: 214, ry: Math.PI }, museum: [], renov: 0, picked: [], dungeons: {}, gallery: [], ending: '',
    stats: { dug: 0, dived: 0, earned: 0, scenes: 0 }, settings: defaultSettings(),
  };
}

/** Alte oder beschädigte Stände reparieren */
export function normalize(s: Save): Save {
  for (const n of NPCS) s.rel[n.id] = { ...newRel(), ...(s.rel[n.id] || {}) };
  s.settings = { ...defaultSettings(), ...(s.settings || {}) };
  s.inv ||= {};
  s.flags ||= {};
  s.museum ||= [];
  s.picked ||= [];
  s.dungeons ||= {};
  s.gallery ||= [];
  s.stats = Object.assign({ dug: 0, dived: 0, earned: 0, scenes: 0 }, s.stats || {});
  return s;
}

// ---------- Zeit ----------
export function slotOf(time: number): TimeSlot {
  const h = (time / 60) % 24;
  if (h >= 6 && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'day';
  if (h >= 17 && h < 22) return 'evening';
  return 'night';
}
export const clock = (time: number) => {
  const m = Math.floor(time) % (24 * 60);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};
export const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

/** Neuer Tag (Schlafen oder Erschöpfung) */
export function sleep(s: Save, wake = DAY_START): void {
  s.day++;
  s.time = wake;
  s.picked = [];
}

// ---------- Inventar ----------
export const has = (s: Save, id: string, n = 1) => (s.inv[id] || 0) >= n;
export function addItem(s: Save, id: string, n = 1): void {
  s.inv[id] = (s.inv[id] || 0) + n;
  if (item(id).kind === 'quest' || item(id).kind === 'tool') s.inv[id] = Math.min(1, s.inv[id]);
  if (id.startsWith('amulet_') || id === 'journal' || id === 'house_key') s.flags[id] = 1;
}
export function takeItem(s: Save, id: string, n = 1): boolean {
  if (!has(s, id, n)) return false;
  s.inv[id] -= n;
  if (s.inv[id] <= 0) delete s.inv[id];
  return true;
}
export function buy(s: Save, id: string): boolean {
  const it = item(id);
  if (!it.price || s.money < it.price) return false;
  if (it.kind === 'tool' && has(s, id)) return false;
  s.money -= it.price;
  addItem(s, id);
  s.flags.bought = 1;
  return true;
}
export function sell(s: Save, id: string): number {
  const it = item(id);
  if (!it.value || it.kind === 'quest' || it.kind === 'tool' || !takeItem(s, id)) return 0;
  s.money += it.value;
  s.stats.earned += it.value;
  return it.value;
}

// ---------- Museum und Haus ----------
export function donate(s: Save, id: string): { ok: boolean; reward?: (typeof MUSEUM_REWARDS)[number] } {
  if (!ARTIFACTS.includes(id) || s.museum.includes(id) || !takeItem(s, id)) return { ok: false };
  s.museum.push(id);
  const lea = s.rel.lea;
  lea.pts += 3;
  const reward = MUSEUM_REWARDS.find((r) => r.n === s.museum.length);
  if (reward) s.money += reward.money;
  return { ok: true, reward };
}
export function renovate(s: Save): boolean {
  const next = RENOVATIONS[s.renov];
  if (!next || s.money < next.cost || !s.flags.journal) return false;
  s.money -= next.cost;
  s.renov++;
  s.flags['renov' + s.renov] = 1;
  return true;
}

// ---------- Beziehungen ----------
/** Romanze möglich? Beide Seiten müssen zueinander passen. */
export function compatible(n: NpcDef, p: PlayerCfg): boolean {
  return n.likes.includes(p.gender) && (p.pref === 'all' || p.pref === n.gender);
}
export const romantic = (s: Save, n: NpcDef) => s.rel[n.id].romance === true && compatible(n, s.player);

export function needMet(s: Save, need: Need): boolean {
  switch (need.t) {
    case 'talk':
    case 'date':
      return true;
    case 'item':
      return has(s, need.id, need.n || 1);
    case 'flag':
      return !!s.flags[need.id];
    case 'museum':
      return s.museum.length >= need.n;
  }
}
/** Nächster Schritt einer Figur (oder null, wenn alle Herzen voll sind) */
export const nextStep = (s: Save, n: NpcDef) => (s.rel[n.id].lvl < 5 ? n.steps[s.rel[n.id].lvl] : null);
/** Genug Zuneigung für den nächsten Schritt? */
export const stepUnlocked = (s: Save, n: NpcDef) => s.rel[n.id].lvl < 5 && s.rel[n.id].pts >= THRESH[s.rel[n.id].lvl];
export function stepReady(s: Save, n: NpcDef): boolean {
  const st = nextStep(s, n);
  return !!st && stepUnlocked(s, n) && needMet(s, st.need);
}
/** Szene, die ein Schritt auslöst (Herzstufe nach Abschluss 3, 4, 5) */
export function sceneOf(s: Save, n: NpcDef, lvlAfter: number): string | null {
  const love = romantic(s, n);
  if (lvlAfter === 3) return n.id + (love ? '_date' : '_hang');
  if (lvlAfter === 4) return n.id + (love ? '_kiss' : '_hug');
  if (lvlAfter === 5) return n.id + (love ? '_night' : '_best');
  return null;
}
export function completeStep(s: Save, n: NpcDef): { text: string; scene: string | null; reward?: { item?: string; money?: number } } | null {
  if (!stepReady(s, n)) return null;
  const r = s.rel[n.id],
    st = n.steps[r.lvl];
  if (st.need.t === 'item') takeItem(s, st.need.id, st.need.n || 1);
  if (st.reward?.money) s.money += st.reward.money;
  if (st.reward?.item) addItem(s, st.reward.item);
  const love = romantic(s, n);
  r.lvl++;
  r.pts += 8;
  r.dateDay = -1;
  if (n.id === 'lea' && r.lvl === 1) s.flags.leaMap = 1;
  const scene = sceneOf(s, n, r.lvl);
  if (scene && !s.gallery.includes(scene)) {
    s.gallery.push(scene);
    s.stats.scenes++;
  }
  return { text: love && st.love ? st.love : st.done, scene, reward: st.reward };
}
export function talkDaily(s: Save, n: NpcDef): boolean {
  const r = s.rel[n.id];
  r.met = true;
  if (r.talkDay === s.day) return false;
  r.talkDay = s.day;
  r.pts += 4;
  return true;
}
export type GiftReaction = 'love' | 'like' | 'neutral' | 'dislike' | 'already';
export function giveGift(s: Save, n: NpcDef, id: string): GiftReaction {
  const r = s.rel[n.id];
  if (r.giftDay === s.day) return 'already';
  if (!takeItem(s, id)) return 'already';
  r.giftDay = s.day;
  r.met = true;
  const kind: GiftReaction = n.loves.includes(id) ? 'love' : n.likesItems.includes(id) ? 'like' : n.dislikes.includes(id) ? 'dislike' : 'neutral';
  r.pts = Math.max(0, r.pts + { love: 15, like: 8, neutral: 3, dislike: -6, already: 0 }[kind]);
  if (kind !== 'neutral' && !r.known.includes(id)) r.known.push(id);
  return kind;
}
export function setRomance(s: Save, n: NpcDef, on: boolean): boolean {
  if (on && !compatible(n, s.player)) return false;
  s.rel[n.id].romance = on;
  return true;
}
export const lovers = (s: Save) => NPCS.filter((n) => romantic(s, n) && s.rel[n.id].lvl >= 5);

/** Wo steht eine Figur gerade? (Verabredung hat Vorrang) */
export function npcSpot(s: Save, n: NpcDef): Spot | null {
  const r = s.rel[n.id],
    st = nextStep(s, n),
    h = s.time / 60;
  if (st && st.need.t === 'date' && r.dateDay === s.day && h >= st.need.from && h < st.need.to) return { poi: st.need.poi, ...(DATE_SPOT[st.need.poi] || { dx: 3, dz: 3 }) };
  return n.schedule[slotOf(s.time)];
}
/** Verabredung ausmachen: heute, wenn noch Zeit ist, sonst morgen */
export function arrangeDate(s: Save, n: NpcDef): { day: number; from: number; to: number; poi: string } | null {
  const st = nextStep(s, n);
  if (!st || st.need.t !== 'date' || !stepUnlocked(s, n)) return null;
  const h = s.time / 60;
  s.rel[n.id].dateDay = h < st.need.to - 1 ? s.day : s.day + 1;
  return { day: s.rel[n.id].dateDay, from: st.need.from, to: st.need.to, poi: st.need.poi };
}
export function dateNow(s: Save, n: NpcDef): boolean {
  const st = nextStep(s, n),
    h = s.time / 60;
  return !!st && st.need.t === 'date' && s.rel[n.id].dateDay === s.day && h >= st.need.from && h < st.need.to;
}

// ---------- Beute ----------
export function roll(table: [string, number][], r: () => number): string {
  const sum = table.reduce((a, t) => a + t[1], 0);
  let x = r() * sum;
  for (const [id, w] of table) if ((x -= w) < 0) return id;
  return table[table.length - 1][0];
}
export const digLoot = (seed: number) => roll(DIG_LOOT, rng(seed));
export const diveLoot = (seed: number) => roll(DIVE_LOOT, rng(seed));

/** Welche Graben-/Tauchstellen heute aktiv sind (deterministisch je Tag) */
export function dailyPick(day: number, total: number, count: number, salt: number): number[] {
  const r = rng(day * 7919 + salt),
    idx = [...Array(total).keys()];
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, count);
}

// ---------- Hauptgeschichte ----------
export const pieces = (s: Save) => ['amulet_sun', 'amulet_moon', 'amulet_star'].filter((a) => s.flags[a]).length;

/** Enden: 'single' | 'couple:<id>' | 'open' */
export function endingOptions(s: Save): { single: boolean; couples: string[]; open: boolean } {
  const l = lovers(s);
  return { single: true, couples: l.map((n) => n.id), open: l.length >= 2 && l.every((n) => s.rel[n.id].open) };
}
