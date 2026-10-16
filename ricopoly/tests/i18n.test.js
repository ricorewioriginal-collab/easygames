// Prüft, dass jeder feste Textschlüssel aus game.js und index.html in Deutsch und Englisch existiert.
const test = require('node:test'), assert = require('node:assert'), fs = require('fs'), path = require('path');
global.self = global;
require('../js/i18n.js');
const I = global.RicoI18n, root = path.join(__dirname, '..');
test('alle Textschlüssel sind in DE und EN vorhanden', () => {
  const src = fs.readFileSync(path.join(root, 'js/game.js'), 'utf8') + fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const keys = new Set();
  for (const m of src.matchAll(/\bt\('([a-zA-Z0-9_.]+)'/g)) if (!m[1].endsWith('.')) keys.add(m[1]);
  for (const m of src.matchAll(/data-t="([a-zA-Z0-9_.]+)"/g)) keys.add(m[1]);
  const missing = [...keys].filter(k => !(k in I.DE) || !(k in I.EN));
  assert.deepStrictEqual(missing, []);
});
test('DE und EN haben dieselben Schlüssel', () => {
  const a = Object.keys(I.DE).filter(k => !(k in I.EN)), b = Object.keys(I.EN).filter(k => !(k in I.DE));
  assert.deepStrictEqual([a, b], [[], []]);
});
test('Platzhalter und Rückfall', () => {
  assert.strictEqual(I.t('de', 'log.turn', { name: 'Rico' }), 'Rico ist dran');
  assert.strictEqual(I.t('en', 'err.somethingNew'), I.EN['err.generic']);
  assert.strictEqual(I.rules('de').length, I.rules('en').length);
});
