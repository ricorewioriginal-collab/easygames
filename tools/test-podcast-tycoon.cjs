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
    // Sims-Teil: Zuhause (Bedürfnisse, Schreibtisch-Idee), begehbares Studio, Musikshop, Gegenspieler zum Rangeln
    await p.evaluate(() => { AMC.Game.mode = 'home'; AMC.Home.open('marco', () => {}); }); await p.waitForTimeout(1200);
    const ideas0 = await p.evaluate(() => AMC.Home.needs('marco').ideas.length);
    await p.evaluate(() => { const s = AMC.Home.HOMES.marco.slots.find(x => x.id === 'desk'); AMC.Home._act(s); });
    assert.ok(await p.evaluate(n => AMC.Home.needs('marco').ideas.length > n || n >= 3, ideas0), 'Schreibtisch bringt eine Idee');
    assert.ok(await p.evaluate(() => !!document.getElementById('homeUi') && AMC.Home.active()), 'Marcos Haus offen');
    await p.evaluate(() => AMC.Home.close(true)); 
    await p.evaluate(() => AMC.Home.studio({ host: 'andrew', actions: {} }, () => {})); await p.waitForTimeout(800);
    assert.ok(await p.evaluate(() => AMC.Studio.mode === 'walk' && AMC.Home.active()), 'Studio begehbar');
    await p.evaluate(() => { AMC.Home.close(true); AMC.Game.mode = 'menu'; AMC.Studio.enter('menu'); });
    await p.evaluate(() => AMC.Home.musicShop()); await p.waitForTimeout(1500);
    assert.ok(await p.$$eval('#msList [data-id]', b => b.length) > 10, 'Musikshop listet Klavierlicht-Lieder');
    await p.evaluate(() => AMC.UI.closeAll());
    // Gegenspieler (Mensch statt Fantasiewesen) nach dem Bosskampf
    await p.evaluate(() => AMC.Game.playChapter(7)); await p.waitForTimeout(2500);
    await p.evaluate(() => { window.__rd = false; const S = AMC.Play.state(); AMC.Drive.spawnRival('Ralf Rauschmann', S.pl.x + 2, S.pl.z, () => { window.__rd = true; }); }); await p.waitForTimeout(1200);
    for (let i = 0; i < 14 && !(await p.evaluate(() => window.__rd)); i++) { await p.evaluate(() => { const S = AMC.Play.state(), t = S.thieves.find(x => x.rival); if (t) { S.pl.x = t.x - 1.2; S.pl.z = t.z; } }); await p.waitForTimeout(120); await p.keyboard.press('KeyE'); await p.waitForTimeout(700); }
    assert.ok(await p.evaluate(() => window.__rd), 'Rangelei mit Rauschmann gewonnen');
    await p.evaluate(() => { AMC.Play.stop(); AMC.UI.closeAll(); });
    // Arcade: drei 3D-Minispiele mit Andrew und Marco
    await p.evaluate(() => AMC.Game.arcade('flap')); await p.waitForTimeout(1200);
    await p.keyboard.press('Space'); await p.waitForTimeout(400);
    assert.ok(await p.evaluate(() => { const r = AMC.Arcade.state(); return r && r.id === 'flap' && r.phase !== 'ready' && r.p.x > 0; }), 'Funkwellen-Flug startet und fliegt');
    await p.evaluate(() => AMC.Game.arcade('jump')); await p.waitForTimeout(1200);
    await p.keyboard.down('KeyD'); await p.waitForTimeout(800); await p.keyboard.up('KeyD');
    assert.ok(await p.evaluate(() => { const r = AMC.Arcade.state(); return r && r.id === 'jump' && r.p.x > 0.3 && r.plats.length > 10 && r.goal > 100; }), 'Jump & Run läuft');
    await p.evaluate(() => AMC.Game.arcade('run')); await p.waitForTimeout(1200);
    await p.keyboard.press('Space'); await p.waitForTimeout(600); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(300);
    assert.ok(await p.evaluate(() => { const r = AMC.Arcade.state(); return r && r.id === 'run' && r.phase !== 'ready' && r.p.z < 0 && r.p.lane === 0; }), 'Endlos-Läufer rennt');
    await p.evaluate(() => { const r = AMC.Arcade.state(); r.crash(); }); await p.waitForTimeout(2200);
    assert.ok(await p.evaluate(() => !!document.querySelector('.arc-end')), 'Arcade-Ergebnis erscheint');
    await p.evaluate(() => { AMC.UI.closeAll(); AMC.Arcade.close(true); AMC.Game.mode = 'menu'; });
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
