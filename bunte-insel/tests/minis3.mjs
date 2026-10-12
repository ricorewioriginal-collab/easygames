/* Browser-Test der Mini-Spiele für die Kleinen (Bunte Insel, js/minis3.js) und ihrer Spielautomaten.
   Aufruf: BASE=http://localhost:8080 node bunte-insel/tests/minis3.mjs   (optional THREE=/pfad/zu/three.min.js für Offline-Betrieb; DEBUG=1 zeigt Rohwerte) */
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

/* ---------- Spiele laufen, reagieren aufs Antippen, stürzen nicht ab ---------- */
{
  const r = await p.evaluate(async () => {
    const b = window.__bi, M = b.mini, out = { keys: {}, arc: {} }, sl = ms => new Promise(r => setTimeout(r, ms));
    const KEYS = ['schmetterling_insel', 'ampel_stadt', 'ringe_park', 'farben_regenbogen', 'angeln_dampfer', 'eier_drachen', 'welpen_pups', 'elfmeter_fussball', 'formen_bauland', 'noten_radio', 'elemente_zotik', 'sterne_maerchen', 'blasen_atlantis'];
    for (const k of KEYS) {
      const meta = M.GAMES[k]; if (!meta) { out.keys[k] = 'fehlt'; continue; }
      M.start(k, 4242, 45); const g = M.cur(), W = 900, H = 560; let s0 = M.score, err = '';
      try {
        for (let i = 0; i < 120; i++) { M.update(1 / 30); }
        const d = g.dbg && g.dbg();
        if (d && d.it) { /* Tipp-Jagd: Dinge antippen */ for (let n = 0; n < 40; n++) { for (let i = 0; i < 8; i++) M.update(1 / 20); const q = (g.dbg().it || []).find(o => !o.bad); if (q) g.tap(q.x, q.y); } }
        else if (d && d.lay) { /* Such-Bild */ for (let n = 0; n < 6; n++) { const dd = g.dbg(), L = dd.lay(), i = dd.opts.indexOf(dd.target); g.tap(L[i].x, L[i].y); for (let j = 0; j < 40; j++) M.update(1 / 30); } }
        else if (d && d.zone) { /* Ring-Fang */ for (let n = 0; n < 4; n++) { const dd = g.dbg(); dd.x = dd.zone.c; g.tap(); for (let j = 0; j < 40; j++) M.update(1 / 30); } }
        else if (d && 'st' in d) { /* Ampel */ for (let n = 0; n < 6; n++) { for (let j = 0; j < 400 && g.dbg().st !== 'green'; j++) M.update(1 / 30); g.tap(); for (let j = 0; j < 50; j++) M.update(1 / 30); } }
        else if (d && d.shoot) { /* Elfmeter */ for (let n = 0; n < 5; n++) { for (let j = 0; j < 100 && d.stage !== 'aim'; j++) M.update(1 / 30); const gl = d.goal(); d.shoot(gl.x0 + 10, gl.y0 + 10, (gl.x0 + gl.x1) / 2); for (let j = 0; j < 90; j++) M.update(1 / 30); } }
      } catch (e) { err = String(e && e.message || e); }
      out.keys[k] = err ? 'FEHLER ' + err : (M.score > s0 ? 'ok' : 'kein Punkt (' + M.score + ')'); M.stop();
    }
    /* Spielautomaten */
    const ar = (b.W.spots.arcades || []); for (const k of KEYS) if (k !== 'blasen_atlantis' && k !== 'sterne_maerchen') out.arc[k] = ar.some(a => a.kind === k);
    return out;
  });
  if (process.env.DEBUG) console.log('   ', JSON.stringify(r));
  const bad = Object.entries(r.keys).filter(([k, v]) => v !== 'ok'); ok(bad.length === 0, 'Alle 13 Kinder-Spiele: starten, Antippen gibt Punkte, kein Fehler' + (bad.length ? ' – ' + JSON.stringify(bad) : ''));
  const noArc = Object.entries(r.arc).filter(([k, v]) => !v).map(([k]) => k); ok(noArc.length === 0, 'Jede Insel hat ihren Spielautomaten' + (noArc.length ? ' – fehlt: ' + noArc.join(',') : ''));
}
ok(errs.length === 0, 'Keine Konsolen-/Seitenfehler' + (errs.length ? '\n' + errs.slice(0, 5).join('\n') : ''));
await browser.close(); console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlles gut ✅'); process.exit(fails ? 1 : 0);
