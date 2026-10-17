#!/usr/bin/env node
// Browser-Test des Chats (chat.html) mit simuliertem Firestore und Google-Login (App-Modus): Anmeldung, Name, Senden, Filter, Flutschutz,
// Anzeigen/Maskieren, Melden, Ausblenden, Admin, Einbettung, Hub-Link.  Aufruf: node tools/test-chat.cjs
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
    const json = (r, o, status) => r.fulfill({ status: status || 200, contentType: 'application/json', body: JSON.stringify(o) });
    // Simulierter Firestore: Nachrichten je Raum, Online-Liste, Admin/Ban, Meldungen
    const db = { msgs: { lobby: [{ id: 'old1', u: 'u9', n: 'Anna', x: 'Hallo, du Arschloch', t: new Date(Date.now() - 60000).toISOString() }, { id: 'old2', u: 'u8', n: 'Ben', x: 'Wer spielt Snake?', t: new Date(Date.now() - 30000).toISOString() }] }, reports: [], commits: [], admin: false, deleted: [] };
    const tsNow = () => new Date().toISOString(), sent = () => db.commits.filter(b => /\/m\//.test(b.writes[0].update.name)).length;
    await ctx.route(/gstatic\.com/, r => r.abort());
    await ctx.route(/securetoken\.googleapis\.com/, r => json(r, { id_token: 'tok', user_id: 'u1', expires_in: '3600', refresh_token: 'rt1' }));
    await ctx.route(/identitytoolkit\.googleapis\.com/, r => json(r, { users: [{ displayName: 'Rico Test', email: 'rico@example.test', photoUrl: '' }] }));
    await ctx.route(/firestore\.googleapis\.com/, r => {
      const req = r.request(), u = req.url(), m = req.method(), body = req.postData() ? JSON.parse(req.postData()) : null;
      if (/\/config\/games$/.test(u)) return json(r, {}, 404);   // Spieleliste (Hub) fragt öffentlich nach Betreiber-Einstellungen
      assert(/Bearer tok/.test(req.headers().authorization || '') || /\/saves\//.test(u), 'Anfragen mit Anmelde-Token: ' + u);
      if (/\/chat\/([a-z0-9-]+):runQuery$/.test(u)) {
        const room = /\/chat\/([a-z0-9-]+):runQuery$/.exec(u)[1], q = body.structuredQuery, after = q.where && q.where.fieldFilter.value.timestampValue;
        let list = (db.msgs[room] || []).filter(x => !after || x.t > after).sort((a, b) => a.t < b.t ? -1 : 1);
        if (!after) list = list.slice(-50);
        return json(r, list.length ? list.map(x => ({ document: { name: 'p/databases/(default)/documents/chat/' + room + '/m/' + x.id, fields: { u: { stringValue: x.u }, n: { stringValue: x.n }, x: { stringValue: x.x }, t: { timestampValue: x.t } } } })) : [{ readTime: tsNow() }]);
      }
      if (/documents:runQuery$/.test(u)) return json(r, [{ document: { name: 'p/databases/(default)/documents/chat_online/u8', fields: { n: { stringValue: 'Ben' }, t: { timestampValue: tsNow() } } } }]);
      if (/documents:commit$/.test(u)) {
        const w = body.writes[0], name = w.update.name;
        db.commits.push(body);
        if (/chat_reports/.test(name)) { db.reports.push(w.update.fields); return json(r, {}); }
        if (/chat_ban\//.test(name)) return json(r, {});
        if (/\/chat\/([a-z0-9-]+)\/m\//.test(name)) {
          assert.equal(body.writes.length, 2, 'Nachricht + Flutschutz-Dokument im selben Schreibvorgang'); assert(/chat_last\//.test(body.writes[1].update.name));
          assert.equal(w.updateTransforms[0].setToServerValue, 'REQUEST_TIME');
          const room = /\/chat\/([a-z0-9-]+)\/m\//.exec(name)[1], f = w.update.fields;
          (db.msgs[room] = db.msgs[room] || []).push({ id: name.split('/').pop(), u: f.u.stringValue, n: f.n.stringValue, x: f.x.stringValue, t: tsNow() });
        }
        return json(r, {});
      }
      if (m === 'DELETE') { db.deleted.push(u); return json(r, {}); }
      if (/\/chat_admin\//.test(u)) return db.admin ? json(r, { fields: {} }) : json(r, {}, 404);
      if (/\/chat_ban\//.test(u)) return json(r, {}, 404);
      return json(r, {}, 404);   // __chat-Profil u. a.
    });
    const errors = [], page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));

    // 1) abgemeldet: nur die Anmeldung, kein Chat
    await page.goto(base + 'chat.html');
    await page.waitForSelector('#gate:not([hidden])');
    assert(await page.$eval('#chat', e => e.hidden) && await page.$eval('#nickBox', e => e.hidden));
    console.log('PASS Chat abgemeldet: nur Anmelde-Hinweis, kein Chat');

    // 2) angemeldet: erst Chat-Name (gefiltert), dann Chat
    await page.evaluate(() => { localStorage.setItem('anmacha-cloud-on', '1'); localStorage.setItem('anmacha-cloud-rt', 'rt0'); });
    await page.reload(); await page.waitForSelector('#nickBox:not([hidden])');
    await page.fill('#nick', 'Arschloch'); await page.click('#nickForm button'); assert.match(await page.$eval('#nickErr', e => e.textContent), /freundlich/);
    await page.fill('#nick', 'a'); await page.click('#nickForm button'); assert.match(await page.$eval('#nickErr', e => e.textContent), /2 bis 20/);
    await page.fill('#nick', 'Rico'); await page.click('#nickForm button');
    await page.waitForSelector('#chat:not([hidden])'); await page.waitForSelector('#list .m');
    console.log('PASS Chat-Name: Filter und Länge, danach Chat sichtbar');

    // 3) Verlauf: Beleidigung maskiert, Online-Liste
    const texts = await page.$$eval('#list .m .x', l => l.map(x => x.textContent));
    assert.deepEqual(texts, ['Hallo, du *********', 'Wer spielt Snake?']);
    await page.waitForFunction(() => /1 im Chat/.test(document.getElementById('on').textContent));
    assert.match(await page.$eval('#on', e => e.textContent), /Ben/);
    console.log('PASS Verlauf: verbotene Wörter maskiert, Online-Liste');

    // 4) Senden: Filter blockt, normale Nachricht geht an Firestore, erscheint, Flutschutz
    for (const [t, re] of [['du Arschloch', /freundlich/], ['schau auf www.test.de', /Links/], ['ruf an 0171 1234567', /Telefon/]]) {
      await page.fill('#msg', t); await page.click('#send'); await page.waitForFunction(r => new RegExp(r).test(document.getElementById('err').textContent), re.source);
    }
    assert.equal(sent(), 0, 'gefilterte Nachrichten erreichen Firestore nie');
    await page.fill('#msg', 'Ich spiele gleich Snake!'); await page.click('#send');
    await page.waitForFunction(() => [...document.querySelectorAll('#list .m.me .x')].some(x => x.textContent === 'Ich spiele gleich Snake!'));
    assert.equal(sent(), 1);
    await page.fill('#msg', 'Noch eine'); await page.click('#send');
    await page.waitForFunction(() => /Langsam/.test(document.getElementById('err').textContent));
    assert.equal(sent(), 1, 'zu schnell: nichts gesendet');
    console.log('PASS Senden: Filter (Wort, Link, Telefon) blockt vor Firestore, Nachricht erscheint, Flutschutz');

    // 5) Melden, Ausblenden
    await page.click('#list .m[data-id=old2] button[title="Nachricht melden"]'); await page.waitForFunction(() => /gemeldet/.test(document.getElementById('toast').textContent));
    assert.equal(db.reports.length, 1); assert.equal(db.reports[0].m.stringValue, 'old2'); assert.equal(db.reports[0].r.stringValue, 'u1');
    await page.click('#list .m[data-id=old2] button[title="Spieler ausblenden"]');
    assert(await page.$eval('#list .m[data-id=old2]', e => e.hidden), 'ausgeblendet');
    await page.reload(); await page.waitForSelector('#list .m');
    assert(await page.$eval('#list .m[data-id=old2]', e => e.hidden), 'Ausblenden bleibt nach Neuladen');
    console.log('PASS Melden und Ausblenden (bleibt gespeichert)');

    // 6) Räume
    await page.click('#rooms .tab:nth-child(2)'); await page.waitForSelector('#list .sys');
    assert.match(await page.$eval('#list', e => e.textContent), /Erste!/);
    console.log('PASS Raumwechsel: eigener, zunächst leerer Raum');

    // 7) Betreiber sieht Löschen/Sperren
    db.admin = true; await page.goto(base + 'chat.html?room=lobby'); await page.waitForSelector('#list .m');
    await page.waitForFunction(() => document.querySelector('#list .m[data-id=old1] button[title="Nachricht löschen"]'));
    await page.click('#list .m[data-id=old1] button[title="Nachricht löschen"]');
    await page.waitForFunction(() => !document.querySelector('#list .m[data-id=old1]'));
    assert(db.deleted.some(u => /\/chat\/lobby\/m\/old1$/.test(u)));
    console.log('PASS Betreiber: Nachricht löschen');

    // 8) Einbettung und Hub
    await page.goto(base + 'chat.html?embed=1');
    assert.equal(await page.$eval('.back', a => getComputedStyle(a).display), 'none');
    const host = await ctx.newPage();
    await host.route('**/host.html', r => r.fulfill({ contentType: 'text/html', body: '<!doctype html><body><button id="b" data-easygames="chat" data-mode="overlay">x</button><div id="in" data-easygames="chat" data-room="g-snake"></div><script src="/easygames.js"></script>' }));
    await host.goto(base.replace(/\/$/, '') + '/host.html');
    await host.waitForSelector('#in iframe');
    assert.match(await host.$eval('#in iframe', f => f.src), /chat\.html\?embed=1&room=g-snake$/);
    await host.click('#b'); await host.waitForSelector('[role=dialog] iframe');
    assert.match(await host.$eval('[role=dialog] iframe', f => f.src), /chat\.html\?embed=1$/);
    await host.evaluate(() => EasyGames.close()); await host.evaluate(() => EasyGames.open('chat', { room: 'tipps' }));
    assert.match(await host.$eval('[role=dialog] iframe', f => f.src), /chat\.html\?embed=1&room=tipps$/);
    console.log('PASS Einbettung: data-easygames="chat" (inline mit Raum, Overlay) und EasyGames.open(\'chat\')');
    await page.goto(base + 'index.html');
    assert.equal(await page.$eval('#lChat', a => a.getAttribute('href')), 'chat.html');
    console.log('PASS Hub: Link „💬 Chat“ vorhanden');
    assert.deepEqual(errors, [], 'Seitenfehler: ' + errors.join('; '));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
