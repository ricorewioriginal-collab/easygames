/* Browser-Test des Level-Editors: malen, prüfen (Worker), testen, speichern, teilen, Link öffnen.
   Aufruf:  BASE=http://localhost:8080/wobbel THREE=/pfad/three.min.js node tests/e2e-editor.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080', errs = [], log = (ok, m) => { console.log((ok ? '✓ ' : '✗ ') + m); if (!ok) fails++; }; let fails = 0;
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] }), ctx = await browser.newContext({ viewport: { width: 1000, height: 700 }, permissions: ['clipboard-read', 'clipboard-write'] }), page = await ctx.newPage();
page.on('pageerror', e => errs.push(e.message)); page.on('dialog', d => d.accept());
if (process.env.THREE) await page.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await page.route('**/fonts.googleapis.com/**', r => r.abort());
await page.goto(BASE + '/index.html'); await page.waitForFunction(() => window.__wobbel, null, { timeout: 30000 });
await page.waitForSelector('#how:not([hidden])', { timeout: 4000 }).catch(() => {}); await page.evaluate(() => { document.getElementById('how').hidden = true; window.__ffwd = 6; });
await page.click('#bEditor'); await page.waitForSelector('#editor:not([hidden])');
const st = () => page.evaluate(() => window.__wobbel.ed.state());
const cell = async (x, y) => { const b = await page.locator('#edCv').boundingBox(), w = +(await page.textContent('#edW')), h = +(await page.textContent('#edH')); return { x: b.x + (x + .5) * b.width / w, y: b.y + (y + .5) * b.height / h }; };
const click = async (x, y) => { const c = await cell(x, y); await page.mouse.click(c.x, c.y); };
const tool = t => page.click(`#edPal [data-t="${t === ' ' ? ' ' : t}"]`);
let s = await st(); log(s.rows.length === 8 && s.rows[0] === '##########', 'Neues Level 10×8 mit Rand');
// eigenes Level malen: Start-Level ist schon lösbar (Kiste 3,4 → Ziel 7)
await page.click('#edSolve'); await page.waitForFunction(() => /Lösbar/.test(document.getElementById('edStatus').textContent), null, { timeout: 20000 });
log(true, 'Löser im Worker meldet lösbar'); s = await st(); log(s.verified && s.verified.moves > 0, 'Verifiziert: ' + JSON.stringify(s.verified));
// Malen: Wand platzieren macht das Level wieder ungeprüft
await tool('#'); await click(5, 5); s = await st(); log(s.rows[5][5] === '#' && !s.verified, 'Wand gemalt, Prüfung zurückgesetzt');
// Ziehen malt eine Linie
const a = await cell(1, 6), b = await cell(4, 6); await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(b.x, b.y, { steps: 8 }); await page.mouse.up(); s = await st(); log(s.rows[6].slice(1, 5) === '####', 'Ziehen malt Linie');
await page.keyboard.press('Control+z'); s = await st(); log(s.rows[6].slice(1, 5) !== '####', 'Strg+Z macht Ziehen rückgängig');
// Unlösbar: Wobbel einmauern
await tool(' '); await click(5, 5);
await tool('#'); await click(3, 3); await click(3, 2); await click(3, 4); await click(2, 2); await click(2, 4); await click(1, 3);   // Umgebung des Wobbel (2,3)
await page.click('#edSolve'); await page.waitForFunction(() => /Unlösbar/.test(document.getElementById('edStatus').textContent), null, { timeout: 20000 }); log(true, 'Unlösbares Level erkannt');
// zurück zum lösbaren
for (let i = 0; i < 6; i++) await page.keyboard.press('Control+z');
// Testen: Lösung mit Auto-Play im 3D-Spiel
await page.fill('#edName', 'Testbau'); await page.click('#edSolve'); await page.waitForSelector('#edShow', { timeout: 20000 });
await page.click('#edShow'); await page.waitForSelector('#win:not([hidden])', { timeout: 30000 }); log(true, 'Lösung ansehen spielt das Level durch'); 
log(await page.evaluate(() => document.getElementById('wNext').textContent.includes('Editor')), 'Gewinn-Dialog bietet „Zurück zum Editor"');
await page.click('#wNext'); await page.waitForSelector('#editor:not([hidden])'); s = await st(); log(s.name === 'Testbau', 'Zurück im Editor, Name erhalten');
// Speichern + Meine Level
await page.click('#edSave'); await page.click('#edMy'); await page.waitForSelector('#myDlg:not([hidden]) .my-row'); log((await page.locator('.my-row').count()) === 1, 'Gespeichert und in „Meine Level" gelistet');
// Teilen → Code → Import-Rundlauf
await page.click('.my-row [data-a="share"]'); const code = await page.inputValue('#shCode'), link = await page.inputValue('#shLink'); log(code.startsWith('WOBBEL1-') && link.includes('?code='), 'Code + Link erzeugt');
await page.click('#shClose'); await page.click('#myClose');
await page.click('#edBack'); await page.waitForSelector('#menu:not([hidden])'); log(true, 'Zurück ins Menü');
// geteilten Link öffnen
const p2 = await ctx.newPage(); p2.on('pageerror', e => errs.push(e.message)); if (process.env.THREE) await p2.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' })); await p2.route('**/fonts.googleapis.com/**', r => r.abort());
await p2.goto(BASE + '/index.html?code=' + code.slice(8)); await p2.waitForFunction(() => window.__wobbel && window.__wobbel.session && window.__wobbel.session.def && window.__wobbel.session.def.key === 'custom', null, { timeout: 30000 });
log(await p2.evaluate(() => document.getElementById('tName').textContent) === 'Testbau', 'Geteilter Link startet das Level');
// kaputter Code
const p3 = await ctx.newPage(); p3.on('pageerror', e => errs.push(e.message)); if (process.env.THREE) await p3.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' })); await p3.route('**/fonts.googleapis.com/**', r => r.abort());
await p3.goto(BASE + '/index.html?code=Quatsch'); await p3.waitForFunction(() => window.__wobbel, null, { timeout: 30000 }); log(await p3.evaluate(() => !document.getElementById('menu').hidden), 'Kaputter Code → Menü statt Absturz');
// Mobil-Layout
await page.setViewportSize({ width: 390, height: 780 }); await page.click('#bEditor'); await page.waitForSelector('#editor:not([hidden])'); const ov = await page.evaluate(() => { const r = document.getElementById('edCv').getBoundingClientRect(); return { w: r.width, h: r.height, sw: document.documentElement.scrollWidth, iw: innerWidth }; }); log(ov.w <= 390 && ov.sw <= ov.iw && ov.h > 100, 'Mobil: Raster passt (' + Math.round(ov.w) + '×' + Math.round(ov.h) + ')');
await page.screenshot({ path: process.env.SHOT || '/tmp/claude-0/t/ed-mobile.png' });
console.log(errs.length ? 'Konsolenfehler: ' + errs.join(' | ') : 'Keine Konsolenfehler'); await browser.close(); process.exit(fails || errs.length ? 1 : 0);
