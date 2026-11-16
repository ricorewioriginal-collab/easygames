#!/usr/bin/env node
// Prüft das Pufi-Minispiel „Lumo – Wolkenpfad“ (pufi-farbwind/wolkenpfad/) im echten Browser:
// Titel, Start, alle 24 Stufen ladbar und mit der Fahne zu beenden, Spielstand-Übernahme, Rückweg zu Pufi, Einstieg aus Pufi.
//   node tools/test-pufi-wolkenpfad.cjs           PUFI_SHOTS=/pfad speichert Bildschirmfotos
'use strict';
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
let playwright;
try { playwright = require('playwright'); } catch (_) {
  try { playwright = require('/opt/node22/lib/node_modules/playwright'); } catch (_) { console.log('HINWEIS: Playwright nicht gefunden – Test übersprungen.'); process.exit(0); }
}
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]); let f = path.join(root, u);
  if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (u.endsWith('/')) f = path.join(f, 'index.html');
  fs.readFile(f, (err, data) => { if (err) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); res.end(data); });
});
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port + '/pufi-farbwind/';
  const shots = process.env.PUFI_SHOTS;
  const browser = await playwright.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const errors = [];
  const watch = p => { p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|favicon|firebase|gstatic|googleapis/i.test(m.text())) errors.push(m.text()); }); };
  const ev = (p, s) => p.evaluate(s);
  const shot = async (p, n) => { if (shots) await p.screenshot({ path: path.join(shots, n) }); };
  try {
    // ---- Breitbild: Titel, Start, Spiel ----
    const page = await browser.newPage({ viewport: { width: 960, height: 540 } }); watch(page);
    await page.goto(base + 'wolkenpfad/');
    await page.waitForTimeout(300);
    assert.equal(await ev(page, 'state'), 'title');
    assert.equal(await ev(page, 'W'), 427, 'Breitbild nutzt die volle Breite');
    assert(await ev(page, 'canvas.width>=W*SCALE-1&&SCALE>=1'), 'Zeichnen in Gerätepixeln');
    assert.deepEqual(await ev(page, 'menuItems()'), ['NEUES SPIEL', '← ZURÜCK ZU PUFI']);
    await shot(page, 'wolkenpfad-titel.png');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => state === 'intro', null, { timeout: 2000 });
    await page.waitForFunction(() => state === 'play', null, { timeout: 5000 });
    await page.keyboard.down('ArrowRight'); await page.waitForTimeout(900); await page.keyboard.press('Space'); await page.waitForTimeout(500); await page.keyboard.up('ArrowRight');
    assert(await ev(page, 'player.x>60'), 'Lumo läuft nach rechts');
    await shot(page, 'wolkenpfad-1-1.png');
    // ---- alle Stufen: laden, zeichnen, Fahne/Zeit beendet die Stufe ----
    const count = await ev(page, 'STAGES.length'); assert.equal(count, 24);
    for (let i = 0; i < count; i++) {
      await ev(page, `loadStage(${i});state='play';stateT=0;player.inv=9999;`);
      const bonus = await ev(page, 'stage.bonus');
      if (bonus) await ev(page, 'timeLeft=0.001'); else await ev(page, 'player.x=stage.flagX-player.w;player.y=findGround(Math.floor(player.x/TILE))-player.h-2');
      await page.waitForFunction(() => state === 'clear', null, { timeout: 3000 }).catch(async e => { throw new Error('Stufe ' + i + ': ' + await ev(page, 'state+" "+player.x+" "+player.y+" "+stage.flagX')); });
      if (i % 5 === 2) { await ev(page, `loadStage(${i});state='play';camX=600;player.x=camX+120;player.inv=0`); await page.waitForTimeout(250); await shot(page, `wolkenpfad-welt${Math.floor(i / 6) + 1}-${i}.png`); }
    }
    assert(await ev(page, 'saved.hiscore>0&&Object.keys(saved.bestTime).length>=20'), 'Bestwerte gespeichert');
    assert(await ev(page, "!!localStorage.getItem('easygames.pufi-farbwind.wolkenpfad.v1')"), 'Speicher unter dem Pufi-Präfix');
    // ---- Tod und Game Over ----
    await ev(page, "loadStage(0);state='play';lives=1;player.y=400");
    await page.waitForFunction(() => state === 'gameover', null, { timeout: 5000 });
    // ---- Pause ----
    await ev(page, "loadStage(0);state='play'"); await page.keyboard.press('KeyP'); await page.waitForFunction(() => state === 'paused', null, { timeout: 2000 });
    await page.keyboard.press('Enter'); await page.waitForFunction(() => state === 'play', null, { timeout: 2000 });
    await page.close();

    // ---- Alter Spielstand des Einzelspiels wird übernommen, Rückweg zu Pufi ----
    const ctx = await browser.newContext({ viewport: { width: 960, height: 540 } });
    const p2 = await ctx.newPage(); watch(p2);
    await p2.goto(base + 'wolkenpfad/');
    await ev(p2, "localStorage.removeItem('easygames.pufi-farbwind.wolkenpfad.v1');localStorage.setItem('easygames.lumo.v1',JSON.stringify({v:2,hiscore:4321,reached:7,bestTime:{}}))");
    await p2.reload(); await p2.waitForTimeout(200);
    assert.equal(await ev(p2, 'saved.hiscore'), 4321); assert.equal(await ev(p2, 'menuItems()[1]'), 'WEITER (2-2)');
    await p2.keyboard.press('ArrowDown'); await p2.waitForTimeout(60); await p2.keyboard.press('ArrowDown'); await p2.waitForFunction(() => menuSel === 2, null, { timeout: 2000 });
    await p2.keyboard.press('ArrowUp'); await p2.waitForFunction(() => menuSel === 1, null, { timeout: 2000 });
    await Promise.all([p2.waitForURL(u => /\/pufi-farbwind\/$/.test(String(u))), p2.keyboard.press('Escape')]);
    // ---- Einstieg aus Pufi: Hauptmenü und Inselkarte ----
    await p2.waitForSelector('#boot.ready', { timeout: 8000 });
    await p2.keyboard.press('Enter');
    await p2.waitForSelector('#screen [data-a="lumo"]');
    await shot(p2, 'wolkenpfad-pufi-menu.png');
    await p2.click('#screen [data-a="map"]');
    await p2.waitForSelector('#screen.map .mini[data-a="lumo"]');
    await Promise.all([p2.waitForURL(u => /wolkenpfad\/$/.test(String(u))), p2.click('#screen.map [data-a="lumo"]')]);
    await p2.waitForTimeout(200); assert.equal(await ev(p2, 'state'), 'title');
    await ctx.close();

    // ---- Handy hochkant: Touch-Knöpfe ----
    const ph = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); watch(ph);
    await ph.goto(base + 'wolkenpfad/'); await ph.waitForTimeout(200);
    assert.equal(await ev(ph, 'W'), 256);
    await ph.tap('canvas', { position: { x: 195, y: 60 } });
    await ph.waitForFunction(() => state === 'intro' || state === 'play', null, { timeout: 3000 });
    assert(await ph.isVisible('.jump'), 'Sprungknopf sichtbar');
    await ph.waitForFunction(() => state === 'play', null, { timeout: 5000 });
    await shot(ph, 'wolkenpfad-handy.png');
    await ph.close();
    assert.deepEqual(errors, [], 'keine Fehler in der Konsole');
    console.log('OK  Lumo – Wolkenpfad: Titel, Start, 24 Stufen, Game Over, Pause, Spielstand-Übernahme, Wege von/zu Pufi, Handy');
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exit(1); });
