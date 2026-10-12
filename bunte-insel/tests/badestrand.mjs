/* Badestrand-Test: sauberer Zugang vom Land bis ins Meer, Schwimmen, Wasserpark (Rutschen ins Meer, Hüpfburg, Luftkissen), keine Überschneidung mit Brücken/Inseln.
   Aufruf: node bunte-insel/tests/badestrand.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 600, height: 400 } })).newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.waitForTimeout(500); await p.evaluate(() => document.getElementById('bStart').click()); await p.waitForTimeout(800);
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const g = await p.evaluate(() => {
  const B = BI.BADE, W = __bi.W, out = {}; const corners = []; for (const a of [B.A0 + 28, 202]) for (const b of [B.BL, B.B1]) corners.push(B.at(a, b)); for (const b of [B.B0, B.B1]) corners.push(B.at(B.A1, b));
  out.islands = []; for (const k of ['RADIO', 'DRACHEN', 'PARK', 'PUPS', 'ZOTIK']) { const I = BI[k]; if (I && I.R) for (const c of corners) { const d = Math.hypot(c.x - I.x, c.z - I.z) - I.R; if (d < 6) out.islands.push(k + ' ' + d.toFixed(1)); } }
  const D = BI.DRACHEN.bridge; out.bridgeD = Math.min(...[B.A0 + 28, 190, 203, B.A1].flatMap(a => [a < 203 ? B.BL : B.B0, B.B1].map(b => { const c = B.at(a, b); return c.x > D.x0 && c.x < D.x1 && c.z > D.z0 && c.z < D.z1 ? 0 : 9; })));
  /* Weg vom Land (a=160) bis ins Meer (a=240) ohne Hindernis */
  let hit = 0, last = null; for (let a = 160; a <= 240; a += 1) { const c = B.at(a, 4), q = W.resolve(c.x, c.z, .45, {}); if (q.hit || Math.hypot(q.x - c.x, q.z - c.z) > .01) { hit++; last = a; } }
  out.pathHit = hit; out.pathLast = last;
  /* Strand-Fläche: zählt Hindernisse */
  let n = 0, tot = 0; for (let a = 165; a <= 202; a += 1.5) for (let b = B.BL + 1; b <= B.B1 - 1; b += 1.5) { tot++; const c = B.at(a, b), q = W.resolve(c.x, c.z, .45, {}); if (Math.hypot(q.x - c.x, q.z - c.z) > .01) n++; } out.beachBlocked = n / tot;
  const P = __bi.P, pool = __bi.pool; out.inWater = { land: pool.inWater(...Object.values(B.at(185, 4))), sea: pool.inWater(...Object.values(B.at(235, 4))), deck: pool.inWater(...Object.values(B.at(216, 3))) };
  const c0 = B.at(229, -10); out.kissen = B.bounce(c0.x, c0.z); const c1 = B.at(230, 17); out.burg = B.bounce(c1.x, c1.z);
  out.slideEnd = B.slides.map(s => { const e = s.path[s.path.length - 1], c = B.at(e[0], e[1]); return { sea: B.sea(c.x, c.z), inZone: B.walk(c.x, c.z, 0), y: e[2] }; });
  out.eisHint = __bi.DEST.some(d => d.id === 'bade');
  /* Landen im Meer: weit hinter der Zone zurückgesetzt */
  const far = B.at(300, 0); const q = W.resolve(far.x, far.z, .45, {}); out.farBlocked = Math.hypot(q.x - far.x, q.z - far.z) > 10;
  return out; });
ok(g.islands.length === 0, 'Badegebiet liegt frei von anderen Inseln (' + g.islands.join(', ') + ')'); ok(g.bridgeD > 0, 'Drachen-Brücke berührt das Badegebiet nicht');
ok(g.pathHit === 0, 'Weg vom Land bis ins Meer ohne Hindernis (Treffer bei a=' + g.pathLast + ')'); ok(g.beachBlocked < .12, 'Strand ist frei begehbar (' + Math.round(g.beachBlocked * 100) + ' % blockiert)');
ok(g.inWater.land === 0 && g.inWater.sea === 2 && g.inWater.deck === 0, 'Schwimmen nur im Meer: Land/Steg trocken, Meer = Schwimmen ' + JSON.stringify(g.inWater));
ok(g.kissen > 15 && g.burg > 10, 'Luftkissen und Hüpfburg hüpfen (' + g.kissen + ', ' + g.burg + ')'); ok(g.slideEnd.every(s => s.sea && s.inZone), 'Beide Rutschen enden im Meer');
ok(g.eisHint, 'Ziel „Badestrand“ im 🧭-Menü'); ok(g.farBlocked, 'Weit draußen im Meer ist Schluss (Bojen-Grenze)');
/* Rutsche: Einstieg → Fahrt → im Meer schwimmend */
const s1 = await p.evaluate(async () => {
  const B = BI.BADE, P = __bi.P, bade = __bi.bade, l = B.at(...B.slides[0].lad); P.x = l.x; P.z = l.z; P.y = 0; P.veh = null; await new Promise(r => setTimeout(r, 300));
  const n = bade.near(); if (!n) return { near: false }; bade.act(n); const busy = bade.busy(); return { near: true, busy, k: n.k }; });
ok(s1.near && s1.busy, 'Rutsche am Turm startbar (' + JSON.stringify(s1) + ')');
await p.waitForFunction(() => !__bi.bade.busy(), null, { timeout: 40000 });
const s2 = await p.evaluate(() => { const B = BI.BADE, P = __bi.P; return { sea: B.sea(P.x, P.z), y: P.y, stk: (__bi.save.stk || []).includes('wasserpark'), a: B.loc(P.x, P.z) }; });
ok(s2.sea && s2.y < .1, 'Nach der Rutsche im Meer (a=' + s2.a.a.toFixed(0) + ', b=' + s2.a.b.toFixed(0) + ')'); ok(s2.stk, 'Sticker „Wasserpark-Profi“');
/* Hüpfburg: draufgestellt → wird hochgeschleudert */
const s3 = await p.evaluate(async () => { const B = BI.BADE, P = __bi.P, c = B.at(230, 17); P.x = c.x; P.z = c.z; P.y = 2; P.vy = 0; let mx = 0; for (let i = 0; i < 40; i++) { await new Promise(r => setTimeout(r, 100)); mx = Math.max(mx, P.y); } return { mx, bounces: __bi.save.bade && __bi.save.bade.bounce }; });
ok(s3.mx > 3 && s3.bounces >= 1, 'Hüpfburg schleudert hoch (max ' + s3.mx.toFixed(1) + ' m, ' + s3.bounces + ' Hüpfer)');
ok(errs.length === 0, 'Keine Skriptfehler' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
await browser.close(); console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlles gut ✅'); process.exit(fails ? 1 : 0);
