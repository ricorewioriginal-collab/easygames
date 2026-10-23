// Funkmaler – Kerntests:  node --test funkmaler/tests/
'use strict';
const test = require('node:test'), assert = require('node:assert');
const FM = require('../js/core.js');

test('Wortliste: genug Begriffe je Stufe, keine leeren', () => {
  for (const k of ['leicht', 'mittel', 'schwer']) { const s = new Set(FM.WORDS[k].map(e => FM.norm(FM.show(e)))); assert.ok(s.size >= 120, k + ': ' + s.size); assert.ok(!s.has('')); }
});

test('Raten: richtig, Alternativen, Umlaute, Groß/klein, im Satz', () => {
  assert.strictEqual(FM.check('Haus', 'Haus'), 'ok');
  assert.strictEqual(FM.check('  hAuS!', 'Haus'), 'ok');
  assert.strictEqual(FM.check('rad', 'Fahrrad|Rad'), 'ok');
  assert.strictEqual(FM.check('Moehre', 'Karotte|Möhre'), 'ok');
  assert.strictEqual(FM.check('Strasse', 'Straße'), 'ok');
  assert.strictEqual(FM.check('ist das ein hund?', 'Hund'), 'ok');
  assert.strictEqual(FM.check('schwarzes loch', 'Schwarzes Loch'), 'ok');
});

test('Raten: knapp daneben und falsch', () => {
  assert.strictEqual(FM.check('Leuchtturn', 'Leuchtturm'), 'knapp');
  assert.strictEqual(FM.check('Giraffee', 'Giraffe'), 'knapp');
  assert.strictEqual(FM.check('Leucht', 'Leuchtturm'), 'nein');
  assert.strictEqual(FM.check('Hand', 'Hund'), 'nein', 'kurze Wörter nur genau');
  assert.strictEqual(FM.check('Katze', 'Hund'), 'nein');
  assert.strictEqual(FM.check('', 'Hund'), 'nein');
});

test('Hinweise: Unterstriche, aufgedeckte Buchstaben, Leerzeichen bleiben', () => {
  assert.strictEqual(FM.hint('Haus', []), '_ _ _ _');
  assert.strictEqual(FM.hint('Haus', [0]), 'H _ _ _');
  assert.ok(FM.hint('Schwarzes Loch', []).includes('   '));
  const p = FM.hintPlan('Leuchtturm', 5); assert.strictEqual(p.length, 3); assert.strictEqual(new Set(p).size, 3);
  assert.strictEqual(FM.hintPlan('Ei', 1).length, 0);
});

test('Punkte und Wortwahl', () => {
  assert.strictEqual(FM.guessPoints(60, 60, 0), 120); assert.strictEqual(FM.guessPoints(0, 60, 5), 40);
  assert.ok(FM.guessPoints(30, 60, 1) < FM.guessPoints(30, 60, 0));
  assert.strictEqual(FM.drawerPoints(3, 3), 55); assert.strictEqual(FM.drawerPoints(0, 3), 0);
  const r = FM.rng(4), w = FM.pickWords('mittel', 3, ['Vulkan'], r);
  assert.strictEqual(w.length, 3); assert.strictEqual(new Set(w).size, 3); assert.ok(!w.includes('Vulkan'));
  assert.deepStrictEqual(FM.order(['a', 'b'], 2), ['a', 'b', 'a', 'b']);
  assert.strictEqual(FM.clean('<b>Mia</b>\n', 20), 'bMia/b');
});
