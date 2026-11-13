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
/* 5b. Tipp-Mini-Spiel (Ballon-Pop): Finger-Zeiger mit Stick bewegen, A tippt an der Zeigerstelle */
await p.evaluate(() => __bi.startGame('pop', true)); await sl(600);
const mg = await p.evaluate(() => { const g = __bi.mini.cur(); window.__taps = []; const t = g.tap; g.tap = function (x, y, id) { window.__taps.push([Math.round(x), Math.round(y)]); return t.apply(this, arguments); }; return { active: __bi.mini.active, keys: !!g.keydown }; });
ok(mg.active && !mg.keys, 'Ballon-Pop läuft (Tipp-Spiel)');
await axes([1, 0, 0, 0]); await sl(350); await axes([0, 0, 0, 0]); await sl(100); await press(0, 200);
const taps = await p.evaluate(() => window.__taps); ok(taps.length === 1 && taps[0][0] > 520, 'A tippt an der Zeigerstelle (rechts der Mitte): ' + JSON.stringify(taps));
ok(await p.evaluate(() => [...document.body.children].some(e => e.style.zIndex === '99999' && e.style.display === 'block')), 'Finger-Zeiger sichtbar');
if (process.env.SHOT) await p.screenshot({ path: process.env.SHOT });
await p.evaluate(() => { __bi.mini.stop(); }); await sl(300);
/* 5c. Insel-Handy: R1 wechselt zur Einstellungen-App und zwischen Reitern, B zurück zur Startseite, rechter Stick blättert ohne Fehler */
await press(9); await sl(300); ok(await p.evaluate(() => !document.getElementById('kHome').hidden && document.querySelectorAll('#kHome .kApp').length === 12), 'Pause = Insel-Handy mit 12 Apps');
await press(5); await sl(200); ok(await p.evaluate(() => !document.getElementById('kSet').hidden && __bi.konsole.tab === 0), 'R1: Einstellungen-App'); await press(5); await sl(200); ok(await p.evaluate(() => __bi.konsole.tab === 1), 'R1: nächster Reiter (Bild & Ton)');
await press(1); await sl(300); ok(await p.evaluate(() => !document.getElementById('pause').hidden && !document.getElementById('kHome').hidden), 'B: zurück zur Startseite (Handy bleibt offen)');
ok(await p.evaluate(() => !!document.getElementById('gpBar') && !document.getElementById('gpBar').hidden && /Auswählen/.test(document.getElementById('gpBar').textContent)), 'Hinweisleiste im Menü');
await press(1); await sl(400); ok(await p.evaluate(() => document.getElementById('pause').hidden), 'B auf der Startseite: weiter spielen');
/* 5d. Spiel: Hinweisleiste, L3 schaltet Rennen, R3 Kamera hinter die Figur */
await sl(400); ok(await p.evaluate(() => /Rennen/.test(document.getElementById('gpBar').textContent)), 'Hinweisleiste im Spiel');
await press(10); ok(await p.evaluate(() => __bi.inp ? __bi.inp.turbo : __bi.pad.runLock), 'L3: Rennen an'); await press(10);
await p.evaluate(() => { __bi.cam.yaw = 0; __bi.P.h = 1; }); await press(11); ok(await p.evaluate(() => Math.abs(__bi.cam.yaw - (1 + Math.PI)) < .01), 'R3: Kamera hinter die Figur');
/* 6. Trennen */
await p.evaluate(() => { window.__gp.connected = false; const e = new Event('gamepaddisconnected'); e.gamepad = window.__gp; window.dispatchEvent(e); }); await sl(300);
ok(await p.evaluate(() => !document.body.classList.contains('gamepad')), 'Controller getrennt: Hinweis, Touch/Tastatur bleibt');
/* 6b. PlayStation: Symbole ✕ ○ □ △ an den Knöpfen; Switch: A (rechts, Index 1) bestätigt, B (unten, Index 0) zurück */
await mk('standard', 'DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)'); await sl(400);
ok(await p.evaluate(() => __bi.pad.kind === 'ps' && document.getElementById('bJump').dataset.k === '○' && document.body.classList.contains('gp-ps')), 'PlayStation erkannt, Tastensymbole ✕○□△');
await p.evaluate(() => { window.__gp.connected = false; const e = new Event('gamepaddisconnected'); e.gamepad = window.__gp; window.dispatchEvent(e); }); await sl(200);
await mk('standard', 'Pro Controller (STANDARD GAMEPAD Vendor: 057e Product: 2009)'); await sl(400);
ok(await p.evaluate(() => __bi.pad.kind === 'nin' && document.getElementById('bAux').dataset.k === 'Y' && document.getElementById('bAct').dataset.k === 'A'), 'Switch erkannt: Symbole wie auf der Switch (Y links, X oben)');
await p.evaluate(() => { window.__esc = []; addEventListener('keydown', e => window.__esc.push(e.code + ':' + (document.activeElement && document.activeElement.id))); }); await press(9, 400); await sl(300); const sw1 = await p.evaluate(() => !document.getElementById('pause').hidden); await press(0, 400); await sl(400); ok(sw1 && await p.evaluate(() => document.getElementById('pause').hidden), 'Switch: B (unten) schließt das Insel-Handy');
await p.evaluate(() => { window.__gp.connected = false; const e = new Event('gamepaddisconnected'); e.gamepad = window.__gp; window.dispatchEvent(e); }); await sl(200);
/* 7. Unbekanntes Pad: Einrichtung */
await mk('', 'Generic USB Gamepad (Vendor: 1234 Product: abcd)'); await sl(300);
ok(await p.evaluate(() => !![...document.body.children].find(e => /einrichten/.test(e.textContent) && e.style.zIndex === '99998')), 'Unbekanntes Pad: Einrichtungs-Assistent erscheint');
for (const i of [2, 3, 4, 5, 9]) await press(i, 160); await sl(1000);
const mp = await p.evaluate(() => ({ m: __bi.pad.mapping, ls: localStorage.getItem('bi-gp-' + 'Generic USB Gamepad (Vendor: 1234 Product: abcd)'.slice(0, 40)) }));
ok(mp.m && mp.m.a === 2 && mp.m.b === 3 && mp.m.x === 4 && mp.m.y === 5 && mp.m.start === 9 && !!mp.ls, 'Einrichtung: Tasten belegt und gespeichert');
ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 3).join(' | '));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); process.exit(fails ? 1 : 0);
