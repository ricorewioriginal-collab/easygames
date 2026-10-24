/* Die große Challenge-Show – Spielkern ohne Grafik (läuft auch in Node).
 * Bis zu 24 Kandidaten (Menschen + Computer), sechs Runden mit Ausscheiden:
 *   ampel   – Ampel-Lauf: bei Grün laufen, bei Rot einfrieren (Bewegung bei Rot = raus), Zeitlimit
 *   bruecke – Wackelbrücke: nacheinander links/rechts springen, eine Platte je Reihe hält
 *   seil    – Seilziehen: zwei Teams, im Takt ziehen, Verlierer-Team scheidet aus
 *   keks    – Keks-Kunst: Form nachfahren, ohne dass der Keks bricht, Zeitlimit
 *   stuhl   – Reise nach Jerusalem: Musik stoppt, Stühle tauchen auf, wer keinen hat, ist raus (mehrere Durchgänge)
 *   finale  – Schubs-Arena: runde Plattform schrumpft, schubsen, wer zuletzt steht, gewinnt die Krone
 * Ausgeschiedene fliegen im Konfetti weg (kinderfreundlich, kein Gewalt-Look). */
const CSCore = (() => {
  'use strict';
  const ROUNDS = ['ampel', 'bruecke', 'seil', 'keks', 'stuhl', 'finale'];
  const NAMES = { ampel: 'Ampel-Lauf', bruecke: 'Wackelbrücke', seil: 'Seilziehen', keks: 'Keks-Kunst', stuhl: 'Reise nach Jerusalem', finale: 'Schubs-Finale' };
  const DIFF = { leicht: { bot: 0, time: 1.25, react: 1.4 }, normal: { bot: 1, time: 1, react: 1 }, schwer: { bot: 2, time: .85, react: .7 } };
  const COLS = ['#ff4a6a', '#ffb020', '#3ab0ff', '#3ae07a', '#b06aff', '#ff7ad0', '#20d0c0', '#ffe040', '#ff8040', '#7a8aff', '#a0e040', '#ff5ab0'];
  const BOTN = ['Bo', 'Lina', 'Kalle', 'Mo', 'Pia', 'Tom', 'Elif', 'Juri', 'Nele', 'Ole', 'Ada', 'Ben', 'Cleo', 'Dan', 'Emma', 'Finn', 'Greta', 'Hugo', 'Ida', 'Jonas', 'Kira', 'Luca', 'Maja', 'Nico', 'Paul', 'Romy', 'Sami', 'Tara'];
  function rng(seed) { let s = (seed >>> 0) || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

  /* ---------- Show anlegen ---------- */
  // players: [{ name, col?, human: true }] ; opt: { n (Gesamtzahl), diff, seed }
  function newShow(players, opt) {
    opt = opt || {}; const r = rng(opt.seed || ((Math.random() * 1e9) | 0)), n = Math.max(players.length + 1, Math.min(24, opt.n || 16)), D = DIFF[opt.diff] || DIFF.normal;
    const cons = [], nums = []; for (let i = 1; i <= 456; i++) nums.push(i); for (let i = nums.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [nums[i], nums[j]] = [nums[j], nums[i]]; }
    const bn = BOTN.slice().sort(() => r() - .5);
    for (let i = 0; i < n; i++) { const p = players[i], human = !!p; cons.push({ id: i, num: nums[i], name: human ? p.name : bn[i % bn.length], human, pid: human ? p.pid : null, col: (p && p.col) || COLS[i % COLS.length], skill: human ? 1 : clamp(D.bot + (r() < .3 ? -1 : r() < .3 ? 1 : 0), 0, 2), hat: (r() * 6) | 0, x: 0, y: 0, z: 0, vx: 0, vz: 0, vy: 0, yaw: 0, alive: true, out: false, outRound: -1, place: 0, safe: false }); }
    return { cons, r, D, diff: opt.diff || 'normal', k: -1, round: null, R: null, t: 0, pot: 0, ev: [], done: false, winner: null, order: opt.order || ROUNDS.slice() };
  }
  const alive = S => S.cons.filter(c => c.alive);
  function eliminate(S, c, why) { if (!c.alive) return; c.alive = false; c.out = true; c.outRound = S.k; c.place = alive(S).length + 1; c.outT = S.t; c.vy = 9; c.flyX = (S.r() - .5) * 8; c.flyZ = -6 - S.r() * 6; S.pot += 100; S.ev.push({ t: 'out', id: c.id, why }); }
  // nächste Runde: Runden ohne Sinn bei wenigen Kandidaten überspringen
  function nextRound(S) {
    let k = S.k + 1; const n = alive(S).length;
    if (n <= 1) { finish(S); return null; }
    while (k < S.order.length - 1 && n <= 2 && S.order[k] !== 'finale') k++;      // bei 2 Kandidaten direkt ins Finale
    if (k >= S.order.length) { finish(S); return null; }
    S.k = k; S.round = S.order[k]; S.t = 0; alive(S).forEach(c => { c.safe = false; c.vx = c.vz = c.vy = 0; c.y = 0; c.act = null; });
    S.R = START[S.round](S); S.ev.push({ t: 'round', round: S.round }); return S.round;
  }
  function finish(S) { const a = alive(S); S.done = true; S.winner = a[0] || null; if (S.winner) S.winner.place = 1; S.ev.push({ t: 'winner', id: S.winner ? S.winner.id : -1 }); }

  /* ---------- Bewegung (gemeinsam) ---------- */
  const SPEED = 5.6, ACC = 30, GRAV = 26, JUMP = 8.5, RAD = .42;
  function move(c, inp, dt, sp) {
    const tx = (inp.mx || 0) * (sp || SPEED), tz = (inp.mz || 0) * (sp || SPEED), ax = tx - c.vx, az = tz - c.vz, l = Math.hypot(ax, az), m = ACC * dt;
    if (l > m) { c.vx += ax / l * m; c.vz += az / l * m; } else { c.vx = tx; c.vz = tz; }
    if (Math.hypot(inp.mx || 0, inp.mz || 0) > .1) c.yaw = Math.atan2(inp.mx, inp.mz);
    if (inp.jump && c.y <= 0 && !c.jHeld) c.vy = JUMP; c.jHeld = !!inp.jump;
    c.x += c.vx * dt; c.z += c.vz * dt; c.vy -= GRAV * dt; c.y += c.vy * dt; if (c.y < 0 && !c.falling) { c.y = 0; c.vy = 0; }
  }
  function separate(list, push) { for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) { const a = list[i], b = list[j], dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz); if (d > 0 && d < RAD * 2) { const o = (RAD * 2 - d) / 2, nx = dx / d, nz = dz / d; a.x -= nx * o; a.z -= nz * o; b.x += nx * o; b.z += nz * o; if (push) push(a, b, nx, nz); } } }
  const flyOut = (S, dt) => { for (const c of S.cons) if (c.out && c.outT !== undefined && S.t - c.outT < 3) { c.vy -= 14 * dt; c.y += c.vy * dt; c.x += c.flyX * dt; c.z += c.flyZ * dt * .5; } };

  /* ---------- Runden ---------- */
  const START = {}, STEP = {};
  // Ampel-Lauf
  START.ampel = S => { const a = alive(S), w = 26; a.forEach((c, i) => { c.x = -w / 2 + (i + .5) * w / a.length; c.z = 0; c.yaw = 0; c.react = (.15 + S.r() * .35) * [1.6, 1, .6][c.skill] * S.D.react; c.greed = .75 + S.r() * .35 + c.skill * .08; }); return { len: 58, w, light: 'green', lt: 3 + S.r() * 2, time: 75 * S.D.time, quota: Math.ceil(a.length * .3) }; };
  STEP.ampel = (S, dt, IN) => {
    const R = S.R; R.time -= dt; R.lt -= dt;
    if (R.lt <= 0) { if (R.light === 'green') { R.light = 'turn'; R.lt = .6; S.ev.push({ t: 'turn' }); } else if (R.light === 'turn') { R.light = 'red'; R.lt = 1.8 + S.r() * 2; R.redT = 0; S.ev.push({ t: 'red' }); } else { R.light = 'green'; R.lt = Math.max(1.4, 2 + S.r() * 3.5 - S.t * .02); S.ev.push({ t: 'green' }); } }
    if (R.light === 'red') R.redT += dt;
    const outN = S.cons.filter(c => c.outRound === S.k).length;
    for (const c of alive(S)) {
      if (c.safe) { move(c, { mx: 0, mz: c.z < R.len + 2.5 ? .3 : 0 }, dt, 2); continue; }   // hinter dem Ziel stehen bleiben (nicht in den Roboter laufen)
      let inp = IN[c.id] || { mx: 0, mz: 0 };
      if (!c.human || c.auto) { // Computer: bei Grün loslaufen, bei Gelb/Rot nach Reaktionszeit anhalten (manche zu spät)
        const want = R.light === 'green' || (R.light === 'turn' && R.lt > .6 - c.react) || (R.light === 'red' && R.redT < c.react - .6);
        const sloppy = R.light === 'red' && outN < R.quota && S.r() < .006 * (3 - c.skill);
        inp = { mx: Math.sin(S.t * .7 + c.id) * .08, mz: want || sloppy ? c.greed : 0 };
      }
      move(c, inp, dt); c.x = clamp(c.x, -R.w / 2, R.w / 2); c.z = Math.max(-1, c.z);
      if (R.light === 'red' && R.redT > .25 && Math.hypot(c.vx, c.vz) > .7) { if (c.human && !c.auto || outN < R.quota) eliminate(S, c, 'bewegt'); else { c.vx = c.vz = 0; } }   // Computer: höchstens die Quote pro Runde
      else if (c.z >= R.len) { c.safe = true; S.ev.push({ t: 'safe', id: c.id }); }
    }
    separate(alive(S).filter(c => !c.safe));
    if (R.time <= 0) { for (const c of alive(S)) if (!c.safe) eliminate(S, c, 'zeit'); return true; }
    return alive(S).every(c => c.safe);
  };
  // Wackelbrücke
  START.bruecke = S => { const rows = Math.max(3, Math.min(12, Math.ceil(alive(S).length * .7))), good = [], a = alive(S).sort((x, y) => x.num - y.num); for (let i = 0; i < rows; i++) good.push(S.r() < .5 ? 0 : 1);
    a.forEach((c, i) => { c.x = -3 + (i % 6) * 1.2; c.z = -3 - Math.floor(i / 6) * 1.2; c.yaw = 0; c.row = -1; });
    return { rows, good, broken: [], known: [], queue: a.map(c => c.id), cur: null, pickT: 0, jump: null, time: (30 + a.length * 7) * S.D.time };
  };
  const rowZ = r => 3 + r * 2.4, tileX = s => s ? -1.3 : 1.3;   // 0 = links (Kamera schaut nach +z, links im Bild = +x)
  STEP.bruecke = (S, dt, IN) => {
    const R = S.R; R.time -= dt;
    if (R.jump) { // Sprung läuft
      const J = R.jump, c = S.cons[J.id]; J.t += dt; const k = Math.min(1, J.t / J.dur); c.x = J.x0 + (J.x1 - J.x0) * k; c.z = J.z0 + (J.z1 - J.z0) * k; c.y = Math.sin(k * Math.PI) * 1.4;
      if (k >= 1) { c.y = 0; R.jump = null; if (J.end) { c.safe = true; S.ev.push({ t: 'safe', id: c.id }); R.cur = null; } else if (R.good[J.row] === J.side || (!R.queue.length && !S.cons.some(o => o.alive && o.safe))) { R.good[J.row] = J.side; c.row = J.row; R.known[J.row] = J.side; S.ev.push({ t: 'tile', ok: true }); R.pickT = 0; } else { R.broken.push(J.row * 2 + J.side); R.known[J.row] = 1 - J.side; S.ev.push({ t: 'tile', ok: false, row: J.row, side: J.side }); c.falling = true; eliminate(S, c, 'brücke'); c.vy = 0; c.flyX = 0; c.flyZ = 0; R.cur = null; } }
      return false;
    }
    if (R.cur === null) { const nid = R.queue.shift(); if (nid === undefined) return true; const c = S.cons[nid]; if (!c.alive) return false; R.cur = nid; c.row = -1; c.x = 0; c.z = 0; R.pickT = 0; }
    const c = S.cons[R.cur]; if (!c.alive) { R.cur = null; return false; }
    const nr = c.row + 1;
    if (nr >= R.rows) { R.jump = { id: c.id, t: 0, dur: .5, x0: c.x, z0: c.z, x1: 0, z1: rowZ(R.rows) + 2, end: true }; return false; }
    if (R.time <= 0) { eliminate(S, c, 'zeit'); R.cur = null; R.queue.forEach(id => eliminate(S, S.cons[id], 'zeit')); R.queue = []; return true; }
    R.pickT += dt; let side = null;
    if (R.known[nr] !== undefined) { if (R.pickT > .05) side = R.known[nr]; }   // bekannte Platte: sicher weiter
    else if (c.human && !c.auto) { const inp = IN[c.id] || {}; if (inp.pick === 'L' || inp.pick === 'R') side = inp.pick === 'L' ? 0 : 1; else if (R.pickT > 8) side = S.r() < .5 ? 0 : 1; }
    else if (R.pickT > .9 + S.r() * 1.2) side = S.r() < .5 + (c.skill - 1) * .06 ? R.good[nr] : 1 - R.good[nr];
    if (side !== null) R.jump = { id: c.id, t: 0, dur: R.known[nr] !== undefined ? .3 : .55, x0: c.x, z0: c.z, x1: tileX(side), z1: rowZ(nr), row: nr, side };
    return false;
  };
  // Seilziehen
  START.seil = S => { const a = alive(S).sort(() => S.r() - .5); let bye = null; if (a.length % 2) bye = a.find(c => !c.human) || a[a.length - 1]; const p = a.filter(c => c !== bye), A = [], B = []; p.forEach((c, i) => (i % 2 ? B : A).push(c));
    if (bye) { bye.safe = true; S.ev.push({ t: 'bye', id: bye.id }); }
    A.forEach((c, i) => { c.team = 0; c.x = -2.2 - i * 1.1; c.z = 0; c.yaw = -Math.PI / 2; }); B.forEach((c, i) => { c.team = 1; c.x = 2.2 + i * 1.1; c.z = 0; c.yaw = Math.PI / 2; });
    alive(S).forEach(c => { c.pw = 0; c.tapN = 0; c.goodN = 0; c.nextTap = S.r() * .4; });
    return { A: A.map(c => c.id), B: B.map(c => c.id), bye: bye && bye.id, p: 0, beat: 0, time: 45 };
  };
  STEP.seil = (S, dt, IN) => {
    const R = S.R; R.time -= dt; R.beat = (R.beat + dt * 1.6) % 1; const zone = R.beat > .4 && R.beat < .62;
    const force = ids => ids.reduce((s, id) => { const c = S.cons[id]; c.pw = Math.max(0, c.pw - dt * 1.8); let tap = false, q = 0;
      if (c.human && !c.auto) { const inp = IN[id] || {}; if (inp.taps > (c.tapN || 0)) { tap = true; const g = (inp.good || 0) > (c.goodN || 0); q = (inp.good === undefined ? zone : g) ? 1 : .35; c.tapN = inp.taps; c.goodN = inp.good || 0; } }
      else { c.nextTap -= dt; if (c.nextTap <= 0) { tap = true; c.nextTap = .62 + S.r() * .25 - c.skill * .05; q = S.r() < [.45, .6, .75][c.skill] ? 1 : .35; } }
      if (tap) { c.pw = Math.min(1.6, c.pw + q * .7); if (q === 1) c.good = .3; } if (c.good > 0) c.good -= dt; return s + c.pw; }, 0);
    const fa = force(R.A), fb = force(R.B); R.p = clamp(R.p + (fb - fa) / Math.max(1, (R.A.length + R.B.length) / 2) * dt * .5 * (1 + (45 - R.time) / 10), -1, 1);
    R.A.forEach((id, i) => { S.cons[id].x = -2.2 - i * 1.1 + R.p * 3; }); R.B.forEach((id, i) => { S.cons[id].x = 2.2 + i * 1.1 + R.p * 3; });
    if (Math.abs(R.p) >= 1 || R.time <= 0) { const lose = R.p < 0 ? R.B : R.A; lose.forEach(id => { const c = S.cons[id]; c.falling = true; eliminate(S, c, 'seil'); c.flyX = (R.p < 0 ? 1 : -1) * 5; }); (R.p < 0 ? R.A : R.B).forEach(id => { S.cons[id].safe = true; }); S.ev.push({ t: 'tugwin', team: R.p < 0 ? 0 : 1 }); return true; }
    return false;
  };
  // Keks-Kunst: Formen als geschlossene Linienzüge im Einheitsfeld (-1..1)
  const SHAPES = {
    kreis: { n: 'Kreis', d: 0, pts: Array.from({ length: 49 }, (_, i) => [Math.cos(i / 48 * Math.PI * 2) * .6, Math.sin(i / 48 * Math.PI * 2) * .6]) },
    dreieck: { n: 'Dreieck', d: 1, pts: (() => { const v = [[0, -.65], [.6, .45], [-.6, .45], [0, -.65]], o = []; for (let k = 0; k < 3; k++) for (let i = 0; i < 12; i++) { const t = i / 12; o.push([v[k][0] + (v[k + 1][0] - v[k][0]) * t, v[k][1] + (v[k + 1][1] - v[k][1]) * t]); } o.push(v[3]); return o; })() },
    stern: { n: 'Stern', d: 2, pts: (() => { const o = []; for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i / 10 * Math.PI * 2, r = i % 2 ? .3 : .68; o.push([Math.cos(a) * r, Math.sin(a) * r]); } const f = []; for (let i = 0; i < 10; i++) for (let k = 0; k < 5; k++) { const t = k / 5; f.push([o[i][0] + (o[i + 1][0] - o[i][0]) * t, o[i][1] + (o[i + 1][1] - o[i][1]) * t]); } f.push(o[10]); return f; })() },
    herz: { n: 'Herz', d: 2, pts: Array.from({ length: 61 }, (_, i) => { const t = i / 60 * Math.PI * 2; return [Math.pow(Math.sin(t), 3) * .62, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16 * .62 - .05]; }) },
  };
  START.keks = S => { const keys = Object.keys(SHAPES); alive(S).forEach((c, i) => { c.x = ((i % 6) - 2.5) * 2.4; c.z = Math.floor(i / 6) * 2.6; c.yaw = Math.PI; c.shape = keys[(S.r() * keys.length) | 0]; c.prog = 0; c.crack = 0; c.kDone = false;
      if (!c.human || c.auto) { const p = [.72, .86, .95][c.skill] - SHAPES[c.shape].d * .07; c.kFail = S.r() > p; c.kTime = 10 + S.r() * 22; c.kFailAt = c.kTime * (.3 + S.r() * .6); } });
    const fails = alive(S).filter(c => c.kFail), cap = Math.floor(alive(S).length * .4); fails.slice(cap).forEach(c => { c.kFail = false; });
    return { time: 45 * S.D.time, tol: .11 * (S.diff === 'leicht' ? 1.35 : S.diff === 'schwer' ? .85 : 1) };
  };
  // Fortschritt beim Nachfahren: Zeiger muss nah am nächsten Stück der Linie bleiben (in Reihenfolge)
  function traceStep(c, R, p) {
    const pts = SHAPES[c.shape].pts, i0 = Math.floor(c.prog), dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    if (!p || !p.down) return; let best = -1, bd = 1e9; for (let k = i0; k < Math.min(pts.length, i0 + 5); k++) { const d = dist(p.xy, pts[k]); if (d < bd) { bd = d; best = k; } }
    if (bd < R.tol) { if (best >= c.prog) c.prog = best; } else { let any = 1e9; for (const q of pts) any = Math.min(any, dist(p.xy, q)); c.crack += any > R.tol * 1.6 ? .045 : .012; }
    c.last = p.xy;
  }
  STEP.keks = (S, dt, IN) => {
    const R = S.R; R.time -= dt;
    for (const c of alive(S)) { if (c.kDone) continue; const n = SHAPES[c.shape].pts.length - 1;
      if (c.human && !c.auto) { const k = (IN[c.id] || {}).kp; if (k) { c.prog = Math.max(c.prog, Math.min(n, +k.prog || 0)); c.crack = Math.max(c.crack, +k.crack || 0); } }
      else { const el = 45 * S.D.time - R.time; c.prog = Math.min(n, el / c.kTime * n); if (c.kFail && el > c.kFailAt) c.crack = 1; }
      if (c.crack >= 1) { c.falling = false; eliminate(S, c, 'keks'); S.ev.push({ t: 'crack', id: c.id }); }
      else if (c.prog >= n - .5) { c.kDone = true; c.safe = true; S.ev.push({ t: 'safe', id: c.id }); }
    }
    if (R.time <= 0) { for (const c of alive(S)) if (!c.kDone) eliminate(S, c, 'zeit'); return true; }
    return alive(S).every(c => c.kDone);
  };
  // Reise nach Jerusalem: mehrere Durchgänge, bis höchstens 4 übrig sind
  const ARENA_R = 9;
  START.stuhl = S => { const a = alive(S); a.forEach((c, i) => { const ang = i / a.length * Math.PI * 2; c.x = Math.cos(ang) * 6; c.z = Math.sin(ang) * 6; }); return newLap(S, { target: Math.max(2, Math.min(a.length - 1, Math.ceil(a.length * .5), 5)), lap: 0 }); };
  function newLap(S, R) { const n = alive(S).length, k = Math.max(1, Math.floor(n * .25)); R.chairs = []; R.music = 5 + S.r() * 6; R.phase = 'music'; R.grab = 7; R.nChairs = n - k; R.lap++; alive(S).forEach(c => { c.seat = -1; c.react = (.25 + S.r() * .5) * [1.5, 1, .65][c.skill] * S.D.react; c.wander = S.r() * Math.PI * 2; }); S.ev.push({ t: 'music' }); return R; }
  STEP.stuhl = (S, dt, IN) => {
    const R = S.R, a = alive(S);
    if (R.phase === 'music') {
      R.music -= dt;
      for (const c of a) { let inp = IN[c.id] || {}; if (!c.human || c.auto) { c.wander += dt * .9; const tx = Math.cos(c.wander) * 6, tz = Math.sin(c.wander) * 6, d = Math.hypot(tx - c.x, tz - c.z) || 1; inp = { mx: (tx - c.x) / d * .6, mz: (tz - c.z) / d * .6 }; } move(c, inp, dt, 4.5); keepIn(c, ARENA_R - .5); }
      separate(a);
      if (R.music <= 0) { R.phase = 'grab'; R.gt = 0; // Stühle tauchen zufällig auf
        for (let i = 0; i < R.nChairs; i++) { let x, z, ok, tries = 0; do { const ang = S.r() * Math.PI * 2, rr = 1.5 + S.r() * (ARENA_R - 3); x = Math.cos(ang) * rr; z = Math.sin(ang) * rr; ok = R.chairs.every(ch => Math.hypot(ch.x - x, ch.z - z) > 1.6); } while (!ok && ++tries < 40); R.chairs.push({ x, z, by: -1, rot: S.r() * 6 }); }
        S.ev.push({ t: 'stop' }); }
      return false;
    }
    R.gt += dt;
    for (const c of a) {
      if (c.seat >= 0) { const ch = R.chairs[c.seat]; c.x = ch.x; c.z = ch.z; c.vx = c.vz = 0; c.y = .25; continue; }
      let inp = IN[c.id] || {};
      if (!c.human || c.auto) { if (R.gt < c.react) inp = {}; else { let best = null, bd = 1e9; for (const ch of R.chairs) if (ch.by < 0) { const d = Math.hypot(ch.x - c.x, ch.z - c.z); const rival = a.some(o => o !== c && o.seat < 0 && Math.hypot(ch.x - o.x, ch.z - o.z) < d - .8); const sc = d + (rival ? 2.5 : 0); if (sc < bd) { bd = sc; best = ch; } } if (best) { const d = Math.hypot(best.x - c.x, best.z - c.z) || 1; inp = { mx: (best.x - c.x) / d, mz: (best.z - c.z) / d }; } } }
      move(c, inp, dt, 5.8); keepIn(c, ARENA_R - .5);
      for (let i = 0; i < R.chairs.length; i++) { const ch = R.chairs[i]; if (ch.by < 0 && Math.hypot(ch.x - c.x, ch.z - c.z) < .75) { ch.by = c.id; c.seat = i; S.ev.push({ t: 'sit', id: c.id }); break; } }
    }
    separate(a.filter(c => c.seat < 0));
    if (R.chairs.every(ch => ch.by >= 0) || R.gt > R.grab) {
      for (const c of a) if (c.seat < 0) eliminate(S, c, 'stuhl');
      if (alive(S).length <= R.target) { alive(S).forEach(c => { c.safe = true; c.y = 0; }); return true; }
      alive(S).forEach(c => { c.y = 0; }); newLap(S, R);
    }
    return false;
  };
  const keepIn = (c, r) => { const d = Math.hypot(c.x, c.z); if (d > r) { c.x *= r / d; c.z *= r / d; } };
  // Schubs-Finale: Plattform schrumpft, Sprint-Schubser (act) stößt andere weg
  START.finale = S => { const a = alive(S); a.forEach((c, i) => { const ang = i / a.length * Math.PI * 2; c.x = Math.cos(ang) * 5; c.z = Math.sin(ang) * 5; c.yaw = Math.atan2(-c.x, -c.z); c.dash = 0; c.cool = 0; c.dashN = 0; c.falling = false; }); return { r: 10, minR: 2.6, time: 0 }; };
  STEP.finale = (S, dt, IN) => {
    const R = S.R; R.time += dt; R.r = Math.max(R.minR, 10 - Math.max(0, R.time - 5) * .12 * (R.time > 60 ? 2 : 1)); const a = alive(S);
    for (const c of a) {
      c.cool -= dt; if (c.dash > 0) c.dash -= dt;
      let inp = IN[c.id] || {};
      if (!c.human || c.auto) { let tgt = null, bd = 1e9; for (const o of a) if (o !== c) { const d = Math.hypot(o.x - c.x, o.z - c.z); if (d < bd) { bd = d; tgt = o; } }
        const dc = Math.hypot(c.x, c.z); let mx = 0, mz = 0;
        if (dc > R.r - 1.6) { mx = -c.x / dc; mz = -c.z / dc; } else if (tgt) { const dx = tgt.x - c.x, dz = tgt.z - c.z, d = Math.hypot(dx, dz) || 1; mx = dx / d * .8; mz = dz / d * .8; }
        inp = { mx, mz, act: tgt && bd < 2.2 && S.r() < [.02, .04, .07][c.skill] }; }
      const dashNow = inp.dash !== undefined ? inp.dash > (c.dashN || 0) : inp.act; if (inp.dash !== undefined) c.dashN = inp.dash;
      if (dashNow && c.cool <= 0 && !c.falling) { const yaw = Math.hypot(inp.mx || 0, inp.mz || 0) > .1 ? Math.atan2(inp.mx, inp.mz) : c.yaw; c.vx = Math.sin(yaw) * 13; c.vz = Math.cos(yaw) * 13; c.dash = .28; c.cool = 1.1; S.ev.push({ t: 'dash', id: c.id }); }
      if (c.falling) { c.vy -= GRAV * dt; c.y += c.vy * dt; c.x += c.vx * dt; c.z += c.vz * dt; if (c.y < -6) { if (alive(S).length > 1) eliminate(S, c, 'runter'); else { c.falling = false; c.x = c.z = c.vx = c.vz = c.vy = 0; c.y = 0; } } continue; }   // Letzter fällt nicht: er gewinnt
      if (c.dash > 0) { c.x += c.vx * dt; c.z += c.vz * dt; c.vx *= Math.pow(.02, dt); c.vz *= Math.pow(.02, dt); } else move(c, inp, dt, 5);
      if (Math.hypot(c.x, c.z) > R.r + .2) { c.falling = true; c.vy = 2; S.ev.push({ t: 'fall', id: c.id }); }
    }
    separate(a.filter(c => !c.falling), (p, q, nx, nz) => { const pd = p.dash > 0, qd = q.dash > 0; if (pd && !qd) { q.vx = nx * 11; q.vz = nz * 11; q.dash = .22; p.dash = 0; S.ev.push({ t: 'bump', id: q.id }); } else if (qd && !pd) { p.vx = -nx * 11; p.vz = -nz * 11; p.dash = .22; q.dash = 0; S.ev.push({ t: 'bump', id: p.id }); } });
    return alive(S).length <= 1;
  };

  /* ---------- Gesamtschritt ---------- */
  // IN: { [id]: { mx, mz, jump, act, pick, trace: { xy:[x,y], down } } }
  function step(S, dt, IN) {
    if (S.done || !S.R) return false; S.t += dt; flyOut(S, dt);
    const end = STEP[S.round](S, dt, IN || {});
    if (end && !alive(S).length) { const last = S.cons.filter(c => c.outRound === S.k).sort((a, b) => b.outT - a.outT)[0]; if (last) { last.alive = true; last.out = false; last.outRound = -1; last.place = 0; last.safe = true; last.falling = false; last.x = last.z = 0; last.y = 0; S.pot -= 100; S.ev.push({ t: 'safe', id: last.id }); } }   // nie alle raus
    if (end) { S.R.done = true; S.ev.push({ t: 'roundEnd', round: S.round, out: S.cons.filter(c => c.outRound === S.k).map(c => c.id) }); }
    return end;
  }
  return { ROUNDS, NAMES, DIFF, SHAPES, COLS, rng, newShow, nextRound, step, alive, rowZ, tileX, ARENA_R, traceStep };
})();
if (typeof module !== 'undefined') module.exports = CSCore;
