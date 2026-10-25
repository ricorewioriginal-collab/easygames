// Selbsttest wie `--autotest` der Godot-Fassung: Karten, Erreichbarkeit, Kampfbalance, kompletter Spielablauf ohne Anzeige.
// Start: npm test (oder node tests/logic.test.js)
import { MAPS, ENEMIES, HEROES, SKILLS, IPSKILLS } from '../src/data.js';
import * as L from '../src/logic.js';
import { Game, M, SAVE_KEY } from '../src/game.js';
import { parseGodotSave } from '../src/godotsave.js';

let fails = 0;
const fail = (...a) => { console.log('FEHLER', ...a); fails++; };
const rng = L.makeRng(1234);

// ---- Karten
for (const id in MAPS) {
  const m = MAPS[id];
  const w = m.rows[0].length;
  m.rows.forEach((r, y) => { if (r.length !== w) fail('Breite', id, 'Zeile', y); });
  const S = L.newState();
  S.map = m; S.mw = w; S.mh = m.rows.length;
  const start = L.startOf(id);
  const seen = L.reachable(S, start);
  const near = (t) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has(L.key({ x: t.x + dx, y: t.y + dy })));
  const targets = [];
  for (const p of m.portals) {
    targets.push(p);
    const dest = MAPS[p.to];
    if (!dest) { fail('Ziel fehlt', id, p.to); continue; }
    if (p.ay >= dest.rows.length || L.BLOCK.includes(dest.rows[p.ay][p.ax])) fail('Ankunft blockiert', id, '->', p.to);
  }
  targets.push(...m.chests, ...m.npcs);
  if (m.boss && m.boss.id) targets.push(m.boss);
  for (const t of targets) if (!near(t)) fail('nicht erreichbar', id, t.x, t.y);
  if (m.gate) {
    const g = m.gate;
    const seen2 = L.reachable(S, start, (n) => (n.x === g.x && n.y === g.y) || L.blocked(S, n));
    for (const c of m.chests) if (c.kind === 'key' && ![[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen2.has(L.key({ x: c.x + dx, y: c.y + dy })))) fail('Schlüssel hinter dem Tor', id);
  }
  for (const e of m.enc) if (!ENEMIES[e]) fail('Gegner fehlt', id, e);
  console.log(`Karte ${id} ${w}x${m.rows.length}: ${seen.size} Felder begehbar`);
}
for (const id in HEROES) {
  for (const s of HEROES[id].skills) if (!SKILLS[s]) fail('Fertigkeit fehlt', id, s);
  if (!IPSKILLS[HEROES[id].ip]) fail('IP fehlt', id);
}

