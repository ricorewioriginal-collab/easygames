// Smoke-Test „AnMaCha – Der Podcast (Offizielles Spiel)“: Laden, Menü, Stadt (Laufen über Bordstein), Live-Show, Quiz, Radio.
// Aufruf: NODE_PATH=$(npm root -g) node tools/test-podcast-tycoon.cjs
const http = require('node:http'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.glb': 'model/gltf-binary', '.json': 'application/json', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\/$/, '/index.html'));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
server.listen(0, '127.0.0.1', async () => {
  const url = 'http://127.0.0.1:' + server.address().port + '/anmacha-podcast-tycoon/';
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const errs = [];
  try {
    const p = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await p.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
    p.on('pageerror', e => errs.push(e.message));
    await p.goto(url);
    await p.waitForFunction(() => document.getElementById('loading').classList.contains('done'), null, { timeout: 180000 });
    assert.match(await p.title(), /AnMaCha – Der Podcast/);
    await p.click('#tStart'); await p.waitForSelector('[data-go=story]');
    // Stadt: Kapitel 1 starten, nach vorn laufen (Bordstein darf nicht blockieren)
    await p.evaluate(() => AMC.Game.playChapter(0)); await p.waitForTimeout(3000);
    const z0 = await p.evaluate(() => AMC.Play.state().pl.z);
    await p.keyboard.down('KeyW'); await p.waitForTimeout(2500); await p.keyboard.up('KeyW');
    const z1 = await p.evaluate(() => AMC.Play.state().pl.z);
    assert.ok(z1 < z0 - 1, 'Figur läuft nach vorn: ' + z0 + ' → ' + z1);
    await p.keyboard.press('Escape'); await p.waitForTimeout(800);
    // Staffel 2: Katzen-Kapitel startet mit Katze, Imbiss-Kapitel mit Imbiss
    assert.equal(await p.evaluate(() => AMC.Data.CHAPTERS.length), 12);
    assert.ok(await p.evaluate(() => typeof AMC.Net.lobby === 'function' && /\/easygames\/anmacha-podcast-tycoon\/\?koop=ABCDE$/.test(AMC.Net.link('ABCDE'))), 'Koop-Link zeigt auf die Homepage');
    await p.evaluate(() => { AMC.UI.closeAll(); AMC.Game.playChapter(9); }); await p.waitForTimeout(2500);
    assert.ok(await p.evaluate(() => !!AMC.Play.state().cat), 'Katze da');
    await p.evaluate(() => AMC.Game.playChapter(8)); await p.waitForTimeout(2500);
    assert.ok(await p.evaluate(() => !!AMC.Play.state().imbiss), 'Imbiss da');
    await p.evaluate(() => AMC.UI.closeAll());
    // Radio
    await p.evaluate(() => AMC.UI.radio()); await p.waitForTimeout(800);
    assert.ok(await p.$$eval('.radio-screen button', b => b.length) > 10, 'Radio-Fenster mit Sendern/Folgen');
    assert.equal(await p.evaluate(() => AMC.Data.STATIONS.length), 13);
    console.log('ok – Laden, Stadt, Radio; Fehler:', errs.length);
    assert.deepEqual(errs, []);
  } finally { await browser.close(); server.close(); }
});
