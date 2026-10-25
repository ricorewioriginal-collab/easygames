// Groove Arena – Browser-Test mit Attrappen (YouTube, iTunes, Piped, lrclib): Menü → Songs → Vorbereitung → Tanzen (Kamera-Posen
// eingespielt) → Ergebnis; Tanz-Video-Modus; Handy-Ansicht. Start: Server im Repo-Ordner, dann node groove-arena/tests/e2e.mjs [Screenshot-Ordner] [Basis-URL]
import { chromium } from 'playwright';
import { stub, RADIO } from './stubs.mjs';
const OUT = process.argv[2] || '', BASE = process.argv[3] || 'http://localhost:8766/';
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block', permissions: ['camera', 'microphone'] }); await stub(ctx);
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|404|503/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
const ok = (c, m) => { if (!c) { errs.push('FAIL ' + m); console.log('FAIL', m); } else console.log('ok', m); };
const shot = async (n, pg) => { if (OUT) await (pg || p).screenshot({ path: OUT + '/ga-' + n + '.jpg', quality: 80 }); };
await p.goto(BASE + 'groove-arena/index.html?lowfx'); await p.waitForSelector('#sTitle.on', { timeout: 20000 }); await p.waitForTimeout(1200); await shot('title');
await p.keyboard.press('Enter'); await p.waitForSelector('#sMenu.on'); await p.waitForTimeout(800); await shot('menu'); ok(/Online/.test(await p.textContent('[data-go="online"]')), 'Menü mit 🌐 Online');
// Tänzer & Charakter-Editor (echte 3D-Figuren aus ../figuren/)
await p.click('[data-go="dancers"]'); await p.waitForSelector('#sDancers.on'); ok(await p.locator('.dz').count() >= 17, 'Tänzer-Auswahl: ' + await p.locator('.dz').count());
await p.click('.dz[data-id="rico"]'); await p.waitForFunction(() => GAView.real, null, { timeout: 30000 }).then(() => ok(true, 'Rico als echte 3D-Figur'), () => ok(false, 'Rico als echte 3D-Figur')); await p.waitForTimeout(1500); await shot('rico');
await p.click('.dz[data-id="_new"]'); await p.waitForSelector('#sCreator.on'); await p.fill('#crName', 'Testi'); await p.click('#crHair .sg[data-v="curly"]'); await p.click('#crHat .sg[data-v="cap"]'); await p.waitForTimeout(2500); await shot('editor');
await p.click('#crSave'); ok(await p.evaluate(() => JSON.parse(localStorage.getItem('groove-arena-chars') || '[]').some(c => c.name === 'Testi' && c.look.hair.style === 'curly')), 'eigene Figur gespeichert');
await p.evaluate(() => GAApp.toMenu());
await p.click('[data-go="songs"]'); await p.waitForSelector('#grid .card', { timeout: 10000 }); ok(await p.locator('#grid .card').count() >= 3, 'Kategorie zeigt Songs (iTunes)'); await shot('songs');
await p.fill('#sq', 'Tanz die Nacht'); await p.click('#sGo'); await p.waitForTimeout(500); await p.click('#grid .card >> nth=0'); await p.waitForSelector('#sPrep.on');
await p.waitForFunction(() => GAApp.S && GAApp.S.ready, null, { timeout: 10000 }); ok(await p.evaluate(() => GAApp.S.vids[0].id === 'AAAAAAAAAAA'), 'offizielles Video gewählt (Piped)');
await p.waitForFunction(() => GAApp.S.sections, null, { timeout: 8000 }).then(() => ok(true, 'Songaufbau aus lrclib'), () => ok(false, 'Songaufbau aus lrclib'));
await p.click('#pInput .sg[data-v="cam"]'); await p.waitForTimeout(2500); await shot('prep');
ok(await p.evaluate(() => { const t = document.getElementById('pSrc').textContent; return /YouTube/.test(t) && /Kanal: Test Band/.test(t) && /iTunes/.test(t) && /LRCLIB/.test(t) && document.querySelector('#pSrc a').href.includes('watch?v=AAAAAAAAAAA'); }), 'Quellenangabe: ' + await p.textContent('#pSrc'));
ok(await p.evaluate(() => GASense.Cam.on || /Kamera/.test(document.getElementById('camMsg').textContent)), 'Kamera-Auswahl: ' + await p.textContent('#camMsg'));
await p.evaluate(() => { GAApp.SYNC.AAAAAAAAAAA = { bpm: 120, beat0: .5 }; }); await p.click('#pGo'); await p.waitForSelector('#sDance.on');
ok(await p.evaluate(() => GAApp.D.locked && GAApp.D.ch.list.length > 50), 'Choreografie für den ganzen Song'); ok(/YouTube · Test Band/.test(await p.textContent('#dSrc')), 'Quelle beim Tanzen: ' + await p.textContent('#dSrc'));
// Kamera-Posen einspielen: Spieler macht die Vortänzerin perfekt (spiegelbildlich) nach
await p.evaluate(() => { const C = GAApp.C; window.__lm = t => { const Jp = C.joints(C.at(GAApp.D.ch, t).pose), lm = []; for (let i = 0; i < 33; i++) lm.push({ x: .5, y: .5, visibility: 1 }); const M = { 12: 'shL', 14: 'elL', 16: 'wrL', 11: 'shR', 13: 'elR', 15: 'wrR', 24: 'hpL', 26: 'knL', 28: 'anL', 23: 'hpR', 25: 'knR', 27: 'anR' }; for (const i in M) { const P = Jp[M[i]]; lm[i] = { x: .5 - P[0] * .25, y: .9 - P[1] * .25, visibility: .95 }; } return lm; };
  GASense.Cam.stop(); GAApp.D.input = 'cam'; GASense.Cam.aspect = 1; const orig = GAApp.sim; window.__simCam = (sec) => { for (let i = 0; i < sec * 30; i++) { GASense.Cam.lm = window.__lm(GAApp.S.player.time() + .03); orig(1 / 30); } }; });
