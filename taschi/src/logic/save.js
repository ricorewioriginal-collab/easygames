// Save format v2, validation, migration from v1 and corruption fallback.
//
// Storage keys all start with the prefix that cloud/anmacha-cloud.js already
// synchronises for TASCHI, so Google cloud sync keeps working unchanged:
//   <P>.v2.slot<n>          current save (JSON, with checksum)
//   <P>.v2.slot<n>.backup   last known good save (rotated on milestones)
//   <P>.slot<n> / <P>       untouched version-1 saves (read-only migration source)
import { SPECIES } from '../data/species.js';
import { MOVES } from '../data/moves.js';
import { ITEMS } from '../data/items.js';
import { REGIONS } from '../data/regions.js';
import { TRAINERS } from '../data/trainers.js';
import { hashString } from '../core/rng.js';
import { maxHp, maxPP, xpToNext, MAX_LEVEL, newUid } from './monster.js';
import { movesAtLevel } from '../data/species.js';

export const PREFIX = 'easygames.taschi.eight-lights.v1';
export const SAVE_VERSION = 2;
export const SLOTS = [1, 2, 3];
export const keys = {
  v2: (n) => PREFIX + '.v2.slot' + n,
  backup: (n) => PREFIX + '.v2.slot' + n + '.backup',
  legacy: (n) => PREFIX + '.slot' + n,
  legacyRoot: PREFIX,
  selected: PREFIX + '.selected'
};

export function newSave(player = {}) {
  return {
    format: 'taschi-save', version: SAVE_VERSION, created: new Date().toISOString(), updated: null, playTime: 0,
    player: { name: player.name || 'Rio', preset: player.preset || 'rio', look: { ...(player.look || {}) } },
    team: [], box: [], bag: { taschiball: 5, trank: 3 }, coins: 300, badges: 0, champions: {}, dex: {},
    location: { map: 'region:0', x: 0, z: 34, ry: Math.PI }, lastHeal: { map: 'region:0', x: 0, z: 34 },
    visited: { 0: true }, flags: {}, quests: {}, trainers: {}, puzzles: {}, chests: {}, found: {}, guild: {}, league: 0,
    legends: {}, story: { chapter: 0 }, stats: { wins: 0, caught: 0, battles: 0, losses: 0, steps: 0 }, worldTime: 9 * 60,
    legacy: null
  };
}

// --------------------------------------------------------------------------
// Validation – repairs what can be repaired, rejects what is unusable.
// --------------------------------------------------------------------------
function cleanMonster(m) {
  if (!m || !SPECIES[m.id]) return null;
  const out = {
    uid: typeof m.uid === 'string' && m.uid ? m.uid : newUid(),
    id: m.id,
    lv: clampInt(m.lv, 1, MAX_LEVEL, 5),
    xp: 0, hp: 1,
    iv: { hp: clampInt(m.iv?.hp, 0, 15, 8), atk: clampInt(m.iv?.atk, 0, 15, 8), def: clampInt(m.iv?.def, 0, 15, 8), speed: clampInt(m.iv?.speed, 0, 15, 8) },
    moves: [], status: ['brand', 'gift', 'schlaf', 'paralyse', 'frost'].includes(m.status) ? m.status : null,
    friendship: clampInt(m.friendship, 0, 255, 70)
  };
  if (typeof m.nick === 'string' && m.nick.trim()) out.nick = m.nick.trim().slice(0, 14);
  if (m.caughtIn !== undefined) out.caughtIn = m.caughtIn;
  if (m.ball && ITEMS[m.ball]) out.ball = m.ball;
  out.xp = clampInt(m.xp, 0, xpToNext(out.lv) - 1, 0);
  const moves = Array.isArray(m.moves) ? m.moves.filter(x => x && MOVES[x.id]).slice(0, 4) : [];
  out.moves = (moves.length ? moves : movesAtLevel(out.id, out.lv).map(id => ({ id, pp: maxPP(id) })))
    .map(x => ({ id: x.id, pp: clampInt(x.pp, 0, maxPP(x.id), maxPP(x.id)) }));
  out.hp = clampInt(m.hp, 0, maxHp(out), maxHp(out));
  if (out.statusTurns) out.statusTurns = 0;
  return out;
}
function clampInt(v, lo, hi, dflt) { v = Number(v); if (!Number.isFinite(v)) return dflt; return Math.max(lo, Math.min(hi, Math.round(v))); }
const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};

