// Test für egstat.js (anonyme Spielstatistik): Meldung beim Verlassen, Controller, Plattform, Abschalter.
//   NODE_PATH=$(npm root -g) node tools/test-egstat.cjs
const path = require('path'), fs = require('fs'), http = require('http');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHL ') + m); if (!c) fails++; };

(async () => {
  const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); }
    r.setHeader('Content-Type', { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' }[path.extname(f)] || 'application/octet-stream');
    fs.createReadStream(f).pipe(r);
  }).listen(0, '127.0.0.1');
  await new Promise(r => srv.once('listening', r));
  const base = 'http://127.0.0.1:' + srv.address().port;
  const b = await chromium.launch();
  const run = async (url, init = '') => {
    const p = await (await b.newContext()).newPage();
    await p.addInitScript(`window.__beacons = []; navigator.sendBeacon = (u, d) => { window.__beacons.push({ u, d: String(d) }); return true; }; ${init}`);
    await p.goto(base + url); await p.waitForTimeout(3600);
    await p.evaluate(() => { dispatchEvent(new CustomEvent('easygames:pad', { detail: { on: true } })); dispatchEvent(new Event('pagehide')); dispatchEvent(new Event('pagehide')); });
    const r = await p.evaluate(() => window.__beacons); await p.close(); return r;
  };
  const r1 = await run('/wobbel/');
  const m = r1[0] && JSON.parse(r1[0].d);
  ok(r1.length === 1, 'genau eine Meldung beim Verlassen (' + r1.length + ')');
  ok(m && m.g === 'wobbel' && m.s >= 3 && m.p === 'web' && m.c === 1, 'Inhalt: Spiel, Sekunden, Plattform, Controller ' + (r1[0] && r1[0].d));
  ok(r1[0] && r1[0].u === 'https://control.ricorewi-radio.de/cron.php?action=eg_stat', 'Adresse: Control Center');
  ok(m && Object.keys(m).sort().join() === 'c,g,p,s', 'keine weiteren Daten (keine Kennung)');
  const r2 = await run('/partyverse/app/');
  ok(r2[0] && JSON.parse(r2[0].d).g === 'partyverse', 'Spiel im Unterordner (app/) zählt als partyverse');
  ok((await run('/wobbel/?nostats=1')).length === 0, '?nostats schaltet ab');
  ok((await run('/wobbel/', "Object.defineProperty(Navigator.prototype, 'doNotTrack', { get: () => '1' });")).length === 0, '„Do Not Track“ wird beachtet');
  ok((await run('/wobbel/', "window.EASYGAMES_STATS_URL = 'https://x.test/s';"))[0].u === 'https://x.test/s', 'andere Adresse per EASYGAMES_STATS_URL');
  await b.close(); srv.close();
  console.log(fails ? fails + ' Fehler' : 'alles ok'); process.exit(fails ? 1 : 0);
})();
