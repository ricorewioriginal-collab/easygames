// Klavierlicht – Browser-Test (Playwright): Titel → Spielmodi → Liederbuch (Karten, Archiv, Suche) → Medaillen → Klassisch
// (Kacheln im Takt, Fehler kostet Herzen, 3 Fehler = vorbei), Pause, Ergebnis + Rekord, Magie (Lichter), Üben (Tempo), Endlos
// (nächste Runde schneller), Tages-Challenge, Zuhören, Rechte-Angabe überall, Archiv offline, Handy-Touch.
// Start: Server im Repo-Ordner, dann node klavierlicht/tests/e2e.mjs [Screenshot-Ordner] [Basis-URL]
import { chromium } from 'playwright';
const OUT = process.argv[2] || '', BASE = (process.argv[3] || 'http://localhost:8766/') + 'klavierlicht/';
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }), errs = [];
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) errs.push('FAIL ' + m); };
async function page(opt) { const ctx = await b.newContext(Object.assign({ serviceWorkers: 'block' }, opt)); await ctx.route(/anmacha-cloud\.js/, r => r.fulfill({ status: 200, body: '', contentType: 'text/javascript' }));
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push('PAGE ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); }); return [ctx, p]; }
// spielt im Takt: drückt die Taste der richtigen Bahn, sobald eine Kachel/ein Licht die Linie erreicht
const play = (p, sec) => p.evaluate(async (sec) => { const G = KLApp.game, end = performance.now() + sec * 1000;
  while (G.run && performance.now() < end) { const keys = { 4: ['KeyD', 'KeyF', 'KeyJ', 'KeyK'], 5: ['KeyD', 'KeyF', 'Space', 'KeyJ', 'KeyK'], 6: ['KeyS', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'KeyL'] }[G.L.lanes];
    const t = KLPiano.ctx.currentTime - G.t0, n = G.notes.find(n => n.hit === null && n.t - t < 0.02 && n.t - t > -0.08);
    if (n) { const code = keys[n.lane]; dispatchEvent(new KeyboardEvent('keydown', { code, key: code === 'Space' ? ' ' : code.slice(3).toLowerCase(), bubbles: true })); dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true })); }
    await new Promise(r => setTimeout(r, 6)); } }, sec);
