#!/usr/bin/env node
// Ein Login für alles, auch in fremden Seiten: easygames-Seite in einem iframe einer anderen Herkunft → Klick auf „Anmelden“ öffnet das Fenster von ricorewi-radio.de (hier simuliert),
// das Token kommt per postMessage zurück, die einbettende Seite merkt es sich (easygames.js) und gibt es an die iframes weiter; nach Neuladen ist man ohne Klick angemeldet. Abmelden räumt auf.
//   NODE_PATH=$(npm root -g) node tools/test-account.cjs      (braucht playwright + Chromium)
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/json' };
const mk = fn => http.createServer((q, r) => fn(q, r));
const games = mk((q, r) => { let f = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html'; fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': mime[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); });
let gbase = '';
const host = mk((q, r) => { r.writeHead(200, { 'content-type': 'text/html' }); if (q.url === '/b') return r.end(`<!doctype html><meta charset=utf-8><body><div id="hp"></div><script>localStorage.setItem('anmacha-rating-token','tt.zz');localStorage.setItem('anmacha-rating-user','{"name":"Host Person","picture":""}')</script><script src="${gbase}cloud/anmacha-account.js"></script><script src="${gbase}easygames.js"></script><iframe id="f" src="${gbase}konto.html?embed=1" style="width:420px;height:700px"></iframe></body>`); r.end(`<!doctype html><meta charset=utf-8><body><h1>Fremde Seite</h1><script src="${gbase}easygames.js"></script><iframe id="f" src="${gbase}konto.html?embed=1" style="width:420px;height:700px"></iframe></body>`); });
(async () => {
  await new Promise(r => games.listen(0, '127.0.0.1', r)); gbase = `http://127.0.0.1:${games.address().port}/`;
  await new Promise(r => host.listen(0, '127.0.0.1', r)); const hurl = `http://127.0.0.1:${host.address().port}/`;
  const b = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}), c = await b.newContext();
  const calls = []; let opened = 0;
  await c.route(/^https?:\/\/(?!127)/, r => {
    const u = new URL(r.request().url());
    if (u.host === 'www.ricorewi-radio.de' && u.pathname === '/anmelden.html') {
      opened++; const o = u.searchParams.get('o');
      return r.fulfill({ contentType: 'text/html', body: `<!doctype html><script>opener.postMessage({type:'anmacha-login',token:'abc.def',user:{name:'Test Person',picture:''}},${JSON.stringify(o)});setTimeout(()=>close(),50)</script>` });
    }
    if (u.host === 'www.ricorewi-radio.de') { calls.push(u.searchParams.get('action')); return r.fulfill({ status: 404, contentType: 'application/json', headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }, body: '{"status":"none"}' }); }
    return r.abort();
  });
  const errors = [], p = await c.newPage(); p.on('pageerror', e => errors.push(e.message));
  await p.goto(hurl); const fr = p.frameLocator('#f');
  await fr.locator('#cloudMount button', { hasText: 'Mit Google speichern' }).first().waitFor();
  const [pop] = await Promise.all([p.waitForEvent('popup'), fr.locator('#cloudMount button', { hasText: 'Mit Google speichern' }).first().click()]);
  await fr.locator('#nm', { hasText: 'Test Person' }).waitFor();
  assert.strictEqual(opened, 1, 'Anmelde-Fenster genau einmal geöffnet');
  console.log('PASS Fremde Seite: Klick → Anmelde-Fenster → angemeldet (Konto zeigt „Test Person“)');
  const mem = await p.evaluate(() => JSON.parse(localStorage.getItem('anmacha-embed-account') || 'null'));
  assert.ok(mem && mem.token === 'abc.def' && mem.user.name === 'Test Person');
  console.log('PASS Die einbettende Seite merkt sich das Konto (anmacha-embed-account)');
  await p.reload(); await p.frameLocator('#f').locator('#nm', { hasText: 'Test Person' }).waitFor({ timeout: 8000 });
  assert.strictEqual(opened, 1, 'nach dem Neuladen kein weiteres Fenster');
  console.log('PASS Nach dem Neuladen ohne Klick angemeldet (Konto kommt von der einbettenden Seite)');
  await p.waitForTimeout(500);
  assert.ok(!calls.some(a => /firestore/.test(String(a))), 'kein Firestore');
  await p.frameLocator('#f').locator('#out').click();
  await p.frameLocator('#f').locator('#nm', { hasText: 'Nicht angemeldet' }).waitFor();
  await p.waitForTimeout(300);
  assert.strictEqual(await p.evaluate(() => localStorage.getItem('anmacha-embed-account')), null);
  console.log('PASS Abmelden räumt auch das Konto der einbettenden Seite ab');
  // Seite mit eigenem Login-Knopf (z. B. ricorewi.de): Konto der Seite gilt automatisch im eingebetteten Spiel/Konto
  const p2 = await c.newPage(); p2.on('pageerror', e => errors.push(e.message));
  await p2.goto(hurl + 'b'); await p2.frameLocator('#f').locator('#nm', { hasText: 'Host Person' }).waitFor({ timeout: 8000 });
  console.log('PASS Seite mit eigenem Login: das eingebettete Konto übernimmt den Login der Seite');
  await p2.evaluate(() => AnMaChaAccount.logout()); await p2.frameLocator('#f').locator('#nm', { hasText: 'Nicht angemeldet' }).waitFor({ timeout: 8000 });
  console.log('PASS Abmelden auf der Seite meldet auch das eingebettete Konto ab');
  // Angemeldet (Konto-Token, z. B. Login im Kopf oder bei den Bewertungen) → ein gestartetes Spiel ist automatisch angemeldet
  const c4 = await b.newContext();
  await c4.route(/^https?:\/\/(?!127)/, r => r.abort());
  const p4 = await c4.newPage();   // Spielseite lädt ohne Netz nicht alles (z. B. three.js): Seitenfehler hier egal
  await p4.addInitScript(() => { localStorage.setItem('anmacha-rating-token', 'x.y'); localStorage.setItem('anmacha-rating-user', JSON.stringify({ name: 'Rico', picture: '' })); });
  await p4.goto(gbase + 'anmacha-snake/index.html'); await p4.waitForFunction(() => window.AnMaChaCloud && AnMaChaCloud.user() && AnMaChaCloud.user().displayName === 'Rico', null, { timeout: 8000 });
  console.log('PASS Spiel: mit Konto-Token automatisch angemeldet (ohne extra Cloud-Schalter)');
  // App (Android/Windows): Google sperrt die Anmeldung im App-Fenster → Kopplungs-Link im Konto-Menü
  const c3 = await b.newContext({ userAgent: 'Mozilla/5.0 EasyGamesApp/1.0', viewport: { width: 390, height: 800 } });
  await c3.route(/^https?:\/\/(?!127)/, r => r.request().url().includes('firestore.googleapis.com') ? r.fulfill({ status: 404, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{}' }) : r.abort());
  const p3 = await c3.newPage(); p3.on('pageerror', e => errors.push(e.message));
  await p3.goto(gbase + 'index.html'); await p3.locator('#acct .eg-acc-b.out').click();
  const lk = p3.locator('#acct .eg-acc-m:not([hidden]) a[href*="#koppeln="]'); await lk.waitFor();
  assert.match(await lk.getAttribute('href'), /^https:\/\/www\.ricorewi-radio\.de\/#koppeln=[0-9a-f]{32}$/);
  console.log('PASS App: „Anmelden“ zeigt den Kopplungs-Link (Browser öffnen/kopieren/abbrechen)');
  await p3.locator('#acct .eg-acc-m:not([hidden]) button', { hasText: 'Abbrechen' }).click(); await p3.locator('#acct .eg-acc-m[hidden]').waitFor({ state: 'attached' });
  assert.deepStrictEqual(errors, [], 'Seitenfehler: ' + errors.join('; '));
  await b.close(); games.close(); host.close();
})().catch(e => { console.error(e); process.exit(1); });
