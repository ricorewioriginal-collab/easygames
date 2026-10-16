// Expansion: meadows, ball types, three-stage lines, learnsets, move tutor,
// EP scaling and the rival.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPECIES, SPECIES_IDS, STARTERS, learnset, movesAtLevel } from '../src/data/species.js';
import { MOVES, TYPE_LEARN } from '../src/data/moves.js';
import { ITEMS, BALL_IDS, shopStock, sellPrice } from '../src/data/items.js';
import { REGIONS } from '../src/data/regions.js';
import { RIVAL_STAGES, rivalTrainer } from '../src/data/trainers.js';
import { RIVAL } from '../src/data/story.js';
import { createRng } from '../src/core/rng.js';
import { buildLayout, grassAt, onRoad, waterDistance, HALF } from '../src/logic/layout.js';
import { makeMonster, gainXp, xpReward, evolve, evolutionChain, forgetMove, relearnableMoves, teachMove, levelUp, maxHp } from '../src/logic/monster.js';
import { createBattle, runTurn, catchChance } from '../src/logic/battle.js';
import { ballRate } from '../src/logic/items.js';
import { obtainableSpecies } from '../src/logic/encounters.js';

test('every region has several large meadows; roads and water stay free', () => {
  for (let r = 0; r < 16; r++) {
    const L = buildLayout(r);
    const big = L.grass.filter(g => g.rx * g.rz >= 60);
    assert.ok(big.length >= (r === 15 ? 2 : 6), 'region ' + r + ' meadows ' + big.length);
    const rng = createRng('meadow:' + r);
    let inside = 0;
    for (let i = 0; i < 4000; i++) {
      const x = (rng.next() - 0.5) * 2 * HALF, z = (rng.next() - 0.5) * 2 * HALF;
      const g = grassAt(L, x, z);
      if (!g) continue;
      inside++;
      if (!g.nocut) { assert.ok(!onRoad(L, x, z), 'grass on road'); assert.ok(waterDistance(L, x, z) >= 0.8, 'grass in water'); }
    }
    assert.ok(inside > 40, 'region ' + r + ' grass samples ' + inside);
    for (const g of L.grass) assert.ok(['grass', 'flowers', 'water'].includes(g.habitat));
    assert.ok(L.gates.every(gt => Math.abs(gt.z) > 100), 'gates moved outward');
  }
});

test('ball types: shop offers several early, special balls shine in their niche', () => {
  assert.ok(BALL_IDS.length >= 10);
  assert.ok(shopStock(0).filter(id => ITEMS[id].category === 'ball').length >= 2);
  assert.ok(shopStock(3).filter(id => ITEMS[id].category === 'ball').length >= 6);
  assert.ok(!shopStock(16).includes('meisterball') && sellPrice('meisterball') === 0);
  const rng = createRng('balls');
  const water = makeMonster('quappi', 10, rng), fire = makeMonster('funkli', 10, rng);
  assert.equal(ballRate('netzball', { foe: water }), 3);
  assert.equal(ballRate('netzball', { foe: fire }), 1);
  assert.equal(ballRate('flinkball', { foe: fire, turn: 1 }), 4);
  assert.ok(ballRate('flinkball', { foe: fire, turn: 3 }) < 1);
  assert.equal(ballRate('daemmerball', { foe: fire, night: true }), 3);
  assert.equal(ballRate('levelball', { foe: fire, ownLevel: 25 }), 4);
  assert.ok(ballRate('timerball', { turn: 11 }) > ballRate('timerball', { turn: 1 }));
  const team = [makeMonster('glutzahn', 12, rng)];
  const b = createBattle({ rng, kind: 'wild', player: { team, bag: { meisterball: 1, heilball: 1 } }, foe: { team: [makeMonster('form_9_14', 40, rng)] } });
  assert.equal(catchChance(b, b.sides[1].team[0], 'meisterball'), 1);
  // heal ball: caught Taschi comes out fully healed
  const foe = makeMonster('wollini', 3, rng);
  foe.hp = 1;
  const b2 = createBattle({ rng: { next: () => 0, int: (a) => a, pick: (l) => l[0] }, kind: 'wild', player: { team: [makeMonster('glutzahn', 12, rng)], bag: { heilball: 1 } }, foe: { team: [foe] } });
  runTurn(b2, [{ slot: 0, type: 'item', item: 'heilball' }]);
  assert.equal(b2.result?.outcome, 'caught');
  assert.equal(foe.hp, maxHp(foe));
});

