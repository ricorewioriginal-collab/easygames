/* Kart Rush: Handy gibt den Fernseher-Code im normalen Spiel ein → wird zum Lenkrad. Aufruf: node anmacha-kart/tests/join.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true }); const p = await ctx.newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message));
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/peerjs.min.js', r => r.fulfill({ body: '', contentType: 'application/javascript' }));
await p.goto(BASE + '/anmacha-kart/index.html'); await p.waitForSelector('#bJoin', { state: 'attached', timeout: 60000 }); await p.waitForFunction(() => !document.getElementById('menu').hidden, null, { timeout: 60000 });
ok(await p.isVisible('#bJoin'), 'Menü zeigt „Code eingeben“');
await p.click('#bJoin'); ok(await p.isVisible('#joinIn'), 'Code-Feld erscheint');
await p.fill('#joinIn', 'ab'); await p.click('#joinGo'); ok(/4 Zeichen/.test(await p.textContent('#joinMsg')), 'zu kurzer Code wird freundlich abgelehnt');
await p.fill('#joinIn', 'hk-yq'); ok(await p.inputValue('#joinIn') === 'HKYQ', 'Eingabe wird groß geschrieben und gesäubert (HKYQ)');
await p.click('#joinGo'); await p.waitForURL(/\?join=HKYQ/, { timeout: 8000 }).catch(() => { }); ok(/\?join=HKYQ/.test(p.url()), 'Seite wechselt in den Controller-Modus: ' + p.url().split('/').pop());
await p.waitForFunction(() => document.body.classList.contains('ctrl'), null, { timeout: 15000 }).catch(() => { }); ok(await p.evaluate(() => document.body.classList.contains('ctrl')), 'Controller-Oberfläche (Lenkrad) wird geladen');
for (const e of errs.slice(0, 5)) console.log('ERR', e); ok(errs.length === 0, 'Keine Seitenfehler');
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'ALLES OK'); process.exit(fails ? 1 : 0);
