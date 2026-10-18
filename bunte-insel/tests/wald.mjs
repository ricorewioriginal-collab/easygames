/* Test: Gegner aller Welten auf der Wald-Insel, Waldtor im alten Wald (Dunkelwichtel, Dunkelriese, Zotik-Monster …). Aufruf: node bunte-insel/tests/wald.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 700, height: 450 } })).newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(500);
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const r = await p.evaluate(async () => {
  const b = __bi, c = b.combat, D = c.dbg, FO = b.W.spots.wald_mond, sl = ms => new Promise(r => setTimeout(r, ms)), out = {};
  b.P.veh = null; b.P.x = FO.x; b.P.z = FO.z; b.P.y = 0; await sl(800);
  const kinds = ['blob', 'spike', 'mush', 'wichtel', 'moos', 'wolf', 'frost', 'lava', 'riese', 'boss', 'klecks', 'kaeferbot', 'verduenner', 'skizze', 'tintenriese', 'plankto', 'planktobot']; out.types = kinds.every(k => D.spawn && true);
  const made = kinds.map(k => D.spawn(k, FO.x + 3, FO.z + 3, { isle: true })); out.n = made.length; out.names = made.map(e => e.T.n).join(',');
  await sl(600); out.alive = D.enemies.filter(e => !e.dead).length;
  const st = b.save.fight || {}; const e = made[3]; D.damage(e, 999, 1, 0); await sl(100); out.dw = (b.save.fight.dw | 0) >= 1 && (b.save.stk || []).includes('schatten');
  const rz = made[8]; const tb = made[14]; const pb = made[16]; D.damage(pb, 99999, 1, 0); await sl(100); out.plankton = (b.save.stk || []).includes('plankton'); D.damage(tb, 99999, 1, 0); await sl(100); out.tinte = (b.save.stk || []).includes('tintenboss'); D.damage(rz, 9999, 1, 0); await sl(100); out.riese = (b.save.stk || []).includes('schluesseltraeger');
  D.enemies.length && await sl(1000); out.tris = b.renderer.info.render.calls;
  return out; });
ok(r.n === 17 && /Winzling Plankto/.test(r.names) && /Riesen-Roboter/.test(r.names) && /Tintenklecks/.test(r.names) && /Käfer-Roboter/.test(r.names) && /Verdünner/.test(r.names) && /Skizzen/.test(r.names) && /große Klecks/.test(r.names) && /Dunkelwichtel/.test(r.names) && /Moosling/.test(r.names) && /Dornenwolf/.test(r.names) && /Frostgeist/.test(r.names) && /Lavadrache/.test(r.names) && /Dunkelriese/.test(r.names), 'Alle Welt-Gegner lassen sich im Wald erzeugen: ' + r.names);
ok(r.alive >= 14, 'Gegner leben und bewegen sich (' + r.alive + ')'); ok(r.dw, 'Dunkelwichtel besiegt → Sticker'); ok(r.plankton, 'Planktos Riesen-Roboter besiegt → Sticker Plankto-Bezwinger'); ok(r.tinte, 'Der große Klecks besiegt → Sticker Klecks-Bezwinger'); ok(r.riese, 'Dunkelriese besiegt → Sticker Schlüsselträger');
/* Wald-Insel (großer Verbotener Wald): Insel + Brücke, Ausrüstung kaufen/anlegen, Kampfstufe, Lager sicher, Lichtungs-Wächter */
const w = await p.evaluate(async () => {
  const b = __bi, c = b.combat, D = c.dbg, W = b.W, sl = ms => new Promise(r => setTimeout(r, ms)), o = {};
  o.isle = W.isles.some(i => i.id === 'wald'); const e = W.spots.waldinsel; o.ground = W.groundY(e.x, e.z, 5) > -0.1;
  b.P.veh = null; const sh = W.spots.waldShop; b.P.x = sh.x; b.P.z = sh.z - 1.4; await sl(300); const n = b.wald.near(); o.shopNear = !!n && n.k === 'wshop';
  b.save.stars = 100; b.gear.show('Test'); await sl(100); const btn = [...document.querySelectorAll('button')].find(x => x.textContent.includes('15 ⭐')); btn && btn.click(); b.gear.close();
  o.sword = b.gear.weapon().id === 'schwert' && b.save.stars < 100 && b.gear.dmgMul() > 1;
  const lv0 = c.level(); b.save.fight.xp = 60; o.level = c.level() > lv0 && c.level() >= 5;
  const z = W.spots.wald_mond; b.P.x = z.x; b.P.z = z.z; await sl(500); o.active = c.active();
  D.zk.mond = 8; const boss = D.spawn('mondwolf', z.x + 4, z.z, { isle: true, wz: 'mond', zboss: true }); D.damage(boss, 99999, 1, 0); await sl(200); o.zone = !!(b.save.wald && b.save.wald.zb && b.save.wald.zb.mond);
  const cp = W.spots.waldCamp; b.P.x = cp.x; b.P.z = cp.z; await sl(300); const m = D.spawn('blob', cp.x + 1, cp.z, { isle: true }); await sl(600); o.campSafe = !b.wald || (Math.hypot(m.x - cp.x, m.z - cp.z) > BI.WALD.camp.r);
  o.log = b.wald.log().rows.length === 8; return o; });
