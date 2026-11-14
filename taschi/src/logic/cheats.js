// Cheats: every entry can be switched on and off again. Switches ('toggle')
// only set a flag in save.cheats.on that the game reads. Gifts ('gift') change
// the save and keep an undo record in save.cheats.undo, so switching them off
// takes back exactly what they added and nothing the player earned meanwhile.
// Pure logic, no DOM.
import { SPECIES, SPECIES_IDS, movesAtLevel } from '../data/species.js';
import { ITEMS, ITEM_ORDER } from '../data/items.js';
import { makeMonster, maxHp, maxPP, MAX_LEVEL } from './monster.js';

export const CHEAT_LEVEL = 50, ITEM_COUNT = 99, CHEAT_COINS = 999999;

export const CHEATS = [
  { id: 'allmons', kind: 'gift', group: 'Sammeln', icon: '📚', name: 'Alle Taschis freischalten', desc: 'Taschibuch komplett, jedes fehlende Taschi kommt mit Lv ' + CHEAT_LEVEL + ' ins Lager.' },
  { id: 'maxevo', kind: 'gift', group: 'Sammeln', icon: '🧬', name: 'Maximale Entwicklung', desc: 'Dein Team erreicht die Endstufe und Lv ' + MAX_LEVEL + '.' },
  { id: 'items', kind: 'gift', group: 'Sammeln', icon: '🎒', name: 'Alle Items', desc: 'Jedes Item ×' + ITEM_COUNT + ' und ' + CHEAT_COINS.toLocaleString('de-DE') + ' Sternmünzen.' },
  { id: 'god', kind: 'toggle', group: 'Kampf', icon: '🛡', name: 'Unbesiegbar', desc: 'Deine Taschis nehmen keinen Schaden.' },
  { id: 'ohko', kind: 'toggle', group: 'Kampf', icon: '💥', name: 'Ein-Treffer-K.O.', desc: 'Jeder Treffer besiegt den Gegner sofort.' },
  { id: 'pp', kind: 'toggle', group: 'Kampf', icon: '♾', name: 'Unendlich AP', desc: 'Attacken verbrauchen keine AP.' },
  { id: 'catch', kind: 'toggle', group: 'Kampf', icon: '🎯', name: 'Fang-Garantie', desc: 'Jede Kapsel fängt beim ersten Wurf.' },
  { id: 'xp', kind: 'toggle', group: 'Kampf', icon: '📈', name: 'EP ×10', desc: 'Zehnfache Erfahrung nach jedem Sieg.' },
  { id: 'shiny', kind: 'toggle', group: 'Welt', icon: '✨', name: 'Immer schillernd', desc: 'Jedes wilde Taschi ist schillernd.' },
  { id: 'noenc', kind: 'toggle', group: 'Welt', icon: '🚫', name: 'Keine wilden Begegnungen', desc: 'Ruhig durchs hohe Gras laufen.' },
  { id: 'turbo', kind: 'toggle', group: 'Welt', icon: '⚡', name: 'Turbo-Lauf', desc: 'Doppelt so schnell laufen, reiten und surfen.' },
  { id: 'ghost', kind: 'toggle', group: 'Welt', icon: '👻', name: 'Geistmodus', desc: 'Draußen durch Bäume, Felsen und Mauern laufen.' },
  { id: 'fly', kind: 'toggle', group: 'Welt', icon: '🕊', name: 'Fliegen ohne Siegel', desc: 'Jedes Taschi im Team trägt dich zu besuchten Orten.' },
  { id: 'free', kind: 'toggle', group: 'Welt', icon: '🛒', name: 'Gratis einkaufen', desc: 'Alles im Laden kostet 0 Sternmünzen, jedes Sortiment offen.' },
  { id: 'freeze', kind: 'toggle', group: 'Welt', icon: '⏸', name: 'Zeit anhalten', desc: 'Die Tageszeit bleibt stehen.' },
  { id: 'giant', kind: 'toggle', group: 'Effekte', icon: '🗿', name: 'Riesenmodus', desc: 'Deine Figur wird riesig.', off: ['mini'] },
  { id: 'mini', kind: 'toggle', group: 'Effekte', icon: '🐜', name: 'Winzling', desc: 'Deine Figur wird winzig klein.', off: ['giant'] },
  { id: 'disco', kind: 'toggle', group: 'Effekte', icon: '🌈', name: 'Regenbogen-Welt', desc: 'Die ganze Welt schimmert in allen Farben.' },
  { id: 'aura', kind: 'toggle', group: 'Effekte', icon: '🔥', name: 'Sternen-Aura', desc: 'Ein Leuchtring folgt deiner Figur.' }
];
export const CHEAT = Object.fromEntries(CHEATS.map(c => [c.id, c]));

export function ensure(s) {
  const c = s.cheats && typeof s.cheats === 'object' ? s.cheats : {};
  c.on = c.on && typeof c.on === 'object' ? c.on : {};
  c.undo = c.undo && typeof c.undo === 'object' ? c.undo : {};
  for (const k of Object.keys(c.on)) if (!CHEAT[k] || !c.on[k]) delete c.on[k];
  s.cheats = c;
  return c;
}
export const isOn = (s, id) => !!s?.cheats?.on?.[id];
export const anyOn = (s) => !!s?.cheats && Object.keys(s.cheats.on || {}).length > 0;

