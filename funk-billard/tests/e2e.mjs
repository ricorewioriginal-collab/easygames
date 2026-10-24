// Funk-Billard 3D – Browser-Test (Playwright). node funk-billard/tests/e2e.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
const base = process.argv[2] || 'http://localhost:8766/', out = process.argv[3] || '';
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'] });
const errs = [], ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) process.exitCode = 1; };
async function page(vp, touch, q) {
  const ctx = await b.newContext({ viewport: vp, hasTouch: !!touch, isMobile: !!touch, serviceWorkers: 'block' }), p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::|firebase|googleapis/i.test(m.text())) errs.push(m.text()); });
  await p.goto(base + 'funk-billard/' + (q || ''), { waitUntil: 'commit' }); return p;
}
const shot = async (p, n) => { if (out) await p.screenshot({ path: out + '/fb-' + n + '.jpg', type: 'jpeg', quality: 80 }); };
const wait = (p, ms) => p.waitForTimeout(ms);
const st = p => p.evaluate(() => { const A = FBApp.A, g = A.G; return { cur: FBApp.cur, mode: A.mode, phase: g.phase, turn: g.turn, shots: g.shots.slice(), over: g.over, inHand: g.inHand, ang: A.ang, power: A.power, spin: A.spin, cue: [g.balls[0].x, g.balls[0].z], ov: Array.from(document.querySelectorAll('.ov')).filter(o => !o.hidden).map(o => o.id), msg: document.getElementById('msg').textContent }; });
const rest = p => p.waitForFunction(() => FBApp.A.G.phase !== 'roll' && !FBApp.A.strike, null, { timeout: 40000 });

