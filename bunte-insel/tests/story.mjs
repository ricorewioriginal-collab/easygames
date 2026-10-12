/* Story-Modus: Freie Welt bleibt offen; Story startet zuhause, sperrt Inseln, schaltet sie nach Fortschritt frei, Moduswechsel jederzeit, Stand bleibt gespeichert. Aufruf: node bunte-insel/tests/story.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 800, height: 500 } }); const p = await ctx.newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const boot = async () => { await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(600); };
await boot();
const r = await p.evaluate(async () => {
  const b = __bi, K = b.smode, W = b.W, P = b.P, out = {}, sl = ms => new Promise(r => setTimeout(r, ms)), L = K.dbg.list;
  const into = I => { P.veh = null; P.x = I.O.x + 3; P.z = I.O.z; P.y = 0; const q = W.resolve(P.x, P.z, .45, {}); return Math.hypot(q.x - I.O.x, q.z - I.O.z); };
  out.n = L.length; out.free = L.every(I => !I.lock.on) && !K.on(); const M = L.find(I => I.key === 'MAERCHEN');
  out.freeWalk = into(M) < M.r - 1; /* Freie Welt: nichts schiebt hinaus */
  out.apart = L.every(A => Math.hypot(A.O.x, A.O.z) - A.r > 185 && L.every(B => B === A || Math.hypot(A.O.x - B.O.x, A.O.z - B.O.z) > A.r + 5));
  K.setMode('story'); await sl(300); const home = b.P; out.story = K.on(); out.locked = L.filter(I => I.lock.on).length; out.cityLocked = L.find(I => I.key === 'CITY').lock.on;
  out.home = Math.hypot(P.x + 54, P.z + 120) < 60; out.homeXZ = [Math.round(P.x), Math.round(P.z)];
  out.pushed = into(M) >= M.r - .05; out.signs = L.every(I => !I.lock.on || I.sp.visible);
  /* Fortschritt aus der freien Welt zählt: Sticker + Inselreise */
  b.save.stk = Array.from({ length: 30 }, (_, i) => 'fake' + i); b.save.story = b.save.story || { c: 0, ev: {}, seen: true }; b.save.story.c = 9; await sl(1600);
  const open = L.filter(I => !I.lock.on).map(I => I.key); out.open = open.join(','); out.maerchenOpen = !M.lock.on && !!K.dbg.S().unl.MAERCHEN; out.stillLocked = L.find(I => I.key === 'SCHLUESSEL').lock.on;
  out.walkIn = into(M) < M.r - 1; out.log = !!K.log() && K.log().rows.length === L.length;
  K.setMode('free'); await sl(200); out.backFree = !K.on() && L.every(I => !I.lock.on); out.saved = b.save.mode === 'free';
  K.setMode('story'); await sl(200); out.again = K.on() && L.find(I => I.key === 'SCHLUESSEL').lock.on;
  return out;
});
console.log(JSON.stringify(r));
ok(r.n === 15 && r.free, 'Freie Welt: 15 Inseln, nichts gesperrt'); ok(r.freeWalk, 'Freie Welt: man kommt überall hin'); ok(r.apart, 'Absperrungen überlappen weder Hauptinsel noch andere Inseln');
ok(r.story && r.home, 'Story-Start: zuhause (' + r.homeXZ + ')'); ok(r.locked === 15 && r.cityLocked, 'Story (neu): alle 15 Inseln gesperrt'); ok(r.pushed && r.signs, 'Gesperrte Insel schiebt hinaus, Schild sichtbar');
ok(r.maerchenOpen && r.stillLocked && r.walkIn, 'Fortschritt (30 Sticker, Reise fertig) öffnet Märchenland, Schlüsselreich bleibt zu (offen: ' + r.open + ')'); ok(r.log, 'Aufgabenliste „Welten freischalten“');
ok(r.backFree && r.saved, 'Zurück zur freien Welt: alles offen, Modus gespeichert'); ok(r.again, 'Wieder Story: Fortschritt bleibt, Rest gesperrt');
/* nach Neuladen: Modus + Stand bleiben */
await p.waitForTimeout(500); await boot();
const r2 = await p.evaluate(() => { const K = __bi.smode; return { on: K.on(), locked: K.dbg.list.filter(I => I.lock.on).length, schl: K.dbg.list.find(I => I.key === 'SCHLUESSEL').lock.on }; });
ok(r2.on && r2.locked > 0 && r2.schl, 'Nach Neuladen: Story-Modus und Stand bleiben gespeichert (' + r2.locked + ' gesperrt)');
ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 3).join(' | '));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); process.exit(fails ? 1 : 0);