// ---- Kampfbalance (gleiche Simulation wie sim_battle in main.gd)
function simBattle(S, ids) {
  S.enemies = ids.map(id => L.makeEnemy(S, id));
  let rounds = 0;
  while (rounds < 80) {
    rounds++;
    const guard = [];
    const order = [];
    for (const h of L.aliveHeroes(S)) order.push({ k: 'h', who: h, s: L.stat(S, h, 'spd') + rng.randf() * 3 });
    for (const e of L.aliveEnemies(S)) order.push({ k: 'e', who: e, s: e.spd + rng.randf() * 3 });
    order.sort((a, b) => b.s - a.s);
    for (const o of order) {
      if (!L.aliveEnemies(S).length || !L.aliveHeroes(S).length) break;
      if (o.k === 'h') {
        const h = o.who;
        if (h.hp <= 0) continue;
        const al = L.aliveEnemies(S);
        let t = al[0];
        for (const e of al) if (e.hp < t.hp) t = e;
        const hurt = L.aliveHeroes(S).filter(x => x.hp < L.mhp(S, x) * 0.5);
        const dead = S.party.filter(x => x.hp <= 0);
        const ipd = IPSKILLS[L.hd(h).ip];
        const P = (a, d, m) => L.dmgPhys(rng, a, d, m), G = (a, d, m) => L.dmgMag(rng, a, d, m);
        if ((S.inv.weck || 0) > 0 && dead.length) { S.inv.weck--; L.applyItem(S, 'weck', dead[0]); }
        else if (h.ip >= ipd.ip && ipd.kind !== 'heal') {
          h.ip -= ipd.ip;
          for (const e of (ipd.all ? al : [t])) e.hp -= ipd.kind === 'phys' ? P(L.stat(S, h, 'atk'), e.def, ipd.mult) : G(L.stat(S, h, 'mag'), e.def, ipd.mult);
        } else if (h.id === 'teresa' && hurt.length && h.sp >= 4) { h.sp -= 4; hurt[0].hp = Math.min(L.mhp(S, hurt[0]), hurt[0].hp + Math.trunc(L.stat(S, h, 'mag') * 3.2 + 12)); }
        else if (hurt.length && (S.inv.trank || 0) > 0 && hurt[0].hp < L.mhp(S, hurt[0]) * 0.35) { S.inv.trank--; L.applyItem(S, 'trank', hurt[0]); }
        else if ((h.id === 'andrew' || h.id === 'rico') && al.length >= 2 && h.sp >= 8) { h.sp -= 8; for (const e of al) e.hp -= P(L.stat(S, h, 'atk'), e.def, h.id === 'andrew' ? 1.15 : 1.05); }
        else if (h.id === 'andrew' && h.sp >= 4) { h.sp -= 4; t.hp -= P(L.stat(S, h, 'atk'), t.def, 1.9); }
        else if (h.id === 'rico' && h.sp >= 5) { h.sp -= 5; t.hp -= P(L.stat(S, h, 'atk'), t.def, 1.15) * 2; }
        else if (h.id === 'andy' && h.sp >= 7 && rounds % 3 === 1) { h.sp -= 7; for (const x of L.aliveHeroes(S)) guard.push(x); }
        else if (h.id === 'andy' && h.sp >= 3) { h.sp -= 3; t.hp -= P(L.stat(S, h, 'atk'), t.def, 1.5); }
        else if (h.id === 'marco' && al.length >= 2 && h.sp >= 9) { h.sp -= 9; for (const e of al) e.hp -= G(L.stat(S, h, 'mag'), e.def, 1.35); }
        else if (h.id === 'marco' && h.sp >= 4) { h.sp -= 4; t.hp -= G(L.stat(S, h, 'mag'), t.def, 2.2); }
        else if (h.sp < 4 && (S.inv.aether || 0) > 0) { S.inv.aether--; L.applyItem(S, 'aether', h); }
        else t.hp -= P(L.stat(S, h, 'atk'), t.def);
      } else if (o.who.hp > 0) {
        const e = o.who;
        e.turn++;
        const ah = L.aliveHeroes(S);
        if (!ah.length) break;
        if (e.spec.length && e.turn % 3 === 0) {
          for (const h of ah) { const dm = L.dmgPhys(rng, e.atk, L.stat(S, h, 'def'), e.spec[1]); h.hp = Math.max(0, h.hp - (guard.includes(h) ? Math.trunc(dm / 2) : dm)); h.ip = Math.min(100, h.ip + 22); }
        } else {
          const h = ah[rng.randi() % ah.length];
          const dm = L.dmgPhys(rng, e.atk, L.stat(S, h, 'def'), rng.randf() < 0.2 ? 1.5 : 1.0);
          h.hp = Math.max(0, h.hp - (guard.includes(h) ? Math.trunc(dm / 2) : dm)); h.ip = Math.min(100, h.ip + 12);
        }
      }
    }
    if (!L.aliveEnemies(S).length) {
      let tot = 0, mx = 0;
      for (const h of S.party) { tot += h.hp; mx += L.mhp(S, h); }
      return [true, tot / mx, rounds];
    }
    if (!L.aliveHeroes(S).length) return [false, 0, rounds];
  }
  return [false, 0, rounds];
}
const plan = [['rap', 3, 'mcdroehn', ['andrew', 'marco']], ['schlager', 8, 'koenigin', ['andrew', 'marco', 'teresa']], ['xmas', 13, 'frostmod', ['andrew', 'marco', 'teresa', 'rico']],
  ['rock', 18, 'riff', ['andrew', 'marco', 'teresa', 'rico', 'andy']], ['tower', 23, 'rauschen', ['andrew', 'marco', 'teresa', 'rico', 'andy']]];
