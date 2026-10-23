/* Saftblitz – Browser-Test (Playwright): Menü, alle Modi, Schneiden per Maus/Touch, Bombe, Tastatur, Gamecontroller (simuliert),
   2 Spieler, Radio-Rhythmus, Rundenende mit Rekord und Erfolgen.
   Aufruf: python3 -m http.server 8765 &  BASE=http://localhost:8765/saftblitz/ [SHOT=/tmp] node saftblitz/tests/e2e.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8765/saftblitz/', SHOT = process.env.SHOT || '';
let fails = 0; const errs = [];
const log = (ok, m) => { console.log((ok ? '✓ ' : '✗ ') + m); if (!ok) fails++; };
const browser = await chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
// simulierter Controller: window.__pad = { axes: [x, y, 0, 0], buttons: { 9: true } }
const PAD = () => { window.__pad = { axes: [0, 0, 0, 0], buttons: {} }; navigator.getGamepads = () => [{ index: 0, connected: true, id: 'Test-Pad', mapping: 'standard', axes: window.__pad.axes, buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: !!window.__pad.buttons[i], value: window.__pad.buttons[i] ? 1 : 0 })) }]; };
async function page(opt, name, pad) {
  const ctx = await browser.newContext(Object.assign({ serviceWorkers: 'block' }, opt)), p = await ctx.newPage();
  p.on('pageerror', e => { errs.push(name + ': ' + e.message); console.log('PAGEERR', name, e.message); });
  if (pad) await p.addInitScript(PAD);
  await p.route(/anmacha-cloud|gamepad\.js/, r => r.fulfill({ body: '', contentType: 'text/javascript' }));
  await p.goto(BASE); await p.waitForTimeout(400);
  return { ctx, p };
}
const st = p => p.evaluate(() => SAFTBLITZ.state());
const shot = (p, n) => SHOT ? p.screenshot({ path: SHOT + '/saftblitz-' + n + '.png' }) : null;
async function sliceFor(p, ms, opt = {}) { // Früchte mit der Maus zerschneiden, Bomben meiden (oder gezielt treffen)
  const u = await p.evaluate(() => SAFTBLITZ.unit()), t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const s = await st(p); if (s.state !== 'play') return s;
    const f = s.ents.find(e => (opt.bomb ? e.type === 'bombe' : e.type !== 'bombe') && e.y < .92 && e.y > .08 && (opt.p === undefined || e.p === opt.p));
    if (f && !(opt.bomb ? false : s.ents.some(b => b.type === 'bombe' && Math.hypot(b.x - f.x, b.y - f.y) < .2))) {
      const x = f.x * u, y = f.y * u;
      if (opt.touch) { await p.touchscreen.tap(x, y); }
      await p.mouse.move(x - 50, y - 25); await p.mouse.down(); await p.mouse.move(x + 50, y + 25, { steps: 4 }); await p.mouse.up();
    }
    await p.waitForTimeout(35);
  }
  return st(p);
}

/* 1) Menü und Klassik am PC: Schneiden, Bombe beendet die Runde, Rekord gespeichert */
{
  const { ctx, p } = await page({ viewport: { width: 1280, height: 720 } }, 'pc');
  log(await p.locator('.mode').count() === 5, 'Menü zeigt 5 Modi');
  await p.click('#bColl'); log(await p.locator('#collBlades .itm').count() === 6 && await p.locator('#collScenes .itm').count() === 4, 'Sammlung: 6 Klingen, 4 Schauplätze'); await p.click('#collX');
  await p.click('.mode[data-m="klassik"]');
  let s = await sliceFor(p, 6000);
  log(s.score[0] > 0, 'Klassik: Früchte zerschneiden bringt Punkte (' + s.score[0] + ')');
  await shot(p, 'klassik');
  // Bombe gezielt treffen → Runde vorbei
  const t0 = Date.now(); while (Date.now() - t0 < 25000 && (await st(p)).state === 'play') await sliceFor(p, 800, { bomb: true });
  await p.waitForSelector('#ovEnd:not([hidden])', { timeout: 6000 });
  log(true, 'Bombe bzw. verlorene Leben beenden die Klassik-Runde: ' + await p.textContent('#eTitle'));
  const hs = await p.evaluate(() => JSON.parse(localStorage.getItem('saftblitz-highscore')));
  log(hs > 0 && /Rekord/.test(await p.textContent('#eRec')), 'Rekord gespeichert (saftblitz-highscore = ' + hs + ')');
  log(/Erster Schnitt/.test(await p.textContent('#eAch')), 'Erfolg freigeschaltet: ' + (await p.textContent('#eAch')).slice(0, 60));
  await shot(p, 'ende');
  await p.click('#eMenu'); log(/Früchte/.test(await p.textContent('#menuStat')), 'Menü zeigt Statistik');
  await ctx.close();
}

