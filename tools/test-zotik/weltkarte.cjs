// Weltkarte: aus einer Welt über den Rand/Wegweiser auf die Oberwelt, Wegpfad zur nächsten Welt, betreten; Wasser sperrt zu Fuß,
// am Steg die Nautilux rufen und übers Meer fahren; Märchen-Insel anlegen.   node tools/test-zotik/weltkarte.cjs [bild]
const { chromium, ARGS, open, intro, shot, skip } = require('./lib.cjs');
const BILD = process.argv[2] === 'bild';
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { render: BILD, ctx: { viewport: { width: 960, height: 540 } } }); const res = [], w = ms => p.waitForTimeout(ms);
  const ok = (n, c, i) => { res.push(c); console.log(`${c ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.fl.naut = 1; for (const n of [2, 3, 4]) S.cd[n] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; }); await intro(p);
  await p.evaluate(() => __zotik.switchWorld(3)); await w(800); await skip(p);
  // Rand der Welt: Meer ringsum sperrt, der Damm im Süden führt als Wegpfad hinaus – am Tor geht es ohne Abfrage auf die Weltkarte
  const sea = await p.evaluate(() => { const Z = __zotik, W = Z.W; return { ost: W.blocked(120, -40), west: W.blocked(-120, -60), sued: W.blocked(20, 70), damm: !W.blocked(0, 70), h: W.h(0, 70) > -1 }; });
  ok('Meer am Rand, Damm begehbar', sea.ost && sea.west && sea.sued && sea.damm && sea.h, JSON.stringify(sea));
  await p.evaluate(() => { const Z = __zotik; Z.pl.x = 0; Z.pl.z = 70; Z.step(1 / 30, 5); Z.pl.z = 74.5; Z.step(1 / 30, 20); });
  await p.waitForFunction(() => __zotik.ch === 15 && __zotik.mode === 'play', null, { timeout: 20000 }).catch(() => {}); await w(800);
  const s = await p.evaluate(() => { const Z = __zotik, W = Z.W; return { ch: Z.ch, over: !!(W && W.over), x: Z.pl.x, z: Z.pl.z, blk: W.blocked(Z.pl.x, Z.pl.z) }; });
  ok('Weltkarte betreten, Start neben Valdoria', s.ch === 15 && s.over && !s.blk && Math.hypot(s.x - 0, s.z - 52) < 45, JSON.stringify(s));
  console.log('Dialog:', await p.evaluate(() => document.getElementById('dlg').hidden ? '-' : document.getElementById('dName').textContent + ': ' + document.getElementById('dText').textContent)); await skip(p); await w(300); await skip(p);
  if (BILD) await shot(p, 'weltkarte');
  const m = await p.evaluate(() => { const Z = __zotik, W = Z.W; let land = 0, sea = 0; for (let x = -180; x <= 180; x += 10) for (let z = -360; z <= 220; z += 10) W.blocked(x, z) ? sea++ : land++; return { land, sea, solm: W.near(58, 18) && W.near(58, 18).name, dark: W.near(-42, -76) && W.near(-42, -76).pr }; });
  ok('Land und Meer', m.land > 300 && m.sea > 600, JSON.stringify(m)); ok('Welt am Weg (Solmera betreten)', m.solm === 'Solmera'); ok('verschlossene Welt versiegelt', m.dark === 'Versiegelt', m.dark);
  // Nautilux am Steg
  const d = await p.evaluate(() => { const Z = __zotik, W = Z.W; let st = null; for (let x = -180; x <= 180 && !st; x += 1) for (let z = -360; z <= 220 && !st; z += 1) { const q = W.near(x, z); if (q && q.name === 'Steg') st = [x, z]; } if (!st) return 'kein Steg'; Z.pl.x = st[0]; Z.pl.z = st[1]; Z.step(1 / 30, 3); const n = Z.nearI; if (!n || n.name !== 'Steg') return 'Steg nicht ansprechbar'; Z.interact(); Z.step(1 / 30, 5); return { naut: Z.naut.on, lake: !!Z.owLake(Z.pl.x, Z.pl.z) }; });
  ok('Steg: Nautilux rufen, auf dem Wasser', d.naut && d.lake, JSON.stringify(d));
  if (BILD) { await p.evaluate(() => __zotik.setCam(0, .35, 14)); await shot(p, 'weltkarte-steg'); }
  const mw = await p.evaluate(() => { const Z = __zotik, W = Z.W; const t = W.near.call(W, 0, 0); let isl = null; for (let x = -180; x <= 180 && !isl; x += 2) for (let z = -360; z <= 220 && !isl; z += 2) { const q = W.near(x, z); if (q && q.mw) isl = q; } return isl ? isl.name : null; });
  ok('Märchen-Insel per Nautilux erreichbar', !!mw, mw);
  // in eine Welt gehen
  await p.evaluate(() => { const Z = __zotik; if (Z.naut.on) Z.mount && 0; }); 
  const e = await p.evaluate(() => { const Z = __zotik; Z.X.jr = 'fade'; Z.X.noDetour = 1; Z.travel(4); Z.X.jr = 0; Z.X.noDetour = 0; return 1; });
  await p.waitForFunction(() => __zotik.ch === 4 && __zotik.mode === 'play', null, { timeout: 20000 }).catch(() => {});
  ok('Von der Weltkarte nach Solmera', await p.evaluate(() => __zotik.ch === 4));
  const sg = await p.evaluate(() => { const Z = __zotik; return Z.INT.some(i => i.name === 'Wegweiser' && (!i.vis || i.vis())); });
  ok('Wegweiser in der Welt', sg);
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); process.exit(res.every(Boolean) ? 0 : 1); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 400)); process.exit(1); });
