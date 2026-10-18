'use strict';
const H = require('./helpers');
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

let s;
before(async () => { s = await H.start(); });
after(async () => { await s.stop(); });

const HOUR = 36e5;
async function victim(uid, extra) {
  const v = await s.player(uid, 'Opfer ' + uid);
  await v.patch(Object.assign({ createdAgoMs: 25 * HOUR, stages: [2, 1, 1, 1, 0] }, extra || {}));
  v.pid = (await v.me()).pid;
  return v;
}
async function attacker(uid, kind, mult) {
  const a = await s.player(uid, 'Angreifer');
  await a.patch({ pending: { kind: kind || 'attack', mult: mult || 1 } });
  return a;
}

test('Angriff: Schild blockt genau einmal, dann Schaden, dann Stufe −1', async () => {
  const v = await victim('v-shield', { shields: 1 });
  const a = await attacker('a-shield');
  const E = s.E;
  // Ziel mit Stufe 0 → 400
  assert.equal((await a.act('/v1/attack', { target: v.pid, b: 4 })).status, 400);
  let r = await a.act('/v1/attack', { target: v.pid, b: 0 });
  assert.equal(r.status, 200, r.text);
  assert.equal(r.json.result.result, 'blocked');
  assert.equal(r.json.result.coins, E.attackReward(1, 1, true, 0));
  assert.equal(r.json.state.pending, null);
  let vs = await v.me();
  assert.equal(vs.shields, 0); assert.deepEqual(vs.stages, [2, 1, 1, 1, 0]); assert.equal(vs.damaged[0], false);
  // ohne pending → 409
  assert.equal((await a.act('/v1/attack', { target: v.pid, b: 0 })).status, 409);
  // nächste Stunde (Limit je Angreifer), neue Aktion
  s.now.add(HOUR + 1);
  await a.patch({ pending: { kind: 'attack', mult: 1 } });
  r = await a.act('/v1/attack', { target: v.pid, b: 0 });
  assert.equal(r.json.result.result, 'damaged');
  assert.equal(r.json.result.coins, E.attackReward(1, 1, false, 0));
  vs = await v.me();
  assert.equal(vs.damaged[0], true); assert.equal(vs.stages[0], 2);
  s.now.add(HOUR + 1);
  await a.patch({ pending: { kind: 'attack', mult: 1 } });
  r = await a.act('/v1/attack', { target: v.pid, b: 0 });
  assert.equal(r.json.result.result, 'destroyed');
  vs = await v.me();
  assert.equal(vs.stages[0], 1);
  // Verlauf beider Seiten, Rache-Token nur beim Opfer
  const hv = (await v.call('GET', '/v1/history')).json.result.history;
  const ha = (await a.call('GET', '/v1/history')).json.result.history;
  assert.equal(hv.length, 3); assert.equal(ha.length, 3);
  assert.ok(hv.every(e => e.role === 'in' && /^[a-z0-9]{24}$/.test(e.revengeToken)));
  assert.ok(ha.every(e => e.role === 'out' && !e.revengeToken));
  assert.deepEqual(hv.map(e => e.result), ['destroyed', 'damaged', 'blocked']);
  assert.ok(!JSON.stringify(hv).includes('a-shield'), 'keine fremde uid im Verlauf');
});

