// Groove Arena – Browser-Test mit Attrappen (YouTube, iTunes, Piped, lrclib): Menü → Songs → Vorbereitung → Tanzen (Kamera-Posen
// eingespielt) → Ergebnis; Tanz-Video-Modus; Handy-Ansicht. Start: Server im Repo-Ordner, dann node groove-arena/tests/e2e.mjs [Screenshot-Ordner] [Basis-URL]
import { chromium } from 'playwright';
import { stub } from './stubs.mjs';
const OUT = process.argv[2] || '', BASE = process.argv[3] || 'http://localhost:8766/';
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block', permissions: ['camera', 'microphone'] }); await stub(ctx);
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|404|503/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
const ok = (c, m) => { if (!c) { errs.push('FAIL ' + m); console.log('FAIL', m); } else console.log('ok', m); };
const shot = async (n, pg) => { if (OUT) await (pg || p).screenshot({ path: OUT + '/ga-' + n + '.jpg', quality: 80 }); };
await p.goto(BASE + 'groove-arena/index.html?lowfx'); await p.waitForSelector('#sTitle.on', { timeout: 20000 }); await p.waitForTimeout(1200); await shot('title');
await p.keyboard.press('Enter'); await p.waitForSelector('#sMenu.on'); await p.waitForTimeout(800); await shot('menu'); ok(/Online/.test(await p.textContent('[data-go="online"]')), 'Menü mit 🌐 Online');
await p.click('[data-go="songs"]'); await p.waitForSelector('#grid .card', { timeout: 10000 }); ok(await p.locator('#grid .card').count() >= 3, 'Kategorie zeigt Songs (iTunes)'); await shot('songs');
await p.fill('#sq', 'Tanz die Nacht'); await p.click('#sGo'); await p.waitForTimeout(500); await p.click('#grid .card >> nth=0'); await p.waitForSelector('#sPrep.on');
await p.waitForFunction(() => GAApp.S && GAApp.S.ready, null, { timeout: 10000 }); ok(await p.evaluate(() => GAApp.S.vids[0].id === 'AAAAAAAAAAA'), 'offizielles Video gewählt (Piped)');
await p.waitForFunction(() => GAApp.S.sections, null, { timeout: 8000 }).then(() => ok(true, 'Songaufbau aus lrclib'), () => ok(false, 'Songaufbau aus lrclib'));
await p.click('#pInput .sg[data-v="cam"]'); await p.waitForTimeout(2500); await shot('prep');
ok(await p.evaluate(() => GASense.Cam.on || /Kamera/.test(document.getElementById('camMsg').textContent)), 'Kamera-Auswahl: ' + await p.textContent('#camMsg'));
await p.evaluate(() => { GAApp.SYNC.AAAAAAAAAAA = { bpm: 120, beat0: .5 }; }); await p.click('#pGo'); await p.waitForSelector('#sDance.on');
ok(await p.evaluate(() => GAApp.D.locked && GAApp.D.ch.list.length > 50), 'Choreografie für den ganzen Song');
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
await p.click('#pInput .sg[data-v="none"]'); await p.evaluate(() => { GAApp.SYNC.AAAAAAAAAAA = { bpm: 110, beat0: .2 }; }); await p.click('#pGo'); await p.evaluate(() => GAApp.sim(10)); await p.waitForTimeout(600); await shot('video-dance');
ok(await p.evaluate(() => GAApp.D.max > 0), 'Rhythmus-Bewertung im Video-Modus');
// gesperrtes Video → nächstes Video
await p.evaluate(() => { GAApp.toMenu(); window.__ytBlock = ['AAAAAAAAAAA']; }); await p.evaluate(() => GAApp.openSong({ title: 'Tanz die Nacht', artist: 'Test Band', dur: 198, genre: 'Pop', style: 'pop' }));
await p.waitForFunction(() => GAApp.S && GAApp.S.ready, null, { timeout: 10000 }); ok(await p.evaluate(() => GAApp.S.vids[GAApp.S.vi].id === 'BBBBBBBBBBB'), 'nicht einbettbares Video wird übersprungen');
// Mitklopfen
await p.evaluate(() => { window.__ytBlock = []; delete GAApp.SYNC.BBBBBBBBBBB; GAApp.SET.input = 'none'; }); await p.click('#pGo'); await p.waitForSelector('#sDance.on');
await p.evaluate(() => { for (let i = 0; i < 9; i++) { GAApp.sim(.5); GAApp.tap(); } }); ok(await p.evaluate(() => GAApp.D.locked && Math.abs(GAApp.D.bpm - 120) < 3), 'Takt per Mitklopfen: ' + await p.evaluate(() => GAApp.D.bpm));
// Handy
const m = await ctx.newPage(); await m.setViewportSize({ width: 390, height: 800 }); m.on('pageerror', e => errs.push('HANDY ' + e.message));
await m.goto(BASE + 'groove-arena/index.html?lowfx'); await m.waitForSelector('#sTitle.on', { timeout: 20000 }); await m.evaluate(() => document.getElementById('bPress').click()); await m.waitForSelector('#sMenu.on'); await m.waitForTimeout(600); await shot('handy-menu', m);
await m.evaluate(() => GAApp.openSong({ title: 'Disco Rakete', artist: 'Die Glitzer', dur: 214, genre: 'Disco', style: 'disco' })); await m.waitForFunction(() => GAApp.S && GAApp.S.ready, null, { timeout: 10000 }); await m.waitForTimeout(500); await shot('handy-prep', m);
await m.evaluate(() => { GAApp.SET.input = 'none'; GAApp.SYNC.AAAAAAAAAAA = { bpm: 124, beat0: .3 }; }); await m.click('#pGo'); await m.evaluate(() => GAApp.sim(30)); await m.waitForTimeout(700); await shot('handy-dance', m);
await b.close();
console.log(errs.length ? 'FEHLER:\n' + errs.join('\n') : 'ALLES OK'); process.exit(errs.length ? 1 : 0);
