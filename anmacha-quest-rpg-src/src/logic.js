// Spielregeln ohne Anzeige: Werte, Schaden, Karten, Monster-KI. 1:1 aus main.gd der Godot-Fassung übernommen.
// Läuft auch unter Node (Tests in tests/logic.test.js).
import { MAPS, HEROES, ENEMIES, ITEMS } from './data.js';

export const STEP_T = 0.13;          // Sekunden pro Feld (Spieler)
export const ROAM_T = 0.38;          // Sekunden pro Feld (Monster)
export const TOUCH_DIST = 11 / 16;   // Berührungsabstand Monster–Spieler in Feldern
export const STAGE_LV = [3, 8, 13, 18, 23];
export const STAGE_POOL = [
  ['beatbandit', 'reimruepel', 'bassgolem', 'boombox', 'graffiti', 'mikspin'],
  ['gecko', 'schleim', 'aal', 'disco', 'herz', 'zuckerg'],
  ['geist', 'lebkuchen', 'schneemann', 'eisratte', 'eisspin', 'zwerg'],
  ['gargoyle', 'mole', 'verstaerker', 'rifffled', 'daemon', 'roadie'],
  ['schemen', 'stoersignal', 'kreischer', 'antspin', 'rausritter', 'zyklop']];
export const BLOCK = '#T~^hHDSM';
export const DIRS = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
export const MAP_ORDER = ['hub', 'welt', 'rap', 'schlager', 'xmas', 'rock', 'tower'];

// Zufall: Math.random oder (für Tests) ein fester Startwert
export function makeRng(seed) {
  let s = seed >>> 0;
  const next = seed == null ? Math.random : () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    randf: next,
    randi: () => Math.floor(next() * 4294967296),
    range: (a, b) => a + (b - a) * next(),
    shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
  };
}

const int = Math.trunc;
export const key = (v) => v.x + ',' + v.y;
export const eq = (a, b) => a.x === b.x && a.y === b.y;
export const manhattan = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export function newState() {
  return {
    party: [], inv: { trank: 3, aether: 1, weck: 0 }, gold: 50, gear: 0, flags: {},
    mapId: 'hub', map: MAPS.hub, mw: 26, mh: 16, objs: [], reg: [], gp: { x: 12, y: 11 }, face: { x: 0, y: 1 },
    steps: 0, grace: 8, playTime: 0, uidN: 0, roamers: [], enemies: []
  };
}

export const hd = (h) => HEROES[h.id];
export const mhp = (S, h) => int(hd(h).hp + hd(h).hpg * (h.lv - 1)) + S.gear * 8;
export const msp = (h) => int(hd(h).sp + hd(h).spg * (h.lv - 1));
export function stat(S, h, k) {
  let b = hd(h)[k] + hd(h)[k + 'g'] * (h.lv - 1);
  if (k === 'atk' || k === 'def' || k === 'mag') b += S.gear * 3;
  return int(b);
}
export const need = (lv) => int(14.0 * lv + 2.2 * lv * lv);
export function avgLv(S) {
  let s = 0;
  for (const h of S.party) s += h.lv;
  return s / Math.max(1, S.party.length);
}
export function newHero(S, id, lv = 1) {
  const h = { id, name: HEROES[id].name, lv, exp: 0, hp: 1, sp: 1, ip: 0 };
  h.hp = mhp(S, h);
  h.sp = msp(h);
  return h;
}
export const nextUid = (S) => ++S.uidN;
export const gearPrice = (S) => 120 * (S.gear + 1) * (S.gear + 1);

export function makeEnemy(S, id) {
  const d = ENEMIES[id];
  const lv = d.lv;
  const psize = 0.62 + 0.13 * S.party.length;
  const easeF = Math.min(1.0, Math.max(0.6, 0.5 + 0.1 * avgLv(S)));   // sanfter Einstieg: Gegner sind bei niedrigen Stufen schwächer
  const hp = int((18.0 + 14.0 * lv) * 1.4 * d.hpm * psize * easeF);
  const boss = !!d.boss;
  return {
    id, name: d.name, lv, hp, mhp: hp, atk: (6.0 + 2.6 * lv) * d.atkm * easeF, def: (2.0 + 1.5 * lv) * d.defm,
    spd: 5.0 + 0.5 * lv, boss, spec: d.spec || [],
    exp: int((4 + 3 * lv) * (boss ? 5 : 1) * (1.0 + (d.hpm - 1.0) * 0.3)), gold: int((3 + 2 * lv) * (boss ? 6 : 1)), turn: 0, dead: false
  };
}
export const dmgPhys = (rng, atk, def, mult = 1.0) => Math.max(1, int((atk * 1.7 - def * 0.7) * mult * rng.range(0.9, 1.1)));
export const dmgMag = (rng, mag, def, mult = 1.0) => Math.max(1, int((mag * 1.7 - def * 0.35) * mult * rng.range(0.9, 1.1)));
export const aliveHeroes = (S) => S.party.filter(h => h.hp > 0);
export const aliveEnemies = (S) => S.enemies.filter(e => e.hp > 0);
export const hasHero = (S, id) => S.party.some(h => h.id === id);

