// Test für Kraterkommando 3D im Browser: 3D-Modelle, Konsolen-Menü, Controller (nachgebaut), Tastatur/TV und Touch.
//   NODE_PATH=$(npm root -g) node tools/test-kraterkommando.cjs        (Exit-Code 1 bei Fehlern, Bilder mit --shots)
'use strict';
const path = require('path'), http = require('http'), fs = require('fs');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..'), SHOTS = process.argv.includes('--shots') ? path.join(ROOT, '.kk-shots') : null;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.glb': 'model/gltf-binary', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/json' };

// Nachgebauter Controller: window.pad = { b: Set gedrückter Knöpfe, ax: [lx, ly, rx, ry] }; zählt Rumble-Aufrufe
const FAKE = `(() => {
  window.pad = { b: new Set(), ax: [0, 0, 0, 0], on: false, rumble: 0 };
  const va = { playEffect: () => { window.pad.rumble++; return Promise.resolve('complete'); } };
  const mk = () => { const f = window.pad; if (!f.on) return [null];
    const buttons = []; for (let i = 0; i < 17; i++) { const v = f.b.has(i) ? 1 : 0; buttons.push({ pressed: !!v, touched: !!v, value: v }); }
    return [{ id: 'Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 0b13)', index: 0, connected: true, timestamp: performance.now(), mapping: 'standard', buttons, axes: f.ax.slice(), vibrationActuator: va }]; };
  Object.defineProperty(Navigator.prototype, 'getGamepads', { value: mk, configurable: true });
})();`;

