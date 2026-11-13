// Weltkarte: Wege zu jeder Welt (auch zu den Märchen-Inseln), Kurs setzen mit der Nautilux (gesperrte Welten ausgegraut),
// Symbolgegner je Region an den Wegen und Flossen auf dem Meer – beide starten den Rundenkampf (zu Fuß und auf See).
//   node tools/test-zotik/seekampf.cjs [bild]  – mit „bild“ Fotos nach /tmp/zotik-test/see-*.jpg
const { chromium, ARGS, open, intro, shot, skip, opt } = require('./lib.cjs');
const BILD = process.argv[2] === 'bild';
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { render: BILD, ctx: { viewport: { width: 960, height: 540 } } }); const res = [], w = ms => p.waitForTimeout(ms);
  const ok = (n, c, i) => { res.push(!!c); console.log(`${c ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.lvl = 14; S.fl.naut = 1; for (let n = 2; n <= 7; n++) S.cd[n] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; }); await intro(p);
  await p.evaluate(() => __zotik.switchWorld(15)); await w(1200); await skip(p);
  /* zu Fuß: Landzunge zu jeder Märchen-Insel */
  const isl = await p.evaluate(() => { const W = __zotik.W, out = []; for (const k of [21, 22, 23, 24, 25, 26, 27, 28]) { const pt = W.marks.find(q => q.n === k); if (pt) out.push([k, W.h(pt.x, pt.z) > -.3, W.blocked(pt.x + 16, pt.z) && W.blocked(pt.x - 16, pt.z) && W.blocked(pt.x, pt.z + 16) && W.blocked(pt.x, pt.z - 16)]); } return out; });
  ok('Märchen-Inseln liegen an Land (zu Fuß erreichbar)', isl.length >= 3 && isl.every(q => q[1] && !q[2]), JSON.stringify(isl));
  const rm = await p.evaluate(() => { const R = __zotik.W.roam || []; return { n: R.length, kinds: [...new Set(R.map(r => r.def.n))].length }; });
  ok('Symbolgegner an den Wegen, verschiedene Arten', rm.n >= 8 && rm.kinds >= 5, JSON.stringify(rm));
  const f = await p.evaluate(() => { const W = __zotik.W; return W.fins ? W.fins.length : -1; });
  ok('Flossen auf dem Meer', f >= 5, f + ' Flossen');
  /* Rundenkampf zu Fuß */
  await p.evaluate(() => { const Z = __zotik, r = Z.W.roam[0]; Z.pl.x = r.x + .8; Z.pl.z = r.z + .8; Z.pl.y = Z.W.h(Z.pl.x, Z.pl.z); Z.step(1 / 30, 3); });
  ok('Symbolgegner berührt: Kampf zu Fuß beginnt', await p.evaluate(() => !!__zotik.X.sea && !!document.querySelector('#rbh:not([hidden]) .rb-c')));
  const fight = async (tag) => { await w(2600); if (BILD) await shot(p, 'see-' + tag); const xp0 = await p.evaluate(() => __zotik.S().xp + __zotik.S().lvl * 1e6); let menu = '';
    for (let k = 0; k < 200; k++) { if (!(await p.evaluate(() => !!__zotik.X.sea))) break; if (!menu) { const m0 = await p.evaluate(() => [...document.querySelectorAll('#dOpts button')].map(q => q.textContent).join(' | ')); if (m0.includes('Abwehr')) menu = m0; } const o = await opt(p, 'Angriff'); if (o !== '') { if (o.includes('Zurück')) await opt(p, '/'); else if (o === 'keine Auswahl') await p.evaluate(() => document.getElementById('dlg').click()); } if (BILD && k === 3) await shot(p, 'see-' + tag + '-hieb'); await w(600); }
    const fin = await p.evaluate(() => ({ sea: !!__zotik.X.sea, xp: __zotik.S().xp + __zotik.S().lvl * 1e6 })); return { ok: !fin.sea && fin.xp > xp0, menu }; };
  const r1 = await fight('land'); ok('Kampf zu Fuß gewonnen', r1.ok, r1.menu.slice(0, 120)); ok('Befehle: Magie und Auto', r1.menu.includes('Magie') && r1.menu.includes('Auto'));
  /* Steg: Nautilux rufen, Kurs setzen (gesperrte Welten ausgegraut) */
  await skip(p); const d = await p.evaluate(() => { const Z = __zotik, W = Z.W; const st = W.docks[0]; Z.pl.x = st.lx; Z.pl.z = st.lz; Z.step(1 / 30, 3); const pr = document.getElementById('prompt').textContent; Z.interact(); return { naut: !document.getElementById('dlg').hidden, docks: W.docks.length, pr, dlg: document.getElementById('dText').textContent + '|' + document.getElementById('dName').textContent }; });
  ok('Stege an vielen Welten, Steg bietet Kurs und freie Fahrt', d.naut && d.docks >= 8, JSON.stringify(d));
  await w(900); ok('Kurs setzen öffnet die Weltenkarte', (await opt(p, 'Kurs setzen')) === '' && await p.evaluate(() => !document.getElementById('menu').hidden && document.querySelectorAll('.wn.lock').length > 0 && /Kurs setzen/.test(document.getElementById('menu').textContent)));
  await p.evaluate(() => __zotik.toggleMenu ? __zotik.toggleMenu(false) : document.getElementById('menu').hidden = true); await w(200);
  /* Seekampf */
  await p.evaluate(() => { const Z = __zotik, st = Z.W.docks[0]; Z.pl.x = st.lx; Z.pl.z = st.lz; Z.step(1 / 30, 3); Z.interact(); }); await w(900); await opt(p, 'Frei'); await w(300); await p.evaluate(() => __zotik.step(1 / 30, 3));
  await p.evaluate(() => { const Z = __zotik, fn = Z.W.fins[0]; fn.x = Z.pl.x + .5; fn.z = Z.pl.z + .5; Z.step(1 / 30, 2); });
  await w(4000); await p.evaluate(() => { const Z = __zotik, fn = Z.W.fins[0]; fn.x = Z.pl.x + .5; fn.z = Z.pl.z + .5; Z.step(1 / 30, 2); });
  ok('Flosse berührt: Seekampf beginnt', await p.evaluate(() => !!__zotik.X.sea));
  const r2 = await fight('meer'); ok('Seekampf gewonnen', r2.ok);
  ok('Flosse nach dem Sieg fort', await p.evaluate(() => __zotik.W.fins[0].gone === 1));
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); process.exit(res.every(Boolean) ? 0 : 1); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 300)); process.exit(1); });
