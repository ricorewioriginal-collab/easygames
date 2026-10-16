/* Story-Logik ohne Sackgassen: Stadtinsel-Aufgabe „Einkaufen“ geht schon auf der Hauptinsel (Spielzeugladen), keine Welt verlangt Mitspieler-Sticker,
   Fellretter-Einsätze führen im Story-Modus nur in offene Welten, Sammelalbum ohne doppelte Sticker, Aufgaben-Log schickt nicht in gesperrte Welten.
   Aufruf: node bunte-insel/tests/storylogik.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, locale: 'de-DE' }); const p = await ctx.newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 90000 });
await p.click('#bStartStory'); await p.waitForTimeout(1500);
const r = await p.evaluate(async () => {
  const b = __bi, K = b.smode, out = {}, sl = ms => new Promise(r => setTimeout(r, ms)), L = K.dbg.list;
  /* Album: jede Sticker-ID nur einmal */
  const ids = b.kids.all().map(q => q[0]); out.uniq = new Set(ids).size === ids.length;
  /* keine Welt verlangt Sticker, die man nur mit Freunden bekommt */
  const MP = ['party', 'friend', 'visit', 'gift']; out.solo = BI.STORY_ISLES.every(d => d.req.every(id => !MP.includes(id)));
  /* Spielzeugladen (Hauptinsel, offen) gibt „Einkäufer“ */
  b.save.stars = 999; const it = b.shopItems().find(q => !b.save.owned.includes(q.id)); b.buyItem(it); out.shopper = b.save.stk.includes('shopper');
  const C = L.find(I => I.key === 'CITY'); out.cityReq = C.req.includes('shopper') && !K.lockedAt(b.DEST.find(d => d.id === 'shop').at().x, b.DEST.find(d => d.id === 'shop').at().z);
  /* Inselreise Kapitel 5 zeigt den Weg zu einem offenen Laden */
  const ch5 = BI.STORY[4].tasks.find(t => t[1] === 'shopper'), d5 = b.DEST.find(d => d.id === ch5[4]); out.ch5 = !!d5 && !K.lockedAt(d5.at().x, d5.at().z);
  /* Aufgaben-Log: solange die Fellretter-Bucht zu ist, kein „🧭 → Fellretter-Bucht“-Tipp */
  b.save.einsatz = { done: [], cur: null }; document.getElementById('bLog').click(); await sl(300); const t1 = document.getElementById('questNow').textContent; document.getElementById('questClose').click();
  out.tipLocked = !/🧭 → Fellretter-Bucht/.test(t1) && /öffnet sich/.test(t1);
  /* Stadtinsel + Fellretter-Bucht freischalten → Einsatz an der Tafel führt nur in offene Welten */
  b.save.stk = [...new Set([...b.save.stk, ...C.req, ...L.find(I => I.key === 'PUPS').req])]; for (let i = 0; i < 30 && L.find(I => I.key === 'PUPS').lock.on; i++) await sl(250);
  out.pupsOpen = !L.find(I => I.key === 'PUPS').lock.on;
  const E = b.einsatz; let allOpen = true; for (let k = 0; k < 6; k++) { E.act({ k: 'ebrett' }); const st = E.state(), m = E.missions.find(q => q.id === st.cur.id); while (st.cur && st.cur.step < m.steps.length) { const tg = E.target(); if (K.lockedAt(tg.x, tg.z)) allOpen = false; E.act({ k: 'ehilfe' }); } E.act({ k: 'ebrett' }); }
  out.einsatzOpen = allOpen && E.state().done.length >= 4;
  /* alter Spielstand: angefangener Einsatz in gesperrter Welt wird an der Tafel getauscht */
  b.save.einsatz.cur = { id: E.missions[0].id, step: 0 }; E.act({ k: 'ebrett' }); const tg = E.target(); out.swap = !!tg && !K.lockedAt(tg.x, tg.z);
  /* Freie Welt: Einsatz-Reihenfolge wie bisher (erster offener Einsatz) */
  K.setMode('free', true); b.save.einsatz = { done: [], cur: null }; E.act({ k: 'ebrett' }); out.freeFirst = b.save.einsatz.cur && b.save.einsatz.cur.id === E.missions[0].id;
  return out;
});
console.log(JSON.stringify(r));
ok(r.uniq, 'Sammelalbum: jeder Sticker nur einmal (Alle-Sticker-Belohnung erreichbar)');
ok(r.solo, 'Story: keine Welt verlangt Sticker, die man nur mit Freunden bekommt');
ok(r.shopper && r.cityReq, 'Stadtinsel-Aufgabe „Einkäufer“ geht im offenen Spielzeugladen');
ok(r.ch5, 'Inselreise Kapitel 5: „👣 Weg“ führt zu einem offenen Laden');
ok(r.tipLocked, 'Aufgaben-Log: Fellretter-Tipp sagt, dass die Bucht noch zu ist');
ok(r.pupsOpen && r.einsatzOpen, 'Story: Fellretter-Einsätze führen nur in offene Welten');
ok(r.swap, 'Story: angefangener Einsatz in gesperrter Welt wird an der Tafel getauscht');
ok(r.freeFirst, 'Freie Welt: Einsätze wie gewohnt der Reihe nach');
ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 3).join(' | '));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); process.exit(fails ? 1 : 0);