const [, p] = await page({ viewport: { width: 1280, height: 800 } });
await p.goto(BASE); await p.waitForSelector('#sTitle.on', { timeout: 6000 }); ok(true, 'Ladebildschirm → Titel');
await p.keyboard.press('Enter'); await p.waitForSelector('#sMenu.on'); ok(await p.locator('.mi[data-go]').count() === 8, 'Konsolen-Menü: 6 Spielmodi + Hilfe + Einstellungen');
await p.click('.mi[data-go="klassisch"]'); await p.waitForSelector('#sLib.on'); await p.waitForFunction(() => KLApp.archive, null, { timeout: 8000 });
const n = await p.locator('.card').count(); ok(n >= 100, `Liederbuch mit ${n} Liedern (im Spiel + Online-Archiv)`);
ok(await p.locator('.card .lic').evaluateAll(a => a.every(x => /©.+gemeinfrei/.test(x.textContent))), 'jede Liedkarte zeigt die Rechte-Angabe');
await p.fill('#libSearch', 'bach'); ok(await p.locator('.card').count() >= 25, 'Suche „bach“ findet die Choräle'); await p.fill('#libSearch', '');
await p.click('[data-cat="weihnacht"]'); ok(await p.locator('.card').count() >= 15, 'Kategorie Weihnachten'); await p.click('[data-cat="alle"]');
await p.click('.card[data-id="entchen"]'); await p.waitForSelector('#sSong.on'); ok(await p.locator('.medal').count() === 3 && /gemeinfrei/.test(await p.textContent('#sgInfo')), 'Medaillen Leicht/Mittel/Schwer + Rechte-Angabe');
await p.click('.medal[data-l="normal"]'); await p.waitForSelector('#sGame.on'); ok(await p.evaluate(() => KLApp.game.tiles && KLApp.game.L.lanes === 4 && KLApp.game.lives === 3), 'Klassisch: Kacheln, 4 Bahnen, 3 Herzen');
ok(/gemeinfrei/.test(await p.textContent('#gLic')), 'Rechte-Angabe im Spiel');
await p.waitForTimeout(1800); await play(p, 8);
const s1 = await p.evaluate(() => KLApp.game.st); ok(s1.perfect + s1.good >= 8 && s1.miss === 0, `im Takt gespielt: ${s1.perfect} perfekt, ${s1.good} gut, ${s1.miss} daneben`);
if (OUT) await p.screenshot({ path: OUT + '/kl-kacheln.jpg', quality: 80 });
await p.keyboard.press('Escape'); ok(await p.isVisible('#ovBox h2:has-text("Pause")'), 'Pause mit Esc'); await p.click('[data-act="go"]');
// ins Leere tippen kostet Herzen, nach 3 Fehlern ist Schluss
await p.evaluate(() => { const G = KLApp.game, t = KLPiano.ctx.currentTime - G.t0; for (let i = 0; i < 4; i++) { const free = [0, 1, 2, 3].find(l => !G.notes.some(n => n.hit === null && n.lane === l && n.t - t < 0.6)); if (free != null) KLApp.laneHit(free); } });
await p.waitForSelector('.res', { timeout: 3000 }); ok(await p.isVisible('.res h2:has-text("Leider daneben")'), 'drei Fehler → Leider daneben');
ok(await p.evaluate(() => { const b = JSON.parse(localStorage.getItem('klavierlicht-best2')); return b['klassisch:normal:b:entchen'].score > 0 && +localStorage.getItem('klavierlicht-highscore') > 0; }), 'Bestwert und Highscore gespeichert');
await p.click('[data-act="again"]'); await p.waitForTimeout(2500); await play(p, 3); await p.evaluate(() => { KLApp.game.len = 0; }); await p.waitForSelector('.res'); ok(/gemeinfrei/.test(await p.textContent('.res .copy')), 'Ergebnis mit Sternen und Rechte-Angabe');
// Magie (Lichter) mit Archiv-Lied (Bach-Choral, Original-Satz)
await p.evaluate(() => { document.getElementById('ov').hidden = true; KLApp.menu(); }); await p.click('.mi[data-go="magie"]'); await p.waitForSelector('#sLib.on');
await p.fill('#libSearch', 'Wachet'); await p.click('.card'); await p.click('.medal[data-l="profi"]'); await p.waitForSelector('#sGame.on');
ok(await p.evaluate(() => !KLApp.game.tiles && KLApp.game.L.lanes === 6 && KLApp.game.acc.length > 100), 'Magie: Lichter, 6 Bahnen, Bachs Satz als Begleitung');
await p.waitForTimeout(2500); await play(p, 4); ok(await p.evaluate(() => KLApp.game.st.perfect + KLApp.game.st.good) >= 3, 'Magie: Lichter treffen');
if (OUT) await p.screenshot({ path: OUT + '/kl-lichter.jpg', quality: 80 });
// Üben mit 50 % Tempo
await p.evaluate(() => { KLApp.game.run = false; KLApp.menu(); }); await p.click('.mi[data-go="ueben"]'); await p.click('.card[data-id="ode"]');
await p.fill('#rate', '0.5'); await p.dispatchEvent('#rate', 'input'); await p.click('.medal[data-l="leicht"]'); await p.waitForSelector('#sGame.on');
ok(await p.evaluate(() => KLApp.game.rate === 0.5 && KLApp.game.lives === 0), 'Üben: halbes Tempo, keine Herzen');
// Endlos: nächste Runde schneller
await p.evaluate(() => { KLApp.game.run = false; KLApp.setMode('endlos'); KLApp.pick(KLApp.allSongs().find(s => s.id === 'jakob'), 'leicht'); }); await p.waitForSelector('#sGame.on');
await p.waitForTimeout(400); await p.evaluate(() => { KLApp.game.notes.forEach(n => { n.hit = 'perfect'; n.at = 0; }); KLApp.game.len = -10; }); await p.waitForTimeout(400);
ok(await p.evaluate(() => KLApp.game.round === 2 && KLApp.game.rate > 1.05 && KLApp.game.run), 'Endlos: Runde 2, 10 % schneller');
// Tages-Challenge
await p.evaluate(() => { KLApp.game.run = false; KLApp.menu(); }); await p.click('.mi[data-go="tag"]'); await p.waitForSelector('#sGame.on', { timeout: 6000 }); ok(await p.evaluate(() => KLApp.game.level === 'normal' && !!KLApp.song), 'Tages-Challenge startet ein Lied auf Mittel');
// Zuhören
await p.evaluate(() => { KLApp.game.run = false; KLApp.menu(); }); await p.click('.mi[data-go="hoeren"]'); await p.click('.card[data-id="elise"]'); await p.waitForSelector('#sGame.on');
await p.waitForTimeout(3500); ok(await p.evaluate(() => KLApp.game.auto && KLApp.game.st.perfect > 0), 'Zuhören: Klavier spielt selbst');
// Archiv nicht erreichbar
const [c2, q] = await page({ viewport: { width: 1000, height: 700 } }); await c2.route(/archiv\/index\.json/, r => r.abort());
await q.goto(BASE); await q.waitForSelector('#sTitle.on', { timeout: 6000 }); await q.click('#bPress'); await q.click('.mi[data-go="klassisch"]'); await q.waitForSelector('#retry', { timeout: 6000 });
ok(await q.locator('.card').count() === 10, 'Archiv offline: 10 Lieder im Spiel + Hinweis');
// Handy
const [, m] = await page({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true });
await m.goto(BASE); await m.waitForSelector('#sTitle.on', { timeout: 6000 }); await m.tap('#bPress'); await m.tap('.mi[data-go="klassisch"]'); await m.tap('.card[data-id="jakob"]'); await m.tap('.medal[data-l="leicht"]'); await m.waitForSelector('#sGame.on'); await m.waitForTimeout(2500);
const hit = await m.evaluate(async () => { const G = KLApp.game, cv = document.getElementById('cv'), r = cv.getBoundingClientRect(), end = performance.now() + 3000;
  while (performance.now() < end && G.run) { const t = KLPiano.ctx.currentTime - G.t0, n = G.notes.find(n => n.hit === null && Math.abs(n.t - t) < 0.03);
    if (n) cv.dispatchEvent(new PointerEvent('pointerdown', { clientX: r.left + (n.lane + 0.5) * r.width / G.L.lanes, clientY: r.top + r.height * 0.8, bubbles: true, pointerType: 'touch' }));
    await new Promise(r => setTimeout(r, 8)); } return G.st.perfect + G.st.good; });
ok(hit >= 3, `Handy: Kacheln antippen trifft (${hit})`);
console.log(errs.length ? '\n' + errs.join('\n') : '\nAlle Browser-Tests bestanden'); await b.close(); process.exit(errs.length ? 1 : 0);
