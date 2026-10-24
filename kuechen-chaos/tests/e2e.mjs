// Küchen-Chaos – Browser-Test: Titel → Menü → Küchenwahl → Schicht (Spieler lässt den Computer mitkochen) → Feierabend.
// Start: Server im Repo-Ordner, dann node kuechen-chaos/tests/e2e.mjs [Screenshot-Ordner] [Breite] [Höhe] [Basis-URL]
import { chromium } from 'playwright';
const OUT = process.argv[2] || '', W = +process.argv[3] || 1280, H = +process.argv[4] || 720, BASE = process.argv[5] || 'http://localhost:8766/';
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: W, height: H } });
const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
const ok = (c, m) => { if (!c) { errs.push('FAIL ' + m); console.log('FAIL', m); } else console.log('ok', m); };
const shot = async n => { if (OUT) await p.screenshot({ path: OUT + '/kc-' + n + '.jpg', quality: 80 }); };
await p.goto(BASE + 'kuechen-chaos/index.html');
await p.waitForSelector('#sTitle.on', { timeout: 15000 }); await p.waitForTimeout(1500); await shot('title');
await p.click('#bPress', { force: true }); await p.waitForSelector('#sMenu.on'); await p.waitForTimeout(600); await shot('menu'); ok(true, 'Menü');
await p.click('[data-go="solo"]', { force: true }); await p.waitForSelector('#sLevels.on'); await shot('levels');
ok(await p.isDisabled('.lv[data-i="1"]'), 'Küche 2 ist anfangs gesperrt');
await p.click('.lv[data-i="0"]', { force: true }); await p.waitForSelector('#sGame.on');
// Beim ersten Mal: Übungsküche führt Schritt für Schritt (gelber Pfeil + Text)
ok(await p.evaluate(() => !!KCApp.A.cfg.tutorial), 'Übungsküche startet beim ersten Mal'); await p.waitForTimeout(800);
const tt = () => p.evaluate(() => document.getElementById('tutT').textContent);
ok(/Salat-Kiste/.test(await tt()), 'Schritt 1: ' + await tt()); await shot('tut1');
const act = f => p.evaluate(f);
await act(() => { const G = KCApp.A.G, ch = G.chefs[0]; KCApp.KC.interact(G, ch, G.tiles.findIndex(t => t.ch === 'L')); }); await p.waitForTimeout(300);
ok(/Schneidebrett/.test(await tt()), 'Schritt 2: ' + await tt());
await act(() => { const G = KCApp.A.G, ch = G.chefs[0]; const b = G.tiles.findIndex(t => t.ch === 'X'); KCApp.KC.interact(G, ch, b); }); await p.waitForTimeout(300);
ok(/geschnitten/.test(await tt()), 'Schritt 3: ' + await tt()); await shot('tut3');
await act(() => { const G = KCApp.A.G, ch = G.chefs[0]; const b = G.tiles.findIndex(t => t.ch === 'X' && t.it); G.tiles[b].it.st = 'c'; KCApp.KC.interact(G, ch, b); KCApp.KC.interact(G, ch, G.tiles.findIndex(t => t.ch === 'Q')); }); await p.waitForTimeout(300);
ok(/Ausgabe/.test(await tt()), 'Schritt 5: ' + await tt());
await act(() => { const G = KCApp.A.G, ch = G.chefs[0]; KCApp.KC.interact(G, ch, G.tiles.findIndex(t => t.ch === 'A')); }); await p.waitForTimeout(500);
ok(/Geschafft/.test(await tt()), 'Übung geschafft');
await p.waitForFunction(() => KCApp.A.G && !KCApp.A.cfg.tutorial, null, { timeout: 15000 }); ok(true, 'Danach startet die echte Schicht');
await p.waitForFunction(() => KCApp.A.count <= 0, null, { timeout: 30000 }); await p.waitForTimeout(200);
// Spieler: Kiste Salat holen – nach links laufen und Leertaste
await p.keyboard.down('KeyA'); await p.waitForTimeout(700); await p.keyboard.up('KeyA'); await p.keyboard.press('Space'); await p.waitForTimeout(300);
const held = await p.evaluate(() => { const c = KCApp.A.G.chefs[0]; return c.held && c.held.ing; }); ok(held === 'lettuce', 'Salat aus der Kiste genommen: ' + held);
await p.evaluate(() => { const G = KCApp.A.G; G.chefs[0].bot = true; KCApp.A.speed = 2; });
await p.waitForTimeout(6000); await shot('game');
ok(await p.evaluate(() => document.getElementById('hintL').textContent.length > 3), 'Tipp-Zeile zeigt, was man tun kann');
const mid = await p.evaluate(() => ({ served: KCApp.A.G.served, orders: KCApp.A.G.orders.length, tickets: document.querySelectorAll('#orders .tk').length })); ok(mid.tickets === mid.orders && mid.orders > 0, 'Bestellzettel angezeigt: ' + JSON.stringify(mid));
await p.keyboard.press('Escape'); await p.waitForTimeout(300); ok(await p.isVisible('#ovPause'), 'Pause'); await shot('pause'); await p.click('#paGo', { force: true });
await p.evaluate(() => { KCApp.A.speed = 12; });
await p.waitForSelector('#sResult.on', { timeout: 150000 }); await p.waitForTimeout(2000); await shot('result');
const res = await p.evaluate(() => ({ score: document.getElementById('reScore').textContent, st: KCApp.ST }));
ok(res.st.best.imbiss > 0, 'Rekord gespeichert: ' + res.score);
ok(await p.evaluate(() => +localStorage.getItem('kuechen-chaos-highscore') > 0), 'Highscore gespeichert');
// Touch-Ansicht am Handy
const c2 = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true }); const m = await c2.newPage(); m.on('pageerror', e => errs.push('MOBIL ' + e.message));
await m.goto(BASE + 'kuechen-chaos/index.html'); await m.waitForSelector('#sTitle.on', { timeout: 15000 });
await m.evaluate(() => KCApp.startSolo(0)); await m.waitForFunction(() => KCApp.A.count <= 0, null, { timeout: 30000 });
ok(await m.isVisible('#tpad .tb-a'), 'Touch-Steuerung sichtbar');
const gb = await m.locator('#tpad .tb-a').boundingBox(); await m.evaluate(() => { const c = KCApp.A.G.chefs[0]; c.x = 1.5; c.z = 2.5; c.fx = -1; c.fz = 0; });
await m.dispatchEvent('#tpad', 'pointerdown', { pointerId: 3, clientX: gb.x + gb.width / 2, clientY: gb.y + gb.height / 2, bubbles: true }); await m.waitForTimeout(200); await m.dispatchEvent('#tpad', 'pointerup', { pointerId: 3, bubbles: true });
ok(await m.evaluate(() => { const c = KCApp.A.G.chefs[0]; return !!c.held; }), 'NEHMEN-Taste nimmt eine Zutat');
if (OUT) await m.screenshot({ path: OUT + '/kc-touch.jpg', quality: 80 });
console.log(errs.join('\n') || 'no errors'); await b.close(); if (errs.length) process.exitCode = 1;
