// Darts-Arena 3D – Browser-Test (Playwright). node darts-arena/tests/e2e.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
const base = process.argv[2] || 'http://localhost:8766/', out = process.argv[3] || '';
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'] });
const errs = [], ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) process.exitCode = 1; };
async function page(vp, touch, q) {
  const ctx = await b.newContext({ viewport: vp, hasTouch: !!touch, isMobile: !!touch, serviceWorkers: 'block' }), p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::|firebase|googleapis/i.test(m.text())) errs.push(m.text()); });
  await p.goto(base + 'darts-arena/' + (q || ''), { waitUntil: 'commit' }); return p;
}
const shot = async (p, n) => { if (out) await p.screenshot({ path: out + '/da-' + n + '.jpg', type: 'jpeg', quality: 80 }); };
const wait = (p, ms) => p.waitForTimeout(ms);
const st = p => p.evaluate(() => { const A = DAApp.A, G = A.G, P = G && G.players[G.cur]; return { cur: DAApp.cur, demo: A.demo, phase: A.phase, mode: G && G.mode, player: G ? G.cur : -1, turn: P && P.turn.map(h => h.code), scores: G && G.players.map(p => p.score), darts: G && G.players.map(p => p.darts), over: G && G.over, aim: Object.assign({}, A.aim), ov: Array.from(document.querySelectorAll('.ov')).filter(o => !o.hidden).map(o => o.id) }; });
const aimWait = (p, t) => p.waitForFunction(() => DAApp.A.phase === 'aim' || DAApp.A.phase === 'over', null, { timeout: t || 30000 });

/* ---------- Desktop: Menü, Tastatur, Computer, Pause ---------- */
const p = await page({ width: 1280, height: 720 });
await p.waitForSelector('#sTitle.on', { timeout: 30000 }); await wait(p, 600); await shot(p, '01-titel');
await p.keyboard.press('Enter'); await wait(p, 500); ok((await st(p)).cur === 'sMenu', 'Titel → Hauptmenü'); await wait(p, 1500); await shot(p, '02-menue');
ok(await p.evaluate(() => document.activeElement.dataset.go) === 'quick', '„Schnelles Spiel“ hat den Fokus');
await p.keyboard.press('Enter'); await wait(p, 700);
let s = await st(p); ok(s.cur === 'sGame' && s.mode === 'x01' && !s.demo && s.scores.join() === '501,501', 'Schnelles Spiel: 501 gegen CPU');
await p.evaluate(() => { DAApp.A.speed = 3; }); // Testtempo, Software-Grafik ist langsam
await wait(p, 900); await shot(p, '03-zielen');
const a0 = (await st(p)).aim; await p.keyboard.down('ArrowLeft'); await wait(p, 400); await p.keyboard.up('ArrowLeft');
ok((await st(p)).aim.x < a0.x - 10, 'Pfeil links verschiebt das Zielkreuz');
await p.evaluate(() => { Object.assign(DAApp.A.aim, { x: 0, y: 103 }); });
// Leertaste halten → Kraftbalken → loslassen = Wurf
await p.keyboard.down('Space'); await p.waitForFunction(() => DAApp.A.power > .5 && DAApp.A.power < .6, null, { timeout: 3000 }).catch(() => { }); await p.keyboard.up('Space');
await p.waitForFunction(() => DAApp.A.G.players[0].darts === 1, null, { timeout: 8000 }).then(() => ok(true, 'Leertaste: Kraft und Wurf'), () => ok(false, 'Leertaste: Kraft und Wurf'));
s = await st(p); ok(s.turn.length === 1, 'Dart gezählt: ' + s.turn[0] + ', Rest ' + s.scores[0]);
for (let k = 0; k < 2; k++) { await aimWait(p); await p.evaluate(() => DAApp.release({ x: 0, y: 103 })); await wait(p, 100); }
await p.waitForFunction(() => DAApp.A.phase === 'after', null, { timeout: 8000 }); await wait(p, 200); await shot(p, '04-aufnahme');
await p.waitForFunction(() => DAApp.A.G.cur === 1, null, { timeout: 10000 }); ok(true, 'Nach 3 Darts ist der Computer dran');
await p.waitForFunction(() => DAApp.A.G.cur === 0 && DAApp.A.G.players[1].darts === 3, null, { timeout: 20000 }).then(() => ok(true, 'Computer wirft 3 Darts'), () => ok(false, 'Computer wirft 3 Darts'));
s = await st(p); ok(s.scores[1] < 501, 'Computer hat gepunktet: ' + s.scores[1]);
await aimWait(p); await p.keyboard.press('Escape'); await wait(p, 200); ok((await st(p)).ov.includes('ovPause'), 'Esc = Pause'); await p.click('#pGo'); await wait(p, 200);
// Bust und Leg-Gewinn
await p.evaluate(() => { const P = DAApp.A.G.players[0]; P.score = 32; P.snap.score = 32; });
await p.evaluate(() => DAApp.release({ x: 0, y: 103 })); await p.waitForFunction(() => DAApp.A.G.cur === 1 || DAApp.A.phase === 'after', null, { timeout: 8000 });
ok((await st(p)).scores[0] === 32, 'Bust: T20 bei Rest 32 zählt nicht'); await shot(p, '05-bust');
await p.waitForFunction(() => DAApp.A.G.cur === 0 && DAApp.A.phase === 'aim', null, { timeout: 25000 });
await p.evaluate(() => { const P = DAApp.A.G.players[0]; P.score = 32; P.snap.score = 32; }); await p.evaluate(() => DAApp.release({ x: Math.sin(Math.PI * 18 * 13 / 180) * 166, y: Math.cos(Math.PI * 18 * 13 / 180) * 166 }));
await p.waitForFunction(() => !document.getElementById('ovEnd').hidden, null, { timeout: 10000 }).then(() => ok(true, 'Doppel 16 checkt aus – Spielende'), () => ok(false, 'Doppel 16 checkt aus – Spielende'));
ok((await p.textContent('#eTitle')).includes('Du'), 'Sieger angezeigt: ' + await p.textContent('#eTitle')); await shot(p, '06-ende');
ok(await p.evaluate(() => JSON.parse(localStorage.getItem('darts-arena-stats')).hiCo) === 32, 'Höchstes Checkout gespeichert');
await p.click('#eMenu'); await wait(p, 300); ok((await st(p)).cur === 'sMenu' && (await st(p)).demo, 'Zurück im Menü (Demo läuft)');

