#!/usr/bin/env node
// Radio-Erfolge-Seite (radio-erfolge.html, für die Apps): Zahlen aus dem Konto-Dokument „ricorewi-portal“ (alle Geräte) + Beiträge → Rang/Stufen; ohne Anmeldung nur der Hinweis.
//   NODE_PATH=$(npm root -g) node tools/test-radio-erfolge.cjs      (braucht playwright + Chromium)
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': mime[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); });
const doc = {
  rrw_mein_radio_dev_a: { v: JSON.stringify({ s: 40000, st: { a: 1, b: 2, c: 3 }, d: ['2026-10-17', '2026-10-18', '2026-10-19'], n: 1 }), t: 1 },
  rrw_mein_radio_dev_b: { v: JSON.stringify({ s: 40000, st: { d: 1 }, d: ['2026-10-10'], e: 1 }), t: 1 },
  rrw_favorites_v1: { v: '["1","2","3"]', t: 1 }
};
(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const base = `http://127.0.0.1:${srv.address().port}/`;
  const b = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}), c = await b.newContext();
  await c.route(/^https?:\/\/(?!127)/, r => {
    const u = new URL(r.request().url()), a = u.searchParams.get('action'), h = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' };
    if (r.request().method() === 'OPTIONS') return r.fulfill({ status: 204, headers: h });
    if (u.host === 'www.ricorewi-radio.de' && a === 'saves_get' && u.searchParams.get('game') === 'ricorewi-portal') return r.fulfill({ contentType: 'application/json', headers: h, body: JSON.stringify({ d: JSON.stringify(doc), ver: 'v1' }) });
    if (u.host === 'www.ricorewi-radio.de' && a === 'account_articles') return r.fulfill({ contentType: 'application/json', headers: h, body: JSON.stringify({ articles: [{ status: 'published' }, { status: 'draft' }] }) });
    return r.fulfill({ status: 404, contentType: 'application/json', headers: h, body: '{}' });
  });
  const errors = [], p = await c.newPage(); p.on('pageerror', e => errors.push(e.message));
  await p.goto(base + 'radio-erfolge.html?embed=1');
  await p.waitForSelector('.rre h1');
  assert.ok(/Google an/.test(await p.textContent('#app')), 'ohne Anmeldung: Hinweis zum Anmelden');
  console.log('PASS Ohne Anmeldung: nur der Hinweis');
  await p.evaluate(() => { localStorage.setItem('anmacha-rating-token', 'abc.def'); localStorage.setItem('anmacha-rating-user', JSON.stringify({ name: 'Test Person' })); });
  await p.reload(); await p.waitForSelector('.rre-card');
  const t = await p.textContent('#app');
  assert.ok(/Hörzeit/.test(t) && /Stufe 3\/7/.test(t), 'Hörzeit: 80000 s = 22 Std. → Stufe 3 (' + t.slice(0, 200) + ')');   // 40000+40000 s von zwei Geräten
  assert.ok(/Nachteule/.test(t) && /Frühaufsteher/.test(t), 'Nacht/Früh von zwei Geräten');
  assert.ok(/Veröffentlicht/.test(t) && /1 von 3|1\/3/.test(t.replace(/\s+/g, ' ')), 'Beiträge vom Konto');
  assert.strictEqual(await p.locator('.rre-card:not(.off)').count() > 4, true);
  console.log('PASS Angemeldet: Geräte zusammengezählt, Rang und Stufen sichtbar');
  assert.deepStrictEqual(errors, []);
  await b.close(); srv.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
