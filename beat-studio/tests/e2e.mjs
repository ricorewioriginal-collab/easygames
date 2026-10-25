// Beat-Studio – Browser-Test (Playwright): Menü → Song-Assistent → Studio (Drums, Melodie, Akkorde, Aufbau, Rückgängig),
// Wiedergabe, Gesang aufnehmen (Test-Mikrofon), Export (WAV, MIDI, Projekt) und wieder laden, Jury, Handy-Ansicht.
// Start: Server im Repo-Ordner, dann node beat-studio/tests/e2e.mjs [Screenshot-Ordner] [Basis-URL]
import { chromium } from 'playwright';
import fs from 'fs';
const OUT = process.argv[2] || '', BASE = process.argv[3] || 'http://localhost:8766/';
const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block', permissions: ['microphone'], acceptDownloads: true });
await ctx.route(/anmacha-cloud\.js/, r => r.fulfill({ status: 200, body: '', contentType: 'text/javascript' }));
const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) errs.push('FAIL ' + m); };
const shot = async (n, pg) => { if (OUT) await (pg || p).screenshot({ path: OUT + '/bs-' + n + '.jpg', quality: 80 }); };
const S = () => p.evaluate(() => JSON.parse(JSON.stringify(BSApp.S)));
await p.goto(BASE + 'beat-studio/'); await p.waitForSelector('#sTitle.on', { timeout: 15000 }); await shot('titel');
await p.keyboard.press('Enter'); await p.waitForSelector('#sMenu.on'); ok(await p.locator('#mList .mi').count() >= 5, 'Konsolen-Menü'); await shot('menu');
await p.keyboard.press('ArrowDown'); ok(await p.evaluate(() => document.activeElement && document.activeElement.dataset.go === 'songs'), 'Pfeiltasten im Menü');
// Song-Assistent
await p.click('[data-go="new"]'); await p.waitForSelector('#sWizard.on'); await p.click('[data-g="rock"]'); await p.click('[data-k="2"]'); await p.click('[data-sc="moll"]'); await p.fill('#wName', 'Test-Hit'); await shot('assistent');
await p.click('#wGo'); await p.waitForSelector('#sStudio.on'); let s = await S();
ok(s.genre === 'rock' && s.key === 2 && s.scale === 'moll' && s.name === 'Test-Hit' && s.arr.length >= 8, `Song erstellt: ${s.name}, ${s.bpm} BPM, ${s.arr.length} Abschnitte`); await shot('aufbau');
// Drums: Schlag setzen, Rückgängig, Wiederholen
await p.click('[data-t="drums"]'); const sec = await p.evaluate(() => BSApp.sec()); const k0 = s.pat[sec].drums.clap[2];
await p.click('#stEd .cell[data-r="clap"][data-s="2"]'); s = await S(); ok(s.pat[sec].drums.clap[2] !== k0 && s.edits > 0, 'Drum-Schlag gesetzt');
await p.click('#stUndo'); s = await S(); ok(s.pat[sec].drums.clap[2] === k0, 'Rückgängig'); await p.click('#stRedo'); s = await S(); ok(s.pat[sec].drums.clap[2] !== k0, 'Wiederholen'); await shot('drums');
// Melodie: Note setzen und löschen
await p.click('[data-t="lead"]'); const n0 = (await S()).pat[sec].lead.length; const free = await p.evaluate(() => { const c = [...document.querySelectorAll('#stEd .cell')].find(x => !x.classList.contains('on') && !x.classList.contains('cont') && x.dataset.r === '12'); return c && c.dataset.s; });
await p.click(`#stEd .cell[data-r="12"][data-s="${free}"]`); ok((await S()).pat[sec].lead.length === n0 + 1, 'Melodie-Note gesetzt'); await shot('melodie');
await p.click(`#stEd .cell[data-r="12"][data-s="${free}"]`); ok((await S()).pat[sec].lead.length === n0, 'Melodie-Note gelöscht');
// Akkorde
await p.click('[data-t="chords"]'); await p.click('[data-cb="1"]'); await p.click('[data-cd="5"]'); ok((await S()).pat[sec].chords[1] === 5, 'Akkord in Takt 2 geändert'); await p.click('[data-pr="0"]'); ok(JSON.stringify((await S()).pat[sec].chords) === '[0,4,5,3]', 'Akkordfolge-Vorlage'); await shot('akkorde');
// Aufbau
await p.click('[data-t="arr"]'); const a0 = (await S()).arr.length; await p.click('[data-add="chorus"]'); ok((await S()).arr.length === a0 + 1, 'Abschnitt angehängt');
await p.click(`[data-mv="${a0}:-1"]`); s = await S(); ok(s.arr[a0 - 1].sec === 'chorus', 'Abschnitt verschoben'); await p.click(`[data-del="${a0 - 1}"]`); ok((await S()).arr.length === a0, 'Abschnitt gelöscht');
// Wiedergabe
await p.click('#stPlay'); await p.waitForTimeout(1500); const pos = await p.evaluate(() => BSEngine.P.on && BSEngine.P.pos()); ok(pos > .5, 'Song läuft (' + (+pos).toFixed(1) + ' s)'); await p.click('#stPlay'); ok(!(await p.evaluate(() => BSEngine.P.on)), 'Stopp');
await p.keyboard.press('KeyL'); await p.waitForTimeout(500); ok(await p.evaluate(() => BSEngine.P.on && BSEngine.P.mode === 'pat'), 'Abschnitt in Schleife (L)'); await p.keyboard.press('KeyL');
// Gesang aufnehmen (Test-Mikrofon): kurzer Abschnitt 0
await p.evaluate(() => { const s = BSApp.S; s.bpm = 200; s.arr[0].rep = 1; }); await p.click('[data-t="vox"]'); await shot('gesang');
await p.click('[data-rec="0"]'); await p.waitForFunction(() => BSApp.S.vox[0], null, { timeout: 25000 }).then(() => ok(true, 'Gesang aufgenommen'), () => ok(false, 'Gesang aufgenommen'));
ok(await p.evaluate(async () => !!(await BSEngine.DB.get(BSApp.S.id + ':' + BSApp.S.vox[0]))), 'Aufnahme im Gerätespeicher');
// Export
await p.click('#stExport'); await p.waitForSelector('#ovBox [data-act="wav"]'); await shot('export');
const dl = async act => { const [d] = await Promise.all([p.waitForEvent('download', { timeout: 90000 }), p.click(`#ovBox [data-act="${act}"]`)]); const f = await d.path(); return { name: d.suggestedFilename(), buf: fs.readFileSync(f) }; };
const wv = await dl('wav'); ok(wv.name === 'Test-Hit.wav' && wv.buf.slice(0, 4).toString() === 'RIFF' && wv.buf.length > 3e6, `WAV-Export: ${wv.name} (${(wv.buf.length / 1048576).toFixed(1)} MB)`);
let sum = 0; for (let i = 44 + 44100 * 8; i < 44 + 44100 * 12; i += 2) sum += Math.abs(wv.buf.readInt16LE(i)); ok(sum / (44100 * 2) > 200, 'WAV enthält Musik (Pegel ' + Math.round(sum / 88200) + ')');
const md = await dl('midi'); ok(md.buf.slice(0, 4).toString() === 'MThd' && md.name.endsWith('.mid'), 'MIDI-Export');
const pj = await dl('proj'); const pjj = JSON.parse(pj.buf.toString()); ok(pjj.app === 'beat-studio' && pjj.song.name === 'Test-Hit' && Object.keys(pjj.voxData).length === 1, 'Projektdatei mit Gesang');
await p.click('#ovBox [data-act="x"]');
// Jury
await p.click('#stJury'); await p.waitForSelector('#sResult.on'); const sc = await p.evaluate(() => +document.querySelector('.score').textContent); ok(sc > 50 && await p.locator('.say').count() === 3, 'Radio-Jury: ' + sc + ' Punkte'); await shot('jury');
ok(await p.evaluate(() => +localStorage.getItem('beat-studio-highscore') > 0), 'Bestwert gespeichert');
// Meine Songs: Projekt laden
await p.evaluate(() => BSApp.menu()); await p.click('[data-go="songs"]'); await p.waitForSelector('#sSongs.on'); const n1 = await p.locator('.songRow').count();
const fp = (OUT || '/tmp') + '/bs-projekt.json'; fs.writeFileSync(fp, pj.buf); await p.setInputFiles('#sImp', fp); await p.waitForFunction(n => document.querySelectorAll('.songRow').length === n + 1, n1, { timeout: 8000 }).then(() => ok(true, 'Projekt geladen'), () => ok(false, 'Projekt geladen'));
const imp = await p.evaluate(async () => { const s = BSApp.songs()[0]; return { name: s.name, vox: !!(s.vox[0] && await BSEngine.DB.get(s.id + ':' + s.vox[0])) }; }); ok(imp.name === 'Test-Hit' && imp.vox, 'geladener Song mit Gesang'); await shot('songs');
// Handy
const m = await ctx.newPage(); await m.setViewportSize({ width: 390, height: 844 }); m.on('pageerror', e => errs.push('HANDY ' + e.message));
await m.goto(BASE + 'beat-studio/'); await m.waitForSelector('#sTitle.on'); await m.click('#bPress'); await m.waitForSelector('#sMenu.on'); await shot('handy-menu', m);
await m.click('[data-go="cont"]'); await m.waitForSelector('#sStudio.on'); await m.click('[data-t="drums"]'); ok(await m.locator('#stEd .cell[data-r="kick"]').count() === 16, 'Handy: Raster taktweise (16 Schritte)'); await shot('handy-drums', m);
await m.click('[data-bar="2"]'); ok(await m.locator('#stEd .cell[data-s="32"]').count() > 0, 'Handy: Takt 3'); ok(await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Handy: kein seitliches Scrollen');
await b.close();
console.log(errs.length ? 'FEHLER:\n' + errs.join('\n') : 'ALLES OK'); process.exit(errs.length ? 1 : 0);
