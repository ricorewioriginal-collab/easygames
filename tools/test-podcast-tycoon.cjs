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
    assert.ok(await p.evaluate(() => ['resume', 'story', 'live', 'jagd', 'race', 'quiz', 'koop', 'walk', 'week', 'friends', 'home', 'arcade', 'music', 'studio', 'shop', 'radio', 'settings', 'controls', 'credits'].every(g => document.querySelector('.main-menu [data-go=' + g + ']'))), 'Gesamtmenü hat alle Funktionen');
    await p.click('[data-go=resume]'); await p.waitForTimeout(300);
    assert.ok(await p.evaluate(() => !document.querySelector('.main-menu') && AMC.Game.mode === 'play'), 'Weiter in der Stadt');
    // Club-Feeling in der Stadt: Emote-Leiste, Tanzen, Stadt-Vibe
    await p.waitForFunction(() => AMC.Play.state().pl.onGround, null, { timeout: 8000 }).catch(() => {});
    await p.evaluate(() => document.querySelector('#cvEmo [data-e=dance]').click()); await p.waitForFunction(() => AMC.Play.state().pl.anim === 'dance', null, { timeout: 8000 }).catch(() => {});
    assert.ok(await p.evaluate(() => AMC.CityVibe.state().dancing && AMC.Play.state().pl.anim === 'dance'), 'Tanzen in der Stadt');
    await p.evaluate(() => document.querySelector('#cvEmo [data-e=dance]').click());
    // Controller: Steuerkreuz ↑ tanzt in der Stadt (simuliertes Gamepad)
    await p.evaluate(() => { const mk = up => ({ id: 'Xbox test', connected: true, index: 0, axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: up && i === 12, value: up && i === 12 ? 1 : 0 })) }); window.__pad = mk(false); navigator.getGamepads = () => [window.__pad]; setTimeout(() => { window.__pad = mk(true); }, 200); setTimeout(() => { window.__pad = mk(false); }, 600); });
    await p.waitForFunction(() => AMC.CityVibe.state().dancing, null, { timeout: 8000 }).catch(() => {});
    assert.ok(await p.evaluate(() => AMC.Input.dpadEmotes && AMC.CityVibe.state().dancing && AMC.Input.device === 'pad'), 'Controller: Steuerkreuz tanzt in der Stadt');
    await p.evaluate(() => { navigator.getGamepads = () => []; document.querySelector('#cvEmo [data-e=dance]').click(); });
    // Stadtbus: 8 Haltestellen, Fahrt in ein anderes Viertel
    assert.equal(await p.evaluate(() => AMC.Play.state().busStops.length), 12, '12 Bushaltestellen (8 Stadt, 4 Welten)');
    await p.evaluate(() => AMC.Play.onAction('bus:funk')); await p.waitForSelector('[data-b=park]'); await p.click('[data-b=park]'); await p.waitForTimeout(1800);
    assert.ok(await p.evaluate(() => { const S = AMC.Play.state(), b = S.busStops.find(x => x.st.id === 'park'); return Math.hypot(S.pl.x - b.x, S.pl.z - b.z) < 5; }), 'Bus bringt zum Stadtpark');
    // Beziehungen: angesprochener Fan wird getroffen, Aktion steigert Freundschaft, Freundebuch
    assert.ok(await p.evaluate(() => { const S = AMC.Play.state(), n = S.npcs.find(x => !x.guest && !x.dancer && !x.hungry); if (!n) return false; n.talked = true; S.pl.x = n.x + 1; S.pl.z = n.z; const before = AMC.Social.points(n.name); AMC.Social.open(n, S); document.querySelector('#soL [data-s="0"]').click(); window.__soN = n.name; return JSON.stringify([before, AMC.Social.points(n.name), !!document.querySelector('#soL'), n.name]); }).then(r => { const a = JSON.parse(r); return a[1] === a[0] + 4; }), 'High-Five steigert Freundschaft');
    assert.ok(await p.evaluate(() => { AMC.Save.data.social.f[window.__soN] = 70; return AMC.Social.superfans() >= 1 && AMC.Social.bonus() >= 0.02 && AMC.Social.level(window.__soN).name === 'Superfan'; }), 'Superfan zählt als Hörer-Bonus');
    assert.ok(await p.evaluate(() => { const s = AMC.Social.book(); const ok = !!document.querySelector('#sbL .st-item'); AMC.UI.close(s); return ok; }), 'Freundebuch zeigt Fans');
    // Mehrere Welten ohne Ladebruch: Brücke, Damm, Fähre, Welt-Orte, RicoReWi-Universum
    assert.ok(await p.evaluate(() => AMC.Worlds.WORLDS.length === 4 && AMC.Worlds.inside(160, 0) && AMC.Worlds.inside(110, 0) && !AMC.Worlds.inside(60, 110) && AMC.Worlds.name(-170, 0).includes('RicoReWi')), 'Welten und Übergänge');
    assert.ok(await p.evaluate(() => { const e = { x: 60, z: 120 }; AMC.Worlds.clamp(e); return AMC.Worlds.inside(e.x, e.z); }), 'Wasser ist nicht begehbar');
    assert.ok(await p.evaluate(() => ['world:kanal9', 'world:buehne', 'world:turm', 'world:arena', 'world:portal', 'ferry:hin'].every(id => AMC.Play.state().stations.some(s => s.id === id))), 'Orte der Welten sind da');
    assert.ok(await p.evaluate(() => { const before = AMC.Worlds.ricoQuest().n; AMC.Worlds.open('buecher'); document.querySelector('#woL [data-w="0"]').click(); return AMC.Worlds.ricoQuest().n === before + 1; }), 'RicoReWi-Story zählt Orte');
    await p.evaluate(() => { const S = AMC.Play.state(); S.pl.x = 0; S.pl.z = 98; AMC.Worlds.ferry('ferry:hin'); });
    await p.waitForFunction(() => !AMC.Play.state().ferry, null, { timeout: 120000 }).catch(() => {});
    assert.ok(await p.evaluate(() => AMC.Play.state().pl.z > 120), 'Fähre bringt zur Festival-Insel');
    // Optik: Tag und Nacht nach der Spieluhr, Wetter je Tag, Laternen nachts
    assert.ok(await p.evaluate(() => { const n = AMC.WorldFX.count(); return Object.keys(AMC.World.models).filter(k => /sky|sedan|cargo|palm/.test(k)).length >= 6 && n.cars >= 6 && n.screens >= 8; }), 'Welt-Upgrade: CC0-Modelle, Verkehr, Video-Wände');
    await p.waitForFunction(() => AMC.WorldFX.count().people >= 5, null, { timeout: 60000 });
    assert.ok(await p.evaluate(() => { const c = AMC.Career.state(), m0 = c.min, S = AMC.Play.state(); c.min = 13 * 60; AMC.Atmos.apply(); const day = S.env.sun.intensity; c.min = 23 * 60; AMC.Atmos.apply(); const night = S.env.sun.intensity, lit = S.lampGlow ? S.lampGlow.visible : true; c.min = m0; AMC.Atmos.apply(); return night < day && lit && AMC.Atmos.night() === false && ['sun', 'cloud', 'rain'].includes(AMC.Atmos.weather().id); }), 'Tag und Nacht, Wetter');
    // Etappe 5: Wochen-Event, goldene Kassetten, Rückschlag bei der Auswertung
    assert.ok(await p.evaluate(() => { const w = AMC.Events.week(); return w.name && w.need > 0 && AMC.Play.state().goldTapes.length >= 15; }), 'Wochen-Event und Kassetten in der Stadt');
    await p.evaluate(() => { const S = AMC.Play.state(), c = S.goldTapes[0]; S.pl.x = c.x; S.pl.z = c.z; S.pl.y = c.y - 1; });
    await p.waitForFunction(() => AMC.Events.tapes() >= 1, null, { timeout: 8000 }).catch(() => {});
    assert.ok(await p.evaluate(() => AMC.Events.tapes() >= 1), 'Goldene Kassette eingesammelt');
    assert.ok(await p.evaluate(() => { const e = AMC.Events.episode('sponsor'); return e.lines.length >= 2 && e.parts.length >= 1; }), 'Rückschlag oder Schutz in der Auswertung');
    assert.ok(await p.evaluate(() => { const s = AMC.Events.panel(); const ok = document.querySelectorAll('.panel .st-item').length >= 4; AMC.UI.close(s); return ok; }), 'Wochen-Übersicht');
    // Musik: Klavierlicht-Liederliste und Lied laden (lokal oder online), Musikshop listet Lieder
    assert.ok(await p.evaluate(async () => { const l = await AMC.Audio.songIndex(), s = await AMC.Audio.song('cancan'); return l && l.length > 50 && s && s.mel.length > 10; }), 'Klavierlicht-Lieder laden');
    assert.ok(await p.evaluate(async () => { AMC.Home.musicShop(); await new Promise(r => setTimeout(r, 600)); const n = document.querySelectorAll('#msList [data-id]').length; AMC.UI.closeAll(); return n >= 40; }), 'Musikshop zeigt Lieder');
    // Tagesablauf und Folgen-Wirtschaft: Uhr im HUD, Aufnahme wertet aus, neuer Tag
    assert.ok(await p.evaluate(() => !!document.getElementById('crDay') && AMC.Career.plan().length === 4), 'Tagesplan im Stadt-HUD');
    assert.ok(await p.evaluate(() => { const c = AMC.Career.state(), d = c.day, a = c.abos; c.min = 18 * 60 + 10; const e = AMC.Career.episode({ listeners: 5000 }); return c.day === d + 1 && c.abos > a && e.hoerer >= 5000 && e.lines.length >= 4; }), 'Aufnahme bringt Hörer, Abos und neuen Tag');
    // Medienstadt: Viertel und nutzbare Orte (Café gibt Energie)
    assert.ok(await p.evaluate(() => AMC.Play.state().places.length >= 6 && AMC.District.name(22.5, -22.5).includes('Funkhaus')), 'Orte und Viertel in der Stadt');
    await p.evaluate(() => { AMC.Save.data.fan += 50; ['andrew', 'marco'].forEach(id => { AMC.Home.needs(id).energy = 20; }); AMC.Play.onAction('place:cafe'); }); await p.waitForSelector('#diL [data-a="0"]'); await p.click('#diL [data-a="0"]'); await p.waitForTimeout(400);
    assert.ok(await p.evaluate(() => AMC.Home.needs('andrew').energy >= 50 && AMC.Home.needs('marco').energy >= 50), 'Café gibt beiden Energie');
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
    for (let i = 0; i < 6 && (await p.evaluate(() => AMC.Arcade.state().phase === 'ready')); i++) { await p.evaluate(() => AMC.Input.fire('jump')); await p.waitForTimeout(400); }
    await p.waitForFunction(() => AMC.Arcade.state().p.x > 0, null, { timeout: 5000 }).catch(() => {});
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
