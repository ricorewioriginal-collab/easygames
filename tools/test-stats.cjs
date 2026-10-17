#!/usr/bin/env node
// Browser-Test der Nutzungsstatistik (stille Laufzeit in cloud/anmacha-board.js): nur angemeldet, eigener Zähler je Spieler/Spiel/Tag, erste Meldung = neue Sitzung, danach nur Spielzeit,
// Übersichtsseiten (Konto, Chat …) zählen nicht, ohne Anmeldung nichts.  Aufruf: node tools/test-stats.cjs
'use strict';
const http = require('node:http'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const mime = { html: 'text/html', js: 'text/javascript', json: 'application/json', css: 'text/css', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = path.join(root, u === '/' ? 'index.html' : u);
  if (u !== '/' && u.endsWith('/')) f = path.join(f, 'index.html');
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': mime[f.split('.').pop()] || 'application/octet-stream' }); res.end(fs.readFileSync(f));
});
(async () => {
  await new Promise(r => server.listen(0, r));
  const base = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, userAgent: 'Mozilla/5.0 EasyGamesApp/1.0' });
    await ctx.addInitScript(() => { window.EASYGAMES_STATS_FIRST = 6000; window.EASYGAMES_STATS_EVERY = 8000; });
    const json = (r, o, status) => r.fulfill({ status: status || 200, contentType: 'application/json', body: JSON.stringify(o) });
    const stats = { doc: null, commits: [] };
    await ctx.route(/gstatic\.com/, r => r.abort());
    await ctx.route(/securetoken\.googleapis\.com/, r => json(r, { id_token: 'tok', user_id: 'u1', expires_in: '3600', refresh_token: 'rt1' }));
    await ctx.route(/identitytoolkit\.googleapis\.com/, r => json(r, { users: [{ displayName: 'Rico', email: 'r@example.test', photoUrl: '' }] }));
    await ctx.route(/firestore\.googleapis\.com/, r => {
      const req = r.request(), u = req.url(), body = req.postData() ? JSON.parse(req.postData()) : null;
      if (/\/stats\//.test(u) && req.method() === 'GET') return stats.doc ? json(r, { fields: stats.doc }) : json(r, {}, 404);
      if (/documents:commit$/.test(u) && body.writes[0] && /\/stats\//.test(body.writes[0].update.name)) { stats.commits.push(body.writes[0]); stats.doc = body.writes[0].update.fields; return json(r, {}); }
      return json(r, {}, 404);
    });
    const page = await ctx.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));

    // 1) ohne Anmeldung: keine Meldung
    await page.goto(base + 'wobbel/'); await page.waitForTimeout(8000);
    assert.equal(stats.commits.length, 0, 'abgemeldet wird nichts gezählt');
    console.log('PASS Abgemeldet: keine Statistik');

    // 2) angemeldet: erste Meldung = neue Sitzung (s=1), später nur Spielzeit (s bleibt)
    await page.evaluate(() => { localStorage.setItem('anmacha-cloud-on', '1'); localStorage.setItem('anmacha-cloud-rt', 'rt0'); });
    await page.goto(base + 'wobbel/'); await page.waitForFunction(() => window.AnMaChaCloud && window.AnMaChaCloud.user && window.AnMaChaCloud.user(), null, { timeout: 15000 });
    await page.waitForTimeout(500); const t0 = Date.now();
    while (stats.commits.length < 1 && Date.now() - t0 < 25000) await page.waitForTimeout(500);
    assert(stats.commits.length >= 1, 'erste Meldung kam');
    const c1 = stats.commits[0], f1 = c1.update.fields, day = new Date(); const dn = day.getFullYear() * 10000 + (day.getMonth() + 1) * 100 + day.getDate();
    assert.match(c1.update.name, new RegExp('/stats/wobbel_' + dn + '_u1$')); assert.deepEqual([f1.g.stringValue, Number(f1.d.integerValue), Number(f1.s.integerValue), Number(f1.a.integerValue)], ['wobbel', dn, 1, Number(f1.t.integerValue) < 20 ? 1 : 0]);   // unter 20 s = Abbruch (im Test sind die Schwellen verkürzt)
    assert(Number(f1.t.integerValue) >= 5 && Number(f1.t.integerValue) <= 30, 'Spielzeit plausibel: ' + f1.t.integerValue); assert.equal(c1.updateTransforms[0].setToServerValue, 'REQUEST_TIME');
    assert(!JSON.stringify(c1).includes('Rico') && !JSON.stringify(c1).includes('example.test'), 'keine Namen/Konto-Daten');
    const t1 = Date.now(); while (stats.commits.length < 2 && Date.now() - t1 < 25000) await page.waitForTimeout(500);
    assert(stats.commits.length >= 2, 'zweite Meldung (Spielzeit) kam'); const f2 = stats.commits[1].update.fields;
    assert.equal(Number(f2.s.integerValue), 1, 'laufende Sitzung zählt nicht doppelt'); assert(Number(f2.t.integerValue) > Number(f1.t.integerValue), 'Spielzeit wächst');
    console.log('PASS Angemeldet: eigener Zähler (Spiel, Tag, uid), neue Sitzung s=1, danach nur Spielzeit, keine Personendaten');

    // 3) Übersichtsseiten zählen nicht
    const n = stats.commits.length; const p2 = await ctx.newPage(); await p2.goto(base + 'konto.html'); await p2.waitForTimeout(9000);
    assert.equal(stats.commits.length, n, 'Konto-Seite wird nicht als Spiel gezählt');
    assert.deepEqual(await p2.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('anmacha-seen') || '{"g":{}}').g).filter(k => k === 'konto')), [], 'auch keine Spielspur');
    console.log('PASS Übersichtsseiten (Konto, Chat …) zählen nicht als Spielen');
    assert.deepEqual(errors, [], 'Seitenfehler: ' + errors.join('; '));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
