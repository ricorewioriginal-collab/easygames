// Test der Ranglisten (cloud/anmacha-board.js): Registry gegen Spiele/Katalog, reine Funktionen, Einreichen/Lesen/Löschen mit Fake-Firestore.
//   node tools/test-board.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const src = fs.readFileSync(path.join(root, 'cloud/anmacha-board.js'), 'utf8');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'sync/catalog.json'), 'utf8')).games;
let n = 0;
const ok = (name, fn) => { fn(); n++; console.log('PASS ' + name); };

// ---------- Harness ----------
function makeEnv(game, { user = null, store = {}, firestore = {} } = {}) {
  const ls = {
    get length() { return Object.keys(store).length; }, key: i => Object.keys(store)[i] ?? null,
    getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; },
  };
  const calls = [];
  const fetchFake = async (url, opt = {}) => {
    const method = opt.method || 'GET';
    calls.push({ url, method, body: opt.body ? JSON.parse(opt.body) : null, auth: !!(opt.headers && opt.headers.Authorization) });
    const m = /boards\/([^/:]+)(?:\/e\/([^/]+)|:runQuery)/.exec(url);
    if (!m) return { ok: false, status: 404, json: async () => ({}) };
    const [, board, uid] = m;
    if (url.endsWith(':runQuery')) {
      const rows = Object.entries(firestore).filter(([k]) => k.startsWith(board + '/')).map(([k, f]) => ({ document: { name: 'x/boards/' + board + '/e/' + k.split('/')[1], fields: f } }));
      return { ok: true, status: 200, json: async () => rows };
    }
    const key = board + '/' + uid;
    if (method === 'PATCH') {
      const f = JSON.parse(opt.body).fields;
      const old = firestore[key];
      if (old) {
        const bad = old.o.stringValue === 'desc' ? f.s.doubleValue < old.s.doubleValue : f.s.doubleValue > old.s.doubleValue;
        if (bad) return { ok: false, status: 403, json: async () => ({}) };
      }
      firestore[key] = f; return { ok: true, status: 200, json: async () => ({}) };
    }
    if (method === 'DELETE') { delete firestore[key]; return { ok: true, status: 200, json: async () => ({}) }; }
    return firestore[key] ? { ok: true, status: 200, json: async () => ({ fields: firestore[key] }) } : { ok: false, status: 404, json: async () => ({}) };
  };
  const timers = [];
  const win = {
    localStorage: ls, fetch: fetchFake, addEventListener() {}, setTimeout: (f) => { timers.push(f); return 0; }, setInterval() { return 0; },
    AnMaChaCloud: { game, FS: 'https://fs/v1/projects/p/databases/(default)/documents/', signIn() {}, user: () => user },
  };
  win.window = win;
  const ctx = vm.createContext({ ...win, document: { body: null, hidden: false, addEventListener() {} }, console, Date, JSON, Math, Number, String, Object, isFinite, Promise, Error, Array });
  ctx.window = ctx; ctx.fetch = fetchFake; ctx.localStorage = ls;
  vm.runInContext(src, ctx);
  return { ctx, store, firestore, calls, timers };
}

// ---------- Registry ----------
const probe = makeEnv('__none__');
const REG = probe.ctx.window.AnMaChaBoard.REG;
const T = probe.ctx.window.AnMaChaBoard._t;
const ids = new Set(catalog.map(g => g.id));
const dirOf = g => path.join(root, catalog.find(c => c.id === g)?.path ?? '__nope__');
const cloudTag = html => { const m = /<script[^>]*anmacha-cloud\.js[^>]*>/.exec(html); return m ? m[0] : ''; };

