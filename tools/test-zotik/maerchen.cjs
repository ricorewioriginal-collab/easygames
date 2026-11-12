// Märchenwelten (v2): Abstecher beim Reisen zwischen zwei Kapiteln, Ankunft mit Gast, alle Aufträge je Welt
// (Sammeln, Stellen wie Glocken/Feuer/Muscheln – auch oben auf dem Glockenturm –, Gegnerwellen, Boss mit Reaktionsbefehl, Suchen),
// Schlüsselloch, Nautilux zum Weiterreisen, Erreichbarkeit aller Stellen, keine Fehler. Bilder: /tmp/zotik-test/mw-<id>-*.jpg
// Aufruf: node tools/test-zotik/maerchen.cjs [Welt-Nummern, z. B. 21,24]
const { chromium, ARGS, open, flood, skip, opt, talk, shot } = require('./lib.cjs');
let ok = 0, bad = 0; const chk = (c, m) => { if (c) { ok++; console.log('ok   ' + m); } else { bad++; console.log('FEHL ' + m); } };
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { ctx: { viewport: { width: 960, height: 540 } } }); const only = process.argv[2] ? process.argv[2].split(',').map(Number) : null;
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.lvl = 20; S.fl.naut = 1; Z.X.noFlight = 1; for (let k = 2; k <= 8; k++) S.cd[k] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; }); await skip(p); await p.waitForTimeout(600); await skip(p);
  await p.evaluate(() => __zotik.travel(2)); await p.waitForTimeout(300); await skip(p);
  // Abstecher: Lunaris → Kapitel 2 bietet den Spiegelwald an
  const o = await opt(p, 'nichts'); chk(/Abstecher/.test(o) && /Spiegelwald/.test(o) && /Direkt nach/.test(o), 'Reise Lunaris → Elaris bietet Abstecher an: ' + o.slice(0, 110));
  await opt(p, 'Abstecher'); await p.waitForTimeout(1500); await skip(p); await p.waitForTimeout(600); await skip(p);
  chk(await p.evaluate(() => __zotik.ch === 21 && !!__zotik.WLD.story), 'Abstecher führt in den Spiegelwald');
  const W = await p.evaluate(() => __zotik.MWX().WORLDS.map(w => w.n));
  for (const n of W) { if (only && !only.includes(n)) continue;
    await p.evaluate(n => { const Z = __zotik; Z.X.noDetour = 1; if (Z.ch !== n) Z.travel(n); }, n); await p.waitForTimeout(1800);
    for (let k = 0; k < 30; k++) { await skip(p); await p.waitForTimeout(400); if (await p.evaluate(() => { const Z = __zotik, w = Z.WLD && Z.WLD.mw; return !!w && !!Z.MWX().st(w.id).seen && Z.CMP.some(c => c.guest) && document.getElementById('dlg').hidden; })) break; }
    const info = await p.evaluate(() => { const Z = __zotik, w = Z.WLD.mw; return { id: w.id, name: w.name, n: Z.ch, npc: Z.NPC.filter(q => /^mw_/.test(q.id)).length, e: Z.E.filter(e => !e.dead).length, guest: Z.CMP.filter(c => c.guest).length, gname: w.guest && w.guest.name }; });
    chk(info.n === n && info.npc >= 3, `${info.name}: angekommen, ${info.npc} Figuren, ${info.e} Gegner`);
    chk(info.guest >= 1, `${info.name}: Gast ${info.gname} kämpft mit`);
    await flood(p);
    const unreach = await p.evaluate(() => { const Z = __zotik, w = Z.WLD.mw, pts = [];
      for (const d of w.npcs) pts.push([d.name, d.x, d.z, 3]);
      for (const m of w.ms) { if (!m.top) for (const q of m.pts || []) pts.push([m.n + ' ' + (q[2] || ''), q[0], q[1], 2.6]); if (m.at) pts.push([m.n, m.at[0], m.at[1], m.t === 'find' ? 2.8 : m.t === 'defeat' ? Math.max(6, m.r || 0) : 6]); }
      pts.push(['Schlüsselloch', w.key[0], w.key[1] + 3.6, 3], ['Nautilux', -4.6, 12.4, 3]); for (const [x, z] of w.chests || []) pts.push(['Truhe', x, z, 2.4]);
      return pts.filter(([nm, x, z, r]) => !window.__near(x, z, r)).map(q => q[0]); });
    chk(!unreach.length, `${info.name}: alle Stellen zu Fuß erreichbar` + (unreach.length ? ' – NICHT: ' + unreach.join(', ') : ''));
    await shot(p, 'mw-' + info.id + '-ankunft'); await p.evaluate(() => { __zotik.noRender = true; });
    for (let k = 0; k < 6; k++) {
      const m = await p.evaluate(() => { const Z = __zotik, w = Z.WLD.mw, s = Z.MWX().st(w.id); const m = s.done ? null : w.ms[s.m]; return m ? { t: m.t, g: m.g, n: m.n, cnt: m.cnt || (m.pts || []).length, m: s.m, top: m.top || 0, react: !!m.react, waves: (m.waves || []).length } : null; });
      if (!m) break;
      let r = await talk(p, 'mw_' + m.g); if (/kein Hinweis/.test(r)) { await p.waitForTimeout(1200); r = await talk(p, 'mw_' + m.g); } await skip(p);
      chk(r === '' && await p.evaluate(() => { const Z = __zotik; return Z.MWX().st(Z.WLD.mw.id).st === 1; }), `${info.name}: Auftrag „${m.n}“ angenommen` + (r ? ' (' + r + ')' : ''));
      if (m.t === 'collect') for (let i = 0; i < m.cnt; i++) { await p.evaluate(() => { const Z = __zotik, w = Z.WLD.mw, s = Z.MWX().st(w.id), q = w.ms[s.m].pts.find((q, j) => !s.got[j]); if (!q) return; const c = window.__near(q[0], q[1], 1.5) || q; Z.pl.x = c[0]; Z.pl.z = c[1]; Z.step(1 / 30, 3); }); await p.waitForTimeout(60); }
      if (m.t === 'ring' && !m.top) { const names = await p.evaluate(() => { const Z = __zotik, w = Z.WLD.mw, s = Z.MWX().st(w.id); return w.ms[s.m].pts.map(q => q[2]); }); for (const nm of names) { const rr = await talk(p, nm); if (rr) chk(false, info.name + ': ' + nm + ' – ' + rr); } }
      if (m.t === 'ring' && m.top) {   // oben auf dem Turm: Plattformen bis zur Spitze vorhanden, dann oben läuten
        const climb = await p.evaluate(top => { const Z = __zotik, L = Z.PLAT.filter(q => q.top > 1).map(q => q.top).sort((a, b) => a - b); let y = 0; for (const t of L) if (t - y < 2.6) y = t; return { max: y, n: L.length }; }, m.top);
        chk(climb.max >= m.top - 1.2, `${info.name}: Turm hat Vorsprünge bis oben (${climb.n} Stufen, bis ${climb.max.toFixed(1)} m, Ziel ${m.top} m)`);
        const rr = await p.evaluate(top => { const Z = __zotik, w = Z.WLD.mw, s = Z.MWX().st(w.id), mm = w.ms[s.m]; let out = '';
          mm.pts.forEach((q, i) => { Z.pl.x = q[0]; Z.pl.z = q[1] + .6; Z.pl.y = top; Z.pl.vy = 0; const it = Z.INT.find(t => t.name === q[2] && (!t.vis || t.vis())); if (!it) out += q[2] + ' nicht oben ansprechbar; '; else it.talk(); }); return out; }, m.top);
        chk(!rr, `${info.name}: alle Glocken oben geläutet` + (rr ? ' – ' + rr : ''));
      }
      if (m.t === 'find') { const who = await p.evaluate(() => { const Z = __zotik, w = Z.WLD.mw, s = Z.MWX().st(w.id); return w.ms[s.m].who; }); const rr = await talk(p, who); if (rr) chk(false, info.name + ': ' + who + ' – ' + rr); }
      if (m.t === 'defeat') { let kills = 0; for (let round = 0; round < 8; round++) { await p.waitForTimeout(250); kills += await p.evaluate(() => { const Z = __zotik; const L = Z.E.filter(e => !e.dead && e.mw === 1); for (const e of L) { Z.pl.x = e.x + 2; Z.pl.z = e.z + 2; Z.step(1 / 30, 2); Z.killE(e); } return L.length; }); await skip(p);
          if (await p.evaluate(k => { const Z = __zotik; return Z.MWX().st(Z.WLD.mw.id).m > k; }, m.m)) break; await p.waitForTimeout(1700); }
        chk(kills >= m.cnt, `${info.name}: ${kills} Gegner besiegt` + (m.waves ? ` in ${m.waves} Wellen` : '')); }
      if (m.t === 'boss') { await p.waitForTimeout(200); await skip(p);
        const bi = await p.evaluate(() => { const Z = __zotik, e = Z.E.find(e => !e.dead && e.mw === 2); if (!e) return null; e.awake = true; Z.pl.x = e.x + 3; Z.pl.z = e.z + 3; e.hp = Math.round(e.max * .55); Z.step(1 / 30, 3); return { hp: e.hp, name: e.d && e.d.name }; });
        chk(!!bi, `${info.name}: Boss erscheint (${bi && bi.name})`);
        if (bi && m.react) { const rr = await p.evaluate(() => { const Z = __zotik, e = Z.E.find(e => !e.dead && e.mw === 2), it = Z.INT.find(t => t.pr && t.pr.startsWith('△') && (!t.vis || t.vis())); if (!it) return -1; const h0 = e.hp; it.talk(); return h0 - e.hp; });
          chk(rr > 0, `${info.name}: Reaktionsbefehl mit dem Gast trifft (${rr} Schaden)`); await skip(p); }
        await p.evaluate(() => { const Z = __zotik, e = Z.E.find(e => !e.dead && e.mw === 2); if (e) Z.killE(e); }); }
      await p.waitForTimeout(200); await skip(p);
      chk(await p.evaluate(k => { const Z = __zotik; return Z.MWX().st(Z.WLD.mw.id).m === k + 1; }, m.m), `${info.name}: Auftrag „${m.n}“ erfüllt`);
    }
    await skip(p);
    const sh0 = await p.evaluate(() => __zotik.S().shards); const rk = await talk(p, 'Schlüsselloch'); await skip(p);
    chk(rk === '' && await p.evaluate(() => { const Z = __zotik; return !!Z.MWX().st(Z.WLD.mw.id).done; }) && await p.evaluate(s => __zotik.S().shards >= s + 300, sh0), `${info.name}: Schlüsselloch versiegelt, Belohnung erhalten` + (rk ? ' (' + rk + ')' : ''));
    await p.evaluate(() => { const Z = __zotik, w = Z.WLD.mw; Z.pl.x = w.key[0]; Z.pl.z = w.key[1] + 9; Z.cam(0, .3, 13); Z.step(1 / 30, 10); }); await shot(p, 'mw-' + info.id + '-wahrzeichen'); await p.evaluate(() => { __zotik.noRender = true; });
    const nt = await talk(p, 'Nautilux'); chk(nt === '' && await p.evaluate(() => { const m = document.getElementById('menu'); return !!m && !m.hidden && /trv/.test(m.innerHTML); }), `${info.name}: Nautilux öffnet die Reisekarte`);
    await p.evaluate(() => __zotik.toggleMenu && __zotik.toggleMenu(false)); await p.keyboard.press('Escape');
  }
  if (!only) chk(await p.evaluate(() => __zotik.S().fl.mwAll === 1 && !!(__zotik.S().inv || {}).w_maer), 'alle Siegel: Erzählerklinge erhalten');
  // nach dem Versiegeln wird kein Abstecher mehr angeboten
  await p.evaluate(() => { const Z = __zotik; Z.X.noDetour = 0; Z.travel(1); }); await p.waitForTimeout(1500); await skip(p);
  if (!only || only.includes(21)) { await p.evaluate(() => __zotik.travel(2)); await p.waitForTimeout(400); chk(await p.evaluate(() => __zotik.ch === 2 || document.getElementById('dOpts').hidden), 'versiegelte Welt: kein Abstecher mehr'); }
  console.log((p.errs.length ? 'FEHL Seitenfehler: ' + [...new Set(p.errs)].join(' | ') : 'ok   keine Fehler auf der Seite'));
  console.log(`${ok}/${ok + bad} bestanden`); await b.close(); process.exit(bad || p.errs.length ? 1 : 0); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 600)); process.exit(1); });
