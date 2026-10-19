#!/usr/bin/env node
/* ColorPop Universe – erzeugt die 300 Kampagnenlevel und 30 Puzzle-Labor-Rätsel MIT Lösungszertifikat.
 *   node colorpop-universe/tools/gen-levels.js         schreibt src/data/levels.js, src/data/puzzles.js, tools/level-certs.json
 * Vorgehen je Level: Bauplan der Welt (Größe, Farben, Mechaniken, Zieltypen) → Brett aus Startwert → Löser (Strahlsuche über die
 * echte Engine) spielt das Level → Ziele, Zuglimit und Sterne werden aus dem tatsächlich erreichten Ergebnis abgeleitet (Anteil ≤ 100 %).
 * Damit ist jedes Level nachweislich ohne Booster lösbar; der Lösungsweg liegt als Zertifikat bei (tools/validate-levels.js spielt ihn nach).
 * Kleine Rätsel (Puzzle-Labor, Kampagnen-Herausforderungen) werden mit vollständiger Breitensuche gelöst: garantiert leerbar, minimale Zugzahl. */
'use strict';
const fs = require('fs'), path = require('path');
const dir = path.resolve(__dirname, '..');
const CPU = require(path.join(dir, 'src/core/rng.js'));
['board', 'rules', 'levelgen', 'bots', 'levels'].forEach(f => require(path.join(dir, 'src/core', f + '.js')));
require(path.join(dir, 'src/data/worlds.js'));
const B = CPU.board, bots = CPU.bots;
const r10 = v => Math.max(10, Math.round(v / 10) * 10);

// ---------- vollständige Suche für kleine Bretter ----------
function exact(board, cap) {
  const start = new CPU.Game({ board, colors: 7 });
  const key = g => B.key(g.board);
  let layer = [{ g: start, path: [] }], seen = new Set([key(start)]), states = 1;
  for (let depth = 0; depth < 60; depth++) {
    const next = [];
    for (const node of layer) {
      for (const gr of node.g.legal()) {
        const g2 = node.g.clone(); g2.move(gr.i);
        if (g2.cleared) return { min: depth + 1, path: node.path.concat(gr.i), states };
        const k = key(g2); if (seen.has(k)) continue; seen.add(k);
        // nicht mehr leerbar, wenn eine Farbe genau einmal vorkommt
        const cnt = {}; for (const v of g2.board.cells) if (v) cnt[v] = (cnt[v] || 0) + 1;
        if (Object.values(cnt).some(n => n === 1)) continue;
        if (++states > cap) return null;
        next.push({ g: g2, path: node.path.concat(gr.i) });
      }
    }
    if (!next.length) return { min: -1, states };
    layer = next;
  }
  return null;
}
function greedyClears(board) {   // „Größte Gruppe zuerst“ – leert das Brett? (dann ist es kein echtes Rätsel)
  const g = new CPU.Game({ board, colors: 7 });
  while (!g.status().over) { const gs = g.legal().sort((a, b) => b.size - a.size); g.move(gs[0].i); }
  return g.cleared;
}
function randomGrid(w, h, colors, seed, cluster) {
  const b = CPU.gen.make({ w, h, colors, seed, cluster });
  return B.toRows(b);
}
function makePuzzle(w, h, colors, seed0, minMoves, cap) {
  for (let t = 0; t < 4000; t++) {
    const seed = seed0 + t, rows = randomGrid(w, h, colors, seed, 0.25), b = B.fromRows(rows);
    const cnt = {}; rows.join('').split('').forEach(c => cnt[c] = (cnt[c] || 0) + 1);
    if (Object.values(cnt).some(n => n < 2)) continue;
    if (greedyClears(b)) continue;
    const r = exact(b, cap);
    if (r && r.min >= minMoves) return { rows, seed, min: r.min, path: r.path, states: r.states };
  }
  throw new Error('Kein Rätsel gefunden ' + w + 'x' + h);
}

