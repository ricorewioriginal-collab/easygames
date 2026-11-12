// Begehbare Burgen und Türme der Märchenwelten (KayKit, CC0): Gebäude steht in der Welt, Tor führt hinein, zwei Stockwerke,
// Burgherr oben, Rückkehr in die Märchenwelt mit Belohnung; dazu KayKit-Gebäude in einer Kapitelwelt.
//   node tools/test-zotik/burgen.cjs [bild]  – mit „bild“ Fotos nach /tmp/zotik-test/burg-*.jpg
const { chromium, ARGS, open, skip, opt, shot } = require('./lib.cjs');
const BILD = process.argv[2] === 'bild';
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { render: BILD, ctx: { viewport: { width: 960, height: 540 } } }); const res = [];
  const ok = (n, c, i) => { res.push(!!c); console.log(`${c ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  const pic = async n => { if (BILD) await shot(p, 'burg-' + n); };
  const hallPic = async n => { if (!BILD) return; await p.evaluate(() => { const Z = __zotik, [hx, hz] = Z.WLD.hall; for (const e of Z.E) if (!e.dead && !e.mini) e.m.root.visible = false; Z.pl.x = hx; Z.pl.z = hz - 2; Z.pl.face = 0; Z.setCam(Math.PI, .62, 6.5); }); await p.waitForTimeout(1500); await pic(n); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.lvl = 20; S.fl.naut = 1; Z.X.noFlight = 1; Z.X.noDetour = 1; }); await skip(p);
  await p.evaluate(() => __zotik.travel(21)); for (let k = 0; k < 24; k++) { await skip(p); await p.waitForTimeout(500); if (await p.evaluate(() => __zotik.ch === 21 && document.getElementById('dlg').hidden)) break; }
  const c = await p.evaluate(() => { const Z = __zotik, c = Z.WLD.castle; return c ? { x: c.x, z: c.z, gx: c.gx, gz: c.gz, int: !!Z.INT.find(q => q.name === 'Schloss der Königin') } : null; });
  ok('Schloss steht im Spiegelwald, Tor ansprechbar', c && c.int, JSON.stringify(c));
  if (BILD && c) { await p.evaluate(c => { const Z = __zotik; Z.pl.x = c.gx + (c.gx - c.x) * .9; Z.pl.z = c.gz + (c.gz - c.z) * .9; Z.pl.face = Math.atan2(c.x - Z.pl.x, c.z - Z.pl.z); Z.setCam(Z.pl.face + Math.PI, .32, 16); }, c); await pic('aussen'); }
  await p.evaluate(() => { const Z = __zotik, q = Z.INT.find(q => q.name === 'Schloss der Königin'); q.talk(); }); for (let k = 0; k < 8; k++) { await p.waitForTimeout(400); const o = await opt(p, 'Hineingehen'); if (o === '' || await p.evaluate(() => !!__zotik.dun)) break; await p.evaluate(() => document.getElementById('dlg').click()); }
  await p.waitForTimeout(1500); await skip(p);
  const d1 = await p.evaluate(() => { const Z = __zotik, D = Z.dun; return D ? { mw: D.mw && D.mw.name, f: D.f, e: Z.E.filter(e => !e.dead).length, name: document.getElementById('qt').textContent } : null; });
  ok('Hineingehen: erstes Stockwerk mit Wachen', d1 && d1.mw === 'Schloss der Königin' && d1.f === 1 && d1.e >= 4, JSON.stringify(d1));
  if (BILD) { await p.evaluate(() => { const Z = __zotik; Z.setCam(Z.pl.face + Math.PI, .3, 7); }); await p.waitForTimeout(1500); await pic('innen'); }
  await p.evaluate(() => { const Z = __zotik, D = Z.dun; D.key = true; const q = Z.INT.find(q => q.name === 'Treppe'); q.talk(); }); await p.waitForTimeout(1500);
  const d2 = await p.evaluate(() => { const Z = __zotik, D = Z.dun, bo = Z.E.find(e => e.mini && !e.dead); return { f: D && D.f, boss: bo && bo.d.name }; });
  ok('Treppe nach oben: Burgherr wartet', d2.f === 2 && d2.boss === 'Spiegelritter', JSON.stringify(d2));
  await hallPic('thron');
  await p.evaluate(() => { const Z = __zotik; for (const e of Z.E) if (!e.dead) Z.killE(e); }); await p.waitForTimeout(400);
  await p.evaluate(() => { const Z = __zotik, q = Z.INT.find(q => q.name === 'Tor nach draußen' && (!q.vis || q.vis())); if (q) q.talk(); }); await p.waitForTimeout(2200); await skip(p);
  const back = await p.evaluate(() => { const Z = __zotik; return { ch: Z.ch, mw: !!(Z.WLD && Z.WLD.mw), dun: !!Z.dun, fl: !!Z.S().fl.cs21, castle: !!(Z.WLD && Z.WLD.castle) }; });
  ok('Zurück im Spiegelwald, Schloss befreit', back.ch === 21 && back.mw && !back.dun && back.fl && back.castle, JSON.stringify(back));
  for (const n of [22, 23, 24, 25, 26, 27]) { await p.evaluate(n => { const Z = __zotik; Z.WLD.castle = null; Z.switchWorld(n); }, n); for (let k = 0; k < 24; k++) { await skip(p); await p.waitForTimeout(400); if (await p.evaluate(n => __zotik.ch === n && document.getElementById('dlg').hidden, n)) break; }
    const has = await p.evaluate(() => !!(__zotik.WLD && __zotik.WLD.castle)); ok('Welt ' + n + ': Burg oder Turm vorhanden', has);
    if (n === 24) { await p.waitForFunction(() => __zotik.ch === 24 && __zotik.WLD && __zotik.WLD.mw && __zotik.WLD.castle, null, { timeout: 30000 }).catch(() => { }); const nd = await p.evaluate(() => { const c = __zotik.WLD.castle; return c && Math.abs(c.gx) < .5 && c.gz > -71 && c.gz < -67; }); ok('Notre-Dame: Eingang ist das Hauptportal der Kathedrale', nd);
      if (BILD) { await p.evaluate(() => { const Z = __zotik; Z.pl.x = 4; Z.pl.z = -46; Z.pl.face = Math.atan2(10, -28); Z.setCam(Z.pl.face + Math.PI, .2, 14); }); await p.waitForTimeout(1500); await pic('notredame-aussen'); }
      await p.evaluate(() => __zotik.dunEnter ? __zotik.dunEnter(24, { k: 'dom', th: 'dom', name: 'Kathedrale Notre-Dame', boss: 'Steinerner Wasserspeier', col: 0xffd070 }) : __zotik.INT.find(q => q.name === 'Kathedrale Notre-Dame').talk()); await p.waitForTimeout(1800); await skip(p);
      const dd = await p.evaluate(() => !!__zotik.dun); ok('Notre-Dame: Kathedrale innen betretbar', dd); if (dd) { await hallPic('notredame-innen'); await p.evaluate(() => { const Z = __zotik; Z.dun.key = true; Z.INT.find(q => q.name === 'Treppe').talk(); }); await p.waitForTimeout(1800); await hallPic('notredame-glocken');
        await p.evaluate(() => { const Z = __zotik; for (const e of Z.E) if (!e.dead) Z.killE(e); }); await p.waitForTimeout(400); await p.evaluate(() => { const q = __zotik.INT.find(q => q.name === 'Tor nach draußen' && (!q.vis || q.vis())); if (q) q.talk(); }); await p.waitForTimeout(2200); await skip(p); } } }
  const nf = await p.evaluate(() => { const Z = __zotik, S = Z.S(); for (let n = 2; n <= 11; n++) S.cd[n] = Object.assign(S.cd[n] || {}, { fin: 1 }); Z.mount(); const L = [Z.naut.f]; for (let i = 0; i < 3; i++) { Z.cycleNaut(); L.push(Z.naut.f); } return L; });
  ok('Nautilux: nach allen Kapiteln alle vier Formen auch außerhalb der Kapitel', new Set(nf).size === 4, nf.join(' → '));
  await p.evaluate(() => __zotik.switchWorld(2)); await p.waitForTimeout(1200);
  if (BILD) { await p.evaluate(() => { const Z = __zotik; Z.pl.z = -60; Z.pl.x = Z.WLD.path(-60); Z.setCam(0, .45, 30); }); await pic('kapitelwelt'); }
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); process.exit(res.every(Boolean) ? 0 : 1); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 300)); process.exit(1); });
