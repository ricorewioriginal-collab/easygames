/* Test des Fernseher-Modus: TV-Seite (index.html?tv=1) + 2 Handy-Controller (controller.html) über einen Fake-PeerJS.
   Aufruf: THREE=/pfad/three.min.js node bunte-insel/tests/tv.mjs   (SHOTS=/ordner speichert Bilder) */
import { chromium } from 'playwright';
import fs from 'fs';
const BASE = process.env.BASE || 'http://localhost:8080', SHOTS = process.env.SHOTS;
const src = fs.readFileSync(new URL('./mp.mjs', import.meta.url), 'utf8'); const i0 = src.indexOf('const INIT = () => {'), i1 = src.indexOf('};\nconst errs', i0) + 2;
const INIT = eval('(' + src.slice(i0 + 'const INIT = '.length, i1 - 1) + ')');
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const errs = []; let fails = 0; const pages = []; const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const mk = async (vw, vh, touch) => { const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, hasTouch: !!touch }); await ctx.addInitScript(INIT); const p = await ctx.newPage(); pages.push(p);
  await p.exposeFunction('__tx', m => { for (const q of pages) if (q !== p) q.evaluate(x => window.__rx && window.__rx(x), m).catch(() => { }); });
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join('|'))); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errs.push(m.text()); });
  if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
  await p.route('**/peerjs.min.js', r => r.fulfill({ body: '', contentType: 'application/javascript' })); await p.route('**/qrcode.min.js', r => r.abort());
  await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort()); return p; };
