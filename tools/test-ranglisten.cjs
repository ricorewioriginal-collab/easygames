#!/usr/bin/env node
// Browser-Test der zentralen Ranglisten-Seite (ranglisten.html) und der Einbettung (EasyGames.open('ranglisten'), data-easygames="ranglisten").
// Firestore und Firebase-SDK sind nachgebildet. Aufruf: node tools/test-ranglisten.cjs
'use strict';
const http = require('node:http'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const mime = { html: 'text/html', js: 'text/javascript', json: 'application/json', css: 'text/css', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = path.join(root, u === '/' ? 'index.html' : u);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': mime[f.split('.').pop()] || 'application/octet-stream' }); res.end(fs.readFileSync(f));
});
const entry = (n, s) => ({ document: { name: 'x/documents/boards/b/e/' + n, fields: { n: { stringValue: n }, s: { doubleValue: s }, o: { stringValue: 'desc' }, t: { integerValue: '1' } } } });
(async () => {
  await new Promise(r => server.listen(0, r));
  const base = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await chromium.launch();
  const queried = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } });
    await ctx.route(/firestore\.googleapis\.com/, r => {
      const m = /boards\/([^:/]+):runQuery/.exec(r.request().url());
      if (m) queried.push(m[1]);
      const rows = m && /snake|memory__sum/.test(m[1]) ? [entry('Rico', 900), entry('Anna', 410)] : [{}];
      r.fulfill({ contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(rows) });
    });
    await ctx.route(/gstatic\.com/, r => r.abort());
    const page = await ctx.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));

    // 1) Seite: Spielliste aus dem Katalog, Liste, Anmelde-Hinweis, Vorwahl per ?game=
    await page.goto(base + 'ranglisten.html?game=anmacha-snake');
    await page.waitForSelector('#list li.me, #list .rk', { timeout: 15000 });
    const opts = await page.$$eval('#game option', o => o.map(x => x.value));
    assert(opts.length > 30, 'Spielliste aus sync/catalog.json (' + opts.length + ')');
    assert(!opts.includes('bunte-insel'), 'Opt-out-Spiele (Sandbox) stehen nicht in der Liste');
    assert.equal(await page.$eval('#game', s => s.value), 'anmacha-snake');
    const first = await page.$eval('#list li', l => l.innerText.replace(/\s+/g, ' '));
    assert(/1 Rico 900/.test(first), 'erste Zeile: ' + first);
    assert(await page.$('#bIn'), 'ohne Anmeldung: Google-Knopf');
    assert(!(await page.$('#nick')), 'ohne Anmeldung kein Spitzname-Feld');
    console.log('PASS Seite: Katalog-Spieleliste, Vorwahl per ?game=, Liste ohne Anmeldung, Anmelde-Hinweis');

    // 2) Wechsel auf ein automatisches Spiel: nur Ranglisten mit Einträgen
    await page.selectOption('#game', 'anmacha-memory');
    await page.waitForFunction(() => document.querySelectorAll('#list .nm').length > 0);
    const tabs = await page.$$eval('.tab', t => t.map(x => x.textContent));
    assert.deepEqual(tabs, [], 'nur eine Liste (Gesamtpunkte) -> keine Tabs');
    assert(queried.some(q => q === 'memory__sum'), 'Probe fragt die automatischen Ranglisten ab');
    console.log('PASS Seite: automatisches Spiel zeigt nur Ranglisten mit Einträgen');

    // 3) embed=1 blendet „← Spiele“ aus
    await page.goto(base + 'ranglisten.html?embed=1');
    assert.equal(await page.$eval('#back', a => getComputedStyle(a).display), 'none');
    console.log('PASS Seite: ?embed=1 blendet die Rücksprung-Schaltfläche aus');

    // 4) Einbettung: EasyGames.open('ranglisten', { game }) und data-easygames="ranglisten"
    const host = await ctx.newPage();
    await host.route('**/host.html', r => r.fulfill({ contentType: 'text/html', body: '<!doctype html><body><button id="b" data-easygames="ranglisten" data-mode="overlay" data-game="anmacha-snake">🏆</button><div id="in" data-easygames="ranglisten" data-game="anmacha-quiz"></div><script src="' + base + 'easygames.js"></script></body>' }));
    await host.goto(base.replace(/\/$/, '') + '/host.html');
    await host.waitForSelector('#in iframe');
    assert.match(await host.$eval('#in iframe', f => f.src), /ranglisten\.html\?embed=1&game=anmacha-quiz$/);
    await host.click('#b');
    await host.waitForSelector('[role=dialog] iframe');
    assert.match(await host.$eval('[role=dialog] iframe', f => f.src), /ranglisten\.html\?embed=1&game=anmacha-snake$/);
    await host.evaluate(() => EasyGames.close());
    assert.equal(await host.$$eval('[role=dialog]', d => d.length), 0);
    await host.evaluate(() => EasyGames.open('ranglisten'));
    assert.match(await host.$eval('[role=dialog] iframe', f => f.src), /ranglisten\.html\?embed=1$/);
    console.log('PASS Einbettung: data-easygames="ranglisten" (inline und Overlay) und EasyGames.open(\'ranglisten\')');

    // 5) Hub verlinkt die Ranglisten
    await page.goto(base + 'index.html');
    assert.equal(await page.$eval('#lBoard', a => a.getAttribute('href')), 'ranglisten.html');
    console.log('PASS Hub: Link „🏆 Ranglisten“ vorhanden');
    assert.deepEqual(errors, [], 'Seitenfehler: ' + errors.join('; '));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