for (const [mid, lvl, boss, ids] of plan) {
  for (const g of [0, 1]) {
    let wins = 0;
    for (let t = 0; t < 20; t++) {
      const S = L.newState();
      S.gear = Math.trunc(lvl / 5) * g;
      S.party = ids.map(id => L.newHero(S, id, lvl));
      S.inv = { trank: 5, aether: 2, weck: 1 };
      if (simBattle(S, [boss])[0]) wins++;
    }
    console.log(`Boss ${boss} Stufe ${lvl} Ausrüstung ${Math.trunc(lvl / 5) * g} Party ${ids.length}: Siege ${wins}/20`);
    if (g === 1 && wins < 8) fail('Boss zu stark mit Ausrüstung', boss, wins);
  }
}
for (const lv0 of [1, 2, 3]) {
  let wins = 0;
  for (let t = 0; t < 40; t++) {
    const S = L.newState();
    S.party = [L.newHero(S, 'andrew', lv0), L.newHero(S, 'marco', lv0)];
    S.inv = { trank: 0, aether: 0, weck: 0 };
    const pool = MAPS.rap.enc;
    if (simBattle(S, [pool[rng.randi() % 3], pool[rng.randi() % 3]])[0]) wins++;
  }
  console.log(`Einstieg Stufe ${lv0}: Siege ${wins}/40 gegen 2 Gegner ohne Items`);
  if (wins < 20) fail('Einstieg zu schwer', lv0, wins);
}

// ---- Werte stimmen mit der Godot-Fassung überein (Stichproben, von Hand nachgerechnet)
{
  const S = L.newState();
  const a = L.newHero(S, 'andrew', 5);
  if (L.mhp(S, a) !== 126 || L.msp(a) !== 22 || L.stat(S, a, 'atk') !== 24) fail('Heldenwerte', L.mhp(S, a), L.msp(a), L.stat(S, a, 'atk'));
  S.gear = 2;
  if (L.mhp(S, a) !== 142 || L.stat(S, a, 'def') !== 20) fail('Ausrüstung', L.mhp(S, a), L.stat(S, a, 'def'));
  if (L.need(1) !== 16 || L.need(10) !== 360) fail('EXP-Bedarf');
  if (L.gearPrice(S) !== 1080) fail('Ausrüstungspreis');
  S.party = [a, L.newHero(S, 'marco', 5)];
  const e = L.makeEnemy(S, 'mcdroehn');
  if (e.hp !== 455 || e.exp !== 186 || e.gold !== 78) fail('Boss-Werte', e.hp, e.exp, e.gold);
}

