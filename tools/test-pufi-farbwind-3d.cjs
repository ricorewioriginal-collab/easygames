#!/usr/bin/env node
// Prüft „Pufi & der Farbwind 3D“: Leveldaten (Node) und Spielablauf im echten Browser (Playwright/Chromium, WebGL per SwiftShader).
//   node tools/test-pufi-farbwind-3d.cjs           PUFI_SHOTS=/pfad speichert Bildschirmfotos
'use strict';
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const W = require(path.join(root, 'pufi-farbwind/3d/welten.js'));

// ---------- 1. Leveldaten ----------
assert.equal(W.COUNT, 6);
W.LEVELS.forEach((L, i) => {
  const v = W.validate(L), t = W.totals(L);
  assert(v.ok, L.id + ': ' + v.reason);
  assert.equal(t.flowers, 5, L.id + ' braucht fünf Farbblüten');
  assert.equal(t.red, 8, L.id + ' braucht acht rote Münzen');
  assert.equal(L.items.filter(o => o.k === 'ziel').length, 1, L.id + ' braucht genau ein Ziel');
  assert(L.items.some(o => o.k === 'ring'), L.id + ' braucht einen Farbring');
  assert.equal(!!L.boss, i === W.COUNT - 1);
});
assert(W.LEVELS.filter(L => L.items.some(o => o.k === 'retrozone')).length >= 2, 'mindestens zwei Retro-Zonen');
console.log('OK  6 Level erreichbar, je 5 Blüten, 8 rote Münzen, Ziel, Farbring, Boss am Ende');

