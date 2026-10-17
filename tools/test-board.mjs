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
function makeEnv(game, { user = null, store = {}, firestore = {}, prefix = '' } = {}) {
  const ls = {
    get length() { return Object.keys(store).length; }, key: i => Object.keys(store)[i] ?? null,
    getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; },
  };
  const calls = [];
  const fetchFake = async (url, opt = {}) => {
    const method = opt.method || 'GET';
    calls.push({ url, method, body: opt.body ? JSON.parse(opt.body) : null, auth: !!(opt.headers && opt.headers.Authorization) });
    const pm = /users\/([^/]+)\/saves\/__board/.exec(url);
    if (pm) {
      const key = 'profile/' + pm[1];
      if (method === 'PATCH') { firestore[key] = JSON.parse(opt.body).fields; return { ok: true, status: 200, json: async () => ({}) }; }
      return firestore[key] ? { ok: true, status: 200, json: async () => ({ fields: firestore[key] }) } : { ok: false, status: 404, json: async () => ({}) };
    }
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
    AnMaChaCloud: { game, FS: 'https://fs/v1/projects/p/databases/(default)/documents/', signIn() {}, user: () => user, mine: k => !!prefix && k.startsWith(prefix) },
  };
  win.window = win;
  const ctx = vm.createContext({ ...win, location: { search: '', hostname: 'localhost' }, navigator: { userAgent: 'test' }, document: { body: { appendChild() { throw new Error('UI im Spiel'); } }, createElement() { throw new Error('UI im Spiel'); }, hidden: false, addEventListener() {} }, console, Date, JSON, Math, Number, String, Object, isFinite, Promise, Error, Array });
  ctx.window = ctx; ctx.fetch = fetchFake; ctx.localStorage = ls;
  vm.runInContext(src, ctx);
  return { ctx, store, firestore, calls, timers };
}

// ---------- Registry ----------
const probe = makeEnv('__none__');
const REG = probe.ctx.window.AnMaChaBoard.REG;
const T = probe.ctx.window.AnMaChaBoard._t;
const ids = new Set(catalog.map(g => g.id));
const cloudTag = html => { const m = /<script[^>]*anmacha-cloud\.js[^>]*>/.exec(html); return m ? m[0] : ''; };

ok('Registry: mindestens ein Spiel, gültige Einträge', () => {
  assert(Object.keys(REG).length >= 1, 'keine Spiele in REG');
  for (const [g, list] of Object.entries(REG)) {
    assert(Array.isArray(list), g + ': keine Liste');
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
// data-game -> Spielordner und Cloud-Tags (Spiele mit gebautem Client haben den Tag in app/index.html bzw. client/index.html)
const games = new Map();
for (const g of catalog) {
  const dir = path.join(root, g.path);
  const stack = [dir]; const files = [];
  while (stack.length) {
    const d = stack.pop();
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      const f = path.join(d, e.name);
      if (e.isDirectory()) stack.push(f); else files.push(f);
    }
  }
  for (const f of files.filter(f => f.endsWith('index.html'))) {
    const tag = cloudTag(fs.readFileSync(f, 'utf8'));
    const dg = /data-game="([^"]+)"/.exec(tag)?.[1];
    if (dg && !games.has(dg)) games.set(dg, { id: g.id, dir, files, tag, html: f });
  }
}
const sourceText = files => files.filter(f => /\.(js|mjs|ts|html)$/.test(f) && fs.statSync(f).size < 6e6).map(f => fs.readFileSync(f, 'utf8')).join('\n');

