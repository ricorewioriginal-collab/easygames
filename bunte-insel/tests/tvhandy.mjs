/* Handy: „Spiel am Fernseher öffnen“ öffnet direkt den Controller (merkt sich den Code); Computer: Code + gleicher Code beim nächsten Start. Aufruf: node bunte-insel/tests/tvhandy.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); let fails = 0;
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const route = async p => { if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' })); await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort()); };
const ph = await (await browser.newContext({ viewport: { width: 400, height: 800 }, isMobile: true, hasTouch: true })).newPage(); await route(ph);
await ph.goto(BASE + '/bunte-insel/index.html'); await ph.waitForFunction(() => window.__bi, null, { timeout: 60000 });
ok(await ph.evaluate(() => __bi.tv.isPhone()), 'Handy wird als Handy erkannt'); ok((await ph.textContent('#bTv')).includes('Spiel am Fernseher öffnen'), 'Knopf heißt „Spiel am Fernseher öffnen“');
await ph.evaluate(() => localStorage.setItem('bi-tv-last', 'ABCD'));
const nav = ph.waitForURL(/controller\.html\?c=ABCD/, { timeout: 8000 }).then(() => true, () => false);
await ph.evaluate(() => { __bi.tv.openController(); }); ok(await nav, 'Knopf am Handy öffnet direkt den Controller mit gemerktem Code');
const pc = await (await browser.newContext({ viewport: { width: 1000, height: 600 } })).newPage(); await route(pc);
await pc.goto(BASE + '/bunte-insel/index.html'); await pc.waitForFunction(() => window.__bi, null, { timeout: 60000 }); ok(!(await pc.evaluate(() => __bi.tv.isPhone())), 'Computer ist kein Handy');
await pc.evaluate(() => localStorage.setItem('bi-tv-mycode', 'K7M2'));
const code = await pc.evaluate(() => __bi.tv.start().then(c => c, e => 'ERR')).catch(() => 'ERR');
if (code === 'ERR' || code === null) { console.log('SKIP gespeicherter Code (Vermittler nicht erreichbar)'); ok(await pc.evaluate(() => document.getElementById('tvStat').className === 'err' && !document.getElementById('tvRetry').hidden && !document.getElementById('tvPanel').hidden && /controller\.html/.test(document.getElementById('tvLink').textContent)), 'Ohne Vermittler: Panel bleibt sichtbar mit Link, Fehlermeldung und „Nochmal verbinden“'); await pc.screenshot({ path: process.env.SHOT || '/tmp/tvfail.png' }); } else ok(code === 'K7M2', 'Fernseher nimmt den gespeicherten Code wieder (' + code + ')');
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); process.exit(fails ? 1 : 0);
