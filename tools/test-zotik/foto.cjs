// Erinnerungslinse (Fotomodus) und Forscherzeichen: Freischaltung, 5 Zeichen je Welt, Echo nur durch die Linse, Foto, Filter, Pose, Menü
//   node tools/test-zotik/foto.cjs
const { chromium, ARGS, open, intro } = require('./lib.cjs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, {}); const res = [];
  const ok = (name, pass, info) => { res.push(pass); console.log(`${pass ? 'ok  ' : 'FEHL'} ${name}${info ? ' · ' + info : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; }); await intro(p);
  const lock = await p.evaluate(() => { const Z = __zotik; Z.S().lens = 0; return { r: Z.FOTO().open(), on: Z.FOTO().on, html: /🔒/.test(Z.EMB().html([2])) }; });
  ok('Vor Kapitel 2 gesperrt', !lock.r && !lock.on && lock.html, JSON.stringify(lock));
  await p.evaluate(() => { const Z = __zotik, S = Z.S(); S.cd[2] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; Z.switchWorld(2); }); await p.waitForTimeout(500);
  const un = await p.evaluate(() => { const Z = __zotik; Z.EMB().unlock(); const W = Z.EMB().W; return { lens: Z.S().lens, n: W && W.list.length, echo: W && W.list.filter(o => o.echo).length, hid: W && W.list.filter(o => o.echo).every(o => !o.m.visible) }; });
  ok('Nach Kapitel 2 frei, 5 Zeichen in Elaris, Echo unsichtbar', un.lens === 1 && un.n === 5 && un.echo === 1 && un.hid, JSON.stringify(un));
  const co = await p.evaluate(() => { const Z = __zotik, W = Z.EMB().W, o = W.list.find(q => !q.echo), a = Z.S().shards; Z.pl.x = o.x; Z.pl.z = o.z; Z.pl.y = Z.hgt(o.x, o.z); Z.step(1 / 30, 2); return { got: !!(Z.S().emb[2] & (1 << o.i)), gain: Z.S().shards - a, cnt: Z.EMB().count(2) }; });
  ok('Zeichen einsammeln gibt Splitter und Stand', co.got && co.gain > 0 && co.cnt === 1, JSON.stringify(co));
  const op = await p.evaluate(() => { const Z = __zotik, e = Z.EMB().W.list.find(q => q.echo); Z.pl.x = e.x + 4; Z.pl.z = e.z + 4; Z.pl.y = Z.hgt(Z.pl.x, Z.pl.z); const r = Z.FOTO().open(); Z.step(1 / 30, 1); return { r, on: Z.FOTO().on, body: document.body.classList.contains('photo'), root: !!document.getElementById('photo') }; });
  ok('Linse öffnen', op.r && op.on && op.body && op.root, JSON.stringify(op));
  await p.waitForTimeout(300);
  const ec = await p.evaluate(() => { const Z = __zotik, e = Z.EMB().W.list.find(q => q.echo); return { vis: e.m.visible }; });
  ok('Echo-Zeichen nur im Fotomodus sichtbar', ec.vis, JSON.stringify(ec));
  const fl = await p.evaluate(() => { const b = document.querySelector('#photo [data-k=f]'); b.click(); b.click(); return { f: document.getElementById('cv').style.filter, t: b.textContent }; });
  ok('Filter wechseln', fl.f !== '' && /Kühl|Warm|Schwarz/.test(fl.t), JSON.stringify(fl));
  const po = await p.evaluate(async () => { const Z = __zotik, b = document.querySelector('#photo [data-k=p]'); b.click(); for (let i = 0; i < 20; i++) Z.FOTO().tick(1 / 30); return { t: b.textContent }; });
  ok('Pose wählen', /Winken|Jubeln/.test(po.t), JSON.stringify(po));
  const sh = await p.evaluate(async () => { const Z = __zotik, e = Z.EMB().W.list.find(q => q.echo), a = Z.S().foto | 0; for (let i = 0; i < 5; i++) Z.FOTO().tick(1 / 30); document.querySelector('#photo [data-k=s]').click(); for (let i = 0; i < 40 && document.getElementById('phRes').hidden; i++) await new Promise(r => setTimeout(r, 100)); const img = document.querySelector('#phRes img'); return { res: !document.getElementById('phRes').hidden, src: /^blob:/.test(img.src), foto: (Z.S().foto | 0) - a, echo: e.got }; });
  ok('Foto aufnehmen: Ergebnis, Zähler, Echo eingesammelt', sh.res && sh.src && sh.foto === 1 && sh.echo, JSON.stringify(sh));
  const cl = await p.evaluate(() => { document.querySelector('#phRes [data-r=c]').click(); document.querySelector('#photo [data-k=x]').click(); const Z = __zotik; return { on: Z.FOTO().on, body: document.body.classList.contains('photo'), f: document.getElementById('cv').style.filter, res: document.getElementById('phRes').hidden }; });
  ok('Schließen räumt auf', !cl.on && !cl.body && cl.f === '' && cl.res, JSON.stringify(cl));
  const mn = await p.evaluate(() => { const Z = __zotik; Z.toggleMenu(true, 'lens'); const t = document.getElementById('mcont').textContent; const b = !!document.getElementById('fotoGo'); Z.toggleMenu(false); return { b, t: /Forscherzeichen/.test(t) && /Elaris|Welt/.test(t) }; });
  ok('Menü-Reiter Linse mit Fortschritt', mn.b && mn.t, JSON.stringify(mn));
  const ke = await p.evaluate(() => { const Z = __zotik; dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP', bubbles: true })); const a = Z.FOTO().on; dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', bubbles: true })); return { a, b: Z.FOTO().on }; });
  ok('Taste P öffnet, Esc schließt', ke.a && !ke.b, JSON.stringify(ke));
  const full = await p.evaluate(() => { const Z = __zotik, W = Z.EMB().W, a = Z.S().shards, k = Z.S().mat && Z.S().mat.kern || 0; for (const o of W.list) { if (o.got) continue; if (o.echo) { Z.pl.x = o.x; Z.pl.z = o.z; Z.pl.y = Z.hgt(o.x, o.z); Z.FOTO().open(); Z.step(1 / 30, 1); Z.FOTO().tick(1 / 30); Z.EMB().shot(Z.camera); Z.FOTO().close(); } else { Z.pl.x = o.x; Z.pl.z = o.z; Z.pl.y = Z.hgt(o.x, o.z); Z.step(1 / 30, 2) } } return { cnt: Z.EMB().count(2), kern: (Z.S().mat.kern || 0) - k, ph: Z.S().items.phoenix >= 1 }; });
  ok('Alle fünf: Kernsplitter und Phönixtrank', full.cnt === 5 && full.kern === 1 && full.ph, JSON.stringify(full));
  let all = true; for (const n of [3, 4, 5, 6, 7, 8, 9, 10, 21, 22, 23, 24, 25, 26, 27, 33]) { await p.evaluate(n => __zotik.switchWorld(n), n); await p.waitForTimeout(150); const w = await p.evaluate(() => { const Z = __zotik, W = Z.EMB().W; return W ? { n: W.n, l: W.list.length, bad: W.list.filter(o => Z.pBlocked(o.x, o.z)).length } : null }); if (!w || w.l !== 5 || w.bad) { all = false; console.log('  Welt', n, JSON.stringify(w)) } }
  ok('Alle Welten 3–10, 21–27, 33: 5 Zeichen an freien Stellen', all);
  ok('keine Fehler', !p.errs.length, p.errs.join(' | '));
  console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); process.exit(res.every(Boolean) ? 0 : 1); })();
