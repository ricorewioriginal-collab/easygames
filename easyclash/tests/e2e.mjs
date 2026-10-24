// EASYCLASH – Browser-Test (Playwright). node easyclash/tests/e2e.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
const base = process.argv[2] || 'http://localhost:8766/', out = process.argv[3] || '';
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'] });
const errs = [], ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) process.exitCode = 1; };
async function page(vp, touch, q) {
  const ctx = await b.newContext({ viewport: vp, hasTouch: !!touch, isMobile: !!touch, serviceWorkers: 'block' }), p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::|firebase|googleapis/i.test(m.text())) errs.push(m.text()); });
  await p.goto(base + 'easyclash/' + (q || ''), { waitUntil: 'commit' }); return p;
}
const shot = async (p, n) => { if (out) await p.screenshot({ path: out + '/ec-' + n + '.jpg', type: 'jpeg', quality: 80 }); };
const wait = (p, ms) => p.waitForTimeout(ms);
const st = p => p.evaluate(() => { const G = ECApp.G, W = G.W; return { cur: ECApp.cur, mode: G.mode, phase: W && W.phase, hp: W ? W.f.map(f => f.hp) : null, wins: G.M ? G.M.wins : null, ov: Array.from(document.querySelectorAll('.ov')).filter(o => !o.hidden).map(o => o.id) }; });
const fightReady = p => p.waitForFunction(() => ECApp.G.W && ECApp.G.W.phase === 'fight', null, { timeout: 30000 });

const p = await page({ width: 1280, height: 720 });
await p.waitForSelector('#loadBar'); await wait(p, 300); await shot(p, '01-laden');
await p.waitForSelector('#sTitle.on', { timeout: 60000 }); await wait(p, 700); await shot(p, '02-titel');
ok(await p.evaluate(() => Object.keys(ECApp.por()).length === EC_ROSTER.length), 'Vorschaubilder für alle ' + await p.evaluate(() => EC_ROSTER.length) + ' Kämpfer');
await p.keyboard.press('Enter'); await wait(p, 600); ok((await st(p)).cur === 'sMenu', 'Titel → Menü'); await shot(p, '03-menue');
ok(await p.evaluate(() => document.activeElement.dataset.go) === 'arcade', 'Arcade hat den Fokus');
// Gegen CPU: Kämpferwahl mit Pfeilen
await p.keyboard.press('ArrowDown'); ok(['versus', 'cpu', 'training'].includes(await p.evaluate(() => document.activeElement.dataset.go)), 'Pfeil runter bewegt den Fokus');
await p.focus('[data-go="cpu"]'); const go = 'cpu'; await p.keyboard.press('Enter'); await wait(p, 500);
ok((await st(p)).cur === 'sSelect', 'Kämpferwahl (' + go + ')');
await p.keyboard.press('ArrowRight'); await wait(p, 200); await shot(p, '04-auswahl'); await p.keyboard.press('Enter'); await wait(p, 300);
if (go !== 'arcade') { await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('Enter'); await wait(p, 400); }
let s = await st(p);
if (s.cur === 'sStage') { await shot(p, '05-arena'); ok(true, 'Arena-Wahl'); await p.click('#stGo'); }
await wait(p, 600); ok(await p.isVisible('#ovVs'), 'VS-Bildschirm'); await shot(p, '06-vs');
await fightReady(p); ok(true, 'Runde 1 → Kampf!'); await wait(p, 200);
// Tastatur: ran und Schlag-Kette
await p.keyboard.down('KeyD'); await wait(p, 900); await p.keyboard.up('KeyD');
await p.evaluate(() => { const W = ECApp.G.W; W.f[0].x = -.55; W.f[0].z = 0; W.f[1].x = .55; W.f[1].z = 0; W.f[1].state = 'idle'; W.f[0].state = 'idle'; W.f[0].y = W.f[1].y = 0; W.f[0].mv = W.f[1].mv = null; ECApp.G.W.ai_off = true; });
const hp0 = (await st(p)).hp[1];
for (const k of ['KeyU', 'KeyU', 'KeyU']) { await p.keyboard.press(k); await wait(p, 160); }
await wait(p, 300); s = await st(p); ok(s.hp[1] < hp0, 'Schlag-Kette trifft (' + hp0 + ' → ' + s.hp[1] + ')'); await shot(p, '07-kampf');
// Pause
await p.keyboard.press('Escape'); await wait(p, 200); ok((await st(p)).ov.includes('ovPause'), 'Esc = Pause'); await shot(p, '08-pause');
const t1 = await p.evaluate(() => ECApp.G.W.time); await wait(p, 800); ok(await p.evaluate(() => ECApp.G.W.time) === t1, 'Pause hält die Zeit an'); await p.click('#pGo');
// Runde per K.O. beenden, dann Match
for (let r = 0; r < 4; r++) {
  const s2 = await st(p); if (s2.ov.includes('ovEnd')) break;
  await fightReady(p); await p.evaluate(() => { const W = ECApp.G.W; W.ai_off = true; W.f[1].hp = 3; W.f[0].x = -.55; W.f[1].x = .55; W.f[0].z = W.f[1].z = 0; });
  for (let k = 0; k < 6; k++) { await p.keyboard.press('KeyU'); await wait(p, 180); }
  await p.waitForFunction(() => !document.getElementById('ovEnd').hidden || (ECApp.G.W && ECApp.G.W.phase === 'intro'), null, { timeout: 15000 }).catch(() => {});
  await wait(p, 600);
}
await p.waitForFunction(() => !document.getElementById('ovEnd').hidden, null, { timeout: 15000 }); await wait(p, 300); await shot(p, '09-ergebnis');
s = await st(p); ok(s.wins[0] >= 2, 'Match gewonnen (' + s.wins.join(':') + ')');
await p.click('#eMenu'); await wait(p, 400);
// Arcade
await p.click('[data-go="arcade"]'); await wait(p, 400); await p.click('#selGo'); await wait(p, 600); ok(await p.isVisible('#ovVs'), 'Arcade startet'); await fightReady(p);
await p.evaluate(() => { const W = ECApp.G.W; W.ai_off = true; W.f[1].hp = 3; W.f[0].x = -.55; W.f[1].x = .55; });
for (let r = 0; r < 3; r++) { await fightReady(p).catch(() => {}); await p.evaluate(() => { const W = ECApp.G.W; if (W && W.phase === 'fight') { W.ai_off = true; W.f[1].hp = 3; W.f[0].x = -.55; W.f[1].x = .55; W.f[0].z = W.f[1].z = 0; } }); for (let k = 0; k < 6; k++) { await p.keyboard.press('KeyU'); await wait(p, 180); } await p.waitForFunction(() => !document.getElementById('ovEnd').hidden || ECApp.G.W.phase === 'intro', null, { timeout: 15000 }).catch(() => {}); await wait(p, 500); if (await p.isVisible('#ovEnd')) break; }
await p.waitForFunction(() => !document.getElementById('ovEnd').hidden, null, { timeout: 15000 });
ok(await p.isVisible('#eNext') && (await p.textContent('#eStats')).includes('1 / 8'), 'Arcade: 1. Gegner besiegt, weiter zum nächsten'); await shot(p, '10-arcade');
await p.click('#eMenu'); await wait(p, 300);
// Controller (simuliert): zwei Pads für Versus
await p.evaluate(() => { const btn = () => Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })); window.__pads = [0, 1].map(i => ({ connected: true, axes: [0, 0, 0, 0], buttons: btn(), index: i, id: 'Test' + i })); navigator.getGamepads = () => window.__pads; });
const press = async (pi, i) => { await p.evaluate(([pi, i]) => { __pads[pi].buttons[i].pressed = true; }, [pi, i]); await wait(p, 90); await p.evaluate(([pi, i]) => { __pads[pi].buttons[i].pressed = false; }, [pi, i]); await wait(p, 110); };
await p.evaluate(() => document.querySelector('[data-go="versus"]').focus()); await press(0, 0); await wait(p, 300); ok((await st(p)).cur === 'sSelect', 'Controller: Versus geöffnet');
await press(0, 0); await press(1, 15); await press(1, 0); await wait(p, 300); ok((await st(p)).cur === 'sStage', 'Controller: beide Spieler gewählt');
await p.click('#stGo'); await fightReady(p);
await p.evaluate(() => { const W = ECApp.G.W; W.f[0].x = -.55; W.f[1].x = .55; W.f[0].z = W.f[1].z = 0; });
const hpA = (await st(p)).hp; await press(1, 2); await wait(p, 300); ok((await st(p)).hp[0] < hpA[0], 'Controller 2 steuert Spieler 2 (Schlag trifft Spieler 1)');
await press(0, 9); ok((await st(p)).ov.includes('ovPause'), 'Controller: Start = Pause'); await press(0, 1); ok(!(await st(p)).ov.length, 'Controller: B = weiter');
await p.evaluate(() => { navigator.getGamepads = () => []; });

