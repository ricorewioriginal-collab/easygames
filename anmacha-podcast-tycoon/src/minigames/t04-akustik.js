/* T04 Akustikpuzzle: Im Raumraster schickt die Schallquelle (Profi: zwei) Strahlen diagonal los; sie prallen an
   Wänden und Säulen ab. Jeder reflektierte Strahl, der das Mikro trifft, ist Hall. Mit wenigen Absorbern an den
   Wänden die Reflexionen am Mikro unter den Grenzwert drücken – mit begrenzten Zügen und Zeit. */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  const CFG = [ // Locker, Standard, Profi
    { w: 10, h: 7, src: 1, k: 3, moves: 10, time: 70, slack: 1, pillars: 0, min: 2 },
    { w: 11, h: 7, src: 1, k: 4, moves: 10, time: 80, slack: 0, pillars: 2, min: 3 },
    { w: 12, h: 8, src: 2, k: 5, moves: 11, time: 90, slack: 0, pillars: 3, min: 3 }
  ];
  const DIRS = [[1, 1], [1, -1], [-1, 1], [-1, -1]], MAXB = 6, MAXSTEP = 90;
  const RAYCOL = ['rgba(255,176,46,.75)', 'rgba(200,155,255,.75)'];
  function geo(st) { const c = st.cfg, cs = Math.min(Math.floor(700 / c.w), Math.floor(420 / c.h)); return { cs, x0: 30 + Math.round((700 - c.w * cs) / 2), y0: 96 + Math.round((420 - c.h * cs) / 2) }; }
  const isWall = (st, x, y) => st.wall[y * st.cfg.w + x] === 1;
  // Strahlverfolgung; abs = Absorber-Feld (1/0). rec: Strahlen und Wandtreffer für die Anzeige aufzeichnen.
  function trace(st, abs, rec) {
    const w = st.cfg.w; let hits = 0;
    if (rec) { st.rays = []; st.whit = st.wall.map(() => 0); }
    for (let s = 0; s < st.srcs.length; s++) for (let d = 0; d < 4; d++) {
      let x = st.srcs[s] % w, y = Math.floor(st.srcs[s] / w), dx = DIRS[d][0], dy = DIRS[d][1], b = 0;
      const line = rec ? [x, y] : null, h0 = hits;
      for (let n = 0; n < MAXSTEP && b <= MAXB; n++) {
        if (!isWall(st, x + dx, y + dy)) {
          x += dx; y += dy;
          if (b > 0 && y * w + x === st.mic) hits++;
          continue;
        }
        const wx = isWall(st, x + dx, y), wy = isWall(st, x, y + dy);
        const c1 = wx ? y * w + x + dx : wy ? (y + dy) * w + x : (y + dy) * w + x + dx, c2 = wx && wy ? (y + dy) * w + x : -1;
        if (rec) { line.push(x + dx * 0.5, y + dy * 0.5); st.whit[c1]++; if (c2 >= 0) st.whit[c2]++; }
        if (abs[c1] || (c2 >= 0 && abs[c2])) break; // geschluckt
        if (wx === wy) { dx = -dx; dy = -dy; } else if (wx) dx = -dx; else dy = -dy;
        b++;
        if (rec) line.push(x, y);
      }
      if (rec) { if (line[line.length - 2] !== x || line[line.length - 1] !== y) line.push(x, y); st.rays.push({ s, pts: line, hit: hits > h0 }); }
    }
    return hits;
  }
  function canHold(st, i) { const c = st.cfg, x = i % c.w, y = Math.floor(i / c.w); return st.wall[i] === 1 && !((x === 0 || x === c.w - 1) && (y === 0 || y === c.h - 1)); }
  function greedy(st, k) {
    const abs = st.wall.map(() => 0), sol = [];
    let cur = trace(st, abs);
    for (let n = 0; n < k; n++) {
      let best = -1, bh = cur;
      for (let i = 0; i < abs.length; i++) {
        if (abs[i] || !canHold(st, i)) continue;
        abs[i] = 1; const h = trace(st, abs); abs[i] = 0;
        if (h < bh) { bh = h; best = i; }
      }
      if (best < 0) break;
      abs[best] = 1; sol.push(best); cur = bh;
    }
    return { sol, hits: cur };
  }
  function generate(st) {
    const c = st.cfg, w = c.w, N = w * c.h;
    let last = null;
    for (let tries = 0; tries < 400; tries++) {
      st.wall = new Array(N).fill(0);
      for (let i = 0; i < N; i++) { const x = i % w, y = Math.floor(i / w); if (x === 0 || y === 0 || x === w - 1 || y === c.h - 1) st.wall[i] = 1; }
      const inner = []; for (let y = 2; y < c.h - 2; y++) for (let x = 2; x < w - 2; x++) inner.push(y * w + x);
      const pil = PT.shuffle(st, inner); for (let k = 0; k < c.pillars; k++) st.wall[pil[k]] = 1;
      const free = PT.shuffle(st, st.wall.map((v, i) => i).filter(i => !st.wall[i]));
      st.srcs = [free[0]];
      const par = (free[0] % w + Math.floor(free[0] / w)) & 1, cheb = (a, b) => Math.max(Math.abs(a % w - b % w), Math.abs(Math.floor(a / w) - Math.floor(b / w)));
      for (let k = 1; k < free.length && st.srcs.length < c.src; k++) if (((free[k] % w + Math.floor(free[k] / w)) & 1) === par && cheb(free[k], free[0]) >= 3) st.srcs.push(free[k]);
      st.mic = free.find(i => ((i % w + Math.floor(i / w)) & 1) === par && st.srcs.every(s => cheb(s, i) >= 3));
      if (st.mic === undefined || st.srcs.length < c.src) continue;
      const base = trace(st, st.wall.map(() => 0)), g = greedy(st, c.k), one = greedy(st, 1);
      const limit = g.hits + c.slack;
      if (one.hits <= limit) continue;
      last = { base, sol: g.sol, limit, one: one.sol[0], wall: st.wall, srcs: st.srcs, mic: st.mic };
      if (base >= limit + 4 && g.sol.length >= c.min) break;
    }
    st.wall = last.wall; st.srcs = last.srcs; st.mic = last.mic;
    return last;
  }
  function toggle(st, i) {
    if (!canHold(st, i)) { MG.fx(st, 'buzz'); st.msg = 'Absorber gehören an Wände oder Säulen.'; st.msgT = 1.5; return; }
    const on = st.abs[i] === 1, placed = st.abs.reduce((n, v) => n + v, 0);
    if (!on && placed >= st.cfg.k) { MG.fx(st, 'buzz'); st.msg = 'Keine Absorber mehr – erst einen abnehmen.'; st.msgT = 1.5; return; }
    st.abs[i] = on ? 0 : 1; st.moves++;
    st.hits = trace(st, st.abs, true);
    MG.fx(st, on ? 'whoosh' : 'pop');
    if (st.hits <= st.limit) MG.finish(st, true);
    else if (st.moves >= st.cfg.moves) { st.msg = 'Keine Züge mehr – es hallt weiter.'; st.msgT = 3; MG.finish(st, false); }
  }
  MG.define({
    id: 'T04', group: 'tec', name: 'Akustikpuzzle', icon: '🔊',
    short: 'Absorber an die Wände hängen, bis das Mikro kaum noch Hall abbekommt.',
    rules: [
      'Die Lautsprecher-Quelle schickt Schallstrahlen schräg in den Raum; sie prallen an Wänden ab.',
      'Jeder abgeprallte Strahl, der durchs Mikro läuft, zählt als Reflexion.',
      'Absorber an einer Wand oder Säule schlucken jeden Strahl, der dort aufprallt.',
      'Drück die Reflexionen auf den Grenzwert – mit wenigen Absorbern und Zügen.',
      'Züge aufgebraucht oder Zeit abgelaufen = verloren.'
    ],
    goal: d => 'Häng bis zu ' + CFG[d].k + ' Absorber 🟩 an die Wände, bis kaum noch Schall-Echo das Mikro 🎙️ trifft (Zielwert steht rechts) – höchstens ' + CFG[d].moves + ' Klicks, ' + CFG[d].time + ' s.',
    how: [
      'Der Lautsprecher 🔈 schickt Schall-Linien schräg los. An Wänden prallen sie ab.',
      'Hell leuchtende Linien treffen nach dem Abprallen das Mikro 🎙️ – das ist Echo. Die Zahl rechts zählt diese Treffer.',
      'Tippe eine Wand (Rand oder Säule) an, an der so eine Linie abprallt: Dort hängt dann ein Absorber 🟩 und schluckt sie.',
      'Bring die Echo-Zahl auf den Zielwert. Nochmal tippen nimmt den Absorber wieder ab (kostet auch einen Klick).'
    ],
    tip: { key: 'Pfeile: Wandfeld wählen · Leertaste: Absorber an/ab', touch: 'Tippe rote Wandfelder an, an denen die hellen Linien abprallen', y: 470 },
    controls: { key: 'Pfeile: Feld wählen (weißer Rahmen), Leertaste: Absorber anbringen/abnehmen', touch: 'Wandfeld (Rand oder Säule) antippen = Absorber an/ab', mouse: 'Wandfeld anklicken = Absorber an/ab', pad: 'Steuerkreuz, A Absorber an/ab' },
    touch: ['left', 'right', 'up', 'down', 'a'],
    multi: { local: true, max: 4, mode: 'turns' },
    init(o) {
      const c = CFG[o.difficulty | 0];
      const st = { status: 'playing', seed: (o.seed >>> 0) || 1, fx: [], diff: o.difficulty | 0, cfg: c, t: 0, moves: 0, msg: 'Hörst du den Hall? Weg damit!', msgT: 2.5 };
      const g = generate(st);
      st.sol = g.sol; st.limit = g.limit; st.one = g.one;
      st.abs = st.wall.map(() => 0); st.cur = Math.floor(c.w / 2);
      st.hits = trace(st, st.abs, true);
      return st;
    },
    input(st, a) {
      if (st.status !== 'playing') return;
      const c = st.cfg, x = st.cur % c.w, y = Math.floor(st.cur / c.w);
      if (a.type === 'key' && a.down) {
        if (a.key === 'left' && x > 0) st.cur--;
        else if (a.key === 'right' && x < c.w - 1) st.cur++;
        else if (a.key === 'up' && y > 0) st.cur -= c.w;
        else if (a.key === 'down' && y < c.h - 1) st.cur += c.w;
        else if (a.key === 'a') toggle(st, st.cur);
      } else if (a.type === 'pointer' && a.phase === 'down') {
        const G = geo(st), X = Math.floor((a.x - G.x0) / G.cs), Y = Math.floor((a.y - G.y0) / G.cs);
        if (X >= 0 && Y >= 0 && X < c.w && Y < c.h) { st.cur = Y * c.w + X; toggle(st, st.cur); }
      }
    },
    update(st, dt) {
      if (st.status !== 'playing') return;
      st.t += dt; st.msgT -= dt;
      if (st.t >= st.cfg.time) MG.finish(st, false);
    },
    result(st) {
      const c = st.cfg, won = st.status === 'won', left = Math.max(0, c.time - st.t);
      const score = won ? PT.clamp(Math.round(50 + 25 * (c.moves - st.moves) / c.moves + 25 * left / c.time), 50, 100) : PT.clamp(Math.round(40 - 4 * (st.hits - st.limit)), 0, 49);
      return { won, score, detail: won ? 'Nur noch ' + st.hits + ' Reflexionen am Mikro nach ' + st.moves + ' Zügen – trocken wie ein Keks.' : (st.moves >= c.moves ? 'Keine Klicks mehr: ' : 'Zeit abgelaufen: ') + 'noch ' + st.hits + ' Echo-Treffer am Mikro – nötig waren höchstens ' + st.limit + '.' };
    },
    bot(st, goal) {
      const G = geo(st), w = st.cfg.w;
      const i = goal === 'lose' ? st.one : st.sol.find(k => !st.abs[k]);
      if (i === undefined) return [];
      return [{ type: 'pointer', phase: 'down', x: G.x0 + (i % w + 0.5) * G.cs, y: G.y0 + (Math.floor(i / w) + 0.5) * G.cs }];
    },
    draw2d(g, st) {
      const c = st.cfg, G = geo(st), cs = G.cs, w = c.w;
      g.fillStyle = '#10142a'; g.fillRect(0, 0, 960, 540);
      g.font = '600 22px system-ui'; g.textAlign = 'left'; g.fillStyle = '#ffb02e'; g.fillText('🔊 Akustikpuzzle', 24, 36);
      g.textAlign = 'right'; g.fillStyle = '#cfd6ff'; g.fillText('⏱ ' + Math.max(0, c.time - st.t).toFixed(0) + ' s', 900, 36);
      g.font = '18px system-ui'; g.textAlign = 'center'; g.fillStyle = st.msgT > 0 ? '#ffb02e' : '#8f98c8';
      g.fillText(st.msgT > 0 ? st.msg : 'Helle Linien = Echo am Mikro · Wand antippen, wo sie abprallen', 380, 78);
      for (let i = 0; i < st.wall.length; i++) {
        const x = G.x0 + (i % w) * cs, y = G.y0 + Math.floor(i / w) * cs;
        if (st.abs[i]) g.fillStyle = '#2f9e64';
        else if (st.wall[i]) g.fillStyle = st.whit[i] ? (st.whit[i] > 2 ? '#8a2f45' : '#5e2f4a') : '#2b3160';
        else g.fillStyle = ((i % w + Math.floor(i / w)) & 1) ? '#151a36' : '#181e3e';
        g.fillRect(x + 1, y + 1, cs - 2, cs - 2);
        if (st.abs[i]) { g.fillStyle = '#4be08a'; for (let k = 1; k < 4; k++) g.fillRect(x + k * cs / 4 - 2, y + 6, 4, cs - 12); }
        else if (st.whit[i] && canHold(st, i)) { g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(x + cs / 2 - 1, y + cs * 0.3, 3, cs * 0.4); g.fillRect(x + cs * 0.3, y + cs / 2 - 1, cs * 0.4, 3); }
      }
      g.lineWidth = 3; g.lineJoin = 'round';
      for (const r of st.rays) {
        g.strokeStyle = r.hit ? RAYCOL[r.s] : 'rgba(143,152,200,.25)'; g.lineWidth = r.hit ? 4 : 2; g.beginPath();
        for (let k = 0; k < r.pts.length; k += 2) { const x = G.x0 + (r.pts[k] + 0.5) * cs, y = G.y0 + (r.pts[k + 1] + 0.5) * cs; k ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.stroke();
      }
      g.font = Math.round(cs * 0.55) + 'px system-ui';
      for (const s of st.srcs) { g.fillStyle = '#ffb02e'; g.beginPath(); g.arc(G.x0 + (s % w + 0.5) * cs, G.y0 + (Math.floor(s / w) + 0.5) * cs, cs * 0.42, 0, 6.283); g.fill(); g.fillText('🔈', G.x0 + (s % w + 0.5) * cs, G.y0 + (Math.floor(s / w) + 0.72) * cs); }
      g.fillStyle = '#6ef0ff'; g.beginPath(); g.arc(G.x0 + (st.mic % w + 0.5) * cs, G.y0 + (Math.floor(st.mic / w) + 0.5) * cs, cs * 0.42, 0, 6.283); g.fill();
      g.fillText('🎙️', G.x0 + (st.mic % w + 0.5) * cs, G.y0 + (Math.floor(st.mic / w) + 0.72) * cs);
      g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.strokeRect(G.x0 + (st.cur % w) * cs + 2, G.y0 + Math.floor(st.cur / w) * cs + 2, cs - 4, cs - 4);
      // Seitenleiste
      const placed = st.abs.reduce((n, v) => n + v, 0);
      g.textAlign = 'left'; g.font = '600 20px system-ui'; g.fillStyle = '#cfd6ff'; g.fillText('Echo am Mikro', 760, 130);
      g.font = '600 44px system-ui'; g.fillStyle = st.hits <= st.limit ? '#4be08a' : '#ff4d6d'; g.fillText(st.hits + ' → ' + st.limit, 760, 182);
      g.font = '18px system-ui'; g.fillStyle = '#cfd6ff'; g.fillText(st.limit ? 'Ziel: höchstens ' + st.limit : 'Ziel: auf 0 bringen', 760, 212);
      g.fillText('🟩 Absorber: ' + (c.k - placed) + ' frei', 760, 270);
      g.fillText('👣 Züge: ' + (c.moves - st.moves) + ' übrig', 760, 304);
      g.fillStyle = '#8f98c8'; g.fillText('🔈 Lautsprecher', 760, 360); g.fillText('🎙️ Mikro', 760, 386); g.fillText('＋ = Aufprall-Wand', 760, 412);
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
