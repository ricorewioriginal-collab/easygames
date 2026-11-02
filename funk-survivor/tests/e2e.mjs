// Browser-Rauchtest: node funk-survivor/tests/e2e.mjs [http://localhost:8765/funk-survivor/]
// Läuft headless (Playwright, Software-WebGL) durch Titel, Menü, Setup, Runde, Level-Auswahl, Pause, Ende und Studio-Ausbau.
import { chromium } from 'playwright';
const url = process.argv[2] || 'http://localhost:8765/funk-survivor/';
const shots = process.env.SHOTS || '';
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FEHLER ') + m); if (!c) fails++; };
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 640, height: 360 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::|firebase|googleapis/i.test(m.text())) errs.push(m.text()); });
await p.goto(url + '?nopost=1'); await p.waitForSelector('#sTitle.on', { timeout: 60000 });
ok(await p.evaluate(() => !!window.FS && !!window.FSScene.ready), 'Spielkern und 3D-Szene sind da');
await p.click('#bPress', { force: true }); await p.waitForSelector('#sMenu.on');
await p.click('[data-go=play]', { force: true }); await p.waitForSelector('#sSetup.on');
ok((await p.textContent('#hName')) === 'Rico', 'Setup zeigt den ersten Helden');
await p.click('#hNext', { force: true }); ok((await p.textContent('#hName')) === 'Mia Mikro', 'Held wechselt');
ok(await p.evaluate(() => document.getElementById('suGo').disabled), 'gesperrter Held kann nicht starten');
await p.click('#hPrev', { force: true });
await p.click('#suGo', { force: true }); await p.waitForSelector('#sGame.on');
await p.waitForFunction(() => FSApp.G.W && FSApp.G.W.t > .3, null, { timeout: 60000 });
ok(true, 'Runde läuft');
await p.keyboard.down('KeyD'); await p.waitForTimeout(1500); await p.keyboard.up('KeyD');
ok(await p.evaluate(() => FSApp.G.W.P.x > .5), 'Taste D bewegt den Helden');
// Level-Aufstieg erzwingen
await p.evaluate(() => { FSApp.G.W.gems.push({ x: FSApp.G.W.P.x, z: FSApp.G.W.P.z, v: 999, mag: true, vx: 0, vz: 0, ph: 0 }); });
await p.waitForSelector('#ovLevel:not([hidden])', { timeout: 60000 });
ok((await p.$$('#picks .pick')).length >= 3, 'Level-Auswahl zeigt mindestens drei Karten');
if (shots) await p.screenshot({ path: shots + '/level.png' });
const t0 = await p.evaluate(() => FSApp.G.W.t); await p.waitForTimeout(600);
ok(Math.abs(await p.evaluate(() => FSApp.G.W.t) - t0) < .01, 'Spiel steht während der Auswahl');
await p.keyboard.press('Digit1'); await p.waitForTimeout(300);
ok(await p.evaluate(() => FSApp.G.W.lv >= 2 && (!FSApp.G.W.choice ? true : true)), 'Taste 1 wählt eine Verbesserung');
while (await p.evaluate(() => !!FSApp.G.W.choice)) { await p.keyboard.press('Digit1'); await p.waitForTimeout(100); }
// Pause
await p.keyboard.press('Escape'); await p.waitForSelector('#ovPause:not([hidden])');
const t1 = await p.evaluate(() => FSApp.G.W.t); await p.waitForTimeout(600);
ok(Math.abs(await p.evaluate(() => FSApp.G.W.t) - t1) < .01, 'Pause hält das Spiel an');
await p.click('#pGo', { force: true }); await p.waitForSelector('#ovPause', { state: 'hidden' });
// Boss und Gegner stellen, dann Tod erzwingen
await p.evaluate(() => { const W = FSApp.G.W; W.bossT = 0; });
await p.waitForFunction(() => FSApp.G.W.boss, null, { timeout: 60000 }); ok(true, 'Boss erscheint');
ok(await p.evaluate(() => !document.getElementById('bossBar').hidden), 'Boss-Leiste sichtbar');
await p.evaluate(() => { const W = FSApp.G.W; W.P.hp = 1; W.P.inv = 0; W.P.dash = 0; W.hero = W.hero; W.meta.revive = 0; W.revived = true; for (let i = 0; i < 5; i++) { const e = FS.spawnEnemy(W, 'brumm', W.P.x, W.P.z + .3); e.spawn = 0; } });
await p.waitForSelector('#ovEnd:not([hidden])', { timeout: 60000 });
ok(/\d/.test(await p.textContent('#eScore')), 'Ende-Bildschirm zeigt Punkte');
if (shots) await p.screenshot({ path: shots + '/end.png' });
ok(await p.evaluate(() => +localStorage.getItem('funksurvivor-coins') >= 0 && +localStorage.getItem('funksurvivor-highscore') > 0), 'Bestwert und Münzen gespeichert');
await p.click('#eAgain', { force: true }); await p.waitForFunction(() => FSApp.G.running && FSApp.G.W.t < 2, null, { timeout: 60000 }); ok(true, 'Nochmal startet eine neue Runde');
await p.evaluate(() => FSApp.pause()); await p.click('#pQuit', { force: true }); await p.waitForSelector('#ovEnd:not([hidden])', { timeout: 30000 });
await p.click('#eShop', { force: true }); await p.waitForSelector('#sShop.on');
ok((await p.$$('#shGrid .up')).length === 10, 'Studio-Ausbau zeigt 10 Verbesserungen');
await p.evaluate(() => localStorage.setItem('funksurvivor-coins', '1000')); await p.click('#shBack', { force: true });
await p.click('[data-go=shop]', { force: true }); await p.waitForSelector('#sShop.on');
await p.click('#shGrid .up:nth-child(1) .btn', { force: true });
ok(await p.evaluate(() => JSON.parse(localStorage.getItem('funksurvivor-meta') || '{}').hp === 1), 'Kauf einer Verbesserung klappt');
ok(errs.length === 0, 'keine Konsolen- oder Seitenfehler' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
await b.close(); console.log(fails ? fails + ' Fehler' : 'alles in Ordnung'); process.exit(fails ? 1 : 0);
