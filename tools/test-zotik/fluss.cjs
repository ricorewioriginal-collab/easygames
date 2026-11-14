// Rissfluss: Schienen gleiten, Stangen schwingen, Wände entlanglaufen – gesperrt vor Kapitel 4, danach in Kapitelwelt und Märchenwelt
//   node tools/test-zotik/fluss.cjs [bild]
const { chromium, ARGS, open, intro, shot, skip } = require('./lib.cjs');
const BILD = process.argv[2] === 'bild';
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { render: BILD, ctx: { viewport: { width: 960, height: 540 } } }); const res = [], w = ms => p.waitForTimeout(ms);
  const ok = (n, c, i) => { res.push(!!c); console.log(`${c ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.lvl = 10; }); await intro(p); await skip(p);
  const world = async n => { await p.evaluate(n => __zotik.switchWorld(n), n); await w(1800); await skip(p); };
  const rail = () => p.evaluate(async () => { const Z = __zotik, pl = Z.pl, F = Z.FLX(), r = F.rails[0]; if (!r) return { err: 'keine Schiene' };
    const a = r.pts[3], b = r.pts[4]; pl.iframes = 999; pl.x = a.x; pl.z = a.z; pl.y = a.y + .3; pl.air = true; pl.vy = -1; pl.vx = pl.vz = 0; pl.face = Math.atan2(b.x - a.x, b.z - a.z);
    for (let i = 0; i < 3; i++) Z.step(1 / 30, 1); const k = pl.flow && pl.flow.k, s0 = pl.flow && pl.flow.s; let moved = 0, ended = 0;
    for (let i = 0; i < 400; i++) { Z.step(1 / 30, 1); if (pl.flow) moved = Math.max(moved, Math.abs(pl.flow.s - s0)); else { ended = i; break } }
    return { k, f: pl.flow && [pl.flow.s, pl.flow.sp, pl.flow.dir, pl.flow.t], moved: +moved.toFixed(1), len: +r.len.toFixed(1), ended, air: pl.air, vy: +pl.vy.toFixed(1) }; });
  const pole = () => p.evaluate(() => { const Z = __zotik, pl = Z.pl, F = Z.FLX(), q = F.poles[0]; if (!q) return { err: 'keine Stange' };
    pl.x = q.x + 1.2; pl.z = q.z; pl.y = q.y; pl.air = false; pl.vy = 0; pl.vx = pl.vz = 0; Z.jump(); const k = pl.flow && pl.flow.k; for (let i = 0; i < 20; i++) Z.step(1 / 30, 1);
    const turned = pl.flow && Math.abs(pl.flow.a); const r = Math.hypot(pl.x - q.x, pl.z - q.z); Z.jump(); let top = pl.y; for (let i = 0; i < 40; i++) { Z.step(1 / 30, 1); top = Math.max(top, pl.y) }
    return { k, turned: +(turned || 0).toFixed(1), r: +r.toFixed(2), lift: +(top - q.y).toFixed(1), fl: !!pl.flow }; });
  const wall = () => p.evaluate(async () => { const Z = __zotik, pl = Z.pl; let H = null; for (const h of Z.HOUSES) if (h.w > 5) { H = h; break } if (!H) return { err: 'kein Haus' };
    const c = H.c, sn = H.s, o = H.w / 2 + 2.2; pl.x = H.x + o * c; pl.z = H.z - o * sn; pl.y = Z.hgt(pl.x, pl.z); pl.air = false; pl.vx = pl.vz = 0; pl.face = Math.atan2(-c, sn);
    const yaw = Math.atan2(c, -sn); Z.cam(yaw, .3, 9); Z.keys.KeyW = true; Z.keys.Space = true; for (let i = 0; i < 6; i++) Z.step(1 / 30, 1); Z.jump(); let k = null, y0 = pl.y, mx = pl.y, x0 = pl.x, z0 = pl.z, al = 0;
    for (let i = 0; i < 90; i++) { Z.step(1 / 30, 1); if (pl.flow) { k = pl.flow.k; al = Math.max(al, Math.hypot(pl.x - x0, pl.z - z0)) } mx = Math.max(mx, pl.y); } Z.keys.Space = false; Z.keys.KeyW = false;
    return { k, rise: +(mx - y0).toFixed(1), along: +al.toFixed(1), H: [H.w, H.d] }; });
  // vor Kapitel 4: gesperrt
  await world(3);
  const lock = await p.evaluate(() => { const Z = __zotik, pl = Z.pl, r = Z.FLX().rails[0]; if (!r) return { err: 1 }; const a = r.pts[3]; pl.x = a.x; pl.z = a.z; pl.y = a.y + .3; pl.air = true; pl.vy = -1; for (let i = 0; i < 5; i++) Z.step(1 / 30, 1); return { flow: !!pl.flow, rails: Z.FLX().rails.length, poles: Z.FLX().poles.length }; });
  ok('Kapitel 3: Schienen stehen, tragen aber noch nicht', lock.rails >= 1 && !lock.flow, JSON.stringify(lock));
  await p.evaluate(() => { const S = __zotik.S(); S.cd[4] = Object.assign(S.cd[4] || {}, { fin: 1 }); });
  const art = await p.evaluate(() => __zotik.artOn('flow')); ok('Kapitel 4 geschlossen: Rissfluss gelernt', art);
  for (const n of [3, 5, 8]) { await world(n);
    const r = await rail(); ok(`Welt ${n}: auf der Schiene gleiten bis zum Ende`, r.k === 'rail' && r.moved > 8 && r.ended > 0 && r.vy > 3, JSON.stringify(r));
    const q = await pole(); ok(`Welt ${n}: an der Stange schwingen und hochschleudern`, q.k === 'pole' && q.turned > 1.5 && Math.abs(q.r - 1.1) < .25 && q.lift > 2.5 && !q.fl, JSON.stringify(q)); }
  await world(21); { const r = await rail(); ok('Märchenwelt: auf der Schiene gleiten', r.k === 'rail' && r.moved > 8 && r.ended > 0, JSON.stringify(r)); const q = await pole(); ok('Märchenwelt: Stange schwingen', q.k === 'pole' && q.lift > 2.5, JSON.stringify(q)); }
  if (BILD) { await p.evaluate(() => { const Z = __zotik, pl = Z.pl, r = Z.FLX().rails[0], a = r.pts[5], b = r.pts[6]; pl.x = a.x; pl.z = a.z; pl.y = a.y + .3; pl.air = true; pl.vy = -1; Z.keys.Space = false; for (let i = 0; i < 4; i++) Z.step(1 / 30, 1); Z.cam(Math.atan2(a.x - b.x, a.z - b.z) + .9, .22, 8); }); await shot(p, 'fluss-schiene'); }
  await world(4); { const m = await wall(); ok('Wandlauf: an der Hauswand entlang und nach oben', m.k === 'wall' && m.rise > 1.5 && m.along > 1.2, JSON.stringify(m)); if (BILD) await shot(p, 'fluss-wand'); }
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); process.exit(res.every(Boolean) ? 0 : 1); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 300)); process.exit(1); });
