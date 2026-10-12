/* Test: Gegner aller Welten im Verbotenen Wald (Dunkelwichtel, Dunkelriese, Zotik-Monster …). Aufruf: node bunte-insel/tests/wald.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 700, height: 450 } })).newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(500);
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const r = await p.evaluate(async () => {
  const b = __bi, c = b.combat, D = c.dbg, FO = b.W.spots.forest, sl = ms => new Promise(r => setTimeout(r, ms)), out = {};
  b.P.veh = null; b.P.x = FO.x; b.P.z = FO.z; b.P.y = 0; await sl(800);
  const kinds = ['blob', 'spike', 'mush', 'wichtel', 'moos', 'wolf', 'frost', 'lava', 'riese', 'boss', 'klecks', 'kaeferbot', 'verduenner', 'skizze', 'tintenriese', 'plankto', 'planktobot']; out.types = kinds.every(k => D.spawn && true);
  const made = kinds.map(k => D.spawn(k, FO.x + 3, FO.z + 3, { home: true })); out.n = made.length; out.names = made.map(e => e.T.n).join(',');
  await sl(600); out.alive = D.enemies.filter(e => !e.dead).length;
  const st = b.save.fight || {}; const e = made[3]; D.damage(e, 999, 1, 0); await sl(100); out.dw = (b.save.fight.dw | 0) >= 1 && (b.save.stk || []).includes('schatten');
  const rz = made[8]; const tb = made[14]; const pb = made[16]; D.damage(pb, 99999, 1, 0); await sl(100); out.plankton = (b.save.stk || []).includes('plankton'); D.damage(tb, 99999, 1, 0); await sl(100); out.tinte = (b.save.stk || []).includes('tintenboss'); D.damage(rz, 9999, 1, 0); await sl(100); out.riese = (b.save.stk || []).includes('schluesseltraeger');
  D.enemies.length && await sl(1000); out.tris = b.renderer.info.render.calls;
  return out; });
ok(r.n === 17 && /Winzling Plankto/.test(r.names) && /Riesen-Roboter/.test(r.names) && /Tintenklecks/.test(r.names) && /Käfer-Roboter/.test(r.names) && /Verdünner/.test(r.names) && /Skizzen/.test(r.names) && /große Klecks/.test(r.names) && /Dunkelwichtel/.test(r.names) && /Moosling/.test(r.names) && /Dornenwolf/.test(r.names) && /Frostgeist/.test(r.names) && /Lavadrache/.test(r.names) && /Dunkelriese/.test(r.names), 'Alle Welt-Gegner lassen sich im Wald erzeugen: ' + r.names);
ok(r.alive >= 14, 'Gegner leben und bewegen sich (' + r.alive + ')'); ok(r.dw, 'Dunkelwichtel besiegt → Sticker'); ok(r.plankton, 'Planktos Riesen-Roboter besiegt → Sticker Plankto-Bezwinger'); ok(r.tinte, 'Der große Klecks besiegt → Sticker Klecks-Bezwinger'); ok(r.riese, 'Dunkelriese besiegt → Sticker Schlüsselträger');
ok(errs.length === 0, 'Keine Seitenfehler' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'ALLES OK'); process.exit(fails ? 1 : 0);
