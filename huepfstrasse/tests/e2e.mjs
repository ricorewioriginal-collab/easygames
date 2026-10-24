// Hüpfstraße – Browser-Test (Playwright). node huepfstrasse/tests/e2e.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
const base = process.argv[2] || 'http://localhost:8766/', out = process.argv[3] || '';
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'] });
const errs = [], ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) process.exitCode = 1; };
async function page(vp, touch, q) {
  const ctx = await b.newContext({ viewport: vp, hasTouch: !!touch, isMobile: !!touch, serviceWorkers: 'block' }), p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::|firebase|googleapis/i.test(m.text())) errs.push(m.text()); });
  await p.goto(base + 'huepfstrasse/' + (q || ''), { waitUntil: 'commit' }); return p;
}
const shot = async (p, n) => { if (out) await p.screenshot({ path: out + '/hs-' + n + '.jpg', type: 'jpeg', quality: 80 }); };
const wait = (p, ms) => p.waitForTimeout(ms);
const idle = async (p, ms) => { await p.waitForTimeout(ms || 150); await p.waitForFunction(() => !HSApp.G.W.P.hop, null, { timeout: 5000 }); await p.waitForTimeout(60); };
const st = p => p.evaluate(() => { const A = HSApp, W = A.G.W; return { cur: A.cur, mode: A.G.mode, score: W.score, z: W.P.z, x: W.P.x, dead: W.P.dead && W.P.dead.how, over: W.over, coins: W.coins, ov: Array.from(document.querySelectorAll('.ov')).filter(o => !o.hidden).map(o => o.id) }; });
// Reihe vor der Figur gezielt umbauen
const setRow = (p, dz, o) => p.evaluate(([dz, o]) => { const W = HSApp.G.W, R = HS.row(W, W.P.z + dz); Object.assign(R, { trees: new Set(o.trees || []), coins: new Set(o.coins || []), items: o.items || [], pads: o.pads ? new Set(o.pads) : null, train: null, speed: o.speed || 0, dir: o.dir || 1 }, { type: o.type }); HSScene.rebuild(R.z); }, [dz, o]);

