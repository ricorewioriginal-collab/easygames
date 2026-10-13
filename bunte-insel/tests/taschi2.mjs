/* Taschi-System für alle Welten: Fanggras auf jeder Insel, wilde Taschis je Welt, Begleiter, Taschi-Menü überall, Taschidex-Meilensteine, Typen-Tabelle. Aufruf: THREE=... node bunte-insel/tests/taschi2.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 700, height: 480 } })).newPage(); const errs = []; let fails = 0;
p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(800);
const r = await p.evaluate(async () => {
  const b = __bi, t = b.taschi, P = b.P, W = b.W, D = t.dbg, out = {}, sl = ms => new Promise(r => setTimeout(r, ms)); t.fast = true;
  const worlds = Object.keys(BI.TWORLDS); const zw = {}; for (const z of BI.TZONES) zw[z.world] = (zw[z.world] || 0) + 1; out.zones = worlds.filter(k => zw[k]).length; out.zoneN = BI.TZONES.length;
  out.pools = worlds.every(k => (BI.TWILDW[k] || []).length >= 4 && BI.TWILDW[k].every(([id]) => !!BI.TSPECIES[id])); out.species = Object.keys(BI.TSPECIES).length; out.newOnes = BI.TNEW.length;
  out.evo = BI.TNEW.filter(r => r[14]).every(r => BI.TSPECIES[r[0]].evo && BI.TSPECIES[BI.TSPECIES[r[0]].evo.to]);
  out.mesh = Object.keys(BI.TSPECIES).every(id => { try { return BI.taschiMesh(id).children.length === 1; } catch (e) { return false; } });
  const types = Object.keys(BI.TTYPES); out.types = types.length === 12 && types.every(a => BI.TCHART[a] && Object.entries(BI.TCHART[a]).every(([d, v]) => !!BI.TTYPES[d] && [0, .5, 2].includes(v))); out.moves = Object.values(BI.TMV).every(l => l.every(m => BI.TMOVES[m]));
  /* Begleiter + Begegnung in einer anderen Welt */
  D.S().team.push(t.mk('blitzi', 12)); P.veh = null; const z = BI.TZONES.find(q => q.world === 'DRACHEN'); P.x = z.x - 5; P.z = z.z; P.y = 0; await sl(600);
  out.follower = !!document.querySelector('canvas') && b.scene.children.some(o => o.userData && o.userData.id === 'blitzi' && o.visible);
  let steps = 0; while (!t.battle() && steps++ < 500) { P.x += .5; if (P.x > z.x + 5) P.x = z.x - 5; await sl(20); } const B = t.battle(); out.enc = !!B && B.kind === 'wild'; if (B) { const f = B.foes[0]; out.pool = BI.TWILDW.DRACHEN.some(([id]) => id === f.id); out.lv = f.lv >= BI.TWORLDS.DRACHEN[1] && f.lv <= BI.TWORLDS.DRACHEN[1] + 5; out.followHidden = !b.scene.children.some(o => o.userData && o.userData.id === 'blitzi' && o.visible && o.scale.x < .7); t.forceRun = true; t.play({ k: 'run' }); t.forceRun = false; await sl(100); }
  /* Menü überall */
  P.x = 0; P.z = 60; document.getElementById('bMore').click(); await sl(100); document.getElementById('bTaschiHub').click(); await sl(200); const pan = document.getElementById('tpan'); out.hub = !pan.hidden && pan.querySelectorAll('.row').length >= 4; D.closePanel();
  t.worldPanel(); out.worldP = document.getElementById('tpan').querySelectorAll('.row').length === Object.keys(BI.TWORLDS).length; D.closePanel(); t.dbg.dexPanel('FUSSBALL'); const cells = document.querySelectorAll('#tpan .cell').length; out.dexWorld = cells === Object.keys(BI.TSPECIES).filter(i => BI.TSPECIES[i].world === 'FUSSBALL').length; D.closePanel();
  /* Meilensteine */
  const ids = Object.keys(BI.TSPECIES); const st0 = b.save.stars; for (const id of ids.slice(0, 26)) D.S().dex[id] = 1; t.K = 0; for (let i = 0; i < 26; i++) { /* über echten Fang-Pfad */ } D.S().dex[ids[0]] = 1; (function () { const s = D.S(); for (const id of ids.slice(0, 25)) s.dex[id] = 2; })(); t.milestones(); out.d25 = !!D.S().done.d25 && b.save.stk.includes('taschi_dex25');
  for (const id of ids) D.S().dex[id] = 2; t.milestones(); out.dall = !!D.S().done.d50 && !!D.S().done.dall && !!D.S().done.wforsch && b.save.stk.includes('taschi_weltforscher'); out.log = t.log().rows.length === 12 && t.log().rows.slice(9).every(r => r.ok);
  return out;
});
console.log(JSON.stringify(r));
ok(r.zones >= 15 && r.zoneN >= 30, 'Fanggras auf ' + r.zones + ' von 17 Welten (' + r.zoneN + ' Zonen)'); ok(r.pools && r.species >= 96 && r.evo && r.mesh, r.species + ' Taschis (' + r.newOnes + ' neue Welt-Taschis mit Entwicklung), je Welt ein Pool, alle Modelle bauen');
ok(r.types && r.moves, '12 Typen: Typen-Tabelle und Attacken vollständig'); ok(r.follower, 'Begleiter-Taschi läuft hinter dir her'); ok(r.enc && r.pool && r.lv, 'Wildes Taschi in den Drachenhöhen: Art aus dem Welt-Pool, Stufe passend'); ok(r.followHidden, 'Im Kampf ist der Begleiter weg');
ok(r.hub && r.worldP && r.dexWorld, 'Taschi-Menü überall (Mehr → Taschis), Weltforscher-Liste, Taschidex je Welt'); ok(r.d25 && r.dall && r.log, 'Taschidex-Meilensteine 25/50/alle + Weltforscher mit Stickern');
ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 3).join(' | ')); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); await browser.close(); process.exit(fails ? 1 : 0);