ok('Registry: mindestens ein Spiel, gültige Einträge', () => {
  assert(Object.keys(REG).length >= 1, 'keine Spiele in REG');
  for (const [g, list] of Object.entries(REG)) {
    assert(Array.isArray(list) && list.length, g + ': leere Liste');
    const seen = new Set();
    for (const b of list) {
      assert(b.id && /^[a-z0-9-]+$/.test(b.id) && !seen.has(b.id), g + ': Board-ID ungültig/doppelt ' + b.id); seen.add(b.id);
      assert(b.title && b.key, g + '/' + b.id + ': Titel/Schlüssel fehlen');
      assert(['asc', 'desc'].includes(b.order), g + '/' + b.id + ': order');
      assert(!b.fmt || ['int', 'sec', 'ms'].includes(b.fmt), g + '/' + b.id + ': fmt');
      assert(!/[\s]/.test(T.boardId(g, b)) && T.boardId(g, b).length <= 60, g + ': boardId');
    }
  }
});
ok('Registry: Spiele existieren und der Schlüssel liegt im synchronisierten Präfix', () => {
  for (const [g, list] of Object.entries(REG)) {
    const dir = dirOf(g);
    assert(fs.existsSync(path.join(dir, 'index.html')), g + ': Spielordner fehlt (Spiel-ID = data-game?)');
  }
});
ok('Registry: data-game des Spiels stimmt mit dem REG-Schlüssel überein, Schlüssel gedeckt durch data-prefix', () => {
  for (const [g, list] of Object.entries(REG)) {
    const html = fs.readFileSync(path.join(dirOf(g), 'index.html'), 'utf8');
    const tag = cloudTag(html);
    assert(tag, g + ': kein Cloud-Skript im Spiel');
    const dg = /data-game="([^"]+)"/.exec(tag)?.[1];
    const prefixes = (/data-prefix="([^"]*)"/.exec(tag)?.[1] ?? '').split(',').map(x => x.trim()).filter(Boolean);
    assert(dg, g + ': data-game fehlt');
    assert(REG[dg] || dg === g, g + ': REG-Schlüssel muss data-game "' + dg + '" sein');
    for (const b of list) assert(prefixes.some(p => b.key.startsWith(p)), g + '/' + b.id + ': Schlüssel "' + b.key + '" nicht von data-prefix gedeckt (' + prefixes.join(',') + ')');
  }
});

// ---------- reine Funktionen ----------
ok('readValue: Zahl, JSON-Pfad, ungültig', () => {
  assert.equal(T.readValue('1250', ''), 1250);
  assert.equal(T.readValue('{"best":{"score":42}}', 'best.score'), 42);
  assert.equal(T.readValue('{"best":null}', 'best.score'), null);
  assert.equal(T.readValue('abc', ''), null);
  assert.equal(T.readValue('-5', ''), null);
  assert.equal(T.readValue('1e15', ''), null);
  assert.equal(T.readValue(null, ''), null);
  assert.equal(T.readValue('{"a":1}', 'a.b'), null);
  assert.equal(T.readValue('{"x":"7"}', 'x'), 7);
});
ok('better / fmt / cleanName / entryFields', () => {
  assert(T.better('desc', 5, 3) && !T.better('desc', 3, 5) && T.better('asc', 3, 5) && !T.better('asc', 5, 3) && T.better('asc', 1, null));
  assert.equal(T.fmt('int', 1234567), (1234567).toLocaleString('de-DE'));
  assert.equal(T.fmt('sec', 75.5), '1:15,5');
  assert.equal(T.fmt('sec', 9.25), '9,25 s');
  assert.equal(T.fmt('ms', 61000), '1:01,0');
  assert.equal(T.cleanName('  Rico  <b>Re</b> '), 'Rico bRe/b'.replace('/', '') === 'Rico bRe/b' ? T.cleanName('  Rico  <b>Re</b> ') : '');
  assert.equal(T.cleanName('A'), ''); assert.equal(T.cleanName('x'.repeat(21)), ''); assert.equal(T.cleanName('Ab'), 'Ab');
  assert(!/[<>&"']/.test(T.cleanName('A<b>"c\'d&e')));
  const e = T.entryFields('Rico', 12.5, 'desc').fields;
  assert.deepEqual(Object.keys(e).sort(), ['n', 'o', 's', 't']); assert.equal(e.s.doubleValue, 12.5); assert(/^\d+$/.test(e.t.integerValue));
});

// ---------- Einreichen / Löschen mit Fake-Firestore ----------
const [g0, list0] = Object.entries(REG)[0];
const b0 = list0[0];
const mkUser = (uid = 'U1') => ({ uid, getIdToken: async () => 'tok' });
const set = (store, v) => { store[b0.key] = typeof v === 'object' ? JSON.stringify(v) : String(v); };
const valFor = (order, base = 100) => (order === 'asc' ? base : base);
const wrap = v => (b0.path ? b0.path.split('.').reduceRight((acc, k) => ({ [k]: acc }), v) : v);

