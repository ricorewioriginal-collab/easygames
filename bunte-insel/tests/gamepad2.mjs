/* Controller vollständig: jeder Bildschirm-Knopf per Select-Markierung erreichbar, Kampf, Bauen, Sprechblasen, Fenster ohne Menü-Meldung, Tastensymbole je Controller.
   Aufruf: LANG=de_DE.UTF-8 node bunte-insel/tests/gamepad2.mjs (Server auf :8080 im Repo-Wurzelordner) */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 1000, height: 600 } }); const p = await ctx.newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await ctx.addInitScript(() => { window.__gp = null; navigator.getGamepads = () => [window.__gp]; });
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const sl = ms => new Promise(r => setTimeout(r, ms));
const mk = id => p.evaluate(id => { window.__gp = { id, index: 0, connected: true, mapping: 'standard', axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) }; const e = new Event('gamepadconnected'); e.gamepad = window.__gp; window.dispatchEvent(e); }, id);
const off = () => p.evaluate(() => { window.__gp.connected = false; const e = new Event('gamepaddisconnected'); e.gamepad = window.__gp; window.dispatchEvent(e); });
const hold = (i, on) => p.evaluate(([i, on]) => { const b = window.__gp.buttons[i]; b.pressed = on; b.value = on ? 1 : 0; }, [i, on]);
const press = async (i, ms) => { await hold(i, true); await sl(ms || 200); await hold(i, false); await sl(200); };
const axes = a => p.evaluate(a => { window.__gp.axes = a; }, a);
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 });
await mk('Xbox Wireless Controller (STANDARD GAMEPAD)'); await sl(400);
await p.evaluate(() => __bi.pad.dbg.mark(document.getElementById('bStart'))); await press(0); await p.waitForFunction(() => !document.getElementById('hud').hidden, null, { timeout: 30000 }); await sl(800);
/* 1. Spiel: kein falsches „Fenster offen“, Tastensymbole an den Bildschirm-Knöpfen */
ok(await p.evaluate(() => __bi.pad.dbg.overlay() === null), 'Spiel: Bildmitte frei, kein Fenster erkannt');
ok(await p.evaluate(() => document.getElementById('bPause').dataset.gpk === 'MENU' && document.getElementById('bGuide').dataset.gpk === '▲' && document.getElementById('bCam').dataset.gpk === 'LB'), 'Xbox: Symbole an Menü (MENU), Wohin (▲), Kamera (LB)');
/* 2. Select: Markierung über alle Bildschirm-Knöpfe – jeder sichtbare Knopf ist per Steuerkreuz erreichbar */
await press(8); ok(await p.evaluate(() => __bi.pad.hud && !!document.querySelector('.gp-focus')), 'Select: Bildschirm-Knöpfe-Modus mit Markierung');
const reach = await p.evaluate(() => { const d = __bi.pad.dbg, all = d.cands(), seen = new Set(), q = [all[0]]; seen.add(all[0]);
  while (q.length) { const e = q.shift(); for (const [x, y] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { d.mark(e); d.nav(x, y); const n = d.cur; if (n && !seen.has(n)) { seen.add(n); q.push(n); } } }
  return { n: all.length, miss: all.filter(e => !seen.has(e)).map(e => e.id || e.className || e.textContent.trim().slice(0, 12)) }; });
ok(reach.n > 8 && reach.miss.length === 0, 'Alle ' + reach.n + ' Bildschirm-Knöpfe erreichbar' + (reach.miss.length ? ' – fehlt: ' + reach.miss.join(', ') : ''));
await p.evaluate(() => __bi.pad.dbg.mark(document.getElementById('bTools'))); await press(0); await sl(400);
ok(await p.evaluate(() => !document.getElementById('pause').hidden && !__bi.pad.hud), 'A drückt ⚙️: Einstellungen gehen auf, Menü-Steuerung übernimmt');
await press(1); await sl(300); await press(1); await sl(400); ok(await p.evaluate(() => document.getElementById('pause').hidden && !document.querySelector('.gp-focus')), 'B, B: zurück ins Spiel');
await press(8); await press(1); ok(await p.evaluate(() => !__bi.pad.hud && !document.querySelector('.gp-focus')), 'Select, dann B: Bildschirm-Knöpfe-Modus zu');
/* 3. Sprechblase: A = weiter */
await p.evaluate(() => { __bi.dlg().show({ name: 'Mia', lines: ['Hallo du!', 'Zweite Zeile'] }); window.__dc = 0; document.getElementById('rpgDlg').addEventListener('click', () => __dc++); }); await sl(200); await press(0);
ok(await p.evaluate(() => __dc === 1), 'Sprechblase: A blättert weiter'); await p.evaluate(() => __bi.dlg().close());
/* 4. Fenster ohne Menü-Meldung (Tasten belegen): wird Menü, A wählt darin, B schließt über „Fertig“ */
await p.evaluate(() => __bi.kb.open()); await sl(400);
ok(await p.evaluate(() => !!__bi.pad.dbg.overlay()), 'Tasten-belegen-Fenster als Menü erkannt'); await press(13); await sl(150);
ok(await p.evaluate(() => { const c = __bi.pad.dbg.cur; return !!c && !!__bi.pad.dbg.overlay().contains(c); }), 'Markierung liegt im Fenster (nicht auf Knöpfen dahinter)');
await press(1); await sl(300); ok(await p.evaluate(() => !__bi.pad.dbg.overlay() && ![...document.body.children].some(e => e.style.zIndex === '99997')), 'B schließt das Fenster');
/* 4b. Portal-Frage (Lunaris, Welten): Steuerkreuz wählt „Los“/„Hierbleiben“, A drückt */
await p.evaluate(() => { window.__go = 0; BI.portalAsk({ title: 'Nach Lunaris?', text: 'Mondtor', onGo: () => __go++, onClose: () => { } }); }); await sl(400);
ok(await p.evaluate(() => !!__bi.pad.dbg.overlay() && !!__bi.pad.dbg.overlay().closest('.biAsk')), 'Portal-Frage als Menü erkannt'); await press(15); await sl(100);
ok(await p.evaluate(() => { const c = __bi.pad.dbg.cur; return !!c && !!c.closest('.biAsk'); }), 'Markierung auf einem Knopf der Portal-Frage');
await press(1); await sl(300); ok(await p.evaluate(() => !document.querySelector('.biAsk')), 'B schließt die Portal-Frage');
/* 5. Kampf: A Schlag, X Tritt, R1 Block, Symbole an den Kampf-Knöpfen */
await p.evaluate(() => __bi.combat.dbg.startWave()); await p.waitForFunction(() => document.body.classList.contains('fighting'), null, { timeout: 20000 }); await sl(300);
ok(await p.evaluate(() => document.getElementById('fbPunch').dataset.gpk === 'A' && document.getElementById('fbKick').dataset.gpk === 'X' && document.getElementById('fbBlock').dataset.gpk === 'RB'), 'Kampf-Knöpfe zeigen A / X / RB');
await hold(0, true); await sl(120); const a1 = await p.evaluate(() => __bi.combat.dbg.atk && __bi.combat.dbg.atk.kind); await hold(0, false); ok(a1 === 'punch', 'A = Schlag (' + a1 + ')'); await sl(1200);
await hold(2, true); await sl(120); const a2 = await p.evaluate(() => __bi.combat.dbg.atk && __bi.combat.dbg.atk.kind); await hold(2, false); ok(a2 === 'kick', 'X = Tritt (' + a2 + ')'); await sl(1200);
await p.evaluate(() => { window.__kh = []; addEventListener('keydown', e => e.code === 'KeyH' && __kh.push(1)); }); await press(5, 300); ok(await p.evaluate(() => __kh.length === 1), 'R1 = Block');
ok(await p.evaluate(() => /Schlag/.test(document.getElementById('gpBar').textContent)), 'Hinweisleiste zeigt Kampf-Tasten');
await p.evaluate(() => { document.getElementById('fbExit').click(); }); await sl(300);
await p.evaluate(() => { const d = BI.DOORS[0], P = __bi.P; P.veh = null; P.x = d.x + 6; P.z = d.z + 6; P.y = __bi.W.groundY(P.x, P.z); }); await p.waitForFunction(() => !document.body.classList.contains('fighting'), null, { timeout: 20000 }).catch(() => { });
/* 6. Bauen: Stick bewegt den Bau-Zeiger, A baut, Y dreht, B fertig */
await p.evaluate(() => __bi.dlg().close()); await p.evaluate(() => __bi.toggleBuild()); await sl(500); ok(await p.evaluate(() => __bi.build.active), 'Baumodus an');
const g0 = await p.evaluate(() => [__bi.build.gx, __bi.build.gz]); await axes([1, 0, 0, 0]); await sl(700); await axes([0, 0, 0, 0]); await sl(200);
const g1 = await p.evaluate(() => [__bi.build.gx, __bi.build.gz]); ok(g0.join() !== g1.join(), 'Stick bewegt den Bau-Zeiger ' + g0 + ' → ' + g1);
const r0 = await p.evaluate(() => __bi.build.rot); await press(3); ok(await p.evaluate(r0 => __bi.build.rot !== r0, r0), 'Y dreht');
const fnd = await p.evaluate(() => { const B = __bi.build; for (let a = 5; a < 30; a++) for (let c = -30; c < 30; c++) if (B.canPlace(B.sel, c, a, 0)) { B.rot = 0; B.setCursor(c * 4, a * 4); return [c, a]; } return null; }); await sl(300); console.log('   Bauplatz', fnd, await p.evaluate(() => [__bi.build.gx, __bi.build.gz, __bi.build.valid]));
const c0 = await p.evaluate(() => __bi.build.count); await press(0); await sl(300); const c1 = await p.evaluate(() => __bi.build.count); ok(c1 === c0 + 1, 'A baut (' + c0 + ' → ' + c1 + ') ' + await p.evaluate(() => JSON.stringify({ v: __bi.build.valid, sel: __bi.build.sel, b: document.body.className, ov: !!__bi.pad.dbg.overlay(), hud: __bi.pad.hud, pl: document.getElementById('bPlace').hidden })));
await p.waitForFunction(() => !__bi.build.dirty, null, { timeout: 2000 }).catch(() => { }); await press(6, 250); await sl(300); ok(await p.evaluate(c0 => __bi.build.count === c0, c0), 'L2 = Zurück (Rückgängig)');
await press(1); await sl(300); ok(await p.evaluate(() => !__bi.build.active), 'B: Bauen fertig');
/* 7. PlayStation und Switch: Symbole an allen Knöpfen */
await off(); await sl(200); await mk('DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)'); await sl(400);
ok(await p.evaluate(() => document.getElementById('fbKick').dataset.gpk === '□' && document.getElementById('bPause').dataset.gpk === 'OPTIONS' && document.getElementById('bCam').dataset.gpk === 'L1'), 'PlayStation: □ Tritt, OPTIONS Menü, L1 Kamera');
await off(); await sl(200); await mk('Pro Controller (STANDARD GAMEPAD Vendor: 057e Product: 2009)'); await sl(400);
ok(await p.evaluate(() => document.getElementById('fbKick').dataset.gpk === 'Y' && document.getElementById('bPause').dataset.gpk === '+' && document.getElementById('bCam').dataset.gpk === 'L' && document.getElementById('bPlace').dataset.gpk === 'A'), 'Switch: Y Tritt, + Menü, L Kamera, A Bauen');
await off(); await sl(200);
ok(await p.evaluate(() => !document.getElementById('bPause').dataset.gpk), 'Ohne Controller keine Symbole');
ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 3).join(' | '));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); process.exit(fails ? 1 : 0);