export function validate(s) {
  if (!s || typeof s !== 'object' || s.format !== 'taschi-save' || s.version !== SAVE_VERSION) return null;
  const base = newSave(s.player);
  const out = { ...base, ...s };
  out.player = { name: String(s.player?.name || 'Rio').slice(0, 14), preset: String(s.player?.preset || 'rio'), look: obj(s.player?.look) };
  out.team = (Array.isArray(s.team) ? s.team : []).map(cleanMonster).filter(Boolean).slice(0, 6);
  out.box = (Array.isArray(s.box) ? s.box : []).map(cleanMonster).filter(Boolean).slice(0, 600);
  const seen = new Set();
  for (const m of [...out.team, ...out.box]) { if (seen.has(m.uid)) m.uid = newUid(); seen.add(m.uid); }
  out.bag = {};
  for (const [k, v] of Object.entries(obj(s.bag))) if (ITEMS[k]) { const n = clampInt(v, 0, 999, 0); if (n > 0) out.bag[k] = n; }
  out.coins = clampInt(s.coins, 0, 9999999, 0);
  out.badges = clampInt(s.badges, 0, 16, 0);
  out.league = clampInt(s.league, 0, 5, 0);
  out.dex = {};
  for (const [k, v] of Object.entries(obj(s.dex))) if (SPECIES[k] && (v === 1 || v === 2)) out.dex[k] = v;
  for (const m of [...out.team, ...out.box]) out.dex[m.id] = 2;
  for (const f of ['champions', 'visited', 'flags', 'quests', 'trainers', 'puzzles', 'chests', 'found', 'guild', 'legends', 'stats']) out[f] = obj(s[f]);
  out.story = { chapter: clampInt(s.story?.chapter, 0, 9, 0) };
  const loc = obj(s.location);
  out.location = { map: typeof loc.map === 'string' ? loc.map : 'region:0', x: finite(loc.x, 0), z: finite(loc.z, 34), ry: finite(loc.ry, 0) };
  const lh = obj(s.lastHeal);
  out.lastHeal = { map: typeof lh.map === 'string' ? lh.map : 'region:0', x: finite(lh.x, 0), z: finite(lh.z, 34) };
  out.playTime = clampInt(s.playTime, 0, 1e9, 0);
  out.worldTime = clampInt(s.worldTime, 0, 1439, 540);
  return out;
}
const finite = (v, d) => Number.isFinite(Number(v)) ? Number(v) : d;

// --------------------------------------------------------------------------
// Version 1 → 2 migration
// --------------------------------------------------------------------------
function v1MaxHp(id, lv) { return Math.floor(SPECIES[id].hp * 2 * lv / 100) + lv + 10; }

export function isLegacy(s) { return !!s && typeof s === 'object' && Array.isArray(s.team) && s.version === undefined && s.format === undefined; }

