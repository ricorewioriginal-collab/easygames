#!/usr/bin/env node
// Prüft den Rückweg aus eingebetteten Spielen: „← Alle Spiele“ im Spiel schließt das Overlay des Gastgebers (statt die Bibliothek im Rahmen zu öffnen).
// Aufruf: node tools/test-embed-back.cjs
'use strict';
const http = require('node:http'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const mime = { html: 'text/html', js: 'text/javascript', json: 'application/json', css: 'text/css', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg' };
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
    const ctx = await browser.newContext({ viewport: { width: 420, height: 800 } });
    await ctx.route(/firestore\.googleapis\.com|gstatic\.com/, r => r.abort());
    const host = await ctx.newPage();
    await host.route('**/host.html', r => r.fulfill({ contentType: 'text/html', body: '<!doctype html><body><button id="b" data-easygames="anmacha-snake" data-mode="overlay" data-fullscreen="false">Snake</button><div id="in" data-easygames="anmacha-snake"></div><script src="/easygames.js"></script>' }));
    await host.goto(base.replace(/\/$/, '') + '/host.html');

    // Overlay: Zurück-Link im Spiel schließt das Overlay, die Gastgeber-Seite bleibt
    await host.waitForSelector('#b'); await host.click('#b');
    await host.waitForSelector('[role=dialog] iframe');
    const fr = await (await host.$('[role=dialog] iframe')).contentFrame();
    await fr.waitForSelector('#backLink');
    await fr.click('#backLink');
    await host.waitForFunction(() => !document.querySelector('[role=dialog]'), null, { timeout: 5000 });
    assert(await host.$('#b'), 'Gastgeber-Seite ist wieder da');
    console.log('PASS Overlay: „← Alle Spiele“ im Spiel schließt das Overlay und zeigt wieder die Seite des Gastgebers');

    // fest eingebetteter Rahmen: statt der ganzen Bibliothek erscheint die eingebettete Liste (?embed=1)
    const inl = await (await host.$('#in iframe')).contentFrame();
    await inl.waitForSelector('#backLink', { state: 'attached' }); await inl.evaluate(() => document.getElementById('backLink').click());
    await host.waitForFunction(() => { const f = document.querySelector('#in iframe'); try { return /[?&]embed=1/.test(f.contentWindow.location.search); } catch (e) { return false; } }, null, { timeout: 8000 });
    console.log('PASS Eingebetteter Rahmen: Zurück öffnet die eingebettete Spieleliste statt der ganzen Seite');

    // Bibliothek allein (nicht im Rahmen) bleibt unverändert
    const solo = await ctx.newPage(); await solo.goto(base + 'index.html');
    await solo.waitForTimeout(800);
    assert(!/embed/.test(solo.url()), 'Hub allein wird nicht umgeleitet');
    console.log('PASS Hub allein: keine Umleitung');
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
