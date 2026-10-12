/* Controller (Gamepad): erkennt Pad, richtet es ein, steuert Menüs und Spiel, Einrichtung für unbekannte Pads. Aufruf: node bunte-insel/tests/gamepad.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 1000, height: 600 } }); const p = await ctx.newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await ctx.addInitScript(() => { window.__gp = null; navigator.getGamepads = () => [window.__gp]; });
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const sl = ms => new Promise(r => setTimeout(r, ms));
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 });
const mk = (mapping, id) => p.evaluate(([mapping, id]) => { window.__gp = { id, index: 0, connected: true, mapping, axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) }; window.dispatchEvent(new Event('gamepadconnected')); const e = new Event('gamepadconnected'); e.gamepad = window.__gp; window.dispatchEvent(e); }, [mapping, id]);
const press = async (i, ms) => { await p.evaluate(i => { const b = window.__gp.buttons[i]; b.pressed = true; b.value = 1; }, i); await sl(ms || 160); await p.evaluate(i => { const b = window.__gp.buttons[i]; b.pressed = false; b.value = 0; }, i); await sl(160); };
const axes = (a) => p.evaluate(a => { window.__gp.axes = a; }, a);
/* 1. Erkennen + Standard-Einrichtung */
await mk('standard', 'Xbox Wireless Controller (STANDARD GAMEPAD)'); await sl(400);
ok(await p.evaluate(() => document.body.classList.contains('gamepad') && !document.getElementById('gpHelp').hidden && __bi.pad.mapping && __bi.pad.mapping.a === 0), 'Standard-Controller erkannt und automatisch eingerichtet (Hilfe im Pause-Menü)');
/* 2. Titelmenü: Steuerkreuz markiert, A startet */
await press(13); ok(await p.evaluate(() => !!document.querySelector('.gp-focus')), 'Titelmenü: Markierung sichtbar'); await p.evaluate(() => { const e = document.getElementById('bStart'); e.classList.add('gp-focus'); }); 
await p.evaluate(() => __bi.pad.dbg.nav(0, 1)); await p.evaluate(() => __bi.pad.dbg.nav(0, -1)); await press(0); await sl(900);
ok(await p.evaluate(() => !document.getElementById('hud').hidden), 'Titelmenü: A startet das Spiel');
/* 3. Laufen: linker Stick */
const p0 = await p.evaluate(() => [__bi.P.x, __bi.P.z]); await axes([0, -1, 0, 0]); await sl(900); await axes([0, 0, 0, 0]); await sl(200);
const p1 = await p.evaluate(() => [__bi.P.x, __bi.P.z]); ok(Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) > 1.5, 'Linker Stick: Figur läuft (' + Math.round(Math.hypot(p1[0] - p0[0], p1[1] - p0[1])) + ' m)');
/* 4. A = Aktion (Tür), X = zweite Aktion */
await p.evaluate(() => { const d = BI.DOORS[0], P = __bi.P; P.veh = null; P.x = d.x; P.z = d.z; P.y = __bi.W.groundY(d.x, d.z); }); await sl(300); await press(0); await sl(400);
ok(await p.evaluate(() => !!__bi.innen.inside), 'A-Knopf: Haus betreten (Aktion)'); await p.evaluate(() => __bi.innen.leave()); await sl(200);
/* 5. Start = Pause, B = zurück */
await press(9); await sl(300); ok(await p.evaluate(() => !document.getElementById('pause').hidden), 'Start: Pause-Menü'); await press(1); await sl(400); ok(await p.evaluate(() => document.getElementById('pause').hidden), 'B: zurück ins Spiel');
await press(9); await sl(300); await press(9); await sl(400); ok(await p.evaluate(() => document.getElementById('pause').hidden), 'Start im Pause-Menü: weiter spielen');
/* 6. Trennen */
await p.evaluate(() => { window.__gp.connected = false; const e = new Event('gamepaddisconnected'); e.gamepad = window.__gp; window.dispatchEvent(e); }); await sl(300);
ok(await p.evaluate(() => !document.body.classList.contains('gamepad')), 'Controller getrennt: Hinweis, Touch/Tastatur bleibt');
/* 7. Unbekanntes Pad: Einrichtung */
await mk('', 'Generic USB Gamepad (Vendor: 1234 Product: abcd)'); await sl(300);
ok(await p.evaluate(() => !![...document.body.children].find(e => /einrichten/.test(e.textContent) && e.style.zIndex === '99998')), 'Unbekanntes Pad: Einrichtungs-Assistent erscheint');
for (const i of [2, 3, 4, 5, 9]) await press(i, 160); await sl(1000);
const mp = await p.evaluate(() => ({ m: __bi.pad.mapping, ls: localStorage.getItem('bi-gp-' + 'Generic USB Gamepad (Vendor: 1234 Product: abcd)'.slice(0, 40)) }));
ok(mp.m && mp.m.a === 2 && mp.m.b === 3 && mp.m.x === 4 && mp.m.y === 5 && mp.m.start === 9 && !!mp.ls, 'Einrichtung: Tasten belegt und gespeichert');
ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 3).join(' | '));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); process.exit(fails ? 1 : 0);
