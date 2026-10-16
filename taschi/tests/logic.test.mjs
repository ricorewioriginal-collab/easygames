import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPECIES, SPECIES_IDS, STARTERS, learnset } from '../src/data/species.js';
import { MOVES, TYPE_MOVESET } from '../src/data/moves.js';
import { TYPES, CHART, effectiveness } from '../src/data/types.js';
import { ITEMS, shopStock } from '../src/data/items.js';
import { REGIONS, STAR_LEAGUE } from '../src/data/regions.js';
import { TRAINERS, GUILD_BATTLES } from '../src/data/trainers.js';
import { createRng } from '../src/core/rng.js';
import { makeMonster, maxHp, gainXp, xpToNext, evolutionTarget, evolve, healMonster } from '../src/logic/monster.js';
import { createBattle, runTurn, replace, catchChance, playerOptions } from '../src/logic/battle.js';
import * as Items from '../src/logic/items.js';
import { obtainableSpecies, rollEncounter } from '../src/logic/encounters.js';
import * as P from '../src/logic/progress.js';

test('catalogue keeps all 260 species with unique names and valid data', () => {
  assert.equal(SPECIES_IDS.length, 260);
  assert.equal(new Set(SPECIES_IDS.map(id => SPECIES[id].name)).size, 260);
  for (const id of ['schnurrik', 'auraflamme', 'tiefenlied', 'sturmkron', 'mondhueter', 'glutzahn', 'plaetscher', 'samenling']) assert.ok(SPECIES[id], id);
  for (const id of SPECIES_IDS) {
    const s = SPECIES[id];
    assert.ok(TYPES[s.type], id + ' type');
    if (s.type2) assert.ok(TYPES[s.type2], id + ' type2');
    assert.ok(s.hp > 0 && s.atk > 0 && s.def > 0 && s.speed > 0, id + ' stats');
    assert.ok(s.catch > 0 && s.catch <= 1, id + ' catch');
    assert.ok(s.look?.plan, id + ' body plan');
    assert.ok(s.bio && s.bio.length > 20, id + ' dex entry');
    for (const [, m] of learnset(id)) assert.ok(MOVES[m], id + ' learns unknown ' + m);
    if (s.evo) assert.ok(SPECIES[s.evo.to], id + ' evolution');
  }
});

test('starters, types and moves are consistent', () => {
  assert.deepEqual(STARTERS, ['glutzahn', 'plaetscher', 'samenling']);
  assert.equal(SPECIES.glutzahn.type, 'feuer');
  assert.equal(SPECIES.plaetscher.type, 'wasser');
  assert.equal(SPECIES.samenling.type, 'pflanze');
  for (const t of Object.keys(TYPE_MOVESET)) for (const m of TYPE_MOVESET[t]) assert.equal(MOVES[m].type, t);
  for (const a of Object.keys(CHART)) for (const d of Object.keys(CHART[a])) assert.ok(TYPES[d]);
  assert.equal(effectiveness('wasser', { type: 'feuer' }), 2);
  assert.equal(effectiveness('normal', { type: 'geist' }), 0);
  assert.equal(effectiveness('elektro', { type: 'wasser', type2: 'flug' }), 4);
  for (const v1 of ['stoss', 'hieb', 'funken', 'glut', 'ranke', 'spritzer', 'fluegel', 'stein', 'spuk']) assert.ok(MOVES[v1]);
});

test('every catchable species is obtainable in the world', () => {
  const ob = obtainableSpecies();
  const missing = SPECIES_IDS.filter(id => !SPECIES[id].ancient && id !== 'schnurrik' && !ob.has(id));
  assert.deepEqual(missing, []);
});

test('16 regions with full content', () => {
  assert.equal(REGIONS.length, 16);
  const names = ['Moostal', 'Korallküste', 'Funkenfeld', 'Blütenhain', 'Käferwald', 'Sturmklippe', 'Glutland', 'Sternenau', 'Nebelmoor', 'Frosttal', 'Wipfelreich', 'Donnersteppe', 'Kristallberg', 'Mondbucht', 'Sonnenhöhe', 'Himmelskrone'];
  assert.deepEqual(REGIONS.map(r => r.name), names);
  for (const r of REGIONS) {
    assert.ok(r.town && r.professor?.name && r.gym?.leader && r.champion?.name, r.name);
    assert.ok(r.npcs.length >= 7, r.name + ' npcs');
    assert.ok(new Set(r.npcs.map(n => n.role)).size >= 6, r.name + ' roles');
    assert.ok(r.quests.length >= 2, r.name + ' quests');
    assert.ok(r.puzzle?.kind && r.gym.mechanic && r.landmark?.name, r.name + ' puzzle');
    assert.ok(P.regionQuests(r.id).length >= 3);
  }
  assert.equal(new Set(REGIONS.map(r => r.professor.name)).size, 16);
  assert.equal(STAR_LEAGUE.length, 5);
});

