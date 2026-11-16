// Test des TikTok-Fensters in der Bibliothek (launcher/index.html): Anzeige, Verbinden, Belegung, OBS-Link.
//   NODE_PATH=$(npm root -g) node windows/tests/launcher-tiktok.cjs [Screenshot-Ordner]
const path = require('path'), fs = require('fs'), http = require('http');
const { chromium } = require('playwright');
const DIR = path.join(__dirname, '..', 'launcher'), SHOTS = process.argv[2] || '';
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHL ') + m); if (!c) fails++; };
(async () => {
  const srv = http.createServer((q, r) => { const u = q.url.split('?')[0], f = u === '/' ? path.join(DIR, 'index.html') : path.join(DIR, u.replace('/_launcher/', '')); if (!fs.existsSync(f)) { r.statusCode = 404; return r.end(); } r.end(fs.readFileSync(f)); }).listen(0);
  const b = await chromium.launch(), p = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => {
    window.sent = []; let h = null;
    window.chrome = { webview: { postMessage: m => window.sent.push(m), addEventListener: (t, f) => { h = f; } } };
    window.push = m => h && h({ data: m });
  });
  await p.goto('http://127.0.0.1:' + srv.address().port + '/');
  const game = { id: 'anmacha-quiz', title: 'AnMaCha Quiz', short: 'Quiz', url: 'https://ricorewioriginal-collab.github.io/easygames/anmacha-quiz/', kind: 'bundled', installed: true, modes: [] };
  const state = tt => p.evaluate(([g, tt]) => push({ type: 'state', online: true, games: [g], tiktok: tt }), [game, tt]);
  await state({ name: '', running: false, status: 'Aus', inGames: true, node: true, log: [] });
  await p.click('[data-id="quiz"]').catch(() => {});
  await p.click('#bTT');
  await p.fill('#ttName', '@ricorewi');
  await p.click('[data-tt="start"]');
  ok(await p.evaluate(() => sent.some(m => m.cmd === 'tiktok' && m.act === 'start' && m.name === '@ricorewi')), 'Verbinden schickt den Namen an die App');
  await state({ name: 'ricorewi', running: true, status: 'Verbunden mit dem LIVE von @ricorewi', inGames: true, node: true, log: ['Brücke bereit: ws://127.0.0.1:21213', 'Verbunden mit dem LIVE von @ricorewi', 'gift  Mia  Galaxy'] });
  ok(/Verbunden mit dem LIVE/.test(await p.textContent('#ttBody')) && /● an/.test(await p.textContent('#ttDot')), 'Status und Anzeige „an“');
  await p.click('[data-tt="copy"]');
  ok(await p.evaluate(() => sent.some(m => m.act === 'copy' && /stream\.html\?game=anmacha-quiz&tiktok=1/.test(m.text))), 'OBS-Link mit easygames-ID');
  await p.click('[data-tt="setup"]');
  ok(await p.evaluate(() => sent.some(m => m.act === 'setup' && m.id === 'anmacha-quiz')), 'Belegung bearbeiten öffnet das Spiel');
  if (SHOTS) await p.screenshot({ path: path.join(SHOTS, 'windows-tiktok.png') });
  ok(!errs.length, 'keine JS-Fehler ' + errs.join(' | '));
  await b.close(); srv.close(); console.log(fails ? fails + ' Fehler' : 'alles ok'); process.exit(fails ? 1 : 0);
})();