test('original lines and new families have three stages and are obtainable', () => {
  for (const id of [...STARTERS, 'blitzi', 'fellino', 'flatterling', 'felsling', 'geisterchen', 'quappi', 'kaeferli', 'knister', 'funkli', 'doesi',
    'floeckchen', 'buddelmaus', 'wollini', 'glimmstein', 'troepfli', 'laternchen', 'summsel', 'pilzling']) {
    assert.equal(evolutionChain(id).length, 3, id);
  }
  assert.equal(SPECIES_IDS.length, 260);
  const obtainable = obtainableSpecies();
  for (const id of ['magmadrach', 'floeckchen', 'gletscherloewe', 'pilzling', 'sporenfuerst', 'doesi', 'schlummkoloss']) assert.ok(obtainable.has(id), id + ' obtainable');
  // evolution levels rise along each line
  for (const id of SPECIES_IDS) {
    const evo = SPECIES[id].evo, next = evo && SPECIES[evo.to].evo;
    if (evo?.level && next?.level) assert.ok(next.level > evo.level, id);
  }
});

test('learnsets: full progression, valid moves, sensible movesets', () => {
  for (const t of Object.keys(TYPE_LEARN)) for (const [, m] of TYPE_LEARN[t]) assert.equal(MOVES[m].type, t, m);
  for (const id of SPECIES_IDS) {
    const ls = learnset(id);
    assert.ok(ls.length >= 8, id + ' learns ' + ls.length);
    for (const [, m] of ls) assert.ok(MOVES[m], id + ' ' + m);
    for (const lv of [5, 20, 45]) {
      const set = movesAtLevel(id, lv);
      assert.ok(set.length >= 1 && set.length <= 4);
      assert.ok(set.some(m => MOVES[m].power > 0), id + ' has an attack at ' + lv);
      assert.ok(set.filter(m => !MOVES[m].power).length <= 1, id + ' too many status moves');
    }
  }
});

test('levelling: stat gains, EP scaling, forgetting and relearning moves', () => {
  const rng = createRng('lvl');
  const m = makeMonster('glutzahn', 10, rng);
  const ev = gainXp(m, 500);
  const up = ev.find(e => e.type === 'levelup');
  assert.ok(up && up.gains.hp > 0 && up.gains.atk >= 0);
  const foe = makeMonster('fellino', 20, rng);
  assert.ok(xpReward(foe, { level: 10 }) > xpReward(foe, { level: 30 }), 'weaker Taschis gain more');
  assert.ok(xpReward(foe, { level: 20, friendship: 200 }) > xpReward(foe, { level: 20, friendship: 70 }));
  // forget and relearn
  const k = makeMonster('samenling', 30, rng);
  const before = k.moves.length;
  assert.ok(forgetMove(k, 0));
  assert.equal(k.moves.length, before - 1);
  const options = relearnableMoves(k);
  assert.ok(options.length > 0);
  assert.ok(teachMove(k, options[0]));
  while (k.moves.length > 1) forgetMove(k, 0);
  assert.ok(!forgetMove(k, 0), 'keeps at least one move');
  // relearn includes moves of earlier stages
  const evolved = makeMonster('bluetling', 30, rng);
  assert.ok(relearnableMoves(evolved).includes('stoss'));
  // levelUp grants exactly one level
  const c = makeMonster('wollini', 7, rng);
  levelUp(c);
  assert.equal(c.lv, 8);
});

test('evolution offers moves of the new type', () => {
  const rng = createRng('evo');
  const m = makeMonster('glutdrach', 40, rng);
  const { learned, offers } = evolve(m, 'magmadrach');
  assert.equal(m.id, 'magmadrach');
  const fresh = [...learned, ...offers];
  assert.ok(fresh.length === 1 && MOVES[fresh[0]].type === 'flug', 'new flying move ' + fresh);
});

test('rival: five meetings with a growing team that counters the starter', () => {
  assert.equal(RIVAL_STAGES.length, RIVAL.stages.length);
  for (const st of RIVAL.stages) assert.ok(st.before.length && st.win.length && st.lose.length);
  const counters = { glutzahn: 'wasser', plaetscher: 'pflanze', samenling: 'feuer' };
  let prev = 0;
  RIVAL_STAGES.forEach((st, i) => {
    assert.ok(REGIONS[st.region]);
    for (const starter of STARTERS) {
      const t = rivalTrainer(i, starter);
      assert.equal(t.team.length, st.size);
      assert.equal(SPECIES[t.team.at(-1).id].type, counters[starter]);
      for (const x of t.team) assert.ok(SPECIES[x.id] && x.lv >= 3);
    }
    assert.ok(st.level > prev); prev = st.level;
  });
});
