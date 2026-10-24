// Bowling-Bahn 3D – Browser-Test (Playwright). node bowling-bahn/tests/e2e.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
const base = process.argv[2] || 'http://localhost:8766/', out = process.argv[3] || '';
const args = ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'];
const b = await chromium.launch({ args });
const errs = [], ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) process.exitCode = 1; };
async function page(vp, touch, q) {
  const ctx = await b.newContext({ viewport: vp, hasTouch: !!touch, isMobile: !!touch, serviceWorkers: 'block' }), p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::|firebase|googleapis/i.test(m.text())) errs.push(m.text()); });
  await p.goto(base + 'bowling-bahn/' + (q || ''), { waitUntil: 'commit' }); return p;
}
const shot = async (p, n) => { if (out) await p.screenshot({ path: out + '/bw-' + n + '.jpg', type: 'jpeg', quality: 80 }); };
const wait = (p, ms) => p.waitForTimeout(ms);
const st = p => p.evaluate(() => { const A = BWApp.A, P = A.G && A.G.players[A.G.cur]; return { cur: BWApp.cur, mode: A.mode, phase: A.phase, aim: Object.assign({}, A.aim), power: A.power, player: A.G ? A.G.cur : -1, frame: P && P.frame, ball: P && P.ball, rolls: P && P.rolls.slice(), over: A.G && A.G.over, ov: Array.from(document.querySelectorAll('.ov')).filter(o => !o.hidden).map(o => o.id) }; });
const aimWait = (p, t) => p.waitForFunction(() => BWApp.A.phase === 'aim' || BWApp.A.phase === 'over', null, { timeout: t || 40000 });

const p = await page({ width: 1024, height: 600 });
await p.waitForSelector('#loadBar'); await wait(p, 200); await shot(p, '01-laden');
await p.waitForSelector('#sTitle.on', { timeout: 20000 }); await wait(p, 900); await shot(p, '02-titel');
await p.keyboard.press('Enter'); await wait(p, 500); ok((await st(p)).cur === 'sMenu', 'Titel → Hauptmenü'); await wait(p, 2500); await shot(p, '03-menue');
ok(await p.evaluate(() => document.activeElement.dataset.go) === 'solo', '„Einzelspiel“ hat den Fokus');
// Bowler wählen
await p.click('[data-go="fig"]'); await wait(p, 400); ok((await st(p)).cur === 'sFig', 'Bowler-Auswahl');
const n1 = await p.textContent('#figName'); await p.click('#figNext'); await wait(p, 1800); const n2 = await p.textContent('#figName');
ok(n1 !== n2 && (await p.textContent('#figCount')).includes('/ 69'), 'Blättern durch 69 Helden: ' + n1 + ' → ' + n2); await shot(p, '04-bowler');
await p.click('#figOk'); await wait(p, 300); ok(await p.evaluate(() => JSON.parse(localStorage.getItem('bowling-bahn-settings')).fig) !== 'rico', 'Bowler gespeichert');
// Einzelspiel
await p.click('[data-go="solo"]'); await wait(p, 900);
let s = await st(p); ok(s.cur === 'sGame' && s.mode === 'solo' && s.phase === 'aim' && s.frame === 0, 'Einzelspiel startet');
await wait(p, 1200); await shot(p, '05-zielen');
await p.keyboard.down('ArrowRight'); await wait(p, 700); await p.keyboard.up('ArrowRight'); s = await st(p); ok(s.aim.x > .05, 'Pfeil rechts verschiebt den Startpunkt');
await p.keyboard.press('ArrowUp'); ok((await st(p)).aim.spin > 0, 'Pfeil hoch = Effet');
await p.keyboard.down('KeyA'); await wait(p, 300); await p.keyboard.up('KeyA'); ok((await st(p)).aim.angle < 0, 'A dreht die Richtung');
// Wurf per Leertaste
await p.evaluate(() => { Object.assign(BWApp.A.aim, { x: .06, angle: -.003, spin: 0 }); });
await p.keyboard.down('Space'); await wait(p, 700); await p.keyboard.up('Space');
await p.waitForFunction(() => BWApp.A.phase === 'roll', null, { timeout: 8000 }).then(() => ok(true, 'Leertaste: Anlauf und Wurf'), () => ok(false, 'Leertaste: Anlauf und Wurf'));
await p.waitForFunction(() => BWApp.A.L.ball && BWApp.A.L.ball.z > 15, null, { timeout: 15000 }).catch(() => { }); await shot(p, '06-kugel-rollt');
await p.waitForFunction(() => BWApp.A.phase === 'show', null, { timeout: 30000 }); await wait(p, 300); await shot(p, '07-kegel');
await aimWait(p); s = await st(p);
ok(s.rolls.length === 1 && (s.rolls[0] === 10 ? s.frame === 1 : s.ball === 1), 'Wurf gezählt: ' + s.rolls[0] + ' Kegel');
ok((await p.textContent('#board')).length > 3, 'Anzeigetafel zeigt den Wurf');
// Pause
await p.keyboard.press('Escape'); await wait(p, 200); ok((await st(p)).ov.includes('ovPause'), 'Esc = Pause'); await shot(p, '08-pause'); await p.click('#pGo'); await wait(p, 200);
// Rest des Spiels schnell: Würfe direkt auslösen (Testtempo ×4)
await p.evaluate(() => { BWApp.A.speed = 4; });
for (let k = 0; k < 30; k++) {
  s = await st(p); if (s.over || s.phase === 'over') break;
  await p.evaluate(() => BWApp.commit({ x: .1, angle: -.004, spin: .6, speed: 8.3 })); await wait(p, 100); await aimWait(p, 40000);
}
await p.waitForFunction(() => !document.getElementById('ovEnd').hidden, null, { timeout: 8000 }).catch(() => { });
s = await st(p); ok(s.over && s.ov.includes('ovEnd'), 'Spiel endet nach 10 Frames (' + s.rolls.length + ' Würfe)');
const tot = await p.evaluate(() => BW.total(BWApp.A.G.players[0].rolls)); ok((await p.textContent('#eTitle')).includes(String(tot)), 'Ergebnis: ' + tot + ' Punkte');
ok(await p.evaluate(() => +localStorage.getItem('bowling-bahn-highscore')) === tot, 'Highscore gespeichert'); await wait(p, 400); await shot(p, '09-ende');
await p.click('#eMenu'); await wait(p, 300); await p.evaluate(() => { BWApp.A.speed = 1; });
// Rekorde, Anleitung
await p.click('[data-go="rec"]'); await wait(p, 200); ok((await p.textContent('#recList')).includes('Bestes Spiel'), 'Rekorde'); await shot(p, '10-rekorde'); await p.click('#recX');
await p.click('[data-go="help"]'); await wait(p, 200); await shot(p, '11-anleitung'); await p.click('#helpX');
// Party mit 3 Spielern, einer davon CPU
await p.click('[data-go="party"]'); await wait(p, 400); ok((await st(p)).cur === 'sSetup', 'Party-Einrichtung');
await p.click('#slAdd'); await p.fill('.slot input[data-i="0"]', 'Mia'); await p.click('[data-k="2"]'); await wait(p, 200); await shot(p, '12-party');
ok((await p.locator('.slot').count()) === 3 && (await p.textContent('[data-k="2"]')).includes('CPU'), '3 Plätze, Platz 3 = CPU');
await p.click('#setGo'); await wait(p, 800); await p.evaluate(() => { BWApp.A.speed = 4; }); s = await st(p);
ok(s.mode === 'party' && await p.evaluate(() => BWApp.A.G.players.map(x => x.name).join()) === 'Mia,Spieler 2,Spieler 3', 'Party startet mit 3 Spielern');
await p.evaluate(() => BWApp.commit({ x: 0, angle: 0, spin: 0, speed: 8 })); await aimWait(p); await wait(p, 100);
if ((await st(p)).player === 0) { await p.evaluate(() => BWApp.commit({ x: .3, angle: 0, spin: 0, speed: 8 })); await aimWait(p); }
s = await st(p); ok(s.player === 1, 'Nach Spieler 1 ist Spieler 2 dran');
await p.evaluate(() => BWApp.commit({ x: .45, angle: .05, spin: 0, speed: 8 })); await aimWait(p);
if ((await st(p)).player === 1) { await p.evaluate(() => BWApp.commit({ x: .45, angle: .05, spin: 0, speed: 8 })); await aimWait(p); }
ok((await st(p)).player === 2, 'Dann die CPU');
await p.waitForFunction(() => BWApp.A.G.cur === 0, null, { timeout: 60000 }).then(() => ok(true, 'CPU wirft selbst, dann wieder Spieler 1'), () => ok(false, 'CPU wirft selbst'));
await wait(p, 600); await shot(p, '13-party-tafel');
await b.close();

