// Sketchfab-Figuren (CC-BY): Magier-Gegner in vier Farben, Gäste/Märchenrollen aus models/sf. node tools/test-zotik/sketchfab.cjs [bild]
const { chromium, ARGS, open, intro } = require('./lib.cjs');
const BILD = process.argv[2] === 'bild', fs = require('fs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { render: BILD, ctx: { viewport: { width: 960, height: 540 } } }); const res = [];
  const ok = (n, c, i) => { res.push(c); console.log(`${c ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  const shot = async n => { if (!BILD) return; await p.evaluate(() => { __zotik.noRender = false; }); await p.waitForTimeout(1200); fs.mkdirSync('/tmp/zotik-test', { recursive: true }); await p.screenshot({ path: `/tmp/zotik-test/sf-${n}.jpg`, type: 'jpeg', quality: 88 }); await p.evaluate(() => { __zotik.noRender = true; }); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; for (let n = 2; n <= 10; n++) S.cd[n] = { fin: 1 }; }); await intro(p);
  await p.evaluate(() => { const Z = __zotik; Z.switchWorld(2); for (const e of Z.E) if (!e.dead) { e.dead = true; e.m.root.visible = false; }
    window.__L = []; [['smf', -3, -4.5], ['smi', -1, -4.5], ['smg', 1, -4.5], ['sms', 3, -4.5]].forEach(([k, dx, dz]) => { const e = Z.spawnEnemy(k, Z.pl.x + dx, Z.pl.z + dz); e.max = e.hp = 1e6; e.cd = 99; e.st = 'rec'; e.rt = 999; __L.push(e); }); });
  await p.waitForFunction(() => __L.every(e => e.m.kk.ready), null, { timeout: 90000 }).catch(() => { });
  ok('Magier geladen', await p.evaluate(() => __L.every(e => e.m.kk.ready && e.m.kk.sf)));
  await p.evaluate(() => { const Z = __zotik; Z.step(1 / 30, 10); }); await shot('magier');
  await p.evaluate(() => { const Z = __zotik, e = __L[0]; e.hp = 1; Z.hurtE ? Z.hurtE(e, 50, 0, 0) : (e.dead = true); Z.step(1 / 30, 12); });
  ok('Sterben', await p.evaluate(() => __L[0].dead && __L[0].m.kk.dead > 0));
  await p.evaluate(() => { const Z = __zotik; window.__N = ['kael', 'toren', 'mirael', 'eryn', 'aera', 'garrik', 'stella'].map((id, i) => { const c = Z.kkCast(id); c.root.position.set(Z.pl.x - 3.3 + i * 1.1, Z.pl.y || 0, Z.pl.z - 2.6); c.root.rotation.y = 0; Z.scene.add(c.root); return c; }); });
  await p.waitForFunction(() => __N.every(c => c.kk.ready), null, { timeout: 90000 }).catch(() => { });
  console.log(await p.evaluate(() => __N.map(c => c.kk.id + ':' + c.kk.model.scale.x.toFixed(3) + ':' + c.kk.model.position.y.toFixed(2)).join(' ')));
  ok('Gäste und Märchenrollen geladen', await p.evaluate(() => __N.every(c => c.kk.ready)), await p.evaluate(() => __N.map(c => c.kk.id).join(',')));
  await p.evaluate(() => __zotik.step(1 / 30, 10)); await shot('npcs');
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); process.exit(res.every(Boolean) ? 0 : 1);
})();
