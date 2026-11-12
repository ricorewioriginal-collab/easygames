// Eigene Zauber je Figur (Fähigkeit 2 als Anführer), Element-Treffer und Weltwaffen
const { chromium, ARGS, open, intro } = require('./lib.cjs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b); const res = [], w = ms => p.waitForTimeout(ms);
  const ok = (name, pass, info) => { res.push(pass); console.log(`${pass ? 'ok  ' : 'FEHL'} ${name}${info ? ' · ' + info : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); Z.S().stage = 8; for (const e of Z.E) e.dead = true; }); await intro(p);
  const ids = ['lyra', 'nia', 'rovan', 'kael', 'mirael', 'toren', 'eryn', 'aera', 'prof', 'mira'];
  await p.evaluate(ids => { const Z = __zotik, S = Z.S(); Z.switchWorld(2); for (const e of Z.E) e.dead = true; S.party = []; for (const id of ids) { S.party.push(id); } }, ids);
  await p.evaluate(() => { const Z = __zotik; Z.CMP.length = 0; }); 
  for (const id of ids) {
    const r = await p.evaluate(id => { const Z = __zotik, S = Z.S(); if (!Z.CMP.some(c => c.id === id)) { S.party = S.party.filter(x => x !== id); Z.joinParty(id); }
      Z.setLead(id); for (const e of Z.E) if (!e.dead) { e.dead = true; e.m.root.visible = false; } Z.pl.face = 0; Z.pl.cd.s2 = 0; S.mp = 999; S.hp = Z.maxHp();
      const L = []; for (const dz of [2.5, 5, 8]) { const e = Z.spawnEnemy('wolf', Z.pl.x, Z.pl.z + dz); e.max = e.hp = 1e6; e.cd = 99; e.st = 'chase'; L.push(e); } window.__L = L; Z.lockCycle && 0;
      const hp = S.hp; Z.skill2(); return { mp: S.mp }; }, id); await w(900);
    const q = await p.evaluate(id => { const Z = __zotik, S = Z.S(); const L = window.__L; return { hit: L.filter(e => e.hp < 1e6).length, mpUsed: 999 - S.mp > 0 || id === 'kael' }; }, id);
    const healer = id === 'mira';
    ok(`${id}: ${await p.evaluate(id => __zotik.CSK2[id].n, id)}`, q.mpUsed && (healer || q.hit > 0), `${q.hit} Treffer`); }
  const ww = await p.evaluate(() => { const Z = __zotik, S = Z.S(); S.cd[10] = { st: 7, fin: 1 }; const w = Z.cwOf('lyra'); return { w: w && w.n }; }); await w(400);
  const fl = await p.evaluate(() => !!__zotik.S().fl.cw_lyra);
  ok('Weltwaffe nach Elyndra', ww.w === 'Stab der Morgenröte' && fl, ww.w);
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 400)); process.exit(1); });