// ---------- Baupläne ----------
const PLAN = [
  ['score', 'clear', 'score', 'leave', 'clear', 'score', 'clear', 'leave', 'groups', 'clear'],
  ['marks', 'color', 'marks+score', 'color2', 'groups', 'items'],
  ['leave', 'score', 'clear', 'groups', 'leave', 'score'],
  ['items', 'blocks', 'items+score', 'leave', 'items', 'blocks+score'],
  ['ice', 'score', 'ice+leave', 'groups', 'ice', 'score'],
  ['blocks', 'score', 'blocks+score', 'leave', 'score', 'blocks'],
  ['groups', 'score', 'color', 'groups+score', 'leave', 'color2'],
  ['ice', 'ice+score', 'leave', 'ice', 'groups', 'score'],
  ['score', 'leave', 'clear', 'color', 'score', 'groups'],
  ['items', 'items+leave', 'score', 'items', 'groups', 'items+score'],
  ['items+ice', 'score+color', 'blocks+leave', 'items+score', 'ice+groups', 'marks+score'],
  ['score+leave', 'items+ice', 'marks+score', 'clear', 'color2+score', 'blocks+items']
];
const BASE = [[5, 5], [6, 7], [7, 8], [7, 9], [8, 9], [8, 10], [9, 10], [9, 11], [10, 11], [10, 11], [10, 12], [11, 12]];
const COLS = [3, 3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5];
const GRAV_LEVELS = { 7: 2, 15: 1, 21: 3 };   // Wolkenstadt: dauerhafte Schwerkraft (2 = nach oben, 1 = links, 3 = rechts)

function sizeFor(wi, li) {
  const b = BASE[wi], add = Math.floor(li / 8);
  if (wi === 0) { const s = [[5, 5], [5, 6], [6, 6], [6, 6], [6, 7], [6, 7], [7, 7], [7, 7], [7, 8], [7, 8]]; if (li < 10) return s[li]; return [Math.min(9, 7 + Math.floor((li - 10) / 6)), Math.min(10, 8 + Math.floor((li - 10) / 7))]; }
  return [Math.min(12, b[0] + add), Math.min(13, b[1] + add)];
}
function spFor(wi, li, goals, w, h, rnd) {
  const s = {}, k = 1 + Math.floor(li / 6), want = t => goals.indexOf(t) >= 0;
  switch (wi) {
    case 1: if (want('items')) s.items = [2 + (li % 3), 3]; break;
    case 2: s.wind = li < 3 ? 1 : 1 + (li % 3); s.windDirs = [1, 3]; break;
    case 3: s.wood = 3 + k * 2; s.rock = [1 + (li % 3), 1]; s.items = [2 + k, 1]; break;
    case 4: s.ice = [4 + k * 3, 1]; s.chain = 3 + k; break;
    case 5: s.rock = [2 + (li % 3), 2]; s.bomb = 2 + (li % 3); s.heat = 1; s.wood = li % 2 ? 3 : 0; break;
    case 6: s.neon = 3 + k * 2; s.rocket = 2 + (li % 3); break;
    case 7: s.ice = [5 + k * 3, 0]; s.anchor = 2 + (li % 3); break;
    case 8: s.wood = li % 3 === 0 ? 3 : 0; break;
    case 9: s.portals = li < 8 ? 1 : 2; s.items = [2 + (li % 3), 0]; break;
    case 10: { const pool = ['bomb', 'rocket', 'chain', 'neon', 'wood']; s.rainbow = 2 + (li % 2); s[pool[li % 5]] = 3; s.ice = [4 + k, 1]; s.items = [2 + (li % 2), 2]; s.wood = (s.wood || 0) + 2; break; }
    case 11: s.prism = 2 + (li % 4); s.ice = [3 + k, 0]; s.bomb = 1 + (li % 2); s.rocket = 1; s.items = [2 + (li % 3), 0]; s.wood = 2; s.rainbow = li % 3 === 0 ? 1 : 0; s.neon = li % 4 === 1 ? 3 : 0; break;
  }
  // Ziele brauchen passende Elemente
  if (want('items') && !s.items) s.items = [2 + (li % 3), CPU.WORLDS[wi].item];
  if (want('ice') && !s.ice) s.ice = [5 + k * 2, wi >= 7 ? 0 : 1];
  if (want('blocks') && !s.wood && !s.rock) s.wood = 4 + k;
  if (s.ice && s.ice[1] === 0) s.ice = [s.ice[0], 1 + Math.floor(rnd() * 3)];   // Frost: Schichtenzahl je Level fest gewählt
  return s;
}