test('trainers: arenas, champions, guild, league are complete', () => {
  for (let r = 0; r < 16; r++) {
    assert.ok(TRAINERS['leader_' + r] && TRAINERS['champ_' + r], 'region ' + r);
    assert.ok(TRAINERS['gymtr_' + r + '_0'] && TRAINERS['gymtr_' + r + '_1']);
    for (let i = 0; i < 3; i++) assert.ok(TRAINERS['route_' + r + '_' + i]);
  }
  for (let i = 0; i < 5; i++) assert.ok(TRAINERS['league_' + i]);
  assert.equal(GUILD_BATTLES.length, 8);
  for (const t of Object.values(TRAINERS)) for (const m of t.team) assert.ok(SPECIES[m.id], t.id + ' ' + m.id);
  assert.ok(Object.values(TRAINERS).some(t => t.format === 'double'));
  assert.ok(TRAINERS.g2_brix.team.some(m => m.id === 'schnurrik'));
});

test('stats, xp and evolution', () => {
  const rng = createRng(1);
  const m = makeMonster('glutzahn', 15, rng);
  assert.equal(m.hp, maxHp(m));
  assert.ok(m.moves.length >= 2 && m.moves.length <= 4);
  const ev = gainXp(m, xpToNext(15) + 1);
  assert.equal(m.lv, 16);
  assert.ok(ev.some(e => e.type === 'evolve' && e.to === 'glutdrach'));
  evolve(m, 'glutdrach');
  assert.equal(m.id, 'glutdrach');
  const item = makeMonster('form_6_1', 20, rng); // kristall lineage stage 1 → item evolution
  assert.equal(evolutionTarget(item, {}), null);
  assert.equal(evolutionTarget(item, { item: 'kristallsplitter' }), 'form_6_2');
});

test('battle: damage, AP consumption, type advantage and victory', () => {
  const rng = createRng('b1');
  const me = makeMonster('plaetscher', 12, rng), foe = makeMonster('funkli', 8, rng);
  const b = createBattle({ rng, kind: 'wild', player: { team: [me], bag: {} }, foe: { team: [foe], ai: 0 } });
  const before = me.moves.find(x => x.id === 'spritzer').pp;
  let guard = 0;
  while (!b.result && guard++ < 20) {
    const ev = runTurn(b, [{ slot: 0, type: 'move', move: 'spritzer', target: 0 }]);
    const dmg = ev.find(e => e.t === 'damage' && e.uid === foe.uid);
    if (dmg) assert.equal(dmg.eff, 2);
  }
  assert.equal(b.result.outcome, 'win');
  assert.ok(me.moves.find(x => x.id === 'spritzer').pp < before);
});

test('battle: catching, items, switching, faint replacement, status', () => {
  const rng = createRng('b2');
  const a = makeMonster('samenling', 20, rng), c = makeMonster('felsling', 20, rng);
  const wild = makeMonster('quappi', 5, rng);
  const bag = { taschiball: 30, trank: 2 };
  const b = createBattle({ rng, kind: 'wild', player: { team: [a, c], bag }, foe: { team: [wild], ai: 0 } });
  assert.ok(playerOptions(b, 0).canCatch);
  let ev = runTurn(b, [{ slot: 0, type: 'switch', to: 1 }]);
  assert.ok(ev.some(e => e.t === 'switchIn'));
  a.hp = 5;
  ev = runTurn(b, [{ slot: 0, type: 'item', item: 'trank', target: a.uid }]);
  assert.ok(a.hp > 5 && bag.trank === 1);
  let guard = 0;
  while (!b.result && guard++ < 40) runTurn(b, [{ slot: 0, type: 'item', item: 'taschiball' }]);
  assert.equal(b.result.outcome, 'caught');
  assert.ok(catchChance(b, makeMonster('quappi', 5, rng), 'sternball') > catchChance(b, makeMonster('quappi', 5, rng), 'taschiball'));
  // replacement flow
  const x = makeMonster('kaeferli', 3, rng), y = makeMonster('kaeferli', 30, rng), boss = makeMonster('glutdrach', 40, rng);
  const b2 = createBattle({ rng, kind: 'trainer', player: { team: [x, y], bag: {} }, foe: { team: [boss], ai: 3, trainer: true, name: 'Test' } });
  guard = 0;
  while (b2.phase === 'choose' && guard++ < 10) runTurn(b2, [{ slot: 0, type: 'move', move: x.moves[0].id, target: 0 }]);
  assert.equal(b2.phase, 'replace');
  assert.ok(replace(b2, 0, 1).ok);
  assert.equal(b2.phase, 'choose');
  assert.equal(b2.canRun, false);
});

