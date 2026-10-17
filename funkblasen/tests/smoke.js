// Browser-Rauchtest (optional, braucht Playwright + Chromium):
//   python3 -m http.server 8765   (im Repo-Hauptordner)
//   node funkblasen/tests/smoke.js [http://127.0.0.1:8765/funkblasen/]
// PLAYWRIGHT=/pfad/zu/node_modules/playwright und CHROMIUM=/pfad/zu/chromium sind optional.
'use strict';
const fs = require('fs'), path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const BASE = process.argv[2] || 'http://127.0.0.1:8765/funkblasen/';
const BOT = fs.readFileSync(path.join(__dirname, 'bot.js'), 'utf8');
const ready = p => p.waitForFunction(() => window.FUNKBLASEN && !document.getElementById('scrMenu').hidden, null, { timeout: 20000 });
const idle = p => p.waitForFunction(() => { const S = FUNKBLASEN.session; return !S || S.canAct() || S.phase === 'win' || S.phase === 'lose'; }, null, { timeout: 20000 });

async function page(b, vp, touch) {
  const ctx = await b.newContext({ viewport: vp, hasTouch: !!touch, isMobile: !!touch });
  const p = await ctx.newPage(); p.errs = [];
  p.on('console', m => { if (m.type() === 'error') p.errs.push(m.text()); });
  p.on('pageerror', e => p.errs.push('Fehler: ' + e.message));
  p.on('response', r => { if (r.status() >= 400) p.errs.push('HTTP ' + r.status() + ' ' + r.url()); });
  await p.goto(BASE); await ready(p); return p;
}
async function startLevel1(p) { await p.click('#btnPlay'); await p.waitForTimeout(200); await p.click('#modalActions button'); await p.waitForTimeout(300); }

async function winLevel1(b, vp, touch) {   // echte Klicks/Taps an der vom Test-Spieler gewählten Stelle
  const p = await page(b, vp, touch);
  await p.addScriptTag({ content: `(function(){var module={exports:{}};var require=function(){return FBEngine};${BOT};window.FBBot=module.exports;})();` });
  await startLevel1(p);
  for (let i = 0; i < 40; i++) {
    const t = await p.evaluate(() => {
      const A = FUNKBLASEN, S = A.session, E = FBEngine;
      if (S.phase === 'win' || S.phase === 'lose') return { done: S.phase };
      const best = FBBot.bestShot(S.st); if (best.swap) document.getElementById('btnSwap').click();
      const c = A.renderer.fieldToClient(E.LAUNCH.x + Math.cos(best.ang) * 6, E.LAUNCH.y - Math.sin(best.ang) * 6);
      return { x: c.x, y: c.y, ang: best.ang };
    });
    if (t.done) { await p.waitForTimeout(800); const s = await p.evaluate(() => FUNKBLASEN.save.data); await p.context().close(); return { result: t.done, stars: s.stars[1], unlocked: s.unlocked, errs: p.errs }; }
    if (touch) await p.touchscreen.tap(t.x, t.y); else { await p.mouse.move(t.x, t.y); await p.mouse.down(); await p.mouse.up(); }
    const ang = await p.evaluate(() => FUNKBLASEN.session.angle);
    if (Math.abs(ang - t.ang) > 0.02) p.errs.push('Zielwinkel weicht ab');
    await idle(p);
  }
  await p.context().close(); return { result: 'timeout', errs: p.errs };
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const out = []; let bad = 0;
  for (const [name, vp, touch] of [['Desktop', { width: 1280, height: 800 }], ['Handy hoch', { width: 390, height: 844 }, 1], ['Handy quer', { width: 844, height: 390 }, 1]]) {
    const r = await winLevel1(b, vp, touch); const ok = r.result === 'win' && r.unlocked === 2 && !r.errs.length; bad += !ok;
    out.push(`${ok ? 'OK ' : 'FEHLER'} ${name}: Level 1 ${r.result}, Sterne ${r.stars}${r.errs.length ? ' · ' + r.errs.join(' | ') : ''}`);
  }
  // Verlieren, Pause, Neuladen, Menüs
  const p = await page(b, { width: 390, height: 844 }, 1);
  await startLevel1(p);
  await p.evaluate(() => { const S = FUNKBLASEN.session; S.st.shotsLeft = 1; S.aim(0.2); S.fire(); });
  await p.waitForFunction(() => ['win', 'lose'].includes(FUNKBLASEN.session.phase), null, { timeout: 20000 });
  const lost = await p.evaluate(() => FUNKBLASEN.session.phase); bad += lost !== 'lose';
  out.push(`${lost === 'lose' ? 'OK ' : 'FEHLER'} Verlieren bei 0 Schüssen`);
  for (const s of ['scrWorlds', 'scrCollection', 'scrSettings', 'scrGuide', 'scrCloud']) {
    await p.evaluate(s => FUNKBLASEN.ui.show(s), s); await p.waitForTimeout(150);
    const vis = await p.evaluate(s => !document.getElementById(s).hidden, s); bad += !vis; if (!vis) out.push('FEHLER Bildschirm ' + s);
  }
  await p.reload(); await ready(p);
  bad += p.errs.length; out.push(`${p.errs.length ? 'FEHLER' : 'OK '} Menüs und Neuladen${p.errs.length ? ': ' + p.errs.join(' | ') : ''}`);
  await p.context().close();
  // Eingebettet (wie in der Spieleübersicht)
  const q = await b.newPage(); const qe = [];
  q.on('pageerror', e => qe.push(e.message));
  await q.goto(new URL('../index.html', BASE).href);
  await q.evaluate(() => { document.body.innerHTML = '<iframe src="funkblasen/" style="width:800px;height:500px;border:0"></iframe>'; });
  const f = await (await q.waitForSelector('iframe')).contentFrame(); await ready(f);
  bad += qe.length; out.push(`${qe.length ? 'FEHLER' : 'OK '} Im Iframe${qe.length ? ': ' + qe.join(' | ') : ''}`);
  await b.close();
  console.log(out.join('\n')); process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
