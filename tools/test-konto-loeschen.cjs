#!/usr/bin/env node
// Konto löschen (konto-loeschen.html): nur angemeldet sichtbar, Löschen erst nach dem Wort LÖSCHEN, geht an account_delete, danach abgemeldet und (auf Wunsch) lokale Daten weg; Fehler bleiben sichtbar.
//   NODE_PATH=$(npm root -g) node tools/test-konto-loeschen.cjs      (braucht playwright + Chromium)
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': mime[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); });
(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const base = `http://127.0.0.1:${srv.address().port}/`;
  const b = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}), c = await b.newContext();
  let del = null, fail = false;
  await c.route(/^https?:\/\/(?!127)/, r => {
    const u = new URL(r.request().url()), a = u.searchParams.get('action'), h = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }, j = (o, status) => r.fulfill({ status: status || 200, contentType: 'application/json', headers: h, body: JSON.stringify(o) });
    if (r.request().method() === 'OPTIONS') return r.fulfill({ status: 204, headers: h });
    if (a === 'account_delete') { del = { body: JSON.parse(r.request().postData()), auth: r.request().headers().authorization }; return fail ? j({ status: 'error', message: 'Server sagt nein.' }, 500) : j({ status: 'ok', deleted: { account: true, profile: true, saves: 3, ratings: 1, comments: 2, drafts: 1, articles: 0 } }); }
    return r.fulfill({ status: 404, headers: h, body: '{}' });
  });
  const errors = [], p = await c.newPage(); p.on('pageerror', e => errors.push(e.message));
  await p.goto(base + 'konto-loeschen.html?embed=1'); await p.waitForTimeout(1500);
  assert.strictEqual(await p.isVisible('#form'), false, 'ohne Anmeldung kein Löschen-Formular');
  console.log('PASS Ohne Anmeldung: kein Löschen-Formular');
  await p.evaluate(() => { localStorage.setItem('anmacha-rating-token', 'abc.def'); localStorage.setItem('anmacha-rating-user', JSON.stringify({ name: 'Test' })); localStorage.setItem('anmachaSnake', '42'); });
  await p.reload(); await p.waitForSelector('#form:not([hidden])', { timeout: 8000 });
  assert.match(await p.textContent('#form'), /Spielstände/); assert.match(await p.textContent('#form'), /Kommentare/);
  assert.strictEqual(await p.isDisabled('#go'), true); await p.fill('#word', 'nein'); assert.strictEqual(await p.isDisabled('#go'), true);
  await p.fill('#word', 'löschen'); assert.strictEqual(await p.isDisabled('#go'), false);
  fail = true; await p.click('#go'); await p.waitForFunction(() => /Server sagt nein/.test(document.getElementById('err').textContent));
  assert.strictEqual(await p.isVisible('#out'), false); assert.strictEqual(await p.evaluate(() => localStorage.getItem('anmachaSnake')), '42', 'bei Fehler bleibt alles');
  console.log('PASS Löschen erst nach dem Wort; bei Serverfehler bleibt alles erhalten und der Fehler ist sichtbar');
  fail = false; await p.click('#go'); await p.waitForSelector('#out:not([hidden])', { timeout: 8000 });
  assert.ok(del && del.body.confirm.toLowerCase() === 'löschen' && /^Bearer /.test(del.auth), 'Bestätigung und Anmeldung gehen mit');
  const t = await p.textContent('#steps'); assert.match(t, /3 Spielstände/); assert.match(t, /Kommentare anonymisiert \(2\)/);
  assert.strictEqual(await p.evaluate(() => localStorage.getItem('anmacha-rating-token')), null); assert.strictEqual(await p.evaluate(() => localStorage.getItem('anmachaSnake')), null, 'lokale Daten weg');
  console.log('PASS Konto gelöscht: Server-Aufruf mit Bestätigung, Zusammenfassung, abgemeldet, lokale Daten weg');
  assert.deepStrictEqual(errors, []);
  await b.close(); srv.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
