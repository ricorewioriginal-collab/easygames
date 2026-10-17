#!/usr/bin/env node
// 1) Statisch für ALLE lokalen Spiele aus games.js: Seite bindet das Cloud-Skript ein, der Pfad stimmt, data-game und data-prefix (bzw. data-idb) sind gesetzt.
// 2) Im Browser für ausgewählte Spiele: Skript lädt (200, keine Skriptfehler vom Skript), Google-Knopf erscheint, Speicherstand wird erfasst.
// Spiele, die bewusst keine Cloud-Anbindung haben, stehen in NO_CLOUD.
//   NODE_PATH=$(npm root -g) node tools/test-cloud-games.cjs [spiel …]      (braucht playwright + Chromium)
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), vm = require('vm');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const NO_CLOUD = [];   // bewusst ohne Google-Speichern (Spiel-IDs)
let fails = 0;
function staticAudit() {
  const w = { window: {} }; vm.createContext(w);
  vm.runInContext(fs.readFileSync(path.join(root, 'games.js'), 'utf8') + ";this.G=(typeof GAMES!=='undefined'?GAMES:window.EASYGAMES_GAMES)", w);
  let n = 0;
  for (const g of w.G) {
    if (/^[a-z]+:\/\//.test(g.path) || NO_CLOUD.includes(g.id)) continue;
    const dir = g.path.replace(/\/?$/, '/'); let file = path.join(root, dir, 'index.html'), problems = [];
    if (!fs.existsSync(file)) { console.log('FEHLER ' + g.id + ': ' + dir + 'index.html fehlt'); fails++; continue; }
    let html = fs.readFileSync(file, 'utf8');
    const refresh = /http-equiv="refresh"[^>]*url=([^"]+)"/i.exec(html);   // Wrapper, der auf app/ weiterleitet
    if (refresh) { file = path.join(root, dir, refresh[1], 'index.html'); html = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''; }
    const tag = /<script[^>]*anmacha-cloud[^>]*>/.exec(html);
    if (!tag) problems.push('kein Cloud-Skript');
    else {
      const src = /src="([^"]+)"/.exec(tag[0]); const abs = src && path.resolve(path.dirname(file), src[1].split('?')[0]);
      if (!abs || !fs.existsSync(abs)) problems.push('Skriptpfad stimmt nicht: ' + (src && src[1]));
      if (!/data-game="[^"]+"/.test(tag[0])) problems.push('data-game fehlt');
      if (!/data-prefix="[^",\s][^"]*"/.test(tag[0]) && !/data-idb="[^"]+"/.test(tag[0])) problems.push('weder data-prefix noch data-idb');
    }
    if (problems.length) { console.log('FEHLER ' + g.id.padEnd(26) + problems.join('; ') + '  (' + path.relative(root, file) + ')'); fails++; }
    n++;
  }
  console.log((fails ? 'FEHLER' : 'OK    ') + ' Statische Prüfung: ' + n + ' Spiele binden das Cloud-Skript korrekt ein');
}
staticAudit();
// Schlüssel, die das Spiel wirklich nutzt: nach dem Speichern muss das Skript sie in seinen Zeitstempeln (anmacha-cloud-meta:<spiel>) führen
const KEYS = { riftzone: ['riftzone.profile', 'riftzone'], turbokick: ['turbokick.save', 'turbokick'], partyverse: ['partyverse.save', 'partyverse'], aeru: ['aeru-save-v1', 'aeru'], prismrush: ['prismrush.save.v1', 'prismrush'], kiko: ['kiko-sterneninseln-v1', 'kiko-sterneninseln'], ricoville: ['ricoville.save.main', 'ricoville'] };
const GAMES = { riftzone: 'riftzone/app/', turbokick: 'turbokick/app/', partyverse: 'partyverse/app/', aeru: 'aeru/', prismrush: 'prismrush/', kiko: 'kiko-sterneninseln/', ricoville: 'ricoville/' };
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webmanifest': 'application/manifest+json', '.wasm': 'application/wasm', '.bin': 'application/octet-stream', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg' };
const srv = http.createServer((req, res) => {
  let f = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const base = 'http://127.0.0.1:' + srv.address().port;
  const b = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(GAMES);
  for (const id of want) {
    const p = await (await b.newContext({ viewport: { width: 900, height: 600 } })).newPage();
    let cloud = 0; const errs = [];
    p.on('response', r => { if (/anmacha-cloud\.js/.test(r.url())) cloud = r.status(); });
    p.on('pageerror', e => { if (/anmacha|cloud/i.test(e.stack || e.message)) errs.push(e.message); });
    await p.goto(base + '/' + GAMES[id], { waitUntil: 'domcontentloaded' }).catch(() => {});
    await p.waitForTimeout(3500);
    await p.waitForLoadState('load').catch(() => {}); await p.waitForTimeout(500);
    const btn = await p.evaluate(() => !!Array.from(document.querySelectorAll('button')).find(b => /google|speicher|cloud/i.test((b.title || '') + (b.getAttribute('aria-label') || '') + b.textContent) || (b.style.cssText.includes('left: 8px') && b.style.cssText.includes('bottom: 8px'))) || !!document.querySelector('[data-anmacha-cloud],#anmacha-cloud')).catch(() => false);
    const [key, game] = KEYS[id];
    const tracked = await p.evaluate(([k, g]) => { try { localStorage.setItem(k, JSON.stringify({ t: 1 })); const m = localStorage.getItem('anmacha-cloud-meta:' + g) || ''; return m.indexOf(k) >= 0; } catch (e) { return false; } }, [key, game]).catch(() => false);
    // Gegenprobe: Sitzungsdaten ohne Speicherstand (partyverse.reconnect, riftzone.reconnect) dürfen nicht in die Cloud wandern
    const SESSION = { partyverse: 'partyverse.reconnect', riftzone: 'riftzone.reconnect', ricoville: 'ricoville.settings' }[id];
    const leaked = SESSION ? await p.evaluate(([k, g]) => { try { localStorage.setItem(k, 'x'); return (localStorage.getItem('anmacha-cloud-meta:' + g) || '').indexOf(k) >= 0; } catch (e) { return false; } }, [SESSION, id]).catch(() => false) : false;
    const ok = cloud === 200 && !errs.length && tracked && !leaked && btn;
    console.log((ok ? 'OK    ' : 'FEHLER') + ' ' + id.padEnd(14) + ' Skript ' + cloud + (tracked ? ', Speicherstand wird erfasst' : ', Speicherstand NICHT erfasst') + (btn ? ', Knopf sichtbar' : ', (Knopf nicht erkannt)') + (errs.length ? ' Fehler: ' + errs[0] : ''));
    if (!ok) fails++;
    await p.context().close();
  }
  await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})();
