// KayKit-Figuren (CC0): Skelett-Gegner laden, bewegen sich mit Skelett-Animationen, sterben mit Animation; Abenteurer-NPCs; Dungeon-Requisiten.
//   node tools/test-zotik/kaykit.cjs [bild]  – mit „bild“ Fotos nach /tmp/zotik-test/kk-*.jpg
const { chromium, ARGS, open, intro } = require('./lib.cjs');
const BILD = process.argv[2] === 'bild', fs = require('fs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { render: BILD, ctx: { viewport: { width: 960, height: 540 } } }); const res = [];
  const ok = (n, c, i) => { res.push(c); console.log(`${c ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  const shot = async n => { if (!BILD) return; await p.evaluate(() => { __zotik.noRender = false; }); await p.waitForTimeout(300); const c = await p.context().newCDPSession(p); const s = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 72 }); fs.mkdirSync('/tmp/zotik-test', { recursive: true }); fs.writeFileSync('/tmp/zotik-test/kk-' + n + '.jpg', Buffer.from(s.data, 'base64')); await c.detach(); await p.evaluate(() => { __zotik.noRender = true; }); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; for (let n = 2; n <= 10; n++) S.cd[n] = { fin: 1 }; }); await intro(p);
  await p.evaluate(() => { const Z = __zotik; Z.switchWorld(2); for (const e of Z.E) if (!e.dead) { e.dead = true; e.m.root.visible = false; }
    const L = []; [['skw', 0, 6], ['skr', 2.4, 7], ['skm', -2.4, 7], ['skn', 1.2, 4.5]].forEach(([k, dx, dz]) => { const e = Z.spawnEnemy(k, Z.pl.x + dx, Z.pl.z + dz); e.max = e.hp = 1e6; e.cd = 99; e.face = Math.PI; e.st = 'rec'; e.rt = 999; L.push(e); }); window.__L = L; Z.pl.face = 0; Z.setCam(Math.PI, .35, 8); });
  await p.waitForFunction(() => __L.every(e => e.m.kk.ready), null, { timeout: 90000 }).catch(() => { });
  ok('Skelette geladen', await p.evaluate(() => __L.every(e => e.m.kk.ready)), await p.evaluate(() => __L.map(e => e.d.name + ':' + e.m.kk.ready).join(', ')));
  ok('Größe gesetzt', await p.evaluate(() => __L.every(e => { const s = e.m.root.children[0].scale.x; return s > .05 && s < 5; })));
  const r0 = await p.evaluate(() => { const b = __L[0].m.kk.bones['upperlegl']; return b.quaternion.toArray().join(); });
  await p.evaluate(() => { for (const e of __L) { e.st = 'chase'; } __zotik.step(1 / 30, 20); });
  ok('Animation läuft', await p.evaluate(r0 => __L[0].m.kk.bones['upperlegl'].quaternion.toArray().join() !== r0 && __L[0].m.kk.cur !== '', r0), await p.evaluate(() => __L.map(e => e.m.kk.cur).join(', ')));
  await p.evaluate(() => { for (const e of __L) { e.st = 'rec'; e.rt = 999; } __zotik.step(1 / 30, 10); }); await shot('skelette');
  await p.evaluate(() => { const Z = __zotik, e = __L[0]; e.hp = 1; Z.hurtE ? Z.hurtE(e, 50, 0, 0) : (e.dead = true); Z.step(1 / 30, 12); });
  ok('Sterbe-Animation', await p.evaluate(() => __L[0].dead && __L[0].m.kk.cur === 'Death_A' && __L[0].m.root.visible), await p.evaluate(() => __L[0].dead + ' ' + __L[0].m.kk.cur));
  await p.evaluate(() => __zotik.step(1 / 30, 80));
  ok('danach verschwunden', await p.evaluate(() => !__L[0].m.root.visible));
  const camp = await p.evaluate(() => { const Z = __zotik; Z.switchWorld(3); return Z.NPC ? Z.NPC.filter(n => n.id.startsWith('adv3')).length : -1; });
  ok('Abenteurerlager in der Welt', camp === 3, camp + ' Abenteurer');
  await p.waitForFunction(() => __zotik.NPC.filter(n => n.id.startsWith('adv3')).every(n => n.P.kk.ready), null, { timeout: 90000 }).catch(() => { });
  const a = await p.evaluate(() => { const Z = __zotik, n = Z.NPC.find(q => q.id === 'adv30'); Z.pl.x = n.x + Math.sin(n.face) * 3; Z.pl.z = n.z + Math.cos(n.face) * 3; Z.pl.face = Math.atan2(n.x - Z.pl.x, n.z - Z.pl.z); Z.setCam(Z.pl.face + Math.PI, .3, 7); Z.step(1 / 30, 10);
    const w = n.P.kk.bones.handslotr; return { ok: n.P.kk.ready && w.children.length > 0, cur: n.P.kk.cur }; });
  ok('Abenteurer mit Waffe und Animation', a.ok && a.cur === 'Idle_A', JSON.stringify(a)); await shot('lager');
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); process.exit(res.every(Boolean) ? 0 : 1); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 400)); process.exit(1); });
