#!/usr/bin/env node
// Prüft die Spielanleitungen im Browser: anleitung.html (Teile, Spoiler-Schutz, Übersicht, Ordnername statt ID), die Reiter
// Handbuch/Ratgeber/Lösungsbuch auf der Startseite, EasyGames.book/guideUrl und den Knopf „📖 Anleitung“ in easygames.js und im Hub.
// Aufruf: node tools/test-guides.cjs [spiel-id]
'use strict';
const http = require('node:http'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const mime = { html: 'text/html', js: 'text/javascript', json: 'application/json', css: 'text/css', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = path.join(root, u === '/' ? 'index.html' : u);
  if (f.endsWith(path.sep) || (fs.existsSync(f) && fs.statSync(f).isDirectory())) f = path.join(f, 'index.html');
  if (!f.startsWith(root) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': mime[f.split('.').pop()] || 'application/octet-stream' }); res.end(fs.readFileSync(f));
});
(async () => {
  await new Promise(r => server.listen(0, r));
  const base = 'http://127.0.0.1:' + server.address().port + '/', id = process.argv[2] || 'anmacha-snake';
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 400, height: 860 }, isMobile: true, hasTouch: true });
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(base + 'anleitung.html?game=' + id); await p.waitForSelector('#loesung', { timeout: 10000 });
    const parts = await p.$$eval('nav.parts a', a => a.map(x => x.getAttribute('href')));
    for (const h of ['#ueberblick', '#handbuch', '#ratgeber', '#loesung']) assert.ok(parts.includes(h), 'Teil ' + h); console.log('PASS anleitung.html: Teile ' + parts.join(' '));
    assert.equal(await p.$eval('#loesung .sol', e => e.hidden), true, 'Lösungen erst verdeckt'); await p.click('#loesung .spoil button');
    assert.equal(await p.$eval('#loesung .sol', e => e.hidden), false); console.log('PASS Spoiler-Schutz im Lösungsbuch');
    assert.ok(await p.$$eval('.egb-sec', a => a.length) >= 10, 'Abschnitte'); assert.match(await p.title(), /Lösungsbuch/);
    await p.goto(base + 'anleitung.html?game=' + id + '#loesung'); await p.waitForSelector('#loesung .sol'); assert.equal(await p.$eval('#loesung .sol', e => e.hidden), false, '#loesung öffnet direkt'); console.log('PASS Direktlink #loesung');
    await p.goto(base + 'anleitung.html'); await p.waitForSelector('.list a'); assert.ok(await p.$$eval('.list a', a => a.length) > 50); await p.fill('.list input', 'snake'); assert.ok(await p.$$eval('.list a', a => a.filter(x => x.offsetParent).length) < 5, 'Suche filtert'); console.log('PASS Übersicht aller Anleitungen mit Suche');
    // Startseite: Reiter Ratgeber und Lösungsbuch laden das Buch nach
    await p.goto(base + 'index.html'); await p.waitForFunction(() => typeof openDetail === 'function' && typeof GAMES !== 'undefined' && GAMES.length);
    const i = await p.evaluate(id => GAMES.findIndex(g => g.id === id), id);
    for (const t of ['manual', 'ratgeber', 'loesung']) { await p.evaluate(([i, t]) => openDetail(i, t), [i, t]); await p.waitForSelector('#dBody .egb-sec'); }
    assert.ok(await p.$('#dBody a.gbook[href*="anleitung.html"]'), 'Link zur Anleitungsseite'); console.log('PASS Startseite: Handbuch, Ratgeber, Lösungsbuch');
    assert.deepEqual(errs, [], 'keine Skriptfehler auf Anleitungsseite und Startseite');
    // easygames.js: book(), guideUrl(), Knopf im Overlay; Hub: Knopf im Spielfenster
    await p.route('**/host.html', r => r.fulfill({ contentType: 'text/html', body: '<!doctype html><body><button id="b" data-easygames="' + id + '" data-mode="overlay" data-fullscreen="false">Spiel</button><script src="/easygames.js"></script>' }));
    await p.goto(base + 'host.html');
    assert.match(await p.evaluate(id => EasyGames.guideUrl(id), id), new RegExp('anleitung\\.html\\?game=' + id + '$'));
    const bk = await p.evaluate(id => new Promise(r => EasyGames.book(id, r)), id); assert.ok(bk && bk.loesung && bk.loesung.length, 'EasyGames.book'); console.log('PASS EasyGames.book / guideUrl');
    await p.click('#b'); await p.waitForSelector('[role=dialog] iframe'); assert.ok(await p.$('[role=dialog] button[title^="Spielanleitung"]'), 'Knopf „📖 Anleitung“ im Overlay'); console.log('PASS Knopf „📖 Anleitung“ im Overlay');
    assert.ok(/data-gd[^>]*>📖 Anleitung/.test(fs.readFileSync(path.join(root, 'hub/anmacha-hub.js'), 'utf8')), 'Hub-Knopf'); console.log('PASS Knopf im Hub');
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error('FEHLER', e.message); process.exit(1); });
