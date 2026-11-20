// Sketchfab-Monster (CC-BY): Modelle laden mit eigenen Bewegungen, Kapitelwelt-Gegner nutzen sie. node tools/test-zotik/sketchfab-monster.cjs [bild]
const { chromium, ARGS, open, intro } = require('./lib.cjs');
const BILD = process.argv[2] === 'bild', fs = require('fs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { q: process.env.M2 ? '#m2' : '', render: BILD, ctx: { viewport: { width: 960, height: 540 } } }); const res = [];
  const ok = (n, c, i) => { res.push(c); console.log(`${c ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  const shot = async n => { if (!BILD) return; await p.evaluate(() => { __zotik.noRender = false; }); await p.waitForTimeout(1200); fs.mkdirSync('/tmp/zotik-test', { recursive: true }); await p.screenshot({ path: `/tmp/zotik-test/sfm${process.env.M2 ? '2' : ''}-${n}.jpg`, type: 'jpeg', quality: 88 }); await p.evaluate(() => { __zotik.noRender = true; }); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; for (let n = 2; n <= 10; n++) S.cd[n] = { fin: 1 }; }); await intro(p);
  await p.evaluate(() => { const Z = __zotik; Z.switchWorld(2); for (const e of Z.E) if (!e.dead) { e.dead = true; e.m.root.visible = false; }
    window.__K = (location.hash.includes('m2') ? ['fledermaus', 'geist', 'geist@6', 'eisgolem', 'steinfratze', 'affe', 'schleim'] : ['pilz', 'thornwolf', 'tiger', 'riese', 'ratte', 'spinne', 'skorpion', 'hai', 'qualle']);
    window.__N = __K.map((k, i) => { const [k0, n0] = k.split('@'), c = Z.sfMon(k0, n0); const r = i < 5 ? 0 : 1, j = r ? i - 5 : i; c.root.position.set(Z.pl.x - (r ? 3.6 : 5.4) + j * (r ? 2.4 : 2.7), Z.pl.y || 0, Z.pl.z - 4 - r * 4); Z.scene.add(c.root); return c; }); });
  await p.waitForFunction(() => __N.every(c => c.kk.ready), null, { timeout: 120000 }).catch(() => { });
  ok('Monster geladen', await p.evaluate(() => __N.every(c => c.kk.ready)), await p.evaluate(() => __N.map((c, i) => __K[i] + ':' + c.kk.ready + (c.kk.mixer ? '+anim' : '')).join(' ')));
  ok('Größe sinnvoll', await p.evaluate(() => __N.every(c => { const s = c.kk.model.scale.x; return isFinite(s) && s > 0; })));
  await p.evaluate(() => { for (const c of __N) c.kk.spd = 1; __zotik.step(1 / 30, 20); }); await shot('alle');
  const e = process.env.M2 ? true : await p.evaluate(() => { const Z = __zotik, e = Z.spawnEnemy('b2', Z.pl.x, Z.pl.z - 3); return !!(e && e.m && e.m.kk && e.m.kk.sf); });
  ok('Welt-2-Gegner ist der neue Wolf', e);
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); process.exit(res.every(Boolean) ? 0 : 1);
})();
