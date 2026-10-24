// Oma-Rennen – Browser-Test: Titel → Menü → Oma-Wahl → Einzelrennen → Ergebnis, dazu Zu zweit und Zeitfahren.
// Start: Server im Repo-Ordner, dann node oma-rennen/tests/e2e.mjs [Screenshot-Ordner] [Breite] [Höhe] [Strecke] [Basis-URL]
import { chromium } from 'playwright';
const OUT = process.argv[2] || '', W = +process.argv[3] || 1280, H = +process.argv[4] || 720, BASE = process.argv[6] || 'http://localhost:8766/';
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: W, height: H } });
const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
const ok = (c, m) => { if (!c) { errs.push('FAIL ' + m); console.log('FAIL', m); } else console.log('ok', m); };
await p.goto(BASE + 'oma-rennen/index.html');
await p.waitForSelector('#sTitle.on', { timeout: 15000 }); await p.waitForTimeout(1200);
if (OUT) await p.screenshot({ path: OUT + '/or-title.jpg', quality: 80 });
await p.click('#bPress', { force: true }); await p.waitForSelector('#sMenu.on'); await p.waitForTimeout(800);
if (OUT) await p.screenshot({ path: OUT + '/or-menu.jpg', quality: 80 }); ok(true, 'menu');
await p.click('[data-go="single"]', { force: true }); await p.waitForSelector('#sSelect.on'); await p.waitForTimeout(600);
await p.click('.og[data-i="2"]', { force: true }); await p.waitForTimeout(500);
if (OUT) await p.screenshot({ path: OUT + '/or-select.jpg', quality: 80 }); ok(true, 'select');
await p.click('#selGo', { force: true }); await p.waitForSelector('#sSetup.on'); await p.waitForTimeout(300);
await p.click('#suWhat .cd[data-i="' + (process.argv[5] || 0) + '"]', { force: true });
await p.click('#suLaps .sg[data-v="2"]', { force: true });
if (OUT) await p.screenshot({ path: OUT + '/or-setup.jpg', quality: 80 });
await p.evaluate(() => { OmaApp.A.speed = 3; });
await p.click('#suGo', { force: true }); await p.waitForTimeout(800); ok(await p.evaluate(() => !!OmaApp.R), 'race started');
await p.keyboard.down('ArrowUp'); await p.waitForTimeout(5200);
if (OUT) await p.screenshot({ path: OUT + '/or-race.jpg', quality: 80 });
await p.keyboard.press('Space'); await p.waitForTimeout(2500);
if (OUT) await p.screenshot({ path: OUT + '/or-race2.jpg', quality: 80 });
const st = await p.evaluate(() => { const R = OmaApp.R, k = R.S.karts[R.hk[0]]; return { state: R.S.state, rp: k.rp, vf: k.vf, rank: k.rank }; }); console.log(JSON.stringify(st)); ok(st.rp > 20, 'moving');
// schneller zum Ziel: Spielerin automatisch fahren lassen
await p.evaluate(() => { const R = OmaApp.R; R.S.karts[R.hk[0]].assist = 1; R.speed = 12; });
await p.waitForSelector('#sResult.on', { timeout: 120000 }); await p.waitForTimeout(500);
if (OUT) await p.screenshot({ path: OUT + '/or-result.jpg', quality: 80 }); ok(true, 'result');
console.log(await p.evaluate(() => document.getElementById('reSub').textContent));
// Zu zweit: geteilter Bildschirm mit 2 Omas
await p.evaluate(() => OmaApp.startRace({ mode: 'duo', track: 4, laps: 1, level: 0, players: [{ name: 'A', oma: 0, src: 'kb0', pad: 0 }, { name: 'B', oma: 1, src: 'kb1', pad: 1 }] }));
await p.keyboard.down('KeyW'); await p.waitForTimeout(4000);
const duo = await p.evaluate(() => ({ v: OmaApp.R.views.length, n: OmaApp.R.S.karts.length })); ok(duo.v === 2 && duo.n === 8, 'Zu zweit: 2 Bildschirmteile, 8 Omas');
if (OUT) await p.screenshot({ path: OUT + '/or-duo.jpg', quality: 80 }); await p.keyboard.up('KeyW');
// Zeitfahren: allein, ohne Gegenstände
await p.evaluate(() => OmaApp.startRace({ mode: 'time', track: 1, laps: 1, level: 0, players: [{ name: 'Z', oma: 3, src: 'solo', pad: -1 }] }));
const tt = await p.evaluate(() => ({ n: OmaApp.R.S.karts.length, items: OmaApp.R.S.items })); ok(tt.n === 1 && !tt.items, 'Zeitfahren allein ohne Gegenstände');
await p.evaluate(() => { const R = OmaApp.R; R.S.karts[0].assist = 1; R.speed = 14; }); await p.keyboard.down('ArrowUp');
await p.waitForSelector('#sResult.on', { timeout: 120000 }); const best = await p.evaluate(() => OmaApp.ST.best.kurpark); ok(best > 10, 'Bestzeit gespeichert: ' + best);
await p.keyboard.up('ArrowUp');
ok(await p.evaluate(() => +localStorage.getItem('oma-rennen-highscore') > 0), 'Highscore (Karriere-Punkte) gespeichert');
console.log(errs.join('\n') || 'no errors'); await b.close(); if (errs.length) process.exitCode = 1;
