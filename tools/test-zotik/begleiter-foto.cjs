// Begleiter und Gäste (Master-Sheet-Look) nebeneinander: Fotos nach /tmp/zotik-test/bf-*.jpg
const { chromium, ARGS, open, intro } = require('./lib.cjs'); const fs = require('fs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { render: true, ctx: { viewport: { width: 1280, height: 600 } } });
  const shot = async n => { await p.evaluate(() => { __zotik.noRender = false; }); await p.waitForTimeout(500); const c = await p.context().newCDPSession(p); const s = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 82 }); fs.mkdirSync('/tmp/zotik-test', { recursive: true }); fs.writeFileSync('/tmp/zotik-test/bf-' + n + '.jpg', Buffer.from(s.data, 'base64')); await c.detach(); await p.evaluate(() => { __zotik.noRender = true; }); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; for (let n = 2; n <= 10; n++) S.cd[n] = { fin: 1 }; }); await intro(p);
  const SETS = { haupt: ['mira', 'lyra', 'nia', 'rovan', 'prof'], gaeste: ['kael', 'mirael', 'toren', 'eryn', 'aera'] };
  for (const k in SETS) { await p.evaluate(L => { const Z = __zotik; Z.switchWorld(2); for (const e of Z.E) if (!e.dead) { e.dead = true; e.m.root.visible = false; }
      for (const P of window.__B || []) P.root.parent && P.root.parent.remove(P.root);
      window.__B = L.map((id, i) => { const P = Z.kkCast(id); const x = Z.pl.x + (i - 2) * 1.05, z = Z.pl.z + 4.6; P.root.position.set(x, Z.hgt ? Z.hgt(x, z) : Z.pl.y, z); P.root.rotation.y = Math.PI; Z.scene.add(P.root); return P; }); Z.pl.face = 0; Z.setCam(Math.PI, .2, 3.9); }, SETS[k]);
    await p.waitForFunction(() => __B.every(P => P.kk.ready), null, { timeout: 90000 }).catch(() => { });
    await p.evaluate(() => __zotik.step(1 / 30, 15)); await shot(k); console.log('ok', k); }
  console.log(p.errs.join(' | ') || 'keine Fehler'); await b.close(); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 300)); process.exit(1); });