export function applyItem(S, k, h) {
  if (k === 'weck') {
    if (h.hp > 0) return false;
    h.hp = Math.max(1, int(mhp(S, h) / 2));
    return true;
  }
  if (h.hp <= 0) return false;
  if (k === 'trank') {
    if (h.hp >= mhp(S, h)) return false;
    h.hp = Math.min(mhp(S, h), h.hp + 70);
    return true;
  }
  if (k === 'aether') {
    if (h.sp >= msp(h)) return false;
    h.sp = Math.min(msp(h), h.sp + 20);
    return true;
  }
  return false;
}
export const itemKeys = () => Object.keys(ITEMS);

// ---------------------------------------------------------------- Karten
export function tile(S, x, y) {
  if (x < 0 || y < 0 || x >= S.mw || y >= S.mh) return '#';
  return S.map.rows[y][x];
}
export const blocked = (S, t) => BLOCK.includes(tile(S, t.x, t.y));
export function objAt(S, t) {
  for (const o of S.objs) if (o.x === t.x && o.y === t.y) return o;
  return null;
}
export function isPortal(S, c) {
  return S.map.portals.some(p => p.x === c.x && p.y === c.y);
}
export function bossesDone(S) {
  let n = 0;
  for (const f of ['boss_rap', 'boss_schlager', 'boss_xmas', 'boss_rock']) if (S.flags[f]) n++;
  return n;
}
export const stage = (S) => Math.min(4, Math.max(0, bossesDone(S)));
export const isWorld = (S) => !!S.map.world;
export const portalOpen = (S, p) => p.req === '' || !!S.flags[p.req];

// Regionen der Oberwelt: jedes Feld gehört zum nächsten Eingang
export function regionKey(map, x, y) {
  let best = 9999, k = 'ow_town';
  for (const p of map.portals) {
    const dd = Math.abs(p.x - x) + Math.abs(p.y - y);
    if (dd < best) {
      best = dd;
      const tm = p.to;
      k = 'ow_' + (tm === 'hub' ? 'town' : (tm === 'tower' ? 'static' : tm));
    }
  }
  return k;
}
export function themeKeyAt(S, x, y) {
  if (isWorld(S)) return S.reg[y][x];
  return S.map.theme;
}

export function loadMap(S, rng, id, at) {
  S.mapId = id;
  S.map = MAPS[id];
  const map = S.map;
  S.mh = map.rows.length;
  S.mw = map.rows[0].length;
  S.objs = [];
  for (const n of map.npcs) S.objs.push({ t: 'npc', x: n.x, y: n.y, d: n, uid: nextUid(S) });
  for (const c of map.chests) if (!S.flags[c.id]) S.objs.push({ t: 'chest', x: c.x, y: c.y, d: c, uid: nextUid(S) });
  const b = map.boss;
  if (b && b.id && !S.flags[b.flag]) S.objs.push({ t: 'boss', x: b.x, y: b.y, d: b, uid: nextUid(S) });
  if (map.gate && !S.flags[map.gate.flag]) S.objs.push({ t: 'gate', x: map.gate.x, y: map.gate.y, d: map.gate, uid: nextUid(S) });
  S.reg = [];
  if (map.world) for (let y = 0; y < S.mh; y++) { const row = []; for (let x = 0; x < S.mw; x++) row.push(regionKey(map, x, y)); S.reg.push(row); }
  S.gp = { x: at.x, y: at.y };
  S.ppos = { x: at.x, y: at.y };
  S.moving = false;
  S.grace = 8;
  spawnRoamers(S, rng);
}

// Alle vom Startfeld aus erreichbaren Felder
export function reachable(S, start, blockFn = (n) => blocked(S, n)) {
  const seen = new Map([[key(start), start]]);
  const q = [start];
  while (q.length) {
    const c = q.shift();
    for (const d of DIRS) {
      const n = { x: c.x + d.x, y: c.y + d.y };
      const k = key(n);
      if (!seen.has(k) && !blockFn(n)) { seen.set(k, n); q.push(n); }
    }
  }
  return seen;
}

