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
    await p.click('#tStart'); await p.waitForFunction(() => AMC.Game.mode === 'play' && AMC.Play.state() && AMC.Play.state().mode === 'free', null, { timeout: 20000 });
    // Kein separates Hauptmenü: Start führt in die Stadt, das Gesamtmenü öffnet sich dort (Pause) mit allen Funktionen
    await p.evaluate(() => AMC.Game.pause()); await p.waitForSelector('.main-menu.in-city [data-go=story]');
    assert.ok(await p.evaluate(() => ['resume', 'story', 'live', 'jagd', 'race', 'quiz', 'koop', 'walk', 'home', 'arcade', 'music', 'studio', 'shop', 'radio', 'settings', 'controls', 'credits'].every(g => document.querySelector('.main-menu [data-go=' + g + ']'))), 'Gesamtmenü hat alle Funktionen');
    await p.click('[data-go=resume]'); await p.waitForTimeout(300);
    assert.ok(await p.evaluate(() => !document.querySelector('.main-menu') && AMC.Game.mode === 'play'), 'Weiter in der Stadt');
    // Club-Feeling in der Stadt: Emote-Leiste, Tanzen, Stadt-Vibe
    await p.waitForFunction(() => AMC.Play.state().pl.onGround, null, { timeout: 8000 }).catch(() => {});
    await p.evaluate(() => document.querySelector('#cvEmo [data-e=dance]').click()); await p.waitForFunction(() => AMC.Play.state().pl.anim === 'dance', null, { timeout: 8000 }).catch(() => {});
    assert.ok(await p.evaluate(() => AMC.CityVibe.state().dancing && AMC.Play.state().pl.anim === 'dance'), 'Tanzen in der Stadt');
    await p.evaluate(() => document.querySelector('#cvEmo [data-e=dance]').click());
    // Stadtbus: 8 Haltestellen, Fahrt in ein anderes Viertel
    assert.equal(await p.evaluate(() => AMC.Play.state().busStops.length), 8, '8 Bushaltestellen');
    await p.evaluate(() => AMC.Play.onAction('bus:funk')); await p.waitForSelector('[data-b=park]'); await p.click('[data-b=park]'); await p.waitForTimeout(1800);
    assert.ok(await p.evaluate(() => { const S = AMC.Play.state(), b = S.busStops.find(x => x.st.id === 'park'); return Math.hypot(S.pl.x - b.x, S.pl.z - b.z) < 5; }), 'Bus bringt zum Stadtpark');
    // Gisela von innen: ausbauen und betreten
    await p.evaluate(() => { AMC.Save.data.fan += 400; AMC.Camper.buy('bett'); AMC.Camper.buy('studio'); AMC.Play.onAction('camper'); }); await p.waitForTimeout(1200);
    assert.ok(await p.evaluate(() => { const r = AMC.Home._state(); return r && r.kind === 'camper' && AMC.Camper.has('bett') && AMC.Camper.has('studio') && !!r.B.P.studio; }), 'Gisela innen begehbar und ausgebaut');
    await p.evaluate(() => AMC.Home.close()); await p.waitForFunction(() => AMC.Game.mode === 'play' && AMC.Play.state() && AMC.Play.state().mode === 'free', null, { timeout: 15000 });
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
    await p.evaluate(() => AMC.StudioEdit.close()); await p.waitForTimeout(800);
    // Stadt frei: Verkehr, Kabeldiebe, Besorgung; Marco fährt Gisela und steigt wieder aus
    await p.evaluate(() => { if (AMC.StudioEdit.close) AMC.StudioEdit.close(); AMC.UI.closeAll(); AMC.Game.mode = 'play'; AMC.Play.onEnd = () => {}; AMC.Play.start({ mode: 'free', host: 'marco' }); }); await p.waitForTimeout(3000);
    assert.ok(await p.evaluate(() => { const S = AMC.Play.state(); return S.cars.length >= 5 && S.traffic.length >= 3 && !!S.errand; }), 'Autos, Verkehr und Besorgung');
    await p.evaluate(() => { const S = AMC.Play.state(); S.pl.x = S.gisela.x - 2.5; S.pl.z = S.gisela.z; }); await p.waitForTimeout(300);
    for (let i = 0; i < 6 && !(await p.evaluate(() => !!AMC.Play.state().drive)); i++) { await p.evaluate(() => { const S = AMC.Play.state(); S.pl.x = S.gisela.x - 2.5; S.pl.z = S.gisela.z; AMC.Input.fire('act'); }); await p.waitForTimeout(500); }
    assert.ok(await p.evaluate(() => !!AMC.Play.state().drive && AMC.Play.state().drive.gisela), 'Marco sitzt in Gisela');
    await p.keyboard.down('KeyW'); await p.waitForTimeout(1200); await p.keyboard.up('KeyW');
    for (let i = 0; i < 6 && (await p.evaluate(() => !!AMC.Play.state().drive)); i++) { await p.evaluate(() => AMC.Input.fire('act')); await p.waitForTimeout(800); }
    await p.waitForTimeout(1500);
    assert.ok(await p.evaluate(() => !AMC.Play.state().drive), 'Aussteigen klappt');
    // Begehbares Funkhaus: Menüpunkte als Orte in der Welt
    assert.ok(await p.evaluate(() => { const S = AMC.Play.state(), ids = S.stations.map(s => s.id); return ['menu', 'live', 'edit', 'story', 'quiz', 'radio', 'shop', 'koop', 'arcade', 'music', 'home:andrew', 'home:marco'].every(i => ids.includes(i)); }), 'Alle Menüpunkte als Orte');
    assert.ok(await p.evaluate(() => { const S = AMC.Play.state(); return !S.col.some(c => 22.5 > c.x0 && 22.5 < c.x1 && -25 > c.z0 && -25 < c.z1 && c.bot < 1 && c.top > 1); }), 'Funkhaus innen begehbar');
    await p.evaluate(() => { window.__act = null; AMC.Play.onAction = id => { window.__act = id; }; const S = AMC.Play.state(), st = S.stations.find(s => s.id === 'shop'); S.pl.x = st.x; S.pl.z = st.z; S.pl.y = 0.2; }); await p.waitForTimeout(400);
    for (let i = 0; i < 5 && !(await p.evaluate(() => window.__act)); i++) { await p.evaluate(() => AMC.Input.fire('act')); await p.waitForTimeout(300); }
    assert.equal(await p.evaluate(() => window.__act), 'shop', 'Fanshop im Funkhaus öffnet');
    // Senderhäuser: alle 13 Sender haben ein begehbares Haus mit Gastmoderation
    assert.equal(await p.evaluate(() => AMC.Play.state().stations.filter(s => s.id.startsWith('sender:')).length), 13, '13 Senderhäuser in der Stadt');
    await p.evaluate(() => { AMC.Play.stop(); AMC.UI.closeAll(); AMC.Game.mode = 'home'; AMC.Home.station('clubradio24', 'andrew', () => {}); }); await p.waitForTimeout(1200);
    // Club-Feeling: eigener Raum, Fans, Tanzen, Figurenwechsel, 3D-Spiel
    assert.ok(await p.evaluate(() => { const r = AMC.Home._state(); return r.slug === 'clubradio24' && r.cfg.floor[0] === 'led' && (AMC.Save.data.senders || {}).clubradio24; }), 'Clubradio24 hat eigenen Raum');
    assert.equal(new Set(await p.evaluate(() => Object.values(AMC.Sender.HOUSES).map(h => h.wallTex + '/' + h.floor[0] + '/' + h.light))).size, 13, 'alle 13 Häuser unterschiedlich');
    await p.waitForFunction(() => AMC.Home._state().fans.length >= 3, null, { timeout: 20000 });
    await p.evaluate(() => document.querySelector('#sdEmo [data-e=dance]').click()); await p.waitForFunction(() => AMC.Home._state().w.fig.curName === 'dance', null, { timeout: 8000 }).catch(() => {});
    assert.ok(await p.evaluate(() => AMC.Home._state().dancing && AMC.Home._state().w.fig.curName === 'dance'), 'Tanzen sichtbar');
    await p.evaluate(() => document.querySelector('#sdEmo [data-e=swap]').click()); await p.waitForTimeout(500);
    assert.equal(await p.evaluate(() => AMC.Home._state().who), 'marco', 'Figurenwechsel im Senderhaus');
    await p.evaluate(() => AMC.Sender._startGame(AMC.Home._state())); await p.waitForTimeout(1500);
    assert.ok(await p.evaluate(() => !!AMC.Home._state().game && !!document.getElementById('sdGame')), '3D-Senderspiel läuft');
    await p.evaluate(() => { AMC.Home.close(true); AMC.Home.station('anmacha24', 'andrew', () => {}); AMC.Sender._startGame(AMC.Home._state()); }); await p.waitForTimeout(1500);
    assert.ok(await p.evaluate(() => AMC.Home._state().cfg.game.kind === 'catch' && !!AMC.Home._state().game), '3D-Fangspiel läuft');
    await p.evaluate(() => { AMC.Home.close(true); AMC.Game.mode = 'menu'; });
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
    await p.keyboard.down('KeyD'); await p.waitForFunction(() => AMC.Arcade.state().p.x > 0.3, null, { timeout: 8000 }).catch(() => {}); await p.keyboard.up('KeyD');
    assert.ok(await p.evaluate(() => { const r = AMC.Arcade.state(); return r && r.id === 'jump' && r.p.x > 0.3 && r.plats.length > 10 && r.goal > 100; }), 'Jump & Run läuft');
    await p.evaluate(() => AMC.Game.arcade('run')); await p.waitForTimeout(1200);
    await p.keyboard.press('Space'); await p.waitForFunction(() => AMC.Arcade.state().phase !== 'ready', null, { timeout: 5000 }); await p.waitForTimeout(400); await p.evaluate(() => AMC.Input.fire('left')); await p.waitForFunction(() => AMC.Arcade.state().p.lane === 0, null, { timeout: 5000 }).catch(() => {});
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
