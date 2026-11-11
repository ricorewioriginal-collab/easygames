// Nebenquest-Ketten: jede Kette jeder Welt von der Annahme bis zur Belohnung durchspielen (Fundstücke und Zwischengegner zu Fuß erreichbar)
//   node tools/test-zotik/nebenquests.cjs [von] [bis]      Welten 1–10
const { chromium, ARGS, open, flood, skip, opt, talk, intro } = require('./lib.cjs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b); const from = +process.argv[2] || 1, to = +process.argv[3] || 10, res = [];
  const ok = (name, pass, info) => { res.push(pass); console.log(`${pass ? 'ok  ' : 'FEHL'} ${name}${info ? ' · ' + info : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.fl.naut = 1; S.fl.bridge = 1; S.lvl = 30; }); await intro(p);
  for (let n = from; n <= to; n++) {
    await p.evaluate(n => { const Z = __zotik, S = Z.S(); for (let k = 2; k < n; k++) S.cd[k] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; if (n > 1) { if (Z.ch !== 1) Z.switchWorld(1); Z.switchWorld(n); } }, n); await p.waitForTimeout(400); await skip(p); await flood(p);
    const ids = await p.evaluate(n => __zotik.NQ.CHAINS[n].map(c => c.id), n);
    for (const id of ids) { let err = '', log = [];
      for (let it = 0; it < 14 && !err; it++) {
        const q = await p.evaluate(([n, id]) => { const Z = __zotik, c = Z.NQ.CHAINS[n].find(x => x.id === id), s = Z.NQ.st(c), st = Z.NQ.step(c); Z.S().hp = Z.maxHp(); return { s: s.s, d: s.d, giver: c.giver, t: st && st.t, to: st && st.to, item: st && st.item, k: st && st.k, need: st && st.need, what: st && st.what, obj: Z.NQ.obj(c, n) }; }, [n, id]);
        if (q.d) break; log.push(q.t || (q.s ? 'abgeben' : 'annehmen'));
        if (!q.s) { err = await talk(p, 'tw_' + q.giver) || await opt(p, 'annehmen'); }
        else if (!q.t) { const sh = await p.evaluate(() => __zotik.S().shards); err = await talk(p, 'tw_' + q.giver); await skip(p); if (!err && !(await p.evaluate(sh => __zotik.S().shards > sh, sh))) err = 'keine Belohnung'; }
        else if (q.t === 'find') { err = await talk(p, q.item); await skip(p); }
        else if (q.t === 'talk') { err = await talk(p, 'tw_' + q.to); await skip(p); }
        else if (q.t === 'give') { await p.evaluate(() => { const S = __zotik.S(); S.herbs = 9; S.potions = 9; S.mat = { fell: 9, staub: 9, kern: 9 }; }); err = await talk(p, 'tw_' + q.giver) || await opt(p, 'übergeben'); }
        else if (q.t === 'kill') { err = await p.evaluate(([n, id, need]) => { const Z = __zotik, c = Z.NQ.CHAINS[n].find(x => x.id === id), k = n === 1 ? (Z.NQ.step(c).k === 'a' ? 'rift' : 'wolf') : Z.NQ.step(c).k + n; for (const e of Z.E) if (e.k === k && e.dead && !e.nq) Z.resetEnemy(e);   /* im Spiel kommen besiegte Gegner nach einer Weile wieder */ const L = Z.E.filter(e => e.k === k && !e.dead && !e.nq); if (L.length < need) return `nur ${L.length} Gegner der Art ${k} in der Welt (gebraucht ${need})`; for (let i = 0; i < need; i++) Z.killE(L[i]); return ''; }, [n, id, q.need]); }
        else if (q.t === 'elite') { err = await p.evaluate(id => { const Z = __zotik, e = Z.E.find(e => e.nq === id && !e.dead); if (!e) return 'Zwischengegner steht nicht in der Welt'; if (!window.__near(e.x, e.z, 4)) return `Zwischengegner nicht erreichbar (${e.x.toFixed(0)},${e.z.toFixed(0)})`; if (e.max < 100) return 'Zwischengegner zu schwach'; Z.killE(e); return ''; }, id); }
        await p.waitForTimeout(150); await skip(p); }
      const fin = await p.evaluate(([n, id]) => { const Z = __zotik, c = Z.NQ.CHAINS[n].find(x => x.id === id); return { d: !!Z.NQ.st(c).d, name: c.n, log: !!Z.NQ.html().includes(c.n) }; }, [n, id]);
      ok(`Welt ${n}: ${fin.name}`, !err && fin.d && fin.log, err || log.join(' → ')); }
  }
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 400)); process.exit(1); });
