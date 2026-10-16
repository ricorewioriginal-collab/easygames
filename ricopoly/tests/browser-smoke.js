// Browser-Rauchtest (Playwright + Chromium): Menü, Einrichtung mit Rundenlimit, Spielzüge, Dialoge bis zum Siegerbildschirm.
// Aufruf aus dem Repo-Stamm: python3 -m http.server 8765 &  dann  node ricopoly/tests/browser-smoke.js <Ausgabeordner> [Breite] [Höhe] [Kürzel] [Runden]
const { chromium } = require('playwright');
const SP = process.argv[2], W = +process.argv[3] || 1280, H = +process.argv[4] || 800, tag = process.argv[5] || 'f', ROUNDS = +process.argv[6] || 3;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const mobile = W < 700;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, locale: 'de-DE', hasTouch: mobile, isMobile: mobile, deviceScaleFactor: mobile ? 2 : 1 });
  await ctx.addInitScript(() => { if (!localStorage.getItem('ricopoly.v1.profile')) localStorage.setItem('ricopoly.v1.profile', JSON.stringify({ id: 'abc123def', name: 'Rico', avatar: '😎', char: 'pirate', look: {}, settings: { lang: 'de', speed: 2.5, think: false, tips: true } })); });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message + ' | ' + (e.stack || '').split('\n').slice(1, 3).join(' ')));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  const shot = async n => p.screenshot({ path: `${SP}/${tag}-${n}.png` });
  const click = async sel => { await p.locator(sel).first().click(); await p.waitForTimeout(350); };
  await p.goto('http://localhost:8765/ricopoly/', { waitUntil: 'load' });
  await p.waitForTimeout(1800);
  await shot('menu');
  await click('#btnPlay');
  await click('#panelBody .segbtn:nth-child(3)');     // Eigene Regeln
  const nums = p.locator('#panelBody .opts input[type=number]');
  await nums.nth(2).fill(String(ROUNDS)); await nums.nth(2).dispatchEvent('change');
  await shot('custom');
  await click('#panelBody .btn.primary.big');
  await p.waitForTimeout(1200);
  let acts = 0, t0 = Date.now(), shots = {}, opened = {};
  while (Date.now() - t0 < 420000) {
    const st = await p.evaluate(() => { const s = RicoPolyDebug.state(); return s ? { phase: s.phase, round: s.round, busy: RicoPolyDebug.busy(), actor: RicoRules.actor(s), cur: s.cur } : null; });
    if (!st) break;
    if (await p.locator('#card:not([hidden]) .btn').count()) { if (!shots.card) { shots.card = 1; await shot('card'); } await p.locator('#card .btn').first().click().catch(() => {}); }
    if (await p.locator('#modal:not([hidden]) .trophy').count()) break;
    if (await p.locator('#modal:not([hidden])').count()) {
      const pb = p.locator('#modalBody .btn.primary');
      if (!shots['modal' + acts]) { shots['modal' + acts] = 1; await shot('modal' + acts); }
      if (await pb.count()) await pb.first().click().catch(() => {}); else await p.keyboard.press('Escape');
      await p.waitForTimeout(250); continue;
    }
    // Einmalig: Besitz-Dialog und Pause-Menü öffnen, wenn der Mensch dran ist
    if (!st.busy && st.actor === 0 && st.round >= 2 && !opened.manage) {
      opened.manage = 1; await click('#dock .btn:has-text("Besitz")'); await shot('manage'); await p.keyboard.press('Escape');
      await click('#dock .btn:has-text("Handeln")'); await shot('trade'); await p.keyboard.press('Escape');
      await click('#hudMenu'); await shot('pause'); await click('#modalBody .btn:has-text("Platz 1")'); await p.keyboard.press('Escape');
      await click('#hudLog'); await shot('log'); await click('#logClose');
      continue;
    }
    const btn = p.locator('#dock .btn.primary:not([disabled])');
    if (!st.busy && st.actor === 0 && await btn.count()) { await btn.first().click().catch(() => {}); acts++; }
    else if (!st.busy && st.actor === 0 && st.phase === 'buy') { await click('#dock .btn:nth-child(2)'); acts++; }
    else if (!st.busy && st.actor === 0 && st.phase === 'auction') { await click('#dock .btn.ghost'); acts++; }
    await p.waitForTimeout(250);
    if (acts === 6 && !shots.mid) { shots.mid = 1; await shot('mid'); }
  }
  await p.waitForTimeout(2500);
  await shot('end');
  const s = await p.evaluate(() => { const s = RicoPolyDebug.state(); return s && { round: s.round, phase: s.phase, winner: s.winner, reason: s.endReason, money: s.players.map(x => x.money), owned: s.own.filter(o => o && o.o >= 0).length, fps: Math.round(RicoPolyDebug.stage().fps), q: RicoPolyDebug.stage().q, saves: RicoProfile.listSaves().map(x => x.slot), games: RicoPolyDebug.profile().stats.games, ach: Object.keys(RicoPolyDebug.profile().achievements) }; });
  console.log('acts', acts, 'secs', Math.round((Date.now() - t0) / 1000), JSON.stringify(s));
  // Ergebnis-Dialog → Hauptmenü → Fortsetzen-Liste
  if (await p.locator('#modalBody .btn:has-text("Hauptmenü")').count()) { await click('#modalBody .btn:has-text("Hauptmenü")'); await click('#btnContinue'); await shot('resume'); }
  console.log(errs.slice(0, 20).join('\n'));
  await b.close();
})();
