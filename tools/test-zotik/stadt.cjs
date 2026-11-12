// Städte: jedes Gebäude hat eine Funktion und ist zu Fuß erreichbar (Kirche, Läden, Wirtshaus, Wohnhäuser, Casino)
//   node tools/test-zotik/stadt.cjs [von] [bis]      Welten 1–10; Bilder mit SHOTS=1 nach <tmp>/zotik-test/
const L = require('./lib.cjs'), { chromium, ARGS, open, shot } = L;
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { ctx: { viewport: { width: 960, height: 540 } } }); const from = +process.argv[2] || 1, to = +process.argv[3] || 10, res = [], plans = {};
  const ok = (name, pass, info) => { res.push(pass); console.log(`${pass ? 'ok  ' : 'FEHL'} ${name}${info ? ' · ' + info : ''}`); };
  const w = ms => p.waitForTimeout(ms);
  const skip = () => L.skip(p), opt = t => L.opt(p, t), talk = async id => { const r = await L.talk(p, id); if (!r && !(await L.opt(p, 'Etwas anderes'))) { await p.waitForTimeout(150); await L.skip(p); } return r; };   /* bietet jemand einen Nebenauftrag an, hier den Laden/Dienst wählen */
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.fl.naut = 1; S.fl.bridge = 1; S.lvl = 20; S.shards = 5000; S.mat = { fell: 20, staub: 20, kern: 5 }; });
  /* Einleitung ganz ablaufen lassen (sie meldet sich sonst später mitten im Test) */
  await L.intro(p);
  for (let n = from; n <= to; n++) {
    const r = await p.evaluate(n => { const Z = __zotik, S = Z.S(); for (let k = 2; k < n; k++) S.cd[k] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 };
      if (n > 1) { if (Z.ch !== 1) Z.switchWorld(1); Z.switchWorld(n); } const d = document.getElementById('dlg'); for (let k = 0; k < 30 && !d.hidden; k++) { d.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); Z.step(1 / 30, 2); }
      /* Flutfüllung zu Fuß ab Marktplatz, halber Meter */
      const st = .5, key = (i, j) => i * 4000 + j, seen = new Map(), q = [[0, 18]]; seen.set(key(0, 18), 1);
      while (q.length) { const [i, j] = q.pop(); for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, c = j + dj, k = key(a, c); if (seen.has(k) || Math.abs(a) > 110 || c > 100 || c < -70 || Z.pBlocked(a * st, c * st)) continue; seen.set(k, 1); q.push([a, c]); } }
      window.__near = (x, z, r) => { let best = null, bd = 9; const i0 = Math.round(x / st), j0 = Math.round(z / st), m = Math.ceil(r / st); for (let a = -m; a <= m; a++) for (let c = -m; c <= m; c++) { const dd = Math.hypot(a, c) * st; if (dd >= .9 && dd < bd && dd <= r && seen.has(key(i0 + a, j0 + c))) { bd = dd; best = [(i0 + a) * st, (j0 + c) * st]; } } return best; };
      const need = ['tw_smith', 'tw_magic', 'tw_potions', 'tw_church', 'tw_tavern'].concat(n === 3 ? ['tw_dealer', 'tw_stella'] : []), out = [];
      for (const id of need) { const np = Z.NPC.find(q => q.id === id); out.push(id.slice(3) + (!np ? ':FEHLT' : window.__near(np.x, np.z, 3) ? '' : ':NICHT ERREICHBAR')); }
      for (const it of Z.INT) if (/Bücherregal|Kristallslots|Sternenrad/.test(it.name) && !window.__near(it.x, it.z, it.rad - .2)) out.push(it.name + ':NICHT ERREICHBAR');
      const H = Z.HOUSES.map(h => [h.x, h.z, h.R]); let hit = ''; for (let i = 0; i < H.length; i++) for (let j = i + 1; j < H.length; j++) if (Math.hypot(H[i][0] - H[j][0], H[i][1] - H[j][1]) < (H[i][2] + H[j][2]) * .72) hit += ` Häuser ${i}/${j} zu dicht`;
      /* kein Haus auf dem Weg, kein Bewohner in einer Hauswand */
      if (n > 1) for (const q of H) for (let z = -44; z <= 30; z += 2) if (Math.hypot(q[0] - Z.WLD.path(z), q[1] - z) < q[2] * .6) { hit += ` Haus bei ${q[0]}/${q[1]} steht auf dem Weg`; break; }
      for (const np of Z.NPC) if (!/^tw_/.test(np.id) && Math.hypot(np.x, np.z) < 45 && !window.__near(np.x, np.z, 2.5)) hit += ` ${np.id} nicht erreichbar`;
      return { plan: need.slice(0, 5).map(id => { const np = Z.NPC.find(q => q.id === id); return np ? [np.x, np.z] : [0, 0]; }), bad: out.filter(s => s.includes(':')).join(', ') + hit, n: out.length, houses: H.length, books: Z.INT.filter(i => i.name === 'Bücherregal').length }; }, n);
    plans[n] = r.plan;
    ok(`Welt ${n}: Gebäude erreichbar`, !r.bad, r.bad || `${r.houses} Häuser, ${r.n} Anlaufstellen, ${r.books} Bücherregal`);
    if (process.env.SHOTS && (n === 1 || n === 3)) for (const [id, nm] of [['tw_church', 'kirche'], ['tw_magic', 'magie'], ['tw_potions', 'traenke'], ['tw_smith', 'schmiede']].concat(n === 3 ? [['tw_dealer', 'casino']] : [])) { await talk(id); await p.evaluate(() => { const b = [...document.querySelectorAll('#dOpts button')].pop(); if (b) b.click(); }); await shot(p, `stadt-${n}-${nm}`); }
    if (n !== 1 && n !== 3) continue;
    /* Funktionen: Kirche, Wirtshaus, Läden */
    await p.evaluate(() => { const S = __zotik.S(); S.hp = 5; S.mp = 0; S.fl.bless = 0; S.inv = {}; S.up = {}; S.mag = 0; S.items.phoenix = 0; S.shards = 5000; S.mat = { fell: 20, staub: 20, kern: 5 }; });
    let e = await talk('tw_church'); e = e || await opt('Segen'); ok(`Welt ${n}: Kirche heilt`, !e && await p.evaluate(() => __zotik.S().hp === __zotik.maxHp()), e);
    e = await talk('tw_church'); e = e || await opt('Spenden'); ok(`Welt ${n}: Sternensegen`, !e && await p.evaluate(() => __zotik.S().fl.bless > __zotik.S().t), e);
    await p.evaluate(() => { __zotik.S().hp = 5; }); e = await talk('tw_tavern'); e = e || await opt('Rasten'); ok(`Welt ${n}: Wirtshaus Rast`, !e && await p.evaluate(() => __zotik.S().hp === __zotik.maxHp()), e);
    for (const [id, o, want, chk] of [['tw_smith', 'Waffen', 'Mondsichel', () => !!__zotik.S().inv.w_mond], ['tw_smith', 'Schmieden', 'Mondsichel → +1', () => __zotik.S().up.w_mond === 1], ['tw_magic', 'Einkaufen', 'Zauberkunde', () => __zotik.S().mag === 1], ['tw_potions', 'Einkaufen', 'Phönix', () => __zotik.S().items.phoenix === 1]]) {
      e = await talk(id); e = e || await opt(o); await w(150);
      const r2 = await p.evaluate(want => { const m = document.getElementById('menu'); if (m.hidden) return 'Laden nicht offen'; const row = [...m.querySelectorAll('.row')].find(r => r.textContent.includes(want)); if (!row) return 'Ware fehlt: ' + want; const b = row.querySelector('button'); if (!b || b.disabled) return 'nicht kaufbar: ' + want; b.click(); return ''; }, want);
      const good = !e && !r2 && await p.evaluate(chk); ok(`Welt ${n}: ${id.slice(3)} – ${o} (${want})`, good, e || r2);
      if (process.env.SHOTS && n === 1 && o !== 'Waffen') await shot(p, 'laden-' + id.slice(3) + '-' + o.toLowerCase());
      await p.keyboard.press('Escape'); await w(150); }
    if (n === 1) { /* nur mit Tasten (PC, TV-Fernbedienung, Controller über gamepad.js): ansprechen, Auswahl, kaufen, schließen */
      await p.evaluate(() => { const Z = __zotik, np = Z.NPC.find(q => q.id === 'tw_potions'), c = window.__near(np.x, np.z, 3); Z.pl.x = c[0]; Z.pl.z = c[1]; Z.S().shards = 500; }); await p.waitForFunction(() => document.getElementById('prompt').textContent.includes('Krämer') && !document.getElementById('prompt').hidden, null, { timeout: 8000 }).catch(() => { });
      await p.keyboard.press('KeyE'); await w(250); if (process.env.DBG) console.log(await p.evaluate(() => [document.getElementById('dlg').hidden, document.getElementById('menu').hidden, document.getElementById('prompt').textContent, document.getElementById('dText').textContent.slice(0, 30), __zotik.mode].join(' | '))); for (let k = 0; k < 6 && await p.evaluate(() => document.getElementById('dOpts').hidden); k++) { await p.keyboard.press('Enter'); await w(200); }
      await w(450); await p.keyboard.press('Enter'); await w(300); const open1 = await p.evaluate(() => !document.getElementById('menu').hidden);
      await p.keyboard.press('ArrowDown'); await w(150); await p.keyboard.press('Enter'); await w(200); const sh = await p.evaluate(() => __zotik.S().shards);
      await p.keyboard.press('Escape'); await w(250); ok('Welt 1: Laden nur mit Tasten', open1 && sh < 500 && await p.evaluate(() => document.getElementById('menu').hidden), `offen ${open1}, Splitter ${sh}`); }
    if (n !== 3) continue;
    /* Casino: Geräte einschalten, alle drei Spiele */
    e = await talk('Kristallslots'); ok('Casino: aus = kein Spiel', !e && await p.evaluate(() => document.getElementById('dOpts').hidden || document.getElementById('dlg').hidden), e); await skip();
    e = await talk('tw_stella'); e = e || await opt('einschalten'); ok('Casino: Stella schaltet ein', !e && await p.evaluate(() => !__zotik.S().cas.off), e);
    for (const g of ['Kristallslots', 'Sternenrad']) { const s0 = await p.evaluate(() => { __zotik.S().shards = 1000; return __zotik.S().cas.n; }); e = await talk(g); e = e || await opt('50'); await p.evaluate(() => __zotik.step(1 / 30, 140)); await w(100); if (g === 'Kristallslots' && process.env.SHOTS) await shot(p, 'casino-slot'); if (g === 'Kristallslots') ok('Casino: Spielautomat als Minispiel', await p.evaluate(() => { const g = __zotik.TOWN.slot; const v = g && !g.d.hidden && g.run && g.run.done; if (g) g.end.click(); return v && g.d.hidden; }));
      const r3 = await p.evaluate(() => { const S = __zotik.S(), l = __zotik.TOWN.cs.last; return { n: S.cas.n, sh: S.shards, l, busy: __zotik.TOWN.cs.busy }; }); ok(`Casino: ${g}`, !e && r3.n === s0 + 1 && !r3.busy && r3.sh === 950 + r3.l.win, e || JSON.stringify(r3)); }
    { await p.evaluate(() => { __zotik.S().shards = 1000; }); e = await talk('tw_dealer'); e = e || await opt('50'); await w(700); await skip(); const o1 = await opt('Höher') && await opt('Tiefer'); await w(900); await p.evaluate(() => __zotik.step(1 / 30, 20)); await skip();
      const lost = await p.evaluate(() => !__zotik.TOWN.cs.hilo.round); if (!lost) { e = e || await opt('Auszahlen'); }
      const r4 = await p.evaluate(() => { const S = __zotik.S(), c = __zotik.TOWN.cs; return { sh: S.shards, round: !!c.hilo.round, last: c.last }; }); ok('Casino: Höher oder Tiefer', !e && !o1 && !r4.round && r4.sh === 950 + r4.last.win, e || o1 || JSON.stringify(r4)); }
    /* Auszahlungsquoten unter 100 % (Haus gewinnt auf Dauer leicht) */
    const ev = await p.evaluate(() => { const T = __zotik.TOWN, C = T.CAS; let a = 0; for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) for (let k = 0; k < 5; k++) a += C.W[i] * C.W[j] * C.W[k] / 1e6 * T.slotPay([i, j, k], 1); const wh = C.SEG.reduce((x, y) => x + y, 0) / 12; let hl = 0; for (let c = 1; c <= 13; c++) { const ph = (13 - c) / 13, pl = (c - 1) / 13, b = Math.max(ph, pl); hl = Math.max(hl, b * T.hiloMul(b)); } return [a, wh, hl]; });
    ok('Casino: Quoten unter 100 %', ev.every(v => v < 1 && v > .8), ev.map(v => (v * 100).toFixed(1) + ' %').join(' · '));
  }
  /* eigener Stadtplan je Welt: keine zwei Städte gleich aufgebaut, auch nicht gespiegelt */
  { const ns = Object.keys(plans).map(Number), same = []; for (const a of ns) for (const b of ns) if (a < b) for (const m of [1, -1]) { const d = plans[a].filter((q, i) => Math.hypot(q[0] - m * plans[b][i][0], q[1] - plans[b][i][1]) < 5).length; if (d >= 3) same.push(`${a}=${b}${m < 0 ? ' gespiegelt' : ''}`); }
    if (ns.length > 1) ok('Stadtplan je Welt verschieden', !same.length, same.join(', ') || `${ns.length} Städte verglichen`); }
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 400)); process.exit(1); });