const GOAL_W = { clear: 'clear', leave: 'clear', score: 'score' };
function solveLevel(def, goalKinds) {
  const g0 = CPU.levels.game(def);
  const kind = goalKinds.length === 1 && GOAL_W[goalKinds[0]] ? GOAL_W[goalKinds[0]] : 'goal';
  const cells = g0.board.w * g0.board.h, width = cells <= 49 ? 40 : cells <= 81 ? 24 : cells <= 110 ? 14 : 9;
  const fin = kind === 'clear' ? (g => (g.cleared ? 1e6 : 0) - g.remaining() * 100 + g.score * 0.01) :
    kind === 'score' ? (g => g.score) : (g => { const p = g.progress(); let f = 0; p.forEach(x => f += x.target ? Math.min(1, x.cur / x.target) : 1); return f * 1e5 + g.score; });
  const r = bots.beam(g0, { width, evaluate: bots.evaluator(kind), final: fin });
  return { r, width };
}
function replay(def, pathArr) {
  const g = CPU.levels.game(def);
  for (const i of pathArr) if (!g.move(i)) return null;
  return g;
}

function buildLevel(wi, li, id) {
  const world = CPU.WORLDS[wi], d = id / 300, breather = li % 5 === 4 && li !== 24;
  const rnd = CPU.rng(CPU.hash('cpu-level-' + id));
  let plan = (PLAN[wi][li % PLAN[wi].length]).split('+');
  if (li === 24) plan = wi === 11 ? ['items', 'ice', 'leave'] : wi === 0 ? ['clear'] : PLAN[wi][0].split('+').concat(PLAN[wi][0].indexOf('score') < 0 ? ['score'] : []).slice(0, 2);
  if (id === 1) plan = ['score'];
  let [w, h] = sizeFor(wi, li);
  if (li === 24) { w = Math.min(12, w + 1); h = Math.min(13, h + 1); }
  let colors = Math.max(3, COLS[wi] - (li < 5 ? 1 : 0)); if (wi === 0 && li >= 15) colors = 4;
  const cluster = Math.max(0.12, (wi === 0 ? 0.5 : 0.36) - d * 0.22 - (li % 5) * 0.01 + (breather ? 0.08 : 0));
  const q = Math.min(0.88, 0.58 + d * 0.3 - (breather ? 0.12 : 0)), r3 = 0.86 + d * 0.1;
  const movesLimited = wi === 5 ? li % 2 === 0 : (wi >= 1 && li % 6 === 5);
  const title = world.words[0][li % 5] + world.words[1][Math.floor(li / 5)];
  for (let attempt = 0; attempt < 60; attempt++) {
    const seed = (CPU.hash('cpu-' + id + '-' + attempt) % 2000000000) >>> 0;
    const def = { id, world: wi + 1, title, gen: CPU.GEN_VERSION, w, h, colors, seed, cluster: +cluster.toFixed(2), shape: 'none', sp: spFor(wi, li, plan, w, h, rnd) };
    if (plan.indexOf('marks') >= 0) def.marks = wi === 1 ? (li % 2 ? 'rect' : 5 + li) : 6 + (li % 5);
    if (wi === 2) { def.shape = CPU.SHAPES[1 + (li % (CPU.SHAPES.length - 1))]; if (GRAV_LEVELS[li] != null) { def.gravity = GRAV_LEVELS[li]; def.sp = {}; def.shape = 'none'; } }
    if (wi === 10 || wi === 11) def.shape = ['none', 'corners', 'pillars', 'none', 'steps'][li % 5];
    if (wi === 8) { def.conveyors = li % 3 === 2 ? [2, h - 3] : [h - 2 - (li % 3)]; }
    if (wi === 11 && li === 24) { def.w = 12; def.h = 12; def.colors = 5; def.sp = { prism: 4, ice: [10, 2], items: [4, 0], bomb: 2, rocket: 2, rainbow: 1, chain: 3, wood: 3 }; def.shape = 'corners'; }
    // provisorische Ziele (maximale Werte), damit der Löser weiß, worauf er hinarbeitet
    const b0 = CPU.gen.boardFor(def);
    const prov = plan.map(t => {
      if (t === 'clear') return { t: 'clear' };
      if (t === 'leave') return { t: 'leave', n: 0 };
      if (t === 'score') return { t: 'score', n: 1e7 };
      if (t === 'color' || t === 'color2') return { t: 'color', c: rnd.int(def.colors), n: 999 };
      if (t === 'items') return { t: 'items', v: def.sp.items ? def.sp.items[1] : 0, n: CPU.countItems(b0) || 1 };
      if (t === 'groups') return { t: 'groups', size: 6 + Math.floor(d * 4), n: 99 };
      return { t };   // ice, blocks, marks: alle
    });
    if (plan.indexOf('color2') >= 0) { const c1 = prov.find(g => g.t === 'color').c; prov.push({ t: 'color', c: (c1 + 1) % def.colors, n: 999 }); }
    def.goals = prov; def.stars = [0, 0];
    if (movesLimited) def.moves = Math.max(10, Math.round(B.countPieces(b0) / (5 + d * 3)));
    if (prov.some(g => (g.t === 'items' && !CPU.countItems(b0)) || (g.t === 'ice' && !CPU.countIce(b0)) || (g.t === 'blocks' && !CPU.countBlocks(b0)) || (g.t === 'marks' && !CPU.countMarks(b0)))) continue;
    const { r, width } = solveLevel(def, plan);
    if (!r) continue;
    const G = r.game, st = G.stats;
    // echte Ziele aus dem erreichten Ergebnis
    const goals = []; let ok = true;
    for (const g of prov) {
      if (g.t === 'clear') { if (!G.cleared) { ok = false; break; } goals.push({ t: 'clear' }); }
      else if (g.t === 'leave') { const n = G.remaining() + Math.max(0, Math.round((1 - q) * 12)); if (n >= B.countPieces(b0) * 0.5) { ok = false; break; } goals.push({ t: 'leave', n }); }
      else if (g.t === 'score') goals.push({ t: 'score', n: r10(G.score * q * 0.9) });
      else if (g.t === 'color') { const n = Math.floor(st.byColor[g.c] * q); if (n < 4) { ok = false; break; } goals.push({ t: 'color', c: g.c, n }); }
      else if (g.t === 'items') { const n = st.items[g.v]; if (n < Math.min(2, g.n)) { ok = false; break; } goals.push({ t: 'items', v: g.v, n }); }
      else if (g.t === 'groups') { let n = 0; Object.keys(st.sizes).forEach(s => { if (+s >= g.size) n += st.sizes[s]; }); n = Math.floor(n * q); if (n < 1) { ok = false; break; } goals.push({ t: 'groups', size: g.size, n }); }
      else { const pr = G.progress().find(x => x.goal.t === g.t); if (!pr) { ok = false; break; } const n = Math.floor(pr.cur * (pr.cur >= pr.target ? 1 : q)); if (n < 2) { ok = false; break; } goals.push(pr.cur >= pr.target ? { t: g.t } : { t: g.t, n }); }
    }
    if (!ok) continue;
    def.goals = goals;
    if (def.moves) { def.moves = Math.min(def.moves, G.movesUsed + Math.max(1, Math.round(5 - d * 4))); def.moveBonus = li % 4 === 0; }
    // Sterne aus dem nachgespielten Zertifikat
    def.stars = [0, 0];
    let rg = replay(def, r.path); if (!rg) continue;
    const res = rg.finish('cert');
    if (!res.won) continue;
    const s3 = r10(res.score * r3), s2 = r10(res.score * 0.62);
    def.stars = [Math.min(s2, s3 - 10), s3];
    const sg = goals.find(g => g.t === 'score'); if (sg && def.stars[0] < sg.n) def.stars[0] = sg.n;
    if (def.stars[1] <= def.stars[0]) def.stars[1] = def.stars[0] + 10;
    if (def.stars[1] > res.score) continue;
    def.diff = Math.min(5, 1 + Math.floor(d * 4.2) + (breather ? -1 : 0) + (li === 24 ? 1 : 0));
    rg = replay(def, r.path); const fin = rg.finish('cert');
    if (!fin.won || fin.stars !== 3) continue;
    return { def, cert: { path: r.path, score: fin.score, moves: rg.movesUsed, method: 'beam', width, attempts: attempt + 1 } };
  }
  throw new Error('Level ' + id + ' nicht erzeugbar');
}
// Herausforderung (Level 13 jeder Welt): festes Brett, vollständig gelöst
function buildChallenge(wi, li, id) {
  const world = CPU.WORLDS[wi];
  const sz = [[4, 5], [5, 5], [5, 5], [5, 6], [5, 6], [5, 6], [6, 5], [6, 6], [6, 6], [6, 6], [6, 6], [6, 6]][wi];
  const colors = wi < 6 ? 3 : 4;
  const p = makePuzzle(sz[0], sz[1], colors, CPU.hash('cpu-ch-' + id) % 1e6, 4 + Math.floor(wi / 3), 120000);
  const def = { id, world: wi + 1, title: world.words[0][li % 5] + world.words[1][Math.floor(li / 5)], grid: p.rows, colors, goals: [{ t: 'clear' }], moves: p.min + 2, moveBonus: true, stars: [0, 0], challenge: true };
  let g = replay(def, p.path); const res = g.finish('cert');
  def.stars = [r10(res.score * 0.7), r10(res.score * 0.95)];
  if (def.stars[1] <= def.stars[0]) def.stars[1] = def.stars[0] + 10;
  g = replay(def, p.path); const fin = g.finish('cert');
  if (fin.stars !== 3) throw new Error('Herausforderung ' + id + ' ohne 3 Sterne');
  def.diff = Math.min(5, 2 + Math.floor(wi / 3));
  return { def, cert: { path: p.path, score: fin.score, moves: p.min, method: 'exact', min: p.min, states: p.states } };
}