const p = await page({ width: 1280, height: 760 });
await p.waitForSelector('#loadBar'); await wait(p, 250); await shot(p, '01-laden');
await p.waitForSelector('#sTitle.on', { timeout: 20000 }); await wait(p, 900); await shot(p, '02-titel');
await p.keyboard.press('Enter'); await wait(p, 600); ok((await st(p)).cur === 'sMenu', 'Titel → Hauptmenü'); await wait(p, 1200); await shot(p, '03-menue');
ok(await p.evaluate(() => document.activeElement.dataset.go) === 'play', '„Los hüpfen“ hat den Fokus');
await p.keyboard.press('ArrowRight'); ok(await p.evaluate(() => document.activeElement.dataset.go) === 'daily', 'Pfeiltasten bewegen den Fokus');
await p.keyboard.press('ArrowLeft'); await p.keyboard.press('Enter'); await wait(p, 500);
let s = await st(p); ok(s.cur === 'sGame' && s.mode === 'play' && s.z === 0, 'Spiel startet');
// Tastatur: vorwärts auf sichere Wiese mit Münze
await setRow(p, 1, { type: 'grass', coins: [0] }); await p.keyboard.press('ArrowUp'); await idle(p);
s = await st(p); ok(s.z === 1 && s.score === 1 && s.coins === 1, 'Hüpfen + Münze ' + JSON.stringify(s));
ok(await p.isHidden('#startHint'), 'Start-Hinweis verschwindet');
await setRow(p, 1, { type: 'grass', trees: [Math.round(s.x)] }); await p.keyboard.press('KeyW'); await wait(p, 250); ok((await st(p)).z === 1, 'Baum blockiert');
await p.keyboard.press('KeyD'); await idle(p); ok((await st(p)).x === s.x + 1, 'Seitlich hüpfen');
await wait(p, 300); await shot(p, '04-spiel');
// Pause
await p.keyboard.press('Escape'); await wait(p, 200); ok((await st(p)).ov.includes('ovPause'), 'Esc = Pause'); await shot(p, '05-pause');
const zP = (await st(p)).z; await wait(p, 1500); ok((await st(p)).z === zP && !(await st(p)).dead, 'In der Pause passiert nichts'); await p.click('#pGo'); await wait(p, 200);
// Auto überfährt
await setRow(p, 1, { type: 'road', speed: 4, dir: 1, items: [{ x: (await st(p)).x - 1.4, len: 1.2, kind: 'car', c: 0 }] });
await p.keyboard.press('ArrowUp'); await wait(p, 600); s = await st(p); ok(s.dead === 'car', 'Auto überfährt');
await p.waitForFunction(() => !document.getElementById('ovEnd').hidden, null, { timeout: 5000 }); await wait(p, 500); await shot(p, '06-ende');
ok((await p.textContent('#eTitle')).includes('Überfahren'), 'Game over: Todesart');
ok(await p.evaluate(() => +localStorage.getItem('huepfstrasse-highscore')) >= 1, 'Rekord gespeichert');
ok(await p.evaluate(() => +localStorage.getItem('huepfstrasse-coins')) === 1, 'Münzen gutgeschrieben');
// Nochmal → Wasser
await p.click('#eAgain'); await wait(p, 400); await setRow(p, 1, { type: 'river', speed: 1, dir: 1, items: [{ x: 8, len: 2.6, kind: 'log' }] });
await p.keyboard.press('ArrowUp'); await wait(p, 500); ok((await st(p)).dead === 'water', 'Platsch ins Wasser');
await p.waitForFunction(() => !document.getElementById('ovEnd').hidden, null, { timeout: 5000 }); await p.click('#eMenu'); await wait(p, 300);
// Figuren-Laden: kaufen mit genug Münzen
await p.evaluate(() => localStorage.setItem('huepfstrasse-coins', '150')); await p.click('[data-go="chars"]'); await wait(p, 500);
ok((await st(p)).cur === 'sChars', 'Figuren-Laden'); await shot(p, '07-figur-rico');
await p.click('#cNext'); await wait(p, 300); ok((await p.textContent('#cName')) === 'Pingu', 'Nächste Figur'); await p.click('#cAct'); await wait(p, 300);
ok(await p.evaluate(() => JSON.parse(localStorage.getItem('huepfstrasse-owned')).includes('pingu') && +localStorage.getItem('huepfstrasse-coins') === 50), 'Pingu für 100 Münzen gekauft');
await p.click('#cNext'); await p.click('#cAct'); await wait(p, 200); ok(await p.evaluate(() => !JSON.parse(localStorage.getItem('huepfstrasse-owned')).includes('fuchs')), 'Zu teuer: nicht gekauft');
for (let i = 0; i < 7; i++) { await p.click('#cNext'); await wait(p, 120); } await wait(p, 300); await shot(p, '08-figur-einhorn');
await p.keyboard.press('Escape'); await wait(p, 300); ok((await st(p)).cur === 'sMenu', 'Zurück zum Menü');
// Tagesstrecke: gleiche Strecke
await p.click('[data-go="daily"]'); await wait(p, 300); const d1 = await p.evaluate(() => { const W = HSApp.G.W; const r = []; for (let z = 0; z < 30; z++) r.push(HS.row(W, z).type); return r.join(); });
await p.keyboard.press('Escape'); await p.click('#pRestart'); await wait(p, 300); const d2 = await p.evaluate(() => { const W = HSApp.G.W; const r = []; for (let z = 0; z < 30; z++) r.push(HS.row(W, z).type); return r.join(); });
ok(d1 === d2 && (await st(p)).mode === 'daily', 'Tagesstrecke ist gleich');
// Drohne holt Trödler
await p.evaluate(() => { HSApp.hop('up'); }); await wait(p, 300); await p.evaluate(() => { HSApp.G.W.cam += 6; }); await wait(p, 400); ok((await st(p)).dead === 'drone', 'Drohne holt Trödler');
await wait(p, 600); await shot(p, '09-drohne');
await p.waitForFunction(() => !document.getElementById('ovEnd').hidden, null, { timeout: 5000 }); ok(await p.isVisible('#eShare'), 'Teilen-Knopf'); await p.click('#eMenu'); await wait(p, 300);
// Controller (simuliert)
await p.evaluate(() => { const btn = () => Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })); window.__pad = { connected: true, axes: [0, 0, 0, 0], buttons: btn(), index: 0, id: 'Test' }; navigator.getGamepads = () => [window.__pad]; });
const press = async (i) => { await p.evaluate(i => { __pad.buttons[i].pressed = true; }, i); await wait(p, 80); await p.evaluate(i => { __pad.buttons[i].pressed = false; }, i); await wait(p, 120); };
await press(0); await wait(p, 400); ok((await st(p)).cur === 'sGame', 'Controller: A startet');
await setRow(p, 1, { type: 'grass' }); await press(0); await idle(p); ok((await st(p)).z === 1, 'Controller: A = vorwärts');
await setRow(p, 1, { type: 'grass' }); await press(14); await idle(p); ok((await st(p)).x === -1, 'Controller: Steuerkreuz links');
await press(9); ok((await st(p)).ov.includes('ovPause'), 'Controller: Start = Pause'); await press(1); ok(!(await st(p)).ov.length, 'Controller: B = weiter');

