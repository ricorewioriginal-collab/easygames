// Sendemast-Sumo – Browser-Test (Playwright). node sendemast-sumo/tests/e2e.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
const base = process.argv[2] || 'http://localhost:8766/', out = process.argv[3] || '';
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'] });
const errs = [], ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) process.exitCode = 1; };
async function page(vp, touch, q) {
  const ctx = await b.newContext({ viewport: vp, hasTouch: !!touch, isMobile: !!touch, serviceWorkers: 'block' }), p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::|firebase|googleapis|peer/i.test(m.text())) errs.push(m.text()); });
  await p.goto(base + 'sendemast-sumo/' + (q || ''), { waitUntil: 'commit' }); return p;
}
const shot = async (p, n) => { if (out) await p.screenshot({ path: out + '/sumo-' + n + '.jpg', type: 'jpeg', quality: 80 }); };
const st = p => p.evaluate(() => SUMO.state());
const wait = (p, ms) => p.waitForTimeout(ms);

const p = await page({ width: 1280, height: 760 });
await p.waitForSelector('#loadBar'); await wait(p, 300); await shot(p, '01-laden');
await p.waitForSelector('#sTitle.on', { timeout: 15000 }); await wait(p, 600); await shot(p, '02-titel');
await p.keyboard.press('Enter'); await wait(p, 500); ok((await st(p)).cur === 'sMenu', 'Titel → Hauptmenü'); await wait(p, 800); await shot(p, '03-menue');
// Menü mit Pfeilen bedienen: Turnier ist fokussiert, Pfeil rechts → Schnelles Spiel
await p.keyboard.press('ArrowRight'); ok(await p.evaluate(() => document.activeElement.dataset.go) === 'quick', 'Pfeiltasten bewegen den Fokus');
await p.keyboard.press('Enter'); await wait(p, 300); ok((await st(p)).cur === 'sFighter', 'Kämpferwahl'); await p.keyboard.press('ArrowRight'); await wait(p, 200); await shot(p, '04-kaempfer');
await p.click('#fGo'); await wait(p, 200); ok((await st(p)).cur === 'sOpts', 'Optionen'); await shot(p, '05-optionen');
await p.click('#oGo'); await wait(p, 400); let s = await st(p); ok(s.cur === 'sGame' && s.round === 1, 'Kampf startet');
await wait(p, 600); await p.evaluate(() => { SUMO.G.W.t = 2.9; }); await p.waitForFunction(() => SUMO.state().phase === 'fight', null, { timeout: 8000 }); ok(true, 'Countdown vorbei, Kampf läuft');
await p.keyboard.down('KeyD'); await wait(p, 400); await p.keyboard.press('Space'); await wait(p, 300); await p.keyboard.up('KeyD');
const moved = await p.evaluate(() => Math.hypot(SUMO.G.W.f[0].x, SUMO.G.W.f[0].z)); ok(moved > 0.1, 'Tastatur steuert den Kämpfer');
await wait(p, 1500); await shot(p, '06-kampf');
await p.keyboard.press('Escape'); await wait(p, 300); ok((await st(p)).paused, 'Pause mit Esc'); await shot(p, '07-pause'); await p.keyboard.press('Escape'); await wait(p, 200); ok(!(await st(p)).paused, 'weiter');
// Runde beenden: alle Gegner über den Rand schieben (der Spieler steht in der Mitte)
const kill = () => p.evaluate(() => { const W = SUMO.G.W; W.t = Math.max(W.t, 2.95); W.f.forEach((f, i) => { if (i) { f.x = 20; f.z = i; f.vx = 5; } else { f.x = 0; f.z = 0; f.vx = f.vz = 0; } }); });
await kill(); await p.waitForSelector('#ovRound:not([hidden])', { timeout: 15000 }); await wait(p, 400); await shot(p, '08-runde'); ok(true, 'Rundenende-Anzeige');
await p.waitForSelector('#ovRound', { state: 'hidden', timeout: 9000 }); await wait(p, 300); await p.evaluate(() => { SUMO.G.M.players[0].wins = SUMO.G.M.target - 1; }); await kill();
await p.waitForSelector('#ovEnd:not([hidden])', { timeout: 20000 }); await wait(p, 600); await shot(p, '09-ergebnis');
ok((await p.textContent('#eTitle')).includes('gewinnt'), 'Ergebnis-Bildschirm');
await p.click('#eMenu'); await wait(p, 300); ok((await st(p)).cur === 'sMenu', 'zurück ins Menü');
// Turnier: Mast-Ansage
await p.click('[data-go="tour"]'); await wait(p, 200); await p.click('#fGo'); await wait(p, 400); ok(await p.isVisible('#ovStage'), 'Turnier: Mast 1 Ansage'); await shot(p, '10-turnier');
await p.click('#sgGo'); await wait(p, 300); ok((await st(p)).tour && (await st(p)).cur === 'sGame', 'Turnier-Kampf');
await p.evaluate(() => { const G = SUMO.G, W = G.W; G.M.players[1].wins = G.M.target - 1; W.t = Math.max(W.t, 2.95); W.f.forEach((f, i) => { if (i !== 1) { f.x = 30 + i; f.z = 0; } else { f.x = 0; f.z = 0; } }); });
await p.waitForSelector('#ovEnd:not([hidden])', { timeout: 15000 }); ok((await p.textContent('#eTitle')).includes('Turnier vorbei'), 'Turnier verloren → Turnier vorbei');
await p.click('#eMenu'); await wait(p, 300);
// Lokal: zwei Tastatur-Spieler melden sich an
await p.click('[data-go="local"]'); await wait(p, 300);
await p.keyboard.press('Space'); await p.keyboard.press('Enter'); await p.keyboard.press('ArrowRight'); await wait(p, 200); await shot(p, '11-lokal');
await p.keyboard.press('Space'); await p.keyboard.press('Enter'); await wait(p, 1800); ok((await st(p)).cur === 'sOpts', 'Lokal: beide bereit → Optionen');
await p.click('#oCpu .chip[data-v="0"]'); await p.click('#oGo'); await wait(p, 300); s = await st(p); ok(s.cur === 'sGame' && s.wins.length === 2, 'Lokal: 2 Spieler ohne Computer');
await p.keyboard.press('Escape'); await p.click('#pQuit'); await wait(p, 300);
// Online-Lobby
await p.click('[data-go="online"]'); await wait(p, 2500); ok((await st(p)).cur === 'sLobby', 'Online-Lobby'); await shot(p, '12-lobby');
ok(errs.length === 0, 'keine JS-Fehler am PC ' + errs.join(' | '));

// Handy: Spiel mit Touch
const m = await page({ width: 412, height: 860 }, true);
await m.waitForSelector('#sTitle.on', { timeout: 15000 }); await m.tap('#bPress', { force: true }); await wait(m, 500); await shot(m, '13-handy-menue');
await m.tap('[data-go="quick"]'); await wait(m, 200); await m.tap('#fGo'); await wait(m, 200); await m.tap('#oGo'); await wait(m, 500); await m.evaluate(() => { SUMO.G.W.t = 2.9; }); await wait(m, 1500);
ok(await m.isVisible('#tDash'), 'Touch-Knöpfe sichtbar'); await m.tap('#tDash'); await wait(m, 800); await shot(m, '14-handy-kampf');
const pc = await page({ width: 412, height: 860 }, true, '?join=ABCD'); await pc.waitForSelector('#sPhone.on', { timeout: 15000 }); ok(await pc.isVisible('#bJoin'), 'Handy-Controller: Beitreten'); await shot(pc, '15-handy-controller');
ok(errs.length === 0, 'keine JS-Fehler ' + errs.join(' | '));
await b.close();
