// K.O. eines KayKit-Begleiters: liegt per Death_A (nicht gekippt), steht danach wieder auf
//   node tools/test-zotik/begleiter-ko.cjs
const { chromium, ARGS, open, intro } = require('./lib.cjs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, {}); const res = [];
  const ok = (n, c, i) => { res.push(c); console.log(`${c ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; for (let n = 2; n <= 10; n++) S.cd[n] = { fin: 1 }; }); await intro(p);
  await p.evaluate(() => { const Z = __zotik; Z.switchWorld(2); for (const e of Z.E) if (!e.dead) { e.dead = true; e.m.root.visible = false; } Z.joinParty('rovan'); });
  await p.waitForFunction(() => { const a = __zotik.CMP.find(c => c.id === 'rovan'); return a && a.P.kk && a.P.kk.ready; }, null, { timeout: 90000 }).catch(() => { });
  await p.evaluate(() => { const a = __zotik.CMP.find(c => c.id === 'rovan'); a.ko = true; a.kot = 0; a.hp = 0; a.calm = 0; __zotik.dlg.on = false; __zotik.step(1 / 30, 10); });
  await p.evaluate(() => { const Z = __zotik, a = Z.CMP.find(c => c.id === 'rovan'); Z.KK.once(a.P.kk, 'Throw'); Z.KK.once(a.P.kk, 'Hit_A'); Z.dlg.on = false; Z.step(1 / 30, 5); });
  const k = await p.evaluate(() => { const a = __zotik.CMP.find(c => c.id === 'rovan'), r = a.P.root.rotation; return { cur: a.P.kk.cur, want: a.P.kk.want, rz: r.z, rx: r.x }; });
  ok('K.O. spielt Death_A, Angriff/Treffer unterbrechen ihn nicht', k.want === 'Death_A' && k.cur === 'Death_A', JSON.stringify(k));
  ok('Figur nicht gekippt', Math.abs(k.rz) < .01 && Math.abs(k.rx) < .01);
  await p.evaluate(() => { __zotik.dlg.on = false; __zotik.step(1 / 30, 200); });
  const r = await p.evaluate(() => { const a = __zotik.CMP.find(c => c.id === 'rovan'); return { ko: a.ko, want: a.P.kk.want, rz: a.P.root.rotation.z, act: Object.entries(a.P.kk.act).filter(([n, x]) => x.isScheduled() && x.getEffectiveWeight() > .01).map(([n]) => n) }; });
  ok('steht ohne Kampf wieder auf', !r.ko && r.want !== 'Death_A' && r.rz === 0, JSON.stringify(r));
  ok('keine Liege-Animation mehr aktiv', !r.act.includes('Death_A'), r.act.join());
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); process.exit(res.every(Boolean) ? 0 : 1); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 400)); process.exit(1); });