// Sichtbare Monster, die auf der Karte umherlaufen und bei Berührung einen Kampf starten
export function spawnRoamers(S, rng) {
  S.roamers = [];
  let pool = S.map.enc, count = 6;
  if (isWorld(S)) { pool = STAGE_POOL[stage(S)]; count = 12; }
  if (!pool.length) return;
  const cells = [];
  for (const c of reachable(S, S.gp).values()) {
    if (manhattan(c, S.gp) < 7 || objAt(S, c) || isPortal(S, c)) continue;
    if (S.map.gate && c.x > S.map.gate.x) continue;
    cells.push(c);
  }
  rng.shuffle(cells);
  for (let i = 0; i < Math.min(count, cells.length); i++) {
    const c = cells[i];
    const p = { x: c.x, y: c.y };
    S.roamers.push({ uid: nextUid(S), id: pool[rng.randi() % pool.length], g: { ...c }, pos: { ...p }, from: { ...p }, to: { ...p }, t: 1.0, wait: rng.randf() * 0.8, stun: 0.0 });
  }
}
export function roamerFree(S, n, me) {
  if (blocked(S, n) || objAt(S, n) || isPortal(S, n)) return false;
  if (S.map.gate && n.x > S.map.gate.x && !S.flags[S.map.gate.flag]) return false;
  for (const o of S.roamers) if (o !== me && eq(o.g, n)) return false;
  return true;
}
export function roamerStep(S, rng, r) {
  const target = S.moving ? S.gtarget : S.gp;
  const g = r.g;
  const dist = manhattan(target, g);
  const opts = [];
  for (const d of DIRS) { const n = { x: g.x + d.x, y: g.y + d.y }; if (roamerFree(S, n, r)) opts.push(n); }
  if (!opts.length) return;
  let pick = opts[rng.randi() % opts.length];
  if (dist <= 6 && rng.randf() < 0.85) {
    let best = 9999;
    for (const n of opts) { const dd = manhattan(target, n); if (dd < best) { best = dd; pick = n; } }
  } else if (rng.randf() < 0.5) return;
  r.from = { ...r.pos };
  r.to = { x: pick.x, y: pick.y };
  r.g = pick;
  r.t = 0.0;
}
// Bewegt die Monster; gibt das Monster zurück, das den Spieler berührt (oder null)
export function updateRoamers(S, rng, delta) {
  for (const r of S.roamers) {
    if (r.stun > 0) r.stun -= delta;
    if (r.t < 1.0) {
      r.t = Math.min(1.0, r.t + delta / ROAM_T);
      r.pos = { x: r.from.x + (r.to.x - r.from.x) * r.t, y: r.from.y + (r.to.y - r.from.y) * r.t };
    } else {
      r.wait -= delta;
      if (r.wait <= 0 && r.stun <= 0) { r.wait = rng.range(0.2, 0.6); roamerStep(S, rng, r); }
    }
    if (r.stun <= 0 && !S.moving && Math.hypot(r.pos.x - S.ppos.x, r.pos.y - S.ppos.y) < TOUCH_DIST) return r;
  }
  return null;
}

// Erfahrung nach dem Sieg (mit Aufhol-Bonus, wenn die Gruppe schwächer als das Gebiet ist)
export function victoryExp(S, xp) {
  const areaLv = isWorld(S) ? STAGE_LV[stage(S)] : (S.map.lv ?? avgLv(S));
  const mult = Math.min(3.0, Math.max(0.6, 1.0 + 0.3 * (areaLv - avgLv(S))));
  return int(xp * mult);
}
// Stufenaufstieg; gibt die erreichten Stufen zurück
export function gainExp(S, h, xp) {
  const ups = [];
  h.exp += xp;
  while (h.exp >= need(h.lv) && h.lv < 40) {
    h.exp -= need(h.lv);
    const ohp = mhp(S, h);
    h.lv += 1;
    h.hp += mhp(S, h) - ohp;
    h.sp = Math.min(msp(h), h.sp + 4);
    ups.push(h.lv);
  }
  return ups;
}

// Startfeld je Karte (für Tests und Debug-Sprung)
export const startOf = (id) => id === 'hub' ? { x: 12, y: 12 } : (id === 'welt' ? { x: 20, y: 22 } : { x: 2, y: 14 });
