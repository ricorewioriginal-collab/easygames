#!/usr/bin/env node
// Browser-Test der Erfolge-Seite (erfolge.html), der stillen Spielspuren und der Einbettung (EasyGames.open('erfolge')). Aufruf: node tools/test-erfolge.cjs
'use strict';
const http = require('node:http'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const mime = { html: 'text/html', js: 'text/javascript', json: 'application/json', css: 'text/css', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = path.join(root, u === '/' ? 'index.html' : u);
  if (u !== '/' && u.endsWith('/')) f = path.join(f, 'index.html');   // Spielordner wie ricoville/ liefern ihre index.html
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': mime[f.split('.').pop()] || 'application/octet-stream' }); res.end(fs.readFileSync(f));
});
(async () => {
  await new Promise(r => server.listen(0, r));
  const base = 'http://127.0.0.1:' + server.address().port + '/';
  const cat = JSON.parse(fs.readFileSync(path.join(root, 'sync/catalog.json'), 'utf8')).games.filter(g => g.cloud && g.cloud.prefix);
  assert(cat.length > 30, 'Katalog mit cloud-Feld');
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } });
    await ctx.route(/firestore\.googleapis\.com|gstatic\.com/, r => r.abort());
    // Feste Uhrzeit (Mittwoch, 12 Uhr): sonst schalten Nachteule/Frühaufsteher/Wochenende je nach Testzeit schon beim leeren Start frei
    await ctx.clock.setFixedTime(new Date(2026, 9, 14, 12, 0, 0));
    const page = await ctx.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));

    // 1) leer: Neuling, nichts freigeschaltet, Karten sichtbar
    await page.goto(base + 'erfolge.html');
    await page.waitForSelector('.ach');
    assert.match(await page.$eval('#rkName', e => e.textContent), /Neuling · 0 Punkte/);
    assert(await page.$eval('.ach', e => e.classList.contains('lock')), 'ohne Spiele sind Erfolge gesperrt');
    assert(await page.$('#bIn'), 'Anmelde-Knopf');
    console.log('PASS Seite leer: Neuling, gesperrte Erfolge, Anmelde-Hinweis');

    // 2) mit Spielständen dreier Spiele und Spielspuren: Erfolge werden freigeschaltet und gemerkt
    const autoIds = await page.evaluate(ids => ids.filter(id => AnMaChaBoard.isAuto(id)), cat.map(g => g.cloud.game));
    const picks = cat.filter(g => autoIds.includes(g.cloud.game)).slice(0, 3);
    assert.equal(picks.length, 3, 'drei Spiele mit automatischer Erkennung');
    await page.evaluate(([picks]) => {
      picks.forEach((g, i) => localStorage.setItem(g.cloud.prefix.split(',')[0] + '.test', JSON.stringify({ highScore: 100 + i, stars: 5, wins: 2 })));
      const d = new Date(), n = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
      localStorage.setItem('anmacha-seen', JSON.stringify({ g: {}, d: [n], f: { owl: Date.now() } }));
    }, [picks]);
    await page.reload(); await page.waitForSelector('.ach.done');
    const done = await page.$$eval('.ach.done h3', h => h.map(x => x.textContent));
    assert(done.includes('Erster Schritt') && done.includes('Erster Rekord') && done.includes('Nachteule') && done.includes('Erster Sieg'), 'freigeschaltet: ' + done.join(', '));
    assert(!/Neuling · 0 Punkte/.test(await page.$eval('#rkName', e => e.textContent)), 'Punkte > 0');
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('anmacha-ach')));
    assert(saved.u['explore:1'] && saved.u['records:1'] && saved.u['owl:1'], 'Freischaltungen lokal gemerkt');
    await page.click('[data-f=open]');
    assert((await page.$$eval('.ach.done', e => e.length)) >= 0);
    assert(await page.$$eval('.ach h3', h => h.length) > 0, 'Filter „Offen“ zeigt Erfolge');
    console.log('PASS Seite mit Spielständen: Erfolge freigeschaltet und lokal gemerkt, Filter');

    // 3) Spielspuren: ein Spiel mit dem stillen Skript schreibt anmacha-seen
    const g0 = cat[0];
    const play = await ctx.newPage();
    await play.goto(base + g0.path.replace(/^\.?\//, ''));
    await play.waitForFunction(() => { try { return Object.keys(JSON.parse(localStorage.getItem('anmacha-seen')).g).length > 0; } catch (e) { return false; } }, null, { timeout: 15000 });
    const seen = await play.evaluate(() => JSON.parse(localStorage.getItem('anmacha-seen')));
    assert(Object.keys(seen.g).length === 1 && seen.d.length === 1, 'Spiel und Tag gemerkt: ' + JSON.stringify(seen));
    console.log('PASS Spiel: schreibt Spielspur (Spiel, Tag) in anmacha-seen');

    // 4) embed=1 und Einbettung
    await page.goto(base + 'erfolge.html?embed=1');
    assert.equal(await page.$eval('#back', a => getComputedStyle(a).display), 'none');
    const host = await ctx.newPage();
    await host.route('**/host.html', r => r.fulfill({ contentType: 'text/html', body: '<!doctype html><body><button id="b" data-easygames="erfolge" data-mode="overlay">x</button><div id="in" data-easygames="erfolge"></div><script src="/easygames.js"></script>' }));
    await host.goto(base.replace(/\/$/, '') + '/host.html');
    await host.waitForSelector('#in iframe');
    assert.match(await host.$eval('#in iframe', f => f.src), /erfolge\.html\?embed=1$/);
    await host.click('#b'); await host.waitForSelector('[role=dialog] iframe');
    assert.match(await host.$eval('[role=dialog] iframe', f => f.src), /erfolge\.html\?embed=1$/);
    await host.evaluate(() => EasyGames.close());
    await host.evaluate(() => EasyGames.open('erfolge'));
    assert.match(await host.$eval('[role=dialog] iframe', f => f.src), /erfolge\.html\?embed=1$/);
    console.log('PASS Einbettung: data-easygames="erfolge" (inline und Overlay) und EasyGames.open(\'erfolge\')');

    // 5) Hub verlinkt die Erfolge
    await page.goto(base + 'index.html');
    assert.equal(await page.$eval('#lAch', a => a.getAttribute('href')), 'erfolge.html');
    console.log('PASS Hub: Link „🏅 Erfolge“ vorhanden');
    assert.deepEqual(errors, [], 'Seitenfehler: ' + errors.join('; '));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
