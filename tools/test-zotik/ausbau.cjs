// Ausbau: Fähigkeitenbaum (Punkte, Wirkung, Neuverteilen, Doppelsprung), Bestiarium-Belohnung, veränderte Gegner in Neues Spiel+, Nebenauftrag im Auftragsfeld
const { chromium, ARGS, open, intro } = require('./lib.cjs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b); const res = [], w = ms => p.waitForTimeout(ms);
  const ok = (name, pass, info) => { res.push(pass); console.log(`${pass ? 'ok  ' : 'FEHL'} ${name}${info ? ' · ' + info : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.lvl = 12; for (const e of Z.E) e.dead = true; }); await intro(p);
  const st = () => p.evaluate(() => { const Z = __zotik; return { free: Z.skFree(), atk: Z.atkV(), hp: Z.maxHp(), sk: Object.assign({}, Z.S().sk) }; });
  const a0 = await st(); await p.keyboard.press('Escape'); await w(300);
  await p.evaluate(() => { [...document.querySelectorAll('#tabs button')].find(b => /Fähigkeiten/.test(b.textContent)).click(); }); await w(200);
  const click = sel => p.evaluate(sel => { const b = document.querySelector(sel); if (!b || b.disabled) return false; b.click(); return true; }, sel);
  ok('Baum: Punkte je Stufe', a0.free === 11, 'frei ' + a0.free);
  await click('[data-sk="str"]'); await w(120); const a1 = await st(); ok('Baum: Stärke Rang 1 wirkt', a1.free === 10 && Math.abs(a1.atk / a0.atk - 1.04) < .001, `Angriff ${a0.atk.toFixed(1)} → ${a1.atk.toFixed(1)}`);
  await click('[data-sk="str"]'); await click('[data-sk="vit"]'); await w(120); const a2 = await st(); ok('Baum: Rang 2 kostet zwei Punkte', a2.free === 7 && a2.sk.str === 2 && a2.hp > a0.hp, `frei ${a2.free}, Leben ${a0.hp} → ${a2.hp}`);
  for (let i = 0; i < 3; i++) { await click('[data-sk="leap"]'); await w(80); } const a3 = await st(); ok('Baum: zu wenig Punkte sperrt den Knopf', a3.sk.leap === 3 && a3.free === 1 && !(await click('[data-sk="str"]')), JSON.stringify(a3.sk));
  await p.keyboard.press('Escape'); await w(300);
  /* Doppelsprung ab Sprungkraft 3 */
  { await p.evaluate(() => { __zotik.pl.x = 0; __zotik.pl.z = 14; }); await w(300); const y0 = await p.evaluate(() => __zotik.pl.y); await p.keyboard.press('Space'); let top = y0; for (let i = 0; i < 12; i++) { await w(30); top = Math.max(top, await p.evaluate(() => __zotik.pl.y)); } await p.keyboard.press('Space'); for (let i = 0; i < 45; i++) { await w(30); top = Math.max(top, await p.evaluate(() => __zotik.pl.y)); }
    const e = await p.evaluate(() => [__zotik.pl.y, __zotik.pl.air]); ok('Doppelsprung', top - y0 > 2.6 && !e[1] && Math.abs(e[0] - y0) < .1, `Höhe ${(top - y0).toFixed(2)} m`); }
  await p.keyboard.press('Escape'); await w(300); await p.evaluate(() => { [...document.querySelectorAll('#tabs button')].find(b => /Fähigkeiten/.test(b.textContent)).click(); }); await w(200);
  await click('[data-skr]'); await w(150); const a4 = await st(); ok('Baum: Neu verteilen gibt alle Punkte zurück', a4.free === 11 && Math.abs(a4.atk - a0.atk) < .001 && a4.hp === a0.hp, 'frei ' + a4.free); await p.keyboard.press('Escape'); await w(300);
  /* Bestiarium-Belohnung bei der 5. Art */
  { const r = await p.evaluate(() => { const Z = __zotik, S = Z.S(); S.bst = { a: { n: 1 }, b: { n: 1 }, c: { n: 1 }, d: { n: 1 } }; S.bstR = {}; const sh = S.shards, e = Z.spawnEnemy('wolf', 30, -60); Z.killE(e); return { n: Object.keys(S.bst).length, plus: S.shards - sh, got: !!S.bstR[5] }; }); ok('Bestiarium: Belohnung bei 5 Arten', r.n === 5 && r.got && r.plus >= 300, `+${r.plus} Splitter`); }
  /* Neues Spiel+: veränderte Gegner */
  { const r = await p.evaluate(() => { const Z = __zotik, S = Z.S(); let base = 0; { const e = Z.spawnEnemy('wolf', 40, -60); base = e.max; e.dead = true; e.m.root.visible = false; } S.ng = 1; const L = []; for (let i = 0; i < 80; i++) { const e = Z.spawnEnemy('wolf', 40 + i, -70); L.push([e.ngx || 0, e.d.name, e.max, e.d.spd]); e.dead = true; e.m.root.visible = false; } S.ng = 0;
      const ch = L.filter(q => q[0]); return { share: ch.length / 80, names: [...new Set(ch.map(q => q[1]))].sort().join(', '), fels: (() => { const av = A => A.reduce((x, q) => x + q[2], 0) / A.length; return av(ch.filter(q => q[0] === 2)) > av(L.filter(q => !q[0])) * 1.35; })(), plain: L.filter(q => !q[0]).every(q => q[1] === 'Dornenwolf') }; });
    ok('Neues Spiel+: veränderte Gegner', r.share > .2 && r.share < .65 && /Sturm-/.test(r.names) && /Fels-/.test(r.names) && /Wut-/.test(r.names) && r.fels && r.plain, `${Math.round(r.share * 100)} % · ${r.names}`); }
  /* Nebenauftrag im Auftragsfeld */
  { const t = await p.evaluate(() => { const Z = __zotik, c = Z.NQ.CHAINS[1][0]; Z.NQ.advance(c, 1); return document.getElementById('qo').textContent; }); ok('Auftragsfeld zeigt den Nebenauftrag', /📜 Finde: Glockenklöppel/.test(t), t.replace(/\n/g, ' | ').slice(0, 90)); }
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 400)); process.exit(1); });