test('Anfängerschutz: neue Konten / Insel 1 mit < 5 Stufen nie angreifbar', async () => {
  const fresh = await s.player('v-fresh', 'Neu');
  await fresh.patch({ stages: [3, 3, 0, 0, 0] });   // jünger als 24 h
  const small = await s.player('v-small', 'Klein');
  await small.patch({ createdAgoMs: 48 * HOUR, stages: [2, 2, 0, 0, 0] });   // Insel 1, < 5 Stufen
  const a = await attacker('a-protect');
  for (const v of [fresh, small]) {
    const pid = (await v.me()).pid;
    const r = await a.act('/v1/attack', { target: pid, b: 0 });
    assert.equal(r.status, 403); assert.equal(r.json.error, 'target_protected');
  }
  const t = await a.call('GET', '/v1/targets');
  assert.equal(t.status, 200);
  const pids = t.json.result.targets.map(x => x.target);
  assert.ok(!pids.includes((await fresh.me()).pid) && !pids.includes((await small.me()).pid));
  assert.ok(t.json.result.targets.length <= 6);
  for (const x of t.json.result.targets) assert.deepEqual(Object.keys(x).sort(), ['damaged', 'islandsDone', 'island', 'name', 'shield', 'stages', 'target'].sort());
  assert.equal((await a.act('/v1/attack', { target: (await a.me()).pid, b: 0 })).status, 400);   // sich selbst
  assert.equal((await a.act('/v1/attack', { target: 'f'.repeat(24), b: 0 })).status, 404);
});

test('Limit pro Ziel: max. 3/h von allen, max. 1/h vom selben Angreifer', async () => {
  const v = await victim('v-limit', { stages: [5, 5, 5, 5, 5] });
  const as = [];
  for (let i = 0; i < 4; i++) as.push(await attacker('a-limit-' + i));
  for (let i = 0; i < 3; i++) assert.equal((await as[i].act('/v1/attack', { target: v.pid, b: i })).status, 200);
  const busy = await as[3].act('/v1/attack', { target: v.pid, b: 3 });
  assert.equal(busy.status, 429); assert.equal(busy.json.error, 'target_busy');
  assert.ok(!(await as[3].call('GET', '/v1/targets')).json.result.targets.some(x => x.target === v.pid));
  await as[0].patch({ pending: { kind: 'attack', mult: 1 } });
  assert.equal((await as[0].act('/v1/attack', { target: v.pid, b: 3 })).json.error, 'target_busy');
  s.now.add(HOUR + 1);
  await as[0].patch({ pending: { kind: 'attack', mult: 1 } });
  await as[3].patch({ pending: { kind: 'attack', mult: 1 } });
  assert.equal((await as[3].act('/v1/attack', { target: v.pid, b: 3 })).status, 200);
  const cd = await as[3].call('POST', '/v1/test/patch', { pending: { kind: 'attack', mult: 1 } });
  assert.equal(cd.status, 200);
  const again = await as[3].act('/v1/attack', { target: v.pid, b: 4 });
  assert.equal(again.status, 429); assert.equal(again.json.error, 'target_cooldown');
});

test('Raub: Opfer verliert genau, was Angreifer bekommt; Deckel; Idempotenz; ohne pending → 409', async () => {
  const E = s.E;
  const v = await victim('v-raid', { coins: 1000000 });
  const a = await attacker('a-raid', 'raid');
  const before1 = (await a.me()).coins, vb = (await v.me()).coins;
  const body = { nonce: 'raid-nonce-001', target: v.pid, picks: [0, 2, 4] };
  const r = await a.call('POST', '/v1/raid', body);
  assert.equal(r.status, 200, r.text);
  const res = r.json.result;
  assert.equal(res.spots.length, 6);
  assert.deepEqual(res.spots.map(x => x.kind).sort(), Array.from(E.RAID_SPOTS, x => x.kind).sort());
  const raw = res.picks.reduce((x, i) => x + res.spots[i].coins, 0);
  assert.equal(res.raw, raw);
  assert.equal(res.loot, Math.min(raw, E.raidLootCap(vb, 1, 1, 0)));
  const after1 = (await a.me()).coins, va = (await v.me()).coins;
  assert.equal(after1 - before1, res.loot);
  assert.equal(vb - va, res.loot);
  // doppelte nonce bucht nicht doppelt
  const r2 = await a.call('POST', '/v1/raid', body);
  assert.equal(r2.text, r.text);
  assert.equal((await a.me()).coins, after1); assert.equal((await v.me()).coins, va);
  // ohne pending → 409
  const r3 = await a.act('/v1/raid', { target: v.pid, picks: [0, 1, 2] });
  assert.equal(r3.status, 409); assert.equal(r3.json.error, 'no_pending');
  // ungültige picks
  await a.patch({ pending: { kind: 'raid', mult: 1 } });
  for (const picks of [[0, 0, 1], [0, 1], [0, 1, 6], [0, 1, '2'], 'abc', [0, 1, 2, 3]]) assert.equal((await a.act('/v1/raid', { target: v.pid, picks })).status, 400);
});

