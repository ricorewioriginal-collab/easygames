// RicoReWi-Welt (33): RiCARDO als KayKit-Figur mit Frisur/Bart/Schmuck, Sendemasten schalten das Abenteurer-Radio um,
// Automaten/Lesepulte/Portal öffnen echte easygames-Spiele (mit Rückfrage), nach dem Versiegeln gehört RiCARDO zum Team.
//   node tools/test-zotik/ricorewi.cjs [bild]  – mit „bild“ Fotos nach /tmp/zotik-test/rrw-*.jpg
const { chromium, ARGS, open, skip, flood, talk } = require('./lib.cjs');
const BILD = process.argv[2] === 'bild', fs = require('fs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { render: BILD, ctx: { viewport: { width: 960, height: 540 } } }); const res = [];
  const ok = (n, c, i) => { res.push(!!c); console.log(`${c ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  const shot = async (n, cam) => { if (!BILD) return; await p.evaluate(c => { const Z = __zotik; Z.noRender = false; if (c) Z.setCam(...c); }, cam); await p.waitForTimeout(1600); const c = await p.context().newCDPSession(p); const s = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 80 }); fs.mkdirSync('/tmp/zotik-test', { recursive: true }); fs.writeFileSync(`/tmp/zotik-test/rrw-${n}.jpg`, Buffer.from(s.data, 'base64')); };
  const go = async (x, z, face) => { await p.evaluate(([x, z, f]) => { const Z = __zotik, c = window.__near(x, z, 4) || [x, z]; Z.pl.x = c[0]; Z.pl.z = c[1]; Z.pl.y = Z.WLD.h(c[0], c[1]); if (f != null) Z.pl.face = f; Z.step(1 / 30, 4); }, [x, z, face]); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.lvl = 20; S.fl.naut = 1; Z.X.noFlight = 1; for (let k = 2; k <= 10; k++) S.cd[k] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; }); await skip(p); await p.waitForTimeout(600); await skip(p);
  await p.evaluate(() => { const Z = __zotik; Z.X.noDetour = 1; Z.travel(33); }); await p.waitForTimeout(1800);
  for (let k = 0; k < 30; k++) { await skip(p); await p.waitForTimeout(400); if (await p.evaluate(() => { const Z = __zotik; return Z.CMP.some(c => c.guest) && document.getElementById('dlg').hidden; })) break; }
  ok('Welt RicoReWi geladen', await p.evaluate(() => __zotik.WLD && __zotik.WLD.mw && __zotik.WLD.mw.id === 'ricorewi'));
  await p.waitForFunction(() => { const g = __zotik.CMP.find(c => c.guest); return g && g.P.kk && g.P.kk.ready; }, null, { timeout: 90000 }).catch(() => { });
  const rico = await p.evaluate(() => { const g = __zotik.CMP.find(c => c.guest); return g ? { id: g.id, kk: g.P.kk && g.P.kk.id, deco: !!(g.P.kk && g.P.kk.deco && g.P.kk.deco.children.length > 20) } : null; });
  ok('RiCARDO kämpft mit, als KayKit-Figur mit Haaren, Bart, Septum, Ohrring, Kopfhörer', rico && rico.id === 'g_rico' && rico.kk === 'ad_ra' && rico.deco, JSON.stringify(rico));
  await flood(p);
  // Masten erst nach dem Frequenz-Auftrag, dann schalten sie den Sender um
  const before = await p.evaluate(() => __zotik.INT.filter(q => q.pr === 'Sender einschalten' && (!q.vis || q.vis())).length);
  await p.evaluate(() => { const Z = __zotik; Z.MWX().st('ricorewi').m = 3; });
  const masts = await p.evaluate(() => __zotik.INT.filter(q => q.pr === 'Sender einschalten' && (!q.vis || q.vis())).map(q => q.name));
  ok('13 Sendemasten erst nach dem Frequenz-Auftrag', before === 0 && masts.length === 13, before + ' → ' + masts.length);
  const r = await talk(p, '📻 Rapradio 24'); await p.waitForTimeout(300);
  const st = await p.evaluate(() => { try { return JSON.parse(localStorage.getItem('zotik_radio') || '{}').st; } catch (e) { return null; } });
  ok('Mast schaltet das Abenteurer-Radio auf seinen Sender', !r && st === 'rapradio24', (r || '') + ' st=' + st);
  await p.evaluate(() => window.ZotikRadio && window.ZotikRadio.set(false));
  // Echte Spiele: Rückfrage, dann Wechsel (Navigation wird abgefangen)
  const exits = await p.evaluate(() => __zotik.INT.filter(q => /^(Automat|Buch|Portal):/.test(q.name)).map(q => q.name));
  ok('Portal, 5 Automaten, 2 Lesepulte', exits.length === 8 && exits.includes('Portal: Show Me Your Voice'), exits.join(', '));
  const tgt = {}; for (const f of ['show-me-your-voice', 'ricopoly', 'rico-flap', 'ricolife', 'anmacha-radio-match', 'leuchtfeuer', 'ich-bin-das-licht']) tgt[f] = fs.existsSync(__dirname + '/../../' + f + '/index.html');
  ok('alle Zielspiele vorhanden', Object.values(tgt).every(Boolean), JSON.stringify(tgt));
  await p.route('**/show-me-your-voice/**', rt => rt.fulfill({ status: 200, contentType: 'text/html', body: '<title>SMYV</title>ok' }));
  await go(-66, -70, Math.PI); await shot('portal', [0, .12, 7]);
  const r2 = await talk(p, 'Portal: Show Me Your Voice'); await p.waitForTimeout(400);
  const opts = await p.evaluate(() => { const o = document.getElementById('dOpts'); for (let k = 0; k < 6 && o.hidden; k++) document.getElementById('dlg').click(); return [...o.querySelectorAll('button')].map(b => b.textContent); });
  ok('Portal fragt vorher nach', !r2 && opts.some(t => t.includes('Show Me Your Voice öffnen')) && opts.some(t => t.includes('Hierbleiben')), (r2 || '') + ' ' + opts.join(' | '));
  const nav = p.waitForURL(/show-me-your-voice\/\?from=zotik/, { timeout: 8000 }).then(() => true).catch(() => false);
  await p.evaluate(() => [...document.querySelectorAll('#dOpts button')].find(b => b.textContent.includes('öffnen')).click());
  const navOk = await nav; ok('Portal öffnet Show Me Your Voice (Spielstand vorher gespeichert)', navOk, p.url());
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | '));
  // zweite Seite: Versiegeln holt RiCARDO dauerhaft ins Team, kein doppelter Gast danach
  const q = await open(b, { render: BILD, ctx: { viewport: { width: 960, height: 540 } } });
  await q.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.lvl = 20; S.fl.naut = 1; Z.X.noFlight = 1; for (let k = 2; k <= 10; k++) S.cd[k] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; }); await skip(q); await q.waitForTimeout(600); await skip(q);
  await q.evaluate(() => { const Z = __zotik, S = Z.S(); S.mw = S.mw || {}; S.mw.ricorewi = { v: 2, m: 9, st: 0, c: 0, got: {}, done: 0, seen: 1 }; Z.X.noDetour = 1; Z.travel(33); }); await q.waitForTimeout(1800);
  for (let k = 0; k < 30; k++) { await skip(q); await q.waitForTimeout(400); if (await q.evaluate(() => __zotik.CMP.some(c => c.guest) && document.getElementById('dlg').hidden)) break; }
  const rk = await q.evaluate(() => { const k = __zotik.INT.find(i => i.name === 'Schlüsselloch'); if (!k) return 'kein Schlüsselloch'; k.talk(); return ''; }); for (let k = 0; k < 12; k++) { await skip(q); await q.waitForTimeout(300); } 
  const team = await q.evaluate(() => { const S = __zotik.S(); return { party: S.party.includes('rico'), res: (S.res || []).includes('rico'), fl: !!S.fl.gk_rico }; });
  ok('nach dem Versiegeln gehört RiCARDO zum Team', !rk && team.fl && (team.party || team.res), (rk || '') + JSON.stringify(team));
  if (team.party) { await q.waitForFunction(() => { const a = __zotik.CMP.find(c => c.id === 'rico'); return a && a.P.kk.ready; }, null, { timeout: 60000 }).catch(() => { }); }
  await q.evaluate(() => { const Z = __zotik; Z.X.noDetour = 1; Z.travel(6); }); await q.waitForTimeout(1500); await skip(q);
  await q.evaluate(() => { const Z = __zotik; Z.travel(33); }); await q.waitForTimeout(1800); for (let k = 0; k < 8; k++) { await skip(q); await q.waitForTimeout(300); }
  const dup = await q.evaluate(() => __zotik.CMP.filter(c => /rico/.test(c.id)).map(c => c.id));
  ok('kein doppelter RiCARDO beim Wiederkommen', !dup.includes('g_rico'), dup.join(','));
  if (BILD && team.party) { await q.evaluate(() => { const Z = __zotik; Z.setLead('rico'); }); await q.waitForTimeout(600);
    for (const [n, x, z, f, cam] of [['ankunft', 0, 8, Math.PI, [0, .2, 9]], ['sendeturm', 0, -66, Math.PI, [0, .32, 14]], ['studio', -38, -14, Math.PI, [0, .22, 11]], ['spielhalle', 44, -30, 0, [Math.PI, .2, 11]], ['buehne', -60, -58, Math.PI * 1.15, [0, .2, 10]], ['tabs', 62, -62, Math.PI, [0, .25, 12]], ['buchturm', -40, -100, Math.PI, [0, .25, 12]], ['acts', 32, -106, Math.PI / 2, [0, .2, 10]], ['rico', 2, -30, 0, [Math.PI, .05, 3.6]]]) {
      await q.evaluate(([x, z, f]) => { const Z = __zotik; window.__near = window.__near || null; Z.pl.x = x; Z.pl.z = z; Z.pl.y = Z.WLD.h(x, z); Z.pl.face = f; for (const c of Z.CMP) { c.x = x + 1.5; c.z = z + 1; } Z.step(1 / 30, 6); }, [x, z, f]);
      await q.evaluate(c => { const Z = __zotik; Z.noRender = false; Z.setCam(c[0] + Z.pl.face, c[1], c[2]); }, cam); await q.waitForTimeout(1800);
      const c = await q.context().newCDPSession(q); const s = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 80 }); fs.writeFileSync(`/tmp/zotik-test/rrw-${n}.jpg`, Buffer.from(s.data, 'base64')); } }
  ok('keine Fehler (zweite Seite)', !q.errs.length, [...new Set(q.errs)].join(' | '));
  console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); process.exit(res.every(Boolean) ? 0 : 1); })().catch(e => { console.log('ABBRUCH', e.message); process.exit(1); });