ok('Registry: jedes Spiel hat ein Cloud-Skript mit passendem data-game, Schlüssel liegt im synchronisierten Präfix', () => {
  for (const [g, list] of Object.entries(REG)) {
    const info = games.get(g);
    assert(info, g + ': kein Spiel mit data-game="' + g + '" gefunden (REG-Schlüssel = data-game)');
    const prefixes = (/data-prefix="([^"]*)"/.exec(info.tag)?.[1] ?? '').split(',').map(x => x.trim()).filter(Boolean);
    for (const b of list.filter(b => !b.local)) assert(prefixes.some(p => b.key.startsWith(p)), g + '/' + b.id + ': Schlüssel "' + b.key + '" nicht von data-prefix gedeckt (' + prefixes.join(',') + ')');
  }
});
ok('Registry: Schlüsselnamen kommen im Spielcode vor (Tippfehler-Schutz)', () => {
  for (const [g, list] of Object.entries(REG)) {
    const info = games.get(g), text = sourceText(info.files);
    const prefixes = (/data-prefix="([^"]*)"/.exec(info.tag)?.[1] ?? '').split(',').map(x => x.trim()).filter(Boolean);
    for (const b of list) {
      const literal = text.includes(b.key);
      const rest = prefixes.some(p => b.key.startsWith(p) && text.includes(b.key.slice(p.length)));   // Schlüssel aus Präfix + Namen gebaut (Vite-Spiele)
      assert(literal || rest, g + '/' + b.id + ': Schlüssel "' + b.key + '" im Spielcode nicht gefunden');
    }
  }
});
ok('Registry: Spiele mit abweichendem Skriptpfad (Kiko) laden das Board-Skript', () => {
  for (const [g, info] of games) {
    if (!REG[g]) continue;
    const src = /src="([^"]+)"/.exec(info.tag)?.[1] ?? '';
    const bs = /data-board-src="([^"]+)"/.exec(info.tag)?.[1];
    const base = bs ?? src.replace(/[^/?#]*([?#].*)?$/, 'anmacha-board.js');
    assert(fs.existsSync(path.join(path.dirname(info.html), base)), g + ': ' + base + ' existiert nicht relativ zu ' + path.relative(root, info.html));
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
  assert.equal(T.readValue('{"lv":{"0":[3,1000],"1":[2,500],"2":[0,0]}}', 'lv.*.1', 'sum'), 1500);
  assert.equal(T.readValue('[100,0,250,null,300]', '*', 'sum'), 650);
  assert.equal(T.readValue('{"levels":{"a":{"stars":3},"b":{"stars":2}}}', 'levels.*.stars', 'sum'), 5);
  assert.equal(T.readValue('{"r":{"a":5,"b":9}}', 'r.*', 'max'), 9);
  assert.equal(T.readValue('{"rank":[{"n":"A","s":90},{"n":"B","s":10}]}', 'rank.0.s'), 90);
  assert.equal(T.readValue('{"top":{"hint":[["A",77,"d"]]}}', 'top.hint.0.1'), 77);
  assert.equal(T.readValue('{"records":{"endless:endless:normal":{"bestScore":4200}}}', 'records.endless:endless:normal.bestScore'), 4200);
  assert.equal(T.readValue('{"lv":{}}', 'lv.*.1', 'sum'), null);
  assert.equal(T.readValue('{"a":[1,2]}', 'a.*'), null);
});
ok('better / fmt / cleanName / entryFields', () => {
  assert(T.better('desc', 5, 3) && !T.better('desc', 3, 5) && T.better('asc', 3, 5) && !T.better('asc', 5, 3) && T.better('asc', 1, null));
  assert.equal(T.fmt('int', 1234567), (1234567).toLocaleString('de-DE'));
  assert.equal(T.fmt('sec', 75.5), '1:15,5');
  assert.equal(T.fmt('sec', 9.25), '9,25 s');
  assert.equal(T.fmt('ms', 61000), '1:01,0');
  assert.equal(T.cleanName('  Rico   Re  '), 'Rico Re');
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

const wr = env => env.calls.filter(c => /boards\//.test(c.url) && c.method !== 'GET' && !/runQuery/.test(c.url)).length;   // Schreib-/Löschzugriffe auf Ranglisten
const run = async () => {
  {
    const env = makeEnv(g0, { user: mkUser(), prefix: b0.key, store: { 'anmacha-board-share': '1', 'anmacha-board-nick': 'Rico' } });
    set(env.store, wrap(valFor(b0.order)));
    await env.ctx.window.AnMaChaBoard.submit();
    const id = T.boardId(g0, b0), doc = env.firestore[id + '/U1'];
    assert(doc, 'Eintrag wurde nicht geschrieben');
    assert.equal(doc.n.stringValue, 'Rico'); assert.equal(doc.o.stringValue, b0.order);
    assert(env.calls.every(c => c.auth || c.method === 'GET'), 'Schreibzugriff ohne Anmeldung');
    n++; console.log('PASS Einreichen: Bestwert wird mit Freigabe und Anmeldung geschrieben');
    const before = wr(env);
    await env.ctx.window.AnMaChaBoard.submit();
    assert.equal(wr(env), before, 'unveränderter Wert darf nicht erneut gesendet werden');
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
    const env = makeEnv(g0, { ...setup, prefix: b0.key }); set(env.store, wrap(100));
    await env.ctx.window.AnMaChaBoard.submit();
    assert.equal(wr(env), 0, 'sendet ' + name);
    n++; console.log('PASS Einreichen: nichts gesendet ' + name);
  }
  {
    const env = makeEnv(g0, { user: mkUser(), store: { 'anmacha-board-share': '1', 'anmacha-board-nick': 'Rico' }, prefix: b0.key, firestore: { [T.boardId(g0, b0) + '/U1']: { n: { stringValue: 'Rico' }, s: { doubleValue: b0.order === 'asc' ? 10 : 1000 }, o: { stringValue: b0.order }, t: { integerValue: '1' } } } });
    set(env.store, wrap(b0.order === 'asc' ? 99 : 5));
    await env.ctx.window.AnMaChaBoard.submit();
    const sent = JSON.parse(env.store['anmacha-board-sent:U1:' + T.boardId(g0, b0)]);
    assert.equal(sent.v, b0.order === 'asc' ? 10 : 1000);
    n++; console.log('PASS Neues Gerät mit schlechterem Wert: Server-Bestwert wird übernommen, kein Dauerversuch');
  }
};
await run();

// ---------- automatische Erkennung (Spiele ohne REG-Eintrag, auch neue) ----------
const D = pairs => JSON.parse(JSON.stringify(T.detect(pairs)));
ok('detect: Highscore aus Zahl, JSON, Top-Listen (Objekte und Arrays)', () => {
  assert.equal(D([['anmachaFlipperBest', '5400']]).hi, 5400);
  assert.equal(D([['x.save', '{"best":3200,"rank":[{"n":"A","s":3200},{"n":"B","s":100}]}']]).hi, 3200);
  assert.equal(D([['td', '{"rank":[{"n":"X","s":900},{"n":"Y","s":50}]}']]).hi, 900);
  assert.equal(D([['q', '{"hof":{"ladder":[{"n":"A","v":5000}],"night":[]}}']]).hi, 5000);
  assert.equal(D([['g', '{"top":{"hint":[["A",77,"d"]],"ask":[]}}']]).hi, 77);
  assert.equal(D([['m', '{"stats":{"highScore":1234}}']]).hi, 1234);
});
ok('detect: Gesamtpunkte, Sterne, Siege, XP, Bestzeit', () => {
  const mem = D([['memory', '{"best":{"L1":120,"L2":90},"stars":{"L1":3,"L2":2}}']]);
  assert.equal(mem.sum, 210); assert.equal(mem.stars, 5);
  assert.equal(D([['mimori', '{"records":{"catch":120,"memory":0,"rhythm":300,"runner":50,"bubbles":0}}']]).sum, 470);
  assert.equal(D([['rm', '{"stars":{"1":3,"2":2,"3":0},"unlocked":4}']]).stars, 5);
  assert.equal(D([['w', '{"stats":{"wins":7,"games":10}}']]).wins, 7);
  assert.equal(D([['xyzWins', '3']]).wins, 3);
  assert.equal(D([['p', '{"xp":950}']]).xp, 950);
  const t = D([['k', '{"best":{"wiese":{"lap":55.2},"strand":{"lap":61}}}']]);
  assert.equal(t.time, 55.2); assert.equal(t.sum, undefined);
});
ok('detect: Spielzeit, Leeres, Ungültiges und Riesiges werden nicht als Rangliste erkannt', () => {
  assert.deepEqual(D([['a', '{"playTime":9999,"elapsed":5,"totalTime":100}']]), {});
  assert.deepEqual(D([['a', '{}'], ['b', '[]'], ['c', 'kein json'], ['d', null], ['e', '0'], ['f', '-3']]), {});
  assert.deepEqual(D([['a', '{"best":' + '9'.repeat(400000) + '}']]), {});
  assert.deepEqual(D([['a', '{"hi":{"hi":{"hi":{"hi":{"hi":{"hi":{"hi":5}}}}}}}']]), {});
});

const runAuto = async () => {
  const save = JSON.stringify({ best: 1200, stats: { wins: 3 }, playTime: 500 });
  {
    const env = makeEnv('neuesspiel', { user: mkUser(), prefix: 'neu', store: { 'anmacha-board-share': '1', 'anmacha-board-nick': 'Rico', 'neu.save': save, 'fremd.key': '{"best":99999}' } });
    await env.ctx.window.AnMaChaBoard.submit();
    const keys = Object.keys(env.firestore).sort();
    assert.deepEqual(keys, ['neuesspiel__hi/U1', 'neuesspiel__wins/U1']);
    assert.equal(env.firestore['neuesspiel__hi/U1'].s.doubleValue, 1200);
    assert.equal(env.firestore['neuesspiel__wins/U1'].s.doubleValue, 3);
    n++; console.log('PASS Auto: neues Spiel ohne REG-Eintrag reicht erkannte Werte ein (fremde Schlüssel bleiben außen vor)');
    save && (env.store['neu.save'] = JSON.stringify({ best: 2000, stats: { wins: 3 } }));
    await env.ctx.window.AnMaChaBoard.submit();
    assert.equal(env.firestore['neuesspiel__hi/U1'].s.doubleValue, 2000);
    n++; console.log('PASS Auto: besserer Wert ersetzt den alten');
    await env.ctx.window.AnMaChaBoard.removeAll();
    assert.deepEqual(Object.keys(env.firestore), []);
    n++; console.log('PASS Auto: Freigabe beenden löscht die automatisch angelegten Einträge');
  }
  {
    const env = makeEnv('klotzfunk', { user: mkUser(), prefix: 'klotz', store: { 'klotz.x': '{"best":5}' } });
    assert.equal(env.ctx.window.AnMaChaBoard.submit, undefined);
    n++; console.log('PASS Auto: Spiele mit leerem REG-Eintrag (Sandbox) bekommen bewusst keine Rangliste');
  }
};
await runAuto();

// ---------- keine Oberfläche, Profil, Abfrage, Katalog ----------
const runNew = async () => {
  {
    const env = makeEnv('neuesspiel', { user: mkUser(), prefix: 'neu', store: { 'anmacha-board-share': '1', 'anmacha-board-nick': 'Rico', 'neu.save': '{"best":10}' } });
    await env.ctx.window.AnMaChaBoard.submit();   // würde bei jeder DOM-Nutzung werfen (Stub)
    n++; console.log('PASS Spiel: Laufzeit baut keine Oberfläche (kein Knopf, kein Panel)');
  }
  {
    const env = makeEnv('neuesspiel', { user: mkUser('U7'), prefix: 'neu', firestore: { 'profile/U7': { d: { stringValue: '{"s":1,"n":"Anna"}' }, t: { integerValue: '1' } } }, store: { 'neu.save': '{"best":55}' } });
    await env.ctx.window.AnMaChaBoard.submit();
    assert.equal(env.store['anmacha-board-share'], '1'); assert.equal(env.store['anmacha-board-nick'], 'Anna');
    assert.equal(env.firestore['neuesspiel__hi/U7'].n.stringValue, 'Anna');
    n++; console.log('PASS Profil: Freigabe und Spitzname kommen aus dem Firestore-Profil (gilt auf jedem Gerät/Ursprung)');
  }
  {
    const env = makeEnv('x', { user: mkUser('U2') });
    const B = env.ctx.window.AnMaChaBoard;
    await B.saveProfile(true, '  Rico  ');
    assert.equal(env.store['anmacha-board-nick'], 'Rico'); assert.equal(env.store['anmacha-board-share'], '1');
    assert.equal(JSON.parse(env.firestore['profile/U2'].d.stringValue).n, 'Rico');
    await assert.rejects(() => B.saveProfile(true, 'x'));
    await B.saveProfile(false, '');
    assert.equal(JSON.parse(env.firestore['profile/U2'].d.stringValue).s, 0);
    n++; console.log('PASS Profil: speichern (Spitzname bereinigt, ungültiger Name abgelehnt, Freigabe beenden)');
  }
  {
    const env = makeEnv('snake', { firestore: { 'snake/u1': { n: { stringValue: 'Rico' }, s: { doubleValue: 900 }, o: { stringValue: 'desc' }, t: { integerValue: '1' } }, 'memory__sum/u2': { n: { stringValue: 'Anna' }, s: { integerValue: '410' }, o: { stringValue: 'desc' }, t: { integerValue: '1' } } } });
    const B = env.ctx.window.AnMaChaBoard;
    const rows = await B.query('snake', B.boardsFor('snake')[0], 25);
    assert.equal(rows.length, 1); assert.equal(rows[0].n, 'Rico'); assert.equal(rows[0].s, 900); assert.equal(rows[0].uid, 'u1');
    assert(env.calls.every(c => !c.auth), 'Lesen darf keine Anmeldung brauchen');
    const pr = await B.probe('memory', []);
    assert.deepEqual([...pr.map(b => b.id)], ['sum']);
    const prLocal = await B.probe('memory', [['m', '{"best":{"L1":1,"L2":2},"stars":{"L1":3,"L2":2}}']]);
    assert.deepEqual([...prLocal.map(b => b.id)].sort(), ['stars', 'sum']);
    assert.equal((await B.probe('klotzfunk', [])).length, 0);
    assert.equal((await B.probe('quiz', [])).length, 2);
    n++; console.log('PASS Zentrale Bibliothek: Abfrage ohne Anmeldung, Probe für automatische Spiele, Opt-out, kuratierte Spiele');
  }
  {
    const env = makeEnv('x', { user: mkUser(), store: { 'anmacha-board-share': '1', 'anmacha-board-nick': 'Rico', 'neu.save': '{"best":77}', 'wob.save': '{"stats":{"wins":4}}', 'fremd': '{"best":1}' } });
    await env.ctx.window.AnMaChaBoard.submitLocal([{ cloud: { game: 'neuesspiel', prefix: 'neu' } }, { cloud: { game: 'wobspiel', prefix: 'wob' } }, { cloud: null }]);
    assert.deepEqual(Object.keys(env.firestore).sort(), ['neuesspiel__hi/U1', 'wobspiel__wins/U1']);
    n++; console.log('PASS Zentrale Seite: submitLocal reicht alle lokal gespeicherten Spiele anhand der Katalog-Präfixe ein');
  }
  const cat = JSON.parse(fs.readFileSync(path.join(root, 'sync/catalog.json'), 'utf8')).games;
  assert(cat.length > 40 && cat.every(g => g.cloud && g.cloud.game), 'Katalog: jedes Spiel braucht cloud.game (node tools/build-sync.js)');
  n++; console.log('PASS Katalog: jedes Spiel hat cloud.game/prefix (zentrale Seite findet neue Spiele automatisch)');
};
await runNew();
console.log('OK: ' + n + ' Prüfungen');
