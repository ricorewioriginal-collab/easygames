/* Browser-Test der Schatzsuche über alle Inseln (Bunte Insel, js/schatz.js).
   Aufruf: BASE=http://localhost:8080 node bunte-insel/tests/schatz.mjs   (optional THREE=/pfad/zu/three.min.js für Offline-Betrieb; DEBUG=1 zeigt Rohwerte) */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 900, height: 560 } });
let fails = 0; const errs = [];
const dbg = r => { if (process.env.DEBUG) console.log('   ', JSON.stringify(r)); };
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const p = await ctx.newPage(); p.on('pageerror', e => errs.push('PAGEERR ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n'))); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errs.push(m.text()); });
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(500);

/* ---------- Schatzsuche ---------- */
{
  const r = await p.evaluate(async () => {
    const b = window.__bi, Z = b.schatz, W = b.W, P = b.P, out = {}, sl = ms => new Promise(r => setTimeout(r, ms)), ST = BI.SCHATZ_STEPS, sp = Z.state().spots;
    out.n = sp.length === 8 && ST.length === 8; out.free = sp.every((q, i) => isFinite(q.x + q.z) && W.free(q.x, q.z, 1.2) && Math.hypot(q.x - ST[i].isle().x, q.z - ST[i].isle().z) < ST[i].isle().R);
    out.apart = sp.every((q, i) => sp.every((o, j) => i === j || Math.hypot(q.x - o.x, q.z - o.z) > 30));
    const pi = Z.state().pietAt; out.piet = !!Z.pietChar && W.free(pi.x + 2.5, pi.z, .8) && Math.hypot(pi.x, pi.z) < 150;
    const said = []; BI.audio.speak = t => said.push(t);
    P.veh = null; P.y = 0; P.x = pi.x + 2; P.z = pi.z; await sl(200); out.noChest = Z.state().chest.visible === false;
    let n = b.placeNear(); out.startLabel = !!n && n.src === 'schatz' && n.n.k === 'schatzstart'; b.placeAct(n); out.started = b.save.schatz.i === 0 && Z.state().chest.visible && Math.hypot(Z.state().chest.position.x - sp[0].x, Z.state().chest.position.z - sp[0].z) < .5; await sl(4200); out.spoke = said.length >= 2;
    n = b.placeNear(); out.clueLabel = !!n && n.n.k === 'schatzclue';
    const s0 = b.save.stars; let ok8 = true;
    for (let i = 0; i < 8; i++) { P.x = sp[i].x + 1.5; P.z = sp[i].z; P.y = 0; await sl(120); const m = b.placeNear(); if (!m || m.n.k !== 'schatz') { ok8 = false; out.failAt = i; out.got = m ? m.src + ':' + (m.n && m.n.k) : null; break; } b.placeAct(m); await sl(60); if (i < 7 && b.save.schatz.i !== i + 1) ok8 = false; }
    out.all = ok8; out.stars = b.save.stars - s0 >= 8 + 10 && b.save.stars - s0 <= 8 + 10 + 12; /* + Willkommens-Sterne der Inseln */ out.done = b.save.schatz.i === -1 && b.save.schatz.runs === 1 && Z.state().chest.visible === false;
    /* zweiter Durchgang: Schluss-Bonus nur 5 */
    P.x = pi.x + 2; P.z = pi.z; P.y = 0; await sl(150); b.placeAct(b.placeNear()); const s1 = b.save.stars; for (let i = 0; i < 8; i++) { P.x = sp[i].x + 1.5; P.z = sp[i].z; P.y = 0; await sl(100); const m = b.placeNear(); if (m && m.n.k === 'schatz') b.placeAct(m); await sl(40); }
    out.run2 = b.save.stars - s1 === 8 + 5 && b.save.schatz.runs === 2;
    /* Kiste im Weg (z. B. später gebautes Fahrgeschäft) → wird an einen freien Platz in der Nähe versetzt */
    P.x = pi.x + 2; P.z = pi.z; P.y = 0; await sl(150); b.placeAct(b.placeNear()); await sl(100); const q0 = { x: sp[0].x, z: sp[0].z }; W.addCircle(q0.x, q0.z, 3.2, false, 6); Z.update(2.5, 20); Z.update(2.5, 21); await sl(50);
    const q1 = Z.state().spots[0]; out.moved = (q1.x !== q0.x || q1.z !== q0.z) && W.free(q1.x, q1.z, 1.2) && Math.abs(Z.state().chest.position.x - q1.x) < .01 && Math.hypot(q1.x - q0.x, q1.z - q0.z) < 30;
    out.log = b.schatz.log().rows.length === 2; out.kid = JSON.stringify(b.save).includes('schatz'); return out;
  });
  if (process.env.DEBUG) console.log('   ', JSON.stringify(r));
  ok(r.n && r.free && r.apart, 'Schatzsuche: 8 Kisten-Plätze, frei und auf den richtigen Inseln'); ok(r.piet && r.noChest, 'Schatzmeister Piet steht frei auf der Hauptinsel; vor dem Start keine Kiste');
  ok(r.startLabel && r.started && r.spoke && r.clueLabel, 'Start: Knopf „Schatzsuche starten“, erste Kiste + Lichtstrahl, Rätsel wird vorgelesen');
  ok(r.all && r.stars && r.done, 'Alle 8 Kisten nacheinander: je +1 ⭐, großer Schatz +10 ⭐, danach ist die Suche fertig'); ok(r.moved, 'Schatzsuche: Kiste im Weg wird an einen freien Platz versetzt'); ok(r.run2 && r.log, 'Zweiter Durchgang möglich (Schluss-Bonus 5 ⭐); Aufgaben-Log zeigt die nächste Kiste');
}
ok(errs.length === 0, 'Keine Konsolen-/Seitenfehler' + (errs.length ? '\n' + errs.slice(0, 5).join('\n') : ''));
await browser.close(); console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlles gut ✅'); process.exit(fails ? 1 : 0);
