#!/usr/bin/env node
// Browser-Test der Konto-Seite (konto.html): abgemeldet, angemeldet (App-Modus mit simulierten Google-/Firestore-Antworten), Einbettung, Hub-Link, Konto-Zeile im Cloud-Fenster der Spiele. Aufruf: node tools/test-konto.cjs
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
    const json = (r, o) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(o) });
    await ctx.route(/gstatic\.com/, r => r.abort());
    await ctx.route(/securetoken\.googleapis\.com/, r => json(r, { id_token: 'tok', user_id: 'u1', expires_in: '3600', refresh_token: 'rt1' }));
    await ctx.route(/identitytoolkit\.googleapis\.com/, r => json(r, { users: [{ displayName: 'Rico Test', email: 'rico@example.test', photoUrl: '' }] }));
    await ctx.route(/firestore\.googleapis\.com/, r => {
      const u = r.request().url();
      if (/\/saves\?/.test(u)) return json(r, { documents: [{ name: 'x/users/u1/saves/wobbel', fields: { t: { integerValue: '1700000000000' } } }, { name: 'x/users/u1/saves/__ach', fields: {} }, { name: 'x/users/u1/saves/wobbel__alt', fields: {} }, { name: 'x/users/u1/saves/snake', fields: { t: { integerValue: '1800000000000' } } }] });
      return r.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
    });
    const errors = [], page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));

    // 1) abgemeldet: Hinweis, Anmelde-Angebot im Konto-Fenster, keine Übersicht
    await page.goto(base + 'konto.html');
    await page.waitForFunction(() => /Nicht angemeldet/.test(document.getElementById('nm').textContent));
    assert(!(await page.$eval('#sum', e => !e.hidden)), 'ohne Anmeldung keine Übersicht');
    assert.match(await page.$eval('#cloudMount', e => e.textContent), /Mit Google speichern|Anmelden|speichern/i);
    console.log('PASS Konto abgemeldet: Hinweis und Anmeldung, keine Übersicht');

    // 2) angemeldet (Kopplung vorhanden): Name, Übersicht, gesicherte Spiele
    await page.evaluate(() => { localStorage.setItem('anmacha-cloud-on', '1'); localStorage.setItem('anmacha-cloud-rt', 'rt0'); });
    await page.reload();
    await page.waitForFunction(() => document.getElementById('nm').textContent === 'Rico Test');
    await page.waitForSelector('#svList li b');
    assert.equal(await page.$eval('#em', e => e.textContent), 'rico@example.test');
    assert(await page.$eval('#sum', e => !e.hidden));
    const rows = await page.$$eval('#svList li b', l => l.map(x => x.textContent));
    assert.equal(rows.length, 2, 'Profil- und alte Sicherungen ausgeblendet: ' + rows.join('|')); assert(rows.some(t => /Snake/i.test(t) || t === 'snake') && rows.some(t => /Wobbel/i.test(t)));
    assert(!(await page.$eval('#cloudMount', e => e.offsetParent !== null)), 'angemeldet: keine Speichern-Knöpfe auf der Konto-Seite'); assert(await page.$eval('#out', e => e.offsetParent !== null), 'Abmelden-Knopf');
    assert.equal(await page.$eval('#sSave', e => e.textContent), '2');
    console.log('PASS Konto angemeldet: Name, Übersicht, gesicherte Spielstände ohne Profil-Dokumente');

    await page.click('#out'); await page.waitForFunction(() => /Nicht angemeldet/.test(document.getElementById('nm').textContent)); assert(await page.evaluate(() => !localStorage.getItem('anmacha-cloud-rt') && !localStorage.getItem('anmacha-cloud-on')), 'Abmelden löscht die Kopplung');
    await page.evaluate(() => { localStorage.setItem('anmacha-cloud-on', '1'); localStorage.setItem('anmacha-cloud-rt', 'rt0'); });
    // 3) ein Spiel ist ohne erneute Anmeldung angemeldet und verweist aufs Konto
    await page.goto(base + 'wobbel/');
    await page.waitForFunction(() => window.AnMaChaCloud && window.AnMaChaCloud.user && window.AnMaChaCloud.user(), null, { timeout: 15000 });
    assert.equal(await page.evaluate(() => window.AnMaChaCloud.user().displayName), 'Rico Test');
    await page.waitForFunction(() => /Konto & Übersicht/.test(document.body.innerText + [...document.querySelectorAll('button')].map(b => b.textContent).join()), null, { timeout: 5000 }).catch(() => {});
    const txt = await page.evaluate(() => [...document.querySelectorAll('button')].map(b => b.textContent).join('|'));
    assert(/Konto & Übersicht/.test(txt), 'Konto-Zeile im Cloud-Fenster: ' + txt.slice(0, 200));
    assert.equal(await page.evaluate(() => [...document.querySelectorAll('button')].some(b => /Konto/.test(b.textContent))), true);
    console.log('PASS Spiel: ohne neue Anmeldung angemeldet, Cloud-Fenster verweist aufs Konto');

    // 4) Einbettung und Hub-Link
    await page.goto(base + 'konto.html?embed=1');
    assert.equal(await page.$eval('.back', a => getComputedStyle(a).display), 'none');
    const host = await ctx.newPage();
    await host.route('**/host.html', r => r.fulfill({ contentType: 'text/html', body: '<!doctype html><body><button id="b" data-easygames="konto" data-mode="overlay">x</button><div id="in" data-easygames="konto"></div><script src="/easygames.js"></script>' }));
    await host.goto(base.replace(/\/$/, '') + '/host.html');
    await host.waitForSelector('#in iframe');
    assert.match(await host.$eval('#in iframe', f => f.src), /konto\.html\?embed=1$/);
    await host.click('#b'); await host.waitForSelector('[role=dialog] iframe');
    assert.match(await host.$eval('[role=dialog] iframe', f => f.src), /konto\.html\?embed=1$/);
    await host.evaluate(() => EasyGames.close()); await host.evaluate(() => EasyGames.open('konto'));
    assert.match(await host.$eval('[role=dialog] iframe', f => f.src), /konto\.html\?embed=1$/);
    console.log('PASS Einbettung: data-easygames="konto" (inline und Overlay) und EasyGames.open(\'konto\')');
    await page.goto(base + 'index.html');
    assert.equal(await page.$eval('#lAcc', a => a.getAttribute('href')), 'konto.html');
    console.log('PASS Hub: Link „👤 Konto“ vorhanden');
    assert.deepEqual(errors, [], 'Seitenfehler: ' + errors.join('; '));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
