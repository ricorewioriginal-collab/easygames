/* Ganze Staffel automatisch durchspielen (Prüfungen werden per Testhilfe beendet). Aufruf: node tests/season-run.mjs [d|m] [kurz|normal|lang] [taeglich|klassisch] [win] */
import { chromium } from 'playwright';
const dev = process.argv[2] || 'd', len = process.argv[3] || 'kurz', mode = process.argv[4] || 'taeglich', SHOT = process.env.SHOT || '/tmp', BASE = process.env.BASE || 'http://localhost:8080/anmacha-urwaldlager';
const vp = dev === 'm' ? { viewport: { width: 740, height: 360 }, hasTouch: true, isMobile: true } : { viewport: { width: 1000, height: 600 } };
const b = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await b.newContext(vp); const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push(e.message + ' @ ' + (e.stack||'').split('\n').slice(1,3).join(' | '))); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await p.goto(`${BASE}/index.html?q=low`); await p.waitForTimeout(2500);
await p.evaluate(([len, mode, win]) => { window.__win = win; __ul.newGame({ len, mode, seed: 777 }); }, [len, mode, process.argv[5] === "win"]);
let shots = 0, lastDay = 0, saved = false, it = 0; const log = [];
while (it++ < 2500) {
  const r = await p.evaluate(() => {
    const u = __ul, S = u.S, G = S.G, T = u.T;
    if (!G) return { none: true };
    if (G.over) return { over: true };
    const ts = T.state(); if (ts) { if (ts.phase === 'intro' || ts.phase === 'play' || ts.phase === 'count') { T.forceEnd(window.__win ? 99 : Math.floor(Math.random() * 7) % ((T.active && T.active.max || 6) + 1)); if (window.__win) S.G.you.aud.S = 90; return { a: 'trialEnd ' + ts.id }; } return { a: 'trialwait' }; }
    const m = document.getElementById('modal'); if (m && !m.hidden) { const t = m.querySelector('h2'); u.clickModal(Math.floor(Math.random() * Math.max(1, m.querySelectorAll('[data-m]').length - 0))); return { a: 'modal ' + (t ? t.textContent : '') }; }
    const dl = document.querySelector('#dlg [data-d]'); if (dl) { dl.click(); return { a: 'dlg' }; }
    if (!document.getElementById('mini').hidden) return { a: 'cooking' };
    if (S.trialReady()) { S.enterTrial(); return { a: 'enterTrial' }; }
    const t = G.today; if (t.ceremonyCalled && !t.ceremonyDone && !t.ceremonyRunning) { S.ceremony(); return { a: 'ceremony' }; }
    if (t.ceremonyRunning) return { a: 'cerwait' };
    if (S.canSleep()) { S.goSleep(); return { a: 'sleep' }; }
    if (window.__win) { G.you.aud.S = 92; G.you.aud.E = 90; }
    if (!S.frozen && u.W.player.state !== 'sleep') G.clock += 12;
    return { a: 'tick', d: G.day, h: (G.clock / 60).toFixed(1), alive: S.alive().length };
  });
  if (r.over) break;
  if (r.a && r.a !== 'tick' && r.a !== 'trialwait' && r.a !== 'cerwait') log.push(r.a);
  const st = await p.evaluate(() => __ul.state());
  if (st && st.day !== lastDay) { lastDay = st.day; log.push(`== DAY ${st.day} alive ${st.alive.join(',')}`); await p.screenshot({ path: `${SHOT}/${dev}-day${st.day}.png` }); }
  if (st && st.day === 2 && !saved && !st.modal && st.clock > 9 * 60) {
    saved = true; await p.evaluate(() => __ul.S.save()); await p.reload(); await p.waitForTimeout(2500);
    const info = await p.evaluate(() => __ul.S.saveInfo()); log.push('RELOAD saveInfo ' + JSON.stringify(info));
    await p.click('[data-a="continue"]'); await p.waitForTimeout(800); log.push('AFTER LOAD ' + JSON.stringify(await p.evaluate(() => __ul.state())));
    await p.screenshot({ path: `${SHOT}/${dev}-loaded.png` });
  }
  await p.waitForTimeout(r.a === 'tick' ? 40 : 250);
}
await p.waitForTimeout(800); await p.screenshot({ path: `${SHOT}/${dev}-end.png` });
const fin = await p.evaluate(() => ({ over: __ul.S.G && __ul.S.G.over, order: __ul.S.G && __ul.S.G.finalOrder, out: __ul.S.G && __ul.S.G.outOrder, best: __ul.S.best(), hasSave: __ul.S.hasSave(), results: __ul.S.G && __ul.S.G.results.length }));
console.log(log.join('\n')); console.log('FINAL', JSON.stringify(fin), 'iterations', it);
console.log(errs.length ? 'ERRORS\n' + [...new Set(errs)].join('\n') : 'NO ERRORS'); await b.close();
