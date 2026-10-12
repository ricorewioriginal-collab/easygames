/* Story-Modus: Freie Welt bleibt offen; Story startet zuhause, sperrt Inseln, schaltet sie nach Fortschritt frei, Moduswechsel jederzeit, Stand bleibt gespeichert. Aufruf: node bunte-insel/tests/story.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 800, height: 500 } }); const p = await ctx.newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const boot = async (menu) => { await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); if (!menu) await p.click('#bStart'); await p.waitForTimeout(600); };
await boot(true);
/* Hauptmenü: Freie Welt oder Story-Modus */
const menu = await p.evaluate(() => ({ free: !!document.getElementById('bStart') && /Freie Welt/.test(document.getElementById('bStart').textContent), story: !!document.getElementById('bStartStory') && /Story/.test(document.getElementById('bStartStory').textContent) }));
await p.click('#bStartStory'); await p.waitForTimeout(1500);
const r = await p.evaluate(async () => {
  const b = __bi, K = b.smode, W = b.W, P = b.P, out = {}, sl = ms => new Promise(r => setTimeout(r, ms)), L = K.dbg.list;
  const into = I => { P.veh = null; P.x = I.O.x + 3; P.z = I.O.z; P.y = 0; const q = W.resolve(P.x, P.z, .45, {}); return Math.hypot(q.x - I.O.x, q.z - I.O.z); };
  const M = L.find(I => I.key === 'MAERCHEN'), C = L.find(I => I.key === 'CITY');
  out.n = L.length; out.story = K.on(); out.locked = L.filter(I => I.lock.on).length; out.home = Math.hypot(P.x + 54, P.z + 120) < 60 && !!K.dbg.S().started;
  out.apart = L.every(A => Math.hypot(A.O.x, A.O.z) - A.r > 185 && L.every(B => B === A || Math.hypot(A.O.x - B.O.x, A.O.z - B.O.z) > A.r + 5));
  out.pushed = into(M) >= M.r - .05; out.signs = L.every(I => !I.lock.on || I.sp.visible && I.mesh.visible); out.reqs = L.every(I => I.req.length === 3 && I.req.every(id => !!K.dbg.info(id).name && K.dbg.info(id).name !== id));
  /* Wohin?: gesperrte Orte mit Schloss, ohne Weg/Hinzaubern */
  document.getElementById('bGuide').click(); await sl(300); const rows = [...document.querySelectorAll('#guideGrid .grow')]; const lockedRows = rows.filter(r => r.textContent.includes('🔒'));
  document.getElementById('guideTabs').children[0] && [...document.querySelectorAll('#guideTabs .gtab')].forEach(t => t.click());
  out.guideLock = lockedRows.length > 0 && lockedRows.every(r => !r.querySelector('button[title="Weg zeigen"]') && !r.querySelector('button[title="Hinzaubern"]') && /gesperrt/.test(r.textContent)); out.guideRows = rows.length;
  document.getElementById('guideClose').click(); await sl(100);
  /* Quest-Log */
  document.getElementById('bLog').click(); await sl(300); const txt = document.getElementById('questNow').textContent; out.log = /Welten freischalten/.test(txt) && /Hauptquest/.test(txt) && /🔒/.test(txt) && !!document.querySelector('#questNow .lgBar'); document.getElementById('questClose').click();
  /* Fortschritt: Stadtinsel-Sticker erledigt → Stadtinsel offen, Rest zu */
  b.save.stk = [...C.req]; for (let i = 0; i < 30 && (C.lock.on || !K.dbg.S().unl.CITY); i++) await sl(250); out.cityOpen = !C.lock.on && !!K.dbg.S().unl.CITY; out.stillLocked = M.lock.on && L.filter(I => I.lock.on).length === 14; out.walkIn = into(C) < C.r - 1;
  out.dest = !!K.lockedAt(M.O.x, M.O.z) && !K.lockedAt(C.O.x, C.O.z);
  K.setMode('free'); await sl(200); out.backFree = !K.on() && L.every(I => !I.lock.on) && !K.lockedAt(M.O.x, M.O.z); out.saved = b.save.mode === 'free';
  K.setMode('story'); await sl(200); out.again = K.on() && M.lock.on && !C.lock.on;
  return out;
});
r.menu = menu;
console.log(JSON.stringify(r));
ok(r.menu.free && r.menu.story, 'Hauptmenü: „Freie Welt“ und „Story-Modus“ statt „Spielen“'); ok(r.n === 15 && r.story && r.home, 'Story-Modus aus dem Menü: gestartet, zuhause begonnen'); ok(r.locked === 15, 'Neu: alle 15 Welten gesperrt');
ok(r.apart, 'Absperrungen überlappen weder Hauptinsel noch andere Inseln'); ok(r.pushed && r.signs, 'Gesperrte Insel: Glaswand + Schild da, schiebt hinaus'); ok(r.reqs, 'Jede Welt: 3 klare Sticker-Aufgaben mit Namen');
ok(r.guideLock, '„Wohin?“: gesperrte Orte mit Schloss und Aufgaben, ohne Weg/Hinzaubern (' + r.guideRows + ' Zeilen)'); ok(r.log, 'Quest-Log: Hauptquest + „Welten freischalten“ mit Fortschrittsbalken');
ok(r.cityOpen && r.stillLocked && r.walkIn, 'Aufgaben geschafft → Stadtinsel öffnet sich, Rest bleibt zu'); ok(r.dest, 'Orte in gesperrten Welten werden erkannt');
ok(r.backFree && r.saved, 'Zurück zur freien Welt: alles offen, Modus gespeichert'); ok(r.again, 'Wieder Story: Fortschritt bleibt, Rest gesperrt');
/* nach Neuladen: Modus + Stand bleiben */
await p.waitForTimeout(500); await boot(true);
const sub0 = await p.evaluate(() => document.getElementById('storySub').textContent); await p.click('#bStartStory'); await p.waitForTimeout(1500);
const r2 = await p.evaluate(() => { const K = __bi.smode; return { on: K.on(), locked: K.dbg.list.filter(I => I.lock.on).length, city: !K.dbg.list.find(I => I.key === 'CITY').lock.on }; });
ok(/Weiter/.test(sub0) && r2.on && r2.locked === 14 && r2.city, 'Nach Neuladen: „Weiter“ im Story-Menü, Stand (Stadtinsel offen) bleibt gespeichert');
ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 3).join(' | '));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); process.exit(fails ? 1 : 0);
