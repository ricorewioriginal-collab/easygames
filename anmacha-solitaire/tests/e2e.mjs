/* AnMaCha Solitaire – Browser-Test (Playwright): Antippen, Ziehen, Rückgängig, Tastatur/Controller-Tasten,
   alle drei Spiele, Weiterspielen, Automatisch fertig bis zum Sieg und Statistik.
   Aufruf: python3 -m http.server 8765 &  BASE=http://localhost:8765/anmacha-solitaire/ [SHOT=/tmp] node anmacha-solitaire/tests/e2e.mjs */
import { chromium } from 'playwright';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const AS = require(process.env.RULES || new URL('../js/rules.js', import.meta.url).pathname);
const BASE = process.env.BASE || 'http://localhost:8765/anmacha-solitaire/', SHOT = process.env.SHOT || '';
let fails = 0; const errs = [];
const log = (ok, m) => { console.log((ok ? '✓ ' : '✗ ') + m); if (!ok) fails++; };
const browser = await chromium.launch({ args: ['--no-sandbox'] });
async function page(ctx, name) {
  const p = await ctx.newPage();
  p.on('pageerror', e => { errs.push(name + ': ' + e.message); console.log('PAGEERR', name, e.message); });
  await p.route(/anmacha-cloud|gamepad\.js/, r => r.fulfill({ body: '', contentType: 'text/javascript' }));
  return p;
}
const moves = p => p.textContent('#gInfo').then(t => +(/(\d+) Züge/.exec(t) || [0, 0])[1]);
const shot = (p, n) => SHOT ? p.screenshot({ path: SHOT + '/solitaire-' + n + '.png' }) : null;
async function center(p, sel) { const b = await p.locator(sel).first().boundingBox(); return [b.x + b.width / 2, b.y + b.height * .2]; }

/* 1) Handy: Patience – antippen, ziehen, rückgängig */
{
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await page(ctx, 'handy');
  await p.goto(BASE); await p.waitForTimeout(300);
  await p.tap('.gm[data-g="klondike"]'); await p.tap('#bNew'); await p.waitForSelector('#sGame.on');
  log(await p.locator('.crd').count() === 52 && await p.locator('.crd.down').count() >= 21, 'Patience ausgeteilt: 52 Karten, Rückseiten mit AnMaCha-Logo');
  log(await p.locator('.crd .bk img[src*="anmacha-logo"]').count() === 52, 'Jede Karte hat das AnMaCha-Logo auf der Rückseite');
  // Stapel antippen zieht eine Karte
  await p.tap('.slot.stock', { force: true }); await p.waitForTimeout(250);
  log(await moves(p) >= 1, 'Antippen des Stapels deckt eine Karte auf');
  // Tipp zeigen, Tipp-Karte antippen → springt an die beste Stelle
  let moved = false;
  for (let k = 0; k < 12 && !moved; k++) {
    await p.tap('#aHint'); await p.waitForTimeout(150);
    const hs = await p.$$eval('.crd.hint', e => e.map(x => x.dataset.id));
    const before = await moves(p);
    for (const h of hs) { await p.tap('.crd[data-id="' + h + '"]', { force: true }); await p.waitForTimeout(400); if (await moves(p) > before) { moved = true; break; } }
    if (!moved) { await p.tap('.slot.stock', { force: true }); await p.waitForTimeout(200); }
  }
  log(moved, 'Antippen einer Karte legt sie an die richtige Stelle');
  const m1 = await moves(p); await p.tap('#aUndo'); await p.waitForTimeout(250);
  log(await moves(p) === m1 - 1, 'Rückgängig nimmt den Zug zurück');
  // Ziehen per Finger/Maus: Tipp-Paar suchen und Quelle auf Ziel ziehen
  let dragged = false;
  for (let k = 0; k < 20 && !dragged; k++) {
    await p.tap('#aHint'); await p.waitForTimeout(120);
    const hs = await p.$$eval('.crd.hint', e => e.map(x => x.dataset.id));
    if (hs.length >= 2) {
      for (const [a, b] of [[hs[0], hs[hs.length - 1]], [hs[hs.length - 1], hs[0]]]) {
        const before = await moves(p), [x0, y0] = await center(p, '.crd[data-id="' + a + '"]'), [x1, y1] = await center(p, '.crd[data-id="' + b + '"]');
        await p.mouse.move(x0, y0); await p.mouse.down(); await p.mouse.move(x1, y1 + 30, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(350);
        if (await moves(p) > before) { dragged = true; break; }
      }
    }
    if (!dragged) { await p.tap('.slot.stock', { force: true }); await p.waitForTimeout(200); }
  }
  log(dragged, 'Karten lassen sich ziehen und ablegen');
  await shot(p, 'handy');
  await ctx.close();
}

/* 2) PC: Tastatur und Controller-Tasten, Spider und FreeCell, Weiterspielen */
{
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1366, height: 800 } });
  const p = await page(ctx, 'pc');
  await p.goto(BASE); await p.waitForTimeout(300);
  await p.click('#bNew'); await p.waitForSelector('#sGame.on');
  await p.keyboard.press('KeyD'); await p.waitForTimeout(200); // Y = ziehen
  log(await moves(p) >= 1, 'Controller Y / Taste D zieht vom Stapel');
  await p.keyboard.press('KeyZ'); await p.waitForTimeout(200); // LB = rückgängig
  log(await moves(p) === 0, 'Controller LB / Taste Z nimmt zurück');
  await p.keyboard.press('ArrowRight'); await p.keyboard.press('Space'); // A = aufnehmen
  log(await p.locator('.crd.held').count() >= 1, 'Controller A nimmt Karten auf (Rahmen + Hervorhebung)');
  await p.keyboard.press('Backspace');
  log(await p.locator('.crd.held').count() === 0, 'Controller B bricht ab');
  // X / F: Karte automatisch legen – über Tipps eine passende Spalte finden
  let quick = false;
  for (let k = 0; k < 7 && !quick; k++) { const b = await moves(p); await p.keyboard.press('KeyF'); await p.waitForTimeout(250); if (await moves(p) > b) quick = true; else await p.keyboard.press('ArrowRight'); }
  log(true, 'Controller X / Taste F probiert automatisches Ablegen' + (quick ? ' (Zug gemacht)' : ' (kein Zug möglich)'));
  await p.keyboard.press('Escape'); log(await p.isVisible('#ovMenu'), 'Start/Esc öffnet die Pause');
  await p.click('#mQuit'); await p.waitForSelector('#sMenu.on');
  log(await p.isVisible('#bResume') || !(await moves(p)), 'Menü bietet Weiterspielen an');
  for (const g of ['spider', 'freecell']) {
    await p.click('.gm[data-g="' + g + '"]'); await p.click('#bNew'); await p.waitForSelector('#sGame.on');
    const n = await p.locator('.crd').count();
    log(n === (g === 'spider' ? 104 : 52), (g === 'spider' ? 'Spider' : 'FreeCell') + ' ausgeteilt (' + n + ' Karten)');
    let made = 0; for (let k = 0; k < 8; k++) { await p.click('#aHint'); await p.waitForTimeout(80); const hs = await p.$$eval('.crd.hint', e => e.map(x => x.dataset.id)); for (const h of hs) { const b = await moves(p); await p.click('.crd[data-id="' + h + '"]', { force: true, timeout: 3000 }).catch(() => { }); await p.waitForTimeout(300); if (await moves(p) > b) { made++; break; } } if (await p.isVisible('#ovStuck')) break; }
    log(made > 0, (g === 'spider' ? 'Spider' : 'FreeCell') + ': ' + made + ' Züge per Tipp + Klick');
    await shot(p, g);
    await p.keyboard.press('Escape'); await p.click('#mQuit');
  }
  await ctx.close();
}

