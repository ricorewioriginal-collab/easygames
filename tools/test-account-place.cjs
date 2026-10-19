#!/usr/bin/env node
// Konto-Menü bleibt im Bild: Knopf mitten im Kopf (SenderWelt mobil) → Menü ragt nicht links aus dem Fenster. NODE_PATH=$(npm root -g) node tools/test-account-place.cjs
'use strict';
const path = require('path'), assert = require('assert');
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}), p = await (await b.newContext({ viewport: { width: 360, height: 780 } })).newPage();
  await p.route('http://t.test/', r => r.fulfill({ contentType: 'text/html', body: '<body style="margin:0"><div style="display:flex;justify-content:center;padding:20px"><div id="a"></div></div></body>' }));
  await p.route(/^https?:\/\/(?!t\.test)/, r => r.abort()); await p.goto('http://t.test/');
  await p.evaluate(() => { localStorage.setItem('anmacha-rating-token', 'abc.def'); localStorage.setItem('anmacha-rating-user', JSON.stringify({ name: 'Ricardo Ramon Reimer Wiebe' })); });
  await p.addScriptTag({ path: path.join(__dirname, '../cloud/anmacha-account.js') });
  await p.evaluate(() => { AnMaChaAccount.mount('#a', {}); }); await p.click('#a .eg-acc-b'); await p.waitForSelector('#a .eg-acc-m:not([hidden])');
  const r = await p.evaluate(() => { const m = document.querySelector('#a .eg-acc-m').getBoundingClientRect(); return { l: m.left, r: m.right, vw: innerWidth }; });
  assert.ok(r.l >= 7 && r.r <= r.vw - 7, 'Menü im Bild: ' + JSON.stringify(r));
  console.log('PASS Konto-Menü mit Knopf mitten im Kopf bleibt im Bild (' + Math.round(r.l) + '–' + Math.round(r.r) + ' von ' + r.vw + ' px)');
  await b.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
