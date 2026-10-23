// Sucht lösbare Patience-Mischungen (Löser aus anmacha-solitaire/js/rules.js) und schreibt anmacha-solitaire/data/loesbar.json.
// Aufruf: node tools/anmacha-solitaire/mkseeds.js [Anzahl je Variante=250] [Knotenlimit=60000]
'use strict';
const fs = require('fs'), path = require('path');
const AS = require('../../anmacha-solitaire/js/rules.js');
const want = +process.argv[2] || 250, limit = +process.argv[3] || 60000;
const out = path.join(__dirname, '../../anmacha-solitaire/data/loesbar.json');
const res = { info: 'Startwerte lösbarer Patience-Partien (geprüft mit solveKlondike)', d1: [], d3: [] };
for (const draw of [1, 3]) {
  const list = res['d' + draw];
  for (let seed = draw * 100000 + 1; list.length < want; seed++) {
    if (AS.solveKlondike(AS.deal('klondike', { draw }, seed), limit).ok) list.push(seed);
    if (seed % 20 === 0) console.log('ziehen', draw, ':', list.length, 'von', want, '(geprüft bis', seed + ')');
  }
}
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(res));
console.log('fertig:', out);