let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHL ') + m); if (!c) fails++; };
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const server = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split('?')[0]), f = path.join(ROOT, u.endsWith('/') ? u + 'index.html' : u);
    if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  }).listen(0);
  const URL = `http://127.0.0.1:${server.address().port}/kraterkommando/?test`;
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  // three.js vom CDN ist hier gesperrt → Spiel nutzt ../vendor (wie offline in der App)
  const open = async (opts) => {
    const ctx = await browser.newContext(opts), p = await ctx.newPage(), errors = [];
    await ctx.route(/cdnjs\.cloudflare\.com|googleapis|gstatic|firebase/, r => r.abort());
    p.on('pageerror', e => errors.push(e.message));
    await p.addInitScript(FAKE);
    await p.goto(URL);
    await p.waitForFunction(() => document.getElementById('menu').classList.contains('active'), null, { timeout: 40000 });
    await wait(400);
    return { p, ctx, errors };
  };
  const shot = (p, n) => SHOTS && p.screenshot({ path: path.join(SHOTS, n + '.png') });
  if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
  const press = async (p, i, ms = 90) => { await p.evaluate(i => { pad.on = true; pad.b.add(i); }, i); await wait(ms); await p.evaluate(i => pad.b.delete(i), i); await wait(90); };
  const axis = async (p, ax, ms) => { await p.evaluate(a => { pad.on = true; pad.ax = a; }, ax); await wait(ms); await p.evaluate(() => { pad.ax = [0, 0, 0, 0]; }); await wait(60); };
  const focus = p => p.evaluate(() => KK.focus);
  // Zum eigenen Zug vorspulen (Computerzug im Zeitraffer)
  const myTurn = async p => { const r = await p.evaluate(() => { for (let i = 0; i < 400 && !(KK.S.phase === 'aim' && KK.S.team === 0); i++) KK.tick(10); return KK.S.phase === 'aim' && KK.S.team === 0 ? true : JSON.stringify([KK.S.phase, KK.S.team, KK.S.mode, document.querySelector('.screen.active').id]); }); if (r !== true) throw Error('eigener Zug kommt nicht ' + r); await wait(150); };

  // ---------- 1) Controller ----------
  {
    const { p, ctx, errors } = await open({ viewport: { width: 1280, height: 720 } });
    ok(await p.evaluate(() => KK.assets), 'Controller: 3D-Modelle geladen');
    const figs = await p.evaluate(() => { let n = 0; KK.S.units.forEach((u, i) => { if (KK.anim(i)) n++; }); return n; });
    ok(figs === 8, 'Menü-Hintergrund: 8 animierte Figuren (' + figs + ')');
    await press(p, 13);   // Steuerkreuz runter: erster Druck setzt Fokus
    ok(await p.evaluate(() => KK.input) === 'pad', 'Controller-Modus aktiv');
    ok(await p.evaluate(() => document.body.classList.contains('prompts')), 'Tasten-Hinweise im Menü sichtbar');
    const f0 = await focus(p); await press(p, 13); const f1 = await focus(p);
    ok(f0 === 'newGame' && f1 === 'mode', 'Steuerkreuz bewegt den Fokus (' + f0 + ' → ' + f1 + ')');
    await press(p, 15);
    ok(await p.evaluate(() => document.getElementById('mode').value) === 'cpu', '→ ändert den Spielmodus');
    await press(p, 13); ok(await focus(p) === 'worldRow', 'Karte-Zeile erscheint im Schnellen Gefecht');
    await press(p, 15); ok(await p.evaluate(() => document.getElementById('worldVal').textContent.includes('Canyon')), 'Karte wechselt auf Staub-Canyon');
    await wait(500); ok(await p.evaluate(() => KK.S.world) === 'desert', 'Menü-Hintergrund zeigt die gewählte Karte');
    await press(p, 13); await press(p, 14); ok(await p.evaluate(() => document.getElementById('worms').value) === '3', '← verringert Würmer pro Team');
    await shot(p, 'pad-menu');
    for (let i = 0; i < 8 && (await focus(p)) !== 'newGame'; i++) await press(p, 12);
    await press(p, 0);
    await p.waitForFunction(() => document.getElementById('game').classList.contains('active'));
    ok(true, 'A startet das Gefecht');
    await myTurn(p);
    ok(await p.evaluate(() => getComputedStyle(document.getElementById('padHud')).display !== 'none' && getComputedStyle(document.querySelector('.game-dock')).display === 'none'), 'Controller-HUD statt Touch-Leiste');
    ok(await p.evaluate(() => document.getElementById('padLegend').textContent.includes('Feuer')), 'Belegung im HUD');
    const u0 = await p.evaluate(() => { const u = KK.S.units[KK.S.current]; return [u.x, u.z, KK.S.yaw]; });
    await axis(p, [0, -1, 0, 0], 700);
    const u1 = await p.evaluate(() => { const u = KK.S.units[KK.S.current]; return [u.x, u.z]; });
    ok(Math.hypot(u1[0] - u0[0], u1[1] - u0[1]) > .2, 'Linker Stick: Wurm läuft (' + Math.hypot(u1[0] - u0[0], u1[1] - u0[1]).toFixed(2) + ')');
    await p.evaluate(() => { pad.ax = [0, -1, 0, 0]; }); await wait(300);
    ok(await p.evaluate(() => KK.anim(KK.S.current)) === 'walk', 'Laufen-Animation beim Gehen');
    await p.evaluate(() => { pad.ax = [0, 0, 0, 0]; }); await wait(100);
    const y0 = await p.evaluate(() => [KK.S.yaw, KK.S.angle]);
    await axis(p, [0, 0, 1, -1], 400);
    const y1 = await p.evaluate(() => [KK.S.yaw, KK.S.angle]);
    ok(y1[0] > y0[0] + 5 && y1[1] > y0[1] + 3, 'Rechter Stick: Richtung und Winkel');
    await press(p, 5); const w1 = await p.evaluate(() => KK.S.weapon);
    await press(p, 4); const w2 = await p.evaluate(() => KK.S.weapon);
    ok(w1 === 'grenade' && w2 === 'rocket', 'LB/RB wechseln die Waffe (' + w1 + ', ' + w2 + ')');
    await press(p, 2);
    ok(await p.evaluate(() => !document.getElementById('weaponPanel').hidden), 'X öffnet die Waffenliste');
    ok(await focus(p) === 'rocket', 'Fokus auf gewählter Waffe');
    await press(p, 15); await press(p, 13); const wf = await focus(p);
    await press(p, 0);
    ok(await p.evaluate(() => document.getElementById('weaponPanel').hidden) && await p.evaluate(() => KK.S.weapon) === wf, 'A wählt Waffe ' + wf);
    await p.evaluate(() => KK.selectWeapon('rocket'));
    // Luftangriff: Ziel mit dem Stick
    await p.evaluate(() => KK.selectWeapon('airstrike'));
    const t0 = await p.evaluate(() => KK.target && { ...KK.target });
    ok(!!t0 && await p.evaluate(() => KK.overview), 'Luftangriff: Ziel vorbelegt, Übersicht an');
    await axis(p, [0, 0, 1, 0], 300);
    const t1 = await p.evaluate(() => KK.target);
    ok(t1 && Math.hypot(t1.x - t0.x, t1.z - t0.z) > 1, 'Rechter Stick verschiebt das Ziel');
    await p.evaluate(() => KK.selectWeapon('rocket'));
    await p.evaluate(() => { KK.S.angle = 40; });
    const r0 = await p.evaluate(() => pad.rumble);
    await p.evaluate(() => { pad.b.add(7); }); await wait(500); await p.evaluate(() => pad.b.delete(7)); await wait(150);
    ok(await p.evaluate(() => KK.S.phase === 'retreat' || KK.S.phase === 'wait'), 'RT halten + loslassen feuert (' + await p.evaluate(() => KK.S.phase) + ')');
    ok(await p.evaluate(() => pad.rumble) > r0, 'Rumble beim Schuss');
    await shot(p, 'pad-game');
    await press(p, 9);
    ok(await p.evaluate(() => !document.getElementById('pause').hidden), 'Start öffnet Pause');
    ok(await focus(p) === 'resumeBtn', 'Pause: Fokus auf „Weiter spielen“');
    await press(p, 13); await press(p, 0);
    ok(await p.evaluate(() => !document.getElementById('help').hidden), 'Steuerung aus der Pause erreichbar');
    await press(p, 5); ok(await p.evaluate(() => document.querySelector('[data-help].on').dataset.help) === 'kbd', 'RB wechselt Reiter');
    await press(p, 1); ok(await p.evaluate(() => document.getElementById('help').hidden), 'B schließt Steuerung');
    await press(p, 1); ok(await p.evaluate(() => document.getElementById('pause').hidden), 'B setzt das Spiel fort');
    // Zug beenden: Select halten
    await myTurn(p);
    const team0 = await p.evaluate(() => KK.S.current);
    await p.evaluate(() => { pad.b.add(8); }); await wait(900); await p.evaluate(() => pad.b.delete(8)); await wait(100);
    ok(await p.evaluate(() => KK.S.phase) !== 'aim' || await p.evaluate(() => KK.S.current) !== team0, 'Select halten beendet den Zug');
    // Ende: Siegesmenü per Controller
    await p.evaluate(() => { KK.S.units.forEach(u => { if (u.team === 1) { u.hp = 0; u.dead = true; } }); KK.endTurn(); });
    await p.waitForFunction(() => !document.getElementById('result').hidden, null, { timeout: 15000 });
    ok(true, 'Ergebnisfenster erscheint');
    await wait(300);
    ok(await p.evaluate(() => KK.anim(KK.S.units.findIndex(u => u.team === 0 && !u.dead))) === 'dance', 'Sieger tanzen');
    await shot(p, 'pad-result');
    ok(['nextLevelBtn', 'againBtn'].includes(await focus(p)), 'Ergebnis: Fokus auf Hauptknopf (' + await focus(p) + ')');
    for (let i = 0; i < 4 && (await focus(p)) !== 'resultMenuBtn'; i++) await press(p, 13);
    await press(p, 0);
    ok(await p.evaluate(() => document.getElementById('menu').classList.contains('active')), 'Zurück ins Hauptmenü');
    ok(!errors.length, 'Controller: keine Skriptfehler ' + errors.slice(0, 3).join(' | '));
    await ctx.close();
  }

  // ---------- 2) Tastatur / TV-Fernbedienung ----------
  {
    const { p, ctx, errors } = await open({ viewport: { width: 1366, height: 768 } });
    await p.keyboard.press('ArrowDown');
    ok(await p.evaluate(() => KK.input) === 'kbd' && await focus(p) === 'newGame', 'Tastatur: Pfeil setzt den Fokus');
    await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowLeft');
    ok(await p.evaluate(() => document.getElementById('mode').value) === 'campaign', 'Tastatur: ←/→ ändern Werte');
    await p.keyboard.press('ArrowUp'); await p.keyboard.press('Enter');
    await p.waitForFunction(() => document.getElementById('game').classList.contains('active'));
    await myTurn(p);
    await p.keyboard.down('w'); await wait(500); await p.keyboard.up('w');
    await p.keyboard.press('Tab');
    ok(await p.evaluate(() => !document.getElementById('weaponPanel').hidden), 'Tab öffnet die Waffenliste');
    await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter');
    ok(await p.evaluate(() => document.getElementById('weaponPanel').hidden && KK.S.weapon !== 'rocket'), 'Pfeile + Enter wählen eine Waffe (' + await p.evaluate(() => KK.S.weapon) + ')');
    await p.evaluate(() => KK.selectWeapon('rocket'));
    await p.keyboard.down(' '); await wait(400); await p.keyboard.up(' '); await wait(100);
    ok(await p.evaluate(() => KK.S.phase) !== 'aim', 'Leertaste feuert');
    await p.keyboard.press('Escape');
    ok(await p.evaluate(() => !document.getElementById('pause').hidden), 'Esc pausiert');
    await p.keyboard.press('Escape');
    ok(await p.evaluate(() => document.getElementById('pause').hidden), 'Esc setzt fort (Zurück-Taste)');
    await p.keyboard.press('Escape'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown');
    ok(await focus(p) === 'restartBtn', 'Pause-Menü per Pfeil');
    await p.keyboard.press('Enter');
    ok(await p.evaluate(() => !document.getElementById('confirm').hidden) && await focus(p) === 'confirmNo', 'Eigene Bestätigung statt Browser-Dialog, Fokus auf Abbrechen');
    await p.keyboard.press('Escape');
    ok(await p.evaluate(() => document.getElementById('confirm').hidden && !document.getElementById('pause').hidden), 'Esc bricht ab');
    await shot(p, 'kbd-pause');
    ok(!errors.length, 'Tastatur: keine Skriptfehler ' + errors.slice(0, 3).join(' | '));
    await ctx.close();
  }

  // ---------- 3) Touch (Handy hoch) ----------
  {
    const { p, ctx, errors } = await open({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
    await shot(p, 'touch-menu');
    ok(await p.evaluate(() => { const r = document.getElementById('newGame').getBoundingClientRect(); return r.bottom <= innerHeight && r.width > 300; }), 'Handy: Startknopf sichtbar');
    await p.tap('#newGame');
    await p.waitForFunction(() => document.getElementById('game').classList.contains('active'));
    await myTurn(p);
    ok(await p.evaluate(() => KK.input) === 'touch' && await p.evaluate(() => getComputedStyle(document.querySelector('.game-dock')).display !== 'none'), 'Touch-Leiste sichtbar');
    ok(await p.evaluate(() => getComputedStyle(document.getElementById('padHud')).display === 'none'), 'Controller-HUD versteckt');
    const before = await p.evaluate(() => { const u = KK.S.units[KK.S.current]; return [u.x, u.z]; });
    const st = await p.evaluate(() => { const r = document.getElementById('stick').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    const cdp = await ctx.newCDPSession(p);
    const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
    await touch('touchStart', st[0], st[1]); await touch('touchMove', st[0], st[1] - 40);
    for (let i = 0; i < 8; i++) { await wait(80); await touch('touchMove', st[0], st[1] - 41 - (i & 1)); }
    await touch('touchEnd');
    const after = await p.evaluate(() => { const u = KK.S.units[KK.S.current]; return [u.x, u.z]; });
    ok(Math.hypot(after[0] - before[0], after[1] - before[1]) > .2, 'Touch-Stick: Wurm läuft');
    await p.tap('#weaponBtn');
    ok(await p.evaluate(() => !document.getElementById('weaponPanel').hidden), 'Waffenliste per Antippen');
    await p.tap('[data-weapon="grenade"]');
    ok(await p.evaluate(() => KK.S.weapon) === 'grenade', 'Granate gewählt');
    const fb = await p.evaluate(() => { const r = document.getElementById('fireBtn').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    await touch('touchStart', fb[0], fb[1]); await wait(400); await touch('touchEnd');
    await wait(150);
    ok(await p.evaluate(() => KK.S.phase) !== 'aim', 'Feuerknopf halten + loslassen wirft');
    await shot(p, 'touch-game');
    ok(!errors.length, 'Touch: keine Skriptfehler ' + errors.slice(0, 3).join(' | '));
    await ctx.close();
  }

  // ---------- 4) Ganzes Gefecht (Computer gegen Computer), Ressourcen ----------
  {
    const { p, ctx, errors } = await open({ viewport: { width: 800, height: 600 } });
    await p.evaluate(() => { KK.autoplay = true; KK.startGame(false, 1); });
    const res = await p.evaluate(() => { let ph; for (let i = 0; i < 60 && (ph = KK.tick(600)) !== 'over'; i++); return { ph, stats: KK.stats() }; });
    ok(res.ph === 'over', 'Ganzes Gefecht endet (' + res.ph + ')');
    ok(res.stats.particles <= 161 && res.stats.projectiles === 0, 'Keine liegengebliebenen Objekte ' + JSON.stringify(res.stats));
    const scene0 = res.stats.scene;
    await p.evaluate(() => { KK.startGame(false, 1); });
    const s1 = await p.evaluate(() => KK.stats().scene);
    ok(s1 <= scene0 + 30, 'Neustart räumt die Szene auf (' + scene0 + ' → ' + s1 + ')');
    ok(!errors.length, 'Gefecht: keine Skriptfehler ' + errors.slice(0, 3).join(' | '));
    await ctx.close();
  }
  await browser.close(); server.close();
  console.log(fails ? fails + ' Fehler' : 'Alles in Ordnung');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
