'use strict';
const H = require('./helpers');
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), path = require('path'), vm = require('vm');

const GAME = path.join(__dirname, '..', '..', 'spinwelten', 'js');
let s, API, win, store = {};

function loadClient() {
  win = globalThis.window = {
    SPINWELTEN_API_BASE: '',
    localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } },
    AnMaChaCloud: null
  };
  globalThis.SW = {};
  vm.runInThisContext(fs.readFileSync(path.join(GAME, 'core', 'rng.js'), 'utf8'));
  vm.runInThisContext(fs.readFileSync(path.join(GAME, 'net', 'online-api.js'), 'utf8'));
  return globalThis.SW.OnlineAPI;
}
const login = uid => { win.AnMaChaCloud = { account: async () => ({ uid, name: 'Klara', token: H.token(uid, { name: 'Klara', nowMs: s.now() }), project: H.PROJECT }) }; };

before(async () => { s = await H.start(); API = loadClient(); });
after(async () => { await s.stop(); delete globalThis.window; });

test('ohne Adresse: configured() false, status off, Aufrufe → not-configured', async () => {
  assert.equal(API.configured(), false);
  assert.deepEqual(await API.status(), { state: 'off' });
  await assert.rejects(API.me(), e => e.code === 'not-configured');
  for (const bad of ['http://boese.example', 'ftp://x', 'javascript:alert(1)', 'https://u:p@x.de', 'nix'])
    assert.equal(API.normalizeBase(bad), '', bad);
  assert.equal(API.normalizeBase('https://api.example.org/'), 'https://api.example.org');
  assert.equal(API.normalizeBase('http://127.0.0.1:9/'), 'http://127.0.0.1:9');
});

test('Adresse aus localStorage oder window, status ok / needs-login / unreachable', async () => {
  store.spinweltenSettings = JSON.stringify({ apiBase: 'http://127.0.0.1:1' });
  assert.equal(API.configured(), true);
  assert.equal((await API.status()).state, 'unreachable');
  delete store.spinweltenSettings;
  win.SPINWELTEN_API_BASE = s.base;
  assert.equal(API.base(), s.base);
  assert.equal((await API.status()).state, 'needs-login');
  await assert.rejects(API.me(), e => e.code === 'needs-login');
  login('client-1');
  const st = await API.status();
  assert.equal(st.state, 'ok'); assert.equal(st.version, '1.0.0');
});

test('Konto, Spin, Bauen, Fehlercodes, Events, Räume', async () => {
  login('client-2');
  const init = await API.init();
  assert.equal(init.ok, true); assert.equal(init.state.name, 'Klara');
  const sp = await API.spin(1);
  assert.equal(sp.result.ids.length, 3);
  await assert.rejects(API.spin(2), e => e.code === 'mult_locked' && e.status === 400);
  await assert.rejects(API.attack('0'.repeat(24), 0), e => e.code === 'no_pending');
  const ev = await API.events();
  assert.ok(ev.result.current.id);
  assert.equal((await API.teams.names()).result.names.length, 40);
  assert.ok(Array.isArray((await API.leaderboard('coins')).result.top));
  assert.equal((await API.rooms.publish('HAHA2', 'duel', 1, 2)).ok, true);
  assert.equal((await API.rooms.quick('duel')).result.room.code, 'HAHA2');
  assert.equal((await API.rooms.unpublish()).result.removed, true);
  assert.deepEqual((await API.trades.list()).result.incoming, []);
  assert.equal((await API.history()).result.history.length, 0);
  assert.equal((await API.teams.mine()).result.team, null);
});

test('Netz-Wiederholung mit derselben nonce → keine Doppelbuchung', async () => {
  login('client-3');
  await API.init();
  const e0 = (await API.me()).state.energy;
  const realFetch = globalThis.fetch;
  const seen = [];
  let calls = 0;
  globalThis.fetch = async (url, o) => {
    if (o && o.method === 'POST') seen.push(JSON.parse(o.body).nonce);
    const r = await realFetch(url, o);
    if (o && o.method === 'POST' && calls++ < 2) throw new TypeError('Antwort unterwegs verloren');   // Server hat gebucht, Antwort kam nicht an
    return r;
  };
  try {
    const r = await API.spin(1);
    assert.equal(r.ok, true);
  } finally { globalThis.fetch = realFetch; }
  assert.equal(seen.length, 3); assert.equal(new Set(seen).size, 1, 'immer dieselbe nonce');
  const st = (await API.me()).state;
  assert.equal(st.stats.spins, 1, 'nur einmal gebucht');
  // dauerhafter Netzfehler → Error mit code network
  globalThis.fetch = async () => { throw new TypeError('offline'); };
  try { await assert.rejects(API.me(), e => e.code === 'network'); } finally { globalThis.fetch = realFetch; }
  void e0;
});

test('Konto löschen über Client', async () => {
  login('client-4');
  await API.init();
  assert.equal((await API.deleteAccount()).result.deleted, true);
  await assert.rejects(API.me(), e => e.code === 'no_account' && e.status === 404);
});