const sl = ms => new Promise(r => setTimeout(r, ms));
const TV = await mk(1280, 720); await TV.goto(BASE + '/bunte-insel/index.html?tv=1'); await TV.waitForFunction(() => window.__bi, null, { timeout: 60000 });
await TV.waitForFunction(() => __bi.tv.on && /^[A-Z2-9]{4}$/.test(__bi.tv.code), null, { timeout: 15000 }); const code = await TV.evaluate(() => __bi.tv.code);
ok(await TV.evaluate(() => !document.getElementById('tvPanel').hidden && document.body.classList.contains('tv')), 'TV: ?tv=1 startet den Fernseher-Modus von selbst, Code ' + code + ' und Anleitung stehen da');
const C1 = await mk(844, 390, true); await C1.goto(BASE + '/bunte-insel/controller.html?c=' + code);
await C1.waitForFunction(() => window.__ctl && window.__ctl.slot === 0, null, { timeout: 10000 }); ok(await C1.evaluate(() => !document.getElementById('sTitle').hidden), 'Controller 1: verbunden als Spieler 1, zeigt „Spielen“ (Titel)');
await C1.click('#bStart'); await TV.waitForFunction(() => document.getElementById('bStart') && !document.getElementById('menu').offsetParent || __bi.P, null, { timeout: 8000 }).catch(() => { });
await TV.click('#tvOk').catch(() => { }); await sl(1500); const st = await TV.evaluate(() => ({ play: !document.getElementById('menu').offsetParent }));
ok(st.play, 'Controller „Spielen“ startet das Spiel am Fernseher'); await C1.waitForFunction(() => !document.getElementById('pad').hidden, null, { timeout: 5000 });
/* Stick: nach oben ziehen -> Figur läuft */
const bs = await C1.evaluate(() => ({ w: innerWidth, h: innerHeight })); const p0 = await TV.evaluate(() => ({ x: __bi.P.x, z: __bi.P.z, y: __bi.P.y }));
await C1.mouse.move(120, 280); await C1.mouse.down(); await C1.mouse.move(120, 215, { steps: 4 }); await sl(1800); const p1 = await TV.evaluate(() => ({ x: __bi.P.x, z: __bi.P.z, sp: __bi.P.speed })); await C1.mouse.up(); await sl(300);
ok(Math.hypot(p1.x - p0.x, p1.z - p0.z) > .8, 'Stick am Handy bewegt die Hauptfigur (' + Math.hypot(p1.x - p0.x, p1.z - p0.z).toFixed(1) + ' m)');
ok(await TV.evaluate(() => Math.hypot(__bi.tv.dbg.slots[0].stick[0], __bi.tv.dbg.slots[0].stick[1]) === 0), 'Stick loslassen: Figur bleibt stehen (Stick 0)');
/* Springen */ let hi = 0; await C1.dispatchEvent('#bB', 'pointerdown', { pointerId: 3, bubbles: true }); for (let k = 0; k < 8; k++) { await sl(70); hi = Math.max(hi, await TV.evaluate(() => __bi.P.y)); } await C1.dispatchEvent('#bB', 'pointerup', { pointerId: 3, bubbles: true }); ok(hi > .3, 'Knopf „Springen“ am Handy: Figur springt (' + hi.toFixed(2) + ' m)');
/* Beschriftung vom Fernseher */ await sl(500); const lab = await C1.evaluate(() => document.querySelector('#bA small').textContent), labTv = await TV.evaluate(() => document.querySelector('#bAct small').textContent); ok(lab === labTv, 'Aktionsknopf zeigt dieselbe Beschriftung wie am Fernseher („' + lab + '“)');
/* Aktion: nächstes Fahrzeug -> Einsteigen */
await TV.evaluate(async () => { const b = __bi, v = b.vehicles.find(q => q.type === 'car'); b.P.veh = null; b.P.x = v.x + 2; b.P.z = v.z; await new Promise(r => setTimeout(r, 400)); }); await sl(600);
await C1.dispatchEvent('#bA', 'pointerdown', { pointerId: 4, bubbles: true }); await sl(80); await C1.dispatchEvent('#bA', 'pointerup', { pointerId: 4, bubbles: true }); await sl(500);
ok(await TV.evaluate(() => !!__bi.P.veh), 'Knopf A am Handy: Einsteigen ins Auto'); await TV.evaluate(() => __bi.leave(true));
/* Controller 2 + Mitspieler */
const C2 = await mk(844, 390, true); await C2.goto(BASE + '/bunte-insel/controller.html?c=' + code); await C2.waitForFunction(() => window.__ctl && window.__ctl.slot === 1, null, { timeout: 10000 });
await sl(500); ok(await TV.evaluate(() => __bi.tv.count() === 2 && !!__bi.tv.dbg.slots[1].mate), 'Controller 2: Spieler 2, Mitspieler-Figur erscheint im Spiel');
const m0 = await TV.evaluate(() => { const m = __bi.tv.dbg.slots[1].mate; return [m.x, m.z]; }); await C2.mouse.move(120, 280); await C2.mouse.down(); await C2.mouse.move(180, 280, { steps: 4 }); await sl(1800); await C2.mouse.up();
const m1 = await TV.evaluate(() => { const m = __bi.tv.dbg.slots[1].mate; return [m.x, m.z]; }); ok(Math.hypot(m1[0] - m0[0], m1[1] - m0[1]) > .8, 'Stick von Spieler 2 bewegt dessen Figur (' + Math.hypot(m1[0] - m0[0], m1[1] - m0[1]).toFixed(1) + ' m)');
await C2.dispatchEvent('#bB', 'pointerdown', { pointerId: 5, bubbles: true }); let mh = 0; for (let k = 0; k < 8; k++) { await sl(70); mh = Math.max(mh, await TV.evaluate(() => __bi.tv.dbg.slots[1].mate.y)); } await C2.dispatchEvent('#bB', 'pointerup', { pointerId: 5, bubbles: true }); ok(mh > .3, 'Spieler 2 kann springen (' + mh.toFixed(2) + ' m)');
/* Mitfahren: Spieler 2 steigt in das Auto von Spieler 1, fährt nur mit, steigt mit aus */
await TV.evaluate(async () => { const b = __bi, v = b.vehicles.find(q => q.type === 'car'); b.P.veh = null; b.P.x = v.x + 2; b.P.z = v.z; const m = b.tv.dbg.slots[1].mate; m.x = v.x - 2; m.z = v.z; m.y = 0; await new Promise(r => setTimeout(r, 500)); b.enter(v); await new Promise(r => setTimeout(r, 500)); });
await sl(500); ok(await C2.evaluate(() => document.querySelector('#bA small').textContent) === 'Mitfahren', 'Controller 2 zeigt „Mitfahren“, sobald Spieler 1 im Auto sitzt');
await C2.dispatchEvent('#bA', 'pointerdown', { pointerId: 8, bubbles: true }); await sl(80); await C2.dispatchEvent('#bA', 'pointerup', { pointerId: 8, bubbles: true }); await sl(500);
ok(await TV.evaluate(() => !!__bi.tv.dbg.slots[1].mate.veh && __bi.tv.dbg.slots[1].mate.veh === __bi.P.veh), 'Spieler 2 sitzt im selben Auto wie Spieler 1');
await C2.mouse.move(120, 280); await C2.mouse.down(); await C2.mouse.move(180, 280, { steps: 3 }); await TV.evaluate(() => { __bi.keys.u = true; }); await sl(2500); await TV.evaluate(() => { __bi.keys.u = false; }); await C2.mouse.up();
const rd = await TV.evaluate(() => { const v = __bi.P.veh, m = __bi.tv.dbg.slots[1].mate; return { d: Math.hypot(m.x - v.x, m.z - v.z), moved: Math.hypot(v.x - m.sx0, v.z - m.sz0) }; });
ok(rd.d < 1, 'Spieler 2 fährt mit dem Auto mit (Abstand zum Auto ' + rd.d.toFixed(2) + ' m) – sein Stick lenkt nicht');
await TV.evaluate(() => __bi.leave(true)); await sl(600); ok(await TV.evaluate(() => !__bi.tv.dbg.slots[1].mate.veh), 'Steigt Spieler 1 aus, steigen die Mitfahrer mit aus');
/* Splitscreen über das Menü am Handy */
await C1.click('#menuBtn'); await C1.click('#mSplit'); await sl(800); const sp = await TV.evaluate(() => ({ s: __bi.tv.split, v: __bi.tv.dbg.views().length, dom: !document.getElementById('tvSplit').hidden }));
ok(sp.s && sp.v === 2 && sp.dom, 'Splitscreen am Handy eingeschaltet: 2 Bilder am Fernseher'); await C1.click('#close'); await sl(1200);
const rend = await TV.evaluate(() => __bi.renderer.info.render.calls); ok(rend > 0, 'Splitscreen zeichnet ohne Fehler (' + rend + ' Zeichenaufrufe für beide Bilder)');
if (SHOTS) { await TV.screenshot({ path: SHOTS + '/tv-split.png' }); await C1.screenshot({ path: SHOTS + '/ctl-play.png' }); }
await C2.evaluate(() => 0); /* Zeiger-Modus: Spaß-Leiste öffnen, mit Stick+A klicken */
await TV.evaluate(() => __bi.tv && 0); await C1.click('#menuBtn'); await C1.click('[data-k=fun]'); await sl(900);
const mm = await TV.evaluate(() => ({ menu: __bi.tv.menuMode, bar: !document.getElementById('funBar').hidden })); ok(mm.menu && mm.bar, 'Spaß-Leiste öffnet sich am Fernseher, Controller wechselt in den Zeiger-Modus');
await C1.waitForFunction(() => window.__ctl.mode === 'menu', null, { timeout: 4000 }).catch(() => { }); if (SHOTS) await C1.screenshot({ path: SHOTS + '/ctl-menu.png' }); ok(await C1.evaluate(() => !document.getElementById('banner').hidden), 'Controller zeigt „Zeiger-Modus“ (' + (await C1.evaluate(() => window.__ctl.mode)) + ')');
const tgt = await TV.evaluate(() => { const b = document.querySelector('#funBar .fb'); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, k: b.dataset.k }; });
await TV.evaluate(t => { const p = __bi.tv.dbg.ptr; p.x = t.x - 2; p.y = t.y - 2; }, tgt); await C1.dispatchEvent('#bA', 'pointerdown', { pointerId: 6, bubbles: true }); await sl(80); await C1.dispatchEvent('#bA', 'pointerup', { pointerId: 6, bubbles: true }); await sl(700);
ok(await TV.evaluate(() => document.getElementById('funBar').hidden), 'Zeiger + Klick am Handy drückt die Schaltfläche am Fernseher (Leiste schließt sich)');
/* Trennen */ await C2.click('#menuBtn'); await C2.click('[data-k=leave]'); await sl(700); ok(await TV.evaluate(() => __bi.tv.count() === 1 && !__bi.tv.split && __bi.tv.dbg.views().length === 0), 'Spieler 2 trennt: Mitspieler weg, Splitscreen aus');
/* Handy öffnet das NORMALE Spiel → Mitspielen → Beitreten → Fernseher-Code: wird automatisch zum Controller */
{ const PH = await mk(844, 390, true); await PH.goto(BASE + '/bunte-insel/index.html'); await PH.waitForFunction(() => window.__bi, null, { timeout: 60000 });
  await PH.evaluate(() => { document.getElementById('bMulti').click(); }); await sl(300); await PH.evaluate(() => document.getElementById('mpJoin').click()); await sl(200);
  ok(await PH.evaluate(() => /Fernseher/.test(document.getElementById('mpStatus').textContent)), 'Beitreten-Dialog erklärt: Fernseher-Codes gehen auch');
  await PH.evaluate(c => { const b = [...document.querySelectorAll('#mpPad button')]; for (const ch of c) b.find(x => x.textContent === ch).click(); [...document.querySelectorAll('#mpPad button.go')][0].click(); }, code);
  await PH.waitForURL(/controller\.html\?c=/, { timeout: 15000 }).catch(() => { }); ok(/controller\.html\?c=/.test(PH.url()), 'Fernseher-Code im „Mitspielen“-Dialog öffnet den Controller (' + PH.url().split('/').pop() + ')');
  await PH.waitForFunction(() => window.__ctl && window.__ctl.slot >= 0, null, { timeout: 10000 }).catch(() => { }); ok(await PH.evaluate(() => !!window.__ctl && window.__ctl.slot >= 0), 'Das Handy ist am Fernseher als Controller verbunden (Platz ' + await PH.evaluate(() => window.__ctl && window.__ctl.slot) + ')'); }
for (const e of errs.slice(0, 10)) console.log('ERR ', e); ok(errs.length === 0, 'Keine Seitenfehler');
await browser.close(); console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlles gut ✅'); process.exit(fails ? 1 : 0);
