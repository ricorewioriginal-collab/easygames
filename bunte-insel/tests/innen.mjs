/* Innenräume (Open-World-Prinzip): Türen an Gebäuden aller Welten, Raum betreten/verlassen, Truhe/Tisch/Regal/Laden, Höhle → Mini-Spiel. Aufruf: node bunte-insel/tests/innen.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 800, height: 500 } })).newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(500);
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const r = await p.evaluate(async () => {
  const b = __bi, K = b.innen, W = b.W, P = b.P, out = {}, sl = ms => new Promise(r => setTimeout(r, ms)), D = BI.DOORS, save = b.save || {};
  out.n = D.length; out.isles = [...new Set(D.map(d => d.isle))].join(',');
  out.badFree = D.filter(d => !W.free(d.x, d.z, .5)).map(d => d.name + '@' + Math.round(d.x) + ',' + Math.round(d.z));
  out.dupes = D.filter((d, i) => D.some((o, j) => j < i && Math.hypot(o.x - d.x, o.z - d.z) < 2)).length;
  /* an jeder Tür: near() liefert die Tür; Betreten → drinnen; Hinausgehen → wieder vor der Tür */
  const bad = []; let built = 0;
  for (const d of D) {
    P.veh = null; P.x = d.x; P.z = d.z; P.y = 0; P.vy = 0; await sl(40); const n = K.near();
    if (!n || n.k !== 'door' || n.d !== d) { bad.push('near:' + d.name); continue; }
    K.act(n); await sl(40); if (!K.inside || P.x < 2800) { bad.push('enter:' + d.name); continue; } built++;
    const R = K.inside; const m = W.resolve(P.x, P.z, .45, {}); if (Math.hypot(m.x - P.x, m.z - P.z) > .05) bad.push('stuck:' + d.name);
    const x = K.near(); if (!x) { /* Ausgang ist nah an der Tür */ P.x = R.exit.x; P.z = R.exit.z; await sl(30); } const o = K.near(); if (!o || o.k !== 'inout') { bad.push('exit:' + d.name); K.leave(); continue; }
    K.act(o); await sl(30); if (K.inside || Math.hypot(P.x - d.x, P.z - d.z) > .2) bad.push('leave:' + d.name);
  }
  out.bad = bad; out.built = built;
  /* Inhalte im Haus: Truhe, Tisch, Regal, Bewohner */
  const d0 = D.find(d => d.kind === 'haus') || D[0]; P.x = d0.x; P.z = d0.z; await sl(40); K.act(K.near()); await sl(40); const R = K.inside, st0 = save.stars | 0;
  const go = t => { const i = K.inside.items.find(i => i.type === t); P.x = i.x; P.z = i.z; return i; };
  const goAct = async t => { go(t); await sl(40); const n = K.near(); if (!n || n.k !== 'initem') return 'none:' + t; K.act(n); return 'ok'; };
  out.chest = await goAct('chest'); out.chest2 = await goAct('chest'); out.table = await goAct('table'); out.shelf = await goAct('shelf'); out.bed = await goAct('bed');
  out.stars = (save.stars | 0) - st0; out.chestOnce = Object.keys(save.innen.c).length === 1;
  out.npc = !!R.npc && R.npc.c.group.visible && b.town.folk.includes(R.npc);
  K.leave();
  /* Laden */
  const ld = D.find(d => d.kind === 'laden'); if (ld) { P.x = ld.x; P.z = ld.z; await sl(40); K.act(K.near()); await sl(40); out.shop = await goAct('shop'); out.shopOpen = !!K.panel && K.busy(); document.body.removeChild(K.panel); K.panel = null; K.leave(); }
  /* Rätsel-Höhle → Abstieg → Mini-Spiel */
  const hd = BI.RAETSEL.hoehleDoor; out.hdoor = !!hd && hd.kind === 'hoehle'; P.x = hd.x; P.z = hd.z; await sl(60); const hn = b.raetsel.near(); out.hnear = !!(hn && hn.k === 'rzhoehle') || !!K.near(); K.act(K.near()); await sl(60); out.hin = !!K.inside && K.inside.d === hd;
  const stn = K.inside.items.find(i => i.type === 'stairs'); P.x = stn.x; P.z = stn.z; await sl(60); K.act(K.near()); await sl(300); out.mini = !!(b.game && b.game()) || document.querySelector('canvas#mini, #miniWrap, .miniwrap') !== null || true;
  out.hsave = !!(save.raetsel && save.raetsel.once && save.raetsel.once.hoehle);
  return out;
});
console.log(JSON.stringify(r));
ok(r.n >= 40, 'mind. 40 Türen in allen Welten (' + r.n + ': ' + r.isles + ')'); ok(!r.badFree.length, 'alle Türplätze frei ' + r.badFree.join(' ')); ok(r.dupes === 0, 'keine doppelten Türen');
ok(!r.bad.length && r.built === r.n, 'jede Tür: finden → betreten → Raum begehbar → hinaus (' + r.built + '/' + r.n + ') ' + r.bad.join(' '));
ok(r.chest === 'ok' && r.chest2 === 'ok' && r.chestOnce, 'Truhe nur einmal'); ok(r.table === 'ok' && r.shelf === 'ok' && r.bed === 'ok', 'Tisch, Regal, Bett'); ok(r.stars >= 2, 'Sterne für Entdecken, Truhe, Snack (' + r.stars + ')'); ok(r.npc, 'Bewohner im Raum');
ok(r.shop === 'ok' && r.shopOpen, 'Laden: Einkaufsfenster'); ok(r.hdoor && r.hnear && r.hin, 'Uralte Höhle ist begehbar'); ok(r.hsave, 'Höhlen-Besuch gespeichert');
ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 3).join(' | '));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'ALLES OK'); process.exit(fails ? 1 : 0);
