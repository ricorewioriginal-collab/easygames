// Märchenwelten: Märchentor in Lunaris, Reise nur über die Hauptwelt, alle sieben Welten mit je drei Aufträgen und Schlüsselloch,
// Erreichbarkeit aller Stellen, keine Fehler. Bilder: /tmp/zotik-test/mw-<id>.jpg
// Aufruf: node tools/test-zotik/maerchen.cjs [Welt-Nummern, z. B. 21,24]
const { chromium, ARGS, open, flood, skip, opt, talk, shot } = require('./lib.cjs');
let ok = 0, bad = 0; const chk = (c, m) => { if (c) { ok++; console.log('ok   ' + m); } else { bad++; console.log('FEHL ' + m); } };
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { ctx: { viewport: { width: 960, height: 540 } } }); const only = process.argv[2] ? process.argv[2].split(',').map(Number) : null;
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.lvl = 20; S.fl.naut = 1; }); await skip(p);
  // Märchentor in Lunaris
  await flood(p); chk((await talk(p, 'Märchentor')) === '', 'Märchentor in Lunaris ansprechbar');
  const o = await opt(p, 'nichts'); chk(/Spiegelwald/.test(o) && /Große Mauer/.test(o) && /Notre-Dame/.test(o), 'Märchentor bietet alle Welten an: ' + o.slice(0, 120));
  await opt(p, 'Spiegelwald'); await p.waitForTimeout(1600); await skip(p);
  chk(await p.evaluate(() => __zotik.ch === 21 && __zotik.WLD.story), 'Reise in den Spiegelwald über das Märchentor');
  chk(await p.evaluate(() => { const Z = __zotik; Z.travel(4); return Z.ch === 21; }), 'aus einer Märchenwelt keine Reise in eine andere Welt (nur Lunaris)');
  const W = await p.evaluate(() => __zotik.MWX().WORLDS.map(w => w.n));
  for (const n of W) { if (only && !only.includes(n)) continue;
    await p.evaluate(n => { const Z = __zotik; if (Z.ch !== 1) Z.travel(1); }, n); await p.waitForTimeout(1500); await skip(p);
    await p.evaluate(n => __zotik.travel(n), n); await p.waitForTimeout(1600); await skip(p); await p.waitForTimeout(1200); await skip(p);
    const info = await p.evaluate(() => { const Z = __zotik, w = Z.WLD.mw; return { id: w.id, name: w.name, n: Z.ch, npc: Z.NPC.filter(q => /^mw_/.test(q.id)).length, e: Z.E.filter(e => !e.dead).length, pl: [Z.pl.x, Z.pl.z] }; });
    chk(info.n === n && info.npc >= 2, `${info.name}: angekommen, ${info.npc} Figuren, ${info.e} Gegner`);
    await flood(p);
    // Erreichbarkeit: Figuren, Aufgaben-Stellen, Boss-Orte, Schlüsselloch, Sternentor
    const unreach = await p.evaluate(() => { const Z = __zotik, w = Z.WLD.mw, pts = [];
      for (const d of w.npcs) pts.push([d.name, d.x, d.z, 3]); for (const m of w.ms) { for (const q of m.pts || []) pts.push([m.n + ' ' + (q[2] || ''), q[0], q[1], 2.5]); if (m.at) pts.push([m.n, m.at[0], m.at[1], m.t === 'find' ? 2.8 : 6]); }
      pts.push(['Schlüsselloch', w.key[0], w.key[1] + 3.6, 3], ['Sternentor', -5.6, 4, 3]);
      return pts.filter(([nm, x, z, r]) => !window.__near(x, z, r)).map(q => q[0]); });
    chk(!unreach.length, `${info.name}: alle Stellen zu Fuß erreichbar` + (unreach.length ? ' – NICHT: ' + unreach.join(', ') : ''));
    await shot(p, 'mw-' + info.id + '-ankunft');
    // drei Aufträge
    for (let k = 0; k < 3; k++) {
      const m = await p.evaluate(() => { const Z = __zotik, w = Z.WLD.mw, s = Z.MWX().st(w.id); const m = w.ms[s.m]; return m ? { t: m.t, g: m.g, n: m.n, cnt: m.cnt || (m.pts || []).length, m: s.m } : null; });
      if (!m) { chk(false, info.name + ': Auftrag ' + (k + 1) + ' fehlt'); break; }
      const r = await talk(p, 'mw_' + m.g); chk(r === '' && await p.evaluate(() => { const Z = __zotik; return Z.MWX().st(Z.WLD.mw.id).st === 1; }), `${info.name}: Auftrag „${m.n}“ angenommen` + (r ? ' (' + r + ')' : ''));
      if (m.t === 'collect') for (let i = 0; i < m.cnt; i++) { await p.evaluate(i => { const Z = __zotik, w = Z.WLD.mw, s = Z.MWX().st(w.id), q = w.ms[s.m].pts.find((q, j) => !s.got[j]); if (!q) return; const c = window.__near(q[0], q[1], 1.5) || q; Z.pl.x = c[0]; Z.pl.z = c[1]; Z.step(1 / 30, 3); }, i); await p.waitForTimeout(80); }
      if (m.t === 'ring') { const names = await p.evaluate(() => { const Z = __zotik, w = Z.WLD.mw, s = Z.MWX().st(w.id); return w.ms[s.m].pts.map(q => q[2]); }); for (const nm of names) { const rr = await talk(p, nm); if (rr) chk(false, info.name + ': ' + nm + ' – ' + rr); } }
      if (m.t === 'find') { const who = await p.evaluate(() => { const Z = __zotik, w = Z.WLD.mw, s = Z.MWX().st(w.id); return w.ms[s.m].who; }); const rr = await talk(p, who); if (rr) chk(false, info.name + ': ' + who + ' – ' + rr); }
      if (m.t === 'defeat' || m.t === 'boss') { await p.waitForTimeout(200); const kills = await p.evaluate(() => { const Z = __zotik; const L = Z.E.filter(e => !e.dead && e.mw); for (const e of L) { Z.pl.x = e.x + 2; Z.pl.z = e.z + 2; Z.step(1 / 30, 2); Z.killE(e); } return L.length; }); chk(kills >= (m.t === 'boss' ? 1 : m.cnt), `${info.name}: ${kills} Auftragsgegner ${m.t === 'boss' ? '(Boss)' : ''} gestellt und besiegt`); }
      await p.waitForTimeout(150); await skip(p);
      chk(await p.evaluate(k => { const Z = __zotik; return Z.MWX().st(Z.WLD.mw.id).m === k + 1; }, m.m), `${info.name}: Auftrag „${m.n}“ erfüllt`);
    }
    // Schlüsselloch
    const sh0 = await p.evaluate(() => __zotik.S().shards); const rk = await talk(p, 'Schlüsselloch'); await skip(p);
    chk(rk === '' && await p.evaluate(() => { const Z = __zotik; return !!Z.MWX().st(Z.WLD.mw.id).done; }) && await p.evaluate(s => __zotik.S().shards >= s + 300, sh0), `${info.name}: Schlüsselloch versiegelt, Belohnung erhalten`);
    await p.evaluate(() => { const Z = __zotik, w = Z.WLD.mw; Z.pl.x = w.key[0]; Z.pl.z = w.key[1] + 9; Z.cam(0, .3, 13); Z.step(1 / 30, 10); }); await shot(p, 'mw-' + info.id + '-wahrzeichen');
  }
  if (!only) chk(await p.evaluate(() => __zotik.S().fl.mwAll === 1 && !!(__zotik.S().inv || {}).w_maer), 'alle Siegel: Erzählerklinge erhalten');
  // zurück über das Sternentor landet vor dem Märchentor in Lunaris
  await flood(p); chk((await talk(p, 'Sternentor')) === '', 'Sternentor ansprechbar'); await opt(p, 'Lunaris'); await p.waitForTimeout(1600); await skip(p);
  chk(await p.evaluate(() => { const Z = __zotik; return Z.ch === 1 && Math.hypot(Z.pl.x - 8, Z.pl.z + 15.4) < 1; }), 'zurück in Lunaris vor dem Märchentor');
  console.log((p.errs.length ? 'FEHL Seitenfehler: ' + [...new Set(p.errs)].join(' | ') : 'ok   keine Fehler auf der Seite'));
  console.log(`${ok}/${ok + bad} bestanden`); await b.close(); process.exit(bad || p.errs.length ? 1 : 0); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 600)); process.exit(1); });
