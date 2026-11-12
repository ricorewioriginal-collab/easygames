// Begleiter, Gäste und Märchenfiguren als KayKit-Figuren mit Master-Sheet-Farben
//   node tools/test-zotik/begleiter-kk.cjs [bild]  – mit „bild“ Fotos nach /tmp/zotik-test/bk-*.jpg
const { chromium, ARGS, open, intro } = require('./lib.cjs');
const BILD = process.argv[2] === 'bild', fs = require('fs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { render: BILD, ctx: { viewport: { width: 1280, height: 600 } } }); const res = [];
  const ok = (n, c, i) => { res.push(c); console.log(`${c ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  const shot = async n => { if (!BILD) return; await p.evaluate(() => { __zotik.noRender = false; }); await p.waitForTimeout(400); const c = await p.context().newCDPSession(p); const s = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 80 }); fs.mkdirSync('/tmp/zotik-test', { recursive: true }); fs.writeFileSync('/tmp/zotik-test/bk-' + n + '.jpg', Buffer.from(s.data, 'base64')); await c.detach(); await p.evaluate(() => { __zotik.noRender = true; }); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; for (let n = 2; n <= 10; n++) S.cd[n] = { fin: 1 }; }); await intro(p);
  const IDS = ['mira', 'lyra', 'nia', 'rovan', 'prof', 'kael', 'mirael', 'toren', 'eryn', 'aera'];
  await p.evaluate(IDS => { const Z = __zotik; Z.switchWorld(2); for (const e of Z.E) if (!e.dead) { e.dead = true; e.m.root.visible = false; }
    const sc = Z.scene; window.__B = IDS.map((id, i) => { const P = Z.kkCast(id); const x = Z.pl.x + (i - 4.5) * 1.15, z = Z.pl.z + 5; P.root.position.set(x, Z.hgt ? Z.hgt(x, z) : Z.pl.y, z); P.root.rotation.y = Math.PI; sc.add(P.root); return P; });
    Z.pl.face = 0; Z.setCam(Math.PI, .12, 9.5); }, IDS);
  await p.waitForFunction(() => __B.every(P => P.kk.ready), null, { timeout: 90000 }).catch(() => { });
  ok('alle Begleiter als KayKit geladen', await p.evaluate(() => __B.every(P => P.kk.ready)), await p.evaluate(() => __B.map(P => P.kk.id + ':' + P.kk.ready).join(' ')));
  ok('eigene Farben je Begleiter', await p.evaluate(() => new Set(__B.map(P => { let u = ''; P.root.traverse(m => { if (m.isMesh && m.visible && !u && m.material.map) u = m.material.map.uuid; }); return u; })).size === __B.length));
  await p.evaluate(() => __zotik.step(1 / 30, 8)); await shot('begleiter');
  for (const [k, dx] of [['links', -2.9], ['rechts', 2.9]]) { await p.evaluate(dx => { const Z = __zotik; Z.pl.x += dx; Z.pl.z -= 1; Z.step(1 / 30, 2); Z.setCam(Math.PI, .05, 3.6); }, dx); await shot(k); await p.evaluate(dx => { const Z = __zotik; Z.pl.x -= dx; Z.pl.z += 1; }, dx); }
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); process.exit(res.every(Boolean) ? 0 : 1); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 400)); process.exit(1); });
