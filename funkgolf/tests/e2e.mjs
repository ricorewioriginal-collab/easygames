// Funk-Minigolf 3D – Browser-Test (Playwright): Menü, Schlag per Ziehen, Tastatur und Gamecontroller, Scorekarte, Endstand, Rekord.
// Start: Server im Repo-Ordner (python3 -m http.server 8765), dann node funkgolf/tests/e2e.mjs
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://localhost:8765/funkgolf/';
const ok = (c, m) => { if (!c) { console.error('FAIL', m); process.exitCode = 1; } else console.log('PASS', m); };
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const ctx = await b.newContext({ viewport: { width: 900, height: 600 }, serviceWorkers: 'block' });
await ctx.addInitScript(() => { // simulierter Controller
  window.__pad = { a: false, ax: [0, 0, 0, 0] };
  navigator.getGamepads = () => [{ index: 0, connected: true, axes: window.__pad.ax, buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: i === 0 && window.__pad.a, value: 0 })) }];
});
const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
const st = () => pg.evaluate(() => FUNKGOLF.state());
const waitRest = async () => { for (let i = 0; i < 80; i++) { const s = await st(); if (s.state !== 'roll') return s; await pg.waitForTimeout(150); } return st(); };
await pg.goto(URL); await pg.waitForTimeout(800);
ok(await pg.isVisible('#sMenu'), 'Menü sichtbar');
await pg.click('#bAddP'); ok(await pg.locator('#pList .pRow').count() === 2, 'zweiter Spieler hinzugefügt');
await pg.click('#pList .rm >> nth=1'); ok(await pg.locator('#pList .pRow').count() === 1, 'Spieler entfernt');
await pg.click('#course .chip[data-c="front"]'); await pg.click('#bPlay'); await pg.waitForTimeout(600);
let s = await st(); ok(s.state === 'aim' && s.hole === 0, 'Bahn 1 startet');
// Ziehen: nach unten ziehen = Schlag nach vorn (Richtung Loch)
// Wischen neben dem Ball dreht nur die Kamera
await pg.mouse.move(120, 200); await pg.mouse.down(); await pg.mouse.move(320, 220, { steps: 8 }); await pg.mouse.up(); await pg.waitForTimeout(300);
s = await st(); ok(s.strokes === 0 && s.state === 'aim', 'Wischen neben dem Ball schlägt nicht');
await pg.keyboard.press('ArrowLeft'); await pg.waitForTimeout(900); // Kamera wieder hinter den Ball
let bs = await pg.evaluate(() => FUNKGOLF.ballScreen());
await pg.mouse.move(bs.x, bs.y); await pg.mouse.down(); await pg.mouse.move(bs.x, bs.y + 80, { steps: 5 }); await pg.mouse.move(bs.x, bs.y + 150, { steps: 5 }); await pg.mouse.up();
s = await st(); ok(s.strokes === 1, 'Schlag per Ziehen');
s = await waitRest(); ok(s.ball.inCup || s.ball.z > 2, 'Ball rollt Richtung Loch (z=' + s.ball.z.toFixed(2) + ')');
// Tastatur
if (s.state === 'aim') {
  await pg.keyboard.down(' '); await pg.waitForTimeout(350); await pg.keyboard.up(' ');
  s = await st(); ok(s.strokes === 2, 'Schlag per Leertaste'); s = await waitRest();
}
// Gamecontroller: A halten und loslassen
if (s.state === 'aim') {
  const n = s.strokes; await pg.evaluate(() => { __pad.a = true; }); await pg.waitForTimeout(300); await pg.evaluate(() => { __pad.a = false; }); await pg.waitForTimeout(150);
  s = await st(); ok(s.strokes === n + 1, 'Schlag per Gamecontroller'); s = await waitRest();
}
// Bahn sicher beenden: gezielt zum Loch schlagen bis eingelocht oder Höchstzahl
for (let k = 0; k < 10 && (await st()).hole === 0 && (await st()).state === 'aim'; k++) {
  await pg.evaluate(() => { const s = FUNKGOLF.state(), h = { cup: [1.2, 9] }; FUNKGOLF.shootAt(Math.atan2(h.cup[1] - s.ball.z, h.cup[0] - s.ball.x), Math.min(.6, .12 + Math.hypot(h.cup[0] - s.ball.x, h.cup[1] - s.ball.z) * .06)); });
  await waitRest();
}
await pg.waitForSelector('#ovCard:not([hidden])', { timeout: 6000 });
ok(/Nach Bahn 1/.test(await pg.textContent('#cardTitle')), 'Scorekarte nach Bahn 1');
ok((await st()).scores[0][0] > 0, 'Ergebnis eingetragen');
await pg.click('#cardGo'); await pg.waitForTimeout(400); ok((await st()).hole === 1, 'Bahn 2');
// Radio: Sender wählen, läuft weiter, wechseln, aus
await pg.waitForTimeout(1700); await pg.click('#bRadio'); await pg.waitForSelector('#ovRadio:not([hidden])');
ok(await pg.locator('#radioList .rItem').count() === 15, 'Senderliste (13 Sender + Aus + Passend)');
await pg.click('#radioList .rItem[data-v="rockradio24"]'); ok(/Rockradio 24/.test(await pg.textContent('#toast')), 'Sender gewählt');
await pg.click('#radioX'); ok(await pg.evaluate(() => document.querySelector('#bRadio').classList.contains('on')), 'Radio an');
await pg.click('#bRadio'); await pg.click('#radioList .rItem[data-v="auto"]'); ok(/YourTime-FM/.test(await pg.textContent('#toast')), 'Passend zur Bahn');
await pg.click('#radioList .rItem[data-v=""]'); await pg.click('#radioX'); ok(!(await pg.evaluate(() => document.querySelector('#bRadio').classList.contains('on'))), 'Radio aus');
// Kamera
await pg.keyboard.press('c'); await pg.waitForTimeout(200); await pg.click('#bCam');
// restliche Bahnen aufgeben
for (let i = 1; i < 9; i++) {
  await pg.keyboard.press('Escape'); await pg.waitForSelector('#ovMenu:not([hidden])'); await pg.click('#mSkip');
  if (i < 8) { await pg.waitForSelector('#ovCard:not([hidden])', { timeout: 5000 }); await pg.click('#cardGo'); }
  else { await pg.waitForSelector('#ovCard:not([hidden])', { timeout: 5000 }); ok(/Endstand/.test(await pg.textContent('#cardGo')), 'letzte Bahn → Endstand'); await pg.click('#cardGo'); }
}
await pg.waitForSelector('#ovEnd:not([hidden])', { timeout: 3000 });
ok(/Runde geschafft/.test(await pg.textContent('#endTitle')), 'Endstand angezeigt');
ok(await pg.locator('#endTbl td').count() > 9, 'Scorekarte im Endstand');
const stats = await pg.evaluate(() => JSON.parse(localStorage.getItem('funkgolf-stats') || '{}'));
ok(stats.runden === 1, 'Statistik gespeichert');
ok(!(await pg.evaluate(() => localStorage.getItem('funkgolf-highscore'))), 'Bahn 1–9 zählt nicht für die Rangliste');
await pg.click('#endMenu'); ok(await pg.isVisible('#sMenu'), 'zurück im Menü');
ok(/1 Runden gespielt/.test(await pg.textContent('#menuStat')), 'Statistik im Menü');
// Handyformat
await pg.setViewportSize({ width: 390, height: 780 }); await pg.click('#course .chip[data-c="all"]'); await pg.click('#bPlay'); await pg.waitForTimeout(800);
const box = await pg.locator('.hTop').boundingBox(); ok(box && box.width <= 390, 'HUD passt aufs Handy');
ok(errs.length === 0, 'keine Fehler ' + errs.join(' | '));
await b.close();
