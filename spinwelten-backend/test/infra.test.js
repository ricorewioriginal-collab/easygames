'use strict';
const H = require('./helpers');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), path = require('path');
const { spawnSync } = require('child_process');
const { FileStorage, StorageError } = require('../src/storage');

test('Persistenz: Neustart lädt Zustand, nonce-Wiederholung nach Neustart bucht nicht', async () => {
  const dir = H.tmpDir(), now = H.clock();
  let s = await H.start({ dir, now });
  const p = await s.player('persist', 'Pia');
  const spin = await p.call('POST', '/v1/spin', { nonce: 'persist-nonce-1', mult: 1 });
  assert.equal(spin.status, 200);
  await p.patch({ coins: 1e6 });
  await p.act('/v1/build', { b: 2 });
  const before = await p.me();
  await s.stop();
  assert.ok(fs.existsSync(path.join(dir, 'state.json')));
  const audit = fs.readFileSync(path.join(dir, 'audit.jsonl'), 'utf8').trim().split('\n').map(l => JSON.parse(l));
  const b = audit.find(e => e.a === 'build');
  assert.equal(b.uid, 'persist'); assert.equal(typeof b.n, 'string'); assert.ok(b.d.persist.coins < 0); assert.equal(typeof b.t, 'number');
  assert.ok(audit.some(e => e.a === 'spin' && e.n === 'persist-nonce-1'));

  s = await H.start({ dir, now });
  const p2 = { call: (m, u, body) => s.call(m, u, body, H.token('persist', { name: 'Pia', nowMs: now() })) };
  const after = (await p2.call('GET', '/v1/me')).json.state;
  assert.deepEqual(after, before);
  const again = await p2.call('POST', '/v1/spin', { nonce: 'persist-nonce-1', mult: 1 });
  assert.equal(again.text, spin.text);
  assert.equal((await p2.call('GET', '/v1/me')).json.state.stats.spins, before.stats.spins);
  await s.stop();
});

test('Korrupte Datei → Start verweigert, Datei bleibt unverändert', () => {
  const dir = H.tmpDir();
  fs.writeFileSync(path.join(dir, 'state.json'), '{"v":1,"accounts":{', 'utf8');
  assert.throws(() => new FileStorage({ dir }).open(), e => e instanceof StorageError && /beschädigt/.test(e.message));
  assert.equal(fs.readFileSync(path.join(dir, 'state.json'), 'utf8'), '{"v":1,"accounts":{');
  const r = spawnSync(process.execPath, [path.join(__dirname, '..', 'src', 'server.js')], {
    env: Object.assign({}, process.env, { AUTH_MODE: 'test', NODE_ENV: 'test', PORT: '0', DATA_DIR: dir }), encoding: 'utf8', timeout: 10000
  });
  assert.equal(r.status, 1); assert.match(r.stderr, /Start verweigert.*beschädigt/);
  // fehlende state.json, aber Sicherung vorhanden → ebenfalls verweigert
  const dir2 = H.tmpDir();
  fs.writeFileSync(path.join(dir2, 'state.json.bak'), '{}');
  assert.throws(() => new FileStorage({ dir: dir2 }).open(), /Sicherung/);
  // falsches Schema
  const dir3 = H.tmpDir();
  fs.writeFileSync(path.join(dir3, 'state.json'), '{"v":99}');
  assert.throws(() => new FileStorage({ dir: dir3 }).open(), /unbekanntes Format/);
});

test('CORS: nur erlaubte Origins', async () => {
  const s = await H.start();
  const ok = await s.call('OPTIONS', '/v1/spin', undefined, null, { Origin: 'https://ricorewioriginal-collab.github.io', 'Access-Control-Request-Method': 'POST' });
  assert.equal(ok.status, 204);
  assert.equal(ok.headers.get('access-control-allow-origin'), 'https://ricorewioriginal-collab.github.io');
  assert.match(ok.headers.get('access-control-allow-headers'), /Authorization/);
  const bad = await s.call('OPTIONS', '/v1/spin', undefined, null, { Origin: 'https://boese.example' });
  assert.equal(bad.status, 403); assert.equal(bad.headers.get('access-control-allow-origin'), null);
  const badGet = await s.call('GET', '/v1/health', undefined, null, { Origin: 'https://boese.example' });
  assert.equal(badGet.status, 403);
  const get = await s.call('GET', '/v1/health', undefined, null, { Origin: 'http://localhost:8080' });
  assert.equal(get.status, 200); assert.equal(get.headers.get('access-control-allow-origin'), 'http://localhost:8080');
  const none = await s.call('GET', '/v1/health');
  assert.equal(none.status, 200); assert.equal(none.headers.get('access-control-allow-origin'), null);
  await s.stop();
});