const p = await page({ width: 1280, height: 760 });
await p.waitForSelector('#loadBar'); await wait(p, 200); await shot(p, '01-laden');
await p.waitForSelector('#sTitle.on', { timeout: 20000 }); await wait(p, 800); await shot(p, '02-titel');
await p.keyboard.press('Enter'); await wait(p, 500); ok((await st(p)).cur === 'sMenu', 'Titel → Hauptmenü'); await wait(p, 2500); await shot(p, '03-menue');
ok(await p.evaluate(() => document.activeElement.dataset.go) === 'cpu', '„Gegen CPU“ hat den Fokus');
ok(await p.isVisible('.tile.online') && (await p.textContent('.tile.online')).includes('Online'), '🌐 Online im Menü');
await p.keyboard.press('ArrowDown'); ok(['duo', 'online', 'training'].includes(await p.evaluate(() => document.activeElement.dataset.go)), 'Pfeiltasten bewegen den Fokus');
await p.keyboard.press('ArrowUp'); await p.keyboard.press('Enter'); await wait(p, 300);
ok((await st(p)).ov.includes('ovDiff'), 'Stärke-Auswahl'); await shot(p, '04-staerke');
await p.keyboard.press('Enter'); await wait(p, 600);
let s = await st(p); ok(s.cur === 'sGame' && s.mode === 'cpu' && s.turn === 0 && s.phase === 'aim', 'Spiel gegen CPU startet ' + JSON.stringify(s));
await wait(p, 900); await shot(p, '05-anstoss');
// Zielen mit Pfeilen, Effet, Ansicht
const a0 = s.ang; await p.keyboard.down('ArrowRight'); await wait(p, 300); await p.keyboard.up('ArrowRight');
s = await st(p); ok(s.ang > a0 + .1, 'Pfeil rechts dreht das Ziel');
await p.keyboard.press('ArrowUp'); ok((await st(p)).spin > 0, 'Pfeil hoch = Nachläufer'); await p.keyboard.press('ArrowDown');
// Weiße hinter der Linie verschieben (Anstoß)
const c0 = s.cue; await p.keyboard.down('KeyS'); await wait(p, 250); await p.keyboard.up('KeyS');
ok((await st(p)).cue[1] > c0[1] + .02, 'Weiße beim Anstoß verschiebbar');
// Anstoß: zurück aufs Ziel, ausholen
await p.evaluate(() => { FBApp.A.ang = 0; }); await p.keyboard.down('Space'); await wait(p, 1000); await p.keyboard.up('Space'); await p.waitForFunction(() => FBApp.A.G.shots[0] === 1, null, { timeout: 5000 }).catch(() => { });
s = await st(p); ok(s.shots[0] === 1 && (s.phase === 'roll' || s.phase === 'aim'), 'Leertaste: ausholen und stoßen ' + JSON.stringify(s.shots));
await wait(p, 600); await shot(p, '06-anstoss-rollt');
await rest(p); s = await st(p); ok(s.phase === 'aim' || s.over, 'Kugeln kommen zur Ruhe – ' + s.msg);
// Pause
await p.keyboard.press('Escape'); await wait(p, 200); ok((await st(p)).ov.includes('ovPause'), 'Esc = Pause'); await shot(p, '07-pause');
await p.click('#pGo'); await wait(p, 150);
// Draufsicht
await p.keyboard.press('KeyV'); await wait(p, 900); ok(await p.evaluate(() => FBScene.view === 'top'), 'V = Draufsicht'); await shot(p, '08-draufsicht'); await p.keyboard.press('KeyV');
// CPU spielt, wenn sie dran ist
await p.evaluate(() => { const g = FBApp.A.G; g.turn = 1; g.inHand = false; FBApp.A.aiT = .2; });
await p.waitForFunction(() => FBApp.A.G.shots[1] >= 1, null, { timeout: 8000 }).then(() => ok(true, 'CPU stößt selbst'), () => ok(false, 'CPU stößt selbst'));
await rest(p);
// Ball in der Hand nach Foul (Weiße versenkt)
await p.evaluate(() => { const g = FBApp.A.G; g.turn = 0; g.breakShot = false; g.inHand = false; const c = g.balls[0]; c.x = FB.POCKETS[0][0] + .15; c.z = FB.POCKETS[0][1] + .15; FBApp.A.ang = Math.atan2(-1, -1); for (const b of g.balls) if (b.n && Math.hypot(b.x - c.x, b.z - c.z) < .3) { b.in = true; } });
await p.evaluate(() => FBApp.strike(.5)); await rest(p); s = await st(p);
ok(s.turn === 1 && s.inHand && /Foul/.test(s.msg), 'Weiße versenkt = Foul, Gegner hat Ball in der Hand: ' + s.msg);
// Sieg: nur noch die 8 übrig, eigene Gruppe frei
await wait(p, 200);
await p.evaluate(() => { const A = FBApp.A, g = A.G; A.aiPlan = null; A.aiT = 99; g.turn = 0; g.inHand = false; g.groups = ['solid', 'stripe']; for (const b of g.balls) if (b.n && b.n !== 8 && b.n < 8) b.in = true; const e = g.balls.find(b => b.n === 8), pk = FB.POCKETS[2]; e.in = false; e.x = pk[0] - .12; e.z = pk[1] + .12; const c = g.balls[0]; c.in = false; c.x = e.x - .3; c.z = e.z + .3; for (const b of g.balls) if (b.n > 8 && Math.hypot(b.x - e.x, b.z - e.z) < .4) b.in = true; A.ang = Math.atan2(pk[1] - c.z, pk[0] - c.x); });
await p.evaluate(() => FBApp.strike(.55)); await rest(p);
await p.waitForFunction(() => !document.getElementById('ovEnd').hidden, null, { timeout: 6000 }).catch(() => { });
s = await st(p); ok(s.over && s.ov.includes('ovEnd') && (await p.textContent('#eTitle')).includes('Gewonnen'), 'Die 8 zuletzt = gewonnen: ' + (await p.textContent('#eTitle')));
await wait(p, 400); await shot(p, '09-sieg');
ok(await p.evaluate(() => +localStorage.getItem('funk-billard-highscore')) >= 2, 'Highscore (Punkte) gespeichert');
await p.click('#eMenu'); await wait(p, 400); ok((await st(p)).cur === 'sMenu', 'Zurück ins Menü');
// Rekorde, Optionen, Anleitung, Online-Fenster
await p.click('[data-go="rec"]'); await wait(p, 200); ok((await p.textContent('#recList')).includes('Punkte'), 'Rekorde'); await shot(p, '10-rekorde'); await p.click('#recX');
await p.click('[data-go="help"]'); await wait(p, 200); await shot(p, '11-anleitung'); await p.click('#helpX');
await p.click('[data-go="online"]'); await wait(p, 300); ok((await st(p)).cur === 'sOnline' && (await p.textContent('#sOnline')).includes('von überall'), 'Online-Fenster mit Hinweis'); await shot(p, '12-online');
await p.click('#oBack'); await wait(p, 300);
// Zu zweit: Wechsel nach Fehlstoß
await p.click('[data-go="duo"]'); await wait(p, 500); s = await st(p); ok(s.mode === 'duo' && s.turn === 0, 'Zu zweit startet');
await p.evaluate(() => FBApp.strike(1)); await rest(p); await wait(p, 200); s = await st(p); ok(s.phase === 'aim' && s.shots[0] === 1, 'Zu zweit: Anstoß ausgeführt (' + s.msg + ')');
// Training
await p.evaluate(() => FBApp.toMenu()); await wait(p, 300); await p.click('[data-go="training"]'); await wait(p, 500); s = await st(p); ok(s.mode === 'training' && await p.isHidden('#pl1'), 'Training ohne Gegner');
await p.evaluate(() => FBApp.strike(.9)); await rest(p); s = await st(p); ok(s.turn === 0, 'Training: immer du dran');
await b.close();