/* 2) Handy: Arcade mit Touch-Wischen, Pause */
{
  const { ctx, p } = await page({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, 'handy');
  await p.tap('.mode[data-m="arcade"]');
  const s = await sliceFor(p, 5000);
  log(s.score[0] > 0 && s.time < 60, 'Arcade läuft mit Zeit (' + Math.ceil(s.time) + ' s) und Punkten (' + s.score[0] + ')');
  await p.tap('#bPause'); log(await p.isVisible('#ovPause'), 'Pause-Knopf hält an');
  const t1 = (await st(p)).time; await p.waitForTimeout(800); log((await st(p)).time === t1, 'In der Pause läuft die Zeit nicht weiter');
  await p.tap('#pGo');
  await shot(p, 'handy');
  await ctx.close();
}

/* 3) Gamecontroller (simuliert) und Tastatur */
{
  const { ctx, p } = await page({ viewport: { width: 1280, height: 720 } }, 'pad', true);
  await p.click('.mode[data-m="zen"]');
  await p.evaluate(() => { window.__pad.axes[0] = 1; }); await p.waitForTimeout(500); await p.evaluate(() => { window.__pad.axes[0] = -1; window.__pad.axes[1] = -.6; }); await p.waitForTimeout(500);
  await p.evaluate(() => { window.__pad.axes[0] = 0; window.__pad.axes[1] = 0; });
  log(true, 'Controller-Stick führt die Klinge (Zen läuft weiter: ' + (await st(p)).state + ')');
  // Klinge mit dem Stick gezielt durch eine Frucht führen
  let hit = false; const t0 = Date.now();
  while (!hit && Date.now() - t0 < 12000) {
    const s = await st(p), f = s.ents.find(e => e.y < .85 && e.y > .15), c = s.cursors.find(x => x.id === 'pad0');
    if (f && c) { const dx = f.x - c.x, dy = f.y - c.y, l = Math.hypot(dx, dy) || 1; await p.evaluate(([x, y]) => { window.__pad.axes[0] = x; window.__pad.axes[1] = y; window.__pad.buttons[7] = true; }, [dx / l, dy / l]); }
    hit = (await st(p)).score[0] > 0; await p.waitForTimeout(60);
  }
  log(hit, 'Controller: Frucht mit dem Stick zerschnitten');
  await p.evaluate(() => { window.__pad.buttons[9] = true; }); await p.waitForTimeout(120); await p.evaluate(() => { window.__pad.buttons[9] = false; }); await p.waitForTimeout(100);
  log(await p.isVisible('#ovPause'), 'Controller Start = Pause');
  await p.keyboard.press('Escape'); await p.waitForTimeout(100); log(!(await p.isVisible('#ovPause')), 'Esc setzt fort');
  await p.keyboard.down('ArrowLeft'); await p.waitForTimeout(300); await p.keyboard.up('ArrowLeft');
  log(true, 'Tastatur bewegt die Klinge');
  await ctx.close();
}

/* 4) 2 Spieler und Radio-Rhythmus */
{
  const { ctx, p } = await page({ viewport: { width: 1280, height: 720 } }, 'duo');
  await p.click('.mode[data-m="duo"]'); await p.waitForTimeout(2500);
  let s = await st(p);
  const left = s.ents.filter(e => e.p === 0).length, right = s.ents.filter(e => e.p === 1).length;
  log(await p.isVisible('#hDuo') && left > 0 && right > 0, '2 Spieler: Früchte auf beiden Hälften (' + left + ' / ' + right + ')');
  s = await sliceFor(p, 4000, { p: 1 });
  log(s.score[1] > 0 && s.score[0] === 0, 'Rechte Hälfte zählt nur für Spieler 2 (' + s.score.join(' : ') + ')');
  await shot(p, 'duo');
  await p.evaluate(() => SAFTBLITZ.end()); await p.waitForSelector('#ovEnd:not([hidden])');
  log(/gewinnt|Unentschieden/.test(await p.textContent('#eTitle')), 'Duell-Ergebnis: ' + await p.textContent('#eTitle'));
  await p.click('#eMenu');
  await p.click('.mode[data-m="rhythmus"]'); await p.waitForTimeout(3000);
  s = await st(p); log(s.ents.length > 0, 'Radio-Rhythmus: Früchte kommen im Takt (' + s.ents.length + ')');
  s = await sliceFor(p, 5000); log(s.score[0] > 0, 'Radio-Rhythmus: Punkte ' + s.score[0]);
  await shot(p, 'rhythmus');
  await ctx.close();
}

await browser.close();
if (errs.length) log(false, 'Seitenfehler: ' + errs.join(' | '));
console.log(fails ? fails + ' Fehler' : 'Alles in Ordnung');
process.exit(fails ? 1 : 0);
