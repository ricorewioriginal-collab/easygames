#!/usr/bin/env node
// Spiele-Hub (hub/anmacha-hub.js): eigene Spieleseite ohne iframe – Karten aus sync/catalog.json, Suche, Kategorien, Favoriten, Spielen im Vollbild-Fenster,
// Echtzeit: neue Spiele erscheinen ohne Neuladen (Versionsprüfung), Favoriten gleichen sich mit dem Konto ab (eigener Server) und folgen einem anderen Gerät.
//   NODE_PATH=$(npm root -g) node tools/test-hub.cjs
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
let extra = null, version = null;   // Test hängt ein zusätzliches Spiel an und erhöht die Version
const srv = http.createServer((q, r) => {
  const u = q.url.split('?')[0];
  if (u === '/host.html') { r.writeHead(200, { 'content-type': 'text/html' }); return r.end('<!doctype html><meta charset=utf-8><body style="background:#101522;color:#eee;font-family:Georgia,serif"><script>localStorage.setItem("anmacha-rating-token","tt.zz");localStorage.setItem("anmacha-rating-user",JSON.stringify({name:"Hub Test",picture:""}))</script><div id="spiele"></div><script src="/hub/anmacha-hub.js"></script><script>AnMaChaHub.mount("#spiele",{theme:{accent:"#ff4b9b",radius:"6px"}})</script></body>'); }
  if (u === '/sync/catalog.json' && extra) { const c = JSON.parse(fs.readFileSync(path.join(root, 'sync/catalog.json'))); c.games.push(extra); r.writeHead(200, { 'content-type': 'application/json' }); return r.end(JSON.stringify(c)); }
  if (u === '/sync/manifest.json' && version) { const m = JSON.parse(fs.readFileSync(path.join(root, 'sync/manifest.json'))); m.version = version; r.writeHead(200, { 'content-type': 'application/json' }); return r.end(JSON.stringify(m)); }
  fs.readFile(path.join(root, decodeURIComponent(u)), (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': mime[path.extname(u)] || 'application/octet-stream' }); r.end(b); });
});
(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const base = `http://127.0.0.1:${srv.address().port}/`;
  const b = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}), c = await b.newContext();
  let doc = null, ver = 0; const puts = [], cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' };
  await c.route(/^https?:\/\/(?!127)/, r => {
    const u = new URL(r.request().url()), act = u.searchParams.get('action'), J = { ...cors, 'content-type': 'application/json' };
    if (u.host !== 'www.ricorewi-radio.de') return r.abort();
    if (r.request().method() === 'OPTIONS') return r.fulfill({ status: 204, headers: cors });
    if (act === 'saves_ver') return doc ? r.fulfill({ status: 200, headers: J, body: JSON.stringify({ status: 'ok', ver: 'v' + ver }) }) : r.fulfill({ status: 404, headers: J, body: '{}' });
    if (act === 'saves_get') return doc ? r.fulfill({ status: 200, headers: J, body: JSON.stringify({ status: 'ok', d: doc, ver: 'v' + ver }) }) : r.fulfill({ status: 404, headers: J, body: '{}' });
    if (act === 'saves_put') { const x = JSON.parse(r.request().postData()); puts.push(x); doc = x.d; ver++; return r.fulfill({ status: 200, headers: J, body: JSON.stringify({ status: 'ok', ver: 'v' + ver }) }); }
    r.abort();
  });
  const errors = [], p = await c.newPage(); p.on('pageerror', e => errors.push(e.message)); await p.clock.install();
  await p.goto(base + 'host.html'); await p.waitForSelector('.egh-card');
  const n = JSON.parse(fs.readFileSync(path.join(root, 'sync/catalog.json'))).games.length;
  assert.strictEqual(await p.locator('.egh-grid .egh-card').count(), n);
  console.log(`PASS Hub: ${n} Spiele als Karten (eigene Seite, kein iframe)`);
  assert.strictEqual(await p.locator('iframe').count(), 0);
  assert.strictEqual(await p.$eval('.egh', e => getComputedStyle(e).getPropertyValue('--egh-accent').trim()), '#ff4b9b');
  console.log('PASS Hub: Aussehen kommt von der Seite (Theme-Variablen)');
  await p.fill('.egh-s', 'quiz'); const q = await p.locator('.egh-grid .egh-card').count(); assert.ok(q >= 1 && q < n); console.log(`PASS Suche: „quiz“ → ${q} Treffer`);
  await p.fill('.egh-s', ''); await p.click('.egh-chip[data-cat="quiz"]'); assert.ok((await p.locator('.egh-grid .egh-card').count()) < n); console.log('PASS Kategorie-Filter'); await p.click('.egh-chip[data-cat=""]');
  // Favorit setzen → lokal + auf dem Server (Format wie anmacha-cloud.js)
  const first = await p.$eval('.egh-grid .egh-heart', e => e.dataset.fav); await p.click('.egh-grid .egh-heart'); await p.clock.runFor(4000); await new Promise(r => setTimeout(r, 600));
  assert.ok(JSON.parse(await p.evaluate(() => localStorage.getItem('eg-fav'))).includes(first));
  assert.ok(puts.length >= 1 && JSON.parse(puts[puts.length - 1].d)['eg-fav'].v.includes(first), 'Favorit liegt auf dem Server'); console.log('PASS Favorit: lokal und auf dem Server (gleiches Format wie die Spiele)');
  // anderes Gerät: Favorit erscheint ohne Neuladen (Versions-Abfrage alle 45 s)
  const other = JSON.parse(doc); other['eg-fav'] = { v: JSON.stringify([first, 'wobbel']), t: Date.now() + 1e9 }; doc = JSON.stringify(other); ver++;
  await p.clock.runFor(50000); for (let i = 0; i < 12 && !(await p.evaluate(() => localStorage.getItem('eg-fav'))).includes('wobbel'); i++) { await new Promise(r => setTimeout(r, 300)); await p.clock.runFor(1000); }
  assert.ok((await p.evaluate(() => localStorage.getItem('eg-fav'))).includes('wobbel')); console.log('PASS Echtzeit: Favorit von einem anderen Gerät erscheint ohne Neuladen');
  // neues Spiel in der Liste → erscheint ohne Neuladen
  extra = { id: 'neues-testspiel', title: 'Neues Testspiel – Live', icon: '🆕', path: 'neues-testspiel/', desc: 'x' }; version = 'live-' + Date.now();
  await p.clock.runFor(61000); for (let i = 0; i < 12 && (await p.locator('.egh-grid .egh-card').count()) === n; i++) { await new Promise(r => setTimeout(r, 300)); await p.clock.runFor(1000); }
  assert.strictEqual(await p.locator('.egh-grid .egh-card').count(), n + 1); console.log('PASS Echtzeit: neues Spiel erscheint ohne Neuladen');
  // Spielen: Vollbild-Fenster mit iframe auf die Spielseite
  await p.click('.egh-grid .egh-card'); await p.waitForSelector('.egh-pl:not([hidden]) iframe');
  assert.match(await p.$eval('.egh-pl iframe', f => f.getAttribute('src')), /^http:\/\/127\.0\.0\.1:\d+\/[^?]+\/?/); console.log('PASS Spielen: Vollbild-Fenster dieser Seite');
  await p.click('.egh-pl [data-x]'); assert.ok(await p.$eval('.egh-pl', e => e.hidden));
  assert.deepStrictEqual(errors.filter(e => !/three|Failed to load/.test(e)), [], 'Seitenfehler: ' + errors.join('; '));
  await b.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