await p.evaluate(() => window.__simCam(40)); await p.waitForTimeout(700); await shot('dance');
const c1 = await p.evaluate(() => GAApp.D.counts); ok(c1.perfekt > 20 && c1.perfekt > c1.daneben * 4, 'perfekt nachgetanzt: ' + JSON.stringify(c1));
// falsche Haltung → schlechte Bewertung
await p.evaluate(() => { const C = GAApp.C; GAApp.D.counts = { perfekt: 0, super: 0, gut: 0, ok: 0, daneben: 0 }; for (let i = 0; i < 300; i++) { GASense.Cam.lm = window.__lm(3); GAApp.sim(1 / 30); } });
const c2 = await p.evaluate(() => GAApp.D.counts); ok(c2.perfekt < c2.daneben + c2.ok + c2.gut, 'stillstehen wird schlecht bewertet: ' + JSON.stringify(c2));
await p.evaluate(() => window.__simCam(5)); await p.waitForTimeout(500); await shot('dance2');
await p.evaluate(() => { GAApp.finish(); }); await p.waitForSelector('#sResult.on'); await p.waitForTimeout(500); await shot('result');
ok(await p.evaluate(() => localStorage.getItem('groove-arena-highscore') !== null && Object.keys(GAApp.BEST).length === 1), 'Bestwert + Highscore gespeichert');
// Tanz-Video-Modus
await p.evaluate(() => { GAApp.toMenu(); GAApp.songsScreen('videos'); }); await p.waitForSelector('#grid .card', { timeout: 8000 }); await shot('videos');
await p.click('#grid .card >> nth=0'); await p.waitForFunction(() => GAApp.S && GAApp.S.ready, null, { timeout: 8000 }); ok(await p.evaluate(() => GAApp.S.mode === 'video'), 'Tanz-Video geöffnet');
await p.evaluate(() => { GAApp.SET.input = 'phone'; GAApp.SYNC.AAAAAAAAAAA = { bpm: 110, beat0: .2 }; }); await p.click('#pGo'); await p.evaluate(() => GAApp.sim(10)); await p.waitForTimeout(600); await shot('video-dance');
ok(await p.evaluate(() => GAApp.D.max > 0), 'Rhythmus-Bewertung im Video-Modus');
// gesperrtes Video → nächstes Video
await p.evaluate(() => { GAApp.toMenu(); window.__ytBlock = ['AAAAAAAAAAA']; }); await p.evaluate(() => GAApp.openSong({ title: 'Tanz die Nacht', artist: 'Test Band', dur: 198, genre: 'Pop', style: 'pop' }));
await p.waitForFunction(() => GAApp.S && GAApp.S.ready, null, { timeout: 10000 }); ok(await p.evaluate(() => GAApp.S.vids[GAApp.S.vi].id === 'BBBBBBBBBBB'), 'nicht einbettbares Video wird übersprungen');
// Mitklopfen
await p.evaluate(() => { window.__ytBlock = []; delete GAApp.SYNC.BBBBBBBBBBB; GAApp.SET.input = 'none'; }); await p.click('#pGo'); await p.waitForSelector('#sDance.on');
await p.evaluate(() => { for (let i = 0; i < 9; i++) { GAApp.sim(.5); GAApp.tap(); } }); ok(await p.evaluate(() => GAApp.D.locked && Math.abs(GAApp.D.bpm - 120) < 3), 'Takt per Mitklopfen: ' + await p.evaluate(() => GAApp.D.bpm));
// Nur tanzen: ohne Wertung, eigenes Ergebnis
await p.evaluate(() => GAApp.sim(40)); await p.waitForTimeout(400); await shot('free-dance');
ok(await p.evaluate(() => GAApp.D.moves > 8 && GAApp.D.score === 0 && getComputedStyle(document.getElementById('dStars')).display === 'none'), 'Nur tanzen: Moves ohne Punkte (' + await p.evaluate(() => GAApp.D.moves) + ')');
await p.evaluate(() => GAApp.finish()); await p.waitForSelector('#sResult.on'); await shot('free-result'); ok(/Frei getanzt/.test(await p.textContent('#rsT')) && !(await p.locator('#rsBody .bigStars').count()), 'Nur-tanzen-Ergebnis ohne Sterne');
// Radio: RicoReWi-Sender (laut.fm), Logo + aktueller Titel, Takt aus dem Stream, je Titel neue Moves
await p.evaluate(() => { GAApp.toMenu(); GAApp.SET.input = 'phone'; }); await p.click('[data-go="radio"]'); await p.waitForSelector('#sRadio.on');
await p.waitForFunction(() => document.querySelectorAll('#rGrid .card img').length >= 13, null, { timeout: 8000 }).then(() => ok(true, 'Senderliste mit Logos'), () => ok(false, 'Senderliste mit Logos')); await p.waitForTimeout(400); await shot('radio');
await p.click('#rGrid .card[data-i="3"]'); await p.waitForSelector('#sPrep.on'); await p.waitForFunction(() => /Pashanim/.test(document.getElementById('rbNow').textContent), null, { timeout: 8000 }).then(() => ok(true, 'aktueller Titel'), () => ok(false, 'aktueller Titel'));
ok(await p.evaluate(() => !document.getElementById('rbAdv').hidden && /laut\.fm\/rapradio24/.test(document.getElementById('pSrc').textContent) && !document.getElementById('pGo').disabled), 'Rapradio: Explicit-Hinweis + Quelle laut.fm'); await p.waitForTimeout(800); await shot('radio-prep');
await p.click('#pGo'); await p.waitForSelector('#sDance.on'); ok(/laut\.fm · Rapradio/.test(await p.textContent('#dSrc')), 'Quelle beim Radio-Tanzen');
await p.waitForFunction(() => GAApp.D && GAApp.D.locked, null, { timeout: 25000 }).then(async () => ok(Math.abs(await p.evaluate(() => GAApp.D.bpm)) > 0, 'Takt aus dem Radio-Stream erkannt: ' + (await p.evaluate(() => GAApp.D.bpm)).toFixed(1) + ' BPM (Stream: 120)'), () => ok(false, 'Takt aus dem Radio-Stream erkannt'));
await p.evaluate(() => { if (!GAApp.D.locked) GAApp.lock(120, .25); });
const cid1 = await p.evaluate(() => GAApp.D.cid + '|' + GAApp.D.ch.own.join()); ok(/Kleiner Prinz/.test(cid1), 'Choreo für den laufenden Titel');
await p.evaluate(() => GAApp.sim(12)); await p.waitForTimeout(500); await shot('radio-dance');
RADIO.now = { title: 'Neuer Hit', artist: 'Testa', len: 180 }; await p.evaluate(() => GAApp.radioPoll());
await p.waitForFunction(() => GAApp.D.songs.length === 2 && !GAApp.D.locked, null, { timeout: 8000 }).then(() => ok(true, 'Titelwechsel erkannt'), () => ok(false, 'Titelwechsel erkannt'));
await p.evaluate(() => GAApp.lock(98, GAApp.S.player.time())); const cid2 = await p.evaluate(() => GAApp.D.cid + '|' + GAApp.D.ch.own.join()); ok(cid2 !== cid1 && /Neuer Hit/.test(cid2), 'neuer Titel = neue eigene Moves');
await p.evaluate(() => GAApp.sim(8)); ok(await p.evaluate(() => GAApp.D.max > 0 && /Neuer Hit/.test(document.getElementById('dTitle').textContent)), 'Radio: Wertung + Titel oben');
await p.keyboard.press('Escape'); await p.waitForSelector('#ovPause:not([hidden])'); ok(/Beenden/.test(await p.textContent('#paQuit')), 'Pause: Radio beenden'); await p.click('#paQuit'); await p.waitForSelector('#sResult.on'); await p.waitForTimeout(300); await shot('radio-result');
ok(await p.evaluate(() => /Neuer Hit/.test(document.getElementById('rsBody').textContent) && /laut\.fm/.test(document.getElementById('rsBody').textContent)), 'Ergebnis mit getanzten Titeln und Quelle');
// Handy
await p.close(); const m = await ctx.newPage(); await m.setViewportSize({ width: 390, height: 800 }); m.on('pageerror', e => errs.push('HANDY ' + e.message));
await m.goto(BASE + 'groove-arena/index.html?lowfx'); await m.waitForSelector('#sTitle.on', { timeout: 20000 }); await m.evaluate(() => document.getElementById('bPress').click()); await m.waitForSelector('#sMenu.on'); await m.waitForTimeout(600); await shot('handy-menu', m);
await m.evaluate(() => GAApp.openSong({ title: 'Disco Rakete', artist: 'Die Glitzer', dur: 214, genre: 'Disco', style: 'disco' })); await m.waitForFunction(() => GAApp.S && GAApp.S.ready, null, { timeout: 25000 }); await m.waitForTimeout(500); await shot('handy-prep', m);
await m.evaluate(() => { GAApp.SET.input = 'phone'; GAApp.SYNC.AAAAAAAAAAA = { bpm: 124, beat0: .3 }; }); await m.click('#pGo'); await m.evaluate(() => GAApp.sim(30)); await m.waitForTimeout(700); await shot('handy-dance', m);
await m.evaluate(() => { GAApp.toMenu(); GAApp.openRadio(GAApp.STATIONS[0]); }); await m.waitForSelector('#sPrep.on'); await m.waitForTimeout(1500); await shot('handy-radio', m);
await m.click('#pGo'); await m.evaluate(() => GAApp.lock(120, .25)); await m.evaluate(() => GAApp.sim(10)); await m.waitForTimeout(600); await shot('handy-radio-dance', m);
await b.close();
console.log(errs.length ? 'FEHLER:\n' + errs.join('\n') : 'ALLES OK'); process.exit(errs.length ? 1 : 0);
