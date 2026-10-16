#!/usr/bin/env node
// Prüft cloud/fire-peer.js gegen den Firebase-Emulator (Auth 9099, Firestore 8080):
//   1. die Firestore-Regeln (Abschnitt „Online-Kopplung“) mit allen Missbrauchsfällen,
//   2. mit --browser zusätzlich eine echte WebRTC-Verbindung zwischen zwei Chromium-Seiten (Playwright nötig).
// Start:  firebase emulators:start --only auth,firestore   (mit cloud/firestore.rules), dann  node tools/test-fire-peer.js [--browser]
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path'), http = require('http'), assert = require('assert/strict');
const root = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(path.join(root, 'cloud/fire-peer.js'), 'utf8');
const EMU = { auth: 'http://127.0.0.1:9099', fs: 'http://127.0.0.1:8080' };
function user() {
  const store = {}, ctx = { fetch, setTimeout, clearTimeout, Promise, Date, JSON, URL, AbortController, FIRE_PEER_EMU: EMU,
    addEventListener() {}, removeEventListener() {},
    localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } } };
  ctx.window = ctx; vm.createContext(ctx); vm.runInContext('(function(){' + SRC.replace(/typeof window !== 'undefined' \? window : this/, 'window') + '})()', ctx);
  return ctx.FirePeer.firebase;
}
const denied = p => p.then(() => { throw new Error('erlaubt, sollte verweigert werden'); }, e => assert.equal(e.status, 403, e.message));
const inbox = uid => ({ from: [{ collectionId: 'in_' + uid }], where: { fieldFilter: { field: { fieldPath: 'a' }, op: 'EQUAL', value: { stringValue: '' } } }, limit: 10 });
let n = 0; const ok = m => console.log('ok', ++n, m);

