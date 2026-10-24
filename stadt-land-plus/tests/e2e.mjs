// Stadt Land Plus – Browser-Test: Titel → Menü → Einrichten → Runde schreiben, STOPP → Auswertung mit Infos/Globus → Siegerehrung;
// Nachschlagen, Moderator-Modus, Bildschirmtastatur und Handy-Ansicht.
// Start: Server im Repo-Ordner, dann node stadt-land-plus/tests/e2e.mjs [Screenshot-Ordner] [Basis-URL]
import { chromium } from 'playwright';
const OUT = process.argv[2] || '', BASE = process.argv[3] || 'http://localhost:8766/';
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
const ok = (c, m) => { if (!c) { errs.push('FAIL ' + m); console.log('FAIL', m); } else console.log('ok', m); };
const shot = async (n, pg) => { if (OUT) await (pg || p).screenshot({ path: OUT + '/slp-' + n + '.jpg', quality: 80 }); };
await p.goto(BASE + 'stadt-land-plus/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload();
await p.waitForSelector('#sTitle.on', { timeout: 15000 }); await p.waitForTimeout(1200); await shot('title');
await p.keyboard.press('Enter'); await p.waitForSelector('#sMenu.on'); await p.waitForTimeout(600); await shot('menu'); ok(true, 'Menü');
await p.click('[data-go="solo"]'); await p.waitForSelector('#sSetup.on'); ok(true, 'Einrichten');
await p.click('#suThird .ct[data-c="tier"]'); ok((await p.textContent('#thirdShow')).includes('Tier'), 'Drittes Thema: Tier');
await p.click('#suExtra .ct[data-c="beruf"]'); await p.click('#suRounds .sg[data-v="3"]'); await p.click('#suBots .sg[data-v="3"]');
await shot('setup');
await p.click('#suGo'); await p.waitForSelector('#sGame.on'); await p.waitForFunction(() => SLFApp.GM && SLFApp.GM.phase === 'write', null, { timeout: 20000 });
const letter = await p.evaluate(() => SLFApp.GM.letter); ok(/^[A-Z]$/.test(letter), 'Buchstabe ausgelost: ' + letter);
ok(await p.evaluate(() => SLFApp.GM.cfg.cats.join()) === 'stadt,land,tier,beruf', 'Spalten Stadt, Land, Tier, Beruf');
// Antworten aus der Datenbank holen und eintippen (eine bewusst falsch)
const w = await p.evaluate(L => ['stadt', 'land', 'tier'].map(c => (SLFApp.SLF.candidates(c, L)[0] || {}).n || ''), letter);
const inputs = p.locator('#sheet .ans');
await inputs.nth(0).fill(w[0]); await inputs.nth(1).fill(w[1]); await inputs.nth(2).fill(w[2]); await inputs.nth(3).fill('Xylofonbauer');
ok(await p.evaluate(() => SLFApp.GM.ans.me.stadt.length > 0), 'Eingabe übernommen');
await p.waitForTimeout(500); await shot('write');
await p.click('#bStop'); await p.waitForTimeout(300); const t = await p.evaluate(() => SLFApp.GM.t); ok(t <= 10, 'STOPP: noch ' + t.toFixed(1) + ' s');
await p.evaluate(() => { SLFApp.GM.t = .2; });
await p.waitForFunction(() => SLFApp.GM && SLFApp.GM.phase === 'score', null, { timeout: 15000 }); await p.waitForTimeout(400); await shot('review');
const mine = await p.evaluate(() => SLFApp.GM.cfg.cats.map(c => { const a = SLFApp.GM.rows[c].find(x => x.pid === 'me'); return [a.text, a.valid, a.pts]; }));
console.log(JSON.stringify(mine));
ok(mine[0][1] === !!w[0] && mine[3][1] === false, 'Gültig/ungültig erkannt');
ok(await p.evaluate(() => SLFApp.GM.players.find(p => p.id === 'me').total) === mine.reduce((s, x) => s + x[2], 0), 'Punkte addiert');
// Infos mit Globus
if (w[0]) { await p.click('#sheet td .ans2 >> nth=0'); await p.waitForSelector('#ovInfo:not([hidden])'); await p.waitForTimeout(900); await shot('info'); ok((await p.textContent('#infoTxt')).length > 10, 'Infos zur Stadt'); await p.keyboard.press('Escape'); ok(await p.isHidden('#ovInfo'), 'Infos schließen'); }
for (let r = 2; r <= 3; r++) {
  await p.click('#bNext'); await p.waitForFunction(n => SLFApp.GM && SLFApp.GM.round === n && SLFApp.GM.phase === 'write', r, { timeout: 20000 });
  await p.evaluate(() => { SLFApp.GM.t = .2; }); await p.waitForFunction(() => SLFApp.GM && SLFApp.GM.phase === 'score', null, { timeout: 15000 });
}
await p.click('#bNext'); await p.waitForSelector('#sEnd.on'); await p.waitForTimeout(800); await shot('end');
const st = await p.evaluate(() => SLFApp.ST); ok(st.games === 1, 'Partie gezählt: ' + JSON.stringify(st));
ok(await p.evaluate(() => localStorage.getItem('stadt-land-plus-highscore') !== null || SLFApp.ST.best === 0), 'Highscore gespeichert');
// Moderator-Modus: alles streichen
await p.evaluate(() => { SLFApp.SET.check = 'mod'; SLFApp.SET.rounds = 3; SLFApp.SET.bots = 1; SLFApp.startSolo(); });
await p.waitForFunction(() => SLFApp.GM && SLFApp.GM.phase === 'write', null, { timeout: 20000 });
await p.evaluate(() => { SLFApp.GM.t = .2; }); await p.waitForFunction(() => SLFApp.GM && SLFApp.GM.phase === 'check' && SLFApp.GM.sub === 'mod', null, { timeout: 15000 });
const nMb = await p.locator('#sheet .mb[data-v="0"]').count(); ok(nMb > 0, 'Moderator-Knöpfe (' + nMb + ')'); await shot('mod');
for (let i = 0; i < nMb; i++) await p.click('#sheet .mb[data-v="0"] >> nth=' + i);
await p.click('#bModOk'); ok(await p.evaluate(() => SLFApp.GM.players.every(p => p.total === 0)), 'Moderator hat alles gestrichen');
await p.evaluate(() => SLFApp.SET.check = 'auto');
// Bildschirmtastatur (wie mit Gamepad)
await p.evaluate(() => { SLFApp.A.dev = 'pad'; }); await p.click('#bNext'); await p.waitForFunction(() => SLFApp.GM && SLFApp.GM.phase === 'write', null, { timeout: 20000 });
ok(await p.isVisible('#osk'), 'Bildschirmtastatur sichtbar');
await p.click('#osk .ok[data-k="B"]'); await p.click('#osk .ok[data-k="E"]'); await p.click('#osk .ok[data-k="R"]');
ok(await p.evaluate(() => SLFApp.GM.ans.me.stadt) === 'Ber', 'Tastatur schreibt: ' + await p.evaluate(() => SLFApp.GM.ans.me.stadt)); await shot('osk');
await p.keyboard.press('Escape'); await p.waitForSelector('#ovPause:not([hidden])'); await p.click('#paQuit'); await p.waitForSelector('#sMenu.on'); ok(true, 'Pause → Menü');
// Nachschlagen
await p.click('[data-go="lex"]'); await p.waitForSelector('#sLex.on'); await p.fill('#lxQ', 'Mailand'); await p.waitForSelector('.lxHit.ok', { timeout: 8000 }); ok(true, 'Nachschlagen: Mailand gültig');
await p.selectOption('#lxCat', 'land'); await p.fill('#lxQ', 'Peru'); await p.waitForTimeout(500); await p.waitForSelector('.lxHit.ok'); await p.click('#lxInfo'); await p.waitForTimeout(900); await shot('lex');
ok((await p.textContent('#infoTxt')).includes('Lima'), 'Peru: Hauptstadt Lima'); await p.click('#infoX');
// Handy (Touch)
const c2 = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const m = await c2.newPage(); m.on('pageerror', e => errs.push('MOBIL ' + e.message));
await m.goto(BASE + 'stadt-land-plus/index.html'); await m.waitForSelector('#sTitle.on', { timeout: 15000 });
await m.tap('#bPress', { force: true }); await m.waitForSelector('#sMenu.on'); await m.waitForTimeout(500); await shot('m-menu', m);
await m.evaluate(() => { SLFApp.SET.bots = 2; SLFApp.SET.rounds = 3; SLFApp.startSolo(); }); await m.waitForFunction(() => SLFApp.GM && SLFApp.GM.phase === 'write', null, { timeout: 20000 });
await m.locator('#sheet .ans').nth(0).fill('Test'); await m.waitForTimeout(400); await shot('m-write', m); ok(await m.isHidden('#osk'), 'Handy: eigene Tastatur, keine Bildschirmtastatur');
await m.evaluate(() => { SLFApp.GM.t = .2; }); await m.waitForFunction(() => SLFApp.GM && SLFApp.GM.phase === 'score', null, { timeout: 15000 }); await m.waitForTimeout(400); await shot('m-review', m);
const ov = await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1); ok(ov, 'Handy: kein seitliches Scrollen');
console.log(errs.join('\n') || 'no errors'); await b.close(); if (errs.length) process.exitCode = 1;
