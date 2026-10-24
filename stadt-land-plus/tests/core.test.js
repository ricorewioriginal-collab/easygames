// Stadt Land Plus – Tests des Spielkerns (Prüfung, Punkte, Buchstaben, Computer): node --test stadt-land-plus/tests/core.test.js
const test = require('node:test'), assert = require('node:assert'), fs = require('fs'), path = require('path');
global.window = global;
for (const f of fs.readdirSync(path.join(__dirname, '../js/db'))) require('../js/db/' + f);
const SLF = require('../js/core.js');
const ok = (c, w, L) => SLF.check(c, w, L === undefined ? SLF.firstLetter(w) : L);

test('Städte: deutsche Gemeinden, Weltstädte mit deutschem Namen, Schreibweisen', () => {
  for (const w of ['Berlin', 'Mailand', 'kopenhagen', 'München', 'Muenchen', 'Wien', 'Zürich', 'New York', 'St. Gallen', 'Rottenburg am Neckar']) assert.strictEqual(ok('stadt', w).ok, true, w);
  assert.strictEqual(ok('stadt', 'Muenchen').key, ok('stadt', 'München').key, 'ue = ü');
  const r = ok('stadt', 'Hambrug'); assert.strictEqual(r.how, 'tippfehler'); assert.strictEqual(r.ok, true);
  assert.strictEqual(ok('stadt', 'Berlin', 'B').info.bl, 'Berlin');
});

test('Länder: amtliche und Alltagsnamen, historische Staaten und Bundesländer unsicher', () => {
  for (const w of ['Deutschland', 'Peru', 'USA', 'Holland', 'Elfenbeinküste', 'Türkei']) assert.strictEqual(ok('land', w).ok, true, w);
  assert.strictEqual(ok('land', 'Bayern').ok, null); assert.strictEqual(ok('land', 'DDR').ok, null);
  assert.ok(SLF.country('PE').cap.includes('Lima'));
});

test('Wortlisten: Fluss, Tier, Beruf mit weiblicher Form, zusammengesetzt, falscher Buchstabe', () => {
  assert.strictEqual(ok('fluss', 'Rhein').ok, true); assert.strictEqual(ok('fluss', 'Moldau').ok, true);
  assert.strictEqual(ok('tier', 'der Elefant').ok, true); assert.strictEqual(ok('beruf', 'Ärztin').ok, true);
  assert.strictEqual(ok('tier', 'Zwergmaus').how === 'db' || ok('tier', 'Zwergmaus').how === 'zusammengesetzt', true);
  assert.strictEqual(ok('tier', 'Hund', 'K').how, 'buchstabe');
  assert.strictEqual(ok('tier', '').how, 'leer');
  assert.strictEqual(ok('eigene', 'Kafka').how, 'frei');
  assert.strictEqual(ok('tier', 'Qwertzuiop').ok, null);
});

test('Punkte: 20 allein, 10 einzigartig, 5 doppelt, 0 ungültig', () => {
  const mk = (w, valid) => ({ res: SLF.check('stadt', w, null), valid });
  let a = SLF.score([mk('Berlin', true), mk('Bern', false)]); assert.deepStrictEqual(a.map(x => x.pts), [20, 0]);
  a = SLF.score([mk('Berlin', true), mk('berlin', true), mk('Bremen', true)]); assert.deepStrictEqual(a.map(x => x.pts), [5, 5, 10]);
});

test('Buchstaben und Computer: ausgeschlossene Buchstaben, keine Wiederholung, gültige Antworten', () => {
  const used = []; for (let i = 0; i < 23; i++) used.push(SLF.pickLetter(used, ['Q', 'X', 'Y']));
  assert.strictEqual(new Set(used).size, 23); assert.ok(!used.some(l => 'QXY'.includes(l)));
  let rs = 1; const rnd = () => (rs = (rs * 16807) % 2147483647) / 2147483647;
  for (const c of ['stadt', 'land', 'fluss', 'tier', 'beruf', 'essen']) for (const L of 'ABMS') { const w = SLF.botAnswer(c, L, 2, rnd); if (w) assert.strictEqual(SLF.check(c, w, L).ok !== false, true, c + ' ' + w); }
});
