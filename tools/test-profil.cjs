#!/usr/bin/env node
// Browser-Test von Profil, Freunden und Einladungen (profil.html) mit simuliertem Firestore und Google-Login (App-Modus).  Aufruf: node tools/test-profil.cjs
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
    const S = s => ({ stringValue: s }), I = n => ({ integerValue: String(n) }), now = () => new Date().toISOString();
    const db = { profiles: { u2: { n: S('Anna'), e: S('🦊'), r: S('Profi'), p: I(900), a: I(12), g: S('snake,wobbel') } }, friends: {}, invites: [{ id: 'i1', f: { f: S('u2'), n: S('Anna'), g: S('snake'), t: { timestampValue: now() } } }], commits: [], deleted: [] };
    await ctx.route(/gstatic\.com/, r => r.abort());
    await ctx.route(/securetoken\.googleapis\.com/, r => json(r, { id_token: 'tok', user_id: 'u1', expires_in: '3600', refresh_token: 'rt1' }));
    await ctx.route(/identitytoolkit\.googleapis\.com/, r => json(r, { users: [{ displayName: 'Rico', email: 'r@example.test', photoUrl: '' }] }));
    await ctx.route(/firestore\.googleapis\.com/, r => {
      const req = r.request(), u = req.url(), m = req.method(), body = req.postData() ? JSON.parse(req.postData()) : null;
      let x;
      if ((x = /\/profiles\/([A-Za-z0-9]+)$/.exec(u)) && m === 'GET') return db.profiles[x[1]] ? json(r, { fields: db.profiles[x[1]] }) : json(r, {}, 404);
      if ((x = /\/profiles\/([A-Za-z0-9]+)$/.exec(u)) && m === 'DELETE') { delete db.profiles[x[1]]; db.deleted.push(u); return json(r, {}); }
      if (/\/friends\/u1:runQuery$/.test(u)) return json(r, Object.keys(db.friends).map(id => ({ document: { name: 'p/documents/friends/u1/f/' + id, fields: db.friends[id] } })));
      if (/\/invites\/u1:runQuery$/.test(u)) return json(r, db.invites.map(i => ({ document: { name: 'p/documents/invites/u1/i/' + i.id, fields: i.f } })));
      if (/documents:runQuery$/.test(u)) return json(r, [{ document: { name: 'p/documents/chat_online/u2', fields: { n: S('Anna'), t: { timestampValue: now() } } } }]);
      if (/documents:commit$/.test(u)) {
        const w = body.writes[0], name = w.update.name; db.commits.push(body);
        if (/\/profiles\//.test(name)) db.profiles[name.split('/').pop()] = w.update.fields;
        if (/\/friends\/u1\/f\//.test(name)) db.friends[name.split('/').pop()] = w.update.fields;
        return json(r, {});
      }
      if (m === 'DELETE') { db.deleted.push(u); if (/\/invites\//.test(u)) db.invites = []; return json(r, {}); }
      return json(r, {}, 404);
    });
    const errors = [], page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());

    await page.goto(base + 'profil.html'); await page.waitForSelector('#gate:not([hidden])'); assert(await page.$eval('#app', e => e.hidden));
    console.log('PASS Abgemeldet: nur Anmeldung');

    // Profil veröffentlichen (Filter, Emoji, Lieblingsspiele)
    await page.evaluate(() => { localStorage.setItem('anmacha-cloud-on', '1'); localStorage.setItem('anmacha-cloud-rt', 'rt0'); });
    await page.reload(); await page.waitForSelector('#app:not([hidden])'); await page.waitForFunction(() => document.querySelectorAll('#f1 option').length > 5);
    await page.fill('#nick', 'Arschloch'); await page.click('#pub'); assert.match(await page.$eval('#err', e => e.textContent), /freundlich/); assert.equal(db.commits.length, 0, 'gefilterter Name erreicht Firestore nie');
    await page.fill('#nick', 'R'); await page.click('#pub'); assert.match(await page.$eval('#err', e => e.textContent), /2 bis 20/);
    await page.fill('#nick', 'Rico'); await page.click('#emojis button:nth-child(3)'); await page.selectOption('#f1', 'snake'); await page.selectOption('#f2', 'wobbel'); await page.click('#pub');
    await page.waitForFunction(() => /veröffentlicht/.test(document.getElementById('toast').textContent));
    const f = db.commits.at(-1).writes[0].update.fields; assert.deepEqual([f.n.stringValue, f.e.stringValue, f.g.stringValue], ['Rico', '🦊', 'snake,wobbel']); assert(f.r && f.p && f.a, 'Rang, Punkte, Erfolge dabei');
    assert.equal(db.commits.at(-1).writes[0].updateTransforms[0].setToServerValue, 'REQUEST_TIME'); assert(!JSON.stringify(f).includes('example.test'), 'keine Konto-Daten');
    assert.match(await page.$eval('#link', e => e.value), /^https:\/\/ricorewioriginal-collab\.github\.io\/easygames\/profil\.html\?u=u1$/);
    console.log('PASS Profil: Namensfilter, Länge, Avatar, Lieblingsspiele, Rang/Punkte, Link über die easygames-Homepage');

    // Einladungen im Posteingang
    await page.waitForSelector('#invList li .btn.pri'); assert.match(await page.$eval('#invList', e => e.textContent), /Anna lädt dich zu .*ein/); assert.equal(await page.$eval('#invN', e => e.textContent), '1');
    await page.click('#invList li .btn:not(.pri)'); await page.waitForFunction(() => /Keine Einladungen/.test(document.getElementById('invList').textContent));
    console.log('PASS Einladungen: anzeigen, verwerfen');

    // Fremdes Profil: Freund hinzufügen, Freundesliste, einladen
    await page.goto(base + 'profil.html?u=u2'); await page.waitForSelector('#other:not([hidden])'); await page.waitForFunction(() => document.getElementById('oN').textContent === 'Anna');
    assert.match(await page.$eval('#oS', e => e.textContent), /Profi · 900 Punkte · 12 Erfolge/); assert.match(await page.$eval('#oFav', e => e.textContent), /Lieblingsspiele/);
    await page.click('#oAdd'); await page.waitForSelector('#friends li .h b');
    const fw = db.commits.find(c => /\/friends\/u1\/f\/u2$/.test(c.writes[0].update.name)); assert(fw, 'Freund gespeichert'); assert.equal(fw.writes[0].update.fields.n.stringValue, 'Anna');
    await page.waitForFunction(() => /● im Chat/.test(document.getElementById('friends').textContent)); await page.waitForFunction(() => /Profi/.test(document.getElementById('friends').textContent));
    await page.selectOption('#friends li select', 'snake').catch(() => {}); 
    const opt = await page.$$eval('#friends li select option', o => o.map(x => x.value).filter(Boolean)); assert(opt.length > 3, 'nur Mehrspieler-Spiele wählbar'); await page.selectOption('#friends li select', opt[0]); await page.click('#friends li .btn.sm:not(.bad)');
    await page.waitForFunction(() => /Einladung an Anna gesendet/.test(document.getElementById('toast').textContent));
    const iv = db.commits.at(-1).writes; assert.equal(iv.length, 2); assert(/\/invites\/u2\/i\//.test(iv[0].update.name) && /invite_last\/u1$/.test(iv[1].update.name)); assert.equal(iv[0].update.fields.g.stringValue, opt[0]);
    console.log('PASS Freunde: Profil ansehen, hinzufügen, Liste mit Chat-Status, zu einem Spiel einladen (ohne Freitext)');
    await page.click('#friends li .btn.bad'); await page.waitForFunction(() => !document.querySelector('#friends li .h'));
    // Profil entfernen
    await page.goto(base + 'profil.html'); await page.waitForSelector('#unpub:not([hidden])'); await page.click('#unpub'); await page.waitForFunction(() => /entfernt/.test(document.getElementById('toast').textContent)); assert(!db.profiles.u1);
    console.log('PASS Profil entfernen');
    await page.goto(base + 'profil.html?embed=1'); assert.equal(await page.$eval('.back', a => getComputedStyle(a).display), 'none');
    await page.goto(base + 'index.html'); await page.waitForSelector('#acct .eg-acc-b'); await page.click('#acct .eg-acc-b'); await page.waitForSelector('#acct .eg-acc-m:not([hidden]) a[href="profil.html"]');
    assert.deepEqual(errors, [], 'Seitenfehler: ' + errors.join('; '));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
