// Alle Spiele so laden, wie die Windows-App sie ausliefert – ohne Internet: Dateien aus dem easygames-Stand (wie die App sie von
// GitHub lädt), CDN-Adressen aus vendor/ (Zuordnung „vendor“ in sync/manifest.json, wie Host.Serve), Service Worker gesperrt
// (Host.NativeScript). Meldet fehlende Dateien, Skripte von fremden Servern und Skriptfehler beim Start.
//   NODE_PATH=$(npm root -g) node windows/tests/games-offline.cjs [spiel-id …]
const path = require('path'), fs = require('fs'), http = require('http');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..', '..');
const man = JSON.parse(fs.readFileSync(path.join(ROOT, 'sync', 'manifest.json'), 'utf8'));
const cat = JSON.parse(fs.readFileSync(path.join(ROOT, 'sync', 'catalog.json'), 'utf8'));
const files = new Set(man.files.map(f => f.p)), vendor = man.vendor || {};
const host = fs.readFileSync(path.join(__dirname, '..', 'Host.cs'), 'utf8');
const NATIVE = JSON.parse(host.match(/public const string NativeScript = ([\s\S]*?);\r?\n/)[1].split(/"\s*\+\s*"/).join('').replace(/^"/, '"'));
const only = process.argv.slice(2);
const games = cat.games.filter(g => !only.length || only.includes(g.id));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.wasm': 'application/wasm', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary' };
const bare = u => u.replace(/[?#].*$/, '');

(async () => {
  // Nur Dateien aus der Dateiliste ausliefern (genau das hat die App nach dem Laden)
  const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]).replace(/^\//, '');
    if (p === '' || p.endsWith('/')) p += 'index.html';
    if (!files.has(p)) { r.statusCode = 404; return r.end(); }
    r.setHeader('Content-Type', MIME[path.extname(p)] || 'application/octet-stream');
    r.end(fs.readFileSync(path.join(ROOT, p)));
  }).listen(0);
  const own = '127.0.0.1:' + srv.address().port;
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  let bad = 0;
  for (const g of games) {
    const ctx = await b.newContext({ serviceWorkers: 'allow' });
    await ctx.addInitScript(NATIVE);
    const miss = new Set(), ext = new Set(), errs = [];
    await ctx.route(u => new URL(u).host !== own, r => {
      const u = r.request().url(), local = vendor[u] || vendor[bare(u)] || Object.entries(vendor).find(([k]) => bare(k) === bare(u))?.[1];
      if (local) return r.fulfill({ path: path.join(ROOT, local), contentType: MIME[path.extname(local)] || 'application/octet-stream', headers: { 'Access-Control-Allow-Origin': '*' } });
      if (['script', 'stylesheet', 'font'].includes(r.request().resourceType())) ext.add(u.slice(0, 90));
      return r.abort();
    });
    const p = await ctx.newPage();
    p.on('response', r => { const u = new URL(r.url()); if (u.host === own && r.status() >= 400 && !/\/(logo|\d{1,3})\.(png|jpe?g|svg|webp)$/.test(u.pathname)) miss.add(u.pathname); });
    p.on('pageerror', e => errs.push(String(e.message).slice(0, 100)));
    await p.goto('http://' + own + '/' + g.path.replace(/\/?$/, '/') + 'index.html', { waitUntil: 'load', timeout: 45000 }).catch(e => errs.push('Laden: ' + e.message.slice(0, 60)));
    await p.waitForTimeout(1500);
    const sw = await p.evaluate(() => navigator.serviceWorker ? navigator.serviceWorker.getRegistrations().then(l => l.length) : 0).catch(() => 0);
    const problems = [...miss].map(m => 'fehlt ' + m).concat([...ext].map(e => 'extern ' + e), sw ? ['Service Worker aktiv'] : []);
    if (problems.length) bad++;
    console.log((problems.length ? 'FAIL ' : 'ok   ') + g.id.padEnd(26) + problems.slice(0, 3).join(' | ') + (errs.length ? '   (Skriptfehler: ' + errs[0] + ')' : ''));
    await ctx.close();
  }
  await b.close(); srv.close();
  console.log(bad ? bad + ' Spiel(e) mit Problemen' : 'Alle Spiele laufen in der Windows-App offline (Dateien, Bibliotheken, ohne Service Worker).');
  process.exit(bad ? 1 : 0);
})();
