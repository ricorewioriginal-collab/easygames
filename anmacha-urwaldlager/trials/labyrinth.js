/* Prüfung: Das Rätsel-Labyrinth (2D, Draufsicht) – Tempelräume mit Hebeln, Toren, Schlüsseln, Schiebesteinen, Druckplatten und Symbol-Türen.
   Räume werden pro Runde zufällig variiert und per Breitensuche auf Lösbarkeit (inkl. Stern) geprüft. */
(function () {
  'use strict';
  const T = UTrials, D = T.draw, TAU = Math.PI * 2, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
  const EMO = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';

  // ---------- Touch-Steuerung direkt im Canvas (Joystick überall + Tipp-Ziel, Tasten unten rechts)
  function mkPad(ctx, buttons) {
    const P = { joy: null, btns: buttons.map(b => Object.assign({ x: 0, y: 0, r: 30, held: false, edge: false, pid: null }, b)), tap: null };
    P.layout = (W, H) => { let x = W - 14; P.btns.forEach(b => { b.r = b.big ? 40 : 30; x -= b.r; b.x = x; b.y = H - 16 - (b.big ? 40 : 30); x -= b.r + 12; }); };
    P.show = () => ctx.I.touch;
    P.pointer = (type, x, y, id) => {
      if (type === 'down') {
        if (P.show()) for (const b of P.btns) if (Math.hypot(x - b.x, y - b.y) < b.r + 8) { b.held = true; b.edge = true; b.pid = id; return true; }
        if (!P.joy) P.joy = { id, ox: x, oy: y, x: 0, y: 0, t: 0, moved: false, sx: x, sy: y };
        return true;
      }
      if (type === 'move') { const j = P.joy; if (j && j.id === id) { let dx = (x - j.ox) / 46, dy = (y - j.oy) / 46; if (Math.hypot(x - j.sx, y - j.sy) > 14) j.moved = true; const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; if (m > 1.7) { j.ox += (x - j.ox) * .1; j.oy += (y - j.oy) * .1; } } j.x = j.moved ? dx : 0; j.y = j.moved ? dy : 0; } return true; }
      if (type === 'up') { for (const b of P.btns) if (b.pid === id) { b.held = false; b.pid = null; } const j = P.joy; if (j && j.id === id) { if (!j.moved && j.t < .4) P.tap = { x, y }; P.joy = null; } return true; }
    };
    P.tick = dt => { if (P.joy) P.joy.t += dt; };
    P.move = () => { const m = ctx.I.move; if (P.joy && P.joy.moved) return { x: P.joy.x, y: -P.joy.y }; return { x: m.x, y: m.y }; };
    P.down = id => { const b = P.btns.find(b => b.id === id); return ctx.I.down(id) || !!(b && b.held); };
    P.pressed = id => { const b = P.btns.find(b => b.id === id); let e = ctx.I.pressed(id); if (b && b.edge) { b.edge = false; e = true; } return e; };
    P.draw = c => {
      if (!P.show()) return;
      P.btns.forEach(b => { c.save(); c.globalAlpha = .9; c.fillStyle = b.held ? 'rgba(255,207,74,.85)' : b.big ? 'rgba(46,168,77,.72)' : 'rgba(10,30,18,.62)'; c.beginPath(); c.arc(b.x, b.y, b.r, 0, TAU); c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.6)'; c.stroke(); D.text(c, b.label, b.x, b.y, b.big ? 13 : 12, b.held ? '#2a1700' : '#fff', 'center', 900); c.restore(); });
      const j = P.joy; if (j && j.moved) { c.save(); c.globalAlpha = .55; c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.arc(j.ox, j.oy, 46, 0, TAU); c.stroke(); c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(j.ox + j.x * 46, j.oy + j.y * 46, 22, 0, TAU); c.fill(); c.restore(); }
    };
    return P;
  }
  function hudBottom() { const el = document.getElementById('thud'); if (!el) return 92; const r = el.getBoundingClientRect(); return clamp(r.bottom + 6, 56, 170); }

  // ---------- Kachel-Typen
  const WALL = 0, FLOOR = 1, LEVER = 2, GATE = 3, PGATE = 4, PLATE = 5, DOOR = 6, SDOOR = 7, SYM = 8, MURAL = 9, EXIT = 10;
  const KEYCOL = ['#e8463a', '#3a86e8', '#f2c230'], KEYNAME = ['Rot', 'Blau', 'Gelb'];
  const ANIMALS = [{ e: '🐍', n: 'Schlange' }, { e: '🦜', n: 'Papagei' }, { e: '🐒', n: 'Affe' }, { e: '🐸', n: 'Frosch' }, { e: '🐆', n: 'Jaguar' }, { e: '🦎', n: 'Echse' }];
  const RW = 15, RH = 9;
  // Vorlagen: # Wand . Boden @ Start E Ausgang * Stern 1-3 Hebel u v w Hebeltore o Stein ? möglicher Stein _ = Platten (Gruppe 0/1) P Q Plattentore
  //           r b y Schlüssel  R B Y Türen  s Symbolfeld  S Symboltür  m Wandbild-Platz
  const TPL = {
    hebel: [[
      '###############',
      '#...1.#...#.*.#',
      '#.....#...w...#',
      '#.....#.3.#...#',
      '@.....u...#####',
      '#.....#...#...#',
      '#..2..#...v...E',
      '#.....#...#...#',
      '###############'], [
      '###############',
      '#.....#.....*.#',
      '#.1...u.3...#.#',
      '#.....#.....w.#',
      '@.....####v####',
      '#..2..#.......#',
      '#.....#.......E',
      '#.....#.......#',
      '###############']],
    stein: [[
      '###############',
      '#......#..*...#',
      '#.?.?..P......#',
      '#.?..?.########',
      '@..._..#......#',
      '#.?..?.#......#',
      '#..?=..Q......E',
      '#.?.?..#......#',
      '###############'], [
      '###############',
      '#..?...#......#',
      '#.?.?._#......#',
      '#..?...P......#',
      '@.?..?.#......#',
      '#.....?#####Q##',
      '#.?.?...=...#*E',
      '#...?.......#.#',
      '###############']],
    schluessel: [[
      '###############',
      '#....#....#*..#',
      '#.k..#.?..Y...#',
      '#....#....#...#',
      '@....R.?.?#####',
      '#....#.?..#...#',
      '#.k..#..k.B...E',
      '#....#.?..#...#',
      '###############'], [
      '###############',
      '#.....#.?.k...#',
      '#.k...#.?.?...#',
      '#.....R...?...#',
      '@.....#..######',
      '#.k...#..Y.*..#',
      '#.....#..######',
      '#.....#...B...E',
      '###############']],
    symbol: [[
      '#m#m###m#######',
      '#.....#.......#',
      '#.s.s.#...1...#',
      'm.....#.......#',
      '@.....S.......#',
      '#.....#.##u##v#',
      '#.s.s.#.#.*.#.E',
      '#.....#.#...#.#',
      '#m##m##########'], [
      '#m##m##########',
      '#.....#...#.*.#',
      'm.s...#...#...#',
      '#...s.#...##u##',
      '@.....S...1...#',
      '#.s...#.......#',
      'm...s.#####v###',
      '#.....#.......E',
      '#m#m###########']],
    mix: [[
      '###############',
      '#......#.....*#',
      '#.1....u..?...#',
      '#......#.?.?..#',
      '@..?.?.#..._..#',
      '#.....?####P###',
      '#..2...v......E',
      '#......#......#',
      '###############'], [
      '###############',
      '#.....#...#...#',
      '#..?..u.?.P.*.#',
      '#.?.?.#.?.#...#',
      '@..1..#._.#####',
      '#.?.?.#...#...#',
      '#.....v...w...E',
      '#..2..#...#...#',
      '###############']]
  };
  const ORDER_LONG = ['hebel', 'stein', 'schluessel', 'symbol', 'mix'];

  // ---------- Regeln (rein, auch für Löser/Bot/Wegfindung)
  function gateOpen(R, s, g) { let p = R.gInit[g]; for (let l = 0; l < R.nLev; l++) if ((s.lv >> l & 1) && (R.lMask[l] >> g & 1)) p ^= 1; return !!p; }
  function plateCovered(s, i) { return s.p === i || s.st.indexOf(i) >= 0; }
  function pgOpen(R, s, grp) { const pl = R.plates[grp]; if (!pl || !pl.length) return false; for (const i of pl) if (!plateCovered(s, i)) return false; return true; }
  function passable(R, s, i, forStone) {
    const t = R.tile[i];
    if (t === WALL || t === MURAL || t === LEVER) return false;
    if (t === GATE) return gateOpen(R, s, R.arg[i]) && !forStone;
    if (t === PGATE) return pgOpen(R, s, R.arg[i]) && !forStone;
    if (t === DOOR) return !!(s.doors >> R.arg[i] & 1) && !forStone;
    if (t === SDOOR) return s.sym >= R.seq.length && !forStone;
    if (forStone) { if (t !== FLOOR && t !== PLATE) return false; if (R.keyAt[i] >= 0 && !(s.taken >> R.keyAt[i] & 1)) return false; if (i === R.starAt && !s.star) return false; }
    return true;
  }
  function clone(s) { return { p: s.p, st: s.st.slice(), lv: s.lv, held: s.held, taken: s.taken, doors: s.doors, sym: s.sym, star: s.star }; }
  function keyOf(s) { let a = s.p; const ss = s.st.length > 1 ? s.st.slice().sort((x, y) => x - y) : s.st; for (const v of ss) a = a * 136 + v + 1; return ((((a * 8 + s.lv) * 8 + s.held) * 8 + s.taken) * 8 + s.doors) * 8 * 2 + s.sym * 2 + s.star; }
  function solidAt(R, x, y) { if (x < 0 || y < 0 || x >= RW || y >= RH) return true; const t = R.tile[y * RW + x]; return t === WALL || t === MURAL || t === LEVER; }
  function dead(R, s) { // Steine in Ecken (nicht auf Platten) – reichen die übrigen noch für alle Platten?
    const np = R.plates[0].length + R.plates[1].length; if (!np) return false; let free = 0;
    for (const i of s.st) { const x = i % RW, y = (i / RW) | 0; if (R.tile[i] === PLATE || !((solidAt(R, x - 1, y) || solidAt(R, x + 1, y)) && (solidAt(R, x, y - 1) || solidAt(R, x, y + 1)))) free++; }
    return free < np;
  }
  // Ein Schritt: liefert {s, kind} oder null (blockiert)
  function step(R, s, dx, dy) {
    const x = s.p % RW, y = (s.p / RW) | 0, nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= RW || ny >= RH) return null;
    const ni = ny * RW + nx, t = R.tile[ni];
    if (t === LEVER) { const ns = clone(s); ns.lv ^= 1 << R.arg[ni]; return { s: ns, kind: 'lever', at: ni }; }
    if (t === DOOR && !(s.doors >> R.arg[ni] & 1)) { const c = R.arg[ni]; if (s.held >> c & 1) { const ns = clone(s); ns.held &= ~(1 << c); ns.doors |= 1 << c; return { s: ns, kind: 'door', at: ni }; } return null; }
    if (!passable(R, s, ni, false)) return null;
    const ns = clone(s); let kind = 'move';
    const si = s.st.indexOf(ni);
    if (si >= 0) { const bx = nx + dx, by = ny + dy; if (bx < 0 || by < 0 || bx >= RW || by >= RH) return null; const bi = by * RW + bx; if (s.st.indexOf(bi) >= 0 || !passable(R, s, bi, true)) return null; ns.st[si] = bi; kind = 'push'; }
    ns.p = ni;
    const k = R.keyAt[ni]; if (k >= 0 && !(ns.taken >> k & 1)) { ns.taken |= 1 << k; ns.held |= 1 << k; kind = kind === 'push' ? kind : 'key'; }
    if (ni === R.starAt && !ns.star) { ns.star = 1; kind = 'star'; }
    if (t === SYM && ns.sym < R.seq.length) { const a = R.arg[ni]; if (R.seq[ns.sym] === a) { ns.sym++; kind = ns.sym >= R.seq.length ? 'symdone' : 'symok'; } else { ns.sym = R.seq[0] === a ? 1 : 0; kind = 'symbad'; } }
    if (t === EXIT) kind = 'exit';
    return { s: ns, kind };
  }
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  // Breitensuche: Weg zu Stern (falls needStar) und Ausgang. Liefert Liste von Richtungsindizes oder null.
  function solve(R, s0, needStar, limit) {
    const q = [s0], seen = new Map(); seen.set(keyOf(s0), null); let h = 0; limit = limit || 250000;
    while (h < q.length && seen.size < limit) {
      const s = q[h++], ks = keyOf(s);
      for (let d = 0; d < 4; d++) {
        const r = step(R, s, DIRS[d][0], DIRS[d][1]); if (!r || r.kind === 'symbad') continue;
        if (r.kind === 'exit') { if (needStar && !r.s.star) continue; const path = [d]; let k = ks; while (seen.get(k)) { const e = seen.get(k); path.push(e.d); k = e.k; } return path.reverse(); }
        if (r.kind === 'push' && dead(R, r.s)) continue;
        const kn = keyOf(r.s); if (seen.has(kn)) continue; seen.set(kn, { k: ks, d }); q.push(r.s);
      }
    }
    return null;
  }
  // einfache Wegfindung fürs Antippen (ohne Schieben/Hebel/Symbolfelder außer am Ziel)
  function pathTo(R, s, target) {
    const prev = new Int16Array(RW * RH).fill(-1), q = [s.p]; prev[s.p] = s.p; let found = -1;
    const tt = R.tile[target], solid = tt === LEVER || (tt === DOOR && !(s.doors >> R.arg[target] & 1)) || s.st.indexOf(target) >= 0;
    while (q.length) {
      const i = q.shift(); if (i === target) { found = i; break; }
      if (solid && Math.abs(i % RW - target % RW) + Math.abs(((i / RW) | 0) - ((target / RW) | 0)) === 1) { found = i; break; }
      for (const [dx, dy] of DIRS) { const x = i % RW + dx, y = ((i / RW) | 0) + dy; if (x < 0 || y < 0 || x >= RW || y >= RH) continue; const j = y * RW + x; if (prev[j] >= 0) continue; if (!passable(R, s, j, false) || s.st.indexOf(j) >= 0) continue; if (R.tile[j] === SYM && j !== target) continue; prev[j] = i; q.push(j); }
    }
    if (found < 0) return null; const path = []; let i = found; while (i !== s.p) { const p = prev[i]; path.push(i - p === 1 ? 0 : i - p === -1 ? 1 : i - p === RW ? 2 : 3); i = p; }
    path.reverse(); if (solid && found !== target) { const d = target - found; path.push(d === 1 ? 0 : d === -1 ? 1 : d === RW ? 2 : 3); }
    return path;
  }

  // ---------- Raum erzeugen (Vorlage + Zufall, Lösbarkeit geprüft)
  function shuffle(a, rnd) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function build(type, rnd, diff) {
    const tpls = TPL[type];
    for (let tries = 0; tries < 60; tries++) {
      let rows = tpls[Math.floor(rnd() * tpls.length)].slice(); if (rnd() < .5) rows = rows.slice().reverse();
      const R = { type, tile: new Uint8Array(RW * RH), arg: new Int8Array(RW * RH), keyAt: new Int8Array(RW * RH).fill(-1), starAt: -1, start: 0, exit: 0, plates: [[], []], nLev: 0, gInit: [0, 0, 0], lMask: [0, 0, 0], seq: [], murals: [], symA: [], stones: [] };
      const cand = [], keySpots = [], symSpots = [], muralSpots = [];
      const keyColors = shuffle([0, 1, 2], rnd);
      for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) {
        const ch = rows[y][x], i = y * RW + x; let t = FLOOR, a = 0;
        switch (ch) {
          case '#': t = WALL; break; case '@': R.start = i; break; case 'E': t = EXIT; R.exit = i; break; case '*': R.starAt = i; break;
          case '1': case '2': case '3': t = LEVER; a = +ch - 1; R.nLev = Math.max(R.nLev, a + 1); break;
          case 'u': case 'v': case 'w': t = GATE; a = 'uvw'.indexOf(ch); break;
          case 'o': R.stones.push(i); break; case '?': cand.push(i); break;
          case '_': t = PLATE; a = 0; R.plates[0].push(i); break; case '=': t = PLATE; a = 1; R.plates[1].push(i); break;
          case 'P': t = PGATE; a = 0; break; case 'Q': t = PGATE; a = 1; break;
          case 'k': keySpots.push(i); break;
          case 'R': t = DOOR; a = 0; break; case 'B': t = DOOR; a = 1; break; case 'Y': t = DOOR; a = 2; break;
          case 's': t = SYM; symSpots.push(i); break; case 'S': t = SDOOR; break; case 'm': t = WALL; muralSpots.push(i); break;
        }
        R.tile[i] = t; R.arg[i] = a;
      }
      // Türfarben zufällig vertauschen (Türen R/B/Y → Farben), Schlüssel an Plätze passend zur Logik der Vorlage
      for (let i = 0; i < RW * RH; i++) if (R.tile[i] === DOOR) R.arg[i] = keyColors[R.arg[i]];
      if (keySpots.length) { // Vorlage: Schlüsselplätze werden zufällig den drei Farben zugeordnet → Lösbarkeit prüft die Suche
        const cols = shuffle([0, 1, 2], rnd); keySpots.forEach((i, n) => { R.keyAt[i] = cols[n % 3]; });
      }
      // Hebel-Wechselwirkungen
      if (R.nLev) { for (let l = 0; l < R.nLev; l++) { let m = 0; while (!m) m = Math.floor(rnd() * 8); if (diff < .3 && rnd() < .6) m = 1 << Math.floor(rnd() * 3); R.lMask[l] = m; } for (let g = 0; g < 3; g++) R.gInit[g] = rnd() < .35 ? 1 : 0; }
      // Steine aus Kandidaten
      if (cand.length) { const n = R.plates[0].length + R.plates[1].length + (type === 'schluessel' ? 1 : 0); shuffle(cand, rnd); R.stones = cand.slice(0, Math.max(1, n)); }
      // Symbolrätsel
      if (symSpots.length) {
        const an = shuffle(ANIMALS.map((a, i) => i), rnd).slice(0, symSpots.length); symSpots.forEach((i, n) => { R.arg[i] = an[n]; });
        const len = diff < .3 ? 3 : 4; R.seq = shuffle(an.slice(), rnd).slice(0, len);
        shuffle(muralSpots, rnd); R.murals = R.seq.map((a, n) => ({ i: muralSpots[n], a, n: n + 1 }));
        muralSpots.slice(R.seq.length).forEach(i => R.murals.push({ i, a: -1, n: 0 }));
        R.murals.forEach(m => { R.tile[m.i] = MURAL; });
      }
      const s0 = { p: R.start, st: R.stones.slice(), lv: 0, held: 0, taken: 0, doors: 0, sym: 0, star: 0 };
      const sol = solve(R, s0, true, 60000); if (!sol) continue;
      // nicht zu trivial: es muss wirklich gerätselt werden
      let acts = 0, ss = s0; for (const d of sol) { const r = step(R, ss, DIRS[d][0], DIRS[d][1]); if (r.kind === 'lever' || r.kind === 'push' || r.kind === 'door') acts++; ss = r.s; }
      if (type !== 'symbol' && acts < (type === 'hebel' ? 2 : 3)) continue;
      R.s0 = s0; R.solLen = sol.length; R.tries = tries; return R;
    }
    return null;
  }

  T.def({
    id: 'labyrinth', name: 'Das Rätsel-Labyrinth', kind: 'Kopf', stat: 'kopf', e: '🧩', mode: '2d',
    desc: 'Ein uralter Tempel (aus Pappmaché, aber psst!). Jeder Raum ist ein Rätsel: Hebel schalten Tore um, farbige Schlüssel öffnen Türen, Steine gehören auf Druckplatten, und die Symboltür will die Tierfolge von den Wandbildern. In jedem Raum wartet ein Stern, der letzte am Ausgang.',
    how: { pc: '<b>WASD/Pfeile</b> gehen · gegen Hebel/Türen laufen = benutzen · Steine schieben durch Hineinlaufen · <b>Klick</b> auf ein Feld = hinlaufen · <b>Q</b> Raum neu starten', touch: '<b>Wischen &amp; halten</b> = gehen (Joystick) · <b>Tippen</b> auf ein Feld = hinlaufen · Taste <b>Neu</b> startet den Raum neu, falls ein Stein feststeckt' },
    controls: false,
    create(ctx) {
      const I = ctx.I, d = ctx.diff, S = ctx.S;
      const seed = Math.floor(Math.random() * 1e9); let sd = seed; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
      const nRooms = clamp(ctx.max - 1, 2, 5);
      let types = ctx.short || nRooms < 5 ? shuffle(['hebel', 'stein', 'schluessel', 'symbol', 'mix'], rnd).slice(0, nRooms) : ORDER_LONG.slice();
      if (!ctx.short && nRooms < 5) types = ORDER_LONG.filter(t => types.includes(t));
      const rooms = types.map(t => build(t, rnd, d) || build('hebel', rnd, 0));
      const limit = Math.round(nRooms * (ctx.short ? 20 : 33 - d * 7));
      const pad = mkPad(ctx, [{ id: 'alt', label: '↺ Neu' }]);
      const TORCH = [];
      let ri = 0, R = rooms[0], st = clone(R.s0), stars = 0, time = 0, over = false, fade = 0, fadeDir = 0;
      let moveT = 0, from = st.p, anim = { x: 0, y: 0 }, face = 0, walkPh = 0, needRelease = false, path = null, moves = 0, wrong = 0, resets = 0, msgT = 0;
      const stepDur = .15 - d * .02;
      // Darstellung
      let W = ctx.W, H = ctx.H, ts = 30, ox = 0, oy = 0, trans = false, bg = null, topY = 92;
      const gateAnim = new Float32Array(RW * RH), stoneAnim = [], crit = [], dust = [];
      function sgx(i) { return i % RW; } function sgy(i) { return (i / RW) | 0; }
      // Kanon → Bildschirm (im Hochformat transponiert)
      function scr(cx, cy) { return trans ? [ox + cy * ts, oy + cx * ts] : [ox + cx * ts, oy + cy * ts]; }
      function layout() {
        W = ctx.W; H = ctx.H; topY = hudBottom(); trans = H > W * 1.05; const cols = trans ? RH : RW, rows = trans ? RW : RH;
        const botPad = ctx.I.touch ? (trans ? 110 : 18) : 16, sidePad = ctx.I.touch && !trans ? 100 : 12;
        ts = Math.floor(Math.min((W - sidePad * 2) / cols, (H - topY - botPad) / rows)); ts = Math.max(14, ts);
        ox = Math.round((W - cols * ts) / 2); oy = Math.round(topY + (H - topY - botPad - rows * ts) / 2);
        pad.layout(W, H); bg = render();
      }
      function resetAnims() { for (let i = 0; i < RW * RH; i++) gateAnim[i] = isOpenTile(i) ? 1 : 0; stoneAnim.length = 0; st.st.forEach(i => stoneAnim.push({ x: sgx(i), y: sgy(i) })); anim.x = sgx(st.p); anim.y = sgy(st.p); from = st.p; moveT = 0; path = null; }
      function isOpenTile(i) { const t = R.tile[i]; if (t === GATE) return gateOpen(R, st, R.arg[i]) || st.p === i; if (t === PGATE) return pgOpen(R, st, R.arg[i]) || st.p === i; if (t === DOOR) return !!(st.doors >> R.arg[i] & 1); if (t === SDOOR) return st.sym >= R.seq.length; return true; }
      function enterRoom(i) {
        ri = i; R = rooms[i]; st = clone(R.s0); resetAnims(); needRelease = true;
        crit.length = 0; for (let k = 0; k < 3; k++) { const fl = []; for (let j = 0; j < RW * RH; j++) if (R.tile[j] === FLOOR && j !== R.start) fl.push(j); const j = fl[Math.floor(rnd() * fl.length)]; crit.push({ x: sgx(j) + .5, y: sgy(j) + .5, a: rnd() * TAU, t: rnd() * 5, k: k % 2 }); }
        torches(); ctx.hud.part(`Raum ${i + 1} / ${nRooms}`); ctx.hud.hint(HINT[R.type]); layout();
      }
      const HINT = { hebel: 'Hebel schalten mehrere Tore um – erst denken, dann ziehen!', stein: 'Schieb die Steine auf die Druckplatten.', schluessel: 'Jeder Schlüssel passt nur in seine Farbe – und wird verbraucht.', symbol: 'Lies die Wandbilder: Tritt die Tiere in der richtigen Reihenfolge.', mix: 'Hebel UND Steine – das große Tempelrätsel!' };

      // ---- Hintergrund vorrendern
      function render() {
        const cv = document.createElement('canvas'), dpr = ctx.dpr || 1; cv.width = Math.ceil(W * dpr); cv.height = Math.ceil(H * dpr); const c = cv.getContext('2d'); c.scale(dpr, dpr);
        let s2 = 99 + ri * 31; const r = () => (s2 = (s2 * 16807) % 2147483647) / 2147483647;
        const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1b1410'); g.addColorStop(1, '#0b0806'); c.fillStyle = g; c.fillRect(0, 0, W, H);
        // Dschungel-Blätter am Rand
        for (let k = 0; k < 40; k++) { const side = k % 4, x = side === 0 ? r() * W * .15 : side === 1 ? W - r() * W * .15 : r() * W, y = side < 2 ? r() * H : side === 2 ? r() * 60 + topY - 40 : H - r() * 40; c.save(); c.translate(x, y); c.rotate(r() * TAU); c.fillStyle = `hsla(${110 + r() * 40},50%,${12 + r() * 14}%,.8)`; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(30, -14, 70, 0); c.quadraticCurveTo(30, 14, 0, 0); c.fill(); c.restore(); }
        // Raumschatten
        const cols = trans ? RH : RW, rows = trans ? RW : RH; c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(ox - 6, oy + 4, cols * ts + 14, rows * ts + 10);
        for (let i = 0; i < RW * RH; i++) {
          const [x, y] = scr(sgx(i), sgy(i)), t = R.tile[i];
          if (t === WALL || t === MURAL || t === LEVER) continue;
          const v = r(); c.fillStyle = `hsl(${34 + v * 8},${30 + v * 10}%,${36 + v * 8}%)`; c.fillRect(x, y, ts, ts);
          const fg = c.createLinearGradient(x, y, x + ts, y + ts); fg.addColorStop(0, 'rgba(255,240,200,.12)'); fg.addColorStop(1, 'rgba(0,0,0,.15)'); c.fillStyle = fg; c.fillRect(x, y, ts, ts);
          c.strokeStyle = 'rgba(40,25,10,.55)'; c.lineWidth = 1; c.strokeRect(x + .5, y + .5, ts - 1, ts - 1);
          if (r() < .25) { c.strokeStyle = 'rgba(40,25,10,.5)'; c.beginPath(); c.moveTo(x + r() * ts, y + r() * ts); c.lineTo(x + r() * ts, y + r() * ts); c.lineTo(x + r() * ts, y + r() * ts); c.stroke(); }
          if (r() < .18) { c.fillStyle = 'rgba(70,120,40,.35)'; c.beginPath(); c.ellipse(x + r() * ts, y + r() * ts, ts * .25, ts * .15, r() * 3, 0, TAU); c.fill(); }
          if (t === PLATE) { c.fillStyle = '#5a4a3a'; D.rr(c, x + ts * .12, y + ts * .12, ts * .76, ts * .76, ts * .12); c.fill(); c.strokeStyle = R.arg[i] ? '#7ad0ff' : '#ffb347'; c.lineWidth = 2; c.stroke(); c.fillStyle = R.arg[i] ? 'rgba(122,208,255,.35)' : 'rgba(255,179,71,.35)'; c.beginPath(); c.arc(x + ts / 2, y + ts / 2, ts * .14, 0, TAU); c.fill(); }
          if (t === EXIT) { for (let k = 0; k < 4; k++) { c.fillStyle = `rgb(${60 - k * 12},${45 - k * 9},${30 - k * 6})`; const f = k / 4; c.fillRect(x + ts * f * .3, y + ts * f * .3, ts * (1 - f * .6), ts * (1 - f * .6)); } }
          if (t === SYM) { c.fillStyle = '#3d3326'; D.rr(c, x + 2, y + 2, ts - 4, ts - 4, 4); c.fill(); c.font = `${ts * .58}px ${EMO}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.globalAlpha = .9; c.fillText(ANIMALS[R.arg[i]].e, x + ts / 2, y + ts / 2 + 1); c.globalAlpha = 1; }
        }
        // Schatten der Wände auf den Boden
        for (let i = 0; i < RW * RH; i++) { const t = R.tile[i]; if (t !== WALL && t !== MURAL && t !== LEVER) continue; const [x, y] = scr(sgx(i), sgy(i)); c.fillStyle = 'rgba(0,0,0,.32)'; c.fillRect(x + ts * .18, y + ts * .18, ts, ts); }
        for (let i = 0; i < RW * RH; i++) {
          const t = R.tile[i]; if (t !== WALL && t !== MURAL && t !== LEVER) continue; const [x, y] = scr(sgx(i), sgy(i));
          if (t === LEVER) { // Sockel
            const v = r(); c.fillStyle = `hsl(${34 + v * 8},30%,38%)`; c.fillRect(x, y, ts, ts); c.fillStyle = '#4a3c30'; D.rr(c, x + ts * .15, y + ts * .15, ts * .7, ts * .7, ts * .15); c.fill(); continue;
          }
          const v = r(); const wg = c.createLinearGradient(x, y, x, y + ts); wg.addColorStop(0, `hsl(${28 + v * 10},14%,${30 + v * 6}%)`); wg.addColorStop(1, `hsl(${28 + v * 10},16%,${18 + v * 4}%)`); c.fillStyle = wg; c.fillRect(x, y, ts, ts);
          c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y + ts / 2); c.lineTo(x + ts, y + ts / 2); const o = (sgy(i) % 2) * ts / 2; c.moveTo(x + ts / 2 + o / 2, y); c.lineTo(x + ts / 2 + o / 2, y + ts / 2); c.moveTo(x + o / 2 + ts * .1, y + ts / 2); c.lineTo(x + o / 2 + ts * .1, y + ts); c.stroke();
          c.fillStyle = 'rgba(255,240,210,.12)'; c.fillRect(x, y, ts, 2); c.fillRect(x, y, 2, ts);
          if (t === WALL && r() < .14) { c.strokeStyle = '#2f6b2a'; c.lineWidth = 2; c.beginPath(); const vx = x + r() * ts; c.moveTo(vx, y); c.quadraticCurveTo(vx + 6, y + ts * .5, vx - 2, y + ts * .9); c.stroke(); c.fillStyle = '#3f8f35'; c.beginPath(); c.ellipse(vx + 2, y + ts * .5, 3, 2, .6, 0, TAU); c.fill(); }
          if (t === MURAL) {
            const m = R.murals.find(m => m.i === i); c.fillStyle = '#c99a5b'; D.rr(c, x + 2, y + 2, ts - 4, ts - 4, 3); c.fill(); c.strokeStyle = '#6a4520'; c.lineWidth = 2; c.stroke();
            if (m && m.a >= 0) { c.font = `${ts * .5}px ${EMO}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ANIMALS[m.a].e, x + ts / 2, y + ts * .42); c.fillStyle = '#5a2a10'; for (let k = 0; k < m.n; k++) { c.beginPath(); c.arc(x + ts / 2 + (k - (m.n - 1) / 2) * ts * .16, y + ts * .82, ts * .055, 0, TAU); c.fill(); } }
            else { c.strokeStyle = '#6a4520'; c.lineWidth = 1.5; c.beginPath(); c.arc(x + ts / 2, y + ts / 2, ts * .22, 0, TAU); c.moveTo(x + ts * .3, y + ts * .5); c.lineTo(x + ts * .7, y + ts * .5); c.stroke(); }
          }
        }
        const vg = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.max(W, H) * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
        return cv;
      }

      // ---- Aktionen
      function doStep(dir) {
        const r = step(R, st, DIRS[dir][0], DIRS[dir][1]); face = dir;
        if (!r) { const [dx, dy] = DIRS[dir], ni = (sgy(st.p) + dy) * RW + sgx(st.p) + dx; if (R.tile[ni] === DOOR && !needRelease) { ctx.hud.toast(`🔒 Schlüssel (${KEYNAME[R.arg[ni]]}) fehlt`, 'bad'); S.thud(); } else if (R.tile[ni] === SDOOR && !needRelease) { ctx.hud.toast('🔒 Die Tiere in der richtigen Folge betreten!', 'bad'); } needRelease = true; return false; }
        moves++;
        const prevSt = st.st.slice(); from = st.p; st = r.s;
        if (r.kind === 'lever') { S.click(); S.thud(); needRelease = true; path = path && path.length ? path : null; return true; }
        if (r.kind === 'door') { S.reveal(); ctx.hud.toast('🔓 Tür auf!', 'good'); needRelease = true; return true; }
        moveT = stepDur;
        if (r.kind === 'push') { const k = prevSt.findIndex((v, n) => v !== st.st[n]); if (k >= 0) { stoneAnim[k].tx = sgx(st.st[k]); stoneAnim[k].ty = sgy(st.st[k]); } S.thud(); }
        if (r.kind === 'key') { S.pad(2); ctx.hud.toast('🗝️ Schlüssel eingesteckt', 'good'); }
        if (r.kind === 'star') { stars++; ctx.hud.stars(stars); ctx.hud.toast('★ Tempelstern!', 'good'); }
        if (r.kind === 'symok') S.pad(st.sym % 4);
        if (r.kind === 'symdone') { S.reveal(); ctx.hud.toast('🗿 Die Symboltür knirscht auf!', 'good'); }
        if (r.kind === 'symbad') { wrong++; time += 3; S.bad(); ctx.hud.toast('✖ Falsches Tier! −3 s – von vorn', 'bad'); path = null; }
        if (r.kind === 'exit') { fadeDir = 1; fade = 0; S.reveal(); }
        return true;
      }
      function restartRoom() { const keepStar = st.star; st = clone(R.s0); st.star = keepStar; resets++; resetAnims(); ctx.hud.toast('↺ Raum zurückgesetzt'); S.click(); }
      function dirFromMove(m) { let dx = 0, dy = 0; if (Math.abs(m.x) > Math.abs(m.y)) { if (Math.abs(m.x) > .45) dx = Math.sign(m.x); } else if (Math.abs(m.y) > .45) dy = -Math.sign(m.y); if (!dx && !dy) return -1; if (trans) { const t = dx; dx = dy; dy = t; } return dx === 1 ? 0 : dx === -1 ? 1 : dy === 1 ? 2 : 3; }
      function screenToTile(x, y) { let cx = Math.floor((x - ox) / ts), cy = Math.floor((y - oy) / ts); if (trans) { const t = cx; cx = cy; cy = t; } if (cx < 0 || cy < 0 || cx >= RW || cy >= RH) return -1; return cy * RW + cx; }

      enterRoom(0); ctx.hud.stars(0);
      const api = {
        resize() { layout(); },
        pointer(type, x, y, id) { pad.pointer(type, x, y, id); if (type === 'up' && pad.tap) { const p = pad.tap; pad.tap = null; const i = screenToTile(p.x, p.y); if (i >= 0 && !over && !fadeDir) { const pp = pathTo(R, st, i); if (pp && pp.length) path = pp; else if (i !== st.p) ctx.hud.toast('Da komme ich (noch) nicht hin.'); } } },
        idle(dt) { anim.x = sgx(st.p); anim.y = sgy(st.p); crit.forEach(k => { k.t += dt; }); },
        update(dt) {
          pad.tick(dt); msgT += dt; if (msgT > .5) { msgT = 0; const tb = hudBottom(); if (Math.abs(tb - topY) > 3) layout(); }
          if (over) return; time += dt; const left = limit - time; ctx.hud.time(left, left / limit);
          if (left <= 0) { over = true; ctx.finish(stars, 'time'); return; }
          if (fadeDir) { fade += dt * 2.6; if (fade >= 1 && fadeDir === 1) { if (ri >= nRooms - 1) { stars++; ctx.hud.stars(stars); over = true; ctx.hud.toast('🏆 Ausgang gefunden!', 'good'); ctx.finish(stars, 'done'); return; } enterRoom(ri + 1); fadeDir = -1; fade = 1; } if (fadeDir === -1) { fade -= dt * 5.2; if (fade <= 0) { fade = 0; fadeDir = 0; } } return; }
          if (pad.pressed('alt')) restartRoom();
          // Bewegung
          if (moveT > 0) { moveT -= dt; walkPh += dt * 14; }
          const k = 1 - Math.pow(.0005, dt); anim.x = lerp(anim.x, sgx(st.p), Math.min(1, dt / Math.max(.01, stepDur) * 1.2)); anim.y = lerp(anim.y, sgy(st.p), Math.min(1, dt / Math.max(.01, stepDur) * 1.2));
          stoneAnim.forEach((s, n) => { s.x = lerp(s.x, sgx(st.st[n]), Math.min(1, dt / stepDur * 1.2)); s.y = lerp(s.y, sgy(st.st[n]), Math.min(1, dt / stepDur * 1.2)); });
          for (let i = 0; i < RW * RH; i++) { const o = isOpenTile(i) ? 1 : 0; gateAnim[i] += (o - gateAnim[i]) * Math.min(1, dt * 8); }
          crit.forEach(c => { c.t += dt; c.a += Math.sin(c.t * .7 + c.k) * dt * 2; const sp = c.k ? .6 : .35, nx = c.x + Math.cos(c.a) * sp * dt, ny = c.y + Math.sin(c.a) * sp * dt, ti = Math.floor(ny) * RW + Math.floor(nx); if (nx > 0 && ny > 0 && nx < RW && ny < RH && R.tile[ti] === FLOOR) { c.x = nx; c.y = ny; } else c.a += Math.PI * .7; });
          if (moveT > 0) return;
          const m = pad.move(), dir = dirFromMove(m);
          if (dir < 0) needRelease = false;
          if (dir >= 0) { path = null; if (!needRelease || dir !== face) { needRelease = false; doStep(dir); } }
          else if (path && path.length) { const pd = path.shift(); if (!doStep(pd)) path = null; }
        },
        draw(c) {
          c.drawImage(bg, 0, 0, W, H); const t = time;
          const P = (cx, cy) => scr(cx, cy);
          // dynamische Kacheln
          for (let i = 0; i < RW * RH; i++) {
            const tt = R.tile[i]; if (tt === FLOOR || tt === WALL || tt === MURAL || tt === EXIT || tt === SYM) { if (tt === SYM) { const ok = R.seq.slice(0, st.sym).indexOf(R.arg[i]) >= 0; if (ok) { const [x, y] = P(sgx(i), sgy(i)); c.save(); c.shadowColor = '#9dff5c'; c.shadowBlur = 12; c.strokeStyle = '#9dff5c'; c.lineWidth = 3; D.rr(c, x + 3, y + 3, ts - 6, ts - 6, 4); c.stroke(); c.restore(); } } if (tt === EXIT) { const [x, y] = P(sgx(i), sgy(i)); c.save(); c.globalAlpha = .35 + Math.sin(t * 3) * .15; const g = c.createRadialGradient(x + ts / 2, y + ts / 2, 2, x + ts / 2, y + ts / 2, ts); g.addColorStop(0, '#ffe27a'); g.addColorStop(1, 'rgba(255,200,60,0)'); c.fillStyle = g; c.fillRect(x - ts / 2, y - ts / 2, ts * 2, ts * 2); c.restore(); } continue; }
            const [x, y] = P(sgx(i), sgy(i)), o = gateAnim[i];
            if (tt === PLATE) { if (plateCovered(st, i)) { c.fillStyle = 'rgba(157,255,92,.4)'; c.fillRect(x + ts * .12, y + ts * .12, ts * .76, ts * .76); } continue; }
            if (tt === GATE || tt === PGATE || tt === SDOOR) {
              c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x, y, ts, ts);
              const col = tt === GATE ? ['#c9a24a', '#5fc0d0', '#d06aa0'][R.arg[i]] : tt === PGATE ? (R.arg[i] ? '#7ad0ff' : '#ffb347') : '#b07ad0';
              const h = ts * (1 - o); if (h > 1) { c.fillStyle = '#2a2a2e'; c.fillRect(x + 2, y, ts - 4, h); c.fillStyle = '#6a6a74'; for (let k = 0; k < 4; k++) c.fillRect(x + 3 + k * (ts - 6) / 3.4, y, 3, h); c.fillStyle = col; c.fillRect(x + 2, y + h - 4, ts - 4, 4); }
              c.fillStyle = col; c.fillRect(x, y, 3, ts); c.fillRect(x + ts - 3, y, 3, ts);
              if (tt === SDOOR && h > 4) { c.font = `${ts * .5}px ${EMO}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🗿', x + ts / 2, y + h / 2); }
              continue;
            }
            if (tt === DOOR) { if (o < .98) { c.save(); c.globalAlpha = 1 - o; c.fillStyle = '#6a3e1c'; D.rr(c, x + 1, y + 1, ts - 2, ts - 2, 3); c.fill(); c.strokeStyle = '#3a200c'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + ts / 3, y + 2); c.lineTo(x + ts / 3, y + ts - 2); c.moveTo(x + ts * 2 / 3, y + 2); c.lineTo(x + ts * 2 / 3, y + ts - 2); c.stroke(); c.fillStyle = KEYCOL[R.arg[i]]; c.beginPath(); c.arc(x + ts / 2, y + ts / 2, ts * .2, 0, TAU); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(x + ts / 2, y + ts / 2 - 2, ts * .06, 0, TAU); c.fill(); c.fillRect(x + ts / 2 - 1.5, y + ts / 2 - 2, 3, ts * .14); c.restore(); } continue; }
            if (tt === LEVER) { const on = st.lv >> R.arg[i] & 1, cx = x + ts / 2, cy = y + ts / 2; c.save(); c.translate(cx, cy); c.rotate(on ? .7 : -.7); c.strokeStyle = '#3a2a1a'; c.lineWidth = Math.max(3, ts * .14); c.lineCap = 'round'; c.beginPath(); c.moveTo(0, ts * .12); c.lineTo(0, -ts * .32); c.stroke(); c.fillStyle = on ? '#9dff5c' : '#ff6b4a'; c.beginPath(); c.arc(0, -ts * .34, ts * .13, 0, TAU); c.fill(); c.restore(); D.text(c, String(R.arg[i] + 1), x + ts * .82, y + ts * .82, Math.max(9, ts * .3), '#ffe9b0'); continue; }
          }
          // Schlüssel & Stern
          for (let i = 0; i < RW * RH; i++) { const k = R.keyAt[i]; if (k >= 0 && !(st.taken >> k & 1)) { const [x, y] = P(sgx(i), sgy(i)); drawKey(c, x + ts / 2, y + ts / 2 + Math.sin(t * 3 + i) * 2, ts * .36, KEYCOL[k]); } }
          if (R.starAt >= 0 && !st.star) { const [x, y] = P(sgx(R.starAt), sgy(R.starAt)); c.save(); c.shadowColor = '#ffcf4a'; c.shadowBlur = 16; D.star(c, x + ts / 2, y + ts / 2 + Math.sin(t * 2.4) * 2, ts * .4, Math.sin(t * 2) * .3); c.restore(); }
          // Krabbeltiere (Deko)
          crit.forEach(k => { const [x, y] = P(k.x - .5, k.y - .5); drawBug(c, x + ts / 2, y + ts / 2, ts * .018, (trans ? Math.PI / 2 - k.a : k.a), k.t, k.k); });
          // Steine
          stoneAnim.forEach(s => { const [x, y] = P(s.x, s.y); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x + ts * .14, y + ts * .2, ts * .86, ts * .86); const g = c.createLinearGradient(x, y, x + ts, y + ts); g.addColorStop(0, '#a89a88'); g.addColorStop(1, '#5d5246'); c.fillStyle = g; D.rr(c, x + 2, y + 2, ts - 4, ts - 4, ts * .18); c.fill(); c.strokeStyle = 'rgba(40,30,20,.6)'; c.lineWidth = 1.5; c.beginPath(); c.arc(x + ts / 2, y + ts / 2, ts * .2, 0, TAU); c.moveTo(x + ts * .3, y + ts * .5); c.lineTo(x + ts * .7, y + ts * .5); c.stroke(); });
          // Spielfigur
          { const [x, y] = P(anim.x, anim.y), dv = DIRS[face], ang = trans ? Math.atan2(dv[0], dv[1]) : Math.atan2(dv[1], dv[0]); drawHero(c, x + ts / 2, y + ts / 2, ts, ang, moveT > 0 ? walkPh : 0, ctx.who); }
          // Fackeln
          for (const [tx, ty] of TORCH) { const [x, y] = P(tx, ty); const f = .8 + Math.sin(t * 13 + tx) * .1 + Math.sin(t * 7.3 + ty) * .1; const g = c.createRadialGradient(x + ts / 2, y + ts / 2, 1, x + ts / 2, y + ts / 2, ts * 2.2 * f); g.addColorStop(0, 'rgba(255,190,90,.35)'); g.addColorStop(1, 'rgba(255,160,60,0)'); c.fillStyle = g; c.fillRect(x - ts * 2, y - ts * 2, ts * 5, ts * 5); c.fillStyle = '#ffcf4a'; c.beginPath(); c.ellipse(x + ts / 2, y + ts * .45, ts * .12 * f, ts * .22 * f, 0, 0, TAU); c.fill(); c.fillStyle = '#ff7a2a'; c.beginPath(); c.ellipse(x + ts / 2, y + ts * .5, ts * .07, ts * .13 * f, 0, 0, TAU); c.fill(); }
          // Inventar
          let ix = 12, iy = H - 22; if (ctx.I.touch && trans) iy = H - 22; const inv = [0, 1, 2].filter(k => st.held >> k & 1);
          if (inv.length) { c.fillStyle = 'rgba(0,0,0,.5)'; D.rr(c, ix - 6, iy - 16, 30 * inv.length + 10, 32, 10); c.fill(); inv.forEach((k, n) => drawKey(c, ix + 12 + n * 30, iy, 11, KEYCOL[k])); }
          if (R.type === 'symbol' || (R.seq.length && st.sym < R.seq.length)) { const tx = W / 2, ty = H - 18; if (st.sym > 0) D.text(c, 'Folge: ' + R.seq.slice(0, st.sym).map(a => ANIMALS[a].e).join(' ') + ' …', tx, ty, 13, '#eaffd0'); }
          pad.draw(c);
          if (fade > 0) { c.fillStyle = `rgba(0,0,0,${clamp(fade, 0, 1)})`; c.fillRect(0, 0, W, H); }
        },
        debug: () => ({ room: ri, type: R.type, p: st.p, star: st.star, stars, time: +time.toFixed(1), limit, sol: R.solLen, trans, ts }),
        details: () => ({ fehltritte: wrong, neustarts: resets, raeume: ri + (over && stars ? 1 : 0) }),
        bot() {
          if (over || fadeDir || moveT > 0) return {};
          if (botLock) { botLock = false; return {}; } // kurz loslassen (Hebel-/Tür-Aktion braucht neue Eingabe)
          if (!botPlan || botAt !== keyOf(st)) { botPlan = solve(R, st, !st.star); if (!botPlan) { botPlan = null; botAt = ''; return { press: ['alt'] }; } }
          const dir = botPlan.shift(); const r = step(R, st, DIRS[dir][0], DIRS[dir][1]); botAt = r ? keyOf(r.s) : ''; botLock = true;
          let dx = DIRS[dir][0], dy = DIRS[dir][1]; if (trans) { const tt = dx; dx = dy; dy = tt; }
          return { move: { x: dx, y: -dy } };
        }
      };
      let botPlan = null, botAt = '', botLock = false;
      function torches() { TORCH.length = 0; const cand = []; for (let i = 0; i < RW * RH; i++) { if (R.tile[i] !== WALL) continue; const x = sgx(i), y = sgy(i); if (y < RH - 1 && R.tile[i + RW] === FLOOR && (x + y) % 3 === 0) cand.push([x, y]); } shuffle(cand, rnd); cand.slice(0, 4).forEach(p => TORCH.push(p)); }
      return api;
    }
  });
  function drawKey(c, x, y, s, col) { c.save(); c.translate(x, y); c.rotate(-.6); c.fillStyle = col; c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 1.2; c.beginPath(); c.arc(-s * .45, 0, s * .4, 0, TAU); c.fill(); c.stroke(); c.fillRect(-s * .1, -s * .12, s, s * .24); c.fillRect(s * .6, 0, s * .14, s * .36); c.fillRect(s * .3, 0, s * .14, s * .28); c.fillStyle = 'rgba(0,0,0,.5)'; c.beginPath(); c.arc(-s * .45, 0, s * .15, 0, TAU); c.fill(); c.restore(); }
  function drawBug(c, x, y, s, a, t, k) {
    c.save(); c.translate(x, y); c.rotate(a + Math.PI / 2); c.scale(s * 10, s * 10);
    if (k) { c.strokeStyle = '#1a1a1a'; c.lineWidth = .25; for (let i = 0; i < 3; i++) for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(0, (i - 1) * .5); c.lineTo(sd * 1.3, (i - 1) * .7 + Math.sin(t * 20 + i + sd) * .2); c.stroke(); } c.fillStyle = '#2d5a1e'; c.beginPath(); c.ellipse(0, .2, .6, .9, 0, 0, TAU); c.fill(); c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(0, -.8, .35, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(-.05, -.4, .1, 1.2); }
    else { c.fillStyle = '#7a3a1a'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(Math.sin(t * 6 + i * .9) * .25, i * .35 - .9, .3 - i * .02, 0, TAU); c.fill(); } c.fillStyle = '#ffd24a'; c.fillRect(-.15, -1.05, .1, .1); c.fillRect(.05, -1.05, .1, .1); }
    c.restore();
  }
  // Spielfigur von oben: Kopf, Schultern, Arme, Füße
  function drawHero(c, x, y, ts, ang, ph, who) {
    const skin = who.skin || '#e8b98f', hair = who.hair || '#3b2a1c', top = who.top || '#2a9d8f', s = ts / 30;
    c.save(); c.translate(x, y); c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(2 * s, 3 * s, 11 * s, 9 * s, 0, 0, TAU); c.fill();
    c.rotate(ang + Math.PI / 2); // Blickrichtung = lokale -y
    const sw = Math.sin(ph) * 4 * s;
    c.fillStyle = '#3a2a1a'; c.beginPath(); c.ellipse(-4 * s, sw, 2.6 * s, 3.6 * s, 0, 0, TAU); c.ellipse(4 * s, -sw, 2.6 * s, 3.6 * s, 0, 0, TAU); c.fill();
    c.fillStyle = skin; c.beginPath(); c.arc(-10 * s, -sw * .8, 2.8 * s, 0, TAU); c.arc(10 * s, sw * .8, 2.8 * s, 0, TAU); c.fill();
    const g = c.createLinearGradient(-9 * s, 0, 9 * s, 0); g.addColorStop(0, top); g.addColorStop(.5, lighten(top, .25)); g.addColorStop(1, top); c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, 9.5 * s, 6 * s, 0, 0, TAU); c.fill();
    c.fillStyle = skin; c.beginPath(); c.arc(0, -1 * s, 5.6 * s, 0, TAU); c.fill(); c.fillStyle = hair; c.beginPath(); c.arc(0, 0, 5.8 * s, Math.PI * .05, Math.PI * .95, false); c.fill(); c.beginPath(); c.arc(0, .6 * s, 5.4 * s, 0, Math.PI); c.fill();
    c.fillStyle = '#222'; c.beginPath(); c.arc(-2 * s, -4.4 * s, .9 * s, 0, TAU); c.arc(2 * s, -4.4 * s, .9 * s, 0, TAU); c.fill();
    c.restore();
  }
  function lighten(hex, a) { const n = parseInt(String(hex).slice(1), 16); if (isNaN(n)) return hex; const f = v => Math.round(v + (255 - v) * a); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; }
  // Testzugriff
  T.defs.labyrinth._test = { build, solve, step, TPL, keyOf };
})();