// ---------- Handy: Tippen und Wischen ----------
const h = await page({ width: 390, height: 844 }, true, '?mode=play');
await h.waitForFunction(() => window.HSApp && HSApp.cur === 'sGame', null, { timeout: 20000 }); await wait(h, 500);
const ev = (dx, dy) => h.evaluate(([dx, dy]) => { const el = document.getElementById('swipe'), x = 195, y = 600, o = { pointerId: 5, bubbles: true, pointerType: 'touch' };
  el.dispatchEvent(new PointerEvent('pointerdown', Object.assign({ clientX: x, clientY: y }, o))); if (dx || dy) { el.dispatchEvent(new PointerEvent('pointermove', Object.assign({ clientX: x + dx / 2, clientY: y + dy / 2 }, o))); el.dispatchEvent(new PointerEvent('pointermove', Object.assign({ clientX: x + dx, clientY: y + dy }, o))); }
  el.dispatchEvent(new PointerEvent('pointerup', Object.assign({ clientX: x + dx, clientY: y + dy }, o))); }, [dx, dy]);
const hst = () => h.evaluate(() => ({ z: HSApp.G.W.P.z, x: HSApp.G.W.P.x }));
const hrow = (dz, o) => h.evaluate(([dz, o]) => { const W = HSApp.G.W, R = HS.row(W, W.P.z + dz); Object.assign(R, { type: o.type, trees: new Set(), coins: new Set(), items: [], pads: null, train: null }); HSScene.rebuild(R.z); }, [dz, o]);
await hrow(1, { type: 'grass' }); await ev(0, 0); await idle(h); ok((await hst()).z === 1, 'Tippen = vorwärts');
await hrow(0, { type: 'grass' }); await ev(-100, 20); await idle(h); ok((await hst()).x === -1, 'Wischen links ' + JSON.stringify(await hst()));
await hrow(0, { type: 'grass' }); await ev(90, -40); await idle(h); ok((await hst()).x === 0, 'Schräg-Wischer nach rechts');
await hrow(-1, { type: 'grass' }); await ev(10, 110); await idle(h); ok((await hst()).z === 0, 'Wischen nach unten = zurück');
for (let i = 0; i < 4; i++) { await hrow(1, { type: 'grass' }); await ev(0, 0); await idle(h); }
await wait(h, 400); await shot(h, '10-handy-spiel');
await h.evaluate(() => HSApp.toMenu()); await wait(h, 1200); await shot(h, '11-handy-menue');
await h.evaluate(() => HSApp.openChars()); await wait(h, 600); await shot(h, '12-handy-figur');

console.log(errs.length ? 'Fehler im Browser:\n' + errs.join('\n') : 'keine Browser-Fehler'); if (errs.length) process.exitCode = 1;
await b.close();