test('Raub-Deckel bei kleinem Vorrat und nie negativ', async () => {
  const E = s.E;
  for (const [coins, uid] of [[10000, 'v-cap1'], [3, 'v-cap2'], [1, 'v-cap3']]) {
    const v = await victim(uid, { coins });
    const a = await attacker('a-' + uid, 'raid', 1);
    const ab = (await a.me()).coins;
    const r = await a.act('/v1/raid', { target: v.pid, picks: [0, 1, 2] });
    assert.equal(r.status, 200, r.text);
    const cap = E.raidLootCap(coins, 1, 1, 0);
    assert.ok(r.json.result.loot <= cap && r.json.result.loot >= 0);
    const vs = await v.me();
    assert.ok(vs.coins >= 0);
    assert.equal(coins - vs.coins, r.json.result.loot);
    assert.equal((await a.me()).coins - ab, r.json.result.loot);
  }
  // Ziel ohne Münzen → kein Raub, nicht in Zielliste
  const empty = await victim('v-empty', { coins: 0 });
  const a = await attacker('a-empty', 'raid');
  assert.equal((await a.act('/v1/raid', { target: empty.pid, picks: [0, 1, 2] })).json.error, 'target_empty');
  assert.ok(!(await a.call('GET', '/v1/targets')).json.result.targets.some(x => x.target === empty.pid));
});

test('Rache: setzt Angriff gegen genau den Verursacher, einmal pro Token, Ablauf 24 h', async () => {
  const v = await victim('v-rev', { stages: [3, 3, 3, 0, 0] });
  const a = await attacker('a-rev');
  await a.patch({ stages: [1, 0, 0, 0, 0] });   // Angreifer ist neu (Schutz) – Rache gilt trotzdem
  const other = await victim('v-other');
  assert.equal((await a.act('/v1/attack', { target: v.pid, b: 0 })).status, 200);
  const tok = (await v.call('GET', '/v1/history')).json.result.history[0].revengeToken;
  assert.equal((await v.act('/v1/revenge', { token: 'x'.repeat(24) })).status, 404);
  const r = await v.act('/v1/revenge', { token: tok });
  assert.equal(r.status, 200, r.text);
  assert.equal(r.json.state.pending.kind, 'attack');
  assert.equal(r.json.result.target, (await a.me()).pid);
  const tg = await v.call('GET', '/v1/targets');
  assert.equal(tg.json.result.revenge, true);
  assert.deepEqual(tg.json.result.targets.map(x => x.target), [(await a.me()).pid]);
  assert.equal((await v.act('/v1/attack', { target: other.pid, b: 0 })).json.error, 'wrong_target');
  assert.equal((await v.act('/v1/revenge', { token: tok })).status, 404, 'Token nur einmal');
  const hit = await v.act('/v1/attack', { target: (await a.me()).pid, b: 0 });
  assert.equal(hit.status, 200, hit.text);
  assert.equal(hit.json.result.revenge, true);
  // Ablauf: neues Token, 24 h + 1 später
  const tok2 = (await a.call('GET', '/v1/history')).json.result.history[0].revengeToken;
  assert.match(tok2, /^[a-z0-9]{24}$/);
  s.now.add(24 * HOUR + 1);
  assert.equal((await a.act('/v1/revenge', { token: tok2 })).status, 410);
});
