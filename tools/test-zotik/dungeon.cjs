// Vorhallen (Dungeon vor dem Weltenboss): je Welt alle Ebenen – Schlüssel (Rätsel, Sprungraum oder Jagd), Runentor, Treppe, Zwischengegner, Tor nach draußen
//   node tools/test-zotik/dungeon.cjs [von] [bis]      Welten 2–10
const { chromium, ARGS, open, flood, skip, opt, talk, intro } = require('./lib.cjs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b); const from = +process.argv[2] || 2, to = +process.argv[3] || 10, res = [], w = ms => p.waitForTimeout(ms);
  const ok = (name, pass, info) => { res.push(pass); console.log(`${pass ? 'ok  ' : 'FEHL'} ${name}${info ? ' · ' + info : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.fl.naut = 1; S.fl.bridge = 1; S.lvl = 30; }); await intro(p);
  for (let n = from; n <= to; n++) { let err = '', log = [];
    await p.evaluate(n => { const Z = __zotik, S = Z.S(); for (let k = 2; k < n; k++) S.cd[k] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; S.cd[n] = { st: 4, k: 99, m: 1, e1: 1, arr: 1, b: [0, 0, 0], ord: 0, bd: 0 }; if (Z.ch !== 1) Z.switchWorld(1); Z.switchWorld(n); }, n); await w(500); await skip(p); await flood(p);
    const gate = await p.evaluate(() => { const it = __zotik.INT.find(i => /^Vorhallen/.test(i.name || '')); return it ? it.name : ''; });
    if (!gate) { ok(`Welt ${n}: Vorhallen`, false, 'kein Eingang'); continue; }
    err = await talk(p, gate) || await opt(p, 'Betreten'); await w(1100); await skip(p); if (process.env.DBG) console.log('nach Betreten', err, await p.evaluate(() => JSON.stringify({ dun: !!__zotik.dun, wd: !!(__zotik.WLD && __zotik.WLD.dun), dlg: !document.getElementById('dlg').hidden, t: document.getElementById('dText').textContent.slice(0, 60), o: [...document.querySelectorAll('#dOpts button')].map(b => b.textContent).join('|') })));
    const F = await p.evaluate(n => __zotik.DUNF(n), n);
    for (let f = 1; f <= F && !err; f++) { await flood(p);
      const I = await p.evaluate(() => { const Z = __zotik, W = Z.WLD, D = Z.dun; if (!D || !W.dun) return null; return { f: D.f, last: !W.keyAt, pz: !!W.pz, plat: Z.PLAT.map(q => [q.x, q.z, q.top]), key: W.keyAt, en: Z.E.filter(e => !e.dead).length, txt: document.getElementById('qo').textContent.slice(0, 40) }; });
      if (!I || I.f !== f) { err = 'nicht auf Ebene ' + f; break; }
      if (I.last) { log.push('Halle'); err = await p.evaluate(() => { const Z = __zotik, e = Z.E.find(e => e.mini && !e.dead); if (!e) return 'kein Zwischengegner'; if (!window.__near(e.x, e.z, 4)) return 'Zwischengegner nicht erreichbar'; if (Z.INT.find(i => i.name === 'Tor nach draußen').vis()) return 'Tor schon offen'; Z.killE(e); return ''; }); await w(300); await skip(p);
        if (!err) { err = await talk(p, 'Tor nach draußen'); await w(1300); await skip(p); } break; }
      const mode = I.pz ? 'Rätsel' : I.plat.length ? 'Sprungraum' : 'Jagd'; log.push(mode);
      if (I.pz) await p.evaluate(() => __zotik.WLD.pz.solve());
      else if (mode === 'Jagd') await p.evaluate(() => { const Z = __zotik; for (const e of Z.E.filter(e => !e.dead)) Z.killE(e); });
      else { let bad = ''; for (let i = 0; i < I.plat.length; i++) { const a = i ? I.plat[i - 1] : null, q = I.plat[i], dh = q[2] - (a ? a[2] : 0), dd = a ? Math.hypot(q[0] - a[0], q[1] - a[1]) : 0; if (dh > 1.25 || dd > 4.7) bad = `Platte ${i + 1} zu weit/hoch (${dd.toFixed(1)} m, +${dh.toFixed(2)})`; } if (!(await p.evaluate(q => !!window.__near(q[0], q[1], 3), I.plat[0]))) bad = 'erste Platte nicht erreichbar'; err = bad; }
      await w(200);
      if (!err) { if (mode === 'Sprungraum') { await p.evaluate(k => { const Z = __zotik; Z.pl.x = k[0] - .9; Z.pl.z = k[1]; Z.pl.y = k[2]; Z.pl.air = false; }, I.key); await w(400); const pr = await p.evaluate(() => document.getElementById('prompt').textContent); if (!/Schlüssel/.test(pr)) err = 'Truhe oben nicht ansprechbar (' + pr + ')'; else await p.evaluate(() => __zotik.interact()); /* von unten darf sie nicht greifbar sein */ }
        else err = await talk(p, 'Schlüsseltruhe'); }
      await w(200); if (!err && !(await p.evaluate(() => __zotik.dun.key))) err = 'Schlüssel nicht erhalten';
      if (!err) { err = await talk(p, 'Runentor'); await w(300); if (!err && !(await p.evaluate(() => { const Z = __zotik, s = Z.WLD.spawn; return Math.hypot(Z.pl.x - s[0], Z.pl.z - s[1]) < 3; }))) err = 'Runentor führt nicht zum Start'; }
      if (!err) { err = await talk(p, 'Treppe'); await w(1100); await skip(p); } }
    const fin = await p.evaluate(n => { const Z = __zotik, S = Z.S(); return { dun: !!Z.dun, st: S.cd[n].st, w: Z.WLD && Z.WLD.n, inDun: !!(Z.WLD && Z.WLD.dun), free: !Z.pBlocked(Z.pl.x, Z.pl.z) }; }, n);
    ok(`Welt ${n}: Vorhallen (${F} Ebenen)`, !err && !fin.dun && !fin.inDun && fin.st === 5 && fin.w === n && fin.free, err || log.join(' → ') + ' → draußen, Schritt ' + fin.st); }
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 400)); process.exit(1); });