// ---------- Handy: Touch ----------
const h = await page({ width: 390, height: 844 }, true, '?fight=ulk-gurke,hs-pingu&mode=cpu&stage=2');
await h.waitForFunction(() => window.ECApp && ECApp.cur === 'sGame', null, { timeout: 60000 }); await fightReady(h);
ok(await h.isVisible('#touch'), 'Touch-Knöpfe sichtbar');
await h.evaluate(() => { const W = ECApp.G.W; W.f[0].x = -.55; W.f[1].x = .55; W.f[0].z = W.f[1].z = 0; ECApp.G.mode = 'versus'; ECApp.G.human = [true, true]; });
const hpT = await h.evaluate(() => ECApp.G.W.f[1].hp);
const tap = sel => h.evaluate(sel => { const el = document.querySelector(sel), r = el.getBoundingClientRect(), o = { bubbles: true, pointerId: 3, pointerType: 'touch', clientX: r.left + 10, clientY: r.top + 10 }; el.dispatchEvent(new PointerEvent('pointerdown', o)); setTimeout(() => el.dispatchEvent(new PointerEvent('pointerup', o)), 60); }, sel);
await tap('.tb.t1'); await wait(h, 400); await tap('.tb.t3'); await wait(h, 600);
ok(await h.evaluate(() => ECApp.G.W.f[1].hp) < hpT, 'Touch: Schlag/Tritt treffen');
await wait(h, 300); await shot(h, '11-handy-kampf');
await h.evaluate(() => ECApp.openSelect('cpu')); await wait(h, 600); await shot(h, '12-handy-auswahl');

console.log(errs.length ? 'Fehler im Browser:\n' + errs.join('\n') : 'keine Browser-Fehler'); if (errs.length) process.exitCode = 1;
await b.close();