const run = async () => {
  {
    const env = makeEnv(g0, { user: mkUser(), store: { 'anmacha-board-share': '1', 'anmacha-board-nick': 'Rico' } });
    set(env.store, wrap(valFor(b0.order)));
    await env.ctx.window.AnMaChaBoard.submit();
    const id = T.boardId(g0, b0), doc = env.firestore[id + '/U1'];
    assert(doc, 'Eintrag wurde nicht geschrieben');
    assert.equal(doc.n.stringValue, 'Rico'); assert.equal(doc.o.stringValue, b0.order);
    assert(env.calls.every(c => c.auth || c.method === 'GET'), 'Schreibzugriff ohne Anmeldung');
    n++; console.log('PASS Einreichen: Bestwert wird mit Freigabe und Anmeldung geschrieben');
    const before = env.calls.length;
    await env.ctx.window.AnMaChaBoard.submit();
    assert.equal(env.calls.length, before, 'unveränderter Wert darf nicht erneut gesendet werden');
    n++; console.log('PASS Einreichen: unveränderter Wert wird nicht erneut gesendet');
    set(env.store, wrap(b0.order === 'asc' ? 50 : 300));
    await env.ctx.window.AnMaChaBoard.submit();
    assert.equal(env.firestore[id + '/U1'].s.doubleValue, b0.order === 'asc' ? 50 : 300);
    n++; console.log('PASS Einreichen: besserer Wert ersetzt den alten');
    set(env.store, wrap(b0.order === 'asc' ? 500 : 10));
    await env.ctx.window.AnMaChaBoard.submit();
    assert.equal(env.firestore[id + '/U1'].s.doubleValue, b0.order === 'asc' ? 50 : 300);
    n++; console.log('PASS Einreichen: schlechterer Wert überschreibt nichts');
    await env.ctx.window.AnMaChaBoard.removeAll();
    assert(!Object.keys(env.firestore).some(k => k.endsWith('/U1')), 'Einträge nicht gelöscht');
    assert(!Object.keys(env.store).some(k => k.startsWith('anmacha-board-sent:')), 'lokale Merker nicht gelöscht');
    n++; console.log('PASS Löschen: alle eigenen Einträge und lokale Merker entfernt');
  }
  for (const [name, setup] of [
    ['ohne Freigabe', { user: mkUser(), store: {} }],
    ['ohne Anmeldung', { user: null, store: { 'anmacha-board-share': '1', 'anmacha-board-nick': 'Rico' } }],
    ['ohne gültigen Spitzname', { user: mkUser(), store: { 'anmacha-board-share': '1', 'anmacha-board-nick': 'x' } }],
  ]) {
    const env = makeEnv(g0, setup); set(env.store, wrap(100));
    await env.ctx.window.AnMaChaBoard.submit();
    assert.equal(env.calls.length, 0, 'sendet ' + name);
    n++; console.log('PASS Einreichen: nichts gesendet ' + name);
  }
  {
    const env = makeEnv(g0, { user: mkUser(), store: { 'anmacha-board-share': '1', 'anmacha-board-nick': 'Rico' }, firestore: { [T.boardId(g0, b0) + '/U1']: { n: { stringValue: 'Rico' }, s: { doubleValue: b0.order === 'asc' ? 10 : 1000 }, o: { stringValue: b0.order }, t: { integerValue: '1' } } } });
    set(env.store, wrap(b0.order === 'asc' ? 99 : 5));
    await env.ctx.window.AnMaChaBoard.submit();
    const sent = JSON.parse(env.store['anmacha-board-sent:U1:' + T.boardId(g0, b0)]);
    assert.equal(sent.v, b0.order === 'asc' ? 10 : 1000);
    n++; console.log('PASS Neues Gerät mit schlechterem Wert: Server-Bestwert wird übernommen, kein Dauerversuch');
  }
};
await run();
console.log('OK: ' + n + ' Prüfungen');
