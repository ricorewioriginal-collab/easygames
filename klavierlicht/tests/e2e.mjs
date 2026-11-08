// Klavierlicht – Browser-Test (Playwright): Titel → Spielmodi → Liederbuch (Karten, Archiv, Suche) → Medaillen → Klassisch
// (Kacheln im Takt, Fehler kostet Herzen, 3 Fehler = vorbei), Pause, Ergebnis + Rekord, Magie (Lichter), Üben (Tempo), Endlos
// (nächste Runde schneller), Tages-Challenge, Zuhören, Klavier lernen (farbige Tasten), Freies Klavier, lange Kacheln halten, Wischen, Rechte-Angabe überall, Archiv offline, Handy-Touch.
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
await p.keyboard.press('Enter'); await p.waitForSelector('#sMenu.on'); ok(await p.locator('.mi[data-go]').count() === 10, 'Konsolen-Menü: 8 Spielmodi + Hilfe + Einstellungen');
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
// Klavier lernen: Tastatur, farbige Reihenfolge, richtige Tasten treffen
await p.evaluate(() => { KLApp.game.run = false; KLApp.menu(); }); await p.click('.mi[data-go="lernen"]'); await p.click('.card[data-id="ode"]'); await p.waitForSelector('#sSong.on');
ok(await p.locator('#wait').count() === 1 && await p.locator('#rate').count() === 1, 'Lernen: Tempo und „Warten“ wählbar');
await p.evaluate(() => { document.getElementById('rate').value = 1; document.getElementById('rate').dispatchEvent(new Event('input')); });
await p.click('.medal[data-l="normal"]'); await p.waitForSelector('#sGame.on');
ok(await p.evaluate(() => { const G = KLApp.game; return G.keys && G.learn && G.lay.whites >= 8 && G.notes.every(n => G.kmap[n.p]); }), 'Lernen: Klaviertastatur mit allen Liedtönen');
await p.waitForTimeout(2600);
const lh = await p.evaluate(async () => { const G = KLApp.game, end = performance.now() + 4000; while (performance.now() < end && G.run) { const n = G.notes.find(n => n.hit === null && Math.abs(n.t - G.lt) < 0.03); if (n) { KLApp.keyDown(n.p); KLApp.keyUp(n.p); } await new Promise(r => setTimeout(r, 6)); } return G.st; });
ok(lh.perfect + lh.good >= 4 && lh.miss <= 1, `Lernen: richtige Tasten im Takt (${lh.perfect} perfekt, ${lh.good} gut, ${lh.miss} daneben)`);
if (OUT) await p.screenshot({ path: OUT + '/kl-lernen.png' });
// Warten-Modus: Lied hält an, bis die richtige Taste kommt
await p.evaluate(() => { KLApp.game.run = false; }); await p.evaluate(() => { localStorage.setItem('klavierlicht-settings', JSON.stringify(Object.assign(JSON.parse(localStorage.getItem('klavierlicht-settings') || '{}'), { wait: true }))); });
await p.reload(); await p.waitForSelector('#sTitle.on', { timeout: 6000 }); await p.click('#bPress');
await p.evaluate(() => { KLApp.setMode('lernen'); KLApp.pick(KLApp.allSongs().find(s => s.id === 'jakob'), 'leicht'); }); await p.waitForSelector('#sGame.on'); await p.waitForTimeout(4200);
const w1 = await p.evaluate(() => { const G = KLApp.game; return [G.lt, G.notes[0].t, G.notes[0].hit]; });
ok(Math.abs(w1[0] - w1[1]) < 0.01 && w1[2] === null, 'Warten: Lied hält an der ersten Note an');
await p.evaluate(() => { const G = KLApp.game; KLApp.keyDown(G.notes[0].p); KLApp.keyUp(G.notes[0].p); }); await p.waitForTimeout(300);
ok(await p.evaluate(() => KLApp.game.notes[0].hit === 'good' && KLApp.game.lt > KLApp.game.notes[0].t), 'Warten: richtige Taste → Lied läuft weiter');
// Freies Klavier
await p.evaluate(() => { KLApp.game.run = false; KLApp.menu(); }); await p.click('.mi[data-go="frei"]'); await p.waitForSelector('#sGame.on');
await p.keyboard.down('KeyQ'); await p.keyboard.down('KeyE'); await p.keyboard.down('KeyT'); await p.waitForTimeout(250);
const fr = await p.evaluate(() => { const G = KLApp.game; return { free: G.free, down: Object.keys(G.down).map(Number), lights: G.lights.length, txt: document.getElementById('kOct').textContent }; });
ok(fr.free && fr.down.length === 3 && fr.down[1] - fr.down[0] === 4 && fr.lights === 3, 'Freies Klavier: Akkord mit der Tastatur (' + fr.down.join(', ') + ')');
if (OUT) await p.screenshot({ path: OUT + '/kl-frei.png' });
await p.keyboard.up('KeyQ'); await p.keyboard.up('KeyE'); await p.keyboard.up('KeyT'); await p.keyboard.press('ArrowRight');
ok(await p.evaluate(() => Object.keys(KLApp.game.down).length === 0 && KLApp.game.base === 60), 'Freies Klavier: loslassen und Oktave höher');
const box = await p.locator('#cv').boundingBox();
await p.mouse.move(box.x + 30, box.y + box.height - 30); await p.mouse.down(); await p.mouse.move(box.x + 300, box.y + box.height - 30, { steps: 12 }); 
ok(await p.evaluate(() => KLApp.game.lights.length >= 5 && Object.keys(KLApp.game.down).length === 1), 'Freies Klavier: über die Tasten wischen (Glissando)'); await p.mouse.up();
await p.click('#kPed'); ok(await p.evaluate(() => KLApp.game.pedal), 'Freies Klavier: Pedal');
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
// Handy: lange Kachel halten und über die Bahnen wischen
const hold = await m.evaluate(async () => { KLApp.game.run = false; KLApp.setMode('klassisch'); await KLApp.pick(KLApp.allSongs().find(s => s.id === 'saints'), 'leicht');
  const G = KLApp.game, cv = document.getElementById('cv'), r = cv.getBoundingClientRect(), H = r.height, sp = H * 0.8 / G.L.fall; const n = G.notes.find(n => n.d * sp > H * 0.2 && n.t > 1); if (!n) return 'keine lange Kachel';
  G.notes.forEach(x => { if (x !== n && x.t < n.t + n.d + 0.3) x.hit = 'perfect'; });
  while (KLPiano.ctx.currentTime - G.t0 < n.t - 0.01) await new Promise(q => setTimeout(q, 5));
  const x = r.left + (n.lane + 0.5) * r.width / G.L.lanes, y = r.top + H * 0.75; const s0 = G.st.score;
  cv.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 7, clientX: x, clientY: y, bubbles: true, pointerType: 'touch' }));
  const holding = !!G.hold[n.lane]; while (KLPiano.ctx.currentTime - G.t0 < n.t + n.d + 0.05) await new Promise(q => setTimeout(q, 10));
  cv.dispatchEvent(new PointerEvent('pointerup', { pointerId: 7, clientX: x, clientY: y, bubbles: true, pointerType: 'touch' }));
  return holding && n.held >= 0.97 && G.st.score - s0 > 100 ? 'ok' : 'holding=' + holding + ' held=' + n.held; });
