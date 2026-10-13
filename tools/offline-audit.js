#!/usr/bin/env node
// Prüft, ob jedes Spiel NUR mit dem Offline-Paket (sync/manifest.json) lädt: Alle Dateien kommen aus dem Paket,
// Bibliotheken von CDNs werden über die Vendor-Zuordnung bedient, alles andere Externe gilt als "braucht Internet".
//   node tools/offline-audit.js [spiel-id …]      (benötigt Playwright + Chromium)
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
const root = path.resolve(__dirname, '..');
function pw() { for (const p of ['playwright', '/opt/node-tools/node_modules/playwright']) { try { return require(p); } catch (e) {} } throw new Error('Playwright nicht gefunden'); }
const { chromium } = pw();
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'sync/manifest.json'), 'utf8'));
const inPack = new Set(manifest.files.map(f => f.p));
const MIME = { html: 'text/html', js: 'text/javascript', mjs: 'text/javascript', css: 'text/css', json: 'application/json', wasm: 'application/wasm', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', svg: 'image/svg+xml', mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav', woff2: 'font/woff2', glb: 'model/gltf-binary' };
const mime = p => MIME[p.split('.').pop().toLowerCase()] || 'application/octet-stream';

const games = (() => { const w = {}; w.window = w; require('vm').runInNewContext(fs.readFileSync(path.join(root, 'games.js'), 'utf8') + '\nthis.G = GAMES;', w); return w.G; })();
const only = process.argv.slice(2), todo = games.filter(g => !only.length || only.includes(g.id));

const server = http.createServer((req, res) => {      // liefert NUR Dateien aus dem Paket
  let p = decodeURIComponent(req.url.split('?')[0].replace(/^\/easygames\//, '')); if (p === '' || p.endsWith('/')) p += 'index.html';
  if (!inPack.has(p)) { res.writeHead(404); res.end('nicht im Paket'); return; }
  res.writeHead(200, { 'content-type': mime(p), 'access-control-allow-origin': '*' }); fs.createReadStream(path.join(root, p)).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}/easygames/`;
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  let bad = 0; const online = new Map();
  for (const g of todo) {
    if (/^[a-z]+:\/\//i.test(g.path)) continue;
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } }), page = await ctx.newPage();
    const miss = [], errs = [], ext = new Set(), hits = new Set();
    await page.route(u => !u.href.startsWith(base), route => {
      const url = route.request().url(), noq = url.split('?')[0], v = manifest.vendor[url] || manifest.vendor[noq];
      if (v && inPack.has(v)) { hits.add(v.replace(/^vendor\//, '')); return route.fulfill({ status: 200, contentType: mime(v), headers: { 'access-control-allow-origin': '*' }, body: fs.readFileSync(path.join(root, v)) }); }
      if (/^data:|^blob:/.test(url)) return route.continue();
      ext.add(new URL(url).host); return route.abort('internetdisconnected');   // wie ohne Netz
    });
    // logo.png/.jpg/…: Spiele fragen optionale Logos ab, ein 404 ist dort gewollt
    page.on('response', r => { if (r.url().startsWith(base) && r.status() >= 400 && !/(^|\/)logo\.(png|jpe?g|svg|webp)$/.test(r.url())) miss.push(r.url().slice(base.length)); });
    page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
    await page.goto(base + g.path, { waitUntil: 'load', timeout: 60000 }).catch(e => errs.push('goto: ' + e.message.slice(0, 80)));
    await page.waitForTimeout(g.id === 'anmacha-quest-rpg' ? 12000 : 3500);
    await ctx.close();
    const uniq = [...new Set(miss)];
    ext.forEach(h => { if (!online.has(h)) online.set(h, []); online.get(h).push(g.id); });
    if (uniq.length) bad++;
    console.log((uniq.length ? 'FEHLT ' : 'ok    ') + g.id.padEnd(26) + (uniq.length ? ' 404: ' + uniq.slice(0, 6).join(', ') : '') + (hits.size ? '  vendor: ' + [...hits].join(', ') : '') + (errs.length ? '  [JS-Fehler: ' + [...new Set(errs)].slice(0, 2).join(' | ') + ']' : ''));
  }
  console.log('\nBraucht Internet (nicht offline ersetzbar):'); online.forEach((ids, h) => console.log('  ' + h + ' ← ' + [...new Set(ids)].join(', ')));
  console.log(`\n${todo.length} Spiele geprüft, ${bad} mit fehlenden Dateien`);
  await browser.close(); server.close(); process.exit(bad ? 1 : 0);
})();
