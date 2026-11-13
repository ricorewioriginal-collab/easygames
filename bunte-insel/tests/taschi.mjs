/* Taschi-Land mit Portal: Insel + Brücke, keine Taschi-Funktionen mehr (kein Fanggras, kein Begleiter, kein Taschi-Knopf), Portal in der Arena
   mit Rückfrage und Link zum easygames-Spiel Taschi, Professor Ulme, Inselgeschichte (3 Akte), Sticker, Cheat, alter Spielstand lädt.
   Aufruf: LANG=de_DE.UTF-8 node bunte-insel/tests/taschi.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 700, height: 480 } })).newPage(); const errs = []; let fails = 0;
p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errs.push(m.text()); });
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 90000 }); await p.click('#bStart'); await p.waitForTimeout(800);
const r = await p.evaluate(async () => {
  const b = __bi, t = b.taschi, T = BI.TASCHI, P = b.P, W = b.W, out = {}, sl = ms => new Promise(r => setTimeout(r, ms));
  b.save.taschi = { team: [{ id: 'blitzi', lv: 12, hp: 30, mv: [] }], orden: { fang: 1 } }; b.save.taschiOff = true;
  out.isle = W.isles.includes(T) && !!W.spots.taschi && !!W.spots.taschiportal;
  out.gone = !BI.TSPECIES && !BI.TZONES && !BI.taschiMesh && !document.getElementById('bTaschiHub') && !document.getElementById('bTaschiOn');
  P.veh = null; P.x = t.portal.x - T.ux * 30; P.z = t.portal.z - T.uz * 30; P.y = 0; await sl(400);
  P.x = t.portal.x - T.ux * 5; P.z = t.portal.z - T.uz * 5; await sl(1600);
  const n = t.near(); out.near = !!n && n.k === 'portal'; out.found = !!b.save.flags.ta_sehen && b.save.stk.includes('taschi_fang');
  t.noNav = true; t.act(n); await sl(100); const ask = document.getElementById('taPortalAsk'); out.ask = !!ask && /Taschi/.test(ask.textContent);
  document.getElementById('taGo').click(); await sl(100); out.travel = !document.getElementById('taPortalAsk') && !!b.save.flags.ta_reise && b.save.stk.includes('taschi_meister');
  out.url = BI.TASCHI_GAME_URL.startsWith('../taschi/index.html');
  const pr = t.dbg.npcs.find(q => q.id === 'prof'); P.x = pr.x + 1; P.z = pr.z; await sl(200); const n2 = t.near(); out.prof = !!n2 && n2.id === 'prof'; t.act(n2); out.profFlag = !!b.save.flags.ta_ulme;
  t.act({ k: 'npc', id: 'statue' }); out.log = t.log().rows.length === 4 && t.log().rows.every(r => r.ok);
  const st = BI.INSELSTORY.find(q => q.key === 'TASCHI'); out.story = st.acts.length === 3 && st.acts.every(a => a.goal.every(g => b.istory.goalDone(g)));
  b.save.flags.ta_ulme = 0; b.save.flags.ta_reise = 0; b.cheats.redeem('TASCHIMEISTER'); out.cheat = t.log().rows.every(r => r.ok);
  out.balloon = W.vehicleSpawns.some(v => v.type === 'funkenballon');
  out.oldSave = !!b.save.taschi && b.save.taschi.team.length === 1;
  return out;
});
ok(r.isle, 'Insel im Osten mit Portal-Platz'); ok(r.gone, 'Taschi-Funktionen entfernt (keine Arten, kein Fanggras, keine Knöpfe)');
ok(r.near && r.found, 'Portal erkannt, Sticker Portal-Finder'); ok(r.ask && r.travel && r.url, 'Rückfrage → Reise ins Taschi-Spiel (../taschi/), Sticker Portal-Reisender');
ok(r.prof && r.profFlag, 'Professor Ulme erzählt vom Portal'); ok(r.log && r.story, 'Aufgaben (4) und Inselgeschichte (3 Akte) lösbar'); ok(r.cheat, 'Geheimcode TASCHIMEISTER');
ok(r.balloon, 'Heißluftballon bleibt als Fahrzeug'); ok(r.oldSave, 'Alter Taschi-Spielstand bleibt erhalten');
ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 3).join(' | ')); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); await browser.close(); process.exit(fails ? 1 : 0);