export function migrateV1(old) {
  if (!old || !Array.isArray(old.team)) return null;
  const s = newSave();
  s.legacy = { migratedAt: new Date().toISOString(), from: 1, x: old.x, z: old.z };
  const conv = (m) => {
    if (!m || !SPECIES[m.id] || !Number.isFinite(m.lv)) return null;
    const lv = clampInt(m.lv, 1, MAX_LEVEL, 5);
    const moves = movesAtLevel(m.id, lv);
    // keep the v1 starting moves the player knew, if they fit
    for (const legacyMove of SPECIES[m.id].moves) if (!moves.includes(legacyMove) && moves.length < 4) moves.unshift(legacyMove);
    const out = cleanMonster({
      id: m.id, lv, iv: { hp: 8, atk: 8, def: 8, speed: 8 },
      moves: moves.slice(0, 4).map(id => ({ id, pp: Number.isFinite(m.pp?.[id]) ? Math.round(m.pp[id] / (MOVES[id].power >= 60 ? 12 : 20) * maxPP(id)) : maxPP(id) }))
    });
    const ratio = Math.max(0, Math.min(1, (Number(m.hp) || 0) / v1MaxHp(m.id, lv)));
    out.hp = Math.round(ratio * maxHp(out));
    if (Number(m.hp) > 0 && out.hp === 0) out.hp = 1;
    out.xp = clampInt(m.xp, 0, xpToNext(lv) - 1, 0);
    return out;
  };
  s.team = old.team.map(conv).filter(Boolean).slice(0, 6);
  s.box = (old.box || []).map(conv).filter(Boolean);
  s.bag = {};
  if (old.balls > 0) s.bag.taschiball = clampInt(old.balls, 0, 999, 0);
  if (old.potions > 0) s.bag.trank = clampInt(old.potions, 0, 999, 0);
  s.coins = clampInt(old.coins ?? 120, 0, 9999999, 120);
  s.badges = clampInt(old.badges, 0, 16, 0);
  s.league = clampInt(old.league, 0, 5, 0);
  for (const [k, v] of Object.entries(obj(old.dex))) if (SPECIES[k]) s.dex[k] = v === 2 ? 2 : 1;
  for (const [k, v] of Object.entries(obj(old.champions))) if (v && REGIONS[k]) s.champions[k] = true;
  for (const [k, v] of Object.entries(obj(old.puzzles))) if (v && REGIONS[k]) s.puzzles['region:' + k] = true;
  for (const [k, v] of Object.entries(obj(old.chests))) if (v && REGIONS[k]) s.chests['region:' + k] = true;
  for (const [k, v] of Object.entries(obj(old.trainers))) {
    if (!v) continue;
    const t = Object.values(TRAINERS).find(x => x.legacyId === Number(k));
    if (t) s.trainers[t.id] = true;
  }
  // village quests (keyed by village name in v1)
  for (const [village, done] of Object.entries(obj(old.quests))) {
    if (!done) continue;
    for (const r of REGIONS) for (const q of r.quests || []) if (q.legacyKey === village) s.quests[q.id] = { done: true, step: 99 };
  }
  // guild events: v1 sites at regions 2, 6, 10, 14 → v2 site indices 0, 2, 4, 6
  const guildMap = [0, 2, 4, 6];
  for (const [k, v] of Object.entries(obj(old.guild))) if (v && guildMap[k] !== undefined) s.guild[guildMap[k]] = 'done';
  for (const [k, v] of Object.entries(obj(old.crystals))) if (v) s.found['crystal:' + k] = true;
  for (const k of Object.keys(obj(old.visited))) s.legacy['visited:' + k] = true;
  for (let r = 0; r <= Math.min(15, s.badges); r++) s.visited[r] = true;
  s.stats.wins = clampInt(old.wins, 0, 1e7, 0);
  if (old.metProfessor) s.flags.metUlme = true;
  if (s.team.length) Object.assign(s.flags, { metUlme: true, introDone: true, starterChosen: true, firstBattle: true, firstQuest: true, travelStarted: true });
  if (s.badges >= 16) s.flags.summitDone = true;
  if (s.guild[6] === 'done' || s.badges >= 16) s.bag.brixcode = 1;
  if (s.team.length) s.bag.pfadkarte = 1;
  s.story.chapter = s.badges >= 16 ? 4 : s.badges >= 12 ? 3 : s.badges >= 8 ? 2 : s.badges >= 4 ? 1 : 0;
  // place the player at the heal centre of the furthest unlocked region
  let r = 0;
  for (let i = 0; i < 16; i++) if (i <= s.badges && (i === 0 || s.champions[i - 1])) r = i;
  s.location = { map: 'region:' + r, x: 0, z: 34, ry: Math.PI, spawn: 'heal' };
  s.lastHeal = { map: 'region:' + r, x: 0, z: 34, spawn: 'heal' };
  const starter = s.team.find(m => ['glutzahn', 'plaetscher', 'samenling', 'glutdrach', 'panzerlon', 'bluetling'].includes(m.id));
  if (starter) s.flags.starter = ['glutzahn', 'glutdrach'].includes(starter.id) ? 'glutzahn' : ['plaetscher', 'panzerlon'].includes(starter.id) ? 'plaetscher' : 'samenling';
  return validate(s);
}

