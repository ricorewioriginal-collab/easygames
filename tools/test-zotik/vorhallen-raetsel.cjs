// Vorhallen im Lufia-Takt: Rätselnischen (Schiebeblock + Druckplatte mit Rücksetzstein, Werkzeug-Hindernisse) mit Schatz und Rätselzähler,
// Hinweise in drei Stufen, Patrouillen bewegen sich nur, wenn Zotik sich bewegt, betäubte Gegner = Erstschlag (doppelter Schaden).
//   node tools/test-zotik/vorhallen-raetsel.cjs [welt]
const { chromium, ARGS, open, flood, skip, talk, intro } = require('./lib.cjs');
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ args: ARGS }); const p = await open(b); const w = ms => p.waitForTimeout(ms), n = +process.argv[2] || 4;
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.lvl = 30; S.tools = []; });   // ohne Werkzeug: Schiebeblock-Rätsel (geht immer)
  await intro(p);
  await p.evaluate(n => { const Z = __zotik, S = Z.S(); for (let k = 2; k < n; k++) S.cd[k] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; Z.switchWorld(n); }, n); await w(1500); await skip(p);
  // zwei Ebenen ansehen: Ebene 1 (eine Nische) und Ebene 2 (zwei Nischen, eine Kniffelkammer)
  await p.evaluate(n => __zotik.dunEnter(n), n); await w(1500); await skip(p);
  const look = () => p.evaluate(() => { const Z = __zotik; return { f: Z.dun && Z.dun.f, niches: Z.INT.filter(i => /Nischenschatz|Kniffelschatz/.test(i.name)).map(i => i.name), gates: Z.OB.filter(o => o.t === 'gate' && /^v/.test(o.id)).length, obs: Z.OB.filter(o => /^v/.test(o.id)).map(o => o.t) }; });
  let L = await look(); ok(L.f === 1 && L.niches.length >= 1, `Ebene 1: Rätselnische mit Schatz (${L.niches.join(', ')} · ${L.obs.join(',')})`);
  // --- Schiebeblock-Rätsel lösen (Block über die Steuerung schieben); falls es keins gibt, Ebene neu würfeln
  for (let t = 0; t < 6 && !(await p.evaluate(() => __zotik.OB.some(o => o.t === 'block' && /^v/.test(o.id)))); t++) { await p.evaluate(n => { __zotik.dunLeave(false); }, n); await w(1500); await p.evaluate(n => __zotik.dunEnter(n), n); await w(1500); await skip(p); }
  const blk = await p.evaluate(() => { const Z = __zotik, b = Z.OB.find(o => o.t === 'block' && /^v/.test(o.id)); if (!b) return null; const pl = Z.OB.find(o => o.t === 'plate' && o.grp === b.grp); return { b: [b.x, b.z], p: [pl.x, pl.z], grp: b.grp }; });
  ok(!!blk, 'Schiebeblock-Rätsel vorhanden');
  if (blk) {
    // Hinweise in drei Stufen
    await skip(p); const hints = [];
    for (let k = 0; k < 3; k++) { await p.evaluate(() => __zotik.INT.find(i => i.name === 'Verschlossenes Tor').talk()); await w(2500); hints.push(await p.evaluate(() => document.getElementById('dlg').textContent)); await skip(p); }
    ok(new Set(hints).size === 3 && /Druckplatte/.test(hints[0]) && /hinter den Block/.test(hints[2]), 'Tor gibt drei immer deutlichere Hinweise' + (process.env.DBG ? JSON.stringify(hints) : ''));
    const push = async (sign) => p.evaluate(([B, s]) => { const Z = __zotik, dx = B.p[0] - B.b[0], dz = B.p[1] - B.b[1], ax = Math.abs(dx) > Math.abs(dz);
      Z.pl.x = B.b[0] - (ax ? Math.sign(dx) * 1.7 : 0); Z.pl.z = B.b[1] - (ax ? 0 : Math.sign(dz) * 1.7); Z.pl.vx = Z.pl.vz = 0; Z.setCam(0, .5, 9);
      Z.joy.on = true; Z.joy.x = ax ? Math.sign(dx) * s : 0; Z.joy.y = ax ? 0 : Math.sign(dz) * s; }, [blk, sign]);
    const done = () => p.evaluate(g => { const Z = __zotik, gt = Z.OB.find(o => o.t === 'gate' && o.grp === g), b = Z.OB.find(o => o.t === 'block' && o.grp === g); return { gate: !!gt.done, b: [b.x, b.z] }; }, blk.grp);
    let r;
    for (const sg of [1, -1]) { await push(sg); for (let i = 0; i < 20 && !(r = await done()).gate; i++) await w(150); await p.evaluate(() => { __zotik.joy.on = false; __zotik.joy.x = __zotik.joy.y = 0; }); if (r.gate) break;
      // falsch geschoben: Rücksetzstein stellt den Block zurück
      await flood(p); await talk(p, 'Rücksetzstein'); await w(300); const back = await done(); ok(Math.hypot(back.b[0] - blk.b[0], back.b[1] - blk.b[1]) < .1, 'Rücksetzstein stellt den Block zurück'); }
    ok(r && r.gate, 'Block auf der Druckplatte öffnet das Tor');
    const pz0 = await p.evaluate(() => (__zotik.S().lf || {}).pz || 0); await flood(p); await talk(p, 'Nischenschatz'); await w(300); await skip(p);
    const pz1 = await p.evaluate(() => (__zotik.S().lf || {}).pz || 0); ok(pz1 === pz0 + 1, 'Schatz geöffnet, Rätselzähler +1 (' + pz1 + ')');
  }
  // --- Rissmauer mit der Bombe (nur Bombe dabei: Nische ist Rissmauer oder Schiebeblock)
  await p.evaluate(() => { __zotik.S().tools = ['bomb']; });
  for (let t = 0; t < 8 && !(await p.evaluate(() => __zotik.OB.some(o => o.t === 'crack' && /^v/.test(o.id)))); t++) { await p.evaluate(() => __zotik.dunLeave(false)); await w(1500); await p.evaluate(n => __zotik.dunEnter(n), n); await w(1500); await skip(p); }
  const crack = await p.evaluate(() => { const Z = __zotik, o = Z.OB.find(o => o.t === 'crack' && /^v/.test(o.id)); return o ? [o.x, o.z] : null; });
  if (crack) { await p.evaluate(c => { const Z = __zotik; for (const [dx, dz] of [[2.4, 0], [-2.4, 0], [0, 2.4], [0, -2.4]]) if (!Z.pBlocked(c[0] + dx, c[1] + dz)) { Z.pl.x = c[0] + dx; Z.pl.z = c[1] + dz; Z.pl.face = Math.atan2(-dx, -dz); break; } Z.useTool('bomb'); }, crack); await w(2200);
    ok(await p.evaluate(() => __zotik.OB.filter(o => o.t === 'crack' && /^v/.test(o.id)).every(o => o.done)), 'Bombe sprengt die Rissmauer der Nische'); }
  else console.log('     (keine Rissmauer auf dieser Ebene)');
  // --- Patrouille steht, solange Zotik steht
  const still = await p.evaluate(async () => { const Z = __zotik, es = Z.E.filter(e => !e.dead && e.st === 'idle' && Math.hypot(e.x - Z.pl.x, e.z - Z.pl.z) > 14); if (!es.length) return null;
    Z.joy.on = false; Z.joy.x = Z.joy.y = 0; const a = es.map(e => [e.x, e.z]); await new Promise(r => setTimeout(r, 2500)); const moved = es.some((e, i) => Math.hypot(e.x - a[i][0], e.z - a[i][1]) > .05);
    return { n: es.length, moved }; });
  ok(still && !still.moved, 'Patrouillen stehen still, solange Zotik steht (' + JSON.stringify(still) + ')');
  const go = await p.evaluate(async () => { const Z = __zotik, es = Z.E.filter(e => !e.dead && e.st === 'idle'), a = es.map(e => [e.x, e.z]); Z.setCam(0, .5, 9); Z.joy.on = true; Z.joy.x = 1;
    const t0 = performance.now(); while (performance.now() - t0 < 3000) { await new Promise(r => setTimeout(r, 300)); Z.joy.x = -Z.joy.x; } Z.joy.on = false; Z.joy.x = 0; return es.some((e, i) => Math.hypot(e.x - a[i][0], e.z - a[i][1]) > .05); });
  ok(go, 'Patrouillen laufen, sobald Zotik sich bewegt');
  // --- Erstschlag: betäubter, ahnungsloser Gegner nimmt doppelten Schaden
  const fs = await p.evaluate(() => { const Z = __zotik, e = Z.E.find(e => !e.dead && !e.boss); if (!e) return null; e.st = 'idle'; Z.stunOne ? Z.stunOne(e, 2) : null; const hp0 = e.hp; e.first = true; Z.hurtE(e, 10, 0, 0, false); const d1 = hp0 - e.hp; const hp1 = e.hp; Z.hurtE(e, 10, 0, 0, false); return { d1, d2: hp1 - e.hp }; });
  ok(fs && fs.d1 > fs.d2 * 1.5, 'Erstschlag: erster Treffer doppelt (' + JSON.stringify(fs) + ')');
  ok(!p.errs.length, 'keine Fehler ' + [...new Set(p.errs)].join(' | '));
  await b.close(); console.log(fails ? fails + ' Fehler' : 'alles ok'); process.exit(fails ? 1 : 0);
})().catch(e => { console.log('ABBRUCH', e.message.slice(0, 300)); process.exit(1); });
