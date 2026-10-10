/* Hilfswerkzeug für Welt 6: handgezeichnete Ruinen-Vorlagen (feste Zeichen) werden per Hill-Climbing mit Wobbel, Kisten,
   Zielen, Schlüsseln, Pfeilfeldern und brüchigem Boden bestückt. Der Löser prüft Lösbarkeit; behalten werden nur Varianten,
   in denen Pfeile bzw. x-Felder wirklich nötig sind (Ersetzen durch Boden verkürzt die kürzeste Lösung).
   Aufruf: node --max-old-space-size=3000 tests/tools/gen-world6.js <Vorlage> [Sekunden]   (Umgebung WOBBEL_JS = Pfad zu js/game) */
const base = process.env.WOBBEL_JS || '../../js/game';
const { parseLevel } = await import(base + '/engine.js'); const { solve } = await import(base + '/solver.js');
const rnd = n => Math.floor(Math.random() * n), pick = a => a[rnd(a.length)];
// rows: feste Zeichen; ' ' = freie Zelle. crates/targets/keys/arrows/cracks = Anzahl, die zufällig gesetzt wird. lo..hi = Ziel-Zugzahl
const TPL = [
  { name: 'Einbahnstraße', crates: 1, targets: 1, keys: 0, arrows: 3, cracks: 0, lo: 12, hi: 25, rows: ['#########', '#       #', '# ##### #', '# #   # #', '# ##### #', '#       #', '#########'] },
  { name: 'Kreisverkehr', crates: 2, targets: 2, keys: 0, arrows: 4, cracks: 0, lo: 20, hi: 40, rows: ['###########', '#         #', '# ####### #', '#   #  #  #', '# ##### # #', '#         #', '###########'] },
  { name: 'Bröckelsteg', crates: 1, targets: 1, keys: 0, arrows: 0, cracks: 6, lo: 14, hi: 30, rows: ['###########', '#         #', '#  ##  ## #', '#         #', '# ##  ##  #', '#         #', '###########'] },
  { name: 'Brüchige Kammer', crates: 2, targets: 2, keys: 0, arrows: 0, cracks: 6, lo: 24, hi: 50, rows: ['###########', '#     #   #', '#     #   #', '#         #', '#     #   #', '#     #   #', '###########'] },
  { name: 'Tempel', crates: 2, targets: 2, keys: 0, arrows: 3, cracks: 4, lo: 30, hi: 55, rows: ['#############', '#     #     #', '#  #  #  #  #', '#           #', '#  #  #  #  #', '#     #     #', '#############'] },
  { name: 'Sandsteinhalle', crates: 2, targets: 2, keys: 0, arrows: 4, cracks: 4, lo: 40, hi: 70, rows: ['#############', '#   #       #', '#   #  ##   #', '#           #', '#   ##  #   #', '#       #   #', '#############'] },
  { name: 'Wendeltreppe', crates: 2, targets: 2, keys: 0, arrows: 4, cracks: 5, lo: 45, hi: 75, rows: ['#############', '#           #', '#  #######  #', '#           #', '#  ## # ##  #', '#           #', '#############'] },
  { name: 'Wassergruft', crates: 3, targets: 2, keys: 0, arrows: 4, cracks: 4, lo: 80, hi: 120, rows: ['#############', '#     #  ~~ #', '#     #  ~~ #', '#           #', '#  ##   #   #', '#     #     #', '#############'] },
  { name: 'Eishalle', crates: 3, targets: 3, keys: 0, arrows: 4, cracks: 4, lo: 90, hi: 140, rows: ['##############', '#   #   iii  #', '#   #   iii  #', '#            #', '#   ##  #    #', '#       #    #', '##############'] },
  { name: 'Pharaos Grab', crates: 3, targets: 2, keys: 1, arrows: 4, cracks: 4, lo: 100, hi: 150, rows: ['##############', '#     #      #', '#     D   1  #', '#     #      #', '#   ##   ##  #', '#            #', '##############'] },
];
const ti = Number(process.argv[2]), secs = Number(process.argv[3] || 120), T = TPL[ti]; const G = T.rows.map(r => r.split(''));
const free = []; G.forEach((r, y) => r.forEach((c, x) => { if (c === ' ') free.push([x, y]); }));
const items = []; const add = (ch, n) => { for (let i = 0; i < n; i++) items.push({ ch, pos: null }); };
add('@', 1); add('$', T.crates); add('.', T.targets); add('k', T.keys); add('A', T.arrows); add('x', T.cracks);
const arrowCh = '^>v<';
const key = p => p[0] + ',' + p[1];
function place(it, used) { for (let k = 0; k < 60; k++) { const p = pick(free); if (!used.has(key(p))) { it.pos = p; used.add(key(p)); if (it.ch === 'A') it.d = pick(arrowCh.split('')); return true; } } return false; }
function render(its) { const g = G.map(r => r.slice()); for (const it of its) g[it.pos[1]][it.pos[0]] = it.ch === 'A' ? it.d : it.ch; return g.map(r => r.join('')); }
function stripped(rows, re) { return rows.map(r => r.replace(re, ' ')); }
function evalRows(rows, full) {
  const L = parseLevel({ map: rows }); if (L.crates.length < L.targets.length) return null;
  const r = solve(L, { maxStates: full ? 1400000 : 90000, maxMs: full ? 40000 : 1200 }); return r.solvable === true ? r : (r.solvable === false ? { dead: true } : { unk: true });
}
function score(its, full) {
  const rows = render(its), r = evalRows(rows, full); if (!r || r.dead || r.unk) return { s: -1e6, rows }; const m = r.moves;
  const dist = Math.max(0, T.lo - m, m - T.hi); let s = -dist * 10, bonus = 0, rel = [], bad = false;
  if (T.arrows) { const r2 = evalRows(stripped(rows, /[\^>v<]/g), full); const d = r2 && r2.moves !== undefined ? m - r2.moves : null; if (d === null) s -= 5; else { rel.push('A' + d); if (d <= 0) { s -= 30; bad = true; } else bonus += Math.min(d, 8) * 2; } }
  if (T.cracks) { const r3 = evalRows(stripped(rows, /x/g), full); const d = r3 && r3.moves !== undefined ? m - r3.moves : null; if (d === null) s -= 5; else { rel.push('X' + d); if (d <= 0) { s -= 30; bad = true; } else bonus += Math.min(d, 8) * 2; } }
  bonus += Math.min(r.pushes, 30) * 0.3; return { s: s + bonus, rows, m, pushes: r.pushes, states: r.states, rel: rel.join(' '), ok: dist === 0 && !bad };
}
const it_best = c => false;
const t0 = Date.now(), results = []; let restarts = 0;
while (Date.now() - t0 < secs * 1000) {
  restarts++; const used = new Set(); const its = items.map(i => ({ ch: i.ch, pos: null })); if (!its.every(it => place(it, used))) continue;
  let cur = score(its, false); if (cur.s < -1e5) { continue; }
  for (let it = 0; it < 200 && Date.now() - t0 < secs * 1000; it++) {
    const cand = its.map(x => Object.assign({}, x)), used2 = new Set(cand.map(c => key(c.pos))), j = rnd(cand.length);
    if (cand[j].ch === 'A' && Math.random() < 0.3) cand[j].d = pick(arrowCh.split('')); else { used2.delete(key(cand[j].pos)); place(cand[j], used2); }
    const sc = score(cand, false); if (sc.s >= cur.s) { cur = sc; its.splice(0, its.length, ...cand); }
  }
  if (process.env.DBG) console.error('start', cur.m, cur.rel, cur.pushes, cur.states);
  if (cur.ok || it_best(cur)) { const f = score(its, true); if (f.ok) { results.push(f); console.error(`#${results.length} ${f.m}Z ${f.pushes}S ${f.states}Zu ${f.rel} score ${f.s.toFixed(1)}`); } }
}
results.sort((a, b) => b.s - a.s); console.log(JSON.stringify(results.slice(0, 8).map(r => ({ m: r.m, pushes: r.pushes, states: r.states, rel: r.rel, s: r.s, rows: r.rows })), null, 1));
console.error(`${T.name}: ${restarts} Starts, ${results.length} Treffer`);
