// 2048 Deluxe – Browser-Test (Playwright). node deluxe-2048/tests/e2e.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
const base = process.argv[2] || 'http://localhost:8766/', out = process.argv[3] || '';
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'] });
const errs = [], ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) process.exitCode = 1; };
async function page(vp, touch, q) {
  const ctx = await b.newContext({ viewport: vp, hasTouch: !!touch, isMobile: !!touch, serviceWorkers: 'block' }), p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::|firebase|googleapis/i.test(m.text())) errs.push(m.text()); });
  await p.goto(base + 'deluxe-2048/' + (q || ''), { waitUntil: 'commit' }); return p;
}
const shot = async (p, n) => { if (out) await p.screenshot({ path: out + '/d2048-' + n + '.jpg', type: 'jpeg', quality: 80 }); };
const wait = (p, ms) => p.waitForTimeout(ms);
const st = p => p.evaluate(() => { const A = D2048App, g = A.G.g; return { cur: A.cur, mode: A.G.mode, score: g && g.score, moves: g && g.moves, tiles: g && g.cells.filter(Boolean).length, undo: A.G.undo, hammer: A.G.hammer, armed: A.G.armed, ended: A.G.ended, ov: Array.from(document.querySelectorAll('.ov')).filter(o => !o.hidden).map(o => o.id) }; });
// Brett gezielt setzen (für Sieg/Ende)
const setBoard = (p, rows) => p.evaluate(rows => { const g = D2048App.G.g; let id = 5000; g.cells = rows.flat().map(v => v ? { id: id++, v } : null); g.over = false; g.won = false; g.keep = false; D2048Scene.setGame(g); }, rows);

