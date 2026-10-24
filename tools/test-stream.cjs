#!/usr/bin/env node
// Prüft das Stream-Overlay (stream.html) für OBS / TikTok LIVE: Formate 9:16 und 16:9, scharfe Skalierung (Spiel sieht
// Handy- bzw. PC-Größe mit höherer Pixeldichte), QR-Code, Teilen-Adresse und den Knopf „🎥 Stream“ in easygames.js.
// Aufruf: node tools/test-stream.cjs
'use strict';
const http = require('node:http'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const mime = { html: 'text/html', js: 'text/javascript', json: 'application/json', css: 'text/css', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = path.join(root, u === '/' ? 'index.html' : u);
  if (f.endsWith(path.sep) || (fs.existsSync(f) && fs.statSync(f).isDirectory())) f = path.join(f, 'index.html');
  if (!f.startsWith(root) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': mime[f.split('.').pop()] || 'application/octet-stream' }); res.end(fs.readFileSync(f));
});
(async () => {
  await new Promise(r => server.listen(0, r));
  const base = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await chromium.launch();
  try {
    const cases = [
      { q: 'game=anmacha-snake', vw: 1080, vh: 1920, inner: [432, null], qr: true },
      { q: 'game=anmacha-snake&format=16x9&layout=full', vw: 1920, vh: 1080, inner: [1280, 720], qr: false },
      { q: 'game=anmacha-snake&layout=badge&bg=clear&share=' + encodeURIComponent('https://example.org/#games/{id}'), vw: 1080, vh: 1920, inner: [432, 768], qr: true, share: 'https://example.org/#games/anmacha-snake' }
    ];
    for (const c of cases) {
      const ctx = await browser.newContext({ viewport: { width: c.vw, height: c.vh } });
      await ctx.route(/firestore\.googleapis\.com|gstatic\.com/, r => r.abort());
      const p = await ctx.newPage();
      await p.goto(base + 'stream.html?' + c.q);
      await p.waitForSelector('#game');
      const fr = await (await p.$('#game')).contentFrame(); await fr.waitForLoadState('domcontentloaded');
      const [w, h, dpr] = await fr.evaluate(() => [innerWidth, innerHeight, devicePixelRatio]);
      assert.equal(w, c.inner[0], c.q + ': Spielbreite'); if (c.inner[1]) assert.equal(h, c.inner[1], c.q + ': Spielhöhe');
      assert.ok(Math.abs(dpr - c.vw / c.inner[0]) < 0.01, c.q + ': Spiel wird scharf skaliert (Pixeldichte ' + dpr + ')');
      if (c.qr) await p.waitForSelector('.qr svg', { timeout: 5000 }); else assert.equal(await p.$('.qr'), null, c.q + ': ohne QR');
      if (c.share) assert.ok((await (await p.$('#game')).getAttribute('src')).includes('eg_share=' + encodeURIComponent(c.share)), 'Teilen-Adresse geht an das Spiel');
      if (/bg=clear/.test(c.q)) assert.equal(await p.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgba(0, 0, 0, 0)', 'durchsichtiger Hintergrund');
      console.log('PASS ' + c.q.replace(/&share=.*/, '&share=…') + ` → Spiel ${w}×${h} @${dpr}x`);
      await ctx.close();
    }
    // ohne Spiel: Auswahl
    const p = await browser.newPage(); await p.goto(base + 'stream.html');
    assert.ok(await p.$$eval('#pick a', a => a.length) > 10, 'Spielauswahl ohne game='); console.log('PASS Auswahl ohne Spiel');
    // easygames.js: Adresse und Knopf „🎥 Stream“ im Overlay
    await p.route('**/host.html', r => r.fulfill({ contentType: 'text/html', body: '<!doctype html><body><button id="b" data-easygames="anmacha-snake" data-mode="overlay" data-fullscreen="false">Snake</button><script src="/easygames.js"></script>' }));
    await p.goto(base + 'host.html');
    const u = await p.evaluate(() => EasyGames.streamUrl('anmacha-snake', { format: '16x9', layout: 'badge' }));
    assert.match(u, /stream\.html\?game=anmacha-snake&format=16x9&layout=badge$/); console.log('PASS EasyGames.streamUrl');
    await p.click('#b'); await p.waitForSelector('[role=dialog] iframe');
    assert.ok(await p.$('[role=dialog] button[title^="Als Stream-Overlay"]'), 'Knopf „🎥 Stream“ im Overlay'); console.log('PASS Knopf „🎥 Stream“ im Overlay');
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error('FEHLER', e.message); process.exit(1); });