test('double battles resolve with two actives per side', () => {
  const rng = createRng('dbl');
  const team = [makeMonster('glutzahn', 30, rng), makeMonster('plaetscher', 30, rng), makeMonster('samenling', 30, rng)];
  const foes = [makeMonster('kaeferli', 18, rng), makeMonster('flatterling', 18, rng)];
  const b = createBattle({ rng, kind: 'trainer', format: 'double', player: { team, bag: {} }, foe: { team: foes, ai: 2, trainer: true, name: 'Zwillinge' } });
  assert.equal(b.sides[0].active.length, 2);
  let guard = 0;
  while (!b.result && guard++ < 30) {
    if (b.phase === 'replace') { for (const slot of [...b.needReplace]) { const free = team.findIndex((m, i) => m.hp > 0 && !b.sides[0].active.includes(i)); replace(b, slot, free); } continue; }
    runTurn(b, [0, 1].map(slot => ({ slot, type: 'move', move: team[b.sides[0].active[slot]]?.moves[0].id, target: 0 })));
  }
  assert.equal(b.result.outcome, 'win');
});

test('items: every item has a working effect, shop buy/sell', () => {
  const rng = createRng('items');
  const m = makeMonster('blitzi', 20, rng);
  m.hp = 3; m.status = 'gift';
  const bag = { trank: 1, heilkraut: 1, aetherperle: 1, belebungskraut: 1 };
  assert.ok(Items.useFromBag(bag, 'trank', m).ok);
  assert.ok(Items.useFromBag(bag, 'heilkraut', m).ok && m.status === null);
  m.moves[0].pp = 0;
  assert.ok(Items.useFromBag(bag, 'aetherperle', m).ok && m.moves[0].pp > 0);
  m.hp = 0;
  assert.ok(Items.useFromBag(bag, 'belebungskraut', m).ok && m.hp > 0);
  const lv = m.lv, candy = { levelbonbon: 1 };
  const grow = Items.useFromBag(candy, 'levelbonbon', m);
  assert.ok(grow.ok && m.lv === lv + 1 && grow.events.some(e => e.type === 'levelup') && !candy.levelbonbon);
  for (const id of Object.keys(ITEMS)) {
    const it = ITEMS[id];
    const handled = it.category === 'ball' || it.category === 'key' || it.category === 'battle' || it.heal || it.revive || it.pp || it.cure || it.category === 'evo' || it.category === 'growth';
    assert.ok(handled, 'item without effect: ' + id);
  }
  const state = { coins: 1000, badges: 0, bag: {} };
  assert.ok(Items.buy(state, 'taschiball', 10).ok);
  assert.equal(state.bag.taschiball, 11);
  assert.equal(state.coins, 600);
  assert.ok(!Items.buy(state, 'supertrank', 1).ok, 'locked by badges');
  assert.ok(Items.sell(state, 'taschiball', 2).ok && state.coins === 640);
  assert.ok(shopStock(16).length > shopStock(0).length);
});

test('encounters respect region levels', () => {
  const rng = createRng('enc');
  for (let r = 0; r < 16; r++) for (let i = 0; i < 20; i++) {
    const m = rollEncounter(r, rng);
    assert.ok(SPECIES[m.id] && !SPECIES[m.id].ancient);
    assert.ok(m.lv >= 2 && m.lv <= REGIONS[r].gym.level);
  }
});