/* ---------- Modi einrichten: Elimination mit Rauswerfen ---------- */
await p.click('[data-go="modes"]'); await wait(p, 300); ok((await st(p)).cur === 'sModes', 'Spielmodi-Liste');
ok(await p.locator('#modeGrid .mode').count() === 9, '9 Spielmodi im Wettkampf'); await shot(p, '07-modi');
await p.click('[data-m="elimination"]'); await wait(p, 300); ok((await st(p)).cur === 'sSetup', 'Einrichtung Elimination');
await p.click('[data-k="1"]'); await p.click('[data-k="1"]'); await wait(p, 100); ok((await p.textContent('[data-k="1"]')).includes('Mensch'), 'Platz 2 auf Mensch umgestellt');
await shot(p, '08-einrichtung');
await p.click('#setGo'); await wait(p, 600); s = await st(p); ok(s.mode === 'elimination' && s.scores.join() === '0,0', 'Elimination startet bei 0');
const T20 = { x: 0, y: 103 }, S5 = { x: Math.sin(Math.PI * 18 * 19 / 180) * 135, y: Math.cos(Math.PI * 18 * 19 / 180) * 135 };
for (const pt of [T20, T20, S5]) { await aimWait(p); await p.evaluate(pt => DAApp.release(pt), pt); await wait(p, 80); }
await p.waitForFunction(() => DAApp.A.G.cur === 1 && DAApp.A.phase === 'aim', null, { timeout: 15000 });
for (const pt of [T20, T20, S5]) { await aimWait(p); await p.evaluate(pt => DAApp.release(pt), pt); await wait(p, 80); }
await p.waitForFunction(() => DAApp.A.phase === 'after', null, { timeout: 8000 }); await wait(p, 150);
s = await st(p); ok(s.scores[0] === 0 && s.scores[1] === 125, 'Gleiche Punktzahl (125) wirft Spieler 1 raus'); ok((await p.textContent('#msg')).includes('raus'), 'Meldung: fliegt raus'); await shot(p, '09-raus');
await p.evaluate(() => DAApp.toMenu()); await wait(p, 300);

