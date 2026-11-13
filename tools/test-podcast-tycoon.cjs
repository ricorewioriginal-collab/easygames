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
    assert.equal(await p.evaluate(() => AMC.Data.CHAPTERS.length), 17);
    assert.ok(await p.evaluate(() => typeof AMC.Net.lobby === 'function' && /\/easygames\/anmacha-podcast-tycoon\/\?koop=ABCDE$/.test(AMC.Net.link('ABCDE'))), 'Koop-Link zeigt auf die Homepage');
    await p.evaluate(() => { AMC.UI.closeAll(); AMC.Game.playChapter(9); }); await p.waitForTimeout(2500);
    assert.ok(await p.evaluate(() => !!AMC.Play.state().cat), 'Katze da');
    await p.evaluate(() => AMC.Game.playChapter(8)); await p.waitForTimeout(2500);
    assert.ok(await p.evaluate(() => !!AMC.Play.state().imbiss), 'Imbiss da');
    // Gisela parkt in der Stadt; neue Minispiele laufen ohne Fehler; Studio-Editor öffnet und schließt
    assert.ok(await p.evaluate(() => !!AMC.Play.state().gisela), 'Gisela da');
    assert.ok(await p.evaluate(() => !!AMC.Play.state().rico), 'RicoReWi steht vor dem Funkhaus');
    assert.ok(await p.evaluate(() => AMC.Audio.song('cancan').then(s => !!(s && s.mel && s.mel.length))), 'Klavierlicht-Lied lädt');
    await p.evaluate(() => { AMC.Play.stop(); AMC.UI.closeAll(); AMC.Game.mode = 'show'; AMC.Show.start({ mode: 'arcade', host: 'andrew', cards: [], onEnd: () => {} }); }); await p.waitForTimeout(1500);
    for (const k of ['rhythm', 'qte', 'cables', 'mixer', 'simon']) { await p.evaluate(k => AMC.Show._mini(k), k); await p.waitForTimeout(700); assert.ok(await p.evaluate(() => !!document.querySelector('.sh-mini canvas')), 'Minispiel ' + k); await p.evaluate(() => AMC.Show._mini(null)); }
    // Hörer-Musikwunsch: Menüpunkt erscheint und startet das Rhythmus-Spiel mit der echten Melodie
    await p.evaluate(() => { const S = AMC.Show.state(); S.wish = { id: 'cancan', t: 'Can-Can', r: '', from: 'Lea', left: 3 }; S.phase = 'menu'; S.menu = 'root'; document.getElementById('shCmd').hidden = false; S.sel = 0; document.querySelector('#shCmdL li button').click(); }); await p.waitForTimeout(1500);
    assert.equal(await p.evaluate(() => AMC.Show.state().mini && AMC.Show.state().mini.kind), 'rhythm', 'Musikwunsch startet Rhythmus');
    await p.evaluate(() => AMC.Show._mini(null));
    await p.evaluate(() => { AMC.Show.stop(); AMC.UI.closeAll(); AMC.Game.mode = 'menu'; AMC.StudioEdit.open(() => {}); }); await p.waitForTimeout(800);
    assert.ok(await p.evaluate(() => AMC.StudioEdit.value() > 0 && AMC.StudioEdit.bonus().hype >= 0), 'Studio-Editor');
    await p.keyboard.press('Escape'); await p.keyboard.press('Escape'); await p.waitForTimeout(500);
    // Stadt frei: Verkehr, Kabeldiebe, Besorgung; Marco fährt Gisela und steigt wieder aus
    await p.evaluate(() => { AMC.UI.closeAll(); AMC.Game.mode = 'play'; AMC.Play.onEnd = () => {}; AMC.Play.start({ mode: 'free', host: 'marco' }); }); await p.waitForTimeout(3000);
    assert.ok(await p.evaluate(() => { const S = AMC.Play.state(); return S.cars.length >= 5 && S.traffic.length >= 3 && !!S.errand; }), 'Autos, Verkehr und Besorgung');
    await p.evaluate(() => { const S = AMC.Play.state(); S.pl.x = S.gisela.x - 2.5; S.pl.z = S.gisela.z; }); await p.waitForTimeout(300);
    await p.keyboard.press('KeyE'); await p.waitForTimeout(400);
    assert.ok(await p.evaluate(() => !!AMC.Play.state().drive && AMC.Play.state().drive.gisela), 'Marco sitzt in Gisela');
    await p.keyboard.down('KeyW'); await p.waitForTimeout(1200); await p.keyboard.up('KeyW');
    await p.keyboard.press('KeyE'); await p.waitForTimeout(2500);
    assert.ok(await p.evaluate(() => !AMC.Play.state().drive), 'Aussteigen klappt');
    await p.evaluate(() => { AMC.Play.stop(); AMC.UI.closeAll(); });
    // Funk-Rennen: 10 Tore, Uhr läuft vorwärts
    await p.evaluate(() => { AMC.UI.closeAll(); AMC.Play.onEnd = () => {}; AMC.Play.start({ mode: 'race', host: 'andrew' }); }); await p.waitForTimeout(2500);
    assert.equal(await p.evaluate(() => AMC.Play.state().gates.length), 10, 'Rennen mit 10 Toren');
    await p.evaluate(() => { AMC.Play.stop(); AMC.UI.closeAll(); });
    // Radio
    await p.evaluate(() => AMC.UI.radio()); await p.waitForTimeout(800);
    assert.ok(await p.$$eval('.radio-screen button', b => b.length) > 10, 'Radio-Fenster mit Sendern/Folgen');
    assert.equal(await p.evaluate(() => AMC.Data.STATIONS.length), 13);
    console.log('ok – Laden, Stadt, Radio; Fehler:', errs.length);
    assert.deepEqual(errs, []);
  } finally { await browser.close(); server.close(); }
});