// --------------------------------------------------------------------------
// Serialisation with checksum
// --------------------------------------------------------------------------
export function serialize(s) {
  const body = { ...s, updated: new Date().toISOString() };
  delete body.sum;
  const json = JSON.stringify(body);
  return JSON.stringify({ ...body, sum: hashString(json) });
}
export function deserialize(text) {
  if (!text) return { save: null, error: 'empty' };
  let raw;
  try { raw = JSON.parse(text); } catch { return { save: null, error: 'json' }; }
  if (raw && raw.format === 'taschi-save' && raw.version === SAVE_VERSION) {
    if (raw.sum !== undefined) {
      const { sum, ...body } = raw;
      if (hashString(JSON.stringify(body)) !== sum) return { save: null, error: 'checksum' };
    }
    const v = validate(raw);
    return v ? { save: v } : { save: null, error: 'invalid' };
  }
  if (isLegacy(raw)) return { save: migrateV1(raw), migrated: true };
  return { save: null, error: 'format' };
}

export function createStore(storage) {
  const get = (k) => { try { return storage.getItem(k); } catch { return null; } };
  const set = (k, v) => { try { storage.setItem(k, v); return true; } catch { return false; } };
  return {
    load(slot) {
      const warnings = [];
      const main = deserialize(get(keys.v2(slot)));
      if (main.save) return { save: main.save, source: 'v2', warnings };
      if (get(keys.v2(slot)) !== null) warnings.push('Der Spielstand war beschädigt (' + main.error + '). Die letzte Sicherung wurde geladen.');
      const bak = deserialize(get(keys.backup(slot)));
      if (bak.save) return { save: bak.save, source: 'backup', warnings };
      const legacyText = get(keys.legacy(slot)) ?? (slot === 1 ? get(keys.legacyRoot) : null);
      if (legacyText) {
        const leg = deserialize(legacyText);
        if (leg.save) { warnings.push('Dein Spielstand aus Version 1 wurde übernommen.'); return { save: leg.save, source: 'legacy', warnings }; }
      }
      return { save: null, source: 'none', warnings };
    },
    write(slot, save) {
      const text = serialize(save);
      if (!set(keys.v2(slot), text)) return false;
      return true;
    },
    backup(slot, save) { return set(keys.backup(slot), serialize(save)); },
    remove(slot) { try { storage.removeItem(keys.v2(slot)); storage.removeItem(keys.backup(slot)); } catch {} },
    summary(slot) {
      const { save, source } = this.load(slot);
      if (!save) return { slot, empty: true };
      return { slot, source, name: save.player.name, badges: save.badges, team: save.team.map(m => m.id), dex: Object.values(save.dex).filter(v => v === 2).length, playTime: save.playTime, updated: save.updated, region: Number(String(save.location.map).split(':')[1]) || 0, league: save.league };
    },
    selected() { const n = Number(get(keys.selected)); return SLOTS.includes(n) ? n : 1; },
    select(n) { set(keys.selected, String(n)); }
  };
}

export function exportJSON(save) {
  return JSON.stringify({ format: 'taschi-save', version: SAVE_VERSION, exported: new Date().toISOString(), state: save }, null, 2);
}
export function importJSON(text) {
  if (typeof text !== 'string' || text.length > 4e6) throw new Error('Datei zu groß oder leer.');
  let raw;
  try { raw = JSON.parse(text); } catch { throw new Error('Die Datei ist kein gültiges JSON.'); }
  if (raw?.format === 'taschi-save' && raw.version === 1 && raw.state) {
    const m = migrateV1(raw.state);
    if (!m) throw new Error('Version-1-Spielstand konnte nicht gelesen werden.');
    return m;
  }
  if (raw?.format === 'taschi-save' && raw.version === SAVE_VERSION) {
    const s = validate({ ...(raw.state || raw), format: 'taschi-save', version: SAVE_VERSION });
    if (!s) throw new Error('Ungültige Speicherdaten.');
    return s;
  }
  if (isLegacy(raw)) return migrateV1(raw);
  throw new Error('Kein passender Taschi-Spielstand.');
}
