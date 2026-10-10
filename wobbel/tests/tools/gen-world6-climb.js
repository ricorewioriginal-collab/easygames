/* Hilfswerkzeug für Welt 6 (Teil 2): Hill-Climbing auf einer ganzen Karte. Start = handgezeichnete Vorlage; Mutationen verschieben
   Wobbel/Kisten/Ziele/Schlüssel/Pfeile/x-Felder, drehen Pfeile oder setzen/entfernen Wände. Bewertet wird die Länge der kürzesten
   Lösung (Löser) im Zielbereich lo..hi plus Relevanz: Pfeile und x-Felder müssen die Lösung verlängern (Ersetzen durch Boden verkürzt sie).
   Aufruf: WOBBEL_JS=<Pfad zu js/game> node tests/tools/gen-world6-climb.js <seed.json> <lo> <hi> <Sekunden>   (seed.json = {"map":[...]}) */
import fs from 'fs';
const base = process.env.WOBBEL_JS || '../../js/game';
const { parseLevel } = await import(base + '/engine.js'); const { solve } = await import(base + '/solver.js');
const rnd = n => Math.floor(Math.random() * n), pick = a => a[rnd(a.length)];
const seed = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), lo = Number(process.argv[3]), hi = Number(process.argv[4]), secs = Number(process.argv[5] || 300);
const MAXS = Number(process.env.MAXS || 400000), MAXMS = Number(process.env.MAXMS || 3000);
const MOVABLE = new Set(['@', '$', '.', 'k', 'x', '^', '>', 'v', '<', 'r', 'g', 'b', 'R', 'G', 'B', '1', '2', '3']), ARR = '^>v<';
let grid = seed.map.map(r => r.split('')); const H = grid.length, W = grid[0].length;
const cells = ch => { const o = []; grid.forEach((r, y) => r.forEach((c, x) => { if (typeof ch === 'function' ? ch(c) : c === ch) o.push([x, y]); })); return o; };
const strip = (rows, re) => rows.map(r => r.replace(re, ' '));
function ev(rows) {
  const L = parseLevel({ map: rows }); if (L.crates.length < L.targets.length || L.start < 0 || !L.targets.length) return null;
  const r = solve(L, { maxStates: MAXS, maxMs: MAXMS }); return r.solvable === true ? r : null;
}
function score(rows) {
  const r = ev(rows); if (!r) return { s: -1000 }; const m = r.moves, hasA = rows.some(x => /[\^>v<]/.test(x)), hasX = rows.some(x => /x/.test(x));
  let s = m < lo ? m : (m > hi ? hi - (m - hi) * 2 : lo + 40), rel = [], okRel = true;
  for (const [has, re, tag] of [[hasA, /[\^>v<]/g, 'A'], [hasX, /x/g, 'X']]) if (has) { const q = ev(strip(rows, re)); const d = q ? m - q.moves : 99; rel.push(tag + d); if (d <= 0) { s -= 40; okRel = false; } else s += Math.min(d, 12) * 2; }
  return { s, m, pushes: r.pushes, states: r.states, rel: rel.join(' '), ok: m >= lo && m <= hi && okRel };
}
function mutate(g) {
  const n = g.map(r => r.slice()), k = rnd(10), fr = () => { const o = []; for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (n[y][x] === ' ') o.push([x, y]); return o; };
  const mv = ch => { const c = []; n.forEach((r, y) => r.forEach((v, x) => { if (ch(v)) c.push([x, y]); })); if (!c.length) return; const [x, y] = pick(c), f = fr(); if (!f.length) return; const [a, b] = pick(f); n[b][a] = n[y][x]; n[y][x] = ' '; };
  if (k < 3) mv(v => v === '$' || v === '@' || v === '.'); else if (k < 5) mv(v => v === 'x' || ARR.includes(v) || v === 'k');
  else if (k < 6) { const c = []; n.forEach((r, y) => r.forEach((v, x) => { if (ARR.includes(v)) c.push([x, y]); })); if (c.length) { const [x, y] = pick(c); n[y][x] = pick(ARR.split('')); } }
  else if (k < 8) { const f = fr(); if (f.length) { const [x, y] = pick(f); n[y][x] = '#'; } }
  else { const c = []; for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (n[y][x] === '#' && seed.map[y][x] !== '#') c.push([x, y]); if (c.length) { const [x, y] = pick(c); n[y][x] = ' '; } else mv(v => v === '$'); }
  return n;
}
const t0 = Date.now(); let cur = score(grid.map(r => r.join(''))), best = null, it = 0;
while (Date.now() - t0 < secs * 1000) {
  it++; let cand = mutate(grid); if (Math.random() < 0.3) cand = mutate(cand); const rows = cand.map(r => r.join('')), sc = score(rows);
  if (sc.s >= cur.s || (cur.s <= -1000 && Math.random() < 0.5)) { grid = cand; cur = sc; if (sc.ok && (!best || sc.s > best.s)) { best = Object.assign({ rows }, sc); console.error(`it ${it}: ${sc.m}Z ${sc.pushes}S ${sc.states}Zu ${sc.rel} s=${sc.s}`); fs.writeFileSync(process.argv[2] + '.best', JSON.stringify(best, null, 1)); } }
}
console.error(`fertig: ${it} Schritte, aktuell ${cur.m}Z, best ${best ? best.m + 'Z' : '-'}`);
if (best) console.log(JSON.stringify(best, null, 1));
