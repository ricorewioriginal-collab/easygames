/* Browser-Test der verkleinerten Welten (Zotik, Funkwelle; Bunte Insel).
   Aufruf: BASE=http://localhost:8080 node bunte-insel/tests/welten.mjs   (optional THREE=/pfad/zu/three.min.js für Offline-Betrieb; DEBUG=1 zeigt Rohwerte) */
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

/* ---------- Zotik (Lunaris) im Miniatur-Maßstab ---------- */
{
  const r = await p.evaluate(async () => {
    const b = window.__bi, W = b.W, Z = BI.ZOTIK, out = {}, sl = ms => new Promise(r => setTimeout(r, ms));
    out.size = Z.R <= 75 && Z.R >= 55;
    out.bridge = true; for (let z = Z.bridge.z0 + 2; z < Z.bridge.z1 - 1; z += 4) if (W.resolve(0, z, .4, {}).hit) out.bridge = false;
    out.bridgeEnd = Math.abs(Z.bridge.z1 - (Z.z - Z.R)) < 1.5 && !W.resolve(0, Z.z - Z.R + 2, .4, {}).hit;
    const pts = [Z.tavern, Z.akad, Z.statue, Z.hint, Z.gateC].concat(Z.gates); out.inside = pts.every(o => o && Math.hypot(o.x - Z.x, o.z - Z.z) < Z.R - 3);
    const fl2ok = v => v > 3 && v < 8; const hx = Z.x + Z.hill.x * Z.S, hz = Z.z + Z.hill.z * Z.S; const fl = W.floorAt ? W.floorAt(hx, hz) : W.zotik.floor(hx, hz); out.fl = fl; out.fl2 = W.zotik.floor(hx, hz); out.hill = fl2ok(out.fl2); out.flatEdge = W.zotik.floor(Z.x - Z.R + 6, Z.z) === 0;
    out.zone = BI.worldAt(Z.x, Z.z) === 'zotik' && BI.zoneAt(Z.x + 30, Z.z, {}) === 'zotik';
    const g = b.zotik.shards || []; out.shards = g.length > 20 && g.every(q => Math.hypot(q.x - Z.x, q.z - Z.z) < Z.R);
    out.coll = W.resolve(Z.statue.x, Z.statue.z, .4, {}).hit === true; /* Statue ist ein Hindernis */
    /* andere Inseln überlappen nicht */
    const others = [BI.DRACHEN, BI.PUPS, BI.RADIO, BI.PARK]; out.apart = others.every(o => Math.hypot(o.x - Z.x, o.z - Z.z) > o.R + Z.R + 8);
    b.P.x = Z.x; b.P.z = Z.z + 30; b.P.y = 0; await sl(500); out.talk = true; return out;
  });
  if (process.env.DEBUG) console.log('   ', JSON.stringify(r));
  ok(r.size && r.apart, 'Zotik: Insel-Größe (R≈70), überlappt keine andere Insel'); ok(r.bridge && r.bridgeEnd, 'Zotik: Brücke lückenlos bis zur Insel'); ok(r.inside && r.hill && r.flatEdge, 'Zotik: Gebäude, Tore, Statue innerhalb; Burghügel begehbar (Höhe passt)'); ok(r.zone && r.shards && r.coll, 'Zotik: Zone/Musik, Splitter auf der Insel, Statue kollidiert');
}

/* ---------- Funkwelle ---------- */
{
  const r = await p.evaluate(() => {
    const b = window.__bi, W = b.W, R = BI.RADIO, out = {}; out.size = R.R <= 70 && R.R >= 55;
    const B = R.bridge; out.bridge = true; for (let t = 4; t < B.L - 2; t += 4) if (W.resolve(B.ax + B.ux * t, B.az + B.uz * t, .4, {}).hit) out.bridge = false; out.bridgeLen = B.L > 20 && B.L < 140;
    const pl = R.plots; out.plots = pl.length === 13 && pl.every(q => Math.hypot(q.C.x - R.x, q.C.z - R.z) + 9.7 < R.R - 2);
    let min = 1e9; for (let i = 0; i < pl.length; i++) { const a = pl[i].C, c = pl[(i + 1) % pl.length].C; min = Math.min(min, Math.hypot(a.x - c.x, a.z - c.z)); } out.apart = min >= 19.4; out.minDist = min;
    out.hub = R.hub < R.ring - 9.7 - 6;
    out.zone = BI.worldAt(R.x, R.z) === 'radio' && BI.zoneAt(R.x, R.z + 20, {}) === 'radio';
    const sh = b.radio.shards; out.notes = sh.length > 20 && sh.every(q => Math.hypot(q.x - R.x, q.z - R.z) < R.R);
    out.apartIsles = [BI.PARK, BI.DRACHEN, BI.ZOTIK].every(o => Math.hypot(o.x - R.x, o.z - R.z) > o.R + R.R + 8);
    out.near = ((b.radio.inside, true)); return out;
  });
  if (process.env.DEBUG) console.log('   ', JSON.stringify(r));
  ok(r.size && r.apartIsles, 'Funkwelle: Insel-Größe (R≈64), überlappt keine andere Insel'); ok(r.bridge && r.bridgeLen, 'Funkwelle: Brücke lückenlos');
  ok(r.plots && r.apart && r.hub, 'Funkwelle: 13 Sender-Plätze passen nebeneinander auf die kleinere Insel'); ok(r.zone && r.notes, 'Funkwelle: Zone/Musik, Noten auf der Insel');
}
ok(errs.length === 0, 'Keine Konsolen-/Seitenfehler' + (errs.length ? '\n' + errs.slice(0, 5).join('\n') : ''));
await browser.close(); console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlles gut ✅'); process.exit(fails ? 1 : 0);
