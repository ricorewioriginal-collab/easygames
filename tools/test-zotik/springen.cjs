// Springen und Sprungpfade: in jeder Welt mit echten Tasten (W + Leertaste) von Platte zu Platte bis zur Truhe
//   node tools/test-zotik/springen.cjs [von] [bis]      Welten 1–10
const { chromium, ARGS, open, flood, skip, intro } = require('./lib.cjs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b); const from = +process.argv[2] || 1, to = +process.argv[3] || 10, res = [], w = ms => p.waitForTimeout(ms);
  const ok = (name, pass, info) => { res.push(pass); console.log(`${pass ? 'ok  ' : 'FEHL'} ${name}${info ? ' · ' + info : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.fl.naut = 1; S.fl.bridge = 1; S.lvl = 30; }); await intro(p);
  /* Grundsprung: Höhe und Landung */
  { const y0 = await p.evaluate(() => { __zotik.pl.x = 0; __zotik.pl.z = 14; return 0; }); await w(300); const a = await p.evaluate(() => __zotik.pl.y); await p.keyboard.press('Space'); let top = a; for (let i = 0; i < 40; i++) { await w(30); top = Math.max(top, await p.evaluate(() => __zotik.pl.y)); } const e = await p.evaluate(() => [__zotik.pl.y, __zotik.pl.air]);
    ok('Sprung: hoch und wieder gelandet', top - a > 1.5 && top - a < 2.4 && Math.abs(e[0] - a) < .1 && !e[1], `Höhe ${(top - a).toFixed(2)} m`); }
  for (let n = from; n <= to; n++) {
    await p.evaluate(n => { const Z = __zotik, S = Z.S(); for (let k = 2; k < n; k++) S.cd[k] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; if (n > 1) { if (Z.ch !== 1) Z.switchWorld(1); Z.switchWorld(n); } for (const e of Z.E) { e.dead = true; e.m.root.visible = false; } }, n); await w(400); await skip(p); await flood(p);
    const J = await p.evaluate(() => { const Z = __zotik, j = Z.jp; if (!j) return null; const P = Z.PLAT.slice(-5).map(q => [q.x, q.z, q.top]); return { q: j.q, P, start: !!window.__near(j.q[0], j.q[1], 2), n: Z.PLAT.length }; });
    if (!J) { ok(`Welt ${n}: Sprungpfad vorhanden`, false, 'kein Platz gefunden'); continue; }
    if (!J.start) { ok(`Welt ${n}: Sprungpfad`, false, 'Start nicht zu Fuß erreichbar'); continue; }
    await p.evaluate(q => { const Z = __zotik; Z.pl.x = q[0]; Z.pl.z = q[1]; }, J.q); await w(250);
    let at = -1, tries = 0;
    for (let i = 0; i < 5 && tries < 14; ) { tries++;
      /* Kamera so drehen, dass „vorwärts“ zur nächsten Platte zeigt; bei der beweglichen Platte auf den Moment warten, in dem sie in der Flucht liegt */
      const st = await p.evaluate(i => { const Z = __zotik, q = Z.PLAT[Z.PLAT.length - 5 + i], dx = q.x - Z.pl.x, dz = q.z - Z.pl.z; Z.setCam(Math.atan2(dx, dz) + Math.PI); return { d: Math.hypot(dx, dz), y: Z.pl.y, top: q.top }; }, i);
      await p.keyboard.down('KeyW'); await w(st.d > 4.6 ? 120 : 30); await p.keyboard.press('Space');
      for (let k = 0; k < 30; k++) { await w(60); await p.evaluate(i => { const Z = __zotik, q = Z.PLAT[Z.PLAT.length - 5 + i]; Z.setCam(Math.atan2(q.x - Z.pl.x, q.z - Z.pl.z) + Math.PI); }, i); const s2 = await p.evaluate(i => { const Z = __zotik, q = Z.PLAT[Z.PLAT.length - 5 + i]; return !Z.pl.air && Math.abs(Z.pl.y - q.top) < .1 && Math.hypot(q.x - Z.pl.x, q.z - Z.pl.z) < q.hx; }, i); if (s2) break; if (!(await p.evaluate(() => __zotik.pl.air)) && k > 4) break; }
      await p.keyboard.up('KeyW'); await w(120);
      const on = await p.evaluate(() => { const Z = __zotik, N = Z.PLAT.length; for (let k = 4; k >= 0; k--) { const q = Z.PLAT[N - 5 + k]; if (Math.abs(Z.pl.y - q.top) < .15 && Math.abs(q.x - Z.pl.x) < q.hx && Math.abs(q.z - Z.pl.z) < q.hz) return k; } return -1; });
      if (on >= i) { at = on; i = on + 1; /* zur Plattenmitte gehen, damit der nächste Absprung sauber ist */ await p.evaluate(k => { const Z = __zotik, q = Z.PLAT[Z.PLAT.length - 5 + k]; Z.pl.x = q.x; Z.pl.z = q.z; }, on); await w(120); }
      else if (on < 0) { /* heruntergefallen: zurück auf die letzte erreichte Platte bzw. an den Start */ await p.evaluate(([k, q]) => { const Z = __zotik; if (k < 0) { Z.pl.x = q[0]; Z.pl.z = q[1]; } else { const c = Z.PLAT[Z.PLAT.length - 5 + k]; Z.pl.x = c.x; Z.pl.z = c.z; Z.pl.y = c.top; } }, [at, J.q]); await w(300); } }
    const sh = await p.evaluate(() => __zotik.S().shards); let got = false;
    if (at === 4) { await p.evaluate(() => { const Z = __zotik, c = Z.chests.find(c => c.py !== undefined); Z.pl.x = c.x - .9; Z.pl.z = c.z; }); await w(350); await p.keyboard.press('KeyE'); await w(300); got = await p.evaluate(sh => __zotik.S().shards > sh, sh); }
    /* von unten darf die Truhe nicht erreichbar sein */
    const below = await p.evaluate(() => { const Z = __zotik, c = Z.chests.find(c => c.py !== undefined); return Z.hgt(c.x, c.z) < c.py - 3; });
    ok(`Welt ${n}: Sprungpfad bis zur Truhe`, at === 4 && got && below, `Platte ${at + 1}/5 nach ${tries} Sprüngen${got ? ', Truhe geöffnet' : ''}`); }
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 400)); process.exit(1); });
