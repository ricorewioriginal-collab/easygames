/* Brücken-Test: keine Brücke kreuzt eine andere Brücke oder eine fremde Insel, jede Brücke ist von Ufer zu Ufer begehbar.
   Aufruf: node bunte-insel/tests/bruecken.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 600, height: 400 } })).newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.waitForTimeout(500);
const r = await p.evaluate(() => {
  const W = __bi.W, segs = [], issues = [], bad = [], KEYS = ['CITY', 'DAMPF', 'DRACHEN', 'PARK', 'PUPS', 'RAINBOW', 'ZOTIK', 'BAULAND', 'FUSSBALL', 'MAERCHEN', 'SCHLUESSEL', 'SCHWAMM', 'RAETSEL'];
  for (const n of KEYS) { const o = BI[n], B = o && o.bridge; if (!B) continue; if (B.mx !== undefined) { const ux = Math.sin(B.ry), uz = Math.cos(B.ry); segs.push({ n, ax: B.mx - ux * B.L / 2, az: B.mz - uz * B.L / 2, bx: B.mx + ux * B.L / 2, bz: B.mz + uz * B.L / 2, w: B.w }); } else { const h = (B.x1 - B.x0) > (B.z1 - B.z0); segs.push(h ? { n, ax: B.x0, az: (B.z0 + B.z1) / 2, bx: B.x1, bz: (B.z0 + B.z1) / 2, w: B.z1 - B.z0 } : { n, ax: (B.x0 + B.x1) / 2, az: B.z0, bx: (B.x0 + B.x1) / 2, bz: B.z1, w: B.x1 - B.x0 }); } }
  const dseg = (x, z, s) => { const dx = s.bx - s.ax, dz = s.bz - s.az, t = Math.max(0, Math.min(1, ((x - s.ax) * dx + (z - s.az) * dz) / (dx * dx + dz * dz))); return { d: Math.hypot(x - (s.ax + t * dx), z - (s.az + t * dz)), t }; };
  for (const s of segs) {
    for (const k of KEYS) { const I = BI[k]; if (k === s.n || !I || !I.R) continue; const q = dseg(I.x, I.z, s); if (q.d < I.R + s.w / 2 && q.t > .03 && q.t < .97) issues.push(s.n + ' kreuzt Insel ' + k); }
    for (const o of segs) { if (o.n <= s.n) continue; const den = (s.bx - s.ax) * (o.bz - o.az) - (s.bz - s.az) * (o.bx - o.ax); if (Math.abs(den) < 1e-6) continue; const t = ((o.ax - s.ax) * (o.bz - o.az) - (o.az - s.az) * (o.bx - o.ax)) / den, u = ((o.ax - s.ax) * (s.bz - s.az) - (o.az - s.az) * (s.bx - s.ax)) / den; if (t > 0 && t < 1 && u > 0 && u < 1) issues.push('Brücke ' + s.n + ' kreuzt Brücke ' + o.n); }
    /* Nahe Brückenanfänge am Rand der Hauptinsel dürfen sich nicht überlappen */
    for (const o of segs) { if (o.n <= s.n) continue; const d = Math.hypot(s.ax - o.ax, s.az - o.az); if (d < (s.w + o.w) / 2 + 6) issues.push('Brückenanfänge ' + s.n + ' und ' + o.n + ' nur ' + d.toFixed(0) + ' m auseinander'); }
    let walk = true; for (let t = .1; t <= .9; t += .1) { const x = s.ax + (s.bx - s.ax) * t, z = s.az + (s.bz - s.az) * t; if (W.resolve(x, z, .4, {}).hit) walk = false; } if (!walk) bad.push(s.n);
  }
  return { n: segs.length, issues, bad }; });
console.log(r.n + ' Brücken geprüft'); r.issues.forEach(x => console.log('  ✗', x));
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
ok(r.n >= 10, r.n + ' Brücken gefunden'); ok(r.issues.length === 0, 'Keine Überschneidungen von Brücken untereinander oder mit fremden Inseln'); ok(r.bad.length === 0, 'Alle Brücken sind begehbar' + (r.bad.length ? ' – blockiert: ' + r.bad : '')); ok(!errs.length, 'Keine Seitenfehler');
await browser.close(); console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlles gut ✅'); process.exit(fails ? 1 : 0);