// Handy hochkant mit Touch
const b2 = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'] });
const ctx = await b2.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' }), m = await ctx.newPage();
m.on('pageerror', e => errs.push(e.message));
await m.goto(base + 'funk-billard/', { waitUntil: 'commit' }); await m.waitForSelector('#sTitle.on', { timeout: 20000 }); await wait(m, 600);
await m.tap('#bPress', { force: true }); await wait(m, 1500); await m.screenshot({ path: out ? out + '/fb-20-handy-menue.jpg' : '/dev/null', type: 'jpeg', quality: 80 });
await m.tap('[data-go="cpu"]'); await wait(m, 300); await m.tap('[data-lv="0"]'); await wait(m, 1200);
const sm = () => m.evaluate(() => ({ ang: FBApp.A.ang, power: FBApp.A.power, shots: FBApp.A.G.shots[0], cur: FBApp.cur }));
let t = await sm(); ok(t.cur === 'sGame', 'Handy: Spiel startet');
if (out) await m.screenshot({ path: out + '/fb-21-handy-spiel.jpg', type: 'jpeg', quality: 80 });
// Wischen auf dem Tisch dreht
const a1 = t.ang; await m.evaluate(async () => { const z = document.getElementById('aimZone'), ev = (type, x) => z.dispatchEvent(new PointerEvent(type, { pointerId: 7, clientX: x, clientY: 420, bubbles: true, pointerType: 'touch' })); ev('pointerdown', 150); for (let x = 150; x <= 250; x += 10) { ev('pointermove', x); await new Promise(r => setTimeout(r, 16)); } ev('pointerup', 250); });
t = await sm(); ok(Math.abs(t.ang - a1) > .2, 'Handy: Wischen dreht das Ziel');
// Kraftbalken ziehen
const r = await m.evaluate(() => { const q = document.getElementById('power').getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top, h: q.height }; });
await m.evaluate(async r => { const z = document.getElementById('power'), ev = (type, y) => z.dispatchEvent(new PointerEvent(type, { pointerId: 8, clientX: r.x, clientY: y, bubbles: true, pointerType: 'touch' })); ev('pointerdown', r.y + 10); for (let y = r.y + 10; y < r.y + r.h * .7; y += 20) { ev('pointermove', y); await new Promise(x => setTimeout(x, 16)); } }, r);
t = await sm(); ok(t.power > .4, 'Handy: Kraftbalken lädt (' + t.power.toFixed(2) + ')');
if (out) await m.screenshot({ path: out + '/fb-22-handy-kraft.jpg', type: 'jpeg', quality: 80 });
await m.evaluate(r => document.getElementById('power').dispatchEvent(new PointerEvent('pointerup', { pointerId: 8, clientX: r.x, clientY: r.y + r.h * .7, bubbles: true })), r);
await wait(m, 300); t = await sm(); ok(t.shots === 1, 'Handy: Loslassen = Stoß');
await wait(m, 700); if (out) await m.screenshot({ path: out + '/fb-23-handy-rollt.jpg', type: 'jpeg', quality: 80 });
await b2.close();
ok(!errs.length, 'Keine Skriptfehler ' + errs.slice(0, 3).join(' | '));
