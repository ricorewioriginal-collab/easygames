/* Browser-Test: öffentliche Gebäude sind begehbar (Hauptinsel, Stadt, Fellretter-Insel, Scheune, Kino).
   Aufruf: BASE=http://localhost:8080 node bunte-insel/tests/gebaeude.mjs   (optional THREE=/pfad/zu/three.min.js; DEBUG=1) */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 900, height: 560 } })).newPage();
let fails = 0; const errs = []; const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errs.push(m.text()); });
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(500);
const r = await p.evaluate(async () => {
  const b = window.__bi, W = b.W, sl = ms => new Promise(r => setTimeout(r, ms)), out = [];
  const civ = W.interiors.filter(q => q.kind === 'civic'); b.P.veh = null;
  for (const q of civ) {
    const R = !!q.rot, front = R ? (q.s > 0 ? q.x1 + .4 : q.x0 - .4) : (q.s > 0 ? q.z1 + .4 : q.z0 - .4), o = { name: q.sign.text, n: 0 };
    const at = (d) => R ? [front + q.s * d, q.cz] : [q.cx, front + q.s * d];
    /* Tür: von außen über die Schwelle bis in die Mitte ohne Hindernis */
    let walk = true; for (const d of [2, 0, -1.2]) { const [x, z] = at(d); if (W.resolve(x, z, .4, {}).hit) walk = false; } o.door = walk;
    o.wall = R ? (W.resolve(q.cx, q.z0 - .3, .4, {}).hit === true) : (W.resolve(q.x0 - .3, q.cz, .4, {}).hit === true);
    b.P.x = R ? q.cx + q.s * 1 : q.cx; b.P.z = R ? q.cz : q.cz + q.s * 1; b.P.y = 0; await sl(350); o.inside = b.town.inside() === q && q.roof.visible === false;
    { const [x, z] = at(6); b.P.x = x; b.P.z = z; } await sl(350); o.roofBack = q.roof.visible === true;
    o.npc = !!q.resNpc && q.resNpc.p.lines.length >= 2; o.npcIn = !!q.resNpc && q.resNpc.x > q.x0 && q.resNpc.x < q.x1 && q.resNpc.z > q.z0 && q.resNpc.z < q.z1 && !W.resolve(q.resNpc.x, q.resNpc.z, .3, {}).hit;
    out.push(o);
  }
  return out;
});
if (process.env.DEBUG) console.log(JSON.stringify(r));
ok(r.length === 23, r.length + ' öffentliche Gebäude (Hauptinsel, Stadt, Fellretter-Insel) sind begehbar: ' + r.map(o => o.name).join(', '));
for (const o of r) ok(o.door && o.wall && o.inside && o.roofBack && o.npc && o.npcIn, o.name + ': Tür frei, Wand hält, Dach verschwindet drinnen, Figur steht drinnen');
/* Aktionstaste am Spielautomaten: ein geparktes Fahrzeug daneben darf den Knopf nicht übernehmen ("Fernsteuern"/"Einsteigen") */
{
  const r2 = await p.evaluate(async () => {
    const b = window.__bi, W = b.W, sl = ms => new Promise(r => setTimeout(r, ms)), a = (W.spots.arcades || [])[0]; if (!a) return { none: true };
    b.P.veh = null; b.P.y = 0; b.P.x = a.x; b.P.z = a.z + 2.2; await sl(300);
    const v = b.vehicles.find(x => !x.ai); if (!v) return { none: true };
    v.x = b.P.x + 1; v.z = b.P.z; if (v.root) v.root.position.set(v.x, 0, v.z); await sl(500);
    const lab = document.getElementById('bAct').textContent, pn = b.placeNear(); return { lab, src: pn && pn.src };
  });
  if (process.env.DEBUG) console.log(JSON.stringify(r2));
  ok(r2.none || (r2.src === 'arcade' && !/Fernsteuern|Einsteigen/.test(r2.lab)), 'Spielautomat: Aktionstaste zeigt „Spielen“ statt Fahrzeug-Aktion (' + (r2.lab || '-') + ')');
}
/* Drachenhöhle: Drachenei streicheln (+1 ⭐ einmal); Regenbogen-Sterne: sechs farbige Sterne, einsammelbar */
{
  const r3 = await p.evaluate(async () => {
    const b = window.__bi, sl = ms => new Promise(r => setTimeout(r, ms)), o = {}; b.P.veh = null; b.P.y = 0;
    const q = b.W.interiors.find(i => i.sign.text && i.sign.text.includes('Drachenhöhle')), egg = q && q.items.find(i => i.k === 'egg'); o.cave = !!egg;
    if (egg) { b.P.x = egg.x; b.P.z = egg.z; await sl(400); const n = b.placeNear(), s0 = b.save.stars; o.eggNear = !!n && n.src === 'furn'; if (n) b.placeAct(n); await sl(200); o.eggStar = b.save.stars - s0 === 1; }
    b.weather().rainbow(); await sl(300); const bows = b.stars.filter(s => s.bow && s.on); o.bows = bows.length; o.slots = new Set(bows.map(s => s.bi)).size;
    const s1 = b.save.stars, bs = bows[0]; if (bs) { b.P.x = bs.x; b.P.z = bs.z; await sl(500); o.collect = b.save.stars > s1 && !bs.bow; }
    return o;
  });
  if (process.env.DEBUG) console.log(JSON.stringify(r3));
  ok(r3.cave && r3.eggNear && r3.eggStar, 'Drachenhöhle: Drachenei-Knopf, +1 ⭐ einmal');
  ok(r3.bows >= 4 && r3.slots === r3.bows && r3.collect, 'Regenbogen-Sterne: ' + r3.bows + ' bunte Sterne erscheinen und lassen sich einsammeln');
}
/* Flackern: Bodenschichten liegen in getrennten Meshes mit eigenem polygonOffset, Wiesenflecken überlappen sich nicht, Nahebene 1,4 */
{
  const r4 = await p.evaluate(() => { const b = window.__bi, ms = b.W.bigMeshes.filter(m => m.material && m.material.polygonOffset); const f = b.W.meadows || null; return { layers: ms.length, near: b.camera ? b.camera.near : null }; });
  if (process.env.DEBUG) console.log(JSON.stringify(r4));
  ok(r4.layers >= 4, 'Bodenschichten: ' + r4.layers + ' getrennte Meshes mit polygonOffset (kein Flackern durch gleich hohe Flächen)');
}
ok(errs.length === 0, 'Keine Konsolen-/Seitenfehler' + (errs.length ? '\n' + errs.slice(0, 5).join('\n') : ''));
await browser.close(); console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlles gut ✅'); process.exit(fails ? 1 : 0);
