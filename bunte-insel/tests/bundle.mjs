/* Vite-Bündel: Mit ?bundle=1 lädt das Spiel EINE Datei js/bunte-insel.min.js statt der Einzeldateien, startet ohne Fehler,
   und fehlt das Bündel, springen die Einzeldateien ein. Vorher bauen: cd bunte-insel-src && npm run build. Aufruf: node bunte-insel/tests/bundle.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
let fails = 0; const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
async function run(block) {
  const p = await (await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'de-DE' })).newPage(), errs = [], js = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('request', r => { const u = r.url(); if (/\/bunte-insel\/js\//.test(u)) js.push(u.replace(/^.*\/bunte-insel\//, '').split('?')[0]); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
  if (block) await p.route('**/bunte-insel.min.js*', r => r.fulfill({ status: 404, body: '' }));
  await p.goto(BASE + '/bunte-insel/index.html?bundle=1'); await p.waitForFunction(() => window.__bi, null, { timeout: 120000 });
  await p.click('#bStart'); await p.waitForTimeout(1500);
  const st = await p.evaluate(() => ({ t: __bi.t, bar: (document.getElementById('ldPct') || {}).textContent, err: (document.getElementById('ldTxt') || {}).textContent, ld: getComputedStyle(document.getElementById('loading')).display }));
  await p.context().close(); return { errs, js, st };
}
const a = await run(false);
ok(a.js.includes('js/bunte-insel.min.js') && a.js.length === 1, 'nur das Bündel geladen (' + a.js.length + ' Spieldatei' + (a.js.length === 1 ? '' : 'en') + ')');
ok(a.st.ld === 'none' && a.st.t > 0, 'Spiel startet aus dem Bündel (Ladebildschirm weg)');
ok(!a.errs.length, 'keine JS-Fehler ' + a.errs.slice(0, 3).join(' | '));
const b = await run(true);
ok(b.js.length > 50 && b.st.ld === 'none', 'ohne Bündel: Einzeldateien springen ein (' + b.js.length + ')');
ok(!b.errs.length && !/Startfehler/.test(b.st.err || ''), 'ohne Bündel: keine Fehler ' + b.errs.slice(0, 3).join(' | '));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); process.exit(fails ? 1 : 0);
