// Die große Challenge-Show – Browser-Test: Titel → Menü → Kandidat → Show (jede Runde: Steuerung prüfen, Screenshot) → Siegerehrung → Ergebnis; Handy mit Touch.
// Start: Server im Repo-Ordner, dann node challenge-show/tests/e2e.mjs [Screenshot-Ordner] [Basis-URL]
import { chromium } from 'playwright';
const OUT = process.argv[2] || '', BASE = process.argv[3] || 'http://localhost:8766/';
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
const ok = (c, m) => { if (!c) { errs.push('FAIL ' + m); console.log('FAIL', m); } else console.log('ok', m); };
const shot = async (n, pg) => { if (OUT) await (pg || p).screenshot({ path: OUT + '/cs-' + n + '.jpg', quality: 80 }); };
const sim = s => p.evaluate(s => CSApp.sim(s), s);
const st = () => p.evaluate(() => { const G = CSApp.G; return G ? { ph: G.phase, rd: G.S.round, alive: CSApp.C.alive(G.S).length, done: G.S.done } : null; });
await p.goto(BASE + 'challenge-show/index.html?lowfx'); await p.evaluate(() => localStorage.clear()); await p.reload();
await p.waitForSelector('#sTitle.on', { timeout: 20000 }); await p.waitForTimeout(1500); await shot('title');
await p.keyboard.press('Enter'); await p.waitForSelector('#sMenu.on'); await p.waitForTimeout(1200); await shot('menu'); ok(true, 'Menü');
ok(/Online/.test(await p.textContent('[data-go="online"]')), 'Menü zeigt 🌐 Online');
await p.click('[data-go="cand"]'); await p.waitForSelector('#sCand.on'); await p.fill('#cName', 'Rico'); await p.click('.sw[data-i="3"]'); await p.click('#cHats .sg[data-v="5"]'); await shot('cand'); await p.click('#cOk');
ok(await p.evaluate(() => CSApp.SET.name === 'Rico' && CSApp.SET.col === 3 && CSApp.SET.hat === 5), 'Kandidat gespeichert');
await p.click('[data-go="show"]'); await p.waitForSelector('#sSetup.on'); await p.click('#suN .sg[data-v="12"]'); await p.click('#suGo'); await p.waitForSelector('#sGame.on');
ok((await st()).rd === 'ampel', 'Show beginnt mit dem Ampel-Lauf'); await p.waitForTimeout(600); await shot('card');
await p.keyboard.press('Enter'); await sim(4.6); ok((await st()).ph === 'play', 'Rundenkarte → Countdown → Spiel');
// Ampel: selbst laufen, bei Rot stehen bleiben
await p.evaluate(() => { const R = CSApp.G.S.R; R.light = 'green'; R.lt = 3; });
const z0 = await p.evaluate(() => CSApp.G.S.cons[0].z); await p.keyboard.down('KeyW'); await sim(1.2); await p.keyboard.up('KeyW');
const z1 = await p.evaluate(() => CSApp.G.S.cons[0].z); ok(z1 > z0 + 3, `Tastatur läuft (${z0.toFixed(1)} → ${z1.toFixed(1)})`);
await sim(.3); await p.waitForTimeout(500); await shot('ampel');
// ab hier steuert der Computer den eigenen Kandidaten, damit jede Runde erreicht wird
await p.evaluate(() => { CSApp.G.S.cons[0].auto = true; });
const seen = {};
for (let i = 0; i < 400; i++) {
  const s = await st(); if (!s || s.done) break;
  if (s.ph === 'play' && !seen[s.rd]) { seen[s.rd] = 1; await sim(s.rd === 'stuhl' ? 9 : 2.5); await p.waitForTimeout(700); await shot('r-' + s.rd); ok(true, 'Runde ' + s.rd + ' läuft (' + s.alive + ' im Spiel)');
    if (s.rd === 'bruecke') ok(await p.locator('#brL').count() === 1 || !(await p.evaluate(() => CSApp.G.S.cons[0].alive)), 'Brücke: Tasten LINKS/RECHTS');
    if (s.rd === 'seil') { const t0 = await p.evaluate(() => CSApp.A.taps); await p.keyboard.press('Space'); ok(await p.evaluate(t0 => CSApp.A.taps === t0 + 1, t0), 'Seil: Leertaste zieht'); }
    if (s.rd === 'keks') ok(await p.locator('#kc').count() === 1 || !(await p.evaluate(() => CSApp.G.S.cons[0].alive)), 'Keks: Zeichenfeld');
  }
  if (s.ph === 'card') await p.keyboard.press('Enter');
  await sim(3);
}
ok(Object.keys(seen).length >= 4, 'Runden gesehen: ' + Object.keys(seen).join(', '));
for (let i = 0; i < 40 && !(await p.evaluate(() => !CSApp.G)); i++) { if ((await st()) && (await st()).ph === 'podium' && i < 2) { await p.waitForTimeout(900); await shot('podium'); } await sim(2); }
await p.waitForSelector('#sResult.on', { timeout: 10000 }); await p.waitForTimeout(600); await shot('result'); ok(true, 'Ergebnis');
ok(await p.evaluate(() => localStorage.getItem('challenge-show-highscore') !== null && CSApp.ST.shows === 1), 'Highscore/Statistik gespeichert');
// Keks direkt: Mensch fährt den Kreis mit der Maus nach
await p.evaluate(() => { CSApp.startSolo({ order: ['keks', 'finale'] }); CSApp.G.S.cons[0].shape = 'kreis'; CSApp.refresh(); CSApp.G.pt = 0; }); await sim(3.4);
ok((await st()).ph === 'play' && await p.locator('#kc').count() === 1, 'Keks-Runde mit Zeichenfeld');
const box = await p.locator('#kc').boundingBox(), P = await p.evaluate(() => CSApp.C.SHAPES.kreis.pts), X = u => box.x + (u * .9 + 1) / 2 * box.width, Y = v => box.y + (v * .9 + 1) / 2 * box.height;
await p.mouse.move(X(P[0][0]), Y(P[0][1])); await p.mouse.down();
for (const q of P.filter((_, i) => i % 2 === 0 || i === P.length - 1)) { await p.mouse.move(X(q[0]), Y(q[1]), { steps: 2 }); await sim(.05); }
await shot('keks-mensch'); await p.mouse.up(); await sim(.3);
ok(await p.evaluate(() => CSApp.G.S.cons[0].kDone && CSApp.G.S.cons[0].alive), 'Kreis sauber nachgefahren → sicher');
// Handy: Touch-Joystick im Stuhl-Spiel
const m = await b.newPage({ viewport: { width: 390, height: 800 }, hasTouch: true, isMobile: true }); m.on('pageerror', e => errs.push('HANDY ' + e.message));
await m.goto(BASE + 'challenge-show/index.html?lowfx'); await m.waitForSelector('#sTitle.on', { timeout: 20000 }); await m.evaluate(() => document.getElementById('bPress').click()); await m.waitForSelector('#sMenu.on'); await m.waitForTimeout(700); await shot('handy-menu', m);
await m.evaluate(() => { CSApp.startSolo({ order: ['stuhl', 'finale'] }); CSApp.G.pt = 0; CSApp.sim(3.4); });
ok(await m.isVisible('#tpad'), 'Handy: Joystick sichtbar'); await m.waitForTimeout(700); await shot('handy-stuhl', m);
await m.evaluate(() => { CSApp.G.S.R.music = 0; CSApp.sim(.5); }); await m.waitForTimeout(600); await shot('handy-stuhl2', m);
await b.close();
console.log(errs.length ? 'FEHLER:\n' + errs.join('\n') : 'ALLES OK'); process.exit(errs.length ? 1 : 0);