// ---------- PC: Tastatur ----------
const p = await page({ width: 1280, height: 760 });
await p.waitForSelector('#loadBar'); await wait(p, 250); await shot(p, '01-laden');
await p.waitForSelector('#sTitle.on', { timeout: 20000 }); await wait(p, 900); await shot(p, '02-titel');
await p.keyboard.press('Enter'); await wait(p, 600); ok((await st(p)).cur === 'sMenu', 'Titel → Hauptmenü'); await wait(p, 900); await shot(p, '03-menue');
ok(await p.evaluate(() => document.activeElement.dataset.go) === 'classic', 'Klassisch hat den Fokus');
await p.keyboard.press('ArrowRight'); ok(await p.evaluate(() => document.activeElement.dataset.go) === 'blitz', 'Pfeiltasten bewegen den Fokus');
await p.keyboard.press('ArrowLeft'); await p.keyboard.press('Enter'); await wait(p, 300);
ok((await st(p)).ov.includes('ovSize'), 'Brettgröße wählen'); await shot(p, '04-groesse');
await p.keyboard.press('ArrowRight'); await p.keyboard.press('Enter'); await wait(p, 200); // 5×5 gewählt (Fokus bleibt), dann Los
await p.click('#szGo'); await wait(p, 600);
let s = await st(p); ok(s.cur === 'sGame' && s.mode === 'classic' && s.tiles === 2, 'Spiel startet mit 2 Kacheln');
ok(await p.evaluate(() => D2048App.G.g.n) === 5, 'Brett 5×5');
for (const k of ['ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyS', 'KeyD']) { await p.keyboard.press(k); await wait(p, 120); }
s = await st(p); ok(s.moves >= 5, 'Tastatur schiebt (' + s.moves + ' Züge)');
await wait(p, 900); await shot(p, '05-spiel');
// Rückgängig
const m0 = (await st(p)).moves, u0 = (await st(p)).undo; await p.keyboard.press('KeyU'); await wait(p, 200); s = await st(p);
ok(s.moves === m0 - 1 && s.undo === u0 - 1, 'Rückgängig nimmt einen Zug zurück und verbraucht einen Joker');
// Hammer per Tastatur
const t0 = (await st(p)).tiles; await p.keyboard.press('KeyH'); await wait(p, 150); ok((await st(p)).armed, 'Hammer scharf'); await shot(p, '06-hammer');
await p.keyboard.press('Enter'); await wait(p, 400); s = await st(p); ok(!s.armed && s.tiles === t0 - 1 && s.hammer === 0, 'Hammer zerschlägt eine Kachel');
// Speichern → Menü → Weiterspielen
const sc = (await st(p)).score; await p.keyboard.press('Escape'); await wait(p, 200); ok((await st(p)).ov.includes('ovPause'), 'Esc = Pause'); await shot(p, '07-pause');
await p.click('#pQuit'); await wait(p, 500); ok(await p.isVisible('#tCont'), 'Weiterspielen im Menü');
await p.click('#tCont'); await wait(p, 500); s = await st(p); ok(s.cur === 'sGame' && s.score === sc && s.mode === 'classic', 'Spielstand fortgesetzt');
// Sieg: zwei 1024 zusammenschieben
await setBoard(p, [[1024, 1024, 0, 0, 0], [2, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]); await p.keyboard.press('ArrowLeft'); await wait(p, 900);
s = await st(p); ok(s.ov.includes('ovWin'), 'Sieg-Bildschirm bei 2048'); await wait(p, 600); await shot(p, '08-sieg');
await p.click('#wGo'); await wait(p, 300); ok((await st(p)).cur === 'sGame' && !(await st(p)).ov.length, 'Weiterspielen nach 2048');
// Spielende
await setBoard(p, [[2, 4, 2, 4, 2], [4, 2, 4, 2, 4], [2, 4, 2, 4, 2], [4, 2, 4, 2, 4], [2, 4, 2, 4, 0]]);
await p.evaluate(() => { D2048App.G.g.rs = 7; });
let ended = false; for (const k of ['ArrowRight', 'ArrowDown']) { await p.keyboard.press(k); await wait(p, 900); s = await st(p); if (s.ov.includes('ovEnd')) { ended = true; break; } }
if (!ended) { await p.evaluate(() => D2048App.endGame('over')); await wait(p, 300); s = await st(p); }
ok(s.ov.includes('ovEnd') && s.ended, 'Game-over-Bildschirm'); await wait(p, 500); await shot(p, '09-ende');
const hs = await p.evaluate(() => +localStorage.getItem('deluxe-2048-highscore')); ok(hs > 0, 'Rekord gespeichert (' + hs + ')');
ok(await p.evaluate(() => !localStorage.getItem('deluxe-2048-save')), 'Spielstand nach Ende gelöscht');
await p.click('#eMenu'); await wait(p, 300);
// Rekorde
await p.click('[data-go="rec"]'); await wait(p, 200); ok((await p.textContent('#recList')).includes('2048 geschafft'), 'Rekorde'); await shot(p, '10-rekorde'); await p.click('#recX');
// Blitz: Zeit läuft ab
await p.click('[data-go="blitz"]'); await wait(p, 400); ok((await st(p)).mode === 'blitz' && await p.isVisible('#hTimeBox'), 'Blitz mit Uhr');
await p.evaluate(() => { D2048App.G.time = 0.3; }); await wait(p, 700); s = await st(p); ok(s.ov.includes('ovEnd') && (await p.textContent('#eTitle')).includes('Zeit'), 'Blitz endet nach Ablauf der Zeit');
ok(await p.isVisible('#eShare'), 'Teilen im Blitz'); await p.click('#eMenu'); await wait(p, 200);
// Tages-2048: gleiches Startbrett
await p.click('[data-go="daily"]'); await wait(p, 300); const d1 = await p.evaluate(() => JSON.stringify(D2048App.G.g.cells.map(c => c && c.v)));
await p.keyboard.press('Escape'); await p.click('#pRestart'); await wait(p, 300); const d2 = await p.evaluate(() => JSON.stringify(D2048App.G.g.cells.map(c => c && c.v)));
ok(d1 === d2, 'Tages-2048: gleiches Startbrett');
// Zen: unendlich Rückgängig
await p.keyboard.press('Escape'); await p.click('#pQuit'); await wait(p, 300); await p.click('[data-go="zen"]'); await wait(p, 200); await p.click('#szGo'); await wait(p, 300);
for (const k of ['ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowDown', 'ArrowLeft']) { await p.keyboard.press(k); await wait(p, 100); }
for (let i = 0; i < 4; i++) { await p.keyboard.press('KeyU'); await wait(p, 80); }
ok(await p.textContent('#nUndo') === '∞' && (await st(p)).moves <= 1, 'Zen: beliebig oft rückgängig');

// Controller (simuliert)
await p.evaluate(() => {
  const btn = () => Array.from({ length: 17 }, () => ({ pressed: false, value: 0 }));
  window.__pad = { connected: true, axes: [0, 0, 0, 0], buttons: btn(), index: 0, id: 'Test' };
  navigator.getGamepads = () => [window.__pad];
});
const press = async (i, ms) => { await p.evaluate(i => { __pad.buttons[i].pressed = true; }, i); await wait(p, ms || 80); await p.evaluate(i => { __pad.buttons[i].pressed = false; }, i); await wait(p, 80); };
const mz = (await st(p)).moves; await press(14); await press(13); await press(15); await press(13);
ok((await st(p)).moves > mz, 'Controller: Steuerkreuz schiebt');
await press(9); ok((await st(p)).ov.includes('ovPause'), 'Controller: Start = Pause'); await press(1); ok(!(await st(p)).ov.length, 'Controller: B = weiter');

// ---------- Handy: Wischen und Antippen ----------
const h = await page({ width: 390, height: 844 }, true, '?mode=classic&size=4');
await h.waitForFunction(() => window.D2048App && D2048App.cur === 'sGame', null, { timeout: 20000 }); await wait(h, 600);
const swipe = async (dx, dy) => { await h.evaluate(([dx, dy]) => { const el = document.getElementById('swipe'), x = 195, y = 500, o = { pointerId: 7, bubbles: true, pointerType: 'touch', isPrimary: true };
  el.dispatchEvent(new PointerEvent('pointerdown', Object.assign({ clientX: x, clientY: y }, o))); el.dispatchEvent(new PointerEvent('pointermove', Object.assign({ clientX: x + dx * .5, clientY: y + dy * .5 }, o)));
  el.dispatchEvent(new PointerEvent('pointermove', Object.assign({ clientX: x + dx, clientY: y + dy }, o))); el.dispatchEvent(new PointerEvent('pointerup', Object.assign({ clientX: x + dx, clientY: y + dy }, o))); }, [dx, dy]); await wait(h, 160); };
for (const [dx, dy] of [[-120, 0], [0, 120], [120, 0], [0, 120], [-120, 0], [0, 120], [120, 0], [0, -120]]) await swipe(dx, dy);
s = await h.evaluate(() => ({ moves: D2048App.G.g.moves })); ok(s.moves >= 4, 'Wischen schiebt (' + s.moves + ' Züge)');
await wait(h, 800); await shot(h, '11-handy-spiel');
// Hammer per Antippen: Tippen auf eine Kachel
await h.evaluate(() => { D2048App.G.hammer = 1; D2048App.arm(); }); const before = await h.evaluate(() => D2048App.G.g.cells.filter(Boolean).length);
const ti = await h.evaluate(() => D2048App.G.g.cells.findIndex(Boolean));
// Bildschirmposition der Kachel über die Szene bestimmen
const pos = await h.evaluate(i => { const sc = D2048Scene; let best = null; for (let y = 200; y < 780; y += 6) for (let x = 10; x < 380; x += 6) { if (sc.pick(x, y) === i) { best = { x, y }; break; } } return best; }, ti);
await h.evaluate(p => { const el = document.getElementById('swipe'), o = { pointerId: 9, bubbles: true, pointerType: 'touch', clientX: p.x, clientY: p.y }; el.dispatchEvent(new PointerEvent('pointerdown', o)); el.dispatchEvent(new PointerEvent('pointerup', o)); }, pos);
await wait(h, 400); ok(await h.evaluate(() => D2048App.G.g.cells.filter(Boolean).length) === before - 1, 'Hammer per Antippen');
await h.evaluate(() => D2048App.toMenu()); await wait(h, 900); await shot(h, '12-handy-menue');

console.log(errs.length ? 'Fehler im Browser:\n' + errs.join('\n') : 'keine Browser-Fehler'); if (errs.length) process.exitCode = 1;
await b.close();
