/* Darts-Arena 3D – Kern: Dartboard nach Turniermaß (mm), Treffer-Auswertung, Checkout-Wege und alle Spielmodi mit Regeln.
 * Koordinaten in Millimetern, Mitte = Bullseye, x nach rechts, y nach oben. Keine Abhängigkeiten (läuft auch in Node für die Tests). */
(function (root) {
  'use strict';
  // Turniermaße (Innenkanten der Drähte): Bullseye 12,7 mm, Bull 31,8 mm, Triple 99–107 mm, Double 162–170 mm
  const R_IB = 6.35, R_OB = 15.9, R_TI = 99, R_TO = 107, R_DI = 162, R_DO = 170, R_BOARD = 225;
  const ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
  const MISS = { n: 0, m: 0, v: 0, code: '–' };

  // Treffer an Punkt (x, y)
  function hit(x, y) {
    const r = Math.hypot(x, y);
    if (r <= R_IB) return { n: 25, m: 2, v: 50, code: 'DB', r };
    if (r <= R_OB) return { n: 25, m: 1, v: 25, code: 'SB', r };
    if (r > R_DO) return Object.assign({ r, off: r > R_BOARD }, MISS);
    const a = (Math.atan2(x, y) * 180 / Math.PI + 9 + 360) % 360, n = ORDER[Math.floor(a / 18) % 20];
    const m = r >= R_DI ? 2 : r >= R_TI && r <= R_TO ? 3 : 1;
    return { n, m, v: n * m, code: (m === 3 ? 'T' : m === 2 ? 'D' : 'S') + n, r };
  }
  // Zielpunkt für ein Feld (Mitte des Feldes); m = 1 zielt auf das große Single-Feld
  function aimPoint(n, m) {
    if (n === 25) return m === 1 ? { x: 0, y: 11 } : { x: 0, y: 0 };
    if (!n) return { x: 0, y: 0 };
    const i = ORDER.indexOf(n), a = i * 18 * Math.PI / 180, r = m === 3 ? 103 : m === 2 ? 166 : 135;
    return { x: Math.sin(a) * r, y: Math.cos(a) * r };
  }
  const parse = c => c === 'DB' ? { n: 25, m: 2 } : c === 'SB' ? { n: 25, m: 1 } : { n: +c.slice(1), m: c[0] === 'T' ? 3 : c[0] === 'D' ? 2 : 1 };
  const label = h => !h || !h.n ? 'Daneben' : h.code === 'DB' ? 'Bullseye' : h.code === 'SB' ? 'Bull' : h.code;
  // Normalverteilter Zufall (Box-Muller) aus einer Zufallsquelle 0..1
  function gauss(rnd) { let u = 0, v = 0; while (u === 0) u = rnd(); while (v === 0) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  /* ---------- Checkout-Wege ---------- */
  const ALL = [];
  for (let n = 20; n >= 1; n--) ALL.push('T' + n);
  for (let n = 20; n >= 1; n--) ALL.push('S' + n);
  ALL.push('SB', 'DB');
  for (let n = 20; n >= 1; n--) ALL.push('D' + n);
  const val = c => { const p = parse(c); return p.n * p.m; };
  const DPREF = ['D20', 'D16', 'D8', 'D18', 'D12', 'D10', 'D4', 'D14', 'D6', 'D2', 'DB', 'D19', 'D17', 'D15', 'D13', 'D11', 'D9', 'D7', 'D5', 'D3', 'D1'];
  function setupCost(c) { const p = parse(c); if (c === 'DB') return 7; if (c === 'SB') return 5; if (p.m === 3) return p.n === 20 ? 0 : p.n === 19 ? 1 : p.n >= 15 ? 2 : 4; if (p.m === 1) return 1.5 + (20 - p.n) * .05; return 6; }
  function finishOk(c, out) { const p = parse(c); return out === 'single' ? true : out === 'master' ? p.m >= 2 : p.m === 2; }
  function finishCost(c, out) { const i = DPREF.indexOf(c); if (i >= 0) return i * .3; const p = parse(c); return out === 'single' ? (p.m === 1 ? 0 : 1) : 4 + (p.m === 3 ? (20 - p.n) * .1 : 0); }
  const coMemo = {};
  // Bester Weg für Rest s mit höchstens d Darts; null = kein Finish möglich
  function checkout(s, d, out) {
    out = out || 'double'; d = d || 3; const key = s + '|' + d + '|' + out; if (key in coMemo) return coMemo[key];
    let best = null, bc = 1e9;
    const fin = ALL.filter(c => finishOk(c, out));
    for (let k = 1; k <= d && !best; k++) {
      if (k === 1) { for (const f of fin) if (val(f) === s) { const c = finishCost(f, out); if (c < bc) { bc = c; best = [f]; } } }
      else if (k === 2) { for (const a of ALL) { const r = s - val(a); if (r <= 0) continue; for (const f of fin) if (val(f) === r) { const c = setupCost(a) + finishCost(f, out); if (c < bc) { bc = c; best = [a, f]; } } } }
      else { for (const a of ALL) for (const b of ALL) { const r = s - val(a) - val(b); if (r <= 0) continue; for (const f of fin) if (val(f) === r) { const c = setupCost(a) + setupCost(b) + finishCost(f, out); if (c < bc) { bc = c; best = [a, b, f]; } } } }
    }
    return (coMemo[key] = best);
  }

  /* ---------- Spielmodi ---------- */
  const CRICKET = [20, 19, 18, 17, 16, 15, 25];
  const HALVE = [15, 16, 'D', 17, 18, 'T', 19, 20, 'B'];
  const CLOCK = [...Array(20).keys()].map(i => i + 1).concat(25);
  const sumTurn = p => p.turn.reduce((a, h) => a + h.v, 0);
  const others = (G, p) => G.players.filter(q => q !== p);

  const MODES = {
    x01: {
      name: 'X01', setup(G) { G.players.forEach(p => { p.score = G.opts.start; p.opened = G.opts.in !== 'double'; }); },
      turnStart(G, p) { p.snap = { score: p.score, opened: p.opened }; },
      dart(G, p, h) {
        if (!p.opened) { if (h.m === 2 || (G.opts.in === 'master' && h.m >= 2)) p.opened = true; else return { msg: h.n ? 'Erst ein Doppel zum Start' : '' }; }
        const ns = p.score - h.v, out = G.opts.out;
        const bust = ns < 0 || (out !== 'single' && ns === 1) || (ns === 0 && !finishOk(h.code === '–' ? 'S1' : h.code, out));
        if (bust) { p.pts -= p.snap.score - p.score; p.score = p.snap.score; p.opened = p.snap.opened; return { bust: true }; }
        p.score = ns; p.pts += h.v;
        if (ns === 0) return { leg: true, checkout: p.snap.score };
        return {};
      },
      aim(G, p, left) {
        const out = G.opts.out;
        if (!p.opened) return G.opts.in === 'master' ? 'T20' : 'D20';
        if (p.score <= 170) { const co = checkout(p.score, left, out); if (co) return co[0]; }
        if (p.score > 230) return 'T20';
        // Kein Finish mit den restlichen Darts: so stellen, dass ein gutes Doppel übrig bleibt
        let best = 'T20', bc = 1e9;
        for (const a of ALL) {
          const r = p.score - val(a); if (r < (out === 'single' ? 1 : 2)) continue;
          const c1 = checkout(r, 1, out), c2 = c1 ? null : checkout(r, 2, out), c3 = c1 || c2 ? null : checkout(r, 3, out);
          const c = setupCost(a) + (c1 ? finishCost(c1[0], out) : c2 ? 6 : c3 ? 10 : 20);
          if (c < bc) { bc = c; best = a; }
        }
        return best;
      },
      rank: G => G.players.slice().sort((a, b) => (b.legs - a.legs) || (a.score - b.score)),
      show: p => String(p.score)
    },
    cricket: {
      name: 'Cricket', rounds: 20,
      setup(G) { G.players.forEach(p => { p.marks = {}; CRICKET.forEach(n => { p.marks[n] = 0; }); p.score = 0; }); },
      dart(G, p, h) {
        if (!CRICKET.includes(h.n)) return {};
        const n = h.n, before = p.marks[n], tot = before + h.m; p.marks[n] = Math.min(3, tot);
        const extra = Math.max(0, tot - 3) - Math.max(0, before - 3), open = others(G, p).filter(q => q.marks[n] < 3), pts = extra * n;
        if (extra && open.length) { if (G.opts.variant === 'cut') open.forEach(q => { q.score += pts; }); else if (G.opts.variant !== 'none') p.score += pts; }
        p.mk += h.m;
        if (CRICKET.every(k => p.marks[k] >= 3)) {
          const o = others(G, p), v = G.opts.variant;
          if (v === 'none' || (v === 'cut' ? o.every(q => p.score <= q.score) : o.every(q => p.score >= q.score))) return { win: true };
        }
        return {};
      },
      aim(G, p) {
        const v = G.opts.variant, o = others(G, p), code = n => n === 25 ? 'DB' : 'T' + n;
        const behind = v === 'cut' ? o.some(q => q.score < p.score) : o.some(q => q.score > p.score);
        const scoring = CRICKET.find(n => p.marks[n] >= 3 && o.some(q => q.marks[n] < 3));
        const open = CRICKET.find(n => p.marks[n] < 3);
        if (v !== 'none' && scoring && (behind || !open)) return code(scoring);
        return open ? code(open) : 'DB';
      },
      rank(G) { const v = G.opts.variant, k = p => CRICKET.reduce((a, n) => a + p.marks[n], 0); return G.players.slice().sort((a, b) => v === 'cut' ? a.score - b.score || k(b) - k(a) : v === 'none' ? k(b) - k(a) : b.score - a.score || k(b) - k(a)); },
      show: (p, G) => G.opts.variant === 'none' ? CRICKET.reduce((a, n) => a + p.marks[n], 0) + ' ✕' : String(p.score)
    },
    elimination: {
      name: 'Elimination',
      setup(G) { G.players.forEach(p => { p.score = 0; }); },
      turnStart(G, p) { p.snap = { score: p.score }; },
      dart(G, p, h) {
        const ns = p.score + h.v;
        if (ns > G.opts.target) { p.score = p.snap.score; return { bust: true }; }
        p.score = ns; p.pts += h.v;
        if (ns === G.opts.target) return { win: true };
        return {};
      },
      turnEnd(G, p, res) {
        if (res.bust || !p.score) return [];
        const out = others(G, p).filter(q => q.score === p.score);
        out.forEach(q => { q.score = 0; q.kicked = (q.kicked || 0) + 1; });
        return out.length ? { kicked: out.map(q => q.name) } : null;
      },
      aim(G, p) {
        const rest = G.opts.target - p.score;
        const prey = others(G, p).filter(q => q.score > p.score && q.score - p.score <= 60).map(q => q.score - p.score);
        for (const d of prey) { const c = exactCode(d); if (c && d <= rest) return c; }
        if (rest <= 60) return exactCode(rest) || 'S' + Math.min(20, rest);
        return 'T20';
      },
      rank: G => G.players.slice().sort((a, b) => b.score - a.score),
      show: p => String(p.score)
    },
    clock: {
      name: 'Around the Clock',
      setup(G) { G.players.forEach(p => { p.next = 0; }); },
      dart(G, p, h) {
        const t = CLOCK[p.next], need = G.opts.variant === 'double' ? 2 : G.opts.variant === 'triple' ? 3 : 0;
        if (h.n !== t || (need && h.m !== need && !(t === 25 && need === 3))) return {};
        p.next += 1;
        if (p.next >= CLOCK.length) return { win: true };
        return { good: true };
      },
      aim(G, p) { const t = CLOCK[p.next], v = G.opts.variant; return t === 25 ? (v === 'double' ? 'DB' : 'SB') : (v === 'double' ? 'D' : v === 'triple' ? 'T' : 'S') + t; },
      rank: G => G.players.slice().sort((a, b) => b.next - a.next || a.darts - b.darts),
      show: p => p.next >= CLOCK.length ? '✔' : '→ ' + (CLOCK[p.next] === 25 ? 'Bull' : CLOCK[p.next])
    },
    shanghai: {
      name: 'Shanghai',
      setup(G) { G.rounds = G.opts.rounds || 7; G.players.forEach(p => { p.score = 0; }); },
      dart(G, p, h) {
        const t = G.round + 1; if (h.n !== t) return {};
        p.score += h.v; p.pts += h.v;
        const ms = p.turn.filter(x => x.n === t).map(x => x.m);
        if (ms.includes(1) && ms.includes(2) && ms.includes(3)) return { win: true, shanghai: true };
        return { good: true };
      },
      aim: (G, p) => 'T' + (G.round + 1),
      rank: G => G.players.slice().sort((a, b) => b.score - a.score),
      show: p => String(p.score)
    },
    killer: {
      name: 'Killer',
      setup(G, rnd) {
        const pool = ORDER.slice(); for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
        G.players.forEach((p, i) => { p.num = pool[i]; p.lives = G.opts.lives || 3; p.killer = false; p.out = false; });
      },
      dart(G, p, h) {
        if (h.m !== 2 || h.n === 25) return {};
        if (h.n === p.num) {
          if (!p.killer) { p.killer = true; return { msg: '🔪 ' + p.name + ' ist jetzt Killer!', good: true }; }
          p.lives--; if (p.lives <= 0) { p.out = true; return Object.assign({ msg: '💀 Eigentor – ' + p.name + ' ist raus' }, lastOne(G)); }
          return { msg: '😬 Eigenes Doppel: ein Leben weg' };
        }
        const q = G.players.find(x => x.num === h.n && !x.out); if (!q || !p.killer) return {};
        q.lives--; if (q.lives <= 0) q.out = true;
        return Object.assign({ msg: q.out ? '💀 ' + q.name + ' ist raus!' : '🎯 ' + q.name + ' verliert ein Leben', good: true }, lastOne(G));
      },
      aim(G, p) {
        if (!p.killer) return 'D' + p.num;
        const o = others(G, p).filter(q => !q.out).sort((a, b) => a.lives - b.lives);
        return o.length ? 'D' + o[0].num : 'D' + p.num;
      },
      skip: p => p.out,
      rank: G => G.players.slice().sort((a, b) => (a.out - b.out) || b.lives - a.lives),
      show: p => p.out ? '💀' : '❤'.repeat(Math.max(0, p.lives)) + (p.killer ? ' 🔪' : '')
    },
    halveit: {
      name: 'Halve-It',
      setup(G) { G.rounds = HALVE.length; G.players.forEach(p => { p.score = 0; }); },
      dart(G, p, h) {
        const t = HALVE[G.round];
        const ok = t === 'D' ? h.m === 2 : t === 'T' ? h.m === 3 : t === 'B' ? h.n === 25 : h.n === t;
        if (!ok) return {};
        p.score += h.v; p.pts += h.v; p.hitT = true; return { good: true };
      },
      turnStart(G, p) { p.hitT = false; },
      turnEnd(G, p) { if (!p.hitT) { p.score = Math.floor(p.score / 2); return { halved: true }; } return null; },
      aim(G) { const t = HALVE[G.round]; return t === 'D' ? 'D20' : t === 'T' ? 'T20' : t === 'B' ? 'SB' : 'T' + t; },
      rank: G => G.players.slice().sort((a, b) => b.score - a.score),
      show: p => String(p.score)
    },
    bobs27: {
      name: "Bob's 27",
      setup(G) { G.rounds = 21; G.players.forEach(p => { p.score = 27; p.out = false; }); },
      dart(G, p, h) { const t = G.round < 20 ? G.round + 1 : 25; if (h.n === t && h.m === 2) { p.dh = (p.dh || 0) + 1; return { good: true }; } return {}; },
      turnStart(G, p) { p.dh = 0; },
      turnEnd(G, p) {
        const t = G.round < 20 ? G.round + 1 : 25, d = t === 25 ? 50 : t * 2;
        if (p.dh) p.score += p.dh * d; else p.score -= d;
        if (p.score < 0) { p.out = true; return { bobOut: true }; }
        return null;
      },
      skip: p => p.out,
      aim: G => G.round < 20 ? 'D' + (G.round + 1) : 'DB',
      rank: G => G.players.slice().sort((a, b) => (a.out - b.out) || b.score - a.score),
      show: p => p.out ? '✖ ' + p.score : String(p.score)
    },
    countup: {
      name: 'Count-Up',
      setup(G) { G.rounds = G.opts.rounds || 8; G.players.forEach(p => { p.score = 0; }); },
      dart(G, p, h) { p.score += h.v; p.pts += h.v; return {}; },
      aim: () => 'T20',
      rank: G => G.players.slice().sort((a, b) => b.score - a.score),
      show: p => String(p.score)
    },
    training: {
      name: 'Training',
      setup(G) { G.players.forEach(p => { p.score = 0; }); },
      dart(G, p, h) { p.score += h.v; p.pts += h.v; return {}; },
      aim: () => 'T20',
      rank: G => G.players.slice(),
      show: p => String(p.score)
    }
  };
  // Ein Dart, der genau d Punkte bringt (für den Computer)
  function exactCode(d) {
    if (d <= 20) return 'S' + d; if (d === 25) return 'SB'; if (d === 50) return 'DB';
    if (d <= 60 && d % 3 === 0) return 'T' + d / 3; if (d <= 40 && d % 2 === 0) return 'D' + d / 2; return null;
  }
  function lastOne(G) { const alive = G.players.filter(p => !p.out); return alive.length === 1 ? { win: true, winner: alive[0] } : {}; }

  /* ---------- Spielablauf ---------- */
  // players: [{ name, cpu }]; opts je Modus (start, in, out, legs, variant, rounds, lives, target)
  function newGame(mode, players, opts, rnd) {
    rnd = rnd || Math.random;
    const M = MODES[mode];
    const G = { mode, M, opts: Object.assign({ start: 501, in: 'single', out: 'double', legs: 1, variant: 'std', target: 301, lives: 3 }, opts), players: players.map((p, i) => Object.assign({ i, legs: 0, darts: 0, pts: 0, turn: [], best: 0, n180: 0, n140: 0, n100: 0, hiCo: 0, turns: 0, first9: 0, mk: 0 }, p)), cur: 0, round: 0, rounds: M.rounds || 0, leg: 0, starter: 0, over: false, winner: null, turnOver: false, last: null, log: [] };
    M.setup(G, rnd);
    if (opts && opts.rounds && M !== MODES.x01) G.rounds = opts.rounds;
    startTurn(G);
    return G;
  }
  function startTurn(G) { const p = G.players[G.cur]; p.turn = []; G.turnOver = false; G.last = null; if (G.M.turnStart) G.M.turnStart(G, p); }
  const curPlayer = G => G.players[G.cur];
  // Ein Dart: h aus hit(). Ergebnis: { bust, leg, win, over, msg, turnOver }
  function throwDart(G, h) {
    if (G.over || G.turnOver) return { ignored: true };
    const p = curPlayer(G); p.turn.push(h); p.darts++;
    const r = G.M.dart(G, p, h) || {};
    let res = Object.assign({ hit: h }, r);
    if (r.leg) {
      p.legs++; if (r.checkout) p.hiCo = Math.max(p.hiCo, r.checkout);
      if (p.legs >= (G.opts.legs || 1)) { G.over = true; G.winner = p; res.over = true; }
      else res.legWon = true;
      G.turnOver = true;
    } else if (r.win) { G.over = true; G.winner = r.winner || p; res.over = true; G.turnOver = true; }
    else if (r.bust) G.turnOver = true;
    else if (p.turn.length >= 3) G.turnOver = true;
    if (G.turnOver) {
      const t = sumTurn(p); p.turns++;
      if (G.mode === 'x01' && !r.bust) { if (t === 180) p.n180++; else if (t >= 140) p.n140++; else if (t >= 100) p.n100++; p.best = Math.max(p.best, t); if (p.turns <= 3) p.first9 += t; }
      if (G.M.turnEnd && !G.over) res.after = G.M.turnEnd(G, p, res);
      res.turnOver = true; res.total = t;
    }
    G.last = res; G.log.push({ p: p.i, code: h.code, v: h.v });
    return res;
  }
  // Nächster Spieler (nach der Animation aufrufen). Liefert { over, legStart, roundEnd }
  function nextTurn(G) {
    if (G.over) return { over: true };
    const r = {};
    if (G.last && G.last.legWon) {
      G.leg++; G.starter = (G.starter + 1) % G.players.length; G.cur = G.starter; G.round = 0;
      G.players.forEach(p => { p.score = G.opts.start; p.opened = G.opts.in !== 'double'; });
      r.legStart = true; startTurn(G); return r;
    }
    const n = G.players.length; let k = 0;
    do {
      G.cur = (G.cur + 1) % n; k++;
      if (G.cur === G.starter) { G.round++; r.roundEnd = true; if (G.rounds && G.round >= G.rounds) return finish(G); }
    } while (G.M.skip && G.M.skip(G.players[G.cur]) && k < n * 2 + 2);
    if (G.M.skip && G.players.every(p => G.M.skip(p))) return finish(G);
    startTurn(G); return r;
  }
  function finish(G) { G.over = true; const rk = G.M.rank(G); G.winner = rk[0]; return { over: true }; }
  const ranking = G => G.M.rank(G);
  const avg = p => p.darts ? p.pts / p.darts * 3 : 0;

  /* ---------- Computer ---------- */
  const LEVEL = [{ n: 'Leicht', i: '🙂', sd: 30, d: 'Schnitt um 35' }, { n: 'Mittel', i: '😎', sd: 17, d: 'Schnitt um 60' }, { n: 'Profi', i: '🔥', sd: 8.5, d: 'Schnitt um 90' }];
  function cpuAim(G, lvl) {
    const p = curPlayer(G), left = 3 - p.turn.length;
    let code = G.M.aim(G, p, left);
    // Schwache Spieler zielen bei Triple-Zielen lieber aufs große Single (außer X01-Scoring)
    if (lvl === 0 && /^T/.test(code) && G.mode !== 'x01' && G.mode !== 'countup') code = 'S' + code.slice(1);
    return code;
  }
  function cpuThrow(G, lvl, rnd) {
    rnd = rnd || Math.random; const code = cpuAim(G, lvl), t = parse(code), a = aimPoint(t.n, t.m), sd = LEVEL[lvl].sd;
    const x = a.x + gauss(rnd) * sd, y = a.y + gauss(rnd) * sd;
    return { code, aim: a, x, y, hit: hit(x, y) };
  }

  const api = { R_IB, R_OB, R_TI, R_TO, R_DI, R_DO, R_BOARD, ORDER, CRICKET, HALVE, CLOCK, MODES, LEVEL, hit, aimPoint, parse, label, gauss, checkout, newGame, throwDart, nextTurn, ranking, curPlayer, avg, cpuAim, cpuThrow, sumTurn, exactCode };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DA = api;
})(typeof window !== 'undefined' ? window : globalThis);
