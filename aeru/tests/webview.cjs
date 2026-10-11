// Eingebettete Browser (WebViews), die jeden WebGL-Kontext ablehnen, aber Canvas 2D können:
// Das Spiel muss in den vereinfachten 2D-Modus wechseln, ihn ankündigen und spielbar bleiben.
const assert = require('node:assert/strict'), {load} = require('./harness.cjs');
const h = load({webgl: false, width: 390, height: 780, coarse: true}), {api, els, renders} = h;
assert(api, 'Testschnittstelle fehlt');
assert.equal(els.error?.hidden ?? true, true, 'kein Fehlerbildschirm, solange 2D funktioniert');
assert.equal(els.graphicsNotice.hidden, false, 'Hinweis auf den 2D-Modus sichtbar');
h.frame()(16); const title = renders.draw2d; assert(title > 50, '2D-Titelbild wird gezeichnet');
els.start.onclick(); h.finish(); h.frame()(32);
assert.equal(h.snap().mode, 'play'); assert(renders.draw2d > title + 50, '2D-Spielszene wird gezeichnet');
const z = h.snap().state.z; h.key('KeyW'); h.tick(60); h.up('KeyW'); assert(h.snap().state.z < z - 6, 'Steuerung funktioniert im 2D-Modus');
assert(h.snap().objective, 'Questziel auch im 2D-Modus');
console.log('PASS webview: Ohne WebGL startet ein spielbarer 2D-Modus mit Hinweis, Zeichnung, Steuerung und Quests.');