async function rules() {
  await fetch('http://127.0.0.1:8080/emulator/v1/projects/ricorewi-games-save/databases/(default)/documents', { method: 'DELETE' });
  const A = user(), B = user(), C = user();
  const a = await A.uid(), b = await B.uid(), c = await C.uid(); assert.ok(a && b && c && a !== b); ok('anonyme Anmeldung');
  await A.write('p2p/fh-ABCD', { h: a }, { exists: false }); ok('Gastgeber belegt Kennung');
  await denied(B.write('p2p/fh-ABCD', { h: b }, { exists: true })); ok('fremde, aktive Kennung übernehmen abgelehnt');
  await denied(B.write('p2p/x', { h: b }, { exists: false })); ok('zu kurze Kennung abgelehnt');
  await denied(B.write('p2p/fh-ZZZZ', { h: a }, { exists: false })); ok('Kennung für fremde uid abgelehnt');
  await denied(B.query('', { from: [{ collectionId: 'p2p' }], limit: 5 })); ok('Kennungen nicht auflistbar');
  assert.equal((await B.get('p2p/fh-ABCD')).h, a); ok('Kennung per Code lesbar');
  await A.write('p2p/fh-ABCD', { h: a }, { exists: true }); ok('Lebenszeichen des Gastgebers');
  const jb = 'p2p/fh-ABCD/in_' + a + '/' + b + '_abcd2345';
  await B.write(jb, { o: 'v=0 offer', a: '', p: 'fpgast' }, { exists: false }); ok('Gast legt Angebot ab');
  await denied(B.write('p2p/fh-ABCD/in_' + c + '/' + b + '_abcd2346', { o: 'v=0', a: '', p: 'x' }, { exists: false })); ok('Angebot im falschen Postfach abgelehnt');
  await denied(C.write('p2p/fh-ABCD/in_' + a + '/' + b + '_abcd2347', { o: 'v=0', a: '', p: 'x' }, { exists: false })); ok('Angebot unter fremder Kennung abgelehnt');
  await denied(C.write('p2p/fh-NONE/in_' + a + '/' + c + '_abcd2348', { o: 'v=0', a: '', p: 'x' }, { exists: false })); ok('Angebot für fehlenden Gastgeber abgelehnt');
  await denied(C.write('p2p/fh-ABCD/in_' + a + '/' + c + '_abcd2349', { o: 'v=0', a: 'schon beantwortet', p: 'x' }, { exists: false })); ok('Angebot mit Antwort abgelehnt');
  await denied(C.write('p2p/fh-ABCD/in_' + a + '/' + c + '_abcd2340', { o: 'v=0', a: '', p: 'x', boese: 'x' }, { exists: false })); ok('Zusatzfelder abgelehnt');
  await denied(B.write(jb, { a: 'fake' }, { exists: true }, ['a'])); ok('Gast kann keine Antwort eintragen');
  await denied(C.get(jb)); ok('Dritter kann das Angebot nicht lesen');
  await denied(C.query('p2p/fh-ABCD', inbox(a))); ok('Dritter kann das Postfach nicht auflisten');
  const rows = await A.query('p2p/fh-ABCD', inbox(a)); assert.equal(rows.length, 1); assert.equal(rows[0].p, 'fpgast'); ok('Gastgeber sieht das Angebot');
  await denied(A.write(jb, { o: 'manipuliert', a: 'v=0 answer' }, { exists: true }, ['o', 'a'])); ok('Gastgeber kann das Angebot nicht ändern');
  await A.write(jb, { a: 'v=0 answer' }, { exists: true }, ['a']); ok('Gastgeber trägt Antwort ein');
  const back = await B.get(jb); assert.equal(back.a, 'v=0 answer'); assert.equal(back.o, 'v=0 offer'); ok('Gast liest die Antwort, Angebot unverändert');
  assert.equal((await A.query('p2p/fh-ABCD', inbox(a))).length, 0); ok('beantwortete Angebote fallen aus der Abfrage');
  await denied(C.del(jb)); ok('Dritter kann das Angebot nicht löschen');
  await B.del(jb); ok('Gast räumt sein Angebot auf');
  await denied(B.del('p2p/fh-ABCD')); ok('fremde Kennung löschen abgelehnt');
  await A.del('p2p/fh-ABCD'); ok('Gastgeber gibt Kennung frei');
  await B.write('p2p/fh-ABCD', { h: b }, { exists: false }); ok('freie Kennung neu belegbar');
}

