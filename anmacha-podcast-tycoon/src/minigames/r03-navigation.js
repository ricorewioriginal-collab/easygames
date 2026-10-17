/* R03 Roadtrip-Navigation: Mit dem Podcast-Bus Kante für Kante über die Landkarte fahren und die Wegpunkte
   (Tankstelle, Campingplatz, …, Interviewort) in der richtigen Reihenfolge besuchen. Staus kosten Zeit, Baustellen sind gesperrt. */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  const WP = [{ i: '⛽', n: 'Tankstelle' }, { i: '⛺', n: 'Campingplatz' }, { i: '🏞️', n: 'Aussichtspunkt' }, { i: '🎙️', n: 'Interviewort' }];
  const CFG = [
    { time: 75, slack: 1.5, wps: [0, 3], stau: 3, closed: 2, undo: true, radio: false },
    { time: 70, slack: 1.3, wps: [0, 1, 3], stau: 4, closed: 3, undo: true, radio: false },
    { time: 70, slack: 1.15, wps: [0, 1, 2, 3], stau: 5, closed: 4, undo: false, radio: true }
  ];
  const COLS = 6, ROWS = 4;
  function nbrs(st, a) { const out = []; st.edges.forEach((e, k) => { if (!e.closed && (e.a === a || e.b === a)) out.push({ n: e.a === a ? e.b : e.a, k }); }); return out; }
  function connected(st) { const seen = { 0: 1 }, q = [0]; while (q.length) nbrs(st, q.pop()).forEach(o => { if (!seen[o.n]) { seen[o.n] = 1; q.push(o.n); } }); return Object.keys(seen).length === st.nodes.length; }
  function sp(st, from, to) { // Dijkstra über offene Straßen
    const n = st.nodes.length, dist = new Array(n).fill(1e9), prev = new Array(n).fill(-1), done = [];
    dist[from] = 0;
    for (;;) {
      let u = -1; for (let i = 0; i < n; i++) if (!done[i] && dist[i] < 1e9 && (u < 0 || dist[i] < dist[u])) u = i;
      if (u < 0 || u === to) break; done[u] = 1;
      nbrs(st, u).forEach(o => { const e = st.edges[o.k], c = dist[u] + e.min + e.stau; if (c < dist[o.n]) { dist[o.n] = c; prev[o.n] = u; } });
    }
    const path = [to]; while (path[0] !== from && prev[path[0]] >= 0) path.unshift(prev[path[0]]);
    return { cost: dist[to], path };
  }
  function edgeOf(st, a, b) { return st.edges.findIndex(e => !e.closed && (e.a === a && e.b === b || e.a === b && e.b === a)); }
  function drive(st, to) {
    const k = edgeOf(st, st.at, to); if (k < 0 || st.status !== 'playing') return;
    const e = st.edges[k];
    st.hist.push({ at: st.at, used: st.used, gi: st.gi });
    st.used += e.min + e.stau; st.anim = { from: st.at, to, p: 0 }; st.at = to; st.moves++;
    MG.fx(st, e.stau ? 'buzz' : 'whoosh');
    if (st.wps[st.gi] === to) { st.gi++; MG.fx(st, 'coin'); }
    if (st.cfg.radio && st.moves === 1) { // Radiomeldung: neuer Stau abseits der besten Route
      const cand = st.edges.map((x, i) => i).filter(i => !st.edges[i].closed && !st.edges[i].stau && st.optEdges.indexOf(i) < 0);
      if (cand.length) { const j = PT.pick(st, cand); st.edges[j].stau = 15; st.radio = 'Radio: Neuer Stau, +15 Min! (rot markiert)'; MG.fx(st, 'beep'); }
    }
    if (st.used > st.budget) MG.finish(st, false);
    else if (st.gi >= st.wps.length) MG.finish(st, true);
    st.sel = -1;
  }
  function pickDir(st, dx, dy) {
    const p = st.nodes[st.at], list = nbrs(st, st.at).map(o => { const q = st.nodes[o.n], l = Math.hypot(q.x - p.x, q.y - p.y); return { n: o.n, d: ((q.x - p.x) * dx + (q.y - p.y) * dy) / l }; })
      .filter(o => o.d > 0.2).sort((a, b) => b.d - a.d);
    if (!list.length) return;
    const i = list.findIndex(o => o.n === st.sel);
    st.sel = list[i >= 0 ? (i + 1) % list.length : 0].n; MG.fx(st, 'click');
  }
  MG.define({
    id: 'R03', group: 'roadtrip', name: 'Roadtrip-Navigation', icon: '🗺️',
    short: 'Plane die Tour Straße für Straße – Wegpunkte in der richtigen Reihenfolge, ohne das Zeitbudget zu sprengen.',
    rules: [
      'Besuche die Wegpunkte in der angezeigten Reihenfolge – der Interviewort kommt zuletzt.',
      'Jede Straße kostet Reiseminuten. Stau (rot) kostet extra, Baustellen (🚧) sind gesperrt.',
      'Überschreitest du das Zeitbudget oder läuft die Planungszeit ab, ist der Termin geplatzt.',
      'Locker/Standard: Q nimmt die letzte Fahrt zurück. Profi: Achtung, Radiomeldungen!'
    ],
    controls: { key: 'Pfeile wählen eine Straße (nochmal drücken = nächste), Leertaste fährt, Q zurück', touch: 'Nachbarort antippen = hinfahren', pad: 'Steuerkreuz wählen, A fahren, B zurück' },
    touch: ['left', 'right', 'up', 'down', 'a', 'b'],
    init(o) {
      const d = o.difficulty | 0, c = CFG[d];
      const st = { status: 'playing', seed: (o.seed >>> 0) || 1, fx: [], diff: d, cfg: c, t: 0, used: 0, gi: 0, moves: 0, hist: [], sel: -1, anim: null, radio: '', nodes: [], edges: [] };
      for (let r = 0; r < ROWS; r++) for (let q = 0; q < COLS; q++) st.nodes.push({ x: 95 + q * 154 + PT.randInt(st, -28, 28), y: 145 + r * 112 + PT.randInt(st, -20, 20) });
      const add = (a, b) => { const A = st.nodes[a], B = st.nodes[b]; st.edges.push({ a, b, min: Math.round(Math.hypot(A.x - B.x, A.y - B.y) / 154 * 16) + PT.randInt(st, 0, 6), stau: 0, closed: false }); };
      for (let r = 0; r < ROWS; r++) for (let q = 0; q < COLS; q++) {
        const i = r * COLS + q;
        if (q < COLS - 1) add(i, i + 1);
        if (r < ROWS - 1) add(i, i + COLS);
        if (q < COLS - 1 && r < ROWS - 1) { const x = PT.rand(st); if (x < 0.22) add(i, i + COLS + 1); else if (x < 0.44) add(i + 1, i + COLS); }
      }
      const close = (n, rm) => { for (let k = 0, tries = 0; k < n && tries < 200; tries++) { const e = PT.pick(st, st.edges); if (e.closed) continue; e.closed = true; if (connected(st)) { k++; if (rm) e.gone = true; } else e.closed = false; } };
      close(3, true); st.edges = st.edges.filter(e => !e.gone);
      close(c.closed, false);
      for (let k = 0; k < c.stau;) { const e = PT.pick(st, st.edges); if (!e.closed && !e.stau) { e.stau = PT.randInt(st, 10, 25); k++; } }
      st.at = PT.randInt(st, 0, st.nodes.length - 1);
      const taken = [st.at]; st.wps = [];
      c.wps.forEach(() => {
        let n, tries = 0, prev = st.nodes[taken[taken.length - 1]];
        do n = PT.randInt(st, 0, st.nodes.length - 1); while ((taken.indexOf(n) >= 0 || Math.hypot(st.nodes[n].x - prev.x, st.nodes[n].y - prev.y) < 260) && ++tries < 300);
        if (taken.indexOf(n) >= 0) n = st.nodes.findIndex((x, i) => taken.indexOf(i) < 0);
        taken.push(n); st.wps.push(n);
      });
      let opt = 0, from = st.at; st.optEdges = [];
      st.wps.forEach(w => { const r = sp(st, from, w); opt += r.cost; for (let i = 1; i < r.path.length; i++) st.optEdges.push(edgeOf(st, r.path[i - 1], r.path[i])); from = w; });
      st.opt = opt; st.budget = Math.round(opt * c.slack);
      st.start = st.at;
      return st;
    },
    input(st, a) {
      if (st.status !== 'playing') return;
      if (a.type === 'key' && a.down) {
        const D = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] }[a.key];
        if (D) pickDir(st, D[0], D[1]);
        else if (a.key === 'a' && st.sel >= 0) drive(st, st.sel);
        else if (a.key === 'b' && st.cfg.undo && st.hist.length) { const h = st.hist.pop(); st.at = h.at; st.used = h.used; st.gi = h.gi; st.anim = null; st.sel = -1; MG.fx(st, 'pop'); }
      }
      if (a.type === 'pointer' && a.phase === 'down') {
        const i = st.nodes.findIndex(p => Math.hypot(p.x - a.x, p.y - a.y) < 34);
        if (i >= 0 && edgeOf(st, st.at, i) >= 0) drive(st, i); else if (i >= 0 && i !== st.at) { st.radio = 'Dorthin führt keine offene Straße von hier.'; MG.fx(st, 'buzz'); }
      }
    },
    update(st, dt) {
      if (st.status !== 'playing') return;
      st.t += dt;
      if (st.anim) { st.anim.p += dt * 2.5; if (st.anim.p >= 1) st.anim = null; }
      if (st.t >= st.cfg.time) MG.finish(st, false);
    },
    result(st) {
      if (st.status === 'won') return { won: true, score: Math.round(PT.clamp(50 + 40 * (st.budget - st.used) / Math.max(1, st.budget - st.opt * 0.9) + 10 * (1 - st.t / st.cfg.time), 50, 100)), detail: 'Tour geschafft in ' + st.used + ' von ' + st.budget + ' Reiseminuten.' };
      return { won: false, score: Math.round(PT.clamp(40 * st.gi / st.wps.length, 0, 49)), detail: (st.used > st.budget ? 'Zeitbudget überzogen (' + st.used + ' / ' + st.budget + ' Min)' : 'Planungszeit abgelaufen') + ' – ' + st.gi + ' von ' + st.wps.length + ' Wegpunkten erreicht.' };
    },
    bot(st, goal) {
      let to;
      if (goal === 'lose') { const ns = nbrs(st, st.at); ns.sort((x, y) => st.edges[y.k].min + st.edges[y.k].stau - st.edges[x.k].min - st.edges[x.k].stau); to = st.moves % 2 && st.hist.length ? st.hist[st.hist.length - 1].at : ns[0].n; }
      else to = sp(st, st.at, st.wps[st.gi]).path[1];
      const p = st.nodes[to];
      return [{ type: 'pointer', phase: 'down', x: p.x, y: p.y }, { type: 'pointer', phase: 'up', x: p.x, y: p.y }];
    },
    draw2d(g, st) {
      const c = st.cfg, N = st.nodes;
      g.fillStyle = '#10142a'; g.fillRect(0, 0, 960, 540);
      g.fillStyle = '#16213a'; g.fillRect(20, 92, 920, 440);
      g.lineCap = 'round';
      st.edges.forEach(e => {
        const A = N[e.a], B = N[e.b], sel = st.sel >= 0 && (e.a === st.at && e.b === st.sel || e.b === st.at && e.a === st.sel);
        if (sel) { g.strokeStyle = '#ffb02e'; g.lineWidth = 14; g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(B.x, B.y); g.stroke(); }
        g.strokeStyle = e.closed ? '#6b5a3a' : e.stau ? '#ff4d6d' : '#55608f'; g.lineWidth = 6;
        if (g.setLineDash) g.setLineDash(e.closed ? [8, 10] : []);
        g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(B.x, B.y); g.stroke();
      });
      if (g.setLineDash) g.setLineDash([]);
      g.textAlign = 'center'; g.font = '600 18px system-ui';
      st.edges.forEach(e => {
        const mx = (N[e.a].x + N[e.b].x) / 2, my = (N[e.a].y + N[e.b].y) / 2;
        if (e.closed) { g.fillText('🚧', mx, my + 7); return; }
        const s = e.stau ? (e.min + e.stau) + '' : e.min + '';
        g.fillStyle = e.stau ? '#ff4d6d' : '#10142a'; g.fillRect(mx - 18, my - 12, 36, 24);
        g.fillStyle = '#fff'; g.fillText(s, mx, my + 6);
      });
      N.forEach((p, i) => {
        const w = st.wps.indexOf(i), nb = edgeOf(st, st.at, i) >= 0;
        g.fillStyle = w >= 0 ? (w < st.gi ? '#4be08a' : w === st.gi ? '#ffb02e' : '#6ef0ff') : nb ? '#cfd6ff' : '#7a86b0';
        g.beginPath(); g.arc(p.x, p.y, w >= 0 ? 20 : nb ? 11 : 8, 0, 7); g.fill();
        if (w >= 0) { g.font = '22px system-ui'; g.fillText(WP[c.wps[w]].i, p.x, p.y + 8); g.fillStyle = '#fff'; g.font = '700 18px system-ui'; g.fillText(w < st.gi ? '✓' : (w + 1) + '', p.x + 22, p.y - 16); }
        if (i === st.sel) { g.strokeStyle = '#ffb02e'; g.lineWidth = 4; g.beginPath(); g.arc(p.x, p.y, 26, 0, 7); g.stroke(); }
      });
      let vx = N[st.at].x, vy = N[st.at].y;
      if (st.anim) { const A = N[st.anim.from], q = Math.min(1, st.anim.p); vx = PT.lerp(A.x, vx, q); vy = PT.lerp(A.y, vy, q); }
      g.font = '34px system-ui'; g.fillText('🚐', vx, vy - 14);
      g.textAlign = 'left'; g.font = '700 22px system-ui'; g.fillStyle = c.time - st.t < 10 ? '#ff4d6d' : '#fff';
      g.fillText('⏱ ' + Math.ceil(Math.max(0, c.time - st.t)) + ' s', 20, 34);
      g.fillStyle = st.used > st.budget * 0.85 ? '#ff4d6d' : '#4be08a'; g.fillText('Reisezeit ' + st.used + ' / ' + st.budget + ' Min', 130, 34);
      g.fillStyle = '#fff'; g.textAlign = 'right';
      const nx = st.wps[st.gi]; g.fillText(nx != null ? 'Nächstes Ziel: ' + WP[c.wps[st.gi]].i + ' ' + WP[c.wps[st.gi]].n : 'Angekommen!', 940, 34);
      g.textAlign = 'left'; g.font = '18px system-ui'; g.fillStyle = st.radio ? '#ffc84a' : '#9aa3cf';
      g.fillText(st.radio || 'Zahlen = Minuten · rot = Stau · 🚧 = gesperrt' + (c.undo ? ' · Q = zurück' : ''), 20, 70);
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
