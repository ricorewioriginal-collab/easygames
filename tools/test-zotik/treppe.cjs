// Sprungpfad-Platten sind auch zu Fuß wie eine Treppe begehbar (nur Laufen, kein Springen), z. B. am Tulpenbaum in Sleepy Hollow
//   node tools/test-zotik/treppe.cjs [Welt …]   (Standard 36; Welten mit beweglicher Platte brauchen dort einen Sprung)
const { chromium, ARGS, open, skip, intro } = require('./lib.cjs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b), w = ms => p.waitForTimeout(ms), res = [];
  const ok = (n, pass, i) => { res.push(pass); console.log(`${pass ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  await p.evaluate(() => { const Z = __zotik, S = Z.S(); Z.startDbg(); S.stage = 8; S.fl.naut = 1; S.lvl = 30; }); await intro(p);
  const W = process.argv.slice(2).map(Number); for (const n of W.length ? W : [36]) {
    await p.evaluate(n => { const Z = __zotik, S = Z.S(); for (let k = 2; k < n; k++) S.cd[k] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; if (Z.ch !== 1) Z.switchWorld(1); Z.switchWorld(n); for (const e of Z.E) { e.dead = true; e.m.root.visible = false; } }, n); await w(500); await skip(p);
    const J = await p.evaluate(() => { const Z = __zotik, N = Z.PLAT.length, j = Z.jp; const g = j && j.goal; if (!g) { const k = Z.PLAT.filter(q => q.hx < 3); return null; } return { g, n: N }; }).catch(() => null);
    const info = await p.evaluate(() => { const Z = __zotik, P = Z.PLAT.filter(q => q.hx < 2.3 && q.hx > 1.2); return P.slice(-5).map(q => [q.x, q.z, q.top]); });
    /* letzte Sprungpfad-Reihe: erste Platte ist die tiefste der letzten 5 Platten, Ziel die letzte */
    const row = await p.evaluate(() => { const Z = __zotik, L = Z.PLAT.length; return Z.PLAT.slice(L - 5).map(q => [q.x, q.z, q.top]); });
    const st = row[0], en = row[4], d = Math.atan2(st[0] - (row[1][0] - st[0]), 0); const dx = row[1][0] - st[0], dz = row[1][1] - st[1], l = Math.hypot(dx, dz);
    await p.evaluate(([x, z, dx, dz, l]) => { const Z = __zotik; Z.pl.x = x - dx / l * 3; Z.pl.z = z - dz / l * 3; Z.pl.y = Z.hgt(Z.pl.x, Z.pl.z); Z.pl.air = false; Z.setCam(Math.atan2(dx, dz) + Math.PI); }, [st[0], st[1], dx, dz, l]); await w(300);
    await p.keyboard.down('KeyW'); let top = -9, air = 0;
    for (let i = 0; i < 70; i++) { await w(80); const s = await p.evaluate(() => [__zotik.pl.y, __zotik.pl.air, __zotik.pl.x, __zotik.pl.z]); top = Math.max(top, s[0]); if (s[1]) air++; /* auf Gerade halten */ await p.evaluate(([a, c, dx, dz]) => { const Z = __zotik; Z.setCam(Math.atan2(dx, dz) + Math.PI); }, [0, 0, dx, dz]); }
    await p.keyboard.up('KeyW'); await w(200);
    ok(`Welt ${n}: Treppe zu Fuß hinaufgelaufen`, top >= row[3][2] - .2, `höchste Platte erreicht ${top.toFixed(2)} von ${row[4][2].toFixed(2)} m, Stufe 4 = ${row[3][2].toFixed(2)}`); }
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 400)); process.exit(1); });
