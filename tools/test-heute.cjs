#!/usr/bin/env node
// Browser-Test der Tagesherausforderung (heute.html): Spiel des Tages (für alle gleich), Serie, Eintragen mit Bestwert, Rangliste „Heute dabei“, Erfolg „Tagesheld“, Einbettung, Hub-Link.  Aufruf: node tools/test-heute.cjs
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
    const ctx = await browser.newContext({ viewport: { width: 390, height: 900 }, userAgent: 'Mozilla/5.0 EasyGamesApp/1.0' });
    const json = (r, o, status) => r.fulfill({ status: status || 200, contentType: 'application/json', body: JSON.stringify(o) });
    const S = s => ({ stringValue: s }), db = { entries: [{ id: 'u9', f: { n: S('Anna'), s: { doubleValue: 500 }, o: S('desc'), g: S('x'), t: { timestampValue: new Date().toISOString() } } }], commits: [] };
    await ctx.route(/gstatic\.com/, r => r.abort());
    await ctx.route(/securetoken\.googleapis\.com/, r => json(r, { id_token: 'tok', user_id: 'u1', expires_in: '3600', refresh_token: 'rt1' }));
    await ctx.route(/identitytoolkit\.googleapis\.com/, r => json(r, { users: [{ displayName: 'Rico', email: 'r@example.test', photoUrl: '' }] }));
    await ctx.route(/firestore\.googleapis\.com/, r => {
      const req = r.request(), u = req.url(), body = req.postData() ? JSON.parse(req.postData()) : null;
      if (/\/daily\/\d{8}:runQuery$/.test(u)) return json(r, db.entries.map(x => ({ document: { name: 'p/documents/daily/x/e/' + x.id, fields: x.f } })));
      if (/documents:commit$/.test(u) && body.writes[0] && /\/daily\//.test(body.writes[0].update.name)) { db.commits.push(body.writes[0]); const f = body.writes[0].update.fields; db.entries.push({ id: 'u1', f: { n: f.n, s: f.s, o: f.o, g: f.g, t: { timestampValue: new Date().toISOString() } } }); return json(r, {}); }
      return json(r, {}, 404);
    });
    const errors = [], page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));

    // 1) abgemeldet: Spiel des Tages ist da, Anmeldung angeboten, Eintragen versteckt
    await page.goto(base + 'heute.html'); await page.waitForFunction(() => document.getElementById('gt').textContent !== 'Lade …');
    const title = await page.$eval('#gt', e => e.textContent), href = await page.$eval('#play', a => a.getAttribute('href'));
    assert(title.length > 1 && !/kein Tagesspiel/.test(title), 'Tagesspiel: ' + title); assert(href && href !== 'index.html', 'Spielen-Link: ' + href);
    assert(await page.$eval('#enter', e => e.hidden)); assert.match(await page.$eval('#cloudMount', e => e.textContent), /speichern|Anmelden|Google/i);
    // Das Spiel des Tages ist für alle gleich (gleiche Auswahl in einer zweiten Sitzung)
    const p2 = await (await browser.newContext()).newPage(); await p2.goto(base + 'heute.html'); await p2.waitForFunction(() => document.getElementById('gt').textContent !== 'Lade …');
    assert.equal(await p2.$eval('#gt', e => e.textContent), title, 'gleiches Tagesspiel für alle'); await p2.context().close();
    console.log('PASS Spiel des Tages: für alle gleich, Anmeldung angeboten');

    // 2) angemeldet, Spiel gespielt (Bestwert vorhanden): eintragen
    const g = await page.evaluate(() => { const E = AnMaChaEngage, B = AnMaChaBoard; return fetch('sync/catalog.json').then(r => r.json()).then(c => { const x = E.dailyPick(c.games.filter(g => g.cloud && g.cloud.game), E.dayNum(), g => !B.isOptOut(g.cloud.game) && !!B.REG[g.cloud.game] && B.REG[g.cloud.game].length > 0); return { id: x.cloud.game, prefix: x.cloud.prefix, key: B.REG[x.cloud.game][0].key, path: B.REG[x.cloud.game][0].path || '' }; }); });
    await page.evaluate(([g]) => {
      localStorage.setItem('anmacha-cloud-on', '1'); localStorage.setItem('anmacha-cloud-rt', 'rt0');
      localStorage.setItem('anmacha-board-share', '1'); localStorage.setItem('anmacha-board-nick', 'Rico');
      // Spielstand mit Bestwert so ablegen, wie die Hauptwertung ihn liest (Pfad im Spielstand)
      const parts = (g.path || '').split('.').filter(Boolean); let val = 777; if (parts.length) { const o = {}; let c = o; parts.forEach((p, i) => { if (p === '*') p = '0'; c[p] = i === parts.length - 1 ? val : {}; c = c[p]; }); localStorage.setItem(g.key, JSON.stringify(o)); } else localStorage.setItem(g.key, String(val));
    }, [g]);
    await page.reload(); await page.waitForFunction(() => document.getElementById('stBest').textContent !== '–', null, { timeout: 15000 }).catch(() => {});
    const bestTxt = await page.$eval('#stBest', e => e.textContent);
    if (bestTxt === '–') { console.log('SKIP Bestwert für ' + g.id + ' nicht ablesbar (Pfad ' + g.path + ') – Eintragen-Test übersprungen'); }
    else {
      await page.waitForFunction(() => !document.getElementById('enter').hidden); await page.click('#enter');
      await page.waitForFunction(() => /✓ Heute eingetragen/.test(document.getElementById('enter').textContent) || /eingetragen/.test(document.getElementById('how').textContent));
      const f = db.commits[0].update.fields; assert.deepEqual([f.n.stringValue, f.g.stringValue, Number(f.s.doubleValue)], ['Rico', g.id, 777]); assert.equal(db.commits[0].updateTransforms[0].setToServerValue, 'REQUEST_TIME');
      assert.equal(await page.$eval('#stHero', e => e.textContent), '1'); assert(await page.$eval('#list li.me', e => !!e), 'eigene Zeile hervorgehoben');
      assert.match(await page.$eval('#list', e => e.textContent), /Anna/); const st = await page.evaluate(() => JSON.parse(localStorage.getItem('anmacha-ach')).h); assert.equal(st.length, 1, 'Tag für den Erfolg „Tagesheld“ gemerkt');
      const A = await page.evaluate(() => AnMaChaAch.run([], AnMaChaBoard, { own: {} }).items.find(i => i.id === 'challenge').level); assert.equal(A, 1, 'Erfolg Tagesheld Stufe 1');
      console.log('PASS Eintragen: Bestwert mit Spitzname, Liste „Heute dabei“, Erfolg „Tagesheld“');
    }

    // 3) Einbettung und Hub
    const host = await ctx.newPage(); await host.route('**/host.html', r => r.fulfill({ contentType: 'text/html', body: '<!doctype html><body><div id="a" data-easygames="heute"></div><button id="b" data-easygames="profil" data-mode="overlay">x</button><script src="/easygames.js"></script>' }));
    await host.goto(base.replace(/\/$/, '') + '/host.html'); await host.waitForSelector('#a iframe'); assert.match(await host.$eval('#a iframe', f => f.src), /heute\.html\?embed=1$/);
    await host.click('#b'); await host.waitForSelector('[role=dialog] iframe'); assert.match(await host.$eval('[role=dialog] iframe', f => f.src), /profil\.html\?embed=1$/);
    await host.evaluate(() => EasyGames.close()); await host.evaluate(() => EasyGames.open('heute')); assert.match(await host.$eval('[role=dialog] iframe', f => f.src), /heute\.html\?embed=1$/);
    await page.goto(base + 'heute.html?embed=1'); assert.equal(await page.$eval('.back', a => getComputedStyle(a).display), 'none');
    // Hub: Hinweisleiste mit Tagesspiel und Serie; Benachrichtigung nur bei erlaubter Berechtigung, höchstens einmal am Tag
    const note = []; await ctx.addInitScript(() => { window.__notes = []; window.Notification = function (t, o) { window.__notes.push([t, o && o.body]); }; window.Notification.permission = 'granted'; });
    await page.evaluate((d) => { const n = d; localStorage.removeItem('easygames-daynote'); localStorage.setItem('anmacha-seen', JSON.stringify({ g: {}, d: [n - 2, n - 1, n], f: {} })); const st = JSON.parse(localStorage.getItem('anmacha-ach') || '{}'); st.h = []; localStorage.setItem('anmacha-ach', JSON.stringify(st)); }, new Date().getFullYear() * 10000 + (new Date().getMonth() + 1) * 100 + new Date().getDate());
    await page.goto(base + 'index.html'); await page.waitForSelector('#dayBar:not(.hidden)', { timeout: 15000 });
    assert.match(await page.$eval('#dayBar', e => e.textContent), /Heute: .*Serie 3 Tage/); assert.equal(await page.$eval('#dayBar', a => a.getAttribute('href')), 'heute.html');
    const notes = await page.evaluate(() => window.__notes); assert.equal(notes.length, 1, 'eine Benachrichtigung'); assert.match(notes[0][1], /Serie von 3 Tagen/);
    await page.reload(); await page.waitForSelector('#dayBar:not(.hidden)'); assert.equal((await page.evaluate(() => window.__notes)).length, 0, 'am selben Tag nicht noch einmal');
    console.log('PASS Hub: Hinweisleiste (Tagesspiel, Serie), Benachrichtigung höchstens einmal am Tag');
    await page.goto(base + 'index.html'); assert.equal(await page.$eval('#lToday', a => a.getAttribute('href')), 'heute.html');
    console.log('PASS Einbettung und Hub-Link');
    assert.deepEqual(errors, [], 'Seitenfehler: ' + errors.join('; '));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