// Handy hochkant: Wischen
const b2 = await chromium.launch({ args });
const m = await (await b2.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' })).newPage();
m.on('pageerror', e => errs.push(e.message));
await m.goto(base + 'bowling-bahn/', { waitUntil: 'commit' }); await m.waitForSelector('#sTitle.on', { timeout: 20000 }); await wait(m, 500);
await m.tap('#bPress', { force: true }); await wait(m, 1500); if (out) await m.screenshot({ path: out + '/bw-20-handy-menue.jpg', type: 'jpeg', quality: 80 });
await m.tap('[data-go="solo"]'); await wait(m, 1500); if (out) await m.screenshot({ path: out + '/bw-21-handy-zielen.jpg', type: 'jpeg', quality: 80 });
const sw = (pts, id) => m.evaluate(async ([pts, id]) => { const z = document.getElementById('aimZone'), ev = (t, x, y) => z.dispatchEvent(new PointerEvent(t, { pointerId: id, clientX: x, clientY: y, bubbles: true, pointerType: 'touch' })); ev('pointerdown', pts[0][0], pts[0][1]); for (const q of pts.slice(1)) { ev('pointermove', q[0], q[1]); await new Promise(r => setTimeout(r, 12)); } const l = pts[pts.length - 1]; ev('pointerup', l[0], l[1]); }, [pts, id]);
// seitlich ziehen
const x0 = await m.evaluate(() => BWApp.A.aim.x); await sw([[195, 700], [215, 702], [235, 703], [255, 703], [275, 704]], 3);
ok(await m.evaluate(() => BWApp.A.aim.x) > x0 + .05, 'Handy: seitlich ziehen verschiebt die Kugel');
// nach oben wischen mit Bogen nach links am Ende
const pts = []; for (let k = 0; k <= 12; k++) pts.push([200 + (k > 8 ? -(k - 8) * 9 : 0), 720 - k * 32]);
await sw(pts, 4); await wait(m, 200);
const t = await m.evaluate(() => ({ ph: BWApp.A.phase, pend: BWApp.A.pend }));
ok(t.ph !== 'aim' && t.pend && t.pend.spin > 0, 'Handy: nach oben wischen = Wurf mit Effet (' + JSON.stringify(t.pend) + ')');
await wait(m, 2500); if (out) await m.screenshot({ path: out + '/bw-22-handy-rollt.jpg', type: 'jpeg', quality: 80 });
await b2.close();
ok(!errs.length, 'Keine Skriptfehler ' + errs.slice(0, 3).join(' | '));
