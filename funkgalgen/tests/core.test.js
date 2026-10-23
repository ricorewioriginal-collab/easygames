// Funkgalgen – Logik-Tests.  node --test funkgalgen/tests/core.test.js
'use strict';
const test = require('node:test'), assert = require('node:assert'), fs = require('fs'), path = require('path');
const FG = require('../js/core.js'), { W, CATS } = require('../js/words.js'), WF = require('../../wortfunk/js/logic.js');
const load = f => new Uint32Array(fs.readFileSync(path.join(__dirname, '../../wortfunk/data', f)).buffer.slice(0));
const dict = WF.Dict(load('woerter.dawg'));

test('Alle Kategorie-Wörter stehen im Wortfunk-Wörterbuch, keine doppelt', () => {
  const seen = new Set();
  for (const c of CATS) { assert.ok(W[c.id] && W[c.id].length >= 30, c.id); for (const w of W[c.id]) { assert.ok(dict.hasWord(w), w); assert.ok(!seen.has(w), 'doppelt: ' + w); seen.add(w); } }
});

test('Raten: Treffer deckt alle Stellen auf, Fehler kostet eine Kiste, gewinnen und verlieren', () => {
  const r = FG.newRound('Kaffee');
  assert.deepStrictEqual(FG.guess(r, 'e'), { res: 'hit', ch: 'E', n: 2, won: false });
  assert.strictEqual(FG.guess(r, 'E').res, 'dup'); assert.strictEqual(FG.guess(r, '7').res, 'bad');
  assert.strictEqual(FG.guess(r, 'x').res, 'miss'); assert.strictEqual(r.lives, 7);
  assert.deepStrictEqual(FG.pattern(r), [null, null, null, null, 'E', 'E']);
  for (const c of 'KAF') FG.guess(r, c); assert.ok(r.won && r.done); assert.ok(FG.points(r, 0) > 0);
  const q = FG.newRound('Tor'); for (const c of 'QWXYZBCD') FG.guess(q, c); assert.ok(q.done && !q.won && q.lives === 0); assert.strictEqual(FG.guess(q, 'T').res, 'over');
  assert.strictEqual(FG.norm('Straße'), 'STRASSE');
});

test('Wort lösen, Joker, Punkte', () => {
  const r = FG.newRound('Banane'); assert.strictEqual(FG.solve(r, 'Bananen').res, 'wrongword'); assert.strictEqual(r.lives, 6);
  assert.strictEqual(FG.solve(r, 'banane').res, 'solved'); assert.ok(r.won);
  const j = FG.newRound('Elefant'), ch = FG.joker(j, () => 0); assert.ok(j.shown.includes(ch) && j.jokers === 1);
  const a = FG.newRound('Elefant'); for (const c of 'ELFANT') FG.guess(a, c); const b = FG.newRound('Elefant'); FG.joker(b, () => 0); for (const c of 'ELFANT') FG.guess(b, c);
  assert.ok(FG.points(a, 0) > FG.points(b, 0), 'Joker kostet'); assert.ok(FG.points(a, 5) > FG.points(a, 0), 'Serie zählt');
});

test('Wortwahl: Schwierigkeit, keine Wiederholung, Tageswort für alle gleich', () => {
  for (const d of ['leicht', 'mittel', 'schwer']) { const p = FG.pool(W, 'alle', d), [a, b] = FG.DIFF[d]; assert.ok(p.length > 20 && p.every(w => w.length >= a && w.length <= b), d); }
  const p = FG.pool(W, 'tiere', 'leicht'); assert.ok(p.every(w => W.tiere.includes(w)));
  const r = FG.mulberry(3), recent = []; for (let i = 0; i < 20; i++) { const w = FG.pick(p, r, recent); assert.ok(!recent.includes(w)); recent.push(w); }
  assert.strictEqual(FG.daily(W, '2026-10-24'), FG.daily(W, '2026-10-24')); assert.notStrictEqual(FG.daily(W, '2026-10-24'), FG.daily(W, '2026-10-25'));
  assert.strictEqual(FG.catOf(W, 'PINGUIN'), 'tiere');
});

test('Wörterbuch-Modus: bekannte Wörter, sauber gefiltert; Eingaben werden geprüft', () => {
  const E = load('bekannt.dawg'), all = FG.dawgWords(E, 2, 20); assert.ok(all.length > 20000);
  const p = FG.dictPool(E, 'mittel'); assert.ok(p.length > 5000 && p.every(w => w.length >= 6 && w.length <= 10 && dict.hasWord(w)));
  assert.ok(!p.some(w => /SCHEISS|FICK|ARSCH/.test(w)));
  assert.ok(FG.checkWord('Pinguin', dict).ok); assert.ok(!FG.checkWord('Xqzt', dict).ok); assert.ok(!FG.checkWord('ab', dict).ok);
});

test('Eigenes Wörterbuch-Lesen stimmt mit Wortfunk überein', () => {
  const d2 = FG.Dict(load('woerter.dawg'));
  for (const w of ['PINGUIN', 'KAFFEE', 'TORTE', 'XQZT', 'PINGUI', 'STRASSE']) assert.strictEqual(d2.hasWord(w), dict.hasWord(w), w);
});
