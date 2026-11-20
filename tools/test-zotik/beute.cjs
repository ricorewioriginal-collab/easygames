// Beute-Kugeln und Schwebe-Kombo: besiegte Gegner lassen Lebens- und Magiekugeln fallen, Beute fliegt aus bis zu 10 m auf Zotik zu; Hiebe in der Luft halten Zotik in der Schwebe (höchstens 4 je Sprung).
//   node tools/test-zotik/beute.cjs [bild]
const { chromium, ARGS, open, intro, shot } = require('./lib.cjs');
const BILD = process.argv[2] === 'bild';
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { render: BILD, ctx: { viewport: { width: 960, height: 540 } } }); let fail = 0;
  const ok = (n, c, i) => { if (!c) fail++; console.log(`${c ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; for (let n = 2; n <= 10; n++) S.cd[n] = { fin: 1 }; }); await intro(p);
  await p.evaluate(() => { const Z = __zotik; Z.switchWorld(2); Z.step(1 / 30, 5); for (const e of Z.E) if (!e.dead) { e.dead = true; e.m.root.visible = false; } let x = 0, z = 14; for (let k = 0; k < 40 && (Z.pBlocked(x, z) || Z.pBlocked(x, z + 2)); k++) z += 1; Z.pl.x = x; Z.pl.z = z; Z.pl.y = Z.hgt(x, z); Z.pl.face = 0; Z.setCam(Math.PI + .7, .4, 7.5); window.__sp = (dz) => { const e = Z.spawnEnemy('wolf', Z.pl.x, Z.pl.z + (dz || 1.8)); e.st = 'chase'; return e; }; window.__leer = () => { for (const d of Z.drops) d.m.parent && d.m.parent.remove(d.m); Z.drops.length = 0; }; });
  // Gegner besiegen: Kugeln fallen
  const k = await p.evaluate(() => { const Z = __zotik, S = Z.S(); window.__leer(); const e = window.__sp(6); Z.pl.iframes = 99; Z.killE(e); S.hp = Math.round(Z.maxHp() * .4); S.mp = 0; const n = t => Z.drops.filter(d => d.type === t).length; const r = { hp: n('hp'), mp: n('mp'), sh: n('shard'), hp0: S.hp, mp0: S.mp, max: Z.maxHp() };
    let fern = 0; for (let i = 0; i < 40; i++) Z.step(1 / 60, 1); for (const d of Z.drops) fern = Math.max(fern, Math.hypot(d.x - Z.pl.x, d.z - Z.pl.z)); r.fern = +fern.toFixed(1);
    let t = 40; while (Z.drops.length && t < 400) { Z.pl.iframes = 99; Z.step(1 / 60, 1); t++; } r.t = t; r.rest = Z.drops.length; r.hp1 = S.hp; r.mp1 = S.mp; return r; });
  ok('Besiegter Gegner lässt Lebens- und Magiekugeln fallen', k.hp >= 1 && k.mp >= 1, `${k.hp} Leben, ${k.mp} Magie, ${k.sh} Splitter`);
  ok('Beute fliegt aus der Ferne zu Zotik (über 4 m, ohne hinzulaufen)', k.fern > 4 && k.rest === 0, `weiteste ${k.fern} m, alles da nach ${k.t} Bildern, Rest ${k.rest}`);
  ok('Lebenskugeln heilen, Magiekugeln füllen MP', k.hp1 > k.hp0 && k.mp1 > k.mp0, `LP ${k.hp0} → ${k.hp1} von ${k.max}, MP ${k.mp0} → ${k.mp1}`);
  const f = await p.evaluate(() => { const Z = __zotik; window.__leer(); Z.drop(Z.pl.x + 13, Z.pl.z, 'hp', 3); Z.step(1 / 60, 150); let nah = 99; for (const d of Z.drops) nah = Math.min(nah, Math.hypot(d.x - Z.pl.x, d.z - Z.pl.z)); const n = Z.drops.length; window.__leer(); return { n, nah: +nah.toFixed(1) }; });
  ok('Weiter als 10 m entfernte Beute bleibt liegen', f.n === 3 && f.nah > 7, JSON.stringify(f));
  const v = await p.evaluate(() => { const Z = __zotik, S = Z.S(); S.hp = Z.maxHp(); S.mp = Z.maxMp(); Z.drop(Z.pl.x + 1, Z.pl.z, 'hp', 2); Z.drop(Z.pl.x + 1, Z.pl.z, 'mp', 2); Z.step(1 / 60, 200); return { hp: S.hp, max: Z.maxHp(), mp: S.mp, mmax: Z.maxMp(), rest: Z.drops.length }; });
  ok('Kugeln füllen nie über das Höchstmaß', v.hp === v.max && v.mp === v.mmax && v.rest === 0, JSON.stringify(v));
  // Schwebe: Sprung ohne und mit Hieben
  const s = await p.evaluate(() => { const Z = __zotik, pl = Z.pl; for (const e of Z.E) if (!e.dead) { e.dead = true; e.m.root.visible = false; } Z.step(1 / 60, 30);
    const flug = (hiebe, ziel) => { let e = null; if (ziel) { e = window.__sp(1.8); e.max = e.hp = 1e6; Z.step(1 / 60, 2); Z.launchE(e, 8.5); } pl.iframes = 99; Z.jump(); let t = 0, n = 0, top = 0, slam = false; do { pl.iframes = 99; if (e && e.ay > 0) { pl.face = Math.atan2(e.x - pl.x, e.z - pl.z); } if (t > 12 && pl.atk < 0 && n < hiebe && pl.air) { Z.startAttack(); n++; if (pl.slam) slam = true; } Z.step(1 / 60, 1); t++; top = Math.max(top, pl.y - Z.hgt(pl.x, pl.z)); } while (pl.air && t < 900); const r = { t, n, top: +top.toFixed(2), slam, ah: pl.ah || 0, hov: pl.hovT || 0 }; if (e) { e.dead = true; e.m.root.visible = false; } Z.step(1 / 60, 40); return r; };
    return { ohne: flug(0, true), mit: flug(9, true) }; });
  ok('Hiebe in der Luft halten Zotik in der Schwebe', s.mit.t > s.ohne.t * 1.5, `Sprung ${s.ohne.t} Bilder, mit Luftkombo ${s.mit.t} Bilder`);
  ok('Schwebe endet (kein Dauerflug) und setzt sich bei der Landung zurück', s.mit.t < 400 && s.mit.ah === 0 && s.mit.hov === 0, JSON.stringify(s.mit));
  ok('Schwebe trägt nicht höher als ein Sprung plus 2 m', s.mit.top < s.ohne.top + 2, `${s.ohne.top} m → ${s.mit.top} m`);
  if (BILD) { await p.evaluate(() => { const Z = __zotik, S = Z.S(); for (const e of Z.E) if (!e.dead) { e.dead = true; e.m.root.visible = false; } window.__leer(); Z.pl.iframes = 99; Z.step(1 / 60, 420); S.hp = Math.round(Z.maxHp() * .5); S.mp = 0; for (let i = 0; i < 3; i++) { const x = Z.pl.x + i * 1.6 - 1.6, z = Z.pl.z + 3.5; Z.drop(x, z, 'hp', 3); Z.drop(x, z, 'mp', 3); Z.drop(x, z, 'shard', 4); } Z.step(1 / 60, 47); Z.pl.iframes = 0; Z.step(1 / 60, 1); }); await shot(p, 'beute');
    await p.evaluate(() => { const Z = __zotik, pl = Z.pl; window.__leer(); Z.step(1 / 60, 60); const e = window.__sp(1.8); e.max = e.hp = 1e6; Z.step(1 / 60, 2); Z.launchE(e, 8.5); Z.jump(); for (let t = 0; t < 34; t++) { pl.iframes = 99; pl.face = Math.atan2(e.x - pl.x, e.z - pl.z); if (t > 12 && pl.atk < 0) Z.startAttack(); Z.step(1 / 60, 1); } }); await shot(p, 'schwebe'); }
  ok('keine Seitenfehler', p.errs.length === 0, p.errs.join(' | ')); await b.close(); process.exit(fail ? 1 : 0); })();
