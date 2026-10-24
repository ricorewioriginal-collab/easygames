// Brainrot Parkour – Browser-Test: Titel → Menü → Figurenwahl → Obby (laufen, springen, Checkpoint, Ziel) → Ergebnis;
// Rennen, Pavimento Lava, Torre Infinita, Chi lo dice?, Handy mit Touch.
// Start: Server im Repo-Ordner, dann node brainrot-parkour/tests/e2e.mjs [Screenshot-Ordner] [Basis-URL]
import { chromium } from 'playwright';
const OUT = process.argv[2] || '', BASE = process.argv[3] || 'http://localhost:8766/';
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
const ok = (c, m) => { if (!c) { errs.push('FAIL ' + m); console.log('FAIL', m); } else console.log('ok', m); };
const shot = async (n, pg) => { if (OUT) await (pg || p).screenshot({ path: OUT + '/br-' + n + '.jpg', quality: 80 }); };
await p.goto(BASE + 'brainrot-parkour/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload();
await p.waitForSelector('#sTitle.on', { timeout: 20000 }); await p.waitForTimeout(1200); await shot('title');
await p.keyboard.press('Enter'); await p.waitForSelector('#sMenu.on'); await p.waitForTimeout(800); await shot('menu'); ok(true, 'Menü');
await p.click('[data-go="chars"]'); await p.waitForSelector('#sChars.on'); await p.waitForTimeout(2500);
ok(await p.locator('.ccard').count() >= 12, 'Figuren: ' + await p.locator('.ccard').count());
await p.click('.ccard[data-c="hippo"]'); await p.waitForTimeout(600); await shot('chars'); await p.click('#chOk'); ok(await p.evaluate(() => BRApp.SET.char) === 'hippo', 'Figur gewählt');
await p.click('[data-go="obby"]'); await p.waitForSelector('#sWorld.on'); await shot('world');
ok(await p.isDisabled('.wcard[data-w="1"]'), 'Welt 2 anfangs gesperrt');
await p.click('#diffSeg .sg[data-v="bambini"]'); await p.click('#wdGo'); await p.waitForSelector('#sGame.on');
await p.evaluate(() => BRApp.sim(3.4));
const z0 = await p.evaluate(() => BRApp.G.me.z);
await p.keyboard.down('KeyW'); await p.evaluate(() => BRApp.sim(.6)); await p.keyboard.down('Space'); await p.evaluate(() => BRApp.sim(.4)); await p.keyboard.up('Space'); await p.keyboard.up('KeyW');
const z1 = await p.evaluate(() => BRApp.G.me.z); ok(z1 > z0 + 2, 'Tastatur läuft vorwärts (' + z0.toFixed(1) + ' → ' + z1.toFixed(1) + ')');
await p.waitForTimeout(500); await shot('game');
// Computer steuert die eigene Figur bis ins Ziel (prüft Checkpoints, Münzen, Ziel)
await p.evaluate(() => { const G = BRApp.G, C = BRApp.C, r = C.rng(3); G.auto = setInterval(() => {}, 1000); const st = G.me; const orig = C.step; BRApp._step = orig; C.step = function (W, P, inp, dt, D) { if (P === st) inp = C.botInput(W, P, 2, r); return orig(W, P, inp, dt, D); }; });
for (let i = 0; i < 30 && !(await p.evaluate(() => BRApp.G.me.cp >= 1)); i++) await p.evaluate(() => BRApp.sim(2)); ok(await p.evaluate(() => BRApp.G.me.cp >= 1), 'Checkpoint erreicht'); await p.waitForTimeout(400); await shot('checkpoint');
await p.evaluate(() => { const G = BRApp.G; G.me.cp = G.W.cps[G.W.cps.length - 1].n; BRApp.C.respawn(G.W, G.me); G.me.wi = undefined; });
for (let i = 0; i < 40 && !(await p.evaluate(() => !BRApp.G || BRApp.G.over)); i++) await p.evaluate(() => BRApp.sim(2));
await p.waitForSelector('#sResult.on', { timeout: 10000 }); await p.waitForTimeout(500); await shot('result');
ok(await p.evaluate(() => BRApp.ST.unlocked) === 2, 'Welt 2 freigeschaltet');
ok(await p.evaluate(() => localStorage.getItem('brainrot-parkour-highscore') !== null), 'Highscore gespeichert');
await p.evaluate(() => { BRApp.C.step = BRApp._step; });
// Rennen
await p.evaluate(() => BRApp.startRace(1, 'normale')); await p.evaluate(() => BRApp.sim(7)); await p.waitForTimeout(300);
ok(await p.evaluate(() => BRApp.G.bots.length === 3 && BRApp.G.bots.some(b => b.P.z > 3 || Math.abs(b.P.x) > 3)), 'Rennen: Computer laufen'); ok(await p.locator('#hRank div').count() === 4, 'Rangliste'); await shot('race');
// Pavimento Lava
await p.evaluate(() => BRApp.startLava()); await p.evaluate(() => BRApp.sim(8)); await p.waitForTimeout(300);
ok(await p.evaluate(() => BRApp.G.W.objs.some(o => o.kind === 'tile' && o.state > 0)), 'Lava: Fliesen bröckeln'); await shot('lava');
await p.evaluate(() => { BRApp.G.me.y = -40; BRApp.sim(.2); }); ok(await p.evaluate(() => BRApp.G.me.out === true), 'Lava: Sturz = raus');
// Torre Infinita
await p.evaluate(() => BRApp.startTower()); await p.evaluate(() => BRApp.sim(3.4));
await p.evaluate(() => { const G = BRApp.G, C = BRApp.C, r = C.rng(2), st = G.me, orig = BRApp._step; C.step = function (W, P, inp, dt, D) { if (P === st) inp = C.botInput(W, P, 2, r); return orig(W, P, inp, dt, D); }; });
await p.evaluate(() => BRApp.sim(8)); await p.waitForTimeout(300); const h = await p.evaluate(() => BRApp.G ? BRApp.G.top : -1); ok(h > 3, 'Turm: klettert (' + (h || 0).toFixed(1) + ' m)'); await shot('tower');
await p.evaluate(() => { BRApp.C.step = BRApp._step; if (BRApp.G) BRApp.G.sauce = BRApp.G.me.y + 2; BRApp.sim(.5); }); await p.waitForSelector('#sResult.on', { timeout: 10000 }); ok(true, 'Turm: Soße holt dich → Ergebnis');
// Quiz
await p.evaluate(() => BRApp.quizStart()); await p.waitForSelector('#sQuiz.on'); await p.waitForTimeout(800);
const right = await p.evaluate(() => BRApp.Q.cur.right); await p.click(`.qo[data-c="${right}"]`); await p.waitForTimeout(300); ok(await p.evaluate(() => BRApp.Q.score) >= 10, 'Quiz: richtige Antwort zählt'); await shot('quiz');
await p.click('#qBack'); await p.waitForSelector('#sMenu.on');
// Handy
const c2 = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true }); const m = await c2.newPage(); m.on('pageerror', e => errs.push('MOBIL ' + e.message));
await m.goto(BASE + 'brainrot-parkour/index.html'); await m.waitForSelector('#sTitle.on', { timeout: 20000 }); await m.tap('#bPress', { force: true }); await m.waitForSelector('#sMenu.on'); await m.waitForTimeout(600); await shot('m-menu', m);
await m.evaluate(() => { BRApp.startObby(0, 'bambini'); BRApp.sim(3.4); });
ok(await m.isVisible('#tpad .tb-a'), 'Touch: SPRUNG sichtbar');
const jb = await m.locator('#tpad .jb').boundingBox(), jx = jb.x + jb.width / 2, jy = jb.y + jb.height / 2; const mz0 = await m.evaluate(() => BRApp.G.me.z);
await m.dispatchEvent('#tpad', 'pointerdown', { pointerId: 5, clientX: jx, clientY: jy, bubbles: true }); await m.dispatchEvent('#tpad', 'pointermove', { pointerId: 5, clientX: jx, clientY: jy - 60, bubbles: true }); await m.evaluate(() => BRApp.sim(.7));
const ab = await m.locator('#tpad .tb-a').boundingBox(); await m.dispatchEvent('#tpad', 'pointerdown', { pointerId: 6, clientX: ab.x + ab.width / 2, clientY: ab.y + ab.height / 2, bubbles: true }); await m.evaluate(() => BRApp.sim(.15));
ok(await m.evaluate(() => BRApp.G.me.y > .3 || !BRApp.G.me.ground), 'Touch: SPRUNG springt'); await m.dispatchEvent('#tpad', 'pointerup', { pointerId: 6, bubbles: true }); await m.dispatchEvent('#tpad', 'pointerup', { pointerId: 5, bubbles: true });
ok(await m.evaluate(() => BRApp.G.me.z) > mz0 + 1.5, 'Touch: Joystick läuft'); await m.waitForTimeout(300); await shot('m-game', m);
console.log(errs.join('\n') || 'no errors'); await b.close(); if (errs.length) process.exitCode = 1;
