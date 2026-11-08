// Klavierlicht – Browser-Test (Playwright): Titel → Menü → Liederbuch → Lied spielen (Tastatur, im Takt), Pause, Ergebnis + Rekord,
// Online-Archiv laden und spielen, Archiv offline (Fehlermeldung), Zuhören, Handy-Touch.  Start: Server im Repo-Ordner, dann
// node klavierlicht/tests/e2e.mjs [Screenshot-Ordner] [Basis-URL]
import { chromium } from 'playwright';
const OUT = process.argv[2] || '', BASE = (process.argv[3] || 'http://localhost:8766/') + 'klavierlicht/';
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }), errs = [];
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) errs.push('FAIL ' + m); };
async function page(opt) { const ctx = await b.newContext(Object.assign({ serviceWorkers: 'block' }, opt)); await ctx.route(/anmacha-cloud\.js/, r => r.fulfill({ status: 200, body: '', contentType: 'text/javascript' }));
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push('PAGE ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); }); return [ctx, p]; }
// spielt bis zum Ende: drückt die Taste der richtigen Bahn, wenn ein Licht die Linie erreicht (bis max Sekunden)
async function autoplay(p, max) {
  await p.evaluate(async (max) => { const G = KLApp.game, keys = { 4: ['KeyD', 'KeyF', 'KeyJ', 'KeyK'], 5: ['KeyD', 'KeyF', 'Space', 'KeyJ', 'KeyK'], 6: ['KeyS', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'KeyL'] }[G.L.lanes];
    const end = performance.now() + max * 1000;
    while (G.run && performance.now() < end) { const t = KLPiano.ctx.currentTime - G.t0; const n = G.notes.find(n => n.hit === null && n.t - t < 0.02 && n.t - t > -0.08);
      if (n) { const code = keys[n.lane]; dispatchEvent(new KeyboardEvent('keydown', { code, key: code === 'Space' ? ' ' : code.slice(3).toLowerCase(), bubbles: true })); dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true })); }
      await new Promise(r => setTimeout(r, 8)); } }, max);
}
const [, p] = await page({ viewport: { width: 1280, height: 800 } });
await p.goto(BASE); await p.waitForSelector('#sTitle.on', { timeout: 6000 }); ok(true, 'Ladebildschirm → Titel');
await p.keyboard.press('Enter'); await p.waitForSelector('#sMenu.on'); ok(await p.locator('.mi').count() === 5, 'Konsolen-Menü mit 5 Punkten');
await p.click('.mi[data-go="play"]'); await p.waitForSelector('#sLib.on'); ok(await p.locator('.song').count() === 10, '10 Lieder im Spiel');
await p.fill('#libSearch', 'elise'); ok(await p.locator('.song').count() === 1, 'Suche findet Für Elise'); await p.fill('#libSearch', '');
await p.click('[data-cat="weihnacht"]'); ok(await p.locator('.song').count() === 3, 'Kategorie Weihnachten: 3 Lieder'); await p.click('[data-cat="alle"]');
await p.click('[data-l="normal"]');
await p.click('.song[data-id="entchen"]'); await p.waitForSelector('#sGame.on'); ok(await p.evaluate(() => KLApp.game.L.lanes === 5 && KLApp.game.notes.length > 40), 'Spiel startet: 5 Bahnen (Normal)');
await p.waitForTimeout(2600); await autoplay(p, 8);
const s1 = await p.evaluate(() => KLApp.game.st); ok(s1.perfect + s1.good >= 8 && s1.score > 500, `im Takt gespielt: ${s1.perfect} perfekt, ${s1.good} gut, ${s1.miss} daneben`);
if (OUT) await p.screenshot({ path: OUT + '/kl-spiel.jpg', quality: 80 });
await p.keyboard.press('Escape'); ok(await p.isVisible('#ovBox h2:has-text("Pause")') && await p.evaluate(() => KLApp.game.paused), 'Pause mit Esc');
await p.click('[data-act="go"]'); ok(await p.evaluate(() => !KLApp.game.paused), 'weiter');
await p.evaluate(() => { KLApp.game.len = 0; }); await p.waitForSelector('.res', { timeout: 3000 }); ok(await p.isVisible('.res .stats'), 'Ergebnis mit Punkten');
ok(await p.evaluate(() => { const b = JSON.parse(localStorage.getItem('klavierlicht-best')); return b['b:entchen'].score > 0 && +localStorage.getItem('klavierlicht-highscore') > 0; }), 'Bestwert und Highscore gespeichert');
// Online-Archiv
await p.click('[data-act="lib"]'); await p.click('[data-tab="archiv"]'); await p.waitForSelector('.song[data-on="1"]', { timeout: 5000 });
ok(await p.locator('.song[data-on="1"]').count() === 18, 'Online-Archiv: 18 Lieder geladen');
await p.click('[data-l="leicht"]'); await p.click('.song[data-id="korobeiniki"]'); await p.waitForSelector('#sGame.on'); ok(await p.evaluate(() => KLApp.game.L.lanes === 4 && KLApp.game.chart.title === 'Korobeiniki'), 'Archiv-Lied gestartet (Leicht, 4 Bahnen)');
await p.waitForTimeout(2600); await p.evaluate(async () => { const G = KLApp.game, end = performance.now() + 4000; while (performance.now() < end) { const t = KLPiano.ctx.currentTime - G.t0; if (G.notes.find(n => n.hit === null && Math.abs(n.t - t) < 0.03)) dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA', key: 'a', bubbles: true })); await new Promise(r => setTimeout(r, 10)); } });
ok(await p.evaluate(() => KLApp.game.st.perfect + KLApp.game.st.good) >= 3, 'Leicht: beliebige Taste im Takt zählt');
await p.evaluate(() => { KLApp.game.len = 0; }); await p.waitForSelector('.res'); await p.click('[data-act="lib"]');
// Zuhören
await p.evaluate(() => KLApp.menu()); await p.click('.mi[data-go="listen"]'); await p.click('.song[data-id="ode"]'); await p.waitForSelector('#sGame.on'); ok(await p.isVisible('#gAuto'), 'Zuhören-Modus');
await p.waitForTimeout(4200); ok(await p.evaluate(() => KLApp.game.st.perfect > 0), 'Zuhören: Klavier spielt selbst'); await p.evaluate(() => { KLApp.game.len = 0; }); await p.waitForSelector('.res'); await p.keyboard.press('Escape');
// Archiv nicht erreichbar
const [c2, q] = await page({ viewport: { width: 1000, height: 700 } }); await c2.route(/archiv\/index\.json/, r => r.abort());
await q.goto(BASE); await q.waitForSelector('#sTitle.on', { timeout: 6000 }); await q.click('#bPress'); await q.click('.mi[data-go="arch"]'); await q.waitForSelector('#retry', { timeout: 6000 }); ok(true, 'Archiv offline: Hinweis + Nochmal-Knopf');
// Handy
const [, m] = await page({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true });
await m.goto(BASE); await m.waitForSelector('#sTitle.on', { timeout: 6000 }); await m.tap('#bPress'); await m.tap('.mi[data-go="play"]'); await m.tap('.song[data-id="jakob"]'); await m.waitForSelector('#sGame.on'); await m.waitForTimeout(2600);
const hit = await m.evaluate(async () => { const G = KLApp.game, cv = document.getElementById('cv'), r = cv.getBoundingClientRect(), end = performance.now() + 3000;
  while (performance.now() < end) { const t = KLPiano.ctx.currentTime - G.t0, n = G.notes.find(n => n.hit === null && Math.abs(n.t - t) < 0.03);
    if (n) { const x = r.left + (n.lane + 0.5) * r.width / G.L.lanes; cv.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: r.top + r.height * 0.85, bubbles: true, pointerType: 'touch' })); }
    await new Promise(r => setTimeout(r, 10)); } return G.st.perfect + G.st.good; });
ok(hit >= 3, `Handy: Bahnen antippen trifft (${hit})`);
console.log(errs.length ? '\n' + errs.join('\n') : '\nAlle Browser-Tests bestanden'); await b.close(); process.exit(errs.length ? 1 : 0);
