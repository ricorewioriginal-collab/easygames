// Figuren selbst steuern: Lyra (Fernkampf) und Rovan (Nahkampf) übernehmen, Zotik ist unsichtbar, Angriffe treffen, zurück zu Zotik
const { chromium, ARGS, open, intro } = require('./lib.cjs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b); const res = [], w = ms => p.waitForTimeout(ms);
  const ok = (name, pass, info) => { res.push(pass); console.log(`${pass ? 'ok  ' : 'FEHL'} ${name}${info ? ' · ' + info : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); Z.S().stage = 8; for (const e of Z.E) e.dead = true; }); await intro(p);
  await p.evaluate(() => { const Z = __zotik; for (const id of ['lyra', 'nia', 'rovan']) Z.joinParty(id); Z.switchWorld(2); for (const e of Z.E) e.dead = true; }); await w(600);
  for (const id of ['lyra', 'rovan']) {
    const r0 = await p.evaluate(id => { const Z = __zotik; Z.setLead(id); const pl = Z.pl; const e = Z.spawnEnemy('wolf', pl.x, pl.z + (id === 'lyra' ? 6 : 1.8)); e.st = 'chase'; e.max = e.hp = 1e6; e.cd = 99; window.__e = e; window.__hp0 = e.hp; return { fox: Z.camera && true }; }, id); await w(200);
    for (let k = 0; k < 6; k++) { await p.evaluate(() => { const Z = __zotik, e = window.__e; Z.pl.face = Math.atan2(e.x - Z.pl.x, e.z - Z.pl.z); Z.startAttack(); }); await w(450); }
    const r = await p.evaluate(id => { const Z = __zotik, a = Z.CMP.find(c => c.id === id); return { lead: Z.S().lead, fox: Z.fox.root.visible, name: document.querySelector('#pname span').textContent, vis: a.P.root.visible, dx: Math.hypot(a.x - Z.pl.x, a.z - Z.pl.z), hit: window.__e.hp < window.__hp0 || window.__e.dead }; }, id);
    if (id === 'lyra') { await p.evaluate(() => __zotik.setCam(__zotik.pl.face + Math.PI, .25, 5)); await w(300); } if (id === 'lyra') await p.screenshot({ path: '/tmp/zotik-test/steuern-lyra.png' });
    ok(`${id} steuern`, r.lead === id && !r.fox && r.vis && r.dx < .01 && r.hit, JSON.stringify(r)); await p.evaluate(() => { window.__e.dead = true; }); }
  const back = await p.evaluate(() => { const Z = __zotik; Z.setLead(null); return { lead: Z.S().lead || null }; }); await w(200);
  ok('zurück zu Zotik', back.lead === null);
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 400)); process.exit(1); });
