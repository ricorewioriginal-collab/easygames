// Verfolgerkamera und Zielerfassung wie Kingdom Hearts: Kamera folgt beim Laufen, Rücksetzen, Ziel vor der Kamera, Ziel wechseln (Seite), Bildausschnitt, Nachfolger nach Sieg.
//   node tools/test-zotik/kamera.cjs [bild]  – mit „bild“ Fotos nach /tmp/zotik-test/kamera-*.jpg
const { chromium, ARGS, open, intro, shot } = require('./lib.cjs');
const BILD = process.argv[2] === 'bild';
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { render: BILD, ctx: { viewport: { width: 960, height: 540 } } }); const res = [];
  const ok = (n, c, i) => { res.push(c); console.log(`${c ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  const A = (a, b) => { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return Math.abs(d); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; for (let n = 2; n <= 10; n++) S.cd[n] = { fin: 1 }; }); await intro(p);
  await p.evaluate(() => { const Z = __zotik; Z.switchWorld(2); for (const e of Z.E) if (!e.dead) { e.dead = true; e.m.root.visible = false; } Z.pl.face = 0; Z.setCam(Math.PI, .42, 7.6); Z.step(1 / 30, 20); });
  // Rücksetzen ohne Gegner
  const rc = await p.evaluate(() => { const Z = __zotik; Z.pl.face = 1.2; Z.setCam(Z.pl.face + Math.PI + 1.6, .9, 7.6); Z.lockCycle(); Z.step(1 / 30, 25); const c = Z.camInfo(); return { y: c.yaw, want: Z.pl.face + Math.PI, p: c.pitch, lock: !!Z.lock }; });
  ok('Ziel-Taste ohne Gegner: Kamera hinter Zotik', A(rc.y, rc.want) < .15 && Math.abs(rc.p - .42) < .1 && !rc.lock, JSON.stringify(rc));
  // Verfolgen: seitlich laufen dreht die Kamera mit, zurücklaufen nicht
  await p.evaluate(() => { const Z = __zotik; Z.pl.face = 0; Z.setCam(Math.PI, .42, 7.6); Z.step(1 / 30, 35); });
  const y0 = await p.evaluate(() => __zotik.camInfo().yaw); await p.keyboard.down('KeyD'); await p.evaluate(() => __zotik.step(1 / 30, 75)); await p.keyboard.up('KeyD');
  const y1 = await p.evaluate(() => { const Z = __zotik; Z.step(1 / 30, 10); return Z.camInfo().yaw; });
  ok('Kamera folgt beim seitlichen Laufen', A(y0, y1) > .35, (A(y0, y1)).toFixed(2) + ' rad');
  await p.evaluate(() => { const Z = __zotik; Z.setCam(Z.camInfo().yaw, .42, 7.6); Z.step(1 / 30, 35); }); const y2 = await p.evaluate(() => __zotik.camInfo().yaw);
  await p.keyboard.down('KeyS'); await p.evaluate(() => __zotik.step(1 / 30, 60)); await p.keyboard.up('KeyS'); const y3 = await p.evaluate(() => __zotik.camInfo().yaw);
  ok('Zurücklaufen dreht die Kamera nicht', A(y2, y3) < .1, A(y2, y3).toFixed(3) + ' rad');
  // Zielerfassung
  const lk = await p.evaluate(() => { const Z = __zotik; Z.pl.face = 0; Z.setCam(Math.PI, .42, 7.6); Z.step(1 / 30, 5); const fx = Math.sin(0), fz = Math.cos(0); const L = {};
    const mk = (n, dx, dz) => { const e = Z.spawnEnemy('wolf', Z.pl.x + dx, Z.pl.z + dz); e.max = e.hp = 1e6; e.cd = 99; e.st = 'rec'; e.rt = 999; L[n] = e; };
    mk('vorn', 0, 9); mk('hinten', 0, -3.5); mk('rechts', -6, 6); mk('links', 6, 6); window.__L = L; Z.step(1 / 30, 2);
    Z.lockCycle(); return Object.keys(L).find(k => L[k] === Z.lock); });
  ok('Erfasst das Ziel vor der Kamera (nicht das nächste dahinter)', lk === 'vorn', lk);
  const sd = await p.evaluate(() => { const Z = __zotik, L = __L, n = () => Object.keys(L).find(k => L[k] === Z.lock); Z.lockSide(1); const a = n(); Z.lockSide(-1); const b = n(); Z.lockSide(-1); const c = n(); return [a, b, c]; });
  ok('Seitlich wechseln: rechts, zurück, links', sd[0] === 'rechts' && sd[1] === 'vorn' && sd[2] === 'links', sd.join(' → '));
  const fr = await p.evaluate(() => { const Z = __zotik, L = __L; Z.lockCycle(); Z.lockCycle(); while (Z.lock !== L.vorn) Z.lockSide(1); Z.setCam(Math.PI / 2, .42, 7.6); Z.step(1 / 30, 60); const c = Z.camInfo(), t = Z.lock;
    const want = Math.atan2(Z.pl.x - t.x, Z.pl.z - t.z), mid = Math.hypot(c.tx - Z.pl.x, c.tz - Z.pl.z), onLine = Math.abs((c.tx - Z.pl.x) * (t.z - Z.pl.z) - (c.tz - Z.pl.z) * (t.x - Z.pl.x)) / Math.hypot(t.x - Z.pl.x, t.z - Z.pl.z);
    return { dy: Math.abs(((c.yaw - want + Math.PI * 3) % (Math.PI * 2)) - Math.PI), mid, onLine, face: Math.abs(((Z.pl.face - Math.atan2(t.x - Z.pl.x, t.z - Z.pl.z) + Math.PI * 3) % (Math.PI * 2)) - Math.PI) }; });
  ok('Kamera hinter Zotik mit Blick aufs Ziel', fr.dy < .15, fr.dy.toFixed(3));
  ok('Bildmitte zwischen Zotik und Ziel', fr.mid > 1 && fr.mid < 4.5 && fr.onLine < .5, JSON.stringify(fr));
  ok('Zotik schaut das Ziel im Stand an', fr.face < .2, fr.face.toFixed(3));
  if (BILD) await shot(p, 'kamera-lockon');
  const nx = await p.evaluate(() => { const Z = __zotik, L = __L, e = L.vorn; Z.killE ? Z.killE(e) : (e.dead = true); e.dead = true; Z.step(1 / 30, 3); return Object.keys(L).find(k => L[k] === Z.lock) || null; });
  ok('Ziel besiegt: nächstes Ziel wird erfasst', nx && nx !== 'vorn', nx);
  const off = await p.evaluate(() => { const Z = __zotik; for (const k in __L) { __L[k].dead = true; } Z.step(1 / 30, 3); return Z.lock; });
  ok('Keine Gegner mehr: Zielerfassung aus', !off);
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); process.exit(res.every(Boolean) ? 0 : 1); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 400)); process.exit(1); });
