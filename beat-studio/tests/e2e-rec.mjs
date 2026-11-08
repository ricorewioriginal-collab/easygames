// Beat-Studio · Recording-Suite – Browser-Test (Playwright, Test-Mikrofon): Spuren, Aufnahme (normal, Schleife, Punch-In), Takes ziehen/teilen/Comping,
// Instrumentspur (Tastatur-Aufnahme, Quantisieren, MIDI), Effekte, Wiedergabe ab Cursor, Songtext antippen, Coach, Stimmgerät, Export (WAV mit Mastering,
// Einzelspuren), Projektdatei mit Aufnahmen und wieder laden, Handy-Ansicht.
// Start: Server im Repo-Ordner, dann node beat-studio/tests/e2e-rec.mjs [Screenshot-Ordner] [Basis-URL]
import { chromium } from 'playwright';
import fs from 'fs';
const OUT = process.argv[2] || '', BASE = process.argv[3] || 'http://localhost:8766/';
const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await b.newContext({ viewport: { width: 1280, height: 860 }, serviceWorkers: 'block', permissions: ['microphone'], acceptDownloads: true });
await ctx.route(/anmacha-cloud\.js/, r => r.fulfill({ status: 200, body: '', contentType: 'text/javascript' }));
const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) errs.push('FAIL ' + m); };
const shot = async (n, pg) => { if (OUT) await (pg || p).screenshot({ path: OUT + '/rec-' + n + '.jpg', quality: 82 }); };
const R = () => p.evaluate(() => JSON.parse(JSON.stringify(BSApp.S.rec)));
const waitRec = (n, ms) => p.waitForFunction(k => BSApp.S.rec.tracks.reduce((a, t) => a + t.takes.length, 0) >= k && !BSRecUI.st.recing, n, { timeout: ms || 20000 });
await p.goto(BASE + 'beat-studio/'); await p.waitForSelector('#sTitle.on', { timeout: 15000 }); await p.keyboard.press('Enter'); await p.waitForSelector('#sMenu.on');
ok(await p.locator('[data-go="rec"]').count() === 1, 'Menüpunkt Recording-Studio');
await p.click('[data-go="new"]'); await p.click('[data-g="pop"]'); await p.click('[data-k="0"]'); await p.click('[data-sc="dur"]'); await p.fill('#wName', 'Studio-Test'); await p.click('#wGo'); await p.waitForSelector('#sStudio.on');
await p.evaluate(() => { const s = BSApp.S; s.bpm = 180; }); await p.click('[data-t="rec"]'); await p.waitForSelector('.rc');
ok(await p.locator('.rcLane.song i').count() > 5, 'Zeitleiste mit Song-Abschnitten');
// Spuren anlegen
await p.click('[data-rc="addA"]'); let r = await R(); ok(r.tracks.length === 1 && r.tracks[0].kind === 'audio' && r.tracks[0].arm === 1, 'Gesangsspur angelegt und scharf');
await p.click('[data-rc="count"]'); await p.click('[data-rc="count"]'); r = await R(); ok(r.count === 0, 'Vorzähler aus');
// Normale Aufnahme
await p.click('[data-rc="rec"]'); await p.waitForSelector('#rcHud'); await p.waitForTimeout(2600); await shot('aufnahme');
ok(await p.evaluate(() => BSEngine.P.on && BSEngine.P.pos() > 1.5), 'Song läuft während der Aufnahme'); await p.click('#hudStop'); await waitRec(1);
r = await R(); const k1 = r.tracks[0].takes[0]; ok(k1 && k1.len > 1.5 && k1.len < 4 && Math.abs(k1.start) < .05, `Take aufgenommen (${k1 && k1.len.toFixed(2)} s ab ${k1 && k1.start.toFixed(2)})`);
ok(await p.evaluate(async k => !!(await BSEngine.DB.get(BSApp.S.id + ':' + k)), k1.src), 'Aufnahme im Gerätespeicher');
ok(await p.evaluate(() => { const c = document.querySelector('.tk canvas'); if (!c) return false; const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n > 50; }), 'Wellenform gezeichnet');
// Schleifen-Aufnahme: Bereich 0–1,6 s → mehrere Takes, oberster = letzter Durchlauf
await p.evaluate(() => BSApp.edit(() => { BSApp.S.rec.a = 0; BSApp.S.rec.b = 1.6; })); await p.click('[data-rc="loop"]');
await p.click('[data-rc="rec"]'); await p.waitForTimeout(5200); await p.click('#hudStop'); await waitRec(3);
r = await R(); const loopT = r.tracks[0].takes.filter(k => /Durchlauf/.test(k.name)); ok(loopT.length >= 2 && loopT.every(k => Math.abs(k.len - 1.6) < .05 && k.start === 0), `Schleife: ${loopT.length} Durchläufe als Takes`);
const top = r.tracks[0].takes.reduce((a, k) => k.order > a.order ? k : a); ok(top.name === 'Durchlauf ' + loopT.length, 'Comping: letzter Durchlauf liegt oben');
// Punch-In 1,0–1,6 s
await p.click('[data-rc="punch"]'); await p.evaluate(() => BSApp.edit(() => { BSApp.S.rec.a = 1; BSApp.S.rec.b = 1.6; })); await p.click('[data-rc="rec"]'); await p.waitForFunction(() => BSRecUI.st.recing);
await p.waitForFunction(() => !BSRecUI.st.recing, null, { timeout: 15000 }); await p.waitForTimeout(300); r = await R();
const pu = r.tracks[0].takes.find(k => /Punch/.test(k.name)); ok(pu && Math.abs(pu.start - 1) < .01 && Math.abs(pu.len - .6) < .05 && pu.trimA > .2, 'Punch-In: Take genau im Bereich, mit Vorlauf als Reserve');
await p.click('[data-rc="punch"]'); await p.click('[data-rc="rclr"]');
// Take ziehen (verschieben) und am Cursor teilen
await p.evaluate(() => { const t = BSApp.S.rec.tracks[0]; BSRecUI.st.selTake = t.takes[0].id; }); await p.click('[data-pn="takes"]');
const tk = p.locator(`.tk[data-tk="${k1.id}"]`), bb = await tk.boundingBox(), gx = bb.x + bb.width * .7;   // rechts greifen: links liegen die Schleifen-Takes darüber
await p.mouse.move(gx, bb.y + 20); await p.mouse.down(); await p.mouse.move(gx + 60, bb.y + 20, { steps: 5 }); await p.mouse.up();
r = await R(); const moved = r.tracks[0].takes.find(k => k.id === k1.id); ok(moved.start > 1.5, `Take verschoben auf ${moved.start.toFixed(2)} s (Raster)`);
await p.evaluate(s => { BSRecUI.st.cursor = s + .8; BSRecUI.st.selTake = BSApp.S.rec.tracks[0].takes[0].id; }, moved.start); await p.click('[data-pn="takes"]'); await p.click('[data-rc="split"]');
r = await R(); ok(r.tracks[0].takes.some(k => k.src === k1.src && k.id !== k1.id && Math.abs(k.trimA - .8) < .01), 'Take am Cursor geteilt (teilt sich die Aufnahme)'); await shot('takes');
await p.click('#stUndo'); r = await R(); ok(!r.tracks[0].takes.some(k => k.src === k1.src && k.id !== k1.id), 'Teilen rückgängig');
// Effekte
await p.click('[data-pn="spur"]'); await p.click('[data-fxp="rap"]'); r = await R(); ok(r.tracks[0].fx.comp === .75 && r.tracks[0].fx.dbl === .25, 'Effekt-Voreinstellung Rap');
await p.locator('[data-fx="tune"]').fill('0.8'); r = await R(); ok(r.tracks[0].fx.tune === .8, 'Autotune-Regler');
await p.waitForFunction(() => [...BSRecUI.st.proc.keys()].length > 0, null, { timeout: 15000 }).then(() => ok(true, 'Autotune/Gate vorgerechnet'), () => ok(false, 'Autotune/Gate vorgerechnet'));
await shot('effekte');
// Wiedergabe ab Cursor (mitten im Song)
await p.evaluate(() => { BSRecUI.st.cursor = 3; }); await p.keyboard.press('Space'); await p.waitForTimeout(900);
const pl = await p.evaluate(() => ({ on: BSEngine.P.on, pos: BSEngine.P.pos(), live: !!BSRecUI.st.live && BSRecUI.st.live.srcs.length >= 0 })); ok(pl.on && pl.pos > 3.4 && pl.pos < 4.6 && pl.live, `Wiedergabe ab Cursor 0:03 mit Aufnahmespuren (${pl.pos.toFixed(2)} s)`);
await p.keyboard.press('Space'); ok(!(await p.evaluate(() => BSEngine.P.on)), 'Stopp mit Leertaste');
// Instrumentspur: mit Computertastatur einspielen
await p.click('[data-rc="addI"]'); r = await R(); ok(r.tracks.length === 2 && r.tracks[1].kind === 'inst' && r.tracks[1].arm && !r.tracks[0].arm, 'Instrumentspur angelegt, scharf');
await p.click('[data-rc="kb"]'); await p.evaluate(() => { BSRecUI.st.cursor = 0; }); await shot('instrument');
await p.keyboard.press('KeyR'); await p.waitForSelector('#rcHud'); await p.waitForTimeout(600);
for (const k of ['KeyA', 'KeyD', 'KeyG', 'KeyK']) { await p.keyboard.down(k); await p.waitForTimeout(160); await p.keyboard.up(k); await p.waitForTimeout(90); }
await p.keyboard.press('KeyR'); await p.waitForFunction(() => !BSRecUI.st.recing); r = await R();
ok(r.tracks[1].notes.length === 4 && r.tracks[1].notes.map(n => n[1]).join() === '60,64,67,72', 'Tastatur-Aufnahme: C E G C als Noten');
await p.click('[data-q="4"]'); r = await R(); ok(r.tracks[1].notes.every(n => Math.abs(n[0] * 4 - Math.round(n[0] * 4)) < 1e-6), 'Quantisiert auf 16tel');
const [mid] = await Promise.all([p.waitForEvent('download'), p.click('[data-rc="mexp"]')]); const mp = await mid.path(); ok(fs.readFileSync(mp).subarray(0, 4).toString() === 'MThd', 'MIDI der Instrumentspur gespeichert');
await p.setInputFiles('#rcMidi', mp); r = await R(); ok(r.tracks[1].notes.length === 8, 'MIDI-Datei geladen (Noten ab Cursor dazu)');
await p.click('[data-rc="kb"]');
// Songtext antippen
await p.click('[data-pn="text"]'); await p.fill('#rcLyr', 'Erste Zeile\nZweite Zeile'); await p.locator('#rcLyr').blur(); await p.click('[data-rc="sync"]'); await p.waitForTimeout(700); await p.click('#hudTap'); await p.waitForTimeout(500); await p.click('#hudTap');
await p.waitForFunction(() => BSRecUI.st.sync < 0); r = await R(); ok(r.lyrT.length === 2 && r.lyrT[1] > r.lyrT[0] && r.lyrT[0] > .3, 'Songtext-Zeiten angetippt'); await shot('songtext');
// Coach
await p.evaluate(() => { BSRecUI.st.sel = BSApp.S.rec.tracks[0].id; BSRecUI.st.selTake = BSApp.S.rec.tracks[0].takes[0].id; }); await p.click('[data-pn="coach"]'); await p.click('[data-rc="anal"]');
await p.waitForSelector('.coach .big', { timeout: 15000 }); ok(/%/.test(await p.textContent('.coach .big')), 'Gesangs-Coach: ' + (await p.textContent('.coach .big'))); await shot('coach');
// Stimmgerät
await p.click('.rcPanel [data-rc="tuner"]'); await p.waitForTimeout(1200); const tn = await p.textContent('#tuN'); ok(/^[A-H]#?\d$/.test(tn), 'Stimmgerät erkennt Ton (' + tn + ')'); await shot('stimmgeraet'); await p.click('[data-act="x"]');
// Summe + Export mit Mastering
await p.click('[data-pn="sum"]'); await p.click('[data-tgt="-14"]'); r = await R(); ok(r.target === -14 && r.lim === 1, 'Mastering-Ziel −14 LUFS, Limiter an'); await shot('summe');
await p.evaluate(() => { const s = BSApp.S; s.arr = s.arr.slice(0, 3); s.bpm = 200; BSApp.edit(() => { }, { quiet: true }); });
await p.click('[data-rc="exp"]'); const [wd] = await Promise.all([p.waitForEvent('download', { timeout: 90000 }), p.click('[data-act="wav"]')]); const wp = await wd.path(), wav = fs.readFileSync(wp);
await p.waitForFunction(() => /LUFS/.test(document.getElementById('expMsg').textContent), null, { timeout: 10000 }).catch(() => { });
ok(wav.subarray(0, 4).toString() === 'RIFF' && /LUFS/.test(await p.textContent('#expMsg')), 'WAV mit Aufnahmespuren und Mastering: ' + (await p.textContent('#expMsg')));
let pk = 0; for (let i = 44; i < wav.length - 1; i += 2) { const v = Math.abs(wav.readInt16LE(i)); if (v > pk) pk = v; } ok(pk <= 29300 && pk > 3000, 'Spitzen unter −1 dBFS (' + pk + ')');
const names = []; p.on('download', d => names.push(d.suggestedFilename())); await p.click('[data-act="stems"]'); await p.waitForFunction(() => /Einzelspuren gespeichert|nicht möglich/.test(document.getElementById('expMsg').textContent), null, { timeout: 120000 });
await p.waitForTimeout(500); ok(names.some(n => /Gesang_1\.wav$/.test(n)) && names.some(n => /Instrument_1\.wav$/.test(n)) && names.some(n => /_drums\.wav$/.test(n)), 'Einzelspuren mit Recording-Spuren: ' + names.join(', '));
// Projektdatei mit Aufnahmen → wieder laden
const [pd] = await Promise.all([p.waitForEvent('download'), p.click('[data-act="proj"]')]); const pp = await pd.path(), pj = JSON.parse(fs.readFileSync(pp, 'utf8'));
const srcs = [...new Set(pj.song.rec.tracks[0].takes.map(k => k.src))]; ok(srcs.length >= 3 && srcs.every(s => pj.voxData[s]), 'Projektdatei enthält alle Aufnahmen');
await p.click('[data-act="x"]'); await p.click('#stMenu'); await p.click('[data-go="songs"]'); await p.setInputFiles('#sImp', pp); await p.waitForTimeout(800);
const imp = await p.evaluate(async () => { const s = BSApp.songs()[0], ks = BSRec.takeIds(s.rec); let n = 0; for (const k of ks) if (await BSEngine.DB.get(s.id + ':' + k)) n++; return { n, all: ks.length, tr: s.rec.tracks.length }; });
ok(imp.tr === 2 && imp.n === imp.all && imp.all >= 3, 'Projekt geladen: Spuren und Aufnahmen da');
// Jury zählt Aufnahmen als Gesang
await p.evaluate(() => BSApp.open(BSApp.songs()[0])); const jr = await p.evaluate(() => BSCore.rate(BSApp.S).crit.gesang); ok(jr >= 65, 'Jury zählt Recording-Gesang (' + jr + ')');
// Handy
const m = await ctx.newPage(); await m.setViewportSize({ width: 390, height: 844 }); await m.goto(BASE + 'beat-studio/'); await m.waitForSelector('#sTitle.on'); await m.click('#bPress');
await m.click('[data-go="rec"]'); await m.waitForSelector('.rc'); await m.waitForTimeout(500); await shot('handy', m);
ok(await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && document.querySelector('#rcScroll').scrollWidth > document.querySelector('#rcScroll').clientWidth), 'Handy: Zeitleiste scrollt, Seite nicht');
await m.click('[data-pn="spur"]'); await m.evaluate(() => { BSRecUI.st.sel = BSApp.S.rec.tracks[1].id; }); await m.click('[data-pn="spur"]'); await m.waitForTimeout(300); await shot('handy-klavier', m);
await b.close();
console.log(errs.length ? 'FEHLER:\n' + errs.join('\n') : 'ALLES OK'); process.exit(errs.length ? 1 : 0);
