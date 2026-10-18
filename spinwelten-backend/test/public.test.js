'use strict';
const H = require('./helpers');
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { eventAt, IDS } = require('../src/events');

let s;
before(async () => { s = await H.start(); });
after(async () => { await s.stop(); });

test('Räume: anonym erlaubt, Heartbeat, TTL 90 s, 1 je uid, Code-Kollision, ohne uid', async () => {
  const anon = H.token('room-anon', { anonymous: true, nowMs: s.now() });
  const r = await s.call('POST', '/v1/rooms/publish', { code: 'ABC23', mode: 'race', players: 1, max: 4 }, anon);
  assert.equal(r.status, 200, r.text);
  for (const bad of [{ code: 'ABCD1', mode: 'race', players: 1, max: 4 }, { code: 'abc23', mode: 'race', players: 1, max: 4 }, { code: 'ABC23', mode: 'x', players: 1, max: 4 },
    { code: 'ABC23', mode: 'race', players: 5, max: 4 }, { code: 'ABC23', mode: 'race', players: 1, max: 9 }, { code: 'ABC23', mode: 'race', players: 0, max: 2 }])
    assert.equal((await s.call('POST', '/v1/rooms/publish', bad, anon)).status, 400, JSON.stringify(bad));
  const other = H.token('room-other', { nowMs: s.now() });
  assert.equal((await s.call('POST', '/v1/rooms/publish', { code: 'ABC23', mode: 'duel', players: 1, max: 2 }, other)).json.error, 'code_taken');
  // zweites publish derselben uid ersetzt
  await s.call('POST', '/v1/rooms/publish', { code: 'XYZ45', mode: 'coop', players: 2, max: 4 }, anon);
  let list = (await s.call('GET', '/v1/rooms', undefined, other)).json.result.rooms;
  assert.equal(list.length, 1); assert.equal(list[0].code, 'XYZ45');
  assert.deepEqual(Object.keys(list[0]).sort(), ['age', 'code', 'max', 'mode', 'players']);
  assert.ok(!JSON.stringify(list).includes('room-anon'));
  assert.equal((await s.call('GET', '/v1/rooms/quick?mode=coop', undefined, other)).json.result.room.code, 'XYZ45');
  assert.equal((await s.call('GET', '/v1/rooms/quick?mode=duel', undefined, other)).json.result.room, null);
  s.now.add(60e3);
  await s.call('POST', '/v1/rooms/publish', { code: 'XYZ45', mode: 'coop', players: 4, max: 4 }, anon);   // Heartbeat, jetzt voll
  assert.equal((await s.call('GET', '/v1/rooms/quick?mode=coop', undefined, other)).json.result.room, null);
  s.now.add(60e3);
  assert.equal((await s.call('GET', '/v1/rooms', undefined, other)).json.result.rooms.length, 1);
  s.now.add(31e3);
  assert.equal((await s.call('GET', '/v1/rooms', undefined, other)).json.result.rooms.length, 0);
  assert.equal((await s.call('GET', '/v1/rooms')).status, 401);
  // unpublish
  await s.call('POST', '/v1/rooms/publish', { code: 'QQQ22', mode: 'duel', players: 1, max: 2 }, other);
  assert.equal((await s.call('POST', '/v1/rooms/unpublish', {}, other)).json.result.removed, true);
  assert.equal((await s.call('GET', '/v1/rooms', undefined, other)).json.result.rooms.length, 0);
});