test('JSON-Limit 16 KB, kaputtes JSON, unbekannte Felder ignoriert', async () => {
  const s = await H.start();
  const p = await s.player('limits', 'Lima');
  const big = await p.call('POST', '/v1/spin', JSON.stringify({ nonce: 'abcdefgh1', mult: 1, pad: 'x'.repeat(17000) }));
  assert.equal(big.status, 413);
  assert.equal((await p.call('POST', '/v1/spin', '{kaputt')).json.error, 'bad_json');
  assert.equal((await p.call('POST', '/v1/spin', '[1,2]')).json.error, 'bad_json');
  const r = await p.act('/v1/spin', { mult: 1, coins: 999999999, uid: 'other', __proto__: { x: 1 } });
  assert.equal(r.status, 200);
  assert.ok(r.json.state.coins < 999999999);
  await s.stop();
});

test('Rate-Limit: Spin 3/s → 429 mit Retry-After', async () => {
  const s = await H.start({ rate: { spin: [3, 3], action: [10, 20], ip: [1000, 1000] } });
  const p = await s.player('rl', 'Ralf');
  const codes = [];
  for (let i = 0; i < 6; i++) codes.push(await p.act('/v1/spin', { mult: 1 }));
  const limited = codes.filter(r => r.status === 429);
  assert.ok(limited.length >= 3, codes.map(r => r.status).join());
  assert.equal(limited[0].json.error, 'rate_limited');
  assert.ok(Number(limited[0].headers.get('retry-after')) >= 1);
  s.now.add(1000);
  assert.equal((await p.act('/v1/spin', { mult: 1 })).status, 200);
  await s.stop();
  // je IP
  const s2 = await H.start({ rate: { spin: [100, 100], action: [100, 100], ip: [2, 2] } });
  const t = H.token('ipuser', { nowMs: s2.now() });
  const rs = [];
  for (let i = 0; i < 4; i++) rs.push((await s2.call('GET', '/v1/rooms', undefined, t)).status);
  assert.deepEqual(rs, [200, 200, 429, 429]);
  await s2.stop();
});

test('Konto löschen: weg aus Rangliste, Verlauf bei anderen anonymisiert', async () => {
  const s = await H.start();
  const v = await s.player('del-v', 'Viktor');
  await v.patch({ createdAgoMs: 25 * 36e5, stages: [3, 3, 0, 0, 0] });
  const a = await s.player('del-a', 'Zoran');
  await a.patch({ pending: { kind: 'attack', mult: 1 } });
  const apid = (await a.me()).pid;
  assert.equal((await a.act('/v1/attack', { target: (await v.me()).pid, b: 0 })).status, 200);
  const d = await a.call('DELETE', '/v1/account');
  assert.equal(d.status, 200); assert.equal(d.json.result.deleted, true);
  assert.equal((await a.call('GET', '/v1/me')).json.error, 'no_account');
  const h = (await v.call('GET', '/v1/history')).json.result.history[0];
  assert.equal(h.name, 'Gelöschter Spieler'); assert.equal(h.pid, null); assert.equal(h.revengeToken, null);
  const lb = (await v.call('GET', '/v1/leaderboard')).json.result.top;
  assert.ok(!lb.some(x => x.name === 'Zoran'));
  assert.ok(!JSON.stringify(s.store.data).includes('del-a'), 'keine Reste der uid im Zustand');
  assert.ok(!JSON.stringify(s.store.data).includes(apid), 'keine Reste der pid im Zustand');
  assert.equal((await a.call('DELETE', '/v1/account')).json.result.deleted, false);
  await s.stop();
});

test('Testhilfe existiert nur im Testmodus', async () => {
  const s = await H.start({ config: { testMode: false } });
  const r = await s.call('POST', '/v1/test/patch', { coins: 1 }, H.token('x', { nowMs: s.now() }));
  assert.equal(r.status, 404);
  await s.stop();
});
