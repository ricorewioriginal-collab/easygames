// Zotik: Hauptgeschichte Kapitel 1–10 als Bot (Teleport statt Laufen, sonst die echten Spielfunktionen)
const { chromium, ARGS, open, shot } = require('./lib.cjs');
const FROM = +process.argv[2] || 1, TO = +process.argv[3] || 10;
const BOT = () => { const Z = __zotik, pl = Z.pl; const B = window.B = { log: [],
  step(n = 12) { for (let i = 0; i < n; i += 6) { Z.S().hp = Z.maxHp(); for (const a of Z.CMP) { a.ko = false; a.hp = 500; } Z.step(1 / 30, Math.min(6, n - i)); } if (pl.dead) B.log.push('TOT'); },
  free(x, z, r0 = 1.5) { for (let r = r0; r < 12; r += .7) for (let a = 0; a < 12; a++) { const px = x + Math.cos(a * .5236) * r, pz = z + Math.sin(a * .5236) * r; if (!Z.pBlocked(px, pz)) return [px, pz]; } return null; },
  tp(x, z) { pl.x = x; pl.z = z; pl.vx = pl.vz = pl.kx = pl.kz = 0; B.step(8); },
  dlgOn() { return !document.getElementById('dlg').hidden; },
  dlg(opt = 0) { let c = 0; for (let i = 0; i < 300 && B.dlgOn(); i++) { const o = document.getElementById('dOpts'); if (!o.hidden && o.children.length) o.children[Math.min(opt, o.children.length - 1)].click(); else document.getElementById('dlg').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); c++; B.step(2); } return c; },
  prompt() { const p = document.getElementById('prompt'); return p.hidden ? '' : p.textContent; },
  use(o, opt = 0) { B.dlg(); B.step(4); const f = B.free(o.x, o.z, (o.rad ? Math.min(o.rad * .6, 2) : 1.4)); if (!f) return 'kein freier Platz bei ' + (o.name || o.id); B.tp(f[0], f[1]); const pr = B.prompt(); Z.interact(); B.step(2); const d = B.dlg(opt); return (pr || 'KEINE ANZEIGE') + (d ? ' [' + d + ' Dialogschritte]' : ''); },
  npc(name) { return Z.NPC.find(n => n.name === name || n.id === name); },
  int(re) { return Z.INT.find(i => re.test(i.name || '') && (!i.vis || i.vis())); },
  killAll(f) { let k = 0; for (const e of Z.E.slice()) if (!e.dead && f(e)) { B.tp(...(B.free(e.x, e.z, 2) || [e.x, e.z])); Z.hurtE(e, 1e7, 0, 0, false); k++; B.step(3); } return k; },
  quest() { return document.getElementById('qo').textContent.replace(/\n/g, ' / '); },
  puzzle() { const P = document.getElementById('puz'); if (P.hidden) return 'kein Rätsel offen'; const key = Object.keys(Z.PZD).find(k => '🧩 ' + Z.PZD[k].name === document.getElementById('pT').textContent && !Z.S().pz[k]); const d = Z.PZD[key]; if (!d) return 'Rätsel unbekannt: ' + document.getElementById('pT').textContent;
    const W = document.getElementById('pW');
    if (d.kind === 'dials') { const bs = W.querySelectorAll('.pzd'); d.sol.forEach((v, i) => { const n = ((v - (d.init[i] || 0)) % d.dial_states + d.dial_states) % d.dial_states; for (let k = 0; k < n; k++) bs[i].click(); }); }
    else if (d.kind === 'sequence') { const bs = W.querySelectorAll('.pzn'); for (const i of d.sol) bs[i].click(); }
    else { const vb = W.querySelectorAll('.pzb'), m = d.valve_map; let best = null; for (let s = 0; s < (1 << m.length); s++) { const v = d.init.slice(0, d.channels); for (let i = 0; i < m.length; i++) if (s >> i & 1) for (const ch of m[i]) v[ch] = v[ch] ? 0 : 1; if (v.every((x, i) => x === d.sol[i])) { best = s; break; } } if (best === null) return 'Ventilrätsel unlösbar: ' + key; for (let i = 0; i < m.length; i++) if (best >> i & 1) vb[i].click(); }
    return key + (Z.S().pz[key] ? ' gelöst' : ' NICHT gelöst'); } }; };
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b); const L = s => console.log(s); const ev = (f, a) => p.evaluate(f, a); const w = ms => p.waitForTimeout(ms);
  await ev(BOT); await ev(() => { __zotik.startDbg(); }); await w(600);
  const settle = async (ms = 2600) => { for (let i = 0; i < 6; i++) { await w(ms / 3); const c = await ev(() => { B.step(10); return B.dlg(); }); if (!c && i) break; } };
  const flightSkip = async () => { for (let i = 0; i < 40; i++) { const m = await ev(() => __zotik.mode); if (m === 'flight') { await p.keyboard.press('Escape'); await w(500); } else if (i > 3) break; await w(300); } };
  if (FROM === 1) {
    await w(4200); await settle(3000); L('K1 Start: ' + await ev(() => B.quest()));
    L('  Mira: ' + await ev(() => B.use(B.npc('mira')))); L('  → ' + await ev(() => B.quest()));
    L('  Kräuter: ' + await ev(() => { for (const h of __zotik.herbs.slice(0, 3)) B.tp(h.x, h.z); return B.quest(); }));
    L('  Mira: ' + await ev(() => B.use(B.npc('mira')))); L('  → ' + await ev(() => B.quest()));
    L('  Riftlinge: ' + await ev(() => { let n = 0; for (const e of __zotik.E) if (!e.dead && e.k === 'rift' && n < 5) { B.tp(e.x + 1.5, e.z); __zotik.hurtE(e, 1e6, 0, 0); n++; B.step(3); } return n + ' besiegt · ' + B.quest(); }));
    L('  Prof: ' + await ev(() => B.use(B.npc('prof')))); L('  → ' + await ev(() => B.quest() + ' · Nautilux: ' + !!__zotik.S().fl.naut));
    for (const re of [/Mondtor/, /Resonanz|Kristall|Brücke/]) { const r = await ev(src => { const it = __zotik.INT.find(i => new RegExp(src).test((i.name || '') + ' ' + (i.pr || '')) && (!i.vis || i.vis())); if (!it) return 'NICHT GEFUNDEN: ' + src + ' · vorhanden: ' + __zotik.INT.filter(i => !i.vis || i.vis()).map(i => i.name + '/' + i.pr).join(', '); const u = B.use(it); return u + ' · ' + B.puzzle(); }, re.source); L('  Rätsel ' + re.source + ': ' + r); await w(1300); await settle(900); }
    L('  → ' + await ev(() => B.quest() + ' · offen: ' + __zotik.lunOpen()));
    await ev(() => { B.tp(0, -160); B.step(20); }); await settle(1200); L('  Höhle: ' + await ev(() => B.quest() + ' · Boss: ' + (__zotik.boss ? __zotik.boss.d.name : 'keiner')));
    await ev(() => { B.tp(0, -176); B.step(30); const bo = __zotik.boss; if (bo) __zotik.hurtE(bo, 1e7, 0, 0); B.step(10); }); await w(2200); await settle(2400);
    L('  nach Mondwolf: ' + await ev(() => B.quest() + ' · Boss: ' + (__zotik.boss && !__zotik.boss.dead ? __zotik.boss.d.name : 'keiner')));
    await ev(() => { B.tp(0, -176); B.step(30); const bo = __zotik.boss; if (bo && !bo.dead) __zotik.hurtE(bo, 1e7, 0, 0); B.step(10); }); await w(1500); await settle(1500);
    L('  nach Orun: ' + await ev(() => B.quest())); await w(4500);
    L('  Mira: ' + await ev(() => B.use(B.npc('mira')))); await w(2200); await settle(2000); L('  → ' + await ev(() => B.quest() + ' · Stufe ' + __zotik.S().stage + ' · Gruppe ' + __zotik.S().party));
  } else { await ev(n => { const S = __zotik.S(); S.stage = 8; S.fl.naut = 1; S.fl.bridge = 1; S.lvl = 6 + n * 2; for (const c of ['lyra', 'nia', 'rovan']) __zotik.joinParty(c); for (let k = 2; k < n; k++) S.cd[k] = { st: 7, k: 0, b: [0, 0, 0], ord: 0, bd: 1, fin: 1, arr: 1, e1: 1, e2: 1 }; }, FROM); }
  for (let n = Math.max(2, FROM); n <= TO; n++) {
    await ev(n => __zotik.travel(n), n); await w(900); await flightSkip(); await p.waitForFunction(n => __zotik.ch === n && __zotik.mode === 'play', n, { timeout: 120000 }).catch(() => L('  !! Welt ' + n + ' nicht erreicht'));
    await w(2200); await settle(2400); await w(7500); await settle(1500);
    const C = await ev(n => ({ name: __zotik.CHP[n].name, elder: __zotik.CHP[n].elder[0] }), n); L(`K${n} ${C.name}: ${await ev(() => B.quest())}`);
    L('  Ältester: ' + await ev(nm => B.use(B.npc(nm)), C.elder)); L('  → ' + await ev(() => B.quest()));
    await ev(() => { const W = __zotik.W; B.tp(W.path(-60), -60); B.step(20); }); await settle(900); L('  Wildnis: ' + await ev(() => B.quest()));
    // Weltauftrag
    { let last = ''; for (let i = 0; i < 40; i++) { const q = await ev(() => B.quest()); if (/Vertreibe/.test(q)) break;
      const r = await ev(n => { const Z = __zotik, C = Z.CHP[n]; const it = Z.INT.find(i => i.vis && i.vis() && (i.pr === C.bkp || i.pr === 'Verteidigung starten')); if (it) return 'Ding: ' + B.use(it);
        const lost = Z.NPC.find(n => /^lost/.test(n.id) && !n.done); if (lost) return 'Vermisste: ' + B.use(lost);
        const k = B.killAll(e => e.wave || e.elite); if (k) return k + ' Wellen-/Champion-Gegner besiegt'; B.step(90); return 'warte'; }, n); const l = r.replace(/\d+/g, '#'); if (l !== last) { last = l; L('  Auftrag: ' + r + ' → ' + q); } await w(300); } }
    L('  Jagd: ' + await ev(() => { let n = 0; for (let i = 0; i < 30 && /Vertreibe/.test(B.quest()); i++) { const e = __zotik.E.find(e => !e.dead && !e.boss && !e.mini && e.z > -150); if (!e) return 'KEINE GEGNER MEHR · ' + B.quest(); B.tp(...(B.free(e.x, e.z, 2) || [e.x, e.z])); __zotik.hurtE(e, 1e7, 0, 0); n++; B.step(3); } return n + ' besiegt · ' + B.quest(); }));
    await settle(900);
    const etappe = async tag => { let last = ''; for (let i = 0; i < 160; i++) { const st = await ev(() => { const a = __zotik.EPX().cur; return a ? a.d.k : ''; }); if (!st) return (i ? 'geschafft · ' : 'keine Etappe · ') + await ev(() => B.quest());
        const r = await ev(() => { const Z = __zotik, a = Z.EPX().cur, d = a.d; B.dlg(); if (!Z.EPX().cur) return 'fertig';
          if (a.run) { B.tp(...(B.free(a.run.x, a.run.z, 1.2) || [a.run.x, a.run.z])); B.step(30); return 'Verfolgung ' + a.run.i; }
          if (a.esc) { const k = B.killAll(e => e.esc); B.tp(...(B.free(a.esc.x, a.esc.z, 2) || [a.esc.x, a.esc.z])); B.step(60); return 'Begleitung'; }
          if (d.k === 'sky' && (!Z.naut.on || Z.naut.f !== 2)) { Z.nautTo(2); B.step(5); if (!Z.naut.on || Z.naut.f !== 2) return 'LUFTSCHIFF NICHT VERFÜGBAR (an=' + Z.naut.on + ', Form ' + Z.naut.f + ')'; }
          let ps = a.parts.filter(p => !p.on); if (d.k === 'memory') { const want = d.order[a.parts.filter(q => q.on).length]; ps = a.parts.filter(p => p.i === want); }
          const p0 = ps[0]; if (!p0) return 'keine Teile'; const it = Z.INT.find(i => i.x === p0.x && i.z === p0.z && i.vis); if (!it) return 'TEIL OHNE INTERAKTION';
          if (d.k === 'sky') { Z.pl.x = p0.x + 1.5; Z.pl.z = p0.z; Z.naut.alt = p0.y; Z.pl.y = p0.y; B.step(20); if (!it.vis()) return 'SIEGEL NICHT ERREICHBAR (y=' + Z.pl.y.toFixed(1) + ' Ziel ' + p0.y.toFixed(1) + ')'; Z.interact(); B.step(3); B.dlg(); return 'Siegel'; }
          return d.k + ': ' + B.use(it).replace(/\[.*/, ''); }); const l = r.replace(/\d+/g, '#'); if (l !== last) { last = l; L(`  ${tag}: ${r}`); } if (/NICHT|OHNE/.test(r)) return 'HÄNGT: ' + r; await w(60); } return 'HÄNGT: ' + await ev(() => B.quest() + ' · tot=' + __zotik.pl.dead + ' · dlg=' + B.dlgOn() + ' · Meldungen: ' + [...document.getElementById('toast').children].map(e => e.textContent).join(' / ') + ' · Gefährten ' + __zotik.CMP.map(c => c.id + (c.ko ? ' KO' : '')) + ' · Pos ' + __zotik.pl.x.toFixed(0) + ',' + __zotik.pl.z.toFixed(0)); };
    L('  Etappe 1 → ' + await etappe('E1')); await settle(900);
    L('  Rätsel: ' + await ev(() => { const it = __zotik.INT.find(i => i.pr === 'Rätsel lösen'); const u = B.use(it); return u + ' · ' + B.puzzle(); })); await w(2400); await settle(2000);
    L('  → ' + await ev(() => B.quest()));
    L('  Mini: ' + await ev(() => { const e = __zotik.E.find(e => e.mini && !e.dead); if (!e) return 'KEIN MINIBOSS'; B.tp(...(B.free(e.x, e.z, 3) || [e.x, e.z])); __zotik.hurtE(e, 1e7, 0, 0); B.step(5); return e.d.name + ' besiegt · ' + B.quest(); })); await settle(1200);
    L('  Etappe 2 → ' + await etappe('E2')); await settle(900);
    await ev(() => { B.tp(0, -160); B.step(20); B.tp(0, -172); B.step(30); }); await settle(1500);
    L('  Boss: ' + await ev(() => { const bo = __zotik.boss; if (!bo) return 'KEIN BOSS · ' + B.quest(); __zotik.hurtE(bo, 1e8, 0, 0); B.step(10); return bo.d.name + ' besiegt · ' + B.quest(); })); await w(2200); await settle(2400);
    L('  Ältester: ' + await ev(nm => B.use(B.npc(nm)), C.elder)); await settle(1200); L('  → ' + await ev(n => B.quest() + ' · fertig: ' + !!__zotik.S().cd[n].fin, n));
    if (p.errs.length) { L('  FEHLER: ' + [...new Set(p.errs)].join(' | ')); p.errs.length = 0; }
  }
  L('Fehler gesamt: ' + ([...new Set(p.errs)].join(' | ') || 'keine')); await b.close(); })().catch(e => { console.error('ABBRUCH', e.message); process.exit(1); });
