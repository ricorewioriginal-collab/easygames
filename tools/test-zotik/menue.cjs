// Menü wie an der Konsole: Reiter links mit ↑↓, → bzw. A in den Inhalt, A bestätigt/rüstet aus, ← am Rand bzw. B zurück
// zu den Reitern, B auf den Reitern schließt, LB/RB wechseln den Reiter. Echter Controller (gamepad.js), kein Klick.
//   node tools/test-zotik/menue.cjs [bild]
const { chromium, ARGS, open, intro, shot } = require('./lib.cjs');
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ args: ARGS });
  const p = await open(b, { ctx: { viewport: { width: 960, height: 540 } } });
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.inv = Object.assign(S.inv || {}, { a_rinde: 1, w_dorn: 1 }); });
  await intro(p);
  const tap = async (i, ms = 260) => { await p.evaluate(i => { __press(i, true); }, i); await p.waitForTimeout(140); await p.evaluate(i => { __press(i, false); }, i); await p.waitForTimeout(ms); };
  const st = () => p.evaluate(() => { const f = document.querySelector('#menu .pfoc'), on = document.querySelector('#tabs .on'), m = document.getElementById('menu');
    return { open: !m.hidden, tab: on ? on.textContent.trim() : '', foc: f ? f.textContent.trim().slice(0, 30) : '', zone: f ? (f.closest('#tabs') ? 'tabs' : 'content') : '', eq: JSON.stringify(__zotik.S().gear || {}) }; });
  await p.evaluate(() => { window.__padOn = true; }); await p.waitForTimeout(1200);   // gamepad.js sucht jede Sekunde nach Pads (Testpad sendet kein gamepadconnected)
  await tap(0); await tap(0);   // Controller wecken (erster Druck schaltet nur den Controller-Modus ein)
  await p.evaluate(() => __zotik.toggleMenu(true)); await p.waitForTimeout(300);
  let s = await st();
  ok(s.open && s.zone === 'tabs' && /Aufgaben/.test(s.foc), 'Menü öffnet mit Auswahl auf dem Reiter „Aufgaben“: ' + JSON.stringify(s));
  await tap(13); s = await st();
  ok(s.zone === 'tabs' && s.tab === s.foc && !/Aufgaben/.test(s.tab), '↓ wählt den nächsten Reiter, Inhalt wechselt sofort: ' + s.tab);
  for (let k = 0; k < 6 && !/Ausrüstung/.test((await st()).tab); k++) await tap(13);
  s = await st(); ok(/Ausrüstung/.test(s.tab), 'Reiter „Ausrüstung“ erreicht');
  await tap(15); s = await st();
  ok(s.zone === 'content', '→ springt in den Inhalt: ' + s.foc);
  for (let k = 0; k < 8 && !/Dornenschwert/.test((await st()).foc); k++) await tap(13);
  s = await st(); const before = s.eq;
  ok(/Dornenschwert/.test(s.foc), '↓ wählt das Dornenschwert in der Liste: ' + s.foc);
  await tap(0, 400); await tap(0, 400); s = await st();   // A wählt (Vergleich rechts), zweites A rüstet aus
  ok(s.eq !== before && s.zone === 'content', 'A, A rüstet aus, Auswahl bleibt im Inhalt: ' + s.eq);
  if (process.argv[2]) await shot(p, process.argv[2]);
  await tap(14); for (let k = 0; k < 3 && (await st()).zone !== 'tabs'; k++) await tap(14);
  s = await st(); ok(s.zone === 'tabs' && /Ausrüstung/.test(s.foc), '← am linken Rand führt zurück zu den Reitern');
  await tap(15); await tap(1); s = await st();
  ok(s.zone === 'tabs', 'B im Inhalt: zurück zu den Reitern');
  await tap(5); s = await st(); ok(s.zone === 'tabs' && !/Ausrüstung/.test(s.tab), 'RB: nächster Reiter (' + s.tab + ')');
  await tap(4); s = await st(); ok(/Ausrüstung/.test(s.tab), 'LB: Reiter zurück');
  await tap(1); s = await st(); ok(!s.open, 'B auf den Reitern schließt das Menü');
  ok(!p.errs.length, 'keine Fehler ' + p.errs.join(' | '));
  await b.close(); console.log(fails ? fails + ' Fehler' : 'alles ok'); process.exit(fails ? 1 : 0);
})();