/* ---------- Cricket gegen CPU: Spiel bis zum Ende ---------- */
await p.evaluate(() => DAApp.start('cricket', { variant: 'std' }, [{ name: 'Du' }, { name: 'CPU', cpu: 2 }])); await wait(p, 500);
ok(await p.locator('#board table.cric').count() === 1, 'Cricket-Tafel'); await p.evaluate(() => { DAApp.A.speed = 4; });
const targets = [20, 19, 18, 17, 16, 15].map(n => { const i = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5].indexOf(n), a = i * Math.PI / 10; return { x: Math.sin(a) * 103, y: Math.cos(a) * 103 }; }).concat([{ x: 0, y: 0 }, { x: 0, y: 0 }]);
let ti = 0;
for (let k = 0; k < 400; k++) {
  s = await st(p); if (s.over) break;
  if (s.player === 0 && s.phase === 'aim') { await p.evaluate(pt => DAApp.release(pt), targets[Math.min(ti, targets.length - 1)]); ti++; }
  await wait(p, 60);
}
await p.waitForFunction(() => !document.getElementById('ovEnd').hidden, null, { timeout: 20000 }).catch(() => { });
s = await st(p); ok(s.over && s.ov.includes('ovEnd'), 'Cricket endet mit Ergebnis'); await shot(p, '10-cricket-ende');
await p.click('#eMenu'); await wait(p, 300);
await p.click('[data-go="rec"]'); await wait(p, 200); ok((await p.textContent('#recList')).includes('Höchstes Checkout'), 'Rekorde'); await shot(p, '11-rekorde'); await p.click('#recX');
await p.click('[data-go="opts"]'); await wait(p, 200); await p.click('#feelSeg [data-f="2"]'); ok(await p.evaluate(() => JSON.parse(localStorage.getItem('darts-arena-settings')).feel) === 2, 'Wurfgefühl Profi gespeichert'); await p.click('#optX');
await p.click('[data-go="help"]'); await wait(p, 200); await shot(p, '12-anleitung'); await p.click('#helpX');

/* ---------- Handy: Ziehen und Wischen ---------- */
const m = await page({ width: 390, height: 844 }, true, '?mode=countup');
await m.waitForFunction(() => window.DAApp && DAApp.cur === 'sGame', null, { timeout: 30000 }); await wait(m, 900);
ok(await m.evaluate(() => getComputedStyle(document.getElementById('power')).display) === 'none', 'Handy: Kraftbalken ausgeblendet (Wischen)');
const cdp = await m.context().newCDPSession(m);
const touch = async (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
const am = (await st(m)).aim;
await touch('touchStart', 200, 600); for (let k = 1; k <= 8; k++) { await touch('touchMove', 200 + k * 5, 600); await wait(m, 16); } await touch('touchEnd');
ok((await st(m)).aim.x > am.x + 3 && (await st(m)).darts[0] === 0, 'Ziehen verschiebt das Zielkreuz, ohne zu werfen');
// Schneller Wisch mit fester Zeitachse (16 ms je Schritt) – die Software-Grafik im Test ist zu langsam für echte Fingertempi
await m.evaluate(() => {
  const z = document.getElementById('aimZone'), real = performance.now.bind(performance); let t = real(); performance.now = () => t;
  const ev = (type, y) => z.dispatchEvent(new PointerEvent(type, { pointerId: 7, pointerType: 'touch', clientX: 220, clientY: y, bubbles: true, cancelable: true }));
  ev('pointerdown', 650); for (let k = 1; k <= 6; k++) { t += 16; ev('pointermove', 650 - k * 40); } t += 8; ev('pointerup', 410);
  performance.now = real;
});
await m.waitForFunction(() => DAApp.A.G.players[0].darts === 1, null, { timeout: 6000 }).then(() => ok(true, 'Wisch nach oben wirft den Dart'), () => ok(false, 'Wisch nach oben wirft den Dart'));
await wait(m, 500); await shot(m, '13-handy-wurf');

ok(!errs.length, 'Keine JS-Fehler' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
await b.close();