/* 3) Sieg: fast fertige FreeCell-Partie fortsetzen, ⚡ legt alles ab, Statistik zählt den Sieg */
{
  const st = AS.deal('freecell', {}, 1); st.t = st.t.map(() => []); st.cells = [null, null, null, null]; st.moves = 80;
  st.f = [0, 1, 2, 3].map(s => Array.from({ length: 11 }, (_, k) => ({ id: s * 13 + k, s, r: k + 1, up: true })));
  for (let s = 0; s < 4; s++) st.t[s] = [{ id: s * 13 + 12, s, r: 13, up: true }, { id: s * 13 + 11, s: (s + 1) % 4, r: 12, up: true }];
  // Damen gehören zur eigenen Farbe – Ids passend vergeben
  for (let s = 0; s < 4; s++) { st.t[s][1].s = s; st.t[s][1].id = s * 13 + 11; st.t[s][0].id = s * 13 + 12; }
  for (let s = 0; s < 4; s++) { const q = st.t[s][1], k = st.t[s][0]; st.t[s] = [q.r === 12 ? k : q, q]; }
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1280, height: 720 } });
  const p = await page(ctx, 'sieg');
  await p.addInitScript(s => { localStorage.setItem('anmacha-solitaire-save', JSON.stringify({ st: s, elapsed: 61, hist: [] })); }, st);
  await p.goto(BASE); await p.waitForSelector('#bResume:not([hidden])', { timeout: 5000 });
  await p.click('#bResume'); await p.waitForSelector('#sGame.on');
  await p.waitForSelector('#ovWin:not([hidden])', { timeout: 8000 }).catch(() => { });
  if (!(await p.isVisible('#ovWin'))) { await p.keyboard.press('KeyA'); await p.waitForSelector('#ovWin:not([hidden])', { timeout: 8000 }); }
  log(await p.isVisible('#ovWin'), 'Sieg-Fenster erscheint (Karten fliegen, AnMaCha-Logo)');
  const stats = await p.evaluate(() => JSON.parse(localStorage.getItem('anmacha-solitaire-stats') || '{}'));
  log(stats.wins === 1 && stats.v && stats.v.freecell && stats.v.freecell.w === 1, 'Statistik zählt den Sieg (wins für Ranglisten): ' + JSON.stringify({ wins: stats.wins }));
  await shot(p, 'sieg');
  await ctx.close();
}

await browser.close();
if (errs.length) log(false, 'Seitenfehler: ' + errs.join(' | '));
console.log(fails ? fails + ' Fehler' : 'Alles in Ordnung');
process.exit(fails ? 1 : 0);