// ---------- 2. Browser ----------
let playwright;
try { playwright = require('playwright'); } catch (_) {
  try { playwright = require('/opt/node22/lib/node_modules/playwright'); } catch (_) { console.log('HINWEIS: Playwright nicht gefunden – Browserteil übersprungen.'); process.exit(0); }
}
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.mp3': 'audio/mpeg' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]); let f = path.join(root, u);
  if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (u.endsWith('/')) f = path.join(f, 'index.html');
  fs.readFile(f, (err, data) => { if (err) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); res.end(data); });
});
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const url = 'http://127.0.0.1:' + server.address().port + '/pufi-farbwind/';
  const shots = process.env.PUFI_SHOTS;
  const browser = await playwright.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const errors = [];
  const watch = page => { page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|favicon|firebase|gstatic|googleapis/i.test(m.text())) errors.push(m.text()); }); };
  const S = p => p.evaluate(() => Pufi3D.state());
  try {
    // ---- Tastatur: Start, Menü, Mechaniken ----
    const page = await browser.newPage({ viewport: { width: 960, height: 540 } }); watch(page);
    await page.goto(url);
    assert.equal((await S(page)).mode, 'boot');
    await page.waitForSelector('#boot.ready', { timeout: 6000 });
    if (shots) await page.screenshot({ path: path.join(shots, 'pufi3d-boot.png') });
    await page.keyboard.press('Enter');
    assert.equal((await S(page)).view, 'title', 'Taste öffnet das Hauptmenü');
    const menu = await page.locator('#screen .btn').allTextContents();
    for (const t of ['Abenteuer', 'Inselkarte', 'Klassik 2D', 'Optionen', 'Steuerung', 'Google-Speicher']) assert(menu.some(x => x.includes(t)), 'Hauptmenü zeigt ' + t);
    await page.waitForTimeout(600); if (shots) await page.screenshot({ path: path.join(shots, 'pufi3d-menu.png') });
    // Pfeiltasten wählen im Menü
    await page.keyboard.press('ArrowDown');
    assert((await page.evaluate(() => document.activeElement.textContent)).includes('Inselkarte'), 'Pfeil ↓ wählt den nächsten Menüpunkt');
    await page.keyboard.press('Enter'); assert.equal((await S(page)).view, 'map', 'Enter öffnet die Inselkarte');
    assert.equal(await page.locator('#screen .lvl').count(), 6);
    await page.keyboard.press('Escape'); assert.equal((await S(page)).view, 'title', 'Esc geht zurück');
    await page.waitForTimeout(150); await page.keyboard.press('Enter');
    assert.equal((await S(page)).mode, 'play', 'Abenteuer startet');
    await page.waitForTimeout(800); if (shots) await page.screenshot({ path: path.join(shots, 'pufi3d-play.png') });

    // Echte Tastatur: W läuft nach vorn (Richtung −z)
    await page.evaluate(() => { Pufi3D.manual(true); Pufi3D.level().enemies.forEach(e => { e.pos.set(60, 0, 60); e.base.set(60, 0, 60); }); });
    const z0 = (await S(page)).P.z;
    await page.keyboard.down('KeyW'); await page.evaluate(() => Pufi3D.step(40)); await page.keyboard.up('KeyW');
    assert((await S(page)).P.z < z0 - 3, 'W läuft vorwärts, weg von der Kamera');
    // Springen + Flattern (Leertaste halten)
    await page.keyboard.down('Space'); await page.evaluate(() => Pufi3D.step(2));
    assert((await S(page)).P.vy > 5, 'Leertaste springt');
    let flutter = false; for (let i = 0; i < 40 && !flutter; i++) { await page.evaluate(() => Pufi3D.step(1)); flutter = (await S(page)).P.flutter; }
    assert(flutter, 'Halten nach dem Höhepunkt flattert');
    await page.keyboard.up('Space'); await page.evaluate(() => Pufi3D.step(90));
    assert((await S(page)).P.ground, 'landet wieder');
    // Zunge fängt Muffel, Stampfen legt ein Ei, Werfen
    const caught = await page.evaluate(() => {
      const L = Pufi3D.level(), e = L.enemies.find(e => e.k === 'muffel' && e.alive); const P = Pufi3D.P; e.pos.set(0, 0, -4);
      Pufi3D.set(e.pos.x, e.pos.y, e.pos.z + 2); P.face = Math.PI; P.ground = null; Pufi3D.step(10);
      e.pos.set(P.pos.x, P.pos.y, P.pos.z - 2); e.o.r = 0; e.base.copy(e.pos);
      P.face = Math.PI; P.inv = 2; Pufi3D.press('tongue', true); Pufi3D.step(1); Pufi3D.press('tongue', false); Pufi3D.step(30);
      return Pufi3D.state().mouth;
    });
    assert.equal(caught, 'muffel', 'Zunge (X) fängt einen Muffel');
    await page.keyboard.down('KeyV'); await page.evaluate(() => Pufi3D.step(2)); await page.keyboard.up('KeyV'); await page.evaluate(() => Pufi3D.step(2));
    assert.equal((await S(page)).eggs, 1, 'Stampfen am Boden legt ein Ei');
    await page.keyboard.down('KeyC'); await page.evaluate(() => Pufi3D.step(2));
    assert((await S(page)).aim, 'C zielt');
    await page.evaluate(() => Pufi3D.step(25)); await page.keyboard.up('KeyC'); await page.evaluate(() => Pufi3D.step(2));
    assert.equal((await S(page)).eggs, 0, 'Loslassen wirft das Ei');
    assert.equal(await page.evaluate(() => Pufi3D.level().eggs.length), 1, 'Ei fliegt');
    // Eierblock von unten anstoßen
    const fromBlock = await page.evaluate(() => { const L = Pufi3D.level(), s = L.solids.find(s => s.kind === 'eiblock'); const o = s.ref.o; Pufi3D.set(o.x, 0, o.z); Pufi3D.step(5); Pufi3D.press('jump', true); Pufi3D.step(30); Pufi3D.press('jump', false); Pufi3D.step(40); return Pufi3D.state().eggs; });
    assert(fromBlock >= 1, 'Eierblock gibt ein Ei');
    // Treffer: Tamo schwebt davon, Sterne zählen herunter
    await page.evaluate(() => { Pufi3D.P.inv = 0; Pufi3D.hurt(); Pufi3D.step(100); });
    let st = await S(page); assert(!st.baby && st.stars < 10, 'Treffer startet den Sterne-Countdown');
    await page.evaluate(() => { const b = Pufi3D.level().bubble.mesh.position; Pufi3D.set(b.x, b.y - 0.9, b.z); Pufi3D.step(1); });
    assert((await S(page)).baby, 'Blase berühren holt Tamo zurück');
    // Farbring
    await page.evaluate(() => { const r = Pufi3D.level().rings[0].mesh.position; Pufi3D.set(r.x, r.y - 0.8, r.z); Pufi3D.step(2); });
    assert(await page.evaluate(() => Pufi3D.level().rings[0].used), 'Farbring wird aktiviert');
    // Ins Wasser fallen kostet ein Leben
    const lives = (await S(page)).lives;
    await page.evaluate(() => { Pufi3D.set(30, -1, 30); Pufi3D.step(150); });
    assert.equal((await S(page)).lives, lives - 1, 'Wasser kostet ein Leben');
    // Pause per Esc
    await page.evaluate(() => Pufi3D.manual(false));
    await page.keyboard.press('Escape'); assert.equal((await S(page)).mode, 'pause', 'Esc pausiert');
    const pbtn = await page.locator('#screen .btn').allTextContents();
    for (const t of ['Weiterspielen', 'neu starten', 'Optionen', 'Steuerung', 'Inselkarte', 'Hauptmenü']) assert(pbtn.some(x => x.includes(t)), 'Pausemenü zeigt ' + t);
    await page.keyboard.press('Escape'); assert.equal((await S(page)).mode, 'play', 'Esc schließt die Pause');
    // Ziel erreichen → Abrechnung
    await page.evaluate(() => { Pufi3D.manual(true); const g = Pufi3D.level().goal.mesh.position; Pufi3D.set(g.x, g.y + 0.5, g.z); Pufi3D.step(30); });
    assert.equal((await S(page)).mode, 'clearAnim', 'Farbtor beendet das Level');
    await page.evaluate(() => Pufi3D.manual(false)); await page.waitForFunction(() => Pufi3D.state().view === 'clear', null, { timeout: 6000 });
    if (shots) await page.screenshot({ path: path.join(shots, 'pufi3d-clear.png') });
    assert((await page.locator('#screen .tally').textContent()).includes('/ 100'), 'Abrechnung bis 100 Punkte');

    // ---- Windsäule (1-2) ----
    await page.evaluate(() => { Pufi3D.start(1); Pufi3D.manual(true); const w = Pufi3D.level().winds[0]; Pufi3D.set(w.x, w.y + 2, w.z); Pufi3D.step(30); });
    assert((await S(page)).P.vy > 2, 'Farbwind trägt nach oben');
    // ---- Retro-Zone und Bröckelstufen (2-1) ----
    await page.evaluate(() => { Pufi3D.start(2); Pufi3D.manual(true); Pufi3D.set(0, 2, -40); Pufi3D.step(20); });
    st = await S(page); assert(st.retro, 'Retro-Zone schaltet die Seitenansicht ein');
    if (shots) { await page.evaluate(() => Pufi3D.manual(false)); await page.waitForTimeout(900); await page.screenshot({ path: path.join(shots, 'pufi3d-retro.png') }); await page.evaluate(() => Pufi3D.manual(true)); }
    const zr = (await S(page)).P.z; await page.keyboard.down('KeyD'); await page.evaluate(() => Pufi3D.step(30)); await page.keyboard.up('KeyD');
    st = await S(page); assert(st.P.z < zr - 2 && Math.abs(st.P.x) < 0.3, 'Rechts läuft in der Retro-Zone die Strecke entlang');
    await page.evaluate(() => { Pufi3D.set(0, 8, -12); Pufi3D.step(150); });
    assert(await page.evaluate(() => Pufi3D.level().crumbles[0].s.on === false || Pufi3D.level().crumbles[0].t > -1), 'Honigstufe bröckelt');
    // ---- Farbschalter (2-2) ----
    await page.evaluate(() => { Pufi3D.start(3); Pufi3D.manual(true); const s = Pufi3D.level().solids.find(s => s.kind === 'schalter'); Pufi3D.set(s.x, s.y1 + 2, s.z); Pufi3D.step(60); });
    assert((await S(page)).switchT > 5, 'Farbschalter aktiviert die Blöcke');
    assert(await page.evaluate(() => Pufi3D.level().fblocks.every(b => b.on)), 'Farbblöcke werden begehbar');
    // ---- Boss (3-2) ----
    await page.evaluate(() => { Pufi3D.start(5); Pufi3D.manual(true); Pufi3D.set(0, 3.5, -26); Pufi3D.P.inv = 99; Pufi3D.step(200); });
    assert.notEqual((await S(page)).boss.state, 'wait', 'Boss erwacht in der Arena');
    for (let k = 0; k < 3; k++) await page.evaluate(() => { Pufi3D.hurtBoss(); Pufi3D.P.inv = 99; Pufi3D.step(70); });
    await page.evaluate(() => { Pufi3D.P.inv = 99; Pufi3D.step(200); });
    st = await S(page); assert.equal(st.boss.hp, 0); assert(st.goal, 'Nach dem Boss öffnet sich das Farbtor');
    if (shots) { await page.evaluate(() => Pufi3D.manual(false)); await page.waitForTimeout(600); await page.screenshot({ path: path.join(shots, 'pufi3d-boss.png') }); }
    // Optionen und Steuerung
    await page.evaluate(() => { Pufi3D.manual(false); Pufi3D.title(); });
    await page.evaluate(() => Pufi3D.options()); assert.equal((await S(page)).view, 'options');
    assert(await page.locator('#oMusic').count() && await page.locator('#oSens').count(), 'Optionen: Lautstärke und Kamera');
    await page.evaluate(() => Pufi3D.help()); const help = await page.locator('#screen').textContent();
    for (const t of ['PC', 'Controller', 'Touch', 'Jestan', 'GreenRetroman']) assert(help.includes(t), 'Steuerung/Mitwirkende nennt ' + t);
    console.log('OK  Tastatur: Menü, Laufen, Springen, Flattern, Zunge, Ei legen/werfen, Eierblock, Countdown, Farbring, Wasser, Pause, Ziel, Wind, Retro-Zone, Bröckeln, Schalter, Boss');
    await page.close();

    // ---- Controller ----
    const gp = await browser.newPage({ viewport: { width: 1280, height: 720 } }); watch(gp);
    await gp.addInitScript(() => {
      const pad = { id: 'Testpad (STANDARD GAMEPAD)', index: 0, connected: true, mapping: 'standard', axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
      window.__pad = pad; navigator.getGamepads = () => [pad, null, null, null];
      window.__press = (i, on) => { pad.buttons[i] = { pressed: on, value: on ? 1 : 0 }; };
    });
    await gp.goto(url);
    await gp.evaluate(() => { const e = new Event('gamepadconnected'); e.gamepad = window.__pad; window.dispatchEvent(e); });
    await gp.waitForSelector('#boot.ready', { timeout: 6000 });
    const tap = async i => { await gp.evaluate(i => window.__press(i, true), i); await gp.waitForTimeout(400); await gp.evaluate(i => window.__press(i, false), i); await gp.waitForTimeout(400); };   // SwiftShader rendert langsam: länger halten
    await tap(0); assert.equal((await S(gp)).view, 'title', 'A verlässt den Startbildschirm');
    for (let k = 0; k < 4 && (await S(gp)).mode !== 'play'; k++) { await gp.waitForTimeout(250); await tap(0); if (process.env.PUFI_DEBUG) console.log(await gp.evaluate(() => [Pufi3D.state().mode, document.activeElement && document.activeElement.className, document.documentElement.className])); }
    assert.equal((await S(gp)).mode, 'play', 'A startet aus dem Hauptmenü (gamepad.js führt das Menü)');
    await gp.evaluate(() => { window.__pad.axes[1] = -0.01; });   // warten, bis gamepad.js den Controller nach dem Menü freigibt
    await gp.waitForFunction(() => { window.__pad.axes[3] = -1; const v = navigator.getGamepads()[0].axes[3]; window.__pad.axes[3] = 0; return v < -0.5; }, null, { timeout: 8000, polling: 100 });
    await gp.evaluate(() => { Pufi3D.manual(true); Pufi3D.level().enemies.forEach(e => { e.pos.set(99, 0, 99); e.base.set(99, 0, 99); }); });
    const gz = (await S(gp)).P.z;
    await gp.evaluate(() => { window.__pad.axes[1] = -1; Pufi3D.step(40); window.__pad.axes[1] = 0; });
    assert((await S(gp)).P.z < gz - 3, 'Linker Stick läuft');
    const yaw0 = (await S(gp)).camYaw; await gp.evaluate(() => { window.__pad.axes[2] = 1; Pufi3D.step(30); window.__pad.axes[2] = 0; Pufi3D.step(1); });
    assert(Math.abs((await S(gp)).camYaw - yaw0) > 0.5, 'Rechter Stick dreht die Kamera');
    await gp.evaluate(() => { window.__press(0, true); Pufi3D.step(2); });
    assert((await S(gp)).P.vy > 5, 'A springt'); await gp.evaluate(() => { window.__press(0, false); Pufi3D.step(90); });
    await gp.evaluate(() => { Pufi3D.giveEggs(2); window.__press(1, true); Pufi3D.step(3); });
    assert((await S(gp)).aim, 'B zielt'); await gp.evaluate(() => { Pufi3D.step(25); window.__press(1, false); Pufi3D.step(2); });
    assert.equal((await S(gp)).eggs, 1, 'B loslassen wirft');
    await gp.evaluate(() => { window.__press(0, true); Pufi3D.step(20); window.__press(0, false); window.__press(3, true); Pufi3D.step(3); window.__press(3, false); Pufi3D.step(2); });
    assert((await S(gp)).P.pound > 0, 'Y stampft in der Luft');
    await gp.evaluate(() => { Pufi3D.step(60); Pufi3D.manual(false); });
    await tap(9); assert.equal((await S(gp)).mode, 'pause', 'Start pausiert');
    await tap(1); if (process.env.PUFI_DEBUG) await gp.screenshot({ path: '/tmp/claude-0/work/shots/padpause.png' });
    for (let k = 0; k < 3 && (await S(gp)).mode !== 'play'; k++) await tap(1);
    assert.equal((await S(gp)).mode, 'play', 'B schließt die Pause');
    console.log('OK  Controller: Menü, Stick, Kamera, A/B/Y, Start/B');
    await gp.close();

    // ---- Touch (Handy) ----
    const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
    const tp = await ctx.newPage(); watch(tp);
    await tp.goto(url); await tp.waitForSelector('#boot.ready', { timeout: 6000 });
    await tp.tap('#boot'); assert.equal((await S(tp)).view, 'title', 'Tippen öffnet das Menü');
    await tp.tap('#screen .btn.primary'); assert.equal((await S(tp)).mode, 'play');
    await tp.waitForTimeout(400);
    assert(await tp.isVisible('#touch'), 'Touch-Steuerung sichtbar');
    await tp.evaluate(() => Pufi3D.manual(true));
    const box = await tp.locator('#stickZone').boundingBox(), tz = (await S(tp)).P.z;
    const cdp = await ctx.newCDPSession(tp);
    const tch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
    await tch('touchStart', box.x + 100, box.y + box.height * 0.6); await tch('touchMove', box.x + 100, box.y + box.height * 0.6 - 50);
    await tp.evaluate(() => Pufi3D.step(40)); await tch('touchEnd');
    assert((await S(tp)).P.z < tz - 3, 'Daumen-Stick läuft');
    const a = await tp.locator('#face .a').boundingBox();
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a.x + a.width / 2, y: a.y + a.height / 2, id: 2 }] });
    await tp.evaluate(() => Pufi3D.step(2)); assert((await S(tp)).P.vy > 5, 'A-Knopf springt per Touch');
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    if (shots) { await tp.evaluate(() => Pufi3D.manual(false)); await tp.waitForTimeout(800); await tp.screenshot({ path: path.join(shots, 'pufi3d-touch.png') }); }
    console.log('OK  Touch: Stick, A-Knopf, Querformat');
    await ctx.close();

    assert.deepEqual(errors, [], 'Keine Fehler in der Konsole');
    console.log('OK  keine Konsolenfehler');
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exit(1); });
