/* Roter Faden im Story-Modus: Das Ziel oben zeigt keine Aufgabe in einer noch gesperrten Welt, solange andere offen sind (Kapitel „Spaß-Tag“:
   erst Kino/Freibad, dann Freizeitpark), und nach der Inselreise zeigt es die nächste Welt zum Freischalten. Aufruf: node bunte-insel/tests/storyfaden.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'de-DE' })).newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 90000 }); await p.click('#bStart'); await p.waitForTimeout(800);
const r = await p.evaluate(async () => {
  const b = __bi, sl = ms => new Promise(r => setTimeout(r, ms)), out = {}, chip = () => ({ t: document.getElementById('qcTitle').textContent, x: document.getElementById('qcText').textContent, hid: document.getElementById('questChip').hidden });
  b.smode.setMode('story', true); const s = b.save; s.stk = s.stk || [];
  /* Kapitel 8 (Spaß-Tag), Freizeitpark noch zu: erstes Ziel ist nicht der Park */
  s.story.c = 7; s.stk = s.stk.filter(k => !['park', 'cinema', 'swim', 'shoot'].includes(k)); b.smode.apply(); await sl(1200); out.ch8 = chip();
  /* Inselreise fertig: oben steht die nächste Welt */
  b.story.finish(); await sl(1200); out.fin = chip();
  b.smode.setMode('free', true); await sl(1200); out.free = chip();
  return out;
});
console.log(JSON.stringify(r));
ok(/Spaß-Tag/.test(r.ch8.t) && !/Freizeitpark/.test(r.ch8.x), 'Kapitel Spaß-Tag zeigt zuerst ein erreichbares Ziel: ' + r.ch8.x);
ok(!r.fin.hid && /🔓/.test(r.fin.t) && /freischalten/.test(r.fin.t), 'nach der Inselreise: nächste Welt oben (' + r.fin.t + ' – ' + r.fin.x + ')');
ok(!/🔓/.test(r.free.t) || r.free.hid, 'Freie Welt: kein Freischalt-Ziel');
ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 3).join(' | '));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); process.exit(fails ? 1 : 0);
