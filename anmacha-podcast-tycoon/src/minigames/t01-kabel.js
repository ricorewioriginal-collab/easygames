/* T01 Kabelnetz: Auf dem Studioboden-Raster liegen Anschlüsse mit Signaltypen (XLR, USB, Klinke, HDMI, Strom).
   Jedes Paar gleicher Farbe mit einem Kabel auf Rasterwegen verbinden – Kabel dürfen sich nicht kreuzen,
   nicht über Möbel laufen, und die Kabelrolle ist begrenzt. Falsche Stecker kosten Zeit. */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  const TYPES = [
    { t: 'XLR', col: '#ffb02e' }, { t: 'USB', col: '#6ef0ff' }, { t: 'Klinke', col: '#ff4d6d' },
    { t: 'HDMI', col: '#4be08a' }, { t: 'Strom', col: '#c89bff' }
  ];
  const CFG = [ // Locker, Standard, Profi
    { w: 6, h: 5, pairs: 3, obst: 0, slack: 8, time: 60 },
    { w: 7, h: 6, pairs: 4, obst: 3, slack: 4, time: 75 },
    { w: 8, h: 6, pairs: 5, obst: 5, slack: 2, time: 90 }
  ];
  function geo(st) {
    const c = st.cfg, cs = Math.min(Math.floor(700 / c.w), Math.floor(400 / c.h));
    return { cs, x0: Math.round(380 - c.w * cs / 2) + 20, y0: 100 + Math.round((420 - c.h * cs) / 2) };
  }
  const adj = (st, a, b) => { const w = st.cfg.w; return Math.abs(a % w - b % w) + Math.abs(Math.floor(a / w) - Math.floor(b / w)) === 1; };
  function walk(st, used, len) {
    const c = st.cfg, w = c.w, free = [];
    for (let i = 0; i < used.length; i++) if (used[i] < 0) free.push(i);
    if (!free.length) return null;
    const path = [PT.pick(st, free)];
    let dir = PT.randInt(st, 0, 3);
    const D = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    while (path.length < len) {
      const cur = path[path.length - 1], x = cur % w, y = Math.floor(cur / w), opts = [];
      for (let k = 0; k < 4; k++) {
        const X = x + D[k][0], Y = y + D[k][1], i = Y * w + X;
        if (X >= 0 && Y >= 0 && X < w && Y < c.h && used[i] < 0 && path.indexOf(i) < 0) opts.push(k);
      }
      if (!opts.length) break;
      if (opts.indexOf(dir) < 0 || PT.rand(st) < 0.4) dir = PT.pick(st, opts);
      path.push((y + D[dir][1]) * w + x + D[dir][0]);
    }
    const a = path[0], b = path[path.length - 1];
    return path.length >= 4 && Math.abs(a % w - b % w) + Math.abs(Math.floor(a / w) - Math.floor(b / w)) >= 2 ? path : null;
  }
  function generate(st) {
    const c = st.cfg, N = c.w * c.h;
    for (let pairs = c.pairs; ; pairs--) {
      for (let tries = 0; tries < 300; tries++) {
        const used = new Array(N).fill(-1), sol = [];
        for (let p = 0; p < pairs; p++) {
          let path = null;
          for (let k = 0; k < 30 && !path; k++) path = walk(st, used, PT.randInt(st, 4, 4 + Math.floor((c.w + c.h) / 2)));
          if (!path) break;
          path.forEach(i => { used[i] = p; }); sol.push(path);
        }
        if (sol.length < pairs) continue;
        const free = PT.shuffle(st, used.map((u, i) => i).filter(i => used[i] < 0));
        const cell = used.map(() => 0); // 0 frei, -1 Möbel, p+1 Anschluss von Paar p
        for (let k = 0; k < c.obst && k < free.length; k++) cell[free[k]] = -1;
        sol.forEach((s, p) => { cell[s[0]] = p + 1; cell[s[s.length - 1]] = p + 1; });
        return { sol, cell, budget: sol.reduce((n, s) => n + s.length - 1, 0) + c.slack };
      }
    }
  }
  const usedLen = st => st.paths.reduce((n, p) => n + Math.max(0, p.length - 1), 0);
  function clearPath(st, p) { st.paths[p].forEach(i => { if (st.occ[i] === p) st.occ[i] = -1; }); st.paths[p] = []; st.done[p] = false; if (st.drawing === p) st.drawing = -1; }
  function truncate(st, p, k) { const path = st.paths[p]; for (let j = k + 1; j < path.length; j++) st.occ[path[j]] = -1; path.length = k + 1; st.done[p] = false; }
  function grab(st, i) { // Zeiger/Taste auf eine Zelle: Anschluss = neu beginnen, Kabelstück = dort weiterziehen
    const port = st.cell[i] - 1;
    if (port >= 0) { clearPath(st, port); st.paths[port].push(i); st.occ[i] = port; st.drawing = port; st.cur = i; MG.fx(st, 'click'); return true; }
    const p = st.occ[i];
    if (p >= 0) { truncate(st, p, st.paths[p].indexOf(i)); st.drawing = p; st.cur = i; return true; }
    return false;
  }
  function step(st, i) {
    const p = st.drawing, path = st.paths[p], k = path.indexOf(i);
    if (k >= 0) { truncate(st, p, k); st.cur = i; return true; }
    const kind = st.cell[i];
    if (kind === -1) { MG.fx(st, 'buzz'); st.msg = 'Da steht ein Möbelstück im Weg!'; st.msgT = 1.5; return false; }
    if (kind > 0 && kind - 1 !== p) {
      st.wrong++; st.t += 2; MG.fx(st, 'bad'); st.msg = 'Falscher Stecker: ' + TYPES[kind - 1].t + ' passt nicht zu ' + TYPES[p].t + ' (−2 s)'; st.msgT = 2; return false;
    }
    if (st.occ[i] >= 0) { MG.fx(st, 'buzz'); st.msg = 'Kabel dürfen sich nicht kreuzen.'; st.msgT = 1.5; return false; }
    if (usedLen(st) >= st.budget) { MG.fx(st, 'buzz'); st.msg = 'Die Kabelrolle ist leer – kürzere Wege!'; st.msgT = 1.5; return false; }
    path.push(i); st.occ[i] = p; st.cur = i;
    if (kind - 1 === p) {
      st.done[p] = true; st.drawing = -1; MG.fx(st, 'good');
      if (st.done.every(Boolean)) MG.finish(st, true);
    } else MG.fx(st, 'tick');
    return true;
  }
  MG.define({
    id: 'T01', group: 'tec', name: 'Kabelnetz', icon: '🔌',
    short: 'Gleiche Anschlüsse verkabeln – ohne Kreuzung, ohne Kabelsalat.',
    rules: [
      'Verbinde jedes Anschlusspaar gleicher Farbe und gleichen Typs mit einem Kabel.',
      'Kabel laufen auf dem Raster, kreuzen sich nicht und meiden Möbel (graue Felder).',
      'Die Kabelrolle ist begrenzt – zu lange Umwege gehen nicht.',
      'Ein Kabel an den falschen Stecker kostet 2 Sekunden.',
      'Alle Paare verbunden = gewonnen. Zeit abgelaufen = verloren.'
    ],
    goal: d => 'Verbinde alle ' + CFG[d].pairs + ' Farbpaare (je zwei gleiche Kreise) mit einem Kabel – ohne Kreuzung, innerhalb von ' + CFG[d].time + ' s.',
    how: [
      'Auf dem Boden liegen Anschlüsse als farbige Kreise – jede Farbe gibt es genau zweimal.',
      'Drück auf einen Kreis und zieh mit dem Finger/der Maus Feld für Feld zum zweiten Kreis gleicher Farbe.',
      'Kabel dürfen sich nicht kreuzen und nicht über Möbel 🪑. Das Kabel ist begrenzt (Anzeige rechts).',
      'Verlegt? Einfach neu vom Kreis aus ziehen. Falscher Stecker kostet 2 s.'
    ],
    pic: '<svg viewBox="0 0 340 92"><rect width="340" height="92" rx="10" fill="#10142a"/><g fill="#171c3a"><rect x="20" y="10" width="300" height="62"/></g><path d="M50 26 H170 V56 H290" stroke="#ffb02e" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="50" cy="26" r="12" fill="#ffb02e"/><circle cx="290" cy="56" r="12" fill="#ffb02e"/><text x="170" y="86" fill="#cfd6ff" font-size="12" text-anchor="middle">vom Kreis zum gleichfarbigen Kreis ziehen</text></svg>',
    tip: { key: 'Leertaste auf einem Kreis, dann mit den Pfeilen zum gleichfarbigen Kreis', touch: 'Drück auf einen Kreis und zieh zum Kreis gleicher Farbe', y: 300 },
    controls: { key: 'Pfeile bewegen den Rahmen, Leertaste auf einem Kreis = Kabel starten, dann Pfeile; E: Kabel löschen', touch: 'Auf einen Kreis drücken und zum gleichfarbigen Kreis ziehen', mouse: 'Auf einen Kreis klicken und mit gedrückter Taste zum gleichfarbigen Kreis ziehen', pad: 'Steuerkreuz, A Kabel starten/ablegen, B löschen' },
    touch: ['left', 'right', 'up', 'down', 'a', 'b'],
    multi: { local: true, max: 4, mode: 'turns' },
    init(o) {
      const c = CFG[o.difficulty | 0];
      const st = { status: 'playing', seed: (o.seed >>> 0) || 1, fx: [], diff: o.difficulty | 0, cfg: c, t: 0, wrong: 0, cur: 0, drawing: -1, ptr: false, msg: 'Zieh die Kabel!', msgT: 2 };
      const g = generate(st);
      st.cell = g.cell; st.sol = g.sol; st.budget = g.budget; st.pairs = g.sol.length;
      st.paths = g.sol.map(() => []); st.done = g.sol.map(() => false); st.occ = g.cell.map(() => -1);
      st.cur = g.sol[0][0];
      return st;
    },
    input(st, a) {
      if (st.status !== 'playing') return;
      const c = st.cfg, w = c.w;
      if (a.type === 'key' && a.down) {
        const x = st.cur % w, y = Math.floor(st.cur / w);
        const nxt = a.key === 'left' && x > 0 ? st.cur - 1 : a.key === 'right' && x < w - 1 ? st.cur + 1 : a.key === 'up' && y > 0 ? st.cur - w : a.key === 'down' && y < c.h - 1 ? st.cur + w : -1;
        if (nxt >= 0) { if (st.drawing >= 0) step(st, nxt); else st.cur = nxt; }
        else if (a.key === 'a') { if (st.drawing >= 0) st.drawing = -1; else if (!grab(st, st.cur)) MG.fx(st, 'buzz'); }
        else if (a.key === 'b') { const p = st.cell[st.cur] > 0 ? st.cell[st.cur] - 1 : st.occ[st.cur]; if (p >= 0) { clearPath(st, p); MG.fx(st, 'pop'); } }
      } else if (a.type === 'pointer') {
        const G = geo(st), X = Math.floor((a.x - G.x0) / G.cs), Y = Math.floor((a.y - G.y0) / G.cs);
        if (a.phase === 'up') { st.ptr = false; st.drawing = -1; return; }
        if (X < 0 || Y < 0 || X >= w || Y >= c.h) return;
        const i = Y * w + X;
        if (a.phase === 'down') { st.ptr = grab(st, i); if (!st.ptr) st.cur = i; return; }
        if (!st.ptr || st.drawing < 0 || i === st.cur) return;
        for (let n = 0; n < 30 && st.cur !== i && st.drawing >= 0; n++) { // Zeiger springt: Feld für Feld nachziehen
          const cx = st.cur % w, cy = Math.floor(st.cur / w);
          const nxt = cx !== X ? st.cur + (X > cx ? 1 : -1) : st.cur + (Y > cy ? w : -w);
          if (!step(st, nxt)) break;
        }
      }
    },
    update(st, dt) {
      if (st.status !== 'playing') return;
      st.t += dt; st.msgT -= dt;
      if (st.t >= st.cfg.time) MG.finish(st, false);
    },
    result(st) {
      const c = st.cfg, won = st.status === 'won', left = Math.max(0, c.time - st.t), n = st.done.filter(Boolean).length;
      const score = won ? PT.clamp(Math.round(55 + 45 * left / c.time - st.wrong * 3), 50, 100) : PT.clamp(Math.round(45 * n / st.pairs), 0, 49);
      return { won, score, detail: won ? 'Alles verkabelt mit ' + Math.round(left) + ' s Rest und ' + (st.budget - usedLen(st)) + ' m Kabel übrig.' : 'Zeit abgelaufen: nur ' + n + ' von ' + st.pairs + ' Farbpaaren verbunden – das Studio bleibt stumm.' };
    },
    bot(st, goal) {
      if (goal === 'lose') return [];
      const p = st.done.indexOf(false), G = geo(st), w = st.cfg.w, path = st.sol[p];
      const at = i => ({ type: 'pointer', phase: 'move', x: G.x0 + (i % w + 0.5) * G.cs, y: G.y0 + (Math.floor(i / w) + 0.5) * G.cs });
      if (st.drawing !== p || st.paths[p][0] !== path[0]) { const a = at(path[0]); a.phase = 'down'; return [a]; }
      return [at(path[st.paths[p].length])];
    },
    draw2d(g, st) {
      const c = st.cfg, G = geo(st), cs = G.cs, w = c.w;
      g.fillStyle = '#10142a'; g.fillRect(0, 0, 960, 540);
      g.font = '600 22px system-ui'; g.textAlign = 'left'; g.fillStyle = '#ffb02e'; g.fillText('🔌 Kabelnetz', 24, 36);
      g.textAlign = 'right'; g.fillStyle = '#cfd6ff'; g.fillText('⏱ ' + Math.max(0, c.time - st.t).toFixed(0) + ' s', 900, 36);
      g.font = '18px system-ui'; g.textAlign = 'center'; g.fillStyle = st.msgT > 0 ? '#ffb02e' : '#8f98c8';
      const nDone = st.done.filter(Boolean).length;
      g.fillText(st.msgT > 0 ? st.msg : st.drawing >= 0 ? 'Weiter zum zweiten ' + TYPES[st.drawing].t + '-Kreis …' : 'Zieh vom Kreis zum Kreis gleicher Farbe · verbunden: ' + nDone + ' von ' + st.pairs, 400, 78);
      for (let i = 0; i < st.cell.length; i++) {
        const x = G.x0 + (i % w) * cs, y = G.y0 + Math.floor(i / w) * cs;
        g.fillStyle = st.cell[i] === -1 ? '#3a3f58' : '#171c3a'; g.fillRect(x + 1, y + 1, cs - 2, cs - 2);
        if (st.cell[i] === -1) { g.fillStyle = '#8f98c8'; g.font = '22px system-ui'; g.fillText('🪑', x + cs / 2, y + cs / 2 + 8); }
      }
      g.lineCap = 'round'; g.lineJoin = 'round';
      for (let p = 0; p < st.pairs; p++) {
        const path = st.paths[p]; if (path.length < 2) continue;
        g.strokeStyle = TYPES[p].col; g.lineWidth = cs * 0.28; g.beginPath();
        for (let k = 0; k < path.length; k++) { const x = G.x0 + (path[k] % w + 0.5) * cs, y = G.y0 + (Math.floor(path[k] / w) + 0.5) * cs; k ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.stroke();
      }
      for (let i = 0; i < st.cell.length; i++) {
        const p = st.cell[i] - 1; if (p < 0) continue;
        const x = G.x0 + (i % w + 0.5) * cs, y = G.y0 + (Math.floor(i / w) + 0.5) * cs;
        g.fillStyle = TYPES[p].col; g.beginPath(); g.arc(x, y, cs * 0.4, 0, 6.283); g.fill();
        if (st.done[p]) { g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.stroke(); }
        else { g.strokeStyle = 'rgba(255,255,255,' + (0.35 + 0.3 * Math.sin(st.t * 5)) + ')'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, cs * 0.46, 0, 6.283); g.stroke(); }
        let fz = 18; g.font = '600 18px system-ui'; while (fz > 12 && g.measureText(TYPES[p].t).width > cs * 0.74) { fz--; g.font = '600 ' + fz + 'px system-ui'; }
        g.fillStyle = '#10142a'; g.fillText(TYPES[p].t, x, y + fz / 3);
      }
      const cx = G.x0 + (st.cur % w) * cs, cy = G.y0 + Math.floor(st.cur / w) * cs;
      g.strokeStyle = st.drawing >= 0 ? TYPES[st.drawing].col : '#ffffff'; g.lineWidth = 3; g.strokeRect(cx + 3, cy + 3, cs - 6, cs - 6);
      // Seitenleiste
      g.textAlign = 'left'; g.font = '600 20px system-ui'; g.fillStyle = '#cfd6ff'; g.fillText('Verbunden ' + st.done.filter(Boolean).length + '/' + st.pairs, 770, 120);
      g.font = '18px system-ui';
      for (let p = 0; p < st.pairs; p++) { g.fillStyle = TYPES[p].col; g.fillText((st.done[p] ? '✓ ' : '○ ') + TYPES[p].t, 780, 154 + p * 30); }
      const left = st.budget - usedLen(st);
      g.fillStyle = '#cfd6ff'; g.fillText('🧵 Kabel übrig:', 770, 330); g.fillStyle = left < 3 ? '#ff4d6d' : '#4be08a'; g.fillText(left + ' m übrig', 780, 358);
      g.fillStyle = '#cfd6ff'; g.fillText('Falsche Stecker: ' + st.wrong, 770, 400);
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
