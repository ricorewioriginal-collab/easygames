// Zaubereffekte: jeder Zauber und jede IP-Technik zeigt sichtbare Effekte (Runenkreis, Wirbel, Blitz, Sternenfall …) ohne Fehler.
//   node tools/test-zotik/zauberfx.cjs [bild]  – mit „bild“ ein Foto je Zauber nach /tmp/zotik-test/fx-*.jpg
const { chromium, ARGS, open, intro } = require('./lib.cjs');
const BILD = process.argv[2] === 'bild';
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { render: BILD, ctx: { viewport: { width: 640, height: 360 } } }); const res = [];
  const ok = (n, c, i) => { res.push(c); console.log(`${c ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; for (let n = 2; n <= 10; n++) S.cd[n] = { fin: 1 }; }); await intro(p);
  await p.evaluate(() => { const Z = __zotik; Z.switchWorld(2); });
  const casts = [['Funkenwirbel', 'skill1'], ['Lichtstoß', 'skill2'], ['Mondheilung', 'spellHeal'], ['Rankenfessel', 'artThorn'], ['Böe', 'artGust'], ['Frostfächer', 'artFrost'], ['Kettenblitz', 'artBolt'], ['Sternenfall', 'artStar'], ['IP Splitterstrahl', 'ip']];
  for (const [n, f] of casts) {
    await p.evaluate(() => { for (let i = 0; i < 120; i++) __zotik.MFX.update(1 / 30); });
    const r = await p.evaluate(f => { const Z = __zotik, S = Z.S(); for (const e of Z.E) if (!e.dead) { e.dead = true; e.m.root.visible = false; }
      for (const k in Z.pl.cd) Z.pl.cd[k] = 0; S.mp = 999; S.hp = Z.maxHp() - 50; Z.pl.face = 0; Z.setCam(Math.PI, .45, 9);
      const L = []; for (const [dx, dz] of [[0, 4], [2, 6], [-2, 7]]) { const e = Z.spawnEnemy('wolf', Z.pl.x + dx, Z.pl.z + dz); e.max = e.hp = 1e6; e.cd = 99; L.push(e); } window.__L = L;
      if (f === 'ip') { S.inv.w_schl = 1; S.gear.w = 'w_schl'; S.ip = 200; Z.ipUse(0); } else Z[f](); Z.step(1 / 30, 3); return Z.MFX.n; }, f);
    if (BILD) { await p.evaluate(() => { __zotik.noRender = false; }); await p.waitForTimeout(260); const c = await p.context().newCDPSession(p); const s = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 70 }); require('fs').mkdirSync('/tmp/zotik-test', { recursive: true }); require('fs').writeFileSync('/tmp/zotik-test/fx-' + f + '.jpg', Buffer.from(s.data, 'base64')); await c.detach(); }
    await p.evaluate(() => __zotik.step(1 / 30, 40)); await p.waitForTimeout(600); await p.evaluate(() => __zotik.step(1 / 30, 30));
    ok(n, r > 0, r + ' Effekte'); }
  ok("Effekte laufen aus", await p.evaluate(() => { for (let i = 0; i < 120; i++) __zotik.MFX.update(1 / 30); return __zotik.MFX.n === 0; }));
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); process.exit(res.every(Boolean) ? 0 : 1); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 400)); process.exit(1); });