// Zwei Chromium-Seiten verbinden sich über den Emulator: Gastgeber mit fester Kennung, Gast mit connect() – wie die Spiele.
async function browser() {
  let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(require.resolve('playwright', { paths: [process.cwd(), '/opt/node_modules', '/usr/lib/node_modules'] }))); }
  const page = `<!doctype html><meta charset="utf-8"><script>window.FIRE_PEER_EMU=${JSON.stringify(EMU)}</script><script src="/cloud/fire-peer.js"></script><body>`;
  const srv = http.createServer((q, r) => {
    const u = q.url.split('?')[0];
    if (u === '/t.html') { r.writeHead(200, { 'Content-Type': 'text/html' }); return r.end(page); }
    const f = path.join(root, u); if (!f.startsWith(root) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': f.endsWith('.js') ? 'text/javascript' : 'text/plain' }); fs.createReadStream(f).pipe(r);
  }).listen(0, '127.0.0.1');
  await new Promise(r => srv.once('listening', r));
  const url = 'http://127.0.0.1:' + srv.address().port + '/t.html';
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream'] });
  try {
    const H = await (await b.newContext()).newPage(), G = await (await b.newContext()).newPage(), G2 = await (await b.newContext()).newPage();
    for (const p of [H, G, G2]) { p.on('pageerror', e => console.log('Seitenfehler:', e.message)); await p.goto(url); }
    const room = 'test-' + Date.now().toString(36);
    await H.evaluate(room => new Promise((res, rej) => {
      const p = window.hp = new Peer(room); window.got = []; window.peers = [];
      p.on('open', id => res(id)); p.on('error', e => rej(e.type));
      p.on('connection', c => { window.peers.push(c.peer); c.on('data', d => { window.got.push(d); c.send({ echo: d, big: 'x'.repeat(50000) }); }); });
    }), room);
    assert.equal(await H.evaluate(() => hp.via), 'firebase'); ok('Gastgeber offen über Firebase');
    await G2.evaluate(room => new Promise((res, rej) => { const p = new Peer(room); p.on('open', () => rej('doppelt')); p.on('error', e => e.type === 'unavailable-id' ? res() : rej(e.type)); }), room);
    ok('gleiche Kennung auf anderem Gerät: unavailable-id');
    const t0 = Date.now();
    const r = await G.evaluate(room => new Promise((res, rej) => {
      const p = window.gp = new Peer(); setTimeout(() => rej('Zeitüberschreitung'), 25000);
      p.on('error', e => rej(e.type));
      p.on('open', () => { const c = p.connect(room, { reliable: true, metadata: { n: 'Gast' } }); c.on('open', () => c.send({ t: 'join', name: 'Ä😀' })); c.on('data', d => res({ d, peer: c.peer, len: d.big.length })); });
    }), room);
    assert.deepEqual(r.d.echo, { t: 'join', name: 'Ä😀' }); assert.equal(r.peer, room); assert.equal(r.len, 50000);
    ok('Gast verbunden, Nachricht hin und große Nachricht (50 kB, gestückelt) zurück in ' + (Date.now() - t0) + ' ms');
    assert.equal((await H.evaluate(() => window.peers[0])), await G.evaluate(() => gp.id)); ok('conn.peer beim Gastgeber = Kennung des Gasts');
    const miss = await G2.evaluate(() => new Promise(res => { const p = new Peer(); p.on('open', () => p.connect('gibtsnicht-' + Date.now())); p.on('error', e => res(e.type)); setTimeout(() => res('keine Meldung'), 30000); }));
    // Ohne Firebase-Eintrag fragt der Gast zur Sicherheit noch PeerJS (Gastgeber im Rückfall); ist dessen Server nicht erreichbar, kommt ein Netzfehler
    assert.ok(['peer-unavailable', 'server-error', 'network', 'socket-error'].includes(miss), miss); ok('unbekannter Raum: Fehler ' + miss + ' (über den PeerJS-Rückfall)');
    const ghost = 'geist-' + Date.now().toString(36);
    const dead = await G2.evaluate(ghost => window.FirePeer.firebase.uid().then(u => window.FirePeer.firebase.write('p2p/' + ghost, { h: u }, { exists: false })).then(() => new Promise(res => {
      const p = new Peer(); p.on('open', () => p.connect(ghost)); p.on('error', e => res(e.type)); setTimeout(() => res('keine Meldung'), 70000);
    })), ghost);
    assert.equal(dead, 'peer-unavailable'); ok('Raum eingetragen, aber Gastgeber antwortet nicht: peer-unavailable');
    const closed = G.evaluate(() => new Promise(res => { gp._conns[0].on('close', () => res(true)); setTimeout(() => res(false), 20000); }));
    await H.evaluate(() => hp.destroy());
    assert.equal(await closed, true); ok('Gastgeber schließt: Gast bekommt close');
    let left = 'x'; for (let i = 0; i < 20 && left; i++) { left = await G2.evaluate(room => window.FirePeer.firebase.get('p2p/' + room), room); if (left) await new Promise(r => setTimeout(r, 250)); }
    assert.equal(left, null); ok('Kennung nach destroy() freigegeben');
  } finally { await b.close(); srv.close(); }
}

(async () => {
  await rules();
  if (process.argv.includes('--browser')) await browser();
  console.log('Alle ' + n + ' Prüfungen bestanden.');
})().catch(e => { console.error('FEHLER:', e && e.message || e); process.exit(1); });