// Flags the battle logic reads (null if nothing is active)
export function battleFlags(s) {
  const f = {};
  for (const k of ['god', 'ohko', 'pp', 'catch', 'xp']) if (isOn(s, k)) f[k] = true;
  return Object.keys(f).length ? f : null;
}

export function set(s, id, on, rng = null) {
  const c = ensure(s), def = CHEAT[id];
  if (!def || !!c.on[id] === !!on) return { changed: false };
  if (on) {
    for (const o of def.off || []) set(s, o, false, rng);
    if (def.kind === 'gift') c.undo[id] = GIFTS[id].apply(s, rng);
    c.on[id] = true;
  } else {
    if (def.kind === 'gift') { GIFTS[id].revert(s, c.undo[id] || {}); delete c.undo[id]; }
    delete c.on[id];
  }
  return { changed: true, on: !!on };
}
export const toggle = (s, id, rng) => set(s, id, !isOn(s, id), rng);
export function allOff(s) { ensure(s); for (const id of Object.keys(s.cheats.on).reverse()) set(s, id, false); }

// ---------------------------------------------------------------- gifts
const allMons = (s) => [...s.team, ...s.box, ...(s.daycare?.mons || [])];
function finalForm(id) { const seen = new Set([id]); let cur = id; while (SPECIES[cur]?.evo?.to && !seen.has(SPECIES[cur].evo.to)) { cur = SPECIES[cur].evo.to; seen.add(cur); } return cur; }

const GIFTS = {
  allmons: {
    apply(s, rng) {
      const owned = new Set(allMons(s).map(m => m.id));
      const dex = {}, uids = [];
      for (const id of SPECIES_IDS) {
        if (s.dex[id] !== 2) { dex[id] = s.dex[id] ?? 0; s.dex[id] = 2; }
        if (!owned.has(id)) { const m = makeMonster(id, CHEAT_LEVEL, rng); s.box.push(m); uids.push(m.uid); }
      }
      return { dex, uids };
    },
    revert(s, u) {
      const gone = new Set(u.uids || []);
      s.team = s.team.filter(m => !gone.has(m.uid));
      s.box = s.box.filter(m => !gone.has(m.uid));
      if (s.daycare?.mons) s.daycare.mons = s.daycare.mons.filter(m => !gone.has(m.uid));
      if (!s.team.length && s.box.length) s.team.push(s.box.shift());
      if (gone.has(s.companion)) delete s.companion;
      const kept = new Set(allMons(s).map(m => m.id));
      for (const [id, prev] of Object.entries(u.dex || {})) {
        if (kept.has(id)) s.dex[id] = 2; else if (prev) s.dex[id] = prev; else delete s.dex[id];
      }
    }
  },
  maxevo: {
    apply(s) {
      const before = {}, dex = {};
      for (const m of s.team) {
        before[m.uid] = { id: m.id, lv: m.lv, xp: m.xp, hp: m.hp, status: m.status || null, moves: m.moves.map(x => ({ ...x })) };
        const to = finalForm(m.id);
        m.id = to; m.lv = MAX_LEVEL; m.xp = 0;
        const fresh = movesAtLevel(to, MAX_LEVEL).filter(id => !m.moves.some(x => x.id === id));
        while (m.moves.length < 4 && fresh.length) { const id = fresh.shift(); m.moves.push({ id, pp: maxPP(id) }); }
        m.hp = maxHp(m); m.status = null;
        if (s.dex[to] !== 2 && !(to in dex)) dex[to] = s.dex[to] ?? 0;
        s.dex[to] = 2;
      }
      return { before, dex };
    },
    revert(s, u) {
      for (const m of allMons(s)) {
        const b = u.before?.[m.uid];
        if (!b) continue;
        m.id = b.id; m.lv = b.lv; m.xp = b.xp; m.moves = b.moves;
        m.hp = Math.min(maxHp(m), m.hp > 0 ? Math.max(1, b.hp) : 0);
        if (b.status) m.status = b.status;
      }
      const kept = new Set(allMons(s).map(m => m.id));
      for (const [id, prev] of Object.entries(u.dex || {})) { if (kept.has(id)) continue; if (prev) s.dex[id] = prev; else delete s.dex[id]; }
    }
  },
  items: {
    apply(s) {
      const added = {};
      for (const id of ITEM_ORDER) {
        if (ITEMS[id].category === 'key') continue;
        const have = s.bag[id] || 0;
        if (have < ITEM_COUNT) { added[id] = ITEM_COUNT - have; s.bag[id] = ITEM_COUNT; }
      }
      s.coins = (s.coins || 0) + CHEAT_COINS;
      return { added, coins: CHEAT_COINS };
    },
    revert(s, u) {
      for (const [id, n] of Object.entries(u.added || {})) { const left = (s.bag[id] || 0) - n; if (left > 0) s.bag[id] = left; else delete s.bag[id]; }
      s.coins = Math.max(0, (s.coins || 0) - (u.coins || 0));
    }
  }
};
