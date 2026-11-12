// Neue Rätselarten (Farbschalter, Zahlenplatten, Erinnerungspfad, Gewichtsplatten, Mustertafel): mit echten Schritten und Aktionen lösbar, in drei Schwierigkeiten
const { chromium, ARGS, open, intro } = require('./lib.cjs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b); const res = [], w = ms => p.waitForTimeout(ms);
  const ok = (name, pass, info) => { res.push(pass); console.log(`${pass ? 'ok  ' : 'FEHL'} ${name}${info ? ' · ' + info : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); Z.S().stage = 8; for (const e of Z.E) e.dead = true; }); await intro(p);
  let slot = 0;
  for (const kind of ['colors', 'order', 'dark', 'sum', 'pattern']) for (const lv of [1, 5, 10]) { const x0 = 40 + (slot % 3) * 24, z0 = -40 - Math.floor(slot / 3) * 16; slot++;
    const sol = await p.evaluate(([kind, lv, x0, z0]) => { const Z = __zotik; window.__pz = Z.RMS().build(kind, kind === 'colors' ? { x0, x1: x0 + 22, z0, z1: z0 + 3 } : { x0, x1: x0 + 8.8, z0, z1: z0 + 9 }, { lv, R: (() => { let s = lv * 7919 + kind.length * 131; return () => (s = (s * 16807) % 2147483647) / 2147483647; })() }, () => { window.__done = (window.__done || 0) + 1; }); return window.__pz.sol; }, [kind, lv, x0, z0]);
    if (!sol || !sol.length) { ok(`${kind} (Stufe ${lv})`, false, 'kein Lösungsweg'); continue; }
    let err = '';
    /* erst ein falscher Schritt, wo das Rätsel ihn bestraft: darf nicht lösen */
    if (kind === 'order' && sol.length > 2) { await p.evaluate(q => { __zotik.pl.x = q[1]; __zotik.pl.z = q[2]; }, sol[2]); await w(140); await p.evaluate(() => { __zotik.pl.x += 30; }); await w(140); }
    for (const q of sol) { if (await p.evaluate(() => window.__pz.solved)) { err = 'zu früh gelöst'; break; }
      if (q[0] === 'step') { await p.evaluate(q => { __zotik.pl.x = q[1]; __zotik.pl.z = q[2]; }, q); await w(140); }
      else { await p.evaluate(q => { __zotik.pl.x = q[1]; __zotik.pl.z = q[2] + 1.1; }, q); const got = await p.waitForFunction(() => !document.getElementById('prompt').hidden && /Farbe|Weg zeigen/.test(document.getElementById('prompt').textContent), null, { timeout: 5000 }).then(() => true, () => false); if (!got) { err = 'Aktion nicht ansprechbar'; break; } await p.evaluate(() => __zotik.interact()); await w(140); await p.evaluate(() => { __zotik.pl.x += 30; }); await w(140); } }
    await w(200); const solved = await p.evaluate(() => window.__pz.solved);
    ok(`${kind} (Stufe ${lv})`, !err && solved, err || `${sol.length} Schritte`); await p.evaluate(() => { __zotik.pl.x = 0; __zotik.pl.z = 14; }); await w(120); }
  /* in den Werkzeug-Ruinen der Welten 6–10 (jede mit eigenem Rätsel): an Ort und Stelle lösen, das Tor muss aufgehen */
  for (let n = 6; n <= 10; n++) { const sol = await p.evaluate(n => { const Z = __zotik, S = Z.S(); for (let k = 2; k < n; k++) S.cd[k] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; if (Z.ch !== 1) Z.switchWorld(1); Z.switchWorld(n); for (const e of Z.E) e.dead = true; return Z.X.rpz && Z.X.rpz.sol; }, n); await w(400);
    if (!sol) { ok(`Ruine Welt ${n}`, false, 'kein Lösungsweg'); continue; } let err = '';
    for (const q of sol) { if (q[0] === 'step') { await p.evaluate(q => { __zotik.pl.x = q[1]; __zotik.pl.z = q[2]; }, q); await w(140); } else { await p.evaluate(q => { __zotik.pl.x = q[1]; __zotik.pl.z = q[2] + 1.1; }, q); const got = await p.waitForFunction(() => !document.getElementById('prompt').hidden && /Farbe|Weg zeigen/.test(document.getElementById('prompt').textContent), null, { timeout: 5000 }).then(() => true, () => false); if (!got) { err = 'Aktion nicht ansprechbar'; break; } await p.evaluate(() => __zotik.interact()); await w(140); await p.evaluate(() => { __zotik.pl.x += 30; }); await w(140); } }
    await w(300); const guard = await p.evaluate(() => { const g = __zotik.E.find(e => e.rw === 'boss' && !e.dead); if (g) __zotik.killE(g); return !!g; }); await w(200); const r = await p.evaluate(n => ({ solved: __zotik.X.rpz.solved, gate: !!__zotik.S().obst[n + 'rpz'] }), n); ok(`Ruine Welt ${n}`, !err && r.solved && r.gate && guard, err || `${sol.length} Schritte, Wächter ${guard ? 'besiegt' : 'fehlt'}, Tor ${r.gate ? 'offen' : 'zu'}`); }
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 400)); process.exit(1); });
