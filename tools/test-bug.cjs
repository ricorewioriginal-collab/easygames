#!/usr/bin/env node
// Browser-Test der Fehlermeldung (bug.html) mit simuliertem Firestore und Google-Login (App-Modus): Anmeldung, Senden, Prüfung, Flutschutz, GitHub-Ausweg,
// Betreiber-Liste, Einbettung, Hub-Link, Zeile im Cloud-Fenster der Spiele.  Aufruf: node tools/test-bug.cjs
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
    const db = { sent: [], admin: false, deleted: [], bugs: [{ id: 'b1', u: 'u7', g: 'snake', c: 'ton', x: 'Kein Ton im Menü', t: new Date().toISOString() }] };
    await ctx.route(/gstatic\.com/, r => r.abort());
    await ctx.route(/securetoken\.googleapis\.com/, r => json(r, { id_token: 'tok', user_id: 'u1', expires_in: '3600', refresh_token: 'rt1' }));
    await ctx.route(/identitytoolkit\.googleapis\.com/, r => json(r, { users: [{ displayName: 'Rico Test', email: 'rico@example.test', photoUrl: '' }] }));
    await ctx.route(/firestore\.googleapis\.com/, r => {
      const req = r.request(), u = req.url(), m = req.method(), body = req.postData() ? JSON.parse(req.postData()) : null;
      if (/documents:commit$/.test(u)) { db.sent.push(body); return json(r, {}); }
      if (/documents:runQuery$/.test(u)) {
        const c = body.structuredQuery.from[0].collectionId;
        return json(r, c === 'bugs' ? db.bugs.map(x => ({ document: { name: 'p/documents/bugs/' + x.id, fields: { u: { stringValue: x.u }, g: { stringValue: x.g }, c: { stringValue: x.c }, x: { stringValue: x.x }, t: { timestampValue: x.t } } } })) : [{ document: { name: 'p/documents/chat_reports/r1', fields: { room: { stringValue: 'lobby' }, m: { stringValue: 'm1' }, u: { stringValue: 'u3' }, x: { stringValue: 'böse Nachricht' }, r: { stringValue: 'u2' }, t: { timestampValue: new Date().toISOString() } } } }]);
      }
      if (m === 'DELETE') { db.deleted.push(u); return json(r, {}); }
      if (/\/chat_admin\//.test(u)) return db.admin ? json(r, { fields: {} }) : json(r, {}, 404);
      return json(r, {}, 404);
    });
    const errors = [], page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));

    // 1) abgemeldet: nur Anmeldung, GitHub-Ausweg immer da
    await page.goto(base + 'bug.html?game=snake');
    await page.waitForSelector('#gate:not([hidden])');
    assert(await page.$eval('#formBox', e => e.hidden));
    assert.match(await page.$eval('#gh', a => a.href), /github\.com\/ricorewioriginal-collab\/easygames\/issues\/new\?title=/);
    console.log('PASS Abgemeldet: nur Anmeldung, GitHub-Ausweg vorhanden');

    // 2) angemeldet: Formular mit vorgewähltem Spiel, Prüfung, Senden, Flutschutz
    await page.evaluate(() => { localStorage.setItem('anmacha-cloud-on', '1'); localStorage.setItem('anmacha-cloud-rt', 'rt0'); });
    await page.reload(); await page.waitForSelector('#formBox:not([hidden])');
    assert.equal(await page.$eval('#game', s => s.value), 'snake', 'Spiel aus ?game= vorgewählt');
    assert.match(await page.$eval('#info', e => e.textContent), /"app":true/);
    await page.fill('#text', 'kurz'); await page.click('#send');
    assert.match(await page.$eval('#err', e => e.textContent), /mindestens 10/); assert.equal(db.sent.length, 0);
    await page.selectOption('#kind', 'steuerung'); await page.fill('#text', 'Die Schlange reagiert nicht auf Wischen.'); await page.click('#send');
    await page.waitForSelector('#done:not([hidden])');
    assert.equal(db.sent.length, 1);
    const w = db.sent[0].writes, f = w[0].update.fields;
    assert.equal(w.length, 2); assert(/bug_last\//.test(w[1].update.name)); assert.equal(w[0].updateTransforms[0].setToServerValue, 'REQUEST_TIME');
    assert.deepEqual([f.u.stringValue, f.g.stringValue, f.c.stringValue, f.x.stringValue], ['u1', 'snake', 'steuerung', 'Die Schlange reagiert nicht auf Wischen.']);
    assert(f.i && JSON.parse(f.i.stringValue).app === true, 'technische Angaben dabei'); assert(!/rico@example|Rico Test/.test(JSON.stringify(db.sent[0])), 'keine Konto-Daten');
    await page.click('#again'); await page.fill('#text', 'Noch ein Fehler in diesem Spiel.'); await page.click('#send');
    assert.match(await page.$eval('#err', e => e.textContent), /kurz warten/); assert.equal(db.sent.length, 1, 'zweite Meldung sofort: nicht gesendet');
    console.log('PASS Melden: Prüfung, Senden mit Flutschutz-Dokument, keine Konto-Daten, Wartezeit');

    // 3) ohne technische Angaben, GitHub-Link folgt dem Formular
    await page.uncheck('#withInfo');
    assert.doesNotMatch(decodeURIComponent(await page.$eval('#gh', a => a.href)), /Technische Angaben/);
    await page.check('#withInfo'); assert.match(decodeURIComponent(await page.$eval('#gh', a => a.href)), /Noch ein Fehler in diesem Spiel/);
    console.log('PASS Mitsenden abwählbar, GitHub-Ausweg mit vorausgefülltem Text');

    // 4) Betreiber sieht und erledigt Meldungen
    assert(await page.$eval('#adm', e => e.hidden), 'normale Spieler sehen keine Liste');
    db.admin = true; await page.reload(); await page.waitForSelector('#adm:not([hidden])'); await page.waitForSelector('#admList .it');
    assert.match(await page.$eval('#admList', e => e.textContent), /Kein Ton im Menü/);
    await page.click('#admTabs [data-c=chat_reports]'); await page.waitForFunction(() => /böse Nachricht/.test(document.getElementById('admList').textContent));
    await page.click('#admTabs [data-c=bugs]'); await page.waitForSelector('#admList .it button'); await page.click('#admList .it button');
    await page.waitForFunction(() => !document.querySelector('#admList .it'));
    assert(db.deleted.some(u => /\/bugs\/b1$/.test(u)));
    console.log('PASS Betreiber: Fehler und Chat-Meldungen lesen, erledigen');

    // 5) Spiel: Cloud-Fenster verweist auf die Meldung mit vorgewähltem Spiel
    await page.goto(base + 'wobbel/');
    await page.waitForFunction(() => window.AnMaChaCloud && window.AnMaChaCloud.user && window.AnMaChaCloud.user(), null, { timeout: 15000 });
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => /Fehler melden/.test(b.textContent)), null, { timeout: 5000 });
    await page.evaluate(() => [...document.querySelectorAll('button')].find(b => /Fehler melden/.test(b.textContent)).click());
    await page.waitForURL(/bug\.html\?game=/); assert.match(page.url(), /game=wobbel/);
    console.log('PASS Spiel: Cloud-Fenster „🐞 Fehler melden“ öffnet die Meldung mit dem Spiel');

    // 6) Einbettung und Hub
    await page.goto(base + 'bug.html?embed=1'); assert.equal(await page.$eval('.back', a => getComputedStyle(a).display), 'none');
    const host = await ctx.newPage();
    await host.route('**/host.html', r => r.fulfill({ contentType: 'text/html', body: '<!doctype html><body><button id="b" data-easygames="bug" data-mode="overlay">x</button><div id="in" data-easygames="bug" data-game="snake"></div><script src="/easygames.js"></script>' }));
    await host.goto(base.replace(/\/$/, '') + '/host.html'); await host.waitForSelector('#in iframe');
    assert.match(await host.$eval('#in iframe', f => f.src), /bug\.html\?embed=1&game=snake$/);
    await host.click('#b'); await host.waitForSelector('[role=dialog] iframe');
    assert.match(await host.$eval('[role=dialog] iframe', f => f.src), /bug\.html\?embed=1$/);
    await host.evaluate(() => EasyGames.close()); await host.evaluate(() => EasyGames.open('bug', { game: 'wobbel' }));
    assert.match(await host.$eval('[role=dialog] iframe', f => f.src), /bug\.html\?embed=1&game=wobbel$/);
    console.log('PASS Einbettung: data-easygames="bug" (inline mit Spiel, Overlay) und EasyGames.open(\'bug\')');
    await page.goto(base + 'index.html'); assert.equal(await page.$eval('#lBug', a => a.getAttribute('href')), 'bug.html');
    console.log('PASS Hub: Link „🐞 Fehler melden“ vorhanden');
    assert.deepEqual(errors, [], 'Seitenfehler: ' + errors.join('; '));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
