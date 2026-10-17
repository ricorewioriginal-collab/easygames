#!/usr/bin/env node
// Browser-Test der Spiele-Verwaltung (verwaltung.html) mit simuliertem Firestore und Google-Login (App-Modus): Zugriff nur für das Betreiber-Konto,
// Spiele ausblenden/Hinweise speichern, Fehler, Chat-Moderation, Ranglisten, Wirkung auf die Spieleliste.  Aufruf: node tools/test-verwaltung.cjs
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
    const mail = { v: 'ricorewioriginal@gmail.com' };
    const ctx = await browser.newContext({ viewport: { width: 1000, height: 900 }, userAgent: 'Mozilla/5.0 EasyGamesApp/1.0' });
    const json = (r, o, status) => r.fulfill({ status: status || 200, contentType: 'application/json', body: JSON.stringify(o) });
    const now = () => new Date().toISOString(), S = s => ({ stringValue: s });
    const db = { cfg: { hide: ['anmacha-snake'], note: {} }, words: { bad: ['blödmann'], ok: [] }, wordsPatched: [], patched: [], deleted: [], bans: [], commits: [],
      bugs: [{ id: 'b1', f: { u: S('u7'), g: S('snake'), c: S('ton'), x: S('Kein Ton im Menü'), t: { timestampValue: now() } } }, { id: 'b2', f: { u: S('u8'), g: S('wobbel'), c: S('anzeige'), x: S('Level 3 flackert'), t: { timestampValue: now() } } }] };
    await ctx.route(/gstatic\.com/, r => r.abort());
    await ctx.route(/securetoken\.googleapis\.com/, r => json(r, { id_token: 'tok', user_id: 'adm', expires_in: '3600', refresh_token: 'rt1' }));
    await ctx.route(/identitytoolkit\.googleapis\.com/, r => json(r, { users: [{ displayName: 'Rico', email: mail.v, photoUrl: '' }] }));
    const docs = (coll, list) => list.map(x => ({ document: { name: 'p/documents/' + coll + '/' + x.id, fields: x.f } }));
    await ctx.route(/firestore\.googleapis\.com/, r => {
      const req = r.request(), u = req.url(), m = req.method(), body = req.postData() ? JSON.parse(req.postData()) : null;
      if (/documents\/config\/games$/.test(u)) {
        if (m === 'PATCH') { db.patched.push(JSON.parse(body.fields.d.stringValue)); db.cfg = db.patched[db.patched.length - 1]; return json(r, {}); }
        return json(r, { fields: { d: S(JSON.stringify(db.cfg)) } });
      }
      if (/documents\/config\/words$/.test(u)) {
        if (m === 'PATCH') { db.words = JSON.parse(body.fields.d.stringValue); db.wordsPatched.push(db.words); return json(r, {}); }
        return json(r, { fields: { d: S(JSON.stringify(db.words)) } });
      }
      if (/:runQuery$/.test(u)) {
        const coll = body.structuredQuery.from[0].collectionId;
        if (coll === 'stats') return json(r, docs('stats', [
          { id: 'snake_20261017_u1', f: { g: S('snake'), d: { integerValue: '20261017' }, s: { integerValue: '3' }, t: { integerValue: '600' }, a: { integerValue: '1' } } },
          { id: 'snake_20261017_u2', f: { g: S('snake'), d: { integerValue: '20261017' }, s: { integerValue: '1' }, t: { integerValue: '300' }, a: { integerValue: '0' } } },
          { id: 'wobbel_20261016_u1', f: { g: S('wobbel'), d: { integerValue: '20261016' }, s: { integerValue: '2' }, t: { integerValue: '240' }, a: { integerValue: '0' } } }]));
        if (coll === 'bugs') return json(r, docs('bugs', db.bugs));
        if (coll === 'chat_reports') return json(r, docs('chat_reports', [{ id: 'r1', f: { room: S('lobby'), m: S('m1'), u: S('u3'), x: S('böse Nachricht'), r: S('u2'), t: { timestampValue: now() } } }]));
        if (coll === 'chat_ban') return json(r, docs('chat_ban', [{ id: 'u9', f: { t: { timestampValue: now() } } }]));
        if (coll === 'chat_online') return json(r, docs('chat_online', [{ id: 'u8', f: { n: S('Ben'), t: { timestampValue: now() } } }]));
        if (coll === 'e') return json(r, docs('e', [{ id: 'p1', f: { n: S('Spitzname1'), s: { doubleValue: 99 }, o: S('desc'), t: { integerValue: String(Date.now()) } } }]));
        if (coll === 'm') return json(r, docs('m', [{ id: 'x1', f: { u: S('u4'), n: S('Anna'), x: S('Hallo Raum'), t: { timestampValue: now() } } }]));
      }
      if (/documents:commit$/.test(u)) { db.commits.push(body); return json(r, {}); }
      if (m === 'DELETE') { db.deleted.push(u); return json(r, {}); }
      return json(r, {}, 404);
    });
    const errors = [], page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());

    // 1) abgemeldet: nur Anmeldung
    await page.goto(base + 'verwaltung.html');
    await page.waitForSelector('#gate:not([hidden])'); assert(await page.$eval('#app', e => e.hidden));
    // 2) fremdes Konto: kein Zugriff
    mail.v = 'jemand@example.test';
    await page.evaluate(() => { localStorage.setItem('anmacha-cloud-on', '1'); localStorage.setItem('anmacha-cloud-rt', 'rt0'); });
    await page.reload(); await page.waitForSelector('#deny:not([hidden])'); assert(await page.$eval('#app', e => e.hidden));
    console.log('PASS Zugriff: abgemeldet nur Anmeldung, fremdes Konto bekommt „Kein Zugriff“');

    // 3) Betreiber: Übersicht mit Zählern
    mail.v = 'ricorewioriginal@gmail.com'; await page.reload(); await page.waitForSelector('#app:not([hidden])'); await page.waitForSelector('#stats div');
    await page.waitForFunction(() => /Fehlermeldungen/.test(document.getElementById('stats').textContent));
    assert.match(await page.$eval('#stats', e => e.textContent), /2🐞 Fehlermeldungen/); assert.match(await page.$eval('#stats', e => e.textContent), /1💬 jetzt im Chat/);
    console.log('PASS Betreiber: Übersicht mit Zählern');

    // 4) Spiele: ausblenden, Hinweis, speichern
    await page.click('#tabs [data-t=games]'); await page.waitForSelector('#gBody tr');
    assert((await page.$$eval('#gBody tr', t => t.length)) >= 40, 'alle Spiele gelistet');
    await page.fill('#gq', 'snake'); assert.equal(await page.$$eval('#gBody tr', t => t.length), 1);
    assert.equal(await page.$eval('#gBody tr .sw', c => c.checked), false, 'Snake ist laut Konfiguration ausgeblendet');
    await page.check('#gBody tr .sw'); await page.fill('#gq', 'memory'); await page.fill('#gBody tr input[type=text]', 'Wartung bis morgen'); await page.uncheck('#gBody tr .sw');
    await page.click('#gSave'); await page.waitForFunction(() => /Gespeichert/.test(document.getElementById('toast').textContent));
    assert.deepEqual(db.patched.at(-1).hide, ['anmacha-memory']); assert.equal(db.patched.at(-1).note['anmacha-memory'], 'Wartung bis morgen');
    console.log('PASS Spiele: Sichtbarkeit und Wartungshinweis speichern');

    // 4b) Zeitplan: Sichtbar ab/bis je Spiel
    await page.click('#tabs [data-t=games]'); await page.waitForSelector('#gBody tr'); await page.fill('#gq', 'memory');
    const when = '2030-01-02T10:30'; await page.fill('#gBody tr input[type=datetime-local] >> nth=0', when); await page.dispatchEvent('#gBody tr input[type=datetime-local] >> nth=0', 'change');
    const nPatch = db.patched.length;   // der Hinweis „Gespeichert“ vom vorigen Speichern steht noch: auf das neue Schreiben warten
    await page.click('#gSave'); for (let i = 0; i < 100 && db.patched.length === nPatch; i++) await page.waitForTimeout(50);
    const sch = db.patched.at(-1).sched['anmacha-memory']; assert.equal(new Date(sch.from).getFullYear(), 2030); assert(!sch.until);
    console.log('PASS Zeitplan: „Sichtbar ab“ wird gespeichert');

    // 5) Fehler: Liste, Filter, erledigen
    await page.click('#tabs [data-t=bugs]'); await page.waitForSelector('#bList .it');
    assert.equal(await page.$$eval('#bList .it', t => t.length), 2); await page.selectOption('#bFilter', 'wobbel'); assert.equal(await page.$$eval('#bList .it', t => t.length), 1);
    await page.click('#bList .it .btn.pri'); await page.waitForFunction(() => !document.querySelector('#bList .it'));
    assert(db.deleted.some(u => /\/bugs\/b2$/.test(u)));
    console.log('PASS Fehler: Liste, Filter nach Spiel, erledigen');

    // 5b) Statistik: Summen je Spiel
    await page.click('#tabs [data-t=stats]'); await page.waitForSelector('#sBody tr td:nth-child(2)'); await page.waitForFunction(() => /Sitzungen/.test(document.getElementById('sInfo').textContent));
    const rowsS = await page.$$eval('#sBody tr', t => t.map(r => [...r.children].map(c => c.textContent)));
    assert.match(rowsS[0][0], /snake|Snake/i); assert.equal(rowsS[0][1], '4'); assert.equal(rowsS[0][2], '2'); assert.equal(rowsS[0][3], '3 min 45 s'); assert.equal(rowsS[0][4], '25 %');
    assert.match(await page.$eval('#sInfo', e => e.textContent), /6 Sitzungen/);
    console.log('PASS Statistik: Sitzungen, Spieler, Ø Dauer, Abbruch je Spiel');

    // 5c) Wörter: laden, ausprobieren, speichern
    await page.click('#tabs [data-t=words]'); await page.waitForFunction(() => document.getElementById('wBad').value.includes('blödmann'));
    await page.fill('#wTest', 'du Blödmann'); assert.match(await page.$eval('#wRes', e => e.textContent), /✗/);
    await page.fill('#wBad', 'blödmann\ndoof='); await page.fill('#wOk', 'Klassenarbeit'); await page.fill('#wTest', 'doof'); assert.match(await page.$eval('#wRes', e => e.textContent), /✗/);
    await page.click('#wSave'); await page.waitForFunction(() => /Gespeichert/.test(document.getElementById('toast').textContent));
    assert.deepEqual(db.wordsPatched.at(-1), { bad: ['blödmann', 'doof='], ok: ['Klassenarbeit'] });
    console.log('PASS Wörter: laden, Filter ausprobieren, speichern');

    // 6) Chat: Meldungen, Sperren, Räume
    await page.click('#tabs [data-t=chat]'); await page.waitForSelector('#cBody .it');
    assert.match(await page.$eval('#cBody', e => e.textContent), /böse Nachricht/);
    await page.click('#cBody .it .btn.bad'); // Autor sperren (confirm)
    await page.click('#cTabs [data-c=ban]'); await page.waitForSelector('#cBody .it'); assert.match(await page.$eval('#cBody', e => e.textContent), /u9/);
    await page.click('#cBody .it .btn.pri'); await page.waitForFunction(() => !document.querySelector('#cBody .it')); assert(db.deleted.some(u => /\/chat_ban\/u9$/.test(u)));
    await page.click('#cTabs [data-c=room]'); await page.waitForSelector('#cBody .it'); assert.match(await page.$eval('#cBody', e => e.textContent), /Hallo Raum/);
    console.log('PASS Chat: Meldungen, Sperrliste mit Entsperren, Raum-Ansicht');

    // 7) Ranglisten: Eintrag entfernen
    await page.click('#tabs [data-t=boards]'); await page.waitForSelector('#rList .it');
    assert.match(await page.$eval('#rList', e => e.textContent), /Spitzname1/);
    await page.click('#rList .it .btn.bad'); await page.waitForFunction(() => !document.querySelector('#rList .it'));
    assert(db.deleted.some(u => /\/boards\/[^/]+\/e\/p1$/.test(u)));
    console.log('PASS Ranglisten: Eintrag entfernen');

    // 8) Wirkung auf die Spieleliste (Hub)
    db.cfg = { ...db.cfg, sched: { ...(db.cfg.sched || {}), 'wobbel': { from: Date.now() - 864e5 }, 'anmacha-gold-reels': { until: Date.now() - 1000 } } };
    await page.goto(base + 'index.html'); await page.evaluate(() => localStorage.removeItem('easygames-config')); await page.reload();
    await page.waitForFunction(() => document.querySelector('.maint'), null, { timeout: 8000 });
    assert.match(await page.$eval('.maint', e => e.textContent), /Wartung bis morgen/);
    assert(await page.$('[data-id=anmacha-snake]:not([hidden])'), 'Snake ist wieder sichtbar'); assert.equal(await page.$('[data-id=anmacha-memory]:not([hidden])') ? 1 : 0, 0, 'Memory ist ausgeblendet');
    assert.equal(await page.$eval('[data-id=wobbel] .fresh', e => e.textContent), '🆕 Neu', 'frisch freigeschaltetes Spiel trägt „Neu“'); assert.equal(await page.$('[data-id=anmacha-gold-reels]:not([hidden])') ? 1 : 0, 0, 'abgelaufenes Spiel („bis“) ist ausgeblendet');
    console.log('PASS Spieleliste: Hinweis wird angezeigt, Ausblenden und Einblenden folgen der Konfiguration');
    assert.deepEqual(errors, [], 'Seitenfehler: ' + errors.join('; '));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
