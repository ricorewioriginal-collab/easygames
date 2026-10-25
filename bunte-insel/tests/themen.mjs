/* Themenbereiche 🎪: Minigolf (3 Bahnen), Dino-Ausgrabung (6 Knochen + Museum), Zuckerland (Bonbon-Jagd), Sternwarte (5 Sternbilder).
   Spielt jeden Bereich durch (Spiel-Schritte direkt, damit die langsame Testumgebung keine Rolle spielt). Aufruf: node bunte-insel/tests/themen.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'de-DE' })).newPage(); let fails = 0; const errs = [];
p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 90000 }); await p.click('#bStart'); await p.waitForTimeout(800);
const r = await p.evaluate(async () => {
  const b = __bi, P = b.P, T = b.themen, D = T.dbg, out = {}, sl = ms => new Promise(r => setTimeout(r, ms)), has = id => (b.save.stk || []).includes(id);
  const go = (x, z) => { P.x = x; P.z = z; P.y = 0; P.vy = 0; };
  /* Minigolf: Start an der Kasse, dann jede Bahn mit geradem Schlag; nach höchstens 6 Schlägen rollt der Ball von selbst ins Loch */
  go(b.W.spots.golf.x, b.W.spots.golf.z); out.golfLabel = (T.near() || {}).k;
  const s0 = b.save.stars; D.golfStart(); let guard = 0;
  while (D.golf() && guard++ < 4000) {
    const g = D.golf(); if (g.phase === 'aim') { g.ang = 0; D.golfShot(); } else if (g.phase === 'power') { g.pow = .62; D.golfShot(); }
    T.update(.05, guard * .05);
  }
  out.golfDone = !D.golf(); out.golfSticker = has('minigolf'); out.golfStars = b.save.stars - s0; out.golfBest = b.save.themen.golf.best;
  /* Dino: jeden Hügel dreimal graben, dann zur Professorin */
  for (const q of D.mounds) { go(q.x + 1, q.z); for (let k = 0; k < 3; k++) { const n = T.near(); if (n && n.k === 'dig') T.act(n); } }
  out.bones = b.save.themen.dino.bones.length;
  go(BI.THEMEN.dino.x - 3.2, BI.THEMEN.dino.z - 3); const pn = T.near(); out.profLabel = pn && pn.k; if (pn) T.act(pn); out.dinoSticker = has('dino');
  /* Zuckerland: Bonbon-Jagd starten und alle Bonbons einsammeln */
  go(BI.THEMEN.zucker.x + 1.5, BI.THEMEN.zucker.z + 3.6); const ln = T.near(); out.lolliLabel = ln && ln.k; if (ln) T.act(ln);
  out.bonbons = D.bons.length; for (const bn of D.bons.slice()) { go(bn.x, bn.z); T.update(.05, 1); }
  out.huntOver = !D.hunt(); out.zuckerSticker = has('zucker');
  /* Sternwarte: alle 5 Sternbilder der Reihe nach antippen */
  go(b.W.spots.stern.x, b.W.spots.stern.z); const sn = T.near(); out.sternLabel = sn && sn.k; if (sn) T.act(sn); out.uiOpen = T.open && !!document.getElementById('sternUI');
  const cv = document.getElementById('sbCv'), rc = cv.getBoundingClientRect();
  for (let i = 0; i < T.SB.length; i++) {
    D.sternOpen(i); const s = D.sb(), C = s.c, W0 = cv.width, H0 = cv.height, sc = Math.min(W0 / 10.6, H0 / 6.6), ox = (W0 - sc * 10) / 2, oy = (H0 - sc * 6) / 2;
    for (let k = 1; k < C.path.length; k++) { const q = C.pts[C.path[k]]; D.sternTap({ clientX: rc.left + (ox + q[0] * sc) / s.d, clientY: rc.top + (oy + q[1] * sc) / s.d }); }
  }
  out.sterne = b.save.themen.stern.done.length; out.sternSticker = has('sterne'); D.sternClose(); out.uiClosed = !T.open;
  const lg = T.log(); out.log = lg.count; out.dest = ['minigolf', 'dino', 'zucker', 'sterne'].every(id => b.DEST.some(d => d.id === id));
  out.buchLog = b.buch && typeof b.buch === 'object';
  return out;
});
console.log(JSON.stringify(r));
ok(r.golfLabel === 'golf', 'an der Minigolf-Kasse: „Minigolf spielen“');
ok(r.golfDone && r.golfSticker && r.golfStars >= 3 && r.golfBest > 0, 'Minigolf: 3 Bahnen gespielt, Sterne + Sticker (' + r.golfStars + ' ⭐, ' + r.golfBest + ' Schläge)');
ok(r.bones === 6 && r.profLabel === 'prof' && r.dinoSticker, 'Dino-Ausgrabung: 6 Knochen, Professorin Fossi, Sticker');
ok(r.lolliLabel === 'lolli' && r.bonbons === 12 && r.huntOver && r.zuckerSticker, 'Zuckerland: 12 Bonbons gesammelt, Sticker');
ok(r.sternLabel === 'stern' && r.uiOpen && r.sterne === 5 && r.sternSticker && r.uiClosed, 'Sternwarte: 5 Sternbilder verbunden, Sticker, Fenster schließt');
ok(r.log === '4 von 4' && r.dest, 'Aufgabenliste 4 von 4 und alle Ziele im „Wohin?“-Menü');
ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 3).join(' | '));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); process.exit(fails ? 1 : 0);
