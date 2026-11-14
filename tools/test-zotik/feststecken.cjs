// Feststecken in der Werkzeug-Ruine: Befreien-Knopf bringt vor die Ruine, Blöcke werden zurückgesetzt
const { chromium, ARGS, open, intro } = require('./lib.cjs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b); const res = [], w = ms => p.waitForTimeout(ms);
  const ok = (name, pass, info) => { res.push(pass); console.log(`${pass ? 'ok  ' : 'FEHL'} ${name}${info ? ' · ' + info : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); Z.S().stage = 8; for (const e of Z.E) e.dead = true; }); await intro(p);
  await p.evaluate(() => { const Z = __zotik; Z.ruinGo(0, 364, Math.PI, true); const b = Z.OB.find(o => o.t === 'block'); b.x += 2; b.z += 2; b.m.position.x = b.x; b.m.position.z = b.z; window.__b = [b.x0, b.z0]; }); await w(800);
  const inside = await p.evaluate(() => __zotik.pl.z > 300); ok('in der Ruine', inside);
  await p.evaluate(() => __zotik.unstuck()); await w(900);
  const r = await p.evaluate(() => { const Z = __zotik, b = Z.OB.find(o => o.t === 'block'); return { out: Z.pl.z < 300, back: Math.hypot(b.x - b.x0, b.z - b.z0) < .01, blocked: Z.pBlocked(Z.pl.x, Z.pl.z) }; });
  ok('draußen vor der Ruine', r.out && !r.blocked); ok('Block zurückgesetzt', r.back);
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 400)); process.exit(1); });
