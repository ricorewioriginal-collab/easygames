'use strict';
const H = require('./helpers');
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('child_process');
const path = require('path');
const { loadConfig } = require('../src/config');

let s;
before(async () => { s = await H.start(); });
after(async () => { await s.stop(); });

const me = tok => s.call('GET', '/v1/me', undefined, tok);

test('gültiges Token → Konto anlegen und lesen', async () => {
  const tok = H.token('auth-ok', { name: 'Ada', nowMs: s.now() });
  const r = await s.call('POST', '/v1/account/init', {}, tok);
  assert.equal(r.status, 200); assert.equal(r.json.ok, true); assert.equal(r.json.result.created, true);
  assert.equal(r.json.state.name, 'Ada');
  assert.equal(r.json.state.coins, 5 * s.E.base(1, 0));
  assert.equal(r.json.state.energy, 50);
  assert.equal((await me(tok)).status, 200);
  const again = await s.call('POST', '/v1/account/init', {}, tok);
  assert.equal(again.json.result.created, false);
  assert.ok(!JSON.stringify(r.json).includes('auth-ok'), 'echte uid darf nicht in der Antwort stehen');
});

test('ohne Token → 401', async () => {
  const r = await s.call('GET', '/v1/me');
  assert.equal(r.status, 401); assert.equal(r.json.error, 'auth_required');
});

test('falsche Signatur → 401', async () => {
  const r = await me(H.token('auth-ok', { wrongKey: true, nowMs: s.now() }));
  assert.equal(r.status, 401); assert.equal(r.json.error, 'invalid_token');
});

test('verändertes Token (Payload getauscht) → 401', async () => {
  const good = H.token('auth-ok', { nowMs: s.now() }).split('.');
  const evil = H.token('someone-else', { nowMs: s.now() }).split('.');
  const r = await me(good[0] + '.' + evil[1] + '.' + good[2]);
  assert.equal(r.status, 401);
});

test('abgelaufen → 401 token_expired', async () => {
  const r = await me(H.token('auth-ok', { expIn: -5, nowMs: s.now() }));
  assert.equal(r.status, 401); assert.equal(r.json.error, 'token_expired');
});

test('falsches aud / iss / kid → 401', async () => {
  for (const o of [{ aud: 'anderes-projekt' }, { iss: 'anderes-projekt' }, { kid: 'unbekannt' }]) {
    const r = await me(H.token('auth-ok', Object.assign({ nowMs: s.now() }, o)));
    assert.equal(r.status, 401, JSON.stringify(o)); assert.equal(r.json.error, 'invalid_token');
  }
});

test('iat in der Zukunft / alg none → 401', async () => {
  const t = Math.floor(s.now() / 1000);
  const base = { iss: 'https://securetoken.google.com/' + H.PROJECT, aud: H.PROJECT, sub: 'x', exp: t + 3600, auth_time: t };
  assert.equal((await me(H.sign(Object.assign({ iat: t + 3600 }, base)))).status, 401);
  const none = Buffer.from(JSON.stringify({ alg: 'none', kid: H.KID })).toString('base64url') + '.' + Buffer.from(JSON.stringify(Object.assign({ iat: t }, base))).toString('base64url') + '.x';
  assert.equal((await me(none)).status, 401);
});

test('anonym: Konto-Endpunkte 403, Raumliste erlaubt', async () => {
  const tok = H.token('anon-1', { anonymous: true, nowMs: s.now() });
  for (const [m, p] of [['POST', '/v1/account/init'], ['GET', '/v1/me'], ['POST', '/v1/spin'], ['GET', '/v1/targets'], ['DELETE', '/v1/account']]) {
    const r = await s.call(m, p, m === 'POST' ? { nonce: 'abcdefgh123', mult: 1 } : undefined, tok);
    assert.equal(r.status, 403, p); assert.equal(r.json.error, 'anonymous_not_allowed');
  }
  const r = await s.call('GET', '/v1/rooms', undefined, tok);
  assert.equal(r.status, 200);
});

test('Anzeigename nur aus Token, gefiltert, max. 20 Zeichen; sonst Hüter-XXXX', async () => {
  const a = await s.call('POST', '/v1/account/init', {}, H.token('n1', { name: '<script>alert(1)</script> Bob!!! der Große Baumeister', nowMs: s.now() }));
  assert.ok(a.json.state.name.length <= 20);
  assert.match(a.json.state.name, /^[\p{L}\p{N} ._-]+$/u);
  const b = await s.call('POST', '/v1/account/init', { displayName: 'Hacker' }, H.token('n2', { nowMs: s.now() }));
  assert.match(b.json.state.name, /^Hüter-[0-9A-F]{4}$/);
});

test('AUTH_MODE=test ohne NODE_ENV=test → Start verweigert', () => {
  assert.throws(() => loadConfig({ AUTH_MODE: 'test', NODE_ENV: 'production' }), /nur zusammen mit NODE_ENV=test/);
  assert.throws(() => loadConfig({ AUTH_MODE: 'firebase' }), /TARGET_SECRET fehlt/);
  assert.throws(() => loadConfig({ AUTH_MODE: 'magic', NODE_ENV: 'test' }), /AUTH_MODE/);
  const r = spawnSync(process.execPath, [path.join(__dirname, '..', 'src', 'server.js')], {
    env: Object.assign({}, process.env, { AUTH_MODE: 'test', NODE_ENV: 'production', PORT: '0', DATA_DIR: H.tmpDir() }), encoding: 'utf8', timeout: 10000
  });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /Start verweigert/);
});
