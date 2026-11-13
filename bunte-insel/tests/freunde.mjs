/* Freundschaft mit Bewohnern: Herzen durch tägliches Reden, Blumen und Geschenke, Belohnung je Herz, Sticker, Aufgaben-Log, alter Spielstand ohne save.friends.
   Aufruf: LANG=de_DE.UTF-8 node bunte-insel/tests/freunde.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage(); const errs = []; let fails = 0;
p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errs.push(m.text()); });
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 90000 }); await p.click('#bStart'); await p.waitForTimeout(800);
const r = await p.evaluate(async () => {
  const b = __bi, f = b.freunde, s = b.save, out = {}, sl = ms => new Promise(r => setTimeout(r, ms));
  delete s.friends; out.oldSave = f.hearts('Mina Sonnenschein') === 0 && f.log().rows.length === 3;
  const n = b.npcs.find(q => !q.guest && q.p && q.p.name), nm = n.p.name; s.stars = 50;
  b.talkNpc(n); out.talk1 = (s.friends[nm] || {}).p === 1; b.talkNpc(n); out.once = s.friends[nm].p === 1;
  out.giftBtn = !!n.giftOk && b.placeLabel ? true : !!n.giftOk;
  const st0 = s.stars; f.gift(nm); out.gift = s.friends[nm].p === 3 && s.stars === st0 - 3 + 2; /* 3 Punkte → 1 Herz (+2 ⭐) */
  out.gift2 = f.gift(nm) === false;
  f.bouquet(nm); f.bouquet(nm); out.h3 = f.hearts(nm) >= 4 && s.stk.includes('freund3');
  s.friends[nm].d = 'gestern'; s.friends[nm].p = 9; b.talkNpc(n); out.best = f.hearts(nm) === 5 && s.stk.includes('freund5');
  out.dlgName = /❤️❤️❤️❤️❤️/.test((document.getElementById('rpgDlg') || {}).textContent || '');
  out.log = f.log().rows.some(q => q.text.startsWith(nm)) && b.worldLogs ? true : f.log().rows.some(q => q.text.startsWith(nm));
  return out;
});
for (const [k, v] of Object.entries(r)) ok(v, k);
ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 3).join(' | ')); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); await browser.close(); process.exit(fails ? 1 : 0);
