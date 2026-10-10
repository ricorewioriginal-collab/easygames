/* Browser-Test: spielt jedes freigegebene Level mit der Lösung des Lösers im echten Spiel durch.
   Voraussetzungen: laufender Webserver (npm run serve) und Playwright (npm i -D playwright).
   Aufruf:  BASE=http://localhost:8080 node tests/e2e-play.mjs      (optional: THREE=/pfad/zu/three.min.js für Offline-Betrieb) */
import fs from 'fs';
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080', sols = JSON.parse(fs.readFileSync(new URL('./solutions.json', import.meta.url)));
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] }), page = await browser.newPage({ viewport: { width: 900, height: 640 } }), errs = [];
page.on('pageerror', e => errs.push(e.message));
if (process.env.THREE) await page.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await page.goto(BASE + '/index.html?unlock=1'); await page.waitForFunction(() => window.__wobbel, null, { timeout: 30000 });
await page.evaluate(() => { document.getElementById('how').hidden = true; window.__ffwd = 6; });
const n = await page.evaluate(() => window.__wobbel.LEVELS.length); let ok = 0; const fail = [];
for (let i = 0; i < n; i++) {
  const key = await page.evaluate(i => window.__wobbel.LEVELS[i].key, i), path = [...sols[key]].map(c => 'URDL'.indexOf(c));
  await page.evaluate(i => window.__wobbel.startLevel(i), i); await page.waitForTimeout(200);
  let pos = 0, solved = false; const t0 = Date.now();
  while (Date.now() - t0 < 120000) { const r = await page.evaluate(([path, pos]) => { const s = window.__wobbel.session; let q = pos; while (q < path.length && s.queue.length < 4) s.push(path[q++]); return { q, win: !document.getElementById('win').hidden }; }, [path, pos]); pos = r.q; if (r.win) { solved = true; break; } await page.waitForTimeout(60); }
  console.log(`${key} ${solved ? 'GELÖST' : 'FEHLT'}`); solved ? ok++ : fail.push(key);
}
console.log(`\nDurchgespielt: ${ok}/${n}`, fail.length ? 'Fehlgeschlagen: ' + fail.join(', ') : '', errs.length ? 'Konsolenfehler: ' + errs.join(' | ') : '');
await browser.close(); process.exit(fail.length || errs.length ? 1 : 0);