// ---- Kompletter Spielablauf ohne Anzeige (wie der Auto-Durchlauf der Godot-Fassung)
const mem = new Map();
const store = { get: k => mem.get(k) ?? null, set: (k, v) => mem.set(k, v), has: k => mem.has(k) };
const ui = { setTouch() {}, msg() {}, fadeNow() {}, isChoosing: () => false, isTalking: () => false, touchVisible: () => true };
const game = new Game(ui, {}, { rng: L.makeRng(99), store });
game.autoplay = true;
const S = game.S;
for (let si = 0; si < 5; si++) {
  const mid = ['rap', 'schlager', 'xmas', 'rock', 'tower'][si];
  S.party = ['andrew', 'marco', 'teresa', 'rico', 'andy'].slice(0, 2 + Math.min(si, 3)).map(id => L.newHero(S, id, L.STAGE_LV[si] + 2));
  S.inv = { trank: 5, aether: 3, weck: 2 };
  S.gear = si;
  S.flags = {};
  game.mode = M.WORLD;
  game.loadMap(mid, { x: 2, y: 14 });
  for (let k = 0; k < 3; k++) {
    const pl = MAPS[mid].enc;
    const r = await game.runBattle([pl[0], pl[1], pl[2]], MAPS[mid].theme);
    console.log(`Auto-Kampf ${mid}: ${r} Lv ${S.party[0].lv} LP ${S.party[0].hp}`);
    if (r === 'lose') { await game.gameOver(); game.loadMap(mid, { x: 2, y: 14 }); }
  }
  for (const o of S.objs.slice()) if (o.t === 'chest' || o.t === 'gate') { if (o.t === 'gate') S.flags[o.d.key] = true; await game.interact(o); }
  L.spawnRoamers(S, game.rng);
  if (!S.roamers.length) fail('keine Monster', mid);
  await game.startRoamerFight(S.roamers[0]);
  for (const h of S.party) { h.lv += 14; h.hp = L.mhp(S, h); h.sp = L.msp(h); }
  for (const o of S.objs.slice()) if (o.t === 'boss') await game.interact(o);
  console.log(`Auto ${mid} Boss-Flag: ${!!S.flags['boss_' + mid]} Schlüssel: ${!!S.flags[mid + '_key']}`);
  if (!S.flags['boss_' + mid] || !S.flags[mid + '_key'] || S.objs.some(o => o.t === 'chest' || o.t === 'gate')) fail('Ablauf', mid);
}
if (!S.flags.boss_rauschen) fail('Ende nicht erreicht');
game.loadMap('welt', { x: 20, y: 22 });
console.log('Monster Weltkarte:', S.roamers.length);
await game.startRoamerFight(S.roamers[0]);
for (const n of MAPS.hub.npcs) await game.talkNpc(n);
// Portale: versiegelter Zugang schiebt zurück, offener lädt die Karte
S.flags = {};
game.loadMap('welt', { x: 33, y: 19 });
S.face = { x: 0, y: -1 };
S.gp = { x: 33, y: 18 };
await game.usePortal(MAPS.welt.portals[2]);
if (S.mapId !== 'welt' || S.gp.y !== 19) fail('Siegel', S.mapId, S.gp);
await game.usePortal(MAPS.welt.portals[1]);
if (S.mapId !== 'rap') fail('Portal');
// Mitstreiter
S.flags = { boss_rap: true, boss_schlager: true };
S.party = [L.newHero(S, 'andrew', 9), L.newHero(S, 'marco', 9)];
await game.usePortal(MAPS.rap.portals[0]);
await game.usePortal(MAPS.welt.portals[0]);
if (S.party.map(h => h.id).join() !== 'andrew,marco,teresa,rico' || S.party[2].lv !== 9) fail('Beitritt', S.party.map(h => h.id + h.lv));
// Speichern/Laden
game.saveGame();
const g2 = new Game(ui, {}, { rng: L.makeRng(5), store });
if (!g2.loadGame() || g2.S.mapId !== 'hub' || g2.S.party.length !== 4 || g2.S.gold !== S.gold) fail('Laden');
// Laufen: ein Schritt nach oben in Funkhafen
game.autoplay = false;
game.busy = false;
game.loadMap('hub', { x: 12, y: 12 });
game.mode = M.WORLD;
S.roamers = [];
game.pressDir({ x: 0, y: -1 }, true);
for (let i = 0; i < 9; i++) game.update(0.016);
game.pressDir({ x: 0, y: -1 }, false);
for (let i = 0; i < 9; i++) game.update(0.016);
if (S.gp.y !== 11 || S.moving) fail('Laufen', S.gp, S.moving);

// ---- Godot-Spielstand (store_var) einlesen
{
  const enc = [];
  const u32 = (v) => { enc.push(v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255); };
  const str = (s) => { u32(4); const b = [...new TextEncoder().encode(s)]; u32(b.length); enc.push(...b); while (enc.length % 4) enc.push(0); };
  const int = (v) => { u32(2); u32(v); };
  const flt = (v) => { u32(3 | (1 << 16)); const f = new Float64Array([v]); enc.push(...new Uint8Array(f.buffer)); };
  const dict = (o) => { u32(27); const ks = Object.keys(o); u32(ks.length); for (const k of ks) { str(k); val(o[k]); } };
  const val = (v) => { if (typeof v === 'string') str(v); else if (typeof v === 'boolean') { u32(1); u32(v ? 1 : 0); } else if (Array.isArray(v)) { u32(28); u32(v.length); v.forEach(val); } else if (v && v.vi) { u32(6); u32(v.x); u32(v.y); } else if (typeof v === 'object') dict(v); else if (Number.isInteger(v)) int(v); else flt(v); };
  u32(0);
  val({ party: [{ id: 'andrew', name: 'Andrew', lv: 4, exp: 10, hp: 80, sp: 12, ip: 0, down: false }], inv: { trank: 2, aether: 1, weck: 0 }, gold: 321, gear: 1, flags: { boss_rap: true }, map: 'welt', gp: { vi: 1, x: 20, y: 22 }, t: 1234.5 });
  const bytes = new Uint8Array(enc);
  new DataView(bytes.buffer).setUint32(0, bytes.length - 4, true);
  const d = parseGodotSave(bytes);
  if (!d || d.gold !== 321 || d.gp.x !== 20 || d.party[0].lv !== 4 || !d.flags.boss_rap || Math.abs(d.t - 1234.5) > 0.01) fail('Godot-Spielstand', JSON.stringify(d));
}

console.log('SELBSTTEST FEHLER:', fails);
process.exit(fails ? 1 : 0);
