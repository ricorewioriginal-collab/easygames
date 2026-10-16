// Prüft die Firestore-Regeln für RicoPoly gegen den Firebase-Emulator (Auth 9099, Firestore 8080) mit js/fire.js.
// Start:  firebase emulators:start --only auth,firestore   (mit cloud/firestore.rules), dann  node ricopoly/tests/fire-rules.js
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path'), assert = require('assert/strict');
const SRC = fs.readFileSync(path.join(__dirname, '../js/fire.js'), 'utf8');
const EMU = { auth: 'http://127.0.0.1:9099', fs: 'http://127.0.0.1:8080' };
function user() {
  const store = {}, ctx = { fetch, setTimeout, Promise, Date, JSON, RICOPOLY_FIRE_EMU: EMU,
    localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } } };
  ctx.self = ctx; vm.createContext(ctx); vm.runInContext(SRC, ctx); return ctx.RicoFire;
}
const denied = p => p.then(() => { throw new Error('erlaubt, sollte verweigert werden'); }, e => assert.equal(e.status, 403, e.message));
const offerQ = { from: [{ collectionId: 'join' }], where: { fieldFilter: { field: { fieldPath: 'a' }, op: 'EQUAL', value: { stringValue: '' } } }, limit: 10 };
let n = 0; const ok = m => console.log('ok', ++n, m);

(async () => {
  await fetch('http://127.0.0.1:8080/emulator/v1/projects/ricorewi-games-save/databases/(default)/documents', { method: 'DELETE' });
  const A = user(), B = user(), C = user();
  const a = await A.uid(), b = await B.uid(); assert.ok(a && b && a !== b); ok('anonyme Anmeldung');

  // Rangliste
  await A.submit('Anna<script>', 'king', true); ok('erste Partie eingetragen');
  let top = await B.top(10); assert.equal(top.length, 1); assert.deepEqual([top[0].name, top[0].wins, top[0].games], ['Annascript', 1, 1]); ok('Rangliste lesbar, Name bereinigt');
  await denied(A.submit('Anna', 'king', true)); ok('zweite Partie innerhalb einer Minute abgelehnt');
  await denied(A.write('ricopoly_board/' + a, { n: 'Anna', c: 'king', w: 50, g: 50 }, { exists: true })); ok('gefälschte Zahlen abgelehnt');
  await denied(B.write('ricopoly_board/' + a, { n: 'X', c: 'king', w: 1, g: 2 }, { exists: true })); ok('fremden Eintrag ändern abgelehnt');
  await denied(B.write('ricopoly_board/' + b, { n: 'B', c: 'elf', w: 3, g: 3 }, { exists: false })); ok('Neuanlage mit vielen Siegen abgelehnt');
  await denied(B.query('', { from: [{ collectionId: 'ricopoly_board' }], limit: 500 })); ok('zu große Abfrage abgelehnt');

  // Räume
  await A.write('ricopoly_rooms/ABC234', { h: a }, { exists: false }); ok('Raum angelegt');
  await denied(B.write('ricopoly_rooms/ABC234', { h: b }, { exists: true })); ok('fremden Raum übernehmen abgelehnt');
  await denied(B.write('ricopoly_rooms/abc', { h: b }, { exists: false })); ok('ungültiger Code abgelehnt');
  await denied(B.query('', { from: [{ collectionId: 'ricopoly_rooms' }], limit: 5 })); ok('private Räume nicht auflistbar');
  assert.equal((await B.get('ricopoly_rooms/ABC234')).h, a); ok('Raum per Code lesbar');
  const jb = 'ricopoly_rooms/ABC234/join/' + b;
  await B.write(jb, { o: 'v=0 offer', a: '' }); ok('Gast legt Angebot ab');
  await denied(B.write(jb, { o: 'v=0 offer', a: 'fake' }, { exists: true })); ok('Gast kann keine Antwort eintragen');
  await denied(C.get(jb)); ok('Dritter kann das Angebot nicht lesen');
  await denied(C.query('ricopoly_rooms/ABC234', offerQ)); ok('Dritter kann Angebote nicht auflisten');
  await denied(C.write('ricopoly_rooms/ABC234/join/' + b, { o: 'x', a: '' })); ok('Angebot unter fremder Kennung abgelehnt');
  await denied(C.write('ricopoly_rooms/ZZZ999/join/' + (await C.uid()), { o: 'x', a: '' })); ok('Angebot für fehlenden Raum abgelehnt');
  const rows = await A.query('ricopoly_rooms/ABC234', offerQ); assert.equal(rows.length, 1); assert.equal(rows[0].id, b); ok('Gastgeber sieht das Angebot');
  await denied(A.write(jb, { o: 'manipuliert', a: 'v=0 answer' }, { exists: true })); ok('Gastgeber kann das Angebot nicht ändern');
  await A.write(jb, { o: 'v=0 offer', a: 'v=0 answer' }, { exists: true }); ok('Gastgeber trägt Antwort ein');
  assert.equal((await B.get(jb)).a, 'v=0 answer'); ok('Gast liest die Antwort');
  assert.equal((await A.query('ricopoly_rooms/ABC234', offerQ)).length, 0); ok('beantwortete Angebote fallen aus der Abfrage');
  await B.write(jb, { o: 'v=0 offer2', a: '' }, { exists: true }); ok('Gast kann für Wiederbeitritt neu anbieten');

  // Öffentliche Liste
  const pub = { h: a, n: 'Anna', w: 'fantasy', m: 'quick', c: 2, x: 6 };
  await A.write('ricopoly_pub/ABC234', pub); ok('öffentlicher Eintrag');
  await denied(B.write('ricopoly_pub/ABC234', Object.assign({}, pub, { h: b }))); ok('fremder öffentlicher Eintrag abgelehnt');
  await denied(A.write('ricopoly_pub/ABC234', Object.assign({}, pub, { w: '<img>' }))); ok('ungültige Welt abgelehnt');
  const list = await C.query('', { from: [{ collectionId: 'ricopoly_pub' }], orderBy: [{ field: { fieldPath: 't' }, direction: 'DESCENDING' }], limit: 20 });
  assert.equal(list.length, 1); assert.equal(list[0].id, 'ABC234'); ok('Raumliste lesbar');
  await denied(B.del('ricopoly_rooms/ABC234')); ok('fremden Raum löschen abgelehnt');
  await A.del('ricopoly_pub/ABC234'); await A.del('ricopoly_rooms/ABC234'); ok('Gastgeber räumt auf');

  if (process.argv.includes('--slow')) {
    await new Promise(r => setTimeout(r, 61000));
    await A.submit('Anna', 'king', false); top = await A.top(10);
    assert.deepEqual([top[0].wins, top[0].games], [1, 2]); ok('nach einer Minute zählt die nächste Partie');
  }
  console.log('alle', n, 'Prüfungen bestanden');
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
