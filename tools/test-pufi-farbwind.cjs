#!/usr/bin/env node
// Prüft „Pufi & der Farbwind“: Leveldaten (Node) und Spielablauf im echten Browser (Playwright/Chromium).
//   node tools/test-pufi-farbwind.cjs            (Playwright muss per NODE_PATH oder lokal auffindbar sein)
//   PUFI_SHOTS=/pfad node tools/test-pufi-farbwind.cjs   speichert zusätzlich Bildschirmfotos
'use strict';
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const LV = require(path.join(root, 'pufi-farbwind/levels.js'));

// ---------- 1. Leveldaten ----------
assert.equal(LV.COUNT, 24);
for (let n = 0; n < LV.COUNT; n++) {
  const L = LV.build(n), v = LV.validate(L);
  assert(v.ok, 'Level ' + (n + 1) + ': ' + v.reason);
  assert.equal(L.grid.length, LV.ROWS);
  assert(L.grid.every(r => r.length === L.cols), 'Level ' + (n + 1) + ' hat ungleich lange Reihen');
  assert.equal(L.totals.flowers, 5, 'Level ' + (n + 1) + ' braucht fünf Farbblüten');
  assert(L.totals.red >= 8, 'Level ' + (n + 1) + ' hat zu wenige rote Münzen');
  assert.equal(L.spawns.filter(s => s.ch === 'P').length, 1);
  assert.equal(L.spawns.filter(s => s.ch === 'M').length, 1, 'Level ' + (n + 1) + ' braucht genau einen Farbring');
  assert.equal(L.spawns.filter(s => s.ch === 'G').length, 1);
  assert.equal(L.boss, n % 4 === 3);
  if (L.boss) assert(L.arenaX > 0 && L.spawns.some(s => s.ch === 'B'));
  assert.deepEqual(LV.build(n).grid, L.grid, 'Level ' + (n + 1) + ' muss reproduzierbar sein');
}
console.log('OK  24 Level: erreichbar, je 5 Blüten, Farbring, Ziel, Bosse in x-4');

