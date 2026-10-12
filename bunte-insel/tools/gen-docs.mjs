/* Erzeugt docs/HANDBUCH.md, docs/LOESUNGSBUCH.md und docs/CHEATS.md aus dem laufenden Spiel (gleiche Inhalte wie das Buch im Spiel).
   Aufruf: node bunte-insel/tools/gen-docs.mjs   (Server: cd <repo> && python3 -m http.server 8080;  THREE=/pfad/three.min.js falls das CDN gesperrt ist) */
import { chromium } from 'playwright';
import fs from 'fs';
const BASE = process.env.BASE || 'http://localhost:8080', OUT = new URL('../docs/', import.meta.url).pathname;
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 900, height: 600 } })).newPage();
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 });
const r = await p.evaluate(() => { const B = __bi.buch, C = BI.CHEATS; return { h: B.toMarkdown('handbuch'), l: B.toMarkdown('loesung'), c: '# 🔑 Geheimcodes (Cheats)\n\n> Wird automatisch erzeugt (`node bunte-insel/tools/gen-docs.mjs`) aus `js/cheats.js`. Eingabe im Spiel: ⚙️ → „🔑 Code eingeben“. Groß-/Kleinschreibung, Leer- und Sonderzeichen sind egal; Umlaute werden zu AE/OE/UE.\n\n| Code | Wirkung | Art |\n|---|---|---|\n' + C.map(c => '| `' + c.code + '` | ' + c.icon + ' ' + c.text + ' | ' + (c.toggle ? 'Special (nochmal = aus)' : 'einmalig') + ' |').join('\n') + '\n\nNeue Codes: in `BI.CHEATS` (js/cheats.js) eintragen und in `K.redeem` behandeln – Eingabefenster, Lösungsbuch und diese Datei übernehmen sie automatisch.\n' }; });
fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(OUT + 'HANDBUCH.md', r.h); fs.writeFileSync(OUT + 'LOESUNGSBUCH.md', r.l); fs.writeFileSync(OUT + 'CHEATS.md', r.c);
console.log('docs geschrieben:', r.h.length, r.l.length, r.c.length); await browser.close();
