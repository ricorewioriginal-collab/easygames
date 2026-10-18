'use strict';
const H = require('./helpers');
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

let s;
before(async () => { s = await H.start(); });
after(async () => { await s.stop(); });

test('Bauen bis Inselabschluss: Kosten exakt einmal, Bonus, nächste Insel', async () => {
  const p = await s.player('builder', 'Bea');
  await p.patch({ coins: 10000000 });
  let coins = (await p.me()).coins;
  const E = s.E;
  for (let stage = 0; stage < 5; stage++) for (let b = 0; b < 5; b++) {
    const cost = E.buildCost(1, b, stage, 'classic', 0);
    const nonce = 'build-' + b + '-' + stage + '-x';
    const r = await p.call('POST', '/v1/build', { nonce, b });
    assert.equal(r.status, 200, r.text);
    assert.equal(r.json.result.cost, cost);
    const replay = await p.call('POST', '/v1/build', { nonce, b });   // Wiederholung bucht nicht erneut
    assert.equal(replay.text, r.text);
    if (stage === 4 && b === 4) {
      const bonus = 25 * E.base(1, 0);
      assert.deepEqual(r.json.result.islandDone, { island: 1, bonusCoins: bonus, bonusEnergy: 10, next: 2 });
      assert.equal(r.json.state.coins, coins - cost + bonus);
      assert.equal(r.json.state.island, 2); assert.equal(r.json.state.islandsDone, 1);
      assert.deepEqual(r.json.state.stages, [0, 0, 0, 0, 0]);
      assert.deepEqual(r.json.state.mults, [1, 2]);
      coins = coins - cost + bonus;
    } else {
      assert.equal(r.json.state.coins, coins - cost);
      coins -= cost;
    }
  }
  const st = await p.me();
  assert.equal(st.coins, coins);
  assert.equal(st.stats.builds, 25);
  assert.equal(st.buildCosts[0], E.buildCost(2, 0, 0, 'classic', 0));
});

test('zu wenig Münzen → 402, nichts gebucht; parallele Käufe nie negativ', async () => {
  const p = await s.player('poor', 'Paul');
  const cost = s.E.buildCost(1, 0, 0, 'classic', 0);
  await p.patch({ coins: cost * 2 + 5 });
  const rs = await Promise.all(Array.from({ length: 8 }, (_, i) => p.act('/v1/build', { b: i % 5 })));
  const st = await p.me();
  assert.ok(st.coins >= 0);
  const spent = rs.filter(r => r.status === 200).reduce((a, r) => a + r.json.result.cost, 0);
  assert.equal(st.coins, cost * 2 + 5 - spent);
  assert.ok(rs.some(r => r.status === 402 && r.json.error === 'not_enough_coins'));
});

test('beschädigt → erst reparieren (Kosten exakt), max. Stufe 5, ungültiges b', async () => {
  const p = await s.player('repairer', 'Rolf');
  await p.patch({ coins: 1e7, stages: [3, 0, 0, 0, 5], damaged: [true, false, false, false, false] });
  assert.equal((await p.act('/v1/build', { b: 0 })).json.error, 'damaged');
  assert.equal((await p.act('/v1/build', { b: 4 })).json.error, 'max_stage');
  for (const b of [-1, 5, 1.5, '0', null]) assert.equal((await p.act('/v1/build', { b })).status, 400);
  assert.equal((await p.act('/v1/repair', { b: 1 })).json.error, 'not_damaged');
  const c0 = (await p.me()).coins;
  const r = await p.act('/v1/repair', { b: 0 });
  assert.equal(r.status, 200);
  assert.equal(r.json.result.cost, s.E.repairCost(1, 0, 3, 'classic', 0));
  assert.equal(r.json.state.coins, c0 - r.json.result.cost);
  assert.equal(r.json.state.damaged[0], false);
  assert.equal((await p.act('/v1/build', { b: 0 })).status, 200);
});

test('Insel 30 abgeschlossen → kein weiterer Ausbau', async () => {
  const p = await s.player('final', 'Fina');
  await p.patch({ coins: 9e14, island: 30, islandsDone: 29, stages: [5, 5, 5, 5, 4] });
  const r = await p.act('/v1/build', { b: 4 });
  assert.equal(r.status, 200);
  assert.equal(r.json.result.islandDone.next, null);
  assert.equal(r.json.state.islandsDone, 30); assert.equal(r.json.state.island, 30);
  assert.ok(r.json.state.coins <= s.E.MAX_COINS);
  assert.equal((await p.act('/v1/build', { b: 0 })).json.error, 'all_islands_done');
  assert.deepEqual(r.json.state.mults, [1, 2, 3, 5, 10, 25, 50]);
});
