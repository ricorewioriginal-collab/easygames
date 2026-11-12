// Camp als begehbare Vorwelt: neues Spiel startet am Lagerfeuer (Prolog, Traum), Pfad führt nach Lunaris und zurück,
// Gefährten sitzen ums Feuer und reden dort, Rasten am Feuer, Weltenstein öffnet die Weltreise, Camp steht in der Weltreise.
//   node tools/test-zotik/camp.cjs
const { chromium, ARGS, open, flood, skip, talk, intro, shot } = require('./lib.cjs');
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ args: ARGS }); const p = await open(b); const w = ms => p.waitForTimeout(ms);
  const dlgText = () => p.evaluate(() => document.getElementById('dlg').hidden ? '' : document.getElementById('dlg').textContent);
  const calm = async () => { for (let k = 0; k < 40 && await p.evaluate(() => !document.getElementById('dlg').hidden && document.getElementById('dOpts').hidden); k++) { await skip(p); await w(300); } };
  const where = () => p.evaluate(() => { const Z = __zotik; return { camp: !!(Z.WLD && Z.WLD.camp), ch: Z.S().ch, x: +Z.pl.x.toFixed(1), z: +Z.pl.z.toFixed(1), blk: Z.pBlocked(Z.pl.x, Z.pl.z) }; });
  await p.evaluate(() => { const Z = __zotik; Z.startNew(); const S = Z.S(); for (const a of Z.ARTS) S.fl['art_' + a.id] = 1; });
  let seen = ''; for (let k = 0; k < 12 && !/Generationen/.test(seen); k++) { await w(500); seen += await dlgText(); }
  let L = await where();
  ok(L.camp && L.ch === 13 && !L.blk, 'Neues Spiel startet im Camp ' + JSON.stringify(L));
  ok(/Generationen/.test(seen), 'Prolog läuft am Lagerfeuer');
  await intro(p); await calm();
  ok(await p.evaluate(() => /Camp/.test(document.getElementById('qt').textContent) && /Lunaris/.test(document.getElementById('qo').textContent)), 'Aufgabe: dem Pfad nach Lunaris folgen');
  await shot(p, 'camp-start');
  // Rasten am Feuer
  await p.evaluate(() => { __zotik.S().hp = 5; }); await flood(p); let r = await talk(p, 'Lagerfeuer'); await w(300); await calm();
  ok(!r && await p.evaluate(() => __zotik.S().hp === __zotik.maxHp()), 'Am Feuer rasten füllt das Leben ' + (r || ''));
  // Weltenstein → Weltreise mit Camp-Eintrag
  r = await talk(p, 'Weltenstein'); await w(300);
  ok(!r && await p.evaluate(() => !document.getElementById('menu').hidden && /Vorwelt: Camp/.test(document.getElementById('mcont').textContent)), 'Weltenstein öffnet die Weltreise (Camp ist eingetragen) ' + (r || ''));
  await p.evaluate(() => __zotik.toggleMenu(false));
  // Pfad nach Lunaris und zurück
  r = await talk(p, 'Pfad nach Lunaris'); await w(2500); await calm();
  L = await where(); ok(!r && !L.camp && L.ch === 1 && !L.blk, 'Pfad führt nach Lunaris ' + JSON.stringify(L) + (r || ''));
  await flood(p); r = await talk(p, 'Pfad zum Camp'); await w(2500); await calm();
  L = await where(); ok(!r && L.camp, 'Wegweiser in Lunaris führt zurück ins Camp ' + (r || ''));
  // Gefährten sitzen am Feuer und reden dort
  await p.evaluate(() => { const Z = __zotik, S = Z.S(); S.stage = 8; for (const id of ['lyra', 'nia', 'rovan']) Z.joinParty(id); Z.switchWorld(1); }); await w(800);
  await p.evaluate(() => __zotik.travel(13)); await w(2500); await calm(); await w(500);
  const seats = await p.evaluate(() => { const Z = __zotik, f = Z.WLD.fire; return Z.CMP.map(a => +Math.hypot(a.x - f[0], a.z - f[1]).toFixed(1)); });
  ok(seats.length === 3 && seats.every(d => d > 2.5 && d < 3.6), 'Gefährten sitzen ums Feuer ' + seats.join(', '));
  await flood(p); r = await talk(p, 'Nia'); await w(2400);
  ok(!r && await p.evaluate(() => (__zotik.LF().st().tk.nia || 0) === 1), 'Nia erzählt am Feuer (Gespräch „Der erste Pfeil“) ' + (r || ''));
  await calm();
  await p.evaluate(() => { const Z = __zotik; Z.pl.x = 0; Z.pl.z = -7; Z.pl.face = Math.PI; Z.setCam(0, .4, 9); }); await shot(p, 'camp-feuer');
  ok(!p.errs.length, 'keine Fehler auf der Seite ' + p.errs.slice(0, 3).join(' | '));
  await b.close(); console.log(fails ? fails + ' Fehler' : 'Alles gut.'); process.exit(fails ? 1 : 0);
})();