function main() {
  const t0 = Date.now(), levels = [], certs = { version: CPU.GEN_VERSION, levels: {}, puzzles: {} };
  for (let wi = 0; wi < 12; wi++) {
    for (let li = 0; li < 25; li++) {
      const id = wi * 25 + li + 1;
      const r = li === 12 ? buildChallenge(wi, li, id) : buildLevel(wi, li, id);
      levels.push(r.def); certs.levels[id] = r.cert;
    }
    process.stdout.write('Welt ' + (wi + 1) + ' fertig (' + ((Date.now() - t0) / 1000).toFixed(1) + ' s)\n');
  }
  // Puzzle-Labor: 30 Rätsel, steigend
  const puzzles = [], PS = [[4, 4, 3], [4, 5, 3], [5, 5, 3], [5, 6, 3], [6, 6, 3], [5, 5, 4], [5, 6, 4], [6, 6, 4]];
  for (let k = 0; k < 30; k++) {
    const s = PS[Math.min(PS.length - 1, Math.floor(k / 4))];
    const p = makePuzzle(s[0], s[1], s[2], 500000 + k * 7919, 4 + Math.floor(k / 6), 150000);
    puzzles.push({ id: k + 1, name: 'Rätsel ' + (k + 1), grid: p.rows, colors: s[2], min: p.min });
    certs.puzzles[k + 1] = { path: p.path, min: p.min, states: p.states, method: 'exact' };
  }
  const head = '/* ColorPop Universe – ERZEUGT von tools/gen-levels.js (nicht von Hand ändern). Lösungszertifikate: tools/level-certs.json */\n';
  fs.writeFileSync(path.join(dir, 'src/data/levels.js'), head + "(function(r){var C=r.CPU||(r.CPU={});C.LEVELS=[\n" + levels.map(l => JSON.stringify(l)).join(',\n') + "\n];if(typeof module!=='undefined'&&module.exports)module.exports=C;})(typeof window!=='undefined'?window:globalThis);\n");
  fs.writeFileSync(path.join(dir, 'src/data/puzzles.js'), head + "(function(r){var C=r.CPU||(r.CPU={});C.PUZZLES=[\n" + puzzles.map(l => JSON.stringify(l)).join(',\n') + "\n];if(typeof module!=='undefined'&&module.exports)module.exports=C;})(typeof window!=='undefined'?window:globalThis);\n");
  fs.writeFileSync(path.join(dir, 'tools/level-certs.json'), JSON.stringify(certs));
  console.log('300 Level + 30 Rätsel erzeugt in ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s');
}
main();
