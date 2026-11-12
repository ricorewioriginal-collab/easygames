// Reisearten zwischen den Welten: Nautilux-Flug, Seereise übers Weltmeer, Wanderung zu Fuß, sofort
//   node tools/test-zotik/reise.cjs        Bilder mit SHOTS=1 nach <tmp>/zotik-test/
const { chromium, ARGS, open, intro, shot } = require('./lib.cjs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { render: 1, ctx: { viewport: { width: 960, height: 540 } } }); const res = [], w = ms => p.waitForTimeout(ms);
  const ok = (name, pass, info) => { res.push(pass); console.log(`${pass ? 'ok  ' : 'FEHL'} ${name}${info ? ' · ' + info : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.fl.naut = 1; for (const n of [2, 3, 4]) S.cd[n] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; }); await intro(p);
  await p.evaluate(() => __zotik.switchWorld(3)); await w(3000); await p.evaluate(async () => { for (let i = 0; i < 60 && !document.getElementById('dlg').hidden; i++) { document.getElementById('dlg').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); await new Promise(r => setTimeout(r, 40)); } });
  const pick = async (t) => p.evaluate(t => { const d = document.getElementById('dlg'), O = document.getElementById('dOpts'); for (let k = 0; k < 60 && (O.hidden || !O.children.length); k++) { d.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); __zotik.step(1 / 30, 2); } const bs = [...O.querySelectorAll('button')]; const x = bs.find(q => q.textContent.includes(t)); if (x) x.click(); return bs.map(q => q.textContent); }, t);
  for (const [lab, med, n] of [['Weltmeer', 'sea', 4], ['Zu Fuß', 'walk', 2]]) {
    await p.evaluate(n => { const Z = __zotik; Z.X.noDetour = 1; Z.travel(n); Z.X.noDetour = 0; }, n); const opts = await pick(lab); await p.waitForFunction(() => __zotik.mode === 'flight', null, { timeout: 15000 }).catch(() => {});
    const s = await p.evaluate(() => ({ mode: __zotik.mode }));
    ok(`Reise wählen: ${lab}`, opts.length >= 3 && s.mode === 'flight', JSON.stringify([opts.length, s]));
    await w(med === 'sea' ? 6000 : 8000); if (process.env.SHOTS) await shot(p, 'reise-' + med);
    await p.evaluate(() => { const e = new KeyboardEvent('keydown', { code: 'Escape', bubbles: true }); dispatchEvent(e); document.dispatchEvent(e); });
    await p.waitForFunction(n => __zotik.ch === n && __zotik.mode === 'play', n, { timeout: 60000 }).catch(() => {});
    ok(`Ankunft nach ${lab}`, await p.evaluate(n => __zotik.ch === n && __zotik.mode === 'play', n));
    await w(1500); await p.evaluate(async () => { for (let i = 0; i < 40 && !document.getElementById('dlg').hidden; i++) { document.getElementById('dlg').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); await new Promise(r => setTimeout(r, 40)); } });
  }
  ok('keine Fehler', !p.errs.length, p.errs.join(' | '));
  console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); process.exit(res.every(Boolean) ? 0 : 1); })();
