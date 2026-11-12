// Ruinen wie klassische Dungeons: Hinterhalt in den ersten beiden Räumen, Ruinenwächter nach dem Rätsel, erst dann geht das Tor auf
const { chromium, ARGS, open, intro } = require('./lib.cjs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b); const res = [], w = ms => p.waitForTimeout(ms);
  const ok = (name, pass, info) => { res.push(pass); console.log(`${pass ? 'ok  ' : 'FEHL'} ${name}${info ? ' · ' + info : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); Z.S().stage = 8; }); await intro(p);
  for (const n of [1, 3, 8]) {
    await p.evaluate(n => { const Z = __zotik, S = Z.S(); for (let k = 2; k < n; k++) S.cd[k] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; Z.pl.z = 0; Z.pl.x = 0; if (n > 1) { if (Z.ch !== 1) Z.switchWorld(1); Z.switchWorld(n); } for (const e of Z.E) e.dead = true; Z.S().hp = 1e5; }, n); await w(500);
    const r = await p.evaluate(async () => { const Z = __zotik, cnt = () => Z.E.filter(e => e.rw === 1 && !e.dead).length; Z.pl.x = 0; Z.pl.z = 362; await new Promise(r => setTimeout(r, 400)); const a = cnt(), d1 = JSON.stringify(Z.X.rw.done), pz = Math.round(Z.pl.z); Z.pl.z = 350; await new Promise(r => setTimeout(r, 400)); const b2 = cnt() - a;
      const sh = Z.S().shards; for (const e of Z.E) if (e.rw === 1 && !e.dead) Z.killE(e); return { a, b: b2, d1, pz, plus: Z.S().shards - sh }; });
    const g = await p.evaluate(() => { const Z = __zotik; if (Z.X.rpz.solved) return { skip: 1 }; Z.X.rpz.solve(); const e = Z.E.find(e => e.rw === 'boss' && !e.dead); const before = !!Z.S().obst[Z.X.rw.gid]; if (e) Z.killE(e); return { guard: !!e, before, after: !!Z.S().obst[Z.X.rw.gid] }; });
    ok(`Welt ${n}: Hinterhalt`, r.a >= 2 && r.b >= 3 && r.plus > 0, JSON.stringify(r));
    ok(`Welt ${n}: Ruinenwächter`, g.guard && !g.before && g.after, JSON.stringify(g)); }
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 400)); process.exit(1); });