test('Räume: max. 200 gesamt', async () => {
  const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const code = i => 'R' + A[Math.floor(i / A.length) % A.length] + A[i % A.length] + 'ZZ';
  for (let i = 0; i < 200; i++) {
    const r = await s.direct('POST', '/v1/rooms/publish', { code: code(i), mode: 'race', players: 1, max: 8 }, H.token('room-' + i, { nowMs: s.now() }));
    assert.equal(r.status, 200, r.text);
  }
  const full = await s.direct('POST', '/v1/rooms/publish', { code: 'FUZZ2', mode: 'race', players: 1, max: 8 }, H.token('room-x', { nowMs: s.now() }));
  assert.equal(full.status, 503); assert.equal(full.json.error, 'rooms_full');
  // Heartbeat bestehender Räume geht weiter
  assert.equal((await s.direct('POST', '/v1/rooms/publish', { code: code(5), mode: 'race', players: 2, max: 8 }, H.token('room-5', { nowMs: s.now() }))).status, 200);
  s.now.add(91e3);
  assert.equal((await s.direct('POST', '/v1/rooms/publish', { code: 'FUZZ2', mode: 'race', players: 1, max: 8 }, H.token('room-x', { nowMs: s.now() }))).status, 200);
});

test('Rangliste: Inseln und Münzen, eigener Rang, nur Anzeigename', async () => {
  const a = await s.player('lb-a', 'Alpha'), b = await s.player('lb-b', 'Beta'), c = await s.player('lb-c', 'Gamma');
  await a.patch({ islandsDone: 2, island: 3, stages: [1, 1, 0, 0, 0] });
  await b.patch({ islandsDone: 4, island: 5, stages: [0, 0, 0, 0, 0] });
  await c.patch({ coins: 1e6 });
  await c.act('/v1/build', { b: 0 });   // invalidiert Zwischenspeicher
  const r = await a.call('GET', '/v1/leaderboard?kind=islands');
  assert.equal(r.status, 200);
  const top = r.json.result.top;
  assert.equal(top[0].name, 'Beta'); assert.equal(top[0].value, 4000);
  assert.equal(top[1].name, 'Alpha'); assert.equal(top[1].value, 2002);
  assert.equal(r.json.result.me.rank, 2);
  assert.deepEqual(Object.keys(top[0]).sort(), ['name', 'rank', 'value']);
  // Münzen = verdiente Münzen (lifetime)
  await c.patch({ energy: 30 });
  for (let i = 0; i < 20; i++) await c.act('/v1/spin', { mult: 1 });
  s.now.add(31e3);
  const rc = await c.call('GET', '/v1/leaderboard?kind=coins');
  assert.equal(rc.json.result.me.value, (await c.me()).lifetimeCoins);
  assert.equal((await a.call('GET', '/v1/leaderboard?kind=xyz')).status, 400);
  const anon = await s.call('GET', '/v1/leaderboard', undefined, H.token('lb-anon', { anonymous: true, nowMs: s.now() }));
  assert.equal(anon.status, 200); assert.equal(anon.json.result.me, null);
});

test('Events: Rotation alle 3 Tage ab 2026-01-01 UTC', async () => {
  assert.equal(IDS.length, 12);
  assert.equal(eventAt(Date.UTC(2026, 0, 1)).id, 'bau_festival');
  assert.equal(eventAt(Date.UTC(2026, 0, 3, 23, 59)).id, 'bau_festival');
  assert.equal(eventAt(Date.UTC(2026, 0, 4)).id, 'sternenregen');
  assert.equal(eventAt(Date.UTC(2026, 0, 1) + 12 * 3 * 864e5).id, 'bau_festival');
  assert.equal(eventAt(Date.UTC(2026, 0, 1) + 11 * 3 * 864e5).id, 'team_expedition');
  assert.equal(eventAt(Date.UTC(2025, 11, 31)).id, 'team_expedition');
  const r = await s.call('GET', '/v1/events');
  assert.equal(r.status, 200);
  const cur = r.json.result.current;
  assert.equal(cur.id, eventAt(s.now()).id);
  assert.ok(Date.parse(cur.start) <= s.now() && s.now() < Date.parse(cur.end));
  assert.equal(Date.parse(cur.end) - Date.parse(cur.start), 3 * 864e5);
});

test('Health ohne Anmeldung', async () => {
  const r = await s.call('GET', '/v1/health');
  assert.equal(r.status, 200); assert.equal(r.json.ok, true); assert.equal(typeof r.json.version, 'string');
  assert.equal((await s.call('GET', '/v1/nichtda')).status, 404);
  assert.equal((await s.call('POST', '/v1/health', {})).status, 405);
});