console.log(w);
ok(w.isle && w.ground, 'Wald-Insel steht mit Boden und Brücke'); ok(w.shopNear && w.sword, 'Waldhändlerin: Schwert kaufen und anlegen'); ok(w.level, 'Kampfstufe steigt mit Erfahrung');
ok(w.active && w.zone, 'Kampf auf der Wald-Insel, Wächter der Mondlichtung besiegt'); ok(w.campSafe, 'Monster bleiben aus dem Lager'); ok(w.log, 'Aufgaben-Liste der Wald-Insel');
/* Alter Wald friedlich + Waldtor, Ausrüstung im Kampf anlegen, Waldgeist zwischen den Lichtungen */
const t3 = await p.evaluate(async () => {
  const b = __bi, c = b.combat, D = c.dbg, W = b.W, FO = W.spots.forest, sl = ms => new Promise(r => setTimeout(r, ms)), o = {};
  b.P.veh = null; b.P.x = FO.x; b.P.z = FO.z; await sl(500); o.oldPeace = !c.active();
  b.P.x = FO.gx; b.P.z = FO.gz; await sl(200); const n = b.wald.near(); o.tor = !!n && n.k === 'wtor'; b.wald.act(n); await sl(300);
  o.beamed = W.isles.find(i => i.id === 'wald') && BI.WALD.onIsle(b.P.x, b.P.z, 2);
  const z = W.spots.wald_mond; b.P.x = z.x; b.P.z = z.z; await sl(600); const gb = document.getElementById('fbGear'); o.gearBtn = !!gb && !gb.hidden;
  gb && gb.click(); await sl(150); const btns = [...document.querySelectorAll('button')].map(x => x.textContent); o.gearOpen = b.gear.open && !btns.some(x => /\d+ ⭐$/.test(x.trim())); b.gear.close();
  D.zk.frei = 10; const pt = BI.WALD.at(-64 + 30, 0); b.P.x = pt.x; b.P.z = pt.z; for (let i = 0; i < 40 && !D.enemies.some(e => e.kind === 'boss' && e.wz === 'frei'); i++) await sl(250);
  const g = D.enemies.find(e => e.kind === 'boss' && e.wz === 'frei'); o.geist = !!g; if (g) { D.damage(g, 99999, 1, 0); await sl(150); } o.geistStk = (b.save.stk || []).includes('boss');
  return o; });
console.log(t3);
ok(t3.oldPeace, 'Alter Wald der Hauptinsel ist friedlich'); ok(t3.tor && t3.beamed, 'Waldtor bringt zur Wald-Insel'); ok(t3.gearBtn && t3.gearOpen, 'Im Kampf: 🎒 Ausrüstung anlegen (ohne Kaufen)'); ok(t3.geist && t3.geistStk, 'Waldgeist erscheint zwischen den Lichtungen → Sticker Waldheld');
ok(errs.length === 0, 'Keine Seitenfehler' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'ALLES OK'); process.exit(fails ? 1 : 0);
