/* Gäste aus anderen easygames: alle 20 stehen am easygames-Treff, sind ansprechbar (Spiel im ersten Satz, +1 ⭐), 8 Gespräche = Sticker „Gästefreund“,
   Tier-Gäste haben dieselben Knochen wie Menschen (Vorlage spielbar), Ziel im „Wohin?“-Menü. Aufruf: node bunte-insel/tests/gaeste.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'de-DE' })).newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 90000 }); await p.click('#bStart'); await p.waitForTimeout(800);
const r = await p.evaluate(async () => {
  const b = __bi, P = b.P, sl = ms => new Promise(r => setTimeout(r, ms)), out = {}, G = BI.GAESTE, Q = BI.GAESTE_TREFF;
  P.x = Q.x; P.z = Q.z - 9; P.y = 0; for (let i = 0; i < 100; i++) { const g = b.life.regions.find(q => q.id === 'gaeste'); if (g.built && !g.todo) break; await sl(100); } /* fertig aufgebaut (in kleinen Portionen) */
  const reg = b.life.regions.find(q => q.id === 'gaeste'), list = reg.list || [];
  out.count = list.length; out.all = G.length; out.unique = new Set(list.map(n => n.guest)).size;
  out.labels = list.every(n => n.c.group.children.some(c => c.isSprite));
  /* Tier-Gast: gleiche Knochen und Bewegungen wie eine Menschenfigur */
  const k = BI.makeChar(G.find(g => g.id === 'g_kiko').o); k.pose(1, .8, true); k.dance(1, 1); k.sit(); k.punch(.5); out.rig = !!(k.legL && k.legR && k.armL && k.armR && k.group); k.dispose();
  out.hero = G.every(g => BI.HEROES.some(h => h.id === g.id)) && BI.HEROES[BI.HEROES.length - 1].id === 'custom';
  /* Gespräche: erster Satz nennt das Spiel, +1 Stern, nach 8 Gästen der Sticker */
  const s0 = b.save.stars; out.first = '';
  for (const n of list.slice(0, 8)) { P.x = n.x + 1; P.z = n.z; await sl(60); b.talkNpc(n); if (!out.first) out.first = b.dlg().cur ? b.dlg().cur.lines[0] : (document.querySelector('#rpgDlg .ln') || {}).textContent || ''; await sl(30); }
  out.stars = b.save.stars - s0; out.sticker = (b.save.stk || []).includes('gaeste');
  out.dest = !!b.DEST.find(d => d.id === 'gaeste');
  return out;
});
console.log(JSON.stringify(r));
ok(r.count === r.all && r.unique === r.all && r.all >= 20, 'alle ' + r.all + ' Gäste stehen am easygames-Treff (' + r.count + ')');
ok(r.labels, 'jeder Gast trägt ein Namensschild');
ok(r.rig, 'Tier-Gäste haben Beine, Arme und alle Bewegungen');
ok(r.hero, 'alle Gäste sind als Vorlage spielbar (vor „Eigener Held“)');
ok(/aus dem Spiel „/.test(r.first), 'erster Satz nennt das Herkunftsspiel: ' + r.first.slice(0, 60));
ok(r.stars >= 8, '+1 ⭐ pro neuem Gast (' + r.stars + ')');
ok(r.sticker, 'Sticker „Gästefreund“ nach 8 Gesprächen');
ok(r.dest, 'easygames-Treff steht im Wohin-Menü');
ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 3).join(' | '));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); process.exit(fails ? 1 : 0);
