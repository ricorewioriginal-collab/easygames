// Klavierlicht – baut das Online-Archiv: Lieder aus tools/archiv-quelle.js → archiv/<id>.json, dazu die schon umgewandelten
// Notenvorlagen (tools/corpus-to-chart.py), und schreibt archiv/index.json (Liste mit Rechte-Angabe je Lied).
// Prüft je Lied, dass Melodie und Akkorde gleich lang sind und jede Datei eine Rechte-Angabe hat.  Aufruf: node klavierlicht/tools/build-archive.cjs
const fs = require('fs'), path = require('path');
const C = require('../js/core.js'), SRC = require('./archiv-quelle.js'), OUT = path.join(__dirname, '..', 'archiv');
const len = s => s.trim().split(/\s+/).reduce((a, t) => { const m = /(?:\*([\d.]+)|\/([\d.]+))$/.exec(t); return a + (m ? (m[1] ? +m[1] : 1 / +m[2]) : 1); }, 0);
fs.mkdirSync(OUT, { recursive: true });
let bad = 0;
for (const s of SRC) {
  const a = len(s.mel), b = len(s.chords);
  if (Math.abs(a - b) > 1e-6) { console.error(`${s.id}: Melodie ${a} Schläge, Akkorde ${b} Schläge`); bad++; }
  const c = C.fromNotation(s); delete c.builtin;
  if (!C.check(c)) { console.error(`${s.id}: ungültig`); bad++; continue; }
  fs.writeFileSync(path.join(OUT, s.id + '.json'), JSON.stringify(c));
}
const index = [];
for (const f of fs.readdirSync(OUT).filter(f => f.endsWith('.json') && f !== 'index.json')) {
  const c = JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8'));
  if (!C.check(c) || !c.lic) { console.error(`${f}: ungültig oder ohne Rechte-Angabe`); bad++; continue; }
  index.push({ id: c.id, title: c.title, artist: c.artist, cat: c.cat, diff: C.difficulty(c), dur: Math.round(C.duration(c)), lic: c.lic, src: c.src || '' });
}
index.sort((x, y) => x.title.localeCompare(y.title, 'de'));
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify({ v: 1, songs: index }));
console.log(`${index.length} Lieder im Archiv${bad ? `, ${bad} Fehler` : ''}`); process.exit(bad ? 1 : 0);