ok(hold === 'ok', 'Handy: lange Kachel gedrückt halten (' + hold + ')');
const sl = await m.evaluate(async () => { const G = KLApp.game, cv = document.getElementById('cv'), r = cv.getBoundingClientRect(); G.run = true; G.lives = 3;
  const t = KLPiano.ctx.currentTime - G.t0; G.notes = [{ t: t + 0.25, p: 60, d: 0.1, lane: 0, hit: null }, { t: t + 0.3, p: 62, d: 0.1, lane: 1, hit: null }, { t: t + 0.35, p: 64, d: 0.1, lane: 2, hit: null }]; G.hold = {};
  const y = r.top + r.height * 0.78, X = l => r.left + (l + 0.5) * r.width / 4;
  cv.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 9, clientX: X(0), clientY: y, bubbles: true, pointerType: 'touch' }));
  for (let l = 1; l <= 2; l++) { await new Promise(q => setTimeout(q, 40)); cv.dispatchEvent(new PointerEvent('pointermove', { pointerId: 9, clientX: X(l), clientY: y, bubbles: true, pointerType: 'touch' })); }
  cv.dispatchEvent(new PointerEvent('pointerup', { pointerId: 9, clientX: X(2), clientY: y, bubbles: true, pointerType: 'touch' }));
  return G.notes.filter(n => n.hit && n.hit !== 'miss').length + '/' + G.lives; });
ok(sl === '3/3', 'Handy: über drei Bahnen wischen trifft drei Kacheln ohne Herz-Verlust (' + sl + ')');
const kt = await m.evaluate(async () => { KLApp.game.run = false; KLApp.startFree(); await new Promise(q => setTimeout(q, 100)); const G = KLApp.game, cv = document.getElementById('cv'), r = cv.getBoundingClientRect(), y = r.top + r.height - 40;
  const ws = G.lay.keys.filter(k => !k.black); [0, 2, 4].forEach((i, j) => cv.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 20 + j, clientX: r.left + ws[i].x + ws[i].w / 2, clientY: y, bubbles: true, pointerType: 'touch' })));
  const n = Object.keys(G.down).length; [0, 1, 2].forEach(j => cv.dispatchEvent(new PointerEvent('pointerup', { pointerId: 20 + j, bubbles: true, pointerType: 'touch' }))); return n + '/' + G.lay.whites + '/' + Object.keys(G.down).length; });
ok(/^3\/\d+\/0$/.test(kt), 'Handy: freies Klavier mit drei Fingern (' + kt + ')');

console.log(errs.length ? '\n' + errs.join('\n') : '\nAlle Browser-Tests bestanden'); await b.close(); process.exit(errs.length ? 1 : 0);
