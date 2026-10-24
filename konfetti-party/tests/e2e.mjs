// Konfetti-Party – Browser-Test: Titel → Menü → Turnier → Party (Spieler läuft und legt Bonbons, Rest automatisch) → Siegerehrung; Touch am Handy.
// Start: Server im Repo-Ordner, dann node konfetti-party/tests/e2e.mjs [Screenshot-Ordner] [Basis-URL]
import { chromium } from 'playwright';
const OUT = process.argv[2] || '', BASE = process.argv[3] || 'http://localhost:8766/';
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
const ok = (c, m) => { if (!c) { errs.push('FAIL ' + m); console.log('FAIL', m); } else console.log('ok', m); };
const shot = async n => { if (OUT) await p.screenshot({ path: OUT + '/kp-' + n + '.jpg', quality: 80 }); };
await p.goto(BASE + 'konfetti-party/index.html'); await p.waitForSelector('#sTitle.on', { timeout: 15000 }); await p.waitForTimeout(1500); await shot('title');
await p.click('#bPress', { force: true }); await p.waitForSelector('#sMenu.on'); await p.waitForTimeout(800); await shot('menu'); ok(true, 'Menü');
await p.click('[data-go="tour"]', { force: true }); await p.waitForSelector('#sTour.on'); await shot('tour');
ok(await p.isDisabled('.ar[data-i="1"]'), 'Party 2 anfangs gesperrt');
await p.click('#tourGrid .ar[data-i="0"]', { force: true }); await p.waitForSelector('#sGame.on'); ok(true, 'Party startet');
await p.waitForFunction(() => KPApp.A.phase === 'play', null, { timeout: 30000 });
const x0 = await p.evaluate(() => KPApp.A.G.players[0].x);
await p.keyboard.down('KeyD'); await p.waitForTimeout(400); await p.keyboard.up('KeyD');
const x1 = await p.evaluate(() => KPApp.A.G.players[0].x); ok(x1 > x0 + .3, 'Tastatur bewegt den Gast (' + x0.toFixed(2) + ' → ' + x1.toFixed(2) + ')');
await p.keyboard.press('Space'); await p.waitForTimeout(150); ok(await p.evaluate(() => KPApp.A.G.bombs.some(b => b.owner === 0)), 'Leertaste legt ein Knallbonbon');
await p.keyboard.down('KeyA'); await p.waitForTimeout(500); await p.keyboard.up('KeyA'); await p.keyboard.down('KeyS'); await p.waitForTimeout(700); await p.keyboard.up('KeyS');
await p.waitForTimeout(1600); await shot('game');
await p.evaluate(() => { const G = KPApp.A.G; G.players[0].bot = true; G.players[0].skill = 2; G.time = 20; G.t = Math.min(G.t, 20); KPApp.A.speed = 10; });
await p.waitForSelector('#sResult.on', { timeout: 200000 }); await p.waitForTimeout(1500); await shot('result');
const st = await p.evaluate(() => KPApp.ST); ok(st.matches === 1, 'Party gezählt: ' + JSON.stringify(st));
// Touch am Handy
const c2 = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true }); const m = await c2.newPage(); m.on('pageerror', e => errs.push('MOBIL ' + e.message));
await m.goto(BASE + 'konfetti-party/index.html'); await m.waitForSelector('#sTitle.on', { timeout: 15000 });
await m.evaluate(() => KPApp.startSolo(1, [0, 0], 2, null)); await m.waitForFunction(() => KPApp.A.phase === 'play', null, { timeout: 30000 });
ok(await m.isVisible('#tpad .tb-a'), 'Touch-Steuerung sichtbar');
const ab = await m.locator('#tpad .tb-a').boundingBox();
await m.dispatchEvent('#tpad', 'pointerdown', { pointerId: 3, clientX: ab.x + ab.width / 2, clientY: ab.y + ab.height / 2, bubbles: true }); await m.waitForTimeout(200); await m.dispatchEvent('#tpad', 'pointerup', { pointerId: 3, bubbles: true });
ok(await m.evaluate(() => KPApp.A.G.bombs.some(b => b.owner === 0)), 'KNALL-Taste legt ein Bonbon');
await m.waitForTimeout(800); if (OUT) await m.screenshot({ path: OUT + '/kp-touch.jpg', quality: 80 });
console.log(errs.join('\n') || 'no errors'); await b.close(); if (errs.length) process.exitCode = 1;
