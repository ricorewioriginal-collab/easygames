/* Browser-Rauchtest (Playwright): Menüs, ganze Partie per Maus, Tastatur, Touch am Handy, Fortsetzen, Iframe.
 *   python3 -m http.server 8765 &   (im Repo-Hauptordner)
 *   node mahjong/tests/smoke.js [Ausgabeordner für Bilder] */
'use strict';
const { chromium } = require('playwright');
const BASE = process.env.MJ_URL || 'http://localhost:8765/mahjong/';
const OUT = process.argv[2] || '';
let fails = 0;
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fails++; };

async function open(browser, vp, extra) {
  const ctx = await browser.newContext(Object.assign({ viewport: vp, deviceScaleFactor: 1 }, extra || {}));
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/favicon|ERR_|net::|Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await page.goto(BASE);
  await page.waitForSelector('#scrMenu:not([hidden])', { timeout: 15000 });
  return { ctx, page, errs };
}
const shot = (page, name) => OUT ? page.screenshot({ path: OUT + '/' + name + '.png' }) : null;
// Paar anklicken/antippen (Bildschirmmitte der Steine)
async function clickTile(page, i, touch) {
  const p = await page.evaluate(i => MJApp.R.screenOf(i), i);
  if (touch) await page.touchscreen.tap(p.x, p.y); else await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(60);
}
async function solve(page, touch, maxPairs) {
  const sol = await page.evaluate(() => MJApp.game.solution);
  let n = 0;
  for (const [a, b] of sol) {
    if (maxPairs && n >= maxPairs) break;
    await clickTile(page, a, touch); await clickTile(page, b, touch); n++;
    const dead = await page.evaluate(([a, b]) => !MJApp.game.alive[a] && !MJApp.game.alive[b], [a, b]);
    if (!dead) {
      const info = await page.evaluate(([a, b]) => { const R = MJApp.R, g = MJApp.game; return [a, b].map(i => { const p = R.screenOf(i); return { i, free: g.isFree(i), pick: R.pick(p.x, p.y), sel: g.selected, p }; }); }, [a, b]);
      console.log('  Paar nicht abgeräumt:', JSON.stringify(info));
      return n - 1;
    }
  }
  return n;
}

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

  // ---------- PC: Reise Level 1 komplett mit der Maus ----------
  {
    const { ctx, page, errs } = await open(browser, { width: 1280, height: 760 });
    await shot(page, 'pc-menu');
    await page.click('#btnJourney'); await page.waitForSelector('#scrWorlds:not([hidden])');
    await shot(page, 'pc-worlds');
    await page.click('.world >> nth=0'); await page.waitForSelector('#scrLevels:not([hidden])');
    await shot(page, 'pc-levels');
    await page.click('.lvl >> nth=0');
    await page.waitForSelector('#modal:not([hidden])'); await page.click('#modalActions .btn.primary');
    await page.waitForTimeout(400);
    await shot(page, 'pc-game');
    const before = await page.evaluate(() => MJApp.game.remaining());
    // blockierten Stein anklicken: darf nichts abräumen
    const blocked = await page.evaluate(() => { const g = MJApp.game; for (let i = 0; i < g.g.n; i++) if (g.alive[i] && !g.isFree(i)) return i; return -1; });
    if (blocked >= 0) {
      const vis = await page.evaluate(i => { const p = MJApp.R.screenOf(i); return MJApp.R.pick(p.x, p.y) === i; }, blocked);
      if (vis) { await clickTile(page, blocked); ok(await page.evaluate(() => MJApp.game.selected) === -1, 'blockierter Stein lässt sich nicht wählen'); }
    }
    await page.click('#btnHint'); await page.waitForTimeout(200);
    ok(await page.evaluate(() => !!MJApp.hint), 'Tipp markiert ein Paar');
    const n = await solve(page, false);
    await page.waitForSelector('#modal:not([hidden])', { timeout: 8000 });
    const title = await page.textContent('#modalTitle');
    ok(n * 2 === before && /Geschafft/.test(title), 'Level 1-1 per Maus gelöst (' + before + ' Steine)');
    await page.waitForTimeout(1500);
    await shot(page, 'pc-win');
    const rec = await page.evaluate(() => JSON.parse(localStorage.getItem('easygames.mahjong.v1')).lv['w1-1']);
    ok(rec && rec.s >= 1, 'Ergebnis gespeichert (' + JSON.stringify(rec) + ')');
    ok(await page.evaluate(() => !!JSON.parse(localStorage.getItem('anmacha-gameach.mahjong')).u.sieg1), 'Erfolg „Erster Sieg“ im easygames-Schlüssel');
    // Nächstes Level, Rückgängig, Pause, Hauptmenü, Weiterspielen
    await page.click('#modalActions .btn.primary'); await page.waitForTimeout(400);
    ok(await page.evaluate(() => MJApp.def && MJApp.def.id === 'w1-2'), 'Nächstes Level startet');
    const s2 = await page.evaluate(() => MJApp.game.solution);
    await clickTile(page, s2[0][0]); await clickTile(page, s2[0][1]);
    const r1 = await page.evaluate(() => MJApp.game.remaining());
    await page.click('#btnUndo'); await page.waitForTimeout(500);
    ok(await page.evaluate(() => MJApp.game.remaining()) === r1 + 2, 'Rückgängig stellt das Paar wieder her');
    await page.click('#btnShuffle'); await page.waitForTimeout(900);
    ok(await page.evaluate(() => MJApp.game.shuffles === 1 && MJApp.game.moves().length > 0), 'Mischen funktioniert');
    await page.keyboard.press('Escape'); await page.waitForSelector('#modal:not([hidden])');
    ok(/Pause/.test(await page.textContent('#modalTitle')), 'Esc öffnet die Pause');
    await page.click('#modalActions .btn >> text=Hauptmenü'); await page.waitForSelector('#scrMenu:not([hidden])');
    ok(!(await page.isHidden('#btnContinue')), '„Weiterspielen“ wird angeboten');
    await page.click('#btnContinue'); await page.waitForTimeout(400);
    ok(await page.evaluate(() => MJApp.def && MJApp.def.id === 'w1-2' && MJApp.game.shuffles === 1), 'Partie wird fortgesetzt');
    // Tastatur: Cursor und Enter
    await page.evaluate(() => { MJApp.ui.closeModal(); });
    await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowDown');
    const cur = await page.evaluate(() => MJApp.cursor);
    await page.keyboard.press('Enter');
    ok(cur >= 0 && await page.evaluate(() => MJApp.game.selected) === cur, 'Tastatur: Pfeile + Enter wählen einen freien Stein');
    await page.keyboard.press('h'); await page.waitForTimeout(100);
    ok(await page.evaluate(() => !!MJApp.hint), 'Taste H gibt einen Tipp');
    await shot(page, 'pc-keys');
    // Esc wählt zuerst ab, P pausiert; Menüs mit Tastatur
    await page.keyboard.press('Escape');
    ok(await page.evaluate(() => MJApp.game.selected === -1 && !MJApp.ui.modalOpen), 'Esc hebt die Auswahl auf');
    await page.keyboard.press('p'); await page.waitForSelector('#modal:not([hidden])');
    await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowUp'); await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    ok(await page.evaluate(() => !MJApp.ui.modalOpen && !MJApp.paused), 'Pause-Menü per Tastatur bedienbar (Weiter)');
    // weitere Bildschirme
    for (const s of ['scrFree', 'scrDaily', 'scrBlitz', 'scrStats', 'scrSettings', 'scrGuide']) {
      await page.evaluate(s => MJApp.toMenu(s), s); await page.waitForTimeout(150);
      ok(await page.isVisible('#' + s), 'Bildschirm ' + s); await shot(page, 'pc-' + s);
    }
    // Einstellungen: Stil „Klar“
    await page.evaluate(() => MJApp.toMenu('scrSettings'));
    await page.click('[data-opt="style"][data-val="clear"]');
    ok(await page.evaluate(() => MJApp.save.opt.style === 'clear'), 'Einstellung „Klar“ gespeichert');
    // Zeitjagd und Zen starten
    await page.evaluate(() => MJApp.startBlitz()); await page.waitForTimeout(300);
    ok(await page.evaluate(() => MJApp.mode === 'blitz' && MJApp.blitz.left > 0), 'Zeitjagd startet');
    await shot(page, 'pc-blitz');
    await page.evaluate(() => MJApp.startZen()); await page.waitForTimeout(300);
    ok(await page.evaluate(() => MJApp.mode === 'zen'), 'Zen startet');
    await page.evaluate(() => MJApp.startDaily()); await page.waitForTimeout(300);
    ok(await page.evaluate(() => MJApp.mode === 'daily' && MJApp.game.total() >= 100), 'Tagesrätsel startet');
    await shot(page, 'pc-daily');
    ok(!errs.length, 'PC ohne Fehler' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await ctx.close();
  }

  // ---------- Handy hochkant: Touch ----------
  {
    const { ctx, page, errs } = await open(browser, { width: 390, height: 844 }, { hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    await shot(page, 'phone-menu');
    await page.tap('#btnJourney'); await page.tap('.world >> nth=0'); await page.tap('.lvl >> nth=0');
    await page.waitForSelector('#modal:not([hidden])'); await page.tap('#modalActions .btn.primary');
    await page.waitForTimeout(300);
    await shot(page, 'phone-game');
    const total = await page.evaluate(() => MJApp.game.remaining());
    const n = await solve(page, true);
    await page.waitForSelector('#modal:not([hidden])', { timeout: 8000 });
    ok(n * 2 === total, 'Handy: Level per Touch gelöst');
    await page.waitForTimeout(1200);
    await shot(page, 'phone-win');
    // großes Brett: Steine müssen per Touch treffbar sein
    await page.evaluate(() => MJApp.startFree('schildkroete', 7)); await page.waitForTimeout(300);
    await shot(page, 'phone-turtle');
    const hit = await page.evaluate(() => { const g = MJApp.game, f = g.freeList(); let h = 0; for (const i of f) { const p = MJApp.R.screenOf(i); if (MJApp.R.pick(p.x, p.y) === i) h++; } return [h, f.length]; });
    ok(hit[0] === hit[1], 'Handy: alle freien Steine treffbar (' + hit[0] + '/' + hit[1] + ')');
    ok(await page.evaluate(() => MJApp.R.tilePx()) > 20, 'Handy: Steine groß genug (' + Math.round(await page.evaluate(() => MJApp.R.tilePx())) + ' px)');
    ok(!errs.length, 'Handy ohne Fehler' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await ctx.close();
  }

  // ---------- Handy quer + Iframe ----------
  {
    const { ctx, page, errs } = await open(browser, { width: 844, height: 390 }, { hasTouch: true, isMobile: true });
    await page.evaluate(() => MJApp.startFree('festung', 3)); await page.waitForTimeout(300);
    await shot(page, 'phone-landscape');
    ok(await page.evaluate(() => MJApp.R.tilePx()) > 24, 'Quer: Steine groß genug (' + Math.round(await page.evaluate(() => MJApp.R.tilePx())) + ' px)');
    await page.goto(BASE + 'tests/smoke.js');
    await page.setContent('<iframe src="' + BASE + '" style="width:800px;height:500px;border:0"></iframe>');
    const fr = await (await page.waitForSelector('iframe')).contentFrame();
    await fr.waitForSelector('#scrMenu:not([hidden])', { timeout: 15000 });
    ok(await fr.isVisible('#btnHome'), 'Iframe: „Alle Spiele“ sichtbar');
    ok(!errs.length, 'Quer/Iframe ohne Fehler' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await ctx.close();
  }
  await browser.close();
  console.log(fails ? fails + ' Fehler' : 'Alles in Ordnung');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