// ---------- 2. Browser ----------
let playwright;
try { playwright = require('playwright'); } catch (_) {
  try { playwright = require('/opt/node22/lib/node_modules/playwright'); } catch (_) {
    console.log('HINWEIS: Playwright nicht gefunden – Browserteil übersprungen.'); process.exit(0);
  }
}
const types = { '.html': 'text/html', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };
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
  const browser = await playwright.chromium.launch(process.env.PUFI_CHROME ? { executablePath: process.env.PUFI_CHROME } : {});
  const errors = [];
  const watch = page => { page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); }); };
  try {
    // ---- Tastatur, Mechanik ----
    const page = await browser.newPage({ viewport: { width: 960, height: 540 } }); watch(page);
    await page.goto(url);
    assert.equal(await page.evaluate(() => PufiTest.state().mode), 'title');
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => PufiTest.state().mode), 'play');
    await page.keyboard.down('ArrowRight'); await page.waitForTimeout(500); await page.keyboard.up('ArrowRight');
    assert(await page.evaluate(() => PufiTest.state().P.x > 60), 'Pufi läuft mit der Pfeiltaste');
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => PufiTest.state().mode), 'pause');
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => PufiTest.state().mode), 'play');

    const mech = await page.evaluate(() => {
      const A = PufiTest, S = A.state, step = n => { for (let i = 0; i < n; i++) A.tick(1 / 60); }, r = {};
      const flat = () => { A.startLevel(0); const s = S(); s.L.enemies = []; step(40); return s; };
      // Sprunghöhe und Weite
      let s = flat(), P = s.P, y0 = P.y, minY = y0;
      A.action('jump', true, 't'); for (let i = 0; i < 40; i++) { A.tick(1 / 60); minY = Math.min(minY, S().P.y); } A.action('jump', false, 't');
      r.fullJump = y0 - minY;
      s = flat(); P = s.P; y0 = P.y; minY = y0;
      A.action('jump', true, 't'); A.tick(1 / 60); A.action('jump', false, 't'); for (let i = 0; i < 40; i++) { A.tick(1 / 60); minY = Math.min(minY, S().P.y); }
      r.tapJump = y0 - minY;
      // Flattern verlängert die Flugzeit
      const air = flutter => { const s = flat(); let f = 0; A.action('jump', true, 't'); A.tick(1 / 60); if (!flutter) A.action('jump', false, 't');
        while (f < 300) { A.tick(1 / 60); f++; if (!flutter && f === 5) A.action('jump', true, 't2'); if (!flutter && f === 6) A.action('jump', false, 't2'); if (S().P.ground) break; }
        A.action('jump', false, 't'); return f; };
      r.airNormal = air(false); r.airFlutter = air(true);
      // Zunge fängt Wuschel → Mund voll → Ei legen
      s = flat(); P = s.P;
      s.L.enemies.push(Object.assign({ x: P.x + 40, y: P.y + 6, w: 14, h: 14, vx: 0, vy: 0, alive: true, face: -1, t: 0, kind: 'walker', edible: true, stomp: true, ch: 'g' }));
      P.face = 1; A.press('tongue'); step(30);
      r.mouth = S().P.mouth; A.press('down'); r.eggs = S().P.eggs;
      // Werfen: zielen, werfen, Gegner treffen
      const target = { x: P.x + 90, y: P.y + 6, w: 14, h: 14, vx: 0, vy: 0, alive: true, face: -1, t: 0, kind: 'plant', edible: false, stomp: false, ch: 'p', open: 0 };
      s.L.enemies.push(target); P.eggs = 3; P.face = 1;
      A.press('throw'); r.aiming = !!S().P.aim; S().P.aim.t = 0.1; // Zielpfeil waagerecht
      A.press('throw'); r.eggsAfterThrow = S().P.eggs; r.flying = S().L.eggsFly.length;
      step(30); r.targetHit = !target.alive;
      // Eierblock von unten anstoßen
      A.startLevel(0); s = S(); s.L.enemies = [];
      let qc = -1, qr = -1; s.L.grid.forEach((row, rr) => row.forEach((ch, cc) => { if (ch === 'Q' && qc < 0) { qc = cc; qr = rr; } }));
      s.P.x = qc * 16 + 1; s.P.y = (qr + 1) * 16 + 4; s.P.vy = -200; s.P.eggs = 0; step(2); r.blockEggs = S().P.eggs;
      // Treffer: Tamo in der Blase, Countdown, Rettung
      s = flat(); s.L.stars = 10; s.P.inv = 0; A.hurt(); r.babyOff = !s.L.baby.on; step(60 * 2); r.starsAfter2s = s.L.stars;
      const B = s.L.baby; s.P.x = B.x + 4; s.P.y = B.y; s.P.vy = 0; step(2); r.rescued = S().L.baby.on;
      step(60 * 4); r.regen = S().L.stars;
      // Countdown abgelaufen → Leben verloren, Neustart am Farbring
      s = flat(); const ring = s.L.rings[0]; s.P.x = ring.x - 4; s.P.y = ring.y - 10; step(3); r.ringPassed = ring.passed; r.ringStars = s.L.stars;
      const lives = s.session.lives; s.P.inv = 0; A.hurt(); s.L.stars = 1; step(60 * 6);
      const s2 = S(); r.livesLost = lives - s2.session.lives; r.respawnAtRing = Math.abs(s2.P.x - (ring.x - 8)) < 40 && s2.L.baby.on; r.modeAfter = s2.mode;
      // Ziel → Abrechnung → nächstes Level frei
      s = flat(); s.P.x = s.L.goal.x + 2; step(130); r.clear = S().mode; r.unlocked = S().save.unlocked; r.best = S().save.best[0];
      // Boss: nur Eier verletzen ihn
      A.startLevel(3); s = S(); s.L.enemies = []; s.P.x = s.L.arenaX + 64; s.P.eggs = 6; step(30);
      r.locked = s.L.locked; r.bossHp = s.L.boss && s.L.boss.hp;
      let guard = 0; while (s.L.boss.hp > 0 && guard++ < 20) { s.L.boss.inv = 0; const b = s.L.boss; s.L.eggsFly.push({ x: b.x + 10, y: b.y + 10, w: 10, h: 12, vx: 1, vy: 0, bounces: 2, life: 1, spin: 0 }); s.P.inv = 9; step(2); }
      r.bossDone = s.L.bossDone; step(10); r.unlockedArena = !s.L.locked;
      return r;
    });
    assert(mech.fullJump > 72 && mech.fullJump < 100, 'volle Sprunghöhe ' + mech.fullJump);
    assert(mech.tapJump < mech.fullJump - 15, 'kurzer Sprung niedriger als langer');
    assert(mech.airFlutter > mech.airNormal + 20, 'Flattern verlängert die Flugzeit');
    assert.equal(mech.mouth, 'g'); assert.equal(mech.eggs, 1);
    assert(mech.aiming); assert.equal(mech.eggsAfterThrow, 2); assert.equal(mech.flying, 1); assert(mech.targetHit, 'Ei trifft Gegner');
    assert.equal(mech.blockEggs, 1, 'Eierblock gibt ein Ei');
    assert(mech.babyOff); assert(mech.starsAfter2s <= 8, 'Countdown läuft'); assert(mech.rescued, 'Tamo wird gerettet'); assert.equal(mech.regen, 10, 'Sterne laden bis 10 nach');
    assert(mech.ringPassed); assert(mech.ringStars >= 20, 'Farbring gibt +10 Sterne');
    assert.equal(mech.livesLost, 1); assert(mech.respawnAtRing, 'Neustart am Farbring'); assert.equal(mech.modeAfter, 'play');
    assert.equal(mech.clear, 'clear'); assert(mech.unlocked >= 2); assert(mech.best > 0);
    assert(mech.locked && mech.bossHp >= 3); assert(mech.bossDone && mech.unlockedArena);
    console.log('OK  Mechanik:', JSON.stringify(mech));

    // ---- Alle Level mit einem einfachen Spielroboter durchlaufen (nur Geometrie, Gegner ignoriert) ----
    const bot = await page.evaluate(() => {
      const A = PufiTest, T = 16, out = [];
      for (let n = 0; n < 24; n++) {
        A.startLevel(n); let st = A.state(); st.session.lives = 99; const lives = 99; let held = false;
        for (let i = 0; i < 60 * 150; i++) {
          st = A.state(); if (st.mode !== 'play') break; const { L, P } = st;
          if (L.clearT >= 0 || P.dead) { A.tick(1 / 60); continue; }
          P.inv = 5; if (!L.baby.on) L.baby = { on: true, x: P.x, y: P.y };
          if (L.boss && L.boss.hp > 0) { L.boss.inv = 0; A.hitBoss(); }
          const c = Math.floor((P.x + P.w / 2) / T), fr = Math.floor((P.y + P.h + 1) / T);
          const tile = (c, r) => (c < 0 || c >= L.cols) ? '#' : (r < 0 || r >= L.rows) ? ' ' : L.grid[r][c];
          const plats = A.activePlatforms();
          const floor = (cc, r) => '#Q='.includes(tile(cc, r)) || plats.some(q => q.x < (cc + 1) * T && q.x + q.w > cc * T && Math.abs(q.y - r * T) < 10);
          let want = false;
          for (let d = 1; d <= 2; d++) { if (!floor(c + d, fr)) want = true; if ('#Q'.includes(tile(c + d, fr - 1)) || '#Q'.includes(tile(c + d, fr - 2)) || tile(c + d, fr - 1) === '^') want = true; }
          A.action('right', true, 'bot');
          if (P.ground) { if (held) { A.action('jump', false, 'bot'); held = false; } else if (want) { A.action('jump', true, 'bot'); held = true; } }
          else if (held && P.vy > 0) { let land = false; for (let r = fr; r < fr + 8 && !land; r++) if (floor(c, r) && floor(c + 1, r) && !'~^'.includes(tile(c + 1, r - 1))) land = true; if (land || (P.flutterT <= 0 && P.flutterN > 0)) { A.action('jump', false, 'bot'); held = false; } }
          else if (!held && P.vy > 0) { let land = false; for (let r = fr; r < fr + 8 && !land; r++) if (floor(c, r) || floor(c + 1, r)) land = true; if (!land) { A.action('jump', true, 'bot'); held = true; } }
          A.tick(1 / 60);
        }
        A.action('right', false, 'bot'); A.action('jump', false, 'bot');
        st = A.state(); out.push({ n, mode: st.mode, lost: lives - st.session.lives });
      }
      return out;
    });
    for (const b of bot) assert(b.mode === 'clear' && b.lost <= 0, 'Roboter schafft Level ' + (b.n + 1) + ' nicht: ' + JSON.stringify(b));
    console.log('OK  Spielroboter schafft alle 24 Level ohne Absturz');

    // ---- Alle Level zeichnen und Bildrate grob prüfen ----
    const perf = await page.evaluate(() => {
      const A = PufiTest, times = [];
      for (let n = 0; n < 24; n++) { A.startLevel(n); const s = A.state(); for (let k = 0; k < 6; k++) { s.P.x = (k + 1) * s.L.cols * 16 / 7; s.P.y = 80; A.tick(1 / 60); const t0 = performance.now(); A.draw(); times.push(performance.now() - t0); } }
      times.sort((a, b) => a - b); return { median: times[times.length >> 1], p90: times[Math.floor(times.length * 0.9)] };
    });
    assert(perf.p90 < 12, 'Zeichnen dauert zu lange: ' + JSON.stringify(perf));
    console.log('OK  alle Level zeichnen, Median ' + perf.median.toFixed(1) + ' ms, 90 % unter ' + perf.p90.toFixed(1) + ' ms');
    if (shots) await page.screenshot({ path: path.join(shots, 'pufi-desktop.png') });

    // ---- Optionen bleiben gespeichert, Karte zeigt Bestwerte ----
    await page.evaluate(() => PufiTest.openOptions());
    await page.getByRole('button', { name: /MUSIK/ }).click();
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('easygames.pufi-farbwind.v2')).music), false);
    await page.evaluate(() => PufiTest.openMap());
    assert(await page.locator('.lvl:not([disabled])').count() >= 2, 'freigeschaltete Level auf der Karte');
    await page.close();

    // ---- Gamepad (Standard-Belegung) ----
    const gp = await browser.newPage({ viewport: { width: 1280, height: 720 } }); watch(gp);
    await gp.addInitScript(() => {
      const pad = { id: 'Testpad (STANDARD GAMEPAD)', index: 0, connected: true, mapping: 'standard', axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
      window.__pad = pad; navigator.getGamepads = () => [pad, null, null, null];
      window.__press = (i, on) => { pad.buttons[i] = { pressed: on, value: on ? 1 : 0 }; };
    });
    await gp.goto(url);
    await gp.evaluate(() => { const e = new Event('gamepadconnected'); e.gamepad = window.__pad; window.dispatchEvent(e); });
    await gp.evaluate(() => window.__press(0, true)); await gp.waitForTimeout(120); await gp.evaluate(() => window.__press(0, false)); await gp.waitForTimeout(120);
    assert.equal(await gp.evaluate(() => PufiTest.state().mode), 'play', 'A startet aus dem Menü');
    await gp.waitForTimeout(300);
    await gp.evaluate(() => { window.__pad.axes[0] = 1; }); await gp.waitForTimeout(600); await gp.evaluate(() => { window.__pad.axes[0] = 0; });
    assert(await gp.evaluate(() => PufiTest.state().P.x > 70), 'Stick bewegt Pufi');
    const y0 = await gp.evaluate(() => PufiTest.state().P.y);
    await gp.evaluate(() => window.__press(0, true)); await gp.waitForTimeout(200);
    assert(await gp.evaluate(y0 => PufiTest.state().P.y < y0 - 20, y0), 'A springt');
    await gp.evaluate(() => window.__press(0, false)); await gp.waitForTimeout(600);
    await gp.evaluate(() => { PufiTest.state().P.eggs = 2; window.__press(1, true); }); await gp.waitForTimeout(80);
    assert(await gp.evaluate(() => !!PufiTest.state().P.aim), 'B zielt');
    await gp.evaluate(() => { window.__pad.axes[2] = 0.7; window.__pad.axes[3] = -0.7; }); await gp.waitForTimeout(400);
    await gp.evaluate(() => window.__press(1, false)); await gp.waitForTimeout(80);
    assert.equal(await gp.evaluate(() => PufiTest.state().P.eggs), 1, 'Loslassen nach Halten wirft');
    await gp.evaluate(() => window.__press(9, true)); await gp.waitForTimeout(80); await gp.evaluate(() => window.__press(9, false));
    assert.equal(await gp.evaluate(() => PufiTest.state().mode), 'pause', 'Start pausiert');
    await gp.close();

    // ---- Touch (Handy quer, mehrere Finger) ----
    const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 });
    const tp = await ctx.newPage(); watch(tp);
    await tp.goto(url);
    await tp.evaluate(() => PufiTest.start(0));
    await tp.dispatchEvent('#stage', 'pointerdown', { pointerType: 'touch', pointerId: 1, clientX: 10, clientY: 10 });
    assert(await tp.locator('#touch').isVisible(), 'Touch-Tasten sichtbar');
    const zone = await tp.locator('#stickZone').boundingBox();
    const sx = zone.x + 90, sy = zone.y + zone.height * 0.6;
    await tp.dispatchEvent('#stickZone', 'pointerdown', { pointerType: 'touch', pointerId: 5, clientX: sx, clientY: sy, isPrimary: true });
    await tp.dispatchEvent('#stickZone', 'pointermove', { pointerType: 'touch', pointerId: 5, clientX: sx + 40, clientY: sy });
    await tp.waitForTimeout(500);
    const xMid = await tp.evaluate(() => PufiTest.state().P.x);
    assert(xMid > 50, 'Stick bewegt Pufi');
    await tp.dispatchEvent('#face .a', 'pointerdown', { pointerType: 'touch', pointerId: 6, clientX: 1, clientY: 1 });
    await tp.waitForTimeout(150);
    assert(await tp.evaluate(() => PufiTest.state().P.vy < 0 || !PufiTest.state().P.ground), 'A springt per Touch');
    await tp.dispatchEvent('#face .a', 'pointerup', { pointerType: 'touch', pointerId: 6 });
    await tp.dispatchEvent('#stickZone', 'pointerup', { pointerType: 'touch', pointerId: 5, clientX: sx + 40, clientY: sy });
    await tp.waitForTimeout(400);
    const xEnd = await tp.evaluate(() => PufiTest.state().P.x); await tp.waitForTimeout(300);
    assert(Math.abs(await tp.evaluate(() => PufiTest.state().P.x) - xEnd) < 6, 'Loslassen stoppt die Bewegung');
    const size = await tp.evaluate(() => { const c = document.getElementById('stage'), r = c.getBoundingClientRect(); return { w: r.width, h: r.height, vw: PufiTest.state().VW, px: c.width }; });
    assert(Math.abs(size.w - 844) < 2 && size.h <= 391, 'Spielfeld füllt den Bildschirm quer: ' + JSON.stringify(size));
    assert(size.px <= 640 * 3, 'Pixelmenge begrenzt');
    if (shots) await tp.screenshot({ path: path.join(shots, 'pufi-phone-landscape.png') });
    await tp.setViewportSize({ width: 390, height: 844 }); await tp.waitForTimeout(200);
    const portrait = await tp.evaluate(() => { const r = document.getElementById('stage').getBoundingClientRect(); return { w: r.width, h: r.height }; });
    assert(portrait.w <= 391 && portrait.h > 150, 'Hochformat bleibt nutzbar');
    if (shots) await tp.screenshot({ path: path.join(shots, 'pufi-phone-portrait.png') });
    await ctx.close();

    assert.deepEqual(errors, [], 'Keine Fehler in der Konsole');
    console.log('OK  Tastatur, Gamepad, Touch, Vollbild-Layout, keine Konsolenfehler');
    console.log('PASS: Pufi & der Farbwind');
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exit(1); });
