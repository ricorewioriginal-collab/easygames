/* Portale zu anderen easygames-Spielen: Taschi (Taschi-Land), Gay Life! (Regenbogenwelt), AERU (Drachenwelt), Podcast Tycoon (Radiowelt), Marktrausch (Stadt).
   Prüft: Portal steht in der Welt, Rückfrage ist SICHTBAR obenauf (echter Klick), Reise öffnet den richtigen Link, „Hierbleiben“ gibt die Steuerung frei.
   Aufruf: LANG=de_DE.UTF-8 node bunte-insel/tests/portale.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })).newPage(); const errs = []; let fails = 0;
p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errs.push(m.text()); });
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 90000 }); await p.click('#bStart'); await p.waitForTimeout(800);
await p.evaluate(() => { window.__nav = []; BI.portalNav = u => window.__nav.push(u); });
const games = await p.evaluate(() => __bi.portale.dbg.list.map(q => q.D.game));
ok(games.join() === 'gay-life,aeru,anmacha-podcast-tycoon,anmacha-markthalle', 'vier Spiel-Portale gebaut: ' + games.join());
const go = async (game) => {
  const r = await p.evaluate(async g => {
    const b = __bi, P = b.P, sl = ms => new Promise(r => setTimeout(r, ms)); let n;
    if (g === 'taschi') { const t = b.taschi; P.veh = null; P.x = t.portal.x - BI.TASCHI.ux * 5; P.z = t.portal.z - BI.TASCHI.uz * 5; P.y = 0; await sl(300); n = t.near(); t.act(n); }
    else { const q = b.portale.dbg.list.find(q => q.D.game === g); P.veh = null; P.x = q.front.x; P.z = q.front.z; P.y = 0; await sl(300); n = b.portale.near(); b.portale.act(n); }
    await sl(120); const box = document.querySelector('.biAsk'), go = box && box.querySelector('button.go'); if (!go) return { near: !!n };
    const rc = go.getBoundingClientRect(), top = document.elementFromPoint(rc.left + rc.width / 2, rc.top + rc.height / 2);
    return { near: !!n && n.k === 'portal', visible: getComputedStyle(box).position === 'fixed' && top === go, busy: b.busy ? true : true, x: rc.left + rc.width / 2, y: rc.top + rc.height / 2 };
  }, game);
  return r;
};
for (const g of ['taschi', 'gay-life', 'aeru', 'anmacha-podcast-tycoon', 'anmacha-markthalle']) {
  const r = await go(g); ok(r.near && r.visible, g + ': Portal erkannt, Rückfrage sichtbar obenauf');
  if (!r.visible) continue;
  await p.mouse.click(r.x, r.y); await p.waitForFunction(() => window.__nav.length > 0, null, { timeout: 5000 }).catch(() => { });
  const u = await p.evaluate(() => { const u = window.__nav.pop() || ''; const w = document.getElementById('biWarp'); if (w) w.remove(); window.__nav.length = 0; return u; });
  ok(new RegExp('/' + g + '/').test(u) && /from=bunteinsel/.test(u), g + ': Reise öffnet ' + u.replace(/^https?:\/\/[^/]+/, ''));
}
/* Hierbleiben: Steuerung wieder frei */
const st = await p.evaluate(async () => { const b = __bi, q = b.portale.dbg.list[0], sl = ms => new Promise(r => setTimeout(r, ms)); b.P.x = q.front.x; b.P.z = q.front.z; await sl(200); b.portale.act(b.portale.near()); await sl(80);
  const was = b.portale.busy(); document.querySelector('.biAsk button:not(.go)').click(); await sl(50); return { was, free: !b.portale.busy() && !document.querySelector('.biAsk') }; });
ok(st.was && st.free, 'Hierbleiben schließt die Rückfrage, man kann weiterlaufen');
const esc = await p.evaluate(async () => { const b = __bi, sl = ms => new Promise(r => setTimeout(r, ms)); b.portale.act(b.portale.near()); await sl(50); dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape' })); await sl(50); return !b.portale.busy() && !document.querySelector('.biAsk') && document.getElementById('pause').hidden !== false && (typeof b.state === 'function' ? b.state() : b.state) === 'play'; });
ok(esc, 'Escape / B schließt die Rückfrage');
/* Welten-Flair: jede Welt hat eine Mitmach-Show (erste am Tag +1 ⭐) und läuft ohne Fehler */
const fl = await p.evaluate(async () => { const b = __bi, sl = ms => new Promise(r => setTimeout(r, ms)), out = {}; b.save.flair = {};
  for (const it of b.flair.dbg.list) { b.P.x = it.at.x + 2; b.P.z = it.at.z; await sl(150); const n = b.flair.near(), s0 = b.save.stars; b.flair.act(n); const s1 = b.save.stars; b.flair.act(n); out[it.key] = !!n && n.key === it.key && s1 === s0 + 1 && b.save.stars === s1; }
  return out; });
ok(Object.keys(fl).join() === 'rainbow,drachen,radio,city' && Object.values(fl).every(Boolean), 'Welten-Shows (Konfetti, Drache, DJ-Pult, Feuerwerk): ' + JSON.stringify(fl));

ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 3).join(' | ')); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); await browser.close(); process.exit(fails ? 1 : 0);
