// Hochschleudern und Luftkombo: der Schlusshieb wirft Gegner hoch, in der Luft sind sie wehrlos, Treffer halten sie oben, danach landen sie und kämpfen weiter. Bosse nicht.
//   node tools/test-zotik/luftkombo.cjs [bild]
const { chromium, ARGS, open, intro, shot } = require('./lib.cjs');
const BILD = process.argv[2] === 'bild';
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { render: BILD, ctx: { viewport: { width: 960, height: 540 } } }); let fail = 0;
  const ok = (n, c, i) => { if (!c) fail++; console.log(`${c ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; for (let n = 2; n <= 10; n++) S.cd[n] = { fin: 1 }; }); await intro(p);
  await p.evaluate(() => { const Z = __zotik; Z.switchWorld(2); Z.step(1 / 30, 5); for (const e of Z.E) if (!e.dead) { e.dead = true; e.m.root.visible = false; } let x = 0, z = 14; for (let k = 0; k < 40 && (Z.pBlocked(x, z) || Z.pBlocked(x, z + 2)); k++) z += 1; Z.pl.x = x; Z.pl.z = z; Z.pl.y = Z.hgt(x, z); Z.pl.face = 0; Z.setCam(Math.PI + .7, .4, 7.5); window.__sp = () => { const e = Z.spawnEnemy('wolf', Z.pl.x, Z.pl.z + 1.8); e.max = e.hp = 1e6; e.st = 'chase'; return e; }; });
  // echter Ablauf: drei Hiebe, der dritte schleudert hoch
  const a = await p.evaluate(() => { const Z = __zotik, e = window.__sp(); window.__e = e; Z.pl.iframes = 99; let top = 0, vor = 0, hiebe = 0;
    for (let i = 0; i < 150; i++) { Z.pl.iframes = 99; if (Z.pl.atk < 0 && hiebe < 3) { Z.pl.face = Math.atan2(e.x - Z.pl.x, e.z - Z.pl.z); Z.startAttack(); hiebe++; } Z.step(1 / 60, 1); if (hiebe < 3) vor = Math.max(vor, e.ay || 0); top = Math.max(top, e.ay || 0); if (hiebe === 3 && Z.pl.atk < 0 && !(e.ay > 0) && top > 0) break; }
    return { hiebe, vor, top: +top.toFixed(2), ay: e.ay || 0, st: e.st, y: +(e.m.root.position.y - Z.hgt(e.x, e.z)).toFixed(2), rx: e.m.root.rotation.x }; });
  ok('Hieb 1 und 2 schleudern nicht', a.vor === 0, 'Höhe ' + a.vor);
  ok('Schlusshieb schleudert den Gegner hoch (über 1,2 m)', a.top > 1.2, a.top + ' m');
  ok('Gegner landet wieder und steht gerade', a.ay === 0 && Math.abs(a.y) < .6 && a.rx === 0, JSON.stringify(a));
  // in der Luft wehrlos, Treffer halten oben
  const j = await p.evaluate(() => { const Z = __zotik, e = window.__e; Z.pl.iframes = 0; const hp0 = Z.S().hp; Z.launchE(e, 8.5); let t1 = 0; const x0 = e.x, z0 = e.z; while (e.ay > 0 && t1 < 300) { Z.step(1 / 60, 1); t1++; } const ruhig = Math.hypot(e.x - x0, e.z - z0), hp1 = Z.S().hp;
    Z.launchE(e, 8.5); let t2 = 0, hits = 0; while (e.ay > 0 && t2 < 600) { Z.step(1 / 60, 1); t2++; if (t2 % 18 === 0 && hits < 8) { Z.hurtE(e, 1, 0, 0, false); hits++; } } return { t1, t2, ruhig: +ruhig.toFixed(2), schaden: hp0 - hp1, jg: e.jg, st: e.st }; });
  ok('In der Luft greift der Gegner nicht an und läuft nicht', j.schaden === 0 && j.ruhig < .5, JSON.stringify(j));
  ok('Luftkombo: Treffer halten ihn länger oben, aber nicht endlos', j.t2 > j.t1 * 1.4 && j.t2 < 600, `${j.t1} Bilder ohne, ${j.t2} mit Treffern`);
  const w = await p.evaluate(() => { const Z = __zotik, e = window.__e; Z.pl.iframes = 99; const d0 = Math.hypot(e.x - Z.pl.x, e.z - Z.pl.z); Z.pl.z -= 6; Z.step(1 / 60, 120); return { st: e.st, d: +(Math.hypot(e.x - Z.pl.x, e.z - Z.pl.z)).toFixed(1), d0: +(d0 + 6).toFixed(1) }; });
  ok('Nach der Landung kämpft er weiter (läuft wieder auf Zotik zu)', w.d < w.d0 - 1, JSON.stringify(w));
  const bo = await p.evaluate(() => { const Z = __zotik; window.__e.dead = true; window.__e.m.root.visible = false; const e = Z.spawnEnemy('x2', Z.pl.x, Z.pl.z + 4); return { boss: !!e.boss, ok: Z.launchE(e, 8.5), ay: e.ay || 0 }; });
  ok('Bosse lassen sich nicht hochschleudern', bo.boss && !bo.ok && bo.ay === 0, JSON.stringify(bo));
  if (BILD) { await p.evaluate(() => { const Z = __zotik; for (const e of Z.E) if (!e.dead) { e.dead = true; e.m.root.visible = false; } const e = window.__sp(); Z.step(1 / 60, 5); Z.launchE(e, 8.5); Z.step(1 / 60, 22); }); await shot(p, 'luftkombo'); }
  ok('keine Seitenfehler', p.errs.length === 0, p.errs.join(' | ')); await b.close(); process.exit(fail ? 1 : 0); })();
