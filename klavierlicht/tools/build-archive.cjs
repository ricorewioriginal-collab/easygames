// Klavierlicht – baut das Online-Archiv aus tools/archiv-quelle.js: archiv/<id>.json (Chart) + archiv/index.json (Liste).
// Prüft je Lied, dass Melodie und Akkorde gleich lang sind.  Aufruf: node klavierlicht/tools/build-archive.cjs
const fs = require('fs'), path = require('path');
const C = require('../js/core.js'), SRC = require('./archiv-quelle.js'), OUT = path.join(__dirname, '..', 'archiv');
const len = s => s.trim().split(/\s+/).reduce((a, t) => { const m = /(?:\*([\d.]+)|\/([\d.]+))$/.exec(t); return a + (m ? (m[1] ? +m[1] : 1 / +m[2]) : 1); }, 0);
fs.mkdirSync(OUT, { recursive: true });
const index = []; let bad = 0;
for (const s of SRC) {
  const a = len(s.mel), b = len(s.chords);
  if (Math.abs(a - b) > 1e-6) { console.error(`${s.id}: Melodie ${a} Schläge, Akkorde ${b} Schläge`); bad++; }
  const c = C.fromNotation(s); delete c.builtin;
  if (!C.check(c)) { console.error(`${s.id}: ungültig`); bad++; continue; }
  fs.writeFileSync(path.join(OUT, s.id + '.json'), JSON.stringify(c));
  index.push({ id: s.id, title: s.title, artist: s.artist, cat: s.cat, diff: C.difficulty(c), dur: Math.round(C.duration(c)) });
}
index.sort((x, y) => x.title.localeCompare(y.title, 'de'));
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify({ v: 1, songs: index }, null, 0));
console.log(`${index.length} Lieder im Archiv${bad ? `, ${bad} Fehler` : ''}`); process.exit(bad ? 1 : 0);
